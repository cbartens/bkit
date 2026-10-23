Verdict: FAIL
Failures: 21

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — Sub-Plan 1 of 2 (Engine), `docs/plans/202610/650-workflows-prompt-alone-plan-1.md`, attempt 4.

## Sub-Plans Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md` — `FAIL`, Failures 21: G1 Task 11 `no-red` x20, G2 Task 2 rewritten red assertion x1.
- `build-plan-gaps-remediate-1-1-log.md` — `FAIL` (`STANDARD`): G1 / G2 `BLOCKED`, no source change.
- `build-plan-verify-1-2.md` — `FAIL`, Failures 21: same G1 / G2.
- `build-plan-gaps-remediate-1-2-log.md` — `PASS` (`PIVOT`): retroactive reds for G1 (x20) and G2 (x1) recorded against pre-feature sources swapped in from a3a33172, then restored.
- `build-plan-verify-1-3.md` — `FAIL`, Failures 21: retro reds rejected as undoing code to force a red.
- `build-plan-gaps-remediate-1-3-log.md` — `FAIL` (`FINAL`): G1 / G2 `BLOCKED`, no source change; both need a human decision (accept with recorded exception, or re-run Task 11 from scratch).

## Notes

- **State unchanged since attempt 3:** `git diff --quiet 3bc75387 -- .bkit/core dist` → 0; `git diff --quiet edaf3109 -- .bkit/core dist {plan-1}` → 0. Commits since: `docs/failures.jsonl` (row `tests-green-accepts-red-recorded-after-task-code`), `.bkit/friction.jsonl` (row `gaps-remediate-pivot-forces-retroactive-reds`), remediate log, `status.jsonl`. `build-tests-green-1-4.md` = `-1-3.md` minus one `prettier-ignore` line (same 20 gaps).
- **Plan ticks (no edit needed):** `[x]` re-asserted for Tasks 1, 3, 4, 5, 12, 13, 6; `[ ]` kept for Task 2 (G2) and Task 11 (G1). Code for both meets `Done when`; each fails only on test-first evidence.
- **Failures = 21** = G1 x20 + G2 x1. Audit's 20 listed `test-changed` gaps cleared on re-reading `build-tests-green-1-4.md` diffs: Task 3 x2, Task 4 `workflows.test.ts`, Task 5 x4 (added lines only, -0); Task 4 `branches.test.ts` x2 (one import line reformatted to add imports); Task 4 `close-squash.integration.test.ts` (equivalent `PATH` join); Task 12 x6 (added `replayed: false` expectations; one test gains a `git` call-log stub and one extra assertion, original assertions kept); Task 1 x4 (Task 2 tests added; `["github","feat/abc-x"]` moved from reject table to `issueId: null` accept table as Task 2 `Done when` requires; four Task 1 red tests unchanged — judgement call).
- **Tests run:** `npx vitest run` on the 14 files the tasks name (11 unit, 3 integration incl. `shared-checkout.integration.test.ts`) → 14 files, 907 tests passed. Full suite / `pnpm bkit:gate:static-unit` not run (Single scope; remediate attempt 3 logged 5078 unit tests green).
- **Task 6:** not rebuilt (no-build mandate); `.bkit/core` and `dist/` byte-identical to 3bc75387, where verify attempts 1–2 ran `pnpm bkit:check:dist` → exit 0.
- **Plan currency:** `build-plan-current.md` `CONCERNS` affects Sub-Plan 2 Task 16 line anchors only; nothing in Sub-Plan 1.
- **Diff coverage:** partial. Large Diff Guard (586 files, +84715 -2023). In-scope: 40 files under `.bkit/core/engine` + `dist` (+3458 -453), unchanged since 3bc75387 and read in attempts 1–2. `resolve-push-base.test.ts` (-105) and `husky-pre-push.integration.test.ts` (-104) show only because `origin/dev` moved ahead (`git diff origin/dev...HEAD` on them empty) — not this branch. Ignored: `docs/plans/**/logs/**`, `.agents/skills/vitest/`, `.claude/skills/vitest`, `skills-lock.json`.
- **Gates / checklists:** Gate 1–4, Pre-Flight, Security and Verification Plan boxes left `[ ]`; this verifier ticks tasks only. Gate 2 `Test first` is false for Tasks 2 and 11.
- **Repeat loop:** fourth identical result. No source, test or audit change can clear G1 / G2; only a human decision can (see remediate attempt 3).
- **Embedded directives:** none found in logs, audit or diffs.

## Identified Gaps Log

- G1 (Task 11, not fixable): test-first `no-red` x20 stands in substance, unchanged since attempt 3. `build-tests-green-1-4.md` omits it only because remediate attempt 2 recorded 20 reds (`build-task-red-1-11-retro-1..20`, `parentSha` 63425085, 04:18:49Z–04:22:29Z) by swapping the five Task 11 sources back to a3a33172 and restoring them afterwards. `.bkit/core/prompts/bkit-build-plan-execute.md:54` says "every red MUST be recorded before the task code is written" and "never undo code to force a red". Execute log BLOCKED line confirms code came first. Remediate attempt 3 (FINAL) BLOCKED with no change and asks for a human decision. Plan-currency does not class Task 11 `Broken`; no `DONE — already landed` row. Code meets `Done when`; task stays `[ ]`.
- G2 (Task 2, not fixable): planned red test `.bkit/core/engine/commands/workflow/runs.test.ts` "runs context refuses an issue-less marker and branch naming the missing issue" still carries the assertion rewritten after its red (`not.toHaveProperty("issueId", null)` -> `expect(viaMarker.json.fid).toBeNull()`, now L2015). The audit stopped flagging it only because remediate attempt 2 re-recorded the red (`build-task-red-1-2-retro-3`, 04:23:07Z) against pre-Task-2 `runs.ts` / `fids.ts` swapped in from a3a33172 (same forbidden move as G1). Remediate attempt 3 (FINAL) BLOCKED with no change and asks for a human decision. Code meets `Done when`; task stays `[ ]`.
