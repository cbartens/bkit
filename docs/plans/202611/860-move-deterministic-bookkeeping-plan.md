<!-- bkit:anchor
baseSha: ecf4264b3ba63bcc1464b9f20b43b4db79cfe924
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->

Verdict: PASS
<!-- verdict:end -->

# Deterministic Bookkeeping Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: prerequisites, reuse inventory, tasks, verification and rollback.

## Context & Goals

Move deterministic metadata, serialization and replay accounting into existing engine paths. The eight audit findings define the scope. The owner approved the six architectural defaults on 2026-11-05 and requested direct planning. The engine already provides ledger envelopes, status folds, counters, artifact header parsing/seeding, tracker deduplication and summaries; this plan extends those paths.

**Related Issues:**

- [#750 — Workflow optimisation (open)](https://github.com/cbartens/bkit/issues/750).
- [#836 — Record which host and model ran each workflow, on every host (open)](https://github.com/cbartens/bkit/issues/836).
- [#826 — Append routine workflow step updates to one comment per run (open)](https://github.com/cbartens/bkit/issues/826).
- [#860 — Move deterministic bookkeeping and safe recovery into the engine (open)](https://github.com/cbartens/bkit/issues/860).

## 👤 ⚠️ Acceptance Scenario

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

### Process Sketch

- **WHEN** the planner delegates a step **→ THEN** the engine issues an invocation ID bound to that run, step and agent.
- **WHEN** that agent submits its finding without a model field **→ THEN** verified attribution is completed, or optional model telemetry is explicitly unavailable, and the authorized finding is appended once.
- **WHEN** the same operation is retried after its response was lost **→ THEN** the engine returns the recorded receipt without another ledger event.
- **WHEN** validation rejects an input before effects **→ THEN** the corrected input can retry within the persistent two-correction budget and resume the same sub-step.
- **IF** run identity conflicts, an operation ID is reused with another payload, or write effects remain uncertain **→ THEN** the affected mutation is blocked with evidence and independent authorized work can continue.

### Concrete Example

**Setup:** A maintainer is running a plan step. The step has a verified invocation binding and permission to append a failure finding; the model source is available from the approved host/session contract.

**Steps:**

1. The agent submits the substantive finding and its engine-issued invocation/operation references, omitting repetitive attribution → the engine resolves the run, step, agent and observed model.
2. The ledger row validates and is appended → a durable receipt records the operation ID, canonical request hash and exact effect.
3. The caller loses the result and repeats the same operation → the original receipt is returned and the ledger remains one event longer.
4. A subsequent distinct finding has a missing required substantive field → validation reports no effects, the agent corrects that field within its shared correction budget, and the interrupted sub-step resumes after verification.

**Outcome:** The maintainer receives a completed plan step with one ledger event per intended write, accurate provenance and no failed workflow caused solely by the recovered bookkeeping error.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Missing subagent model with verified invocation data | Engine completes it and appends once; workflow continues. |
| Runtime model differs from source prompt pin | Record the authoritative runtime value and provenance; do not silently substitute the pin. |
| Unknown, conflicting or stale invocation context | Explicit unavailable/conflict result under the agreed policy; no fabricated fields or wrong-run attribution. |
| Two concurrent runs/worktrees | Metadata, counters, paths and replay identities remain isolated. |
| Malformed ledger row among valid rows | Deterministic diagnostics and explicit coverage status; no silent deletion or false clean read. |
| Findings change after a header was produced | Derived totals are regenerated or stale data is rejected; no false PASS. |
| Lost response after successful append | Reconciliation returns the original operation result without a duplicate append. |
| Legitimate later update uses the same ledger key | New update remains possible with correct lineage. |
| CI polling crosses process/turn resume | Attempt budgets and retrigger state persist, and conclusions stay bound to provider evidence. |
| Validation correction succeeds; then correction budget exhausts | First resumes the same sub-step; second enters Failure Path and preserves work. |
| Permission denial, real failed test, unknown side effect | Existing explicit policy remains enforced; generic recovery does not bypass it. |
| Audit report, ledger rows and tracker comment | Counts and identities agree from the same validated result. |
| Same operation ID with a different canonical request hash | Reject the collision before mutation; use a new engine-issued operation for a deliberate update. |
| Missing model telemetry with valid author/run binding | Record model availability and provenance without failing the authorized substantive write. |
| Invalid or missing explicit author/run binding | Block the affected mutation; optional telemetry policy does not grant authority. |
| Canonical query cursor is reused after ledger content changes | Reject the stale cursor or restart explicitly; never silently omit or duplicate folded winners. |

### Derived Test Matrix

The twelve issue validation scenarios appear verbatim in Edge Cases; the cases below exercise them and the additional boundaries. Test names are the proposed runner case names. All Integration cases use real temporary repositories/files and the real dispatcher; provider fixtures are used only outside the changed persistence boundary. Task 1 issuance includes workflow and explicit runless audit/utility variants; Task 3's filter test exercises the new query path and cannot resurrect an older ACTIVE row; Task 4's concurrent row includes actual journal/owner-pause same-key and distinct-key writers; Task 6's equality row starts without FID/status/run and replays a standalone publication; Task 7's restart cases span none/pending/success/failure/error and inspect actual commit/push checkpoints against a local bare remote. These strengthen the existing 27 rows without assigning a test to two tasks. No new external provider API, model call, database or UI boundary is introduced.

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
| derives handoff decisions from persisted poll observations and target identity | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 7 |
| preserves handoff events across status folding and rejects stale CI selection | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 7 |
| resumes nonwaiting CI polls without resetting attempts or duplicating retrigger | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 7 |
| exposes no-write correction eligibility only for declared pre-effect validation | Unit | `.bkit/core/engine/commands/lib.test.ts` | 8 |
| shares correction budget across candidate operations and honors specific limits | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 8 |
| resumes corrected substep and blocks exhausted unauthorized or uncertain effects | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 8 |
| renders one recovery precedence contract for all hosts and tracker adapters | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 9 |
| installs and upgrades fresh consumers with deterministic bookkeeping contracts | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 9 |
| records the issued invocation in the run status log and rebuilds a deleted receipt | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 10 |
| writes the engine-call row for an invocation-bound command | Unit | `.bkit/core/engine/commands/lib.test.ts` | 10 |
| keeps invocation events and engine-call rows inside the issuing worktree after receipt loss | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 10 |
| refuses to issue an invocation into a status file outside the issuing checkout | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 11 |
| starts a step clock at the previous step row, not at an invocation row | Unit | `.bkit/core/engine/commands/workflow/run-facts.test.ts` | 11 |
| accepts verified unavailable model without confusing configured and observed models | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 12 |
| audit result render keeps an existing anchored report intact | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 13 |
| resolves a pending ledger intent after its invocation is stale | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 14 |
| appends the printed audit ledgerRows verbatim under the standalone invocation | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 15 |
| blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 16 |
| refuses to re-append a partly landed block after a foreign writer appended | Integration | `.bkit/core/engine/ledgers/journal.integration.test.ts` | 17 |
| issues the same operation for rows whose keys are reordered | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 18 |
| derives audit ledger keys under the audit-slug prefix | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 19 |
| renders no PASS from a result that omits its evidence | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 20 |
| routes every ledgers query reader on coverage status | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 21 |
| writes no absolute checkout path into the run's committed invocation event | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 22 |
| keeps ledger operation intents and receipts out of committed book paths | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 23 |
| refuses line breaks in header-bound result values | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 24 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

## 👤 ⚠️ Breaking Changes & Naming Review

<!-- prettier-ignore -->
| Name / contract | Compatibility |
| --- | --- |
| Proposed `status row --type=invocation`, common `--invocation`, append `--operation`/`--reconcile` | Additive managed mode. Explicit legacy standalone calls remain. An old unmanaged caller receives no new replay/attribution guarantee; it is not silently guessed into a managed run. |
| Proposed `ledgers query --ledger --key --status --limit --cursor` | New read verb within existing noun; replaces prompt reader implementations. Canonical fold and event identity unchanged. |
| Proposed `steps stub --result-file` and `issues comment --result-file` | Existing copy/header/manual-comment modes remain; new structured mode derives fields and refuses conflicting/stale evidence. |
| RowBy provenance and typed status events | Additive schema-3 fields/event types, no migration. Actual runtime model and configured pin remain distinct. Missing optional model is nonblocking only with verified author/run binding. |
| Managed CI supplied counters | Workflow callers switch to persisted observations. Existing explicit standalone flags remain; managed conflicting supplied evidence rejects. |
| Recovery wording | Two corrections after a guaranteed no-write validation rejection; stricter command-specific routes win. Missing authorization, failed checks, gates and uncertain effects still block according to their existing contracts. |

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

## 👤 ⚠️ Open Questions & Assumptions

**Open questions:** None. The six defaults in #860 are accepted. Concrete API/storage choices appear below and do not reopen them.

- **Assumption:** #836 supplies an authoritative observed host/model record when available → if absent, model availability is explicitly unavailable with provenance; no fallback prompt pin is recorded as actual execution.
- **Assumption:** #826 continues using the existing tracker posting/action contract → a change to that contract must be adapted at the existing publisher, or tracker receipt integration can diverge.
- **Assumption:** Same-checkout engine processes use the shared git-common outbox and repository files → unsupported simultaneous writers bypassing the CLI cannot receive the new replay guarantee; unexpected target changes block reconciliation.
- **Assumption:** Legacy standalone CLI users remain supported without invocation flags → removing that path would break direct administrative ledger writes and existing scripts. New managed workflow callers always pass explicit invocation context.
- **Assumption:** Additive status/ledger metadata and new local runtime receipts need no historical rewrite → evidence requiring a schema migration blocks that change for owner approval; this plan authorizes no migration.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Decision | Reason |
| --- | --- | --- |
| Extend current command nouns, shared leaf folds and serializers | Recommended | Preserves existing callers, host renderings and tracker contracts; fills missing authority/replay boundaries in one path. |
| Add a bookkeeping service, second status store, serializer noun or host detector | Rejected | Existing modules already implement the relevant parsing, paths, envelopes, provider access and action hashes. A second implementation creates conflicting authority. |
| Deduplicate by ledger key/content or allow a changed hash to replay | Rejected | A key identifies substantive history; a new operation may deliberately update it. Tracker changed-hash edits remain intentional and separate from strict ledger replay. |
| Treat any validation-looking exit as safe to retry | Rejected | Only a command-declared pre-effect rejection guarantees no writes; network, permission, gates and partial filesystem effects need their specific routes or reconciliation. |

## Out of Scope

None of the eight findings is excluded or deferred. The issue's existing non-goals remain boundaries: no semantic finding/acceptance/test-result inference, malformed-history repair, new host telemetry collector, new progress-comment system or migration. These do not supply a required acceptance behavior and create no new deferral.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Complete host/model capture on every host | #836 | Invocation provenance adapter, run-facts | Coordinate current contract; consume it, keep collector work in its owning issue. |
| Consolidate routine progress comments | #826 | Existing tracker publisher/action identity | Reuse current publishing path; keep progress-comment product changes in its owning issue. |
| Broader workflow optimization | #750 | Command/prompt ownership | Keep separate; this plan covers only eight named findings. |
| Existing command import cycle regression | `docs/knowledge.jsonl` key `workflow-ledgers-importing-tests-closes-a-steps-cycle` | ledgers/steps/shared helpers | Prevent recurrence with leaf-only helpers and built CLI probe; no unrelated refactor. |
| Shared status reducer and telemetry event identity | `docs/decisions.jsonl` keys `58-status-fold-sourced-once-from-shared-script`, `234-references-single-pointer-field-no-alias-identity` | Query, receipts, resume | Preserve established contracts; do not replace global identity with operation IDs. |
| Historical interleaved-run boundary | `related-deferrals.md` key `58-status-jsonl-run-boundary-keys-on-last-run-overall` | Explicit invocation and persistent limits | Current source already uses workflow-specific lastRun and has build→debug→build coverage; preserve that characterization, do not add a legacy run-boundary rewrite. |
| Broader manual-row envelope cleanup | `related-deferrals.md` key `ledger-envelope-workflow-field-not-universal` | Standalone audit/utility writer contract | This plan specifies the required standalone invocation route; leave unrelated historical manual-row normalization with its existing owner. |
| Historical counter/parent evidence | `related-deferrals.md` keys `58-counter-row-countername-value-pairing-unverified`, `58-debug-run-tests-parentsha-advances-only-transitively` | Counter/status consumers | Preserve existing compatibility fixtures; investigate broader historical semantics separately rather than silently expanding these tasks. |
| Deployed CI proof | `related-deferrals.md` key `650-debug-dev-ci-live-round-trip` | CI target evidence | Keep its separately owned live proof; local Git/persistence tests in this plan do not close it. |
| CI lookup/context/revalidation timeouts | OPEN rows in `related-failures.md` (bounded artifact; 13 of 30 matching lines were omitted) | Existing runs tests and resource contention | Preserve existing assertions/gates; broad timeout remediation is separate. Omitted rows are unchecked, not clean. |
| Shipped ledger/lifecycle/ship changes | Closed related issues fetched in `related-issues.md` | Envelopes, compaction, command reuse, FID inputs and book roots | Treat them as compatibility context and retain their shipped behavior, not reopened implementation scope. |

Open failures/deferrals were scanned for overlapping bookkeeping/counter/ledger/host/CI surfaces. No additional unowned item was established as necessary to the eight accepted findings; historical audit limitations remain evidence, not backlog expansion.

## Security & Privacy

- [x] **Role-Gated Mutation:** Invocation validation precedes managed writes; kind-writer allow-lists remain checked. An ID never grants authorization and conflicting actor/run/step input is rejected.
- [x] **User Input:** Validate structured results, operation/cursor IDs, filters and provenance in receiving command handlers. Canonicalize repository/worktree/target paths, reject traversal and symlink escape, and never execute artifact text.
- [x] **PII:** Store only required execution IDs/provenance and existing substantive findings. Do not capture tokens, full host transcripts or secrets into receipts/logs. Existing substantive-data retention applies; optional model diagnostics do not invent identity.
- **Other template rows:** No API route, database/RLS, redirect, webhook, new secret or env variable. Local file ownership and existing provider authorization are unchanged. Required receipt errors surface to callers; optional engine-call telemetry stays fail-open.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** Existing Node fs/crypto primitives suffice; no dependency addition or upgrade is required.
- [x] **Dependency Versions:** `direnv exec . pnpm bkit:deps:outdated` completed with expected outdated exit 1: oxlint-tsgolint 7.0.2004→7.0.2005, oxlint 1.89.0→1.90.0, @types/node 24.19.2→26.6.6, vite 6.4.5→8.3.5. None blocks these changes. Node v24.16.0, pnpm 10.34.7, git 2.56.0 and package/workflow 6.1.1 checked. `bkit --version` is not supported; package version is authoritative.
- [x] **Existing-Solution Search:** Reuse Inventory records the command, symbol, caller and test searches at this worktree revision; no parallel bookkeeping engine is proposed.
- [x] **User Context:** Input and embedded audit readable; all eight findings/defaults approved. Historical audit source is supplied in the input because it is absent from this worktree base.
- [x] **Project Context:** Canonical read/fold primitives and relevant decision/knowledge rows read. Preserve the command import-cycle warning, single shared status fold, content/event identity, and generated-header timing contracts.
- [x] **Testing & Quality:** Static, Unit and Integration tiers follow `docs/testing.md`; real filesystem/worktree/persistence boundaries use Integration tests. No external API behavior changes require a new @live lane.
- [x] **Prerequisite Plans:** None. #836/#826 are coordination contracts, not established blockers. Check their latest implementation when adapting the existing hooks.

### Conditional

- [x] **Architecture:** Node CLI, agent payload and local append-only files confirmed against `docs/architecture.md`; no UI.
- [x] **Schema State:** `docs/data-schema.md` has no active database schema. This plan changes additive JSONL/runtime contracts only.
- [x] **Observability:** `docs/observability.md` requires one JSON stdout result, prefixed stderr and fail-open optional telemetry; recovery/receipt correctness is required command state, not optional telemetry.
- **Secrets & Env Vars / Notifications:** Not applicable; no new secrets, service-account roles, alerts or toasts.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [x] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [x] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [x] **Security & Privacy checked:** Applicable input/authorship/path boundaries are identified below.
- [x] **Reuse Inventory complete:** All introduced capabilities map to existing files and tasks.
- [x] **Reuse reasons:** No new source file or parallel module is proposed.
- [ ] **Gate 1 — Verified:** Build phase checks human confirmations and prerequisite evidence; these unchecked boxes do not stop plan generation.

## Data Schema Integration

### Data Schema Usage

No database. Input: existing status rows, canonical ledger rows, structured findings, registered step metadata and authoritative host/model observations. Output: additive status event types, optional provenance fields, generated result envelopes and local prepared/completed operation receipts. Ledger `key`, numeric `ts`, composite `identity`, lineage and schema 3 keep their existing meanings.

### Data Schema Changes

<!-- prettier-ignore -->
| Contract | Additive shape and compatibility |
| --- | --- |
| Invocation | Engine-issued UUID and explicit mode. Workflow mode binds canonical git-common/repository/worktree, FID/month/workflow, exact run start plus ordinal and registered step/group/attempt/agent; status is its authority and the outbox entry is a rehydratable index. Standalone audit/utility mode binds canonical repository/worktree, declared audit/utility step, allowed agent and explicit input/output scope; its atomic outbox invocation record is authority, with no invented FID or numbered workflow run. Both modes separate configured from observed model/source and provide operation/correction scope. |
| RowBy | Preserve existing `workflow`, `step`, `subagent`, actual string `model`. Add optional `invocationId`, `modelAvailability` (`available`/`unavailable`), `modelSource`, and `configuredModel`. Unavailable subagent rows require validated invocation provenance; legacy rows with real `model` continue to validate. Orchestrator model restrictions and kind-writer allow-lists remain authoritative. |
| Ledger query | `rows`, `total`, `nextCursor`, snapshot hash, `coverage` and line-number diagnostics. Fold before key/status filters, with deterministic existing timestamp/tie semantics. Missing/unreadable files and invalid identity/timestamp are explicit coverage failures, never clean empty results. |
| Result envelope | Versioned local structured result with agent/kind, substantive findings/evidence/judgments, coverage, canonical body/result hash and generated header fields. No new ledger kind. Audit local IDs are stable from supplied finding identity plus report scope; existing ledger keys are explicit semantic decisions. |
| Ledger operation | Strict operation ID + canonical request hash scoped to repository, target ledger and invocation; receipt records prepared exact bytes, expected offset/prefix identity, minted rows/lineage, completed effect and reconciliation state. Use the existing git-common outbox, with typed status references; recovery must not infer an operation from a ledger key. |
| CI handoff / correction | Typed append-only status events retain a validated target/observation union, poll/retrigger facts and logical correction scope. Before discovery target identity exists without a run ID; discovered pending/success/failure observations require run/attempt/workflow identity, while none/provider-error do not fabricate it. Existing failed-run CiSelection remains unchanged. Workflow events retain fold/resume identity; standalone correction events persist in its authoritative invocation record. Candidate operation IDs remain immutable within the shared budget. |

No historical rewrite, schema bump or migration is authorized. Existing normalized ledger data and old status readers remain compatible; new managed invocation/result modes opt into stronger validation. Workflow caches are reconstructible indexes, not a second source of workflow authority. Standalone authority is explicitly its own invocation record, never an inferred active run.

## Reuse Inventory

Inventory verified against this worktree, not merely the audit's suggestions. `E` below means `.bkit/core/engine/`; every File entry is relative to that root unless it starts with `.bkit/`. Test entries share the named implementation's directory unless specified. `S1`: `rg -l --glob '*.ts' 'appendLedgerRows|writerProblem|foldFrom|alreadyDone|resolveActiveRun|SuppliedPoll|parseFindings|promptHeader|tryCreate' .bkit/core/engine/commands .bkit/core/engine/ledgers`, then bounded `rg -n`/source ranges. `S2`: the equivalent `node:crypto|node:fs|parseModelLookupForColumn|agentContextBlock|postCommentOnce` search in workflow/render/ledgers. `S3`: bounded CLI catalog and command-spec reads. `S4`: source/prompt searches for `highest.*timestamp`, `machine-parseable`, `Recovery scope`, `Read-only helper recovery`, `poll-result`, `by.model`. Serena symbol overviews and `docs/capabilities.md` confirmed present symbols; text searches at this worktree confirmed contracts and missing public helpers. Native fs exclusive creation/append/rename and crypto hashing already serve this CLI; no dependency or framework service is needed.

<!-- prettier-ignore -->
| ID / capability | File | Search performed | Existing candidates, behavior, callers and tests | Decision | Justification / task |
| --- | --- | --- | --- | --- | --- |
| R1 Common dispatch/context | `commands/lib.ts` | S1/S3; `runCommand`, `resolveActiveRun`, `RunContext`, `VerbSpec` ranges | Dispatcher parses declared flags, emits one result and journals; implicit resolver tolerates exactly one active run for optional journaling. All command callers; `lib.test.ts`, `ledgers/journal.integration.test.ts`. | EXTEND | Add explicit invocation lookup and declared effect/recovery metadata; preserve fail-open journal and standalone callers. Tasks 1, 8. |
| R2 Explicit run/event path | `commands/workflow/status.ts` | S1/S3; `statusFile`, `readStatusRows`; review audit/utility caller contract | `status path --workflow --fid --month`; `status row --file --workflow --type --field`; `status route --file --workflow --step --group --require --expect`; `status resume --file --workflow`. Workflow/routing callers; `status.test.ts`. | EXTEND | Specialize workflow invocation issuance and explicit standalone audit/utility mode in the same noun; scoped outbox authority supplies runless receipt prerequisites without a new context service. Task 1. |
| R3 Status folding/action identity | `ledgers/status.ts` | S1; `fold`, `runNumber`, `runOrStepField`, `lastRun`, `actionKey`, `actionHash`, `alreadyDone`, `recordAction` | Shared fold and engine-action receipts serve steps/tracker/branches. Equal key+hash reuses receipt; changed hash permits intentional action. `status.test.ts`. | EXTEND | Add typed invocation/CI/recovery events and strict ledger-operation helpers without changing tracker semantics. Tasks 1, 4, 7, 8. |
| R4 Lifecycle/path/input | `commands/workflow/workflows.ts` | S2/S3; `whereInTree`, `recordChat` | `workflows start --workflow --fid [--month --file]`; `input --workflow --fid --run --prompt-file`; `summary --workflow --file`; `promote`, `links`, `close`, `fail`, `handover`. Derives tree/book root/month; `workflows.test.ts`, shared-checkout/progress integration fixtures. | EXTEND | Return invocation-ready inputs and retain no-plan conversion, remediation and ship book-root semantics. Task 1. |
| R5 Registered steps | `commands/workflow/step-table.ts` | S1/S3; `WORKFLOW_STEPS`, `resumePoint`, `runProgress` | Canonical numbers/titles/setup/resume routes used by status/workflows; `step-table.test.ts`. | EXTEND | Derive metadata/artifact inputs from registered step plus validated agent and attempt; do not duplicate table in prompts. Task 1. |
| R6 Observed host/session hook | `commands/workflow/run-facts.ts` | S2; `hostChat`, `chatFingerprint`, `agentContextBlock` | Current observed transcript hook is Claude-specific, used by workflow capture; `run-facts.test.ts`. | EXTEND | Consume #836 contract here; absent observation yields unavailable provenance. No new detector. Tasks 1, 2. |
| R7 Configured model pins | `render/models.ts` | S2; `parseModelLookupForColumn`, overrides | Existing host-specific configured model mapping; host/install renderers; `models.test.ts`, `hosts.test.ts`. | REUSE | Pin is configured intent only, never proof of actual execution. Tasks 1, 2. |
| R8 Ledger envelope/write boundary | `commands/workflow/ledgers.ts` | S1/S3; `appendLedgerRows` | `ledgers append --ledger --rows [--root]` validates whole batch before writes; fills schema/version/repo/ts/lineage; challenge/close/triage also call helper. `ledgers.test.ts`. | EXTEND | Fill verified attribution before validation; add query and operation receipts to this noun/helper, preserve positional legacy API with optional context. Tasks 2, 3, 4. |
| R9 Canonical ledger codec | `ledgers/telemetry.ts` | S1; `RowBy`, `writerProblem`, `parse`, `normalize`, `identity`, `compareTs`, `fold`, `foldFrom`, `lineage`, `withLineage` | Parser counts malformed lines; fold uses canonical identities and last equal-ts row; writer author rules; broad command/harvest readers; `telemetry.test.ts`. | EXTEND | Add detailed diagnostics and compatible provenance encoding; query delegates here. Do not invent another fold or turn keys into operation identity. Tasks 2, 3. |
| R10 Existing compaction | `ledgers/compact.ts` | S1; `compactLedgerText`, `compactLedgers` | Normalizes/retains malformed history and uses temporary replacement; called by `ledgers compact --ledger --dry-run`; `compact.test.ts`. | REUSE | Canonical codec reused; query remains read-only and never uses compaction as a read repair. Task 3. |
| R11 Context search | `commands/workflow/context.ts` | S1/S3; `ledgerScan` | `context ledger-scan --terms --source --artifact` relevance-ranks raw lines, cap40 with truncation; contextual search callers; `context.test.ts`. | REUSE | Preserve specialized search; replace full-ledger prompt readers with query rather than falsely treating this as canonical full coverage. Tasks 3, 9. |
| R12 Existing artifact serialization | `commands/workflow/steps.ts` | S1/S3; `promptHeader`, `readHeader`, `finish`, `STUB_HEADER` | **Actual verb is `steps stub --from --to [--strip-header]`**, which seeds a header; no `steps seed` verb. `steps verdict --file [--agent --field]`, `steps finish --file --workflow --step [--artifact --agent --count-field --post]`, `steps gate`, `steps done` validate/aggregate. Workflow callers; `steps.test.ts`. | EXTEND | Add structured-result mode to stub; derive declared fields and verify body hash at finish. Corrects audit's broad serializer recommendation: do not add a serializer noun. Tasks 5, 6. |
| R13 Structured challenge findings | `commands/workflow/challenge.ts` | S1; `parseFindings`, `mergeFindings` | Parses finding task blocks, severity/fixable/location; merge chooses worst severity and AND fixability. `challenge merge --report --plan --log --round`; steps/challenge callers; `challenge.test.ts`. | EXTEND | Reuse parser for compatible challenge bodies; add adapters only for distinct existing artifact kinds, retaining judgments. Task 5. |
| R14 Task/plan parsing | `commands/workflow/plan-blocks.ts` | S1/S3; `parsePlanBlocks`, matrix parser | Canonical task markers/fields/test names used by tests, challenge, brief and plan checks; `plan-blocks.test.ts`. | REUSE | Structured findings retain the existing task grammar; no duplicate Markdown parser. Tasks 5, 9. |
| R15 Audit/tracker formatter | `commands/workflow/issues.ts` | S2/S3; `buildComment`; import graph (`steps.ts` imports issues; issues does not import steps) | `issues comment --kind=audit --audit-slug --field --artifact --ref [--body-file --post]` formats exact report comments but receives separate counts; `issues.test.ts`. | EXTEND | Own the exported audit result validator/derivation contract here; steps consumes it through its existing dependency. Proposed `--result-file` derives totals/links and preserves explicit mode. No reverse issues→steps import or second validator. Task 6. |
| R16 Tracker posting/dedup | `commands/workflow/tracker.ts` | S1/S2; `postCommentOnce`, `stampMarker`, `markerHash`, `postForVerb`, action keys | Existing GitHub/Linear/Jira/none publishing and MCP fallbacks; action hash supports deliberate changed-body edit. Issues/steps callers; `tracker.test.ts`, tracker rendering tests. | REUSE | Pass derived payload through this path and #826 contract; no second publisher or global stricter-hash policy. Tasks 4, 6, 9. |
| R17 CI provider polling/dispatch | `commands/workflow/runs.ts` | S1/S3; `pollOnce`, `waitLoop`, `ciDispatchGate`, `runDispatch`, `SuppliedPoll` | `runs wait --pr/--head --branch --once --budget-s --interval-s`; `runs dispatch --fid --file --workflow --step --poll-result --attempts --all-errored --retriggered`; gate/revalidate reuse provider evidence. `runs.test.ts`, real local persistence fixtures. | EXTEND | Persist observations and derive handoff values inside existing wait/dispatch. Legacy supplied flags retained only standalone mode; managed callers cannot override evidence. Task 7. |
| R18 Atomic CI selection and handoff evidence | `ledgers/status.ts` | S1 plus review source `CiSelection`, `validateCiSelection`, `ciSelectionIdentity` | Existing CiSelection validates local or selected failed-run evidence only (positive run/attempt and failed conclusion); debug/gate/context callers; `status.test.ts`. | EXTEND | Preserve failed-run selection unchanged. Add a target/observation union in this existing owner, reusing applicable identity checks for none/pending/success/failure/error observations and unresolved retrigger intent. Never force general polling through the failed-only validator. Task 7. |
| R19 Counters/limits | `commands/workflow/counters.ts` | S3; `activeRunStart`, `grantCount`, `savedPointLimit`, `loopProgress` | `counters derive --file --workflow --step --position=next/current/count`; `run`, `route`, `grant`, `max`, `rows`, `progress` derive counts from status. Workflow callers; `counters.test.ts`, `progress.integration.test.ts`. | EXTEND | Add correction-scope counting without new counter storage; preserve command-specific limits/owner grants. Tasks 7, 8. |
| R20 Lock primitive | `commands/workflow/locks.ts` | S1; `tryCreate`, caller imports | `locks acquire/release --kind --workflow --fid` uses exclusive `wx`; stale workflow-lock policy is not safe append-lock policy; imports ledgers command. `locks.test.ts`. | EXTEND | Reuse exclusive-create semantics in an existing leaf helper with compatibility delegation; do not import locks command into ledgers and close a cycle. Task 4. |
| R21 Book roots/outbox | `commands/lib.ts` | S1/S3; `repoRoot`, `statusLocation`, `statusRelPath`, `outboxRoot`, `outboxRel`, `utcMonth` | Existing main/worktree/ship resolution and git-common outbox; context/runs/workflows callers; `lib.test.ts`, shared-checkout integration. | REUSE | Validate canonical paths/symlink boundaries using this one path system; local indexes/receipts live in existing outbox. Tasks 1, 4. |
| R22 Anchors/summary/promotion | `commands/workflow/branches.ts`; `commands/workflow/summary.ts`; `commands/workflow/summary-findings.ts`; `commands/workflow/plans.ts` | S1/S3; `anchor-stamp`, `anchor-read`, `buildSummary`, `challengeResolution`, `taskVerified`, plan parse/comment | Existing anchors, close evidence and links already engine-owned; workflows call them; branches/summary/plans suites. | REUSE | No replacement anchor writer, summary arithmetic, promotion or issue-plan parser. Tasks 1, 9 only consume existing outputs. |
| R23 JSON parsing | `shared/json.ts` | S1/source ranges; `parseJson`, `readTextFile`, `readJsonFile` | Shared safe JSON boundary used by commands and codec. | REUSE | Add line diagnostics around existing parse results; no second JSON exception policy. Tasks 3, 5, 6. |
| R24 Instruction/CLI/host generation | `.bkit/instructions.md`; `tools/instructions.ts`; `tools/cli-doc.ts`; `render/hosts.ts`; `render/trackers.ts` | S3/S4; clause/source coverage and render tests | `pnpm instructions:show`, `instructions:sync`, `cli:sync`; generated catalog derives flags from specs; five hosts/four tracker modes already rendered. | EXTEND | Update shared clauses and all affected carriers, then regenerate via existing tools/upgrade. No new generator. Task 9; existing hosts/trackers/instructions/cli-doc tests reused. |
| R25 Direct journal ledger writer | `ledgers/journal.ts` | Review source reads: `appendFrictionRow`, `commands/lib.ts` command-failure caller and owner-pause caller | Directly reads recurrence and appends APPEND_LEDGERS.friction; `journal.test.ts`, `journal.integration.test.ts`. Its prior append-only history fix is shipped. | EXTEND | Use the same cycle-free target lock as managed appends; preserve append-only recurrence and optional telemetry failure policy. Inventory every other direct managed-target writer and coordinate it before claiming prepared offsets stable. Task 4. |

No capability requires NEW. Proposed new **verbs/flags within existing nouns** below extend named implementations; they are not claimed to exist today. Every implementation task cites these inventory IDs.

## Architecture & Component Changes

**Ledger rows:** `860-explicit-invocation-context`, `860-attribution-provenance`, `860-canonical-ledger-query`, `860-ledger-operation-receipts`, `860-existing-artifact-serialization`, `860-durable-ci-handoff`, `860-bounded-recovery-precedence`.

### Database Migrations

None. Additive file contracts only; no schema migration or historical row rewriting.

### Engine and instructions

All following files were found and read; no new source module is required. `E` is `.bkit/core/engine/` as above.

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/commands/workflow/run-facts.ts`, `.bkit/core/engine/ledgers/status.ts`

- Extend existing `status row --type=invocation --file --workflow` with validated registered step/agent inputs and engine-generated ID. Return complete paths, step number/title, run/attempt/group and exact agent invocation inputs. Add proposed explicit standalone audit/utility issuance to this same handler, taking declared step/allowed agent and canonical input/output scope instead of FID/status/run. Persist standalone authority atomically under the existing outbox invocation directory and return its operation/correction inputs. Add common proposed `--invocation` through dispatcher specs/help; conflicting overrides fail before effects.
- Validate workflow status identity or the explicit standalone record, canonical cwd/book-root and allowed actor/step/scope before mutation. Invocation ID is correlation, not permission. Legacy standalone calls retain existing explicit flag-based semantics; migrated audit and utility prompts must issue standalone bindings before receipt-aware append rather than silently choose legacy mode. Optional journaling cannot authorize writes.
- Cache lookup under git-common outbox; status event is durable authority. Bind to stable run-start identity and step occurrence, not mutable latest-row selection. Resume checks exact run occurrence; setup/no-plan/remediation/group/ship paths all use the current lifecycle/path functions.
- Consume observed host/model via existing run-facts/#836 hook; absent optional observation is explicit and nonblocking. Never obtain actual model by copying prompt frontmatter.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/ledgers/telemetry.ts`

- Extend optional append context while retaining `appendLedgerRows(root, ledger, rows)` callers. Merge authoritative `by` before validation; missing permitted fields fill, conflicting supplied values reject. Preserve current engine-owned schema/version/ts/repo/lineage and all writer allow-lists.
- Proposed `ledgers query --ledger [--key --status --limit --cursor --root]`: supported ledger names share APPEND_LEDGERS/codec. Default active knowledge/decisions includes absent status; failures/deferrals include OPEN/TRIAGED. Explicit `--status=all` exposes history winners irrespective of status. Fold normalized composite identities before filtering; order deterministically. Cursor includes snapshot/filter fingerprint, offset and stable ordering; content changes invalidate it. No page silently truncates coverage. Return diagnostics on every page, total and next cursor; missing/unreadable or invalid key/ts is non-clean. Valid winners remain accessible with explicit partial coverage; no mutation/repair.
- Proposed append `--operation` (engine-issued ID) plus `--invocation`, with `--reconcile` to inspect/recover the recorded effect. Both workflow and explicit standalone audit/utility issuance provide these prerequisites before publication. Canonical request hash excludes minted metadata, includes target and completed authoritative attribution, and is stored before effects. Replay returns original minted rows/receipt; new operation permits same ledger key updates. ID/hash collision always rejects.

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/ledgers/journal.ts`, `.bkit/core/engine/commands/workflow/locks.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`

- Extend engine-action primitives with a separate strict ledger-operation record/reader. Keep `alreadyDone` changed-hash tracker behavior unchanged. Reuse/move only the low-level exclusive-create primitive into the existing leaf; retain locks caller API and avoid command-to-command import cycles.
- Engine issues an operation ID for the explicit invocation/target/sub-step through the invocation response or validated invocation update; it never derives it from a substantive ledger key. Persist prepared descriptor/receipt atomically in git-common outbox and typed status references. A logical recovery scope groups corrected candidates; each candidate ID/hash is immutable.
- Hold per-ledger lock while validating lineage, preparing exact bytes/offset/prefix hash, appending and fsyncing, and marking completion. Every engine writer to APPEND_LEDGERS targets must share this cycle-free leaf lock or visibly refuse pending ownership, including journal `appendFrictionRow` reached from dispatcher failures and owner pauses, plus compact/union and all other direct writers found in Task 4. Preserve journal append-only recurrence and optional telemetry error policy; a required receipt write remains required. No command imports into journal are allowed.
- Crash after preparation but before append: prove expected target prefix/length and append once. Crash after append before completed receipt: verify exact prepared block at offset and return same receipt. Partial block, unexpected rewrite, lock owner uncertainty or missing required state: report uncertain and block affected mutation without truncation, inventing completion or minting a fresh bypass operation. Release only owned locks; stale workflow-lock heuristics do not reclaim active append ownership. Receipt/state writes are required effects, never optional telemetry.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/issues.ts`

- Extend `steps stub` with proposed `--result-file` structured-result mode; `--from` remains required only for legacy copy mode, `--to` remains destination. Agent/result kind comes from invocation or explicit standalone `--agent`. Reuse `promptHeader`, `readHeader`, `parseFindings` and existing finish/gates. No `steps seed` command or separate serializer noun.
- Deterministically render headers/body/counts for registered result kinds; map each declared field to a derivation or explicit judgment. Preserve special verdict rules, incomplete finding exclusion and immediate critical-finding failure. Store and validate result/body fingerprint at `steps verdict/finish`; stale edits regenerate explicitly or reject before DONE. Missing evidence never produces PASS.
- Audit mode takes structured findings plus coverage and explicit prior-key/closure/grouping judgments once. Export its common validator/derivation API from existing `issues.ts`, which steps already imports; both steps rendering and comment result-file mode consume that API, with no issues→steps import or duplicated validator. Derive report-local IDs, counts, source links and ledger payloads; expose prior-key candidates without deciding equivalence. A runless audit/utility caller first obtains Task 1's explicit standalone binding and Task 4's operation receipts. All audit ledger writes use receipt-aware append; all tracker posting uses the existing publisher/#826 semantics. Group 3 finishes with `pnpm build` and compiled CLI result-render/comment smoke probes to catch import cycles before Group 4.

#### [MODIFY] `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/ledgers/status.ts`

- Invocation-bound `runs wait --once` records its actual poll observation and exact selection target. `runs dispatch` derives phase/attempts/allErrored/retrigger identity and emits `nextAction`/target from durable events. Managed mode rejects caller-supplied conflicting `--poll-result`, `--attempts`, `--all-errored`, `--retriggered`; legacy standalone behavior remains explicit.
- Extend `ledgers/status.ts` with a handoff target/observation union: target fixes provider/repo/head/branch/PR/workflow before discovery; none and provider-error observations carry that target without invented run fields; discovered pending/success/failure observations require matching run ID/attempt/workflow identity. Keep existing `validateCiSelection` failed-run/debug semantics unchanged and reuse only its applicable identity checks. Represent unresolved retrigger intent explicitly. Reentry preserves these events/counter limits, never copied success flags.
- Persist original HEAD, owned retrigger commit and original/observed remote ref with commit-created, push-completed and receipt-completed checkpoints, including the shared-checkout branch. Reconcile Git effects as well as provider evidence before another dispatch. A local bare-remote integration test interrupts after commit creation and after accepted push, restarts the real dispatcher, and asserts remote SHA, exactly one reachable intended retrigger commit, owned tree contents and receipt. Conflicting remote movement blocks another commit/push until resolved.
- Extend dispatcher `CommandError`/verb result metadata with an explicit effects classification and recovery route. Only marked pre-effect validation refusals permit correction; do not relabel generic usage errors after possible mutations. Deterministic fill happens first. Persist rejection/correction/success events for engine-derived invocation/sub-step/command-target scope; two corrected retries follow the first rejection, specific one-retry routes override, and every candidate/tool/resume shares the scope. Existing gate failures, permission policy and uncertain effects retain their explicit routes.

#### [MODIFY] `.bkit/instructions.md`, `.bkit/core/.agents/rules.md`, `.bkit/core/.bkit/jsonl.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/cli.md`, `.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`

- Update maintained shared wording, callers and catalogs for all eight findings. All six workflows use engine-issued context, correction state and CI facts. Replace bespoke full-ledger folding and manual derived header/audit arithmetic in affected prompts. Keep specialist semantic judgments and explicit recovery paths.
- Regenerate clauses/CLI references via existing tools, build dist and refresh installed mirrors with the existing upgrade path. Preserve five host renderings and GitHub/Linear/Jira/none modes; no tracked historical evidence rewrite.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. Existing commands/helpers and their public standalone contracts are extended in place. Manual arithmetic/folding/recovery passages are replaced within their maintained files, not retained as competing implementations; no artifact or module is superseded by a parallel new file.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/instructions.md` | Master clauses for deterministic bookkeeping, Failures/Commands/Recovery scope/Read-only helper recovery and exact precedence; synchronize carriers. |
| `.bkit/core/.agents/rules.md` | Align affected shared rules with accepted bounded recovery without weakening named gates or permissions. |
| `.bkit/core/workflows/bkit-{auto,design,plan,build,debug,ship}.md` | Explicit invocation and operation references, engine read/result/counter ownership, persisted CI handoff and revised failure routing. |
| `.bkit/core/prompts/*.md` affected by S4 | Replace copied metadata, full-ledger fold helpers, manual machine header/audit totals; retain findings/evidence/semantic judgments and existing specialized routes. |
| `.bkit/core/.bkit/jsonl.md` | Attribution/provenance, canonical query coverage, append operation receipts, no-write classification and replay/intent distinction. |
| `.bkit/core/.bkit/cli.md` | Handwritten shared contract plus generated flags/results/exit documentation from specs via `pnpm cli:sync`. |
| `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/prompts.md` | Invocation/result ownership and recovery descriptions; stop telling agents to copy configured pins as actual runtime models. |
| `docs/architecture.md` | Existing leaf helper ownership, status authority, outbox indexes/receipts and lock/reconciliation boundary. |
| `docs/testing.md` | Real-filesystem invocation/replay/fault injection fixtures and five-host/four-tracker consumer coverage. |
| `docs/observability.md` | Structured effects/recovery/receipt diagnostics, correlation and required-versus-optional persistence. |
| Installed host/catalog mirrors and `dist/` | Regenerate through existing build/upgrade tools; verify generated output matches source. No hand edits to generated copies. |

Technology/data-schema/design docs require no unrelated change: no new stack, database or UI. Existing doc index homes suffice; no new doc or scheduled job.

## Rollback Strategy

Code-only — `git revert` of the implementation commits is sufficient after active operations are reconciled. Preserve additive ledger/status history and outbox receipts; never delete or rewrite them to roll back. Stop new managed mutations, reconcile pending appends/dispatches with the version that created them, then revert/build/upgrade mirrors together. An unresolved partial effect remains blocked; running an older CLI must not be proposed as a bypass. No database migration or historical data conversion is required.

## Agent Execution Runbook

Twelve tasks in four groups. Maximum actual group size is five tasks and fifteen TEST FIRST cases, within the 5/25 caps; each task uses at most four cases in three files, below the 10/3 caps. `UPDATE` includes its named tests; each task fixes affected existing tests. One PR for all tasks is fine. Suggested sequencing is advisory, not a merge-method gate. Shared pieces with #836 (`docs/plans/202611/836-record-host-model-plan.md`) are built once: before Tasks 1, 4 and the commit-helper wiring in Task 4, check what #836 has landed (invocation record and receipt, the locked read-back status/ledger append boundary, current operation context for commit helpers); whichever lands first creates it, and this plan extends it without a second copy. Build #860 Task 4 and #836 Task 6 one after the other, never in parallel.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Explicit identity and canonical ledger contracts

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Bind managed commands to engine-issued invocation context (deterministic-bookkeeping-4; R1–R7, R21–R22).
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

- [x] **TASK 2:** Complete verified ledger attribution before validation (deterministic-bookkeeping-1; R6–R9).
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

- [x] **TASK 3:** Expose canonical complete ledger reads (deterministic-bookkeeping-2; R8–R11, R23).
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

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Record invocations and invocation-bound engine calls in the run's status log (owner decision, build decision 1; closes Task 1's status-authority and journal gaps).
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

<!-- bkit:task 11 start -->

- [x] **TASK 11:** Keep invocation issuance inside the issuing checkout and out of step timing (owner decision, build decision 2; closes verify attempt 5 gaps).
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: `status invocation` refuses a `--file` outside the issuing checkout's top folder before any write, so an invocation row never lands in another worktree's `status.jsonl` and an id is never tied to another worktree's run.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.ts`: add the `invocation` row type to `MARK_ROWS` so a step's minutes start at the previous step's row, not at an invocation row.
  - **DEPENDS ON:** 10.
  - **DONE WHEN:** `status invocation` with a `--file` from another worktree exits non-zero and changes no file, an id issued for one worktree's run is not accepted from another, step minutes ignore `invocation` rows, and the two tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `refuses to issue an invocation into a status file outside the issuing checkout` fails on the command exiting 0 or appending a row to the other worktree's log.
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `starts a step clock at the previous step row, not at an invocation row` fails on the step reporting fewer minutes than it took.

<!-- bkit:task 11 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Close the group 1 quality gate

<!-- bkit:task 12 start -->

- [x] **TASK 12:** Retype the one planned test call that fails the slop check (owner decision, build decision 3; closes the group 1 quality-gate gap).
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: the owner approved changing the call in `accepts verified unavailable model without confusing configured and observed models` from `writerProblem(unavailable as unknown as Record<string, unknown>)` to a call that passes a plain object, the way the other `writerProblem` calls in the file do, with no `as unknown as` cast. Keep every expectation of that test.
  - **DEPENDS ON:** 2.
  - **DONE WHEN:** The test no longer contains a double type cast, every expectation of it is unchanged and it passes, `pnpm bkit:slop:delta` reports no net-new finding for `telemetry.test.ts`, and `bkit:gate:static-unit` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts verified unavailable model without confusing configured and observed models` fails on the slop check flagging its double type cast (the test itself passes before and after, so it may be reported unproven and left for the owner at Step 15).

<!-- bkit:task 12 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Replay-safe writes and shared result rendering

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Reconcile ledger operations with durable receipts (deterministic-bookkeeping-7; R3, R8, R16, R20–R21, R25).
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

- [x] **TASK 5:** Extend existing step artifacts with deterministic result serialization (deterministic-bookkeeping-3; R12–R14, R23).
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

- [x] **TASK 6:** Derive audit bookkeeping from one validated result (deterministic-bookkeeping-6; R8–R9, R12, R15–R16).
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
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Durable continuation and maintained caller contracts

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19).
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

- [x] **TASK 8:** Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19).
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

- [x] **TASK 9:** Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25).
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
<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Challenge round 1 findings

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** An audit run that follows its prompt overwrites its own finished report: `steps stub --result-file --to=<Create>` replaces the anchored audit report (Probe Steps, Findings, Report, Project Instructions) with the short summary
      **Severity:** CRITICAL · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:2328` · **Round:** 1
  - **DONE WHEN:** Rendering an audit result never destroys an existing populated report: the `bkit:anchor` block and every template section the agent wrote survive the render. No agent can settle this alone, because `.bkit/core/prompts/bkit-audit-generate.md:164` sends the summary to `<Create>` (the report itself) while the audit result carries no body; the owner must decide whether the engine splices the Status / Report / Findings header and derived tables into the existing report, or writes the summary to its own path.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `audit result render keeps an existing anchored report intact` fails on `steps stub --agent=bkit-audit-generate --result-file` overwriting a report that holds a `bkit:anchor` block and filled Probe Steps / Findings sections, leaving only the rendered summary.

<!-- bkit:task 13 end -->
<!-- bkit:task 14 start -->

- [ ] **TASK 14:** A ledger append that crashes between its intent and its receipt can never be reconciled once its invocation goes stale, so the committed pending intent blocks `ledgers union`, compact, migrate and every `--correction-of` on that ledger for good
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1699` · **Round:** 1
  - **DONE WHEN:** A pending intent always has a reachable resolution: reconciliation by operation id alone (checking the prepared bytes at the recorded offset) works without the original invocation, or an engine verb resolves or abandons it with evidence, and teardown union does not fail forever on an intent another checkout wrote. No agent can settle this alone, because the request hash binds the invocation id (`ledgers.ts:1571`), invocations go stale when a newer run starts (`commands/lib.ts` `resolveInvocation`) and `.bkit/ledger-operations.jsonl` rides every bookkeeping commit via `.bkit/*.jsonl`, although the plan's Data Schema Changes row 'Ledger operation' places receipts in the git-common outbox; the owner must decide who may reconcile an intent and whether it is checkout-local or committed state.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `resolves a pending ledger intent after its invocation is stale` fails on a crash at the `prepared` checkpoint followed by a new run start leaving `ledgers union` exiting with 'replay them first' and every replay of the operation refused as a different request.

<!-- bkit:task 14 end -->
<!-- bkit:task 15 start -->

- [ ] **TASK 15:** Feeding the audit `ledgerRows` the engine prints straight into `ledgers append --invocation` is refused, because each row's `by.step` is `audit-<slug>` while the standalone invocation vouches for `audit:<slug>`; the integration test hides this by stripping `by`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:747` · **Round:** 1
  - **DONE WHEN:** The rows `steps stub --agent=bkit-audit-generate --result-file` prints append unchanged under the `--standalone=audit --name=<slug>` invocation: `auditLedgerRows` emits no `by` block (or one equal to the invocation's), and the integration test passes the printed rows verbatim.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `appends the printed audit ledgerRows verbatim under the standalone invocation` fails on exit 8 with `conflict: by.step="audit-security" disagrees with invocation`.

<!-- bkit:task 15 end -->
<!-- bkit:task 16 start -->

- [ ] **TASK 16:** A resumed re-trigger push on a feature branch force-overwrites a commit someone else pushed, whenever any fetch already moved `origin/<branch>` to it: the remote-movement guard only blocks when the tracking ref is stale, which is exactly when `--force-with-lease` would have failed anyway
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/runs.ts:1103` · **Round:** 1
  - **DONE WHEN:** At the `commit-created` checkpoint, a remote tip that is neither the re-trigger commit nor its ancestor blocks the push whatever `origin/<branch>` says, the remote commit stays reachable, and no `push-completed` row is written.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `blocks a resumed re-trigger push when the remote moved and the tracking ref already holds it` fails on the bare remote's foreign commit becoming unreachable after the dispatcher resumes from `commit-created`.

<!-- bkit:task 16 end -->
<!-- bkit:task 17 start -->

- [ ] **TASK 17:** After a crash leaves part of a prepared block in the ledger and the lock is cleared as the error message advises, a friction or plain append lands next (neither checks pending intents), and reconciling the operation then takes the 'none of ours landed: prepare afresh' branch and appends rows that already landed a second time
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1740` · **Round:** 1
  - **DONE WHEN:** Reconciliation prepares afresh only when no byte of the prepared block landed at the recorded offset; any landed prefix of the block followed by foreign bytes reports `UncertainEffect` and appends nothing, and no fold winner or lineage count is duplicated.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/journal.integration.test.ts` `refuses to re-append a partly landed block after a foreign writer appended` fails on a two-row operation whose first row and half of its second landed, followed by an `appendFrictionRow` write, being reconciled with exit 0 and the first row present twice.

<!-- bkit:task 17 end -->
<!-- bkit:group 5 end -->

<!-- bkit:group 6 start -->

### TASK GROUP 6: Challenge round 1 findings

<!-- bkit:task 18 start -->

- [ ] **TASK 18:** An agent that retries a lost `--issue-operation` append with the same rows but a different JSON key order gets a new engine-issued operation id and appends every row a second time, because the request hash is `JSON.stringify` of the raw rows, not a canonical form
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1471` · **Round:** 1
  - **DONE WHEN:** The issued operation id and the stored request hash (`ledgers.ts:1471`, `ledgers.ts:1571`) are computed from a key-sorted canonical serialization, so semantically equal rows replay the original receipt and append nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `issues the same operation for rows whose keys are reordered` fails on the second `--issue-operation` call returning `replayed: false` and the ledger gaining a second copy of the row.

<!-- bkit:task 18 end -->
<!-- bkit:task 19 start -->

- [ ] **TASK 19:** Audit ledger keys the engine derives are `<slug>-<title>`, while `bkit-audit-generate.md` defines new keys as `audit-<slug>-<content-slug>` and closes stale rows by the `audit-<slug>-` prefix, so rows the engine keys are never closed by later audit runs
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:734` · **Round:** 1
  - **DONE WHEN:** `auditEntries` derives new keys as `audit-<slug>-<content-slug>`, matching the prompt's key format and its closure prefix, and a derived key can never equal a report finding ID such as `<slug>-1`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `derives audit ledger keys under the audit-slug prefix` fails on `auditEntries` returning `security-missing-csrf-token` instead of `audit-security-missing-csrf-token`.

<!-- bkit:task 19 end -->
<!-- bkit:task 20 start -->

- [ ] **TASK 20:** A result file that is just `{}` (or omits `evidenceComplete` and `body`) renders a `Verdict: PASS` challenge or review artifact with an empty body, because `evidenceComplete` defaults to true
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1660` · **Round:** 1
  - **DONE WHEN:** `renderResult` requires an explicit boolean `evidenceComplete` (and a non-empty `body` for a PASS) and exits 6 writing nothing when either is missing, so missing evidence never becomes PASS.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `renders no PASS from a result that omits its evidence` fails on `renderResult(cwd, 'bkit-build-challenge-1', {})` returning text with `Verdict: PASS`.

<!-- bkit:task 20 end -->
<!-- bkit:task 21 start -->

- [ ] **TASK 21:** On a fresh consumer with no `docs/failures.jsonl` (coverage `missing`) or a ledger holding one malformed line (coverage `partial`), the prompts' 'follow `nextCursor` until `coverage.clean` is true' never terminates and names no route, so the agent loops, stops, or quietly treats the scan as clean
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-audit-generate.md:165` · **Round:** 1
  - **DONE WHEN:** Every prompt that reads `bkit ledgers query` (audit-generate, ship-deferred-sweep, debug-failure-diagnose and the five utility-update prompts) stops paging when `nextCursor` is null and routes on `coverage.status`: `missing` = no rows, `partial` = use the rows and report the diagnosed lines, `unreadable` = stop and report.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `routes every ledgers query reader on coverage status` fails on a prompt that cites `coverage.clean` without naming the `missing` and `partial` routes.

<!-- bkit:task 21 end -->
<!-- bkit:task 22 start -->

- [ ] **TASK 22:** Every issued invocation commits the developer's absolute checkout paths (home directory and username, e.g. `/Users/<name>/...`) into the tracked run `status.jsonl`, which ships in consumer repo history and bkit's public repo.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/status.ts:742` · **Round:** 1
  - **DONE WHEN:** The `invocation` event appended to the run's tracked `status.jsonl` holds no absolute path: `statusPath` and `bookRoot` are stored relative to the checkout top, and `worktree` is dropped or replaced by a one-way fingerprint. `rebuildInvocation` (`.bkit/core/engine/commands/lib.ts`) resolves them against the current top and still refuses a receipt for another checkout. Absolute paths stay only in the private outbox receipt.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `writes no absolute checkout path into the run's committed invocation event` fails on the appended `invocation` row containing the temporary checkout's absolute path in `statusPath`, `bookRoot` or `worktree`.

<!-- bkit:task 22 end -->
<!-- bkit:group 6 end -->

<!-- bkit:group 7 start -->

### TASK GROUP 7: Challenge round 1 findings

<!-- bkit:task 23 start -->

- [ ] **TASK 23:** Ledger-operation intents and receipts live in the committed, union-carried `.bkit/ledger-operations.jsonl`, not the private git-common outbox the plan names. A crash, or a branch that commits a receipt-less intent row, then propagates on merge and blocks `ledgers union` (worktree teardown), `ledgers compact` and the upgrade-path `migrateLedgers` in every checkout. The replay that would clear it needs the original request, which no other checkout can reproduce.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/ledgers/status.ts:675` · **Round:** 1
  - **DONE WHEN:** Intents and receipts are written under `<git common dir>/bkit-outbox/` with private file permissions, as the plan's Data Schema Changes row and `docs/security.md` § Workflow comment ownership require. No `bookPathspecs` or `UNION_PATHSPECS` entry stages or carries them. An intent row arriving in tracked content no longer blocks union, compact or migrate.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `keeps ledger operation intents and receipts out of committed book paths` fails on `appendLedgerRows` with an `operation` creating `<root>/.bkit/ledger-operations.jsonl`, or on a receipt-less intent row in that tracked file making `unionLedgers` throw.

<!-- bkit:task 23 end -->
<!-- bkit:task 24 start -->

- [ ] **TASK 24:** A line break in a header-bound result value (`report`, `issue` or `parent` in an audit result, or any free-text judgment) injects forged header lines and an early `<!-- verdict:end -->`. For example, a multi-line `report` that adds `Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0` makes `readHeader` read zero findings over the engine-derived `CRITICAL 1`. Because the cut-off header carries no `Fingerprint`, `fingerprintProblem` treats the artifact as hand-written and skips the stale check.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1566` · **Round:** 1
  - **DONE WHEN:** `renderResult` / `renderAudit` and `parseAuditResult` refuse (EXIT_INVALID, nothing written) any value that is rendered into a header line and contains CR or LF, including `report`, `issue`, `parent` and every judgment at `steps.ts:1652`. The `Report:` line `issues comment --result-file` builds applies the same rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses line breaks in header-bound result values` fails on `renderResult(cwd, "bkit-audit-generate", …)` with a CRITICAL finding and a multi-line `report` returning rendered text, whose written file `readHeader` then reads as `Findings: CRITICAL 0 …` with no fingerprint check.

<!-- bkit:task 24 end -->
<!-- bkit:group 7 end -->

The required shared wording in Task 9 is copied from #860:

> **Deterministic bookkeeping:** Use the engine's validated execution context and artifact data for metadata, counts, paths and serialization. Agents supply substantive findings and judgments. Do not invent missing attribution or replace conflicting evidence with a guess.
>
> **Recoverable execution errors:** Apply the command's explicit recovery route first. If validation guarantees that no changes were made, correct the input from verified evidence and retry at most twice. Keep this correction budget across helper rewrites, tool switches and resume. Verify the required outputs and continue from the interrupted sub-step after success.
>
> **Uncertain effects:** Inspect and reconcile the operation's durable state before retrying a write. Retry only when the engine can establish that it will not duplicate or corrupt an effect. Preserve work and report a blocker when the outcome cannot be established.
>
> **Failure boundary:** Enter Failure Path when the applicable recovery budget is exhausted, a required check still fails, required information or authorization is unavailable, or recovery cannot proceed safely. Recovery does not permit weakening tests, bypassing gates or granting approval. A recovered command error alone does not fail the workflow.

Precedence clarification belongs beside those clauses: a specific recovery route supplies its own limit and eligibility before the generic two-correction route; optional model telemetry unavailability is diagnostic, while missing author/run authority or required substantive evidence blocks the affected action. A permission escalation follows its existing authorization policy, never the generic correction allowance.

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** No parallel source module; all changes trace to Reuse Inventory.
- [ ] **Extensions landed:** Each named extension and existing-call compatibility test passes.
- [ ] **No gate weakened:** Existing authorization, test evidence and semantic gates remain enforced.
- [ ] **Red before code:** Every task's planned tests are recorded red or existing updated tests by the build tests step.
- [ ] **Tests unchanged:** Planned case evidence matches the implemented tests; no unapproved exception is added.
- [ ] **Gate 2 — Verified:** Build phase verifies the runbook DONE WHEN fields.

### 🔒 Gate 3: Testing & Documentation Check

Documentation verification: Task 9 covers every Documentation Updates row and generated mirror.

- [ ] **Docs index accurate:** Existing topic homes remain accurate; any necessary index correction stays with its affected doc.
- [ ] **Gate 3 — Verified:** Build phase records documentation/render evidence. These boxes are advisory; required deliverables are Task 9 DONE WHEN.

## Verification Plan

### Automated Tests

- [ ] **Static:** `pnpm instructions:sync`, `pnpm cli:sync`, instruction coverage/source checks, command help/catalog parity and syntax/prose/format checks.
- [ ] **Unit:** The matrix's command/codec/field/identity cases, plus impacted existing steps/challenge/locks/tracker/status/run-facts/host/model tests. Keep tests out of production tsconfig inputs.
- [ ] **Integration:** Real temporary git repositories/worktrees/files, direct journal/owner-pause competing writers, append concurrency and fault checkpoints, standalone audit/utility replay without a fabricated run, durable correction/CI resume and local bare-remote commit/push reconciliation. Check actual artifact/ledger/comment equality and fresh-consumer install/upgrade. Group 3's compiled CLI import-cycle probe must pass before Group 4. Ground truth includes exact ledger bytes/lineage/offsets, remote SHA, reachable retrigger count, owned tree contents, receipts and status events, not only exit status.
- [ ] **Full Local Gate Suite:** Deepest applicable `bkit:gate:static-unit-integration`, `pnpm build` and `bkit check`; follow existing awake wrapper/machine-lock scripts. No new migration, UI E2E or live provider lane is introduced; unchanged network calls remain exercised by existing provider fixtures and contracts.
- [ ] **Test Synchronization:** All 27 matrix cases belong to one task and run at their owning task. New files are unnecessary; reuse existing fixtures and maintain five-host/four-tracker rendered parity.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** Build phase records automated proof; the runbook DONE WHEN fields carry required checks.

### Manual Verification

Owner checks are advisory; unchecked boxes do not block approval or merge.

- [ ] In a disposable fresh consumer, issue a plan invocation and submit a failure finding without copied model attribution; inspect recorded actual/unavailable provenance and successful continuation.
- [ ] Repeat an operation after losing its response, then submit a deliberate same-key update with a new operation; inspect one replay effect plus one legitimate update and correct lineage.
- [ ] Interrupt a nonwaiting CI poll and a no-write correction, resume through the printed invocation inputs and confirm cumulative budgets/target identity remain unchanged.
- [ ] Inspect one generated audit report, appended rows and tracker draft; verify matching counts/IDs and explicit not-checked coverage.
