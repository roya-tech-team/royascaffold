---
document_id: DOC-KUNI-EVD-STATIC
title: Typecheck and local-only evidence
layer: evidence
schema_version: 1
document_status: approved
owners: [knowledge-universe-team]
---

# Static evidence

### EVD-KUNI-005 · Typecheck and production build

- **Kind:** evidence
- **Knowledge status:** approved
- **Implementation status:** not-applicable
- **Owner:** knowledge-universe-team
- **Command:** `npm run typecheck` then `npm run build`
- **Environment:** local Node, knowledge-universe client
- **Time:** 2026-08-20T02:18Z and 2026-08-20T02:22Z
- **Scope:** TypeScript strict, Vite production bundle
- **Result:** PASS
- **Observation:** typecheck exited 0. Production build exited 0. Dependencies are the confirmed client stack plus a unused postprocessing package kept after bloom was removed because it blanked the canvas. No auth, API, or database packages are used.
- **Covers:** `TEST-KUNI-005`
