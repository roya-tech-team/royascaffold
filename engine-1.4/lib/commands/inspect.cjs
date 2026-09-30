"use strict";

// Read-only commands: `validate` and `show`.

const { buildModel, errorsOf } = require("../model/graph.cjs");
const { deriveStatus, LABELS } = require("../derive/status.cjs");
const { computeDrift } = require("../derive/drift.cjs");

function validateCommand(start) {
  const model = buildModel(start);
  const errors = errorsOf(model);
  const warnings = model.issues.filter((i) => i.severity === "warning");
  return {
    ok: errors.length === 0,
    counts: { records: model.records.size, features: model.features.size, slices: model.slices.size, changes: model.changes.size, tasks: model.tasks.size, errors: errors.length, warnings: warnings.length },
    issues: model.issues,
  };
}

function titleOf(model, id) {
  const r = model.records.get(id);
  return r ? `${id} · ${r.title}` : `${id} (missing)`;
}

function showRecord(start, id) {
  const model = buildModel(start);
  const rec = model.records.get(id);
  if (!rec) throw new Error(`${id} not found`);
  const status = deriveStatus(model);
  const out = {
    id: rec.id,
    kind: rec.kind,
    title: rec.title,
    source: `${rec.file}:${rec.line}`,
    fields: rec.fields,
    relations: rec.relations.map((r) => ({ type: r.type, to: r.to })),
    incoming: model.incoming.get(id) || [],
    mentions: rec.mentions,
  };
  if (model.features.has(id)) {
    const f = model.features.get(id);
    out.feature = {
      horizon: f.horizon,
      milestone: f.milestone,
      slices: f.slices.map((s) => ({ ...model.slices.get(s) })),
      requirements: (model.incoming.get(id) || []).filter((x) => (x.type === "feature" || x.type === "satisfies") && ["requirement", "nfr", "use-case"].includes(model.records.get(x.from)?.kind)).map((x) => x.from),
    };
  }
  if (model.slices.has(id)) out.slice = { ...model.slices.get(id) };
  if (model.changes.has(id)) {
    const { events, ...change } = model.changes.get(id);
    out.change = change;
    out.events = events;
  }
  if (model.tasks.has(id)) out.task = { ...model.tasks.get(id) };
  const derived = status.features.get(id) || status.requirements.get(id) || status.slices.get(id) || status.changes.get(id) || status.tasks.get(id) || null;
  if (derived) out.status = derived;
  const drift = computeDrift(model, status);
  if (drift.changedSinceVerified.has(id)) out.changedSinceVerified = drift.changedSinceVerified.get(id);
  if (drift.featureChanged.has(id)) out.changedSinceVerified = { requirements: drift.featureChanged.get(id) };
  if (drift.refinement.has(id)) out.refinement = drift.refinement.get(id);
  out.text = renderShow(model, out, status);
  return out;
}

function stateOf(status, id) {
  const d = status.features.get(id) || status.requirements.get(id) || status.slices.get(id);
  if (d) return LABELS[d.state];
  const c = status.changes.get(id);
  if (c) return `${c.blocked ? "⛔ " : ""}${c.stageLabel}`;
  const t = status.tasks.get(id);
  return t ? t.state : "";
}

function renderShow(model, o, status) {
  const head = `${o.id} · ${o.title}   [${o.kind}]`;
  const lines = [o.status ? `${head}   ${stateOf(status, o.id)}` : head, `  source: ${o.source}`];
  const fieldText = Object.entries(o.fields).filter(([k]) => !["Kind", "Knowledge status", "Implementation status"].includes(k)).map(([k, v]) => `${k}: ${v}`);
  if (fieldText.length) lines.push(`  ${fieldText.join(" · ")}`);
  if (o.feature) {
    const f = status.features.get(o.id);
    lines.push(`  horizon: ${o.feature.horizon} · depth: ${f.depth}${o.feature.milestone ? ` · milestone: ${o.feature.milestone}` : ""}`);
    lines.push(`  slices ${f.slicesDone}/${f.slicesTotal} done:`);
    for (const s of o.feature.slices) {
      const c = s.change ? status.changes.get(s.change) : null;
      lines.push(`    ${stateOf(status, s.id)}  ${s.id} · ${s.title} · delivers ${s.delivers.join(", ") || "—"}${c ? ` · ${s.change} ${c.stageLabel} (tasks ${c.tasksDone}/${c.tasksTotal})` : " · no change yet"}`);
    }
    lines.push(`  requirements ${f.requirementsDone}/${f.requirementsTotal} done:`);
    for (const r of f.requirements) {
      const d = status.requirements.get(r);
      lines.push(`    ${LABELS[d.state]}  ${r} · ${model.records.get(r).title}${d.evidence.length ? ` · evidence ${d.evidence.join(", ")}` : ""}${d.missingEvidence ? " · ⚠ no passing evidence" : ""}`);
    }
    if (f.openFixes.length) lines.push(`  open fixes: ${f.openFixes.join(", ")}`);
  }
  if (o.status && status.requirements.has(o.id)) {
    const d = status.requirements.get(o.id);
    lines.push(`  slices: ${d.slices.join(", ") || "none (not planned yet)"} · evidence: ${d.evidence.join(", ") || "none"}${d.openFixes.length ? ` · open fixes: ${d.openFixes.join(", ")}` : ""}`);
  }
  if (o.slice) lines.push(`  feature: ${titleOf(model, o.slice.feature)} · order ${o.slice.order ?? "—"} · planned at ${o.slice.planned_at || "—"} · change: ${o.slice.change || "none"}`);
  if (o.change) {
    const c = status.changes.get(o.id);
    lines.push(`  kind: ${o.change.kind} · status: ${o.change.status} · risk: ${o.change.risk || "—"} · ${o.change.slices.length ? `slice ${o.change.slices.join(", ")}` : `affects ${o.change.affects.join(", ") || "—"}`}`);
    lines.push(`  tasks ${c.tasksDone}/${c.tasksTotal} done:`);
    for (const t of o.change.tasks) {
      const ts = status.tasks.get(t);
      lines.push(`    ${ts.state.padEnd(7)} ${t} · ${model.records.get(t).title}${ts.last && ts.last.note ? ` — ${ts.last.note}` : ""}`);
    }
    if (o.events && o.events.length) {
      lines.push(`  history (${o.events.length} events, last 3):`);
      for (const e of o.events.slice(-3)) lines.push(`    ${e.when}  ${e.event}  ${e.target}  by ${e.by}${e.note ? ` — ${e.note}` : ""}`);
    }
  }
  if (o.task) lines.push(`  change: ${o.task.change || "none"}${o.task.depends_on.length ? ` · depends on ${o.task.depends_on.join(", ")}` : ""}`);
  if (o.changedSinceVerified) lines.push(o.changedSinceVerified.files ? `  ⚠️ changed since verified (${o.changedSinceVerified.since}): ${o.changedSinceVerified.files.join(", ")}` : `  ⚠️ changed since verified: ${o.changedSinceVerified.requirements.join(", ")}`);
  if (o.refinement && o.refinement.state === "needs") lines.push(`  ⚠ needs refinement: ${o.refinement.changed.join(", ")} changed since planned (${o.refinement.base})`);
  if (o.relations.length) {
    lines.push("  links:");
    for (const r of o.relations) lines.push(`    ${r.type} → ${titleOf(model, r.to)}`);
  }
  if (o.incoming.length) {
    lines.push("  linked from:");
    for (const r of o.incoming) lines.push(`    ${titleOf(model, r.from)} (${r.type})`);
  }
  if (o.mentions.length) lines.push(`  mentions: ${o.mentions.join(", ")}`);
  return lines.join("\n");
}

module.exports = { validateCommand, showRecord };
