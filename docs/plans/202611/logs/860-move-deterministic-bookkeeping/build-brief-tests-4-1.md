# Brief: group 4 — Durable continuation and maintained caller contracts (tests)

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
- Group 3: Replay-safe writes and shared result rendering — done
  - TASK 4: Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25). — done
  - TASK 5: Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23). — done
  - TASK 6: Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16). — done
- Group 4: Durable continuation and maintained caller contracts — this group
  - TASK 7: Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19). — open
  - TASK 8: Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19). — open
  - TASK 9: Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25). — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19).
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: invocation-bound wait/dispatch observations, persistent phase/attempt/error/retrigger identity, nextAction output and stale evidence checks; preserve standalone provider contracts.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: own the extended target/observation union and validators for none/pending/success/failure/provider-error and unresolved retrigger intent, retained across fold/resume; preserve failed-only CiSelection/debug consumers unchanged.
  - **READ:** `.bkit/core/engine/commands/workflow/counters.ts`: reuse active-run event derivation and existing limits.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.test.ts`: target identity and next action tables.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.test.ts`: typed event preservation and stale selection refusal.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: real persistent handoff and local bare-remote Git commit/push/retrigger reconciliation across dispatcher instances, including shared-checkout ownership and lost responses.
  - **DEPENDS ON:** 1, 4.
  - **DONE WHEN:** None/pending/success/failure/provider-error observations survive restart with valid phase-specific identity and unchanged cumulative limits; stale targets reject and legacy failed-only CiSelection remains valid. Persist and reconcile original/retrigger commit and remote ref across commit-created, push-completed and receipt-completed checkpoints, including shared checkout. Real local bare-remote assertions prove exactly one reachable intended retrigger, correct remote SHA/owned tree and receipt; conflicting remote movement blocks another effect. Legacy explicit mode remains and the three named tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `derives handoff decisions from persisted poll observations and target identity` fails on rejecting valid none/pending/success/failure/provider-error states, trusting supplied success/counters, unresolved intent being treated complete or issuing a decision for another head/PR/repository.
    - `.bkit/core/engine/ledgers/status.test.ts` `preserves handoff events across status folding and rejects stale CI selection` fails on table-driven old/new event shapes losing identity through normalize/fold/compact/resume, incompatible extension of failed-only debug selection or mismatched evidence surviving restart.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes nonwaiting CI polls without resetting attempts or duplicating retrigger` fails on a fresh process resetting cumulative limits, creating/pushing a second reachable retrigger after interruptions at commit creation/accepted push, publishing unrelated staged content, or ignoring conflicting remote movement; use real dispatcher/Git helpers, local bare remote and inspect remote SHA, reachable count, owned tree and receipt, not only status records.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19).
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: declared pre-effect validation/effects/recovery metadata in receiving handlers and structured error output; no blanket generic-exit retry.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: engine-derived stable correction scope and rejection/candidate/success events tied to exact interrupted sub-step.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.ts`: persistent correction usage with two corrected retries default, command-specific limits precedence and no tool/resume reset.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: mark guaranteed no-write validation failures after deterministic fill; reconcile uncertain operations before any corrected candidate.
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: effects classification safety.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: shared correction budget/specific limits.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.integration.test.ts`: interruption, corrected candidate operations and real durable continuation/failure boundaries.
  - **DEPENDS ON:** 1, 2, 4, 7.
  - **DONE WHEN:** Initial no-write rejection permits at most two corrected retries in the same engine-derived scope, corrected candidates use fresh immutable operation IDs without resetting allowance, stricter named routes win, success verifies required output/resumes original sub-step, exhausted/unauthorized/uncertain/check failures retain Failure Path and all three named tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/lib.test.ts` `exposes no-write correction eligibility only for declared pre-effect validation` fails on generic/post-effect errors receiving automatic retry permission or optional telemetry failure masking a required mutation error.
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `shares correction budget across candidate operations and honors specific limits` fails on a new operation/helper/tool/resume resetting two-correction use or a one-retry route gaining a second retry.
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes corrected substep and blocks exhausted unauthorized or uncertain effects` fails on recovered validation ending the workflow, wrong-substep continuation, budget bypass, a gate/permission failure being auto-corrected or uncertainty causing another append.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25).
  - **UPDATE:** `.bkit/instructions.md`: master clauses and carrier registry for the exact approved four-paragraph recovery wording and deterministic ownership; retire conflicting blanket failure wording.
  - **UPDATE:** `.bkit/core/.agents/rules.md`: shared Commands/Failures/recovery rules with unambiguous precedence.
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: explicit invocation/recovery dispatch contract.
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: engine context/read/result/recovery callers.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: engine context/read/result/recovery callers, including corrected ledger append continuation.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: engine result/counter/CI/recovery callers.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: engine result/counter/CI/recovery callers and current context selection.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: existing ship book-root invocation/recovery/receipt callers.
  - **UPDATE:** `.bkit/core/prompts/bkit-audit-generate.md`: structured single-source audit/result/query/append contracts, with explicit standalone invocation/operation issuance when no workflow run exists.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-1.md`: structured findings and generated fields.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-challenge-2.md`: structured findings and generated fields.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-current.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: canonical query and result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tests.md`: canonical query and result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: result serialization and retained evidence judgments.
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-diagnose.md`: query and result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-reproduce.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-soak.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-design-organise.md`: existing stub extended-result contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-1.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-design-review-2.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-design-spike.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-design-update.md`: existing stub extended-result contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-generate.md`: canonical query/verified attribution contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-1.md`: canonical query and result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-review-2.md`: canonical query and result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-update.md`: existing stub extended-result contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-conflict-resolve.md`: result serialization contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: canonical query/result contract.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-decisions.md`: canonical query, explicit standalone invocation issuance and receipt-aware append.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-deferrals.md`: canonical query, explicit standalone invocation issuance and receipt-aware append.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-failures.md`: canonical query, explicit standalone invocation issuance and receipt-aware append.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-knowledge.md`: canonical query, explicit standalone invocation issuance and receipt-aware append.
  - **UPDATE:** `.bkit/core/prompts/bkit-utility-update-roadmap.md`: canonical active failure/deferral query.
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: additive provenance, query coverage, receipt/effects/recovery contracts.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: shared contract prose and spec-generated region via existing cli-doc tool.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: engine/agent ownership and durable recovery behavior.
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: result/attribution ownership and model provenance semantics.
  - **UPDATE:** `docs/architecture.md`: existing status/outbox/leaf ownership and locks.
  - **UPDATE:** `docs/testing.md`: local fault/replay/consumer coverage.
  - **UPDATE:** `docs/observability.md`: effects/receipt/correction diagnostics and no secret capture.
  - **READ:** `.bkit/core/engine/tools/instructions.ts`: use clause sync, do not hand-copy shared sentences into carriers.
  - **READ:** `.bkit/core/engine/tools/cli-doc.ts`: regenerate catalog from command specs.
  - **READ:** `.bkit/core/engine/render/hosts.ts`: retain five current host transforms.
  - **READ:** `.bkit/core/engine/render/trackers.ts`: retain GitHub/Linear/Jira/none variants.
  - **UPDATE:** `.bkit/core/engine/tools/instructions.test.ts`: focused ownership/recovery precedence coverage across maintained carriers, including current specific one-retry routes.
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: real fresh-consumer install/upgrade and compiled CLI probes across host/tracker fixture matrix.
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8.
  - **DONE WHEN:** All eight ownership boundaries and exact approved wording appear consistently in maintained/rendered sources, every full-ledger manual reader and redundant machine-field instruction is replaced or documented evidence-backed existing behavior, five host/four tracker modes install/upgrade without contract drift, built CLI consumer probes complete the corrected missing-model/lost-response/resume journey, `pnpm instructions:sync`, `pnpm cli:sync`, `pnpm build`, the deepest applicable static/unit/integration gate and `bkit check` pass, and the two named tests pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `renders one recovery precedence contract for all hosts and tracker adapters` fails on a blanket failure carrier, missing deterministic ownership, generic retries overriding a specific route or a host/tracker variant retaining manual copied counters/model pins.
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `installs and upgrades fresh consumers with deterministic bookkeeping contracts` fails on source/rendered/compiled CLI drift or fresh consumer invocation/query/result/receipt/recovery probes producing divergent rows, limits or attribution.

<!-- bkit:task 9 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Bind managed commands to engine-issued invocation context (deterministic-bookkeeping-4; R1–R7, R21–R22). — `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/commands/workflow/run-facts.ts`, `.bkit/core/engine/commands/lib.test.ts`, `.bkit/core/engine/commands/workflow/status.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`
- TASK 2 (group 1, done): Complete verified ledger attribution before validation (deterministic-bookkeeping-1; R6–R9). — `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`
- TASK 3 (group 1, done): Expose canonical complete ledger reads (deterministic-bookkeeping-2; R8–R11, R23). — `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`
- TASK 4 (group 3, done): Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25). — `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/workflow/locks.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/journal.ts`, `.bkit/core/engine/ledgers/status.test.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`
- TASK 5 (group 3, done): Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23). — `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/workflow/challenge.test.ts`
- TASK 6 (group 3, done): Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16). — `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/workflow/issues.test.ts`, `.bkit/core/engine/ledgers/journal.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| rejects stale cross-worktree invocation and conflicting overrides | Unit | `.bkit/core/engine/commands/lib.test.ts` | 1 |
| resumes explicit invocation across two real worktrees without identity leakage | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 1 |
| completes missing subagent attribution before a real append | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 2 |
| distinguishes unreadable missing malformed and clean ledger coverage without writing | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 3 |
| preserves tracker changed-hash actions while rejecting ledger operation collisions | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 4 |
| reconciles lost append response at each durable checkpoint without duplicate rows | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| serializes concurrent append operations and blocks partial uncertain ledger writes | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 4 |
| keeps rendered audit report appended rows and tracker draft counts identical | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 6 |
| derives handoff decisions from persisted poll observations and target identity | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 7 |
| preserves handoff events across status folding and rejects stale CI selection | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 7 |
| resumes nonwaiting CI polls without resetting attempts or duplicating retrigger | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 7 |
| exposes no-write correction eligibility only for declared pre-effect validation | Unit | `.bkit/core/engine/commands/lib.test.ts` | 8 |
| shares correction budget across candidate operations and honors specific limits | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 8 |
| resumes corrected substep and blocks exhausted unauthorized or uncertain effects | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 8 |
| renders one recovery precedence contract for all hosts and tracker adapters | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 9 |
| installs and upgrades fresh consumers with deterministic bookkeeping contracts | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| writes the engine-call row for an invocation-bound command | Unit | `.bkit/core/engine/commands/lib.test.ts` | 10 |
| keeps invocation events and engine-call rows inside the issuing worktree after receipt loss | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 10 |
