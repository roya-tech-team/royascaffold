"use strict";

// Local usage counters (Q21): on by default, stored only on this machine in
// project/.usage/usage.jsonl (self-ignored by git), shared only when the developer runs
// `royascaff feedback`. Only command shapes are recorded: command, sub-command, duration,
// result, and the IDs of failed gate checks. Never notes, titles, paths or file contents.
// Off with `usage_counters: off` in profile.md, or ROYASCAFF_USAGE=off.

const fs = require("fs");
const path = require("path");

function usageDir(projectDir) {
  const dir = path.join(projectDir, ".usage");
  fs.mkdirSync(dir, { recursive: true });
  const ignore = path.join(dir, ".gitignore");
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, "# RoyaScaff local usage counters and feedback drafts: never committed.\n*\n");
  return dir;
}

function enabled(profile = {}) {
  if (String(process.env.ROYASCAFF_USAGE || "").toLowerCase() === "off") return false;
  return String(profile.usage_counters || "on").toLowerCase() !== "off";
}

function recordUsage(projectDir, entry) {
  const clean = {
    t: new Date().toISOString(),
    cmd: String(entry.cmd || ""),
    sub: entry.sub ? String(entry.sub) : undefined,
    ms: Math.round(entry.ms || 0),
    result: entry.result,
    failed_checks: entry.failed_checks && entry.failed_checks.length ? entry.failed_checks.map(String) : undefined,
  };
  fs.appendFileSync(path.join(usageDir(projectDir), "usage.jsonl"), `${JSON.stringify(clean)}\n`);
}

function readUsage(projectDir) {
  const file = path.join(projectDir, ".usage", "usage.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

// Time spent in each status, from the change logs (hours). Works for every project with logs.
function stageDurations(model) {
  const per = {};
  const stuck = [];
  const now = Date.now();
  for (const change of model.changes.values()) {
    const events = change.events || [];
    const opened = events.find((e) => e.event === "change.opened");
    if (!opened) continue;
    let status = "draft";
    let since = Date.parse(opened.when);
    for (const e of events) {
      if (e.event !== "change.advanced") continue;
      const m = (e.note || "").match(/^([a-z-]+) → ([a-z-]+)/);
      if (!m) continue;
      const at = Date.parse(e.when);
      (per[status] = per[status] || []).push((at - since) / 3600000);
      status = m[2];
      since = at;
    }
    if (!["closed", "cancelled"].includes(status)) {
      const hours = (now - since) / 3600000;
      stuck.push({ change: change.id, status, hours: Math.round(hours * 10) / 10 });
    }
  }
  const median = (xs) => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? Math.round((s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) * 10) / 10 : null;
  };
  const stages = Object.fromEntries(Object.entries(per).map(([k, v]) => [k, { changes: v.length, median_hours: median(v), max_hours: Math.round(Math.max(...v) * 10) / 10 }]));
  return { stages, open: stuck.sort((a, b) => b.hours - a.hours) };
}

function summarizeUsage(entries) {
  const byCommand = {};
  const refusals = {};
  let refused = 0;
  for (const e of entries) {
    const key = e.sub ? `${e.cmd} ${e.sub}` : e.cmd;
    const c = (byCommand[key] = byCommand[key] || { runs: 0, refused: 0, errors: 0, total_ms: 0 });
    c.runs += 1;
    c.total_ms += e.ms || 0;
    if (e.result === "refused") {
      c.refused += 1;
      refused += 1;
    }
    if (e.result === "error") c.errors += 1;
    for (const id of e.failed_checks || []) refusals[id] = (refusals[id] || 0) + 1;
  }
  for (const c of Object.values(byCommand)) {
    c.avg_ms = Math.round(c.total_ms / c.runs);
    delete c.total_ms;
  }
  return { runs: entries.length, first: entries[0] ? entries[0].t : null, last: entries.length ? entries[entries.length - 1].t : null, refused, by_command: byCommand, gate_refusals_by_check: refusals };
}

module.exports = { usageDir, enabled, recordUsage, readUsage, stageDurations, summarizeUsage };
