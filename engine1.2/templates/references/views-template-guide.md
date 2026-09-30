# Views Template — Detailed Guide

> This is the verbose reference for `../views-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- One file per module: `project/actions/<app-key>/views/<module>.md`.
- Registry: `project/actions/<app-key>/views/_index.md` (see `../index-template.md`).
- `<app-key>` is the mobile app's key from the Applications table in `project/profile.md`.
- Web apps use `pages-template.md` (`pages/<module>.md`); API apps use `services/<module>.md` + `endpoints/<module>.md`.
- Every screen uses the same section order.
- Document screen behavior in mobile terms, but link it to backend endpoints by `EP-<MODULE>-NN` ID.
- If the screen has a form, say whether it is create, edit, or combined.
- If the screen contains a list, say what endpoint feeds it and how pagination/refresh works.
- State navigation explicitly (which stack/tab the screen belongs to).
- Use the platform's native component library — not a web UI library.
- Mobile apps reuse the shared backend API — no direct external-provider calls.

## Extended Screen Entry Format

When a screen needs more detail than the compact schema:

```md
### ScreenName

- Route/Navigation: `RouteName` (deep link: `app://path/:id`)
- Status: planned
- Components: …
- Service: `ResourceApi` → EP-RESOURCE-01
- Guard: `authenticated`
- Platform: pull-to-refresh, offline cache
- Notes: …
```
