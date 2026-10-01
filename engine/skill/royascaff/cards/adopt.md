# Card · Adopt an existing codebase

Goal: a truthful `project/` for code that already exists. One module per session; never load the whole code base.

1. `royascaff init --name "<name>" --code <CODE> --app <name>=<existing folder> [--adapter web-ui]`. The code stays where it is. Then discovery (`cards/discover.md`): the person confirms what the product is for.
2. `royascaff adopt` lists the modules of each app, how much of each is owned by components, and which knowledge layers still lack it ("layer gaps"). Pick the first unowned module.
3. Open one knowledge change for it: `royascaff open --kind knowledge "Adopt <module>" --by ai:<tool>`. Start from facts, not from reading everything: `royascaff scan <module> --json` (imports, exports, routes, schema, config and test files, the biggest files).
4. Write `CMP-` records with `Code:` globs and the requirements the code shows. Mark every guess with `--basis "inferred from <file>"` (`royascaff new record requirement … --basis inferred …`): it stays ⏳ Unconfirmed until a person runs `royascaff confirm <ID…>`. Group confirmed requirements into features (`royascaff new feature … --horizon now`), then add `affects: [CAP-…]` to the change's front matter.
5. Prove existing behavior: run `royascaff verify <CHG>` (the app's tests) or record a person's check per requirement. When the adoption change closes, the requirements it affects count as ✅ Done once confirmed.
6. Gaps and defects become planned slices or fixes; do not fix anything during adoption.
7. `royascaff adopt` again: repeat until every module is owned.
8. Existing documents: `royascaff adopt docs <folder>`, then for each document `royascaff new record source|decision "<what it demands or decides>" --quote "<exact words>" --source-file <path>`. The quote must be in the file word for word.
