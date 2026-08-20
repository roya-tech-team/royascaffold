# Internal Service and Repository Interfaces

These contracts describe callable boundaries even though the JavaScript implementation uses exported functions instead of language-level interfaces. A source service or repository is therefore visible to the blueprint and traceable to callers, rules, DTOs, and persistence.

## IFACE-AUTH-SERVICE — Auth service interface

```yaml artifact
id: IFACE-AUTH-SERVICE
type: service-interface
title: Auth service interface
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-AUTH]
uses: [CTR-REGISTER, CTR-LOGIN, CTR-AUTH-RESPONSE, CTR-USER, IFACE-USERS-REPOSITORY]
realized_by: [CMP-AUTH-SERVICE]
```

| Operation | Input | Output | Failure |
|---|---|---|---|
| `register(dto)` | `RegisterDto` | promise of `AuthResponse` | invalid fields, duplicate email |
| `login(dto)` | `LoginDto` | promise of `AuthResponse` | missing or invalid credentials |
| `getMe(userId)` | user id | `UserDto` | user not found |

## IFACE-USERS-REPOSITORY — Users repository interface

```yaml artifact
id: IFACE-USERS-REPOSITORY
type: repository-interface
title: Users repository interface
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
uses: [DATA-USERS]
realized_by: [CMP-USERS-REPOSITORY]
```

Exports `create({name,email,passwordHash})`, `findByEmail(email)`, `findById(id)`, and `toUserDto(user)`. Find operations return a row or `null`; DTO mapping removes persistence-only fields.

## IFACE-POLLS-SERVICE — Polls service interface

```yaml artifact
id: IFACE-POLLS-SERVICE
type: service-interface
title: Polls service interface
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-POLL-CREATE, REQ-POLL-BROWSE, REQ-POLL-VOTE, REQ-POLL-CLOSE]
uses: [CTR-CREATE-POLL, CTR-VOTE, CTR-POLL-DETAIL, CTR-PAGINATED-POLLS, IFACE-POLLS-REPOSITORY, IFACE-VOTES-REPOSITORY]
realized_by: [CMP-POLLS-SERVICE]
```

| Operation | Input | Output | Principal rules |
|---|---|---|---|
| `createPoll(userId, dto)` | authenticated user, `CreatePollDto` | `PollDetailDto` | title/description bounds, 2–5 options |
| `listPolls(query)` | page and limit strings | paginated polls | page ≥ 1; limit 1–50 |
| `getPoll(id, userId)` | poll and viewer | `PollDetailDto` | poll must exist |
| `castVote(userId, pollId, dto)` | member, poll, `VoteDto` | updated `PollDetailDto` | open poll, owned option, no earlier vote |
| `closePoll(userId, pollId)` | member and poll | updated `PollDetailDto` | creator only, idempotent |

## IFACE-POLLS-REPOSITORY — Polls repository interface

```yaml artifact
id: IFACE-POLLS-REPOSITORY
type: repository-interface
title: Polls repository interface
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
uses: [DATA-POLLS, DATA-POLL-OPTIONS, DATA-VOTES]
realized_by: [CMP-POLLS-REPOSITORY]
```

Exports `createPollWithOptions(poll, options)`, `findAll({page,limit})`, `findById(id)`, `updateStatus(id,status,closedAt)`, and `mapPollDetail(result,userId,userVote)`. Creation is atomic across the poll and its options.

## IFACE-VOTES-REPOSITORY — Votes repository interface

```yaml artifact
id: IFACE-VOTES-REPOSITORY
type: repository-interface
title: Votes repository interface
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
uses: [DATA-VOTES]
realized_by: [CMP-VOTES-REPOSITORY]
```

Exports `create({pollId,optionId,userId})` and `findByPollAndUser(pollId,userId)`. Database uniqueness remains the final concurrency-safe guard for one vote per member and poll.
