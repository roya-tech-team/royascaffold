# Plan · CHG-CAMP-002

### TASK-CAMP-003 · Calendar grid

- **Goal:** month grid for a campaign's dates
- **Inputs:** REQ-CAMP-003, CMP-CAMP-CALENDAR
- **Allowed paths:** apps/web/src/calendar/**
- **Checks:** typecheck
- **Done when:** grid renders the campaign's date range

### TASK-CAMP-004 · Posts on the grid

- **Goal:** show posts on their day
- **Inputs:** REQ-CAMP-003, CMP-CAMP-CALENDAR
- **Depends on:** TASK-CAMP-003
- **Allowed paths:** apps/web/src/calendar/**
- **Checks:** typecheck, test
- **Done when:** each post appears on its scheduled day
