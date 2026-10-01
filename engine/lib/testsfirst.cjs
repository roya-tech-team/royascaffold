"use strict";

// Step 12c (plan file 14), WP-C4 · P5: tests first for must requirements and NFRs (H4), and tests
// that run the code instead of reading it. Deterministic: IDs, events, exit codes and file text.

const fs = require("fs");
const path = require("path");

const priority = (rec) => String((rec && rec.fields.Priority) || "").trim().toLowerCase();

// Must requirements and NFRs the change delivers (through its slices).
function mustTargets(model, change) {
  const ids = new Set(change.slices.flatMap((s) => (model.slices.get(s) ? model.slices.get(s).delivers : [])));
  return [...ids].filter((id) => ["requirement", "nfr"].includes(model.records.get(id)?.kind) && priority(model.records.get(id)) === "must");
}

// TEST- records with Check: runner:test that verify the requirement.
function runnerTestsFor(model, reqId) {
  const rec = model.records.get(reqId);
  const ids = new Set(rec ? rec.relations.filter((x) => x.type === "verified_by").map((x) => x.to) : []);
  for (const x of model.incoming.get(reqId) || []) if (x.type === "verifies") ids.add(x.from);
  return [...ids].filter((id) => model.records.get(id)?.kind === "test" && /^runner:test\b/i.test(String(model.records.get(id).fields.Check || "").trim()));
}

function missingTests(model, change) {
  return mustTargets(model, change).filter((id) => !runnerTestsFor(model, id).length);
}

// Tests-first applies to feature changes of 1.4 projects that deliver a must requirement and whose
// apps declare a Test command.
function applies(model, change) {
  if (!model.is14 || change.kind !== "feature" || !mustTargets(model, change).length) return false;
  const runner = require("./runner.cjs");
  return runner.appsForChange(model, change).some((a) => a.commands.Test);
}

// Why a test file's text reads application source instead of running it, or null. The patterns come
// from the adapters' manifests (`tests.readsSource`): a plain `pattern`, or a `call` whose argument
// matches one of `args`.
function readsSource(text, rules = []) {
  for (const r of rules) {
    if (r.pattern && new RegExp(r.pattern).test(text)) return r.why;
    if (r.call) {
      for (const m of text.matchAll(new RegExp(r.call, "g"))) {
        if ((r.args || []).some((a) => new RegExp(a).test(m[2] || ""))) return r.why.replace("$1", m[1]);
      }
    }
  }
  return null;
}

// Test files (the manifests' `tests.files` patterns) in the apps a change touches that read source.
function sourceReaders(model, apps) {
  const tests = require("./adapters.cjs").policy(model).tests;
  if (!tests) return [];
  const { walk, SKIP } = require("./content.cjs");
  const fileRes = tests.files.map((x) => new RegExp(x));
  const out = [];
  for (const app of apps) {
    const base = path.join(model.repo, app.path || ".");
    const files = [];
    walk(base, "", files, SKIP);
    for (const f of files.filter((x) => fileRes.some((re) => re.test(x)))) {
      let text = "";
      try {
        text = fs.readFileSync(path.join(base, f), "utf8");
      } catch {
        continue;
      }
      const why = readsSource(text, tests.readsSource || []);
      if (why) out.push({ file: path.posix.join(app.path || ".", f), why });
    }
  }
  return out;
}

// Index of the event where the change became ready (or started), -1 when unknown.
function readyAt(events) {
  let at = -1;
  events.forEach((e, i) => {
    if (e.event === "change.advanced" && /→ (ready|in-progress)\b/.test(e.note || "") && at < 0) at = i;
  });
  return at;
}

const recordedAfterTheFact = (events) => events.some((e) => e.event === "change.advanced" && /recorded after the fact/.test(e.note || ""));

module.exports = { mustTargets, runnerTestsFor, missingTests, applies, readsSource, sourceReaders, readyAt, recordedAfterTheFact };
