"use strict";

// Project discovery and scan boundary.
//
// 1.4 layout:   <repo>/project/**   (knowledge)   +   <repo>/apps/** (code, never scanned here)
// Legacy 1.3:   knowledge zones at the repo root (knowledge/, changes/, contexts/, …)
// Legacy 1.2:   <repo>/project/**   (same folder name, different content)
//
// Never scanned: dependency and build folders, dot-folders (.git, .cursor, .claude, .cache,
// .backups), and any copied engine folder (a folder holding engine.json, or flow.md next to
// templates/). This fixes the 1.3.1 defect where the engine's own examples were read as
// project knowledge.

const fs = require("fs");
const path = require("path");

const ALWAYS_SKIP = new Set(["node_modules", "dist", "build", "coverage"]);
const LEGACY_ROOT_ZONES = new Set(["knowledge", "changes", "contexts", "generated", "evidence", "releases", "incidents"]);

function slash(p) {
  return p.split(path.sep).join("/");
}

function isEngineCopy(dir) {
  if (fs.existsSync(path.join(dir, "engine.json"))) return true;
  return fs.existsSync(path.join(dir, "flow.md")) && fs.existsSync(path.join(dir, "templates"));
}

function findProject(start) {
  const repo = path.resolve(start);
  if (!fs.existsSync(repo)) throw new Error(`Path does not exist: ${repo}`);
  const nested = path.join(repo, "project");
  if (fs.existsSync(nested) && fs.statSync(nested).isDirectory()) {
    return { repo, projectDir: nested, layout: "project-folder" };
  }
  const markers = ["system-map.md", "profile.md", "knowledge", "changes"];
  if (markers.some((m) => fs.existsSync(path.join(repo, m)))) {
    return { repo, projectDir: repo, layout: "legacy-root" };
  }
  throw new Error(`No RoyaScaff project found in ${repo} (expected a project/ folder or 1.3 knowledge zones)`);
}

function walk(dir, visit, depth = 0, rootMode = false) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || ALWAYS_SKIP.has(entry.name)) continue;
      if (rootMode && depth === 0 && !LEGACY_ROOT_ZONES.has(entry.name)) continue;
      if (isEngineCopy(full)) continue;
      walk(full, visit, depth + 1, rootMode);
    } else if (entry.isFile()) {
      visit(full);
    }
  }
}

function listMarkdown(project) {
  const files = [];
  const rootMode = project.layout === "legacy-root";
  walk(project.projectDir, (full) => {
    if (full.toLowerCase().endsWith(".md")) files.push(full);
  }, 0, rootMode);
  return files.map((full) => ({ full, rel: slash(path.relative(project.projectDir, full)) }));
}

module.exports = { findProject, listMarkdown, isEngineCopy, slash };
