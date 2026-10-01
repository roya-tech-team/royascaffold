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
const { begin, finish, tokenOf, nonInteractive, refuse, NEED_TOKEN } = require("../authority.cjs");

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
  if (model.approvals) {
    // Plan approvals (P1): nothing is built before a person approved the project and this feature's plan.
    const override = flags.force && isHuman(who(flags, model.repo));
    const project = model.approvals.project.state;
    const feature = (model.approvals.features.get(slice.feature) || { state: "none" }).state;
    if (project !== "approved" && !override) throw new Error(`The project is ${project === "stale" ? "changed since it was approved" : "not approved yet"}: finish the discovery, then a person runs royascaff approve project (see royascaff next)`);
    if (feature !== "approved" && !override) throw new Error(`${slice.feature} ${feature === "stale" ? "changed since its plan was approved" : "has no approved plan"}: a person reviews it, then runs royascaff approve ${slice.feature} (or royascaff approve roadmap)`);
  }
  if (model.is14 && !flags.recording) {
    // P4: breadth waits — a Next/Later/Backlog slice opens after every Now feature is done and accepted.
    const feature = model.features.get(slice.feature);
    const now = feature && feature.horizon !== "now" ? require("../quality.cjs").nowWaits(model, status) : [];
    if (now.length) {
      const person = flags.force && isHuman(who(flags, model.repo));
      if (!person) throw new Error(`${sliceId} (${feature.horizon}) waits for the Now features: ${now.map((f) => `${f.id} ${f.reason}`).join("; ")}. Finish them first; a person may move ${slice.feature} to Now, or open it with --force${flags.force ? " (--force is for people only)" : ""}`);
    }
  }
  const waits = slice.depends_on.filter((d) => status.slices.has(d) && status.slices.get(d).state !== "done");
  if (waits.length && !flags.force) throw new Error(`${sliceId} waits for ${waits.join(", ")} (use --force to open it anyway)`);
  // E1.4: foundation before breadth. A slice the feature marks as foundation is done before its other slices open.
  const feat = model.features.get(slice.feature);
  const foundationWaits = feat && !slice.foundation && !flags.recording ? feat.foundation.filter((f) => f !== sliceId && status.slices.has(f) && status.slices.get(f).state !== "done") : [];
  if (foundationWaits.length && !(flags.force && isHuman(who(flags, model.repo)))) {
    throw require("../authority.cjs").refuse("GATE_REFUSED", `${sliceId} waits for the foundation slice(s) ${foundationWaits.join(", ")} of ${slice.feature}: build the foundation first${flags.force ? " (--force is for people only)" : "; a person may open it anyway with --force"}`, foundationWaits.map((f) => `${f} done`));
  }
  let refinement = null;
  if (!model.approvals && drift.gitEnabled(model)) {
    refinement = drift.refinementCheck(model, drift.context(model), slice, slice.planned_at);
    if (refinement.state === "needs" && flags["confirm-refinement"] && !isHuman(who(flags, model.repo))) throw new Error(`${sliceId} needs refinement: only a person confirms it (they run royascaff open ${sliceId} --confirm-refinement)`);
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
  if (reached === "closed" && from !== "closed") projectUpdatedBy(start, changeId);
  refreshBoard(start);
  return { id: changeId, from, reached, steps: results, ok: reached === to };
}

// D2: the architecture page is in the project approval. A change whose Impact said Architecture
// changed, and whose design a person approved, updates the page on purpose: when it closes and only
// the page differs from what was approved, the project log records the update under that person's
// approval. Anything else (a low-risk change, an edit outside a change) leaves the approval stale.
function projectUpdatedBy(start, changeId) {
  const model = buildModel(start);
  const a = model.approvals;
  if (!a || a.project.state !== "stale" || !a.project.approvedBase || a.project.approvedBase !== a.project.base) return;
  const change = model.changes.get(changeId);
  const impact = require("../knowledge.cjs").impactOf(changeBody(model.root, change));
  if (!impact || (impact.layers.get("architecture") || {}).state !== "changed") return;
  const approval = [...(change.events || [])].reverse().find((e) => e.event === "change.approved" && isHuman(e.by));
  if (!approval) return;
  const { appendEvent } = require("../events.cjs");
  appendEvent(model.root, "project", { event: "project.updated", target: "project", by: approval.by, git: headShort(model.repo) || "—", note: `hash ${a.project.hash} · base ${a.project.base} · architecture updated by ${changeId} (design approved by ${approval.by})` });
}

// Asks on the controlling terminal and reads one line; null when there is no terminal.
function ttyConfirm(prompt) {
  if (process.env.ROYASCAFF_NO_TTY === "1" || nonInteractive()) return null; // tests and scripts: behave as without a terminal
  let fd;
  try {
    fd = fs.openSync(process.platform === "win32" ? "CON" : "/dev/tty", "r+");
  } catch {
    return null;
  }
  try {
    fs.writeSync(fd, prompt);
    const buf = Buffer.alloc(1);
    let line = "";
    while (fs.readSync(fd, buf, 0, 1, null) === 1) {
      const ch = buf.toString("utf8");
      if (ch === "\n" || ch === "\r") break;
      line += ch;
      if (line.length > 200) break;
    }
    return line;
  } catch {
    return null;
  } finally {
    fs.closeSync(fd);
  }
}

function approve(start, changeId, flags = {}) {
  const { model } = load(start);
  const change = changeOf(model, changeId);
  const started = begin(model, flags);
  if (!["analyzed", "verified"].includes(change.status)) throw new Error(`${changeId} is ${change.status}: approvals are given at Design (analyzed) or before Record (verified)`);
  const hash = designHash(model.root, change);
  const sig = finish(model, started, { act: "approve-change", target: changeId, hash });
  const said = flags.note || sig.personNote;
  record(model, change, { event: "change.approved", target: changeId, by: sig.by, note: `design ${hash}${said ? ` — ${said}` : ""}${sig.note}` }, flags);
  refreshBoard(start);
  return { id: changeId, by: sig.by, design: hash, at: change.status, ...(sig.signed ? { signed: true, jti: sig.jti, issuer: sig.iss } : {}) };
}

function setBlocked(start, changeId, blocked, flags = {}) {
  const { model } = load(start);
  const change = changeOf(model, changeId);
  if (blocked && !flags.reason) throw new Error('Blocking needs --reason "…"');
  if (!blocked) {
    // E1.4: a block set by the repair limit is lifted by a person, who decides to allow more attempts.
    const lastBlock = (change.events || []).filter((e) => e.target === change.id && /^change\.(un)?blocked$/.test(e.event)).pop();
    if (lastBlock && require("../repair.cjs").isRepairBlock(lastBlock) && !isHuman(who(flags, model.repo))) {
      throw require("../authority.cjs").refuse("HUMAN_REQUIRED", `${changeId} was blocked by the repair limit: only a person decides to allow more attempts`, ["a person: royascaff unblock " + changeId + ' --reason "…"']);
    }
  }
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
    // D8 (owner decision Q1-B): tests first inside the task. A task that implements a must
    // requirement or NFR records a red run (tests written, failing) after it started.
    const tf = require("../testsfirst.cjs");
    if (tf.applies(model, change) && !tf.recordedAfterTheFact(change.events || [])) {
      const musts = tf.mustTargets(model, change).filter((id) => model.records.get(taskId).relations.some((r) => r.type === "inputs" && r.to === id));
      if (musts.length) {
        const events = change.events || [];
        const startedAt = events.reduce((at, e, i) => (e.event === "task.started" && e.target === taskId ? i : at), -1);
        if (!events.some((e, i) => i > startedAt && e.event === "check.red")) throw new Error(`${taskId} implements ${musts.join(", ")} (must): tests come first inside the task. Write the tests that call the new behavior, run royascaff check ${change.id} --red (they must fail), then write the code, then mark the task done`);
      }
    }
    let outsideNote = "";
    if (model.is14 && drift.gitEnabled(model)) {
      const ctx = drift.context(model);
      const { matchesAny } = require("../glob.cjs");
      const { workingChanges, filesChangedSince } = require("../git.cjs");
      const allowed = drift.taskPaths(model, taskId);
      // R2: the task's code and the knowledge it changed are committed together, before done.
      const dirtyCode = workingChanges(model.repo).filter((w) => !ctx.isKnowledge(w.path) && matchesAny(w.path, allowed)).map((w) => w.path);
      const dirtyKnowledge = drift.uncommittedKnowledge(model).map((w) => w.path);
      if (dirtyCode.length || dirtyKnowledge.length) {
        const files = [...dirtyCode, ...dirtyKnowledge];
        throw new Error(`${taskId} is not marked done: commit its work and its knowledge first (${files.length} file(s): ${files.slice(0, 5).join(", ")}${files.length > 5 ? ", …" : ""}):\n  git add ${[...new Set([...dirtyCode, ctx.projectRel || "."])].join(" ")} && git commit -m "${taskId}: <what changed>"`);
      }
      // R5: the task changed only files inside its allowed paths (knowledge excepted).
      const started = (change.events || []).filter((e) => e.target === taskId && e.event === "task.started").pop();
      const base = started && resolveCommit(model.repo, started.git);
      if (base) {
        const outside = filesChangedSince(model.repo, base).filter((f) => !ctx.isKnowledge(f) && !matchesAny(f, allowed));
        if (outside.length) {
          const accepted = flags["outside-ok"] && isHuman(who(flags, model.repo));
          if (!accepted) throw new Error(`${taskId} changed files outside its allowed paths (${allowed.join(", ") || "none"}): ${outside.join(", ")}.\nMove the change back into the task's paths, widen the task's plan before it starts, or a person accepts it: royascaff task ${taskId} done "…" --outside-ok "<reason>"`);
          outsideNote = ` — outside allowed paths (${outside.join(", ")}) accepted by ${who(flags, model.repo)}: ${flags["outside-ok"]}`;
        }
      }
    }
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
    record(model, change, { event: "task.done", target: taskId, note: `${note}${outsideNote}` }, flags);
  } else if (action === "block") {
    if (state === "done") throw new Error(`${taskId} is already done`);
    if (!note) throw new Error(`Say why it is blocked: royascaff task ${taskId} block "<reason>"`);
    record(model, change, { event: "task.blocked", target: taskId, note }, flags);
  } else throw new Error("Use: royascaff task <TASK-…> start | done | block \"<note>\"");
  refreshBoard(start);
  const after = deriveStatus(buildModel(start));
  return { id: taskId, change: change.id, state: after.tasks.get(taskId).state, tasksDone: after.changes.get(change.id).tasksDone, tasksTotal: c.tasksTotal };
}

// check <CHG-…> --red (WP-C4): run only the Test commands and expect them to FAIL — proof that the
// acceptance tests were written before the code they test.
function redCheck(start, model, change, flags) {
  const apps = runner.appsForChange(model, change).filter((a) => a.commands.Test);
  if (!apps.length) throw new Error("No Test command to run: add - **Test:** to the APP- record in project/profile.md");
  const run = runner.runChecks(model, apps, "red");
  if (run.pass) throw new Error(`Tests already pass (${runner.summary(run)}) — they do not test the new behavior yet. Write tests that call the behavior this change adds, then run --red again`);
  const after = buildModel(start);
  record(after, after.changes.get(change.id), { event: "check.red", target: change.id, note: `tests fail before the work: ${apps.map((a) => a.id).join(", ")} — ${runner.summary(run)}` }, flags);
  refreshBoard(start);
  return { id: change.id, mode: "red", result: "red", results: run.results, evidence: null, proves: [] };
}

// check <CHG-…> [--quick]: run the apps' commands and write the result as evidence.
// check <CHG-…> --result pass|fail --note "…": record a check run outside the engine.
function recordCheck(start, changeId, flags = {}) {
  const { model, status } = load(start);
  const change = changeOf(model, changeId);
  if (flags.result) {
    const result = String(flags.result).toLowerCase();
    if (!["pass", "fail"].includes(result)) throw new Error("--result must be pass or fail");
    let note = `${result}: ${flags.note || "manual check"}`;
    let by;
    const smoke = require("../smoke.cjs");
    const bar = model.approvals ? model.approvals.discovery.visualBar : [];
    // A look comes from a person at a terminal, or with a signed token (--approval-token, or the
    // environment variable together with --bar). An AI's own pass is a check, not a look.
    const token = flags["approval-token"] !== undefined || (flags.bar !== undefined && process.env.ROYASCAFF_APPROVAL_TOKEN) ? tokenOf(flags) : null;
    if (result === "pass" && model.is14 && bar.length && smoke.visualBarRequired(model) && (token || isHuman(who(flags, model.repo)))) {
      // WP-C5 (P7): a person's look is scored against the visual bar.
      const claimedBar = token && flags.bar === undefined ? require("../signed.cjs").parseToken(token).claims.bar : undefined;
      const scored = smoke.parseBar(flags.bar !== undefined ? flags.bar : claimedBar, bar.length);
      // E2.2: what the person reads and how the check is called come from the adapter's personCheck; the web wording stays.
      const pc = require("../adapters.cjs").policy(model).personCheck;
      const generic = Boolean(pc && pc.kind !== "visual");
      const noun = generic ? `${pc.kind} check` : "look";
      const barName = generic ? pc.bar.toLowerCase() : "visual bar";
      const transcript = generic ? smoke.latestTranscript(model, change) : null;
      const artifacts = (shots) => (generic ? (transcript ? `Recorded run:\n  ${transcript}\n` : "") : (shots.length ? `Screenshots:\n${shots.map((s) => `  ${s}`).join("\n")}\n` : ""));
      if (!scored) {
        const shots = smoke.latestShots(model, change);
        const ev = [...model.evidence.values()].filter((e) => e.change === change.id).sort((a, b) => b.id.localeCompare(a.id))[0];
        const ph = ev && model.records.get(ev.id) ? model.records.get(ev.id).fields.Placeholders : null;
        const have = generic ? (transcript ? `Latest recorded run:\n  ${transcript}` : `No recorded run yet: run royascaff verify ${changeId}`) : (shots.length ? `Latest screenshots:\n${shots.map((s) => `  ${s}`).join("\n")}` : "No screenshots yet: run royascaff check " + changeId);
        throw new Error(`Score the ${noun} against the ${barName} with --bar all | --bar 1,2,4 (the lines that pass) | --bar none:\n${bar.map((l, i) => `  ${i + 1}. ${l}`).join("\n")}\n${have}${ph ? `\nPlaceholder content found by the last check: ${ph}` : ""}`);
      }
      const did = generic ? "checked the run" : "looked at the app";
      note = scored.gaps.length
        ? `pass with gaps ${scored.gaps.join(", ")}: ${flags.note || did} · bar: ${scored.passed.length} of ${bar.length}`
        : `pass: ${flags.note || did} · bar: all ${bar.length}`;
      if (token) {
        const sig = finish(model, { token }, { act: "person-check", target: changeId, hash: designHash(model.root, change), bar: String(flags.bar !== undefined ? flags.bar : claimedBar) });
        by = sig.by;
        if (flags.note === undefined && sig.personNote) note = note.replace(`: ${did}`, `: ${sig.personNote}`);
        note += ` · look:signed${sig.note}`;
      }
      // D9 (owner decision Q2-A): the look is confirmed in a terminal. An AI tool's shell has no
      // terminal to answer from, so it cannot record a person's look.
      if (!token) {
        const shots = smoke.latestShots(model, change);
        const prompt = `\n${change.id} · your ${noun} against the ${barName}:\n${bar.map((l, i) => `  ${scored.passed.includes(i + 1) ? "✓" : "✗"} ${i + 1}. ${l}`).join("\n")}\n${artifacts(shots)}Record this ${noun} as ${who(flags, model.repo)}? Type yes: `;
        const answer = (typeof flags.confirm === "function" ? flags.confirm : ttyConfirm)(prompt);
        if (answer === null) throw refuse("HUMAN_REQUIRED", `A person's ${noun} is confirmed in a terminal: run this command yourself in a terminal and answer the prompt (an AI tool cannot)`, [NEED_TOKEN]);
        if (!/^\s*y(es)?\s*$/i.test(answer)) throw new Error(`${generic ? "Check" : "Look"} not recorded (answer: "${String(answer).trim()}")`);
        note += " · look:tty";
      }
    }
    record(model, change, { event: "check.run", target: changeId, note, ...(by ? { by } : {}) }, flags);
    refreshBoard(start);
    return { id: changeId, result, manual: true, note };
  }
  if (flags.red) return redCheck(start, model, change, flags);
  return runChecksFor(start, model, status, change, flags, { verify: false });
}

// check (quick or full) and verify share one run. verify also runs the checks the adapters declare, judges
// every typed acceptance line by what ran, and counts the failure for the repair loop.
function runChecksFor(start, model, status, change, flags, { verify }) {
  const changeId = change.id;
  const apps = runner.appsForChange(model, change);
  const policy = require("../adapters.cjs").policy(model);
  if (!apps.length) throw new Error("No commands to run: add Build / Typecheck / Lint / Test to the APP- records in project/profile.md, or record a manual result with --result pass|fail --note \"…\"");
  const mode = flags.quick && !verify ? "quick" : "full";
  // WP-C5: the Smoke command writes its screenshots next to the evidence of this run.
  const evdId = mode === "full" ? nextEvidenceId(model) : null;
  const shots = evdId && apps.some((a) => a.commands.Smoke) ? path.join(model.root, change.dir, "evidence", "shots", evdId) : null;
  const run = runner.runChecks(model, apps, mode, { shots, ...(verify ? { extra: policy.checks } : {}) });
  // WP-C7 (P9): unused dependencies fail the full check; placeholder content is a warning.
  let content = { placeholders: [] };
  if (mode === "full" && model.is14) {
    content = require("../content.cjs").contentChecks(model, apps);
    run.results.push(...content.results);
    const rules = require("../rulecheck.cjs").ruleResult(model); // D6: dependency rules on the code
    if (rules) run.results.push(rules);
    run.pass = run.results.length > 0 && run.results.every((x) => x.pass);
  }
  const lines = verify ? require("../acceptance.cjs").evaluateLines(model, change, run.results) : [];
  const linesFailing = lines.filter((l) => l.result === "fail").map((l) => l.key);
  const result = run.pass && !linesFailing.length ? "pass" : "fail";
  const fp = mode === "full" ? require("../fingerprint.cjs").fingerprintOf(model, change) : null;
  const evidence = mode === "full" ? writeCheckEvidence(model, status, change, run, apps, evdId, shots, content.placeholders, { fingerprint: fp, kind: verify ? "verify" : "check", lines, result }) : null;
  const note = `${mode === "quick" ? "quick " : ""}${result}: ${apps.map((a) => a.id).join(", ")} — ${runner.summary(run)}${evidence ? ` (${evidence.id})` : ""}${linesFailing.length ? ` · failing lines: ${linesFailing.join(", ")}` : ""}`;
  const after = buildModel(start);
  record(after, after.changes.get(changeId), { event: "check.run", target: changeId, note }, flags);
  const out = { id: changeId, mode, result, results: run.results, evidence: evidence ? evidence.id : null, proves: evidence ? evidence.proves : [], shots: evidence ? evidence.shots : [], ...(evidence && evidence.transcript ? { transcript: evidence.transcript } : {}), placeholders: content.placeholders, sourceReaders: model.is14 && mode === "full" ? require("../testsfirst.cjs").sourceReaders(model, apps) : [] };
  if (verify) {
    out.mode = "verify";
    out.fingerprint = fp.hash;
    out.lines = lines;
    out.pending = lines.filter((l) => l.result === "pending").map((l) => l.key);
    // The repair loop: after `repair_limit` failed attempts the change is blocked and a person decides.
    const repair = require("../repair.cjs");
    const reloaded = buildModel(start);
    const state = repair.stateOf(reloaded, reloaded.changes.get(changeId));
    out.repair = { failures: state.failures, limit: state.limit, left: Math.max(0, state.limit - state.failures) };
    if (result === "fail" && state.exceeded) {
      record(reloaded, reloaded.changes.get(changeId), { event: "change.blocked", target: changeId, note: repair.BLOCK_NOTE(state) }, flags);
      out.repair.blocked = true;
    }
  }
  refreshBoard(start);
  return out;
}

// verify <CHG-…>: the machine proof of a change (plan file 01 §4).
function verify(start, changeId, flags = {}) {
  const { model, status } = load(start);
  const change = changeOf(model, changeId);
  if (!["ready", "in-progress", "verified", "reconciled", "closed"].includes(change.status)) throw new Error(`${changeId} is ${change.status}: verify runs once the work is under way (royascaff advance ${changeId} --to ready)`);
  return runChecksFor(start, model, status, change, flags, { verify: true });
}

// Evidence for a full run. It proves the runner-checked tests (`Check: runner:…`) that verify the
// requirements in this change's scope (delivered by its slice, or affected by a fix).
const metricsLine = (run) => run.results.flatMap((r) => Object.entries(r.metrics || {}).map(([k, v]) => `${k}=${v}`)).join(" · ");

function nextEvidenceId(model) {
  const nextNum = [...model.records.keys()].reduce((max, id) => {
    const m = id.match(new RegExp(`^EVD-${model.code}-(\\d+)$`));
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0) + 1;
  return `EVD-${model.code}-${String(nextNum).padStart(3, "0")}`;
}

function writeCheckEvidence(model, status, change, run, apps, evdId = null, shotsDir = null, placeholders = [], opts = {}) {
  const passed = opts.result ? opts.result === "pass" : run.pass;
  const scope = new Set([...change.slices.flatMap((s) => (model.slices.get(s) ? model.slices.get(s).delivers : [])), ...change.affects]);
  const proves = [];
  // R7: when the run covered every app that has a Test command, the whole suite passed, so it
  // proves every runner-checked TEST- in the project, not only this change's.
  const testApps = runner.appsOf(model).filter((a) => a.commands.Test).map((a) => a.id);
  const wholeSuite = testApps.length > 0 && testApps.every((id) => apps.some((a) => a.id === id));
  if (passed) {
    for (const rec of model.records.values()) {
      if (rec.kind !== "test" || !/^runner:/i.test(String(rec.fields.Check || "").trim())) continue;
      if (wholeSuite) { proves.push(rec.id); continue; }
      const verifies = rec.relations.filter((r) => r.type === "verifies").map((r) => r.to);
      const verifiedBy = [...scope].filter((req) => (model.records.get(req)?.relations || []).some((r) => r.type === "verified_by" && r.to === rec.id));
      if (verifies.some((v) => scope.has(v)) || verifiedBy.length) proves.push(rec.id);
    }
  }
  const id = evdId || nextEvidenceId(model);
  const shots = shotsDir ? require("../smoke.cjs").shotsIn(shotsDir) : [];
  const dir = path.join(model.root, change.dir, "evidence");
  // E2.2: the recorded run a person reads (a transcript of commands and their output), next to the evidence.
  const recorded = run.results.filter((r) => r.transcript && r.transcript.length);
  let transcriptRel = null;
  if (recorded.length) {
    transcriptRel = `transcripts/${id}/session.md`;
    const body = [`# Recorded run · ${change.id} · ${id}`, "", "> Written by `royascaff verify`. Read it as a person would: are the messages clear, are the defaults sensible, does every error say what to do?", ""];
    for (const r of recorded) for (const step of r.transcript) body.push(`## $ ${step.command}`, "", `exit status ${step.exit === null ? "(timed out)" : step.exit}`, "", "```text", step.output || "(no output)", "```", "");
    fs.mkdirSync(path.join(dir, "transcripts", id), { recursive: true });
    fs.writeFileSync(path.join(dir, transcriptRel), body.join("\n"));
  }
  const file = path.join(dir, "checks.md");
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, `# Checks · ${change.id}\n\n> **What:** results of \`royascaff check\` runs (written by the CLI)\n> **Read when:** a check failed, or to see what proved this change\n`);
  const lines = [
    "",
    `### ${id} · Full checks: ${apps.map((a) => a.title).join(", ")}`,
    "",
    `- **Result:** ${passed ? "pass" : "fail"}`,
    ...(opts.kind && opts.kind !== "check" ? [`- **Kind:** ${opts.kind}`] : []),
    ...(proves.length ? [`- **Proves:** ${proves.join(", ")}`] : []),
    `- **Command:** ${run.results.map((r) => `\`${r.command}\``).join(" · ")}`,
    `- **Git commit:** ${headShort(model.repo) || "—"}`,
    ...(opts.fingerprint ? [`- **Fingerprint:** ${opts.fingerprint.hash} (${opts.fingerprint.files} file(s) and the engine version)`] : []),
    `- **Checks:** ${run.results.map((r) => `${r.kind.toLowerCase()} ${r.pass ? "pass" : r.timedOut ? "timed out" : `fail (exit ${r.exit})`} ${(r.ms / 1000).toFixed(1)}s`).join(" · ")}`,
    ...(shots.length ? [`- **Screenshots:** ${shots.map((s) => `shots/${id}/${s}`).join(", ")}`] : []),
    ...(transcriptRel ? [`- **Transcript:** ${transcriptRel}`] : []),
    ...(metricsLine(run) ? [`- **Metrics:** ${metricsLine(run)}`] : []),
    ...(placeholders.length ? [`- **Placeholders:** ${require("../content.cjs").placeholderLine(placeholders)}`] : []),
    ...(opts.lines && opts.lines.length ? ["", "**Acceptance lines**", "", ...opts.lines.map((l) => `- ${l.key} · ${l.type || "untyped"} · ${l.result}${l.why ? ` (${l.why})` : ""}`)] : []),
    "",
  ];
  for (const r of run.results.filter((x) => !x.pass)) lines.push(`**${r.kind} failed** in \`${r.cwd}\`:`, "", "```text", r.tail || "(no output)", "```", "");
  fs.appendFileSync(file, lines.join("\n"));
  return { id, proves, shots, transcript: transcriptRel ? require("../project.cjs").toPosix(path.relative(model.repo, path.join(dir, transcriptRel))) : null };
}

// judge <CHG-…>: build the judge pack for a separate AI session (no verdict flags), or record that
// session's verdicts (--verdict-file FILE, or --line KEY --verdict met|not-met|unclear --reason "…").
function readVerdicts(flags) {
  const J = require("../judge.cjs");
  if (flags["verdict-file"] !== undefined) {
    if (flags["verdict-file"] === true) throw Object.assign(new Error("--verdict-file needs a file: --verdict-file verdicts.json"), { code: "INVALID_INPUT" });
    let data;
    try {
      data = JSON.parse(fs.readFileSync(String(flags["verdict-file"]), "utf8"));
    } catch (error) {
      throw Object.assign(new Error(`Cannot read the verdict file ${flags["verdict-file"]}: ${error.message}`), { code: "INVALID_INPUT" });
    }
    const list = Array.isArray(data) ? data : data && data.verdicts;
    if (!Array.isArray(list) || !list.length) throw Object.assign(new Error('The verdict file needs {"verdicts": [{"line", "verdict", "reason"}, …]}'), { code: "INVALID_INPUT" });
    return { judge: Array.isArray(data) ? null : data.judge || null, verdicts: list.map((v) => ({ line: String(v.line || ""), verdict: String(v.verdict || "").toLowerCase(), reason: String(v.reason || "").trim() })) };
  }
  if (flags.verdict !== undefined || flags.line !== undefined) {
    if (!flags.line || flags.line === true || !flags.verdict || flags.verdict === true) throw Object.assign(new Error('Usage: royascaff judge <CHG-…> --line REQ-…#1 --verdict met|not-met|unclear --reason "…"'), { code: "INVALID_INPUT" });
    return { judge: null, verdicts: [{ line: String(flags.line), verdict: String(flags.verdict).toLowerCase(), reason: String(flags.reason === true ? "" : flags.reason || "").trim() }] };
  }
  return null;
}

function judge(start, changeId, flags = {}) {
  const J = require("../judge.cjs");
  const { model, status } = load(start);
  const change = changeOf(model, changeId);
  const input = readVerdicts(flags);
  const lines = J.linesOf(model, change);
  if (!input) {
    const pack = J.buildPack(model, status, change);
    const file = path.join(model.root, ".cache", "judge", `${changeId}.md`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, pack.text);
    return { id: changeId, mode: "pack", pack: require("../project.cjs").toPosix(path.relative(model.repo, file)), fingerprint: pack.fingerprint, builders: pack.builders, lines: lines.map(({ key, req, must, type, text }) => ({ key, req, must, type, text })), text: pack.text };
  }
  const { refuse } = require("../authority.cjs");
  const by = flags.by || input.judge || who({}, model.repo);
  if (!by || by === "unknown") throw refuse("GATE_REFUSED", "Say who is judging: --by ai:<tool>:judge (an AI session) or --by <your name>", ["an identity for the judge"]);
  if (J.builders(change).has(by)) throw refuse("GATE_REFUSED", `${by} built the tasks of ${changeId} and cannot judge it: the builder is not its own judge`, ["a different identity: a separate AI session with the judge role (--by ai:<tool>:judge), or a person who did not build it"]);
  if (!isHuman(by) && !J.JUDGE_ID.test(by)) throw refuse("GATE_REFUSED", `An AI judge identifies itself as ai:<tool>:judge (got "${by}")`, ["--by ai:<tool>:judge"]);
  if (!["ready", "in-progress", "verified", "reconciled"].includes(change.status)) throw new Error(`${changeId} is ${change.status}: the judge reviews work that is under way (ready, in-progress or verified)`);
  const fp = require("../fingerprint.cjs").fingerprintOf(model, change);
  if (![...model.evidence.values()].some((e) => e.change === changeId)) throw refuse("GATE_REFUSED", `${changeId} has no evidence yet: run royascaff verify ${changeId} first, so the judge has evidence to read`, [`royascaff verify ${changeId}`]);
  const known = new Map(lines.map((l) => [l.key, l]));
  const before = J.verdictsOf(model, change, fp.hash);
  for (const v of input.verdicts) {
    if (!known.has(v.line)) throw Object.assign(new Error(`${v.line || "(no line)"} is not a line of ${changeId}: ${[...known.keys()].join(", ") || "none"}`), { code: "UNKNOWN_ID" });
    if (!J.VERDICTS.includes(v.verdict)) throw Object.assign(new Error(`The verdict of ${v.line} must be one of ${J.VERDICTS.join(", ")} (got "${v.verdict}")`), { code: "INVALID_INPUT" });
    if (!v.reason) throw Object.assign(new Error(`Say why: the verdict of ${v.line} needs a reason`), { code: "INVALID_INPUT" });
    const prev = before.get(v.line);
    if (prev && prev.verdict === "unclear" && v.verdict === "met" && !isHuman(by)) throw refuse("HUMAN_REQUIRED", `${v.line} is unclear: only a person turns an unclear line into met`, ["a person: royascaff judge " + changeId + ` --line ${v.line} --verdict met --reason "…" --by <your name>`]);
  }
  const counts = { met: 0, "not-met": 0, unclear: 0 };
  for (const v of input.verdicts) counts[v.verdict] += 1;
  const overall = counts["not-met"] ? "not-met" : counts.unclear ? "unclear" : "met";
  const id = nextEvidenceId(model);
  const dir = path.join(model.root, change.dir, "evidence");
  const file = path.join(dir, "judge.md");
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, `# Judge verdicts · ${changeId}\n\n> **What:** verdicts of the judge on each acceptance line (written by the CLI)\n> **Read when:** a line was not met or unclear, or to see who judged\n`);
  fs.appendFileSync(file, `\n${[
    `### ${id} · Judge verdict`,
    "",
    `- **Kind:** judge`,
    `- **Result:** ${overall}`,
    `- **Judge:** ${by}`,
    `- **Git commit:** ${headShort(model.repo) || "—"}`,
    `- **Fingerprint:** ${fp.hash} (${fp.files} file(s) and the engine version)`,
    "",
    ...input.verdicts.map((v) => `- ${v.line} · ${v.verdict} · ${v.reason.replace(/\s+/g, " ")}`),
    "",
  ].join("\n")}`);
  const after = buildModel(start);
  const notMet = input.verdicts.filter((v) => v.verdict === "not-met").map((v) => v.line);
  record(after, after.changes.get(changeId), { event: "judge.recorded", target: changeId, by, note: `met ${counts.met} · not-met ${counts["not-met"]} · unclear ${counts.unclear}${notMet.length ? ` · not-met lines: ${notMet.join(", ")}` : ""} · ${id}` }, flags);
  const repair = require("../repair.cjs");
  const reloaded = buildModel(start);
  const rs = repair.stateOf(reloaded, reloaded.changes.get(changeId));
  let blocked = false;
  if (notMet.length && rs.exceeded) {
    record(reloaded, reloaded.changes.get(changeId), { event: "change.blocked", target: changeId, by, note: repair.BLOCK_NOTE(rs) }, flags);
    blocked = true;
  }
  const gs = J.gateState(reloaded, reloaded.changes.get(changeId));
  refreshBoard(start);
  return { id: changeId, mode: "verdicts", judge: by, evidence: id, fingerprint: fp.hash, result: overall, recorded: input.verdicts, summary: { met: counts.met, notMet: counts["not-met"], unclear: counts.unclear }, state: { needed: gs.needed, missing: gs.missing, notMet: gs.notMet, unclear: gs.unclear, ok: gs.ok }, repair: { failures: rs.failures, limit: rs.limit, left: rs.left, blocked } };
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
    created = openSlice(start, flags.slice, { ...flags, force: true, recording: true, "confirm-refinement": true });
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
  if (model.approvals) {
    const change = model.changes.get(id);
    const slice = model.slices.get(id) || (change && model.slices.get(change.slice));
    const cap = slice ? slice.feature : "CAP-…";
    throw new Error(`In a 1.4 project a person re-approves the plan instead: review it, then run royascaff approve ${cap}`);
  }
  if (!isHuman(who(flags, model.repo))) throw new Error("Only a person confirms a refinement (it is the sprint-planning review). Ask them to run it.");
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

module.exports = { openSlice, openOther, newTask, advance, approve, setBlocked, taskAction, recordCheck, verify, judge, recordWork, refine, backups };
