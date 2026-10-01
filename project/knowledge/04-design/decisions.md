---
document_id: DOC-ENG-DECISIONS
title: Decisions
layer: design
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Decisions

> **What:** material technical choices (ADR-): the options, the choice, and why
> **Read when:** before choosing a pattern, library, data shape or UI approach

Add one with `royascaff new record decision "<the choice>"`. Check here before choosing something new: reuse beats reinvention.

### ADR-ENG-001 · Develop the engine with itself, with a pinned copy

- **Owner:** roya-team
- **Supports:** REQ-ENG-001, REQ-ENG-002

**Options:** keep a folder copy of the engine per beta · run the working copy on itself · run a pinned copy of the engine on the repository that holds the engine.
**Choice:** one engine folder in git, and a pinned copy (the royascaff-tool alias, or a snapshot of a committed state) runs the work.
**Why:** the engine that judges a change must not change under it, and the owner wants to see that the engine works on a real product, itself.
**Consequences:** `scripts/tool.cjs` makes and runs the pinned copy; the engine warns when it runs on its own repository; evidence stays true only while the code it covered is unchanged.

### ADR-ENG-002 · Source of truth is the engine's files in the customer's git repo

- **Owner:** roya-team
- **Supports:**
- **Source file:** plans/v1.5-v2.0/README.md
- **Quote:** The engine's files in the customer's git repo.

**Options:** a database owned by Studio · the engine's files in the customer's git repo.
**Choice:** the engine's files in the customer's git repo; Studio's database is a rebuildable index (decision D2 of the plan).
**Why:** git stays the truth, so anything Studio shows can be rebuilt from the repo.
**Consequences:** `export --json` and `events` give a full rebuild; evidence and approvals are files too.

### ADR-ENG-003 · Engine and Studio meet only at a versioned contract

- **Owner:** roya-team
- **Supports:**
- **Source file:** plans/v1.5-v2.0/README.md
- **Quote:** A versioned CLI/MCP contract only.

**Options:** Studio imports engine code · Studio calls the engine through a versioned contract.
**Choice:** a versioned CLI/MCP contract only (decision D6 of the plan).
**Why:** each side changes on its own schedule; Studio runs the contract tests of every engine version it supports.
**Consequences:** every command keeps a JSON envelope, a schema and a golden file; adding fields is minor, removing is major.

## Record format (example)

```md
### ADR-ENG-001 · Use server-rendered pages for client results

- **Owner:** roya-team
- **Supports:** REQ-ENG-001

**Options:** single-page app · server-rendered pages · static export.
**Choice:** server-rendered pages.
**Why:** results must be fresh and indexable, and the team already runs the server.
**Consequences:** interactive charts need a small client script.
```
