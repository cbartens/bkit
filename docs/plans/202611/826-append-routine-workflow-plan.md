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

Consolidate routine workflow reporting in the existing shared tracker publisher. Try appending to the latest eligible engine-owned progress comment, then try a new comment when append is unavailable, failed or uncertain. Record exhausted comment problems as friction best effort and continue the workflow. A small source cache and available receipts support safe appends and duplicate suppression; comment state never becomes a delivery gate. This plan covers WS-1 through WS-5 together. Workstream dependencies are WS-3 → WS-1/WS-2, WS-4 → WS-2/WS-3, and WS-5 → WS-1/WS-2/WS-3/WS-4. No prerequisite plan is required.

**Related Issues:** None. The input's design references only the current issue, [#826 — Append routine workflow step updates to one comment per run (open)](https://github.com/cbartens/bkit/issues/826).

## 👤 ⚠️ Acceptance Scenario

### Narrative

I can follow a workflow's progress without routine reports overwhelming the issue conversation. Decisions, failures, handovers and completion remain separate, visible comments, and replies already visible when bkit checks the issue keep their place in the conversation. If a tracker request has an uncertain outcome, bkit tries a new comment and keeps the workflow moving; a missing or duplicate report does not stop my work.

### Success Criteria

1. A clean uninterrupted build produces at most two bkit comments when progress fits one comment, identity and source state are available, and delivery succeeds without fallback or an intervening comment: progress and completion.
2. Decision pauses, failures, handovers and final close / Create PR reports each attempt a separate new comment; exact retries are deduplicated when existing evidence permits.
3. Before an append edit, the engine establishes that its own target is the newest created comment and still matches its saved revision evidence. An intervening comment, external edit or inconclusive check sends the current report to a new comment; the remaining read/write race is accepted.
4. Identical reports are deduplicated where saved receipts or bounded marker lookup establish prior delivery. Failed or uncertain append attempts fall back to a new comment. If all comment attempts fail, friction is recorded best effort and the workflow continues successfully with respect to commenting.
5. GitHub, Linear and Jira use their verified comment budgets, sections show their original UTC time when available, and auto and its dispatched phase own separate progress state. Missing or invalid comment state and tracker edit-notification limitations are diagnosed without stopping the workflow.

The owner accepted the final-preflight race and possible duplicate reports. The later best-effort clarification controls earlier conflicting guarantees: all comment-specific preparation, cache, receipt, lock, inspection, transport, reconciliation and friction failures are nonfatal. Provider verification governs implementation claims; it never becomes a runtime workflow comment gate.

### Process Sketch

- **WHEN** a workflow starts or routine reports arrive → **THEN** bkit tries its own eligible progress comment with the original section time when available.
- **WHEN** a human reply/edit, size overflow or unavailable state prevents append → **THEN** bkit tries a new comment with only the current report.
- **WHEN** available receipts or bounded lookup identify an identical delivered report → **THEN** bkit returns the known delivery without another write.
- **WHEN** append fails or remains uncertain after a bounded check → **THEN** bkit tries a new comment; an occasional duplicate is accepted.
- **WHEN** all comment attempts or friction logging fail → **THEN** bkit continues with the substantive workflow result.
- **WHEN** attention is needed or the workflow ends → **THEN** bkit independently attempts a separate new comment.
- **WHEN** auto dispatches a phase → **THEN** the phase uses separate progress ownership.

### Concrete Example

**Setup:** An operator runs build for an issue on a tracker whose adapter contract is verified, and the progress body fits one comment.

**Steps:**

1. Start Workflow creates the progress comment with the generated first-line marker.
2. Worktree Setup and execution append timestamped sections to that comment after eligibility checks.
3. Repeating an execution report with available success evidence returns its prior URL without adding a section.
4. A person replies; the next routine report starts a new progress segment after that reply.
5. A failure or decision report attempts a separate attention comment; completion attempts the final separate report.
6. A routine append times out and a new-comment attempt also fails; bkit tries to log friction and continues the build even if that log write fails.

**Outcome:** Delivered routine progress remains readable, the person's reply stays ahead of later progress at the checked boundary, and attention and completion are distinct. Comment failures do not change the build result. With steps 4 and 6 and attention reports omitted, the uninterrupted successful run has at most progress plus completion.

### Edge Cases

The first five rows retain the design's Key Edge Cases word for word.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Someone posts or edits a comment between the final read and the write; local serialization cannot make those provider actions atomic. | Use the accepted final-preflight boundary; preserve acknowledged success and invalidate future append eligibility when postflight detects the race. |
| A request succeeds remotely before its acknowledgment is saved locally. | Use available bounded success recognition, then try a new comment if still uncertain; duplicates are accepted and no pending-delivery gate is created. |
| A comment reaches its size budget, or one section itself needs multiple parts. | Measure the complete encoded body, use only current content in new comments, and split Unicode safely; available part receipts suppress known repeats without guaranteeing delivery. |
| A step retries with identical or changed output, a workflow resumes, or durable source state is missing. | Use available original-body receipts, append changed text where possible, and start fresh progress after cache loss without remote-body reconstruction. |
| An agent posts a fallback comment, a comment is deleted, or a tracker cannot expose adequate identity / revision evidence. | Keep create-only fallback verbatim and nonfatal; unavailable append evidence selects a new comment. |
| Startup or run association restarts or conflicts with another target/run. | Reuse a matching invocation when available; a missing/conflicting cache skips append and attempts fresh progress without blocking. |
| Auto dispatch crosses worktrees or terminal posting follows the close commit. | Keep auto/phase identity separate; missing state starts a new comment and normal close/cleanup never waits for comment receipts. |
| Postflight inspection or receipt/cache persistence fails after acknowledged delivery. | Keep success and the known URL, invalidate append eligibility where needed, and log friction best effort without resending unnecessarily. |
| Eligibility inspection fails before an append. | Perform no edit of the old target; attempt the exact standalone current report as a new comment and continue after exhausted failure. |
| Lock owner, pagination or remaining network budget is inconclusive. | Bound optional work, reserve a new-comment opportunity, release only an owned lock best effort and continue the step. |
| Attention is needed after routine delivery remains uncertain. | Attempt its own new comment immediately; prior uncertainty cannot block it. |
| Comment preparation, both delivery paths or friction logging fail. | Contain comment-specific errors, warn when possible, stop recursive logging and preserve the substantive workflow result. |

### Derived Test Matrix

`Type` follows `docs/testing.md`. Unit transport fixtures verify interpretation; the @live rows independently verify the actual provider boundary. Numbers name the task that lands each test or contract probe.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Stable IDs, author, newest-created ordering and complete pagination; reject missing/inconsistent evidence. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Provider create/edit/read shapes and stable returned-representation fingerprints, including marker-preserving external edits. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Missing ownership/revision evidence selects new-comment behavior; the accepted preflight boundary does not require provider atomicity. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Header-inclusive budgets, exact limit, overflow, non-BMP text and deterministic part receipts. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| Generated first-line marker, versioned h6 markers and original timestamp survive rendering/parsing. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 2 |
| Small exact-source cache, stable original-body identity and legacy success receipts support safe append/dedupe when available. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 3 |
| Missing/corrupt/version-mismatched or conflicting cache and receipt failures invalidate append without blocking publication or workflow work. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 3 |
| Publication lock serializes processes, refuses unverifiable owners, reclaims only proven-dead owners and releases on every path. | Unit | `.bkit/core/engine/commands/workflow/locks.test.ts` | 4 |
| Routine create/append and duplicate/changed reports use available source and receipts without requiring historical delivery state. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Structured classification leaves decision/failure/handover/final reports separate and exact retries deduplicated. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Human replies/edits, deletion, missing state and unsupported evidence roll over with only new content. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Failed eligibility read performs no append edit and attempts a new comment with exact current-report bytes. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 5 |
| Failed/uncertain append uses bounded success recognition, then new-comment fallback; exhausted append/create failure preserves workflow continuation. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Partial multipart delivery and missing receipts permit loss/duplicates without blocking; known acknowledged delivery stays successful. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| A postflight intervening comment preserves success/URL and invalidates future append eligibility under the accepted race boundary. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Global network/page/attempt limits include a real slow GitHub child, reserve fallback opportunity and release an owned lock best effort. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| reserves new comment opportunity within total delivery budget | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 12 |
| Shared runGh/runTool optional deadlines terminate a real slow child and classify timeout without changing callers that omit the option. | Unit | `.bkit/core/engine/commands/lib.test.ts` | 6 |
| Independent attention delivery proceeds after routine uncertainty without a pending-operation gate. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 6 |
| Explicit startup/run association, separate auto/phase ownership and missing state across cleanup/fresh clone safely create fresh progress. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| Faults in preparation/cache/receipt/lock/transport/reconciliation and engine/MCP fallback preserve successful or failed substantive step outcomes. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| Redacted friction records exhausted comment problems best effort, and logging/diagnostic failures are nonfatal without recursive logging. | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 8 |
| Every rendered host/tracker clause preserves explicit invocation, exact create-only fallback and attempted-not-successful nonfatal comment gates. | Unit | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | 9 |
| GitHub create/edit/read, external edit, pagination, marker survival, encoded ASCII/non-BMP boundaries and discarded-response reconciliation. | @live (golden) | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | 10 |
| Linear create/edit/read, external edit, pagination, marker survival, verified numeric/counting budget and discarded-response reconciliation. | @live (golden) | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | 10 |
| Jira Rovo deployed schemas, transformed representation stability, edit/read, paging, limits and discarded-response reconciliation. | @live (golden) | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | 10 |
| Clean build-shaped CLI run leaves two comments; interruption, resume, old receipts, issue-less paths and unchanged fallback retain the selected contract. | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 7 |
| preserves a human correction after lost append recognition and a later report | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 13 |
| keeps auto startup with PR metadata and dispatch in one progress comment | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 14 |
| redacts malformed Jira authorization from live probe diagnostics | Integration | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | 15 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the scenario and test matrix.

## 👤 ⚠️ Breaking Changes & Naming Review

No public command is removed, no runtime dependency is added, and no install/data migration is proposed. Existing action receipts remain readable. The visible change is that eligible routine reports edit an engine-owned progress comment; attention and terminal reports remain separate new comments.

New internal names are a versioned active-progress cache in the existing Git-common outbox, h6 section identities and explicit invocation association. Optional invocation-context flags extend existing command contracts; shared output keeps `comment`, `commentFile` and `tracker.done` meanings. A failed tracker outcome does not change the substantive step verdict. Commenting has no durable pending-operation, committed-source or terminal-journal requirement. The owner accepted the preflight race, possible duplicate/lost reports and nonfatal fallback behavior.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision.

## 👤 ⚠️ Open Questions & Assumptions

No unanswered owner questions remain. All six recorded questions were answered A, followed by the controlling best-effort clarification in `docs/plans/202611/logs/826-append-routine-workflow/design-answers-2.md`.

- **Accepted operating assumption:** One active publisher owns an invocation. Local locks cannot coordinate another machine; conflicting evidence selects a new comment rather than authorizing an uncertain edit.
- **Accepted limitation:** Missing cache, cleanup or a fresh clone may lose append/deduplication evidence and produce a new or duplicate comment. No durable comment-delivery obligation blocks workflow work.
- **Verification prerequisite:** Disposable GitHub, Linear and Jira targets and least-privilege access are needed to prove each adapter's consolidation contract. Missing live evidence remains reported implementation verification work; running workflows continue with bounded new-comment behavior.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption.

## Alternative Approaches & Recommendations

Extend `postForVerb` / `postCommentOnce`; retain `gh`, Linear GraphQL and Jira Rovo. The existing transports and Node filesystem/crypto primitives cover the implementation without a messaging service or runtime package.

The design selects a small active-progress cache, available receipts and bounded best-effort fallback. It rejects remote Markdown reconstruction, title-based/per-verb policy, historical aggregate snapshots, durable prepared-operation queues and mandatory post-close journals. The owner accepts the final-preflight race and occasional missing/duplicate reports; workflow continuation takes precedence over unconditional delivery.

Official contracts were checked during planning: [GitHub issue comment API](https://docs.github.com/en/rest/issues/comments#update-an-issue-comment) describes ID-based mutation and raw body representations; [Linear GraphQL](https://linear.app/developers/graphql) supports introspection and requires checking GraphQL errors even with HTTP 200; [Rovo tools](https://developer.atlassian.com/cloud/rovo-mcp/guides/supported-tools/) describes dynamic discovery dependent on scopes. These documents establish transport directions, not live mutation, counting-unit, atomic chronology or recovery acceptance.

## Out of Scope

None. The plan implements the whole parent design. Its stated non-goals remain constraints on the solution: manual work comments keep their existing behavior, agents keep create-only fallback, and no new coordination service, credential path or configuration surface is introduced. No work needed by a success criterion is deferred.

## Suggested Scope Expansion

None. The related issues are closed: [#758 — Workflow optimisation: tracker, roadmap and ledgers (done)](https://github.com/cbartens/bkit/issues/758) is a completed parent, and [#387 — Close workflows leave stats.jsonl uncommitted after push](https://github.com/cbartens/bkit/issues/387) supplies commit-order regression context for Task 7. Both supplied failure rows are closed, and the deferral scan has no candidates. Task 7 preserves those lifecycle lessons without reopening or expanding their scope.

## Security & Privacy

- [x] **Role-Gated Mutation:** Edit only a comment acknowledged as created for the exact target/invocation and matching stable author/revision/fingerprint evidence. A marker alone grants no ownership.
- [x] **User Input:** Validate explicit invocation/target/status associations and state versions before constructing paths or mutating a tracker. Conflicting or malformed comment state invalidates append and selects a fresh comment without failing the workflow.
- [x] **PII:** Retain only engine-generated source and publication metadata; hash remote bodies in memory. Redact all credential values and raw remote text from diagnostics and count summaries.
- [x] **Secrets & Credentials:** Reuse existing `gh`, Linear GraphQL and Jira Rovo authorization. Verify least privilege on disposable targets; introduce no Jira REST credential path.
- **New API Route / DB Table / Redirect / Webhook / Secret:** None. Provider responses are untrusted data. The source cache contains engine-generated report text; apply existing no-secret/no-PII rules before caching or publishing, not only while logging.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** The existing manifest and lockfile are accessible. No dependency addition or update is proposed; the runtime dependency set remains empty.
- [x] **Dependency Versions:** `pnpm bkit:deps:outdated` completed and returned exit 1 because updates exist: oxlint-tsgolint `7.0.2004 → 7.0.2005`, @types/node `24.19.2 → 26.6.5`, and vite `6.4.5 → 8.3.5`. None is required here. The active decision retaining Vite 6 applies. Observed tools: Node `v24.16.0`, pnpm `10.34.7`, gh `2.102.0`; Node satisfies `>=24`.
- [x] **Existing-Solution Search:** The inventory below records publisher, receipt, lock, resolver, transport, splitter and test-fixture searches, plus official provider documentation.
- [x] **User Context:** The issue input, current design and all recorded owner answers are readable. All six questions are answered; the later best-effort comment policy controls conflicting earlier requirements.
- [x] **Project Context:** Folded decisions and knowledge were read by latest `ts` per key. Relevant guidance retains Vite 6, uses h6 tracker markers and places engine tests beside source. Existing owner decision keys are reused.
- [x] **Testing & Quality:** Unit fixtures cover local interpretation; Integration covers real filesystem/CLI wiring; @live (golden) probes establish external contracts. No UI, database or migration tier applies.
- [x] **Prerequisite Plans:** None. All five design workstreams are in this plan.

### Conditional

- [ ] **Secrets & Env Vars:** `direnv exec .` reports `BKIT_GH_TOKEN=set`, `BKIT_LINEAR_API_KEY=set`, `BKIT_JIRA_API_KEY=unset`. Presence proves no scope. Verify disposable targets and required permissions before provider contract discovery and Task 10; obtain the missing Jira credential without printing values.
- [ ] **Provider Contract Discovery:** Before Task 1's adapter tests or implementation use a request/response shape, verify the GitHub/Linear contract or Jira Rovo deployed schema. Record exact fields, IDs, creation ordering/paging and representation as redacted build evidence. Fixtures use observed contracts; unavailable evidence is reported honestly and unsupported runtime edits use new-comment behavior. Task 10 supplies post-integration mutation/limit/fallback verification. Missing provider evidence is an implementation-verification gap, never a comment-delivery gate for a running workflow.
- **Schema State:** Not applicable; bkit has no application database.
- [x] **Architecture & UI:** Existing CLI publisher, success receipts, Git-common outbox and host rendering boundaries are the implementation homes. No application UI changes or durable delivery subsystem is required.
- [x] **Observability:** Existing `[bkit-<noun>]` stderr and one stdout result object remain the output contract. Delivery events use opaque identities and counts.
- **Notifications:** Edit silence is not universal; Jira project schemes and provider settings remain disclosed limitations.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed:** A human has ticked the scenario confirmation.
- [x] **Breaking Changes confirmed:** A human has ticked the naming confirmation.
- [x] **Open Questions confirmed:** A human has confirmed the recorded answers and accepted operating limitations.
- [x] **Security & Privacy checked:** The applicable controls below are specified.
- [x] **Reuse Inventory complete:** Every planned capability and new file has a searched decision.
- [x] **Reuse reasons:** Every new file records its reason.
- [ ] **Gate 1 — Verified:** Confirm the recorded owner answers and verify provider shapes before using them. Record remaining live-evidence prerequisites without claiming they passed. Comment availability, delivery state and friction logging never gate a running workflow's substantive work.

## Data Schema Integration

No application database is involved. A small replaceable progress cache uses the existing Git-common outbox and available action receipts.

### Data Schema Usage

Input: available action receipts, explicit invocation association, exact cached engine source and provider identity/revision evidence. Output: active progress comment/source/section state, available success receipt, tracker outcome and best-effort friction. Remote bodies are hashed in memory as evidence; they never become outgoing aggregate source.

### Data Schema Changes

Add a versioned active-progress cache with target/invocation, comment ID/URL, exact outgoing aggregate, known section identities and available author/revision/fingerprint evidence. Reuse existing action key/body hash and success receipts. Missing or unwritable state is nonfatal; no pending-operation ledger, historical snapshots or terminal journal is introduced. Keep historical `engine-action` readers compatible. This is additive internal state, not an install migration or public configuration surface.

## Reuse Inventory

The language server rejected the ignored worktree path; bounded source reads supplied symbol evidence. Text searches confirmed presence and checked for overlapping helpers rather than treating the language-server refusal as absence.

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Provider inspection and mutation | `.bkit/core/engine/commands/workflow/tracker.ts` | Symbol query for `postCommentOnce`; `rg -n` declarations; read `postComment`, `recentComments`, `JiraSession` transport area; official provider pages above. | Existing three transports, issue fetching and error classification. | EXTEND | Add typed identity/author/order/revision/capability evidence and ID-based editing to the existing clients. |
| Markers, timestamps, body budgets and parts | `.bkit/core/engine/commands/workflow/tracker.ts` | `rg -n` declarations and read marker/splitter contracts; read existing splitter and Jira tests. | `stampMarker`, `markerHashOf`, `splitAt`, `JIRA_COMMENT_LIMIT`. | EXTEND | Preserve the generated first line and standalone payload while adding stable section/part identities and complete-body counting. |
| Progress source cache and action identity | `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/ledgers/status.ts` | Read `actionKey`, `actionHash`, `alreadyDone`, `recordAction`, publisher state and Git-common outbox usage. | Existing publisher, outbox and successful action receipts. | EXTEND | Keep a small exact-source cache and reuse available receipts; cache/receipt loss selects fresh progress without new delivery records. |
| Publication serialization | `.bkit/core/engine/commands/workflow/locks.ts` | Read `tryCreate`, `owns`, lock format, existing tests. | Exclusive creation and token ownership primitives. | EXTEND | Add a distinct short publication lock with host/process/start evidence; retain the workflow lock's existing age policy unchanged. |
| Explicit invocation resolution | `.bkit/core/engine/commands/lib.ts` | Read `RunContext`, `resolveActiveRun`, engine-journal resolution. | Structured command context and current run resolver. | EXTEND | Resolve publishing only from explicit session/invocation binding or exact run identity; the generic unique-run scan is not publishing authority. |
| Bounded GitHub subprocess execution | `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/lib.test.ts` | Symbol query for `runGh` refused the ignored worktree; `rg -n` located `runTool`/`runGh`; read their bodies and the existing real-subprocess output-limit tests. | `runGh` delegates to `runTool`, whose `spawnSync` currently has no timeout. | EXTEND | Add a backward-compatible optional deadline through the existing helper path and prove real child termination; callers omitting it keep their current behavior. |
| Startup/session association | `.bkit/core/engine/commands/workflow/repo.ts` | `rg -l` session/outbox users; read session output contract. | Per-call `sessionDir`. | EXTEND | Supply explicit invocation association; cleanup or missing state permits fresh progress and never waits for receipts. |
| Posting callers and lifecycle | `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/worktrees.ts` | `rg -l postForVerb`, bounded caller reads, `workflows start`, `postClose`, `sessionRemoval`, worktree lifecycle header. | Shared `postForVerb` callers and lifecycle boundaries. | EXTEND | Pass missing structured context, keep auto/phase separate and contain comment errors without changing substantive verdicts or cleanup. |
| Unit interpretation and recovery fixtures | `.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts`, `.bkit/core/engine/ledgers/status.test.ts` | Locate related test files; read fixture setup, receipt/retry tests and Jira transformed-body tests. | Fake gh/fetch boundaries, real temporary filesystem and git fixtures. | EXTEND | Add feature cases in existing module suites; real provider acceptance remains separate. |
| Cross-module lifecycle tests | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` | `rg --files --hidden .bkit/core/engine` filtered for tracker/status/workflow tests; read `workflows.test.ts` fixture setup and tier rubric. | Module tests exist; no tracker integration suite covers startup→run association→close across processes and every comment-boundary failure. | NEW | Reason (a): no candidate provides this cross-module lifetime surface; the required integration suffix separates its tier from existing module tests. |
| Rendered workflow contract checks | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` | Read catalog guard setup; open host/tracker renderer test imports and workflow comment clauses. | Existing source/catalog guard and rendering helpers. | EXTEND | Assert the rendered publishing/fallback contract for every host and tracker. |
| Authenticated provider contract evidence | `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts` | Read existing `spike/github-read.ts`; `rg --files` found no live tracker suite; reviewed testing's @live boundary rubric. | Existing probe promises read-only behavior and hardcodes the current issue. | NEW | Reason (b): adding mutations would violate that probe's read-only contract. A separate disposable-target probe uses the production publisher/inspection path and records controlled evidence. |
| Nonfatal friction and operator contracts | `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/instructions.md`, `.bkit/core/.bkit/trackers.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/cli.md` | Read existing tracker outcomes, error handling, friction append contract and shared Comments clause. | Existing prefixed diagnostics, `bkit ledgers append` and workflow catalogs. | EXTEND | Record exhausted comment failures best effort, retain create-only MCP fallback and make all comment gates attempted-not-successful. |

## Architecture & Component Changes

The shared publisher remains the only classification and delivery policy. A small replaceable record in the existing Git-common outbox stores the active comment, exact engine-authored aggregate, target/invocation and available revision/section evidence. Cache errors disable append and select a new comment. Commenting has no historical snapshot, prepared-operation, committed-source or terminal-journal requirement.

**Ledger rows:** `826-newest-at-final-preflight`, `826-uncertain-write-fallback-duplicates`, `826-three-provider-contract-evidence`, `826-lost-response-recovery-evidence`, `826-lifecycle-persistence-fixtures`, `826-single-active-publisher`, `826-commenting-best-effort-never-fails-workflow`, `826-progress-durable-publisher`, `826-progress-central-policy`, `826-progress-original-body-identity`, `826-progress-immutable-versions`, `826-progress-auto-notifications-qualified-cap`, `826-progress-chronology-owner-gate`, `826-progress-uncertainty-owner-gate`, `826-progress-source-fit`, `826-progress-h6-markers`, `826-progress-create-only-fallback`, `826-progress-returned-fingerprint`, `826-progress-invocation-lifecycle`, `826-progress-bounded-delivery`.

### Database Migrations

None.

### Provider publisher

#### [MODIFY] `.bkit/core/engine/commands/workflow/tracker.ts`

- **Existence Check:** The file and shared publisher, marker, splitter, transport and outcome symbols were opened.
- Add typed create/edit/inspect adapters with exact target and stable comment/author identity, creation-order pagination, returned-representation kind/hash and verified revision tokens. Store accepted schema/counting/evidence version beside capabilities; reject missing evidence conservatively.
- Classify no-issue/none, attention/terminal, identified routine and ambiguous ownership in that order using structured purpose, never display titles.
- Use available original-body receipts or bounded section-marker lookup to suppress known duplicates; append changed output without replacing earlier report text. Keep original UTC times when available and build aggregate bytes only from the engine's cached source.
- Require newest-created identity, engine ownership, saved returned fingerprint and any useful revision token before editing. Missing/unstable evidence selects a new comment. The owner accepts the final-preflight race; provider atomicity is not required.
- Budget the full encoded request including all markers and part labels. Retain GitHub `65,536` and Jira `32,767` only with verified counting semantics; establish Linear's limit rather than invent it. Deterministically split oversized sections without breaking Unicode and acknowledge each part.
- Try eligible append, then a new comment after unavailable, failed or uncertain append. Optional bounded recognition can avoid a duplicate; uncertainty never creates a pending-delivery gate. Preserve `done: true` and the known URL after acknowledged success even when cache/receipt/postflight work fails.
- Enforce at most a 60-second network budget, ten pages of 100 and three transport attempts in total, including lookup and fallback. Retain shorter existing timeouts and reserve enough budget for a new-comment attempt. Never retry an ambiguous append as another append without conclusive evidence.
- Attempt independent attention/terminal new comments despite prior routine uncertainty. Keep exact standalone `comment` / `commentFile` bytes for engine and agent fallback.
- Catch comment-specific errors across preparation, source, receipts, locks, inspection, transport, reconciliation and diagnostics. Exhausted delivery attempts append redacted friction best effort and return the substantive workflow result; friction failures warn when possible and never recurse.

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts`

- **Existence Check:** Action-key/hash and action-receipt implementations were read.
- Reuse existing action identity and successful receipts; preserve historical readers. A comment-specific receipt write/read failure is contained at the publisher and cannot fail the substantive command.
- Keep progress source in the small outbox cache rather than add prepared/adoption/uncertainty records to the status log. Missing receipt/source evidence permits a new comment, never remote-body reconstruction.

#### [MODIFY] `.bkit/core/engine/commands/workflow/locks.ts`

- **Existence Check:** Exclusive-create and ownership primitives were read.
- Add a narrow target/invocation append lock using existing ownership primitives. Bound acquisition to 30 seconds; reclaim only a proven-dead same-host owner with matching start evidence. Refusal or acquire/release failure selects new-comment behavior and nonfatal diagnostics. Token-check release in a finalizer and preserve workflow-lock semantics.

### Invocation and lifecycle wiring

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`

- **Existence Check:** `RunContext`, `resolveActiveRun`, `runGh` and `runTool` were read.
- Carry explicit command/purpose/workflow/session or exact status/run association to the publisher. Ambiguous or missing association uses standalone creation; do not infer another run from cwd, newest session or unrelated active-run scans.
- Extend `runGh` / `runTool` with an optional remaining-time limit forwarded to `spawnSync`. Preserve callers that omit it, shorter ceilings and existing missing-binary/error meanings. Timeout leads to bounded fallback and continuation, with owned-lock release best effort.

#### [MODIFY] `.bkit/core/engine/commands/workflow/repo.ts`

- **Existence Check:** Session creation/output contract was read.
- Supply a stable explicit invocation association for the session when available. Session pruning remains independent of comment receipts/cache; failed association or cleanup starts fresh progress without blocking workflow work.

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.ts`

- **Existence Check:** The comment verb's flags, action key and publisher call were read.
- Accept and pass explicit session/invocation context for Start Workflow, auto's Dispatch and other fileless workflow callers. Manual issue comments remain standalone unless structured workflow ownership is supplied.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** The finish publisher call and structured step/group/attempt key were read.
- Pass those structured fields, exact run binding and purpose to the common publisher; recognize `build-decision` as attention centrally.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** Start, failure, session removal and terminal `postClose` boundaries were read.
- Associate startup with the exact status/run when available, retain separate auto/phase identity and pass terminal purpose to the shared publisher. Missing or conflicting state selects a new comment.
- Contain every comment failure without changing the substantive step verdict, close bookkeeping, pushes or cleanup. No terminal preparation, post-close receipt journal or extra push is required for comment recovery.
- Surface failed/uncertain tracker outcomes and best-effort friction without creating pending-delivery obligations.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** The setup/removal lifecycle module was opened.
- Preserve explicit auto/phase separation through worktree setup. Normal removal never waits for comment recovery; an unavailable cache starts a new comment. Preserve real work under existing worktree safety rules.

### Verification and documentation

#### [MODIFY] Existing module suites

Extend `.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts`, `.bkit/core/engine/ledgers/status.test.ts`, `.bkit/core/engine/commands/lib.test.ts` and `.bkit/core/engine/audits/workflows/catalog-parity.test.ts`. Their imports/fixture areas were opened. Each behavior-changing task owns its tests in the same task. Keep shared transport, action-reader, lock and result-shape suites passing when optional additions are omitted.

#### [NEW] `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

- **Reuse Check:** The inventory's cross-module lifecycle row records reason (a).
- Use real temporary consumer repositories, actual cache/status files and spawned CLI processes; stub only external provider transport. Inject comment faults and assert the substantive result and next workflow work, including cleanup after lost state and failed friction.

#### [NEW] `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts`

- **Reuse Check:** The inventory's authenticated-provider row records reason (b).
- Use explicit disposable targets, existing credentials and production inspection/publishing operations. Bound mutations, record provider-only IDs/revisions/counting/marker evidence, and discard selected acknowledgments to verify bounded recognition, new-comment fallback and continuation. Refuse unspecified targets and report unavailable evidence honestly.

#### [MODIFY] Shipped workflow sources and catalogs

Update the shared Comments clause in `.bkit/instructions.md` and sync it into `.bkit/core/workflows/bkit-auto.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md` and `.bkit/core/workflows/bkit-ship.md`. Add missing explicit invocation context. In every provider block and comment gate, keep engine/MCP new-comment fallback and friction bounded/nonfatal: check attempted delivery, never successful delivery. Update interaction/workflow/CLI catalogs and render mirrors once through upgrade. Existing marker filters and manual work-comment rules remain compatible.

Update `docs/architecture.md`, `docs/testing.md`, `docs/observability.md` and `docs/security.md` with the small cache, failure-continuation probes, redacted friction, accepted duplicate/loss limits and source controls.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. Existing publisher, transports, receipt helpers and lock primitives are extended in place. The recent-five-marker strategy remains only for appropriate unassociated legacy standalone calls; it does not become a second progress publisher. No replaced public artifact or forwarding shim is retained.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/instructions.md` | Clarify eligible engine-owned append, exact create-only fallback, best-effort friction and nonfatal commenting through shared clause tooling. |
| `.bkit/core/.bkit/trackers.md` | Update `comment-post-step`, provider capability/counting/notification matrix, marker ownership and reconciliation limits. |
| `.bkit/core/.bkit/workflows.md` | Document explicit invocation, small-cache lifetime, separate auto/phase ownership and nonfatal engine/MCP fallback across close/cleanup. |
| `.bkit/core/.bkit/cli.md` | Update prose and regenerate command-spec regions through `pnpm cli:sync` for invocation flags, outcome reasons and summary output. |
| `.bkit/core/workflows/bkit-auto.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-design.md`, `bkit-plan.md`, `bkit-ship.md` | Pass missing invocation context and make comment/fallback/friction errors nonfatal in every provider block and attempted-delivery gate. |
| `docs/architecture.md` | Record the small outbox progress cache and explicit invocation ownership without a durable delivery subsystem. |
| `docs/testing.md` | Register integration coverage and the opt-in disposable-target @live recipe with blocked evidence prerequisites. |
| `docs/observability.md` | Record redacted append/new-comment/lost-report outcomes and best-effort friction; logging errors warn when possible without recursion or workflow failure. |
| `docs/security.md` | Record exact-target ownership checks, returned-body evidence, validation, sensitive-source retention and credential boundaries. |

Generated host/catalog mirrors are refreshed through upgrade, not edited directly. Existing doc-index entries cover every updated canonical topic; the new test sits beside its source and the probe stays under the existing run log/spike convention, so no new general-topic document is introduced.

## Rollback Strategy

Code-only — `git revert` sufficient. Revert feature code and regenerated payload/dist together. Existing success receipts remain compatible; obsolete or missing progress cache selects standalone comments. Rollback never deletes, rewrites or retracts tracker conversation history. An uncertain remote write may have succeeded, so occasional duplicates remain accepted; comment cleanup or reconciliation never blocks workflow work.

## Agent Execution Runbook

The groups below are one implementation sequence. Each task lands its own tests and fixes existing tests affected by its changes. The recorded owner answers authorize final-preflight chronology and possible lost/duplicate reports; every comment-specific path remains bounded and nonfatal. Unit filesystem cases use real temporary state, and Integration cases stub only external tracker transport. Real workflow work must retain its substantive success/failure outcome under every injected comment fault.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Provider evidence, rendering and progress cache

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Extend provider inspection and mutation contracts.
  - **UPDATE:** `postComment` in `.bkit/core/engine/commands/workflow/tracker.ts`: return stable comment identity and mutation evidence through existing transports.
  - **UPDATE:** `recentComments` in `.bkit/core/engine/commands/workflow/tracker.ts`: add complete bounded inspection with creation-order evidence and stable returned-body representation.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: cover adapter contract interpretation and safe unavailable evidence.
  - **DONE WHEN:** Actual request/response schemas are verified before tests/code use them. All three adapters expose the verified create/edit/inspect fields, target/comment/author identity, bounded creation ordering and useful revision/fingerprint evidence. The six named tests pass; missing/unstable evidence skips append, and the accepted final-preflight boundary requires no provider atomicity. Adapter tests stay independent of Task 5's publisher. Unsupported runtime edits use new-comment behavior; live consolidation claims require Task 10 evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `returns owned comment identity and stable representation evidence` fails on mutation results losing comment ID, author or returned-body fingerprint.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `selects newest created comment across complete pages` fails on an updated older comment or incomplete page window being treated as newest.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `edits by verified comment id through each existing transport` fails on creating a new comment instead of executing the verified update shape.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `rejects marker preserving external edits` fails on surviving markers hiding a changed returned-body fingerprint.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `seals unavailable or unstable representation evidence` fails on missing metadata or normalization instability being treated as edit eligibility.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `uses accepted final preflight eligibility without provider atomicity` fails on verified current ownership/revision evidence being rejected solely for missing atomic chronology, or on unknown ownership authorizing an edit.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Extend section rendering, budgets and deterministic splitting.
  - **UPDATE:** `splitAt` in `.bkit/core/engine/commands/workflow/tracker.ts`: account for complete encoded bodies and safe continuation parts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: retain first-line generated marker and add versioned run/segment/revision/section markers with original UTC times.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: add boundary, timestamp and marker interpretation cases.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** The five named tests pass; the renderer measures headers/markers, never splits a Unicode code point, preserves available original timestamps and exact standalone fallback bytes. Missing time/state starts the current report safely. An unverified Linear budget cannot inherit another provider's limit; unsupported aggregation selects nonfatal standalone behavior. Part receipts suppress only known delivered parts, with possible loss/duplicates accepted after failures.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `budgets the entire encoded body at limit and overflow` fails on content that fits before headers exceeding the verified provider budget after rendering.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps non BMP code points intact in deterministic parts` fails on a surrogate pair being divided or a retry choosing different part identities.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves generated first line and extracts versioned h6 section markers` fails on aggregate/part markers disappearing in Markdown or Jira HTML interpretation.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reuses original section time without changing duplicate identity` fails on retry timestamps changing report identity or earlier displayed time.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `refuses aggregation with an unverified provider budget` fails on an unknown Linear counting limit being treated as a proven cap.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Add a small exact-source cache and reuse available success receipts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: store versioned active-progress source, target/invocation, comment identity, section IDs and available revision evidence in the existing Git-common outbox.
  - **READ:** `.bkit/core/engine/ledgers/status.ts`: reuse existing action identity and success receipts without new delivery records.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: exercise real temporary cache files, source safety and nonfatal cache/receipt faults.
  - **DONE WHEN:** The six named tests pass. Exact cached engine source supports safe appends and stable original-body identity; matching invocation association can be reused, while conflicting/missing/corrupt/version-mismatched state invalidates append. Cache/receipt reads or writes may fail without throwing from the comment path. Existing successful receipts remain usable. No historical snapshots, prepared-operation queue, committed source or terminal journal is required.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `caches exact engine source with available progress identity` fails on cached aggregate bytes differing from generated source or state losing its target/comment/invocation association.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `keeps original body identity separate from time and changed output` fails on timestamps changing duplicate identity or changed text replacing an earlier cached section.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reuses matching invocation state without adopting foreign ownership` fails on exact association being lost unnecessarily or another target/run's comment becoming appendable.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `invalidates missing corrupt and unsupported progress cache` fails on bad cache becoming appendable or returned Markdown being substituted as outgoing historical source.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `contains cache read and write failures as standalone degradation` fails on real cache I/O errors escaping or preventing the current standalone publication path.
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `uses legacy receipts and contains receipt failures` fails on known legacy success being lost, nonexistent evidence becoming success or receipt I/O failure escaping the comment boundary.

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Safe append and bounded nonfatal fallback

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Add the narrow ownership-aware publication lock.
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

- [x] **TASK 5:** Implement central classification, safe append and new-comment selection.
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

- [x] **TASK 6:** Implement bounded append/new-comment fallback and a nonfatal comment boundary.
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

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Lifecycle integration, diagnostics and host contracts

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Wire explicit invocation lifecycle through existing command callers.
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

- [x] **TASK 8:** Record exhausted comment problems as friction best effort.
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

- [x] **TASK 9:** Synchronize workflow context, fallback wording and operator documentation.
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

<!-- bkit:task 12 start -->

- [x] **TASK 12:** Repair the real slow-child fixture under the owner's recorded authorization.
  - **READ:** `docs/plans/202611/logs/826-append-routine-workflow/build-decision-3-1.md`: controlling owner decision.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: use the existing stable dispatcher or explicit interpreter for the real child fixture, establish successful priming before the slow delivery, and observe actual transport attempts reliably.
  - **DEPENDS ON:** 8, 9
  - **DONE WHEN:** The existing budget test passes under the unit gate, its priming precondition is proven, and every original POST, count, cleanup, nonfatal and latency assertion remains intact. Both 200ms budgets stay unchanged. The tests step owns the authorized fixture repair; the code step reviews the resulting evidence without editing the frozen test. No production deadline, gate, timeout or configuration is weakened.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `reserves new comment opportunity within total delivery budget` fails on a fresh executable failing to establish priming state or record actual POST attempts before the existing 200ms deadline; this is an existing-test fixture update, with unchanged assertions reviewed against the group start commit.

<!-- bkit:task 12 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Provider acceptance and executable release evidence

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Complete all three provider contract and lost-response probes.
  - **READ:** `docs/plans/202611/logs/826-append-routine-workflow/spike/github-read.ts`: preserve its read-only contract and reuse only the inspection approach.
  - **CREATE:** `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts`: bounded opt-in disposable-target @live probe from the inventory's new evidence surface.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.ts`: replace unverified capability/counting metadata only with actual recorded contract evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: align provider contract fixtures with the observed fields, stable representations and counting semantics; retain all existing behavioral assertions.
  - **UPDATE:** `.bkit/core/.bkit/trackers.md`: record the accepted capability/counting/notification evidence alongside the adapter changes, then refresh generated mirrors through upgrade after the final evidence-driven edits.
  - **DEPENDS ON:** 1, 2, 6, 7, 9
  - **DONE WHEN:** Each GitHub/Linear/Jira @live matrix row has authenticated production-path evidence for create/edit/read identity, stable returned representation, markers, external edits, creation-order pagination and complete-body ASCII/non-BMP counting. Lost-response probes exercise bounded success recognition, new-comment fallback, possible duplicates and continued workflow work after exhausted delivery. Record schemas/evidence version, opaque targets, known URLs and pass/unavailable reasons. Adapter metadata, existing fixtures and tracker capability/counting/notification catalog match observed evidence; affected tests pass and upgrade refreshes mirrors. All three remain in scope. Missing live access/evidence remains explicitly incomplete implementation verification, never a runtime comment gate or a fabricated consolidation pass.
  - **TEST FIRST:** n/a — @live (golden) probes plus synchronization of the existing provider fixtures with observed contract evidence; no new unit behavior is introduced here. The probe reaches real provider boundaries on explicitly disposable targets. Unit fixtures cannot prove these contracts, and no automatic CI live lane is introduced.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [x] **TASK 11:** Verify the complete built CLI and nonfatal commenting footprint.
  - **READ:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: run the implemented module acceptance suite alongside the new integration surface.
  - **READ:** `docs/testing.md`: use existing Unit, Integration and provider-probe entry points.
  - **DEPENDS ON:** 9, 10
  - **DONE WHEN:** Build succeeds and committed `dist/` matches changed engine sources. Named Unit/Integration suites and existing static/drift checks pass; Task 10 provider evidence is recorded honestly. A fresh scratch consumer runs the built `node dist/cli.js` reporting/lifecycle sequence. Inspect the small outbox cache, available receipts, exact fallback bytes and real friction records; confirm clean two-comment behavior when delivery succeeds, and continued substantive work under every comment fault including failed friction. Cleanup/fresh clone can start fresh progress without committed comment source, pending journals or extra pushes. Missing required implementation evidence stays incomplete; no comment-delivery failure changes the workflow result.
  - **TEST FIRST:** n/a — verification and generated-output synchronization only; behavior tests are landed with Tasks 1-9, and provider boundary probes with Task 10.

<!-- bkit:task 11 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Challenge round 1 findings

<!-- bkit:task 13 start -->

- [x] **TASK 13:** A lost append response lets the next report overwrite an intervening human correction.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.ts:1817` · **Round:** 1
  - **DONE WHEN:** Recognizing a delivered section after a lost response preserves its successful outcome and known URL, but does not adopt an altered remote revision as future append authority. Retain append eligibility only when the recovered representation is proven to match the intended engine aggregate; otherwise seal the segment and start the next routine report in a new comment. A marker-preserving human correction survives that next report. The current recognition branch accepts ID, author and section marker, then saves the locally intended source with the human-edited fingerprint; its postflight sees the same edited revision and retains it. The existing recognition test has no intervening edit or third report. An independently rerun local built-export reproduction returned three successes, one comment, and correction-preserved true after recognition but false after the third report. This violates `docs/security.md` § Workflow comment ownership and `docs/architecture.md` § Tracker reporting boundary, beyond the accepted final-preflight race.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves a human correction after lost append recognition and a later report` fails on a marker-preserving edit between a lost append acknowledgment and recognition being overwritten by a subsequent routine report; assert acknowledged delivery remains successful, the correction remains intact, and the later report creates a fresh comment without editing the corrected segment.

<!-- bkit:task 13 end -->
<!-- bkit:task 14 start -->

- [x] **TASK 14:** Auto startup with a PR link prematurely terminates its routine progress segment.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:1084` · **Round:** 1
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: add optional `issues comment --purpose=routine|attention|terminal`; retain existing kind-based classification when omitted and use explicit terminal purpose for ended-run identity.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: pass `--purpose=terminal` on final Create PR reporting, then synchronize the CLI catalog and generated host contracts.
  - **DONE WHEN:** Ordinary PR-link metadata does not classify a report as terminal or select an ended-run identity. The actual auto startup command with `--pr-number`, followed by Dispatch in the same explicit session, shares one routine progress comment; an explicitly identified final Create PR report remains a separate terminal comment. Propagate that explicit completion purpose through the build caller and generated host contracts. The command currently treats every `prNumber` as terminal even though `.bkit/core/workflows/bkit-auto.md:126` uses it on Start Workflow. An independently rerun built-command reproduction returned two successful creates, no edit and no startup progress marker. The existing clean-build integration cases cover final PR reporting, but not this auto startup shape. This violates `.bkit/trackers.md` § Workflow comment delivery and the plan's routine-startup acceptance scenario.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps auto startup with PR metadata and dispatch in one progress comment` fails on the real startup and Dispatch CLI flag shapes creating two comments despite the same valid session; assert the routine aggregate contains both reports and a later explicit completion remains separate.

<!-- bkit:task 14 end -->
<!-- bkit:task 15 start -->

- [x] **TASK 15:** A malformed Jira credential is exposed in live-probe diagnostics.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts:35` · **Round:** 1
  - **DONE WHEN:** Every error diagnostic emitted by the live contract probe redacts configured tracker credential values before truncation and JSON serialization. The direct Jira schema-discovery fetch must not print the Authorization value when header validation fails. Preserve the diagnostic stage, useful non-secret failure classification, opt-in target checks and existing provider evidence. This enforces `docs/security.md` § Secrets Management and the plan's Security & Privacy requirement for redacted build evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `redacts malformed Jira authorization from live probe diagnostics` fails on the actual probe's `--discover` execution emitting a synthetic Jira token with an embedded newline in stdout or stderr; exercise the real header-validation failure without network traffic, including a long token whose unredacted message would be truncated, and assert the failure stage remains observable.

<!-- bkit:task 15 end -->
<!-- bkit:group 5 end -->

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
- [ ] Confirm bounded fallback, best-effort friction and continued substantive work under every designed comment failure.
- [ ] Complete each Documentation Updates row and refresh generated mirrors once.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Each Documentation Updates row is complete.
- [ ] **Docs index accurate:** Existing topic/index entries remain accurate.
- [ ] **Gate 3 — Verified:** Documentation and test evidence match the accepted behavior.

## Verification Plan

### Automated Tests

- [ ] **Static:** Run the existing static checks, changed-file formatting/type/lint and `bkit check`; run shared-clause and CLI sync checks after their sources change.
- [ ] **Unit:** Run the tracker, status, locks, commands/lib and catalog-parity test files, including every named Test First case. Transport fixtures assert mutation shapes, identity/fingerprint safety and result bodies, and real slow-child cases exercise the shared subprocess deadline.
- [ ] **Integration:** Run the new tracker integration suite against real temporary repositories/files and spawned CLI processes. Assert exact invocation separation, cache loss, close/cleanup/fresh clone, and unchanged substantive success/failure after comment faults. Include engine fallback and friction failures; rendered guards cover nonfatal MCP instructions.
- [ ] **@live (golden):** Run Task 10's three disposable-provider probes with explicit targets and bounded mutations. Record unavailable credentials/scopes/evidence honestly. These implementation checks never become runtime delivery gates.
- [ ] **Build Configuration:** Existing `tsconfig.json` excludes `**/*.test.ts`; the new integration test remains outside production `dist/`. The probe lives under run artifacts outside engine compilation.
- [ ] **Full Local Gate Suite:** The existing `bkit:gate:static-unit-integration` and drift checks pass through their declared scripts.
- [ ] **Built CLI dogfood:** Run `pnpm build`, then built `node dist/cli.js` against a fresh scratch consumer; inspect optional cache/receipts and best-effort friction. Verify append→new comment→friction/continue under actual injected failures, accepted duplicate/loss limits and no required delivery journal.
- **Test Synchronization / Migrations:** No UI E2E or database migration applies. Update each existing module test broken by changed transport/output shapes within its implementation task.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** Every applicable Automated Tests item has actual evidence. Required implementation evidence that is unavailable remains incomplete and is never reported as passing. This gate verifies the feature implementation, including nonfatal commenting; it never requires a running workflow's individual comment attempts to succeed. Runbook `DONE WHEN` fields remain the implementation completion contract.

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** These boxes do not block merge or plan approval; required evidence is specified in the runbook.

- [ ] Follow one clean run on a disposable issue and confirm that the same progress URL grows while completion is separate.
- [ ] Add a reply or edit generated text, then confirm that new progress starts a new segment under the accepted chronology boundary.
- [ ] Trigger attention and controlled uncertain append/create failures; confirm separate attention attempts, exact fallback text, best-effort friction and continued workflow work.
- [ ] Delete or corrupt the comment cache and make friction logging unavailable; confirm fresh-comment behavior or a brief warning without workflow failure.
- [ ] Review provider notification limitations and accepted occasional missing/duplicate reports before routine use.
