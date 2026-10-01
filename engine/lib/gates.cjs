"use strict";

// Stage gates (plan file 09 §3.6). Each transition has deterministic checks; approval checks
// follow the risk policy (Q7). Checks that belong to later build steps are reported as
// "pending" and do not block, so the result never pretends to have checked something.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { parseMarkdown } = require("./parse/markdown.cjs");
const { readTables } = require("./model/tables.cjs");

const ORDER = ["draft", "analyzed", "approved", "ready", "in-progress", "verified", "reconciled", "closed"];
const RISKS = ["low", "medium", "high", "critical"];
const IMPACT_STATES = ["changed", "referenced", "unchanged", "not-applicable"];
const IMPACT_LAYERS = ["business", "domain", "architecture", "data", "components", "quality"];
const TASK_FIELDS = ["Goal", "Inputs", "Allowed paths", "Checks", "Done when"];
const EVIDENCE_REQUIRED = { feature: "per-requirement", bug: "any", polish: "any", refactor: "any", chore: "none", knowledge: "none", migration: "none" };

// A section of change.md: text from `## <name>` to the next `## ` heading.
function section(body, names) {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => names.some((n) => new RegExp(`^##\\s+${n}\\s*$`, "i").test(l.trim())));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !/^##\s/.test(lines[end])) end += 1;
  return lines.slice(start + 1, end).join("\n");
}

function changeBody(projectDir, change) {
  const text = fs.readFileSync(path.join(projectDir, change.file), "utf8");
  return text.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

// The design hash covers change.md without its front matter, so status updates do not make an
// approval stale, but any edit to the outcome, impact or after-state does.
function designHash(projectDir, change) {
  return crypto.createHash("sha256").update(changeBody(projectDir, change)).digest("hex").slice(0, 10);
}

function isHuman(by) {
  return Boolean(by) && !/^ai(:|$)/i.test(by) && by !== "unknown";
}

function hasContent(text) {
  if (!text) return false;
  return text.split("\n").some((l) => l.trim() && !/^_.*_$/.test(l.trim()) && !/^>/.test(l.trim()));
}

function appCommands(model) {
  return [...model.records.values()].filter((r) => r.kind === "app" && ["Build", "Typecheck", "Lint", "Test"].some((k) => r.fields[k]));
}

function check(id, ok, message, extra = {}) {
  return { id, ok, message, ...extra };
}

const RULES = {
  // draft → analyzed: understand the change.
  analyzed(ctx) {
    const { model, change, body } = ctx;
    const out = [];
    // Beta.4 (D2): the Impact table has one row per knowledge layer (old six-row tables still parse).
    const K = require("./knowledge.cjs");
    const impact = K.impactOf(body);
    if (!impact) out.push(check("impact", false, "change.md needs an `## Impact` table with a State column"));
    else {
      const missing = K.LAYERS.filter((l) => !impact.layers.has(l.id)).map((l) => l.label);
      const bad = impact.rows.filter((r) => !IMPACT_STATES.includes(r.state)).map((r) => r.label || "(unnamed)");
      out.push(check("impact", !missing.length && !bad.length, missing.length || bad.length
        ? `classify every layer as ${IMPACT_STATES.join(" / ")}${missing.length ? `; missing: ${missing.join(", ")}` : ""}${bad.length ? `; not classified: ${bad.join(", ")}` : ""}`
        : "every impact layer is classified"));
    }
    if (impact && model.is14) {
      // A3 + D2: a "changed" or "referenced" layer names what it touches (IDs or knowledge paths),
      // and every ID and path it names exists.
      const { findIds } = require("./parse/ids.cjs");
      const empty = [];
      const unknown = [];
      for (const r of impact.rows) {
        if (!["changed", "referenced"].includes(r.state)) continue;
        if (!r.named || /^[—?-]$/.test(r.named)) empty.push(`${r.label} (${r.state})`);
        for (const id of findIds(r.named)) if (!model.records.has(id)) unknown.push(id);
        for (const p of r.named.match(/[\w./-]+\.md\b/g) || []) {
          const rel = p.replace(/^project\//, "");
          const exists = fs.existsSync(path.join(model.root, rel)) || K.docsOf(model).some((d) => d.file.endsWith(rel) && fs.existsSync(path.join(model.root, d.file)));
          if (!exists) unknown.push(`${p} (create it: royascaff new doc ${(K.docsOf(model).find((d) => d.file.endsWith(rel)) || { kind: "<kind>" }).kind})`);
        }
      }
      out.push(check("impact-named", !empty.length && !unknown.length, empty.length || unknown.length
        ? `${empty.length ? `name the affected IDs or pages of every changed or referenced layer (${empty.join(", ")})` : ""}${empty.length && unknown.length ? "; " : ""}${unknown.length ? `these do not exist: ${[...new Set(unknown)].join(", ")}` : ""}`
        : "every changed or referenced layer names what it touches"));
    }
    out.push(check("risk", RISKS.includes(change.risk), RISKS.includes(change.risk) ? `risk: ${change.risk}` : `set risk to one of ${RISKS.join(", ")}`));
    if (change.kind === "feature") {
      const ok = change.slices.length > 0 && change.slices.every((s) => model.slices.has(s));
      out.push(check("scope", ok, ok ? `delivers slice ${change.slices.join(", ")}` : "a feature change must name an existing slice"));
    }
    else if (["bug", "polish"].includes(change.kind)) {
      const ok = change.affects.length > 0 && change.affects.every((a) => model.records.has(a));
      out.push(check("scope", ok, ok ? `affects ${change.affects.join(", ")}` : "a bug/polish change must name the feature or requirement it affects"));
    }
    return out;
  },
  // analyzed → approved: the design exists and, for medium+ risk, a person approved it.
  approved(ctx) {
    const { model, change, body, projectDir, status } = ctx;
    const out = [];
    const after = section(body, ["After-state", "After state", "Proposed after-state"]);
    const needsDesign = !["chore"].includes(change.kind);
    if (needsDesign) out.push(check("after-state", hasContent(after), hasContent(after) ? "after-state is written" : "write the `## After-state` section (the design)"));
    if (model.is14 && ["feature", "refactor"].includes(change.kind) && hasContent(after)) {
      // A3 / C-006: the design names the records it rests on (a decision, component or contract)
      // or the architecture page, so material choices are traceable.
      const { findIds } = require("./parse/ids.cjs");
      const design = findIds(after).filter((id) => /^(ADR|CMP|CTR)-/.test(id) && model.records.has(id));
      const ok = design.length > 0 || /architecture\.md/.test(after);
      out.push(check("design-records", ok, ok ? `the design rests on ${design.join(", ") || "the architecture page"}` : "name the decisions (ADR-), components (CMP-) or contracts (CTR-) the design uses, or link architecture.md: royascaff new record decision|component|contract …"));
    }
    if (model.is14 && change.kind === "feature" && hasContent(after)) {
      // P3: a deferral names the slice that will do the work.
      const { vagueLines } = require("./quality.cjs");
      const vague = vagueLines(after.split("\n").map((text, n) => ({ n, text })));
      out.push(check("deferrals", vague.length === 0, vague.length ? `name the slice for each deferral ("${vague[0].text.trim().slice(0, 50)}"): write Deferred to: SLC-… (plan the slice first if it does not exist)` : "no unnamed deferrals"));
    }
    if (model.is14 && needsDesign && hasContent(after)) {
      // D2: every layer the Impact marks "changed" is addressed in the design: the After-state names
      // one of the row's IDs, a record of the layer's kinds, or the layer's page.
      const K = require("./knowledge.cjs");
      const impact = K.impactOf(body);
      const { findIds } = require("./parse/ids.cjs");
      const ids = findIds(after);
      const silent = [];
      for (const [layer, v] of impact ? impact.layers : []) {
        if (v.state !== "changed") continue;
        const L = K.LAYERS.find((x) => x.id === layer);
        const rowIds = findIds(v.named);
        const pages = K.docsForLayer(model, layer).map((d) => path.posix.basename(d.file));
        const ok = ids.some((id) => rowIds.includes(id) || L.kinds.includes((model.records.get(id) || {}).kind)) || pages.some((f) => after.includes(f)) || v.named.split(/[,\s]+/).some((x) => x.length > 3 && after.includes(x));
        if (!ok) silent.push(L.label);
      }
      out.push(check("design-covers-impact", silent.length === 0, silent.length ? `the After-state does not say how these changed layers change: ${silent.join(", ")} — name their records or pages` : "the design covers every changed layer"));
    }
    const broken = model.issues.filter((i) => i.severity === "error" && i.where && i.where.startsWith(`${change.dir}/`));
    out.push(check("links", broken.length === 0, broken.length ? `fix ${broken.length} broken link(s) in this change: ${broken.map((b) => b.message).join("; ")}` : "all links in this change resolve"));
    if (["medium", "high", "critical"].includes(change.risk)) {
      const hash = designHash(projectDir, change);
      const approvals = (change.events || []).filter((e) => e.event === "change.approved" && e.target === change.id);
      const valid = approvals.filter((e) => isHuman(e.by) && (e.note || "").includes(`design ${hash}`));
      const stale = approvals.length > 0 && !valid.length;
      out.push(check("approval", valid.length > 0, valid.length
        ? `approved by ${valid[valid.length - 1].by}`
        : stale
          ? `the design changed after it was approved — a person must approve again (\`royascaff approve ${change.id}\`)`
          : `risk ${change.risk}: a person must approve the design (\`royascaff approve ${change.id}\`)`, { approval: true }));
    }
    return out;
  },
  // approved → ready: executable tasks within budget.
  ready(ctx) {
    const { model, change } = ctx;
    const out = [];
    const max = Number(model.profile.max_tasks_per_change) || 5;
    const tasks = change.tasks.map((t) => model.records.get(t));
    const allowEmpty = ["knowledge", "migration"].includes(change.kind);
    out.push(check("tasks", tasks.length > 0 || allowEmpty, tasks.length ? `${tasks.length} task(s)` : allowEmpty ? "knowledge-only change: no tasks needed" : "write at least one task in plan.md (`royascaff new task`)"));
    out.push(check("task-budget", tasks.length <= max, tasks.length <= max ? `within ${max} tasks` : `${tasks.length} tasks exceed the slice budget of ${max}: split the slice`));
    const incomplete = tasks.map((t) => ({ id: t.id, missing: TASK_FIELDS.filter((f) => !String(t.fields[f] || "").trim()) })).filter((t) => t.missing.length);
    const tf = require("./testsfirst.cjs");
    if (model.is14 && change.kind === "feature") {
      // D8: every requirement the change delivers (any priority) has at least one test, runner or manual;
      // an NFR measured by a metric counts as tested.
      const delivered = [...new Set(change.slices.flatMap((s) => (model.slices.get(s) ? model.slices.get(s).delivers : [])))].filter((id) => ["requirement", "nfr"].includes((model.records.get(id) || {}).kind));
      const tested = (id) => {
        const rec = model.records.get(id);
        if (rec.kind === "nfr" && /`\s*[a-z][\w.-]*\.[\w.-]+\s*(>=|≥|<=|≤|==|=|<|>)\s*-?\d/i.test(`${rec.fields.Measure || ""}\n${rec.body || ""}`)) return true;
        const ids = new Set(rec.relations.filter((x) => x.type === "verified_by").map((x) => x.to));
        for (const x of model.incoming.get(id) || []) if (x.type === "verifies") ids.add(x.from);
        return [...ids].some((t) => (model.records.get(t) || {}).kind === "test");
      };
      const untested = delivered.filter((id) => !tested(id));
      out.push(check("tests-planned", untested.length === 0, untested.length ? `plan a test for every requirement this change delivers: ${untested.join(", ")} (royascaff new record test "<what it proves>" --verifies ${untested[0]} --check runner:test|manual)` : "every delivered requirement has a test"));
    }
    if (tf.applies(model, change)) {
      // WP-C4 (P5): every must requirement or NFR has an acceptance test the runner runs.
      const missing = tf.missingTests(model, change);
      out.push(check("acceptance-tests", missing.length === 0, missing.length ? `write the acceptance tests first — no runner test verifies ${missing.join(", ")}: royascaff new record test "<what it proves>" --verifies ${missing[0]} --check runner:test` : "every must requirement has a runner test"));
    }
    out.push(check("task-fields", incomplete.length === 0, incomplete.length ? incomplete.map((t) => `${t.id} needs ${t.missing.join(", ")}`).join("; ") : `every task has ${TASK_FIELDS.join(", ")}`));
    if (tasks.length && !incomplete.length) {
      const { buildPack } = require("./context.cjs");
      const packs = tasks.map((t) => buildPack(model, ctx.status, t.id));
      const over = packs.filter((p) => !p.within);
      const largest = packs.reduce((m, p) => Math.max(m, p.tokens), 0);
      out.push(check("context-budget", over.length === 0, over.length
        ? `context over the budget of ${packs[0].budget} tokens: ${over.map((p) => `${p.task} ~${p.tokens}`).join(", ")} — split these tasks`
        : `every task's context fits (largest ~${largest} of ${packs[0].budget} tokens)`));
    } else {
      out.push(check("context-budget", true, "context is measured once the tasks are complete", { pending: "tasks incomplete" }));
    }
    out.push(refinementGate(ctx));
    return out;
  },
  "in-progress"() {
    return [check("start", true, "work starts")];
  },
  // in-progress (or ready, with no tasks) → verified: done, checked, proven.
  verified(ctx) {
    const { model, change, status } = ctx;
    const out = [];
    const open = change.tasks.filter((t) => status.tasks.get(t).state !== "done");
    out.push(check("tasks-done", open.length === 0, open.length ? `not done yet: ${open.join(", ")}` : "all tasks done"));
    // Order in the append-only log decides freshness (timestamps have one-second resolution).
    const events = change.events || [];
    const lastIndex = (name) => events.reduce((at, e, i) => (e.event === name ? i : at), -1);
    const lastTaskDoneAt = lastIndex("task.done");
    const lastCheckAt = lastIndex("check.run");
    const lastCheck = lastCheckAt >= 0 ? events[lastCheckAt] : null;
    const apps = appCommands(model);
    if (!apps.length) out.push(check("checks", true, "no app commands declared in profile.md — nothing to run", { pending: "no commands" }));
    else {
      const fresh = lastCheck && lastCheckAt > lastTaskDoneAt;
      const passed = fresh && /^pass/i.test(lastCheck.note || "");
      out.push(check("checks", Boolean(passed), passed ? `checks passed ${lastCheck.when}` : fresh ? `last check failed: ${lastCheck.note}` : `run the full checks after the last task (\`royascaff check ${change.id}\`)`));
    }
    const tf = require("./testsfirst.cjs");
    if (tf.applies(model, change) && !tf.recordedAfterTheFact(events)) {
      // WP-C4 (P5): the tests failed before the work (red), then pass (the full check above).
      const at = tf.readyAt(events);
      const red = events.some((e, i) => i > at && e.event === "check.red");
      out.push(check("red-first", red, red ? "the tests failed before the work (red), as they should" : `prove the tests were written first: after writing them, run royascaff check ${change.id} --red (they must fail) before the implementation`));
      const readers = tf.sourceReaders(model, require("./runner.cjs").appsForChange(model, change));
      out.push(check("tests-run-code", readers.length === 0, readers.length ? `tests must call the code, not read it: ${readers.map((r) => `${r.file} ${r.why}`).join("; ")}` : "tests call the code"));
    }
    // WP-C5 (P6): when an adapter declares a smoke check for this kind of change, it must pass.
    const sp = model.is14 ? require("./adapters.cjs").policy(model).smoke : null;
    if (sp && (sp.requiredFor || []).includes(change.kind) && apps.length) {
      const appsC = require("./runner.cjs").appsForChange(model, change);
      const missing = appsC.filter((a) => !a.commands.Smoke).map((a) => a.id);
      const runs = events.filter((e, i) => i > lastTaskDoneAt && e.event === "check.run" && / — .*[✓✗⏱]/.test(e.note || "") && !/^quick\b/i.test(e.note || ""));
      const lastRun = runs[runs.length - 1];
      const smoked = Boolean(lastRun && /smoke ✓/.test(lastRun.note));
      out.push(check("smoke", !missing.length && smoked, missing.length ? `${missing.join(", ")} has no Smoke command: run royascaff smoke init, then royascaff check ${change.id}` : smoked ? "the app ran in a real browser (smoke check passed)" : `run the full check with the smoke test after the last task: royascaff check ${change.id}`));
    }
    // D9: a change that lowers what the adapters call quality (e.g. removes lighting or antialiasing)
    // says so in its After-state. A warning, not a refusal: the person judges the trade-off.
    const tradeoffs = model.is14 ? require("./adapters.cjs").policy(model).tradeoffs || [] : [];
    if (tradeoffs.length && require("./derive/drift.cjs").gitEnabled(model)) {
      const opened = events.find((e) => e.event === "change.opened");
      const { git: runGit, resolve } = require("./git.cjs");
      const base = opened && resolve(model.repo, opened.git);
      const diff = base ? (runGit(model.repo, ["diff", "-U0", base, "--", ".", `:(exclude)${require("./derive/drift.cjs").context(model).projectRel || "project"}`]) || "") : "";
      const addedLines = diff.split("\n").filter((l) => /^\+(?!\+\+)/.test(l)).join("\n");
      const removedLines = diff.split("\n").filter((l) => /^-(?!--)/.test(l)).join("\n");
      const hits = tradeoffs.flatMap((t) => [...(t.added || []).filter((x) => new RegExp(x, "i").test(addedLines)), ...(t.removed || []).filter((x) => new RegExp(x, "i").test(removedLines))].map(() => t.say));
      const after = section(ctx.body || "", ["After-state", "After state", "Proposed after-state"]) || "";
      if (hits.length) {
        const said = /trade-?off/i.test(after);
        out.push(check("quality-tradeoff", true, said ? `trade-off stated in the After-state (${[...new Set(hits)].join("; ")})` : `⚠ this change looks like it lowers the look (${[...new Set(hits)].join("; ")}) but the After-state states no trade-off: write "Trade-off: …" so the person can judge it`, { warning: !said }));
      }
    }
    // R8: a change the adapters mark for a person's look (kind and risk) is looked at before verified.
    if (model.is14 && require("./adapters.cjs").needsPersonLook(model, change)) {
      const looked = events.some((e, i) => i > lastTaskDoneAt && e.event === "check.run" && isHuman(e.by) && /^pass\b/i.test(e.note || "") && !/ — .*[✓✗]/.test(e.note || ""));
      out.push(check("visual-check", looked, looked ? "a person looked at the UI" : `a person opens the app, tries the flow and records it: royascaff check ${change.id} --result pass --note "looked at …" (the AI cannot record this)`, { approval: true, say: `royascaff check ${change.id} --result pass --note "looked at …"` }));
    }
    const rule = EVIDENCE_REQUIRED[change.kind] || "none";
    if (rule === "per-requirement") {
      const delivered = [...new Set(change.slices.flatMap((s) => (model.slices.get(s) ? model.slices.get(s).delivers : [])))];
      const missing = delivered.filter((r) => !(status.requirements.get(r) && status.requirements.get(r).evidence.length));
      out.push(check("evidence", missing.length === 0, missing.length ? `add passing evidence for ${missing.join(", ")}` : "every delivered requirement has passing evidence"));
    } else if (rule === "any") {
      const own = [...model.evidence.values()].filter((e) => e.change === change.id && e.result === "pass");
      out.push(check("evidence", own.length > 0, own.length ? `${own.length} passing evidence record(s)` : "add passing evidence (for a bug: a regression check)"));
    }
    return out;
  },
  // verified → reconciled: Main is consistent; high risk needs a second approval.
  reconciled(ctx) {
    const { model, change, body } = ctx;
    const out = [];
    const errors = model.issues.filter((i) => i.severity === "error");
    out.push(check("main-valid", errors.length === 0, errors.length ? `${errors.length} validation error(s) in the project — run \`royascaff validate\`` : "project validates"));
    if (model.is14) out.push(...recordedChecks(model, change, body));
    if (model.is14 && String(model.profile.knowledge_profile || "standard") === "standard" && ["feature", "refactor"].includes(change.kind)) {
      // B3: the standard profile keeps a quality strategy (lite projects do not need one).
      const qfile = path.join(model.root, "knowledge/06-quality/quality.md");
      const { sections, onlyTemplate } = require("./approvals.cjs");
      const ok = fs.existsSync(qfile) && sections(fs.readFileSync(qfile, "utf8")).some((s) => !onlyTemplate(s.lines));
      out.push(check("quality-strategy", ok, ok ? "the quality strategy is written" : "standard profile: write the quality strategy (royascaff new doc quality), or set knowledge_profile: lite in profile.md for a prototype"));
    }
    if (["high", "critical"].includes(change.risk)) {
      const events = change.events || [];
      const verifiedAt = events.filter((e) => e.event === "change.advanced" && /→ verified/.test(e.note || "")).pop();
      const ok = events.some((e) => e.event === "change.approved" && isHuman(e.by) && verifiedAt && Date.parse(e.when) >= Date.parse(verifiedAt.when));
      out.push(check("approval", ok, ok ? "second approval recorded" : `risk ${change.risk}: a person must approve again before recording (\`royascaff approve ${change.id}\`)`, { approval: true }));
    }
    return out;
  },
  closed(ctx) {
    const { change, status, model } = ctx;
    const open = change.tasks.filter((t) => status.tasks.get(t).state !== "done");
    const out = [check("no-open-tasks", open.length === 0, open.length ? `open tasks: ${open.join(", ")}` : "no open tasks")];
    const drift = require("./derive/drift.cjs");
    if (model.is14 && drift.gitEnabled(model)) {
      const dirty = drift.uncommittedKnowledge(model);
      out.push(check("committed", dirty.length === 0, dirty.length
        ? `commit the project knowledge first (${dirty.length} file(s): ${dirty.slice(0, 4).map((d) => d.path).join(", ")}${dirty.length > 4 ? ", …" : ""}): git add ${drift.context(model).projectRel || "."} && git commit -m "${change.id}: record"`
        : "the project knowledge is committed"));
    }
    return out;
  },
};

// A4: Check & Record really records. Source files this change touched are owned by a component
// (Code globs), and a change that said "Architecture: changed" edited the architecture page.
function recordedChecks(model, change, body) {
  const drift = require("./derive/drift.cjs");
  if (!drift.gitEnabled(model)) return [check("recorded", true, "knowledge recording is checked with git", { pending: "no git" })];
  const { filesChangedSince, workingChanges, resolve, showFile } = require("./git.cjs");
  const { patternList, matchesAny } = require("./glob.cjs");
  const opened = (change.events || []).find((e) => e.event === "change.opened");
  const base = opened && resolve(model.repo, opened.git);
  if (!base) return [check("recorded", true, "no recorded commit to compare with", { pending: "no base commit" })];
  const ctx = drift.context(model);
  const touched = [...new Set([...filesChangedSince(model.repo, base), ...workingChanges(model.repo).map((w) => w.path)])];
  const { SOURCE_EXTENSIONS } = require("./files.cjs");
  const globs = [...model.records.values()].filter((r) => r.kind === "component").flatMap((r) => patternList(r.fields.Code));
  const exclude = patternList(model.profile.code_exclude);
  const unowned = touched.filter((f) => !ctx.isKnowledge(f) && SOURCE_EXTENSIONS.includes(path.extname(f)) && !matchesAny(f, exclude) && !matchesAny(f, globs));
  const out = [check("code-owned", unowned.length === 0, unowned.length
    ? `record the code in the knowledge: ${unowned.length} changed source file(s) belong to no component (${unowned.slice(0, 4).join(", ")}${unowned.length > 4 ? ", …" : ""}) — add them to a component's Code globs (royascaff new record component … --code "<glob>")`
    : "every changed source file belongs to a component")];
  // D2: every layer the Impact marks "changed" edited its page (architecture: the architecture page
  // itself), and a record added in this change forces its layer to "changed".
  const K = require("./knowledge.cjs");
  const impact = K.impactOf(body);
  // A page counts as edited when its text changed since the change opened, ignoring the summary
  // blocks and board the engine writes itself.
  const strip = (t) => String(t || "").replace(/<!-- royascaff:summary:start -->[\s\S]*?<!-- royascaff:summary:end -->/g, "").trim();
  const contentChanged = (rel) => {
    const abs = path.join(model.root, rel);
    const now = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
    return strip(now) !== strip(showFile(model.repo, base, ctx.repoPath(rel)) || "");
  };
  if (impact) {
    for (const [layer, v] of impact.layers) {
      if (v.state !== "changed") continue;
      const L = K.LAYERS.find((x) => x.id === layer);
      const docs = K.docsForLayer(model, layer);
      // The layer's pages, plus every file that holds records of its kinds (layouts differ).
      const holders = [...new Set([...model.records.values()].filter((x) => L.kinds.includes(x.kind)).map((x) => x.file))];
      const pages = layer === "architecture" ? docs.filter((d) => d.kind === "architecture").map((d) => d.file) : [...new Set([...docs.map((d) => d.file), ...holders])];
      const edited = pages.filter((f) => contentChanged(f));
      const exists = pages.filter((f) => fs.existsSync(path.join(model.root, f)));
      out.push(check(`${layer}-updated`, edited.length > 0, edited.length
        ? `${L.label}: ${edited.join(", ")} updated`
        : exists.length
          ? `the Impact says ${L.label} changed: update ${pages.join(" or ")} to describe the system as it now is`
          : `the Impact says ${L.label} changed: create ${pages[0]} (royascaff new doc ${(docs.find((d) => d.newDoc) || docs[0]).kind}) and describe it`));
    }
    const { findIds } = require("./parse/ids.cjs");
    const added = [];
    const designKinds = ["decision", "component", "contract", "rule", "concept", "invariant", "workflow"];
    const holders = [...new Set([...model.records.values()].filter((x) => designKinds.includes(x.kind)).map((x) => x.file))];
    for (const file of holders) {
      const now = fs.existsSync(path.join(model.root, file)) ? fs.readFileSync(path.join(model.root, file), "utf8") : "";
      const before = showFile(model.repo, base, ctx.repoPath(file)) || "";
      const heads = (t) => new Set([...t.replace(/```[\s\S]*?```/g, "").matchAll(/^###\s+([A-Z][A-Z0-9]*-[A-Z0-9-]+)/gm)].map((m) => m[1]));
      const had = heads(before);
      for (const id of heads(now)) if (!had.has(id) && model.records.has(id) && designKinds.includes(model.records.get(id).kind)) added.push({ id, layer: K.layerOfKind(model.records.get(id).kind) });
    }
    // D6: the components this change names as changed (or adds) own real files by Record.
    const compRow = impact.layers.get("components");
    const named = [...new Set([...(compRow && compRow.state === "changed" ? findIds(compRow.named) : []), ...added.map((a) => a.id)])].filter((id) => (model.records.get(id) || {}).kind === "component");
    const { walk } = require("./content.cjs");
    const empty = named.filter((id) => {
      const globs = patternList(model.records.get(id).fields.Code);
      if (!globs.length) return true;
      const files = [];
      for (const g of globs) { const b = g.split("/"); const i = b.findIndex((x) => /[*?]/.test(x)); const d = (i < 0 ? b : b.slice(0, i)).join("/"); walk(path.join(model.repo, d), d, files); }
      return !files.some((f) => matchesAny(f, globs));
    });
    out.push(check("components-own-files", empty.length === 0, empty.length ? `these components own no file: ${empty.join(", ")} — fix their Code globs` : "the changed components own their files"));
    const forced = added.filter((a) => a.layer && (impact.layers.get(a.layer) || {}).state !== "changed");
    out.push(check("new-records-in-impact", forced.length === 0, forced.length
      ? `records added in this change make their layer "changed": ${forced.map((a) => `${a.id} → ${K.LAYERS.find((l) => l.id === a.layer).label}`).join(", ")} — mark the layer changed and update its page`
      : "records added in this change are reflected in the Impact"));
  }
  return out;
}

// The requirements a feature change delivers must not have changed since the change was opened
// (or since the last confirmed refinement) without someone reviewing them.
function refinementGate(ctx) {
  const { model, change } = ctx;
  if (model.approvals && change.kind === "feature") {
    // 1.4: refinement is the person's plan approval. A requirement (or what it links to) edited
    // after approval — also inside this change — needs the person to approve the plan again.
    const caps = [...new Set(change.slices.map((s) => model.slices.get(s)).filter(Boolean).map((s) => s.feature))];
    const pending = caps.filter((c) => (model.approvals.features.get(c) || { state: "none" }).state !== "approved");
    return pending.length
      ? check("refinement", false, `the plan of ${pending.join(", ")} changed after it was approved: a person reviews it, then runs royascaff approve ${pending.join(" ")}`, { approval: true, say: `royascaff approve ${pending.join(" ")}` })
      : check("refinement", true, `the plan of ${caps.join(", ") || "this change"} is unchanged since a person approved it`);
  }
  if (change.kind !== "feature" || !change.slices.some((s) => model.slices.get(s))) return check("refinement", true, "no slice to refine");
  const drift = require("./derive/drift.cjs");
  if (!drift.gitEnabled(model)) return check("refinement", true, "refinement needs git history (not a git repository)", { pending: "no git" });
  const events = change.events || [];
  const confirmed = [...events].reverse().find((e) => e.event === "refinement.confirmed");
  // All slices of the change are checked together (a migrated change can deliver several).
  const own = change.slices.map((s) => model.slices.get(s)).filter(Boolean);
  const slice = { ...own[0], delivers: [...new Set(own.flatMap((s) => s.delivers))] };
  if (confirmed) {
    const r = drift.refinementSinceConfirmation(model, drift.context(model), slice, confirmed);
    return r.state === "ok"
      ? check("refinement", true, "requirements unchanged since they were last reviewed")
      : check("refinement", false, `changed since they were last reviewed: ${r.changed.join(", ")} — review them, then: royascaff refine ${change.id}`);
  }
  const base = events.find((e) => e.event === "change.opened");
  if (!base || !base.git) return check("refinement", true, "no recorded commit to compare with", { pending: "no base commit" });
  const r = drift.refinementCheck(model, drift.context(model), slice, base.git);
  if (r.state === "unknown") return check("refinement", true, `commit ${base.git} is not in this repository`, { pending: "unknown commit" });
  return r.state === "ok"
    ? check("refinement", true, `requirements unchanged since ${r.base}`)
    : check("refinement", false, `changed since this change was opened: ${r.changed.join(", ")} — review them, then: royascaff refine ${change.id}`);
}

function pathTo(change, to) {
  const from = ORDER.indexOf(change.status);
  const target = ORDER.indexOf(to);
  if (from < 0) throw new Error(`${change.id} has status "${change.status}", which cannot advance`);
  if (target < 0) throw new Error(`Unknown target status "${to}". Use one of: ${ORDER.join(", ")}`);
  if (target <= from) return null;
  let steps = ORDER.slice(from + 1, target + 1);
  if (!change.tasks.length) steps = steps.filter((s) => s !== "in-progress");
  return steps;
}

function evaluate(ctx, to) {
  const checks = RULES[to](ctx);
  return { to, ok: checks.every((c) => c.ok), checks };
}

module.exports = { ORDER, RISKS, IMPACT_LAYERS, IMPACT_STATES, TASK_FIELDS, pathTo, evaluate, designHash, isHuman, section, changeBody };
