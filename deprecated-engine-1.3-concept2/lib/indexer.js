const fs = require("fs");
const path = require("path");
const { ensureDir } = require("./fs-utils");
const { activeWorkHash, validateProject } = require("./project");

function generateIndexes(projectRoot) {
  const result = validateProject(projectRoot);
  const regenerable = new Set(["INDEX_STALE", "INDEX_INVALID", "CHANGE_INDEX_STALE", "CHANGE_INDEX_INVALID"]);
  const blocking = result.diagnostics.filter((item) => item.level === "error" && !regenerable.has(item.code));
  if (blocking.length) {
    const error = new Error(`Cannot generate indexes: ${blocking.length} validation error(s)`);
    error.diagnostics = result.diagnostics;
    throw error;
  }
  const indexRoot = path.join(result.root, "indexes");
  ensureDir(indexRoot);
  const artifacts = [...result.artifacts.values()].sort((a, b) => a.id.localeCompare(b.id));
  const generatedAt = new Date().toISOString();
  const machine = {
    schema: "royascaff/artifact-index/v1",
    generated_at: generatedAt,
    source_hash: result.sourceHash,
    artifacts: Object.fromEntries(artifacts.map((artifact) => [artifact.id, {
      type: artifact.type,
      title: artifact.title,
      module: artifact.module,
      owner: artifact.owner,
      knowledge_status: artifact.knowledge_status,
      implementation_status: artifact.implementation_status,
      path: artifact.path,
      relations: Object.fromEntries(Object.entries(artifact).filter(([key, value]) => Array.isArray(value))),
    }]))
  };
  fs.writeFileSync(path.join(indexRoot, "artifacts.json"), `${JSON.stringify(machine, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(indexRoot, "artifacts.md"), artifactIndexMarkdown(machine), "utf8");
  fs.writeFileSync(path.join(indexRoot, "status.md"), statusMarkdown(machine), "utf8");
  const changeSourceHash = activeWorkHash(result.root, result.changes, result.tasks);
  const changeMachine = {
    schema: "royascaff/change-index/v1",
    generated_at: generatedAt,
    source_hash: changeSourceHash,
    changes: result.changes.map((change) => ({ id: change.id, title: change.title, type: change.type, state: change.state, risk: change.risk, owner: change.owner, path: change.path })),
    tasks: result.tasks.map((task) => ({ id: task.id, change: task.change, title: task.title, state: task.state, skill: task.skill, path: task.path })),
  };
  fs.writeFileSync(path.join(indexRoot, "changes.json"), `${JSON.stringify(changeMachine, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(indexRoot, "changes.md"), changesMarkdown(result.changes, generatedAt, result.sourceHash, changeSourceHash), "utf8");
  return { ...result, generated: ["indexes/artifacts.json", "indexes/artifacts.md", "indexes/status.md", "indexes/changes.json", "indexes/changes.md"] };
}

function artifactIndexMarkdown(index) {
  const rows = Object.entries(index.artifacts).map(([id, item]) => `| ${id} | ${item.type} | ${item.module} | ${item.knowledge_status} | ${item.implementation_status} | [source](../${item.path}) |`);
  return `# Artifact Index\n\n> Generated. Source hash: \`${index.source_hash}\`.\n\n| ID | Type | Module | Knowledge | Implementation | Source |\n|----|------|--------|-----------|----------------|--------|\n${rows.join("\n")}\n`;
}

function statusMarkdown(index) {
  const counts = {};
  for (const artifact of Object.values(index.artifacts)) counts[artifact.implementation_status] = (counts[artifact.implementation_status] || 0) + 1;
  const rows = Object.entries(counts).sort().map(([status, count]) => `| ${status} | ${count} |`);
  const pending = Object.entries(index.artifacts).filter(([, item]) => ["planned", "partial"].includes(item.implementation_status));
  return `# Project Status\n\n> Generated. Source hash: \`${index.source_hash}\`.\n\n## Summary\n\n| Implementation status | Count |\n|-----------------------|------:|\n${rows.join("\n")}\n\n## Planned or partial\n\n${pending.length ? pending.map(([id, item]) => `- ${id} — ${item.title} (${item.implementation_status})`).join("\n") : "- None"}\n`;
}

function changesMarkdown(changes, generatedAt, sourceHash, changeSourceHash) {
  const rows = [...changes].sort((a, b) => a.id.localeCompare(b.id)).map((change) => `| ${change.id} | ${change.type} | ${change.state} | ${change.risk} | ${change.owner} | [record](../${change.path}) |`);
  return `# Change Index\n\n> Generated ${generatedAt}. Canonical source hash: \`${sourceHash}\`. Active-work source hash: \`${changeSourceHash}\`.\n\n| ID | Type | State | Risk | Owner | Record |\n|----|------|-------|------|-------|--------|\n${rows.join("\n") || "| — | — | — | — | — | — |"}\n`;
}

module.exports = { generateIndexes };
