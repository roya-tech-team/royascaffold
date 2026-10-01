"use strict";

// Evidence fingerprints and freshness (plan file 01 §4, E1.2).
//
// A fingerprint is a hash over what the evidence covered: the files owned by the components the change
// touches, the test files, the lockfile and the engine version. Evidence stores it. `status` computes
// it again; when it differs, the evidence is stale: the code or the tests changed after the check ran.
// Files are hashed by their content (not only their last commit), so an edit that is not committed yet
// also makes evidence stale. Evidence without a fingerprint (written by an older engine) never goes stale.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { listFiles } = require("./files.cjs");
const { patternList, matchesAny } = require("./glob.cjs");

const sha = (data) => crypto.createHash("sha256").update(data).digest("hex");

// Content hashes are cached per process, keyed by path, size and modification time.
const CACHE = new Map();
function hashFile(abs) {
  try {
    const st = fs.statSync(abs);
    const key = `${abs}|${st.size}|${st.mtimeMs}`;
    if (!CACHE.has(key)) CACHE.set(key, sha(fs.readFileSync(abs)));
    return CACHE.get(key);
  } catch {
    return "missing";
  }
}

// Component IDs a change touches: those its Impact table marks changed. With none named, every component.
function touchedComponents(model, change) {
  const all = [...model.records.values()].filter((r) => r.kind === "component");
  try {
    const K = require("./knowledge.cjs");
    const { changeBody } = require("./gates.cjs");
    const { findIds } = require("./parse/ids.cjs");
    const impact = K.impactOf(changeBody(model.root, change));
    const row = impact && impact.layers.get("components");
    const named = row && ["changed", "referenced"].includes(row.state) ? findIds(row.named).filter((id) => all.some((c) => c.id === id)) : [];
    if (named.length) return all.filter((c) => named.includes(c.id));
  } catch {
    // A change without a readable Impact covers every component.
  }
  return all;
}

// What a change's evidence covers: { files, tests, lockfiles } as repo-relative paths.
function coverage(model, change) {
  const runner = require("./runner.cjs");
  const policy = require("./adapters.cjs").policy(model);
  const projectRel = path.relative(model.repo, model.root).split(path.sep).join("/");
  const apps = runner.appsForChange(model, change);
  const exclude = patternList(model.profile.code_exclude);
  const inProject = (f) => projectRel && (f === projectRel || f.startsWith(`${projectRel}/`));
  const pool = new Set();
  for (const app of apps.length ? apps : runner.appsOf(model)) for (const f of listFiles(model.repo, app.path === "." ? "" : app.path)) pool.add(f);
  const comps = touchedComponents(model, change);
  const globs = comps.flatMap((c) => patternList(c.fields.Code));
  let files = [];
  if (globs.length) {
    for (const g of globs) {
      const b = g.split("/");
      const i = b.findIndex((x) => /[*?]/.test(x));
      const dir = (i < 0 ? b : b.slice(0, i)).join("/");
      const abs = path.join(model.repo, dir);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) pool.add(dir);
      else for (const f of listFiles(model.repo, dir)) pool.add(f);
    }
    files = [...pool].filter((f) => matchesAny(f, globs));
  }
  if (!files.length) files = [...pool]; // no component owns a file: the apps' own files
  files = files.filter((f) => !inProject(f) && !matchesAny(f, exclude));
  const testRes = ((policy.tests && policy.tests.files) || []).map((x) => new RegExp(x));
  const tests = [...pool].filter((f) => !inProject(f) && testRes.some((re) => re.test(f)));
  const lockNames = policy.lockfiles || [];
  const lockfiles = [];
  for (const dir of ["", ...apps.map((a) => (a.path === "." ? "" : a.path))]) {
    for (const name of lockNames) {
      const rel = dir ? `${dir}/${name}` : name;
      if (fs.existsSync(path.join(model.repo, rel)) && !lockfiles.includes(rel)) lockfiles.push(rel);
    }
  }
  return { files: [...new Set(files)].sort(), tests: [...new Set(tests)].sort(), lockfiles: lockfiles.sort(), components: comps.map((c) => c.id) };
}

// The fingerprint of a change right now: { hash, files }.
function fingerprintOf(model, change) {
  const cov = coverage(model, change);
  const lines = [];
  for (const f of new Set([...cov.files, ...cov.tests, ...cov.lockfiles])) lines.push(`${f}\0${hashFile(path.join(model.repo, f))}`);
  // 1.6: the version of a requirement, workflow or contract the change covers (only once a delta changed it), so
  // evidence of the old wording goes stale when a person approves a delta.
  const evolve = require("./evolve.cjs");
  const scope = new Set([...change.affects, ...change.slices.flatMap((s) => (model.slices.get(s) ? model.slices.get(s).delivers : []))]);
  for (const id of evolve.versionedIds(model)) if (scope.has(id)) lines.push(`version\0${id}\0${evolve.versionOf(model, id)}`);
  lines.sort();
  lines.push(`engine\0${require("./contract.cjs").ENGINE_VERSION}`);
  return { hash: sha(lines.join("\n")).slice(0, 12), files: cov.files.length + cov.tests.length + cov.lockfiles.length, coverage: cov };
}

// Evidence ids whose fingerprint no longer matches the code: Set of ids.
function staleEvidence(model) {
  const stale = new Set();
  const current = new Map();
  for (const e of model.evidence.values()) {
    if (!e.fingerprint || !e.change) continue;
    const change = model.changes.get(e.change);
    if (!change) continue;
    if (model.reverted && model.reverted.has(e.change)) continue; // a reverted change proves nothing, so its evidence is not "stale", it is history
    if (!current.has(e.change)) {
      try {
        current.set(e.change, fingerprintOf(model, change).hash);
      } catch {
        current.set(e.change, null);
      }
    }
    if (current.get(e.change) && current.get(e.change) !== e.fingerprint) stale.add(e.id);
  }
  return stale;
}

// Stale evidence nothing has replaced: when a change has fresh evidence of the same kind (it was verified again),
// its older stale records are history, not a problem.
function outstandingStale(model, stale) {
  const fresh = new Set();
  for (const e of model.evidence.values()) if (e.fingerprint && e.change && !stale.has(e.id)) fresh.add(`${e.change}|${e.kind}`);
  return [...stale].filter((id) => {
    const e = model.evidence.get(id);
    return e && !fresh.has(`${e.change}|${e.kind}`);
  });
}

module.exports = { fingerprintOf, coverage, staleEvidence, outstandingStale, hashFile, touchedComponents };
