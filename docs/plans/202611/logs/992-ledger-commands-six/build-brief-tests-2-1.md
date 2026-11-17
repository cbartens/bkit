# Brief: group 2 — Files and locks (tests)

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
- Group 2: Files and locks — this group
  - TASK 3: Create the correction-events file as 0600 — open
  - TASK 4: Keep a stale lock file out of commits — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Create the correction-events file as 0600
  - **UPDATE:** `correctionBook` in `.bkit/core/engine/commands/workflow/ledgers.ts`: create the file with `fs.appendFileSync(file, "", { mode: 0o600 })`
  - **UPDATE:** `append` in `.bkit/core/engine/commands/workflow/ledgers.ts`: the later `fs.appendFileSync(book.file, ...)` calls (the `correction-rejected` and `correction-succeeded` rows) pass no mode; they append to a file that already exists with `0600`, so keep them unchanged unless the file can be created there
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the standalone-invocation correction tests ("gives a runless invocation a correction scope", "lands a standalone corrected candidate") are the model for the new test
  - **DEPENDS ON:** 2
  - **DONE WHEN:** after a standalone append's corrected retry, `<id>.corrections.jsonl` has `mode & 0o777 === 0o600`; the test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `the correction-events file has mode 0600` fails on the file mode being the default "expected 384" (0o600) not matching 420 (0o644)

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Keep a stale lock file out of commits
  - **READ:** `bookPathspecs` in `.bkit/core/engine/commands/workflow/ledgers.ts`: left unchanged, because `ci.ts` and `branches.ts` reuse it and a test freezes it
  - **UPDATE:** `commitBookkeeping` in `.bkit/core/engine/commands/workflow/ledgers.ts`: add `:(exclude,glob)**/*.bkit-lock` to the `ls-files` pathspecs after `...specs`
  - **UPDATE:** `.bkit/shared/gitignore`: add `*.bkit-lock` with a comment beside the `.lock` entries
  - **UPDATE:** `.gitignore`: the same entry in the bkit-managed block, matching `.bkit/shared/gitignore`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the `commitBookkeeping` tests near "staging failure" hold the new test
  - **DEPENDS ON:** 3
  - **DONE WHEN:** a leftover `<ledger>.bkit-lock` in `docs/plans/{month}/logs/{fid}/` is not in the staged paths of a bookkeeping commit that also stages a real log row; both ignore files name `*.bkit-lock`; the test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit` fails on "status.jsonl.bkit-lock" being among the staged files

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Check the ledger on replay and store the block once — `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/status.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `docs/architecture.md`, `.bkit/core/.bkit/jsonl.md`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a negative `--cursor` offset is refused | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| a replayed operation whose rows are gone is not reported as recorded | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 2 |
| the correction-events file has mode 0600 | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| a leftover `*.bkit-lock` in a run's log folder is not staged by the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 4 |
