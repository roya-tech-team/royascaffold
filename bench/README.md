# Benchmark harness

Not part of the npm package. It runs one fixture request through an agent command N times and writes
`bench/results/<date>.csv`, so changes to the engine can be compared with real numbers.

```
node bench/run.cjs --fixture cli --agent "<command that starts your agent>" --runs 3
node bench/run.cjs --report bench/results/2026-10-01.csv
```

## How a run goes

1. A fresh folder is made from the fixture's `start/` (empty when there is none).
2. The agent command runs in it. It gets these environment variables: `BENCH_REQUEST` (the request file),
   `BENCH_WORKDIR`, `BENCH_FIXTURE`, `BENCH_RUN` and `ROYASCAFF_BIN` (run the engine with
   `node "$ROYASCAFF_BIN" …`). The agent is whatever you give: a script that starts a real AI tool with the
   request, or `bench/agents/fake-agent.cjs`, which copies the fixture's reference solution so the harness
   itself can be tested.
3. The fixture grades the result. `"grade": "script"` fixtures have a `grade.cjs` with one check per rule.
   `"grade": "manual"` fixtures are graded by a person; their rows hold time and validation only.
4. One CSV row per run: time, the agent's exit status, whether `royascaff validate` passes when the run made
   a `project/`, the checks passed, a score (percent of checks) and a quick letter (A 90, B 75, C 60, D 40).
   The letter is a proxy. The owner's review decides the real grade.

## Fixtures

| Fixture | Request | Graded by |
|---|---|---|
| `cli` | A small to-do list command line tool with a spec (`fixtures/cli/request.md`) | `fixtures/cli/grade.cjs`, 17 checks |
| `web-3d-network` | The 3D network web app of the 1.4 benchmark. A pointer: the prompt lives in `tools/3d-network/base-prompt-ai-test/prompt.md` next to this repository | A person, with `tools/3d-network/review.csv` |

A later fixture is a browser game.

## What is not here

The model runs themselves. They need model credentials and an agent tool, which this repository does not
carry. Acceptance gate A2 (a median grade of B or better on two fixtures, three runs each) is run by the
owner with the owner's agent command.
