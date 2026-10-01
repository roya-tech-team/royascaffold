"use strict";

// `history <ID>` (plan file 02 §3, E4): every version of a record, the event that made it, the person or agent,
// and the change. Built from the delta blocks of the evolve changes, the event logs, the baselines and git.
// Nothing here is stored: it is all rebuilt from the repository.

const path = require("path");
const evolve = require("./evolve.cjs");
const baseline = require("./baseline.cjs");
const { git } = require("./git.cjs");

const fail = (code, message) => Object.assign(new Error(message), { code });

// Commits that introduced or removed the record's heading, newest first (git only; [] without it).
function commitsOf(model, rec) {
  const file = path.relative(model.repo, path.join(model.root, rec.file)).split(path.sep).join("/");
  const out = git(model.repo, ["log", "--format=%h%x09%an%x09%aI%x09%s", `-S${rec.id} ·`, "--", file]);
  if (!out) return [];
  return out.split("\n").filter(Boolean).slice(0, 20).map((l) => {
    const [commit, by, when, subject] = l.split("\t");
    return { commit, by, when, subject };
  });
}

function historyOf(model, id) {
  const rec = model.records.get(id);
  if (!rec) throw fail("UNKNOWN_ID", `${id} is not a record in this project`);
  const commits = commitsOf(model, rec);
  const created = commits.length ? commits[commits.length - 1] : null;
  const versions = [{ version: 1, event: "created", change: null, by: created ? created.by : null, when: created ? created.when : null, git: created ? created.commit : null, wording: null }];
  const deltas = (evolve.allDeltas(model).get(id) || []).slice().sort((a, b) => a.to - b.to || a.change.localeCompare(b.change));
  let first = true;
  for (const d of deltas) {
    const change = model.changes.get(d.change);
    const events = change.events || [];
    const opened = events.find((e) => e.event === "change.opened");
    const approved = [...events].reverse().find((e) => e.event === "change.approved");
    const reached = events.find((e) => e.event === "change.advanced" && /→ approved\b/.test(e.note || ""));
    const counted = evolve.applied(model, change);
    versions.push({
      version: d.to,
      event: counted ? "delta applied" : model.reverted.has(change.id) ? "delta reverted" : "delta proposed",
      change: change.id,
      change_status: change.status,
      by: (approved && approved.by) || (opened && opened.by) || null,
      when: (reached && reached.when) || (opened && opened.when) || null,
      git: (reached && reached.git) || (opened && opened.git) || null,
      before: d.before,
      after: d.after,
      why: d.why,
      breaking: d.breaking,
      counted,
    });
    first = false;
  }
  if (first) versions[0].wording = evolve.wording(rec);
  const log = model.approvals ? model.approvals.events.filter((e) => e.target === id) : [];
  const events = [
    ...log.map((e) => ({ id: e.id || null, when: e.when, event: e.event, by: e.by, note: e.note || "", log: "project" })),
    ...deltas.flatMap((d) => (model.changes.get(d.change).events || []).filter((e) => ["change.opened", "change.approved"].includes(e.event) || (e.event === "change.advanced" && /→ (approved|closed)\b/.test(e.note || ""))).map((e) => ({ id: e.id || null, when: e.when, event: e.event, by: e.by, note: e.note || "", log: d.change }))),
  ].sort((a, b) => Date.parse(a.when) - Date.parse(b.when));
  const seen = [];
  for (const rel of baseline.listBaselines(model)) {
    const b = baseline.readBaseline(model, rel);
    const r = b.records.find((x) => x.id === id);
    if (!r) { seen.push({ release: rel, present: false }); continue; }
    const prev = [...seen].reverse().find((x) => x.present);
    seen.push({ release: rel, present: true, version: r.version || 1, hash: r.hash, changed: Boolean(prev && prev.hash !== r.hash) });
  }
  return { id, kind: rec.kind, title: rec.title, version: evolve.versionOf(model, id), versions, baselines: seen, events, commits };
}

module.exports = { historyOf };
