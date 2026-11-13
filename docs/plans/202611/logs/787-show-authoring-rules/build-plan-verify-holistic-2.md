Verdict: CONCERNS
Failures: 6
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (groups 1, 2 and 3; the plan has 3 groups).

## Integration Gaps

4 integration gaps, all `Fixable: true` (plus the TASK 11 and TASK 12 DONE WHEN entries that share gaps 1-3's root cause):

1. **Installed doc templates are stale (TASK 10 vs TASK 11).** 36 `templates.test.ts` dogfood cases fail because `docs/templates/*.md` was never re-rendered after the editor pointer landed in `.bkit/core/docs/templates/*.md`.
2. **Installed guardrails hooks are stale (TASKS 1-9 vs TASK 11).** The three `T6` mirror cases in `guardrails-cursor.integration.test.ts` fail for the Cursor, Claude and Codex copies.
3. **Installed rules block is stale (TASK 10 vs TASK 11).** `rules-sync.test.ts` fails on the `.agents/rules.md` managed block.
   Gaps 1-3 have one root cause: no step has run `pnpm tsx .bkit/core/engine/cli.ts upgrade`. The task and remediation logs defer it to an "orchestrator end-of-session" upgrade, but `.bkit/core/workflows/bkit-build.md` has no such step, and `pnpm bkit check` reports 245 pending writes. Earlier rounds left these unlogged on the caller's instruction; this round has no such instruction.
4. **The Codex fetch-plus-edit test does not prove what its name says (holistic-1 gap 3 fix).** The routing fix is real: the pre-fix hook gave no authoring text, and the fixed hook goes through `shellEditContext`. But under the 2,000-byte Codex budget the `docs/testing.md` checklist is omitted, and the test passes on the `Command:` line and the omission notice. The case also lives in a new unplanned file with no `docs/testing.md` row, not in the parity corpus that holistic-1 asked for.

## Previously Attempted

- Holistic attempt 1: `build-plan-verify-holistic-1.md` (CONCERNS, 4 integration gaps: notice reserve 300 vs 512, OpenCode budget doc row, Codex fetch-plus-edit composition, 5.1.0 Antigravity duplicate hook groups). Remediation `build-plan-gaps-remediate-holistic-1-log.md` fixed all four (commit 49d2878e2) and was BLOCKED on re-recording `stops analysis at each internal bound`; owner decision `build-decision-1-5.md` (Fix now) sent it to the tests step, which re-recorded it in `build-plan-tests-1-log.md` (commit 2f529ffee).
- Per-group rounds: group 1 `build-plan-verify-1-1.md` to `-1-4.md` (final PASS, Tasks 1-5); group 2 `build-plan-verify-2-1.md` to `-2-3.md` (final PASS, Tasks 6-9); group 3 `build-plan-verify-3-1.md` to `-3-6.md` (final PASS, Tasks 11, 13; Tasks 10, 12 passed in `-3-2.md`).

## Notes

- Mode `Holistic`, all 3 groups and 13 tasks; every task carries `[x]` in the plan. The run's diff `tmp/bkit-diff-787-show-authoring-rules.md` has partial diff coverage (20 of 136 files shown), so the holistic remediation commit 49d2878e2 and the changed sources were read directly with `git show`.
- **Holistic-1 gaps re-checked:** gap 1 closed (`ADVICE_NOTICE_RESERVE = 512`, `.bkit/core/hooks/gateguard-engine.js:304`, and `providers.md` § Response budgets says 512); gap 2 closed (OpenCode row now `8,000 characters`); gap 3 closed in the code (Codex `case "fetch"` calls `shellEditContext` with the fetch note as `outside`; rendered pre-fix and post-fix hooks probed from the scratchpad), with the test weakness logged as gap 4 here; gap 4 closed (`mergeManagedList` also matches by `bkit-*.cjs|js|sh` hook file, `dist/install/write.js` carries `bkitHookFile`, and `upgrade.integration.test.ts` passes in the named run).
- **`bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`** exited 1: 228 test files, 40 failed, 9226 passed, 2 skipped; lint, format and typecheck passed (the gate reports `failed: related, named` only). All 40 failures are stale installed copies (36 `templates.test.ts`, 3 `guardrails-cursor.integration.test.ts` T6, 1 `rules-sync.test.ts`), logged as gaps 1-3. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/5803913f-42ac-468c-b086-c3390e32060d/scratchpad/tests-changed-2.log`. `pnpm bkit check` (read-only) exited 1 with 245 pending writes; log in the same scratchpad, `bkit-check.log`.
- **Tasks line:** tasks 1-10 and 13 meet their DONE WHEN (named tests pass; TASK 13's 5.1.0 regression is fixed). TASKS 11 and 12 are left off: their DONE WHEN require the source-to-mirror upgrade and a passing `pnpm bkit check`, and neither holds.
- **Derived Test Matrix:** all 28 rows have their named test exactly once in the named target file, inside the owning task's TEST FIRST. None of the 28 fails.
- **Cross-group contracts that hold:** structured `shellEditTargets` evidence feeds every caller; Claude, Cursor, Codex and Antigravity shell paths all compose through `shellEditContext` (Codex fetch now too); edit-tool paths use `prepareAdvice` / `deliverAdvice` with shared `dedupKey(session, agent)`; Antigravity acknowledges only on `adviseOnceDelivery(...).delivered`; registrations reach consumers through the TASK 13 merge.
- **Documentation Updates:** all five rows are done, and the `providers.md` budget lines now match the code. Errors: the hooks stay fail-open with no new log store, which matches the plan's Observability pre-flight and `docs/observability.md` § Scope.
- **Decision records:** `build-decision-1-1.md` to `build-decision-1-5.md` all chose Fix now; none accepts a gap here, and no `Accept (assumed)` record exists. `build-decision-1-5.md` sent `stops analysis at each internal bound` to the tests step; `build-plan-tests-1-log.md` records it unchanged and passing.
- **Test-first audit:** none supplied for this round. `build-tests-red-1-4.md` (committed in 00a818ba7, not supplied) reports `stops analysis at each internal bound` as `vacuous`; that is expected for a re-recorded test whose code already exists, and it is not decided here. Unproven (from earlier rounds): TASK 13 `upgrades shipped registrations without dropping consumer hook groups or permissions`, answered by the owner at the end of the build (`build-decision-1-2.md`).
- **Out-of-scope observation, not logged:** `mergeManagedList` now drops any consumer hook group whose command runs a file named like a template's bkit hook (for example a consumer group that runs `bkit-guardrails.cjs` on an extra matcher). The plan does not decide whether such a group is the consumer's own; propose separately if it matters.
- **Probe hygiene:** rendered hooks ran from the scratchpad with `TMPDIR` in the scratchpad; they only read the command text, so nothing was fetched or edited.

## Identified Gaps Log

6 gaps, all `Fixable: true`.

- INTEGRATION: TASK 10 (group 3) source templates vs the installed `docs/templates/` copies (TASK 11 mirror upgrade): `bkit tests changed --base=origin/dev` fails 36 tests in `.bkit/core/engine/audits/templates/templates.test.ts` (`docs/templates/bkit-audit-*.md dogfood managed block differs only by the managed-version stamp` for all 35 audit templates, and `docs/templates/bkit-plan.md dogfood matches the template but for the managed-version stamp`), because the installed copies were never re-rendered after the `§ Doc Templates` editor pointer landed in `.bkit/core/docs/templates/*.md`; the build workflow has no later step that runs the upgrade, so run `pnpm tsx .bkit/core/engine/cli.ts upgrade` and commit the re-rendered copies — Fixable: true
- INTEGRATION: TASKS 1-9 (groups 1-2) hook sources vs the installed hook copies: `bkit tests changed --base=origin/dev` fails 3 tests in `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` (`T6 — guardrails.cjs installed mirror is its rendered template` > `cursor: mirror matches its template`, `claude: mirror matches its template`, `codex: mirror matches its template`), because `.cursor/hooks/`, `.claude/hooks/` and `.codex/hooks/` still hold the pre-change rendered guardrails hooks; re-render them with the standard upgrade and commit them — Fixable: true
- INTEGRATION: TASK 10 (group 3) `.bkit/core/.agents/rules.md` vs the installed `.agents/rules.md`: `bkit tests changed --base=origin/dev` fails `.bkit/core/engine/audits/repo/rules-sync.test.ts` `managed bkit:start→bkit:end block is byte-identical between .agents/rules.md and the template`, because the installed managed block lacks the TASK 10 script-exception and Doc Templates wording; re-render it with the standard upgrade and commit it — Fixable: true
- TASK 11: DONE WHEN "Build and standard source-to-mirror upgrade complete; affected generated dist and installed snapshots are included with their source changes" is not met: `pnpm bkit check` exits 1 with `245 write(s) would occur — DRIFT DETECTED` (`.agents/rules.md`, every `docs/templates/*.md`, the hook mirrors, and `tier2-json-drift` on `.claude/settings.json` `hooks.PreToolUse[0]`); the task logs defer the upgrade to an "orchestrator end-of-session" step that `.bkit/core/workflows/bkit-build.md` does not have; run the upgrade and commit the installed copies — Fixable: true
- TASK 12: DONE WHEN "`pnpm build`, a real built-CLI fresh scratch-consumer install under tmp/, on-disk inspection and `pnpm bkit check` pass" is not met: `pnpm bkit check` exits 1 (drift, see TASK 11), and `build-plan-tasks-3-log.md` records that the build, scratch-consumer install and check were not run; run them after the upgrade and record the outcome — Fixable: true
- INTEGRATION: holistic-1 gap 3 remediation (TASK 8 vs TASK 12): the added test `.bkit/core/engine/audits/hooks/guardrails-codex-fetch-edit.integration.test.ts` `adds the per-file checklist for the edited doc beside the fetch notice` passes, but the rendered Codex hook does not add that checklist: for `curl -s https://evil.example.com/x && sed -i s/a/b/ docs/testing.md` the composed output carries the fetch note, the shell notice and `[bkit GateGuard] 1 target omitted (output limit); ... Agent-read files: see .bkit/authoring.md § Which Sections Apply`, because the fetch note (which repeats the command) pushes the ~1,400-byte block past the 2,000-byte Codex budget; the test's `docs/testing.md` assertion matches the `Command:` line and its `/authoring/i` assertion matches the omission notice, so its name states a behaviour that does not happen; the test also sits in a new file the plan does not name (holistic-1 asked for a fetch-plus-edit variant in the `gateguard-parity.integration.test.ts` corpus, where cross-host divergence is caught) and `docs/testing.md` has no row for it; move the case into the parity corpus with a name and assertions that match the budgeted outcome (checklist when it fits, otherwise the omission notice with the target left unacknowledged) — Fixable: true
