"use strict";

// Adoption at scale (plan file 02 §5, E8). A big module cannot be adopted in one session, so:
//   - every module has a size budget (tokens of source a session reads); a module over it is split into
//     sub-modules, and each is a checkpoint (a part of the module a session can finish and record);
//   - `adopt --plan` opens one `knowledge` change per module that is not fully owned, with its checkpoints,
//     so different agents can take different modules (claims come with engine 1.7);
//   - a checkpoint is done when every file in it is owned by a component: the state is derived from the code
//     ownership, never typed.
// The target: a 200k-line repository adopted module by module, no single session over 60% of the context window.

const fs = require("fs");
const path = require("path");
const { matchesAny, patternList } = require("./glob.cjs");
const { toPosix } = require("./project.cjs");

const DEFAULT_BUDGET = 60000; // tokens of source one checkpoint holds
const DEFAULT_WINDOW = 200000; // the context window a session has
const MAX_DEPTH = 10;

const tokensOf = (bytes) => Math.ceil(bytes / 4);

function budgetOf(model, flags = {}) {
  const given = Number(flags.budget) || Number(model.profile.adopt_budget_tokens);
  return given > 0 ? Math.floor(given) : DEFAULT_BUDGET;
}
const windowOf = (model) => Number(model.profile.context_window_tokens) || DEFAULT_WINDOW;

// Splits one folder's files into parts no bigger than `budget` tokens: by sub-folder (recursively), then the small
// neighbours are packed together. `files` are { path, tokens } below `prefix`.
function split(prefix, files, budget, depth = 0) {
  const total = files.reduce((n, f) => n + f.tokens, 0);
  if (total <= budget || depth >= MAX_DEPTH) return [{ label: prefix, globs: [`${prefix}/**`], files }];
  const direct = [];
  const children = new Map();
  for (const f of files) {
    const rest = f.path.slice(prefix.length + 1);
    const i = rest.indexOf("/");
    if (i < 0) { direct.push(f); continue; }
    const name = rest.slice(0, i);
    if (!children.has(name)) children.set(name, []);
    children.get(name).push(f);
  }
  const parts = [];
  for (const name of [...children.keys()].sort()) parts.push(...split(`${prefix}/${name}`, children.get(name), budget, depth + 1));
  if (direct.length) {
    const sum = direct.reduce((n, f) => n + f.tokens, 0);
    if (sum <= budget) parts.push({ label: `${prefix}/*`, globs: [`${prefix}/*`], files: direct });
    else {
      // The files directly in one folder are more than a session holds: take them in order, a run of files per part.
      let run = [];
      let used = 0;
      const flush = () => {
        if (!run.length) return;
        const first = run[0].path.slice(prefix.length + 1);
        const last = run[run.length - 1].path.slice(prefix.length + 1);
        parts.push({ label: run.length === 1 ? `${prefix}/${first}` : `${prefix}/${first} … ${last}`, globs: run.map((f) => f.path), files: run });
        run = [];
        used = 0;
      };
      for (const f of [...direct].sort((a, b) => a.path.localeCompare(b.path))) {
        if (run.length && used + f.tokens > budget) flush();
        run.push(f);
        used += f.tokens;
      }
      flush();
    }
  }
  return pack(parts, budget);
}

// Neighbouring parts that fit together in one budget are one checkpoint.
function pack(parts, budget) {
  const out = [];
  let cur = null;
  const sum = (p) => p.files.reduce((n, f) => n + f.tokens, 0);
  for (const p of parts) {
    const t = sum(p);
    if (cur && sum(cur) + t <= budget) {
      cur = { label: `${cur.label} + ${p.label}`, globs: [...cur.globs, ...p.globs], files: [...cur.files, ...p.files] };
    } else {
      if (cur) out.push(cur);
      cur = p;
    }
  }
  if (cur) out.push(cur);
  return out;
}

// The plan for every module that still has code no component owns.
function planOf(model, adoption, flags = {}) {
  const budget = budgetOf(model, flags);
  const window = windowOf(model);
  const modules = [];
  for (const m of adoption.modules) {
    if (!m.unowned.length) continue;
    const files = m.unowned.map((p) => {
      let bytes = 0;
      try { bytes = fs.statSync(path.join(model.repo, p)).size; } catch { /* a file that vanished counts for nothing */ }
      return { path: p, tokens: tokensOf(bytes) };
    });
    const base = m.module.replace(/ \(root files\)$/, "");
    const root = /\(root files\)/.test(m.module);
    const parts = root ? [{ label: m.module, globs: files.map((f) => f.path), files }] : split(base, files, budget);
    const checkpoints = parts.map((p, i) => ({
      n: i + 1,
      part: p.label,
      globs: p.globs,
      files: p.files.length,
      tokens: p.files.reduce((n, f) => n + f.tokens, 0),
      over_budget: p.files.reduce((n, f) => n + f.tokens, 0) > budget,
    }));
    modules.push({
      module: m.module,
      app: m.app,
      files: m.files,
      unowned: m.unowned.length,
      tokens: files.reduce((n, f) => n + f.tokens, 0),
      split: checkpoints.length > 1,
      checkpoints,
    });
  }
  const largest = modules.reduce((n, m) => Math.max(n, ...m.checkpoints.map((c) => c.tokens)), 0);
  return { budget_tokens: budget, context_window_tokens: window, largest_checkpoint_tokens: largest, session_share_percent: Math.round((largest / window) * 100), within_session_budget: largest / window <= 0.6, modules };
}

const CHECKPOINTS_TITLE = "Checkpoints";

// The `## Checkpoints` table the plan writes into an adoption change: [{ n, part, files, tokens, globs }].
function parseCheckpoints(body) {
  const { section } = require("./gates.cjs");
  const { readTables } = require("./model/tables.cjs");
  const text = section(body, [CHECKPOINTS_TITLE]);
  const table = text ? readTables(text).find((t) => (t.header[0] || "") === "#") : null;
  if (!table) return [];
  return table.rows.map((r) => ({ n: Number(r.cells[0]) || 0, part: (r.cells[1] || "").replace(/`/g, "").trim(), files: Number(r.cells[2]) || 0, tokens: Number(String(r.cells[3] || "").replace(/[^\d]/g, "")) || 0, globs: patternList(r.cells[4] || "") }));
}

function renderCheckpoints(checkpoints, budget) {
  const { escapeCell } = require("./model/tables.cjs");
  const lines = [`## ${CHECKPOINTS_TITLE}`, "", `Each checkpoint is a part of the module one session can finish (budget ${budget} tokens of source). Take them in order; a checkpoint is done when a component owns every file in it (\`royascaff adopt\` shows the progress). Describe the part, add its component and records, then record the step.`, "", "| # | Part | Files | ~Tokens | Code globs |", "|---|---|---|---|---|"];
  for (const c of checkpoints) lines.push(`| ${c.n} | ${escapeCell(c.part)} | ${c.files} | ${c.tokens} | ${c.globs.map((g) => `\`${g}\``).join(", ")} |`);
  return lines.join("\n");
}

// Progress of the adoption changes, from what the components own now: for each knowledge change that has a `module`.
function progressOf(model, adoption) {
  const out = [];
  const { changeBody } = require("./gates.cjs");
  for (const change of model.changes.values()) {
    if (!change.module || change.status === "cancelled") continue;
    const m = adoption.modules.find((x) => x.module === change.module);
    const cps = parseCheckpoints(changeBody(model.root, change));
    const rows = cps.map((c) => {
      const left = m ? m.unowned.filter((f) => matchesAny(f, c.globs)).length : 0;
      return { n: c.n, part: c.part, files: c.files, remaining: left, done: left === 0 };
    });
    out.push({ change: change.id, module: change.module, status: change.status, percent: m ? m.percent : 100, checkpoints: rows, done: rows.filter((r) => r.done).length, total: rows.length });
  }
  return out.sort((a, b) => a.module.localeCompare(b.module));
}

// adopt --plan [--budget N]: one `knowledge` change per module that is not fully owned (skipping modules that have one),
// each with its checkpoints. Idempotent: run it again after more code appears.
function planCommand(start, flags = {}) {
  const { buildModel } = require("./model/graph.cjs");
  const { adoption } = require("./commands/adopt.cjs");
  const work = require("./commands/work.cjs");
  const { appendEvent } = require("./events.cjs");
  const { headShort } = require("./git.cjs");
  const { who } = require("./identity.cjs");
  const model = buildModel(start);
  const plan = planOf(model, adoption(model), flags);
  const lite = { records: new Map(model.records), code: model.code, profile: model.profile, root: model.root, repo: model.repo };
  const created = [];
  const skipped = [];
  for (const m of plan.modules) {
    const have = [...model.changes.values()].find((c) => c.module === m.module && c.status !== "cancelled");
    if (have) {
      m.change = have.id;
      m.created = false;
      skipped.push({ module: m.module, change: have.id });
      continue;
    }
    const made = work.createChange(start, lite, { kind: "knowledge", title: `Adopt ${m.module}`, module: m.module }, { ...flags, risk: "low", fast: true });
    lite.records.set(made.id, { id: made.id });
    const file = path.join(model.root, made.dir, "change.md");
    const intro = `\n## Plan\n\nAdopt \`${m.module}\`: ${m.unowned} file(s) no component owns, about ${m.tokens} tokens of source. Start with \`royascaff scan ${m.module}\`, describe what the code does as requirements, components and decisions (mark what you only guessed with \`--basis inferred\`), and keep every session under the checkpoint budget.\n`;
    fs.appendFileSync(file, `${intro}\n${renderCheckpoints(m.checkpoints, plan.budget_tokens)}\n`);
    m.change = made.id;
    m.created = true;
    created.push(made.id);
  }
  if (created.length) {
    appendEvent(model.root, "project", { event: "adoption.planned", target: "project", by: who(flags, model.repo), git: headShort(model.repo) || "—", note: `${created.length} adoption change(s) for ${plan.modules.length} module(s), budget ${plan.budget_tokens} tokens per checkpoint (${created.join(", ")})` });
    const after = buildModel(start);
    const bad = after.issues.filter((i) => i.severity === "error" && created.some((id) => (i.where || "").includes(id)));
    if (bad.length) throw Object.assign(new Error(`The adoption changes do not validate:\n${bad.map((b) => `  - ${b.message}`).join("\n")}`), { code: "CHECK_FAILED" });
    work.refreshBoard(start);
  }
  const lines = [`Adoption plan: ${plan.modules.length} module(s) with code no component owns; checkpoint budget ${plan.budget_tokens} tokens of source (the largest checkpoint is ${plan.largest_checkpoint_tokens} tokens, ${plan.session_share_percent}% of a ${plan.context_window_tokens}-token session)`];
  for (const m of plan.modules) lines.push(`  ${m.created ? "+" : "="} ${m.module.padEnd(40)} ${String(m.unowned).padStart(5)} file(s) · ~${m.tokens} tokens · ${m.checkpoints.length} checkpoint(s) · ${m.change}`);
  lines.push(created.length ? `Opened ${created.length} knowledge change(s): different agents can take different modules.` : plan.modules.length ? "Every module already has its adoption change." : "Every module is owned by a component.");
  return { mode: "plan", ...plan, created, skipped, text: lines.join("\n") };
}

module.exports = { DEFAULT_BUDGET, DEFAULT_WINDOW, budgetOf, windowOf, split, pack, planOf, planCommand, tokensOf, parseCheckpoints, renderCheckpoints, progressOf, toPosix };