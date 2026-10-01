"use strict";

// Beta.4 · WP-D3 (plan file 17 §3.3): the design reaches the implementer. Every Context Pack gets,
// from the knowledge registry and the change's Impact:
//   1. the architecture page's main parts and dependency rules (always)
//   2. the project's rules (RULE-) that apply to the task: project-wide, or naming its feature,
//      its components or a path inside its allowed paths
//   3. domain invariants, workflows and concepts linked to the task's requirements, feature or inputs
//   4. the pages of the layers the Impact marks changed or referenced (the registry's sections),
//      and the records the Impact names
//   5. the visual bar, when the adapters ask for one
// Each part has a priority; when the pack is over budget the lowest parts are dropped and the pack
// says what was dropped.

const fs = require("fs");
const path = require("path");
const { sections: sectionsOf, onlyTemplate } = require("./approvals.cjs");
const { findIds } = require("./parse/ids.cjs");
const { patternList } = require("./glob.cjs");

const DOMAIN_KINDS = new Set(["invariant", "workflow", "concept"]);

function pageSections(model, doc) {
  const abs = path.join(model.root, doc.file);
  if (!doc.pack || !doc.pack.length || !fs.existsSync(abs)) return "";
  const secs = sectionsOf(fs.readFileSync(abs, "utf8"));
  const out = [];
  for (const name of doc.pack) {
    const s = secs.find((x) => x.title.toLowerCase().startsWith(name.toLowerCase()));
    if (s && !onlyTemplate(s.lines)) out.push(`### ${s.title}\n\n${s.lines.join("\n").trim()}`);
  }
  return out.length ? `From \`${doc.file}\`:\n\n${out.join("\n\n")}` : "";
}

const base = (glob) => {
  const parts = String(glob).split("/");
  const i = parts.findIndex((p) => /[*?]/.test(p));
  return (i < 0 ? parts : parts.slice(0, i)).join("/");
};
const overlaps = (a, b) => {
  const x = base(a);
  const y = base(b);
  return x === y || x.startsWith(`${y}/`) || y.startsWith(`${x}/`);
};

// ctx: { model, task, change, body, allowed, text(id), included:Set }
function designParts(ctx) {
  const { model, change, allowed, text, included } = ctx;
  const K = require("./knowledge.cjs");
  const parts = [];

  // 1. Architecture: always.
  const arch = K.docsOf(model).find((d) => d.kind === "architecture");
  const archText = arch ? pageSections(model, arch) : "";
  if (archText) parts.push({ name: "Architecture (main parts and dependency rules)", body: archText, priority: 1 });

  // Scope of the task: its feature, delivered requirements, inputs and components.
  const scope = new Set();
  const inputs = ctx.task.relations.filter((r) => r.type === "inputs").map((r) => r.to);
  inputs.forEach((id) => scope.add(id));
  if (change) {
    for (const sid of change.slices) {
      const s = model.slices.get(sid);
      if (!s) continue;
      scope.add(s.feature);
      s.delivers.forEach((r) => scope.add(r));
    }
    change.affects.forEach((a) => scope.add(a));
  }
  const components = [...model.records.values()].filter((r) => r.kind === "component" && (scope.has(r.id) || patternList(r.fields.Code).some((g) => allowed.some((a) => overlaps(g, a)))));
  components.forEach((c) => scope.add(c.id));

  // 2. Project rules that apply here.
  const rules = [...model.records.values()].filter((r) => r.kind === "rule").filter((r) => {
    const applies = String(r.fields["Applies to"] || "").replace(/`/g, "").trim();
    if (!applies || /^(all|everywhere|project|—|-)$/i.test(applies)) return true;
    if (findIds(applies).some((id) => scope.has(id))) return true;
    return (applies.match(/[\w.-]+\/[\w./*-]*/g) || []).some((p) => allowed.some((a) => overlaps(p, a)));
  });
  const ruleIds = rules.map((r) => r.id).filter((id) => !included.has(id));
  if (ruleIds.length) parts.push({ name: "Project rules that apply to this task", body: ruleIds.map(text).join("\n\n"), priority: 2, ids: ruleIds });

  // 3. Domain records linked to the scope (either direction, or mentioned).
  const linked = (r) => r.relations.some((x) => scope.has(x.to)) || (r.mentions || []).some((m) => scope.has(m)) || [...scope].some((id) => {
    const s = model.records.get(id);
    return s && (s.relations.some((x) => x.to === r.id) || (s.mentions || []).includes(r.id));
  });
  const domainIds = [...model.records.values()].filter((r) => DOMAIN_KINDS.has(r.kind) && linked(r)).map((r) => r.id).filter((id) => !included.has(id) && !ruleIds.includes(id));
  if (domainIds.length) parts.push({ name: "Domain rules and words for this task", body: domainIds.map(text).join("\n\n"), priority: 3, ids: domainIds });

  // 4. The Impact's changed and referenced layers: their pages' sections and the records it names.
  const impact = ctx.body ? K.impactOf(ctx.body) : null;
  if (impact) {
    const pages = [];
    const named = [];
    for (const [layer, v] of impact.layers) {
      if (!["changed", "referenced"].includes(v.state)) continue;
      for (const d of K.docsForLayer(model, layer)) {
        if (d.kind === "architecture") continue;
        const t = pageSections(model, d);
        if (t && !pages.includes(t)) pages.push(t);
      }
      for (const id of findIds(v.named)) if (model.records.has(id) && !included.has(id) && !ruleIds.includes(id) && !domainIds.includes(id) && !named.includes(id)) named.push(id);
    }
    if (named.length) parts.push({ name: "Records the Impact names", body: named.map(text).join("\n\n"), priority: 4, ids: named });
    if (pages.length) parts.push({ name: "Design pages of the changed and referenced layers", body: pages.join("\n\n"), priority: 5 });
  }

  // 5. The visual bar.
  const { policy } = require("./adapters.cjs");
  const bar = model.approvals ? model.approvals.discovery.visualBar : [];
  if (policy(model).visualBar && bar.length) parts.push({ name: "Visual bar (the person scores the result against it)", body: bar.map((l, i) => `${i + 1}. ${l}`).join("\n"), priority: 2 });

  return parts;
}

module.exports = { designParts, pageSections };
