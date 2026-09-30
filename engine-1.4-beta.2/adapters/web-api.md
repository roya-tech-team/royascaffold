# Adapter · web-api

> **What:** guidance for HTTP APIs and backend services
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- Each endpoint is a contract (`CTR-`): method and path, input, output, errors, who may call it.
- Layers: route/controller (transport) → service (business rules) → repository (storage). Name the component for each.
- Data: entities, constraints, indexes and migrations in the data document (`royascaff new doc data`).
- Security: who is allowed to do what, which data is sensitive, and how long it is kept (`royascaff new doc security` when it matters).
- Slow or unreliable work (email, files, reports, AI calls) runs off the request path, with retries and idempotency.

## Rules

- Controllers hold no business rules and no direct database access.
- Validate input at the boundary; services check cross-field and domain rules.
- Every API is protected unless it is explicitly public; permissions are checked in the service or guard layer.
- Lists are paginated; no unbounded queries; avoid N+1 queries.
- Secrets come from the environment; passwords are hashed; tokens and personal data never reach the logs.
- Errors return a safe message and a stable shape; stack traces never reach the client.
- External calls have timeouts and a single provider component.

## Check

- Runner: build, typecheck, lint and tests pass, including contract tests for changed endpoints.
- Each contract change has a test for success and for at least one failure (validation or permission).
- Migrations run forward on a copy of real-shaped data before Record.

## Words

endpoint, endpoints, controller, repository, schema, sql, database, json, api, microservice
