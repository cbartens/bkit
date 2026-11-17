Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-1-1.md` (13 files: the lock template and its byte-identical adopted copy, the 6.1.1 fixture, two integration test files, four doc sources and their three re-rendered mirrors, `.bkit/version` hashes). No brief has a `Deviations` section; no decision record, earlier verify report or remediation log exists for group 1.
- TASK 1: `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` exits 0; `/bin/bash -n` exits 0; `shasum -a 256 tests/fixtures/machine-lock/machine-lock-6.1.1.sh` is `63ee5873795f...` and equals `git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh`. The Perl helper creates `<stem>.queue/`, writes a `flock`-held ticket `<monotonic>.<6 digits>-<pid>` via temp file, lock, rename, scans each pass with non-blocking `flock` only (no second sleep), tries slots only at place <= 1, and unlinks the ticket on acquire. The mixed-version test checks start/end pairs never interleave and that `start old-copy` appears.
- TASK 2: `END` block plus wait-time `TERM` / `INT` / `HUP` handler (`exit 0`) drop the ticket, replaced by the post-acquire handler; dead tickets (flock takeable) are unlinked by the scan; `error cannot create $queue: ...` and `error cannot write a ticket in $queue: ...` replies are present; the `bkit tests run` exit-4 test sits beside the unwritable-lock-dir test.
- TASK 3: `try` never creates the queue, treats an unreadable/missing folder as empty (`opendir ... or return (0, 0)`), replies `busy <holders>; <N> waiting in line`; ordinal helper handles `11th`-`13th`; stray names are left alone; header lines 9 and 34 updated. The updated existing test `a runner started by the holder does not wait on its parent` only adds expectations (no removed lines).
- TASK 4: give-up renames the ticket to `<ticket>.held` after touching its mtime; a wait-mode take matching `<who> — <checkout>` on a held place under 120 s reuses its time with its own pid and unlinks the held place after the new ticket exists; the scan deletes held places older than 120 s.
- TASK 5: the three section diffs (§ Machine lock, § Tests lock, § Long-running shell commands) print nothing; `docs/testing.md` below `bkit:end` names the 6.1.1 fixture; `node dist/cli.js check` reports `0 write(s) would occur` (the group changed no engine source, so the existing `dist/` is current and no build was needed).
- Tests run here: the seven vitest files named in the DONE WHEN fields (313 tests) and both `bkit-test-awake.test.mjs` copies (21/21 each). One run had a single failure, `tests-lock.integration.test.ts` `tests run --file appends no test-run row when it exits 81 on a held tests lock`, with `ENOTEMPTY` from `afterEach`'s `fs.rmSync(tmp, ...)` at machine load average 29.6; the file then passed 15/15 three times in a row. The writer racing the teardown is the killed holder's Perl helper recording `tests.last` (mktemp + mv) after its caller dies, which is pre-existing post-acquire code this group did not change, so it is no gap of this group. Proposed separately: make that `afterEach` wait for helper exit or retry `rmSync`, and record it in `docs/failures.jsonl`.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 19 tests red then green, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` section. TEST FIRST counts (5 + 7 + 5 + 2 = 19) sit within the 25-per-group cap.
- Every group-1 `Derived Test Matrix` row maps to a test named in a task's `DONE WHEN` (the two kept-green rows via TASK 1's and TASK 4's whole-file and named-test clauses). Group-1 `Documentation Updates` rows are done; the header-comment row's jump-marker sentence belongs to TASK 10 (group 3). The new refusal lines follow the script's existing `error cannot open` reply pattern; `docs/observability.md` defines no machine-lock prefix and the plan adds none.
- `build-plan-current.md` (CONCERNS, `Reword`) flags stale line numbers in the TASK 5 text (`docs/testing.md` line 709 is now 711). The edit landed in the intended paragraph, so the task is satisfied; the plan text fix is the workflow's, not a code gap.

## Identified Gaps Log

None
