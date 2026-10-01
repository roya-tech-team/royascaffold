"use strict";

// `init` (new project skeleton) and `install` (navigator skill for AI tools).

const fs = require("fs");
const path = require("path");
const { git } = require("../git.cjs");

const ENGINE = path.join(__dirname, "..", "..");

function writeNew(file, content, created) {
  if (fs.existsSync(file)) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  created.push(file);
  return true;
}

function parseApps(value) {
  if (!value) return [];
  return String(value).split(",").map((x) => x.trim()).filter(Boolean).map((pair) => {
    const [name, dir] = pair.split("=");
    if (!name || !dir || !/^[a-z][a-z0-9-]*$/i.test(name)) throw new Error(`--app must look like web=apps/web (got "${pair}")`);
    return { name: name.toLowerCase(), dir: dir.replace(/\/+$/, "") };
  });
}

function initProject(start, flags = {}) {
  const repo = path.resolve(start || ".");
  const code = String(flags.code || "").toUpperCase();
  if (!flags.name || !/^[A-Z][A-Z0-9]{1,9}$/.test(code)) throw new Error('Usage: royascaff init [path] --name "<product name>" --code <CODE: 2–10 capital letters> [--app web=apps/web,api=apps/api]');
  const projectDir = path.join(repo, "project");
  if (fs.existsSync(path.join(projectDir, "profile.md"))) throw new Error(`${projectDir} already has a profile.md — this project is already set up`);
  const owner = flags.owner || (git(repo, ["config", "user.name"]) || "team").toLowerCase().replace(/\s+/g, "-");
  const apps = parseApps(flags.app);
  const created = [];
  const { docText } = require("../templates.cjs");
  const apps_ = apps.map((a) => `### APP-${code}-${a.name.toUpperCase()} · ${a.name} app\n\n- **Path:** ${a.dir}\n- **Build:**\n- **Typecheck:**\n- **Lint:**\n- **Test:**\n`).join("\n");
  const { KNOWN } = require("../adapters.cjs");
  const adapters = String(flags.adapter || "generic").split(",").map((x) => x.trim()).filter(Boolean);
  const unknownAdapters = adapters.filter((a) => !KNOWN().includes(a));
  if (unknownAdapters.length) throw new Error(`Unknown adapter: ${unknownAdapters.join(", ")} (use ${KNOWN().join(", ")})`);
  const vars = { CODE: code, OWNER: owner, NAME: flags.name, PROFILE: flags.lite ? "lite" : "standard", ADAPTERS: adapters.join(", "), APPS: apps_ || "_Add one `### APP-" + code + "-WEB · web app` record per app, with Path and commands._\n" };
  const files = {
    "profile.md": "profile",
    "knowledge/00-roadmap/roadmap.md": "roadmap",
    "knowledge/00-discovery/discovery.md": "discovery",
    "knowledge/01-business/brd.md": "brd",
    "knowledge/04-design/architecture.md": "architecture",
    "knowledge/02-requirements/requirements.md": "requirements",
    "knowledge/04-design/decisions.md": "decisions",
    "knowledge/05-implementation/components.md": "components",
    "knowledge/05-implementation/tests.md": "tests",
  };
  for (const [rel, name] of Object.entries(files)) writeNew(path.join(projectDir, rel), docText(name, vars), created);
  writeNew(path.join(projectDir, "log.md"), require("../events.cjs").logTemplate("project"), created);
  for (const d of ["PLAYBOOK.md", "GLOSSARY.md"]) writeNew(path.join(projectDir, d), fs.readFileSync(path.join(ENGINE, "docs", d), "utf8"), created);
  for (const a of apps) fs.mkdirSync(path.join(repo, a.dir), { recursive: true });
  require("./views.cjs").indexCommand(repo);
  return { project: projectDir, code, apps, created: created.map((f) => path.relative(repo, f)) };
}

function cliCommand() {
  if (process.env.ROYASCAFF_CLI) return process.env.ROYASCAFF_CLI;
  if (ENGINE.split(path.sep).includes("node_modules")) return "npx royascaff";
  return `node ${path.join(ENGINE, "bin", "royascaff.cjs")}`;
}

function copySkill(target, cli) {
  const src = path.join(ENGINE, "skill", "royascaff");
  const written = [];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(src, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r);
      else {
        const out = path.join(target, r);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, fs.readFileSync(path.join(src, r), "utf8").replace(/\{\{CLI\}\}/g, cli));
        written.push(out);
      }
    }
  };
  walk("");
  return written;
}

// install [path] [--cursor] [--claude]: both when neither is given. Engine-owned skill files are
// replaced on every install (they follow the engine version); project docs are never overwritten.
function install(start, flags = {}) {
  const repo = path.resolve(start || ".");
  const tools = [];
  if (flags.cursor) tools.push("cursor");
  if (flags.claude) tools.push("claude");
  if (!tools.length) tools.push("cursor", "claude");
  const cli = cliCommand();
  const written = [];
  for (const tool of tools) {
    const target = path.join(repo, `.${tool}`, "skills", "royascaff");
    written.push(...copySkill(target, cli));
    const { DIR } = require("../adapters.cjs");
    for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".md"))) {
      const out = path.join(target, "adapters", f);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, fs.readFileSync(path.join(DIR, f), "utf8"));
      written.push(out);
    }
  }
  const created = [];
  const projectDir = path.join(repo, "project");
  if (fs.existsSync(projectDir)) for (const d of ["PLAYBOOK.md", "GLOSSARY.md"]) writeNew(path.join(projectDir, d), fs.readFileSync(path.join(ENGINE, "docs", d), "utf8"), created);
  return { tools, cli, skill_files: written.map((f) => path.relative(repo, f)), docs_created: created.map((f) => path.relative(repo, f)) };
}

module.exports = { initProject, install, cliCommand };
