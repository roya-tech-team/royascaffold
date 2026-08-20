# Product Description Template — Detailed Guide

> This is the verbose reference for `../description-template.md`. Contains section-by-section instructions, field descriptions, and completion checklist.

## Section Instructions

### 1. Product Summary
- **Name**: The product/system name
- **Type**: e.g. SaaS platform, mobile app, internal tool, e-commerce site, analytics dashboard
- **Audience**: Be specific — internal staff, external customers, admins, etc.
- **Summary**: 1-2 sentences describing what the product does and what problem it solves

### 2. Core Workflow
Describe the primary user journey from start to finish. Number each step. This drives the feature and module breakdown.

### 3. Core Features
List all major features. For each, describe what it does, why it's needed, and its key capabilities (3-5 bullet points).

### 4. Key Entities
List the main data entities the system manages. For each, describe what it represents and its key fields. This feeds into `data-model.md`.

### 5. User Roles
List each role with explicit can/cannot permissions. State whether the product requires authentication and describe the auth method.

### 6. Integrations
List every third-party integration with its purpose and usage. Include: payment, storage, email, SMS, AI, analytics, etc. Write "None" if no integrations needed.

### 7. Tech Constraints
Document preferences for:
- Backend stack
- Frontend stack
- Database
- Performance requirements
- Scalability requirements
- Security requirements (HIPAA, SOC 2, GDPR, etc.)
- Internationalization (languages, RTL)
- Browser/platform support

### 8. Business Rules
List validation constraints and workflows the system must enforce. These become rules in `project/rules.md`.

### 9. Out of Scope
Explicitly list features, capabilities, or use cases that should NOT be built. Prevents scope creep.

### 10. Success Criteria
List measurable or observable criteria for product success.

### 11. Additional Context (optional)
- Existing systems to integrate with or migrate from
- Design assets or branding guidelines
- Known technical challenges
- Any other relevant context

## Completion Checklist

Before moving to Phase 1 (Planning), verify:
- [ ] All sections filled in or marked "N/A"
- [ ] No placeholder text remains
- [ ] Core workflow is clear and complete
- [ ] All major features listed and described
- [ ] All key entities and fields identified
- [ ] User roles and permissions defined
- [ ] Integrations and external dependencies documented
- [ ] Business rules and validation constraints listed
- [ ] Success criteria are measurable
