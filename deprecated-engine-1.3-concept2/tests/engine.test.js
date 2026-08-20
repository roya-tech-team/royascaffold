const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { buildContext, validateTaskContext } = require("../lib/context");
const { createChange, transitionChange } = require("../lib/change");
const { validateEngine } = require("../lib/engine-validator");
const { generateIndexes } = require("../lib/indexer");
const { stringifyDocument } = require("../lib/markdown");
const { validateProject } = require("../lib/project");
const { reconcile } = require("../lib/reconcile");
const { initializeProject } = require("../lib/scaffold");

const ENGINE_ROOT = path.resolve(__dirname, "..");
const DEMO_PROJECT = path.resolve(ENGINE_ROOT, "..", "engine-1.3-sdlc-concept2-demo", "project");

function temporaryProject(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `royascaff-${name}-`));
}

function passingVerification(changeId) {
  return {
    schema: "royascaff/verification/v1",
    change: changeId,
    source_revision: "test-revision",
    deterministic: [{
      name: "fixture validation",
      command: "node --test",
      working_directory: ".",
      source_revision: "test-revision",
      executed_at: "2026-08-20T04:00:00+03:00",
      outcome: "pass",
      evidence: "execution/evidence/test.txt",
    }],
    semantic: [{ check: "fixture review", outcome: "pass", disposition: "accepted" }],
    overall: "pass",
  };
}

test("engine workflows and skills satisfy their schemas", () => {
  const result = validateEngine(ENGINE_ROOT);
  assert.deepEqual(result.diagnostics.filter((item) => item.level === "error"), []);
  assert.equal(result.workflows, 10);
  assert.equal(result.skills, 16);
});

test("PollPulse demo validates, indexes, and compiles bounded task context", () => {
  generateIndexes(DEMO_PROJECT);
  const project = validateProject(DEMO_PROJECT);
  assert.deepEqual(project.diagnostics.filter((item) => item.level === "error"), []);
  assert.equal(project.artifacts.size, 60);
  assert.equal(project.codeMapEntries.length, 29);
  assert.equal(project.tasks.length, 1);

  const result = buildContext(DEMO_PROJECT, "TASK-POLLS-EDIT-01");
  assert.ok(result.manifest.required.some((item) => item.id === "DOM-POLL" && item.reason));
  assert.ok(result.manifest.required.some((item) => item.id === "REQ-POLL-CREATE" && item.reason));
  assert.ok(result.manifest.budget.estimated_tokens <= result.manifest.budget.max_tokens);
  assert.ok(fs.existsSync(result.manifestFile));
  assert.ok(fs.existsSync(result.packFile));
  const scoped = validateTaskContext(DEMO_PROJECT, "TASK-POLLS-EDIT-01", { changedFiles: ["../apps/api/src/modules/polls/polls.service.js"] });
  assert.deepEqual(scoped.diagnostics.filter((item) => item.level === "error"), []);
  const escaped = validateTaskContext(DEMO_PROJECT, "TASK-POLLS-EDIT-01", { changedFiles: ["../apps/api/src/config.js"] });
  assert.ok(escaped.diagnostics.some((item) => item.code === "TASK_PATH_SCOPE"));
});

test("canonical edits make generated indexes stale until regeneration", () => {
  const root = temporaryProject("stale");
  try {
    const projectRoot = path.join(root, "project");
    initializeProject(projectRoot, { project: "Stale Fixture", owner: "fixture-owner" });
    generateIndexes(projectRoot);
    fs.appendFileSync(path.join(projectRoot, "system-map.md"), "\nCanonical edit.\n", "utf8");
    const stale = validateProject(projectRoot);
    assert.ok(stale.diagnostics.some((item) => item.code === "INDEX_STALE" && item.level === "error"));
    generateIndexes(projectRoot);
    const fresh = validateProject(projectRoot);
    assert.ok(!fresh.diagnostics.some((item) => item.code === "INDEX_STALE"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("unmapped runtime files and competing exclusive change claims are rejected", () => {
  const root = temporaryProject("coverage");
  try {
    const projectRoot = path.join(root, "project");
    initializeProject(projectRoot, { project: "Coverage Fixture", owner: "fixture-owner" });
    fs.mkdirSync(path.join(root, "src"), { recursive: true });
    fs.writeFileSync(path.join(root, "src", "hidden-service.js"), "export const hidden = true;\n", "utf8");
    createChange(projectRoot, { title: "First exclusive change", owner: "fixture-owner", affects: ["SYS-CORE-001"], exclusiveArtifacts: ["SYS-CORE-001"] });
    createChange(projectRoot, { title: "Second exclusive change", owner: "fixture-owner", affects: ["SYS-CORE-001"], exclusiveArtifacts: ["SYS-CORE-001"] });
    const result = validateProject(projectRoot);
    assert.ok(result.diagnostics.some((item) => item.code === "UNMAPPED_SOURCE"));
    assert.ok(result.diagnostics.some((item) => item.code === "ACTIVE_CONFLICT"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("Context Pack validation detects canonical changes after compilation", () => {
  const root = temporaryProject("context-stale");
  try {
    const demoRoot = path.join(root, "demo");
    const projectRoot = path.join(demoRoot, "project");
    fs.cpSync(DEMO_PROJECT, projectRoot, { recursive: true });
    fs.mkdirSync(path.join(demoRoot, "apps", "api"), { recursive: true });
    fs.mkdirSync(path.join(demoRoot, "apps", "web"), { recursive: true });
    fs.cpSync(path.resolve(DEMO_PROJECT, "..", "apps", "api", "src"), path.join(demoRoot, "apps", "api", "src"), { recursive: true });
    fs.cpSync(path.resolve(DEMO_PROJECT, "..", "apps", "web", "src"), path.join(demoRoot, "apps", "web", "src"), { recursive: true });
    generateIndexes(projectRoot);
    buildContext(projectRoot, "TASK-POLLS-EDIT-01");
    fs.appendFileSync(path.join(projectRoot, "requirements", "product.md"), "\nClarified after context compilation.\n", "utf8");
    generateIndexes(projectRoot);
    const result = validateTaskContext(projectRoot, "TASK-POLLS-EDIT-01");
    assert.ok(result.diagnostics.some((item) => item.code === "CONTEXT_STALE"));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("verification gate and reconciliation apply a scoped after-state", () => {
  const root = temporaryProject("reconcile");
  try {
    const projectRoot = path.join(root, "project");
    initializeProject(projectRoot, { project: "Reconcile Fixture", owner: "fixture-owner" });
    const created = createChange(projectRoot, {
      title: "Add fixture requirement",
      type: "feature",
      owner: "fixture-owner",
      risk: "low",
      affects: ["SYS-CORE-001"],
      newArtifacts: ["REQ-FIXTURE-001"],
      approvals: [{ role: "fixture-owner", outcome: "approved", at: "2026-08-20T04:00:00+03:00", subject_revision: "working-tree" }],
    });
    for (const state of ["analyzed", "approved", "planned", "in-progress", "implemented"]) {
      transitionChange(projectRoot, created.id, state);
    }
    assert.throws(() => transitionChange(projectRoot, created.id, "verified"), /requires verification\.md/);

    const folder = path.join(projectRoot, created.path);
    const verification = passingVerification(created.id);
    fs.writeFileSync(path.join(folder, "verification.md"), stringifyDocument(verification, `# Verification — ${created.id}\n`), "utf8");
    transitionChange(projectRoot, created.id, "verified");

    const deltaFile = path.join(folder, "delta", "requirements", "product.md");
    fs.mkdirSync(path.dirname(deltaFile), { recursive: true });
    fs.writeFileSync(deltaFile, `# Product Requirements\n\n## REQ-FIXTURE-001 — Fixture requirement\n\n\`\`\`yaml artifact\nid: REQ-FIXTURE-001\ntype: requirement\ntitle: Fixture requirement\nmodule: fixture\nowner: fixture-owner\nknowledge_status: approved\nimplementation_status: implemented\n\`\`\`\n\nA reconciled fixture.\n`, "utf8");

    const unsafeDelta = path.join(folder, "delta", "indexes", "forbidden.md");
    fs.mkdirSync(path.dirname(unsafeDelta), { recursive: true });
    fs.writeFileSync(unsafeDelta, "# Generated index must not be a delta.\n", "utf8");
    assert.throws(() => reconcile(projectRoot, created.id), /validation error|outside canonical knowledge/);
    fs.rmSync(unsafeDelta, { force: true });

    const preview = reconcile(projectRoot, created.id);
    assert.equal(preview.apply, false);
    assert.equal(preview.operations[0].relative, "requirements/product.md");

    const applied = reconcile(projectRoot, created.id, { apply: true });
    assert.equal(applied.apply, true);
    assert.ok(fs.existsSync(path.join(projectRoot, "requirements", "product.md")));
    assert.ok(fs.existsSync(applied.archive));
    const validated = validateProject(projectRoot);
    assert.deepEqual(validated.diagnostics.filter((item) => item.level === "error"), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
