# Card · Start a new project

Goal: a `project/` folder with a profile and a first roadmap, so `royascaff next` can guide the work.

1. Ask the person, in one short message: product name; a short project code (2–10 capital letters, e.g. `CAMP`); the apps and their folders (e.g. `web=apps/web`, `api=apps/api`); and in two or three sentences, the problem and who the users are.
2. Run `royascaff init --name "<name>" --code <CODE> --app web=apps/web [--app api=apps/api]`.
3. Fill in `project/profile.md`: for each `APP-` record, add the Build, Typecheck, Lint and Test commands.
4. Write the business brief in `project/knowledge/01-business/brd.md` (the problem and the users), and add 1–3 outcomes with `royascaff new record outcome "<result you can measure>"`.
5. Plan the features (see `cards/plan-feature.md`). Put each feature in a horizon: `now`, `next`, `later` or `backlog`.
6. Run `royascaff validate`, then `royascaff next`.

Choose the technology with the person: offer two or three options and recommend one. Record it with `royascaff new record decision "<the choice>"`.
