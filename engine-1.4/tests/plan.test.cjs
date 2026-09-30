"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { newFeature, newSlice } = require("../lib/commands/plan.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
function copyGreenfield() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-plan-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  return root;
}
const roadmap = (root) => fs.readFileSync(path.join(root, "project/knowledge/00-roadmap/roadmap.md"), "utf8");

test("new feature adds the next CAP- with horizon, and the project stays valid and lossless", () => {
  const root = copyGreenfield();
  const r = newFeature(root, "Team workspaces", { horizon: "later", outcome: "OUT-CAMP-001" });
  assert.equal(r.id, "CAP-CAMP-006");
  const m = buildModel(root);
  assert.equal(m.features.get("CAP-CAMP-006").horizon, "later");
  assert.deepEqual(m.issues, []);
  assert.ok(roundTrip(root).ok);
});

test("new slice adds lettered slices in order, into an existing or a new table", () => {
  const root = copyGreenfield();
  const s1 = newSlice(root, "CAP-CAMP-004", "Reach chart", { delivers: "REQ-CAMP-006" });
  assert.deepEqual([s1.id, s1.order], ["SLC-CAMP-004-A", 1]);
  const s2 = newSlice(root, "CAP-CAMP-002", "Bulk reschedule", { depends: "SLC-CAMP-002-B" });
  assert.deepEqual([s2.id, s2.order], ["SLC-CAMP-002-C", 3]);
  const m = buildModel(root);
  assert.deepEqual(m.features.get("CAP-CAMP-004").slices, ["SLC-CAMP-004-A"]);
  assert.deepEqual(m.slices.get("SLC-CAMP-004-A").delivers, ["REQ-CAMP-006"]);
  assert.deepEqual(m.features.get("CAP-CAMP-002").slices, ["SLC-CAMP-002-A", "SLC-CAMP-002-B", "SLC-CAMP-002-C"]);
  assert.deepEqual(m.issues, []);
  assert.ok(roundTrip(root).ok);
});

test("a write that would break the project is refused and the file is restored", () => {
  const root = copyGreenfield();
  const before = roadmap(root);
  assert.throws(() => newSlice(root, "CAP-CAMP-002", "Broken", { delivers: "REQ-CAMP-999" }), /REQ-CAMP-999 does not exist/);
  assert.equal(roadmap(root), before);
  assert.throws(() => newFeature(root, "X", { outcome: "OUT-CAMP-404" }), /OUT-CAMP-404 does not exist/);
  assert.equal(roadmap(root), before);
  assert.throws(() => newFeature(root, "X", { horizon: "soon" }), /Horizon must be one of/);
  assert.throws(() => newSlice(root, "CAP-CAMP-404", "X"), /not a feature/);
});

test("new feature creates the roadmap file when a project has none", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-plan-empty-"));
  fs.mkdirSync(path.join(root, "project"));
  fs.writeFileSync(path.join(root, "project/profile.md"), "---\ndocument_id: DOC-NEW-PROFILE\ntitle: P\nlayer: profile\nschema_version: 2\ndocument_status: approved\nowners: [me]\nroyascaff: 1.4\nproject_code: NEW\n---\n");
  const r = newFeature(root, "First feature", { horizon: "now" });
  assert.equal(r.id, "CAP-NEW-001");
  assert.match(roadmap(root), /document_id: DOC-NEW-ROADMAP/);
  assert.deepEqual(buildModel(root).issues, []);
});

test("CLI: validate exit codes and show output", () => {
  const ok = spawnSync(process.execPath, [BIN, "validate", path.join(__dirname, "fixtures", "greenfield")], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /Validation PASS: 36 records · 5 features · 4 slices · 3 changes · 5 tasks/);
  const show = spawnSync(process.execPath, [BIN, "show", "CAP-CAMP-002", path.join(__dirname, "fixtures", "greenfield")], { encoding: "utf8" });
  assert.match(show.stdout, /CAP-CAMP-002 · Schedule posts {3}\[feature\] {3}🔨 Building/);
  assert.match(show.stdout, /🔨 Building {2}SLC-CAMP-002-A · Calendar with posts · delivers REQ-CAMP-003 · CHG-CAMP-002 4 Build \(tasks 1\/2\)/);
  assert.match(show.stdout, /🗺 Planned {2}SLC-CAMP-002-B · Drag posts between days · delivers REQ-CAMP-004 · no change yet/);
  const root = copyGreenfield();
  fs.appendFileSync(path.join(root, "project/knowledge/02-requirements/requirements.md"), "\n### REQ-CAMP-001 · Duplicate\n");
  const bad = spawnSync(process.execPath, [BIN, "validate", root], { encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /REQ-CAMP-001 is defined twice/);
});
