"use strict";

// Step 5: gates (plan 09 §3.6), work commands, `next` decision table (02 §4.3), cold resume.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { nextCommand, briefCommand } = require("../lib/commands/navigate.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");

function copy() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-work-"));
  fs.cpSync(GREEN, root, { recursive: true });
  return root;
}
const read = (root, rel) => fs.readFileSync(path.join(root, "project", rel), "utf8");
const write = (root, rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, "project", rel)), { recursive: true });
  fs.writeFileSync(path.join(root, "project", rel), text);
};
const statusOf = (root, id) => buildModel(root).changes.get(id).status;
const failed = (r) => r.steps[r.steps.length - 1].checks.filter((c) => !c.ok).map((c) => c.id);

function classify(root, id, { afterState = true } = {}) {
  const rel = `changes/${id}/change.md`;
  let s = read(root, rel).replace(/\| \? \|/g, "| referenced |");
  if (afterState) s = s.replace("_How the system will look after this change: decisions and links to ADR- / CMP- / CTR- records._", "Posts become draggable.");
  write(root, rel, s);
}

// Finish CHG-CAMP-002 so that SLC-CAMP-002-B becomes ready, then open it.
function withOpenSlice(risk = "medium") {
  const root = copy();
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  write(root, "changes/CHG-CAMP-002/evidence/evidence.md", "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
  const opened = work.openSlice(root, "SLC-CAMP-002-B", { ...ME, risk });
  return { root, id: opened.id };
}

function fullTask(root, id, extra = {}) {
  return work.newTask(root, id, "Draggable posts", { inputs: "REQ-CAMP-004,CMP-CAMP-CALENDAR", paths: "apps/web/src/calendar/**", checks: "typecheck,test", done: "a post moves to another day", ...extra });
}

test("open: slices must be ready; fixes need --affects; IDs are sequential", () => {
  const root = copy();
  assert.throws(() => work.openSlice(root, "SLC-CAMP-002-B", ME), /waits for SLC-CAMP-002-A/);
  assert.throws(() => work.openSlice(root, "SLC-CAMP-002-A", ME), /already has change CHG-CAMP-002/);
  assert.throws(() => work.openOther(root, "Typo", { kind: "polish" }), /needs --affects/);
  const fix = work.openOther(root, "Typo on the form", { kind: "polish", affects: "REQ-CAMP-001", ...ME });
  assert.deepEqual([fix.id, fix.risk], ["CHG-CAMP-004", "low"]);
  const m = buildModel(root);
  assert.equal(m.changes.get("CHG-CAMP-004").status, "draft");
  assert.deepEqual(m.changes.get("CHG-CAMP-004").events.map((e) => [e.event, e.by]), [["change.opened", "islam"]]);
  assert.deepEqual(m.issues, []);
  assert.ok(roundTrip(root).ok);
});

test("gate draft → analyzed: every impact layer classified, risk set", () => {
  const { root, id } = withOpenSlice();
  let r = work.advance(root, id, "analyzed", ME);
  assert.equal(r.ok, false);
  assert.deepEqual(failed(r), ["impact"]);
  classify(root, id);
  r = work.advance(root, id, "analyzed", ME);
  assert.equal(r.reached, "analyzed");
});

test("gate analyzed → approved: after-state and a person's approval of the current design (medium risk)", () => {
  const { root, id } = withOpenSlice("medium");
  classify(root, id, { afterState: false });
  let r = work.advance(root, id, "approved", ME);
  assert.equal(r.reached, "analyzed");
  assert.deepEqual(failed(r), ["after-state", "approval"]);
  classify(root, id);
  assert.throws(() => work.approve(root, id, AI), /must come from a person/);
  work.approve(root, id, ME);
  assert.equal(work.advance(root, id, "approved", ME).reached, "approved");
});

test("an approval goes stale when the design changes", () => {
  const { root, id } = withOpenSlice("medium");
  classify(root, id);
  work.advance(root, id, "analyzed", ME);
  work.approve(root, id, ME);
  write(root, `changes/${id}/change.md`, `${read(root, `changes/${id}/change.md`)}\nAlso snap to the nearest day.\n`);
  const r = work.advance(root, id, "approved", ME);
  assert.equal(r.ok, false);
  assert.match(r.steps[0].checks.find((c) => c.id === "approval").message, /design changed after it was approved/);
});

test("low risk needs no approval and can go from draft to ready in one command", () => {
  const { root, id } = withOpenSlice("low");
  classify(root, id);
  fullTask(root, id);
  const r = work.advance(root, id, "ready", AI);
  assert.equal(r.reached, "ready");
  assert.deepEqual(r.steps.map((s) => s.to), ["analyzed", "approved", "ready"]);
  const events = buildModel(root).changes.get(id).events.filter((e) => e.event === "change.advanced").map((e) => e.note);
  assert.deepEqual(events, ["draft → analyzed", "analyzed → approved", "approved → ready"]);
});

test("gate approved → ready: tasks exist, are complete and within budget", () => {
  const { root, id } = withOpenSlice("low");
  classify(root, id);
  let r = work.advance(root, id, "ready", ME);
  assert.deepEqual(failed(r), ["tasks"]);
  work.newTask(root, id, "Half task");
  r = work.advance(root, id, "ready", ME);
  assert.deepEqual(failed(r), ["task-fields"]);
  assert.match(r.steps[r.steps.length - 1].checks.find((c) => c.id === "task-fields").message, /needs Inputs, Allowed paths, Checks, Done when/);
  const pending = r.steps[r.steps.length - 1].checks.filter((c) => c.pending).map((c) => c.id);
  assert.deepEqual(pending, ["context-budget", "refinement"], "context is measured once tasks are complete; refinement needs git");
});

test("the task budget stops oversized slices", () => {
  const { root, id } = withOpenSlice("low");
  classify(root, id);
  for (let i = 0; i < 6; i += 1) fullTask(root, id);
  const r = work.advance(root, id, "ready", ME);
  assert.deepEqual(failed(r), ["task-budget"]);
});

test("tasks: start moves ready → in-progress; done needs a note; dependencies and blocks are respected", () => {
  const { root, id } = withOpenSlice("low");
  classify(root, id);
  const a = fullTask(root, id).id;
  const b = fullTask(root, id, { depends: a }).id;
  assert.throws(() => work.taskAction(root, a, "start", "", AI), /tasks run only when it is ready/);
  work.advance(root, id, "ready", ME);
  assert.throws(() => work.newTask(root, id, "Late task"), /changes the approved plan/);
  assert.throws(() => work.taskAction(root, b, "start", "", AI), new RegExp(`waits for ${a}`));
  assert.throws(() => work.taskAction(root, a, "done", "x", AI), /start it before/);
  work.taskAction(root, a, "start", "", AI);
  assert.equal(statusOf(root, id), "in-progress");
  assert.throws(() => work.taskAction(root, a, "done", "", AI), /hand-off note/);
  work.taskAction(root, a, "block", "waiting for the design token", AI);
  assert.equal(deriveStatus(buildModel(root)).changes.get(id).blocked, true);
  work.taskAction(root, a, "start", "token arrived", AI);
  const r = work.taskAction(root, a, "done", "drag works; drop saves the date", AI);
  assert.deepEqual([r.state, r.tasksDone, r.tasksTotal], ["done", 1, 2]);
  assert.throws(() => work.taskAction(root, a, "start", "", AI), /use --reopen/);
  work.setBlocked(root, id, true, { reason: "client paused the project", ...ME });
  assert.throws(() => work.taskAction(root, b, "start", "", AI), /is blocked: client paused/);
  work.setBlocked(root, id, false, ME);
  work.taskAction(root, b, "start", "", AI);
});

test("gate in-progress → verified: tasks done, fresh passing checks, evidence per requirement", () => {
  const root = copy();
  let r = work.advance(root, "CHG-CAMP-002", "verified", ME);
  assert.deepEqual(failed(r), ["tasks-done", "checks", "evidence"]);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  r = work.advance(root, "CHG-CAMP-002", "verified", ME);
  assert.deepEqual(failed(r), ["checks", "evidence"], "a check older than the last task is stale");
  work.recordCheck(root, "CHG-CAMP-002", { result: "fail", note: "calendar test failed", ...AI });
  r = work.advance(root, "CHG-CAMP-002", "verified", ME);
  assert.match(r.steps[0].checks.find((c) => c.id === "checks").message, /last check failed: fail: calendar test failed/);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  write(root, "changes/CHG-CAMP-002/evidence/evidence.md", "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  assert.equal(work.advance(root, "CHG-CAMP-002", "verified", ME).reached, "verified");
});

test("a bug fix needs passing evidence of its own (a regression check)", () => {
  const root = copy();
  work.taskAction(root, "TASK-CAMP-005", "done", "end date validated", ME);
  work.recordCheck(root, "CHG-CAMP-003", { result: "pass", ...ME });
  let r = work.advance(root, "CHG-CAMP-003", "verified", ME);
  assert.deepEqual(failed(r), ["evidence"]);
  write(root, "changes/CHG-CAMP-003/evidence/regression.md", "### EVD-CAMP-010 · End date regression test\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-001\n");
  r = work.advance(root, "CHG-CAMP-003", "closed", ME);
  assert.equal(r.reached, "closed");
  assert.deepEqual(deriveStatus(buildModel(root)).features.get("CAP-CAMP-001").openFixes, []);
});

test("gate verified → reconciled: the project must validate; high risk needs a second approval", () => {
  const root = copy();
  write(root, "changes/CHG-CAMP-002/change.md", read(root, "changes/CHG-CAMP-002/change.md").replace("risk: medium", "risk: high"));
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  write(root, "changes/CHG-CAMP-002/evidence/evidence.md", "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  let r = work.advance(root, "CHG-CAMP-002", "reconciled", ME);
  assert.equal(r.reached, "verified");
  assert.deepEqual(failed(r), ["approval"]);
  write(root, "knowledge/broken.md", "### REQ-CAMP-099 · Broken\n\n- **Feature:** CAP-CAMP-404\n");
  work.approve(root, "CHG-CAMP-002", ME);
  r = work.advance(root, "CHG-CAMP-002", "reconciled", ME);
  assert.deepEqual(failed(r), ["main-valid"]);
  fs.rmSync(path.join(root, "project/knowledge/broken.md"));
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
});

test("moving back or cancelling needs a reason; a cancelled change frees its slice", () => {
  const { root, id } = withOpenSlice("low");
  classify(root, id);
  work.advance(root, id, "analyzed", ME);
  assert.throws(() => work.advance(root, id, "draft", ME), /needs --reason/);
  assert.equal(work.advance(root, id, "draft", { reason: "impact was wrong", ...ME }).reached, "draft");
  work.advance(root, id, "cancelled", { reason: "client dropped drag and drop", ...ME });
  const d = deriveStatus(buildModel(root));
  assert.equal(d.slices.get("SLC-CAMP-002-B").state, "planned");
  assert.equal(work.openSlice(root, "SLC-CAMP-002-B", ME).id, "CHG-CAMP-005");
});

test("every command refreshes the board", () => {
  const root = copy();
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  assert.match(read(root, "STATUS.md"), /Check CHG-CAMP-002: run the full checks after the last task/);
});

test("next: decision table", () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "rs-empty-"));
  assert.equal(nextCommand(empty).kind, "start");

  const root = copy();
  assert.deepEqual([nextCommand(root).kind, nextCommand(root).task], ["continue-task", "TASK-CAMP-005"]);

  work.taskAction(root, "TASK-CAMP-005", "block", "need the product owner's answer", ME);
  assert.deepEqual([nextCommand(root).kind, nextCommand(root).change], ["unblock", "CHG-CAMP-003"]);
  work.taskAction(root, "TASK-CAMP-005", "start", "answered", ME);
  work.taskAction(root, "TASK-CAMP-005", "done", "fixed", ME);
  assert.deepEqual([nextCommand(root).kind, nextCommand(root).change], ["check", "CHG-CAMP-003"]);
  work.recordCheck(root, "CHG-CAMP-003", { result: "pass", ...ME });
  write(root, "changes/CHG-CAMP-003/evidence/r.md", "### EVD-CAMP-010 · R\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-001\n");
  assert.equal(nextCommand(root).kind, "advance");
  work.advance(root, "CHG-CAMP-003", "reconciled", ME);
  assert.equal(nextCommand(root).kind, "close");
  work.advance(root, "CHG-CAMP-003", "closed", ME);
  assert.deepEqual([nextCommand(root).kind, nextCommand(root).task], ["continue-task", "TASK-CAMP-004"]);
});

test("next: understand, approval, plan, implement, open slice, plan a feature", () => {
  const { root, id } = withOpenSlice("medium");
  work.advance(root, "CHG-CAMP-003", "cancelled", { reason: "moved to next sprint", ...ME });
  let n = nextCommand(root);
  assert.deepEqual([n.kind, n.card], ["understand", "understand.md"]);
  assert.match(n.text, /classify every layer/);
  classify(root, id);
  work.advance(root, id, "analyzed", ME);
  n = nextCommand(root);
  assert.deepEqual([n.kind, n.human, n.say], ["approval", true, `royascaff approve ${id}`]);
  work.approve(root, id, ME);
  work.advance(root, id, "approved", ME);
  n = nextCommand(root);
  assert.deepEqual([n.kind, n.card], ["plan", "plan.md"]);
  const t = fullTask(root, id).id;
  work.advance(root, id, "ready", ME);
  n = nextCommand(root);
  assert.deepEqual([n.kind, n.task, n.card], ["implement", t, "build.md"]);
  work.advance(root, id, "cancelled", { reason: "test", ...ME });
  n = nextCommand(root);
  assert.deepEqual([n.kind, n.say], ["open-slice", "royascaff open SLC-CAMP-002-B"]);
});

test("cold resume: from three states, one call names the right action and the brief stays under 2k tokens", () => {
  // Mid-design: awaiting approval.
  const design = withOpenSlice("medium");
  work.advance(design.root, "CHG-CAMP-003", "cancelled", { reason: "later", ...ME });
  classify(design.root, design.id);
  work.advance(design.root, design.id, "analyzed", ME);
  // Mid-build: the greenfield fixture as it is.
  const build = copy();
  // Awaiting verification: all tasks of CHG-CAMP-002 done, checks not run.
  const verify = copy();
  work.advance(verify, "CHG-CAMP-003", "cancelled", { reason: "later", ...ME });
  work.taskAction(verify, "TASK-CAMP-004", "done", "posts on their day", AI);

  const cases = [
    [design.root, "approval", design.id],
    [build, "continue-task", "CHG-CAMP-003"],
    [verify, "check", "CHG-CAMP-002"],
  ];
  for (const [root, kind, change] of cases) {
    const n = nextCommand(root);
    assert.deepEqual([n.kind, n.change], [kind, change]);
    const b = briefCommand(root);
    assert.equal(b.change, change);
    assert.ok(b.approx_tokens <= 2000, `brief is ${b.approx_tokens} tokens`);
    assert.match(b.text, /## Next action/);
  }
});
