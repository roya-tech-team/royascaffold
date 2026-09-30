"use strict";

// Step 12b · WP4 (knowledge profiles, architecture, quality) and WP5 (NFR proof, whole-suite proof).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { initProject } = require("../lib/commands/setup.cjs");
const { newDoc } = require("../lib/commands/plan.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp45-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const file = (root, rel) => path.join(root, "project", rel);
const edit = (root, rel, fn) => fs.writeFileSync(file(root, rel), fn(fs.readFileSync(file(root, rel), "utf8")));

function verifiedCalendar(root) {
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  fs.mkdirSync(file(root, "changes/CHG-CAMP-002/evidence"), { recursive: true });
  fs.writeFileSync(file(root, "changes/CHG-CAMP-002/evidence/evidence.md"), "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  assert.equal(work.advance(root, "CHG-CAMP-002", "verified", ME).reached, "verified");
}

test("init: standard profile by default, lite with --lite; new doc creates from the template and never overwrites", () => {
  const std = fs.mkdtempSync(path.join(os.tmpdir(), "rs-std-"));
  initProject(std, { name: "A", code: "AAA" });
  assert.equal(buildModel(std).profile.knowledge_profile, "standard");
  const lite = fs.mkdtempSync(path.join(os.tmpdir(), "rs-lite-"));
  initProject(lite, { name: "B", code: "BBB", lite: true });
  assert.equal(buildModel(lite).profile.knowledge_profile, "lite");
  assert.equal(newDoc(std, "quality").file, "knowledge/06-quality/quality.md");
  assert.throws(() => newDoc(std, "quality"), /already exists/);
  assert.throws(() => newDoc(std, "architecture"), /already exists/, "init already made the architecture page");
  assert.throws(() => newDoc(std, "poster"), /Usage: royascaff new doc/);
  assert.deepEqual(buildModel(std).issues, []);
});

test("standard profile: a feature change cannot be recorded without a quality strategy; lite can", () => {
  const root = copy();
  fs.rmSync(file(root, "knowledge/06-quality/quality.md"));
  verifiedCalendar(root);
  const r = work.advance(root, "CHG-CAMP-002", "reconciled", ME);
  assert.equal(r.reached, "verified");
  assert.match(r.steps[r.steps.length - 1].checks.find((c) => c.id === "quality-strategy").message, /royascaff new doc quality/);
  newDoc(root, "quality");
  assert.equal(work.advance(root, "CHG-CAMP-002", "reconciled", ME).reached, "verified", "template text alone is not a strategy");
  edit(root, "profile.md", (t) => t.replace("project_name: Campaign Planner", "project_name: Campaign Planner\nknowledge_profile: lite"));
  assert.equal(work.advance(root, "CHG-CAMP-002", "reconciled", ME).reached, "reconciled");
});

test("R6: a finished feature with an unproven NFR is Checking, and next asks for the proof", () => {
  const root = copy();
  edit(root, "knowledge/02-requirements/requirements.md", (t) => `${t}\n### NFR-CAMP-010 · The campaign list loads within a second\n\n- **Priority:** should\n- **Feature:** CAP-CAMP-001\n`);
  let d = deriveStatus(buildModel(root));
  assert.deepEqual([d.features.get("CAP-CAMP-001").state, d.features.get("CAP-CAMP-001").unprovenNfrs, d.requirements.get("NFR-CAMP-010").state], ["checking", ["NFR-CAMP-010"], "checking"]);
  const n = nextCommand(root);
  assert.ok([n.text, ...n.others].some((t) => /^Prove NFR-CAMP-010 of CAP-CAMP-001 \(all its slices are done\)/.test(t)));
  assert.match(indexCommand(root).board, /\| CAP-CAMP-001 · Create campaigns \| 🧪 Checking \|[^\n]*prove NFR-CAMP-010/);
  fs.appendFileSync(file(root, "changes/CHG-CAMP-001/evidence/evidence.md"), "\n### EVD-CAMP-040 · List timing\n\n- **Result:** pass\n- **Proves:** NFR-CAMP-010\n- **Command:** manual: timed on a laptop\n");
  d = deriveStatus(buildModel(root));
  assert.deepEqual([d.features.get("CAP-CAMP-001").state, d.requirements.get("NFR-CAMP-010").state], ["done", "done"]);
});
