---
schema: royascaff/project-profile/v1
project: PollPulse
version: 1.3.0-concept.2-demo
source_roots:
  - ../apps/api/src
  - ../apps/web/src
code_extensions:
  - .js
  - .jsx
code_map_exclude: []
owners:
  - pollpulse-team
adapters:
  - node-express-react
commands:
  validate: node ../engine-1.3-sdlc-concept2/bin/royascaff13.js validate project .
  api_start: npm --prefix ../apps/api start
  web_build: npm --prefix ../apps/web run build
---

# PollPulse Project Profile

PollPulse is a self-contained team polling SaaS example. The API is Node.js 22.5+, Express 4, JWT, and SQLite. The web client is React 18, Vite 5, React Router 6, and Tailwind CSS 3.

The API is the authority for business rules. The web client owns interaction and presentation, and communicates only through `apps/web/src/core/api.js`.
