#!/usr/bin/env node
"use strict";

// The benchmark harness (plan file 01 §7, E4.2). It is not part of the npm package.
//
// It runs one fixture request through an agent command N times, grades each run, and writes one CSV
// row per run to bench/results/<date>.csv. The agent is anything that can be started as a command: a
// real AI tool, or a scripted fake for testing the harness.
//
//   node bench/run.cjs --fixture cli --agent "node bench/agents/fake-agent.cjs" --runs 3
//   node bench/run.cjs --report bench/results/2026-10-01.csv
//
// What the agent command gets (environment, working folder):
//   cwd                  a fresh copy of the fixture's `start/` folder (empty when there is none)
//   BENCH_REQUEST        path of the request file (the fixture's request.md)
//   BENCH_WORKDIR        the same as cwd
//   BENCH_FIXTURE        the fixture name
//   BENCH_RUN            the run number, from 1
//   BENCH_REFERENCE      the fixture's reference solution folder, for scripted agents only
//   ROYASCAFF_BIN        the engine's command line entry, to run with `node "$ROYASCAFF_BIN" …`
//
// Grading: a fixture with `"grade": "script"` has a grade.cjs that checks the result and returns
// { checks: { name: true|false } }. A fixture with `"grade": "manual"` is graded by a person; its
// row holds the timing and the engine's own validation only. The score is the share of checks that
// pass; the letter (A 90, B 75, C 60, D 40, else F) is a quick proxy, the owner's review decides.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;
const ENGINE_BIN = path.join(ROOT, "..", "engine", "bin", "royascaff.cjs");
const COLUMNS = ["date", "fixture", "run", "agent", "started", "ms", "agent_exit", "timed_out", "validate_ok", "validate_errors", "validate_warnings", "checks_passed", "checks_total", "score", "grade", "failed_checks"];

const csvCell = (v) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvLine = (row) => COLUMNS.map((c) => csvCell(row[c])).join(",");

function readFixture(name, root = ROOT) {
  const dir = path.join(root, "fixtures", name);
  const file = path.join(dir, "fixture.json");
  if (!fs.existsSync(file)) {
    const known = fs.existsSync(path.join(root, "fixtures")) ? fs.readdirSync(path.join(root, "fixtures")).join(", ") : "none";
    throw new Error(`Unknown fixture "${name}" (known: ${known})`);
  }
  const fx = JSON.parse(fs.readFileSync(file, "utf8"));
  const request = path.resolve(dir, fx.request || "request.md");
  if (!fs.existsSync(request)) throw new Error(`The request of fixture "${name}" is not at ${request}${fx.pointer ? `: ${fx.pointer}` : ""}`);
  return { name, dir, grade: fx.grade || "manual", request, start: fx.start ? path.resolve(dir, fx.start) : null, reference: fx.reference ? path.resolve(dir, fx.reference) : null, description: fx.description || "" };
}

const letter = (score) => (score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F");

function validateOf(workdir) {
  if (!fs.existsSync(path.join(workdir, "project"))) return { ok: "", errors: "", warnings: "" };
  const r = spawnSync(process.execPath, [ENGINE_BIN, "validate", workdir, "--json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  try {
    const env = JSON.parse(r.stdout);
    const data = env.ok ? env.data : (env.error && env.error.details) || {};
    const counts = data.counts || {};
    return { ok: Boolean(env.ok), errors: counts.errors ?? "", warnings: counts.warnings ?? "" };
  } catch {
    return { ok: false, errors: "", warnings: "" };
  }
}

// One run: a fresh work folder, the agent, the grade. Returns the CSV row (an object).
function runOnce(fixture, agent, run, options = {}) {
  const work = fs.mkdtempSync(path.join(options.tmp || os.tmpdir(), `bench-${fixture.name}-${run}-`));
  if (fixture.start && fs.existsSync(fixture.start)) fs.cpSync(fixture.start, work, { recursive: true });
  const env = {
    ...process.env,
    BENCH_REQUEST: fixture.request,
    BENCH_WORKDIR: work,
    BENCH_FIXTURE: fixture.name,
    BENCH_RUN: String(run),
    ROYASCAFF_BIN: ENGINE_BIN,
    ...(fixture.reference ? { BENCH_REFERENCE: fixture.reference } : {}),
  };
  const started = new Date();
  const t0 = Date.now();
  const r = spawnSync(agent, { cwd: work, shell: true, env, encoding: "utf8", timeout: options.timeoutMs || 30 * 60 * 1000, maxBuffer: 256 * 1024 * 1024 });
  const ms = Date.now() - t0;
  const timedOut = Boolean(r.error && r.error.code === "ETIMEDOUT");
  // spawnSync stops the shell on a timeout, but on Windows the agent it started can live on: stop the whole tree.
  if (timedOut && process.platform === "win32" && r.pid) spawnSync("taskkill", ["/pid", String(r.pid), "/T", "/F"], { stdio: "ignore" });
  if (options.log) fs.writeFileSync(path.join(options.log, `${fixture.name}-${run}.log`), `${r.stdout || ""}\n${r.stderr || ""}`);
  let checks = null;
  if (fixture.grade === "script") {
    const gradeFile = path.join(fixture.dir, "grade.cjs");
    try {
      checks = require(gradeFile).grade(work, { request: fixture.request });
    } catch (error) {
      checks = { "grader ran": false, [`grader error: ${String(error.message).slice(0, 80)}`]: false };
    }
  }
  const names = checks ? Object.keys(checks) : [];
  const passed = names.filter((n) => checks[n]).length;
  const score = names.length ? Math.round((passed / names.length) * 100) : "";
  const v = validateOf(work);
  const row = {
    date: (options.date || started.toISOString().slice(0, 10)),
    fixture: fixture.name,
    run,
    agent: options.agentName || agent,
    started: started.toISOString(),
    ms,
    agent_exit: timedOut ? "" : r.status,
    timed_out: timedOut ? "yes" : "no",
    validate_ok: v.ok === "" ? "" : v.ok ? "yes" : "no",
    validate_errors: v.errors,
    validate_warnings: v.warnings,
    checks_passed: names.length ? passed : "",
    checks_total: names.length ? names.length : "",
    score,
    grade: score === "" ? "manual" : letter(score),
    failed_checks: names.filter((n) => !checks[n]).join("; "),
  };
  if (!options.keep) {
    try {
      fs.rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      // A temp folder that cannot be removed right now is not a failed run.
    }
  } else row.workdir = work;
  return row;
}

// N runs of one fixture. Appends to bench/results/<date>.csv (the header is written once).
function runBench({ fixture: name, agent, runs = 3, outDir, date, timeoutMs, keep = false, root = ROOT, tmp, agentName }) {
  if (!agent) throw new Error('An agent command is needed: --agent "<command>"');
  if (!Number.isInteger(runs) || runs < 1) throw new Error("--runs must be a whole number of at least 1");
  const fixture = readFixture(name, root);
  const day = date || new Date().toISOString().slice(0, 10);
  const dir = outDir || path.join(root, "results");
  fs.mkdirSync(dir, { recursive: true });
  const logs = path.join(dir, "logs", day);
  fs.mkdirSync(logs, { recursive: true });
  const file = path.join(dir, `${day}.csv`);
  const rows = [];
  for (let i = 1; i <= runs; i += 1) {
    const row = runOnce(fixture, agent, i, { date: day, timeoutMs, keep, tmp, log: logs, agentName });
    rows.push(row);
    if (!fs.existsSync(file)) fs.writeFileSync(file, `${COLUMNS.join(",")}\n`);
    fs.appendFileSync(file, `${csvLine(row)}\n`);
  }
  return { file, rows, summary: summarize(rows) };
}

const median = (xs) => {
  const s = xs.filter((x) => typeof x === "number").sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function summarize(rows) {
  const scored = rows.filter((r) => r.score !== "");
  const med = median(scored.map((r) => Number(r.score)));
  return { runs: rows.length, scored: scored.length, median_score: med, median_grade: med === null ? "manual" : letter(med), timed_out: rows.filter((r) => r.timed_out === "yes").length, median_ms: median(rows.map((r) => Number(r.ms))) };
}

// A readable report of a results file: per fixture and agent, the median score and grade.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; } else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; } else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

function report(file) {
  const rows = parseCsv(fs.readFileSync(file, "utf8")).map((r) => ({ ...r, score: r.score === "" ? "" : Number(r.score), ms: Number(r.ms) }));
  const groups = new Map();
  for (const r of rows) {
    const k = `${r.fixture} | ${r.agent}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  const lines = [`Benchmark report: ${path.basename(file)} (${rows.length} run(s))`, ""];
  for (const [k, g] of groups) {
    const s = summarize(g);
    lines.push(`${k}: ${s.runs} run(s), median score ${s.median_score === null ? "n/a (manual grading)" : `${s.median_score} (${s.median_grade})`}, median time ${s.median_ms === null ? "n/a" : `${(s.median_ms / 1000).toFixed(1)}s`}${s.timed_out ? `, ${s.timed_out} timed out` : ""}`);
  }
  return lines.join("\n");
}

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    o[key] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  return o;
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.report) {
    process.stdout.write(`${report(String(o.report))}\n`);
    return;
  }
  if (!o.fixture || !o.agent) {
    process.stdout.write('Usage: node bench/run.cjs --fixture <name> --agent "<command>" [--runs 3] [--out DIR] [--timeout-min 30] [--keep]\n       node bench/run.cjs --report <results.csv>\n');
    process.exitCode = 2;
    return;
  }
  const out = runBench({ fixture: String(o.fixture), agent: String(o.agent), runs: o.runs ? Number(o.runs) : 3, outDir: o.out ? String(o.out) : undefined, timeoutMs: o["timeout-min"] ? Number(o["timeout-min"]) * 60000 : undefined, keep: Boolean(o.keep) });
  process.stdout.write(`${out.rows.length} run(s) written to ${out.file}\n${report(out.file)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { runBench, runOnce, readFixture, report, summarize, parseCsv, letter, COLUMNS, csvLine };
