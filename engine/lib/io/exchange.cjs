"use strict";

// Markdown <-> JSON exchange (the 2.0 import/export format) and the round-trip check.

const fs = require("fs");
const path = require("path");
const { parseMarkdown, renderMarkdown, recordsOf } = require("../parse/markdown.cjs");
const { findProject, listMarkdown, slash } = require("../project.cjs");

const FORMAT = "royascaff-exchange";
const FORMAT_VERSION = 1;

function exportProject(start) {
  const project = findProject(start);
  const files = [];
  const records = [];
  for (const { full, rel } of listMarkdown(project)) {
    const parsed = parseMarkdown(fs.readFileSync(full, "utf8"));
    files.push({ path: rel, ...parsed });
    records.push(...recordsOf(parsed, rel));
  }
  return {
    format: FORMAT,
    format_version: FORMAT_VERSION,
    layout: project.layout,
    project_dir: slash(path.relative(project.repo, project.projectDir)) || ".",
    files,
    records,
  };
}

function renderExport(data, outDir) {
  if (data.format !== FORMAT) throw new Error("Not a RoyaScaff exchange file");
  const written = [];
  for (const file of data.files) {
    const target = path.join(outDir, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, renderMarkdown(file));
    written.push(target);
  }
  return written;
}

function stats(files) {
  const s = { files: files.length, records: 0, fields: 0, raw_headings: 0, raw_fields: 0, raw_frontmatter: 0 };
  for (const f of files) {
    if (f.frontmatter && f.frontmatter.raw !== undefined) s.raw_frontmatter += 1;
    for (const seg of f.segments) {
      if (seg.type !== "record") continue;
      s.records += 1;
      if (seg.heading_raw !== undefined) s.raw_headings += 1;
      for (const field of seg.fields || []) {
        s.fields += 1;
        if (field.raw !== undefined) s.raw_fields += 1;
      }
    }
  }
  return s;
}

// Markdown -> JSON text -> parse -> Markdown, compared byte for byte with the source.
function roundTrip(start) {
  const project = findProject(start);
  const exported = exportProject(start);
  const reparsed = JSON.parse(JSON.stringify(exported));
  const mismatches = [];
  for (const file of reparsed.files) {
    const original = fs.readFileSync(path.join(project.projectDir, file.path), "utf8");
    const rendered = renderMarkdown(file);
    if (rendered !== original) {
      let at = 0;
      while (at < original.length && original[at] === rendered[at]) at += 1;
      mismatches.push({ path: file.path, first_difference_at: at });
    }
  }
  return { ok: mismatches.length === 0, mismatches, stats: stats(exported.files), layout: exported.layout, project_dir: exported.project_dir };
}

module.exports = { exportProject, renderExport, roundTrip, FORMAT, FORMAT_VERSION };
