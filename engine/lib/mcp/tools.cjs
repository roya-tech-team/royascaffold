"use strict";

// The MCP tools (plan file 03 §3). Each tool is a thin wrapper that runs the SAME CLI command with --json and
// returns its contract envelope unchanged: one implementation, two doors. The tool's input schema is
// contract/schemas/mcp/<tool>.json.

const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const contract = require("../contract.cjs");
const { validate } = require("../schema.cjs");

const BIN = path.join(__dirname, "..", "..", "bin", "royascaff.cjs");
const SCHEMAS = path.join(__dirname, "..", "..", "contract", "schemas", "mcp");

const fail = (message) => Object.assign(new Error(message), { code: "INVALID_INPUT" });

// An ID or a title goes to the CLI as a positional word: a leading "-" would be read as an option.
const word = (v, what) => {
  const s = String(v);
  if (/^-/.test(s)) throw fail(`${what} must not start with "-"`);
  return s;
};

// Agents are never people: the engine records ai:<agent>, so no tool call can pass for a person.
const actor = (a) => {
  const name = String(a.agent || "mcp").trim() || "mcp";
  return /^ai(:|$)/i.test(name) ? name : `ai:${name}`;
};

// tool name -> { command (for the envelope's schema), argv(args) }
const TOOLS = {
  next_action: { command: "next", argv: () => ["next"] },
  get_context: { command: "context", argv: (a) => ["context", word(a.task, "task")] },
  claim_task: {
    command: "claim",
    argv: (a) => ["claim", word(a.task, "task"), "--agent", actor(a), "--by", actor(a), ...(a.lease_minutes !== undefined ? ["--lease", String(a.lease_minutes)] : []), ...(a.paths && a.paths.length ? ["--paths", a.paths.join(",")] : [])],
  },
  release_task: { command: "claim", argv: (a) => ["claim", word(a.task, "task"), "--release", "--agent", actor(a), "--by", actor(a)] },
  task_start: { command: "task", argv: (a) => ["task", word(a.task, "task"), "start", "--note", a.note || "started through MCP", "--by", actor(a)] },
  task_done: { command: "task", argv: (a) => ["task", word(a.task, "task"), "done", "--note", a.note, "--by", actor(a), ...(a.skip_checks ? ["--skip-checks", a.skip_checks] : [])] },
  run_verify: { command: "verify", argv: (a) => (a.quick ? ["check", word(a.change, "change"), "--quick", "--by", actor(a)] : ["verify", word(a.change, "change"), "--by", actor(a)]), commandFor: (a) => (a.quick ? "check" : "verify") },
  record_evidence: {
    command: "check",
    argv: (a) => {
      const metrics = a.metrics && Object.keys(a.metrics).length ? ` · metrics: ${Object.entries(a.metrics).map(([k, v]) => `${k}=${v}`).join(" ")}` : "";
      return ["check", word(a.change, "change"), "--result", a.result, "--note", `[${a.kind}] ${a.note}${metrics}`, "--by", actor(a)];
    },
  },
  advance: { command: "advance", argv: (a) => ["advance", word(a.change, "change"), "--to", a.to, ...(a.reason ? ["--reason", a.reason] : []), "--by", actor(a)] },
  status: { command: "status", argv: () => ["status"] },
  show: { command: "show", argv: (a) => ["show", word(a.id, "id")] },
  trace: { command: "trace", argv: (a) => ["trace", word(a.id, "id")] },
  new_record: {
    command: "new",
    argv: (a) => ["new", "record", word(a.kind, "kind"), word(a.title, "title"), ...Object.entries(a.fields || {}).flatMap(([k, v]) => [`--${k}`, String(v)]), "--by", actor(a)],
  },
  request_approval: {
    command: "request-approval",
    argv: (a) => ["request-approval", word(a.target, "target"), "--act", a.act, ...(a.note ? ["--note", a.note] : []), "--by", actor(a)],
  },
};

let LISTED = null;
// The tools as MCP lists them: name, description and inputSchema, from the schema files.
function listTools() {
  if (LISTED) return LISTED;
  LISTED = Object.keys(TOOLS).map((name) => {
    const schema = JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.json`), "utf8"));
    const { $schema, $id, title, description, ...inputSchema } = schema;
    return { name, title: name.replace(/_/g, " "), description, inputSchema: { type: "object", ...inputSchema } };
  });
  return LISTED;
}

function schemaOfTool(name) {
  return JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.json`), "utf8"));
}

// Runs the CLI (async, so the server keeps answering) and returns { stdout, stderr, status }.
function runCli(argv, extraEnv = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [BIN, ...argv], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, ROYASCAFF_NONINTERACTIVE: "1", ...extraEnv } }, (err, stdout, stderr) => {
      resolve({ stdout, stderr, status: err ? (typeof err.code === "number" ? err.code : 1) : 0 });
    });
  });
}

// Calls a tool; always resolves to a contract envelope (the CLI's own, or a failure envelope for a bad call).
async function callTool(root, name, args = {}) {
  const tool = TOOLS[name];
  if (!tool) return null;
  const cmd = tool.commandFor ? tool.commandFor(args || {}) : tool.command;
  try {
    const problems = validate(schemaOfTool(name), args || {});
    if (problems.length) throw fail(`Bad input for ${name}: ${problems.join("; ")}`);
    const argv = [...tool.argv(args || {}), "--json", "--path", root];
    const r = await runCli(argv);
    try {
      return JSON.parse(r.stdout);
    } catch {
      return contract.failure(cmd, new Error(`The engine gave no JSON envelope (exit ${r.status}): ${(r.stderr || r.stdout).trim().slice(0, 500)}`));
    }
  } catch (err) {
    return contract.failure(cmd, err);
  }
}

module.exports = { TOOLS, BIN, listTools, schemaOfTool, callTool, runCli, actor };
