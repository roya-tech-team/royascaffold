"use strict";

// Step 9: the basic command runner.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const OK = `node -e "console.log('ok')"`;
const FAIL = (msg, code = 2) => `node -e "console.error('${msg}'); process.exit(${code})"`;

// The greenfield project with an app whose commands are given, and CHG-CAMP-002 ready to check.
function project(commands, extraProfile = "") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-run-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  fs.mkdirSync(path.join(root, "apps/web"), { recursive: true });
  const profile = path.join(root, "project/profile.md");
  let text = fs.readFileSync(profile, "utf8");
  for (const k of ["Build", "Typecheck", "Lint", "Test"]) text = text.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), commands[k] ? `- **${k}:** ${commands[k]}` : `- **${k}:**`);
  if (extraProfile) text = text.replace("project_code: CAMP", `project_code: CAMP\n${extraProfile}`);
  fs.writeFileSync(profile, text);
  // TEST-CAMP-003 is a runner-checked test of the requirement CHG-CAMP-002 delivers.
  fs.appendFileSync(path.join(root, "project/knowledge/02-requirements/requirements.md"), "\n### TEST-CAMP-003 · Calendar tests\n\n- **Owner:** roya-team\n- **Check:** runner:test\n- **Verifies:** REQ-CAMP-003\n");
  return root;
}
const events = (root, id) => buildModel(root).changes.get(id).events;

test("full checks pass: evidence is written, proves the runner-checked test, and opens the verified gate", () => {
  const root = project({ Build: OK, Typecheck: OK, Lint: OK, Test: OK });
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  const r = work.recordCheck(root, "CHG-CAMP-002", AI);
  assert.deepEqual([r.mode, r.result, r.results.map((x) => x.kind)], ["full", "pass", ["Build", "Typecheck", "Lint", "Test"]]);
  assert.deepEqual(r.proves, ["TEST-CAMP-003"]);
  const m = buildModel(root);
  const evd = m.evidence.get(r.evidence);
  assert.deepEqual([evd.result, evd.proves, evd.change], ["pass", ["TEST-CAMP-003"], "CHG-CAMP-002"]);
  assert.deepEqual(deriveStatus(m).requirements.get("REQ-CAMP-003").evidence, [r.evidence]);
  assert.match(events(root, "CHG-CAMP-002").pop().note, new RegExp(`^pass: APP-CAMP-WEB — build ✓ · typecheck ✓ · lint ✓ · test ✓ \\(${r.evidence}\\)$`));
  assert.equal(work.advance(root, "CHG-CAMP-002", "verified", ME).reached, "verified", "runner evidence satisfies the gate, no hand-written evidence needed");
});

test("a failing command fails the run, keeps its output in the evidence, and blocks the gate", () => {
  const root = project({ Build: OK, Typecheck: FAIL("TS2322 type error in grid.ts"), Lint: OK, Test: OK });
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  const r = work.recordCheck(root, "CHG-CAMP-002", AI);
  assert.equal(r.result, "fail");
  assert.deepEqual(r.proves, []);
  const failed = r.results.find((x) => !x.pass);
  assert.deepEqual([failed.kind, failed.exit], ["Typecheck", 2]);
  assert.match(failed.tail, /TS2322 type error in grid\.ts/);
  const file = fs.readFileSync(path.join(root, "project/changes/CHG-CAMP-002/evidence/checks.md"), "utf8");
  assert.match(file, /- \*\*Result:\*\* fail/);
  assert.match(file, /\*\*Typecheck failed\*\* in `apps\/web`:\n\n```text\nTS2322 type error in grid\.ts\n```/);
  const g = work.advance(root, "CHG-CAMP-002", "verified", ME);
  assert.match(g.steps[0].checks.find((c) => c.id === "checks").message, /last check failed: fail: APP-CAMP-WEB — build ✓ · typecheck ✗/);
});

test("quick checks run typecheck and lint only, and never count as the full check", () => {
  const root = project({ Build: FAIL("should not run"), Typecheck: OK, Lint: OK, Test: FAIL("should not run") });
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  const r = work.recordCheck(root, "CHG-CAMP-002", { quick: true, ...AI });
  assert.deepEqual([r.mode, r.result, r.evidence, r.results.map((x) => x.kind)], ["quick", "pass", null, ["Typecheck", "Lint"]]);
  const g = work.advance(root, "CHG-CAMP-002", "verified", ME);
  assert.equal(g.steps[0].checks.find((c) => c.id === "checks").ok, false);
});

test("a command that runs too long is stopped and reported", () => {
  const root = project({ Test: `node -e "setTimeout(() => {}, 5000)"` }, "check_timeout_seconds: 1");
  const r = work.recordCheck(root, "CHG-CAMP-002", AI);
  assert.equal(r.result, "fail");
  assert.equal(r.results[0].timedOut, true);
  assert.match(r.results[0].tail, /timed out after 1s/);
});

test("without commands the runner explains what to add; a manual result still works", () => {
  const root = project({});
  assert.throws(() => work.recordCheck(root, "CHG-CAMP-002", AI), /No commands to run: add Build \/ Typecheck \/ Lint \/ Test/);
  assert.equal(work.recordCheck(root, "CHG-CAMP-002", { result: "pass", note: "ran on CI", ...ME }).manual, true);
});

test("quick checks on task done (projects created by init): a failure refuses done unless skipped with a reason", () => {
  const root = project({ Typecheck: OK, Lint: FAIL("no-unused-vars in grid.ts", 1) }, "checks_on_task_done: quick");
  assert.throws(() => work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI), /not marked done: quick checks failed[\s\S]*no-unused-vars in grid\.ts[\s\S]*--skip-checks/);
  const d = deriveStatus(buildModel(root));
  assert.equal(d.tasks.get("TASK-CAMP-004").state, "doing");
  assert.match(events(root, "CHG-CAMP-002").pop().note, /^quick fail: APP-CAMP-WEB — typecheck ✓ · lint ✗/);
  const r = work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", { ...AI, "skip-checks": "lint rule disputed, ticket #12" });
  assert.equal(r.state, "done");
  const log = events(root, "CHG-CAMP-002");
  assert.match(log[log.length - 2].note, /skipped: lint rule disputed, ticket #12/);
});

test("quick checks on task done pass silently when green", () => {
  const root = project({ Typecheck: OK, Lint: OK }, "checks_on_task_done: quick");
  assert.equal(work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI).state, "done");
  const log = events(root, "CHG-CAMP-002");
  assert.deepEqual(log.slice(-2).map((e) => e.event), ["check.run", "task.done"]);
});
