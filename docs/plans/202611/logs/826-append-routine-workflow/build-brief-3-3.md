# Brief: group 3 — Lifecycle integration, diagnostics and host contracts

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
- Group 3: Lifecycle integration, diagnostics and host contracts — this group
  - TASK 7: Wire explicit invocation lifecycle through existing command callers. — done
  - TASK 8: Record exhausted comment problems as friction best effort. — done
  - TASK 9: Synchronize workflow context, fallback wording and operator documentation. — done
  - TASK 12: Repair the real slow-child fixture under the owner's recorded authorization. — open
- Group 4: Provider acceptance and executable release evidence — next
  - TASK 10: Complete all three provider contract and lost-response probes. — open
  - TASK 11: Verify the complete built CLI and nonfatal commenting footprint. — open

## The work

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Repair the real slow-child fixture under the owner's recorded authorization.
  - **READ:** `docs/plans/202611/logs/826-append-routine-workflow/build-decision-3-1.md`: controlling owner decision.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: use the existing stable dispatcher or explicit interpreter for the real child fixture, establish successful priming before the slow delivery, and observe actual transport attempts reliably.
  - **DEPENDS ON:** 8, 9
  - **DONE WHEN:** The existing budget test passes under the unit gate, its priming precondition is proven, and every original POST, count, cleanup, nonfatal and latency assertion remains intact. Both 200ms budgets stay unchanged. The tests step owns the authorized fixture repair; the code step reviews the resulting evidence without editing the frozen test. No production deadline, gate, timeout or configuration is weakened.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reserves new comment opportunity within total delivery budget` fails on a fresh executable failing to establish priming state or record actual POST attempts before the existing 200ms deadline; this is an existing-test fixture update, with unchanged assertions reviewed against the group start commit.

<!-- bkit:task 12 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Unit interpretation and recovery fixtures | `.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts`, `.bkit/core/engine/ledgers/status.test.ts` | Locate related test files; read fixture setup, receipt/retry tests and Jira transformed-body tests. | Fake gh/fetch boundaries, real temporary filesystem and git fixtures. | EXTEND | Add feature cases in existing module suites; real provider acceptance remains separate. |

## Deviations

solve the conflict and continue the workflow
