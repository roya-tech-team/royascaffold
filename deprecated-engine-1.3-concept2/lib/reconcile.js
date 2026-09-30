const fs = require("fs");
const path = require("path");
const { assertInside, ensureDir, sha256, toPosix, walkFiles } = require("./fs-utils");
const { assertVerificationGate, findChange } = require("./change");
const { generateIndexes } = require("./indexer");
const { writeDocument } = require("./markdown");
const { validateProject } = require("./project");

const CANONICAL_ROOTS = new Set(["requirements", "architecture", "domain", "workflows", "contracts", "data", "implementation", "decisions"]);

function assertCanonicalDelta(relative) {
  const normalized = toPosix(relative);
  const parts = normalized.split("/");
  const allowedFile = parts.length === 1 && ["profile.md", "system-map.md"].includes(parts[0]);
  const allowedLayer = parts.length > 1 && CANONICAL_ROOTS.has(parts[0]);
  if ((!allowedFile && !allowedLayer) || !normalized.endsWith(".md")) {
    throw new Error(`Delta target is outside canonical knowledge: ${normalized}`);
  }
  return normalized;
}

function reconcile(projectRoot, changeId, { apply = false } = {}) {
  const root = path.resolve(projectRoot);
  const project = validateProject(root);
  const blocking = project.diagnostics.filter((item) => item.level === "error");
  if (blocking.length) {
    const error = new Error(`Project has ${blocking.length} validation error(s); reconciliation stopped`);
    error.diagnostics = project.diagnostics;
    throw error;
  }
  const change = findChange(root, changeId);
  if (change.document.data.state !== "verified") throw new Error(`Change ${changeId} must be verified before reconciliation`);
  assertVerificationGate(change);
  const deltaRoot = path.join(change.folder, "delta");
  const deltaFiles = walkFiles(deltaRoot, (file) => file.endsWith(".md"));
  if (!deltaFiles.length) throw new Error(`Change ${changeId} has no Markdown delta files`);
  const operations = deltaFiles.map((source) => {
    const relative = assertCanonicalDelta(path.relative(deltaRoot, source));
    const target = assertInside(root, path.join(root, relative), "reconciliation target");
    return { source, target, relative, operation: fs.existsSync(target) ? "replace" : "create", hash: sha256(fs.readFileSync(source)) };
  });
  if (!apply) return { change: changeId, apply: false, operations };

  const backupRoot = path.join(change.folder, "execution", "reconciliation-backup");
  ensureDir(backupRoot);
  const year = String(new Date().getFullYear());
  const archiveRoot = path.resolve(root, "changes", "archive", year);
  ensureDir(archiveRoot);
  const archiveTarget = assertInside(archiveRoot, path.join(archiveRoot, path.basename(change.folder)), "archive target");
  if (fs.existsSync(archiveTarget)) throw new Error(`Archive target already exists: ${archiveTarget}`);

  const applied = [];
  const originalChange = fs.readFileSync(change.file, "utf8");
  const reconciliationFile = path.join(change.folder, "reconciliation.md");
  const originalReconciliation = fs.existsSync(reconciliationFile) ? fs.readFileSync(reconciliationFile) : null;
  let moved = false;
  try {
    for (const operation of operations) {
      if (fs.existsSync(operation.target)) {
        const backup = assertInside(backupRoot, path.join(backupRoot, operation.relative), "backup target");
        ensureDir(path.dirname(backup));
        fs.copyFileSync(operation.target, backup);
      }
      ensureDir(path.dirname(operation.target));
      fs.copyFileSync(operation.source, operation.target);
      applied.push(operation);
    }
    generateIndexes(root);

    const summary = {
      schema: "royascaff/reconciliation/v1",
      change: changeId,
      reconciled_at: new Date().toISOString(),
      operations: operations.map(({ relative, operation, hash }) => ({ path: relative, operation, hash })),
    };
    writeDocument(reconciliationFile, summary, `# Reconciliation — ${changeId}\n\nCanonical after-state applied and indexes regenerated successfully.\n`);
    const reconciledAt = new Date().toISOString();
    const updated = { ...change.document.data, state: "reconciled", updated_at: reconciledAt, history: [...(change.document.data.history || []), { state: "reconciled", at: reconciledAt }] };
    writeDocument(change.file, updated, change.document.body);
    fs.renameSync(change.folder, archiveTarget);
    moved = true;
    generateIndexes(root);
    return { change: changeId, apply: true, operations, archive: archiveTarget };
  } catch (error) {
    if (moved && fs.existsSync(archiveTarget) && !fs.existsSync(change.folder)) {
      fs.renameSync(archiveTarget, change.folder);
      moved = false;
    }
    for (const operation of [...applied].reverse()) {
      const backup = path.join(backupRoot, operation.relative);
      if (fs.existsSync(backup)) fs.copyFileSync(backup, operation.target);
      else if (fs.existsSync(operation.target)) fs.rmSync(operation.target, { force: true });
    }
    if (fs.existsSync(change.folder)) {
      fs.writeFileSync(change.file, originalChange);
      if (originalReconciliation) fs.writeFileSync(reconciliationFile, originalReconciliation);
      else if (fs.existsSync(reconciliationFile)) fs.rmSync(reconciliationFile, { force: true });
    }
    try { generateIndexes(root); } catch { /* Preserve the primary reconciliation failure. */ }
    throw new Error(`Reconciliation rolled back: ${error.message}`);
  }
}

module.exports = { assertCanonicalDelta, reconcile };
