# Pages Template — Detailed Guide

> This is the verbose reference for `../pages-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- One file per module: `project/actions/<app-key>/pages/<module>.md`.
- Registry: `project/actions/<app-key>/pages/_index.md` (see `../index-template.md`).
- `<app-key>` is the web app's key from the Applications table in `project/profile.md`.
- For mobile apps, use `views-template.md` → `views/<module>.md` instead.
- Every page should use the same section order.
- Document page behavior in frontend terms, but link it to backend endpoints by `EP-<MODULE>-NN` ID.
- If the page has a form, say whether it is create, edit, or combined create/edit.
- If the page contains a table, say what endpoint feeds it.
- If the page is inside auth or app shell, say so explicitly.

## Extended Page Entry Format

When a page needs more detail than the compact schema:

```md
### PageName

- Route: `/app/resource`
- Type: list | details | create | edit | create-edit | dashboard | settings | auth
- Layout: app shell | auth layout | public layout
- Status: done

#### Components
- `ComponentName` — what it does

#### Services
- `ResourceService` → EP-RESOURCE-01 (GET /resource), EP-RESOURCE-02 (POST /resource)

#### UI States
- Loading / empty / error / success

#### Guard
- `authGuard` | `adminGuard` | `none`

#### Notes
- …
```
