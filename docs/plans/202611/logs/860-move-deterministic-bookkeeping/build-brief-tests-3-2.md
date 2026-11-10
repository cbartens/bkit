# Brief: group 3 — Replay-safe writes and shared result rendering (tests)

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

- Group 1: Explicit identity and canonical ledger contracts — done
  - TASK 1: Bind managed commands to engine-issued invocation context (deterministic-bookkeeping-4; R1–R7, R21–R22). — done
  - TASK 2: Complete verified ledger attribution before validation (deterministic-bookkeeping-1; R6–R9). — done
  - TASK 3: Expose canonical complete ledger reads (deterministic-bookkeeping-2; R8–R11, R23). — done
  - TASK 10: Record invocations and invocation-bound engine calls in the run's status log (owner decision, build decision 1; closes Task 1's status-authority and journal gaps). — done
  - TASK 11: Keep invocation issuance inside the issuing checkout and out of step timing (owner decision, build decision 2; closes verify attempt 5 gaps). — done
- Group 2: Close the group 1 quality gate — done
  - TASK 12: Retype the one planned test call that fails the slop check (owner decision, build decision 3; closes the group 1 quality-gate gap). — done
- Group 3: Replay-safe writes and shared result rendering — this group
  - TASK 4: Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25). — open
  - TASK 5: Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23). — open
  - TASK 6: Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16). — open
- Group 4: Durable continuation and maintained caller contracts — next
  - TASK 7: Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19). — open
  - TASK 8: Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19). — open
  - TASK 9: Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25). — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25).
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: strict ledger operation/receipt helpers on existing action key/hash primitives, preserving tracker changed-hash behavior; cycle-free exclusive-create helper. This is the single lock-and-confirm helper (append, flush, read-back, interrupted-write check) shared by `status.jsonl` and the `docs/*.jsonl` ledgers; extend #836's boundary if it landed first.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/locks.ts`: delegate only low-level exclusive creation while preserving workflow lock public behavior and ownership.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: engine-issued operation preparation (the same operation context that #836 passes through `commitOwnSet`, `ownPathCommit`, `commitBookkeeping` and `retriggerCommit`; issue the ID into that context or read it from there), immutable request hash, target lock, exact prepared bytes, fsync/completion receipt and explicit reconciliation; make union/compact coordinate pending target effects.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.ts`: coordinate appendFrictionRow and its dispatcher/owner-pause callers with the shared cycle-free target lock; retain append-only recurrence and optional telemetry failure policy; inventory and coordinate all other direct managed-target writers.
  - **READ:** `.bkit/core/engine/commands/workflow/tracker.ts`: keep existing changed-body action contract.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.test.ts`: separate strict ledger collision policy from generic action hash reuse.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: replay and later update/lineage behavior.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: multi-process writers and interrupted exact append checkpoints with real files.
  - **DEPENDS ON:** 1, 2, 3.
  - **DONE WHEN:** Same operation/hash returns its original minted effect once, conflicting hash refuses, new operation permits later same-key history with correct lineage, all engine target writers including direct journal recurrence serialize or visibly refuse ownership, and each interrupted checkpoint reconciles or blocks uncertainty without truncation. Real two-process friction tests pause after preparation, exercise same-key and distinct-key journal/owner-pause writes, then assert exact bytes, folded recurrence, receipt offsets and intended rows. Existing tracker/locks behavior and append-only history remain valid, and the four named tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/status.test.ts` `preserves tracker changed-hash actions while rejecting ledger operation collisions` fails on applying ledger collision policy to intentional tracker edits or allowing ledger ID/hash conflict.
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `returns durable append receipt and permits a deliberate same-key update` fails on replay minting another ts/event or suppressing new-operation lineage.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `reconciles lost append response at each durable checkpoint without duplicate rows` fails on a second append after complete durable bytes or a missing original receipt/minted row.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `serializes concurrent append operations and blocks partial uncertain ledger writes` fails on real competing same-key/distinct-key journal or owner-pause writes invalidating prepared offsets/recurrence/receipts, interleaved lineage, compact/union rewriting pending bytes, unsafe reclaim or retry/truncation of a partial effect; use two dispatcher processes and inspect actual bytes and folded winners.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23).
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: structured `stub --result-file` mode, registered field derivations, body/result fingerprint and verdict/finish verification; preserve legacy copy mode and special gates.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/challenge.ts`: share compatible structured finding validation and explicit semantic inputs with existing parse/merge path.
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: keep canonical task/finding grammar.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: derived headers, stale result/body and legacy/special verdict compatibility.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/challenge.test.ts`: structured finding parity and retained judgments.
  - **DEPENDS ON:** 1, 3, 4.
  - **DONE WHEN:** Each existing machine-header agent kind declares deterministic-versus-judgment fields, generated artifacts validate at verdict/finish without a formatting model round trip, stale edits cannot complete falsely, incomplete evidence cannot become PASS, legacy stub behavior remains and all three named tests pass. Table-driven fixtures exercise every registered header kind and preserve the existing rule that finish-derived fields are consumed only after finish.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `derives supported header fields and rejects stale bodies without false PASS` fails on inconsistent totals/header fingerprint or a changed body being accepted as the generated successful result.
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `retains special verdict judgments and legacy stub behavior` fails on pure arithmetic overriding evidence-dependent special verdicts or breaking prior-copy/strip-header output.
    - `.bkit/core/engine/commands/workflow/challenge.test.ts` `reuses structured challenge findings without losing semantic inputs` fails on discarded severity/fixable/evidence judgments or disagreement with existing finding parser output.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16).
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: own/export the common audit result validation/derivation contract and proposed comment result-file mode, preserving existing buildComment/poster; do not import steps.ts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: consume the issues-owned contract through its existing import direction to render stable IDs, coverage, totals, links and ledger payloads; preserve explicit semantic prior-key/closure/grouping decisions.
  - **READ:** `.bkit/core/engine/commands/workflow/ledgers.ts`: canonical prior-key candidates and receipt-aware append path.
  - **READ:** `.bkit/core/engine/commands/workflow/tracker.ts`: preserve current provider/MCP posting behavior and #826 integration.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: result-derived report/ledger metadata.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: audit result comments and tracker modes.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: real structured artifact → append → comment-draft flow.
  - **DEPENDS ON:** 3, 4, 5.
  - **DONE WHEN:** The one issues-owned validated audit contract supplies report/header/ledger/comment counts and IDs without an import cycle or duplicated validator; coverage/links and explicit semantic judgments agree, supported tracker/none contracts stay intact and all three named tests pass. Starting with no active run/status/FID, the real-files audit obtains standalone invocation/operation context, renders, appends and drafts its comment, then replays publication without duplicate rows. `pnpm build` and compiled CLI result/comment smoke probes pass within Group 3 before Group 4 begins.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `derives audit IDs totals ledger payloads and coverage from one result` fails on unstable local IDs, duplicated manually supplied counts or lost not-checked coverage.
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `renders audit comments from validated result and preserves tracker adapters` fails on divergent counts/links or a result path bypassing existing provider/none formatting.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `keeps rendered audit report appended rows and tracker draft counts identical` fails on a real runless audit/utility flow (no FID/status/active run) lacking issuance/receipt prerequisites, actual persisted rows disagreeing with result-derived artifact/comment, duplicate replay events or compiled CLI import-cycle failure; exercise the standalone variants from Tasks 1/4.

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Bind managed commands to engine-issued invocation context (deterministic-bookkeeping-4; R1–R7, R21–R22). — `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/commands/workflow/run-facts.ts`, `.bkit/core/engine/commands/lib.test.ts`, `.bkit/core/engine/commands/workflow/status.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`
- TASK 2 (group 1, done): Complete verified ledger attribution before validation (deterministic-bookkeeping-1; R6–R9). — `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`
- TASK 3 (group 1, done): Expose canonical complete ledger reads (deterministic-bookkeeping-2; R8–R11, R23). — `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| resumes explicit invocation across two real worktrees without identity leakage | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 1 |
| rejects conflicting attribution and retains legacy writer restrictions | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 2 |
| completes missing subagent attribution before a real append | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 2 |
| pages canonical winners with diagnostics and rejects stale cursors | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| distinguishes unreadable missing malformed and clean ledger coverage without writing | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 3 |
| preserves tracker changed-hash actions while rejecting ledger operation collisions | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 4 |
| returns durable append receipt and permits a deliberate same-key update | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 4 |
| reconciles lost append response at each durable checkpoint without duplicate rows | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| serializes concurrent append operations and blocks partial uncertain ledger writes | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| derives supported header fields and rejects stale bodies without false PASS | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| retains special verdict judgments and legacy stub behavior | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| reuses structured challenge findings without losing semantic inputs | Unit | `.bkit/core/engine/commands/workflow/challenge.test.ts` | 5 |
| derives audit IDs totals ledger payloads and coverage from one result | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 6 |
| renders audit comments from validated result and preserves tracker adapters | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 6 |
| keeps rendered audit report appended rows and tracker draft counts identical | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 6 |
| preserves handoff events across status folding and rejects stale CI selection | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 7 |
| resumes nonwaiting CI polls without resetting attempts or duplicating retrigger | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 7 |
| resumes corrected substep and blocks exhausted unauthorized or uncertain effects | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 8 |
| keeps invocation events and engine-call rows inside the issuing worktree after receipt loss | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 10 |
