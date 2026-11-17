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
  - TASK 10: Record invocations and invocation-bound engine calls in the run's status log (owner decision, build decision 1; closes Task 1's status-authority and journal gaps). — done
  - TASK 11: Keep invocation issuance inside the issuing checkout and out of step timing (owner decision, build decision 2; closes verify attempt 5 gaps). — open
- Group 2: Replay-safe writes and shared result rendering — next
  - TASK 4: Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25). — open
  - TASK 5: Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23). — open
  - TASK 6: Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16). — open
- Group 3: Durable continuation and maintained caller contracts — later
  - TASK 7: Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19). — open
  - TASK 8: Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19). — open
  - TASK 9: Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25). — open

## The work

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Keep invocation issuance inside the issuing checkout and out of step timing (owner decision, build decision 2; closes verify attempt 5 gaps).
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: `status invocation` refuses a `--file` outside the issuing checkout's top folder before any write, so an invocation row never lands in another worktree's `status.jsonl` and an id is never tied to another worktree's run.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.ts`: add the `invocation` row type to `MARK_ROWS` so a step's minutes start at the previous step's row, not at an invocation row.
  - **DEPENDS ON:** 10.
  - **DONE WHEN:** `status invocation` with a `--file` from another worktree exits non-zero and changes no file, an id issued for one worktree's run is not accepted from another, step minutes ignore `invocation` rows, and the two tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `refuses to issue an invocation into a status file outside the issuing checkout` fails on the command exiting 0 or appending a row to the other worktree's log.
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `starts a step clock at the previous step row, not at an invocation row` fails on the step reporting fewer minutes than it took.

<!-- bkit:task 11 end -->

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/commands/workflow/run-facts.ts`, `.bkit/core/engine/ledgers/status.ts`

- Extend existing `status row --type=invocation --file --workflow` with validated registered step/agent inputs and engine-generated ID. Return complete paths, step number/title, run/attempt/group and exact agent invocation inputs. Add proposed explicit standalone audit/utility issuance to this same handler, taking declared step/allowed agent and canonical input/output scope instead of FID/status/run. Persist standalone authority atomically under the existing outbox invocation directory and return its operation/correction inputs. Add common proposed `--invocation` through dispatcher specs/help; conflicting overrides fail before effects.
- Validate workflow status identity or the explicit standalone record, canonical cwd/book-root and allowed actor/step/scope before mutation. Invocation ID is correlation, not permission. Legacy standalone calls retain existing explicit flag-based semantics; migrated audit and utility prompts must issue standalone bindings before receipt-aware append rather than silently choose legacy mode. Optional journaling cannot authorize writes.
- Cache lookup under git-common outbox; status event is durable authority. Bind to stable run-start identity and step occurrence, not mutable latest-row selection. Resume checks exact run occurrence; setup/no-plan/remediation/group/ship paths all use the current lifecycle/path functions.
- Consume observed host/model via existing run-facts/#836 hook; absent optional observation is explicit and nonblocking. Never obtain actual model by copying prompt frontmatter.
