# Plan · CHG-CAMP-001

### TASK-CAMP-001 · Campaign form

- **Goal:** form with validation
- **Inputs:** REQ-CAMP-001, CMP-CAMP-CAMPAIGNS
- **Allowed paths:** apps/web/src/campaigns/**
- **Checks:** typecheck, test
- **Done when:** form saves a valid campaign and blocks invalid dates

### TASK-CAMP-002 · Campaign list

- **Goal:** list per client
- **Inputs:** REQ-CAMP-002, CMP-CAMP-CAMPAIGNS
- **Depends on:** TASK-CAMP-001
- **Allowed paths:** apps/web/src/campaigns/**
- **Checks:** typecheck
- **Done when:** campaigns appear newest first
