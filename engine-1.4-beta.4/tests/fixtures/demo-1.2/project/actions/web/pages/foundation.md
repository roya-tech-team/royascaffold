# Pages — PollPulse Web · Foundation

### App Shell `PG-FOUND-01`
- Route: `/app/*` (nested under shell)
- Status: done
- Components: `Layout`, `NavBar`, `Outlet`
- Service: —
- Guard: `ProtectedRoute`
- Notes: header with PollPulse branding, nav links (Dashboard, Polls, Create), logout button; uses brand tokens from profile

### Dashboard Page `PG-FOUND-02`
- Route: `/app/dashboard`
- Status: done
- Components: `StatCards`, `RecentPollsList`
- Service: `PollsService` → EP-POLLS-02 (GET /polls)
- Guard: `ProtectedRoute`
- Notes: welcome message, quick stats (total polls, open polls), recent polls list; loading/empty/error states
