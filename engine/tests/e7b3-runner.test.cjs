"use strict";

// E7b.3: the runner protocol (plan 03 §7) and its reference runner. Acceptance C4: a reference runner runs one task end to end
// against a test queue: it takes the job, clones a fixture repository, pins the engine, runs a scripted agent, streams events,
// pushes only the job's branch and reports the result. It refuses repositories it cannot reach and stops at max_turns or the budget.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { validate } = require("./schema-lite.cjs");
const { readyProject } = require("./ready-project.cjs");
const { runner } = require("../runner-reference/runner.cjs");
const pkg = require("../package.json");

const ROOT = path.join(__dirname, "..");
const AGENT = path.join(ROOT, "runner-reference", "fake-agent.cjs");
const schemaOf = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "contract", "schemas", "runner", `${name}.json`), "utf8"));
const TOKEN = "queue-token-for-tests";
const tmp = (label) => fs.mkdtempSync(path.join(os.tmpdir(), `rs-${label}-`));
const git = (cwd, ...args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "dev@example.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "dev@example.com" } });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};

// A test queue: GET /jobs/next, POST /jobs/:id/accept, /events, /result. Every call needs the bearer token.
function startQueue(jobs, { cancelAfter = null } = {}) {
  const state = { events: [], results: [], accepted: [], unauthorized: 0 };
  const server = http.createServer((req, res) => {
    if (req.headers.authorization !== `Bearer ${TOKEN}`) {
      state.unauthorized += 1;
      res.writeHead(401);
      return res.end();
    }
    const send = (code, body) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(body === undefined ? undefined : JSON.stringify(body));
    };
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : null;
      const url = new URL(req.url, "http://x");
      if (req.method === "GET" && url.pathname === "/jobs/next") {
        if (jobs.length) return send(200, jobs.shift());
        return setTimeout(() => send(204), 300);
      }
      const m = /^\/jobs\/([^/]+)\/(accept|events|result)$/.exec(url.pathname);
      if (!m || req.method !== "POST") return send(404, { error: "unknown" });
      if (m[2] === "accept") {
        state.accepted.push(m[1]);
        return send(200, {});
      }
      if (m[2] === "events") {
        state.events.push(...body.events);
        return send(200, { cancel: cancelAfter !== null && state.events.length >= cancelAfter });
      }
      state.results.push(body);
      return send(200, {});
    });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ ...state, state, url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}

// A fixture repository with a ready task (through the CLI), cloned to a bare "remote" holding main and the job's branch.
function fixtureRemote() {
  const p = readyProject({ git: true });
  const remote = path.join(tmp("remote"), "origin.git");
  git(p.repo, "clone", "-q", "--bare", p.repo, remote);
  git(remote, "branch", "rs/job-1", "main");
  const pack = spawnSync(process.execPath, [path.join(ROOT, "bin", "royascaff.cjs"), "context", p.task, "--json", "--path", p.repo], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } });
  return { ...p, remote, context: JSON.parse(pack.stdout).data.text };
}

const job = (f, over = {}) => ({
  job_id: "job-1",
  project_git_url: f.remote,
  branch: "rs/job-1",
  change: f.change,
  task: f.task,
  engine_version: pkg.version,
  agent: { kind: "claude-cli", model: "scripted", max_turns: 20, budget: { max_usd: 5 } },
  prompt: `Do ${f.task}. Use the context pack; do not scan the repository.`,
  context_pack: f.context,
  ...over,
});

const config = (q, scenario) => ({ queue: q.url, token: TOKEN, workspace: tmp("ws"), engine: ROOT, agentCommand: `node "${AGENT}" ${scenario}`, once: true, wait: 1 });
const heads = (remote) => Object.fromEntries(git(remote, "for-each-ref", "--format=%(refname) %(objectname)", "refs/heads").split("\n").map((l) => l.split(" ")).map(([r, sha]) => [r.replace(/^refs\/heads\//, ""), sha]));

test("the job and event schemas: a good message passes, a message of the wrong shape does not", () => {
  const f = { remote: "/x", change: "CHG-A-001", task: "TASK-A-001", context: "pack" };
  assert.deepEqual(validate(schemaOf("job"), job(f)), []);
  assert.ok(validate(schemaOf("job"), { ...job(f), task: "nope" }).length > 0, "a task ID");
  assert.ok(validate(schemaOf("job"), { ...job(f), agent: { kind: "other", max_turns: 3, budget: {} } }).length > 0, "an agent kind");
  assert.ok(require("../lib/schema.cjs").validate(schemaOf("job"), { ...job(f), agent: { kind: "claude-cli", max_turns: 0, budget: {} } }).length > 0, "max_turns is at least 1");
  const base = { job_id: "j", seq: 1, at: "2026-10-01T00:00:00Z" };
  assert.deepEqual(validate(schemaOf("event.log"), { ...base, type: "log", stream: "stdout", text: "hi" }), []);
  assert.deepEqual(validate(schemaOf("event.tool_use"), { ...base, type: "tool_use", tool: "royascaff claim", input: {} }), []);
  assert.deepEqual(validate(schemaOf("event.cost"), { ...base, type: "cost", turns: 1, usd: 0.1 }), []);
  assert.deepEqual(validate(schemaOf("event.done"), { ...base, type: "done", reason: "max_turns" }), []);
  assert.deepEqual(validate(schemaOf("event.error"), { ...base, type: "error", code: "REPO_ACCESS", message: "no" }), []);
  assert.deepEqual(validate(schemaOf("event.royascaff_event"), { ...base, type: "royascaff_event", event: { id: "EVT-PROJECT-0001", when: "x", event: "claim.acquired", target: "TASK-A-001", by: "ai:x" } }), []);
  assert.ok(validate(schemaOf("event.cost"), { ...base, type: "log", turns: 1 }).length > 0, "the type is fixed");
  assert.ok(validate(schemaOf("event.done"), { ...base, type: "done", reason: "tired" }).length > 0);
  assert.deepEqual(validate(schemaOf("result"), { job_id: "j", status: "succeeded", branch: "b", pushed: true, turns: 1, events: 3 }), []);
  assert.ok(validate(schemaOf("result"), { job_id: "j", status: "great", branch: "b", pushed: true, turns: 1, events: 3 }).length > 0);
  for (const name of ["job", "event.log", "event.tool_use", "event.royascaff_event", "event.cost", "event.done", "event.error", "result"]) assert.match(schemaOf(name).$id, new RegExp(`/contract/${pkg.version.slice(0, 0)}1\\.\\d+/runner/${name}\\.json$`));
});

test("C4: the reference runner runs one task end to end against a test queue", async () => {
  const f = fixtureRemote();
  const mainBefore = heads(f.remote).main;
  const q = await startQueue([job(f)]);
  process.env.SECRET_TOKEN_FOR_TEST = "must-not-reach-the-agent";
  let result;
  try {
    result = await runner(config(q, "task"));
  } finally {
    delete process.env.SECRET_TOKEN_FOR_TEST;
    q.close();
  }
  assert.equal(q.state.unauthorized, 0, "every call carried the token");
  assert.deepEqual(q.state.accepted, ["job-1"]);
  assert.equal(q.state.results.length, 1);
  assert.deepEqual(q.state.results[0], result);
  assert.equal(result.status, "succeeded", JSON.stringify(result) + JSON.stringify(q.state.events.filter((e) => e.type === "error" || e.stream === "stderr")));
  assert.equal(result.pushed, true);
  assert.equal(result.engine_version, pkg.version);
  assert.deepEqual(validate(schemaOf("result"), result), []);

  // Only the job's branch moved, and it holds the agent's work and the RoyaScaff events.
  const after = heads(f.remote);
  assert.deepEqual(Object.keys(after).sort(), ["main", "rs/job-1"], "no other branch was created");
  assert.equal(after.main, mainBefore, "main did not move");
  assert.equal(after["rs/job-1"], result.commit);
  assert.match(git(f.remote, "show", `${result.commit}:apps/web/src/results/table.js`), /reach/);
  assert.match(git(f.remote, "show", `${result.commit}:project/changes/${f.change}/log.md`), /task\.done[^\n]*TASK-PORT-001/);

  // The stream: numbered in order, every event valid for its type, and the kinds the protocol names.
  const events = q.state.events;
  assert.equal(result.events, events.length);
  assert.deepEqual(events.map((e) => e.seq), events.map((_, i) => i + 1));
  for (const e of events) assert.deepEqual(validate(schemaOf(`event.${e.type}`), e), [], JSON.stringify(e));
  const types = new Set(events.map((e) => e.type));
  for (const t of ["log", "tool_use", "royascaff_event", "cost", "done"]) assert.ok(types.has(t), `a ${t} event`);
  assert.equal(types.has("error"), false);
  const rs = events.filter((e) => e.type === "royascaff_event").map((e) => e.event.event);
  for (const t of ["claim.acquired", "task.started", "task.done"]) assert.ok(rs.includes(t), `the stream carries ${t}`);
  assert.equal(events[events.length - 1].type, "done");
  assert.equal(events[events.length - 1].reason, "finished");
  assert.ok(events.filter((e) => e.type === "tool_use").some((e) => e.tool === "royascaff claim"));
  const costs = events.filter((e) => e.type === "cost");
  assert.deepEqual(costs.map((c) => c.turns), costs.map((_, i) => i + 1));
});

test("the agent gets no credentials of the machine: the environment is a short list", async () => {
  const f = fixtureRemote();
  const q = await startQueue([job(f)]);
  process.env.SECRET_TOKEN_FOR_TEST = "must-not-reach-the-agent";
  process.env.ROYASCAFF_RUNNER_TOKEN = TOKEN;
  try {
    await runner(config(q, "env"));
  } finally {
    delete process.env.SECRET_TOKEN_FOR_TEST;
    delete process.env.ROYASCAFF_RUNNER_TOKEN;
    q.close();
  }
  const line = q.state.events.find((e) => e.type === "log" && /ENV \[/.test(e.text));
  assert.ok(line, "the agent reported its environment");
  const keys = JSON.parse(line.text.slice(4));
  assert.equal(keys.includes("SECRET_TOKEN_FOR_TEST"), false);
  assert.equal(keys.includes("ROYASCAFF_RUNNER_TOKEN"), false);
  assert.ok(keys.includes("ROYASCAFF_BIN") && keys.includes("ROYASCAFF_JOB_FILE"));
});

test("it refuses a repository the local user cannot access: nothing is cloned or pushed", async () => {
  const f = fixtureRemote();
  const gone = path.join(tmp("gone"), "nothing-here.git");
  const q = await startQueue([job(f, { project_git_url: gone })]);
  const cfg = config(q, "task");
  let result;
  try {
    result = await runner(cfg);
  } finally {
    q.close();
  }
  assert.equal(result.status, "refused");
  assert.equal(result.pushed, false);
  assert.ok(q.state.events.some((e) => e.type === "error" && e.code === "REPO_ACCESS"));
  assert.equal(q.state.events.some((e) => e.type === "tool_use"), false, "the agent never ran");
  assert.equal(fs.existsSync(path.join(cfg.workspace, "job-1")), false, "no workspace");
  assert.deepEqual(Object.keys(heads(f.remote)).sort(), ["main", "rs/job-1"]);
});

test("it refuses a job for another engine version, and a job whose branch is protected or the default", async () => {
  const f = fixtureRemote();
  const q = await startQueue([job(f, { engine_version: "0.0.1" }), job(f, { job_id: "job-2", branch: "main" }), job(f, { job_id: "job-3", branch: "../escape" }), job(f, { job_id: "job-4", project_git_url: "" })]);
  const results = [];
  try {
    for (let i = 0; i < 4; i += 1) results.push(await runner(config(q, "task")));
  } finally {
    q.close();
  }
  assert.deepEqual(results.map((r) => [r.status, r.pushed]), [["refused", false], ["refused", false], ["refused", false], ["refused", false]]);
  const codes = q.state.events.filter((e) => e.type === "error").map((e) => e.code);
  assert.deepEqual(codes, ["ENGINE_MISMATCH", "BRANCH_REFUSED", "BRANCH_REFUSED", "INVALID_JOB"]);
  assert.equal(heads(f.remote).main, git(f.remote, "rev-parse", "main"));
  assert.equal(q.state.events.some((e) => e.type === "tool_use"), false);
});

test("it stops the agent at max_turns", async () => {
  const f = fixtureRemote();
  const q = await startQueue([job(f, { agent: { kind: "agent-sdk", max_turns: 3, budget: { max_usd: 100 } } })]);
  let result;
  try {
    result = await runner(config(q, "loop"));
  } finally {
    q.close();
  }
  assert.equal(result.status, "stopped");
  assert.equal(result.reason, "max_turns");
  assert.ok(result.turns >= 4 && result.turns <= 6, `stopped soon after the limit (turns ${result.turns})`);
  const done = q.state.events.find((e) => e.type === "done");
  assert.equal(done.reason, "max_turns");
  assert.equal(heads(f.remote).main, git(f.remote, "rev-parse", "main"));
});

test("it stops the agent at the budget", async () => {
  const f = fixtureRemote();
  const q = await startQueue([job(f, { agent: { kind: "claude-cli", max_turns: 50, budget: { max_usd: 1 } } })]);
  let result;
  try {
    result = await runner(config(q, "spend"));
  } finally {
    q.close();
  }
  assert.equal(result.status, "stopped");
  assert.equal(result.reason, "budget");
  assert.ok(result.cost.usd > 1 && result.cost.usd <= 3, `cost ${result.cost.usd}`);
  assert.ok(result.turns < 10);
});

test("a failing agent is a failed job: nothing is pushed; a queue that answers cancel stops the agent", async () => {
  const f = fixtureRemote();
  const q = await startQueue([job(f)]);
  let result;
  try {
    result = await runner(config(q, "fail"));
  } finally {
    q.close();
  }
  assert.equal(result.status, "failed");
  assert.equal(result.reason, "agent_failed");
  assert.equal(result.pushed, false);
  assert.ok(q.state.events.some((e) => e.type === "log" && e.stream === "stderr" && /on purpose/.test(e.text)));

  const f2 = fixtureRemote();
  const q2 = await startQueue([job(f2, { agent: { kind: "claude-cli", max_turns: 500, budget: { max_usd: 100 } } })], { cancelAfter: 6 });
  let r2;
  try {
    r2 = await runner(config(q2, "loop"));
  } finally {
    q2.close();
  }
  assert.equal(r2.status, "stopped");
  assert.equal(r2.reason, "cancelled");
  assert.equal(r2.pushed, false);
});

test("the protocol is documented and the reference runner is not published", () => {
  const doc = fs.readFileSync(path.join(ROOT, "docs", "RUNNER-PROTOCOL.md"), "utf8");
  for (const t of ["log", "tool_use", "royascaff_event", "cost", "done", "error"]) assert.ok(doc.includes(`\`${t}\``), `${t} is documented`);
  for (const w of ["job_id", "max_turns", "budget", "engine_version", "contract/schemas/runner", "refuse"]) assert.ok(doc.includes(w), `${w} is documented`);
  const r = spawnSync("npm pack --dry-run --json --ignore-scripts", { cwd: ROOT, encoding: "utf8", shell: true });
  const parsed = JSON.parse(r.stdout);
  const files = (Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0]).files.map((x) => x.path.replace(/\\/g, "/"));
  for (const name of ["job", "event.log", "event.tool_use", "event.royascaff_event", "event.cost", "event.done", "event.error", "result"]) assert.ok(files.includes(`contract/schemas/runner/${name}.json`), `${name} ships with the contract`);
  assert.equal(files.some((x) => x.startsWith("runner-reference/")), false, "the reference runner is not in the npm package");
});
