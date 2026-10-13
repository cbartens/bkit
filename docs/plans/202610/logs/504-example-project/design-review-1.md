Verdict: CONCERNS
Spike: TRUE

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

Inputs: `design-v1-draft.md`, `design-input-2.md`. Verified against working tree bkit 5.0.2 (`/Users/christian/Documents/GitHub/bkit/.worktrees/504-example-project`). Prior design-spike evidence (`docs/plans/202610/logs/504-example-project/design-spike.md`) is cited where the draft rests on it; claims re-checked in source.

## Prior Art Search

| Capability                                                | Prior art (path, maturity)                                                                                                                                                                                                                  | Fit / gaps                                                                                                                                                                                                                          | Recommendation                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Repo-side maintainer runner `scripts/example/new-run.mjs` | `scripts/readme/readme-art.mjs`, `scripts/ci/lanes/*.mjs`, `scripts/slop/*.mjs` — established `scripts/<area>/*.mjs` convention                                                                                                             | Same shape; `scripts/` is outside `vitest.config.ts` include (`.bkit/core/engine/**`) and outside `tsconfig.json` include → runner is untested by vitest and untyped, as the draft states                                           | `EXTEND-EXISTING`                                                                      |
| Screenshot capture                                        | `scripts/readme/readme-art.mjs` — auto-detected Chrome, `--headless=new`, no dependency                                                                                                                                                     | It is a **script**, not a reusable module; "reuse the mechanism" means copying the detect+invoke block                                                                                                                              | `ADAPT` (draft says EXTEND; the copy is real work, small)                              |
| Runner bats verification                                  | `tests/fixtures/gh/bin/gh` shim; `tests/gh-stub-smoke.bats`, `tests/bkit-cloud-bootstrap-preflight.bats`; `bkit:test:bats` runs `bats tests/*.bats`                                                                                         | Stub dispatches **only** `gh api` URLs: `rate_limit`, `…/workflows/…/runs?head_sha=`, `…/runs?branch=`, `…/actions/runs/*/jobs` (four shapes, not "three"). No `gh repo create` / `gh repo view` / `gh issue create` / `gh pr view` | `ADAPT` — stub must be extended or the suite scoped to reset/preflight/gate-chain only |
| Gate chain (`bkit:gate:static-unit`)                      | `BKIT_GATE_SCRIPTS` `.bkit/core/engine/install/manifest.ts:215`; seeded add-if-missing, never overwrites                                                                                                                                    | Verified: chain calls `pnpm typecheck && pnpm lint && pnpm format:check && pnpm lint:prose && pnpm slop:delta` then `pnpm test`; pre-declared stubs are the intended idiom                                                          | `EXTEND-EXISTING`                                                                      |
| Results store + read path                                 | `.bkit/stats.jsonl` (tracked, `.gitattributes:23 merge=union`); rows carry `bkitVersion`; `.bkit/jsonl.md` § Per-Kind Fields                                                                                                                | Rows and envelope verified. **Gap:** `outcome.parentSha` is per-workflow-step and forensic (`ledgers/status.ts:14-16`), not a per-cycle anchor — see CRITICAL                                                                       | `EXTEND-EXISTING` (store) / read-key needs rework                                      |
| Run marker                                                | `.bkit/jsonl.md`: `kind` closed 9-member enum, no `run`; writers table exhaustive, no runner-written kind                                                                                                                                   | Draft's choice (reset commit + `git log --grep`) avoids a schema change and is correct                                                                                                                                              | `USE-AS-IS`                                                                            |
| Version read                                              | `.bkit-version` JSON `pinnedVersion` — `.bkit/core/engine/install/version-file.ts:26,70`                                                                                                                                                    | Verified; raw-trim reads break on the JSON envelope                                                                                                                                                                                 | `USE-AS-IS`                                                                            |
| Install / upgrade / worktree                              | `bkit install --claude --tracker=github`; `bkit upgrade --latest` (`.bkit/core/engine/cli.ts:163`, `.bkit/core/engine/commands/install/upgrade.ts:578`); `bkit worktrees setup` via `main`-default mint off `origin/dev` (spike C1 SETTLED) | Flags exist as written                                                                                                                                                                                                              | `USE-AS-IS`                                                                            |
| Merge-gate CI (~40-line capstone)                         | `.bkit/templates/.github/workflows/bkit-ci.yml` (1065 lines, copy-and-own); `bkit.capstoneJob` default `bkit-tests-check` (`.bkit/core/engine/shared/settings.ts:32`)                                                                       | Template permits a reduced owned copy; single-job gate proven at the boundary (spike C2)                                                                                                                                            | `BUILD-CUSTOM` (justified over the template — drift surface)                           |
| Versioned runnable fixture                                | none — no `examples/` dir; `tests/fixtures/heavy-customised-consumer` is a test fixture, not runnable                                                                                                                                       | Genuinely new                                                                                                                                                                                                                       | `BUILD-CUSTOM`                                                                         |
| Sentinel pass/fail; `example/data.js` content             | none                                                                                                                                                                                                                                        | New data + new check                                                                                                                                                                                                                | `BUILD-CUSTOM`                                                                         |

Draft's reuse-table verdict vocabulary (`NEW`/`EXTEND`) does not match the canonical set; content is defensible.

## Stack Feasibility

**Buildable with the approved stack.** No new runtime dependencies: `node --test` (engines `node >=20`), pnpm pinned `pnpm@10.34.4`, `gh` CLI, headless Chrome (optional, degrades to skip — `scripts/readme/readme-art.mjs:933`). Root `package.json` is CommonJS-`type`-absent → dual-load guard holds (spike C3). bkit is **not** a pnpm workspace (no `pnpm-workspace.yaml`), so a nested fixture `package.json` is inert — no workspace breakage.

**Constraints (verified):**

- bkit's own `package.json`, not the draft, is the model for a consumer harness: `type: module`, `parser` block present, `capstoneJob`/`ciWorkflow`/`issueTracker` set. The fixture harness must be authored from scratch, not copied.
- The run repo's `scripts` chain is seeded by `bkit install` add-if-missing; pre-declared stubs must name `typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta`, `test`, `build`.
- `bkit install` needs ≥1 module flag (spike C5 DISPROVEN) — draft already absorbs it.

## Library / API Evaluation

No third-party libraries added. Footprint: fixture is data + a ~40-line workflow + a placeholder `index.html`; the runner is one `.mjs`. No license exposure (no new deps; `@cbartens/bkit` public per #408). Type coverage: the runner and fixture sit outside `tsc`/vitest scope (verified `tsconfig.json`/`vitest.config.ts`), so correctness rests on the bats suite — reinforcing the stub-coverage finding.

## Integration Risk

| System touched           | Risk                                                                                                                                                                                                   | Blast radius                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| bkit's own repo gates    | `examples/**` and `scripts/example/**` are absent from `.prettierignore` and `slop-scan.config.json` ignores → `prettier --check .` and `slop:delta` (in bkit's `bkit:gate:static`) scan the new files | bkit's own CI reds on landing — CRITICAL |
| bkit's `.agents/docs.md` | Register `examples/README.md` in consumer-owned `Project Documents` (below `bkit:end`)                                                                                                                 | Low                                      |
| `.bkit/stats.jsonl`      | `merge=union` installed; serial invariant unenforced                                                                                                                                                   | Medium (design-accepted)                 |
| Run-repo CI              | Capstone must stay present+green at PR head with PR-only steps added                                                                                                                                   | Medium — unspiked                        |
| `dev` protection         | Runner writes `dev` directly; bootstrap must not enable protection                                                                                                                                     | Low, configurable                        |
| Worktree setup           | Copies `.env*` into worktrees (spike C1) → privacy scan load-bearing                                                                                                                                   | Medium                                   |

No monorepo coupling (not a workspace). Primary blast radius is bkit's own gate, not the run repo.

## PoC Approach

Throwaway second public repo (`cbartens/bkit-example-poc`) driven by a cut-down runner: bootstrap (create, seed `main`=fixture, push `dev`=harness+fixture), then **re-run bootstrap** to prove idempotent verify-and-repair; one folder reset on `dev` with a resolved-path assertion inside `example/`; `bkit upgrade --latest` + `bkit install --claude --tracker=github`; tracker/version/gate-chain read-backs; push; file the issue; run design→plan→build→ship once; observe the capstone at PR head **with** the PR-only sentinel+privacy steps; read `.bkit/stats.jsonl` and record which field actually distinguishes the cycle's four `outcome` rows. No new dependencies.

## Unknowns & Blockers

| #   | Unknown                                                                                                                                                        | Settled by                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| U1  | `--bootstrap` create + **idempotent verify-and-repair** against a live public repo (repair path never run)                                                     | running code                           |
| U2  | Capstone stays present+green at PR head once PR-only sentinel+privacy steps are added to the single `bkit-tests-check` job (spike C2 ran the job without them) | running code                           |
| U3  | `outcome.parentSha` as a per-cycle run anchor                                                                                                                  | reading source → resolved (CRITICAL 1) |
| U4  | bats suite reach over the `gh` stub for bootstrap paths                                                                                                        | reading source → resolved (OPTIONAL)   |

U1/U2 need the live boundary → **Spike: TRUE**.

## Verdict Reasoning

Feasible as designed with caveats. The draft's components are individually proven (spike C1–C4 SETTLED; C5 absorbed) and add no dependencies; the runner sits cleanly outside bkit's `tsc`/vitest scope. It is not `PASS` because (1) the benchmark's stated run-scope key does not exist on the `outcome` row, and (2) the new fixture/runner paths land inside bkit's own format/slop gates unregistered — both must be fixed before planning. It is not `FAIL`: both are bounded, and nothing disproves buildability.

## CRITICAL

1. **Run-scope key is wrong.** `outcome.parentSha` is captured per workflow step at step start and is explicitly forensic (`ledgers/status.ts:14-16`); identity is `(repo, workflow, parentSha)`. One design→plan→build→ship cycle emits four `outcome` rows with _different_ `parentSha`s, and `repo` is constant across all runs in the persistent repo. "Run-scope by `parentSha`" (Data Model; Success Criterion 4) cannot scope a cycle, and no `outcome` field identifies which run a row belongs to. Anchor runs by the **reset commit** (already the run marker) or the filed issue number; confirm against `.bkit/jsonl.md` per-kind fields.
2. **bkit's own gate blast radius.** `examples/bkit-explainer/**` and `scripts/example/new-run.mjs` are not excluded by `.prettierignore` or `slop-scan.config.json`. bkit's `bkit:gate:static` runs `prettier --check .` and `slop:delta` over them, so landing the fixture can red bkit's own CI; the near-empty placeholder `index.html` may also trip `comments.placeholder-comments`. Register or exclude these paths (and format the fixture) as part of the design.

## OPTIONAL

- **Lockfile + install step omitted.** Runner flow lists `bkit upgrade --latest`/`bkit install` with no preceding `pnpm install`; spike C1 shows install fails without a committed `pnpm-lock.yaml`. State that the fixture ships the lockfile and name the install step.
- **Bats reach over the `gh` stub.** The stub covers four `gh api` URL shapes only; a "bootstrap-verify" path over it hits an unmocked URL (exit 1). Extend the stub or narrow `tests/example-run.bats` to reset/preflight/gate-chain.
- **Fixture↔run-repo tree mapping unpinned.** Source `examples/bkit-explainer/` vs destination `example/`; harness sources at run-repo root vs the app folder; `FEATURE-REQUEST.md` listed both as a fixture member and a durable root file. Pin the mapping.
- **Reuse-table verdict vocabulary** deviates from `EXTEND-EXISTING|USE-AS-IS|ADAPT|BUILD-CUSTOM`.
- **`bkit` invocation form in the run repo** (`pnpm exec bkit` vs `npx @cbartens/bkit`) unstated.
- **Screenshot reuse is `ADAPT`,** not `EXTEND` — the mechanism is copied from a script, not imported.

## OUT OF SCOPE

- Cost measurement (source #526) — deferred by the design's recommended default.
- The nine "later ideas" and the tracker-`none` install advisory — already deferral rows; none added this cycle.
- bkit-CI smoke job / WS-6 — dropped by binding decision.
- `feat/{FID}` pre-exists hardening — deferred (design option A).
