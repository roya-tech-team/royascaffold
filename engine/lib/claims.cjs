"use strict";

// Claims (plan file 03 §4, M4). A task is claimed with a lease and the file paths it will touch, so several
// agents can work at once without stepping on each other. Claims are events in the change log
// (`claim.acquired`, `claim.released`); the log is the only store, so they travel with git.
//
// A claim is live when it is the last claim event of its task, it was not released, the task is not
// done, and its lease has not run out. Two live claims may not cover overlapping path globs.

const { buildModel } = require("./model/graph.cjs");
const { appendEvent } = require("./events.cjs");
const { headShort } = require("./git.cjs");
const { who } = require("./identity.cjs");
const { patternList } = require("./glob.cjs");

const DEFAULT_LEASE_MINUTES = 30;
const MAX_LEASE_MINUTES = 24 * 60;

// The clock. ROYASCAFF_NOW (an ISO time) moves it, so tests of leases need no waiting; nothing else uses it.
const nowMs = () => {
  const t = process.env.ROYASCAFF_NOW ? Date.parse(process.env.ROYASCAFF_NOW) : NaN;
  return Number.isNaN(t) ? Date.now() : t;
};

const fail = (code, message, extra = {}) => Object.assign(new Error(message), { code, ...extra });

// The static part of a glob: the folders before the first wildcard ("apps/web/**" -> "apps/web").
function prefixOf(glob) {
  const parts = String(glob).trim().replace(/^\.\//, "").replace(/\/+$/, "").split("/");
  const out = [];
  for (const p of parts) {
    if (/[*?]/.test(p)) break;
    out.push(p);
  }
  return out.join("/");
}

const isPrefix = (a, b) => a === "" || b === a || b.startsWith(`${a}/`);

// Two globs overlap when one could match a file the other matches. Conservative: it compares the folders
// before the first wildcard, so `a/*.js` and `a/b/**` count as overlapping (a false alarm, never a miss).
function globsOverlap(a, b) {
  const pa = prefixOf(a);
  const pb = prefixOf(b);
  return isPrefix(pa, pb) || isPrefix(pb, pa);
}

function pathsOverlap(listA, listB) {
  const hits = [];
  for (const a of listA) for (const b of listB) if (globsOverlap(a, b)) hits.push([a, b]);
  return hits;
}

function parseNote(note) {
  try {
    const v = JSON.parse(note);
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

// Every live claim in the project at `now` (ms), newest information wins.
function liveClaims(model, now = nowMs()) {
  const byTask = new Map();
  for (const change of model.changes.values()) {
    for (const e of change.events || []) {
      if (!["claim.acquired", "claim.released", "task.done"].includes(e.event)) continue;
      const prev = byTask.get(e.target);
      if (prev && Date.parse(prev.when) > Date.parse(e.when)) continue;
      byTask.set(e.target, { ...e, change: change.id });
    }
  }
  const out = [];
  for (const e of byTask.values()) {
    if (e.event !== "claim.acquired") continue;
    const n = parseNote(e.note);
    const until = Date.parse(n.lease_until);
    if (!(until > now)) continue;
    out.push({ task: e.target, change: e.change, agent: n.agent || e.by, paths: n.paths || [], lease_until: n.lease_until, claimed_at: e.when, event: e.id });
  }
  return out.sort((a, b) => a.task.localeCompare(b.task));
}

function taskOf(model, taskId) {
  const task = model.tasks.get(taskId);
  if (!task) throw fail("UNKNOWN_ID", `${taskId} is not a task in this project`);
  if (!task.change) throw fail("UNKNOWN_ID", `${taskId} is not inside a change folder`);
  return { task, change: model.changes.get(task.change) };
}

function write(model, change, event, agent) {
  return appendEvent(require("path").join(model.root, change.dir), change.id, { ...event, by: agent, git: headShort(model.repo) || "—" });
}

const refresh = (start) => require("./commands/views.cjs").indexCommand(start);

// claim <TASK-…> [--agent NAME] [--lease MINUTES] [--paths globs]
function claimTask(start, taskId, flags = {}) {
  if (!taskId) throw fail("INVALID_INPUT", "Usage: royascaff claim <TASK-…> [--agent NAME] [--lease MINUTES] [--paths globs] | claim <TASK-…> --release | claim --list");
  const model = buildModel(start);
  const { task, change } = taskOf(model, taskId);
  const agent = String(flags.agent || who(flags, model.repo));
  const lease = flags.lease === undefined ? DEFAULT_LEASE_MINUTES : Number(flags.lease);
  if (!(lease > 0) || lease > MAX_LEASE_MINUTES) throw fail("INVALID_INPUT", `--lease is a number of minutes above 0 and at most ${MAX_LEASE_MINUTES}`);
  const state = require("./derive/status.cjs").deriveStatus(model).tasks.get(taskId).state;
  if (state === "done") throw fail("GATE_REFUSED", `${taskId} is done: nothing to claim`);
  const paths = flags.paths ? patternList(flags.paths) : patternList(model.records.get(taskId).fields["Allowed paths"]);
  if (!paths.length) throw fail("INVALID_INPUT", `${taskId} lists no allowed paths: give them with --paths "a/**,b/**" (a claim covers file paths)`);
  const now = nowMs();
  const live = liveClaims(model, now);
  const conflicts = [];
  for (const c of live) {
    if (c.task === taskId && c.agent === agent) continue; // the holder renews
    const hits = c.task === taskId ? paths.map((p) => [p, p]) : pathsOverlap(paths, c.paths);
    if (hits.length) conflicts.push({ task: c.task, change: c.change, holder: c.agent, paths: c.paths, lease_until: c.lease_until, overlap: [...new Set(hits.map(([a, b]) => (a === b ? a : `${a} ~ ${b}`)))] });
  }
  if (conflicts.length) {
    return { ok: false, task: taskId, agent, paths, conflicts, holder: conflicts[0].holder, holder_paths: conflicts[0].paths, lease_until: conflicts[0].lease_until };
  }
  const renewed = live.some((c) => c.task === taskId && c.agent === agent);
  const until = new Date(now + lease * 60000).toISOString();
  write(model, change, { event: "claim.acquired", target: taskId, note: JSON.stringify({ agent, paths, lease_until: until, lease_minutes: lease }) }, agent);
  refresh(start);
  return { ok: true, task: taskId, change: change.id, agent, paths, lease_minutes: lease, lease_until: until, renewed };
}

// claim <TASK-…> --release: only the holder (anyone when the lease ran out or no claim exists).
function releaseTask(start, taskId, flags = {}) {
  if (!taskId) throw fail("INVALID_INPUT", "Usage: royascaff claim <TASK-…> --release");
  const model = buildModel(start);
  const { change } = taskOf(model, taskId);
  const agent = String(flags.agent || who(flags, model.repo));
  const mine = liveClaims(model).find((c) => c.task === taskId); // (the clock: nowMs)
  if (!mine) return { released: false, task: taskId, change: change.id, agent, reason: "no live claim" };
  if (mine.agent !== agent) throw fail("NOT_CLAIM_HOLDER", `${taskId} is claimed by ${mine.agent} until ${mine.lease_until}, not by ${agent}`, { missing: [`ask ${mine.agent} to release it, or wait for the lease to end`] });
  write(model, change, { event: "claim.released", target: taskId, note: JSON.stringify({ agent }) }, agent);
  refresh(start);
  return { released: true, task: taskId, change: change.id, agent };
}

function listClaims(start) {
  const model = buildModel(start);
  return { claims: liveClaims(model) };
}

// task start/done by someone who is not the holder of a live claim is refused (NOT_CLAIM_HOLDER).
// A task nobody claimed is open to everyone, so projects without claims behave as before.
function assertHolder(model, taskId, by) {
  const c = liveClaims(model).find((x) => x.task === taskId);
  if (c && c.agent !== by) throw fail("NOT_CLAIM_HOLDER", `${taskId} is claimed by ${c.agent} until ${c.lease_until}; ${by} does not hold the claim`, { missing: [`${c.agent} finishes or releases it (royascaff claim ${taskId} --release), or the lease ends`] });
}

module.exports = { DEFAULT_LEASE_MINUTES, globsOverlap, pathsOverlap, liveClaims, claimTask, releaseTask, listClaims, assertHolder };
