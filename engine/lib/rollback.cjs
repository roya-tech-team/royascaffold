"use strict";

// Rollback (plan file 02 §4, E7). `royascaff rollback <CHG-…|REL-…>` opens a change of kind `rollback` that holds:
//   - the commits to revert (from the changes' events, their evidence and the git log),
//   - the requirements whose state returns to the previous baseline,
//   - a required verify run after the revert.
// The engine never runs `git revert`: the task does it, as with all code work. The change is closed only when
// the records are back at the baseline (wording and version) and a passing, fresh `verify` ran after the revert.

const fs = require("fs");
const path = require("path");
const { changeBody, section } = require("./gates.cjs");
const { readTables, escapeCell } = require("./model/tables.cjs");
const { patternList } = require("./glob.cjs");
const evolve = require("./evolve.cjs");
const B = require("./baseline.cjs");
const { git, resolve } = require("./git.cjs");

const fail = (code, message, missing) => Object.assign(new Error(message), { code, ...(missing ? { missing } : {}) });
const SHIPPED = ["verified", "reconciled", "closed"];
const RESTORE_TITLE = "Restore";
const REVERT_TITLE = "Revert";

// The commits of a change: the work it recorded (task.done events carry the commit made after each task, evidence
// carries the commit it ran on) and the git log lines that name the change or its tasks. Newest first.
function commitsOf(model, change) {
  const found = new Set();
  const add = (ref) => {
    const full = ref && /^[0-9a-f]{4,40}$/i.test(ref) ? resolve(model.repo, ref) : null;
    if (full) found.add(full);
  };
  for (const e of change.events || []) if (e.event === "task.done" || e.event === "manual.recorded") add(e.git);
  for (const e of model.evidence.values()) if (e.change === change.id && e.git) add(String(e.git).split(/\s/)[0]);
  const names = [change.id, ...change.tasks];
  const logged = git(model.repo, ["log", "--format=%H", "-i", ...names.flatMap((n) => ["--grep", n])]);
  for (const h of String(logged || "").split("\n").filter(Boolean)) found.add(h);
  const opened = (change.events || []).find((e) => e.event === "change.opened");
  const base = opened && opened.git ? resolve(model.repo, opened.git) : null;
  if (base) found.delete(base); // the commit the change was opened on is not part of it
  // The work to revert is code: a commit that touches only the project folder (the change's folder, the log, the board, the
  // baselines, the records) is not listed. Records go back through the Restore table, which the gate checks.
  const projectRel = path.relative(model.repo, model.root).split(path.sep).join("/");
  const insideProject = (f) => f === "STATUS.md" || (projectRel ? f === projectRel || f.startsWith(`${projectRel}/`) : false); // STATUS.md at the root is the board's pointer
  for (const h of [...found]) {
    const files = String(git(model.repo, ["show", "--name-only", "--format=", h]) || "").split("\n").filter(Boolean);
    if (!files.some((f) => !insideProject(f))) found.delete(h);
  }
  if (!found.size) return [];
  const rows = git(model.repo, ["log", "--no-walk=sorted", "--format=%h%x09%s", ...found]);
  return String(rows || "").split("\n").filter(Boolean).map((l) => {
    const [commit, ...rest] = l.split("\t");
    return { commit, subject: rest.join("\t"), change: change.id };
  });
}

// The requirements a set of changes delivered, affected or changed by delta.
function scopeOf(model, changes) {
  const out = new Set();
  const { findIds } = require("./parse/ids.cjs");
  for (const change of changes) {
    for (const a of change.affects) out.add(a);
    for (const s of change.slices) for (const d of (model.slices.get(s) || { delivers: [] }).delivers) out.add(d);
    try {
      for (const d of evolve.parseDeltas(changeBody(model.root, change))) out.add(d.id);
    } catch {
      // no body, no delta
    }
  }
  return [...out].filter((id) => model.records.has(id) && ["requirement", "nfr", "use-case", "workflow", "contract"].includes(model.records.get(id).kind)).sort();
}

// The baseline the state returns to: the last one before the first release that holds the reverted changes
// (or the last one there is, when none holds them yet).
function previousBaseline(model, reverts, releaseId = null) {
  const list = B.listBaselines(model);
  if (releaseId) {
    const i = list.indexOf(releaseId);
    return i > 0 ? list[i - 1] : null;
  }
  let first = -1;
  list.forEach((rel, i) => {
    if (first >= 0) return;
    if ((B.readBaseline(model, rel).includes || []).some((c) => reverts.includes(c))) first = i;
  });
  if (first < 0) return list.length ? list[list.length - 1] : null;
  return first > 0 ? list[first - 1] : null;
}

// The plan for `rollback <CHG|REL>`.
function planRollback(model, status, target, flags = {}) {
  const rec = model.records.get(target);
  if (!rec) throw fail("UNKNOWN_ID", `${target} is not a change or a release in this project`);
  let reverts;
  let release = null;
  if (/^CHG-/.test(target)) reverts = [target];
  else if (rec.kind === "release") {
    release = target;
    reverts = rec.relations.filter((r) => r.type === "includes").map((r) => r.to).filter((id) => model.changes.has(id)).reverse();
    if (!reverts.length) throw fail("INVALID_INPUT", `${target} includes no change: there is nothing to roll back`);
  } else throw fail("INVALID_INPUT", `${target} is a ${rec.kind}: roll back a change (CHG-…) or a release (REL-…)`);
  const changes = reverts.map((id) => model.changes.get(id));
  for (const c of changes) {
    if (c.kind === "rollback") throw fail("INVALID_INPUT", `${c.id} is itself a rollback: roll back the change it reverted again by changing the records, not by reverting a revert`);
    if (model.reverted.has(c.id)) throw fail("ALREADY_EXISTS", `${c.id} is already reverted (by ${[...model.changes.values()].find((x) => x.kind === "rollback" && x.reverts.includes(c.id) && x.status !== "cancelled").id})`);
    if (!SHIPPED.includes(c.status)) throw fail("GATE_REFUSED", `${c.id} is ${c.status}: a rollback reverts work that was verified or closed (cancel an open change with royascaff advance ${c.id} --to cancelled --reason "…")`, [`${c.id} verified, reconciled or closed`]);
  }
  const baselineId = flags.to && flags.to !== true ? String(flags.to) : previousBaseline(model, reverts, release);
  const baseline = baselineId ? B.readBaseline(model, baselineId) : null;
  const requirements = scopeOf(model, changes);
  const live = B.liveBaseline(model, status);
  const liveBy = new Map(live.records.map((r) => [r.id, r]));
  const baseBy = baseline ? new Map(baseline.records.map((r) => [r.id, r])) : new Map();
  const restore = requirements.map((id) => {
    const now = liveBy.get(id);
    const was = baseBy.get(id) || null;
    const st = status.requirements.get(id);
    const baseSt = baseline && baseline.status.requirements ? baseline.status.requirements[id] : null;
    return {
      id,
      now_version: (now && now.version) || 1,
      back_version: was ? was.version || 1 : null,
      now_state: st ? st.state : null,
      back_state: baseSt ? baseSt.state : was ? null : "absent",
      in_baseline: Boolean(was),
      hash_now: now ? now.hash : null,
      hash_back: was ? was.hash : null,
    };
  });
  const commits = [];
  const seen = new Set();
  for (const c of changes) for (const k of commitsOf(model, c)) if (!seen.has(k.commit)) { seen.add(k.commit); commits.push(k); }
  const paths = [...new Set(changes.flatMap((c) => c.tasks.flatMap((t) => patternList(model.records.get(t).fields["Allowed paths"]))))];
  return { target, release, reverts, baseline: baselineId, requirements: restore, commits, paths };
}

function renderRevert(plan) {
  const lines = [`## ${REVERT_TITLE}`, "", `Reverts ${plan.reverts.join(", ")}. The engine never runs \`git revert\`: the task does it (newest commit first), then \`royascaff verify\` proves the result.`, ""];
  if (plan.commits.length) {
    lines.push("| Commit | Subject | From |", "|---|---|---|");
    for (const c of plan.commits) lines.push(`| ${c.commit} | ${escapeCell(c.subject)} | ${c.change} |`);
  } else lines.push("_No commits found for these changes (no git, or the commits do not name the change): find the work in the change's log and evidence._");
  return lines.join("\n");
}

function renderRestore(plan) {
  const lines = [`## ${RESTORE_TITLE}`, "", plan.baseline ? `Baseline: ${plan.baseline}. Each record returns to the wording and version it had there; the records are edited back by the task, and the check below refuses until they match.` : "No baseline before these changes: nothing to compare with. Each record returns to the state it had before the change (planned).", ""];
  if (plan.requirements.length) {
    lines.push("| Record | Now | Back to | Baseline hash |", "|---|---|---|---|");
    for (const r of plan.requirements) lines.push(`| ${r.id} | v${r.now_version}${r.now_state ? `, ${r.now_state}` : ""} | ${r.in_baseline ? `v${r.back_version}${r.back_state ? `, ${r.back_state}` : ""}` : "not in the baseline"} | ${r.hash_back || "—"} |`);
  } else lines.push("_These changes touched no requirement._");
  return lines.join("\n");
}

// What the Restore table says, back as data: [{ id, hash, version }] (rows that are in the baseline).
function parseRestore(body) {
  const text = section(body, [RESTORE_TITLE]);
  const table = text ? readTables(text).find((t) => (t.header[0] || "").toLowerCase() === "record") : null;
  if (!table) return [];
  return table.rows.map((r) => ({ id: (r.cells[0] || "").trim(), back: (r.cells[2] || "").trim(), hash: (r.cells[3] || "").trim() })).filter((r) => r.hash && r.hash !== "—");
}

// Gate checks of a rollback change at `verified`: the records are back at the baseline, and a passing verify ran after.
function verifiedChecks(model, status, change, body, check) {
  const out = [];
  const baselineId = change.baseline;
  const rows = parseRestore(body);
  if (!baselineId || !rows.length) {
    out.push(check("restored", true, baselineId ? "no record of these changes is in the baseline" : "no baseline before these changes: the records return to their earlier state without a comparison", { pending: "no baseline" }));
  } else {
    const live = new Map(B.liveBaseline(model, status).records.map((r) => [r.id, r]));
    const base = new Map(B.readBaseline(model, baselineId).records.map((r) => [r.id, r]));
    const off = [];
    for (const r of rows) {
      const now = live.get(r.id);
      const was = base.get(r.id);
      if (!was) continue;
      if (!now) off.push(`${r.id} is gone (the baseline has it)`);
      else if ((now.version || 1) !== (was.version || 1)) off.push(`${r.id} is v${now.version || 1}, the baseline has v${was.version || 1}`);
      else if (now.hash !== was.hash) off.push(`${r.id} says something else than in ${baselineId}`);
    }
    out.push(check("restored", off.length === 0, off.length ? `these records are not back at ${baselineId}: ${off.join("; ")}` : `every record is back at ${baselineId} (wording and version)`));
  }
  const evs = [...model.evidence.values()].filter((e) => e.change === change.id && e.kind === "verify");
  const fresh = evs.filter((e) => e.result === "pass" && !status.stale.has(e.id));
  out.push(check("verify-after-revert", fresh.length > 0, fresh.length ? `a passing verify (${fresh[fresh.length - 1].id}) ran after the revert` : evs.length ? `the last verify did not pass, or the code changed since: run royascaff verify ${change.id}` : `run royascaff verify ${change.id} after the revert: a rollback needs its own passing verify`));
  return out;
}

module.exports = { SHIPPED, planRollback, renderRevert, renderRestore, parseRestore, verifiedChecks, commitsOf, scopeOf, previousBaseline };
