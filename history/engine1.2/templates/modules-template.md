# Modules & Features Template

Defines the module map and feature inventory. Modules group by business capability; features list what each module delivers. Created before endpoints, pages, or code.

> Verbose guidance → `references/modules-template-guide.md`

## Schema

```md
# Modules & Features

## 1. ModuleName
- Scope: BE `src/modules/slug/` + FE `client/src/app/pages/slug/`
- Audience: internal | admin | public | mixed
- Entities: `entity1`, `entity2`
- Depends on: `OtherModule`

### Features
1. **Feature** [both] — description
2. **Feature** [backend-only] — description
```

Visibility tags: `[both]`, `[backend-only]`, `[frontend]`.

## Example

```md
## 1. Auth
- Scope: BE `src/modules/auth/` + FE `client/src/app/pages/auth/`
- Audience: public and authenticated users
- Entities: `users`
- Depends on: `Users`

### Features
1. **User Login** [both] — authenticate via email/password, issue JWT
2. **User Registration** [both] — create account when registration enabled
3. **Role-Based Access Control** [both] — restrict pages and endpoints by role

### Notes
- auth and user administration are separate modules
- frontend auth pages use auth layout, not app shell
```
