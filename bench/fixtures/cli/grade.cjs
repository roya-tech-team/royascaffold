"use strict";

// Grades a run of the CLI fixture: every rule of request.md is one check. It runs the agent's `todo.cjs`
// in a fresh folder, so the agent's own tasks.json never leaks into the grade.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function grade(work) {
  const tool = path.join(work, "todo.cjs");
  const checks = {};
  checks["todo.cjs exists"] = fs.existsSync(tool);
  if (!checks["todo.cjs exists"]) return checks;

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bench-cli-grade-"));
  const run = (...args) => {
    const r = spawnSync(process.execPath, [tool, ...args], { cwd: dir, encoding: "utf8", timeout: 20000 });
    return { code: r.status, out: `${r.stdout || ""}`.trim(), err: `${r.stderr || ""}`.trim(), all: `${r.stdout || ""}${r.stderr || ""}`.trim() };
  };
  const tasks = () => {
    try {
      return JSON.parse(fs.readFileSync(path.join(dir, "tasks.json"), "utf8"));
    } catch {
      return null;
    }
  };

  let r = run("list");
  checks["list with no tasks says No tasks yet."] = r.code === 0 && r.out === "No tasks yet.";
  r = run("add", "Buy milk");
  checks["add prints Added 1: <title>"] = r.code === 0 && r.out === "Added 1: Buy milk";
  checks["add creates tasks.json"] = tasks() !== null;
  r = run("add", "Walk the dog");
  checks["ids go up by one"] = r.out === "Added 2: Walk the dog";
  r = run("list");
  checks["list shows one line per task"] = r.out.split("\n").map((l) => l.trim()).join("|") === "1 [ ] Buy milk|2 [ ] Walk the dog";
  r = run("done", "1");
  checks["done prints Done 1: <title>"] = r.code === 0 && r.out === "Done 1: Buy milk";
  r = run("list");
  checks["a finished task shows [x]"] = /^1 \[x\] Buy milk$/m.test(r.out) && /^2 \[ \] Walk the dog$/m.test(r.out);
  r = run("add", "");
  const before = tasks();
  checks["an empty title is refused with Title is required and exit 1"] = r.code === 1 && /Title is required/.test(r.all);
  checks["an empty title saves nothing"] = Array.isArray(before ? before.tasks || before : null) ? (before.tasks || before).length === 2 : false;
  r = run("done", "99");
  checks["an unknown id says No task with id 99 and exits 1"] = r.code === 1 && /No task with id 99/.test(r.all);
  r = run("remove", "2");
  checks["remove prints Removed 2: <title>"] = r.code === 0 && r.out === "Removed 2: Walk the dog";
  r = run("add", "Call mum");
  checks["ids are never reused"] = r.out === "Added 3: Call mum";
  r = run("frobnicate");
  checks["an unknown command prints the usage and exits 2"] = r.code === 2 && /add/.test(r.all) && /list/.test(r.all) && /done/.test(r.all) && /remove/.test(r.all);
  r = run("help");
  checks["help prints one line per command"] = r.code === 0 && ["add", "list", "done", "remove", "help"].every((c) => new RegExp(`\\b${c}\\b`).test(r.out));
  r = run();
  checks["no command prints the usage"] = r.code === 0 && /add/.test(r.out) && /remove/.test(r.out);
  r = run("done", "abc");
  checks["errors say what to do next"] = r.code === 1 && /\b(use|run|try|give|pass|enter|check)\b/i.test(r.all) && r.all.length < 400;
  fs.rmSync(dir, { recursive: true, force: true });
  return checks;
}

module.exports = { grade };
