"use strict";

// Step 10: templates, `new record`, readability checks.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { listTemplates, docText, insertRecord, PLACEHOLDERS, DIR, RECORD_KINDS } = require("../lib/templates.cjs");
const { parseMarkdown } = require("../lib/parse/markdown.cjs");
const { headerCard } = require("../lib/context.cjs");
const { initProject } = require("../lib/commands/setup.cjs");
const { newRecord, newFeature } = require("../lib/commands/plan.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");

const VARS = { CODE: "EXM", OWNER: "team", NAME: "Example", APPS: "" };
const fresh = () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-tpl-"));
  initProject(repo, { name: "Example", code: "EXM", owner: "team" });
  return repo;
};
const examples = (name) => {
  const text = docText(name, VARS);
  const section = text.split("## Record format")[1] || "";
  return [...section.matchAll(/```md\n([\s\S]*?)```/g)].map((m) => m[1]);
};

test("templates: only known placeholders, a title and a header card, examples never parsed as records", () => {
  const names = listTemplates();
  assert.deepEqual(names, ["architecture", "brd", "change", "components", "contracts", "coverage", "data", "decisions", "discovery", "domain", "experience", "nfr", "operations", "plan", "profile", "quality", "questions", "releases", "request", "requirements", "roadmap", "rules", "security", "tests"]);
  for (const name of names) {
    const raw = fs.readFileSync(path.join(DIR, `${name}.md`), "utf8");
    const unknown = [...raw.matchAll(/\{\{([A-Z]+)\}\}/g)].map((m) => m[1]).filter((p) => !PLACEHOLDERS.includes(p));
    assert.deepEqual(unknown, [], `${name}: unknown placeholders`);
    if (name === "plan") continue;
    const text = docText(name, { ...VARS, ID: "CHG-EXM-001", KIND: "feature", SCOPE: "", RISK: "low", TITLE: "T", WHAT: "w" });
    assert.match(text, /^# .+$/m, `${name}: title`);
    assert.ok(headerCard(text), `${name}: header card`);
    assert.match(headerCard(text), /> \*\*What:\*\*/);
    if (!["change", "profile"].includes(name)) assert.equal(parseMarkdown(text).segments.filter((s) => s.type === "record").length, 0, `${name}: the example is fenced`);
  }
});

test("every template example is valid: together they form a project with zero issues", () => {
  const repo = fresh();
  const homes = { roadmap: "knowledge/00-roadmap/roadmap.md", brd: "knowledge/01-business/brd.md", requirements: "knowledge/02-requirements/requirements.md", nfr: "knowledge/02-requirements/nfr.md", domain: "knowledge/03-domain/domain.md", decisions: "knowledge/04-design/decisions.md", contracts: "knowledge/04-design/contracts.md", components: "knowledge/05-implementation/components.md", tests: "knowledge/05-implementation/tests.md" };
  for (const [name, rel] of Object.entries(homes)) {
    const file = path.join(repo, "project", rel);
    const base = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : docText(name, VARS);
    const blocks = examples(name);
    assert.ok(blocks.length > 0, `${name} has an example`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, blocks.reduce((t, b) => insertRecord(t, b), base));
  }
  const m = buildModel(repo);
  assert.deepEqual(m.issues, []);
  assert.ok(["OUT-EXM-001", "CAP-EXM-001", "SLC-EXM-001-A", "REQ-EXM-001", "NFR-EXM-001", "CON-EXM-001", "INV-EXM-001", "ADR-EXM-001", "CTR-EXM-001", "CMP-EXM-001", "TEST-EXM-001"].every((id) => m.records.has(id)));
  assert.ok(roundTrip(repo).ok);
});

test("new record: every kind gets the next ID, lands in its home file above the example, and validates", () => {
  const repo = fresh();
  for (const kind of Object.keys(RECORD_KINDS)) {
    const r = newRecord(repo, kind, `A ${kind}`);
    assert.match(r.id, new RegExp(`^${RECORD_KINDS[kind].prefix}-EXM-001$`), kind);
    const text = fs.readFileSync(path.join(repo, "project", r.file), "utf8");
    assert.ok(text.indexOf(`### ${r.id} · A ${kind}`) < text.indexOf("## Record format"), `${kind} goes above the example`);
  }
  assert.equal(newRecord(repo, "req", "Second requirement", { priority: "must" }).id, "REQ-EXM-002");
  assert.throws(() => newRecord(repo, "requirement", "Broken", { feature: "CAP-EXM-404" }), /CAP-EXM-404 does not exist/);
  assert.throws(() => newRecord(repo, "widget", "X"), /Usage: royascaff new record/);
  // Records created without their links are valid but flagged, so nothing stays an orphan silently.
  assert.deepEqual([...new Set(buildModel(repo).issues.map((i) => `${i.severity}:${i.code}`))].sort(), ["warning:component-without-code", "warning:requirement-without-feature", "warning:source-uncovered", "warning:test-without-verifies"]);
  const f = newFeature(repo, "Results", { horizon: "now" });
  const roadmap = fs.readFileSync(path.join(repo, "project/knowledge/00-roadmap/roadmap.md"), "utf8");
  assert.ok(roadmap.indexOf(`## ${f.id} · Results`) < roadmap.indexOf("## Record format"), "features go above the example");
  assert.ok(roundTrip(repo).ok);
});

test("readability checks: header card, file length, business language (1.4 projects only)", () => {
  const repo = fresh();
  const w = (rel, text) => fs.writeFileSync(path.join(repo, "project", rel), text);
  w("knowledge/notes.md", "# Notes\n\nNo card here.\n");
  w("knowledge/big.md", `# Big\n\n> **What:** x\n> **Read when:** y\n\n${"line\n".repeat(320)}`);
  const brd = path.join(repo, "project/knowledge/01-business/brd.md");
  fs.writeFileSync(brd, fs.readFileSync(brd, "utf8").replace("_Two or three sentences: who struggles with what today._", "Clients call the endpoint and the database is slow. Use `json` exports."));
  const codes = buildModel(repo).issues.map((i) => `${i.code}:${i.where}`).sort();
  assert.deepEqual(codes, ["large-file:knowledge/big.md", "missing-header-card:knowledge/notes.md", "technical-words-in-business:knowledge/01-business/brd.md"]);
  assert.match(buildModel(repo).issues.find((i) => i.code === "technical-words-in-business").message, /\(endpoint, database\)/);
  assert.deepEqual(buildModel(path.join(__dirname, "fixtures", "kuni-1.3")).issues.filter((i) => ["missing-header-card", "large-file"].includes(i.code)), [], "1.3 projects are not judged by 1.4 readability rules");
});

test("changes opened by the CLI come from the change template", () => {
  const work = require("../lib/commands/work.cjs");
  const repo = fresh();
  newRecord(repo, "requirement", "Client sees results");
  const opened = work.openOther(repo, "Typo on results", { kind: "polish", affects: "REQ-EXM-001", by: "islam" });
  const text = fs.readFileSync(path.join(repo, "project/changes", opened.id, "change.md"), "utf8");
  assert.match(text, /^---\nchange_id: CHG-EXM-001\nkind: polish\naffects: \[REQ-EXM-001\]\nstatus: draft\nrisk: low\n/);
  assert.match(text, /> \*\*What:\*\* a polish change affecting REQ-EXM-001/);
  assert.match(text, /\| Business \/ requirements \| \? \| \| \|/);
});
