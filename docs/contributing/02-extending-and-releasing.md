# Extending and releasing

How to add or change engine content without breaking the pieces that reference it, and how to publish the result.

RoyaScaff is MIT licensed. Fork it, change the flows, rewrite the templates — the engine is markdown and it is meant to be adapted.

## Before you change anything

Two rules constrain every edit:

1. **Engine purity.** No system-specific data in `engine/`. No repository names, brand colors, framework versions, or product nouns. Use placeholder shapes (`<api-app-key>`, `EP-<MODULE>-NN`) or generic illustrations (`Auth`, `Users`, `Billing`).
2. **Deviation-only.** Do not restate what [conventions.md](../../engine/conventions.md) already defines. Inherit it.

## Adding a template

1. Create `engine/templates/<name>-template.md`. Follow the existing shape: a one-line purpose, a `## Schema` block showing the output markdown, a field reference, and one worked example.
2. If the template needs more than a page of explanation, add `engine/templates/references/<name>-template-guide.md` and link to it from the template with a line like:

   ```md
   > Full discovery questions & field reference → `references/<name>-template-guide.md`
   ```

3. Wire it into the flow step that creates it. The step must declare **Input**, **Template**, **Output**, and **Done-when**.
4. Add a row to the "When each path is created" table in [project-layout.md](../../engine/project-layout.md).
5. Update [Templates](../reference/05-templates.md) in these docs.

If the output carries buildable artifacts, give them a status field and an ID pattern consistent with [conventions.md](../../engine/conventions.md), and make sure the relevant `_index.md` registry can roll them up.

## Adding a flow

Adding a whole phase is rare and touches the most files. In order:

1. **Write `engine/flows/<name>.md`.** Match the existing structure: purpose, prerequisites, the isolation statement, per-step Input / Template / Output / Actions / Done-when, explicit gates with their exact prompt text, and completion criteria.
2. **Delegate implementation.** If the flow writes code, do not invent a second implementation path — delegate to [change-mode.md](../../engine/flows/change-mode.md) from Step 5.4 through 5.6, as Phase 3.x and Phase 6 Path A do.
3. **Register it in the router.** Add a row to the Phase Routing table and, if it has a distinct trigger, the Quick triage table in [flow.md](../../engine/flow.md).
4. **Add a skill.** Create `skills/<name>/SKILL.md` with frontmatter (`name`, `description`) and a short body naming the phase, the preconditions, and the flow file to load.
5. **Update the flow index skill.** `skills/flow/SKILL.md` lists every command — add yours to both tables.
6. **Update the layout contract** if the flow creates new paths or pack kinds.
7. **Document it** in `docs/flows/` and add it to the index in `docs/README.md`.

### Gate wording

Gates are load-bearing. Follow the existing conventions:

- End with a direct question the user can answer yes or no
- Restate the rule: *silence is not confirmation*
- Present a concrete summary before asking, not a general intention

## Changing a flow's steps

Step identifiers (`5.4`, `R.Done.2`, `FT-5.1`) are referenced across files. Before renumbering, search for the identifier across `engine/`, `skills/`, and `docs/`. Several flows cite change-mode steps by number, and the skills repeat step summaries.

Prefer adding a sub-step (`5.1b`) over renumbering an existing one.

## Adding a rule

Generic conventions go in [engine/rules/backend-rule.md](../../engine/rules/backend-rule.md) or [frontend-rule.md](../../engine/rules/frontend-rule.md). Product-specific rules belong in the generated `project/rules.md` and are captured by the custom feature rules template.

The test: would this rule be true for the next unrelated product you build? If yes, it is an engine rule. If it mentions a provider, a brand, or a domain concept, it is not.

If a new rule should be checked, add it to the 15 cross-document checks in **both** [initial-build.md](../../engine/flows/initial-build.md) Phase 4 and [reverse-engineer.md](../../engine/flows/reverse-engineer.md) Step R.3.1 — they are parallel lists and must stay in sync — plus the report template in each flow and [Verification checks](../reference/08-verification-checks.md) here.

## Changing conventions

[conventions.md](../../engine/conventions.md) is inherited by every spec, so a change there silently changes the meaning of existing blueprints. If you change a default, existing `project/` documents that relied on the old default become wrong without any file changing.

When you do change one, note it in the release so consumers can audit their specs.

## Keeping things in sync

A checklist for any engine change:

| If you changed | Also check |
|----------------|------------|
| A flow's steps or gates | The matching `skills/<name>/SKILL.md`, and any flow that delegates to those step numbers |
| The phase list | `engine/flow.md` routing and triage tables, plus `skills/flow/SKILL.md` |
| A template's output path | The "When each path is created" table in `project-layout.md` |
| The pack or bug layout | `project-layout.md`, `change-mode.md`, and every flow that creates packs |
| Status or pack-status values | `conventions.md`, `project-layout.md`, `change-log-template.md`, `change-status-template.md` |
| The 15 checks | Both `initial-build.md` and `reverse-engineer.md`, plus both report templates |
| Anything user-facing | The matching document under `docs/` |

## Testing a change

There is no test suite — the engine is prose. Verify it the way it will be used:

```bash
npm pack
npx ./royascaff-1.2.5.tgz init /tmp/test-app
cd /tmp/test-app
```

Then run the affected flow end to end against a throwaway project and check three things:

1. Does the AI reach the step you changed without getting lost?
2. Does it produce the file at the documented path, in the documented shape?
3. Does the gate stop it, and does it wait?

For a flow change, also run one flow you did not touch — the flows share the layout contract and the change-mode lifecycle, so a change in one can break another.

## Releasing

1. **Bump the version** in [package.json](../../package.json). The repository is at 1.2.5.
2. **Check the `files` array.** It currently lists `bin`, `engine`, `skills`, `README.md`, and `LICENSE`. If you added a top-level directory that consumers need, add it here — otherwise it will not ship.
3. **Check `.npmignore`** for anything new that should be excluded.
4. **Dry-run the pack:**

   ```bash
   npm pack
   tar -tf royascaff-<version>.tgz
   ```

   Confirm the tarball contains exactly what you expect and nothing else.

5. **Install the tarball into a clean directory** and run a flow, as above.
6. **Update the README** if the install instructions, flow list, or product boundary changed.
7. **Publish.**

### A note on `docs/`

`docs/` is intentionally **not** in the `files` array. The documentation lives in the GitHub repository, and the installed package stays small — consumers get the engine, which is what they run.

If you want documentation shipped with installs, add `"docs"` to the `files` array. Be aware that it roughly doubles the package size and that the docs reference repository paths (`../../engine/...`) which resolve correctly inside the installed package too, since the relative structure is preserved.

## Contributing upstream

Source repository: [github.com/roya-tech-team/royascaffold](https://github.com/roya-tech-team/royascaffold)

Fork, make your changes, and open a pull request. Improvements to flows, templates, rules, and skills help everyone building with AI-Control. Include in the description which flow you tested the change against, and whether any existing step identifiers moved.

## Related

- [Engine architecture](01-engine-architecture.md)
- [Templates](../reference/05-templates.md)
- [CLI reference](../reference/07-cli.md)
- [Verification checks](../reference/08-verification-checks.md)
