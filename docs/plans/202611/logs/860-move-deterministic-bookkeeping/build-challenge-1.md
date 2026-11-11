Verdict: CONCERNS
Failures: 7
Fingerprint: 5df47003f16be7b9a04b47e985031d9e262335ca689d8925fd8f3bbf68ac8a4e
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Coverage note: partial diff coverage. The diff file showed the 20 largest files at 500 lines each; findings were confirmed against the engine source and workflow/prompt sources at this worktree revision. Challenge round 2 of 2: round-1 tasks 13-24 were not re-reported; round-1 LOW findings (negative cursor offset, receipt holding row bytes) are deferral rows and were not re-reported.

Cross-references: Task 1 and Task 4 contradict `.bkit/core/.bkit/jsonl.md` § Engine and workflow writers ("A lost response is retried with the same id"; "the same id with other rows is refused"). Task 2 contradicts the plan's requirement of "exactly one reachable intended retrigger commit". Task 3 contradicts the plan's Edge Cases row "Findings change after a header was produced → ... no false PASS". Task 5 contradicts plan Success Criterion 2 ("Never represent unread or malformed content as an empty/clean scan"). Task 6 contradicts the plan's Data Schema row "existing ledger keys are explicit semantic decisions".

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A ledger append killed at its `prepared` checkpoint, followed by any ordinary write to the same ledger (a dispatcher friction row, a plain append), can never be reconciled: every schema-3 row starts `{"schema":3,"ts":179...`, so the byte-prefix count at `ledgers.ts:1753` always finds "landed" bytes, the replay throws `UncertainEffect` instead of preparing afresh, and the pending intent blocks `ledgers union`, `compact`, `migrate` and `--correction-of` on that ledger for good
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1753` · **Round:** 1
  - **DONE WHEN:** Reconciliation decides "landed" by whole lines, not by a shared byte prefix: when the first line at the recorded offset is a complete line that is neither equal to nor a proper prefix of the block's first line, nothing of ours landed and the operation prepares afresh and appends once; a landed whole line, or a torn proper prefix of our first line, still reports `UncertainEffect` and writes nothing (Task 17's test still passes).
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `prepares afresh when nothing landed and a foreign row followed` fails on a crash at `failAt("prepared")` followed by a plain `appendLedgerRows` of another schema-3 row, then the replay with the same `--operation` and rows throwing `/uncertain/` instead of appending its row exactly once and leaving no pending intent.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** On a shared branch, a re-trigger whose push response is lost (process killed during or right after `git push`, before `push-completed` persists) is pushed a second time on resume: `landEmptyOwnCommits` re-copies the original commit because the pushed copy has a new SHA and is not in `rec.pushed`, so dev gets two empty re-trigger commits and two CI runs; if the kill lands after `markRecordPushed`, resume instead returns the local original SHA (`rec.pushed.at(-1)`), which the remote never received, and the re-poll watches that SHA
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/runs.ts:814` · **Round:** 1
  - **DONE WHEN:** The copy SHA is persisted (handoff checkpoint or shared-checkout record) before the copy is pushed, and a resumed `commit-created` re-trigger on a shared branch first checks whether the remote tip already is or contains that copy: if so it records `push-completed` with the copy SHA and pushes nothing; `rec.pushed` never stands in for the remote SHA of a copied commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `does not push a second re-trigger copy after a lost push response on a shared branch` fails on a `remoteRepo("dev", true)` run whose first `ciDispatchGate` pushes the copy and is then interrupted before `push-completed` (copy on the bare remote, record unmarked), the resumed run leaving `shared.retriggers()` at 2, or `retrigger.remote` naming a SHA the bare remote does not hold.
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A subagent that dies before writing its result (turn cap, crash, refusal) still gets a well-formed artifact: Result paths are reused across rounds and runs (`{OUTBOX}/build-challenge-1-result.json` has no round; `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}` and `build-failure-diagnose-{TEST_ATTEMPT}` restart in a new run), nothing clears them before launch, and `steps stub --result-file` renders whatever file is there, so round 1's findings render as round 2's report and an earlier run's PASS verify result renders as this group's PASS
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:2327` · **Round:** 1
  - **DONE WHEN:** A result file that predates the subagent launch it is rendered for never renders: the result is bound to the current step occurrence (the workflow clears or rotates each Result path before launching its subagent, or the result carries the issued invocation id and `steps stub --result-file` refuses one from another invocation, run or round with exit 6, writing nothing), so a missing fresh result always takes the step's Failure Path.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a result file left from an earlier round` fails on `steps stub --agent=bkit-build-challenge-1 --result-file` rendering a result written before the current challenge round began and exiting 0 with the old findings in the new artifact.
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** An agent that keeps one `--operation` for its corrected retries gets unlimited corrections: a rejected candidate leaves no intent or receipt, so its id carries no request hash, and `spendCorrection` returns `allowed` (replayed) for any operation already in the scope whatever rows it now carries, so `remaining` never reaches 0 and every rejection stays a correctable `NoWriteRejection`
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/counters.ts:229` · **Round:** 1
  - **DONE WHEN:** Each `correction-candidate` row records the candidate's canonical request hash; `spendCorrection` treats a known operation as a free replay only when the hash matches, and refuses (nothing written) a known candidate id with another request, so a scope allows at most `CORRECTION_LIMIT` distinct corrected requests and the third rejection is final.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `refuses a reused correction candidate id with different rows` fails on three `ledgers append --operation=op-b --correction-of=op-a` calls with three different invalid row sets all exiting with a correctable rejection while the scope shows one candidate spent.
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** `ledgers query` reports `coverage.clean: true` on a page whose `nextCursor` is non-null, and the plan workflow saves exactly one `--limit=500` page into `related-knowledge.md` for reviewers who have no shell; past 500 active rows the newest knowledge rows (the page is oldest-first) are silently dropped while the saved output says the scan is clean
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:2004` · **Round:** 1
  - **DONE WHEN:** `coverage.clean` (and `coverage.status`) report an unfinished scan whenever `nextCursor` is non-null, and every block that captures a query for an agent without a shell (`.bkit/core/workflows/bkit-plan.md` related-knowledge save) writes all pages or stops on a non-null `nextCursor` instead of saving a truncated page.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `marks a page with a next cursor as not clean` fails on `ledgers query --ledger=knowledge --limit=1` over a two-winner ledger returning `coverage.clean: true` alongside a non-null `nextCursor`.
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** A new audit finding whose title matches an earlier audit row of a different problem (same title, other `file:line`, which the prompt calls "a different problem") gets that row's key: `auditEntries` checks a derived `audit-<slug>-<title>` key only against this result's `priorKey`s, never against `docs/failures.jsonl`, so the append lands as a later row of the old key and the old, still-open failure drops out of the fold winners
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:735` · **Round:** 1
  - **DONE WHEN:** A derived key is unique against every key already in the target ledger as well as within the result (the renderer reads the ledger's winners and suffixes `-2`, `-3` ...), so reusing an existing key happens only through an explicit `priorKey`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `derives a fresh audit key when the ledger already holds it` fails on `renderResult` for a `security` result with a new `Token logged` finding, in a checkout whose `docs/failures.jsonl` already holds an OPEN `audit-security-token-logged` row, printing `ledgerRows[0].key` = `audit-security-token-logged`.
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** A process killed while it holds a target lock leaves `<ledger>.bkit-lock` in the working tree, and nothing ignores it: a lock beside a run's `status.jsonl` (taken by `restoreBranchRows` and `carryOwnBook`) matches the `docs/plans/<month>/logs/<fid>/*` book pathspec, so the next `ledgers commit` commits it, and every clone of that branch then waits 10 s and fails on that file because a committed lock is never reclaimed
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/ledgers/status.ts:868` · **Round:** 1
  - **DONE WHEN:** `*.bkit-lock` files are ignored by the shipped gitignore block and excluded from every `bookPathspecs` / `UNION_PATHSPECS` entry (or the lock lives under the git common dir), so `ledgers commit` never stages a lock file.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `never stages a leftover target lock beside a run's status log` fails on `commitBookkeeping` with a stale `docs/plans/202611/logs/<fid>/status.jsonl.bkit-lock` present committing that lock file.
<!-- bkit:task 7 end -->
