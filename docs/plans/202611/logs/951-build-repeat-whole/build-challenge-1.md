Verdict: CONCERNS
Failures: 5
Fingerprint: 10f08c7fa931261685a4f8cd4fcf471d239044ad818a956bf1bf57d3e8d9c61f
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

The supplied diff `tmp/bkit-diff-951-build-repeat-whole.md` (8049 lines, full coverage, no `partial diff coverage` line) against the plan `docs/plans/202611/951-build-repeat-whole-plan.md`. Read in depth: `push-gate.ts` (`cleanHead`, `runWithReceipt`, `runPushGate`, `hasVerifiedIncrement`), `tests.ts` (`--changed-since`, the receipt wiring), `tests-changed.ts`, `status.ts` (`cleanBase`), `counters.ts`, `decisions.ts`, `settings.ts`, `core.ts` (`lowerVerifyMaxAttempts`), the Step 8 / 9 / 10 and Decision Pause edits of `.bkit/core/workflows/bkit-build.md`, and the verify and soak prompt edits. Mirrors, render snapshots and `dist/` were treated as generated copies of those sources.

## Notes

- The diff base is `dd8b4390c`, so the diff also carries four local `dev` commits that are not on `origin/dev` (`a2c12d244` 920, `d8cee96cf` discovered gotchas, `fa0400fe6` 923 pre-push PR-conflict hook, `50146e288` 950). Their hunks (the `.husky/pre-push` blocks, `catalogue.ts` tip, `telemetry.ts` `knowledge` writers opened to `ANY_WRITER`, the `prs.ts` MCP hint, the `Local pre-commit` rule text) were read but not challenged: they belong to other features' builds.
- Docs cross-checked: `.agents/docs.md`, `docs/architecture.md` (Install Lifecycle), `docs/security.md` (Shell Injection: `--changed-since` is validated with `rev-parse --verify` and file names reach the gate as argv entries, so no finding), `docs/deployments.md:541` and `:579` (the receipt promise "any code change after it runs the full gate", which Task 2 breaks), `docs/migrations.md` (every other row rewrites an old shape; Task 1 rewrites a currently valid value).
- Task 2 was confirmed by a hand run in a scratch repo, not by a test: `git status --porcelain` shows the staged rename as `R  src/a.ts -> docs/a.ts`, and with a `:(glob)docs/**` pathspec it shows `A  docs/a.ts`, one line each.
- Task 5 is hard to reach inside `/bkit-build`: `changedFiles` from `GROUP_BASE` always includes the tracked `status.jsonl`, so a group gate never sees zero files. It is still a broken contract for any other caller that passes `--artifact`.
- Checked and not a finding: `cleanBase` falls back to `origin/dev` on a missing, empty or non-ancestor sha and ignores earlier runs (`lastCleanRound` reads the active run only); `--changed-since=` with an empty or unsubstituted value is a usage error; a lock wait records no `test-run` row and no receipt; `hasVerifiedIncrement` keeps the fingerprint, tree and `noLaterFailure` checks on the new-branch path; the third holistic fix round exits 1 from `counters route` and the grant raises the limit by one full allowance.
- No tests were run; this lens reads code only.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A consumer who sets `build.verify.maxAttempts: 3` after upgrading gets it silently lowered on every later upgrade, and `bkit check` exits 1 with DRIFT DETECTED until they give in
  **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/install/modules/core.ts:1610` · **Round:** 1
  - **DONE WHEN:** The owner decides whether a verify limit above 2 is a legal setting. If it is legal → the migration runs once per install (for example gated on the install's recorded bkit version predating this release), so a value set afterwards survives `bkit upgrade` and a `bkit check` dry run records no `package.json` write for it. If it is not legal → `validCap` / `invalidAskSettings` reject `build.verify.maxAttempts` above 2 with a named error, and the plan's assumption that a consumer "must set it again after the upgrade" is struck. No agent can settle it: the migration rewrites a currently valid value (`validCap` accepts any integer >= 1), unlike every other shape-based row in `docs/migrations.md`, and `reportCheckDrift` turns any dry-run write into exit 1.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `a verify limit set above 2 after this release's upgrade is kept and bkit check reports no drift` fails on the dry-run `seedCorePackageJsonScripts` pushing a `package.json` update for `maxAttempts: 3`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A staged `git mv src/a.test.ts docs/plans/x.ts` during Step 12 hides a code deletion from the tolerated-dirt check, so a push receipt is written for a HEAD whose test file never ran
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/push-gate.ts:46` · **Round:** 1
  - **DONE WHEN:** `cleanHead` counts uncommitted paths with rename detection off (`git status --porcelain --no-renames ...` in `STATUS`), so a staged rename between a code path and a min-push path shows its code side as its own line, the filtered count differs from the full count, and `runWithReceipt` records no receipt. Verified by hand in a scratch repo: with renames on, the full status prints `R  src/a.ts -> docs/a.ts` (1 line) and the `:(glob)docs/**` filtered status prints `A  docs/a.ts` (1 line), so the counts match today.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a staged rename of code into a bookkeeping path records no receipt` fails on a receipt for HEAD being written after the passing required push gate
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** While Step 12 waits on the tests lock, another worktree's full gate fails on the same commit; the lock-wait restore then deletes that `.failed` marker (and can put back an older receipt), so a later push reuses proof across a real failure
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/push-gate.ts:108` · **Round:** 1
  - **DONE WHEN:** On a lock wait, `runWithReceipt` restores the prior receipt and `.failed` marker only when the files still hold what this run itself wrote at its start (its own `fail()` marker, no receipt); a marker or receipt another run wrote during the wait is left as it is.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a lock wait keeps a failure marker another run wrote for the same commit while it waited` fails on the `.failed` file being removed when the run callback writes a different `.failed` body and returns 81
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Every holistic limit pause now tells the owner "build holistic: attempt 3 of 2", because the pause fires only on exit 1 and passes the refused `:next` fix round as the attempt
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:165` · **Round:** 1
  - **DONE WHEN:** The holistic `LOOP_FLAGS` pass the number of fix rounds already run in the active run (the `:next` value minus one, or a `counters derive` count), so the first limit pause reads `build holistic: attempt 2 of 2` and a pause after one grant reads `attempt 4 of 4`; the mirrors and render snapshots are regenerated.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` `the holistic pause attempt line counts the fix rounds already run` fails on `LOOP_FLAGS` passing `--attempt={HOLISTIC_ROUNDS}`, which holds the `build-plan-gaps-remediate-holistic:next` value that `counters route` refused
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** `tests run --changed-since` with no changed files returns PASS but writes no `--artifact` and no clamp log, so the Step 8 `steps finish --artifact=build-group-gate-{GROUP}-<attempt>.md` that follows refuses with "does not exist"
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:1795` · **Round:** 1
  - **DONE WHEN:** The zero-change branch writes its "no files changed since {sha} — nothing to run" line to `--log`, copies it to `--artifact` with a clamp record when `--artifact` is given, and records the artifact on its `test-run` row, the same as a run that executed.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `changed-since with no changed files still writes the artifact and its clamp log` fails on the `--artifact` path not existing after exit 0
<!-- bkit:task 5 end -->
