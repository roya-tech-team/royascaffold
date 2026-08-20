---
schema: royascaff/task/v1
id: TASK-POLLS-EDIT-01
change: CHG-20260820-040000
title: Finalize the poll-edit contract and execution design
state: ready
skill: design-contracts
required:
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
optional:
  - ADR-LAYERED
  - DATA-POLLS
  - DATA-POLL-OPTIONS
code:
  - ../apps/api/src/modules/polls/polls.routes.js
  - ../apps/api/src/modules/polls/polls.controller.js
  - ../apps/api/src/modules/polls/polls.service.js
  - ../apps/api/src/modules/polls/polls.repository.js
  - ../apps/web/src/pages/PollDetailPage.jsx
commands:
  - node ../engine-1.3-sdlc-concept2/bin/royascaff13.js validate project .
  - npm --prefix ../apps/web run build
constraints:
  - Do not edit canonical knowledge during task implementation.
  - Reject editing once any vote exists, including concurrent first votes.
  - Reuse creation bounds unless the approved change explicitly replaces them.
outputs:
  - Approved EditPollDto and HTTP endpoint delta
  - Service and repository interface delta
  - Executable implementation task split
max_tokens: 24000
max_files: 24
---

# Task: Finalize the poll-edit contract and execution design

Compile this task before work. Record proposed after-state canonical documents under the change's `delta/` directory, implementation notes under `execution/`, and evidence under `verification/`.
