# Card · Stage 3 — Plan

Split the design into tasks that another session could do alone. Aim for 1–5 tasks. Each task should be verifiable on its own.

For each task:

```
royascaff new task <CHG> "<title>" --goal "<result>" \
  --inputs REQ-…,CMP-…,CTR-… --paths "apps/web/src/x/**" \
  --checks typecheck,test --done "<observable done condition>" [--depends TASK-…]
```

- **Tests first** when the change delivers a *must* requirement or NFR: the first task is "Acceptance tests" (they call the behavior and fail today). Every must requirement needs a `TEST-` with `--check runner:test --verifies REQ-…` (the ready gate checks it). After that task, run `royascaff check <CHG> --red`: the tests must fail. Verified is refused without it.
- **Inputs** are the records the implementer must read. The Context Pack is built from them, so list every contract, rule and requirement needed.
- **Allowed paths** are the only files the task may change. Keep them narrow.
- Never hide a design decision inside a task. If a decision is missing, go back to Design.

Then run `royascaff advance <CHG> --to ready --by ai:<tool>`. The gate checks that every task is complete, that there are at most 5 tasks, that each task's context fits the budget, and that the requirements did not change since planning. If a task's context is too big, split the task.
