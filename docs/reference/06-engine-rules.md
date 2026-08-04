# Engine rules

Sources: [engine/rules/backend-rule.md](../../engine/rules/backend-rule.md) and [engine/rules/frontend-rule.md](../../engine/rules/frontend-rule.md)

Generic, product-agnostic coding conventions. Follow them unless project-specific docs or already-implemented patterns override.

Project-specific facts live in `project/profile.md`; project-specific rules live in `project/rules.md`. If you find yourself writing the same "project-specific" rule in every project, it belongs here instead.

## Backend

### Core principles

- Use a structured API framework with module boundaries and dependency injection — NestJS, Fastify, Spring Boot, or similar
- Use framework conventions: modules, controllers, services, guards, interceptors, pipes, DTOs
- All persistence goes through repositories, never directly in controllers
- If a data model reference exists, treat it as the source of truth for entities, relationships, and naming
- Use static typing for request and response contracts, domain models, repository interfaces, and config objects

### Layered architecture

```text
controller -> service -> repository -> model
```

| Layer | Responsibility |
|-------|----------------|
| Controller | HTTP transport: parse input, call services, map responses |
| Service | Business logic, cross-entity validation, workflow orchestration |
| Repository | Queries, transactions, persistence details |
| Model / Schema | Structure, constraints, indexes |

Controllers may use multiple services; services may use multiple repositories. Controllers must not contain business rules or direct database access. Define explicit interfaces for repositories, integration providers, and complex domain services.

This layering is checked with zero tolerance by verification check 12.

### Feature modules

```text
src/modules/<feature>/
  controllers/
  dto/
  schemas/
  repositories/
  services/
  interfaces/
  mappers/
  <feature>.module.ts
```

Shared infrastructure:

```text
src/
  common/       (interceptors, filters, guards, decorators, pipes, utils, constants)
  config/
  database/
  integrations/
  modules/
```

Separation of concerns: **transport** (routing, status codes, serialization), **domain** (rules, invariants, workflows), **persistence** (queries, indexes, transactions), **integration** (external APIs, queues, storage, email, AI providers).

### Controllers

Transport only: receive requests, parse params, query, and body, call services, return response DTOs. Never implement business rules, build queries, or call third-party SDKs directly. Use DTOs for create body, update body, list query filters, and route params. Validate at the boundary. Use consistent response shapes. Selector endpoints return minimal projections.

#### REST defaults

| Route | Purpose |
|-------|---------|
| `GET /resources` | Paginated list with filters and sorting |
| `GET /resources/lite` | Minimal list for selectors |
| `GET /resources/:id` | Full details |
| `POST /resources` | Create |
| `PUT` or `PATCH /resources/:id` | Update |
| `DELETE /resources/:id` | Delete |
| `POST /resources/:id/<action>` | Workflow actions, named by intent — `approve`, `publish`, `upload` |

### Services

All domain rules live here: lifecycle, state transitions, cross-entity validation, calculations, orchestration. **The backend is the source of truth** — never rely on frontend calculations. Services orchestrate and repositories persist, so no low-level query syntax or vendor SDK details belong in a service. Use constructor injection for testability. Design external side effects for safe retries and idempotency.

### Repositories

Own all data access: CRUD, filtered and paginated queries, lite projections, relation loading, transactions. Hide persistence details so services do not depend on ORM-specific APIs. List methods support pagination, sorting, filtering, text search, date ranges, and relation filters where appropriate. Define indexes for frequent filters, sorts, and unique constraints.

### Schema and data model

One schema per aggregate, collection, or table, kept close to the owning feature module. Enable `createdAt` and `updatedAt` on persistent entities. Use enums for statuses, roles, categories, and fixed vocabularies. Snapshot historical values on transactional records when referenced data can change — pricing, names. Store metadata in the database and binaries in object storage.

### Validation

Validate at the API boundary and again in services for cross-field and domain rules. Cover required fields, types and formats, enums, numeric ranges, string lengths, safe query params, and ID format. Return clear field-level errors.

### Security

- **Auth** — support login, registration, password reset, and token refresh as needed, using JWT, session cookies, or OAuth
- **Authorization** — protect APIs by default; public routes must be explicit and minimal; role and permission checks at the service or guard layer
- **Secrets** — never hardcoded; read from env or a secrets manager; validate at startup; support rotation
- **Passwords** — never plain-text; bcrypt or argon2; never logged
- **Input safety** — validate and sanitize all input, parameterize queries, enforce size limits, validate upload content types
- **Output safety** — no stack traces or internal paths to clients, avoid over-fetching sensitive fields, redact PII
- **Transport** — HTTPS only in production, secure cookie flags, explicit CORS (never `*` with credentials), security headers, rate-limited auth endpoints
- **Dependencies** — keep updated and scan for vulnerabilities in CI

### Performance

Paginate all list endpoints — never unbounded result sets. Use projection and lite queries for selectors and dashboards. Avoid N+1 queries. Cache read-heavy, slow-changing data with explicit invalidation. Index fields used in filters, sorts, and unique constraints. Prefer cursor-based pagination for very large datasets. Use transactions only where consistency requires them. Offload heavy reporting to read replicas or async jobs.

Move slow or unreliable work off the request path — email, file processing, reports, webhooks, AI inference — using queues with retries, dead-letter handling, and idempotency. Set timeouts on external calls, retry with backoff where safe, and circuit-break on failure. Stream large uploads and downloads, compress responses, and store large files in object storage. Measure before optimizing.

### Third-party integrations

Use the **adapter pattern**: a provider service wrapping the vendor SDK, plus a domain service orchestrating the business use. Group by capability under `integrations/{storage,mail,messaging,payments,ai,webhooks}/`. No direct SDK calls from controllers. Credentials and endpoints come from config, never code constants.

### Configuration

Centralize in a dedicated config module with a typed `config.ts` and `env.validation.ts` for startup validation. Categories: database, auth secrets, port and URL, storage, email, AI, feature flags. Fail fast at startup on missing critical config. Use feature flags for incomplete or risky features rather than scattered env checks.

### Error handling

| Status | Use for |
|--------|---------|
| `400` | Validation failures, malformed input |
| `401` | Missing or invalid authentication |
| `403` | Authenticated but not authorized |
| `404` | Resource not found |
| `409` | Conflict — unique constraint, invalid state transition |
| `422` | Semantically invalid but well-formed input |
| `429` | Rate limit exceeded |
| `500` | Unexpected server errors |

Use global exception filters or middleware rather than repetitive try/catch per controller. Return the consistent error shape from [Conventions](04-conventions.md). Log full details server-side and return safe messages to clients.

### Logging and observability

Structured logging for auth events, entity changes, integration failures, job outcomes, and slow requests. Propagate a correlation or request ID through logs and downstream calls. Expose liveness and readiness endpoints, dependency health, and metrics for latency, error rate, and queue depth. Never log passwords, tokens, credit cards, government IDs, or unnecessary PII.

### Testing

**Unit** — services with mocked repositories and integrations, focusing on rules, edge cases, and state transitions. **Integration** — repositories against a real or in-memory database when query correctness matters. **E2E** — auth flows, main CRUD, permission boundaries, workflow endpoints. Co-locate or mirror the source structure and name tests by behavior.

### Naming

Singular class names, plural route names. DTOs are `Create<Entity>Dto`, `Update<Entity>Dto`, `List<Entity>QueryDto`. Repositories are `<Entity>Repository`. Services are `<Entity>Service`, or `<Domain>Service` for cross-cutting logic. Module names align with business capabilities, not UI page names.

### Backend do-not list

- Put business logic in controllers
- Access the database or ORM directly from controllers
- Hardcode secrets, URLs, or environment-specific values
- Couple domain services to vendor SDKs
- Treat frontend calculations as the source of truth
- Skip input validation
- Create god-services mixing unrelated domains
- Return unbounded lists or load unbounded relations
- Log secrets or sensitive personal data

## Frontend

### Core principles

- Use a structured SPA or SSR framework with component boundaries, routing, and DI — Angular, React, Vue
- Use framework conventions: standalone components, route config, services, hooks, or stores, guards, interceptors, typed models
- Use static typing for API models, route params, form values, and shared UI prop contracts
- **The frontend consumes the API — it does not own business rules.** Display calculated values from the backend.

### Layered structure

```text
page/view -> feature service -> HTTP client -> API
page/view -> shared components
core -> used by pages and services
```

| Layer | Responsibility |
|-------|----------------|
| Pages / views | Route-bound screens, orchestration, local UI state |
| Feature services | HTTP calls, feature state, API data mapping |
| Shared components | Reusable presentational UI |
| Core | Auth, config, guards, interceptors, layouts, global services |

Feature-first organization:

```text
src/app/
  core/    (auth, guards, interceptors, layouts, services, models, config)
  shared/  (components, directives, pipes, utils, ui)
  pages/   (dashboard, auth, <feature-a>, <feature-b>)
```

Do not mix unrelated business logic into generic shared folders. Split smart from presentational: data loading, route params, and orchestration belong to the page or smart component; reusable display sections belong to smaller presentational components. Avoid mega-components owning an entire product area.

Application shell: authenticated routes use a main layout with header, navigation, and content area; auth and marketing pages use a separate lightweight layout.

### Routing

Nested routes with a shell — a parent route with children for authenticated pages. Structure as `/auth/{login,register,reset-password}` plus `/app/{dashboard,features...}`. Protect routes with guards: auth for private routes, role or permission for sensitive screens. Lazy load feature route groups. Routes must be bookmarkable and shareable, with no manual page-switching state bypassing the router.

### Data and API integration

Never hardcode API URLs, keys, or environment-specific values in components. Use environment or config files for base API URL, app version, feature flags, locale, and analytics IDs.

**Components must not call HTTP clients directly** — each feature has a dedicated service. Standard service methods: `getList`, `getLiteList`, `getById`, `create`, `update`, `remove`. Use the right endpoint for the job: paginated lists for tables, lite for dropdowns and pickers, details for view and edit. Do not fetch full payloads to populate selectors when a lite endpoint exists.

Define types for API payloads and map to view models in services when needed. Centralize cross-cutting HTTP in interceptors: auth token, refresh flow, global errors, correlation IDs, base URL.

This is the rule behind verification check 13, **frontend third-party isolation**, which is enforced with zero tolerance.

### Forms

Use structured form libraries for non-trivial forms. Every form supports field-level validation messages, a loading and disabled state while submitting, backend error display, and sensible defaults and reset.

**Five fields or fewer** — a modal or drawer is acceptable. **More than five, or complex** — use a dedicated page.

### Tables and lists

Use paginated server-side lists for growable entities. Support pagination, filters, sorting, a loading skeleton, and an empty state. A standard list page has a title, primary actions, filters, a data table, and row actions. Never load unbounded lists; use lite endpoints for selectors.

### UI library and design system

Use one primary UI library consistently for form controls, tables, dialogs, toasts, tabs, and pickers. Do not mix competing libraries without reason. Use an icon library for common icons and custom SVGs only for brand assets. Maintain consistent design tokens for spacing, typography, button variants, input heights, and card layouts, defined in global styles or theme config rather than as magic numbers.

### Styling

Global styles cover the typography baseline, theme variables, layout utilities, library overrides, and RTL fixes. Feature-specific styling stays with the component. Target the required breakpoints, ensuring core workflows work on desktop and tablet at minimum. Prefer class-based or token-based styling over inline style sprawl.

### Internationalization and RTL

Do not hardcode user-facing strings; use one i18n library project-wide. RTL support must affect layout, navigation, icon alignment, spacing, tables, dialogs, and forms. Test both directions for complex UI such as dropdowns, overlays, calendars, and frozen columns. Format dates, numbers, and currencies with locale-aware APIs. Even single-language projects should centralize strings where practical.

### State management

Start with framework-native patterns — services, context, signals — before reaching for a global state library. Auth state goes in a core auth service; locale and direction in core i18n; page state in the feature service or component.

Add dedicated state management such as NgRx, Redux, Zustand, or Pinia only when many components share complex async state, optimistic updates are common, or time-travel debugging genuinely helps. Keep a single source of truth per concern.

### Security

Store tokens securely, preferring httpOnly cookies; clear on logout; handle expired sessions gracefully. Hide UI the user cannot use, but assume the API enforces permissions — **a frontend guard is UX, not security**. Avoid `innerHTML` and `dangerouslySetInnerHTML` with untrusted content; sanitize rich text. Never log tokens, passwords, or PII to the console in production. Follow backend CSRF requirements when using cookie-based auth. Never embed private API keys in frontend bundles.

### Performance

Lazy load routes and heavy features; code-split large libraries. Avoid unnecessary re-renders using OnPush, memoization, or signals; use stable keys; virtualize long lists. Debounce search inputs, cancel in-flight requests on param change, and cache stable data with a TTL. Optimize images and use SVGs for icons. Use skeleton loaders and optimistic UI for perceived performance.

### Accessibility

Semantic HTML and landmark regions, keyboard navigation for core flows, labels associated with form controls, visible focus states, contrast requirements met, and `aria-*` attributes when native semantics are insufficient.

### Required UX states

Every data screen must handle all five:

| State | Behavior |
|-------|----------|
| Loading | Spinner, skeleton, or disabled actions |
| Empty | Clear message and an optional primary action |
| Validation error | Field-level or a summary from the backend |
| Server error | User-safe message; details logged server-side |
| Success | Toast, banner, or inline confirmation |

Use a consistent notification service for transient feedback. Never fail silently and never show raw stack traces to users.

This is what verification check 10 tests.

### Testing

**Unit** — services, utilities, guards, and complex component logic with mocked dependencies. **Component** — form validation, conditional rendering, error states. **E2E** — login and logout, main CRUD, permission-restricted routes, key workflows. **Visual and direction** — verify RTL and LTR layouts for complex screens when i18n is required.

### Naming

Page folders match business capabilities as `pages/<feature>/`. Services are `<Entity>Service` or `AuthService`. Components are `<Feature><Purpose>Component`. Models are `<Entity>`, `Create<Entity>Request`, `List<Entity>Response`. Route paths are kebab-case, aligned with API resource names.

### Mobile adaptation

The same architectural principles apply to React Native, Expo, Flutter, SwiftUI, and Compose:

- **Screens** replace pages — route-bound, specified in `views/<module>.md`
- Use the platform's native component library and design system
- Use the platform navigator — stack, bottom-tab, drawer, modal — keeping screens deep-linkable
- Same layering: screen → data hook or service → HTTP client → API
- Consume the same shared backend API; never duplicate business logic or call external providers directly
- Document push notifications, offline and caching behavior, gestures, biometrics, and permissions per screen
- Handle loading, empty, error, and success states; respect RTL and localization

### Frontend do-not list

- Hardcode API base URLs or secrets
- Call backend endpoints directly from templates or page components
- Put all screens in one component
- Mix unrelated feature logic into `shared`
- Use modal forms for large or complex entities
- Ignore loading, empty, and error states
- Create inconsistent CRUD patterns across features
- Store auth tokens insecurely when safer options exist
- Render untrusted HTML without sanitization
- Treat frontend role checks as sufficient security

## Related

- [Conventions](04-conventions.md) — the API and UI defaults specs inherit
- [Verification checks](08-verification-checks.md) — checks 12 and 13 enforce the layering and isolation rules
- [Templates](05-templates.md)
- [Reverse engineer](../flows/05-reverse-engineer.md) — uses these rules as the standard for drift detection
