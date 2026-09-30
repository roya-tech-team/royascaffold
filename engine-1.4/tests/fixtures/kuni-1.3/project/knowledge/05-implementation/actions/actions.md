---
document_id: DOC-KUNI-ACTIONS
title: Knowledge Universe actions
layer: implementation
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Actions

### ACT-KUNI-HOVER · Hover a node

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** pointer enters or leaves a node
- **Actor:** Explorer
- **Input:** node id or none
- **Output:** hover view state
- **Called components:** `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`, `CMP-KUNI-LABELS`, `CMP-KUNI-STORE`
- **Success:** neighborhood emphasizes; pointer changes
- **Implements:** `REQ-KUNI-007`
- **Verified by:** `TEST-KUNI-003`

### ACT-KUNI-SELECT · Select a node

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** click a node or empty space
- **Actor:** Explorer
- **Input:** node id or none
- **Output:** selection, dimmed background, details visibility
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-DETAILS`, `CMP-KUNI-NODES`, `CMP-KUNI-EDGES`
- **Success:** selected neighborhood is clear; empty click clears
- **Implements:** `REQ-KUNI-008`, `REQ-KUNI-009`
- **Verified by:** `TEST-KUNI-003`

### ACT-KUNI-FOCUS · Focus camera on selection

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** a node becomes selected
- **Actor:** Explorer
- **Output:** smooth camera approach
- **Called components:** `CMP-KUNI-CANVAS`, `CMP-KUNI-STORE`
- **Success:** camera eases toward the node without a snap
- **Implements:** `REQ-KUNI-006`
- **Verified by:** `TEST-KUNI-003`

### ACT-KUNI-RESET · Reset view

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** Reset View control
- **Actor:** Explorer
- **Output:** initial camera, cleared attention
- **Called components:** `CMP-KUNI-CANVAS`, `CMP-KUNI-STORE`, `CMP-KUNI-HUD`
- **Implements:** `REQ-KUNI-011`
- **Verified by:** `TEST-KUNI-004`

### ACT-KUNI-RANDOM · Randomize graph

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** Randomize control
- **Actor:** Explorer
- **Output:** new dummy graph instance
- **Called components:** `CMP-KUNI-GENERATOR`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-013`
- **Verified by:** `TEST-KUNI-004`

### ACT-KUNI-TOGGLE · Toggle labels or auto-rotate

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** Toggle Labels or Toggle Auto Rotate
- **Actor:** Explorer
- **Output:** updated presentation flags
- **Called components:** `CMP-KUNI-STORE`, `CMP-KUNI-HUD`, `CMP-KUNI-LABELS`, `CMP-KUNI-CANVAS`
- **Implements:** `REQ-KUNI-012`, `REQ-KUNI-014`
- **Verified by:** `TEST-KUNI-004`

### ACT-KUNI-PATH · Trace a path

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** Path mode plus two node clicks
- **Actor:** Explorer
- **Called components:** `CMP-KUNI-ALGO`, `CMP-KUNI-STORE`, `CMP-KUNI-SEMANTIC`
- **Implements:** `REQ-KUNI-019`, `REQ-KUNI-022`
- **Verified by:** `TEST-KUNI-006`

### ACT-KUNI-INFLUENCE · Rank influence

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** Influence mode
- **Actor:** Explorer
- **Called components:** `CMP-KUNI-ALGO`, `CMP-KUNI-NODES`
- **Implements:** `REQ-KUNI-020`
- **Verified by:** `TEST-KUNI-006`

### ACT-KUNI-TIME · Move the playhead

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** drag or play the timeline
- **Actor:** Explorer
- **Called components:** `CMP-KUNI-TIMELINE`, `CMP-KUNI-STORE`
- **Implements:** `REQ-KUNI-024`
- **Verified by:** `TEST-KUNI-008`

### ACT-KUNI-FILTER · Filter relationship types

- **Kind:** action
- **Knowledge status:** approved
- **Implementation status:** verified
- **Owner:** knowledge-universe-team
- **Trigger:** toggle a relationship chip
- **Actor:** Explorer
- **Called components:** `CMP-KUNI-SEMANTIC`, `CMP-KUNI-EDGES`
- **Implements:** `REQ-KUNI-021`
- **Verified by:** `TEST-KUNI-007`
