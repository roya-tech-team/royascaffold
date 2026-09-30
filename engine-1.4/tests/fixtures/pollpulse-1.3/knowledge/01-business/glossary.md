---
document_id: DOC-POLLPULSE-GLOSSARY
title: PollPulse business glossary
layer: business
schema_version: 1
document_status: approved
owners: [pollpulse-demo]
---

# Business Glossary

| Term | Meaning | Avoid/conflict |
|------|---------|----------------|
| Member | Authenticated PollPulse user; all members have the same global role | Do not imply an administrator role |
| Poll creator | Member whose ID is stored in `polls.created_by` | “Owner” in UI/API means creator, not tenant ownership |
| Open poll | Poll accepting new votes | A voted member still sees results instead of voting again |
| Closed poll | Poll that accepts no new votes | Closing is idempotent and does not delete results |
| Vote | A permanent selection by one member for one option in one poll | No vote change or anonymous vote |
| Result | Counts and one-decimal percentages per option | “Live” means refresh/request, not WebSocket push |

