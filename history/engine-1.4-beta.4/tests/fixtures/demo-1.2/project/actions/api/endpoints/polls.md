# Endpoints — PollPulse API · Polls

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-POLLS-01 | POST | /polls | authenticated | `body: CreatePollDto` | `201 PollDetailDto` | `PollsService.createPoll()` | done | 2–5 options |
| EP-POLLS-02 | GET | /polls | authenticated | `?page,limit` | `200 PaginatedPollsResponse` | `PollsService.listPolls()` | done | paginated |
| EP-POLLS-03 | GET | /polls/:id | authenticated | `param: id` | `200 PollDetailDto` | `PollsService.getPoll()` | done | includes results |
| EP-POLLS-04 | POST | /polls/:id/vote | authenticated | `body: VoteDto` | `200 PollDetailDto` | `PollsService.castVote()` | done | one vote only |
| EP-POLLS-05 | POST | /polls/:id/close | authenticated | `param: id` | `200 PollDetailDto` | `PollsService.closePoll()` | done | creator only |

Additional foundation endpoint (implemented in foundation pack):
| EP-FOUND-01 | GET | /health | public | — | `200 { status: ok }` | — | done | health check |
