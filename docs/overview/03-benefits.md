# Benefits

Every benefit below is paired with the specific engine mechanism that produces it, so you can verify the claim rather than take it on faith.

## Work is resumable in any chat, by anyone

**The problem it solves:** context windows end, sessions crash, teammates take over. Re-establishing "where were we" normally means re-reading the codebase.

**The mechanism:** three live indexes, each with a defined update trigger.

| File | Tracks | Updated |
|------|--------|---------|
| `project/changes/change-log.md` | Every pack and its `pack-status` | On every status transition |
| `project/changes/build-program.md` | Ordered REQ-INIT / REQ-R queue plus "next pack" | At program creation and each merge |
| `project/status.md` | Merged reality: per-app snapshot, In Progress, Next Up, Deferred | After each merge |

The resume rule is fixed: read `change-log.md` first, then `build-program.md` if present, then `status.md`. A new session is productive in one read, not one hour.

## Parallel work does not collide

**The problem it solves:** two branches editing the same plan file, or both allocating "change-004."

**The mechanism:** two rules working together.

1. **Isolation.** In-flight specs live in the pack's `blueprint/`, never in main. Two packs touch two disjoint folders.
2. **Datetime IDs.** `<ID>` is the local clock as `YYYYMMDD-HHMMSS` — for example `change-20260729-125201-billing-api`. The layout contract is explicit: *"Never use sequential counters. Parallel branches allocate the same next number and collide on merge."* Same-second collisions append four hex characters.

Dependencies are declared, not implied: a pack carries `request-id`, `part: 2/3`, `depends-on`, and `blocks`. A pack whose dependency is not yet `verified` or `merged` is set to `blocked` and the flow stops rather than building on sand.

## The documentation cannot quietly rot

**The problem it solves:** docs that were true once and are now actively misleading.

**The mechanism:** main is only ever updated at merge, after verification passed. There is no path by which an unimplemented idea lands on main as though it were built — the sole exceptions are explicit and labeled (Phase 2 writes the roadmap with status `planned`; Phase R writes existing code with `done` or `partial`).

Verification check 15 closes the loop from the other side: *"Code that exists but is spec'd as `planned` is a drift — fix the status."*

## You always know what is actually built

**The problem it solves:** "is the export endpoint done?" being a five-minute investigation.

**The mechanism:** a four-value status on every artifact, rolled up twice.

| Status | Meaning |
|--------|---------|
| `planned` | Specced, no code yet |
| `partial` | Code exists but is incomplete |
| `done` | Implemented and verified against its spec |
| `deferred` | Intentionally postponed — reason required |

The per-artifact status in the module file is the source of truth. Each `_index.md` shows the rolled-up module status plus `Done/Total`. `project/status.md` shows the system. Summaries must always agree with the source, and a verification check enforces it.

`deferred` deserves special mention: it is the only status that requires a written reason, and deferred work may never be silently deleted. Postponed decisions stay visible instead of evaporating.

## Changes stay the size you asked for

**The problem it solves:** a request to add one filter turning into a forty-file diff.

**The mechanism:** the impact analysis in Step 5.1 runs *before* any spec is finalized. It maps the change through the code (schema, repository, service, controller, frontend service, page), classifies the work as create / complete in place / modify, records the ripple, and lists the exact files that will be created or modified. You approve that list at the Pack Confirmation Gate before anything is written.

Scope creep has a defined response rather than being absorbed silently. If a polish task turns out to need an endpoint change, the flow stops and converts the pack to the appropriate Phase 5 type, keeping the same folder and `request-id`.

## Reviews happen at the plan, not the diff

**The problem it solves:** reviewing generated code is slow and catches the wrong class of error.

**The mechanism:** five confirmation gates with fixed prompts, and the standing rule that silence is not confirmation. You approve a change request, then an impact summary, then a code file list, then a merge. By the time code is written, the disagreements are already resolved.

## Legacy code gets a blueprint without a rewrite

**The problem it solves:** an inherited system nobody can safely change.

**The mechanism:** Phase R reads the code and produces the same artifacts a greenfield build would, plus `plan/roles-and-authorization.md`, which it can extract because the auth patterns are already in the code. It never generates code. It ends with a drift report (`CLEAN`, `DRIFT DETECTED`, or `SIGNIFICANT DRIFT`) covering undocumented code, incomplete features, architecture violations, dead code, and configuration drift — then converts the gaps into a REQ-R pack queue you work through normally.

Crucially, Phase R records artifacts as `done` or `partial`, never `planned`: *"if there is no code, there is no artifact to extract."* The blueprint reflects reality from day one.

## Quality conventions are applied by default

**The problem it solves:** every AI session reinventing pagination, error shapes, and auth handling.

**The mechanism:** [engine/conventions.md](../../engine/conventions.md) and [engine/rules/](../../engine/rules/) define API and frontend defaults, layering, security, performance, and naming — and specs document a value **only when it deviates**. That keeps the specs short and keeps the defaults consistent across every module.

Two rules are enforced with zero tolerance during verification: backend layering (`controller -> service -> repository`) and frontend third-party isolation (every HTTP call targets the configured API URL; no hardcoded external URLs; no direct third-party calls from the frontend).

## The engine outlives any one product

**The problem it solves:** process tooling that is really just one team's config.

**The mechanism:** engine purity. No repository name, brand color, framework version, or product noun may appear in `royascaff/engine/`. Those live only in generated `project/profile.md`. Verification check 14 tests this directly. The same engine drops into your next project unchanged, and you can upgrade the engine without touching your blueprint.

## No lock-in

Everything is markdown in your repository. There is no service to call, no database, no proprietary format, and no runtime dependency — the CLI copies files and exits. RoyaScaff is MIT licensed, so you can fork the flows and templates and make them yours.

## Related

- [Why it exists](02-why-it-exists.md)
- [When to use it](04-when-to-use-it.md)
- [Status and IDs](../reference/03-status-and-ids.md)
- [Verification checks](../reference/08-verification-checks.md)
