# The engine develops itself with itself

This repository is a RoyaScaff project. Its knowledge is in `project/`, its code is the app `engine/`
(adapter `node`), and every change to the engine is a change (`CHG-ENG-…`) with tasks, checks and evidence.

## The rule: never run the working copy on itself

The engine that runs the work must not be the engine being changed. A change to a gate would be judged by the
gate it changes. So the work uses a **pinned copy**:

| How | Command |
|---|---|
| A published version, through the npm alias `royascaff-tool` | `npm i -D royascaff-tool@npm:royascaff@<version>`, then `npx royascaff …` |
| A snapshot of a committed state (no registry) | `node scripts/tool.cjs --snapshot`, then `node scripts/tool.cjs …` |
| A folder you name | `ROYASCAFF_TOOL=<folder with bin/royascaff.cjs> node scripts/tool.cjs …` |

`node scripts/tool.cjs <arguments>` runs the pinned tool: first `node_modules/royascaff-tool`, then
`$ROYASCAFF_TOOL`, then the last snapshot in `.tool/` (git-ignored). With none of them it stops and says how to make
one; it never falls back to the working copy. `--which` prints what would run. A snapshot is made with `git archive`
from a ref (default `HEAD`), so it is a copy: later edits to `engine/` do not change it.

`royascaff-tool` is only a local name for the `royascaff` package: npm links the alias's `bin` as
`node_modules/.bin/royascaff`, so `npx royascaff` runs the pinned version. Nothing in this repository installs it
from the registry for you.

### The guard

If you run `engine/bin/royascaff.cjs` on this repository anyway, the engine warns: *"You are running the engine you
are changing …"*. In `--json` mode the warning is in `warnings`; otherwise it goes to stderr. The engine warns when
its own folder is inside the repository it works on and not inside a `node_modules` folder (so the pinned alias
never warns). `ROYASCAFF_NO_GUARD=1` switches it off, for the tests of the guard.

## A change, from start to finish

```
node scripts/tool.cjs open --kind polish "<title>" --affects REQ-ENG-… --risk low --by ai:<tool>
node scripts/tool.cjs advance CHG-ENG-00N --to analyzed … --to ready
node scripts/tool.cjs task TASK-ENG-… start | done "<note>"
node scripts/tool.cjs verify CHG-ENG-00N          # runs `npm test` in engine/, writes evidence with a fingerprint
node scripts/tool.cjs advance CHG-ENG-00N --to closed
```

The evidence of a change covers the files of the components it touches. When `engine/` changes afterwards, the
evidence turns stale (⚠️ on the board, an error in `royascaff ci`) until `verify` runs again. That is the point:
what the board calls done is still true.

## Releases

A release is a git tag on this branch plus a `REL-` record (`royascaff new record release "<version>" --includes CHG-…`).
The old `history/engine-1.4-beta.N` folders stay as frozen history; nothing new goes into them.

`npm run deploy` (in `engine/`) takes the npm tag from the version: `1.5.0` goes to `latest`, `1.5.0-beta.1` to `beta`.
The tag is passed to `npm publish --tag`, which wins over `publishConfig` in `package.json`.
