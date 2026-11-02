<!-- bkit:anchor
baseSha: e61e80f810a51316104dc1f865d49f38ca482274
baseRef: origin/dev
designPath: docs/plans/202611/826-append-routine-workflow-design.md
designBaseSha: fbc338ac6ab4f5ef01f489fc276dc7e2dff92284
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->
Verdict: PASS
<!-- verdict:end -->

# Consolidated workflow progress implementation plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals
Consolidate routine workflow reporting in the existing shared tracker publisher. Preserve exact outgoing source, recover uncertain delivery, and carry invocation ownership across startup, auto dispatch, resume and close. This plan covers WS-1 through WS-5 together. Workstream dependencies are WS-3 → WS-1/WS-2, WS-4 → WS-2/WS-3, and WS-5 → WS-1/WS-2/WS-3/WS-4. No prerequisite plan is required.

**Related Issues:** None. The input's design references only the current issue, [#826 — Append routine workflow step updates to one comment per run (open)](https://github.com/cbartens/bkit/issues/826).

## 👤 ⚠️ Acceptance Scenario
### Narrative
I can follow a workflow's progress without routine reports overwhelming the issue conversation. Decisions, failures, handovers and completion remain separate, visible comments, and replies already visible when bkit checks the issue keep their place in the conversation. If a tracker request has an uncertain outcome, I can see that uncertainty rather than being told that delivery was exactly once.
### Success Criteria
1. A clean uninterrupted build produces at most two bkit comments when progress fits one comment, identity and source state are available, and neither fallback nor an intervening comment requires another: progress and completion.
2. Decision pauses, failures, handovers and final close / Create PR reports each use a separate new comment; exact retries of those reports are deduplicated.
3. Before an edit, the engine establishes that its target is the newest created comment and still matches its last acknowledged revision. An intervening comment or external edit detected at that check causes a new progress segment; the remaining read/write race is disclosed.
4. Re-executing an acknowledged report adds no duplicate section. Prepared writes are reconciled before retry; an unresolved remote outcome or unchanged create-only fallback is reported as uncertain and can duplicate a report.
5. GitHub, Linear and Jira stay within their verified comment budgets, every section displays its original UTC time, and auto and its dispatched phase own separate progress state. Tracker edit-notification limitations are documented.

Criteria 3 and 4 carry the design's proposed departures from Q4; copying them is not owner approval. Until the owner answers the first two questions below, their strict defaults apply. A standalone degradation does not satisfy criterion 1 or an adapter's consolidation acceptance.
### Process Sketch
- **WHEN** a workflow starts → **THEN** its own progress comment opens.
- **WHEN** routine setup and execution reports arrive → **THEN** eligible progress receives each original section and UTC time once.
- **WHEN** a human reply, external edit or size overflow makes the segment ineligible → **THEN** only new progress starts another segment.
- **WHEN** an acknowledged report repeats → **THEN** its saved delivery is returned.
- **WHEN** a previous write is uncertain → **THEN** recovery inspects its identity before another write and reports unresolved ambiguity.
- **WHEN** attention is needed or the workflow ends → **THEN** a separate comment appears.
- **WHEN** auto dispatches a phase → **THEN** the phase opens separate progress state.
### Concrete Example
**Setup:** An operator runs build for an issue on a tracker whose adapter contract is verified. The owner has approved the chronology and uncertainty boundaries, and the progress body fits one comment.

**Steps:**

1. Start Workflow creates the progress comment with the generated first-line marker.
2. Worktree Setup and execution append timestamped sections to that comment after eligibility checks.
3. Repeating an acknowledged execution report returns its prior URL without adding a section.
4. A person replies; the next routine report starts a new progress segment after that reply.
5. A failure or decision report creates a separate attention comment; completion creates the final separate report.

**Outcome:** Routine progress remains readable, the person's reply stays ahead of later progress at the checked boundary, and attention and completion are distinct. With step 4 and attention reports omitted, the uninterrupted run has at most progress plus completion.
### Edge Cases
The first five rows retain the design's Key Edge Cases word for word.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Someone posts or edits a comment between the final read and the write; local serialization cannot make those provider actions atomic. | Apply the owner's selected chronology boundary; default to no consolidation edit without proven atomic support, and disclose postflight race detection. |
| A request succeeds remotely before its acknowledgment is saved locally. | Reconcile the same deterministic operation before retry; retain preparation and report ambiguity rather than infer absence. |
| A comment reaches its size budget, or one section itself needs multiple parts. | Measure the complete encoded body, roll over with only new content, and resume deterministic Unicode-safe parts at the first unacknowledged part. |
| A step retries with identical or changed output, a workflow resumes, or durable source state is missing. | Deduplicate acknowledged original-body identities; append changed versions immutably; seal missing or unsupported state without remote reconstruction. |
| An agent posts a fallback comment, a comment is deleted, or a tracker cannot expose adequate identity / revision evidence. | Keep create-only fallback verbatim, seal obsolete segments, and report aggregation unavailable; fallback does not establish consolidation acceptance. |
| Bootstrap adoption restarts or binds to a different target/run. | Reuse matching immutable files and binding; refuse conflicting adoption and preserve pending evidence. |
| Auto dispatch crosses worktrees or terminal posting follows the close commit. | Commit the auto bundle with phase setup under separate identity; prepare terminal source before close and retain a cleanup-safe acknowledgment journal. |
| Postflight inspection fails after a positive mutation acknowledgment. | Return done with the known URL, record postflight-unavailable, and seal the segment without requesting fallback. |
| Eligibility inspection fails before a mutation. | Return done: false with the exact standalone fallback bytes and perform no engine create/edit; a failed read does not establish absence. |
| Postflight inspection observes a comment created after the final eligibility read. | Keep the acknowledged write successful with its URL, seal that segment, and start a new segment for the next routine report under an explicitly approved chronology test contract. |
| Lock owner, pagination or remaining network budget is inconclusive. | Bound work, retain preparation, return the precise uncertainty reason, and release only the owned lock. |
| Pending routine delivery exists when attention is needed. | Allow independent attention operations under the short publication lock; seal prior progress after their new comment. |

### Derived Test Matrix
`Type` follows `docs/testing.md`. Unit transport fixtures verify interpretation; the @live rows independently verify the actual provider boundary. Numbers name the task that lands each test or contract probe.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Stable IDs, author, newest-created ordering and complete pagination; reject missing/inconsistent evidence. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Provider create/edit/read shapes and stable returned-representation fingerprints, including marker-preserving external edits. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Unsupported capabilities and strict chronology default never authorize edits. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Header-inclusive budgets, exact limit, overflow, non-BMP text and deterministic part receipts. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| Generated first-line marker, versioned h6 markers and original timestamp survive rendering/parsing. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| Immutable source, original-body identity, changed versions, atomic preparation and legacy action receipts. | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 3 |
| Conflicting invocation/target/version/source binding seals or refuses safely. | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 3 |
| Publication lock serializes processes, refuses unverifiable owners, reclaims only proven-dead owners and releases on every path. | Unit | `.bkit/core/engine/commands/workflow/locks.test.ts` | 4 |
| Routine create/append and acknowledged duplicate/changed report behavior across all segments. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Structured classification leaves decision/failure/handover/final reports separate and exact retries deduplicated. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Human replies/edits, deletion, missing state and unsupported evidence roll over with only new content. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| A failed bounded eligibility read returns done: false with unchanged standalone fallback bytes and zero engine create/edit calls. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Lost create/edit response reconciles before resend; unresolved outcomes never become fabricated receipts. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Partial parts, failed receipt and failed postflight preserve positive success and original source. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| A postflight intervening comment preserves acknowledged success and URL, seals the segment, and makes the next routine report create a new segment under an approved chronology test contract. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Global network/page/attempt limits include a real slow GitHub subprocess, retain preparation and release the owned lock after timeout. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Shared runGh/runTool optional deadlines terminate a real slow child and classify timeout without changing callers that omit the option. | Unit | `.bkit/core/engine/commands/lib.test.ts` | 6 |
| Two invocations retain the same ambiguous operation/source hash, perform reconciliation reads before any further write, and preserve pending evidence with no second mutation when inspection is inconclusive. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Independent attention delivery proceeds after unresolved routine publication. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Explicit bootstrap identity and restartable status adoption are committed before cleanup. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| Fileless auto transfer has separate phase ownership; terminal preparation survives close/cleanup/fresh clone. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| Redacted outcome events and counts distinguish logical operations, attempts, fallback requests and retained bytes. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 8 |
| Every rendered host/tracker clause preserves verbatim create-only agent fallback and explicit invocation context. | Unit | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | 9 |
| GitHub create/edit/read, external edit, pagination, marker survival, encoded ASCII/non-BMP boundaries and discarded-response reconciliation. | @live (golden) | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | 10 |
| Linear create/edit/read, external edit, pagination, marker survival, verified numeric/counting budget and discarded-response reconciliation. | @live (golden) | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | 10 |
| Jira Rovo deployed schemas, transformed representation stability, edit/read, paging, limits and discarded-response reconciliation. | @live (golden) | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | 10 |
| Clean build-shaped CLI run leaves two comments; interruption, resume, old receipts, issue-less paths and unchanged fallback retain the selected contract. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
### 👤 ✅ Human Confirmation
- [ ] **Acceptance Scenario confirmed:** I have reviewed the scenario and test matrix.

## 👤 ⚠️ Breaking Changes & Naming Review
No public command is removed, no runtime dependency is added, and no install/data migration is proposed. Existing action receipts remain readable. The visible change is that eligible routine reports edit an engine-owned progress comment; attention and terminal reports remain separate new comments.

New internal names are `tracker-progress/{workflow}-{runId}/`, versioned h6 section/revision markers, deterministic operation IDs, an invocation manifest, and a cleanup-safe Git-common delivery journal. The artifact model and optional invocation-context flags extend existing command contracts; shared output keeps `comment`, `commentFile` and `tracker.done` meanings. New diagnostics are additive. The two Q4 departures remain unapproved and retain the strict defaults above.
### 👤 ✅ Human Confirmation
- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision.

## 👤 ⚠️ Open Questions & Assumptions
- **Open Question:** Accept newest-at-final-preflight with local serialization and postflight detection as the chronology boundary?
  - **Options:** A) Accept this boundary — consolidation ships with an explicit remote read/write race. · B) Retain the literal never-edit-after-an-intervening-comment guarantee — block editing on adapters without verified atomic support.
  - **Recommended:** A), because GitHub's documented update contract supplies no issue-wide newest predicate.
  - **Default if unanswered:** B). No aggregation edit without verified atomic chronology support; the qualified two-comment result remains blocked wherever this cannot be proved.
- **Open Question:** Accept that an unresolved write followed by the unchanged agent fallback may duplicate a report?
  - **Options:** A) Accept the disclosed exception after attempted reconciliation — preserves the required fallback behavior. · B) Require unconditional no-duplicate delivery — block posting changes until a compatible idempotent provider/fallback contract is proven.
  - **Recommended:** A), because local records cannot establish a remote outcome through an outage.
  - **Default if unanswered:** B). Do not claim unconditional duplicate-free acceptance or enable the proposed posting change under an unproved contract.
- **Open Question:** How should incomplete provider contract evidence affect delivery scope?
  - **Options:** A) Retain all three adapters and require authenticated disposable-target contract evidence for each — preserves the requested outcome without assuming a pass. · B) Ask the owner to narrow scope to verified adapters and file separate work — reduces the release but changes the issue's scope.
  - **Recommended:** A).
  - **Default if unanswered:** A). All three stay in this runbook; missing evidence blocks the affected acceptance, and standalone fallback does not satisfy it.
- **Open Question:** What evidence establishes lost-response recovery?
  - **Options:** A) Run bounded mutation-and-discard probes through each production inspection path and implementation fixtures — proves identity and representation survive the transport. · B) Ship without it as experimental — leaves essential delivery claims unverified.
  - **Recommended:** A).
  - **Default if unanswered:** A). Task 10 requires this evidence; the read-only design spike proves no mutation recovery.
- **Open Question:** What evidence establishes lifecycle persistence?
  - **Options:** A) Require restart, adoption, auto transfer, terminal acknowledgment loss, cleanup and fresh-clone fixtures — verifies deterministic ownership. · B) Drop those persistence guarantees — reduces work but breaks the proposed resume outcome.
  - **Recommended:** A).
  - **Default if unanswered:** A). Tasks 7 and 11 exercise these cases with actual local files and subprocesses.
- **Open Question:** How should source loss and cross-machine concurrency be handled?
  - **Options:** A) Require one active publisher per invocation and roll over on missing source or conflicting revision evidence — fits the CLI model. · B) Add a shared remote coordination service — adds deployment and ownership beyond this design.
  - **Recommended:** A).
  - **Default if unanswered:** A). A local lock does not coordinate another machine; conflicts remain explicit.
- **Assumption:** Exact generated source may be retained as committed run artifacts. If source is lost or cannot safely be retained, resume cannot append old source and must seal the segment.
- **Assumption:** The owner supplies disposable GitHub, Linear and Jira targets and appropriate least-privilege permissions for Task 10. Missing targets, Jira credentials, scopes or verified budgets prevent that adapter's acceptance.
- **Assumption:** The design's confirmed Q1-Q3 decisions hold: separate auto/phase identity, documented edit-notification limits and a qualified two-comment result. Changing them requires updating affected acceptance and task conditions.
### 👤 ✅ Human Confirmation
- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption.

## Alternative Approaches & Recommendations
Extend `postForVerb` / `postCommentOnce`; retain `gh`, Linear GraphQL and Jira Rovo. The existing transports and Node filesystem/crypto primitives cover the implementation without a messaging service or runtime package.

The design rejects outbox-only authority, remote Markdown reconstruction, mutable active-only history, title-based classification and per-verb publishing policy. Durable immutable source and prepared/acknowledged records permit conservative recovery. The owner must settle the two Q4 departures before the weaker chronology/uncertainty guarantees become the accepted contract.

Official contracts were checked during planning: [GitHub issue comment API](https://docs.github.com/en/rest/issues/comments#update-an-issue-comment) describes ID-based mutation and raw body representations; [Linear GraphQL](https://linear.app/developers/graphql) supports introspection and requires checking GraphQL errors even with HTTP 200; [Rovo tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) describes dynamic discovery dependent on scopes. These documents establish transport directions, not live mutation, counting-unit, atomic chronology or recovery acceptance.
## Out of Scope
None. The plan implements the whole parent design. Its stated non-goals remain constraints on the solution: manual work comments keep their existing behavior, agents keep create-only fallback, and no new coordination service, credential path or configuration surface is introduced. No work needed by a success criterion is deferred.
## Suggested Scope Expansion
None. The related issues are closed: [#758 — Workflow optimisation: tracker, roadmap and ledgers (done)](https://github.com/cbartens/bkit/issues/758) is a completed parent, and [#387 — Close workflows leave stats.jsonl uncommitted after push](https://github.com/cbartens/bkit/issues/387) supplies commit-order regression context for Task 7. Both supplied failure rows are closed, and the deferral scan has no candidates. Task 7 preserves those lifecycle lessons without reopening or expanding their scope.
## Security & Privacy
- [x] **Role-Gated Mutation:** Edit only a comment acknowledged as created for the exact target/invocation and matching stable author/revision/fingerprint evidence. A marker alone grants no ownership.
- [x] **User Input:** Validate explicit invocation/target/status associations and state versions before constructing paths or mutating a tracker. Refuse conflicting binding and reject malformed/missing required provider fields.
- [x] **PII:** Retain only engine-generated source and publication metadata; hash remote bodies in memory. Redact all credential values and raw remote text from diagnostics and count summaries.
- [x] **Secrets & Credentials:** Reuse existing `gh`, Linear GraphQL and Jira Rovo authorization. Verify least privilege on disposable targets; introduce no Jira REST credential path.
- **New API Route / DB Table / Redirect / Webhook / Secret:** None. Provider responses are untrusted data. Source snapshots can contain report text already published by bkit; apply the existing no-secret/no-PII rules before preparation, not only while logging.
## Pre-Flight / Dependencies
### Core
- [x] **Package Management:** The existing manifest and lockfile are accessible. No dependency addition or update is proposed; the runtime dependency set remains empty.
- [x] **Dependency Versions:** `pnpm bkit:deps:outdated` completed and returned exit 1 because updates exist: oxlint-tsgolint `7.0.2004 → 7.0.2005`, @types/node `24.19.2 → 26.6.5`, and vite `6.4.5 → 8.3.5`. None is required here. The active decision retaining Vite 6 applies. Observed tools: Node `v24.16.0`, pnpm `10.34.7`, gh `2.102.0`; Node satisfies `>=24`.
- [x] **Existing-Solution Search:** The inventory below records publisher, receipt, lock, resolver, transport, splitter and test-fixture searches, plus official provider documentation.
- [x] **User Context:** The issue input, parent design and referenced local files are readable. Unresolved owner decisions and provider access prerequisites are named above.
- [x] **Project Context:** Folded decisions and knowledge were read by latest `ts` per key. Relevant guidance retains Vite 6, uses h6 tracker markers, places engine tests beside source, and derives journal ownership from the run's worktree.
- [x] **Testing & Quality:** Unit fixtures cover local interpretation; Integration covers real filesystem/CLI wiring; @live (golden) probes establish external contracts. No UI, database or migration tier applies.
- [x] **Prerequisite Plans:** None. All five design workstreams are in this plan.
### Conditional
- [ ] **Secrets & Env Vars:** `direnv exec .` reports `BKIT_GH_TOKEN=set`, `BKIT_LINEAR_API_KEY=set`, `BKIT_JIRA_API_KEY=unset`. Presence proves no scope. Verify disposable targets and required permissions before provider contract discovery and Task 10; obtain the missing Jira credential without printing values.
- [ ] **Provider Contract Discovery:** Before Task 1's tests or implementation, inspect the actual GitHub/Linear contracts and Jira Rovo deployed tool schemas with authorized disposable-target access. Record the exact create/edit/read request and response fields, required IDs, creation-order/page semantics and returned representation shape as redacted build evidence. Verify which metadata is available without claiming stable mutation round trips or proven budgets. Missing credentials, access or schemas block the affected adapter work; fixtures use only observed contracts. Task 10 performs the separate post-integration mutation, limit and recovery acceptance probes.
- **Schema State:** Not applicable; bkit has no application database.
- [x] **Architecture & UI:** Existing CLI publisher, status log, Git-common outbox and host rendering boundaries are the implementation homes. No application UI changes.
- [x] **Observability:** Existing `[bkit-<noun>]` stderr and one stdout result object remain the output contract. Delivery events use opaque identities and counts.
- **Notifications:** Edit silence is not universal; Jira project schemes and provider settings remain disclosed limitations.
### 🔒 Gate 1: Prerequisites Check
- [ ] **Acceptance Scenario confirmed:** A human has ticked the scenario confirmation.
- [ ] **Breaking Changes confirmed:** A human has ticked the naming confirmation.
- [ ] **Open Questions confirmed:** A human has settled or accepted the questions and assumptions, including both strict-default departures.
- [x] **Security & Privacy checked:** The applicable controls below are specified.
- [x] **Reuse Inventory complete:** Every planned capability and new file has a searched decision.
- [x] **Reuse reasons:** Every new file records its reason.
- [ ] **Gate 1 — Verified:** Complete owner decisions, provider access and the contract-discovery prerequisite before claiming build readiness or starting Task 1's tests/code. The proposed edit path remains disabled under the unanswered strict chronology default.
## Data Schema Integration
No application database is involved. Internal delivery metadata extends existing append-only run records and artifact storage.
### Data Schema Usage
Input: existing action receipts, explicit invocation manifest, immutable source/snapshots, and provider identity/revision evidence. Output: prepared operation, acknowledgment, uncertainty, adoption and delivery-outcome records. Remote bodies are hashed in memory as evidence; they never become outgoing aggregate source.
### Data Schema Changes
Add versioned internal Invocation, Section, Segment, Prepared operation, Acknowledgment, Uncertainty and Delivery outcome shapes beside the existing status/action contract. Keep historical `engine-action` readers compatible. This is additive internal state, not an install migration or public configuration surface.
## Reuse Inventory
The language server rejected the ignored worktree path; bounded source reads supplied symbol evidence. Text searches confirmed presence and checked for overlapping helpers rather than treating the language-server refusal as absence.

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Provider inspection and mutation | `.bkit/core/engine/commands/workflow/tracker.ts` | Symbol query for `postCommentOnce`; `rg -n` declarations; read `postComment`, `recentComments`, `JiraSession` transport area; official provider pages above. | Existing three transports, issue fetching and error classification. | EXTEND | Add typed identity/author/order/revision/capability evidence and ID-based editing to the existing clients. |
| Markers, timestamps, body budgets and parts | `.bkit/core/engine/commands/workflow/tracker.ts` | `rg -n` declarations and read marker/splitter contracts; read existing splitter and Jira tests. | `stampMarker`, `markerHashOf`, `splitAt`, `JIRA_COMMENT_LIMIT`. | EXTEND | Preserve the generated first line and standalone payload while adding stable section/part identities and complete-body counting. |
| Durable source and action identity | `.bkit/core/engine/ledgers/status.ts` | Read `actionKey`, `actionHash`, `alreadyDone`, `recordAction`; read status contract and active knowledge. | Existing action records and run identity. | EXTEND | Add delivery preparation/adoption/acknowledgment records without replacing successful legacy receipts. |
| Publication serialization | `.bkit/core/engine/commands/workflow/locks.ts` | Read `tryCreate`, `owns`, lock format, existing tests. | Exclusive creation and token ownership primitives. | EXTEND | Add a distinct short publication lock with host/process/start evidence; retain the workflow lock's existing age policy unchanged. |
| Explicit invocation resolution | `.bkit/core/engine/commands/lib.ts` | Read `RunContext`, `resolveActiveRun`, engine-journal resolution. | Structured command context and current run resolver. | EXTEND | Resolve publishing only from explicit session/invocation binding or exact run identity; the generic unique-run scan is not publishing authority. |
| Bounded GitHub subprocess execution | `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/lib.test.ts` | Symbol query for `runGh` refused the ignored worktree; `rg -n` located `runTool`/`runGh`; read their bodies and the existing real-subprocess output-limit tests. | `runGh` delegates to `runTool`, whose `spawnSync` currently has no timeout. | EXTEND | Add a backward-compatible optional deadline through the existing helper path and prove real child termination; callers omitting it keep their current behavior. |
| Bootstrap/session preparation | `.bkit/core/engine/commands/workflow/repo.ts` | `rg -l` session/outbox users; read session output contract. | Per-call `sessionDir`. | EXTEND | Persist the publisher's explicit invocation association and protect pending bundles from age cleanup. |
| Posting callers and lifecycle | `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/worktrees.ts` | `rg -l postForVerb`, bounded caller reads, `workflows start`, `postClose`, `sessionRemoval`, worktree lifecycle header. | Shared `postForVerb` callers and lifecycle boundaries. | EXTEND | Pass missing structured context and adopt/preserve artifacts without moving policy into individual verbs. |
| Commit and landing inclusion | `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/branches.ts` | Read `bookPathspecs`; locate landing stray checks and docs allowlist. | Existing feature log directory pathspec and docs landing. | EXTEND | Verify nested source/snapshots ride existing bookkeeping commits and landing; make only a targeted inclusion fix if the integration evidence shows omission. |
| Unit interpretation and recovery fixtures | `.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts`, `.bkit/core/engine/ledgers/status.test.ts` | Locate related test files; read fixture setup, receipt/retry tests and Jira transformed-body tests. | Fake gh/fetch boundaries, real temporary filesystem and git fixtures. | EXTEND | Add feature cases in existing module suites; real provider acceptance remains separate. |
| Cross-module lifecycle tests | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | `rg --files --hidden .bkit/core/engine` filtered for tracker/status/workflow tests; read `workflows.test.ts` fixture setup and tier rubric. | Module tests exist; no tracker integration suite covers startup→adoption→close across processes. | NEW | Reason (a): no candidate provides this cross-module lifetime surface; the required integration suffix separates its tier from existing module tests. |
| Rendered workflow contract checks | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | Read catalog guard setup; open host/tracker renderer test imports and workflow comment clauses. | Existing source/catalog guard and rendering helpers. | EXTEND | Assert the rendered publishing/fallback contract for every host and tracker. |
| Authenticated provider contract evidence | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | Read existing `spike/github-read.ts`; `rg --files` found no live tracker suite; reviewed testing's @live boundary rubric. | Existing probe promises read-only behavior and hardcodes the current issue. | NEW | Reason (b): adding mutations would violate that probe's read-only contract. A separate disposable-target probe uses the production publisher/inspection path and records controlled evidence. |
| Shared wording and operator contracts | `.bkit/instructions.md`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/cli.md` | Located exact Comments clause and interaction row; read catalog and CLI generation rules. | Shared clause source, interaction/workflow catalogs and generated CLI specs. | EXTEND | Clarify engine-owned edits while retaining agents' create-only fallback, then sync through existing tools. |

## Architecture & Component Changes
The shared publisher remains the only classification and delivery policy. The internal artifact home is `docs/plans/{month}/logs/{fid}/tracker-progress/{workflow}-{runId}/`, with immutable source and hash-addressed prepared snapshots. Git-common storage stages bootstrap transfer and retains terminal acknowledgment journals; it is not the durable source authority after adoption.

**Ledger rows:** `826-progress-durable-publisher`, `826-progress-central-policy`, `826-progress-original-body-identity`, `826-progress-immutable-versions`, `826-progress-auto-notifications-qualified-cap`, `826-progress-chronology-owner-gate`, `826-progress-uncertainty-owner-gate`, `826-progress-source-fit`, `826-progress-h6-markers`, `826-progress-create-only-fallback`, `826-progress-returned-fingerprint`, `826-progress-invocation-lifecycle`, `826-progress-bounded-delivery`.
### Database Migrations
None.

### Provider publisher

#### [MODIFY] `.bkit/core/engine/commands/workflow/tracker.ts`

- **Existence Check:** The file and shared publisher, marker, splitter, transport and outcome symbols were opened.
- Add typed create/edit/inspect adapters with exact target and stable comment/author identity, creation-order pagination, returned-representation kind/hash and verified revision tokens. Store accepted schema/counting/evidence version beside capabilities; reject missing evidence conservatively.
- Classify no-issue/none, attention/terminal, identified routine and ambiguous ownership in that order using structured purpose, never display titles.
- Deduplicate original body plus structured identity across every segment, preserve changed report versions, use original UTC timestamps, and build aggregate bytes only from saved source.
- Require the selected chronology boundary, newest-created identity, acknowledged returned fingerprint and equal revision token where available before editing. Missing/unstable representation evidence seals the segment. Postflight evidence can detect races but does not make them atomic.
- Budget the full encoded request including all markers and part labels. Retain GitHub `65,536` and Jira `32,767` only with verified counting semantics; establish Linear's limit rather than invent it. Deterministically split oversized sections without breaking Unicode and acknowledge each part.
- Prepare every operation before mutation. Reconcile pending create/edit identities before retry. Preserve `done: true` and the known URL after a positive mutation acknowledgment even if postflight or receipt persistence fails; retain preparation, seal eligibility as needed and expose warnings.
- Enforce a 60-second network budget, at most ten pages of at most 100 comments and at most three read/conclusively failed attempts; clamp existing shorter timeouts and rate-limit waits. Ambiguous mutations need reconciliation before another mutation.
- Pending routine operations serialize routine progress but permit independent attention operations once the short lock releases. New attention comments seal earlier progress. Keep the exact standalone `comment` and `commentFile` fallback body.
- Append durable redacted outcomes and project per-run/local summaries, counting deterministic logical operations separately from attempts and fallback requests.

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`

- **Existence Check:** Action-key/hash and action-receipt implementations were read.
- Extend the append-only action mechanism with versioned prepared/adoption/acknowledgment/uncertainty metadata and immutable file references. Persist source atomically before recording its reference. Validate target, format, hashes and invocation binding without rewriting earlier rows.
- Keep historical successful receipts effective. Unsupported/missing source seals a segment; it does not authorize tracker-body reconstruction.

#### [MODIFY] `.bkit/core/engine/commands/workflow/locks.ts`

- **Existence Check:** Exclusive-create and ownership primitives were read.
- Add a narrow target/invocation delivery lock using a distinct format and path. Bound acquisition to 30 seconds; reclaim only a proven-dead same-host process with matching start evidence. Age, remote ownership or inconclusive checks never authorize reclaim. Token-check release in a finalizer. Preserve existing workflow-lock semantics.

### Invocation and lifecycle wiring

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`

- **Existence Check:** `RunContext`, `resolveActiveRun`, `runGh` and `runTool` were read.
- Carry explicit command/purpose/workflow/session or durable invocation association to the publisher. Resolve bootstrap and closed-run binding deterministically; ambiguous fileless calls stay standalone with diagnostics. Do not use cwd, newest session or a unique unrelated active run as publishing identity.
- Extend `runGh` / `runTool` with an optional remaining-time limit forwarded to `spawnSync`. Preserve existing callers that omit the limit, existing shorter ceilings and missing-binary/error meanings. Classify a timed-out child distinctly so the publisher retains preparation and releases its owned lock within the delivery budget.

#### [MODIFY] `.bkit/core/engine/commands/workflow/repo.ts`

- **Existence Check:** Session creation/output contract was read.
- Keep invocation manifests and pending bootstrap bundles safe from ordinary session pruning. The first routine publisher creates the bound manifest once under its publication lock.

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.ts`

- **Existence Check:** The comment verb's flags, action key and publisher call were read.
- Accept and pass explicit session/invocation context for Start Workflow, auto's Dispatch and other fileless workflow callers. Manual issue comments remain standalone unless structured workflow ownership is supplied.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** The finish publisher call and structured step/group/attempt key were read.
- Pass those structured fields, exact run binding and purpose to the common publisher; recognize `build-decision` as attention centrally.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** Start, failure, session removal and terminal `postClose` boundaries were read.
- Adopt bootstrap source before setup commits, idempotently and with conflict refusal. Persist auto's bundle outside removable session storage, import it during phase setup under separate phase ownership, and prepare terminal source/operation binding before the close commit.
- After terminal publication, retain acknowledgment in a target/invocation-keyed Git-common journal; fresh clones reconcile committed preparation through provider markers. Preserve pending evidence through failure, session cleanup and worktree removal.
- Expose unresolved terminal journals and compact delivery totals without requiring an extra push solely for a post-close acknowledgment.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** The setup/removal lifecycle module was opened.
- Carry auto's finalized artifact bundle into a phase worktree and refuse destructive cleanup while pending source lacks verified adoption. Keep cleanup restartable and preserve real work.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** `bookPathspecs` includes the feature log tree.
- Keep nested immutable source/preparations in setup/step bookkeeping commits. Change inclusion only if the planned real-git integration case demonstrates the current pathspec misses them.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** Landing's doc allowlist and stray checks were located and opened.
- Carry the committed tracker artifact subtree through docs-only landing and teardown, without widening the landing to unrelated files.

### Verification and documentation

#### [MODIFY] Existing module suites

Extend `.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts`, `.bkit/core/engine/ledgers/status.test.ts`, `.bkit/core/engine/commands/lib.test.ts` and `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`. Their imports/fixture areas were opened. Each behavior-changing task owns its tests in the same task. Keep shared transport, action-reader, lock and result-shape suites passing when optional additions are omitted.

#### [NEW] `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

- **Reuse Check:** The inventory's cross-module lifecycle row records reason (a).
- Use real temporary consumer repositories, actual status/source files and spawned CLI processes; stub only external provider transport. Assert committed source and preserved journals, not only transport status.

#### [NEW] `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts`

- **Reuse Check:** The inventory's authenticated-provider row records reason (b).
- Use explicit disposable targets, the existing credentials and production inspection/publishing operations. Bound mutations, record provider-only IDs/revisions/counting/marker evidence, and deliberately discard selected acknowledgments to exercise reconciliation. Refuse unspecified targets and preserve ambiguous evidence.

#### [MODIFY] Shipped workflow sources and catalogs

Update the shared Comments clause in `.bkit/instructions.md` and sync it into `.bkit/core/workflows/bkit-auto.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md` and `.bkit/core/workflows/bkit-ship.md`. Add explicit invocation context at posting/start/transfer/close call sites. Update `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/workflows.md` and `.bkit/core/.bkit/cli.md`, then render mirrors once through upgrade. Existing marker filters continue to ignore generated comments, and the manual Tracker work comments rule remains unchanged.

Update `docs/architecture.md`, `docs/testing.md`, `docs/observability.md` and `docs/security.md` with the artifact topology, acceptance probes, outcome/recovery procedure and source-retention controls.

### Cron Jobs & Scheduled Tasks
None.
## Supersession Inventory
None. Existing publisher, transports, receipt helpers and lock primitives are extended in place. The recent-five-marker strategy remains only for appropriate unassociated legacy standalone calls; it does not become a second progress publisher. No replaced public artifact or forwarding shim is retained.
## Documentation Updates
<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/instructions.md` | Clarify engine-owned editing and verbatim create-only agent fallback through the shared clause source and sync tooling. |
| `.bkit/core/.bkit/trackers.md` | Update `comment-post-step`, provider capability/counting/notification matrix, marker ownership and reconciliation limits. |
| `.bkit/core/.bkit/workflows.md` | Document invocation association, source adoption, comment lifecycle, auto transfer, terminal preparation and cleanup. |
| `.bkit/core/.bkit/cli.md` | Update prose and regenerate command-spec regions through `pnpm cli:sync` for invocation flags, outcome reasons and summary output. |
| `.bkit/core/workflows/bkit-auto.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-design.md`, `bkit-plan.md`, `bkit-ship.md` | Pass explicit invocation context at required fileless/lifecycle calls and retain agent fallback policy on all trackers. |
| `docs/architecture.md` | Record durable tracker source/snapshot tree, invocation adoption and Git-common recovery journals. |
| `docs/testing.md` | Register integration coverage and the opt-in disposable-target @live recipe with blocked evidence prerequisites. |
| `docs/observability.md` | Record redacted delivery outcomes, logical-operation/attempt counts, byte growth, bounded recovery and pending journal inspection. |
| `docs/security.md` | Record exact-target ownership checks, returned-body evidence, validation, sensitive-source retention and credential boundaries. |

Generated host/catalog mirrors are refreshed through upgrade, not edited directly. Existing doc-index entries cover every updated canonical topic; the new test sits beside its source and the probe stays under the existing run log/spike convention, so no new general-topic document is introduced.
## Rollback Strategy
Code-only — `git revert` sufficient. Revert the feature code and regenerated payload/dist together. Preserve committed source/preparation files and pending local journals during rollback; existing action receipts continue to work, and old source-unaware publishing starts new standalone comments rather than editing progress. Rollback does not delete, rewrite or retract tracker conversation history. The risk window is any pending remote write: reconcile its saved operation before a manual repost, and retain uncertainty if provider evidence is incomplete.
## Agent Execution Runbook
The groups below are one implementation sequence. Each task lands its own tests and fixes existing tests affected by its changes. The strict owner defaults are prerequisites for enabling the proposed posting behavior; implementing conservative branches does not waive them. Unit filesystem cases use real temporary state, and Integration cases stub only the external tracker transport.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Provider evidence, rendering and durable records

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Extend provider inspection and mutation contracts.
  - **UPDATE:** `postComment` in `.bkit/core/engine/commands/workflow/tracker.ts`: return stable comment identity and mutation evidence through existing transports.
  - **UPDATE:** `recentComments` in `.bkit/core/engine/commands/workflow/tracker.ts`: add complete bounded inspection with creation-order evidence and stable returned-body representation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: cover adapter contract interpretation and safe unavailable evidence.
  - **DONE WHEN:** The blocking pre-flight discovery supplies the actual provider request/response schemas before tests/code use them. All three typed adapters expose create/edit/inspect, target/comment/author identity, ordering/pagination, stable representation fingerprints and versioned capability/budget evidence; the six named tests pass and unsupported/strict-default chronology never authorizes an edit. Adapter eligibility tests exercise the lower-level adapter contract without depending on Task 5's publisher. Live capability claims remain unaccepted until Task 10.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `returns owned comment identity and stable representation evidence` fails on mutation results losing comment ID, author or returned-body fingerprint.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `selects newest created comment across complete pages` fails on an updated older comment or incomplete page window being treated as newest.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `edits by verified comment id through each existing transport` fails on creating a new comment instead of executing the verified update shape.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `rejects marker preserving external edits` fails on surviving markers hiding a changed returned-body fingerprint.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `seals unavailable or unstable representation evidence` fails on missing metadata or normalization instability being treated as edit eligibility.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `requires atomic chronology support under the unanswered default` fails on an adapter without atomic newest-comment support advertising aggregation eligibility instead of the explicit aggregation-unavailable result.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Extend section rendering, budgets and deterministic splitting.
  - **UPDATE:** `splitAt` in `.bkit/core/engine/commands/workflow/tracker.ts`: account for complete encoded bodies and safe continuation parts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: retain first-line generated marker and add versioned run/segment/revision/section markers with original UTC times.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: add boundary, timestamp and marker interpretation cases.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** The five named tests pass; the renderer measures headers and markers, never splits a Unicode code point, reuses original times on retry and preserves the exact standalone fallback body. An unverified Linear budget cannot silently inherit another provider's limit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `budgets the entire encoded body at limit and overflow` fails on content that fits before headers exceeding the verified provider budget after rendering.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps non BMP code points intact in deterministic parts` fails on a surrogate pair being divided or a retry choosing different part identities.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves generated first line and extracts versioned h6 section markers` fails on aggregate/part markers disappearing in Markdown or Jira HTML interpretation.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reuses original section time without changing duplicate identity` fails on retry timestamps changing report identity or earlier displayed time.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `refuses aggregation with an unverified provider budget` fails on an unknown Linear counting limit being treated as a proven cap.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Add immutable source, preparation and invocation binding records.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: extend action metadata with the internal delivery records and validated source/snapshot references.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.test.ts`: exercise real temporary files and legacy receipt coexistence.
  - **DONE WHEN:** The six named tests pass; original bodies and hash-addressed preparations exist before their records, matching adoption is restartable, conflicts refuse, and old successful action receipts remain authoritative. Stored source growth and pending operations are available to the publisher without rewriting history.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/status.test.ts` `prepares immutable source before appending delivery records` fails on a record referencing unwritten or partially replaced source.
    - `.bkit/core/engine/ledgers/status.test.ts` `keeps original body identities and changed versions across segments` fails on timestamp-dependent identity or a changed report overwriting its prior source.
    - `.bkit/core/engine/ledgers/status.test.ts` `adopts the same invocation binding idempotently` fails on a restart creating another invocation or rewriting matching source.
    - `.bkit/core/engine/ledgers/status.test.ts` `refuses conflicting target workflow and run bindings` fails on one invocation being rebound to a different target or run.
    - `.bkit/core/engine/ledgers/status.test.ts` `seals missing corrupt and unsupported source state` fails on missing/hash-mismatched/version-mismatched state being considered appendable.
    - `.bkit/core/engine/ledgers/status.test.ts` `preserves legacy success receipts alongside pending delivery records` fails on delivery-state reads losing historical successful-action evidence or treating preparation as acknowledgment.

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Serialized publication and bounded recovery

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Add the narrow ownership-aware publication lock.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/locks.ts`: reuse exclusive creation and token ownership for a distinct delivery lock.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/locks.test.ts`: prove process serialization and refusal/reclaim boundaries.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** The four named tests pass with real temporary lock files/process identity; acquisition stops within 30 seconds, only a proven-dead same-host/start owner is reclaimed, and every exit releases only the caller's token. Existing workflow-lock tests retain their existing policy.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `serializes publication for one target and invocation` fails on two publishers both holding the same delivery lock.
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `bounds acquisition and preserves unverifiable owners` fails on an old, remote or inconclusive owner being reclaimed by age or on an unbounded wait.
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `reclaims only a proven dead matching process identity` fails on PID reuse or an alive process being treated as dead.
    - `.bkit/core/engine/commands/workflow/locks.test.ts` `releases only its delivery token on every exit` fails on failure paths retaining their own lock or deleting another owner's lock.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Implement central classification and acknowledged progress publication.
  - **UPDATE:** `postForVerb` in `.bkit/core/engine/commands/workflow/tracker.ts`: accept structured purpose and exact invocation association.
  - **UPDATE:** `postCommentOnce` in `.bkit/core/engine/commands/workflow/tracker.ts`: use durable records and the delivery lock for routine create/append and separate attention/terminal operations.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: add policy, eligibility and immutable-version cases.
  - **DEPENDS ON:** 1, 2, 3, 4
  - **DONE WHEN:** The eight named tests pass; eligible routine reports append only saved source, all acknowledged segments participate in deduplication, changed output appends, attention/final reports stay standalone, and strict owner defaults remain enforced. A failed bounded eligibility read performs no engine create/edit, returns done: false and preserves the standalone fallback bytes. Conclusively ineligible targets retain the separate safe rollover path. Returned fallback payloads remain byte-for-byte standalone reports.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `creates then appends routine sections under explicit invocation ownership` fails on every routine report creating a separate comment despite eligible verified ownership.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `deduplicates acknowledged reports across sealed segments` fails on a retry older than the last-five window adding its section again.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `appends changed report versions without replacing prior text` fails on altered output overwriting or suppressing its earlier version.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `classifies attention and terminal reports from structured purpose` fails on a routine summary staying standalone, an attention/final report being aggregated, or a misleading title changing those structured policies.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `rolls over after intervening comments external edits and deletion` fails on old progress being edited after the eligibility read detects a reply, changed body or deleted target.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `starts only new source after overflow or missing source` fails on copied old sections or remote-body reconstruction appearing in the next segment.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps standalone fallback exact and unassociated calls conservative` fails on an attempted routine aggregation replacing the standalone fallback bytes, or ambiguous ownership failing to report aggregation-unavailable while using standalone creation.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `refuses mutation after a failed eligibility read with exact fallback` fails on a bounded read failure authorizing an engine create/edit, returning success or changing the original standalone fallback bytes; assert zero mutation calls and done: false.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Implement recovery, bounded transport work and independent attention delivery.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: reconcile prepared operations, per-part acknowledgment and positive-success semantics.
  - **UPDATE:** `runGh` in `.bkit/core/engine/commands/lib.ts`: pass an optional remaining deadline through the existing GitHub transport without changing callers that omit it.
  - **UPDATE:** `runTool` in `.bkit/core/engine/commands/lib.ts`: bound the real child with the optional remaining-time limit and retain compatible error classification.
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: prove timeout termination/classification with a real slow child and unchanged behavior without the optional limit.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: inject response/receipt/postflight failures and budget exhaustion at the transport boundary.
  - **DEPENDS ON:** 5
  - **DONE WHEN:** The ten named tests pass; prepared create/edit is inspected before resend, partial reports resume at their first unacknowledged part, positive success keeps its known URL, unresolved outcomes preserve evidence, and independent attention is not hidden behind pending routine delivery. Under an explicitly approved chronology test contract, an intervening comment observed postflight seals the acknowledged segment, preserves success/URL and makes the next routine report create a new segment; the unanswered strict default remains unchanged. Total work obeys 60 seconds, ten pages of 100 and three eligible attempts, including real GitHub subprocess termination, preparation retention and owned-lock release. Two fresh invocations preserve and reconcile the same ambiguous operation before any further write.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reconciles lost create acknowledgment before another mutation` fails on a remotely created matching operation being posted again.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reconciles lost edit acknowledgment against intended revision` fails on an intended revision already present being resent or a foreign revision being overwritten.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `retains unresolved outcome without fabricated success` fails on incomplete inspection becoming absence or a successful receipt.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `resumes multipart delivery at first unacknowledged part` fails on an already acknowledged part being sent again after later-part failure.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps positive acknowledgment after receipt or postflight failure` fails on a known successful mutation requesting fallback or losing its URL/preparation.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `clamps requests retries and pagination to total delivery budget` fails on work continuing past the total budget/page/attempt cap or lengthening a shorter existing timeout; include a real slow gh child through runGh/runTool, assert bounded termination, durable preparation and owned-lock release.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `never blindly retries an ambiguous mutation` fails on a fresh invocation losing the first ambiguous write's prepared operation/source hash, omitting identifiable reconciliation reads, changing pending evidence after inconclusive reads or issuing a second mutation; assert stable operation identity and inspection-before-write trace across both invocations.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `allows independent attention while routine outcome is pending` fails on a pending routine operation suppressing failure/decision/handover publication or attention leaving the old segment editable.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `seals an acknowledged segment after a postflight intervening comment` fails on an observed comment inserted between final preflight and postflight changing the acknowledged write to failure, losing its URL, leaving the segment editable or appending the next routine report to it; use an explicitly approved chronology test contract.
    - `.bkit/core/engine/commands/lib.test.ts` `bounds a slow child with an optional deadline and classifies timeout` fails on runGh/runTool allowing a real slow child to outlast its supplied deadline or classifying the timeout as a missing binary; verify existing callers that omit the option retain their contract.

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Lifecycle integration, diagnostics and host contracts

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Wire explicit invocation lifecycle through existing command callers.
  - **UPDATE:** `RunContext` in `.bkit/core/engine/commands/lib.ts`: carry structured publishing association without generic active-run inference.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/repo.ts`: protect pending invocation staging during session pruning.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: accept explicit session/invocation association on fileless workflow posts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: pass step/group/attempt and exact run ownership to the common publisher.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: implement bootstrap adoption, auto bundle import, pre-close preparation and post-close acknowledgment journal retention.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: preserve/transfer source across worktree setup/removal and pending cleanup.
  - **READ:** `.bkit/core/engine/commands/workflow/ledgers.ts`: confirm nested feature artifacts are included in bookkeeping.
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: confirm docs-only landing carries the nested artifact tree.
  - **CREATE:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`: real consumer/CLI lifecycle coverage from the inventory's new integration surface.
  - **DEPENDS ON:** 3, 6
  - **DONE WHEN:** The eight named integration tests pass against actual temporary files, git commits/worktrees and fresh CLI processes, including two successive runs of the same phase/FID and both adopted and separate-worktree execution. Setup/step commits contain referenced source, adoption is restartable, auto has separate phase identity, terminal committed preparation survives cleanup/fresh-clone recovery, and legacy/no-issue/fallback behavior stays compatible. Preserve write-before-push close bookkeeping and assert no extra bookkeeping push solely for terminal acknowledgment. Make a targeted ledger/landing inclusion fix only if these tests expose a missing nested artifact.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `adopts bootstrap source across process restart before session cleanup` fails on startup source or invocation identity being lost before durable setup commitment.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `refuses conflicting adoption and reuses committed matching binding` fails on restart rebinding another target/run or duplicating adopted source; exercise two successive phase/FID runs in adopted and separate-worktree execution and assert distinct exact bindings.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `transfers auto bundle across worktrees with separate phase ownership` fails on Dispatch source being lost or the phase appending under auto's identity.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `prepares terminal source before close and retains journal after cleanup` fails on terminal publication lacking committed source, cleanup deleting its pending acknowledgment evidence or an extra bookkeeping push solely for acknowledgment; assert close records precede the CI-triggering push.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `reconciles terminal publication in a fresh clone from committed preparation` fails on a closed-run retry depending exclusively on the previous machine's outbox.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `lands nested tracker source through existing bookkeeping boundaries` fails on source paths referenced by committed records missing from the setup/landing result.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps clean build progress and completion to two comments` fails on a CLI build-shaped uninterrupted sequence creating routine comments separately under an approved test contract.
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves legacy receipts issue less skips and exact fallback through resume` fails on old acknowledged reports reposting, issue-less runs invoking transport, or fallback body bytes changing after interruption.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Expose redacted delivery outcomes and compact recovery summaries.
  - **UPDATE:** `TrackerOutcome` in `.bkit/core/engine/commands/workflow/tracker.ts`: add stable operation/segment/reason context while preserving done/skipped/fallback meanings.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: show local terminal journal uncertainty and per-run delivery totals.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: assert outcomes, counts and sensitive-data exclusion.
  - **DEPENDS ON:** 6, 7
  - **DONE WHEN:** The four named tests pass. Durable outcomes cover create, append, dedupe, rollover, conflict, eligibility-failed, uncertain, receipt-failed, postflight-unavailable, aggregation-unavailable, lock-unavailable and fallback-requested. Summaries count operations separately from attempts, retain recurring reason counts and source/snapshot bytes, and expose unresolved journals without raw discussion/credentials.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `records redacted delivery identity and reason for every transition` fails on outcome records omitting operation context or exposing secret/raw remote text.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `counts one logical operation across uncertainty and reconciliation` fails on retries or reconciliation inflating delivered-report totals.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `separates fallback requests recurring failures and transport attempts` fails on fallback-requested being counted as fallback-delivered or repeated failures losing their stable count.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reports retained snapshot bytes and unresolved terminal journals` fails on cleanup-hidden pending operations or cumulative snapshot storage being omitted from the local summary.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Synchronize workflow context, fallback wording and operator documentation.
  - **UPDATE:** `.bkit/instructions.md`: change the shared Comments clause through its authoritative source and sync tooling.
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: pass explicit invocation context and archive the auto bundle before phase dispatch cleanup.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: pass invocation/adoption/terminal association at lifecycle calls.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: pass invocation/adoption/terminal association in normal and soak paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: pass invocation/adoption/terminal association at lifecycle calls.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: pass invocation/adoption/terminal association at lifecycle calls.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: pass invocation/adoption/terminal association at lifecycle calls.
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: record capability/counting/notification contracts and engine-owned progress behavior.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: record the matching lifecycle and recovery contract.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerate CLI contract prose/spec outputs for new context and delivery outcomes.
  - **UPDATE:** `docs/architecture.md`: record the internal durable artifact and recovery-journal topology.
  - **UPDATE:** `docs/testing.md`: register the integration surface and explicit disposable-target @live recipe.
  - **UPDATE:** `docs/observability.md`: document outcome fields, logical counts, byte growth, retention and safe recovery inspection.
  - **UPDATE:** `docs/security.md`: document ownership/validation and sensitive-source controls.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`: assert effective rendered invocation and fallback contracts for all hosts/trackers.
  - **DEPENDS ON:** 7, 8
  - **DONE WHEN:** The two named guard tests pass. The shared clause tooling reports expected changes, CLI docs are synced from specs, each Documentation Updates row reflects implemented behavior, and one upgrade renders that source for Claude, Cursor, Codex, Antigravity and opencode with github/linear/jira/none coverage. Provider metadata remains explicitly unaccepted pending Task 10, which owns any evidence-driven capability/counting catalog and fixture revisions plus the final mirror refresh. Generated-marker input filtering and manual work-comment rules remain compatible.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` `renders explicit invocation association at fileless and lifecycle posting sites` fails on any host/tracker workflow losing the association required by the publisher.
    - `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` `renders engine progress authority with verbatim create only agent fallback` fails on rendered instructions granting an agent comment-edit authority or losing the exact fallback file/new-comment contract.

<!-- bkit:task 9 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Provider acceptance and executable release evidence

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Complete all three provider contract and lost-response probes.
  - **READ:** `docs/plans/202611/logs/826-append-routine-workflow/spike/github-read.ts`: preserve its read-only contract and reuse only the inspection approach.
  - **CREATE:** `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts`: bounded opt-in disposable-target @live probe from the inventory's new evidence surface.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: replace unverified capability/counting metadata only with actual recorded contract evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: align provider contract fixtures with the observed fields, stable representations and counting semantics; retain all existing behavioral assertions.
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: record the accepted capability/counting/notification evidence alongside the adapter changes, then refresh generated mirrors through upgrade after the final evidence-driven edits.
  - **DEPENDS ON:** 1, 2, 6, 7, 9
  - **DONE WHEN:** Each GitHub/Linear/Jira @live matrix row has authenticated production-path evidence for create/edit/read identity, stable returned representation, marker survival, external edits, creation-order pagination, exact complete-body ASCII/non-BMP budget/counting semantics and lost-response reconciliation. Record schemas, evidence version, targets by opaque fingerprint, known operation URLs and pass/blocked reasons. Evidence-driven adapter metadata, existing provider fixtures and the tracker capability/counting/notification catalog match in the same change; affected existing tests pass and final upgrade refreshes mirrors. All three adapter acceptance rows pass; missing credentials, permissions, targets, owner decisions or evidence leave this task incomplete rather than converting standalone fallback into acceptance.
  - **TEST FIRST:** n/a — @live (golden) probes plus synchronization of the existing provider fixtures with observed contract evidence; no new unit behavior is introduced here. The probe reaches real provider boundaries on explicitly disposable targets. Unit fixtures cannot prove these contracts, and no automatic CI live lane is introduced.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Verify the complete built CLI and retained on-disk footprint.
  - **READ:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: run the implemented module acceptance suite alongside the new integration surface.
  - **READ:** `docs/testing.md`: use existing Unit, Integration and provider-probe entry points.
  - **DEPENDS ON:** 9, 10
  - **DONE WHEN:** Build succeeds and committed `dist/` matches the changed engine. The named Unit and Integration suites and the existing static/drift checks pass; required provider evidence from Task 10 passes. A fresh scratch consumer runs the built `node dist/cli.js` reporting/lifecycle sequence, and inspection confirms two-comment clean behavior under the owner-selected contract, committed source/binding/preparation, preserved pending journals and unchanged fallback bytes. No required case is silently skipped, and the owner-selected chronology/uncertainty contract is stated in the evidence.
  - **TEST FIRST:** n/a — verification and generated-output synchronization only; behavior tests are landed with Tasks 1-9, and provider boundary probes with Task 10.

<!-- bkit:task 11 end -->

<!-- bkit:group 4 end -->
### 🔒 Gate 2: Code Implementation Check
- [ ] **No bolt-on:** Every new file traces to its inventory reason.
- [ ] **Extensions landed:** Every extended capability landed in its named source.
- [ ] **No gate weakened:** No type, lint, coverage or test gate was weakened.
- [ ] **Red before code:** Each Unit/Integration case has proven red or a valid existing-test update before its behavior task.
- [ ] **Tests unchanged:** Planned red assertions retain their strength.
- [ ] **Unproven tests:** Only a human-committed test exception may clear a missing proven red.
- [ ] **Gate 2 — Verified:** All implementation tasks and the selected owner contract are checked.
**Mandatory Tasks (Testing & Documentation):**
- [ ] Verify every matrix row maps to its task's named evidence.
- [ ] Fix existing tests affected by the implementation and run the relevant complete tiers.
- [ ] Confirm durable outcomes and local summaries expose each designed failure state.
- [ ] Complete each Documentation Updates row and refresh generated mirrors once.
### 🔒 Gate 3: Testing & Documentation Check
- [ ] **Docs updated:** Each Documentation Updates row is complete.
- [ ] **Docs index accurate:** Existing topic/index entries remain accurate.
- [ ] **Gate 3 — Verified:** Documentation and test evidence match the accepted behavior.
## Verification Plan
### Automated Tests
- [ ] **Static:** Run the existing static checks, changed-file formatting/type/lint and `bkit check`; run shared-clause and CLI sync checks after their sources change.
- [ ] **Unit:** Run the tracker, status, locks, commands/lib and catalog-parity test files, including every named Test First case. Transport fixtures assert mutation shapes, identity/fingerprint safety and result bodies, and real slow-child cases exercise the shared subprocess deadline.
- [ ] **Integration:** Run the new tracker integration suite against real temporary repositories/files and spawned CLI processes. Its source and journal assertions reach the local persistence boundary.
- [ ] **@live (golden):** Run Task 10's three disposable-provider probes separately, with explicit targets and bounded mutations. Retain blocked status for any missing owner decision, credential, scope or evidence.
- [ ] **Build Configuration:** Existing `tsconfig.json` excludes `**/*.test.ts`; the new integration test remains outside production `dist/`. The probe lives under run artifacts outside engine compilation.
- [ ] **Full Local Gate Suite:** The existing `bkit:gate:static-unit-integration` and drift checks pass through their declared scripts.
- [ ] **Built CLI dogfood:** Run `pnpm build`, then the built `node dist/cli.js` against a fresh scratch consumer and inspect actual source/preparation/manifest/journal files. Record real output and provider evidence with the selected chronology and uncertainty boundaries.
- **Test Synchronization / Migrations:** No UI E2E or database migration applies. Update each existing module test broken by changed transport/output shapes within its implementation task.
### 🔒 Gate 4: Automated Verification Check
- [ ] **Gate 4 — Verified:** Every applicable Automated Tests item above is checked with actual passing evidence. Required provider evidence that is unavailable remains incomplete and blocks this gate; no missing required case is reported as passing. Runbook `DONE WHEN` fields remain the implementation's completion contract.
### Manual Verification
> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** These boxes do not block merge or plan approval; required evidence is specified in the runbook.

- [ ] Follow one clean run on a disposable issue and confirm that the same progress URL grows while completion is separate.
- [ ] Add a reply or edit generated text, then confirm that new progress starts a new segment under the accepted chronology boundary.
- [ ] Trigger attention and a controlled uncertain delivery; inspect separate attention comments, original section times and the local recovery summary.
- [ ] Review provider edit-notification limitations and source/snapshot growth before routine use.
