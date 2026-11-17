# Brief: group 2 — Safe append and bounded nonfatal fallback

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
- Group 2: Safe append and bounded nonfatal fallback — this group
  - TASK 4: Add the narrow ownership-aware publication lock. — open
  - TASK 5: Implement central classification, safe append and new-comment selection. — open
  - TASK 6: Implement bounded append/new-comment fallback and a nonfatal comment boundary. — open
- Group 3: Lifecycle integration, diagnostics and host contracts — next
  - TASK 7: Wire explicit invocation lifecycle through existing command callers. — open
  - TASK 8: Record exhausted comment problems as friction best effort. — open
  - TASK 9: Synchronize workflow context, fallback wording and operator documentation. — open
- Group 4: Provider acceptance and executable release evidence — later
  - TASK 10: Complete all three provider contract and lost-response probes. — open
  - TASK 11: Verify the complete built CLI and nonfatal commenting footprint. — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Add the narrow ownership-aware publication lock.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/locks.ts`: reuse exclusive creation and token ownership for a distinct delivery lock.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/locks.test.ts`: prove process serialization and refusal/reclaim boundaries.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** The four named tests pass with real temporary lock files/process identity. Acquisition stops within 30 seconds, only a proven-dead matching same-host owner is reclaimed, and finalizers release only an owned token. Refusal and acquire/release errors return unavailable append eligibility without escaping; the publisher can attempt a new comment. Workflow-lock semantics stay unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `serializes publication for one target and invocation` fails on two publishers both holding the same delivery lock.
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `bounds acquisition and preserves unverifiable owners` fails on an old, remote or inconclusive owner being reclaimed by age, an unbounded wait or a comment-lock error escaping instead of returning unavailable append eligibility.
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `reclaims only a proven dead matching process identity` fails on PID reuse or an alive process being treated as dead.
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `releases only its delivery token on every exit` fails on omitted best-effort release, deleting another owner's lock or a release I/O error escaping the comment-lock boundary.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Implement central classification, safe append and new-comment selection.
  - **UPDATE:** `postForVerb` in `.bkit/core/engine/commands/workflow/tracker.ts`: accept structured purpose and exact invocation association.
  - **UPDATE:** `postCommentOnce` in `.bkit/core/engine/commands/workflow/tracker.ts`: use available source/receipt evidence and append lock, with standalone creation for ineligible routine and separate attention/terminal reports.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: add policy, eligibility and immutable-version cases.
  - **DEPENDS ON:** 1, 2, 3, 4
  - **DONE WHEN:** The eight named tests pass. Eligible routine appends use only cached engine source; available receipts/markers suppress known duplicates and changed output appends without replacing prior text. Attention/final reports attempt standalone creation. Ineligible ownership, failed eligibility reads, missing source, lock trouble or overflow perform no old-comment edit and try a new comment containing only exact current-report bytes. This policy uses the accepted preflight boundary and never requires complete historical state.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `creates then appends routine sections under explicit invocation ownership` fails on every routine report creating a separate comment despite eligible verified ownership.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `deduplicates known reports using available receipts and bounded markers` fails on available success evidence being ignored or inconclusive evidence being fabricated into a successful delivery; lost evidence may permit duplicates.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `appends changed report versions without replacing prior text` fails on altered output overwriting or suppressing its earlier version.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `classifies attention and terminal reports from structured purpose` fails on a routine summary staying standalone, an attention/final report being aggregated, or a misleading title changing those structured policies.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `rolls over after intervening comments external edits and deletion` fails on old progress being edited after the eligibility read detects a reply, changed body or deleted target.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `starts only new source after overflow or missing source` fails on copied old sections or remote-body reconstruction appearing in the next segment.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps standalone fallback exact and unassociated calls conservative` fails on an attempted routine aggregation replacing the standalone fallback bytes, or ambiguous ownership failing to report aggregation-unavailable while using standalone creation.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `uses exact new comment after a failed eligibility read` fails on failed preflight allowing an old-comment edit, omitting the new-comment attempt or changing its standalone report bytes; assert zero edit calls and the bounded create attempt.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Implement bounded append/new-comment fallback and a nonfatal comment boundary.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: contain preparation/cache/receipt/lock/inspection/transport/reconciliation errors, reserve fallback budget and preserve acknowledged success.
  - **UPDATE:** `runGh` in `.bkit/core/engine/commands/lib.ts`: pass an optional remaining deadline through the existing GitHub transport without changing callers that omit it.
  - **UPDATE:** `runTool` in `.bkit/core/engine/commands/lib.ts`: bound the real child with the optional remaining-time limit and retain compatible error classification.
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: prove timeout termination/classification with a real slow child and unchanged behavior without the optional limit.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: inject response/receipt/postflight failures and budget exhaustion at the transport boundary.
  - **DEPENDS ON:** 5
  - **DONE WHEN:** The ten named tests pass. Failed or uncertain append gets at most a bounded success check and then a new-comment attempt; exhausted failures return a failed/uncertain tracker outcome without throwing or changing substantive work. Total network work, including lookup and fallback, stays within 60 seconds, ten pages of 100 and three transport attempts; reserve fallback opportunity and retain shorter timeouts. Acknowledged success keeps its URL after local/postflight errors, multipart loss/duplicates remain nonfatal, and prior uncertainty cannot block attention. Every owned lock receives best-effort release. No durable pending-operation gate is introduced.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `falls back to a new comment after failed or uncertain append` fails on append failure suppressing a new-comment attempt or inconclusive success lookup blocking that attempt; assert exact standalone bytes and bounded attempts.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `recognizes append success within budget without unnecessary resend` fails on available conclusive success evidence being ignored or a human/foreign revision authorizing another append.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `contains exhausted append and create failures without fabricated success` fails on both paths failing and throwing from the comment boundary, fabricating done: true or withholding control from substantive workflow work.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps multipart loss and duplicate handling bounded and nonfatal` fails on a part error blocking the workflow, known receipts being ignored or unacknowledged parts being reported as delivered; assert bounded fallback even when receipt state is missing.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps positive acknowledgment after receipt cache or postflight failure` fails on acknowledged success requesting unnecessary fallback, losing its URL or throwing because local follow-up fails.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reserves new comment opportunity within total delivery budget` fails on lookup/retries consuming all fallback opportunity, total/page/three-attempt caps being exceeded or shorter timeouts being lengthened; use a real slow gh child through runGh/runTool and assert termination and best-effort owned-lock release.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `contains preparation state lock and reconciliation exceptions` fails on any injected comment-specific boundary exception escaping or creating a pending-delivery gate; when a current body exists assert standalone fallback is attempted, otherwise assert control returns.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `attempts independent attention after routine uncertainty` fails on prior routine uncertainty suppressing failure/decision/handover/terminal creation or retaining append eligibility after a new attention comment.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `seals an acknowledged segment after a postflight intervening comment` fails on an observed comment inserted between final preflight and postflight changing acknowledged success to failure, losing its URL, leaving the segment editable or appending the next routine report to it under the accepted chronology boundary.
    - `.bkit/core/engine/commands/lib.test.ts` `bounds a slow child with an optional deadline and classifies timeout` fails on runGh/runTool allowing a real slow child to outlast its supplied deadline or classifying the timeout as a missing binary; verify existing callers that omit the option retain their contract.

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Extend provider inspection and mutation contracts. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`
- TASK 2 (group 1, done): Extend section rendering, budgets and deterministic splitting. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`
- TASK 3 (group 1, done): Add a small exact-source cache and reuse available success receipts. — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`

Reuse Inventory rows left out: 8; Architecture entries left out: 3 — read them in docs/plans/202611/826-append-routine-workflow-plan.md § Reuse Inventory and § Architecture & Component Changes.

## Deviations

continue [$bkit-build](/Users/christian/Documents/GitHub/bkit/.agents/skills/bkit-build/SKILL.md) workflow for #826 and ignore time outs
