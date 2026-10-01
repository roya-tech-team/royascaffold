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
  const env = { ...process.env, ROYASCAFF_NO_TTY: "1", ROYASCAFF_USER: "islam", ROYASCAFF_USAGE: "off", GIT_AUTHOR_NAME: "Islam", GIT_AUTHOR_EMAIL: "i@example.com", GIT_COMMITTER_NAME: "Islam", GIT_COMMITTER_EMAIL: "i@example.com" };
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
  // A person's look is confirmed in a terminal (D9): run the CLI inside a pseudo-terminal and answer "yes".
  const look = (...args) => {
    const cmd = [process.execPath, BIN, ...args, "--path", repo].map((a) => `'${String(a).replace(/'/g, "'\\''")}'`).join(" ");
    // `script` gives the command a terminal. The answer is typed only after the prompt has appeared
    // (text typed ahead can be discarded by the terminal, as on macOS), and it reaches `script`
    // through a real pipe from sh (macOS `script` refuses Node's socket as stdin).
    const scriptCall = process.platform === "darwin" ? 'script -q /dev/null sh -c "$LOOK_CMD"' : 'script -qec "$LOOK_CMD" /dev/null';
    const shell = `out="$LOOK_OUT"; : > "$out"
( i=0; while ! grep -q "Type yes" "$out" 2>/dev/null && [ $i -lt 600 ]; do sleep 0.1; i=$((i+1)); done; echo yes ) | ${scriptCall} > "$out" 2>&1
status=$?; cat "$out"; exit $status`;
    const outFile = path.join(os.tmpdir(), `rs-look-${process.pid}-${Date.now()}.txt`);
    const r = spawnSync("sh", ["-c", shell], { encoding: "utf8", env: { ...env, ROYASCAFF_NO_TTY: "", LOOK_CMD: cmd, LOOK_OUT: outFile } });
    fs.rmSync(outFile, { force: true });
    if (r.status !== 0) throw new Error(`royascaff ${args.join(" ")} (in a terminal) failed:\n${r.stdout}${r.stderr}`);
    return r.stdout;
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
  edit("knowledge/04-design/architecture.md", (t) => t.replace(/(## 1\. Context\n\n)_[^\n]*_/, "$1The explorer uses the web app (APP-KUNI-WEB); there is no server.").replace(/(## 5\. Dependency rules\n\n)_[^\n]*_/, "$1- `apps/web/src/scene/**` must not import `apps/web/src/data/raw*`: the scene reads the prepared graph, never raw data."));
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
  // D10: every kind of knowledge is part of the flow — a domain rule, a project rule and an experience page.
  run("new", "record", "invariant", "Every node on screen belongs to the graph", "--feature", "REQ-KUNI-001", ...AI);
  run("new", "record", "rule", "Labels use the project font", "--applies", "CMP-KUNI-001", ...AI);
  run("new", "doc", "experience");
  edit("knowledge/04-design/experience.md", (t) => t.replace(/(## 4\. Design tokens\n\n)_[^\n]*_/, "$1| `color.bg` | `#05060a` | page and scene background |"));
  // A Next feature: planned and approved now, built only after the Now feature is done and accepted.
  run("new", "feature", "Node details", "--horizon", "next", "--outcome", "OUT-KUNI-001", "--priority", "should", ...AI);
  run("new", "record", "requirement", "See a node's details on click", "--feature", "CAP-KUNI-002", "--priority", "should", ...AI);
  run("new", "slice", "CAP-KUNI-002", "Details panel", "--delivers", "REQ-KUNI-002", ...AI);
  assert.match(refused("open", "SLC-KUNI-001-A", ...AI), /has no approved plan/);
  const notYet = refused("approve", "roadmap");
  assert.match(notYet, /2 demand\(s\) of the request are neither covered nor out of scope/);
  assert.match(notYet, /NFR-KUNI-001 \(must\) is in no slice/);
  edit("knowledge/00-roadmap/roadmap.md", (t) => t.replace(/(\| SLC-KUNI-001-A \|[^\n]*?)REQ-KUNI-001 \|/, "$1REQ-KUNI-001, NFR-KUNI-001 |"));
  edit("knowledge/00-discovery/coverage.md", (t) => t.replace(/^(\| SRC-[^|]+\|[^|]*\|[^|]*\|)\s*\|\s*\|$/m, "$1 REQ-KUNI-001 | |").replace(/^(\| SRC-[^|]+\|[^|]*\|[^|]*\|)\s*\|\s*\|$/m, "$1 | the brief says search is not built yet |"));
  assert.match(run("approve", "roadmap"), /Out of scope \(you confirm these are not built\):\n  - SRC-KUNI-002 · No search yet/);
  commit("KUNI: discovery and plan approved");

  // 3. Understand · Design (a person approves, medium risk) · Plan.
  run("open", "SLC-KUNI-001-A", ...AI);
  assert.match(refused("open", "SLC-KUNI-002-A", ...AI), /waits for the Now features: CAP-KUNI-001 not done yet/);
  edit("changes/CHG-KUNI-001/change.md", (t) => t.replace(/\| \? \|/g, "| unchanged |").replace("| Components & tests | unchanged | |", "| Components & tests | changed | CMP-KUNI-001 |").replace("| Experience | unchanged | |", "| Experience | changed | experience.md |").replace(/_What will be true for the user[^\n]*_/, "The explorer opens the app into a full-screen network.").replace(/_How the system will look after this change[^\n]*_/, "CMP-KUNI-001 renders the network full screen (ADR-KUNI-001) on the background token of experience.md."));
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "approved", ...AI), /a person must approve the design/);
  run("approve", "CHG-KUNI-001");
  run("advance", "CHG-KUNI-001", "--to", "approved", ...AI);
  run("new", "task", "CHG-KUNI-001", "Full-screen scene", "--goal", "the network fills the screen in the dark theme", "--inputs", "REQ-KUNI-001,NFR-KUNI-001,CMP-KUNI-001,TEST-KUNI-001,TEST-KUNI-002", "--paths", "apps/web/src/scene/**", "--checks", "typecheck,test", "--done", "scene mounts full screen", ...AI);
  run("advance", "CHG-KUNI-001", "--to", "ready", ...AI);
  commit("CHG-KUNI-001: understand, design, plan");

  // 4. Build — one task, tests first inside it (D8, Q1-B): tests → red → code → green, committed together.
  fs.mkdirSync(path.join(repo, "apps/web/src/scene"), { recursive: true });
  run("task", "TASK-KUNI-001", "start", ...AI);
  const ctx = run("context", "TASK-KUNI-001");
  for (const part of [/## Architecture \(main parts and dependency rules\)[\s\S]*must not import `apps\/web\/src\/data\/raw\*`/, /## Project rules that apply to this task[\s\S]*RULE-KUNI-001 · Labels use the project font/, /## Domain rules and words for this task[\s\S]*INV-KUNI-001 · Every node on screen belongs to the graph/, /## Design pages of the changed and referenced layers[\s\S]*`color\.bg` \| `#05060a`/, /## Visual bar[\s\S]*1\. Opens straight into the network/]) assert.match(ctx, part);
  fs.writeFileSync(path.join(repo, "apps/web/src/scene/Scene.test.cjs"), "const test = require('node:test');\nconst assert = require('node:assert');\ntest('the scene mounts full screen', () => assert.equal(require('./Scene.cjs').mode, 'full screen'));\ntest('the scene uses the dark theme', () => assert.equal(require('./Scene.cjs').theme.background, '#05060a'));\n");
  assert.match(refused("task", "TASK-KUNI-001", "done", "scene mounts", ...AI), /implements REQ-KUNI-001, NFR-KUNI-001 \(must\): tests come first inside the task/);
  assert.match(run("check", "CHG-KUNI-001", "--red", ...AI), /Red: the tests fail before the work/);
  fs.writeFileSync(path.join(repo, "apps/web/src/scene/Scene.cjs"), "exports.mode = 'full screen';\nexports.theme = { background: '#05060a', glow: 0.6 };\n");
  assert.match(refused("task", "TASK-KUNI-001", "done", "scene mounts", ...AI), /commit its work and its knowledge first/);
  commit("TASK-KUNI-001: full-screen scene with its tests");
  assert.match(refused("check", "CHG-KUNI-001", "--red", ...AI), /Tests already pass/);
  run("task", "TASK-KUNI-001", "done", "scene mounts full screen in the dark theme; labels come later", ...AI);

  // 5. Check & Record. D6: a dependency rule written as paths is enforced on the code.
  const scene = path.join(repo, "apps/web/src/scene/Scene.cjs");
  const clean = fs.readFileSync(scene, "utf8");
  fs.writeFileSync(scene, `try { require('../data/raw-sample.cjs'); } catch {}\n${clean}`);
  const broken = refused("check", "CHG-KUNI-001", ...AI);
  assert.match(broken, /✗ project Rules/);
  assert.match(broken, /apps\/web\/src\/scene\/Scene\.cjs imports "\.\.\/data\/raw-sample\.cjs" — breaks `apps\/web\/src\/scene\/\*\*` must not import `apps\/web\/src\/data\/raw\*`/);
  fs.writeFileSync(scene, clean);
  assert.match(run("check", "CHG-KUNI-001", ...AI), /Screenshots \(1\)/);
  assert.match(fs.readFileSync(p("changes/CHG-KUNI-001/evidence/checks.md"), "utf8"), /- \*\*Screenshots:\*\* shots\/EVD-KUNI-\d+\/view-1440x900\.png/);
  assert.match(run("next"), /Waiting for a person: a person opens the app/);
  const noBar = refused("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked at it on a 27-inch screen");
  assert.match(noBar, /--bar all[\s\S]*5\. Nothing looks like a flat default diagram[\s\S]*Latest screenshots:\n  project\/changes\/CHG-KUNI-001\/evidence\/shots\/EVD-KUNI-\d+\/view-1440x900\.png/);
  assert.match(refused("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked at it", "--bar", "all"), /confirmed in a terminal/, "without a terminal (as in an AI tool) the look is refused");
  assert.match(look("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked at it on a 27-inch screen", "--bar", "1,2,3,4"), /pass with gaps 5: looked at it on a 27-inch screen · bar: 4 of 5/);
  run("advance", "CHG-KUNI-001", "--to", "verified", ...AI);
  run("new", "doc", "quality");
  edit("knowledge/06-quality/quality.md", (t) => t.replace(/(## 2\. Checks and who runs them\n\n)_[^\n]*_/, "$1Runner on every task; the owner looks at every UI change."));
  // D2: the Impact said Components & tests changed, so Record refuses until that page describes the result.
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "reconciled", ...AI), /the Impact says Components & tests changed: update knowledge\/05-implementation\/components\.md/);
  edit("knowledge/05-implementation/components.md", (t) => t.replace(/(### CMP-KUNI-001 · Graph scene\n[\s\S]*?)(\n### |\n## |$)/, "$1\nRenders the network full screen from `apps/web/src/scene/Scene.cjs`.\n$2"));
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "reconciled", ...AI), /the Impact says Experience changed: update knowledge\/04-design\/experience\.md/);
  edit("knowledge/04-design/experience.md", (t) => t.replace(/(## 1\. Screens and first view\n\n)_[^\n]*_/, "$1One full-screen scene on the `color.bg` background; no chrome on first view."));
  run("advance", "CHG-KUNI-001", "--to", "reconciled", ...AI);
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "closed", ...AI), /Stopped at reconciled/);
  commit("CHG-KUNI-001: record");
  assert.match(run("advance", "CHG-KUNI-001", "--to", "closed", ...AI), /CHG-KUNI-001 is now closed/);

  let board = fs.readFileSync(p("STATUS.md"), "utf8");
  assert.match(board, /\| Now \| CAP-KUNI-001 · Explore the network \| ✅ Done \|[^\n]*⚠ visual bar gaps: 5 \(CHG-KUNI-001\)/);
  assert.match(board, /project approved by islam/);
  assert.match(board, /- Brief: 1 of 2 demand\(s\) covered · 1 delivered · 1 out of scope/);
  // The person looks again after a fix outside this walkthrough: the whole bar passes.
  look("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked again after the glow tweak", "--bar", "all");
  assert.match(fs.readFileSync(p("changes/CHG-KUNI-001/log.md"), "utf8"), /pass: looked again after the glow tweak · bar: all 5 · look:tty/);
  board = fs.readFileSync(p("STATUS.md"), "utf8");
  assert.doesNotMatch(board, /visual bar gaps/);
  commit("CHG-KUNI-001: the person's look");
  // The Now feature is done and accepted: the Next slice may open.
  assert.match(run("open", "SLC-KUNI-002-A", ...AI), /CHG-KUNI-002/);
  // D7: a person measures the outcome (here after the first feature; the board shows it).
  assert.match(refused("measure", "OUT-KUNI-001", "--result", "met", "--note", "x", "--by", "ai:claude"), /must come from a person/);
  run("measure", "OUT-KUNI-001", "--result", "met", "--note", "the owner judged the universe on first sight");
  assert.match(fs.readFileSync(p("STATUS.md"), "utf8"), /\| OUT-KUNI-001 · The owner can judge the universe on first sight \| 1\/2 \| 🎯 met \| islam [\d-]+: the owner judged the universe on first sight \|/);
  assert.match(run("validate"), /Validation PASS: .* 0 errors/);
});
