"use strict";

// Git-based drift (plan 02 §14, §15.2): work the engine did not see, and plans or verified
// work that became outdated. Returns an empty result when the project is not a git repo.
//
//   untrackedCommits      commits since tracking began that no task, change or record covers
//   uncommitted           working-tree edits outside every task in progress (developer work)
//   changedSinceVerified  Done requirements whose code changed after the verifying commit
//   refinement            planned slices whose requirements changed since they were planned

const fs = require("fs");
const path = require("path");
const { git, isRepo, prefixOf, headShort, resolve, isAncestor, commitsSince, workingChanges, filesChangedSince, showFile } = require("../git.cjs");
const { patternList, matchesAny } = require("../glob.cjs");
const { recordText } = require("../parse/markdown.cjs");

const ID_AT_START = /^\s*((?:TASK|CHG)-[A-Z0-9]+(?:-[A-Z0-9]+)+)\b/;
const LEGACY_ROOT_FILES = new Set(["profile.md", "system-map.md", "STATUS.md"]);
const LEGACY_ZONES = new Set(["knowledge", "changes", "contexts", "generated", "evidence", "releases", "incidents"]);

function empty() {
  return { git: false, head: null, window: null, untrackedCommits: [], uncommitted: [], uncommittedKnowledge: [], changedSinceVerified: new Map(), featureChanged: new Map(), refinement: new Map() };
}

function context(model) {
  const projectRel = path.relative(model.repo, model.root).split(path.sep).join("/");
  const isKnowledge = (p) => (projectRel ? p === projectRel || p.startsWith(`${projectRel}/`) : LEGACY_ROOT_FILES.has(p) || LEGACY_ZONES.has(p.split("/")[0])) || p === "STATUS.md";
  const repoPath = (rel) => (projectRel ? `${projectRel}/${rel}` : rel);
  return { projectRel, isKnowledge, repoPath };
}

function taskPaths(model, taskId) {
  const rec = model.records.get(taskId);
  return rec ? patternList(rec.fields["Allowed paths"]) : [];
}

function changeInterval(change) {
  const events = change.events || [];
  const opened = events.find((e) => e.event === "change.opened") || events[0];
  const ended = [...events].reverse().find((e) => e.event === "change.advanced" && /→ (closed|cancelled)/.test(e.note || ""));
  return { from: opened ? Date.parse(opened.when) : -Infinity, to: ended ? Date.parse(ended.when) : Infinity };
}

function componentIndex(model) {
  const comps = [];
  for (const rec of model.records.values()) {
    if (rec.kind !== "component") continue;
    const globs = patternList(rec.fields.Code);
    if (!globs.length) continue;
    const reqs = new Set(rec.relations.filter((r) => ["realizes", "implements", "satisfies"].includes(r.type)).map((r) => r.to));
    for (const x of model.incoming.get(rec.id) || []) if (x.type === "realized_by") reqs.add(x.from);
    const features = new Set();
    for (const r of reqs) {
      const rr = model.records.get(r);
      const f = rr && rr.relations.find((x) => x.type === "feature" || x.type === "satisfies");
      if (f && model.features.has(f.to)) features.add(f.to);
    }
    comps.push({ id: rec.id, globs, reqs: [...reqs], features: [...features] });
  }
  return comps;
}

function locate(comps, file) {
  const hit = comps.filter((c) => matchesAny(file, c.globs));
  return { components: hit.map((c) => c.id), features: [...new Set(hit.flatMap((c) => c.features))] };
}

// Git tracking is on when the project folder is the root of its own repository, or when the
// profile opts in with `git_subdir: true` (a project inside a larger monorepo).
function gitEnabled(model) {
  if (!isRepo(model.repo)) return false;
  return prefixOf(model.repo) === "" || model.profile.git_subdir === true;
}

function computeDrift(model, status) {
  if (!gitEnabled(model)) return empty();
  const ctx = context(model);
  const out = empty();
  out.git = true;
  out.head = headShort(model.repo);
  const comps = componentIndex(model);
  const changes = [...model.changes.values()];

  // 1. Untracked commits.
  const resolved = [];
  for (const c of changes) for (const e of c.events || []) {
    const full = resolve(model.repo, e.git);
    if (full) resolved.push({ when: Date.parse(e.when), full });
  }
  resolved.sort((a, b) => a.when - b.when);
  const recorded = new Set();
  for (const c of changes) for (const e of c.events || []) if (e.event === "manual.recorded") for (const h of (e.note.match(/\b[0-9a-f]{7,40}\b/g) || [])) recorded.add(h);
  if (resolved.length) {
    const base = resolved[0].full;
    out.window = { from: base.slice(0, 7) };
    for (const commit of commitsSince(model.repo, base)) {
      const code = commit.files.filter((f) => !ctx.isKnowledge(f));
      if (!code.length) continue;
      const m = commit.subject.match(ID_AT_START);
      if (m && model.records.has(m[1])) continue;
      if ([...recorded].some((h) => commit.hash.startsWith(h))) continue;
      const at = Date.parse(commit.date);
      const covered = code.every((file) => changes.some((c) => {
        const iv = changeInterval(c);
        return at >= iv.from && at <= iv.to && c.tasks.some((t) => matchesAny(file, taskPaths(model, t)));
      }));
      if (covered) continue;
      const where = code.map((f) => locate(comps, f));
      out.untrackedCommits.push({ hash: commit.hash, short: commit.short, subject: commit.subject, author: commit.author, date: commit.date, files: code, components: [...new Set(where.flatMap((w) => w.components))], features: [...new Set(where.flatMap((w) => w.features))] });
    }
  }

  // 2. Uncommitted developer edits (outside every task in progress).
  const doing = [...status.tasks.values()].filter((t) => t.state === "doing");
  const working = workingChanges(model.repo);
  for (const w of working) {
    if (ctx.isKnowledge(w.path)) continue;
    const inTask = doing.find((t) => matchesAny(w.path, taskPaths(model, t.id)));
    const where = locate(comps, w.path);
    out.uncommitted.push({ path: w.path, code: w.code, inTask: inTask ? inTask.id : null, ...where });
  }

  if (model.is14) out.uncommittedKnowledge = uncommittedKnowledge(model);

  // 3. Done requirements whose code changed after the verifying commit.
  const workingPaths = working.map((w) => w.path);
  for (const [reqId, r] of status.requirements) {
    if (r.state !== "done" && r.state !== "released") continue;
    const reqComps = comps.filter((c) => c.reqs.includes(reqId));
    if (!reqComps.length) continue;
    const commits = r.evidence.map((e) => resolve(model.repo, model.evidence.get(e).git)).filter(Boolean);
    const since = commits.find((c, i) => commits.every((o, j) => i === j || isAncestor(model.repo, o, c))) || commits[0];
    if (!since) continue;
    const globs = reqComps.flatMap((c) => c.globs);
    const changed = [...new Set([...filesChangedSince(model.repo, since), ...workingPaths])].filter((f) => matchesAny(f, globs));
    if (!changed.length) continue;
    const sinceTime = Date.parse(git(model.repo, ["show", "-s", "--format=%aI", since]) || 0);
    const feature = (model.records.get(reqId).relations.find((x) => x.type === "feature" || x.type === "satisfies") || {}).to;
    const coveredBy = changes.filter((c) => {
      if (c.status === "cancelled") return false;
      const opened = changeInterval(c).from;
      const touches = c.affects.includes(reqId) || (feature && c.affects.includes(feature)) || c.tasks.some((t) => changed.every((f) => matchesAny(f, taskPaths(model, t))));
      return touches && opened >= sinceTime;
    });
    if (coveredBy.length) continue;
    out.changedSinceVerified.set(reqId, { since: since.slice(0, 7), files: changed });
    if (feature) {
      if (!out.featureChanged.has(feature)) out.featureChanged.set(feature, []);
      out.featureChanged.get(feature).push(reqId);
    }
  }

  // 4. Refinement: planned slices whose requirements changed since `Planned at`.
  // (1.4 projects: plan approvals decide this instead; see approvals.cjs.)
  if (!model.approvals) for (const slice of model.slices.values()) {
    const s = status.slices.get(slice.id);
    if (s.state !== "planned") continue;
    out.refinement.set(slice.id, refinementCheck(model, ctx, slice, slice.planned_at));
  }
  return out;
}

// Project knowledge that git does not hold yet (R2). Not counted: generated STATUS.md, caches,
// and new lines in an event log that git already tracks (every command appends to it).
const NOT_KNOWLEDGE_STATE = [/(^|\/)STATUS\.md$/, /(^|\/)\.cache\//, /(^|\/)\.usage\//, /(^|\/)\.backups\//];
function uncommittedKnowledge(model) {
  if (!gitEnabled(model)) return [];
  const ctx = context(model);
  // What the engine itself rewrites in a tracked file: a change's status line and summary blocks.
  const engineOnly = (text) => text.replace(/^(---\n[\s\S]*?)^status:.*$/m, "$1status:").replace(/<!-- royascaff:summary:start -->[\s\S]*?<!-- royascaff:summary:end -->/g, "").replace(/\s+$/, "");
  return workingChanges(model.repo).filter((w) => {
    if (!ctx.isKnowledge(w.path) || NOT_KNOWLEDGE_STATE.some((re) => re.test(w.path))) return false;
    const tracked = w.code !== "??" && w.code !== "A";
    if (tracked && /(^|\/)log\.md$/.test(w.path)) return false;
    if (tracked && w.code.includes("M")) {
      const before = showFile(model.repo, "HEAD", w.path);
      const abs = path.join(model.repo, w.path);
      if (before !== null && fs.existsSync(abs) && engineOnly(before) === engineOnly(fs.readFileSync(abs, "utf8"))) return false;
    }
    return true;
  });
}

// Records a slice depends on for refinement: its requirements and what they link to.
function refinementIds(model, slice) {
  const ids = new Set(slice.delivers);
  for (const r of slice.delivers) {
    const rec = model.records.get(r);
    if (rec) for (const rel of rec.relations) if (!["feature", "satisfies", "verified_by"].includes(rel.type)) ids.add(rel.to);
  }
  return [...ids].filter((id) => model.records.has(id) && model.records.get(id).origin === "record");
}

// Fingerprints of the current text of the given records ("REQ-X@1a2b3c4d").
function recordHashes(model, ids) {
  const crypto = require("crypto");
  return ids.map((id) => {
    const rec = model.records.get(id);
    const text = recordText(fs.readFileSync(path.join(model.root, rec.file), "utf8"), id) || "";
    return `${id}@${crypto.createHash("sha256").update(text).digest("hex").slice(0, 8)}`;
  });
}

// Refinement after a confirmation: compare against the fingerprints stored in the event note;
// records not fingerprinted there are compared with the confirmation's commit.
function refinementSinceConfirmation(model, ctx, slice, confirmation) {
  const stored = new Map((confirmation.note.match(/[A-Z][A-Z0-9]*(?:-[A-Z0-9]+){2,}@[0-9a-f]{8}/g) || []).map((x) => x.split("@")));
  const ids = refinementIds(model, slice);
  const current = new Map(recordHashes(model, ids).map((x) => x.split("@")));
  const changed = ids.filter((id) => stored.has(id) && stored.get(id) !== current.get(id));
  const rest = ids.filter((id) => !stored.has(id));
  if (rest.length) {
    const byCommit = refinementCheck(model, ctx, { ...slice, delivers: rest }, confirmation.git);
    if (byCommit.state === "needs") changed.push(...byCommit.changed.filter((id) => rest.includes(id)));
  }
  return { state: changed.length ? "needs" : "ok", changed, base: "last review" };
}

function refinementCheck(model, ctx, slice, baseRev) {
  const base = resolve(model.repo, baseRev);
  if (!base) return { state: "unknown", changed: [], base: baseRev || null };
  const cache = new Map();
  const changed = [];
  for (const id of refinementIds(model, slice)) {
    const rec = model.records.get(id);
    const repoPath = ctx.repoPath(rec.file);
    const nowText = recordText(fs.readFileSync(path.join(model.root, rec.file), "utf8"), id);
    if (!cache.has(repoPath)) cache.set(repoPath, showFile(model.repo, base, repoPath));
    const thenText = recordText(cache.get(repoPath), id);
    if (thenText !== nowText) changed.push(id);
  }
  return { state: changed.length ? "needs" : "ok", changed, base: base.slice(0, 7) };
}

module.exports = { uncommittedKnowledge, computeDrift, gitEnabled, refinementCheck, refinementSinceConfirmation, recordHashes, refinementIds, context, componentIndex, taskPaths };
