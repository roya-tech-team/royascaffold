"use strict";

// The bounded repair loop (plan file 01 §4, E1.4). A failed `verify` (or a judge verdict of not-met)
// is a failed attempt. `next` answers with a repair action while attempts are left. After
// `repair_limit` repair attempts (profile.md, default 2) the next failure blocks the change, and `next`
// asks a person. A person's `unblock` starts the count again.

const DEFAULT_LIMIT = 2;
const BLOCK_PREFIX = "repair limit reached";

function limitOf(model) {
  const n = Number(model.profile && model.profile.repair_limit);
  return Number.isInteger(n) && n >= 0 ? n : DEFAULT_LIMIT;
}

// A run of the machine checks (not a quick check after a task, not a result typed in by hand).
const isMachineRun = (e) => e.event === "check.run" && / — .*[✓✗⏱]/.test(e.note || "") && !/^quick\b/i.test(e.note || "");
const isFailure = (e) => (isMachineRun(e) && /^fail\b/i.test(e.note || "")) || (e.event === "judge.recorded" && /not-met lines: /.test(e.note || ""));
const isVerification = (e) => isMachineRun(e) || e.event === "judge.recorded";

function failingOf(e) {
  const m = String((e && e.note) || "").match(/(?:failing lines|not-met lines): ([^·]+)/);
  return m ? m[1].split(",").map((x) => x.trim()).filter(Boolean) : [];
}

function stateOf(model, change) {
  const events = change.events || [];
  const since = events.reduce((at, e, i) => (e.event === "change.unblocked" ? i : at), -1);
  const seq = events.slice(since + 1);
  const failures = seq.filter(isFailure).length;
  const last = [...seq].reverse().find(isVerification) || null;
  const limit = limitOf(model);
  const pending = Boolean(last && isFailure(last));
  return { limit, failures, pending, failing: pending ? failingOf(last) : [], exceeded: failures > limit, left: Math.max(0, limit - failures), last };
}

const BLOCK_NOTE = (s) => `${BLOCK_PREFIX}: ${s.failures} failed attempt(s) with ${s.limit} repair attempt(s) allowed. A person decides: unblock it to try again, or change the plan`;
const isRepairBlock = (e) => e && e.event === "change.blocked" && String(e.note || "").startsWith(BLOCK_PREFIX);

// The repair action `next` returns while the last verification failed and attempts are left, or null.
function actionFor(model, change) {
  const s = stateOf(model, change);
  if (!s.pending || s.exceeded) return null;
  const attempt = s.failures; // the repair that follows this failure is attempt number `failures`
  return {
    kind: "repair",
    change: change.id,
    stage: "build",
    repair: { attempt, limit: s.limit, failing: s.failing },
    text: `Repair ${change.id} (attempt ${attempt} of ${s.limit}): ${s.failing.length ? `fix the failing lines ${s.failing.join(", ")}` : "fix what the last check reported"}, then run royascaff verify ${change.id}. If attempt ${s.limit} fails too, the change is blocked and a person decides`,
    say: `royascaff verify ${change.id}`,
  };
}

module.exports = { limitOf, stateOf, actionFor, isFailure, isMachineRun, isRepairBlock, failingOf, BLOCK_NOTE, BLOCK_PREFIX, DEFAULT_LIMIT };
