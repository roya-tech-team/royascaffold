# Impact — init-polls

## Create
- `apps/api/src/modules/polls/polls.repository.js`
- `apps/api/src/modules/polls/votes.repository.js`
- `apps/api/src/modules/polls/polls.service.js`
- `apps/api/src/modules/polls/polls.controller.js`
- `apps/api/src/modules/polls/polls.routes.js`
- `apps/web/src/pages/PollListPage.jsx`
- `apps/web/src/pages/CreatePollPage.jsx`
- `apps/web/src/pages/PollDetailPage.jsx`
- `apps/web/src/components/PollCard.jsx`
- `apps/web/src/components/PollResults.jsx`

## Modify
- `apps/api/src/database.js` — polls, poll_options, votes tables
- `apps/api/src/index.js` — mount polls routes
- `apps/web/src/App.jsx` — poll routes
- `apps/web/src/pages/DashboardPage.jsx` — show recent polls
