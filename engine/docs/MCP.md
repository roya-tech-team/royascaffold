# Using RoyaScaff through MCP

`royascaff mcp` lets an AI tool drive a RoyaScaff project through a small set of typed tools, instead of reading the
repository and typing commands. Any tool that speaks the Model Context Protocol (MCP) can use it. Several agents can
work at the same time without stepping on each other.

Nothing here approves anything for you. Only a person approves, in a terminal or with a signed token.

## Start it

In your AI tool (Claude Code, Cursor):

```
royascaff install
```

This installs the navigator skill and registers the server in `.mcp.json` (Claude Code) and `.cursor/mcp.json` (Cursor).
If a different `royascaff` entry is already there, `install` asks before it replaces it. Without a terminal it refuses and
changes nothing. Restart the tool, and it will list the RoyaScaff tools.

By hand:

```
royascaff mcp                      # stdio, for the project in the current folder
royascaff mcp path/to/project      # stdio, another folder
royascaff mcp --http :7410 --token-file .royascaff-token
royascaff mcp --describe --json    # what it offers, as a contract envelope
```

**HTTP** is for remote agents and for Studio's sandbox. It always needs a bearer token:

- `--token-file FILE` reads the token from the file. If the file does not exist, a random token is written to it.
- Else the token is read from `ROYASCAFF_MCP_TOKEN` (at least 16 characters).
- Else a random one is made and printed once on stderr.

Clients send `Authorization: Bearer <token>` and talk to `POST /mcp`. A client opens the stream for server
notifications with `GET /mcp` (`Accept: text/event-stream`, and the `Mcp-Session-Id` it got from `initialize`). The
server listens on `127.0.0.1` unless you give a host (`--http 0.0.0.0:7410`); keep the token secret then, and put it
behind TLS. A browser page from another origin is refused.

## The tools

Each tool is the same code path as a CLI command. The result is the same JSON envelope the CLI prints with
`--json` (`ok`, `data`, `error.code`, `error.missing`). Check `ok` first. The input schema of each tool is in
`contract/schemas/mcp/<tool>.json`.

| Tool | What it does |
|---|---|
| `next_action` | The one next action, the stage card, whether a person must act, what to say (`next`). |
| `get_context` | The budgeted context pack of a task (`context`). Use it instead of reading the repository. |
| `claim_task` | Claim a task and its paths for a lease. `CLAIM_CONFLICT` names the holder and the paths when they overlap. |
| `release_task` | Release your claim. Finishing the task releases it too. |
| `task_start`, `task_done` | The same gates as `task start` / `task done`. Only the holder of a claim may use them. |
| `run_verify` | `verify` (full), or `check --quick` with `quick: true`. Writes evidence. |
| `record_evidence` | Record a check you ran yourself (`kind`, `result`, `note`, optional `metrics`). |
| `advance` | Move a change forward through its gates, or `GATE_REFUSED` with `missing`. |
| `status`, `show`, `trace` | As the CLI. |
| `new_record` | Create a record and get its ID. |
| `request_approval` | Ask a person to approve or look. It only writes a request. |

Every tool that acts takes an `agent` name (for example `claude`). It is recorded as `ai:<agent>`, so no tool call can pass for
a person.

A good session: `next_action`, then `claim_task`, `get_context`, `task_start`, work, `task_done`, `run_verify`,
`record_evidence` if needed, `advance`, and `request_approval` when a person must decide.

## Claims

A claim says who works on which paths. It is an event in the change log (`claim.acquired`, with the task, the agent,
the paths and `lease_until`), so it travels with git.

- A claim lasts 30 minutes by default (`lease_minutes`, at most 24 hours). Claim again to renew.
- Two live claims may not cover overlapping paths. The second gets `CLAIM_CONFLICT`.
- A claim ends when it is released, when its task is done, or when its lease runs out.
- Starting or finishing a task you do not hold is refused with `NOT_CLAIM_HOLDER`. A task nobody claimed is open to everyone.

CLI: `royascaff claim TASK-… --agent ai:me`, `royascaff claim TASK-… --release`, `royascaff claim --list`.

## Resources

| URI | What it holds |
|---|---|
| `royascaff://REQ-READ-002` (any record ID) | The record: the same JSON as `show`. |
| `royascaff://board` | The status board. |
| `royascaff://architecture` | The architecture page. |
| `royascaff://context/TASK-…` | The context pack of a task. |
| `royascaff://events` | The latest events, one JSON object per line. `?since=EVT-…` returns only what is newer. |

Subscribe to `royascaff://events` (or `royascaff://board`, or one record) with `resources/subscribe`. The server sends the
standard `notifications/resources/updated` when it changes; read the resource again, with `?since=` for the new events.

Outside MCP, `royascaff events --follow --json` prints each new event as one JSON line.

## What it does not do

- It never approves a design, a roadmap, the project, a person's look or a measure. `request_approval` asks; a person answers.
- It does not run outside the project you gave it, and it does not publish or push anything.
