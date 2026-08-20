---
document_id: DOC-POLLPULSE-PROFILE
title: PollPulse project profile
layer: profile
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
project_name: PollPulse
project_kind: mixed
artifact_profile: modular
adapters: [web-api, web-ui]
source_roots: [../example-v1.2/apps/api, ../example-v1.2/apps/web]
source_extensions: [.js, .jsx, .css, .html, .json, .example]
default_context_tokens: 12000
---

# PollPulse Project Profile

## Applications

| Key | Type | Framework/runtime | Source | Authority |
|-----|------|-------------------|--------|-----------|
| api | HTTP API | Node.js 22.5+, Express 4 | `../example-v1.2/apps/api` | business rules and persistence |
| web | browser UI | React 18, Vite 5, Tailwind 3 | `../example-v1.2/apps/web` | interaction and presentation |

## Data and authentication

- SQLite through built-in `node:sqlite`; runtime file `apps/api/data/pollpulse.db` is generated and not present in source.
- Bearer JWT expires in 7 days; API secret from `JWT_SECRET` with an unsafe development fallback.
- Web stores JWT in `localStorage`; this is recorded as accepted migration debt, not a recommended engine default.

## Commands observed

| App | Purpose | Command |
|-----|---------|---------|
| api | start | `npm start` |
| api | development | `npm run dev` |
| web | development | `npm run dev` |
| web | build | `npm run build` |

Neither package declares automated tests, lint, typecheck, security scan, or deploy commands.

## Environments and configuration

- API: `PORT`, `JWT_SECRET`, `CORS_ORIGIN`; default port 3001.
- Web: `VITE_API_URL`; default `http://localhost:3001`; dev port 5173.
- Documented environments: development and production. No production deployment manifest is present.

## Integrations and exclusions

- No external product integrations.
- `node_modules/`, generated build output, and runtime SQLite data are excluded from source inventory.
- `package-lock.json` is classified as generated dependency lock state in the code map.

## Brand

Indigo primary `#6366f1`, violet secondary `#8b5cf6`, slate background/text, Inter/system sans, medium radius.

