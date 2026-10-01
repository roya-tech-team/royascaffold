# Card · Record work done by hand

`royascaff next` and `STATUS.md` list commits and uncommitted files the engine did not see.

**Commits:**

1. Show the person the commits (`git show --stat <hash>`) and ask what they were: a bug fix, polish, a refactor, a chore, or part of a planned slice.
2. Run `royascaff record <hash…> --as bug|polish|refactor|chore --affects REQ-…|CAP-… "<what was done>" --by <person>`. For slice work, use `--as feature --slice SLC-…`.
3. The recorded change is in progress: run the checks and add evidence (`cards/check-record.md`), then close it.
4. If the work changed behavior, update the requirements too.

**Uncommitted files:**

- These belong to the developer. Never discard, reset or overwrite them.
- Ask whether they should be committed and recorded, or left alone.
- If a task needs to change them, `royascaff task … start` backs them up automatically first. `royascaff backups` lists the backups.

**Tip:** start commit messages with the task ID (`TASK-…: …`). Such commits are tracked automatically.
