# Card · Stage 3 — Plan

Split the design into tasks that another session could do alone. Aim for 1–5 tasks. Each task should be verifiable on its own.

For each task:

```
royascaff new task <CHG> "<title>" --goal "<result>" \
  --inputs REQ-…,CMP-…,CTR-… --paths "apps/web/src/x/**" \
  --checks typecheck,test --done "<observable done condition>" [--depends TASK-…]
```

- **Tests are part of every task, not a task of their own.** Every requirement the change delivers needs a `TEST-` (`royascaff new record test … --verifies REQ-… --check runner:test|manual`); a *must* requirement or NFR needs a runner test. The ready gate checks both. A task that implements a must requirement starts with its tests, and `task done` needs a red run inside the task (see the build card).
- **Inputs** are the records the implementer must read. The Context Pack is built from them, so list every contract, rule and requirement needed.
- **Allowed paths** are the only files the task may change. Keep them narrow.
- Never hide a design decision inside a task. If a decision is missing, go back to Design.

Then run `royascaff advance <CHG> --to ready --by ai:<tool>`. The gate checks that every task is complete, that there are at most 5 tasks, that each task's context fits the budget, and that the requirements did not change since planning. If a task's context is too big, split the task.
