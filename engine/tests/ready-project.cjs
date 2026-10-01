"use strict";

// Test helper: a small real project taken, through the CLI, up to the point where an agent can work:
// the project and the roadmap are approved by a person, one slice is open as a change, its design is
// written and one task is `ready`. Used by the runner and the two-client acceptance tests.
// With { git: true } the project is a git repository with everything committed.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { BIN } = require("./contract-scenarios.cjs");

function readyProject({ git = false, closing = false, code = "PORT", tasks = 1, testCommand = null } = {}) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-ready-"));
  const env = { ...process.env, ROYASCAFF_USER: "islam", ROYASCAFF_USAGE: "off", ROYASCAFF_NO_TTY: "1", GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "dev@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "dev@example.com" };
  delete env.ROYASCAFF_NONINTERACTIVE;
  const run = (...args) => {
    const r = spawnSync(process.execPath, [BIN, ...args, "--path", repo], { encoding: "utf8", env });
    if (r.status !== 0) throw new Error(`royascaff ${args.join(" ")} failed:\n${r.stdout}${r.stderr}`);
    return r.stdout;
  };
  const C = code;
  run("init", "--name", "Client Portal", "--code", C, "--app", "web=apps/web");
  const disc = path.join(repo, "project/knowledge/00-discovery/discovery.md");
  const fill = { "Users and roles": "Agency clients read their results.", "Problem and outcomes": "Clients ask by email.", "Scope and out of scope": "Results only; no billing.", "Success measures": "Fewer result emails.", Constraints: "Desktop first.", Technology: "- **Option A:** React web app\n- **Option B:** server pages\n\n**Recommendation:** Option A.", "Data and content": "Campaign reach per client.", "Look, feel and references": "The agency brand." };
  let text = fs.readFileSync(disc, "utf8");
  for (const [title, body] of Object.entries(fill)) text = text.replace(new RegExp(`(## \\d\\. ${title}\\n\\n)_[^\\n]*_`), `$1${body}`);
  fs.writeFileSync(disc, text);
  const req = path.join(repo, "project/knowledge/00-discovery/request.md");
  fs.writeFileSync(req, fs.readFileSync(req, "utf8").replace("_Paste the full request here, word for word._", "Clients should see the reach of each campaign."));
  run("new", "record", "source", "Reach per campaign", "--quote", "see the reach of each campaign");
  run("new", "record", "question", "Which option do you choose?", "--topic", "technology");
  fs.writeFileSync(disc, fs.readFileSync(disc, "utf8").replace("- **Answer:**\n", "- **Answer:** Option A\n"));
  run("new", "record", "decision", "React web app", "--scope", "project");
  const arch = path.join(repo, "project/knowledge/04-design/architecture.md");
  fs.writeFileSync(arch, fs.readFileSync(arch, "utf8").replace(/(## 1\. Context\n\n)_[^\n]*_/, "$1Clients use the web app; it reads a results file."));
  fs.appendFileSync(path.join(repo, "project/knowledge/01-business/brd.md"), `\n### OUT-${C}-001 · Clients see their campaign results\n\n- **Owner:** islam\n`);
  run("approve", "project");
  run("new", "feature", "Results page", "--horizon", "now", "--outcome", `OUT-${C}-001`);
  fs.appendFileSync(path.join(repo, "project/knowledge/02-requirements/requirements.md"), `\n### REQ-${C}-001 · Client sees reach per campaign\n\n- **Priority:** must\n- **Owner:** islam\n- **Feature:** CAP-${C}-001\n`);
  const folders = Array.from({ length: tasks }, (_, i) => `results${tasks > 1 ? i + 1 : ""}`);
  fs.appendFileSync(path.join(repo, "project/knowledge/05-implementation/components.md"), folders.map((f, i) => `\n### CMP-${C}-R${i + 1} · Results page ${i + 1}\n\n- **Owner:** islam\n- **Code:** apps/web/src/${f}/**\n- **Realizes:** REQ-${C}-001\n`).join(""));
  run("new", "slice", `CAP-${C}-001`, "Reach table", "--delivers", `REQ-${C}-001`);
  run("new", "record", "test", "A person checks the reach table", "--verifies", `REQ-${C}-001`, "--check", "manual");
  const cov = path.join(repo, "project/knowledge/00-discovery/coverage.md");
  fs.writeFileSync(cov, fs.readFileSync(cov, "utf8").replace(/^(\| SRC-[^|]+\|[^|]*\|[^|]*\|)\s*\|\s*\|$/m, `$1 REQ-${C}-001 | |`));
  run("approve", "roadmap");
  run("open", `SLC-${C}-001-A`, "--risk", "low");
  const change = `CHG-${C}-001`;
  const cf = path.join(repo, `project/changes/${change}/change.md`);
  fs.writeFileSync(cf, fs.readFileSync(cf, "utf8").replace(/\| \? \|/g, "| unchanged |").replace(/_How the system[^\n]*_/, `CMP-${C}-R1 renders a reach table.`));
  const taskIds = [];
  folders.forEach((f, i) => {
    run("new", "task", change, `Reach table ${i + 1}`, "--inputs", `REQ-${C}-001,CMP-${C}-R${i + 1}`, "--paths", `apps/web/src/${f}/**`, "--checks", "test", "--done", "table shows reach per campaign");
    taskIds.push(`TASK-${C}-00${i + 1}`);
  });
  run("advance", change, "--to", "ready");
  if (closing) {
    run("new", "doc", "quality");
    const q = path.join(repo, "project/knowledge/06-quality/quality.md");
    fs.writeFileSync(q, fs.readFileSync(q, "utf8").replace(/(## 2\. Checks and who runs them\n\n)_[^\n]*_/, "$1Runner tests on every task; the owner reviews the results page."));
    fs.mkdirSync(path.join(repo, `project/changes/${change}/evidence`));
    fs.writeFileSync(path.join(repo, `project/changes/${change}/evidence/evidence.md`), `### EVD-${C}-001 · Reach table test\n\n- **Result:** pass\n- **Proves:** REQ-${C}-001\n`);
  }
  if (testCommand) {
    const prof = path.join(repo, "project/profile.md");
    fs.writeFileSync(prof, fs.readFileSync(prof, "utf8").replace(/- \*\*Test:\*\*[^\n]*/, `- **Test:** ${testCommand}`));
  }
  run("index");
  if (git) {
    const g = (...a) => {
      const r = spawnSync("git", a, { cwd: repo, encoding: "utf8", env });
      if (r.status !== 0) throw new Error(`git ${a.join(" ")}: ${r.stderr}`);
      return r.stdout;
    };
    g("init", "-q", "-b", "main");
    g("add", "-A");
    g("commit", "-q", "-m", "ready to build");
  }
  return { repo, change, task: taskIds[0], tasks: taskIds, paths: folders.map((f) => `apps/web/src/${f}/**`), code: C, run };
}

module.exports = { readyProject };
