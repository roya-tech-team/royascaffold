# Custom Feature Rules — PollPulse

Project-specific rules. Generic conventions remain in `royascaff/engine/rules/`.

## Auth · User Registration
- Password minimum 8 characters; hashed with bcrypt (cost factor 10)
- Email normalized to lowercase before storage and lookup
- JWT expires after 7 days; payload includes `sub` (user id) and `email`

## Auth · User Login
- Return generic "Invalid credentials" for wrong email or password (no user enumeration)
- Never return `password_hash` in API responses

## Polls · Create Poll
- Title required (1–200 chars); description optional (max 1000 chars)
- Must provide 2–5 non-empty option labels
- New polls default to status `open`
- Only authenticated users may create polls

## Polls · Voting
- One vote per user per poll — enforced by unique index on (`poll_id`, `user_id`)
- Cannot vote on closed polls
- Cannot vote twice or change vote
- `option_id` must belong to the target poll

## Polls · Close Poll
- Only `created_by` user may close a poll
- Sets `status` to `closed` and `closed_at` to current timestamp
- Idempotent: closing an already-closed poll returns success

## Polls · Results
- Results include per-option vote count and percentage of total votes
- Percentages rounded to one decimal place
- Zero votes shows 0% for all options

## Frontend · API Isolation
- All HTTP calls go through `apps/web/src/core/api.js` using configured `VITE_API_URL`
- No direct third-party API calls from frontend
