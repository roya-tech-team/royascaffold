"use strict";

// Beta.4 · WP-D7 (plan file 17 §3.6): business at both ends of the flow.
//   delivered demands  a demand (SRC-) is delivered when everything in its Covered by is ✅ Done
//   outcomes           an outcome (OUT-) is delivered when all its features are Done; a person then
//                      measures it (`royascaff measure OUT-… --result met|not-met --note "…"`)

const DONE = new Set(["done", "released"]);

function itemDone(model, status, id) {
  if (status.requirements.has(id)) return DONE.has(status.requirements.get(id).state);
  if (status.features.has(id)) return DONE.has(status.features.get(id).state);
  if (status.slices.has(id)) return status.slices.get(id).state === "done";
  return false;
}

// { covered, delivered: [...], undelivered: [...] } over the coverage sources.
function deliveryOf(model, status) {
  const cov = model.approvals ? model.approvals.coverage : null;
  if (!cov) return null;
  const covered = cov.sources.filter((s) => s.covered.length);
  const delivered = covered.filter((s) => s.covered.every((id) => itemDone(model, status, id)));
  return { covered: covered.length, delivered, undelivered: covered.filter((s) => !delivered.includes(s)) };
}

// Each outcome: its features, whether they are all done, and the person's last measurement.
function outcomesOf(model, status) {
  const events = model.approvals ? model.approvals.events : [];
  return [...model.records.values()].filter((r) => r.kind === "outcome").map((o) => {
    const features = [...model.features.values()].filter((f) => model.records.get(f.id).relations.some((x) => x.type === "outcome" && x.to === o.id)).map((f) => f.id);
    const done = features.filter((f) => DONE.has(status.features.get(f).state));
    const m = [...events].reverse().find((e) => e.event === "outcome.measured" && e.target === o.id);
    const result = m ? (/^met\b/i.test(m.note || "") ? "met" : "not met") : null;
    const state = result || (features.length && done.length === features.length ? "delivered" : "open");
    return { id: o.id, title: o.title, measuredBy: String(o.body || "").match(/Measured by:\s*([^\n]+)/i)?.[1]?.trim() || null, features, done, state, measurement: m || null };
  });
}

// The discovery topics a design must respect (Constraints; Look, feel and references) and the
// visual bar, as short lines for the Design stage (`next --json` → brief).
function designBrief(model) {
  const fs = require("fs");
  const path = require("path");
  const K = require("./knowledge.cjs");
  const { sections, onlyTemplate } = require("./approvals.cjs");
  const doc = K.docsOf(model).find((d) => d.kind === "discovery");
  const abs = path.join(model.root, doc.file);
  if (!fs.existsSync(abs)) return [];
  const secs = sections(fs.readFileSync(abs, "utf8"));
  const out = [];
  for (const name of doc.pack || []) {
    const s = secs.find((x) => x.title.toLowerCase().startsWith(name.toLowerCase()));
    if (!s || onlyTemplate(s.lines)) continue;
    const text = s.lines.join("\n").split(/\*\*Visual bar:?\*\*/i)[0].replace(/\s+/g, " ").trim();
    if (text) out.push(`${s.title}: ${text}`);
  }
  const bar = model.approvals ? model.approvals.discovery.visualBar : [];
  if (bar.length) out.push(`Visual bar: ${bar.map((l, i) => `${i + 1}. ${l}`).join(" ")}`);
  return out;
}

module.exports = { deliveryOf, outcomesOf, itemDone, designBrief };
