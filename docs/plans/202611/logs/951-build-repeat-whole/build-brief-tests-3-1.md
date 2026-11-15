# Brief: group 3 — Push proof and docs (tests)

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

- Group 1: Holistic allowance, base and report numbers — done
  - TASK 1: One holistic allowance per run — done
  - TASK 2: Read the last clean holistic commit — done
  - TASK 3: Holistic checks test only what changed — done
  - TASK 4: Holistic file names carry the run number — done
  - TASK 5: Retire `--since-clean` from route and grant — done
- Group 2: Changed-files test runs and the verify-limit migration — done
  - TASK 6: Changed-files scope for `tests run` — done
  - TASK 7: The group gate tests the group's own changes — done
  - TASK 8: Soak tests only what it changed — done
  - TASK 9: Upgrade lowers verify limits above 2 — done
- Group 3: Push proof and docs — this group
  - TASK 10: Step 12 records a full-gate receipt — open
  - TASK 11: A new branch reuses a receipted ancestor — open
  - TASK 12: Docs state the new rule — done

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Step 12 records a full-gate receipt
  - **UPDATE:** `runPushGate` in `.bkit/core/engine/commands/ci/push-gate.ts`: extract the `.running` / `.failed` markers, the before/after HEAD and fingerprint check and the receipt write into one exported helper that takes tolerated pathspecs and a run callback; `runPushGate` passes no pathspecs and its own `spawnSync` run with `gitEnv()`, so its behaviour is unchanged
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: when the `run` verb's resolved gate equals `requiredPushGate(top)` and `--changed-since` is not set, it runs the gate through the helper with `minPushPathspecs(readBkitConfig(top))` as the tolerated pathspecs and its `runToLog` run (with `BKIT_TEST_REPORT_DIR` and the lock environment) as the run callback; a lock wait (exit 81) records no receipt
  - **READ:** `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: the bookkeeping pathspecs; `tests.ts` imports it from `ci.ts`, which imports nothing from `commands/workflow/`, so no import cycle forms (the helper does not import `ci.ts`, because `ci.ts` already imports `push-gate.ts`)
  - **READ:** `.bkit/core/engine/commands/land.ts`: its `requiredPushGate` / `runPushGate` calls stay correct
  - **READ:** `tierTimeouts` in `vitest.timeout-budget.ts`: the suite-level load-scaled timeout spawn-heavy tests use
  - **DEPENDS ON:** 6
  - **DONE WHEN:** after Step 12 passes, the receipt for its commit exists under `{outbox}/push-gates/`; the tests below pass, including the named no-receipt cases for an uncommitted code change, a non-required gate and a lock wait; the existing `push-gate.test.ts` receipt tests pass unchanged; the new spawn-heavy tests use `tierTimeouts(true).testTimeout`; `pnpm build` refreshes `dist/`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a passing required push gate records a receipt` fails on no receipt
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a passing required push gate with only bookkeeping uncommitted records a receipt` fails on no receipt
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a failing required push gate leaves the failed marker` fails on no `.failed` marker for HEAD
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `uncommitted code blocks the receipt until it is committed` fails on no receipt after the code is committed and the gate re-run (the first run, with code uncommitted, asserts no receipt)
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `only the required push gate records a receipt` fails on no receipt after the required gate's run (the earlier non-required gate run asserts no receipt)
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a tests-lock wait records no receipt and the re-run after the lock frees does` fails on no receipt after the re-run (the exit-81 run asserts no receipt and no `.failed` marker)

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** A new branch reuses a receipted ancestor
  - **UPDATE:** `hasVerifiedIncrement` in `.bkit/core/engine/commands/ci/push-gate.ts`: an all-zero old sha searches the ancestors of the new sha for a valid receipt and qualifies when every commit after it touches min-push paths only and no later failure exists
  - **UPDATE:** `.bkit/core/engine/commands/ci/push-gate.test.ts`: the existing test `rejects new code, a mixed push, new branches with code, and non-ancestor old heads` changes its new-branch case (line 274) to push code after the receipt instead of bookkeeping, and still asserts rejection; it is the regression guard for the matrix row "A new branch with code after the receipted ancestor still needs the full gate"
  - **READ:** `minPushUpdates` in `.bkit/core/engine/commands/ci/ci.ts`: already passes new-branch updates to `hasVerifiedIncrement`
  - **READ:** `tierTimeouts` in `vitest.timeout-budget.ts`: the suite-level load-scaled timeout spawn-heavy tests use
  - **DEPENDS ON:** 10
  - **DONE WHEN:** the first push of a build branch whose Step 12 passed, and the Step 16 push after it, run `bkit:gate:min`; a new branch with code after the receipt runs the full gate, asserted by the changed existing test `rejects new code, a mixed push, new branches with code, and non-ancestor old heads`, which passes before and after the code change; the new test uses `tierTimeouts(true).testTimeout`; `pnpm build` refreshes `dist/`; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a new branch with only bookkeeping after a receipted ancestor takes the minimum gate` fails on the full gate

<!-- bkit:task 11 end -->

### Earlier tasks this group depends on

- TASK 6 (group 2, done): Changed-files scope for `tests run` — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/.bkit/cli.md`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `tests run --changed-since` runs `bkit:gate:changed` on the files changed since that commit and writes a `test-run` row | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` runs the resolved `--gate` whole when `bkit:gate:changed` is undeclared | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` with no changed files writes a PASS row and runs nothing | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` counts failures from the changed gate's JUnit reports | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` refuses a sha that names no commit | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| `tests run --changed-since` on a tests-lock wait exits 81, writes no `test-run` row and reports `lockHolder` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 6 |
| A passing `tests run` of the required push gate on a clean tree records a push-gate receipt | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A passing required push gate with only bookkeeping paths uncommitted records a receipt for HEAD | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A failing `tests run` of the required push gate leaves the `.failed` marker for HEAD | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A passing required push gate with uncommitted code outside the min-push paths records no receipt | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A passing `tests run` of a gate other than the required push gate records no receipt | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A tests-lock wait on the required push gate exits 81 and records no receipt | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 10 |
| A new branch whose only commits after a receipted ancestor are bookkeeping qualifies for the minimum push gate | Unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` | 11 |
| A new branch with code after the receipted ancestor still needs the full gate | Unit | `.bkit/core/engine/commands/ci/push-gate.test.ts` | 11 |
