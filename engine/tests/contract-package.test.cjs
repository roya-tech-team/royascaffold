"use strict";

// Contract v1, work package E0.5: the package ships the contract, and docs/CONTRACT.md covers it.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const contract = require("../lib/contract.cjs");

const ROOT = path.join(__dirname, "..");
const pkg = require("../package.json");

test("npm pack --dry-run includes contract/ (errors, the envelope schema and one schema per command) and docs/CONTRACT.md", () => {
  const r = spawnSync("npm pack --dry-run --json --ignore-scripts", { cwd: ROOT, encoding: "utf8", shell: true });
  assert.equal(r.status, 0, r.stderr);
  // npm 10 prints an array, newer npm an object keyed by package name.
  const parsed = JSON.parse(r.stdout);
  const info = Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0];
  const files = info.files.map((f) => f.path.replace(/\\/g, "/"));
  for (const f of ["contract/errors.json", "contract/schemas/envelope.schema.json", "docs/CONTRACT.md", "bin/royascaff.cjs", "lib/contract.cjs"]) assert.ok(files.includes(f), `${f} is in the package`);
  for (const c of contract.COMMANDS) assert.ok(files.includes(`contract/schemas/${c}.schema.json`), `contract/schemas/${c}.schema.json is in the package`);
  assert.equal(files.some((f) => f.startsWith("tests/")), false, "tests are not published");
});

test("docs/CONTRACT.md names every error code and every command, and states the versioning rule", () => {
  const doc = fs.readFileSync(path.join(ROOT, "docs", "CONTRACT.md"), "utf8");
  for (const code of Object.keys(contract.ERRORS)) assert.ok(doc.includes(`\`${code}\``), `${code} is documented`);
  for (const c of contract.COMMANDS) assert.match(doc, new RegExp(`\\b${c}\\b`), `${c} is documented`);
  assert.match(doc, /minor/);
  assert.match(doc, /major/);
  assert.match(doc, /deprecation/);
  assert.match(doc, /ROYASCAFF_NONINTERACTIVE/);
});

test("the package is an alpha of 1.5 and its version is the engine version in every envelope", () => {
  assert.match(pkg.version, /^1\.5\.0-alpha\.\d+$/);
  assert.equal(contract.ENGINE_VERSION, pkg.version);
});
