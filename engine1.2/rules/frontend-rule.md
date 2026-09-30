# Frontend Conventions

Generic frontend (and mobile) coding conventions. Follow unless project-specific docs or implemented patterns override.

---

## Core Technology Principles

- Use a structured SPA/SSR framework with component boundaries, routing, and DI (e.g. Angular, React, Vue)
- Use framework conventions: standalone components, route config, services/hooks/stores, guards, interceptors, typed models
- Use static typing for: API models, route params, form values, shared UI prop contracts
- The frontend consumes the API — it does not own business rules; display calculated values from the backend

---

## Architecture

### Layered Structure

| Layer | Responsibility |
|-------|----------------|
| Pages/views | Route-bound screens, orchestration, local UI state |
| Feature services | HTTP calls, feature state, API data mapping |
| Shared components | Reusable presentational UI |
| Core | Auth, config, guards, interceptors, layouts, global services |

```text
page/view → feature service → HTTP client → API
page/view → shared components
core → used by pages and services
```

### Application Shell

- Main layout for authenticated routes: header, navigation, content area (router outlet)
- Auth/marketing pages use a separate lightweight layout

### Feature-First Organization

```text
src/app/
  core/ (auth, guards, interceptors, layouts, services, models, config)
  shared/ (components, directives, pipes, utils, ui)
  pages/ (dashboard, auth, <feature-a>, <feature-b>)
```

- Do not mix unrelated business logic in generic shared folders

### Smart vs Presentational Split

- Data loading, route params, orchestration → page/smart component
- Reusable display sections → smaller presentational components
- Avoid mega-components owning an entire product area

### Separation of Concerns

- **Routing** — URL structure, guards, lazy loading
- **Data access** — HTTP/services, caching, error mapping
- **Presentation** — templates, styling, user interaction
- **Domain display logic** — formatting, sorting/filter UI state (not authoritative business rules)

---

## Component Rules

- Separate files for logic, template, and styles (unless trivial/structural)
- One page component = one screen responsibility (list, details, create, edit, dashboard)
- Reusable UI in `shared/components` or design system folder
- Prefer composition over inheritance; extract repeated patterns into shared components after 2+ occurrences

---

## Routing Rules

- Nested routes with shell: parent route with children for authenticated pages
- Route structure: `/auth/{login,register,reset-password}` + `/app/{dashboard,features...}`
- Protect routes with guards: auth required for private, role/permission for sensitive screens
- Lazy load feature route groups to reduce initial bundle
- Routes must be bookmarkable/shareable — no manual page-switching state bypassing the router

---

## Data and API Integration

- Never hardcode API URLs, keys, or env-specific values in components
- Use environment/config files for: base API URL, app version, feature flags, locale, analytics IDs
- Components must not call HTTP clients directly — each feature has a dedicated service
- Standard service methods: `getList`, `getLiteList`, `getById`, `create`, `update`, `remove`
- Use the right endpoint: paginated list (tables), lite (dropdowns/pickers), details (view/edit)
- Do not fetch full payloads to populate selectors when a lite endpoint exists
- Define TypeScript types for API payloads; map to view models in services when needed
- Centralize cross-cutting HTTP in interceptors: auth token, refresh flow, global errors, correlation IDs, base URL

---

## Forms

- Use structured form libraries for non-trivial forms (reactive forms, React Hook Form, etc.)
- Every form must support: field-level validation messages, loading/disabled while submitting, backend error display, sensible defaults/reset
- **≤ 5 fields** → modal/drawer acceptable; **> 5 fields** or complex → dedicated page

---

## Tables and Lists

- Use paginated server-side lists for growable entities
- Support: pagination, filters, sorting, loading skeleton, empty state
- Standard list page: title, primary actions, filters, data table, row actions
- Never load unbounded lists; respect page size; use lite endpoints for selectors

---

## UI Library and Design System

- Use one primary UI library consistently for: form controls, tables, dialogs, toasts, tabs, pickers
- Do not mix competing libraries without reason
- Use an icon library for common icons; custom SVGs only for brand assets
- Maintain consistent design tokens: spacing, typography, button variants, input heights, card layouts
- Define tokens in global styles/theme config — avoid magic numbers

---

## Styling

- Global styles for: typography baseline, theme variables, layout utilities, library overrides, RTL fixes
- Feature-specific styling stays with the component
- Target required breakpoints; ensure core workflows work on desktop and tablet minimum
- Prefer class-based or token-based styling over inline style sprawl

---

## Internationalization and RTL

- Do not hardcode user-facing strings — use a consistent i18n library project-wide
- RTL support must affect: layout, navigation, icon alignment, spacing, tables, dialogs, forms
- Test both directions for complex UI (dropdowns, overlays, calendars, frozen columns)
- Format dates/numbers/currencies with locale-aware APIs, not manual concatenation
- Single-language projects: still centralize strings where practical

---

## State Management

- Start with framework-native patterns (services, context, signals) before global state libraries
- Auth state → core auth service; locale/direction → core i18n; page state → feature service/component
- Add dedicated state management (NgRx, Redux, Zustand, Pinia) only when: many components share complex async state, optimistic updates are common, or time-travel debugging adds value
- Single source of truth per concern — avoid duplicating server data in multiple stores

---

## Security

- Store tokens securely (httpOnly cookies preferred); clear on logout; handle expired sessions gracefully
- Hide UI user cannot use, but assume APIs enforce permissions — frontend guard is UX, not security
- Avoid `innerHTML`/`dangerouslySetInnerHTML` with untrusted content; sanitize rich text
- Never log tokens/passwords/PII to console in production
- Follow backend CSRF requirements if using cookie-based auth
- Never embed private API keys in frontend bundles — only public/client-safe keys
- Keep dependencies updated; scan for vulnerabilities in CI

---

## Performance

- Lazy load routes and heavy features; code-split large libraries; optimize bundle size
- Avoid unnecessary re-renders (OnPush, memoization, signals); use track-by/stable keys; virtualize long lists
- Debounce search inputs; cancel in-flight requests on param change; cache stable data with TTL
- Optimize images (format, size, lazy loading); use SVGs for icons; avoid unused font weights
- Use skeleton loaders, optimistic UI, and clear loading indicators for perceived performance

---

## Accessibility

- Semantic HTML and landmark regions
- Keyboard navigation for core flows
- Labels associated with form controls
- Visible focus states
- Meet contrast requirements
- `aria-*` attributes when native semantics are insufficient

---

## Error Handling and UX

Every data screen must handle:

| State | Behavior |
|-------|----------|
| Loading | Spinner, skeleton, or disabled actions |
| Empty | Clear message and optional primary action |
| Validation error | Field-level or summary from backend |
| Server error | User-safe message; log details server-side |
| Success | Toast, banner, or inline confirmation |

- Use a consistent notification/toast service for transient feedback
- Never fail silently; never show raw stack traces to users

---

## Auth Pages

- Screens: login, register (if applicable), reset/forgot password
- Use minimal layout — not the main application shell

---

## Testing

- **Unit**: services, utilities, guards, complex component logic with mocked deps
- **Component**: form validation, conditional rendering, error states
- **E2E**: login/logout, main CRUD, permission-restricted routes, key workflows
- **Visual/direction**: verify RTL/LTR layouts for complex screens when i18n required

---

## Naming

- Page folders match business capabilities: `pages/<feature>/`
- Services: `<Entity>Service`, `AuthService`
- Components: `<Feature><Purpose>Component`
- Models: `<Entity>`, `Create<Entity>Request`, `List<Entity>Response`
- Route paths: kebab-case, aligned with API resource names

---

## Mobile App Adaptation

Same architectural principles apply to mobile (React Native, Expo, Flutter, SwiftUI, Compose):

- **Screens** replace pages — route-bound, specified in `views/<module>.md`
- Use platform's native component library/design system
- Use platform navigator (stack/bottom-tab/drawer/modal) — keep screens deep-linkable
- Same layering: screen → data hook/service → HTTP client → API
- Consume the same shared backend API — never duplicate business logic or call external providers directly
- Document push notifications, offline/caching, gestures, biometrics, permissions per screen
- Handle loading/empty/error/success states; respect RTL/localization

---

## Do Not

- Hardcode API base URLs or secrets
- Call backend endpoints directly from templates/page components
- Put all screens in one component
- Mix unrelated feature logic into `shared`
- Use modal forms for large/complex entities
- Ignore loading, empty, and error states
- Create inconsistent CRUD patterns across features
- Store auth tokens insecurely when safer options exist
- Render untrusted HTML without sanitization
- Treat frontend role checks as sufficient security
