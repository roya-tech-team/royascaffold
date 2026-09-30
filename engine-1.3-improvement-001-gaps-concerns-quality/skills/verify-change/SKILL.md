---
name: verify-change
description: Collect and adjudicate fresh, replayable, source-bound evidence against approved criteria with authority proportional to consequence and judgment.
---

# Verify Change

- Inputs: approved QDC/deltas/tasks, changed-file inventory, current source and
  fingerprints, authority policy, test policy, existing evidence.
- Run deterministic validation first; semantic review cannot override failures.
- Map each `must` criterion/requirement/invariant/NFR to expected/actual result,
  reproducible method, environment, artifact, executor, adjudicator, limitations, and
  current source revision.
- Results: PASS, FAIL, INCONCLUSIVE, MANUAL-REQUIRED, NOT-APPLICABLE, STALE. Runner
  absence or old source cannot become PASS.
- The selected route determines whether self-check, fresh-context, independent-model,
  independent-person, stakeholder, or deterministic-runner authority can adjudicate.
- Bound repair to named failures. If verification discovers a product/design decision
  defect, return to QDC/design and re-run the affected reviews rather than redesigning
  inside verification.
