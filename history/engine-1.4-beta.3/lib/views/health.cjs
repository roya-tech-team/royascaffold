"use strict";

// Health numbers (plan file 02 §3, acceptance file 07 §5.2, file 11 WP8): the cost of the knowledge
// compared with the code, committed pack copies, the largest open Context Pack, and code ownership.

const fs = require("fs");
const path = require("path");
const { listFiles, SOURCE_EXTENSIONS } = require("../files.cjs");

const lineCount = (abs) => {
  try {
    const t = fs.readFileSync(abs, "utf8");
    return t ? t.split("\n").length - (t.endsWith("\n") ? 1 : 0) : 0;
  } catch {
    return 0;
  }
};

function healthOf(model, status) {
  const projectRel = path.relative(model.repo, model.root).split(path.sep).join("/");
  const docs = listFiles(model.root, "").filter((f) => f.endsWith(".md") && f !== "STATUS.md" && !f.startsWith("_legacy/"));
  const packs = docs.filter((f) => /^changes\/[^/]+\/contexts\//.test(f));
  const docLines = docs.filter((f) => !packs.includes(f)).reduce((n, f) => n + lineCount(path.join(model.root, f)), 0);
  const packLines = packs.reduce((n, f) => n + lineCount(path.join(model.root, f)), 0);
  let appLines = 0;
  for (const app of [...model.records.values()].filter((r) => r.kind === "app" && r.fields.Path)) {
    const base = String(app.fields.Path).replace(/`/g, "").trim().replace(/\/+$/, "") || ".";
    for (const f of listFiles(model.repo, base === "." ? "" : base)) {
      if (!SOURCE_EXTENSIONS.includes(path.extname(f)) || (projectRel && f.startsWith(`${projectRel}/`))) continue;
      appLines += lineCount(path.join(model.repo, f));
    }
  }
  // Largest Context Pack among tasks still to do in open changes.
  let largest = null;
  const { buildPack, budgetOf } = require("../context.cjs");
  for (const t of status.tasks.values()) {
    if (t.state === "done") continue;
    const change = model.changes.get(model.tasks.get(t.id).change);
    if (!change || ["closed", "cancelled"].includes(change.status)) continue;
    try {
      const p = buildPack(model, status, t.id);
      if (!largest || p.tokens > largest.tokens) largest = { task: t.id, tokens: p.tokens, budget: p.budget };
    } catch {
      // an unbuildable pack is reported by the ready gate, not here
    }
  }
  const { adoption } = require("../commands/adopt.cjs");
  const own = adoption(model);
  return {
    doc_lines: docLines,
    app_lines: appLines,
    ratio: appLines ? Math.round((docLines / appLines) * 100) / 100 : null,
    target_ratio: 1.0,
    saved_pack_lines: packLines,
    largest_pack: largest,
    budget: budgetOf(model),
    source_files: own.files,
    owned_files: own.owned,
  };
}

function healthLines(h) {
  const n = (x) => x.toLocaleString("en-US");
  const out = [];
  out.push(`- Docs vs code: ${n(h.doc_lines)} doc lines / ${n(h.app_lines)} app lines${h.ratio !== null ? ` = ${h.ratio}${h.ratio > h.target_ratio ? ` ⚠ (target ≤ ${h.target_ratio})` : ""}` : ""}`);
  if (h.saved_pack_lines) out.push(`- ⚠ Saved context packs committed: ${n(h.saved_pack_lines)} lines (packs are rebuilt on demand)`);
  if (h.largest_pack) out.push(`- Largest open context pack: ${h.largest_pack.task} ~${n(h.largest_pack.tokens)} of ${n(h.largest_pack.budget)} tokens`);
  if (h.source_files) out.push(`- Code owned by components: ${h.owned_files}/${h.source_files} source files${h.owned_files < h.source_files ? " (royascaff adopt)" : ""}`);
  return out;
}

module.exports = { healthOf, healthLines };
