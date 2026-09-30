# Risk and Adaptive Gates

## Risk dimensions

Assess behavior/business outcome, security/privacy, money/external side effects, data/migration/deletion, public/shared compatibility, operational availability/recovery, cross-boundary ownership, reversibility, and uncertainty.

| Risk | Definition |
|------|------------|
| Low | local, reversible, no behavior/security/data/public-contract impact |
| Medium | bounded behavior change with known pattern and rollback |
| High | authorization, sensitive data, money, public contract, migration, external side effect, cross-system, difficult rollback |
| Critical | destructive/irreversible, safety/regulatory, active severe incident, broad data/availability exposure |

High-risk triggers override small file count.

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

Silence is never approval. Record the reviewed revision and conditions; material change makes approval stale.

