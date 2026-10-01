"use strict";

// Step 12c · WP-C5 (P6, P7): the app in a real browser (smoke template, screenshots with the
// evidence, a gate for web-ui) and the person's visual bar.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { initProject } = require("../lib/commands/setup.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { approveProject } = require("../lib/commands/approve.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const smoke = require("../lib/smoke.cjs");

const ME = { by: "islam" };

function project(adapter) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-c5-"));
  initProject(repo, { name: "Knowledge Universe", code: "KUNI", app: "web=apps/web", ...(adapter ? { adapter } : {}) });
  return repo;
}
const edit = (repo, rel, fn) => fs.writeFileSync(path.join(repo, "project", rel), fn(fs.readFileSync(path.join(repo, "project", rel), "utf8")));

function readyForApproval(repo, look) {
  const fill = ["Explorers.", "Flat diagrams.", "A visual proof.", "The owner judges.", "Desktop.", "- **Option A:** React\n- **Option B:** Vue\n\n**Recommendation:** Option A.", "Sample data.", look];
  let i = 0;
  edit(repo, "knowledge/00-discovery/discovery.md", (t) => t.replace(/(## \d\. [^\n]+\n\n)_[^\n]*_/g, (m, h) => (i < 8 ? `${h}${fill[i++]}` : m)));
  edit(repo, "knowledge/00-discovery/request.md", (t) => t.replace("_Paste the full request here, word for word._", "A dark, beautiful network."));
  newRecord(repo, "source", "Dark network", { quote: "A dark, beautiful network" });
  newRecord(repo, "decision", "React", { scope: "project" });
  edit(repo, "knowledge/04-design/architecture.md", (t) => t.replace(/(## 1\. Context\n\n)_[^\n]*_/, "$1One web app."));
}

test("web-ui: approve project needs a visual bar of at least 5 lines in topic 8", () => {
  const repo = project("web-ui");
  readyForApproval(repo, "Dark and calm.\n\n**Visual bar:**\n- Almost black background\n- Soft glow\n- Readable labels");
  assert.throws(() => approveProject(repo, ME), /needs a `\*\*Visual bar:\*\*` list of at least 5 lines .* \(3 now\)/);
  edit(repo, "knowledge/00-discovery/discovery.md", (t) => t.replace("- Readable labels", "- Readable labels\n- Every control does something\n- Not a flat default diagram"));
  assert.deepEqual(buildModel(repo).approvals.discovery.visualBar, ["Almost black background", "Soft glow", "Readable labels", "Every control does something", "Not a flat default diagram"]);
  assert.equal(approveProject(repo, ME).target, "project");
  // Other projects do not need one.
  const api = project();
  readyForApproval(api, "Plain.");
  assert.equal(approveProject(api, ME).target, "project");
});

test("smoke init copies the template into the app and sets the APP record's Smoke command", () => {
  const repo = project("web-ui");
  const r = smoke.smokeInit(repo, {});
  assert.deepEqual([r.app, r.file, r.command, r.kept], ["APP-KUNI-WEB", "apps/web/scripts/royascaff-smoke.mjs", "node scripts/royascaff-smoke.mjs", false]);
  assert.equal(fs.readFileSync(path.join(repo, r.file), "utf8"), fs.readFileSync(smoke.TEMPLATE, "utf8"));
  const app = [...buildModel(repo).records.values()].find((x) => x.id === "APP-KUNI-WEB");
  assert.equal(app.fields.Smoke, "node scripts/royascaff-smoke.mjs");
  fs.writeFileSync(path.join(repo, r.file), "// my edits\n");
  assert.equal(smoke.smokeInit(repo, {}).kept, true, "an existing script is kept");
  assert.equal(fs.readFileSync(path.join(repo, r.file), "utf8"), "// my edits\n");
  assert.equal((fs.readFileSync(path.join(repo, "project/profile.md"), "utf8").match(/- \*\*Smoke:\*\*/g) || []).length, 1, "set once, not duplicated");
});

test("--bar: all, none or the line numbers that pass; gaps are the rest", () => {
  assert.deepEqual(smoke.parseBar("all", 3), { passed: [1, 2, 3], gaps: [] });
  assert.deepEqual(smoke.parseBar("1, 3", 4), { passed: [1, 3], gaps: [2, 4] });
  assert.deepEqual(smoke.parseBar("none", 2), { passed: [], gaps: [1, 2] });
  assert.equal(smoke.parseBar(undefined, 5), null);
  assert.throws(() => smoke.parseBar("0,7", 5), /line numbers 1–5/);
  assert.deepEqual(smoke.barGaps({ events: [{ event: "check.run", by: "islam", note: "pass with gaps 2, 4: looked · bar: 3 of 5" }] }), [2, 4]);
  assert.deepEqual(smoke.barGaps({ events: [{ event: "check.run", by: "islam", note: "pass: looked · bar: all 5" }] }), []);
  assert.equal(smoke.barGaps({ events: [{ event: "check.run", by: "ai:claude", note: "pass with gaps 2: x · bar: 1 of 2" }] }), null);
});

// The Playwright script itself, end to end, on a tiny static page (skipped without Playwright).
let playwright = null;
try {
  playwright = require.resolve("playwright");
} catch {}
test("the smoke script: three sizes, screenshots, and a control that changes nothing fails by name", { skip: playwright ? false : "Playwright is not installed here" }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rs-smoke-"));
  fs.writeFileSync(path.join(dir, "index.html"), "<!doctype html><body style='background:#000;color:#fff'><p id=t>0</p><button onclick=\"t.textContent=Number(t.textContent)+1\">Count</button><button>Dead button</button></body>");
  fs.copyFileSync(smoke.TEMPLATE, path.join(dir, "smoke.mjs"));
  fs.symlinkSync(path.dirname(path.dirname(playwright)), path.join(dir, "node_modules")); // the script imports playwright like an app would
  const shots = path.join(dir, "shots");
  const r = spawnSync(process.execPath, [path.join(dir, "smoke.mjs")], { encoding: "utf8", env: { ...process.env, ROYASCAFF_SERVE: "", ROYASCAFF_URL: `file://${path.join(dir, "index.html")}`, ROYASCAFF_SHOTS: shots, ROYASCAFF_SETTLE_MS: "100" } });
  const out = JSON.parse(r.stdout);
  assert.equal(r.status, 1);
  assert.deepEqual(out.controls.map((c) => [c.name, c.changed]), [["Count", true], ["Dead button", false]], "a one-digit change counts; a click that changes nothing fails");
  assert.deepEqual(out.errors, ['the control "Dead button" changed nothing on screen']);
  assert.deepEqual(fs.readdirSync(shots).sort(), ["control-01-count.png", "control-02-dead-button.png", "view-1024x768.png", "view-1440x900.png", "view-430x932.png"]);
});
