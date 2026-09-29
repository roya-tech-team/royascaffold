"use strict";

// `next` — the single "what now" answer — and `brief`, the one-page resume for a new session.

const { buildModel } = require("../model/graph.cjs");
const { deriveStatus, LABELS, STAGE_LABELS } = require("../derive/status.cjs");
const { nextActions } = require("../next/actions.cjs");
const { computeDrift } = require("../derive/drift.cjs");

function nextCommand(start) {
  let model;
  try {
    model = buildModel(start);
  } catch (error) {
    if (/No RoyaScaff project found/.test(error.message)) {
      return { kind: "start", text: "No RoyaScaff project here. New product: say \"royascaff start\". Existing code: say \"royascaff adopt\".", card: "understand.md", say: "royascaff start" };
    }
    throw error;
  }
  const status = deriveStatus(model);
  const actions = nextActions(model, status, computeDrift(model, status));
  const first = actions[0];
  const { gate, ...rest } = first;
  return {
    ...rest,
    gate: gate ? { to: gate.to, ok: gate.ok, checks: gate.checks.map((c) => ({ id: c.id, ok: c.ok, message: c.message, ...(c.pending ? { pending: c.pending } : {}) })) } : undefined,
    others: actions.slice(1).map((a) => a.text),
  };
}

function briefCommand(start, changeId) {
  const model = buildModel(start);
  const status = deriveStatus(model);
  const actions = nextActions(model, status, computeDrift(model, status));
  const target = changeId || (actions.find((a) => a.change) || {}).change || null;
  const lines = [];
  const name = model.profile.project_name || model.code;
  lines.push(`# Brief · ${name}`, "");
  lines.push("## Next action", "", `${actions[0].text}`);
  if (actions[0].card) lines.push(`Read the stage card: \`${actions[0].card}\``);
  if (actions.length > 1) lines.push("", "Then:", ...actions.slice(1, 4).map((a) => `- ${a.text}`));
  lines.push("");
  if (target) {
    const change = model.changes.get(target);
    if (!change) throw new Error(`${target} is not a change in this project`);
    const c = status.changes.get(target);
    const slice = change.slice ? model.slices.get(change.slice) : null;
    const feature = slice ? model.records.get(slice.feature) : null;
    const others = change.slices.slice(1);
    lines.push(`## ${target} · ${change.title}`, "");
    lines.push(`- Kind: ${change.kind} · risk: ${change.risk || "—"} · status: ${change.status} · stage: ${c.blocked ? "⛔ blocked · " : ""}${STAGE_LABELS[c.stage]}`);
    if (slice) lines.push(`- Delivers slice ${slice.id} · ${slice.title} of ${feature ? `${feature.id} · ${feature.title}` : slice.feature} (requirements: ${slice.delivers.join(", ") || "—"})${others.length ? `, and ${others.join(", ")}` : ""}`);
    if (change.affects.length) lines.push(`- Affects: ${change.affects.join(", ")}`);
    const a = actions.find((x) => x.change === target);
    if (a && a.gate) {
      lines.push(`- Gate to "${a.gate.to}": ${a.gate.ok ? "✓ ready" : "not yet"}`);
      for (const ch of a.gate.checks) lines.push(`  - ${ch.ok ? "✓" : "✗"} ${ch.message}${ch.pending ? " (pending)" : ""}`);
    }
    lines.push("", `### Tasks (${c.tasksDone}/${c.tasksTotal} done)`, "");
    if (!change.tasks.length) lines.push("_No tasks yet._");
    for (const tid of change.tasks) {
      const t = status.tasks.get(tid);
      lines.push(`- ${t.state.padEnd(7)} ${tid} · ${model.records.get(tid).title}${t.last && t.last.note ? ` — ${t.last.note}` : ""}`);
    }
    const events = (change.events || []).slice(-5);
    lines.push("", "### Recent history", "");
    if (!events.length) lines.push("_No events yet._");
    for (const e of events) lines.push(`- ${e.when} ${e.event} ${e.target} by ${e.by}${e.note ? ` — ${e.note}` : ""}`);
    lines.push("", "### Read before working", "");
    lines.push(`- \`${change.dir}/change.md\` — Outcome, Impact, After-state`);
    if (change.tasks.length) lines.push(`- \`${change.dir}/plan.md\` — the task you work on (inputs, allowed paths, checks)`);
    const nextTask = a && a.task ? model.records.get(a.task) : null;
    if (nextTask) {
      const inputs = nextTask.relations.filter((r) => r.type === "inputs").map((r) => r.to);
      if (inputs.length) lines.push(`- Inputs of ${nextTask.id}: ${inputs.map((i) => `${i}${model.records.get(i) ? ` (${model.records.get(i).file})` : ""}`).join(", ")}`);
    }
  } else {
    const f = [...model.features.values()].map((x) => status.features.get(x.id));
    lines.push("## Project", "", `- Features: ${f.length} · done ${f.filter((x) => x.state === "done" || x.state === "released").length} · in progress ${f.filter((x) => ["building", "designing", "partly-done"].includes(x.state)).length} · planned ${f.filter((x) => x.state === "planned").length}`);
    lines.push("- Board: `project/STATUS.md`");
  }
  lines.push("");
  const text = lines.join("\n");
  return { change: target, text, approx_tokens: Math.ceil(text.length / 4) };
}

module.exports = { nextCommand, briefCommand, LABELS };
