"use strict";

// E1.2: `verify`, evidence fingerprints and freshness (acceptance A3).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus, LABELS } = require("../lib/derive/status.cjs");
const { statusCommand } = require("../lib/commands/views.cjs");
const { fingerprintOf } = require("../lib/fingerprint.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const metric = (n, v) => `node -e "console.log('ROYASCAFF_METRIC ${n}=${v}')"`;

// The greenfield project with real files for the calendar component, an app whose Test command reports a
// metric, and acceptance lines of every type on REQ-CAMP-003 (delivered by CHG-CAMP-002).
function project({ cal = 120, limit = 200 } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e12-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put("apps/web/src/calendar/grid.js", "exports.grid = () => 1;\n");
  put("apps/web/src/campaigns/form.js", "exports.form = () => 1;\n");
  const profile = path.join(root, "project/profile.md");
  let text = fs.readFileSync(profile, "utf8");
  for (const k of ["Build", "Typecheck", "Lint"]) text = text.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), `- **${k}:**`);
  text = text.replace(/- \*\*Test:\*\* .*/, `- **Test:** ${metric("cal_ms", cal)}`);
  fs.writeFileSync(profile, text);
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, fs.readFileSync(reqs, "utf8").replace(/(### REQ-CAMP-003[^\n]*\n\n- \*\*Priority:\*\* must\n- \*\*Owner:\*\* product-owner\n- \*\*Feature:\*\* CAP-CAMP-002\n)/, `$1\nPosts show on their day.\n\n**Acceptance**\n- [unit] A post appears on its scheduled day.\n- [metric] \`cal_ms <= ${limit}\` with 200 posts.\n- [manual] The calendar reads well on a phone.\n- [e2e] Dragging is not needed to see the posts.\n`) + "\n### TEST-CAMP-003 · Calendar tests\n\n- **Owner:** roya-team\n- **Check:** runner:test\n- **Verifies:** REQ-CAMP-003\n");
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  return root;
}
const model = (root) => buildModel(root);

test("verify runs the checks, judges each typed acceptance line, and writes a fingerprinted evidence record", () => {
  const root = project();
  const r = work.verify(root, "CHG-CAMP-002", AI);
  assert.equal(r.mode, "verify");
  assert.equal(r.result, "pass");
  assert.match(r.fingerprint, /^[0-9a-f]{12}$/);
  assert.deepEqual(r.lines.map((l) => [l.key, l.type, l.result]), [
    ["REQ-CAMP-003#1", "unit", "pass"],
    ["REQ-CAMP-003#2", "metric", "pass"],
    ["REQ-CAMP-003#3", "manual", "pending"],
    ["REQ-CAMP-003#4", "e2e", "pending"],
  ]);
  assert.match(r.lines[3].why, /no e2e check ran/);
  assert.deepEqual(r.pending, ["REQ-CAMP-003#3", "REQ-CAMP-003#4"]);
  const ev = model(root).evidence.get(r.evidence);
  assert.deepEqual([ev.kind, ev.result, ev.fingerprint], ["verify", "pass", r.fingerprint]);
  assert.ok(ev.proves.includes("TEST-CAMP-003"));
  const text = fs.readFileSync(path.join(root, "project/changes/CHG-CAMP-002/evidence/checks.md"), "utf8");
  assert.match(text, /\*\*Fingerprint:\*\* [0-9a-f]{12} \(\d+ file\(s\) and the engine version\)/);
  assert.match(text, /- REQ-CAMP-003#2 · metric · pass/);
  assert.equal(work.advance(root, "CHG-CAMP-002", "verified", ME).reached, "verified");
});

test("a metric line that misses its limit fails the verify, and the failing line is named in the log", () => {
  const root = project({ cal: 350, limit: 200 });
  const r = work.verify(root, "CHG-CAMP-002", AI);
  assert.equal(r.result, "fail");
  assert.equal(r.lines.find((l) => l.type === "metric").result, "fail");
  assert.deepEqual(r.proves, [], "a failed verify proves nothing");
  const last = model(root).changes.get("CHG-CAMP-002").events.pop();
  assert.match(last.note, /^fail: APP-CAMP-WEB — test ✓ \(EVD-CAMP-\d+\) · failing lines: REQ-CAMP-003#2$/);
});

test("A3: editing a covered file turns the evidence stale on the next status; verify refreshes it", () => {
  const root = project();
  const first = work.verify(root, "CHG-CAMP-002", AI);
  assert.equal(work.advance(root, "CHG-CAMP-002", "closed", ME).reached, "closed");
  let m = model(root);
  let s = deriveStatus(m);
  assert.equal(s.requirements.get("REQ-CAMP-003").state, "done");
  assert.equal(s.stale.size, 0);

  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = () => 2;\n"); // not even committed
  m = model(root);
  s = deriveStatus(m);
  assert.deepEqual([...s.stale], [first.evidence], "the evidence is stale");
  assert.equal(s.requirements.get("REQ-CAMP-003").state, "stale", "stale, not done");
  assert.equal(s.requirements.get("REQ-CAMP-003").evidence.length, 0);
  assert.deepEqual(s.requirements.get("REQ-CAMP-003").staleEvidence, [first.evidence]);
  assert.equal(s.features.get("CAP-CAMP-002").state, "stale");
  assert.equal(LABELS.stale, "⚠️ Stale");
  const st = statusCommand(root);
  assert.equal(st.features.find((f) => f.id === "CAP-CAMP-002").state, "stale");
  assert.match(require("../lib/commands/views.cjs").indexCommand(root).board, /⚠️ Stale[\s\S]*stale evidence \(the code changed since it ran; run royascaff verify\): REQ-CAMP-003/);

  const again = work.verify(root, "CHG-CAMP-002", AI);
  assert.notEqual(again.fingerprint, first.fingerprint);
  s = deriveStatus(model(root));
  assert.equal(s.requirements.get("REQ-CAMP-003").state, "done", "re-running verify refreshes it");
  assert.deepEqual([...s.stale], [first.evidence], "the old record stays stale; the new one is fresh");
});

test("a covered file changes the fingerprint; a file no component owns does not", () => {
  const root = project();
  const a = fingerprintOf(model(root), model(root).changes.get("CHG-CAMP-002")).hash;
  fs.writeFileSync(path.join(root, "apps/web/notes.txt"), "not covered\n");
  assert.equal(fingerprintOf(model(root), model(root).changes.get("CHG-CAMP-002")).hash, a, "a file no component owns is not covered");
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = () => 3;\n");
  assert.notEqual(fingerprintOf(model(root), model(root).changes.get("CHG-CAMP-002")).hash, a);
});

test("evidence without a fingerprint (an older engine wrote it) never goes stale", () => {
  const root = project();
  const s = deriveStatus(model(root));
  assert.equal(s.stale.size, 0);
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "x\n");
  assert.equal(deriveStatus(model(root)).stale.size, 0, "the fixture's evidence has no fingerprint");
});

test("the verified gate says the evidence is stale and tells you to run verify", () => {
  const root = project();
  work.verify(root, "CHG-CAMP-002", AI);
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = () => 4;\n");
  const g = work.advance(root, "CHG-CAMP-002", "verified", ME);
  assert.equal(g.ok, false);
  const ids = g.steps[0].checks.filter((c) => !c.ok).map((c) => c.id);
  assert.ok(ids.includes("evidence"), ids.join());
  assert.match(g.steps[0].checks.find((c) => c.id === "evidence").message, /the evidence for REQ-CAMP-003 is stale.*run royascaff verify CHG-CAMP-002/);
});
