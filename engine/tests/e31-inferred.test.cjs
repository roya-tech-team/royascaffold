"use strict";

// E3.1: inferred records stay unconfirmed until a person confirms them (acceptance A6), and `adopt` shows
// the layer gaps of each module.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus, LABELS } = require("../lib/derive/status.cjs");
const { nextActions } = require("../lib/next/actions.cjs");
const { confirmCommand } = require("../lib/commands/confirm.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { adoption, adoptCommand } = require("../lib/commands/adopt.cjs");
const { validateCommand } = require("../lib/commands/inspect.cjs");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e31-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const code = (fn) => { try { fn(); } catch (e) { return e; } return null; };
const day = (ago) => new Date(Date.now() - ago * 86400000).toISOString().slice(0, 10);
const REQS = (root) => path.join(root, "project/knowledge/02-requirements/requirements.md");
// REQ-CAMP-001 is delivered by a closed change with passing evidence: ✅ Done. Mark it inferred.
const inferred = (root, ago = 1, extra = "") => {
  fs.writeFileSync(REQS(root), fs.readFileSync(REQS(root), "utf8").replace("- **Feature:** CAP-CAMP-001\n- **Verified by:** TEST-CAMP-001\n", `- **Feature:** CAP-CAMP-001\n- **Verified by:** TEST-CAMP-001\n- **Basis:** inferred from apps/web/src/campaigns\n${ago === null ? "" : `- **Inferred on:** ${day(ago)}\n`}${extra}`));
};
const state = (root, id) => deriveStatus(buildModel(root)).requirements.get(id).state;

test("A6: an inferred requirement is unconfirmed, never done, until a person runs confirm", () => {
  const root = copy();
  assert.equal(state(root, "REQ-CAMP-001"), "done", "before: proven and done");
  inferred(root);
  assert.equal(state(root, "REQ-CAMP-001"), "unconfirmed");
  assert.equal(LABELS.unconfirmed, "⏳ Unconfirmed");
  const s = deriveStatus(buildModel(root));
  assert.equal(s.features.get("CAP-CAMP-001").state, "unconfirmed", "the feature cannot be done while one of its requirements is unconfirmed");
  assert.match(require("../lib/commands/views.cjs").indexCommand(root).board, /CAP-CAMP-001 · Create campaigns \| ⏳ Unconfirmed/);
  // next asks a person.
  const m = buildModel(root);
  const action = nextActions(m, deriveStatus(m), null).find((a) => a.kind === "confirm-inferred");
  assert.deepEqual([action.human, action.records], [true, ["REQ-CAMP-001"]]);
  assert.match(action.text, /Confirm 1 inferred record\(s\) .*REQ-CAMP-001/);
  assert.equal(action.say, "royascaff confirm REQ-CAMP-001");

  const r = confirmCommand(root, ["REQ-CAMP-001"], ME);
  assert.deepEqual([r.confirmed, r.by], [["REQ-CAMP-001"], "islam"]);
  assert.equal(state(root, "REQ-CAMP-001"), "done");
  const text = fs.readFileSync(REQS(root), "utf8");
  assert.match(text, /- \*\*Basis:\*\* inferred from apps\/web\/src\/campaigns\n- \*\*Inferred on:\*\* \d{4}-\d\d-\d\d\n- \*\*Confirmed by:\*\* islam \(\d{4}-\d\d-\d\d\)/);
  const log = fs.readFileSync(path.join(root, "project/log.md"), "utf8");
  assert.match(log, /\| record\.confirmed \| REQ-CAMP-001 \| islam \|/);
  assert.equal(buildModel(root).issues.filter((i) => i.severity === "error").length, 0);
  assert.ok(require("../lib/io/exchange.cjs").roundTrip(root).ok, "the file still round-trips");
});

test("confirm is for people, names real records, and does not confirm twice or a record that was never inferred", () => {
  const root = copy();
  inferred(root);
  assert.equal(code(() => confirmCommand(root, ["REQ-CAMP-001"], AI)).code, "HUMAN_REQUIRED");
  assert.equal(code(() => confirmCommand(root, ["REQ-CAMP-404"], ME)).code, "UNKNOWN_ID");
  assert.equal(code(() => confirmCommand(root, ["REQ-CAMP-002"], ME)).code, "ALREADY_EXISTS", "not inferred");
  assert.equal(code(() => confirmCommand(root, [], ME)).code, "INVALID_INPUT");
  confirmCommand(root, ["REQ-CAMP-001"], ME);
  assert.equal(code(() => confirmCommand(root, ["REQ-CAMP-001"], ME)).code, "ALREADY_EXISTS", "already confirmed");
  // Nothing is confirmed when one of the ids is wrong.
  const root2 = copy();
  inferred(root2);
  assert.equal(code(() => confirmCommand(root2, ["REQ-CAMP-001", "REQ-CAMP-404"], ME)).code, "UNKNOWN_ID");
  assert.equal(state(root2, "REQ-CAMP-001"), "unconfirmed");
  // Non-interactive mode: nothing is asked, so a name alone is not enough.
  const old = process.env.ROYASCAFF_NONINTERACTIVE;
  process.env.ROYASCAFF_NONINTERACTIVE = "1";
  try {
    assert.equal(code(() => confirmCommand(root2, ["REQ-CAMP-001"], ME)).code, "HUMAN_REQUIRED");
  } finally {
    if (old === undefined) delete process.env.ROYASCAFF_NONINTERACTIVE;
    else process.env.ROYASCAFF_NONINTERACTIVE = old;
  }
});

test("validate warns about an inferred record still unconfirmed after 14 days, and about one with no date", () => {
  const root = copy();
  inferred(root, 20);
  let w = validateCommand(root).issues.find((i) => i.code === "inferred-unconfirmed");
  assert.match(w.message, /REQ-CAMP-001 was inferred 20 days ago and is still unconfirmed \(over 14 days\): a person confirms it with royascaff confirm REQ-CAMP-001/);
  assert.equal(w.severity, "warning");
  const young = copy();
  inferred(young, 5);
  assert.equal(validateCommand(young).issues.filter((i) => /^inferred-/.test(i.code)).length, 0);
  const undated = copy();
  inferred(undated, null);
  w = validateCommand(undated).issues.find((i) => i.code === "inferred-undated");
  assert.match(w.message, /REQ-CAMP-001 is inferred but has no date: add - \*\*Inferred on:\*\* YYYY-MM-DD/);
  const done = copy();
  inferred(done, 40);
  confirmCommand(done, ["REQ-CAMP-001"], ME);
  assert.equal(validateCommand(done).issues.filter((i) => /^inferred-/.test(i.code)).length, 0, "a confirmed record never warns");
});

test("new record --basis inferred writes the Basis and today's date; an assumption's Basis is its reason, not a flag", () => {
  const root = copy();
  const r = newRecord(root, "requirement", "Posts can be filtered by channel", { feature: "CAP-CAMP-002", basis: "inferred from apps/web/src/calendar/filter.ts", priority: "should" });
  const rec = buildModel(root).records.get(r.id);
  assert.match(rec.fields.Basis, /^inferred from/);
  assert.equal(rec.fields["Inferred on"], day(0));
  assert.equal(deriveStatus(buildModel(root)).requirements.get(r.id).state, "outlined", "unproven, so it is not unconfirmed-done yet");
  const a = newRecord(root, "assumption", "Desktop first", { basis: "inferred from the request" });
  const asm = buildModel(root).records.get(a.id);
  assert.equal(asm.fields["Inferred on"], undefined);
  assert.equal(require("../lib/inferred.cjs").unconfirmed(buildModel(root)).some((x) => x.id === a.id), false, "assumptions are confirmed by the project approval");
});

test("the CLI: confirm --json lists what it confirmed; with an AI identity it is HUMAN_REQUIRED", () => {
  const root = copy();
  inferred(root);
  const run = (args, env = {}) => { const r = spawnSync(process.execPath, [BIN, ...args, "--json"], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off", ...env } }); return { status: r.status, env: JSON.parse(r.stdout) }; };
  const ai = run(["confirm", "REQ-CAMP-001", root, "--by", "ai:claude"]);
  assert.equal(ai.status, 1);
  assert.equal(ai.env.error.code, "HUMAN_REQUIRED");
  const ok = run(["confirm", "REQ-CAMP-001", root, "--by", "islam"]);
  assert.equal(ok.status, 0, JSON.stringify(ok.env));
  assert.deepEqual([ok.env.command, ok.env.data.confirmed, ok.env.data.by], ["confirm", ["REQ-CAMP-001"], "islam"]);
  assert.match(ok.env.events[0], /^EVT-PROJECT-\d{4}$/, "the confirmation is an event of the project log");
});

// ---- layer coverage in adopt ----------------------------------------------------------------

function codeProject() {
  const root = copy();
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put("apps/web/src/calendar/grid.js", "exports.grid = 1;\n");
  put("apps/web/src/campaigns/form.js", "exports.form = 1;\n");
  put("apps/web/src/billing/charge.js", "exports.charge = 1;\n");
  const profile = path.join(root, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [web-ui]\n"));
  return root;
}

test("A6: adopt shows, per module, the files owned and which layers describe it; a module nobody owns has every gap", () => {
  const root = codeProject();
  const a = adoption(buildModel(root));
  const byName = Object.fromEntries(a.modules.map((m) => [m.module, m]));
  const cal = byName["apps/web/src/calendar"];
  assert.deepEqual([cal.owned, cal.files, cal.components], [1, 1, ["CMP-CAMP-CALENDAR"]]);
  const billing = byName["apps/web/src/billing"];
  assert.deepEqual([billing.owned, billing.components], [0, []]);
  // web-ui requires the experience page; every module needs the architecture layer.
  assert.deepEqual(cal.layers.map((l) => l.layer), ["architecture", "experience"]);
  // The architecture page and a rule name the calendar component (and the page says "calendar"): covered. There is no
  // experience page, so that layer is a gap. Nothing names billing at all.
  assert.deepEqual(cal.layer_gaps, ["Experience"]);
  assert.equal(cal.layers.find((l) => l.layer === "architecture").covered, true);
  assert.ok(cal.layers.find((l) => l.layer === "architecture").by.length >= 1);
  assert.deepEqual(billing.layer_gaps, ["Architecture", "Experience"], "no component owns it, so nothing describes it");
  // Writing about billing in the architecture page closes that gap; the experience gap stays.
  const arch = path.join(root, "project/knowledge/04-design/architecture.md");
  fs.writeFileSync(arch, `${fs.readFileSync(arch, "utf8")}\n\nThe billing module charges customers for a campaign.\n`);
  const after = Object.fromEntries(adoption(buildModel(root)).modules.map((m) => [m.module, m]));
  assert.deepEqual(after["apps/web/src/billing"].layer_gaps, ["Experience"]);
  const text = adoptCommand(root).text;
  assert.match(text, /apps\/web\/src\/calendar .*layer gaps: Experience/);
  assert.match(text, /apps\/web\/src\/billing .*layer gaps: Experience/);
  assert.match(text, /Layer gaps: \d+ module\(s\) lack a page for a layer they need/);
});

test("without an adapter the only layer a module needs is architecture", () => {
  const root = copy();
  fs.mkdirSync(path.join(root, "apps/web/src/calendar"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = 1;\n");
  const cal = adoption(buildModel(root)).modules.find((m) => m.module === "apps/web/src/calendar");
  assert.deepEqual(cal.layers.map((l) => l.layer), ["architecture"]);
});
