"use strict";

// Derived status (plan file 09 §3.5). Nobody types these values: they are computed from
// change status, task events, slice links and evidence.

const { taskStateFrom } = require("../events.cjs");

const LABELS = {
  idea: "💡 Idea",
  outlined: "📝 Outlined",
  planned: "🗺 Planned",
  designing: "✏️ Designing",
  building: "🔨 Building",
  checking: "🧪 Checking",
  done: "✅ Done",
  released: "🚀 Released",
  "partly-done": "⚠️ Partly done",
  blocked: "⛔ Blocked",
};

const STAGE_OF_STATUS = {
  draft: "understand",
  analyzed: "design",
  approved: "plan",
  ready: "build",
  "in-progress": "build",
  verified: "check",
  reconciled: "check",
  closed: "closed",
  blocked: "blocked",
  failed: "blocked",
  cancelled: "cancelled",
};

const STAGE_LABELS = {
  understand: "1 Understand",
  design: "2 Design",
  plan: "3 Plan",
  build: "4 Build",
  check: "5 Check & Record",
  closed: "Closed",
  blocked: "Blocked",
  cancelled: "Cancelled",
};

const DEPTHS = { idea: "Idea", outlined: "Outlined", sliced: "Sliced", designed: "Designed" };

const REQUIREMENT_KINDS = ["requirement", "nfr", "use-case"];

function deriveStatus(model) {
  const tasks = new Map();
  const changes = new Map();
  const slices = new Map();
  const requirements = new Map();
  const features = new Map();

  // Changes and their tasks.
  for (const change of model.changes.values()) {
    const events = change.events || [];
    let taskDone = 0;
    let taskBlocked = false;
    for (const tid of change.tasks) {
      const t = taskStateFrom(events, tid);
      tasks.set(tid, { id: tid, change: change.id, state: t.state, last: t.last });
      if (t.state === "done") taskDone += 1;
      if (t.state === "blocked") taskBlocked = true;
    }
    const lastBlockEvent = [...events].reverse().find((e) => e.target === change.id && (e.event === "change.blocked" || e.event === "change.unblocked"));
    const stage = STAGE_OF_STATUS[change.status] || "understand";
    const blocked = stage === "blocked" || taskBlocked || (lastBlockEvent && lastBlockEvent.event === "change.blocked");
    const released = (model.incoming.get(change.id) || []).some((x) => model.records.get(x.from)?.kind === "release");
    changes.set(change.id, { id: change.id, stage, stageLabel: STAGE_LABELS[stage], blocked: Boolean(blocked), tasksDone: taskDone, tasksTotal: change.tasks.length, released, last: events[events.length - 1] || null });
  }

  // Slices follow their change.
  for (const slice of model.slices.values()) {
    const c = slice.change ? changes.get(slice.change) : null;
    let state = "planned";
    if (c) {
      if (c.blocked) state = "blocked";
      else if (c.stage === "closed") state = "done";
      else if (c.stage === "check") state = "checking";
      else if (c.stage === "build") state = "building";
      else if (["understand", "design", "plan"].includes(c.stage)) state = "designing";
    }
    slices.set(slice.id, { id: slice.id, feature: slice.feature, state, change: slice.change || null, needsRefinement: null });
  }

  // Requirements: planned through slices, proven by passing evidence.
  const verifiersOf = (reqId) => {
    const rec = model.records.get(reqId);
    const out = new Set(rec.relations.filter((x) => x.type === "verified_by").map((x) => x.to));
    for (const x of model.incoming.get(reqId) || []) if (x.type === "verifies") out.add(x.from);
    return out;
  };
  const proofOf = (reqId) => {
    // D6: an NFR whose Measure is a metric expression is proven by the latest evidence that reports
    // that metric, when the value satisfies it — and by nothing else.
    const m = measureOf(model.records.get(reqId));
    if (m) return m.ok ? [m.evidence] : [];
    const targets = new Set([reqId, ...verifiersOf(reqId)]);
    return [...model.evidence.values()].filter((e) => e.result === "pass" && e.proves.some((p) => targets.has(p))).map((e) => e.id);
  };
  const measures = new Map();
  function measureOf(rec) {
    if (!rec || rec.kind !== "nfr") return null;
    if (measures.has(rec.id)) return measures.get(rec.id);
    const line = `${rec.fields.Measure || ""}\n${rec.body || ""}`;
    const x = line.match(/`\s*([a-z][\w.-]*\.[\w.-]+)\s*(>=|≥|<=|≤|==|=|<|>)\s*(-?\d+(?:\.\d+)?)\s*`/i);
    let result = null;
    if (x) {
      const [, name, op, raw] = x;
      const want = Number(raw);
      const latest = [...model.evidence.values()].filter((e) => e.metrics && name in e.metrics).sort((a, b) => Number((b.id.match(/(\d+)$/) || [0, 0])[1]) - Number((a.id.match(/(\d+)$/) || [0, 0])[1]))[0];
      const v = latest ? latest.metrics[name] : null;
      const ok = latest ? ({ ">=": v >= want, "≥": v >= want, "<=": v <= want, "≤": v <= want, "==": v === want, "=": v === want, "<": v < want, ">": v > want })[op] : false;
      result = { expr: `${name} ${op} ${raw}`, name, value: v, evidence: latest ? latest.id : null, ok: Boolean(ok) };
    }
    measures.set(rec.id, result);
    return result;
  }
  // A requirement in a draft document is still an idea (document_status in front matter).
  const draftFiles = new Set(model.documents.filter((d) => d.status === "draft").map((d) => d.file));

  // Baseline (A1): a closed knowledge/migration change (adoption, migration) that names what it
  // documents with `affects:` makes existing behavior Done when passing evidence proves it.
  const baselineFor = (rec) => {
    const feature = (rec.relations.find((x) => x.type === "feature" || x.type === "satisfies") || {}).to;
    return [...model.changes.values()].filter((c) => ["knowledge", "migration"].includes(c.kind) && c.status === "closed" && (c.affects.includes(rec.id) || (feature && c.affects.includes(feature))));
  };

  for (const rec of model.records.values()) {
    if (!REQUIREMENT_KINDS.includes(rec.kind)) continue;
    const delivering = [...model.slices.values()].filter((s) => s.delivers.includes(rec.id)).map((s) => slices.get(s.id));
    const proof = proofOf(rec.id);
    const baseline = delivering.length ? [] : baselineFor(rec);
    let state;
    if (draftFiles.has(rec.file)) state = "idea";
    else if (baseline.length) state = proof.length ? "done" : "checking";
    else if (!delivering.length && rec.kind === "nfr" && proof.length) state = "done"; // R6: an NFR is proven by evidence, with or without a slice
    else if (!delivering.length) state = "outlined";
    else {
      const perSlice = delivering.map((s) => (s.state === "done" && !proof.length ? "checking" : s.state));
      if (perSlice.every((s) => s === "done")) {
        const releasedAll = delivering.every((s) => s.change && changes.get(s.change).released);
        state = releasedAll ? "released" : "done";
      } else if (perSlice.includes("blocked")) state = "blocked";
      else if (perSlice.includes("checking")) state = "checking";
      else if (perSlice.includes("building")) state = "building";
      else if (perSlice.includes("designing")) state = "designing";
      else if (perSlice.includes("done")) state = "partly-done";
      else state = "planned";
    }
    requirements.set(rec.id, { id: rec.id, state, measure: measureOf(rec), slices: delivering.map((s) => s.id), baseline: baseline.map((c) => c.id), evidence: proof, missingEvidence: (delivering.some((s) => s.state === "done") || baseline.length > 0) && !proof.length });
  }

  // Open bug/polish changes that affect a requirement or feature (they never make it Done).
  const openFixes = new Map();
  for (const change of model.changes.values()) {
    if (!["bug", "polish"].includes(change.kind)) continue;
    const stage = changes.get(change.id).stage;
    if (stage === "closed" || stage === "cancelled") continue;
    for (const target of change.affects) {
      if (!openFixes.has(target)) openFixes.set(target, []);
      openFixes.get(target).push(change.id);
    }
  }
  for (const r of requirements.values()) r.openFixes = openFixes.get(r.id) || [];

  // Features roll up their slices and requirements.
  for (const feature of model.features.values()) {
    const sl = feature.slices.map((id) => slices.get(id));
    const reqIds = new Set((model.incoming.get(feature.id) || []).filter((x) => (x.type === "feature" || x.type === "satisfies") && REQUIREMENT_KINDS.includes(model.records.get(x.from)?.kind)).map((x) => x.from));
    for (const s of feature.slices) for (const r of model.slices.get(s).delivers) if (requirements.has(r)) reqIds.add(r);
    const rq = [...reqIds].map((id) => requirements.get(id));
    // R6: when every slice is done, an unproven NFR of the feature is waiting for its proof.
    const unprovenNfrs = sl.length && sl.every((s) => s.state === "done" || s.state === "released") ? rq.filter((r) => model.records.get(r.id).kind === "nfr" && !r.slices.length && r.state === "outlined") : [];
    for (const r of unprovenNfrs) { r.state = "checking"; r.missingEvidence = true; }
    // A done slice whose change is in a release counts as released for the feature (C4).
    const all = [...sl.map((s) => (s.state === "done" && s.change && changes.get(s.change).released ? "released" : s.state)), ...rq.map((r) => r.state)];
    let state;
    if (!sl.length && !rq.length) state = "idea";
    else if (sl.some((s) => s.state === "blocked")) state = "blocked";
    else if (all.every((s) => s === "done" || s === "released")) state = all.every((s) => s === "released") ? "released" : "done";
    else if (unprovenNfrs.length && rq.every((r) => r.state === "done" || r.state === "released" || unprovenNfrs.includes(r))) state = "checking";
    else if (all.some((s) => s === "done" || s === "released" || s === "partly-done")) state = "partly-done";
    else if (all.some((s) => s === "building" || s === "checking")) state = "building";
    else if (all.some((s) => s === "designing")) state = "designing";
    else if (sl.length) state = "planned";
    else state = "outlined";
    const depth = sl.some((s) => s.change) ? "designed" : sl.length ? "sliced" : rq.length ? "outlined" : "idea";
    features.set(feature.id, {
      id: feature.id,
      state,
      depth,
      horizon: feature.horizon,
      slicesDone: sl.filter((s) => s.state === "done").length,
      slicesTotal: sl.length,
      requirementsDone: rq.filter((r) => r.state === "done" || r.state === "released").length,
      requirementsTotal: rq.length,
      requirements: [...reqIds],
      openFixes: [...new Set([...(openFixes.get(feature.id) || []), ...rq.flatMap((r) => r.openFixes)])],
      unprovenNfrs: unprovenNfrs.map((r) => r.id),
    });
  }

  // Plan approvals (1.4 projects, P1): a feature is 🗺 Planned only after a person approved its
  // current plan; before that (or after an edit) it and its planned requirements are 📝 Outlined.
  if (model.approvals) {
    for (const f of features.values()) {
      const ap = model.approvals.features.get(f.id) || { state: "none" };
      f.approval = ap.state;
      if (ap.state === "approved") continue;
      if (f.state === "planned") f.state = "outlined";
      for (const r of f.requirements) if (requirements.get(r).state === "planned") requirements.get(r).state = "outlined";
    }
    for (const s of slices.values()) s.approval = (features.get(s.feature) || {}).approval || "none";
  }

  return { tasks, changes, slices, requirements, features };
}

module.exports = { deriveStatus, LABELS, STAGE_LABELS, STAGE_OF_STATUS, DEPTHS };
