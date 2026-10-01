# AI-Control Engine — Flow Router

## How to Use

Read this file first on every task. It tells you which flow file to load based on the current phase.

**RoyaScaff = `royascaff/engine/` only.** The blueprint folder `project/` is **not** shipped empty. The engine creates it when a build or reverse-engineer starts. Layout contract: `royascaff/engine/project-layout.md`.

**Resuming change / polish / bug / init packs?** Read `project/changes/change-log.md` first (and `project/changes/build-program.md` for REQ-INIT / REQ-R). Then open the pack. Also check `project/bugs/bug-log.md` for bugs.

**Resuming blueprint overview?** If `project/status.md` exists, read it for `done` / `partial` / `planned` / `deferred` on main. See `royascaff/engine/conventions.md` → **Build Status** and **Main vs pack vs index**.

**No blueprint yet?** If `project/profile.md` is missing, run Phase 0–4 (greenfield) or Phase R (existing code). Phase 5, P, and 6 require an existing blueprint.

**Greenfield implementation:** Phase 0–2 design on main (`planned`); Phase 3 = REQ-INIT work packs (not a monolith build). Phase R documents on main, then REQ-R packs for gaps.

## Phase Routing

| Phase | Purpose | Flow File |
|-------|---------|-----------|
| 0–4 | Initial Build (design + REQ-INIT packs) | `royascaff/engine/flows/initial-build.md` |
| 5 | Change Mode (features / plan-impacting work) | `royascaff/engine/flows/change-mode.md` |
| P | Polish (visual/style/copy only) | `royascaff/engine/flows/polish.md` |
| 6 | Bug Fix | `royascaff/engine/flows/bug-fix.md` |
| R | Reverse-Engineer existing codebase | `royascaff/engine/flows/reverse-engineer.md` |

### Quick triage

| Intent | Phase |
|--------|-------|
| New/changed capability, fields, endpoints, pages with behavior | 5 |
| Style/spacing/copy/button look only | P |
| Something broken vs expected behavior | 6 |
| Onboard existing code | R |
| Greenfield from description | 0–4 |

## Before writing any `project/` file

1. Load `royascaff/engine/project-layout.md`.
2. Run the **Bootstrap gate** there (create root dirs if missing; never seed placeholder READMEs).
3. Create each file only when its flow step runs, from the matching template.
4. For Phase 5 / P / 6 Path A / Init 3.x / REQ-R packs: write in-flight work only inside the **change work pack**; merge to main after verify.

## Global Conventions

See `royascaff/engine/conventions.md` for defaults that specs inherit (route prefix, auth model, envelope, pagination, UI states, build status, pack-status).

## Two Zones

- **`royascaff/engine/`** — the product: this router, flows, templates, rules, and `project-layout.md`.
- **`project/`** — generated living blueprint (main = implemented reality; `changes/` holds in-flight packs).

## Project Files Quick Reference

(Paths below exist only after the engine has generated them.)

- **In-flight changes index**: `project/changes/change-log.md` (read first when resuming packs)
- **Build program**: `project/changes/build-program.md` (REQ-INIT / REQ-R queue)
- **Build state dashboard**: `project/status.md`
- **System identity**: `project/profile.md`, `project/description.md`
- **Planning (main)**: `project/plan/modules.md`, `data-model.md`, `roles-and-authorization.md`
- **Business rules**: `project/rules.md`
- **Backend / client specs (main)**: `project/actions/<app>/…`
- **Work packs**: `project/changes/change-<ID>-<slug>/` (see `project-layout.md`)
- **Bugs index**: `project/bugs/bug-log.md`
- **Layout contract**: `royascaff/engine/project-layout.md`
- **Templates**: `royascaff/engine/templates/`

## Traceability Chain

```
Data Model → Services → Endpoints → Pages/Views
```

- **Generation order**: services first, then endpoints, then client specs.
- **Dependency direction**: Pages → Endpoints → Services → Repositories/Providers
