Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: 7, 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-1.md`: CONCERNS, 10 gaps, Tasks 8.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-1-log.md`: 9 gaps reported DONE, gap 10 BLOCKED.

## Notes

4 gaps, all fixable, all in Task 9. Tasks 7 and 8 are satisfied.

- **Round 1 gaps re-checked against the code:**
  - Gap 1 (re-poll head identity) is closed: `runHandoff` resolves the printed re-trigger head through `resolveHandoffHead` (`runs.ts:2094`).
  - Gap 2 (no-PR target) is closed on the engine side: `--pr` is optional, and an empty value means `pr: null` (`runs.ts:2083`; the `cli.md` row is regenerated). The debug caller side is still open (gap 4 below).
  - Gap 3 (stale 80/81 hint) is closed: `dispatchCode` names `runs handoff --invocation` in invocation mode (`runs.ts:2378`).
  - Gap 4 (prompt migration) is closed for the ledger readers: all 29 prompts changed, and full-ledger folds now read through `bkit ledgers query`. Two follow-on problems are open: the bulk edit damaged structure (gap 3 below), and the new invocation and result branches have no caller (gaps 1 and 2 below).
  - Gap 5 (wording) is closed: the four approved paragraphs appear word for word, plus a Recovery precedence clause, in `.bkit/instructions.md` and all six workflows.
  - Gap 6 (caller contracts) is only partly closed: see gaps 1, 2 and 4 below.
  - Gaps 7 and 8 are closed: `.bkit/core/.agents/rules.md` has a Recovery precedence rule, and the rows in `docs/architecture.md`, `docs/testing.md` and `docs/observability.md` are written.
  - Gap 9 (Special Behaviors entry) is closed, but the instructions check mode exits 1 again for a new reason (gap 3 below).
- **Gap 10 (`instructions.test.ts` timeout):** not a deliverable defect. Run alone here, the test timed out after 123 s at a load average of about 80. It passed in `build-tests-green-4-2.md`, and the remediate log records 11 s at normal load. The failure was a timeout, not an assertion.
- **Removed `ledger-impact-fold` clause:** replaced by the new `ledger-query-each` clause (`.bkit/instructions.md:4911`), which has the same four carriers. No gap.
- **Sync checks:** the instructions check mode (`pnpm tsx .bkit/core/engine/tools/instructions.ts`, no `--write`) exits 1 with 16 errors. `cli-doc` is clean: its `--write` run exited 0 and changed no file. One `pnpm instructions:sync` (the script includes `--write`) was also run here by mistake. It refused on the same 16 errors and wrote nothing (`git status` unchanged).
- **Tests run here:** all 8 named group 4 tests. The 4 unit tests (runs, status, lib, counters) passed, the 2 `journal.integration.test.ts` tests passed, and the `core.integration.test.ts` test passed. The instructions test timed out under load, as noted above.
- **Not judged:** `pnpm build`, `bkit check` and the full gate suite in Task 9 DONE WHEN, because this agent does not build. Generated mirrors were not judged either. Task 9 is open regardless.
- **Test-first audit (`build-tests-green-4-2.md`):** `Enforced: true`, 0 gaps, 0 unproven, and no `Updated tests` or `Already landed` sections, so nothing needed deciding. No test file changed during remediation.
- **Decision records:** none accepts a group 4 gap.
- **Header:** the caller's Context asked for a `Strategy` line, but this agent's output format has none, so the header follows the agent format, as round 1 did.

## Identified Gaps Log

4 gaps.

- TASK 9: per-workflow invocation/attribution callers still missing (round 1 gap 6 only partly closed) — `.bkit/core/workflows/bkit-design.md`, `bkit-plan.md` and `bkit-ship.md` never run `bkit status invocation`; their decision appends (`bkit-design.md:614`, `bkit-plan.md:522`) still tell the agent to set `by.step` by hand with no `--invocation` / `--operation` receipt; `bkit-ship.md` has no book-root invocation/recovery/receipt caller; and the new `bkit-auto.md` line "The dispatched workflow issues its own invocations with `bkit status invocation`" is false for design, plan and ship, so the migrated prompts' "If your Context names an invocation id" branches (`bkit-plan-generate.md`, `bkit-ship-deferred-sweep.md`) never fire from a workflow — Fixable: true
- TASK 9: no workflow supplies a structured result to the migrated prompts — no `.bkit/core/workflows/*.md` passes a `Result:` file or renders an artifact with `bkit steps stub --result-file`, so the new "If your Context names a structured result file (`Result:`)" branches in 10 prompts (challenge-1/2, plan-verify, design-review-1/2, design-spike, plan-review-1/2, plan-scope-check, debug-failure-diagnose) are unreachable and the hand-set `Failures` / totals stay the live path (DONE WHEN "every ... redundant machine-field instruction is replaced"; plan UPDATE lines "engine result ... callers" for bkit-design, bkit-plan, bkit-build, bkit-debug) — Fixable: true
- TASK 9: the bulk prompt edit broke step structure and the instructions check — `pnpm tsx .bkit/core/engine/tools/instructions.ts` (check mode) exits 1 with 16 "local entry no longer in the file" errors, because the verdict / count sub-bullets of 8 prompts were flattened into one run-on top-level bullet after the inserted ownership line (`bkit-build-plan-tasks.md:127`, `bkit-build-plan-gaps-remediate.md:120`, `bkit-debug-failure-diagnose.md:112`, `bkit-debug-failure-remediate.md:87`, `bkit-design-review-1.md:86`, `bkit-design-review-2.md:84`, `bkit-ship-conflict-resolve.md:112`, `bkit-ship-deferred-sweep.md:107`); the same script also put unindented top-level bullets between numbered steps in `bkit-build-plan-current.md`, `bkit-plan-review-1.md` and `bkit-plan-scope-check.md`, splitting their step lists — restore each `PASS` / `FAIL` / `CONCERNS` / count definition as its own nested bullet and nest the new line under its step (DONE WHEN "`pnpm instructions:sync` ... pass") — Fixable: true
- TASK 9: `.bkit/core/workflows/bkit-debug.md:826` dev-push CI wait still points the agent at the shared turn-loop's `bkit runs handoff ... --pr={PR_NUMBER}` (`bkit-debug.md:37`) and swaps `--pr` only for the `runs wait` call, so a run in place on dev, which has no PR, is never told to pass an empty or absent `--pr` to `runs handoff` (the engine side of round 1 gap 2 is fixed in `runs.ts`; the caller side is not) — Fixable: true
