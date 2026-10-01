#!/usr/bin/env node
"use strict";

// A scripted fake agent for testing the harness. It does what an agent would do, without a model:
// it reads the request path from the environment and writes a solution into the work folder.
//
//   node bench/agents/fake-agent.cjs            copy the fixture's reference solution (a perfect run)
//   node bench/agents/fake-agent.cjs broken     copy it, then break two rules (a partial run)
//   node bench/agents/fake-agent.cjs nothing    write nothing (an empty run)
//   node bench/agents/fake-agent.cjs hang       never finish (for the timeout)
//
// BENCH_FAKE_FAIL_RUN=2 makes that run number exit with status 3 after writing nothing.

const fs = require("fs");
const path = require("path");

const mode = process.argv[2] || "good";
const work = process.env.BENCH_WORKDIR || process.cwd();
const reference = process.env.BENCH_REFERENCE;

if (process.env.BENCH_FAKE_FAIL_RUN && process.env.BENCH_FAKE_FAIL_RUN === process.env.BENCH_RUN) process.exit(3);
if (mode === "hang") setInterval(() => {}, 1000);
else if (mode !== "nothing") {
  if (!reference || !fs.existsSync(reference)) {
    process.stderr.write("BENCH_REFERENCE is not set: this fixture has no reference solution\n");
    process.exit(2);
  }
  fs.cpSync(reference, work, { recursive: true });
  if (mode === "broken") {
    const f = path.join(work, "todo.cjs");
    let text = fs.readFileSync(f, "utf8");
    text = text.replace("Title is required. ", "").replace(/data\.next \+= 1;/, "data.next = data.tasks.length + 1;");
    fs.writeFileSync(f, text);
  }
  process.stdout.write(`fake agent (${mode}): wrote ${fs.readdirSync(work).join(", ")}\n`);
}
