# RoyaScaff Engine 1.3 — Guided Learning Agenda

This file is our durable map for learning RoyaScaff Engine 1.3. We will use a **task-management application** as the running example and cover one lesson at a time through discussion.

## How to resume

If the conversation context is lost, start with:

> Continue the RoyaScaff Engine 1.3 walkthrough from `royascaffold/engine-1.3-learning-agenda.md`.

Then check **Current position** below and continue with the first unchecked lesson.

## Running example: TaskFlow

TaskFlow is a small team task-management web application.

Initial product idea:

- a member creates a workspace;
- a member creates and assigns tasks;
- an assignee moves a task through `Todo → In Progress → Done`;
- team members view a board;
- the system records important task activity.

We will not design the whole application at once. In the engine's style, we will establish the overall product and architecture, then fully design and deliver one dependency-ready vertical slice at a time.

Our likely first slice will be **Create a task**, after the minimum application and identity/workspace foundation is understood.

## Current position

- [x] Repository structure inspected.
- [x] Durable learning agenda created.
- [x] Lesson 1 — Big-picture mental model and main engine action.
- [x] Lesson 2 — The three blueprint/view types.
- [x] Lesson 3 — The layered reading model.
- [x] Lesson 4 — Engine parts and responsibilities.
- [x] Lesson 5 — Route the TaskFlow request.
- [x] Lesson 6 — Capture business intent and requirements.
- [x] Lesson 7 — Model the TaskFlow domain and workflows.
- [ ] Lesson 8 — Establish TaskFlow system direction. **In discussion.**

Update this section at the end of each completed lesson.

## Learning agenda

### Part A — See the whole engine

- [x] **Lesson 1: Big-picture mental model**
  - What engine 1.3 is and is not.
  - Its main action: turn an intent into verified implementation and reconciled knowledge.
  - The end-to-end lifecycle using TaskFlow.
- [x] **Lesson 2: Main Blueprint, Change Blueprint, and Slice/Context views**
  - Which information is canonical.
  - Where proposed changes live.
  - Why generated Context Packs are disposable views.
- [x] **Lesson 3: The layered reading model**
  - L0 system map.
  - L1 business, requirements, domain, and workflows.
  - L2 solution design.
  - L3 components, actions, code map, and tests.
  - L4 quality and operations.
- [x] **Lesson 4: The engine's parts and their responsibilities**
  - Workflows, skills, adapters, templates, schemas, rules, and the CLI.
  - How these parts cooperate without becoming the product's source of truth.

### Part B — Start TaskFlow correctly

- [x] **Lesson 5: Route the request**
  - Classify “build a task-management app” as Initial Build.
  - Assess risk and select gates.
  - Choose project profile, document profile, and adapters.
- [x] **Lesson 6: Capture business intent and requirements**
  - Outcomes, actors, capabilities, scope, requirements, acceptance criteria, and NFRs.
  - Give each important artifact a stable ID.
  - Separate stakeholder decisions from implementation design.
- [x] **Lesson 7: Model the task domain and workflows**
  - Concepts such as Workspace, Member, Task, Assignment, and Activity.
  - Invariants, states, transitions, failures, and permissions.
  - Model the task lifecycle before choosing framework details.
- [ ] **Lesson 8: Establish system direction**
  - System map, boundaries, architecture direction, quality posture, operations outline, and roadmap.
  - Decide what must be known globally and what can wait for a slice.

### Part C — Deliver one vertical slice

- [ ] **Lesson 9: Select and design the first slice**
  - Choose a dependency-ready capability.
  - Fully design only its affected data, contracts, experience, security, components, actions, and tests.
- [ ] **Lesson 10: Create a Change Blueprint**
  - Capture the proposed after-state outside canonical Main.
  - Record impact, risk, affected layers, approvals, paths, and IDs.
  - Understand the lifecycle: `draft → analyzed → approved → ready → in-progress → verified → reconciled → closed`.
- [ ] **Lesson 11: Turn design into executable tasks**
  - Exact inputs, allowed paths, forbidden inventions, steps, checks, recovery, done conditions, and handoff.
  - Make each task executable by another session without hidden design decisions.
- [ ] **Lesson 12: Build a bounded Context Pack**
  - Root IDs, included IDs/documents, code-map paths, role, budget, exclusions, and freshness.
  - Why required context must fail on overflow rather than silently truncate.
- [ ] **Lesson 13: Implement within the approved boundary**
  - What an implementer may change.
  - When implementation must stop and return to analysis.
  - How source files connect back to components, actions, requirements, and tests.
- [ ] **Lesson 14: Verify with fresh evidence**
  - The difference between implemented and verified.
  - Map requirements, invariants, and NFRs to current evidence.
  - Understand PASS, FAIL, INCOMPLETE, and independent verification for higher risk.
- [ ] **Lesson 15: Reconcile back into Main**
  - Preview the after-state, detect conflicts, update canonical knowledge, regenerate views, validate, and archive provenance.
  - Why verified code is still not reconciled knowledge.
- [ ] **Lesson 16: Repeat the slice loop**
  - Pick the next dependency-ready capability.
  - Resume without loading or redesigning the entire product.

### Part D — Understand the implementation deeply

- [ ] **Lesson 17: Markdown contracts, IDs, relations, and two-dimensional status**
  - Document headers and artifact records.
  - Typed traceability relations.
  - Knowledge status versus implementation status.
  - Ownership and stable IDs.
- [ ] **Lesson 18: Project layout and canonical ownership**
  - `system-map.md`, `profile.md`, `knowledge/`, `changes/`, `contexts/`, `evidence/`, `releases/`, and `generated/`.
  - Compact, modular, and federated document profiles.
- [ ] **Lesson 19: CLI internals**
  - Follow `bin/sdlc.js` through `validate`, `index`, and `context`.
  - See what is deterministically enforced and what remains a human/agent-controlled procedure.
- [ ] **Lesson 20: Schemas and templates**
  - How schemas normalize records.
  - How templates shape artifacts without becoming canonical facts.
- [ ] **Lesson 21: Code-map coverage and exact-reference context building**
  - Significant files, source roots, exclusions, ownership, references, hashes, and budgets.

### Part E — Compare examples and cover the remaining flows

- [ ] **Lesson 22: Read the PollPulse demo end to end**
  - Trace one voting requirement through domain invariant, contract, action/component, source file, test catalog, Context Pack, evidence, and status.
- [ ] **Lesson 23: Read the Knowledge Universe benchmark project**
  - Trace Initial Build into a real Change Blueprint, four implementation tasks, task Context Packs, evidence, verification, and reconciliation.
- [ ] **Lesson 24: Change, Bug Fix, Polish, and Refactor workflows**
  - Route the same TaskFlow product through different intents.
- [ ] **Lesson 25: Reverse Engineer, Reconcile Drift, and Release workflows**
  - Bring existing code under trusted knowledge, resolve disagreement, and deploy safely.
- [ ] **Lesson 26: Build a small TaskFlow blueprint together**
  - Create the actual project skeleton and first canonical artifacts.
  - Prepare and, if desired, implement the first vertical slice.

## The anchor lifecycle

Keep returning to this chain:

```text
request
  → route intent and risk
  → establish approved product knowledge
  → select one vertical slice
  → describe its proposed after-state in a Change Blueprint
  → create bounded executable tasks
  → generate a role-specific Context Pack
  → implement within the approved boundary
  → verify with fresh evidence
  → reconcile the proven after-state into Main
  → repeat
```

## Primary repository references

- Engine overview: `royascaffold/engine-1.3/README.md`
- Router and invariants: `royascaffold/engine-1.3/flow.md`
- Project zones: `royascaffold/engine-1.3/project-layout.md`
- Records, IDs, relations, and evidence: `royascaffold/engine-1.3/conventions.md`
- Risk gates: `royascaffold/engine-1.3/risk-and-gates.md`
- Initial Build flow: `royascaffold/engine-1.3/workflows/01-initial-build.md`
- Engine CLI: `royascaffold/engine-1.3/bin/sdlc.js`
- PollPulse worked blueprint: `royascaffold/engine-1.3-demo/`
- Knowledge Universe generated project: `benchmark/3d-network/grok-low/gpt-yes-yes-1.3-1213/project/`

## Questions and discoveries log

Add important conclusions or unresolved questions here as we proceed.

- Engine 1.3 is Markdown-first, but Markdown files are governed records rather than loose documentation.
- The CLI enforces a deterministic minimum; approvals, semantic correctness, evidence quality, and reconciliation decisions remain controlled procedures.
- Implementation is intentionally sliced so a new session can work from a bounded Context Pack rather than the whole repository or conversation history.
- The layer model and lifecycle zones are separate axes: L3 describes the *kind* of knowledge, while Main versus Change describes whether that knowledge is reconciled truth or an in-flight delta. Before reconciliation, new code-map rows and implementation mappings stay in the Change Blueprint/changed-file inventory; reconciliation applies the verified rows and statuses to Main.
