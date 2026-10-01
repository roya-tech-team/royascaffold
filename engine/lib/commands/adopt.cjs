"use strict";

// `adopt` (plan file 10 C5, file 11 WP7): the modules of each app and how much of each is owned by
// a component (`Code:` globs). It drives adoption of an existing code base one module at a time,
// and `next` proposes the first module that is not fully owned.
//
// E3.1: each module also shows which knowledge layers describe it. The layers a module needs come from the
// knowledge registry and the adapters (`layers.requires`, `requiresDocs`); a layer covers a module when one of its
// pages or records names one of the module's components, or the module's folder.
//
// E3.3: `adopt docs <folder>`: existing documents become demands (SRC-) and decisions (ADR-) that quote them.

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { listFiles, SOURCE_EXTENSIONS } = require("../files.cjs");
const { patternList, matchesAny } = require("../glob.cjs");
const { toPosix } = require("../project.cjs");

const WRAPPERS = new Set(["src", "app", "lib", "source", "packages"]);

// A module is the first folder below the app (or below src/, app/, lib/ when the app wraps its code).
function moduleOf(appPath, file) {
  const rel = appPath && appPath !== "." ? file.slice(appPath.length + 1) : file;
  const parts = rel.split("/");
  if (parts.length === 1) return appPath && appPath !== "." ? `${appPath} (root files)` : "(root files)";
  const head = WRAPPERS.has(parts[0]) && parts.length > 2 ? `${parts[0]}/${parts[1]}` : parts[0];
  return appPath && appPath !== "." ? `${appPath}/${head}` : head;
}

// The layers every module needs: architecture, what the adapters require, and the documents they ask for.
function requiredLayers(model) {
  const K = require("../knowledge.cjs");
  const policy = require("../adapters.cjs").policy(model);
  const fromDocs = policy.requiresDocs.map((kind) => (K.docsOf(model).find((d) => d.kind === kind) || {}).layer || kind);
  return [...new Set(["architecture", ...policy.layers, ...fromDocs])].filter((id) => K.LAYERS.some((l) => l.id === id));
}

// The text of each layer: its pages and its records, so a mention can be found.
function layerTexts(model, layer) {
  const K = require("../knowledge.cjs");
  const L = K.LAYERS.find((l) => l.id === layer);
  const out = [];
  for (const d of K.docsForLayer(model, layer)) {
    const abs = path.join(model.root, d.file);
    if (fs.existsSync(abs)) out.push({ source: d.file, text: fs.readFileSync(abs, "utf8") });
  }
  for (const r of model.records.values()) {
    if (L.kinds.includes(r.kind) && r.origin === "record") out.push({ source: r.id, text: `${r.title}\n${Object.values(r.fields).join("\n")}\n${r.body || ""}` });
  }
  return out;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A model never changes after it is built, so the result is kept for it (a command asks several times).
const MEMO = new WeakMap();
function adoption(model) {
  if (!MEMO.has(model)) MEMO.set(model, adoptionOf(model));
  return MEMO.get(model);
}

function adoptionOf(model) {
  const comps = [...model.records.values()].filter((r) => r.kind === "component");
  const globs = comps.flatMap((r) => patternList(r.fields.Code));
  const exclude = patternList(model.profile.code_exclude);
  const apps = [...model.records.values()].filter((r) => r.kind === "app" && r.fields.Path);
  const modules = new Map();
  for (const app of apps) {
    const base = String(app.fields.Path).replace(/`/g, "").trim().replace(/\/+$/, "") || ".";
    const projectRel = path.relative(model.repo, model.root).split(path.sep).join("/");
    const files = listFiles(model.repo, base === "." ? "" : base).filter((f) => SOURCE_EXTENSIONS.includes(path.extname(f)) && !matchesAny(f, exclude) && !(projectRel && f.startsWith(`${projectRel}/`)));
    for (const f of files) {
      const m = moduleOf(base, f);
      if (!modules.has(m)) modules.set(m, { module: m, app: app.id, files: 0, owned: 0, unowned: [], all: [] });
      const e = modules.get(m);
      e.files += 1;
      e.all.push(f);
      if (matchesAny(f, globs)) e.owned += 1;
      else e.unowned.push(f);
    }
  }
  const K = require("../knowledge.cjs");
  const required = model.is14 ? requiredLayers(model) : [];
  const texts = new Map(required.map((l) => [l, layerTexts(model, l)]));
  const list = [...modules.values()].sort((a, b) => a.module.localeCompare(b.module)).map(({ all, ...m }) => {
    // The components that own at least one file of the module, and the layers that describe it.
    const owners = comps.filter((c) => patternList(c.fields.Code).length && all.some((f) => matchesAny(f, patternList(c.fields.Code)))).map((c) => c.id);
    const folder = path.posix.basename(m.module);
    const word = /\(root files\)/.test(m.module) || folder.length < 3 ? null : new RegExp(`\\b${escapeRe(folder)}\\b`, "i");
    const layers = required.map((layer) => {
      const by = texts.get(layer).filter((t) => owners.some((id) => t.text.includes(id)) || (word && word.test(t.text))).map((t) => t.source);
      return { layer, label: K.LAYERS.find((l) => l.id === layer).label, covered: by.length > 0, by };
    });
    return { ...m, components: owners, layers, layer_gaps: layers.filter((l) => !l.covered).map((l) => l.label), percent: m.files ? Math.round((m.owned / m.files) * 100) : 100 };
  });
  const files = list.reduce((n, m) => n + m.files, 0);
  const owned = list.reduce((n, m) => n + m.owned, 0);
  return { modules: list, files, owned, percent: files ? Math.round((owned / files) * 100) : 100, required_layers: required, layer_gap_modules: list.filter((m) => m.layer_gaps.length).length };
}

function adoptCommand(start) {
  const model = buildModel(start);
  const a = adoption(model);
  const lines = [`Code owned by components: ${a.owned}/${a.files} source file(s) (${a.percent}%)`];
  for (const m of a.modules) lines.push(`  ${m.percent === 100 ? "✓" : "·"} ${m.module.padEnd(40)} ${String(m.owned).padStart(4)}/${String(m.files).padEnd(4)} ${String(m.percent).padStart(3)}%${m.layer_gaps.length ? `  layer gaps: ${m.layer_gaps.join(", ")}` : ""}`);
  const next = a.modules.find((m) => m.percent < 100);
  lines.push(next ? `Next: adopt ${next.module} (${next.files - next.owned} file(s) without a component) — see cards/adopt.md` : "Every module is owned by a component.");
  if (a.layer_gap_modules) lines.push(`Layer gaps: ${a.layer_gap_modules} module(s) lack a page for a layer they need (${a.required_layers.join(", ")}): describe them where the layer's page says.`);
  // E6.4: progress of the adoption changes `adopt --plan` opened, from what components own now.
  const progress = require("../adoptplan.cjs").progressOf(model, a);
  if (progress.length) {
    lines.push("Adoption changes (checkpoints done, from code ownership):");
    for (const p of progress) lines.push(`  ${p.done === p.total ? "✓" : "·"} ${p.change} ${p.module}: ${p.done}/${p.total} checkpoint(s)${p.checkpoints.find((c) => !c.done) ? ` — next: ${p.checkpoints.find((c) => !c.done).part} (${p.checkpoints.find((c) => !c.done).remaining} file(s))` : ""}`);
  }
  return { ...a, ...(progress.length ? { progress } : {}), next: next ? next.module : null, text: lines.join("\n") };
}

// ---- adopt docs <folder> ---------------------------------------------------------------------

const DOC_EXT = /\.(md|markdown|txt|rst)$/i;
const fail = (code, message) => Object.assign(new Error(message), { code });

// The documents of a folder, each with its headings and the records that quote it, and whether every quote holds.
function adoptDocs(start, folder) {
  if (!folder || folder === true) throw fail("INVALID_INPUT", "Usage: royascaff adopt docs <folder> [path]");
  const model = buildModel(start);
  const rel = String(folder).replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");
  const abs = path.resolve(model.repo, rel);
  if (rel.startsWith("..") || path.relative(model.repo, abs).startsWith("..")) throw fail("INVALID_INPUT", `The folder must be inside the repository (got ${folder})`);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) throw fail("UNKNOWN_ID", `${rel} is not a folder in this repository`);
  const { fileQuoteFound } = require("../coverage.cjs");
  const { blobHash } = require("../scan.cjs"); // scan.cjs needs this file's moduleOf, so it is loaded here, not at the top
  const withSource = [...model.records.values()].filter((r) => r.origin === "record" && String(r.fields["Source file"] || "").trim());
  const documents = listFiles(model.repo, rel).filter((f) => DOC_EXT.test(f)).sort().map((f) => {
    const buf = fs.readFileSync(path.join(model.repo, f));
    const text = buf.toString("utf8");
    const headings = [];
    let fenced = false;
    text.split("\n").forEach((line, i) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      const h = !fenced && line.match(/^(#{1,6})\s+(.*\S)\s*$/);
      if (h) headings.push({ line: i + 1, level: h[1].length, text: h[2] });
    });
    const records = withSource.filter((r) => toPosix(String(r.fields["Source file"]).trim()) === f).map((r) => r.id);
    return { path: f, bytes: buf.length, lines: text.split("\n").length - (text.endsWith("\n") ? 1 : 0), sha: blobHash(buf), headings: headings.slice(0, 40), records, covered: records.length > 0 };
  });
  const inFolder = new Set(documents.map((d) => d.path));
  const records = withSource.filter((r) => inFolder.has(toPosix(String(r.fields["Source file"]).trim()))).map((r) => {
    const file = toPosix(String(r.fields["Source file"]).trim());
    const quote = String(r.fields.Quote || "").trim();
    return { id: r.id, kind: r.kind, title: r.title, source_file: file, quote, quote_ok: Boolean(quote) && fileQuoteFound(fs.readFileSync(path.join(model.repo, file), "utf8"), quote) };
  });
  const uncovered = documents.filter((d) => !d.covered).map((d) => d.path);
  const problems = records.filter((r) => !r.quote_ok).map((r) => `${r.id} quotes words that are not in ${r.source_file}`);
  const lines = [`${documents.length} document(s), ${documents.length - uncovered.length} covered, ${records.length} record(s) quoting them, ${problems.length} problem(s)`];
  for (const d of documents) lines.push(`  ${d.covered ? "✓" : "·"} ${d.path} (${d.lines} lines, ${d.headings.length} headings)${d.records.length ? ` — ${d.records.join(", ")}` : ""}`);
  for (const r of records) lines.push(`  ${r.quote_ok ? "✓" : "✗"} ${r.id} · ${r.title}${r.quote_ok ? "" : ` — the quote is not in ${r.source_file}`}`);
  if (uncovered.length) lines.push(`Next: read ${uncovered[0]}, then write what it demands and decides: royascaff new record source "<demand>" --quote "<exact words>" --source-file ${uncovered[0]}  ·  royascaff new record decision "<decision>" --quote "<exact words>" --source-file ${uncovered[0]}`);
  else if (documents.length) lines.push("Every document is covered. validate checks each quote against its file whenever the project is checked.");
  return { folder: rel, documents, records, uncovered, counts: { documents: documents.length, covered: documents.length - uncovered.length, records: records.length, problems: problems.length }, problems, text: lines.join("\n") };
}

module.exports = { adoption, adoptCommand, adoptDocs, moduleOf, requiredLayers };
