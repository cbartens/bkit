Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0.

- Both gaps from `build-plan-verify-holistic-2.md` are closed:
  - Tip vs unset block: the `pre-push-direnv` tip's `ask` in `.bkit/core/engine/checks/tips/catalogue.ts` now says to replace "the log block ... and the `.bkit/.env` unset block that follows it". Its `why` names the unset loop too, and `dist/checks/tips/catalogue.js` matches. `fires` still checks only for `direnv exec`. The planned test `pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc` (Derived Test Matrix row, Task 2) requires the tip to stay quiet once the hook has `direnv exec`. The template ships the log block and the unset loop together, so a copy that has one without the other is a hand edit. The deferral `922-pre-push-load-challenge-low-bkit-core-engine-checks-tips-catalogue-ts-480` already records that `fires` matches loosely.
  - Ledger row: `docs/decisions.jsonl:802` now carries `ts` 1794441939244, a millisecond value; `firstTs` and `updates` are unchanged. `ledger-integrity.test.ts` passed in all three full runs below.
- Group 1 and group 2 work together:
  - The worktree narration (Task 4) says the push will block exactly when the hook (Task 1) blocks: an `.envrc` that is present and untrusted, with `direnv` on `PATH`.
  - The unset loop (Task 5) runs at the top of the inner run, after `direnv exec .` (Task 1) has loaded `.envrc`, so the loaded tooling keys are removed before the gate runs.
  - The `BKIT_PRE_PUSH_LOGGED` guards on the `gh-mcp` advisory and tip silence the missing-token warnings that this deliberate unset would otherwise trigger inside the inner run.
  - Both hook copies are byte-identical on lines 20-65, and the sources and mirrors of `templates.md` and `workflows.md` match in the edited sections.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: PASS, 0 failures, Tasks 1, 2, 3 (ran before group 2 existed).
- `build-plan-verify-holistic-2.md`: CONCERNS, 2 integration gaps (`pre-push-direnv` tip ignored TASK 5's unset block; `docs/decisions.jsonl:802` hand-typed `ts` broke `ledger-integrity.test.ts`), Tasks 1, 2, 3, 4. `build-plan-gaps-remediate-holistic-2-log.md` fixed both (Gap 1 marked partial: the `ask`/`why` now name the unset block, `fires` kept as the planned test requires), with its group gate BLOCKED on a hung run.
- `build-plan-verify-1-1.md` (Group 1): PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md`, `-2-2.md` (Group 2): CONCERNS, closed by `build-plan-gaps-remediate-2-1-log.md` and `-2-2-log.md`; `build-plan-verify-2-3.md`: PASS, Tasks 4, 5.

## Notes

- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (via `node dist/cli.js`) ran three full times and exited 1 each time. It also exited 81 once (lock held by `.worktrees/916-tests-lock-waiting`) and was re-run. Every run had the same shape: related 46 files / 2773 tests passed; named run 1 failed, 226 files passed (9327 passed, 2 skipped); prettier passed; typecheck ran. The single failure was a different test each run:
  - Run 1: `.bkit/core/engine/commands/workflow/locks.test.ts` `serializes publication for one target and invocation` (lock not acquired).
  - Run 2: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `check flags an old marker; upgrade restamps every marker ...` (timed out at 45.6 s).
  - Run 3: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault` (timed out at 43.8 s).
  - The branch changes none of these files or the code under them (`git diff --name-only origin/dev...HEAD`). Run alone, each passes: `locks.test.ts` 3 of 3 runs, the upgrade test in 24 s and the tracker test in 20 s. The 1-minute load average stood at 11-21 during the runs (other worktrees' agents). These are timing failures under load, not failures this plan caused, so none is logged as a gap. A green gate run is still owed before merge; the pre-push gate gives one. Proposed separately: these three tests' timeouts or lock waits are sensitive to machine load.
- TASK 1: both hook copies carry the direnv log block: the condition, the `direnv exec . true` probe, the `direnv allow .` block with `pre_push_rc=1`, the `direnv exec . sh "$0" "$@"` inner run and the plain fallback. The six matrix rows in `describe(".husky/pre-push direnv")` loop over both hooks and passed in every full run.
- TASK 2: `pre-push-direnv` is in the source and in `dist/`. Its matrix test passed. In this repo the tip does not fire: `fires(cwd)` against `dist/` returns `false`, with `.envrc` present and `.husky/pre-push` holding `direnv exec`. That also settles the out-of-scope note in `build-plan-verify-2-3.md` that `bkit check` printed the tip here: the tip's own detection is quiet.
- TASK 3: § Git hooks — Husky and § direnv — `.envrc` describe the shipped behaviour, including the unset loop. The text is identical in `.bkit/core/.bkit/templates.md` and `.bkit/templates.md`, and `.bkit/version` holds the mirror's new hash. TEST FIRST is n/a (docs only).
- TASK 4: in `allowDirenv` (`.bkit/core/engine/commands/workflow/worktrees.ts`), setup warns "push will block" when the `.envrc` differs from the main checkout's and when `direnv allow` fails. `dist/` matches. Line 1184 is reworded the same way in `.bkit/core/.bkit/workflows.md` and its mirror. The matrix test passed.
- TASK 5: both hook copies carry the unset loop. The matrix test `trusted .envrc → .bkit/.env tooling keys do not reach the gate` passed for both. The decision row `922-pre-push-gate-env-unsets-bkit-env-keys` (updates 2) describes the shipped loop. Decision record `build-decision-1-1.md` (Status: DECIDED) Q2 is "Fix now — fix now for both". The owner did not say which fix-now option to use; the build picked the unset (option b in the task), recorded the choice in the decision row, and earlier verify reports accepted it.
- Decision record `build-decision-1-1.md` answers Q1/Q2 "Fix now". It accepts no gap.
- No test-first audit report was supplied to this step. The group audits (`build-tests-green-1-1.md`, `build-tests-green-2-3.md`) were decided in the group verify reports.
- Derived Test Matrix: all 9 rows have a test in the named file, each tied to its task's `DONE WHEN`, and all passed. The plan has no `Documentation Updates` section. `docs/testing.md` and `docs/observability.md` exist; the hook's new message uses the hook's existing `[pre-push]` prefix.
- All five plan tasks are already `[x]`.

## Identified Gaps Log

None
