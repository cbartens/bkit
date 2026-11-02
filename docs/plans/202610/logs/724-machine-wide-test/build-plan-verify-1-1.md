Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: none
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1 — TASK 1 only, judged against `build-brief-1-1.md` and `build-diff-1-1.md`. The group contains one task and ten planned tests in one file, within the supplied caps.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

TASK 1 is not satisfied. All ten planned tests exist, use real Bash/Perl processes and isolated cache directories, and the original stack-lock cases remain in the renamed suite. The supplied green audit records nine planned tests passing and one failing; its `not-green` gap retains the engine's `Fixable: true`. There are no unproven tests, already-landed exceptions, loosened-test entries, or supplied acceptance decisions.

The failing machine-wide test has a setup mismatch: `holdNamed` and `run` spawn Bash without `cwd`, while the assertion expects `firstRepo.root`. Copying the sourced script to another repository does not move its caller. The implementation's `git -C "$PWD"` correctly follows TASK 1's caller-checkout requirement. The observed holder path is therefore this worktree. Repairing source to report the copied script's checkout would contradict that requirement; the frozen test requires the appropriate workflow/owner route. No test was changed during verification.

The deletion audit's active references in `.bkit/core/.bkit/templates.md:881,887,888` and its generated `.bkit/templates.md` counterpart still direct consumers to copy/run/source the deleted template. These are the same artifact, so the null gap is fixable. TASK 3 schedules the full section rewrite in a later group, but that does not make today's copy command work or satisfy this audit. References inside `tests/fixtures/machine-lock/stack-lock-6.0.0.sh` describe the intentionally frozen old implementation and are not gaps; preserve that fixture unchanged.

Independent shell checks passed for Bash syntax, template/dogfood byte equality, deletion of the old template, and exact fixture equality with the main merge-base version. The Contract catalog row names the new script, and architecture has the single adopted `scripts/ci/` entry. The task's testing documentation addition exists. Currency guidance explains the fixture revision choice: the explicit DONE WHEN merge-base comparison is satisfied despite the older CREATE wording saying HEAD.

Independent real-process probes found two further API gaps: `a-b` and `a_b` have different lock files but share owner/PID variables, and an unset indirect variable aborts a caller using `bash -eu`. For the latter, identical unnamed take/release calls with an isolated cache and `BKIT_LOCAL_STACK=verify-nounset` returned 0 using the frozen fixture and 1 using the new script. For the former, both takes returned 0 but only `a-b.lock.holder` existed. Both failures concern the changed generalization itself.

The supplied implementation evidence reports 394/395 focused tests passing and a changed-gate run with 6569 passing and two failing: the cwd assertion and the existing workflow-shape comment-number mismatch. Thus no full-suite pass is claimed. The unrelated comment-number failure remains for the group-gate workflow; it is not counted again as a TASK 1 implementation gap. Refusal paths use the required bracketed `[machine-lock]` prefix and name the requested lock. Documentation and matrix checks here cover TASK 1 only; later groups' deliverables remain outside this report.

## Identified Gaps Log

TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` — not-green — Fixable: true

TASK 1: delete-still-referenced — Fixable: true

TASK 1: `.bkit/templates/scripts/ci/bkit-machine-lock.sh` `_local_stack_lock_vars` — named-lock-isolation: `local_stack_lock_file` preserves hyphens and dots but owner/PID keys replace them with underscores. Taking `a-b` then `a_b` returns success for both while the second lock has no holder, because both reuse `LOCAL_STACK_LOCK_OWNER_a_b`. Distinct accepted lock names must not share reuse/release state; keep the dogfood copy identical — Fixable: true

TASK 1: `.bkit/templates/scripts/ci/bkit-machine-lock.sh:89` `_local_stack_lock` — unnamed-compatibility: `${!_lsl_owner_var}` and `${!_lsl_pid_var}` read unset variables without defaults. A real `bash -eu` caller with no inherited owner now aborts before taking the unnamed lock; the frozen old fixture completes the same take/release successfully. Preserve unset-variable-safe source API behavior, including named locks and release, and keep the dogfood copy identical — Fixable: true
