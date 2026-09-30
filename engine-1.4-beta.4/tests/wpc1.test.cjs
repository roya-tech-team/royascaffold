"use strict";

// Step 12c · WP-C1: brief coverage — the request kept word for word, every demand listed and covered.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { initProject } = require("../lib/commands/setup.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { approveProject } = require("../lib/commands/approve.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");
const { quoteFound, requestText, listItems } = require("../lib/coverage.cjs");

const ME = { by: "islam" };
const REQUEST = [
  "Build the FIRST VERSION of a beautiful 3D knowledge graph.",
  "",
  "Background:",
  "- Almost black / deep navy",
  "- Very subtle stars/particles",
  "",
  "Potential effects:",
  "- Bloom",
  "- Fog",
  "",
  "Do NOT overdo bloom.",
  "",
  "14. Reset View works.",
].join("\n");

function project() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-c1-"));
  initProject(repo, { name: "Knowledge Universe", code: "KUNI" });
  const f = path.join(repo, "project/knowledge/00-discovery/request.md");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("_Paste the full request here, word for word._", REQUEST));
  return repo;
}
const edit = (repo, rel, fn) => fs.writeFileSync(path.join(repo, "project", rel), fn(fs.readFileSync(path.join(repo, "project", rel), "utf8")));

test("quotes: whitespace, case and emphasis do not matter; … joins parts that appear in order", () => {
  assert.ok(quoteFound(REQUEST, "do not overdo   BLOOM"));
  assert.ok(quoteFound(REQUEST, "Potential effects: … Bloom … Do NOT overdo bloom."));
  assert.ok(!quoteFound(REQUEST, "Do NOT overdo bloom … Potential effects"), "parts must be in order");
  assert.ok(!quoteFound(REQUEST, "a timeline of events"));
  assert.ok(!quoteFound(REQUEST, ""));
  assert.equal(requestText("---\nx: y\n---\n\n# R\n\n## Request\n\n_hint_\nHello\n"), "Hello");
  assert.deepEqual(listItems(REQUEST), ["Almost black / deep navy", "Very subtle stars/particles", "Bloom", "Fog", "Reset View works."]);
});

test("a quote that is not in the request is an error; an uncovered demand is a warning", () => {
  const repo = project();
  const ok = newRecord(repo, "source", "Subtle bloom", { quote: "Do NOT overdo bloom." });
  assert.throws(() => newRecord(repo, "source", "Timeline", { quote: "a timeline of events" }), /quotes words that are not in the request/);
  const issues = buildModel(repo).issues.filter((i) => /^source-/.test(i.code)).map((i) => `${i.severity}:${i.code}:${i.message.split(" ")[0]}`);
  assert.deepEqual(issues, [`warning:source-uncovered:${ok.id}`]);
});

test("approve project lists the request's items no demand quotes, and the board counts coverage", () => {
  const repo = project();
  const fill = ["Explorers.", "Flat diagrams.", "A visual proof.", "The owner judges.", "Desktop.", "- **Option A:** React\n- **Option B:** Vue\n\n**Recommendation:** Option A.", "Sample data.", "Dark and calm."];
  let i = 0;
  edit(repo, "knowledge/00-discovery/discovery.md", (t) => t.replace(/(## \d\. [^\n]+\n\n)_[^\n]*_/g, (m, h) => (i < 8 ? `${h}${fill[i++]}` : m)));
  newRecord(repo, "decision", "React", { scope: "project" });
  edit(repo, "knowledge/04-design/architecture.md", (t) => t.replace(/(## 1\. Context\n\n)_[^\n]*_/, "$1One web app."));
  assert.throws(() => approveProject(repo, ME), /list each concrete demand of the request/);
  newRecord(repo, "source", "Subtle bloom", { quote: "Bloom … Do NOT overdo bloom." });
  newRecord(repo, "source", "Reset View", { quote: "Reset View works" });
  const r = approveProject(repo, ME);
  assert.deepEqual(r.unquoted, ["Almost black / deep navy", "Very subtle stars/particles", "Fog"]);
  assert.match(indexCommand(repo).board, /- Brief: 0 of 2 demand\(s\) covered · 0 delivered · 0 out of scope · ⚠ 2 not covered yet · 3 list item\(s\) of the request not quoted/);
  // The request is part of what the person approved: editing it makes the approval stale.
  edit(repo, "knowledge/00-discovery/request.md", (t) => `${t}\n## Change 2026-10-01\n\nAlso a timeline.\n`);
  assert.equal(buildModel(repo).approvals.project.state, "stale");
});
