const fs = require("fs");
const path = require("path");
const { ensureDir, matchesAny, sha256, toPosix } = require("./fs-utils");
const { parseDocument, stringifyDocument } = require("./markdown");
const { RELATION_FIELDS, validateProject } = require("./project");
const { formatAjvErrors, loadSchemas } = require("./schemas");

const DEFAULT_REQUIRED_RELATIONS = ["constrained_by", "satisfies", "implements", "implemented_by", "maps_to", "verified_by"];

function buildContext(projectRoot, taskId) {
  const project = validateProject(projectRoot);
  const errors = project.diagnostics.filter((item) => item.level === "error");
  if (errors.length) {
    const error = new Error(`Project has ${errors.length} validation error(s); context compilation stopped`);
    error.diagnostics = project.diagnostics;
    throw error;
  }
  const task = project.tasks.find((item) => item.id === taskId);
  if (!task) throw new Error(`Active task not found: ${taskId}`);
  const policy = loadSkillPolicy(task.skill);
  const requiredRelations = new Set(policy.required_relations || DEFAULT_REQUIRED_RELATIONS);
  const optionalRelations = new Set(policy.optional_relations || []);

  const required = new Map((task.required || []).map((id) => [id, "direct task requirement"]));
  const optional = new Map((task.optional || []).map((id) => [id, "optional task context"]));
  for (const id of [...required.keys()]) {
    const artifact = project.artifacts.get(id);
    if (!artifact) continue;
    for (const relation of RELATION_FIELDS) {
      for (const target of artifact[relation] || []) {
        if (requiredRelations.has(relation) && !required.has(target)) required.set(target, `required by ${id}.${relation}`);
        else if (optionalRelations.has(relation) && !required.has(target) && !optional.has(target)) optional.set(target, `optional one-hop from ${id}.${relation}`);
      }
    }
  }
  for (const id of required.keys()) optional.delete(id);

  const maxFiles = task.max_files || 24;
  const maxTokens = task.max_tokens || 18000;
  const sectionFor = (artifact) => ({
    id: artifact.id,
    title: artifact.title,
    path: artifact.path,
    required: required.has(artifact.id),
    reason: required.get(artifact.id) || optional.get(artifact.id),
    content: artifact.section || project.documents.get(artifact.path)?.content || "",
  });
  const requiredSections = [...required.keys()].map((id) => project.artifacts.get(id)).filter(Boolean).map(sectionFor);
  const requiredPaths = new Set(requiredSections.map((item) => item.path));
  const requiredTokens = Math.ceil(requiredSections.reduce((sum, item) => sum + item.content.length, 0) / 4);
  if (requiredPaths.size > maxFiles) throw new Error(`Required context uses ${requiredPaths.size} files, above max_files ${maxFiles}; split the task`);
  if (requiredTokens > maxTokens) throw new Error(`Required context estimates ${requiredTokens} tokens, above max_tokens ${maxTokens}; split the task`);

  const sections = [...requiredSections];
  const selectedOptional = new Map();
  const omittedOptional = [];
  const selectedPaths = new Set(requiredPaths);
  let estimatedTokens = requiredTokens;
  for (const [id, reason] of optional) {
    const artifact = project.artifacts.get(id);
    if (!artifact) continue;
    const section = sectionFor(artifact);
    const candidateTokens = Math.ceil(section.content.length / 4);
    const candidateFiles = selectedPaths.has(section.path) ? selectedPaths.size : selectedPaths.size + 1;
    if (candidateFiles > maxFiles || estimatedTokens + candidateTokens > maxTokens) {
      omittedOptional.push({ id, reason: `budget: ${reason}` });
      continue;
    }
    sections.push(section);
    selectedOptional.set(id, reason);
    selectedPaths.add(section.path);
    estimatedTokens += candidateTokens;
  }
  const uniquePaths = [...selectedPaths];

  const sourceHash = sha256(sections.map((item) => `${item.id}\0${item.path}\0${item.content}`).join("\0"));
  const sources = sections.map((item) => ({ id: item.id, path: item.path, hash: sha256(item.content), required: item.required, reason: item.reason }));
  const change = project.changes.find((item) => item.id === task.change);
  const manifest = {
    schema: "royascaff/context-manifest/v1",
    id: `CTX-${task.id}`,
    task: task.id,
    workflow: workflowFor(change.type),
    skill: task.skill,
    source_revision: change.base_revision,
    canonical_source_hash: project.sourceHash,
    source_hash: sourceHash,
    required: [...required].map(([id, reason]) => ({ id, reason })),
    optional: [...selectedOptional].map(([id, reason]) => ({ id, reason })),
    omitted_optional: omittedOptional,
    sources,
    code: task.code || [],
    commands: task.commands || [],
    constraints: task.constraints || [],
    outputs: task.outputs || [],
    budget: { max_tokens: maxTokens, estimated_tokens: estimatedTokens, max_files: maxFiles, selected_files: uniquePaths.length },
  };

  const tasksDir = path.dirname(task.absolute);
  const executionDir = path.dirname(tasksDir);
  const contextDir = path.join(executionDir, "context");
  ensureDir(contextDir);
  const manifestFile = path.join(contextDir, `${task.id}-manifest.md`);
  const packFile = path.join(contextDir, `${task.id}-pack.md`);
  const manifestBody = `# Context Manifest — ${task.id}\n\nThe complete machine-readable manifest is the YAML front matter above. It was generated from selected source hash \`${sourceHash}\`; do not edit it manually.\n`;
  fs.writeFileSync(manifestFile, stringifyDocument(manifest, manifestBody), "utf8");
  fs.writeFileSync(packFile, contextPack(task, manifest, sections), "utf8");
  return { manifest, manifestFile, packFile, project };
}

function loadSkillPolicy(skillName) {
  const skillFile = path.resolve(__dirname, "..", "skills", skillName, "SKILL.md");
  if (!fs.existsSync(skillFile)) throw new Error(`Skill context policy not found: ${skillName}`);
  const policy = parseDocument(skillFile).data.context_policy;
  if (!policy) throw new Error(`Skill ${skillName} has no context_policy`);
  return policy;
}

function workflowFor(changeType) {
  if (changeType === "bug") return "bug-fix";
  if (changeType === "refactor") return "refactor";
  if (["architecture", "migration", "security"].includes(changeType)) return "architecture-change";
  if (changeType === "initial") return "implement-initial";
  return "change-feature";
}

function validateTaskContext(projectRoot, taskId, { changedFiles = [] } = {}) {
  const project = validateProject(projectRoot);
  const diagnostics = [...project.diagnostics];
  const add = (code, message, file = "") => diagnostics.push({ level: "error", code, message, file });
  const task = project.tasks.find((item) => item.id === taskId);
  if (!task) {
    add("TASK_MISSING", `Active task not found: ${taskId}`);
    return { project, task: null, manifest: null, diagnostics };
  }
  const change = project.changes.find((item) => item.id === task.change);
  const contextDir = path.join(path.dirname(path.dirname(task.absolute)), "context");
  const manifestFile = path.join(contextDir, `${task.id}-manifest.md`);
  const packFile = path.join(contextDir, `${task.id}-pack.md`);
  let manifest = null;
  if (!fs.existsSync(manifestFile)) {
    add("CONTEXT_MISSING", `Context Manifest is missing for ${task.id}`, toPosix(path.relative(project.root, manifestFile)));
  } else {
    try {
      manifest = parseDocument(manifestFile).data;
      const { ajv } = loadSchemas();
      const validate = ajv.getSchema("royascaff/context-manifest/v1");
      if (!validate(manifest)) add("CONTEXT_SCHEMA", formatAjvErrors(validate.errors), toPosix(path.relative(project.root, manifestFile)));
      if (manifest.task !== task.id || manifest.skill !== task.skill) add("CONTEXT_TASK", "Context Manifest task or skill does not match the active task", toPosix(path.relative(project.root, manifestFile)));
      if (manifest.source_revision !== change.base_revision || manifest.canonical_source_hash !== project.sourceHash) add("CONTEXT_STALE", "Context Manifest baseline or canonical source hash is stale", toPosix(path.relative(project.root, manifestFile)));
      const current = [];
      for (const source of manifest.sources || []) {
        const artifact = project.artifacts.get(source.id);
        if (!artifact) {
          add("CONTEXT_SOURCE", `Context source no longer exists: ${source.id}`, toPosix(path.relative(project.root, manifestFile)));
          continue;
        }
        const content = artifact.section || project.documents.get(artifact.path)?.content || "";
        const hash = sha256(content);
        if (source.path !== artifact.path || source.hash !== hash) add("CONTEXT_STALE", `Context source changed: ${source.id}`, source.path);
        current.push(`${source.id}\0${artifact.path}\0${content}`);
      }
      if (manifest.source_hash !== sha256(current.join("\0"))) add("CONTEXT_STALE", "Compiled source hash does not match current artifact sections", toPosix(path.relative(project.root, manifestFile)));
    } catch (error) {
      add("CONTEXT_PARSE", error.message, toPosix(path.relative(project.root, manifestFile)));
    }
  }
  if (!fs.existsSync(packFile)) add("CONTEXT_PACK_MISSING", `Context Pack is missing for ${task.id}`, toPosix(path.relative(project.root, packFile)));

  const mapped = new Set(project.codeMapEntries.map((entry) => toPosix(entry.path)));
  const planned = new Set((task.planned_new_files || []).map((entry) => toPosix(typeof entry === "string" ? entry : entry.path)));
  for (const changedFile of changedFiles) {
    const normalized = toPosix(path.isAbsolute(changedFile) ? path.relative(project.root, changedFile) : changedFile);
    if (["profile.md", "system-map.md"].includes(normalized) || /^(requirements|architecture|domain|workflows|contracts|data|implementation|decisions)\//.test(normalized)) {
      add("TASK_CANONICAL_MUTATION", `Implementation task changed canonical knowledge: ${normalized}`, normalized);
    }
    if (!matchesAny(normalized, task.code || [])) add("TASK_PATH_SCOPE", `Changed file is outside task code scope: ${normalized}`, normalized);
    if (!mapped.has(normalized) && !planned.has(normalized)) add("TASK_CODE_OWNER", `Changed file has no canonical or planned code-map owner: ${normalized}`, normalized);
  }
  return { project, task, manifest, manifestFile, packFile, diagnostics };
}

function contextPack(task, manifest, sections) {
  const required = sections.filter((item) => item.required);
  const optional = sections.filter((item) => !item.required);
  const render = (items) => items.map((item) => `> Source: \`${item.path}\` · hash \`${sha256(item.content)}\` · ${item.reason}\n\n${item.content}`).join("\n\n---\n\n");
  return `# Context Pack — ${task.id}\n\n> Generated. Source hash: \`${manifest.source_hash}\`. Estimated tokens: ${manifest.budget.estimated_tokens}/${manifest.budget.max_tokens}.\n\n## Execution contract\n\n- **Objective:** ${task.title}\n- **Skill:** \`${task.skill}\`\n- **Allowed code:** ${(task.code || []).map((item) => `\`${item}\``).join(", ") || "none"}\n- **Outputs:** ${(task.outputs || []).join(", ")}\n- **Commands:** ${(task.commands || []).map((item) => `\`${item}\``).join(", ") || "none"}\n- **Constraints:** ${(task.constraints || []).join("; ") || "none"}\n- **Invariant:** implementation tasks do not edit canonical project knowledge.\n\n## Required canonical context\n\n${render(required)}\n\n${optional.length ? `## Optional context\n\n${render(optional)}\n\n` : ""}## Code locations\n\n${(task.code || []).map((item) => `- \`${item}\``).join("\n") || "- None"}\n`;
}

module.exports = { buildContext, loadSkillPolicy, validateTaskContext, workflowFor };
