"use strict";

// Step 12c · WP-C4 (P5): acceptance tests first for must requirements (red, then green), and tests
// that call the code instead of reading it.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { evaluate, changeBody } = require("../lib/gates.cjs");
const { readsSource: readsWith, sourceReaders } = require("../lib/testsfirst.cjs");
const NODE_RULES = require("../lib/adapters.cjs").policyOf(["node"]).tests.readsSource;
const readsSource = (text) => readsWith(text, NODE_RULES); // the node adapter's manifest patterns

const AI = { by: "ai:claude" };

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-c4-"));
  fs.cpSync(path.join(__dirname, "fixtures", "greenfield"), root, { recursive: true });
  return root;
}
const edit = (root, rel, fn) => fs.writeFileSync(path.join(root, rel), fn(fs.readFileSync(path.join(root, rel), "utf8")));
const gate = (root, id, to, name) => {
  const model = buildModel(root);
  const change = model.changes.get(id);
  return evaluate({ model, status: deriveStatus(model), change, projectDir: model.root, body: changeBody(model.root, change) }, to).checks.find((c) => c.id === name);
};
const testCommand = (root, cmd) => edit(root, "project/profile.md", (t) => t.replace(/- \*\*Test:\*\* .*/, `- **Test:** ${cmd}`));

test("a must requirement without a runner test blocks the ready gate", () => {
  const root = project();
  let c = gate(root, "CHG-CAMP-002", "ready", "acceptance-tests");
  assert.equal(c.ok, false);
  assert.match(c.message, /no runner test verifies REQ-CAMP-003: royascaff new record test "<what it proves>" --verifies REQ-CAMP-003 --check runner:test/);
  newRecord(root, "test", "Calendar shows posts", { verifies: "REQ-CAMP-003", check: "manual" });
  assert.equal(gate(root, "CHG-CAMP-002", "ready", "acceptance-tests").ok, false, "a manual check is not a runner test");
  newRecord(root, "test", "Calendar renders posts", { verifies: "REQ-CAMP-003", check: "runner:test" });
  assert.equal(gate(root, "CHG-CAMP-002", "ready", "acceptance-tests").ok, true);
  assert.equal(gate(root, "CHG-CAMP-001", "ready", "acceptance-tests").ok, false, "CHG-CAMP-001 delivers must REQ-CAMP-002 without a test");
  const should = work.openSlice(root, "SLC-CAMP-002-B", { by: "islam", force: true, risk: "low" });
  assert.equal(gate(root, should.id, "ready", "acceptance-tests"), undefined, "should/could requirements need no tests first (H4)");
});

test("--red is refused when the tests pass and recorded when they fail", () => {
  const root = project();
  testCommand(root, "node -e 0");
  assert.throws(() => work.recordCheck(root, "CHG-CAMP-002", { red: true, ...AI }), /Tests already pass \(test ✓\) — they do not test the new behavior yet/);
  testCommand(root, "node -e \"process.exit(1)\"");
  const r = work.recordCheck(root, "CHG-CAMP-002", { red: true, ...AI });
  assert.equal(r.result, "red");
  const last = buildModel(root).changes.get("CHG-CAMP-002").events.pop();
  assert.deepEqual([last.event, last.note], ["check.red", "tests fail before the work: APP-CAMP-WEB — test ✗"]);
  testCommand(root, "");
  assert.throws(() => work.recordCheck(root, "CHG-CAMP-002", { red: true, ...AI }), /No Test command to run/);
});

test("verified is refused without red for a change with must requirements", () => {
  const root = project();
  assert.equal(gate(root, "CHG-CAMP-002", "verified", "red-first").ok, true, "the fixture's log has the red run");
  edit(root, "project/changes/CHG-CAMP-002/log.md", (t) => t.replace(/^\| [^\n]*\| check\.red \|[^\n]*\n/gm, ""));
  const c = gate(root, "CHG-CAMP-002", "verified", "red-first");
  assert.equal(c.ok, false);
  assert.match(c.message, /royascaff check CHG-CAMP-002 --red/);
});

test("tests that read source as text are found by name; real tests are left alone", () => {
  assert.match(readsSource("const s = fs.readFileSync(path.join(__dirname, '../src/scene/Scene.tsx'), 'utf8');\nexpect(s).toContain('bloom')"), /reads application source as text \(readFileSync\)/);
  assert.match(readsSource("import code from '../src/App.tsx?raw';"), /\?raw/);
  assert.match(readsSource("const t = await readFile('src/main.ts', 'utf8')"), /readFile/);
  assert.equal(readsSource("import { layout } from '../src/layout';\ntest('x', () => expect(layout(3)).toHaveLength(3));"), null);
  assert.equal(readsSource("const data = JSON.parse(fs.readFileSync('fixtures/graph.json', 'utf8'));"), null);

  const root = project();
  edit(root, "project/profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [node]\n")); // the node manifest declares the test-file patterns
  fs.mkdirSync(path.join(root, "apps/web/src/__tests__"), { recursive: true });
  fs.mkdirSync(path.join(root, "apps/web/node_modules/x"), { recursive: true });
  fs.writeFileSync(path.join(root, "apps/web/src/scene.test.ts"), "const s = readFileSync('src/scene.ts', 'utf8');\n");
  fs.writeFileSync(path.join(root, "apps/web/src/__tests__/layout.ts"), "import { layout } from '../layout';\n");
  fs.writeFileSync(path.join(root, "apps/web/node_modules/x/a.test.js"), "readFileSync('src/a.js')\n");
  const model = buildModel(root);
  const found = sourceReaders(model, [{ id: "APP-CAMP-WEB", path: "apps/web" }]);
  assert.deepEqual(found.map((f) => f.file), ["apps/web/src/scene.test.ts"]);
  const c = gate(root, "CHG-CAMP-002", "verified", "tests-run-code");
  assert.equal(c.ok, false);
  assert.match(c.message, /tests must call the code, not read it: apps\/web\/src\/scene\.test\.ts/);
});
