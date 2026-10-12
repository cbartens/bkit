# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

Scope read: `examples/` is a fixture bkit _runs_ against, not an app bkit _is_. Deliverable = starting fixture + one copy/launch script; the interactive page is what a run builds in a throwaway repo. No `examples/` exists today; nothing in `.bkit/core/` needs to change.

## Approach A — Thin fixture + one flag-driven runner ⭐ Recommended

`examples/bkit-explainer/` holds only the fixed inputs (feature request, content data as a classic `.js`, example CI, `.gitignore`); one `scripts/example/new-run.mjs` copies it to a throwaway repo root, runs `bkit install`, opens the issue, prints the start command, and takes `--runs N` for benchmark mode.

- **Complexity:** `LOW` — one new data-only folder, one new script; zero bkit-core changes.
- **Extensibility:** The agent surface stays whole, so a new phase or loop is a data-file edit; a second example is a sibling folder plus the same runner.
- **Risk:** Run-to-run variance — agents own `index.html`/logic/tests, so a run can mistime a trap; mitigated by freezing the feature request + data and keeping CI pass/fail only.
- **Maintenance:** One small script + a frozen fixture; both touch only when bkit's phase skeleton or CLI changes.
- **Reuse vs new:** Reuses `gh`, `bkit install`, `node --test`, and bkit's own CI shape as reference; new = `examples/` + one runner.

Dual-load contract (load-bearing): `index.html` loads logic with a classic `<script src>` (no `type="module"`, so it opens off `file://`); the logic file assigns to `globalThis` and is `require`d directly by `node --test` (no `package.json` ⇒ `.js` is CJS in Node). One file satisfies both; no shim, no build step.

## Approach B — Scaffolded fixture (pre-placed page shell, logic stub, test skeleton)

`examples/bkit-explainer/` ships a pre-placed `index.html` shell (two script tags, empty mount point), an empty `logic.js` carrying the `globalThis` contract, the fixed data file, and a `node --test` skeleton naming the four trap cases; agents fill the logic and drawing only.

- **Complexity:** `LOW`–`MEDIUM` — more fixture files, each of which must avoid pre-solving the traps.
- **Extensibility:** Scaffold fixes the page shape up front (adding phases = data edit); changing the shape means editing the fixture.
- **Risk:** Leak — a stub test that hints the expected counter behaviour turns a review trap into a given and shrinks what review visibly catches; more of the app is "pre-built", so the demo shows bkit doing less.
- **Maintenance:** Fixture owns more surface, so it drifts with Node test-runner and page conventions.
- **Reuse vs new:** Same runner as A; new = scaffold files.

## Approach C — Split demo and benchmark tooling

`scripts/example/new-run.mjs` creates+copies+installs+prints (demo); a second `scripts/example/benchmark.mjs` loops N fresh repos, collects `status.jsonl`/`.bkit/stats.jsonl`, reports the middle run — measurement stays entirely out of the demo path.

- **Complexity:** `MEDIUM` — two scripts, a shared helper, N-repo teardown.
- **Extensibility:** Benchmark grows independently (median, multi-host later per #45) without risking the demo path; metric set expands without touching pass/fail.
- **Risk:** Two copy paths drift; N throwaway repos + runs raise cost and cleanup burden; over-tooled if a single `--runs` flag already suffices.
- **Maintenance:** Two surfaces to keep current.
- **Reuse vs new:** Reuses `new-run.mjs` as a library; new = second script + cleanup.

## Decisions

| Decided                                                                                     | Alternatives                                           | Why                                                                                                                                                          |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fixture in `examples/bkit-explainer/`, copied to throwaway repo **root** (incl. `.github/`) | Run in place under `examples/`; a GitHub template repo | Ship would merge the app back and write plan logs into bkit's own `docs/`; GitHub reads CI only from root `.github/workflows/`; every run needs a fresh copy |
| One classic-script logic file on `globalThis`, `require`d by `node --test`                  | `type="module"`; duplicated browser/node logic         | `file://` blocks modules; "one logic file" is fixed; no `package.json` ⇒ `.js` is CJS in Node                                                                |
| Content data as a classic `<script>` `.js`, not `.json`                                     | `fetch('data.json')`                                   | A page opened off disk cannot fetch a JSON file; `file://` has no server                                                                                     |
| Runner is a repo-side `scripts/example/*.mjs`, not shipped in the fixture                   | Copy into the throwaway repo and run there             | Keeps the throwaway repo = what bkit builds; runner is maintainer tooling, matches existing `scripts/readme/readme-art.mjs` pattern                          |
| One runner with `--runs N` (Approach A over C)                                              | Separate benchmark script                              | Demo and benchmark share the same copy/install path; a flag is less infra than a second script (YAGNI)                                                       |
| Traps stated once in the fixed feature request, not pinned by scaffold (A over B)           | Pre-place stub tests naming the trap cases             | Pre-solving hints convert review traps into givens and shrink what bkit visibly catches; a demoted trap weakens both demo and benchmark                      |
| Pass/fail = `node --test` green + PR merged; drawing unchecked by CI                        | Browser/Playwright test in CI                          | Input keeps the drawing layer thin and the watching user as the check; a single browser test can be added later if the benchmark needs it                    |
| Cost recorded, never gating; no token/cost source built now                                 | Add usage tracking to `.bkit/src/`                     | No usage data exists today; likely source is host session transcripts — out of scope for this fixture                                                        |
