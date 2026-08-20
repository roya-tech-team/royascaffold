# System Profile

## Product
- **Name**: PollPulse
- **Type**: SaaS tool
- **Users**: team members (authenticated users who create and vote on polls)

## Applications
| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `api` | PollPulse API | api | `apps/api` | Express 4 | — | JWT |
| `web` | PollPulse Web | web | `apps/web` | React 18 + Vite 5 | Tailwind CSS 3 | same-backend JWT |

## Repositories
| Repo | Role | Location | Branch |
|------|------|----------|--------|
| `apps/api` | Backend API | `royascaffold/example-v1.2/apps/api` | main |
| `apps/web` | Web client | `royascaffold/example-v1.2/apps/web` | main |

## Tech Stack
**Backend**: Node.js 22+, Express 4, SQLite (built-in `node:sqlite`), bcrypt, jsonwebtoken
**Frontend**: React 18, Vite 5, React Router 6, Tailwind CSS 3

## Brand Tokens
| Token | Value | Role |
|-------|-------|------|
| `--color-primary` | `#6366f1` | Buttons, links, accents (indigo-500) |
| `--color-primary-dark` | `#4f46e5` | Hover states (indigo-600) |
| `--color-secondary` | `#8b5cf6` | Secondary accents (violet-500) |
| `--color-bg` | `#f8fafc` | Page background (slate-50) |
| `--color-surface` | `#ffffff` | Cards, panels |
| `--color-text` | `#0f172a` | Primary text (slate-900) |
| `--color-muted` | `#64748b` | Secondary text (slate-500) |
| `--color-success` | `#22c55e` | Success states |
| `--color-danger` | `#ef4444` | Errors, destructive actions |
| `--font-sans` | `Inter, system-ui, sans-serif` | Body text |
| `--radius-md` | `0.5rem` | Card and button radius |

## Environments
- Config: `apps/api/.env` (copy from `.env.example`)
- API URL (dev): `http://localhost:3001`
- Web URL (dev): `http://localhost:5173`
- Secrets: `JWT_SECRET`, `PORT` (default 3001)
- Env list: `development`, `production`

## Integrations
| Provider | Purpose | Notes |
|----------|---------|-------|
| — | — | No external integrations in this example |

## System Conventions
- Single language (English) — no i18n in this example
- Blueprint root: `royascaffold/example-v1.2/project/`
- Code root: `royascaffold/example-v1.2/apps/`
- API is the single source of truth for business rules; web is display-only
