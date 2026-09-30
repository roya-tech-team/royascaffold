# Playbook

> **What:** what to say (or type) for each situation, and what the engine does
> **Read when:** you are not sure how to start something

In your AI tool (Cursor or Claude Code), talk to the navigator: start with **royascaff**. Arabic or English both work.

| You say | The engine does | You see |
|---|---|---|
| "royascaff, start a new project: …" | Discovery: fills 8 topics from your request, writes questions and assumptions, offers technology options with a recommendation, then **asks you** | Questions in the chat; then you run `royascaff approve project` |
| "royascaff continue" | Runs `royascaff next`, reads one stage card, and does the next step | What was done, what is next, what to say |
| "royascaff, where are we?" | Regenerates the board | `project/STATUS.md`: next up, features, active work, fixes |
| "royascaff, plan a feature: …" | Asks a few questions, then writes the feature, its requirements and its slices (no code) | The feature appears as 🗺 Planned or 📝 Outlined |
| "royascaff continue" (nothing active) | Opens the next ready slice as a change and walks it through the five stages | The feature shows 🔨 Building |
| "royascaff, fix: labels overlap" | Opens a bug change against the requirement, with a regression check | A small change under **Fixes** |
| "royascaff, make the buttons rounder" | Opens a polish change | A small change under **Fixes** |
| "royascaff, I changed code by hand" | Lists the commits and files it did not see, and helps you record them | They leave **⚠ Work outside the engine** |
| "royascaff, adopt this project" | Documents the existing code, one module per session (`royascaff adopt` shows the modules) | Features and components with Code globs; existing behavior ✅ Done once proven |
| "royascaff, I have feedback: …" | Writes a feedback report (your note, local counts, the project brief) for you to review | A file in `project/.usage/` to send to the RoyaScaff owner. Nothing is sent automatically |
| "royascaff, migrate from 1.3" | Converts an engine 1.2 or 1.3 project (nothing is deleted) | The same work on the 1.4 board |

## Five stages of every change

1 **Understand** (outcome, impact, risk) → 2 **Design** (after-state; a person approves medium or high risk) → 3 **Plan** (tasks, each with inputs and allowed paths) → 4 **Build** (one task at a time) → 5 **Check & Record** (checks, evidence, knowledge updated).

The CLI refuses a step that is not finished and says exactly what is missing.

## Commands you run yourself

- `royascaff approve project`: after discovery, confirm what and how (answers, assumptions, stack, architecture)
- `royascaff approve roadmap` (or `approve CAP-…`): confirm feature plans; no slice opens before
- `royascaff approve CHG-…`: approve a design (only people approve)
- `royascaff check CHG-… --result pass --note "looked at …"`: your look at a UI change (medium risk and above)
- `royascaff status`: the board
- `royascaff show CAP-…` / `royascaff trace CAP-…`: one feature, down to its code and evidence
- `royascaff log --since 7d`: what happened this week
- `royascaff backups`: automatic backups of your uncommitted files
- `royascaff feedback "…" --kind bug|confusing|idea`: write feedback · `royascaff usage`: see the local counters
