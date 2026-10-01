#!/usr/bin/env node
"use strict";

// RoyaScaff 1.4 CLI. CommonJS on purpose (.cjs): it runs inside ESM projects too.
// Exit codes: 0 ok · 1 check/validation failure · 2 usage error.

const fs = require("fs");
const path = require("path");
let pkg = { version: "unknown" };
try {
  pkg = require("../package.json");
} catch {
  // Running from a copied bin/lib without the package manifest.
}
const { findProject, listMarkdown } = require("../lib/project.cjs");
const { exportProject, renderExport, roundTrip } = require("../lib/io/exchange.cjs");
const { validateCommand, showRecord } = require("../lib/commands/inspect.cjs");
const { newFeature, newSlice, newRecord } = require("../lib/commands/plan.cjs");
const { indexCommand, statusCommand, tasksCommand, traceCommand, logCommand } = require("../lib/commands/views.cjs");
const work = require("../lib/commands/work.cjs");
const { nextCommand, briefCommand } = require("../lib/commands/navigate.cjs");
const { contextCommand } = require("../lib/commands/context.cjs");
const setup = require("../lib/commands/setup.cjs");
const { usageCommand, feedbackCommand } = require("../lib/commands/feedback.cjs");
const usageLib = require("../lib/usage.cjs");
const { migrateCommand, renderMigrate } = require("../lib/commands/migrate.cjs");

// Local usage counters (Q21): one line per command, written when the process exits.
const USAGE = { started: Date.now(), cmd: null, sub: null, result: "ok", failed_checks: [], where: null };
process.on("exit", (code) => {
  if (!USAGE.cmd || ["help", "usage", "feedback"].includes(USAGE.cmd)) return;
  try {
    const project = findProject(USAGE.where || ".");
    const { parseMarkdown } = require("../lib/parse/markdown.cjs");
    const profileFile = path.join(project.projectDir, "profile.md");
    const profile = fs.existsSync(profileFile) ? (parseMarkdown(fs.readFileSync(profileFile, "utf8")).frontmatter || { data: {} }).data : {};
    if (!usageLib.enabled(profile)) return;
    const result = code === 0 ? USAGE.result : USAGE.result === "refused" ? "refused" : "error";
    usageLib.recordUsage(project.projectDir, { cmd: USAGE.cmd, sub: USAGE.sub, ms: Date.now() - USAGE.started, result, failed_checks: USAGE.failed_checks });
  } catch {
    // Counting must never break a command.
  }
});

const HELP = `RoyaScaff ${pkg.version}

Usage: royascaff <command> [path] [options]

Commands:
  init [path] --name "…" --code CODE [--app web=apps/web]   Start a new project (project/ + apps/)
  install [path] [--cursor] [--claude]   Install the royascaff navigator skill into your AI tools
  where [path]                 Show the detected project folder and what will be scanned
  next [path] [--json]         The single next action (and the stage card to read)
  brief [CHG-…] [path]         One-page resume for a new session
  context <TASK-…> [path] [--save] [--out FILE]
                               Everything one task needs, built from its inputs (budgeted, never cut)
  status [path] [--json]       Regenerate and print the board (project/STATUS.md)
  index [path]                 Regenerate STATUS.md, the root pointer and summary blocks
  tasks [path] [--open] [--change CHG-…] [--feature CAP-…]
                               List tasks across changes with their state
  trace <CAP-…|REQ-…> [path]   Follow a feature or requirement: slices, changes, tasks, tests, evidence, code
  log [path] [--since 7d|DATE] [--change CHG-…] [--limit N]
                               Recent events across all changes
  validate [path] [--json]     Check IDs, typed links, roadmap slices, changes and tasks
  feedback "<note>" [path] [--kind bug|confusing|idea|praise|other]
                               Write a feedback report (note, counts, brief) to review and send
  usage [path] [--json]        What the local usage counters hold (they never leave this machine)

Work (every command records an event and refreshes STATUS.md):
  open <SLC-…> [path] [--risk low|medium|high|critical] [--force]
                               Start the change that delivers a planned slice
  open --kind bug|polish|refactor|chore|knowledge "<title>" [path] [--affects REQ-…] [--risk …]
                               Start a change that is not a slice (a fix, a refactor, …)
  new record <outcome|requirement|nfr|concept|invariant|workflow|decision|contract|component|test> "<title>" [path]
                               [--feature CAP-…] [--priority …] [--code globs] [--realizes REQ-…] [--verifies REQ-…] [--check runner:test|manual]
  new task <CHG-…> "<title>" [path] [--goal …] [--inputs …] [--paths …] [--checks …] [--done …] [--depends …]
  advance <CHG-…> --to <status> [path] [--reason …]   Move a change forward through its gates (or back / cancelled with --reason)
  approve <CHG-…> [path] [--by NAME] [--note …]       A person approves the design (or the recording, for high risk)
  block <CHG-…> --reason "…" [path] · unblock <CHG-…> [path]
  task <TASK-…> start|done|block "<note>" [path] [--reopen]
  check <CHG-…> [path] [--quick]   Run the apps' Build/Typecheck/Lint/Test commands and write evidence
  check <CHG-…> --result pass|fail --note "…" [path]   Record a check that ran outside the engine
  task <TASK-…> done "…" --skip-checks "<reason>"     Mark done although the quick checks failed

Work done outside the engine (git):
  record <commit…> --as bug|polish|refactor|chore [--affects …] "what was done" [--path P]
                               Attach commits made by hand to a new change (or --files a,b without git)
  refine <SLC-…|CHG-…> [path]  Confirm a slice or change after its requirements changed
  open <SLC-…> --confirm-refinement   Open a slice whose requirements changed since planning
  backups [path] · backups restore <ID> [path]   List or restore automatic backups
  --by NAME  who is acting (default: ROYASCAFF_USER or git user.name; AI agents use --by ai:<tool>)
  show <ID> [path] [--json]    Show one record: fields, links, slices, changes, backlinks
  new feature "<title>" [path] [--horizon now|next|later|backlog] [--outcome OUT-…] [--priority P]
                               Add a feature (CAP-) to the roadmap
  new slice <CAP-…> "<title>" [path] [--delivers REQ-…,REQ-…] [--depends SLC-…] [--order N]
                               Add a slice (SLC-) to a feature
  export [path] [--out FILE]   Export all project Markdown to the JSON exchange format
  render FILE --out DIR        Render an exchange JSON file back to Markdown files
  roundtrip [path] [--json]    Check Markdown -> JSON -> Markdown is byte-identical

Migrate a project from engine 1.3 or 1.2 (nothing is deleted):
  migrate [path] [--from 1.3|1.2] [--code CODE]   Dry run: shows what would move and validates the result
  migrate [path] --apply [--force]                Apply it (needs a clean git tree unless --force)
  migrate [path] --rollback                       Undo an applied migration, byte for byte

Options:
  --json        Machine-readable output
  --version     Print the version
  --help        Show this help
`;

const VALUE_FLAGS = new Set(["out", "path", "horizon", "outcome", "priority", "owner", "delivers", "depends", "order", "change", "feature", "since", "limit", "to", "reason", "by", "note", "kind", "affects", "risk", "result", "goal", "inputs", "paths", "checks", "done", "as", "slice", "files", "name", "code", "app", "skip-checks", "realizes", "verifies", "check", "from"]);
const SUBCOMMANDS = new Set(["new", "task", "backups"]);

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [name, inline] = a.slice(2).split("=", 2);
      if (VALUE_FLAGS.has(name)) {
        const value = inline !== undefined ? inline : argv[++i];
        flags[name] = name === "app" && flags.app ? `${flags.app},${value}` : value;
      }
      else flags[name] = true;
    } else positional.push(a);
  }
  return { flags, positional };
}

function printIssues(issues) {
  return issues.map((i) => `  ${i.severity === "error" ? "✗" : "!"} ${i.message}${i.where ? `  (${i.where})` : ""}`).join("\n");
}

function fail(message, code = 2) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const [command, target] = positional;
  USAGE.cmd = command || null;
  USAGE.sub = SUBCOMMANDS.has(command) ? (command === "task" ? positional[2] : positional[1]) || null : null;
  USAGE.where = flags.path || positional.slice(1).find((p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } }) || ".";
  if (flags.version) return process.stdout.write(`${pkg.version}\n`);
  if (!command || flags.help || command === "help") return process.stdout.write(HELP);

  switch (command) {
    case "where": {
      const project = findProject(target || ".");
      const files = listMarkdown(project);
      const out = { repo: project.repo, project_dir: project.projectDir, layout: project.layout, markdown_files: files.length };
      if (flags.json) return process.stdout.write(`${JSON.stringify({ ...out, files: files.map((f) => f.rel) }, null, 2)}\n`);
      return process.stdout.write(`Project folder: ${out.project_dir}\nLayout: ${out.layout}\nMarkdown files scanned: ${out.markdown_files}\n`);
    }
    case "export": {
      const data = exportProject(target || ".");
      const json = `${JSON.stringify(data, null, 2)}\n`;
      if (flags.out) {
        fs.writeFileSync(flags.out, json);
        return process.stdout.write(`Exported ${data.files.length} files, ${data.records.length} records -> ${flags.out}\n`);
      }
      return process.stdout.write(json);
    }
    case "render": {
      if (!target || !flags.out) fail("render needs an exchange file and --out DIR");
      const data = JSON.parse(fs.readFileSync(target, "utf8"));
      const written = renderExport(data, path.resolve(flags.out));
      return process.stdout.write(`Rendered ${written.length} files into ${flags.out}\n`);
    }
    case "roundtrip": {
      const result = roundTrip(target || ".");
      if (flags.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else {
        const s = result.stats;
        process.stdout.write(
          `${result.ok ? "Round trip PASS" : "Round trip FAIL"} (${result.layout}, ${result.project_dir})\n` +
          `  files ${s.files} · records ${s.records} · fields ${s.fields}\n` +
          `  kept verbatim (non-canonical): headings ${s.raw_headings} · fields ${s.raw_fields} · front matter ${s.raw_frontmatter}\n` +
          result.mismatches.map((m) => `  MISMATCH ${m.path} at char ${m.first_difference_at}\n`).join("")
        );
      }
      return process.exit(result.ok ? 0 : 1);
    }
    case "index": {
      const r = indexCommand(flags.path || target || ".");
      if (flags.json) { delete r.board; return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`); }
      return process.stdout.write(`${r.board_changed ? "Updated" : "Unchanged"}: ${r.status_file}${r.root_pointer ? ` (linked from ${r.root_pointer})` : ""}${r.summaries_updated.length ? `\nSummary blocks refreshed: ${r.summaries_updated.join(", ")}` : ""}\n`);
    }
    case "status": {
      const where = flags.path || target || ".";
      if (flags.json) return process.stdout.write(`${JSON.stringify(statusCommand(where), null, 2)}\n`);
      return process.stdout.write(`${indexCommand(where).board}`);
    }
    case "tasks": {
      const r = tasksCommand(flags.path || target || ".", flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r.tasks, null, 2)}\n` : `${r.text}\n`);
    }
    case "trace": {
      if (!target) fail("Usage: royascaff trace <CAP-…|REQ-…> [path]");
      const r = traceCommand(flags.path || positional[2] || ".", target);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : `${r.text}\n`);
    }
    case "log": {
      const r = logCommand(flags.path || target || ".", flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r.events, null, 2)}\n` : `${r.text}\n`);
    }
    case "next": {
      const r = nextCommand(flags.path || target || ".");
      if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      const gate = r.gate && !r.gate.ok ? `\n${r.gate.checks.filter((c) => !c.ok).map((c) => `  ✗ ${c.message}`).join("\n")}` : "";
      return process.stdout.write(`▶ ${r.text}${gate}${r.card ? `\n  card: ${r.card}` : ""}${r.say ? `\n  say:  ${r.say}` : ""}\n`);
    }
    case "brief": {
      const isChange = target && /^CHG-/.test(target);
      const r = briefCommand(flags.path || (isChange ? positional[2] : target) || ".", isChange ? target : null);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : r.text);
    }
    case "open": {
      const where = flags.path || (flags.kind ? positional[2] : positional[2]) || ".";
      const r = flags.kind ? work.openOther(where, target, flags) : work.openSlice(where, target, flags);
      if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      return process.stdout.write(`Opened ${r.id} in ${r.dir} (risk ${r.risk}, stage 1 Understand)\nNext: fill Outcome and Impact in ${r.dir}/change.md, then royascaff advance ${r.id} --to analyzed\n`);
    }
    case "advance": {
      if (!target) fail("Usage: royascaff advance <CHG-…> --to <status>");
      const r = work.advance(flags.path || positional[2] || ".", target, flags.to, flags);
      if (flags.json) process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      else {
        const out = [];
        for (const st of r.steps) {
          out.push(`${st.ok ? "✓" : "✗"} → ${st.to}`);
          for (const c of st.checks || []) out.push(`    ${c.ok ? "✓" : "✗"} ${c.message}${c.pending ? " (pending)" : ""}`);
        }
        out.push(r.message || (r.ok === false ? `Stopped at ${r.reached}. Fix the ✗ items, then run the same command again.` : `${r.id} is now ${r.reached}.`));
        process.stdout.write(`${out.join("\n")}\n`);
      }
      if (r.ok === false) {
        USAGE.result = "refused";
        USAGE.failed_checks = r.steps[r.steps.length - 1].checks.filter((c) => !c.ok).map((c) => c.id);
      }
      return process.exit(r.ok === false ? 1 : 0);
    }
    case "approve": {
      const r = work.approve(flags.path || positional[2] || ".", target, flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : `${r.id} approved by ${r.by} (design ${r.design})\n`);
    }
    case "block":
    case "unblock": {
      const r = work.setBlocked(flags.path || positional[2] || ".", target, command === "block", flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : `${r.id} ${r.blocked ? "blocked" : "unblocked"}\n`);
    }
    case "task": {
      let [, id, action, note, where] = positional;
      // `task TASK-… done <path>` without a note: the last argument is the project path.
      if (note && !where && fs.existsSync(note) && fs.statSync(note).isDirectory()) {
        where = note;
        note = undefined;
      }
      const r = work.taskAction(flags.path || where || ".", id, action, note || flags.note, flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : `${r.id}: ${r.state} (${r.change} tasks ${r.tasksDone}/${r.tasksTotal})\n`);
    }
    case "check": {
      const r = work.recordCheck(flags.path || positional[2] || ".", target, flags);
      if (flags.json) process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      else if (r.manual) process.stdout.write(`${r.id}: check ${r.result} recorded\n`);
      else {
        const lines = r.results.map((x) => `  ${x.pass ? "✓" : x.timedOut ? "⏱" : "✗"} ${x.app} ${x.kind.padEnd(9)} ${x.command}  (${(x.ms / 1000).toFixed(1)}s)`);
        for (const x of r.results.filter((y) => !y.pass)) lines.push(`--- ${x.kind} output (last lines) ---`, x.tail);
        lines.push(`${r.mode === "quick" ? "Quick" : "Full"} checks ${r.result.toUpperCase()}${r.evidence ? ` — evidence ${r.evidence}${r.proves.length ? ` proves ${r.proves.join(", ")}` : ""}` : ""}`);
        process.stdout.write(`${lines.join("\n")}\n`);
      }
      return process.exit(r.result === "pass" ? 0 : 1);
    }
    case "init": {
      const r = setup.initProject(flags.path || target || ".", flags);
      if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      return process.stdout.write(`Created ${r.project} (code ${r.code}${r.apps.length ? `, apps ${r.apps.map((a) => a.dir).join(", ")}` : ""}).\nNext: royascaff install, then say "royascaff continue" in your AI tool.\n`);
    }
    case "install": {
      const r = setup.install(flags.path || target || ".", flags);
      if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      return process.stdout.write(`Installed the royascaff skill for ${r.tools.join(" and ")} (CLI: ${r.cli}).${r.docs_created.length ? `\nAdded ${r.docs_created.join(", ")}.` : ""}\nIn your AI tool, say: royascaff continue\n`);
    }
    case "context": {
      if (!target) fail("Usage: royascaff context <TASK-…> [path] [--save] [--out FILE]");
      const r = contextCommand(flags.path || positional[2] || ".", target, flags);
      if (flags.json) { const { text, ...meta } = r; return process.stdout.write(`${JSON.stringify(meta, null, 2)}\n`); }
      process.stderr.write(`~${r.tokens} of ${r.budget} tokens · ${r.records.length} records · written: ${r.written.join(", ")}\n`);
      return process.stdout.write(r.text);
    }
    case "record": {
      const refs = positional.slice(1).filter((p) => /^[0-9a-f]{4,40}$/i.test(p));
      const note = positional.slice(1).filter((p) => !/^[0-9a-f]{4,40}$/i.test(p))[0];
      const r = work.recordWork(flags.path || ".", refs, note || flags.note, flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : `Recorded ${r.commits.length ? r.commits.join(", ") : r.files.join(", ")} as ${r.id} (${r.kind}, in progress). Next: run the checks and add evidence, then royascaff advance ${r.id} --to closed\n`);
    }
    case "refine": {
      const r = work.refine(flags.path || positional[2] || ".", target, flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : r.planned_at ? `${r.id} re-planned at ${r.planned_at}\n` : `${r.id}: refinement confirmed\n`);
    }
    case "backups": {
      const restoring = target === "restore";
      const r = work.backups(flags.path || (restoring ? positional[3] : target) || ".", restoring ? "restore" : "list", restoring ? positional[2] : null);
      if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      if (restoring) return process.stdout.write(`Restored ${r.restored.length} file(s) from ${r.id}${r.safety ? ` (current versions saved first in ${r.safety})` : ""}\n`);
      return process.stdout.write(r.length ? `${r.map((b) => `${b.id}  ${b.files.length} file(s)${b.stash ? ` · stash ${b.stash}` : ""} · ${b.reason}`).join("\n")}\n` : "No backups.\n");
    }
    case "feedback": {
      const r = feedbackCommand(flags.path || positional[2] || ".", target || flags.note, flags);
      return process.stdout.write(flags.json ? `${JSON.stringify(r, null, 2)}\n` : `Feedback written to ${r.file}\nReview it (remove anything confidential), then send it to the RoyaScaff owner. Nothing was sent.\n`);
    }
    case "usage": {
      const r = usageCommand(flags.path || target || ".");
      if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      const u = r.usage;
      const lines = [`Local usage counters: ${r.enabled ? "on" : "off"} (${r.file}, never sent automatically)`, `${u.runs} commands · ${u.refused} refused by a gate`];
      for (const [k, v] of Object.entries(u.by_command).sort((a, b) => b[1].runs - a[1].runs)) lines.push(`  ${k.padEnd(16)} ${String(v.runs).padStart(4)} runs${v.refused ? ` · ${v.refused} refused` : ""} · avg ${v.avg_ms} ms`);
      const st = Object.entries(r.stages.stages);
      if (st.length) lines.push("Time in each status (median hours):", ...st.map(([k, v]) => `  ${k.padEnd(12)} ${v.median_hours} h over ${v.changes} change(s)`));
      return process.stdout.write(`${lines.join("\n")}\n`);
    }
    case "migrate": {
      const r = migrateCommand(flags.path || target || ".", flags);
      if (flags.json) process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
      else process.stdout.write(renderMigrate(r));
      return process.exit(r.action !== "rollback" && !r.validation.ok ? 1 : 0);
    }
    case "validate": {
      const result = validateCommand(flags.path || target || ".");
      if (flags.json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else {
        const c = result.counts;
        process.stdout.write(`${result.ok ? "Validation PASS" : "Validation FAIL"}: ${c.records} records · ${c.features} features · ${c.slices} slices · ${c.changes} changes · ${c.tasks} tasks — ${c.errors} errors, ${c.warnings} warnings\n`);
        if (result.issues.length) process.stdout.write(`${printIssues(result.issues)}\n`);
      }
      return process.exit(result.ok ? 0 : 1);
    }
    case "show": {
      if (!target) fail("Usage: royascaff show <ID> [path]");
      const result = showRecord(flags.path || positional[2] || ".", target);
      if (flags.json) {
        delete result.text;
        return process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      }
      return process.stdout.write(`${result.text}\n`);
    }
    case "new": {
      const what = target;
      if (what === "feature") {
        const r = newFeature(flags.path || positional[3] || ".", positional[2], flags);
        if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
        return process.stdout.write(`Added ${r.id} to ${r.file} (horizon: ${r.horizon})\nNext: describe it, then plan slices with: royascaff new slice ${r.id} "<title>"\n`);
      }
      if (what === "record") {
        const r = newRecord(flags.path || positional[4] || ".", positional[2], positional[3], flags);
        if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
        return process.stdout.write(`Added ${r.id} (${r.kind}) to ${r.file} — fill in the placeholder lines\n`);
      }
      if (what === "task") {
        const r = work.newTask(flags.path || positional[4] || ".", positional[2], positional[3], flags);
        if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
        return process.stdout.write(`Added ${r.id} to ${r.file}\n`);
      }
      if (what === "slice") {
        const r = newSlice(flags.path || positional[4] || ".", positional[2], positional[3], flags);
        if (flags.json) return process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
        return process.stdout.write(`Added ${r.id} to ${r.feature} (order ${r.order}, planned at ${r.planned_at})\n`);
      }
      return fail('Usage: royascaff new feature "<title>" | royascaff new slice <CAP-…> "<title>"');
    }
    default:
      fail(`Unknown command: ${command}\n\n${HELP}`);
  }
}

try {
  main();
} catch (error) {
  fail(error.message, 1);
}
