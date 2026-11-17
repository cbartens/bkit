Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Holistic`

## Groups Verified

9 of 9 plan groups verified (groups 1-9; Tasks 1-31).

## Integration Gaps

1 integration gap.

- **Task 30 against Tasks 3/4 (audit key check reads a different ledger than the append writes):** `ledgerKeys` (`.bkit/core/engine/commands/workflow/steps.ts:1567`) looks for held keys in the main checkout's `docs/failures.jsonl` (`repoRoot(cwd)`, a change made in `build-plan-gaps-remediate-9-1-log.md`). `ledgers query` and `ledgers append` default to `<cwd>/docs/failures.jsonl` (`rootOf`, `.bkit/core/engine/commands/workflow/ledgers.ts:221`). The two agree only when the audit runs from the main checkout top. From a linked worktree, a new finding whose title matches an existing worktree row gets that row's key, and the old OPEN failure drops out of the fold winners. That is the exact bug Task 30 closes, and its DONE WHEN ("unique against every key already in the target ledger") fails in that case. Reproduced against `dist/cli.js` with `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/c8df0e69-6e8c-4878-95dc-cd64f434fb6b/scratchpad/h6wt2.sh`. The main-checkout control in the same script derives `audit-security-token-logged-2` and keeps both winners.
- **Task 30 against group 7's ledger-operation code (no gap):** `ledgerKeys` uses `queryLedger` with no status filter, so every fold winner (CLOSED included) counts as held. After the 9-1 remediation, a re-render after the audit's own append keeps the same key and rows. So a lost-response retry hashes to the same canonical request and replays its receipt (Task 18 `canonicalJson`, Task 23 outbox store) instead of minting a second row.
- **Task 31 against group 1's invocation code (no gap):** `resolvesInside` (`.bkit/core/engine/commands/lib.ts:648`) is applied in `resolveInvocation` and `rebuildInvocation`, alongside Task 11's issuance check and the new `lstatSync` refusal in `status invocation` (`status.ts:694`). Ship's book root is the cwd's `--show-toplevel` (`statusLocation`), and the other workflows' status files are inside the issuing top by Task 11. So no supported caller's status file is newly refused. Task 10's `engine-call` row still goes to `bound.statusPath` only after that path passes the check.
- **Task 27's `--invocation` on `steps stub` (no gap):** the flag is marked `unresolved`, so the dispatcher does not resolve it as an issued invocation. The call journals the same way the verb did before, and the generated `cli.md` lists the flag (`cli-doc` check exit 0).

## Previously Attempted

- `build-plan-verify-holistic-1.md` and `-2.md` (`CONCERNS`), fixed per `build-plan-gaps-remediate-holistic-1-log.md` and `-2-log.md`.
- `build-plan-verify-holistic-3.md` (`PASS`, groups 1-4).
- `build-plan-verify-holistic-4.md` (`CONCERNS`, mirror drift), fixed per `build-plan-gaps-remediate-holistic-4-log.md`.
- `build-plan-verify-holistic-5.md` (`PASS`, groups 1-7, Tasks 1-24).
- Groups 8 and 9 since then: `build-plan-verify-8-1.md` to `-8-3.md` (last `PASS`), `build-plan-verify-9-1.md` (`CONCERNS`), `build-plan-verify-9-2.md` (`PASS`).

## Notes

- **Inputs:** the plan (31 tasks, 9 groups, all ticked), tasks logs 1-9, every verify and gaps-remediate log, decision records `build-decision-1-1.md` to `1-5.md` (none accepts a group 8 or 9 gap, and none accepts the gap above), and the run diff. No test-first audit report was supplied for this round.
- **Changes since holistic attempt 5 (`a02bc6b25`):** engine changes are limited to group 8 and 9 code (`lib.ts`, `status.ts`, `issues.ts`, `steps.ts`, `ledgers.ts`, `counters.ts`, `runs.ts`, `ledgers/status.ts`) and their tests, plus Task 27/29 prompt and workflow wording, the five render snapshots, the regenerated mirrors and `dist/`. Tasks 1-24 judged in attempt 5 still hold: every test file they name passes in this round's run.
- **Task 30 left off `Tasks`:** see the gap above. Its planned test and the 9-1 re-render test pass, but those run only from the main checkout top.
- **Task 9 still holds:** `node dist/cli.js check` prints `[bkit-check] 0 write(s) would occur.` (0 blockers, 13 advisories; its only write is `.bkit/advisories.md`, and `git status` shows no other change). Check mode of `tsx .bkit/core/engine/tools/instructions.ts` and of `tsx .bkit/core/engine/tools/cli-doc.ts` both exit 0. A fresh `tsc --outDir` into scratch matches `dist/` exactly (`diff -rq` shows nothing).
- **Tests run, by path (all pass):** `commands/workflow/{steps,status,issues,ledgers,counters,runs,run-facts,challenge}.test.ts`, `commands/lib.test.ts`, `ledgers/{status,telemetry}.test.ts`, `ledgers/journal.integration.test.ts`, `render/trackers.test.ts`, `tools/instructions.test.ts`: 14 files, 1366 tests. `install/modules/core.integration.test.ts`: 147 tests.
- **Matrix:** all 52 `Derived Test Matrix` rows were checked by script. Each named test appears exactly once in its named file. The Task 2 and Task 12 rows name the same test on purpose.
- **Full suite:** not run, and `bkit tests changed` not run, per the caller's instruction (Process step 7). The last full run is group 8's gate `build-group-gate-8-3.md` (status row 872: `PASS`, `Tests 7418 passed | 2 skipped`). Group 9 has no group-gate report. Group 9 touched only files run above.
- **Observability:** Task 31's new refusals are `CommandError` usage exits. They follow the dispatcher's prefixed-stderr rule in `docs/observability.md`, and they need no new docs row.
- **Out of scope, carried and not gaps:** `test-run` rows still commit an absolute outbox `log` path. `docs/deferrals.jsonl:235` still describes the old committed operation store. Step 11 of `bkit-audit-generate.md` does not mention the `-N` key suffix.
- No source file was edited. Scratch fixtures: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/c8df0e69-6e8c-4878-95dc-cd64f434fb6b/scratchpad/h6wt.sh`, `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/c8df0e69-6e8c-4878-95dc-cd64f434fb6b/scratchpad/h6wt2.sh`.

## Identified Gaps Log

1 gap.

- INTEGRATION: Task 30 (group 9) `ledgerKeys` (`.bkit/core/engine/commands/workflow/steps.ts:1567`) reads `path.join(repoRoot(cwd), "docs", "failures.jsonl")`, the main checkout's ledger, while Task 3/4's `ledgers query` and `ledgers append` (group 1/3, `rootOf` at `.bkit/core/engine/commands/workflow/ledgers.ts:221`) read and write `<cwd>/docs/failures.jsonl` by default. From a linked worktree the renderer checks the wrong ledger: reproduced with `dist/cli.js` (render -> `ledgers append --operation` for `Token logged` at `src/old.ts:9`, then the same for `src/new.ts:42`, both run from `.worktrees/feat`): the second render derives `audit-security-token-logged` again, the append lands as a later row of the old key, and `ledgers query --ledger=failures` shows only the `src/new.ts:42` winner, so the old OPEN failure drops out. The same journey from the main checkout top derives `-2` and keeps both winners. Fix: resolve the held keys from the same ledger file `ledgers append` writes to (or move both to one shared root rule), and add a linked-worktree case to the Task 30 tests. — Fixable: true
