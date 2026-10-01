# RoyaScaff 1.4.0-beta.2 — release notes

> **For:** the pilot team, on a new project and on one migrated 1.3 project
> **Channel:** npm dist-tag `beta` (not published yet) — `npm install royascaff` still gives 1.2.5
> **Based on:** beta.1 plus the final review (plan file 10) and the first real 1.4 benchmark run

## What changed since beta.1

- **Discovery comes first.** A new project starts with `knowledge/00-discovery/discovery.md`: 8 topics, a question for every gap and an assumption for everything inferred. For technology the AI offers two or three options with a recommendation, even when the request names a stack, and then **asks you**. Nothing is planned before you run `royascaff approve project`.
- **You approve plans.** A feature is 📝 Outlined until you run `royascaff approve roadmap` (or `approve CAP-…`); no slice opens before. Editing a plan afterwards (including a requirement changed during a change) asks for your approval again. This replaces the old "refinement" confirmations, which the AI used to give itself.
- **Git holds everything.** A task cannot be marked done, and a change cannot close, while its code or the project knowledge is uncommitted. A task that changed files outside its allowed paths is refused unless you accept it with `--outside-ok "<reason>"`. The AI can no longer save context packs into the repository.
- **Stages check real content.** "Changed" impact layers must name existing IDs or paths; the design must rest on a decision, component or contract; Check & Record refuses changed code that no component owns and an architecture change the architecture page does not show; a standard project keeps a quality strategy (`init --lite` for prototypes).
- **Adapters.** `init --adapter web-ui|web-api|generic`. The adapter card is named at Design and Check, its rules are in every context pack, and for `web-ui` a UI change of medium risk or more needs **your look** (`royascaff check CHG-… --result pass --note "looked at …"`) before it is verified.
- **Honest status.** NFRs are proven by evidence (a finished feature with an unproven NFR is 🧪 Checking, not "Partly done"); a full check that runs every test re-proves earlier requirements; existing or migrated work reaches ✅ Done through a closed adoption or migration change with evidence; features can show 🚀 Released (`new record release`).
- **More on demand.** `new doc architecture|data|experience|security|quality|operations`; `RULE-` and `REL-` records; `adopt` shows each module's share of code owned by components; the board's Health shows docs vs code, saved packs, the largest open pack and code ownership; `cache clear`; `royascaff continue` typed in the terminal explains that it is a chat sentence.
- **Migration** (`royascaff migrate`) now also adds the discovery, the architecture page and the project log, and marks what a 1.3 migration change documented.

## Start

```bash
node <royascaffold>/engine-1.4-beta.2/bin/royascaff.cjs init --name "<product>" --code <CODE> --app web=apps/web --adapter web-ui
node <royascaffold>/engine-1.4-beta.2/bin/royascaff.cjs install
```

Then say **royascaff continue** in your AI tool. You will be asked questions first. The commands you run yourself: `approve project`, `approve roadmap`, `approve CHG-…`, and your look at UI changes. See `project/PLAYBOOK.md`.

## Known limits (for 1.5)

| Limit | Now |
|---|---|
| No browser or visual runner | A person looks at UI changes and records it |
| No adapter manifests or inventory view | Adapter cards are guidance; `adopt` shows code ownership |
| No JSON Schemas per record kind | `export` / `roundtrip` guard the data |
