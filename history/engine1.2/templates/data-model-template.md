# Data Model Template

Persistence model with field tables per entity. Shared conventions apply to all.

> Verbose guidance → `references/data-model-template-guide.md`

## Conventions

- PKs: `_id: ObjectId` (Mongo) or `id: UUID` (SQL). Timestamps: `createdAt`, `updatedAt`.
- Arabic companions: `name` + `nameAr`. Snapshot values when history matters.

## Schema

```md
# Data Model

## 1. entityName
Purpose: what it stores

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `field` | String | required, unique | — |
| `refField` | ObjectId | required | → `other` |
| `createdAt` | Date | auto | — |

Relations: one entity → many other
Indexes: unique `email`; index `status`
```

## Example

```md
## 1. users
Purpose: system users

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `name` | String | required | — |
| `email` | String | required, unique | — |
| `role` | Enum | required | admin, sales_manager, sales_rep |
| `isActive` | Boolean | default: true | — |
| `createdAt` | Date | auto | — |

Relations: one user → many projects
Indexes: unique `email`; index `role`
```
