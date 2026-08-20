# Merge Report Template

Written at Step 5.6 / P.5 after verify PASS. Lives at `project/changes/change-<ID>-<slug>/merge-report.md`.

## Schema

```md
# Merge Report — change-<ID>-<slug>

- **Merged date**: YYYY-MM-DD
- **pack-status**: merged
- **Verified by**: verify-code.md Overall PASS

## Main files updated

| Main path | Action |
|-----------|--------|
| `project/plan/data-model.md` | in-place: User +phone |
| `project/actions/backend/endpoints/users.md` | merged EP-USERS-04 after-state |
| `project/actions/backend/services/users.md` | merged SVC-USERS-02 |
| `project/actions/<web>/pages/users.md` | merged User Edit Page notes |
| `project/status.md` | refreshed Snapshot / modules |

## Skipped (unchanged)

- [main files read but not modified]

## Post-merge checks

- [ ] Main `_index.md` Done/Total updated for touched modules
- [ ] No leftover change-* sections appended to main files
- [ ] `change-log.md` row moved to Completed with Merged date
- [ ] Pack `status.md` + change-request metadata set to `merged`
```
