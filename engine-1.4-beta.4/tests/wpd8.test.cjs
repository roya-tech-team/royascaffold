"use strict";

// Beta.4 · WP-D8 (testing inside every change and every task) and WP-D9 (the benchmark-review fixes
// the engine owns: an honest look, a stated trade-off).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const work = require("../lib/commands/work.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { evaluate, changeBody } = require("../lib/gates.cjs");
const adapters = require("../lib/adapters.cjs");

Object.assign(process.env, { GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "dev@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "dev@example.com" });
const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-d8-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const file = (root, rel) => path.join(root, "project", rel);
const edit = (root, rel, fn) => fs.writeFileSync(file(root, rel), fn(fs.readFileSync(file(root, rel), "utf8")));
const g = (root, ...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
const commit = (root, msg) => { g(root, "add", "-A"); g(root, "commit", "-q", "-m", msg); };
const gate = (root, id, to, name) => {
  const model = buildModel(root);
  const change = model.changes.get(id);
  return evaluate({ model, status: deriveStatus(model), change, projectDir: model.root, body: changeBody(model.root, change) }, to).checks.find((c) => c.id === name);
};

test("D8: every requirement a change delivers has a test (runner or manual) before Ready", () => {
  const root = copy();
  edit(root, "knowledge/02-requirements/requirements.md", (t) => t.replace(/\n### TEST-CAMP-012[\s\S]*?(?=\n### |$)/, ""));
  const id = work.openSlice(root, "SLC-CAMP-002-B", { ...ME, force: true, risk: "low" }).id;
  let c = gate(root, id, "ready", "tests-planned");
  assert.equal(c.ok, false);
  assert.match(c.message, /plan a test for every requirement this change delivers: REQ-CAMP-004/);
  require("../lib/commands/plan.cjs").newRecord(root, "test", "A person drags a post", { verifies: "REQ-CAMP-004", check: "manual" });
  assert.equal(gate(root, id, "ready", "tests-planned").ok, true, "a should requirement may be verified by a manual test");
});

test("D8: a task that implements a must requirement needs a red run inside the task before done", () => {
  const root = copy();
  edit(root, "changes/CHG-CAMP-002/log.md", (t) => t.replace(/^\| 2026-09-22T09:20Z \| check\.red[^\n]*\n/m, ""));
  assert.throws(() => work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI), /TASK-CAMP-004 implements REQ-CAMP-003 \(must\): tests come first inside the task/);
  edit(root, "profile.md", (t) => t.replace(/- \*\*Test:\*\* .*/, "- **Test:** node -e \"process.exit(1)\""));
  work.recordCheck(root, "CHG-CAMP-002", { red: true, ...AI });
  assert.equal(work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI).state, "done");
});

test("D9: a person's look is confirmed in a terminal; without one it is refused, and the log says look:tty", () => {
  const root = copy();
  edit(root, "profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [web-ui]\n"));
  const look = (extra) => work.recordCheck(root, "CHG-CAMP-001", { result: "pass", note: "looked at the form", bar: "all", ...ME, ...extra });
  assert.throws(() => look({}), /confirmed in a terminal/, "the test environment has no terminal (ROYASCAFF_NO_TTY)");
  assert.throws(() => look({ confirm: () => null }), /confirmed in a terminal/);
  assert.throws(() => look({ confirm: () => "no" }), /Look not recorded/);
  let asked = "";
  const r = look({ confirm: (p) => { asked = p; return "yes"; } });
  assert.match(r.note, /^pass: looked at the form · bar: all 5 · look:tty$/);
  assert.match(asked, /✓ 1\. Calm like a paper planner[\s\S]*Record this look as islam\? Type yes/);
  // An AI's own pass is a check, not a look: no bar, no terminal.
  assert.match(work.recordCheck(root, "CHG-CAMP-001", { result: "pass", note: "runner", ...AI }).note, /^pass: runner$/);
});

test("D9: a change that removes lighting or antialiasing states the trade-off (a warning, from the web-3d manifest)", () => {
  assert.ok(adapters.policyOf(["web-3d"]).tradeoffs.length, "web-3d declares its trade-offs");
  assert.equal(adapters.policyOf(["web-ui"]).tradeoffs, undefined);
  const root = copy();
  g(root, "init", "-q");
  commit(root, "initial");
  const id = work.openSlice(root, "SLC-CAMP-002-B", { ...ME, force: true, risk: "low" }).id;
  commit(root, `${id}: open`);
  edit(root, "profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [web-3d]\n"));
  fs.mkdirSync(path.join(root, "apps/web/src/calendar"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/scene.tsx"), "export const gl = { antialias: false };\n");
  commit(root, "cheaper rendering");
  let c = gate(root, id, "verified", "quality-tradeoff");
  assert.equal(c.ok, true, "a warning, not a refusal");
  assert.equal(c.warning, true);
  assert.match(c.message, /⚠ this change looks like it lowers the look \(lighting, antialiasing, pixel ratio or post-processing reduced\)/);
  edit(root, `changes/${id}/change.md`, (t) => t.replace(/_How the system will look after this change[^\n]*_/, "Drag in CMP-CAMP-CALENDAR. Trade-off: antialiasing off on low-end laptops."));
  c = gate(root, id, "verified", "quality-tradeoff");
  assert.equal(c.warning, false);
  assert.match(c.message, /trade-off stated in the After-state/);
});
