# Glossary

> **What:** RoyaScaff words in plain language
> **Read when:** a word on the board or in a card is unclear

| Word | Meaning |
|---|---|
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
| **Refinement** | Reviewing a planned slice whose requirements changed since it was planned |
| **Context Pack** | Everything one task needs, built from the task's inputs (`royascaff context TASK-…`) |
| **Hand-off note** | The sentence written when a task is done or blocked, so the next session can continue |
| **Changed since verified** | Code of a finished feature changed after its evidence was recorded |
| **Work outside the engine** | Commits or uncommitted files that no task or change covers |
| **States** | 💡 Idea · 📝 Outlined · 🗺 Planned · ✏️ Designing · 🔨 Building · 🧪 Checking · ✅ Done · 🚀 Released · ⚠️ Partly done · ⛔ Blocked |
