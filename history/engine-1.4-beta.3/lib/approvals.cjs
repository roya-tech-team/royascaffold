"use strict";

// Discover stage and plan approvals (plan file 10 §4, file 11 WP1).
//
//   discovery   knowledge/00-discovery/discovery.md: 8 fixed topics, QST- questions, ASM- assumptions
//   architecture knowledge/04-design/architecture.md must hold more than template text
//   project     `approve project` (a person) covers discovery + brief + ADRs with Scope: project
//   features    `approve CAP-…` / `approve roadmap` (a person) covers the feature, its slice rows,
//               its requirements and its questions
//
// Approvals are events in project/log.md whose note carries "hash <10 hex>". An edit to what the
// hash covers makes the approval stale. Only 1.4 projects are checked.

const crypto = require("crypto");
const path = require("path");
const { parseLog } = require("./events.cjs");
const { renderMarkdown, recordText } = require("./parse/markdown.cjs");

const DISCOVERY_FILE = "knowledge/00-discovery/discovery.md";
const ARCHITECTURE_FILE = "knowledge/04-design/architecture.md";
const BRIEF_FILE = "knowledge/01-business/brd.md";
const PROJECT_LOG = "log.md";

const TOPICS = [
  { slug: "users", title: "Users and roles" },
  { slug: "problem", title: "Problem and outcomes" },
  { slug: "scope", title: "Scope and out of scope" },
  { slug: "success", title: "Success measures" },
  { slug: "constraints", title: "Constraints" },
  { slug: "technology", title: "Technology" },
  { slug: "data", title: "Data and content" },
  { slug: "look", title: "Look, feel and references" },
];

const SUMMARY_BLOCK = /<!-- royascaff:summary:start -->[\s\S]*?<!-- royascaff:summary:end -->/g;

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 10);
}

function isHuman(by) {
  return Boolean(by) && !/^ai(:|$)/i.test(by) && by !== "unknown";
}

// `## <n>. Title` sections of a file (outside code fences), without the example section.
function sections(text) {
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const out = [];
  let current = null;
  let fenced = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const h = !fenced && line.match(/^## (.+)$/);
    if (h) {
      current = { title: h[1].replace(/^\d+\.\s*/, "").trim(), lines: [] };
      out.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }
  return out.filter((s) => !/^record format/i.test(s.title));
}

// True when a section holds only template hints: blank lines, `> …` cards, `_italic_` lines,
// HTML comments and fenced examples.
function onlyTemplate(lines) {
  let fenced = false;
  for (const raw of lines) {
    const l = raw.trim();
    if (/^(```|~~~)/.test(l)) { fenced = !fenced; continue; }
    if (fenced || !l || l.startsWith(">") || l.startsWith("<!--") || /^_.*_$/.test(l)) continue;
    return false;
  }
  return true;
}

function fileText(files, rel) {
  const f = files.find((x) => x.path === rel);
  return f ? renderMarkdown(f) : null;
}

function discoveryState(model, files) {
  const text = fileText(files, DISCOVERY_FILE);
  const questions = [...model.records.values()].filter((r) => r.kind === "question");
  const openAll = questions.filter((q) => !String(q.fields.Answer || "").trim()).map((q) => ({ id: q.id, title: q.title, feature: (String(q.fields.Feature || "").match(/CAP-[A-Z0-9-]+/) || [])[0] || null }));
  const assumptions = [...model.records.values()].filter((r) => r.kind === "assumption").map((r) => ({ id: r.id, title: r.title }));
  const base = { open: openAll.filter((q) => !q.feature), openByFeature: openAll.filter((q) => q.feature), questions: questions.length, assumptions };
  if (text === null) return { exists: false, empty: TOPICS.map((t) => t.title), techOptions: 0, techRecommendation: false, ...base };
  const secs = sections(text);
  const find = (t) => secs.find((s) => s.title.toLowerCase().startsWith(t.title.toLowerCase().split(/[ ,]/)[0]));
  const empty = TOPICS.filter((t) => { const s = find(t); return !s || onlyTemplate(s.lines); }).map((t) => t.title);
  const tech = find(TOPICS[5]);
  const techLines = tech ? tech.lines : [];
  return {
    exists: true,
    empty,
    ...base,
    techOptions: techLines.filter((l) => /^\s*(?:[-*]|\d+\.)\s+\*\*Option\b/i.test(l)).length,
    techRecommendation: techLines.some((l) => /\*\*Recommendation:?\*\*/i.test(l)),
    visualBar: visualBar(find(TOPICS[7])),
  };
}

// WP-C5 (P7): the `**Visual bar:**` list in topic 8 — what good looks like, what is not acceptable.
function visualBar(section) {
  const lines = section ? section.lines : [];
  const at = lines.findIndex((l) => /\*\*Visual bar:?\*\*/i.test(l));
  if (at < 0) return [];
  const out = [];
  for (const l of lines.slice(at + 1)) {
    const m = l.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/);
    if (m) out.push(m[1].trim());
    else if (l.trim() && out.length) break;
  }
  return out;
}

function architectureState(files) {
  const text = fileText(files, ARCHITECTURE_FILE);
  if (text === null) return { exists: false, filled: false };
  return { exists: true, filled: sections(text).some((s) => !onlyTemplate(s.lines)) };
}

function projectDecisions(model) {
  return [...model.records.values()].filter((r) => r.kind === "decision" && String(r.fields.Scope || "").trim().toLowerCase() === "project");
}

function recordOf(files, rec) {
  const text = fileText(files, rec.file);
  return text === null ? "" : recordText(text, rec.id) || "";
}

function projectHash(model, files) {
  // The request is part of what the person approves; coverage.md is not (it is filled while planning).
  const parts = [DISCOVERY_FILE, BRIEF_FILE].map((f) => (fileText(files, f) || "").replace(SUMMARY_BLOCK, ""));
  const request = fileText(files, "knowledge/00-discovery/request.md");
  if (request !== null) parts.push(request);
  for (const d of projectDecisions(model).sort((a, b) => a.id.localeCompare(b.id))) parts.push(recordOf(files, d));
  return sha(parts.join("\n\u0000\n"));
}

// Records that belong to a feature's plan: its requirements (Feature/Satisfies) and questions.
function featureMembers(model, capId) {
  const out = [];
  for (const r of model.records.values()) {
    if (!["requirement", "nfr", "use-case", "question"].includes(r.kind)) continue;
    if (r.relations.some((x) => ["feature", "satisfies"].includes(x.type) && x.to === capId) || String(r.fields.Feature || "").includes(capId)) out.push(r);
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

// A plan also depends on what its requirements link to (contracts, invariants, workflows…):
// a change there after approval is the "refinement" moment, decided by a person.
const NOT_PLAN = ["feature", "slice", "change", "task", "evidence", "outcome", "test", "document", "app"];
function linkedRecords(model, members) {
  const ids = new Set();
  for (const r of members) for (const rel of r.relations) {
    if (["feature", "satisfies", "verified_by"].includes(rel.type)) continue;
    const t = model.records.get(rel.to);
    if (t && t.origin === "record" && !NOT_PLAN.includes(t.kind)) ids.add(t.id);
  }
  return [...ids].sort().map((id) => model.records.get(id));
}

function featureHash(model, files, capId) {
  const rec = model.records.get(capId);
  const members = featureMembers(model, capId);
  const parts = [recordOf(files, rec), ...members.map((r) => recordOf(files, r)), ...linkedRecords(model, members).map((r) => recordOf(files, r))];
  return sha(parts.join("\n\u0000\n"));
}

function lastApproval(events, target) {
  return [...events].reverse().find((e) => e.target === target && ["project.approved", "feature.approved"].includes(e.event) && isHuman(e.by)) || null;
}

function stateOf(event, hash) {
  if (!event) return { state: "none" };
  const m = (event.note || "").match(/hash ([0-9a-f]{10})/);
  return { state: m && m[1] === hash ? "approved" : "stale", by: event.by, when: event.when };
}

// Computed once per model (1.4 projects only).
function computeApprovals(model, files) {
  const logText = fileText(files, PROJECT_LOG);
  const { events, problems } = logText ? parseLog(logText) : { events: [], problems: [] };
  const discovery = discoveryState(model, files);
  const architecture = architectureState(files);
  const hash = projectHash(model, files);
  const features = new Map();
  for (const f of model.features.values()) {
    const h = featureHash(model, files, f.id);
    features.set(f.id, { ...stateOf(lastApproval(events, f.id), h), hash: h, openQuestions: discovery.openByFeature.filter((q) => q.feature === f.id).map((q) => q.id) });
  }
  const { coverageOf } = require("./coverage.cjs");
  const { usesWebUi } = require("./smoke.cjs");
  return {
    webUi: usesWebUi(model),
    events,
    problems,
    coverage: coverageOf(model, files),
    discovery,
    architecture,
    decisions: projectDecisions(model).map((d) => d.id),
    project: { ...stateOf(lastApproval(events, "project"), hash), hash },
    features,
  };
}

// What still stands between the project and `approve project` (empty list = ready).
function projectBlockers(a) {
  const out = [];
  if (!a.discovery.exists) out.push(`create ${DISCOVERY_FILE} (royascaff init creates it)`);
  else {
    if (a.discovery.empty.length) out.push(`fill the discovery topics: ${a.discovery.empty.join(", ")}`);
    if (a.discovery.open.length) out.push(`answer ${a.discovery.open.length} open question(s): ${a.discovery.open.map((q) => q.id).join(", ")}`);
    if (a.discovery.techOptions < 2 || !a.discovery.techRecommendation) out.push("the Technology topic needs at least two `- **Option …:**` lines and a `**Recommendation:**`");
    if (a.webUi && a.discovery.visualBar.length < 5) out.push(`topic 8 (Look, feel and references) needs a \`**Visual bar:**\` list of at least 5 lines taken from the request — what good looks like and what is not acceptable (${a.discovery.visualBar.length} now)`);
  }
  // WP-C1: the request is kept word for word and every concrete demand is listed (SRC-).
  if (a.coverage.exists) {
    if (!a.coverage.filled) out.push("save the original request word for word under ## Request in knowledge/00-discovery/request.md");
    else if (!a.coverage.sources.length) out.push('list each concrete demand of the request: royascaff new record source "<demand>" --quote "<exact words>"');
    const bad = a.coverage.sources.filter((x) => !x.found);
    if (bad.length) out.push(`these quotes are not in the request: ${bad.map((x) => x.id).join(", ")}`);
  }
  if (!a.decisions.length) out.push("record the chosen stack as a decision with `- **Scope:** project` (royascaff new record decision … --scope project)");
  if (!a.architecture.filled) out.push(`describe the system in ${ARCHITECTURE_FILE}`);
  return out;
}

module.exports = { computeApprovals, projectBlockers, projectHash, featureHash, featureMembers, sections, onlyTemplate, isHuman, TOPICS, DISCOVERY_FILE, ARCHITECTURE_FILE, PROJECT_LOG };
