"use strict";

// E4.1: `inventory` (what the project holds, and what needs attention), `ci` (validate + freshness + the rule
// check, non-zero on gate errors) and the GitHub Action template, tested on a sample repository.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const work = require("../lib/commands/work.cjs");
const { inventoryCommand } = require("../lib/commands/inventory.cjs");
const { ciCommand } = require("../lib/commands/ci.cjs");
const { confirmCommand } = require("../lib/commands/confirm.cjs");

const ENGINE = path.join(__dirname, "..");
const BIN = path.join(ENGINE, "bin", "royascaff.cjs");
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const AI = { by: "ai:claude" };
const metric = (n, v) => `node -e "console.log('ROYASCAFF_METRIC ${n}=${v}')"`;
const git = (dir, ...args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });

// A sample repository: the greenfield project with real files for the calendar component, committed in git.
function sample(adapter = "web-ui") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e41-"));
  fs.cpSync(GREEN, root, { recursive: true });
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put("apps/web/src/calendar/grid.js", "exports.grid = () => 1;\n");
  put("apps/web/src/campaigns/form.js", "exports.form = () => 1;\n");
  put("apps/web/src/misc/util.js", "exports.util = 1;\n");
  const profile = path.join(root, "project/profile.md");
  let text = fs.readFileSync(profile, "utf8");
  for (const k of ["Build", "Typecheck", "Lint"]) text = text.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), `- **${k}:**`);
  fs.writeFileSync(profile, text.replace(/- \*\*Test:\*\* .*/, `- **Test:** ${metric("cal_ms", 120)}`).replace("royascaff: 1.4\n", `royascaff: 1.4\nadapters: [${adapter}]\n`));
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, `${fs.readFileSync(reqs, "utf8")}\n### TEST-CAMP-003 · Calendar tests\n\n- **Owner:** roya-team\n- **Check:** runner:test\n- **Verifies:** REQ-CAMP-003\n`);
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  git(root, "init", "-q");
  git(root, "config", "user.email", "dev@example.com");
  git(root, "config", "user.name", "Dev");
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "sample");
  return root;
}
const cli = (args, cwd) => { const r = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } }); return { status: r.status, stdout: r.stdout, stderr: r.stderr }; };

test("inventory: records per layer and kind, adapters with their check kinds, unowned code, nothing stale in a clean project", () => {
  const root = sample();
  const inv = inventoryCommand(root);
  const layer = (id) => inv.layers.find((l) => l.layer === id);
  assert.ok(layer("requirements").records >= 6, "the requirements layer holds the REQ- and TEST- ... records");
  assert.deepEqual(layer("requirements").pages.map((p) => p.file), ["knowledge/02-requirements/requirements.md"]);
  assert.ok(layer("components").records >= 2);
  assert.ok(inv.records.total > 30 && inv.records.by_kind.requirement === 6);
  assert.deepEqual(inv.adapters.map((a) => a.name), ["node", "web-ui"]);
  assert.deepEqual(inv.adapters.find((a) => a.name === "web-ui").person_check, "visual");
  assert.deepEqual(inv.adapters.find((a) => a.name === "node").person_check, "transcript", "node's own manifest; web-ui's is the one in force");
  assert.deepEqual(inv.person_check, { kind: "visual", bar: "Visual bar" });
  assert.deepEqual(inv.stale_evidence, []);
  assert.deepEqual(inv.unconfirmed, []);
  assert.deepEqual(inv.open_repairs, []);
  assert.deepEqual(inv.unowned_code.modules, [{ module: "apps/web/src/misc", unowned: 1 }], "util.js belongs to no component");
  assert.equal(inv.unowned_code.files, 1);
  assert.match(inv.text, /Unowned code: 1 file\(s\) in 1 module/);
});

test("inventory shows stale evidence, unconfirmed inferred records and a change waiting in the repair loop", () => {
  const root = sample();
  const v = work.verify(root, "CHG-CAMP-002", AI);
  assert.equal(v.result, "pass");
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = () => 2;\n");
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, fs.readFileSync(reqs, "utf8").replace("- **Feature:** CAP-CAMP-001\n- **Verified by:** TEST-CAMP-001\n", "- **Feature:** CAP-CAMP-001\n- **Verified by:** TEST-CAMP-001\n- **Basis:** inferred from the code\n- **Inferred on:** 2026-09-30\n"));
  // A failed verify: the Test command now reports a slow metric against a limit.
  const inv = inventoryCommand(root);
  assert.deepEqual(inv.stale_evidence.map((e) => [e.id, e.change]), [[v.evidence, "CHG-CAMP-002"]]);
  assert.deepEqual(inv.unconfirmed.map((u) => u.id), ["REQ-CAMP-001"]);
  assert.match(inv.text, /Stale evidence: 1/);
  assert.match(inv.text, /Unconfirmed inferred records: 1/);
  assert.equal(confirmCommand(root, ["REQ-CAMP-001"], { by: "islam" }).confirmed[0], "REQ-CAMP-001");
  assert.deepEqual(inventoryCommand(root).unconfirmed, []);
});

test("ci passes on a clean project and says what it ran", () => {
  const root = sample();
  const r = ciCommand(root);
  assert.equal(r.ok, true);
  assert.deepEqual(r.checks.map((c) => c.id), ["validate", "freshness", "rules"]);
  assert.ok(r.checks.every((c) => c.ok));
  assert.deepEqual([r.errors, r.counts.errors], [0, 0]);
  const out = cli(["ci", root], root);
  assert.equal(out.status, 0, out.stdout + out.stderr);
  assert.match(out.stdout, /✓ validate/);
  assert.match(out.stdout, /RoyaScaff ci: PASS/);
});

test("ci fails (exit 1, CHECK_FAILED) on a validation error and on stale evidence of a closed change, and says what to fix", () => {
  const bad = sample();
  const f = path.join(bad, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("**Verified by:** TEST-CAMP-001", "**Verified by:** TEST-CAMP-999"));
  const out = cli(["ci", bad, "--json"], bad);
  assert.equal(out.status, 1);
  const env = JSON.parse(out.stdout);
  assert.deepEqual([env.ok, env.command, env.error.code], [false, "ci", "CHECK_FAILED"]);
  assert.ok(env.error.missing.some((m) => /TEST-CAMP-999/.test(m)));
  assert.equal(env.error.details.checks.find((c) => c.id === "validate").ok, false);

  // Stale evidence of a closed change is an error; of an open change only a warning.
  const root = sample("node");
  work.verify(root, "CHG-CAMP-002", AI);
  for (const to of ["verified", "reconciled", "closed"]) {
    git(root, "add", "-A");
    git(root, "commit", "-q", "-m", `before ${to}`);
    assert.equal(work.advance(root, "CHG-CAMP-002", to, { by: "islam" }).reached, to);
  }
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "close");
  assert.equal(ciCommand(root).ok, true);
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "exports.grid = () => 3;\n");
  const stale = ciCommand(root);
  assert.equal(stale.ok, false);
  const fresh = stale.checks.find((c) => c.id === "freshness");
  assert.equal(fresh.ok, false);
  assert.match(fresh.items[0], /EVD-CAMP-\d+ of CHG-CAMP-002 is stale: the code or tests it covered changed; run royascaff verify CHG-CAMP-002/);
  const cli2 = cli(["ci", root], root);
  assert.equal(cli2.status, 1);
  assert.match(cli2.stdout, /✗ freshness/);
  assert.match(cli2.stdout, /RoyaScaff ci: FAIL/);
  // Re-running verify makes it pass again.
  work.verify(root, "CHG-CAMP-002", AI);
  assert.equal(ciCommand(root).ok, true);
});

test("ci runs the dependency rules: a path rule broken by the code fails it", () => {
  const root = sample();
  const arch = path.join(root, "project/knowledge/04-design/architecture.md");
  fs.writeFileSync(arch, `${fs.readFileSync(arch, "utf8")}\n\n## Dependency rules\n\n- \`apps/web/src/calendar/**\` must not import \`apps/web/src/campaigns/**\`\n`);
  fs.writeFileSync(path.join(root, "apps/web/src/calendar/grid.js"), "const f = require('../campaigns/form');\nexports.grid = f;\n");
  const r = ciCommand(root);
  const rules = r.checks.find((c) => c.id === "rules");
  assert.equal(rules.ok, false, JSON.stringify(rules));
  assert.equal(r.ok, false);
});

test("templates/ci/github-action.yml runs ci on pull requests with full history and the pinned tool, and is what the sample repo runs", () => {
  const file = path.join(ENGINE, "templates", "ci", "github-action.yml");
  const yml = fs.readFileSync(file, "utf8");
  assert.match(yml, /^name: RoyaScaff/m);
  assert.match(yml, /^on:\s*\n\s+pull_request:/m);
  assert.match(yml, /fetch-depth: 0/);
  assert.match(yml, /actions\/checkout@v4/);
  assert.match(yml, /actions\/setup-node@v4/);
  assert.match(yml, /npx royascaff ci/);
  assert.match(yml, /royascaff-tool/, "it explains the pinned tool alias");
  assert.doesNotMatch(yml, /\t/, "YAML has no tab characters");
  // The sample repo: the template is copied to .github/workflows and its run step is the command CI executes.
  const root = sample();
  fs.mkdirSync(path.join(root, ".github", "workflows"), { recursive: true });
  fs.copyFileSync(file, path.join(root, ".github", "workflows", "royascaff.yml"));
  const step = yml.split("\n").map((l) => l.match(/^\s+-?\s*run:\s*(npx royascaff ci.*)$/)).filter(Boolean)[0][1];
  const shown = step.replace(/^npx royascaff/, "").trim().split(/\s+/);
  assert.deepEqual(shown, ["ci"]);
  const out = cli(["ci", ...shown.slice(1)], root);
  assert.equal(out.status, 0, out.stdout + out.stderr);
});

test("the package ships the template; inventory and ci have schemas and are documented commands", () => {
  const pack = spawnSync("npm pack --dry-run --json --ignore-scripts", { cwd: ENGINE, encoding: "utf8", shell: true });
  const parsed = JSON.parse(pack.stdout);
  const info = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0];
  assert.ok(info.files.map((f) => f.path.replace(/\\/g, "/")).includes("templates/ci/github-action.yml"));
  const doc = fs.readFileSync(path.join(ENGINE, "docs", "CONTRACT.md"), "utf8");
  for (const c of ["inventory", "ci", "scan", "confirm"]) assert.match(doc, new RegExp(`\\b${c}\\b`));
});
