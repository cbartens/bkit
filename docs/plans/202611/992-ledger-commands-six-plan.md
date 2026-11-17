# Ledger Commands: Six Parked Findings Implementation Plan

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

### Narrative

An agent or owner runs `bkit ledgers query`, `append --operation` and the bookkeeping commit, and gets the right rows, an honest "already recorded" answer, private files and no stray lock file in a commit.

### Success Criteria

- `--cursor` with a negative offset is refused with a usage error, never rows from the end.
- The operation record holds a row block once, and a replay compares the ledger bytes before it answers "already recorded".
- The correction-events file is created with mode `0600`.
- A leftover `*.bkit-lock` file in a run's log folder is not staged by the bookkeeping commit, and both gitignore files name it.
- The fingerprint decision is the existing row `992-worktree-fingerprint-stays-plain-hash` in `docs/decisions.jsonl`; no per-clone key is added.

### Process Sketch

- **WHEN** `bkit ledgers query --cursor=<marker>` carries a negative offset **→ THEN** it exits with a usage error and prints no rows.
- **WHEN** `bkit ledgers append --operation=X` is retried and the ledger still holds the rows at the stored offset **→ THEN** the stored receipt comes back with `replayed: true`.
- **IF** the retry finds the rows gone (branch switch, rebase, revert) **→ THEN** it refuses with the reason and reports nothing as recorded.
- **WHEN** a standalone invocation records a correction event **→ THEN** `<id>.corrections.jsonl` is created with mode `0600`.
- **IF** a killed process left `<ledger>.bkit-lock` in the run's log folder **→ THEN** the bookkeeping commit does not stage it.

### Concrete Example

**Setup:** A fixture repo with `docs/failures.jsonl` holding one row appended under `--operation=op-1`.

**Steps:**

1. Owner empties `docs/failures.jsonl` (a revert) → the file holds no rows.
2. Agent retries `bkit ledgers append --operation=op-1` with the same rows → the command refuses, names `op-1` and says the ledger no longer holds the rows.

**Outcome:** The ledger is unchanged and no receipt claims the finding is recorded.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Cursor offset beyond the end | An empty page, as today |
| Replay of an operation after a revert removed its rows | Not reported as recorded; the append is refused with the reason |
| Existing operation records that hold the block twice | Still read; no migration needed |
| Existing fingerprints in committed logs | Unchanged; no code touches them (item 6 is a decision row only) |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test. The issue's sixth row (two checkouts get different fingerprints) is dropped: the owner's comment of 2026-11-17 says no code changes for item 6, and the existing row `992-worktree-fingerprint-stays-plain-hash` in `docs/decisions.jsonl` records why.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a negative `--cursor` offset is refused | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| a replayed operation whose rows are gone is not reported as recorded | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 2 |
| the row block is stored once per operation | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 2 |
| the correction-events file has mode 0600 | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| a leftover `*.bkit-lock` in a run's log folder is not staged by the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 4 |
| a replayed operation whose rows a rebase moved is still reported as recorded | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 5 |
| a replayed operation whose rows are gone says it was recorded and must not be retried under a new id | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 5 |
| receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 6 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

None. A replay that finds its rows gone now refuses where it used to answer "already recorded"; that is the fix, not a contract change. New receipts omit `detail.block`; old records that hold it still read.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** item 6 closes with a decision row only (owner decision, 2026-11-17) → if the owner reverses it, a per-clone key task is added and the sixth matrix row returns.
- **Assumption:** the line numbers in the issue are `dev` today and were re-checked by symbol in this plan → if a symbol moved, the task locates it by name.
- **Assumption:** a replay whose rows are gone is refused (exit 4, `EXIT_STAGE`) rather than redone → redoing would need a new receipt for an operation id that already has one; the caller retries with a new operation id.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- Item 2 could drop `block` from the intent row instead of the receipt. Rejected: the intent is written before the target is touched and crash recovery needs its exact bytes, so the receipt is the row that drops it.
- Item 4 could add the exclusion to `bookPathspecs`. Rejected: `ci.ts` and `branches.ts` reuse that list (`branches.ts` wraps each entry in `:(exclude)`), and a test freezes it. The exclusion goes at the staging listing in `commitBookkeeping`, with the ignore entries as the second layer.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Trimming or compacting the operations store | Item 2 stops the duplication only | A future issue |
| Reclaiming a stale lock automatically | Item 5 keeps the file out of commits only | A future issue |
| A per-clone key for the worktree fingerprint | Owner decision 2026-11-17 | Existing decision row `992-worktree-fingerprint-stays-plain-hash` |

## Suggested Scope Expansion

None.

## Security & Privacy

- [x] **PII** — item 6 keeps the plain hash; the decision row records that a correct path guess only confirms a user name the machine already shows.
- [x] **Private file permissions** — the correction-events file gets mode `0600`, matching `docs/security.md` § Workflow comment ownership ("private file permissions"), line 66.

No new routes, DB writes, secrets or user input.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package changes.
- [ ] **Dependency Versions:** no dependency changes.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** the files are readable in this worktree.
- [ ] **Project Context:** the `docs/decisions.jsonl` row `992-worktree-fingerprint-stays-plain-hash` already records item 6.
- [ ] **Project Documents:** assessed through the `.agents/docs.md` index; sources in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Architecture & UI:** the topology matches `docs/architecture.md:220`; no UI.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes | `docs/architecture.md:220` (Deterministic bookkeeping: operation intent, receipt, replay, corrections file) | covered | None. Task 2 updates the replay wording. |
| technology | `docs/technology.md` | yes | `docs/technology.md:60` (Vitest unit and integration naming) | covered | None. |
| security | `docs/security.md` | yes | `docs/security.md:66` (private file permissions) | covered | None. |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Test first, § What each tier must do (Unit) | covered | None. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | None. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| observability | `docs/observability.md` | yes | `docs/observability.md:32` (append receipt and corrections file) | covered | None. The receipt shape is unchanged. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | None. |
| noise | `docs/noise.md` | no — no log or alert change | none | none | None. |
| setup | `docs/setup.md` | no — no local-setup change | none | none | None. |

## Documentation Warnings

None

## Data Schema Integration

None — no database. The operation record under `<git common dir>/bkit-outbox/ledger-operations/` loses its second copy of `block` for new receipts; old records still read.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Refuse a negative cursor offset | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n "decodeCursor"` in `ledgers.ts`; read `decodeCursor` and `query` | `decodeCursor` — checks `Number.isInteger`, misses `>= 0` | EXTEND | Add the `>= 0` check where the offset is parsed. |
| Replay checks the ledger bytes | `.bkit/core/engine/commands/workflow/ledgers.ts` | read the `known.state === "replay"` branch and the intent path below it in `appendLedgerRows` | The intent path compares `have.subarray(offset, offset + want.length)` to the block | EXTEND | Run the same segment comparison in the replay branch. |
| Read an operation's effect with the block stored once | `.bkit/core/engine/ledgers/status.ts` | `grep -n "ledgerIntent\|recordLedgerOperation\|engineActions"` in `status.ts`; `grep -rn "detail"` across `.bkit/core/engine` | `ledgerIntent` returns the intent with its `block`; `recordLedgerOperation` stores a free-form `detail` | EXTEND | Add `ledgerEffect` beside them: receipt `offset` and `bytes`, block from the intent (or from an old receipt's `detail.block`). |
| Correction-events file mode | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n "appendFileSync"` in `ledgers.ts`; `grep -n "0o600"` in `commands/lib.ts` | `writeInvocation` in `lib.ts` writes the receipt with `mode: 0o600`; `recordLedgerOperation` appends with `{ mode: 0o600 }` | EXTEND | Pass `{ mode: 0o600 }` in `correctionBook`. |
| Keep a lock file out of the bookkeeping commit | `.bkit/core/engine/commands/workflow/ledgers.ts` | `grep -n "exclude"` in `ledgers.ts`; `grep -rn "bookPathspecs"` across `.bkit/core/engine` | `UNION_PATHSPECS` already uses `:(exclude)` magic; `bookPathspecs` is reused by `ci.ts` and `branches.ts` and frozen by a test | EXTEND | Add one exclude entry to the `ls-files` call in `commitBookkeeping`; leave `bookPathspecs` as it is. |
| Ignore entries for the lock file | `.bkit/shared/gitignore` | `grep -rn "bkit-lock"` in the repo's ignore files and engine | The ignore files list `.lock` only for plan logs | EXTEND | Add `*.bkit-lock` next to the existing run-sentinel entries; mirror into `.gitignore`. |

## Architecture & Component Changes

**Ledger rows:** None

### Engine

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

### Ignore files

#### [MODIFY] `.bkit/shared/gitignore` and `.gitignore`

- **Existence Check:** both exist.
- Add `*.bkit-lock`.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/architecture.md` | Task 2: a replay checks the ledger bytes before it answers. |
| `.bkit/core/.bkit/jsonl.md` | Task 2: the `--operation` replay sentence says the rows are checked. |

## Rollback Strategy

Code-only — `git revert` sufficient. Old operation records stay readable either way.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Query and replay

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Refuse a negative cursor offset
  - **READ:** `query` in `.bkit/core/engine/commands/workflow/ledgers.ts`: the `slice(offset, offset + limit)` that a negative offset reaches
  - **UPDATE:** `decodeCursor` in `.bkit/core/engine/commands/workflow/ledgers.ts`: require `o >= 0` so a negative offset gives the "not a cursor from this command" usage error
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the "bkit ledgers query" describe block holds the new test
  - **DONE WHEN:** a `--cursor` with a negative offset exits 2 with a usage error and no rows; an offset beyond the end still gives an empty page; the test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a negative --cursor offset is refused` fails on rows from the end of the ledger coming back with exit code 0, "expected 2" being 0

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Check the ledger on replay and store the block once
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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Files and locks

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Create the correction-events file as 0600
  - **UPDATE:** `correctionBook` in `.bkit/core/engine/commands/workflow/ledgers.ts`: create the file with `fs.appendFileSync(file, "", { mode: 0o600 })`
  - **UPDATE:** `append` in `.bkit/core/engine/commands/workflow/ledgers.ts`: the later `fs.appendFileSync(book.file, ...)` calls (the `correction-rejected` and `correction-succeeded` rows) pass no mode; they append to a file that already exists with `0600`, so keep them unchanged unless the file can be created there
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the standalone-invocation correction tests ("gives a runless invocation a correction scope", "lands a standalone corrected candidate") are the model for the new test
  - **DEPENDS ON:** 2
  - **DONE WHEN:** after a standalone append's corrected retry, `<id>.corrections.jsonl` has `mode & 0o777 === 0o600`; the test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `the correction-events file has mode 0600` fails on the file mode being the default "expected 384" (0o600) not matching 420 (0o644)

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Keep a stale lock file out of commits
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

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 5 start -->

- [x] **TASK 5:** A replay after a rebase that put upstream ledger rows ahead of the operation's block is refused as "nothing recorded", so the caller's fresh-id retry appends the same row a second time
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1841` · **Round:** 1
  - **DONE WHEN:** the replay branch of `appendLedgerRows` returns the stored receipt with `replayed: true` when the operation's exact block is anywhere in the ledger file (for example `held.indexOf(wanted) !== -1`), not only at `d.offset`; when the block is nowhere in the file (a compaction or harvest rewrote or removed the rows) it still refuses with EXIT_STAGE and writes nothing, and its message no longer claims "nothing recorded": it says the operation was recorded earlier, that the ledger no longer holds its rows, and that the caller must not retry it under a new operation id; `bkit ledgers compact`, harvest and the receipt lookup are unchanged, with no matching by row key; the existing `a replayed operation whose rows are gone is not reported as recorded` test still passes; `docs/architecture.md:220` and `.bkit/core/.bkit/jsonl.md:62` match the new wording wherever they describe the refusal
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a replayed operation whose rows a rebase moved is still reported as recorded` fails on the replay of `op-1` exiting 4 with "no longer holds its rows; nothing recorded" after a foreign row is written ahead of the block (the order a `merge=union` rebase leaves: upstream lines first, then ours), "expected 0" being 4
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a replayed operation whose rows are gone says it was recorded and must not be retried under a new id` fails on the refusal's message reading "no longer holds its rows; nothing recorded" with no mention of a new operation id, after the ledger file is emptied and the same operation is replayed

<!-- bkit:task 5 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** A retry after a lost response, run once a rebase has put upstream rows ahead of the landed block, takes the "prepare afresh" path and appends the same rows a second time
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1865` · **Round:** 2
  - **DONE WHEN:** in the intent path of `appendLedgerRows` (an intent with no receipt), when the bytes at `intent.offset` differ from `intent.block` but the whole block is somewhere else in the ledger file (`have.indexOf(want) !== -1`), the engine records the receipt from the intent and returns `replayed: true` with `appended: 0`, and writes nothing to the ledger; the uncertain check and the "prepare afresh" path are reached only when the whole block is nowhere in the file; the existing tests "prepares afresh when nothing landed and a foreign row followed" and "refuses to re-append a partly landed block after a foreign writer appended" still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again` fails on the retry returning `appended` 1 and the ledger holding the row twice. The test appends under `operation: "op-moved"` with `checkpoint: failAt("written")`, so the bytes land and no receipt is written. It then rewrites the file as one foreign complete row line followed by the original bytes, the order a `merge=union` rebase leaves, and retries the same operation. It expects `appended` 0, `receipt.replayed` true and the file unchanged.

<!-- bkit:task 6 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (none here).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** the receipt shape in `docs/observability.md:32` still matches.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** `.bkit/core/engine/commands/workflow/ledgers.test.ts` and `.bkit/core/engine/ledgers/status.test.ts` pass in full.
- [ ] **Build Configuration:** `pnpm build && git add dist/` after the engine edits.
- [ ] **Run all tests:** `pnpm test` passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

- [ ] **Step 1:** in a scratch checkout, append a row with `--operation=op-1`, empty the ledger and retry; the command refuses and names `op-1`.
