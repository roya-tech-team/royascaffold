# 03 — Engine 1.7: Agent interface

> **Goal:** any AI tool, and Studio, can drive a RoyaScaff project through a small, typed
> tool interface instead of reading the repo and typing CLI commands. Several agents and
> people can work at once without stepping on each other. A person's approval can be proven
> even when the person is not at a terminal.
> **Builds on:** 1.5 contract v1 (the MCP tools return the same JSON envelopes) and 1.6 (1.7 includes all of it).
> **Note:** §6 (signed approvals) ships early, in 1.5.0 (file 01, S1). It is kept here because it belongs to the agent interface.
> **Repo:** `royascaff` · **Releases:** `1.7.0-beta.N` → `rc` → `1.7.0`.
> **Needed by Studio** for approvals in the browser (§6), the local runner (§7) and parallel
> agents (§4). §6 is built early (1.5.0): Studio phase S4 waits for it.

## 1. Features

| ID | Feature | In one line |
|---|---|---|
| M1 | MCP server | `royascaff mcp` serves the project over the Model Context Protocol (stdio and streamable HTTP). |
| M2 | Tools | `next_action`, `get_context`, `claim_task`, `release_task`, `task_start`, `task_done`, `run_verify`, `record_evidence`, `advance`, `status`, `show`, `trace`, `new_record`, `request_approval`. |
| M3 | Resources | Records, the board, the architecture page and context packs as MCP resources (`royascaff://REQ-READ-002`). |
| M4 | Claims | A task is claimed with a lease and its file paths; other agents can't claim overlapping paths. |
| M5 | Event stream | `royascaff events --follow --json` and an MCP notification stream. |
| M6 | **Signed approvals** | A person's approval or look can arrive as a signed token from a trusted issuer (Studio), not only from a terminal. |
| M7 | **Runner protocol** | A documented protocol for a machine that takes tasks from a queue and runs an agent on them (used by Studio's local runner). |
| M8 | Skill v2 | The navigator skill uses the MCP tools when they are available, and falls back to the CLI. |

## 2. MCP server (M1–M3)

- `royascaff mcp [path] [--http :7410] [--token-file …]`. Stdio is the default (for Claude Code and Cursor). HTTP is for Studio's sandbox and remote agents, and always requires a bearer token.
- Each tool is a thin wrapper around the same code paths as the CLI command. **Tool results are the contract envelopes from 1.5** (`contract`, `ok`, `data`, `error.code`). One implementation, two doors.
- Tool input schemas live in `contract/schemas/mcp/*.json` and are covered by the contract tests.
- `install --claude --cursor` registers the MCP server in the project's `.mcp.json` / `.cursor/mcp.json` (asks before overwriting anything).

Target (from 1.4 file 07): **two different AI tools complete a slice through MCP without scanning the repo.**

## 3. The tools, briefly

| Tool | Input | Returns |
|---|---|---|
| `next_action` | — | The same as `next --json`: action, card, `human`, `say` |
| `get_context` | `task` | The budgeted context pack, with what was left out |
| `claim_task` | `task`, `agent`, `lease_minutes` | The claim, or `CLAIM_CONFLICT` with the holder and paths |
| `task_start` / `task_done` | `task`, `note`, options | Events; the same gates as the CLI |
| `run_verify` | `change`, `quick?` | Evidence records (1.5 V2) |
| `record_evidence` | `change`, `kind`, `result`, `note`, `metrics?` | The evidence record |
| `advance` | `change`, `to` | The new status, or `GATE_REFUSED` with `missing` |
| `status`, `show`, `trace` | as the CLI | as the CLI |
| `new_record` | `kind`, `title`, fields | The record ID |
| `request_approval` | `target`, `act`, `note` | An approval request for a person; it never approves anything |

Approvals are **not** tools an agent can call to approve. `request_approval` only creates a request that a person answers (§6).

## 4. Claims (M4)

- `claim` events in the change log: `task`, `agent`, `paths`, `lease_until`.
- A claim fails if another live claim covers an overlapping path glob. Leases expire; `task_done` releases the claim.
- `task done` from an identity that doesn't hold the claim is refused (`NOT_CLAIM_HOLDER`).
- In git: claims are events in the repo, so two agents on two branches can still conflict. Studio adds a central claim table that mirrors the events (file 04 §6). The engine rule stays the source: the repo's events win when they are merged.

## 5. Event stream (M5)

- `royascaff events --follow --json` prints each new event as one JSON line (it watches `project/**/log.md` and the change folders).
- MCP: an `royascaff://events` resource; the server sends the standard `notifications/resources/updated` when it changes, and clients read the new events from it. (A custom notification method would be ignored by most clients.)
- Studio's sandbox forwards these lines to the browser live (file 04 §5).

## 6. Signed approvals (M6)

**Problem.** The engine proves a person approved by asking for `yes` in a real terminal (beta.4 `ttyConfirm`). In Studio, the person clicks a button in a browser; the engine runs in a container with no terminal.

**Solution.** A trusted issuer signs an approval token; the engine checks it.

1. The project profile lists trusted issuers and their public keys:
   ```yaml
   approval_issuers:
     - id: studio.royascaff.com
       key: ed25519:MCowBQYDK2VwAyEA…
   ```
   **Anti-self-approval rule:** an agent can write to the working tree, so the engine reads `approval_issuers` **only from the profile as committed on the default branch** (`git show <default>:project/profile.md`), never from the working tree. If the working tree's list differs, every token is refused with `ISSUER_LIST_CHANGED`. Changing `approval_issuers` is a human-only change: it needs a terminal `yes` or a token from an issuer already trusted on the default branch, and it must be merged by a person.
2. The token is a compact JWS with header `alg: "EdDSA"` (Ed25519) and claims: `iss`, `sub` (the person's stable id), `name` (display name), `act` (`approve-project`, `approve-roadmap`, `approve-change`, `person-check`, `measure`), `target` (the ID), `hash` (the design or record fingerprint the person saw), `bar` (for checks), `note`, `iat`, `exp` (≤ 10 minutes), `jti` (single use).
3. The CLI accepts `--approval-token <jws>` (or `ROYASCAFF_APPROVAL_TOKEN`) on `approve`, `check --result … --bar`, and `measure`. The engine verifies the signature, the issuer, the expiry, the target, and **that the hash still matches what is on disk**. Then it records the approval with `by: <sub> via <iss>` and the `jti`. A reused `jti` is refused.
4. A token never comes from an agent. Studio issues it only after a signed-in person clicks, with a fresh re-authentication for high and critical risk.
5. The terminal `yes` path stays for local use.

## 7. Runner protocol (M7)

The runner is how Studio uses a machine it doesn't own: the user's laptop with the user's own Claude Code. The engine defines the protocol so any runner can implement it. Studio ships one runner (file 04 §7).

- **Job:** `{ job_id, project_git_url, branch, change, task, engine_version, agent: { kind: "claude-cli" | "agent-sdk", model?, max_turns, budget }, prompt, context_pack }`.
- **Runner loop:** poll (long-poll HTTPS) → accept → clone/fetch into a workspace → check out the branch → pin the engine version → run the agent → stream events → push the branch → report the result.
- **Events** it streams: `log`, `tool_use`, `royascaff_event` (from M5), `cost`, `done`, `error`.
- **Rules:** the runner never uploads credentials; it only pushes to the job's branch; it stops at `max_turns` or `budget`; it refuses jobs for repos the local user can't access.

`docs/RUNNER-PROTOCOL.md` holds the message schemas (JSON Schema, versioned with the contract).

## 8. Acceptance gate for 1.7.0

| # | Test | Pass when |
|---|---|---|
| C1 | Two tools | Claude Code and a second MCP client each complete a slice through MCP only, with no repo scanning (measured by tool logs) |
| C2 | Claims | Two agents claiming overlapping paths: the second gets `CLAIM_CONFLICT`; a lease expires correctly |
| C3 | Signed approvals | A valid token approves; expired, reused, wrong-issuer, wrong-target, changed-hash tokens and an issuer added only in the working tree are all refused, each with its error code (these ship in 1.5.0) |
| C4 | Runner | A reference runner runs one task end to end against a test queue |
| C5 | Contract | MCP results validate against the contract schemas; the CLI and MCP results for the same call are identical |
