# Progress â€” RoyaScaff 1.5 â†’ 2.0

Program: `plans/v1.5-v2.0/05-build-program-for-claude-code.md`. One line per work package (WP).

| WP | Status | Date | Done | Left | Tests |
|---|---|---|---|---|---|
| E0.1 | done, awaiting owner check | 2026-10-01 | Owner moved the engine to `engine/` and old folders to `history/`; tag `v1.4.0-beta.4` on 64c7699 (local); `CLAUDE.md`; this file; plans at `plans/v1.5-v2.0/`; added `.gitattributes` (LF for `engine/`: CRLF checkout on Windows broke 110 tests); root 1.2.6 package frozen in `history/root-1.2.6/`, root `package.json` now private; `repository.directory` set to `engine` | Push the tag when the owner agrees. Known engine bug: Windows path separators fail 6 tests (usage feedback path, context cache, check evidence, walkthrough, smoke init; the first was confirmed, the rest share the symptom). Fix belongs in a later WP | 207 tests: 200 pass, 6 fail, 1 skipped (Windows, node 24) |
