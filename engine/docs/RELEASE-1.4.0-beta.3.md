# RoyaScaff 1.4.0-beta.3 — release notes

> **For:** the benchmark rerun (3D network, prompt 1214) and the pilot team
> **Channel:** npm dist-tag `beta` (not published yet) — `npm install royascaff` still gives 1.2.5
> **Based on:** beta.2 plus step 12c, product quality (plan files 13 and 14), after the first real 1.4 run scored C

## Why this release

beta.2 made the process honest, but the product still lost the visual brief: the quality NFR was never built, deferred items were forgotten, Next features came before the core, most tests read source files, and nobody looked at the app. beta.3 turns each part of the quality bar into something the engine can check: a quote, a link, an order, an exit code, a count or a screenshot you judge.

## What changed since beta.2

- **Your request is kept and covered.** Discovery saves the request word for word (`00-discovery/request.md`) and lists every concrete demand as an `SRC-` record with its exact quote (a quote not in the request is an error). `approve project` lists request items no demand quotes; `approve roadmap` is refused while a demand is neither covered nor out of scope, and shows you what is out of scope. The board shows "Brief: X of Y demands covered".
- **Quality is planned first.** A *must* NFR of a Now/Next feature must sit in a slice before the plan is approved, and the slice that delivers it (the look-and-feel foundation) is proposed first.
- **Breadth waits.** Next and Later slices do not open until every Now feature is ✅ Done and — for web apps — you looked at it. Only you can open one earlier (`open … --force`) or move a feature to Now.
- **Deferrals name a slice.** `Deferred to: SLC-…` on a decision, component or After-state; a missing slice is an error, a vague "in a later slice" is refused at design approval. The board counts deferred items on the slice that promised them.
- **Tests first, tests that run code.** For *must* requirements and NFRs: a runner test is needed before Build, `royascaff check CHG-… --red` records that the tests fail before the code exists, and verified is refused without it. Test files that read source as text (`readFileSync("src/…")`, `?raw`) are refused.
- **The app in a real browser.** `royascaff smoke init` installs a Playwright smoke test that every full check runs: 1440, 1024 and 430 wide, console errors fail, every button must change something on screen, screenshots are kept with the evidence. With `web-3d`: frame rate over 3 s (≥ 30 fps), no blank canvas, a close-up after clicking the scene. A web app's feature or polish change is not verified without a passing smoke run.
- **Your visual bar.** A web app's discovery needs a visual bar (≥ 5 lines from the request). Your look is scored against it: `check CHG-… --result pass --note "…" --bar all|1,2,4`. Lines you did not pass show as gaps on the board.
- **`web-3d` adapter.** `init --adapter web-ui,web-3d`: visual tokens, camera framing, labels, frame budget; instancing, no per-frame allocation, dispose, no flat unlit main items.
- **Content and dependencies.** The full check fails on dependencies nothing imports (accept one with `- **Unused ok:**` on the APP record) and counts placeholder content (lorem ipsum, TODO, coming soon, "no description yet") as a warning shown with the screenshots.

## Start

```bash
git init
node <royascaffold>/engine-1.4-beta.3/bin/royascaff.cjs init --name "<product>" --code <CODE> --app web=apps/web --adapter web-ui,web-3d
node <royascaffold>/engine-1.4-beta.3/bin/royascaff.cjs install
# commit, then in the AI tool: "royascaff continue"
```

The commands you run yourself: `approve project`, `approve roadmap`, `approve CHG-…`, and your look with `--bar`. Install Playwright in the web app once (`npm i -D playwright && npx playwright install chromium`) and run `royascaff smoke init`.

## Known limits (for 1.5)

| Limit | Now |
|---|---|
| Dead-button detection on a scene that animates all the time | Every click looks like a change; your look against the bar is the judge. `- **Smoke ignore:**` skips controls you accept |
| Demand extraction depends on the AI | `approve project` shows every request item no demand quotes |
| No adapter manifests or inventory view | Adapter cards are guidance; `adopt` shows code ownership |
| No JSON Schemas per record kind | `export` / `roundtrip` guard the data |
