# Verification Template

Pre-build (plan consistency) + post-build (code matches plan) in one report. Pre-build optional for fast-track.

> Verbose guidance → `references/verification-template-guide.md`

## Schema

```md
# Verification — [Change Name]

## Plan Consistency (pre-build, optional for fast-track)
- [ ] Endpoints exist in specs
- [ ] Services exist in specs
- [ ] Data model updated
- [ ] Routes match
- [ ] Auth declared
- [ ] Recon findings reflected

## Code Verification (post-build, always required)
- [ ] Endpoints implemented (method, route, guard)
- [ ] Services implemented
- [ ] Pages/views at correct routes
- [ ] Layering: controller → service → repo
- [ ] No direct external URLs in frontend
- [ ] Auth guards applied
- [ ] Acceptance criteria met
- [ ] No regressions

## Result: PASS / FAIL
```

## Example

```md
# Verification — Bulk CSV Delete

## Plan Consistency
- [x] POST /data/bulk-delete in endpoints — [x] bulkDelete in services — [x] Routes match

## Code Verification
- [x] Endpoint implemented with guard — [x] Service works per spec
- [x] Multi-select UI added — [x] Layering correct — [x] No external URLs
- [x] All acceptance criteria met — [x] No regressions

## Result: PASS
```
