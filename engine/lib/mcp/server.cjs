"use strict";

// The MCP server core (plan file 03 §2, M1–M3, M5): JSON-RPC 2.0 messages in, messages out, with no
// transport inside. stdio and HTTP (transports.cjs) feed it. No runtime dependencies.
//
// It speaks the initialization-based protocol versions (2024-11-05 to 2025-11-25) and also answers a request
// that comes without an initialize, so a client of the stateless revision works for the methods used here.

const fs = require("fs");
const path = require("path");
const contract = require("../contract.cjs");
const { findProject, listMarkdown } = require("../project.cjs");
const { watchEvents } = require("../follow.cjs");
const { listTools, callTool, runCli } = require("./tools.cjs");

const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const ID_RE = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
const INSTRUCTIONS = "RoyaScaff project server. Call next_action to learn what to do, get_context for a task's budgeted context (do not scan the repository), claim_task before you work, then task_start, task_done, run_verify, record_evidence and advance. Results are RoyaScaff contract envelopes: check `ok`, and on failure `error.code` and `error.missing`. Only people approve: request_approval asks them.";

const rpcError = (id, code, message, data) => ({ jsonrpc: "2.0", id: id === undefined ? null : id, error: { code, message, ...(data !== undefined ? { data } : {}) } });
const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });

function parseUri(uri) {
  const m = /^royascaff:\/\/([^?#]+)(?:\?([^#]*))?$/.exec(String(uri || ""));
  if (!m) return null;
  return { name: decodeURIComponent(m[1]), query: Object.fromEntries(new URLSearchParams(m[2] || "")) };
}

// A client session: its subscriptions and a way to push a notification to it (null when it cannot receive any).
class Session {
  constructor(id) {
    this.id = id;
    this.subscriptions = new Set();
    this.push = null;
  }
}

function createServer(opts) {
  const root = path.resolve(opts.root || ".");
  const project = findProject(root);
  const log = opts.log || (() => {});
  const sessions = new Set();
  let watcher = null;

  const text = (uri, body, mimeType) => ({ contents: [{ uri, mimeType, text: body }] });

  function architectureFile() {
    const f = listMarkdown(project).find((x) => /(^|\/)architecture\.md$/.test(x.rel));
    return f ? path.join(project.projectDir, f.rel) : null;
  }

  function recordIds() {
    const { buildModel } = require("../model/graph.cjs");
    const model = buildModel(root);
    return [...model.records.values()].map((r) => ({ id: r.id, title: r.title, kind: r.kind }));
  }

  function listResources() {
    const resources = [
      { uri: "royascaff://board", name: "board", title: "Status board", description: "The project status board (STATUS.md).", mimeType: "text/markdown" },
      { uri: "royascaff://events", name: "events", title: "Event stream", description: "The latest events as JSON lines. Subscribe to be told when it changes; read with ?since=EVT-… for what is new.", mimeType: "application/x-ndjson" },
    ];
    if (architectureFile()) resources.push({ uri: "royascaff://architecture", name: "architecture", title: "Architecture page", description: "The architecture layer document.", mimeType: "text/markdown" });
    for (const r of recordIds().slice(0, 500)) resources.push({ uri: `royascaff://${r.id}`, name: r.id, title: `${r.id} · ${r.title}`, description: `A ${r.kind} record (the same as show ${r.id} --json).`, mimeType: "application/json" });
    return resources;
  }

  const TEMPLATES = [
    { uriTemplate: "royascaff://{id}", name: "record", title: "A record", description: "Any record by ID: requirement, change, task, slice, feature, evidence …", mimeType: "application/json" },
    { uriTemplate: "royascaff://context/{task}", name: "context", title: "Context pack of a task", description: "The budgeted context pack of a task.", mimeType: "text/markdown" },
    { uriTemplate: "royascaff://events{?since}", name: "events-since", title: "Events since an event ID", description: "Events after the given event ID.", mimeType: "application/x-ndjson" },
  ];

  async function readResource(uri) {
    const u = parseUri(uri);
    if (!u) return null;
    if (u.name === "board") {
      const r = await runCli(["status", "--path", root]);
      return text(uri, r.stdout, "text/markdown");
    }
    if (u.name === "architecture") {
      const f = architectureFile();
      return f ? text(uri, fs.readFileSync(f, "utf8"), "text/markdown") : null;
    }
    if (u.name === "events") {
      const { eventsCommand } = require("../commands/views.cjs");
      const all = eventsCommand(root, u.query.since ? { since: u.query.since } : {}).events;
      const list = u.query.since ? all : all.slice(-100);
      return text(uri, list.map((e) => JSON.stringify(e)).join("\n") + (list.length ? "\n" : ""), "application/x-ndjson");
    }
    if (u.name.startsWith("context/")) {
      const task = u.name.slice("context/".length);
      if (!ID_RE.test(task)) return null;
      const r = await runCli(["context", task, "--path", root]);
      return r.status === 0 ? text(uri, r.stdout, "text/markdown") : null;
    }
    if (ID_RE.test(u.name)) {
      const r = await runCli(["show", u.name, "--json", "--path", root]);
      try {
        const env = JSON.parse(r.stdout);
        return env.ok ? text(uri, JSON.stringify(env), "application/json") : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Which resource URIs an event touches, for resources/updated notifications.
  const urisOf = (e) => ["royascaff://events", "royascaff://board", ...[e.target, e.change].filter((x) => x && ID_RE.test(x)).map((x) => `royascaff://${x}`)];

  function ensureWatcher() {
    if (watcher) return;
    watcher = watchEvents(project.projectDir, (events) => {
      const touched = new Set(events.flatMap(urisOf));
      for (const s of sessions) {
        if (!s.push) continue;
        for (const uri of touched) if (s.subscriptions.has(uri)) s.push({ jsonrpc: "2.0", method: "notifications/resources/updated", params: { uri } });
      }
    }, { intervalMs: opts.pollMs || 250 });
  }

  function newSession(id) {
    const s = new Session(id);
    sessions.add(s);
    return s;
  }

  async function dispatch(session, method, params) {
    switch (method) {
      case "initialize": {
        const wanted = params && params.protocolVersion;
        return { protocolVersion: PROTOCOLS.includes(wanted) ? wanted : PROTOCOLS[0], capabilities: { tools: { listChanged: false }, resources: { subscribe: true, listChanged: false } }, serverInfo: { name: "royascaff", title: "RoyaScaff", version: contract.ENGINE_VERSION }, instructions: INSTRUCTIONS };
      }
      case "ping":
        return {};
      case "tools/list":
        return { tools: listTools() };
      case "tools/call": {
        const name = params && params.name;
        const env = await callTool(root, name, (params && params.arguments) || {});
        if (!env) throw Object.assign(new Error(`Unknown tool: ${name}`), { rpc: -32602 });
        log({ kind: "tool", name, ok: env.ok });
        return { content: [{ type: "text", text: JSON.stringify(env) }], structuredContent: env, isError: !env.ok };
      }
      case "resources/list":
        return { resources: listResources() };
      case "resources/templates/list":
        return { resourceTemplates: TEMPLATES };
      case "resources/read": {
        const uri = params && params.uri;
        const out = await readResource(uri);
        if (!out) throw Object.assign(new Error(`Resource not found: ${uri}`), { rpc: -32002, data: { uri } });
        log({ kind: "resource", uri });
        return out;
      }
      case "resources/subscribe":
      case "resources/unsubscribe": {
        const uri = params && params.uri;
        if (!parseUri(uri)) throw Object.assign(new Error(`Not a royascaff:// resource: ${uri}`), { rpc: -32602 });
        if (method === "resources/subscribe") {
          session.subscriptions.add(uri);
          ensureWatcher();
        } else session.subscriptions.delete(uri);
        return {};
      }
      default:
        throw Object.assign(new Error(`Method not found: ${method}`), { rpc: -32601 });
    }
  }

  // One JSON-RPC message in; the response message out (undefined for notifications and responses).
  async function handle(session, msg) {
    if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0") return rpcError(msg && msg.id, -32600, "Invalid Request");
    if (msg.method === undefined) return undefined; // a response from the client: nothing to do
    const isRequest = msg.id !== undefined && msg.id !== null;
    if (!isRequest) {
      log({ kind: "notification", method: msg.method });
      return undefined; // notifications/initialized, notifications/cancelled, …
    }
    try {
      return rpcResult(msg.id, await dispatch(session, msg.method, msg.params));
    } catch (err) {
      return rpcError(msg.id, err.rpc || -32603, err.message, err.data);
    }
  }

  // Handles a parsed body that may be one message or a batch.
  async function handleBody(session, body) {
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map((m) => handle(session, m)))).filter((x) => x !== undefined);
      return out.length ? out : undefined;
    }
    return handle(session, body);
  }

  const stop = () => {
    if (watcher) watcher.stop();
    watcher = null;
  };

  return { root, project, newSession, handle, handleBody, stop, sessions, listResources, readResource, PROTOCOLS };
}

module.exports = { createServer, rpcError, rpcResult, PROTOCOLS, parseUri };
