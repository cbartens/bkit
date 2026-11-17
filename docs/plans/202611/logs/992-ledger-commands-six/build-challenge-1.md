Verdict: CONCERNS
Failures: 2
Fingerprint: 54e337d3fa380b7a60506b8f9a21de1f4bba5c4f9d7039375d5b8f3e053593e5
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-992-ledger-commands-six.md`, read in full (650 lines; full coverage, not partial).
- Plan: `docs/plans/202611/992-ledger-commands-six-plan.md`, tasks 1 to 5.
- Code read beyond the diff: `appendLedgerRows` (`.bkit/core/engine/commands/workflow/ledgers.ts:1681-1935`: the replay branch, the intent recovery path and the prepare-afresh fall-through); `commitBookkeeping` staging (`ledgers.ts:1178-1345`); `bookPathspecs` and its other users (`.bkit/core/engine/commands/ci/ci.ts:613` `minPushPathspecs`, `.bkit/core/engine/commands/workflow/branches.ts:2425`, `ledgers.ts:2351` `checkOnlyBookkeeping`); `query` and `decodeCursor` (`ledgers.ts:2093-2165`); `correctionBook` and the `append` correction flow (`ledgers.ts:1600-2080`); the operation store in `.bkit/core/engine/ledgers/status.ts:640-1007` (`engineActions`, `ledgerOperation`, `recordLedgerOperation`, `ledgerIntent`, `pendingLedgerIntents`, `withTargetLock`, `appendHeld`); `structuredError`, `invocationDir` and `writeInvocation` in `.bkit/core/engine/commands/lib.ts`; the friction writer in `.bkit/core/engine/ledgers/journal.ts:224-246`; and the lost-response tests in `.bkit/core/engine/ledgers/journal.integration.test.ts:557-1045`.
- Docs: `.agents/docs.md`; `docs/architecture.md:220`; `docs/security.md:66`; `docs/observability.md` § Bookkeeping effects and receipts; `.bkit/core/.bkit/jsonl.md` § Write Idiom, § Friction Is a Drained Queue, § Compaction and § `engine-action` rows; `.bkit/core/.bkit/cli.md:51`; `.gitattributes` (union ledgers, no `eol` setting); `docs/knowledge.jsonl` (no entry on ledger locks or operation replay). `docs/data-schema.md` is still the 10-line starter; it does not apply here (no database).
- Method: code reading only. No test or probe was run, because the mandate forbids writing code. Each finding's test was checked by tracing it through the code the diff leaves: it fails there and does not already pass.

## Notes

- Task 1 is the sibling of plan task 5. Task 5 made the replay branch (a receipt exists) accept the block anywhere in the file, because a `merge=union` rebase puts upstream rows ahead of ours. The intent path (an intent with no receipt, the state a lost response at the `written` checkpoint leaves; `.bkit/core/.bkit/jsonl.md` § Write Idiom: "A lost response is retried with the same id") still compares only at `intent.offset`. After the same rebase, the line at that offset is a complete foreign row, so `foreignWholeLine` is true, the uncertain check is skipped, `have.length !== intent.offset`, and control falls to `appendHeld(abs, build, ...)`, which mints fresh `ts` values and appends the rows again. When a later same-key row landed upstream (for example a RESOLVED update of the failure), the re-appended OPEN copy carries the newest `ts` and wins the fold. `bkit ledgers compact` refuses while an intent has no receipt (the "Compact refuses to rewrite a ledger while an operation on it has bytes without a receipt" block in `journal.integration.test.ts`), but git's union merge does not ask. The two existing intent-path tests (`journal.integration.test.ts:985` and `:1016`) stay green under the fix, because in both our whole block is nowhere in the file.
- Task 2: no `*.bkit-lock` has ever been committed in this repo (`git log --all --diff-filter=A -- '*.bkit-lock'` is empty), so the case needs a consumer whose earlier bookkeeping commit caught a leftover lock, which is the defect plan task 4 fixes. `withTargetLock` never reclaims a lock (`status.ts:917-943`), so a tracked lock that each checkout restores makes every append to that target wait 10 s and then fail.
- Checked and clean:
  - `decodeCursor`: `-0` passes `>= 0` and slices from 0; a fractional or non-number `o` is still refused by `Number.isInteger`; an offset beyond the end gives an empty page and no `nextCursor`.
  - `ledgerEffect`: the receipt is the earliest `ledger-op/<id>` row (`.at(0)`, the same row `ledgerOperation` returns), and the block is the latest intent (`.at(-1)`). These always describe the same landed bytes. A new intent is written only while no receipt exists, and each receipt follows its own intent: the `prepared` hook records the intent before `writePrepared`, and `receipt(intent)` passes the intent itself. A `--rows` array with zero rows is refused (`ledgers.ts:1697`), so `wanted` is never empty and `indexOf` cannot match an empty buffer.
  - The replay check runs under the target lock and the operation-store lock, so a concurrent `compact`, which takes the target lock, cannot rewrite the file mid-read.
  - The new refusal is a plain `CommandError`, not a `NoWriteRejection`, so `append` writes no `correction-rejected` row for it, and a replayed corrected candidate spends no budget, because `spendCorrection` counts a replay of a counted operation as free.
  - `bookPathspecs` never returns an empty list, so the exclude-only pathspec case (in which git lists the whole tree) cannot arise. `ci.ts`, `branches.ts` and `checkOnlyBookkeeping` use the list for diffs, status checks and allow-lists only; none of them stages files.
  - The friction writer appends recurrence rows and never rewrites a line in place (`journal.ts:224-246`), so the byte-exact replay check sees changed bytes only through compaction stamps, harvest or a revert, which plan task 5 covers.
  - In `append`, `correctionBook` is the first writer of `<id>.corrections.jsonl`, so `mode: 0o600` applies when the file is created.
- Not logged as tasks:
  - Forward compatibility on a downgrade or a revert. A receipt this change writes has no `detail.block`. The pre-change replay branch calls `receiptRows(d.block)` on it, which throws a `TypeError` (`block.split`). `stage()` wraps that as exit 4 "append failed", with nothing written. The plan's Rollback Strategy ("Old operation records stay readable either way") covers old records only. Fixing this in code would undo plan item 2, so the owner decides whether the Rollback Strategy should say that a revert must keep `ledgerEffect`'s intent fallback.
  - A correction-events file created by an earlier bkit keeps mode 0644, because the `mode` option of `fs.appendFileSync` applies only on creation. These files are per invocation and hold no secret or row body (`docs/observability.md` § Bookkeeping effects and receipts).
  - A rebased replay returns the receipt's original `offset`, which may no longer point at the rows. Plan task 5 accepts that, and no engine code reads `receipt.offset`.
  - Outside this lens, and not assessed: the diff also carries a `.bkit/instructions.md` change (`plan-task-ticking-owned-by-verify`) that no plan task names, and a `.bkit/friction.jsonl` row stamped `bkit.version` `6.0.0` in a 6.2.0 repo, whose cause was not traced.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A retry after a lost response, run once a rebase has put upstream rows ahead of the landed block, takes the "prepare afresh" path and appends the same rows a second time
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1865` · **Round:** 1
  - **DONE WHEN:** in the intent path of `appendLedgerRows` (an intent with no receipt), when the bytes at `intent.offset` differ from `intent.block` but the whole block is somewhere else in the ledger file (`have.indexOf(want) !== -1`), the engine records the receipt from the intent and returns `replayed: true` with `appended: 0`, and writes nothing to the ledger; the uncertain check and the "prepare afresh" path are reached only when the whole block is nowhere in the file; the existing tests "prepares afresh when nothing landed and a foreign row followed" and "refuses to re-append a partly landed block after a foreign writer appended" still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again` fails on the retry returning `appended` 1 and the ledger holding the row twice. The test appends under `operation: "op-moved"` with `checkpoint: failAt("written")`, so the bytes land and no receipt is written. It then rewrites the file as one foreign complete row line followed by the original bytes, the order a `merge=union` rebase leaves, and retries the same operation. It expects `appended` 0, `receipt.replayed` true and the file unchanged.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A lock file that an older bkit already committed, and that the owner then deletes, never has its deletion committed: the new exclude also drops the `--cached` entry, so every fresh checkout brings the stale lock back and blocks appends to that target
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1273` · **Round:** 1
  - **DONE WHEN:** `commitBookkeeping` still never stages an untracked `*.bkit-lock` file or a change to a tracked one, but it does stage and commit the deletion of a tracked `*.bkit-lock` under the book pathspecs that is gone from the worktree (for example, a separate `git ls-files --deleted` listing of lock paths, joined to `paths`); the existing test "a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit" still passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit` fails on `git ls-files -- '*.bkit-lock'` still listing `docs/plans/202608/logs/446l/status.jsonl.bkit-lock` after the commit. The test commits `status.jsonl` and `status.jsonl.bkit-lock` with `commitAll`, deletes the lock file, appends a row to `status.jsonl`, and runs the `--scope=core --mode=commit` bookkeeping commit. It expects exit 0, the lock path listed with status `D` in `git show --name-status --format= HEAD`, and `git ls-files -- '*.bkit-lock'` empty.
<!-- bkit:task 2 end -->
