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
  edit("profile.md", (t) => t.replace("- **Build:**", "- **Build:** node -e 0").replace("- **Typecheck:**", "- **Typecheck:** node -e 0").replace("- **Lint:**", "- **Lint:** node -e 0").replace("- **Test:**", "- **Test:** node -e 0"));
  commit("chore: royascaff init");

  // 1. Discover with the person.
  assert.match(run("next"), /Discover the project/);
  const topics = ["Explorers who browse knowledge; the owner who judges it.", "Flat diagrams hide structure.", "A visual proof with sample data; no accounts.", "The owner says it feels like a product.", "Desktop first.",
    "- **Option A:** React + React Three Fiber\n- **Option B:** Vue + TresJS\n\n**Recommendation:** Option A.", "About 150 sample items.", "Dark, calm, cinematic; the reference image is inspiration only."];
  let i = 0;
  edit("knowledge/00-discovery/discovery.md", (t) => t.replace(/(## \d\. [^\n]+\n\n)_[^\n]*_/g, (m, h) => (i < 8 ? `${h}${topics[i++]}` : m)));
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
  run("new", "record", "test", "Scene mounts full screen", "--verifies", "REQ-KUNI-001", "--check", "runner:test", ...AI);
  run("new", "slice", "CAP-KUNI-001", "Full-screen network", "--delivers", "REQ-KUNI-001", ...AI);
  assert.match(refused("open", "SLC-KUNI-001-A", ...AI), /has no approved plan/);
  run("approve", "roadmap");
  commit("KUNI: discovery and plan approved");

  // 3. Understand · Design (a person approves, medium risk) · Plan.
  run("open", "SLC-KUNI-001-A", ...AI);
  edit("changes/CHG-KUNI-001/change.md", (t) => t.replace(/\| \? \|/g, "| referenced |").replace("| Components / code / tests | referenced | |", "| Components / code / tests | changed | CMP-KUNI-001 |").replace(/_What will be true for the user[^\n]*_/, "The explorer opens the app into a full-screen network.").replace(/_How the system will look after this change[^\n]*_/, "CMP-KUNI-001 renders the network full screen (ADR-KUNI-001)."));
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "approved", ...AI), /a person must approve the design/);
  run("approve", "CHG-KUNI-001");
  run("advance", "CHG-KUNI-001", "--to", "approved", ...AI);
  run("new", "task", "CHG-KUNI-001", "Full-screen scene", "--goal", "the network fills the screen", "--inputs", "REQ-KUNI-001,CMP-KUNI-001", "--paths", "apps/web/src/scene/**", "--checks", "typecheck,test", "--done", "scene mounts full screen", ...AI);
  run("advance", "CHG-KUNI-001", "--to", "ready", ...AI);
  commit("CHG-KUNI-001: understand, design, plan");

  // 4. Build: code and knowledge committed together.
  run("task", "TASK-KUNI-001", "start", ...AI);
  fs.mkdirSync(path.join(repo, "apps/web/src/scene"), { recursive: true });
  fs.writeFileSync(path.join(repo, "apps/web/src/scene/Scene.ts"), "export const Scene = 'full screen';\n");
  assert.match(refused("task", "TASK-KUNI-001", "done", "scene mounts", ...AI), /commit its work and its knowledge first/);
  commit("TASK-KUNI-001: full-screen scene");
  run("task", "TASK-KUNI-001", "done", "scene mounts full screen; labels come later", ...AI);

  // 5. Check & Record: runner, the person's look, quality strategy, commit, close.
  run("check", "CHG-KUNI-001", ...AI);
  assert.match(run("next"), /Waiting for a person: a person opens the app/);
  run("check", "CHG-KUNI-001", "--result", "pass", "--note", "looked at it on a 27-inch screen");
  run("advance", "CHG-KUNI-001", "--to", "verified", ...AI);
  run("new", "doc", "quality");
  edit("knowledge/06-quality/quality.md", (t) => t.replace(/(## 2\. Checks and who runs them\n\n)_[^\n]*_/, "$1Runner on every task; the owner looks at every UI change."));
  run("advance", "CHG-KUNI-001", "--to", "reconciled", ...AI);
  assert.match(refused("advance", "CHG-KUNI-001", "--to", "closed", ...AI), /Stopped at reconciled/);
  commit("CHG-KUNI-001: record");
  assert.match(run("advance", "CHG-KUNI-001", "--to", "closed", ...AI), /CHG-KUNI-001 is now closed/);

  const board = fs.readFileSync(p("STATUS.md"), "utf8");
  assert.match(board, /\| Now \| CAP-KUNI-001 · Explore the network \| ✅ Done \|/);
  assert.match(board, /project approved by islam/);
  assert.match(run("validate"), /Validation PASS: .* 0 errors/);
});
