"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { exportProject, renderExport, roundTrip } = require("../lib/io/exchange.cjs");
const { findProject, listMarkdown } = require("../lib/project.cjs");

const FIXTURES = path.join(__dirname, "fixtures");
const fixtures = fs.readdirSync(FIXTURES).filter((d) => fs.statSync(path.join(FIXTURES, d)).isDirectory());

test("all six fixtures are present", () => {
  assert.deepEqual(fixtures.sort(), ["demo-1.2", "greenfield", "kuni-1.2", "kuni-1.3", "kuni-1.3.1", "pollpulse-1.3"]);
});

for (const name of fixtures) {
  const root = path.join(FIXTURES, name);

  test(`${name}: Markdown -> JSON -> Markdown is byte-identical`, () => {
    const result = roundTrip(root);
    assert.deepEqual(result.mismatches, []);
    assert.ok(result.ok);
  });

  test(`${name}: export -> render to a new folder reproduces every file`, () => {
    const data = JSON.parse(JSON.stringify(exportProject(root)));
    const out = fs.mkdtempSync(path.join(os.tmpdir(), `rs-${name}-`));
    renderExport(data, out);
    const project = findProject(root);
    for (const { full, rel } of listMarkdown(project)) {
      assert.equal(fs.readFileSync(path.join(out, rel), "utf8"), fs.readFileSync(full, "utf8"), rel);
    }
    fs.rmSync(out, { recursive: true, force: true });
  });
}

test("1.3 fixtures expose their records; 1.2 fixtures are kept verbatim as text", () => {
  assert.ok(exportProject(path.join(FIXTURES, "kuni-1.3")).records.length > 100);
  assert.ok(exportProject(path.join(FIXTURES, "pollpulse-1.3")).records.length > 100);
  assert.equal(exportProject(path.join(FIXTURES, "kuni-1.2")).records.length, 0);
});
