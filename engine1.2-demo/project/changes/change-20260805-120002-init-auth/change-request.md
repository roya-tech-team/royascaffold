# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: new-module
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-INIT
- **part**: 2/3
- **depends-on**: change-20260805-120001-init-foundation
- **blocks**: change-20260805-120003-init-polls
- **pack-status**: merged

## Scope
- Module(s): Auth
- Service(s): SVC-AUTH-01, SVC-AUTH-02
- Endpoint(s): EP-AUTH-01..03
- Page(s)/View(s): web: PG-AUTH-01, PG-AUTH-02

## Description
Implement user registration, login, JWT middleware, and auth pages.

## Acceptance Criteria
1. POST /auth/register creates user and returns JWT
2. POST /auth/login returns JWT for valid credentials
3. GET /auth/me returns current user when authenticated
4. Login and register pages work end-to-end

## Notes
Adds `users` table to SQLite schema.
