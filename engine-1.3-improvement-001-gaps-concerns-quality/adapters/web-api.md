---
adapter_id: web-api
adapter_version: 1.3.1
axes: [surface:api, technology:http]
requires: [generic]
incompatible_with: []
precedence: 20
---

# Web API Compatibility Adapter

Optional adapter for HTTP APIs. It provides vocabulary and defaults, not product requirements.

- Entry points: server bootstrap, routers/controllers/handlers.
- Contracts: request params/body/query, response, errors, auth, events/webhooks.
- Common components: handler/controller, application/domain service, policy, repository, adapter/provider, middleware/guard, job/consumer.
- Checks: route/contract match, authorization, validation, layering/dependency rules, migration and integration behavior.
- Generated/excluded paths are declared in the project profile.
- JWT, REST prefixes, envelopes, pagination, framework folders, and exact commands are project decisions—not core engine law.

## Quality-by-design contributions

- **Discovery:** consumers, compatibility promise, authorization owner, failure and
  retry semantics, traffic/latency expectations, observability, and rollback needs.
- **Pattern candidates:** versioning/compatibility, validation boundary, idempotency,
  pagination, concurrency, integration isolation, and migration rollout. Select only
  what the change requires and record alternatives/failure modes.
- **Criteria:** consumer-observable request/response/error behavior, authorization,
  compatibility, reliability, and routed performance outcomes.
- **Evidence:** project-bound contract/integration/security/load runners; absence never
  passes a criterion.

Contributions are recommendations until the QDC/project decision makes them required.
