#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ID_SOURCE = "[A-Z][A-Z0-9]*(?:-[A-Z0-9]+){2,}";
const ID_GLOBAL = new RegExp(`\\b${ID_SOURCE}\\b`, "g");
const RECORD_HEADING = new RegExp(`^(#{2,6})\\s+(${ID_SOURCE})\\s+[·—-]\\s+(.+)$`, "gm");
const KNOWLEDGE_STATUSES = new Set(["draft", "in-review", "approved", "deprecated", "superseded"]);
const IMPLEMENTATION_STATUSES = new Set(["not-planned", "planned", "partial", "implemented", "verified", "not-applicable"]);
const CHANGE_STATUSES = new Set(["draft", "analyzed", "approved", "ready", "in-progress", "failed", "verified", "reconciled", "closed", "blocked", "cancelled"]);
const DECISION_STATUSES = new Set(["proposed", "decided", "approved-assumption", "delegated", "blocked", "superseded"]);
const MATERIALITIES = new Set(["non-material", "material", "critical"]);
const REVIEW_DISPOSITIONS = new Set(["pass", "pass-with-conditions", "revise"]);
const REVIEW_TYPES = new Set(["solution-quality", "implementation-readiness"]);
const EVIDENCE_RESULTS = new Set(["pass", "fail", "inconclusive", "manual-required", "not-applicable", "stale"]);
const AUTHORITY_CLASSES = new Set(["implementer-self-check", "fresh-context-reviewer", "independent-model", "independent-person", "deterministic-runner", "stakeholder-owner"]);
const ADOPTION_MODES = new Set(["legacy-compatible", "transition", "strict"]);
const GATE_TYPES = new Set(["solution-quality-review", "implementation-readiness-review"]);
const SKIP_DIRS = new Set([".git", "node_modules"]);

function slash(value) {
  return value.replace(/\\/g, "/");
}

function walkFiles(root, predicate = () => true) {
  const found = [];
  if (!fs.existsSync(root)) return found;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full)) found.push(full);
    }
  }
  return found.sort();
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseScalar(item));
  }
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

function parseFrontmatter(raw) {
  const normalized = raw.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---\n") && !normalized.startsWith("---\r\n")) {
    return { data: {}, body: raw, endOffset: 0 };
  }
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw, endOffset: 0, error: "Unclosed YAML front matter" };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (keyMatch) data[keyMatch[1]] = parseScalar(keyMatch[2]);
  }
  return { data, body: normalized.slice(match[0].length), endOffset: match[0].length };
}

function metadataValue(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = block.match(new RegExp(`^- \\*\\*${escaped}:\\*\\*\\s*(.+)$`, "mi"));
  return match ? match[1].trim() : "";
}

function cleanMetadata(value) {
  return String(value || "").trim().replace(/^`|`$/g, "");
}

function metadataList(block, label) {
  const raw = metadataValue(block, label).replace(/^\[|\]$/g, "");
  if (!raw.trim()) return [];
  return [...new Set(raw.split(",").map((item) => cleanMetadata(item)).filter(Boolean))];
}

function isDecisionRecord(id) {
  return /^(DEC|ASM|RDR|PAT)-/.test(typeof id === "string" ? id : id.id);
}

function isMaterial(record) {
  return record.materiality === "material" || record.materiality === "critical";
}

function modeFor(scan, change) {
  const profile = scan.documents.find((doc) => doc.relativeFile === "profile.md");
  return String(change?.data?.adoption_mode || profile?.data?.adoption_mode || "legacy-compatible");
}

function isActiveChange(change) {
  return change.relativeFile.startsWith("changes/active/");
}

function changeDirectory(change) {
  return slash(path.posix.dirname(change.relativeFile));
}

function recordsForChange(scan, change) {
  const dir = `${changeDirectory(change)}/`;
  return scan.records.filter((record) => record.relativeFile.startsWith(dir) || record.relativeFile === change.relativeFile);
}

function hashSelectedRecords(recordMap, ids) {
  const hash = crypto.createHash("sha256");
  for (const id of [...new Set(ids)].sort()) {
    const record = recordMap.get(id);
    if (!record) continue;
    hash.update(id);
    hash.update("\0");
    hash.update(record.block);
    hash.update("\0");
  }
  return hash.digest("hex");
}

function hashSourcePaths(projectRoot, paths) {
  const hash = crypto.createHash("sha256");
  for (const item of [...new Set(paths)].sort()) {
    const absolute = path.resolve(projectRoot, item);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return "";
    hash.update(slash(item));
    hash.update("\0");
    hash.update(fs.readFileSync(absolute));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function parseRecords(raw, file, projectRoot) {
  const matches = [...raw.matchAll(RECORD_HEADING)];
  const records = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const start = match.index;
    const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
    const block = raw.slice(start, end).trim();
    const id = match[2];
    const refs = [...new Set((block.match(ID_GLOBAL) || []).filter((ref) => ref !== id))];
    const verifiedByRaw = metadataValue(block, "Verified by");
    const verifiedBy = [...new Set(verifiedByRaw.match(ID_GLOBAL) || [])];
    records.push({
      id,
      title: match[3].trim(),
      kind: metadataValue(block, "Kind"),
      knowledgeStatus: metadataValue(block, "Knowledge status"),
      implementationStatus: metadataValue(block, "Implementation status"),
      owner: metadataValue(block, "Owner"),
      refs,
      verifiedBy,
      decisionStatus: cleanMetadata(metadataValue(block, "Decision status")),
      materiality: cleanMetadata(metadataValue(block, "Materiality")),
      authority: cleanMetadata(metadataValue(block, "Authority")),
      consequence: metadataValue(block, "Consequence"),
      reviewPoint: metadataValue(block, "Review point"),
      priority: cleanMetadata(metadataValue(block, "Priority")),
      foundation: cleanMetadata(metadataValue(block, "Foundation")),
      outcome: metadataValue(block, "Outcome"),
      method: cleanMetadata(metadataValue(block, "Method")),
      authorityClass: cleanMetadata(metadataValue(block, "Authority class")),
      thresholdAuthority: cleanMetadata(metadataValue(block, "Threshold authority")),
      disposition: cleanMetadata(metadataValue(block, "Disposition")),
      sourceAspect: metadataValue(block, "Source aspect"),
      observation: metadataValue(block, "Observation"),
      interpretation: metadataValue(block, "Interpretation"),
      rationale: metadataValue(block, "Rationale"),
      confidence: cleanMetadata(metadataValue(block, "Confidence")),
      problem: metadataValue(block, "Problem"),
      forces: metadataList(block, "Forces"),
      choice: metadataValue(block, "Choice"),
      alternatives: metadataList(block, "Alternatives"),
      constraints: metadataList(block, "Constraints"),
      failureModes: metadataList(block, "Failure modes"),
      validation: metadataValue(block, "Validation"),
      reviewType: cleanMetadata(metadataValue(block, "Review type")),
      reviewedInputs: metadataList(block, "Reviewed inputs"),
      inputFingerprint: cleanMetadata(metadataValue(block, "Input fingerprint")),
      taskClass: cleanMetadata(metadataValue(block, "Task class")),
      contextTier: cleanMetadata(metadataValue(block, "Context tier")),
      escalation: metadataValue(block, "Escalation"),
      dependsOn: metadataList(block, "Depends on"),
      criterionId: cleanMetadata(metadataValue(block, "Criterion")),
      result: cleanMetadata(metadataValue(block, "Result")),
      freshness: cleanMetadata(metadataValue(block, "Freshness")),
      sourceFingerprint: cleanMetadata(metadataValue(block, "Source fingerprint")),
      sourcePaths: metadataList(block, "Source paths"),
      expected: metadataValue(block, "Expected"),
      actual: metadataValue(block, "Actual"),
      executor: metadataValue(block, "Executor"),
      adjudicator: metadataValue(block, "Adjudicator"),
      environment: metadataValue(block, "Environment"),
      block,
      file,
      relativeFile: slash(path.relative(projectRoot, file)),
      line: raw.slice(0, start).split(/\r?\n/).length,
    });
  }
  return records;
}

function isGenerated(relative) {
  return relative === "generated" || relative.startsWith("generated/") || relative.startsWith("contexts/generated/");
}

function isCanonical(relative) {
  return relative === "system-map.md" || relative === "profile.md" || relative.startsWith("knowledge/") || relative.startsWith("releases/") || relative.startsWith("incidents/");
}

function scanProject(projectRoot) {
  const markdownFiles = walkFiles(projectRoot, (file) => file.toLowerCase().endsWith(".md"));
  const documents = [];
  const changes = [];
  const manifests = [];
  const records = [];
  const rawByFile = new Map();
  const frontmatterByFile = new Map();

  for (const file of markdownFiles) {
    const relative = slash(path.relative(projectRoot, file));
    if (isGenerated(relative)) continue;
    const raw = fs.readFileSync(file, "utf8");
    rawByFile.set(file, raw);
    const frontmatter = parseFrontmatter(raw);
    frontmatterByFile.set(file, frontmatter);
    if (frontmatter.data.document_id) {
      documents.push({ id: String(frontmatter.data.document_id), file, relativeFile: relative, data: frontmatter.data });
    }
    if (frontmatter.data.change_id && (frontmatter.data.status || path.basename(file) === "change.md")) {
      changes.push({ id: String(frontmatter.data.change_id), file, relativeFile: relative, data: frontmatter.data });
    }
    if (frontmatter.data.manifest_id) {
      manifests.push({ id: String(frontmatter.data.manifest_id), file, relativeFile: relative, data: frontmatter.data });
    }
    records.push(...parseRecords(raw, file, projectRoot));
  }

  return { projectRoot, markdownFiles, documents, changes, manifests, records, rawByFile, frontmatterByFile };
}

function scanEngineAdapters() {
  const adapterRoot = path.resolve(__dirname, "..", "adapters");
  const adapters = new Map();
  for (const file of walkFiles(adapterRoot, (candidate) => candidate.toLowerCase().endsWith(".md"))) {
    const parsed = parseFrontmatter(fs.readFileSync(file, "utf8"));
    if (!parsed.data.adapter_id) continue;
    const adapter = {
      id: String(parsed.data.adapter_id),
      version: String(parsed.data.adapter_version || ""),
      axes: Array.isArray(parsed.data.axes) ? parsed.data.axes.map(String) : [],
      requires: Array.isArray(parsed.data.requires) ? parsed.data.requires.map(String) : [],
      incompatible: Array.isArray(parsed.data.incompatible_with) ? parsed.data.incompatible_with.map(String) : [],
      precedence: Number(parsed.data.precedence),
      file,
    };
    adapters.set(adapter.id, adapter);
  }
  return adapters;
}

function validateAdapters(scan, issues, warnings) {
  const profile = scan.documents.find((doc) => doc.relativeFile === "profile.md");
  if (!profile) return;
  const mode = String(profile.data.adoption_mode || "legacy-compatible");
  if (!ADOPTION_MODES.has(mode)) issues.push(`[MODE] Project profile has invalid adoption_mode ${mode}`);
  const selected = Array.isArray(profile.data.adapters) ? profile.data.adapters.map(String) : ["generic"];
  const catalog = scanEngineAdapters();
  for (const adapter of catalog.values()) {
    if (!adapter.version || !adapter.axes.length || !Number.isInteger(adapter.precedence)) issues.push(`[ADP-MANIFEST] Adapter ${adapter.id} has an incomplete manifest`);
    for (const axis of adapter.axes) if (!/^[a-z][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/.test(axis)) issues.push(`[ADP-MANIFEST] Adapter ${adapter.id} has invalid axis ${axis}`);
  }
  if (!selected.includes("generic")) {
    const message = "[ADP-GENERIC] Project profile must select baseline adapter generic";
    if (mode === "strict") issues.push(message); else warnings.push(message);
  }
  for (const id of selected) {
    const adapter = catalog.get(id);
    if (!adapter) {
      const message = `[ADP-UNKNOWN] Selected adapter ${id} has no engine manifest`;
      if (mode === "strict") issues.push(message); else warnings.push(message);
      continue;
    }
    for (const required of adapter.requires) {
      if (!selected.includes(required)) issues.push(`[ADP-REQUIRES] Adapter ${id} requires ${required}`);
    }
    for (const conflict of adapter.incompatible) {
      if (selected.includes(conflict)) issues.push(`[ADP-CONFLICT] Adapter ${id} conflicts with ${conflict}`);
    }
  }
}

function validateQualityContracts(scan, knownIds, issues, warnings) {
  const recordMap = new Map(scan.records.map((record) => [record.id, record]));

  for (const record of scan.records) {
    if (isDecisionRecord(record.id)) {
      if (record.decisionStatus && !DECISION_STATUSES.has(record.decisionStatus)) issues.push(`[DEC-STATUS] ${record.id} has invalid Decision status ${record.decisionStatus}`);
      if (record.materiality && !MATERIALITIES.has(record.materiality)) issues.push(`[DEC-MATERIALITY] ${record.id} has invalid Materiality ${record.materiality}`);
      if (record.decisionStatus === "approved-assumption" && (!record.authority || !record.consequence || !record.reviewPoint)) issues.push(`[ASM-AUTHORITY] ${record.id} approved assumption requires Authority, Consequence, and Review point`);
    }
    if (record.id.startsWith("CRIT-")) {
      if (record.priority && !new Set(["must", "should", "may"]).has(record.priority)) issues.push(`[CRIT-PRIORITY] ${record.id} has invalid Priority ${record.priority}`);
      if (record.foundation && !new Set(["yes", "no"]).has(record.foundation)) issues.push(`[CRIT-FOUNDATION] ${record.id} has invalid Foundation ${record.foundation}`);
      if (record.authorityClass && !AUTHORITY_CLASSES.has(record.authorityClass)) issues.push(`[CRIT-AUTHORITY] ${record.id} has invalid Authority class ${record.authorityClass}`);
      if (record.thresholdAuthority && !new Set(["owner", "existing-standard", "adapter-recommended", "regulation", "approved-assumption"]).has(record.thresholdAuthority)) issues.push(`[CRIT-THRESHOLD] ${record.id} has invalid Threshold authority ${record.thresholdAuthority}`);
    }
    if (record.id.startsWith("RDR-") && record.disposition && !new Set(["retain", "adapt", "reject", "unresolved"]).has(record.disposition)) {
      issues.push(`[RDR-DISPOSITION] ${record.id} has invalid Disposition ${record.disposition}`);
    }
    if (record.id.startsWith("REV-")) {
      if (!REVIEW_TYPES.has(record.reviewType)) issues.push(`[REV-TYPE] ${record.id} has invalid or missing Review type`);
      if (!REVIEW_DISPOSITIONS.has(record.disposition)) issues.push(`[REV-DISPOSITION] ${record.id} has invalid or missing Disposition`);
      if (!AUTHORITY_CLASSES.has(record.authorityClass)) issues.push(`[REV-AUTHORITY] ${record.id} has invalid or missing Authority class`);
      if (!record.reviewedInputs.length) issues.push(`[REV-INPUT] ${record.id} has no Reviewed inputs`);
      for (const id of record.reviewedInputs) if (!knownIds.has(id)) issues.push(`[REV-INPUT] ${record.id} reviews missing ID ${id}`);
      if (record.reviewedInputs.length && record.inputFingerprint) {
        const current = hashSelectedRecords(recordMap, record.reviewedInputs);
        if (current !== record.inputFingerprint) issues.push(`[REV-STALE] ${record.id} reviewed inputs changed; expected ${record.inputFingerprint.slice(0, 12)}, current ${current.slice(0, 12)}`);
      }
    }
    if (record.id.startsWith("EVD-")) {
      if (record.result && !EVIDENCE_RESULTS.has(record.result)) issues.push(`[EVD-RESULT] ${record.id} has invalid Result ${record.result}`);
      if (record.authorityClass && !AUTHORITY_CLASSES.has(record.authorityClass)) issues.push(`[EVD-AUTHORITY] ${record.id} has invalid Authority class ${record.authorityClass}`);
      if (record.sourcePaths.length && record.sourceFingerprint) {
        const current = hashSourcePaths(scan.projectRoot, record.sourcePaths);
        if (!current) issues.push(`[EVD-SOURCE] ${record.id} has a missing Source paths entry`);
        else if (current !== record.sourceFingerprint) issues.push(`[EVD-STALE] ${record.id} source fingerprint is stale; expected ${record.sourceFingerprint.slice(0, 12)}, current ${current.slice(0, 12)}`);
      }
      if (record.result === "pass" && record.freshness !== "fresh") issues.push(`[EVD-FRESHNESS] ${record.id} PASS requires Freshness fresh`);
      if (record.result === "pass" && (!record.sourceFingerprint || !record.expected || !record.actual || !record.method || !record.executor || !record.adjudicator || !record.environment || !record.criterionId)) {
        issues.push(`[EVD-BINDING] ${record.id} PASS is missing criterion/source/method/expected/actual/environment/executor/adjudicator metadata`);
      }
    }
  }

  for (const change of scan.changes.filter(isActiveChange)) {
    const mode = modeFor(scan, change);
    if (!ADOPTION_MODES.has(mode)) issues.push(`[MODE] Change ${change.id} has invalid adoption mode ${mode}`);
    if (mode === "legacy-compatible") continue;
    const data = change.data;
    for (const field of ["uncertainty", "judgment", "artifact_mode", "selected_adapters"]) {
      if (data[field] === undefined || (Array.isArray(data[field]) && !data[field].length)) issues.push(`[CHG-QBD] Change ${change.id} missing ${field}`);
    }
    const engineAdapters = scanEngineAdapters();
    const projectProfile = scan.documents.find((doc) => doc.relativeFile === "profile.md");
    const projectAdapters = Array.isArray(projectProfile?.data?.adapters) ? projectProfile.data.adapters.map(String) : ["generic"];
    const changeAdapters = Array.isArray(data.selected_adapters) ? data.selected_adapters.map(String) : [];
    for (const id of changeAdapters) {
      if (!engineAdapters.has(id)) issues.push(`[CHG-ADAPTER] Change ${change.id} selects unknown adapter ${id}`);
      if (!projectAdapters.includes(id)) issues.push(`[CHG-ADAPTER] Change ${change.id} selects ${id}, which is not enabled by profile`);
    }
    if (data.uncertainty && !new Set(["low", "medium", "high"]).has(String(data.uncertainty))) issues.push(`[CHG-QBD] Change ${change.id} has invalid uncertainty`);
    if (data.judgment && !new Set(["low", "medium", "high"]).has(String(data.judgment))) issues.push(`[CHG-QBD] Change ${change.id} has invalid judgment`);
    if (data.artifact_mode && !new Set(["compact", "standard", "rigorous"]).has(String(data.artifact_mode))) issues.push(`[CHG-QBD] Change ${change.id} has invalid artifact_mode`);
    const requiredGates = Array.isArray(data.required_gates) ? data.required_gates.map(String) : [];
    for (const gate of requiredGates) if (!GATE_TYPES.has(gate)) issues.push(`[CHG-GATE] Change ${change.id} has unknown gate ${gate}`);
    const highJudgment = data.judgment === "high" || data.risk === "high" || data.risk === "critical" || data.artifact_mode === "rigorous";
    if ((highJudgment || data.artifact_mode === "standard") && !requiredGates.includes("solution-quality-review")) issues.push(`[CHG-GATE] Change ${change.id} requires solution-quality-review`);
    if ((highJudgment || data.artifact_mode === "standard") && !requiredGates.includes("implementation-readiness-review")) issues.push(`[CHG-GATE] Change ${change.id} requires implementation-readiness-review`);

    const records = recordsForChange(scan, change);
    const readyLike = new Set(["ready", "in-progress", "verified", "reconciled", "closed"]).has(String(data.status));
    if (!readyLike) continue;
    if (!records.some((record) => record.id.startsWith("CRIT-") && record.priority === "must")) issues.push(`[QDC-MISSING] Ready change ${change.id} has no must CRIT quality outcome`);
    for (const record of records.filter(isDecisionRecord)) {
      if (!record.decisionStatus || !record.materiality) issues.push(`[DEC-COMPLETE] ${record.id} requires Decision status and Materiality before ${change.id} is ready`);
      if (isMaterial(record) && !new Set(["decided", "approved-assumption", "superseded"]).has(record.decisionStatus)) issues.push(`[DEC-BLOCKED] Material ${record.id} is ${record.decisionStatus || "undecided"}; ${change.id} cannot be ready`);
      if (record.id.startsWith("RDR-") && isMaterial(record)) {
        if (!record.sourceAspect || !record.observation || !record.interpretation || !record.rationale || !record.confidence || !record.disposition) issues.push(`[RDR-COMPLETE] Material ${record.id} requires Source aspect, Observation, Interpretation, Rationale, Confidence, and Disposition`);
        if (!record.refs.some((id) => id.startsWith("CRIT-"))) issues.push(`[RDR-TRACE] Material ${record.id} must trace to a CRIT record`);
        if (!records.some((task) => task.id.startsWith("TASK-") && task.refs.includes(record.id))) issues.push(`[RDR-TASK] Material ${record.id} is not included by a task`);
      }
      if (record.id.startsWith("PAT-") && isMaterial(record) && (!record.problem || !record.forces.length || !record.choice || !record.rationale || !record.alternatives.length || !record.constraints.length || !record.failureModes.length || !record.validation)) {
        issues.push(`[PAT-COMPLETE] Material ${record.id} requires Problem, Forces, Choice, Rationale, Alternatives, Constraints, Failure modes, and Validation`);
      }
    }
    for (const criterion of records.filter((record) => record.id.startsWith("CRIT-") && record.priority === "must")) {
      if (!criterion.outcome || !criterion.method || !criterion.authorityClass || !criterion.thresholdAuthority || !criterion.foundation) issues.push(`[CRIT-COMPLETE] Must ${criterion.id} requires Outcome, Method, Authority class, Threshold authority, and Foundation`);
      if (!records.some((task) => task.id.startsWith("TASK-") && task.refs.includes(criterion.id))) issues.push(`[CRIT-TASK] Must ${criterion.id} is not owned by an execution task`);
    }
    const tasks = records.filter((record) => record.id.startsWith("TASK-"));
    for (const task of tasks) {
      if (!new Set(["foundation", "optional"]).has(task.taskClass) || !new Set(["compact", "standard", "rigorous"]).has(task.contextTier) || !task.escalation) issues.push(`[TASK-COMPLETE] ${task.id} requires Task class, Context tier, and Escalation`);
      if (!task.refs.some((id) => id.startsWith("CRIT-"))) issues.push(`[TASK-OUTCOME] ${task.id} must reference at least one CRIT outcome`);
    }
    const foundationIds = new Set(tasks.filter((task) => task.taskClass === "foundation").map((task) => task.id));
    for (const task of tasks.filter((candidate) => candidate.taskClass === "optional")) {
      if (foundationIds.size && !task.dependsOn.some((id) => foundationIds.has(id))) issues.push(`[TASK-ORDER] Optional ${task.id} must depend on an applicable foundation task`);
    }
    const reviews = records.filter((record) => record.id.startsWith("REV-"));
    for (const gate of requiredGates) {
      const reviewType = gate === "solution-quality-review" ? "solution-quality" : "implementation-readiness";
      const review = reviews.find((candidate) => candidate.reviewType === reviewType && new Set(["pass", "pass-with-conditions"]).has(candidate.disposition));
      if (!review) issues.push(`[REV-GATE] Change ${change.id} is ${data.status} without a passing ${reviewType} review`);
      else if (!review.inputFingerprint) issues.push(`[REV-FINGERPRINT] ${review.id} must bind exact reviewed inputs before ${change.id} is ready`);
      else if (highJudgment && review.authorityClass === "implementer-self-check") issues.push(`[REV-INDEPENDENCE] High-judgment ${change.id} cannot use implementer-self-check for ${reviewType}`);
    }
  }

  for (const record of scan.records.filter((item) => item.id.startsWith("CRIT-") && item.priority === "must" && !item.outcome)) {
    warnings.push(`[CRIT-OUTCOME] ${record.id} is must but has no explicit Outcome metadata`);
  }
}

function addUnique(map, id, source, issues) {
  if (map.has(id)) issues.push(`Duplicate ID ${id}: ${map.get(id)} and ${source}`);
  else map.set(id, source);
}

function validateLinks(scan, issues) {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const [file, raw] of scan.rawByFile.entries()) {
    for (const match of raw.matchAll(linkPattern)) {
      let target = match[1].trim();
      if (!target || target.startsWith("#") || /^(https?:|mailto:)/i.test(target)) continue;
      if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
      target = target.split("#")[0];
      if (!target) continue;
      const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
      if (!fs.existsSync(resolved)) issues.push(`Broken link in ${slash(path.relative(scan.projectRoot, file))}: ${target}`);
    }
  }
}

function validateCodeMap(scan, issues) {
  const profile = scan.documents.find((doc) => doc.relativeFile === "profile.md");
  if (!profile) return;
  const roots = Array.isArray(profile.data.source_roots) ? profile.data.source_roots : [];
  const extensions = new Set(Array.isArray(profile.data.source_extensions) ? profile.data.source_extensions : []);
  const codeMapFiles = [...scan.rawByFile.entries()].filter(([file]) => slash(path.relative(scan.projectRoot, file)).startsWith("knowledge/05-implementation/code-map/"));
  const codeMapText = codeMapFiles.map(([, raw]) => raw).join("\n");
  for (const root of roots) {
    const absoluteRoot = path.resolve(scan.projectRoot, String(root));
    if (!fs.existsSync(absoluteRoot)) {
      issues.push(`Source root does not exist: ${root}`);
      continue;
    }
    const files = walkFiles(absoluteRoot, (file) => !extensions.size || extensions.has(path.extname(file)));
    for (const file of files) {
      const relative = slash(path.relative(scan.projectRoot, file));
      if (!codeMapText.includes(`\`${relative}\``)) issues.push(`Unmapped source file: ${relative}`);
    }
  }
}

function validateManifests(scan, knownIds, issues) {
  for (const manifest of scan.manifests) {
    const roots = Array.isArray(manifest.data.root_ids) ? manifest.data.root_ids.map(String) : [];
    const includes = Array.isArray(manifest.data.include_ids) ? manifest.data.include_ids.map(String) : [];
    if (!roots.length) issues.push(`Context manifest ${manifest.id} has no root_ids`);
    if (manifest.data.overflow !== "fail-and-split") issues.push(`Context manifest ${manifest.id} must use overflow: fail-and-split`);
    if (!Number.isInteger(manifest.data.max_tokens) || manifest.data.max_tokens < 1000) issues.push(`Context manifest ${manifest.id} has invalid max_tokens`);
    for (const id of [...roots, ...includes]) {
      if (!knownIds.has(id)) issues.push(`Context manifest ${manifest.id} references missing ID ${id}`);
    }
    const reviewIds = Array.isArray(manifest.data.review_ids) ? manifest.data.review_ids.map(String) : [];
    for (const id of reviewIds) {
      if (!knownIds.has(id)) issues.push(`[CTX-REVIEW] Context manifest ${manifest.id} references missing review ${id}`);
    }
    if (manifest.data.role === "implementer") {
      const records = new Map(scan.records.map((record) => [record.id, record]));
      const taskIds = roots.filter((id) => id.startsWith("TASK-"));
      for (const taskId of taskIds) {
        const task = records.get(taskId);
        if (!task) continue;
        const required = task.refs.filter((id) => /^(CRIT|DEC|RDR|PAT)-/.test(id));
        for (const id of required) if (!includes.includes(id)) issues.push(`[CTX-TRACE] Implementer manifest ${manifest.id} omits task decision ${id}`);
      }
    }
    const docs = Array.isArray(manifest.data.include_documents) ? manifest.data.include_documents : [];
    for (const doc of docs) {
      if (!fs.existsSync(path.resolve(scan.projectRoot, String(doc)))) issues.push(`Context manifest ${manifest.id} references missing document ${doc}`);
    }
  }
}

function validateProject(projectRoot) {
  const scan = scanProject(projectRoot);
  const issues = [];
  const warnings = [];
  const known = new Map();

  if (!fs.existsSync(path.join(projectRoot, "system-map.md"))) issues.push("Missing system-map.md");
  if (!fs.existsSync(path.join(projectRoot, "profile.md"))) issues.push("Missing profile.md");

  for (const document of scan.documents) {
    addUnique(known, document.id, document.relativeFile, issues);
    if (isCanonical(document.relativeFile)) {
      if (!document.data.title) issues.push(`Canonical document ${document.relativeFile} missing title`);
      if (!document.data.layer) issues.push(`Canonical document ${document.relativeFile} missing layer`);
      if (!document.data.schema_version) issues.push(`Canonical document ${document.relativeFile} missing schema_version`);
      if (!KNOWLEDGE_STATUSES.has(String(document.data.document_status))) issues.push(`Canonical document ${document.relativeFile} has invalid document_status`);
      if (!Array.isArray(document.data.owners) || !document.data.owners.length) issues.push(`Canonical document ${document.relativeFile} missing owners`);
    }
  }

  for (const change of scan.changes) {
    addUnique(known, change.id, change.relativeFile, issues);
    if (!CHANGE_STATUSES.has(String(change.data.status))) issues.push(`Change ${change.id} has invalid status`);
    if (!change.data.intent || !change.data.risk || !change.data.baseline_revision) issues.push(`Change ${change.id} missing intent, risk, or baseline_revision`);
  }

  for (const record of scan.records) {
    addUnique(known, record.id, `${record.relativeFile}:${record.line}`, issues);
    if (!record.kind) issues.push(`${record.id} missing Kind at ${record.relativeFile}:${record.line}`);
    if (!KNOWLEDGE_STATUSES.has(record.knowledgeStatus)) issues.push(`${record.id} has invalid Knowledge status at ${record.relativeFile}:${record.line}`);
    if (!IMPLEMENTATION_STATUSES.has(record.implementationStatus)) issues.push(`${record.id} has invalid Implementation status at ${record.relativeFile}:${record.line}`);
    if (!record.owner) issues.push(`${record.id} missing Owner at ${record.relativeFile}:${record.line}`);
  }

  const knownIds = new Set(known.keys());
  for (const record of scan.records) {
    for (const ref of record.refs) {
      if (!knownIds.has(ref)) issues.push(`${record.id} references missing ID ${ref} at ${record.relativeFile}:${record.line}`);
    }
  }

  validateManifests(scan, knownIds, issues);
  validateAdapters(scan, issues, warnings);
  validateQualityContracts(scan, knownIds, issues, warnings);
  validateLinks(scan, issues);
  validateCodeMap(scan, issues);
  return { scan, issues, warnings, knownIds };
}

function hashCanonical(scan) {
  const hash = crypto.createHash("sha256");
  const canonical = [...scan.rawByFile.entries()]
    .filter(([file]) => isCanonical(slash(path.relative(scan.projectRoot, file))))
    .sort(([a], [b]) => a.localeCompare(b));
  for (const [file, raw] of canonical) {
    hash.update(slash(path.relative(scan.projectRoot, file)));
    hash.update("\0");
    hash.update(raw);
    hash.update("\0");
  }
  return hash.digest("hex");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rewriteLocalLinks(markdown, sourceFile, outputFile) {
  return markdown.replace(/(\[[^\]]*\]\()([^)]+)(\))/g, (whole, open, rawTarget, close) => {
    let target = rawTarget.trim();
    if (!target || target.startsWith("#") || /^(https?:|mailto:)/i.test(target)) return whole;
    const angle = target.startsWith("<") && target.endsWith(">");
    if (angle) target = target.slice(1, -1);
    const hashIndex = target.indexOf("#");
    const targetPath = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
    const anchor = hashIndex >= 0 ? target.slice(hashIndex) : "";
    if (!targetPath) return whole;
    const resolved = path.resolve(path.dirname(sourceFile), decodeURIComponent(targetPath));
    const relative = slash(path.relative(path.dirname(outputFile), resolved)) || ".";
    const rewritten = `${relative}${anchor}`;
    return `${open}${angle || rewritten.includes(" ") ? `<${rewritten}>` : rewritten}${close}`;
  });
}

function generateIndexes(projectRoot, scan) {
  const generated = path.join(projectRoot, "generated");
  ensureDir(generated);
  const projectHash = hashCanonical(scan);
  const normalized = scan.records.map((record) => ({
    id: record.id,
    kind: record.kind,
    title: record.title,
    knowledge_status: record.knowledgeStatus,
    implementation_status: record.implementationStatus,
    owner: record.owner,
    relations: record.refs,
    verified_by: record.verifiedBy,
    decision_status: record.decisionStatus || undefined,
    materiality: record.materiality || undefined,
    priority: record.priority || undefined,
    foundation: record.foundation || undefined,
    review_type: record.reviewType || undefined,
    disposition: record.disposition || undefined,
    result: record.result || undefined,
    freshness: record.freshness || undefined,
    source: `${record.relativeFile}:${record.line}`,
  })).sort((a, b) => a.id.localeCompare(b.id));

  fs.writeFileSync(path.join(generated, "artifacts.json"), `${JSON.stringify({ generated: true, schema_version: 1, project_hash: projectHash, artifacts: normalized }, null, 2)}\n`);

  const artifactLines = [
    "# Generated Artifact Index",
    "",
    "> Generated by `sdlc.js index`. Do not edit manually.",
    "",
    `Project hash: \`${projectHash}\``,
    "",
    "| ID | Kind | Knowledge | Implementation | Owner | Source |",
    "|----|------|-----------|----------------|-------|--------|",
    ...normalized.map((item) => `| \`${item.id}\` | ${item.kind} | ${item.knowledge_status} | ${item.implementation_status} | ${item.owner} | \`${item.source}\` |`),
    "",
  ];
  fs.writeFileSync(path.join(generated, "artifacts.md"), artifactLines.join("\n"));

  const counts = new Map();
  for (const item of normalized) counts.set(item.implementation_status, (counts.get(item.implementation_status) || 0) + 1);
  const statusLines = [
    "# Generated Status",
    "",
    "> Generated by `sdlc.js index`. Do not edit manually.",
    "",
    `Project hash: \`${projectHash}\``,
    "",
    "| Implementation status | Count |",
    "|-----------------------|------:|",
    ...[...counts.entries()].sort().map(([status, count]) => `| ${status} | ${count} |`),
    "",
  ];
  fs.writeFileSync(path.join(generated, "status.md"), statusLines.join("\n"));

  const traceable = normalized.filter((item) => /^(REQ|NFR|INV)-/.test(item.id));
  const traceLines = [
    "# Generated Traceability View",
    "",
    "> Generated by `sdlc.js index`. Do not edit manually.",
    "",
    `Project hash: \`${projectHash}\``,
    "",
    "| Requirement / invariant | Kind | Implementation | Related artifacts | Verification targets | Source |",
    "|-------------------------|------|----------------|-------------------|----------------------|--------|",
    ...traceable.map((item) => `| \`${item.id}\` | ${item.kind} | ${item.implementation_status} | ${item.relations.filter((id) => !item.verified_by.includes(id)).map((id) => `\`${id}\``).join(", ") || "—"} | ${item.verified_by.map((id) => `\`${id}\``).join(", ") || "—"} | \`${item.source}\` |`),
    "",
  ];
  fs.writeFileSync(path.join(generated, "traceability.md"), traceLines.join("\n"));

  const changes = scan.changes.map((change) => ({ id: change.id, status: change.data.status, intent: change.data.intent, risk: change.data.risk, file: change.relativeFile })).sort((a, b) => a.id.localeCompare(b.id));
  const changeLines = [
    "# Generated Change Index",
    "",
    "> Generated by `sdlc.js index`. Do not edit manually.",
    "",
    "| Change | Status | Intent | Risk | Source |",
    "|--------|--------|--------|------|--------|",
    ...changes.map((change) => `| \`${change.id}\` | ${change.status} | ${change.intent} | ${change.risk} | \`${change.file}\` |`),
    "",
  ];
  fs.writeFileSync(path.join(generated, "changes.md"), changeLines.join("\n"));

  const qualityRecords = normalized.filter((item) => /^(DEC|ASM|CRIT|RDR|PAT)-/.test(item.id));
  const qualityLines = [
    "# Generated Quality Contract View",
    "",
    "> Generated by `sdlc.js index`. Non-canonical; do not edit manually.",
    "",
    `Project hash: \`${projectHash}\``,
    "",
    "| ID | Kind | Decision | Materiality | Priority | Foundation | Related | Source |",
    "|---|---|---|---|---|---|---|---|",
    ...qualityRecords.map((item) => `| \`${item.id}\` | ${item.kind} | ${item.decision_status || "—"} | ${item.materiality || "—"} | ${item.priority || "—"} | ${item.foundation || "—"} | ${item.relations.map((id) => `\`${id}\``).join(", ") || "—"} | \`${item.source}\` |`),
    "",
  ];
  fs.writeFileSync(path.join(generated, "quality-contracts.md"), qualityLines.join("\n"));

  const reviews = normalized.filter((item) => item.id.startsWith("REV-"));
  const readinessLines = [
    "# Generated Review and Readiness View",
    "",
    "> Generated by `sdlc.js index`. Non-canonical; recorded reviews remain owned by Change.",
    "",
    `Project hash: \`${projectHash}\``,
    "",
    "| Review | Type | Disposition | Authority | Source |",
    "|---|---|---|---|---|",
    ...scan.records.filter((item) => item.id.startsWith("REV-")).map((item) => `| \`${item.id}\` | ${item.reviewType || "—"} | ${item.disposition || "—"} | ${item.authorityClass || "—"} | \`${item.relativeFile}:${item.line}\` |`),
    "",
  ];
  fs.writeFileSync(path.join(generated, "readiness.md"), readinessLines.join("\n"));

  const evidence = scan.records.filter((item) => item.id.startsWith("EVD-"));
  const evidenceLines = [
    "# Generated Evidence Freshness View",
    "",
    "> Generated by `sdlc.js index`. Non-canonical; evidence records remain the source.",
    "",
    `Project hash: \`${projectHash}\``,
    "",
    "| Evidence | Criterion | Result | Freshness | Authority | Source fingerprint | Source |",
    "|---|---|---|---|---|---|---|",
    ...evidence.map((item) => `| \`${item.id}\` | ${item.criterionId ? `\`${item.criterionId}\`` : "—"} | ${item.result || "—"} | ${item.freshness || "—"} | ${item.authorityClass || "—"} | ${item.sourceFingerprint ? `\`${item.sourceFingerprint.slice(0, 12)}…\`` : "—"} | \`${item.relativeFile}:${item.line}\` |`),
    "",
  ];
  fs.writeFileSync(path.join(generated, "evidence-freshness.md"), evidenceLines.join("\n"));

  const profile = scan.documents.find((doc) => doc.relativeFile === "profile.md");
  const selected = Array.isArray(profile?.data?.adapters) ? profile.data.adapters.map(String) : ["generic"];
  const catalog = scanEngineAdapters();
  const adapterLines = [
    "# Generated Adapter Composition View",
    "",
    "> Generated by `sdlc.js index`. Non-canonical; profile and adapter manifests are sources.",
    "",
    "| Adapter | Version | Axes | Requires | Precedence |",
    "|---|---|---|---|---:|",
    ...selected.map((id) => {
      const adapter = catalog.get(id);
      return adapter ? `| \`${id}\` | ${adapter.version} | ${adapter.axes.join(", ")} | ${adapter.requires.join(", ") || "—"} | ${adapter.precedence} |` : `| \`${id}\` | unknown | — | — | — |`;
    }),
    "",
  ];
  fs.writeFileSync(path.join(generated, "adapters.md"), adapterLines.join("\n"));
  return { projectHash, artifactCount: normalized.length, changeCount: changes.length };
}

function buildContext(projectRoot, manifestPath, outputArg) {
  const validation = validateProject(projectRoot);
  if (validation.issues.length) throw new Error(`Project validation failed:\n- ${validation.issues.join("\n- ")}`);
  const scan = validation.scan;
  const absoluteManifest = path.resolve(manifestPath);
  const raw = fs.readFileSync(absoluteManifest, "utf8");
  const parsed = parseFrontmatter(raw);
  const data = parsed.data;
  if (!data.manifest_id) throw new Error("Manifest missing manifest_id");
  const output = path.resolve(outputArg || path.join(projectRoot, "contexts", "generated", `${data.manifest_id}.md`));
  const ids = [...new Set([...(Array.isArray(data.root_ids) ? data.root_ids : []), ...(Array.isArray(data.include_ids) ? data.include_ids : [])].map(String))];
  const reviewIds = Array.isArray(data.review_ids) ? data.review_ids.map(String) : [];
  const recordMap = new Map(scan.records.map((record) => [record.id, record]));
  const missing = ids.filter((id) => !recordMap.has(id));
  if (missing.length) throw new Error(`Manifest references missing artifact records: ${missing.join(", ")}`);
  const documents = Array.isArray(data.include_documents) ? data.include_documents.map(String) : [];
  const sections = [];
  for (const doc of documents) {
    const full = path.resolve(projectRoot, doc);
    if (!fs.existsSync(full)) throw new Error(`Missing included document: ${doc}`);
    const body = fs.readFileSync(full, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
    sections.push(`## Document · ${doc}\n\n${rewriteLocalLinks(body, full, output)}`);
  }
  for (const id of ids) {
    const record = recordMap.get(id);
    sections.push(`## Artifact · ${id}\n\n_Source: \`${record.relativeFile}:${record.line}\`_\n\n${record.block}`);
  }
  const projectHash = hashCanonical(scan);
  const content = [
    "# Generated Context Pack",
    "",
    "> Generated view. Do not edit or treat as canonical.",
    "",
    `- Manifest: \`${data.manifest_id}\``,
    `- Role: ${data.role || "unspecified"}`,
    `- Context tier: ${data.context_tier || "unspecified"}`,
    `- Project hash: \`${projectHash}\``,
    `- Root IDs: ${(Array.isArray(data.root_ids) ? data.root_ids : []).map((id) => `\`${id}\``).join(", ")}`,
    `- Included IDs: ${ids.map((id) => `\`${id}\``).join(", ")}`,
    `- Review IDs: ${reviewIds.map((id) => `\`${id}\``).join(", ") || "none"}`,
    `- Overflow policy: ${data.overflow}`,
    "",
    ...sections,
    "",
    "## Manifest source",
    "",
    `\`${slash(path.relative(projectRoot, absoluteManifest))}\``,
    "",
  ].join("\n");
  const words = (content.match(/\b[\p{L}\p{N}][\p{L}\p{N}-]*\b/gu) || []).length;
  const estimatedTokens = Math.ceil(words * 1.35);
  const maxTokens = Number(data.max_tokens);
  if (!Number.isInteger(maxTokens) || estimatedTokens > maxTokens) {
    throw new Error(`Context estimate ${estimatedTokens} exceeds max_tokens ${maxTokens}; split the task/manifest`);
  }
  ensureDir(path.dirname(output));
  fs.writeFileSync(output, content);
  return { output, ids: ids.length, estimatedTokens, projectHash };
}

function usage() {
  console.log(`RoyaScaff SDLC v1.3.1\n\nUsage:\n  sdlc.js validate <project-root>\n  sdlc.js index <project-root>\n  sdlc.js context <project-root> <manifest.md> [output.md]\n\nvalidate checks machine-observable contracts; it does not judge semantic or product quality.`);
}

function main() {
  const [, , command, rootArg, manifestArg, outputArg] = process.argv;
  if (!command || !rootArg || command === "help" || command === "--help") {
    usage();
    process.exit(command && command !== "help" && command !== "--help" ? 1 : 0);
  }
  const projectRoot = path.resolve(rootArg);
  if (!fs.existsSync(projectRoot)) {
    console.error(`Project root does not exist: ${projectRoot}`);
    process.exit(1);
  }
  try {
    if (command === "validate") {
      const result = validateProject(projectRoot);
      if (result.issues.length) {
        console.error(`Validation failed (${result.issues.length} issue${result.issues.length === 1 ? "" : "s"}):`);
        for (const issue of result.issues) console.error(`- ${issue}`);
        process.exit(1);
      }
      for (const warning of result.warnings) console.warn(`WARNING ${warning}`);
      console.log(`Contract validation PASS: ${result.scan.records.length} artifacts, ${result.scan.documents.length} documents, ${result.scan.changes.length} changes, ${result.scan.manifests.length} context manifests. Semantic quality still requires the recorded reviews.`);
      return;
    }
    if (command === "index") {
      const result = validateProject(projectRoot);
      if (result.issues.length) throw new Error(`Validation failed:\n- ${result.issues.join("\n- ")}`);
      const generated = generateIndexes(projectRoot, result.scan);
      for (const warning of result.warnings) console.warn(`WARNING ${warning}`);
      console.log(`Generated indexes: ${generated.artifactCount} artifacts, ${generated.changeCount} changes, project ${generated.projectHash.slice(0, 12)}.`);
      return;
    }
    if (command === "context") {
      if (!manifestArg) throw new Error("context requires a manifest path");
      const result = buildContext(projectRoot, manifestArg, outputArg);
      console.log(`Generated context: ${slash(result.output)} (${result.ids} artifacts, ~${result.estimatedTokens} tokens).`);
      return;
    }
    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = {
  parseFrontmatter,
  parseRecords,
  scanProject,
  scanEngineAdapters,
  validateProject,
  generateIndexes,
  buildContext,
  hashSelectedRecords,
  hashSourcePaths,
};
