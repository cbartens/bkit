Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

The language server refused the ignored worktree path. Bounded source reads and caller searches supplied the references below; that refusal was not treated as absence. No implementation or tests were run for this review.

<!-- prettier-ignore -->
| Task | Direct surface and consumers | Risk and coverage |
| --- | --- | --- |
| 1 | `tracker.ts`: `postComment`, `recentComments`, `linearGql`, `JiraSession`, provider identity and representation contracts. The shared publisher consumes comment results; issue fetching also uses the existing transport helpers. | High-risk shared transport. Unit interpretation cases and Task 10's independent provider probes cover the changed boundary. Preserve existing issue/label/board behavior when adding optional transport options. |
| 2 | `tracker.ts`: `splitAt`, generated-marker helpers, complete-body counting and section/part rendering. Jira creation and the progress publisher consume these. | High-risk shared renderer. The matrix covers Unicode, complete headers, timestamps, marker round trips and unverified budgets. |
| 3 | `ledgers/status.ts`: action identities/receipts, new delivery records and immutable source files. Tracker posting, workflow status readers, commit/dispatch/PR receipts and run folding consume this module. | High-risk persistence compatibility. The task preserves historical receipts, adds source/binding/version tests and keeps preparation distinct from successful action acknowledgment. |
| 4 | `locks.ts`: exclusive creation and token ownership, with a separate publication-lock policy. Workflow locks continue to use the existing stale-run policy. | High-risk shared lock primitives. Real temporary files/process identity tests cover serialization, refusal, reclaim and release. The explicit separation avoids applying publication process-age rules to existing workflow locks. |
| 5 | `tracker.ts`: `postForVerb` and `postCommentOnce`; callers are `issues.ts` comment, `steps.ts` finish, and `workflows.ts` failure/handover/close/links. | High-risk central mutation policy. Tests cover structured classification, deduplication across segments, changed versions, rollover and unchanged standalone fallback. |
| 6 | `tracker.ts`: prepared-operation recovery, partial parts, positive acknowledgments and global work bounds. Its GitHub transport reaches `commands/lib.ts` through `gh` → `runGh` → `runTool`. | High-risk recovery and blocking subprocess boundary. Two gaps below need plan edits before the listed checks provide the promised evidence. |
| 7 | `RunContext`, repo session creation/pruning, issue/step callers, workflow start/close/session removal, worktree transfer/removal, and ledger/landing inclusion. The new integration suite drives real temporary files, Git and CLI processes. | High-risk lifecycle. Explicit adoption, auto/phase separation, pre-close preparation, cleanup and fresh-clone cases are present. `bookPathspecs` already includes the feature-log subtree; the plan correctly makes any inclusion change conditional on real evidence. |
| 8 | `TrackerOutcome`, durable delivery outcomes and workflow summaries. CLI users and fallback decisions consume `done`, `skipped`, `reason`, URL and warning fields. | High-risk public result shape. Additive compatibility is stated; tests cover sensitive data, logical operations versus attempts, fallback requests and retained journals/bytes. |
| 9 | Shared Comments clause, all six workflow sources, tracker/workflow/CLI catalogs, host rendering and operator documentation. Every supported host/tracker consumes the rendered instructions. | High-risk cross-host contract. Behavioral rendered guards are specified rather than regenerated-baseline equality. The manual work-comment rule stays outside the change. |
| 10 | New disposable-target probe using production publisher/inspection paths and verified adapter capability metadata. GitHub, Linear and Jira are all acceptance targets. | Real external boundary evidence is explicitly required. Missing owner answers, credentials, targets or contract evidence remain incomplete acceptance, not a successful fallback. |
| 11 | Built CLI, generated `dist/`, static/drift checks and fresh-consumer on-disk inspection. | Verification only. It depends on the earlier behavior and real-provider evidence rather than substituting a unit fixture for external acceptance. |

No application database migration, public HTTP endpoint, event bus or queue schema changes are proposed. Internal record changes are additive. The two unresolved Q4 decisions retain their strict defaults throughout the plan; this review does not approve them.

## CRITICAL

### 1. The GitHub subprocess cannot obey the planned delivery deadline without an unplanned shared-helper change (plan edit)

Task 6 requires all transport work to fit the remaining 60-second budget, but its source updates name only `tracker.ts`. The GitHub adapter calls `runGh` synchronously at `.bkit/core/engine/commands/workflow/tracker.ts:188`. `runGh` accepts no timeout/deadline option and delegates to `runTool` at `.bkit/core/engine/commands/lib.ts:717`; `runTool` calls `spawnSync` without a timeout at `.bkit/core/engine/commands/lib.ts:680`. A slow or hung `gh` call therefore prevents the publisher from checking elapsed time, releasing its lock or returning uncertainty. The only planned `lib.ts` change is Task 7's `RunContext` association, which does not change these subprocess helpers and occurs in the next group.

Add the required `runGh`/`runTool` deadline plumbing to Task 6 (or an earlier task in the same group), using a backward-compatible optional limit so unrelated callers retain their contract. Add a matrix row and a named test in the existing `commands/lib.test.ts` or an appropriate integration suite that executes an actual bounded slow child, proves termination and timeout classification, and confirms the tracker preserves preparation and releases its owned lock. Keep the existing transport instead of introducing a second GitHub execution path. The broader budget test must include the real subprocess boundary, not only a fake already returning a timeout.

### 2. The ambiguous-mutation test can pass before the recovery change exists (plan edit)

Task 6's `never blindly retries an ambiguous mutation` is defined only as failing when a timeout triggers another write without conclusive reconciliation. Today's `postCommentOnce` already calls `postComment` once and immediately returns `done: false` from its catch at `.bkit/core/engine/commands/workflow/tracker.ts:1078`; it has no automatic retry loop. A one-call timeout test that asserts one mutation therefore passes on current code and does not establish the new durable recovery behavior. Task 5's acknowledged-publication scope likewise does not require an automatic retry that would make this negative check fail.

Tighten this named test and its matrix description into a two-invocation scenario: the first mutation has an ambiguous result and leaves a durable prepared operation; a fresh invocation reloads that same operation, performs identifiable reconciliation reads, retains it unchanged when those reads are inconclusive, and makes no second mutation. Assert the stable operation ID, source hash, pending evidence and inspection-before-write trace in addition to the mutation count. Current code then fails for the missing retained state and recovery inspection, while the no-blind-retry invariant remains fully asserted.

## OPTIONAL

1. Keep the high-risk surfaces in the table explicit in implementation reviews: shared transport helpers, action-record readers, locks, caller result shapes and session/worktree cleanup have consumers beyond progress comments. The existing module suites should remain green when optional fields and options are omitted.
2. Make the lifecycle integration coverage explicitly include two successive runs of the same phase/FID and both adopted and separate-worktree execution. The supplied closed failure records describe collapsed ship run identities and unsafe adopt-mode checkout behavior. The plan's exact invocation/run binding and real-worktree fixtures are consistent with their fixes; naming these variants would make regression protection easier to audit.
3. Preserve the current write-before-push close bookkeeping and summary-only post-close behavior while adding terminal preparation/journals. The related close-telemetry issue documents why a second bookkeeping push after the CI-triggering push is unsafe. The design and plan already prohibit an extra push solely for terminal acknowledgment; include that fact in the lifecycle test's observable assertions.

The active knowledge rows about h6 marker survival, tracker-none rendering and behavioral guards are addressed by the marker round-trip probes, all-tracker rendering and behavior-focused guard descriptions. No unacknowledged known-broken pattern was found beyond the two concrete gaps above.

## OUT OF SCOPE

None. Both critical findings are implementation-planning corrections within the accepted design. No source-design change is required.
