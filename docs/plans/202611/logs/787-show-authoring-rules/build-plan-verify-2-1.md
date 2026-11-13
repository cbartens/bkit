Verdict: CONCERNS
Failures: 6
Fixable: true
Tasks: none
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

None

## Notes

- Mode `Group`, group 2 (tasks 6-9), judged against `build-diff-2-1.md`. No brief carries a `Deviations` section; no `build-decision-*.md`, earlier `build-plan-verify-2-*.md` or `build-plan-gaps-remediate-2-*-log.md` exists.
- Test-first audit (`build-tests-green-2-1.md`): `Enforced: true`, 1 gap, `Unproven: 0`, no `Updated tests`, `Already landed` or `delete-still-referenced` sections. Its TASK 7 `not-green` gap keeps the engine's `Fixable: true`. The test, not the code, is wrong: the asserted `emit({ permission: "allow", additional_context: result.context })` never existed in the Cursor driver, which `build-diff-2-1.md` does not touch and which emits that object as the ternary's `: { permission: "allow", additional_context: result.context }` branch. Matching the test to the preserved driver bytes closes it.
- Re-run of the four named files: 409 pass, 1 fail (the TASK 7 case). The other five TEST FIRST cases (tasks 6, 8, 9) pass.
- Wider run (`.bkit/core/engine/audits/hooks`, `install/modules`, `render`, `audits/templates`, `tools/instructions*.test.ts`, `dogfood-templates`, `checks/after/managed`; 56 files): 2,729 pass, 6 fail. Logged: the TASK 7 case and `instructions-sources.test.ts` Hook Text. Not logged: the three T6 `guardrails.cjs installed mirror is its rendered template` cases (cursor, claude, codex), stale mirrors that wait for the end-of-session `bkit upgrade` (`.agents/rules.md` § Install to mirror; group 1 verify reports treated them the same way); and `machine-lock.integration.test.ts` `a waiting run starts as soon as the holder finishes...`, a timing case that passes 43/43 when run alone and sits outside this group's diff.
- Budget gaps measured with each rendered guardrails template, run on a 12-target `sed -i ... && python3 gen.py` (script at `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/measure.ts` and `measure2.ts`). The plan's TASK 5 entry says "Count all composed advice"; the design (`787-show-authoring-rules-design.md` line 97) says to count "the entire added context, including the shell introduction". The group 2 composition counts only the per-file blocks.
- Tasks 6 and 8 meet their `DONE WHEN` text literally. They stay off `Tasks` because each carries the logged budget gap at its composition site. Tasks 7 and 9 each also have a failing or broken test.
- Task 6 "next-request timing limitation" and task 7 "envelope remains documented as unverified": the hooks emit no claim of same-edit read opportunity and no guessed Cursor field. `.bkit/core/.bkit/providers.md` § GateGuard still says "Claude / Codex / Cursor inject the checklist before the edit" with no unverified/next-request wording; TASK 10 (group 3) owns that provider-guidance update, so it is not logged here.
- Task 6 and task 7 list `UPDATE` on `.bkit/core/.claude/hooks/bkit-gateguard.cjs` / `.bkit/core/.cursor/hooks/bkit-gateguard.cjs`; neither changed. Both render `gateguard-edit-payload.js` through `BKIT_PART`, so the NotebookEdit / Delete adapter change reaches them with the driver bytes kept; this satisfies "retain" / "without replacing".
- Task 8: `.bkit/core/.codex/hooks/bkit-gateguard.cjs` is unchanged in group 2; the complete patch batching came from group 1, and the named case proves every add/update/delete/move target is shown or counted omitted and left eligible.

## Identified Gaps Log

6 gaps.

- TASK 7: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `routes Cursor delete and shell targets without replacing its driver` — not-green — Fixable: true
- TASK 9: `.bkit/instructions.md` `## Hook Text` entry `gateguard-advice-omitted` still names `.bkit/core/hooks/gateguard-engine.js` `deliverAdvice`, but the split moved the omitted-target string into `selectAdvice`; `.bkit/core/engine/tools/instructions-sources.test.ts` `every hook message has an entry and every entry is still emitted` now fails (broken test not fixed by the task that broke it) — Fixable: true
- TASK 6: `shellEditContext` in `.bkit/core/hooks/gateguard-engine.js` budgets only the per-file blocks and prepends the shell notice outside `ADVICE_BUDGETS.claude`, so composed Claude shell advice exceeds the 8,000-character budget (measured 8,096 chars for a 12-target `sed -i ... && python3 gen.py`), against the plan's "Count all composed advice" (TASK 5) — Fixable: true
- TASK 7: same `shellEditContext` composition in `.bkit/core/.cursor/hooks/bkit-guardrails.cjs` `decideShell` puts Cursor shell `agent_message` over the 2,000-byte `ADVICE_BUDGETS.cursor` (measured 2,481 bytes, same command) — Fixable: true
- TASK 8: same `shellEditContext` composition in `.bkit/core/.codex/hooks/bkit-guardrails.cjs` `decideShell` puts Codex Bash `additionalContext` over the 2,000-byte `ADVICE_BUDGETS.codex` (measured 2,481 bytes, same command), contradicting the execute log's "within the 2000-byte budget" — Fixable: true
- TASK 9: `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs` `bkitGuardrails` runs `selectAdvice` on the blocks alone and joins the shell notice (and fetch notice and retry suffix) outside `ADVICE_BUDGETS.antigravity`, so the deny reason exceeds 2,000 bytes (measured 2,564 bytes, same command) — Fixable: true
