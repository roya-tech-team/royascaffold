"use strict";

// Test helper: every `--json` result is a contract envelope. `unwrap` checks it and returns `data`.

const assert = require("node:assert/strict");

function parse(stdout) {
  return JSON.parse(stdout);
}

function unwrap(stdout) {
  const env = parse(stdout);
  assert.equal(env.ok, true, `expected a success envelope, got: ${stdout.slice(0, 300)}`);
  assert.equal(env.contract, "1.2");
  return env.data;
}

module.exports = { parse, unwrap };
