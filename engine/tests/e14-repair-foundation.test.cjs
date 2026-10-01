"use strict";

// E1.4: the bounded repair loop and foundation-before-breadth.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { readySlices, nextActions } = require("../lib/next/actions.cjs");
const { approveFeatures } = require("../lib/commands/approve.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const ID = "CHG-CAMP-002";
const code = (fn) => { try { fn(); } catch (e) { return e; } return null; };

// CHG-CAMP-002 with a Test command that reports cal_ms (default 350, over the limit of 200).
function project({ cal = 350, profile = "" } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e14-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  fs.mkdirSync(path.join(root, "apps/web/src/calendar"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = () => 1;\n");
  const p = path.join(root, "project/profile.md");
  let text = fs.readFileSync(p, "utf8");
  for (const k of ["Build", "Typecheck", "Lint"]) text = text.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), `- **${k}:**`);
  text = text.replace(/- \*\*Test:\*\* .*/, `- **Test:** node -e "console.log('ROYASCAFF_METRIC cal_ms=${cal}')"`);
  if (profile) text = text.replace("project_code: CAMP", `project_code: CAMP\n${profile}`);
  fs.writeFileSync(p, text);
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, fs.readFileSync(reqs, "utf8").replace(/(### REQ-CAMP-003[^\n]*\n\n- \*\*Priority:\*\* must\n- \*\*Owner:\*\* product-owner\n- \*\*Feature:\*\* CAP-CAMP-002\n)/, "$1\nPosts show on their day.\n\n**Acceptance**\n- [metric] `cal_ms <= 200` with 200 posts.\n") + "\n### TEST-CAMP-003 · Calendar tests\n\n- **Owner:** roya-team\n- **Check:** runner:test\n- **Verifies:** REQ-CAMP-003\n");
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  return root;
}
const model = (root) => buildModel(root);
// The action `next` gives for CHG-CAMP-002 (other changes of the fixture come first in `next` itself).
const nextOf = (root) => { const m = model(root); return nextActions(m, deriveStatus(m), null).find((a) => a.change === ID); };
const setCal = (root, v) => { const p = path.join(root, "project/profile.md"); fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace(/cal_ms=\d+/, `cal_ms=${v}`)); };

test("a failed verify gives a repair action naming the failing lines, with the attempt number", () => {
  const root = project();
  const r = work.verify(root, ID, AI);
  assert.equal(r.result, "fail");
  assert.deepEqual([r.repair.failures, r.repair.limit, r.repair.left, r.repair.blocked], [1, 2, 2 - 1, undefined]);
  const n = nextOf(root);
  assert.equal(n.kind, "repair");
  assert.deepEqual(n.repair, { attempt: 1, limit: 2, failing: ["REQ-CAMP-003#1"] });
  assert.match(n.text, /Repair CHG-CAMP-002 \(attempt 1 of 2\): fix the failing lines REQ-CAMP-003#1, then run royascaff verify CHG-CAMP-002/);
  assert.equal(n.say, "royascaff verify CHG-CAMP-002");
});

test("after repair_limit repair attempts the next failure blocks the change and next asks a person", () => {
  const root = project();
  work.verify(root, ID, AI); // failure 1 -> repair attempt 1
  assert.equal(nextOf(root).kind, "repair");
  work.verify(root, ID, AI); // failure 2 -> repair attempt 2
  const second = nextOf(root);
  assert.deepEqual([second.kind, second.repair.attempt], ["repair", 2]);
  const third = work.verify(root, ID, AI); // failure 3: the repairs did not work
  assert.equal(third.repair.blocked, true);
  const m = model(root);
  const last = m.changes.get(ID).events.at(-1);
  assert.equal(last.event, "change.blocked");
  assert.match(last.note, /^repair limit reached: 3 failed attempt\(s\) with 2 repair attempt\(s\) allowed\. A person decides/);
  assert.equal(deriveStatus(m).changes.get(ID).blocked, true);
  const n = nextOf(root);
  assert.deepEqual([n.kind, n.human], ["repair-blocked", true]);
  assert.match(n.text, /Waiting for a person: CHG-CAMP-002 — repair limit reached/);
  // An AI cannot lift the block; a person can, and then the count starts again.
  const refused = code(() => work.setBlocked(root, ID, false, { by: "ai:claude" }));
  assert.equal(refused.code, "HUMAN_REQUIRED");
  work.setBlocked(root, ID, false, { ...ME, reason: "try once more" });
  assert.equal(deriveStatus(model(root)).changes.get(ID).blocked, false);
  assert.notEqual(nextOf(root).kind, "repair-blocked");
  assert.notEqual(nextOf(root).kind, "repair");
  setCal(root, 120);
  const ok = work.verify(root, ID, AI);
  assert.deepEqual([ok.result, ok.repair.failures], ["pass", 0]);
  assert.equal(work.advance(root, ID, "verified", ME).reached, "verified");
});

test("repair_limit in profile.md sets the number of attempts (0 blocks at the first failure)", () => {
  const root = project({ profile: "repair_limit: 0" });
  const r = work.verify(root, ID, AI);
  assert.equal(r.repair.blocked, true);
  assert.equal(nextOf(root).kind, "repair-blocked");
  const root1 = project({ profile: "repair_limit: 1" });
  assert.equal(work.verify(root1, ID, AI).repair.blocked, undefined);
  assert.equal(nextOf(root1).kind, "repair");
  assert.equal(work.verify(root1, ID, AI).repair.blocked, true);
});

test("a judge's not-met counts as a failed attempt too", () => {
  const root = project({ cal: 120 });
  assert.equal(work.verify(root, ID, AI).result, "pass");
  work.judge(root, ID, { line: "REQ-CAMP-003#1", verdict: "not-met", reason: "wrong day", by: "ai:codex:judge" });
  const n = nextOf(root);
  assert.equal(n.kind, "repair");
  assert.deepEqual(n.repair.failing, ["REQ-CAMP-003#1"]);
});

// ---- foundation before breadth ----------------------------------------------------------------

function roadmapWithFoundation() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e14f-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  // CHG-CAMP-002 closed (as in the work tests), so SLC-CAMP-002-B is ready by its dependency.
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  fs.mkdirSync(path.join(root, "project/changes/CHG-CAMP-002/evidence"), { recursive: true });
  fs.writeFileSync(path.join(root, "project/changes/CHG-CAMP-002/evidence/evidence.md"), "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
  return root;
}

test("new slice --foundation marks it on the feature; the feature's other slices wait for it", () => {
  const root = roadmapWithFoundation();
  assert.deepEqual(readySlices(model(root), deriveStatus(model(root))).find((s) => s.slice === "SLC-CAMP-002-B").ready, true);
  const { newSlice } = require("../lib/commands/plan.cjs");
  const made = newSlice(root, "CAP-CAMP-002", "Design tokens and layout", { foundation: true });
  assert.equal(made.foundation, true);
  const m = model(root);
  assert.deepEqual(m.features.get("CAP-CAMP-002").foundation, [made.id]);
  assert.equal(m.slices.get(made.id).foundation, true);
  assert.equal(m.slices.get("SLC-CAMP-002-B").foundation, false);
  assert.equal(m.issues.filter((i) => i.severity === "error").length, 0);
  approveFeatures(root, ["CAP-CAMP-002"], ME); // the plan changed, so a person approves it again
  const b = readySlices(m, deriveStatus(m)).find((s) => s.slice === "SLC-CAMP-002-B");
  assert.deepEqual([b.ready, b.waitsFor], [false, [made.id]]);
  // Opening the breadth slice is refused; the foundation slice itself opens.
  const e = code(() => work.openSlice(root, "SLC-CAMP-002-B", AI));
  assert.equal(e.code, "GATE_REFUSED");
  assert.match(e.message, new RegExp(`SLC-CAMP-002-B waits for the foundation slice\\(s\\) ${made.id} of CAP-CAMP-002`));
  assert.match(code(() => work.openSlice(root, "SLC-CAMP-002-B", { ...AI, force: true })).message, /--force is for people only/);
  const forced = work.openSlice(root, "SLC-CAMP-002-B", { ...ME, force: true });
  assert.ok(forced.id, "a person may override");
});

test("once the foundation slice is done, the other slices open", () => {
  const root = roadmapWithFoundation();
  // SLC-CAMP-002-A (done) is the foundation of CAP-CAMP-002: written by hand into the roadmap.
  const f = path.join(root, "project/knowledge/00-roadmap/roadmap.md");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("- **Outcome:** OUT-CAMP-001\n\nPlanners add posts", "- **Outcome:** OUT-CAMP-001\n- **Foundation:** SLC-CAMP-002-A\n\nPlanners add posts"));
  approveFeatures(root, ["CAP-CAMP-002"], ME);
  const m = model(root);
  assert.deepEqual(m.features.get("CAP-CAMP-002").foundation, ["SLC-CAMP-002-A"]);
  assert.equal(readySlices(m, deriveStatus(m)).find((s) => s.slice === "SLC-CAMP-002-B").ready, true);
  assert.ok(work.openSlice(root, "SLC-CAMP-002-B", { ...ME, risk: "low" }).id);
});

test("a Foundation entry that is not a slice of the feature is a validation warning", () => {
  const root = roadmapWithFoundation();
  const f = path.join(root, "project/knowledge/00-roadmap/roadmap.md");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("- **Outcome:** OUT-CAMP-001\n\nPlanners add posts", "- **Outcome:** OUT-CAMP-001\n- **Foundation:** SLC-CAMP-001-A\n\nPlanners add posts"));
  assert.ok(model(root).issues.some((i) => i.code === "foundation-not-a-slice-of-feature"));
});
