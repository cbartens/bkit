Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5, 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: `CONCERNS`, 5 fixable gaps on Tasks 4 and 5. Fixed by `build-plan-gaps-remediate-3-1-log.md` and the tests step attempt 2.
- `build-plan-verify-3-2.md`: `CONCERNS`, 1 fixable gap on Task 5 (error-obscuring catch in `steps.test.ts`). Fixed by `build-plan-gaps-remediate-3-2-log.md`.
- `build-plan-verify-3-3.md`: `PASS`, Tasks 4, 5, 6. The group gate (`build-group-gate-3-3.md`) then failed on 8 tests: 6 in `journal.test.ts`, 1 in `locks.test.ts`, 1 in `gateguard-opencode.test.ts`. Round 3 (`build-plan-gaps-remediate-3-3-log.md`, commit 6918412cb) updated the six `journal.test.ts` tests and judged the other two load flakes.

## Notes

- **Mode:** `Group`, judged against `build-diff-3-4.md` and `git diff ff1e136cf..HEAD`. The only engine change since attempt 3 is `.bkit/core/engine/ledgers/journal.test.ts` (+17/-15). No source or `dist/` change. The briefs `build-brief-3-1.md` and `build-brief-3-2.md` carry no `Deviations` section.
- **(a) `keeps a row another writer appends while a recurrence is recorded` (now `..., and reports the refusal`): legitimate, not a regression.**
  - The test's foreign writer appends inside the window between `appendHeld`'s read and `writePrepared`, while `appendFrictionRow` holds `<friction.jsonl>.bkit-lock`. So the foreign writer bypasses the lock. No engine writer can do that after Task 4, because every engine friction write goes through `appendLocked` (`.bkit/core/engine/ledgers/status.ts:706`).
  - Task 4's DONE WHEN reads: "all engine target writers including direct journal recurrence serialize or visibly refuse ownership", and "each interrupted checkpoint reconciles or blocks uncertainty without truncation". `writePrepared` (`status.ts:665`) checks the size before it writes. A changed ledger therefore produces a guaranteed no-write refusal (`ok: false`, "changed since the append was prepared"), which is the "visibly refuse" branch. Writing a recurrence computed from stale text would break the "receipt offsets" and "folded recurrence" guarantees that DONE WHEN names.
  - The old test's guarantee is still asserted: the foreign row is kept and no line is rewritten (`raw` contains `foreign`, 2 lines, no truncation). Task 4's UPDATE line on `journal.ts` keeps the "optional telemetry failure policy", and a refused friction row is handled by that existing failure path in every caller.
  - Rows from lock-holding writers are not dropped. `journal.integration.test.ts` "serializes concurrent append operations and blocks partial uncertain ledger writes" runs two real dispatcher processes and asserts that both writers' rows land with the correct recurrence. It passes.
  - This is an existing test, not a planned `TEST FIRST` test, so the code step may update it when Task 4 breaks it. The old `toHaveLength(3)` / `recurrenceCount: 2` expectations encoded the pre-lock merge behaviour that Task 4 replaces.
- **(b) `appendFrictionRow` callers: none broken.** The engine has four callers: `.bkit/core/engine/commands/lib.ts:735` (throws on `!ok`, as before), `.bkit/core/engine/commands/workflow/tracker.ts:1640` `commentDiagnostic` (logs and continues on `!ok`), `.bkit/core/engine/commands/workflow/status.ts:981` (owner-pause, `EXIT_PAUSE_FRICTION` on `!ok`, as before) and `.bkit/core/engine/commands/workflow/steps.ts:124` (ignores the result). All of them read only `.ok` / `.error`. `JournalResult` only adds an optional `receipt` to the `ok: true` branch (`journal.ts:31`). Both `tsc --noEmit` configs exit 0. The other `friction.jsonl` mentions (`checks/tips/detect.ts`, `commands/stats.ts`, `cli.ts`) only read the file or show help text.
- **(c) Tasks 4, 5, 6 still hold.** The ten named tests pass. Source and `dist/` are unchanged since attempt 3, and the plan already shows `[x]` for all three.
- **Checks run:**
  - Tests: `journal.test.ts`, `journal.integration.test.ts`, `ledgers/status.test.ts`, `migrate.test.ts`, `steps.test.ts`, `workflow/ledgers.test.ts`, `challenge.test.ts`, `issues.test.ts`, `locks.test.ts`, `workflow/status.test.ts` and `tracker.test.ts` gave 616 passed and 1 failed out of 617. The six updated `journal.test.ts` tests pass.
  - The one failure, `locks.test.ts` "reclaims only a proven dead matching process identity", is a load flake. The child process's `acquirePublicationLock` returned `null`: it has a 30 ms `timeoutMs` and the machine's load average was 38. The test passes 3/3 when run alone. Task 4's `tryCreate` change in `locks.ts` only delegates to `createExclusive`, with the same `wx` open, `EEXIST` handling and `line\n` write, so the change cannot cause this.
  - `pnpm bkit:lint:file` on `journal.test.ts`: exit 0. `prettier --check` on `journal.test.ts` and the plan: clean. `tsc --noEmit` and `tsc -p tsconfig.test.json --noEmit`: exit 0. `bkit ci slop --base=e0403df0f7960b6613bb73e5519aea990fb9d0fa`: `passed: true`, added 0, net 0.
- **Test-first audit:** `build-tests-green-3-4.md` is `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests` or `delete-still-referenced` entries. Under `Already landed` it lists Task 5 `steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS". The tests step's reason: the test was red before the code step and passes now that the code has landed, after two `Fixable` expectations were corrected to follow `bkit-build-plan-verify.md`.
- **Decision records:** `build-decision-1-1.md`, `1-2` and `1-3` cover groups 1 and 2 only.
- **Documentation rows:** `.bkit/core/.bkit/cli.md` and `.bkit/core/.bkit/jsonl.md` were updated in this group. `docs/architecture.md`, `docs/testing.md` and the workflow and prompt docs belong to Task 9 (group 4).
- **Out of scope (proposal, not a gap):** `.bkit/core/.bkit/jsonl.md` § Write Idiom documents the lock, the replay receipt and the uncertain-partial-write exit. It does not say that an append refuses with no write when the ledger changed under the lock, for example after a hand edit or an older bkit writing without the lock. A one-line addition could go with Task 9's doc pass.

## Identified Gaps Log

None
