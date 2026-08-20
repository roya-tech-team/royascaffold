---
schema: royascaff/context-manifest/v1
id: CTX-TASK-POLLS-EDIT-01
task: TASK-POLLS-EDIT-01
workflow: change-feature
skill: design-contracts
source_revision: v1.3-concept2-demo-initial
canonical_source_hash: f4ee179881cd7f6f4edc8b7312f1c0c093a3c53823bb43b66eacf11ae1394ba9
source_hash: 90331d9a16ae8129ced38317ccc2b442c3e8f98f8fe6dadd6798a64016e7d23d
required:
  - id: REQ-SCOPE
    reason: direct task requirement
  - id: DOM-POLL
    reason: direct task requirement
  - id: ARCH-API-LAYERS
    reason: direct task requirement
  - id: CTR-HTTP-API
    reason: direct task requirement
  - id: CTR-CREATE-POLL
    reason: direct task requirement
  - id: IFACE-POLLS-SERVICE
    reason: direct task requirement
  - id: IFACE-POLLS-REPOSITORY
    reason: direct task requirement
  - id: WF-CREATE-POLL
    reason: direct task requirement
  - id: CMP-POLLS-CONTROLLER
    reason: direct task requirement
  - id: CMP-POLLS-SERVICE
    reason: direct task requirement
  - id: CMP-POLLS-REPOSITORY
    reason: direct task requirement
  - id: CMP-WEB-POLLS
    reason: direct task requirement
  - id: TEST-POLLS
    reason: direct task requirement
  - id: REQ-POLL-CREATE
    reason: required by DOM-POLL.constrained_by
  - id: REQ-POLL-CLOSE
    reason: required by DOM-POLL.constrained_by
  - id: DATA-POLLS
    reason: required by DOM-POLL.maps_to
  - id: CTR-POLL-DETAIL
    reason: required by DOM-POLL.maps_to
  - id: CMP-API-BOOTSTRAP
    reason: required by CTR-HTTP-API.implemented_by
  - id: CMP-AUTH-CONTROLLER
    reason: required by CTR-HTTP-API.implemented_by
  - id: REQ-POLL-BROWSE
    reason: required by IFACE-POLLS-SERVICE.satisfies
  - id: REQ-POLL-VOTE
    reason: required by IFACE-POLLS-SERVICE.satisfies
  - id: ARCH-DATA-ACCESS
    reason: required by CMP-POLLS-REPOSITORY.implements
  - id: ARCH-WEB-LAYERS
    reason: required by CMP-WEB-POLLS.implements
optional:
  - id: ADR-LAYERED
    reason: optional task context
  - id: DATA-POLL-OPTIONS
    reason: optional task context
  - id: CTR-REGISTER
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-LOGIN
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-AUTH-RESPONSE
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-USER
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-VOTE
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-PAGINATED-POLLS
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-ERROR
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: IFACE-VOTES-REPOSITORY
    reason: optional one-hop from IFACE-POLLS-SERVICE.uses
  - id: DATA-VOTES
    reason: optional one-hop from IFACE-POLLS-REPOSITORY.uses
  - id: SEC-JWT
    reason: optional one-hop from CMP-POLLS-CONTROLLER.uses
  - id: CMP-VOTES-REPOSITORY
    reason: optional one-hop from CMP-POLLS-SERVICE.depends_on
  - id: CMP-DATABASE
    reason: optional one-hop from CMP-POLLS-REPOSITORY.depends_on
  - id: CMP-WEB-API
    reason: optional one-hop from CMP-WEB-POLLS.depends_on
  - id: CMP-WEB-POLL-VIEWS
    reason: optional one-hop from CMP-WEB-POLLS.depends_on
omitted_optional: []
sources:
  - id: REQ-SCOPE
    path: requirements/product.md
    hash: 7947929c8b45c7db2b02d867657b9144cdcd0f6acf09969f020abd6052090a60
    required: true
    reason: direct task requirement
  - id: DOM-POLL
    path: domain/model.md
    hash: 1d12f5799ee150fe03a8849ce18fbadf6d36e0f245ea1bea0c9468803d39b09d
    required: true
    reason: direct task requirement
  - id: ARCH-API-LAYERS
    path: architecture/system.md
    hash: 84ed43d17858fc01a06d45a62d3e21bdc10e40d04eecc3de91d38fdfeb344a92
    required: true
    reason: direct task requirement
  - id: CTR-HTTP-API
    path: contracts/http-api.md
    hash: 3d7fb1ac23684473849e5a3fdd29ac3ea1290469ccc51d76cedf6ebb4a7e4c0c
    required: true
    reason: direct task requirement
  - id: CTR-CREATE-POLL
    path: contracts/http-api.md
    hash: 47b6fdecabf86832f93e8d82fa42253f224a5dad308e02a265ff6a1b03713d35
    required: true
    reason: direct task requirement
  - id: IFACE-POLLS-SERVICE
    path: contracts/service-interfaces.md
    hash: 81d06f627ccf63d02aeeeddafc17140c569aab2cbf5c6f13d41d8857c4f8e976
    required: true
    reason: direct task requirement
  - id: IFACE-POLLS-REPOSITORY
    path: contracts/service-interfaces.md
    hash: afcff3b4fab2cf01781b41b2b500bb10a323b5b9cf82746fc2e860d91eabfe86
    required: true
    reason: direct task requirement
  - id: WF-CREATE-POLL
    path: workflows/polls.md
    hash: 888e6532499d877d248cb64f3b66444f70b5c8d0ad361cd3351db0ed7de8ed90
    required: true
    reason: direct task requirement
  - id: CMP-POLLS-CONTROLLER
    path: implementation/components.md
    hash: d269fbbd86de4fa9fd4d6f43313e54fb0bcaf58e82bc4756c221473c0d049c22
    required: true
    reason: direct task requirement
  - id: CMP-POLLS-SERVICE
    path: implementation/components.md
    hash: 8ae940b1fe65afd0fa872e951c73544eb2d6a84b5120ef070f6d0a248a67bbc5
    required: true
    reason: direct task requirement
  - id: CMP-POLLS-REPOSITORY
    path: implementation/components.md
    hash: 53e98c6956181d9a60b354f0715a3e9c7802967e890ed3a24516a08bec834bd8
    required: true
    reason: direct task requirement
  - id: CMP-WEB-POLLS
    path: implementation/components.md
    hash: d242b38a67c347a199776a183340a0d2e5126b5894dc36cf6583c5c98faa98e6
    required: true
    reason: direct task requirement
  - id: TEST-POLLS
    path: implementation/test-intents.md
    hash: b786b4df986e03a18f72bbda7deaea8a2c2be8b40f9a4a92fe01bdcbf0a389ad
    required: true
    reason: direct task requirement
  - id: REQ-POLL-CREATE
    path: requirements/product.md
    hash: 673309d6b47596b7dc9f6497a71274c800a2cd1b203eb558d98a8ce6fa1e242a
    required: true
    reason: required by DOM-POLL.constrained_by
  - id: REQ-POLL-CLOSE
    path: requirements/product.md
    hash: 781a4384bca85a47a233adab8f9a75054e3b45746414eb6f13c6a70ff5a7495b
    required: true
    reason: required by DOM-POLL.constrained_by
  - id: DATA-POLLS
    path: data/sqlite.md
    hash: d59edf16f5e42357a9c93a50661817c89fb4a21107cdc05e5300db2510a9bd80
    required: true
    reason: required by DOM-POLL.maps_to
  - id: CTR-POLL-DETAIL
    path: contracts/http-api.md
    hash: bac3a015db3ba93a9a24677bcbccb2d4437ea1a3c5a000deed1975f1825046df
    required: true
    reason: required by DOM-POLL.maps_to
  - id: CMP-API-BOOTSTRAP
    path: implementation/components.md
    hash: adfcd593e8ab0d43be6b8d7462c67e3edc5abfc6542e9b0745c54b922219bd1c
    required: true
    reason: required by CTR-HTTP-API.implemented_by
  - id: CMP-AUTH-CONTROLLER
    path: implementation/components.md
    hash: 7d4c5636a6fc298445648308dc8ff2660cb13651e7609f5fd0af4d5a82870b66
    required: true
    reason: required by CTR-HTTP-API.implemented_by
  - id: REQ-POLL-BROWSE
    path: requirements/product.md
    hash: d82cba2a58c419fad2aa1f2d03527c34404424de11c6bb74c63176235763ceaf
    required: true
    reason: required by IFACE-POLLS-SERVICE.satisfies
  - id: REQ-POLL-VOTE
    path: requirements/product.md
    hash: 6aa7771e0139c38e546be162fe37538c1509597a3adef1617817356eeef7bf33
    required: true
    reason: required by IFACE-POLLS-SERVICE.satisfies
  - id: ARCH-DATA-ACCESS
    path: architecture/system.md
    hash: 7b72fe69431530393a9ad31e58ba53a7f101660bc22b19c9a828da490e5f5db7
    required: true
    reason: required by CMP-POLLS-REPOSITORY.implements
  - id: ARCH-WEB-LAYERS
    path: architecture/system.md
    hash: a7aa51d975378c74ffa1998990636d731ae9838588edaeaac5738eca36764ded
    required: true
    reason: required by CMP-WEB-POLLS.implements
  - id: ADR-LAYERED
    path: decisions/ADR-001-layered-modular-monolith.md
    hash: ffc21b0d8205c87fdaf9d8d5cc0c77488ea9921df8c646fc5d5b9c182e8b8ab3
    required: false
    reason: optional task context
  - id: DATA-POLL-OPTIONS
    path: data/sqlite.md
    hash: 25d2c972ae6f21d7f08f4265be2e2d43dccb6396feae0f31e394c79bf3c7a719
    required: false
    reason: optional task context
  - id: CTR-REGISTER
    path: contracts/http-api.md
    hash: 7737464f6889086455cd5a21b7d2d95705f09894d2aa8361cec0cfe99c9c3a3e
    required: false
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-LOGIN
    path: contracts/http-api.md
    hash: 5dc8f868dacc336836dab5639564cac8ebcebc5886a855359f4f899f98d3e890
    required: false
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-AUTH-RESPONSE
    path: contracts/http-api.md
    hash: ce34da2161fc99ae81e396fc92788fdd04b625bc3ddceaa7a5b7eac75dc22ff8
    required: false
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-USER
    path: contracts/http-api.md
    hash: 0586cdb64419ff4f72f355d84ee149cbe609d3e15a23c0d1aa53a43dbe4a1b53
    required: false
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-VOTE
    path: contracts/http-api.md
    hash: 209f8e43cd5882fc9e6c53d74ed28d49c7ae59231576ef8b2ba873cee97222eb
    required: false
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-PAGINATED-POLLS
    path: contracts/http-api.md
    hash: 04d965ecc7f00f4b473d8187db88384f1de8e8c7c9c7208373a2764a13a696b5
    required: false
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: CTR-ERROR
    path: contracts/http-api.md
    hash: 07920aa82ab237a2e53c187d4f04acfc78fe3a841a2d8f030a3495105b038b3e
    required: false
    reason: optional one-hop from CTR-HTTP-API.uses
  - id: IFACE-VOTES-REPOSITORY
    path: contracts/service-interfaces.md
    hash: 866f1e9cde2814961c91e09942ac3f94d1bef5d7af0cdc3c086598817dbf7a82
    required: false
    reason: optional one-hop from IFACE-POLLS-SERVICE.uses
  - id: DATA-VOTES
    path: data/sqlite.md
    hash: c9db36d7e09260239c9191f3b8f56626f7d7dff17c618affb965dc867dc50583
    required: false
    reason: optional one-hop from IFACE-POLLS-REPOSITORY.uses
  - id: SEC-JWT
    path: architecture/security.md
    hash: d021e6fe5a5ba43b180ffb2b12b2a3b8f82a48d4a773eb5bb300adfc6cf28ea2
    required: false
    reason: optional one-hop from CMP-POLLS-CONTROLLER.uses
  - id: CMP-VOTES-REPOSITORY
    path: implementation/components.md
    hash: bfcf4db5a4273e4976c6209261a45ad9753706eddc45161959ef17f21c0b0708
    required: false
    reason: optional one-hop from CMP-POLLS-SERVICE.depends_on
  - id: CMP-DATABASE
    path: implementation/components.md
    hash: 10cce3ed8647c5e12575643825cadcc7b731ebfb1cb9d2439c3a2a9af6105774
    required: false
    reason: optional one-hop from CMP-POLLS-REPOSITORY.depends_on
  - id: CMP-WEB-API
    path: implementation/components.md
    hash: 04ea19879d03cc0cef34624919c893abc562efd0f4a1fa71e493eae1ef9fb8db
    required: false
    reason: optional one-hop from CMP-WEB-POLLS.depends_on
  - id: CMP-WEB-POLL-VIEWS
    path: implementation/components.md
    hash: e4a35ce4ec97a7b22d961b875669bfb5c209c218e8bedb2d3e67f841ae18114f
    required: false
    reason: optional one-hop from CMP-WEB-POLLS.depends_on
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
budget:
  max_tokens: 24000
  estimated_tokens: 5207
  max_files: 24
  selected_files: 11
---

# Context Manifest — TASK-POLLS-EDIT-01

The complete machine-readable manifest is the YAML front matter above. It was generated from selected source hash `90331d9a16ae8129ced38317ccc2b442c3e8f98f8fe6dadd6798a64016e7d23d`; do not edit it manually.
