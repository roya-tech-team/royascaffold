# Card · Adopt an existing codebase

Goal: a truthful `project/` for code that already exists. Work one module per session. Never load the whole code base at once.

1. Run `royascaff init --name "<name>" --code <CODE> --app <name>=<existing folder>`. The code stays where it is.
2. List the modules: folders, entry points, routes or screens, and data. Pick one module.
3. For that module, write `CMP-` records with `Code:` globs, and the requirements the code shows. Mark every inferred fact in the body with *"inferred from code, needs confirmation"*.
4. Ask the person to confirm or correct each inferred requirement. Only confirmed facts stay as plain statements.
5. Group the confirmed requirements into features (`royascaff new feature … --horizon now`). Existing working behavior is recorded as done with evidence: use a manual-check evidence record per requirement.
6. Gaps and defects become planned slices or fixes. Do not fix anything during adoption.
7. Repeat for the next module. `royascaff validate` reports source files that no component owns.
