Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6, 8, 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-2-1.md`: `CONCERNS`, 6 gaps (TASK 7 not-green, TASK 9 Hook Text source, and the four over-budget shell compositions for tasks 6, 7, 8 and 9).
- `build-plan-gaps-remediate-2-1-log.md`: `FAIL`, fixed 2. It fixed the Hook Text entry and the budget composition. It left the TASK 7 test BLOCKED because the wrong assertion sits in a planned TEST FIRST case.

## Notes

- Mode `Group`, group 2 (tasks 6-9), judged against `build-diff-2-2.md`. No brief carries a `Deviations` section. No `build-decision-*.md` exists. No tests step ran between attempts: there is no `build-brief-tests-2-2.md`, and `build-plan-tests-2-log.md` is unchanged.
- Test-first audit (`build-tests-green-2-2.md`): `Enforced: true`, 1 gap, `Unproven: 0`. It has no `Updated tests`, `Already landed` or `delete-still-referenced` section. The TASK 7 `not-green` gap keeps the engine's `Fixable: true`. The cause is the same as in attempt 1. Line 255 of the test asserts `emit({ permission: "allow", additional_context: result.context })`. The Cursor driver `.bkit/core/.cursor/hooks/bkit-gateguard.cjs` never contained that text, and neither group diff touches it (last commit 5f5b47b3d). It emits the same object as the ternary branch `: { permission: "allow", additional_context: result.context }`. Every other assertion in the case passes: the Delete matcher and payload, the shell advice, the shared warning record and the single `process.stdout.write`. Remediation cannot close this gap, because only the tests step may rewrite a planned TEST FIRST case. The orchestrator should route it to the tests step, or to the owner.
- Size gap re-measured as the orchestrator asked. The test rendered each guardrails template with `readTemplate`. It ran the same 12-target `sed -i s/a/b/ docs/very-long-target-name-number-{0..11}.md && python3 gen.py` with a fresh session, using `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/measure.ts`, `measure2.ts`, and `measure3.ts` (which extends them). Results: Claude 6,691 chars (budget 8,000; 4 blocks plus the omitted notice); Codex 1,073 bytes; Cursor 1,073 bytes; Antigravity deny reason 1,156 bytes including the retry text. Each 2,000-byte budget holds the shell notice plus the omitted notice (0 blocks, 12 omitted). Extra cases all stay under budget, and each fits at least one whole block. One agent-read doc: Codex/Cursor 1,814 bytes, Antigravity 1,897 bytes. One code file: 1,299 / 1,382. `.agents/rules.md` plus a code file: 1,620 / 1,703 with 1 block and 1 omitted on the 2,000-byte hosts, and Claude 2,385 chars with 2 blocks. The four budget gaps from attempt 1 are closed.
- `instructions-sources.test.ts` Hook Text now passes (`.bkit/instructions.md` names `selectAdvice`).
- Test runs: the four named files gave 409 passed and 1 failed (the TASK 7 case). The other five TEST FIRST cases for tasks 6, 8 and 9 pass. The wider run covered `audits/hooks`, `install/modules`, `render`, `audits/templates`, `tools/instructions*.test.ts` and `checks/after`, 62 files: 2,945 passed, 4 failed. The fourth failure is the three T6 `guardrails.cjs installed mirror is its rendered template` cases (claude, codex, cursor). These are stale mirrors waiting for the end-of-session `bkit upgrade` (`.agents/rules.md` § Install to mirror), treated the same way as in earlier verify reports, so they are not logged.
- Task 6: the named case passes for matcher and payload, multiple targets and the shell/edit identity flow. Default output stays non-blocking, and Claude shell advice now fits the 8,000-char budget with the fetch note counted (`outside`). The provider-guidance wording on next-request timing belongs to TASK 10 (group 3), as attempt 1 noted.
- Task 8: the named case passes for every add/update/delete/move target and initial Bash payloads. Codex shell advice now fits 2,000 bytes.
- Task 9: all three named cases pass. Antigravity acknowledgement follows `adviseOnceDelivery(...).delivered`, and the composed deny reason now counts the fetch line, shell notice and `AG_RETRY_SUFFIX`.
- Task 7: code for Delete and shell advice is in place, and Cursor shell advice now fits 2,000 bytes. The task stays off `Tasks` only because its named test is red.
- Out-of-scope observation, not a gap: in `.bkit/core/hooks/antigravity-hook.js`, the `adviseOnceDelivery` JSDoc block now sits above `const AG_RETRY_SUFFIX` instead of above the function it describes.

## Identified Gaps Log

1 gap.

- TASK 7: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `routes Cursor delete and shell targets without replacing its driver` — not-green — Fixable: true
