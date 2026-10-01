"use strict";

// The change event log: `changes/<CHG>/log.md`, an append-only Markdown table written only by
// the CLI. Task state and change history are projections of these events.

const fs = require("fs");
const path = require("path");
const { readTables, escapeCell } = require("./model/tables.cjs");

const EVENT_TYPES = [
  "change.opened",
  "change.advanced",
  "change.approved",
  "change.blocked",
  "change.unblocked",
  "task.started",
  "task.done",
  "task.blocked",
  "check.run",
  "manual.recorded",
  "backup.saved",
  "refinement.confirmed",
  "migration.applied",
  "project.approved",
  "feature.approved",
];

const COLUMNS = ["When", "Event", "Target", "By", "Git", "Note"];
const HEADER = `| ${COLUMNS.join(" | ")} |\n|${COLUMNS.map(() => "---").join("|")}|`;

function logTemplate(changeId) {
  return `# Log · ${changeId}\n\n> Written by \`royascaff\`. Do not edit by hand.\n\n${HEADER}\n`;
}

// Parses log.md text into events. Returns { events, problems }.
function parseLog(text) {
  const problems = [];
  const table = readTables(text).find((t) => t.header.map((h) => h.toLowerCase()).join("|") === COLUMNS.map((c) => c.toLowerCase()).join("|"));
  if (!table) return { events: [], problems: text.trim() ? ["no event table with columns When | Event | Target | By | Git | Note"] : [] };
  const events = table.rows.map((row, index) => {
    const [when, event, target, by, git, note] = row.cells;
    const clean = (v) => (v === undefined || v === "—" || v === "-" ? "" : v.replace(/`/g, ""));
    return { index, when: clean(when), event: clean(event), target: clean(target), by: clean(by), git: clean(git), note: note === undefined || note === "—" ? "" : note, line: row.lineOffset + 1 };
  });
  for (const e of events) {
    if (!EVENT_TYPES.includes(e.event)) problems.push(`line ${e.line}: unknown event "${e.event}"`);
    if (!e.when || Number.isNaN(Date.parse(e.when))) problems.push(`line ${e.line}: invalid time "${e.when}"`);
  }
  for (let i = 1; i < events.length; i += 1) {
    if (Date.parse(events[i].when) < Date.parse(events[i - 1].when)) problems.push(`line ${events[i].line}: event is earlier than the one before it`);
  }
  return { events, problems };
}

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

// Appends one event row to changes/<dir>/log.md, creating the file if needed.
function appendEvent(changeDirAbs, changeId, e) {
  if (!EVENT_TYPES.includes(e.event)) throw new Error(`Unknown event type: ${e.event}`);
  const file = path.join(changeDirAbs, "log.md");
  let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : logTemplate(changeId);
  if (!text.endsWith("\n")) text += "\n";
  const row = [e.when || nowIso(), e.event, e.target || changeId, e.by || "unknown", e.git || "—", e.note || "—"].map(escapeCell);
  text += `| ${row.join(" | ")} |\n`;
  fs.mkdirSync(changeDirAbs, { recursive: true });
  fs.writeFileSync(file, text);
  return { ...e, when: row[0], file };
}

// Last task event decides the task state (§3.5).
function taskStateFrom(events, taskId) {
  const own = events.filter((e) => e.target === taskId && e.event.startsWith("task."));
  const last = own[own.length - 1];
  if (!last) return { state: "todo", last: null };
  const state = { "task.done": "done", "task.blocked": "blocked", "task.started": "doing" }[last.event];
  return { state, last };
}

module.exports = { EVENT_TYPES, parseLog, appendEvent, taskStateFrom, logTemplate, nowIso, HEADER };
