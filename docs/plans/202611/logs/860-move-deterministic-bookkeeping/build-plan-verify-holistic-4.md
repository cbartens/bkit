Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
Loosened: none
Fingerprint: eb800e507e0465ed319f2e32b165e55088640f52ff821f0c14424d5b64e5bb16
<!-- verdict:end -->

# Plan Verification

## Scope

`Holistic`

## Groups Verified

7 of 7 plan groups verified (groups 1-7; Tasks 1-24).

## Integration Gaps

1 integration gap, `Fixable: true`.

1. **Host mirrors stale after group 6:** Tasks 20 and 21 (group 6) changed 17 prompt sources under `.bkit/core/prompts/` (`bkit-audit-generate`, `bkit-build-challenge-1`, `bkit-build-challenge-2`, `bkit-build-plan-verify`, `bkit-debug-failure-diagnose`, `bkit-design-review-1`, `bkit-design-review-2`, `bkit-design-spike`, `bkit-plan-review-1`, `bkit-plan-review-2`, `bkit-plan-scope-check`, `bkit-ship-deferred-sweep` and the five `bkit-utility-update-*`). No later round re-rendered them, so `node dist/cli.js check` now reports `86 write(s) would occur — DRIFT DETECTED`: 17 files each in `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/`, `.codex/agents/` and `.agents/plugins/bkit/agents/`, plus the `.bkit/version` pin. As a result, Task 9's (group 4) DONE WHEN "`bkit check` pass" and the Documentation Updates row "Installed host/catalog mirrors and `dist/`" no longer hold. `.husky/pre-push:235` runs `pnpm bkit check`, so Step 16's push would be refused. Task 9 is left off the `Tasks` line for this reason only; its other DONE WHEN parts still hold. The fix is mechanical: `pnpm bkit:generate`, then commit the regenerated mirrors.

Other cross-group contracts checked and consistent:

- **Audit journey (Tasks 1, 4, 6, 13, 15, 19, 23, 24):** run through the compiled CLI in a scratch git repo. `status invocation --standalone=audit --name=security` issued a runless id. `steps stub --agent=bkit-audit-generate --result-file --to=<existing report>` left the anchored report intact and wrote `tmp/a.summary.md` (`reportKept` printed). The printed `ledgerRows` carried no `by` and the key `audit-security-missing-csrf-token`. They appended verbatim under `--invocation --issue-operation`, and the engine filled `by` as `{workflow: audit, step: audit:security}`. A second identical append returned `replayed: true` and wrote nothing (`docs/failures.jsonl` holds 1 line). The operation store was `<git dir>/bkit-outbox/ledger-operations/<hash>.jsonl` (mode 0600, dir 0700), and no `.bkit/ledger-operations.jsonl` was created. `issues comment --kind=audit --result-file` drafted the same counts (`HIGH 1`).
- **Operation store move (Task 23) vs. Tasks 4, 14, 17:** union (`ledgers.ts:1319`), the `--correction-of` guard (`ledgers.ts:1858`), compact (`ledgers.ts:2107`) and `migrateLedgers` (`migrate.ts:88`) all read pending intents through `pendingLedgerIntentsFor`, with the same checkout-relative target paths that `recordLedgerIntent` stores. No engine, prompt, workflow or doc still names `.bkit/ledger-operations.jsonl`. The only hits are a test that asserts it is absent and the stale deferral row noted below. `docs/architecture.md:222` and `docs/observability.md:38` name the outbox location.
- **Result contract (Task 20) vs. Task 9 callers:** the 10 agents whose result the workflows render with `steps stub --result-file` (`bkit-plan.md:382-384`, `bkit-build.md:703,865,979-980,1089`, `bkit-ship.md:759`, `bkit-debug.md:559`, `bkit-design.md:423-424,455`) are exactly the 10 prompts that now tell the agent to always state `evidenceComplete`. The audit agent takes its own `renderAudit` branch.
- **Coverage routing (Task 21):** no `coverage.clean` remains under `.bkit/core/`. The 8 paging readers route `missing` / `partial` / `unreadable`. The other `ledgers query` callers (`bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-plan-review-1/2`, `bkit-plan-generate`, `bkit-plan.md:362`) do not page; the query returns every winner in one page by default (`total: 129`, `nextCursor: null` on this repo's knowledge ledger).
- **Invocation privacy (Task 22) vs. Tasks 10, 11:** `status.test.ts` (81), `lib.test.ts` (73) and `journal.integration.test.ts` (20) pass, including the receipt-rebuild and cross-worktree refusal cases.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (`CONCERNS`, 2 integration gaps), fixed in `d29a6877a` per `build-plan-gaps-remediate-holistic-1-log.md`.
- `build-plan-verify-holistic-2.md` (`CONCERNS`, 2 integration gaps), fixed in `db7bbcd4d` per `build-plan-gaps-remediate-holistic-2-log.md`.
- `build-plan-verify-holistic-3.md` (`PASS`, groups 1-4, Tasks 1-12). Groups 5-7 (Tasks 13-24, from the build challenge) were added after it.
- Last per-group reports: `build-plan-verify-1-8.md`, `build-plan-verify-2-1.md`, `build-plan-verify-3-5.md`, `build-plan-verify-4-5.md`, `build-plan-verify-5-2.md`, `build-plan-verify-6-1.md`, `build-plan-verify-7-1.md`.

## Notes

- **Tasks:** 23 of 24 tasks meet their DONE WHEN. Task 9 is the exception, for the mirror drift above only.
- **Task 13** is still `[ ]` in the plan, although `build-plan-verify-5-1.md` and `-5-2.md` judged it satisfied. Group 5's tick passed `--green`, and the test-first report listed Task 13's test as `Already landed`. The code meets its DONE WHEN: `steps.ts:2333-2349` writes the audit summary to `<result-file stem>.summary.md` when `--to` already holds a report, and the planned test `audit result render keeps an existing anchored report intact` passes. It is named on `Tasks` so the holistic tick (which passes no `--green`) ticks it. `build-decision-1-5.md` Q1 is the owner's "Fix now". The DONE WHEN allows the separate-file route.
- **Decision records:** `build-decision-1-1.md` to `1-3.md` produced Tasks 10-12, `1-4.md` holds no question, and `1-5.md` produced Tasks 13-14. None accepts a gap.
- **Matrix:** all 45 `Derived Test Matrix` rows (44 distinct names; Tasks 2 and 12 share one) exist exactly once in their named files.
- **Tests run (single file each, as the caller directed):** `ledgers/status.test.ts` 15, `counters.test.ts` 63, `compact.test.ts` 18, `workflow-shape.test.ts` 257, `commands/lib.test.ts` 73, `workflow/status.test.ts` 81, `run-facts.test.ts` 47, `telemetry.test.ts` 299, `runs.test.ts` 191, `challenge.test.ts` 38, `tools/instructions.test.ts` 103, `install/modules/core.integration.test.ts` 147, `journal.integration.test.ts` 20, `workflow/ledgers.test.ts` 106, `steps.test.ts` 124, `issues.test.ts` 93, `render/trackers.test.ts` 105, `audits/repo/rules-sync.test.ts` 5, `tools/cli-doc.test.ts` 7. All passed.
- **Not run:** `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (Process step 7). The caller forbade it because it takes the machine-wide tests lock, so the full-suite pass is not re-proven this round. The last full runs were group 6's `vitest run` (9322 passed, 2 skipped) and `build-group-gate-6-1.md` (PASS). No group 7 gate report exists yet.
- **`dist/`:** `tsc --outDir <scratch>` compared with `diff -rq` against `dist/` shows no difference.
- **Not judged:** `pnpm build` (this agent does not build).
- **No test-first audit report** was supplied for this round.
- **Out of scope, proposed separately:**
  - `test-run` rows in the run `status.jsonl` still commit an absolute outbox `log` path (`/Users/<name>/...`). This is the same exposure Task 22 closed for `invocation` rows (first raised in `build-plan-verify-6-1.md`).
  - `docs/deferrals.jsonl:235` still describes the committed `.bkit/ledger-operations.jsonl`, which Task 23 moved into the private outbox (first raised in `build-plan-verify-7-1.md`).
  - Runless audit rows get `by` = `{workflow, step}` only, with no `modelAvailability` / `modelSource`. Task 2's DONE WHEN covers delegated invocations, so this is not a gap here.
- **This agent's loaded definition** is the main checkout's older `.claude/agents/bkit-build-plan-verify.md`, which lacks the `Result:` contract. The result file was written to the worktree source contract (`.bkit/core/prompts/bkit-build-plan-verify.md:112`).

## Identified Gaps Log

1 gap.

- INTEGRATION: Group 6's prompt edits (Task 20 `evidenceComplete` wording in 10 prompts, Task 21 coverage routing in 8 prompts; 17 prompts in all) were never re-rendered into the host mirrors, so Task 9's (group 4) DONE WHEN "`bkit check` pass" and the Documentation Updates row "Installed host/catalog mirrors and `dist/`" no longer hold: `node dist/cli.js check` reports `86 write(s) would occur — DRIFT DETECTED` (17 files each in `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/`, `.codex/agents/` (`.toml`) and `.agents/plugins/bkit/agents/`, plus the `.bkit/version` pin), and `.husky/pre-push:235` runs `pnpm bkit check`, so Step 16's push would be refused. Fix: run `pnpm bkit:generate` (or `pnpm tsx .bkit/core/engine/cli.ts upgrade`) and commit the regenerated mirrors, then confirm `node dist/cli.js check` reports 0 writes — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Host mirrors stale after the group 6 prompt edits (Tasks 20, 21); bkit check reports 86 writes, breaking Task 9 DONE WHEN
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.husky/pre-push:235` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:generate (or pnpm tsx .bkit/core/engine/cli.ts upgrade) has re-rendered the 17 changed prompts into .claude/agents, .cursor/agents, .opencode/agents, .codex/agents and .agents/plugins/bkit/agents plus the .bkit/version pin, the regenerated files are committed, and node dist/cli.js check reports 0 writes
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
