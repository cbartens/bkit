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
  - TASK 7: Wire explicit invocation lifecycle through existing command callers. — open
  - TASK 8: Record exhausted comment problems as friction best effort. — open
  - TASK 9: Synchronize workflow context, fallback wording and operator documentation. — open
- Group 4: Provider acceptance and executable release evidence — next
  - TASK 10: Complete all three provider contract and lost-response probes. — open
  - TASK 11: Verify the complete built CLI and nonfatal commenting footprint. — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Wire explicit invocation lifecycle through existing command callers.
  - **UPDATE:** `RunContext` in `.bkit/core/engine/commands/lib.ts`: carry structured publishing association without generic active-run inference.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/repo.ts`: provide explicit session invocation association without making cache availability a workflow prerequisite.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: accept explicit session/invocation association on fileless workflow posts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: pass step/group/attempt and exact run ownership to the common publisher.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: associate exact run/terminal purpose, contain comment-specific errors and keep close/cleanup independent of comment outcomes.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: retain separate invocation ownership across setup while allowing fresh progress after cache loss or cleanup.
  - **CREATE:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`: real consumer/CLI lifecycle coverage from the inventory's new integration surface.
  - **DEPENDS ON:** 3, 6
  - **DONE WHEN:** The eight named integration tests pass against real temporary files/git/worktrees and fresh CLI processes, covering successive same-phase/FID runs, adopted and separate-worktree execution, startup association, auto/phase separation, post-close response loss, cleanup and fresh clones. Missing state safely starts fresh progress. Inject failures at every comment boundary and assert substantive success stays success, substantive failure stays failure, and later work/close/cleanup continues. No comment state must be committed, no receipt is awaited and no extra bookkeeping push is introduced solely for comments. Legacy receipts, issue-less skips and exact fallback remain compatible.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `associates startup and run across restart or starts fresh safely` fails on restart appending under foreign ownership or missing session/cache preventing the next workflow operation.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps successive phase runs separate in adopted and worktree execution` fails on two same-phase/FID runs sharing another invocation's comment or association failure blocking execution.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps auto and phase progress separate across worktrees` fails on phase progress using auto's identity or unavailable transfer/cache preventing phase work.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `continues close and cleanup after lost terminal response` fails on close/removal waiting for comment acknowledgment, requiring a terminal journal or adding a bookkeeping push solely for comment recovery; preserve substantive write-before-push ordering.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `starts fresh progress after cleanup and on a fresh clone` fails on missing old cache blocking publication/workflow work or guessing an old comment from unrelated state.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault` fails on injected preparation/cache/receipt/lock/read/append/create/reconciliation/diagnostic faults changing the step verdict or preventing its next work; assert control continues for both successful and failed substantive operations.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps clean build progress and completion to two comments` fails on a CLI build-shaped uninterrupted successful-delivery sequence creating routine comments separately under the accepted owner contract.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves legacy receipts issue less skips and exact fallback through resume` fails on old acknowledged reports reposting, issue-less runs invoking transport, or fallback body bytes changing after interruption.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Record exhausted comment problems as friction best effort.
  - **UPDATE:** `TrackerOutcome` in `.bkit/core/engine/commands/workflow/tracker.ts`: report append/new-comment/dedupe/uncertain/lost outcomes while preserving done/skipped/fallback meanings.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: best-effort append redacted friction using existing ledger helpers, authorized orchestrator fields and a stable recurrence key; contain logging and warning failures without recursion.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: assert real local friction records, exhausted failure continuation and sensitive-data exclusion.
  - **DEPENDS ON:** 6, 7
  - **DONE WHEN:** The four named tests pass. Exhausted append/create, source/cache, receipt, lock, inspection and reconciliation problems attempt a `friction` row through the existing ledger mechanism, with authorized author fields, stable key, redacted reason, phase and known URL. Friction append/diagnostic failures produce at most a brief warning when possible, never recurse or escape, and never alter substantive results. Existing tracker output distinguishes attempted fallback, established delivery and lost/uncertain reports without a new outcome ledger or mandatory persistent counters.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `records redacted exhausted comment friction with authorized fields` fails on an exhausted comment problem lacking the best-effort ledger append, using invalid author fields or leaking bodies/credentials/personal data; inspect real local row bytes.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `continues after friction and diagnostic writes fail without recursion` fails on a read-only/missing ledger or warning failure escaping, retrying recursively or withholding control from the workflow.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `distinguishes fallback attempts from known delivery and lost reports` fails on attempted fallback being reported as delivered or an uncertain/lost comment being fabricated into success.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `logs cache receipt lock and reconciliation problems with stable recurrence identity` fails on any exhausted comment-state boundary omitting its friction attempt or recurring reasons creating unrelated keys; logging itself stays optional and nonfatal.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Synchronize workflow context, fallback wording and operator documentation.
  - **UPDATE:** `.bkit/instructions.md`: change the shared Comments clause through its authoritative source and sync tooling.
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: pass explicit invocation, keep phase identity separate and make comment/MCP/friction failures nonfatal.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: pass invocation/purpose and make all provider comment/fallback blocks and gates attempted-not-successful.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: apply the same nonfatal context/fallback/gate policy in normal and soak paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: apply the same nonfatal context/fallback/gate policy.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: apply the same nonfatal context/fallback/gate policy.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: apply the same nonfatal context/fallback/gate policy.
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: record capability/counting/notification contracts and engine-owned progress behavior.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: record the matching lifecycle and recovery contract.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerate CLI contract prose/spec outputs for new context and delivery outcomes.
  - **UPDATE:** `docs/architecture.md`: record the small optional progress cache and exact invocation ownership.
  - **UPDATE:** `docs/testing.md`: register the integration surface and explicit disposable-target @live recipe.
  - **UPDATE:** `docs/observability.md`: document redacted best-effort friction, failed logging, bounded append/new-comment fallback and accepted lost/duplicate reports.
  - **UPDATE:** `docs/security.md`: document ownership/validation and sensitive-source controls.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`: assert effective rendered invocation and fallback contracts for all hosts/trackers.
  - **DEPENDS ON:** 7, 8
  - **DONE WHEN:** The three named guard tests pass. Every workflow/provider block, including normal/soak and Failure Path reporting, treats comment/MCP fallback/friction errors as bounded nonfatal attempts. Gates require an attempt, not successful delivery; unrelated substantive failures still route normally. The exact standalone `commentFile` remains create-only for agents. Shared-clause/CLI tooling and all Documentation Updates rows match, then upgrade renders Claude, Cursor, Codex, Antigravity and opencode with github/linear/jira/none coverage. Task 10 owns final evidence-driven metadata/catalog/fixture alignment and mirror refresh.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` `renders explicit invocation association at fileless and lifecycle posting sites` fails on any host/tracker workflow losing the association required by the publisher.
    - `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` `renders engine progress authority with verbatim create only agent fallback` fails on rendered instructions granting an agent comment-edit authority or losing the exact fallback file/new-comment contract.
    - `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` `renders nonfatal comment fallback friction and attempted delivery gates` fails on any host/tracker workflow routing comment/MCP/logging failure to Failure Path, requiring successful delivery or waiting for comment-state recovery; preserve substantive error handling.

<!-- bkit:task 9 end -->

### Earlier tasks this group depends on

- TASK 3 (group 1, done): Add a small exact-source cache and reuse available success receipts. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`
- TASK 6 (group 2, done): Implement bounded append/new-comment fallback and a nonfatal comment boundary. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/lib.test.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`

Reuse Inventory rows left out: 11; Architecture entries left out: 8 — read them in docs/plans/202611/826-append-routine-workflow-plan.md § Reuse Inventory and § Architecture & Component Changes.
