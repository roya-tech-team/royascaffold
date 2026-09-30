"use strict";

// Step 12b · WP3 (plan file 10 §5): priority order, design and record gates, required fields,
// `next` knows whether the project is set up. (A1, the baseline rule, is in derive.test.cjs.)

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const work = require("../lib/commands/work.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { approveFeatures } = require("../lib/commands/approve.cjs");

Object.assign(process.env, { GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "dev@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "dev@example.com" });
const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");

function copy() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp3-"));
  fs.cpSync(GREEN, root, { recursive: true });
  return root;
}
const file = (root, rel) => path.join(root, "project", rel);
const edit = (root, rel, fn) => fs.writeFileSync(file(root, rel), fn(fs.readFileSync(file(root, rel), "utf8")));
const failed = (r) => r.steps[r.steps.length - 1].checks.filter((c) => !c.ok);
const g = (root, ...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
const commit = (root, msg) => { g(root, "add", "-A"); g(root, "commit", "-q", "-m", msg); };

// Close CHG-CAMP-002 so that SLC-CAMP-002-B can open, then open it.
function openDrag(root, risk = "low") {
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  fs.mkdirSync(file(root, "changes/CHG-CAMP-002/evidence"), { recursive: true });
  fs.writeFileSync(file(root, "changes/CHG-CAMP-002/evidence/evidence.md"), "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  if (fs.existsSync(path.join(root, ".git"))) commit(root, "CHG-CAMP-002: evidence");
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
  return work.openSlice(root, "SLC-CAMP-002-B", { ...ME, risk }).id;
}

test("A2: within a horizon, a must feature's slice comes before a could feature's", () => {
  const root = copy();
  // CAP-CAMP-003 (next) becomes a Now feature with priority could; CAP-CAMP-002's next slice is must.
  edit(root, "knowledge/00-roadmap/roadmap.md", (t) => t.replace("- **Priority:** should\n- **Horizon:** next", "- **Priority:** could\n- **Horizon:** now").replace("| SLC-CAMP-003-A | Approval link for clients | 1 | SLC-CAMP-002-A |", "| SLC-CAMP-003-A | Approval link for clients | 1 | — |"));
  approveFeatures(root, ["CAP-CAMP-003"], ME);
  work.advance(root, "CHG-CAMP-002", "cancelled", { ...ME, reason: "restart" });
  work.advance(root, "CHG-CAMP-003", "cancelled", { ...ME, reason: "not now" });
  const n = nextCommand(root);
  assert.equal(n.kind, "open-slice");
  assert.equal(n.slice, "SLC-CAMP-002-A", "must (CAP-CAMP-002) before could (CAP-CAMP-003), although CAP-CAMP-003's slice has no dependency");
});

test("A3: a changed layer must name what it affects; IDs must exist; the design names its records", () => {
  const root = copy();
  const id = openDrag(root);
  const rel = `changes/${id}/change.md`;
  edit(root, rel, (t) => t.replace(/\| \? \|/g, "| unchanged |").replace("| Components & tests | unchanged | |", "| Components & tests | changed | |"));
  let r = work.advance(root, id, "analyzed", AI);
  assert.match(failed(r).map((c) => c.message).join(), /name the affected IDs or pages of every changed or referenced layer \(Components & tests \(changed\)\)/);
  edit(root, rel, (t) => t.replace("| Components & tests | changed | |", "| Components & tests | changed | CMP-CAMP-DRAG |"));
  r = work.advance(root, id, "analyzed", AI);
  assert.match(failed(r).map((c) => c.message).join(), /these do not exist: CMP-CAMP-DRAG/);
  edit(root, rel, (t) => t.replace("CMP-CAMP-DRAG", "CMP-CAMP-CALENDAR, apps/web/src/calendar/drag.ts"));
  assert.equal(work.advance(root, id, "analyzed", AI).reached, "analyzed");
  edit(root, rel, (t) => t.replace(/_How the system will look after this change[^\n]*_/, "Posts can be dragged between days."));
  r = work.advance(root, id, "approved", AI);
  assert.deepEqual(failed(r).map((c) => c.id), ["design-records", "design-covers-impact"]);
  edit(root, rel, (t) => t.replace("Posts can be dragged between days.", "CMP-CAMP-CALENDAR lets posts be dragged between days."));
  assert.equal(work.advance(root, id, "approved", AI).reached, "approved");
});

test("A4: Check & Record refuses unowned changed code and an architecture change that the page does not show", () => {
  const root = copy();
  g(root, "init", "-q");
  commit(root, "initial");
  const id = openDrag(root);
  const rel = `changes/${id}/change.md`;
  edit(root, rel, (t) => t.replace(/\| \? \|/g, "| unchanged |").replace("| Architecture | unchanged | |", "| Architecture | changed | apps/web/src/dnd |").replace(/_How the system will look after this change[^\n]*_/, "CMP-CAMP-CALENDAR uses a new drag layer in apps/web/src/dnd."));
  const t = work.newTask(root, id, "Drag layer", { inputs: "REQ-CAMP-004,CMP-CAMP-CALENDAR", paths: "apps/web/src/dnd/**", checks: "test", done: "posts move" }).id;
  assert.equal(work.advance(root, id, "ready", AI).reached, "ready");
  commit(root, `${id}: plan`);
  work.taskAction(root, t, "start", "", AI);
  fs.mkdirSync(path.join(root, "apps/web/src/dnd"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps/web/src/dnd/layer.ts"), "export const layer = 1;\n");
  commit(root, `${t}: drag layer`);
  work.taskAction(root, t, "done", "drag layer added", AI);
  work.recordCheck(root, id, { result: "pass", ...AI });
  fs.mkdirSync(file(root, `changes/${id}/evidence`), { recursive: true });
  fs.writeFileSync(file(root, `changes/${id}/evidence/e.md`), "### EVD-CAMP-030 · Drag\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-004\n");
  commit(root, `${id}: evidence`);
  let r = work.advance(root, id, "reconciled", AI);
  assert.equal(r.reached, "verified");
  assert.deepEqual(failed(r).map((c) => c.id).sort(), ["architecture-updated", "code-owned"]);
  assert.match(failed(r).find((c) => c.id === "code-owned").message, /apps\/web\/src\/dnd\/layer\.ts/);
  edit(root, "knowledge/05-implementation/components/components.md", (x) => `${x}\n### CMP-CAMP-DND · Drag layer\n\n- **Owner:** roya-team\n- **Code:** apps/web/src/dnd/**\n- **Realizes:** REQ-CAMP-004\n`);
  edit(root, "knowledge/04-design/architecture.md", (x) => `${x}\nA drag layer (CMP-CAMP-DND) sits between the calendar and the pointer.\n`);
  // Beta.4 (D2): a component added in this change makes Components & tests "changed".
  r = work.advance(root, id, "reconciled", AI);
  assert.deepEqual(failed(r).map((c) => c.id), ["new-records-in-impact"]);
  assert.match(failed(r)[0].message, /CMP-CAMP-DND → Components & tests/);
  edit(root, rel, (x) => x.replace("| Components & tests | unchanged | |", "| Components & tests | changed | CMP-CAMP-DND |"));
  r = work.advance(root, id, "reconciled", AI);
  assert.equal(r.reached, "reconciled");
});

test("A5: required fields per kind and ID ranges in relations are flagged (1.4 projects)", () => {
  const root = copy();
  edit(root, "knowledge/02-requirements/requirements.md", (t) => `${t}\n### REQ-CAMP-090 · Orphan\n\n- **Priority:** could\n\n### TEST-CAMP-090 · Range\n\n- **Check:** manual\n- **Verifies:** REQ-CAMP-001 through REQ-CAMP-005\n`);
  const issues = buildModel(root).issues.map((i) => `${i.code}:${i.message.split(" ")[0]}`);
  assert.ok(issues.includes("requirement-without-feature:REQ-CAMP-090"));
  assert.ok(issues.includes("id-range-in-relation:TEST-CAMP-090"));
  assert.deepEqual(buildModel(path.join(__dirname, "fixtures", "kuni-1.3")).issues.filter((i) => /without-feature|id-range/.test(i.code)), [], "1.3 projects keep their own rules");
});

test("A6: next says whether the project is set up", () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "rs-empty-"));
  const n = nextCommand(empty);
  assert.deepEqual([n.initialized, n.kind, n.card], [false, "start", "start.md"]);
  assert.equal(nextCommand(GREEN).initialized, true);
});
