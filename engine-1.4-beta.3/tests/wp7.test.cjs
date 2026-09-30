"use strict";

// Step 12b · WP7: layer documents on demand, RULE-/REL- records, the brief, and `adopt`.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { initProject } = require("../lib/commands/setup.cjs");
const { newDoc, newRecord, DOCS } = require("../lib/commands/plan.cjs");
const { adoptCommand, moduleOf } = require("../lib/commands/adopt.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { headerCard } = require("../lib/context.cjs");

const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp7-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const put = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };

test("new doc: six layer documents from templates, each with a header card, never overwritten, zero issues", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp7-docs-"));
  initProject(repo, { name: "Knowledge Universe", code: "KUNI" });
  assert.deepEqual(Object.keys(DOCS).sort(), ["architecture", "data", "experience", "operations", "quality", "security"]);
  for (const kind of ["data", "experience", "security", "quality", "operations"]) {
    const r = newDoc(repo, kind);
    const text = fs.readFileSync(path.join(repo, "project", r.file), "utf8");
    assert.ok(headerCard(text), `${kind}: header card`);
    assert.throws(() => newDoc(repo, kind), /already exists/);
  }
  assert.match(fs.readFileSync(path.join(repo, "project/knowledge/04-design/experience.md"), "utf8"), /## 4\. Design tokens/);
  assert.deepEqual(buildModel(repo).issues, []);
});

test("the brief asks for scope, the core workflow and key words; outcomes stay last", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp7-brd-"));
  initProject(repo, { name: "K", code: "KKK" });
  const text = fs.readFileSync(path.join(repo, "project/knowledge/01-business/brd.md"), "utf8");
  const order = ["## Problem", "## Users", "## Scope and out of scope", "## Core workflow", "## Key words", "## Outcomes", "## Record format"].map((h) => text.indexOf(h));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.ok(order.every((i) => i > 0));
  const out = newRecord(repo, "outcome", "Clients see results");
  const after = fs.readFileSync(path.join(repo, "project/knowledge/01-business/brd.md"), "utf8");
  assert.ok(after.indexOf(`### ${out.id}`) > after.indexOf("## Outcomes"), "new outcomes land under Outcomes");
});

test("RULE- records link what they apply to; a REL- record makes its changes' features 🚀 Released", () => {
  const root = copy();
  const rule = newRecord(root, "rule", "Posts never move to a past day", { applies: "CMP-CAMP-CALENDAR" });
  assert.equal(rule.file, "knowledge/04-design/rules.md");
  const m = buildModel(root);
  assert.deepEqual(m.records.get(rule.id).relations.map((r) => [r.type, r.to]), [["applies_to", "CMP-CAMP-CALENDAR"]]);
  const rel = newRecord(root, "release", "1.0.0", { includes: "CHG-CAMP-001" });
  assert.equal(rel.file, "releases/releases.md");
  const d = deriveStatus(buildModel(root));
  assert.equal(d.features.get("CAP-CAMP-001").state, "released");
  assert.deepEqual(buildModel(root).issues.filter((i) => i.severity === "error"), []);
});

test("adopt lists the modules of each app with the share owned by components; next proposes the first unowned one", () => {
  assert.equal(moduleOf("apps/web", "apps/web/src/calendar/grid.ts"), "apps/web/src/calendar");
  assert.equal(moduleOf("apps/web", "apps/web/main.ts"), "apps/web (root files)");
  const root = copy();
  put(root, "apps/web/src/campaigns/form.ts", "export const form = 1;\n");
  put(root, "apps/web/src/calendar/grid.ts", "export const grid = 1;\n");
  put(root, "apps/web/src/legacy/old.ts", "export const old = 1;\n");
  put(root, "apps/web/src/legacy/older.ts", "export const older = 1;\n");
  const r = adoptCommand(root);
  const legacy = r.modules.find((m) => m.module === "apps/web/src/legacy");
  assert.deepEqual([legacy.files, legacy.owned, legacy.percent], [2, 0, 0]);
  assert.equal(r.next, "apps/web/src/legacy");
  assert.match(r.text, /Next: adopt apps\/web\/src\/legacy \(2 file\(s\) without a component\)/);
});

test("next proposes adoption when nothing else is waiting", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp7-adopt-"));
  put(repo, "legacy/src/billing/invoice.ts", "export const invoice = 1;\n");
  initProject(repo, { name: "Old App", code: "OLD", app: "web=legacy" });
  // Without discovery the project is not approved yet, so discovery comes first.
  assert.equal(nextCommand(repo).kind, "discover");
  const { adoption } = require("../lib/commands/adopt.cjs");
  assert.deepEqual(adoption(buildModel(repo)).modules.map((m) => [m.module, m.percent]), [["legacy/src/billing", 0]]);
});
