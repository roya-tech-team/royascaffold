"use strict";

// Beta.4 · WP-D6 (code checked against the knowledge) and WP-D7 (business at both ends).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { measureOutcome } = require("../lib/commands/approve.cjs");
const { initProject } = require("../lib/commands/setup.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { violations } = require("../lib/rulecheck.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-d6-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const file = (root, rel) => path.join(root, "project", rel);
const edit = (root, rel, fn) => fs.writeFileSync(file(root, rel), fn(fs.readFileSync(file(root, rel), "utf8")));
const put = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
const nodeProject = (root) => edit(root, "profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [node]\n").replace(/(- \*\*(Build|Typecheck|Lint|Test):\*\*) .*/g, "$1 node -e 0"));

test("D6: a path-form dependency rule fails the full check on a violating import and names the rule", () => {
  const root = copy();
  nodeProject(root);
  edit(root, "knowledge/04-design/architecture.md", (t) => t.replace(/(## 5\. Dependency rules\n\n)[^\n]*/, "$1- `apps/web/src/calendar/**` must not import `apps/web/src/campaigns/**`: the calendar reads campaigns through the store."));
  newRecord(root, "rule", "No chart library in the calendar: `apps/web/src/calendar/**` must not import `chart.js`", { applies: "CMP-CAMP-CALENDAR" });
  put(root, "apps/web/src/calendar/grid.ts", "import { store } from '../store';\nexport const grid = store;\n");
  assert.deepEqual(violations(buildModel(root)).violations, [], "allowed imports pass");
  put(root, "apps/web/src/calendar/grid.ts", "import { form } from '../campaigns/form';\nimport Chart from 'chart.js/auto';\nexport const grid = [form, Chart];\n");
  const v = violations(buildModel(root));
  assert.deepEqual(v.violations.map((x) => [x.file, x.spec, x.rule.source]), [["apps/web/src/calendar/grid.ts", "../campaigns/form", "knowledge/04-design/architecture.md · Dependency rules"], ["apps/web/src/calendar/grid.ts", "chart.js/auto", v.rules[1].source]]);
  const r = work.recordCheck(root, "CHG-CAMP-002", AI);
  const rules = r.results.find((x) => x.kind === "Rules");
  assert.equal(rules.pass, false);
  assert.match(rules.tail, /apps\/web\/src\/calendar\/grid\.ts imports "\.\.\/campaigns\/form" — breaks `apps\/web\/src\/calendar\/\*\*` must not import `apps\/web\/src\/campaigns\/\*\*`/);
  assert.equal(r.result, "fail");
});

test("D6: overlapping and whole-app components are warned", () => {
  const root = copy();
  edit(root, "knowledge/05-implementation/components/components.md", (t) => `${t}\n### CMP-CAMP-SHELL · App shell\n\n- **Owner:** roya-team\n- **Code:** apps/web/**\n- **Realizes:** REQ-CAMP-001\n`);
  const codes = buildModel(root).issues.filter((i) => /^component-/.test(i.code)).map((i) => `${i.code}:${i.message.split(" ")[0]}`);
  assert.ok(codes.includes("component-owns-app:CMP-CAMP-SHELL"), codes.join());
  assert.ok(codes.some((c) => c.startsWith("component-overlap:")), codes.join());
});

test("D6: an NFR measure is compared with the latest measured value from the checks", () => {
  const root = copy();
  nodeProject(root);
  newRecord(root, "nfr", "The calendar stays smooth", { feature: "CAP-CAMP-002", priority: "should" });
  edit(root, "knowledge/02-requirements/nfr.md", (t) => t.replace(/\*\*Measure:\*\* _[^\n]*_/, "**Measure:** `app.fps >= 50` in the full check."));
  put(root, "apps/web/metric.cjs", "console.error('ROYASCAFF_METRIC app.fps=' + process.argv[2]);\n");
  edit(root, "profile.md", (t) => t.replace("- **Test:** node -e 0", "- **Test:** node metric.cjs 14"));
  let r = work.recordCheck(root, "CHG-CAMP-002", AI);
  assert.match(fs.readFileSync(file(root, "changes/CHG-CAMP-002/evidence/checks.md"), "utf8"), /- \*\*Metrics:\*\* app\.fps=14/);
  let m = buildModel(root);
  let req = deriveStatus(m).requirements.get("NFR-CAMP-001");
  assert.deepEqual([req.measure.expr, req.measure.value, req.measure.ok, req.evidence], ["app.fps >= 50", 14, false, []]);
  assert.match(indexCommand(root).board, /⚠ NFR-CAMP-001 measure `app\.fps >= 50`: last 14/);
  edit(root, "profile.md", (t) => t.replace("node metric.cjs 14", "node metric.cjs 60"));
  r = work.recordCheck(root, "CHG-CAMP-002", AI);
  m = buildModel(root);
  req = deriveStatus(m).requirements.get("NFR-CAMP-001");
  assert.deepEqual([req.measure.value, req.measure.ok, req.evidence], [60, true, [r.evidence]]);
});

test("D7: demands are one table row each; delivered when what covers them is done", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-d7-"));
  initProject(repo, { name: "Campaign Planner", code: "CAMP" });
  edit(repo, "knowledge/00-discovery/request.md", (t) => t.replace("_Paste the full request here, word for word._", "Planners drag posts between days. No accounts yet."));
  const a = newRecord(repo, "source", "Drag posts between days", { quote: "Planners drag posts between days" });
  const b = newRecord(repo, "source", "No accounts | yet", { quote: "No accounts yet." });
  assert.throws(() => newRecord(repo, "source", "Invented", { quote: "a timeline" }), /not in the request/);
  const text = fs.readFileSync(file(repo, "knowledge/00-discovery/coverage.md"), "utf8");
  assert.match(text, new RegExp(`\\| ${a.id} \\| Drag posts between days \\| Planners drag posts between days \\|  \\| \\|\\n\\| ${b.id} \\| No accounts \\\\\\| yet \\| No accounts yet\\. \\|  \\| \\|`));
  const cov = buildModel(repo).approvals.coverage;
  assert.deepEqual(cov.sources.map((s) => [s.id, s.found, s.covered.length]), [[a.id, true, 0], [b.id, true, 0]]);
  assert.equal(cov.sources[1].title, "No accounts | yet");
});

test("D7: an outcome is measured by a person once its features are done; the ratio leaves the request out", () => {
  const root = copy();
  assert.throws(() => measureOutcome(root, "OUT-CAMP-001", { ...AI, result: "met", note: "x" }), /must come from a person/);
  assert.throws(() => measureOutcome(root, "CAP-CAMP-001", { ...ME, result: "met", note: "x" }), /not an outcome/);
  measureOutcome(root, "OUT-CAMP-001", { ...ME, result: "not-met", note: "planners still use a spreadsheet" });
  const board = indexCommand(root).board;
  assert.match(board, /\| OUT-CAMP-001 · Campaigns are planned in one place \| 1\/2 \| ✗ not met \| islam [\d-]+: planners still use a spreadsheet \|/);
  assert.match(board, /- Docs vs code: \d+ doc lines/);
  const { healthOf } = require("../lib/views/health.cjs");
  const m = buildModel(root);
  const before = healthOf(m, deriveStatus(m)).docLines;
  edit(root, "knowledge/00-discovery/request.md", (t) => `${t}\n${"More of the request.\n".repeat(50)}`);
  const m2 = buildModel(root);
  assert.equal(healthOf(m2, deriveStatus(m2)).docLines, before, "request.md is not documentation");
});

test("D7: the Design stage shows the person's constraints, look and visual bar", () => {
  const root = copy();
  edit(root, "knowledge/00-discovery/discovery.md", (t) => t.replace(/(## 5\. Constraints\n\n)[^\n]*/, "$1Laptop screens first; works offline for a day."));
  require("../lib/commands/approve.cjs").approveProject(root, ME); // the discovery changed: the person approves it again
  work.advance(root, "CHG-CAMP-002", "cancelled", { ...ME, reason: "restart" });
  work.advance(root, "CHG-CAMP-003", "cancelled", { ...ME, reason: "not now" });
  const id = work.openSlice(root, "SLC-CAMP-002-A", { ...ME, risk: "low" }).id;
  edit(root, `changes/${id}/change.md`, (t) => t.replace(/\| \? \|/g, "| unchanged |").replace(/_What will be true[^\n]*_/, "Planners see posts."));
  assert.equal(work.advance(root, id, "analyzed", AI).reached, "analyzed");
  const n = nextCommand(root);
  assert.equal(n.stage, "design");
  assert.ok(n.brief.some((l) => /^Constraints: Laptop screens first/.test(l)), JSON.stringify(n.brief));
  assert.ok(n.brief.some((l) => /^Look, feel and references: The agency brand/.test(l)));
  assert.ok(n.brief.some((l) => /^Visual bar: 1\. Calm like a paper planner/.test(l)));
});
