Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5, 10
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3 — TASKS 4, 5 and 10, against `build-brief-3-1.md` and `build-diff-3-1.md`. Three tasks and 21 planned tests satisfy the group caps; the tasks contain 6, 10 and 5 tests respectively, each within the supplied per-task file cap. The brief's deviation changes workflow duration, not these task contracts.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

TASK 4 satisfies its DONE WHEN. The existing five-file command/convention/reference suite passed 404 tests. The lock-wait flag validates its explicit value or `BKIT_LOCK_WAIT_S`, uses the shared whole-number parser, and defaults to 60. Classification checks the current run's exact give-up prefix, the tests lock and exit 75; unrelated lock outcomes remain gate failures. Refusal classification requires exit 73 and a tests-lock refusal line. The classifier resides in the existing `commands/lib.ts` and is re-exported from `tests.ts`, preserving the specified public API while avoiding a command-module import cycle. Independent built-CLI help lists `--lock-wait-s`, `lockHolder` and shared exit 81. The canonical CLI reference has both new flag rows, and its mirror differs only by the expected managed-marker substitution.

The null `delete-still-referenced` audit item is not a gap. The plan deletes the local `wholeNumber` definition in `workflow/runs.ts` and explicitly moves it to `commands/lib.ts`. All located source and compiled hits are the shared definition, its imports, or calls through those imports. The old local definition count is zero; the shared implementation preserves the original parser body. Removing its callers would contradict the task's requested reuse.

TASK 5 satisfies its DONE WHEN. Both command paths continue to execute the declared package gate; independent source greps find zero references to the script filename. The run path passes the wait and run identity through the environment. A recognized wait emits its holder and machine-lock messages, returns 81 and creates no artifact; refusal returns 4 with the original path/reason diagnostics. Real subprocess integration tests exercise the copied template and actual file locks in isolated consumer repositories, including waiting, mutual exclusion, CI bypass, red-mode independence, inherited workers/ownership and nested reuse. Built-CLI evidence independently records exit 81 with a holder, no artifact/status row, successful inherited environment, and a gate-owned 75 retaining FAIL/1. The final contract suite passed 467 tests with two pre-existing conditional skips. Both Claude settings files contain `BKIT_LOCK_WAIT_S=1200`, and the Claude installation suites passed 43 tests.

TASK 10 satisfies its DONE WHEN. The changed-file command uses the same classifier, supplies its own run identity and wait, and returns the same lock outcomes. The run command suppresses `test-run` rows only for a recognized lock wait. Tests assert that a waiting gate never executes and the status file remains unchanged. All four specified prompt callers now route exit 81 to rerunning the same command, with the shared instruction registered and mirrors regenerated. Independent built help exposes the changed command's flag, holder field and exit 81. The relevant matrix tests are present in the task's DONE WHEN suites, including real-boundary integration coverage.

Group documentation updates are complete: the canonical CLI, machine-lock guidance, workflow row contract, shared testing section, root testing section and test-file reference, shared prompt clause, and Unreleased entries cover the implemented behavior. Independent comparison found the new testing section identical between its source and root copy. The final generated-install check reports `0 write(s) would occur`; final generation recovered from its earlier recorded failures. Logs use the existing engine context prefix and preserve machine-lock refusal/wait diagnostics.

The enforced green audit has no unresolved gap and zero unproven tests. Two TASK 5 tests were already landed at red: `tests run under CI=1 never waits on a held tests lock` because the copied template already bypasses locking under CI=1, and `a gate that itself exits 75 is a FAIL verdict, not a lock wait` because the existing CLI already maps the gate's own 75 to FAIL while the recorded environment proves lock ownership. Both pass now. Existing expectations were preserved, including the exact PASS output assertion, which only gains `lockHolder: null`. The credential-fixture repairs clear ambient Linear credentials before cases and preserve restoration and assertions; the audit-template repair adds the new documentation section rather than weakening its coverage. The two conditional skips predate this group. No supplied decision accepts or waives a Group 3 gap.

The broad changed-file gate remains FAIL and is not superseded by the focused passes. Its final related stage recorded 3594 passes, four `runs.test.ts` timeouts at 5000 ms and two existing skips; its subsequent named stage passed 7109 tests with two existing skips. Node/Bats checks, lint, format and both typechecks passed. The separate unchanged `runs.test.ts` retry passed 171 tests with a load-scaled 10560 ms budget. These observations support sensitivity to execution conditions, not a proven root cause, and failure-ledger rows do not discharge the original failed gate. The only group change in `runs.ts` relocates the unchanged parser; the task-specific DONE WHEN suites pass. The original failed broad run remains explicit evidence for the workflow's group-gate step. No broad suite was rerun during verification, and this report does not claim that failed run passed.

## Identified Gaps Log

None
