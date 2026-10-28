Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Sources: plan `docs/plans/202610/701-engine-work-build-plan.md` (`Verdict: PASS`, anchor `baseSha 5c94780ac`, last committed 2026-10-28T04:58:34Z) § Acceptance Scenario (lines 42-195) and the runbook `DONE WHEN` lines (tasks 1-23, lines 608-996); `ship-input-2.md` (#701 issue text, its comments of 2026-10-26 / 2026-10-28, newest = session prompt `#701`). Checked at worktree `HEAD` `d157dd736`, diff base `origin/dev` = merge-base `b67639c33`.

Run evidence (this sweep, 2026-10-28):

- `pnpm vitest run` over the plan's named files (`tests.test.ts`, `tasks.test.ts`, `branches.test.ts`, `ledgers.test.ts`, `challenge.test.ts`, `plan-blocks.test.ts`, `conventions.test.ts`, `instructions.test.ts`, `audits/workflows/**`, `dogfood-templates.test.ts`, `template-shape.test.ts`): 38 files passed, 1521 passed, 1 skipped.
- Full unscoped `pnpm vitest run`: see Handover Notes line `Full suite`.
- All 60 `TEST FIRST` test names grep-matched exactly once in their target files (60 / 60).
- `node dist/cli.js tests plan-check --plan=docs/plans/202610/701-engine-work-build-plan.md --existence=report` → exit 0, `problems: []`, 12 groups / 23 tasks.
- `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` → exit 0, `found: false`, `disabled: []`.
- `pnpm bkit:check:dist` → `git diff --exit-code dist/` clean; `node dist/cli.js check` → exit 0 (drift-clean).

<!-- prettier-ignore -->
| # | Intended deliverable (where declared) | Status | Evidence |
| --- | --- | --- | --- |
| SC1 | `bkit tests green` prints `verdict` and a `fixable` per gap; verify prompt names no kind→`Fixable` mapping and no verdict mapping (plan :60) | Delivered | `tests.test.ts` `green prints a verdict and a fixable per gap` asserts `verdict` null and `["not-green:true","no-red:false","test-changed:null"]`; `.bkit/core/prompts/bkit-build-plan-verify.md:67-75` holds only the four diff reads, the `no-red` override and the `Enforced` / `Late-red` bullets (kept by plan § Out of Scope row 3). Process 10's roll-up over the verifier's own decided `Fixable` (`:77`) is the post-judgement header roll-up the plan mandates (Open Questions row 8, option A), not the deleted engine mapping |
| SC2 | No subagent edits the plan to tick; `bkit tasks tick` does it (plan :61) | Delivered | verify prompt `:31` "never edit the plan", `:85` `Tasks:` header line; `bkit-build-plan-execute.md:42` "Never tick a task box"; `.bkit/core/workflows/bkit-build.md:538` (Step 7) and `:664` (Step 9, one call per group) run `tasks tick` |
| SC3 | `bkit tests plan-check` exits 1 on an unmapped matrix row and on a `DELETE` with no Supersession row (plan :62) | Delivered | `tests.test.ts` `plan-check refuses an unmapped matrix row`, `plan-check refuses a delete with no supersession row` pass; this plan itself passes (`problems: []`) |
| SC4 | `bkit branches scan-diff --disabled-tests` exits 1 on an added `.skip` / `@Disabled` / `t.Skip()` and is the only place the list lives (plan :63) | Delivered | `branches.test.ts` `scan-diff finds an added skip` / `reports a disabled test with its line` pass; the branch's `bkit-ship-deferred-sweep.md` Process 8 calls the verb and lists no markers; the remaining marker mentions in prompts are the shared `Fix code not gates` rule clause (test-skip prohibition), not a scan list |
| SC5 | `bkit ledgers triage` prints buckets and writes `unjustified` / `TRIAGED` rows; sweep prompt names no reason test (plan :64) | Delivered | `ledgers.test.ts` `triage keeps a low-severity deferral exempt`, `triage marks an unjustified deferral lazy`, `triage writes an unjustified row with a minted ts` pass; branch sweep prompt Process 9 calls `ledgers triage`; grep of `four tests` / `pre-existing declaration` / `external blocker` in it → no hit |
| PS | Process Sketch WHEN/THEN lines 1-7 (plan :68-74) | Delivered | each maps to a task below; verified through the same tests and the workflow lines `bkit-build.md:492` (`tasks open`), `:538` / `:664` (`tasks tick`), `bkit-ship.md:419` (`scan-diff --disabled-tests --base=origin/dev`), plan-current prompt `:59` (`tasks currency --base={BASE_SHA} --against=origin/dev`) |
| EC | Edge Cases table, 28 rows (plan :94-123) | Delivered | each row has a matrix test (plan :132-191), all present and passing; row "`currency` with dev movement after `{BASE_SHA}`" → `currency judges base...against (origin/dev), not base...HEAD` passes |
| DTM | Derived Test Matrix, 60 rows (plan :130-191) | Delivered | 60 / 60 test names found; all files green; `plan-check` maps every row to one task |
| T1 | `green` verdict / `fixable` / `logLine`, added-lines-only `test-changed` gap; verify prompt tables gone (plan :623) | Delivered | 6 `TEST FIRST` tests pass; prompt as SC1 |
| T2 | `tasks` noun + `tick` (group required, `--tasks` / `--green` selector, idempotent, byte-identical), registered; verify prompt and build Steps 7 / 9 wired (plan :652) | Delivered | `node dist/cli.js tasks --help` lists `tick` / `open` / `currency`; 10 tests incl. `conventions.test.ts` reachability pass; `bkit-build.md:538`, `:664` |
| T3 | `tasks open` + Step 6 routes on `handover` (plan :676) | Delivered | 3 tests pass; `bkit-build.md:492-495` |
| T4 | `tasks currency` over `{base}...{against}`; plan-current prompt drops its own search (plan :697) | Delivered | 5 tests pass; `bkit-build-plan-current.md:59` calls the verb; no `git diff` / `-S` search instruction left in its Process |
| T5 | `plan-check` `matrix` / `supersession` problems, `challenge merge` matrix rows, Fix-now row, template `Task` column, scope-check drops two checks (plan :727) | Delivered | 10 tests pass; `.bkit/core/docs/templates/bkit-plan.md:71` and `docs/templates/bkit-plan.md:71` header carry `Task`; `bkit-build.md:153` Fix-now writes a matrix row, `:382` / `:546` route `matrix` / `supersession` to convert; scope-check old Process 9 / 11 removed (`git diff origin/dev...HEAD`) |
| T6 | `scan-diff --disabled-tests`; sweep prompt Process 8 and ship Step 5 pass the base (plan :750) | Delivered | 4 tests pass; `bkit-ship.md:419`; `--help` states the polarity inversion |
| T7 | `ledgers triage` + `outOfScope` reader; sweep Process 9-11 read the verb (plan :774) | Delivered | 8 tests pass; `node dist/cli.js ledgers --help` lists `triage` |
| T8 | `ship-update-docs` `Pending Items` from `ledger-scan` artifact (plan :793) | Delivered | `bkit-ship-update-docs.md:62`, `:80`; `bkit-ship.md:446` carries `--terms` / `--source` / `--artifact` / `--reset-log`, `:450` lists the artifact in `Read:` |
| T9 | `plan-scenario-detail` clause + convert Contract name the `Task` column (plan :812) | Delivered | `instructions.test.ts`, `dogfood-templates.test.ts`, `template-shape.test.ts` pass |
| T10 | prompts / workflows indexes, `docs/testing.md`, `.bkit/pipeline.md`, knowledge row (plan :826) | Delivered | `docs/testing.md:613-615` (`tasks` / `plan-blocks` / `challenge` rows), `:620` (`--disabled-tests`), `:626` (`triage`); `.bkit/pipeline.md:213` rewritten (old sentences grep → no hit); `docs/knowledge.jsonl:327` key `plan-derived-test-matrix-needs-a-task-column`; `catalog-parity` / `models-table-parity` / `verdict-vocabulary` pass |
| T11 | mirrors, capability register, `dist/` (plan :840) | Delivered | `pnpm bkit:check:dist` clean; `bkit check` exit 0; `dist` help lists new verbs and flags |
| T12 | `triage` keeps an `own-cycle` deferral exempt (plan :855) | Delivered | `ledgers.test.ts` `triage keeps an own-cycle deferral exempt` passes |
| T13 | `scan-diff` ignores removed comments / moved assertions, still reports a net drop (plan :864) | Delivered | 2 tests + control `scan-diff still reports a removed assertion` pass |
| T14 | `scan-diff` finds Python skips (plan :874) | Delivered | `scan-diff finds an added pytest mark skip` passes; red excepted by owner (`TEST EXCEPTION`, plan :877-878, `build-decision-1-2.md`) |
| T15 | `tick --tasks=none` = nothing to tick (plan :906) | Delivered | `tick treats the header's none as nothing to tick` passes |
| T16 | `triage` writes no row for a `CLOSED` deferral (plan :915) | Delivered | `triage writes no row for a closed deferral` passes |
| T17 | adjudicated `unjustified` row reported outside `Exempt` (plan :924) | Delivered | `triage reports an adjudicated unjustified row outside exempt` passes |
| T18 | `triage` refuses a plan with no task blocks (plan :939) | Delivered | `triage refuses a plan with no task blocks` passes |
| T19 | plan matrix rows for tasks 12-18; plan-check exit 0 (plan :891) | Delivered | plan :178-185 rows present; `plan-check` exit 0, `problems: []` |
| T20 | `scan-diff` ignores quoted / non-test-file markers; this branch exits 0 (plan :954) | Delivered | 2 tests pass; branch scan exit 0, `disabled: []` |
| T21 | `scan-diff` ignores changed / replaced assertions, reports a net drop (plan :964) | Delivered | 2 tests pass; branch's `tests.test.ts` rewrites yield no hit |
| T22 | `scan-diff` reports a deleted test file (plan :974) | Delivered | `scan-diff reports a deleted test file` passes |
| T23 | cross-file re-add never cancels a removal (plan :989) | Delivered | `scan-diff reports an assertion re-added only outside the test file` passes; red excepted by owner (plan :992-993) |

## Blocking Deferrals

None.

- No `Planned` deliverable is `Blocked` (table above).
- Disabled-test scan of the supplied diff: none. Evidence: `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` → exit 0, `disabled: []`; independent `git diff origin/dev...HEAD -U0` over `*.test.*` / `*.spec.*` / `test_*.py` → the only added marker-shaped lines are quoted fixture strings inside new `branches.test.ts` tests (`'@pytest.mark.skip(reason="flaky")'`, `'    @unittest.skip("flaky")'`, `'    pytest.skip("flaky")'`, `"const MARKERS = [/@Disabled\\b/];\n"`), no `it.skip` / `test.skip` / `describe.skip` / `skipIf` added. Removed assertion lines in the diff are rewrites, not deletions: `tests.test.ts` `green: red recorded, test unchanged, named test passing -> no gaps` → renamed `green with no gaps prints verdict PASS and an empty gaps` with the assertion strengthened (`verdict: "PASS"`); `a test file that only gained lines since its red is no gap` → `green emits a test-changed gap for a red whose test gained added lines only` (planned behaviour change, plan Task 1 / Open Questions row 10); `steps.test.ts:37`, `:309`, `:999` fixtures gain `Tasks: none`. The suite's 1 skipped test sits in a file the diff does not touch (changed test files: `branches`, `challenge`, `ledgers`, `plan-blocks`, `steps`, `tasks`, `tests` `.test.ts`), so it predates the diff.

## Exempt Deferrals

Plan-declared out of scope (plan § Out of Scope, `docs/plans/202610/701-engine-work-build-plan.md:326-329`; first declared in #701 `### Out of Scope`, `ship-input-2.md:212-217`, before work started). Each has a `docs/deferrals.jsonl` row, `reason` `scope-declared`, `status` `OPEN`, `severity` `LOW`; reason holds — test 4 fails (a declaration pre-dates the row: the issue text), and rows 1-3 are judgement the plan keeps with an agent, not unfinished work:

- `701-design-workflow-reviewer-audit` (`docs/deferrals.jsonl:269`, ts 1792999673565, by `plan-generate`) — design-workflow prompts not audited; no design-run measurements exist. Real future work: a new audit of `.bkit/core/prompts/bkit-design-*.md`.
- `701-sweep-deliverable-verification-stays-in-prompt` (`:270`, ts 1793000567726) — the sweep's Process 7 stays in `bkit-ship-deferred-sweep.md`.
- `701-plan-current-classification-stays-in-prompt` (`:271`, ts 1793000567728) — `Executable` / `Reword` / `Broken` call stays in `bkit-build-plan-current.md`.
- `701-verify-diff-reads-stay-in-prompt` (`:272`, ts 1793000567729) — the four diff-reading classifications stay in `bkit-build-plan-verify.md`.

LOW build-challenge findings, `reason` `low-severity`, `severity` `LOW`, written by `build-challenge` (ts 1793140354969-71); hold without the tests:

- `701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-266` (`:303`) — `tasks open` drops ticked tasks before matching the log.
- `701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-branches-ts-1126` (`:304`) — `scan-diff --disabled-tests` reads a symlinked test file's target with no containment check.
- `701-engine-work-build-challenge-low-bkit-core-engine-commands-workflow-challenge-ts-269` (`:305`) — `challenge merge`'s `matrixRows` interpolates finding text unsanitised; merge gate checks only the appended range.

Plan § Suggested Scope Expansion (plan :331-349), each declared `keep deferred` / `no action` at plan time, owned elsewhere: `#101` plan-review routing; `#699` engine run completeness; a `--fix-matrix` backfill command; the same audit for `bkit-build-plan-execute` / `bkit-build-plan-gaps-remediate`; `currency` reading `DONE WHEN` prose paths; deferral `pending-bar-155-deferred-task-range-parameter-for-bkit-build-pl`; deferral `442-plan-template-design-missing-fallback-amendment`; failure `precommit-check-dist-blocks-parallel-agents`; deferral `384-promote-status-hole-detector-from-advisory-to-gate`; deferral `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo`; `#662`; `#697`; deferral `58-test-verdict-scope-arg-accepts-empty-silently`; failure `worktree-copy-gitignored-file-breaks-commit` (already fixed). Plan § Alternative Approaches "Recommendation for a future phase" (plan :319) = the design-workflow row above.

Owner-accepted test-order exceptions (not deferrals; recorded for visibility): TASK 14 `TEST EXCEPTION` (plan :877-878, `build-decision-1-2.md`, 2026-10-28) and TASK 23 `TEST EXCEPTION` (plan :992-993, 2026-10-28) — the behaviour landed before a red could be recorded; both tests exist and pass.

Advisory only (build-process steps and merge conditions, never block the merge): unticked `🔒 Gate 2` / `Gate 3` / `Gate 4` boxes and `Verification Plan` / `👤 Manual Verification` boxes (plan :998-1039); the gate-run clauses inside `DONE WHEN` (`pnpm vitest run …`, `pnpm bkit:gate:static-unit-integration`, `bkit install`, `pnpm graph:refresh`, scratch-consumer dogfood in Task 11); Rollback Strategy. The sweep re-ran the substance anyway (Handover Notes).

## Lazy Deferrals

None. No `Planned` item was left over, and every plan-related deferral row's `reason` held at ship time, so no `unjustified` / `TRIAGED` row was appended to `docs/deferrals.jsonl`.

## Handover Notes

None — `Verdict` = `PASS`.

- **Full suite:** unscoped `pnpm vitest run` → 202 files passed, 2 failed (`auto-route-marker.integration.test.ts`, `close-squash.integration.test.ts`, 4 tests: `node_modules/.bin/bkit: No such file or directory`, `Cannot find module …/dist/install/hosts.js`). Cause: this sweep's own `pnpm bkit:check:dist` ran `rm -rf dist && tsc` while the suite was running. Re-run of both files after `dist/` was rebuilt → 2 files, 28 tests passed. Net: 204 / 204 files, 8135 passed, 1 skipped. `dist/` is byte-identical to `HEAD` (`git diff --quiet dist/`).
- **Prompt in use:** this sweep was launched with the pre-#701 sweep prompt (it still carries the hand-run reason tests and diff scan). Steps 8-9 were therefore run by hand and cross-checked with the branch's own `branches scan-diff --disabled-tests`. `ledgers triage` was not run: it has no dry-run flag and appends rows to the real ledger, and a scratch-copy run was blocked by the permission system.
- **Holistic-verify gap resolved:** `build-plan-verify-holistic.md` (CONCERNS) found that the branch's own scan exited 1 with 16 false hits. Tasks 20-23 fixed this, and the scan now exits 0.
- **Group 7 matrix gap resolved:** `build-plan-verify-7-2.md` (CONCERNS) reported 7 `matrix` problems. Task 19 fixed them, and `plan-check` now exits 0.
