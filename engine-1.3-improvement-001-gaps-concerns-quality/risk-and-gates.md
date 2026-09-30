# Risk and Adaptive Gates

## Routing dimensions

Assess consequence (behavior/business outcome, security/privacy, money/external side
effects, data/migration/deletion, public/shared compatibility, availability/recovery,
ownership, reversibility), **uncertainty**, and **judgment demand** independently.

| Risk | Definition |
|------|------------|
| Low | local, reversible, no behavior/security/data/public-contract impact |
| Medium | bounded behavior change with known pattern and rollback |
| High | authorization, sensitive data, money, public contract, migration, external side effect, cross-system, difficult rollback |
| Critical | destructive/irreversible, safety/regulatory, active severe incident, broad data/availability exposure |

High-risk triggers override small file count.

| Judgment | Definition |
|---|---|
| Low | mechanical result governed by complete existing decisions |
| Medium | bounded interpretation or choice using an approved pattern |
| High | subjective quality, influential reference, ambiguous outcome, novel pattern, or material content/data credibility |

| Uncertainty | Definition |
|---|---|
| Low | relevant facts and authority are known |
| Medium | bounded assumptions or incomplete implementation knowledge |
| High | material stakeholder intent, source meaning, feasibility, or affected ownership is unresolved |

A small code change can still be high judgment. The recorded route also selects
`compact`, `standard`, or `rigorous` artifact mode.

## Gates

| Gate | Low | Medium | High/Critical |
|------|-----|--------|---------------|
| Scope/requirements | may combine with ready gate | explicit | explicit owner review |
| Architecture/security/data | if affected | if affected | mandatory relevant independent review |
| Execution ready | required | required | required |
| Implement | may be pre-authorized | explicit | explicit |
| Verify | deterministic self-check allowed | separate review recommended | independent verifier required |
| Reconcile | policy/pre-authorization allowed | explicit/policy | explicit preview approval |
| Release/rollback | if deployed | if deployed | mandatory monitored rollout |

## Quality-by-design gates

| Trigger | QDC | RDR | SQR | IRR | Result authority |
|---|---|---|---|---|---|
| Low consequence + low judgment + known decisions | inherited/embedded delta | only if a new reference matters | compact checklist | compact checklist | self-check allowed |
| Medium consequence, uncertainty, or judgment | explicit | when source influences outcome | required | required | fresh context recommended |
| High/critical consequence or high judgment | explicit and owner-calibrated | required for influential source | independent/fresh-context required | independent/fresh-context required | independent authority for material claims |

### Readiness blockers

- unresolved material/critical decision or assumption without approval;
- a `must` criterion without an observable outcome, method, or authority;
- selected adapter prerequisite/conflict unresolved;
- SQR/IRR `revise`, stale review, or open blocking condition;
- a required reference/pattern decision missing from tasks/context;
- optional work scheduled before its foundation dependency;
- required context omitted or silently truncated.

### Right-sizing

Rigor scales with consequence, judgment, novelty, reversibility, reference dependence,
affected boundaries, content/data credibility, and existing decision coverage. Code size
is only one signal. Compact mode reduces files and repeated prose, never material
decisions.

Silence is never approval. Record the reviewed revision and conditions; material change makes approval stale.
