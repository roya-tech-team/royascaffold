# PollPulse — RoyaScaff Engine 1.3 Concept 2 Demo

This is the v1.2 PollPulse application migrated to the v1.3 canonical knowledge model. The application code is intentionally unchanged; the `project/` directory demonstrates how v1.3 makes product concepts, architecture, interfaces, DTOs, services, data, workflows, code ownership, decisions, and changes traceable.

## Validate and compile context

From `engine-1.3-sdlc-concept2/`:

```bash
npm install
npm run validate:demo
npm run index:demo
npm run context:demo
```

The example active task is `TASK-POLLS-EDIT-01`. It proposes poll editing without changing the application yet. Its generated Context Manifest and Context Pack appear inside that change's `execution/context/` directory.

## Run PollPulse

The API requires Node.js 22.5 or newer because it uses the built-in `node:sqlite` module.

```bash
cd apps/api
copy .env.example .env
npm install
npm run dev
```

In a second terminal:

```bash
cd apps/web
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`; the API runs at `http://localhost:3001`.

## Knowledge layout

```text
project/
  system-map.md             human entry point
  profile.md                project and validator configuration
  requirements/             product behavior and rules
  architecture/             boundaries, patterns, security
  domain/                   conceptual model
  workflows/                behavior sequences
  contracts/                HTTP interfaces, DTOs, errors
  data/                     persistence model
  implementation/           components, code map, test intent
  decisions/                durable design rationale
  changes/active/           temporary change overlays and tasks
  changes/archive/          reconciled historical records
  indexes/                  generated navigation and status
```

Canonical knowledge describes the current system. A change directory describes a proposed delta. Only after verification does reconciliation update canonical knowledge and archive the change.
