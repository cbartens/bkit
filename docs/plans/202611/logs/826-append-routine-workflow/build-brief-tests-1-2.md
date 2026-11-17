# Brief: group 1 — Provider evidence, rendering and progress cache (tests)

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

- Group 1: Provider evidence, rendering and progress cache — this group
  - TASK 1: Extend provider inspection and mutation contracts. — open
  - TASK 2: Extend section rendering, budgets and deterministic splitting. — open
  - TASK 3: Add a small exact-source cache and reuse available success receipts. — done
- Group 2: Safe append and bounded nonfatal fallback — next
  - TASK 4: Add the narrow ownership-aware publication lock. — open
  - TASK 5: Implement central classification, safe append and new-comment selection. — open
  - TASK 6: Implement bounded append/new-comment fallback and a nonfatal comment boundary. — open
- Group 3: Lifecycle integration, diagnostics and host contracts — later
  - TASK 7: Wire explicit invocation lifecycle through existing command callers. — open
  - TASK 8: Record exhausted comment problems as friction best effort. — open
  - TASK 9: Synchronize workflow context, fallback wording and operator documentation. — open
- Group 4: Provider acceptance and executable release evidence — later
  - TASK 10: Complete all three provider contract and lost-response probes. — open
  - TASK 11: Verify the complete built CLI and nonfatal commenting footprint. — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Extend provider inspection and mutation contracts.
  - **UPDATE:** `postComment` in `.bkit/core/engine/commands/workflow/tracker.ts`: return stable comment identity and mutation evidence through existing transports.
  - **UPDATE:** `recentComments` in `.bkit/core/engine/commands/workflow/tracker.ts`: add complete bounded inspection with creation-order evidence and stable returned-body representation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: cover adapter contract interpretation and safe unavailable evidence.
  - **DONE WHEN:** Actual request/response schemas are verified before tests/code use them. All three adapters expose the verified create/edit/inspect fields, target/comment/author identity, bounded creation ordering and useful revision/fingerprint evidence. The six named tests pass; missing/unstable evidence skips append, and the accepted final-preflight boundary requires no provider atomicity. Adapter tests stay independent of Task 5's publisher. Unsupported runtime edits use new-comment behavior; live consolidation claims require Task 10 evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `returns owned comment identity and stable representation evidence` fails on mutation results losing comment ID, author or returned-body fingerprint.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `selects newest created comment across complete pages` fails on an updated older comment or incomplete page window being treated as newest.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `edits by verified comment id through each existing transport` fails on creating a new comment instead of executing the verified update shape.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `rejects marker preserving external edits` fails on surviving markers hiding a changed returned-body fingerprint.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `seals unavailable or unstable representation evidence` fails on missing metadata or normalization instability being treated as edit eligibility.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `uses accepted final preflight eligibility without provider atomicity` fails on verified current ownership/revision evidence being rejected solely for missing atomic chronology, or on unknown ownership authorizing an edit.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Extend section rendering, budgets and deterministic splitting.
  - **UPDATE:** `splitAt` in `.bkit/core/engine/commands/workflow/tracker.ts`: account for complete encoded bodies and safe continuation parts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: retain first-line generated marker and add versioned run/segment/revision/section markers with original UTC times.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: add boundary, timestamp and marker interpretation cases.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** The five named tests pass; the renderer measures headers/markers, never splits a Unicode code point, preserves available original timestamps and exact standalone fallback bytes. Missing time/state starts the current report safely. An unverified Linear budget cannot inherit another provider's limit; unsupported aggregation selects nonfatal standalone behavior. Part receipts suppress only known delivered parts, with possible loss/duplicates accepted after failures.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `budgets the entire encoded body at limit and overflow` fails on content that fits before headers exceeding the verified provider budget after rendering.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps non BMP code points intact in deterministic parts` fails on a surrogate pair being divided or a retry choosing different part identities.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves generated first line and extracts versioned h6 section markers` fails on aggregate/part markers disappearing in Markdown or Jira HTML interpretation.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reuses original section time without changing duplicate identity` fails on retry timestamps changing report identity or earlier displayed time.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `refuses aggregation with an unverified provider budget` fails on an unknown Linear counting limit being treated as a proven cap.

<!-- bkit:task 2 end -->

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
| Independent attention delivery proceeds after routine uncertainty without a pending-operation gate. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Redacted friction records exhausted comment problems best effort, and logging/diagnostic failures are nonfatal without recursive logging. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 8 |

### Planned tests that already exist

- TASK 1 `.bkit/core/engine/commands/workflow/tracker.test.ts` `returns owned comment identity and stable representation evidence` — exists at `.bkit/core/engine/commands/workflow/tracker.test.ts:409`; update that test in place: add expectations, never remove or loosen one
- TASK 1 `.bkit/core/engine/commands/workflow/tracker.test.ts` `selects newest created comment across complete pages` — exists at `.bkit/core/engine/commands/workflow/tracker.test.ts:442`; update that test in place: add expectations, never remove or loosen one
- TASK 1 `.bkit/core/engine/commands/workflow/tracker.test.ts` `rejects marker preserving external edits` — exists at `.bkit/core/engine/commands/workflow/tracker.test.ts:334`; update that test in place: add expectations, never remove or loosen one
- TASK 2 `.bkit/core/engine/commands/workflow/tracker.test.ts` `budgets the entire encoded body at limit and overflow` — exists at `.bkit/core/engine/commands/workflow/tracker.test.ts:279`; update that test in place: add expectations, never remove or loosen one
- TASK 2 `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps non BMP code points intact in deterministic parts` — exists at `.bkit/core/engine/commands/workflow/tracker.test.ts:293`; update that test in place: add expectations, never remove or loosen one
- TASK 2 `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves generated first line and extracts versioned h6 section markers` — exists at `.bkit/core/engine/commands/workflow/tracker.test.ts:370`; update that test in place: add expectations, never remove or loosen one
- TASK 2 `.bkit/core/engine/commands/workflow/tracker.test.ts` `reuses original section time without changing duplicate identity` — exists at `.bkit/core/engine/commands/workflow/tracker.test.ts:794`; update that test in place: add expectations, never remove or loosen one
