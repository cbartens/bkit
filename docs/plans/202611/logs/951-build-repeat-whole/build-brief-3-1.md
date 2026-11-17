# Brief: group 3 — Push proof and docs

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
  - TASK 12: Docs state the new rule — open

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

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Docs state the new rule
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Group gate (changed-files scope, Step 12 as the full check), the Step 10 row, the Allowance bullet, the ask points table (`build.holistic`, every limit 2), the loop table, § Local gate scripts (callers, the "still run whole gates" sentence, the `static-unit` row, the `$BKIT_TEST_REPORT_DIR` contract for `tests run --changed-since`)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: the receipt contract (new-branch case, `tests run` receipts, tolerated bookkeeping paths)
  - **UPDATE:** `docs/deployments.md`: the full pre-push gate paragraph and the Min push paragraph (Step 12 receipt reuse)
  - **READ:** `docs/deployments.md`: the full pre-push gate and Min push paragraphs
  - **READ:** `.bkit/core/.bkit/prompts.md`: the `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate` and `bkit-debug-failure-soak` rows (lines 206-207, 213, 352); update any row the Task 3, 7 and 8 prompt edits made untrue
  - **DEPENDS ON:** 3, 4, 5, 6, 7, 8, 10, 11
  - **DONE WHEN:** no doc says the group gate runs the whole suite, that holistic rounds reset after a clean round, or that a new branch with a receipted ancestor always runs the full gate; `pnpm bkit:generate` refreshes the mirrors and `.bkit/instructions.md`; `bkit check` reports no drift; `pnpm bkit:lint:prose` passes
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 12 end -->

### Earlier tasks this group depends on

- TASK 3 (group 1, done): Holistic checks test only what changed — `.bkit/core/workflows/bkit-build.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`
- TASK 4 (group 1, done): Holistic file names carry the run number — `.bkit/core/workflows/bkit-build.md`
- TASK 5 (group 1, done): Retire `--since-clean` from route and grant — `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/commands/workflow/counters.test.ts`, `.bkit/core/.bkit/cli.md`
- TASK 6 (group 2, done): Changed-files scope for `tests run` — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/.bkit/cli.md`
- TASK 7 (group 2, done): The group gate tests the group's own changes — `.bkit/core/workflows/bkit-build.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`
- TASK 8 (group 2, done): Soak tests only what it changed — `.bkit/core/prompts/bkit-debug-failure-soak.md`, `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| New-branch receipt reuse | `.bkit/core/engine/commands/ci/push-gate.ts` | `hasVerifiedIncrement` read; `minPushUpdates` in `ci.ts:733-753`; `push-gate.test.ts`; git built-in: `git rev-list --max-count` for the ancestor walk | `hasVerifiedIncrement` (existing branches only) | EXTEND | For an all-zero old sha, search the ancestors of the new sha for a valid receipt. |

Reuse Inventory rows left out: 2; Architecture entries left out: 3 — read them in docs/plans/202611/951-build-repeat-whole-plan.md § Reuse Inventory and § Architecture & Component Changes.
