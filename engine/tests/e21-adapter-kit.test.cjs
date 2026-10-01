"use strict";

// E2.1: the adapter kit: a JSON Schema for manifests, `adapter new`, `adapter test`, and docs/ADAPTERS.md.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const kit = require("../lib/adapterkit.cjs");
const adapters = require("../lib/adapters.cjs");
const { validate } = require("../lib/schema.cjs");

const ENGINE = path.join(__dirname, "..");
const BIN = path.join(ENGINE, "bin", "royascaff.cjs");
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ENGINE, "contract", "schemas", "adapter.schema.json"), "utf8"));
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e21-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const cli = (args) => { const r = spawnSync(process.execPath, [BIN, ...args, "--json"], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } }); return { status: r.status, env: JSON.parse(r.stdout) }; };

test("the schema accepts every adapter the engine ships, and refuses typos and bad shapes", () => {
  for (const n of adapters.KNOWN()) {
    const m = JSON.parse(fs.readFileSync(path.join(adapters.DIR, `${n}.json`), "utf8"));
    assert.deepEqual(validate(SCHEMA, m), [], n);
  }
  assert.match(validate(SCHEMA, { adapter: "x", chekcs: {} }).join(), /unexpected property "chekcs"/);
  assert.match(validate(SCHEMA, { checks: {} }).join(), /matches none of the allowed shapes/, "a name is required");
  assert.match(validate(SCHEMA, { adapter: "X" }).join(), /does not match/);
  assert.match(validate(SCHEMA, { adapter: "x", checks: { unit: 5 } }).join(), /checks\.unit/);
  assert.match(validate(SCHEMA, { adapter: "x", personCheck: { kind: "playtest" } }).join(), /missing required "bar"/);
  assert.match(validate(SCHEMA, { adapter: "x", personLook: { kinds: ["feature"], minRisk: "huge" } }).join(), /not one of low, medium, high, critical/);
});

test("adapter new makes a manifest and a card in project/adapters/ from a template, and refuses to overwrite", () => {
  const root = copy();
  const r = kit.newAdapter(root, "my-stack", { includes: "node" });
  assert.deepEqual(r.files, ["project/adapters/my-stack.json", "project/adapters/my-stack.md"]);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "project/adapters/my-stack.json"), "utf8"));
  assert.deepEqual([manifest.adapter, manifest.includes], ["my-stack", ["node"]]);
  assert.deepEqual(validate(SCHEMA, manifest), []);
  assert.match(fs.readFileSync(path.join(root, "project/adapters/my-stack.md"), "utf8"), /## Design[\s\S]*## Rules[\s\S]*## Check[\s\S]*## Words/);
  assert.equal(adapters.KNOWN(path.join(root, "project")).includes("my-stack"), true);
  assert.throws(() => kit.newAdapter(root, "my-stack"), (e) => e.code === "ALREADY_EXISTS");
  assert.throws(() => kit.newAdapter(root, "Bad Name"), (e) => e.code === "INVALID_INPUT");
  assert.throws(() => kit.newAdapter(root, "other", { includes: "nope" }), (e) => e.code === "UNKNOWN_ID" && /Unknown adapter to include: nope/.test(e.message));
});

test("A5 (first half): a new adapter passes adapter test without any edit", () => {
  const root = copy();
  kit.newAdapter(root, "my-stack", { includes: "web-ui" });
  const r = kit.testAdapter(root, "my-stack");
  assert.equal(r.ok, true, JSON.stringify(r.checks.filter((c) => !c.ok)));
  assert.deepEqual(r.checks.map((c) => c.id), ["schema", "name", "includes", "card", "words", "budget", "declares-checks"]);
  assert.match(r.checks.find((c) => c.id === "includes").message, /includes resolve: web-ui/);
});

test("adapter test names what is wrong: schema, name, includes, empty card, budget, a program that does not exist, a dry run that fails", () => {
  const root = copy();
  const dir = path.join(root, "project", "adapters");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "bad.json"), JSON.stringify({ adapter: "other", includes: ["ghost"], chekcs: {}, checks: { unit: "no-such-program-xyz --run", e2e: { run: "node -e 0", dry: "node -e \"process.exit(3)\"" }, smoke: "node -e 0" }, smoke: { template: "missing.mjs", command: "node nothing.mjs" } }));
  fs.writeFileSync(path.join(dir, "bad.md"), `# Adapter · bad\n\n## Design\n\n(none)\n\n## Rules\n\n- ${"a long rule ".repeat(220)}\n\n## Check\n\n- ok\n`);
  const r = kit.testAdapter(root, "bad");
  assert.equal(r.ok, false);
  const bad = Object.fromEntries(r.checks.filter((c) => !c.ok).map((c) => [c.id, c.message]));
  assert.match(bad.schema, /unexpected property "chekcs"/);
  assert.match(bad.name, /says its name is "other" but the file is bad\.json/);
  assert.match(bad.includes, /includes that do not resolve: ghost/);
  assert.match(bad.card, /real content in: Design/);
  assert.match(bad.budget, /about \d+ of 600 tokens: shorten it/);
  assert.match(bad["check:unit"], /its program was not found: no-such-program-xyz --run/);
  assert.match(bad["check:e2e"], /dry run failed \(exit 3\)/);
  assert.match(bad["smoke-template"], /missing\.mjs/);
  assert.equal(r.checks.find((c) => c.id === "check:smoke").ok, true, "node resolves");
  assert.throws(() => kit.testAdapter(root, "ghost"), (e) => e.code === "UNKNOWN_ID");
});

test("every adapter the engine ships passes its own adapter test (the heavy checks aside)", () => {
  for (const n of adapters.KNOWN()) {
    const r = kit.testAdapter(null, n);
    const bad = r.checks.filter((c) => !c.ok && !/^check:/.test(c.id));
    assert.deepEqual(bad, [], n);
  }
});

test("the CLI: adapter new, adapter test and the failure envelope for a failed test (CHECK_FAILED)", () => {
  const root = copy();
  const made = cli(["adapter", "new", "web-game", "--includes", "web-3d", "--path", root]);
  assert.equal(made.status, 0, JSON.stringify(made.env));
  assert.deepEqual([made.env.command, made.env.data.name, made.env.data.includes], ["adapter", "web-game", ["web-3d"]]);
  const ok = cli(["adapter", "test", "web-game", "--path", root]);
  assert.equal(ok.status, 0, JSON.stringify(ok.env));
  assert.equal(ok.env.data.ok, true);
  fs.writeFileSync(path.join(root, "project/adapters/web-game.json"), JSON.stringify({ adapter: "web-game", checks: { unit: "no-such-program-xyz" } }));
  const bad = cli(["adapter", "test", "web-game", "--path", root]);
  assert.equal(bad.status, 1);
  assert.equal(bad.env.error.code, "CHECK_FAILED");
  assert.ok(bad.env.error.missing.some((m) => /no-such-program-xyz/.test(m)));
  assert.equal(bad.env.error.details.ok, false);
  assert.equal(cli(["adapter", "oops", "--path", root]).env.error.code, "INVALID_INPUT");
  assert.equal(cli(["adapter", "new", "web-game", "--path", root]).env.error.code, "ALREADY_EXISTS");
});

test("docs/ADAPTERS.md: its worked examples (web-game, godot) are valid manifests and pass the checks that do not need their tools", () => {
  const doc = fs.readFileSync(path.join(ENGINE, "docs", "ADAPTERS.md"), "utf8");
  const blocks = [...doc.matchAll(/<!-- example: ([\w.-]+) -->\n```(?:json|md)\n([\s\S]*?)\n```/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(blocks.map(([n]) => n), ["web-game.json", "web-game.md", "godot.json", "godot.md"]);
  const root = copy();
  const dir = path.join(root, "project", "adapters");
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, text] of blocks) fs.writeFileSync(path.join(dir, name), `${text}\n`);
  for (const name of ["web-game", "godot"]) {
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), "utf8"));
    assert.deepEqual(validate(SCHEMA, manifest), [], name);
    const r = kit.testAdapter(root, name);
    const failing = r.checks.filter((c) => !c.ok).map((c) => c.id);
    assert.deepEqual(failing.filter((id) => !/^check:/.test(id)), [], `${name}: ${JSON.stringify(r.checks.filter((c) => !c.ok))}`);
    assert.equal(r.checks.find((c) => c.id === "budget").ok, true);
  }
  // godot is not installed here: the run says so; web-game's checks resolve (node, npx).
  assert.match(kit.testAdapter(root, "godot").checks.find((c) => c.id === "check:unit").message, /godot/);
  assert.equal(kit.testAdapter(root, "web-game").checks.find((c) => c.id === "check:e2e").ok, true);
  // The doc names every manifest field the schema knows.
  for (const field of Object.keys(SCHEMA.properties)) if (!["name", "visualBar", "legacyAppTypes", "description"].includes(field)) assert.ok(doc.includes(`\`${field}\``), `${field} is explained in ADAPTERS.md`);
});
