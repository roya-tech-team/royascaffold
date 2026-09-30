---
schema: royascaff/change/v1
id: CHG-20260820-040000
title: Allow an owner to edit an open poll
type: feature
state: planned
owner: pollpulse-team
base_revision: v1.3-concept2-demo-initial
risk: medium
affects:
  - REQ-SCOPE
  - DOM-POLL
  - ARCH-API-LAYERS
  - CTR-HTTP-API
  - CTR-CREATE-POLL
  - IFACE-POLLS-SERVICE
  - IFACE-POLLS-REPOSITORY
  - WF-CREATE-POLL
  - CMP-POLLS-CONTROLLER
  - CMP-POLLS-SERVICE
  - CMP-POLLS-REPOSITORY
  - CMP-WEB-POLLS
  - TEST-POLLS
new_artifacts:
  - REQ-POLL-EDIT
  - WF-EDIT-POLL
  - CTR-EDIT-POLL
exclusive_artifacts:
  - DOM-POLL
  - IFACE-POLLS-SERVICE
  - CTR-HTTP-API
exclusive_paths:
  - ../apps/api/src/modules/polls/polls.service.js
  - ../apps/api/src/modules/polls/polls.repository.js
approvals:
  - role: product-owner
    outcome: approved
    at: 2026-08-20T04:03:00+03:00
    subject_revision: v1.3-concept2-demo-initial
  - role: technical-owner
    outcome: approved
    at: 2026-08-20T04:04:00+03:00
    subject_revision: v1.3-concept2-demo-initial
history:
  - state: draft
    at: 2026-08-20T04:00:00+03:00
  - state: analyzed
    at: 2026-08-20T04:01:00+03:00
  - state: approved
    at: 2026-08-20T04:03:00+03:00
  - state: planned
    at: 2026-08-20T04:05:00+03:00
updated_at: 2026-08-20T04:05:00+03:00
---

# Change: Allow an owner to edit an open poll

## Intent

Demonstrate a v1.3 change overlay without pretending proposed behavior is already canonical. A poll creator should be able to change title, description, and option labels only while the poll is open and has no votes.

## Decisions required before implementation

- Confirm that option identity can remain stable when labels change.
- Confirm whether option add/remove is allowed or label edits only.
- Define conflict behavior if the first vote arrives during editing.

## Impact summary

The proposal crosses requirement, aggregate invariant, workflow, HTTP DTO/endpoint, service and repository interfaces, web interaction, verification intent, and code ownership. It does not require a new application boundary or database column if editing only changes existing fields.

## Acceptance draft

- Only the authenticated creator may edit.
- Closed polls and polls with votes reject edits.
- The request preserves the same creation bounds.
- Repository update is atomic and detects a concurrent first vote.
- Canonical documents remain untouched until verification and reconciliation.
