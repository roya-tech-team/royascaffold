"use strict";

const { execFileSync } = require("child_process");

function git(dir, args, opts = {}) {
  try {
    return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024, ...opts }).replace(/\n$/, "");
  } catch {
    return null;
  }
}

function isRepo(dir) {
  return git(dir, ["rev-parse", "--is-inside-work-tree"]) === "true";
}

// Path of `dir` inside its repository ("" at the top level, "sub/dir/" below it).
function prefixOf(dir) {
  return git(dir, ["rev-parse", "--show-prefix"]) || "";
}

function headShort(dir) {
  return git(dir, ["rev-parse", "--short", "HEAD"]);
}

// Full hash of a commit-ish, or null if it does not exist in this repository.
// A commit never changes, so the answer is kept for the life of the process (a log names the same few commits again and
// again: each lookup is a process on Windows).
const RESOLVED = new Map();
function resolve(dir, rev) {
  if (!rev || !/^[0-9a-f]{4,40}$/i.test(rev)) return null;
  const key = `${dir}\0${rev}`;
  if (RESOLVED.has(key)) return RESOLVED.get(key);
  const full = git(dir, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
  // A hash of 7+ characters that names no commit now will not name one later (a commit cannot be looked up before it exists).
  if (rev.length >= 7) RESOLVED.set(key, full || null);
  return full;
}

// Resolves many short hashes in one process (git cat-file --batch-check) and keeps the hits, so the lookups that follow are free.
function prime(dir, revs) {
  const todo = [...new Set((revs || []).filter((r) => r && /^[0-9a-f]{7,40}$/i.test(r) && !RESOLVED.has(`${dir}\0${r}`)))];
  if (!todo.length) return;
  try {
    const out = execFileSync("git", ["-C", dir, "cat-file", "--batch-check"], { input: `${todo.map((r) => `${r}^{commit}`).join("\n")}\n`, encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], maxBuffer: 16 * 1024 * 1024 });
    out.split("\n").forEach((line, i) => {
      const m = line.match(/^([0-9a-f]{40}) commit /);
      if (todo[i]) RESOLVED.set(`${dir}\0${todo[i]}`, m ? m[1] : /missing$/.test(line) ? null : undefined);
    });
  } catch {
    // not a repository, or git is missing: the single lookups say the same
  }
}

function isAncestor(dir, a, b) {
  try {
    execFileSync("git", ["-C", dir, "merge-base", "--is-ancestor", a, b], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Commits in (base, HEAD], oldest first, with their files.
function commitsSince(dir, base) {
  const out = git(dir, ["log", "--reverse", "--format=%x1e%H%x1f%h%x1f%an%x1f%aI%x1f%s", "--name-only", "--relative", `${base}..HEAD`]);
  if (!out) return [];
  return out.split("\x1e").filter((b) => b.trim()).map((block) => {
    const [head, ...rest] = block.split("\n");
    const [hash, short, author, date, subject] = head.split("\x1f");
    return { hash, short, author, date, subject, files: rest.map((l) => l.trim()).filter(Boolean) };
  });
}

// Working-tree changes: [{ path, code }] for modified, added, deleted and untracked files.
function workingChanges(dir) {
  const out = git(dir, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "."]);
  if (!out) return [];
  const prefix = prefixOf(dir);
  const parts = out.split("\0").filter(Boolean);
  const changes = [];
  for (let i = 0; i < parts.length; i += 1) {
    const code = parts[i].slice(0, 2);
    const file = parts[i].slice(3);
    if (file.startsWith(prefix)) changes.push({ path: file.slice(prefix.length), code: code.trim() || code });
    if (code[0] === "R" || code[0] === "C") i += 1; // skip the source path of renames/copies
  }
  return changes;
}

function filesChangedSince(dir, commit) {
  const out = git(dir, ["diff", "--name-only", "--relative", commit, "HEAD"]);
  return out ? out.split("\n").filter(Boolean) : [];
}

function showFile(dir, commit, repoPath) {
  return git(dir, ["show", `${commit}:./${repoPath}`]);
}

module.exports = { git, isRepo, prefixOf, headShort, resolve, prime, isAncestor, commitsSince, workingChanges, filesChangedSince, showFile };
