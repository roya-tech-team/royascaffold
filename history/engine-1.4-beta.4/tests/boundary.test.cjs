"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");
const { findProject, listMarkdown } = require("../lib/project.cjs");

const ENGINE = path.join(__dirname, "..");
const BIN = path.join(ENGINE, "bin", "royascaff.cjs");

function write(root, rel, content = "# x\n") {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
const tmp = (label) => fs.mkdtempSync(path.join(os.tmpdir(), `rs-${label}-`));

test("1.4 layout: only project/ is scanned; apps/, engine copies and dot-folders are not", () => {
  const repo = tmp("layout");
  write(repo, "project/profile.md");
  write(repo, "project/knowledge/02-requirements/requirements.md", "### REQ-A-001 · T\n");
  write(repo, "project/.cache/index.md");
  write(repo, "project/.backups/TASK-A-001/x.md");
  write(repo, "project/vendor-engine/engine.json", "{}");
  write(repo, "project/vendor-engine/examples.md", "### REQ-EX-001 · Example\n");
  write(repo, "apps/web/README.md", "### REQ-APP-001 · Should not be read\n");
  const project = findProject(repo);
  assert.equal(project.layout, "project-folder");
  assert.deepEqual(listMarkdown(project).map((f) => f.rel), ["knowledge/02-requirements/requirements.md", "profile.md"]);
});

test("legacy 1.3 root layout: only knowledge zones and root files; engine/, src/, .cursor/ skipped", () => {
  const repo = tmp("legacy");
  write(repo, "profile.md");
  write(repo, "system-map.md");
  write(repo, "knowledge/01-business/brd.md");
  write(repo, "changes/active/CHG-A-001/change.md");
  write(repo, "engine/flow.md");
  write(repo, "engine/templates/t.md");
  write(repo, "src/notes.md");
  write(repo, ".cursor/skills/x/SKILL.md");
  const project = findProject(repo);
  assert.equal(project.layout, "legacy-root");
  assert.deepEqual(listMarkdown(project).map((f) => f.rel).sort(), [
    "changes/active/CHG-A-001/change.md",
    "knowledge/01-business/brd.md",
    "profile.md",
    "system-map.md",
  ]);
});

test("no project found gives a clear error and exit code 1", () => {
  const empty = tmp("empty");
  const r = spawnSync(process.execPath, [BIN, "roundtrip", empty], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No RoyaScaff project found/);
});

test("unknown command exits with code 2", () => {
  const r = spawnSync(process.execPath, [BIN, "fly"], { encoding: "utf8" });
  assert.equal(r.status, 2);
});

test("the CLI runs when copied into an ESM project (the 1.3.1 ENG-INT-001 defect)", () => {
  const host = tmp("esm");
  fs.writeFileSync(path.join(host, "package.json"), JSON.stringify({ name: "host", type: "module" }));
  fs.cpSync(path.join(ENGINE, "bin"), path.join(host, "tools", "bin"), { recursive: true });
  fs.cpSync(path.join(ENGINE, "lib"), path.join(host, "tools", "lib"), { recursive: true });
  write(host, "project/knowledge/r.md", "### REQ-A-001 · T\n\n- **Kind:** requirement\n");
  const out = execFileSync(process.execPath, [path.join(host, "tools", "bin", "royascaff.cjs"), "roundtrip", host], { encoding: "utf8", cwd: host });
  assert.match(out, /Round trip PASS/);
});
