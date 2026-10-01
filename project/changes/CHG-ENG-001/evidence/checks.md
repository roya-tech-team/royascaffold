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

### EVD-ENG-002 · Full checks: engine app

- **Result:** pass
- **Kind:** verify
- **Proves:** TEST-ENG-001, TEST-ENG-002
- **Command:** `npm test` · `royascaff: dependency rules`
- **Git commit:** 39d4b1f
- **Fingerprint:** f0838bd66013 (502 file(s) and the engine version)
- **Checks:** test pass 379.2s · rules pass 0.0s
- **Placeholders:** lorem ipsum ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · TODO ×4 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · coming soon ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · no description yet ×3 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · placeholder ×75 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/commands/work.cjs, …)

**Acceptance lines**

- REQ-ENG-001#1 · unit · pass
- REQ-ENG-001#2 · e2e · pending (no e2e check ran: declare one in the app (Test or Smoke) or in the adapter's checks)
- REQ-ENG-001#3 · unit · pass

### EVD-ENG-003 · Full checks: engine app

- **Result:** fail
- **Kind:** verify
- **Command:** `npm test` · `royascaff: dependency rules`
- **Git commit:** 5a17d13
- **Fingerprint:** 90d281e07927 (522 file(s) and the engine version)
- **Checks:** test fail (exit 1) 501.5s · rules pass 0.0s
- **Placeholders:** lorem ipsum ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · TODO ×4 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · coming soon ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · no description yet ×3 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · placeholder ×75 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/commands/work.cjs, …)

**Acceptance lines**

- REQ-ENG-001#1 · unit · fail
- REQ-ENG-001#2 · e2e · pending (no e2e check ran: declare one in the app (Test or Smoke) or in the adapter's checks)
- REQ-ENG-001#3 · unit · fail

**Test failed** in `engine`:

```text
ℹ skipped 2
ℹ todo 0
ℹ duration_ms 500719.1493

✖ failing tests:

test at tests\e43-dogfood.test.cjs:39:1
✖ guardWarning gives the plain sentence, and ROYASCAFF_NO_GUARD=1 switches it off (1.8924ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected
  
  + null
  - 'You are running the engine you are changing (C:\\Users\\islam\\AppData\\Local\\Temp\\repo\\engine is part of C:\\Users\\islam\\AppData\\Local\\Temp\\repo). Run the pinned copy instead: npx royascaff (the royascaff-tool alias in node_modules) or node scripts/tool.cjs. The engine that judges a change must not change under it.'
  
      at TestContext.<anonymous> (D:\Home\projects\company\iilm.io\royascaff_research\royascaffold\engine\tests\e43-dogfood.test.cjs:42:10)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1201:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:831:18)
      at Test.postRun (node:internal/test_runner/test:1330:19)
      at Test.run (node:internal/test_runner/test:1258:12)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:385:3) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: null,
    expected: 'You are running the engine you are changing (C:\\Users\\islam\\AppData\\Local\\Temp\\repo\\engine is part of C:\\Users\\islam\\AppData\\Local\\Temp\\repo). Run the pinned copy instead: npx royascaff (the royascaff-tool alias in node_modules) or node scripts/tool.cjs. The engine that judges a change must not change under it.',
    operator: 'strictEqual',
    diff: 'simple'
  }
npm notice run royascaff@1.7.0 test
npm notice run node --require ./tests/env.cjs --test tests/*.test.cjs
```

### EVD-ENG-004 · Full checks: engine app

- **Result:** pass
- **Kind:** verify
- **Proves:** TEST-ENG-001, TEST-ENG-002
- **Command:** `npm test` · `royascaff: dependency rules`
- **Git commit:** 5a17d13
- **Fingerprint:** 90d281e07927 (522 file(s) and the engine version)
- **Checks:** test pass 586.1s · rules pass 0.0s
- **Placeholders:** lorem ipsum ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · TODO ×4 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · coming soon ×5 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · no description yet ×3 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/content.cjs) · placeholder ×75 (engine/README.md, engine/docs/RELEASE-1.4.0-beta.3.md, engine/lib/commands/work.cjs, …)

**Acceptance lines**

- REQ-ENG-001#1 · unit · pass
- REQ-ENG-001#2 · e2e · pending (no e2e check ran: declare one in the app (Test or Smoke) or in the adapter's checks)
- REQ-ENG-001#3 · unit · pass
