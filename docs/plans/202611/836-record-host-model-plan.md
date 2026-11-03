<!-- bkit:anchor
baseSha: 4c5ad3d564965fe0f1c2c5f5d0340d7fa3228d1e
baseRef: origin/dev
designPath: docs/plans/202611/836-record-host-model-design.md
designBaseSha: 60e805249d8845b89fd7b17e9831923e10d91cac
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS
<!-- verdict:end -->

# Record Host and Model Implementation Plan

> [!CAUTION]
> **Purpose:** Implement the reviewed host, model and commit-attribution contract in the existing workflow engine.
> **Rules:** Preserve the source design's capability gates. Human confirmation boxes remain for the owner.

## Context & Goals

The current engine records only ambient Claude session identity and omits execution models from outcomes. Extend the existing status log, lifecycle commands, commit helpers and outcome reporting to make attribution inspectable across all five hosts, resumes and subagents. The source is `docs/plans/202611/836-record-host-model-design.md`; this plan covers WS-1 through WS-6 as one deliverable. Dependencies are WS-2 after WS-1, WS-3 after WS-1/WS-2, WS-4 after WS-1/WS-2/WS-3, WS-5 after WS-2, and WS-6 after all preceding workstreams. No prerequisite external plan is required.

**Related Issues:**

- #526 — Telemetry: record per-workflow OpenCode cost in stats.jsonl (state not re-read) — https://github.com/cbartens/bkit/issues/526
- #721 — Model registry (state not re-read) — https://github.com/cbartens/bkit/issues/721
- #752 — Provider support (state not re-read) — https://github.com/cbartens/bkit/issues/752

## 👤 ⚠️ Acceptance Scenario

### Narrative

After a workflow finishes, I can tell from the repository which hosts and models did the work, including subagents and resumed sessions, and where the available evidence has gaps. I can also see the host responsible for each workflow commit in its `bkit-host` trailer.

### Success Criteria

1. Every start or resume on each supported host produces a session record with that host when the current caller is established, or explicit `unknown` when it cannot be distinguished.
2. Committed records contain chat fingerprints and normalized model facts, with no raw chat ids, local host paths or transcript content.
3. The run log, outcome and `bkit stats` show observed orchestrator and subagent models across recorded sessions, including switches; configured fallback models are labelled unverified and incomplete coverage is explicit.
4. Every workflow-created commit carries exactly one lowercase `bkit-host` trailer naming the committing operation's host, or `unknown`.
5. Missing, unreadable, unsupported, busy or oversized host records leave visible reporting gaps and never fail or indefinitely delay workflow completion.

### Process Sketch

- **WHEN** Codex runs inside a Claude Code shell **→ THEN** current-caller evidence identifies Codex, or reports uncertainty without selecting the inherited Claude chat.
- **WHEN** the host cannot be determined **→ THEN** the session and commit trailer explicitly say `unknown`.
- **WHEN** models change during a run **→ THEN** the final report includes observed models and their coverage.
- **WHEN** a subagent's actual model is unavailable **→ THEN** its dispatch-time configured model is shown as unverified, or configuration is explicitly unavailable.
- **WHEN** another host resumes the run **→ THEN** earlier persisted evidence remains represented and subsequent commits name their committing host.
- **WHEN** local host records cannot be read **→ THEN** the run completes within a bounded collection budget with the gap visible.

### Concrete Example

**Setup:** A maintainer starts a workflow in Codex from a Claude Code shell, then resumes it on another host with the committed run log available.

**Steps:**

1. The maintainer starts the workflow → a current-invocation session record names Codex when proven, with a fingerprint only when its chat association is proven.
2. The maintainer runs a subagent and switches model → checkpoints retain attributable observed facts and the subagent's dispatch-time configured fallback separately.
3. The maintainer resumes on another host and closes → committed evidence from the earlier machine remains in the outcome and stats; each new commit names its own operation's host.

**Outcome:** The repository answers which hosts and models worked on this run and identifies any unsupported or uncollected interval.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A host launches another and passes down its environment, or loads another host's visible skill. | Corroborate current caller independently; reject inherited identities and unbound declarations. |
| Concurrent chats and worktrees share a repository or host store. | Select exact invocation/session evidence and serialize checkpoint acknowledgement per run/source. |
| Models switch, subagents use different models, configuration changes, or a run resumes on another host or machine. | Preserve all acknowledged sessions and model facts; configuration snapshots remain unverified. |
| Model records lack a reliable run interval, agent relation or event boundary. | Retain supported session-scoped evidence and report ambiguous or unlinked ownership. |
| Records are deleted, incomplete, not flushed yet, unsupported or unavailable on the closing machine. | Preserve prior evidence, show range-specific coverage gaps and obey the collection deadline. |
| A landing or remote squash creates a commit after the final telemetry snapshot. | Resolve that operation's host and assert exactly one lowercase trailer in its final message. |
| A native identifier or model string is malformed. | Validate before path/query construction; exclude control characters and models longer than 256 characters. |
| A checkpoint append is failed, uncertain, truncated or followed by a crash. | Do not advance beyond a complete flushed and parsed acknowledgement; replay idempotently. |
| SQLite acquisition would create or change a host sidecar. | Leave that live reader disabled with `acquisition-unsupported` until a coherent no-write route is proven. |

### Derived Test Matrix

`Unit`, `Integration` and `@live` are the tiers in `docs/testing.md`. Fixture tests prove local protocol behavior; live capability checks prove actual host and remote boundaries. Each row names the task that lands its test or executable verification.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A mixed legacy/new stream validates run-linked evidence and explicit unknown/null while legacy absence remains not recorded; private or malformed values are rejected. | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 1 |
| Execution outcomes validate normalized facts, basis/scope and bounded coverage without changing `by.model`. | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 1 |
| Evidence union deduplicates facts/attempts, resolves only recovered ranges, and excludes observation rows from timing. | Unit | `.bkit/core/engine/commands/workflow/run-facts.test.ts` | 2 |
| Engine and harvest exclude the same new observation events and preserve elapsed step totals in the same change. | Integration | `scripts/harvest/bkit-harvest.test.mjs` | 2 |
| Caller resolution rejects inherited ids, mismatched receipts, equal-strength conflicts and unbound skill declarations. | Unit | `.bkit/core/engine/commands/workflow/host-evidence.test.ts` | 3 |
| Real process/receipt boundaries enforce ancestry budget, selector ownership, symlink-safe private cache and concurrency isolation. | Integration | `.bkit/core/engine/commands/workflow/host-evidence.integration.test.ts` | 3 |
| Five host adapters preserve exact ids, format capabilities, selection context and explicit child links with conservative call/scope classification. | Unit | `.bkit/core/engine/commands/workflow/run-facts.test.ts` | 4 |
| Child collection enforces combined budgets, kills/reaps hangs and cleans only owned private artifacts on success/error/timeout/recovery. | Integration | `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` | 5 |
| Permitted SQLite acquisition is coherent and leaves source DB/sidecar hashes and inventories unchanged, including concurrent writers and minimum Node 24.0.0. | Integration | `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` | 5 |
| Checkpoint acknowledgement covers crash-before-append, crash-before-cache, uncertain/truncated writes, competing collectors, first attachment, failed baseline, resume, replacement, carried parser context and overlapping ownership. | Integration | `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` | 6 |
| Real journal/runtime/counter/test/challenge and other status writers serialize against evidence appends while preserving their existing error policies. | Integration | `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` | 6 |
| Refused step commits roll back their attempt under attempted concurrent evidence/journal writes, preserve acknowledged facts and retry once; successful commits establish checkpoint durability in order. | Integration | `.bkit/core/engine/commands/workflow/steps.test.ts` | 6 |
| Start/resume, completed steps, handover/failure and close persist bounded evidence with explicit unknown sessions and effective dispatch/return configuration. | Integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 7 |
| Dispatch resolution snapshots the effective installed role and invocation overrides before spawn and reports unavailable configuration without guessing. | Unit | `.bkit/core/engine/render/models.test.ts` | 7 |
| Rendered hosts and every normal/retry/no-plan/per-group/remediation spawn route transport current-runtime declarations and pre-spawn effective dispatch snapshots. | Integration | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 8 |
| Git trailer normalization is idempotent, lowercase, singular, allowlisted and preserves bodies, other trailers, co-authors and CI semantics. | Integration | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 9 |
| All local commit/replay/failure/handover/close/landing paths and CLI/MCP squash payloads preserve operation context and assert their final messages. | Integration | `.bkit/core/engine/commands/workflow/branches.test.ts` | 10 |
| Close/restate preserve execution across CI enrichment and stats render legacy absence, explicit unknown, role/model unions, fallbacks and coverage from outcomes only. | Integration | `.bkit/core/engine/commands/stats.test.ts` | 11 |
| Harvest consistency remains compatible with new privacy-safe outcome summaries. | Integration | `scripts/harvest/bkit-harvest.test.mjs` | 11 |
| Every supported host normal entrypoint proves platform/session route, direct/nested/concurrent ownership and documented model capability using actual native records. | @live | `docs/plans/202611/logs/836-record-host-model/build-host-capabilities.md` | 12 |
| Real CLI and MCP remote squash payloads yield exactly one lowercase operation-host trailer in the resulting commit. | @live | `docs/plans/202611/logs/836-record-host-model/build-remote-trailers.md` | 13 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

## 👤 ⚠️ Breaking Changes & Naming Review

No breaking ledger migration, historical rewrite, mandatory launcher or runtime dependency is planned. New optional fields and events are additive; old absence means `not recorded`. New interface names to implement are `bkit workflows evidence` and `--host`, with dispatch/return mode flags finalized in existing command specs. The two new helper files are `host-evidence.ts` and `model-evidence.ts`; proposed row names are `agent-dispatch`, `agent-return`, `model-evidence`, and optional outcome `execution`. The exact Git trailer is lowercase `bkit-host`, with one value from `claude-code|codex|cursor|opencode|antigravity|unknown`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** `session`, optional outcome fields and append-only status records can be extended additively → changing existing identities or rewriting old rows would break legacy reads and harvest joins.
- **Assumption:** The host requesting a remote squash is the committing operation's host → a literal server-process interpretation would change the trailer contract.
- **Assumption:** Actual supported host entrypoints and an authorized disposable remote target can be exercised during build → unavailable access leaves Tasks 12/13 incomplete and prevents a five-host completion claim.
- **Open Question:** Should implementation proceed with explicit unknown/partial results on entrypoints whose live evidence cannot be verified in the design spike?
  - **Options:** A) Proceed with shared components and per-route capability gates, requiring live proof before claiming five-host completion — permits useful progress while keeping the requested outcome pending. · B) Block implementation until all five hosts and supported entrypoints are live-verified — stronger pre-build confidence but needs access to every host.
  - **Recommended:** A), because it preserves progress and the five-host completion requirement.
  - **Default if unanswered:** A).
- **Open Question:** Should unproven Codex call semantics and unavailable Cursor/Antigravity/Claude/OpenCode live captures remain capability gates rather than be promoted from session-level model records?
  - **Options:** A) Keep the gates and retain selected/session models separately until sanitized fixtures plus live evidence establish run/agent ownership — honest coverage with unfinished capabilities visible. · B) Pause the affected readers until a dedicated live verification round supplies that evidence — less implementation rework but delays them.
  - **Recommended:** A), because the evidence categories already preserve the weaker facts without claiming actual usage.
  - **Default if unanswered:** A).
- **Open Question:** How should database-backed readers proceed while no no-host-write acquisition route is proven?
  - **Options:** A) Develop shared decoding/reporting and investigate a host-provided coherent export or enforced no-write source route, keeping affected live reads disabled and five-host acceptance pending — preserves the original constraint but leaves a load-bearing gate. · B) Pause database-backed implementation until such a route is demonstrated — avoids speculative reader work but blocks those hosts earlier.
  - **Recommended:** A), because the spike disproves a route rather than the whole metadata pipeline.
  - **Default if unanswered:** A). Neither option authorizes host sidecar mutations, permission changes or an unsafe DB/WAL copy.
- **Open Question:** Should the newly specified attachment/resume/acknowledgement protocol be implemented with its full crash, replacement, parser-context and overlap fixture matrix before enabling run-observed aggregation?
  - **Options:** A) Require the matrix before enabling aggregation — gives the previously blocked spike claim a concrete implementation gate. · B) Run a separate disposable protocol spike before implementation — buys earlier feedback but duplicates a small portion of protocol work.
  - **Recommended:** A), because the design now defines the policy the original spike could not exercise.
  - **Default if unanswered:** A).
- **Open Question:** Should remote CLI/MCP merge paths remain gated until exact payload and resulting squash-message verification succeeds?
  - **Options:** A) Require both integration checks during implementation before claiming trailer parity — preserves the accepted lowercase requirement beyond the local formatter. · B) Arrange a separate disposable remote integration exercise first — earlier API confidence but needs an authorized remote target.
  - **Recommended:** A), because the local fixture result does not establish remote delivery.
  - **Default if unanswered:** A).

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

## Alternative Approaches & Recommendations

Use current-invocation evidence plus bounded ancestry corroboration, narrow host readers and acknowledged status checkpoints. Fixed environment precedence, latest-marker selection, visible skill paths and repository/time overlap cannot prove the caller. Hooks alone and ancestry alone both have unsupported entrypoints. Keep launcher environment behavior. Configured dispatch models are useful only as explicitly unverified fallback. Node's built-in SQLite preserves the zero-runtime-dependency package, but `readOnly`/backup alone is disproven as a safe live acquisition route; implement decoding first and enable each route only after its safety proof. Keep all five design question defaults at A until the owner answers.

## Out of Scope

None newly excluded. The source issue/design already bounds out run-cost accounting, expanded token billing, mandatory launchers, broad retrospective scans and historical commit rewrites; they are not prerequisites for the five success criteria. Cost remains the separately referenced cost issue. All six workstreams and their capability proofs remain in this runbook.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| OpenCode run cost | #526 — Telemetry: record per-workflow OpenCode cost in stats.jsonl (state not re-read), https://github.com/cbartens/bkit/issues/526 | Exact private OpenCode session association | Keep separate; this plan records attribution, not cost. |
| Model registry | #721 — Model registry (state not re-read), https://github.com/cbartens/bkit/issues/721 | Effective configured-model snapshots | Reuse current lookup only; no registry redesign. |
| Provider support | #752 — Provider support (state not re-read), https://github.com/cbartens/bkit/issues/752 | Host/gateway separation | Preserve exact gateway identifiers; no provider expansion. |

The review's related-issues search returned `None.`. The supplied failure context is clamped to seven of 21 matching rows; the other 14 were not reviewed. The related ledger candidates below remain advisory and do not add runbook scope.

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Codex Cloud session-start guard | `docs/deferrals.jsonl`, `719-codex-cloud-session-start-guard` | Native cloud entrypoint proof | Share sanitized capability evidence; keep tracker guards separate. |
| Local/cloud workflow-close verification | `docs/deferrals.jsonl`, `341-live-run-verification-mode-1-and-mode-3` | Actual lifecycle and remote close exercises | Reuse only evidence of the same boundary; attribution does not prove every close behavior. |
| Provider rule auto-loading | `docs/deferrals.jsonl`, `700-provider-auto-load-rules` | Host configuration/context delivery | Keep rule loading outside attribution. |
| First-action rule-read gate | `docs/deferrals.jsonl`, `700-first-action-deny-gate` | Per-session/tool hooks | Reuse native hook facts without adding deny behavior. |
| Rule-content acknowledgement | `docs/deferrals.jsonl`, `700-rules-content-hash-acknowledgement` | Session receipts | Keep rule-read acknowledgement distinct from current-caller proof. |
| Raw-test-runner host hooks | `docs/deferrals.jsonl`, `724-host-hook-catches-raw-test-runners` | Native hook capability matrix | Keep command rewriting and machine-wide test locking separate. |
| OpenCode guardrails and Codex read-tool wiring | `docs/deferrals.jsonl`, `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there`, `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` | Native tool contracts | Reuse verified capability facts; permission enforcement remains separate. |
| Cursor hook diagnostics | `docs/deferrals.jsonl`, `381-cursor-hook-ask-rate-signal` | Safe hook diagnostics | Keep permission-ask measurement separate. |
| Publish override and dispatch-count authority | `docs/deferrals.jsonl`, `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-status-ts-269`, `363-dev-dispatch-cap-self-resettable-by-controlled-principal` | Status and publication paths | Preserve current publication gates; authority changes need their own decision. |
| CI command timeouts under concurrent load | `docs/failures.jsonl`, `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite`, `runs-context-issue-less-timeout-under-audits`, `runs-context-label-read-timeout-under-audits`, `runs-revalidate-pr-head-auth-timeout-under-audits`, `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate` | Command and gate suites | Record recurrences; preserve assertions and collector deadlines. |

## Security & Privacy

- [x] **User Input:** Validate host enums, receipt selectors, source ids, ranges, normalized model strings and complete child-result batches at the receiving command. Use argument-array subprocesses and bound SQL parameters.
- [x] **PII:** Persist only fingerprints and allowlisted model metadata. Exclude raw ids, native paths, consumer task names, transcripts, arguments, prompts, SQL values and raw exceptions from committed rows, outcomes, diagnostics and trailers.
- [x] **Host Store Safety:** Enable a source route only after coherent acquisition and no-host-write proof. Do not create host files/sidecars, change permissions or request checkpointing.
- [x] **Private Artifacts:** Use owner-only, symlink-safe directories/files and ownership-scoped cleanup/reclamation. Never delete another live collector's data.
- **Not applicable:** New API routes, application DB policies, role-gated mutations, redirects, webhooks and new secrets are absent.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** `package.json` declares Node `>=24` and `pnpm@10.34.7`; `pnpm-lock.yaml` is accessible. No runtime dependency is proposed.
- [x] **Dependency Versions:** `pnpm bkit:deps:outdated` ran on 2026-11-03 and exited 1 with outdated results: oxlint-tsgolint `7.0.2004` → `7.0.2005`, @types/node `24.19.2` → `26.6.5`, vite `6.4.5` → `8.3.5`. These are not evidence of a build blocker and no upgrade is included. Versions checked: Node `24.16.0`, pnpm `10.34.7`, Git `2.56.0`. Minimum Node `24.0.0` support remains a required acquisition test.
- [x] **Existing-Solution Search (reuse over duplicate):** See Reuse Inventory for scoped source/symbol searches and built-in APIs.
- [x] **User Context:** Source design, input, engine and harvest files are readable. The five optioned design questions remain visible with their defaults; no unavailable live host is claimed verified.
- [x] **Project Context:** Folded `docs/decisions.jsonl` and `docs/knowledge.jsonl` were searched; no existing decision key for this feature was found. Existing Antigravity hook-contract and shell-input validation lessons apply.
- [x] **Testing & Quality:** Pure folds use Unit; real local Git, process, filesystem and SQLite fixture boundaries use Integration; actual host and remote API proofs use @live. The current repository has no live CI lane, so these required proofs are executable build tasks rather than fictional CI coverage.
- [x] **Prerequisite Plans:** None. All six source workstreams are included here.

### Conditional

- [x] **Secrets & Env Vars:** No new credential or environment setting. Existing authentication is needed only for the explicitly authorized disposable remote proof; never copy secrets into evidence.
- [x] **Schema State:** No application database or migration. Host-owned schemas are external read-only formats and remain acquisition-gated.
- [x] **Architecture & UI:** `docs/architecture.md` places workflow helpers beside `run-facts.ts`; no UI is introduced.
- [x] **Observability:** `docs/observability.md` owns `[bkit-telemetry]`; Task 14 records the design's safe reason-to-action contract.
- [x] **Notifications:** None; no alert, toast or notification system is introduced.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** The owner has ticked its confirmation above.
- [ ] **Breaking Changes confirmed:** The owner has ticked its confirmation above.
- [ ] **Open Questions confirmed:** The owner has ticked its confirmation above.
- [x] **Security & Privacy checked:** Applicable metadata-validation and privacy safeguards are specified below.
- [x] **Reuse Inventory complete:** Each introduced capability has a search and decision.
- [x] **Reuse reasons:** Each new helper/test/evidence artifact has a reason.
- [ ] **Gate 1 — Verified:** Every applicable item above is checked.

## Data Schema Integration

Extend repository JSONL contracts additively. There is no application database or migration. Host databases are external versioned sources, never bkit-owned writable schema.

### Data Schema Usage

**Input (Read):** Existing active-run/session records, dispatched agent configuration, exact linked native model metadata and already acknowledged source cursors. **Output (Write):** Existing `status.jsonl` and optional outcome `execution`; private gitignored locator/receipt/snapshot state contains raw locators only while needed.

### Data Schema Changes

Allow new sessions with the existing platform vocabulary plus `unknown` and nullable fingerprint, active-run linkage and identity reason. Add `agent-dispatch`, `agent-return`, and complete `model-evidence` batches with stable predecessor/batch/event/attempt identities, fingerprinted source generation/range, carried model-selection context, capabilities and coverage. Basis is `observed-call|session-record|configured`; scope is `run|session|dispatch`. Coverage is `complete|partial|unavailable` with the design's closed reason vocabulary. Optional outcome `execution` summarizes hosts, observed models by role, session records, unverified configuration and coverage/attempt totals without detailed fingerprints or task names. Old rows remain byte-unchanged; absence means `not recorded`.

## Reuse Inventory

Search evidence below records reproducible commands run from the repository root. Serena `find_symbol(name_path_pattern="hostChat", relative_path=".bkit/core/engine/commands/workflow/run-facts.ts", include_body=true)` and the equivalent query for `appendLine` in `.bkit/core/engine/ledgers/status.ts` confirmed the existing main-checkout symbols; working-tree reads corroborated the relevant definitions. `rg -l --hidden -g '*.ts' 'hostChat|chatFingerprint|model.evidence|checkpoint|receipt' .bkit/core/engine/commands/workflow .bkit/core/engine/render .bkit/core/engine/ledgers` located existing candidates. The design spike's captured Node SQLite and Git trailer probes establish built-in prior art; their linked vendor contracts and negative acquisition result remain authoritative.

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Status and outcome contracts | `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/ledgers/telemetry.ts` | Symbol overview and `rg 'OutcomePayload\|StatusEvent'`; read codecs | Existing row types/codecs | EXTEND | Add evidence without a parallel ledger. Tasks 1/6. |
| Evidence fold, readers and projection | `.bkit/core/engine/commands/workflow/run-facts.ts` | Symbol overview; `rg 'hostChat\|runChats\|agentContextBlock\|MARK_ROWS'`; harvest format lookup | Existing Claude context and session reader | EXTEND | Extend adapters and one fold; keep old context semantics. Tasks 2/4/11. |
| Current-caller resolver | `.bkit/core/engine/commands/workflow/host-evidence.ts` | Exact evidence-name command and Serena query in the introduction above; opened `hostChat` and native-hook/host-transform candidates | `run-facts.ts` has the Claude ambient-id shortcut, not a five-host scoped resolver | NEW | Reason (a): no scoped five-host caller/session resolver exists. Task 3 replaces the shortcut through its existing caller. |
| Resolver behavior tests | `.bkit/core/engine/commands/workflow/host-evidence.test.ts`, `.bkit/core/engine/commands/workflow/host-evidence.integration.test.ts` | `rg --files --hidden .bkit/core/engine/commands/workflow -g '*evidence*' -g '*run-facts*' -g '*steps*'`; opened `run-facts.test.ts` fixture setup and `steps.test.ts` real-Git setup | Existing run-facts and step suites supply fixture style; no resolver suite exists | NEW | Reason (a): new resolver needs isolated pure and real-process/filesystem coverage. Task 3. |
| Bounded collection and acknowledgement | `.bkit/core/engine/commands/workflow/model-evidence.ts` | Evidence-name command above; `rg -l --hidden -g '*.ts' -e appendFileSync -e 'appendFile\(' .bkit/core/engine/ledgers .bkit/core/engine/commands/workflow`; opened status formatter, direct status destinations and harvest `openDb` at lines 2490-2530 | Status has only a formatter; harvest has a broad local scanner and disproven live acquisition policy | NEW | Reason (a): no shipped run-scoped coordinator owns bounded collection and acknowledged progress. Tasks 5/6 extend the shared persistence boundary rather than adding a separate log. |
| Collection/checkpoint boundary tests | `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` | `rg --files --hidden .bkit/core/engine/commands/workflow -g '*evidence*' -g '*run-facts*' -g '*steps*'`; opened step rollback lines 540-594 and the real-process/Git fixtures | Existing real-process/Git fixtures are reusable patterns; no collector acknowledgement suite exists | NEW | Reason (a): real child/process/SQLite/crash boundaries need a dedicated suite beside the new coordinator. Tasks 5/6. |
| Serialized status persistence | `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/ledgers/journal.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/runtime.ts`, `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/prs.ts`, `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/worktrees.ts`, `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts` | Direct-append command above; `rg -n -m 12 'appendFileSync\|appendFile\('` on its production hits, then opened each status destination and `steps.ts` append/commit/rollback | Existing per-command status appends, row union/replay and step transaction | EXTEND | One compatible serialized status-write boundary covers active status destinations; unrelated friction, clamp, snapshot and markdown outputs retain their writers. Task 6. |
| Lifecycle and CLI | `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/steps.ts`, `.bkit/core/engine/commands/workflow/status.ts` | Read `recordChat`, command specs/imports, step/status boundaries | Existing lifecycle commands | EXTEND | Register proposed evidence/dispatch mode and use existing writers. Task 7. |
| Host declaration and dispatch transport | `.bkit/core/engine/render/hosts.ts`, `.bkit/core/engine/render/models.ts`, `.bkit/core/hooks/antigravity-hook.js`, `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh` | Test-file command above; `rg -n -m 8 'export function\|resolve\|override' .bkit/core/engine/render/models.ts`; opened lookup/override and host transforms | Existing host-specific boundaries and effective pin resolution | EXTEND | Task 7 supplies dispatch resolution; Task 8 consumes it for supported causal transport instead of fabricating a universal hook. |
| Workflow spawn and fallback instructions | `.bkit/core/workflows/bkit-design.md`, `.bkit/core/workflows/bkit-plan.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/workflows/bkit-debug.md`, `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-auto.md`, `.bkit/core/prompts/bkit-ship-conflict-resolve.md` | `rg -l 'branches sync\|commit\|no.commit' .bkit/core/prompts/bkit-ship-conflict-resolve.md .bkit/core/prompts/bkit-build-plan-tasks.md`; opened conflict-resolve lines 58-110 and build-plan-tasks no-commit contract | Six workflow spawn/commit sources; conflict-resolve invokes committing `branches sync --merge`; build-plan-tasks does not commit | EXTEND | Tasks 8/10 cover every existing invocation and direct/leaf commit path. Task 10 owns the specific conflict-resolve prompt edit; no build-plan-tasks prompt change is promised. |
| Workflow transport audit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/render/hosts.test.ts` | Read existing shape/render tests | Existing source/render boundary suites | EXTEND | Exercise operation context, dispatch and exact fallback body propagation. Task 8. |
| Git message normalization | `.bkit/core/engine/commands/workflow/ledgers.ts` | `rg -l 'commitOwnSet\|ownPathCommit\|commitBookkeeping\|retriggerCommit'`; opened helper/test sources | Existing scoped commit helpers; Git `interpret-trailers` prior art in design spike | EXTEND | Add one formatter/assertion with existing helpers, not a new commit system. Task 9. |
| All commit and remote message paths | `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/prs.ts`, `.bkit/core/engine/commands/workflow/runs.ts`, `.bkit/core/engine/commands/workflow/roadmap.ts` | Enumerated commit call sites and opened command boundaries | Existing landing/replay/PR/trigger paths | EXTEND | Carry operation context and exact bodies through existing transports. Task 10. |
| Reporting and harvest compatibility | `.bkit/core/engine/commands/analysis.ts`, `.bkit/core/engine/commands/stats.ts`, `scripts/harvest/bkit-harvest.mjs` | `rg -l 'MARK_ROWS' .bkit/core/engine/commands/workflow/run-facts.ts scripts/harvest/bkit-harvest.mjs scripts/harvest/bkit-harvest.test.mjs`; opened outcome-only report and harvest timing/parity references | Existing figures/table and consistency readers | EXTEND | Task 2 changes both timing classifiers together; Task 11 adds outcome-only reporting/consistency. |
| Host capability proof artifact | `docs/plans/202611/logs/836-record-host-model/build-host-capabilities.md` | `rg --files docs/plans/202611/logs/836-record-host-model`; opened `design-spike.md` claims P1-P4 and probe paths | Design spike supplies partial/blocked evidence, not implementation proof | NEW | Reason (a): implementation-specific native evidence and unresolved routes need one sanitized build record. Task 12. |
| Remote message proof artifact | `docs/plans/202611/logs/836-record-host-model/build-remote-trailers.md` | Same feature-log enumeration; `rg -n -m 8 -e BLOCKED -e P5 -e remote docs/plans/202611/logs/836-record-host-model/design-spike.md`; opened P5 and its Git probe | Local formatter fixtures explicitly created no remote merge | NEW | Reason (a): CLI and MCP result verification has not been performed. Task 13. |

## Architecture & Component Changes

**Ledger rows:** `836-host-model-design-01`, `836-host-model-design-02`, `836-host-model-design-03`, `836-host-model-design-04`, `836-host-model-design-05`, `836-host-model-design-06`, `836-host-model-design-07`, `836-host-model-design-08`, `836-host-model-design-09`, `836-host-model-design-10`, `836-host-model-design-11`, `836-host-model-design-12`, `836-host-model-design-13`, `836-host-model-design-14`, `836-host-model-design-15`, `836-host-model-design-16`, `836-host-model-design-17`, `836-host-model-design-18`, `836-host-model-status-transaction`.

### Database Migrations

None. No migration is proposed or authorized.

### Runtime and Telemetry

#### [MODIFY] `.bkit/core/engine/ledgers/status.ts` and `.bkit/core/engine/ledgers/telemetry.ts`

Existing files. Add the Data Schema Integration contract and validate the entire bounded batch at the receiving command, with active-run linkage, conservative privacy allowlists and old-row compatibility. Keep `by.model` as the author field.

#### [MODIFY] `.bkit/core/engine/commands/workflow/run-facts.ts`

Existing file. Replace ambient-only attribution through the new shared resolver, retain `chatFingerprint`, and extend native format decoding and evidence folding. Each host adapter reports format/capabilities and exact source event/child links. Codex turn selection stays `session-record` unless actual-call semantics are proven; incomplete ownership stays session-scoped. Deduplicate normalized facts and attempts separately; only recovered source/ranges clear gaps. Exclude all observation events from step timing.

#### [NEW] `.bkit/core/engine/commands/workflow/host-evidence.ts`

Reuse reason (a) is recorded above. Resolve bound native receipt, corroborated declaration, unique bounded nearest ancestry, then `unknown`, in that order. Equal-strength conflicts become unknown. A platform without proven native chat ownership keeps a null fingerprint. Process probing reads no arguments, follows at most 16 verified ancestors and spends at most 250 ms. Private atomic receipts under the Git common directory require the exact invocation selector, native call/session relation, command digest, workspace and live-process marker; consume only that invocation and reject inherited nonces. Unsupported selector transport remains unavailable. No newest-marker or environment-precedence shortcut.

#### [NEW] `.bkit/core/engine/commands/workflow/model-evidence.ts`

Reuse reason (a) is recorded above. One child process shares the entire checkpoint budget across linked sessions and subagents: 8 seconds total, 2 seconds per adapter, 256 candidates, 32 MiB source bytes, 10,000 model-bearing records and 1,000 normalized entries. Lock acquisition shares this budget and stops after 250 ms. The parent terminates at deadline, allows at most 250 ms, then kills and reaps. Parent-owned snapshots use symlink-safe repo `tmp/`, directories `0700`, files `0600`, random ownership tokens and dead-owner-only reclamation.

Before any host SQLite source is opened, prove a coherent export, immutable/quiescent complete snapshot or enforced no-write connection for that exact route. Source DB/WAL/SHM hashes and directory inventory remain unchanged. Do not use generic `readOnly`, existing sidecars or a copied changing DB/WAL pair as proof. No safe route means `acquisition-unsupported` and disabled live acquisition.

Serialize run/source collection and status appends through one compatible boundary in `ledgers/status.ts`; its existing `appendLine` remains a formatter. Task 6 routes the inventoried ordinary status writers and status union/replay destinations through that boundary while preserving each caller's failure policy. Collector lock waits remain inside 250 ms and the shared collection deadline. Keep the leaf ledger dependency direction; the status persistence boundary does not import workflow commands or the journal.

Under the lock re-read the acknowledged predecessor; validate, append, flush and parse-confirm one complete record before replacing the disposable cursor. Recover caches from the log. Failed/uncertain/truncated writes never acknowledge; do not rewrite existing status bytes. Preserve first attachment, failed baseline, resumed cursors, source generations, carried selection context, stable event identities and ambiguous overlapping ownership exactly as the design specifies.

Task 6 also owns the append-through-step-commit/rollback transaction in `steps.ts`: block interleaving writers until a successful commit or exact rollback completes, without deadlocking the same command's journal. Previously acknowledged facts survive a refused commit; the failed step retains its attempt and a retry appends it once. Collect/acknowledge the completed-step checkpoint in a defined order with that transaction. Mark evidence portable only after the successful commit includes it; local flush does not imply publication. Retain the existing exact rollback policy rather than introducing arbitrary historical row removal.

#### [MODIFY] Lifecycle, host rendering and workflow sources named in Reuse Inventory

Existing files. Register the proposed `workflows evidence` interface and host/dispatch/return inputs in their real command specs, with generated CLI documentation. Start/resume always writes a session record. Collect after completed steps, before cooperative/failure handover and before constructing close outcomes. Task 7 extends `render/models.ts` and tests its effective installed-role/configuration plus invocation-override resolution before Task 8 consumes that interface. Every actual spawn records this effective configuration before dispatch; absent configuration stays unavailable. The ordinary commit makes checkpoints portable; local flush alone is not remote durability. Source instructions and all host renders transport operation context without parsing host stores in shell.

#### [MODIFY] Commit helpers and commit paths named in Reuse Inventory

Existing files. Extend one Git-based trailer formatter/assertion in `ledgers.ts`; normalize only `bkit-host`, preserving subject/body/co-authors/other trailers/CI markers and a stable final newline. Resolve the current operation independently of run-host union. Pass exact normalized bodies through CLI and printed MCP fallback, including requesting-host attribution for remote squash. Assert the final local message or remote payload immediately before publication. Update direct workflow/leaf instructions too; carry existing commits unchanged.

#### [MODIFY] Stats, analysis and harvest files named in Reuse Inventory

Existing files. Close folds acknowledged evidence before writing optional `execution`; restate/CI enrichment preserves it. Stats adds one outcome-only per-run table for hosts, observed orchestrator models, observed subagent models, session records, unverified fallbacks and coverage. Legacy absence is `not recorded`; new uncertainty is `unknown`. Harvest consistency and timing exclusions recognize the same contract, without shipping the maintainer-local scanner.

#### [NEW] Resolver and collector tests and implementation proof artifacts named in Reuse Inventory

Reason (a) applies to each new path. Tests own pure versus real local boundaries separately. Build artifacts record sanitized actual-host and resulting-remote-commit evidence, never raw chats or source locators. Existing test suites are extended for the remaining components.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. Extend existing APIs and replace the ambient-only attribution branch in place. No artifact or export is kept as a duplicate alternative and no whole file is superseded.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/jsonl.md` | Document additive events, evidence meaning, active-run linkage, coverage reasons and outcome execution shape. |
| `.bkit/core/.bkit/cli.md` | Generate registered evidence/dispatch/host flags with `pnpm cli:sync`; add operational contract outside its generated region only when needed. |
| `.bkit/core/.bkit/workflows.md` | Match all workflow lifecycle, pre-spawn snapshot, direct commit and MCP fallback changes. |
| `.bkit/core/.bkit/providers.md` | Document actual per-host declaration/receipt/process/model capabilities and unsupported entrypoints. |
| `.bkit/core/.bkit/prompts.md` | Match any prompt context/commit-transport contract changes. |
| `docs/architecture.md` | Describe the scoped resolver/collector and private-versus-committed evidence boundary. |
| `docs/testing.md` | Register new fixture suites, exact minimum-Node/acquisition evidence and actual-host/remote acceptance procedures. |
| `docs/observability.md` | Record safe diagnostics, per-range gap versus attempt counts and every design reason-to-action row. |

Read existing docs before edits. Project additions to `docs/architecture.md`, `docs/testing.md` and `docs/observability.md` go below `bkit:end`; shipped catalog changes use the named `.bkit/core/.bkit/` sources. Task 14 performs the final source-catalog and mirror refresh after Tasks 12/13 finish their capability proofs. Existing domain index rows already cover these docs; keep `.agents/docs.md` accurate if their scope changes. Decision rows were recorded during planning, not assigned as build work.

## Rollback Strategy

Code-only — `git revert` is sufficient. Optional execution fields and new status events remain as historical evidence; do not rewrite old ledgers or commits. Disabling a reader preserves earlier acknowledged facts and reports its capability gap. Never roll back by altering host stores or deleting unowned private artifacts. Existing outcomes remain readable by the additive codec; any revert must retain required legacy reads.

## Agent Execution Runbook

One PR for the full deliverable is sufficient. Groups express dependencies, not release units. Existing fixture suites retain their existing filenames; new real-boundary suites use `.integration.test.ts`. Every logic task owns its listed tests and updates existing tests that its changes break. Rebuild and commit generated `dist/` with each engine source change through the build orchestrator. Tasks 12/13 use built-CLI installations in disposable fixtures for actual-boundary proof; Task 14 performs the final source-to-installed mirror refresh once after proof-driven corrections.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Evidence contracts, fold and caller identity

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Define additive execution and status contracts
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: Add active-run linked nullable sessions, dispatch/return and complete checkpoint records, capabilities, source generation/range and parser state.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.ts`: Add optional normalized execution outcome fields and full validation, retaining legacy absence and the author meaning of `by.model`.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.test.ts`: Cover additive and legacy status contracts.
  - **UPDATE:** `.bkit/core/engine/ledgers/telemetry.test.ts`: Cover execution shape, privacy validation and limits.
  - **DONE WHEN:** New contracts represent every design Data Model field and reason, reject private/malformed values, and the following tests pass without rewriting old rows.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/status.test.ts` `accepts run-linked unknown sessions and complete evidence batches` fails on missing unknown/null or checkpoint fields
    - `.bkit/core/engine/ledgers/status.test.ts` `validates mixed legacy and new run linked evidence without fabricating old identity` fails on the new validated contract losing explicit unknown/run linkage or treating legacy absence as newly recorded identity; retain the existing readable-legacy assertion in this case
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `validates execution evidence without changing row author models` fails on missing basis/scope/coverage validation or overloaded author identity
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `rejects private and malformed execution metadata` fails on unsafe identifiers, control characters, overlong model names or private locator fields being accepted

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Fold whole-run evidence and preserve timing
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.ts`: Fold by active run and stable identities, separate basis/scope, union known facts and count current gaps versus attempts.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.test.ts`: Exercise mixed sessions, replay/union and range recovery without local source reads.
  - **UPDATE:** `scripts/harvest/bkit-harvest.mjs`: Add new observation types to its timing classifier in the same change as engine `MARK_ROWS`.
  - **UPDATE:** `scripts/harvest/bkit-harvest.test.mjs`: Extend the existing exact classifier-parity assertion and add elapsed-duration behavior for new observation rows.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** Known evidence survives retries and failed later reads, only recovered ranges clear gaps, model/attempt counts deduplicate independently, and all listed tests pass with unchanged step durations. Engine and harvest classifiers change together, their existing exact-parity assertion passes, and both readers exclude the new observation rows.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `unions model facts across hosts roles switches and resumes` fails on earlier sessions or role distinctions being lost
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `deduplicates facts batches and attempts under replay and union` fails on duplicate observations or inflated attempt totals
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `resolves only acknowledged recovered coverage ranges` fails on failed reads erasing gaps or observations
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `excludes execution observation events from step durations` fails on session/dispatch/evidence events shifting elapsed step totals
    - `scripts/harvest/bkit-harvest.test.mjs` `excludes new execution observations from harvest step durations` fails on new observation rows shifting harvest elapsed totals or classifier parity diverging from the engine

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Establish the current caller without inherited identity shortcuts
  - **CREATE:** `.bkit/core/engine/commands/workflow/host-evidence.ts`: Implement the design's evidence ordering, platform/chat separation, bounded ancestry and exact private invocation receipt checks.
  - **CREATE:** `.bkit/core/engine/commands/workflow/host-evidence.test.ts`: Cover pure decision and validation cases.
  - **CREATE:** `.bkit/core/engine/commands/workflow/host-evidence.integration.test.ts`: Cover actual process/receipt filesystem boundaries.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.ts`: Route existing identity reads through the resolver and keep the established fingerprint algorithm.
  - **DEPENDS ON:** 1
  - **DONE WHEN:** Stronger evidence defeats leaked variables, conflicting/unbound evidence returns unknown, independently proven platform survives a missing chat join, and real receipt/process tests enforce 16 ancestors/250 ms with no raw arguments retained.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/host-evidence.test.ts` `rejects leaked host ids and unbound runtime declarations` fails on selecting a parent chat or a loaded skill as caller proof
    - `.bkit/core/engine/commands/workflow/host-evidence.test.ts` `applies evidence precedence conflicts and platform chat separation` fails on equal-strength conflicts being guessed or a known platform being discarded without a chat
    - `.bkit/core/engine/commands/workflow/host-evidence.test.ts` `rejects malformed selectors ids and unsupported receipt handoffs` fails on unsafe path construction or unproven transports being accepted
    - `.bkit/core/engine/commands/workflow/host-evidence.integration.test.ts` `bounds real ancestry and verifies live process continuity` fails on an unbounded probe or reused-process identity being trusted
    - `.bkit/core/engine/commands/workflow/host-evidence.integration.test.ts` `consumes only the exact owned invocation receipt` fails on replayed/inherited nonces, workspace/command mismatches, symlinks or concurrent chat receipts being selected

<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Native readers and durable bounded checkpoints

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Extend narrow native model decoders
  - **READ:** `scripts/harvest/bkit-harvest.mjs`: Use format knowledge only; do not import its broad scanner or copy its disproven acquisition policy.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.ts`: Decode allowlisted Claude, Codex, OpenCode, Cursor and Antigravity metadata with explicit format/capability, positions/times and child links.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.test.ts`: Add sanitized in-memory fixture cases for all five native formats.
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** Five decoder fixture cases preserve exact gateway-qualified models, carried selection context and explicit linkage; unproven actual-call/interval/agent claims remain weaker evidence. Existing Claude context-token semantics pass unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `decodes linked Claude model calls and child metadata` fails on losing explicit child relations or existing context semantics
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `keeps Codex selections session scoped without proven call semantics` fails on promoting a turn selection or timestamp alone to actual run usage
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `decodes exact OpenCode session and child model records` fails on including unrelated sessions or losing native gateway/model names
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `decodes Cursor positions without inventing run boundaries` fails on treating full-chat models as run-observed without a baseline
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `decodes Antigravity metadata with supported linkage only` fails on inventing agent/event ownership from an unlinked model field
    - `.bkit/core/engine/commands/workflow/run-facts.test.ts` `reports format capability and rejects unsafe normalized models` fails on unsupported/malformed input becoming observed facts or `no-model-record` being inferred from a failed read

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Add bounded child collection and safe source acquisition
  - **CREATE:** `.bkit/core/engine/commands/workflow/model-evidence.ts`: Coordinate linked sources, one child process, source-route acquisition gates, budgets, private snapshots and parent cleanup.
  - **CREATE:** `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts`: Use real local source files, fixture databases, child processes and directory/hash ground truth.
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** Combined limits and termination grace match Architecture, owned artifacts are private and reclaimed only after proven owner death, and every enabled SQLite route passes coherent-content and unchanged-footprint tests on Node 24.0.0 and the current runtime. Unproven live routes stay disabled; no adapter is presented as proven from fixtures alone.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `shares all collection limits across linked sessions and children` fails on adapter/subagent fanout multiplying any of the design's total bounds
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `kills reaps and cleans a hung collector within the deadline` fails on synchronous source work surviving the 8 second budget plus 250 ms grace
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `creates private symlink safe artifacts and reclaims only dead owners` fails on loose permissions, escaped paths or deleting a live invocation's files
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `cleans owned snapshots on success error timeout and recovered crash` fails on the parent abandoning its private files or exposing raw diagnostics
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `refuses unproven live SQLite acquisition before opening the store` fails on trusting generic readOnly, existing sidecars or an unsafe changing DB WAL copy
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `proves permitted SQLite routes coherent without source footprint changes` fails on changed DB WAL SHM hashes or directory inventory, incoherent concurrent-writer samples, or a Node 24.0.0 incompatible API

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Acknowledge checkpoint progress only after durable complete persistence
  - **UPDATE:** `.bkit/core/engine/commands/workflow/model-evidence.ts`: Implement source lock/predecessor checks, parent result validation, append/flush/readback acknowledgement, cursor recovery and first/resume/replacement/overlap policies.
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: Serialize complete evidence appends with existing status writes without rewriting historical bytes.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/status.ts`: Keep existing malformed-log failure behavior and route safe evidence append diagnostics.
  - **UPDATE:** `.bkit/core/engine/ledgers/journal.ts`: Route engine-call status writes through the shared boundary while retaining fail-open journal results.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runtime.ts`: Serialize runtime status rows with their existing error behavior.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.ts`: Serialize counter/status decisions with their existing failure policy.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: Serialize test-run status rows without changing test-log writes or test outcomes.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/challenge.ts`: Serialize challenge-gate status rows without changing challenge routing.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/prs.ts`: Serialize transport/status audit appends.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: Serialize status-directed gate/audit rows while preserving stderr fallback; leave standalone snapshot outputs alone.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: Route lifecycle status appends and status reconciliation through the shared boundary.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: Serialize restored journal/status rows where their destination is an active status log.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: Serialize status-log union/replay appends without changing unrelated ledger or markdown outputs.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: Route status destinations of ledger union/reconciliation through the same compatible boundary.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: Define the status append-through-commit/rollback transaction and completed-step checkpoint order; prevent competing writers and same-command journal deadlock.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: Cover real refused-commit rollback/retry and successful checkpoint/commit order with attempted concurrent writers.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts`: Exercise the entire design checkpoint failure matrix at the real file/process boundary.
  - **DEPENDS ON:** 2, 5
  - **DONE WHEN:** Every checkpoint failure-matrix case below passes; cache advancement follows complete flush/parse acknowledgement, concurrent status events cannot interleave checkpoint bytes, and ambiguous ownership never becomes run-observed. All inventoried status destinations use one serialized boundary while caller error policies and dependency direction remain intact. A refused step commit rolls back only its own attempt, preserves acknowledged evidence and retries once; successful checkpoint/step commit order is proven. Failed persistence leaves the previous cursor authoritative.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `replays after crash before append and rebuilds after append before cache` fails on skipped or duplicated facts across either crash boundary
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `does not acknowledge uncertain truncated or malformed writes` fails on cache advancement or silent historical log repair after an unconfirmed append
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `serializes competing collectors and ordinary status writers` fails on stale predecessors, interleaved bytes, lost acknowledgements or collector lock waits beyond 250 ms while racing real journal/runtime/counter/test/challenge and other inventoried status-writer commands
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `distinguishes first attachment failed baseline and same source resume` fails on counting pre-attachment calls, erasing initial gaps or resetting a resumed cursor to source end
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `recovers source replacement with stable identities and carried model context` fails on stale-generation cursors, lost selection context or unreported truncated ranges
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `keeps overlapping workflow and dispatch events ambiguously scoped` fails on attributing time-overlapping calls to two runs without an explicit ownership relation
    - `.bkit/core/engine/commands/workflow/model-evidence.integration.test.ts` `preserves acknowledged progress when private caches disappear` fails on cache loss invalidating committed observations or duplicating attempts
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `rolls back a refused step commit while evidence and journal writers contend` fails on an advanced attempt, lost acknowledged evidence, duplicate retry row, human-repair-only tail conflict or same-command journal deadlock
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `commits completed step checkpoints before reporting portable evidence` fails on acknowledged checkpoint data missing from the successful commit or a local flush being reported as committed durability

<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Lifecycle and five-host dispatch transport

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Integrate sessions evidence and dispatch into lifecycle commands
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: Register evidence/dispatch/return and current-host inputs, always record start/resume sessions and checkpoint handover/failure/close.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: Collect at completed-step boundaries while preserving step status and commit ordering.
  - **UPDATE:** `.bkit/core/engine/render/models.ts`: Resolve effective installed role/configuration plus invocation overrides before snapshotting the dispatch; expose that producer for Task 8.
  - **UPDATE:** `.bkit/core/engine/render/models.test.ts`: Cover effective installed pins, invocation overrides and unavailable configuration at dispatch time.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: Extend existing real repository lifecycle fixtures.
  - **DEPENDS ON:** 3, 6
  - **DONE WHEN:** Real lifecycle fixture runs persist correct active-run sessions and effective pre-spawn configuration, checkpoint every stated boundary, keep collection failures fail-open, and preserve status-log errors and prior-machine facts. The actual command spec exposes every new flag used by later tasks.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `records every start and resume with known or explicit unknown identity` fails on a missing row, wrong active run or inherited Claude identity
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `snapshots effective dispatch configuration and explicit return boundaries` fails on late registry reconstruction, ignored invocation overrides or invented child linkage
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `checkpoints completed steps cooperative handover failure and close` fails on an omitted boundary or claiming an uncommitted checkpoint remotely durable
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `continues lifecycle on bounded collection failure while preserving prior facts` fails on host read errors failing close, lost cross-machine evidence or incorrect gap recovery
    - `.bkit/core/engine/render/models.test.ts` `resolves effective installed dispatch models with invocation overrides` fails on reading only the current registry, ignoring overrides or inventing a model when effective configuration is unavailable

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Transport current invocation and effective dispatch across all host renders
  - **UPDATE:** `.bkit/core/engine/render/hosts.ts`: Render current-runtime declaration transport, not a claim that the loaded file proves its host.
  - **READ:** `.bkit/core/engine/render/models.ts`: Consume Task 7's existing effective dispatch-resolution interface without re-resolving after spawn.
  - **UPDATE:** `.bkit/core/hooks/antigravity-hook.js`: Pass exact supported causal invocation metadata without assuming a conversation receipt proves a later command.
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-preflight.sh`: Add only causally supported native handoff metadata.
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-preflight.sh`: Add only causally supported native handoff metadata.
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: Carry session/checkpoint and pre-spawn dispatch context through all invocation/retry paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: Carry the same context through generation, parallel review, apply/review loops and owner answers.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Cover normal/no-plan/group/challenge/remediation/decision-resume paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Cover diagnosis/reproduce/remediate/soak/retry/handover paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Cover review/conflict/failure/retry/close paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: Carry actual runtime context into routed workflows.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: Audit every actual spawn and lifecycle route, including parallel dispatch identifiers.
  - **UPDATE:** `.bkit/core/engine/render/hosts.test.ts`: Exercise five-host render round trips and visible cross-host skill use.
  - **DEPENDS ON:** 7
  - **DONE WHEN:** Source/render audits demonstrate current-host declaration and pre-spawn configuration/return bookkeeping on every actual route in all five hosts. Unsupported exact selector transport remains explicitly unavailable; launcher environment behavior and subagent no-commit rules remain intact. Hook receipts preserve one control-character-safe native JSON output document and Antigravity's deny-once/identical-retry behavior with hashed retry records. Run existing `preflight-sh.integration.test.ts` and `antigravity-hook-commands.integration.test.ts` suites, and verify supported handoff on a pre-change installed fixture as well as a fresh install. A driver outside managed markers remains consumer-owned; a required migration is proposed for explicit owner authorization, never silently added. Shared instruction changes use the clause source and indexes, then final mirror refresh occurs in Task 14.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `records dispatch before every normal no plan group retry and remediation spawn` fails on any real invocation missing its own pre-spawn snapshot
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `carries runtime host and checkpoints across every lifecycle route` fails on missing host/context transport, skipped handover checkpoint or parallel identifier collision
    - `.bkit/core/engine/render/hosts.test.ts` `renders runtime declarations independently of visible skill host` fails on rendered source location becoming identity evidence
    - `.bkit/core/engine/render/hosts.test.ts` `preserves effective dispatch overrides and unsupported receipt capability` fails on guessing unavailable configuration or claiming unproven invocation-selector transport

<!-- bkit:task 8 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Commit operation attribution

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Normalize and assert one lowercase host trailer in shared Git helpers
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: Add shared Git-trailer formatting/assertion and thread current-operation context through scoped/bookkeeping/trigger helpers.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: Exercise real Git interpretation and resulting local messages.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** Real Git messages contain exactly one lowercase allowlisted `bkit-host`, formatter passes are byte-idempotent, and invalid final messages are refused without changing other message semantics.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `normalizes duplicate case variants to one lowercase operation host trailer` fails on duplicate/mixed-case host keys or a borrowed run-host value
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `keeps host trailer formatting byte idempotent with unrelated message content` fails on body, co-author, other trailers, CI marker or final-newline drift
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `asserts final local messages and emits explicit unknown when caller is unresolved` fails on an invalid/missing final trailer reaching git commit

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Cover every local and remote workflow commit surface
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: Carry requesting operation context through throwaway landings, replay/resolution and remote fallback.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/prs.ts`: Submit and print exact normalized nonempty trailer bodies, preserving matching-head and subject checks.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runs.ts`: Preserve current operation attribution in trigger commits.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/roadmap.ts`: Preserve current operation attribution in mirror commits.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: Propagate operation context through failure/handover/close and shared commit helpers.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.ts`: Propagate operation context through step commits.
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: Replace empty-body MCP merge instructions and cover direct commits with exact normalized message transport.
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: Match exact fallback body and owner-answer commit transport.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Match direct build and all fallback message paths.
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Match direct remediation/handover commit messages.
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Match ship squash and conflict/replay messages.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-conflict-resolve.md`: Carry the current leaf invocation context into both existing `branches sync --merge` calls that can create the resolution merge commit, preserving their authorization and result routing.
  - **READ:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: Preserve the leaf no-commit contract while carrying current-operation context wherever an existing authorized leaf path actually creates a commit.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: Exercise the complete commit-surface matrix with real local Git and exact CLI/MCP payload capture at remote transport seams.
  - **DEPENDS ON:** 8, 9
  - **DONE WHEN:** Every design Commit surface row is covered by a fixture and its actual final message or exact remote payload is asserted; existing commits retain attribution and newly authored operations resolve their own host. Include the conflict-resolve leaf's `branches sync --merge` invocation in source/transport coverage; keep build-plan-tasks a non-committing leaf. Payload tests preserve matching-head, subject, CI semantics and unrelated trailers, and no empty-body fallback drops the trailer. Retain existing `runs.test.ts` coverage, record any load-related timeout recurrence, and preserve hard collector deadlines and existing assertions.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `attributes step scoped bookkeeping trigger failure handover roadmap and close commits` fails on any local commit surface omitting the operation trailer
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `attributes throwaway landing replay and resolution to the current operation` fails on copying a source commit's host or inferring from worktree location
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `preserves exact trailer bodies through PR CLI and MCP fallback payloads` fails on an empty/different body, changed subject, lost matching-head check or requesting-host loss
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `refuses malformed final local and remote messages before publication` fails on a last-minute message alteration escaping the shared assertion

<!-- bkit:task 10 end -->
<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Reporting, documentation and actual-boundary completion

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Project durable execution evidence into outcomes stats and harvest consistency
  - **UPDATE:** `.bkit/core/engine/commands/workflow/run-facts.ts`: Project the acknowledged fold and preserve execution during CI restatement.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: Construct execution only after the final checkpoint.
  - **UPDATE:** `.bkit/core/engine/commands/analysis.ts`: Build per-run execution figures from outcomes only.
  - **UPDATE:** `.bkit/core/engine/commands/stats.ts`: Render hosts/observed roles/session records/unverified fallback/coverage with legacy versus explicit uncertainty labels.
  - **UPDATE:** `scripts/harvest/bkit-harvest.mjs`: Align run consistency projection, retaining Task 2's already synchronized timing classifiers and the unshipped scanner boundary.
  - **UPDATE:** `.bkit/core/engine/commands/stats.test.ts`: Cover report and close/restate round-trip fixtures.
  - **UPDATE:** `scripts/harvest/bkit-harvest.test.mjs`: Cover execution/outcome consistency and retain Task 2's timing/parity cases.
  - **DEPENDS ON:** 2, 7
  - **DONE WHEN:** Stats reads no private stores, outcomes retain execution after CI enrichment and legacy/new uncertainty differ; observed role models, session records and configured fallbacks stay distinct. All listed tests pass and harvest step durations remain unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/stats.test.ts` `reports execution per run from outcomes without private host reads` fails on private-file access, missing per-run data or lost observed/fallback separation
    - `.bkit/core/engine/commands/stats.test.ts` `distinguishes legacy not recorded from explicit unknown coverage` fails on fabricated historical unknowns or hidden partial intervals
    - `.bkit/core/engine/commands/stats.test.ts` `preserves execution through close restatement and CI enrichment` fails on the new close projection losing cross-session execution or admitting private details; keep unchanged restatement spreading as a regression assertion within the case
    - `scripts/harvest/bkit-harvest.test.mjs` `keeps execution projection consistent with outcomes` fails on divergence from the engine's new execution facts; retain existing timing/parity assertions from Task 2

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Prove actual supported host entrypoints and model acquisition capabilities
  - **CREATE:** `docs/plans/202611/logs/836-record-host-model/build-host-capabilities.md`: Record versioned sanitized actual-host proof for every source design Entrypoint capability gate row.
  - **DEPENDS ON:** 5, 6, 8, 11
  - **DONE WHEN:** The artifact maps every design entrypoint to actual direct/both-nesting/concurrent-chat evidence, proves a working normal platform/session route for all five hosts and documents model-call versus session-record capabilities. Every enabled database route has actual schema, Node 24.0.0, coherent-content and unchanged-footprint evidence. Unsupported/unavailable routes remain explicitly open and this task remains incomplete; unknown-only normal-path behavior cannot clear five-host acceptance. Use the built CLI to install disposable fresh and pre-change fixtures for these proofs; temporary installation is not the final repository mirror refresh. Any proof-driven source correction returns to its owning Task 3/4/5/6/7/8/11 and repeats its affected tests and actual boundary before the capability can be marked proven. Task 14 documents the resulting final capability state.
  - **TEST FIRST:** n/a — @live actual-host verification; capture native ground truth and inspect the resulting committed sessions/outcomes/stats without publishing raw ids, paths or transcript text.

<!-- bkit:task 12 end -->

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Prove resulting remote squash messages for both transports
  - **CREATE:** `docs/plans/202611/logs/836-record-host-model/build-remote-trailers.md`: Record exact sanitized submitted body, remote result SHA and inspected resulting message for CLI and MCP routes on an authorized disposable remote target.
  - **DEPENDS ON:** 10, 11
  - **DONE WHEN:** Both real CLI and MCP transport exercises preserve subject/matching-head/CI behavior and produce exactly one lowercase allowlisted `bkit-host` naming the requesting workflow operation. The artifact links the resulting commits and verifies their actual messages; missing remote access leaves this task incomplete rather than fixture-only success. Use the built implementation and disposable payload fixtures; return proof-driven corrections to Task 9/10 and repeat the affected local/payload and remote checks before claiming parity. Task 14 captures the final verified transport contract.
  - **TEST FIRST:** n/a — @live remote API verification; real resulting commit messages are the ground-truth signal.

<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Document proven contracts and refresh generated artifacts
  - **UPDATE:** `.bkit/core/.bkit/jsonl.md`: Document the additive schema and evidence meanings.
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: Regenerate registered flags/output documentation through `pnpm cli:sync`.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: Match lifecycle/spawn/commit source changes.
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: State proven and unsupported host entrypoints and model/acquisition capabilities.
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: Match any changed prompt context contract.
  - **UPDATE:** `docs/architecture.md`: Record resolver/collector and persistence boundaries in project-owned text below `bkit:end`.
  - **UPDATE:** `docs/testing.md`: Record fixture and actual-host/remote proof procedures in project-owned text below `bkit:end`.
  - **UPDATE:** `docs/observability.md`: Record the design's complete reason-to-action table, safe diagnostic references and gap-versus-attempt totals in project-owned text below `bkit:end`.
  - **DEPENDS ON:** 8, 10, 11, 12, 13
  - **DONE WHEN:** Every Documentation Updates row is implemented using Tasks 12/13's final proof results, instruction source/index checks pass, `pnpm build` yields current committed dist, and one final `pnpm tsx .bkit/core/engine/cli.ts upgrade` renders the installed copies. A fresh scratch consumer installed with the built CLI has the documented five-host payload/command footprint and `bkit check` reports no drift. A pre-change installed fixture retains consumer-owned hook drivers and verifies every supported handoff, with any migration requiring explicit owner authorization. The existing deepest static/unit/integration gate remains intact.
  - **TEST FIRST:** n/a — documentation and generated artifacts; behavior tests belong to Tasks 1-11, actual proofs belong to Tasks 12/13, and fresh/existing-consumer dogfood verifies generated footprint.

<!-- bkit:task 14 end -->
<!-- bkit:group 5 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** Every new file traces to a Reuse Inventory reason.
- [ ] **Extensions landed:** Existing components are extended as specified.
- [ ] **No gate weakened:** Existing tests and publication checks remain intact.
- [ ] **Red before code:** Each planned Unit/Integration test has its recorded red or existing-test update before its logic task.
- [ ] **Tests unchanged:** Planned cases match the recorded red test lines.
- [ ] **Unproven tests:** Only an owner-approved committed test exception clears an unproven planned case.
- [ ] **Gate 2 — Verified:** Every applicable item above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] Match each Derived Test Matrix row to its owning task's completion evidence.
- [ ] Fix tests broken by these changes and run the deepest declared local gate.
- [ ] Verify safe diagnostics, private-artifact cleanup and all Documentation Updates.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every Documentation Updates row is complete.
- [ ] **Docs index accurate:** Existing domain rows cover the final docs.
- [ ] **Gate 3 — Verified:** Every applicable item above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** Run `pnpm bkit:gate:static-unit-integration` and `bkit check` through the build workflow's gate; retain Unit/Integration output separately.
- [ ] **Test Synchronization:** Run each task's named cases and update affected existing fixtures, then run `pnpm test:harvest` for the unshipped Node test suite.
- [ ] **Build Configuration:** Retain `tsconfig.json` exclusion of `**/*.test.ts`, `tmp` and worktrees so tests/private artifacts do not ship.
- [ ] **Unit:** Verify codec/fold/resolver/decoder/report behaviors with named cases from Tasks 1-4/11.
- [ ] **Integration:** Verify real Git, local process, receipt/cache/source files, SQLite footprint and complete checkpoint matrix from Tasks 3/5-10.
- [ ] **Minimum runtime:** Exercise enabled acquisition APIs on Node 24.0.0 as well as the current supported runtime.
- [ ] **Dogfood:** Build, install all five host payloads into a fresh repo `tmp/` scratch consumer and inspect the documented on-disk/CLI footprint.
- [ ] **Actual boundaries:** Review Tasks 12/13 artifacts for real host/session/model and resulting remote-message evidence; fixture success does not discharge them. Task 14 records their final results after all affected checks are repeated.

No migrations, browser E2E or deployed application smoke test applies. This repository has no @live CI lane; the plan does not silently claim those owner/environment-dependent proofs ran in CI. Required actual-boundary results remain task completion conditions.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** Every applicable automated check has retained command output or boundary evidence. These boxes are advisory; the runbook's completion conditions govern the build.

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** Unticked checks here do not block approval or merge; required capability proofs are Tasks 12/13.

- [ ] Run a workflow with a nested host, model switch and subagent; inspect its committed log, outcome and `bkit stats` for observed versus unverified evidence.
- [ ] Resume on another machine/host with old private files unavailable; verify persisted facts remain and missing intervals are visible.
- [ ] Inspect ordinary, landing and remote squash commit messages for exactly one lowercase `bkit-host` matching that operation.
- [ ] Make a local source unavailable or slow; verify bounded completion, sanitized diagnostic and preserved prior acknowledged evidence.
