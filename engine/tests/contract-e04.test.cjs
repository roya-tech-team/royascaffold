"use strict";

// Contract v1, work package E0.4: `events --since`, the complete `export --json`, and the
// non-interactive mode that never prompts (human-only steps return HUMAN_REQUIRED).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { validate } = require("./schema-lite.cjs");
const { call, copyFixture, BIN, env } = require("./contract-scenarios.cjs");
const { exportProject, renderExport } = require("../lib/io/exchange.cjs");

const SCHEMAS = path.join(__dirname, "..", "contract", "schemas");
const schemaOf = (name) => JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.schema.json`), "utf8"));

test("events: the whole log in time order, each event with a stable ID", () => {
  const root = copyFixture("greenfield");
  const r = call(["events", root]);
  assert.equal(r.envelope.ok, true);
  const { events, count, last } = r.envelope.data;
  assert.equal(count, events.length);
  assert.ok(events.length >= 10);
  assert.equal(last, events[events.length - 1].id);
  const times = events.map((e) => Date.parse(e.when));
  assert.deepEqual([...times].sort((a, b) => a - b), times, "oldest first");
  assert.equal(new Set(events.map((e) => e.id)).size, events.length, "IDs are unique");
  for (const e of events) assert.match(e.id, /^EVT-(PROJECT|CHG-[A-Z0-9-]+)-\d{4}$/);
  assert.ok(events.some((e) => e.change === null && e.event === "project.approved"), "project events are included");
  assert.ok(events.some((e) => e.change === "CHG-CAMP-001" && e.id === "EVT-CHG-CAMP-001-0001"));
});

test("events --since an EVT ID returns only the events after it; the same call later returns only the new ones", () => {
  const root = copyFixture("greenfield");
  const all = call(["events", root]).envelope.data.events;
  const mid = all[Math.floor(all.length / 2)];
  const after = call(["events", root, "--since", mid.id]).envelope.data.events;
  assert.deepEqual(after.map((e) => e.id), all.slice(all.indexOf(mid) + 1).map((e) => e.id));
  assert.equal(call(["events", root, "--since", all[all.length - 1].id]).envelope.data.count, 0);

  const last = call(["events", root]).envelope.data.last;
  call(["open", "--kind", "chore", "Tidy the styles", root]);
  const fresh = call(["events", root, "--since", last]).envelope.data;
  assert.equal(fresh.count, fresh.events.length);
  assert.ok(fresh.count >= 1);
  assert.ok(fresh.events.every((e) => e.change === "CHG-CAMP-004"));

  const unknown = call(["events", root, "--since", "EVT-CHG-NOPE-0001"]);
  assert.equal(unknown.envelope.error.code, "UNKNOWN_ID");
  assert.equal(unknown.status, 1);
});

test("events --since a date or a span, --change and --limit", () => {
  const root = copyFixture("greenfield");
  const all = call(["events", root]).envelope.data.events;
  const cut = call(["events", root, "--since", "2026-09-20"]).envelope.data.events;
  assert.ok(cut.length > 0 && cut.length < all.length);
  assert.ok(cut.every((e) => Date.parse(e.when) >= Date.parse("2026-09-20")));
  assert.equal(call(["events", root, "--since", "3650d"]).envelope.data.count, all.length);
  assert.equal(call(["events", root, "--since", "tomorrow-ish"]).envelope.error.code, "INVALID_INPUT");
  const own = call(["events", root, "--change", "CHG-CAMP-002"]).envelope.data.events;
  assert.ok(own.length > 0 && own.every((e) => e.change === "CHG-CAMP-002"));
  assert.equal(call(["events", root, "--limit", "2"]).envelope.data.events.length, 2);
});

test("events without --json prints JSON lines, one event per line", () => {
  const root = copyFixture("greenfield");
  const r = spawnSync(process.execPath, [BIN, "events", root], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split("\n");
  assert.ok(lines.length >= 10);
  for (const line of lines) assert.match(JSON.parse(line).id, /^EVT-/);
});

test("export --json: records, links, derived status, evidence and the board in one document that matches its schema", () => {
  const root = copyFixture("greenfield");
  const r = call(["export", root]);
  assert.equal(r.envelope.ok, true);
  const doc = r.envelope.data;
  assert.deepEqual(validate(schemaOf("export"), doc), []);
  assert.equal(doc.format, "royascaff-exchange");
  assert.ok(doc.records.find((x) => x.id === "REQ-CAMP-001"), "records");
  assert.ok(doc.links.find((l) => l.from === "REQ-CAMP-001" && l.type === "verified_by" && l.to === "TEST-CAMP-001" && l.resolved === true), "typed links");
  assert.ok(doc.status.requirements["REQ-CAMP-001"].state, "derived status of a requirement");
  assert.ok(doc.status.features["CAP-CAMP-001"], "derived status of a feature");
  assert.equal(doc.status.changes["CHG-CAMP-001"].stage.length > 0, true, "derived status of a change");
  assert.ok(doc.evidence.length >= 1 && doc.evidence.every((e) => /^EVD-/.test(e.id)), "evidence");
  assert.match(doc.board, /Campaign Planner/, "the board text");
  assert.equal(doc.engine, require("../package.json").version);
});

test("the full export still renders back to the same Markdown (the exchange part is unchanged)", () => {
  const root = copyFixture("greenfield");
  const doc = call(["export", root]).envelope.data;
  const out = path.join(root, "..", `rs-render-${path.basename(root)}`);
  renderExport(doc, out);
  for (const f of exportProject(root).files) {
    assert.equal(fs.readFileSync(path.join(out, f.path), "utf8"), fs.readFileSync(path.join(root, "project", f.path), "utf8"), f.path);
  }
});

// Non-interactive mode: no prompt, ever. Even where a terminal exists, a person's step is not asked for.
const nonInteractive = { ROYASCAFF_NONINTERACTIVE: "1", ROYASCAFF_NO_TTY: "" };

test("non-interactive: an approval by a named person is HUMAN_REQUIRED and says what is needed", () => {
  const root = copyFixture("greenfield");
  const f = path.join(root, "project", "changes", "CHG-CAMP-003", "change.md");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/^status: .*$/m, "status: analyzed"));
  const r = call(["approve", "CHG-CAMP-003", "--by", "islam", root], nonInteractive);
  assert.equal(r.status, 1);
  assert.equal(r.envelope.error.code, "HUMAN_REQUIRED");
  assert.match(r.envelope.error.missing.join(" "), /approval token/);
  assert.equal(call(["events", root, "--change", "CHG-CAMP-003"]).envelope.data.events.some((e) => e.event === "change.approved"), false, "nothing was recorded");

  const ai = call(["approve", "CHG-CAMP-003", "--by", "ai:claude", root], nonInteractive);
  assert.equal(ai.envelope.error.code, "HUMAN_REQUIRED");
  assert.equal(call(["approve", "project", "--by", "islam", root], nonInteractive).envelope.error.code, "HUMAN_REQUIRED");
  assert.equal(call(["measure", "OUT-CAMP-001", "--result", "met", "--note", "x", "--by", "islam", root], nonInteractive).envelope.error.code, "HUMAN_REQUIRED");
});

test("non-interactive: the same approval works as before when the mode is off (the terminal path stays)", () => {
  const root = copyFixture("greenfield");
  const f = path.join(root, "project", "changes", "CHG-CAMP-003", "change.md");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/^status: .*$/m, "status: analyzed"));
  assert.equal(call(["approve", "CHG-CAMP-003", "--by", "islam", root]).envelope.ok, true);
});

test("non-interactive: a person's look is never asked for on a terminal", () => {
  const root = copyFixture("greenfield");
  const profile = path.join(root, "project", "profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [web-ui]\n"));
  const r = call(["check", "CHG-CAMP-001", "--result", "pass", "--note", "looked", "--bar", "all", "--by", "islam", root], nonInteractive);
  assert.equal(r.envelope.ok, false, r.stdout);
  assert.equal(r.envelope.error.code, "HUMAN_REQUIRED");
  assert.ok(r.envelope.error.missing.length > 0);
});
