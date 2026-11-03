Verdict: PASS
Failures: 0
Fixable: false
Tasks: 15, 16, 17, 18, 19
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-6-1.md` (CONCERNS, 2 gaps: Task 19 Vale symlink notice; three `docs/migrations.md` rows). Remediated in `build-plan-gaps-remediate-6-1-log.md` (commit 678c3619b).
- `build-plan-verify-6-2.md` (CONCERNS, 1 gap: the `docs/migrations.md` Vale row overstated the symlinked-rule case). Remediated in `build-plan-gaps-remediate-6-2-log.md` (commit 1f0f25eb2).

## Notes

- Judged against `build-diff-6-3.md`. The round 2 remediation (1f0f25eb2) changed only `docs/migrations.md:38`; its other plan-file change is the workflow ticking Task 19 after round 2. `core.ts`, `dist/install/modules/core.js` and every planned test are unchanged since round 2.
- Round 2 gap resolved: `docs/migrations.md:38` now lists "an edited rule, a taken target or a symlinked rule" as per-rule cases that stay with a warning, which matches the per-rule `continue` at `core.ts:1262-1267`. The directory clause ("a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning") matches the early returns at `core.ts:1246-1258`. A symlinked `Bkit` with no `House` directory returns silently, but then no rule exists to move.
- Other rows re-checked against the code: "Branded script tokens in hooks and CI" (line 35) matches Task 18 (`otherWorkflows(files)` scanned with `findOldScriptNames`, warn-only). The `--filter=` forms from Task 17 fall under its "name it cannot reach" warning. "Branded CI script files" (line 36) matches Tasks 15 and 19 (a referencing workflow outside the path pass, or a symlinked source, target or directory, leaves the whole unit with a warning). "Branded check names" (line 37, "when the job has none") holds for Task 16.
- Test-first audit `build-tests-green-6-3.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all seven planned tests went red, then green. It has no `Updated tests`, `Already landed` or `Unproven` entries.
- `pnpm bkit:gate:static-unit` exit 0 (166 files, 6960 passed, 2 skipped; bats green). A targeted `vitest run` of `core.integration.test.ts` and `core.test.ts` passed all seven group 6 tests (7 passed, 152 filtered out).
- Observability: every new warning uses the module's `${logPrefix}` per `docs/observability.md`, and names paths only, never file bytes.
- `build-decision-1-1.md` covers group 3 only and accepts nothing in this group. `build-plan-current.md` calls for line-anchor rewording in Tasks 1, 2, 3, 7, 8, 11 and 12 only, none of them in this group.
- Out of scope, not gated: the five LOW challenge findings are deferred in `docs/deferrals.jsonl` (`748-brand-every-consumer-challenge-low-*`). The round 2 probe notes still apply: a symlinked `.github/workflows` directory or workflow file is skipped by `otherWorkflows`, and a symlinked `.vale` or `.vale/styles` warns on every upgrade.

## Identified Gaps Log

None

