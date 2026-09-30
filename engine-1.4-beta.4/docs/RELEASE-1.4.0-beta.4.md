# RoyaScaff 1.4.0-beta.4 — release notes

> **For:** the next benchmark rerun and the pilot team
> **Channel:** npm dist-tag `beta` (not published yet) — `npm install royascaff` still gives the stable 1.2.6; `npm install royascaff@beta` gives this version
> **Based on:** beta.3 plus the owner's review of it (plan files 16 and 17)

## Why this release

beta.3 raised the product grade, but a review found three problems. Template examples had been copied from a benchmark prompt. Adapter and JavaScript rules were hard-coded in the engine core. And most knowledge files were written, checked once, and then never read by the stage that builds the code. beta.4 follows one rule: **every knowledge file has a producer, a consumer and a check, and the core knows no product and no technology by name.**

## What changed since beta.3

- **Clean examples.** Every template example uses one neutral product (an agency campaign planner). A test fails if any benchmark phrase appears in anything the engine ships.
- **Adapters declare, the core obeys.** Each adapter has a card for the AI and a manifest (`<name>.json`) for the engine: visual bar, person's look, smoke test, test-file patterns, dependency check, trade-offs. A new `node` adapter holds the npm/TypeScript rules (`web-ui` includes it). A team can add its own adapter in `project/adapters/`, for example for a Python or .NET stack. `web-3d` is generic now: product rules belong in the project as `RULE-` records.
- **A knowledge registry and ten Impact rows.** Business, Requirements, Domain, Architecture, Data, Contracts, Experience, Security, Components & tests, Quality & operations:
  - Understand names what each changed or referenced layer touches.
  - Design addresses every changed layer.
  - Record needs each changed layer's page updated. A new ADR, CMP, CTR, RULE or INV makes its layer changed.
  - The architecture page is part of `approve project`. A change whose design you approved may update it.
- **The design reaches the code.** Every task's context carries:
  - the architecture's main parts and dependency rules;
  - the project rules and domain rules that apply;
  - the pages of the layers the change touches, for example the design tokens;
  - the visual bar.

  If something must be left out to fit the budget, the context says so.
- **The code is checked against the knowledge.**
  - Dependency rules written as paths fail the full check on a violating import.
  - Overlapping or whole-app components are warned.
  - NFRs with a metric Measure (`smoke.fps >= 50`) are proven only while the latest check meets them.
- **Business at both ends.**
  - Demands are one table row each. The board shows covered and delivered.
  - Outcomes are measured by you: `royascaff measure OUT-… --result met|not-met --note "…"`.
  - Design sees your constraints, look and visual bar.
  - The request and the demand list no longer count as documentation in the docs-to-code ratio.
- **Tests inside every change and task.** Every delivered requirement has a test before Ready. A task that implements a *must* requirement runs its new tests red inside the task before it is done. There is no separate "acceptance tests" task any more.
- **Fixes from the beta.3 benchmark.**
  - fps is gated only on a real GPU; software rendering just reports its number.
  - The smoke check fails when the scene is cut off at the canvas edges, on open and after Reset.
  - Removing lighting or antialiasing without a stated "Trade-off:" is flagged.
  - **Your look is confirmed in your terminal** (an AI tool cannot answer it) and is logged `look:tty`.

## Start

```bash
git init
node <royascaffold>/engine-1.4-beta.4/bin/royascaff.cjs init --name "<product>" --code <CODE> --app web=apps/web --adapter web-ui,web-3d
node <royascaffold>/engine-1.4-beta.4/bin/royascaff.cjs install
# commit, then in the AI tool: "royascaff continue"
```

Once the app exists, install Playwright in it (`npm i -D playwright && npx playwright install chromium`) and run `royascaff smoke init`. The commands you run yourself are `approve project`, `approve roadmap`, `approve CHG-…`, your look (`check … --bar …`, in a terminal) and `measure OUT-…`.

## Known limits (for 1.5)

| Limit | Now |
|---|---|
| Dependency rules in plain words are not checked | They reach every task's context; write the ones the code can break as path rules |
| Framing is measured as content at the canvas border | Good for a scene with a subject in the middle; other layouts can raise `ROYASCAFF_EDGE_MAX` in their adapter |
| No JSON Schemas per record kind | `export` / `roundtrip` guard the data |
