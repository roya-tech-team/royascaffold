"use strict";

// `approve project` and `approve CAP-…` / `approve roadmap` (plan file 10 §4, file 11 WP1).
// Only people approve. Each approval is an event in project/log.md carrying the hash of what
// was reviewed, so any later edit makes it stale.

const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { deriveStatus } = require("../derive/status.cjs");
const { appendEvent } = require("../events.cjs");
const { headShort } = require("../git.cjs");
const { who } = require("../identity.cjs");
const { projectBlockers, isHuman } = require("../approvals.cjs");

function person(model, flags) {
  const by = who(flags, model.repo);
  if (!isHuman(by)) throw new Error(`Approval must come from a person, not "${by}". Run it yourself, or pass --by <your name>.`);
  return by;
}

function load(start) {
  const model = buildModel(start);
  if (!model.approvals) throw new Error("Plan approvals are for RoyaScaff 1.4 projects (profile.md has royascaff: 1.4). Migrate first: royascaff migrate");
  return model;
}

function write(model, flags, event) {
  return appendEvent(model.root, "project", { ...event, git: headShort(model.repo) || "—" });
}

function approveProject(start, flags = {}) {
  const model = load(start);
  const by = person(model, flags);
  const a = model.approvals;
  const blockers = projectBlockers(a);
  if (blockers.length) throw new Error(`The project is not ready for approval:\n${blockers.map((b) => `  - ${b}`).join("\n")}`);
  const asm = a.discovery.assumptions;
  write(model, flags, { event: "project.approved", target: "project", by, note: `hash ${a.project.hash} · ${a.discovery.questions} question(s) answered · ${asm.length} assumption(s) confirmed${flags.note ? ` — ${flags.note}` : ""}` });
  require("./views.cjs").indexCommand(start);
  return { target: "project", by, hash: a.project.hash, questions: a.discovery.questions, assumptions: asm, decisions: a.decisions, demands: a.coverage.sources.length, unquoted: a.coverage.unquoted };
}

// targets: ["roadmap"] or a list of CAP- IDs.
function approveFeatures(start, targets, flags = {}) {
  const model = load(start);
  const by = person(model, flags);
  const a = model.approvals;
  if (a.project.state !== "approved") throw new Error("Approve the project first (discovery, brief, architecture, stack): royascaff approve project");
  const status = deriveStatus(model);
  let ids;
  if (targets.length === 1 && targets[0] === "roadmap") {
    ids = [...model.features.values()].filter((f) => ["now", "next"].includes(f.horizon)).map((f) => f.id).filter((id) => {
      const d = status.features.get(id);
      return (d.requirementsTotal || d.slicesTotal) && d.approval !== "approved";
    });
    if (!ids.length) throw new Error("Nothing to approve: every Now/Next feature with a plan is already approved");
  } else {
    ids = targets;
    const unknown = ids.filter((id) => !model.features.has(id));
    if (unknown.length) throw new Error(`Not features: ${unknown.join(", ")}`);
  }
  const problems = [];
  const cov = a.coverage;
  if (cov.uncovered.length) problems.push(`${cov.uncovered.length} demand(s) of the request are neither covered nor out of scope: ${cov.uncovered.map((x) => `${x.id} · ${x.title}`).slice(0, 12).join("; ")}${cov.uncovered.length > 12 ? "; …" : ""}`);
  for (const id of ids) {
    const d = status.features.get(id);
    const ap = a.features.get(id);
    if (!d.requirementsTotal) problems.push(`${id} has no requirements yet: outline it first (royascaff new record requirement … --feature ${id})`);
    if (ap.openQuestions.length) problems.push(`${id} has open questions: ${ap.openQuestions.join(", ")}`);
    // P2: quality is planned — a must NFR of a Now/Next feature sits in a slice.
    if (["now", "next"].includes(model.features.get(id).horizon)) {
      for (const nfr of require("../quality.cjs").unslicedMustNfrs(model, id)) problems.push(`${nfr} (must) is in no slice: add it to a slice's Delivers (the look-and-feel foundation goes first)`);
    }
  }
  if (problems.length) throw new Error(`Not approved:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  const approved = [];
  for (const id of ids) {
    const ap = a.features.get(id);
    const d = status.features.get(id);
    write(model, flags, { event: "feature.approved", target: id, by, note: `hash ${ap.hash} · ${d.requirementsTotal} requirement(s) · ${d.slicesTotal} slice(s)${flags.note ? ` — ${flags.note}` : ""}` });
    approved.push({ id, title: model.records.get(id).title, horizon: model.features.get(id).horizon, requirements: d.requirementsTotal, slices: model.features.get(id).slices, hash: ap.hash });
  }
  require("./views.cjs").indexCommand(start);
  return { by, approved, outOfScope: cov.sources.filter((x) => !x.covered.length && x.outOfScope).map((x) => ({ id: x.id, title: x.title, reason: x.outOfScope })) };
}

module.exports = { approveProject, approveFeatures };
