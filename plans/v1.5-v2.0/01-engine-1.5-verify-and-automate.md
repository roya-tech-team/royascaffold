# 01 — Engine 1.5: Verify & automate

> **Goal:** the evidence behind "done" is produced by machines, stays true while the code
> changes, and is judged by someone other than the builder. The engine gets a stable
> machine contract that Studio (file 04) and other tools can build on.
> **Builds on:** 1.4 plan file 05 (testing and automation), beta.4 adapter manifests,
> the beta.4 metrics, red-first and person's-look checks.
> **Repo:** `royascaff` · **Releases:** `1.5.0-alpha.N` (contract) → `1.5.0-beta.N` → `rc` → `1.5.0`.

## 1. Features

| ID | Feature | In one line |
|---|---|---|
| **C0** | **Machine contract v1** | Every command speaks JSON with a published schema, stable error codes and a contract version. **Built first**, because Studio needs it. |
| V1 | Check types on acceptance criteria | Each criterion says how it is proven: `unit`, `e2e`, `metric`, `manual`, `inspection`. |
| V2 | `royascaff verify` | Runs every check an adapter declares for a change and writes evidence records. |
| V3 | Evidence fingerprints and freshness | Evidence stores a hash of the code and tests it covered. When those change, the evidence turns **stale** and "done" is no longer counted. |
| V4 | Separate judge | A second agent session (a different role, ideally a different model) reviews the change against the requirements and the evidence. The builder cannot be its own judge. |
| V5 | Bounded repair loop | A failed verify allows up to N repair attempts (default 2); then the change is blocked and a person decides. |
| V6 | Foundation before breadth | Enforced: slices marked `foundation` must be done before other slices of the same feature open. |
| V7 | **Adapter kit** | `adapter new`, a JSON Schema for manifests, `adapter test` (conformance), documented in `docs/ADAPTERS.md`. |
| V8 | **General person's check** | The look is declared by the adapter: `visual` (web), `transcript` (CLI), `demo` (API), `playtest` (games), each with its own bar. |
| V9 | **Adoption upgrade** | Records can be `inferred` until a person confirms them. Adoption coverage counts layers, not only files. `royascaff scan` gives the AI facts per module. |
| V10 | Inventory view | `royascaff inventory` and a board section: records per layer, stale evidence, unconfirmed inferred records, unowned code. |
| V11 | CI check | `royascaff ci` exits non-zero when gates fail; a GitHub Action template. |
| V12 | Benchmark harness | Repeat runs of fixture projects, with one web fixture and one CLI fixture (the engine itself), and a report. |
| **S1** | **Signed approvals** (pulled from 1.7) | A person's approval or look can arrive as a signed token from a trusted issuer, so Studio can collect approvals in the browser. Specified in file 03 §6; ships in `1.5.0-alpha.2`. |
| V13 | Dogfooding | The engine repo becomes a RoyaScaff project (adapter `node`). One folder, git tags per release; no more folder copies per beta. |

## 2. Why these, in this order

1. **C0 first:** Studio can't start without it, and it changes no behavior.
2. **V1–V5** solve the biggest weakness the benchmarks found: "PASS" written by the AI that built the thing.
3. **V7–V8** make the engine truly generic (the owner's game and self-development questions): today the person's check and the visual bar are wired to `web-ui`.
4. **V9** makes reverse engineering trustworthy: today an unconfirmed guess can count as done.
5. **V12–V13** prove the gain across more than one kind of product.

## 3. C0 — Machine contract v1 (detail)

The contract is what other programs rely on. It must be boring and stable.

1. **Every command** accepts `--json`. Today only `next`, `status`, `validate`, `usage`, `show`, `roundtrip`, `adopt` do.
2. **Output envelope** for every JSON result:
   ```json
   { "contract": "1.0", "engine": "1.5.0", "ok": true, "command": "advance",
     "data": { … }, "warnings": [ … ], "events": ["EVT-…"] }
   ```
   On failure: `"ok": false, "error": { "code": "GATE_REFUSED", "message": "…", "missing": [ … ] }`, exit code ≠ 0.
3. **Stable error codes**, listed in `contract/errors.json`: `NOT_A_PROJECT`, `UNKNOWN_ID`, `GATE_REFUSED`, `HUMAN_REQUIRED`, `STALE_APPROVAL`, `OUTSIDE_PATHS`, `CHECK_FAILED`, `VERSION_MISMATCH`, `INVALID_INPUT`, …
4. **JSON Schemas** for every output and for the export format, in `contract/schemas/*.schema.json`, shipped in the npm package.
5. **`royascaff contract --json`** prints the contract version, the engine version, the supported commands and the adapters found.
6. **`royascaff events --since <EVT|date> --json`**: the event log as JSON lines. Studio's indexer reads it.
7. **`royascaff export --json`** covers records, links, derived status, evidence and the board in one document (already partly exists; complete it and give it a schema).
8. **Non-interactive mode** `ROYASCAFF_NONINTERACTIVE=1`: never prompts. Human-only steps return `HUMAN_REQUIRED` with what is needed (see file 03 §6 for signed approvals).
9. **Contract tests** in `tests/contract/`: each command's JSON validates against its schema; a golden file per command.
10. **Versioning rule:** adding fields is a minor contract change (`1.1`). Removing or renaming anything is a major change (`2.0`) and needs a deprecation period of one engine minor version.

**Done when:** all commands pass the contract tests; `docs/CONTRACT.md` explains the envelope, the codes and the versioning rule; the package includes `contract/`.

## 4. Evidence, freshness and the judge (V1–V5)

**Check types.** A requirement's acceptance lines get a type:
```
- [e2e] Saving with an empty title shows "Title is required" and saves nothing.
- [metric] `list_ms <= 200` with 500 books.
- [manual] The list reads well on a 375 px phone.
```

**`verify <CHG>`:**
1. Reads the adapters' `checks` from their manifests (`unit`, `e2e`, `metric`, `smoke`, …).
2. Runs each one, collecting results per acceptance line.
3. Writes an evidence record per check: result, output excerpt, screenshots, metrics, and a **fingerprint**.

**Fingerprint** = a hash over: the files owned by the components the change touches, the test files that ran, the lockfile, and the engine version. `status` recomputes fingerprints cheaply (it uses the git tree hashes). If a fingerprint differs, the evidence is **stale**. A requirement with only stale evidence shows ⚠️ *stale*, not ✅ *done*.

**Judge.** `royascaff judge <CHG>` builds a judge pack: the requirements, the design, the diff, the evidence, and the screenshots. It asks for a verdict per acceptance line: `met`, `not-met`, or `unclear`, with a reason. The engine records the verdict as evidence of kind `judge`, with the judge's identity (`ai:<tool>:judge`). Rules:
- The identity that built the change's tasks cannot record the judge verdict.
- High and critical risk changes need a `met` verdict for every must requirement before `verified`.
- `unclear` goes to a person.

**Repair loop.** When verify or the judge fails, `next` returns a repair action with the failing lines. After `repair_limit` attempts (profile setting, default 2), the change is blocked with the reason, and `next` asks a person.

## 5. The adapter kit and the general person's check (V7, V8)

**Manifest schema** (`contract/schemas/adapter.schema.json`). The beta.4 fields, plus:
```json
{
  "name": "web-game",
  "includes": ["web-3d"],
  "checks": { "unit": "npm test", "e2e": "npx playwright test", "smoke": "node scripts/royascaff-smoke.mjs" },
  "personCheck": { "kind": "playtest", "bar": "experienceBar", "minLines": 5,
                   "prompt": "Play one full round on a phone and on a laptop." },
  "layers": { "requires": ["experience", "quality"] },
  "words": ["…business words that must not appear in code names…"]
}
```

**Person's check kinds:**

| Kind | Default for | What the person does | The bar |
|---|---|---|---|
| `visual` | web-ui, web-3d | Opens the app and looks | Visual bar (discovery) |
| `transcript` | node (CLI, library) | Reads a recorded run of the commands and their output | Usage bar: clear messages, sensible defaults, errors say what to do |
| `demo` | web-api | Watches a scripted call sequence and its responses | API bar: shape, errors, speed |
| `playtest` | games | Plays a round | Feel bar: controls respond, difficulty rises smoothly, feedback is clear |

The engine core knows only "a person's check with a bar". The kind, the bar name and the prompt come from the manifest.

**Commands:**
- `royascaff adapter new <name> [--includes web-ui]` creates `project/adapters/<name>.json` and `<name>.md` from a template.
- `royascaff adapter test <name>` validates the schema, resolves includes, runs each declared check command once in a dry mode, and checks the card's token budget.
- `docs/ADAPTERS.md` explains how to write one, with two worked examples: `web-game` (browser) and `godot` (a native game engine, run headless).

## 6. Adoption upgrade (V9)

1. **Inferred records.** Any record can carry `Basis: inferred`. It stays ⏳ *unconfirmed* until a person runs `royascaff confirm <ID…>` (or corrects it). An unconfirmed requirement can never count as done. `validate` warns about inferred records older than 14 days.
2. **Layer coverage.** `royascaff adopt` shows, per module: files owned, and whether the architecture, data, rules and experience layers mention the module's components. The same knowledge registry that drives the Impact table (beta.4 `lib/knowledge.cjs`) decides which layers a module needs.
3. **`royascaff scan [module] --json`** writes cached facts per module: imports and exports, route patterns, schema and migration files, config files, test files, and the largest files. Language support comes from adapters (`scan` patterns in the manifest), so the core stays generic. The adopt card tells the AI to start from these facts.
4. **`royascaff adopt docs <folder>`**: the AI turns existing documents into SRC demands and decision records, each quoting its source file.

## 7. Inventory, CI and the benchmark (V10–V12)

- **Inventory:** `royascaff inventory [--json]` gives records per layer, stale evidence, inferred-unconfirmed records, unowned code, open repairs, and adapters with their check kinds. The board gains a short Inventory section.
- **CI:** `royascaff ci [--json]` runs validate, freshness and the rule check, and fails on errors. `templates/ci/github-action.yml` runs it on pull requests. Studio uses the same command.
- **Benchmark harness** (`bench/`, not in the npm package): runs a fixture request through a model N times and writes `bench/results/<date>.csv` with the grade inputs. Fixtures:
  - the 3D network app (existing);
  - **a CLI fixture**: a small command-line tool with a spec;
  - later, a browser game.

## 8. Dogfooding (V13)

1. One engine folder in git. Each beta and each release is a git tag plus a `REL-` record. The old `engine-1.4-beta.N` folders stay as frozen history, read-only.
2. `royascaff init` in the engine repo with `--adapter node`; `adopt` the existing modules (`lib/`, `lib/commands/`, `lib/derive/`, …).
3. **Pin the tool version.** The engine being changed is never the engine running the process:
   `npm i -D royascaff-tool@npm:royascaff@1.5.0-beta.N`. npm links the alias's `bin` as `node_modules/.bin/royascaff`, so `npx royascaff` runs the pinned copy, not the working copy. The work package verifies this on macOS and Linux, and adds a guard: when the running engine's folder equals the repo root, the CLI warns *"you are running the engine you are changing"*.
4. The 1.4 plan files 01–17 are imported with `adopt docs` as demands and decisions.

## 9. Out of scope for 1.5

Requirement deltas and baselines (1.6). The MCP server, claims and the runner protocol (1.7). Signed approvals are the exception: they ship in 1.5.0 (S1). Any database or server (Studio).

## 10. Acceptance gate for 1.5.0

| # | Test | Pass when |
|---|---|---|
| A1 | Contract | Every command validates against its schema; `docs/CONTRACT.md` complete |
| A2 | Benchmark | Median grade ≥ B on **two different fixtures (web + CLI)**, ≥ 3 runs each, with Grok Low (as in 1.4 file 07) |
| A3 | Freshness | Editing a covered file turns that evidence stale on the next `status`; re-running `verify` refreshes it |
| A4 | Judge | A builder identity is refused as judge; a high-risk change can't be verified without `met` verdicts |
| A5 | Adapter kit | A new adapter made with `adapter new` passes `adapter test`; the `transcript` check works on the CLI fixture |
| A6 | Adoption | An inferred requirement stays unconfirmed until `confirm`; `adopt` shows layer gaps |
| A7 | Dogfood | One engine change made through the engine itself (tool pinned), closed with evidence |
| A8 | No regressions | All 1.4 tests pass; the contamination guard passes; the SKILL and card budgets hold |
| A9 | Signed approvals | All file 03 §8 C3 cases pass (valid, expired, reused, wrong issuer, wrong target, changed hash, issuer added in the working tree) |
