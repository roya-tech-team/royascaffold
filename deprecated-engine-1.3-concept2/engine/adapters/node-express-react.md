# Node + Express + React Adapter

This adapter exists to validate the PollPulse example; it does not change the generic methodology.

## Discovery

- Node apps: `package.json`; commands from `scripts`.
- Express boundaries: route registrations, routers, controllers/handlers, middleware.
- Persistence: repository/database modules and SQL/schema initialization.
- React boundaries: route pages, context/providers, feature API clients, shared components.

## Default classifications

- `*.controller.js`, `*.routes.js` → transport components/contracts.
- `*.service.js` → application/domain component; inspect actual responsibility.
- `*.repository.js`, database module → persistence component.
- middleware/auth/guards → security component.
- React pages → UI components tied to workflows/requirements.
- API client/auth context → frontend feature/core components.

## Suggested checks

- `node --check` for JavaScript entry/source files.
- package-specific build commands when declared.
- project test commands when declared; absence of tests is a finding, never an implicit PASS.
