"use strict";

// Beta.4 · WP-D2: the knowledge registry and one Impact row per layer drive Understand, Design and
// Record; records added in a change mark their layer changed; the architecture page is approved.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const work = require("../lib/commands/work.cjs");
const { newDoc } = require("../lib/commands/plan.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const K = require("../lib/knowledge.cjs");

Object.assign(process.env, { GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "dev@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "dev@example.com" });
const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const file = (root, rel) => path.join(root, "project", rel);
const edit = (root, rel, fn) => fs.writeFileSync(file(root, rel), fn(fs.readFileSync(file(root, rel), "utf8")));
const failed = (r) => r.steps[r.steps.length - 1].checks.filter((c) => !c.ok);
const g = (root, ...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
const commit = (root, msg) => { g(root, "add", "-A"); g(root, "commit", "-q", "-m", msg); };

function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-d2-"));
  fs.cpSync(GREEN, root, { recursive: true });
  g(root, "init", "-q");
  commit(root, "initial");
  return root;
}

// Close CHG-CAMP-002 and open the drag slice as a new change (ten-row Impact from the template).
function openDrag(root, risk) {
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  fs.mkdirSync(file(root, "changes/CHG-CAMP-002/evidence"), { recursive: true });
  fs.writeFileSync(file(root, "changes/CHG-CAMP-002/evidence/evidence.md"), "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  commit(root, "CHG-CAMP-002: evidence");
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
  const id = work.openSlice(root, "SLC-CAMP-002-B", { ...ME, risk }).id;
  commit(root, `${id}: open`);
  return id;
}

// Build and check the change up to verified (one task in apps/web/src/calendar).
function buildDrag(root, id) {
  const t = work.newTask(root, id, "Drag posts", { inputs: "REQ-CAMP-004,CMP-CAMP-CALENDAR", paths: "apps/web/src/calendar/**", checks: "test", done: "posts move" }).id;
  const r = work.advance(root, id, "ready", AI);
  assert.equal(r.reached, "ready", JSON.stringify(failed(r)));
  commit(root, `${id}: plan`);
  work.taskAction(root, t, "start", "", AI);
  fs.mkdirSync(path.join(root, "apps/web/src/calendar"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/drag.ts"), "export const drag = 1;\n");
  commit(root, `${t}: drag`);
  work.taskAction(root, t, "done", "posts move between days", AI);
  work.recordCheck(root, id, { result: "pass", ...AI });
  fs.mkdirSync(file(root, `changes/${id}/evidence`), { recursive: true });
  fs.writeFileSync(file(root, `changes/${id}/evidence/e.md`), "### EVD-CAMP-040 · Drag\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-004\n");
  commit(root, `${id}: evidence`);
  assert.equal(work.advance(root, id, "verified", AI).reached, "verified");
}

const impact = (rows) => (t) => {
  let out = t.replace(/\| \? \|/g, "| unchanged |");
  for (const [label, state, named] of rows) out = out.replace(`| ${label} | unchanged | |`, `| ${label} | ${state} | ${named} |`);
  return out;
};

test("layers: ten rows; the old six-row labels still map to every layer", () => {
  assert.deepEqual(K.LAYERS.map((l) => l.label), ["Business", "Requirements", "Domain", "Architecture", "Data", "Contracts", "Experience", "Security", "Components & tests", "Quality & operations"]);
  const old = ["Business / requirements", "Domain / workflows", "Architecture / security", "Data / contracts / experience", "Components / code / tests", "Quality / operations / release"];
  assert.deepEqual([...new Set(old.flatMap(K.layersOfLabel))].sort(), K.LAYERS.map((l) => l.id).sort());
  const body = "## Impact\n\n| Layer | State | Affected IDs / paths | Reason |\n|---|---|---|---|\n| Data / contracts / experience | changed | CTR-X-001 | r |\n| Experience | referenced | experience.md | r |\n";
  const i = K.impactOf(body);
  assert.equal(i.layers.get("experience").state, "changed", "the strongest state wins when two rows cover a layer");
  assert.equal(i.layers.get("data").named, "CTR-X-001");
});

test("Understand: changed and referenced layers name what they touch; a page that does not exist says how to create it", () => {
  const root = repo();
  const id = openDrag(root, "low");
  const rel = `changes/${id}/change.md`;
  edit(root, rel, impact([["Requirements", "referenced", ""], ["Experience", "changed", "experience.md"]]));
  let r = work.advance(root, id, "analyzed", AI);
  const msg = failed(r).map((c) => c.message).join(" | ");
  assert.match(msg, /name the affected IDs or pages of every changed or referenced layer \(Requirements \(referenced\)\)/);
  assert.match(msg, /experience\.md \(create it: royascaff new doc experience\)/);
  newDoc(root, "experience");
  edit(root, rel, (t) => t.replace(/\| Requirements \| referenced \| +\|/, "| Requirements | referenced | REQ-CAMP-004 |"));
  r = work.advance(root, id, "analyzed", AI);
  assert.equal(r.reached, "analyzed", JSON.stringify(failed(r)));
});

test("Design: every changed layer is addressed in the After-state", () => {
  const root = repo();
  const id = openDrag(root, "low");
  const rel = `changes/${id}/change.md`;
  newDoc(root, "experience");
  edit(root, rel, impact([["Experience", "changed", "experience.md"], ["Components & tests", "changed", "CMP-CAMP-CALENDAR"]]));
  edit(root, rel, (t) => t.replace(/_How the system will look after this change[^\n]*_/, "CMP-CAMP-CALENDAR lets posts be dragged between days."));
  let r = work.advance(root, id, "approved", AI);
  assert.deepEqual(failed(r).map((c) => c.id), ["design-covers-impact"]);
  assert.match(failed(r)[0].message, /changed layers change: Experience/);
  edit(root, rel, (t) => t.replace("between days.", "between days; the drop shadow and motion follow the tokens in experience.md."));
  assert.equal(work.advance(root, id, "approved", AI).reached, "approved");
});

test("Record: a changed layer edits its page, and a new ADR makes Architecture changed", () => {
  const root = repo(); // the fixture has a data page (beta.4 D10)
  const id = openDrag(root, "low");
  const rel = `changes/${id}/change.md`;
  edit(root, rel, impact([["Data", "changed", "data.md"], ["Components & tests", "changed", "CMP-CAMP-CALENDAR"]]));
  edit(root, rel, (t) => t.replace(/_How the system will look after this change[^\n]*_/, "CMP-CAMP-CALENDAR stores the new day of a moved post; data.md records it."));
  buildDrag(root, id);
  let r = work.advance(root, id, "reconciled", AI);
  let ids = failed(r).map((c) => c.id);
  assert.ok(ids.includes("data-updated") && ids.includes("components-updated"), JSON.stringify(failed(r)));
  assert.match(failed(r).find((c) => c.id === "data-updated").message, /the Impact says Data changed: update knowledge\/04-design\/data\.md/);
  edit(root, "knowledge/04-design/data.md", (t) => t.replace("| Post | id, campaignId, channel, scheduledAt | — |", "| Post | id, campaignId, channel, scheduledAt, day | — |"));
  edit(root, "knowledge/05-implementation/components/components.md", (t) => t.replace("### CMP-CAMP-CALENDAR", "### CMP-CAMP-CALENDAR").concat("\nDrag and drop lives in `apps/web/src/calendar/drag.ts`.\n"));
  edit(root, "knowledge/04-design/decisions.md", (t) => `${t}\n### ADR-CAMP-009 · Native drag events\n\n- **Owner:** product-owner\n\n**Choice:** the browser's drag events, no library.\n`);
  r = work.advance(root, id, "reconciled", AI);
  assert.deepEqual(failed(r).map((c) => c.id), ["new-records-in-impact"]);
  assert.match(failed(r)[0].message, /ADR-CAMP-009 → Architecture/);
  edit(root, rel, (t) => t.replace("| Architecture | unchanged | |", "| Architecture | changed | ADR-CAMP-009 |"));
  r = work.advance(root, id, "reconciled", AI);
  assert.deepEqual(failed(r).map((c) => c.id), ["architecture-updated"], "Architecture changed needs the architecture page itself");
  edit(root, "knowledge/04-design/architecture.md", (t) => `${t}\nThe calendar uses native drag events (ADR-CAMP-009).\n`);
  assert.equal(work.advance(root, id, "reconciled", AI).reached, "reconciled");
});

test("the architecture page is approved: a design a person approved may update it; otherwise the approval goes stale", () => {
  for (const [risk, expected] of [["medium", "approved"], ["low", "stale"]]) {
    const root = repo();
    assert.equal(buildModel(root).approvals.project.state, "approved");
    const id = openDrag(root, risk);
    const rel = `changes/${id}/change.md`;
    edit(root, rel, impact([["Architecture", "changed", "architecture.md"], ["Components & tests", "changed", "CMP-CAMP-CALENDAR"]]));
    edit(root, rel, (t) => t.replace(/_How the system will look after this change[^\n]*_/, "CMP-CAMP-CALENDAR gains a drag layer; architecture.md shows it."));
    if (risk === "medium") {
      assert.equal(work.advance(root, id, "analyzed", AI).reached, "analyzed");
      work.approve(root, id, ME);
    }
    buildDrag(root, id);
    edit(root, "knowledge/04-design/architecture.md", (t) => `${t}\nA drag layer sits in the calendar.\n`);
    edit(root, "knowledge/05-implementation/components/components.md", (t) => `${t}\nDrag and drop lives in \`apps/web/src/calendar/drag.ts\`.\n`);
    assert.equal(buildModel(root).approvals.project.state, "stale", "the page changed");
    assert.equal(work.advance(root, id, "reconciled", AI).reached, "reconciled");
    commit(root, `${id}: record`);
    assert.equal(work.advance(root, id, "closed", AI).reached, "closed");
    const m = buildModel(root);
    assert.equal(m.approvals.project.state, expected, `${risk} risk`);
    if (risk === "medium") assert.match(fs.readFileSync(file(root, "log.md"), "utf8"), new RegExp(`project\\.updated \\| project \\| islam \\|[^\\n]*architecture updated by ${id} \\(design approved by islam\\)`));
  }
});
