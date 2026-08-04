# Pages — PollPulse Web · Polls

### Poll List Page `PG-POLLS-01`
- Route: `/app/polls`
- Status: done
- Components: `PollCard`, `StatusBadge`, `Pagination`
- Service: `PollsService` → EP-POLLS-02 (GET /polls)
- Guard: `ProtectedRoute`
- Notes: paginated grid of poll cards with title, status, vote count; empty state with CTA to create

### Create Poll Page `PG-POLLS-02`
- Route: `/app/polls/new`
- Status: done
- Components: `PollForm`, `OptionInputList`
- Service: `PollsService` → EP-POLLS-01 (POST /polls)
- Guard: `ProtectedRoute`
- Notes: dynamic 2–5 option fields; validation; redirect to detail on success

### Poll Detail Page `PG-POLLS-03`
- Route: `/app/polls/:id`
- Status: done
- Components: `PollResults`, `VoteForm`, `ClosePollButton`
- Service: `PollsService` → EP-POLLS-03 (GET /polls/:id), EP-POLLS-04 (POST /polls/:id/vote), EP-POLLS-05 (POST /polls/:id/close)
- Guard: `ProtectedRoute`
- Notes: if open and not voted — show vote buttons; if voted or closed — show results bars; creator sees Close button

### Poll Results Component (embedded) `PG-POLLS-04`
- Route: (embedded in PG-POLLS-03)
- Status: done
- Components: `ResultBar`
- Service: data from EP-POLLS-03
- Guard: —
- Notes: horizontal bar per option with count and percentage label
