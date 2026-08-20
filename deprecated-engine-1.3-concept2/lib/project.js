const fs = require("fs");
const path = require("path");
const { hashFiles, matchesAny, toPosix, walkFiles } = require("./fs-utils");
const { extractHeadingSection, parseDocument, parseTypedBlocks } = require("./markdown");
const { formatAjvErrors, loadSchemas } = require("./schemas");
const { TRANSITIONS } = require("./change");

const CANONICAL_DIRS = [
  "requirements",
  "architecture",
  "domain",
  "workflows",
  "contracts",
  "data",
  "implementation",
  "decisions",
];

const RELATION_FIELDS = [
  "satisfies",
  "constrained_by",
  "realized_by",
  "uses",
  "maps_to",
  "implemented_by",
  "implements",
  "depends_on",
  "verified_by",
  "verifies",
  "supersedes",
  "superseded_by",
  "affects",
  "owned_by",
];

function diagnostic(level, code, message, file = "") {
  return { level, code, message, file };
}

function canonicalMarkdownFiles(projectRoot) {
  const files = [];
  for (const directory of CANONICAL_DIRS) {
    files.push(...walkFiles(path.join(projectRoot, directory), (file) => file.endsWith(".md")));
  }
  for (const name of ["system-map.md"]) {
    const file = path.join(projectRoot, name);
    if (fs.existsSync(file)) files.push(file);
  }
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function scanProject(projectRoot) {
  const root = path.resolve(projectRoot);
  const profileFile = path.join(root, "profile.md");
  if (!fs.existsSync(profileFile)) throw new Error(`Missing project profile: ${profileFile}`);
  const profileDocument = parseDocument(profileFile);
  const files = canonicalMarkdownFiles(root);
  const artifacts = new Map();
  const codeMapEntries = [];
  const documents = new Map();
  const diagnostics = [];
  const { ajv } = loadSchemas();
  const validateArtifact = ajv.getSchema("royascaff/artifact/v1");
  const validateProfile = ajv.getSchema("royascaff/project-profile/v1");

  if (!validateProfile(profileDocument.data)) {
    diagnostics.push(diagnostic("error", "PROFILE_SCHEMA", formatAjvErrors(validateProfile.errors), "profile.md"));
  }

  for (const directory of CANONICAL_DIRS) {
    if (!fs.existsSync(path.join(root, directory))) diagnostics.push(diagnostic("error", "CANONICAL_DIRECTORY", `missing canonical directory: ${directory}`, directory));
  }

  for (const file of files) {
    const relative = toPosix(path.relative(root, file));
    let document;
    try {
      document = parseDocument(file);
      documents.set(relative, document);
      for (const block of parseTypedBlocks(document.content, "artifact", relative)) {
        const artifact = block.data;
        if (!validateArtifact(artifact)) {
          diagnostics.push(diagnostic("error", "ARTIFACT_SCHEMA", `${artifact.id || "<missing id>"}: ${formatAjvErrors(validateArtifact.errors)}`, relative));
          continue;
        }
        if (artifacts.has(artifact.id)) {
          diagnostics.push(diagnostic("error", "DUPLICATE_ID", `${artifact.id} also exists in ${artifacts.get(artifact.id).path}`, relative));
          continue;
        }
        artifacts.set(artifact.id, {
          ...artifact,
          path: relative,
          section: extractHeadingSection(document.content, artifact.id),
        });
      }
      for (const block of parseTypedBlocks(document.content, "code-map", relative)) {
        const entries = Array.isArray(block.data) ? block.data : block.data.entries;
        if (!Array.isArray(entries)) {
          diagnostics.push(diagnostic("error", "CODE_MAP_SHAPE", "code-map block must contain an entries array", relative));
          continue;
        }
        for (const entry of entries) codeMapEntries.push({ ...entry, declared_in: relative });
      }
    } catch (error) {
      diagnostics.push(diagnostic("error", "MARKDOWN_PARSE", error.message, relative));
    }
  }

  for (const artifact of artifacts.values()) {
    if (!profileDocument.data.owners?.includes(artifact.owner)) {
      diagnostics.push(diagnostic("error", "UNKNOWN_OWNER", `${artifact.id} uses undeclared owner ${artifact.owner}`, artifact.path));
    }
    for (const field of RELATION_FIELDS) {
      const targets = Array.isArray(artifact[field]) ? artifact[field] : [];
      for (const target of targets) {
        if (!artifacts.has(target)) {
          diagnostics.push(diagnostic("error", "DANGLING_REFERENCE", `${artifact.id}.${field} references missing ${target}`, artifact.path));
        }
      }
    }
    if (["implemented", "verified"].includes(artifact.implementation_status) && !artifact.section) {
      diagnostics.push(diagnostic("warning", "MISSING_SECTION", `${artifact.id} has no extractable heading section`, artifact.path));
    }
    if (["deprecated", "superseded"].includes(artifact.knowledge_status) && !(artifact.superseded_by || []).length && !artifact.deprecation_reason) {
      diagnostics.push(diagnostic("error", "DEPRECATION_TARGET", `${artifact.id} is ${artifact.knowledge_status} without superseded_by or deprecation_reason`, artifact.path));
    }
  }

  for (const [relative, document] of documents) {
    if (/changes[\\/]archive[\\/]/i.test(document.content)) diagnostics.push(diagnostic("error", "ARCHIVE_AS_TRUTH", "canonical knowledge references an archived change as current truth", relative));
  }

  validateCodeMap(root, profileDocument.data, artifacts, codeMapEntries, diagnostics);
  const sourceHash = hashFiles([profileFile, ...files], root);
  validateIndexFreshness(root, sourceHash, diagnostics);

  return {
    root,
    profile: profileDocument.data,
    profileDocument,
    files,
    documents,
    artifacts,
    codeMapEntries,
    diagnostics,
    sourceHash,
  };
}

function validateIndexFreshness(root, sourceHash, diagnostics) {
  const indexFile = path.join(root, "indexes", "artifacts.json");
  if (!fs.existsSync(indexFile)) {
    diagnostics.push(diagnostic("warning", "INDEX_MISSING", "generated artifact index is missing; run the index command", "indexes/artifacts.json"));
    return;
  }
  try {
    const index = JSON.parse(fs.readFileSync(indexFile, "utf8"));
    if (index.source_hash !== sourceHash) {
      diagnostics.push(diagnostic("error", "INDEX_STALE", "generated artifact index does not match canonical source; run the index command", "indexes/artifacts.json"));
    }
  } catch (error) {
    diagnostics.push(diagnostic("error", "INDEX_INVALID", `generated artifact index is invalid JSON: ${error.message}`, "indexes/artifacts.json"));
  }
}

function validateCodeMap(root, profile, artifacts, entries, diagnostics) {
  const seenPaths = new Map();
  const validRelations = new Set(["implements", "defines", "supports", "configures", "verifies", "migrates", "generates"]);
  for (const entry of entries) {
    if (!entry.path || !entry.kind || !entry.owner || !entry.relation) {
      diagnostics.push(diagnostic("error", "CODE_MAP_REQUIRED", "entry requires path, kind, owner, and relation", entry.declared_in));
      continue;
    }
    const normalized = toPosix(entry.path);
    if (seenPaths.has(normalized)) {
      diagnostics.push(diagnostic("error", "CODE_MAP_DUPLICATE", `${normalized} also mapped in ${seenPaths.get(normalized)}`, entry.declared_in));
    } else seenPaths.set(normalized, entry.declared_in);
    if (!validRelations.has(entry.relation)) {
      diagnostics.push(diagnostic("error", "CODE_MAP_RELATION", `${normalized} has invalid relation ${entry.relation}`, entry.declared_in));
    }
    const owners = Array.isArray(entry.owner) ? entry.owner : [entry.owner];
    for (const owner of owners) {
      if (!artifacts.has(owner)) diagnostics.push(diagnostic("error", "CODE_MAP_OWNER", `${normalized} references missing owner ${owner}`, entry.declared_in));
    }
  }

  const extensions = profile.code_extensions || [".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".cs", ".go", ".rs", ".kt", ".swift", ".dart"];
  const exclusions = profile.code_map_exclude || [];
  const actual = [];
  for (const sourceRoot of profile.source_roots || []) {
    const absoluteRoot = path.resolve(root, sourceRoot);
    for (const file of walkFiles(absoluteRoot, (candidate) => extensions.includes(path.extname(candidate).toLowerCase()))) {
      const relative = toPosix(path.relative(root, file));
      if (!matchesAny(relative, exclusions)) actual.push(relative);
    }
  }
  const mapped = new Set(entries.map((entry) => toPosix(entry.path)));
  for (const file of actual) {
    if (!mapped.has(file)) diagnostics.push(diagnostic("error", "UNMAPPED_SOURCE", `significant source file has no code-map owner: ${file}`, file));
  }
  for (const entry of entries) {
    const absolute = path.resolve(root, entry.path);
    if (entry.status !== "planned" && !fs.existsSync(absolute)) {
      diagnostics.push(diagnostic("error", "MAPPED_FILE_MISSING", `mapped ${entry.status || "current"} file does not exist: ${entry.path}`, entry.declared_in));
    }
  }
}

function scanChanges(projectRoot, artifactIds = new Set()) {
  const root = path.resolve(projectRoot);
  const changesRoot = path.join(root, "changes", "active");
  const files = walkFiles(changesRoot, (file) => path.basename(file) === "change.md");
  const { ajv } = loadSchemas();
  const validateChange = ajv.getSchema("royascaff/change/v1");
  const validateVerification = ajv.getSchema("royascaff/verification/v1");
  const changes = [];
  const diagnostics = [];
  for (const file of files) {
    const relative = toPosix(path.relative(root, file));
    try {
      const document = parseDocument(file);
      if (!validateChange(document.data)) {
        diagnostics.push(diagnostic("error", "CHANGE_SCHEMA", formatAjvErrors(validateChange.errors), relative));
        continue;
      }
      const newArtifacts = new Set(document.data.new_artifacts || []);
      for (const id of document.data.affects || []) {
        if (!artifactIds.has(id) && !newArtifacts.has(id)) {
          diagnostics.push(diagnostic("error", "CHANGE_ARTIFACT", `${document.data.id} affects missing ${id}`, relative));
        }
      }
      if (["reconciled", "abandoned"].includes(document.data.state)) diagnostics.push(diagnostic("error", "ACTIVE_TERMINAL_CHANGE", `${document.data.id} is terminal but remains under changes/active`, relative));
      const impactFile = path.join(path.dirname(file), "impact.md");
      if (!["draft"].includes(document.data.state) && !fs.existsSync(impactFile)) diagnostics.push(diagnostic("error", "IMPACT_MISSING", `${document.data.id} requires impact.md after draft`, relative));
      if (!["draft", "analyzed"].includes(document.data.state)) {
        const approvals = (document.data.approvals || []).filter((approval) => approval.outcome === "approved" && approval.subject_revision === document.data.base_revision);
        const minimum = ["high", "critical"].includes(document.data.risk) ? 2 : 1;
        if (approvals.length < minimum) diagnostics.push(diagnostic("error", "APPROVAL_MISSING", `${document.data.id} requires ${minimum} approval(s) for ${document.data.risk} risk and baseline ${document.data.base_revision}`, relative));
      }
      validateHistory(document.data, diagnostics, relative);
      const deltaRoot = path.join(path.dirname(file), "delta");
      for (const deltaFile of walkFiles(deltaRoot, (candidate) => candidate.endsWith(".md"))) {
        const deltaPath = toPosix(path.relative(deltaRoot, deltaFile));
        if (!isCanonicalDeltaPath(deltaPath)) diagnostics.push(diagnostic("error", "DELTA_TARGET", `delta target is outside canonical knowledge: ${deltaPath}`, toPosix(path.relative(root, deltaFile))));
      }
      if (["verified", "reconciled"].includes(document.data.state)) {
        const verificationFile = path.join(path.dirname(file), "verification.md");
        if (!fs.existsSync(verificationFile)) {
          diagnostics.push(diagnostic("error", "VERIFICATION_MISSING", `${document.data.id} is ${document.data.state} but has no verification.md`, relative));
        } else {
          const verification = parseDocument(verificationFile).data;
          if (!validateVerification(verification)) {
            diagnostics.push(diagnostic("error", "VERIFICATION_SCHEMA", formatAjvErrors(validateVerification.errors), toPosix(path.relative(root, verificationFile))));
          } else if (verification.change !== document.data.id || verification.overall !== "pass" || verification.deterministic.some((check) => check.outcome !== "pass") || verification.semantic.some((check) => ["fail", "blocked"].includes(check.outcome))) {
            diagnostics.push(diagnostic("error", "VERIFICATION_GATE", `${document.data.id} does not have passing, matching verification evidence`, toPosix(path.relative(root, verificationFile))));
          }
        }
      }
      changes.push({ ...document.data, path: relative, absolute: file, body: document.body });
    } catch (error) {
      diagnostics.push(diagnostic("error", "CHANGE_PARSE", error.message, relative));
    }
  }
  validateActiveConflicts(changes, diagnostics);
  return { changes, diagnostics };
}

function isCanonicalDeltaPath(relative) {
  const normalized = toPosix(relative);
  const parts = normalized.split("/");
  return (parts.length === 1 && ["profile.md", "system-map.md"].includes(parts[0])) || (parts.length > 1 && CANONICAL_DIRS.includes(parts[0]));
}

function validateHistory(change, diagnostics, relative) {
  const history = change.history || [];
  if (!history.length) {
    diagnostics.push(diagnostic("error", "CHANGE_HISTORY", `${change.id} has no lifecycle history`, relative));
    return;
  }
  if (history[history.length - 1].state !== change.state) diagnostics.push(diagnostic("error", "CHANGE_HISTORY", `${change.id} history does not end at current state ${change.state}`, relative));
  for (let index = 1; index < history.length; index += 1) {
    const prior = history[index - 1].state;
    const next = history[index].state;
    if (!(TRANSITIONS[prior] || []).includes(next)) diagnostics.push(diagnostic("error", "CHANGE_HISTORY", `${change.id} contains illegal transition ${prior} → ${next}`, relative));
  }
}

function validateActiveConflicts(changes, diagnostics) {
  const claims = new Map();
  for (const change of changes) {
    for (const [kind, values] of [["artifact", change.exclusive_artifacts || []], ["path", change.exclusive_paths || []]]) {
      for (const value of values) {
        const key = `${kind}:${value}`;
        if (claims.has(key)) diagnostics.push(diagnostic("error", "ACTIVE_CONFLICT", `${change.id} and ${claims.get(key)} both claim exclusive ${kind} ${value}`, change.path));
        else claims.set(key, change.id);
      }
    }
  }
}

function validateArchivePlacement(projectRoot) {
  const root = path.resolve(projectRoot);
  const diagnostics = [];
  const files = walkFiles(path.join(root, "changes", "archive"), (file) => path.basename(file) === "change.md");
  for (const file of files) {
    try {
      const document = parseDocument(file);
      if (!["reconciled", "abandoned"].includes(document.data.state)) diagnostics.push(diagnostic("error", "ARCHIVE_ACTIVE_CHANGE", `${document.data.id || path.basename(path.dirname(file))} is not terminal but is stored in archive`, toPosix(path.relative(root, file))));
    } catch (error) {
      diagnostics.push(diagnostic("error", "ARCHIVE_METADATA", error.message, toPosix(path.relative(root, file))));
    }
  }
  return diagnostics;
}

function scanTasks(projectRoot) {
  const root = path.resolve(projectRoot);
  const activeRoot = path.join(root, "changes", "active");
  const files = walkFiles(activeRoot, (file) => file.endsWith(".md") && toPosix(file).includes("/execution/tasks/"));
  const { ajv } = loadSchemas();
  const validateTask = ajv.getSchema("royascaff/task/v1");
  const tasks = [];
  const diagnostics = [];
  for (const file of files) {
    const relative = toPosix(path.relative(root, file));
    try {
      const document = parseDocument(file);
      if (!validateTask(document.data)) {
        diagnostics.push(diagnostic("error", "TASK_SCHEMA", formatAjvErrors(validateTask.errors), relative));
        continue;
      }
      tasks.push({ ...document.data, path: relative, absolute: file, body: document.body });
    } catch (error) {
      diagnostics.push(diagnostic("error", "TASK_PARSE", error.message, relative));
    }
  }
  return { tasks, diagnostics };
}

function validateProject(projectRoot) {
  const project = scanProject(projectRoot);
  const artifactIds = new Set(project.artifacts.keys());
  const changes = scanChanges(project.root, artifactIds);
  const tasks = scanTasks(project.root);
  for (const task of tasks.tasks) {
    for (const id of [...(task.required || []), ...(task.optional || [])]) {
      if (!artifactIds.has(id)) tasks.diagnostics.push(diagnostic("error", "TASK_ARTIFACT", `${task.id} references missing ${id}`, task.path));
    }
    const change = changes.changes.find((item) => item.id === task.change);
    if (!change) {
      tasks.diagnostics.push(diagnostic("error", "TASK_CHANGE", `${task.id} references missing change ${task.change}`, task.path));
    }
    for (const entry of task.planned_new_files || []) {
      if (typeof entry === "string") continue;
      if (!artifactIds.has(entry.owner) && !(change?.new_artifacts || []).includes(entry.owner)) tasks.diagnostics.push(diagnostic("error", "TASK_CODE_OWNER", `${task.id} planned file ${entry.path} references missing owner ${entry.owner}`, task.path));
      if (!["implements", "defines", "supports", "configures", "verifies", "migrates", "generates"].includes(entry.relation)) tasks.diagnostics.push(diagnostic("error", "TASK_CODE_RELATION", `${task.id} planned file ${entry.path} has invalid relation ${entry.relation}`, task.path));
    }
  }
  const diagnostics = [...project.diagnostics, ...changes.diagnostics, ...tasks.diagnostics, ...validateArchivePlacement(project.root)];
  validateChangeIndexFreshness(project.root, changes.changes, tasks.tasks, diagnostics);
  return { ...project, changes: changes.changes, tasks: tasks.tasks, diagnostics };
}

function activeWorkHash(projectRoot, changes, tasks) {
  return hashFiles([...changes.map((item) => item.absolute), ...tasks.map((item) => item.absolute)].filter(Boolean), projectRoot);
}

function validateChangeIndexFreshness(projectRoot, changes, tasks, diagnostics) {
  const indexFile = path.join(projectRoot, "indexes", "changes.json");
  if (!fs.existsSync(indexFile)) {
    diagnostics.push(diagnostic("warning", "CHANGE_INDEX_MISSING", "generated active-change index is missing; run the index command", "indexes/changes.json"));
    return;
  }
  try {
    const index = JSON.parse(fs.readFileSync(indexFile, "utf8"));
    if (index.source_hash !== activeWorkHash(projectRoot, changes, tasks)) diagnostics.push(diagnostic("error", "CHANGE_INDEX_STALE", "generated active-change index is stale; run the index command", "indexes/changes.json"));
  } catch (error) {
    diagnostics.push(diagnostic("error", "CHANGE_INDEX_INVALID", `generated active-change index is invalid JSON: ${error.message}`, "indexes/changes.json"));
  }
}

module.exports = {
  CANONICAL_DIRS,
  RELATION_FIELDS,
  activeWorkHash,
  diagnostic,
  scanChanges,
  scanProject,
  scanTasks,
  isCanonicalDeltaPath,
  validateProject,
};
