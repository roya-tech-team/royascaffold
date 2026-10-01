"use strict";

// `rollback <CHG|REL>`, `deprecate <ID>` and `measure EXP-…` (plan file 02 §4, E6, E7, E9).

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { deriveStatus } = require("../derive/status.cjs");
const { parseMarkdown, renderMarkdown, recordText } = require("../parse/markdown.cjs");
const { appendEvent } = require("../events.cjs");
const { headShort } = require("../git.cjs");
const { who } = require("../identity.cjs");
const { begin, finish } = require("../authority.cjs");
const work = require("./work.cjs");
const { transactional, newSlice } = require("./plan.cjs");
const rollback = require("../rollback.cjs");
const flagsLib = require("../flags.cjs");
const crypto = require("crypto");

const fail = (code, message, missing) => Object.assign(new Error(message), { code, ...(missing ? { missing } : {}) });

function rollbackCommand(start, target, flags = {}) {
  if (!target) throw fail("INVALID_INPUT", "Usage: royascaff rollback <CHG-…|REL-…> [--to REL-…] [--risk …] [path]");
  const model = buildModel(start);
  const status = deriveStatus(model);
  const plan = rollback.planRollback(model, status, target, flags);
  const created = work.createChange(start, model, { kind: "rollback", reverts: plan.reverts, affects: plan.requirements.map((r) => r.id), baseline: plan.baseline, title: `Roll back ${target}` }, { ...flags, risk: flags.risk && flags.risk !== true ? flags.risk : "medium" });
  const after = buildModel(start);
  const change = after.changes.get(created.id);
  const file = path.join(after.root, change.file);
  fs.appendFileSync(file, `\n${rollback.renderRevert(plan)}\n\n${rollback.renderRestore(plan)}\n`);
  let task = null;
  if (plan.paths.length) {
    const inputs = (plan.requirements.length ? plan.requirements.map((r) => r.id) : plan.reverts).join(",");
    task = work.newTask(start, created.id, `Revert ${target}`, { by: flags.by, goal: `Revert the commits of ${plan.reverts.join(", ")} (newest first) and edit the records back to ${plan.baseline || "their earlier wording"}`, inputs, paths: plan.paths.join(","), checks: "test", done: "the commits are reverted, the records say what the baseline says and the tests pass" }).id;
  }
  work.refreshBoard(start);
  return {
    id: created.id,
    kind: "rollback",
    target,
    reverts: plan.reverts,
    baseline: plan.baseline,
    risk: created.risk,
    commits: plan.commits,
    requirements: plan.requirements,
    task,
    next: `Revert the commits in the task (git revert, newest first; if it conflicts in project/, keep the current project files), edit the records back to the baseline wording, commit, then: royascaff verify ${created.id} and royascaff advance ${created.id} --to closed`,
  };
}

// deprecate <ID> [--slice SLC-… | --feature CAP-…] [--reason "…"]: a requirement or component is scheduled for removal.
function deprecateCommand(start, id, flags = {}) {
  if (!id) throw fail("INVALID_INPUT", 'Usage: royascaff deprecate <REQ-…|NFR-…|CMP-…> [--slice SLC-… | --feature CAP-…] [--reason "…"] [path]');
  const model = buildModel(start);
  const rec = model.records.get(id);
  if (!rec) throw fail("UNKNOWN_ID", `${id} is not a record in this project`);
  if (!["requirement", "nfr", "use-case", "component"].includes(rec.kind)) throw fail("INVALID_INPUT", `${id} is a ${rec.kind}: requirements and components can be deprecated`);
  if (flagsLib.deprecatedOf(model).some((d) => d.id === id)) throw fail("ALREADY_EXISTS", `${id} is already deprecated`);
  let slice = flags.slice && flags.slice !== true ? String(flags.slice) : null;
  let planned = false;
  if (slice && !model.slices.has(slice)) throw fail("UNKNOWN_ID", `${slice} is not a slice on the roadmap`);
  if (!slice) {
    const viaReqs = rec.kind === "component" ? rec.relations.filter((r) => ["realizes", "realized_by"].includes(r.type)).map((r) => model.records.get(r.to)).filter(Boolean) : [rec];
    const feature = flags.feature && flags.feature !== true ? String(flags.feature) : (viaReqs.flatMap((r) => r.relations).find((r) => ["feature", "satisfies"].includes(r.type)) || {}).to;
    if (!feature || !model.features.has(feature)) throw fail("INVALID_INPUT", `Name the slice that removes ${id}: --slice SLC-… (plan it first), or --feature CAP-… to plan one here`);
    slice = newSlice(start, feature, `Remove ${id} · ${rec.title}`, {}).id;
    planned = true;
  }
  const date = new Date().toISOString().slice(0, 10);
  const reason = flags.reason && flags.reason !== true ? String(flags.reason) : "";
  const fresh = buildModel(start);
  const frec = fresh.records.get(id);
  const abs = path.join(fresh.root, frec.file);
  const parsed = parseMarkdown(fs.readFileSync(abs, "utf8"));
  const seg = parsed.segments.find((s) => s.type === "record" && s.id === id);
  if (!seg) throw fail("INVALID_INPUT", `${id} cannot be deprecated in place: it is not a record with fields in ${frec.file}`);
  seg.fields = (seg.fields || []).filter((f) => !["Status", "Deprecated", "Removal slice"].includes(f.key));
  seg.fields.push({ key: "Status", value: "deprecated" }, { key: "Deprecated", value: `${date}${reason ? ` — ${reason}` : ""}` }, { key: "Removal slice", value: slice });
  transactional(start, abs, renderMarkdown(parsed));
  const by = who(flags, fresh.repo);
  appendEvent(fresh.root, "project", { event: "record.deprecated", target: id, by, git: headShort(fresh.repo) || "—", note: `removal slice ${slice}${reason ? `: ${reason}` : ""}` });
  work.refreshBoard(start);
  return { id, kind: rec.kind, removal_slice: slice, planned_slice: planned, date, by };
}

// measure EXP-… --result "keep A"|stop --note "…": a person records the experiment's decision (E6). The variants that
// lost become removal slices on the experiment's feature.
function measureExperiment(start, expId, flags = {}) {
  const model = buildModel(start);
  if (!model.approvals) throw new Error("Plan approvals are for RoyaScaff 1.4 projects (profile.md has royascaff: 1.4). Migrate first: royascaff migrate");
  const started = begin(model, flags, "A decision");
  const exp = flagsLib.experimentsOf(model).find((e) => e.id === expId);
  if (!exp) throw fail("UNKNOWN_ID", `${expId} is not an experiment (EXP-)`);
  const raw = String(flags.result === true ? "" : flags.result || "").trim().replace(/\s+/g, " ");
  const m = raw.match(/^keep[- ](\S+)$/i);
  const stop = /^stop$/i.test(raw);
  if (!stop && !(m && exp.variants.some((v) => v.name.toLowerCase() === m[1].toLowerCase()))) throw fail("INVALID_INPUT", `Usage: royascaff measure ${expId} --result "keep ${exp.variants.length ? exp.variants.map((v) => v.name).join('" | "keep ') : "A"}" | stop --note "what was measured, and the number"`);
  if (exp.decision) throw fail("ALREADY_EXISTS", `${expId} already has a decision: ${exp.decision}`);
  const kept = stop ? null : exp.variants.find((v) => v.name.toLowerCase() === m[1].toLowerCase()).name;
  const decision = stop ? "stop" : `keep ${kept}`;
  const rec = model.records.get(expId);
  const text = recordText(fs.readFileSync(path.join(model.root, rec.file), "utf8"), expId) || "";
  const hash = crypto.createHash("sha256").update(text).digest("hex").slice(0, 10);
  const sig = finish(model, started, { act: "measure", target: expId, hash });
  const said = flags.note && flags.note !== true ? String(flags.note) : sig.personNote;
  if (!said) throw new Error("Say what was measured and the result: --note \"…\"");
  const date = new Date().toISOString().slice(0, 10);
  const abs = path.join(model.root, rec.file);
  const parsed = parseMarkdown(fs.readFileSync(abs, "utf8"));
  const seg = parsed.segments.find((s) => s.type === "record" && s.id === expId);
  if (!seg) throw fail("INVALID_INPUT", `${expId} cannot be decided in place: it is not a record with fields in ${rec.file}`);
  seg.fields = (seg.fields || []).filter((f) => !["Decision", "Decided by", "Decided on"].includes(f.key));
  seg.fields.push({ key: "Decision", value: decision }, { key: "Decided by", value: sig.by }, { key: "Decided on", value: date });
  transactional(start, abs, renderMarkdown(parsed));
  const slices = [];
  if (exp.feature) {
    const losers = stop ? [{ name: "all variants", what: "" }] : exp.variants.filter((v) => v.name !== kept);
    for (const v of losers) slices.push(newSlice(start, exp.feature, stop ? `Remove ${expId} (stopped) · ${exp.title}` : `Remove variant ${v.name} of ${expId} · ${exp.title}`, {}).id);
  }
  const after = buildModel(start);
  appendEvent(after.root, "project", { event: "experiment.decided", target: expId, by: sig.by, git: headShort(after.repo) || "—", note: `${decision}: ${said}${slices.length ? ` · removal slice(s) ${slices.join(", ")}` : ""}${sig.note}` });
  work.refreshBoard(start);
  return { id: expId, by: sig.by, result: decision, decision, outcome: exp.outcome, removal_slices: slices };
}

module.exports = { rollbackCommand, deprecateCommand, measureExperiment };
