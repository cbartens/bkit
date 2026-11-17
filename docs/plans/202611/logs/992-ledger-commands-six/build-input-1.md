## Session Prompt — this run's, newer than everything below

#992 publish=false

## Issue description — oldest

### Narrative

The build of [#860 — Move deterministic bookkeeping and safe recovery into the engine](https://github.com/cbartens/bkit/issues/860) parked six review findings in the ledger code as low-severity. All six are still in the code on `dev` (read 2026-11-16; none was run). None has been seen to fail in a real run. They sit in one package, so one build takes them when those files are next changed.

**1. A hand-edited page marker returns rows from the wrong end.** `decodeCursor` (`.bkit/core/engine/commands/workflow/ledgers.ts:2088-2095`) accepts any whole number as the offset (`Number.isInteger(v["o"])`), and `query` then runs `result.rows.slice(offset, offset + limit)` (`:2126-2127`). A negative offset in `--cursor` returns rows from the end of the ledger as if they were the next page. The only other checks are that the snapshot and filter match.

**2. Every append with an operation id stores its rows twice, and the record is never trimmed.** The intent row holds `block` (`.bkit/core/engine/ledgers/status.ts:806`) and the receipt holds it again (`ledgers.ts:1851`, `detail: { offset, bytes, block }`). Each later append re-reads the whole file (`engineActions`, `intentRows`, `status.ts:756`, `:810-821`). The record lives in `<git common dir>/bkit-outbox/ledger-operations/<root hash>.jsonl` (`status.ts:683-686`), private and outside every committed path, so only disk and read time grow.

**3. A retried append answers "already recorded" without looking at the ledger.** When an append is retried with the same operation id, `known.state === "replay"` (`ledgers.ts:1830-1838`) returns the stored receipt and never reads the target file. After a branch switch, rebase or revert, a finding can be reported as recorded when it is gone. The intent path just below does compare the file bytes; the receipt path does not.

**4. The correction-events file is created with ordinary permissions.** `correctionBook` (`ledgers.ts:1640-1653`) creates `<id>.corrections.jsonl` with `fs.appendFileSync(file, "")` and no `mode`; the later appends (`:2022`, `:2055`) pass none either. The receipt file next to it is written with `mode: 0o600` (`.bkit/core/engine/commands/lib.ts:637`), and `docs/security.md:66` says these files keep "private file permissions".

**5. A killed process leaves a lock file that git does not ignore.** `withTargetLock` (`.bkit/core/engine/ledgers/status.ts:874`) places `<target>.bkit-lock` next to the ledger (`:875`) and says a holder that does not release in time is never reclaimed (`:871-872`). The bookkeeping allow-list takes everything in the run's log folder (`bookPathspecs`, `ledgers.ts:111-125`, ``docs/plans/${month}/logs/${fid}/*``), including untracked files, and neither `.gitignore` (`:54` covers only `docs/plans/*/logs/**/.lock`) nor the shipped `.bkit/shared/gitignore` (`:44`) names `bkit-lock`. After a kill, the next bookkeeping commit can commit the lock file, and it then blocks the same writes in every clone. Files in that folder are locked at `branches.ts:2826`, `workflows.ts:673` and `worktrees.ts:563`.

**6. The worktree fingerprint in a committed log can be confirmed by guessing.** `worktreeFingerprint` (`.bkit/core/engine/commands/lib.ts:642-644`) is `sha256(top)` cut to 16 characters, with no salt. It is written into the committed event at `.bkit/core/engine/commands/workflow/status.ts:784` and checked at `lib.ts:689`. Anyone who guesses the path (and so the computer user name) can confirm the guess.

### Success Criteria

- `--cursor` with a negative or out-of-range offset is refused (or returns an empty page), never rows from the end.
- The operation record stores a row block once, and the replay path checks that the rows are still in the target file before answering "already recorded".
- The correction-events file is created with mode `0o600`.
- A stale `*.bkit-lock` file is never committed by a bookkeeping commit (ignored in both gitignore files, or excluded from `bookPathspecs`).
- The worktree fingerprint cannot be confirmed from a guessed path (a per-clone key), or the decision to keep it is recorded in `docs/decisions.jsonl`.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Cursor offset beyond the end | An empty page, as today |
| Replay of an operation after a revert removed its rows | Not reported as recorded; the append is redone or refused with the reason |
| Existing operation records that hold the block twice | Still read; no migration needed |
| Existing fingerprints in committed logs | Old events keep their value; the check at `lib.ts:689` accepts both until old runs end |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| a negative `--cursor` offset is refused | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| a replayed operation whose rows are gone is not reported as recorded | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| the correction-events file has mode 0600 | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| the row block is stored once per operation | unit | `.bkit/core/engine/ledgers/status.test.ts` |
| a leftover `*.bkit-lock` in a run's log folder is not staged by the bookkeeping commit | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| two checkouts with the same path layout get different fingerprints, and an old fingerprint still matches | unit | `.bkit/core/engine/commands/lib.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Query and replay
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Refuse a negative cursor offset
  - **UPDATE:** `decodeCursor` in `.bkit/core/engine/commands/workflow/ledgers.ts`: require `o >= 0`
  - **DONE WHEN:** a `--cursor` with a negative offset exits with a usage error
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a negative --cursor offset is refused` fails because rows from the end come back today
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Check the ledger on replay and store the block once
  - **UPDATE:** the `known.state === "replay"` branch in `.bkit/core/engine/commands/workflow/ledgers.ts` (`:1830-1838`): read the target at the stored offset and compare the bytes, as the intent path does
  - **UPDATE:** `LedgerIntent` and the receipt `detail` (`.bkit/core/engine/ledgers/status.ts:806`, `ledgers.ts:1851`): keep the block in one of the two rows
  - **DONE WHEN:** a replay after the rows were removed is not reported as recorded
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a replayed operation whose rows are gone is not reported as recorded` fails on the stored receipt
    - `.bkit/core/engine/ledgers/status.test.ts` `the row block is stored once per operation` fails on two copies
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->
### TASK GROUP 2: Files and locks
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Create the correction-events file as 0600
  - **UPDATE:** `correctionBook` in `.bkit/core/engine/commands/workflow/ledgers.ts` (`:1640-1653`): create with `{ mode: 0o600 }`; check the appends at `:2022` and `:2055`
  - **DONE WHEN:** the file's mode is `0600`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `the correction-events file has mode 0600` fails on the default mode
<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Keep a stale lock file out of commits
  - **UPDATE:** `.gitignore` and `.bkit/shared/gitignore`: add `*.bkit-lock`
  - **UPDATE:** `bookPathspecs` in `.bkit/core/engine/commands/workflow/ledgers.ts` (`:111-125`): exclude `*.bkit-lock` if the ignore entry alone does not keep it out of the `--others` listing
  - **DONE WHEN:** a leftover lock file in a run's log folder is not staged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit` fails today
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Make the fingerprint unguessable, or record the decision
  - **UPDATE:** `worktreeFingerprint` in `.bkit/core/engine/commands/lib.ts` (`:642-644`) and its check at `:689`: add a per-clone key kept in the git common directory, accept old values
  - **DONE WHEN:** a guessed path no longer reproduces a committed fingerprint; or a decision row records why the plain hash stays
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/lib.test.ts` `two checkouts with the same path layout get different fingerprints, and an old fingerprint still matches` fails on the unsalted hash
<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: item 6 may close with a decision row instead of code; a path guess only confirms a user name the owner's own machine already reveals. The owner decides at build.
- Assumed: line numbers above are `dev` today; locate each by symbol if they moved.

### Breaking Changes & Naming

None.

### Out of Scope

- Trimming or compacting the operations store (item 2 stops the duplication only).
- Reclaiming a stale lock automatically.

### References

**Audit reports:** docs/audits/202611/deferrals-20261116T065554Z.md (findings deferrals-40, deferrals-41, deferrals-42, deferrals-43, deferrals-51, deferrals-52)

Ledger keys covered (`docs/deferrals.jsonl`):

- `860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1920`
- `860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1709`
- `860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1688`
- `860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1521`
- `860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-ledgers-status-ts-868`
- `860-move-deterministic-bookkeeping-challenge-low-bkit-core-engine-commands-lib-ts-635`

Sub-issue of [#344 — Deferrals triage](https://github.com/cbartens/bkit/issues/344). Raised by [#968 — Sweep the deferrals and failures parked since v6.1.1 before v6.2](https://github.com/cbartens/bkit/issues/968).

## Issue comment — posted 2026-11-17T11:36:58.000Z

Owner decision for item 6, 2026-11-17 (v6.3 run): the fingerprint of the worktree's folder path stays a plain hash.

- No per-clone secret key is added and no code changes for item 6.
- Reason: a correct guess of the path only confirms a user name the machine already shows, and the issue itself calls that acceptable.
- A decision row in `docs/decisions.jsonl` records the reason.

Items 1 to 5 are built as the issue describes.
