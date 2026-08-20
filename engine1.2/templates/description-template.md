# Product Description Template

Product definition driving all downstream planning. Mark inapplicable sections "N/A".

> Verbose guidance → `references/description-template-guide.md`

## Schema

```md
# Product Description

## 1. Product Summary
- **Name**: [name]  **Type**: [SaaS|mobile|tool]  **Audience**: [who]

## 2. Core Workflow
1. [step]  2. [step]  3. [step]

## 3. Core Features
- **Feature**: capability 1, capability 2

## 4. Key Entities
- **Entity**: field1, field2, field3

## 5. User Roles
- **Role**: can [actions]; cannot [restrictions]

## 6. Integrations
- **Provider**: purpose

## 7. Tech & Constraints
- Backend: [stack]  Frontend: [stack]  DB: [db]  i18n: [langs]

## 8. Business Rules / 9. Out of Scope / 10. Success Criteria
1. [rule or criterion per line]
```

## Example

```md
## 1. Product Summary
- **Name**: ProposalFlow  **Type**: SaaS  **Audience**: exhibition contractors

## 2. Core Workflow
1. Create project  2. Upload RFP  3. AI generates proposal  4. Review  5. Issue PDF

## 3. Core Features
- **AI Proposal Generation**: queue from data, generate HTML, track status

## 5. User Roles
- **admin**: full access — **sales_rep**: own projects only

## 6. Integrations
- **Claude AI**: proposal gen — **R2**: file storage

## 7. Tech & Constraints
- Backend: NestJS  Frontend: Angular+PrimeNG  DB: MongoDB  i18n: EN+AR RTL
```
