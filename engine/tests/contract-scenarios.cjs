"use strict";

// One real call for every command in contract.COMMANDS, run through the real CLI with --json on
// throwaway copies of the fixtures. Used by the contract tests (schemas, goldens) and by the helper
// that writes the golden files. Never run on the fixture folders themselves: some commands write.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const FIXTURES = path.join(__dirname, "fixtures");

const env = {
  ...process.env,
  ROYASCAFF_USAGE: "off",
  ROYASCAFF_NO_TTY: "1",
  ROYASCAFF_USER: "islam",
  GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "dev@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "dev@example.com",
};
delete env.ROYASCAFF_APPROVAL_TOKEN;
delete env.ROYASCAFF_NONINTERACTIVE;

function copyFixture(name) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `rs-scn-${name}-`));
  fs.cpSync(path.join(FIXTURES, name), root, { recursive: true });
  return root;
}

function call(args, extraEnv = {}) {
  const r = spawnSync(process.execPath, [BIN, ...args, "--json"], { encoding: "utf8", env: { ...env, ...extraEnv }, maxBuffer: 64 * 1024 * 1024 });
  let envelope = null;
  try {
    envelope = JSON.parse(r.stdout);
  } catch {
    // left null: the test reports it
  }
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, envelope };
}

// Each scenario: { command, name, args: (ctx) => [...], expect: "ok" | "<ERROR_CODE>" }.
// `ctx` has `root` (greenfield copy), `old` (1.3 copy), `fresh` (empty folder) and `tmp` (a scratch folder).
function scenarios() {
  const S = [];
  const add = (command, name, args, expect = "ok", before) => S.push({ command, name, args, expect, before });
  const edit = (root, rel, fn) => { const f = path.join(root, "project", rel); fs.writeFileSync(f, fn(fs.readFileSync(f, "utf8"))); };

  add("where", "where", (c) => ["where", c.root]);
  add("export", "export", (c) => ["export", c.root]);
  add("export", "export --out", (c) => ["export", c.root, "--out", path.join(c.tmp, "exchange.json")]);
  add("render", "render", (c) => ["render", path.join(c.tmp, "exchange.json"), "--out", path.join(c.tmp, "rendered")]);
  add("roundtrip", "roundtrip", (c) => ["roundtrip", c.root]);
  add("index", "index", (c) => ["index", c.root]);
  add("status", "status", (c) => ["status", c.root]);
  add("tasks", "tasks", (c) => ["tasks", c.root]);
  add("trace", "trace", (c) => ["trace", "CAP-CAMP-001", c.root]);
  add("log", "log", (c) => ["log", c.root]);
  add("events", "events", (c) => ["events", c.root]);
  add("events", "events --since an event", (c) => ["events", c.root, "--since", "EVT-CHG-CAMP-001-0001"]);
  add("next", "next", (c) => ["next", c.root]);
  add("brief", "brief", (c) => ["brief", c.root]);
  add("show", "show", (c) => ["show", "REQ-CAMP-001", c.root]);
  add("validate", "validate", (c) => ["validate", c.root]);
  add("open", "open --kind chore", (c) => ["open", "--kind", "chore", "Tidy the styles", c.root]);
  add("advance", "advance (already there)", (c) => ["advance", "CHG-CAMP-001", "--to", "closed", c.root]);
  add("advance", "advance (a gate refuses)", (c) => ["advance", "CHG-CAMP-004", "--to", "analyzed", c.root], "GATE_REFUSED");
  add("block", "block", (c) => ["block", "CHG-CAMP-004", "--reason", "waiting for the designer", c.root]);
  add("unblock", "unblock", (c) => ["unblock", "CHG-CAMP-004", c.root]);
  add("new", "new task", (c) => ["new", "task", "CHG-CAMP-004", "Tidy the header", c.root]);
  add("new", "new record", (c) => ["new", "record", "question", "Which colour for errors?", c.root]);
  add("new", "new feature", (c) => ["new", "feature", "Export a campaign", c.root]);
  add("new", "new slice", (c) => ["new", "slice", "CAP-CAMP-001", "Export button", c.root]);
  add("new", "new doc", (c) => ["new", "doc", "security", c.root]);
  add("approve", "approve (an AI may not)", (c) => ["approve", "CHG-CAMP-004", "--by", "ai:claude", c.root], "HUMAN_REQUIRED");
  add("approve", "approve a design", (c) => ["approve", "CHG-CAMP-004", "--by", "islam", c.root], "ok", (c) => edit(c.root, "changes/CHG-CAMP-004/change.md", (t) => t.replace(/^status: .*$/m, "status: analyzed")));
  add("task", "task block", (c) => ["task", "TASK-CAMP-004", "block", "waiting for the designer", c.root, "--by", "ai:claude"]);
  add("check", "check --result pass", (c) => ["check", "CHG-CAMP-002", "--result", "pass", "--note", "ran by hand", "--by", "ai:claude", c.root]);
  add("check", "check --result fail", (c) => ["check", "CHG-CAMP-002", "--result", "fail", "--note", "broke", "--by", "ai:claude", c.root], "CHECK_FAILED");
  add("context", "context", (c) => ["context", "TASK-CAMP-004", c.root]);
  add("record", "record --files", (c) => ["record", "--files", "apps/web/x.txt", "--as", "chore", "tidy by hand", "--path", c.root]);
  add("refine", "refine (a 1.3 project)", (c) => ["refine", "CHG-KUNI-001", "--by", "islam", c.old]);
  add("backups", "backups", (c) => ["backups", c.root]);
  add("feedback", "feedback", (c) => ["feedback", "It was clear", "--kind", "praise", c.root]);
  add("usage", "usage", (c) => ["usage", c.root]);
  add("cache", "cache clear", (c) => ["cache", "clear", c.root]);
  add("measure", "measure (an outcome that does not exist)", (c) => ["measure", "OUT-CAMP-404", "--result", "met", "--note", "x", c.root], "UNKNOWN_ID");
  add("verify", "verify", (c) => ["verify", "CHG-CAMP-002", c.root, "--by", "ai:claude"], "ok", (c) => edit(c.root, "profile.md", (t) => ["Build", "Typecheck", "Lint"].reduce((s, k) => s.replace(new RegExp(`- \\*\\*${k}:\\*\\* .*`), `- **${k}:**`), t).replace(/- \*\*Test:\*\* .*/, "- **Test:** node -e 0")));
  add("judge", "judge (the pack)", (c) => ["judge", "CHG-CAMP-002", c.root]);
  add("judge", "judge (the builder may not)", (c) => ["judge", "CHG-CAMP-002", "--line", "REQ-CAMP-003#1", "--verdict", "met", "--reason", "looks right", "--by", "ai:claude", c.root], "GATE_REFUSED");
  add("scan", "scan", (c) => ["scan", c.root]);
  add("scan", "scan (a module that does not exist)", (c) => ["scan", "nope", c.root], "UNKNOWN_ID");
  add("inventory", "inventory", (c) => ["inventory", c.root]);
  add("ci", "ci", (c) => ["ci", c.root]);
  add("ci", "ci (a gate fails)", (c) => ["ci", c.root], "CHECK_FAILED", (c) => edit(c.root, "knowledge/02-requirements/requirements.md", (t) => t.replace("**Verified by:** TEST-CAMP-001", "**Verified by:** TEST-CAMP-999")));
  add("confirm", "confirm (an AI may not)", (c) => ["confirm", "REQ-CAMP-001", "--by", "ai:claude", c.root], "HUMAN_REQUIRED", (c) => edit(c.root, "knowledge/02-requirements/requirements.md", (t) => t.replace("**Verified by:** TEST-CAMP-999", "**Verified by:** TEST-CAMP-001").replace("- **Verified by:** TEST-CAMP-001\n", "- **Verified by:** TEST-CAMP-001\n- **Basis:** inferred from apps/web/src/campaigns\n- **Inferred on:** 2026-09-30\n")));
  add("confirm", "confirm", (c) => ["confirm", "REQ-CAMP-001", "--by", "islam", c.root]);
  add("adopt", "adopt docs", (c) => ["adopt", "docs", "apps/web", c.root]);
  add("new", "new record release", (c) => ["new", "record", "release", "1.0.0", c.root]);
  add("release", "release (writes the baseline)", (c) => ["release", "REL-CAMP-001", "--baseline", c.root]);
  add("release", "release (a baseline is frozen)", (c) => ["release", "REL-CAMP-001", c.root], "ALREADY_EXISTS");
  add("release", "release (not a release)", (c) => ["release", "REQ-CAMP-001", c.root], "INVALID_INPUT");
  add("new", "new record release with its includes (writes the baseline too)", (c) => ["new", "record", "release", "1.1.0", "--includes", "CHG-CAMP-001", c.root]);
  add("diff", "diff two baselines", (c) => ["diff", "REL-CAMP-001", "REL-CAMP-002", c.root]);
  add("diff", "diff a baseline and now", (c) => ["diff", "REL-CAMP-001", "now", c.root]);
  add("diff", "diff (no baseline)", (c) => ["diff", "REL-CAMP-009", c.root], "UNKNOWN_ID");
  add("history", "history", (c) => ["history", "REQ-CAMP-001", c.root]);
  add("history", "history (not a record)", (c) => ["history", "REQ-CAMP-404", c.root], "UNKNOWN_ID");
  add("new", "new record flag", (c) => ["new", "record", "flag", "New campaign form", "--hides", "CAP-CAMP-001", "--remove-by", "2099-01-01", c.root]);
  add("new", "new record experiment", (c) => ["new", "record", "experiment", "Shorter campaign form", "--feature", "CAP-CAMP-001", "--outcome", "OUT-CAMP-001", "--hypothesis", "Three fields raise sign-ups.", "--variants", "A: six fields ; B: three fields", "--metric", "signup_rate >= 0.05", c.root]);
  add("measure", "measure an experiment (an AI may not)", (c) => ["measure", "EXP-CAMP-001", "--result", "keep B", "--note", "signup_rate 0.07", "--by", "ai:claude", c.root], "HUMAN_REQUIRED");
  add("measure", "measure an experiment", (c) => ["measure", "EXP-CAMP-001", "--result", "keep B", "--note", "signup_rate 0.07 over 2 weeks", "--by", "islam", c.root]);
  add("deprecate", "deprecate a requirement", (c) => ["deprecate", "REQ-CAMP-002", "--reason", "replaced by search", "--by", "islam", c.root]);
  add("deprecate", "deprecate (not a requirement or component)", (c) => ["deprecate", "CAP-CAMP-001", c.root], "INVALID_INPUT");
  add("rollback", "rollback a change", (c) => ["rollback", "CHG-CAMP-001", "--by", "islam", c.root]);
  add("rollback", "rollback (the change is still open)", (c) => ["rollback", "CHG-CAMP-002", c.root], "GATE_REFUSED");
  add("change", "change a requirement", (c) => ["change", "REQ-CAMP-001", "--after", "A planner saves a campaign with a name of at most 80 characters.", "--why", "SRC-CAMP-003", "--by", "ai:claude", c.root]);
  add("change", "change (not a requirement, workflow or contract)", (c) => ["change", "CAP-CAMP-001", c.root], "INVALID_INPUT");
  add("adapter", "adapter new", (c) => ["adapter", "new", "demo-stack", "--includes", "node", c.root]);
  add("adapter", "adapter test", (c) => ["adapter", "test", "demo-stack", c.root]);
  add("adapter", "adapter test (a manifest that does not fit)", (c) => ["adapter", "test", "broken-stack", c.root], "CHECK_FAILED", (c) => {
    fs.mkdirSync(path.join(c.root, "project", "adapters"), { recursive: true });
    fs.writeFileSync(path.join(c.root, "project", "adapters", "broken-stack.json"), JSON.stringify({ adapter: "broken-stack", checks: { unit: "no-such-program-xyz" } }));
    fs.writeFileSync(path.join(c.root, "project", "adapters", "broken-stack.md"), "# Adapter · broken-stack\n\n## Design\n\n- A line.\n\n## Rules\n\n- A rule.\n\n## Check\n\n- A check.\n");
  });
  add("continue", "continue", (c) => ["continue", c.root]);
  add("adopt", "adopt", (c) => ["adopt", c.root]);
  add("migrate", "migrate (dry run, 1.3)", (c) => ["migrate", c.old, "--from", "1.3", "--code", "KUNI"]);
  add("init", "init", (c) => ["init", c.fresh, "--name", "Demo", "--code", "DEMO", "--app", "web=apps/web", "--adapter", "web-ui"]);
  add("smoke", "smoke init", (c) => ["smoke", "init", c.fresh]);
  add("install", "install", (c) => ["install", c.fresh, "--claude"]);
  add("contract", "contract", (c) => ["contract", c.root]);
  return S;
}

// Runs every scenario in order against the same copies and returns [{ command, name, expect, result }].
function runAll() {
  const ctx = { root: copyFixture("greenfield"), old: copyFixture("kuni-1.3"), fresh: fs.mkdtempSync(path.join(os.tmpdir(), "rs-scn-fresh-")), tmp: fs.mkdtempSync(path.join(os.tmpdir(), "rs-scn-tmp-")) };
  const out = [];
  for (const s of scenarios()) {
    if (s.before) s.before(ctx);
    out.push({ command: s.command, name: s.name, expect: s.expect, ...call(s.args(ctx)) });
  }
  return { ctx, results: out };
}

module.exports = { BIN, env, call, copyFixture, scenarios, runAll };
