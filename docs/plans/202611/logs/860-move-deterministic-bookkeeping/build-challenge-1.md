Verdict: FAIL
Failures: 11
Fingerprint: 217dc175e87ff955cfafe991a9f9b9c6d0712da8ab7a8e9afcb87a294477023b
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Coverage note: partial diff coverage. The diff file showed the 20 largest files at 500 lines each; findings were confirmed against the engine source at this worktree revision.

CRITICAL findings: 1 (TASK 1). The engine sets the Failures header to the count of every finding below, of every severity.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** An audit run that follows its prompt overwrites its own finished report: `steps stub --result-file --to=<Create>` replaces the anchored audit report (Probe Steps, Findings, Report, Project Instructions) with the short summary
  **Severity:** CRITICAL · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:2328` · **Round:** 1
  - **DONE WHEN:** Rendering an audit result never destroys an existing populated report: the `bkit:anchor` block and every template section the agent wrote survive the render. No agent can settle this alone, because `.bkit/core/prompts/bkit-audit-generate.md:164` sends the summary to `<Create>` (the report itself) while the audit result carries no body; the owner must decide whether the engine splices the Status / Report / Findings header and derived tables into the existing report, or writes the summary to its own path.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `audit result render keeps an existing anchored report intact` fails on `steps stub --agent=bkit-audit-generate --result-file` overwriting a report that holds a `bkit:anchor` block and filled Probe Steps / Findings sections, leaving only the rendered summary.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A ledger append that crashes between its intent and its receipt can never be reconciled once its invocation goes stale, so the committed pending intent blocks `ledgers union`, compact, migrate and every `--correction-of` on that ledger for good
  **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1699` · **Round:** 1
  - **DONE WHEN:** A pending intent always has a reachable resolution: reconciliation by operation id alone (checking the prepared bytes at the recorded offset) works without the original invocation, or an engine verb resolves or abandons it with evidence, and teardown union does not fail forever on an intent another checkout wrote. No agent can settle this alone, because the request hash binds the invocation id (`ledgers.ts:1571`), invocations go stale when a newer run starts (`commands/lib.ts` `resolveInvocation`) and `.bkit/ledger-operations.jsonl` rides every bookkeeping commit via `.bkit/*.jsonl`, although the plan's Data Schema Changes row 'Ledger operation' places receipts in the git-common outbox; the owner must decide who may reconcile an intent and whether it is checkout-local or committed state.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `resolves a pending ledger intent after its invocation is stale` fails on a crash at the `prepared` checkpoint followed by a new run start leaving `ledgers union` exiting with 'replay them first' and every replay of the operation refused as a different request.
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Feeding the audit `ledgerRows` the engine prints straight into `ledgers append --invocation` is refused, because each row's `by.step` is `audit-<slug>` while the standalone invocation vouches for `audit:<slug>`; the integration test hides this by stripping `by`
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:747` · **Round:** 1
  - **DONE WHEN:** The rows `steps stub --agent=bkit-audit-generate --result-file` prints append unchanged under the `--standalone=audit --name=<slug>` invocation: `auditLedgerRows` emits no `by` block (or one equal to the invocation's), and the integration test passes the printed rows verbatim.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `appends the printed audit ledgerRows verbatim under the standalone invocation` fails on exit 8 with `conflict: by.step="audit-security" disagrees with invocation`.
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** A resumed re-trigger push on a feature branch force-overwrites a commit someone else pushed, whenever any fetch already moved `origin/<branch>` to it: the remote-movement guard only blocks when the tracking ref is stale, which is exactly when `--force-with-lease` would have failed anyway
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/runs.ts:1103` · **Round:** 1
  - **DONE WHEN:** At the `commit-created` checkpoint, a remote tip that is neither the re-trigger commit nor its ancestor blocks the push whatever `origin/<branch>` says, the remote commit stays reachable, and no `push-completed` row is written.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it` fails on the bare remote's foreign commit becoming unreachable after the dispatcher resumes from `commit-created`.
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** After a crash leaves part of a prepared block in the ledger and the lock is cleared as the error message advises, a friction or plain append lands next (neither checks pending intents), and reconciling the operation then takes the 'none of ours landed: prepare afresh' branch and appends rows that already landed a second time
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1740` · **Round:** 1
  - **DONE WHEN:** Reconciliation prepares afresh only when no byte of the prepared block landed at the recorded offset; any landed prefix of the block followed by foreign bytes reports `UncertainEffect` and appends nothing, and no fold winner or lineage count is duplicated.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `refuses to re-append a partly landed block after a foreign writer appended` fails on a two-row operation whose first row and half of its second landed, followed by an `appendFrictionRow` write, being reconciled with exit 0 and the first row present twice.
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** An agent that retries a lost `--issue-operation` append with the same rows but a different JSON key order gets a new engine-issued operation id and appends every row a second time, because the request hash is `JSON.stringify` of the raw rows, not a canonical form
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1471` · **Round:** 1
  - **DONE WHEN:** The issued operation id and the stored request hash (`ledgers.ts:1471`, `ledgers.ts:1571`) are computed from a key-sorted canonical serialization, so semantically equal rows replay the original receipt and append nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `issues the same operation for rows whose keys are reordered` fails on the second `--issue-operation` call returning `replayed: false` and the ledger gaining a second copy of the row.
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** Audit ledger keys the engine derives are `<slug>-<title>`, while `bkit-audit-generate.md` defines new keys as `audit-<slug>-<content-slug>` and closes stale rows by the `audit-<slug>-` prefix, so rows the engine keys are never closed by later audit runs
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:734` · **Round:** 1
  - **DONE WHEN:** `auditEntries` derives new keys as `audit-<slug>-<content-slug>`, matching the prompt's key format and its closure prefix, and a derived key can never equal a report finding ID such as `<slug>-1`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `derives audit ledger keys under the audit-slug prefix` fails on `auditEntries` returning `security-missing-csrf-token` instead of `audit-security-missing-csrf-token`.
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** A result file that is just `{}` (or omits `evidenceComplete` and `body`) renders a `Verdict: PASS` challenge or review artifact with an empty body, because `evidenceComplete` defaults to true
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1660` · **Round:** 1
  - **DONE WHEN:** `renderResult` requires an explicit boolean `evidenceComplete` (and a non-empty `body` for a PASS) and exits 6 writing nothing when either is missing, so missing evidence never becomes PASS.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `renders no PASS from a result that omits its evidence` fails on `renderResult(cwd, 'bkit-build-challenge-1', {})` returning text with `Verdict: PASS`.
<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** On a fresh consumer with no `docs/failures.jsonl` (coverage `missing`) or a ledger holding one malformed line (coverage `partial`), the prompts' 'follow `nextCursor` until `coverage.clean` is true' never terminates and names no route, so the agent loops, stops, or quietly treats the scan as clean
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-audit-generate.md:165` · **Round:** 1
  - **DONE WHEN:** Every prompt that reads `bkit ledgers query` (audit-generate, ship-deferred-sweep, debug-failure-diagnose and the five utility-update prompts) stops paging when `nextCursor` is null and routes on `coverage.status`: `missing` = no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `routes every ledgers query reader on coverage status` fails on a prompt that cites `coverage.clean` without naming the `missing` and `partial` routes.
<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** A hand-edited `--cursor` with a negative offset passes `decodeCursor` (any integer) and `rows.slice(-n, ...)` returns rows from the end of the scan as if they were the next page
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1920` · **Round:** 1
  - **DONE WHEN:** `decodeCursor` accepts only a whole-number offset no greater than the filtered total, and any other cursor exits 2 as not a cursor from this command.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `refuses a cursor with a negative offset` fails on `ledgers query --cursor=<base64url {s, f, o: -1}>` exiting 0 with the last winner as its page.
<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->
- [ ] **TASK 11:** Every operation-bound append writes its full row block twice into the committed `.bkit/ledger-operations.jsonl` (intent and receipt `detail`), which no compaction trims and which every later append parses whole twice
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1709` · **Round:** 1
  - **DONE WHEN:** The receipt row records the offset, byte count and block digest only, and replay reads the receipted rows back from the ledger at that offset, so the store grows by a fixed size per operation rather than by the rows' size, and `docs/observability.md:38` ('None of them stores a secret, a row body or a token') holds for the receipt.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `keeps the operation receipt free of the appended row bytes` fails on the receipt row's `detail.block` holding the full appended JSON.
<!-- bkit:task 11 end -->
