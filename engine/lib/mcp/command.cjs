"use strict";

// `royascaff mcp [path] [--http :7410] [--token-file FILE] [--describe]` (plan file 03 §2).
// stdio by default; with --http, streamable HTTP that always needs a bearer token.

const contract = require("../contract.cjs");
const { createServer, PROTOCOLS } = require("./server.cjs");
const { serveStdio, serveHttp, parseListen, loadToken } = require("./transports.cjs");
const { listTools, TOOLS } = require("./tools.cjs");

const RESOURCES = ["royascaff://board", "royascaff://events", "royascaff://architecture", "royascaff://{id}", "royascaff://context/{task}"];

function describe(root) {
  return {
    server: { name: "royascaff", version: contract.ENGINE_VERSION, contract: contract.CONTRACT_VERSION, protocol_versions: PROTOCOLS },
    transports: ["stdio", "http"],
    project: String(root),
    tools: listTools().map((t) => ({ name: t.name, command: TOOLS[t.name].command, description: t.description })),
    resources: RESOURCES,
  };
}

// Returns data for --describe; otherwise starts serving and returns null (the process stays alive until the client leaves).
function runMcp(root, flags = {}) {
  const server = createServer({ root });
  if (flags.describe) {
    server.stop();
    return describe(server.root);
  }
  const say = (m) => process.stderr.write(`royascaff mcp: ${m}\n`);
  const done = (p) => p.catch((err) => {
    process.stderr.write(`royascaff mcp: ${err.message}\n`);
    process.exit(1);
  });
  if (flags.http !== undefined) {
    const { host, port } = parseListen(flags.http);
    const t = loadToken(flags["token-file"]);
    done(serveHttp(server, { host, port, token: t.token, log: say }).then(() => {
      if (t.generated && t.source === "file") say(`a new token was written to ${flags["token-file"]}`);
      if (t.source === "random") say(`bearer token (nothing was given, so this one is new): ${t.token}`);
      else if (t.source === "env") say("the bearer token comes from ROYASCAFF_MCP_TOKEN");
    }));
  } else {
    say(`serving ${server.root} on stdio`);
    done(serveStdio(server).then(() => process.exit(0)));
  }
  return null;
}

module.exports = { runMcp, describe };
