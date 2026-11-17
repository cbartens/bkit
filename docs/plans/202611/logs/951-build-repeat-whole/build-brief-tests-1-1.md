# Brief: group 1 — Holistic allowance, base and report numbers (tests)

Plan: Build: Test Only What Changed While Building Implementation Plan

## Why and what

### Context & Goals

Since #889, build Step 10 (holistic verify, the whole-feature check after the last group) runs as a check, fix and check loop, and it runs again after every Build Challenge round that adds fix groups. Every round runs `bkit tests changed --base=origin/dev`, so each round re-tests every file the feature changed. In `923-pre-push-block`, tests and test-lock waits took 372 of the 442 minutes the holistic agents spent (84%). The same whole-suite re-run happens in four more places: the holistic limit resets after each clean check, so one run can reach 15 holistic checks; the Step 8 group gate runs the whole `bkit:gate:static-unit`; the debug soak agent runs the whole `pnpm bkit:gate:static-unit`; and the push after Step 12 runs the full pre-push gate again.

Goals:

- Scope every test run inside the build loop to the files changed since the last proven point: the last clean holistic commit, the group's start commit, or the soak agent's own changes.
- Keep exactly one full-suite run per build (Step 12), and let the branch's first push reuse it through a push-gate receipt.
- Make the holistic limit one non-resetting allowance per run (`build.holistic`, max 2), counted like every other build limit, and set every limit to 2.
- Put the run number in holistic report and fix-log names, so a restart overwrites nothing.

Investigation findings that shape the plan:

- The branch's first push is Step 15 sub-step 4 (`branches push --mode=feature --set-upstream`), a new-branch push. The Step 16 push is an increment on an existing branch, which the existing `hasVerifiedIncrement` logic already handles once a receipt exists. The new-branch receipt reuse therefore takes effect at Step 15, and Step 16 follows from it.
- Every engine call appends an `engine-call` row to the tracked `status.jsonl`, so the working tree is never clean while a build runs. A receipt that demands a fully clean tree (the rule `runPushGate` uses) would never be written at Step 12. The Step 12 receipt therefore accepts uncommitted changes inside the min-push (bookkeeping) paths only (Open Question 3).
- bkit's own `bkit:gate:changed` vitest stages already inherit `$BKIT_TEST_REPORT_DIR`, and `vitest.config.ts` writes a JUnit file when it is set, so a changed-files group gate keeps its failure count.

**Related Issues:**

- #951 — Build: repeat whole-feature checks re-check everything, costing hours (OPEN)
- #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (CLOSED)
- #952 — Stats: split build time into work, tests, lock waits and owner waits (OPEN)
- #750 — Workflow optimisation (OPEN)
- #840 — Ship deferred sweep: keep, slim, or drop after build verify? (OPEN)

---

### Narrative

**Rule:** while a build works, it tests only what changed. The full suite runs once, at Step 12, after everything is built and verified. The Step 16 push does not run it again when Step 12 already passed on the same code. CI on the PR still runs everything.

### Success Criteria

- A repeat holistic check runs only the tests for files changed since the last holistic check that found no problems. The first check covers the whole feature diff.
- Holistic fix rounds count within the run, with no reset after a clean check. The third fix round the run needs goes to the Decision Pause (or to the Failure Path when `ask` is false). A restart writes no holistic report or fix log over one from an earlier run.
- The Step 8 group gate and the soak agent's post-fix run check only changed files. Build Step 12 and debug Step 3 still run the full suite.
- After Step 12 passes, the Step 16 push skips the full pre-push gate when the commits after the Step 12 commit touch bookkeeping paths only. Any code change after it runs the full gate.
- On a build shaped like 923 (two challenge rounds, each adding a fix group), the repeat holistic rounds take at least half less time, measured from the step rows with owner waits excluded.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Trimming the logs the holistic verifier reads (8% of the time) — deferral `951-trim-holistic-verifier-inputs` | No Success Criterion, Edge Case or test row needs it; the measured cost is in test runs, which this plan scopes | #951 § Out of Scope; a future issue if reading time grows |
| Running regen commands for mechanical gaps instead of a fix round (option E) — deferral `951-holistic-mechanical-gap-regen-option-e` | The allowance and scoped tests meet the goal without it | #951 § Out of Scope; a future design issue |
| Skipping the holistic check between challenge rounds (option D) — deferral `951-skip-holistic-between-challenge-rounds-option-d` | Scoped holistic rounds meet the time goal while keeping the check | #951 § Out of Scope; revisit after measuring |
| The ship-time completeness check — deferral `951-ship-deferred-sweep-840` | It is a ship-phase decision no build criterion depends on | #840 — Ship deferred sweep: keep, slim, or drop after build verify? |

## Where it fits

- Group 1: Holistic allowance, base and report numbers — this group
  - TASK 1: One holistic allowance per run — open
  - TASK 2: Read the last clean holistic commit — open
  - TASK 3: Holistic checks test only what changed — open
  - TASK 4: Holistic file names carry the run number — open
  - TASK 5: Retire `--since-clean` from route and grant — open
- Group 2: Changed-files test runs and the verify-limit migration — next
  - TASK 6: Changed-files scope for `tests run` — open
  - TASK 7: The group gate tests the group's own changes — open
  - TASK 8: Soak tests only what it changed — open
  - TASK 9: Upgrade lowers verify limits above 2 — open
- Group 3: Push proof and docs — later
  - TASK 10: Step 12 records a full-gate receipt — open
  - TASK 11: A new branch reuses a receipted ancestor — open
  - TASK 12: Docs state the new rule — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** One holistic allowance per run
  - **UPDATE:** `ASK_POINTS` in `.bkit/core/engine/shared/settings.ts`: add `build.holistic`
  - **UPDATE:** `CONFIG_DEFAULTS` in `.bkit/core/engine/shared/settings.ts`: `asks["build.holistic"]` = `{ ask: true, max: 2 }`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the exact frozen `limits` object (lines 259-271) gains `build.holistic`
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: the exact seeded `build` block enumeration (lines 1148-1157) gains `holistic`
  - **READ:** `askBlocks` in `.bkit/core/engine/install/modules/core.ts`: seeds one block per ask point into a consumer `package.json` on install and upgrade, so the new point is seeded with no code change
  - **READ:** `derivedOf` in `.bkit/core/engine/commands/workflow/counters.ts`: `--of=<step>:next` already counts the active run's rows
  - **READ:** `pointLimit` in `.bkit/core/engine/commands/workflow/counters.ts`: frozen max times one plus the grants, and the `package.json` fallback for an unfrozen point, so no counting logic changes
  - **READ:** `docs/testing.md`: § Which tier does a behaviour need?
  - **DONE WHEN:** `counters route --of=build-plan-gaps-remediate-holistic:next --point=build.holistic` exits 1 on the third holistic fix round of a run, with a clean check between the rounds, and a new run starts its count at 0; no task commit changes `bkit.workflows` in `package.json`; `pnpm build` refreshes `dist/`; the tests below pass, and every existing settings or counters test that enumerates the ask points is updated for the new point, including `workflows.test.ts:259-271` and `core.integration.test.ts:1148-1157`; the generated `counter-prose-audit.test.ts` "2. ask points: none dead, none unknown" case for `build.holistic` fails until Task 3 adds its caller in this group, and passes at the group's end
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/settings.test.ts` `build.holistic defaults to ask true, max 2` fails on the missing ask point
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `holistic fix rounds count within the run without a reset` fails on the route refusing the point with "unknown point build.holistic"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `build.holistic falls back to the package.json setting when the run's frozen limits lack it` fails on the route refusing the point with "unknown point build.holistic"
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `install seeds a build.holistic block and keeps an existing one` fails on the seeded `package.json` holding no `bkit.workflows.build.holistic` block

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Read the last clean holistic commit
  - **UPDATE:** `route` in `.bkit/core/engine/commands/workflow/status.ts`: output `cleanBase`, the `parentSha` of `lastCleanRound(runs, workflow, step)` for `--step`, else `origin/dev`; `origin/dev` also when `git merge-base --is-ancestor {sha} HEAD` fails (the sha is gone, or a resume rebase left it off the branch)
  - **READ:** `cleanRound` in `.bkit/core/engine/ledgers/status.ts`: the clean-round rule
  - **READ:** `lastCleanRound` in `.bkit/core/engine/ledgers/status.ts`: the active run's last clean round, so an earlier run's clean row never sets the base
  - **READ:** `hasVerifiedIncrement` in `.bkit/core/engine/commands/ci/push-gate.ts`: its `merge-base --is-ancestor` call (line 197) is the pattern to follow
  - **DONE WHEN:** `status route --step=build-plan-verify-holistic` prints `cleanBase`, a check with gaps leaves it unchanged, a clean row from an earlier run is ignored, a clean sha that is not an ancestor of HEAD prints `origin/dev`, `pnpm build` refreshes `dist/`, and the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `last clean holistic base is the newest zero-failure row` fails on no `cleanBase` output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `a holistic row with gaps does not move the base` fails on no `cleanBase` output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `holistic base falls back to origin/dev with no clean row` fails on no `cleanBase` output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `a clean holistic row from an earlier run does not set the base` fails on no `cleanBase` output
    - `.bkit/core/engine/commands/workflow/status.test.ts` `holistic base falls back to origin/dev when the clean sha is no longer an ancestor of HEAD` fails on the pre-rebase sha being printed as the base

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Holistic checks test only what changed
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 10 sub-step 1 holds `cleanBase` from `status route --step=build-plan-verify-holistic` as `HOLISTIC_BASE`; sub-step 2's verify Context passes `Test base: {HOLISTIC_BASE}`; sub-step 6 routes with `--of=build-plan-gaps-remediate-holistic:next --point=build.holistic`, without `--since-clean`; only the `HOLISTIC_ROUNDS = PAUSE_MAX` disjunct of the pause conditions (lines 909 and 913) is dropped, and the `HOLISTIC_FIXABLE = false` route to `VERIFY_GAPS` at line 913 stays; `PAUSE_POINT` = `build.holistic` at each holistic pause; the Step 10 intro and the Limits paragraph name `build.holistic`; the Decision Pause holistic grant is `counters grant --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --point=build.holistic`; the resume mapping drops the `holistic` → `build.verify` special case
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the holistic run is `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`, with the Context field documented
  - **UPDATE:** `LOOPS` in `.bkit/core/engine/commands/workflow/decisions.ts`: `holistic.point` = `"holistic"`, `sinceClean` kept
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the existing `--loop=holistic` test (lines 220-255) expects `build holistic: attempt 2 of 2` instead of `build verify: attempt 2 of 2`
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** a repeat holistic check runs `bkit tests changed --base=<last clean commit>`; `.bkit/core/workflows/bkit-build.md` holds no `--since-clean`; the decision file's holistic loop line reads `build holistic: attempt N of M`; the counter-prose audit section "2. ask points: none dead, none unknown" passes; `pnpm bkit:generate` refreshes the host mirrors, `.bkit/instructions.md` and the render snapshots, and `bkit check` reports no mirror drift; `pnpm build` refreshes `dist/`; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `holistic verify takes its test base from Context` fails on the prompt's `--base=origin/dev`
    - `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` `holistic rounds route and grant on build.holistic within the run` fails on the route reading "--since-clean" on `build.verify`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `--loop=holistic names build holistic in the attempt line` fails on the line reading "build verify: attempt"

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Holistic file names carry the run number
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: every holistic report path becomes `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md` (the Step 10 intro's file pattern, sub-step 2's Create and Result paths, sub-step 3's `steps stub` paths and `steps finish --artifact` as `build-plan-verify-holistic-{RUN}-<attempt>.md`, sub-step 7's Read path, the Decision Pause `VERIFY_GAPS` item at line 141); every holistic fix-log path becomes `build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md` (sub-step 7's Create path, sub-step 9's `steps finish --artifact` as `build-plan-gaps-remediate-holistic-{RUN}-<attempt>-log.md`); the fix-log globs at line 141 and sub-step 7 read `build-plan-gaps-remediate-holistic-{RUN}-*-log.md`
  - **READ:** `.bkit/core/workflows/bkit-build.md`: Step 2 sub-step 3 holds `run` as `RUN` and runs again on every resume, so `{RUN}` is held at Step 10 and the Decision Pause
  - **READ:** `.bkit/core/workflows/bkit-build.md`: the `build-decision-{RUN}-{DECISION}.md` naming is the pattern to follow
  - **DEPENDS ON:** 3
  - **DONE WHEN:** a restarted run's first holistic check writes `build-plan-verify-holistic-{RUN}-1.md` and leaves every earlier run's report and fix log as they were; `counters derive` and `--attempt-of` take no `--all-runs` or `:all`; `pnpm bkit:generate` refreshes the mirrors and `bkit check` reports no drift; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` `holistic report and fix log names carry the run number` fails on `build-plan-verify-holistic-{HOLISTIC_ATTEMPT}.md` without `{RUN}`, which lets a restart overwrite an earlier run's report

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Retire `--since-clean` from route and grant
  - **DELETE:** `SINCE_CLEAN_FLAG` in `.bkit/core/engine/commands/workflow/counters.ts`: the route and grant flag; the `progress` verb's own `since-clean` flag stays
  - **DELETE:** `sinceCleanStep` in `.bkit/core/engine/commands/workflow/counters.ts`: its only callers are the removed flag paths
  - **UPDATE:** `derivedOf` in `.bkit/core/engine/commands/workflow/counters.ts`: drop the `--since-clean` branch
  - **UPDATE:** `grantCount` in `.bkit/core/engine/commands/workflow/counters.ts`: drop the `sinceClean` parameter
  - **READ:** `.bkit/core/engine/commands/workflow/challenge.ts`: its `grantCount` call at line 671 passes no `sinceClean` and stays unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: remove the route `--since-clean` tests of the removed flag; the `progress --since-clean` test stays
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `counters route --since-clean` and `counters grant --since-clean` exit 2; `counters progress --since-clean` still works; `.bkit/core/.bkit/cli.md` lists `--since-clean` only on `progress`; `cli-doc.test.ts` passes; `pnpm build` refreshes `dist/`; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `route refuses --since-clean as an unknown flag` fails on the flag being accepted instead of "unknown flag --since-clean"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `grant refuses --since-clean as an unknown flag` fails on the flag being accepted instead of "unknown flag --since-clean"

<!-- bkit:task 5 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `build.holistic` defaults to `ask: true`, max 2 | Unit | `.bkit/core/engine/shared/settings.test.ts` | 1 |
| Holistic fix rounds count within the run, do not reset after a clean check, and start at 0 in a new run | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| `counters route --point=build.holistic` falls back to the current `package.json` setting when the run's frozen `workflow-started.limits` lack the point | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| Install and upgrade seed `bkit.workflows.build.holistic` `{ ask: true, maxAttempts: 2 }` into a consumer `package.json` and keep an existing block as written | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 1 |
| The decision file's holistic loop line names `build holistic` and its max | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 3 |
| The last-clean holistic base is the `parentSha` of the newest holistic row with 0 failures, else `origin/dev` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| A holistic row with gaps does not move the base | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| A clean holistic row from an earlier run does not set the base | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| A clean row whose `parentSha` is no longer an ancestor of HEAD falls back to `origin/dev` | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 2 |
| The holistic verify prompt takes its test base from Context, not `origin/dev` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 3 |
| Step 10 routes and grants holistic rounds on `build.holistic` within the run, with no `--since-clean` and no `--all-runs` | Unit | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | 3 |
| Every holistic report and fix-log name in the build workflow carries the run number (`build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md`, `build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`), and the fix-log globs read the current run only | Unit | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | 4 |
| `counters route` and `counters grant` refuse `--since-clean` as an unknown flag | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 5 |
| The build Step 8 group gate runs the changed-files scope from `GROUP_BASE` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| The Step 9 group-gate command handed to remediate runs the changed-files scope from `GROUP_BASE` | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| The Step 8 group-gate sub-step and the Step 9 `Group gate` Context each re-derive `GROUP_BASE` from `status route --step=build-group-start --group=` before the `--changed-since={GROUP_BASE}` command | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 7 |
| The soak prompt runs `bkit tests changed --fallback=bkit:gate:static-unit`, with the exit-81 line | Unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 8 |
| Upgrade lowers `build.verify.maxAttempts` above 2 to 2 and leaves 2 or less alone | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
