# Technology-Neutral Core Rules

1. Business outcomes and requirements precede implementation mechanisms.
2. Critical invariants have an enforcing component and a test/evaluation.
3. Public/shared contracts have owner, consumers, compatibility policy, and implementation links.
4. Transport/UI/entry layers do not own authoritative business rules.
5. External side effects and infrastructure are isolated behind owned components/contracts.
6. Sensitive data has classification, access, retention, and output rules.
7. Changed source files stay inside approved tasks and have code-map ownership.
8. Deployable systems define verification, observation, and recovery proportional to risk.
9. Generated views never become canonical.
10. Unknown or inferred knowledge is marked and reviewed rather than presented as fact.
11. Quality is calibrated and designed before implementation; verification closes the
    remaining gap and does not discover the product on behalf of the plan.
12. The core defines generic dimensions and contracts only. Technology-, domain-, and
    archetype-specific guidance requires a selected adapter or project decision with
    provenance.
13. An artifact is not complete because its headings exist. Material decisions are
    decided, authority-approved assumptions, or blockers before readiness.
14. Influential references are translated into durable retain/adapt/reject decisions;
    conversation memory and generated Context Packs are not truth owners.
15. Material solution patterns state forces, choice, alternatives, constraints, failure
    modes, validation, and affected tasks.
16. Foundation outcomes precede optional breadth in scope and task dependencies.
17. Context compilation preserves every task-relevant `must` decision and removes
    unrelated material before compressing required meaning.
18. The implementer escalates missing material decisions and does not improvise them.
19. Material PASS claims are source-bound, replayable, fresh, and adjudicated by the
    authority class selected by the risk profile.
20. Structural validation is reported as contract validity, never as proof that the
    product, design, or experience is good.

## Adapter boundary

An adapter may contribute discovery questions, risks, patterns, criteria, examples,
anti-patterns, and optional runner hooks. It declares ID/version, applicability,
prerequisites, incompatibilities, precedence, and provenance. It cannot silently
override a core/project `must` or convert an unavailable check to PASS.
