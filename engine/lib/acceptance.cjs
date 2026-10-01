"use strict";

// Acceptance lines with a check type (plan file 01 §4, E1.1). A requirement lists how it is proven:
//
//   **Acceptance**
//   - [e2e] Saving with an empty title shows "Title is required" and saves nothing.
//   - [metric] `list_ms <= 200` with 500 books.
//   - [manual] The list reads well on a 375 px phone.
//
// The type says who or what proves the line: `unit` and `e2e` are run by a machine, `metric` is a
// measured number, `manual` is a person, `inspection` is read and judged (a person or the judge).

const TYPES = ["unit", "e2e", "metric", "manual", "inspection"];
const MACHINE_TYPES = ["unit", "e2e", "metric"];

const HEAD = /^\s*(?:#{2,6}\s+Acceptance(?:\s+criteria)?|\*\*Acceptance(?:\s+criteria)?:?\*\*:?)\s*$/i;
const BULLET = /^\s*(?:[-*]|\d+[.)])\s+(.*\S)\s*$/;
const TYPED = /^\[([A-Za-z][\w-]*)\]\s*(.*)$/;

// The acceptance lines of a requirement or NFR record: [{ key, n, type, text }]. `type` is null when the
// line has none, or the word the author wrote when it is not a known type (see `known`).
function acceptanceOf(rec) {
  const lines = String((rec && rec.body) || "").split("\n");
  const at = lines.findIndex((l) => HEAD.test(l));
  if (at < 0) return [];
  const out = [];
  for (let i = at + 1; i < lines.length; i += 1) {
    const l = lines[i];
    if (/^\s*#{1,6}\s/.test(l) || /^\s*\*\*[^*]+:?\*\*:?\s*$/.test(l)) break;
    const m = l.match(BULLET);
    if (m && /^_.*_$/.test(m[1])) continue; // a template hint, not a criterion
    if (m) {
      const t = m[1].match(TYPED);
      const n = out.length + 1;
      out.push({ key: `${rec.id}#${n}`, n, type: t ? t[1].toLowerCase() : null, text: (t ? t[2] : m[1]).trim() });
    } else if (l.trim() && out.length && !/^\s{2,}\S/.test(l)) break; // a paragraph ends the list
  }
  return out;
}

const known = (type) => TYPES.includes(type);

// Every judgeable line of a requirement. A requirement without acceptance lines has one line of its
// own (its title), so it can still be judged: key `<ID>#1`, type null.
function judgeLines(rec) {
  const lines = acceptanceOf(rec);
  return lines.length ? lines : [{ key: `${rec.id}#1`, n: 1, type: null, text: rec.title, implicit: true }];
}

// Warnings for validate: a must requirement or NFR whose acceptance lines have no known type.
function untypedIssues(model, issue) {
  for (const rec of model.records.values()) {
    if (rec.origin !== "record" || !["requirement", "nfr"].includes(rec.kind)) continue;
    const must = String(rec.fields.Priority || "").trim().toLowerCase() === "must";
    for (const line of acceptanceOf(rec)) {
      const at = `${rec.file}:${rec.line}`;
      if (line.type && !known(line.type)) issue("warning", "unknown-check-type", `${line.key} has the check type [${line.type}]: use one of ${TYPES.join(", ")}`, at);
      else if (!line.type && must) issue("warning", "untyped-acceptance", `${line.key} (must) has no check type: start the line with [${TYPES.join("|")}] so it says how it is proven`, at);
    }
  }
}

// The requirements and NFRs a change is about: what its slices deliver, and what a fix affects.
function scopeOf(model, change) {
  const ids = new Set([...change.slices.flatMap((s) => (model.slices.get(s) ? model.slices.get(s).delivers : [])), ...change.affects]);
  return [...ids].map((id) => model.records.get(id)).filter((r) => r && ["requirement", "nfr"].includes(r.kind));
}

const METRIC = /`\s*([a-z][\w.-]*)\s*(>=|≥|<=|≤|==|=|<|>)\s*(-?\d+(?:\.\d+)?)\s*`/i;
const compare = (v, op, want) => ({ ">=": v >= want, "≥": v >= want, "<=": v <= want, "≤": v <= want, "==": v === want, "=": v === want, "<": v < want, ">": v > want })[op];

// What a run proved for each typed acceptance line of the change's requirements:
//   pass / fail      a machine check of that type ran (a metric was measured)
//   pending          nothing could prove it by machine: a person, the judge, or a missing check
// `results` are the runner's results (kind, pass, metrics).
function evaluateLines(model, change, results) {
  const of = (...kinds) => results.filter((r) => kinds.includes(String(r.kind).toLowerCase()));
  const metrics = Object.assign({}, ...results.map((r) => r.metrics || {}));
  const out = [];
  for (const rec of scopeOf(model, change)) {
    for (const line of acceptanceOf(rec)) {
      const base = { key: line.key, req: rec.id, type: line.type, text: line.text };
      let result = "pending";
      let why = "";
      if (line.type === "unit" || line.type === "e2e") {
        const ran = line.type === "unit" ? of("test", "unit") : of("smoke", "e2e");
        if (!ran.length) why = `no ${line.type} check ran: declare one in the app (Test or Smoke) or in the adapter's checks`;
        else result = ran.every((r) => r.pass) ? "pass" : "fail";
      } else if (line.type === "metric") {
        const m = line.text.match(METRIC);
        if (!m) why = "no measurable `name <= number` expression in the line";
        else if (!(m[1] in metrics)) why = `no check reported ${m[1]} (print ROYASCAFF_METRIC ${m[1]}=<number>)`;
        else result = compare(metrics[m[1]], m[2], Number(m[3])) ? "pass" : "fail";
      } else why = line.type === "manual" ? "a person checks this line" : line.type === "inspection" ? "read and judged by a person or the judge" : "no check type";
      out.push({ ...base, result, ...(why ? { why } : {}) });
    }
  }
  return out;
}

module.exports = { TYPES, MACHINE_TYPES, acceptanceOf, judgeLines, untypedIssues, known, scopeOf, evaluateLines };
