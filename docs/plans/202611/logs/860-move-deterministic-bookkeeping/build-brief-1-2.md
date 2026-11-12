# Brief: group 1 — Explicit identity and canonical ledger contracts

Plan: Deterministic Bookkeeping Implementation Plan

## Why and what

### Context & Goals

Move deterministic metadata, serialization and replay accounting into existing engine paths. The eight audit findings define the scope. The owner approved the six architectural defaults on 2026-11-05 and requested direct planning. The engine already provides ledger envelopes, status folds, counters, artifact header parsing/seeding, tracker deduplication and summaries; this plan extends those paths.

**Related Issues:**

- [#750 — Workflow optimisation (open)](https://github.com/cbartens/bkit/issues/750).
- [#836 — Record which host and model ran each workflow, on every host (open)](https://github.com/cbartens/bkit/issues/836).
- [#826 — Append routine workflow step updates to one comment per run (open)](https://github.com/cbartens/bkit/issues/826).
- [#860 — Move deterministic bookkeeping and safe recovery into the engine (open)](https://github.com/cbartens/bkit/issues/860).

### Narrative

Agents provide findings, evidence and judgments. The engine owns deterministic metadata, serialization, derived counts, durable operation state and safe replay.

### Success Criteria

1. **deterministic-bookkeeping-1:** Resolve workflow, step, subagent and actual model from verified invocation context before validation. Reuse the host/model capture contract of the existing issue. Keep configured model distinct from observed model. Define explicit missing/ambiguous-context handling without inventing attribution. Reject conflicting or unauthorized authorship rather than silently overwriting it.
2. **deterministic-bookkeeping-2:** Expose an engine-owned, read-only ledger query using the canonical parser/folder, with key/status filters, deterministic timestamp/tie handling, complete paging and structured malformed-line diagnostics. Never represent unread or malformed content as an empty/clean scan. Route prompts through it instead of bespoke Python/jq helpers.
3. **deterministic-bookkeeping-3:** Provide an engine-owned artifact serializer/envelope and compute redundant totals/booleans from structured findings where the contract is deterministic. Preserve evidence-dependent judgements and special verdict rules as explicit inputs. Validate that the envelope agrees with the body before completing the step, without a model round trip for formatting alone.
4. **deterministic-bookkeeping-4:** Bind commands to an explicit durable run/invocation identity, and derive registered step metadata and paths there. Resolve ambiguity explicitly when multiple runs/worktrees exist; validate overrides and scope. Cover start, resume, no-plan conversion, task groups, remediation and ship's bookkeeping root. Do not assume the most recent global run is the caller.
5. **deterministic-bookkeeping-5:** Persist CI handoff phase, poll observations, attempt count, cumulative errors, target head/PR/repository and retrigger identity in engine state. A poll command should record its own observation and derive the next action, preserving state across compaction/resume and preventing stale evidence from another head or run.
6. **deterministic-bookkeeping-6:** Accept structured audit findings once, then derive stable report-local IDs, severity totals, deterministic report/ledger/comment metadata and source links. Expose candidate prior-key matches, while retaining human/agent judgement for semantic equivalence, closure evidence and issue grouping. Coordinate tracker publication with the existing progress-comment issue.
7. **deterministic-bookkeeping-7:** Add scoped replay/reconciliation support for bookkeeping writes and return a durable receipt describing effects. Reuse existing engine-action primitives where appropriate. Keep a deliberate same-key update distinct from replay; do not deduplicate all same-key or equal-content events globally. Inspect uncertain outcomes before retrying. No duplicate-write incident was reproduced in this audit.
8. **deterministic-bookkeeping-8:** Add shared wording permitting bounded correction after a guaranteed no-write rejection, engine deterministic fill first, verified continuation at the same substep and explicit reconciliation for uncertain effects. Preserve authorization, named gates, special recovery routes and finite retry accounting.

### Out of Scope

None of the eight findings is excluded or deferred. The issue's existing non-goals remain boundaries: no semantic finding/acceptance/test-result inference, malformed-history repair, new host telemetry collector, new progress-comment system or migration. These do not supply a required acceptance behavior and create no new deferral.

## Where it fits

- Group 1: Explicit identity and canonical ledger contracts — this group
  - TASK 1: Bind managed commands to engine-issued invocation context (deterministic-bookkeeping-4; R1–R7, R21–R22). — done
  - TASK 2: Complete verified ledger attribution before validation (deterministic-bookkeeping-1; R6–R9). — done
  - TASK 3: Expose canonical complete ledger reads (deterministic-bookkeeping-2; R8–R11, R23). — done
  - TASK 10: Record invocations and invocation-bound engine calls in the run's status log (owner decision, build decision 1; closes Task 1's status-authority and journal gaps). — open
- Group 2: Replay-safe writes and shared result rendering — next
  - TASK 4: Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25). — open
  - TASK 5: Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23). — open
  - TASK 6: Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16). — open
- Group 3: Durable continuation and maintained caller contracts — later
  - TASK 7: Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19). — open
  - TASK 8: Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19). — open
  - TASK 9: Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25). — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Record invocations and invocation-bound engine calls in the run's status log (owner decision, build decision 1; closes Task 1's status-authority and journal gaps).
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: additive invocation event for a workflow-mode invocation, with exact run/step/agent/group/attempt resolution; status is the authority and the outbox receipt is an index rebuilt from it. Add no second invocation type.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: `status invocation` appends that event to the run's own `status.jsonl` and writes the receipt from it; a lookup whose receipt is missing rebuilds it from the event.
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: `runCommand` writes the `engine-call` row for invocation-bound calls again, into the issuing run's own status log only, never another worktree's.
  - **UPDATE:** `docs/observability.md`: `[bkit-telemetry]` states that invocation-bound calls write their `engine-call` row to the issuing run's status log.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.test.ts`: the owner approved replacing the assertion in `issues invocation metadata from an explicit run and registered step` that issuing changes no run state with: the issuing run's own status log gains the invocation event. Keep every other expectation of that test.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: the owner approved replacing the assertion in `resumes explicit invocation across two real worktrees without identity leakage` that the status bytes stay unchanged with: only the issuing run's own status log gains the invocation event and `engine-call` rows, and the other worktree's files stay byte-identical. Keep every other expectation of that test.
  - **DEPENDS ON:** 1.
  - **DONE WHEN:** A workflow-mode invocation is an additive event in the run's `status.jsonl` and the outbox receipt is rebuilt from it when missing; invocation-bound commands write their `engine-call` row so `bkit completeness check` sees them; nothing is written to another worktree's status or artifacts; runless audit/utility issuance still creates no run, status file or `docs/` directory; `docs/observability.md` matches; and the three tests below pass together with the two updated Task 1 tests.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `records the issued invocation in the run status log and rebuilds a deleted receipt` fails on issuance leaving `status.jsonl` unchanged or a deleted receipt making a live run's id unresolvable.
    - `.bkit/core/engine/commands/lib.test.ts` `writes the engine-call row for an invocation-bound command` fails on `runCommand` skipping the journal row when `--invocation` is present.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `keeps invocation events and engine-call rows inside the issuing worktree after receipt loss` fails on a missing event or row in the issuing worktree's status log, any write to the other worktree, or a resumed command failing after the receipt is deleted.

<!-- bkit:task 10 end -->

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/commands/workflow/run-facts.ts`, `.bkit/core/engine/ledgers/status.ts`

- Extend existing `status row --type=invocation --file --workflow` with validated registered step/agent inputs and engine-generated ID. Return complete paths, step number/title, run/attempt/group and exact agent invocation inputs. Add proposed explicit standalone audit/utility issuance to this same handler, taking declared step/allowed agent and canonical input/output scope instead of FID/status/run. Persist standalone authority atomically under the existing outbox invocation directory and return its operation/correction inputs. Add common proposed `--invocation` through dispatcher specs/help; conflicting overrides fail before effects.
- Validate workflow status identity or the explicit standalone record, canonical cwd/book-root and allowed actor/step/scope before mutation. Invocation ID is correlation, not permission. Legacy standalone calls retain existing explicit flag-based semantics; migrated audit and utility prompts must issue standalone bindings before receipt-aware append rather than silently choose legacy mode. Optional journaling cannot authorize writes.
- Cache lookup under git-common outbox; status event is durable authority. Bind to stable run-start identity and step occurrence, not mutable latest-row selection. Resume checks exact run occurrence; setup/no-plan/remediation/group/ship paths all use the current lifecycle/path functions.
- Consume observed host/model via existing run-facts/#836 hook; absent optional observation is explicit and nonblocking. Never obtain actual model by copying prompt frontmatter.

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/ledgers/journal.ts`, `.bkit/core/engine/commands/workflow/locks.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`

- Extend engine-action primitives with a separate strict ledger-operation record/reader. Keep `alreadyDone` changed-hash tracker behavior unchanged. Reuse/move only the low-level exclusive-create primitive into the existing leaf; retain locks caller API and avoid command-to-command import cycles.
- Engine issues an operation ID for the explicit invocation/target/sub-step through the invocation response or validated invocation update; it never derives it from a substantive ledger key. Persist prepared descriptor/receipt atomically in git-common outbox and typed status references. A logical recovery scope groups corrected candidates; each candidate ID/hash is immutable.
- Hold per-ledger lock while validating lineage, preparing exact bytes/offset/prefix hash, appending and fsyncing, and marking completion. Every engine writer to APPEND_LEDGERS targets must share this cycle-free leaf lock or visibly refuse pending ownership, including journal `appendFrictionRow` reached from dispatcher failures and owner pauses, plus compact/union and all other direct writers found in Task 4. Preserve journal append-only recurrence and optional telemetry error policy; a required receipt write remains required. No command imports into journal are allowed.
- Crash after preparation but before append: prove expected target prefix/length and append once. Crash after append before completed receipt: verify exact prepared block at offset and return same receipt. Partial block, unexpected rewrite, lock owner uncertainty or missing required state: report uncertain and block affected mutation without truncation, inventing completion or minting a fresh bypass operation. Release only owned locks; stale workflow-lock heuristics do not reclaim active append ownership. Receipt/state writes are required effects, never optional telemetry.

Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in docs/plans/202611/860-move-deterministic-bookkeeping-plan.md § Reuse Inventory and § Architecture & Component Changes.
