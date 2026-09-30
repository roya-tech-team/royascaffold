"use strict";

// Basic command runner (plan E13, Q17): runs the commands each app declares in profile.md
// (`APP-` records: Build, Typecheck, Lint, Test) and turns the results into evidence.
//   full  = Build, Typecheck, Lint, Test   (stage 5 Check)
//   quick = Typecheck, Lint                (after each task)
// Technology-neutral: the engine only runs the project's own commands. Richer runners
// (browser, API contract, visual) come with adapters in 1.5.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { patternList } = require("./glob.cjs");
const { globBase } = require("./context.cjs");

const FULL = ["Build", "Typecheck", "Lint", "Test", "Smoke"]; // Smoke: WP-C5, the app in a real browser
const QUICK = ["Typecheck", "Lint"];
const RED = ["Test"]; // WP-C4: tests written first must fail before the work
const TAIL_LINES = 30;

function appsOf(model) {
  return [...model.records.values()]
    .filter((r) => r.kind === "app")
    .map((r) => ({ id: r.id, title: r.title, path: String(r.fields.Path || "").replace(/`/g, "").trim().replace(/\/+$/, ""), commands: Object.fromEntries(FULL.map((k) => [k, String(r.fields[k] || "").replace(/^`|`$/g, "").trim()]).filter(([, v]) => v)) }));
}

// Apps a change touches: those whose folder contains (or is contained in) a task's allowed paths.
// When no task paths match any app, every app with commands is checked.
function appsForChange(model, change) {
  const apps = appsOf(model).filter((a) => Object.keys(a.commands).length);
  const bases = change.tasks.flatMap((t) => patternList(model.records.get(t).fields["Allowed paths"])).map(globBase);
  const touched = apps.filter((a) => a.path && bases.some((b) => b === a.path || b.startsWith(`${a.path}/`) || a.path.startsWith(`${b}/`)));
  return touched.length ? touched : apps;
}

function tail(text) {
  const lines = text.replace(/\r/g, "").trimEnd().split("\n");
  return lines.slice(-TAIL_LINES).join("\n");
}

function runOne(repo, app, kind, command, timeoutMs, extraEnv = {}) {
  const cwd = app.path && fs.existsSync(path.join(repo, app.path)) ? path.join(repo, app.path) : repo;
  const started = Date.now();
  const r = spawnSync(command, { cwd, shell: true, encoding: "utf8", timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, CI: process.env.CI || "1", FORCE_COLOR: "0", ...extraEnv } });
  const ms = Date.now() - started;
  const timedOut = r.error && r.error.code === "ETIMEDOUT";
  const exit = timedOut ? null : r.status;
  const output = `${r.stdout || ""}${r.stderr || ""}${r.error && !timedOut ? `\n${r.error.message}` : ""}`;
  return { app: app.id, kind, command, cwd: path.relative(repo, cwd) || ".", exit, ms, pass: !timedOut && r.status === 0, timedOut, tail: timedOut ? `timed out after ${Math.round(timeoutMs / 1000)}s\n${tail(output)}` : tail(output) };
}

// The smoke script learns where to save screenshots and which adapters are on (web-3d adds its checks).
function smokeEnv(model, app, options) {
  const { adaptersOf } = require("./adapters.cjs");
  const rec = model.records.get(app.id);
  const ignore = rec ? String(rec.fields["Smoke ignore"] || "").replace(/`/g, "").trim() : "";
  return { ...(options.shots ? { ROYASCAFF_SHOTS: options.shots } : {}), ROYASCAFF_ADAPTERS: adaptersOf(model).join(","), ...(ignore ? { ROYASCAFF_SMOKE_IGNORE: ignore } : {}) };
}

function runChecks(model, apps, mode, options = {}) {
  const kinds = mode === "quick" ? QUICK : mode === "red" ? RED : FULL;
  const timeoutMs = (Number(model.profile.check_timeout_seconds) || 600) * 1000;
  const results = [];
  for (const app of apps) for (const kind of kinds) if (app.commands[kind]) results.push(runOne(model.repo, app, kind, app.commands[kind], timeoutMs, kind === "Smoke" ? smokeEnv(model, app, options) : {}));
  return { mode, results, pass: results.length > 0 && results.every((r) => r.pass) };
}

function summary(run) {
  return run.results.map((r) => `${r.kind.toLowerCase()} ${r.pass ? "✓" : r.timedOut ? "⏱" : "✗"}`).join(" · ");
}

module.exports = { appsOf, appsForChange, runChecks, summary, FULL, QUICK };
