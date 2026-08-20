const fs = require("fs");
const path = require("path");
const { ensureDir, toPosix, walkFiles } = require("./fs-utils");
const { parseDocument, writeDocument } = require("./markdown");
const { formatAjvErrors, loadSchemas } = require("./schemas");

const TRANSITIONS = {
  draft: ["analyzed", "abandoned"],
  analyzed: ["draft", "approved", "blocked", "abandoned"],
  approved: ["planned", "abandoned"],
  planned: ["in-progress", "blocked", "abandoned"],
  "in-progress": ["implemented", "blocked", "abandoned"],
  blocked: ["analyzed", "planned", "in-progress", "abandoned"],
  implemented: ["in-progress", "verified"],
  verified: ["in-progress", "reconciled"],
  reconciled: [],
  abandoned: [],
};

function localId(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(now).reduce((out, part) => ({ ...out, [part.type]: part.value }), {});
  return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "change";
}

function createChange(projectRoot, options) {
  const activeRoot = path.resolve(projectRoot, "changes", "active");
  ensureDir(activeRoot);
  let idPart = localId();
  let folder = path.join(activeRoot, `change-${idPart}-${slugify(options.title)}`);
  if (fs.existsSync(folder)) {
    const suffix = Math.random().toString(16).slice(2, 6).padEnd(4, "0");
    idPart += `-${suffix}`;
    folder = path.join(activeRoot, `change-${idPart}-${slugify(options.title)}`);
  }
  ensureDir(path.join(folder, "delta"));
  ensureDir(path.join(folder, "execution", "tasks"));
  ensureDir(path.join(folder, "execution", "context"));
  ensureDir(path.join(folder, "execution", "evidence"));
  const data = {
    schema: "royascaff/change/v1",
    id: `CHG-${idPart}`,
    title: options.title,
    type: options.type || "change",
    state: "draft",
    owner: options.owner || "owner",
    base_revision: options.baseRevision || "working-tree",
    risk: options.risk || "medium",
    affects: options.affects || [],
    new_artifacts: options.newArtifacts || [],
    depends_on: options.dependsOn || [],
    exclusive_artifacts: options.exclusiveArtifacts || [],
    exclusive_paths: options.exclusivePaths || [],
    approvals: options.approvals || [],
    updated_at: new Date().toISOString(),
    history: [{ state: "draft", at: new Date().toISOString() }],
  };
  writeDocument(path.join(folder, "change.md"), data, `# ${data.id} — ${data.title}\n\n## Outcome\n\nDescribe the requested observable outcome.\n\n## Acceptance criteria\n\n1. Define testable acceptance criteria before approval.\n`);
  writeDocument(path.join(folder, "impact.md"), { schema: "royascaff/impact/v1", change: data.id, state: "draft" }, `# Impact Analysis — ${data.title}\n\nAssess requirements, architecture, domain, workflows, contracts, data, components, code, tests, compatibility, migration, rollout, and rollback.\n`);
  return { id: data.id, folder, path: toPosix(path.relative(projectRoot, folder)) };
}

function findChange(projectRoot, changeId) {
  const files = walkFiles(path.join(projectRoot, "changes"), (file) => path.basename(file) === "change.md");
  for (const file of files) {
    const document = parseDocument(file);
    if (document.data.id === changeId) return { file, document, folder: path.dirname(file) };
  }
  throw new Error(`Change not found: ${changeId}`);
}

function transitionChange(projectRoot, changeId, nextState) {
  const change = findChange(projectRoot, changeId);
  const current = change.document.data.state;
  if (!(TRANSITIONS[current] || []).includes(nextState)) throw new Error(`Illegal transition ${current} → ${nextState}`);
  assertTransitionGate(change, nextState);
  if (nextState === "verified") assertVerificationGate(change);
  const now = new Date().toISOString();
  const data = { ...change.document.data, state: nextState, updated_at: now, history: [...(change.document.data.history || []), { state: nextState, at: now }] };
  writeDocument(change.file, data, change.document.body);
  return { id: changeId, previous: current, state: nextState, file: change.file };
}

function assertTransitionGate(change, nextState) {
  if (["analyzed", "approved", "planned"].includes(nextState) && !fs.existsSync(path.join(change.folder, "impact.md"))) {
    throw new Error(`${change.document.data.id} requires impact.md before entering ${nextState}`);
  }
  if (["approved", "planned"].includes(nextState)) {
    const data = change.document.data;
    const approvals = (data.approvals || []).filter((approval) => approval.outcome === "approved" && approval.subject_revision === data.base_revision);
    const minimum = ["high", "critical"].includes(data.risk) ? 2 : 1;
    if (approvals.length < minimum) throw new Error(`${data.id} requires ${minimum} baseline-matching approval(s) before entering ${nextState}`);
  }
}

function assertVerificationGate(change) {
  const verificationFile = path.join(change.folder, "verification.md");
  if (!fs.existsSync(verificationFile)) throw new Error(`${change.document.data.id} requires verification.md before entering verified state`);
  const verification = parseDocument(verificationFile).data;
  const { ajv } = loadSchemas();
  const validate = ajv.getSchema("royascaff/verification/v1");
  if (!validate(verification)) throw new Error(`Invalid verification evidence: ${formatAjvErrors(validate.errors)}`);
  if (verification.change !== change.document.data.id) throw new Error(`Verification change ${verification.change} does not match ${change.document.data.id}`);
  if (verification.overall !== "pass" || verification.deterministic.some((check) => check.outcome !== "pass") || verification.semantic.some((check) => ["fail", "blocked"].includes(check.outcome))) {
    throw new Error(`${change.document.data.id} verification has failing or blocked evidence`);
  }
  return verification;
}

module.exports = { TRANSITIONS, assertTransitionGate, assertVerificationGate, createChange, findChange, transitionChange };
