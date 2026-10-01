"use strict";

// E6.4: scale (plan file 02 §5). Acceptance B5, as far as it can be shown here: a generated code base of 200 000
// lines is scanned incrementally, split into checkpoints no session overflows, and adopted checkpoint by checkpoint to
// at least 80% ownership with every layer covered. (A real public 200k-line repository is not reachable from here.)

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { makeProject, put } = require("./synthetic.cjs");
const { validate } = require("./schema-lite.cjs");
const { scanCommand } = require("../lib/scan.cjs");
const { adoptCommand } = require("../lib/commands/adopt.cjs");
const { planCommand, split, parseCheckpoints } = require("../lib/adoptplan.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { indexCommand } = require("../lib/commands/views.cjs");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "contract", "schemas", "adopt.schema.json"), "utf8"));
const ENV = { ...process.env, ROYASCAFF_USAGE: "off", ROYASCAFF_NO_TTY: "1", ROYASCAFF_USER: "islam" };
const timed = (fn) => { const t = Date.now(); const r = fn(); return [r, Date.now() - t]; };

test("split: a module over the budget is cut by sub-folder, small neighbours are packed, a folder of big files is cut by run", () => {
  const f = (p, tokens) => ({ path: p, tokens });
  // Three sub-folders of 40: two cannot share a budget of 60.
  const parts = split("m", [f("m/a/1.js", 40), f("m/b/1.js", 40), f("m/c/1.js", 40)], 60);
  assert.deepEqual(parts.map((p) => p.globs), [["m/a/**"], ["m/b/**"], ["m/c/**"]]);
  // Small ones are packed.
  const packed = split("m", [f("m/a/1.js", 20), f("m/b/1.js", 20), f("m/c/1.js", 20), f("m/d/1.js", 50)], 60);
  assert.deepEqual(packed.map((p) => p.globs), [["m/a/**", "m/b/**", "m/c/**"], ["m/d/**"]]);
  // Files directly in one folder: a run of files per part, in order; one file over the budget stays one part.
  const flat = split("m", [f("m/1.js", 30), f("m/2.js", 30), f("m/3.js", 30), f("m/4.js", 90)], 60);
  assert.deepEqual(flat.map((p) => p.globs), [["m/1.js", "m/2.js"], ["m/3.js"], ["m/4.js"]]);
  assert.deepEqual(split("m", [f("m/a.js", 10)], 60).map((p) => p.globs), [["m/**"]], "under the budget: the module is one checkpoint");
});

test("B5 (synthetic): 200 000 lines are scanned incrementally, planned into checkpoints and adopted to 80% with every layer covered", () => {
  const t0 = Date.now();
  const root = makeProject({ features: 2, code: { modules: 8, subs: 5, files: 20, lines: 250 } });
  const lines = 8 * 5 * 20 * 250;
  assert.equal(lines, 200000);

  // Scan: the first run reads every file, the second reads none, an edit makes it read one.
  const [first, ms1] = timed(() => scanCommand(root, null, {}));
  const total = first.modules.reduce((n, m) => n + m.files, 0);
  assert.equal(first.modules.reduce((n, m) => n + m.lines, 0) >= lines, true);
  assert.deepEqual([first.cache.misses > 0, first.reads >= 800], [true, true]);
  const [second, ms2] = timed(() => scanCommand(root, null, {}));
  assert.deepEqual([second.reads, second.cache.misses], [0, 0], "nothing changed: no file is read");
  assert.equal(second.cache.hits >= 800, true);
  const edited = path.join(root, "apps/web/src/m03/s2/file007.js");
  fs.writeFileSync(edited, `${fs.readFileSync(edited, "utf8")}exports.added = 1;\n`);
  fs.utimesSync(edited, new Date(Date.now() - 1800 * 1000), new Date(Date.now() - 1800 * 1000));
  const third = scanCommand(root, null, {});
  assert.deepEqual([third.reads, third.cache.misses], [1, 1], "one edit: one file is read again");
  console.log(`# scan ${total} files / ${lines} lines: first ${ms1} ms, unchanged ${ms2} ms`);

  // The plan: every module is over the budget of one session, so it is split; no checkpoint is over the budget.
  const before = adoptCommand(root);
  assert.equal(before.percent < 5, true, `only the fixture's own files are owned (${before.percent}%)`);
  const [plan, ms3] = timed(() => planCommand(root, {}));
  assert.equal(plan.mode, "plan");
  assert.equal(plan.modules.filter((m) => /\/m0\d$/.test(m.module)).length, 8);
  const gen = plan.modules.filter((m) => /\/m0\d$/.test(m.module));
  assert.ok(gen.every((m) => m.split && m.checkpoints.length === 5), "each module is five checkpoints (one per sub-folder)");
  assert.ok(gen.every((m) => m.checkpoints.every((c) => !c.over_budget && c.tokens <= plan.budget_tokens)));
  assert.equal(plan.within_session_budget, true);
  assert.ok(plan.session_share_percent <= 60, `the largest checkpoint is ${plan.session_share_percent}% of a session`);
  assert.equal(plan.created.length, plan.modules.length);
  console.log(`# plan: ${plan.modules.length} modules, ${gen.reduce((n, m) => n + m.checkpoints.length, 0)} checkpoints, largest ${plan.largest_checkpoint_tokens} tokens (${plan.session_share_percent}% of the window), ${ms3} ms`);
  const m = buildModel(root);
  assert.deepEqual(m.issues.filter((i) => i.severity === "error"), []);
  const change = m.changes.get(gen[0].change);
  assert.equal(change.kind, "knowledge");
  assert.equal(change.module, gen[0].module);
  assert.equal(parseCheckpoints(fs.readFileSync(path.join(m.root, change.file), "utf8")).length, 5);
  // Run again: nothing new, nothing duplicated.
  const again = planCommand(root, {});
  assert.deepEqual([again.created.length, again.skipped.length], [0, plan.modules.length]);

  // Adoption, checkpoint by checkpoint: a component per checkpoint (an agent does this with `new record component`).
  const done = [];
  const comps = [];
  let n = 500;
  for (const mod of gen) {
    const take = mod.module.endsWith("m08") ? 3 : 5; // the last module is left partly open
    for (const cp of mod.checkpoints.slice(0, take)) {
      n += 1;
      comps.push(`### CMP-CAMP-${n} · Adopted ${cp.part}`, "", "- **Owner:** roya-team", `- **Code:** ${cp.globs.join(", ")}`, "");
      done.push(cp.part);
    }
  }
  fs.appendFileSync(path.join(root, "project/knowledge/05-implementation/components/components.md"), `\n${comps.join("\n")}\n`);
  // Every module has a place in the architecture page (the layer every module needs).
  fs.appendFileSync(path.join(root, "project/knowledge/04-design/architecture.md"), `\n## Modules\n\n${gen.map((g) => `- ${path.posix.basename(g.module)}: generated code, described module by module`).join("\n")}\n`);
  const [after, ms4] = timed(() => adoptCommand(root));
  assert.ok(after.percent >= 80, `ownership ${after.percent}%`);
  assert.equal(after.layer_gap_modules, 0, "every module is covered by the architecture layer");
  const prog = after.progress.find((p) => p.module === gen[0].module);
  assert.deepEqual([prog.done, prog.total], [5, 5]);
  const last = after.progress.find((p) => p.module === gen[7].module);
  assert.deepEqual([last.done, last.total], [3, 5], "progress comes from what components own");
  assert.match(after.text, /Adoption changes \(checkpoints done, from code ownership\)/);
  const board = indexCommand(root).board;
  assert.match(board, /## Modules\n\n8 module\(s\) have an adoption change; 7 done, 1 to go\./);
  console.log(`# adopted ${done.length} checkpoints: ${after.percent}% owned, adopt ${ms4} ms, whole test ${Date.now() - t0} ms`);
});

test("adopt --plan --json is a contract envelope that validates; a different budget changes the split", () => {
  const root = makeProject({ features: 1, code: { modules: 2, subs: 4, files: 10, lines: 200 } });
  const run = (...args) => spawnSync(process.execPath, [BIN, ...args, "--json"], { encoding: "utf8", env: ENV });
  const small = run("adopt", "--plan", "--budget", "9000", root);
  const env = JSON.parse(small.stdout);
  assert.equal(env.ok, true, small.stdout + small.stderr);
  assert.deepEqual(validate(schema, env.data), []);
  const gen = env.data.modules.filter((x) => /\/m0\d$/.test(x.module));
  assert.equal(env.data.budget_tokens, 9000);
  assert.ok(gen.every((x) => x.checkpoints.length >= 4 && x.checkpoints.every((c) => c.tokens <= 9000)), JSON.stringify(gen.map((x) => x.checkpoints.map((c) => c.tokens))));
  assert.ok(env.events.some((e) => /^EVT-/.test(e)));
  // The budget can also live in the profile.
  const root2 = makeProject({ features: 1, code: { modules: 1, subs: 4, files: 10, lines: 200 } });
  const profile = path.join(root2, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("royascaff: 1.4\n", "royascaff: 1.4\nadopt_budget_tokens: 5000\n"));
  assert.equal(planCommand(root2, {}).budget_tokens, 5000);
  assert.equal(planCommand(root2, { budget: "7000" }).budget_tokens, 7000, "--budget wins");
});

test("scale (generated): hundreds of records validate, answer status and export, and a delta lists what depends on a requirement", () => {
  const root = makeProject({ features: 25 });
  const [m, msModel] = timed(() => buildModel(root));
  assert.ok(m.records.size >= 500, `${m.records.size} records`);
  assert.deepEqual(m.issues.filter((i) => i.severity === "error"), []);
  const run = (...args) => { const t = Date.now(); const r = spawnSync(process.execPath, [BIN, ...args, "--json"], { encoding: "utf8", env: ENV, maxBuffer: 256 * 1024 * 1024 }); return { env: JSON.parse(r.stdout), ms: Date.now() - t }; };
  const st = run("status", root);
  const ex = run("export", root);
  const ci = run("ci", root);
  assert.equal(st.env.ok, true);
  assert.equal(ex.env.ok, true);
  assert.equal(ex.env.data.records.length >= 500, true);
  assert.equal(ci.env.ok, true, JSON.stringify(ci.env.error));
  const ch = run("change", "REQ-CAMP-105", "--after", "The user can do thing 105 in feature 1, within two seconds.", "--why", "SRC-CAMP-003", "--by", "ai:claude", root);
  assert.equal(ch.env.ok, true, JSON.stringify(ch.env));
  assert.deepEqual(ch.env.data.affected.map((a) => a.item).sort(), ["CMP-CAMP-103", "SLC-CAMP-101-B", "TEST-CAMP-105"].sort());
  const rel = run("new", "record", "release", "1.0.0", "--includes", "CHG-CAMP-001", root);
  assert.equal(rel.env.ok, true);
  const diff = run("diff", "REL-CAMP-001", "now", root);
  assert.equal(diff.env.ok, true);
  const hist = run("history", "REQ-CAMP-105", root);
  assert.equal(hist.env.data.versions.length >= 1, true);
  console.log(`# ${m.records.size} records: model ${msModel} ms, status ${st.ms} ms, export ${ex.ms} ms, ci ${ci.ms} ms, change ${ch.ms} ms, release ${rel.ms} ms, diff ${diff.ms} ms, history ${hist.ms} ms`);
  void put;
});
