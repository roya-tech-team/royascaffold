"use strict";

// Step 12b exit test (plan file 11 §5): the full 1.4 route through the real CLI, in a git repository,
// for a web-ui project. Every gate of 12b is met the way a real session meets it.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync, execFileSync } = require("child_process");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");

test("walkthrough in git: init → discover → approve project → plan → approve roadmap → five stages → a person looks → ✅ Done", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-walk-"));
  const env = { ...process.env, ROYASCAFF_USER: "islam", ROYASCAFF_USAGE: "off", GIT_AUTHOR_NAME: "Islam", GIT_AUTHOR_EMAIL: "i@example.com", GIT_COMMITTER_NAME: "Islam", GIT_COMMITTER_EMAIL: "i@example.com" };
  delete env.NODE_TEST_CONTEXT; // the project's own `node --test` must report its real exit code
  const run = (...args) => {
    const r = spawnSync(process.execPath, [BIN, ...args, "--path", repo], { encoding: "utf8", env });
    if (r.status !== 0) throw new Error(`royascaff ${args.join(" ")} failed:\n${r.stdout}${r.stderr}`);
    return r.stdout;
  };
  const refused = (...args) => {
    const r = spawnSync(process.execPath, [BIN, ...args, "--path", repo], { encoding: "utf8", env });
    assert.notEqual(r.status, 0, `royascaff ${args.join(" ")} should refuse`);
    return `${r.stdout}${r.stderr}`;
  };
  const git = (...a) => execFileSync("git", ["-C", repo, ...a], { encoding: "utf8", env }).trim();
  const commit = (msg) => { git("add", "-A"); git("commit", "-q", "-m", msg); };
  const p = (rel) => path.join(repo, "project", rel);
  const edit = (rel, fn) => fs.writeFileSync(p(rel), fn(fs.readFileSync(p(rel), "utf8")));
  const AI = ["--by", "ai:claude"];

  git("init", "-q");
  run("init", "--name", "Knowledge Universe", "--code", "KUNI", "--app", "web=apps/web", "--adapter", "web-ui");
  edit("profile.md", (t) => t.replace("- **Build:**", "- **Build:** node -e 0").replace("- **Typecheck:**", "- **Typecheck:** node -e 0").replace("- **Lint:**", "- **Lint:** node -e 0").replace("- **Test:**", "- **Test:** node --test"));
  const smoke = run("smoke", "init");
  assert.match(smoke, /APP-KUNI-WEB now has - \*\*Smoke:\*\* node scripts\/royascaff-smoke\.mjs/);
  assert.ok(fs.existsSync(path.join(repo, "apps/web/scripts/royascaff-smoke.mjs")));
  // No browser in this test: a stand-in smoke command writes one screenshot where the runner says.
  fs.writeFileSync(path.join(repo, "apps/web/scripts/fake-smoke.cjs"), "const fs = require('fs');\nfs.mkdirSync(process.env.ROYASCAFF_SHOTS, { recursive: true });\nfs.writeFileSync(require('path').join(process.env.ROYASCAFF_SHOTS, 'view-1440x900.png'), 'png');\n");
  edit("profile.md", (t) => t.replace("- **Smoke:** node scripts/royascaff-smoke.mjs", "- **Smoke:** node scripts/fake-smoke.cjs"));
  commit("chore: royascaff init");

  // 1. Discover with the person.
  assert.match(run("next"), /Discover the project/);
  const topics = ["Explorers who browse knowledge; the owner who judges it.", "Flat diagrams hide structure.", "A visual proof with sample data; no accounts.", "The owner says it feels like a product.", "Desktop first.",
    "- **Option A:** React + React Three Fiber\n- **Option B:** Vue + TresJS\n\n**Recommendation:** Option A.", "About 150 sample items.", "Dark, calm, cinematic; the reference image is inspiration only.\n\n**Visual bar:**\n- Opens straight into the network, full screen\n- Almost black background with subtle stars\n- Nodes glow softly; bloom never hides labels\n- Every control visibly does something\n- Nothing looks like a flat default diagram"];
  let i = 0;
  edit("knowledge/00-discovery/discovery.md", (t) => t.replace(/(## \d\. [^\n]+\n\n)_[^\n]*_/g, (m, h) => (i < 8 ? `${h}${topics[i++]}` : m)));
  edit("knowledge/00-discovery/request.md", (t) => t.replace("_Paste the full request here, word for word._", "Build a beautiful full-screen network.\n\n- The application opens into the 3D network\n- Do not implement search"));
  run("new", "record", "source", "Opens into the network", "--quote", "opens into the 3D network", ...AI);
  run("new", "record", "source", "No search yet", "--quote", "Do not implement search", ...AI);
  assert.match(refused("new", "record", "source", "Invented", "--quote", "a timeline of events", ...AI), /not in the request/);
  run("new", "record", "question", "Which option do you choose?", "--topic", "technology", ...AI);
  run("new", "record", "assumption", "Desktop browsers only", "--topic", "constraints", "--basis", "desktop is the priority", ...AI);
  assert.match(run("next"), /Ask the person 1 open question/);
  edit("knowledge/00-discovery/discovery.md", (t) => t.replace("- **Answer:**\n", "- **Answer:** Option A\n").replace("- **Source:**\n", "- **Source:** chat 2026-09-30\n"));
  run("new", "record", "decision", "React + React Three Fiber", "--scope", "project", ...AI);
  edit("knowledge/04-design/architecture.md", (t) => t.replace(/(## 1\. Context\n\n)_[^\n]*_/, "$1The explorer uses the web app (APP-KUNI-WEB); there is no server."));
  run("new", "record", "outcome", "The owner can judge the universe on first sight", ...AI);
  assert.match(run("next"), /royascaff approve project/);
  assert.match(refused("approve", "project", "--by", "ai:claude"), /must come from a person/);
  run("approve", "project");

  // 2. Plan a feature and have it approved.
  run("new", "feature", "Explore the network", "--horizon", "now", "--outcome", "OUT-KUNI-001", "--priority", "must", ...AI);
  run("new", "record", "requirement", "Open into a full-screen network", "--feature", "CAP-KUNI-001", "--priority", "must", ...AI);
  run("new", "record", "component", "Graph scene", "--code", "apps/web/src/scene/**", "--realizes", "REQ-KUNI-001", ...AI);
  run("new", "record", "nfr", "Dark cinematic look with a soft glow", "--feature", "CAP-KUNI-001", "--priority", "must", ...AI);
  run("new", "record", "test", "Scene mounts full screen", "--verifies", "REQ-KUNI-001", "--check", "runner:test", ...AI);
  run("new", "record", "test", "Scene uses the dark theme", "--verifies", "NFR-KUNI-001", "--check", "runner:test", ...AI);
  run("new", "slice", "CAP-KUNI-001", "Full-screen network", "--delivers", "REQ-KUNI-001", ...AI);
  // A Next feature: planned and approved now, built only after the Now feature is done and accepted.
  run("new", "feature", "Node details", "--horizon", "next", "--outcome", "OUT-KUNI-001", "--priority", "should", ...AI);
  run("new", "record", "requirement", "See a node's details on click", "--feature", "CAP-KUNI-002", "--priority", "should", ...AI);
  run("new", "slice", "CAP-KUNI-002", "Details panel", "--delivers", "REQ-KUNI-002", ...AI);
  assert.match(refused("open", "SLC-KUNI-001-A", ...AI), /has no approved plan/);
  const notYet = refused("approve", "roadmap");
  assert.match(notYet, /2 demand\(s\) of the request are neither covered nor out of scope/);
  assert.match(notYet, /NFR-KUNI-001 \(must\) is in no slice/);
  edit("knowledge/00-roadmap/roadmap.md", (t) => t.replace(/(\| SLC-KUNI-001-A \|[^\n]*?)REQ-KUNI-001 \|/, "$1REQ-KUNI-001, NFR-KUNI-001 |"));
  edit("knowledge/00-discovery/coverage.md", (t) => t.replace("- **Covered by:**\n", "- **Covered by:** REQ-KUNI-001\n").replace("- **Covered by:**\n", "- **Out of scope:** the brief says search is not built yet\n"));
  assert.match(run("approve", "roadmap"), /Out of scope \(you confirm these are not built\):\n  - SRC-KUNI-002 · No search yet/);
  commit("KUNI: discovery and plan approved");

  // 3. Understand · Design (a person approves, medium risk) · Plan.
  run("open", "SLC-KUNI-001-A", ...AI);
  assert.match(refused("open", "SLC-KUNI-002-A", ...AI), /waits for the Now features: CAP-KUNI-001 not done yet/);
  edit("changes/CHG-KUNI-001/change.md", (t) => t.replace(/\| \? \|/g, "| referenced |").replace("| Components / code / tests | referenced | |", "| Components / code / tests | changed | CMP-KUNI-001 |").replace(/_What will be true for the user[^\n]*_/, "The explorer opens the app into a full-screen network.").replace(/_How the system will look after this change[^\n]*_/, "CMP-KUNI-001 renders the network full screen (ADR-KUNI-001)."));
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "approved", ...AI), /a person must approve the design/);
  run("approve", "CHG-KUNI-001");
  run("advance", "CHG-KUNI-001", "--to", "approved", ...AI);
  run("new", "task", "CHG-KUNI-001", "Acceptance tests", "--goal", "tests for REQ-KUNI-001 and NFR-KUNI-001 that fail before the scene exists", "--inputs", "REQ-KUNI-001,NFR-KUNI-001,TEST-KUNI-001,TEST-KUNI-002", "--paths", "apps/web/src/scene/**", "--checks", "test", "--done", "the tests fail for the missing scene", ...AI);
  run("new", "task", "CHG-KUNI-001", "Full-screen scene", "--goal", "the network fills the screen", "--inputs", "REQ-KUNI-001,CMP-KUNI-001", "--paths", "apps/web/src/scene/**", "--checks", "typecheck,test", "--done", "scene mounts full screen", ...AI);
  run("advance", "CHG-KUNI-001", "--to", "ready", ...AI);
  commit("CHG-KUNI-001: understand, design, plan");

  // 4. Build: tests first (red), then the code; code and knowledge committed together.
  fs.mkdirSync(path.join(repo, "apps/web/src/scene"), { recursive: true });
  run("task", "TASK-KUNI-001", "start", ...AI);
  fs.writeFileSync(path.join(repo, "apps/web/src/scene/Scene.test.cjs"), "const test = require('node:test');\nconst assert = require('node:assert');\ntest('the scene mounts full screen', () => assert.equal(require('./Scene.cjs').mode, 'full screen'));\ntest('the scene uses the dark theme', () => assert.equal(require('./Scene.cjs').theme.background, '#05060a'));\n");
  commit("TASK-KUNI-001: acceptance tests");
  run("task", "TASK-KUNI-001", "done", "acceptance tests for REQ-KUNI-001", ...AI);
  assert.match(run("check", "CHG-KUNI-001", "--red", ...AI), /Red: the tests fail before the work/);
  run("task", "TASK-KUNI-002", "start", ...AI);
  fs.writeFileSync(path.join(repo, "apps/web/src/scene/Scene.cjs"), "exports.mode = 'full screen';\nexports.theme = { background: '#05060a', glow: 0.6 };\n");
  assert.match(refused("task", "TASK-KUNI-002", "done", "scene mounts", ...AI), /commit its work and its knowledge first/);
  commit("TASK-KUNI-002: full-screen scene");
  assert.match(refused("check", "CHG-KUNI-001", "--red", ...AI), /Tests already pass/);
  run("task", "TASK-KUNI-002", "done", "scene mounts full screen; labels come later", ...AI);

  // 5. Check & Record: runner, the person's look, quality strategy, commit, close.
  assert.match(run("check", "CHG-KUNI-001", ...AI), /Screenshots \(1\)/);
  assert.match(fs.readFileSync(p("changes/CHG-KUNI-001/evidence/checks.md"), "utf8"), /- \*\*Screenshots:\*\* shots\/EVD-KUNI-\d+\/view-1440x900\.png/);
  assert.match(run("next"), /Waiting for a person: a person opens the app/);
  const noBar = refused("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked at it on a 27-inch screen");
  assert.match(noBar, /--bar all[\s\S]*5\. Nothing looks like a flat default diagram[\s\S]*Latest screenshots:\n  project\/changes\/CHG-KUNI-001\/evidence\/shots\/EVD-KUNI-\d+\/view-1440x900\.png/);
  assert.match(run("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked at it on a 27-inch screen", "--bar", "1,2,3,4"), /pass with gaps 5: looked at it on a 27-inch screen · bar: 4 of 5/);
  run("advance", "CHG-KUNI-001", "--to", "verified", ...AI);
  run("new", "doc", "quality");
  edit("knowledge/06-quality/quality.md", (t) => t.replace(/(## 2\. Checks and who runs them\n\n)_[^\n]*_/, "$1Runner on every task; the owner looks at every UI change."));
  run("advance", "CHG-KUNI-001", "--to", "reconciled", ...AI);
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "closed", ...AI), /Stopped at reconciled/);
  commit("CHG-KUNI-001: record");
  assert.match(run("advance", "CHG-KUNI-001", "--to", "closed", ...AI), /CHG-KUNI-001 is now closed/);

  let board = fs.readFileSync(p("STATUS.md"), "utf8");
  assert.match(board, /\| Now \| CAP-KUNI-001 · Explore the network \| ✅ Done \|[^\n]*⚠ visual bar gaps: 5 \(CHG-KUNI-001\)/);
  assert.match(board, /project approved by islam/);
  assert.match(board, /- Brief: 1 of 2 demand\(s\) covered · 1 out of scope/);
  // The person looks again after a fix outside this walkthrough: the whole bar passes.
  run("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked again after the glow tweak", "--bar", "all");
  board = fs.readFileSync(p("STATUS.md"), "utf8");
  assert.doesNotMatch(board, /visual bar gaps/);
  commit("CHG-KUNI-001: the person's look");
  // The Now feature is done and accepted: the Next slice may open.
  assert.match(run("open", "SLC-KUNI-002-A", ...AI), /CHG-KUNI-002/);
  assert.match(run("validate"), /Validation PASS: .* 0 errors/);
});
