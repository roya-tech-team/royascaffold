"use strict";

// Two hand-written MCP clients for the tests (no SDK): one over stdio, one over streamable HTTP. Both keep a
// log of every call they make, which is how the acceptance test proves "no repository scanning".

const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");
const { BIN, env } = require("./contract-scenarios.cjs");

class BaseClient {
  constructor(kind) {
    this.kind = kind;
    this.log = []; // { method, name?, uri? }
    this.notifications = [];
  }

  async initialize(name = "test-client") {
    const r = await this.request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name, version: "0" } });
    await this.notify("notifications/initialized");
    return r;
  }

  async callTool(name, args = {}) {
    const res = await this.request("tools/call", { name, arguments: args });
    return res.structuredContent;
  }

  async readResource(uri) {
    const res = await this.request("resources/read", { uri });
    return res.contents[0];
  }

  note(method, params) {
    this.log.push({ method, ...(method === "tools/call" ? { name: params.name } : {}), ...(method === "resources/read" || method === "resources/subscribe" ? { uri: params.uri } : {}) });
  }

  async waitFor(predicate, ms = 15000) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const hit = this.notifications.find(predicate);
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error(`no matching notification in ${ms} ms: ${JSON.stringify(this.notifications)}`);
  }
}

class StdioClient extends BaseClient {
  constructor(root, extraEnv = {}) {
    super("stdio");
    this.child = spawn(process.execPath, [BIN, "mcp", root], { env: { ...env, ...extraEnv } });
    this.nextId = 1;
    this.waiting = new Map();
    this.stderr = "";
    this.child.stderr.on("data", (d) => { this.stderr += d; });
    readline.createInterface({ input: this.child.stdout }).on("line", (line) => {
      const msg = JSON.parse(line); // every stdout line must be a JSON-RPC message
      if (msg.id !== undefined && this.waiting.has(msg.id)) {
        this.waiting.get(msg.id)(msg);
        this.waiting.delete(msg.id);
      } else this.notifications.push(msg);
    });
  }

  raw(msg) {
    this.child.stdin.write(`${JSON.stringify(msg)}\n`);
  }

  request(method, params) {
    this.note(method, params || {});
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.waiting.set(id, (msg) => (msg.error ? reject(Object.assign(new Error(msg.error.message), { rpc: msg.error })) : resolve(msg.result)));
      this.raw({ jsonrpc: "2.0", id, method, params });
    });
  }

  async notify(method, params) {
    this.raw({ jsonrpc: "2.0", method, params });
  }

  async close() {
    this.child.stdin.end();
    await new Promise((r) => { this.child.on("close", r); setTimeout(r, 3000); });
    this.child.kill();
  }
}

class HttpClient extends BaseClient {
  constructor(url, token) {
    super("http");
    this.url = url;
    this.token = token;
    this.nextId = 1;
    this.session = null;
  }

  static async start(root, { token, tokenFile, logFile } = {}) {
    const args = [BIN, "mcp", root, "--http", "127.0.0.1:0", ...(tokenFile ? ["--token-file", tokenFile] : [])];
    const child = spawn(process.execPath, args, { env: { ...env, ...(token ? { ROYASCAFF_MCP_TOKEN: token } : {}), ...(logFile ? { ROYASCAFF_MCP_LOG: logFile } : {}) } });
    let stderr = "";
    const port = await new Promise((resolve, reject) => {
      child.stderr.on("data", (d) => {
        stderr += d;
        const m = /listening on http:\/\/[^:]+:(\d+)\/mcp/.exec(stderr);
        if (m) resolve(Number(m[1]));
      });
      child.on("close", () => reject(new Error(`mcp --http exited: ${stderr}`)));
      setTimeout(() => reject(new Error(`mcp --http did not start: ${stderr}`)), 15000);
    });
    const readToken = tokenFile ? fs.readFileSync(tokenFile, "utf8").trim() : token;
    const client = new HttpClient(`http://127.0.0.1:${port}/mcp`, readToken);
    client.child = child;
    return client;
  }

  headers(extra = {}) {
    return { "Content-Type": "application/json", Accept: "application/json, text/event-stream", Authorization: `Bearer ${this.token}`, ...(this.session ? { "Mcp-Session-Id": this.session } : {}), ...extra };
  }

  async post(body, headers) {
    return fetch(this.url, { method: "POST", headers: this.headers(headers), body: JSON.stringify(body) });
  }

  async request(method, params) {
    this.note(method, params || {});
    const res = await this.post({ jsonrpc: "2.0", id: this.nextId++, method, params });
    if (method === "initialize" && res.headers.get("mcp-session-id")) this.session = res.headers.get("mcp-session-id");
    const msg = await res.json();
    if (msg.error) throw Object.assign(new Error(msg.error.message), { rpc: msg.error });
    return msg.result;
  }

  async notify(method, params) {
    const res = await this.post({ jsonrpc: "2.0", method, params });
    if (res.status !== 202) throw new Error(`a notification must get 202, got ${res.status}`);
  }

  // Opens the server-to-client event stream (GET) and collects its messages into `notifications`.
  async openStream() {
    this.abort = new AbortController();
    const res = await fetch(this.url, { method: "GET", headers: this.headers({ Accept: "text/event-stream" }), signal: this.abort.signal });
    if (res.status !== 200) throw new Error(`GET stream: ${res.status}`);
    (async () => {
      const dec = new TextDecoder();
      let buf = "";
      try {
        for await (const chunk of res.body) {
          buf += dec.decode(chunk, { stream: true });
          let i;
          while ((i = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, i);
            buf = buf.slice(i + 2);
            const data = block.split("\n").filter((l) => l.startsWith("data: ")).map((l) => l.slice(6)).join("\n");
            if (data) this.notifications.push(JSON.parse(data));
          }
        }
      } catch {
        // aborted
      }
    })();
  }

  async close() {
    if (this.abort) this.abort.abort();
    this.child.kill();
    await new Promise((r) => { this.child.on("close", r); setTimeout(r, 3000); });
  }
}

const tmpFile = (name) => path.join(fs.mkdtempSync(path.join(os.tmpdir(), "rs-mcp-")), name);

module.exports = { StdioClient, HttpClient, tmpFile };
