"use strict";

// E6.1: requirement, workflow and contract deltas (plan file 02 §2). Acceptance B1.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { changeCommand } = require("../lib/commands/evolve.cjs");
const evolve = require("../lib/evolve.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");

function copy() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e61-"));
  fs.cpSync(GREEN, root, { recursive: true });
  return root;
}
const rel = (id) => `project/changes/${id}/change.md`;
const read = (root, id) => fs.readFileSync(path.join(root, rel(id)), "utf8");
const body = (root, id) => read(root, id).replace(/^---\n[\s\S]*?\n---\n?/, "");
const failed = (r) => r.steps[r.steps.length - 1].checks.filter((c) => !c.ok).map((c) => c.id);
const message = (r, id) => r.steps[r.steps.length - 1].checks.find((c) => c.id === id).message;

// Classifies the Impact table and writes the design, as a person would.
function design(root, id, after = "The form also limits the length of the name; see CMP-CAMP-CALENDAR.") {
  let s = read(root, id).replace(/\| \? \|/g, "| unchanged |");
  s = s.replace("_How the system will look after this change: decisions and links to ADR- / CMP- / CTR- records._", after);
  fs.writeFileSync(path.join(root, rel(id)), s);
}
// Writes the handling of each affected item (a function of the row), as a person would.
function handle(root, id, fn) {
  const text = read(root, id);
  const rows = evolve.parseAffected(body(root, id)).map((r) => ({ ...r, handling: fn(r) }));
  fs.writeFileSync(path.join(root, rel(id)), evolve.putSection(text, `## ${evolve.AFFECTED_TITLE}`, evolve.renderAffected(rows)));
}

test("B1: changing a requirement opens an evolve change with a delta and lists its tests, evidence, slices and components", () => {
  const root = copy();
  const r = changeCommand(root, ["REQ-CAMP-001"], { ...ME, after: "A planner enters a client, a name of at most 80 characters, dates and channels, then saves.", why: "SRC-CAMP-003 (the agency asked for a limit)" });
  assert.equal(r.id, "CHG-CAMP-004");
  assert.equal(r.opened, true);
  assert.deepEqual(r.deltas.map((d) => [d.id, d.from, d.to, d.breaking]), [["REQ-CAMP-001", 1, 2, false]]);
  assert.deepEqual(r.affected.map((a) => [a.item, a.kind]), [
    ["SLC-CAMP-001-A", "slice"],
    ["TEST-CAMP-001", "test"],
    ["EVD-CAMP-001", "evidence"],
    ["CMP-CAMP-CAMPAIGNS", "component"],
  ]);
  assert.ok(r.affected.every((a) => a.handling === ""), "nothing is handled yet");
  const m = buildModel(root);
  assert.equal(m.changes.get("CHG-CAMP-004").kind, "evolve");
  assert.deepEqual(m.changes.get("CHG-CAMP-004").affects, ["REQ-CAMP-001"]);
  assert.equal(m.issues.filter((i) => i.severity === "error").length, 0, JSON.stringify(m.issues));
  assert.match(body(root, "CHG-CAMP-004"), /## Delta REQ-CAMP-001 \(v1 → v2\)\n\nBefore: A planner enters client, name, start and end dates, and channels, then saves\.\nAfter:  A planner enters a client, a name of at most 80 characters/);
  assert.ok(roundTrip(root).ok);
});

test("B1: the Understand gate refuses until each affected item is handled (update, or still valid with a reason)", () => {
  const root = copy();
  changeCommand(root, ["REQ-CAMP-001"], { ...ME, after: "A planner enters a name of at most 80 characters and the rest, then saves.", why: "SRC-CAMP-003" });
  design(root, "CHG-CAMP-004");
  let r = work.advance(root, "CHG-CAMP-004", "analyzed", ME);
  assert.deepEqual(failed(r), ["affected"]);
  assert.match(message(r, "affected"), /mark each as "update" or "still valid \(reason\)": SLC-CAMP-001-A, TEST-CAMP-001, EVD-CAMP-001, CMP-CAMP-CAMPAIGNS/);

  // "still valid" needs a reason; one unhandled row still stops the gate.
  handle(root, "CHG-CAMP-004", (row) => (row.item === "TEST-CAMP-001" ? "update" : row.item === "EVD-CAMP-001" ? "still valid" : "still valid (the slice is unchanged)"));
  r = work.advance(root, "CHG-CAMP-004", "analyzed", ME);
  assert.deepEqual(failed(r), ["affected"]);
  assert.match(message(r, "affected"), /: EVD-CAMP-001$/);

  handle(root, "CHG-CAMP-004", (row) => (row.kind === "test" ? "update" : "still valid (the old run is history)"));
  r = work.advance(root, "CHG-CAMP-004", "analyzed", ME);
  assert.equal(r.reached, "analyzed");
  assert.match(r.steps[0].checks.find((c) => c.id === "affected").message, /every affected item is handled \(4\)/);
});

test("the delta block must be written, versioned in step, and different from the old wording", () => {
  const root = copy();
  changeCommand(root, ["REQ-CAMP-001"], ME);
  design(root, "CHG-CAMP-004");
  handle(root, "CHG-CAMP-004", () => "update");
  let r = work.advance(root, "CHG-CAMP-004", "analyzed", ME);
  assert.deepEqual(failed(r), ["delta"]);
  assert.match(message(r, "delta"), /REQ-CAMP-001: write After:; REQ-CAMP-001: write Why:/);
  const f = path.join(root, rel("CHG-CAMP-004"));
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("(v1 → v2)", "(v3 → v4)").replace(/After:  /, "After: x ").replace(/Why:    /, "Why: SRC-CAMP-003"));
  r = work.advance(root, "CHG-CAMP-004", "analyzed", ME);
  assert.match(message(r, "delta"), /the heading says v3 → v4, but the record is at v1 \(write v1 → v2\)/);
});

test("changing the same record again joins the open change and keeps what was written", () => {
  const root = copy();
  changeCommand(root, ["REQ-CAMP-001"], { ...ME, after: "A planner saves a campaign with a name of at most 80 characters.", why: "SRC-CAMP-003" });
  handle(root, "CHG-CAMP-004", (row) => (row.kind === "test" ? "update" : ""));
  const again = changeCommand(root, ["REQ-CAMP-001", "REQ-CAMP-002"], ME);
  assert.equal(again.id, "CHG-CAMP-004");
  assert.equal(again.joined, true);
  assert.deepEqual(again.deltas.map((d) => d.id), ["REQ-CAMP-001", "REQ-CAMP-002"]);
  assert.equal(again.affected.find((a) => a.item === "TEST-CAMP-001").handling, "update", "the handling written before is kept");
  assert.deepEqual(buildModel(root).changes.get("CHG-CAMP-004").affects, ["REQ-CAMP-001", "REQ-CAMP-002"]);
  assert.equal(buildModel(root).changes.size, 4, "no second change was opened");
});

test("only requirements, workflows and contracts change through a delta; `open --kind evolve` points to `change`", () => {
  const root = copy();
  assert.throws(() => changeCommand(root, ["CAP-CAMP-001"], ME), /only requirements .* change through a delta/);
  assert.throws(() => changeCommand(root, ["REQ-CAMP-404"], ME), /not a record/);
  assert.throws(() => changeCommand(root, [], ME), /Usage: royascaff change/);
  assert.throws(() => work.openOther(root, "x", { kind: "evolve" }), /Use `royascaff change/);
  assert.throws(() => work.openOther(root, "x", { kind: "rollback" }), /Use `royascaff rollback/);
});

test("a contract delta that removes a field is breaking: it needs risk high or critical, and a person's approval", () => {
  const root = copy();
  fs.writeFileSync(path.join(root, "project/knowledge/04-design/contracts.md"), [
    "---", "document_id: DOC-CAMP-CONTRACTS", "title: Contracts", "layer: contracts", "schema_version: 2", "document_status: approved", "owners: [roya-team]", "---", "",
    "# Contracts", "", "> **What:** the contracts", "> **Read when:** designing", "",
    "### CTR-CAMP-001 · Create campaign request", "", "- **Owner:** roya-team", "", "Input `name`, `client`, `dates`; returns `id`.", "",
  ].join("\n"));
  const r = changeCommand(root, ["CTR-CAMP-001"], { ...ME, after: "Input `name` and `client`; returns `id`.", why: "SRC-CAMP-003 (dates move to the calendar)" });
  assert.deepEqual(r.deltas.map((d) => [d.id, d.breaking, d.removes]), [["CTR-CAMP-001", true, ["dates"]]]);
  assert.equal(r.risk, "high", "a breaking delta raises the risk of the change it opens");
  design(root, "CHG-CAMP-004");
  handle(root, "CHG-CAMP-004", () => "update");
  let a = work.advance(root, "CHG-CAMP-004", "analyzed", ME);
  assert.equal(a.reached, "analyzed");
  assert.match(a.steps[0].checks.find((c) => c.id === "breaking").message, /breaking delta \(CTR-CAMP-001 removes dates\): risk high, a person approves the design/);
  a = work.advance(root, "CHG-CAMP-004", "approved", AI);
  assert.deepEqual(failed(a), ["approval"]);
  assert.throws(() => work.approve(root, "CHG-CAMP-004", AI), /must come from a person/);
  work.approve(root, "CHG-CAMP-004", ME);
  assert.equal(work.advance(root, "CHG-CAMP-004", "approved", ME).reached, "approved");

  // A lower risk written by hand is refused.
  const root2 = copy();
  fs.copyFileSync(path.join(root, "project/knowledge/04-design/contracts.md"), path.join(root2, "project/knowledge/04-design/contracts.md"));
  changeCommand(root2, ["CTR-CAMP-001"], { ...ME, after: "Input `name` and `client`; returns `id`.", why: "SRC-CAMP-003", risk: "medium" });
  design(root2, "CHG-CAMP-004");
  handle(root2, "CHG-CAMP-004", () => "update");
  const bad = work.advance(root2, "CHG-CAMP-004", "analyzed", ME);
  assert.deepEqual(failed(bad), ["breaking"]);
  assert.match(message(bad, "breaking"), /a breaking change needs risk high or critical/);
});

// A project where REQ-CAMP-003 has fingerprinted evidence (verify), as in e12-verify.test.cjs.
function verified() {
  const root = copy();
  const put = (f, text) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), text); };
  put("apps/web/src/calendar/grid.js", "exports.grid = () => 1;\n");
  const profile = path.join(root, "project/profile.md");
  let text = fs.readFileSync(profile, "utf8");
  for (const k of ["Build", "Typecheck", "Lint"]) text = text.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), `- **${k}:**`);
  text = text.replace(/- \*\*Test:\*\* .*/, "- **Test:** node -e 0");
  fs.writeFileSync(profile, text);
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, `${fs.readFileSync(reqs, "utf8")}\n### TEST-CAMP-020 · Calendar tests\n\n- **Owner:** roya-team\n- **Check:** runner:test\n- **Verifies:** REQ-CAMP-003\n`);
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  return root;
}

test("B1: approving the delta turns the evidence of the old version stale; the new evidence is fresh", () => {
  const root = verified();
  const first = work.verify(root, "CHG-CAMP-002", AI);
  assert.equal(first.result, "pass");
  assert.ok(first.proves.includes("TEST-CAMP-020"));
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
  let s = deriveStatus(buildModel(root));
  assert.equal(s.requirements.get("REQ-CAMP-003").state, "done");
  assert.equal(s.stale.size, 0);
  assert.equal(s.requirements.get("REQ-CAMP-003").version, undefined, "version 1 is not written out");

  const r = changeCommand(root, ["REQ-CAMP-003"], { ...ME, after: "Posts show on their scheduled day and the calendar shows at most 200 posts.", why: "SRC-CAMP-003" });
  assert.ok(r.affected.some((a) => a.item === first.evidence && a.kind === "evidence"), "the old evidence is listed as affected");
  assert.ok(r.affected.some((a) => a.item === "TEST-CAMP-020"));
  assert.ok(r.affected.some((a) => a.item === "SLC-CAMP-002-A"));
  assert.ok(r.affected.some((a) => a.item === "CMP-CAMP-CALENDAR"));
  assert.equal(deriveStatus(buildModel(root)).stale.size, 0, "still fresh while the delta is only written");

  design(root, r.id);
  handle(root, r.id, (row) => (row.kind === "test" || row.kind === "component" ? "update" : "still valid (history of version 1)"));
  assert.equal(work.advance(root, r.id, "analyzed", ME).reached, "analyzed");
  work.approve(root, r.id, ME);
  assert.equal(work.advance(root, r.id, "approved", ME).reached, "approved");

  const m = buildModel(root);
  assert.equal(evolve.versionOf(m, "REQ-CAMP-003"), 2);
  s = deriveStatus(m);
  assert.deepEqual([...s.stale], [first.evidence], "the evidence of version 1 is stale");
  assert.equal(s.requirements.get("REQ-CAMP-003").state, "stale");
  assert.equal(s.requirements.get("REQ-CAMP-003").version, 2);
  assert.equal(s.features.get("CAP-CAMP-002").state, "stale");

  // The record is edited to the new wording, the work is done, and verify proves version 2.
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, fs.readFileSync(reqs, "utf8").replace("- **Feature:** CAP-CAMP-002\n\n### REQ-CAMP-004", "- **Feature:** CAP-CAMP-002\n\nPosts show on their scheduled day and the calendar shows at most 200 posts.\n\n### REQ-CAMP-004"));
  const check = evolve.recordChecks(buildModel(root), buildModel(root).changes.get(r.id), body(root, r.id), (id, ok, msg) => ({ id, ok, message: msg }));
  assert.deepEqual(check.map((c) => [c.id, c.ok]), [["delta-applied", true]]);
  const cf = path.join(root, rel(r.id));
  fs.writeFileSync(cf, fs.readFileSync(cf, "utf8").replace(/^status: .*$/m, "status: in-progress")); // the build itself is not the subject here
  const second = work.verify(root, r.id, AI);
  assert.equal(second.result, "pass");
  s = deriveStatus(buildModel(root));
  assert.equal(s.requirements.get("REQ-CAMP-003").state, "done", "version 2 is proven by the new evidence");
  assert.ok(s.requirements.get("REQ-CAMP-003").evidence.includes(second.evidence));
});

test("the record gate refuses while a record does not say what its delta says", () => {
  const root = copy();
  const r = changeCommand(root, ["REQ-CAMP-001"], { ...ME, after: "A planner saves a campaign with a name of at most 80 characters.", why: "SRC-CAMP-003" });
  const m = buildModel(root);
  const check = (id, ok, msg) => ({ id, ok, message: msg });
  const before = evolve.recordChecks(m, m.changes.get(r.id), body(root, r.id), check);
  assert.deepEqual(before.map((c) => [c.id, c.ok]), [["delta-applied", false]]);
  assert.match(before[0].message, /REQ-CAMP-001 still does not say what the delta's After says/);
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, fs.readFileSync(reqs, "utf8").replace("A planner enters client, name, start and end dates, and channels, then saves.", "A planner saves a campaign with a name of at most 80 characters."));
  const m2 = buildModel(root);
  assert.equal(evolve.recordChecks(m2, m2.changes.get(r.id), body(root, r.id), check)[0].ok, true);
});

test("a rolled-back delta does not count: the version goes back", () => {
  const root = copy();
  const r = changeCommand(root, ["REQ-CAMP-001"], { ...ME, after: "A planner saves a campaign with a name of at most 80 characters.", why: "SRC-CAMP-003" });
  const f = path.join(root, rel(r.id));
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/^status: .*$/m, "status: closed"));
  assert.equal(evolve.versionOf(buildModel(root), "REQ-CAMP-001"), 2);
  const rb = path.join(root, "project/changes/CHG-CAMP-005");
  fs.mkdirSync(rb, { recursive: true });
  fs.writeFileSync(path.join(rb, "change.md"), `---\nchange_id: CHG-CAMP-005\nkind: rollback\nreverts: [${r.id}]\nstatus: closed\nrisk: low\nowners: [roya-team]\n---\n\n# CHG-CAMP-005 · Revert\n`);
  const m = buildModel(root);
  assert.deepEqual([...m.reverted], [r.id]);
  assert.equal(evolve.versionOf(m, "REQ-CAMP-001"), 1);
});
