Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6, 7
Loosened: none
Fingerprint: 76b5b5e10f0a0da40f19d3235ad74765b1075396683498014e832791116be8ae
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-3-1.md`: `CONCERNS`, 2 docs-drift gaps (Tasks 6 and 7), both closed by `build-plan-gaps-remediate-3-1-log.md`.

## Notes

Both group 3 tasks still meet their `DONE WHEN`, and the two documentation gaps from attempt 1 are closed.

- TASK 6: `writeTier2JsonContained` (`.bkit/core/engine/install/write.ts`) takes `derivedKeep` and drops those values from the retired list before pruning and reporting. The install path (`runClaudeModule`, `.bkit/core/engine/install/modules/claude.ts`) and the upgrade JSON branch (`runUpgrade`, `.bkit/core/engine/commands/install/upgrade.ts:387`) both pass `resolveClaudeDerivedAllows(cwd)`; `enrichClaudeSettingsAllows` follows at `upgrade.ts:1018`. The upgrade path has no test of its own; judged from the code. Built `dist/` matches the sources.
- TASK 7: `assertRetirableEntry` throws a `[bkit]` error naming the value and its path for any entry not on `permissions.allow`, at the top of both `pruneRetiredSettingsEntries` and `findRetiredSettingsEntries`; the test also checks the document is unchanged.
- Attempt 1 docs gaps: `docs/migrations.md:47`, `.bkit/core/.bkit/install.md:224` (and its rendered `.bkit/install.md`, identical) and `docs/testing.md:906-907` now state the derived-value keep and the `permissions.allow`-only limit, and name both new tests (remediation `build-plan-gaps-remediate-3-1-log.md`, commit `fd426c422`).
- Decision record `build-decision-1-1.md` (Q1, Task 7): `Decision: Fix now`, assumed by the orchestrator, not the owner's answer. Whether a release may take back a deny or ask rule stays open for #1006.
- Test-first audit (`build-tests-green-3-2.md`): `Enforced: true`, 0 gaps; both planned tests red then green. No Taken over, Unproven, Changed by a code step or Updated tests sections.
- Local run: `write.test.ts`, `modules/claude.integration.test.ts`, `commands/install/upgrade.integration.test.ts`: 3 files, 213 tests passed.
- `docs/observability.md`: the new error carries the `[bkit]` prefix and is thrown, not swallowed.

## Identified Gaps Log

None
