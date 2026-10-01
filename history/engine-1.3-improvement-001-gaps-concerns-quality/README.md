# RoyaScaff Engine 1.3.1 — Quality-by-Design Layered SDLC

This folder is a standalone v1.3.1 engine. It preserves the v1.3 Main/Change/Context/
Implement/Verify/Reconcile architecture and adds a nested quality-by-design subflow so
a lower-capability model receives more complete product, reference, solution, and
quality decisions before code.

## What is implemented

- layered SDLC project contract;
- Main, Slice, and Change Blueprint rules;
- two-dimensional knowledge/implementation status;
- intent × risk routing and adaptive gates;
- greenfield, change, bug, polish, refactor, reverse-engineer, reconcile, and release workflows;
- atomic skill contracts;
- generic, web API, and web UI adapters;
- templates for every required/conditional artifact;
- normalized JSON schemas;
- dependency-free Node CLI for project validation, generated indexes, and Context Packs.
- decision-oriented discovery and owner-calibrated Quality Design Contracts;
- durable visual/non-visual Reference Decision Records;
- explicit solution pattern decisions and adapter provenance;
- Solution Quality Review and Implementation Readiness Review before `ready`;
- foundation-first task compilation and judgment-aware right-sizing;
- source-bound evidence, freshness detection, and routed adjudicator authority;
- legacy-compatible, transition, and strict v1.3.1 adoption modes.

## Start here

1. Read [flow.md](flow.md).
2. Read [project-layout.md](project-layout.md) and [conventions.md](conventions.md).
3. Select a workflow under `workflows/`.
4. Use templates to create the project blueprint.
5. Validate and generate views:

```bash
node engine-1.3-improvement-001-gaps-concerns-quality/bin/sdlc.js validate <project-root>
node engine-1.3-improvement-001-gaps-concerns-quality/bin/sdlc.js index <project-root>
node engine-1.3-improvement-001-gaps-concerns-quality/bin/sdlc.js context <project-root> <manifest.md> [output.md]
```

The CLI uses only Node built-ins. Run its contract/behavior suite with:

```bash
node --test tests/sdlc.test.js
```

## Which workflow and skill should I use?

Use **one workflow for the request** and **one or more atomic skills to execute that workflow**.

- A **workflow** is the end-to-end lifecycle for an intent, such as building a new app, adding a feature, fixing a defect, or releasing.
- A **skill** performs one bounded reasoning or delivery activity, such as capturing requirements, analyzing impact, implementing one task, or verifying a change.
- An **adapter** adds technology-specific guidance without changing the generic workflow.
- A **template** defines the expected shape of an artifact.

Start normal work with [`route-work`](skills/route-work/SKILL.md). It classifies the intent and risk, selects the workflow, identifies the required layers and gates, and names the next skill. Do not start with `implement-task` unless an approved execution task and a fresh Context Pack already exist.

### Intent routing

| I want to... | Use this workflow | First activity after routing |
|--------------|-------------------|------------------------------|
| Build a new application | [Initial Build](workflows/01-initial-build.md) | Create the project profile, then use [`capture-requirements`](skills/capture-requirements/SKILL.md) |
| Add or change behavior, data, a contract, architecture, or a dependency | [Change](workflows/02-change.md) | [`analyze-impact`](skills/analyze-impact/SKILL.md) |
| Correct a defect without changing approved behavior | [Bug Fix](workflows/03-bug-fix.md) | Establish the root cause and use [`analyze-impact`](skills/analyze-impact/SKILL.md) |
| Change copy or presentation | [Polish](workflows/04-polish.md) | Classify it as Micro, Interface, or System polish |
| Improve internal structure without changing behavior | [Refactor](workflows/05-refactor.md) | Capture unchanged requirements and characterization evidence |
| Document an existing application | [Reverse Engineer](workflows/06-reverse-engineer.md) | [`inventory-code`](skills/inventory-code/SKILL.md) |
| Resolve disagreement between code and canonical knowledge | [Reconcile Drift](workflows/07-reconcile.md) | Detect and classify the drift before choosing an after-state |
| Deploy a verified and reconciled change | [Release](workflows/08-release.md) | Check release, operations, evidence, and rollback readiness |

If routing discovers broader scope, move to the safer workflow. For example, a bug that changes intended behavior or a polish task that changes authorization must use the normal Change workflow.

### New application skill sequence

For a completely new application, use the [Initial Build workflow](workflows/01-initial-build.md) and normally apply these skills:

```text
route-work
  → capture-requirements
  → analyze-reference              when a source influences the outcome
  → model-domain-workflow
  → design-solution
  → review-solution-quality        when routed
  → plan-execution for the next vertical slice
  → build-context for the next task
  → review-implementation-readiness when routed
  → implement-task
  → verify-change
  → reconcile-knowledge
  → repeat the slice delivery steps
```

Create the Main Blueprint far enough to understand the product, boundaries, important workflows, architecture direction, quality needs, and roadmap. Then design and implement one dependency-ready vertical slice at a time. Do not generate or load the entire application into one implementation context.

### New change skill sequence

For a feature or other material change, use the [Change workflow](workflows/02-change.md):

```text
route-work
  → analyze-impact
  → capture-requirements          when business behavior changes
  → analyze-reference             when a visual/behavior/data source influences the outcome
  → model-domain-workflow         when concepts, rules, states, or flows change
  → design-solution               when architecture, data, contracts, UI, security, or operations change
  → review-solution-quality       for standard/rigorous or routed work
  → plan-execution
  → build-context
  → review-implementation-readiness before ready when routed
  → implement-task                once per bounded task
  → verify-change
  → reconcile-knowledge
  → release                       when deployment is requested
```

The middle skills are conditional, but impact analysis, an executable task, bounded context, verification, and reconciliation are not silently skipped. Record an unaffected layer as `unchanged` or `not-applicable` with a reason instead of creating unnecessary documents.

### Should I use one skill or many?

Use one skill when you are performing only that bounded activity—for example, inventorying a module, analyzing impact, or rebuilding a Context Pack. Use multiple skills for an end-to-end delivery outcome.

Even a small code change normally needs a compact chain:

```text
route-work → analyze-impact → plan-execution → build-context
           → implement-task → verify-change → reconcile-knowledge
```

Requirements, domain modeling, and solution design may be omitted only when impact analysis confirms that their approved meaning remains unchanged. High-risk work may add reviews and evidence; it does not remove stages. Each `implement-task` receives only its task-specific Context Pack, which allows another session or a smaller model to continue without relying on a large conversation window.

## First-pass quality model

```text
discover + interpret + design + pre-code reviews + compiled context
  → target B+/A first implementation
  → fresh verification and bounded repair
  → target A/A+ final result
```

The targets belong to the project QDC; they are not engine-awarded grades. The engine
prevents missing/contradictory material decisions from being disguised as readiness,
but semantic reviewers still judge whether the proposed design is coherent and good.

## Adoption modes

- **legacy-compatible:** existing v1.3 projects remain readable; 1.3.1 enrichment is
  warning-driven.
- **transition:** new changes use quality-by-design contracts while Main is enriched as
  touched.
- **strict:** triggered decisions, adapters, reviews, task traces, contexts, and evidence
  are enforced as blockers.

Set `adoption_mode` in `profile.md`. A Change may repeat it for an explicit migration
boundary. See [migration-1.3-to-1.3.1.md](migration-1.3-to-1.3.1.md).

## Reading model

```text
L0 system map
  → L1 business, requirements, domain/workflows
    → L2 solution design
      → L3 components, actions, code map, tests
        → L4 quality and operations
```

This is a reading and reasoning order. Delivery remains iterative through vertical change slices.

## Runtime boundary

The CLI currently enforces the minimum deterministic core:

- unique document/artifact/change IDs;
- required record metadata and legal statuses;
- resolvable artifact references;
- valid local Markdown links;
- Context Manifest references;
- source-file coverage from the code map;
- generated artifact/status/change views;
- exact-section Context Pack generation with an explicit budget.
- adoption/gate/material-decision states;
- adapter presence, prerequisites, and declared incompatibilities;
- QDC/reference/pattern/task/context traceability;
- material RDR/pattern completeness and foundation-first task dependencies;
- SQR/IRR dispositions, authority class, input IDs, and optional fingerprints;
- PASS evidence fields and file-source freshness fingerprints;
- generated adapter, quality-contract, readiness, and evidence-freshness views.

The CLI reports **contract validation**, not product quality. It cannot decide whether a
visual hierarchy, architecture, or user experience is good. Workflow approvals,
semantic SQR/IRR judgment, evidence observation, and reconciliation decisions remain
controlled procedures. Optional adapters/runners can specialize checks without putting
WebGL, React, HTTP, or another technology into core.

## Version documents

- [Quality-by-design operating contract](quality-by-design.md)
- [Adapter composition](adapters/README.md)
- [Validation diagnostics](validation.md)
- [1.3 to 1.3.1 migration](migration-1.3-to-1.3.1.md)
- [1.3.1 release notes](release-notes-1.3.1.md)
