# Brief: group 1 — Explicit identity and canonical ledger contracts (tests)

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
  - TASK 1: Bind managed commands to engine-issued invocation context (deterministic-bookkeeping-4; R1–R7, R21–R22). — open
  - TASK 2: Complete verified ledger attribution before validation (deterministic-bookkeeping-1; R6–R9). — open
  - TASK 3: Expose canonical complete ledger reads (deterministic-bookkeeping-2; R8–R11, R23). — open
- Group 2: Replay-safe writes and shared result rendering — next
  - TASK 4: Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25). — open
  - TASK 5: Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23). — open
  - TASK 6: Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16). — open
- Group 3: Durable continuation and maintained caller contracts — later
  - TASK 7: Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19). — open
  - TASK 8: Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19). — open
  - TASK 9: Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25). — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Bind managed commands to engine-issued invocation context (deterministic-bookkeeping-4; R1–R7, R21–R22).
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: add common explicit invocation resolution (one `--invocation` flag/receipt shared with #836's host pass-through), conflict/path validation and help/spec support without using implicit journal discovery as authority.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: specialize typed workflow invocation issuance/lookup plus explicit standalone audit/utility issuance into the existing outbox; return validated scope and operation/correction inputs without inventing a run/FID.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: additive invocation events and exact run/step occurrence resolution; retain existing reducer contracts. One record per agent call carries run, step and agent (this plan) plus host and configured model at start (#836); reuse whatever #836 has landed and add no second invocation type to `status.jsonl`.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: lifecycle integration/cache rehydration and existing book-root/path output reuse.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.ts`: derive registered number/title and supported step/agent artifact metadata.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.ts`: consume the current #836 authoritative observation contract or explicit unavailable state; no new detector.
  - **READ:** `.bkit/core/engine/render/models.ts`: preserve configured pin semantics separately from observed execution.
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: invocation conflict/path cases.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.test.ts`: issuance and registered step cases.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: real git worktrees/resume boundary.
  - **DEPENDS ON:** None.
  - **DONE WHEN:** Proposed issuance/common flag return concrete workflow or explicitly runless audit/utility context, reject ambiguous/stale/cross-worktree/conflicting mutations, preserve legacy standalone use and pass the three named tests, including setup/no-plan/group/remediation/ship and existing build→debug→build characterization. Runless issuance creates authoritative scoped outbox context and receipt prerequisites without an active run/status/FID.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `issues invocation metadata from an explicit run and registered step` fails on caller-reconstructed paths, missing registered metadata or the standalone audit/utility variant requiring a fabricated run instead of scoped outbox authority.
    - `.bkit/core/engine/commands/lib.test.ts` `rejects stale cross-worktree invocation and conflicting overrides` fails on a managed write accepting another run/worktree or conflicting explicit author/path flags.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes explicit invocation across two real worktrees without identity leakage` fails on resumed commands targeting the other worktree's status/artifact or changed run identity.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Complete verified ledger attribution before validation (deterministic-bookkeeping-1; R6–R9).
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: additive RowBy availability/source/configured-model fields and compatible writer/normalization validation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: optional invocation-aware append context, fill-before-validate and explicit conflicts; retain legacy positional callers.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: actual/unavailable/configured model compatibility.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: legacy writer/conflict behavior.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: actual append from verified delegated invocation.
  - **DEPENDS ON:** 1.
  - **DONE WHEN:** Missing bookkeeping fields fill from verified invocation, actual observed model wins over configured pin, unavailable optional model carries authoritative provenance without blocking, conflicting actor/run fields reject with no ledger effect, old valid callers still pass and the three named tests pass. Table-driven compatibility checks cover old valid rows, new provenance shapes and unknown optional fields through normalization/fold/compact/resume.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts verified unavailable model without confusing configured and observed models` fails on rejecting an authorized unavailable observation or recording a configured pin as runtime execution.
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `rejects conflicting attribution and retains legacy writer restrictions` fails on silently overwriting an asserted actor or allowing an unauthorized kind writer.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `completes missing subagent attribution before a real append` fails on absent workflow/step/agent/model provenance or a rejected valid substantive row.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Expose canonical complete ledger reads (deterministic-bookkeeping-2; R8–R11, R23).
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: detailed line diagnostics around the existing parser and canonical fold, preserving existing callers.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: proposed query verb, key/status filters, deterministic order, snapshot-bound paging and coverage results.
  - **READ:** `.bkit/core/engine/ledgers/compact.ts`: preserve normalized identity/lineage and malformed-history retention.
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: retain specialized ledger-scan relevance semantics.
  - **READ:** `.bkit/core/engine/shared/json.ts`: use existing JSON boundary.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: canonical timestamp/tie/status filtering.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: paging/filter/diagnostic contract.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: real file permissions/malformed/missing coverage and unchanged bytes.
  - **DEPENDS ON:** 2.
  - **DONE WHEN:** Query returns every canonical filtered winner across pages, preserves numeric/equal-ts semantics, rejects stale cursors, diagnoses malformed/invalid/missing/unreadable coverage without history writes, and the three named tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `folds numeric timestamps and equal timestamp ties before filtering` fails on the new query/filter path resurrecting an older ACTIVE row after its newer SUPERSEDED winner is filtered out; include numeric/equal-ts regressions rather than using already-green fold-only assertions as the red gate.
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `pages canonical winners with diagnostics and rejects stale cursors` fails on missing/duplicated page winners, absent line diagnostics or accepting a changed snapshot.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `distinguishes unreadable missing malformed and clean ledger coverage without writing` fails on reporting a clean empty scan for unread input or altering original bytes.

<!-- bkit:task 3 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| issues invocation metadata from an explicit run and registered step | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 1 |
| rejects stale cross-worktree invocation and conflicting overrides | Unit | `.bkit/core/engine/commands/lib.test.ts` | 1 |
| resumes explicit invocation across two real worktrees without identity leakage | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 1 |
| accepts verified unavailable model without confusing configured and observed models | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 2 |
| rejects conflicting attribution and retains legacy writer restrictions | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 2 |
| completes missing subagent attribution before a real append | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 2 |
| folds numeric timestamps and equal timestamp ties before filtering | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 3 |
| pages canonical winners with diagnostics and rejects stale cursors | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| distinguishes unreadable missing malformed and clean ledger coverage without writing | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 3 |
| returns durable append receipt and permits a deliberate same-key update | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 4 |
| reconciles lost append response at each durable checkpoint without duplicate rows | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| serializes concurrent append operations and blocks partial uncertain ledger writes | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| keeps rendered audit report appended rows and tracker draft counts identical | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 6 |
| resumes nonwaiting CI polls without resetting attempts or duplicating retrigger | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 7 |
| exposes no-write correction eligibility only for declared pre-effect validation | Unit | `.bkit/core/engine/commands/lib.test.ts` | 8 |
| resumes corrected substep and blocks exhausted unauthorized or uncertain effects | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 8 |
