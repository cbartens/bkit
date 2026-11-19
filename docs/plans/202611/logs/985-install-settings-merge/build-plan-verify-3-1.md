Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 6, 7
Loosened: none
Fingerprint: 63263906fed23c645556eecdf86a160a0cbeb2dfb6b1d855849a3dbd2f2eccd2
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Both group 3 tasks meet their `DONE WHEN` in code, and the documentation they changed is now out of date.

- TASK 6: `writeTier2JsonContained` (`.bkit/core/engine/install/write.ts`) takes a new `derivedKeep` argument and drops those values from the retired list before pruning and before reporting. Both the install path (`runClaudeModule`, `.bkit/core/engine/install/modules/claude.ts:116`) and the upgrade JSON branch (`runUpgrade`, `.bkit/core/engine/commands/install/upgrade.ts:387`) pass `resolveClaudeDerivedAllows(cwd)` as that argument, so a `Linear` row in `mcp-servers` keeps `mcp__claude_ai_Linear__*`. The upgrade path has no test of its own; I judged it from the code. Built `dist/` matches the sources.
- TASK 7: `assertRetirableEntry` throws an error naming the value and its path for any entry not on `permissions.allow`. It runs at the top of both `pruneRetiredSettingsEntries` and `findRetiredSettingsEntries`, so the shipped list and any injected list are both covered. The test also checks the document is left unchanged.
- Decision record `build-decision-1-1.md` (Q1, Task 7): `Decision: Fix now`, assumed by the orchestrator, not the owner's answer. Task 7 carries out that fix. Whether a release may ever take back a deny or ask rule is still open for #1006.
- Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, 0 gaps. Both planned tests went red, then green. There are no Taken over, Unproven, Changed by a code step or Updated tests sections.
- Local run: `write.test.ts`, `modules/claude.integration.test.ts` and `commands/install/upgrade.integration.test.ts`: 3 files, 213 tests passed.
- `docs/observability.md`: the new error carries the `[bkit]` prefix and is thrown, not swallowed.
- The gaps below are documentation only (plan `Documentation Updates` rows for `docs/migrations.md` and `docs/testing.md`). They do not reopen either task's `DONE WHEN`.

## Identified Gaps Log

2 gaps.

TASK 6: docs drift — `docs/migrations.md:47`, `.bkit/core/.bkit/install.md:224` and `docs/testing.md:907` still say the retired entry is always removed; none says a value `resolveClaudeDerivedAllows` derives (a `Linear` row in the `mcp-servers` block) is kept and not reported, and the `docs/testing.md` inventory row does not name the new `keeps a retired value the mcp-servers block derives and records no drift on the next dry run` test (plan Documentation Updates rows for `docs/migrations.md` and `docs/testing.md`) — Fixable: true
TASK 7: docs drift — `docs/migrations.md:47` tells later builds (#1006, #1019) to "Add one list line and one row here per later retired entry" without saying only `permissions.allow` entries are accepted and any other path throws; the `docs/testing.md:906` inventory row does not name the new `does not remove a deny rule named by an injected retired list` refusal test (plan Documentation Updates rows for `docs/migrations.md` and `docs/testing.md`) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6: docs do not describe the derived-value keep
  **Severity:** LOW · **Class:** docs-drift · **Fixable:** true · **Location:** `docs/migrations.md:47` · **Round:** 1
  - **DONE WHEN:** docs/migrations.md:47, .bkit/core/.bkit/install.md:224 and docs/testing.md:907 say a retired value that resolveClaudeDerivedAllows derives (mcp-servers block) is kept and not reported, and the testing.md inventory row names the new claude.integration.test.ts test
  - **TEST FIRST:**
    - .bkit/core/engine/install/modules/claude.integration.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 7: docs do not state the permissions.allow-only limit
  **Severity:** LOW · **Class:** docs-drift · **Fixable:** true · **Location:** `docs/migrations.md:47` · **Round:** 1
  - **DONE WHEN:** docs/migrations.md:47 says only permissions.allow entries may be listed and any other path throws, and the docs/testing.md:906 inventory row names the refusal test
  - **TEST FIRST:**
    - .bkit/core/engine/install/write.test.ts
<!-- bkit:task 2 end -->
