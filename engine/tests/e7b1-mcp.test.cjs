"use strict";

// E7b.1: `royascaff mcp` (plan 03 §2–3). Tools return the SAME contract envelopes as the CLI (C5), resources, stdio and
// streamable HTTP with a bearer token, and `install` registers the server.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { validate } = require("./schema-lite.cjs");
const contract = require("../lib/contract.cjs");
const { call, copyFixture } = require("./contract-scenarios.cjs");
const { StdioClient, HttpClient, tmpFile } = require("./mcp-clients.cjs");
const { TOOLS, listTools } = require("../lib/mcp/tools.cjs");
const { install } = require("../lib/commands/setup.cjs");

const ROOT = path.join(__dirname, "..");
const SCHEMAS = path.join(ROOT, "contract", "schemas");
const schemaOf = (name) => JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.schema.json`), "utf8"));
const envelopeSchema = schemaOf("envelope");
const TOOL_NAMES = ["next_action", "get_context", "claim_task", "release_task", "task_start", "task_done", "run_verify", "record_evidence", "advance", "status", "show", "trace", "new_record", "request_approval"];

const norm = (env, root) => JSON.parse(JSON.stringify(env).split(root.replace(/\\/g, "\\\\")).join("<root>").split(root.replace(/\\/g, "/")).join("<root>").replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d{3})?Z/g, "<now>").replace(/fingerprint [0-9a-f]{12}/g, "fingerprint <fp>").replace(/"fingerprint":"[0-9a-f]+"/g, '"fingerprint":"<fp>"'));

test("every tool has an input schema in contract/schemas/mcp/ (and every schema has a tool); the 14 tools of the plan", () => {
  const files = fs.readdirSync(path.join(SCHEMAS, "mcp")).map((f) => f.replace(/\.json$/, "")).sort();
  assert.deepEqual(files, [...TOOL_NAMES].sort());
  assert.deepEqual(Object.keys(TOOLS).sort(), [...TOOL_NAMES].sort());
  for (const t of listTools()) {
    assert.equal(t.inputSchema.type, "object");
    assert.ok(t.description.length > 20, `${t.name}: a description`);
    assert.ok(Object.keys(t.inputSchema.properties).every((k) => typeof t.inputSchema.properties[k].type === "string" || t.inputSchema.properties[k].enum), `${t.name}: typed properties`);
    for (const r of t.inputSchema.required || []) assert.ok(r in t.inputSchema.properties, `${t.name}: required ${r} is a property`);
  }
  // Approvals are not tools: there is no way to approve through MCP.
  assert.equal(TOOL_NAMES.some((n) => /^approve|measure|confirm/.test(n)), false);
});

test("stdio: initialize, tools/list, ping, errors; every stdout line is a JSON-RPC message", async () => {
  const root = copyFixture("greenfield");
  const c = new StdioClient(root);
  try {
    const init = await c.initialize();
    assert.equal(init.protocolVersion, "2025-06-18");
    assert.deepEqual(Object.keys(init.capabilities).sort(), ["resources", "tools"]);
    assert.equal(init.capabilities.resources.subscribe, true);
    assert.equal(init.serverInfo.name, "royascaff");
    assert.equal(init.serverInfo.version, contract.ENGINE_VERSION);
    assert.equal((await c.request("initialize", { protocolVersion: "1999-01-01" })).protocolVersion, "2025-11-25", "an unknown version gets the newest the server speaks");
    assert.deepEqual(await c.request("ping"), {});
    const { tools } = await c.request("tools/list");
    assert.deepEqual(tools.map((t) => t.name).sort(), [...TOOL_NAMES].sort());
    await assert.rejects(c.request("tools/call", { name: "approve_change", arguments: {} }), (e) => e.rpc.code === -32602);
    await assert.rejects(c.request("nope/nothing"), (e) => e.rpc.code === -32601);
    // A bad call is a tool result with isError and a contract failure envelope, not a protocol error.
    const bad = await c.request("tools/call", { name: "get_context", arguments: {} });
    assert.equal(bad.isError, true);
    assert.equal(bad.structuredContent.error.code, "INVALID_INPUT");
    assert.deepEqual(validate(envelopeSchema, bad.structuredContent), []);
    assert.deepEqual(JSON.parse(bad.content[0].text), bad.structuredContent, "the text content is the same envelope");
    const dash = await c.request("tools/call", { name: "show", arguments: { id: "--path" } });
    assert.equal(dash.structuredContent.error.code, "INVALID_INPUT", "an ID that looks like an option is refused");
    const extra = await c.request("tools/call", { name: "next_action", arguments: { sneaky: 1 } });
    assert.equal(extra.structuredContent.error.code, "INVALID_INPUT", "unknown arguments are refused");
  } finally {
    await c.close();
  }
});

test("C5: for the same call, the MCP result is the CLI result, and it validates against the contract schemas", async () => {
  const rootA = copyFixture("greenfield");
  const stdio = new StdioClient(rootA);
  const rootCli = copyFixture("greenfield");
  const check = (tool, tokenEnv, mcpEnv, cliEnv) => {
    assert.deepEqual(validate(envelopeSchema, mcpEnv), [], `${tool}: envelope`);
    assert.equal(mcpEnv.contract, contract.CONTRACT_VERSION);
    if (mcpEnv.ok) assert.deepEqual(validate(schemaOf(contract.schemaName(mcpEnv.command)), mcpEnv.data), [], `${tool}: data against ${contract.schemaName(mcpEnv.command)}.schema.json`);
    assert.deepEqual(norm(mcpEnv, rootA), norm(cliEnv, rootCli), `${tool}: the CLI and MCP envelopes are identical`);
  };
  try {
    await stdio.initialize();
    // Same fixture, same sequence of calls on two copies: first by the CLI, then through MCP.
    const pairs = [
      ["next_action", {}, ["next"]],
      ["status", {}, ["status"]],
      ["show", { id: "REQ-CAMP-001" }, ["show", "REQ-CAMP-001"]],
      ["trace", { id: "CAP-CAMP-001" }, ["trace", "CAP-CAMP-001"]],
      ["get_context", { task: "TASK-CAMP-004" }, ["context", "TASK-CAMP-004"]],
      ["claim_task", { task: "TASK-CAMP-004", agent: "alpha", lease_minutes: 30 }, ["claim", "TASK-CAMP-004", "--agent", "ai:alpha", "--by", "ai:alpha", "--lease", "30"]],
      ["claim_task", { task: "TASK-CAMP-005", agent: "beta", paths: ["apps/web/src/calendar/x.ts"] }, ["claim", "TASK-CAMP-005", "--agent", "ai:beta", "--by", "ai:beta", "--paths", "apps/web/src/calendar/x.ts"]],
      ["release_task", { task: "TASK-CAMP-004", agent: "beta" }, ["claim", "TASK-CAMP-004", "--release", "--agent", "ai:beta", "--by", "ai:beta"]],
      ["release_task", { task: "TASK-CAMP-004", agent: "alpha" }, ["claim", "TASK-CAMP-004", "--release", "--agent", "ai:alpha", "--by", "ai:alpha"]],
      ["request_approval", { target: "CHG-CAMP-002", act: "approve-change", note: "Please look.", agent: "alpha" }, ["request-approval", "CHG-CAMP-002", "--act", "approve-change", "--note", "Please look.", "--by", "ai:alpha"]],
      ["new_record", { kind: "question", title: "Which colour for errors?", agent: "alpha" }, ["new", "record", "question", "Which colour for errors?", "--by", "ai:alpha"]],
      ["record_evidence", { change: "CHG-CAMP-002", kind: "unit", result: "pass", note: "npm test", metrics: { tests: 12 }, agent: "alpha" }, ["check", "CHG-CAMP-002", "--result", "pass", "--note", "[unit] npm test · metrics: tests=12", "--by", "ai:alpha"]],
      ["advance", { change: "CHG-CAMP-002", to: "closed", agent: "alpha" }, ["advance", "CHG-CAMP-002", "--to", "closed", "--by", "ai:alpha"]],
      ["task_start", { task: "TASK-CAMP-003", agent: "alpha" }, ["task", "TASK-CAMP-003", "start", "--note", "started through MCP", "--by", "ai:alpha"]],
      ["task_done", { task: "TASK-CAMP-004", note: "finished", agent: "alpha" }, ["task", "TASK-CAMP-004", "done", "--note", "finished", "--by", "ai:alpha"]],
    ];
    const seen = new Set();
    for (const [tool, args, cliArgs] of pairs) {
      const cli = call([...cliArgs, "--path", rootCli]);
      const res = await stdio.request("tools/call", { name: tool, arguments: args });
      assert.equal(res.isError, !res.structuredContent.ok);
      check(tool, null, res.structuredContent, cli.envelope);
      seen.add(`${tool}:${res.structuredContent.ok ? "ok" : res.structuredContent.error.code}`);
    }
    // The failures exercised include the new codes and a gate refusal.
    for (const code of ["CLAIM_CONFLICT", "NOT_CLAIM_HOLDER", "GATE_REFUSED"]) assert.ok([...seen].some((s) => s.endsWith(`:${code}`)), `a ${code} was compared`);
  } finally {
    await stdio.close();
  }
});

test("the same read call gives the same envelope over stdio and over HTTP", async () => {
  const root = copyFixture("greenfield");
  const stdio = new StdioClient(root);
  const http = await HttpClient.start(root, { token: "t".repeat(32) });
  try {
    await stdio.initialize("a");
    await http.initialize("b");
    for (const [tool, args] of [["next_action", {}], ["status", {}], ["show", { id: "REQ-CAMP-001" }]]) {
      assert.deepEqual(await stdio.callTool(tool, args), await http.callTool(tool, args), tool);
    }
  } finally {
    await stdio.close();
    await http.close();
  }
});

test("resources: records, the board, the architecture page, context packs and events", async () => {
  const root = copyFixture("greenfield");
  const c = new StdioClient(root);
  try {
    await c.initialize();
    const { resources } = await c.request("resources/list");
    const uris = resources.map((r) => r.uri);
    for (const u of ["royascaff://board", "royascaff://events", "royascaff://architecture", "royascaff://REQ-CAMP-001"]) assert.ok(uris.includes(u), `lists ${u}`);
    const { resourceTemplates } = await c.request("resources/templates/list");
    assert.ok(resourceTemplates.some((t) => t.uriTemplate === "royascaff://context/{task}"));
    // A record is what `show` says.
    const rec = await c.readResource("royascaff://REQ-CAMP-001");
    assert.equal(rec.mimeType, "application/json");
    assert.deepEqual(JSON.parse(rec.text), call(["show", "REQ-CAMP-001", "--path", root]).envelope);
    const board = await c.readResource("royascaff://board");
    assert.match(board.text, /CAP-CAMP-001/);
    const arch = await c.readResource("royascaff://architecture");
    assert.equal(arch.text, fs.readFileSync(path.join(root, "project", "knowledge", "04-design", "architecture.md"), "utf8"));
    const pack = await c.readResource("royascaff://context/TASK-CAMP-004");
    assert.match(pack.text, /apps\/web\/src\/calendar/);
    const ev = await c.readResource("royascaff://events");
    const all = call(["events", root]).envelope.data.events;
    assert.deepEqual(ev.text.trim().split("\n").map((l) => JSON.parse(l)), all.slice(-100));
    const since = await c.readResource(`royascaff://events?since=${all[all.length - 3].id}`);
    assert.equal(since.text.trim().split("\n").length, 2);
    await assert.rejects(c.request("resources/read", { uri: "royascaff://REQ-NOPE-999" }), (e) => e.rpc.code === -32002);
    await assert.rejects(c.request("resources/read", { uri: "file:///etc/passwd" }), (e) => e.rpc.code === -32002);
  } finally {
    await c.close();
  }
});

test("royascaff://events: subscribers get notifications/resources/updated when an event is written", async () => {
  const root = copyFixture("greenfield");
  const c = new StdioClient(root);
  try {
    await c.initialize();
    const lastBefore = call(["events", root]).envelope.data.last;
    await c.request("resources/subscribe", { uri: "royascaff://events" });
    await c.request("resources/subscribe", { uri: "royascaff://TASK-CAMP-004" });
    call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", root]);
    const n = await c.waitFor((m) => m.method === "notifications/resources/updated" && m.params.uri === "royascaff://events");
    assert.equal(n.jsonrpc, "2.0");
    assert.equal("id" in n, false, "a notification has no id");
    await c.waitFor((m) => m.params && m.params.uri === "royascaff://TASK-CAMP-004");
    // The client reads what is new from the resource.
    const before = c.notifications.length;
    const fresh = await c.readResource(`royascaff://events?since=${lastBefore}`);
    assert.ok(fresh.text.includes("claim.acquired"));
    await c.request("resources/unsubscribe", { uri: "royascaff://events" });
    assert.ok(c.notifications.length >= before);
  } finally {
    await c.close();
  }
});

test("HTTP: a bearer token is always required; wrong origins are refused; a session carries the calls", async () => {
  const root = copyFixture("greenfield");
  const token = "s3cret-".padEnd(40, "x");
  const c = await HttpClient.start(root, { token });
  try {
    const post = (headers) => fetch(c.url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }) });
    const none = await post({});
    assert.equal(none.status, 401);
    assert.match(none.headers.get("www-authenticate"), /Bearer/);
    assert.equal((await post({ Authorization: "Bearer wrong" })).status, 401);
    assert.equal((await post({ Authorization: `Basic ${token}` })).status, 401);
    assert.equal((await post({ Authorization: `Bearer ${token}`, Origin: "https://evil.example" })).status, 403);
    assert.equal((await post({ Authorization: `Bearer ${token}`, Origin: "http://localhost:3000" })).status, 200);
    assert.equal((await fetch(c.url.replace("/mcp", "/other"), { headers: { Authorization: `Bearer ${token}` } })).status, 404);
    assert.equal((await fetch(c.url, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })).status, 405);
    const bad = await fetch(c.url, { method: "POST", headers: c.headers(), body: "{nope" });
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error.code, -32700);

    const init = await c.initialize();
    assert.ok(c.session, "initialize opens a session");
    assert.equal(init.serverInfo.name, "royascaff");
    assert.equal((await post({ Authorization: `Bearer ${token}`, "Mcp-Session-Id": "nope" })).status, 404);
    const tools = await c.request("tools/list");
    assert.equal(tools.tools.length, 14);
    const next = await c.callTool("next_action");
    assert.equal(next.ok, true);
    assert.equal(next.command, "next");
  } finally {
    await c.close();
  }
});

test("HTTP: the token file is created when missing (and kept); a short token is refused; the event stream carries notifications", async () => {
  const root = copyFixture("greenfield");
  const tokenFile = tmpFile("token");
  const c = await HttpClient.start(root, { tokenFile });
  try {
    assert.ok(fs.existsSync(tokenFile));
    assert.ok(fs.readFileSync(tokenFile, "utf8").trim().length >= 32);
    await c.initialize();
    await c.openStream();
    await c.request("resources/subscribe", { uri: "royascaff://board" });
    call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", root]);
    const n = await c.waitFor((m) => m.method === "notifications/resources/updated" && m.params.uri === "royascaff://board");
    assert.equal(n.params.uri, "royascaff://board");
  } finally {
    await c.close();
  }
  const { spawnSync } = require("child_process");
  const short = tmpFile("short");
  fs.writeFileSync(short, "abc\n");
  const r = spawnSync(process.execPath, [path.join(ROOT, "bin", "royascaff.cjs"), "mcp", root, "--http", ":0", "--token-file", short], { encoding: "utf8", timeout: 20000 });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /shorter than 16/);
});

test("mcp --describe is a contract envelope listing the tools and resources; mcp outside a project is NOT_A_PROJECT", () => {
  const root = copyFixture("greenfield");
  const d = call(["mcp", "--describe", root]);
  assert.equal(d.envelope.ok, true);
  assert.deepEqual(d.envelope.data.tools.map((t) => t.name).sort(), [...TOOL_NAMES].sort());
  assert.deepEqual(d.envelope.data.transports, ["stdio", "http"]);
  const none = call(["mcp", "--describe", path.join(os.tmpdir(), "rs-no-such-folder-xyz")]);
  assert.equal(none.envelope.error.code, "NOT_A_PROJECT");
});

test("install registers the server in .mcp.json and .cursor/mcp.json; it asks before overwriting; no terminal means refuse", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-install-"));
  const r = install(repo, {});
  assert.deepEqual(r.mcp.map((m) => [m.tool, m.file, m.action]).sort(), [["claude", ".mcp.json", "created"], ["cursor", ".cursor/mcp.json", "created"]]);
  const claude = JSON.parse(fs.readFileSync(path.join(repo, ".mcp.json"), "utf8"));
  assert.equal(claude.mcpServers.royascaff.args[claude.mcpServers.royascaff.args.length - 1], "mcp");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(repo, ".cursor", "mcp.json"), "utf8")), claude);
  assert.deepEqual(install(repo, {}).mcp.map((m) => m.action), ["unchanged", "unchanged"]);
  // Other servers in the file are kept.
  claude.mcpServers.other = { command: "x", args: [] };
  fs.writeFileSync(path.join(repo, ".mcp.json"), JSON.stringify(claude));
  assert.equal(install(repo, { claude: true }).mcp[0].action, "unchanged");
  // A different royascaff entry: without a terminal nothing is overwritten (and nothing else is written either).
  const mine = { mcpServers: { royascaff: { command: "my-own", args: ["serve"] } } };
  fs.writeFileSync(path.join(repo, ".mcp.json"), JSON.stringify(mine));
  fs.rmSync(path.join(repo, ".claude"), { recursive: true, force: true });
  assert.throws(() => install(repo, { claude: true }), (e) => e.code === "ALREADY_EXISTS" && /no terminal/.test(e.message));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(repo, ".mcp.json"), "utf8")), mine);
  assert.equal(fs.existsSync(path.join(repo, ".claude")), false, "the skill was not installed either");
  const viaCli = call(["install", repo, "--claude"]);
  assert.equal(viaCli.envelope.error.code, "ALREADY_EXISTS");
  // A person who answers no keeps theirs; yes replaces it.
  assert.equal(install(repo, { claude: true, confirm: () => "no" }).mcp[0].action, "kept");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(repo, ".mcp.json"), "utf8")), mine);
  assert.equal(install(repo, { claude: true, confirm: () => "yes" }).mcp[0].action, "replaced");
  assert.equal(JSON.parse(fs.readFileSync(path.join(repo, ".mcp.json"), "utf8")).mcpServers.royascaff.command !== "my-own", true);
  // Broken JSON is never clobbered.
  fs.writeFileSync(path.join(repo, ".mcp.json"), "{ nope");
  assert.throws(() => install(repo, { claude: true }), (e) => e.code === "ALREADY_EXISTS" && /not valid JSON/.test(e.message));
  assert.equal(fs.readFileSync(path.join(repo, ".mcp.json"), "utf8"), "{ nope");
});
