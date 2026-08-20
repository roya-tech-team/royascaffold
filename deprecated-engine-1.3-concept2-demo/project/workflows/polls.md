# Poll Workflows

## WF-CREATE-POLL — Create a poll

```yaml artifact
id: WF-CREATE-POLL
type: workflow
title: Create a poll
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-POLL-CREATE]
uses: [CTR-CREATE-POLL, CTR-POLL-DETAIL]
implemented_by: [CMP-POLLS-CONTROLLER, CMP-POLLS-SERVICE, CMP-POLLS-REPOSITORY, CMP-WEB-POLLS]
```

```mermaid
sequenceDiagram
  actor Member
  participant Web
  participant Controller
  participant Service
  participant Repository
  Member->>Web: title, description, 2–5 options
  Web->>Controller: POST /polls + JWT
  Controller->>Service: createPoll(userId, CreatePollDto)
  Service->>Service: validate bounds and labels
  Service->>Repository: createPollWithOptions(...)
  Repository-->>Service: persisted poll
  Service-->>Web: PollDetailDto
```

## WF-VOTE — Vote in a poll

```yaml artifact
id: WF-VOTE
type: workflow
title: Vote in a poll
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-POLL-VOTE]
uses: [CTR-VOTE, CTR-POLL-DETAIL]
implemented_by: [CMP-POLLS-CONTROLLER, CMP-POLLS-SERVICE, CMP-POLLS-REPOSITORY, CMP-VOTES-REPOSITORY, CMP-WEB-POLLS]
```

```mermaid
sequenceDiagram
  actor Member
  participant Web
  participant Service
  participant Polls as Polls repository
  participant Votes as Votes repository
  Web->>Service: castVote(userId, pollId, optionId)
  Service->>Polls: findById(pollId)
  Service->>Votes: findByPollAndUser(pollId, userId)
  alt poll open, option belongs, no prior vote
    Service->>Votes: create(vote)
    Service->>Polls: findById(pollId)
    Service-->>Web: updated PollDetailDto
  else invariant violated
    Service-->>Web: 400/409 domain error
  end
```

## WF-CLOSE-POLL — Close a poll

```yaml artifact
id: WF-CLOSE-POLL
type: workflow
title: Close a poll
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: implemented
satisfies: [REQ-POLL-CLOSE]
uses: [CTR-POLL-DETAIL]
implemented_by: [CMP-POLLS-CONTROLLER, CMP-POLLS-SERVICE, CMP-POLLS-REPOSITORY, CMP-WEB-POLLS]
```

The service loads the poll, verifies `created_by` equals the authenticated user, and—unless already closed—sets status to `closed` with the current timestamp. It returns fresh poll detail in both the new-close and already-closed cases.
