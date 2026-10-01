"use strict";

// Step 6: the git layer, in real temporary git repositories.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const work = require("../lib/commands/work.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { computeDrift } = require("../lib/derive/drift.cjs");

Object.assign(process.env, { GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "dev@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "dev@example.com" });
const ME = { by: "islam" };
const AI = { by: "ai:claude" };

const g = (root, ...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
const put = (root, rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
const commit = (root, msg) => {
  g(root, "add", "-A");
  g(root, "commit", "-q", "-m", msg);
  return g(root, "rev-parse", "--short", "HEAD");
};
const drift = (root) => {
  const m = buildModel(root);
  return computeDrift(m, deriveStatus(m));
};

// The greenfield project as a git repository, with one engine event recorded at a real commit.
function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-git-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  put(root, "apps/web/src/campaigns/form.ts", "export const form = 1;\n");
  put(root, "apps/web/src/calendar/grid.ts", "export const grid = 1;\n");
  g(root, "init", "-q");
  const c0 = commit(root, "initial");
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  commit(root, "royascaff: TASK-CAMP-004 done");
  return { root, c0 };
}

// Closes CHG-CAMP-002 (checks + evidence) so SLC-CAMP-002-B can open.
function closeCalendar(root) {
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  put(root, "project/changes/CHG-CAMP-002/evidence/evidence.md", "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
  commit(root, "royascaff: close CHG-CAMP-002");
}

test("git tracking is off for a project inside another repository", () => {
  const m = buildModel(path.join(__dirname, "fixtures", "greenfield"));
  assert.equal(computeDrift(m, deriveStatus(m)).git, false);
});

test("a commit made by hand is flagged; task paths, the ID convention and knowledge-only commits are not", () => {
  const { root } = repo();
  put(root, "apps/web/src/settings.ts", "export const theme = 'dark';\n");
  const manual = commit(root, "quick settings fix");
  put(root, "apps/web/src/campaigns/form.ts", "export const form = 2;\n");
  commit(root, "inside the bug task's allowed paths");
  put(root, "apps/web/src/analytics/a.ts", "export const a = 1;\n");
  commit(root, "CHG-CAMP-003: small analytics tweak");
  put(root, "project/knowledge/notes.md", "# Notes\n");
  commit(root, "notes");
  const d = drift(root);
  assert.equal(d.git, true);
  assert.deepEqual(d.untrackedCommits.map((c) => [c.short, c.subject, c.files]), [[manual, "quick settings fix", ["apps/web/src/settings.ts"]]]);
  const n = nextCommand(root);
  assert.deepEqual([n.kind, n.commits], ["record", [manual]]);
  const board = indexCommand(root).board;
  assert.match(board, /## ⚠ Work outside the engine/);
  assert.match(board, new RegExp(`\\| ${manual} quick settings fix \\| apps/web/src/settings.ts \\|`));
});

test("record attaches the commit to a new change; it then closes through the normal gates", () => {
  const { root } = repo();
  put(root, "apps/web/src/utils/dates.ts", "export const rule = 1;\n");
  const fix = commit(root, "hot fix: date rule");
  work.advance(root, "CHG-CAMP-003", "cancelled", { reason: "fixed by hand instead", ...ME });
  commit(root, "royascaff: cancel");
  assert.equal(drift(root).untrackedCommits.length, 1);
  assert.throws(() => work.recordWork(root, [fix], "date rule", { as: "bug" }), /needs --affects/);
  const r = work.recordWork(root, [fix], "end date must follow the start date", { as: "bug", affects: "REQ-CAMP-001", ...ME });
  const m = buildModel(root);
  const change = m.changes.get(r.id);
  assert.deepEqual([change.kind, change.status, change.affects], ["bug", "in-progress", ["REQ-CAMP-001"]]);
  assert.match(fs.readFileSync(path.join(root, "project", change.file), "utf8"), new RegExp("## Recorded work[\\s\\S]*`" + fix + "` hot fix: date rule — apps/web/src/utils/dates.ts"));
  assert.deepEqual(drift(root).untrackedCommits, []);
  work.recordCheck(root, r.id, { result: "pass", ...ME });
  put(root, `project/changes/${r.id}/evidence/e.md`, "### EVD-CAMP-020 · Regression\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-001\n");
  assert.equal(work.advance(root, r.id, "closed", ME).reached, "closed");
});

test("uncommitted developer files are reported, never touched; files inside a task in progress are task work", () => {
  const { root } = repo();
  put(root, "apps/web/src/notes.ts", "// my local idea\n");
  put(root, "apps/web/src/campaigns/form.ts", "export const form = 3;\n");
  const u = drift(root).uncommitted;
  assert.deepEqual(u.map((x) => [x.path, x.inTask]).sort(), [["apps/web/src/campaigns/form.ts", "TASK-CAMP-005"], ["apps/web/src/notes.ts", null]]);
  indexCommand(root);
  assert.equal(fs.readFileSync(path.join(root, "apps/web/src/notes.ts"), "utf8"), "// my local idea\n");
  assert.equal(nextCommand(root).others.some((t) => /1 uncommitted file\(s\) outside every task \(apps\/web\/src\/notes\.ts\)/.test(t)), true);
});

test("starting a task backs up the developer's uncommitted files in its paths — without changing them", () => {
  const { root } = repo();
  closeCalendar(root);
  const opened = work.openSlice(root, "SLC-CAMP-002-B", { ...ME, risk: "low" });
  const cf = path.join(root, "project/changes", opened.id, "change.md");
  fs.writeFileSync(cf, fs.readFileSync(cf, "utf8").replace(/\| \? \|/g, "| referenced |").replace(/_How the system[^\n]*_/, "Drag posts."));
  const t = work.newTask(root, opened.id, "Draggable posts", { inputs: "REQ-CAMP-004", paths: "apps/web/src/calendar/**", checks: "test", done: "posts move" }).id;
  work.advance(root, opened.id, "ready", ME);
  commit(root, "royascaff: plan");
  put(root, "apps/web/src/calendar/grid.ts", "export const grid = 'developer edit';\n");
  put(root, "apps/web/src/calendar/new-helper.ts", "export const h = 1;\n");
  work.taskAction(root, t, "start", "", AI);
  assert.equal(fs.readFileSync(path.join(root, "apps/web/src/calendar/grid.ts"), "utf8"), "export const grid = 'developer edit';\n");
  const list = work.backups(root);
  assert.equal(list.length, 1);
  assert.deepEqual(list[0].files.map((f) => f.path).sort(), ["apps/web/src/calendar/grid.ts", "apps/web/src/calendar/new-helper.ts"]);
  assert.ok(list[0].stash);
  assert.match(g(root, "stash", "list"), /royascaff backup/);
  assert.match(g(root, "status", "--porcelain"), /M apps\/web\/src\/calendar\/grid\.ts/);
  const events = buildModel(root).changes.get(opened.id).events.map((e) => e.event);
  assert.deepEqual(events.slice(-3), ["change.advanced", "backup.saved", "task.started"]);
  assert.equal(fs.readFileSync(path.join(root, "project/.backups/.gitignore"), "utf8").includes("*"), true);

  put(root, "apps/web/src/calendar/grid.ts", "export const grid = 'overwritten by the task';\n");
  const r = work.backups(root, "restore", list[0].id);
  assert.deepEqual(r.restored.sort(), ["apps/web/src/calendar/grid.ts", "apps/web/src/calendar/new-helper.ts"]);
  assert.equal(fs.readFileSync(path.join(root, "apps/web/src/calendar/grid.ts"), "utf8"), "export const grid = 'developer edit';\n");
  assert.ok(r.safety, "the overwritten version is backed up before restoring");
  assert.equal(work.backups(root).length, 2);
});

test("a Done requirement whose code changes afterwards shows 'changed since verified' until a change covers it", () => {
  const { root, c0 } = repo();
  const evd = path.join(root, "project/changes/CHG-CAMP-001/evidence/evidence.md");
  fs.writeFileSync(evd, fs.readFileSync(evd, "utf8").replace(/c3d4e5f/g, c0));
  work.advance(root, "CHG-CAMP-003", "cancelled", { reason: "not needed", ...ME });
  commit(root, "royascaff: evidence at c0, cancel bug");
  assert.equal(drift(root).changedSinceVerified.size, 0);
  put(root, "apps/web/src/campaigns/form.ts", "export const form = 'changed later';\n");
  commit(root, "tweak the form");
  const d = drift(root);
  assert.deepEqual(d.changedSinceVerified.get("REQ-CAMP-001").files, ["apps/web/src/campaigns/form.ts"]);
  assert.deepEqual(d.featureChanged.get("CAP-CAMP-001").sort(), ["REQ-CAMP-001", "REQ-CAMP-002"]);
  assert.equal(deriveStatus(buildModel(root)).features.get("CAP-CAMP-001").state, "done", "Done is not undone, it is flagged");
  assert.match(indexCommand(root).board, /⚠️ changed since verified: REQ-CAMP-001, REQ-CAMP-002/);
  work.openOther(root, "Form tweak review", { kind: "bug", affects: "CAP-CAMP-001", ...ME });
  assert.equal(drift(root).featureChanged.has("CAP-CAMP-001"), false);
});

test("refinement: a slice whose requirements changed since planning must be reviewed before it opens", () => {
  const { root } = repo();
  assert.equal(drift(root).refinement.get("SLC-CAMP-003-A").state, "unknown", "fixture Planned at is not a real commit");
  work.refine(root, "SLC-CAMP-003-A", ME);
  commit(root, "royascaff: re-plan slice");
  assert.equal(drift(root).refinement.get("SLC-CAMP-003-A").state, "ok");
  const req = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(req, fs.readFileSync(req, "utf8").replace("### REQ-CAMP-005 · Client approves a post", "### REQ-CAMP-005 · Client approves or rejects a post"));
  commit(root, "product owner widened approval");
  assert.deepEqual(drift(root).refinement.get("SLC-CAMP-003-A").changed, ["REQ-CAMP-005"]);
  assert.match(indexCommand(root).board, /⚠ needs refinement: REQ-CAMP-005/);
  assert.throws(() => work.openSlice(root, "SLC-CAMP-003-A", { ...ME, force: true }), /needs refinement: REQ-CAMP-005 changed since it was planned/);
  const opened = work.openSlice(root, "SLC-CAMP-003-A", { ...ME, force: true, risk: "low", "confirm-refinement": true });
  const events = buildModel(root).changes.get(opened.id).events;
  assert.deepEqual(events.map((e) => e.event), ["change.opened", "refinement.confirmed"]);
  assert.match(events[1].note, /REQ-CAMP-005/);
});

test("the ready gate catches requirement changes made after the change was opened", () => {
  const { root } = repo();
  closeCalendar(root);
  const opened = work.openSlice(root, "SLC-CAMP-002-B", { ...ME, risk: "low" });
  const cf = path.join(root, "project/changes", opened.id, "change.md");
  fs.writeFileSync(cf, fs.readFileSync(cf, "utf8").replace(/\| \? \|/g, "| referenced |").replace(/_How the system[^\n]*_/, "Drag posts."));
  work.newTask(root, opened.id, "Draggable posts", { inputs: "REQ-CAMP-004", paths: "apps/web/src/calendar/**", checks: "test", done: "posts move" });
  commit(root, "royascaff: open and plan");
  const req = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(req, fs.readFileSync(req, "utf8").replace("### REQ-CAMP-004 · Move a post to another day", "### REQ-CAMP-004 · Move a post to another day or week"));
  let r = work.advance(root, opened.id, "ready", ME);
  const refinement = r.steps[r.steps.length - 1].checks.find((c) => c.id === "refinement");
  assert.equal(refinement.ok, false);
  assert.match(refinement.message, /REQ-CAMP-004 — review them, then: royascaff refine/);
  work.refine(root, opened.id, { ...ME, note: "week moves are fine for this slice" });
  r = work.advance(root, opened.id, "ready", ME);
  assert.equal(r.reached, "ready");
  const confirm = buildModel(root).changes.get(opened.id).events.find((e) => e.event === "refinement.confirmed");
  assert.match(confirm.note, /REQ-CAMP-004@[0-9a-f]{8}/);
});
