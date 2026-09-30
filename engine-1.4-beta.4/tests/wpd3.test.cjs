"use strict";

// Beta.4 · WP-D3: the Context Pack carries the design — architecture, the rules that apply, the
// domain rules linked to the task, the pages of the Impact's layers, and the visual bar — within
// the budget, saying what was left out.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildModel } = require("../lib/model/graph.cjs");
const { deriveStatus } = require("../lib/derive/status.cjs");
const { buildPack } = require("../lib/context.cjs");
const { newRecord, newDoc } = require("../lib/commands/plan.cjs");

const GREEN = path.join(__dirname, "fixtures", "greenfield");
const copy = () => { const r = fs.mkdtempSync(path.join(os.tmpdir(), "rs-d3-")); fs.cpSync(GREEN, r, { recursive: true }); return r; };
const file = (root, rel) => path.join(root, "project", rel);
const edit = (root, rel, fn) => fs.writeFileSync(file(root, rel), fn(fs.readFileSync(file(root, rel), "utf8")));
const pack = (root, task = "TASK-CAMP-004") => { const m = buildModel(root); return buildPack(m, deriveStatus(m), task); };
const IMPACT = "## Impact\n\n| Layer | State | Affected IDs / pages | Reason |\n|---|---|---|---|\n| Business | unchanged | | |\n| Requirements | referenced | REQ-CAMP-003 | |\n| Domain | unchanged | | |\n| Architecture | unchanged | | |\n| Data | unchanged | | |\n| Contracts | unchanged | | |\n| Experience | referenced | experience.md | |\n| Security | unchanged | | |\n| Components & tests | changed | CMP-CAMP-CALENDAR | |\n| Quality & operations | unchanged | | |\n";

test("architecture main parts and dependency rules are in every pack", () => {
  const root = copy();
  edit(root, "knowledge/04-design/architecture.md", (t) => t.replace(/(## 5\. Dependency rules\n\n)[^\n]*/, "$1- `apps/web/src/calendar/**` must not import `apps/web/src/campaigns/**`."));
  const p = pack(root);
  assert.match(p.text, /## Architecture \(main parts and dependency rules\)[\s\S]*### Dependency rules\n\n- `apps\/web\/src\/calendar\/\*\*` must not import/);
});

test("project rules reach the tasks they apply to: project-wide, by component, by path — not others", () => {
  const root = copy();
  for (const [title, applies] of [["Dates use the client's time zone", ""], ["Calendar cells stay square", "CMP-CAMP-CALENDAR"], ["Drag uses pointer events", "apps/web/src/calendar/dnd"], ["Campaign names are unique", "CMP-CAMP-CAMPAIGNS"]]) {
    newRecord(root, "rule", title, { applies });
  }
  const p = pack(root);
  assert.match(p.text, /## Project rules that apply to this task/);
  for (const t of ["Dates use the client's time zone", "Calendar cells stay square", "Drag uses pointer events"]) assert.match(p.text, new RegExp(t.replace(/'/g, ".")));
  assert.doesNotMatch(p.text, /Campaign names are unique/);
});

test("domain invariants linked to the task's requirement reach the pack", () => {
  const root = copy();
  newRecord(root, "invariant", "A post is scheduled inside its campaign's dates", { feature: "REQ-CAMP-003" });
  newRecord(root, "invariant", "An agency sees only its own clients", {});
  const p = pack(root);
  assert.match(p.text, /## Domain rules and words for this task[\s\S]*A post is scheduled inside its campaign's dates/);
  assert.doesNotMatch(p.text, /An agency sees only its own clients/);
});

test("the Impact's referenced pages bring their sections; named records come in full; the visual bar is there for UI adapters", () => {
  const root = copy();
  newDoc(root, "experience");
  edit(root, "knowledge/04-design/experience.md", (t) => t.replace(/(## 4\. Design tokens\n\n)_[^\n]*_/, "$1| `color.bg` | `#fbfaf7` | page |"));
  edit(root, "changes/CHG-CAMP-002/change.md", (t) => t.replace("## Outcome", `${IMPACT}\n## Outcome`));
  let p = pack(root);
  assert.match(p.text, /## Design pages of the changed and referenced layers\n\nFrom `knowledge\/04-design\/experience\.md`:\n\n### Design tokens\n\n\| `color\.bg` \| `#fbfaf7` \| page \|/);
  assert.doesNotMatch(p.text, /### Accessibility/, "only the sections the registry names, and only filled ones");
  assert.doesNotMatch(p.text, /Visual bar/, "generic adapter: no bar");
  edit(root, "profile.md", (t) => t.replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [web-ui]\n"));
  p = pack(root);
  assert.match(p.text, /## Visual bar \(the person scores the result against it\)\n\n1\. Calm like a paper planner/);
});

test("over budget, the design context is left out from the lowest priority and the pack says so", () => {
  const root = copy();
  newDoc(root, "experience");
  edit(root, "knowledge/04-design/experience.md", (t) => t.replace(/(## 4\. Design tokens\n\n)_[^\n]*_/, `$1${"| `token` | value | use |\n".repeat(80)}`));
  edit(root, "changes/CHG-CAMP-002/change.md", (t) => t.replace("## Outcome", `${IMPACT}\n## Outcome`));
  const full = pack(root);
  assert.ok(full.design.includes("Design pages of the changed and referenced layers"));
  edit(root, "profile.md", (t) => t.replace("royascaff: 1.4\n", `royascaff: 1.4\ncontext_budget_tokens: ${full.tokens - 200}\n`));
  const p = pack(root);
  assert.ok(p.within, `${p.tokens} of ${p.budget}`);
  assert.deepEqual(p.dropped, ["Design pages of the changed and referenced layers"]);
  assert.match(p.text, /## Left out to fit the budget\n\n- Design pages of the changed and referenced layers/);
  assert.ok(p.design.includes("Architecture (main parts and dependency rules)"), "higher priority parts stay");
});
