Verdict: CONCERNS
Failures: 10
Fixable: true
Tasks: 8
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

None

## Notes

10 gaps, all fixable. Task 8 is satisfied; Tasks 7 and 9 are not.

- **Task 8:** `NoWriteRejection` / `UncertainEffect` / `CorrectionExhausted` in `commands/lib.ts`, `bkit counters correction` (default limit 2, `--limit` override, replay spends nothing) and `ledgers append --correction-of` match DONE WHEN. All three named tests pass: `lib.test.ts`, `counters.test.ts` and `journal.integration.test.ts`.
- **Task 7:** The engine pieces exist, and all three named tests pass: the `ci-handoff` union and validators, `foldCiHandoff`, `runs handoff`, and the `ciDispatchGate` checkpoint machine run against a real bare remote. The re-entry contract does not hold together, though: re-poll head identity, the no-PR dev path and the stale 81 hint (three gaps).
- **Task 9:** Only the shared **Bounded correction** clause and Failures carrier landed, plus the CI turn-loop rewrite in bkit-build and bkit-debug and the four `.bkit/core/.bkit/*.md` docs. Still missing: the prompt migration (29 files), the approved four-paragraph wording, the four other workflows' caller contracts, `.bkit/core/.agents/rules.md`, and three `docs/*.md` rows. The `instructions` check mode exits 1, and `cli-doc` check mode exits 0. Mirrors, `pnpm build` and `bkit check` were not judged: generated copies are regenerated later, and this agent does not build.
- **Test-first audit (`build-tests-green-4-1.md`):** `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` sections, so there was nothing to decide.
- **Tests run here:** 7 unit files gave 625 passed and 1 timeout (the Task 9 instructions test). The 2 integration files gave 163 passed. A full unit suite run under `bkit-machine-lock.sh` exited 75: the tests lock was held by other repos' gate runs. The full suite is unproven here and remains part of Task 9's DONE WHEN.
- **Decision records:** `build-decision-1-*` cover groups 1 and 3 only. None accepts a group 4 gap.

## Identified Gaps Log

10 gaps.

- TASK 7: `.bkit/core/engine/commands/workflow/runs.ts` re-poll identity split — after a re-trigger `runs dispatch --invocation` prints the re-trigger commit as `head` (runs.ts:1220-1238) but persists and folds its `ci-handoff` rows under the original head (`resolveHandoffHead`, runs.ts:842-867, 926-929); `runs handoff` folds by the caller's `--head` with no such resolution (runs.ts:2092-2107), and the CI wait turn-loop passes `--head=<printed head>`, so every re-poll observation the agent records lands under another target, counts as `stale`, and the re-run dispatch never sees a found re-poll — Fixable: true
- TASK 7: `.bkit/core/engine/commands/workflow/runs.ts` `runs handoff` refuses a target with no PR (empty `--pr` fails `validateCiHandoffEvent`, runs.ts:2081-2106) although `CiHandoffTarget.pr` is `string | null` and `ciDispatchGate` persists `pr: null` for a run in place on a shared branch; the bkit-debug dev-push CI wait turn-loop has no `{PR_NUMBER}`, so it cannot record a single observation and exits 2 — Fixable: true
- TASK 7: `.bkit/core/engine/commands/workflow/runs.ts:2352-2360` the exit 80/81 hand-off log line still tells the agent to re-run with `--poll-result=<found|none|err> --attempts=<total>` even in `--invocation` mode, and supplying `--poll-result` switches the persisted handoff off (runs.ts:2257), so the engine's own next-action text sends the caller back to copied counters — Fixable: true
- TASK 9: none of the 29 `.bkit/core/prompts/*.md` UPDATE lines landed — no prompt file is in the group diff and no prompt mentions `ledgers query`, `--invocation` or `--operation`; full-ledger manual readers, copied model attribution and redundant machine-header/total instructions remain (DONE WHEN "every full-ledger manual reader and redundant machine-field instruction is replaced") — Fixable: true
- TASK 9: the exact approved four-paragraph wording (**Deterministic bookkeeping** / **Recoverable execution errors** / **Uncertain effects** / **Failure boundary**, plan lines 647-655) and its precedence clarification (plan line 657) appear in no source, clause or carrier; the build added one **Bounded correction** paragraph instead, and the tests step's note that the wording "is not in any input" is wrong — it is in the plan — Fixable: true
- TASK 9: per-workflow caller migration missing — bkit-auto (invocation/recovery dispatch contract), bkit-design and bkit-plan (engine context/read/result callers, plan's corrected ledger append continuation) and bkit-ship (book-root invocation/recovery/receipt callers) got only the shared Failures/Bounded correction clauses; only bkit-build and bkit-debug CI re-entry changed — Fixable: true
- TASK 9: `.bkit/core/.agents/rules.md` (shared Commands/Failures/recovery rules with precedence) is not updated — Fixable: true
- TASK 9: Documentation Updates rows for `docs/architecture.md`, `docs/testing.md` and `docs/observability.md` are not done (no change to any of the three) — Fixable: true
- TASK 9: `pnpm instructions:sync` check mode exits 1 — `.bkit/instructions.md **Engine-owned model evidence**: no ## Special Behaviors entry`, from the row this group added to `.bkit/core/.bkit/prompts.md` § Special Behaviors without its registry entry — Fixable: true
- TASK 9: `.bkit/core/engine/tools/instructions.test.ts` `renders one recovery precedence contract for all hosts and tracker adapters` times out at the 14150 ms default (about 24 s per run at load average 30) — failed twice here, once alone; it passed in the green run, so the test needs a timeout fitting its 72 renderings or a cheaper rendering loop — Fixable: true
