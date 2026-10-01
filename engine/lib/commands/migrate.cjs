"use strict";

// `royascaff migrate` (plan 09 step 12, Q19): a self-service flow from 1.3 or 1.2 to 1.4.
//
//   migrate [path] [--from 1.3|1.2]     dry run: builds the plan, applies it to a temporary copy,
//                                        validates the copy and prints what would happen
//   migrate [path] --apply [--force]     applies it (refuses a dirty git tree unless --force)
//   migrate [path] --rollback            restores the tree exactly as it was before --apply
//
// Nothing is ever deleted. Originals are copied to project/_legacy/<ver>/migration/original/.
// If any record ID would be lost (not in the 1.4 model and not archived under _legacy), apply
// rolls itself back.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { applyPlan, rollbackPlan } = require("../migrate/plan.cjs");
const { buildPlan13 } = require("../migrate/from13.cjs");
const { buildPlan12 } = require("../migrate/from12.cjs");
const { parseMarkdown } = require("../parse/markdown.cjs");

const SKIP_COPY = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".turbo", ".cache"]);

function detect(repo) {
  const tryProfile = (file) => (fs.existsSync(file) ? parseMarkdown(fs.readFileSync(file, "utf8")) : null);
  const nested = path.join(repo, "project");
  const p = tryProfile(path.join(nested, "profile.md")) || tryProfile(path.join(repo, "profile.md"));
  const fm = p && p.frontmatter ? p.frontmatter.data : null;
  if (fm && String(fm.royascaff || "").startsWith("1.4")) return "1.4";
  if (fs.existsSync(path.join(nested, "changes", "build-program.md")) || (fs.existsSync(path.join(nested, "status.md")) && !fm)) return "1.2";
  if (fm && (fm.schema_version !== undefined || fm.layer)) return "1.3";
  if (["knowledge", "changes"].some((z) => fs.existsSync(path.join(repo, z)) || fs.existsSync(path.join(nested, z)))) return "1.3";
  return null;
}

function recordIds(repo) {
  const { buildModel } = require("../model/graph.cjs");
  const m = buildModel(repo);
  return { model: m, ids: new Set(m.records.keys()) };
}

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP_COPY.has(e.name)) continue;
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyTree(a, b);
    else if (e.isFile()) fs.copyFileSync(a, b);
  }
}

function build(repo, from, flags) {
  if (from === "1.3") return buildPlan13(repo, flags);
  if (from === "1.2") return buildPlan12(repo, flags);
  throw new Error(`Unknown source version "${from}" (use --from 1.3 or --from 1.2)`);
}

// Applies to `repo`, runs index, checks that no ID was lost. Returns the outcome.
function applyAt(repo, from, flags, before) {
  const built = build(repo, from, flags);
  // Exact-case existence: on a case-insensitive disk (macOS, Windows) a 1.2 `status.md` would
  // otherwise hide that the board `STATUS.md` is a new file, and rollback would keep the wrong name.
  const existsExact = (rel) => {
    try {
      return fs.readdirSync(path.join(repo, path.dirname(rel))).includes(path.basename(rel));
    } catch {
      return false;
    }
  };
  const statusFiles = ["project/STATUS.md", "STATUS.md"].filter((f) => !existsExact(f));
  const manifest = applyPlan(built.plan, built.manifestDir, { royascaff_migration: `${from} → 1.4`, code: built.code });
  let indexError = null;
  try {
    require("./views.cjs").indexCommand(repo);
  } catch (e) {
    indexError = e.message;
  }
  const created = statusFiles.filter((f) => existsExact(f));
  if (created.length) {
    manifest.created.push(...created);
    fs.writeFileSync(path.join(repo, built.manifestDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  }
  const after = recordIds(repo);
  const archived = new Set(built.report.archived.map((a) => a.id));
  const lost = [...before.ids].filter((id) => !after.ids.has(id) && !archived.has(id));
  const { validateCommand } = require("./inspect.cjs");
  const validation = validateCommand(repo);
  return { built, manifest, lost, validation, indexError, after };
}

function summarize(from, built, outcome) {
  const s = built.plan.summary();
  const r = built.report;
  const v = outcome.validation.counts;
  return {
    from,
    to: "1.4",
    code: built.code,
    moves: s.moves,
    edits: s.edits,
    creates: s.creates,
    features: r.features.length,
    slices: r.slices.length,
    changes: r.changes.map((x) => ({ id: x.id, kind: x.kind, status: x.status, slices: x.slices })),
    apps: r.apps.map((a) => `${a.id} (${a.path})`),
    archived: r.archived.map((a) => a.id),
    lost: outcome.lost,
    validation: { ok: outcome.validation.ok, errors: v.errors, warnings: v.warnings, records: v.records, features: v.features, slices: v.slices, changes: v.changes, tasks: v.tasks },
    errors: outcome.validation.issues.filter((i) => i.severity === "error").map((i) => i.message),
    notes: r.notes,
    manifest: built.manifestDir,
  };
}

function migrateCommand(start, flags = {}) {
  const { findProject } = require("../project.cjs");
  const repo = findProject(start || ".").repo;

  if (flags.rollback) {
    const found = ["1.3", "1.2"].map((v) => `project/_legacy/${v}/migration`).find((d) => fs.existsSync(path.join(repo, d, "manifest.json")));
    if (!found) throw new Error("No migration to roll back (no project/_legacy/<version>/migration/manifest.json)");
    const r = rollbackPlan(repo, found);
    return { action: "rollback", manifest: found, restored: r.restored, removed: r.removed };
  }

  const detected = detect(repo);
  if (detected === "1.4") throw new Error("This project is already on RoyaScaff 1.4 (profile.md has royascaff: 1.4)");
  const from = String(flags.from || detected || "");
  if (!from) throw new Error("Could not tell whether this is a 1.3 or 1.2 project: pass --from 1.3 or --from 1.2");
  if (detected && flags.from && String(flags.from) !== detected) throw new Error(`--from ${flags.from} does not match the project, which looks like ${detected}`);

  if (!flags.apply) {
    // Dry run on a temporary copy, so the developer sees the real result before anything moves.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "royascaff-migrate-"));
    try {
      copyTree(repo, tmp);
      const before = recordIds(tmp);
      const outcome = applyAt(tmp, from, { ...flags, by: flags.by }, before);
      return { action: "dry-run", ...summarize(from, outcome.built, outcome), before_records: before.ids.size };
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }

  const { isRepo, workingChanges } = require("../git.cjs");
  if (isRepo(repo) && !flags.force) {
    const dirty = workingChanges(repo);
    if (dirty.length) throw new Error(`The git tree has ${dirty.length} uncommitted change(s) (e.g. ${dirty.slice(0, 3).map((d) => d.path).join(", ")}). Commit or stash them first so the migration is one clean commit, or pass --force.`);
  }
  const before = recordIds(repo);
  const outcome = applyAt(repo, from, flags, before);
  if (outcome.lost.length) {
    rollbackPlan(repo, outcome.built.manifestDir);
    throw new Error(`Migration rolled back: ${outcome.lost.length} record ID(s) would be lost (${outcome.lost.slice(0, 10).join(", ")}). Nothing changed. Please report this with \`royascaff feedback\`.`);
  }
  return { action: "apply", ...summarize(from, outcome.built, outcome), before_records: before.ids.size };
}

function renderMigrate(r) {
  if (r.action === "rollback") return `Rolled back the migration: ${r.restored} file(s) restored, ${r.removed.length} created file(s) removed. The tree is as it was before --apply.\n`;
  const lines = [
    `${r.action === "dry-run" ? "Dry run (nothing changed)" : "Migrated"}: RoyaScaff ${r.from} → 1.4 · project code ${r.code}`,
    `  files: ${r.moves} moved · ${r.edits} edited · ${r.creates} created · 0 deleted`,
    `  records: ${r.before_records} before → ${r.validation.records} after${r.archived.length ? ` (${r.archived.length} archived under _legacy: ${r.archived.slice(0, 5).join(", ")}${r.archived.length > 5 ? ", …" : ""})` : ""}${r.lost.length ? ` · LOST ${r.lost.length}: ${r.lost.slice(0, 5).join(", ")}` : " · none lost"}`,
    `  roadmap: ${r.features} features · ${r.slices} slices · ${r.changes.length} changes${r.apps.length ? ` · apps ${r.apps.join(", ")}` : ""}`,
    ...r.changes.map((x) => `    ${x.id}  ${x.kind.padEnd(9)} ${x.status.padEnd(12)} ${x.slices.join(", ") || "—"}`),
    `  validate: ${r.validation.ok ? "PASS" : "FAIL"} — ${r.validation.errors} errors, ${r.validation.warnings} warnings`,
    ...r.errors.slice(0, 10).map((e) => `    ✗ ${e}`),
    ...(r.notes.length ? ["  check by hand:", ...r.notes.map((n) => `    - ${n}`)] : []),
  ];
  if (r.action === "dry-run") lines.push("", "Apply with: royascaff migrate --apply   (commit or stash your work first; undo with: royascaff migrate --rollback)");
  else lines.push("", `Report: ${r.manifest.replace(/\/migration$/, "/MIGRATION.md")} · undo: royascaff migrate --rollback`, `Next: review, then commit ("chore: migrate RoyaScaff ${r.from} → 1.4") and run royascaff next`);
  return `${lines.join("\n")}\n`;
}

module.exports = { migrateCommand, renderMigrate, detect };
