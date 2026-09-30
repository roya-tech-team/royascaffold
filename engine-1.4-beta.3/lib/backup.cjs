"use strict";

// Automatic backups of a developer's uncommitted work (owner rule Q10). Non-destructive: files
// are copied, and tracked changes are also saved as a git stash entry with `git stash create`
// + `git stash store`, which never touches the working tree. Backups live in
// project/.backups/ (self-ignored by git, never removed by the engine).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { git, workingChanges } = require("./git.cjs");
const { matchesAny } = require("./glob.cjs");

function backupsDir(model) {
  const dir = path.join(model.root, ".backups");
  fs.mkdirSync(dir, { recursive: true });
  const ignore = path.join(dir, ".gitignore");
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, "# Automatic RoyaScaff backups: kept on this machine, never committed.\n*\n");
  return dir;
}

function stamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

// Copies the given uncommitted files into a new backup. Returns the manifest or null.
function saveBackup(model, label, files, reason) {
  if (!files.length) return null;
  const id = `${label}-${stamp()}`;
  const dir = path.join(backupsDir(model), id);
  const entries = [];
  for (const f of files) {
    const src = path.join(model.repo, f.path);
    const exists = fs.existsSync(src) && fs.statSync(src).isFile();
    if (exists) {
      fs.mkdirSync(path.dirname(path.join(dir, "files", f.path)), { recursive: true });
      fs.copyFileSync(src, path.join(dir, "files", f.path));
    }
    entries.push({ path: f.path, status: f.code, saved: exists, sha256: exists ? crypto.createHash("sha256").update(fs.readFileSync(src)).digest("hex") : null });
  }
  let stash = null;
  const tracked = files.filter((f) => f.code !== "??").map((f) => f.path);
  if (tracked.length) {
    const sha = git(model.repo, ["stash", "create", `royascaff backup ${id}`]);
    if (sha) {
      git(model.repo, ["stash", "store", "-m", `royascaff backup ${id}`, sha]);
      stash = sha.slice(0, 10);
    }
  }
  const manifest = { id, reason, created: new Date().toISOString(), head: git(model.repo, ["rev-parse", "--short", "HEAD"]), stash, files: entries };
  fs.writeFileSync(path.join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

// Uncommitted developer files inside `patterns` that no other task in progress covers.
function uncommittedWithin(model, patterns, otherTaskPatterns = [], isKnowledge = () => false) {
  return workingChanges(model.repo).filter((w) => {
    if (isKnowledge(w.path)) return false;
    if (!matchesAny(w.path, patterns)) return false;
    return !otherTaskPatterns.some((p) => matchesAny(w.path, p));
  });
}

function listBackups(model) {
  const dir = path.join(model.root, ".backups");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, "manifest.json"))).sort().map((d) => JSON.parse(fs.readFileSync(path.join(dir, d, "manifest.json"), "utf8")));
}

// Restores a backup's files. The current versions are backed up first, so nothing is lost.
function restoreBackup(model, id) {
  const manifest = listBackups(model).find((b) => b.id === id);
  if (!manifest) throw new Error(`No backup ${id}. List them with: royascaff backups`);
  const current = manifest.files.filter((f) => fs.existsSync(path.join(model.repo, f.path))).map((f) => ({ path: f.path, code: "M" }));
  const safety = saveBackup(model, "before-restore", current, `before restoring ${id}`);
  const restored = [];
  for (const f of manifest.files) {
    if (!f.saved) continue;
    const target = path.join(model.repo, f.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(model.root, ".backups", id, "files", f.path), target);
    restored.push(f.path);
  }
  return { id, restored, safety: safety ? safety.id : null };
}

module.exports = { saveBackup, uncommittedWithin, listBackups, restoreBackup, backupsDir };
