Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2 — TASKS 2 and 3, against `build-brief-2-1.md` and `build-diff-2-1.md`. Two tasks and ten planned tests in one file satisfy the supplied caps; TASK 3 records `TEST FIRST: n/a` for text-only changes covered by existing tests.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

TASK 2 is not fully satisfied: its planned tests pass, but slot-holder reporting fails under the documented `set -e` API contract when only a numbered slot remains occupied. The independent probe acquired two real `tests` slots with an isolated cache, released slot 1 while slot 2 stayed held, and invoked `local_stack_lock_holder tests` from `bash -e`. It exited 1 with no holder output. The unconditional `cat` of the now-absent primary sidecar aborts the shell before the new numbered-slot loop. This edge case is absent from the current planned tests.

The remaining TASK 2 changes map to real implementation: positive slot validation with a single fallback note, one Perl slot-acquisition loop, per-slot holder files, worker-count probes and formula, inherited-owner lock-order refusals, TTY-sensitive wait defaults, and serialized per-checkout history updates and duration notes. The required lock/dogfood suite passed 107 tests (`tmp/724-group2-task2-tests.log`); independent Bash syntax and template/dogfood byte comparisons passed. Fresh-consumer evidence also exercises real slots, workers, refusal and history. Error and history-write failure paths retain bracketed subsystem diagnostics. The holder-reporting gap still prevents listing TASK 2 as satisfied.

TASK 3 satisfies its DONE WHEN. The canonical machine-lock section documents adoption, gate wrapping including a complete chained command, slots, worker use, lock order, wait defaults, exits and compatibility. Shared rules and all three named prompts point to that section; the instruction catalog and generated host copies carry the same reference. The Unreleased entry provides the rename and adoption instructions. Independent execution of the required old-name grep returned 1 with no matches, and the gate-wiring count was 2. The template/instruction suites passed all 349 tests (`tmp/724-group2-task3-tests.log`). The fresh all-host consumer check reports `0 write(s) would occur` and zero blockers (`tmp/724-group2-consumer-check.log`); final generation and static validation passed. Its documentation matrix portions are complete.

The test-first audit is enforced and PASS with zero gaps and zero unproven tests. All ten TASK 2 matrix rows have tests in its DONE WHEN suite. The already-landed test `a killed tests-lock holder frees its slot within a second and the waiter starts` is accepted at red because the existing Perl process already detects its dead parent, releases flock, and the waiter polls each second; the green audit confirms it passes. The carried-over stalled-holder setup now uses `replaceAll` as the task requires, with assertions preserved. No existing expectation was loosened, and there are no acceptance decisions for this group's gaps. The supplied `build-decision-2-1.md` concerns Group 1's caller-directory correction and does not waive a Group 2 failure.

The broad changed-file gate is still failed and is not replaced by a focused retry or failure-ledger entries. It recorded four `runs.test.ts` timeouts at 5090 ms, alongside 6667 passing and two skipped tests (`tmp/724-group2-changed.log`). The unchanged focused retry passed 171/171 (`tmp/724-group2-runs-recheck.log`); this supports a load-sensitive failure but does not establish its cause or a broad-suite pass. Neither that test file nor its implementation is changed by this group. These failures remain explicit workflow-gate evidence, separate from TASK 3's satisfied documentation DONE WHEN checks. No redundant broad run was performed during verification, and this report makes no full-suite-green claim.

## Identified Gaps Log

TASK 2: `.bkit/templates/scripts/ci/bkit-machine-lock.sh` `local_stack_lock_holder` — numbered-slot-holder-under-errexit: with BKIT_TEST_SLOTS=2, acquire both slots, release slot 1 while slot 2 remains held, then invoke local_stack_lock_holder tests from bash -e. It exits 1 with empty stdout because cat of the absent tests.lock.holder aborts before enumerating tests.2.lock.holder. Report every extant holder without treating an absent slot as a shell-fatal error; add a real-slot regression and keep the dogfood copy identical — Fixable: true
