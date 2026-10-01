"use strict";

// E6.3: feature flags, experiments, rollback and deprecation (plan file 02 §4). Acceptance B3.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const work = require("../lib/commands/work.cjs");
const { changeCommand, diffCommand } = require("../lib/commands/evolve.cjs");
const { rollbackCommand, deprecateCommand, measureExperiment } = require("../lib/commands/lifecycle.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { inventoryCommand } = require("../lib/commands/inventory.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");
const { buildPack } = require("../lib/context.cjs");
const evolve = require("../lib/evolve.cjs");
const flags = require("../lib/flags.cjs");
const outcomes = require("../lib/outcomes.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const NEW_WORDING = "A planner saves a campaign with a name of at most 80 characters.";
const OLD_WORDING = "A planner enters client, name, start and end dates, and channels, then saves.";

const copy = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e63-"));
  fs.cpSync(GREEN, root, { recursive: true });
  return root;
};
const proj = (root, rel) => path.join(root, "project", rel);
const read = (root, rel) => fs.readFileSync(proj(root, rel), "utf8");
const edit = (root, rel, fn) => fs.writeFileSync(proj(root, rel), fn(read(root, rel)));
const model = (root) => buildModel(root);
const codes = (root) => model(root).issues.map((i) => i.code);
const failed = (r) => r.steps[r.steps.length - 1].checks.filter((c) => !c.ok).map((c) => c.id);
const withEnv = (key, value, fn) => {
  const was = process.env[key];
  process.env[key] = value;
  try { return fn(); } finally { if (was === undefined) delete process.env[key]; else process.env[key] = was; }
};

test("flags: a flag hides records, has an owner and a removal date; the board and validate list the ones past it", () => {
  const root = copy();
  const f = newRecord(root, "flag", "New campaign form", { hides: "CAP-CAMP-001", "remove-by": "2026-09-01", by: "islam" });
  assert.equal(f.id, "FLAG-CAMP-001");
  assert.match(read(root, f.file), /### FLAG-CAMP-001 · New campaign form\n\n- \*\*Owner:\*\* [^\n]+\n- \*\*Hides:\*\* CAP-CAMP-001\n- \*\*State:\*\* off\n- \*\*Remove by:\*\* 2026-09-01/);
  const list = flags.flagsOf(model(root), "2026-10-01");
  assert.deepEqual(list.map((x) => [x.id, x.state, x.hides, x.overdue, x.why]), [["FLAG-CAMP-001", "off", ["CAP-CAMP-001"], true, "removal date 2026-09-01 has passed"]]);
  assert.deepEqual(flags.flagsOf(model(root), "2026-08-31")[0].overdue, false, "not before the date");
  assert.ok(model(root).issues.some((i) => i.code === "flag-overdue" && /FLAG-CAMP-001 · New campaign form is past its removal/.test(i.message)));
  const board = indexCommand(root).board;
  assert.match(board, /## Flags, experiments and removals\n\n- Flags: 1 \(1 off\) · ⚠ past their removal: FLAG-CAMP-001 \(removal date 2026-09-01 has passed\)/);
  assert.match(board, /- Behind an off flag, not delivered: REQ-CAMP-001 \(FLAG-CAMP-001\), REQ-CAMP-002 \(FLAG-CAMP-001\)/);
  assert.deepEqual(withEnv("ROYASCAFF_TODAY", "2026-10-01", () => inventoryCommand(root).evolution.overdue_flags), ["FLAG-CAMP-001"]);
  assert.deepEqual(withEnv("ROYASCAFF_TODAY", "2026-08-01", () => inventoryCommand(root).evolution.overdue_flags), []);
});

test("flags: a release as the removal point is due once that release exists; a flag with no removal or no target is a warning", () => {
  const root = copy();
  newRecord(root, "flag", "Beta banner", { hides: "REQ-CAMP-003", "remove-by": "REL-CAMP-001", by: "islam" });
  newRecord(root, "flag", "Loose flag", { by: "islam" });
  assert.deepEqual(flags.flagsOf(model(root), "2026-10-01").map((x) => [x.id, x.overdue]), [["FLAG-CAMP-001", false], ["FLAG-CAMP-002", false]]);
  assert.deepEqual([...new Set(codes(root))].sort(), ["flag-without-hides", "flag-without-removal"]);
  newRecord(root, "release", "1.0.0", { by: "islam" });
  const f = flags.flagsOf(model(root), "2026-10-01")[0];
  assert.deepEqual([f.overdue, f.why], [true, "REL-CAMP-001 has shipped"]);
});

test("flags: a requirement behind an off flag is not delivered for outcomes; turning the flag on delivers it", () => {
  const root = copy();
  const done = () => { const m = model(root); return outcomes.outcomesOf(m, deriveStatus(m)).find((o) => o.id === "OUT-CAMP-001"); };
  assert.deepEqual(done().done, ["CAP-CAMP-001"], "the feature is done before any flag");
  const f = newRecord(root, "flag", "New campaign form", { hides: "REQ-CAMP-001", "remove-by": "2099-01-01", by: "islam" });
  const s = deriveStatus(model(root));
  assert.deepEqual(s.requirements.get("REQ-CAMP-001").flaggedOff, ["FLAG-CAMP-001"]);
  assert.equal(s.requirements.get("REQ-CAMP-001").state, "done", "its checks are unchanged");
  assert.deepEqual(s.features.get("CAP-CAMP-001").flaggedOff, ["FLAG-CAMP-001"]);
  assert.deepEqual(done().done, [], "behind an off flag it is not delivered");
  edit(root, f.file.replace(/^project\//, ""), (t) => t.replace("- **State:** off", "- **State:** on"));
  assert.deepEqual(done().done, ["CAP-CAMP-001"], "on: delivered again");
});

test("experiments: hypothesis, variants and a metric in the NFR form; an outcome link; a person decides, the loser becomes a removal slice", () => {
  const root = copy();
  newRecord(root, "experiment", "Shorter campaign form", { feature: "CAP-CAMP-001", outcome: "OUT-CAMP-001", hypothesis: "Three fields raise sign-ups.", variants: "A: six fields (today) ; B: three fields", metric: "signup_rate >= 0.05", by: "islam" });
  const e = flags.experimentsOf(model(root))[0];
  assert.deepEqual([e.id, e.feature, e.outcome, e.metric, e.decision, e.variants.map((v) => v.name)], ["EXP-CAMP-001", "CAP-CAMP-001", "OUT-CAMP-001", "`signup_rate >= 0.05`", null, ["A", "B"]]);
  assert.deepEqual(codes(root), []);
  assert.match(indexCommand(root).board, /- Experiments: 1 · waiting for a decision: EXP-CAMP-001/);

  assert.throws(() => measureExperiment(root, "EXP-CAMP-001", { ...AI, result: "keep B", note: "x" }), /must come from a person/);
  assert.throws(() => measureExperiment(root, "EXP-CAMP-001", { ...ME, result: "keep C", note: "x" }), /Usage: royascaff measure EXP-CAMP-001 --result "keep A" \| "keep B" \| stop/);
  assert.throws(() => measureExperiment(root, "EXP-CAMP-001", { ...ME, result: "keep B" }), /Say what was measured/);
  assert.throws(() => measureExperiment(root, "EXP-CAMP-404", { ...ME, result: "stop", note: "x" }), /not an experiment/);
  withEnv("ROYASCAFF_NONINTERACTIVE", "1", () => assert.throws(() => measureExperiment(root, "EXP-CAMP-001", { ...ME, result: "keep B", note: "x" }), /nothing is asked in non-interactive mode/));

  const r = measureExperiment(root, "EXP-CAMP-001", { ...ME, result: "keep B", note: "signup_rate 0.07 over two weeks" });
  assert.deepEqual([r.decision, r.by, r.outcome, r.removal_slices], ["keep B", "islam", "OUT-CAMP-001", ["SLC-CAMP-001-B"]]);
  const m = model(root);
  assert.equal(m.slices.get("SLC-CAMP-001-B").title, "Remove variant A of EXP-CAMP-001 · Shorter campaign form", "the variant that lost is a removal slice");
  assert.match(read(root, "knowledge/06-quality/experiments.md"), /- \*\*Decision:\*\* keep B\n- \*\*Decided by:\*\* islam\n- \*\*Decided on:\*\* \d{4}-\d\d-\d\d/);
  assert.ok(m.approvals.events.some((x) => x.event === "experiment.decided" && x.target === "EXP-CAMP-001" && /^keep B: signup_rate 0\.07/.test(x.note)));
  assert.equal(flags.experimentsOf(m)[0].decision, "keep B");
  assert.throws(() => measureExperiment(root, "EXP-CAMP-001", { ...ME, result: "stop", note: "x" }), /already has a decision: keep B/);
  assert.deepEqual(codes(root), []);
  assert.match(indexCommand(root).board, /- Experiments: 1 · all decided/);
});

test("experiments: stop removes the whole experiment; a bad metric or decision is reported", () => {
  const root = copy();
  newRecord(root, "experiment", "No metric yet", { feature: "CAP-CAMP-002", variants: "A: x ; B: y", by: "islam" });
  assert.deepEqual(codes(root), ["experiment-metric"]);
  const r = measureExperiment(root, "EXP-CAMP-001", { ...ME, result: "stop", note: "no traffic" });
  assert.equal(r.decision, "stop");
  assert.deepEqual(r.removal_slices, ["SLC-CAMP-002-C"]);
  assert.match(model(root).slices.get("SLC-CAMP-002-C").title, /^Remove EXP-CAMP-001 \(stopped\)/);
  edit(root, "knowledge/06-quality/experiments.md", (t) => t.replace("- **Decision:** stop", "- **Decision:** keep Z"));
  assert.ok(model(root).issues.some((i) => i.code === "experiment-decision" && /keeps "Z"/.test(i.message)));
});

test("deprecation: a requirement or component is scheduled for removal with a slice; its code shows in the code map", () => {
  const root = copy();
  const r = deprecateCommand(root, "REQ-CAMP-002", { ...ME, reason: "replaced by search" });
  assert.deepEqual([r.id, r.removal_slice, r.planned_slice], ["REQ-CAMP-002", "SLC-CAMP-001-B", true]);
  assert.match(read(root, "knowledge/02-requirements/requirements.md"), /### REQ-CAMP-002 · List campaigns per client\n\n- \*\*Priority:\*\* must\n- \*\*Owner:\*\* product-owner\n- \*\*Feature:\*\* CAP-CAMP-001\n- \*\*Status:\*\* deprecated\n- \*\*Deprecated:\*\* \d{4}-\d\d-\d\d — replaced by search\n- \*\*Removal slice:\*\* SLC-CAMP-001-B/);
  assert.deepEqual(flags.deprecatedOf(model(root)).map((d) => [d.id, d.removal_slice]), [["REQ-CAMP-002", "SLC-CAMP-001-B"]]);
  assert.equal(deriveStatus(model(root)).requirements.get("REQ-CAMP-002").deprecated, "SLC-CAMP-001-B");
  assert.deepEqual(codes(root), []);
  assert.throws(() => deprecateCommand(root, "REQ-CAMP-002", ME), /already deprecated/);
  assert.throws(() => deprecateCommand(root, "CAP-CAMP-001", ME), /requirements and components can be deprecated/);
  assert.throws(() => deprecateCommand(root, "REQ-CAMP-404", ME), /not a record/);
  assert.match(indexCommand(root).board, /- Scheduled for removal: REQ-CAMP-002 \(SLC-CAMP-001-B\)/);

  const c = deprecateCommand(root, "CMP-CAMP-CALENDAR", { ...ME, slice: "SLC-CAMP-002-B" });
  assert.deepEqual([c.removal_slice, c.planned_slice], ["SLC-CAMP-002-B", false]);
  const m = model(root);
  const pack = buildPack(m, deriveStatus(m), "TASK-CAMP-004");
  assert.match(pack.text, /CMP-CAMP-CALENDAR · Calendar module → apps\/web\/src\/calendar\/\*\* — SCHEDULED FOR REMOVAL \(SLC-CAMP-002-B\): do not extend it/);
  assert.throws(() => deprecateCommand(root, "CMP-CAMP-CAMPAIGNS", { ...ME, slice: "SLC-CAMP-404" }), /not a slice/);
});

// A git repository of the fixture, so the rollback can find commits.
function repo() {
  const root = copy();
  const run = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "d@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "d@example.com" } });
  run("init", "-q");
  run("config", "core.autocrlf", "false");
  const commit = (message) => { run("add", "-A"); assert.equal(run("commit", "-q", "-m", message).status, 0); };
  commit("the campaign planner");
  return { root, commit };
}
// A person approves a delta of REQ-CAMP-001 and the requirement says it (as in e62).
function evolveRequirement(root, afterDesign = null) {
  const r = changeCommand(root, ["REQ-CAMP-001"], { ...ME, after: NEW_WORDING, why: "SRC-CAMP-003 (the agency asked for a limit)" });
  const rel = `changes/${r.id}/change.md`;
  edit(root, rel, (s) => s.replace(/\| \? \|/g, "| unchanged |").replace("_How the system will look after this change: decisions and links to ADR- / CMP- / CTR- records._", "The form limits the name."));
  const rows = evolve.parseAffected(read(root, rel).replace(/^---\n[\s\S]*?\n---\n?/, "")).map((x) => ({ ...x, handling: "still valid (the old run is history)" }));
  edit(root, rel, (s) => evolve.putSection(s, `## ${evolve.AFFECTED_TITLE}`, evolve.renderAffected(rows)));
  assert.equal(work.advance(root, r.id, "analyzed", ME).reached, "analyzed");
  work.approve(root, r.id, ME);
  assert.equal(work.advance(root, r.id, "approved", ME).reached, "approved");
  if (afterDesign) afterDesign(r.id); // the change's own bookkeeping, committed on its own
  edit(root, "knowledge/02-requirements/requirements.md", (t) => t.replace(OLD_WORDING, NEW_WORDING));
  fs.mkdirSync(path.join(root, "apps/web/src/campaigns"), { recursive: true });
  fs.appendFileSync(path.join(root, "apps/web/src/campaigns/form.js"), "// the name is limited to 80 characters\n"); // the code of the work
  edit(root, rel, (s) => s.replace(/^status: .*$/m, "status: closed")); // it shipped (the build is not the subject here)
  return r.id;
}

test("B3: a rolled-back change restores the previous baseline state after a passing verify", () => {
  const { root, commit } = repo();
  newRecord(root, "release", "1.0.0", { includes: "CHG-CAMP-001", by: "islam" }); // REL-CAMP-001: version 1
  const chg = evolveRequirement(root, (id) => commit(`${id}: designed and approved`));
  commit(`${chg}: limit the length of the campaign name`);
  newRecord(root, "release", "1.1.0", { includes: chg, by: "islam" }); // REL-CAMP-002: version 2
  assert.equal(evolve.versionOf(model(root), "REQ-CAMP-001"), 2);

  // The rollback names what to revert and where the records go back to.
  assert.throws(() => rollbackCommand(root, "CHG-CAMP-002", ME), /CHG-CAMP-002 is in-progress: a rollback reverts work that was verified or closed/);
  const rb = rollbackCommand(root, chg, ME);
  assert.deepEqual([rb.id, rb.kind, rb.reverts, rb.baseline, rb.risk], ["CHG-CAMP-005", "rollback", [chg], "REL-CAMP-001", "medium"]);
  assert.deepEqual(rb.commits.map((c) => c.subject), [`${chg}: limit the length of the campaign name`], "a commit that only holds records and the change's own bookkeeping is not work to revert");
  assert.deepEqual(rb.requirements.map((r) => [r.id, r.now_version, r.back_version, r.in_baseline]), [["REQ-CAMP-001", 2, 1, true]]);
  assert.match(read(root, `changes/${rb.id}/change.md`), /## Revert[\s\S]*\| [0-9a-f]{7} \| CHG-CAMP-004: limit the length of the campaign name \| CHG-CAMP-004 \|[\s\S]*## Restore[\s\S]*\| REQ-CAMP-001 \| v2, \w+ \| v1, \w+ \| [0-9a-f]{12} \|/);
  assert.equal(model(root).changes.get(rb.id).kind, "rollback");
  assert.deepEqual(codes(root), []);

  // Design and approval: from now the reverted change no longer counts (version, evidence, slices).
  const rel = `changes/${rb.id}/change.md`;
  edit(root, rel, (s) => s.replace(/\| \? \|/g, "| unchanged |").replace("_How the system will look after this change: decisions and links to ADR- / CMP- / CTR- records._", "The name length limit is removed again."));
  assert.equal(work.advance(root, rb.id, "analyzed", ME).reached, "analyzed");
  work.approve(root, rb.id, ME);
  assert.equal(work.advance(root, rb.id, "approved", ME).reached, "approved");
  assert.deepEqual([...model(root).reverted], [chg]);
  assert.equal(evolve.versionOf(model(root), "REQ-CAMP-001"), 1, "the delta of the reverted change does not count");

  // The work: a profile whose test passes, the change under way. Not verified while the record still says the new wording.
  edit(root, "profile.md", (t) => ["Build", "Typecheck", "Lint"].reduce((s, k) => s.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), `- **${k}:**`), t).replace(/- \*\*Test:\*\* .*/, "- **Test:** node -e 0"));
  edit(root, rel, (s) => s.replace(/^status: .*$/m, "status: in-progress"));
  const before = work.advance(root, rb.id, "verified", ME);
  assert.ok(["restored", "verify-after-revert"].every((id) => failed(before).includes(id)), failed(before).join());
  assert.match(before.steps[0].checks.find((c) => c.id === "restored").message, /these records are not back at REL-CAMP-001: REQ-CAMP-001 says something else than in REL-CAMP-001/);
  assert.match(before.steps[0].checks.find((c) => c.id === "verify-after-revert").message, /run royascaff verify CHG-CAMP-005 after the revert/);

  // The record goes back, verify passes, and the gate opens.
  edit(root, "knowledge/02-requirements/requirements.md", (t) => t.replace(NEW_WORDING, OLD_WORDING));
  const v = work.verify(root, rb.id, AI);
  assert.equal(v.result, "pass");
  const after = work.advance(root, rb.id, "verified", ME);
  assert.equal(after.reached, "verified", JSON.stringify(failed(after)));
  assert.match(after.steps[0].checks.find((c) => c.id === "restored").message, /every record is back at REL-CAMP-001 \(wording and version\)/);
  assert.match(after.steps[0].checks.find((c) => c.id === "verify-after-revert").message, new RegExp(`a passing verify \\(${v.evidence}\\) ran after the revert`));

  // The previous baseline state is back: the record equals REL-CAMP-001's, and the diff to it is empty for the requirement.
  const d = diffCommand(root, "REL-CAMP-001", "now");
  assert.ok(!d.changed.some((r) => r.id === "REQ-CAMP-001"), "REQ-CAMP-001 is as it was at REL-CAMP-001");
  assert.equal(deriveStatus(model(root)).requirements.get("REQ-CAMP-001").version, undefined);
});

test("rollback of a release reverts its changes, newest first, back to the baseline before it; a task is seeded from the changes' paths", () => {
  const { root, commit } = repo();
  newRecord(root, "release", "1.0.0", { by: "islam" });
  require("../lib/commands/evolve.cjs").releaseCommand(root, "REL-CAMP-001", ME);
  commit("baseline");
  newRecord(root, "release", "1.1.0", { includes: "CHG-CAMP-001", by: "islam" });
  const rb = rollbackCommand(root, "REL-CAMP-002", ME);
  assert.deepEqual([rb.reverts, rb.baseline], [["CHG-CAMP-001"], "REL-CAMP-001"]);
  assert.match(rb.task, /^TASK-CAMP-/);
  const t = model(root).records.get(rb.task);
  assert.equal(t.fields["Allowed paths"], "apps/web/src/campaigns/**");
  assert.match(t.fields.Goal, /^Revert the commits of CHG-CAMP-001 \(newest first\) and edit the records back to REL-CAMP-001/);
  assert.throws(() => rollbackCommand(root, "REL-CAMP-001", ME), /includes no change/);
  assert.throws(() => rollbackCommand(root, "REQ-CAMP-001", ME), /roll back a change \(CHG-…\) or a release \(REL-…\)/);
  assert.throws(() => rollbackCommand(root, "CHG-CAMP-404", ME), /not a change or a release/);
});
