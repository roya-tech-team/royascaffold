---
document_id: DOC-ENG-REQUIREMENTS
title: Functional requirements
layer: requirements
schema_version: 2
document_status: approved
owners: [roya-team]
---

# Functional requirements

> **What:** what each feature must do, and how we know it works
> **Read when:** designing, building or checking a slice

<!-- royascaff:summary:start -->
| ID | Title | Kind | State | Feature | Verified by |
|---|---|---|---|---|---|
| REQ-ENG-001 | The engine warns when it runs on the repository it changes | requirement | 📝 Outlined | CAP-ENG-001 | TEST-ENG-001 |
| REQ-ENG-002 | Work on the engine runs a pinned copy, never the working copy | requirement | 📝 Outlined | CAP-ENG-001 | TEST-ENG-002 |
<!-- royascaff:summary:end -->

Add requirements with `royascaff new record requirement "<observable behavior>" --feature CAP-…`. Describe what and why, never how.

### REQ-ENG-001 · The engine warns when it runs on the repository it changes

- **Priority:** should
- **Owner:** roya-team
- **Feature:** CAP-ENG-001
- **Verified by:** TEST-ENG-001

A person or an AI who runs the engine on the repository that holds the engine's own code is told, so the engine that
judges a change is not the engine the change is editing.

**Acceptance**
- [unit] The engine's folder inside the repository it works on is reported; a pinned copy in node_modules and a folder elsewhere are not.
- [e2e] The command line adds one warning to the JSON envelope and one line on stderr when run from the working copy, and none when run from the pinned copy.
- [unit] ROYASCAFF_NO_GUARD=1 switches the warning off.

### REQ-ENG-002 · Work on the engine runs a pinned copy, never the working copy

- **Priority:** should
- **Owner:** roya-team
- **Feature:** CAP-ENG-001
- **Verified by:** TEST-ENG-002

Work on this repository runs a pinned copy of the engine: the npm alias, an environment folder or a snapshot of a
committed state. It never falls back to the working copy.

**Acceptance**
- [e2e] The pinned tool script runs the pinned copy and passes its exit status on; with no pinned copy it stops and says how to make one.
- [e2e] A snapshot is a copy of a committed state: editing the working copy afterwards does not change it.

## Record format (example)

```md
### REQ-ENG-001 · Client sees reach per campaign

- **Priority:** must
- **Owner:** roya-team
- **Feature:** CAP-ENG-001
- **Verified by:** TEST-ENG-001

A signed-in client opens Results and sees each campaign with its reach.

**Acceptance**
- [unit] Campaigns are listed newest first, with reach as a whole number.
- [e2e] A campaign without data shows "No data yet", not zero.
- [manual] The list reads well on a 375 px phone.
```
