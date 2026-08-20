# Authentication Workflows

## WF-REGISTER — Register a member

```yaml artifact
id: WF-REGISTER
type: workflow
title: Register a member
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-AUTH]
uses: [CTR-REGISTER, CTR-AUTH-RESPONSE]
implemented_by: [CMP-AUTH-CONTROLLER, CMP-AUTH-SERVICE, CMP-USERS-REPOSITORY, CMP-WEB-AUTH]
```

```mermaid
sequenceDiagram
  actor Member
  participant Web
  participant API as Auth controller
  participant Service as Auth service
  participant Users as Users repository
  Member->>Web: name, email, password
  Web->>API: POST /auth/register
  API->>Service: register(RegisterDto)
  Service->>Users: findByEmail(normalized email)
  alt email available
    Service->>Users: create(user with password hash)
    Service-->>API: AuthResponse
    API-->>Web: 201 token + user
  else duplicate
    API-->>Web: 409 error
  end
```

## WF-LOGIN — Log in a member

```yaml artifact
id: WF-LOGIN
type: workflow
title: Log in a member
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-AUTH]
uses: [CTR-LOGIN, CTR-AUTH-RESPONSE]
implemented_by: [CMP-AUTH-CONTROLLER, CMP-AUTH-SERVICE, CMP-USERS-REPOSITORY, CMP-WEB-AUTH]
```

```mermaid
sequenceDiagram
  actor Member
  participant Web
  participant API as Auth controller
  participant Service as Auth service
  participant Users as Users repository
  Member->>Web: email and password
  Web->>API: POST /auth/login
  API->>Service: login(LoginDto)
  Service->>Users: findByEmail(normalized email)
  Service->>Service: compare bcrypt hash
  alt credentials valid
    Service-->>API: AuthResponse
    API-->>Web: 200 token + user
  else invalid
    API-->>Web: 401 Invalid credentials
  end
```
