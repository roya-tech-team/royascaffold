# Views Template (Mobile Apps)

Per-module screen specs for one mobile app. Lives at `project/actions/<app-key>/views/<module>.md` with a routing registry at `views/_index.md`. For web apps, use `pages-template.md` instead. Mobile apps reuse the shared backend API — no duplicated business logic.

Layout contract: `royascaff/engine/project-layout.md`. Each view has a `VW-<MODULE>-NN` ID. Reference endpoints by `EP-<MODULE>-NN` IDs.

> Verbose guidance → `references/views-template-guide.md`

## Schema — `views/<module>.md`

```md
# Views — {App Name} · {ModuleName}

### ScreenName `VW-MODULE-NN`

- Route/Navigation: `ScreenName` (stack | bottom-tab | modal | drawer)
- Status: planned | partial | done | deferred
- Components: `WidgetCard`, `FilterChip`
- Service: `ResourceApi` → EP-RESOURCE-01 (GET /resource)
- Guard: `authenticated` | `role:admin` | `none`
- Platform: pull-to-refresh, offline cache, push notifications
- Notes: read-only on mobile; native chart library
```

Status: `planned` · `partial` · `done` · `deferred` (see `royascaff/engine/conventions.md`). New screens default to `planned`; `deferred` states its reason in Notes.

## Registry — `views/_index.md`

Use `royascaff/engine/templates/index-template.md`. One row per module file.

## Example — `views/dashboards.md`

```md
# Views — Customer Mobile App · Dashboards

### Dashboard Viewer

- Route/Navigation: `DashboardViewer` (stack, pushed from Projects tab)
- Status: done
- Components: `WidgetCard`
- Service: `DashboardsApi` → EP-DASHBOARDS-01 (GET /dashboards/:id), EP-DASHBOARDS-02 (GET /dashboards/:id/widgets/:wid/data)
- Guard: `authenticated`
- Platform: pull-to-refresh; native charts (no WebView); offline read-only from cached payload
- Notes: read-only on mobile — no create/edit; RTL layout when required by product i18n

### Notifications List

- Route/Navigation: `Notifications` (bottom-tab)
- Status: planned
- Components: `NotificationItem`, `EmptyState`
- Service: `NotificationsApi` → EP-NOTIFICATIONS-01 (GET /notifications), EP-NOTIFICATIONS-02 (PATCH /notifications/read)
- Guard: `authenticated`
- Platform: push notifications; badge count on tab icon
- Notes: mark-all-read action; swipe-to-dismiss individual items
```
