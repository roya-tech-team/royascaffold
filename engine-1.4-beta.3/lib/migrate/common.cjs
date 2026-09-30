"use strict";

// Text helpers shared by the 1.3 and 1.2 converters. They edit Markdown as text, line by line,
// so everything the converters do not touch stays byte-identical.

const { findIds } = require("../parse/ids.cjs");

const FENCE = /^\s*(```|~~~)/;

function splitFrontMatter(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n/);
  return m ? { fm: m[0], body: text.slice(m[0].length) } : { fm: "", body: text };
}

// Adds `key: value` lines to the front matter (only keys that are missing), after `afterKey`
// when given, else at the end.
function setFrontMatter(text, pairs, afterKey) {
  const { fm, body } = splitFrontMatter(text);
  if (!fm) return text;
  const lines = fm.replace(/\n$/, "").split("\n"); // ['---', ..., '---']
  const has = (k) => lines.some((l) => l.startsWith(`${k}:`));
  const add = pairs.filter(([k]) => !has(k)).map(([k, v]) => `${k}: ${v}`);
  if (!add.length) return text;
  let at = lines.length - 1;
  if (afterKey) {
    const i = lines.findIndex((l) => l.startsWith(`${afterKey}:`));
    if (i > 0) at = i + 1;
  }
  lines.splice(at, 0, ...add);
  return `${lines.join("\n")}\n${body}`;
}

// Heading lines outside code fences: [{ index, level, text }].
function headings(lines) {
  const out = [];
  let fenced = false;
  lines.forEach((l, index) => {
    if (FENCE.test(l)) fenced = !fenced;
    else if (!fenced) {
      const m = l.match(/^(#{1,6})\s+(.*)$/);
      if (m) out.push({ index, level: m[1].length, text: m[2] });
    }
  });
  return out;
}

// "> **What:** … / > **Read when:** …" under the first H1 (adds an H1 when the file has none).
function addHeaderCard(text, what, readWhen) {
  const { fm, body } = splitFrontMatter(text);
  const lines = body.split("\n");
  const h1 = headings(lines).find((h) => h.level === 1);
  const card = [`> **What:** ${what}`, `> **Read when:** ${readWhen}`];
  if (!h1) return `${fm}# ${what.charAt(0).toUpperCase()}${what.slice(1)}\n\n${card.join("\n")}\n\n${body.replace(/^\n+/, "")}`;
  let i = h1.index + 1;
  while (i < lines.length && !lines[i].trim()) i += 1;
  if (i < lines.length && /^>/.test(lines[i])) return text; // already has a card
  lines.splice(h1.index + 1, 0, "", ...card);
  return fm + lines.join("\n");
}

function h1Title(text) {
  const lines = splitFrontMatter(text).body.split("\n");
  const h = headings(lines).find((x) => x.level === 1);
  return h ? h.text.trim() : null;
}

// Removes 1.3 hand-typed status field lines; returns the removed values per record as hints.
const STATUS_LINE = /^- \*\*(Implementation status|Knowledge status):\*\*\s*(.*)$/;

function stripStatusLines(text) {
  const lines = text.split("\n");
  const kept = [];
  const hints = [];
  let current = null;
  let fenced = false;
  for (const l of lines) {
    if (FENCE.test(l)) fenced = !fenced;
    if (!fenced) {
      const h = l.match(/^#{1,6}\s+(\S+)/);
      if (h) current = findIds(h[1])[0] || null;
      const m = l.match(STATUS_LINE);
      if (m) {
        let hint = hints.find((x) => x.id === current);
        if (!hint) hints.push((hint = { id: current, implementation: "", knowledge: "" }));
        hint[m[1].startsWith("Implementation") ? "implementation" : "knowledge"] = m[2].replace(/`/g, "").trim();
        continue;
      }
    }
    kept.push(l);
  }
  return { text: kept.join("\n"), hints: hints.filter((h) => h.id) };
}

// Line range of a record: its heading line and the index of the next heading at the same or a
// higher level (or the end of the file).
function recordRange(lines, id) {
  const hs = headings(lines);
  const k = hs.findIndex((h) => findIds(h.text.split(/\s/)[0])[0] === id);
  if (k < 0) return null;
  const level = hs[k].level;
  const next = hs.slice(k + 1).find((h) => h.level <= level) || hs.slice(k + 1)[0];
  return { start: hs[k].index, end: next ? next.index : lines.length };
}

// Adds `- **Key:** value` after the record's last field line (or as its first field).
function addField(text, id, key, value) {
  const lines = text.split("\n");
  const r = recordRange(lines, id);
  if (!r) return text;
  for (let i = r.start + 1; i < r.end; i += 1) if (lines[i].startsWith(`- **${key}:**`)) return text;
  let i = r.start + 1;
  while (i < r.end && !lines[i].trim()) i += 1;
  if (i < r.end && /^- \*\*[^*]+:\*\*/.test(lines[i])) {
    while (i + 1 < r.end && (/^- \*\*[^*]+:\*\*/.test(lines[i + 1]) || /^\s{2,}\S/.test(lines[i + 1]))) i += 1;
    lines.splice(i + 1, 0, `- **${key}:** ${value}`);
  } else {
    lines.splice(r.start + 1, 0, "", `- **${key}:** ${value}`);
  }
  return lines.join("\n");
}

// Appends lines at the end of a record's body (before the next heading).
function appendToRecord(text, id, block) {
  const lines = text.split("\n");
  const r = recordRange(lines, id);
  if (!r) return text;
  let end = r.end;
  while (end > r.start + 1 && !lines[end - 1].trim()) end -= 1;
  const insert = ["", ...block, ...(r.end < lines.length ? [""] : [])];
  lines.splice(end, r.end - end, ...insert, ...(r.end < lines.length ? [] : [""]));
  return lines.join("\n").replace(/\n{3,}(?=#)/g, "\n\n");
}

// IDs written in text, with ranges such as "REQ-KUNI-001 through REQ-KUNI-018" expanded.
function idsWithRanges(text) {
  const ids = new Set(findIds(text));
  const re = /\b([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-)(\d+)\b`?\s*(?:through|to|thru|–|—|\.\.)\s*`?(?:\1)?(\d+)\b/g;
  let m;
  while ((m = re.exec(text))) {
    const [, prefix, a, b] = m;
    const from = Number(a);
    const to = Number(b);
    if (!(to > from) || to - from > 500) continue;
    for (let n = from; n <= to; n += 1) ids.add(`${prefix}${String(n).padStart(a.length, "0")}`);
  }
  return [...ids];
}

function deriveCode(name) {
  const words = String(name || "").replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "APP";
  const code = words.length > 1 ? words.map((w) => w[0]).join("") : words[0];
  return code.toUpperCase().replace(/^[^A-Z]+/, "").slice(0, 10) || "APP";
}

function slug(s) {
  return String(s).toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").split("-")[0] || "APP";
}

// "Read when" text for a knowledge file, by its layer folder.
const READ_WHEN = [
  [/^knowledge\/00-/, "planning work, or asking what is planned"],
  [/^knowledge\/01-/, "asking what the product is for and who it serves"],
  [/^knowledge\/02-/, "planning, building or checking what a feature must do"],
  [/^knowledge\/03-/, "you need the business words, rules or workflows"],
  [/^knowledge\/04-/, "designing or changing how the product is built"],
  [/^knowledge\/05-/, "building: which code does what, and how it is tested"],
  [/^knowledge\/06-/, "checking quality targets and accepted risks"],
  [/^knowledge\/07-/, "deploying or running the product"],
];

function readWhenFor(rel) {
  const hit = READ_WHEN.find(([re]) => re.test(rel));
  return hit ? hit[1] : "you need this part of the project knowledge";
}

function sliceTable(rows) {
  return [
    "| Slice | Title | Order | Depends on | Delivers | Planned at |",
    "|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${r.title.replace(/\|/g, "/")} | ${r.order} | ${r.depends.join(", ") || "—"} | ${r.delivers.join(", ") || "—"} | ${r.plannedAt || "—"} |`),
  ];
}

// Discovery, architecture and project log for a migrated project (1.4 needs them before new work).
function migratedDocs(plan, { code, owner, name, from, links, ids = new Set() }) {
  // Keep document IDs unique: a 1.3 project may already own DOC-<CODE>-ARCHITECTURE.
  const uniq = (text, id) => (ids.has(id) ? text.replace(`document_id: ${id}`, `document_id: ${id}-PAGE`) : text);
  const { docText } = require("../templates.cjs");
  const { logTemplate } = require("../events.cjs");
  const P = "project";
  let discovery = docText("discovery", { CODE: code, OWNER: owner, NAME: name });
  discovery = discovery.replace("\n## 1. Users and roles", `\n_Migrated from RoyaScaff ${from}: fill each topic from the existing documents (${links.brief}) and confirm it with the person. Nothing here was invented by the migration._\n\n## 1. Users and roles`);
  if (!plan.exists(`${P}/knowledge/00-discovery/discovery.md`)) plan.create(`${P}/knowledge/00-discovery/discovery.md`, uniq(discovery, `DOC-${code}-DISCOVERY`));
  if (!plan.exists(`${P}/knowledge/04-design/architecture.md`)) {
    let arch = docText("architecture", { CODE: code, OWNER: owner, NAME: name });
    if (links.architecture.length) arch = arch.replace(/(## 1\. Context\n\n)_[^\n]*_/, `$1Migrated from RoyaScaff ${from}. The system is described in ${links.architecture.join(" and ")}; summarize it here when you next change the architecture.`);
    plan.create(`${P}/knowledge/04-design/architecture.md`, uniq(arch, `DOC-${code}-ARCHITECTURE`));
  }
  if (!plan.exists(`${P}/log.md`)) plan.create(`${P}/log.md`, logTemplate("project"));
}

module.exports = { migratedDocs, splitFrontMatter, setFrontMatter, headings, addHeaderCard, h1Title, stripStatusLines, recordRange, addField, appendToRecord, idsWithRanges, deriveCode, slug, readWhenFor, sliceTable };
