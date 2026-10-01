#!/usr/bin/env node
"use strict";

// A SCRIPTED fake agent for the reference runner's tests (and a template for a real one). The runner starts it in the
// workspace with ROYASCAFF_BIN (the pinned engine) and ROYASCAFF_JOB_FILE (the job). It talks to the runner with JSON lines
// on stdout: {"type":"tool_use",…} and {"type":"cost","turns":N,"usd":X}; any other line is a log line.
//
//   fake-agent.cjs task    claim the job's task, start it, write a file inside the task's allowed paths, commit, finish it
//   fake-agent.cjs loop    never finishes: one more turn every 40 ms (the runner must stop it at max_turns)
//   fake-agent.cjs spend   each turn costs 0.4 USD (the runner must stop it at the budget)
//   fake-agent.cjs fail    exits with status 3

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const scenario = process.argv[2] || "task";
const job = JSON.parse(fs.readFileSync(process.env.ROYASCAFF_JOB_FILE, "utf8"));
const out = (o) => process.stdout.write(`${JSON.stringify(o)}\n`);
let turns = 0;
const turn = (usd) => out({ type: "cost", turns: ++turns, usd: Math.round(usd * 100) / 100, tokens: turns * 1000 });
const cli = (...args) => {
  const r = spawnSync(process.execPath, [process.env.ROYASCAFF_BIN, ...args, "--json", "--path", "."], { encoding: "utf8", env: { ...process.env, ROYASCAFF_NONINTERACTIVE: "1" } });
  let env = null;
  try {
    env = JSON.parse(r.stdout);
  } catch {
    // not JSON
  }
  out({ type: "tool_use", tool: `royascaff ${args[0]}`, input: { args }, summary: env ? (env.ok ? "ok" : `${env.error.code}: ${env.error.message}`.slice(0, 200)) : "no envelope" });
  return env;
};
const git = (...args) => spawnSync("git", args, { encoding: "utf8" });

async function main() {
  if (scenario === "fail") {
    process.stderr.write("the fake agent failed on purpose\n");
    process.exit(3);
  }
  if (scenario === "env") {
    out({ type: "log", text: `ENV ${JSON.stringify(Object.keys(process.env).sort())}` });
    return;
  }
  if (scenario === "loop") {
    for (;;) {
      turn(0.01 * turns);
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  if (scenario === "spend") {
    for (;;) {
      turn(0.4 * (turns + 1));
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  // task: the context pack names the paths the task may change; the agent never scans the repository.
  const me = "ai:runner-agent";
  const paths = /Change only files matching: `([^`]+)`/.exec(job.context_pack || "");
  if (!paths) throw new Error("the job's context pack names no allowed paths");
  turn(0.01);
  const claim = cli("claim", job.task, "--agent", me, "--by", me);
  if (!claim.ok) throw new Error(`claim: ${claim.error.message}`);
  turn(0.02);
  const start = cli("task", job.task, "start", "--note", "started by the runner's agent", "--by", me);
  if (!start.ok) throw new Error(`start: ${start.error.message}`);
  turn(0.03);
  const file = paths[1].replace(/\*\*$/, "table.js");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, "exports.reach = (campaign) => campaign.reach;\n");
  out({ type: "tool_use", tool: "write_file", input: { path: file } });
  git("add", "-A");
  git("commit", "-q", "-m", `${job.task}: reach table`);
  turn(0.04);
  const done = cli("task", job.task, "done", "--note", "reach table renders", "--by", me);
  if (!done.ok) throw new Error(`done: ${done.error.message}`);
  turn(0.05);
  out({ type: "log", text: "finished" });
}

main().catch((e) => {
  process.stderr.write(`${e.message}\n`);
  process.exit(1);
});
