---
name: review-solution-quality
description: Review an exact proposed solution before task creation for intent fidelity, coherence, feasibility, quality calibration, conflicts, and material decision completeness.
---

# Review Solution Quality

Inputs: current QDC, RDRs, requirements/workflows, design/content/data/architecture,
selected adapters/patterns, route, and exact source revisions.

Review independently at the routed authority level:

- outcome, audience, priority, reference, and unacceptable-outcome fidelity;
- product/experience/content/architecture/operations coherence;
- foundation before optional breadth;
- material choices, alternatives, constraints, failure modes, and feasibility;
- adapter coverage, provenance, prerequisites, and conflicts;
- threshold authority and unresolved material assumptions;
- likely first-pass failure modes for the intended implementer.

Create immutable `REV-*` findings and disposition: `pass`, `pass-with-conditions`, or
`revise`. Record reviewer authority and reviewed input revisions. Conditions need owner,
destination, and closure evidence. Fix findings in their owning sources and re-review;
the review report must not become a hidden replacement design.
