# Card · Start a new project

Goal: a `project/` folder, then discovery with the person (`cards/discover.md`).

1. If `project/profile.md` already exists, the project is set up: go to `cards/discover.md`.
2. Otherwise ask the person, in one short message: the product name, a short project code (2–10 capital letters, e.g. `CAMP`), the apps and their folders (e.g. `web=apps/web`), and the kind of app (`web-ui`, `web-api` or `generic`).
3. Run `royascaff init --name "<name>" --code <CODE> --app web=apps/web [--adapter web-ui]`.
4. Continue with `cards/discover.md`. The app commands (Build, Typecheck, Lint, Test) in `project/profile.md` are filled in by the first task that creates the app.
