"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { parseMarkdown, renderMarkdown, recordsOf } = require("../lib/parse/markdown.cjs");

function same(text) {
  const parsed = JSON.parse(JSON.stringify(parseMarkdown(text)));
  assert.equal(renderMarkdown(parsed), text);
  return parsed;
}
const records = (p) => p.segments.filter((s) => s.type === "record");

test("canonical record is stored as data only and renders identically", () => {
  const p = same("### REQ-A-001 · Open the app\n\n- **Kind:** requirement\n- **Owner:** team\n\nBody.\n");
  const [r] = records(p);
  assert.equal(r.id, "REQ-A-001");
  assert.equal(r.title, "Open the app");
  assert.deepEqual(r.fields.map((f) => [f.key, f.value]), [["Kind", "requirement"], ["Owner", "team"]]);
  assert.equal(r.heading_raw, undefined);
  assert.ok(r.fields.every((f) => f.raw === undefined));
});

test("render is driven by data: editing a field value changes the Markdown", () => {
  const p = parseMarkdown("### REQ-A-001 · Title\n\n- **Owner:** team\n");
  records(p)[0].fields[0].value = "product-owner";
  assert.equal(renderMarkdown(p), "### REQ-A-001 · Title\n\n- **Owner:** product-owner\n");
});

test("non-canonical heading and field lines are preserved verbatim", () => {
  const p = same("### REQ-A-001 — Title with dash  \n\n- **Kind:**   requirement\n");
  const [r] = records(p);
  assert.ok(r.heading_raw !== undefined);
  assert.ok(r.fields[0].raw !== undefined);
  assert.equal(r.fields[0].value, "requirement");
});

test("headings inside fenced code are not records (backticks and tildes)", () => {
  const p = same("# Doc\n\n```md\n### REQ-A-999 · Not a record\n```\n\n~~~\n### REQ-A-998 · Also not\n~~~\n");
  assert.equal(records(p).length, 0);
});

test("a record ends at the next heading of the same or higher level; deeper headings stay in the body", () => {
  const p = same("### CMP-A-001 · Store\n\n- **Kind:** component\n\n#### Notes\n\nDetail.\n\n### Other section\n\nText.\n");
  const [r] = records(p);
  assert.match(r.body, /#### Notes/);
  assert.equal(p.segments[p.segments.length - 1].type, "text");
});

test("indented continuation lines belong to the previous field", () => {
  const p = same("### TASK-A-001 · Build\n\n- **Steps:** first\n  second line\n- **Done:** yes\n");
  const [r] = records(p);
  assert.deepEqual(r.fields[0].continuation, ["  second line"]);
  assert.equal(recordsOf(p, "plan.md")[0].fields.Steps, "first second line");
});

test("record without fields keeps its blank lines in the body", () => {
  const p = same("## ADR-A-001 · Use React\n\nWe use React.\n");
  const [r] = records(p);
  assert.equal(r.fields, undefined);
  assert.equal(r.body, "\nWe use React.\n");
});

test("CRLF, BOM and missing final newline survive the round trip", () => {
  const crlf = same("### REQ-A-001 · T\r\n\r\n- **Kind:** requirement\r\n");
  assert.equal(crlf.eol, "crlf");
  const bom = same("﻿# Title\n");
  assert.equal(bom.bom, true);
  same("### REQ-A-001 · T\n\n- **Kind:** requirement");
});

test("mixed line endings are kept verbatim", () => {
  same("# A\r\nline\nmore\r\n");
});

test("front matter: canonical stored as data, non-canonical kept raw, unclosed treated as text", () => {
  const a = same("---\ndocument_id: DOC-A-001\nowners: [a, b]\n---\n\n# Doc\n");
  assert.equal(a.frontmatter.raw, undefined);
  assert.deepEqual(a.frontmatter.data.owners, ["a", "b"]);
  const b = same("---\n# comment\ntitle: \"Quoted\"\n---\n# Doc\n");
  assert.ok(b.frontmatter.raw !== undefined);
  assert.equal(b.frontmatter.data.title, "Quoted");
  const c = same("---\ntitle: never closed\n# Doc\n");
  assert.equal(c.frontmatter, undefined);
});

test("typed field IDs and body mentions are kept apart", () => {
  const p = parseMarkdown("### REQ-A-001 · T\n\n- **Satisfies:** `CAP-A-001`\n\nSee TEST-A-001 and CAP-A-001.\n");
  const [r] = recordsOf(p, "req.md");
  assert.deepEqual(r.field_ids, ["CAP-A-001"]);
  assert.deepEqual(r.mentions, ["TEST-A-001"]);
  assert.equal(r.line, 1);
});

test("record line numbers account for front matter", () => {
  const p = parseMarkdown("---\ntitle: X\n---\n\n### REQ-A-001 · T\n");
  assert.equal(recordsOf(p, "x.md")[0].line, 5);
});

test("records are never nested: a deeper record heading starts its own record", () => {
  const p = same("## CAP-A-001 · Feature\n\n- **Horizon:** now\n\n#### Notes\n\n### REQ-A-001 · Requirement\n\n- **Feature:** CAP-A-001\n");
  const rs = records(p);
  assert.deepEqual(rs.map((r) => r.id), ["CAP-A-001", "REQ-A-001"]);
  assert.match(rs[0].body, /#### Notes/);
});
