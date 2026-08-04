# CLI reference

Source: [bin/royascaff.js](../../bin/royascaff.js) · Package: [package.json](../../package.json)

The CLI has exactly one job: copy the engine and skills into your project. It has one command, three flags, and no configuration.

## Synopsis

```text
royascaff init [targetDir] [options]
```

| | |
|---|---|
| **npm package** | `royascaff` |
| **Version** | 1.2.5 |
| **Binary** | `royascaff` → `bin/royascaff.js` |
| **Node** | `>=18` (uses `fs.cpSync`) |
| **License** | MIT |
| **Repository** | [github.com/roya-tech-team/royascaffold](https://github.com/roya-tech-team/royascaffold) |

## `init`

The only implemented command. Any other command prints the help and exits with code 1.

### Arguments

| Argument | Default | Meaning |
|----------|---------|---------|
| `targetDir` | `.` | Where to scaffold. Resolved relative to the current working directory, and created if it does not exist. |

### Options

| Flag | Effect |
|------|--------|
| `--force` | Overwrite an existing `royascaff/engine/` or `.cursor/skills/`. Without it, the CLI throws `Target already exists` and exits with code 1. |
| `--git` | Run `git init` inside `royascaff/` only. Skipped with a message if `royascaff/.git` already exists. |
| `--help`, `-h` | Print usage and exit 0 |

Unknown options — any argument starting with `-` that is not recognized — print `Unknown option: <arg>` and exit 1.

Running `royascaff` with no command prints the help and exits 0.

### What it copies

| Source in the package | Destination in your project |
|-----------------------|-----------------------------|
| `<package>/engine/` | `<target>/royascaff/engine/` |
| `<package>/skills/` | `<target>/.cursor/skills/` |

Parent directories are created as needed: `royascaff/` for the engine, and `.cursor/` before the skills copy.

`--force` performs a recursive delete of the destination followed by a fresh copy. It is a clean overwrite, not a merge.

### What it does not do

It does not create `project/`. The engine generates the blueprint root when a flow starts, via the bootstrap gate in [engine/project-layout.md](../../engine/project-layout.md). This is why `--force` is safe for upgrades: your blueprint is untouched.

### Resulting tree

```text
your-app/
  .cursor/
    skills/
      flow/SKILL.md
      initial-build/SKILL.md
      change-mode/SKILL.md
      polish/SKILL.md
      bug-fix/SKILL.md
      reverse-engineer/SKILL.md
  royascaff/
    .git/           # only with --git
    engine/
      flow.md
      conventions.md
      project-layout.md
      flows/
      templates/
      rules/
```

### Output

```text
Scaffolding RoyaScaff into /path/to/your-app

  copied royascaff/engine/
  copied .cursor/skills/

Done. Next steps:
  1. Open royascaff/engine/flow.md
  2. Run /initial-build (greenfield) or /reverse-engineer (existing code)
```

With `--git`, one of these lines is added:

```text
  git: initialized repository in royascaff/
  git: skipped (royascaff/ is already a git repository)
```

## Examples

```bash
# Current directory
npx royascaff init

# A specific directory, with a git repo for the engine
npx royascaff init ./my-app --git

# Upgrade an existing scaffold
npx royascaff init --force
```

## Exit codes

| Code | When |
|------|------|
| 0 | Success, or `--help` |
| 1 | Unknown command, unknown option, or a copy error such as an existing target without `--force` |

## Package contents

### `files` array

```json
"files": ["bin", "engine", "skills", "README.md", "LICENSE"]
```

Everything else in the repository is excluded from the published tarball, including `docs/`. These documents live in the GitHub repository rather than in the installed package.

### `.npmignore`

```text
.git
.gitignore
*.tgz
.DS_Store
.cursor
node_modules
```

Note that `.cursor` is excluded from the package while `skills/` is included. The CLI copies `skills/` *into* the consumer's `.cursor/skills/` — the package's own `.cursor` directory is development-only.

### Keywords

`ai`, `scaffolding`, `cursor`, `code-generation`, `blueprint`

## Local dry-run

To test the package exactly as a consumer would receive it, without publishing:

```bash
npm pack
npx ./royascaff-1.2.5.tgz init /tmp/test-app
```

`npm pack` honors the `files` array and `.npmignore`, so this is an accurate preview. Check that `/tmp/test-app` contains `royascaff/engine/` and `.cursor/skills/` and nothing else.

## Related

- [Install](../guides/01-install.md)
- [Project layout](02-project-layout.md)
- [Extending and releasing](../contributing/02-extending-and-releasing.md)
- [Flow router](../flows/00-flow-router.md)
