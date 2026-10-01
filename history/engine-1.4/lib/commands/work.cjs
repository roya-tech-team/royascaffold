"use strict";

// Commands that move work forward. Every command records an event in the change's log.md,
// changes status only through gates, and regenerates STATUS.md at the end.

const fs = require("fs");
const path = require("path");
const { buildModel, errorsOf } = require("../model/graph.cjs");
const { deriveStatus } = require("../derive/status.cjs");
const { appendEvent } = require("../events.cjs");
const { headShort } = require("../git.cjs");
const { who } = require("../identity.cjs");
const { ORDER, RISKS, pathTo, evaluate, designHash, isHuman, changeBody } = require("../gates.cjs");
const { changeTemplate, planTemplate } = require("../templates.cjs");
const { transactional } = require("./plan.cjs");
const { CHANGE_KINDS } = require("../model/vocabulary.cjs");
const drift = require("../derive/drift.cjs");
const { saveBackup, uncommittedWithin, listBackups, restoreBackup } = require("../backup.cjs");
const { resolve: resolveCommit, git } = require("../git.cjs");
const { parseMarkdown, renderMarkdown } = require("../parse/markdown.cjs");
const { readTables } = require("../model/tables.cjs");
const runner = require("../runner.cjs");

function load(start) {
  const model = buildModel(start);
  return { model, status: deriveStatus(model) };
}

function refreshBoard(start) {
  // Lazy require: views depend on next-actions, which depend on gates.
  return require("./views.cjs").indexCommand(start);
}

function changeOf(model, id) {
  const change = model.changes.get(id);
  if (!change) throw new Error(`${id} is not a change in this project`);
  return change;
}

function setStatus(model, change, status) {
  const file = path.join(model.root, change.file);
  const text = fs.readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) throw new Error(`${change.file} has no front matter`);
  const inner = /^status:.*$/m.test(fm[1]) ? fm[1].replace(/^status:.*$/m, `status: ${status}`) : `${fm[1]}\nstatus: ${status}`;
  fs.writeFileSync(file, text.replace(fm[0], `---\n${inner}\n---`));
}

function record(model, change, event, flags = {}) {
  return appendEvent(path.join(model.root, change.dir), change.id, { ...event, by: event.by || who(flags, model.repo), git: headShort(model.repo) || "—" });
}

function nextId(ids, prefix) {
  let max = 0;
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  for (const id of ids) {
    const m = id.match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function createChange(start, model, spec, flags) {
  const id = nextId(model.records.keys(), `CHG-${model.code}`);
  const dirRel = `changes/${id}`;
  const dirAbs = path.join(model.root, dirRel);
  if (fs.existsSync(dirAbs)) throw new Error(`${dirRel} already exists`);
  const risk = (flags.risk || "medium").toLowerCase();
  if (!RISKS.includes(risk)) throw new Error(`Risk must be one of: ${RISKS.join(", ")}`);
  const owner = (Array.isArray(model.profile.owners) && model.profile.owners[0]) || "team";
  fs.mkdirSync(dirAbs, { recursive: true });
  fs.writeFileSync(path.join(dirAbs, "change.md"), changeTemplate({ id, risk, owner, ...spec }));
  fs.writeFileSync(path.join(dirAbs, "plan.md"), planTemplate(id));
  const after = buildModel(start);
  const introduced = errorsOf(after).filter((e) => e.where && e.where.startsWith(`${dirRel}/`));
  if (introduced.length) {
    fs.rmSync(dirAbs, { recursive: true, force: true });
    throw new Error(`Not created:\n${introduced.map((e) => `  - ${e.message}`).join("\n")}`);
  }
  const change = after.changes.get(id);
  record(after, change, { event: "change.opened", target: id, note: spec.slice ? `from ${spec.slice}` : `${spec.kind}${spec.affects && spec.affects.length ? ` affecting ${spec.affects.join(", ")}` : ""}` }, flags);
  refreshBoard(start);
  return { id, dir: dirRel, risk };
}

// open <SLC-…>: start the change that delivers a planned slice.
function openSlice(start, sliceId, flags = {}) {
  const { model, status } = load(start);
  const slice = model.slices.get(sliceId);
  if (!slice) throw new Error(`${sliceId} is not a slice on the roadmap`);
  if (slice.change) throw new Error(`${sliceId} already has change ${slice.change}`);
  const waits = slice.depends_on.filter((d) => status.slices.has(d) && status.slices.get(d).state !== "done");
  if (waits.length && !flags.force) throw new Error(`${sliceId} waits for ${waits.join(", ")} (use --force to open it anyway)`);
  let refinement = null;
  if (drift.gitEnabled(model)) {
    refinement = drift.refinementCheck(model, drift.context(model), slice, slice.planned_at);
    if (refinement.state === "needs" && !flags["confirm-refinement"]) {
      throw new Error(`${sliceId} needs refinement: ${refinement.changed.join(", ")} changed since it was planned (${refinement.base}). Review them (like sprint planning), then: royascaff open ${sliceId} --confirm-refinement`);
    }
  }
  const created = createChange(start, model, { kind: "feature", slice: sliceId, title: slice.title, feature: slice.feature }, flags);
  if (refinement && refinement.state === "needs") {
    const after = buildModel(start);
    const hashes = drift.recordHashes(after, drift.refinementIds(after, after.slices.get(sliceId)));
    record(after, after.changes.get(created.id), { event: "refinement.confirmed", target: created.id, note: `reviewed at opening (changed: ${refinement.changed.join(", ")}): ${hashes.join(" ")}` }, flags);
    refreshBoard(start);
  }
  return { ...created, refinement: refinement ? refinement.state : "unknown" };
}

// open --kind bug|polish|refactor|chore|knowledge "<title>" [--affects …]
function openOther(start, title, flags = {}) {
  const kind = (flags.kind || "").toLowerCase();
  if (!CHANGE_KINDS.includes(kind) || kind === "feature") throw new Error(`Use \`royascaff open <SLC-…>\` for features, or --kind ${CHANGE_KINDS.filter((k) => k !== "feature").join("|")}`);
  if (!title) throw new Error(`Usage: royascaff open --kind ${kind} "<title>"${["bug", "polish"].includes(kind) ? " --affects REQ-…" : ""}`);
  const affects = flags.affects ? String(flags.affects).split(",").map((x) => x.trim()).filter(Boolean) : [];
  if (["bug", "polish"].includes(kind) && !affects.length) throw new Error(`A ${kind} change needs --affects <REQ-… or CAP-…>`);
  const { model } = load(start);
  const unknown = affects.filter((a) => !model.records.has(a));
  if (unknown.length) throw new Error(`Unknown: ${unknown.join(", ")}`);
  const risk = flags.risk || (["bug", "polish", "chore"].includes(kind) ? "low" : "medium");
  return createChange(start, model, { kind, affects, title }, { ...flags, risk });
}

// new task <CHG-…> "<title>" — only before the change is ready (stage 3 Plan or earlier).
function newTask(start, changeId, title, flags = {}) {
  if (!changeId || !title) throw new Error('Usage: royascaff new task <CHG-…> "<title>" [--goal …] [--inputs REQ-…,CMP-…] [--paths "apps/web/src/x/**"] [--checks typecheck,test] [--done "…"] [--depends TASK-…]');
  const { model } = load(start);
  const change = changeOf(model, changeId);
  if (ORDER.indexOf(change.status) >= ORDER.indexOf("ready")) {
    throw new Error(`${changeId} is already ${change.status}: adding a task changes the approved plan. Move it back first: royascaff advance ${changeId} --to approved --reason "…"`);
  }
  const id = nextId(model.records.keys(), `TASK-${model.code}`);
  const planFile = path.join(model.root, change.dir, "plan.md");
  let text = fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf8") : planTemplate(changeId);
  if (!text.endsWith("\n")) text += "\n";
  const field = (k, v) => (v ? `- **${k}:** ${v}` : `- **${k}:**`);
  const list = (v) => (v ? String(v).split(",").map((x) => x.trim()).filter(Boolean).join(", ") : "");
  text += `\n### ${id} · ${title}\n\n${[
    field("Goal", flags.goal || title),
    field("Inputs", list(flags.inputs)),
    field("Allowed paths", list(flags.paths)),
    field("Checks", list(flags.checks)),
    field("Done when", flags.done),
    ...(flags.depends ? [field("Depends on", list(flags.depends))] : []),
  ].join("\n")}\n`;
  transactional(start, planFile, text);
  refreshBoard(start);
  return { id, change: changeId, file: `${change.dir}/plan.md` };
}

function advance(start, changeId, to, flags = {}) {
  if (!to) throw new Error("Usage: royascaff advance <CHG-…> --to <status> [--reason …]");
  let { model, status } = load(start);
  const change = changeOf(model, changeId);
  const from = change.status;

  if (to === "cancelled" || ORDER.indexOf(to) >= 0 && ORDER.indexOf(to) < ORDER.indexOf(from)) {
    if (!flags.reason) throw new Error(`Moving ${changeId} ${to === "cancelled" ? "to cancelled" : "back"} needs --reason "…"`);
    if (to !== "cancelled" && ORDER.indexOf(to) > ORDER.indexOf("approved")) throw new Error("A change can move back only to draft, analyzed or approved");
    setStatus(model, change, to);
    record(model, change, { event: "change.advanced", target: changeId, note: `${from} → ${to}: ${flags.reason}` }, flags);
    refreshBoard(start);
    return { id: changeId, from, reached: to, steps: [{ to, ok: true, checks: [] }] };
  }

  const steps = pathTo(change, to);
  if (!steps) return { id: changeId, from, reached: from, steps: [], message: `${changeId} is already ${from}` };
  const results = [];
  let reached = from;
  for (const step of steps) {
    ({ model, status } = load(start));
    const current = model.changes.get(changeId);
    const ctx = { model, status, change: current, projectDir: model.root, body: changeBody(model.root, current) };
    const result = evaluate(ctx, step);
    results.push(result);
    if (!result.ok) break;
    setStatus(model, current, step);
    record(model, current, { event: "change.advanced", target: changeId, note: `${reached} → ${step}${flags.note ? `: ${flags.note}` : ""}` }, flags);
    reached = step;
  }
  refreshBoard(start);
  return { id: changeId, from, reached, steps: results, ok: reached === to };
}

function approve(start, changeId, flags = {}) {
  const { model } = load(start);
  const change = changeOf(model, changeId);
  const by = who(flags, model.repo);
  if (!isHuman(by)) throw new Error(`Approval must come from a person, not "${by}". Run it yourself, or pass --by <your name>.`);
  if (!["analyzed", "verified"].includes(change.status)) throw new Error(`${changeId} is ${change.status}: approvals are given at Design (analyzed) or before Record (verified)`);
  const hash = designHash(model.root, change);
  record(model, change, { event: "change.approved", target: changeId, by, note: `design ${hash}${flags.note ? ` — ${flags.note}` : ""}` }, flags);
  refreshBoard(start);
  return { id: changeId, by, design: hash, at: change.status };
}

function setBlocked(start, changeId, blocked, flags = {}) {
  const { model } = load(start);
  const change = changeOf(model, changeId);
  if (blocked && !flags.reason) throw new Error('Blocking needs --reason "…"');
  record(model, change, { event: blocked ? "change.blocked" : "change.unblocked", target: changeId, note: flags.reason || "" }, flags);
  refreshBoard(start);
  return { id: changeId, blocked };
}

function taskAction(start, taskId, action, note, flags = {}) {
  const { model, status } = load(start);
  const task = model.tasks.get(taskId);
  if (!task) throw new Error(`${taskId} is not a task in this project`);
  if (!task.change) throw new Error(`${taskId} is not inside a change folder`);
  const change = model.changes.get(task.change);
  const c = status.changes.get(change.id);
  const state = status.tasks.get(taskId).state;
  if (!["ready", "in-progress"].includes(change.status)) throw new Error(`${change.id} is ${change.status}: tasks run only when it is ready or in progress (royascaff advance ${change.id} --to ready)`);
  if (action === "start") {
    const lastChangeBlock = (change.events || []).filter((e) => e.target === change.id && /^change\.(un)?blocked$/.test(e.event)).pop();
    if (lastChangeBlock && lastChangeBlock.event === "change.blocked") throw new Error(`${change.id} is blocked: ${lastChangeBlock.note}. Unblock it first.`);
    if (state === "doing") throw new Error(`${taskId} is already in progress`);
    if (state === "done" && !flags.reopen) throw new Error(`${taskId} is done (use --reopen to start it again)`);
    const waits = task.depends_on.filter((d) => status.tasks.has(d) && status.tasks.get(d).state !== "done");
    if (waits.length) throw new Error(`${taskId} waits for ${waits.join(", ")}`);
    let backup = null;
    if (drift.gitEnabled(model)) {
      const ctx = drift.context(model);
      const others = [...status.tasks.values()].filter((t) => t.state === "doing" && t.id !== taskId).map((t) => drift.taskPaths(model, t.id));
      const files = uncommittedWithin(model, drift.taskPaths(model, taskId), others, ctx.isKnowledge);
      backup = saveBackup(model, taskId, files, `before ${taskId} started`);
    }
    if (change.status === "ready") {
      setStatus(model, change, "in-progress");
      record(model, change, { event: "change.advanced", target: change.id, note: "ready → in-progress (first task started)" }, flags);
    }
    if (backup) {
      record(model, change, { event: "backup.saved", target: taskId, note: `${backup.files.length} uncommitted developer file(s) saved to .backups/${backup.id}${backup.stash ? ` and git stash ${backup.stash}` : ""}: ${backup.files.map((f) => f.path).join(", ")}` }, flags);
    }
    record(model, change, { event: "task.started", target: taskId, note: note || "" }, flags);
  } else if (action === "done") {
    if (state !== "doing") throw new Error(`${taskId} is ${state}: start it before marking it done`);
    if (!note) throw new Error(`Say what was done and what is left: royascaff task ${taskId} done "<hand-off note>"`);
    // Quick checks after each task (Q17) — on for projects created by `init` (checks_on_task_done: quick).
    if (String(model.profile.checks_on_task_done || "off") === "quick") {
      const apps = runner.appsForChange(model, { ...change, tasks: [taskId] }).filter((a) => runner.QUICK.some((k) => a.commands[k]));
      if (apps.length) {
        const run = runner.runChecks(model, apps, "quick");
        record(model, change, { event: "check.run", target: taskId, note: `quick ${run.pass ? "pass" : "fail"}: ${apps.map((a) => a.id).join(", ")} — ${runner.summary(run)}${!run.pass && flags["skip-checks"] ? ` — skipped: ${flags["skip-checks"]}` : ""}` }, flags);
        if (!run.pass && !flags["skip-checks"]) {
          refreshBoard(start);
          const failed = run.results.filter((r) => !r.pass);
          throw new Error(`${taskId} is not marked done: quick checks failed.\n${failed.map((r) => `--- ${r.kind} (${r.command}) ---\n${r.tail}`).join("\n")}\nFix them, or: royascaff task ${taskId} done "…" --skip-checks "<reason>"`);
        }
      }
    }
    record(model, change, { event: "task.done", target: taskId, note }, flags);
  } else if (action === "block") {
    if (state === "done") throw new Error(`${taskId} is already done`);
    if (!note) throw new Error(`Say why it is blocked: royascaff task ${taskId} block "<reason>"`);
    record(model, change, { event: "task.blocked", target: taskId, note }, flags);
  } else throw new Error("Use: royascaff task <TASK-…> start | done | block \"<note>\"");
  refreshBoard(start);
  const after = deriveStatus(buildModel(start));
  return { id: taskId, change: change.id, state: after.tasks.get(taskId).state, tasksDone: after.changes.get(change.id).tasksDone, tasksTotal: c.tasksTotal };
}

// check <CHG-…> [--quick]: run the apps' commands and write the result as evidence.
// check <CHG-…> --result pass|fail --note "…": record a check run outside the engine.
function recordCheck(start, changeId, flags = {}) {
  const { model, status } = load(start);
  const change = changeOf(model, changeId);
  if (flags.result) {
    const result = String(flags.result).toLowerCase();
    if (!["pass", "fail"].includes(result)) throw new Error("--result must be pass or fail");
    record(model, change, { event: "check.run", target: changeId, note: `${result}: ${flags.note || "manual check"}` }, flags);
    refreshBoard(start);
    return { id: changeId, result, manual: true };
  }
  const apps = runner.appsForChange(model, change);
  if (!apps.length) throw new Error("No commands to run: add Build / Typecheck / Lint / Test to the APP- records in project/profile.md, or record a manual result with --result pass|fail --note \"…\"");
  const mode = flags.quick ? "quick" : "full";
  const run = runner.runChecks(model, apps, mode);
  const evidence = mode === "full" ? writeCheckEvidence(model, status, change, run, apps) : null;
  const note = `${mode === "quick" ? "quick " : ""}${run.pass ? "pass" : "fail"}: ${apps.map((a) => a.id).join(", ")} — ${runner.summary(run)}${evidence ? ` (${evidence.id})` : ""}`;
  const after = buildModel(start);
  record(after, after.changes.get(changeId), { event: "check.run", target: changeId, note }, flags);
  refreshBoard(start);
  return { id: changeId, mode, result: run.pass ? "pass" : "fail", results: run.results, evidence: evidence ? evidence.id : null, proves: evidence ? evidence.proves : [] };
}

// Evidence for a full run. It proves the runner-checked tests (`Check: runner:…`) that verify the
// requirements in this change's scope (delivered by its slice, or affected by a fix).
function writeCheckEvidence(model, status, change, run, apps) {
  const scope = new Set([...change.slices.flatMap((s) => (model.slices.get(s) ? model.slices.get(s).delivers : [])), ...change.affects]);
  const proves = [];
  if (run.pass) {
    for (const rec of model.records.values()) {
      if (rec.kind !== "test" || !/^runner:/i.test(String(rec.fields.Check || "").trim())) continue;
      const verifies = rec.relations.filter((r) => r.type === "verifies").map((r) => r.to);
      const verifiedBy = [...scope].filter((req) => (model.records.get(req)?.relations || []).some((r) => r.type === "verified_by" && r.to === rec.id));
      if (verifies.some((v) => scope.has(v)) || verifiedBy.length) proves.push(rec.id);
    }
  }
  const nextNum = [...model.records.keys()].reduce((max, id) => {
    const m = id.match(new RegExp(`^EVD-${model.code}-(\\d+)$`));
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0) + 1;
  const id = `EVD-${model.code}-${String(nextNum).padStart(3, "0")}`;
  const dir = path.join(model.root, change.dir, "evidence");
  const file = path.join(dir, "checks.md");
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, `# Checks · ${change.id}\n\n> **What:** results of \`royascaff check\` runs (written by the CLI)\n> **Read when:** a check failed, or to see what proved this change\n`);
  const lines = [
    "",
    `### ${id} · Full checks: ${apps.map((a) => a.title).join(", ")}`,
    "",
    `- **Result:** ${run.pass ? "pass" : "fail"}`,
    ...(proves.length ? [`- **Proves:** ${proves.join(", ")}`] : []),
    `- **Command:** ${run.results.map((r) => `\`${r.command}\``).join(" · ")}`,
    `- **Git commit:** ${headShort(model.repo) || "—"}`,
    `- **Checks:** ${run.results.map((r) => `${r.kind.toLowerCase()} ${r.pass ? "pass" : r.timedOut ? "timed out" : `fail (exit ${r.exit})`} ${(r.ms / 1000).toFixed(1)}s`).join(" · ")}`,
    "",
  ];
  for (const r of run.results.filter((x) => !x.pass)) lines.push(`**${r.kind} failed** in \`${r.cwd}\`:`, "", "```text", r.tail || "(no output)", "```", "");
  fs.appendFileSync(file, lines.join("\n"));
  return { id, proves };
}

// record <commit…> --as bug|polish|refactor|chore [--affects …] "note"  (or --files a,b without git)
// Creates a change after the fact for work done outside the engine. The work is already done,
// so the change starts in progress; it closes through the normal checks and evidence gates.
function recordWork(start, refs, note, flags = {}) {
  const kind = (flags.as || flags.kind || "").toLowerCase();
  if (!["bug", "polish", "refactor", "chore", "feature"].includes(kind)) throw new Error("Usage: royascaff record <commit…> --as bug|polish|refactor|chore [--affects REQ-…|CAP-…] \"what was done\"  (feature work: --as feature --slice SLC-…)");
  if (!note) throw new Error("Say what was done: royascaff record … \"<note>\"");
  const { model } = load(start);
  const commits = [];
  for (const ref of refs) {
    const full = resolveCommit(model.repo, ref);
    if (!full) throw new Error(`${ref} is not a commit in this repository`);
    commits.push({ short: full.slice(0, 7), subject: git(model.repo, ["show", "-s", "--format=%s", full]) || "", files: (git(model.repo, ["show", "--name-only", "--format=", "--relative", full]) || "").split("\n").filter(Boolean) });
  }
  const files = flags.files ? String(flags.files).split(",").map((x) => x.trim()).filter(Boolean) : [];
  if (!commits.length && !files.length) throw new Error("Name the commits to record, or --files a,b when there is no git history");
  const affects = flags.affects ? String(flags.affects).split(",").map((x) => x.trim()).filter(Boolean) : [];
  if (["bug", "polish"].includes(kind) && !affects.length) throw new Error(`A ${kind} needs --affects <REQ-… or CAP-…>`);
  let created;
  if (kind === "feature") {
    if (!flags.slice) throw new Error("Recording feature work needs --slice SLC-…");
    created = openSlice(start, flags.slice, { ...flags, force: true, "confirm-refinement": true });
  } else {
    created = createChange(start, model, { kind, affects, title: note }, { ...flags, risk: flags.risk || "low" });
  }
  const after = buildModel(start);
  const change = after.changes.get(created.id);
  const changeFile = path.join(after.root, change.file);
  const lines = ["", "## Recorded work", "", "Done outside the engine and recorded afterwards.", ""];
  for (const c of commits) lines.push(`- \`${c.short}\` ${c.subject}${c.files.length ? ` — ${c.files.join(", ")}` : ""}`);
  for (const f of files) lines.push(`- \`${f}\``);
  fs.appendFileSync(changeFile, `${lines.join("\n")}\n`);
  record(after, change, { event: "manual.recorded", target: change.id, note: `${commits.length ? `commits ${commits.map((c) => c.short).join(", ")}` : `files ${files.join(", ")}`} — ${note}` }, flags);
  setStatus(after, change, "in-progress");
  record(after, change, { event: "change.advanced", target: change.id, note: "draft → in-progress (work already done; recorded after the fact)" }, flags);
  refreshBoard(start);
  return { id: change.id, kind, commits: commits.map((c) => c.short), files };
}

// refine <SLC-…>: the slice was reviewed; its "Planned at" moves to the current commit.
// refine <CHG-…>: the change's requirements were reviewed after they changed.
function refine(start, id, flags = {}) {
  const { model } = load(start);
  const head = git(model.repo, ["rev-parse", "--short", "HEAD"]);
  if (model.changes.has(id)) {
    const change = model.changes.get(id);
    const own = change.slices.map((s) => model.slices.get(s)).filter(Boolean);
    const ids = [...new Set(own.flatMap((s) => drift.refinementIds(model, s)))];
    const hashes = ids.length ? drift.recordHashes(model, ids) : [];
    record(model, change, { event: "refinement.confirmed", target: id, note: `${flags.note || "requirements reviewed"}${hashes.length ? `: ${hashes.join(" ")}` : ""}` }, flags);
    refreshBoard(start);
    return { id, confirmed: true };
  }
  const slice = model.slices.get(id);
  if (!slice) throw new Error(`${id} is not a slice or a change`);
  if (!head) throw new Error("Refining a slice needs git (its Planned at is a commit)");
  const file = path.join(model.root, slice.file);
  const parsed = parseMarkdown(fs.readFileSync(file, "utf8"));
  const seg = parsed.segments.find((x) => x.type === "record" && x.id === slice.feature);
  const lines = seg.body.split("\n");
  const table = readTables(seg.body).find((t) => t.header[0].toLowerCase() === "slice");
  const col = table.header.map((h) => h.toLowerCase()).indexOf("planned at");
  const row = table.rows.find((r) => r.cells[0].replace(/`/g, "") === id);
  if (col < 0 || !row) throw new Error(`Cannot find the Planned at cell of ${id}`);
  const cells = [...row.cells];
  cells[col] = head;
  lines[row.lineOffset] = `| ${cells.join(" | ")} |`;
  seg.body = lines.join("\n");
  transactional(start, file, renderMarkdown(parsed));
  refreshBoard(start);
  return { id, planned_at: head };
}

function backups(start, action, id) {
  const { model } = load(start);
  if (action === "restore") return restoreBackup(model, id);
  return listBackups(model);
}

module.exports = { openSlice, openOther, newTask, advance, approve, setBlocked, taskAction, recordCheck, recordWork, refine, backups };
