"use strict";

// Step 12c · WP-C6 (web-3d adapter) and WP-C7 (unused dependencies, placeholder content).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { initProject } = require("../lib/commands/setup.cjs");
const { contextCommand } = require("../lib/commands/context.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { adaptersOf } = require("../lib/adapters.cjs");
const smoke = require("../lib/smoke.cjs");
const content = require("../lib/content.cjs");
const DEPS = require("../lib/adapters.cjs").policyOf(["node"]).deps;
const packageOf = (x) => content.packageOf(x, DEPS);
const importsIn = (x) => content.importsIn(x, DEPS);

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-c6-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const edit = (root, rel, fn) => fs.writeFileSync(path.join(root, rel), fn(fs.readFileSync(path.join(root, rel), "utf8")));
const put = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
const commands = (root) => edit(root, "project/profile.md", (t) => t.replace(/(- \*\*(Build|Typecheck|Lint|Test):\*\*) .*/g, "$1 node -e 0"));

test("init accepts web-ui,web-3d; a web-3d project is a browser UI (smoke, bar, look)", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-c6-"));
  initProject(repo, { name: "Knowledge Universe", code: "KUNI", app: "web=apps/web", adapter: "web-ui,web-3d" });
  const model = buildModel(repo);
  assert.deepEqual(adaptersOf(model), ["web-ui", "web-3d"]);
  assert.ok(smoke.visualBarRequired(model));
  assert.deepEqual(require("../lib/adapters.cjs").policy(model).adapters, ["node", "web-ui", "web-3d"], "web-3d includes web-ui, which includes node");
  assert.throws(() => initProject(fs.mkdtempSync(path.join(os.tmpdir(), "rs-c6-")), { name: "X", code: "XX", adapter: "web-4d" }), /Unknown adapter: web-4d/);
});

test("packs carry the rules of both adapters; the smoke run is told about web-3d", () => {
  const root = copy();
  edit(root, "project/profile.md", (t) => t.replace("project_name: Campaign Planner", "project_name: Campaign Planner\nadapters: [web-ui, web-3d]"));
  const pack = contextCommand(root, "TASK-CAMP-004", {});
  assert.match(pack.text, /## Adapter rules \(web-ui\)/);
  assert.match(pack.text, /## Adapter rules \(web-3d\)\n\n- Many similar objects share geometry and materials/);
  // The template's 3D block is switched on by the adapters the runner passes.
  const tpl = fs.readFileSync(require("../lib/adapters.cjs").policyOf(["web-ui"]).smoke.template, "utf8");
  assert.match(tpl, /const WEB_3D = process\.env\.ROYASCAFF_CHECK_3D === "1"/);
  assert.match(tpl, /below the floor of \$\{FPS_MIN\}/);
  assert.match(tpl, /the canvas is blank/);
  assert.match(tpl, /3d-closeup\.png/);
  commands(root);
  put(root, "apps/web/env.cjs", "require('fs').writeFileSync(require('path').join(__dirname, 'env.txt'), process.env.ROYASCAFF_CHECK_3D + '|' + process.env.ROYASCAFF_SHOTS + '|' + process.env.ROYASCAFF_SMOKE_IGNORE);\n");
  edit(root, "project/profile.md", (t) => smoke.setAppField(smoke.setAppField(t, "APP-CAMP-WEB", "Smoke", "node env.cjs"), "APP-CAMP-WEB", "Smoke ignore", "Mute, Help"));
  const r = work.recordCheck(root, "CHG-CAMP-002", AI);
  const [adapters, shots, ignore] = fs.readFileSync(path.join(root, "apps/web/env.txt"), "utf8").split("|");
  assert.equal(adapters, "1", "the web-3d manifest switches on the 3D checks");
  assert.equal(ignore, "Mute, Help", "controls a person accepted as no visible change");
  assert.equal(shots, path.join(root, "project/changes/CHG-CAMP-002/evidence/shots", r.evidence));
});

test("imports: packages from import, require, dynamic import and CSS; relative paths ignored", () => {
  assert.equal(packageOf("@react-three/fiber/native"), "@react-three/fiber");
  assert.equal(packageOf("three/examples/jsm/controls/OrbitControls.js"), "three");
  assert.equal(packageOf("./local"), null);
  assert.equal(packageOf("node:fs"), null);
  const text = "import React from 'react';\nimport 'normalize.css';\nconst d3 = await import(\"d3-force\");\nconst x = require('zustand');\n@import 'animate.css/animate.min.css';\n@tailwind base;\nimport { a } from './a';";
  assert.deepEqual([...importsIn(text)].sort(), ["animate.css", "d3-force", "normalize.css", "react", "tailwindcss", "zustand"]);
});

test("an unused dependency fails the full check by name; an accepted one passes; placeholders are counted in the evidence", () => {
  const root = copy();
  edit(root, "project/profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [node]\n")); // the node manifest declares the dependency check
  commands(root);
  put(root, "apps/web/package.json", JSON.stringify({ scripts: { build: "vite build" }, dependencies: { react: "18", three: "0.160", "framer-motion": "11", tailwindcss: "3", vite: "5" } }, null, 2));
  put(root, "apps/web/src/main.tsx", "import React from 'react';\nimport * as THREE from 'three';\n// TODO: remove\nexport const hint = 'Coming soon';\n");
  put(root, "apps/web/src/index.css", "@tailwind base;\ninput::placeholder { color: gray }\n");
  put(root, "apps/web/src/data/nodes.json", JSON.stringify([{ d: "No description yet" }, { d: "No description yet" }, { d: "Lorem ipsum dolor" }]));
  put(root, "apps/web/src/main.test.tsx", "// TODO in a test does not count\n");
  let r = work.recordCheck(root, "CHG-CAMP-002", AI);
  assert.equal(r.result, "fail");
  const deps = r.results.find((x) => x.kind === "Deps");
  assert.equal(deps.pass, false);
  assert.match(deps.tail, /^framer-motion is installed and never imported/);
  const evidence = fs.readFileSync(path.join(root, "project/changes/CHG-CAMP-002/evidence/checks.md"), "utf8");
  assert.match(evidence, /- \*\*Checks:\*\* [^\n]*deps fail \(exit 1\)/);
  assert.match(evidence, /\*\*Deps failed\*\*/);
  assert.match(evidence, /- \*\*Placeholders:\*\* lorem ipsum ×1 \(apps\/web\/src\/data\/nodes\.json\) · TODO ×1 \(apps\/web\/src\/main\.tsx\) · coming soon ×1 \(apps\/web\/src\/main\.tsx\) · no description yet ×2 \(apps\/web\/src\/data\/nodes\.json\)\n/);
  edit(root, "project/profile.md", (t) => smoke.setAppField(t, "APP-CAMP-WEB", "Unused ok", "framer-motion"));
  r = work.recordCheck(root, "CHG-CAMP-002", AI);
  assert.equal(r.results.find((x) => x.kind === "Deps").pass, true);
  assert.equal(r.result, "pass", "placeholders are a warning, not a failure");
  assert.equal(r.placeholders.length, 4);
});
