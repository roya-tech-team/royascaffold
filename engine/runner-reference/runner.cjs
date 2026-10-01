#!/usr/bin/env node
"use strict";

// The REFERENCE RUNNER of the runner protocol (docs/RUNNER-PROTOCOL.md, plan file 03 §7). It is a plain Node
// script with no dependencies, written so any other runner can copy its behavior. It is not part of the npm package.
//
//   node runner-reference/runner.cjs --queue http://host:port --token TOKEN --workspace DIR --engine DIR \
//        --agent-command "node runner-reference/fake-agent.cjs task" [--once] [--wait 25]
//
// Loop: poll the queue → accept → check access, engine and branch → clone/fetch into a fresh workspace → check out the
// job's branch → pin the engine → run the agent → stream events → push ONLY the job's branch → report the result.
// Rules: it never uploads credentials (it sends events and a result, nothing from the machine's environment); it only
// pushes to the job's branch (never a force push, never another ref); it stops the agent at max_turns or at the budget;
// it refuses a job whose repository the local user cannot access.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { validate } = require("../lib/schema.cjs");

const SCHEMAS = path.join(__dirname, "..", "contract", "schemas", "runner");
const schema = (name) => JSON.parse(fs.readFileSync(path.join(SCHEMAS, `${name}.json`), "utf8"));

const PROTECTED_BRANCHES = ["main", "master", "develop", "trunk", "HEAD"];
// What the agent sees of this machine: no tokens, no cloud keys, no queue credentials.
const SAFE_ENV = ["PATH", "Path", "PATHEXT", "SystemRoot", "SYSTEMROOT", "COMSPEC", "ComSpec", "HOME", "USERPROFILE", "TEMP", "TMP", "TMPDIR", "LANG", "LC_ALL"];

const now = () => new Date().toISOString();

function git(cwd, args, extraEnv = {}) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0", ...extraEnv }, timeout: 120000 });
  return { ok: r.status === 0, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
}

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
  else {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }
}

// ---- the queue (HTTP, JSON, a bearer token)
function queueClient(cfg) {
  const headers = { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" };
  const url = (p) => `${cfg.queue.replace(/\/+$/, "")}${p}`;
  return {
    async next() {
      const res = await fetch(url(`/jobs/next?wait=${cfg.wait ?? 25}`), { headers });
      if (res.status === 204) return null;
      if (!res.ok) throw new Error(`the queue answered ${res.status} to a poll`);
      return res.json();
    },
    async accept(jobId) {
      const res = await fetch(url(`/jobs/${encodeURIComponent(jobId)}/accept`), { method: "POST", headers, body: JSON.stringify({ runner: cfg.name || os.hostname() }) });
      return res.ok; // 409: another runner took it
    },
    async events(jobId, events) {
      const res = await fetch(url(`/jobs/${encodeURIComponent(jobId)}/events`), { method: "POST", headers, body: JSON.stringify({ events }) });
      if (!res.ok) return { cancel: false };
      try {
        return await res.json();
      } catch {
        return { cancel: false };
      }
    },
    async result(jobId, result) {
      await fetch(url(`/jobs/${encodeURIComponent(jobId)}/result`), { method: "POST", headers, body: JSON.stringify(result) });
    },
  };
}

// Events are numbered 1, 2, 3 … and sent in order, one request at a time. The answer may ask for a cancel.
function makeStream(queue, jobId) {
  let seq = 0;
  let chain = Promise.resolve();
  const state = { count: 0, cancelled: false };
  const push = (type, fields) => {
    const event = { job_id: jobId, seq: ++seq, at: now(), type, ...fields };
    state.count += 1;
    chain = chain.then(async () => {
      const answer = await queue.events(jobId, [event]).catch(() => ({}));
      if (answer && answer.cancel) state.cancelled = true;
    });
    return event;
  };
  return { push, flush: () => chain, state };
}

function engineVersion(engineDir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(engineDir, "package.json"), "utf8")).version;
  } catch {
    return null;
  }
}

const engineCli = (cfg, repo, args) => spawnSync(process.execPath, [path.join(cfg.engine, "bin", "royascaff.cjs"), ...args, "--json", "--path", repo], { encoding: "utf8", env: { ...process.env, ROYASCAFF_NONINTERACTIVE: "1", ROYASCAFF_USAGE: "off" } });

function branchProblem(job, url) {
  const b = job.branch;
  if (!/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(b) || b.includes("..") || b.endsWith(".lock") || b.endsWith("/")) return `"${b}" is not a branch name the runner pushes`;
  if (PROTECTED_BRANCHES.includes(b)) return `"${b}" is a protected branch: a runner only pushes the job's own branch`;
  const head = git(process.cwd(), ["ls-remote", "--symref", url, "HEAD"]);
  const m = /^ref: refs\/heads\/(\S+)\s+HEAD/m.exec(head.out);
  if (m && m[1] === b) return `"${b}" is the default branch of the repository`;
  return null;
}

// Runs one job from start to result. Never throws: everything ends in a result.
async function runJob(job, cfg, queue) {
  const jobId = job && job.job_id ? String(job.job_id) : "unknown";
  const stream = makeStream(queue, jobId);
  const result = { job_id: jobId, status: "failed", branch: job && job.branch ? String(job.branch) : "", commit: null, pushed: false, turns: 0, cost: { usd: 0, tokens: 0 }, events: 0, engine_version: engineVersion(cfg.engine) || "unknown" };
  const refuse = (code, message) => {
    stream.push("error", { code, message });
    result.status = "refused";
    result.reason = message;
  };
  let follow = null;
  try {
    const problems = validate(schema("job"), job);
    if (problems.length) {
      refuse("INVALID_JOB", `the job does not fit the job schema: ${problems.join("; ")}`);
      return result;
    }
    if (!(await queue.accept(jobId))) return null; // not ours any more
    stream.push("log", { stream: "runner", text: `accepted ${jobId}: ${job.change} ${job.task} on ${job.branch}` });

    // 1. Only repositories the local user can already reach (with their own git credentials; none are sent anywhere).
    const reach = git(process.cwd(), ["ls-remote", "--heads", job.project_git_url]);
    if (!reach.ok) return refuse("REPO_ACCESS", `this machine cannot access ${job.project_git_url}`), result;
    // 2. The pinned engine must be the version the job names.
    const have = engineVersion(cfg.engine);
    if (have !== job.engine_version) return refuse("ENGINE_MISMATCH", `the job pins engine ${job.engine_version}, this runner has ${have || "none"}`), result;
    // 3. Only the job's own branch.
    const bad = branchProblem(job, job.project_git_url);
    if (bad) return refuse("BRANCH_REFUSED", bad), result;

    // 4. A fresh workspace: clone, then the job's branch.
    const dir = path.join(cfg.workspace, jobId.replace(/[^A-Za-z0-9._-]/g, "_"));
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(cfg.workspace, { recursive: true });
    const clone = git(cfg.workspace, ["clone", "-q", "--no-tags", "-c", "core.autocrlf=false", job.project_git_url, dir]); // LF stays LF: the engine reads files byte for byte
    if (!clone.ok) return refuse("REPO_ACCESS", `clone failed: ${clone.err}`), result;
    const remoteHas = git(dir, ["rev-parse", "--verify", "-q", `origin/${job.branch}`]).ok;
    const co = remoteHas ? git(dir, ["checkout", "-q", "-B", job.branch, `origin/${job.branch}`]) : git(dir, ["checkout", "-q", "-b", job.branch]);
    if (!co.ok) return refuse("INTERNAL", `could not check out ${job.branch}: ${co.err}`), result;
    const base = git(dir, ["rev-parse", "HEAD"]).out;
    stream.push("log", { stream: "runner", text: `workspace ${dir} on ${job.branch} at ${base.slice(0, 10)}; engine ${have}` });

    // 5. Events of the project, forwarded live (the engine's `events --follow`), then caught up at the end.
    const lastBefore = (() => {
      try {
        return JSON.parse(engineCli(cfg, dir, ["events"]).stdout).data.last;
      } catch {
        return null;
      }
    })();
    const seen = new Set();
    const forward = (line) => {
      try {
        const e = JSON.parse(line);
        if (e && e.id && !seen.has(e.id)) {
          seen.add(e.id);
          stream.push("royascaff_event", { event: e });
        }
      } catch {
        // not an event line
      }
    };
    follow = spawn(process.execPath, [path.join(cfg.engine, "bin", "royascaff.cjs"), "events", "--follow", "--path", dir], { env: { ...process.env, ROYASCAFF_USAGE: "off" }, stdio: ["ignore", "pipe", "ignore"] });
    let fbuf = "";
    follow.stdout.on("data", (d) => {
      fbuf += d;
      let i;
      while ((i = fbuf.indexOf("\n")) >= 0) {
        forward(fbuf.slice(0, i));
        fbuf = fbuf.slice(i + 1);
      }
    });

    // 6. The agent. Its working folder is the clone; it sees no credentials of this machine.
    const jobFile = path.join(cfg.workspace, `${jobId.replace(/[^A-Za-z0-9._-]/g, "_")}.job.json`);
    fs.writeFileSync(jobFile, JSON.stringify(job));
    const env = Object.fromEntries(SAFE_ENV.filter((k) => process.env[k] !== undefined).map((k) => [k, process.env[k]]));
    Object.assign(env, { ROYASCAFF_BIN: path.join(cfg.engine, "bin", "royascaff.cjs"), ROYASCAFF_JOB_FILE: jobFile, ROYASCAFF_JOB_ID: jobId, ROYASCAFF_USAGE: "off", GIT_AUTHOR_NAME: "royascaff-runner", GIT_AUTHOR_EMAIL: "runner@invalid", GIT_COMMITTER_NAME: "royascaff-runner", GIT_COMMITTER_EMAIL: "runner@invalid" });
    const limits = { turns: job.agent.max_turns, usd: job.agent.budget && job.agent.budget.max_usd, tokens: job.agent.budget && job.agent.budget.max_tokens };
    let reason = "finished";
    const child = spawn(cfg.agentCommand, { cwd: dir, env, shell: true, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"] });
    const stop = (why) => {
      if (reason === "finished") reason = why;
      killTree(child);
    };
    let obuf = "";
    child.stdout.on("data", (d) => {
      obuf += d;
      let i;
      while ((i = obuf.indexOf("\n")) >= 0) {
        const line = obuf.slice(0, i).trim();
        obuf = obuf.slice(i + 1);
        if (!line || reason !== "finished") continue; // after a stop, whatever the dying agent still prints is ignored
        let msg = null;
        try {
          msg = JSON.parse(line);
        } catch {
          // plain text
        }
        if (msg && msg.type === "tool_use") stream.push("tool_use", { tool: String(msg.tool || "unknown"), input: msg.input || {}, ...(msg.summary ? { summary: String(msg.summary) } : {}) });
        else if (msg && msg.type === "log" && typeof msg.text === "string") stream.push("log", { stream: "stdout", text: msg.text });
        else if (msg && msg.type === "cost") {
          result.turns = Number(msg.turns) || 0;
          result.cost = { usd: Number(msg.usd) || 0, tokens: Number(msg.tokens) || 0 };
          stream.push("cost", { turns: result.turns, usd: result.cost.usd, tokens: result.cost.tokens });
          if (result.turns > limits.turns) stop("max_turns");
          else if (limits.usd !== undefined && result.cost.usd > limits.usd) stop("budget");
          else if (limits.tokens !== undefined && result.cost.tokens > limits.tokens) stop("budget");
        } else stream.push("log", { stream: "stdout", text: line });
        if (stream.state.cancelled) stop("cancelled");
      }
    });
    child.stderr.on("data", (d) => String(d).split("\n").filter(Boolean).forEach((text) => stream.push("log", { stream: "stderr", text })));
    const exit = await new Promise((resolve) => {
      child.on("close", (code) => resolve(code));
      child.on("error", () => resolve(null));
    });
    if (reason === "finished" && exit !== 0) reason = "agent_failed";

    // 7. The last royascaff events, in order, then the end of the run.
    await new Promise((r) => setTimeout(r, 700));
    killTree(follow);
    try {
      const args = lastBefore ? ["events", "--since", lastBefore] : ["events"];
      for (const e of JSON.parse(engineCli(cfg, dir, args).stdout).data.events) forward(JSON.stringify(e));
    } catch {
      // events are a convenience; the repository is the record
    }
    stream.push("done", { reason, turns: result.turns, exit_code: exit });

    // 8. Push only the job's branch, only when the run ended in a state worth keeping.
    const keep = reason === "finished" || reason === "max_turns" || reason === "budget";
    if (keep) {
      if (git(dir, ["status", "--porcelain"]).out) {
        git(dir, ["add", "-A"]);
        git(dir, ["commit", "-q", "-m", `${job.task}: work by the runner (${reason})`]);
      }
      const head = git(dir, ["rev-parse", "HEAD"]).out;
      if (head !== base) {
        const push = git(dir, ["push", "origin", `HEAD:refs/heads/${job.branch}`]);
        if (!push.ok) stream.push("error", { code: "PUSH_FAILED", message: push.err });
        else {
          result.pushed = true;
          result.commit = head;
        }
      } else result.commit = head;
    }
    const unchanged = git(dir, ["rev-parse", "HEAD"]).out === base;
    if (reason === "finished") result.status = result.pushed || unchanged ? "succeeded" : "failed"; // finished but the push failed: failed
    else if (reason === "agent_failed") result.status = "failed";
    else result.status = "stopped"; // max_turns, budget, cancelled
    result.reason = reason;
    return result;
  } catch (err) {
    stream.push("error", { code: "INTERNAL", message: String(err && err.message ? err.message : err) });
    result.reason = "internal error";
    return result;
  } finally {
    if (follow) killTree(follow);
    await stream.flush();
    result.events = stream.state.count;
  }
}

async function handle(job, cfg, queue) {
  const result = await runJob(job, cfg, queue);
  if (result) await queue.result(result.job_id, result);
  return result;
}

// Polls the queue; with once, returns after one job (or null when the queue had none within the wait).
async function runner(cfg) {
  const queue = queueClient(cfg);
  for (;;) {
    const job = await queue.next();
    if (job) {
      const result = await handle(job, cfg, queue);
      if (cfg.once) return result;
    }
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    const k = argv[i].slice(2);
    out[k] = argv[i + 1] === undefined || argv[i + 1].startsWith("--") ? true : argv[++i];
  }
  return out;
}

if (require.main === module) {
  const a = parseArgs(process.argv.slice(2));
  const cfg = { queue: a.queue, token: a.token || process.env.ROYASCAFF_RUNNER_TOKEN, workspace: path.resolve(a.workspace || path.join(os.tmpdir(), "royascaff-runner")), engine: path.resolve(a.engine || path.join(__dirname, "..")), agentCommand: a["agent-command"], once: Boolean(a.once), wait: a.wait ? Number(a.wait) : 25 };
  if (!cfg.queue || !cfg.token || !cfg.agentCommand) {
    process.stderr.write("Usage: runner.cjs --queue URL --token TOKEN (or ROYASCAFF_RUNNER_TOKEN) --agent-command \"…\" [--workspace DIR] [--engine DIR] [--once] [--wait SECONDS]\n");
    process.exit(2);
  }
  runner(cfg).then((r) => {
    if (r) process.stdout.write(`${JSON.stringify(r)}\n`);
  }).catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}

module.exports = { runner, runJob, handle, queueClient };
