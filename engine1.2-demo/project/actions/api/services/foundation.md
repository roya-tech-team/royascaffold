# Services — PollPulse API · Foundation

### SVC-FOUND-01 · DatabaseService [infrastructure, internal, Foundation]
- Status: done
- Methods:
  - `initialize(): void` — create SQLite schema if not exists
  - `getDb(): Database` — return shared connection
- Deps: node:sqlite (built-in)
- Side effects: file I/O (SQLite database)
- Rules: single connection; schema migrations inline for this example
