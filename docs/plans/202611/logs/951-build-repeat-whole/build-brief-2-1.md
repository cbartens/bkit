# Brief: group 2 — Changed-files test runs and the verify-limit migration

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
- Group 2: Changed-files test runs and the verify-limit migration — this group
  - TASK 6: Changed-files scope for `tests run` — open
  - TASK 7: The group gate tests the group's own changes — open
  - TASK 8: Soak tests only what it changed — open
  - TASK 9: Upgrade lowers verify limits above 2 — open
- Group 3: Push proof and docs — next
  - TASK 10: Step 12 records a full-gate receipt — open
  - TASK 11: A new branch reuses a receipted ancestor — open
  - TASK 12: Docs state the new rule — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Changed-files scope for `tests run`
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb's `--changed-since=<sha>` validates the sha, runs `bkit:gate:changed` with `changedFiles(top, sha)` as arguments under the same `BKIT_TEST_REPORT_DIR` and lock environment, writes the same `test-run` row with `scope` naming the changed gate and the changed-file count (not the file list); zero files → PASS row, nothing run; undeclared → the resolved `--gate` whole; a lock wait keeps exit 81, no row and `lockHolder`
  - **READ:** `changedFiles` in `.bkit/core/engine/commands/workflow/tests-changed.ts`: the changed-file list
  - **READ:** `resolveGate` in `.bkit/core/engine/commands/workflow/tests.ts`: declared-gate resolution
  - **READ:** `classifyLockExit` in `.bkit/core/engine/commands/workflow/tests.ts`: the exit-81 lock-wait path (lines 1784-1786, 1827-1828, 1860)
  - **READ:** `docs/security.md`: § Shell Injection
  - **READ:** `tierTimeouts` in `vitest.timeout-budget.ts`: the suite-level load-scaled timeout spawn-heavy tests use
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated with `pnpm cli:sync`
  - **DONE WHEN:** a group gate row records the changed-files scope; a lock wait on the changed gate exits 81 with no row; `pnpm build` refreshes `dist/`; the tests below pass against real temporary git repositories and real gate scripts, with `tierTimeouts(true).testTimeout` as their timeout
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since runs the changed gate on changed files and writes a test-run row` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since runs the --gate whole when bkit:gate:changed is undeclared` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since with no changed files writes a PASS row and runs nothing` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since counts failures from the changed gate's JUnit reports` fails on "unknown flag --changed-since"
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since refuses a sha that names no commit` fails on the usage error naming the flag instead of the sha
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since on a tests-lock wait exits 81 with no row and reports lockHolder` fails on "unknown flag --changed-since"

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** The group gate tests the group's own changes
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 8 sub-step 8 and Step 9 sub-step 3's `Group gate` Context run `tests run --gate=bkit:gate:static-unit --changed-since={GROUP_BASE}`; when `GROUP_BASE` is not held (Decision Pause re-run or resume), each re-derives it from `status route --step=build-group-start --group={GROUP}` first
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: line 77 describes the group gate's changed-files scope
  - **DEPENDS ON:** 6
  - **DONE WHEN:** the group gate's row scope names the changed-files gate; the existing local-gate-audit probes for `build-group-gate-` and `build-run-tests` pass, with Step 12 still running the whole deepest gate; `pnpm bkit:generate` refreshes the mirrors and render snapshots and `bkit check` reports no drift; the tests below pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `group gate runs the changed-files scope from GROUP_BASE` fails on the whole static-unit gate
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `the remediate group gate runs the changed-files scope from GROUP_BASE` fails on the Context's whole static-unit gate
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `both group-gate sites re-derive GROUP_BASE before the changed-since gate` fails on no `status route --step=build-group-start --group=` line before the gate, which leaves an empty `--changed-since=` usage error on the Decision Pause re-run and resume

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Soak tests only what it changed
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-soak.md`: step 6 and the `Verdict` lines run `bkit tests changed --fallback=bkit:gate:static-unit`, with the exit-81 line remediate has
  - **READ:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: its `bkit tests changed` command and exit-81 line (lines 87-88)
  - **UPDATE:** `GATE_CALLERS` in `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: add the soak prompt's `--fallback=bkit:gate:static-unit` call site
  - **UPDATE:** `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`: the exit-81 audit's caller count (`expect(callers).toHaveLength(4)`, lines 183-184) becomes 5, so it also covers the soak prompt
  - **DONE WHEN:** the soak prompt names no whole-gate run; the exit-81 audit asserts 5 `--fallback=bkit:gate:` callers and passes; `.bkit/core/workflows/bkit-debug.md` Step 3 still runs the deepest declared gate whole; `pnpm bkit:generate` refreshes the mirrors and `bkit check` reports no drift; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `soak runs the changed-files gate` fails on `pnpm bkit:gate:static-unit`

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Upgrade lowers verify limits above 2
  - **UPDATE:** `seedCorePackageJsonScripts` in `.bkit/core/engine/install/modules/core.ts`: call a new `lowerVerifyMaxAttempts` after `migrateBkitLayout`, built like `pruneMinPushPaths`; it sets `bkit.workflows.build.verify.maxAttempts` above 2 to 2, logs one `[bkit] core:` line naming the old value, keeps the original indent, honours `dryRun` and leaves 2 or less alone
  - **UPDATE:** `docs/migrations.md`: one row for it (`Where` `.bkit/core/engine/install/modules/core.ts`, `Releases` up to 6.1.x, `Test` the test below)
  - **READ:** `docs/observability.md`: § Log Format
  - **DONE WHEN:** `bkit upgrade` on a `package.json` with `maxAttempts: 5` writes 2 and logs the old value, a second run writes nothing, and a file with `maxAttempts: 2` is untouched; `pnpm bkit:generate` on this branch leaves bkit's own `package.json` `bkit.workflows` unchanged (the Pre-Flight commit already holds 2); `pnpm build` refreshes `dist/`; the test below passes
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrade lowers build.verify.maxAttempts above 2 to 2 and leaves 2 or less alone` fails on the value kept at 5

<!-- bkit:task 9 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Changed-files group gate with a `test-run` row | `.bkit/core/engine/commands/workflow/tests.ts` | `tests run` verb read; `changedFiles` and `testsChangedVerb` in `tests-changed.ts`; `resolveGate`; `BKIT_GATE_CHANGED_SCRIPT`; framework built-in considered: Vitest's `--changed <sha>` | `bkit tests changed` (no row); `bkit tests run` (row, whole gate only); Vitest `--changed` | EXTEND | Add `--changed-since=<sha>` to `tests run`, reusing `changedFiles`. Vitest's `--changed` is rejected: the engine is stack-agnostic, so the consumer-owned `bkit:gate:changed` contract (`.bkit/workflows.md` § Local gate scripts) decides how a stack tests changed files. |
| Workflow wiring | `.bkit/core/workflows/bkit-build.md` | Step 8 sub-steps 3 and 8, Step 9 sub-step 3, Step 10, Decision Pause and resume mapping read | existing `GROUP_BASE` hold, `counters derive`, `steps finish --attempt-of`, the `{RUN}` hold and `build-decision-{RUN}-*` naming | EXTEND | Edit the existing blocks; no new step. |

Reuse Inventory rows left out: 2; Architecture entries left out: 6 — read them in docs/plans/202611/951-build-repeat-whole-plan.md § Reuse Inventory and § Architecture & Component Changes.
