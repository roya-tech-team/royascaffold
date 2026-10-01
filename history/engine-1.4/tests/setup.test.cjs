"use strict";

// Step 8: navigator skill, cards, init, install — and a full walkthrough through the real CLI.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { initProject, install } = require("../lib/commands/setup.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");

const ENGINE = path.join(__dirname, "..");
const SKILL = path.join(ENGINE, "skill", "royascaff");
const BIN = path.join(ENGINE, "bin", "royascaff.cjs");
const tokens = (file) => Math.ceil(fs.readFileSync(file, "utf8").length / 4);
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "rs-setup-"));

test("instruction budget: SKILL ≤ 400 tokens, each card ≤ 600, a normal session ≤ 1.5k", () => {
  const skill = tokens(path.join(SKILL, "SKILL.md"));
  assert.ok(skill <= 400, `SKILL.md is ~${skill} tokens`);
  const cards = fs.readdirSync(path.join(SKILL, "cards")).map((c) => [c, tokens(path.join(SKILL, "cards", c))]);
  for (const [c, t] of cards) assert.ok(t <= 600, `${c} is ~${t} tokens`);
  const largest = Math.max(...cards.map(([, t]) => t));
  assert.ok(skill + largest <= 1500, `normal route ~${skill + largest} tokens`);
});

test("every card the engine or the skill points to exists", () => {
  const cards = new Set(fs.readdirSync(path.join(SKILL, "cards")));
  const actions = fs.readFileSync(path.join(ENGINE, "lib/next/actions.cjs"), "utf8");
  const cardMap = actions.match(/const CARD = \{([^}]*)\}/)[1];
  const named = [...[...cardMap.matchAll(/"([a-z-]+\.md)"/g)], ...actions.matchAll(/card: "([a-z-]+\.md)"/g)].map((m) => m[1]);
  const skillText = fs.readFileSync(path.join(SKILL, "SKILL.md"), "utf8");
  const situations = skillText.split("## Situations")[1].split("## Rules")[0];
  const fromSkill = [...situations.matchAll(/`([a-z-]+\.md)`/g)].map((m) => m[1]);
  assert.ok(fromSkill.length >= 6);
  for (const c of [...named, ...fromSkill]) assert.ok(cards.has(c), `missing card ${c}`);
  assert.deepEqual([...cards].sort(), ["adopt.md", "build.md", "check-record.md", "design.md", "fix.md", "migrate.md", "plan-feature.md", "plan.md", "record-manual.md", "start.md", "understand.md"]);
});

test("init creates project/ + apps/ with a clean profile; refuses twice and bad codes", () => {
  const repo = tmp();
  assert.throws(() => initProject(repo, { name: "X", code: "9X" }), /--code/);
  assert.throws(() => initProject(repo, { name: "X", code: "TOOLONGCODE1" }), /--code/);
  const r = initProject(repo, { name: "Client Portal", code: "port", app: "web=apps/web,api=apps/api" });
  assert.equal(r.code, "PORT");
  assert.ok(fs.existsSync(path.join(repo, "apps/web")) && fs.existsSync(path.join(repo, "apps/api")));
  for (const f of ["profile.md", "STATUS.md", "PLAYBOOK.md", "GLOSSARY.md", "knowledge/00-roadmap/roadmap.md", "knowledge/02-requirements/requirements.md"]) assert.ok(fs.existsSync(path.join(repo, "project", f)), f);
  const m = buildModel(repo);
  assert.deepEqual(m.issues, []);
  assert.deepEqual([m.is14, m.code, m.profile.project_name], [true, "PORT", "Client Portal"]);
  assert.deepEqual([...m.records.values()].filter((x) => x.kind === "app").map((x) => [x.id, x.fields.Path]), [["APP-PORT-WEB", "apps/web"], ["APP-PORT-API", "apps/api"]]);
  assert.deepEqual([nextCommand(repo).kind, nextCommand(repo).card], ["start", "start.md"]);
  assert.throws(() => initProject(repo, { name: "Again", code: "PORT" }), /already set up/);
});

test("install puts the navigator into Cursor and Claude Code, fills the CLI, never overwrites project docs", () => {
  const repo = tmp();
  initProject(repo, { name: "P", code: "PRJ" });
  fs.writeFileSync(path.join(repo, "project/PLAYBOOK.md"), "# Our playbook\n");
  process.env.ROYASCAFF_CLI = "npx royascaff@beta";
  const r = install(repo, {});
  delete process.env.ROYASCAFF_CLI;
  assert.deepEqual(r.tools, ["cursor", "claude"]);
  for (const tool of [".cursor", ".claude"]) {
    const skill = fs.readFileSync(path.join(repo, tool, "skills/royascaff/SKILL.md"), "utf8");
    assert.match(skill, /^---\nname: royascaff\n/);
    assert.match(skill, /CLI: `npx royascaff@beta`/);
    assert.doesNotMatch(skill, /\{\{CLI\}\}/);
    assert.equal(fs.readdirSync(path.join(repo, tool, "skills/royascaff/cards")).length, 11);
  }
  assert.equal(fs.readFileSync(path.join(repo, "project/PLAYBOOK.md"), "utf8"), "# Our playbook\n");
  assert.deepEqual(install(repo, { cursor: true }).tools, ["cursor"]);
});

test("walkthrough through the CLI: init → plan → open → design → plan → build → check → Done", () => {
  const repo = tmp();
  const env = { ...process.env, ROYASCAFF_USER: "islam" };
  const run = (...args) => {
    const r = spawnSync(process.execPath, [BIN, ...args, "--path", repo], { encoding: "utf8", env });
    if (r.status !== 0) throw new Error(`royascaff ${args.join(" ")} failed:\n${r.stdout}${r.stderr}`);
    return r.stdout;
  };
  run("init", "--name", "Client Portal", "--code", "PORT", "--app", "web=apps/web");
  const brd = path.join(repo, "project/knowledge/01-business/brd.md");
  fs.appendFileSync(brd, "\n### OUT-PORT-001 · Clients see their campaign results\n\n- **Owner:** islam\n");
  run("new", "feature", "Results page", "--horizon", "now", "--outcome", "OUT-PORT-001");
  fs.appendFileSync(path.join(repo, "project/knowledge/02-requirements/requirements.md"), "\n### REQ-PORT-001 · Client sees reach per campaign\n\n- **Priority:** must\n- **Owner:** islam\n- **Feature:** CAP-PORT-001\n");
  fs.appendFileSync(path.join(repo, "project/knowledge/05-implementation/components.md"), "\n### CMP-PORT-RESULTS · Results page\n\n- **Owner:** islam\n- **Code:** apps/web/src/results/**\n- **Realizes:** REQ-PORT-001\n");
  run("new", "slice", "CAP-PORT-001", "Reach table", "--delivers", "REQ-PORT-001");
  assert.match(run("next"), /Open slice SLC-PORT-001-A/);
  run("open", "SLC-PORT-001-A", "--risk", "low");
  const cf = path.join(repo, "project/changes/CHG-PORT-001/change.md");
  fs.writeFileSync(cf, fs.readFileSync(cf, "utf8").replace(/\| \? \|/g, "| referenced |").replace(/_How the system[^\n]*_/, "CMP-PORT-RESULTS renders a reach table."));
  run("new", "task", "CHG-PORT-001", "Reach table", "--inputs", "REQ-PORT-001,CMP-PORT-RESULTS", "--paths", "apps/web/src/results/**", "--checks", "test", "--done", "table shows reach per campaign");
  run("advance", "CHG-PORT-001", "--to", "ready");
  assert.match(run("next"), /Implement TASK-PORT-001 · Reach table/);
  run("task", "TASK-PORT-001", "start", "--by", "ai:claude");
  assert.match(run("context", "TASK-PORT-001"), /Change only files matching: `apps\/web\/src\/results\/\*\*`/);
  run("task", "TASK-PORT-001", "done", "reach table renders; no paging yet", "--by", "ai:claude");
  run("check", "CHG-PORT-001", "--result", "pass", "--note", "npm test");
  fs.mkdirSync(path.join(repo, "project/changes/CHG-PORT-001/evidence"));
  fs.writeFileSync(path.join(repo, "project/changes/CHG-PORT-001/evidence/evidence.md"), "### EVD-PORT-001 · Reach table test\n\n- **Result:** pass\n- **Proves:** REQ-PORT-001\n");
  assert.match(run("advance", "CHG-PORT-001", "--to", "closed"), /CHG-PORT-001 is now closed/);
  const board = fs.readFileSync(path.join(repo, "project/STATUS.md"), "utf8");
  assert.match(board, /\| Now \| CAP-PORT-001 · Results page \| ✅ Done \| Designed \| 1\/1 \| 1\/1 \|/);
  assert.match(board, /_Help: \[PLAYBOOK\]\(PLAYBOOK\.md\) · \[GLOSSARY\]\(GLOSSARY\.md\)_/);
  assert.match(run("next"), /All planned work is done/);
  assert.equal(buildModel(repo).issues.length, 0);
});
