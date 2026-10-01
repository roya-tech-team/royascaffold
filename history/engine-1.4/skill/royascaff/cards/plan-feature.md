# Card · Plan a feature

Planning is knowledge only: no code. It is cheap to redo.

1. Ask up to five questions: who uses it, what they can do afterwards, what "good" looks like, what is out of scope, and its horizon (`now`, `next`, `later`, `backlog`).
2. Run `royascaff new feature "<title>" --horizon <h> --outcome OUT-…`. Replace its placeholder line with one or two sentences of user value.
3. Add each requirement with `royascaff new record requirement "<observable behavior>" --feature CAP-… --priority must|should|could`, then fill in its body: what the user can do, and **Acceptance** criteria that can be checked, including a failure case. State what and why, never how. The file's `## Record format` section shows a full example.
4. For `now` and `next` features, cut slices: `royascaff new slice CAP-… "<title>" --delivers REQ-…,REQ-… [--depends SLC-…]`. A slice is a small end-to-end piece that can be built and checked on its own (about 1–5 tasks).
5. Features in `later` or `backlog` can stay at the idea or outline level. Do not design them now.
6. Run `royascaff validate`, then `royascaff status`, and show the person the Features table.
