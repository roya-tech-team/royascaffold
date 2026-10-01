"use strict";

// Next actions (plan file 02 §4.3), computed from the model, derived status and the stage
// gates. Deterministic: no AI judgement. Each action names the stage card to read.

const { evaluate, changeBody } = require("../gates.cjs");

const OPEN_STAGES = ["understand", "design", "plan", "build", "check", "blocked"];
const HORIZON_ORDER = { now: 0, next: 1, later: 2, backlog: 3 };
const PRIORITY_ORDER = { must: 0, should: 1, could: 2 };
const priorityOf = (model, featureId) => {
  const rec = model.records.get(featureId);
  const p = rec ? String(rec.fields.Priority || "").trim().toLowerCase() : "";
  return p in PRIORITY_ORDER ? PRIORITY_ORDER[p] : 3;
};
const NEXT_STATUS = { draft: "analyzed", analyzed: "approved", approved: "ready", verified: "reconciled", reconciled: "closed" };
const CARD = { understand: "understand.md", design: "design.md", plan: "plan.md", build: "build.md", check: "check-record.md" };

function firstReadyTask(model, status, change) {
  for (const tid of change.tasks) {
    const t = status.tasks.get(tid);
    if (t.state === "done" || t.state === "blocked") continue;
    const deps = model.tasks.get(tid).depends_on;
    if (deps.every((d) => !status.tasks.has(d) || status.tasks.get(d).state === "done")) return t;
  }
  return null;
}

function gateFor(model, status, change, to) {
  try {
    return evaluate({ model, status, change, projectDir: model.root, body: changeBody(model.root, change) }, to);
  } catch {
    return null;
  }
}

function failing(gate) {
  return gate ? gate.checks.filter((c) => !c.ok) : [];
}

function stageWork(model, status, change, stage) {
  const to = NEXT_STATUS[change.status];
  const gate = gateFor(model, status, change, to);
  const fails = failing(gate);
  const onlyApproval = fails.length > 0 && fails.every((c) => c.approval);
  const base = { change: change.id, stage, card: CARD[stage], gate };
  if (onlyApproval) {
    const own = fails.find((c) => c.say);
    if (own) return { ...base, kind: "approval", human: true, text: `Waiting for a person: ${own.message}`, say: own.say };
    return { ...base, kind: "approval", human: true, text: `Waiting for a person to approve ${change.id} (risk ${change.risk}). Review ${change.dir}/change.md, then: royascaff approve ${change.id}`, say: `royascaff approve ${change.id}` };
  }
  if (!fails.length) return { ...base, kind: "advance", text: `${change.id} is ready to move on: royascaff advance ${change.id} --to ${to}`, say: "royascaff continue" };
  const verb = { understand: "Understand", design: "Design", plan: "Plan" }[stage];
  return { ...base, kind: stage, text: `${verb} ${change.id} · ${change.title} (stage ${{ understand: 1, design: 2, plan: 3 }[stage]}): ${fails.filter((c) => !c.approval).map((c) => c.message).join("; ")}`, say: "royascaff continue" };
}

function changeAction(model, status, change) {
  const c = status.changes.get(change.id);
  if (c.blocked) {
    const blockedTask = change.tasks.map((t) => status.tasks.get(t)).find((t) => t.state === "blocked");
    const lastBlock = (change.events || []).filter((e) => e.target === change.id && e.event === "change.blocked").pop();
    const why = blockedTask ? `${blockedTask.id} is blocked${blockedTask.last && blockedTask.last.note ? `: ${blockedTask.last.note}` : ""}` : lastBlock && lastBlock.note ? lastBlock.note : "change is blocked";
    return { kind: "unblock", change: change.id, stage: c.stage, human: true, text: `Unblock ${change.id} — ${why}`, say: blockedTask ? `royascaff task ${blockedTask.id} start` : `royascaff unblock ${change.id}` };
  }
  if (["understand", "design", "plan"].includes(c.stage)) return stageWork(model, status, change, c.stage);
  if (c.stage === "build") {
    const t = firstReadyTask(model, status, change);
    if (t) {
      const title = model.records.get(t.id).title;
      return { kind: t.state === "doing" ? "continue-task" : "implement", change: change.id, task: t.id, stage: "build", card: CARD.build, text: `${t.state === "doing" ? "Continue" : "Implement"} ${t.id} · ${title} (${change.id}, tasks ${c.tasksDone}/${c.tasksTotal})`, say: "royascaff continue" };
    }
    if (c.tasksDone < c.tasksTotal) return { kind: "waiting", change: change.id, stage: "build", text: `${change.id}: the remaining tasks are blocked or wait for others`, say: `royascaff show ${change.id}` };
    const gate = gateFor(model, status, change, "verified");
    const fails = failing(gate);
    if (!fails.length) return { kind: "advance", change: change.id, stage: "check", card: CARD.check, gate, text: `All ${c.tasksTotal} tasks of ${change.id} are done and proven: royascaff advance ${change.id} --to verified`, say: "royascaff continue" };
    if (fails.every((f) => f.approval)) {
      const own = fails.find((f) => f.say) || fails[0];
      return { kind: "person-check", human: true, change: change.id, stage: "check", card: CARD.check, gate, text: `Waiting for a person: ${fails.map((f) => f.message).join("; ")}`, say: own.say || "royascaff continue" };
    }
    return { kind: "check", change: change.id, stage: "check", card: CARD.check, gate, text: `Check ${change.id}: ${fails.map((f) => f.message).join("; ")}`, say: "royascaff continue" };
  }
  if (c.stage === "check") {
    if (change.status === "reconciled") return { kind: "close", change: change.id, stage: "check", card: CARD.check, text: `Close ${change.id}: royascaff advance ${change.id} --to closed`, say: "royascaff continue" };
    const gate = gateFor(model, status, change, "reconciled");
    const fails = failing(gate);
    if (fails.length && fails.every((f) => f.approval)) return { kind: "approval", human: true, change: change.id, stage: "check", card: CARD.check, gate, text: `Waiting for a person to approve recording ${change.id} (risk ${change.risk}): royascaff approve ${change.id}`, say: `royascaff approve ${change.id}` };
    return { kind: "record", change: change.id, stage: "check", card: CARD.check, gate, text: fails.length ? `Record ${change.id} into Main: ${fails.map((f) => f.message).join("; ")}` : `Record ${change.id} into Main: update the knowledge, then royascaff advance ${change.id} --to reconciled`, say: "royascaff continue" };
  }
  return null;
}

function readySlices(model, status) {
  const out = [];
  for (const slice of model.slices.values()) {
    const s = status.slices.get(slice.id);
    if (s.state !== "planned") continue;
    const waitsFor = slice.depends_on.filter((d) => status.slices.has(d) && status.slices.get(d).state !== "done");
    const feature = model.features.get(slice.feature);
    out.push({ slice: slice.id, feature: slice.feature, horizon: feature ? feature.horizon : "backlog", order: slice.order || 0, ready: waitsFor.length === 0, waitsFor, approval: s.approval || null });
  }
  // Foundation before breadth (C-008): within a horizon, must before should before could.
  return out.sort((a, b) => HORIZON_ORDER[a.horizon] - HORIZON_ORDER[b.horizon] || priorityOf(model, a.feature) - priorityOf(model, b.feature) || a.feature.localeCompare(b.feature) || a.order - b.order || a.slice.localeCompare(b.slice));
}

function driftActions(drift) {
  const out = [];
  if (!drift || !drift.git) return out;
  if (drift.untrackedCommits.length) {
    const list = drift.untrackedCommits.map((c) => c.short);
    const feature = drift.untrackedCommits.flatMap((c) => c.features)[0];
    out.push({ kind: "record", human: true, commits: list, text: `Record ${list.length} commit(s) made outside the engine (${drift.untrackedCommits.map((c) => `${c.short} "${c.subject}"`).join(", ")}): royascaff record ${list.join(" ")} --as bug|polish|refactor|chore${feature ? ` --affects ${feature}` : ""} "what was done"`, say: `royascaff record ${list.join(" ")}` });
  }
  return out;
}


// Discover stage (1.4 projects): what stands between the project and `approve project`.
function projectAction(model) {
  const a = model.approvals;
  if (!a || a.project.state === "approved") return null;
  const d = a.discovery;
  const file = "project/knowledge/00-discovery/discovery.md";
  if (a.project.state === "stale") {
    return { kind: "approve-project", human: true, stale: true, text: `The discovery, the brief or a project decision changed since ${a.project.by} approved them: review, then run royascaff approve project`, say: "royascaff approve project" };
  }
  if (!d.exists || d.empty.length) {
    return { kind: "discover", card: "discover.md", text: `Discover the project: fill ${d.exists ? `${d.empty.length} empty topic(s) (${d.empty.join(", ")})` : "the 8 topics"} of ${file} from the request; write a QST- question for every gap and an ASM- assumption for everything inferred; then ask the person the questions`, say: "royascaff continue" };
  }
  if (d.open.length) {
    return { kind: "answer-questions", human: true, card: "discover.md", questions: d.open.map((q) => q.id), text: `Ask the person ${d.open.length} open question(s) and record the answers in ${file}: ${d.open.map((q) => `${q.id} · ${q.title}`).join("; ")}`, say: "royascaff continue" };
  }
  const { projectBlockers } = require("../approvals.cjs");
  const blockers = projectBlockers(a);
  if (blockers.length) return { kind: "discover", card: "discover.md", text: `Finish the discovery: ${blockers.join("; ")}`, say: "royascaff continue" };
  const asm = d.assumptions.length ? ` Assumptions to confirm: ${d.assumptions.map((x) => `${x.id} · ${x.title}`).join("; ")}.` : "";
  return { kind: "approve-project", human: true, text: `Ready for the person's review: discovery, business brief, architecture and project decisions (${a.decisions.join(", ")}).${asm} Then run: royascaff approve project`, say: "royascaff approve project" };
}

// Feature plans waiting for a person (Now/Next features with requirements or slices).
function roadmapAction(model, status) {
  const a = model.approvals;
  if (!a) return null;
  const pending = [...model.features.values()].filter((f) => ["now", "next"].includes(f.horizon)).filter((f) => {
    const d = status.features.get(f.id);
    return (d.requirementsTotal || d.slicesTotal) && d.approval !== "approved" && ["outlined", "planned"].includes(d.state);
  });
  if (!pending.length) return null;
  const questions = pending.flatMap((f) => a.features.get(f.id).openQuestions);
  if (questions.length) return { kind: "answer-questions", human: true, card: "plan-feature.md", questions, text: `Ask the person the open feature question(s) and record the answers: ${questions.join(", ")}`, say: "royascaff continue" };
  const list = pending.map((f) => `${f.id}${status.features.get(f.id).approval === "stale" ? " (changed since approval)" : ""}`).join(", ");
  return { kind: "approve-roadmap", human: true, features: pending.map((f) => f.id), text: `Ready for the person's review: the plans of ${list}. Then run: royascaff approve roadmap`, say: "royascaff approve roadmap" };
}

function nextActions(model, status, drift = null) {
  const actions = [];
  const project = projectAction(model);
  if (project && !project.stale) actions.push(project);
  const active = [...model.changes.values()].filter((c) => OPEN_STAGES.includes(status.changes.get(c.id).stage));
  const rank = (c) => (status.changes.get(c.id).blocked ? 0 : c.kind === "bug" ? 1 : 2);
  const sorted = active.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
  for (const change of sorted.filter((c) => rank(c) === 0)) {
    const a = changeAction(model, status, change);
    if (a) actions.push(a);
  }
  actions.push(...driftActions(drift));
  for (const change of sorted.filter((c) => rank(c) > 0)) {
    const a = changeAction(model, status, change);
    if (a) actions.push(a);
  }
  const loose = drift && drift.git ? drift.uncommitted.filter((u) => !u.inTask) : [];
  if (loose.length) actions.push({ kind: "uncommitted", human: true, text: `${loose.length} uncommitted file(s) outside every task (${loose.slice(0, 3).map((u) => u.path).join(", ")}${loose.length > 3 ? ", …" : ""}): commit and record them, or leave them — the engine never discards them`, say: "royascaff status" });
  if (project) {
    // Nothing new is planned or opened before the person approved the project.
    if (project.stale) actions.push(project);
    return actions;
  }
  const next = readySlices(model, status).find((s) => s.ready && (s.horizon === "now" || s.horizon === "next"));
  const roadmap = model.approvals ? roadmapAction(model, status) : null;
  if (roadmap && (!next || next.approval !== "approved")) actions.push(roadmap);
  else if (next) {
    const ref = drift && drift.refinement.get(next.slice);
    const needs = ref && ref.state === "needs";
    actions.push({ kind: "open-slice", slice: next.slice, card: CARD.understand, ...(needs ? { human: true } : {}), needsRefinement: needs ? ref.changed : undefined, text: `Open slice ${next.slice} · ${model.slices.get(next.slice).title} (feature ${next.feature}, ${next.horizon})${needs ? ` — review first: ${ref.changed.join(", ")} changed since it was planned` : ""}`, say: `royascaff open ${next.slice}${needs ? " --confirm-refinement" : ""}` });
  }
  // R6: features whose slices are all done but whose NFRs have no proof yet.
  for (const f of [...model.features.values()].filter((x) => ["now", "next"].includes(x.horizon))) {
    const nfrs = (status.features.get(f.id).unprovenNfrs || []);
    if (!nfrs.length) continue;
    actions.push({ kind: "prove-nfr", feature: f.id, card: CARD.check, text: `Prove ${nfrs.join(", ")} of ${f.id} (all its slices are done): add a test (TEST- with Check: runner:test and Verifies: ${nfrs[0]}) that the next full check proves, or ask a person to check it and record an EVD- with Proves: ${nfrs[0]}`, say: "royascaff continue" });
  }
  if (!actions.filter((a) => a.kind !== "uncommitted").length && model.is14) {
    // C5: existing code that no component owns yet is adopted one module at a time.
    const { adoption } = require("../commands/adopt.cjs");
    const unowned = adoption(model).modules.find((m) => m.percent < 100);
    if (unowned) actions.push({ kind: "adopt", card: "adopt.md", module: unowned.module, text: `Adopt ${unowned.module}: ${unowned.files - unowned.owned} source file(s) belong to no component (${unowned.percent}% owned). Run royascaff adopt to see every module`, say: "royascaff continue" });
  }
  if (!actions.filter((a) => a.kind !== "uncommitted").length) {
    const later = readySlices(model, status).find((s) => s.ready);
    actions.push(later
      ? { kind: "promote", slice: later.slice, text: `Nothing in Now/Next. The next ready slice is ${later.slice} (${later.horizon}): move its feature to Now, or plan a new feature`, say: "royascaff plan feature" }
      : !model.is14 && model.features.size === 0
        ? { kind: "migrate", card: "migrate.md", text: "This project uses an older engine (1.2 or 1.3). Preview the move to 1.4 with royascaff migrate (a dry run: nothing changes), then royascaff migrate --apply", say: "royascaff migrate" }
        : model.features.size === 0
        ? { kind: "plan-feature", card: "plan-feature.md", text: "No features on the roadmap yet. Plan the first one: royascaff new feature \"<title>\" (a project from engine 1.2 or 1.3 can be migrated instead: say \"royascaff migrate\")", say: "royascaff plan feature" }
        : { kind: "plan-feature", card: "plan-feature.md", text: "All planned work is done. Plan a new feature: royascaff new feature \"<title>\"", say: "royascaff plan feature" });
  }
  return actions;
}

module.exports = { nextActions, readySlices, firstReadyTask, changeAction, projectAction, roadmapAction, OPEN_STAGES };
