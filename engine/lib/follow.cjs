"use strict";

// The event stream (plan file 03 §5, M5). Watches project/log.md and changes/*/log.md and hands every new
// event to a callback, in the same shape `events` returns. Polling on purpose: it works on every
// platform and file system, and a log is only ever appended to.

const fs = require("fs");
const path = require("path");
const { parseLog } = require("./events.cjs");

function logFiles(projectDir) {
  const out = [{ file: path.join(projectDir, "log.md"), scope: "project", change: null }];
  const changes = path.join(projectDir, "changes");
  let dirs = [];
  try {
    dirs = fs.readdirSync(changes, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch {
    // no changes folder yet
  }
  for (const d of dirs) out.push({ file: path.join(changes, d.name, "log.md"), scope: d.name, change: d.name });
  return out;
}

function readEvents(entry) {
  let text;
  try {
    text = fs.readFileSync(entry.file, "utf8");
  } catch {
    return [];
  }
  return parseLog(text, entry.scope).events.map((e) => ({ id: e.id, change: entry.change, when: e.when, event: e.event, target: e.target, by: e.by, git: e.git, note: e.note }));
}

// watchEvents(projectDir, onEvents, { intervalMs }) -> { stop(), poll() }. Events already in the logs are not
// reported; only what is added after the call. `onEvents` gets an array, oldest first.
function watchEvents(projectDir, onEvents, opts = {}) {
  const seen = new Map(); // file -> { size, count }
  for (const entry of logFiles(projectDir)) {
    try {
      const size = fs.statSync(entry.file).size;
      seen.set(entry.file, { size, count: readEvents(entry).length });
    } catch {
      // not there yet
    }
  }
  const poll = () => {
    const fresh = [];
    for (const entry of logFiles(projectDir)) {
      let size;
      try {
        size = fs.statSync(entry.file).size;
      } catch {
        continue;
      }
      const prev = seen.get(entry.file) || { size: -1, count: 0 };
      if (size === prev.size) continue;
      const events = readEvents(entry);
      fresh.push(...events.slice(prev.count));
      seen.set(entry.file, { size, count: events.length });
    }
    if (fresh.length) {
      fresh.sort((a, b) => (Date.parse(a.when) || 0) - (Date.parse(b.when) || 0));
      onEvents(fresh);
    }
  };
  const timer = setInterval(poll, opts.intervalMs || 250);
  return { stop: () => clearInterval(timer), poll };
}

module.exports = { watchEvents, logFiles };
