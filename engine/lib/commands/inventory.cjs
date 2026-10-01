"use strict";

// `inventory [--json]` (plan file 01 §7, E4.1): what the project holds and what needs attention, in one view:
// records per knowledge layer, stale evidence, inferred records waiting for a person, code no component owns,
// changes in the repair loop, and the adapters with their check kinds.

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { deriveStatus } = require("../derive/status.cjs");
const K = require("../knowledge.cjs");
const adapters = require("../adapters.cjs");
const inferred = require("../inferred.cjs");
const repair = require("../repair.cjs");
const { adoption } = require("./adopt.cjs");

// The facts, from a model already built (the board uses this too).
function inventoryOf(model, status) {
  const policy = adapters.policy(model);
  const byFile = new Map();
  const byKind = {};
  for (const r of model.records.values()) {
    byKind[r.kind] = (byKind[r.kind] || 0) + 1;
    byFile.set(r.file, (byFile.get(r.file) || 0) + 1);
  }
  const layers = K.LAYERS.map((l) => {
    const pages = K.docsForLayer(model, l.id).filter((d) => fs.existsSync(path.join(model.root, d.file))).map((d) => ({ file: d.file, records: byFile.get(d.file) || 0 }));
    return { layer: l.id, label: l.label, records: l.kinds.reduce((n, k) => n + (byKind[k] || 0), 0), pages };
  });
  const stale = require("../fingerprint.cjs").outstandingStale(model, status.stale || new Set()).map((id) => ({ id, change: (model.evidence.get(id) || {}).change || null })).sort((a, b) => a.id.localeCompare(b.id));
  const unowned = model.is14 ? adoption(model).modules.filter((m) => m.files > m.owned) : [];
  const repairs = [];
  for (const c of model.changes.values()) {
    if (["closed", "cancelled"].includes(c.status)) continue;
    const s = repair.stateOf(model, c);
    const lastBlock = (c.events || []).filter((e) => e.target === c.id && /^change\.(un)?blocked$/.test(e.event)).pop();
    const blocked = Boolean(lastBlock && repair.isRepairBlock(lastBlock));
    if (s.pending || blocked) repairs.push({ change: c.id, attempt: s.failures, limit: s.limit, failing: s.failing, blocked });
  }
  const stages = { open: 0, blocked: 0, closed: 0 };
  for (const c of model.changes.values()) {
    const d = status.changes.get(c.id);
    if (d.stage === "closed") stages.closed += 1;
    else if (d.stage !== "cancelled") stages.open += 1;
    if (d.blocked) stages.blocked += 1;
  }
  return {
    records: { total: model.records.size, by_kind: Object.fromEntries(Object.entries(byKind).sort(([a], [b]) => a.localeCompare(b))) },
    layers,
    changes: stages,
    stale_evidence: stale,
    unconfirmed: inferred.unconfirmed(model),
    unowned_code: { files: unowned.reduce((n, m) => n + (m.files - m.owned), 0), modules: unowned.map((m) => ({ module: m.module, unowned: m.files - m.owned })) },
    open_repairs: repairs,
    person_check: policy.personCheck ? { kind: policy.personCheck.kind, bar: policy.personCheck.bar } : null,
    adapters: policy.adapters.map((n) => {
      const m = adapters.manifest(n, model.root);
      return { name: n, checks: Object.keys(m.checks || {}), person_check: m.personCheck ? m.personCheck.kind : m.visualBar ? "visual" : null, layers: (m.layers && m.layers.requires) || [] };
    }),
  };
}

function textOf(inv) {
  const lines = [`Records: ${inv.records.total} (${Object.entries(inv.records.by_kind).map(([k, v]) => `${v} ${k}`).join(", ")})`];
  lines.push("Per layer:", ...inv.layers.filter((l) => l.records || l.pages.length).map((l) => `  ${l.label.padEnd(22)} ${String(l.records).padStart(3)} record(s) · ${l.pages.length ? l.pages.map((p) => p.file).join(", ") : "no page yet"}`));
  lines.push(`Changes: ${inv.changes.open} open, ${inv.changes.blocked} blocked, ${inv.changes.closed} closed`);
  lines.push(`Stale evidence: ${inv.stale_evidence.length}${inv.stale_evidence.length ? ` (${inv.stale_evidence.map((e) => `${e.id} of ${e.change}`).join(", ")}): run royascaff verify` : ""}`);
  lines.push(`Unconfirmed inferred records: ${inv.unconfirmed.length}${inv.unconfirmed.length ? ` (${inv.unconfirmed.slice(0, 8).map((u) => u.id).join(", ")}${inv.unconfirmed.length > 8 ? ", …" : ""}): a person runs royascaff confirm` : ""}`);
  lines.push(inv.unowned_code.files ? `Unowned code: ${inv.unowned_code.files} file(s) in ${inv.unowned_code.modules.length} module(s) (${inv.unowned_code.modules.slice(0, 5).map((m) => `${m.module} ${m.unowned}`).join(", ")}${inv.unowned_code.modules.length > 5 ? ", …" : ""}): royascaff adopt` : "Unowned code: none");
  lines.push(`Open repairs: ${inv.open_repairs.length}${inv.open_repairs.length ? ` (${inv.open_repairs.map((r) => `${r.change}${r.blocked ? " blocked" : ` attempt ${r.attempt} of ${r.limit}`}`).join(", ")})` : ""}`);
  lines.push(`Adapters: ${inv.adapters.map((a) => `${a.name} [${a.checks.join(", ") || "no checks"}${a.person_check ? `; person's check: ${a.person_check}` : ""}]`).join(" · ")}`);
  return lines.join("\n");
}

function inventoryCommand(start) {
  const model = buildModel(start);
  const inv = inventoryOf(model, deriveStatus(model));
  return { ...inv, text: textOf(inv) };
}

module.exports = { inventoryCommand, inventoryOf, textOf };
