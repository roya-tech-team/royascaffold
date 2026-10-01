"use strict";

// Beta.4 · WP-D4: adapters declare their checks in manifests; the core runs what they declare and
// knows no adapter, language or tool by name. A project can bring its own adapter.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildModel } = require("../lib/model/graph.cjs");
const adapters = require("../lib/adapters.cjs");
const { unusedDependencies } = require("../lib/content.cjs");
const { sourceReaders } = require("../lib/testsfirst.cjs");
const smoke = require("../lib/smoke.cjs");

const LIB = path.join(__dirname, "..", "lib");
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-d4-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const put = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
const useAdapters = (root, list) => { const f = path.join(root, "project/profile.md"); fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("royascaff: 1.4\n", `royascaff: 1.4\nadapters: [${list}]\n`)); };
const libFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? libFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]));

test("the core names no adapter and no stack: no adapter name, package file, test tool or browser tool in lib/", () => {
  const names = adapters.KNOWN().filter((n) => n !== "generic");
  const tech = ["package.json", "playwright", "?raw", "@tailwind", "vite", "npm i", ".test.", ".spec."];
  const hits = [];
  for (const f of libFiles(LIB)) {
    const text = fs.readFileSync(f, "utf8").replace(/require\("(\.\.\/)+package\.json"\)/g, ""); // the engine's own version is fine
    for (const n of names) if (new RegExp(`["'\`]${n}["'\`]`).test(text)) hits.push(`${path.relative(LIB, f)}: adapter "${n}"`);
    for (const t of tech) if (text.includes(t)) hits.push(`${path.relative(LIB, f)}: "${t}"`);
  }
  assert.deepEqual(hits, []);
});

test("every engine adapter has a card and a manifest; includes resolve; the generic adapter declares no checks", () => {
  for (const n of adapters.KNOWN()) {
    assert.ok(fs.existsSync(path.join(adapters.DIR, `${n}.json`)), `${n}.json`);
    const m = adapters.manifest(n);
    assert.equal(m.adapter, n);
    for (const inc of m.includes || []) assert.ok(adapters.KNOWN().includes(inc), `${n} includes ${inc}`);
  }
  const g = adapters.policyOf(["generic"]);
  assert.deepEqual([g.visualBar, g.personLook, g.smoke, g.tests, g.deps], [false, null, null, null, null]);
  assert.equal(adapters.adapterForLegacyType("web"), "web-ui");
  assert.equal(adapters.adapterForLegacyType("api"), "web-api");
  assert.equal(adapters.adapterForLegacyType("desktop"), "generic");
});

test("a project's own adapter (another stack) switches the checks on without any engine change", () => {
  const root = copy();
  put(root, "project/adapters/py-desk.md", "# Adapter · py-desk\n\n## Design\n\n- Screens in Qt.\n\n## Rules\n\n- UI code never opens files directly.\n\n## Check\n\n- pytest passes.\n\n## Words\n\nqt, widget, pytest\n");
  put(root, "project/adapters/py-desk.json", JSON.stringify({
    adapter: "py-desk",
    visualBar: true,
    personLook: { kinds: ["feature"], minRisk: "low" },
    smoke: { template: "desk-smoke.sh", script: "tools/smoke.sh", command: "sh tools/smoke.sh", requiredFor: ["feature"], env: { DESK_SMOKE: "1" } },
    tests: { files: ["(^|/)test_[^/]+\\.py$"], readsSource: [{ call: "\\b(open)\\s*\\(([^)]*)\\)", args: ["['\"]src/"], why: "reads application source as text ($1)" }] },
    deps: { manifest: "deps.json", fields: ["requires"], sourceFiles: "\\.py$", imports: ["(?:^|\\n)\\s*import\\s+([\\w.]+)", "(?:^|\\n)\\s*from\\s+([\\w.]+)\\s+import"], specifier: { skip: "^\\.", separator: "." } },
  }));
  put(root, "project/adapters/desk-smoke.sh", "echo smoke\n");
  useAdapters(root, "py-desk");
  put(root, "apps/web/deps.json", JSON.stringify({ requires: { numpy: "1", requests: "2", "PyQt6": "6" } }));
  put(root, "apps/web/src/app.py", "import numpy\nfrom PyQt6.QtWidgets import QApplication\n");
  put(root, "apps/web/tests/test_app.py", "def test_title():\n    assert 'Title' in open('src/app.py').read()\n");
  const model = buildModel(root);
  const app = { id: "APP-CAMP-WEB", path: "apps/web" };
  assert.deepEqual(adapters.adaptersOf(model), ["py-desk"]);
  assert.deepEqual(adapters.adapterCards(model), ["project/adapters/py-desk.md"]);
  assert.deepEqual(unusedDependencies(model, app).unused, ["requests"]);
  assert.deepEqual(sourceReaders(model, [app]).map((x) => [x.file, x.why]), [["apps/web/tests/test_app.py", "reads application source as text (open)"]]);
  assert.equal(adapters.needsPersonLook(model, model.changes.get("CHG-CAMP-002")), true);
  assert.equal(smoke.visualBarRequired(model), true);
  const r = smoke.smokeInit(root, {});
  assert.deepEqual([r.file, r.command], ["apps/web/tools/smoke.sh", "sh tools/smoke.sh"]);
  assert.equal(fs.readFileSync(path.join(root, r.file), "utf8"), "echo smoke\n");
  // The context pack carries the project adapter's rules.
  const pack = require("../lib/commands/context.cjs").contextCommand(root, "TASK-CAMP-004", {});
  assert.match(pack.text, /## Adapter rules \(py-desk\)\n\n- UI code never opens files directly\./);
});

test("without a smoke-declaring adapter, smoke init says so instead of guessing a tool", () => {
  const root = copy();
  assert.throws(() => smoke.smokeInit(root, {}), /No adapter in profile\.md declares a smoke check/);
});
