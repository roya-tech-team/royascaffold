const fs = require("fs");
const path = require("path");
const { assertInside, ensureDir } = require("./fs-utils");
const { writeDocument } = require("./markdown");

const PACKAGE_ROOT = path.resolve(__dirname, "..");

function copyTarget(source, destination, force) {
  if (fs.existsSync(destination)) {
    if (!force) throw new Error(`Target exists: ${destination}. Use --force to replace this scoped target.`);
    fs.rmSync(destination, { recursive: true, force: true });
  }
  ensureDir(path.dirname(destination));
  fs.cpSync(source, destination, { recursive: true });
}

function scaffoldEngine(targetDir, { force = false, targets = ["cursor"] } = {}) {
  const root = path.resolve(targetDir);
  ensureDir(root);
  const installedRoot = assertInside(root, path.join(root, "royascaff-1.3"), "engine install target");
  ensureDir(installedRoot);
  for (const name of ["engine", "schemas"]) copyTarget(path.join(PACKAGE_ROOT, name), path.join(installedRoot, name), force);
  for (const target of targets) {
    const agentRoot = target === "claude" ? ".claude" : ".cursor";
    const destination = assertInside(root, path.join(root, agentRoot, "skills"), "skill install target");
    copyTarget(path.join(PACKAGE_ROOT, "skills"), destination, force);
  }
  return { root, installedRoot, targets };
}

function initializeProject(projectRoot, { project = "New Project", owner = "project-owner" } = {}) {
  const root = path.resolve(projectRoot);
  ensureDir(root);
  const directories = [
    "requirements/modules", "architecture/applications", "architecture/modules", "domain/modules",
    "workflows", "contracts", "data", "implementation/components", "implementation/code-map",
    "decisions", "changes/active", "changes/archive", "bugs/active", "bugs/archive", "indexes", "verify",
  ];
  for (const directory of directories) ensureDir(path.join(root, directory));
  const profileFile = path.join(root, "profile.md");
  const systemMapFile = path.join(root, "system-map.md");
  if (fs.existsSync(profileFile) || fs.existsSync(systemMapFile)) throw new Error(`Project knowledge already initialized at ${root}`);
  writeDocument(profileFile, {
    schema: "royascaff/project-profile/v1",
    project,
    version: "1.3",
    source_roots: ["../src"],
    code_map_exclude: ["../src/**/generated/**"],
    owners: [owner],
    adapters: ["generic"],
    commands: {},
  }, `# Project Profile — ${project}\n\nConfirm repositories, applications, source roots, commands, owners, adapters, and exclusions before design.\n`);
  writeDocument(systemMapFile, { schema: "royascaff/artifact-file/v1", layer: "system-map", owner, artifacts: ["SYS-CORE-001"] }, `# System Map — ${project}\n\n## SYS-CORE-001 — System overview\n\n\`\`\`yaml artifact\nid: SYS-CORE-001\ntype: system\ntitle: System overview\nmodule: system\nowner: ${owner}\nknowledge_status: draft\nimplementation_status: planned\ntags: [system-map]\n\`\`\`\n\nDescribe the system boundary, actors, applications, modules, workflows, integrations, architecture, implementation posture, and links to deeper canonical knowledge.\n`);
  return { root, created: ["profile.md", "system-map.md", ...directories] };
}

module.exports = { initializeProject, scaffoldEngine };
