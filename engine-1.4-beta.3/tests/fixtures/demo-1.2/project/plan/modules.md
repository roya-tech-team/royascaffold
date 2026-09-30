# Modules & Features

## 1. Foundation
- Scope: BE `apps/api/src/` (app bootstrap, DB, middleware) + FE `apps/web/src/` (shell, routing, API client)
- Audience: all users
- Entities: —
- Depends on: —

### Features
1. **API Bootstrap** [backend-only] — Express app, SQLite connection, error handler, CORS, health check
2. **Web App Shell** [frontend] — root layout, navigation, protected routes, API client with JWT interceptor
3. **Shared Config** [both] — environment-based API URL and JWT storage

### Notes
- Foundation pack runs first; no business entities yet

---

## 2. Auth
- Scope: BE `apps/api/src/modules/auth/` + FE `apps/web/src/pages/auth/`
- Audience: public (login/register) and authenticated users
- Entities: `users`
- Depends on: Foundation

### Features
1. **User Registration** [both] — create account with name, email, password
2. **User Login** [both] — authenticate via email/password, issue JWT
3. **Auth Middleware** [backend-only] — JWT validation on protected routes
4. **Session Persistence** [frontend] — store JWT in localStorage, attach to API requests

### Notes
- Auth pages use a lightweight layout without the main app nav

---

## 3. Polls
- Scope: BE `apps/api/src/modules/polls/` + FE `apps/web/src/pages/polls/`
- Audience: authenticated users
- Entities: `polls`, `poll_options`, `votes`
- Depends on: Auth

### Features
1. **Create Poll** [both] — form with title, description, 2–5 options
2. **List Polls** [both] — paginated list with status badge and total votes
3. **Poll Detail & Vote** [both] — view options, cast vote on open polls
4. **Poll Results** [both] — percentage bars with vote counts
5. **Close Poll** [both] — creator closes poll; status becomes closed

### Notes
- One vote per user per poll enforced at service layer
