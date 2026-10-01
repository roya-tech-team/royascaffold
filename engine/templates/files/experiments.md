---
document_id: DOC-{{CODE}}-EXPERIMENTS
title: Experiments
layer: quality
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Experiments

> **What:** every experiment (EXP-): the hypothesis, the variants, the metric and the decision
> **Read when:** planning an experiment, or deciding which variant stays

An experiment has a hypothesis, two or more variants, and a metric written like the NFR measures (`` `signup_rate >= 0.05` ``). It serves an outcome (OUT-). A person records the decision with `royascaff measure EXP-… --result "keep A" --note "…"` (`keep <variant>` or `stop`); the variant that lost becomes a slice that removes it.

Add one with `royascaff new record experiment "<name>" --feature CAP-… --outcome OUT-… --hypothesis "…" --variants "A: … ; B: …" --metric "signup_rate >= 0.05"`.

## Record format (example)

```md
### EXP-{{CODE}}-001 · Shorter sign-up form

- **Owner:** {{OWNER}}
- **Feature:** CAP-{{CODE}}-001
- **Hypothesis:** A form with three fields instead of six raises sign-ups.
- **Variants:** A: six fields (today) ; B: three fields
- **Metric:** `signup_rate >= 0.05`
- **Outcome:** OUT-{{CODE}}-001
- **Decision:**
```
