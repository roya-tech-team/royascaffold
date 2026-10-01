"use strict";

// E6.2: baselines, `diff` and `history` (plan file 02 §3). Acceptance B2.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const work = require("../lib/commands/work.cjs");
const { changeCommand, releaseCommand, diffCommand, historyCommand } = require("../lib/commands/evolve.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const evolve = require("../lib/evolve.cjs");
const baseline = require("../lib/baseline.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");
const { validate } = require("./schema-lite.cjs");

const ME = { by: "islam" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const NEW_WORDING = "A planner saves a campaign with a name of at most 80 characters.";
const OLD_WORDING = "A planner enters client, name, start and end dates, and channels, then saves.";

const copy = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e62-"));
  fs.cpSync(GREEN, root, { recursive: true });
  return root;
};
const schema = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "contract", "schemas", `${name}.schema.json`), "utf8"));
const rel = (id) => path.join("project", "changes", id, "change.md");
const req = (root) => path.join(root, "project/knowledge/02-requirements/requirements.md");

// A person approves a delta of REQ-CAMP-001 (version 2) and the record is edited to say it.
function evolveRequirement(root) {
  const r = changeCommand(root, ["REQ-CAMP-001"], { ...ME, after: NEW_WORDING, why: "SRC-CAMP-003 (the agency asked for a limit)" });
  const f = path.join(root, rel(r.id));
  let s = fs.readFileSync(f, "utf8").replace(/\| \? \|/g, "| unchanged |").replace("_How the system will look after this change: decisions and links to ADR- / CMP- / CTR- records._", "The form limits the name.");
  const rows = evolve.parseAffected(s.replace(/^---\n[\s\S]*?\n---\n?/, "")).map((x) => ({ ...x, handling: "still valid (the old run is history)" }));
  fs.writeFileSync(f, evolve.putSection(s, `## ${evolve.AFFECTED_TITLE}`, evolve.renderAffected(rows)));
  assert.equal(work.advance(root, r.id, "analyzed", ME).reached, "analyzed");
  work.approve(root, r.id, ME);
  assert.equal(work.advance(root, r.id, "approved", ME).reached, "approved");
  fs.writeFileSync(req(root), fs.readFileSync(req(root), "utf8").replace(OLD_WORDING, NEW_WORDING));
  return r.id;
}

test("release writes a frozen baseline: every record with version and hash, the links, the status, the evidence", () => {
  const root = copy();
  const rec = newRecord(root, "release", "1.0.0", { by: "islam" });
  assert.equal(rec.baseline, undefined, "a release that names nothing yet gets its baseline from `royascaff release`");
  const r = releaseCommand(root, rec.id, ME);
  assert.deepEqual([r.release, r.file], ["REL-CAMP-001", "baselines/REL-CAMP-001.json"]);
  const file = path.join(root, "project", r.file);
  const b = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.deepEqual(validate(schema("baseline"), b), []);
  assert.equal(b.release, "REL-CAMP-001");
  const q = b.records.find((x) => x.id === "REQ-CAMP-001");
  assert.deepEqual([q.kind, q.version, q.hash.length], ["requirement", 1, 12]);
  assert.match(q.text, new RegExp(OLD_WORDING));
  assert.ok(!b.records.some((x) => ["change", "task"].includes(x.kind)), "changes and tasks live in the logs, not in the snapshot");
  assert.ok(b.links.some((l) => l.from === "TEST-CAMP-001" && l.type === "verifies" && l.to === "REQ-CAMP-001"));
  assert.ok(b.evidence.some((e) => e.id === "EVD-CAMP-001" && e.proves.includes("TEST-CAMP-001")));
  assert.equal(b.status.requirements["REQ-CAMP-001"].state, deriveStatus(buildModel(root)).requirements.get("REQ-CAMP-001").state);
  const m = buildModel(root);
  assert.equal(m.approvals.events.map((e) => e.event).pop(), "baseline.written");
  assert.throws(() => releaseCommand(root, rec.id, ME), /already has a baseline.*frozen/);
  assert.throws(() => releaseCommand(root, "REQ-CAMP-001", ME), /baselines belong to releases/);
  assert.throws(() => releaseCommand(root, "REL-CAMP-404", ME), /not a record/);
  assert.ok(require("../lib/io/exchange.cjs").roundTrip(root).ok, "the json file does not disturb the markdown round trip");
});

test("a release that names its changes gets its baseline at once", () => {
  const root = copy();
  const rec = newRecord(root, "release", "1.0.0", { includes: "CHG-CAMP-001", by: "islam" });
  assert.equal(rec.baseline, "baselines/REL-CAMP-001.json");
  assert.deepEqual(baseline.listBaselines(buildModel(root)), ["REL-CAMP-001"]);
  assert.deepEqual(baseline.readBaseline(buildModel(root), "REL-CAMP-001").includes, ["CHG-CAMP-001"]);
});

test("B2: two releases diff correctly: added, changed (version, wording, the change that did it) and removed", () => {
  const root = copy();
  const one = newRecord(root, "release", "1.0.0", { includes: "CHG-CAMP-001", by: "islam" });
  const chg = evolveRequirement(root);
  newRecord(root, "requirement", "Export a campaign", { feature: "CAP-CAMP-001", priority: "should", by: "islam" });
  fs.writeFileSync(req(root), fs.readFileSync(req(root), "utf8").replace(/### REQ-CAMP-006 · Reach per campaign[\s\S]*?(?=### TEST-CAMP-001)/, ""));
  const two = newRecord(root, "release", "1.1.0", { includes: chg, by: "islam" });
  assert.deepEqual([one.id, two.id], ["REL-CAMP-001", "REL-CAMP-002"]);

  const d = diffCommand(root, "REL-CAMP-001", "REL-CAMP-002");
  assert.deepEqual(validate(schema("diff"), (({ text, ...x }) => x)(d)), []);
  assert.deepEqual([d.from, d.to], ["REL-CAMP-001", "REL-CAMP-002"]);
  assert.deepEqual(d.removed.map((r) => r.id), ["REQ-CAMP-006"]);
  assert.deepEqual(d.added.map((r) => r.id).sort(), ["REL-CAMP-002", "REQ-CAMP-007"]);
  const c = d.changed.find((r) => r.id === "REQ-CAMP-001");
  assert.deepEqual([c.from_version, c.to_version, c.causes], [1, 2, [chg]]);
  assert.match(c.before, new RegExp(OLD_WORDING));
  assert.match(c.after, /name of at most 80 characters/);
  assert.equal(d.by_kind.requirement.changed, 1);
  assert.match(d.text, /REQ-CAMP-001 \(requirement\) Create a campaign — v1 → v2 — by CHG-CAMP-004/);

  // The same diff, from the snapshots only: identical to what the live state says now.
  const live = diffCommand(root, "REL-CAMP-002", "now");
  assert.deepEqual([live.counts.added, live.counts.changed, live.counts.removed], [0, 0, 0], "nothing changed since the last baseline");
  assert.equal(diffCommand(root, "REL-CAMP-001").to, "REL-CAMP-002", "the default second side is the next baseline");
  assert.throws(() => diffCommand(root, "REL-CAMP-009", "now"), /REL-CAMP-009 has no baseline/);
  assert.throws(() => diffCommand(root, undefined), /Usage: royascaff diff/);
});

test("the board's Releases section shows what changed since the last baseline", () => {
  const root = copy();
  newRecord(root, "release", "1.0.0", { includes: "CHG-CAMP-001", by: "islam" });
  assert.match(indexCommand(root).board, /## Releases\n\nBaselines: REL-CAMP-001\. Since REL-CAMP-001: 0 added · 0 changed · 0 removed/);
  const chg = evolveRequirement(root);
  const board = indexCommand(root).board;
  assert.match(board, /Since REL-CAMP-001: 0 added · 1 changed · 0 removed/);
  assert.match(board, new RegExp(`\\| REQ-CAMP-001 · Create a campaign \\| changed \\| v1 → v2 \\| ${chg} \\|`));
});

test("B2: history shows every version of a record, who, in which change, and the baselines", () => {
  const root = copy();
  newRecord(root, "release", "1.0.0", { includes: "CHG-CAMP-001", by: "islam" });
  const chg = evolveRequirement(root);
  newRecord(root, "release", "1.1.0", { includes: chg, by: "islam" });
  const h = historyCommand(root, "REQ-CAMP-001");
  assert.deepEqual(validate(schema("history"), (({ text, ...x }) => x)(h)), []);
  assert.equal(h.version, 2);
  assert.deepEqual(h.versions.map((v) => [v.version, v.event, v.change]), [[1, "created", null], [2, "delta applied", chg]]);
  const v2 = h.versions[1];
  assert.deepEqual([v2.by, v2.before, v2.after, v2.why, v2.breaking, v2.counted], ["islam", OLD_WORDING, NEW_WORDING, "SRC-CAMP-003 (the agency asked for a limit)", false, true]);
  assert.deepEqual(h.baselines.map((b) => [b.release, b.present, b.version, Boolean(b.changed)]), [["REL-CAMP-001", true, 1, false], ["REL-CAMP-002", true, 2, true]]);
  assert.ok(h.events.some((e) => e.event === "change.approved" && e.by === "islam" && e.log === chg));
  assert.match(h.text, /v2  delta applied in CHG-CAMP-004 \(approved\) · islam/);
  assert.throws(() => historyCommand(root, "REQ-CAMP-404"), /not a record/);
  assert.equal(historyCommand(root, "REQ-CAMP-002").version, 1);
});

test("history reads who created the record from git, and the baselines rebuild from the repository", () => {
  const root = copy();
  const run = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "d@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "d@example.com" } });
  run("init", "-q");
  run("config", "core.autocrlf", "false");
  run("add", "-A");
  assert.equal(run("commit", "-q", "-m", "the campaign planner").status, 0);
  const h = historyCommand(root, "REQ-CAMP-001");
  assert.equal(h.commits.length, 1);
  assert.deepEqual([h.commits[0].by, h.commits[0].subject], ["Dev", "the campaign planner"]);
  assert.deepEqual([h.versions[0].by, h.versions[0].git], ["Dev", h.commits[0].commit]);
});

test("a baseline is built from the repository alone: the same knowledge gives the same snapshot", () => {
  const root = copy();
  newRecord(root, "release", "1.0.0", { by: "islam" });
  const a = baseline.buildBaseline(buildModel(root), deriveStatus(buildModel(root)), "REL-CAMP-001");
  const other = copy();
  newRecord(other, "release", "1.0.0", { by: "islam" });
  const b = baseline.buildBaseline(buildModel(other), deriveStatus(buildModel(other)), "REL-CAMP-001");
  assert.deepEqual(a.records, b.records);
  assert.deepEqual(a.links, b.links);
});
