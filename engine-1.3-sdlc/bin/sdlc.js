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
    if (frontmatter.data.change_id) {
      changes.push({ id: String(frontmatter.data.change_id), file, relativeFile: relative, data: frontmatter.data });
    }
    if (frontmatter.data.manifest_id) {
      manifests.push({ id: String(frontmatter.data.manifest_id), file, relativeFile: relative, data: frontmatter.data });
    }
    records.push(...parseRecords(raw, file, projectRoot));
  }

  return { projectRoot, markdownFiles, documents, changes, manifests, records, rawByFile, frontmatterByFile };
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
    const docs = Array.isArray(manifest.data.include_documents) ? manifest.data.include_documents : [];
    for (const doc of docs) {
      if (!fs.existsSync(path.resolve(scan.projectRoot, String(doc)))) issues.push(`Context manifest ${manifest.id} references missing document ${doc}`);
    }
  }
}

function validateProject(projectRoot) {
  const scan = scanProject(projectRoot);
  const issues = [];
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
  validateLinks(scan, issues);
  validateCodeMap(scan, issues);
  return { scan, issues, knownIds };
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
    `- Project hash: \`${projectHash}\``,
    `- Root IDs: ${(Array.isArray(data.root_ids) ? data.root_ids : []).map((id) => `\`${id}\``).join(", ")}`,
    `- Included IDs: ${ids.map((id) => `\`${id}\``).join(", ")}`,
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
  console.log(`RoyaScaff SDLC v1.3\n\nUsage:\n  sdlc.js validate <project-root>\n  sdlc.js index <project-root>\n  sdlc.js context <project-root> <manifest.md> [output.md]`);
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
      console.log(`Validation PASS: ${result.scan.records.length} artifacts, ${result.scan.documents.length} documents, ${result.scan.changes.length} changes, ${result.scan.manifests.length} context manifests.`);
      return;
    }
    if (command === "index") {
      const result = validateProject(projectRoot);
      if (result.issues.length) throw new Error(`Validation failed:\n- ${result.issues.join("\n- ")}`);
      const generated = generateIndexes(projectRoot, result.scan);
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

main();
