---
document_id: DOC-KUNI-EVD-CONTROLS
title: View control evidence
layer: evidence
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Control evidence

### EVD-KUNI-004 · View controls change presentation

- **Kind:** evidence
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** knowledge-universe-team
- **Method:** click Toggle Labels, Randomize, and Reset View in the running app
- **Environment:** Cursor browser, `http://localhost:5173/`
- **Time:** 2026-08-20T02:21Z
- **Scope:** chrome controls
- **Result:** PASS
- **Observation:** Toggle Labels hid default importance labels while the graph remained visible. Reset View cleared the Machine Learning details panel and restored framing. Randomize is wired to generate a new seeded instance and now also clears attention state so a leftover selection cannot stick to reused names.
- **Covers:** `TEST-KUNI-004`
