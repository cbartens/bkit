Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 12
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1 — TASKS 1 and 12, against `build-brief-1-1.md`, `build-brief-1-2.md`, and `build-diff-1-3.md`. Two tasks and eleven planned tests in one file satisfy the supplied group and per-task caps. The saved group baseline predates the rebase onto dev; unrelated upstream changes in the cumulative diff are not credited as these tasks' deliverables.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-1-1.md` found four fixable gaps. `build-plan-verify-1-2.md` confirmed three fixed and retained the caller-directory test setup gap. Both remediation logs were considered. All four gaps are now resolved.

## Notes

TASK 1 satisfies its DONE WHEN. The four named test files passed all 400 tests (`tmp/724-group1-attempt2-tests.log`), including all 31 lock cases. The green audit records all ten TASK 1 planned tests passing with red evidence. Independent checks in this verification passed for Bash syntax, byte-identical template and dogfood copy, removal of both superseded files, and exact compatibility-fixture equality with the main merge-base version. The machine-lock catalog and Contract rows name the new template; architecture contains the single adopted `scripts/ci/` entry; the testing documentation covers the integration file and frozen fixture. The currency report's fixture revision discrepancy remains explained by the satisfied explicit DONE WHEN comparison.

TASK 12 satisfies its DONE WHEN. `build-decision-2-1.md` records the owner's explicit **Decision: Fix now**, routing the caller-directory correction through the tests step and requesting the rebase. This is not an assumed acceptance or a waived failure. The tests-step diff passes each copied checkout as the process directory and preserves the existing exclusion, wait-duration, lock-path and caller-checkout expectations. It adds a real `pwd -P` regression for both sourced and command-mode helpers. `build-tests-red-1-2.md` records that regression and the cross-repository case failing before the helper fix, with no audit gaps. The following code-step diff changes only helper signatures and subprocess `cwd` options, including the holder lookup, outside the frozen test bodies. Production lock code was not undone. The current green audit records both cases passing.

The remaining `delete-still-referenced` audit result is not an implementation gap. Every hit was assessed: `CHANGELOG.md:230` describes the historical 5.5.1 artifact, and the five fixture occurrences describe the intentionally frozen older implementation. They are references to preserved historical versions, not current dependencies on the deleted template. Active catalog and copy/run/source instructions use `bkit-machine-lock.sh`. The historical text and byte-frozen fixture must remain intact.

The previous lock-state collision and unset-variable regressions remain fixed; the relevant production files are unchanged since the successful attempt-2 verification and their four regression cases pass in the full lock suite. All eleven group-relevant Derived Test Matrix rows have tests covered by the tasks' DONE WHEN commands. Task 1's Documentation Updates portions are complete; the later groups' documentation portions remain outside this scope. Error paths retain the required bracketed `[machine-lock]` prefix and lock context.

Required changed-file verification passed: 31 related lock tests, 6197 named tests across 114 files, the additional script/Bats checks, lint, formatting, and both typechecks (`tmp/724-group1-attempt2-changed.log`, exit 0). This also clears the earlier workflow comment-number failure. Generation is recorded passing after the rebase. These are the supplied current execution results; no redundant broad suite was rerun for this report. The green audit has zero unproven tests, no loosened-test gaps, and no unresolved non-null gap. No assertions were removed or weakened by the correction.

## Identified Gaps Log

None
