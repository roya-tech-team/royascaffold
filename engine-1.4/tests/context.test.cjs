"use strict";

// Step 7: Context Packs built from the task, budgets, --save, code map check.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { buildPack } = require("../lib/context.cjs");
const { contextCommand } = require("../lib/commands/context.cjs");
const work = require("../lib/commands/work.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");

const FIX = path.join(__dirname, "fixtures");
const copy = (name = "greenfield") => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-ctx-"));
  fs.cpSync(path.join(FIX, name), root, { recursive: true });
  return root;
};
const pack = (root, task) => {
  const m = buildModel(root);
  return buildPack(m, deriveStatus(m), task);
};

test("a pack holds the task, its rules, where it fits, the change design, inputs, code and hand-offs", () => {
  const root = copy();
  fs.mkdirSync(path.join(root, "apps/web/src/calendar"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.ts"), "export {};\n");
  const p = pack(root, "TASK-CAMP-004");
  assert.deepEqual(p.sections.map((s) => s.name), ["Your task", "Rules for this task", "Where this fits", "Change outcome", "Inputs", "Also linked (titles only)", "Code map", "Earlier tasks in this change", "Sources"]);
  assert.match(p.text, /Change only files matching: `apps\/web\/src\/calendar\/\*\*`/);
  assert.match(p.text, /- Slice: SLC-CAMP-002-A · Calendar with posts — delivers REQ-CAMP-003/);
  assert.match(p.text, /### REQ-CAMP-003 · Calendar shows scheduled posts/);
  assert.match(p.text, /Existing files in the allowed paths \(1\): `apps\/web\/src\/calendar\/grid\.ts`/);
  assert.match(p.text, /TASK-CAMP-003 · Calendar grid — month grid renders the campaign dates/);
  assert.match(p.text, /> \*\*Read when:\*\* designing, building or checking a slice/);
  assert.deepEqual(p.records.sort(), ["CMP-CAMP-CALENDAR", "REQ-CAMP-003", "TASK-CAMP-004"]);
  assert.ok(p.tokens < 1000);
  assert.equal(pack(root, "TASK-CAMP-004").text, p.text, "deterministic");
});

test("one hop: rules the code must obey in full, other scope as titles only, 1.3 status lines dropped", () => {
  const m = buildModel(path.join(FIX, "kuni-1.3"));
  const p = buildPack(m, deriveStatus(m), "TASK-KUNI-004");
  assert.doesNotMatch(p.text, /Implementation status:|Knowledge status:/);
  const related = p.text.split("## Related (one hop from the inputs)")[1] || "";
  assert.doesNotMatch(related.split("## ")[0], /### REQ-/, "requirements outside the task's inputs are titles only");
  assert.match(p.text, /## Also linked \(titles only\)/);
  assert.ok(p.within);
});

test("documents named by the task are included in full; a missing one is an error", () => {
  const root = copy();
  const plan = path.join(root, "project/changes/CHG-CAMP-002/plan.md");
  fs.writeFileSync(plan, fs.readFileSync(plan, "utf8").replace("- **Done when:** each post appears on its scheduled day", "- **Done when:** each post appears on its scheduled day\n- **Documents:** knowledge/01-business/brd.md"));
  assert.match(pack(root, "TASK-CAMP-004").text, /## Document · knowledge\/01-business\/brd\.md[\s\S]*Agency teams plan social campaigns/);
  fs.writeFileSync(plan, fs.readFileSync(plan, "utf8").replace("knowledge/01-business/brd.md", "knowledge/missing.md"));
  assert.throws(() => pack(root, "TASK-CAMP-004"), /names document knowledge\/missing\.md, which does not exist/);
});

test("over budget is refused with the largest parts named, never cut", () => {
  const root = copy();
  const profile = path.join(root, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("project_code: CAMP", "project_code: CAMP\ncontext_budget_tokens: 300"));
  assert.throws(() => contextCommand(root, "TASK-CAMP-004"), /~\d+ tokens, over the budget of 300\. Split the task \(largest parts: .+\); nothing is ever cut silently/);
});

test("context writes to the git-ignored cache; --save keeps a linkable copy that is not knowledge", () => {
  const root = copy();
  const r = contextCommand(root, "TASK-CAMP-004", { save: true });
  assert.deepEqual(r.written, ["project/.cache/contexts/TASK-CAMP-004.md", "project/changes/CHG-CAMP-002/contexts/TASK-CAMP-004.md"]);
  assert.match(fs.readFileSync(path.join(root, "project/.cache/.gitignore"), "utf8"), /^\*$/m);
  const m = buildModel(root);
  assert.deepEqual(m.issues, [], "saved packs repeat record headings but are excluded from the model");
  assert.ok(roundTrip(root).ok);
});

test("the ready gate measures every task's context", () => {
  const root = copy();
  const profile = path.join(root, "project/profile.md");
  const openFix = work.openOther(root, "Tidy the form", { kind: "chore", by: "islam" });
  const cf = path.join(root, "project/changes", openFix.id, "change.md");
  fs.writeFileSync(cf, fs.readFileSync(cf, "utf8").replace(/\| \? \|/g, "| unchanged |"));
  work.newTask(root, openFix.id, "Tidy", { inputs: "REQ-CAMP-001,CMP-CAMP-CAMPAIGNS", paths: "apps/web/src/campaigns/**", checks: "lint", done: "tidy" });
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("project_code: CAMP", "project_code: CAMP\ncontext_budget_tokens: 200"));
  let r = work.advance(root, openFix.id, "ready", { by: "islam" });
  const budget = r.steps[r.steps.length - 1].checks.find((c) => c.id === "context-budget");
  assert.equal(budget.ok, false);
  assert.match(budget.message, /over the budget of 200 tokens: TASK-CAMP-006 ~\d+ — split these tasks/);
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("context_budget_tokens: 200", "context_budget_tokens: 12000"));
  r = work.advance(root, openFix.id, "ready", { by: "islam" });
  assert.equal(r.reached, "ready");
  assert.match(r.steps[r.steps.length - 1].checks.find((c) => c.id === "context-budget").message, /every task's context fits \(largest ~\d+ of 12000 tokens\)/);
});

test("code map: source files outside every component's globs are one warning per app", () => {
  const root = copy();
  const put = (rel) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), "export {};\n");
  };
  put("apps/web/src/campaigns/form.ts");
  put("apps/web/src/calendar/grid.ts");
  assert.deepEqual(buildModel(root).issues, []);
  put("apps/web/src/settings/theme.ts");
  put("apps/web/src/settings/colors.ts");
  put("apps/web/node_modules/lib/index.js");
  const issues = buildModel(root).issues;
  assert.deepEqual(issues.map((i) => i.code), ["unmapped-source"]);
  assert.match(issues[0].message, /2 source file\(s\) in apps\/web belong to no component/);
  const profile = path.join(root, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("project_code: CAMP", "project_code: CAMP\ncode_exclude: apps/web/src/settings/**"));
  assert.deepEqual(buildModel(root).issues, []);
});
