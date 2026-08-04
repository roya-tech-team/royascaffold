# Data Model

SQLite database: `apps/api/data/pollpulse.db`

## 1. users
Purpose: registered team members

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `id` | TEXT | PK, UUID | — |
| `name` | TEXT | required | — |
| `email` | TEXT | required, unique | — |
| `password_hash` | TEXT | required | — |
| `created_at` | TEXT | ISO datetime, auto | — |

Relations: one user → many polls (as creator), many votes
Indexes: unique `email`

---

## 2. polls
Purpose: a poll question with lifecycle status

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `id` | TEXT | PK, UUID | — |
| `title` | TEXT | required, max 200 | — |
| `description` | TEXT | optional, max 1000 | — |
| `status` | TEXT | required, enum | open, closed |
| `created_by` | TEXT | required | → `users.id` |
| `created_at` | TEXT | ISO datetime, auto | — |
| `closed_at` | TEXT | optional | — |

Relations: one poll → many poll_options, many votes; belongs to one user (creator)
Indexes: index `status`; index `created_by`

---

## 3. poll_options
Purpose: selectable answers for a poll

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `id` | TEXT | PK, UUID | — |
| `poll_id` | TEXT | required | → `polls.id` |
| `label` | TEXT | required, max 100 | — |
| `sort_order` | INTEGER | required, 0-based | — |

Relations: belongs to one poll; one option → many votes
Indexes: index `poll_id`

---

## 4. votes
Purpose: a user's single vote on a poll

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `id` | TEXT | PK, UUID | — |
| `poll_id` | TEXT | required | → `polls.id` |
| `option_id` | TEXT | required | → `poll_options.id` |
| `user_id` | TEXT | required | → `users.id` |
| `created_at` | TEXT | ISO datetime, auto | — |

Relations: belongs to poll, option, user
Indexes: unique (`poll_id`, `user_id`); index `poll_id`

## Enums
- `PollStatus`: `open` | `closed`
