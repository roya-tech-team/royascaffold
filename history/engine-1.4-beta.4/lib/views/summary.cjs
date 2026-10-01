"use strict";

// Summary blocks: a generated table between
//   <!-- royascaff:summary:start --> and <!-- royascaff:summary:end -->
// inside a catalog file. Opt-in: the CLI only refreshes files that already contain both
// markers (templates include them). Everything outside the markers is never touched.

const fs = require("fs");
const path = require("path");
const { LABELS } = require("../derive/status.cjs");
const { escapeCell } = require("../model/tables.cjs");

const START = "<!-- royascaff:summary:start -->";
const END = "<!-- royascaff:summary:end -->";

function stateLabel(status, id) {
  const d = status.features.get(id) || status.requirements.get(id) || status.slices.get(id);
  return d ? LABELS[d.state] : "—";
}

function summaryTable(model, status, relFile) {
  const recs = [...model.records.values()].filter((r) => r.file === relFile && r.origin === "record");
  if (!recs.length) return "_No records yet._";
  const rel = (r, type) => r.relations.filter((x) => x.type === type).map((x) => x.to).join(", ") || "—";
  const rows = recs.map((r) => `| ${escapeCell(r.id)} | ${escapeCell(r.title)} | ${escapeCell(r.kind)} | ${stateLabel(status, r.id)} | ${escapeCell(rel(r, "feature"))} | ${escapeCell(rel(r, "verified_by"))} |`);
  return ["| ID | Title | Kind | State | Feature | Verified by |", "|---|---|---|---|---|---|", ...rows].join("\n");
}

function refreshSummaries(projectDir, files, model, status) {
  const updated = [];
  for (const { full, rel } of files) {
    const text = fs.readFileSync(full, "utf8");
    const a = text.indexOf(START);
    const b = text.indexOf(END);
    if (a < 0 || b < a) continue;
    const next = `${text.slice(0, a + START.length)}\n${summaryTable(model, status, rel)}\n${text.slice(b)}`;
    if (next !== text) {
      fs.writeFileSync(full, next);
      updated.push(rel);
    }
  }
  return updated;
}

module.exports = { refreshSummaries, summaryTable, START, END };
