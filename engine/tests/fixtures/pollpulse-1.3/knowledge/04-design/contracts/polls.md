---
document_id: DOC-POLLPULSE-CTR-POLLS
title: Poll contracts
layer: design
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Poll Contracts

### CTR-POLLS-CREATE-001 · Create poll request

- **Kind:** request-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-POLLS-01`
- **Maps to:** `CON-POLL-001`, `CON-OPTION-001`

`title: string`, optional `description: string`, `options: (string | {label})[]`; service trims/filter blanks and enforces `INV-POLLS-001`.

### CTR-POLLS-VOTE-001 · Cast vote request

- **Kind:** request-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-POLLS-04`
- **Maps to:** `CON-VOTE-001`

`{ optionId: string }`; target poll ID is route parameter and authenticated member ID comes from middleware.

### CTR-POLLS-SUMMARY-001 · Poll summary

- **Kind:** response-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `CTR-POLLS-LIST-001`
- **Maps to:** `CON-POLL-001`

`id`, title, description, status, `createdBy`, `creatorName`, created/closed timestamps, `totalVotes`.

### CTR-POLLS-LIST-001 · Paginated poll list

- **Kind:** response-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-POLLS-02`
- **Maps to:** `CTR-POLLS-SUMMARY-001`

`{ data: PollSummary[], total: number, page: number, limit: number }`; query defaults page 1/limit 10 and caps limit at 50.

### CTR-POLLS-DETAIL-001 · Poll detail and results

- **Kind:** response-contract
- **Knowledge status:** approved
- **Implementation status:** implemented
- **Owner:** pollpulse-demo
- **Exposes:** `EP-POLLS-01`, `EP-POLLS-03`, `EP-POLLS-04`, `EP-POLLS-05`
- **Maps to:** `CON-POLL-001`, `CON-OPTION-001`, `CON-VOTE-001`

Poll fields plus `totalVotes`, nullable `userVote: {optionId}`, `isOwner`, and ordered options `{id,label,sortOrder,voteCount,percentage}`.

## Status/error behavior

| Action | Success | Expected errors |
|--------|---------|-----------------|
| create | 201 detail | 400 validation |
| list/detail/vote/close | 200 | 401 auth; 404 missing poll; 400 closed/invalid option; 409 duplicate vote; 403 non-owner close |

All errors use `CTR-ERROR-001`.

