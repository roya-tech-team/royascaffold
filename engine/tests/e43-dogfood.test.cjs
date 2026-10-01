"use strict";

// E4.3: the engine develops itself with itself. The engine that runs the work is a pinned copy, never the working
// copy; the CLI warns when it is the engine being changed; the repository is a RoyaScaff project; a stable 1.5.0
// would be published under the `latest` tag.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { runsOnItself, guardWarning, MESSAGE } = require("../lib/guard.cjs");

const ENGINE = path.join(__dirname, "..");
const REPO = path.join(ENGINE, "..");
const TOOL = path.join(REPO, "scripts", "tool.cjs");
const repoLevel = fs.existsSync(TOOL) && fs.existsSync(path.join(REPO, "plans"));
const skipRepo = repoLevel ? false : "not the royascaffold repository layout";

const sep = path.sep;
test("runsOnItself: the engine inside the repository it works on warns; a pinned copy in node_modules, or elsewhere, does not", () => {
  const repo = path.join(os.tmpdir(), "repo");
  assert.equal(runsOnItself(repo, repo), true, "the engine folder equals the repository root");
  assert.equal(runsOnItself(path.join(repo, "engine"), repo), true, "the engine lives in a folder of the repository");
  assert.equal(runsOnItself(path.join(repo, "node_modules", "royascaff-tool"), repo), false, "the pinned alias");
  assert.equal(runsOnItself(path.join(repo, "node_modules", "royascaff"), repo), false);
  assert.equal(runsOnItself(path.join(repo, "tools", "node_modules", "royascaff-tool"), repo), false);
  // Regression (1.7): the `.tool/` snapshot is a pinned copy too and must not warn.
  assert.equal(runsOnItself(path.join(repo, ".tool", "abc1234"), repo), false, ".tool/<ref> snapshot");
  assert.equal(runsOnItself(path.join(repo, ".tool", "current", "engine"), repo), false, ".tool/current");
  assert.equal(runsOnItself(path.join(repo, "tool", "engine"), repo), true, "a folder merely named tool still warns");
  assert.equal(runsOnItself(path.join(os.tmpdir(), "elsewhere", "engine"), repo), false);
  assert.equal(runsOnItself(path.join(os.tmpdir(), "repo2"), repo), false, "a sibling whose name starts the same");
  assert.equal(runsOnItself(path.dirname(repo), repo), false, "the parent folder");
  assert.equal(runsOnItself(null, repo), false);
});

test("guardWarning gives the plain sentence, and ROYASCAFF_NO_GUARD=1 switches it off", () => {
  const repo = path.join(os.tmpdir(), "repo");
  const w = guardWarning(path.join(repo, "engine"), repo);
  assert.equal(w, MESSAGE(path.join(repo, "engine"), repo));
  assert.match(w, /^You are running the engine you are changing/);
  assert.match(w, /node scripts\/tool\.cjs/);
  const old = process.env.ROYASCAFF_NO_GUARD;
  process.env.ROYASCAFF_NO_GUARD = "1";
  try {
    assert.equal(guardWarning(path.join(repo, "engine"), repo), null);
  } finally {
    if (old === undefined) delete process.env.ROYASCAFF_NO_GUARD;
    else process.env.ROYASCAFF_NO_GUARD = old;
  }
});

// A repository that holds a copy of the engine (like this one) and a project, to run the real CLI in.
function repoWithEngine() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e43-"));
  const copy = (to) => fs.cpSync(ENGINE, to, { recursive: true, filter: (src) => !/[\\/](tests|node_modules|scripts)([\\/]|$)/.test(path.relative(ENGINE, src)) && !src.endsWith(".tgz") && !/-log\.txt$/.test(src) });
  copy(path.join(root, "engine"));
  copy(path.join(root, "node_modules", "royascaff-tool"));
  const env = { ...process.env, ROYASCAFF_USAGE: "off" };
  delete env.ROYASCAFF_NO_GUARD;
  const run = (engine, args) => spawnSync(process.execPath, [path.join(root, engine, "bin", "royascaff.cjs"), ...args], { cwd: root, encoding: "utf8", env });
  const init = run("node_modules/royascaff-tool", ["init", root, "--name", "Self", "--code", "SELF", "--app", "engine=engine", "--adapter", "node", "--json"]);
  assert.equal(init.status, 0, init.stdout + init.stderr);
  return { root, run };
}

test("the CLI: the working copy inside the repository warns (in warnings with --json, on stderr without it); the pinned alias does not", () => {
  const { root, run } = repoWithEngine();
  const own = run("engine", ["status", root, "--json"]);
  assert.equal(own.status, 0, own.stderr);
  const env = JSON.parse(own.stdout);
  assert.equal(env.ok, true);
  assert.equal(env.warnings.length, 1);
  assert.match(env.warnings[0], /^You are running the engine you are changing \(.*engine is part of /);
  const text = run("engine", ["status", root]);
  assert.match(text.stderr, /^⚠ You are running the engine you are changing/m);
  assert.doesNotMatch(text.stdout, /You are running the engine/);
  const pinned = run("node_modules/royascaff-tool", ["status", root, "--json"]);
  assert.deepEqual(JSON.parse(pinned.stdout).warnings, []);
  assert.doesNotMatch(run("node_modules/royascaff-tool", ["status", root]).stderr, /You are running/);
  // Commands that do not work on a project stay quiet.
  assert.equal(run("engine", ["--version"]).stderr, "");
  assert.equal(run("engine", ["help"]).stderr, "");
});

test("scripts/tool.cjs runs the pinned copy and never the working copy: --which, $ROYASCAFF_TOOL, and a snapshot of a git ref", { skip: skipRepo }, () => {
  const none = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e43t-"));
  const env = { ...process.env, ROYASCAFF_TOOL_ROOT: none };
  delete env.ROYASCAFF_TOOL;
  const run = (args, extra = {}) => spawnSync(process.execPath, [TOOL, ...args], { cwd: none, encoding: "utf8", env: { ...env, ...extra } });
  let r = run(["--which"]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /No pinned tool\. Run: node scripts\/tool\.cjs --snapshot/);
  r = run(["status"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /the working copy in engine\/ must not run on its own repository/);
  // $ROYASCAFF_TOOL names a folder that holds bin/royascaff.cjs.
  const fake = path.join(none, "fake");
  fs.mkdirSync(path.join(fake, "bin"), { recursive: true });
  fs.writeFileSync(path.join(fake, "bin", "royascaff.cjs"), "process.stdout.write('pinned ' + process.argv.slice(2).join(' ') + '\\n'); process.exit(Number(process.env.FAKE_EXIT || 0));\n");
  r = run(["--which"], { ROYASCAFF_TOOL: fake });
  assert.match(r.stdout, /bin[\\/]royascaff\.cjs \(\$ROYASCAFF_TOOL\)/);
  r = run(["status", "--json"], { ROYASCAFF_TOOL: fake });
  assert.equal(r.stdout.trim(), "pinned status --json");
  assert.equal(run(["x"], { ROYASCAFF_TOOL: fake, FAKE_EXIT: "3" }).status, 3, "the exit status of the pinned tool is passed on");
  // A snapshot of a committed state, from git, with no registry.
  const git = (...a) => spawnSync("git", ["-C", none, ...a], { encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "dev@example.com");
  git("config", "user.name", "Dev");
  fs.mkdirSync(path.join(none, "engine", "bin"), { recursive: true });
  fs.writeFileSync(path.join(none, "engine", "bin", "royascaff.cjs"), "process.stdout.write('snapshot ' + process.argv.slice(2).join(' ') + '\\n');\n");
  git("add", "-A");
  git("commit", "-q", "-m", "engine v1");
  r = run(["--snapshot"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Pinned tool: .*\.tool/);
  assert.equal(run(["hello", "world"]).stdout.trim(), "snapshot hello world");
  // The snapshot is a copy: changing the working copy afterwards does not change the pinned tool.
  fs.writeFileSync(path.join(none, "engine", "bin", "royascaff.cjs"), "process.stdout.write('changed\\n');\n");
  assert.equal(run(["hello"]).stdout.trim(), "snapshot hello");
});

test("the repository is a RoyaScaff project: adapter node, every engine source file owned, the 1.5-2.0 plans adopted, no validation error, a change made through the engine", { skip: skipRepo }, () => {
  const { buildModel } = require("../lib/model/graph.cjs");
  const { adoption, adoptDocs } = require("../lib/commands/adopt.cjs");
  const model = buildModel(REPO);
  assert.equal(model.code, "ENG");
  assert.deepEqual(model.profile.adapters, ["node"]);
  const app = model.records.get("APP-ENG-ENGINE");
  assert.deepEqual([app.fields.Path, app.fields.Test], ["engine", "npm test"]);
  assert.deepEqual(model.issues.filter((i) => i.severity === "error"), []);
  const own = adoption(model);
  assert.equal(own.percent, 100, `engine source files no component owns: ${own.modules.filter((m) => m.percent < 100).map((m) => m.module).join(", ")}`);
  const docs = adoptDocs(REPO, "plans/v1.5-v2.0");
  assert.deepEqual([docs.counts.documents, docs.counts.covered, docs.counts.problems], [6, 6, 0], "every plan file is quoted by a demand or a decision");
  const change = model.changes.get("CHG-ENG-001");
  assert.ok(change && change.status !== "cancelled", "the guard was built as a change of this project");
  assert.deepEqual(change.affects, ["REQ-ENG-001"]);
});

test("a stable 1.5.0 is published under the latest tag: deploy.cjs takes the tag from the version, and a pre-release gets its own", () => {
  const src = fs.readFileSync(path.join(ENGINE, "scripts", "deploy.cjs"), "utf8");
  const line = src.split("\n").find((l) => /^const tag = /.test(l));
  assert.ok(line, "deploy.cjs computes the tag");
  const tagOf = (version) => new Function("pkg", `${line.replace(/^const tag = /, "return ")}`)({ version });
  assert.equal(tagOf("1.5.0"), "latest");
  assert.equal(tagOf("1.5.1"), "latest");
  assert.equal(tagOf("1.5.0-alpha.2"), "alpha");
  assert.equal(tagOf("1.5.0-beta.1"), "beta");
  assert.equal(tagOf("1.5.0-rc.1"), "rc");
  assert.match(src, /npm", \["publish", "--tag", tag/, "the tag goes to npm publish explicitly, so it wins over publishConfig");
});
