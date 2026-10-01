---
document_id: DOC-KUNI-ACTIONS
title: Knowledge Universe actions
layer: implementation
schema_version: 2
document_status: in-review
owners: [knowledge-universe-team]
---

# Actions

Explorer-triggered behaviors for the first visual milestone. No network I/O.

### ACT-KUNI-LAUNCH · Open the universe

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** application bootstrap
- **Actor:** Explorer
- **Input:** none
- **Output:** a valid dummy graph in default view
- **Called components:** `CMP-KUNI-APP`, `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE`, `CMP-KUNI-CANVAS`
- **Preconditions:** local client can run
- **Success:** GraphReady; first painted view is the universe
- **Failure:** quiet chrome error; no silent blank canvas
- **Implements:** `UC-KUNI-001`, `WF-KUNI-EXPLORE`

### ACT-KUNI-HOVER · Hover a node

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** pointer enters a node hit area
- **Actor:** Explorer
- **Input:** node id
- **Output:** hover neighborhood emphasis and label
- **Called components:** `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `CMP-KUNI-LABELS`, `CMP-KUNI-STORE`
- **Success:** PointerEnteredNode; focus node scales and brightens
- **Side effects:** none persisted
- **Implements:** `REQ-KUNI-007`, `WF-KUNI-EXPLORE`

### ACT-KUNI-SELECT · Select a node

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** click a node
- **Actor:** Explorer
- **Input:** node id
- **Output:** selected neighborhood, dimmed remainder, details panel
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`, `CMP-KUNI-CANVAS`
- **Success:** NodeSelected; panel shows name type description connection count
- **Side effects:** optional camera focus via `ACT-KUNI-FOCUS`
- **Implements:** `REQ-KUNI-008`, `REQ-KUNI-009`, `WF-KUNI-INSPECT`

### ACT-KUNI-CLEAR · Clear selection

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** click empty canvas
- **Actor:** Explorer
- **Output:** default view state
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`
- **Success:** SelectionCleared; panel closed
- **Implements:** `INV-KUNI-009`

### ACT-KUNI-ORBIT · Explore with the camera

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** pointer or touch drag wheel or pinch
- **Actor:** Explorer
- **Output:** new camera framing within min and max distance
- **Called components:** `CMP-KUNI-CANVAS`
- **Success:** CameraMoved; motion is damped
- **Side effects:** interrupts auto-rotate
- **Implements:** `REQ-KUNI-006`, `PAT-KUNI-010`

### ACT-KUNI-FOCUS · Ease camera to selection

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** NodeSelected
- **Actor:** system
- **Output:** smooth camera approach
- **Called components:** `CMP-KUNI-CANVAS`, `CMP-KUNI-STORE`
- **Success:** framing approaches the selected node without a snap
- **Implements:** `CRIT-KUNI-024`, `DEC-KUNI-016`

### ACT-KUNI-RESET · Reset view

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** Reset View control
- **Actor:** Explorer
- **Output:** home camera and default view
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-CANVAS`
- **Success:** ViewReset; selection hover focus and panel cleared
- **Implements:** `REQ-KUNI-011`, `WF-KUNI-CONTROL`

### ACT-KUNI-LABELS · Toggle default labels

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** Toggle Labels control
- **Actor:** Explorer
- **Output:** showLabels flag flipped
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-LABELS`
- **Success:** LabelsToggled; hover and selection labels remain
- **Implements:** `REQ-KUNI-012`

### ACT-KUNI-ROTATE · Toggle auto-rotate

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** Toggle Auto Rotate control
- **Actor:** Explorer
- **Output:** autoRotate flag flipped
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-CANVAS`
- **Success:** AutoRotateToggled; default remains off for a new session
- **Implements:** `REQ-KUNI-014`, `INV-KUNI-010`

### ACT-KUNI-RANDOMIZE · Replace the dummy graph

- **Kind:** action
- **Knowledge status:** in-review
- **Implementation status:** planned
- **Owner:** knowledge-universe-team
- **Trigger:** Randomize control
- **Actor:** Explorer
- **Output:** new valid graph instance and default view
- **Called components:** `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE`
- **Success:** GraphRandomized then GraphReady; attention flags cleared
- **Failure:** must not emit a graph outside `INV-KUNI-006`
- **Implements:** `REQ-KUNI-013`, `WF-KUNI-CONTROL`
