# HTTP API and DTO Contracts

## CTR-HTTP-API — PollPulse HTTP API

```yaml artifact
id: CTR-HTTP-API
type: interface
title: PollPulse HTTP API
module: api
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
uses: [CTR-REGISTER, CTR-LOGIN, CTR-AUTH-RESPONSE, CTR-USER, CTR-CREATE-POLL, CTR-VOTE, CTR-POLL-DETAIL, CTR-PAGINATED-POLLS, CTR-ERROR]
implemented_by: [CMP-API-BOOTSTRAP, CMP-AUTH-CONTROLLER, CMP-POLLS-CONTROLLER]
```

All bodies are JSON. Protected routes require a bearer JWT. Error status is expressed by HTTP status and the `CTR-ERROR` envelope.

| Method | Route | Auth | Request | Success |
|---|---|---|---|---|
| GET | `/health` | public | — | `200 {status: "ok"}` |
| POST | `/auth/register` | public | `CTR-REGISTER` | `201 CTR-AUTH-RESPONSE` |
| POST | `/auth/login` | public | `CTR-LOGIN` | `200 CTR-AUTH-RESPONSE` |
| GET | `/auth/me` | bearer | — | `200 CTR-USER` |
| POST | `/polls` | bearer | `CTR-CREATE-POLL` | `201 CTR-POLL-DETAIL` |
| GET | `/polls?page&limit` | bearer | query | `200 CTR-PAGINATED-POLLS` |
| GET | `/polls/:id` | bearer | path | `200 CTR-POLL-DETAIL` |
| POST | `/polls/:id/vote` | bearer | `CTR-VOTE` | `200 CTR-POLL-DETAIL` |
| POST | `/polls/:id/close` | bearer | path | `200 CTR-POLL-DETAIL` |

## CTR-REGISTER — RegisterDto

```yaml artifact
id: CTR-REGISTER
type: request-dto
title: RegisterDto
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
maps_to: [DOM-USER]
```

`{ name: string, email: string, password: string }`. Name and email are required; password has a minimum length of eight.

## CTR-LOGIN — LoginDto

```yaml artifact
id: CTR-LOGIN
type: request-dto
title: LoginDto
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
```

`{ email: string, password: string }`.

## CTR-AUTH-RESPONSE — AuthResponse

```yaml artifact
id: CTR-AUTH-RESPONSE
type: response-dto
title: AuthResponse
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
uses: [CTR-USER]
```

`{ token: string, user: UserDto }`.

## CTR-USER — UserDto

```yaml artifact
id: CTR-USER
type: response-dto
title: UserDto
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
maps_to: [DOM-USER]
```

`{ id: string, name: string, email: string, createdAt: string }`. The password hash is never part of this contract.

## CTR-CREATE-POLL — CreatePollDto

```yaml artifact
id: CTR-CREATE-POLL
type: request-dto
title: CreatePollDto
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
maps_to: [DOM-POLL]
```

`{ title: string, description?: string, options: string[] }`. Options contain 2–5 non-empty labels.

## CTR-VOTE — VoteDto

```yaml artifact
id: CTR-VOTE
type: request-dto
title: VoteDto
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
maps_to: [DOM-VOTE]
```

`{ optionId: string }`.

## CTR-POLL-DETAIL — PollDetailDto

```yaml artifact
id: CTR-POLL-DETAIL
type: response-dto
title: PollDetailDto
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
maps_to: [DOM-POLL, DOM-POLL-OPTION, DOM-VOTE]
```

Contains poll identity, title, optional description, status, creator summary, timestamps, total votes, current user's vote, and ordered options with `id`, `label`, `sortOrder`, `voteCount`, and `percentage`.

## CTR-PAGINATED-POLLS — PaginatedPollsResponse

```yaml artifact
id: CTR-PAGINATED-POLLS
type: response-dto
title: PaginatedPollsResponse
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
uses: [CTR-POLL-DETAIL]
```

`{ data: PollSummaryDto[], page: number, limit: number, total: number }` where each summary exposes identity, title, status, creator, timestamps, and total vote count.

## CTR-ERROR — ErrorResponse

```yaml artifact
id: CTR-ERROR
type: response-dto
title: ErrorResponse
module: common
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
```

`{ error: string }`. Validation and domain violations use 400, authentication uses 401, ownership uses 403, missing resources use 404, duplicates use 409, and unexpected failures use 500.
