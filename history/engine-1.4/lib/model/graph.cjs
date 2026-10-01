"use strict";

// The project model: every record, its typed relations and mentions, and the 1.4 work
// hierarchy (Outcome → Feature → Slice → Change → Task), plus validation issues.

const path = require("path");
const { findIds } = require("../parse/ids.cjs");
const { exportProject } = require("../io/exchange.cjs");
const { kindOf, relationType, HORIZONS, CHANGE_KINDS, INTENT_TO_KIND, CHANGE_STATUSES } = require("./vocabulary.cjs");
const { readTables, cellIds } = require("./tables.cjs");
const { renderMarkdown } = require("../parse/markdown.cjs");
const { parseLog } = require("../events.cjs");

// Generated views and migrated leftovers are never part of the model.
// Saved Context Packs (changes/<CHG>/contexts/) are copies of records, never knowledge.
const EXCLUDED = [/^generated\//, /^contexts\/generated\//, /^_legacy\//, /^STATUS\.md$/, /^changes\/[^/]+\/contexts\//];

function asList(value) {
  if (value === undefined || value === null || value === "") return [];
  return (Array.isArray(value) ? value : [value]).map(String).filter(Boolean);
}

function projectCode(files, fmProfile) {
  if (fmProfile && fmProfile.project_code) return String(fmProfile.project_code);
  const counts = new Map();
  for (const f of files) for (const seg of f.segments) {
    if (seg.type !== "record") continue;
    const parts = seg.id.split("-");
    if (parts.length >= 3) counts.set(parts[1], (counts.get(parts[1]) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "APP";
}

function bodyStartLine(seg, headingLine) {
  if (!seg.fields || !seg.fields.length) return headingLine + 1;
  const gap = seg.gap === undefined ? 1 : seg.gap;
  const fieldLines = seg.fields.reduce((n, f) => n + 1 + (f.continuation ? f.continuation.length : 0), 0);
  return headingLine + 1 + gap + fieldLines;
}

function buildModel(start) {
  const data = exportProject(start);
  const files = data.files.filter((f) => !EXCLUDED.some((re) => re.test(f.path)));
  const profileFile = files.find((f) => f.path === "profile.md");
  const profile = profileFile && profileFile.frontmatter ? profileFile.frontmatter.data : {};
  const is14 = String(profile.royascaff || "").startsWith("1.4");

  const located = require("../project.cjs").findProject(start);
  const model = {
    root: located.projectDir,
    repo: located.repo,
    layout: data.layout,
    projectDir: data.project_dir,
    is14,
    code: projectCode(files, profile),
    profile,
    records: new Map(),
    features: new Map(),
    slices: new Map(),
    changes: new Map(),
    tasks: new Map(),
    evidence: new Map(),
    documents: [],
    issues: [],
  };
  const issue = (severity, code, message, where) => model.issues.push({ severity, code, message, where });
  const addRecord = (rec) => {
    if (model.records.has(rec.id)) {
      const prev = model.records.get(rec.id);
      issue("error", "duplicate-id", `${rec.id} is defined twice`, `${prev.file}:${prev.line} and ${rec.file}:${rec.line}`);
      return false;
    }
    model.records.set(rec.id, rec);
    return true;
  };

  // 1. Records from headings, documents and changes from front matter.
  const recordsByFile = new Map();
  for (const r of data.records) {
    if (!recordsByFile.has(r.file)) recordsByFile.set(r.file, []);
    recordsByFile.get(r.file).push(r);
  }
  for (const file of files) {
    const fm = file.frontmatter ? file.frontmatter.data : null;
    const headingIds = new Set(file.segments.filter((s) => s.type === "record").map((s) => s.id));
    if (fm && fm.document_status) model.documents.push({ file: file.path, id: fm.document_id ? String(fm.document_id) : null, status: String(fm.document_status) });
    if (fm) {
      for (const [key, value] of Object.entries(fm)) {
        if (!/_id$/.test(key) || typeof value !== "string" || !findIds(value).includes(value)) continue;
        // change_id defines a change only in change.md (elsewhere it is a back-reference);
        // an ID that is also a heading in the same file is defined by that heading.
        if (key === "change_id" || headingIds.has(value)) continue;
        addRecord({ id: value, kind: key === "document_id" ? "document" : key.replace(/_id$/, ""), title: fm.title || file.path, file: file.path, line: 1, fields: {}, relations: [], mentions: [], origin: "front-matter" });
      }
      if (fm.change_id && path.posix.basename(file.path) === "change.md") {
        const id = String(fm.change_id);
        const kind = fm.kind ? String(fm.kind) : INTENT_TO_KIND[String(fm.intent || "").toLowerCase()] || null;
        const change = {
          id,
          kind,
          status: fm.status ? String(fm.status) : null,
          risk: fm.risk ? String(fm.risk) : null,
          slices: asList(fm.slice),
          slice: asList(fm.slice)[0] || null,
          affects: asList(fm.affects),
          dir: path.posix.dirname(file.path),
          file: file.path,
          tasks: [],
        };
        model.changes.set(id, change);
        const h1 = file.segments.filter((x) => x.type === "text").map((x) => x.text.match(/^# (.+)$/m)).find(Boolean);
        change.title = h1 ? h1[1].replace(new RegExp(`^${id}\\s*[·—–-]\\s*`), "").replace(/^Change\s*[·—–-]\s*/, "").trim() : id;
        addRecord({ id, kind: "change", title: change.title, file: file.path, line: 1, fields: {}, relations: [
          ...change.slices.map((to) => ({ type: "slice", to, field: "slice" })),
          ...change.affects.map((to) => ({ type: "affects", to, field: "affects" })),
        ], mentions: [], origin: "front-matter" });
      }
    }
    const flat = recordsByFile.get(file.path) || [];
    let k = 0;
    for (const seg of file.segments) {
      if (seg.type !== "record") continue;
      const r = flat[k++];
      const relations = [];
      const fieldMentions = new Set();
      for (const f of seg.fields || []) {
        const value = [f.value, ...(f.continuation || []).map((c) => c.trim())].join(" ");
        const type = relationType(f.key);
        for (const id of findIds(value)) {
          if (id === seg.id) continue;
          if (type) relations.push({ type, to: id, field: f.key });
          else fieldMentions.add(id);
        }
      }
      const rec = {
        id: seg.id,
        kind: kindOf(seg.id),
        title: seg.title,
        file: file.path,
        line: r.line,
        fields: r.fields,
        relations,
        mentions: [...new Set([...fieldMentions, ...r.mentions])].filter((id) => !relations.some((x) => x.to === id)),
        origin: "record",
      };
      addRecord(rec);

      // 2. Features and their slice tables.
      if (rec.kind === "feature") {
        const horizon = (r.fields.Horizon || "").trim().toLowerCase();
        if (horizon && !HORIZONS.includes(horizon)) issue("error", "invalid-horizon", `${rec.id} has horizon "${horizon}" (use now, next, later, backlog)`, `${rec.file}:${rec.line}`);
        const feature = { id: rec.id, horizon: HORIZONS.includes(horizon) ? horizon : "backlog", horizonSet: Boolean(horizon), milestone: (relations.find((x) => x.type === "milestone") || {}).to || null, slices: [] };
        model.features.set(rec.id, feature);
        const start = bodyStartLine(seg, rec.line);
        for (const table of readTables(seg.body || "")) {
          const header = table.header.map((h) => h.toLowerCase());
          if (header[0] !== "slice") continue;
          const col = (name) => header.indexOf(name);
          for (const row of table.rows) {
            const cell = (name) => (col(name) >= 0 ? row.cells[col(name)] || "" : "");
            const [sid] = cellIds(cell("slice"), findIds);
            const where = `${rec.file}:${start + row.lineOffset}`;
            if (!sid) { issue("error", "slice-without-id", `A slice row under ${rec.id} has no SLC- ID`, where); continue; }
            const slice = {
              id: sid,
              feature: rec.id,
              title: cell("title"),
              order: Number.parseInt(cell("order"), 10) || null,
              depends_on: cellIds(cell("depends on"), findIds),
              delivers: cellIds(cell("delivers"), findIds),
              planned_at: cell("planned at").replace(/`/g, "") || null,
              file: rec.file,
              line: start + row.lineOffset,
            };
            if (addRecord({ id: sid, kind: "slice", title: slice.title, file: rec.file, line: slice.line, fields: {}, relations: [
              { type: "feature", to: rec.id, field: "Feature" },
              ...slice.depends_on.map((to) => ({ type: "depends_on", to, field: "Depends on" })),
              ...slice.delivers.map((to) => ({ type: "delivers", to, field: "Delivers" })),
            ], mentions: [], origin: "slice-row" })) {
              model.slices.set(sid, slice);
              feature.slices.push(sid);
            }
          }
        }
      }

      // Standalone slice records (`### SLC-… · Title` with fields) are also accepted.
      if (rec.kind === "slice") {
        const rel = (t) => relations.filter((x) => x.type === t).map((x) => x.to);
        const slice = { id: rec.id, feature: rel("feature")[0] || null, title: rec.title, order: Number.parseInt(r.fields.Order, 10) || null, depends_on: rel("depends_on"), delivers: rel("delivers"), planned_at: (r.fields["Planned at"] || "").replace(/`/g, "") || null, file: rec.file, line: rec.line };
        model.slices.set(rec.id, slice);
      }
    }
  }

  // A feature's own slice table is structure, not a mention.
  for (const feature of model.features.values()) {
    const rec = model.records.get(feature.id);
    const own = new Set();
    for (const sid of feature.slices) {
      const sl = model.slices.get(sid);
      [sid, ...sl.depends_on, ...sl.delivers].forEach((x) => own.add(x));
    }
    rec.mentions = rec.mentions.filter((m) => !own.has(m));
  }

  // Attach standalone slices to their features.
  for (const slice of model.slices.values()) {
    const feature = slice.feature && model.features.get(slice.feature);
    if (feature && !feature.slices.includes(slice.id)) feature.slices.push(slice.id);
  }

  // 3. Tasks belong to the change whose folder contains them.
  const changeDirs = [...model.changes.values()].sort((a, b) => b.dir.length - a.dir.length);
  for (const rec of model.records.values()) {
    if (rec.kind !== "task") continue;
    const change = changeDirs.find((c) => rec.file.startsWith(`${c.dir}/`));
    model.tasks.set(rec.id, { id: rec.id, change: change ? change.id : null, file: rec.file, line: rec.line, depends_on: rec.relations.filter((x) => x.type === "depends_on").map((x) => x.to) });
    if (change) change.tasks.push(rec.id);
    else issue("warning", "task-outside-change", `${rec.id} is not inside a change folder`, `${rec.file}:${rec.line}`);
  }

  // 4. Event logs (changes/<CHG>/log.md) and evidence records.
  const filesByPath = new Map(files.map((f) => [f.path, f]));
  for (const change of model.changes.values()) {
    const logFile = filesByPath.get(`${change.dir}/log.md`);
    change.events = [];
    if (logFile) {
      const { events, problems } = parseLog(renderMarkdown(logFile));
      change.events = events;
      for (const p of problems) issue("warning", "log-problem", `${change.id} log ${p}`, logFile.path);
      for (const e of events) {
        const ok = e.target === change.id || change.tasks.includes(e.target);
        if (!ok) issue("error", "event-target-unknown", `${change.id} log line ${e.line}: ${e.event} targets ${e.target}, which is not this change or one of its tasks`, logFile.path);
      }
    }
  }
  for (const rec of model.records.values()) {
    if (rec.kind !== "evidence") continue;
    const change = changeDirs.find((c) => rec.file.startsWith(`${c.dir}/`));
    const resultText = String(rec.fields.Result || "").trim().toLowerCase();
    const result = resultText.startsWith("pass") ? "pass" : resultText.startsWith("fail") ? "fail" : resultText ? "other" : "missing";
    const proves = [...new Set(rec.relations.filter((x) => ["proves", "verifies", "satisfies"].includes(x.type)).map((x) => x.to))];
    model.evidence.set(rec.id, { id: rec.id, change: change ? change.id : null, result, proves, git: rec.fields["Git commit"] || null, file: rec.file, line: rec.line });
  }

  for (const change of model.changes.values()) {
    if (change.status === "cancelled") continue;
    for (const sid of change.slices) {
      const slice = model.slices.get(sid);
      if (slice) slice.change = change.id;
    }
  }

  validate(model, issue);
  if (model.is14) readability(model, files, issue);
  model.incoming = incomingIndex(model);
  return model;
}

function validate(model, issue) {
  const known = model.records;
  const where = (rec) => `${rec.file}:${rec.line}`;
  for (const rec of known.values()) {
    for (const rel of rec.relations) {
      if (rec.kind === "change" && rel.type === "slice") continue; // reported as unknown-slice
      if (!known.has(rel.to)) issue("error", "unresolved-relation", `${rec.id} → ${rel.field}: ${rel.to} does not exist`, where(rec));
    }
    for (const id of rec.mentions) {
      if (!known.has(id)) issue("warning", "unresolved-mention", `${rec.id} mentions ${id}, which does not exist`, where(rec));
    }
  }
  for (const slice of model.slices.values()) {
    const at = `${slice.file}:${slice.line}`;
    if (!slice.feature) issue("error", "slice-without-feature", `${slice.id} does not belong to a feature`, at);
    for (const d of slice.depends_on) if (known.has(d) && !model.slices.has(d)) issue("error", "slice-depends-on-non-slice", `${slice.id} depends on ${d}, which is not a slice`, at);
    for (const d of slice.delivers) if (known.has(d) && !["requirement", "nfr", "use-case"].includes(known.get(d).kind)) issue("warning", "slice-delivers-non-requirement", `${slice.id} delivers ${d} (${known.get(d).kind}); slices should deliver requirements`, at);
  }
  const openBySlice = new Map();
  for (const change of model.changes.values()) {
    const at = change.file;
    if (!change.kind) issue(model.is14 ? "error" : "warning", "change-without-kind", `${change.id} has no kind (${CHANGE_KINDS.join(", ")})`, at);
    else if (!CHANGE_KINDS.includes(change.kind)) issue("error", "invalid-change-kind", `${change.id} has kind "${change.kind}"`, at);
    if (!change.status || !CHANGE_STATUSES.includes(change.status)) issue("error", "invalid-change-status", `${change.id} has status "${change.status}"`, at);
    if (change.kind === "feature" && !change.slices.length) issue(model.is14 ? "error" : "warning", "feature-change-without-slice", `${change.id} is a feature change but names no slice`, at);
    for (const sid of change.slices) if (!model.slices.has(sid)) issue("error", "unknown-slice", `${change.id} names slice ${sid}, which is not on the roadmap`, at);
    if (["bug", "polish"].includes(change.kind) && !change.affects.length) issue("warning", "fix-without-affects", `${change.id} (${change.kind}) does not say which feature or requirement it affects`, at);
    if (change.status !== "cancelled") {
      for (const sid of change.slices) {
        if (openBySlice.has(sid)) issue("error", "slice-has-two-changes", `${sid} is claimed by ${openBySlice.get(sid)} and ${change.id}`, at);
        else openBySlice.set(sid, change.id);
      }
    }
  }
  unmappedSource(model, issue);
  for (const feature of model.features.values()) {
    const rec = known.get(feature.id);
    if (model.is14 && !feature.horizonSet) issue("warning", "feature-without-horizon", `${feature.id} has no Horizon (defaults to backlog)`, where(rec));
  }
}

// Code map (glob form): source files under each declared app (APP- record `Path:`) should be
// owned by a component's `Code:` globs. Listed as one warning per app, never per file.
function unmappedSource(model, issue) {
  const { listFiles, SOURCE_EXTENSIONS } = require("../files.cjs");
  const { patternList, matchesAny } = require("../glob.cjs");
  const globs = [...model.records.values()].filter((r) => r.kind === "component").flatMap((r) => patternList(r.fields.Code));
  const extra = patternList(model.profile.code_exclude);
  for (const app of model.records.values()) {
    if (app.kind !== "app" || !app.fields.Path) continue;
    const base = app.fields.Path.replace(/`/g, "").trim().replace(/\/+$/, "");
    const files = listFiles(model.repo, base).filter((f) => SOURCE_EXTENSIONS.includes(path.extname(f)) && !matchesAny(f, extra));
    const unmapped = files.filter((f) => !matchesAny(f, globs));
    if (unmapped.length) issue("warning", "unmapped-source", `${unmapped.length} source file(s) in ${base} belong to no component (e.g. ${unmapped.slice(0, 3).join(", ")}) — add them to a component's Code globs or to code_exclude`, `${app.file}:${app.line}`);
  }
}

// Readability rules for 1.4 projects (plan 02 §6): every knowledge file starts with a header card,
// stays short enough to scan, and business documents use business language.
const MAX_LINES = 300;
const TECHNICAL_WORDS = ["endpoint", "endpoints", "component", "components", "database", "props", "css", "schema", "controller", "repository", "microservice", "sql", "json", "hook", "hooks"];

function readability(model, files, issue) {
  const { headerCard } = require("../context.cjs");
  for (const file of files) {
    if (!file.path.startsWith("knowledge/")) continue;
    const text = renderMarkdown(file);
    if (!headerCard(text)) issue("warning", "missing-header-card", `${file.path} has no header card ("> **What:** …" and "> **Read when:** …" under the title)`, file.path);
    const lines = text.split("\n").length;
    if (lines > MAX_LINES) issue("warning", "large-file", `${file.path} has ${lines} lines (over ${MAX_LINES}): split it by module or feature`, file.path);
    if (file.path.startsWith("knowledge/01-business/")) {
      const prose = text.replace(/^---\n[\s\S]*?\n---\n?/, "").replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "");
      const found = TECHNICAL_WORDS.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(prose));
      if (found.length) issue("warning", "technical-words-in-business", `${file.path} uses technical words (${found.join(", ")}): keep business documents in business language`, file.path);
    }
  }
}

function incomingIndex(model) {
  const incoming = new Map();
  for (const rec of model.records.values()) {
    for (const rel of rec.relations) {
      if (!incoming.has(rel.to)) incoming.set(rel.to, []);
      incoming.get(rel.to).push({ from: rec.id, type: rel.type });
    }
  }
  return incoming;
}

function errorsOf(model) {
  return model.issues.filter((i) => i.severity === "error");
}

module.exports = { buildModel, errorsOf };
