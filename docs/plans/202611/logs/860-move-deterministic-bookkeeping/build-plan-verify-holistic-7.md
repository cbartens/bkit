Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Holistic`

## Groups Verified

9 of 9 plan groups verified (groups 1-9; Tasks 1-31).

## Integration Gaps

0 integration gaps.

- **Task 30 against Tasks 3/4 (closed):** `ledgerKeys` (`.bkit/core/engine/commands/workflow/steps.ts:1567`) now reads `path.resolve(cwd, "docs", "failures.jsonl")`. That is the file `ledgers append` and `ledgers query` use by default (`rootOf`, `.bkit/core/engine/commands/workflow/ledgers.ts:221`). The audit prompt (`.bkit/core/prompts/bkit-audit-generate.md` step 11) runs `steps stub` and `ledgers append` from the same working directory with no `--root`, so the renderer and the append now read the same ledger. `dist/commands/workflow/steps.js:1262` carries the same line.
- **Reproduced against `dist/cli.js`** with `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/c8df0e69-6e8c-4878-95dc-cd64f434fb6b/scratchpad/h6wt2.sh`. From the linked worktree `.worktrees/feat`, audit 1 (`src/old.ts:9`) derives `audit-security-token-logged`, and audit 2 (`src/new.ts:42`, same title) derives `audit-security-token-logged-2`. `ledgers query --ledger=failures` returns both winners. The main-checkout control gives the same result.
- **Re-render stability from the worktree (the 9-1 case):** re-rendering the `src/old.ts:9` finding after its append keeps `audit-security-token-logged`. So a lost-response retry still hashes to the same request (Task 18) and replays its receipt (Task 23).
- **Task 31 against group 1, and Task 27's `--invocation` on `steps stub`:** unchanged since attempt 6. No gap.

## Previously Attempted

- `build-plan-verify-holistic-1.md` and `-2.md` (`CONCERNS`), fixed per `build-plan-gaps-remediate-holistic-1-log.md` and `-2-log.md`.
- `build-plan-verify-holistic-3.md` (`PASS`, groups 1-4).
- `build-plan-verify-holistic-4.md` (`CONCERNS`, mirror drift), fixed per `build-plan-gaps-remediate-holistic-4-log.md`.
- `build-plan-verify-holistic-5.md` (`PASS`, groups 1-7).
- `build-plan-verify-holistic-6.md` (`CONCERNS`, the Task 30 linked-worktree ledger gap), fixed per `build-plan-gaps-remediate-holistic-6-log.md`.

## Notes

- **Inputs:** the plan (31 tasks in 9 groups, all ticked), tasks logs 1-9, every verify and gaps-remediate log, decision records `build-decision-1-1.md` to `1-5.md`, and the run diff. No test-first audit report was supplied for this round. Docs index `.agents/docs.md` was loaded; `docs/testing.md` and `docs/observability.md` are present.
- **Changes since attempt 6 (`4baf5dc31..c88f22e41`):** the `ledgerKeys` path line and its doc comment in `steps.ts`, one added test in `steps.test.ts` ("reads held audit keys from the linked worktree's own ledger"), `dist/commands/workflow/steps.js`, one friction row, two red reports and the status log. No other engine, prompt, workflow or mirror file changed, so the Task 1-29 and Task 31 findings of attempt 6 still hold.
- **Accepted, not a gap:** group 8's code step edited the planned tests of Tasks 3 and 9 (the `complete` to `clean` rename), and they were re-recorded as vacuous in `build-tests-red-1-7.md` and `build-tests-red-4-3.md`. The caller accepted this for this round.
- **Tests run by path, from the worktree top (all pass):** `steps.test.ts` and `issues.test.ts` (221 tests). Then `commands/workflow/{status,ledgers,counters,runs,run-facts,challenge}.test.ts`, `commands/lib.test.ts`, `ledgers/{status,telemetry}.test.ts`, `ledgers/journal.integration.test.ts`, `render/trackers.test.ts` and `tools/instructions.test.ts` (12 files, 1146 tests). `tsc -p tsconfig.test.json --noEmit` reports no errors.
- **`dist/` is current:** `tsc -p tsconfig.json` into scratch (117 `.js` files) matches `dist/` exactly (`diff -rq` shows nothing).
- **Matrix:** all 52 `Derived Test Matrix` rows were checked by script again. Each named test appears exactly once in its named file.
- **Full suite:** not run, and `bkit tests changed` not run, on the caller's instruction. The last full run is group 8's gate `build-group-gate-8-3.md` (`Tests 7418 passed | 2 skipped`). Since then only the files run above have changed.
- **Out of scope, not a gap:** a first test run started from `.bkit/core/engine/` (not the repo top) failed 3 tests. It also appended a test `widgets-twice` friction row to the real `.bkit/friction.jsonl`. I removed that row, and the file matches HEAD again. The same files pass when run from the repo top, the supported way to run them. Running tests from a subdirectory lets them write to the repo's own ledger; this could be proposed as a separate fix. The out-of-scope items carried from attempt 6 still stand: the absolute outbox `log` path in `test-run` rows, `docs/deferrals.jsonl:235`, and the `-N` key suffix wording in `bkit-audit-generate.md` step 11.
- No source file was edited.

## Identified Gaps Log

None.
