"use strict";

// Contract v1, work package E0.5: a golden file per command (tests/golden/contract/<command>.json).
// A golden holds the real --json envelope of each scenario in tests/contract-scenarios.cjs with the
// machine-specific parts (temp folders, the engine version, the clock) replaced by placeholders.
// A change to any golden is a change of the contract: read docs/CONTRACT.md before accepting it.
// To rewrite them after a deliberate change:  ROYASCAFF_UPDATE_GOLDEN=1 npm test

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const contract = require("../lib/contract.cjs");
const { runAll } = require("./contract-scenarios.cjs");

const GOLDEN = path.join(__dirname, "golden", "contract");
const ENGINE_DIR = path.join(__dirname, "..");
const slash = (s) => s.replace(/\\/g, "/");

function normalizer(ctx) {
  const places = [[ctx.root, "<root>"], [ctx.old, "<old>"], [ctx.fresh, "<fresh>"], [ctx.tmp, "<tmp>"], [ENGINE_DIR, "<engine>"], [require("os").tmpdir(), "<tmpdir>"]]
    .map(([from, to]) => [slash(path.resolve(from)), to])
    .sort((a, b) => b[0].length - a[0].length);
  const text = (s) => {
    let out = slash(s);
    for (const [from, to] of places) out = out.split(from).join(to);
    return out.split(contract.ENGINE_VERSION).join("<engine-version>").replace(/\d{8}T\d{6}Z/g, "<stamp>");
  };
  const walk = (v, key) => {
    if (typeof v === "string") return text(v);
    if (typeof v === "number" && /^(hours|ms|avg_ms|median_hours|max_hours|approx_tokens)$/.test(key || "")) return "<varies>";
    if (Array.isArray(v)) return v.map((x) => walk(x, key));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    return v;
  };
  return (envelope) => walk(envelope);
}

const goldenText = (rows) => `${JSON.stringify(rows, null, 2)}\n`;

test("each command's --json output equals its golden file (contract/<command>.json)", () => {
  const { ctx, results } = runAll();
  const norm = normalizer(ctx);
  const byCommand = new Map();
  for (const r of results) {
    if (!byCommand.has(r.command)) byCommand.set(r.command, []);
    byCommand.get(r.command).push({ scenario: r.name, exit: r.status, envelope: norm(r.envelope) });
  }
  assert.deepEqual([...byCommand.keys()].sort(), [...contract.COMMANDS].sort(), "a golden for every command");
  if (process.env.ROYASCAFF_UPDATE_GOLDEN === "1") {
    fs.mkdirSync(GOLDEN, { recursive: true });
    for (const [command, rows] of byCommand) fs.writeFileSync(path.join(GOLDEN, `${command}.json`), goldenText(rows));
  }
  for (const [command, rows] of byCommand) {
    const file = path.join(GOLDEN, `${command}.json`);
    assert.ok(fs.existsSync(file), `tests/golden/contract/${command}.json is missing (ROYASCAFF_UPDATE_GOLDEN=1 writes it)`);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), JSON.parse(goldenText(rows)), `${command}: output differs from its golden file`);
  }
  const files = fs.readdirSync(GOLDEN).map((f) => f.replace(/\.json$/, "")).sort();
  assert.deepEqual(files, [...contract.COMMANDS].sort(), "no golden for a command that no longer exists");
});
