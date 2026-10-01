# Card · Adopt an existing codebase

Goal: a truthful `project/` for code that already exists. One module per session; never load the whole code base.

1. `royascaff init --name "<name>" --code <CODE> --app <name>=<existing folder> [--adapter web-ui]`. The code stays where it is. Then discovery (`cards/discover.md`): the person confirms what the product is for.
2. `royascaff adopt` lists the modules of each app and how much of each is owned by components. Pick the first unowned module.
3. Open one knowledge change for it: `royascaff open --kind knowledge "Adopt <module>" --by ai:<tool>`.
4. Write `CMP-` records with `Code:` globs and the requirements the code shows. Mark every inferred fact *"inferred from code, needs confirmation"*, and ask the person to confirm or correct each one. Group confirmed requirements into features (`royascaff new feature … --horizon now`), then add `affects: [CAP-…]` to the change's front matter.
5. Prove existing behavior: run `royascaff check <CHG>` (the app's tests) or record a person's check per requirement. When the adoption change closes, the requirements it affects count as ✅ Done.
6. Gaps and defects become planned slices or fixes; do not fix anything during adoption.
7. `royascaff adopt` again: repeat until every module is owned.
