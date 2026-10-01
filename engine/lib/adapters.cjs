"use strict";

// Adapters (plan file 02 §10, file 11 WP6): technology guidance as short cards in
// `engine/adapters/<name>.md`, chosen in profile.md (`adapters: [web-ui]`).
// The engine uses them in three places:
//   next      names the adapter card to read at the Design and Check stages
//   context   adds the adapter's "Rules" section to every Context Pack
//   validate  adds the adapter's "Words" to the business-language check
//   policy    the adapter's manifest (`<name>.json`): which checks run, with which patterns and
//             thresholds. The core runs what the manifests declare and never tests an adapter
//             name (beta.4, plan file 17 WP-D4).

const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "adapters");

// Where adapters are looked up: the project's own `project/adapters/` first (a team can define an
// adapter for its stack without touching the engine), then the engine's.
const dirsOf = (projectDir) => [...(projectDir ? [path.join(projectDir, "adapters")] : []), DIR];
const listIn = (dir) => {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
};
const KNOWN = (projectDir) => [...new Set(dirsOf(projectDir).flatMap(listIn))].sort();
const find = (name, ext, projectDir) => dirsOf(projectDir).map((d) => path.join(d, `${name}.${ext}`)).find((f) => fs.existsSync(f)) || null;

function adaptersOf(model) {
  const raw = model.profile.adapters;
  const list = (Array.isArray(raw) ? raw : raw ? String(raw).split(",") : []).map((x) => String(x).trim()).filter(Boolean);
  const known = KNOWN(model.root);
  const names = list.filter((n) => known.includes(n));
  return names.length ? names : model.is14 ? ["generic"] : [];
}

function readAdapter(name, projectDir = null) {
  const file = find(name, "md", projectDir);
  if (!file) return null;
  const text = fs.readFileSync(file, "utf8");
  const part = (title) => {
    const m = text.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
    return m ? m[1].trim() : "";
  };
  return { name, card: `adapters/${name}.md`, file, design: part("Design"), rules: part("Rules"), check: part("Check"), words: part("Words").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean) };
}

// The manifest beside each card (`adapters/<name>.json`); `includes` pulls in other adapters.
function manifest(name, projectDir = null) {
  const file = find(name, "json", projectDir);
  if (!file) return { adapter: name };
  const m = JSON.parse(fs.readFileSync(file, "utf8"));
  return { ...m, dir: path.dirname(file) };
}

// The active adapters with everything they include, in order, each once.
function expanded(names, projectDir = null) {
  const out = [];
  const visit = (n) => {
    if (out.includes(n)) return;
    for (const inc of manifest(n, projectDir).includes || []) visit(inc);
    out.push(n);
  };
  for (const n of names) visit(n);
  return out;
}

const RISKS = ["low", "medium", "high", "critical"];
const uniq = (xs) => [...new Set(xs)];

// One merged policy for a project: lists are joined, flags are or-ed, the lowest person-look risk
// wins, and the first smoke/deps/tests definition is kept (later ones may add smoke env).
function policyOf(names, projectDir = null) {
  const list = expanded(names, projectDir);
  const p = { adapters: list, requiresDocs: [], visualBar: false, personLook: null, smoke: null, tests: null, deps: null, legacyAppTypes: {} };
  for (const n of list) {
    const m = manifest(n, projectDir);
    p.requiresDocs = uniq([...p.requiresDocs, ...(m.requiresDocs || [])]);
    if (m.visualBar) p.visualBar = true;
    if (m.personLook) {
      const prev = p.personLook;
      p.personLook = prev
        ? { kinds: uniq([...prev.kinds, ...m.personLook.kinds]), minRisk: RISKS[Math.min(RISKS.indexOf(prev.minRisk), RISKS.indexOf(m.personLook.minRisk))] }
        : { kinds: [...m.personLook.kinds], minRisk: m.personLook.minRisk };
    }
    if (m.smoke) {
      if (!p.smoke && m.smoke.template) p.smoke = { ...m.smoke, template: path.join(m.dir, m.smoke.template), env: { ...(m.smoke.env || {}) } };
      else if (p.smoke) p.smoke.env = { ...p.smoke.env, ...(m.smoke.env || {}) };
    }
    if (m.tests && !p.tests) p.tests = m.tests;
    else if (m.tests) p.tests = { files: uniq([...p.tests.files, ...m.tests.files]), readsSource: [...p.tests.readsSource, ...(m.tests.readsSource || [])] };
    if (m.deps && !p.deps) p.deps = m.deps;
    if (m.tradeoffs) p.tradeoffs = [...(p.tradeoffs || []), { ...m.tradeoffs, adapter: n }];
    for (const t of m.legacyAppTypes || []) p.legacyAppTypes[t] = n;
  }
  return p;
}

function policy(model) {
  return policyOf(adaptersOf(model), model.root);
}

// A person looks at a change of this kind and risk (the adapter's `personLook`).
function needsPersonLook(model, change) {
  const pl = policy(model).personLook;
  return Boolean(pl && pl.kinds.includes(change.kind) && RISKS.indexOf(change.risk) >= RISKS.indexOf(pl.minRisk));
}

// Legacy (1.2) app types mapped to the adapter that declares them; unknown types → generic.
function adapterForLegacyType(type) {
  const map = {};
  for (const n of KNOWN()) for (const t of manifest(n).legacyAppTypes || []) map[t] = n;
  return map[type] || "generic";
}

function adapterCards(model) {
  // Engine cards are installed into the AI tool as `adapters/<name>.md`; a project's own card is
  // read where it lives.
  return expanded(adaptersOf(model), model.root).map((n) => {
    const file = find(n, "md", model.root);
    return file && !file.startsWith(DIR) ? path.relative(model.repo, file).split(path.sep).join("/") : `adapters/${n}.md`;
  });
}

module.exports = { DIR, KNOWN, adaptersOf, readAdapter, adapterCards, manifest, policy, policyOf, needsPersonLook, adapterForLegacyType };
