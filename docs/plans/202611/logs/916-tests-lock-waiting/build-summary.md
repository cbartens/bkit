Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-plan-current CONCERNS
- build-challenge round 1: LOW .bkit/templates/scripts/ci/bkit-machine-lock.sh:344
- build-challenge round 1: LOW .bkit/templates/scripts/ci/bkit-machine-lock.sh:266
- build-challenge round 1: LOW skills-lock.json:35
- build-plan-gaps-remediate (group 4) CONCERNS
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/tests-jump.ts:34
- build-challenge round 2: LOW .bkit/core/engine/commands/workflow/tests-jump.ts:30
- build-challenge round 2: LOW .bkit/templates/scripts/ci/bkit-machine-lock.sh:267
- build-challenge round 2: LOW skills-lock.json:35
- 3 item(s) accepted at the Decision Pause
- 6 deferral(s) from this run remain open

Plan tasks: 15 of 15 ticked in `docs/plans/202611/916-tests-lock-waiting-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 2 | `docs/plans/202611/916-tests-lock-waiting-plan.md`, `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-check.md` |
| build-plan-current | CONCERNS | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-current.md` |
| build-install-skills | - | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-group-gate-1-2.md` |
| build-plan-gaps-remediate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-1-1-log.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-3-2.md` |
| build-plan-gaps-remediate (group 3) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify-holistic | PASS | 0 | 5 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-holistic-5.md` |
| build-plan-gaps-remediate-holistic | PASS | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-holistic-3-log.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-1.md`, `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-4-3.md` |
| build-plan-tasks (group 4) | PASS | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-3.md` |
| build-plan-gaps-remediate (group 4) | CONCERNS | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-4-2-log.md` |
| build-decision | - | - | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-3.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-1.md`, `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-2.md` |
| build-group-start (group 5) | - | - | 1 | - |
| build-plan-tests (group 5) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-5-1.md` |
| build-plan-tasks (group 5) | PASS | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 0 | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-5-1.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/run-tests-1.md` |

## Resolved Findings

- build-challenge round 1: MEDIUM .bkit/templates/scripts/ci/bkit-machine-lock.sh:301, resolved by build-plan-verify (group 4, task 11)
- build-challenge round 1: MEDIUM .bkit/templates/scripts/ci/bkit-machine-lock.sh:242, resolved by build-plan-verify (group 4, task 12)
- build-challenge round 1: MEDIUM .bkit/core/hooks/guardrails-tiers.js:181, resolved by build-plan-verify (group 4, task 13)
- build-challenge round 2: MEDIUM .bkit/core/hooks/guardrails-tiers.js:291, resolved by build-plan-verify (group 5, task 15)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/916-tests-lock-waiting/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | - |
| build-plan-current | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-current.md` |
| build-install-skills | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | FAIL | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-group-gate-1-1.md` |
| build-plan-gaps-remediate (group 1) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-2-1.md` |
| build-group-gate (group 2) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-group-gate-2-1.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate (group 3) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify (group 3) | PASS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-3-2.md` |
| build-plan-verify-holistic | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-holistic-1.md` |
| build-plan-gaps-remediate-holistic | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-holistic-1-log.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-holistic-2.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-1.md`, `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-2.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-4-1.md` |
| build-plan-tests (group 4) | PASS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-4-2.md` |
| build-plan-tasks (group 4) | FAIL | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-1.md` |
| build-plan-gaps-remediate (group 4) | FAIL | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-4-1-log.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-1.md` |
| build-plan-tests (group 4) | PASS | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-4-3.md` |
| build-plan-tasks (group 4) | PASS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | FAIL | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-2.md` |
| build-plan-gaps-remediate (group 4) | CONCERNS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-4-2-log.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-2.md` |
| build-plan-verify (group 4) | PASS | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-4-3.md` |
| build-plan-convert | - | 2 | `docs/plans/202611/916-tests-lock-waiting-plan.md`, `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-check.md` |
| build-plan-current | CONCERNS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-current.md` |
| build-install-skills | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-install-skills.md` |
| build-plan-verify-holistic | CONCERNS | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-holistic-3.md` |
| build-plan-gaps-remediate-holistic | PASS | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-gaps-remediate-holistic-3-log.md` |
| build-plan-verify-holistic | PASS | 4 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-holistic-4.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-1.md`, `docs/plans/202611/logs/916-tests-lock-waiting/build-challenge-2.md` |
| build-group-start (group 5) | - | - | - |
| build-plan-tests (group 5) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-tests-red-5-1.md` |
| build-plan-tasks (group 5) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-5-1.md` |
| build-plan-verify-holistic | PASS | 5 | `docs/plans/202611/logs/916-tests-lock-waiting/build-plan-verify-holistic-5.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/916-tests-lock-waiting/run-tests-1.md` |
| build-decision | - | 3 | `docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-3.md` |

## Challenge

- Task 11 — MEDIUM — ticked (`docs/plans/202611/916-tests-lock-waiting-plan.md`)
- Task 12 — MEDIUM — ticked (`docs/plans/202611/916-tests-lock-waiting-plan.md`)
- Task 13 — MEDIUM — ticked (`docs/plans/202611/916-tests-lock-waiting-plan.md`)
- Task 14 — MEDIUM — ticked (`docs/plans/202611/916-tests-lock-waiting-plan.md`)
- Task 15 — MEDIUM — ticked (`docs/plans/202611/916-tests-lock-waiting-plan.md`)
- LOW, deferred: 916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-344 — LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:344: A waiter with `BKIT_TEST_SLOTS=2` sits idle behind a first-in-line waiter that only uses slot 1, while slot 2 is free, and can give up at its limit. Done when: the owner decides what "first in line" means when waiters on one `tests` queue carry different `BKIT_TEST_SLOTS` values (it is a per-process environment variable, so two hosts or shells can differ): either a later waiter may take a slot beyond the head's slot count, or the mismatch is documented as accepted head-of-line blocking in `.bkit/templates.md` § Machine lock. No agent can settle it, because decision `916-queue-first-in-line-only-tries` says only the head tries, and an exception reopens that decision. Reproduced on this diff: holder (slots 1) holds `tests`, waiter A (slots 1) waits, waiter B (`BKIT_TEST_SLOTS=2`) waits 4 s for the holder to finish although `tests.2.lock` is free; the 6.1.1 copy runs B at once.
- LOW, deferred: 916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-266 — LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:266: A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death. Done when: The Perl helper's scan (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:254` `$first_line`, `:266` ticket open, `:310` held-place lookup) and `.bkit/core/engine/commands/workflow/tests-jump.ts:24` `firstLine` read only regular, non-symlink files (an `lstat` / `-f` check before the open, or a non-blocking open), so a FIFO or other special file whose name matches `^\d+\.\d{6}-\d+$`, `.held` or `.jump` is ignored and never unlinked; a waiter with such an entry in `tests.queue/` still runs its command when the lock is free and still exits 75 at its limit; `scripts/ci/bkit-machine-lock.sh` stays byte-identical to the template.
- LOW, deferred: 916-tests-lock-waiting-challenge-low-skills-lock-json-35 — LOW build challenge finding at skills-lock.json:35: The skill install step blanked the integrity hash of the permanent `find-skills` skill, so a later change to that agent-instruction content can no longer be told apart from what was reviewed. Done when: `skills-lock.json` `skills["find-skills"].computedHash` holds the nonempty hash the skills CLI records for the installed `.agents/skills/find-skills/SKILL.md` (reinstalled with `npx skills add vercel-labs/skills@find-skills -y`, or the base entry restored), so every entry meets `.agents/skills.md` § Install / Update step 2 ("a nonempty `computedHash`").
- LOW, deferred: 916-tests-lock-waiting-challenge-low-bkit-core-engine-commands-workflow-tests-jump-ts-34 — LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-jump.ts:34: The human approves `bkit tests jump build-1` for a run that gave up more than 120 s ago, and the verb exits 0 saying the run moves to the front, although its held place has expired and nothing is waiting. Done when: `linesFor` skips a `.held` entry whose mtime is more than 120 s old, the same cut-off the helper's scan uses (`time - $mtime > 120` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`), so a jump naming only an expired held place exits 1 with "no run named <run> waits for tests" and writes no marker, as the plan's edge case "names a run that no waiting ticket or held place carries" requires; a held place under 120 s old still matches. The marker the verb writes today lingers until some other take scans the queue; when the next contended take is that same run, it jumps the line on a stale approval.
- LOW, deferred: 916-tests-lock-waiting-challenge-low-bkit-core-engine-commands-workflow-tests-jump-ts-30 — LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-jump.ts:30: A regular file sits at `tests.queue` (the same blocked path that makes `run` exit 73), and `bkit tests jump build-1` crashes with "Unhandled error: ENOTDIR: not a directory, scandir …" instead of refusing with "no run named build-1 waits for tests". Done when: `linesFor` treats a queue path that exists but is not a readable folder as an empty line (for example `fs.statSync(queue, { throwIfNoEntry: false })?.isDirectory()` before `readdirSync`, and a ticket that vanishes or cannot be read between the listing and the read is skipped, not thrown), so the verb exits 1 through `CommandError(EXIT.NO, "no run named <run> waits for tests")` and writes nothing; today `fs.existsSync(queue)` is true for the file, `readdirSync` throws, `runCommand` rethrows the non-`CommandError` (`.bkit/core/engine/commands/lib.ts:639`), and `cli.ts` prints `Unhandled error` with no friction row.
- LOW, deferred: 916-tests-lock-waiting-challenge-low-bkit-templates-scripts-ci-bkit-machine-lock-sh-267 — LOW build challenge finding at .bkit/templates/scripts/ci/bkit-machine-lock.sh:267: A FIFO named like a ticket, held place or jump marker in a lock's queue folder hangs every waiter, every `try` and `bkit tests jump` forever, past `LOCAL_STACK_LOCK_WAIT_S` and past caller death. Done when: The Perl helper's scan (`.bkit/templates/scripts/ci/bkit-machine-lock.sh:255` `$first_line`, `:267` ticket open, `:311` held-place lookup) and `.bkit/core/engine/commands/workflow/tests-jump.ts:24` `firstLine` read only regular, non-symlink files (an `lstat` / `-f` check before the open, or a non-blocking open), so a FIFO or other special file whose name matches `^\d+\.\d{6}-\d+$`, `.held` or `.jump` is ignored and never unlinked; a waiter with such an entry in `tests.queue/` still runs its command when the lock is free and still exits 75 at its limit; `scripts/ci/bkit-machine-lock.sh` stays byte-identical to the template.

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- BLOCKED — TASK 11: test `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` — it asserts every take has exit 0 and EMPTY stderr, but waiting takers legitimately print the "⏳ ... in line" note on stderr, so it fails even with the fix; it should only flag non-zero exits / "cannot create" (`docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-4-log.md`)
- BLOCKED — bkit:gate:static: slop findings defensive.error-obscuring in tests-jump.ts:23,34 and tests-lock.integration.test.ts:493 from group 3, not touched by this group (`docs/plans/202611/logs/916-tests-lock-waiting/build-plan-tasks-4-log.md`)
- Accepted: docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-2.md: Decision: Accept — get this unstuck and moving
- Accepted: docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-2.md: Decision: Accept — get this unstuck and moving
- Accepted: docs/plans/202611/logs/916-tests-lock-waiting/build-decision-1-3.md: Decision: Accept — "Accept, with reason", then "you provide the reason, finish the build workflow" (reason worded by Claude at the owner's request, recorded as TASK 11's TEST EXCEPTION)
- TEST EXCEPTION, task 11: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` fails on a concurrent first take exiting 73 with "cannot create" and "File exists" — the race is timing-dependent, so against the unfixed script the test fails only about 1 run in 3; the fix is a one-line `mkdir || -d`, the test passes on all 50 fresh caches with it, and an intermittent guard is accepted over none (reason worded by Claude at the owner's request) (owner, 2026-11-12) (`docs/plans/202611/916-tests-lock-waiting-plan.md`)

## Recommended Next Step

```text
/bkit-ship #916
```
