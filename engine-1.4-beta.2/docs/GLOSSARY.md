# Glossary

> **What:** RoyaScaff words in plain language
> **Read when:** a word on the board or in a card is unclear

| Word | Meaning |
|---|---|
| **Discovery** | The first stage of a project: 8 topics, questions and assumptions in `knowledge/00-discovery/discovery.md`, confirmed by the person before anything is planned |
| **Question** (`QST-`) | Something the AI had to ask; it stays open until the person's answer is written in `Answer:` |
| **Assumption** (`ASM-`) | Something the AI inferred; the person confirms it when they run `royascaff approve project` |
| **Approval** | A person's decision, recorded as an event with a fingerprint: the project (`approve project`), a feature plan (`approve roadmap` / `approve CAP-…`) or a change design (`approve CHG-…`). An edit afterwards makes it stale |
| **Adapter** | Technology guidance for a kind of app (`web-ui`, `web-api`, `generic`): what to decide, the rules for the code, and what proves it |
| **Knowledge profile** | `standard` (keeps a quality strategy) or `lite` (prototypes: only the one-page architecture is required) |
| **Outcome** (`OUT-`) | Why the business wants something: a result you can measure |
| **Feature** (`CAP-`) | Something a user can do. Shown as "Feature"; the ID prefix stays `CAP-` |
| **Horizon** | When a feature is planned: Now, Next, Later or Backlog |
| **Requirement** (`REQ-`) | What a feature must do, with acceptance criteria. What and why, never how |
| **Slice** (`SLC-`) | A small end-to-end piece of a feature, planned on the roadmap, built by one change |
| **Change** (`CHG-`) | The work folder for one slice, or for a fix, refactor or chore. Lives in `project/changes/<ID>/` forever |
| **Task** (`TASK-`) | One bounded implementation step inside a change, with inputs and allowed paths |
| **Evidence** (`EVD-`) | Proof that a requirement works: a passing test, a check, or a recorded manual check |
| **Main** | The knowledge in `project/knowledge/`: how the system is now |
| **Record into Main** | Stage 5: after a change is verified, update the knowledge so it matches the code |
| **Gate** | The checks the CLI runs before a change may move to the next stage |
| **Refinement** | Reviewing a plan whose requirements changed after it was approved: in 1.4 the person approves the feature plan again |
| **Context Pack** | Everything one task needs, built from the task's inputs (`royascaff context TASK-…`) |
| **Hand-off note** | The sentence written when a task is done or blocked, so the next session can continue |
| **Changed since verified** | Code of a finished feature changed after its evidence was recorded |
| **Work outside the engine** | Commits or uncommitted files that no task or change covers, and project knowledge not committed yet |
| **Person's check** | For a UI change of medium risk or more, the person opens the app and records `royascaff check CHG-… --result pass --note "looked at …"` |
| **Rule** (`RULE-`) · **Release** (`REL-`) | A rule of this project that every change follows · what was shipped and which changes it includes |
| **States** | 💡 Idea · 📝 Outlined · 🗺 Planned · ✏️ Designing · 🔨 Building · 🧪 Checking · ✅ Done · 🚀 Released · ⚠️ Partly done · ⛔ Blocked |
