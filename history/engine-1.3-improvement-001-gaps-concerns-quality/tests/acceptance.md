# 1.3.1 Engine Acceptance Record

## Implementation status

- **Engine implementation:** complete in the dedicated Improvement 001 clone.
- **Original engine 1.3:** unchanged, 64 files, baseline hash
  `6d6fcbc30e8ebc79c66235e0a2c3d1031bb675ad22dca367c054c690ed0dd5f2` using the
  baseline algorithm documented in `baseline-1.3.md`.
- **Target version:** 1.3.1, schema version 2.
- **Production/canonical promotion:** not performed; owner controls that action.
- **Low-model product outcome benchmark:** one Grok Low 3D-network run reviewed; C/6,
  below the B+/A first-pass target. The run did not separately capture untouched first
  pass and bounded-repair final output, and required transfer runs remain pending.
- **Release recommendation:** revise Phases 5–7 and 9, then re-benchmark. Do not
  promote this candidate as a proven outcome improvement.

## Implemented surfaces

- 20 files added, 45 existing engine files changed, zero removed from 1.3.
- 15 atomic skills, including reference analysis, SQR, and IRR.
- 12 JSON schemas, including adapter/QDC/RDR/pattern/review contracts.
- QDC/RDR/pattern/SQR/IRR templates and embedded compact-mode guidance.
- All eight existing workflows retain their high-level purpose and use conditional
  quality-by-design entry points.
- Dependency-free CLI adds adapter, decision, criterion, review, task, context,
  authority, evidence, and fingerprint validation plus four generated views.

## Automated acceptance

Command:

```bash
node --test tests/sdlc.test.js
```

Result: **13/13 PASS**.

Covered behaviors:

1. legacy-compatible 1.3 project remains valid;
2. strict quality-by-design project validates and generates quality views/context;
3. unresolved material reference blocks `ready`;
4. missing IRR blocks `ready`;
5. changed local source invalidates evidence fingerprint;
6. implementer Context cannot omit task-required decisions;
7. strict profile rejects an unknown adapter;
8. changed reviewed input makes SQR stale;
9. high-judgment work rejects implementer-only gate authority;
10. optional breadth must depend on foundation work;
11. ready strict change requires a `must` quality outcome;
12. `web-ui` composes with generic contracts;
13. `web-api` composes with the same generic contracts.

## Static acceptance

- `node --check bin/sdlc.js`: PASS.
- All schemas and `engine.json` parse as JSON: PASS.
- Engine version/schema assertions: PASS.
- All local Markdown links: PASS.
- All skill folders have matching valid names, descriptions, frontmatter, and no
  unfinished placeholders: PASS.
- The skill-creator bundled `quick_validate.py` was attempted under both available
  Python runtimes but could not start because PyYAML is not installed. No dependency
  was installed; the equivalent checks above were run with the dependency-free Node
  audit.

## P0 safeguards verified

- The quality-by-design flow is nested; Main/Change/Context/Implement/Verify/Reconcile
  remain intact.
- Core contains no WebGL, React, or benchmark-specific requirement.
- `web-ui` and `web-api` use the same generic contracts through adapter manifests.
- Durable reference/style decisions live in Main/Change, never only Context/chat.
- Pre-code QDC/SQR/IRR blockers are separate from post-code evidence validation.
- CLI output explicitly distinguishes contract validity from semantic/product quality.

## Empirical benchmark result

The reviewed build is
`benchmark/3d-network/grok-low/gpt-yes-yes-1.3.1-12131`. It improved planning,
architecture, evidence binding, and honest authority handling, but the product remained
C/6 and did not improve the 1.3 overall score. Visual polish was below the 1.3 run and
project documentation grew to 6,759 nonblank lines for 1,639 nonblank application LOC.

The benchmark also exposed two engine integration defects:

1. copied `bin/sdlc.js` is interpreted as ESM by a host package with
   `"type": "module"`, while the CLI uses CommonJS `require`;
2. external validation scans the copied `engine/` folder and treats example IDs in
   `engine/conventions.md` as live project records.

The project contracts pass as 205 artifacts, 21 documents, one change, and seven
Context manifests when the copied engine directory is excluded. The full finding and
next-candidate plan are recorded in
`benchmark/3d-network/version1.3-analysis/improvement-001-gaps-concerns-quality/07-phase-11-grok-1.3.1-benchmark-review.md`.

This is sufficient to reject the current release target, not to complete the controlled
experiment. A later run must freeze engine hash, model/version/effort, prompt,
reference, answers, budgets, and rubric; capture untouched first pass; apply a bounded
repair policy; and run the non-UI and compact-path transfer checks. Do not hide the
missed target through a rubric change.
