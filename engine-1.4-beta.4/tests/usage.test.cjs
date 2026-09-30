"use strict";

// Step 11: local usage counters and feedback.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { buildModel } = require("../lib/model/graph.cjs");
const { stageDurations, readUsage } = require("../lib/usage.cjs");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const copy = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-usage-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  return root;
};
const run = (root, args, env = {}) => spawnSync(process.execPath, [BIN, ...args, "--path", root], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "on", ROYASCAFF_USER: "islam", ...env } });
const usageFile = (root) => path.join(root, "project/.usage/usage.jsonl");

test("every command adds one local line: command shape only, never notes or titles", () => {
  const root = copy();
  run(root, ["status"]);
  run(root, ["task", "TASK-CAMP-004", "done", "SECRET-HANDOFF posts on their day"]);
  const r = run(root, ["advance", "CHG-CAMP-002", "--to", "verified"]);
  assert.equal(r.status, 1);
  run(root, ["show", "CAP-404"]);
  const entries = readUsage(path.join(root, "project"));
  assert.deepEqual(entries.map((e) => [e.cmd, e.sub || null, e.result]), [["status", null, "ok"], ["task", "done", "ok"], ["advance", null, "refused"], ["show", null, "error"]]);
  assert.deepEqual(entries[2].failed_checks, ["checks", "evidence"]);
  assert.ok(entries.every((e) => typeof e.ms === "number"));
  const raw = fs.readFileSync(usageFile(root), "utf8");
  assert.doesNotMatch(raw, /SECRET-HANDOFF|posts on their day|Schedule posts/);
  assert.match(fs.readFileSync(path.join(root, "project/.usage/.gitignore"), "utf8"), /^\*$/m);
});

test("counters can be switched off by environment or profile", () => {
  const a = copy();
  run(a, ["status"], { ROYASCAFF_USAGE: "off" });
  assert.equal(fs.existsSync(usageFile(a)), false);
  const b = copy();
  const profile = path.join(b, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("project_code: CAMP", "project_code: CAMP\nusage_counters: off"));
  run(b, ["status"]);
  assert.equal(fs.existsSync(usageFile(b)), false);
});

test("time in each status comes from the change logs", () => {
  const d = stageDurations(buildModel(path.join(__dirname, "fixtures", "greenfield")));
  assert.deepEqual(d.stages.draft, { changes: 1, median_hours: 0.5, max_hours: 0.5 });
  assert.deepEqual(d.stages.ready, { changes: 1, median_hours: 3.8, max_hours: 3.8 });
  assert.deepEqual(d.open.map((o) => [o.change, o.status]), [["CHG-CAMP-002", "draft"], ["CHG-CAMP-003", "draft"]]);
});

test("feedback writes a report to review; usage shows what is counted; nothing is sent", () => {
  const root = copy();
  run(root, ["status"]);
  run(root, ["advance", "CHG-CAMP-002", "--to", "verified"]);
  const bad = run(root, ["feedback", "x", "--kind", "rant"]);
  assert.equal(bad.status, 1);
  const r = run(root, ["feedback", "The approval step confused my team", "--kind", "confusing", "--json"]);
  assert.equal(r.status, 0);
  const { file } = JSON.parse(r.stdout);
  assert.match(file, /^project\/\.usage\/feedback-\d{8}T\d{6}Z-confusing\.md$/);
  const text = fs.readFileSync(path.join(root, file), "utf8");
  assert.match(text, /^# RoyaScaff feedback · confusing/);
  assert.match(text, /The approval step confused my team/);
  assert.match(text, /RoyaScaff 1\.4\.0-beta\.\d+ · Node v\d+/);
  assert.match(text, /\| draft \| 1 \| 0\.5 \| 0\.5 \|/);
  assert.match(text, /- advance: 1 runs, 1 refused/);
  assert.match(text, /- checks: 1\n- evidence: 1/);
  assert.match(text, /### Brief · Campaign Planner/);
  const u = JSON.parse(run(root, ["usage", "--json"]).stdout);
  assert.equal(u.enabled, true);
  assert.equal(u.usage.runs, 2, "status and advance; feedback and usage are never counted");
});
