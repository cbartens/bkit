# Brief: group 3 — Challenge round 1 findings

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
- Group 3: Challenge round 1 findings — this group
  - TASK 5: A replay after a rebase that put upstream ledger rows ahead of the operation's block is refused as "nothing recorded", so the caller's fresh-id retry appends the same row a second time — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** A replay after a rebase that put upstream ledger rows ahead of the operation's block is refused as "nothing recorded", so the caller's fresh-id retry appends the same row a second time
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1841` · **Round:** 1
  - **DONE WHEN:** the replay branch of `appendLedgerRows` returns the stored receipt with `replayed: true` when the operation's exact block is anywhere in the ledger file (for example `held.indexOf(wanted) !== -1`), not only at `d.offset`; when the block is nowhere in the file (a compaction or harvest rewrote or removed the rows) it still refuses with EXIT_STAGE and writes nothing, and its message no longer claims "nothing recorded": it says the operation was recorded earlier, that the ledger no longer holds its rows, and that the caller must not retry it under a new operation id; `bkit ledgers compact`, harvest and the receipt lookup are unchanged, with no matching by row key; the existing `a replayed operation whose rows are gone is not reported as recorded` test still passes; `docs/architecture.md:220` and `.bkit/core/.bkit/jsonl.md:62` match the new wording wherever they describe the refusal
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a replayed operation whose rows a rebase moved is still reported as recorded` fails on the replay of `op-1` exiting 4 with "no longer holds its rows; nothing recorded" after a foreign row is written ahead of the block (the order a `merge=union` rebase leaves: upstream lines first, then ours), "expected 0" being 4
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a replayed operation whose rows are gone says it was recorded and must not be retried under a new id` fails on the refusal's message reading "no longer holds its rows; nothing recorded" with no mention of a new operation id, after the ledger file is emptied and the same operation is replayed

<!-- bkit:task 5 end -->
