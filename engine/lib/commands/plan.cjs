"use strict";

// Planning commands: `new feature` and `new slice`.
// Every write is transactional: the project is re-validated after writing, and if the write
// introduced a new error the original file content is restored.

const fs = require("fs");
const path = require("path");
const { buildModel, errorsOf } = require("../model/graph.cjs");
const { findProject } = require("../project.cjs");
const { parseMarkdown, renderMarkdown } = require("../parse/markdown.cjs");
const { readTables } = require("../model/tables.cjs");
const { HORIZONS } = require("../model/vocabulary.cjs");
const { headShort } = require("../git.cjs");
const { docText, insertRecord, RECORD_KINDS, KIND_ALIASES, recordBlock } = require("../templates.cjs");

const ROADMAP = "knowledge/00-roadmap/roadmap.md";
const SLICE_HEADER = "| Slice | Title | Order | Depends on | Delivers | Planned at |\n|---|---|---|---|---|---|";

function roadmapTemplate(code, owner) {
  return docText("roadmap", { CODE: code, OWNER: owner });
}

function transactional(start, file, newContent) {
  const before = errorsOf(buildModel(start)).map((e) => `${e.code}|${e.message}`);
  const existed = fs.existsSync(file);
  const original = existed ? fs.readFileSync(file, "utf8") : null;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, newContent);
  const introduced = errorsOf(buildModel(start)).filter((e) => !before.includes(`${e.code}|${e.message}`));
  if (introduced.length) {
    if (existed) fs.writeFileSync(file, original);
    else fs.rmSync(file);
    const err = new Error(`Not written — this change would introduce:\n${introduced.map((e) => `  - ${e.message}`).join("\n")}`);
    err.issues = introduced;
    throw err;
  }
}

function nextNumber(ids, prefix) {
  let max = 0;
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  for (const id of ids) {
    const m = id.match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return String(max + 1).padStart(3, "0");
}

function letterFor(n) {
  let s = "";
  let x = n;
  do {
    s = String.fromCharCode(65 + (x % 26)) + s;
    x = Math.floor(x / 26) - 1;
  } while (x >= 0);
  return s;
}

function newFeature(start, title, opts = {}) {
  if (!title) throw new Error('Usage: royascaff new feature "<title>" [--horizon backlog|later|next|now] [--outcome OUT-…] [--priority must|should|could]');
  const horizon = (opts.horizon || "backlog").toLowerCase();
  if (!HORIZONS.includes(horizon)) throw new Error(`Horizon must be one of: ${HORIZONS.join(", ")}`);
  const project = findProject(start);
  const model = buildModel(start);
  const owner = opts.owner || (Array.isArray(model.profile.owners) && model.profile.owners[0]) || "team";
  const id = `CAP-${model.code}-${nextNumber(model.records.keys(), `CAP-${model.code}`)}`;
  const file = path.join(project.projectDir, ROADMAP);
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : roadmapTemplate(model.code, owner);
  const fields = [
    `- **Owner:** ${owner}`,
    `- **Priority:** ${opts.priority || "should"}`,
    `- **Horizon:** ${horizon}`,
    ...(opts.outcome ? [`- **Outcome:** ${opts.outcome}`] : []),
  ];
  const block = `## ${id} · ${title}\n\n${fields.join("\n")}\n\n_Describe the user value in one or two sentences._\n\n${SLICE_HEADER}\n`;
  transactional(start, file, insertRecord(content, block));
  return { id, horizon, file: ROADMAP };
}

function newSlice(start, featureId, title, opts = {}) {
  if (!featureId || !title) throw new Error('Usage: royascaff new slice <CAP-…> "<title>" [--delivers REQ-…,REQ-…] [--depends SLC-…] [--order N]');
  const project = findProject(start);
  const model = buildModel(start);
  const feature = model.features.get(featureId);
  if (!feature) throw new Error(`${featureId} is not a feature in this project`);
  const rec = model.records.get(featureId);
  const file = path.join(project.projectDir, rec.file);
  const parsed = parseMarkdown(fs.readFileSync(file, "utf8"));
  const seg = parsed.segments.find((s) => s.type === "record" && s.id === featureId);

  const featureNumber = featureId.split("-").slice(2).join("-");
  const taken = new Set(model.records.keys());
  let n = 0;
  let id;
  do {
    id = `SLC-${model.code}-${featureNumber}-${letterFor(n)}`;
    n += 1;
  } while (taken.has(id));
  const list = (v) => (v ? String(v).split(",").map((x) => x.trim()).filter(Boolean) : []);
  const delivers = list(opts.delivers);
  const depends = list(opts.depends);
  const order = opts.order || feature.slices.length + 1;
  const plannedAt = headShort(project.repo) || "—";
  const row = `| ${id} | ${title} | ${order} | ${depends.join(", ") || "—"} | ${delivers.join(", ") || "—"} | ${plannedAt} |`;

  const bodyLines = (seg.body === null || seg.body === undefined ? "" : seg.body).split("\n");
  const table = readTables(bodyLines.join("\n")).find((t) => t.header[0].toLowerCase() === "slice");
  if (table) {
    bodyLines.splice(table.endLine + 1, 0, row);
  } else {
    let end = bodyLines.length;
    while (end > 0 && bodyLines[end - 1] === "") end -= 1;
    bodyLines.splice(end, 0, "", ...SLICE_HEADER.split("\n"), row);
  }
  seg.body = bodyLines.join("\n");
  if (opts.foundation) {
    // E1.4: `- **Foundation:** SLC-…` on the feature marks slices that are done before its others open.
    seg.fields = seg.fields || [];
    const marked = seg.fields.find((x) => x.key === "Foundation");
    if (marked) {
      marked.value = `${marked.value}, ${id}`;
      delete marked.raw;
    } else seg.fields.push({ key: "Foundation", value: id });
  }
  transactional(start, file, renderMarkdown(parsed));
  return { id, feature: featureId, order, delivers, depends, planned_at: plannedAt, file: rec.file, ...(opts.foundation ? { foundation: true } : {}) };
}

// The existing document a record quotes (`--source-file`): inside the repository, there, and holding the quote word for word.
function checkSourceFile(repo, given, quote) {
  const rel = String(given).replace(/\\/g, "/").replace(/^\.\//, "");
  const abs = path.resolve(repo, rel);
  if (rel.startsWith("..") || path.isAbsolute(rel) || path.relative(repo, abs).startsWith("..")) throw Object.assign(new Error(`--source-file must be a file inside the repository (got ${given})`), { code: "INVALID_INPUT" });
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) throw Object.assign(new Error(`${rel} is not a file in this repository`), { code: "UNKNOWN_ID" });
  if (!quote) throw Object.assign(new Error(`Quote the document: add --quote "<exact words from ${rel}>"`), { code: "INVALID_INPUT" });
  if (!require("../coverage.cjs").fileQuoteFound(fs.readFileSync(abs, "utf8"), quote)) throw Object.assign(new Error(`The quote is not in ${rel}: copy the words exactly as they are in the file (… may join parts)`), { code: "INVALID_INPUT" });
  return rel;
}

// new record <kind> "<title>" [--feature CAP-…] [--priority …] [--code globs] [--realizes …] [--verifies …] [--check …]
function newRecord(start, kindArg, title, opts = {}) {
  const kind = KIND_ALIASES[String(kindArg || "").toLowerCase()] || String(kindArg || "").toLowerCase();
  if (!RECORD_KINDS[kind] || !title) throw new Error(`Usage: royascaff new record <${Object.keys(RECORD_KINDS).join("|")}> "<title>" [--feature CAP-…] [--priority must|should|could] [--code "apps/web/src/x/**"] [--realizes REQ-…] [--verifies REQ-…] [--check runner:test|manual]`);
  const spec = RECORD_KINDS[kind];
  const project = findProject(start);
  const model = buildModel(start);
  const owner = opts.owner || (Array.isArray(model.profile.owners) && model.profile.owners[0]) || "team";
  const id = `${spec.prefix}-${model.code}-${nextNumber(model.records.keys(), `${spec.prefix}-${model.code}`)}`;
  const rel = typeof spec.file === "function" ? spec.file(opts) : spec.file;
  const doc = typeof spec.doc === "function" ? spec.doc(opts) : spec.doc;
  if (opts.feature && kind === "question" && !model.features.has(opts.feature)) throw new Error(`${opts.feature} is not a feature`);
  const file = path.join(project.projectDir, rel);
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : docText(doc, { CODE: model.code, OWNER: owner, NAME: model.profile.project_name || model.code });
  const list = (v) => (v ? String(v).split(",").map((x) => x.trim()).filter(Boolean).join(", ") : "");
  if (kind === "source" && !opts["source-file"]) {
    // D7: demands are one table row each when the file has a demand table (outside examples).
    const lines = content.split("\n");
    let fenced = false;
    const plain = lines.map((l) => { if (/^\s*(```|~~~)/.test(l)) { fenced = !fenced; return ""; } return fenced ? "" : l; }).join("\n");
    const table = readTables(plain).find((t) => (t.header[0] || "").trim().toLowerCase() === "src");
    if (table) {
      const { escapeCell } = require("../model/tables.cjs");
      lines.splice(table.endLine + 1, 0, `| ${id} | ${escapeCell(title)} | ${escapeCell(opts.quote || "")} | ${escapeCell(list(opts.covered))} | |`);
      transactional(start, file, lines.join("\n"));
      return { id, kind, file: rel };
    }
  }
  // E3.1: `--basis inferred …` marks a record the AI guessed from existing code; it carries its date, so the
  // 14-day check can run. (An assumption's Basis is its reason, and is confirmed by the project approval.)
  const extra = [];
  if (kind !== "assumption" && /^inferred\b/i.test(String(opts.basis || ""))) extra.push(["Basis", opts.basis], ["Inferred on", new Date().toISOString().slice(0, 10)]);
  // E3.3: `--source-file <path>` says which existing document the record comes from; its quote must be in it.
  if (opts["source-file"] && opts["source-file"] !== true) {
    const srcRel = checkSourceFile(project.repo, opts["source-file"], opts.quote);
    extra.push(["Source file", srcRel]);
    if (kind !== "source" && opts.quote) extra.push(["Quote", opts.quote]);
  }
  transactional(start, file, insertRecord(content, recordBlock(kind, id, title, { owner, priority: opts.priority, feature: opts.feature, code: opts.code, realizes: list(opts.realizes), verifies: list(opts.verifies), check: opts.check, topic: opts.topic, basis: kind === "assumption" ? opts.basis : undefined, scope: opts.scope, includes: list(opts.includes), applies: list(opts.applies), quote: opts.quote, covered: list(opts.covered), hides: list(opts.hides), removeBy: opts["remove-by"], hypothesis: opts.hypothesis, variants: opts.variants, metric: opts.metric, outcome: opts.outcome, extra })));
  // 1.6: a release that names what it includes gets its baseline at once (a frozen snapshot, `royascaff release` otherwise).
  if (kind === "release" && list(opts.includes)) {
    try {
      return { id, kind, file: rel, baseline: require("./evolve.cjs").releaseCommand(start, id, opts).file };
    } catch (error) {
      return { id, kind, file: rel, baseline_error: error.message };
    }
  }
  return { id, kind, file: rel };
}

// new doc <kind>: create a layer document from its template (never overwrites).
// The layer pages of the knowledge registry (beta.4: domain and rules too).
const DOCS = Object.fromEntries(require("../knowledge.cjs").DOCS.filter((d) => d.newDoc).map((d) => [d.kind, d.file]));
function newDoc(start, kind) {
  if (!DOCS[kind]) throw new Error(`Usage: royascaff new doc <${Object.keys(DOCS).join("|")}>`);
  const project = findProject(start);
  const model = buildModel(start);
  const file = path.join(project.projectDir, DOCS[kind]);
  if (fs.existsSync(file)) throw new Error(`${DOCS[kind]} already exists: edit it`);
  const owner = (Array.isArray(model.profile.owners) && model.profile.owners[0]) || "team";
  transactional(start, file, docText(kind, { CODE: model.code, OWNER: owner, NAME: model.profile.project_name || model.code }));
  return { kind, file: DOCS[kind] };
}

module.exports = { newFeature, newSlice, newRecord, newDoc, transactional, ROADMAP, DOCS };
