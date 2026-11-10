Verdict: CONCERNS
Failures: 5
Fingerprint: 5f6552e8f02bef10621f72476b07ea9584f6a127a990f1b64aa3374f68e8339e
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage. The supplied diff (`origin/dev...HEAD`, 17420 lines across 122 files) showed only 20 files, at 500 lines each. Every security-relevant file it did not show whole was read with `git diff origin/dev...HEAD -- <file>`: `commands/lib.ts`, `commands/workflow/{ledgers,status,runs,issues,steps,locks,worktrees,workflows,branches}.ts`, `ledgers/{status,telemetry,journal,migrate}.ts`, `docs/{architecture,observability}.md`, `scripts/harvest/bkit-harvest.mjs`, `skills-lock.json` and the new `.agents/skills/vitest/**` skill. The added workflow lines were checked for unquoted variables. The added lines of the whole diff were grepped for secrets and shell-injection patterns, and none were found. The new `vitest` skill (`antfu/skills`, no `ref` pin, markdown only, no install script) is a temporary feature skill that ship prunes under `.agents/skills.md`; no embedded directive was found. Test files and `dist/` mirrors were not challenged beyond the grep.

No finding is CRITICAL. The top three are MEDIUM: Tasks 1-3 below. The CRITICAL count is 0.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Every issued invocation commits the developer's absolute checkout paths (home directory and username, e.g. `/Users/<name>/...`) into the tracked run `status.jsonl`, which ships in consumer repo history and bkit's public repo.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/status.ts:742` · **Round:** 1
  - **DONE WHEN:** The `invocation` event appended to the run's tracked `status.jsonl` holds no absolute path: `statusPath` and `bookRoot` are stored relative to the checkout top, and `worktree` is dropped or replaced by a one-way fingerprint. `rebuildInvocation` (`.bkit/core/engine/commands/lib.ts`) resolves them against the current top and still refuses a receipt for another checkout. Absolute paths stay only in the private outbox receipt.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `writes no absolute checkout path into the run's committed invocation event` fails on the appended `invocation` row containing the temporary checkout's absolute path in `statusPath`, `bookRoot` or `worktree`.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Ledger-operation intents and receipts live in the committed, union-carried `.bkit/ledger-operations.jsonl`, not the private git-common outbox the plan names. A crash, or a branch that commits a receipt-less intent row, then propagates on merge and blocks `ledgers union` (worktree teardown), `ledgers compact` and the upgrade-path `migrateLedgers` in every checkout. The replay that would clear it needs the original request, which no other checkout can reproduce.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/ledgers/status.ts:675` · **Round:** 1
  - **DONE WHEN:** Intents and receipts are written under `<git common dir>/bkit-outbox/` with private file permissions, as the plan's Data Schema Changes row and `docs/security.md` § Workflow comment ownership require. No `bookPathspecs` or `UNION_PATHSPECS` entry stages or carries them. An intent row arriving in tracked content no longer blocks union, compact or migrate.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `keeps ledger operation intents and receipts out of committed book paths` fails on `appendLedgerRows` with an `operation` creating `<root>/.bkit/ledger-operations.jsonl`, or on a receipt-less intent row in that tracked file making `unionLedgers` throw.
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A line break in a header-bound result value (`report`, `issue` or `parent` in an audit result, or any free-text judgment) injects forged header lines and an early `<!-- verdict:end -->`. For example, a multi-line `report` that adds `Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0` makes `readHeader` read zero findings over the engine-derived `CRITICAL 1`. Because the cut-off header carries no `Fingerprint`, `fingerprintProblem` treats the artifact as hand-written and skips the stale check.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1566` · **Round:** 1
  - **DONE WHEN:** `renderResult` / `renderAudit` and `parseAuditResult` refuse (EXIT_INVALID, nothing written) any value that is rendered into a header line and contains CR or LF, including `report`, `issue`, `parent` and every judgment at `steps.ts:1652`. The `Report:` line `issues comment --result-file` builds applies the same rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses line breaks in header-bound result values` fails on `renderResult(cwd, "bkit-audit-generate", …)` with a CRITICAL finding and a multi-line `report` returning rendered text, whose written file `readHeader` then reads as `Findings: CRITICAL 0 …` with no fingerprint check.
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** A replayed operation returns its stored receipt (`replayed: true`, exit 0) without checking that the target ledger still holds the receipted rows. After a branch switch, rebase, revert, or a receipt carried in from another checkout, a finding the caller believes is recorded is silently missing.
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1688` · **Round:** 1
  - **DONE WHEN:** Before a `replay` returns, it confirms that every receipted row line is present in the current target file. When any is absent, the call exits non-zero as an uncertain effect, writes nothing and names the operation.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `refuses to replay a receipt whose rows the ledger no longer holds` fails on a second `appendLedgerRows` with the same operation and rows, after the ledger is restored to its pre-append bytes, returning `replayed: true` while the file holds none of the rows.
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** A standalone invocation's `<id>.corrections.jsonl` is created in the outbox with default permissions (typically world-readable 0644), unlike the 0600 receipt beside it. This breaks the `docs/security.md` contract that invocation files under Git-common `bkit-outbox` are private.
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1521` · **Round:** 1
  - **DONE WHEN:** The corrections file is created with mode 0600 before any row is appended to it, matching `writeInvocation` in `.bkit/core/engine/commands/lib.ts`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `creates a standalone invocation's corrections file with private permissions` fails on `<outbox>/invocation-context/<id>.corrections.jsonl` having group or other permission bits after `ledgers append --invocation=<standalone id>`.
<!-- bkit:task 5 end -->
