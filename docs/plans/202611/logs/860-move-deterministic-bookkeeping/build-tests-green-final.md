Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 4

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/status.test.ts` "issues invocation metadata from an explicit run and registered step" | red | passed |
| 1 | `.bkit/core/engine/commands/lib.test.ts` "rejects stale cross-worktree invocation and conflicting overrides" | red | passed |
| 1 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes explicit invocation across two real worktrees without identity leakage" | red | passed |
| 2 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models" | passed-accepted | passed |
| 2 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "rejects conflicting attribution and retains legacy writer restrictions" | red | passed |
| 2 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "completes missing subagent attribution before a real append" | red | passed |
| 3 | `.bkit/core/engine/ledgers/telemetry.test.ts` "folds numeric timestamps and equal timestamp ties before filtering" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "pages canonical winners with diagnostics and rejects stale cursors" | red | passed |
| 3 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "distinguishes unreadable missing malformed and clean ledger coverage without writing" | vacuous | passed |
| 10 | `.bkit/core/engine/commands/workflow/status.test.ts` "records the issued invocation in the run status log and rebuilds a deleted receipt" | red | passed |
| 10 | `.bkit/core/engine/commands/lib.test.ts` "writes the engine-call row for an invocation-bound command" | red | passed |
| 10 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "keeps invocation events and engine-call rows inside the issuing worktree after receipt loss" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/status.test.ts` "refuses to issue an invocation into a status file outside the issuing checkout" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/run-facts.test.ts` "starts a step clock at the previous step row, not at an invocation row" | red | passed |
| 12 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models" | passed-accepted | passed |
| 4 | `.bkit/core/engine/ledgers/status.test.ts` "preserves tracker changed-hash actions while rejecting ledger operation collisions" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "returns durable append receipt and permits a deliberate same-key update" | red | passed |
| 4 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "reconciles lost append response at each durable checkpoint without duplicate rows" | red | passed |
| 4 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "serializes concurrent append operations and blocks partial uncertain ledger writes" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS" | passed-accepted | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "retains special verdict judgments and legacy stub behavior" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/challenge.test.ts` "reuses structured challenge findings without losing semantic inputs" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives audit IDs totals ledger payloads and coverage from one result" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/issues.test.ts` "renders audit comments from validated result and preserves tracker adapters" | red | passed |
| 6 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "keeps rendered audit report appended rows and tracker draft counts identical" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/runs.test.ts` "derives handoff decisions from persisted poll observations and target identity" | red | passed |
| 7 | `.bkit/core/engine/ledgers/status.test.ts` "preserves handoff events across status folding and rejects stale CI selection" | red | passed |
| 7 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes nonwaiting CI polls without resetting attempts or duplicating retrigger" | red | passed |
| 8 | `.bkit/core/engine/commands/lib.test.ts` "exposes no-write correction eligibility only for declared pre-effect validation" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/counters.test.ts` "shares correction budget across candidate operations and honors specific limits" | red | passed |
| 8 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes corrected substep and blocks exhausted unauthorized or uncertain effects" | red | passed |
| 9 | `.bkit/core/engine/tools/instructions.test.ts` "renders one recovery precedence contract for all hosts and tracker adapters" | passed-accepted | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades fresh consumers with deterministic bookkeeping contracts" | vacuous | passed |
| 13 | `.bkit/core/engine/commands/workflow/steps.test.ts` "audit result render keeps an existing anchored report intact" | passed-accepted | passed |
| 14 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resolves a pending ledger intent after its invocation is stale" | vacuous | passed |
| 15 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "appends the printed audit ledgerRows verbatim under the standalone invocation" | red | passed |
| 16 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it" | red | passed |
| 17 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "refuses to re-append a partly landed block after a foreign writer appended" | vacuous | passed |
| 18 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "issues the same operation for rows whose keys are reordered" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/issues.test.ts` "derives audit ledger keys under the audit-slug prefix" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "renders no PASS from a result that omits its evidence" | red | passed |
| 21 | `.bkit/core/engine/tools/instructions.test.ts` "routes every ledgers query reader on coverage status" | red | passed |
| 22 | `.bkit/core/engine/commands/workflow/status.test.ts` "writes no absolute checkout path into the run's committed invocation event" | red | passed |
| 23 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "keeps ledger operation intents and receipts out of committed book paths" | red | passed |
| 24 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses line breaks in header-bound result values" | red | passed |
| 25 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "prepares afresh when nothing landed and a foreign row followed" | red | passed |
| 26 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "does not push a second re-trigger copy after a lost push response on a shared branch" | red | passed |
| 27 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a result file left from an earlier round" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/counters.test.ts` "refuses a reused correction candidate id with different rows" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "marks a page with a next cursor as not clean" | red | passed |
| 30 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives a fresh audit key when the ledger already holds it" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/status.test.ts` "refuses to issue an invocation through a status file symlinked out of the checkout" | red | passed |

## Gaps

None.

## Already landed

- Task 2 `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models" — passed at the group's red, and the tests step accepted it: Task 12 (group 2) names the same test; its tests step replaced a double cast with a plain spread, which changed this test's lines after Task 2's red, so the red record is re-taken against the corrected test, which passes because the group 1 code is built; no red is due
- Task 12 `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models" — passed at the group's red, and the tests step accepted it: test passes before and after; the double cast was replaced by a plain object spread `writerProblem({ ...unavailable })`, every expectation unchanged; the planned red is the slop check on the cast, not a test failure.; no red is due
- Task 5 `.bkit/core/engine/commands/workflow/steps.test.ts` "derives supported header fields and rejects stale bodies without false PASS" — passed at the group's red, and the tests step accepted it: red before the code step; passes now that the code landed, after two Fixable expectations were corrected to follow bkit-build-plan-verify.md; no red is due
- Task 9 `.bkit/core/engine/tools/instructions.test.ts` "renders one recovery precedence contract for all hosts and tracker adapters" — passed at the group's red, and the tests step accepted it: it passes because the group's code is built; the correction only gives it the corpus time budget; no red is due
- Task 13 `.bkit/core/engine/commands/workflow/steps.test.ts` "audit result render keeps an existing anchored report intact" — passed at the group's red, and the tests step accepted it: the group 5 code is already built, so the corrected test passes at re-record; no red is due

## Unproven

- Task 3 `.bkit/core/engine/ledgers/journal.integration.test.ts` "distinguishes unreadable missing malformed and clean ledger coverage without writing" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
- Task 9 `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades fresh consumers with deterministic bookkeeping contracts" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
- Task 14 `.bkit/core/engine/ledgers/journal.integration.test.ts` "resolves a pending ledger intent after its invocation is stale" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
- Task 17 `.bkit/core/engine/ledgers/journal.integration.test.ts` "refuses to re-append a partly landed block after a foreign writer appended" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
