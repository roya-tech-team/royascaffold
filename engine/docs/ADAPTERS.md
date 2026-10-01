# Writing an adapter

An adapter teaches RoyaScaff about one kind of product, so the core can stay generic. The core knows no
language, framework, game engine or test tool by name. Everything it needs to know about yours comes from
the adapter: what to run, what to look for in the code, and what a person checks by hand.

An adapter is two files with the same name:

| File | Who reads it | What it holds |
|---|---|---|
| `<name>.md` (the card) | The AI | Short guidance: Design, Rules, Check, Words. At most 600 tokens. |
| `<name>.json` (the manifest) | The engine | What to run and ask for. Checked against `contract/schemas/adapter.schema.json`. |

Engine adapters live in the engine's `adapters/` folder. **Your own adapters live in your project, in
`project/adapters/`**, and need no change to the engine. A project turns them on in `project/profile.md`:
`adapters: [web-game]`.

## Start one, test it

```
royascaff adapter new web-game --includes web-3d     # makes project/adapters/web-game.json and .md
royascaff adapter test web-game                       # checks it; exit status 1 when a check fails
```

`adapter test` checks:

1. the manifest is valid JSON and matches the schema, and names itself like its file;
2. every adapter in `includes` exists, and the includes do not loop;
3. the card has Design, Rules and Check, and fits its token budget (600 tokens);
4. every declared check has something to run: its program is found on the path, or its own `dry` command
   exits 0. Nothing real is run;
5. the smoke template, if you declare one, exists.

A new adapter made with `adapter new` passes `adapter test` before you change anything.

## The manifest

| Field | Meaning |
|---|---|
| `adapter` | The name. The same as the file name. |
| `includes` | Adapters this one builds on. Their manifests apply first; yours adds to them. |
| `checks` | Check type to command: `unit`, `e2e`, `metric`, `smoke`, or your own word. `royascaff verify` runs the ones an app does not declare itself in `project/profile.md`. A value can also be `{ "run": "…", "dry": "…" }`. |
| `personCheck` | The person's check with a bar (below). |
| `personLook` | Which changes (kind and lowest risk) need that check before they are verified. |
| `requiresDocs` | Layer documents a project of this kind must have (for example `experience`). |
| `layers` | `requires`: knowledge layers every module of this stack should be described in (`architecture`, `data`, `rules`, `experience`, `quality`). `adopt` shows the gaps. |
| `lockfiles` | Files that pin dependencies. They are part of an evidence fingerprint: change one and the evidence turns stale. |
| `tests` | `files`: patterns that recognise test files. `readsSource`: tests that read source as text instead of calling it. |
| `scan` | What `royascaff scan` extracts from a module (below). |
| `words` | Technical words that must not appear in business documents (added to the card's Words). |
| `smoke`, `deps`, `tradeoffs` | Smoke script, dependency imports and quality trade-off patterns. See the engine's own manifests. |

## The person's check

Some things only a person can judge. The core knows one idea: **a person's check with a bar**. The adapter
says what kind it is, what the bar is called, how many lines it needs and what the person is asked to do:

```json
"personCheck": { "kind": "playtest", "bar": "Feel bar", "minLines": 5, "prompt": "Play one full round." }
```

Before the project is approved, discovery topic 8 holds a list under `**Feel bar:**` with at least
`minLines` lines. When a person records their check (`royascaff check CHG-… --result pass --note "…" --bar
all|1,2,4|none`), each line is scored, and lines that did not pass show as gaps on the board.

| Kind | Default for | What the person does | The bar |
|---|---|---|---|
| `visual` | web-ui, web-3d | Opens the app and looks (screenshots come with the evidence). | Visual bar |
| `transcript` | node (command line tools, libraries) | Reads a recorded run of the commands and their output. | Usage bar: clear messages, sensible defaults, errors say what to do |
| `demo` | web-api | Watches a scripted call sequence and its responses. | API bar: shape, errors, speed |
| `playtest` | games | Plays a round. | Feel bar: controls respond, difficulty rises smoothly, feedback is clear |

For `transcript`, set `"record": "Transcript"` and give the app a `- **Transcript:** <command> ;; <command>`
line in `project/profile.md`. `royascaff verify` runs each command and saves the commands and their output
next to the evidence; the person reads that file.

## What `scan` extracts

`royascaff scan` gives the AI facts about a module before it writes any knowledge: imports, exports, routes,
schema files, config files, test files and the biggest files. The adapter says how to find them:

```json
"scan": {
  "extensions": [".gd"],
  "patterns": { "imports": ["preload\\(\"res://([^\"]+)\""], "signals": ["^signal\\s+(\\w+)"] },
  "testFiles": ["(^|/)tests/.+\\.gd$"]
}
```

Each pattern is a regular expression; its first capture group is the fact. The name (`imports`, `signals`)
is yours. Results are cached by the content of each file, so a second scan reads only what changed.

## Worked example 1: `web-game` (a browser game)

A game that runs in the browser. It builds on `web-3d` (which brings the smoke check and the visual bar
settings), adds an end-to-end run, and asks a person to play.

<!-- example: web-game.json -->
```json
{
  "adapter": "web-game",
  "description": "Games that run in a browser",
  "includes": ["web-3d"],
  "checks": {
    "unit": "npm test",
    "e2e": "npx playwright test",
    "metric": "node scripts/royascaff-metrics.mjs"
  },
  "personCheck": {
    "kind": "playtest",
    "bar": "Feel bar",
    "minLines": 5,
    "prompt": "Play one full round on a phone and on a laptop."
  },
  "personLook": { "kinds": ["feature", "polish"], "minRisk": "medium" },
  "layers": { "requires": ["experience", "quality"] },
  "words": ["sprite", "collider", "tick", "shader"]
}
```

<!-- example: web-game.md -->
```md
# Adapter · web-game

> **What:** guidance for games that run in a browser
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- Split the game into a loop, a state, an input layer and a renderer. Name the component for each.
- Game rules (score, difficulty, win and lose) live in one place that needs no screen to run.
- Plan the feel in the experience document: controls, feedback and difficulty curve.

## Rules

- The loop never depends on the renderer. Rules can be tested without a browser.
- Input is read in one place; no component reads the keyboard or touch events by itself.
- Frame time is measured: report `fps.min` and `frame_ms.p95` as `ROYASCAFF_METRIC` lines.

## Check

- Unit tests cover the rules; an end-to-end run plays a short scripted round.
- A person plays one full round on a phone and on a laptop and scores the Feel bar.

## Words

sprite, collider, tick, shader
```

Acceptance lines for a game can use the types directly:

```
- [unit] A score never goes below zero.
- [metric] `frame_ms.p95 <= 20` on the reference level.
- [manual] Jumping feels responsive on a phone.
```

## Worked example 2: `godot` (a native game engine, run headless)

A game made with the Godot engine. Nothing runs in a browser: the checks start the engine without a window.
The program is not on every machine, so the smoke check names its own `dry` command.

<!-- example: godot.json -->
```json
{
  "adapter": "godot",
  "description": "Games made with the Godot engine, checked headless",
  "checks": {
    "unit": "godot --headless --path . -s tests/run_tests.gd",
    "smoke": { "run": "godot --headless --path . --quit-after 120", "dry": "godot --version" },
    "metric": "godot --headless --path . -s tests/measure.gd"
  },
  "personCheck": {
    "kind": "playtest",
    "bar": "Feel bar",
    "minLines": 5,
    "prompt": "Play one full round with a gamepad, and one with keyboard and mouse."
  },
  "personLook": { "kinds": ["feature", "polish"], "minRisk": "medium" },
  "layers": { "requires": ["architecture", "experience", "quality"] },
  "tests": { "files": ["(^|/)tests/.+\\.gd$"] },
  "scan": {
    "extensions": [".gd", ".tscn"],
    "patterns": {
      "imports": ["preload\\(\"res://([^\"]+)\"\\)", "load\\(\"res://([^\"]+)\"\\)"],
      "signals": ["^signal\\s+(\\w+)"],
      "scenes": ["\\[ext_resource[^\\]]*path=\"res://([^\"]+\\.tscn)\""]
    },
    "configFiles": ["(^|/)project\\.godot$", "(^|/)export_presets\\.cfg$"],
    "testFiles": ["(^|/)tests/.+\\.gd$"]
  },
  "words": ["scene tree", "autoload", "gdscript"]
}
```

<!-- example: godot.md -->
```md
# Adapter · godot

> **What:** guidance for games made with the Godot engine
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- One scene per screen or object that can stand alone; scenes talk by signals, not by reaching into each other.
- Game rules live in plain scripts with no scene dependency, so a headless test can run them.
- Plan input (gamepad, keyboard, touch) and feedback (sound, animation) in the experience document.

## Rules

- A scene never calls up into its parent; it emits a signal.
- Global state is kept in few autoloads, each owned by one component.
- Every rule script has a test that runs headless.

## Check

- `godot --headless` runs the rule tests and a short scripted round without a window.
- A person plays a full round with each input device and scores the Feel bar.

## Words

scene tree, autoload, gdscript
```

Apps declare their own commands in `project/profile.md` when they differ from the adapter's defaults.

## Keep it small

- A card is a few short lines, not a manual. Put long guidance in a layer document and link to it.
- Declare only checks that exist. A check that cannot run is worse than none.
- Run `royascaff adapter test <name>` after every change to the manifest.
