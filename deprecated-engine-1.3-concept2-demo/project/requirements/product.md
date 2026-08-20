# Product Requirements

## REQ-AUTH — Authenticate members

```yaml artifact
id: REQ-AUTH
type: requirement
title: Authenticate members
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
realized_by: [WF-REGISTER, WF-LOGIN]
implemented_by: [CMP-AUTH-SERVICE, CMP-WEB-AUTH]
verified_by: [TEST-AUTH]
```

Members can register with name, email, and password, then log in to receive a seven-day bearer JWT. Passwords require at least eight characters, are hashed with bcrypt cost 10, and never appear in responses. Email is normalized to lowercase. Failed login uses the generic message `Invalid credentials`.

Acceptance:

- Registering a new normalized email returns the member and token.
- Registering an existing email is rejected.
- Correct credentials return a JWT; incorrect credentials reveal no account existence.
- An authenticated member can read their current profile.

## REQ-POLL-CREATE — Create a poll

```yaml artifact
id: REQ-POLL-CREATE
type: requirement
title: Create a poll
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
realized_by: [WF-CREATE-POLL]
implemented_by: [CMP-POLLS-SERVICE, CMP-WEB-POLLS]
verified_by: [TEST-POLLS]
```

An authenticated member can create an open poll with a title of 1–200 characters, an optional description of at most 1000 characters, and 2–5 non-empty answer labels.

## REQ-POLL-BROWSE — Browse polls and results

```yaml artifact
id: REQ-POLL-BROWSE
type: requirement
title: Browse polls and results
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implemented_by: [CMP-POLLS-SERVICE, CMP-WEB-POLLS, CMP-WEB-POLL-VIEWS]
verified_by: [TEST-POLLS]
```

Authenticated members can browse paginated open and closed polls, open poll detail, and see per-option counts and percentages. Percentages are rounded to one decimal place; all options show zero percent when there are no votes.

## REQ-POLL-VOTE — Cast one immutable vote

```yaml artifact
id: REQ-POLL-VOTE
type: requirement
title: Cast one immutable vote
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
realized_by: [WF-VOTE]
implemented_by: [CMP-POLLS-SERVICE, CMP-VOTES-REPOSITORY, CMP-WEB-POLLS]
verified_by: [TEST-POLLS]
```

An authenticated member can vote for an option belonging to an open poll. Each member can vote at most once per poll and cannot change the vote. Both service rules and the database uniqueness constraint protect this invariant.

## REQ-POLL-CLOSE — Close an owned poll

```yaml artifact
id: REQ-POLL-CLOSE
type: requirement
title: Close an owned poll
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
realized_by: [WF-CLOSE-POLL]
implemented_by: [CMP-POLLS-SERVICE, CMP-WEB-POLLS]
verified_by: [TEST-POLLS]
```

Only the creator can close a poll. Closing records `closed_at`, prevents later voting, and is idempotent when the poll is already closed.

## REQ-SCOPE — Product boundary

```yaml artifact
id: REQ-SCOPE
type: constraint
title: Product boundary
module: system
owner: pollpulse-team
knowledge_status: approved
implementation_status: not-applicable
```

English-only operation is in scope. Email verification, password reset, OAuth, anonymous voting, administrative user management, WebSocket updates, and poll editing are outside the current system. Poll editing is represented only as an active v1.3 example change until implemented and reconciled.
