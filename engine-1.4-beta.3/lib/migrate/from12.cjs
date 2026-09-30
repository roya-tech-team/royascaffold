"use strict";

// 1.2 → 1.4 converter. Builds a MigrationPlan (nothing is written here).
//
//  1. The 1.2 knowledge (description, rules, plan/, actions/, the old profile) moves under
//     project/knowledge/ with header cards.
//  2. 1.2 tracking files (status.md, build-program.md, change-log.md, verify/) and the pack
//     folders move to project/_legacy/1.2/ — kept, no longer maintained by hand.
//  3. New 1.4 files: profile.md (APP- records from the 1.2 Applications table), a roadmap with
//     one feature per build-program module, requirements from each pack's acceptance criteria,
//     one slice per pack, and one change per pack (status from the pack status) with log.md and,
//     where the pack's verify-code.md says PASS, an evidence record.

const fs = require("fs");
const path = require("path");
const { readTables } = require("../model/tables.cjs");
const { logTemplate, nowIso } = require("../events.cjs");
const { escapeCell } = require("../model/tables.cjs");
const { docText, insertRecord } = require("../templates.cjs");
const { MigrationPlan, listAll } = require("./plan.cjs");
const c = require("./common.cjs");

const KNOWLEDGE_MOVES = [
  ["description.md", "knowledge/01-business/description.md"],
  ["profile.md", "knowledge/01-business/system-profile.md"],
  ["rules.md", "knowledge/04-design/rules.md"],
];
const LEGACY_FILES = ["status.md", "changes/build-program.md", "changes/change-log.md"];
const STATUS_MAP = { merged: "closed", done: "closed", closed: "closed", verified: "verified", "in-progress": "in-progress", implementing: "in-progress", drafted: "draft", draft: "draft", blocked: "blocked", deferred: "draft", cancelled: "cancelled" };

function meta(text, key) {
  const m = text.match(new RegExp(`^- \\*\\*${key}\\*\\*:\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : "";
}

function section(text, title) {
  const m = text.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "mi"));
  return m ? m[1].trim() : "";
}

function buildPlan12(repo, flags = {}) {
  const P = "project";
  const abs = (rel) => path.join(repo, P, rel);
  const read = (rel) => (fs.existsSync(abs(rel)) ? fs.readFileSync(abs(rel), "utf8") : "");
  const plan = new MigrationPlan(repo);
  const report = { from: "1.2", features: [], slices: [], changes: [], apps: [], notes: [], archived: [] };
  const head = gitHead(repo);
  const when = nowIso();
  const by = flags.by || "royascaff-migrate";

  const oldProfile = read("profile.md");
  const name = flags.name || meta(oldProfile, "Name") || meta(read("description.md"), "Name") || path.basename(repo);
  const code = String(flags.code || c.deriveCode(name)).toUpperCase();
  if (!/^[A-Z][A-Z0-9]{1,9}$/.test(code)) throw new Error(`Project code "${code}" is not valid: pass --code with 2–10 capital letters`);
  const owner = flags.owner || "team";

  // Packs, in build-program order (else folder order).
  const program = read("changes/build-program.md");
  const rows = (readTables(program).find((t) => t.header.some((h) => /pack folder/i.test(h))) || { header: [], rows: [] });
  const col = (n) => rows.header.findIndex((h) => new RegExp(n, "i").test(h));
  const packDirs = fs.existsSync(abs("changes")) ? fs.readdirSync(abs("changes"), { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(abs(`changes/${e.name}/change-request.md`))).map((e) => e.name).sort() : [];
  const programRow = (dir) => rows.rows.find((r) => (r.cells[col("pack folder")] || "").replace(/[`/]/g, "").trim() === dir);
  packDirs.sort((a, b) => {
    const ia = rows.rows.indexOf(programRow(a));
    const ib = rows.rows.indexOf(programRow(b));
    return (ia < 0 ? 1e6 : ia) - (ib < 0 ? 1e6 : ib) || a.localeCompare(b);
  });

  // 1–2. Moves.
  for (const [from, to] of KNOWLEDGE_MOVES) if (fs.existsSync(abs(from))) plan.moveFile(`${P}/${from}`, `${P}/${to}`);
  for (const f of listAll(abs("plan"))) plan.moveFile(`${P}/plan/${f}`, `${P}/knowledge/04-design/plan/${f}`);
  for (const f of listAll(abs("actions"))) plan.moveFile(`${P}/actions/${f}`, `${P}/knowledge/05-implementation/actions/${f}`);
  for (const f of LEGACY_FILES) if (fs.existsSync(abs(f))) plan.moveFile(`${P}/${f}`, `${P}/_legacy/1.2/${path.posix.basename(f)}`);
  for (const f of listAll(abs("verify"))) plan.moveFile(`${P}/verify/${f}`, `${P}/_legacy/1.2/verify/${f}`);
  for (const d of packDirs) plan.moveTree(`${P}/changes/${d}`, `${P}/_legacy/1.2/packs/${d}`);
  for (const [oldRel] of plan.moves) {
    const t = plan.target(oldRel);
    if (!t.startsWith(`${P}/knowledge/`) || !t.endsWith(".md")) continue;
    const text = plan.read(oldRel);
    const rel = t.slice(P.length + 1);
    const card = c.addHeaderCard(text, (c.h1Title(text) || path.basename(rel, ".md")).trim(), c.readWhenFor(rel));
    if (card !== text) plan.edit(oldRel, card);
  }

  // 3. Profile with APP- records.
  const appTable = readTables(oldProfile).find((t) => t.header.some((h) => /^key$/i.test(h.trim())) && t.header.some((h) => /^repo$/i.test(h.trim())));
  const apps = [];
  if (appTable) {
    const k = appTable.header.findIndex((h) => /^key$/i.test(h.trim()));
    const r = appTable.header.findIndex((h) => /^repo$/i.test(h.trim()));
    for (const row of appTable.rows) {
      const key = (row.cells[k] || "").replace(/`/g, "").trim();
      if (!key) continue;
      const cell = row.cells[r] || "";
      const value = ((cell.match(/`([^`]+)`/) || [])[1] || cell).trim();
      const p = value.includes("/") && !/^\//.test(value) ? value.replace(/\/+$/, "") : fs.existsSync(path.join(repo, value)) ? value : ".";
      const ti = appTable.header.findIndex((h) => /^type$/i.test(h.trim()));
      const type = ti >= 0 ? (row.cells[ti] || "").replace(/`/g, "").trim().toLowerCase() : "";
      apps.push({ id: `APP-${code}-${c.slug(key)}`, name: key.toLowerCase(), path: p, type: type === "web" ? "web-ui" : type === "api" ? "web-api" : "generic" });
    }
  }
  report.apps = apps;
  const appsText = apps.map((a) => `### ${a.id} · ${a.name} app\n\n- **Path:** ${a.path}\n- **Build:**\n- **Typecheck:**\n- **Lint:**\n- **Test:**\n`).join("\n") || `_Add one \`### APP-${code}-WEB · web app\` record per app, with Path and commands._\n`;
  const adapters = [...new Set(apps.map((a) => a.type))].filter(Boolean);
  plan.create(`${P}/profile.md`, docText("profile", { CODE: code, OWNER: owner, NAME: name, APPS: appsText, PROFILE: "standard", ADAPTERS: (adapters.length ? adapters : ["generic"]).join(", ") }));
  report.notes.push("Fill Build/Typecheck/Lint/Test for each APP- record in project/profile.md (1.2 had no commands per app), so `royascaff check` can run them.");

  // Features, requirements, slices, changes.
  let roadmap = docText("roadmap", { CODE: code, OWNER: owner });
  let requirements = docText("requirements", { CODE: code, OWNER: owner });
  let reqN = 0;
  const sliceOfPack = new Map();
  packDirs.forEach((dir, i) => {
    const n = String(i + 1).padStart(3, "0");
    const cr = read(`changes/${dir}/change-request.md`);
    const row = programRow(dir);
    const module = (row && row.cells[col("module")]) || (section(cr, "Scope").match(/Module\(s\):\s*(.+)/) || [])[1] || dir.replace(/^change-\d+-\d+-/, "");
    const title = module.replace(/`/g, "").trim();
    const packStatus = ((row && row.cells[col("pack status")]) || meta(cr, "pack-status") || meta(read(`changes/${dir}/status.md`), "pack-status") || "drafted").replace(/`/g, "").trim().toLowerCase();
    const status = STATUS_MAP[packStatus] || "draft";
    const cap = `CAP-${code}-${n}`;
    const slc = `SLC-${code}-${n}-A`;
    const chg = `CHG-${code}-${n}`;
    sliceOfPack.set(dir.match(/^change-\d+-\d+/) ? dir.match(/^change-\d+-\d+/)[0] : dir, slc);
    const priority = /high|critical/i.test(meta(cr, "priority")) ? "must" : /low/i.test(meta(cr, "priority")) ? "could" : "should";
    const description = section(cr, "Description");

    const criteria = section(cr, "Acceptance Criteria").split("\n").map((l) => l.match(/^\s*(?:\d+[.)]|[-*])\s+(.*)$/)).filter(Boolean).map((m) => m[1].trim());
    const reqs = criteria.map((text) => {
      reqN += 1;
      const id = `REQ-${code}-${String(reqN).padStart(3, "0")}`;
      const short = text.replace(/`/g, "").replace(/\s+/g, " ").replace(/[.;:]+$/, "");
      const t = short.length > 70 ? `${short.slice(0, 67).replace(/\s+\S*$/, "")}…` : short;
      requirements = insertRecord(requirements, `### ${id} · ${t}\n\n- **Priority:** ${priority}\n- **Owner:** ${owner}\n- **Feature:** ${cap}\n\n${text}\n\n_Migrated from 1.2 pack \`${dir}\`, acceptance criterion._\n`);
      return id;
    });

    const deps = String(meta(cr, "depends-on") || (row && row.cells[col("depends on")]) || "").split(/[,\s]+/).map((d) => (d.match(/^change-\d+-\d+/) || [])[0]).filter(Boolean);
    const depends = deps.map((d) => sliceOfPack.get(d)).filter(Boolean);
    const horizon = ["closed", "verified", "in-progress"].includes(status) ? "now" : "next";
    roadmap = insertRecord(roadmap, [
      `## ${cap} · ${title}`,
      "",
      `- **Owner:** ${owner}`,
      `- **Priority:** ${priority}`,
      `- **Horizon:** ${horizon}`,
      "",
      description ? description.split("\n")[0] : `The ${title} module.`,
      "",
      ...c.sliceTable([{ id: slc, title: `${title} (1.2 pack)`, order: 1, depends, delivers: reqs, plannedAt: head }]),
      "",
    ].join("\n"));
    report.features.push({ id: cap, title, horizon, slices: [slc] });
    report.slices.push({ id: slc, feature: cap, change: chg, delivers: reqs });

    const dirNew = `${P}/changes/${chg}`;
    const legacyPack = `_legacy/1.2/packs/${dir}`;
    plan.create(`${dirNew}/change.md`, [
      "---",
      `change_id: ${chg}`,
      "kind: feature",
      `slice: ${slc}`,
      `status: ${status}`,
      "risk: medium",
      `owners: [${owner}]`,
      "---",
      "",
      `# ${chg} · ${title}`,
      "",
      `> **What:** the work that delivers slice ${slc} of ${cap} (migrated from the 1.2 pack \`${dir}\`)`,
      `> **Status:** changes only through \`royascaff advance\`. See \`royascaff show ${chg}\``,
      "",
      "## Outcome",
      "",
      description || "_See the 1.2 change request._",
      "",
      "## History",
      "",
      `The 1.2 pack (change request, impact, merge report, verification) is kept in [${legacyPack}](../../${legacyPack}/change-request.md). Pack status in 1.2: ${packStatus}.`,
      "",
    ].join("\n"));

    const verify = read(`changes/${dir}/verify-code.md`);
    const passed = /(Overall|Status)\**:?\**\s*:?\s*\**PASS/i.test(verify);
    let evd = null;
    if (passed && reqs.length) {
      evd = `EVD-${code}-${n}`;
      plan.create(`${dirNew}/evidence/evidence.md`, [
        `# Evidence · ${chg}`,
        "",
        `### ${evd} · 1.2 pack verification`,
        "",
        "- **Result:** pass",
        `- **Proves:** ${reqs.join(", ")}`,
        "- **Command:** manual",
        `- **Git commit:** ${head || "—"}`,
        "",
        `Migrated from \`${legacyPack}/verify-code.md\`, which says PASS. 1.2 recorded no command output: run \`royascaff check ${chg}\` to confirm with the app commands.`,
        "",
      ].join("\n"));
    }
    const events = [
      [when, "change.opened", chg, by, head || "—", `migrated from 1.2 pack ${dir}`],
      [when, "migration.applied", chg, by, head || "—", `1.2 → 1.4; pack status ${packStatus} → ${status}${evd ? `; evidence ${evd}` : ""}`],
    ];
    plan.create(`${dirNew}/log.md`, logTemplate(chg) + events.map((r) => `| ${r.map(escapeCell).join(" | ")} |\n`).join(""));
    report.changes.push({ id: chg, kind: "feature", status, was: packStatus, slices: [slc], pack: dir, evidence: evd, requirements: reqs.length });
    if (!reqs.length) report.notes.push(`${dir} has no acceptance criteria: ${slc} delivers nothing yet — add requirements and list them in its Delivers cell.`);
  });
  if (!packDirs.length) report.notes.push("No 1.2 packs found (changes/change-*/change-request.md): only the knowledge was moved.");

  plan.create(`${P}/knowledge/00-roadmap/roadmap.md`, roadmap);
  plan.create(`${P}/knowledge/02-requirements/requirements.md`, requirements);
  const archLinks = [];
  if (fs.existsSync(abs("plan/modules.md"))) archLinks.push("[the module map](plan/modules.md)");
  if (fs.existsSync(abs("plan/data-model.md"))) archLinks.push("[the data model](plan/data-model.md)");
  c.migratedDocs(plan, { code, owner, name, from: "1.2", links: { brief: "knowledge/01-business/description.md", architecture: archLinks } });
  report.notes.push("Discovery, architecture and project log pages were added: complete the discovery with the person, then a person runs royascaff approve project and royascaff approve roadmap before new work opens.");
  plan.create(`${P}/_legacy/1.2/MIGRATION.md`, migrationReport(report, code, name));
  return { plan, report, code, manifestDir: `${P}/_legacy/1.2/migration` };
}

function gitHead(repo) {
  const { isRepo, prefixOf, headShort } = require("../git.cjs");
  return isRepo(repo) && prefixOf(repo) === "" ? headShort(repo) : null;
}

function migrationReport(r, code, name) {
  return [
    "# Migration from RoyaScaff 1.2",
    "",
    "> **What:** what the 1.2 → 1.4 migration created and moved, and what to check by hand",
    "> **Read when:** reviewing the migration, or looking for a 1.2 file",
    "",
    `Project: ${name} (code ${code}). Nothing was deleted: moved originals are in \`migration/original/\`, and \`royascaff migrate --rollback\` restores them. The 1.2 tracking files (status.md, build-program.md, change-log.md, verify/) and every pack folder are kept in this folder.`,
    "",
    "## From packs to features, slices and changes",
    "",
    "| 1.2 pack | Pack status | Feature | Slice | Change | Status | Requirements | Evidence |",
    "|---|---|---|---|---|---|---|---|",
    ...r.changes.map((x) => {
      const f = r.slices.find((s) => s.change === x.id);
      return `| ${x.pack} | ${x.was} | ${f ? f.feature : "—"} | ${x.slices.join(", ")} | ${x.id} | ${x.status} | ${x.requirements} | ${x.evidence || "—"} |`;
    }),
    "",
    "## Check by hand",
    "",
    ...r.notes.map((n) => `- ${n}`),
    "- Requirements were created from the acceptance criteria, one per line: rename them into observable behavior where needed.",
    "- 1.2 SVC-/EP-/PG- records are kept in knowledge/05-implementation/actions/. Link them to requirements with `Realizes:` when you touch them.",
    "",
  ].join("\n");
}

module.exports = { buildPlan12 };
