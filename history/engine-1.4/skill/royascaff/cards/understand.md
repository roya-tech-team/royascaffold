# Card · Stage 1 — Understand

The change was just opened. Read `project/changes/<CHG>/change.md` and the slice's requirements (`royascaff show <SLC-…>`).

1. Write **Outcome**: what will be true for the user when the change is done (one to three sentences).
2. Fill the **Impact** table. Classify each of the six layers as `changed`, `referenced`, `unchanged` or `not-applicable`, and name the affected IDs or paths. Use `royascaff trace <REQ-…>` and `royascaff show <CMP-…>` to see what exists already.
3. Set `risk:` in the front matter:
   - **low:** local, reversible, no behavior, data or contract impact
   - **medium:** bounded behavior change with a known pattern
   - **high:** authorization, sensitive data, money, public contract, migration, hard to undo
   - **critical:** destructive or regulated
4. Run `royascaff advance <CHG> --to analyzed --by ai:<tool>`. For low risk you may go straight on: `--to ready` after the design and the tasks exist.

If the requirements look wrong or incomplete, stop and ask. Do not guess new scope.
