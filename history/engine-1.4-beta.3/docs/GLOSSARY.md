# Glossary

> **What:** RoyaScaff words in plain language
> **Read when:** a word on the board or in a card is unclear

| Word | Meaning |
|---|---|
| **Discovery** | The first stage of a project: 8 topics, questions and assumptions in `knowledge/00-discovery/discovery.md`, confirmed by the person before anything is planned |
| **Question** (`QST-`) | Something the AI had to ask; it stays open until the person's answer is written in `Answer:` |
| **Assumption** (`ASM-`) | Something the AI inferred; the person confirms it when they run `royascaff approve project` |
| **Approval** | A person's decision, recorded as an event with a fingerprint: the project (`approve project`), a feature plan (`approve roadmap` / `approve CAP-…`) or a change design (`approve CHG-…`). An edit afterwards makes it stale |
| **Adapter** | Technology guidance for a kind of app (`web-ui`, `web-3d`, `web-api`, `generic`): what to decide, the rules for the code, and what proves it |
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
| **Request** · **Demand** (`SRC-`) | The original request, kept word for word in `00-discovery/request.md` · one concrete thing it asks for, with its exact quote; covered by a requirement or feature, or out of scope with a reason |
| **Visual bar** | At least 5 lines in discovery topic 8: what good looks like and what is not acceptable. You score every UI change against it (`--bar`) |
| **Foundation slice** | The slice that delivers a *must* NFR (for a web app: theme, lighting, typography, framing); it is built first |
| **Red check** | `royascaff check CHG-… --red`: the acceptance tests run before the code exists and must fail, proving they test the new behavior |
| **Smoke check** | The app opened in a real browser by every full check: three screen sizes, no console errors, every button changes something, screenshots kept with the evidence |
| **Deferred to** | Work left for later names the slice that will do it (`Deferred to: SLC-…`); vague "later" is refused |
| **Rule** (`RULE-`) · **Release** (`REL-`) | A rule of this project that every change follows · what was shipped and which changes it includes |
| **States** | 💡 Idea · 📝 Outlined · 🗺 Planned · ✏️ Designing · 🔨 Building · 🧪 Checking · ✅ Done · 🚀 Released · ⚠️ Partly done · ⛔ Blocked |
