# Bug Report Template

Use this template when creating a bug report file in `project/bugs/bug-<ID>-<slug>.md`.

Copy everything below the line into the new bug file and fill in each section.

---

# Bug <ID> — <Short Title>

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: <YYYY-MM-DD>
- **Severity**: critical | high | medium | low
- **Affected area**: <app/module/file>

## Description
<What is broken / not working as expected>

## Expected Behavior
<What should happen instead>

## Steps to Reproduce (if applicable)
1. <Step 1>
2. <Step 2>
3. ...

## Root Cause
<Brief technical explanation of the cause — filled after investigation in Step 6.2>

## Fix Applied
<Brief description of the code changes made — filled after implementation in Step 6.2>

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- <list of modified files — filled in Step 6.2>

---

## Notes

- **Status values**: PENDING (fix in progress) → DONE (user confirmed)
- If the bug is escalated to a change request (Path A), set Status to **ESCALATED** and add a link to the change folder
- Keep descriptions concise — this is a quick-reference log, not detailed documentation
