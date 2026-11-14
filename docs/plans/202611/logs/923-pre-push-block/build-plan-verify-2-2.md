Verdict: PASS
Failures: 0
Fixable: false
Tasks: 5, 6, 7, 8, 9
Loosened: none
Fingerprint: 689d05c6ce782300a9ca423c71a8161de8cace010df893e4c17552f5197ac951
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-2-1.md`: CONCERNS, 1 gap (Task 5 installed copies not regenerated). Closed by `build-plan-gaps-remediate-2-1-log.md` (ran `bkit upgrade`).

## Notes

- Group 2 (Tasks 5-9) judged against `build-diff-2-2.md`. `build-tests-green-2-2.md`: `Enforced: true`, 0 gaps, no `Unproven`, `Updated tests` or `Already landed` sections; all six `TEST FIRST` tests red then green. Re-ran the three test files: 3 files, 264 tests passed.
- Task 5: both hook copies print `[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=false).` and skip fetch and `merge-tree` inside the `PR conflict` block only. `.bkit/core/workflows/bkit-ship.md` sets the switch on the three pre-Step-4 pushes only. `.bkit/core/.bkit/templates.md` § Git hooks names it. The attempt-1 gap is closed: `.bkit/templates.md` line 3 now carries the rendered `bkit:managed v6.1.1` marker and its body matches the source; `.claude`, `.cursor`, `.opencode` ship commands and both `.agents` ship skills each carry the switch 3 times; `.bkit/version` hashes match the files on disk.
- Task 6: both hooks run `git --attr-source="$(git hash-object -t tree /dev/null)" merge-tree ...`; an older git exits non-1 and lands on the WARN line.
- Task 7: both hooks fetch `+refs/heads/$PR_BASE:refs/remotes/origin/$PR_BASE`; exit 1 without a leading hex OID becomes exit 2 (WARN path).
- Task 8: `fires` returns true when `merge-tree` or `PUSH_BRANCH_SHA=` is missing, `ask` names the stdin-loop line, `dist/checks/tips/catalogue.js` rebuilt. The Task 2 test's "complete hook" fixture now includes `PUSH_BRANCH_SHA=` (expectation `false` kept): the fix for the test Task 8 broke by design, not a loosening.
- Task 9: both hooks request `isCrossRepository` and filter with `map(select(.isCrossRepository | not)) | .[0]`; the test pipes the hook's own filter through real `jq`.
- Decision records read: `build-decision-1-1.md` (group 1 fix task 4), `build-decision-1-2.md` (owner direction for Task 5: on/off switch, which the work follows).
- `docs/testing.md` and `docs/observability.md` present; the hook reports outcomes on stderr, in line with the CLI-stderr scope of `docs/observability.md`.
- Out of scope, for the owner (repeated from attempt 1): the BLOCKED `Fix:` line still says `git fetch origin $PR_BASE && git merge origin/$PR_BASE`, which in a single-branch clone leaves no `origin/<base>` to merge.

## Identified Gaps Log

None.
