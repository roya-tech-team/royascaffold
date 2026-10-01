"use strict";

// request-approval <target> --act <act> [--note "…"]: an AI (or anyone) asks a person to approve or look.
// It writes one event (`approval.requested`) and nothing else: it never approves anything. A person
// answers with `approve`, `check … --bar`, or `measure`, in a terminal or with a signed token.

const path = require("path");
const { buildModel } = require("./model/graph.cjs");
const { appendEvent } = require("./events.cjs");
const { headShort } = require("./git.cjs");
const { who } = require("./identity.cjs");

const ACTS = ["approve-project", "approve-roadmap", "approve-change", "person-check", "measure"];

const fail = (code, message) => Object.assign(new Error(message), { code });

function requestApproval(start, target, flags = {}) {
  const act = flags.act;
  if (!target || !act) throw fail("INVALID_INPUT", `Usage: royascaff request-approval <target> --act ${ACTS.join("|")} [--note "…"]`);
  if (!ACTS.includes(act)) throw fail("INVALID_INPUT", `--act must be one of: ${ACTS.join(", ")}`);
  const model = buildModel(start);
  const by = who(flags, model.repo);
  const known = target === "project" || target === "roadmap" || model.records.has(target) || model.changes.has(target);
  if (!known) throw fail("UNKNOWN_ID", `${target} not found`);
  const note = JSON.stringify({ act, ...(flags.note ? { note: String(flags.note) } : {}) });
  const change = model.changes.get(target);
  const event = { event: "approval.requested", target, by, git: headShort(model.repo) || "—", note };
  const written = change ? appendEvent(path.join(model.root, change.dir), change.id, event) : appendEvent(model.root, "project", event);
  require("./commands/views.cjs").indexCommand(start);
  return { requested: true, approved: false, id: written.id, target, act, requested_by: by, ...(flags.note ? { note: String(flags.note) } : {}), answer: "A person answers with royascaff approve / check --bar / measure, in a terminal or with a signed token. Nothing is approved by this request." };
}

module.exports = { ACTS, requestApproval };
