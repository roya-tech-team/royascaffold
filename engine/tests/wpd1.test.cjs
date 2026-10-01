"use strict";

// Beta.4 · WP-D1 + D5: the engine carries no benchmark text. Templates, cards, adapters, the
// help docs and the code are what the model under test reads; a phrase copied from a benchmark
// prompt would hint the answer. The phrase list lives here, in the tests, not in the engine.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PHRASES = fs.readFileSync(path.join(__dirname, "contamination.txt"), "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
const SCANNED = ["templates", "skill", "adapters", "lib", "bin", "docs/PLAYBOOK.md", "docs/GLOSSARY.md"];

function files(rel) {
  const abs = path.join(ROOT, rel);
  if (fs.statSync(abs).isFile()) return [rel];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(rel, e.name)) : [path.join(rel, e.name)]));
}

test("no benchmark phrase in anything the engine ships to a project or runs", () => {
  const hits = [];
  for (const f of SCANNED.flatMap(files)) {
    const text = fs.readFileSync(path.join(ROOT, f), "utf8").toLowerCase();
    for (const p of PHRASES) if (text.includes(p.toLowerCase())) hits.push(`${f}: "${p}"`);
  }
  assert.deepEqual(hits, []);
});

test("web-3d is generic: no product-shaped rules (graph, hubs, re-seed) in the adapter", () => {
  const card = fs.readFileSync(path.join(ROOT, "adapters/web-3d.md"), "utf8");
  for (const word of ["graph", "hub", "seed", "node", "edge", "cluster"]) assert.doesNotMatch(card, new RegExp(`\\b${word}`, "i"), word);
  assert.match(card, /Product-specific rules .* write them as `RULE-` records/);
});
