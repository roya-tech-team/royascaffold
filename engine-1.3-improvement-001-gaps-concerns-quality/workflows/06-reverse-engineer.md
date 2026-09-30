# Reverse Engineer Workflow

Use for existing code without a trusted v1.3 blueprint.

1. Inventory repositories, runtimes, modules, entry points, config, tests, generated/vendor paths.
2. Create a physical code map and select adapters.
3. Choose one app/module/context checkpoint.
4. Extract components, actions, contracts, data, tests, and operations evidence.
5. Record sourced findings and use the reference-analysis observation/interpretation
   boundary for legacy behavior, interfaces, contracts, and data.
6. Infer requirements/domain/workflows with explicit evidence, confidence, and review
   state. Inferred quality or style intent is not stakeholder-approved truth.
7. Present findings and developer corrections; only confirmed facts become approved.
8. Validate traceability/orphans/drift for the checkpoint.
9. Reconcile confirmed current knowledge and create normal QDC-backed remediation
   changes for gaps.
10. Repeat; update the system map as confidence grows.

Never scan the entire system into one model context or mark inference `verified`.
