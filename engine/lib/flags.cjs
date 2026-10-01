"use strict";

// Feature flags, experiments and deprecation (plan file 02 §4, E5, E6, E9).
//
//   FLAG-  Hides: CAP-…/REQ-…   State: on|off   Owner   Remove by: <date or REL-…>
//   EXP-   Hypothesis, Variants ("A: … ; B: …"), Metric (`name >= number`), Outcome: OUT-…, Decision: keep A | keep B | stop
//   a deprecated requirement or component: Status: deprecated, Removal slice: SLC-…
//
// A requirement behind an `off` flag is not delivered for outcomes. An old flag is a debt: it is listed once its
// removal date has passed, or once the release it names exists.

const METRIC = /`\s*[a-z][\w.-]*\s*(>=|≥|<=|≤|==|=|<|>)\s*-?\d+(?:\.\d+)?\s*`/i;

// Today as YYYY-MM-DD. ROYASCAFF_TODAY makes it fixed (tests, reproducible reports).
const today = () => (process.env.ROYASCAFF_TODAY && /^\d{4}-\d\d-\d\d$/.test(process.env.ROYASCAFF_TODAY) ? process.env.ROYASCAFF_TODAY : new Date().toISOString().slice(0, 10));

const ids = (value) => String(value || "").match(/[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+/g) || [];

// Every flag with its state and whether it is past its removal date. `now` is a YYYY-MM-DD date.
function flagsOf(model, now = today()) {
  const out = [];
  for (const rec of model.records.values()) {
    if (rec.kind !== "flag") continue;
    const removeBy = String(rec.fields["Remove by"] || "").replace(/`/g, "").trim();
    const date = (removeBy.match(/\d{4}-\d\d-\d\d/) || [null])[0];
    const rel = ids(removeBy).find((x) => /^REL-/.test(x)) || null;
    let overdue = false;
    let why = null;
    if (date && date < now) { overdue = true; why = `removal date ${date} has passed`; }
    else if (rel && model.records.has(rel)) { overdue = true; why = `${rel} has shipped`; }
    out.push({
      id: rec.id,
      title: rec.title,
      owner: String(rec.fields.Owner || "").trim() || null,
      hides: rec.relations.filter((r) => r.type === "hides").map((r) => r.to),
      state: /^on\b/i.test(String(rec.fields.State || "off").trim()) ? "on" : "off",
      remove_by: removeBy || null,
      overdue,
      why,
    });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

// id -> [FLAG-…] for the flags that are off and hide that record.
function hiddenMap(model) {
  const map = new Map();
  for (const f of flagsOf(model)) {
    if (f.state !== "off") continue;
    for (const h of f.hides) {
      if (!map.has(h)) map.set(h, []);
      map.get(h).push(f.id);
    }
  }
  return map;
}

// The off flags that hide a record, directly or through its feature.
function flaggedOff(model, hidden, id) {
  const rec = model.records.get(id);
  const out = new Set(hidden.get(id) || []);
  if (rec) for (const r of rec.relations) if (["feature", "satisfies"].includes(r.type)) for (const f of hidden.get(r.to) || []) out.add(f);
  return [...out].sort();
}

function experimentsOf(model) {
  const out = [];
  for (const rec of model.records.values()) {
    if (rec.kind !== "experiment") continue;
    const variants = String(rec.fields.Variants || "").split(";").map((v) => v.trim()).filter(Boolean).map((v) => {
      const m = v.match(/^([A-Za-z0-9]+)\s*[:=]\s*(.*)$/);
      return m ? { name: m[1], what: m[2].trim() } : { name: v, what: "" };
    });
    const decision = String(rec.fields.Decision || "").replace(/`/g, "").trim();
    out.push({
      id: rec.id,
      title: rec.title,
      feature: (rec.relations.find((r) => r.type === "feature") || {}).to || null,
      outcome: (rec.relations.find((r) => r.type === "outcome") || {}).to || null,
      hypothesis: String(rec.fields.Hypothesis || "").trim() || null,
      variants,
      metric: (String(rec.fields.Metric || "").match(METRIC) || [null])[0],
      decision: decision || null,
    });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

// Deprecated records: Status: deprecated (or a Removal slice), with the slice that removes them.
function deprecatedOf(model) {
  const out = [];
  for (const rec of model.records.values()) {
    const slice = (rec.relations.find((r) => r.type === "removal_slice") || {}).to || null;
    const flagged = /^deprecated\b/i.test(String(rec.fields.Status || "").trim());
    if (!flagged && !slice) continue;
    out.push({ id: rec.id, kind: rec.kind, title: rec.title, removal_slice: slice, since: (String(rec.fields.Deprecated || "").match(/\d{4}-\d\d-\d\d/) || [null])[0] });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

// Code globs of components scheduled for removal: a component that is deprecated, or realizes only deprecated requirements.
function removalCode(model) {
  const dep = new Map(deprecatedOf(model).map((d) => [d.id, d]));
  const out = new Map();
  for (const rec of model.records.values()) {
    if (rec.kind !== "component" || !rec.fields.Code) continue;
    const realized = rec.relations.filter((r) => ["realizes", "realized_by"].includes(r.type)).map((r) => r.to);
    const own = dep.get(rec.id);
    const viaReqs = realized.length > 0 && realized.every((r) => dep.has(r));
    if (own || viaReqs) out.set(rec.id, { id: rec.id, code: String(rec.fields.Code).trim(), slice: own ? own.removal_slice : [...new Set(realized.map((r) => dep.get(r).removal_slice).filter(Boolean))].join(", ") || null });
  }
  return out;
}

// Validation issues for flags, experiments and deprecated records (called by the model).
function issues(model, issue) {
  const at = (rec) => `${rec.file}:${rec.line}`;
  const now = today();
  for (const f of flagsOf(model, now)) {
    const rec = model.records.get(f.id);
    if (!f.remove_by) issue("warning", "flag-without-removal", `${f.id} has no Remove by (a date, or the release that should remove it): a flag is a debt`, at(rec));
    else if (f.overdue) issue("warning", "flag-overdue", `${f.id} · ${f.title} is past its removal (${f.why}): remove the flag and the code behind it`, at(rec));
    if (!f.hides.length) issue("warning", "flag-without-hides", `${f.id} hides nothing (add - **Hides:** CAP-… or REQ-…)`, at(rec));
  }
  for (const e of experimentsOf(model)) {
    const rec = model.records.get(e.id);
    if (!e.metric) issue("warning", "experiment-metric", `${e.id} needs a Metric in the form of an NFR measure, for example \`signup_rate >= 0.05\``, at(rec));
    if (e.decision && !/^(stop|keep\s+\S+)$/i.test(e.decision)) issue("error", "experiment-decision", `${e.id} has Decision "${e.decision}" (use keep <variant> or stop)`, at(rec));
    else if (e.decision && /^keep\s/i.test(e.decision) && e.variants.length && !e.variants.some((v) => v.name.toLowerCase() === e.decision.split(/\s+/)[1].toLowerCase())) issue("error", "experiment-decision", `${e.id} keeps "${e.decision.split(/\s+/)[1]}", which is not one of its variants (${e.variants.map((v) => v.name).join(", ")})`, at(rec));
  }
  for (const d of deprecatedOf(model)) {
    const rec = model.records.get(d.id);
    if (!d.removal_slice) issue("warning", "deprecated-without-slice", `${d.id} is deprecated but names no removal slice (add - **Removal slice:** SLC-…): nothing removes it`, at(rec));
    else if (model.records.has(d.removal_slice) && !model.slices.has(d.removal_slice)) issue("error", "removal-slice-unknown", `${d.id} names ${d.removal_slice} as its removal slice, which is not a slice on the roadmap`, at(rec));
  }
}

module.exports = { METRIC, today, flagsOf, hiddenMap, flaggedOff, experimentsOf, deprecatedOf, removalCode, issues };
