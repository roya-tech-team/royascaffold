# The RoyaScaff machine contract (version 1.0)

Other programs (Studio, scripts, CI, AI tools) can drive RoyaScaff without reading its Markdown or
guessing at its text. This page is the promise they can rely on. It is short on purpose.

The engine version and the contract version are not the same thing. `royascaff contract --json` tells you
both. The contract changes slowly; the engine can change every week.

## 1. One rule: `--json` gives one envelope

Every command accepts `--json`. With it, the command prints exactly one JSON document on stdout, and
nothing else on stdout. (Human-readable text goes to stdout only when you do not pass `--json`.)

Success:

```json
{ "contract": "1.0", "engine": "1.5.0-alpha.1", "ok": true, "command": "open",
  "data": { "id": "CHG-CAMP-004", "dir": "changes/CHG-CAMP-004", "risk": "low" },
  "warnings": [], "events": ["EVT-CHG-CAMP-004-0001"] }
```

Failure:

```json
{ "contract": "1.0", "engine": "1.5.0-alpha.1", "ok": false, "command": "advance",
  "error": { "code": "GATE_REFUSED", "message": "CHG-CAMP-004 cannot move to analyzed: stopped at draft",
             "missing": ["the Impact table has unclassified layers"], "details": { "…": "…" } },
  "warnings": [], "events": [] }
```

| Field | Meaning |
|---|---|
| `contract` | The contract version, `major.minor`. |
| `engine` | The engine version that answered. |
| `ok` | `true` or `false`. Always matches the exit status (see 3). |
| `command` | The command that was called. |
| `data` | What the command returned. Only when `ok` is `true`. |
| `error.code` | A stable code from section 2. Program on this, never on `message`. |
| `error.message` | A plain sentence for a person. It can change at any time. |
| `error.missing` | Optional. A list of plain sentences: what must be done first. |
| `error.details` | Optional. The full result of a call that ran but was refused or failed (for example the steps of a refused `advance`). It has the same shape as `data` would have had. |
| `warnings` | A list of plain sentences. |
| `events` | The IDs of the events this call wrote to the logs (section 5). Empty for reads. |

The envelope has a JSON Schema: `contract/schemas/envelope.schema.json`.
The `data` of each command has one too: `contract/schemas/<command>.schema.json`
(for example `contract/schemas/status.schema.json`). All of them ship in the npm package.

## 2. Error codes

The codes are listed, with their exit status and a description, in `contract/errors.json`.
`royascaff contract --json` lists them too.

| Code | Exit | When |
|---|---|---|
| `NOT_A_PROJECT` | 1 | The path does not exist or holds no RoyaScaff project. |
| `UNKNOWN_ID` | 1 | A record, task, change, slice, feature, event or backup the call names does not exist. |
| `GATE_REFUSED` | 1 | A gate refused the step. `missing` says what must be done first. |
| `HUMAN_REQUIRED` | 1 | Only a person can do this step (an approval, a look, a confirmation). `missing` says what is needed, for example a signed approval token. |
| `STALE_APPROVAL` | 1 | The approval no longer holds because what was approved has changed since. |
| `OUTSIDE_PATHS` | 1 | Files changed outside the paths the task allows. |
| `CHECK_FAILED` | 1 | A check the step depends on ran and failed. A failed `validate`, `roundtrip` or `migrate` dry run also uses this code. |
| `VERSION_MISMATCH` | 1 | The project, the engine or the requested version do not fit each other. |
| `ALREADY_EXISTS` | 1 | What the call would create, or the state it would set, is already there. |
| `INVALID_INPUT` | 2 | The call is malformed: a missing argument, a bad option value or wrong usage. |
| `UNKNOWN_COMMAND` | 2 | The command does not exist in this engine version. |
| `INTERNAL` | 1 | An error the engine has no stable code for yet. The message says what happened. |

Exit status: `0` when `ok` is `true`. `1` when the work was refused or failed. `2` when the call itself
was wrong. Both are exactly what `contract/errors.json` says for the code.

A result that "ran but did not pass" is a failure envelope, not a success with `ok: false` inside.
This is the rule for gates and checks: `advance` refused is `GATE_REFUSED`; `check` that failed, and
`validate` with errors, are `CHECK_FAILED`. The full result is in `error.details`.

## 3. Commands

`contract.commands` lists them. Today: adopt, advance, approve, backups, block, brief, cache, check, context,
continue, contract, events, export, feedback, index, init, install, log, measure, migrate, new, next, open,
record, refine, render, roundtrip, show, smoke, status, task, tasks, trace, unblock, usage, validate, where.

Each one has a schema for its `data`. The schemas list the fields a program may rely on. They allow
extra fields, because adding a field is a minor change (section 6).

Where a command used to print a bare list (`tasks`, `log`, `backups`), `data` is an object holding the list
(`data.tasks`, `data.events`, `data.backups`), so it can grow later without a major change.

## 4. Reading the project

| Need | Call |
|---|---|
| Everything at once (records, typed links, derived status, evidence, issues, the board) | `royascaff export --json` (schema `export.schema.json`) |
| What changed since the last look | `royascaff events --since EVT-… --json` |
| What to do next | `royascaff next --json` |
| One record with its links | `royascaff show <ID> --json` |

`export` rebuilds everything from the repo. Nothing in it is stored anywhere else, so an index built from it
can always be thrown away and rebuilt.

## 5. Events and `events --since`

Every change has an append-only log, and the project has one (`project/log.md`). Each row is an event. Each
event has a stable ID made from its log and its row number: `EVT-CHG-CAMP-001-0003` is the third event of
`CHG-CAMP-001`; `EVT-PROJECT-0001` is the first event of the project log. Logs are append-only, so an ID
never changes.

`royascaff events --json` returns all events oldest first in `data.events`, with `data.count` and
`data.last` (the ID of the last one). `--since` takes an event ID (everything after it), a date
(`2026-09-20`) or a span (`7d`). `--change CHG-…` and `--limit N` narrow it. An indexer keeps `data.last` and
asks for `--since <last>` next time. Without `--json` the command prints one JSON event per line.

## 6. Non-interactive mode

`ROYASCAFF_NONINTERACTIVE=1` means the engine never asks anything and never opens a terminal. A step only a
person can do (approving a design, the project or the roadmap; recording a person's look; measuring an
outcome) then returns `HUMAN_REQUIRED`, and `error.missing` says what is needed. The ways to prove a person
did it are a person at a terminal, or a signed approval token (section 8).

## 7. The versioning rule

The contract version is `major.minor`.

- **Adding** a field, a command, an error code or an optional option is a **minor** change (`1.1`). Programs must
  ignore fields and error codes they do not know. Treat an unknown error code like `INTERNAL`.
- **Removing or renaming** anything, or changing what a field means, is a **major** change (`2.0`). It needs a
  deprecation period of one engine minor version: the old shape stays, with a warning in `warnings`, while
  the new one is added next to it. It needs the owner's decision.
- Messages (`error.message`, `warnings`, the text of `next`) are for people and can change at any time.

How it is kept:

- `tests/contract-commands.test.cjs` calls every command with `--json` and validates the real output against
  the schemas.
- `tests/golden/contract/<command>.json` is a golden file for each command. If a change to the engine changes
  one, the test fails. A golden is rewritten only on purpose (`ROYASCAFF_UPDATE_GOLDEN=1 npm test`), and
  the diff is read as a change of the contract.
- `contract/errors.json` is checked against the table in `lib/contract.cjs`.

Studio runs the same contract tests for every engine version it supports.

## 8. Signed approvals

A person can approve through a browser instead of a terminal. A trusted issuer (Studio) signs a short token and
the engine checks it. This section is filled in with the signed approvals work package.
