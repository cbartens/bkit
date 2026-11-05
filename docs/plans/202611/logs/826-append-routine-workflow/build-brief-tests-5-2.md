# Brief: group 5 — Challenge round 1 findings (tests)

Plan: Consolidated workflow progress implementation plan

## Why and what

### Context & Goals

Consolidate routine workflow reporting in the existing shared tracker publisher. Try appending to the latest eligible engine-owned progress comment, then try a new comment when append is unavailable, failed or uncertain. Record exhausted comment problems as friction best effort and continue the workflow. A small source cache and available receipts support safe appends and duplicate suppression; comment state never becomes a delivery gate. This plan covers WS-1 through WS-5 together. Workstream dependencies are WS-3 → WS-1/WS-2, WS-4 → WS-2/WS-3, and WS-5 → WS-1/WS-2/WS-3/WS-4. No prerequisite plan is required.

**Related Issues:** None. The input's design references only the current issue, [#826 — Append routine workflow step updates to one comment per run (open)](https://github.com/cbartens/bkit/issues/826).

### Narrative

I can follow a workflow's progress without routine reports overwhelming the issue conversation. Decisions, failures, handovers and completion remain separate, visible comments, and replies already visible when bkit checks the issue keep their place in the conversation. If a tracker request has an uncertain outcome, bkit tries a new comment and keeps the workflow moving; a missing or duplicate report does not stop my work.

### Success Criteria

1. A clean uninterrupted build produces at most two bkit comments when progress fits one comment, identity and source state are available, and delivery succeeds without fallback or an intervening comment: progress and completion.
2. Decision pauses, failures, handovers and final close / Create PR reports each attempt a separate new comment; exact retries are deduplicated when existing evidence permits.
3. Before an append edit, the engine establishes that its own target is the newest created comment and still matches its saved revision evidence. An intervening comment, external edit or inconclusive check sends the current report to a new comment; the remaining read/write race is accepted.
4. Identical reports are deduplicated where saved receipts or bounded marker lookup establish prior delivery. Failed or uncertain append attempts fall back to a new comment. If all comment attempts fail, friction is recorded best effort and the workflow continues successfully with respect to commenting.
5. GitHub, Linear and Jira use their verified comment budgets, sections show their original UTC time when available, and auto and its dispatched phase own separate progress state. Missing or invalid comment state and tracker edit-notification limitations are diagnosed without stopping the workflow.

The owner accepted the final-preflight race and possible duplicate reports. The later best-effort clarification controls earlier conflicting guarantees: all comment-specific preparation, cache, receipt, lock, inspection, transport, reconciliation and friction failures are nonfatal. Provider verification governs implementation claims; it never becomes a runtime workflow comment gate.

### Out of Scope

None. The plan implements the whole parent design. Its stated non-goals remain constraints on the solution: manual work comments keep their existing behavior, agents keep create-only fallback, and no new coordination service, credential path or configuration surface is introduced. No work needed by a success criterion is deferred.

## Where it fits

- Group 1: Provider evidence, rendering and progress cache — done
  - TASK 1: Extend provider inspection and mutation contracts. — done
  - TASK 2: Extend section rendering, budgets and deterministic splitting. — done
  - TASK 3: Add a small exact-source cache and reuse available success receipts. — done
- Group 2: Safe append and bounded nonfatal fallback — done
  - TASK 4: Add the narrow ownership-aware publication lock. — done
  - TASK 5: Implement central classification, safe append and new-comment selection. — done
  - TASK 6: Implement bounded append/new-comment fallback and a nonfatal comment boundary. — done
- Group 3: Lifecycle integration, diagnostics and host contracts — done
  - TASK 7: Wire explicit invocation lifecycle through existing command callers. — done
  - TASK 8: Record exhausted comment problems as friction best effort. — done
  - TASK 9: Synchronize workflow context, fallback wording and operator documentation. — done
  - TASK 12: Repair the real slow-child fixture under the owner's recorded authorization. — done
- Group 4: Provider acceptance and executable release evidence — done
  - TASK 10: Complete all three provider contract and lost-response probes. — done
  - TASK 11: Verify the complete built CLI and nonfatal commenting footprint. — done
- Group 5: Challenge round 1 findings — this group
  - TASK 13: A lost append response lets the next report overwrite an intervening human correction. — open
  - TASK 14: Auto startup with a PR link prematurely terminates its routine progress segment. — open
  - TASK 15: A malformed Jira credential is exposed in live-probe diagnostics. — open

## The work

<!-- bkit:task 13 start -->
- [ ] **TASK 13:** A lost append response lets the next report overwrite an intervening human correction.
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.ts:1817` · **Round:** 1
  - **DONE WHEN:** Recognizing a delivered section after a lost response preserves its successful outcome and known URL, but does not adopt an altered remote revision as future append authority. Retain append eligibility only when the recovered representation is proven to match the intended engine aggregate; otherwise seal the segment and start the next routine report in a new comment. A marker-preserving human correction survives that next report. The current recognition branch accepts ID, author and section marker, then saves the locally intended source with the human-edited fingerprint; its postflight sees the same edited revision and retains it. The existing recognition test has no intervening edit or third report. An independently rerun local built-export reproduction returned three successes, one comment, and correction-preserved true after recognition but false after the third report. This violates `docs/security.md` § Workflow comment ownership and `docs/architecture.md` § Tracker reporting boundary, beyond the accepted final-preflight race.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves a human correction after lost append recognition and a later report` fails on a marker-preserving edit between a lost append acknowledgment and recognition being overwritten by a subsequent routine report; assert acknowledged delivery remains successful, the correction remains intact, and the later report creates a fresh comment without editing the corrected segment.
<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->
- [ ] **TASK 14:** Auto startup with a PR link prematurely terminates its routine progress segment.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:1084` · **Round:** 1
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: add optional `issues comment --purpose=routine|attention|terminal`; retain existing kind-based classification when omitted and use explicit terminal purpose for ended-run identity.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: pass `--purpose=terminal` on final Create PR reporting, then synchronize the CLI catalog and generated host contracts.
  - **DONE WHEN:** Ordinary PR-link metadata does not classify a report as terminal or select an ended-run identity. The actual auto startup command with `--pr-number`, followed by Dispatch in the same explicit session, shares one routine progress comment; an explicitly identified final Create PR report remains a separate terminal comment. Propagate that explicit completion purpose through the build caller and generated host contracts. The command currently treats every `prNumber` as terminal even though `.bkit/core/workflows/bkit-auto.md:126` uses it on Start Workflow. An independently rerun built-command reproduction returned two successful creates, no edit and no startup progress marker. The existing clean-build integration cases cover final PR reporting, but not this auto startup shape. This violates `.bkit/trackers.md` § Workflow comment delivery and the plan's routine-startup acceptance scenario.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps auto startup with PR metadata and dispatch in one progress comment` fails on the real startup and Dispatch CLI flag shapes creating two comments despite the same valid session; assert the routine aggregate contains both reports and a later explicit completion remains separate.
<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->
- [ ] **TASK 15:** A malformed Jira credential is exposed in live-probe diagnostics.
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts:35` · **Round:** 1
  - **DONE WHEN:** Every error diagnostic emitted by the live contract probe redacts configured tracker credential values before truncation and JSON serialization. The direct Jira schema-discovery fetch must not print the Authorization value when header validation fails. Preserve the diagnostic stage, useful non-secret failure classification, opt-in target checks and existing provider evidence. This enforces `docs/security.md` § Secrets Management and the plan's Security & Privacy requirement for redacted build evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `redacts malformed Jira authorization from live probe diagnostics` fails on the actual probe's `--discover` execution emitting a synthetic Jira token with an embedded newline in stdout or stderr; exercise the real header-validation failure without network traffic, including a long token whose unredacted message would be truncated, and assert the failure stage remains observable.
<!-- bkit:task 15 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Stable IDs, author, newest-created ordering and complete pagination; reject missing/inconsistent evidence. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Provider create/edit/read shapes and stable returned-representation fingerprints, including marker-preserving external edits. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Missing ownership/revision evidence selects new-comment behavior; the accepted preflight boundary does not require provider atomicity. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Header-inclusive budgets, exact limit, overflow, non-BMP text and deterministic part receipts. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| Generated first-line marker, versioned h6 markers and original timestamp survive rendering/parsing. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| Small exact-source cache, stable original-body identity and legacy success receipts support safe append/dedupe when available. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 3 |
| Missing/corrupt/version-mismatched or conflicting cache and receipt failures invalidate append without blocking publication or workflow work. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 3 |
| Routine create/append and duplicate/changed reports use available source and receipts without requiring historical delivery state. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Structured classification leaves decision/failure/handover/final reports separate and exact retries deduplicated. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Human replies/edits, deletion, missing state and unsupported evidence roll over with only new content. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Failed eligibility read performs no append edit and attempts a new comment with exact current-report bytes. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Failed/uncertain append uses bounded success recognition, then new-comment fallback; exhausted append/create failure preserves workflow continuation. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Partial multipart delivery and missing receipts permit loss/duplicates without blocking; known acknowledged delivery stays successful. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| A postflight intervening comment preserves success/URL and invalidates future append eligibility under the accepted race boundary. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Global network/page/attempt limits include a real slow GitHub child, reserve fallback opportunity and release an owned lock best effort. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| reserves new comment opportunity within total delivery budget | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 12 |
| Independent attention delivery proceeds after routine uncertainty without a pending-operation gate. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Explicit startup/run association, separate auto/phase ownership and missing state across cleanup/fresh clone safely create fresh progress. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| Faults in preparation/cache/receipt/lock/transport/reconciliation and engine/MCP fallback preserve successful or failed substantive step outcomes. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| Redacted friction records exhausted comment problems best effort, and logging/diagnostic failures are nonfatal without recursive logging. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 8 |
| Clean build-shaped CLI run leaves two comments; interruption, resume, old receipts, issue-less paths and unchanged fallback retain the selected contract. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| preserves a human correction after lost append recognition and a later report | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 13 |
| keeps auto startup with PR metadata and dispatch in one progress comment | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 14 |
| redacts malformed Jira authorization from live probe diagnostics | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 15 |

## Deviations

solve the conflict and continue the workflow

Owner continuation instruction: sorry wait for the test lock to clear then continue

Owner answer to build-decision-3-1.md: A) Fix now. Repair the fixture while preserving all assertions and the 200ms budget, then continue the workflow.

Question: The remaining plan requires live comment create/edit/read checks on disposable Linear and Jira issues. Which disposable issue URL or key may I use for each? Both credentials are present. I’ll continue the fixture repair and local checks while waiting.
Owner answer: create one
