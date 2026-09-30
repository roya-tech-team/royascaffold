# Data Model Template — Detailed Guide

> This is the verbose reference for `../data-model-template.md`. Consult when you need field meanings, rules, Mongoose shape blocks, or extended entry formats.

## File-Level Rules

- `data-model.md` should describe the full backend persistence model.
- Every collection/entity must use the same section order.
- Use MongoDB `ObjectId` for primary keys and references unless the project explicitly uses another strategy.
- Keep catalog data normalized and snapshot transactional values inside project or order documents when history must be preserved.
- Separate reusable catalog entities from project-specific selections.
- Document optional or future collections separately from required first-version collections.
- If a field supports Arabic UI or generated documents, document the Arabic companion field pattern explicitly.

## Recommended File Structure

```md
# Data Model

## Short Summary
{One paragraph: what system this model supports.}

## Modeling Principles
- principle 1
- principle 2

## Collection Overview
Required: `entity1`, `entity2`
Optional/future: `entity3`

## 1. entityName
{entity entry with field table}

## 2. entityName
{entity entry with field table}

## Relationship Summary
- `entityA` 1 → many `entityB`

## Embedded vs Referenced Decisions
- `parentEntity.subdoc` — embedded (reason: snapshot history)
- `parentEntity.refField` → `otherEntity` (reason: shared catalog)

## Suggested Enums
```ts
RoleName = ["admin", "user", "guest"]
Status = ["draft", "active", "archived"]
```

## Validation Rules
- rule 1
- rule 2

## Minimal First Backend Version
Start with: `users`, `projects`
Add `reports` when reporting feature is implemented.
```

## Mongoose Shape Block (optional per entity)

```ts
{
  _id: ObjectId,
  fieldName: Type,
  fieldName: Type | null,
  nestedObject: {
    fieldName: Type
  },
  arrayField: [
    { fieldName: Type }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Extended Entity Entry Format

When an entity needs embedded subdocument documentation:

```md
## N. entityName

Purpose: what it stores

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| ... | ... | ... | ... |

### Subdocument: nestedItems[]

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `fieldName` | Type | required | → `otherEntity` |

### Why embedded
- preserves snapshot/history
- never queried independently

Relations: ...
Indexes: ...
```

## Suggested Field Meanings

- **Field** — field name in camelCase
- **Type** — data type (String, Number, Boolean, Date, ObjectId, Enum, Array, Subdocument)
- **Constraints** — required/optional, unique, default value, validation rules
- **Ref** — reference to another entity (`→ entityName`) or `—` if none
- **Relations** — how this entity connects to others (1→many, many→1, many→many)
- **Indexes** — expected query paths and uniqueness constraints

## Arabic Naming Rule

For bilingual systems, any human-facing `name` or `title` field should have an Arabic companion:
- `name` + `nameAr`
- `title` + `titleAr`
- Keep the primary field for default display; add `Ar` suffix for explicit Arabic storage.
