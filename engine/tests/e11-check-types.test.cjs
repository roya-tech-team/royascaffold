"use strict";

// E1.1: acceptance lines carry a check type, and validate warns about untyped must lines.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { acceptanceOf, judgeLines, TYPES } = require("../lib/acceptance.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { validateCommand } = require("../lib/commands/inspect.cjs");

const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e11-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const REQS = (root) => path.join(root, "project", "knowledge", "02-requirements", "requirements.md");

test("the five check types are unit, e2e, metric, manual and inspection", () => {
  assert.deepEqual(TYPES, ["unit", "e2e", "metric", "manual", "inspection"]);
});

test("acceptanceOf reads typed and untyped lines under **Acceptance** and stops at the next block", () => {
  const rec = { id: "REQ-X-001", title: "T", body: "\nText.\n\n**Acceptance**\n- [e2e] Saving with an empty title shows \"Title is required\".\n- [metric] `list_ms <= 200` with 500 books.\n- [Manual] The list reads well on a phone.\n- No type here.\n\nA closing paragraph.\n- [unit] not an acceptance line\n" };
  const lines = acceptanceOf(rec);
  assert.deepEqual(lines.map((l) => [l.key, l.type]), [["REQ-X-001#1", "e2e"], ["REQ-X-001#2", "metric"], ["REQ-X-001#3", "manual"], ["REQ-X-001#4", null]]);
  assert.equal(lines[0].text, "Saving with an empty title shows \"Title is required\".");
  assert.deepEqual(acceptanceOf({ id: "REQ-X-002", body: "No list here." }), []);
});

test("a requirement without acceptance lines still has one judgeable line: its title", () => {
  const lines = judgeLines({ id: "REQ-X-003", title: "Posts move", body: "" });
  assert.deepEqual(lines.map((l) => [l.key, l.text, l.type]), [["REQ-X-003#1", "Posts move", null]]);
});

test("validate warns for every untyped acceptance line of a must requirement, and for unknown types", () => {
  const root = copy();
  assert.deepEqual(validateCommand(root).issues.filter((i) => /acceptance|check-type/.test(i.code || "")), [], "the fixture is typed");
  const f = REQS(root);
  fs.writeFileSync(f, fs.readFileSync(f, "utf8")
    .replace("- [e2e] Saving without a name shows an inline error.", "- Saving without a name shows an inline error.")
    .replace("- [unit] The end date cannot be before the start date.", "- [smoke] The end date cannot be before the start date."));
  const issues = validateCommand(root).issues;
  const untyped = issues.filter((i) => i.code === "untyped-acceptance");
  assert.equal(untyped.length, 1);
  assert.match(untyped[0].message, /REQ-CAMP-001#1 \(must\) has no check type/);
  assert.equal(untyped[0].severity, "warning");
  assert.match(issues.find((i) => i.code === "unknown-check-type").message, /REQ-CAMP-001#2 has the check type \[smoke\]/);
  assert.equal(validateCommand(root).ok, true, "warnings never fail validate");
});

test("an untyped line of a should requirement is not a warning", () => {
  const root = copy();
  const f = REQS(root);
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("- **Priority:** should\n- **Owner:** product-owner\n- **Feature:** CAP-CAMP-002\n", "- **Priority:** should\n- **Owner:** product-owner\n- **Feature:** CAP-CAMP-002\n\nMove it.\n\n**Acceptance**\n- Dropping a post keeps it on the new day.\n"));
  const m = buildModel(root);
  assert.equal(acceptanceOf(m.records.get("REQ-CAMP-004")).length, 1);
  assert.equal(m.issues.filter((i) => i.code === "untyped-acceptance").length, 0);
});
