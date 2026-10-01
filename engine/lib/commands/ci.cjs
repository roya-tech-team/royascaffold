"use strict";

// `ci [--json]` (plan file 01 §7, E4.1): what a pull request must pass. It runs validate, the freshness of
// the evidence and the dependency rules, and the command exits non-zero when a gate has errors. Studio uses
// the same command. Stale evidence of a change that claims to be done (verified, reconciled or closed) is an
// error; of a change still in progress it is only a warning.

const { buildModel } = require("../model/graph.cjs");
const { deriveStatus } = require("../derive/status.cjs");

const CLAIMS_DONE = ["verified", "reconciled", "closed"];

function ciCommand(start) {
  const model = buildModel(start);
  const status = deriveStatus(model);
  const checks = [];

  // 1. The project validates: no error among the issues (warnings are shown, never fatal).
  const errors = model.issues.filter((i) => i.severity === "error");
  const warnings = model.issues.filter((i) => i.severity === "warning");
  checks.push({
    id: "validate",
    ok: errors.length === 0,
    message: errors.length ? `${errors.length} validation error(s), ${warnings.length} warning(s)` : `the project validates (${warnings.length} warning(s))`,
    items: errors.map((e) => `${e.message}${e.where ? ` (${e.where})` : ""}`),
  });

  // 2. Freshness: evidence stays true while the code changes.
  const stale = require("../fingerprint.cjs").outstandingStale(model, status.stale).sort();
  const fatal = [];
  const soft = [];
  for (const id of stale) {
    const e = model.evidence.get(id);
    const change = e && model.changes.get(e.change);
    const text = `${id} of ${e ? e.change : "?"} is stale: the code or tests it covered changed; run royascaff verify ${e ? e.change : "<CHG>"}`;
    (change && CLAIMS_DONE.includes(change.status) ? fatal : soft).push(text);
  }
  checks.push({
    id: "freshness",
    ok: fatal.length === 0,
    message: fatal.length ? `${fatal.length} piece(s) of evidence a done change rests on went stale` : stale.length ? `evidence of changes still in progress is stale (${stale.length}), which is fine until they are verified` : "all evidence is fresh",
    items: [...fatal, ...soft],
  });

  // 3. The dependency rules written as paths hold in the code.
  const rules = require("../rulecheck.cjs").ruleResult(model);
  checks.push(rules
    ? { id: "rules", ok: rules.pass, message: rules.pass ? "the dependency rules hold" : "the code breaks a dependency rule", items: rules.pass ? [] : rules.tail.split("\n").filter(Boolean) }
    : { id: "rules", ok: true, message: "no path rules to check (or the adapters declare no import patterns)", items: [] });

  return { ok: checks.every((c) => c.ok), checks, errors: errors.length + fatal.length + (rules && !rules.pass ? 1 : 0), counts: { errors: errors.length, warnings: warnings.length, stale: stale.length } };
}

module.exports = { ciCommand };
