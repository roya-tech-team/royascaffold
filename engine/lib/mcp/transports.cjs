"use strict";

// The two MCP transports (plan file 03 §2): stdio (newline-delimited JSON-RPC) and streamable HTTP
// (one endpoint, always a bearer token). Built on node:http and node:crypto only.

const fs = require("fs");
const http = require("http");
const crypto = require("crypto");
const readline = require("readline");
const { rpcError } = require("./server.cjs");

// ---- stdio: one JSON message per line on stdin; answers on stdout. Nothing else may go to stdout.
function serveStdio(server, io = {}) {
  const input = io.input || process.stdin;
  const output = io.output || process.stdout;
  const session = server.newSession("stdio");
  const send = (msg) => output.write(`${JSON.stringify(msg)}\n`);
  session.push = send;
  const rl = readline.createInterface({ input });
  const pending = new Set();
  rl.on("line", (line) => {
    if (!line.trim()) return;
    let body;
    try {
      body = JSON.parse(line);
    } catch {
      return send(rpcError(null, -32700, "Parse error"));
    }
    const p = server.handleBody(session, body).then((out) => {
      if (out !== undefined) send(out);
    }).finally(() => pending.delete(p));
    pending.add(p);
  });
  return new Promise((resolve) => {
    rl.on("close", async () => {
      await Promise.all([...pending]);
      server.stop();
      resolve();
    });
  });
}

// ---- HTTP
function parseListen(spec) {
  // ":7410", "7410", "127.0.0.1:7410", "0.0.0.0:7410", ":0" (a free port)
  const s = String(spec === true ? ":7410" : spec);
  const m = /^(?:(.*):)?(\d+)$/.exec(s);
  if (!m) throw Object.assign(new Error(`--http must look like :7410 or 127.0.0.1:7410 (got "${s}")`), { code: "INVALID_INPUT" });
  return { host: m[1] || "127.0.0.1", port: Number(m[2]) };
}

// The token: --token-file (created with a random token when missing), else ROYASCAFF_MCP_TOKEN, else a random one.
function loadToken(tokenFile) {
  if (tokenFile) {
    if (fs.existsSync(tokenFile)) {
      const t = fs.readFileSync(tokenFile, "utf8").trim();
      if (t.length < 16) throw Object.assign(new Error(`${tokenFile} holds a token shorter than 16 characters`), { code: "INVALID_INPUT" });
      return { token: t, source: "file", generated: false };
    }
    const t = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(tokenFile, `${t}\n`, { mode: 0o600 });
    return { token: t, source: "file", generated: true };
  }
  if (process.env.ROYASCAFF_MCP_TOKEN) {
    if (process.env.ROYASCAFF_MCP_TOKEN.length < 16) throw Object.assign(new Error("ROYASCAFF_MCP_TOKEN is shorter than 16 characters"), { code: "INVALID_INPUT" });
    return { token: process.env.ROYASCAFF_MCP_TOKEN, source: "env", generated: false };
  }
  return { token: crypto.randomBytes(32).toString("hex"), source: "random", generated: true };
}

const digest = (s) => crypto.createHash("sha256").update(String(s)).digest();
const tokenOk = (given, token) => crypto.timingSafeEqual(digest(given), digest(token));
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

function serveHttp(server, { host, port, token, log = () => {} }) {
  const sessions = new Map();
  const json = (res, status, body, headers = {}) => {
    res.writeHead(status, { "Content-Type": "application/json", ...headers });
    res.end(JSON.stringify(body));
  };

  const handler = (req, res) => {
    const url = new URL(req.url, "http://x");
    if (url.pathname !== "/mcp") return json(res, 404, { error: "Not found: the MCP endpoint is /mcp" });
    // 1. The token, before anything else is looked at.
    const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "");
    if (!m || !tokenOk(m[1].trim(), token)) return json(res, 401, { error: "A valid bearer token is required" }, { "WWW-Authenticate": 'Bearer realm="royascaff"' });
    // 2. A browser page on another origin must not drive the server (DNS rebinding).
    if (req.headers.origin && !LOCAL_ORIGIN.test(req.headers.origin)) return json(res, 403, { error: "Origin not allowed" });

    const sid = req.headers["mcp-session-id"];
    let session = null;
    if (sid) {
      session = sessions.get(String(sid));
      if (!session) return json(res, 404, { error: "Unknown session: initialize again" });
    }

    if (req.method === "DELETE") {
      if (session) {
        sessions.delete(session.id);
        server.sessions.delete(session);
      }
      res.writeHead(200);
      return res.end();
    }

    if (req.method === "GET") {
      if (!session) return json(res, 400, { error: "Mcp-Session-Id is required to open the event stream" });
      if (!/text\/event-stream/.test(req.headers.accept || "")) return json(res, 406, { error: "Accept: text/event-stream" });
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
      res.write(": open\n\n");
      session.push = (msg) => res.write(`event: message\ndata: ${JSON.stringify(msg)}\n\n`);
      const beat = setInterval(() => res.write(": keep-alive\n\n"), 15000);
      req.on("close", () => {
        clearInterval(beat);
        if (session.push) session.push = null;
      });
      return undefined;
    }

    if (req.method !== "POST") return json(res, 405, { error: "Use POST, GET or DELETE" }, { Allow: "POST, GET, DELETE" });

    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 4 * 1024 * 1024) {
        json(res, 413, { error: "Body too large" });
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", async () => {
      if (res.writableEnded) return;
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return json(res, 400, rpcError(null, -32700, "Parse error"));
      }
      const isInit = (x) => x && x.method === "initialize";
      let headers = {};
      if (!session) {
        // A client that skipped the session header shares one anonymous session; initialize opens a real one.
        if (Array.isArray(body) ? body.some(isInit) : isInit(body)) {
          const id = crypto.randomUUID();
          session = server.newSession(id);
          sessions.set(id, session);
          headers = { "Mcp-Session-Id": id };
        } else {
          session = sessions.get("anonymous") || (sessions.set("anonymous", server.newSession("anonymous")), sessions.get("anonymous"));
        }
      }
      const out = await server.handleBody(session, body);
      if (out === undefined) {
        res.writeHead(202, headers);
        return res.end();
      }
      return json(res, 200, out, headers);
    });
    return undefined;
  };

  const httpServer = http.createServer(handler);
  return new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, host, () => {
      const addr = httpServer.address();
      log(`listening on http://${addr.address.includes(":") ? `[${addr.address}]` : addr.address}:${addr.port}/mcp`);
      resolve({ httpServer, port: addr.port, host: addr.address, close: () => new Promise((r) => { server.stop(); httpServer.closeAllConnections?.(); httpServer.close(() => r()); }) });
    });
  });
}

module.exports = { serveStdio, serveHttp, parseListen, loadToken, tokenOk };
