"use strict";

// Step 12b · WP8: health numbers, duplicate paragraphs, cache clear, `continue` in the terminal.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { healthOf } = require("../lib/views/health.cjs");
const { indexCommand, statusCommand } = require("../lib/commands/views.cjs");

const GREEN = path.join(__dirname, "fixtures", "greenfield");
const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-wp8-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const put = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
const cli = (...a) => spawnSync(process.execPath, [BIN, ...a], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } });

test("health: docs vs code, saved packs, the largest open pack and code ownership — on the board and in status --json", () => {
  const root = copy();
  put(root, "apps/web/src/campaigns/form.ts", Array.from({ length: 1000 }, (_, i) => `export const a${i} = ${i};`).join("\n") + "\n");
  put(root, "apps/web/src/stray/x.ts", "export const x = 1;\n");
  put(root, "project/changes/CHG-CAMP-002/contexts/TASK-CAMP-004.md", "# Pack\n\nline\nline\n");
  const m = buildModel(root);
  const h = healthOf(m, deriveStatus(m));
  assert.equal(h.app_lines, 1001);
  assert.equal(h.saved_pack_lines, 4);
  assert.equal(h.ratio, Math.round((h.doc_lines / 1001) * 100) / 100);
  assert.deepEqual([h.largest_pack.task, h.owned_files, h.source_files], ["TASK-CAMP-004", 1, 2]);
  const board = indexCommand(root).board;
  assert.match(board, /- Docs vs code: \d+ doc lines \/ 1,001 app lines = 0\.\d+/);
  assert.match(board, /- ⚠ Saved context packs committed: 4 lines/);
  assert.match(board, /- Code owned by components: 1\/2 source files \(royascaff adopt\)/);
  assert.equal(statusCommand(root).health.app_lines, 1001);
});

test("a paragraph of 40+ words copied into a second knowledge file is flagged", () => {
  const root = copy();
  const para = "Planners work with many clients at once and need to see every campaign of one client together, with its dates, its channels and the posts that are still waiting for approval, so that nothing is published late or published without the client agreeing to it first.";
  fs.appendFileSync(path.join(root, "project/knowledge/01-business/brd.md"), `\n${para}\n`);
  fs.appendFileSync(path.join(root, "project/knowledge/00-discovery/discovery.md"), `\n${para}\n`);
  const dup = buildModel(root).issues.filter((i) => i.code === "duplicate-paragraph");
  assert.equal(dup.length, 1);
  assert.match(dup[0].message, /repeats a paragraph from knowledge\/0[01]-/);
});

test("cache clear removes only the cache; `continue` in the terminal explains where to say it", () => {
  const root = copy();
  put(root, "project/.cache/contexts/x.md", "x\n");
  put(root, "project/.backups/B1/file.ts", "keep\n");
  const r = cli("cache", "clear", root);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!fs.existsSync(path.join(root, "project/.cache")));
  assert.ok(fs.existsSync(path.join(root, "project/.backups/B1/file.ts")));
  const c = cli("continue", root);
  assert.equal(c.status, 0);
  assert.match(c.stdout, /^"royascaff continue" is a sentence for your AI chat/);
  assert.match(c.stdout, /▶ /);
});
