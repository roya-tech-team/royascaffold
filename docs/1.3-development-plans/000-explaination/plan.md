I created our durable roadmap: [engine-1.3-learning-agenda.md](/Users/islamhaa/projects/orgs/illm.io/royascaff-research/royascaffold/engine-1.3-learning-agenda.md).

It contains 26 discussion-sized lessons, our TaskFlow example, progress tracking, and resume instructions.

## Lesson 1 — The big picture

RoyaScaff Engine 1.3 is best understood as:

> A project memory, change-control process, and bounded execution system for building software safely.

It is not the TaskFlow application itself. It is also not React, a backend framework, or simply a code generator.

Its main action is:

```text
intent
  → approved meaning
  → bounded implementation work
  → code
  → verification evidence
  → updated canonical project knowledge
```

For our task-management application, that looks like this:

1. **Request**

   “Build a task-management application.”

2. **Route the work**

   The engine classifies this as an **Initial Build**, assesses risk, and decides which workflow and approvals apply.

3. **Understand the product**

   Before coding, we establish:

   - who uses TaskFlow;
   - what problem it solves;
   - its capabilities;
   - its important requirements;
   - concepts such as Task, Member, Workspace, and Assignment;
   - rules such as “only an authorized member can modify a task.”

4. **Establish the system direction**

   We describe the application boundaries and overall architecture without designing every feature in detail.

5. **Choose one vertical slice**

   For example: **Create a task**.

   We do not load and implement the entire TaskFlow application in one huge operation.

6. **Describe the proposed change**

   The slice receives a Change Blueprint containing its requirements, design, affected areas, risk, and approval state.

7. **Create bounded tasks**

   Each implementation task identifies:

   - exact input requirements and decisions;
   - allowed files;
   - forbidden inventions;
   - checks and completion conditions.

8. **Build a Context Pack**

   The engine assembles only the knowledge needed for that particular task.

9. **Implement**

   The developer or coding agent works within the approved task boundary.

10. **Verify**

    Fresh evidence demonstrates whether the implementation actually satisfies its requirements.

11. **Reconcile**

    Once proven, the new reality is merged into the project’s canonical knowledge.

12. **Repeat**

    Select the next dependency-ready slice, such as assigning a task or moving it to “In Progress.”

The most important engine 1.3 distinction is:

```text
implemented ≠ verified ≠ reconciled
```

- **Implemented:** code exists.
- **Verified:** current evidence proves it works.
- **Reconciled:** canonical project knowledge has been updated to describe the proven system.

The PollPulse demo demonstrates this clearly: its application behavior is marked `implemented`, but not `verified`, because automated test evidence is missing.

So the shortest useful mental model is:

> RoyaScaff controls how an idea becomes trusted code, and how trusted code becomes durable project truth.

Before we move to Lesson 2, does this distinction between the **engine**, the **project knowledge**, and the **application code** make sense?



## Lesson 2 — Main, Change, and Context

The engine separates information into three spaces so that current truth, proposed work, and temporary working context never become confused.

| Space | Meaning | Typical location |
|---|---|---|
| Main Blueprint | The project’s accepted, durable truth | `system-map.md`, `profile.md`, `knowledge/` |
| Change Blueprint | A proposed or in-progress delta | `changes/active/CHG-.../` |
| Slice/Context View | The exact information needed for one task | `contexts/manifests/`, `contexts/generated/` |

### 1. Main Blueprint: “What is true now?”

Main is not one file. It is the project’s canonical knowledge zone.

For TaskFlow, Main might say:

```text
Product: TaskFlow
Capability: Task management
Requirement: A member can create a task
Implementation status: planned
```

It also contains:

- business outcomes;
- approved requirements;
- domain concepts and workflows;
- current architecture;
- implemented components and actions;
- code ownership;
- tests;
- quality and operations knowledge;
- an approved future roadmap.

A useful rule is:

> If we needed to rebuild the current system, Main should explain it without requiring old conversations or archived changes.

Main should describe the reconciled system—not temporary implementation experiments.

---

### 2. Change Blueprint: “What are we proposing to make true?”

Suppose we select the first TaskFlow slice: **Create a task**.

We create something like:

```text
changes/active/CHG-TASKS-001/
```

It could contain:

```text
change.md
impact.md
execution-plan.md
verification.md
reconciliation.md
evidence/
```

The Change Blueprint records the proposed movement from the current state to an after-state.

For example:

```text
Current state:
Task creation is planned but not implemented.

Proposed after-state:
An authorized workspace member can create a task
with a title, description, assignee, and due date.
```

It also records:

- outcome and non-goals;
- affected requirements and layers;
- risk;
- proposed contracts, data, components, and actions;
- implementation tasks;
- allowed paths;
- approvals;
- verification evidence;
- reconciliation plan.

While the work is active, its new facts do not silently become Main truth.

This avoids a common problem:

```text
design document says feature exists
but code is unfinished or unverified
```

Only after successful implementation, verification, and reconciliation does the proven after-state move into Main.

---

### 3. Slice Manifest and Context Pack: “What does this task need to know?”

Imagine the execution plan contains:

```text
TASK-TASKS-001 — Implement the create-task API
```

That task should not receive every TaskFlow document, every previous change, and the entire source tree.

Instead, its Context Manifest might select:

```text
TASK-TASKS-001     implementation task
REQ-TASKS-001      create-task requirement
INV-TASKS-001      task must belong to a workspace
RULE-TASKS-001     creator must be a workspace member
CTR-TASKS-001      POST /tasks contract
CMP-TASKS-001      task service
DATA-TASKS-001     task persistence model
TEST-TASKS-001     acceptance test
```

The engine generates a Context Pack containing those exact records and required documents.

The Context Pack is:

- role-specific;
- task-specific;
- bounded by a token budget;
- tied to a project revision/hash;
- disposable and regenerable;
- never canonical truth.

You do not manually update the generated Context Pack. You update its canonical source or the active change, then regenerate it.

### The complete movement

```text
MAIN
Current accepted TaskFlow truth
    │
    │ proposed delta
    ▼
CHANGE BLUEPRINT
“Implement Create Task”
    │
    │ select exact task knowledge
    ▼
CONTEXT PACK
Implementation working packet
    │
    │ implement and verify
    ▼
RECONCILIATION
Apply proven after-state
    │
    ▼
MAIN
Updated accepted TaskFlow truth
```

The easiest analogy is:

- **Main Blueprint:** the official map.
- **Change Blueprint:** the approved construction plan.
- **Context Pack:** today’s instructions for one construction crew.

A critical practical rule follows:

> If an implementer discovers that a new public API, security rule, or business behavior is required, they must not invent it in the code or edit the Context Pack. The work returns to the Change Blueprint for analysis and approval.

Our progress is tracked in [engine-1.3-learning-agenda.md](/Users/islamhaa/projects/orgs/illm.io/royascaff-research/royascaffold/engine-1.3-learning-agenda.md).

Does this separation make sense—especially why a Change Blueprint cannot immediately be treated as Main truth?



## Lesson 3 — The layered reading model

RoyaScaff organizes project knowledge from the broadest meaning down to operational reality:

```text
L0  System map
 ↓
L1  Business, requirements, domain, workflows
 ↓
L2  Solution design
 ↓
L3  Components, actions, source code, tests
 ↓
L4  Quality and operations
```

Let’s apply each layer to TaskFlow.

### L0 — System map: “What is this system?”

The system map is the front door.

For TaskFlow, it would summarize:

- the purpose of TaskFlow;
- actors such as workspace members and administrators;
- applications such as Web, API, and database;
- major boundaries;
- capabilities such as task management and workspace management;
- important workflows;
- links to deeper documents.

Example:

```text
Member → TaskFlow Web → TaskFlow API → Database
```

L0 helps someone quickly orient themselves. It does not contain every detailed requirement or API endpoint.

Typical file:

```text
system-map.md
```

---

### L1 — Product meaning: “What must the system do?”

L1 contains business meaning, requirements, domain rules, and workflows.

For TaskFlow:

```text
OUT-TASKFLOW-001
Teams coordinate work more clearly.

CAP-TASKS-001
Members manage tasks inside a workspace.

REQ-TASKS-001
An authorized workspace member can create a task.

INV-TASKS-001
Every task belongs to exactly one workspace.

WF-TASKS-001
A task moves through Todo → In Progress → Done.
```

These records describe the intended behavior without deciding whether we use React, PostgreSQL, REST, or another technology.

Typical locations:

```text
knowledge/01-business/
knowledge/02-requirements/
knowledge/03-domain/
```

The domain layer is especially important because it captures rules that must remain true regardless of interface or technology.

---

### L2 — Solution design: “How will our system realize that meaning?”

Now we turn the approved behavior into a project-specific design.

For Create Task, L2 might decide:

```text
POST /workspaces/:workspaceId/tasks

Request:
- title
- description
- assigneeId
- dueDate

Storage:
- tasks table
- workspaceId foreign key
- creatorId
- assigneeId
- status
```

L2 also decides:

- application boundaries;
- authorization approach;
- data model;
- API contracts;
- user experience;
- compatibility rules;
- architecture decisions;
- security and privacy behavior.

Typical location:

```text
knowledge/04-design/
```

The important distinction is:

```text
L1: A workspace member can create a task.
L2: The web client calls POST /workspaces/:id/tasks.
```

The first is product behavior. The second is one chosen implementation design.

---

### L3 — Implementation ownership: “Which software parts realize the design?”

L3 connects the design to concrete implementation responsibilities.

For example:

```text
CMP-TASKS-API-001
Task HTTP boundary

ACT-TASKS-CREATE-001
Create-task application action

CMP-TASKS-REPOSITORY-001
Task persistence component

TEST-TASKS-CREATE-001
Create-task acceptance test
```

The code map then connects those records to physical files:

```text
src/modules/tasks/tasks.routes.ts
  → CMP-TASKS-API-001

src/modules/tasks/create-task.ts
  → ACT-TASKS-CREATE-001

src/modules/tasks/tasks.repository.ts
  → CMP-TASKS-REPOSITORY-001

tests/tasks/create-task.test.ts
  → TEST-TASKS-CREATE-001
```

Typical location:

```text
knowledge/05-implementation/
```

This layer answers:

> If a requirement changes, which components, actions, files, and tests are affected?

---

### L4 — Quality and operations: “Can we trust, run, observe, and recover it?”

L4 covers concerns such as:

- verification strategy;
- performance;
- reliability;
- security testing;
- deployment;
- monitoring;
- rollback;
- operational runbooks;
- accepted risks.

For TaskFlow:

```text
Create-task requests must complete within the agreed response time.

Failed requests must be observable.

A failed deployment must be reversible.

Database backups must protect task data.
```

Typical locations:

```text
knowledge/06-quality/
knowledge/07-operations/
```

## Reading downward, delivering vertically

This is the most important part of Lesson 3.

The layers provide a top-down reading order, but RoyaScaff does not intend us to implement the entire application one horizontal layer at a time.

Instead, each vertical slice crosses the necessary layers:

```text
Create Task slice
│
├─ L1 requirement and domain rules
├─ L2 contract, data, security, and experience
├─ L3 components, actions, files, and tests
└─ L4 verification and operational needs
```

So:

- **Reading is horizontal and top-down:** understand the system progressively.
- **Delivery is vertical and iterative:** take one capability through all affected layers.

That is how RoyaScaff avoids both extremes:

- coding without understanding the product;
- documenting the entire future system before delivering anything.

One small question before Lesson 4: if we have the rule **“a task must always belong to exactly one workspace,”** do you see why its meaning belongs in L1, while the database foreign key enforcing it belongs in L2/L3?


Your reasoning is exactly right.

The invariant:

> A task belongs to exactly one workspace.

belongs in L1 because it must remain true regardless of technology.

It could be enforced by:

- a database foreign key;
- application-service validation;
- an aggregate boundary;
- an event-processing rule;
- or several mechanisms together.

The database foreign key is one L2/L3 realization of the L1 rule.

## Your code-map question

This reveals that RoyaScaff has two separate dimensions:

| Dimension | Question |
|---|---|
| Layer: L0–L4 | What kind of knowledge is this? |
| Zone: Main/Change/Context | Is it current truth, a proposed delta, or a temporary view? |

Therefore, L3 does not automatically mean “already reconciled.”

You can have:

```text
Main L3
Current reconciled components, actions, code map, and tests

Change L3 delta
Proposed or newly implemented components, files, actions, and tests

Context L3 selection
Only the L3 information needed for one task
```

### Example: adding Create Task

Before the change, Main might contain:

```text
REQ-TASKS-001
Knowledge status: approved
Implementation status: planned
```

But no create-task source file exists yet.

### 1. During design

The Change Blueprint proposes:

```text
New component: CMP-TASKS-SERVICE-001
New action: ACT-TASKS-CREATE-001
Planned file: src/tasks/create-task.ts
Planned test: tests/tasks/create-task.test.ts
```

This proposed mapping belongs to the active change—not yet to Main as implemented truth.

It can appear in:

- the proposed after-state;
- impact analysis;
- execution plan;
- changed-file plan;
- task definitions.

### 2. During implementation

The developer creates:

```text
src/tasks/create-task.ts
tests/tasks/create-task.test.ts
```

The source files now physically exist, but Main still represents the pre-change reconciled baseline.

The active Change Blueprint records:

- files actually changed;
- which task created them;
- which components they implement;
- checks that ran;
- evidence produced;
- incomplete or unexpected work.

So at this moment:

```text
Code exists
Change records it
Main has not accepted it yet
```

### 3. During verification

Verification checks the proposed mappings against reality:

```text
ACT-TASKS-CREATE-001
  → implemented by src/tasks/create-task.ts

TEST-TASKS-CREATE-001
  → implemented by tests/tasks/create-task.test.ts
  → fresh test evidence passes
```

If the code does not match the proposed mapping, verification fails or reports an incomplete result.

### 4. During reconciliation

Reconciliation previews the Main changes:

```diff
+ ACT-TASKS-CREATE-001
+ CMP-TASKS-SERVICE-001
+ src/tasks/create-task.ts → implements ACT-TASKS-CREATE-001
+ tests/tasks/create-task.test.ts → verifies REQ-TASKS-001
```

It then:

1. applies the verified component/action records;
2. adds the final code-map rows;
3. updates requirement implementation statuses;
4. adds test and evidence relationships;
5. regenerates indexes;
6. validates complete source-file coverage;
7. commits all canonical changes together;
8. archives the Change Blueprint as provenance.

After that, Main can say:

```text
REQ-TASKS-001
Knowledge status: approved
Implementation status: verified
Realized by: ACT-TASKS-CREATE-001
Verified by: TEST-TASKS-CREATE-001
```

So the direct answer is:

> Before reconciliation, you describe the proposed code map and record the actual changed files inside the Change Blueprint. During reconciliation, the verified final mappings are applied to Main’s canonical L3 code map.

For a greenfield system, Main may already contain `planned` components or roadmap entries. But it must not claim that nonexistent or unverified code is `implemented` or `verified`.

This timing detail is now recorded in our [learning agenda](/Users/islamhaa/projects/orgs/illm.io/royascaff-research/royascaffold/engine-1.3-learning-agenda.md).


## Lesson 4 — The engine’s main parts

The `engine-1.3/` folder is the reusable operating contract. TaskFlow’s project blueprint would be a separate application-specific instance of that contract.

The engine has seven main parts:

```text
Rules
  ↓
Router
  ↓
Workflow
  ↓
Skills
  ↓
Adapters
  ↓
Templates and schemas
  ↓
CLI validation and generated views
```

These parts cooperate, but their responsibilities are different.

### 1. Core rules — the constitution

Files such as:

```text
rules/core.md
conventions.md
risk-and-gates.md
project-layout.md
```

define rules that every project and workflow must respect.

Examples:

- requirements precede implementation mechanisms;
- generated files are never canonical;
- implementation cannot invent unapproved behavior;
- every important source file needs ownership;
- PASS requires fresh evidence;
- high-risk changes require stronger gates;
- unknown information must remain explicit.

For TaskFlow, a core rule would prevent an implementer from silently adding an administrator role because it seemed useful.

Core rules answer:

> What must always remain true about the delivery process?

---

### 2. Flow router — the dispatcher

The router examines the request and project state.

```text
User request
  → classify intent
  → assess risk
  → choose workflow
  → identify required gates
  → select the next skill
```

Examples:

| Request | Routed workflow |
|---|---|
| Build TaskFlow | Initial Build |
| Add recurring tasks | Change |
| Fix incorrect due-date display | Bug Fix |
| Improve button spacing | Polish |
| Restructure task service without changing behavior | Refactor |
| Document an existing undocumented TaskFlow | Reverse Engineer |

Routing prevents every request from receiving the same heavyweight or dangerously lightweight process.

---

### 3. Workflows — the complete journey

A workflow describes the end-to-end lifecycle for one kind of intent.

The engine contains workflows for:

- Initial Build;
- Change;
- Bug Fix;
- Polish;
- Refactor;
- Reverse Engineer;
- Reconcile Drift;
- Release.

For TaskFlow Initial Build, the workflow says:

```text
discover product
  → capture business and requirements
  → model domain
  → establish system direction
  → select one slice
  → design the slice
  → prepare tasks and context
  → implement
  → verify
  → reconcile
  → repeat
```

A workflow answers:

> What lifecycle should this request pass through from beginning to end?

---

### 4. Skills — bounded activities

A skill performs one specific activity inside a workflow.

Examples:

| Skill | Responsibility |
|---|---|
| `route-work` | Select intent, risk, workflow, and gates |
| `capture-requirements` | Define outcomes, requirements, and acceptance criteria |
| `model-domain-workflow` | Define concepts, invariants, states, and workflows |
| `design-solution` | Design architecture, contracts, data, components, and tests |
| `plan-execution` | Create bounded executable tasks |
| `build-context` | Generate an exact task Context Pack |
| `implement-task` | Implement one approved task |
| `verify-change` | Assess the result using evidence |
| `reconcile-knowledge` | Apply the verified after-state to Main |

The distinction is:

```text
Workflow = the whole journey
Skill    = one bounded activity in that journey
```

The same skill can be reused in multiple workflows. For example, both Change and Bug Fix may use `analyze-impact`, `verify-change`, and `reconcile-knowledge`.

---

### 5. Adapters — technology-specific vocabulary

The core engine is technology-neutral. Adapters add relevant guidance for a particular kind of system.

For TaskFlow, we might select:

```text
web-api
web-ui
```

The Web API adapter tells us to consider:

- routes and handlers;
- request and response contracts;
- authorization;
- validation;
- services and repositories;
- migration and integration behavior.

The Web UI adapter tells us to consider:

- pages and routes;
- forms and view models;
- loading, empty, error, and success states;
- accessibility;
- responsive behavior;
- API isolation.

But adapters do not decide that TaskFlow must use React, REST, JWT, or PostgreSQL.

Those remain TaskFlow project decisions.

An adapter answers:

> For this technology category, what concerns and vocabulary should we remember?

---

### 6. Templates and schemas — artifact shapes

Templates provide human-readable starting structures.

For example:

```text
templates/change-template.md
templates/requirements-template.md
templates/code-map-template.md
templates/execution-plan-template.md
templates/verification-template.md
```

A template may say that a Change Blueprint needs:

- outcome;
- non-goals;
- acceptance;
- risk;
- affected layers;
- proposed after-state;
- approvals.

But the template does not invent TaskFlow’s actual requirements.

Schemas formally describe normalized structures and required fields.

For example, an execution task requires:

```text
ID
goal
preconditions
inputs
allowed paths
forbidden inventions
steps
outputs
checks
done conditions
recovery
handoff
```

The distinction is:

```text
Template = authoring shape for people and agents
Schema   = formal structural contract for tooling
```

---

### 7. CLI — deterministic machinery

The CLI has three main commands.

#### `validate`

Checks deterministic structural rules such as:

- unique IDs;
- required metadata;
- legal statuses;
- resolvable references;
- valid local links;
- source-file code-map coverage;
- valid Context Manifest references.

#### `index`

Produces disposable generated views such as:

- artifact catalog;
- status summary;
- changes summary;
- traceability index;
- project hash.

#### `context`

Uses a Context Manifest to generate a bounded Context Pack containing exact records and documents.

It fails when required information cannot be resolved or exceeds the declared budget.

The CLI does not truthfully automate everything. It cannot independently decide:

- whether a requirement is good;
- whether architecture is appropriate;
- whether an approval is legitimate;
- whether evidence is semantically sufficient;
- whether reconciliation should be accepted.

Those remain controlled workflow and review activities.

## Putting the parts together for TaskFlow

```text
“Build TaskFlow”
        │
        ▼
Router selects Initial Build
        │
        ▼
Workflow establishes the lifecycle
        │
        ▼
Skills capture and transform knowledge
        │
        ├── Web UI/API adapters add relevant guidance
        │
        ├── Templates shape TaskFlow artifacts
        │
        └── Core rules constrain every decision
        ▼
CLI validates, indexes, and builds task context
        │
        ▼
Implementer writes TaskFlow code
        │
        ▼
Verification and reconciliation complete the workflow
```

The shortest memory aid is:

> Rules constrain, the router selects, workflows orchestrate, skills act, adapters specialize, templates shape, schemas formalize, and the CLI checks/builds deterministic views.

The next lesson will use these parts concretely to route the request: **“Build a task-management application.”**


## Lesson 5 — Route the TaskFlow request

Our starting request is:

> Build a task-management application for teams.

The router answers two separate questions:

```text
Intent → Which workflow?
Risk   → Which gates and reviews?
```

Risk normally changes the strictness of the workflow, not the product intent.

### Step 1: Check the project state

The router first looks for:

```text
system-map.md
profile.md
active changes
existing source code
```

For our example:

```text
Existing TaskFlow blueprint: No
Existing TaskFlow source: No
Active change: No
Project state: Greenfield
```

Because neither trusted knowledge nor existing code exists, this is not Change or Reverse Engineer.

### Step 2: Classify the intent

The request creates a completely new product.

```text
Intent: New product/system
Workflow: Initial Build
```

If TaskFlow already existed and we asked for recurring tasks, the intent would instead be:

```text
Intent: New behavior
Workflow: Change
```

### Step 3: Assess risk dimensions

Assume TaskFlow is a real multi-user application with accounts, workspaces, permissions, and persistent task data.

| Risk dimension | Assessment | Reason |
|---|---|---|
| Business behavior | Medium | Entirely new user-visible behavior |
| Security/privacy | High | Authentication and workspace authorization |
| Data | Medium | Persistent task and membership records |
| Public contracts | Medium | New Web/API contracts |
| External side effects | Low | No payments or third-party actions yet |
| Operations | Medium | Availability, backups, and recovery matter |
| Reversibility | Medium | Code is reversible; user data may not be |
| Uncertainty | Medium | Several product decisions remain unknown |

The engine uses the highest meaningful trigger rather than averaging the risks.

Therefore:

```text
Overall risk: High
Primary trigger: Authorization
```

This does not mean TaskFlow is inherently dangerous. It means permission mistakes can expose or modify another workspace’s data, so the relevant design and verification require stronger review.

If we were building only a local prototype with dummy users and no authentication, its initial risk could be Medium.

### Step 4: Select the project profile direction

For our learning example, a reasonable starting profile is:

```yaml
project_name: TaskFlow
project_kind: mixed
artifact_profile: compact
adapters: [web-api, web-ui]
```

Why:

- `mixed`: browser UI plus API;
- `compact`: small learning application, initially one catalog per area;
- `web-api`: API contracts, authorization, validation, services, repositories;
- `web-ui`: pages, forms, states, accessibility, and API isolation.

If TaskFlow grows, we can split the Compact profile into Modular documents for Identity, Workspaces, and Tasks.

The profile will eventually also declare:

- source roots;
- source extensions;
- build and test commands;
- generated paths;
- exclusions;
- context budget;
- environments.

Those details are discovered next; routing does not invent them.

### Step 5: Select the required gates

Because authorization makes the relevant work High risk, the route requires:

1. **Business and scope gate**

   The product owner approves actors, scope, and intended behavior.

2. **Architecture/security/data gate**

   A relevant independent reviewer examines workspace isolation, authorization, and data design.

3. **Execution-ready gate**

   Every task has approved inputs, allowed paths, checks, and a fresh Context Pack.

4. **Implementation gate**

   Implementation is explicitly authorized.

5. **Verification gate**

   A verifier independent from the implementer checks the high-risk authorization behavior.

6. **Reconciliation gate**

   The canonical update is previewed and explicitly approved.

7. **Release gate**

   If deployed, rollout, observation, and rollback are required.

These gates become lighter for slices with no security or data impact. Risk should be reassessed per slice.

### Step 6: Name the next action

The router does not write TaskFlow requirements or choose its database.

Its output ends with:

```text
Intent: new product
Risk: high
Workflow: Initial Build
Profile direction: compact mixed web application
Adapters: web-api, web-ui
Next action: create the project profile
Next skill after discovery: capture-requirements
```

A compact routing decision might look like:

```yaml
request: Build TaskFlow
project_state: greenfield
intent: new-product
risk: high
risk_triggers: [authorization, persistent-user-data]
workflow: initial-build
artifact_profile: compact
adapters: [web-api, web-ui]
next_activity: discover-and-create-profile
next_skill: capture-requirements
```

The key lesson is:

> Routing decides how we will approach the work. It does not yet decide what TaskFlow must do or how it will be implemented.

Next, we will capture TaskFlow’s business intent and requirements—but still avoid architecture and code design.


## Lesson 6 — Capture business intent and requirements

The `capture-requirements` skill turns:

> “Build a task-management application”

into precise, traceable product meaning.

It must not choose architecture or invent stakeholder decisions.

The progression is:

```text
Problem
  → Outcome
  → Capability
  → Functional requirement
  → Acceptance criteria
  → Non-functional requirement
```

### 1. Start with the problem

A possible TaskFlow problem statement:

> Small teams lose clarity about who owns work, its current state, and what changed. TaskFlow provides a shared place to organize and track that work.

Notice that we have not mentioned React, APIs, tables, or databases.

We should also record the source:

```text
Source: User’s task-management application request
Status: Draft until confirmed
```

### 2. Define business outcomes

An outcome describes the result we want, not a feature.

```md
### OUT-TASKFLOW-001 · Improve team work visibility

- Kind: business-outcome
- Knowledge status: draft
- Implementation status: not-planned
- Owner: product-owner
```

Possible success meaning:

- members can identify their assigned work;
- teams can see task progress;
- ownership and status are clear;
- important changes are traceable.

A more mature project would add measurable product indicators, such as reduced overdue work or faster assignment acknowledgement. We should not invent those targets without stakeholder input.

### 3. Divide the product into capabilities

Capabilities are large abilities that realize the outcome.

Possible TaskFlow capabilities:

```text
CAP-IDENTITY-001     Member identity and access
CAP-WORKSPACE-001    Workspace and membership management
CAP-TASKS-001        Task creation and assignment
CAP-BOARD-001        Task status visualization
CAP-ACTIVITY-001     Important task activity history
```

Traceability begins here:

```text
OUT-TASKFLOW-001
  ├─ CAP-IDENTITY-001
  ├─ CAP-WORKSPACE-001
  ├─ CAP-TASKS-001
  ├─ CAP-BOARD-001
  └─ CAP-ACTIVITY-001
```

These are still candidate capabilities until approved.

### 4. Define scope and non-scope

For a first TaskFlow milestone, a draft scope might be:

**In scope**

- member access;
- workspace membership;
- create and assign tasks;
- change task status;
- board view;
- basic activity history.

**Out of scope**

- billing;
- time tracking;
- recurring tasks;
- external integrations;
- advanced analytics;
- custom workflow builders.

Explicit non-scope is important because it prevents implementation from “helpfully” building an unapproved product.

### 5. Write observable functional requirements

Consider Create Task:

```md
### REQ-TASKS-001 · Create a task

- Kind: requirement
- Knowledge status: draft
- Implementation status: not-planned
- Owner: product-owner
- Satisfies: CAP-TASKS-001
- Source: initial TaskFlow product request
- Priority: must
```

Requirement statement:

> An authorized workspace member can create a task inside that workspace with the required task information.

This says what the user can accomplish without defining:

- an HTTP endpoint;
- a database table;
- a React component;
- a service class.

Those belong to later design layers.

### 6. Add acceptance criteria

Acceptance criteria make the requirement observable and testable.

For example:

```text
Given a member belongs to a workspace
When the member supplies valid required task information
Then a new task is created inside that workspace
And the task is visible to permitted workspace members
```

Failure and edge cases must also be considered:

```text
A non-member cannot create a task in the workspace.

Invalid required information does not create a partial task.

An assignee, when supplied, must be eligible for that workspace.

Creation failure produces an understandable result.
```

We should not yet invent exact title limits, due-date rules, or assignment permissions. Those become explicit questions:

```text
Q1: Is a title the only required field?
Q2: Can every member create tasks?
Q3: Can a member assign a task to anyone or only themselves?
Q4: Are unassigned tasks permitted?
Q5: Can due dates be in the past?
```

The skill preserves these as unknowns instead of guessing them into approved requirements.

### 7. Add non-functional requirements

Functional requirements describe behavior. NFRs describe qualities and constraints.

TaskFlow will likely need NFRs for:

- workspace isolation and authorization;
- response time and capacity;
- accessibility;
- availability;
- observability;
- backup and recovery;
- maintainability.

A weak NFR is:

```text
TaskFlow should be fast.
```

A measurable NFR would be:

```text
Under the agreed reference workload, 95% of board reads
complete within the approved response-time target.
```

But the actual workload and target must be confirmed. Until then, they remain an explicit specification gap.

For authorization, we can state something more concrete:

```md
### NFR-SEC-001 · Isolate workspace data

Every protected operation must prevent a member from reading
or changing data belonging to a workspace they cannot access.
```

Later, design and tests will show how this is enforced and verified.

### 8. Keep knowledge and implementation statuses separate

Initially:

```text
Knowledge status: draft
Implementation status: not-planned
```

After stakeholder approval:

```text
Knowledge status: approved
Implementation status: planned
```

After code exists:

```text
Knowledge status: approved
Implementation status: implemented
```

After fresh evidence proves it:

```text
Knowledge status: approved
Implementation status: verified
```

Approval of a requirement does not mean the feature has been built.

## Output of this lesson

The requirements stage should leave us with:

- problem and opportunity;
- actors and stakeholders;
- outcomes and success meaning;
- capabilities;
- scope and non-scope;
- functional requirements;
- acceptance and failure criteria;
- NFRs;
- priorities, sources, owners, and unknowns;
- a gate for material unanswered product decisions.

It deliberately does **not** produce endpoints, schemas, components, or source files.

Next, we will transform these requirements into TaskFlow’s domain concepts, invariants, states, and workflows.



