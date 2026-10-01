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
const { exportFull, renderExport, roundTrip } = require("../lib/io/exchange.cjs");
const { validateCommand, showRecord } = require("../lib/commands/inspect.cjs");
const { newFeature, newSlice, newRecord, newDoc } = require("../lib/commands/plan.cjs");
const { indexCommand, statusCommand, tasksCommand, traceCommand, logCommand, eventsCommand } = require("../lib/commands/views.cjs");
const work = require("../lib/commands/work.cjs");
const { nextCommand, briefCommand } = require("../lib/commands/navigate.cjs");
const { contextCommand } = require("../lib/commands/context.cjs");
const setup = require("../lib/commands/setup.cjs");
const { usageCommand, feedbackCommand } = require("../lib/commands/feedback.cjs");
const usageLib = require("../lib/usage.cjs");
const { migrateCommand, renderMigrate } = require("../lib/commands/migrate.cjs");
const { approveProject, approveFeatures } = require("../lib/commands/approve.cjs");
const { adoptCommand } = require("../lib/commands/adopt.cjs");
const contract = require("../lib/contract.cjs");
const adapterLib = require("../lib/adapters.cjs");

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
  init [path] --name "…" --code CODE [--app web=apps/web] [--adapter web-ui[,web-3d]|web-api[,node]|node|generic|<project adapter>] [--lite]
                               Start a new project (project/ + apps/)
  install [path] [--cursor] [--claude]   Install the royascaff navigator skill into your AI tools
  where [path]                 Show the detected project folder and what will be scanned
  next [path] [--json]         The single next action (and the stage card to read)
  brief [CHG-…] [path]         One-page resume for a new session
  context <TASK-…> [path] [--out FILE]
                               Everything one task needs, built from its inputs (budgeted, never cut)
  status [path] [--json]       Regenerate and print the board (project/STATUS.md)
  index [path]                 Regenerate STATUS.md, the root pointer and summary blocks
  cache clear [path]           Remove project/.cache (rebuilt on demand; backups are kept)
  tasks [path] [--open] [--change CHG-…] [--feature CAP-…]
                               List tasks across changes with their state
  trace <CAP-…|REQ-…> [path]   Follow a feature or requirement: slices, changes, tasks, tests, evidence, code
  log [path] [--since 7d|DATE] [--change CHG-…] [--limit N]
                               Recent events across all changes
  validate [path] [--json]     Check IDs, typed links, roadmap slices, changes and tasks
  feedback "<note>" [path] [--kind bug|confusing|idea|praise|other]
                               Write a feedback report (note, counts, brief) to review and send
  usage [path] [--json]        What the local usage counters hold (they never leave this machine)
  contract [path] [--json]     The machine contract: version, commands, adapters, error codes

Work (every command records an event and refreshes STATUS.md):
  open <SLC-…> [path] [--risk low|medium|high|critical] [--force]
                               Start the change that delivers a planned slice (Next/Later slices wait
                               until every Now feature is done and accepted; --force: people only)
  open --kind bug|polish|refactor|chore|knowledge "<title>" [path] [--affects REQ-…] [--risk …]
                               Start a change that is not a slice (a fix, a refactor, …)
  new record <source|question|assumption|outcome|requirement|nfr|concept|invariant|workflow|decision|contract|component|rule|test|release> "<title>" [path]
                               [--quote "…"] [--covered REQ-…] [--feature CAP-…] [--topic …] [--basis …] [--scope project] [--includes CHG-…] [--applies …] [--priority …] [--code globs]
                               [--realizes REQ-…] [--verifies REQ-…] [--check runner:test|manual]
  new doc <architecture|data|experience|security|quality|operations> [path]
                               Create a layer document from its template (never overwrites)
  new task <CHG-…> "<title>" [path] [--goal …] [--inputs …] [--paths …] [--checks …] [--done …] [--depends …]
  advance <CHG-…> --to <status> [path] [--reason …]   Move a change forward through its gates (or back / cancelled with --reason)
  approve <CHG-…> [path] [--by NAME] [--note …]       A person approves the design (or the recording, for high risk)
  approve project [path]                              A person approves the discovery, brief, architecture and stack
  approve roadmap | CAP-… [CAP-…] [path]              A person approves feature plans (needed before a slice opens)
  block <CHG-…> --reason "…" [path] · unblock <CHG-…> [path]
  task <TASK-…> start|done|block "<note>" [path] [--reopen]
  check <CHG-…> [path] [--quick]   Run the apps' Build/Typecheck/Lint/Test commands and write evidence
  check <CHG-…> --result pass|fail --note "…" [path]   Record a check that ran outside the engine
  check <CHG-…> --result pass --note "looked at …" --bar all|1,2,4|none   A person's look, scored against the
                                   visual bar (web-ui); lines not passed are shown as gaps on the board
  measure OUT-… --result met|not-met --note "…"   A person records whether an outcome was reached
  smoke init [path] [--app APP-…]  Install the Playwright smoke check (web-ui): three screen sizes, console
                                   errors, every button, screenshots with the evidence
  verify <CHG-…> [path]            The machine proof of a change: runs every check (the apps' and the adapters'),
                                   judges each typed acceptance line, writes evidence with a fingerprint.
                                   Evidence turns stale when the code it covered changes
  judge <CHG-…> [path]             Build the judge pack for a separate AI session (not the builder) and record its
                                   verdicts: --verdict-file FILE, or --line KEY --verdict met|not-met|unclear --reason "…".
                                   High and critical risk need a met verdict for every must line before verified
  check <CHG-…> --red [path]       Run only the Test commands and expect them to FAIL: proof the acceptance
                                   tests came first (needed for must requirements before verified)
  task <TASK-…> done "…" --skip-checks "<reason>"     Mark done although the quick checks failed
  task <TASK-…> done "…" --outside-ok "<reason>"      A person accepts files changed outside the task's paths

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
  new slice <CAP-…> "<title>" [path] [--delivers REQ-…,REQ-…] [--depends SLC-…] [--order N] [--foundation]
                               Add a slice (SLC-) to a feature (--foundation: it is done before the feature's other slices open)
  export [path] [--out FILE]   Export all project Markdown to the JSON exchange format
  render FILE --out DIR        Render an exchange JSON file back to Markdown files
  roundtrip [path] [--json]    Check Markdown -> JSON -> Markdown is byte-identical

Adapters (technology guidance and checks; see docs/ADAPTERS.md):
  adapter new <name> [--includes web-ui] [path]   Start an adapter in project/adapters/ (a card and a manifest)
  adapter test <name> [path]                       Check its schema, includes, card, token budget and declared checks

Existing code:
  adopt [path] [--json]        Modules of each app and how much is owned by components (one module at a time)

Migrate a project from engine 1.3 or 1.2 (nothing is deleted):
  migrate [path] [--from 1.3|1.2] [--code CODE]   Dry run: shows what would move and validates the result
  migrate [path] --apply [--force]                Apply it (needs a clean git tree unless --force)
  migrate [path] --rollback                       Undo an applied migration, byte for byte

Options:
  --json        Machine-readable output: one contract envelope (see docs/CONTRACT.md)
  --version     Print the version
  --help        Show this help
`;

const VALUE_FLAGS = new Set(["out", "path", "horizon", "outcome", "priority", "owner", "delivers", "depends", "order", "change", "feature", "since", "limit", "to", "reason", "by", "note", "kind", "affects", "risk", "result", "goal", "inputs", "paths", "checks", "done", "as", "slice", "files", "name", "code", "app", "skip-checks", "realizes", "verifies", "check", "from", "topic", "basis", "scope", "outside-ok", "adapter", "includes", "applies", "quote", "covered", "bar", "approval-token", "verdict-file", "verdict", "line"]);
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

// --json: every result is a contract envelope on stdout (plan file 01 §3). Success carries `data`;
// a failure carries `error` with a stable code, and the exit status comes from contract/errors.json.
// Without --json nothing changes: readable text, and failures as a message on stderr.
const CALL = { json: false, command: "" };

function emitJson(env) {
  process.stdout.write(`${JSON.stringify(env, null, 2)}\n`);
}

// Events this call wrote, for the envelope's `events` list.
const eventsWritten = () => [...new Set(require("../lib/events.cjs").EMITTED)];

function failJson(err, details) {
  const env = contract.failure(CALL.command, err, { events: eventsWritten(), ...(details !== undefined ? { details } : {}) });
  emitJson(env);
  process.exitCode = contract.exitFor(env.error.code);
}

// A usage mistake: with --json an INVALID_INPUT failure, otherwise the message on stderr and exit 2.
function fail(message, code = 2) {
  if (CALL.json) throw Object.assign(new Error(message), { code: "INVALID_INPUT" });
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

// The one way a command answers. `data` is what the command returned (the envelope's `data` with
// --json); `text` is the readable form. `refuse` turns a result into a failure: the call ran, but
// a gate refused it or a check failed (code, message, missing; `data` goes to error.details).
function reply(data, text, opts = {}) {
  if (CALL.json) {
    if (opts.refuse) return failJson(Object.assign(new Error(opts.refuse.message), { code: opts.refuse.code, missing: opts.refuse.missing || [] }), data);
    return emitJson(contract.ok(CALL.command, data, { events: eventsWritten(), warnings: opts.warnings || [] }));
  }
  if (text) process.stdout.write(text);
  if (opts.refuse) process.exitCode = 1;
}

function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const [command, target] = positional;
  CALL.json = Boolean(flags.json);
  CALL.command = command || "";
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
      return reply({ ...out, files: files.map((f) => f.rel) }, `Project folder: ${out.project_dir}\nLayout: ${out.layout}\nMarkdown files scanned: ${out.markdown_files}\n`);
    }
    case "export": {
      const data = exportFull(target || ".");
      const json = `${JSON.stringify(data, null, 2)}\n`;
      if (flags.out) {
        fs.writeFileSync(flags.out, json);
        return reply({ out: flags.out, files: data.files.length, records: data.records.length }, `Exported ${data.files.length} files, ${data.records.length} records -> ${flags.out}\n`);
      }
      return reply(data, json);
    }
    case "render": {
      if (!target || !flags.out) fail("render needs an exchange file and --out DIR");
      const data = JSON.parse(fs.readFileSync(target, "utf8"));
      const written = renderExport(data, path.resolve(flags.out));
      return reply({ out: flags.out, files: written.length }, `Rendered ${written.length} files into ${flags.out}\n`);
    }
    case "roundtrip": {
      const result = roundTrip(target || ".");
      const s = result.stats;
      const text = `${result.ok ? "Round trip PASS" : "Round trip FAIL"} (${result.layout}, ${result.project_dir})\n` +
        `  files ${s.files} · records ${s.records} · fields ${s.fields}\n` +
        `  kept verbatim (non-canonical): headings ${s.raw_headings} · fields ${s.raw_fields} · front matter ${s.raw_frontmatter}\n` +
        result.mismatches.map((m) => `  MISMATCH ${m.path} at char ${m.first_difference_at}\n`).join("");
      return reply(result, text, result.ok ? {} : { refuse: { code: "CHECK_FAILED", message: "Markdown -> JSON -> Markdown is not byte-identical", missing: result.mismatches.map((m) => `${m.path} differs at char ${m.first_difference_at}`) } });
    }
    case "index": {
      const r = indexCommand(flags.path || target || ".");
      const { board, ...data } = r;
      return reply(data, `${r.board_changed ? "Updated" : "Unchanged"}: ${r.status_file}${r.root_pointer ? ` (linked from ${r.root_pointer})` : ""}${r.summaries_updated.length ? `\nSummary blocks refreshed: ${r.summaries_updated.join(", ")}` : ""}\n`);
    }
    case "status": {
      const where = flags.path || target || ".";
      if (flags.json) return reply(statusCommand(where));
      return process.stdout.write(`${indexCommand(where).board}`);
    }
    case "tasks": {
      const r = tasksCommand(flags.path || target || ".", flags);
      return reply({ tasks: r.tasks }, `${r.text}\n`);
    }
    case "trace": {
      if (!target) fail("Usage: royascaff trace <CAP-…|REQ-…> [path]");
      const r = traceCommand(flags.path || positional[2] || ".", target);
      return reply(r, `${r.text}\n`);
    }
    case "log": {
      const r = logCommand(flags.path || target || ".", flags);
      return reply({ events: r.events }, `${r.text}\n`);
    }
    case "events": {
      const r = eventsCommand(flags.path || target || ".", flags);
      return reply(r, r.events.map((e) => JSON.stringify(e)).join("\n") + (r.events.length ? "\n" : ""));
    }
    case "next": {
      const r = nextCommand(flags.path || target || ".");
      const gate = r.gate && !r.gate.ok ? `\n${r.gate.checks.filter((c) => !c.ok).map((c) => `  ✗ ${c.message}`).join("\n")}` : "";
      return reply(r, `▶ ${r.text}${gate}${r.card ? `\n  card: ${r.card}` : ""}${r.adapter_cards ? `\n  adapter: ${r.adapter_cards.join(", ")}` : ""}${r.say ? `\n  say:  ${r.say}` : ""}\n`);
    }
    case "brief": {
      const isChange = target && /^CHG-/.test(target);
      const r = briefCommand(flags.path || (isChange ? positional[2] : target) || ".", isChange ? target : null);
      return reply(r, r.text);
    }
    case "open": {
      const where = flags.path || positional[2] || ".";
      const r = flags.kind ? work.openOther(where, target, flags) : work.openSlice(where, target, flags);
      return reply(r, `Opened ${r.id} in ${r.dir} (risk ${r.risk}, stage 1 Understand)\nNext: fill Outcome and Impact in ${r.dir}/change.md, then royascaff advance ${r.id} --to analyzed\n`);
    }
    case "advance": {
      if (!target) fail("Usage: royascaff advance <CHG-…> --to <status>");
      const r = work.advance(flags.path || positional[2] || ".", target, flags.to, flags);
      const out = [];
      for (const st of r.steps) {
        out.push(`${st.ok ? "✓" : "✗"} → ${st.to}`);
        for (const c of st.checks || []) out.push(`    ${c.ok ? "✓" : "✗"} ${c.message}${c.pending ? " (pending)" : ""}`);
      }
      out.push(r.message || (r.ok === false ? `Stopped at ${r.reached}. Fix the ✗ items, then run the same command again.` : `${r.id} is now ${r.reached}.`));
      if (r.ok === false) {
        const failing = r.steps[r.steps.length - 1].checks.filter((c) => !c.ok);
        USAGE.result = "refused";
        USAGE.failed_checks = failing.map((c) => c.id);
        return reply(r, `${out.join("\n")}\n`, { refuse: { code: "GATE_REFUSED", message: `${r.id} cannot move to ${r.steps[r.steps.length - 1].to}: stopped at ${r.reached}`, missing: failing.map((c) => c.message) } });
      }
      return reply(r, `${out.join("\n")}\n`);
    }
    case "approve": {
      if (target === "project") {
        const r = approveProject(flags.path || positional[2] || ".", flags);
        return reply(r, `Project approved by ${r.by} (hash ${r.hash}): ${r.questions} question(s) answered, ${r.demands} demand(s) listed, decisions ${r.decisions.join(", ")}${r.assumptions.length ? `\nAssumptions you confirmed:\n${r.assumptions.map((x) => `  - ${x.id} · ${x.title}`).join("\n")}` : ""}${r.unquoted.length ? `\nList items of the request no demand quotes (check none was dropped): ${r.unquoted.length}\n${r.unquoted.slice(0, 20).map((x) => `  - ${x}`).join("\n")}${r.unquoted.length > 20 ? "\n  - …" : ""}` : ""}\n`);
      }
      if (target === "roadmap" || /^CAP-/.test(target || "")) {
        const ids = positional.slice(1).filter((p) => p === "roadmap" || /^CAP-/.test(p));
        const where = flags.path || positional.slice(1).find((p) => p !== "roadmap" && !/^CAP-/.test(p)) || ".";
        const r = approveFeatures(where, ids, flags);
        return reply(r, `${r.approved.map((f) => `Approved ${f.id} · ${f.title} (${f.horizon}): ${f.requirements} requirement(s), slices ${f.slices.join(", ") || "none yet"}`).join("\n")}\nby ${r.by}${r.outOfScope.length ? `\nOut of scope (you confirm these are not built):\n${r.outOfScope.map((x) => `  - ${x.id} · ${x.title}: ${x.reason}`).join("\n")}` : ""}\n`);
      }
      const r = work.approve(flags.path || positional[2] || ".", target, flags);
      return reply(r, `${r.id} approved by ${r.by} (design ${r.design})\n`);
    }
    case "block":
    case "unblock": {
      const r = work.setBlocked(flags.path || positional[2] || ".", target, command === "block", flags);
      return reply(r, `${r.id} ${r.blocked ? "blocked" : "unblocked"}\n`);
    }
    case "task": {
      let [, id, action, note, where] = positional;
      // `task TASK-… done <path>` without a note: the last argument is the project path.
      if (note && !where && fs.existsSync(note) && fs.statSync(note).isDirectory()) {
        where = note;
        note = undefined;
      }
      const r = work.taskAction(flags.path || where || ".", id, action, note || flags.note, flags);
      return reply(r, `${r.id}: ${r.state} (${r.change} tasks ${r.tasksDone}/${r.tasksTotal})\n`);
    }
    case "check": {
      const r = work.recordCheck(flags.path || positional[2] || ".", target, flags);
      let text;
      if (r.manual) text = `${r.id}: check recorded — ${r.note}\n`;
      else if (r.mode === "red") text = `${r.results.map((x) => `  ${x.pass ? "✓" : "✗"} ${x.app} ${x.kind.padEnd(9)} ${x.command}`).join("\n")}\nRed: the tests fail before the work (recorded). Now write the code until royascaff check ${r.id} passes.\n`;
      else {
        const lines = r.results.map((x) => `  ${x.pass ? "✓" : x.timedOut ? "⏱" : "✗"} ${x.app} ${x.kind.padEnd(9)} ${x.command}  (${(x.ms / 1000).toFixed(1)}s)`);
        for (const x of r.results.filter((y) => !y.pass)) lines.push(`--- ${x.kind} output (last lines) ---`, x.tail);
        if (r.placeholders && r.placeholders.length) lines.push(`⚠ Placeholder content: ${require("../lib/content.cjs").placeholderLine(r.placeholders)}`);
        if (r.shots && r.shots.length) lines.push(`Screenshots (${r.shots.length}): project/…/evidence/shots/${r.evidence}/`);
        for (const x of r.sourceReaders || []) lines.push(`⚠ ${x.file} ${x.why}: a test must call the code, not read it`);
        lines.push(`${r.mode === "quick" ? "Quick" : "Full"} checks ${r.result.toUpperCase()}${r.evidence ? ` — evidence ${r.evidence}${r.proves.length ? ` proves ${r.proves.join(", ")}` : ""}` : ""}`);
        text = `${lines.join("\n")}\n`;
      }
      if (r.result === "pass" || r.result === "red") return reply(r, text);
      const failing = (r.results || []).filter((x) => !x.pass).map((x) => `${x.app} ${x.kind}: ${x.command}`);
      return reply(r, text, { refuse: { code: "CHECK_FAILED", message: r.manual ? `${r.id}: a failed check was recorded` : `${r.id}: the ${r.mode} checks failed`, missing: failing } });
    }
    case "verify": {
      if (!target) fail("Usage: royascaff verify <CHG-…> [path]");
      const r = work.verify(flags.path || positional[2] || ".", target, flags);
      const lines = r.results.map((x) => `  ${x.pass ? "✓" : x.timedOut ? "⏱" : "✗"} ${x.app} ${x.kind.padEnd(9)} ${x.command}  (${(x.ms / 1000).toFixed(1)}s)`);
      for (const x of r.results.filter((y) => !y.pass)) lines.push(`--- ${x.kind} output (last lines) ---`, x.tail);
      lines.push("Acceptance lines:", ...r.lines.map((l) => `  ${l.result === "pass" ? "✓" : l.result === "fail" ? "✗" : "·"} ${l.key} [${l.type || "untyped"}] ${l.text}${l.why ? `  (${l.why})` : ""}`));
      lines.push(`Verify ${r.result.toUpperCase()} — evidence ${r.evidence}, fingerprint ${r.fingerprint}${r.proves.length ? `, proves ${r.proves.join(", ")}` : ""}`);
      if (r.repair && r.repair.blocked) lines.push(`Repair limit reached (${r.repair.failures} failed attempts): the change is blocked; a person decides.`);
      else if (r.result === "fail") lines.push(`Repair attempts left: ${r.repair.left} of ${r.repair.limit}`);
      if (r.result === "pass") return reply(r, `${lines.join("\n")}\n`);
      USAGE.result = "refused";
      const failing = [...r.results.filter((x) => !x.pass).map((x) => `${x.app} ${x.kind}: ${x.command}`), ...r.lines.filter((l) => l.result === "fail").map((l) => `${l.key} [${l.type}] ${l.text}`)];
      return reply(r, `${lines.join("\n")}\n`, { refuse: { code: "CHECK_FAILED", message: `${r.id}: verify failed`, missing: failing } });
    }
    case "adapter": {
      const kit = require("../lib/adapterkit.cjs");
      if (target === "new") {
        const r = kit.newAdapter(flags.path || positional[3] || ".", positional[2], flags);
        return reply(r, `Created ${r.files.join(" and ")}${r.includes.length ? ` (builds on ${r.includes.join(", ")})` : ""}.\nFill in the card, declare its checks in the manifest, then: royascaff adapter test ${r.name}\nTo use it, add it to the adapters line of project/profile.md.\n`);
      }
      if (target === "test") {
        const r = kit.testAdapter(flags.path || positional[3] || ".", positional[2]);
        const text = `${r.checks.map((c) => `  ${c.ok ? (c.warning ? "·" : "✓") : "✗"} ${c.message}`).join("\n")}\nAdapter ${r.name}: ${r.ok ? "PASS" : "FAIL"}\n`;
        return reply(r, text, r.ok ? {} : { refuse: { code: "CHECK_FAILED", message: `Adapter ${r.name} failed its test`, missing: r.checks.filter((c) => !c.ok).map((c) => c.message) } });
      }
      return fail("Usage: royascaff adapter new <name> [--includes web-ui] | royascaff adapter test <name>");
    }
    case "judge": {
      if (!target) fail("Usage: royascaff judge <CHG-…> [--verdict-file FILE | --line KEY --verdict met|not-met|unclear --reason \"…\"] [--by ai:<tool>:judge]");
      const r = work.judge(flags.path || positional[2] || ".", target, flags);
      if (r.mode === "pack") return reply(r, `Judge pack for ${r.id}: ${r.pack}\nBuilt by: ${r.builders.join(", ") || "unknown"} (they cannot judge). ${r.lines.length} line(s) to judge.\nGive the pack to a separate AI session; record its verdicts with: royascaff judge ${r.id} --verdict-file <file> --by ai:<tool>:judge\n`);
      return reply(r, `${r.id}: ${r.recorded.length} verdict(s) recorded by ${r.judge} (${r.summary.met} met · ${r.summary.notMet} not met · ${r.summary.unclear} unclear) in ${r.evidence}${r.state.ok ? "\nEvery required line is met." : ""}${r.state.unclear.length ? `\nUnclear lines go to a person: ${r.state.unclear.join(", ")}` : ""}${r.repair.blocked ? `\nRepair limit reached: the change is blocked; a person decides.` : ""}\n`);
    }
    case "init": {
      const r = setup.initProject(flags.path || target || ".", flags);
      return reply(r, `Created ${r.project} (code ${r.code}${r.apps.length ? `, apps ${r.apps.map((a) => a.dir).join(", ")}` : ""}).\nNext: royascaff install, then say "royascaff continue" in your AI tool.\n`);
    }
    case "install": {
      const r = setup.install(flags.path || target || ".", flags);
      return reply(r, `Installed the royascaff skill for ${r.tools.join(" and ")} (CLI: ${r.cli}).${r.docs_created.length ? `\nAdded ${r.docs_created.join(", ")}.` : ""}\nIn your AI tool, say: royascaff continue\n`);
    }
    case "context": {
      if (!target) fail("Usage: royascaff context <TASK-…> [path] [--save] [--out FILE]");
      const r = contextCommand(flags.path || positional[2] || ".", target, flags);
      if (!CALL.json) process.stderr.write(`~${r.tokens} of ${r.budget} tokens · ${r.records.length} records · written: ${r.written.join(", ")}\n`);
      return reply(r, r.text);
    }
    case "record": {
      const refs = positional.slice(1).filter((p) => /^[0-9a-f]{4,40}$/i.test(p));
      const note = positional.slice(1).filter((p) => !/^[0-9a-f]{4,40}$/i.test(p))[0];
      const r = work.recordWork(flags.path || ".", refs, note || flags.note, flags);
      return reply(r, `Recorded ${r.commits.length ? r.commits.join(", ") : r.files.join(", ")} as ${r.id} (${r.kind}, in progress). Next: run the checks and add evidence, then royascaff advance ${r.id} --to closed\n`);
    }
    case "refine": {
      const r = work.refine(flags.path || positional[2] || ".", target, flags);
      return reply(r, r.planned_at ? `${r.id} re-planned at ${r.planned_at}\n` : `${r.id}: refinement confirmed\n`);
    }
    case "backups": {
      const restoring = target === "restore";
      const r = work.backups(flags.path || (restoring ? positional[3] : target) || ".", restoring ? "restore" : "list", restoring ? positional[2] : null);
      if (restoring) return reply(r, `Restored ${r.restored.length} file(s) from ${r.id}${r.safety ? ` (current versions saved first in ${r.safety})` : ""}\n`);
      return reply({ backups: r }, r.length ? `${r.map((b) => `${b.id}  ${b.files.length} file(s)${b.stash ? ` · stash ${b.stash}` : ""} · ${b.reason}`).join("\n")}\n` : "No backups.\n");
    }
    case "feedback": {
      const r = feedbackCommand(flags.path || positional[2] || ".", target || flags.note, flags);
      return reply(r, `Feedback written to ${r.file}\nReview it (remove anything confidential), then send it to the RoyaScaff owner. Nothing was sent.\n`);
    }
    case "usage": {
      const r = usageCommand(flags.path || target || ".");
      const u = r.usage;
      const lines = [`Local usage counters: ${r.enabled ? "on" : "off"} (${r.file}, never sent automatically)`, `${u.runs} commands · ${u.refused} refused by a gate`];
      for (const [k, v] of Object.entries(u.by_command).sort((a, b) => b[1].runs - a[1].runs)) lines.push(`  ${k.padEnd(16)} ${String(v.runs).padStart(4)} runs${v.refused ? ` · ${v.refused} refused` : ""} · avg ${v.avg_ms} ms`);
      const st = Object.entries(r.stages.stages);
      if (st.length) lines.push("Time in each status (median hours):", ...st.map(([k, v]) => `  ${k.padEnd(12)} ${v.median_hours} h over ${v.changes} change(s)`));
      return reply(r, `${lines.join("\n")}\n`);
    }
    case "cache": {
      if (target !== "clear") fail("Usage: royascaff cache clear [path]");
      const project = findProject(flags.path || positional[2] || ".");
      const dir = path.join(project.projectDir, ".cache");
      const existed = fs.existsSync(dir);
      fs.rmSync(dir, { recursive: true, force: true });
      const rel = require("../lib/project.cjs").toPosix(path.relative(project.repo, dir));
      return reply({ removed: existed, path: rel }, `${existed ? "Removed" : "Nothing to remove:"} ${rel} (backups in .backups/ are kept)\n`);
    }
    case "measure": {
      const r = require("../lib/commands/approve.cjs").measureOutcome(flags.path || positional[2] || ".", target, flags);
      return reply(r, `${r.id}: ${r.result === "met" ? "met" : "not met"} — recorded by ${r.by}\n`);
    }
    case "smoke": {
      if (target !== "init") fail("Usage: royascaff smoke init [path] [--app APP-…] [--force]");
      const r = require("../lib/smoke.cjs").smokeInit(flags.path || positional[2] || ".", flags);
      return reply(r, `${r.kept ? "Kept" : "Wrote"} ${r.file}; ${r.app} now has - **Smoke:** ${r.command}\n${r.install ? `Install in the app first: ${r.install}\n` : ""}Every full royascaff check now runs it and keeps its screenshots with the evidence.\n`);
    }
    case "continue": {
      const r = nextCommand(flags.path || target || ".");
      return reply(r, `"royascaff continue" is a sentence for your AI chat (Cursor or Claude Code), not a terminal command.\nWhat the AI will do next:\n▶ ${r.text}${r.card ? `\n  card: ${r.card}` : ""}\n`);
    }
    case "adopt": {
      const r = adoptCommand(flags.path || target || ".");
      const { text, ...data } = r;
      return reply(data, `${text}\n`);
    }
    case "migrate": {
      const r = migrateCommand(flags.path || target || ".", flags);
      const bad = r.action !== "rollback" && !r.validation.ok;
      return reply(r, renderMigrate(r), bad ? { refuse: { code: "CHECK_FAILED", message: "The migrated project does not validate", missing: (r.validation.issues || []).filter((i) => i.severity === "error").map((i) => i.message) } } : {});
    }
    case "validate": {
      const result = validateCommand(flags.path || target || ".");
      const c = result.counts;
      const text = `${result.ok ? "Validation PASS" : "Validation FAIL"}: ${c.records} records · ${c.features} features · ${c.slices} slices · ${c.changes} changes · ${c.tasks} tasks — ${c.errors} errors, ${c.warnings} warnings\n${result.issues.length ? `${printIssues(result.issues)}\n` : ""}`;
      return reply(result, text, result.ok ? {} : { refuse: { code: "CHECK_FAILED", message: `Validation failed: ${c.errors} error(s)`, missing: result.issues.filter((i) => i.severity === "error").map((i) => i.message) } });
    }
    case "show": {
      if (!target) fail("Usage: royascaff show <ID> [path]");
      const result = showRecord(flags.path || positional[2] || ".", target);
      return reply(result, `${result.text}\n`);
    }
    case "new": {
      const what = target;
      if (what === "feature") {
        const r = newFeature(flags.path || positional[3] || ".", positional[2], flags);
        return reply(r, `Added ${r.id} to ${r.file} (horizon: ${r.horizon})\nNext: describe it, then plan slices with: royascaff new slice ${r.id} "<title>"\n`);
      }
      if (what === "record") {
        const r = newRecord(flags.path || positional[4] || ".", positional[2], positional[3], flags);
        return reply(r, `Added ${r.id} (${r.kind}) to ${r.file} — fill in the placeholder lines\n`);
      }
      if (what === "doc") {
        const r = newDoc(flags.path || positional[3] || ".", positional[2]);
        return reply(r, `Created ${r.file} from its template — replace the hint lines with the real content\n`);
      }
      if (what === "task") {
        const r = work.newTask(flags.path || positional[4] || ".", positional[2], positional[3], flags);
        return reply(r, `Added ${r.id} to ${r.file}\n`);
      }
      if (what === "slice") {
        const r = newSlice(flags.path || positional[4] || ".", positional[2], positional[3], flags);
        return reply(r, `Added ${r.id} to ${r.feature} (order ${r.order}, planned at ${r.planned_at})\n`);
      }
      return fail('Usage: royascaff new feature "<title>" | royascaff new slice <CAP-…> "<title>"');
    }
    case "contract": {
      let projectDir = null;
      try {
        projectDir = findProject(flags.path || target || ".").projectDir;
      } catch {
        // Outside a project the contract still describes the engine and its own adapters.
      }
      const data = { contract: contract.CONTRACT_VERSION, engine: contract.ENGINE_VERSION, commands: contract.COMMANDS, adapters: adapterLib.KNOWN(projectDir), error_codes: Object.keys(contract.ERRORS) };
      return reply(data, `Contract ${data.contract} · engine ${data.engine}\nCommands: ${data.commands.join(", ")}\nAdapters: ${data.adapters.join(", ")}\nError codes: ${data.error_codes.join(", ")}\n`);
    }
    default:
      if (CALL.json) throw Object.assign(new Error(`Unknown command: ${command}`), { code: "UNKNOWN_COMMAND" });
      fail(`Unknown command: ${command}\n\n${HELP}`);
  }
}

try {
  main();
} catch (error) {
  if (CALL.json) failJson(error);
  else fail(error.message, 1);
}
