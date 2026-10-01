"use strict";

// Beta.4 exit rule (plan file 17 §5): every knowledge file type has a producer, a consumer and a
// check; its pack sections exist in its template; every layer has a page; the budgets hold.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const K = require("../lib/knowledge.cjs");
const { sections } = require("../lib/approvals.cjs");

const ROOT = path.join(__dirname, "..");
const tokens = (f) => Math.ceil(fs.readFileSync(f, "utf8").length / 4);

test("every document type has a producer, a consumer and a check", () => {
  for (const d of K.DOCS) {
    for (const key of ["producer", "consumer", "check"]) assert.ok(String(d[key] || "").trim().length >= 4, `${d.kind}: ${key}`);
    assert.ok(d.layer === null || K.LAYERS.some((l) => l.id === d.layer), `${d.kind}: layer ${d.layer}`);
  }
  for (const l of K.LAYERS) assert.ok(K.DOCS.some((d) => d.layer === l.id), `layer ${l.id} has a page`);
});

test("the sections a pack carries exist in each template; `new doc` pages have templates", () => {
  for (const d of K.DOCS) {
    const tpl = path.join(ROOT, "templates", "files", `${d.kind}.md`);
    if (d.newDoc) assert.ok(fs.existsSync(tpl), `${d.kind}: template`);
    if (!d.pack || !fs.existsSync(tpl)) continue;
    const titles = sections(fs.readFileSync(tpl, "utf8")).map((s) => s.title.toLowerCase());
    for (const p of d.pack) assert.ok(titles.some((t) => t.startsWith(p.toLowerCase())), `${d.kind}: section "${p}"`);
  }
});

test("budgets hold: SKILL ≤ 400 tokens, every card and adapter card ≤ 600", () => {
  assert.ok(tokens(path.join(ROOT, "skill/royascaff/SKILL.md")) <= 400);
  for (const dir of ["skill/royascaff/cards", "adapters"]) {
    for (const f of fs.readdirSync(path.join(ROOT, dir)).filter((x) => x.endsWith(".md"))) {
      const n = tokens(path.join(ROOT, dir, f));
      assert.ok(n <= 600, `${dir}/${f} ~${n} tokens`);
    }
  }
});
