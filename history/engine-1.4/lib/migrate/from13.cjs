"use strict";

// 1.3 → 1.4 converter. Builds a MigrationPlan (nothing is written here).
//
//  1. Layout: knowledge zones move into project/ (legacy-root layout); changes/active|archive/<id>
//     become changes/<id>; generated/ and contexts/ (1.3 views and saved packs) go to
//     project/_legacy/1.3/.
//  2. Hand-typed "Implementation status" / "Knowledge status" lines are removed (1.4 derives
//     status); their values are kept as hints in project/_legacy/1.3/MIGRATION.md.
//  3. Knowledge files get a header card; the profile gets royascaff: 1.4, project_code and APP-
//     records from source_roots and command_* fields.
//  4. Features get a Horizon and, for every feature change, a slice row that lists what the
//     change delivered (from its tasks' inputs and its own text, "A through B" ranges expanded).
//     The change gets kind and slice; its status is kept.
//  5. Each change gets log.md: change.opened, migration.applied, and task events from the old
//     task statuses.

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { INTENT_TO_KIND } = require("../model/vocabulary.cjs");
const { logTemplate, nowIso } = require("../events.cjs");
const { escapeCell } = require("../model/tables.cjs");
const { MigrationPlan, listAll } = require("./plan.cjs");
const c = require("./common.cjs");

const MOVE_ZONES = ["knowledge", "changes", "evidence", "releases", "incidents"];
const LEGACY_ZONES = ["generated", "contexts"];
const REQ_KINDS = ["requirement", "nfr", "use-case"];
const DONE_STATES = ["implemented", "verified", "done", "reconciled"];

function posix(p) {
  return p.split(path.sep).join("/");
}

// New repo-relative path of a file given its path relative to the old project folder.
function newPathOf(rel) {
  let m = rel.match(/^changes\/(?:active|archive)\/([^/]+)\/(.*)$/);
  if (m) return `project/changes/${m[1]}/${m[2]}`;
  m = rel.match(/^(generated|contexts)\/(.*)$/);
  if (m) return `project/_legacy/1.3/${m[1]}/${m[2]}`;
  return `project/${rel}`;
}

function buildPlan13(repo, flags = {}) {
  const model = buildModel(repo);
  const projectRel = posix(path.relative(repo, model.root)); // "" (legacy root) or "project"
  const oldRel = (rel) => (projectRel ? `${projectRel}/${rel}` : rel);
  const plan = new MigrationPlan(repo);
  const report = { from: "1.3", archived: [], features: [], slices: [], changes: [], apps: [], hints: [], notes: [] };
  const head = gitHead(repo);
  const when = nowIso();
  const by = flags.by || "royascaff-migrate";

  // 1. Moves.
  const files = [];
  if (projectRel) {
    for (const f of listAll(model.root)) if (!f.split("/").some((s) => s.startsWith(".") || s === "node_modules")) files.push(f);
  } else {
    for (const zone of [...MOVE_ZONES, ...LEGACY_ZONES]) for (const f of listAll(path.join(repo, zone))) files.push(`${zone}/${f}`);
    for (const f of ["profile.md", "system-map.md"]) if (fs.existsSync(path.join(repo, f))) files.push(f);
    if (fs.existsSync(path.join(repo, "project"))) throw new Error("A project/ folder already exists next to the 1.3 knowledge zones; move or rename it first");
  }
  for (const f of files) plan.moveFile(oldRel(f), newPathOf(f));

  // Files that defined records but move to _legacy are archived (kept, no longer knowledge).
  for (const rec of model.records.values()) {
    if (newPathOf(rec.file).startsWith("project/_legacy/")) report.archived.push({ id: rec.id, file: newPathOf(rec.file) });
  }

  // 2. Status lines out, header cards in.
  const mdFiles = files.filter((f) => f.endsWith(".md") && !newPathOf(f).startsWith("project/_legacy/"));
  for (const f of mdFiles) {
    const original = plan.read(oldRel(f));
    let text = original;
    const stripped = c.stripStatusLines(text);
    text = stripped.text;
    for (const h of stripped.hints) report.hints.push({ ...h, file: newPathOf(f).replace(/^project\//, "") });
    if (f.startsWith("knowledge/")) text = c.addHeaderCard(text, (c.h1Title(text) || path.basename(f, ".md")).replace(/\s+$/, ""), c.readWhenFor(f));
    if (text !== original) plan.edit(oldRel(f), text);
  }
  const hintOf = (id) => report.hints.find((h) => h.id === id) || { implementation: "", knowledge: "" };

  // 3. Profile.
  const profilePath = oldRel("profile.md");
  const code = String(flags.code || model.profile.project_code || (String(model.profile.document_id || "").match(/^DOC-([A-Z0-9]+)-PROFILE$/) || [])[1] || model.code).toUpperCase();
  if (fs.existsSync(path.join(repo, profilePath))) {
    let text = plan.read(profilePath);
    text = c.setFrontMatter(text, [["royascaff", "1.4"], ["project_code", code]]);
    const apps = appsFrom(repo, model, code, projectRel);
    report.apps = apps;
    if (apps.length && !/^#{2,3} APP-/m.test(text)) {
      const blocks = apps.map((a) => [`### ${a.id} · ${a.name} app`, "", `- **Path:** ${a.path}`, `- **Build:** ${a.build || ""}`.trimEnd(), `- **Typecheck:** ${a.typecheck || ""}`.trimEnd(), `- **Lint:** ${a.lint || ""}`.trimEnd(), `- **Test:** ${a.test || ""}`.trimEnd()].join("\n"));
      text = `${text.replace(/\n*$/, "\n")}\n## Apps\n\nAdded by the 1.3 → 1.4 migration from \`source_roots\` and \`command_*\`. \`royascaff check\` runs these commands in each app's folder.\n\n${blocks.join("\n\n")}\n`;
    }
    if (!apps.length) report.notes.push("No source_roots or command_* in the 1.3 profile: add APP- records to project/profile.md so `royascaff check` knows how to build and test.");
    if (apps.length > 1 && (model.profile.command_build || model.profile.command_test)) report.notes.push("The 1.3 profile has one set of commands for several source roots: fill Build/Typecheck/Lint/Test per APP- record in project/profile.md.");
    text = c.addHeaderCard(text, "how this project is built, checked and owned", "setting up, or when a command or path is unclear");
    plan.edit(profilePath, text);
  } else report.notes.push("No profile.md found: run `royascaff init` details by hand (royascaff: 1.4, project_code).");

  // 4. Slices from feature changes.
  const featureOf = (reqId) => {
    const rec = model.records.get(reqId);
    const out = rec.relations.find((x) => ["satisfies", "feature"].includes(x.type) && model.features.has(x.to));
    if (out) return out.to;
    const inc = (model.incoming.get(reqId) || []).find((x) => model.features.has(x.from));
    return inc ? inc.from : null;
  };
  const slicesByFeature = new Map();
  const changeEdits = [];
  for (const change of [...model.changes.values()].sort((a, b) => a.id.localeCompare(b.id))) {
    const fm = model.records.get(change.id);
    const kind = change.kind || INTENT_TO_KIND[String(change.intent || "").toLowerCase()] || "chore";
    const entry = { id: change.id, kind, status: change.status, slices: [], tasks: change.tasks.length, unmapped: [] };
    if (kind === "feature" && change.status !== "cancelled") {
      const text = fs.readFileSync(path.join(model.root, change.file), "utf8");
      const found = new Set(c.idsWithRanges(text));
      for (const t of change.tasks) for (const r of model.records.get(t).relations) if (r.type === "inputs") found.add(r.to);
      const byFeature = new Map();
      for (const id of [...found].sort()) {
        const rec = model.records.get(id);
        if (!rec || !REQ_KINDS.includes(rec.kind)) continue;
        const cap = featureOf(id);
        if (!cap) { entry.unmapped.push(id); continue; }
        if (!byFeature.has(cap)) byFeature.set(cap, []);
        byFeature.get(cap).push(id);
      }
      for (const [cap, delivers] of [...byFeature.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const list = slicesByFeature.get(cap) || [];
        const sid = `${cap.replace(/^CAP-/, "SLC-")}-${String.fromCharCode(65 + list.length)}`;
        list.push({ id: sid, title: change.title || change.id, order: list.length + 1, depends: [], delivers, plannedAt: head, change: change.id });
        slicesByFeature.set(cap, list);
        entry.slices.push(sid);
        report.slices.push({ id: sid, feature: cap, change: change.id, delivers });
      }
    }
    entry.kind = kind === "feature" && !entry.slices.length ? "chore" : kind;
    if (entry.kind !== kind) report.notes.push(`${change.id} was a feature change, but nothing it delivered maps to a feature: migrated as a chore. Add a slice by hand if it delivered a feature.`);
    changeEdits.push({ change, fm, entry });
    report.changes.push(entry);
  }

  // Feature records: Horizon + slice table.
  const featureFiles = new Map();
  for (const f of model.features.values()) {
    const rec = model.records.get(f.id);
    if (!featureFiles.has(rec.file)) featureFiles.set(rec.file, []);
    featureFiles.get(rec.file).push(f.id);
  }
  for (const [file, ids] of featureFiles) {
    let text = plan.read(oldRel(file));
    for (const id of ids) {
      const rows = slicesByFeature.get(id) || [];
      const impl = hintOf(id).implementation;
      const horizon = model.features.get(id).horizonSet ? null : rows.length || DONE_STATES.includes(impl) || impl === "in-progress" ? "now" : "backlog";
      if (horizon) text = c.addField(text, id, "Horizon", horizon);
      if (rows.length) text = c.appendToRecord(text, id, c.sliceTable(rows));
      report.features.push({ id, horizon: horizon || model.features.get(id).horizon, slices: rows.map((r) => r.id), was: impl || "—" });
    }
    plan.edit(oldRel(file), text);
  }

  // Changes: front matter + log.
  for (const { change, entry } of changeEdits) {
    const file = oldRel(change.file);
    let text = plan.read(file);
    const pairs = [["kind", entry.kind]];
    if (entry.slices.length) pairs.push(["slice", entry.slices.length === 1 ? entry.slices[0] : `[${entry.slices.join(", ")}]`]);
    text = c.setFrontMatter(text, pairs, "change_id");
    plan.edit(file, text);
    const newDir = path.posix.dirname(plan.target(file));
    if (fs.existsSync(path.join(repo, path.posix.dirname(file), "log.md"))) { report.notes.push(`${change.id} already has a log.md: left as is`); continue; }
    const rows = [
      [when, "change.opened", change.id, by, head || "—", "migrated from 1.3"],
      [when, "migration.applied", change.id, by, head || "—", `1.3 → 1.4; status ${change.status} kept${entry.slices.length ? `; delivers ${entry.slices.join(", ")}` : ""}`],
    ];
    for (const t of change.tasks) {
      const impl = hintOf(t).implementation;
      if (DONE_STATES.includes(impl)) rows.push([when, "task.done", t, by, head || "—", `migrated: was ${impl}`]);
      else if (impl === "in-progress") rows.push([when, "task.started", t, by, head || "—", "migrated: was in-progress"]);
    }
    plan.create(`${newDir}/log.md`, logTemplate(change.id) + rows.map((r) => `| ${r.map(escapeCell).join(" | ")} |\n`).join(""));
  }

  plan.create("project/_legacy/1.3/MIGRATION.md", migrationReport(report, code));
  return { plan, report, code, manifestDir: "project/_legacy/1.3/migration" };
}

function gitHead(repo) {
  const { isRepo, prefixOf, headShort } = require("../git.cjs");
  return isRepo(repo) && prefixOf(repo) === "" ? headShort(repo) : null;
}

function appsFrom(repo, model, code, projectRel) {
  const p = model.profile;
  const roots = (Array.isArray(p.source_roots) ? p.source_roots : p.source_roots ? [p.source_roots] : []).map(String).filter(Boolean);
  const cmds = { build: p.command_build, typecheck: p.command_typecheck, lint: p.command_lint, test: p.command_test };
  const anyCmd = Object.values(cmds).some(Boolean);
  if (!roots.length && !anyCmd) return [];
  const list = roots.length ? roots : ["."];
  const KINDS = ["web", "api", "mobile", "cli", "desktop", "worker", "service"];
  const used = new Set();
  return list.map((root) => {
    const fromProject = posix(path.relative(repo, path.resolve(repo, projectRel, root))) || ".";
    const fromRepo = posix(path.normalize(root)) || ".";
    const where = fs.existsSync(path.join(repo, fromProject)) ? fromProject : fromRepo;
    let name = list.length === 1 && KINDS.includes(String(p.project_kind)) ? String(p.project_kind) : path.basename(where === "." ? String(p.project_kind || "app") : where);
    name = c.slug(name) === "SRC" && KINDS.includes(String(p.project_kind)) ? String(p.project_kind) : name;
    let id = `APP-${code}-${c.slug(name)}`;
    for (let n = 2; used.has(id); n += 1) id = `APP-${code}-${c.slug(name)}${n}`;
    used.add(id);
    return { id, name: name.toLowerCase(), path: where, ...(list.length === 1 ? cmds : {}) };
  });
}

function migrationReport(r, code) {
  const out = [
    "# Migration from RoyaScaff 1.3",
    "",
    "> **What:** what the 1.3 → 1.4 migration changed, and what to check by hand",
    "> **Read when:** reviewing the migration, or wondering where a 1.3 file or status went",
    "",
    `Project code: ${code}. Nothing was deleted: moved and edited originals are in \`migration/original/\`, and \`royascaff migrate --rollback\` restores them.`,
    "",
    "## Features",
    "",
    "| Feature | Horizon | Slices | 1.3 implementation status |",
    "|---|---|---|---|",
    ...r.features.map((f) => `| ${f.id} | ${f.horizon} | ${f.slices.join(", ") || "—"} | ${f.was} |`),
    "",
    "## Changes",
    "",
    "| Change | Kind | Status (kept) | Slices | Delivered but not mapped to a feature |",
    "|---|---|---|---|---|",
    ...r.changes.map((x) => `| ${x.id} | ${x.kind} | ${x.status} | ${x.slices.join(", ") || "—"} | ${x.unmapped.join(", ") || "—"} |`),
    "",
    "## Archived records",
    "",
    r.archived.length ? "These were defined in 1.3 generated views or saved context packs. 1.4 builds them on demand (`royascaff context`), so they are kept here only:" : "None.",
    "",
    ...r.archived.map((a) => `- ${a.id} (${a.file})`),
    "",
    "## Status hints (removed lines)",
    "",
    "1.4 derives status from changes, tasks and evidence. The typed values are kept here for reference:",
    "",
    "| Record | Implementation status | Knowledge status | File |",
    "|---|---|---|---|",
    ...r.hints.map((h) => `| ${h.id} | ${h.implementation || "—"} | ${h.knowledge || "—"} | ${h.file} |`),
    "",
    "## Check by hand",
    "",
    ...(r.notes.length ? r.notes : ["Nothing flagged."]).map((n) => `- ${n}`),
    ...(r.changes.some((x) => ["reconciled", "verified"].includes(x.status)) ? ["- Changes that were reconciled or verified in 1.3 show at stage 5 (Check & Record): run `royascaff check <CHG-…>`, then `royascaff advance <CHG-…> --to closed`."] : []),
    "- Approvals were not migrated: a person approves open medium/high-risk changes again (`royascaff approve`).",
    "",
  ];
  return out.join("\n");
}

module.exports = { buildPlan13, newPathOf };
