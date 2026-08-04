# Product Description

## 1. Product Summary
- **Name**: PollPulse
- **Type**: SaaS tool
- **Audience**: Small teams who need quick decisions via lightweight polls (standups, planning, fun team questions)

## 2. Core Workflow
1. User registers or logs in with email and password
2. User creates a poll with a question and 2–5 answer options
3. Team members browse open polls and cast one vote each
4. Everyone views live results (vote counts and percentages) after voting or when the poll is closed

## 3. Core Features
- **User Registration** — sign up with name, email, password
- **User Login** — authenticate and receive a JWT session
- **Poll Creation** — create a poll with title, optional description, and 2–5 options
- **Poll Listing** — browse all polls (open and closed) with status and vote counts
- **Voting** — cast exactly one vote per poll per user; cannot change vote
- **Results View** — bar chart style results with counts and percentages
- **Poll Close** — poll creator can close a poll to stop new votes

## 4. Key Entities
- **User**: id, name, email, passwordHash, createdAt
- **Poll**: id, title, description, status (open/closed), createdBy (user ref), createdAt, closedAt
- **PollOption**: id, pollId, label, sortOrder
- **Vote**: id, pollId, optionId, userId, createdAt (unique per poll+user)

## 5. User Roles
- **member**: can register, login, create polls, vote on any open poll, view results, close own polls
- No admin role in this example — all authenticated users have equal permissions except poll close (owner only)

## 6. Integrations
- N/A — self-contained example with SQLite storage

## 7. Tech & Constraints
- Backend: Node.js 22+ + Express + SQLite (node:sqlite)
- Frontend: React + Vite + Tailwind CSS
- DB: SQLite file (`apps/api/data/pollpulse.db`)
- i18n: English only
- Auth: JWT bearer tokens, 7-day expiry

## 8. Business Rules
1. A user may vote at most once per poll
2. Voting is only allowed on polls with status `open`
3. Only the poll creator may close a poll
4. Polls require at least 2 options and at most 5 options
5. Results are visible to all authenticated users

## 9. Out of Scope
- Email verification, password reset, OAuth
- Real-time WebSocket updates (refresh to see new votes)
- Poll editing after creation
- Anonymous voting
- Admin dashboard or user management

## 10. Success Criteria
1. A new user can register, login, create a poll, and see it in the list
2. Another user can vote and see updated results
3. Poll creator can close the poll; no new votes accepted after close
4. Blueprint + code demonstrate the RoyaScaff initial-build flow end-to-end
