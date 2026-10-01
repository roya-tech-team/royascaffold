---
change_id: CHG-ENG-001
kind: polish
affects: [REQ-ENG-001]
status: ready
risk: low
owners: [roya-team]
---

# CHG-ENG-001 · Warn when the engine runs on the repository it changes

> **What:** a polish change affecting REQ-ENG-001
> **Status:** changes only through `royascaff advance`. See `royascaff show CHG-ENG-001`

## Outcome

A person or an AI who runs the engine on the repository that holds the engine's own code is told so, in the JSON
warnings and on stderr. This change is the engine's first real change made through the engine itself: it is opened,
planned, verified and closed in this project with a pinned copy of the engine.

## Impact

| Layer | State | Affected IDs / pages | Reason |
|---|---|---|---|
| Business | not-applicable | | no business rule changes |
| Requirements | referenced | REQ-ENG-001, REQ-ENG-002 | the requirement this change satisfies |
| Domain | not-applicable | | |
| Architecture | unchanged | | the dependency rules still hold |
| Data | not-applicable | | |
| Contracts | unchanged | | only the optional `warnings` list is used |
| Experience | not-applicable | | |
| Security | not-applicable | | |
| Components & tests | referenced | CMP-ENG-001, CMP-ENG-002, CMP-ENG-004 | new library file, a call in the entry, new tests |
| Quality & operations | unchanged | | |

State: changed · referenced · unchanged · not-applicable. **changed** and **referenced** name the IDs or pages (their records reach every task's context); a **changed** layer's page is updated before Record.

## After-state

A new library file `engine/lib/guard.cjs` answers one question: is the running engine's folder inside the repository
it works on, outside `node_modules`? The command line entry (CMP-ENG-002) asks it once per call and, when the answer
is yes, adds one sentence to the envelope's `warnings` (and one line on stderr without `--json`). A pinned copy in
`node_modules` and a folder elsewhere never warn; `ROYASCAFF_NO_GUARD=1` switches it off. This follows ADR-ENG-001.
The tests (CMP-ENG-004) cover the question, the sentence and the real command line from a working copy and a pinned copy.
The release gets version 1.5.0 in the second task.
