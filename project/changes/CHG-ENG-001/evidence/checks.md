# Checks · CHG-ENG-001

> **What:** results of `royascaff check` runs (written by the CLI)
> **Read when:** a check failed, or to see what proved this change

### EVD-ENG-001 · Full checks: engine app

- **Result:** pass
- **Kind:** verify
- **Proves:** TEST-ENG-001, TEST-ENG-002
- **Command:** `npm test` · `royascaff: dependency rules`
- **Git commit:** c38128e
- **Fingerprint:** e06cb4fd04b8 (476 file(s) and the engine version)
- **Checks:** test pass 351.5s · rules pass 0.0s
- **Placeholders:** lorem ipsum ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · TODO ×4 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · coming soon ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · no description yet ×3 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · placeholder ×75 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/commands/work.cjs, …)

**Acceptance lines**

- REQ-ENG-001#1 · unit · pass
- REQ-ENG-001#2 · e2e · pending (no e2e check ran: declare one in the app (Test or Smoke) or in the adapter's checks)
- REQ-ENG-001#3 · unit · pass
