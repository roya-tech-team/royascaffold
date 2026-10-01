"use strict";

// Baselines, `diff` and `history` (plan file 02 §3, E3/E4).
//
// A baseline is a frozen snapshot of the knowledge at a release: `project/baselines/<REL-ID>.json`. It holds every
// record (kind, title, version, a hash and the text of its wording), the typed links, the derived status of the
// requirements and features, and the evidence with its fingerprints (the shapes `export` uses). It is written once
// and never changed: the history of a record is the baselines plus the delta blocks of the evolve changes plus git.
// Everything here can be rebuilt from the repository.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { recordText } = require("./parse/markdown.cjs");
const evolve = require("./evolve.cjs");

const FORMAT = "royascaff-baseline";
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const fail = (code, message, missing) => Object.assign(new Error(message), { code, ...(missing ? { missing } : {}) });

const dirOf = (model) => path.join(model.root, "baselines");
const fileOf = (model, rel) => path.join(dirOf(model), `${rel}.json`);

// The words of a record, as one normalized string, for hashing and for showing what changed.
function textOf(model, rec, read) {
  if (rec.origin === "record") {
    const raw = recordText(read(rec.file), rec.id) || "";
    return raw.split("\n").filter((l) => !/^- \*\*(Confirmed by|Inferred on):\*\*/.test(l)).join("\n").trim();
  }
  if (rec.origin === "slice-row") {
    const s = model.slices.get(rec.id);
    return `${s.title} | delivers ${s.delivers.join(", ")} | depends on ${s.depends_on.join(", ")}`;
  }
  return rec.title;
}

function buildBaseline(model, status, relId) {
  const rel = model.records.get(relId);
  const cache = new Map();
  const read = (f) => { if (!cache.has(f)) cache.set(f, fs.readFileSync(path.join(model.root, f), "utf8")); return cache.get(f); };
  const records = [];
  for (const rec of model.records.values()) {
    if (["change", "task"].includes(rec.kind)) continue;
    const text = textOf(model, rec, read);
    const e = { id: rec.id, kind: rec.kind, title: rec.title, ...(evolve.DELTA_KINDS.includes(rec.kind) ? { version: evolve.versionOf(model, rec.id) } : {}), hash: sha(text.replace(/\s+/g, " ")).slice(0, 12), file: rec.file, text };
    records.push(e);
  }
  records.sort((a, b) => a.id.localeCompare(b.id));
  const links = [];
  for (const rec of model.records.values()) {
    if (["change", "task"].includes(rec.kind)) continue;
    for (const r of rec.relations) links.push({ from: rec.id, type: r.type, to: r.to, resolved: model.records.has(r.to) });
  }
  const plain = (map) => Object.fromEntries([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]));
  const includes = rel.relations.filter((r) => r.type === "includes").map((r) => r.to);
  return {
    format: FORMAT,
    format_version: 1,
    contract: require("./contract.cjs").CONTRACT_VERSION,
    engine: require("./contract.cjs").ENGINE_VERSION,
    release: relId,
    title: rel.title,
    includes,
    created: new Date().toISOString().slice(0, 10),
    git: require("./git.cjs").headShort(model.repo) || null,
    records,
    links,
    status: { features: plain(status.features), requirements: plain(status.requirements) },
    evidence: [...model.evidence.values()].map((e) => ({ id: e.id, change: e.change, kind: e.kind, result: e.result, proves: e.proves, fingerprint: e.fingerprint, stale: status.stale.has(e.id) })),
  };
}

// Writes it once. A baseline is frozen: an existing one is never overwritten.
function writeBaseline(model, status, relId) {
  const rec = model.records.get(relId);
  if (!rec) throw fail("UNKNOWN_ID", `${relId} is not a record in this project`);
  if (rec.kind !== "release") throw fail("INVALID_INPUT", `${relId} is a ${rec.kind}: baselines belong to releases (REL-)`);
  const file = fileOf(model, relId);
  if (fs.existsSync(file)) throw fail("ALREADY_EXISTS", `${relId} already has a baseline (project/baselines/${relId}.json): a baseline is frozen and is never rewritten`);
  const baseline = buildBaseline(model, status, relId);
  fs.mkdirSync(dirOf(model), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(baseline, null, 2)}\n`);
  return { baseline, file: `baselines/${relId}.json` };
}

function readBaseline(model, relId) {
  const file = fileOf(model, relId);
  if (!fs.existsSync(file)) throw fail("UNKNOWN_ID", `${relId} has no baseline: run royascaff release ${relId}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Baselines in release order (the number in the ID, then the name).
function listBaselines(model) {
  const dir = dirOf(model);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

// The knowledge as it is now, in the shape of a baseline (so `diff REL-A now` works).
function liveBaseline(model, status) {
  const cache = new Map();
  const read = (f) => { if (!cache.has(f)) cache.set(f, fs.readFileSync(path.join(model.root, f), "utf8")); return cache.get(f); };
  const records = [];
  for (const rec of model.records.values()) {
    if (["change", "task"].includes(rec.kind)) continue;
    const text = textOf(model, rec, read);
    records.push({ id: rec.id, kind: rec.kind, title: rec.title, ...(evolve.DELTA_KINDS.includes(rec.kind) ? { version: evolve.versionOf(model, rec.id) } : {}), hash: sha(text.replace(/\s+/g, " ")).slice(0, 12), file: rec.file, text });
  }
  return { release: "now", records, evidence: [...model.evidence.values()].map((e) => ({ id: e.id, change: e.change, kind: e.kind, result: e.result, proves: e.proves, fingerprint: e.fingerprint, stale: status.stale.has(e.id) })) };
}

// Ids a change touches: what it delivers, affects, changes by delta or names in its Impact table.
function touchedBy(model) {
  const { changeBody } = require("./gates.cjs");
  const K = require("./knowledge.cjs");
  const { findIds } = require("./parse/ids.cjs");
  const map = new Map();
  for (const change of model.changes.values()) {
    if (change.status === "cancelled") continue;
    const ids = new Set(change.affects);
    for (const s of change.slices) {
      ids.add(s);
      const sl = model.slices.get(s);
      if (sl) { ids.add(sl.feature); for (const d of sl.delivers) ids.add(d); }
    }
    try {
      const body = changeBody(model.root, change);
      const impact = K.impactOf(body);
      if (impact) for (const row of impact.rows) if (["changed", "referenced"].includes(row.state)) for (const id of findIds(row.named)) ids.add(id);
      for (const d of evolve.parseDeltas(body)) ids.add(d.id);
    } catch {
      // a change without a readable body touches only what its front matter says
    }
    map.set(change.id, ids);
  }
  return map;
}

// The difference between two baselines (or one and the live state): added, changed and removed records, by kind,
// with the changes that caused each.
function diffBaselines(model, a, b) {
  const byId = (x) => new Map(x.records.map((r) => [r.id, r]));
  const A = byId(a);
  const B = byId(b);
  const touched = touchedBy(model);
  const inc = (x) => new Set(x.includes || []);
  // The changes that count: those the later release adds to the earlier one (everything after the earlier release
  // for `now`); with no release lists, every change.
  const fresh = b.release === "now" ? (inc(a).size ? [...touched.keys()].filter((c) => !inc(a).has(c)) : null) : [...inc(b)].filter((c) => !inc(a).has(c));
  const counts = (chg) => !fresh || !fresh.length || fresh.includes(chg);
  const deltaChanges = (id) => (evolve.allDeltas(model).get(id) || []).map((d) => d.change).filter((c) => counts(c) && evolve.applied(model, model.changes.get(c)));
  const causes = (id, byDelta) => {
    const d = byDelta ? [...new Set(deltaChanges(id))].sort() : [];
    return d.length ? d : [...touched.entries()].filter(([chg, ids]) => ids.has(id) && counts(chg)).map(([chg]) => chg).sort();
  };
  const row = (r, extra = {}, byDelta = false) => ({ id: r.id, kind: r.kind, title: r.title, ...(r.version ? { version: r.version } : {}), causes: causes(r.id, byDelta), ...extra });
  const added = [];
  const removed = [];
  const changed = [];
  for (const [id, r] of B) if (!A.has(id)) added.push(row(r));
  for (const [id, r] of A) if (!B.has(id)) removed.push(row(r));
  for (const [id, r] of B) {
    const o = A.get(id);
    if (!o || (o.hash === r.hash && o.title === r.title && (o.version || 1) === (r.version || 1))) continue;
    changed.push(row(r, { from_version: o.version || 1, to_version: r.version || 1, before: o.text, after: r.text, title_before: o.title !== r.title ? o.title : undefined }, true));
  }
  const order = (x, y) => x.kind.localeCompare(y.kind) || x.id.localeCompare(y.id);
  added.sort(order); removed.sort(order); changed.sort(order);
  const evA = new Map(a.evidence.map((e) => [e.id, e]));
  const evB = new Map(b.evidence.map((e) => [e.id, e]));
  const evidence = {
    added: [...evB.keys()].filter((id) => !evA.has(id)).sort(),
    removed: [...evA.keys()].filter((id) => !evB.has(id)).sort(),
    newly_stale: [...evB.values()].filter((e) => e.stale && evA.has(e.id) && !evA.get(e.id).stale).map((e) => e.id).sort(),
  };
  const kinds = {};
  for (const [name, list] of [["added", added], ["changed", changed], ["removed", removed]]) for (const r of list) { kinds[r.kind] = kinds[r.kind] || { added: 0, changed: 0, removed: 0 }; kinds[r.kind][name] += 1; }
  return { from: a.release, to: b.release, counts: { added: added.length, changed: changed.length, removed: removed.length, evidence_added: evidence.added.length }, by_kind: kinds, added, changed, removed, evidence };
}

module.exports = { FORMAT, buildBaseline, writeBaseline, readBaseline, listBaselines, liveBaseline, diffBaselines, touchedBy, textOf, dirOf };
