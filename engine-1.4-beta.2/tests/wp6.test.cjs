"use strict";

// Step 12b · WP6: adapters (cards, next, context, words) and the person's visual check (R8).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const work = require("../lib/commands/work.cjs");
const { initProject, install } = require("../lib/commands/setup.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");
const { contextCommand } = require("../lib/commands/context.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { DIR, readAdapter } = require("../lib/adapters.cjs");

const ME = { by: "islam" };
const AI = { by: "ai:claude" };
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp6-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const file = (root, rel) => path.join(root, "project", rel);
const edit = (root, rel, fn) => fs.writeFileSync(file(root, rel), fn(fs.readFileSync(file(root, rel), "utf8")));
const tokens = (f) => Math.ceil(fs.readFileSync(f, "utf8").length / 4);
const webUi = (root) => edit(root, "profile.md", (t) => t.replace("project_name: Campaign Planner", "project_name: Campaign Planner\nadapters: [web-ui]"));

test("three adapter cards, each with Design, Rules, Check and Words, within 600 tokens", () => {
  const names = fs.readdirSync(DIR).map((f) => f.replace(/\.md$/, "")).sort();
  assert.deepEqual(names, ["generic", "web-api", "web-ui"]);
  for (const n of names) {
    const a = readAdapter(n);
    assert.ok(a.design && a.rules && a.check && a.words.length, n);
    assert.ok(tokens(path.join(DIR, `${n}.md`)) <= 600, `${n} is ~${tokens(path.join(DIR, `${n}.md`))} tokens`);
  }
});

test("init --adapter writes the profile, refuses unknown adapters; install copies the cards", () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp6-init-"));
  assert.throws(() => initProject(repo, { name: "X", code: "XX", adapter: "flutter" }), /Unknown adapter: flutter/);
  initProject(repo, { name: "Knowledge Universe", code: "KUNI", adapter: "web-ui" });
  assert.deepEqual(buildModel(repo).profile.adapters, ["web-ui"]);
  install(repo, { cursor: true });
  assert.ok(fs.existsSync(path.join(repo, ".cursor/skills/royascaff/adapters/web-ui.md")));
});

test("next names the adapter card at Design and Check; packs carry the adapter rules; its words guard the business files", () => {
  const root = copy();
  webUi(root);
  // CHG-CAMP-003 (a bug in Understand) is first; move on to the Design stage of a fresh change.
  work.advance(root, "CHG-CAMP-003", "cancelled", { ...ME, reason: "not now" });
  let n = nextCommand(root);
  assert.equal(n.stage, "build");
  assert.equal(n.adapter_cards, undefined, "not at Build: the pack carries the rules instead");
  const pack = contextCommand(root, "TASK-CAMP-004", {});
  assert.match(pack.text, /## Adapter rules \(web-ui\)\n\n- Pages orchestrate/);
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  n = nextCommand(root);
  assert.equal(n.stage, "check");
  assert.deepEqual(n.adapter_cards, ["adapters/web-ui.md"]);
  edit(root, "knowledge/01-business/brd.md", (t) => t.replace("Agency teams plan social campaigns", "Each page keeps its state in a store while agency teams plan social campaigns"));
  assert.ok(buildModel(root).issues.some((i) => i.code === "technical-words-in-business" && /state, store/.test(i.message)));
});

test("R8: a medium-risk UI change needs a person's look before it is verified; the AI cannot record it", () => {
  const root = copy();
  webUi(root);
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", note: "npm test", ...AI });
  fs.mkdirSync(file(root, "changes/CHG-CAMP-002/evidence"), { recursive: true });
  fs.writeFileSync(file(root, "changes/CHG-CAMP-002/evidence/evidence.md"), "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  let r = work.advance(root, "CHG-CAMP-002", "verified", AI);
  assert.equal(r.reached, "in-progress");
  assert.deepEqual(r.steps[r.steps.length - 1].checks.filter((c) => !c.ok).map((c) => c.id), ["visual-check"]);
  const n = nextCommand(root);
  const mine = n.change === "CHG-CAMP-002" ? n : null;
  assert.ok(mine === null || (mine.human && /royascaff check CHG-CAMP-002 --result pass/.test(mine.say)));
  assert.ok([n.text, ...n.others].some((t) => /^Waiting for a person: a person opens the app/.test(t)));
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", note: "looked at the calendar on a 27-inch screen", ...ME });
  r = work.advance(root, "CHG-CAMP-002", "verified", AI);
  assert.equal(r.reached, "verified");
});

test("R8 does not apply to low-risk changes or projects without the web-ui adapter", () => {
  const root = copy();
  work.taskAction(root, "TASK-CAMP-004", "done", "posts on their day", AI);
  work.recordCheck(root, "CHG-CAMP-002", { result: "pass", ...AI });
  fs.mkdirSync(file(root, "changes/CHG-CAMP-002/evidence"), { recursive: true });
  fs.writeFileSync(file(root, "changes/CHG-CAMP-002/evidence/evidence.md"), "### EVD-CAMP-003 · Calendar\n\n- **Result:** pass\n- **Proves:** REQ-CAMP-003\n");
  assert.equal(work.advance(root, "CHG-CAMP-002", "verified", AI).reached, "verified", "generic adapter: no visual check");
});
