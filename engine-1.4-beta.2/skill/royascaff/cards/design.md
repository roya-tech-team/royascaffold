# Card · Stage 2 — Design

Write the **After-state** section of `change.md`: how the system will look after this change. Follow the adapter card that `royascaff next` names. Name the records it rests on; the gate checks it.

- Components that change or appear: `royascaff new record component "<name>" --code "apps/web/src/x/**" --realizes REQ-…`.
- Contracts (`CTR-`: API, events, props), and every rule or invariant the code must enforce.
- Every material choice (pattern, library, data shape, UI approach): `royascaff new record decision "<choice>"` with options, choice, why.
- Reuse first: check `royascaff trace` and the code map before creating anything.

**Layer documents** (create with `royascaff new doc <kind>` when the Impact says the layer changed):

| Layer changed | Update |
|---|---|
| Architecture | `architecture.md` (always exists) |
| Data shape, storage, migration | `data` |
| Screens, interactions, look | `experience` (states, design tokens) |
| Accounts, permissions, personal data, secrets | `security` |
| Deploy, monitoring, recovery | `operations` |

**Always:** a critical invariant has an enforcing component and a test · UI and transport layers never hold business rules · side effects sit behind one component · inferred facts are marked as inferred.

Then run `royascaff advance <CHG> --to approved --by ai:<tool>`. For medium risk and above a person approves: tell them "Review the After-state in `project/changes/<CHG>/change.md`, then run `royascaff approve <CHG>`", and stop. Editing the design afterwards makes the approval stale.
