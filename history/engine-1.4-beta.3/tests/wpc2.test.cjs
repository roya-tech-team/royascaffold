"use strict";

// Step 12c · WP-C2 + WP-C3: quality is planned, foundation first, breadth waits, deferrals name a slice.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { approveFeatures } = require("../lib/commands/approve.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { readySlices } = require("../lib/next/actions.cjs");
const { evaluate, changeBody } = require("../lib/gates.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-c2-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  return root;
}
const edit = (root, rel, fn) => fs.writeFileSync(path.join(root, "project", rel), fn(fs.readFileSync(path.join(root, "project", rel), "utf8")));
const ROADMAP = "knowledge/00-roadmap/roadmap.md";
const addSlice = (root, after, row) => edit(root, ROADMAP, (t) => t.replace(after, `${after}\n${row}`));
const slices = (root) => {
  const m = buildModel(root);
  return readySlices(m, deriveStatus(m));
};
const issues = (root, re) => buildModel(root).issues.filter((i) => re.test(i.code)).map((i) => `${i.severity}:${i.code}`);
const nextTexts = (root) => {
  const n = nextCommand(root);
  return [n.text, ...(n.others || [])];
};

test("P2: a must NFR of a Now feature in no slice blocks the plan approval", () => {
  const root = project();
  const nfr = newRecord(root, "nfr", "The calendar stays readable with 200 posts", { feature: "CAP-CAMP-002", priority: "must" });
  newRecord(root, "nfr", "Nice hover effect", { feature: "CAP-CAMP-002", priority: "could" });
  assert.throws(() => approveFeatures(root, ["CAP-CAMP-002"], ME), new RegExp(`${nfr.id} \\(must\\) is in no slice`));
  addSlice(root, "| SLC-CAMP-002-B | Drag posts between days | 2 | SLC-CAMP-002-A | REQ-CAMP-004 | a1b2c3d |", `| SLC-CAMP-002-C | Readable calendar foundation | 3 | — | ${nfr.id} | a1b2c3d |`);
  const r = approveFeatures(root, ["CAP-CAMP-002"], ME);
  assert.deepEqual(r.approved.map((x) => x.id), ["CAP-CAMP-002"]);
});

test("P2: the slice that delivers a must NFR is proposed first within its priority", () => {
  const root = project();
  const nfr = newRecord(root, "nfr", "Theme and lighting tokens", { feature: "CAP-CAMP-002", priority: "must" });
  addSlice(root, "| SLC-CAMP-002-B | Drag posts between days | 2 | SLC-CAMP-002-A | REQ-CAMP-004 | a1b2c3d |", `| SLC-CAMP-002-C | Look-and-feel foundation | 3 | — | ${nfr.id} | a1b2c3d |`);
  const order = slices(root).map((s) => s.slice);
  assert.ok(order.indexOf("SLC-CAMP-002-C") < order.indexOf("SLC-CAMP-002-B"), order.join(", "));
  assert.equal(slices(root).find((s) => s.slice === "SLC-CAMP-002-C").foundation, true);
  assert.match(indexCommand(root).board, /SLC-CAMP-002-C · Look-and-feel foundation[^\n]*· foundation/);
});

test("P4: a Next slice waits while a Now feature is unfinished; only a person may force it", () => {
  const root = project();
  const s = slices(root).find((x) => x.slice === "SLC-CAMP-003-A");
  assert.deepEqual([s.ready, s.waitsForNow], [false, ["CAP-CAMP-002"]]);
  assert.throws(() => work.openSlice(root, "SLC-CAMP-003-A", AI), /waits for the Now features: CAP-CAMP-002 not done yet/);
  assert.throws(() => work.openSlice(root, "SLC-CAMP-003-A", { ...AI, force: true }), /--force is for people only/);
  assert.match(indexCommand(root).board, /SLC-CAMP-003-A · Approval link for clients[^\n]*\| waits for SLC-CAMP-002-A/);
  const opened = work.openSlice(root, "SLC-CAMP-003-A", { ...ME, force: true, risk: "low" });
  assert.match(opened.id, /^CHG-CAMP-/);
});

test("P4: with web-ui, a done Now feature is accepted after a person's look; then Next work is ready", () => {
  const root = project();
  // Only CAP-CAMP-001 (done) stays in Now; the person moved CAP-CAMP-002 to Next on purpose.
  edit(root, ROADMAP, (t) => t.replace(/(## CAP-CAMP-002[\s\S]*?\*\*Horizon:\*\* )now/, "$1next"));
  let s = slices(root).find((x) => x.slice === "SLC-CAMP-002-B");
  assert.deepEqual(s.waitsForNow, [], "generic adapter: Done is enough");
  edit(root, "profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [web-ui]\n"));
  s = slices(root).find((x) => x.slice === "SLC-CAMP-002-B");
  assert.deepEqual(s.waitsForNow, ["CAP-CAMP-001"]);
  const m = buildModel(root);
  assert.deepEqual(require("../lib/quality.cjs").nowWaits(m, deriveStatus(m)), [{ id: "CAP-CAMP-001", reason: "done, waiting for a person's look at CHG-CAMP-001", change: "CHG-CAMP-001" }]);
  work.recordCheck(root, "CHG-CAMP-001", { result: "pass", note: "looked at the campaign form", ...AI });
  assert.deepEqual(slices(root).find((x) => x.slice === "SLC-CAMP-002-B").waitsForNow, ["CAP-CAMP-001"], "the AI's check is not a person's look");
  work.recordCheck(root, "CHG-CAMP-001", { result: "pass", note: "looked at the campaign form", bar: "all", ...ME });
  assert.deepEqual(slices(root).find((x) => x.slice === "SLC-CAMP-002-B").waitsForNow, []);
});

test("P3: deferrals name an open slice; missing, finished and vague deferrals are reported", () => {
  const root = project();
  const add = (text) => edit(root, "knowledge/04-design/decisions.md", (t) => `${t}\n${text}\n`);
  add("### ADR-CAMP-050 · Week view comes later\n\n- **Owner:** product-owner\n- **Deferred to:** SLC-CAMP-002-B\n\n**Choice:** day view first.\n");
  assert.deepEqual(issues(root, /deferr/), [], "a deferral to an open slice is fine");
  assert.match(indexCommand(root).board, /SLC-CAMP-002-B · Drag posts between days[^\n]*· 1 deferred item\(s\)/);
  add("### ADR-CAMP-051 · Export\n\n- **Owner:** product-owner\n- **Deferred to:** SLC-CAMP-009-A\n");
  add("### ADR-CAMP-052 · Filters\n\n- **Owner:** product-owner\n- **Deferred to:** SLC-CAMP-001-A\n");
  add("### ADR-CAMP-053 · Colors\n\n- **Owner:** product-owner\n\n**Choice:** brand colors come in a later slice.\n");
  assert.deepEqual(issues(root, /deferr/).sort(), ["error:deferred-to-missing-slice", "warning:deferred-to-finished-slice", "warning:vague-deferral"]);
});

test("P3: a feature design with a vague deferral is refused at the Approved gate", () => {
  const root = project();
  const cf = "changes/CHG-CAMP-002/change.md";
  edit(root, cf, (t) => `${t}\n## After-state\n\nA month grid in ADR-CAMP-001. Dragging posts is not in this slice.\n`);
  const gate = () => {
    const model = buildModel(root);
    const change = model.changes.get("CHG-CAMP-002");
    return evaluate({ model, status: deriveStatus(model), change, projectDir: model.root, body: changeBody(model.root, change) }, "approved").checks.find((c) => c.id === "deferrals");
  };
  assert.equal(gate().ok, false);
  assert.match(gate().message, /write Deferred to: SLC-/);
  assert.ok(issues(root, /vague-deferral/).length === 1);
  edit(root, cf, (t) => t.replace("Dragging posts is not in this slice.", "Dragging posts is not in this slice. Deferred to: SLC-CAMP-002-B"));
  assert.equal(gate().ok, true);
  assert.deepEqual(issues(root, /deferr/), []);
});

test("P4: when only the Now acceptance stands in the way, next asks the person to look", () => {
  const root = project();
  for (const c of ["CHG-CAMP-002", "CHG-CAMP-003"]) edit(root, `changes/${c}/change.md`, (t) => t.replace(/status: in-progress/, "status: cancelled"));
  edit(root, ROADMAP, (t) => t.replace(/(## CAP-CAMP-002[\s\S]*?\*\*Horizon:\*\* )now/, "$1next"));
  edit(root, "profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [web-ui]\n"));
  approveFeatures(root, ["roadmap"], ME); // moving a feature to another horizon is a plan change the person approves
  const n = nextCommand(root);
  assert.match(n.text, /^Waits for Now: CAP-CAMP-001 is done; a person opens the app, tries it and records the look: royascaff check CHG-CAMP-001 --result pass/);
  assert.equal(n.human, true);
  work.recordCheck(root, "CHG-CAMP-001", { result: "pass", note: "looked at the form", bar: "all", ...ME });
  assert.doesNotMatch(nextCommand(root).text, /Waits for Now/);
});
