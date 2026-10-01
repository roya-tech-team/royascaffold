"use strict";

// Context Packs (plan 02 §7): everything one task needs, built from the task itself.
// No manifest file: the task's `Inputs` are the roots, expanded by one hop of typed relations.
// Deterministic, budgeted (profile `context_budget_tokens`, default 12000), never truncated:
// a pack over budget is refused so the task gets split instead.

const fs = require("fs");
const path = require("path");
const { recordText } = require("./parse/markdown.cjs");
const { patternList, matchesAny } = require("./glob.cjs");
const { section, changeBody } = require("./gates.cjs");

const DEFAULT_BUDGET = 12000;
const SKIP_HOP = new Set(["feature", "outcome", "milestone", "supports", "satisfies"]);
// One-hop neighbours are included by usefulness to the implementer:
//   full     rules the code must obey
//   compact  heading + fields, no body
//   titles   everything else (another scope, or planning records)
const FULL_KINDS = new Set(["contract", "invariant", "rule", "test", "decision", "concept"]);
const COMPACT_KINDS = new Set(["workflow", "nfr", "component", "action", "app"]);
const tokens = (text) => Math.ceil(text.length / 4);

function budgetOf(model) {
  return Number(model.profile.context_budget_tokens || model.profile.default_context_tokens) || DEFAULT_BUDGET;
}

function fileCache(model) {
  const cache = new Map();
  return (rel) => {
    if (!cache.has(rel)) cache.set(rel, fs.readFileSync(path.join(model.root, rel), "utf8"));
    return cache.get(rel);
  };
}

// The "> **What:** … / > **Read when:** …" card right after a file's first heading.
function headerCard(text) {
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const lines = body.split("\n");
  const h1 = lines.findIndex((l) => /^# /.test(l));
  if (h1 < 0) return null;
  const card = [];
  for (let i = h1 + 1; i < lines.length; i += 1) {
    if (!lines[i].trim() && !card.length) continue;
    if (/^>/.test(lines[i])) card.push(lines[i]);
    else break;
  }
  return card.length ? card.join("\n") : null;
}

function listFiles(root, rel) {
  const out = [];
  const walk = (dirRel) => {
    const abs = path.join(root, dirRel);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "dist" || e.name === "build") continue;
      const r = dirRel ? `${dirRel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r);
      else out.push(r);
    }
  };
  walk(rel);
  return out;
}

// Static part of a glob, e.g. "apps/web/src/calendar/**" -> "apps/web/src/calendar".
function globBase(pattern) {
  const parts = pattern.split("/");
  const i = parts.findIndex((p) => /[*?]/.test(p));
  return (i < 0 ? parts : parts.slice(0, i)).join("/");
}

function buildPack(model, status, taskId) {
  const task = model.records.get(taskId);
  if (!task || task.kind !== "task") throw new Error(`${taskId} is not a task`);
  const taskInfo = model.tasks.get(taskId);
  const change = taskInfo.change ? model.changes.get(taskInfo.change) : null;
  const read = fileCache(model);
  // Status bookkeeping lines (removed in 1.4, still present in 1.3 files) are dropped from the view.
  const STATUS_LINE = /^- \*\*(Knowledge status|Implementation status|Kind):\*\*/;
  const text = (id) => (recordText(read(model.records.get(id).file), id) || "").split("\n").filter((l) => !STATUS_LINE.test(l)).join("\n");
  // Heading and fields only (the body is left out); status lines from 1.3 are dropped.
  const compact = (id) => text(id).split("\n").filter((l, i) => i === 0 || /^- \*\*[^*]+:\*\*/.test(l)).join("\n");
  const sections = [];
  const add = (name, body) => {
    if (body && body.trim()) sections.push({ name, body: body.trimEnd() });
  };

  // Where this task fits.
  const where = [];
  if (change) {
    where.push(`- Change: ${change.id} · ${change.title} (${change.kind}, risk ${change.risk || "—"}, status ${change.status})`);
    for (const sid of change.slices) {
      const slice = model.slices.get(sid);
      if (!slice) continue;
      const feature = model.records.get(slice.feature);
      where.push(`- Slice: ${slice.id} · ${slice.title} — delivers ${slice.delivers.join(", ") || "—"}`);
      if (feature) where.push(`- Feature: ${feature.id} · ${feature.title}`);
    }
    if (change.affects.length) where.push(`- Affects: ${change.affects.join(", ")}`);
  }

  add("Your task", text(taskId));
  const allowed = patternList(task.fields["Allowed paths"]);
  add("Rules for this task", [
    `- Change only files matching: ${allowed.length ? allowed.map((p) => `\`${p}\``).join(", ") : "(no allowed paths: stop and ask)"}`,
    "- Do not invent public behavior, contracts, architecture, data migrations, dependencies or security rules that are not in this pack. If the task needs them, stop: `royascaff task " + taskId + ' block "<what is missing>"`.',
    `- When done: \`royascaff task ${taskId} done "<what was done / what is left>"\`.`,
  ].join("\n"));
  const { adaptersOf, readAdapter } = require("./adapters.cjs");
  for (const name of adaptersOf(model)) {
    const a = readAdapter(name);
    if (a && a.rules) add(`Adapter rules (${name})`, a.rules);
  }
  add("Where this fits", where.join("\n"));

  if (change) {
    const body = changeBody(model.root, change);
    const outcome = section(body, ["Outcome"]);
    const after = section(body, ["After-state", "After state", "Proposed after-state"]);
    add("Change outcome", outcome);
    add("Change design (after-state)", after);
  }

  // Inputs and one hop of typed relations.
  const inputs = task.relations.filter((r) => r.type === "inputs").map((r) => r.to).filter((id) => model.records.has(id));
  const included = new Set([taskId]);
  const inputTexts = [];
  for (const id of inputs) {
    if (included.has(id)) continue;
    included.add(id);
    inputTexts.push(text(id));
  }
  add("Inputs", inputTexts.join("\n\n"));
  const hop = [];
  const oneLine = [];
  for (const id of inputs) {
    const rec = model.records.get(id);
    const targets = rec.relations.map((r) => r).concat((model.incoming.get(id) || []).filter((x) => x.type === "verifies").map((x) => ({ type: "verified_by", to: x.from })));
    for (const r of targets) {
      if (included.has(r.to) || !model.records.has(r.to)) continue;
      const target = model.records.get(r.to);
      const mode = SKIP_HOP.has(r.type) ? "titles" : FULL_KINDS.has(target.kind) ? "full" : COMPACT_KINDS.has(target.kind) ? "compact" : "titles";
      if (mode === "titles") {
        if (!oneLine.some((l) => l.startsWith(`- ${r.to} `))) oneLine.push(`- ${r.to} · ${target.title} (${r.type} of ${id})`);
        continue;
      }
      included.add(r.to);
      hop.push(mode === "full" ? text(r.to) : compact(r.to));
    }
  }
  add("Related (one hop from the inputs)", hop.join("\n\n"));
  add("Also linked (titles only)", oneLine.join("\n"));

  // Code map: components among the inputs/related, and the files that exist in the allowed paths.
  const code = [];
  for (const id of included) {
    const rec = model.records.get(id);
    if (rec.kind === "component" && rec.fields.Code) code.push(`- ${id} · ${rec.title} → ${rec.fields.Code}`);
  }
  const files = [];
  for (const p of allowed) for (const f of listFiles(model.repo, globBase(p))) if (matchesAny(f, [p]) && !files.includes(f)) files.push(f);
  if (files.length) code.push(`- Existing files in the allowed paths (${files.length}): ${files.slice(0, 30).map((f) => `\`${f}\``).join(", ")}${files.length > 30 ? ", …" : ""}`);
  add("Code map", code.join("\n"));

  // Hand-off notes from the tasks of this change that are done.
  if (change) {
    const notes = change.tasks.filter((t) => t !== taskId && status.tasks.get(t).state === "done").map((t) => {
      const s = status.tasks.get(t);
      return `- ${t} · ${model.records.get(t).title} — ${s.last && s.last.note ? s.last.note : "done"}`;
    });
    add("Earlier tasks in this change", notes.join("\n"));
  }

  // Documents the task names explicitly (`Documents:` field) are included in full.
  const docs = patternList(task.fields.Documents);
  for (const d of docs) {
    const abs = path.join(model.root, d);
    if (!fs.existsSync(abs)) throw new Error(`${taskId} names document ${d}, which does not exist`);
    add(`Document · ${d}`, fs.readFileSync(abs, "utf8").replace(/^---\n[\s\S]*?\n---\n?/, ""));
  }

  // Header cards of the files the records come from.
  const cards = [];
  const seenFiles = new Set();
  for (const id of included) {
    const f = model.records.get(id).file;
    if (seenFiles.has(f)) continue;
    seenFiles.add(f);
    const card = headerCard(read(f));
    if (card) cards.push(`\`${f}\`\n${card}`);
  }
  add("Sources", cards.join("\n\n"));

  const title = `# Context · ${taskId} · ${task.title}`;
  const out = [title, "", "_Generated by `royascaff context` from the task's inputs. A view, not knowledge: do not edit._", ""];
  for (const s of sections) out.push(`## ${s.name}`, "", s.body, "");
  const packText = out.join("\n");
  const budget = budgetOf(model);
  return {
    task: taskId,
    change: change ? change.id : null,
    text: packText,
    tokens: tokens(packText),
    budget,
    within: tokens(packText) <= budget,
    sections: sections.map((s) => ({ name: s.name, tokens: tokens(s.body) })),
    records: [...included],
  };
}

module.exports = { buildPack, budgetOf, headerCard, globBase, DEFAULT_BUDGET };
