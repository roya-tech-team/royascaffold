"use strict";

// E7b.4, acceptance C1 (plan 03 §8): two different MCP clients, over two different transports (stdio and streamable HTTP),
// each complete a slice through MCP only, with no repository scanning, measured by tool logs. The clients are written by hand
// (tests/mcp-clients.cjs): they have no way to read the repository except the calls the server offers. Two logs are kept:
// the client's own, and the server's (ROYASCAFF_MCP_LOG). Skill v2: the navigator names the tools and falls back to the CLI.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { validate } = require("./schema-lite.cjs");
const contract = require("../lib/contract.cjs");
const { readyProject } = require("./ready-project.cjs");
const { StdioClient, HttpClient, tmpFile } = require("./mcp-clients.cjs");
const { TOOLS } = require("../lib/mcp/tools.cjs");

const ROOT = path.join(__dirname, "..");
const envelopeSchema = JSON.parse(fs.readFileSync(path.join(ROOT, "contract", "schemas", "envelope.schema.json"), "utf8"));
const dataSchema = (command) => JSON.parse(fs.readFileSync(path.join(ROOT, "contract", "schemas", `${contract.schemaName(command)}.schema.json`), "utf8"));
const NO_AGENT = new Set(["next_action", "get_context", "status", "show", "trace"]); // the read-only tools take no agent
const ALLOWED_METHODS = new Set(["initialize", "notifications/initialized", "ping", "tools/list", "tools/call", "resources/list", "resources/read", "resources/templates/list", "resources/subscribe", "resources/unsubscribe"]);

// What an agent does for one slice. It uses nothing but `client` (MCP) and writes the code the task asks for, into the
// path the context pack names.
async function completeSlice(client, project, agent) {
  const call = async (tool, args = {}) => {
    const env = await client.callTool(tool, NO_AGENT.has(tool) ? args : { agent, ...args });
    assert.deepEqual(validate(envelopeSchema, env), [], `${tool}: a contract envelope`);
    if (env.ok) assert.deepEqual(validate(dataSchema(env.command), env.data), [], `${tool}: data matches the contract schema`);
    return env;
  };
  await client.initialize(`${client.kind}-client`);
  const { tools } = await client.request("tools/list");
  assert.equal(tools.length, 14);

  // 1. What to do: the project says so.
  const next = (await client.callTool("next_action")).data;
  assert.match(next.text, new RegExp(`Implement ${project.task}`), `next_action names the task: ${next.text}`);

  // 2. Take it, and read its budgeted context (not the repository).
  const claim = await call("claim_task", { task: project.task, lease_minutes: 30 });
  assert.equal(claim.ok, true, JSON.stringify(claim));
  assert.deepEqual(claim.data.paths, project.paths);
  const pack = (await call("get_context", { task: project.task })).data.text;
  const m = /Change only files matching: `([^`]+)`/.exec(pack);
  assert.ok(m, "the context pack names the paths the task may change");

  // 3. Work.
  assert.equal((await call("task_start", { task: project.task, note: "started through MCP" })).ok, true);
  const file = path.join(project.repo, m[1].replace(/\*\*$/, "table.js"));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, "exports.reach = (campaign) => campaign.reach;\n");
  const done = await call("task_done", { task: project.task, note: "reach table renders; no paging yet" });
  assert.equal(done.ok, true, JSON.stringify(done));
  assert.equal(done.data.state, "done");

  // 4. Prove and close. (No test command is configured in this fixture, so the full verify has nothing to run: it says so.)
  const verify = await call("run_verify", { change: project.change });
  assert.equal(verify.ok, false);
  assert.match(verify.error.message, /No commands to run/);
  assert.equal((await call("record_evidence", { change: project.change, kind: "unit", result: "pass", note: "the reach table renders in the unit tests", metrics: { tests: 3 } })).ok, true);
  const closed = await call("advance", { change: project.change, to: "closed" });
  assert.equal(closed.ok, true, JSON.stringify(closed));
  assert.equal(closed.data.reached, "closed");

  // 5. What is left is a person's: the agent asks, it cannot approve.
  const after = (await client.callTool("next_action")).data;
  assert.match(after.text, /Measure OUT-PORT-001/);
  const ask = await call("request_approval", { target: "OUT-PORT-001", act: "measure", note: "All features are done: was the outcome reached?" });
  assert.equal(ask.ok, true);
  assert.equal(ask.data.approved, false);
  const status = await call("status");
  assert.equal(status.data.changes.find((c) => c.id === project.change).stage, "closed");
  const rec = await client.readResource("royascaff://REQ-PORT-001");
  assert.equal(JSON.parse(rec.text).data.id, "REQ-PORT-001");
}

function audit(client, serverLogFile) {
  // The client's own log: nothing but MCP calls, and only the 14 tools, only royascaff:// resources.
  assert.ok(client.log.every((c) => ALLOWED_METHODS.has(c.method)), `${client.kind}: only MCP methods`);
  const names = client.log.filter((c) => c.method === "tools/call").map((c) => c.name);
  assert.ok(names.length >= 11, `${client.kind}: ${names.length} tool calls`);
  assert.ok(names.every((n) => n in TOOLS), `${client.kind}: only the royascaff tools`);
  for (const n of ["next_action", "claim_task", "get_context", "task_start", "task_done", "record_evidence", "advance", "status", "request_approval"]) assert.ok(names.includes(n), `${client.kind} used ${n}`);
  assert.ok(client.log.filter((c) => c.method === "resources/read").every((c) => /^royascaff:\/\//.test(c.uri)));
  // The server's log says the same, from its side: every call it served was one of these.
  const served = fs.readFileSync(serverLogFile, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  const serverTools = served.filter((e) => e.kind === "tool").map((e) => e.name);
  assert.deepEqual(serverTools, names, `${client.kind}: the server's tool log equals the client's`);
  assert.deepEqual(served.filter((e) => e.kind === "resource").map((e) => e.uri), client.log.filter((c) => c.method === "resources/read").map((c) => c.uri));
  assert.ok(served.filter((e) => e.kind === "request").every((e) => ALLOWED_METHODS.has(e.method)));
  return names;
}

test("C1: two MCP clients (stdio and streamable HTTP) each complete a slice through MCP only, with no repository scanning", async () => {
  const a = readyProject({ code: "PORT", closing: true });
  const b = readyProject({ code: "PORT", closing: true });
  const logA = tmpFile("server-a.jsonl");
  const logB = tmpFile("server-b.jsonl");
  const stdio = new StdioClient(a.repo, { ROYASCAFF_MCP_LOG: logA });
  const http = await HttpClient.start(b.repo, { token: "c1-token-".padEnd(40, "z"), logFile: logB });
  try {
    await Promise.all([completeSlice(stdio, a, "client-one"), completeSlice(http, b, "client-two")]);
    const namesA = audit(stdio, logA);
    const namesB = audit(http, logB);
    assert.deepEqual(namesA, namesB, "both clients walked the same slice with the same tools");
  } finally {
    await stdio.close();
    await http.close();
  }
  // The repository shows the work, recorded as the two agents (never as a person).
  for (const [p, who] of [[a, "ai:client-one"], [b, "ai:client-two"]]) {
    const log = fs.readFileSync(path.join(p.repo, "project", "changes", p.change, "log.md"), "utf8");
    assert.match(log, new RegExp(`claim\\.acquired[^\\n]*${who}`));
    assert.match(log, new RegExp(`task\\.done[^\\n]*${who}`));
    assert.match(log, /approval\.requested|change\.advanced/);
    assert.match(fs.readFileSync(path.join(p.repo, "project", "changes", p.change, "change.md"), "utf8"), /status: closed/);
    assert.equal(fs.existsSync(path.join(p.repo, "apps/web/src/results/table.js")), true);
  }
});

test("two agents on one project through MCP: the second claim is refused with the holder, and the work does not collide", async () => {
  const p = readyProject({ tasks: 2 });
  const first = new StdioClient(p.repo);
  const second = await HttpClient.start(p.repo, { token: "c2-token-".padEnd(40, "q") });
  try {
    await first.initialize("one");
    await second.initialize("two");
    const a = await first.callTool("claim_task", { task: p.tasks[0], agent: "one" });
    assert.equal(a.ok, true, JSON.stringify(a));
    // The same paths for the other agent: refused, with who holds them.
    const clash = await second.callTool("claim_task", { task: p.tasks[1], agent: "two", paths: [p.paths[0]] });
    assert.equal(clash.ok, false);
    assert.equal(clash.error.code, "CLAIM_CONFLICT");
    assert.equal(clash.error.details.holder, "ai:one");
    assert.deepEqual(clash.error.details.holder_paths, [p.paths[0]]);
    // Its own paths are free, and it cannot touch the other's task.
    assert.equal((await second.callTool("claim_task", { task: p.tasks[1], agent: "two" })).ok, true);
    const steal = await second.callTool("task_start", { task: p.tasks[0], agent: "two" });
    assert.equal(steal.error.code, "NOT_CLAIM_HOLDER");
    const rel = await second.callTool("release_task", { task: p.tasks[0], agent: "two" });
    assert.equal(rel.error.code, "NOT_CLAIM_HOLDER");
    assert.equal((await first.callTool("release_task", { task: p.tasks[0], agent: "one" })).data.released, true);
  } finally {
    await first.close();
    await second.close();
  }
});

test("skill v2: the navigator names the MCP tools (every one exists) and still works with the CLI alone", () => {
  const skill = fs.readFileSync(path.join(ROOT, "skill", "royascaff", "SKILL.md"), "utf8");
  const named = [...skill.matchAll(/`([a-z]+(?:_[a-z]+)+)`/g)].map((m) => m[1]).filter((n) => n !== "adapter_cards"); // a field of next_action, not a tool
  assert.ok(named.length >= 5, `tools are named: ${named}`);
  for (const n of named) assert.ok(n in TOOLS, `${n} is a tool`);
  for (const n of ["next_action", "claim_task", "get_context", "task_start", "task_done", "request_approval"]) assert.ok(named.includes(n), `${n} is in the skill`);
  assert.match(skill, /else the CLI/);
  assert.match(skill, /royascaff next --json/, "the CLI fallback stays");
  assert.match(skill, /CLAIM_CONFLICT/);
  const tokens = Math.ceil(skill.length / 4);
  assert.ok(tokens <= 400, `SKILL.md is ~${tokens} tokens`);
});
