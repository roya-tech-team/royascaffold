"use strict";

// Step 12c (plan file 14), WP-C2 + WP-C3: quality is planned, foundation first, breadth waits,
// and deferrals name the slice that will do the work. Deterministic checks only.

const fs = require("fs");
const path = require("path");

const LOOK_NOTE = (e) => /^pass\b/i.test(e.note || "") && !/ — .*[✓✗]/.test(e.note || "");

// ---- P2 · quality is planned -------------------------------------------------------------

const priority = (rec) => String((rec && rec.fields.Priority) || "").trim().toLowerCase();

// NFRs of a feature (Feature: / Satisfies: that feature).
function nfrsOf(model, featureId) {
  return (model.incoming.get(featureId) || [])
    .filter((x) => (x.type === "feature" || x.type === "satisfies") && model.records.get(x.from)?.kind === "nfr")
    .map((x) => x.from);
}

// Must NFRs of a feature that no slice delivers.
function unslicedMustNfrs(model, featureId) {
  const delivered = new Set([...model.slices.values()].flatMap((s) => s.delivers));
  return [...new Set(nfrsOf(model, featureId))].filter((id) => priority(model.records.get(id)) === "must" && !delivered.has(id));
}

// A slice that delivers a must NFR is the foundation: it goes first within its priority.
function deliversMustNfr(model, slice) {
  return slice.delivers.some((id) => model.records.get(id)?.kind === "nfr" && priority(model.records.get(id)) === "must");
}

// ---- P4 · breadth waits ------------------------------------------------------------------

function humanLooked(change) {
  const { isHuman } = require("./approvals.cjs");
  const events = change.events || [];
  const lastDone = events.reduce((at, e, i) => (e.event === "task.done" ? i : at), -1);
  return events.some((e, i) => i > lastDone && e.event === "check.run" && isHuman(e.by) && LOOK_NOTE(e));
}

function usesWebUi(model) {
  const { adaptersOf } = require("./adapters.cjs");
  return require("./smoke.cjs").usesWebUi(model);
}

// Accepted = ✅ Done (or 🚀 Released) and, for web-ui projects, a person looked at the last
// change of the feature. Returns { accepted, reason, change }.
function acceptance(model, status, featureId) {
  const d = status.features.get(featureId);
  if (!d || !["done", "released"].includes(d.state)) return { accepted: false, reason: `not done yet (${d ? d.state : "unknown"})` };
  if (!usesWebUi(model)) return { accepted: true };
  const feature = model.features.get(featureId);
  const changes = [...model.changes.values()].filter((c) => c.status === "closed" && c.slices.some((s) => feature.slices.includes(s))).sort((a, b) => a.id.localeCompare(b.id));
  const last = changes[changes.length - 1];
  if (!last || humanLooked(last)) return { accepted: true };
  return { accepted: false, reason: `done, waiting for a person's look at ${last.id}`, change: last.id };
}

// Now features (with a plan) that are not yet Done and accepted. Only 1.4 projects.
function nowWaits(model, status) {
  if (!model.is14) return [];
  const out = [];
  for (const f of model.features.values()) {
    if (f.horizon !== "now") continue;
    const d = status.features.get(f.id);
    if (!d || d.state === "idea") continue;
    const a = acceptance(model, status, f.id);
    if (!a.accepted) out.push({ id: f.id, reason: a.reason, change: a.change || null });
  }
  return out;
}

// ---- P3 · deferrals ----------------------------------------------------------------------

const VAGUE = /\b(later slices?|future slices?|(in )?a later change|(in )?a future change|later changes|not in this slice|(to|for|until) later)\b/i;

function afterState(body) {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => /^##\s+(After-state|After state|Proposed after-state)\s*$/i.test(l.trim()));
  if (start < 0) return [];
  const out = [];
  for (let i = start + 1; i < lines.length && !/^##\s/.test(lines[i]); i += 1) out.push({ n: i + 1, text: lines[i] });
  return out;
}

function changeBodyLines(model, change) {
  try {
    const text = fs.readFileSync(path.join(model.root, change.file), "utf8");
    const fm = text.match(/^---\n[\s\S]*?\n---\n?/);
    const offset = fm ? fm[0].split("\n").length - 1 : 0;
    return afterState(text.replace(/^---\n[\s\S]*?\n---\n?/, "")).map((l) => ({ ...l, n: l.n + offset }));
  } catch {
    return [];
  }
}

// Vague deferral wording (no SLC- ID on the same line) in some lines.
function vagueLines(lines) {
  return lines.filter((l) => VAGUE.test(l.text) && !/\bSLC-[A-Z0-9-]+/.test(l.text) && !/^\s*_.*_\s*$/.test(l.text));
}

// Every deferral in the project: { slice, from, where } — from records (`Deferred to:`) and
// from `Deferred to: SLC-…` lines in change After-states.
function deferrals(model) {
  const out = [];
  for (const rec of model.records.values()) {
    for (const rel of rec.relations) if (rel.type === "deferred_to") out.push({ slice: rel.to, from: rec.id, where: `${rec.file}:${rec.line}` });
  }
  for (const change of model.changes.values()) {
    for (const l of changeBodyLines(model, change)) {
      const m = l.text.match(/Deferred to:\**\s*(.+)$/i);
      if (!m) continue;
      for (const id of m[1].match(/\bSLC-[A-Z0-9]+(?:-[A-Z0-9]+)*/g) || []) out.push({ slice: id, from: change.id, where: `${change.file}:${l.n}` });
    }
  }
  return out;
}

function deferralIssues(model, issue) {
  const sliceDone = (id) => {
    const s = model.slices.get(id);
    const c = s && s.change ? model.changes.get(s.change) : null;
    return Boolean(c && c.status === "closed");
  };
  for (const d of deferrals(model)) {
    if (!model.slices.has(d.slice)) issue("error", "deferred-to-missing-slice", `${d.from} defers work to ${d.slice}, which is not a slice on the roadmap`, d.where);
    else if (sliceDone(d.slice)) issue("warning", "deferred-to-finished-slice", `${d.from} defers work to ${d.slice}, which is already done: do it in a new slice or drop it`, d.where);
  }
  for (const change of model.changes.values()) {
    if (["closed", "cancelled"].includes(change.status)) continue;
    for (const l of vagueLines(changeBodyLines(model, change))) issue("warning", "vague-deferral", `${change.id} defers work without naming the slice ("${l.text.trim().slice(0, 60)}"): write Deferred to: SLC-…`, `${change.file}:${l.n}`);
  }
  for (const rec of model.records.values()) {
    if (rec.kind !== "decision") continue;
    const text = [rec.body || "", ...Object.values(rec.fields)].join("\n");
    const lines = text.split("\n").map((t, i) => ({ n: i, text: t }));
    if (vagueLines(lines).length) issue("warning", "vague-deferral", `${rec.id} defers work without naming the slice: write - **Deferred to:** SLC-…`, `${rec.file}:${rec.line}`);
  }
}

module.exports = { nfrsOf, unslicedMustNfrs, deliversMustNfr, acceptance, nowWaits, humanLooked, deferrals, deferralIssues, vagueLines, afterState, VAGUE };
