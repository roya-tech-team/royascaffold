# Plan · CHG-ENG-001

> Tasks are written in stage 3 (Plan) with `royascaff new task CHG-ENG-001 "<title>"`.
> Each task needs Goal, Inputs, Allowed paths, Checks and Done when.
> Progress is never written here: use `royascaff task <TASK> start | done | block`.

### TASK-ENG-001 · Add the guard and its tests

- **Goal:** the engine warns when it runs on the repository it changes
- **Inputs:** REQ-ENG-001, CMP-ENG-001, CMP-ENG-002, CMP-ENG-004
- **Allowed paths:** engine/lib/guard*, engine/bin/**, engine/tests/e43*
- **Checks:** test
- **Done when:** the guard tests pass and the command line warns from the working copy only

### TASK-ENG-002 · Release 1.5.0 and write down the acceptance

- **Goal:** the package is 1.5.0, its tests accept a stable version, and the progress log records the gate
- **Inputs:** REQ-ENG-002, CMP-ENG-004
- **Allowed paths:** engine/package*, engine/tests/contract-package*, engine/README*, engine/docs/**, engine/skill/**, docs/**
- **Checks:** test
- **Done when:** version 1.5.0, the full suite passes and the acceptance table is recorded
- **Depends on:** TASK-ENG-001
