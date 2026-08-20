# New App Template — Detailed Guide

> This is the verbose reference for `../new-app-template.md`. Contains field reference, module selection guidance, and the Step 5.1b checklist.

## When to Use

- Creating a new customer-facing portal (web or mobile)
- Creating a new admin panel or internal tool
- Creating a mobile app that uses the same backend
- Creating a partner portal or any other standalone interface

The new app **reuses the existing backend** defined in `project/profile.md`. It does not duplicate business logic.

## Field Reference

### `app-name`
Short human-readable name. Used as folder/repo identifier.
Examples: `Customer Mobile App`, `Partner Portal`, `Ops Dashboard`

### `app-slug`
Lowercase kebab-case id derived from `app-name`. Used for files and repos.
The new app gets `project/actions/<app-slug>/` folder. Specs are per-module: `pages/<module>.md` (web) or `views/<module>.md` (mobile), each with `_index.md`.

### `target-platform`
| Value | Means |
|-------|-------|
| `web` | Browser-based SPA |
| `mobile-ios` | Native iOS (Swift/SwiftUI) |
| `mobile-android` | Native Android (Kotlin/Compose) |
| `mobile-cross-platform` | Cross-platform (React Native, Flutter, Expo) |
| `desktop` | Desktop app (Electron, Tauri) |

### `auth-strategy`
| Value | Means |
|-------|-------|
| `same-backend-jwt` | Uses existing auth endpoints and JWT flow |
| `separate-auth` | New auth module or OAuth provider |
| `sso` | Single sign-on via existing auth |
| `none` | Fully public, no authentication |

## Module Selection Guide

| Include value | Meaning |
|--------------|---------|
| `full` | Include all features of this module |
| `partial` | Include only listed features; fill both columns |
| `no` | Not relevant to this app |

Tips:
- Start with what the target user actually needs
- Backend-only modules (AI, Background Jobs) are always included implicitly — server-side
- Infrastructure modules (Caching, Storage, Email) are implicitly included — backend concerns
- For `partial`, always fill both "Features included" and "Features excluded"

## Client Spec for a New App

After Step 5.1b, the AI creates:
- **Web app** → `project/actions/<app-slug>/pages/_index.md` + `pages/<module>.md` using `pages-template.md`
- **Mobile app** → `project/actions/<app-slug>/views/_index.md` + `views/<module>.md` using `views-template.md`

Each page/screen entry must declare:
- **Reused endpoints** — from the API app's `endpoints/<module>.md` (by `EP-<MODULE>-NN`)
- **New endpoints needed** — flagged for addition to the API
- **Platform notes** — mobile-specific behavior (navigation, gestures, push, offline)

## Checklist for Step 5.1b

- [ ] app-name, app-purpose, target-platform, tech-stack, auth-strategy all filled
- [ ] Every module in "Modules to Include" has an Include value
- [ ] For `partial` modules, both columns filled
- [ ] All included features exist in modules file (or are listed as new)
- [ ] New modules/features explicitly listed
- [ ] App-specific pages/views list is complete
- [ ] Auth strategy resolved (for `same-backend-jwt`, confirm auth endpoints exist)
- [ ] For mobile: tech stack confirmed, REST API sufficient
- [ ] New app folder and client spec created
