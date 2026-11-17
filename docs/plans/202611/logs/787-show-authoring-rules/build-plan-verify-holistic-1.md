Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (groups 1, 2 and 3; the plan has 3 groups).

## Integration Gaps

4 integration gaps, all `Fixable: true`:

1. **Notice reserve drift (TASK 5 vs TASK 10).** The engine reserves 300 units for notices (`.bkit/core/hooks/gateguard-engine.js:305`). The group 2 remediation commit d6ec5fb5b lowered it from 512, and no gap asked for that. TASK 5 specifies 512, and the shipped `.bkit/core/.bkit/providers.md:424` tells consumers 512. Restore 512 so code, plan and doc agree.
2. **OpenCode budget doc drift (TASK 9 vs TASK 10).** OpenCode advice runs through `deliverAdvice` with an 8,000-character budget (`ADVICE_BUDGETS.opencode`), so oversized blocks are omitted and counted. The `providers.md` § Response budgets table says OpenCode has no budget (`none`).
3. **Codex fetch-plus-edit divergence (TASK 8 vs TASKS 3, 6, 9 and 12).** On an allowed off-list fetch combined with a shell edit, Codex (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:83-86`) adds only the shell notice. Claude and Antigravity also add each exact target's per-file checklist and the general authoring reminder. A rendered-hook probe confirmed this: `curl -s https://evil.example.com/x && sed -i s/a/b/ docs/testing.md` gives Claude the `First edit to testing.md` block and the `Agent-read file` reminder, and gives Codex neither. The Task 12 parity corpus has no fetch-plus-edit case, so it does not catch the divergence.
4. **Upgrade from older shipped layouts duplicates bkit hook groups (TASK 13 vs the group 2 registrations).** `mergeManagedList` (`.bkit/core/engine/install/write.ts:225-242`) recognises a bkit group only by a byte-identical `command`. The 5.1.0 Antigravity hook commands use an older spelling, so after upgrade the old gateguard and guardrails groups survive next to the new ones. The existing test `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file)` now fails at line 906. TASK 13 broke this test and did not fix it, and its DONE WHEN says "no duplicate bkit group appears".

## Previously Attempted

This is the first holistic attempt. Per-group rounds:

- Group 1: `build-plan-verify-1-1.md` (CONCERNS, 2), `build-plan-verify-1-2.md` (CONCERNS, 2), `build-plan-verify-1-3.md` (PASS), `build-plan-verify-1-4.md` (PASS; Tasks 1-5).
- Group 2: `build-plan-verify-2-1.md` (CONCERNS, 6), `build-plan-verify-2-2.md` (CONCERNS, 1), `build-plan-verify-2-3.md` (PASS; Tasks 6-9).
- Group 3: `build-plan-verify-3-1.md` (FAIL, 4), `build-plan-verify-3-2.md` (FAIL, 1; Tasks 10, 12), `build-plan-verify-3-3.md` (CONCERNS, 4), `build-plan-verify-3-4.md` (FAIL, 3), `build-plan-verify-3-5.md` (FAIL, 1; Task 11), `build-plan-verify-3-6.md` (PASS; Tasks 11, 13).
- Remediation logs `build-plan-gaps-remediate-{1-1,1-2,1-3,2-1,2-2,3-1,3-3}-log.md`; owner decisions `build-decision-1-1.md` to `build-decision-1-4.md` (all Fix now).

## Notes

- Mode `Holistic`, all 3 groups and 13 tasks. All 13 tasks carry `[x]` in the plan. The run's diff `tmp/bkit-diff-787-show-authoring-rules.md` has partial diff coverage: 20 of 135 files are shown. The changed hook, engine, registration and doc sources were read directly, using `git diff da97be38` (merge base with `origin/dev`).
- **`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`** exited 1: 227 test files, 41 failed, 9224 passed, 2 skipped; lint, format and typecheck passed. Of the 41 failures, 40 are stale installed copies, which the caller said not to log: 36 `.bkit/core/engine/audits/templates/templates.test.ts` dogfood `docs/templates/*` cases, 3 `guardrails-cursor.integration.test.ts` T6 mirror cases (cursor, claude, codex), and 1 `.bkit/core/engine/audits/repo/rules-sync.test.ts` `.agents/rules.md` managed-block case. The 41st failure, `upgrade.integration.test.ts` (5.1.0 Antigravity), is a real regression and is logged as integration gap 4. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/tests-changed.log`.
- **Cross-group contracts that hold:** every `shellEditTargets` caller (`guardrails-tiers.js` `classifyShell`, the Claude guardrails direct call) consumes the structured `{ targets, uncertain, limit }` evidence. The Claude, Cursor, Codex and Antigravity shell paths use `shellEditContext` / `shellTargetBlocks` with `dedupKey(session, agent)`. Edit-tool paths use `prepareAdvice` + `deliverAdvice` / `selectAdvice` (Codex, Antigravity, OpenCode) or `firstTouchAdvice` with payload `cwd` (Claude/Cursor payload adapter). Antigravity acknowledges only on `adviseOnceDelivery(...).delivered`. The NotebookEdit, `Write|Delete` and `multi_replace_file_content` registrations reach consumers through the TASK 13 merge (its named upgrade case passes). The Hook Text entries match the emitted strings (`instructions-sources.test.ts` passes inside the run).
- **Derived Test Matrix:** all 28 rows have their named test in the named target file, each present once, inside the owning task's TEST FIRST / DONE WHEN. Apart from the stale-mirror cases, the only failures in the run are outside these named tests.
- **Documentation Updates:** all five rows are done (`.bkit/core/.agents/rules.md`, `.bkit/instructions.md`, all 36 `.bkit/core/docs/templates/*.md` carry `§ Doc Templates`, `providers.md`, `workflows.md`, `docs/testing.md`), except the `providers.md` budget inaccuracies in gaps 1 and 2. Errors: the hooks stay fail-open with no new log store, which matches the plan's Observability pre-flight and `docs/observability.md` § Scope.
- **Tasks line:** tasks 1-12 meet their DONE WHEN (named tests pass). Gaps 1-3 are cross-group drift found beyond those named tests, and are logged as integration gaps rather than as unmet DONE WHEN. TASK 13 is left off: its DONE WHEN "no duplicate bkit group appears" fails for an older shipped layout, and it broke an existing test (gap 4).
- **Decision records:** `build-decision-1-1.md` to `build-decision-1-4.md` all chose Fix now, and none accepts a gap here. TASK 13 and its integration test being `unproven` is the owner-approved path (`build-decision-1-2.md`), answered at Step 15, so it is not logged. No `Accept (assumed)` record exists.
- **Test-first audit:** none supplied for this holistic round; the latest per-group audits (`build-tests-green-1-4.md`, `-2-3.md`, `-3-6.md`) reported 0 gaps. Unproven: TASK 13 `upgrades shipped registrations without dropping consumer hook groups or permissions` (owner answers at Step 15).
- **Not logged (stronger decision):** the Cursor shell `fetch` tier is a real confirmation prompt (`ask`) and carries no edit notice. That is unchanged from base `da97be38`, and it follows the plan's "preserve deny/ask precedence" rule.
- **Probe hygiene:** the fetch-plus-edit probe ran rendered hooks from the scratchpad with `TMPDIR` in the scratchpad. The hooks only read the command text, so nothing was fetched or edited.
- **Base:** a `git fetch origin dev` during this run moved `origin/dev` to fc501c9e. The merge base `bkit tests changed` diffs from is still da97be38.

## Identified Gaps Log

4 gaps.

- INTEGRATION: TASK 5 (group 1) vs TASK 10 (group 3): `.bkit/core/hooks/gateguard-engine.js:305` sets `ADVICE_NOTICE_RESERVE = 300` (changed from 512 by the group 2 remediation commit d6ec5fb5b, which no gap asked for), while TASK 5's UPDATE says "reserve 512 units for uncertainty/output-limit notices" and the shipped `.bkit/core/.bkit/providers.md:424` says the engine "reserves 512 characters (Claude) or bytes (the others) of the budget for notices"; restore the planned 512 reserve (the plan makes that choice) so code, plan and shipped doc agree — Fixable: true
- INTEGRATION: TASK 9 (group 2) vs TASK 10 (group 3): `.bkit/core/.opencode/plugin/bkit-gateguard.js:200` delivers OpenCode advice through `deliverAdvice(blocks, ADVICE_BUDGETS.opencode, true)` with `opencode: { limit: 8000, unit: "chars" }` (`.bkit/core/hooks/gateguard-engine.js:302`), so blocks over 8,000 characters are omitted and counted, but the shipped `.bkit/core/.bkit/providers.md` § Response budgets table row says `OpenCode | none | No before-edit advisory route.`; state the 8,000-character after-edit budget in that row — Fixable: true
- INTEGRATION: TASK 8 (group 2) vs TASKS 3, 6, 9 and 12: on an allowed off-list fetch plus a shell edit, the rendered Codex hook (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:83-86`, `case "fetch"`) appends only `shellEditAdvisory(v.edits)` and never calls `shellEditContext`, so exact targets get no per-file checklist or general authoring reminder, while Claude (`.bkit/core/.claude/hooks/bkit-guardrails.cjs:68-80`) and Antigravity (`.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs:122-144`) compose both; probed with `curl -s https://evil.example.com/x && sed -i s/a/b/ docs/testing.md`: Claude output carries the `First edit to testing.md` checklist and the `Agent-read file` reminder, Codex output carries neither; the Task 12 parity corpus (`keeps rendered classification advice and acknowledgement equivalent`) has no fetch-plus-edit case, so it misses the divergence; route the Codex fetch branch through `shellEditContext` with the fetch text as `outside`, and add the fetch-plus-edit variant to the parity corpus — Fixable: true
- INTEGRATION: TASK 13 (group 3) vs the group 2 registration changes (TASKS 6, 7, 9): `bkit tests changed --base=origin/dev` fails `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file)` (line 906: expected `["view_file|run_command"]`, received `["view_file|run_command", "run_command"]`); `mergeManagedList` in `.bkit/core/engine/install/write.ts:225-242` drops a consumer group only when it holds a byte-identical template `command`, but the 5.1.0 shipped commands (`tests/fixtures/antigravity-5.1.0/hooks.json`: `test -f .agents/plugins/bkit/hooks/bkit-guardrails.cjs && node ... || true`) differ from the current `f=hooks/bkit-guardrails.cjs; ...` spelling, so the old bkit gateguard and guardrails groups survive as "consumer" groups and each hook runs twice after upgrade, against TASK 13's DONE WHEN "no duplicate bkit group appears"; TASK 13 broke this existing test and did not fix it; recognise earlier shipped bkit hook groups (for example by the managed `bkit-*.cjs` hook script they run) so they are replaced, and keep the test passing — Fixable: true
