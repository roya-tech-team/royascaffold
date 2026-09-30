# Generic Adapter

Use when no technology-specific adapter exists.

- Discover source roots and commands from `project/profile.md`.
- Classify runtime entry points, boundaries, domain/application behavior, persistence, integrations, presentation, configuration, migrations, and tests by observed responsibility.
- Never infer `verified` from file presence; require evidence.
- Treat unknown/generated/vendor paths as unresolved until profile exclusions or code-map ownership are explicit.
- Use project-declared validation commands. Do not invent framework commands.
