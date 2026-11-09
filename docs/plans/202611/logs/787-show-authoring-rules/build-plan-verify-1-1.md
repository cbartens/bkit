Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-1-1.md` (group 1 diff). No brief `Deviations` section, no decision records and no earlier verify or remediation reports for group 1 were supplied.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, all 16 planned tests red then green; no `Unproven`, `Updated tests` or `Already landed` sections. The two TASK 5 budget tests moved from `gateguard-opencode.test.ts` to `gateguard-parity.integration.test.ts`; the plan's TASK 5 `TEST FIRST` and Derived Test Matrix already name the parity file (plan-tests attempt 2), so this is no gap.
- Test run (all 11 files in `.bkit/core/engine/audits/hooks/`, including `index.integration.test.ts` in the first run): every planned test passes; 3 failures, all T6 `guardrails.cjs installed mirror is its rendered template` (cursor, claude, codex) in `guardrails-cursor.integration.test.ts`. They fail because the `.cursor/`, `.claude/` and `.codex/` mirrors were not re-rendered after the source edits. `.agents/rules.md` § Install to mirror puts `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at the end of the session, and the execute log hands it to the orchestrator, so this is not logged as a task gap. The orchestrator has to run it before the full suite can pass.
- TASK 1: structured evidence `{ targets, uncertain, limit }`, `hookContext` and `hasEditEvidence` landed; no array-result assumption remains in any caller (`grep` of `edits.length|join|map|...` across `.bkit/core` and `.bkit/templates` is empty).
- TASK 2: probed directly — `git apply --check`, `patch --dry-run`, read-only Python and Node one-liners return no evidence; `git apply p.patch` names the target.
- TASK 4: the "both shell/edit call orders" clause is read against the Derived Test Matrix row ("both call orders and session/agent separation", relative/absolute spellings across edit channels). The shell detector reports workspace-relative targets while GateGuard keys on absolute paths; wiring shell targets into the shared warning record lands in TASK 6 to TASK 9, which must reconcile the two identities.
- TASK 5: Codex calls `deliverAdvice(..., true)`; treating Codex `additionalContext` as verified keeps its pre-existing acknowledge-on-emit behaviour ("Existing reminder semantics survive on established transports"). "Shell advisory under deny" cannot be observed until shell targets reach GateGuard (group 2).
- Out of scope: the `.bkit/friction.jsonl` row in the diff (`steps-finish/build-plan-tasks`) names `tracker.test.ts` cases from another feature; it is a dedup update by key, not work of this plan.

## Identified Gaps Log

2 gaps.

TASK 3: `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `bounds direct source inspection without executing it` / `stops analysis at each internal bound` — DONE WHEN requires race fixtures and every limit, but no case swaps a source between lstat and open (the ino/dev re-check in `readBoundedSource`, `.bkit/core/hooks/guardrails-shell.js:778-818`, is unproven) and the cooperative 200 ms deadline (`guardrails-shell.js:163`) has no assertion (tests step logged "cooperative 200 ms deadline not asserted"); add a deterministic race fixture and a deadline assertion (e.g. through a test seam for the deadline) — Fixable: true
TASK 5: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `preserves off deny and state-fallback semantics` — DONE WHEN requires the named cases to pass with corrupt state, but the test covers only unavailable state (TMPDIR is a plain file); with a corrupt state file `readState` (`.bkit/core/hooks/gateguard-engine.js:184-192`) throws from `JSON.parse` inside `prepareAdvice`, so every later call in that session silently drops all advice (probed: rendered Codex and Claude gateguard hooks print nothing, advisory and deny mode) instead of using the in-process fallback the plan names (plan line 78); add the corrupt-state variant and make unparseable state fall back — Fixable: true
