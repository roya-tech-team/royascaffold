# Adapter · node

> **What:** guidance for JavaScript and TypeScript code (npm packages, Node, browser bundles); `web-ui` includes it
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- One package manager and one lockfile, committed. Scripts in `package.json` are the app's Build, Typecheck, Lint and Test commands in `project/profile.md`.
- TypeScript in strict mode for new code; shared types live next to the component that owns them.
- A new dependency is a design choice: name it in the After-state (or an ADR when it shapes the architecture).

## Rules

- Every package in `dependencies` is imported somewhere; tools belong in `devDependencies`.
- No `any` without a comment saying why; no disabled lint rules without a reason.
- Tests import and call the code (`import { x } from "../x"`), never read source files as text.
- Imports follow the dependency rules of the architecture page; no deep imports into another component's internals.

## Check

- The full check fails on a dependency that nothing imports (accept one on purpose with `- **Unused ok:**` on the APP record).
- Test files (`*.test.*`, `*.spec.*`, `__tests__/`) that read application source as text are refused at verified.

## Words

npm, package, typescript, javascript, import, module, bundle, lockfile
