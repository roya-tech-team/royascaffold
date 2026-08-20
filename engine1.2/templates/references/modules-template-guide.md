# Modules & Features Template — Detailed Guide

> This is the verbose reference for `../modules-template.md`. Consult when you need field meanings, rules, or alternate entry formats.

## File-Level Rules

- `modules.md` is created before action specs (`services/<module>.md`, `endpoints/<module>.md`, `pages/<module>.md`).
- Every module must use the same section order.
- Module names must stay stable — reused in endpoints, pages, and code folders as `## Module: {Module Name}`.
- Name modules by business capability, not by one screen or one endpoint.
- One feature may span one module or multiple modules; one module may contain many features.
- Separate admin/master-data modules from normal user workflow modules when they serve different audiences.
- Mark backend-only modules explicitly when they have no dedicated frontend area.
- Mark frontend shell/layout modules explicitly when they are not backend domains.
- Shared infrastructure modules should be documented separately from business modules.
- Do not dump existing code; describe the recommended module map the project should implement.

## Feature Entry Rules (formerly features-template.md)

- Features are documented **inside** each module section — there is no separate `features.md` file.
- Use the module's exact name from the module header.
- Every feature inside a module must list: name, visibility tag, and short description.
- Describe product behavior and business capability, not API routes or page routes.
- One feature may require many endpoints and many pages.
- Mark backend-only features explicitly when they have no dedicated UI.
- Keep feature names stable — used to derive endpoints and pages.
- If a feature spans multiple modules, document it under the primary owning module and note the related module.

## Recommended File Structure

```md
# Modules & Features

## Short Summary

{One paragraph: what product this module map supports.}

## Business Modules

## 1. {Module Name}
{module entry with features}

## 2. {Module Name}
{module entry with features}

## Shared / Infrastructure Modules

## 1. {Module Name}
{module entry}

## Module Priority

### Phase 1: Core Required
- {Module Name}

### Phase 2: {Phase Name}
- {Module Name}

## Module Dependency Summary
- `Module A` depends on `Module B`
```

## Extended Module Entry (when more detail is needed)

```md
## {Number}. {Module Name}

### Purpose

{Clear explanation of what this module owns in the system.}

### Scope

- Backend: `yes | no`
- Frontend: `yes | no`
- Audience: `internal users | admin | public | mixed`

### Backend Module

- Folder: `src/modules/{module-slug}/`
- Owns:
  - {controller/service responsibility}

### Frontend Module

- Folder: `{client/src/app/...}`
- Owns:
  - {page area or shell responsibility}

### Data Model / Entities

- `{collection or entity}`

### Depends On

- `{Module Name}`

### Features

1. **{Feature Name}** [{visibility}] — {description}

### Notes

- {planning note}
```

## Backend-Only Module Variant

When a module has no dedicated frontend area, omit the Frontend Module subsection and mark `Scope: BE only`.

## Frontend Shell Module Variant

For auth layout, app shell, or navigation modules, omit backend-specific subsections and mark `Scope: FE only`.

## Suggested Field Meanings

- **Module Name** — stable business capability label reused in endpoints, pages, and code folders
- **Scope** — whether the module exists on backend, frontend, or both; audience
- **Entities** — collections or entities primarily owned by this module
- **Depends On** — other modules that must exist first or be available at runtime
- **Features** — complete list of product capabilities owned by this module
- **Visibility tag** — `[both]` = needs backend + frontend; `[backend-only]` = no UI; `[frontend]` = UI-only
- **Phase priorities** — implementation order for backend and frontend generation
