# System Profile

## Product
- **Name**: Knowledge Universe
- **Type**: tool
- **Users**: explorer (anonymous; no auth in MVP)

## Applications
| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `web` | Knowledge Universe Web | web | `knowledge-universe` (workspace root) | React 19 + TypeScript + Vite | Tailwind CSS + Framer Motion + R3F/Drei | none (MVP) |

## Repositories
| Repo | Role | Location | Branch |
|------|------|----------|--------|
| `knowledge-universe` | SPA + 3D graph client | workspace root (`/`) | `main` |

## Tech Stack
**Backend**: N/A for MVP (local mock/generated graph only)  
**Frontend**: React + TypeScript (strict) + Vite + Three.js + `@react-three/fiber` + `@react-three/drei` + Zustand + Tailwind CSS + Framer Motion  
**DB**: N/A — in-memory graph data  
**State**: Zustand for transient UI/graph interaction state; graph dataset kept separate from UI state  
**3D**: React Three Fiber scene; prefer InstancedMesh / BufferGeometry / efficient materials for scale-ready rendering

## Brand Tokens
| Token | Value | Role |
|-------|-------|------|
| `--ku-bg-deep` | `#05070d` | Near-black / deep navy canvas base |
| `--ku-bg-radial` | `#0a1224` → transparent | Subtle radial atmosphere |
| `--ku-text` | `#e8eef8` | Primary UI text |
| `--ku-text-muted` | `#8b9bb4` | Secondary labels |
| `--ku-glass-bg` | `rgba(12, 18, 32, 0.55)` | Glass panel fill |
| `--ku-glass-border` | `rgba(255, 255, 255, 0.12)` | Glass panel edge |
| `--ku-person` | `#5b8cff` | Person nodes |
| `--ku-organization` | `#3dd6c6` | Organization nodes |
| `--ku-concept` | `#c084fc` | Concept nodes |
| `--ku-technology` | `#38bdf8` | Technology nodes |
| `--ku-place` | `#fbbf24` | Place nodes |
| `--ku-event` | `#fb7185` | Event nodes |
| `--ku-document` | `#94a3b8` | Document nodes |
| `--ku-edge` | `rgba(160, 180, 210, 0.35)` | Default edge color |
| `--ku-accent` | `#7dd3fc` | UI accent / focus |

**Typography**: Distinctive sans for UI chrome (avoid Inter/Roboto/Arial/system defaults); small glass labels for node names.  
**Motion**: Smooth camera damping; subtle hover/select transitions; Framer Motion for 2D panel/chrome enter/exit.  
**Visual reference**: `docs/reference/3d-network-reference.png`

## Environments
- Config: Vite env (`import.meta.env`) — no API URL required for MVP
- Secrets: none
- Env list: `development`, `production` (static build)

## Integrations
| Provider | Purpose | Notes |
|----------|---------|-------|
| — | None in MVP | All data local; no third-party HTTP |

## System Conventions
- **i18n**: English only (MVP)
- **Source of truth**: `project/` blueprint; graph domain types live in `src/features/graph/types/`
- **App reuse**: Single web app; feature-first under `src/features/graph/`
- **No Angular / Vue**
- **No backend call chain** until a future change introduces an API app — pages use local graph modules, not `EP-*` endpoints
- **Architecture target structure** (may be refined during foundation pack):

```text
src/
  app/App.tsx
  components/layout/  ui/
  features/graph/
    components/
    data/
    hooks/
    state/
    types/
    config/
  lib/three/
  styles/
  main.tsx
```
