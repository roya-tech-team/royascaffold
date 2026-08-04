# Install

Scaffolding RoyaScaff copies two directories into your project and does nothing else. There is no runtime and no configuration step.

## Requirements

- Node 18 or newer (the CLI uses `fs.cpSync`)
- Cursor or Claude Code, if you want the slash commands — the engine itself works with any assistant that can read files

## Scaffold into the current directory

```bash
npx royascaff init
```

Output:

```text
Scaffolding RoyaScaff into /path/to/your-app

  copied royascaff/engine/
  copied .cursor/skills/

Done. Next steps:
  1. Open royascaff/engine/flow.md
  2. Run /initial-build (greenfield) or /reverse-engineer (existing code)
```

## What lands where

```text
your-app/
  .cursor/          # agent folder - .claude/ with --claude
    skills/         # /flow, /initial-build, /change-mode, /polish, /bug-fix, /reverse-engineer
  royascaff/
    engine/         # flow router, flows, templates, rules, project-layout
  project/          # NOT created here - the engine generates it later
```

Two things are worth noticing.

**`project/` is not created.** This is intentional. The engine knows what to build and where from [engine/project-layout.md](../../engine/project-layout.md), and it creates the blueprint root the first time you start Phase 0–4 or Phase R. You will not find placeholder folders or stub READMEs, because a file existing is meant to mean something.

**The engine sits in its own folder.** `royascaff/engine/` is separate from your source so you can upgrade it, diff it, or version it independently of your application code.

## Options

| Flag | Effect |
|------|--------|
| `--cursor` | Install the skills into `.cursor/skills/`. This is the default when no agent flag is given. |
| `--claude` | Install the skills into `.claude/skills/`. |
| `--force` | Overwrite an existing `royascaff/engine/` or `<agent>/skills/`. Without it, the CLI refuses and exits with an error. |
| `--git` | Run `git init` inside `royascaff/` only. Skipped if `royascaff/.git` already exists. |
| `--help`, `-h` | Print usage |

### Choose your agent

The skills are identical for every agent — only the folder they live in changes. Agent flags are combinable, so one run can serve a team using both editors:

```bash
npx royascaff init --claude
npx royascaff init --cursor --claude
```

`royascaff/engine/` is copied once no matter how many agent flags you pass.

### Target a specific directory

```bash
npx royascaff init ./my-app
```

The directory is created if it does not exist. Paths are resolved relative to your current working directory.

### Give the engine its own git repository

```bash
npx royascaff init --git
```

This initializes a repository inside `royascaff/` alone. Your project keeps its own git, and `project/` is tracked by your project's repository rather than the engine's. Use this if you want to track engine customizations separately or contribute changes back upstream.

```bash
npx royascaff init ./my-app --git
```

### Upgrade an existing scaffold

```bash
npx royascaff init --force
```

`--force` deletes and re-copies `royascaff/engine/` and the skills folder of every selected agent. It never touches `project/`, so your blueprint survives an engine upgrade — that is the point of engine purity. If you have customized engine files, commit or diff them first, because `--force` is a clean overwrite.

## Verify the install

```bash
ls royascaff/engine
ls .cursor/skills
```

You should see `flow.md`, `conventions.md`, `project-layout.md`, `flows/`, `templates/`, and `rules/` in the engine, and six skill folders in `.cursor/skills` (or `.claude/skills`, depending on the agent you chose).

Then open `royascaff/engine/flow.md`. That file is the entry point for every task, and reading it first is the engine's own instruction to the AI.

## Local dry-run before publishing

If you are working on the engine itself and want to test the package as a consumer would receive it:

```bash
npm pack
npx ./royascaff-1.2.5.tgz init /tmp/test-app
```

`npm pack` respects the `files` array in [package.json](../../package.json) and `.npmignore`, so this is an accurate preview of what a real install produces.

## What is in the published package

| Included | Excluded |
|----------|----------|
| `bin/`, `engine/`, `skills/`, `README.md`, `LICENSE` | `.git`, `.gitignore`, `*.tgz`, `.DS_Store`, `.cursor`, `node_modules` |

Note that `.cursor` is excluded from the package while `skills/` is included — the CLI copies `skills/` *into* your agent folder, `.cursor/skills/` or `.claude/skills/`. See the [CLI reference](../reference/07-cli.md) for full details.

## Next

Pick your starting point:

- **Greenfield, no code yet** — [Quickstart](02-quickstart.md), then `/initial-build`
- **Existing codebase, no blueprint** — [Onboarding legacy code](04-onboarding-legacy-code.md), then `/reverse-engineer`

## Related

- [CLI reference](../reference/07-cli.md)
- [Project layout](../reference/02-project-layout.md)
- [Flow router](../flows/00-flow-router.md)
