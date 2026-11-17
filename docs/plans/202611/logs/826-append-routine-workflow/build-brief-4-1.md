# Brief: group 4 — Provider acceptance and executable release evidence

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
- Group 4: Provider acceptance and executable release evidence — this group
  - TASK 10: Complete all three provider contract and lost-response probes. — open
  - TASK 11: Verify the complete built CLI and nonfatal commenting footprint. — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Complete all three provider contract and lost-response probes.
  - **READ:** `docs/plans/202611/logs/826-append-routine-workflow/spike/github-read.ts`: preserve its read-only contract and reuse only the inspection approach.
  - **CREATE:** `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts`: bounded opt-in disposable-target @live probe from the inventory's new evidence surface.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: replace unverified capability/counting metadata only with actual recorded contract evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: align provider contract fixtures with the observed fields, stable representations and counting semantics; retain all existing behavioral assertions.
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: record the accepted capability/counting/notification evidence alongside the adapter changes, then refresh generated mirrors through upgrade after the final evidence-driven edits.
  - **DEPENDS ON:** 1, 2, 6, 7, 9
  - **DONE WHEN:** Each GitHub/Linear/Jira @live matrix row has authenticated production-path evidence for create/edit/read identity, stable returned representation, markers, external edits, creation-order pagination and complete-body ASCII/non-BMP counting. Lost-response probes exercise bounded success recognition, new-comment fallback, possible duplicates and continued workflow work after exhausted delivery. Record schemas/evidence version, opaque targets, known URLs and pass/unavailable reasons. Adapter metadata, existing fixtures and tracker capability/counting/notification catalog match observed evidence; affected tests pass and upgrade refreshes mirrors. All three remain in scope. Missing live access/evidence remains explicitly incomplete implementation verification, never a runtime comment gate or a fabricated consolidation pass.
  - **TEST FIRST:** n/a — @live (golden) probes plus synchronization of the existing provider fixtures with observed contract evidence; no new unit behavior is introduced here. The probe reaches real provider boundaries on explicitly disposable targets. Unit fixtures cannot prove these contracts, and no automatic CI live lane is introduced.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Verify the complete built CLI and nonfatal commenting footprint.
  - **READ:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: run the implemented module acceptance suite alongside the new integration surface.
  - **READ:** `docs/testing.md`: use existing Unit, Integration and provider-probe entry points.
  - **DEPENDS ON:** 9, 10
  - **DONE WHEN:** Build succeeds and committed `dist/` matches changed engine sources. Named Unit/Integration suites and existing static/drift checks pass; Task 10 provider evidence is recorded honestly. A fresh scratch consumer runs the built `node dist/cli.js` reporting/lifecycle sequence. Inspect the small outbox cache, available receipts, exact fallback bytes and real friction records; confirm clean two-comment behavior when delivery succeeds, and continued substantive work under every comment fault including failed friction. Cleanup/fresh clone can start fresh progress without committed comment source, pending journals or extra pushes. Missing required implementation evidence stays incomplete; no comment-delivery failure changes the workflow result.
  - **TEST FIRST:** n/a — verification and generated-output synchronization only; behavior tests are landed with Tasks 1-9, and provider boundary probes with Task 10.

<!-- bkit:task 11 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Extend provider inspection and mutation contracts. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`
- TASK 2 (group 1, done): Extend section rendering, budgets and deterministic splitting. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`
- TASK 6 (group 2, done): Implement bounded append/new-comment fallback and a nonfatal comment boundary. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/lib.test.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`
- TASK 7 (group 3, done): Wire explicit invocation lifecycle through existing command callers. — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`, `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/repo.ts`, `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/worktrees.ts`
- TASK 9 (group 3, done): Synchronize workflow context, fallback wording and operator documentation. — `.bkit/instructions.md`, `.bkit/core/workflows/bkit-auto.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/cli.md`, `docs/architecture.md`, `docs/testing.md`, `docs/observability.md`, `docs/security.md`, `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Provider inspection and mutation | `.bkit/core/engine/commands/workflow/tracker.ts` | Symbol query for `postCommentOnce`; `rg -n` declarations; read `postComment`, `recentComments`, `JiraSession` transport area; official provider pages above. | Existing three transports, issue fetching and error classification. | EXTEND | Add typed identity/author/order/revision/capability evidence and ID-based editing to the existing clients. |
| Markers, timestamps, body budgets and parts | `.bkit/core/engine/commands/workflow/tracker.ts` | `rg -n` declarations and read marker/splitter contracts; read existing splitter and Jira tests. | `stampMarker`, `markerHashOf`, `splitAt`, `JIRA_COMMENT_LIMIT`. | EXTEND | Preserve the generated first line and standalone payload while adding stable section/part identities and complete-body counting. |
| Progress source cache and action identity | `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/ledgers/status.ts` | Read `actionKey`, `actionHash`, `alreadyDone`, `recordAction`, publisher state and Git-common outbox usage. | Existing publisher, outbox and successful action receipts. | EXTEND | Keep a small exact-source cache and reuse available receipts; cache/receipt loss selects fresh progress without new delivery records. |
| Unit interpretation and recovery fixtures | `.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts`, `.bkit/core/engine/ledgers/status.test.ts` | Locate related test files; read fixture setup, receipt/retry tests and Jira transformed-body tests. | Fake gh/fetch boundaries, real temporary filesystem and git fixtures. | EXTEND | Add feature cases in existing module suites; real provider acceptance remains separate. |
| Authenticated provider contract evidence | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | Read existing `spike/github-read.ts`; `rg --files` found no live tracker suite; reviewed testing's @live boundary rubric. | Existing probe promises read-only behavior and hardcodes the current issue. | NEW | Reason (b): adding mutations would violate that probe's read-only contract. A separate disposable-target probe uses the production publisher/inspection path and records controlled evidence. |

Reuse Inventory rows left out: 1; Architecture entries left out: 2 — read them in docs/plans/202611/826-append-routine-workflow-plan.md § Reuse Inventory and § Architecture & Component Changes.

## Deviations

solve the conflict and continue the workflow

Owner continuation instruction: sorry wait for the test lock to clear then continue

Owner answer to build-decision-3-1.md: A) Fix now. Repair the fixture while preserving all assertions and the 200ms budget, then continue the workflow.

Question: The remaining plan requires live comment create/edit/read checks on disposable Linear and Jira issues. Which disposable issue URL or key may I use for each? Both credentials are present. I’ll continue the fixture repair and local checks while waiting.
Owner answer: create one
