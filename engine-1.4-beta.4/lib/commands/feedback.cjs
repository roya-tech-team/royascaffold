"use strict";

// `usage` shows what is counted locally; `feedback` writes a report the developer reviews and
// sends. Nothing leaves the machine unless a person sends the file.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { readUsage, summarizeUsage, stageDurations, usageDir, enabled } = require("../usage.cjs");
const { briefCommand } = require("./navigate.cjs");

function version() {
  try {
    return require("../../package.json").version;
  } catch {
    return "unknown";
  }
}

function usageCommand(start) {
  const model = buildModel(start);
  return { enabled: enabled(model.profile), file: path.relative(model.repo, path.join(model.root, ".usage", "usage.jsonl")), usage: summarizeUsage(readUsage(model.root)), stages: stageDurations(model) };
}

const KINDS = ["bug", "confusing", "idea", "praise", "other"];

function feedbackCommand(start, note, flags = {}) {
  if (!note) throw new Error('Usage: royascaff feedback "<what happened or what you would change>" [--kind bug|confusing|idea|praise|other]');
  const kind = String(flags.kind || "other").toLowerCase();
  if (!KINDS.includes(kind)) throw new Error(`--kind must be one of ${KINDS.join(", ")}`);
  const model = buildModel(start);
  const u = usageCommand(start);
  const brief = briefCommand(start).text;
  const errors = model.issues.filter((i) => i.severity === "error").length;
  const warnings = model.issues.length - errors;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    `# RoyaScaff feedback · ${kind}`,
    "",
    "> Review this file before sending it. It contains the note below, counts, and the project brief (titles and hand-off notes). Remove anything confidential.",
    "",
    "## Note",
    "",
    note,
    "",
    "## Environment",
    "",
    `- RoyaScaff ${version()} · Node ${process.version} · ${os.platform()} ${os.arch()}`,
    `- Project code ${model.code} · layout ${model.layout} · ${model.records.size} records · ${model.features.size} features · ${model.changes.size} changes · ${model.tasks.size} tasks`,
    `- Validation: ${errors} errors · ${warnings} warnings`,
    "",
    "## Time in each status (from change logs, hours)",
    "",
    "| Status | Changes | Median | Longest |",
    "|---|---|---|---|",
    ...Object.entries(u.stages.stages).map(([s, v]) => `| ${s} | ${v.changes} | ${v.median_hours} | ${v.max_hours} |`),
    "",
    "Open changes by time in their current status:",
    "",
    ...(u.stages.open.length ? u.stages.open.slice(0, 5).map((o) => `- ${o.change}: ${o.status} for ${o.hours} h`) : ["- none"]),
    "",
    `## Local usage (${u.enabled ? "counting" : "off"})`,
    "",
    `- ${u.usage.runs} commands${u.usage.first ? ` between ${u.usage.first.slice(0, 10)} and ${u.usage.last.slice(0, 10)}` : ""} · ${u.usage.refused} refused by a gate`,
    ...Object.entries(u.usage.by_command).sort((a, b) => b[1].runs - a[1].runs).map(([k, v]) => `- ${k}: ${v.runs} runs${v.refused ? `, ${v.refused} refused` : ""}${v.errors ? `, ${v.errors} errors` : ""}, avg ${v.avg_ms} ms`),
    ...(Object.keys(u.usage.gate_refusals_by_check).length ? ["", "Gate checks that refused most often:", "", ...Object.entries(u.usage.gate_refusals_by_check).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`)] : []),
    "",
    "## Project brief at the time of feedback",
    "",
    brief.replace(/^# /gm, "### ").replace(/^## /gm, "#### "),
  ];
  const file = path.join(usageDir(model.root), `feedback-${stamp}-${kind}.md`);
  fs.writeFileSync(file, `${lines.join("\n")}\n`);
  return { file: path.relative(model.repo, file), kind };
}

module.exports = { usageCommand, feedbackCommand, KINDS };
