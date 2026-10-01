"use strict";

// E1.3: the judge pack, the judge's verdicts and the identity rule (acceptance A4).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { nextActions } = require("../lib/next/actions.cjs");
const J = require("../lib/judge.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const JUDGE = "ai:codex:judge";
const ID = "CHG-CAMP-002";
const code = (fn) => { try { fn(); } catch (e) { return e; } return null; };
const verdict = (line, v, reason = "checked it", by = JUDGE) => ({ line, verdict: v, reason, by });
const ALL = ["REQ-CAMP-003#1", "REQ-CAMP-003#2", "REQ-CAMP-003#3", "REQ-CAMP-003#4"];

// CHG-CAMP-002 at risk `risk`, verified by the machines, with four typed lines on its must requirement.
function project(risk = "high") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e13-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put("apps/web/src/calendar/grid.js", "exports.grid = () => 1;\n");
  const profile = path.join(root, "project/profile.md");
  let text = fs.readFileSync(profile, "utf8");
  for (const k of ["Build", "Typecheck", "Lint"]) text = text.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), `- **${k}:**`);
  fs.writeFileSync(profile, text.replace(/- \*\*Test:\*\* .*/, `- **Test:** node -e "console.log('ROYASCAFF_METRIC cal_ms=120')"`));
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, fs.readFileSync(reqs, "utf8").replace(/(### REQ-CAMP-003[^\n]*\n\n- \*\*Priority:\*\* must\n- \*\*Owner:\*\* product-owner\n- \*\*Feature:\*\* CAP-CAMP-002\n)/, "$1\nPosts show on their day.\n\n**Acceptance**\n- [unit] A post appears on its scheduled day.\n- [metric] `cal_ms <= 200` with 200 posts.\n- [manual] The calendar reads well on a phone.\n- [inspection] The grid code has no hard-coded dates.\n") + "\n### TEST-CAMP-003 · Calendar tests\n\n- **Owner:** roya-team\n- **Check:** runner:test\n- **Verifies:** REQ-CAMP-003\n");
  const change = path.join(root, `project/changes/${ID}/change.md`);
  fs.writeFileSync(change, fs.readFileSync(change, "utf8").replace("risk: medium", `risk: ${risk}`));
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.verify(root, ID, AI);
  return root;
}
const model = (root) => buildModel(root);
const gate = (root) => work.advance(root, ID, "verified", ME);
const failedIds = (g) => g.steps[g.steps.length - 1].checks.filter((c) => !c.ok).map((c) => c.id);

test("the pack holds the requirement, its typed lines with the machine result, the design, the evidence and who built it", () => {
  const root = project();
  const r = work.judge(root, ID, {});
  assert.equal(r.mode, "pack");
  assert.deepEqual(r.builders, ["ai:claude"]);
  assert.deepEqual(r.lines.map((l) => l.key), ALL);
  assert.equal(r.pack, `project/.cache/judge/${ID}.md`);
  assert.equal(fs.readFileSync(path.join(root, r.pack), "utf8"), r.text);
  for (const part of [/# Judge pack · CHG-CAMP-002/, /Built by: ai:claude/, /### REQ-CAMP-003 — Calendar shows scheduled posts \(must\)/, /REQ-CAMP-003#1 \[unit\] A post appears on its scheduled day\. — machine result: pass/, /REQ-CAMP-003#2 \[metric\].* — machine result: pass/, /REQ-CAMP-003#3 \[manual\].* — machine result: pending/, /## Design/, /## Evidence\n\n- EVD-CAMP-\d+ · verify · pass/, /ai:<tool>:judge/]) assert.match(r.text, part);
});

test("A4: the identity that built the tasks cannot record the judge verdict; an AI judge needs the judge role", () => {
  const root = project();
  let e = code(() => work.judge(root, ID, { line: "REQ-CAMP-003#1", verdict: "met", reason: "looks right", by: "ai:claude" }));
  assert.equal(e.code, "GATE_REFUSED");
  assert.match(e.message, /ai:claude built the tasks of CHG-CAMP-002 and cannot judge it/);
  e = code(() => work.judge(root, ID, { line: "REQ-CAMP-003#1", verdict: "met", reason: "x", by: "ai:codex" }));
  assert.equal(e.code, "GATE_REFUSED");
  assert.match(e.message, /ai:<tool>:judge/);
  assert.equal(model(root).changes.get(ID).events.filter((x) => x.event === "judge.recorded").length, 0, "nothing was recorded");
});

test("a judge needs evidence to read, a known line, a verdict word and a reason", () => {
  const root = project();
  const none = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e13b-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), none, { recursive: true });
  assert.match(code(() => work.judge(none, ID, { line: "REQ-CAMP-003#1", verdict: "met", reason: "x", by: JUDGE })).message, /has no evidence yet/);
  assert.equal(code(() => work.judge(root, ID, { line: "REQ-CAMP-003#9", verdict: "met", reason: "x", by: JUDGE })).code, "UNKNOWN_ID");
  assert.equal(code(() => work.judge(root, ID, { line: "REQ-CAMP-003#1", verdict: "fine", reason: "x", by: JUDGE })).code, "INVALID_INPUT");
  assert.equal(code(() => work.judge(root, ID, { line: "REQ-CAMP-003#1", verdict: "met", by: JUDGE })).code, "INVALID_INPUT");
});

test("A4: a high-risk change cannot be verified without a met verdict for every must line", () => {
  const root = project("high");
  let g = gate(root);
  assert.equal(g.ok, false);
  assert.ok(failedIds(g).includes("judge"));
  assert.match(g.steps[0].checks.find((c) => c.id === "judge").message, /risk high needs a judge verdict of met for every must line: still missing REQ-CAMP-003#1, REQ-CAMP-003#2, REQ-CAMP-003#3, REQ-CAMP-003#4/);
  // Three of four are not enough.
  const file = path.join(root, "verdicts.json");
  fs.writeFileSync(file, JSON.stringify({ judge: JUDGE, verdicts: ALL.slice(0, 3).map((l) => ({ line: l, verdict: "met", reason: "saw it" })) }));
  const r = work.judge(root, ID, { "verdict-file": file });
  assert.deepEqual([r.mode, r.judge, r.result, r.summary.met], ["verdicts", JUDGE, "met", 3]);
  assert.deepEqual(r.state.missing, ["REQ-CAMP-003#4"]);
  assert.ok(failedIds(gate(root)).includes("judge"));
  work.judge(root, ID, verdict("REQ-CAMP-003#4", "met"));
  g = gate(root);
  assert.equal(g.reached, "verified", JSON.stringify(g.steps[0].checks.filter((c) => !c.ok)));
  // The verdicts are evidence of kind judge, with the judge's identity.
  const ev = [...model(root).evidence.values()].filter((e) => e.kind === "judge");
  assert.equal(ev.length, 2);
  assert.equal(model(root).records.get(ev[0].id).fields.Judge, JUDGE);
  assert.ok(model(root).changes.get(ID).events.some((e) => e.event === "judge.recorded" && e.by === JUDGE));
  // Judge evidence proves nothing by itself.
  assert.deepEqual(ev.map((e) => e.proves), [[], []]);
});

test("a medium-risk change does not need the judge; a judge that finds a line not met still stops it", () => {
  const root = project("medium");
  assert.equal(gate(root).reached, "verified");
  const root2 = project("medium");
  work.judge(root2, ID, verdict("REQ-CAMP-003#1", "not-met", "the post is on the wrong day"));
  const g = gate(root2);
  assert.ok(failedIds(g).includes("judge"));
  assert.match(g.steps[0].checks.find((c) => c.id === "judge").message, /the judge found these not met: REQ-CAMP-003#1/);
});

test("unclear goes to a person: next asks for one, and an AI cannot turn it into met", () => {
  const root = project("high");
  work.judge(root, ID, { "verdict-file": (() => { const f = path.join(root, "v.json"); fs.writeFileSync(f, JSON.stringify({ verdicts: ALL.map((l) => ({ line: l, verdict: l.endsWith("#3") ? "unclear" : "met", reason: "r" })) })); return f; })(), by: JUDGE });
  const m = model(root);
  const action = nextActions(m, deriveStatus(m), null).find((a) => a.change === ID);
  assert.deepEqual([action.kind, action.human], ["judge-unclear", true]);
  assert.match(action.text, /these are unclear and go to a person: REQ-CAMP-003#3/);
  const e = code(() => work.judge(root, ID, verdict("REQ-CAMP-003#3", "met", "now I am sure")));
  assert.equal(e.code, "HUMAN_REQUIRED");
  assert.match(e.message, /only a person turns an unclear line into met/);
  work.judge(root, ID, verdict("REQ-CAMP-003#3", "met", "I looked at it on a phone", "islam"));
  assert.equal(gate(root).reached, "verified");
});

test("a verdict belongs to the code it saw: after the code changes it is stale and the judge is asked again", () => {
  const root = project("high");
  work.judge(root, ID, { "verdict-file": (() => { const f = path.join(root, "v.json"); fs.writeFileSync(f, JSON.stringify({ verdicts: ALL.map((l) => ({ line: l, verdict: "met", reason: "r" })) })); return f; })(), by: JUDGE });
  assert.equal(J.gateState(model(root), model(root).changes.get(ID)).ok, true);
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = () => 99;\n");
  const s = J.gateState(model(root), model(root).changes.get(ID));
  assert.equal(s.ok, false);
  assert.deepEqual(s.missing, ALL);
});
