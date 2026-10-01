# Quality-by-Design Operating Contract

## Architectural boundary

Quality-by-design is a subflow inside Initial Build and Change. It does not replace
Main, Change, layered knowledge, Slice/Context, implementation, verification, release,
or reconciliation.

```text
route/change/impact
  → discover → interpret → design → SQR
  → compile tasks/context → IRR → ready
  → implement → verify/repair → reconcile
```

## Semantic minimum

When routed, work must have:

1. an owner-calibrated outcome and QDC with observable `must` criteria;
2. durable retain/adapt/reject RDRs for influential sources;
3. explicit `PAT-*` records for material choices;
4. a current passed SQR tied to exact reviewed inputs;
5. foundation-first tasks tracing all required criteria/decisions;
6. a Context Pack containing the task's required decisions without contradiction;
7. a current passed IRR using the consumer test;
8. source-bound verification at the routed authority class.

Compact mode embeds the same semantics in fewer files. Standard mode makes the
contracts explicit. Rigorous mode adds stronger review separation. Rigor is based on
consequence, judgment, uncertainty, novelty, reversibility, reference dependence,
affected boundaries, and credibility—not only code size.

## Consumer test

Before `ready`, a reviewer asks whether an implementer absent from discovery can execute
each task using only its Context Pack and declared repository access without choosing a
material product, visual, content, data, contract, architecture, or quality decision.
If not, fix the owning decision or compilation artifact and re-review.

## Generic specialization

Core defines dimensions, ownership, states, trace, and gates. Adapters contribute
specialized questions, risks, patterns, criteria, examples, anti-patterns, and optional
runner hooks with provenance. Project decisions choose concrete technology and
thresholds. Conflict blocks composition; precedence never authorizes silent override.

## Authority boundary

The implementer may collect evidence but cannot be the sole final adjudicator when the
route requires independence. `validate` can prove record structure, trace, state, and
fingerprint consistency; it cannot judge taste, coherence, truthfulness of an observed
result, or stakeholder satisfaction.
