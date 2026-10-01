"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { renderBoard } = require("../lib/views/board.cjs");
const { indexCommand, tasksCommand, traceCommand, logCommand, statusCommand } = require("../lib/commands/views.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");

const FIX = path.join(__dirname, "fixtures");
const GOLDEN = path.join(__dirname, "golden");
const GREEN = path.join(FIX, "greenfield");
const copy = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-views-"));
  fs.cpSync(GREEN, root, { recursive: true });
  return root;
};

// Golden snapshots: set UPDATE_GOLDEN=1 to regenerate after an intended change.
for (const name of fs.readdirSync(FIX).sort()) {
  test(`${name}: STATUS.md matches the golden snapshot`, () => {
    const model = buildModel(path.join(FIX, name));
    const board = renderBoard(model, deriveStatus(model));
    const file = path.join(GOLDEN, `${name}.STATUS.md`);
    if (process.env.UPDATE_GOLDEN || !fs.existsSync(file)) fs.writeFileSync(file, board);
    assert.equal(board, fs.readFileSync(file, "utf8"));
  });
}

test("the board answers the core questions for the greenfield project", () => {
  const board = fs.readFileSync(path.join(GOLDEN, "greenfield.STATUS.md"), "utf8");
  assert.match(board, /## ▶ Next up\n\n1\. Continue TASK-CAMP-005 · Validate date order/);
  assert.match(board, /\| Now \| CAP-CAMP-001 · Create campaigns \| ✅ Done \| Designed \| 1\/1 \| 2\/2 \| open fix: CHG-CAMP-003 \|/);
  assert.match(board, /\| Now \| CAP-CAMP-002 · Schedule posts \| 🔨 Building \| Designed \| 0\/2 \| 0\/2 \| — \|/);
  assert.match(board, /\| Backlog \| CAP-CAMP-005 · AI caption suggestions \| 💡 Idea \|/);
  assert.match(board, /## Fixes\n\n\| Change \| Kind \|[^\n]*\n\|[-|]+\n\| CHG-CAMP-003/);
  assert.match(board, /SLC-CAMP-002-B · Drag posts between days \| CAP-CAMP-002 \| Now \| SLC-CAMP-002-A \| waits for SLC-CAMP-002-A \|/);
  assert.match(board, /As of the last recorded event: 2026-09-23T10:15Z/);
});

test("index writes project/STATUS.md, a root pointer and summary blocks; a second run changes nothing", () => {
  const root = copy();
  const first = indexCommand(root);
  assert.equal(first.board_changed, true);
  assert.equal(first.root_pointer, "STATUS.md");
  assert.deepEqual(first.summaries_updated, ["knowledge/02-requirements/requirements.md"]);
  assert.match(fs.readFileSync(path.join(root, "STATUS.md"), "utf8"), /\[project\/STATUS\.md\]\(project\/STATUS\.md\)/);
  const req = fs.readFileSync(path.join(root, "project/knowledge/02-requirements/requirements.md"), "utf8");
  assert.match(req, /<!-- royascaff:summary:start -->\n\| ID \| Title \| Kind \| State \| Feature \| Verified by \|/);
  assert.match(req, /\| REQ-CAMP-001 \| Create a campaign \| requirement \| ✅ Done \| CAP-CAMP-001 \| TEST-CAMP-001 \|/);
  assert.match(req, /\| REQ-CAMP-006 \| Reach per campaign \| requirement \| 📝 Outlined \| CAP-CAMP-004 \| — \|/);
  const second = indexCommand(root);
  assert.equal(second.board_changed, false);
  assert.deepEqual(second.summaries_updated, []);
  assert.ok(roundTrip(root).ok);
  assert.deepEqual(buildModel(root).issues, []);
});

test("index never overwrites a root STATUS.md that the team wrote themselves", () => {
  const root = copy();
  fs.writeFileSync(path.join(root, "STATUS.md"), "# Our own status page\n");
  const r = indexCommand(root);
  assert.equal(r.root_pointer, null);
  assert.equal(fs.readFileSync(path.join(root, "STATUS.md"), "utf8"), "# Our own status page\n");
});

test("tasks view: filters by open, change and feature", () => {
  assert.deepEqual(tasksCommand(GREEN).tasks.map((t) => t.id), ["TASK-CAMP-001", "TASK-CAMP-002", "TASK-CAMP-003", "TASK-CAMP-004", "TASK-CAMP-005"]);
  assert.deepEqual(tasksCommand(GREEN, { open: true }).tasks.map((t) => [t.id, t.state]), [["TASK-CAMP-004", "doing"], ["TASK-CAMP-005", "doing"]]);
  assert.deepEqual(tasksCommand(GREEN, { change: "CHG-CAMP-002" }).tasks.map((t) => t.id), ["TASK-CAMP-003", "TASK-CAMP-004"]);
  assert.deepEqual(tasksCommand(GREEN, { feature: "CAP-CAMP-001" }).tasks.map((t) => t.id), ["TASK-CAMP-001", "TASK-CAMP-002", "TASK-CAMP-005"]);
});

test("trace follows a feature and a requirement down to evidence and code", () => {
  const f = traceCommand(GREEN, "CAP-CAMP-001").text;
  assert.match(f, /REQ-CAMP-001 · Create a campaign {3}✅ Done/);
  assert.match(f, /evidence EVD-CAMP-001 · Campaign form tests {3}pass \(CHG-CAMP-001\)/);
  assert.match(f, /code {5}CMP-CAMP-CAMPAIGNS · Campaigns module → apps\/web\/src\/campaigns\/\*\*/);
  assert.match(f, /open fix CHG-CAMP-003/);
  const r = traceCommand(GREEN, "REQ-CAMP-006").text;
  assert.match(r, /slice {4}none — not planned yet/);
  assert.throws(() => traceCommand(GREEN, "TASK-CAMP-001"), /trace works on features/);
});

test("log merges events across changes, newest first, with filters", () => {
  const all = logCommand(GREEN).events;
  assert.equal(all.length, 17); // + two check.red of CHG-CAMP-002 (WP-C4, beta.4 D8: inside the task)
  assert.deepEqual([all[0].change, all[0].event], ["CHG-CAMP-003", "task.started"]);
  assert.equal(logCommand(GREEN, { change: "CHG-CAMP-002" }).events.length, 7);
  assert.equal(logCommand(GREEN, { since: "2026-09-20" }).events.length, 9);
  assert.equal(logCommand(GREEN, { limit: 2 }).events.length, 2);
  assert.throws(() => logCommand(GREEN, { since: "yesterday" }), /--since/);
});

test("status --json gives next actions, features and changes", () => {
  const s = statusCommand(GREEN);
  assert.deepEqual(s.next.map((a) => a.kind), ["continue-task", "continue-task"]);
  assert.equal(s.features.find((f) => f.id === "CAP-CAMP-003").state, "planned");
  assert.equal(s.changes.find((c) => c.id === "CHG-CAMP-001").stage, "closed");
});
