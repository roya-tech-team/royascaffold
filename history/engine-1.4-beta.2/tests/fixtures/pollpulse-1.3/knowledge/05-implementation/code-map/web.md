---
document_id: DOC-POLLPULSE-CODEMAP-WEB
title: PollPulse web code map
layer: implementation
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Web Code Map

| Path | Kind | Blueprint owner | Relationship | Runtime | Status | Notes |
|------|------|-----------------|--------------|---------|--------|-------|
| `../example-v1.2/apps/web/.env.example` | configuration example | `CMP-WEB-API-001` | defines | no | implemented | VITE_API_URL |
| `../example-v1.2/apps/web/index.html` | HTML entry | `CMP-WEB-BOOT-001` | configures | yes | implemented | root mount/document |
| `../example-v1.2/apps/web/package.json` | package config | `CMP-WEB-BOOT-001` | configures | no | implemented | scripts/dependencies |
| `../example-v1.2/apps/web/package-lock.json` | dependency lock | `CMP-WEB-BOOT-001` | generated | no | implemented | npm lock state |
| `../example-v1.2/apps/web/postcss.config.js` | build config | `CMP-WEB-BOOT-001` | configures | no | implemented | PostCSS/Tailwind |
| `../example-v1.2/apps/web/tailwind.config.js` | design/build config | `CMP-WEB-BOOT-001` | configures | no | implemented | paths/colors/font |
| `../example-v1.2/apps/web/vite.config.js` | build/dev config | `CMP-WEB-BOOT-001` | configures | no | implemented | React plugin/port |
| `../example-v1.2/apps/web/src/main.jsx` | runtime entry | `CMP-WEB-BOOT-001` | implements | yes | implemented | React providers/mount |
| `../example-v1.2/apps/web/src/App.jsx` | route table | `CMP-WEB-ROUTER-001` | implements | yes | implemented | public/protected routes |
| `../example-v1.2/apps/web/src/index.css` | global styles | `CMP-WEB-BOOT-001` | supports | yes | implemented | Tailwind/global body |
| `../example-v1.2/apps/web/src/core/api.js` | API/session adapter | `CMP-WEB-API-001` | implements | yes | implemented | fetch/token/contracts |
| `../example-v1.2/apps/web/src/core/authContext.jsx` | auth state | `CMP-WEB-AUTH-001` | implements | yes | implemented | restore/login/register/logout |
| `../example-v1.2/apps/web/src/core/ProtectedRoute.jsx` | route guard | `CMP-WEB-PROTECTED-001` | implements | yes | implemented | loading/redirect |
| `../example-v1.2/apps/web/src/components/AuthLayout.jsx` | shared auth layout | `CMP-WEB-AUTH-LAYOUT-001` | implements | yes | implemented | branding/card/link |
| `../example-v1.2/apps/web/src/components/Layout.jsx` | app shell | `CMP-WEB-LAYOUT-001` | implements | yes | implemented | nav/user/logout/outlet |
| `../example-v1.2/apps/web/src/components/PollCard.jsx` | summary component | `CMP-WEB-POLL-CARD-001` | implements | yes | implemented | card + status badge |
| `../example-v1.2/apps/web/src/components/PollResults.jsx` | results component | `CMP-WEB-POLL-RESULTS-001` | implements | yes | implemented | counts/bars/percentages |
| `../example-v1.2/apps/web/src/pages/DashboardPage.jsx` | page | `PG-FOUND-02` | implements | yes | implemented | stats/recent/empty |
| `../example-v1.2/apps/web/src/pages/LoginPage.jsx` | page | `PG-AUTH-01` | implements | yes | implemented | login form |
| `../example-v1.2/apps/web/src/pages/RegisterPage.jsx` | page | `PG-AUTH-02` | implements | yes | implemented | registration form |
| `../example-v1.2/apps/web/src/pages/PollListPage.jsx` | page | `PG-POLLS-01` | implements | yes | implemented | list/pagination |
| `../example-v1.2/apps/web/src/pages/CreatePollPage.jsx` | page | `PG-POLLS-02` | implements | yes | implemented | create form/options |
| `../example-v1.2/apps/web/src/pages/PollDetailPage.jsx` | page | `PG-POLLS-03` | implements | yes | implemented | load/vote/close/results |

Coverage: 23/23 files under the web source root for configured extensions.

