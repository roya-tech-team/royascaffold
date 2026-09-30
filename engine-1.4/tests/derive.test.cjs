"use strict";

// Table-driven tests for every rule of plan file 09 §3.5.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { parseLog, appendEvent, taskStateFrom } = require("../lib/events.cjs");

const PROFILE = "---\ndocument_id: DOC-T-PROFILE\ntitle: P\nlayer: profile\nschema_version: 2\ndocument_status: approved\nowners: [t]\nroyascaff: 1.4\nproject_code: T\n---\n";

// Builds a one-feature project: feature CAP-T-001 with slices, requirements REQ-T-00n,
// optional changes (status, events, evidence) and releases.
function build({ slices = [], reqs = ["REQ-T-001"], reqDocStatus = "approved", changes = [], evidence = [], release = null, extraFeatureReqs = [] }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-derive-"));
  const w = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  w("project/profile.md", PROFILE);
  const rows = slices.map((s) => `| ${s.id} | ${s.id} | 1 | — | ${s.delivers.join(", ")} | — |`).join("\n");
  w("project/knowledge/00-roadmap/roadmap.md", `## CAP-T-001 · Feature\n\n- **Horizon:** now\n\n| Slice | Title | Order | Depends on | Delivers | Planned at |\n|---|---|---|---|---|---|\n${rows}\n`);
  const reqText = [...reqs, ...extraFeatureReqs].map((r) => `### ${r} · ${r}\n\n- **Feature:** CAP-T-001\n${r === "REQ-T-001" ? "- **Verified by:** TEST-T-001\n" : ""}`).join("\n");
  w("project/knowledge/req.md", `---\ndocument_id: DOC-T-REQ\ntitle: R\nlayer: requirements\nschema_version: 2\ndocument_status: ${reqDocStatus}\nowners: [t]\n---\n\n${reqText}${reqs.includes("REQ-T-001") ? "\n### TEST-T-001 · Test\n\n- **Verifies:** REQ-T-001\n" : ""}`);
  for (const c of changes) {
    const dir = `project/changes/${c.id}`;
    const fm = [`change_id: ${c.id}`, `kind: ${c.kind || "feature"}`, c.slice ? `slice: ${c.slice}` : null, c.affects ? `affects: [${c.affects.join(", ")}]` : null, `status: ${c.status}`].filter(Boolean).join("\n");
    w(`${dir}/change.md`, `---\n${fm}\n---\n\n# ${c.id} · Change\n`);
    w(`${dir}/plan.md`, (c.tasks || []).map((t) => `### ${t} · Task\n\n- **Goal:** g\n`).join("\n"));
    if (c.events) {
      const rows2 = c.events.map((e, i) => `| 2026-09-0${1 + Math.floor(i / 9)}T0${i % 9}:00Z | ${e[0]} | ${e[1]} | t | — | — |`).join("\n");
      w(`${dir}/log.md`, `| When | Event | Target | By | Git | Note |\n|---|---|---|---|---|---|\n${rows2}\n`);
    }
  }
  if (evidence.length) {
    w(`project/changes/${changes[0].id}/evidence/e.md`, evidence.map((e, i) => `### EVD-T-00${i + 1} · E\n\n- **Result:** ${e.result}\n- **Proves:** ${e.proves}\n`).join("\n"));
  }
  if (release) w("project/releases/rel.md", `### REL-T-001 · Release\n\n- **Includes:** ${release}\n`);
  const model = buildModel(root);
  assert.deepEqual(model.issues.filter((i) => i.severity === "error"), []);
  return deriveStatus(model);
}

const S1 = { id: "SLC-T-001-A", delivers: ["REQ-T-001"] };
const change = (status, extra = {}) => ({ id: "CHG-T-001", slice: "SLC-T-001-A", status, ...extra });

test("task state is the last task event", () => {
  const ev = (list) => list.map(([event, target]) => ({ event, target }));
  assert.equal(taskStateFrom([], "TASK-T-001").state, "todo");
  assert.equal(taskStateFrom(ev([["task.started", "TASK-T-001"]]), "TASK-T-001").state, "doing");
  assert.equal(taskStateFrom(ev([["task.started", "TASK-T-001"], ["task.blocked", "TASK-T-001"]]), "TASK-T-001").state, "blocked");
  assert.equal(taskStateFrom(ev([["task.blocked", "TASK-T-001"], ["task.started", "TASK-T-001"]]), "TASK-T-001").state, "doing");
  assert.equal(taskStateFrom(ev([["task.started", "TASK-T-001"], ["task.done", "TASK-T-001"]]), "TASK-T-001").state, "done");
  assert.equal(taskStateFrom(ev([["task.done", "TASK-T-002"]]), "TASK-T-001").state, "todo");
});

test("change stage follows status", () => {
  const table = { draft: "understand", analyzed: "design", approved: "plan", ready: "build", "in-progress": "build", verified: "check", reconciled: "check", closed: "closed", cancelled: "cancelled" };
  for (const [status, stage] of Object.entries(table)) {
    assert.equal(build({ slices: [S1], changes: [change(status)] }).changes.get("CHG-T-001").stage, stage, status);
  }
});

test("requirement states (§3.5 rows)", () => {
  const cases = [
    ["draft document → idea", { reqDocStatus: "draft", slices: [S1] }, "idea"],
    ["no slice → outlined", {}, "outlined"],
    ["slice without change → planned", { slices: [S1] }, "planned"],
    ["change in Understand → designing", { slices: [S1], changes: [change("draft")] }, "designing"],
    ["change in Plan → designing", { slices: [S1], changes: [change("approved")] }, "designing"],
    ["change in Build → building", { slices: [S1], changes: [change("in-progress")] }, "building"],
    ["change in Check → checking", { slices: [S1], changes: [change("verified")] }, "checking"],
    ["closed + evidence via its test → done", { slices: [S1], changes: [change("closed")], evidence: [{ result: "pass", proves: "TEST-T-001" }] }, "done"],
    ["closed + direct evidence → done", { slices: [S1], changes: [change("closed")], evidence: [{ result: "PASS", proves: "REQ-T-001" }] }, "done"],
    ["closed without evidence → checking", { slices: [S1], changes: [change("closed")] }, "checking"],
    ["closed + failing evidence → checking", { slices: [S1], changes: [change("closed")], evidence: [{ result: "fail", proves: "TEST-T-001" }] }, "checking"],
    ["closed + evidence + release → released", { slices: [S1], changes: [change("closed")], evidence: [{ result: "pass", proves: "REQ-T-001" }], release: "CHG-T-001" }, "released"],
    ["blocked change → blocked", { slices: [S1], changes: [change("in-progress", { events: [["change.blocked", "CHG-T-001"]] })] }, "blocked"],
    ["unblocked again → building", { slices: [S1], changes: [change("in-progress", { events: [["change.blocked", "CHG-T-001"], ["change.unblocked", "CHG-T-001"]] })] }, "building"],
    ["blocked task → blocked", { slices: [S1], changes: [change("in-progress", { tasks: ["TASK-T-001"], events: [["task.blocked", "TASK-T-001"]] })] }, "blocked"],
    ["cancelled change frees the slice → planned", { slices: [S1], changes: [change("cancelled")] }, "planned"],
  ];
  for (const [name, spec, expected] of cases) {
    assert.equal(build(spec).requirements.get("REQ-T-001").state, expected, name);
  }
  const closedNoProof = build({ slices: [S1], changes: [change("closed")] }).requirements.get("REQ-T-001");
  assert.equal(closedNoProof.missingEvidence, true);
});

test("a requirement split across two slices is partly done until both are done", () => {
  const A = { id: "SLC-T-001-A", delivers: ["REQ-T-001"] };
  const B = { id: "SLC-T-001-B", delivers: ["REQ-T-001"] };
  const d = build({ slices: [A, B], changes: [change("closed")], evidence: [{ result: "pass", proves: "REQ-T-001" }] });
  assert.equal(d.requirements.get("REQ-T-001").state, "partly-done");
});

test("slice state follows its change", () => {
  assert.equal(build({ slices: [S1] }).slices.get("SLC-T-001-A").state, "planned");
  assert.equal(build({ slices: [S1], changes: [change("ready")] }).slices.get("SLC-T-001-A").state, "building");
  assert.equal(build({ slices: [S1], changes: [change("closed")] }).slices.get("SLC-T-001-A").state, "done");
});

test("feature states and depth", () => {
  const A = { id: "SLC-T-001-A", delivers: ["REQ-T-001"] };
  const B = { id: "SLC-T-001-B", delivers: ["REQ-T-002"] };
  const pass = [{ result: "pass", proves: "REQ-T-001" }];
  const cases = [
    ["no slices, no requirements → idea", { reqs: [] }, "idea", "idea"],
    ["requirements only → outlined", {}, "outlined", "outlined"],
    ["slices, none started → planned", { slices: [A] }, "planned", "sliced"],
    ["slice in design → designing", { slices: [A], changes: [change("analyzed")] }, "designing", "designed"],
    ["slice in build → building", { slices: [A], changes: [change("in-progress")] }, "building", "designed"],
    ["blocked slice → blocked", { slices: [A], changes: [change("blocked")] }, "blocked", "designed"],
    ["one of two slices done → partly done", { slices: [A, B], reqs: ["REQ-T-001", "REQ-T-002"], changes: [change("closed")], evidence: pass }, "partly-done", "designed"],
    ["all slices + requirements done → done", { slices: [A], changes: [change("closed")], evidence: pass }, "done", "designed"],
    ["slices done but an unplanned requirement remains → partly done", { slices: [A], extraFeatureReqs: ["REQ-T-009"], changes: [change("closed")], evidence: pass }, "partly-done", "designed"],
  ];
  for (const [name, spec, state, depth] of cases) {
    const f = build(spec).features.get("CAP-T-001");
    assert.equal(f.state, state, name);
    assert.equal(f.depth, depth, name);
  }
});

test("open bug fixes are shown on the requirement and feature, without changing Done", () => {
  const d = build({
    slices: [S1],
    changes: [change("closed"), { id: "CHG-T-002", kind: "bug", affects: ["REQ-T-001"], status: "in-progress" }],
    evidence: [{ result: "pass", proves: "REQ-T-001" }],
  });
  assert.equal(d.requirements.get("REQ-T-001").state, "done");
  assert.deepEqual(d.requirements.get("REQ-T-001").openFixes, ["CHG-T-002"]);
  assert.deepEqual(d.features.get("CAP-T-001").openFixes, ["CHG-T-002"]);
});

test("greenfield fixture: the board-level picture", () => {
  const m = buildModel(path.join(__dirname, "fixtures", "greenfield"));
  const d = deriveStatus(m);
  const f = (id) => [d.features.get(id).state, d.features.get(id).depth];
  assert.deepEqual(f("CAP-CAMP-001"), ["done", "designed"]);
  assert.deepEqual(f("CAP-CAMP-002"), ["building", "designed"]);
  assert.deepEqual(f("CAP-CAMP-003"), ["planned", "sliced"]);
  assert.deepEqual(f("CAP-CAMP-004"), ["outlined", "outlined"]);
  assert.deepEqual(f("CAP-CAMP-005"), ["idea", "idea"]);
  assert.deepEqual([d.changes.get("CHG-CAMP-002").tasksDone, d.changes.get("CHG-CAMP-002").tasksTotal], [1, 2]);
  assert.deepEqual(d.features.get("CAP-CAMP-001").openFixes, ["CHG-CAMP-003"]);
});

test("event log: parse, escaped pipes, problems, append", () => {
  const { events, problems } = parseLog("| When | Event | Target | By | Git | Note |\n|---|---|---|---|---|---|\n| 2026-09-02T10:00Z | task.done | TASK-T-001 | ai | abc | a \\| b |\n| 2026-09-01T10:00Z | task.flew | TASK-T-001 | ai | — | — |\n");
  assert.equal(events[0].note, "a | b");
  assert.equal(events[1].git, "");
  assert.deepEqual(problems.map((p) => p.replace(/^line \d+: /, "")), ['unknown event "task.flew"', "event is earlier than the one before it"]);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rs-log-"));
  appendEvent(dir, "CHG-T-001", { event: "change.opened", by: "islam", note: "multi\nline | note", when: "2026-09-01T08:00Z" });
  appendEvent(dir, "CHG-T-001", { event: "task.started", target: "TASK-T-001", by: "ai:claude", when: "2026-09-01T09:00Z" });
  const parsed = parseLog(fs.readFileSync(path.join(dir, "log.md"), "utf8"));
  assert.deepEqual(parsed.problems, []);
  assert.deepEqual(parsed.events.map((e) => [e.event, e.target, e.note]), [["change.opened", "CHG-T-001", "multi line | note"], ["task.started", "TASK-T-001", ""]]);
  assert.throws(() => appendEvent(dir, "CHG-T-001", { event: "nope" }), /Unknown event type/);
});

test("events that target another change's task are errors", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-derive-bad-"));
  const w = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  w("project/profile.md", PROFILE);
  w("project/changes/CHG-T-001/change.md", "---\nchange_id: CHG-T-001\nkind: chore\nstatus: in-progress\n---\n");
  w("project/changes/CHG-T-001/log.md", "| When | Event | Target | By | Git | Note |\n|---|---|---|---|---|---|\n| 2026-09-01T08:00Z | task.done | TASK-T-404 | t | — | — |\n");
  const m = buildModel(root);
  assert.deepEqual(m.issues.map((i) => i.code), ["event-target-unknown"]);
});

test("1.3 compatibility: a requirement that `Satisfies` a feature belongs to it", () => {
  const m = buildModel(path.join(__dirname, "fixtures", "kuni-1.3"));
  const f = deriveStatus(m).features.get("CAP-KUNI-001");
  assert.ok(f.requirementsTotal >= 5);
  assert.equal(f.state, "outlined");
  assert.equal(f.depth, "outlined");
});
