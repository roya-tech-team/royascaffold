---
document_id: DOC-CAMP-REQUIREMENTS
title: Functional requirements
layer: requirements
schema_version: 2
document_status: approved
owners: [product-owner]
---

# Functional requirements

> **What:** what each feature must do, and how we know it works
> **Read when:** designing, building or checking a slice

<!-- royascaff:summary:start -->
<!-- royascaff:summary:end -->

### REQ-CAMP-001 · Create a campaign

- **Priority:** must
- **Owner:** product-owner
- **Feature:** CAP-CAMP-001
- **Verified by:** TEST-CAMP-001

A planner enters client, name, start and end dates, and channels, then saves.

**Acceptance**
- Saving without a name shows an inline error.
- The end date cannot be before the start date.

### REQ-CAMP-002 · List campaigns per client

- **Priority:** must
- **Owner:** product-owner
- **Feature:** CAP-CAMP-001

Campaigns are listed by client, newest first.

### REQ-CAMP-003 · Calendar shows scheduled posts

- **Priority:** must
- **Owner:** product-owner
- **Feature:** CAP-CAMP-002

### REQ-CAMP-004 · Move a post to another day

- **Priority:** should
- **Owner:** product-owner
- **Feature:** CAP-CAMP-002

### REQ-CAMP-005 · Client approves a post

- **Priority:** should
- **Owner:** product-owner
- **Feature:** CAP-CAMP-003

### REQ-CAMP-006 · Reach per campaign

- **Priority:** could
- **Owner:** product-owner
- **Feature:** CAP-CAMP-004

### TEST-CAMP-001 · Campaign form validation

- **Owner:** roya-team
- **Check:** runner:test
- **Verifies:** REQ-CAMP-001

### TEST-CAMP-010 · Campaign list order

- **Owner:** roya-team
- **Check:** manual
- **Verifies:** REQ-CAMP-002

### TEST-CAMP-011 · Calendar shows posts

- **Owner:** roya-team
- **Check:** manual
- **Verifies:** REQ-CAMP-003

### TEST-CAMP-012 · Drag a post to another day

- **Owner:** roya-team
- **Check:** manual
- **Verifies:** REQ-CAMP-004

### TEST-CAMP-013 · Client approves through the link

- **Owner:** roya-team
- **Check:** manual
- **Verifies:** REQ-CAMP-005
