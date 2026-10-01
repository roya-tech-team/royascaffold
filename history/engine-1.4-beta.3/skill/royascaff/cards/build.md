# Card · Stage 4 — Build (one task)

1. Run `royascaff task <TASK> start --by ai:<tool>`. The CLI may back up a developer's uncommitted files first. That is expected.
2. Run `royascaff context <TASK>` and read the whole pack. It is everything you need: the task, its rules, the inputs, the design, the code map, and the earlier hand-offs.
3. Implement only inside the allowed paths. Follow the contracts and rules in the pack exactly.
4. Add or update tests for the task's requirements. A test **calls** the code (import it, render it, call the API) and checks the result; it never reads source files as text (`readFileSync` of `src/`, `?raw`), which `check` reports and the verified gate refuses. Then run `royascaff check <CHG> --quick` (typecheck and lint of the app). `task … done` runs the quick checks again and refuses on a failure.
5. Commit the task's code **and** the project knowledge together, with a message that starts with the task ID: `git add <task paths> project && git commit -m "TASK-…: <what changed>"`. `task … done` refuses uncommitted work and files outside the task's allowed paths.
6. Run `royascaff task <TASK> done "<what was done; what is left or risky>" --by ai:<tool>`. The note is the hand-off for the next session: make it specific.

Stop and block instead of guessing when you would need new public behavior, a new contract, a dependency, a migration, a security rule, or files outside the allowed paths:

`royascaff task <TASK> block "<what is missing>" --by ai:<tool>`

After the task, check your context use. Above about 60%, tell the person to open a new session and say "royascaff continue".
