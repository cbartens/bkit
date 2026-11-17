Verdict: CONCERNS
Failures: 3
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
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-2.md`: CONCERNS, 4 gaps, Tasks 7, 8.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-2-log.md`: 4 gaps reported DONE.

## Notes

3 gaps, all fixable, all in Task 9. Tasks 7 and 8 stay satisfied.

- **Round 2 gaps, checked against the code:**
  - Gap 1 (invocation callers) is closed. `bkit-design.md` and `bkit-plan.md` issue `bkit status invocation` before their decision appends and pass `--invocation` with a fresh `--operation`, with no hand-set `by.step`. `bkit-plan.md` Step 3 passes `Invocation id: {INVOCATION}` to `@bkit-plan-generate`. `bkit-ship.md` issues the sweep's invocation in the book-root status file (`BOOK_ROOT` = `{WORKTREE_PATH}`) and names it in the sweep's Context. The `bkit-auto.md` claim is now true.
  - Gap 2 (structured-result callers) is closed as wiring: 13 `Result:` lines with `steps stub --result-file` blocks (build 5, design 3, plan 3, debug 1, ship 1). The wiring exposes two new defects (gaps 1 and 2 below).
  - Gap 3 (prompt structure) is closed: the instructions check mode (`pnpm tsx .bkit/core/engine/tools/instructions.ts`, no `--write`) exits 0 here, and `cli-doc` check mode exits 0. One leftover of the same defect remains in `bkit-plan-review-2.md` (gap 3 below). The check does not catch it.
  - Gap 4 (debug dev-push `--pr`) is closed: `bkit-debug.md` tells the dev-push turn loop to record each poll with `runs handoff` passing an empty `--pr=` and `--head="{DEV_SHA}"`.
- **The `Result:` JSON shape, the caller's open question:** the plan does require it in the prompts. Every Task 9 prompt UPDATE line says "result serialization contract", and the Architecture "Result envelope" row has agents supply findings and judgments inside an engine envelope. The prompts only say "put only your findings and judgments in it". `steps stub` gives valid output only from the exact shape, which no agent-read file documents (the only mention is the `--result-file` flag help in `steps.ts:2291`). Probes in the scratchpad: the exact shape renders a valid header with `Failures`, `Fixable` and `Fingerprint` derived. A guessed shape, or no result file, exits 6. A result with only judgments overwrites the agent's report with a bare header.
- **Tests run here:** all 8 named group 4 tests pass: 5 unit tests in 5.2 s and 3 integration tests in 10.6 s, at a load average of about 4. The full `instructions.test.ts` file run timed out on the Task 9 test only (16 s limit, load average 192). Per the caller's rule this is not a deliverable defect: it passes alone and in `build-tests-green-4-3.md`. `steps.test.ts` and `challenge.test.ts` pass in full.
- **Not judged:** `pnpm build`, `bkit check` and the deepest gate in Task 9 DONE WHEN, because this agent does not build. Generated mirrors were not judged either. Task 9 is open regardless.
- **Test-first audit (`build-tests-green-4-3.md`):** `Enforced: true`, 0 gaps, 0 unproven, and no `Updated tests` or `Already landed` sections, so nothing needed deciding.
- **Decision records:** none was supplied for group 4, and none accepts a group 4 gap.

## Identified Gaps Log

3 gaps.

- TASK 9: result serialization contract missing from the prompts — the 13 new caller sites pass `Result:` and then run `bkit steps stub --result-file` with no `Route:`, but no prompt, no `.bkit/instructions.md` clause (`.bkit/instructions.md:4926`, `:11063`) and no `.bkit/core/.bkit/prompts.md` row tells the agent the JSON shape `renderResult` accepts (`.bkit/core/engine/commands/workflow/steps.ts:1636`: top-level keys `findings`, `judgments`, `body`, `evidenceComplete` only; each finding needs `severity` CRITICAL|HIGH|MEDIUM|LOW, boolean `fixable`, `location` path:line and `doneWhen`, per `.bkit/core/engine/commands/workflow/challenge.ts:264`; `judgments` keyed by header field names such as plan-verify `Tasks` and `Loosened`). Probed with the CLI: a guessed shape exits 6 (`result: unknown field "verdict"`), a missing result file exits 6, and both send the step to Failure Path; a result that follows "put only your findings and judgments in it" has no `body`, so the stub overwrites the agent's full **Create** with only the header and a generated Findings Log, which drops Scope, Notes and the gaps log (plan UPDATE lines "result serialization contract"; DONE WHEN "every ... redundant machine-field instruction is replaced") — Fixable: true
- TASK 9: the engine-derived `Failures` contradicts the prompts' own rule now that callers render through `--result-file` — `renderResult` sets `Failures` = every finding (`.bkit/core/engine/commands/workflow/steps.ts:1537`), but `bkit-build-challenge-1.md:89`, `bkit-build-challenge-2.md:96`, `bkit-plan-review-1.md:91`, `bkit-plan-review-2.md:87` and `bkit-plan-scope-check.md:83` define `Failures` = the number of complete `CRITICAL` findings; a challenge-1 result with one HIGH and one MEDIUM finding and Verdict CONCERNS renders `Failures: 2` where the prompt rule gives 0, and `steps finish` sums those counts (DONE WHEN "without contract drift"; plan "compute redundant totals ... where the contract is deterministic") — Fixable: true
- TASK 9: `.bkit/core/prompts/bkit-plan-review-2.md:89` the inserted structured-result line is an unindented top-level bullet set off by blank lines between steps 11 and 12, so it splits the numbered step list (the same defect round 2 fixed in 11 other prompts); nest it under step 11 — Fixable: true
