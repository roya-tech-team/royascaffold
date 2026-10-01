"use strict";

// Contract v1, work package E0.3: every command speaks --json in the contract envelope, and what
// it returns in `data` validates against its own schema in contract/schemas/<command>.schema.json.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { validate } = require("./schema-lite.cjs");
const contract = require("../lib/contract.cjs");
const { runAll, call, copyFixture } = require("./contract-scenarios.cjs");

const SCHEMAS = path.join(__dirname, "..", "contract", "schemas");
const schemaOf = (name) => JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.schema.json`), "utf8"));
const envelopeSchema = schemaOf("envelope");

let ran = null;
const all = () => (ran = ran || runAll());

test("every command has a schema file for its data", () => {
  for (const command of contract.COMMANDS) {
    const name = contract.schemaName(command);
    assert.ok(fs.existsSync(path.join(SCHEMAS, `${name}.schema.json`)), `contract/schemas/${name}.schema.json`);
    const s = schemaOf(name);
    assert.match(s.$id, new RegExp(`/${name}\\.schema\\.json$`));
    assert.ok(s.anyOf || s.type, `${command}: the schema says what the data is`);
  }
});

test("every command is exercised with --json, and its real output validates (envelope and data)", () => {
  const { results } = all();
  const seen = new Set(results.map((r) => r.command));
  for (const command of contract.COMMANDS) assert.ok(seen.has(command), `a scenario for ${command}`);
  for (const r of results) {
    const where = `${r.name}\n${r.stdout.slice(0, 400)}${r.stderr}`;
    assert.ok(r.envelope, `${r.name}: stdout is one JSON envelope\n${where}`);
    assert.deepEqual(validate(envelopeSchema, r.envelope), [], `${r.name}: envelope`);
    assert.equal(r.envelope.command, r.command, `${r.name}: command`);
    assert.equal(r.envelope.contract, contract.CONTRACT_VERSION);
    assert.equal(r.envelope.engine, contract.ENGINE_VERSION);
    if (r.expect === "ok") {
      assert.equal(r.envelope.ok, true, `${r.name} should succeed\n${where}`);
      assert.equal(r.status, 0, `${r.name}: exit status`);
      assert.deepEqual(validate(schemaOf(contract.schemaName(r.command)), r.envelope.data), [], `${r.name}: data against ${contract.schemaName(r.command)}.schema.json`);
    } else {
      assert.equal(r.envelope.ok, false, `${r.name} should fail\n${where}`);
      assert.equal(r.envelope.error.code, r.expect, `${r.name}: error code`);
      assert.equal(r.status, contract.exitFor(r.expect), `${r.name}: exit status`);
    }
  }
});

test("a gate refusal returned as a result is an envelope failure: GATE_REFUSED, with what is missing and the full result", () => {
  const r = all().results.find((x) => x.name === "advance (a gate refuses)");
  assert.equal(r.status, 1);
  assert.equal(r.envelope.ok, false);
  assert.equal(r.envelope.error.code, "GATE_REFUSED");
  assert.ok(r.envelope.error.missing.length > 0, "missing lists what must be done first");
  assert.ok(r.envelope.error.missing.every((m) => typeof m === "string" && m.length > 0));
  assert.equal(r.envelope.error.details.reached, "draft");
  assert.deepEqual(validate(schemaOf("advance"), r.envelope.error.details), [], "details is the advance result");
  assert.equal("data" in r.envelope, false);
});

test("a failed check is CHECK_FAILED with the result in details; a failed validation lists the errors", () => {
  const r = all().results.find((x) => x.name === "check --result fail");
  assert.equal(r.envelope.error.code, "CHECK_FAILED");
  assert.equal(r.envelope.error.details.result, "fail");

  const root = copyFixture("greenfield");
  const f = path.join(root, "project", "knowledge", "02-requirements", "requirements.md");
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("**Verified by:** TEST-CAMP-001", "**Verified by:** TEST-CAMP-999"));
  const bad = call(["validate", root]);
  assert.equal(bad.status, 1);
  assert.equal(bad.envelope.ok, false);
  assert.equal(bad.envelope.error.code, "CHECK_FAILED");
  assert.ok(bad.envelope.error.missing.some((m) => /TEST-CAMP-999/.test(m)), "missing names the broken link");
  assert.ok(bad.envelope.error.details.counts.errors > 0);
  assert.deepEqual(validate(schemaOf("validate"), bad.envelope.error.details), []);
});

test("a command that writes events lists them in the envelope: stable EVT IDs that `events` returns", () => {
  const root = copyFixture("greenfield");
  const opened = call(["open", "--kind", "chore", "Tidy the styles", root]);
  assert.equal(opened.envelope.ok, true);
  assert.ok(opened.envelope.events.length >= 1, "the call wrote at least one event");
  for (const id of opened.envelope.events) assert.match(id, /^EVT-/);
  const log = call(["events", root, "--change", opened.envelope.data.id]);
  assert.deepEqual(log.envelope.data.events.map((e) => e.id), opened.envelope.events);
  assert.equal(call(["status", root]).envelope.events.length, 0, "a read-only call writes none");
});

test("usage mistakes with --json are INVALID_INPUT envelopes (exit 2), not stray text", () => {
  const root = copyFixture("greenfield");
  for (const args of [["trace"], ["show"], ["context"], ["advance"], ["cache", "oops"], ["render"]]) {
    const r = call([...args, "--path", root]);
    assert.ok(r.envelope, `${args[0]}: an envelope\n${r.stdout}${r.stderr}`);
    assert.equal(r.envelope.ok, false);
    assert.equal(r.envelope.error.code, "INVALID_INPUT", `${args[0]}: ${r.envelope.error.message}`);
    assert.equal(r.status, 2);
  }
});
