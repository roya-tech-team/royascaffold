"use strict";

// A migration is a plan of file operations (paths relative to the repository root):
//   move   old path -> new path (content kept, or replaced when the file is also edited)
//   edit   new content for a file (at its new path when it also moves)
//   create a file that did not exist
// Nothing is deleted. Apply snapshots every original it touches; rollback restores them and
// removes only what the migration created, so the tree is byte-identical again.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class MigrationPlan {
  constructor(repo) {
    this.repo = repo;
    this.moves = new Map(); // old -> new
    this.edits = new Map(); // new path -> content
    this.creates = new Map(); // new path -> content
    this.notes = [];
  }

  abs(rel) {
    return path.join(this.repo, rel);
  }

  exists(rel) {
    return fs.existsSync(this.abs(rel));
  }

  // Current path of an original file after the planned moves.
  target(oldRel) {
    return this.moves.get(oldRel) || oldRel;
  }

  // Planned content of an original file (edited, else original).
  read(oldRel) {
    const t = this.target(oldRel);
    if (this.edits.has(t)) return this.edits.get(t);
    return fs.readFileSync(this.abs(oldRel), "utf8");
  }

  moveFile(fromRel, toRel) {
    if (fromRel === toRel) return;
    if (this.exists(toRel) && !this.moves.has(toRel)) throw new Error(`Cannot move ${fromRel}: ${toRel} already exists`);
    this.moves.set(fromRel, toRel);
  }

  moveTree(fromRel, toRel) {
    for (const f of listAll(this.abs(fromRel))) this.moveFile(path.posix.join(fromRel, f), path.posix.join(toRel, f));
  }

  edit(oldRel, content) {
    const original = fs.readFileSync(this.abs(oldRel), "utf8");
    const t = this.target(oldRel);
    if (content === original && !this.edits.has(t)) return;
    this.edits.set(t, content);
  }

  create(rel, content) {
    if (this.exists(rel) && ![...this.moves.keys()].includes(rel)) throw new Error(`Cannot create ${rel}: it already exists`);
    this.creates.set(rel, content);
  }

  summary() {
    return { moves: this.moves.size, edits: this.edits.size, creates: this.creates.size, notes: this.notes };
  }
}

function listAll(absDir) {
  const out = [];
  if (!fs.existsSync(absDir)) return out;
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(absDir, rel), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r);
      else if (e.isFile()) out.push(r);
    }
  };
  walk("");
  return out;
}

function sha(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function writeFile(abs, content) {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

function removeEmptyDirs(repo, rels) {
  const dirs = new Set();
  for (const r of rels) {
    let d = path.posix.dirname(r);
    while (d && d !== ".") {
      dirs.add(d);
      d = path.posix.dirname(d);
    }
  }
  for (const d of [...dirs].sort((a, b) => b.length - a.length)) {
    const abs = path.join(repo, d);
    try {
      if (fs.existsSync(abs) && fs.readdirSync(abs).length === 0) fs.rmdirSync(abs);
    } catch {
      // not empty or not permitted: leave it
    }
  }
}

// Applies the plan. `manifestDir` (repo-relative) receives manifest.json and original/ copies.
function applyPlan(plan, manifestDir, meta) {
  const repo = plan.repo;
  const originals = new Set([...plan.moves.keys()]);
  for (const t of plan.edits.keys()) {
    const old = [...plan.moves.entries()].find(([, n]) => n === t);
    originals.add(old ? old[0] : t);
  }
  for (const rel of originals) writeFile(path.join(repo, manifestDir, "original", rel), fs.readFileSync(path.join(repo, rel)));
  for (const [from, to] of plan.moves) {
    fs.mkdirSync(path.dirname(path.join(repo, to)), { recursive: true });
    fs.renameSync(path.join(repo, from), path.join(repo, to));
  }
  for (const [rel, content] of plan.edits) writeFile(path.join(repo, rel), content);
  for (const [rel, content] of plan.creates) writeFile(path.join(repo, rel), content);
  removeEmptyDirs(repo, [...plan.moves.keys()]);
  const manifest = {
    ...meta,
    applied: new Date().toISOString(),
    moves: [...plan.moves.entries()].map(([from, to]) => ({ from, to })),
    edited: [...plan.edits.keys()].filter((t) => ![...plan.moves.values()].includes(t)),
    created: [...plan.creates.keys()],
    originals: [...originals].map((rel) => ({ path: rel, sha256: sha(fs.readFileSync(path.join(repo, manifestDir, "original", rel))) })),
  };
  writeFile(path.join(repo, manifestDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function rollbackPlan(repo, manifestDir, extraCreated = []) {
  const manifest = JSON.parse(fs.readFileSync(path.join(repo, manifestDir, "manifest.json"), "utf8"));
  const orig = (rel) => fs.readFileSync(path.join(repo, manifestDir, "original", rel));
  const removed = [];
  for (const rel of [...manifest.created, ...extraCreated]) {
    const abs = path.join(repo, rel);
    if (fs.existsSync(abs)) {
      fs.rmSync(abs);
      removed.push(rel);
    }
  }
  for (const { from, to } of manifest.moves) {
    writeFile(path.join(repo, from), orig(from));
    if (fs.existsSync(path.join(repo, to))) fs.rmSync(path.join(repo, to));
  }
  for (const rel of manifest.edited) writeFile(path.join(repo, rel), orig(rel));
  const manifestAbs = path.join(repo, manifestDir);
  fs.rmSync(manifestAbs, { recursive: true, force: true });
  removeEmptyDirs(repo, [...manifest.created, ...extraCreated, ...manifest.moves.map((m) => m.to), `${manifestDir}/x`]);
  return { restored: manifest.moves.length + manifest.edited.length, removed };
}

module.exports = { MigrationPlan, applyPlan, rollbackPlan, listAll };
