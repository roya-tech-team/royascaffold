# Adapter · generic

> **What:** technology-neutral guidance for any app (CLI, library, worker, data job, embedded…)
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- Name the entry points (commands, jobs, public functions), the inputs and outputs, and what can fail.
- Put each responsibility in one component with `Code:` globs; external calls sit behind one component.
- Write the public interface as a contract (`CTR-`) when another team, tool or file format depends on it.
- Record material choices as decisions (`ADR-`): options, choice, why.

## Rules

- Business rules live in one place, not in entry points or glue code.
- Invariants have an enforcing component and a test.
- Side effects (files, network, time, randomness) are isolated so they can be tested.
- Configuration and secrets come from the environment, never from code constants.
- Unknown or inferred facts are marked as such in the knowledge, never presented as confirmed.

## Check

- The runner commands pass (build, typecheck, lint, test).
- Each requirement has a test (`Check: runner:test`) or a person's recorded check.
- Checks the project cannot run automatically are recorded as manual evidence with who checked what; they are never marked as passed without that.

## Words

component, repository, schema, json, sql, config
