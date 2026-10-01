"use strict";

// Templates (plan E8): every file the engine creates comes from templates/files/*.md, so all
// projects read the same. Placeholders are {{UPPERCASE}}; examples live in fenced blocks under
// "## Record format (example)" and are never parsed as records.

const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "templates", "files");
const PLACEHOLDERS = ["CODE", "OWNER", "NAME", "ID", "TITLE", "KIND", "SCOPE", "RISK", "WHAT", "APPS", "PROFILE", "ADAPTERS"];

function fill(text, vars) {
  return text.replace(/\{\{([A-Z]+)\}\}/g, (whole, key) => (vars[key] !== undefined ? String(vars[key]) : whole));
}

function docText(name, vars) {
  return fill(fs.readFileSync(path.join(DIR, `${name}.md`), "utf8"), vars);
}

function listTemplates() {
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();
}

// New records go above the "## Record format" example section, never below it.
function insertRecord(text, block) {
  const at = text.search(/\n## Record format/);
  const body = block.replace(/\n+$/, "");
  if (at < 0) return `${text.replace(/\n*$/, "\n")}\n${body}\n`;
  return `${text.slice(0, at).replace(/\n*$/, "\n")}\n${body}\n${text.slice(at)}`;
}

function changeTemplate({ id, kind, slice, affects, risk, owner, title, feature }) {
  const scope = [slice ? `slice: ${slice}` : null, affects && affects.length ? `affects: [${affects.join(", ")}]` : null].filter(Boolean).map((l) => `${l}\n`).join("");
  const what = slice ? `the work that delivers slice ${slice}${feature ? ` of ${feature}` : ""}` : `a ${kind} change${affects && affects.length ? ` affecting ${affects.join(", ")}` : ""}`;
  return docText("change", { ID: id, KIND: kind, SCOPE: scope, RISK: risk, OWNER: owner, TITLE: title, WHAT: what });
}

function planTemplate(id) {
  return docText("plan", { ID: id });
}

// Record kinds that `royascaff new record <kind>` can create, with their home file.
const RECORD_KINDS = {
  outcome: { prefix: "OUT", doc: "brd", file: "knowledge/01-business/brd.md", fields: (o) => [["Owner", o.owner]], body: "Measured by: _how you will know this outcome is reached._" },
  requirement: { prefix: "REQ", doc: "requirements", file: "knowledge/02-requirements/requirements.md", fields: (o) => [["Priority", o.priority || "should"], ["Owner", o.owner], ["Feature", o.feature || ""], ["Verified by", o.verifies || ""]], body: "_What the user can do, and why (never how)._\n\n**Acceptance**\n- _A checkable criterion, including a failure case._" },
  nfr: { prefix: "NFR", doc: "nfr", file: "knowledge/02-requirements/nfr.md", fields: (o) => [["Priority", o.priority || "should"], ["Owner", o.owner], ["Feature", o.feature || ""]], body: "**Measure:** _a number or a check, e.g. loads within 2 seconds._" },
  concept: { prefix: "CON", doc: "domain", file: "knowledge/03-domain/domain.md", fields: (o) => [["Owner", o.owner]], body: "_What this business word means._" },
  invariant: { prefix: "INV", doc: "domain", file: "knowledge/03-domain/domain.md", fields: (o) => [["Owner", o.owner], ["Constrained by", o.feature || ""]], body: "_The rule that must always hold, and what happens when something would break it._" },
  workflow: { prefix: "WF", doc: "domain", file: "knowledge/03-domain/domain.md", fields: (o) => [["Owner", o.owner]], body: "_Trigger, steps, states and failures. Add a Mermaid diagram when it has more than a few steps._" },
  decision: { prefix: "ADR", doc: "decisions", file: "knowledge/04-design/decisions.md", fields: (o) => [["Owner", o.owner], ...(o.scope ? [["Scope", o.scope]] : []), ["Supports", o.feature || ""]], body: "**Options:** _…_\n**Choice:** _…_\n**Why:** _…_\n**Consequences:** _…_" },
  contract: { prefix: "CTR", doc: "contracts", file: "knowledge/04-design/contracts.md", fields: (o) => [["Owner", o.owner], ["Supports", o.feature || ""]], body: "_Inputs, outputs, errors and who calls it._" },
  component: { prefix: "CMP", doc: "components", file: "knowledge/05-implementation/components.md", fields: (o) => [["Owner", o.owner], ["Code", o.code || ""], ["Realizes", o.realizes || ""]], body: "" },
  question: { prefix: "QST", doc: (o) => (o.feature ? "questions" : "discovery"), file: (o) => (o.feature ? "knowledge/00-roadmap/questions.md" : "knowledge/00-discovery/discovery.md"), fields: (o) => (o.feature ? [["Feature", o.feature]] : [["Topic", o.topic || ""]]).concat([["Answer", ""], ["Source", ""]]), body: "" },
  source: { prefix: "SRC", doc: "coverage", file: "knowledge/00-discovery/coverage.md", fields: (o) => [["Quote", o.quote || ""], ["Covered by", o.covered || ""]], body: "" },
  assumption: { prefix: "ASM", doc: "discovery", file: "knowledge/00-discovery/discovery.md", fields: (o) => [["Topic", o.topic || ""], ["Basis", o.basis || ""]], body: "" },
  rule: { prefix: "RULE", doc: "rules", file: "knowledge/04-design/rules.md", fields: (o) => [["Owner", o.owner], ["Applies to", o.applies || o.feature || ""]], body: "_The rule, in one or two sentences, and what breaking it would look like._" },
  release: { prefix: "REL", doc: "releases", file: "releases/releases.md", fields: (o) => [["Owner", o.owner], ["Includes", o.includes || ""], ["Date", new Date().toISOString().slice(0, 10)]], body: "_Where it was deployed, and the check that was done after deploying._" },
  test: { prefix: "TEST", doc: "tests", file: "knowledge/05-implementation/tests.md", fields: (o) => [["Owner", o.owner], ["Check", o.check || "runner:test"], ["Verifies", o.verifies || ""]], body: "" },
};

const KIND_ALIASES = { src: "source", qst: "question", asm: "assumption", req: "requirement", out: "outcome", adr: "decision", cmp: "component", ctr: "contract", inv: "invariant", con: "concept", wf: "workflow" };

function recordBlock(kind, id, title, opts) {
  const spec = RECORD_KINDS[kind];
  const fields = spec.fields(opts).map(([k, v]) => (v ? `- **${k}:** ${v}` : `- **${k}:**`)).join("\n");
  return `### ${id} · ${title}\n\n${fields}\n${spec.body ? `\n${spec.body}\n` : ""}`;
}

module.exports = { fill, docText, listTemplates, insertRecord, changeTemplate, planTemplate, RECORD_KINDS, KIND_ALIASES, recordBlock, PLACEHOLDERS, DIR };
