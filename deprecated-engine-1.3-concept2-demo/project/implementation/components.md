# Runtime Components

## CMP-API-BOOTSTRAP — API bootstrap and common transport

```yaml artifact
id: CMP-API-BOOTSTRAP
type: component
title: API bootstrap and common transport
module: api
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-SYSTEM, CTR-HTTP-API]
depends_on: [CMP-DATABASE, CMP-AUTH-CONTROLLER, CMP-POLLS-CONTROLLER]
```

Loads configuration, initializes the database, configures CORS and JSON parsing, mounts health/auth/polls routes, translates `AppError`, and starts Express.

## CMP-DATABASE — Database initializer

```yaml artifact
id: CMP-DATABASE
type: component
title: Database initializer
module: data
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-DATA-ACCESS, DATA-SQLITE]
```

Creates the SQLite directory, connection, schema, constraints, and indexes, and exposes the initialized connection to repositories.

## CMP-AUTH-CONTROLLER — Auth routes and controller

```yaml artifact
id: CMP-AUTH-CONTROLLER
type: component
title: Auth routes and controller
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-API-LAYERS, CTR-HTTP-API]
uses: [IFACE-AUTH-SERVICE, SEC-JWT]
depends_on: [CMP-AUTH-SERVICE]
```

Owns `/auth/register`, `/auth/login`, `/auth/me`, request translation, response status, and bearer authentication middleware integration.

## CMP-AUTH-SERVICE — Auth service

```yaml artifact
id: CMP-AUTH-SERVICE
type: service
title: Auth service
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [IFACE-AUTH-SERVICE, SEC-JWT]
depends_on: [CMP-USERS-REPOSITORY]
```

Validates registration and login, hashes and verifies passwords, signs JWTs, and maps safe user responses.

## CMP-USERS-REPOSITORY — Users repository

```yaml artifact
id: CMP-USERS-REPOSITORY
type: repository
title: Users repository
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [IFACE-USERS-REPOSITORY, ARCH-DATA-ACCESS]
depends_on: [CMP-DATABASE]
```

Creates and retrieves user rows and projects persistence records into public user DTOs.

## CMP-POLLS-CONTROLLER — Poll routes and controller

```yaml artifact
id: CMP-POLLS-CONTROLLER
type: component
title: Poll routes and controller
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-API-LAYERS, CTR-HTTP-API]
uses: [IFACE-POLLS-SERVICE, SEC-JWT]
depends_on: [CMP-POLLS-SERVICE]
```

Owns protected poll routes and translates request principals, parameters, query strings, bodies, responses, and errors.

## CMP-POLLS-SERVICE — Polls service

```yaml artifact
id: CMP-POLLS-SERVICE
type: service
title: Polls service
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [IFACE-POLLS-SERVICE]
depends_on: [CMP-POLLS-REPOSITORY, CMP-VOTES-REPOSITORY]
```

Enforces poll creation, listing bounds, voting invariants, results lookup, and owner-only idempotent closure.

## CMP-POLLS-REPOSITORY — Polls repository

```yaml artifact
id: CMP-POLLS-REPOSITORY
type: repository
title: Polls repository
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [IFACE-POLLS-REPOSITORY, ARCH-DATA-ACCESS]
depends_on: [CMP-DATABASE]
```

Persists poll aggregates transactionally, queries lists and details, updates status, and maps aggregate results with percentages.

## CMP-VOTES-REPOSITORY — Votes repository

```yaml artifact
id: CMP-VOTES-REPOSITORY
type: repository
title: Votes repository
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [IFACE-VOTES-REPOSITORY, ARCH-DATA-ACCESS]
depends_on: [CMP-DATABASE]
```

Creates immutable votes and finds a member's existing vote for a poll.

## CMP-WEB-SHELL — Web application shell

```yaml artifact
id: CMP-WEB-SHELL
type: component
title: Web application shell
module: web
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-SYSTEM, ARCH-WEB-LAYERS]
depends_on: [CMP-WEB-AUTH, CMP-WEB-POLLS]
```

Bootstraps React, defines public and protected routes, supplies layout and navigation, and redirects users according to session state.

## CMP-WEB-API — Web API client

```yaml artifact
id: CMP-WEB-API
type: adapter
title: Web API client
module: web
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-WEB-LAYERS, CTR-HTTP-API]
```

Centralizes the base URL, JSON transport, bearer token attachment, and error decoding for every browser HTTP call.

## CMP-WEB-AUTH — Web authentication feature

```yaml artifact
id: CMP-WEB-AUTH
type: component
title: Web authentication feature
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-WEB-LAYERS]
uses: [CTR-REGISTER, CTR-LOGIN, CTR-AUTH-RESPONSE, CTR-USER]
depends_on: [CMP-WEB-API]
```

Owns login/register pages, authentication layout, session context, token persistence, current-user loading, and route protection.

## CMP-WEB-POLLS — Web polls feature

```yaml artifact
id: CMP-WEB-POLLS
type: component
title: Web polls feature
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-WEB-LAYERS]
uses: [CTR-CREATE-POLL, CTR-VOTE, CTR-POLL-DETAIL, CTR-PAGINATED-POLLS]
depends_on: [CMP-WEB-API, CMP-WEB-POLL-VIEWS]
```

Owns dashboard, poll list, creation, and detail interaction pages.

## CMP-WEB-POLL-VIEWS — Poll presentation components

```yaml artifact
id: CMP-WEB-POLL-VIEWS
type: component
title: Poll presentation components
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
implements: [ARCH-WEB-LAYERS]
uses: [CTR-POLL-DETAIL]
```

Renders poll cards and per-option result bars with counts and percentages.
