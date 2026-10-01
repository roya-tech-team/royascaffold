# The runner protocol (engine 1.7, contract 1.2)

A **runner** is a machine that takes jobs from a queue and runs an AI agent on them. Studio uses one to work on a
machine it does not own, such as a person's laptop with their own AI tool. The engine defines the protocol so any
runner can implement it. A reference runner (`runner-reference/runner.cjs` in the engine repository; it is not part of
the npm package) shows the exact behavior and is the test of this document.

The messages are JSON. Their schemas are in `contract/schemas/runner/` and are versioned with the machine contract
(`docs/CONTRACT.md`): adding a field is a minor change, removing one is a major change.

## The rules a runner keeps

1. **It never uploads credentials.** It sends events and a result to the queue, nothing from the machine's
   environment. The agent it starts sees a short list of environment variables, never tokens or cloud keys.
2. **It only pushes to the job's branch.** One refspec, `HEAD:refs/heads/<job.branch>`, never a force push, never
   another ref. It refuses the default branch and the usual protected names (`main`, `master`, `develop`, `trunk`).
3. **It stops at `max_turns` or at the budget.** The agent reports its cost; when the turns pass `max_turns`, or the cost
   passes `budget.max_usd` or `budget.max_tokens`, the runner kills it.
4. **It refuses a job for a repository the local user cannot access** (`git ls-remote` fails with the user's own git
   credentials). It also refuses a job that pins another engine version, and a branch it must not push.

## The job

`contract/schemas/runner/job.json`:

```json
{ "job_id": "job-1", "project_git_url": "git@host:org/repo.git", "branch": "rs/job-1",
  "change": "CHG-PORT-001", "task": "TASK-PORT-001", "engine_version": "1.7.0",
  "agent": { "kind": "claude-cli", "model": "…", "max_turns": 20, "budget": { "max_usd": 5 } },
  "prompt": "…", "context_pack": "…the output of get_context for the task…" }
```

`agent.kind` is `claude-cli` or `agent-sdk`. `context_pack` lets the agent start without scanning the repository.

## The queue (HTTP, JSON, `Authorization: Bearer <runner token>`)

| Call | Meaning |
|---|---|
| `GET /jobs/next?wait=25` | Long poll. `200` with a job, or `204` when there is none yet. |
| `POST /jobs/<job_id>/accept` | The runner takes the job. `409`: another runner took it; drop it. |
| `POST /jobs/<job_id>/events` | Body `{ "events": [ … ] }`. The answer may be `{ "cancel": true }`: stop the job. |
| `POST /jobs/<job_id>/result` | The result (below). Always sent, even when the job was refused. |

## The loop

poll → validate the job against the schema → accept → check access, engine version and branch → clone into a fresh
workspace → check out the job's branch (create it when the remote has none) → pin the engine (the job's
`engine_version` must be the one this runner runs) → run the agent in the clone → stream events → commit what is left,
push the job's branch → report the result.

## Events

Every event has `job_id`, `seq` (1, 2, 3 … in the order produced), `at` (ISO time) and `type`. Schemas:
`event.log.json`, `event.tool_use.json`, `event.royascaff_event.json`, `event.cost.json`, `event.done.json`, `event.error.json`.

| `type` | Fields | Meaning |
|---|---|---|
| `log` | `stream` (`stdout`, `stderr`, `runner`), `text` | A line of output. |
| `tool_use` | `tool`, `input`, `summary?` | The agent used a tool. |
| `royascaff_event` | `event` | A RoyaScaff event written in the workspace (from `royascaff events --follow`; the shape of `events` data). |
| `cost` | `turns`, `usd?`, `tokens?` | Cumulative cost so far. The runner enforces the limits on it. |
| `done` | `reason`, `turns?`, `exit_code?` | The agent run ended: `finished`, `max_turns`, `budget`, `agent_failed`, `cancelled`. |
| `error` | `code`, `message` | The runner could not do its part: `INVALID_JOB`, `REPO_ACCESS`, `ENGINE_MISMATCH`, `BRANCH_REFUSED`, `AGENT_FAILED`, `PUSH_FAILED`, `INTERNAL`. |

## The result

`contract/schemas/runner/result.json`: `job_id`, `status`, `reason`, `branch`, `commit`, `pushed`, `turns`, `cost`, `events`,
`engine_version`.

| `status` | When |
|---|---|
| `succeeded` | The agent finished; its work is on the job's branch (or there was nothing to push). |
| `stopped` | `max_turns`, the budget, or a cancel. For `max_turns` and the budget the work so far is pushed; a cancel pushes nothing. |
| `failed` | The agent failed, or the push failed. Nothing is pushed after an agent failure. |
| `refused` | The runner did not start the agent: no access, wrong engine, bad branch, bad job. |

## What the agent speaks (reference runner)

The reference runner starts the agent as a command in the clone, with `ROYASCAFF_BIN` (the pinned engine's CLI),
`ROYASCAFF_JOB_FILE` (the job) and `ROYASCAFF_JOB_ID`. The agent writes JSON lines on stdout: `{"type":"tool_use",…}` and
`{"type":"cost","turns":N,"usd":X,"tokens":T}`; any other line becomes a `log` event. A real runner wraps the AI tool's
own output into these events. The agent works through the engine (the CLI or `royascaff mcp`, see `docs/MCP.md`): it claims its
task, works inside the task's allowed paths, and records its steps. It never approves anything; people do that in Studio.
