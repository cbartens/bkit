Verdict: PASS
Failures: 0
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

None

No design artifact exists, so the design-coverage checks (Steps 5 and 11) have nothing to map. The issue is the source. Every runbook task traces to it: TASKS 1-2 to "What should happen", TASK 3 to the "mutual exclusion with older copies" contract and the issue's note on consumer copies, TASK 4 to the Index updates rule, and TASK 5 to the issue's open bullet on adopted copies. The places where the plan departs from the issue's proposed approach ("oldest N" slots, the wait estimate) are raised as Open Questions 3 and 5, with the estimate parked as an `Exempt` row that has a matching deferral row. That is not silent drift.

Dependency graph (runbook order = build order):

- TASK 1 produces: the queue in `_local_stack_lock` (template), the byte-identical `scripts/ci/bkit-machine-lock.sh`, the `machine lock waiting order` describe block, and the order-file and ticket-pid helpers. It consumes `running`, `waitForOutput`, `commandRun`, `slotHolder` and `envFor` (`machine-lock.integration.test.ts:45-436`, present) and `Time::HiRes` (core module).
- TASK 2 consumes TASK 1's queue scan and describe block. DEPENDS ON 1, in order.
- TASK 3 produces `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` from tag `v6.1.1` (present in `packed-refs`). It consumes TASK 1's queue and helpers. DEPENDS ON 1, in order. `OLD_LOCK_SCRIPT` does not collide with the existing `OLD_SCRIPT` const (line 15).
- TASK 4 consumes TASKS 1-3 (it names the fixture). DEPENDS ON 1, 2, 3, in order. `node dist/cli.js check` reads the committed `dist/`, which Group 1 leaves current because Group 1 changes no engine code.
- TASK 5 consumes `TEMPLATE_CHANGE_CONSEQUENCES` and `formatTemplateChanges` (`template-copies.ts:111`, `:127`, present). Keys are template-relative (`formatChangedLine` joins `TEMPLATE_COPIES_DIR`), so `"scripts/ci/bkit-machine-lock.sh"` is the right key.

No cycles were found, and no artefact is consumed before the task that produces it. Every group ends with its own tests passing, because no Group 1 test depends on TASK 5.

## OPTIONAL

1. **TASK 3's frozen copy carries the reader bug that was fixed after 6.1.1 (risk mitigation, plan edit).** `git show v6.1.1:` predates the partial-line FIFO fix. `docs/knowledge.jsonl` key `machine-lock-fifo-timeout-may-consume-partial-line` dates from about 2026-11-06, the 6.1.1 release was 2026-11-04, and `CHANGELOG.md` § 6.1.1 does not list the fix. The current template has the fix (`_lsl_partial`, lines 290-301). Under contention, the 6.1.1 reader could turn a fragmented `ok` into `k` (`docs/failures.jsonl` `machine-lock-history-wait-returned-refusal`, OPEN). The mixed-version test runs that old copy beside five or more queued waiters, which is exactly that load. The result can be a flaky red that a later build reads as a queue regression. Fix: before building, check `git show v6.1.1:.bkit/templates/scripts/ci/bkit-machine-lock.sh | grep -c _lsl_partial`. If the count is 0, make the old-copy waiter's assertion only "never overlaps, and either ran or exited 73/75 with its stderr kept", and say so in TASK 3.
2. **DONE WHEN misses suites that run the real template.** `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` copies the template (lines 14, 63) and waits on a real `tests` lock. The Verification Plan lists it, but TASK 1's DONE WHEN does not. TASK 2 rewrites the same loop again (the `try` scan and the note text), yet its DONE WHEN names only "the existing `try_local_stack_lock` tests". Name the whole of `machine-lock.integration.test.ts`, `tests-lock.integration.test.ts`, `branches-lock.integration.test.ts` and `vitest-test-lock.integration.test.ts` in both tasks. Each task should prove what it did not break, not leave that to the group gate.
3. **Two red reasons cannot be observed under the group-level tests step.** Gate 2 records every planned test of the group red before any code step runs. At that point:
   - TASK 2's `try` test stops at the ticket-pid helper's "no ticket for" error before it reaches "the stopped first-in-line waiter still holds its ticket".
   - TASK 3's test fails because the fixture is missing, unless the tests step writes `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`.

   Say that the fixture is test input written by the tests step, and reword both red reasons to what the red run will show.
4. **Edge Cases with no `Derived Test Matrix` row.** Four behaviours are testable with the same harness but have no row:
   - `CI=true` creates no queue folder.
   - A child of a live holder takes no ticket.
   - A stray `.<pid>.tmp` in the queue folder never blocks the line.
   - A suspended first-in-line waiter holds the line.

   There is room: TASK 1 has 8 of 10 tests, and Group 1 has 11 of 25. Add rows, or extend the existing CI and nested-reuse tests with a "no `*.queue/`" assertion as `updated` tests.
5. **What `try` does with the queue folder is not specified.** The Architecture section has the helper `mkdir` the queue and reply `error cannot create $queue` on failure, but `try` takes no ticket. Say whether `try` creates the folder. Also say whether a regular file at `<stem>.queue` makes `try` reply `error` or count as an empty line. Without that, TASK 1 and TASK 2 can each implement it differently.
6. **The header comment goes stale after TASK 2.** Line 9 (`try_local_stack_lock … # returns 1 immediately while busy`) and line 34 (`Waiting notes name every holder and that checkout's last run.`) stop being complete once TASK 2 lands. Only TASK 1 updates the header, and only for the queue folder and arrival order. Add a header UPDATE line to TASK 2, and widen the matching `Documentation Updates` row.
7. **TASK 5 test location.** The sibling test `names the consequence when a changed template's adopted copy backs a gate` lives in `.bkit/core/engine/install/template-copies.integration.test.ts:186`, under `describe("formatTemplateChanges")`, and that file already imports `formatTemplateChanges`. Putting the new case beside it avoids a second home for `formatTemplateChanges` tests. If the unit tier is preferred, say why.
8. **Dogfood proof is advisory only.** `.agents/rules.md` § Verify before complete requires a real `pnpm build` → `node dist/cli.js <verb>` run on a fresh scratch consumer. The plan has that run only as Manual Step 3, which blocks nothing. Move the upgrade-report check into `Automated Tests` (proof under Gate 4), so TASK 5 cannot close on green tests alone.
9. **Issue shape.** #916 is bug-shape, and `.bkit/trackers.md` § Issue shapes routes bug-shape issues to `/bkit-debug`. The plan handles this correctly through `⚠️ MISSING` and Open Question 1, which has no default, so Gate 1 blocks until the owner answers. No change is needed beyond the owner's answer.

## OUT OF SCOPE

- A detect-only `bkit check` advisory for an adopted lock copy without the queue (the plan's own `Recommendation for a later phase`). It needs a design decision.
- Recording held time per gate name in `<name>.last`, which would make a wait estimate trustworthy (the remediation of deferral `916-lock-wait-estimate-from-last`).
- An older name collision: `--lock tests.2` maps to `machine-lock/tests.2.lock`, the same file as slot 2 of the `tests` lock, because name sanitising keeps `.` (`local_stack_lock_file`, lines 61-63). It has nothing to do with waiter order. Propose a separate issue.

## SUGGESTED SCOPE EXPANSION

- Route raw test-runner commands through the tests lock. Source: #822 (OPEN) and deferral `724-host-hook-catches-raw-test-runners` (TRIAGED). Recommendation: keep deferred. A raw runner skips the queue just as it skips the lock, and the queue serves it unchanged once #822 lands.
- Shipped gate templates pass `BKIT_TEST_WORKERS`. Source: deferral `724-gate-templates-pass-test-workers` (OPEN). Recommendation: keep deferred, because it has no ordering surface.
- Retune `vitest.timeout-budget.ts` once the tests lock lowers local load. Source: deferral `724-timeout-budget-and-ci-serialisation-unchanged` (OPEN), which is missing from the plan's list. Recommendation: keep deferred. The queue changes who goes next, not how many run at once.
- Release-gate refusal (73 instead of 75) in the history test. Source: `docs/failures.jsonl` `machine-lock-history-wait-returned-refusal` (OPEN). Recommendation: keep separate, but watch for it at build time. The queue rewrites the loop this failure touched, and the TASK 3 fixture carries the pre-fix reader (OPTIONAL 1).
- #914 (build planned-test lock). Source: `related-issues.md`. Recommendation: none, because it does not overlap this plan's surfaces (a different "lock").
