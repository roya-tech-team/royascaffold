"use strict";

// Knowledge registry (beta.4, plan file 17 WP-D2). Every knowledge document type, the Impact layer
// it belongs to, the record kinds it holds, the sections a Context Pack carries from it, and who
// produces, consumes and checks it. Gates, packs, `next` and the board read this table; they hold
// no file names of their own. A project may add document types in profile.md (`documents:` —
// `kind=path@layer`), which get the same treatment.

const LAYERS = [
  { id: "business", label: "Business", words: ["business"], kinds: ["outcome"] },
  { id: "requirements", label: "Requirements", words: ["requirements", "requirement"], kinds: ["requirement", "nfr", "use-case"] },
  { id: "domain", label: "Domain", words: ["domain", "workflows", "workflow"], kinds: ["concept", "invariant", "workflow"] },
  { id: "architecture", label: "Architecture", words: ["architecture"], kinds: ["decision", "rule"] },
  { id: "data", label: "Data", words: ["data"], kinds: [] },
  { id: "contracts", label: "Contracts", words: ["contracts", "contract"], kinds: ["contract"] },
  { id: "experience", label: "Experience", words: ["experience"], kinds: [] },
  { id: "security", label: "Security", words: ["security"], kinds: [] },
  { id: "components", label: "Components & tests", words: ["components", "component", "code", "tests"], kinds: ["component", "test"] },
  { id: "quality", label: "Quality & operations", words: ["quality", "operations", "release"], kinds: ["release"] },
];

// Document types. `producer`: the stage that writes it · `consumer`: who reads it later ·
// `check`: what notices it missing, stale or contradicted. `pack`: sections a Context Pack carries.
const DOCS = [
  { kind: "request", file: "knowledge/00-discovery/request.md", layer: null, producer: "discover (init creates it)", consumer: "demand quotes; project approval", check: "quotes found; request in the project fingerprint" },
  { kind: "discovery", file: "knowledge/00-discovery/discovery.md", layer: null, producer: "discover", consumer: "project approval; the look (visual bar); design context", check: "topics filled, questions answered, visual bar", pack: ["Constraints", "Look, feel and references"] },
  { kind: "coverage", file: "knowledge/00-discovery/coverage.md", layer: null, producer: "discover, plan", consumer: "roadmap approval; board (covered / delivered)", check: "quote found; covered or out of scope" },
  { kind: "roadmap", file: "knowledge/00-roadmap/roadmap.md", layer: null, producer: "plan", consumer: "next, approvals, status", check: "plan approval fingerprint" },
  { kind: "questions", file: "knowledge/00-roadmap/questions.md", layer: null, producer: "plan", consumer: "feature approval", check: "answered before approval" },
  { kind: "brd", file: "knowledge/01-business/brd.md", layer: "business", producer: "discover", consumer: "project approval; outcome measurement", check: "project fingerprint; outcomes measured when their features are done" },
  { kind: "requirements", file: "knowledge/02-requirements/requirements.md", layer: "requirements", producer: "plan", consumer: "slices, packs, evidence", check: "plan approval; proof per requirement" },
  { kind: "nfr", file: "knowledge/02-requirements/nfr.md", layer: "requirements", producer: "plan", consumer: "slices, packs, red-first, proof", check: "must NFR sliced; proof" },
  { kind: "domain", newDoc: true, file: "knowledge/03-domain/domain.md", layer: "domain", producer: "design (new doc domain / new record concept|invariant|workflow)", consumer: "packs (invariants and workflows linked to the task)", check: "Record: Domain changed edits it" },
  { kind: "architecture", newDoc: true, file: "knowledge/04-design/architecture.md", layer: "architecture", producer: "discover", consumer: "every pack (main parts, dependency rules); design", check: "project fingerprint; Record: Architecture changed edits it; dependency rules checked on code", pack: ["Main parts", "Dependency rules"] },
  { kind: "decisions", file: "knowledge/04-design/decisions.md", layer: "architecture", producer: "discover, design", consumer: "design gate; packs", check: "project fingerprint (Scope: project); a new ADR forces Architecture: changed" },
  { kind: "rules", newDoc: true, file: "knowledge/04-design/rules.md", layer: "architecture", producer: "design (new record rule)", consumer: "packs (rules that apply to the task)", check: "Record: Architecture changed" },
  { kind: "data", newDoc: true, file: "knowledge/04-design/data.md", layer: "data", producer: "design (new doc data)", consumer: "packs when Data is changed or referenced", check: "Record: Data changed edits it", pack: ["Entities", "Rules and constraints", "Source of truth and flow"] },
  { kind: "contracts", file: "knowledge/04-design/contracts.md", layer: "contracts", producer: "design", consumer: "design gate; packs", check: "a new CTR forces Contracts: changed" },
  { kind: "experience", newDoc: true, file: "knowledge/04-design/experience.md", layer: "experience", producer: "design (new doc experience)", consumer: "packs when Experience is changed or referenced", check: "Record: Experience changed edits it", pack: ["Screens and first view", "Interactions and states", "Design tokens"] },
  { kind: "security", newDoc: true, file: "knowledge/04-design/security.md", layer: "security", producer: "design (new doc security)", consumer: "packs when Security is changed or referenced", check: "Record: Security changed edits it", pack: ["Actors and permissions", "Sensitive data", "Threats and controls"] },
  { kind: "components", file: "knowledge/05-implementation/components.md", layer: "components", producer: "design, record", consumer: "code map; ownership; drift", check: "changed code is owned; a new CMP forces Components: changed" },
  { kind: "tests", file: "knowledge/05-implementation/tests.md", layer: "components", producer: "plan, build", consumer: "ready gate; proof", check: "runner tests per requirement" },
  { kind: "quality", newDoc: true, file: "knowledge/06-quality/quality.md", layer: "quality", producer: "design (new doc quality)", consumer: "record gate (standard profile); packs when Quality is changed", check: "strategy written; Record: Quality changed edits it", pack: ["Quality targets", "Checks and who runs them"] },
  { kind: "operations", newDoc: true, file: "knowledge/07-operations/operations.md", layer: "quality", producer: "design (new doc operations)", consumer: "packs when Quality & operations is changed", check: "Record: Quality & operations changed edits it", pack: ["Build and deploy", "Health and monitoring"] },
  { kind: "releases", file: "releases/releases.md", layer: "quality", producer: "release (new record release)", consumer: "status 🚀 Released", check: "released changes are closed" },
];

// Legacy six-row labels still parse: each maps to several layers.
function layersOfLabel(label) {
  const words = String(label || "").toLowerCase().split(/[\/&,]|\band\b/).map((w) => w.trim()).filter(Boolean);
  const out = [];
  for (const w of words) {
    const first = w.split(/\s+/)[0];
    const l = LAYERS.find((x) => x.words.includes(first) || x.words.includes(w));
    if (l && !out.includes(l.id)) out.push(l.id);
  }
  return out;
}

const STRENGTH = { changed: 3, referenced: 2, unchanged: 1, "not-applicable": 0 };

// The Impact table of a change body → { rows, layers: Map(layer → {state, named, row}) }.
function impactOf(body) {
  const { section } = require("./gates.cjs");
  const { readTables } = require("./model/tables.cjs");
  const text = section(body, ["Impact"]);
  const table = text ? readTables(text).find((t) => t.header.map((h) => h.toLowerCase()).includes("state")) : null;
  if (!table) return null;
  const header = table.header.map((h) => h.toLowerCase());
  const si = header.indexOf("state");
  const ai = header.findIndex((h) => /affected/.test(h));
  const rows = table.rows.map((r) => {
    const label = (r.cells[0] || "").trim();
    return { label, layers: layersOfLabel(label), state: (r.cells[si] || "").trim().toLowerCase(), named: ai >= 0 ? (r.cells[ai] || "").replace(/`/g, "").trim() : "" };
  });
  const layers = new Map();
  for (const row of rows) {
    for (const l of row.layers) {
      const prev = layers.get(l);
      if (!prev || (STRENGTH[row.state] ?? -1) > (STRENGTH[prev.state] ?? -1)) layers.set(l, { state: row.state, named: row.named, row: row.label });
    }
  }
  return { rows, layers };
}

// Project-declared document types: profile `documents: [kind=path@layer, …]`.
function projectDocs(model) {
  const raw = model && model.profile ? model.profile.documents : null;
  const list = Array.isArray(raw) ? raw : raw ? String(raw).split(",") : [];
  return list.map((x) => String(x).trim()).filter(Boolean).map((x) => {
    const m = x.match(/^([\w-]+)=([^@]+)@([\w-]+)$/);
    return m ? { kind: m[1], file: m[2].trim(), layer: m[3], producer: "project", consumer: "packs when its layer is changed or referenced", check: "Record: its layer changed edits it", pack: [] } : null;
  }).filter(Boolean);
}

function docsOf(model) {
  return [...DOCS, ...projectDocs(model)];
}

const docsForLayer = (model, layer) => docsOf(model).filter((d) => d.layer === layer);
const layerOfKind = (kind) => (LAYERS.find((l) => l.kinds.includes(kind)) || {}).id || null;

module.exports = { LAYERS, DOCS, STRENGTH, layersOfLabel, impactOf, docsOf, docsForLayer, layerOfKind, projectDocs };
