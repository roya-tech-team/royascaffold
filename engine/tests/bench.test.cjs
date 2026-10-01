"use strict";

// E4.2: the benchmark harness (bench/, outside the npm package) runs a fixture through an agent command N times
// and writes a CSV. Tested with a scripted fake agent: no model is involved.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const BENCH = path.join(__dirname, "..", "..", "bench");
const present = fs.existsSync(path.join(BENCH, "run.cjs"));
const skip = present ? false : "bench/ is not in this checkout";
const FAKE = `node "${path.join(BENCH, "agents", "fake-agent.cjs")}"`;
const out = () => fs.mkdtempSync(path.join(os.tmpdir(), "rs-bench-"));

test("three runs of the CLI fixture with a perfect fake agent: three rows, every check passes", { skip }, () => {
  const { runBench, COLUMNS, parseCsv } = require(path.join(BENCH, "run.cjs"));
  const dir = out();
  const r = runBench({ fixture: "cli", agent: FAKE, runs: 3, outDir: dir, date: "2026-10-01", agentName: "fake-good" });
  assert.equal(r.file, path.join(dir, "2026-10-01.csv"));
  assert.equal(r.rows.length, 3);
  const rows = parseCsv(fs.readFileSync(r.file, "utf8"));
  assert.equal(rows.length, 3);
  assert.deepEqual(Object.keys(rows[0]), COLUMNS);
  for (const [i, row] of rows.entries()) {
    assert.deepEqual([row.fixture, row.run, row.agent, row.agent_exit, row.timed_out, row.date], ["cli", String(i + 1), "fake-good", "0", "no", "2026-10-01"]);
    assert.equal(row.checks_passed, row.checks_total);
    assert.equal(row.score, "100");
    assert.equal(row.grade, "A");
    assert.equal(row.failed_checks, "");
  }
  assert.ok(Number(rows[0].checks_total) >= 15, "one check per rule of the request");
  assert.deepEqual([r.summary.runs, r.summary.median_score, r.summary.median_grade], [3, 100, "A"]);
});

test("a broken fake agent loses the checks it breaks; the CSV names them; a second call appends rows under one header", { skip }, () => {
  const { runBench, parseCsv, report } = require(path.join(BENCH, "run.cjs"));
  const dir = out();
  runBench({ fixture: "cli", agent: `${FAKE} broken`, runs: 2, outDir: dir, date: "2026-10-02", agentName: "fake-broken" });
  const r = runBench({ fixture: "cli", agent: FAKE, runs: 1, outDir: dir, date: "2026-10-02", agentName: "fake-good" });
  const text = fs.readFileSync(r.file, "utf8");
  assert.equal(text.split("\n").filter((l) => l.startsWith("date,")).length, 1, "one header");
  const rows = parseCsv(text);
  assert.equal(rows.length, 3);
  const broken = rows.filter((x) => x.agent === "fake-broken");
  for (const row of broken) {
    assert.ok(Number(row.score) < 100 && Number(row.score) >= 60, `score ${row.score}`);
    assert.match(row.failed_checks, /an empty title is refused with Title is required and exit 1/);
    assert.match(row.failed_checks, /ids are never reused/);
  }
  const rep = report(r.file);
  assert.match(rep, /cli \| fake-broken: 2 run\(s\), median score \d+ \(/);
  assert.match(rep, /cli \| fake-good: 1 run\(s\), median score 100 \(A\)/);
});

test("an agent that writes nothing scores zero; an agent that fails is recorded with its exit status; a hang times out", { skip }, () => {
  const { runBench } = require(path.join(BENCH, "run.cjs"));
  const dir = out();
  const none = runBench({ fixture: "cli", agent: `${FAKE} nothing`, runs: 1, outDir: dir, date: "2026-10-03" });
  assert.deepEqual([none.rows[0].score, none.rows[0].grade, none.rows[0].failed_checks], [0, "F", "todo.cjs exists"]);
  const env = process.env.BENCH_FAKE_FAIL_RUN;
  process.env.BENCH_FAKE_FAIL_RUN = "2";
  try {
    const mixed = runBench({ fixture: "cli", agent: FAKE, runs: 2, outDir: dir, date: "2026-10-04" });
    assert.deepEqual(mixed.rows.map((x) => [x.agent_exit, x.score]), [[0, 100], [3, 0]]);
  } finally {
    if (env === undefined) delete process.env.BENCH_FAKE_FAIL_RUN;
    else process.env.BENCH_FAKE_FAIL_RUN = env;
  }
  const hung = runBench({ fixture: "cli", agent: `${FAKE} hang`, runs: 1, outDir: dir, date: "2026-10-05", timeoutMs: 1500 });
  assert.deepEqual([hung.rows[0].timed_out, hung.rows[0].agent_exit], ["yes", ""]);
});

test("the harness is configurable: any agent command, any fixture; unknown fixtures and missing agents are refused", { skip }, () => {
  const { runBench, readFixture } = require(path.join(BENCH, "run.cjs"));
  assert.throws(() => runBench({ fixture: "nope", agent: FAKE, outDir: out() }), /Unknown fixture "nope" \(known: cli, web-3d-network\)/);
  assert.throws(() => runBench({ fixture: "cli", outDir: out() }), /An agent command is needed/);
  assert.throws(() => runBench({ fixture: "cli", agent: FAKE, runs: 0, outDir: out() }), /--runs must be a whole number/);
  // The 3D network fixture is a pointer to the existing prompt: manual grading, no script.
  const fx = readFixtureSafe(readFixture);
  assert.equal(fx.grade, "manual");
});

function readFixtureSafe(readFixture) {
  try {
    return readFixture("web-3d-network");
  } catch (error) {
    // The prompt lives in a sibling checkout (tools/3d-network); without it the pointer says where to look.
    assert.match(error.message, /check out the sibling folder tools\/3d-network/);
    return { grade: JSON.parse(fs.readFileSync(path.join(BENCH, "fixtures", "web-3d-network", "fixture.json"), "utf8")).grade };
  }
}

test("the command line: --report prints a summary; no arguments print the usage and exit 2", { skip }, () => {
  const dir = out();
  const run = spawnSync(process.execPath, [path.join(BENCH, "run.cjs"), "--fixture", "cli", "--agent", FAKE, "--runs", "1", "--out", dir], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /1 run\(s\) written to .*\.csv/);
  assert.match(run.stdout, /cli \| .*: 1 run\(s\), median score 100 \(A\)/);
  const file = fs.readdirSync(dir).find((f) => f.endsWith(".csv"));
  const rep = spawnSync(process.execPath, [path.join(BENCH, "run.cjs"), "--report", path.join(dir, file)], { encoding: "utf8" });
  assert.match(rep.stdout, /Benchmark report/);
  const usage = spawnSync(process.execPath, [path.join(BENCH, "run.cjs")], { encoding: "utf8" });
  assert.equal(usage.status, 2);
  assert.match(usage.stdout, /Usage: node bench\/run\.cjs/);
});

test("bench/ is not in the npm package", () => {
  const files = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")).files;
  assert.equal(files.some((f) => /bench/.test(f)), false);
});
