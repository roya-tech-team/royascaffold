# Verification Intents

## TEST-AUTH — Authentication verification intent

```yaml artifact
id: TEST-AUTH
type: test-intent
title: Authentication verification intent
module: auth
owner: pollpulse-team
knowledge_status: approved
implementation_status: planned
verifies: [REQ-AUTH, WF-REGISTER, WF-LOGIN, IFACE-AUTH-SERVICE]
```

Automate successful registration/login/current-user cases plus missing fields, short password, duplicate normalized email, wrong email, wrong password, expired/malformed token, and password-field non-disclosure. The inherited v1.2 application has no automated API test suite, so this remains explicitly planned instead of disappearing from the blueprint.

## TEST-POLLS — Poll verification intent

```yaml artifact
id: TEST-POLLS
type: test-intent
title: Poll verification intent
module: polls
owner: pollpulse-team
knowledge_status: approved
implementation_status: planned
verifies: [REQ-POLL-CREATE, REQ-POLL-BROWSE, REQ-POLL-VOTE, REQ-POLL-CLOSE, WF-CREATE-POLL, WF-VOTE, WF-CLOSE-POLL, IFACE-POLLS-SERVICE]
```

Automate creation bounds, pagination limits, detail/results mapping, wrong-poll option rejection, closed-poll rejection, duplicate/concurrent vote rejection, non-owner closure rejection, owner closure, and idempotent repeated closure. Add browser paths for route protection, creation, voting, results, and close visibility.
