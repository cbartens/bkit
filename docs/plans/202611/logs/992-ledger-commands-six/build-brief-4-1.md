# Brief: group 4 — Challenge round 2 findings

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

- Group 1: Query and replay — done
  - TASK 1: Refuse a negative cursor offset — done
  - TASK 2: Check the ledger on replay and store the block once — done
- Group 2: Files and locks — done
  - TASK 3: Create the correction-events file as 0600 — done
  - TASK 4: Keep a stale lock file out of commits — done
- Group 3: Challenge round 1 findings — done
  - TASK 5: A replay after a rebase that put upstream ledger rows ahead of the operation's block is refused as "nothing recorded", so the caller's fresh-id retry appends the same row a second time — done
- Group 4: Challenge round 2 findings — this group
  - TASK 6: A retry after a lost response, run once a rebase has put upstream rows ahead of the landed block, takes the "prepare afresh" path and appends the same rows a second time — open

## The work

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** A retry after a lost response, run once a rebase has put upstream rows ahead of the landed block, takes the "prepare afresh" path and appends the same rows a second time
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1865` · **Round:** 2
  - **DONE WHEN:** in the intent path of `appendLedgerRows` (an intent with no receipt), when the bytes at `intent.offset` differ from `intent.block` but the whole block is somewhere else in the ledger file (`have.indexOf(want) !== -1`), the engine records the receipt from the intent and returns `replayed: true` with `appended: 0`, and writes nothing to the ledger; the uncertain check and the "prepare afresh" path are reached only when the whole block is nowhere in the file; the existing tests "prepares afresh when nothing landed and a foreign row followed" and "refuses to re-append a partly landed block after a foreign writer appended" still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again` fails on the retry returning `appended` 1 and the ledger holding the row twice. The test appends under `operation: "op-moved"` with `checkpoint: failAt("written")`, so the bytes land and no receipt is written. It then rewrites the file as one foreign complete row line followed by the original bytes, the order a `merge=union` rebase leaves, and retries the same operation. It expects `appended` 0, `receipt.replayed` true and the file unchanged.
<!-- bkit:task 6 end -->
