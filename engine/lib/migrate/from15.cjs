"use strict";

// 1.5 → 1.6 (`royascaff migrate --from 1.5`, plan file 02 E10). A 1.5 project is already in the 1.4 file format, so
// nothing moves. The migration:
//   - marks the profile `royascaff: 1.6`;
//   - writes a baseline (project/baselines/<REL-ID>.json) for every release the project already has, from the
//     knowledge as it is now (the best snapshot there is: the project kept none), so `diff` and `history` work;
//   - adds a `migration.applied` event to the project log.
// Like the older migrations it deletes nothing, snapshots every file it edits, and rolls back byte for byte.

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { deriveStatus } = require("../derive/status.cjs");
const { buildBaseline } = require("../baseline.cjs");
const { MigrationPlan } = require("./plan.cjs");
const c = require("./common.cjs");
const { HEADER, nowIso } = require("../events.cjs");
const { headShort } = require("../git.cjs");

const posix = (p) => p.split(path.sep).join("/");

function buildPlan15(repo, flags = {}) {
  const model = buildModel(repo);
  if (!model.is14) throw new Error("Unknown source version: --from 1.5 needs a project in the 1.4 format (profile.md has royascaff: 1.4)");
  const projectRel = posix(path.relative(repo, model.root)); // "project", or "" when the project is the repository root
  const at = (rel) => (projectRel ? `${projectRel}/${rel}` : rel);
  const plan = new MigrationPlan(repo);
  const report = { from: "1.5", archived: [], features: [...model.features.keys()], slices: [...model.slices.keys()], changes: [...model.changes.values()].map((x) => ({ id: x.id, kind: x.kind, status: x.status, slices: x.slices })), apps: [], hints: [], notes: [] };

  // 1. The profile says 1.6.
  const profilePath = at("profile.md");
  const profileText = plan.read(profilePath);
  const fm = profileText.match(/^---\n[\s\S]*?\n---/);
  if (!fm || !/^royascaff:.*$/m.test(fm[0])) throw new Error("Unknown source version: profile.md has no royascaff: line");
  plan.edit(profilePath, profileText.replace(fm[0], fm[0].replace(/^royascaff:.*$/m, "royascaff: 1.6")));

  // 2. A baseline for each release that has none.
  const status = deriveStatus(model);
  const releases = [...model.records.values()].filter((r) => r.kind === "release").map((r) => r.id).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const written = [];
  for (const id of releases) {
    const rel = at(`baselines/${id}.json`);
    if (fs.existsSync(path.join(repo, rel))) continue;
    plan.create(rel, `${JSON.stringify(buildBaseline(model, status, id), null, 2)}\n`);
    written.push(id);
  }
  report.notes.push(written.length ? `Baselines written for ${written.join(", ")} from the knowledge as it is now: the project kept no earlier snapshot.` : "No release records: no baselines to write (royascaff release <REL-…> writes one when you ship).");

  // 3. The project log records it.
  const logPath = at("log.md");
  const row = `| ${nowIso()} | migration.applied | project | ${flags.by || "royascaff-migrate"} | ${headShort(repo) || "—"} | 1.5 → 1.6: profile marked 1.6, ${written.length} baseline(s) |`;
  if (fs.existsSync(path.join(repo, logPath))) {
    const text = plan.read(logPath);
    plan.edit(logPath, `${text.endsWith("\n") ? text : `${text}\n`}${row}\n`);
  } else plan.create(logPath, `# Log · project\n\n> Written by \`royascaff\`. Do not edit by hand.\n\n${HEADER}\n${row}\n`);

  return { plan, report, code: model.code, manifestDir: at("_legacy/1.5/migration") };
}

module.exports = { buildPlan15 };
