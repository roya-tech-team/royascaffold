"use strict";

// Contract v1, work package E0.2: the envelope, the error codes, `contract --json`.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { validate } = require("./schema-lite.cjs");
const contract = require("../lib/contract.cjs");

const ROOT = path.join(__dirname, "..");
const BIN = path.join(ROOT, "bin", "royascaff.cjs");
const pkg = require("../package.json");
const errorsFile = JSON.parse(fs.readFileSync(path.join(ROOT, "contract", "errors.json"), "utf8"));
const envelopeSchema = JSON.parse(fs.readFileSync(path.join(ROOT, "contract", "schemas", "envelope.schema.json"), "utf8"));

const copy = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-contract-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  return root;
};
const run = (args) => spawnSync(process.execPath, [BIN, ...args], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } });

test("contract --json prints the contract version, the engine version, the commands and the adapters", () => {
  const r = run(["contract", "--json"]);
  assert.equal(r.status, 0, r.stderr);
  const env = JSON.parse(r.stdout);
  assert.deepEqual(validate(envelopeSchema, env), []);
  assert.equal(env.contract, contract.CONTRACT_VERSION);
  assert.equal(env.contract, "1.0");
  assert.equal(env.engine, pkg.version);
  assert.equal(env.ok, true);
  assert.equal(env.command, "contract");
  for (const c of ["contract", "status", "next", "advance", "validate", "export"]) assert.ok(env.data.commands.includes(c), `commands lists ${c}`);
  for (const a of ["generic", "web-ui", "web-api", "node"]) assert.ok(env.data.adapters.includes(a), `adapters lists ${a}`);
  assert.deepEqual(env.data.error_codes, Object.keys(errorsFile.codes));
});

test("contract without --json is readable text and also succeeds", () => {
  const r = run(["contract"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Contract 1\.0/);
  assert.match(r.stdout, new RegExp(pkg.version.replace(/\./g, "\\.")));
});

test("contract/errors.json is the published copy of the table in lib/contract.cjs", () => {
  assert.equal(fs.readFileSync(path.join(ROOT, "contract", "errors.json"), "utf8").replace(/\r\n/g, "\n"), contract.errorsFileText(), "run: node -e \"require('./lib/contract.cjs').writeErrorsFile()\"");
});

test("errors.json: every code has an exit status and a description, and the envelope schema allows exactly these codes", () => {
  const codes = Object.keys(errorsFile.codes);
  for (const code of ["NOT_A_PROJECT", "UNKNOWN_ID", "GATE_REFUSED", "HUMAN_REQUIRED", "STALE_APPROVAL", "OUTSIDE_PATHS", "CHECK_FAILED", "VERSION_MISMATCH", "INVALID_INPUT", "INTERNAL"]) {
    assert.ok(codes.includes(code), `${code} is listed`);
  }
  for (const code of codes) {
    assert.match(code, /^[A-Z][A-Z_]+$/);
    assert.ok([1, 2].includes(errorsFile.codes[code].exit), `${code} exit`);
    assert.ok(errorsFile.codes[code].description.length > 10, `${code} description`);
  }
  assert.deepEqual([...envelopeSchema.definitions.error.properties.code.enum].sort(), [...codes].sort());
});

test("the failure envelope: ok false, a stable code, the message, and what is missing; the exit status is not zero", () => {
  const root = copy();
  const r = run(["show", "CAP-404", "--json", "--path", root]);
  assert.equal(r.status, 1);
  const env = JSON.parse(r.stdout);
  assert.deepEqual(validate(envelopeSchema, env), []);
  assert.equal(env.ok, false);
  assert.equal(env.command, "show");
  assert.equal(env.error.code, "UNKNOWN_ID");
  assert.match(env.error.message, /CAP-404/);

  const none = run(["status", "--json", "--path", path.join(os.tmpdir(), "rs-no-such-folder-xyz")]);
  assert.equal(none.status, 1);
  assert.equal(JSON.parse(none.stdout).error.code, "NOT_A_PROJECT");

  const unknown = run(["frobnicate", "--json"]);
  assert.equal(unknown.status, 2);
  const u = JSON.parse(unknown.stdout);
  assert.equal(u.error.code, "UNKNOWN_COMMAND");
  assert.deepEqual(validate(envelopeSchema, u), []);
});

test("without --json a failure still prints the plain message on stderr and nothing on stdout", () => {
  const root = copy();
  const r = run(["show", "CAP-404", "--path", root]);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, "");
  assert.match(r.stderr, /CAP-404 not found/);
});

test("classify: real engine messages map to stable codes", () => {
  const cases = [
    ["No RoyaScaff project found in /x (expected a project/ folder or 1.3 knowledge zones)", "NOT_A_PROJECT"],
    ["Path does not exist: /x", "NOT_A_PROJECT"],
    ["CAP-404 not found", "UNKNOWN_ID"],
    ["TASK-X-001 is not a task in this project", "UNKNOWN_ID"],
    ["CHG-X-001 is not a change in this project", "UNKNOWN_ID"],
    ["SLC-X-001 is not a slice on the roadmap", "UNKNOWN_ID"],
    ["Approval must come from a person, not \"ai:claude\". Run it yourself, or pass --by <your name>.", "HUMAN_REQUIRED"],
    ["A person's look is confirmed in a terminal: run this command yourself in a terminal and answer the prompt (an AI tool cannot)", "HUMAN_REQUIRED"],
    ["SLC-X-001 needs refinement: only a person confirms it (they run royascaff open SLC-X-001 --confirm-refinement)", "HUMAN_REQUIRED"],
    ["The project is changed since it was approved: finish the discovery", "STALE_APPROVAL"],
    ["CAP-X-001 changed since its plan was approved: a person reviews it", "STALE_APPROVAL"],
    ["TASK-X-001 changed files outside its allowed paths (apps/web/**): apps/api/x.ts.", "OUTSIDE_PATHS"],
    ["TASK-X-001 is not marked done: quick checks failed.\n--- test (npm test) ---\nboom", "CHECK_FAILED"],
    ["This project is already on RoyaScaff 1.4 (profile.md has royascaff: 1.4)", "VERSION_MISMATCH"],
    ["Unknown source version \"9\" (use --from 1.3 or --from 1.2)", "VERSION_MISMATCH"],
    ["The project is not ready for approval:\n  - 3 questions are open\n  - the brief is empty", "GATE_REFUSED"],
    ["Approve the project first (discovery, brief, architecture, stack): royascaff approve project", "GATE_REFUSED"],
    ["CHG-X-001 is draft: tasks run only when it is ready or in progress (royascaff advance CHG-X-001 --to ready)", "GATE_REFUSED"],
    ["Usage: royascaff context <TASK-…> [path] [--save] [--out FILE]", "INVALID_INPUT"],
    ["Risk must be one of: low, medium, high, critical", "INVALID_INPUT"],
    ["Say what was done: royascaff record … \"<note>\"", "INVALID_INPUT"],
    ["docs/architecture.md already exists: edit it", "ALREADY_EXISTS"],
    ["something nobody planned for", "INTERNAL"],
  ];
  for (const [message, code] of cases) assert.equal(contract.classify(new Error(message)).code, code, message);
});

test("classify: an explicit code on the error wins, and bullet lines become `missing`", () => {
  const explicit = Object.assign(new Error("whatever"), { code: "OUTSIDE_PATHS" });
  assert.equal(contract.classify(explicit).code, "OUTSIDE_PATHS");
  const bad = Object.assign(new Error("whatever"), { code: "NOT_IN_THE_LIST" });
  assert.equal(contract.classify(bad).code, "INTERNAL");
  const gate = contract.classify(new Error("The project is not ready for approval:\n  - 3 questions are open\n  - the brief is empty"));
  assert.deepEqual(gate.missing, ["3 questions are open", "the brief is empty"]);
});

test("ok() and failure() build valid envelopes; unknown fields are refused by the schema", () => {
  const good = contract.ok("status", { x: 1 }, { warnings: ["w"], events: ["EVT-1"] });
  assert.deepEqual(validate(envelopeSchema, good), []);
  assert.deepEqual(good.data, { x: 1 });
  const bad = contract.failure("advance", new Error("CHG-X-001 is not a change in this project"));
  assert.deepEqual(validate(envelopeSchema, bad), []);
  assert.equal(bad.ok, false);
  assert.equal("data" in bad, false);
  assert.ok(validate(envelopeSchema, { ...good, extra: true }).length > 0);
  assert.ok(validate(envelopeSchema, { ...bad, ok: true }).length > 0, "ok:true must carry data and no error");
});

test("the command list matches the commands the CLI dispatches", () => {
  const source = fs.readFileSync(BIN, "utf8");
  const dispatched = [...source.matchAll(/^\s{4}case "([a-z]+)":/gm)].map((m) => m[1]);
  assert.deepEqual([...new Set(dispatched)].sort(), [...contract.COMMANDS].sort());
});

test("the package ships contract/ and the schemas are valid JSON", () => {
  assert.ok(pkg.files.includes("contract"));
  assert.equal(envelopeSchema.type, "object");
});
