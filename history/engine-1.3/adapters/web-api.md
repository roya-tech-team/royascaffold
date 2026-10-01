# Web API Compatibility Adapter

Optional adapter for HTTP APIs. It provides vocabulary and defaults, not product requirements.

- Entry points: server bootstrap, routers/controllers/handlers.
- Contracts: request params/body/query, response, errors, auth, events/webhooks.
- Common components: handler/controller, application/domain service, policy, repository, adapter/provider, middleware/guard, job/consumer.
- Checks: route/contract match, authorization, validation, layering/dependency rules, migration and integration behavior.
- Generated/excluded paths are declared in the project profile.
- JWT, REST prefixes, envelopes, pagination, framework folders, and exact commands are project decisions—not core engine law.

