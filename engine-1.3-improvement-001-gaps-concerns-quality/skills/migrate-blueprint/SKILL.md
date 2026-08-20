---
name: migrate-blueprint
description: Read-only assess and stage a recoverable v1.2/v1.3-to-v1.3.1 migration without inventing decisions or rewriting existing truth by default.
---

# Migrate Blueprint

1. Detect/inventory engine version, adoption mode, layout, adapters, and baseline validity.
2. Map IDs/facts/history; classify conflicts/unknowns.
3. Classify 1.3.1 gaps as incompatible, enrich-on-touch, warning, or informational.
4. Build a staged proposal; mark inference with evidence/confidence. Existing completed
   changes do not retroactively require a QDC.
5. Validate/generate views and present create/move/retain/supersede/archive actions plus
   `legacy-compatible`, `transition`, or `strict` adoption choice.
6. Apply only after approval with rollback manifest; never silently delete or bulk
   rewrite legacy knowledge.
