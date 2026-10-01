# Card · Plan a feature

Planning is knowledge only: no code. It is cheap to redo.

1. Write up to five questions (who uses it, what they can do afterwards, what "good" looks like, what is out of scope, its horizon) with `royascaff new record question "<question>" --feature CAP-…` once the feature exists. Ask them in the chat and record each answer (`Answer:`, `Source: chat <date>`). Never answer them yourself.
2. Run `royascaff new feature "<title>" --horizon <h> --outcome OUT-…`. Replace its placeholder line with one or two sentences of user value.
3. Add each requirement with `royascaff new record requirement "<observable behavior>" --feature CAP-… --priority must|should|could`, then fill in its body: what the user can do, and **Acceptance** criteria that can be checked, including a failure case. State what and why, never how. The file's `## Record format` section shows a full example. Every quality demand (look, feel, speed, readability) becomes an NFR: `royascaff new record nfr "<measurable quality>" --feature CAP-… --priority must`.
4. **Cover the brief:** for each `SRC-` in `00-discovery/coverage.md`, fill `Covered by:` with the REQ-/NFR-/CAP- that delivers it, or `Out of scope:` with the person's reason. Plan approval is refused while one is open.
5. For `now` and `next` features, cut slices: `royascaff new slice CAP-… "<title>" --delivers REQ-…,NFR-… [--depends SLC-…]`. A slice is a small end-to-end piece that can be built and checked on its own (about 1–5 tasks). Every *must* NFR sits in a slice (approval checks it). For `web-ui`, the first slice is the **look-and-feel foundation**: tokens, theme or lighting, background, typography, framing.
6. Features in `later` or `backlog` can stay at the idea or outline level. Do not design them now. Next and Later work waits until every Now feature is ✅ Done and accepted (for `web-ui`: a person looked at it); only a person moves a feature to Now.
7. Run `royascaff validate`, then `royascaff status`, and show the person the Features table.
8. A feature is only 🗺 Planned after a person approves it. Tell the person: "Review the plan, then run `royascaff approve roadmap`". Stop. Editing a plan after approval makes the approval stale.
