"use strict";

// The separate judge (plan file 01 §4, E1.3). The judge is an AI session outside the engine. The engine
// builds its pack (requirements, design, diff, evidence, screenshots), and records and checks its verdicts:
//
//   - a verdict per acceptance line: met, not-met or unclear, with a reason;
//   - recorded as evidence of kind `judge`, with the judge's identity (ai:<tool>:judge, or a person);
//   - the identity that built the change's tasks cannot judge it;
//   - a high or critical risk change needs `met` for every must line before `verified`;
//   - `unclear` goes to a person: an AI cannot turn an unclear line into met;
//   - a verdict belongs to the code it saw (its fingerprint): when the code changes, it is stale.

const fs = require("fs");
const path = require("path");
const { acceptanceOf, judgeLines, scopeOf } = require("./acceptance.cjs");

const VERDICTS = ["met", "not-met", "unclear"];
const JUDGE_ID = /^ai:[^:\s]+:judge$/;
const DEMANDING = ["high", "critical"];
const BULLET = /^- (\S+#\d+) · (met|not-met|unclear) · (.*)$/;

const priorityOf = (rec) => String((rec && rec.fields.Priority) || "").trim().toLowerCase();

// Who built the tasks of the change: the identities on its task events.
function builders(change) {
  return new Set((change.events || []).filter((e) => /^task\.(started|done)$/.test(e.event) && e.by && e.by !== "unknown").map((e) => e.by));
}

// Every line a judge can speak about: [{ key, req, must, type, text }].
function linesOf(model, change) {
  const out = [];
  for (const rec of scopeOf(model, change)) for (const l of judgeLines(rec)) out.push({ key: l.key, req: rec.id, must: priorityOf(rec) === "must", type: l.type, text: l.text, implicit: Boolean(l.implicit) });
  return out;
}

// The latest fresh verdict per line, from the judge evidence records of the change: Map key -> { verdict, reason, by, evidence }.
function verdictsOf(model, change, fingerprint) {
  const out = new Map();
  const records = [...model.evidence.values()].filter((e) => e.change === change.id && e.kind === "judge" && e.fingerprint === fingerprint).sort((a, b) => a.id.localeCompare(b.id));
  for (const e of records) {
    const rec = model.records.get(e.id);
    const by = String((rec.fields.Judge || "")).trim();
    for (const row of String(rec.body || "").split("\n")) {
      const m = row.match(BULLET);
      if (m) out.set(m[1], { verdict: m[2], reason: m[3], by, evidence: e.id });
    }
  }
  return out;
}

// What the verified gate needs from the judge.
function gateState(model, change) {
  const lines = linesOf(model, change);
  const must = lines.filter((l) => l.must);
  const needed = DEMANDING.includes(change.risk) && must.length > 0;
  const fp = require("./fingerprint.cjs").fingerprintOf(model, change).hash;
  const verdicts = verdictsOf(model, change, fp);
  const relevant = needed || [...verdicts.values()].some((v) => v.verdict === "not-met");
  const required = needed ? must : [];
  const missing = required.filter((l) => !verdicts.has(l.key)).map((l) => l.key);
  const notMet = lines.filter((l) => (verdicts.get(l.key) || {}).verdict === "not-met").map((l) => l.key);
  const unclear = lines.filter((l) => (verdicts.get(l.key) || {}).verdict === "unclear" && (needed ? l.must : true)).map((l) => l.key);
  const ok = !missing.length && !notMet.length && !unclear.length;
  return { relevant, needed, required: required.map((l) => l.key), missing, notMet, unclear, ok, fingerprint: fp, verdicts };
}

// The gate check for `verified` (see gates.cjs), or null when the judge has no say.
function gateCheck(model, change) {
  const s = gateState(model, change);
  if (!s.relevant) return null;
  const parts = [];
  if (s.notMet.length) parts.push(`the judge found these not met: ${s.notMet.join(", ")}`);
  if (s.unclear.length) parts.push(`these are unclear and go to a person: ${s.unclear.join(", ")} (royascaff judge ${change.id} --line <line> --verdict met|not-met --reason "…" --by <your name>)`);
  if (s.missing.length) parts.push(`risk ${change.risk} needs a judge verdict of met for every must line: still missing ${s.missing.join(", ")} (royascaff judge ${change.id} builds the pack for a separate AI session)`);
  const onlyUnclear = s.unclear.length > 0 && !s.notMet.length && !s.missing.length;
  return {
    id: "judge",
    ok: s.ok,
    message: s.ok ? `the judge found every must line met (${s.required.length})` : parts.join("; "),
    judge: true,
    ...(onlyUnclear ? { approval: true, say: `royascaff judge ${change.id} --line ${s.unclear[0]} --verdict met|not-met --reason "…"` } : {}),
  };
}

// The latest machine result per line, from the newest fresh verify evidence: Map key -> result.
function machineResults(model, change, fingerprint) {
  const out = new Map();
  const verifies = [...model.evidence.values()].filter((e) => e.change === change.id && e.kind === "verify" && e.fingerprint === fingerprint).sort((a, b) => a.id.localeCompare(b.id));
  const last = verifies[verifies.length - 1];
  if (!last) return out;
  for (const row of String(model.records.get(last.id).body || "").split("\n")) {
    const m = row.match(/^- (\S+#\d+) · \S+ · (pass|fail|pending)/);
    if (m) out.set(m[1], m[2]);
  }
  return out;
}

function sectionOf(text, names) {
  const { section } = require("./gates.cjs");
  return section(text, names);
}

const PACK_DIFF_LIMIT = 60000;

// The judge pack: everything a second session needs to judge the change, as one Markdown text.
function buildPack(model, status, change) {
  const { changeBody } = require("./gates.cjs");
  const fpInfo = require("./fingerprint.cjs").fingerprintOf(model, change);
  const machine = machineResults(model, change, fpInfo.hash);
  const built = [...builders(change)];
  const lines = [];
  lines.push(`# Judge pack · ${change.id} · ${change.title}`, "");
  lines.push(`> Kind ${change.kind} · risk ${change.risk} · status ${change.status} · fingerprint ${fpInfo.hash}`, "");
  lines.push("## How to judge", "");
  lines.push("You are not the builder. Judge each line below against the requirement, the design and the evidence, from this pack and the code. Do not trust the builder's notes.");
  lines.push(`- Built by: ${built.join(", ") || "unknown"}. Your identity must differ from these, and an AI judge uses \`ai:<tool>:judge\`.`);
  lines.push("- For every line give a verdict: `met`, `not-met` or `unclear`, and a reason. Say `unclear` when you cannot tell: it goes to a person.");
  lines.push("- Write the verdicts as JSON, then record them:");
  lines.push("", "```json", JSON.stringify({ judge: "ai:<tool>:judge", verdicts: [{ line: linesOf(model, change)[0] ? linesOf(model, change)[0].key : "REQ-…#1", verdict: "met", reason: "what you saw" }] }, null, 2), "```", "");
  lines.push(`  royascaff judge ${change.id} --verdict-file <file> --by ai:<tool>:judge`, "");
  lines.push("## Requirements and lines to judge", "");
  for (const rec of scopeOf(model, change)) {
    lines.push(`### ${rec.id} — ${rec.title} (${priorityOf(rec) || "no priority"})`, "");
    const body = String(rec.body || "").trim();
    if (body) lines.push(body, "");
    lines.push("Lines to judge:", "");
    for (const l of judgeLines(rec)) lines.push(`- ${l.key} [${l.type || "untyped"}] ${l.text}${machine.has(l.key) ? ` — machine result: ${machine.get(l.key)}` : ""}${l.implicit ? " (the requirement has no acceptance lines: judge it as a whole)" : ""}`);
    lines.push("");
  }
  const after = sectionOf(changeBody(model.root, change), ["After-state", "After state", "Proposed after-state"]);
  lines.push("## Design (the change's After-state)", "", after && after.trim() ? after.trim() : "_Not written._", "");
  lines.push("## Evidence", "");
  const evs = [...model.evidence.values()].filter((e) => e.change === change.id).sort((a, b) => a.id.localeCompare(b.id));
  if (!evs.length) lines.push("_No evidence yet: run royascaff verify first._");
  for (const e of evs) lines.push(`- ${e.id} · ${e.kind} · ${e.result}${status.stale && status.stale.has(e.id) ? " · STALE (the code changed since it ran)" : ""}${e.proves.length ? ` · proves ${e.proves.join(", ")}` : ""}`);
  lines.push("");
  const shots = require("./smoke.cjs").latestShots(model, change);
  lines.push("## Screenshots", "", shots.length ? shots.map((s) => `- ${s}`).join("\n") : "_None._", "");
  lines.push("## Changes", "");
  lines.push(...diffOf(model, change, fpInfo.coverage));
  lines.push("");
  return { text: lines.join("\n"), fingerprint: fpInfo.hash, builders: built };
}

function diffOf(model, change, coverage) {
  const drift = require("./derive/drift.cjs");
  const { git: runGit, resolve } = require("./git.cjs");
  if (drift.gitEnabled(model)) {
    const opened = (change.events || []).find((e) => e.event === "change.opened");
    const base = opened && resolve(model.repo, opened.git);
    const projectRel = drift.context(model).projectRel || "project";
    if (base) {
      const diff = runGit(model.repo, ["diff", "-U3", base, "--", ".", `:(exclude)${projectRel}`]) || "";
      if (diff.trim()) return ["```diff", diff.length > PACK_DIFF_LIMIT ? `${diff.slice(0, PACK_DIFF_LIMIT)}\n… (cut at ${PACK_DIFF_LIMIT} characters: read the files)` : diff, "```"];
    }
  }
  return ["No diff available (no git history for this change). The files its evidence covers:", "", ...coverage.files.slice(0, 80).map((f) => `- ${f}`), ...(coverage.files.length > 80 ? [`- … and ${coverage.files.length - 80} more`] : [])];
}

module.exports = { VERDICTS, JUDGE_ID, DEMANDING, builders, linesOf, verdictsOf, gateState, gateCheck, buildPack, machineResults, BULLET };
