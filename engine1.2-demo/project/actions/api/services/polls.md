# Services — PollPulse API · Polls

### SVC-POLLS-01 · PollsService [domain, internal, Polls]
- Status: done
- Methods:
  - `createPoll(userId, dto): PollDetailDto` — validate options count, persist poll + options
  - `listPolls(query): PaginatedPollsResponse` — paginated list with vote totals
  - `getPoll(id, userId): PollDetailDto` — poll with options, vote counts, user's vote if any
  - `castVote(userId, pollId, optionId): PollDetailDto` — enforce one vote, open status
  - `closePoll(userId, pollId): PollDetailDto` — owner-only close
- Deps: `PollsRepository`, `VotesRepository`
- Side effects: none
- Rules: 2–5 options; one vote per user; owner-only close

### SVC-POLLS-02 · PollsRepository [persistence, internal, Polls]
- Status: done
- Methods:
  - `createPollWithOptions(poll, options): Poll` — transactional insert
  - `findAll(query): PaginatedResult` — list with aggregates
  - `findById(id): PollWithOptions | null` — detail with options and counts
  - `updateStatus(id, status, closedAt): void` — close poll
- Deps: DatabaseService
- Side effects: none

### SVC-POLLS-03 · VotesRepository [persistence, internal, Polls]
- Status: done
- Methods:
  - `create(vote): Vote` — insert vote
  - `findByPollAndUser(pollId, userId): Vote | null` — check existing vote
- Deps: DatabaseService
- Side effects: none
- Rules: unique (poll_id, user_id) enforced by DB
