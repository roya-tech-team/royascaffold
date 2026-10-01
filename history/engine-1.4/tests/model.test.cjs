"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildModel, errorsOf } = require("../lib/model/graph.cjs");

const FIX = path.join(__dirname, "fixtures");
const GREEN = path.join(FIX, "greenfield");

function project(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-model-"));
  const all = { "project/profile.md": "---\ndocument_id: DOC-T-PROFILE\ntitle: P\nlayer: profile\nschema_version: 2\ndocument_status: approved\nowners: [t]\nroyascaff: 1.4\nproject_code: T\n---\n", ...files };
  for (const [rel, content] of Object.entries(all)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  }
  return root;
}
const codes = (m) => m.issues.map((i) => `${i.severity}:${i.code}`).sort();

test("greenfield: full hierarchy Outcome → Feature → Slice → Change → Task, zero issues", () => {
  const m = buildModel(GREEN);
  assert.equal(m.is14, true);
  assert.equal(m.code, "CAMP");
  assert.deepEqual(m.issues, []);
  assert.deepEqual([...m.features.values()].map((f) => [f.id, f.horizon]), [
    ["CAP-CAMP-001", "now"], ["CAP-CAMP-002", "now"], ["CAP-CAMP-003", "next"], ["CAP-CAMP-004", "later"], ["CAP-CAMP-005", "backlog"],
  ]);
  assert.deepEqual(m.features.get("CAP-CAMP-002").slices, ["SLC-CAMP-002-A", "SLC-CAMP-002-B"]);
  const a = m.slices.get("SLC-CAMP-002-A");
  assert.deepEqual([a.feature, a.order, a.depends_on, a.delivers, a.planned_at, a.change], ["CAP-CAMP-002", 1, ["SLC-CAMP-001-A"], ["REQ-CAMP-003"], "a1b2c3d", "CHG-CAMP-002"]);
  assert.equal(m.slices.get("SLC-CAMP-002-B").change, undefined);
  assert.deepEqual(m.changes.get("CHG-CAMP-002").tasks, ["TASK-CAMP-003", "TASK-CAMP-004"]);
  assert.equal(m.tasks.get("TASK-CAMP-004").change, "CHG-CAMP-002");
  assert.deepEqual(m.tasks.get("TASK-CAMP-004").depends_on, ["TASK-CAMP-003"]);
  const bug = m.changes.get("CHG-CAMP-003");
  assert.deepEqual([bug.kind, bug.slice, bug.affects], ["bug", null, ["REQ-CAMP-001"]]);
});

test("typed relations come from relation fields; IDs in other fields and the body are mentions", () => {
  const m = buildModel(project({
    "project/knowledge/r.md": "### REQ-T-001 · R\n\n- **Feature:** CAP-T-001\n- **Source:** see REQ-T-002\n\nAlso CMP-T-001.\n\n### REQ-T-002 · R2\n\n### CMP-T-001 · C\n\n## CAP-T-001 · F\n\n- **Horizon:** now\n",
  }));
  const r = m.records.get("REQ-T-001");
  assert.deepEqual(r.relations.map((x) => [x.type, x.to]), [["feature", "CAP-T-001"]]);
  assert.deepEqual(r.mentions.sort(), ["CMP-T-001", "REQ-T-002"]);
  assert.deepEqual(m.incoming.get("CAP-T-001"), [{ from: "REQ-T-001", type: "feature" }]);
});

test("broken links and hierarchy mistakes are reported", () => {
  const m = buildModel(project({
    "project/knowledge/00-roadmap/roadmap.md": [
      "## CAP-T-001 · F", "", "- **Horizon:** soon", "",
      "| Slice | Title | Order | Depends on | Delivers | Planned at |", "|---|---|---|---|---|---|",
      "| SLC-T-001-A | A | 1 | REQ-T-001 | CMP-T-001 | — |",
      "|  | no id | 2 | — | — | — |", "",
      "### REQ-T-001 · R", "", "- **Feature:** CAP-T-404", "", "See REQ-T-777.", "",
      "### REQ-T-001 · Again", "", "### CMP-T-001 · C", "",
    ].join("\n"),
    "project/changes/CHG-T-001/change.md": "---\nchange_id: CHG-T-001\nkind: feature\nstatus: in-progress\n---\n",
    "project/changes/CHG-T-002/change.md": "---\nchange_id: CHG-T-002\nkind: feature\nslice: SLC-T-999-Z\nstatus: open\n---\n",
    "project/changes/CHG-T-003/change.md": "---\nchange_id: CHG-T-003\nkind: bug\nstatus: draft\n---\n",
    "project/changes/CHG-T-004/change.md": "---\nchange_id: CHG-T-004\nkind: feature\nslice: SLC-T-001-A\nstatus: draft\n---\n",
    "project/changes/CHG-T-005/change.md": "---\nchange_id: CHG-T-005\nkind: feature\nslice: SLC-T-001-A\nstatus: ready\n---\n",
    "project/knowledge/tasks.md": "### TASK-T-001 · Loose task\n",
  }));
  assert.deepEqual(codes(m), [
    "error:duplicate-id",
    "error:feature-change-without-slice",
    "error:invalid-change-status",
    "error:invalid-horizon",
    "error:slice-depends-on-non-slice",
    "error:slice-has-two-changes",
    "error:slice-without-id",
    "error:unknown-slice",
    "error:unresolved-relation",
    "warning:fix-without-affects",
    "warning:missing-header-card",
    "warning:missing-header-card",
    "warning:slice-delivers-non-requirement",
    "warning:task-outside-change",
    "warning:unresolved-mention",
  ]);
});

test("1.3 projects load: kind from intent, change.md defines the change, generated packs ignored", () => {
  const kuni = buildModel(path.join(FIX, "kuni-1.3"));
  assert.equal(kuni.is14, false);
  assert.equal(errorsOf(kuni).length, 0);
  assert.equal(kuni.changes.get("CHG-KUNI-001").kind, "feature");
  assert.deepEqual(codes(kuni), ["warning:feature-change-without-slice", "warning:feature-change-without-slice"]);
  const heavy = buildModel(path.join(FIX, "kuni-1.3.1"));
  assert.equal(errorsOf(heavy).length, 0);
  assert.equal(heavy.changes.size, 1);
  assert.equal(errorsOf(buildModel(path.join(FIX, "pollpulse-1.3"))).length, 0);
});
