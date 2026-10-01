# Playbook

> **What:** what to say (or type) for each situation, and what the engine does
> **Read when:** you are not sure how to start something

In your AI tool (Cursor or Claude Code), talk to the navigator: start with **royascaff**. Arabic or English both work.

| You say | The engine does | You see |
|---|---|---|
| "royascaff, start a new project: …" | Discovery: saves your request word for word (`request.md`), lists each concrete demand in it (`SRC-`, with the exact quote), fills 8 topics, writes questions and assumptions, offers technology options with a recommendation, then **asks you**. For a web app, topic 8 ends with a **visual bar**: at least 5 lines on what good looks like | Questions in the chat; then you run `royascaff approve project` (it lists request items no demand quotes) |
| "royascaff continue" | Runs `royascaff next`, reads one stage card, and does the next step | What was done, what is next, what to say |
| "royascaff, where are we?" | Regenerates the board | `project/STATUS.md`: next up, features, active work, fixes |
| "royascaff, plan a feature: …" | Asks a few questions, then writes the feature, its requirements and NFRs, and its slices (no code). Every demand of the request is covered or marked out of scope; every *must* NFR sits in a slice, the look-and-feel foundation first | The feature appears as 🗺 Planned or 📝 Outlined; the board shows "Brief: X of Y demands covered" |
| "royascaff continue" (nothing active) | Opens the next ready slice as a change and walks it through the five stages. For a *must* requirement the acceptance tests come first and must fail (`check --red`); the full check runs the smoke test in a real browser. Next-horizon work waits until every Now feature is done and you looked at it | The feature shows 🔨 Building |
| "royascaff, fix: labels overlap" | Opens a bug change against the requirement, with a regression check | A small change under **Fixes** |
| "royascaff, make the buttons rounder" | Opens a polish change | A small change under **Fixes** |
| "royascaff, I changed code by hand" | Lists the commits and files it did not see, and helps you record them | They leave **⚠ Work outside the engine** |
| "royascaff, adopt this project" | Documents the existing code, one module per session (`royascaff adopt` shows the modules) | Features and components with Code globs; existing behavior ✅ Done once proven |
| "royascaff, I have feedback: …" | Writes a feedback report (your note, local counts, the project brief) for you to review | A file in `project/.usage/` to send to the RoyaScaff owner. Nothing is sent automatically |
| "royascaff, migrate from 1.3" | Converts an engine 1.2 or 1.3 project (nothing is deleted) | The same work on the 1.4 board |

## Five stages of every change

1 **Understand** (outcome, risk, and the Impact: one row per knowledge layer — Business, Requirements, Domain, Architecture, Data, Contracts, Experience, Security, Components & tests, Quality & operations) → 2 **Design** (after-state that addresses every changed layer; a person approves medium or high risk) → 3 **Plan** (tasks, each with inputs and allowed paths; a test planned for every requirement) → 4 **Build** (one task at a time: tests first, a red run, then the code) → 5 **Check & Record** (checks, dependency rules, evidence; every changed layer's page updated).

## Every knowledge file is part of the flow

Each file has a stage that writes it, a stage that reads it, and a check. The architecture's main parts and dependency rules, the project rules and domain rules that apply, the pages of the layers a change touches and the visual bar are put into every task's context. A dependency rule written as paths (`` `a/**` must not import `b/**` ``) is enforced on the code. A changed layer must update its page; a record added in a change (ADR, CMP, CTR, RULE, INV) makes its layer changed. Your request and its demands are checked at both ends: covered when planned, delivered when built, and the outcomes are measured by you.

The CLI refuses a step that is not finished and says exactly what is missing.

## Commands you run yourself

- `royascaff approve project`: after discovery, confirm what and how (answers, assumptions, stack, architecture)
- `royascaff approve roadmap` (or `approve CAP-…`): confirm feature plans; no slice opens before
- `royascaff approve CHG-…`: approve a design (only people approve)
- `royascaff check CHG-… --result pass --note "looked at …" --bar all` (or `--bar 1,2,4`, the visual-bar lines that pass): your look at a UI change (medium risk and above), **in your own terminal** — it asks you to confirm, which an AI tool cannot do. Without `--bar` it shows the bar and the latest screenshots; lines you did not pass show as gaps on the board
- `royascaff measure OUT-… --result met|not-met --note "…"`: when an outcome's features are done, record whether it was reached
- `royascaff smoke init`: once per web app — the smoke test (Playwright) that every full check runs: three screen sizes, console errors, every button, screenshots (install: `npm i -D playwright && npx playwright install chromium`)
- `royascaff open SLC-… --force`: open a Next slice before the Now features are done (only you can)
- `royascaff status`: the board
- `royascaff show CAP-…` / `royascaff trace CAP-…`: one feature, down to its code and evidence
- `royascaff log --since 7d`: what happened this week
- `royascaff backups`: automatic backups of your uncommitted files
- `royascaff feedback "…" --kind bug|confusing|idea`: write feedback · `royascaff usage`: see the local counters
