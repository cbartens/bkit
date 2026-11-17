# Brief: group 1 — Query and replay

Plan: Ledger Commands: Six Parked Findings Implementation Plan

## Why and what

### Context & Goals

The build of #860 parked six low-severity findings in the ledger code. The owner's decision on 2026-11-17 (v6.3 run) fixes items 1 to 5 in code and records item 6 (the worktree fingerprint stays a plain hash) as a decision row, with no code change.

- A negative `--cursor` offset is refused.
- The operation record stores a row block once, and a replay checks the ledger still holds the rows before it answers "already recorded".
- The correction-events file is created with mode `0600`.
- A leftover `*.bkit-lock` file is never staged by a bookkeeping commit.
- The existing decision row `992-worktree-fingerprint-stays-plain-hash` in `docs/decisions.jsonl` records why the fingerprint stays a plain hash.

**Related Issues:**

- #992 — Ledger commands: six parked review findings (this plan)
- #860 — Move deterministic bookkeeping and safe recovery into the engine (the build that parked them)
- #344 — Deferrals triage (parent)
- #968 — Sweep the deferrals and failures parked since v6.1.1 before v6.2 (raised this issue)

---

### Narrative

An agent or owner runs `bkit ledgers query`, `append --operation` and the bookkeeping commit, and gets the right rows, an honest "already recorded" answer, private files and no stray lock file in a commit.

### Success Criteria

- `--cursor` with a negative offset is refused with a usage error, never rows from the end.
- The operation record holds a row block once, and a replay compares the ledger bytes before it answers "already recorded".
- The correction-events file is created with mode `0600`.
- A leftover `*.bkit-lock` file in a run's log folder is not staged by the bookkeeping commit, and both gitignore files name it.
- The fingerprint decision is the existing row `992-worktree-fingerprint-stays-plain-hash` in `docs/decisions.jsonl`; no per-clone key is added.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Trimming or compacting the operations store | Item 2 stops the duplication only | A future issue |
| Reclaiming a stale lock automatically | Item 5 keeps the file out of commits only | A future issue |
| A per-clone key for the worktree fingerprint | Owner decision 2026-11-17 | Existing decision row `992-worktree-fingerprint-stays-plain-hash` |

## Where it fits

- Group 1: Query and replay — this group
  - TASK 1: Refuse a negative cursor offset — open
  - TASK 2: Check the ledger on replay and store the block once — open
- Group 2: Files and locks — next
  - TASK 3: Create the correction-events file as 0600 — open
  - TASK 4: Keep a stale lock file out of commits — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Refuse a negative cursor offset
  - **READ:** `query` in `.bkit/core/engine/commands/workflow/ledgers.ts`: the `slice(offset, offset + limit)` that a negative offset reaches
  - **UPDATE:** `decodeCursor` in `.bkit/core/engine/commands/workflow/ledgers.ts`: require `o >= 0` so a negative offset gives the "not a cursor from this command" usage error
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the "bkit ledgers query" describe block holds the new test
  - **DONE WHEN:** a `--cursor` with a negative offset exits 2 with a usage error and no rows; an offset beyond the end still gives an empty page; the test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a negative --cursor offset is refused` fails on rows from the end of the ledger coming back with exit code 0, "expected 2" being 0

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Check the ledger on replay and store the block once
  - **READ:** `ledgerIntent` in `.bkit/core/engine/ledgers/status.ts`: the intent row that holds `block`
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: add and export `ledgerEffect(file, operation)`, returning `{ offset, bytes, block }` from the receipt's `detail.offset` and `detail.bytes` and the block from the operation's intent, or from `detail.block` when an old receipt holds it; adjust the `recordLedgerOperation` comment on `detail`
  - **UPDATE:** `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts`: in the `known.state === "replay"` branch read the effect with `ledgerEffect`, read the target at the stored offset, compare the bytes as the intent path does, and throw `EXIT_STAGE` naming the operation and the reason when they differ; the `receipt` helper writes `detail: { offset, bytes }` only
  - **UPDATE:** `.bkit/core/engine/ledgers/status.test.ts`: the ledger-contract test near `recordLedgerOperation` stays valid; the new test sits beside it
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the "bkit ledgers append --operation" describe block holds the new test
  - **UPDATE:** `docs/architecture.md`: line 220, say a replay returns the receipt only after the ledger still holds the rows
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: line 62, the same id with the same rows returns the original `receipt` when the ledger still holds them, and is refused with the reason when they are gone
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a replay after the rows were removed exits non-zero, names the operation and reports nothing as recorded; a new operation's record holds its block once; a receipt that holds the block (old shape) still replays; both tests pass and the existing "returns durable append receipt" test still passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a replayed operation whose rows are gone is not reported as recorded` fails on the stored receipt coming back with "replayed" true and exit code 0 after the ledger was emptied
    - `.bkit/core/engine/ledgers/status.test.ts` `the row block is stored once per operation` fails on "ledgerEffect" being missing, and on two copies of the block in the operations file

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Refuse a negative cursor offset | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n "decodeCursor"` in `ledgers.ts`; read `decodeCursor` and `query` | `decodeCursor` — checks `Number.isInteger`, misses `>= 0` | EXTEND | Add the `>= 0` check where the offset is parsed. |
| Replay checks the ledger bytes | `.bkit/core/engine/commands/workflow/ledgers.ts` | read the `known.state === "replay"` branch and the intent path below it in `appendLedgerRows` | The intent path compares `have.subarray(offset, offset + want.length)` to the block | EXTEND | Run the same segment comparison in the replay branch. |
| Read an operation's effect with the block stored once | `.bkit/core/engine/ledgers/status.ts` | `grep -n "ledgerIntent\|recordLedgerOperation\|engineActions"` in `status.ts`; `grep -rn "detail"` across `.bkit/core/engine` | `ledgerIntent` returns the intent with its `block`; `recordLedgerOperation` stores a free-form `detail` | EXTEND | Add `ledgerEffect` beside them: receipt `offset` and `bytes`, block from the intent (or from an old receipt's `detail.block`). |
| Correction-events file mode | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n "appendFileSync"` in `ledgers.ts`; `grep -n "0o600"` in `commands/lib.ts` | `writeInvocation` in `lib.ts` writes the receipt with `mode: 0o600`; `recordLedgerOperation` appends with `{ mode: 0o600 }` | EXTEND | Pass `{ mode: 0o600 }` in `correctionBook`. |
| Keep a lock file out of the bookkeeping commit | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n "exclude"` in `ledgers.ts`; `grep -rn "bookPathspecs"` across `.bkit/core/engine` | `UNION_PATHSPECS` already uses `:(exclude)` magic; `bookPathspecs` is reused by `ci.ts` and `branches.ts` and frozen by a test | EXTEND | Add one exclude entry to the `ls-files` call in `commitBookkeeping`; leave `bookPathspecs` as it is. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** the file exists; `decodeCursor`, `correctionBook`, `commitBookkeeping` and the replay branch in `appendLedgerRows` are in it.
- `decodeCursor` requires `o >= 0`.
- The replay branch reads the stored effect, compares the ledger bytes at the offset and refuses when they differ.
- The receipt call writes `detail: { offset, bytes }`.
- `correctionBook` creates the file with `mode: 0o600`.
- `commitBookkeeping` excludes `*.bkit-lock` in its `ls-files` listing.

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`

- **Existence Check:** the file exists.
- New `ledgerEffect`; `recordLedgerOperation` no longer expects a block in `detail`.
