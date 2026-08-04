# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: new-module
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-INIT
- **part**: 1/3
- **depends-on**: —
- **blocks**: change-20260805-120002-init-auth
- **pack-status**: merged

## Scope
- Module(s): Foundation
- Service(s): SVC-FOUND-01
- Endpoint(s): EP-FOUND-01
- Page(s)/View(s): web: PG-FOUND-01, PG-FOUND-02

## Description
Bootstrap Express API with SQLite, CORS, error handling, health endpoint. Bootstrap React app with routing shell, API client, protected routes, and dashboard placeholder.

## Acceptance Criteria
1. GET /health returns `{ status: "ok" }`
2. SQLite schema file created on first run
3. Web app loads at `/` and redirects unauthenticated users to login
4. Authenticated shell renders nav and dashboard route

## Notes
First pack — no business modules yet.
