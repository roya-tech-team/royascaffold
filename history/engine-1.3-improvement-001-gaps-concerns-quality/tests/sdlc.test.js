"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { validateProject, generateIndexes, buildContext, scanProject, hashSelectedRecords } = require("../bin/sdlc.js");

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function canonical(id, title, extra = "") {
  return `---\ndocument_id: ${id}\ntitle: ${title}\nlayer: profile\nschema_version: 2\ndocument_status: approved\nowners: [team]\n${extra}---\n\n# ${title}\n`;
}

function fingerprint(root, relatives) {
  const hash = crypto.createHash("sha256");
  for (const relative of [...relatives].sort()) {
    hash.update(relative); hash.update("\0"); hash.update(fs.readFileSync(path.join(root, relative))); hash.update("\0");
  }
  return hash.digest("hex");
}

function createLegacyProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "royascaff-legacy-"));
  write(root, "system-map.md", canonical("DOC-DEMO-SYSTEM", "System map"));
  write(root, "profile.md", canonical("DOC-DEMO-PROFILE", "Profile", "adapters: [generic]\nsource_roots: []\nsource_extensions: []\n"));
  return root;
}

function createStrictProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "royascaff-strict-"));
  write(root, "system-map.md", canonical("DOC-DEMO-SYSTEM", "System map"));
  write(root, "profile.md", canonical("DOC-DEMO-PROFILE", "Profile", "adoption_mode: strict\nadapters: [generic]\nsource_roots: []\nsource_extensions: []\n"));
  write(root, "src/value.txt", "approved implementation\n");
  const sourceHash = fingerprint(root, ["src/value.txt"]);
  const change = `---
change_id: CHG-DEMO-001
status: ready
intent: feature
risk: medium
uncertainty: medium
judgment: medium
artifact_mode: standard
adoption_mode: strict
baseline_revision: base-001
owners: [team]
selected_adapters: [generic]
required_gates: [solution-quality-review, implementation-readiness-review]
---

# Demo change

### CRIT-DEMO-001 · User observes the approved outcome

- **Kind:** quality-criterion
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** product
- **Priority:** must
- **Foundation:** yes
- **Outcome:** The user completes the primary action without ambiguity.
- **Threshold authority:** owner
- **Method:** scenario-review
- **Authority class:** fresh-context-reviewer
- **Realized by:** \`TASK-DEMO-001\`
- **Verified by:** \`EVD-DEMO-001\`

### RDR-DEMO-001 · Retain source hierarchy

- **Kind:** reference-decision
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** design
- **Decision status:** decided
- **Materiality:** material
- **Disposition:** retain
- **Source aspect:** primary hierarchy
- **Observation:** The source puts the primary action first.
- **Interpretation:** The implementation must retain a single dominant action.
- **Rationale:** This preserves the approved user focus.
- **Confidence:** high
- **Supports:** \`CRIT-DEMO-001\`
- **Realized by:** \`TASK-DEMO-001\`

### PAT-DEMO-001 · Use bounded state ownership

- **Kind:** pattern-decision
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** architecture
- **Decision status:** decided
- **Materiality:** material
- **Problem:** Keep state changes bounded and predictable.
- **Forces:** clarity, reversibility
- **Choice:** One owned state boundary.
- **Rationale:** It prevents conflicting state authority.
- **Alternatives:** shared mutable state, duplicated state
- **Constraints:** one authoritative owner
- **Failure modes:** stale duplicate state
- **Validation:** architecture review and scenario test
- **Supports:** \`CRIT-DEMO-001\`
- **Realized by:** \`TASK-DEMO-001\`

### TASK-DEMO-001 · Build the foundation

- **Kind:** execution-task
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** engineering
- **Task class:** foundation
- **Context tier:** standard
- **Escalation:** Stop and return to design when a material decision is missing.
- **Depends on:**
- **Implements:** \`CRIT-DEMO-001\`, \`RDR-DEMO-001\`, \`PAT-DEMO-001\`

### REV-DEMO-SQR-001 · Solution quality review

- **Kind:** review
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** reviewer
- **Review type:** solution-quality
- **Disposition:** pass
- **Authority class:** fresh-context-reviewer
- **Reviewed inputs:** \`CRIT-DEMO-001\`, \`RDR-DEMO-001\`, \`PAT-DEMO-001\`
- **Input fingerprint:** SQR_FINGERPRINT

### REV-DEMO-IRR-001 · Implementation readiness review

- **Kind:** review
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** reviewer
- **Review type:** implementation-readiness
- **Disposition:** pass
- **Authority class:** fresh-context-reviewer
- **Reviewed inputs:** \`TASK-DEMO-001\`, \`CRIT-DEMO-001\`, \`RDR-DEMO-001\`, \`PAT-DEMO-001\`
- **Input fingerprint:** IRR_FINGERPRINT

### EVD-DEMO-001 · Primary outcome evidence

- **Kind:** evidence
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** quality
- **Criterion:** \`CRIT-DEMO-001\`
- **Result:** pass
- **Freshness:** fresh
- **Source paths:** src/value.txt
- **Source fingerprint:** ${sourceHash}
- **Method:** inspection
- **Expected:** Approved implementation is present.
- **Actual:** Approved implementation is present.
- **Environment:** test fixture
- **Executor:** implementer
- **Adjudicator:** reviewer
- **Authority class:** fresh-context-reviewer
`;
  const changeFile = write(root, "changes/active/CHG-DEMO-001/change.md", change);
  const scanned = scanProject(root);
  const recordMap = new Map(scanned.records.map((record) => [record.id, record]));
  const sqrHash = hashSelectedRecords(recordMap, ["CRIT-DEMO-001", "RDR-DEMO-001", "PAT-DEMO-001"]);
  const irrHash = hashSelectedRecords(recordMap, ["TASK-DEMO-001", "CRIT-DEMO-001", "RDR-DEMO-001", "PAT-DEMO-001"]);
  fs.writeFileSync(changeFile, fs.readFileSync(changeFile, "utf8").replace("SQR_FINGERPRINT", sqrHash).replace("IRR_FINGERPRINT", irrHash));
  write(root, "contexts/manifests/demo.md", `---
manifest_id: CTX-DEMO-001
role: implementer
context_tier: standard
root_ids: [TASK-DEMO-001]
include_ids: [CRIT-DEMO-001, RDR-DEMO-001, PAT-DEMO-001]
review_ids: [REV-DEMO-IRR-001]
include_documents: [profile.md]
max_tokens: 4000
overflow: fail-and-split
---
`);
  return root;
}

test("legacy-compatible 1.3 project remains valid", () => {
  const root = createLegacyProject();
  const result = validateProject(root);
  assert.deepEqual(result.issues, []);
});

test("strict quality-by-design fixture is contract-valid and generates quality views", () => {
  const root = createStrictProject();
  const result = validateProject(root);
  assert.deepEqual(result.issues, []);
  generateIndexes(root, result.scan);
  for (const file of ["quality-contracts.md", "readiness.md", "evidence-freshness.md", "adapters.md"]) {
    assert.equal(fs.existsSync(path.join(root, "generated", file)), true);
  }
  const context = buildContext(root, path.join(root, "contexts/manifests/demo.md"));
  assert.equal(fs.existsSync(context.output), true);
});

test("unresolved material reference blocks ready", () => {
  const root = createStrictProject();
  const file = path.join(root, "changes/active/CHG-DEMO-001/change.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("**Decision status:** decided", "**Decision status:** blocked"));
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[DEC-BLOCKED]")), result.issues.join("\n"));
});

test("missing readiness review blocks ready", () => {
  const root = createStrictProject();
  const file = path.join(root, "changes/active/CHG-DEMO-001/change.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("**Review type:** implementation-readiness", "**Review type:** solution-quality"));
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[REV-GATE]") && issue.includes("implementation-readiness")));
});

test("changed source invalidates evidence fingerprint", () => {
  const root = createStrictProject();
  fs.writeFileSync(path.join(root, "src/value.txt"), "changed after evidence\n");
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[EVD-STALE]")));
});

test("implementer context cannot omit task decisions", () => {
  const root = createStrictProject();
  const file = path.join(root, "contexts/manifests/demo.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace(", RDR-DEMO-001", ""));
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[CTX-TRACE]") && issue.includes("RDR-DEMO-001")));
});

test("strict profile rejects an unknown adapter", () => {
  const root = createStrictProject();
  const file = path.join(root, "profile.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("adapters: [generic]", "adapters: [generic, missing-adapter]"));
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[ADP-UNKNOWN]")));
});

test("changed reviewed decision makes the solution review stale", () => {
  const root = createStrictProject();
  const file = path.join(root, "changes/active/CHG-DEMO-001/change.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("single dominant action", "single unmistakable dominant action"));
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[REV-STALE]") && issue.includes("REV-DEMO-SQR-001")));
});

test("high-judgment work rejects implementer-only gate authority", () => {
  const root = createStrictProject();
  const file = path.join(root, "changes/active/CHG-DEMO-001/change.md");
  let content = fs.readFileSync(file, "utf8").replace("judgment: medium", "judgment: high");
  content = content.replaceAll("**Authority class:** fresh-context-reviewer", "**Authority class:** implementer-self-check");
  fs.writeFileSync(file, content);
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[REV-INDEPENDENCE]")));
});

test("optional breadth must depend on foundation work", () => {
  const root = createStrictProject();
  const file = path.join(root, "changes/active/CHG-DEMO-001/change.md");
  const optionalTask = `### TASK-DEMO-OPTIONAL · Add optional breadth

- **Kind:** execution-task
- **Knowledge status:** approved
- **Implementation status:** planned
- **Owner:** engineering
- **Task class:** optional
- **Context tier:** standard
- **Escalation:** Stop when foundation is not ready.
- **Depends on:**
- **Implements:** \`CRIT-DEMO-001\`

`;
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("### REV-DEMO-SQR-001", `${optionalTask}### REV-DEMO-SQR-001`));
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[TASK-ORDER]") && issue.includes("TASK-DEMO-OPTIONAL")));
});

test("ready strict change requires a must quality outcome", () => {
  const root = createStrictProject();
  const file = path.join(root, "changes/active/CHG-DEMO-001/change.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("**Priority:** must", "**Priority:** should"));
  const result = validateProject(root);
  assert.ok(result.issues.some((issue) => issue.includes("[QDC-MISSING]")));
});

for (const adapter of ["web-ui", "web-api"]) {
  test(`${adapter} composes with the same generic quality contract`, () => {
    const root = createStrictProject();
    const profile = path.join(root, "profile.md");
    fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("adapters: [generic]", `adapters: [generic, ${adapter}]`));
    const change = path.join(root, "changes/active/CHG-DEMO-001/change.md");
    fs.writeFileSync(change, fs.readFileSync(change, "utf8").replace("selected_adapters: [generic]", `selected_adapters: [generic, ${adapter}]`));
    const result = validateProject(root);
    assert.deepEqual(result.issues, []);
  });
}
