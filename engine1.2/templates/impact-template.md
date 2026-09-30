# Impact Analysis Template

Code recon + impact analysis in one artifact. Saved as `impact.md` inside the change pack.

> Verbose guidance → `references/impact-template-guide.md`

## Schema

```md
# Impact Analysis — [Change Name]

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none/partial/complete | path | |
| Service(s) | none/partial/complete | path | |
| Endpoint(s) | none/partial/complete | path | |
| Page(s) | none/partial/complete | path | |

Feature state: none | partial | complete

## Affected Modules
- [name] — changes needed

## Pack blueprint files to create
- [ ] `blueprint/plan/…` — modules / data-model / rules slices as needed
- [ ] `blueprint/actions/<api>/services/<module>.md`
- [ ] `blueprint/actions/<api>/endpoints/<module>.md`
- [ ] `blueprint/actions/<web>/pages/<module>.md` or `views/<module>.md`
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: complexity (L/M/H), cross-module (Y/N), migration (Y/N)

## Recommendation
- **Create**: [new items] — **Complete**: [partial] — **Modify**: [ripple]

## Status target (per artifact in the pack after implement)
- [ID/name] → planned | partial | done | deferred (reason if deferred)

## Dependencies
- depends-on: [change-<ID> or —] — current pack-status of dep: …
```

`State` (none/partial/complete) maps to artifact **status** in the pack: `none`→`planned`, `partial`→`partial`, `complete`→`done` after implement. See `royascaff/engine/conventions.md`.

## Example

```md
# Impact Analysis — Bulk CSV Delete

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Service(s) | partial | data.service.ts | single-delete only |
| Endpoint(s) | partial | data.controller.ts | no bulk endpoint |
| Page(s) | complete | pages/data/files-list/ | no multi-select |

Feature state: partial

## Affected Modules
- Data — add bulk-delete endpoint, service method, multi-select UI

## Pack blueprint files to create
- [ ] `blueprint/actions/backend/services/data.md`
- [ ] `blueprint/actions/backend/endpoints/data.md`
- [ ] `blueprint/actions/portal/pages/data.md`
- [ ] `blueprint/_index.md`

## Risk: low, no cross-module, no migration

## Recommendation
- **Create**: bulk-delete endpoint + method — **Complete**: files-list (multi-select)
```
