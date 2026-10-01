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

// The complete export for other programs (Studio's indexer): the exchange document plus the typed
// links, the derived status, the evidence and the board, all rebuilt from the repo.
function exportFull(start) {
  const base = exportProject(start);
  const { buildModel } = require("../model/graph.cjs");
  const { deriveStatus } = require("../derive/status.cjs");
  const { computeDrift } = require("../derive/drift.cjs");
  const { renderBoard } = require("../views/board.cjs");
  const model = buildModel(start);
  const status = deriveStatus(model);
  const links = [];
  for (const rec of model.records.values()) for (const rel of rec.relations) links.push({ from: rec.id, type: rel.type, to: rel.to, resolved: model.records.has(rel.to) });
  const plain = (map) => Object.fromEntries([...map.entries()].map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]));
  return {
    ...base,
    engine: require("../contract.cjs").ENGINE_VERSION,
    links,
    status: { features: plain(status.features), requirements: plain(status.requirements), slices: plain(status.slices), changes: plain(status.changes), tasks: plain(status.tasks) },
    evidence: [...model.evidence.values()],
    issues: model.issues,
    board: renderBoard(model, status, computeDrift(model, status)),
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

module.exports = { exportProject, exportFull, renderExport, roundTrip, FORMAT, FORMAT_VERSION };
