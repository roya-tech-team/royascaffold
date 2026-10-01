"use strict";

// Lossless Markdown model for RoyaScaff files.
//
// A file becomes: optional front matter + an ordered list of segments.
//   text segment    : any Markdown that is not a record (kept verbatim)
//   record segment  : `#{2,6} <ID> · <Title>` heading, its `- **Key:** value` fields,
//                     and its body (kept verbatim)
// Rendering concatenates the segments again. Structured parts (headings, fields, front
// matter) are rendered FROM DATA when the original line is in canonical form; when it is
// not, the original text is stored in a `raw` property so the output stays byte-identical.

const { ID_SOURCE, findIds } = require("./ids.cjs");
const { splitFrontmatter, renderFrontmatter } = require("./frontmatter.cjs");

const HEADING_RE = /^(#{1,6})[ \t]+(.*)$/;
const RECORD_TITLE_RE = new RegExp(`^(${ID_SOURCE})[ \\t]+[·—–-][ \\t]+(.*\\S)[ \\t]*$`);
const FIELD_RE = /^- \*\*([^*\n]+?):\*\*(?:[ \t]+(.*))?$/;
const CONTINUATION_RE = /^[ \t]{2,}\S/;
const FENCE_RE = /^[ ]{0,3}(`{3,}|~{3,})/;

function canonicalHeading(level, id, title) {
  return `${"#".repeat(level)} ${id} · ${title}`;
}

function canonicalField(key, value) {
  return value === "" ? `- **${key}:**` : `- **${key}:** ${value}`;
}

// Mark which lines are real headings (outside fenced code blocks).
function headingInfo(lines) {
  const info = new Array(lines.length).fill(null);
  let fence = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const f = line.match(FENCE_RE);
    if (f) {
      const marker = f[1];
      if (!fence) {
        fence = { char: marker[0], len: marker.length };
      } else if (marker[0] === fence.char && marker.length >= fence.len && /^[ ]{0,3}(`{3,}|~{3,})[ \t]*$/.test(line)) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;
    const h = line.match(HEADING_RE);
    if (!h) continue;
    const level = h[1].length;
    const rec = h[2].match(RECORD_TITLE_RE);
    info[i] = rec && level >= 2 ? { level, record: { id: rec[1], title: rec[2] } } : { level, record: null };
  }
  return info;
}

function parseMarkdown(input) {
  let text = input;
  const file = {};
  if (text.startsWith("﻿")) {
    file.bom = true;
    text = text.slice(1);
  }
  if (text.includes("\r\n") && !/(^|[^\r])\n/.test(text)) {
    file.eol = "crlf";
    text = text.replace(/\r\n/g, "\n");
  }
  const { frontmatter, rest } = splitFrontmatter(text);
  if (frontmatter) file.frontmatter = frontmatter;

  const lines = rest.split("\n");
  const info = headingInfo(lines);
  const segments = [];
  let textBuffer = [];
  const flushText = () => {
    if (textBuffer.length) segments.push({ type: "text", text: textBuffer.join("\n") });
    textBuffer = [];
  };

  let i = 0;
  while (i < lines.length) {
    const h = info[i];
    if (!h || !h.record) {
      textBuffer.push(lines[i]);
      i += 1;
      continue;
    }
    flushText();
    const { level } = h;
    const { id, title } = h.record;
    const record = { type: "record", level, id, title };
    const headingLine = lines[i];
    if (headingLine !== canonicalHeading(level, id, title)) record.heading_raw = headingLine;
    i += 1;

    // Fields: optional blank lines, then consecutive `- **Key:** value` lines
    // (with indented continuation lines).
    let j = i;
    while (j < lines.length && lines[j] === "" && !info[j]) j += 1;
    const fields = [];
    if (j < lines.length && FIELD_RE.test(lines[j]) && !info[j]) {
      const gap = j - i;
      if (gap !== 1) record.gap = gap;
      while (j < lines.length && !info[j]) {
        const m = lines[j].match(FIELD_RE);
        if (m) {
          const key = m[1];
          const value = m[2] === undefined ? "" : m[2];
          const field = { key, value };
          if (lines[j] !== canonicalField(key, value)) field.raw = lines[j];
          fields.push(field);
          j += 1;
        } else if (fields.length && CONTINUATION_RE.test(lines[j])) {
          const last = fields[fields.length - 1];
          last.continuation = last.continuation || [];
          last.continuation.push(lines[j]);
          j += 1;
        } else break;
      }
      i = j;
    }
    if (fields.length) record.fields = fields;

    // Body: until the next heading at the same or a higher level, or the next record
    // heading at any level (records are never nested).
    const bodyLines = [];
    while (i < lines.length && !(info[i] && (info[i].level <= level || info[i].record))) {
      bodyLines.push(lines[i]);
      i += 1;
    }
    record.body = bodyLines.length ? bodyLines.join("\n") : null;
    segments.push(record);
  }
  flushText();
  file.segments = segments;
  return file;
}

function renderRecordLines(rec) {
  const out = [rec.heading_raw !== undefined ? rec.heading_raw : canonicalHeading(rec.level, rec.id, rec.title)];
  if (rec.fields && rec.fields.length) {
    const gap = rec.gap === undefined ? 1 : rec.gap;
    for (let g = 0; g < gap; g += 1) out.push("");
    for (const f of rec.fields) {
      out.push(f.raw !== undefined ? f.raw : canonicalField(f.key, f.value));
      if (f.continuation) out.push(...f.continuation);
    }
  }
  if (rec.body !== null && rec.body !== undefined) out.push(...rec.body.split("\n"));
  return out;
}

function renderMarkdown(file) {
  const lines = [];
  for (const seg of file.segments) {
    if (seg.type === "text") lines.push(...seg.text.split("\n"));
    else lines.push(...renderRecordLines(seg));
  }
  let text = renderFrontmatter(file.frontmatter) + lines.join("\n");
  if (file.eol === "crlf") text = text.replace(/\n/g, "\r\n");
  if (file.bom) text = `﻿${text}`;
  return text;
}

// Flat, query-friendly view of records (derived; ignored by render).
function recordsOf(file, relativePath) {
  const out = [];
  // Line numbers are counted on the rendered file (front matter included).
  const fmLines = file.frontmatter ? renderFrontmatter(file.frontmatter).split("\n").length - 1 : 0;
  let line = fmLines + 1;
  for (const seg of file.segments) {
    if (seg.type === "record") {
      const fieldMap = {};
      const fieldIds = new Set();
      for (const f of seg.fields || []) {
        const value = [f.value, ...(f.continuation || []).map((c) => c.trim())].join(" ").trim();
        fieldMap[f.key] = fieldMap[f.key] === undefined ? value : `${fieldMap[f.key]}; ${value}`;
        for (const id of findIds(value)) if (id !== seg.id) fieldIds.add(id);
      }
      const mentions = findIds(seg.body || "").filter((id) => id !== seg.id && !fieldIds.has(id));
      out.push({ id: seg.id, title: seg.title, level: seg.level, fields: fieldMap, field_ids: [...fieldIds], mentions, file: relativePath, line });
      line += renderRecordLines(seg).length;
    } else {
      line += seg.text.split("\n").length;
    }
  }
  return out;
}

// The exact text of one record (heading, fields, body) inside a Markdown file, or null.
function recordText(fileText, id) {
  if (fileText === null || fileText === undefined) return null;
  const seg = parseMarkdown(fileText).segments.find((s) => s.type === "record" && s.id === id);
  return seg ? renderRecordLines(seg).join("\n").trimEnd() : null;
}

module.exports = { parseMarkdown, renderMarkdown, recordsOf, recordText, canonicalField, canonicalHeading };
