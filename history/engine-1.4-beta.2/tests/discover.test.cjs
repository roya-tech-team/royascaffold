"use strict";

// Step 12b · WP1: the Discover stage and plan approvals (plan file 10 §4, file 11 WP1).
// Nothing is planned or built before a person has confirmed what and how.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { initProject } = require("../lib/commands/setup.cjs");
const { newFeature, newSlice, newRecord } = require("../lib/commands/plan.cjs");
const { approveProject, approveFeatures } = require("../lib/commands/approve.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { openSlice } = require("../lib/commands/work.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };

function fresh() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-discover-"));
  initProject(repo, { name: "Knowledge Universe", code: "KUNI", app: "web=apps/web" });
  return repo;
}
const file = (repo, rel) => path.join(repo, "project", rel);
const edit = (repo, rel, fn) => fs.writeFileSync(file(repo, rel), fn(fs.readFileSync(file(repo, rel), "utf8")));

function fillTopics(repo, { tech = true } = {}) {
  edit(repo, "knowledge/00-discovery/discovery.md", (t) => {
    let out = t;
    const bodies = ["Explorers and the owner.", "Flat diagrams hide depth.", "A visual proof; no accounts.", "The owner says it feels like a product.", "Desktop first.",
      tech ? "- **Option A:** React + React Three Fiber\n- **Option B:** Vue + TresJS\n\n**Recommendation:** Option A." : "React.", "Local sample data.", "Dark, calm, cinematic."];
    let i = 0;
    out = out.replace(/(## \d\. [^\n]+\n\n)_[^\n]*_/g, (m, head) => (i < 8 ? `${head}${bodies[i++]}` : m));
    return out;
  });
}

function readyProject(repo) {
  fillTopics(repo);
  newRecord(repo, "decision", "React + React Three Fiber", { scope: "project" });
  edit(repo, "knowledge/04-design/architecture.md", (t) => t.replace(/(## 1\. Context\n\n)_[^\n]*_/, "$1The explorer uses the web app; no server."));
}

test("a new project starts with discovery: 8 topics, then questions, then the person's approval", () => {
  const repo = fresh();
  let n = nextCommand(repo);
  assert.deepEqual([n.kind, n.card], ["discover", "discover.md"]);
  assert.match(n.text, /fill 8 empty topic/);
  fillTopics(repo, { tech: false });
  n = nextCommand(repo);
  assert.equal(n.kind, "discover");
  assert.match(n.text, /Technology topic needs at least two/);
  fillTopics(repo);
  edit(repo, "knowledge/00-discovery/discovery.md", (t) => t.replace("React.", "- **Option A:** React\n- **Option B:** Vue\n\n**Recommendation:** Option A."));
  const q = newRecord(repo, "question", "Who judges the visual quality?", { topic: "look" });
  assert.equal(q.file, "knowledge/00-discovery/discovery.md");
  newRecord(repo, "assumption", "Desktop browsers only", { topic: "constraints", basis: "the request says desktop first" });
  n = nextCommand(repo);
  assert.deepEqual([n.kind, n.human, n.questions], ["answer-questions", true, [q.id]]);
  assert.throws(() => approveProject(repo, ME), /answer 1 open question/);
  edit(repo, "knowledge/00-discovery/discovery.md", (t) => t.replace("- **Answer:**\n", "- **Answer:** the owner, on a desktop screen\n"));
  n = nextCommand(repo);
  assert.equal(n.kind, "discover");
  assert.match(n.text, /Scope:\*\* project/);
  newRecord(repo, "decision", "React", { scope: "project" });
  assert.match(nextCommand(repo).text, /describe the system/);
  edit(repo, "knowledge/04-design/architecture.md", (t) => t.replace(/(## 3\. Main parts\n\n)_[^\n]*_/, "$1The scene and the frame."));
  n = nextCommand(repo);
  assert.deepEqual([n.kind, n.human], ["approve-project", true]);
  assert.match(n.text, /Assumptions to confirm: ASM-KUNI-001 · Desktop browsers only/);
});

test("approve project: people only, refused with the reasons, stale after an edit", () => {
  const repo = fresh();
  assert.throws(() => approveProject(repo, ME), /fill the discovery topics[\s\S]*Scope:\*\* project[\s\S]*architecture/);
  readyProject(repo);
  assert.throws(() => approveProject(repo, AI), /must come from a person/);
  const r = approveProject(repo, ME);
  assert.equal(r.by, "islam");
  assert.match(fs.readFileSync(file(repo, "log.md"), "utf8"), /\| project\.approved \| project \| islam \| — \| hash [0-9a-f]{10} · 0 question\(s\) answered/);
  let m = buildModel(repo);
  assert.equal(m.approvals.project.state, "approved");
  assert.match(fs.readFileSync(file(repo, "STATUS.md"), "utf8"), /project approved by islam/);
  // An edit to the brief makes the approval stale; the architecture page is not part of the hash.
  edit(repo, "knowledge/04-design/architecture.md", (t) => `${t}\nMore detail.\n`);
  assert.equal(buildModel(repo).approvals.project.state, "approved");
  edit(repo, "knowledge/01-business/brd.md", (t) => t.replace("## Problem", "## Problem\n\nA new sentence."));
  m = buildModel(repo);
  assert.equal(m.approvals.project.state, "stale");
  const n = nextCommand(repo);
  assert.deepEqual([n.kind, n.human], ["approve-project", true]);
  assert.match(n.text, /changed since islam approved/);
});

test("feature plans: Outlined until a person approves; open refuses without approval; stale after an edit", () => {
  const repo = fresh();
  readyProject(repo);
  assert.throws(() => approveFeatures(repo, ["roadmap"], ME), /Approve the project first/);
  approveProject(repo, ME);
  const f = newFeature(repo, "Explore the network", { horizon: "now" });
  newRecord(repo, "requirement", "Open into a full-screen network", { feature: f.id, priority: "must" });
  const s = newSlice(repo, f.id, "Clustered network", { delivers: "REQ-KUNI-001" });
  let d = deriveStatus(buildModel(repo));
  assert.deepEqual([d.features.get(f.id).state, d.features.get(f.id).approval, d.requirements.get("REQ-KUNI-001").state], ["outlined", "none", "outlined"]);
  let n = nextCommand(repo);
  assert.deepEqual([n.kind, n.features], ["approve-roadmap", [f.id]]);
  assert.throws(() => openSlice(repo, s.id, AI), /has no approved plan/);
  const q = newRecord(repo, "question", "Numbers or percentages?", { feature: f.id });
  assert.equal(q.file, "knowledge/00-roadmap/questions.md");
  assert.equal(nextCommand(repo).kind, "answer-questions");
  assert.throws(() => approveFeatures(repo, ["roadmap"], ME), /open questions: QST-KUNI-001/);
  edit(repo, "knowledge/00-roadmap/questions.md", (t) => t.replace("- **Answer:**\n", "- **Answer:** numbers\n"));
  assert.throws(() => approveFeatures(repo, ["roadmap"], AI), /must come from a person/);
  const r = approveFeatures(repo, ["roadmap"], ME);
  assert.deepEqual(r.approved.map((x) => x.id), [f.id]);
  d = deriveStatus(buildModel(repo));
  assert.deepEqual([d.features.get(f.id).state, d.requirements.get("REQ-KUNI-001").state], ["planned", "planned"]);
  assert.equal(nextCommand(repo).kind, "open-slice");
  // Editing a requirement after approval makes the plan stale again.
  edit(repo, "knowledge/02-requirements/requirements.md", (t) => t.replace("- **Priority:** must", "- **Priority:** should"));
  d = deriveStatus(buildModel(repo));
  assert.deepEqual([d.features.get(f.id).approval, d.features.get(f.id).state], ["stale", "outlined"]);
  require("../lib/commands/views.cjs").indexCommand(repo);
  assert.match(fs.readFileSync(file(repo, "STATUS.md"), "utf8"), /\| 📝 Outlined \|[^\n]*⚠ plan changed since approval/);
  assert.throws(() => openSlice(repo, s.id, AI), /changed since its plan was approved/);
  approveFeatures(repo, [f.id], ME);
  assert.match(openSlice(repo, s.id, AI).id, /^CHG-KUNI-001$/);
});

test("approve roadmap needs requirements; a person may force open, the AI may not", () => {
  const repo = fresh();
  readyProject(repo);
  approveProject(repo, ME);
  const f = newFeature(repo, "Idea only", { horizon: "now" });
  assert.throws(() => approveFeatures(repo, [f.id], ME), /no requirements yet/);
  newRecord(repo, "requirement", "Something observable", { feature: f.id });
  const s = newSlice(repo, f.id, "First piece", { delivers: "REQ-KUNI-001" });
  assert.throws(() => openSlice(repo, s.id, { ...AI, force: true }), /has no approved plan/);
  assert.match(openSlice(repo, s.id, { ...ME, force: true }).id, /^CHG-KUNI-001$/);
});

test("1.3 projects (compatibility mode) are not asked for discovery or approvals", () => {
  const m = buildModel(path.join(__dirname, "fixtures", "kuni-1.3"));
  assert.equal(m.approvals, undefined);
  assert.notEqual(nextCommand(path.join(__dirname, "fixtures", "kuni-1.3")).kind, "discover");
});
