"use strict";

// E2.2: the person's check is general. The adapter's manifest says what kind it is (visual, transcript, demo,
// playtest), what the bar is called and what the person does; the core knows only "a person's check with a bar".
// The web behaviour stays as it was; the `transcript` check works on a command line fixture (acceptance A5).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const adapters = require("../lib/adapters.cjs");
const work = require("../lib/commands/work.cjs");
const { initProject } = require("../lib/commands/setup.cjs");
const { approveProject } = require("../lib/commands/approve.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { nextActions } = require("../lib/next/actions.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { projectBlockers } = require("../lib/approvals.cjs");
const kit = require("../lib/adapterkit.cjs");

const AI = { by: "ai:claude" };
const ME = { by: "islam" };
const CLI_FIXTURE = path.join(__dirname, "..", "..", "bench", "fixtures", "cli");

test("the manifests declare the kind of check: web-ui visual, node transcript, web-api demo; the most specific adapter wins", () => {
  const kinds = (names) => (adapters.policyOf(names).personCheck || {}).kind || null;
  assert.equal(kinds(["generic"]), null);
  assert.equal(kinds(["node"]), "transcript");
  assert.equal(kinds(["web-api"]), "demo");
  assert.equal(kinds(["web-ui"]), "visual", "web-ui includes node but is more specific");
  assert.equal(kinds(["web-ui", "web-3d"]), "visual");
  const web = adapters.policyOf(["web-ui"]);
  assert.deepEqual([web.personCheck.bar, web.personCheck.minLines, web.visualBar], ["Visual bar", 5, true]);
  assert.deepEqual(web.personLook, { kinds: ["feature", "polish"], minRisk: "medium" }, "the web person's look is unchanged");
  assert.deepEqual([adapters.policyOf(["node"]).personCheck.bar, adapters.policyOf(["node"]).personCheck.minLines], ["Usage bar", 3]);
  assert.equal(adapters.policyOf(["generic"]).visualBar, false);
});

test("older manifests (visualBar: true) still mean a visual check with a Visual bar of 5 lines; a camel-case bar name becomes words", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e22-"));
  fs.mkdirSync(path.join(dir, "adapters"));
  fs.writeFileSync(path.join(dir, "adapters", "old.json"), JSON.stringify({ adapter: "old", visualBar: true }));
  fs.writeFileSync(path.join(dir, "adapters", "game.json"), JSON.stringify({ adapter: "game", personCheck: { kind: "playtest", bar: "feelBar", minLines: 4, prompt: "Play a round." } }));
  assert.deepEqual(adapters.policyOf(["old"], dir).personCheck, { kind: "visual", bar: "Visual bar", minLines: 5, prompt: "", record: null });
  assert.deepEqual(adapters.policyOf(["game"], dir).personCheck, { kind: "playtest", bar: "Feel bar", minLines: 4, prompt: "Play a round.", record: null });
});

// A command line project: init with the node adapter, the tool written into the app, a recorded run declared.
function cliProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e22c-"));
  initProject(root, { name: "Todo CLI", code: "TODO", app: "cli=apps/cli", adapter: "node" });
  const app = path.join(root, "apps", "cli");
  fs.mkdirSync(app, { recursive: true });
  fs.copyFileSync(path.join(CLI_FIXTURE, "reference", "todo.cjs"), path.join(app, "todo.cjs"));
  return { root, app };
}
const edit = (root, rel, fn) => { const f = path.join(root, "project", rel); fs.writeFileSync(f, fn(fs.readFileSync(f, "utf8"))); };
// Topic 8 of the discovery holds the bar: its template hint is replaced by a sentence and the bar list.
const withBar = (root, label, lines) => edit(root, "knowledge/00-discovery/discovery.md", (t) => t.replace("_References, tone, brand, density, motion; what must not be copied._", `Plain.\n\n**${label}:**\n${lines.map((l) => `- ${l}`).join("\n")}`));

test("a node project is asked for a Usage bar (3 lines) before the project is approved, not a Visual bar", () => {
  const { root } = cliProject();
  const a = buildModel(root).approvals;
  assert.equal(a.personCheck.bar, "Usage bar");
  assert.equal(a.visualBarRequired, true);
  const blockers = projectBlockers(a);
  assert.ok(blockers.some((b) => /needs a `\*\*Usage bar:\*\*` list of at least 3 lines taken from the request .* \(0 now\)/.test(b)), blockers.join("\n"));
  assert.ok(!blockers.some((b) => /Visual bar/.test(b)));
  withBar(root, "Usage bar", ["A person learns the tool from help alone", "Errors say what to do next", "Nothing is printed that was not asked for"]);
  const bar = buildModel(root).approvals.discovery.visualBar;
  assert.deepEqual(bar, ["A person learns the tool from help alone", "Errors say what to do next", "Nothing is printed that was not asked for"]);
});

test("A5: the transcript check works on the CLI fixture: verify records the run, a person scores it against the Usage bar", () => {
  const { root, app } = cliProject();
  // The app declares its commands and the recorded run; the discovery holds the usage bar.
  edit(root, "profile.md", (t) => t
    .replace(/- \*\*Build:\*\*.*/, "- **Build:**").replace(/- \*\*Typecheck:\*\*.*/, "- **Typecheck:**").replace(/- \*\*Lint:\*\*.*/, "- **Lint:**")
    .replace(/(- \*\*Test:\*\*).*/, "$1 node -e 0")
    .replace(/(- \*\*Test:\*\* node -e 0)/, `$1\n- **Transcript:** node todo.cjs help ;; node todo.cjs add "Buy milk" ;; node todo.cjs add "" ;; node todo.cjs done 9`));
  assert.match(fs.readFileSync(path.join(root, "project/profile.md"), "utf8"), /\*\*Transcript:\*\* node todo.cjs help/);
  withBar(root, "Usage bar", ["A person learns the tool from help alone", "Errors say what to do next", "Nothing is printed that was not asked for"]);
  // A feature change at risk high needs the person's check (node: feature changes at high risk).
  const feature = path.join(root, "project/knowledge/00-roadmap/roadmap.md");
  fs.writeFileSync(feature, `${fs.readFileSync(feature, "utf8")}\n## CAP-TODO-001 · Tasks\n\n- **Owner:** team\n- **Priority:** must\n- **Horizon:** now\n\nA person keeps a list of tasks.\n\n| Slice | Title | Order | Depends on | Delivers | Planned at |\n|---|---|---|---|---|---|\n| SLC-TODO-001-A | The commands | 1 | — | REQ-TODO-001 | — |\n`);
  const reqs = path.join(root, "project/knowledge/02-requirements/requirements.md");
  fs.writeFileSync(reqs, `${fs.readFileSync(reqs, "utf8").replace(/\n## Record format[\s\S]*$/, "")}\n### REQ-TODO-001 · Add and list tasks\n\n- **Priority:** should\n- **Owner:** team\n- **Feature:** CAP-TODO-001\n\nA person adds a task and sees it in the list.\n\n**Acceptance**\n- [manual] Errors say what to do next.\n`);
  const created = work.recordWork(root, [], "the commands", { as: "feature", slice: "SLC-TODO-001-A", files: "apps/cli/todo.cjs", ...ME, risk: "high" });
  const id = created.id;
  const m0 = buildModel(root);
  assert.equal(m0.changes.get(id).risk, "high");

  const r = work.verify(root, id, AI);
  assert.equal(r.mode, "verify");
  assert.equal(r.results.find((x) => x.kind === "Record").pass, true, "a recorded run passes even when its commands exit with an error");
  assert.match(r.transcript, /project\/changes\/CHG-TODO-001\/evidence\/transcripts\/EVD-TODO-\d+\/session\.md$/);
  const text = fs.readFileSync(path.join(root, r.transcript), "utf8");
  assert.match(text, /## \$ node todo\.cjs help\n\nexit status 0\n\n```text\nUsage: node todo\.cjs <command>/);
  assert.match(text, /## \$ node todo\.cjs add ""\n\nexit status 1\n\n```text\nTitle is required\. Give the task a title/);
  assert.match(text, /## \$ node todo\.cjs done 9\n\nexit status 1\n\n```text\nNo task with id 9\. Run "node todo\.cjs list"/);
  const ev = buildModel(root).records.get(r.evidence);
  assert.match(ev.fields.Transcript, /^transcripts\/EVD-TODO-\d+\/session\.md$/);

  // The change needs the person's transcript check; the gate says so in the adapter's words.
  const g = work.advance(root, id, "verified", ME);
  const gate = g.steps[g.steps.length - 1].checks.find((c) => c.id === "visual-check");
  assert.ok(gate && !gate.ok, JSON.stringify(g.steps[g.steps.length - 1].checks.filter((c) => !c.ok)));
  assert.match(gate.message, /a person's transcript check \(read the recorded run of the commands and their output, and score it against the usage bar\), recorded with royascaff check CHG-TODO-001 --result pass --note "checked …" --bar all\|1,2,4\|none/);

  // An AI cannot record it; without a bar the person is shown what to score and what to read.
  work.recordCheck(root, id, { result: "pass", note: "checked", bar: "all", ...AI });
  assert.equal(buildModel(root).changes.get(id).events.filter((e) => e.event === "check.run" && /bar:/.test(e.note || "")).length, 0, "an AI's pass is not a person's check");
  const g1 = work.advance(root, id, "verified", ME);
  assert.ok(g1.steps[g1.steps.length - 1].checks.some((c) => c.id === "visual-check" && !c.ok), "still waiting for a person");
  assert.throws(() => work.recordCheck(root, id, { result: "pass", note: "checked", ...ME }), (e) => /Score the transcript check against the usage bar with --bar all[\s\S]*1\. A person learns the tool from help alone[\s\S]*Latest recorded run:\n  project\/changes\/CHG-TODO-001\/evidence\/transcripts\/EVD-TODO-\d+\/session\.md/.test(e.message));

  // The person scores it: two of three lines pass; the gap shows on the board and the prompt names the transcript.
  let prompt = "";
  const rec = work.recordCheck(root, id, { result: "pass", note: "read the run", bar: "1,2", ...ME, confirm: (p) => { prompt = p; return "yes"; } });
  assert.match(prompt, /CHG-TODO-001 · your transcript check against the usage bar:\n  ✓ 1\. A person learns the tool from help alone\n  ✓ 2\. Errors say what to do next\n  ✗ 3\. Nothing is printed that was not asked for\nRecorded run:\n  project\/changes\/CHG-TODO-001\/evidence\/transcripts\/EVD-TODO-\d+\/session\.md\nRecord this transcript check as islam\? Type yes: /);
  assert.match(rec.note, /^pass with gaps 3: read the run · bar: 2 of 3 · look:tty$/);
  assert.equal(require("../lib/smoke.cjs").barGaps(buildModel(root).changes.get(id)).join(), "3");
  assert.equal(buildModel(root).changes.get(id).events.at(-1).by, "islam");
  const g2 = work.advance(root, id, "verified", ME);
  assert.ok(!g2.steps[g2.steps.length - 1].checks.some((c) => c.id === "visual-check" && !c.ok), "the person's check is recorded");
});

test("a playtest check from a project's own adapter: its own bar name and prompt reach the approval and the gate", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e22g-"));
  initProject(root, { name: "Game", code: "GAME", app: "web=apps/web" });
  kit.newAdapter(root, "my-game");
  fs.writeFileSync(path.join(root, "project/adapters/my-game.json"), JSON.stringify({ adapter: "my-game", personCheck: { kind: "playtest", bar: "Feel bar", minLines: 2, prompt: "Play one round." }, personLook: { kinds: ["feature"], minRisk: "low" } }));
  edit(root, "profile.md", (t) => t.replace(/adapters: \[.*\]/, "adapters: [my-game]"));
  const a = buildModel(root).approvals;
  assert.deepEqual([a.personCheck.kind, a.personCheck.bar, a.personCheck.minLines], ["playtest", "Feel bar", 2]);
  assert.ok(projectBlockers(a).some((b) => /needs a `\*\*Feel bar:\*\*` list of at least 2 lines/.test(b)));
  withBar(root, "Feel bar", ["Controls respond at once", "Difficulty rises smoothly"]);
  assert.deepEqual(buildModel(root).approvals.discovery.visualBar, ["Controls respond at once", "Difficulty rises smoothly"]);
});

test("web-ui is unchanged: the Visual bar, the 5 lines and the look wording stay", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e22w-"));
  initProject(root, { name: "Web", code: "WEB", app: "web=apps/web", adapter: "web-ui" });
  const a = buildModel(root).approvals;
  assert.deepEqual([a.personCheck.kind, a.personCheck.bar, a.personCheck.minLines], ["visual", "Visual bar", 5]);
  assert.ok(projectBlockers(a).some((b) => /needs a `\*\*Visual bar:\*\*` list of at least 5 lines/.test(b)));
});

