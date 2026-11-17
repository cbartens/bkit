<!-- bkit:anchor
baseSha: 2d20c6522612e0bde8ce392a335d7d6ff9522988
baseRef: dev
bkitVersion: 6.1.1
bkitLatest:
-->
<!-- bkit:start -->

<!-- Note: Focused report created from docs/templates/bkit-audit-reliability.md. Report: docs/audits/202611/deterministic-bookkeeping.md. -->

# Reliability Audit: Deterministic Bookkeeping

> [!CAUTION]
> **Purpose:** Identify bookkeeping that the engine can derive or serialize, reducing agent omissions and unnecessary workflow stops.
>
> **Rules:**
>
> - This is a source audit of bookkeeping, scoped by the owner's request. It is not a full infrastructure reliability audit.
> - Findings describe verified contract gaps and opportunities. No production defect reproduction or failure injection was performed.
> - Proposed recovery wording is a recommendation for the follow-up issue, not an instruction governing this audit.

## Universal Instructions

### Context & Goals

The owner reported a consumer workflow stopping after a ledger append omitted `by.model`. The append implementation already owns part of the envelope, but subagents still supply attribution. This audit inventories adjacent bookkeeping surfaces and distinguishes work already owned by the engine from remaining agent work.

### Scope

All six canonical workflow sources and all 40 canonical prompt sources were inventoried by text search. Relevant implementations were then read in the workflow commands, ledger primitives, and runtime/session recording. Coverage includes ledger attribution and reads, run identity and paths, artifact envelopes and counts, status and resume, counters and telemetry, tracker payloads, CI handoffs, append replay, and recovery wording.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Reason | Follow-up |
| --- | --- | --- |
| Implementing the findings or changing current rules | The owner requested an audit and issue | Design and implement from the issue |
| Full hosted-service reliability, SLOs, vendor status and disaster recovery | `docs/architecture.md:24` states that bkit has no server, database, or network service; this run is scoped to bookkeeping | Separate reliability run when requested |
| Discovering cross-host identity from scratch | An existing issue owns host/model capture | Reuse [Record which host and model ran each workflow, on every host](https://github.com/cbartens/bkit/issues/836) |
| Replacing tracker progress comments | An existing issue owns comment consolidation | Coordinate with [Append routine workflow step updates to one comment per run](https://github.com/cbartens/bkit/issues/826) |
| Inferring findings, severity, acceptance, root cause or successful tests | These require evidence and judgement | Keep them explicit agent or owner inputs |

### Pre-Flight / Dependencies

#### Core

- [x] **Permissions:** Local source reads and the report anchor command succeeded. No blocked calls occurred in this subtask.
- [x] **Code Search:** ripgrep 15.2.0, Python 3, Node v24.16.0 and Serena TypeScript symbol overview were available. Serena inspected `steps.ts`, `status.ts`, `counters.ts`, `runs.ts`, and `summary-findings.ts`; text search corroborated the scope. The large `finish` symbol exceeded the requested response bound, so targeted source ranges were read instead.
- [x] **Web:** External SRE standards were not fetched. The scope uses the repository contracts as its standards; hosted-service standards are outside this focused run.

#### Conditional

- [ ] **Metrics:** Not applicable to this source-only bookkeeping audit; no live measurement claim is made.
- [ ] **Job Platform:** No job-platform replay was inspected or executed; CI command handoffs were inspected in source.
- [ ] **Deploy Platform:** Not applicable to the scoped bookkeeping paths.
- [ ] **Vendor Status:** Not checked; not needed to establish the local contracts.

### 🔒 Gate 1: Prerequisites Check

- [x] **Gaps named:** Live and external checks are explicitly excluded below.
- [x] **Gate 1 — Verified:** All applicable prerequisites were checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** Baseline for `deterministic-bookkeeping`; the report-path inventory found no earlier report of this slug.
- [x] **Step 2 — Surfaces:** Inventoried six workflows, 40 prompts and relevant engine modules. See `Surfaces`.
- [x] **Step 3 — Journeys:** Traced ledger append, agent result completion, CI handoff and audit publication from source. No hosted SLI/SLO measurement applies to this focused run.
- [x] **Step 4 — Dropped Errors:** Checked validation and failure routing. Rejections are surfaced; the issue is missing engine ownership and excessive escalation, not an established swallowed error.
- [x] **Step 5 — Timeouts:** Read the CI wait budget and handoff path. Broader network timeout verification is outside this audit.
- [x] **Step 6 — Idempotency:** Compared append behaviour with existing tracker/commit engine-action deduplication. See deterministic-bookkeeping-7.
- [x] **Step 7 — Races:** Reviewed existing durable run/status context and multi-run ambiguity constraints. No concurrency stress test or claim of corruption was made.
- [x] **Step 8 — Time:** Checked that the engine owns timestamps/month/path functions. User-local scheduling is outside this run.
- [x] **Step 9 — Degradation:** Walked the four bookkeeping journeys on paper. See `Degradation`.
- [x] **Step 10 — Levers:** Checked the recovery/authorization boundary in workflow prose. No emergency setting was changed.
- [x] **Step 11 — Recovery:** Compared explicit recovery routes, no-write rejection, resume state and unknown write outcomes. See deterministic-bookkeeping-8.
- [x] **Step 12 — Deploys:** Recorded five-host rendering and none-tracker verification as follow-up acceptance coverage. No install or deployment was performed.
- [x] **Step 13 — Alerts:** Source-level CLI errors and status records are the signals examined. Hosted alert coverage is outside scope.
- [x] **Step 14 — Incidents:** The owner's supplied incident is motivation only; code and contract evidence establish the findings. No transcript was treated as proof of actual installed runtime state.
- [x] **Step 15 — Standards:** Cross-checked the repository's ledger, workflow, authoring, architecture and tracker contracts. External reliability standards are outside this focused run.
- [x] **Step 16 — Anything Else:** Inspected related issue descriptions supplied by the caller and documented ownership overlaps. This is a baseline rather than a historical delta audit.

### 🔒 Gate 2: Probes Check

- [x] **Steps complete:** All applicable steps were completed, with scoped exclusions above.
- [x] **Evidence:** Every finding cites source lines and the reading method.
- [x] **Read-only:** No dependency was taken down.
- [x] **No side effects:** No replay, send, charge or restore ran.
- [x] **Alerts unchanged:** No alert or monitor changed.
- [x] **Gate 2 — Verified:** The focused source probes are complete.

## Findings

Severity follows `.bkit/jsonl.md` § Severity. `HIGH` identifies the directly blocked bookkeeping path; `MEDIUM` identifies repeated manual work or a reliability contract gap. Opportunities are not claimed as reproduced runtime defects.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| deterministic-bookkeeping-1 | HIGH | `.bkit/core/engine/commands/workflow/ledgers.ts:1279`; `.bkit/core/engine/ledgers/telemetry.ts:464`; `.bkit/core/.bkit/jsonl.md:171` | Source reads: append fills schema, timestamp, repo, version and lineage, but copies `by` unchanged. `writerProblem` rejects a subagent row missing its model. The written contract tells the subagent to copy its frontmatter. | Resolve workflow, step, subagent and actual model from verified invocation context before validation. Reuse the host/model capture contract of the existing issue. Keep configured model distinct from observed model. Define explicit missing/ambiguous-context handling without inventing attribution. Reject conflicting or unauthorized authorship rather than silently overwriting it. |
| deterministic-bookkeeping-2 | MEDIUM | `.bkit/core/prompts/bkit-utility-update-knowledge.md:63`; `.bkit/core/prompts/bkit-audit-generate.md:161`; `.bkit/core/engine/commands/workflow/context.ts:668`; `.bkit/core/engine/commands/workflow/ledgers.ts:1` | Search and source reads: 11 prompts contain the highest-timestamp fold instruction. `ledgerScan` matches raw lines, sorts by overlap/line position and keeps at most 40; it is not a canonical fold/status-filtered reader. The ledger CLI exposes append/check/triage/compact, but no matching read/fold interface. | Expose an engine-owned, read-only ledger query using the canonical parser/folder, with key/status filters, deterministic timestamp/tie handling, complete paging and structured malformed-line diagnostics. Never represent unread or malformed content as an empty/clean scan. Route prompts through it instead of bespoke Python/jq helpers. |
| deterministic-bookkeeping-3 | MEDIUM | `.bkit/core/engine/commands/workflow/steps.ts:200`; `.bkit/core/engine/commands/workflow/steps.ts:1090`; `.bkit/core/prompts/bkit-build-challenge-1.md:89`; `.bkit/core/prompts/bkit-plan-review-1.md:89` | Search and source reads: 23 prompts require a machine-parseable output header. Agents separately write `Failures`, `Redesign` and `Verdict`; the engine parses/validates these and asks the agent to re-emit an invalid header. Challenge findings are already parsed structurally by `challenge.ts:155`. | Provide an engine-owned artifact serializer/envelope and compute redundant totals/booleans from structured findings where the contract is deterministic. Preserve evidence-dependent judgements and special verdict rules as explicit inputs. Validate that the envelope agrees with the body before completing the step, without a model round trip for formatting alone. |
| deterministic-bookkeeping-4 | MEDIUM | `.bkit/core/workflows/bkit-plan.md:112`; `.bkit/core/workflows/bkit-plan.md:222`; `.bkit/core/workflows/bkit-plan.md:250`; `.bkit/core/engine/commands/workflow/status.ts:392`; `.bkit/core/engine/commands/workflow/workflows.ts:203` | Source reads: workflows hold and retransmit repository, FID, month, status path, log path, workflow, step, artifact path, number, title and comment link-ref. The engine already resolves status locations and durable run state, but callers still rebuild combinations of them. | Bind commands to an explicit durable run/invocation identity, and derive registered step metadata and paths there. Resolve ambiguity explicitly when multiple runs/worktrees exist; validate overrides and scope. Cover start, resume, no-plan conversion, task groups, remediation and ship's bookkeeping root. Do not assume the most recent global run is the caller. |
| deterministic-bookkeeping-5 | MEDIUM | `.bkit/core/workflows/bkit-build.md:37`; `.bkit/core/workflows/bkit-debug.md:37`; `.bkit/core/engine/commands/workflow/runs.ts:686`; `.bkit/core/engine/commands/workflow/runs.ts:1786` | Source reads: the nonwaiting path tells the orchestrator to count turns, determine found/none/err, remember whether every poll errored, and resupply `--poll-result`, `--attempts`, `--all-errored`, and `--retriggered`. The engine accepts these as a `SuppliedPoll`. | Persist CI handoff phase, poll observations, attempt count, cumulative errors, target head/PR/repository and retrigger identity in engine state. A poll command should record its own observation and derive the next action, preserving state across compaction/resume and preventing stale evidence from another head or run. |
| deterministic-bookkeeping-6 | MEDIUM | `.bkit/core/prompts/bkit-audit-generate.md:147`; `.bkit/core/prompts/bkit-audit-generate.md:157`; `.bkit/core/prompts/bkit-audit-generate.md:234` | Source reads: the auditor manually assigns IDs, folds/deduplicates existing findings, writes one ledger row per finding, reconciles closures, counts severity, builds Suggested Issues and separately supplies tracker summary totals/report links. | Accept structured audit findings once, then derive stable report-local IDs, severity totals, deterministic report/ledger/comment metadata and source links. Expose candidate prior-key matches, while retaining human/agent judgement for semantic equivalence, closure evidence and issue grouping. Coordinate tracker publication with the existing progress-comment issue. |
| deterministic-bookkeeping-7 | MEDIUM | `.bkit/core/engine/commands/workflow/ledgers.ts:1279`; `.bkit/core/engine/commands/workflow/ledgers.ts:1336`; `.bkit/core/engine/ledgers/status.ts:375`; `.bkit/core/engine/commands/workflow/tracker.ts:1085` | Source reads: generic append validates all rows, mints new timestamps and appends; it has no operation/replay identity parameter. Existing `engine-action` key/hash/ref records already deduplicate tracker actions, and steps reuse this mechanism for commits. A repeated generic append is therefore another event even when it represents the same attempted operation. | Add scoped replay/reconciliation support for bookkeeping writes and return a durable receipt describing effects. Reuse existing engine-action primitives where appropriate. Keep a deliberate same-key update distinct from replay; do not deduplicate all same-key or equal-content events globally. Inspect uncertain outcomes before retrying. No duplicate-write incident was reproduced in this audit. |
| deterministic-bookkeeping-8 | HIGH | `.bkit/core/workflows/bkit-plan.md:16`; `.bkit/core/workflows/bkit-plan.md:26`; `.bkit/core/workflows/bkit-plan.md:34`; `.bkit/core/.bkit/jsonl.md:65`; `.bkit/instructions.md:2623` | Search and source reads: all six workflows permit sandbox and read-only-helper recovery, then send other unrecovered command failures to Failure Path. Recovery scope keeps bkit command failures on their explicit route. Ledger validation exit 8 guarantees nothing written, but has no generic correction route. | Add shared wording permitting bounded correction after a guaranteed no-write rejection, engine deterministic fill first, verified continuation at the same substep and explicit reconciliation for uncertain effects. Preserve authorization, named gates, special recovery routes and finite retry accounting. |

## Report

### Summary

Eight findings: CRITICAL 0, HIGH 2, MEDIUM 6, LOW 0. This is a baseline source audit of four bookkeeping journeys: ledger append, agent-result completion, CI handoff and audit publication. No live availability measurements were collected. Every dependency of these four journeys was walked on paper using the inspected code and written contract.

The engine already manages substantial bookkeeping. The remaining scope is a consistent ownership and invocation contract, reuse of existing parsers/serializers/deduplication, and explicit bounded recovery. The report does not propose reimplementing every command or converting evidence-based judgements into guesses.

### Previous Run

Baseline for this focused slug. No closure rate or historical delta is claimed. Audited commit and branch are in the engine-stamped anchor above.

### Surfaces

<!-- prettier-ignore -->
| Area | Current engine ownership | Remaining deterministic scope | Finding |
| --- | --- | --- | --- |
| Ledger write envelope | Schema, timestamp, default repo, bkit version, firstTs and updates; validation before any append | Invocation attribution, explicit conflict/unknown policy | 1 |
| Ledger reads and history | Internal tolerant parsing, fold/normalization, compact; raw text context search | Public canonical read/query with diagnostics and complete paging | 2 |
| Artifact envelopes | Header parsing, allowed values, required fields, worst-verdict combination, count summing | Formatting, duplicate count/boolean derivation from structured evidence | 3 |
| Repository/FID/month/paths | `repo`, `fids`, locks, status location and workflow where/resume helpers | Bind one explicit invocation; remove repeated derivable flags, paths, step titles/numbers | 4 |
| Attempts and routing | `counters.ts:1` derives counts from status; strategy and route are engine-owned | Reuse these primitives; no new model-maintained counter | 4, 5 |
| CI waiting | Budgeted wait loop, target probing, dispatch/retrigger logic | Durable nonwaiting handoff receipts and observations | 5 |
| Audit bookkeeping | Anchor stamping and generic ledger/comment writers | One structured findings source for counts, report and candidate ledger updates | 6 |
| Tracker labels/comments | Engine computes transitions, generated marker/hash, comment payloads and posting/dedup | Reuse existing paths for audit/start metadata; receipt/reconciliation for fallback | 4, 6, 7 |
| Replay and side effects | Engine-action key/hash/ref dedup for tracker posts and step commits | Generic ledger append operation identity and effect receipts | 7 |
| Failure and recovery policy | Named recovery routes and status resume | Safe validation correction and reconciled retry classification | 8 |
| Outcome telemetry | `workflows.ts:1304` derives counters/outcomes; `run-facts.ts:145` derives step totals and other measured blocks | Consume verified invocation attribution; coordinate existing host/model work | 1 |
| Task completion and summaries | Tasks/parser/test-first commands and `summary.ts:543` derive evidence summaries | Reuse existing structured state; preserve semantic verification by agents | 3, 4 |

Hard dependencies are the local source/ledger/status files and Git for the audited paths. Tracker publication is an external side effect with an existing engine/MCP fallback. Host model metadata may be absent and needs an explicit policy, not a fabricated hard dependency. No additional hosted application subsystem is included.

### Journeys

<!-- prettier-ignore -->
| Journey | Trigger | Current outcome under incomplete bookkeeping | Required outcome |
| --- | --- | --- | --- |
| Ledger append | Subagent finding without model | Validation refuses before writing; generic workflow route can terminate | Engine fills from verified context, or returns an actionable bounded-recovery state |
| Agent result completion | Correct finding content with malformed header or inconsistent count | Step requests a header rewrite; another invalid return fails the workflow | Engine owns envelope formatting and redundant arithmetic; semantic inconsistencies remain explicit |
| CI handoff | Runtime cannot wait, or uses tracker fallback | Agent reconstructs poll state across turns | Engine persists observations and emits the next action |
| Audit publication | One list of evidence-backed findings | Report totals, ledger rows and comment totals are assembled separately | Engine derives deterministic outputs from one structured finding set |

### Degradation

Paper walk: missing model context must produce an explicit unknown/unavailable state or a narrow recoverable rejection; it must not substitute the Claude source pin as the observed Codex model. Malformed ledger input must identify bad lines and report partial coverage. Lost command output after an append must trigger effect inspection/reconciliation before retry. A CI handoff resumed against a changed head must discard or reject stale observations. Tracker/MCP fallback must use exact engine-generated payloads and existing authorization. Conflicting invocation identities must stop the affected mutation for resolution while independent authorized work continues.

### Game Day

No game day was performed or required for this source audit. Last game day date/outcome was not checked. The next relevant exercise is a scratch-consumer test of rejected bookkeeping followed by corrected input, plus lost-response reconciliation; these are proposed acceptance tests, not executed probes.

### Levers

The current explicit approval and failure routes remain the control boundaries. The proposed retry budget is two corrected retries per operation, retained across helper rewrites, tool switches, compaction and resume. Permission denial and owner decisions are not bypassed. No lever or gate was changed.

### Recovery

Recommended shared wording for the follow-up design:

> Apply an operation's explicit recovery route first. Let the engine fill bookkeeping fields it can determine from verified run and invocation context before validation. When validation guarantees that no write or other side effect occurred, correct the reported input and retry at most twice, keeping one retry budget across rewrites, tool switches and resume. Verify the result and continue from the interrupted substep. When effects are uncertain, inspect durable state and reconcile the prior operation before retrying; retry only when duplicate effects are prevented. Do not invent attribution, weaken a gate or bypass authorization. Enter Failure Path when the operation still fails after its recovery budget, a required gate remains unsatisfied after its prescribed remediation, or further recovery requires unavailable information, authorization or an owner decision.

Update `.bkit/instructions.md` shared clauses and their six workflow consumers together, plus `.bkit/core/.bkit/jsonl.md`, affected prompts, engine error/receipt contracts and corresponding catalogs. Define how a recovery receipt and its retry budget persist. Keep specialized recovery precedence, explicit STOP markers and genuine semantic validation intact.

### Alerts

CLI validation messages and durable workflow/status records were examined as local operator signals. Structured errors should state the failing field, whether effects occurred, whether correction is allowed, the operation receipt and next action. No hosted alert coverage was inspected.

### Incidents

The motivating consumer incident was supplied in chat. This audit did not read that consumer checkout or assert its installed version. The maintained source independently proves the missing attribution and recovery contract combination. No consumer identity is stored in this report.

### Checked

- Canonical six workflow and 40 prompt source inventory; all six carry read-only-helper recovery, two carry the CI turn-loop handoff, 23 prompts carry output-header constraints, and 11 carry highest-timestamp ledger-fold instructions.
- Relevant `ledgers`, `steps`, `status`, `counters`, `runs`, `context`, `workflows`, `run-facts`, `challenge`, `summary`, `tracker` and `branches` implementations, via targeted reads and symbol overview.
- Ledger contract and shared recovery clauses, existing engine-action primitives, canonical artifact/anchor tooling and engine-generated outcomes.
- Read-only fold of failures, deferrals and knowledge for matching prior records: 204, 192 and 139 distinct keys respectively; no malformed lines in these three current-repo ledgers. No matching open record described these eight exact surfaces/problems. An existing render-baseline recovery finding is separate.
- Related issue descriptions supplied by the caller: host/model capture and progress-comment consolidation. These are coordination inputs, not substitutes for source evidence.

### Not Checked

- `.agents/docs.md` was changed by the caller to index this report while the audit ran; its prior content was read before that change. No code or workflow source changed during this subtask.
- Runtime reproduction of the consumer incident, all-provider live invocation probes, CI/MCP fallback execution, concurrent append stress tests, and lost-response/replay experiments were not run.
- No unit, integration, end-to-end or live tests were run; this audit changes no engine behaviour and makes source-contract findings only.
- External Google/AWS reliability standards, hosted traces, SLOs, vendor status, backup/restore targets, full deploy reliability and historical incident response are outside this focused scope.
- Full instruction equivalence after five-host and tracker rendering is follow-up verification; source inventory does not prove installed parity.
- Exact invocation context schema, missing/ambiguous attribution representation, report serialization API and replay receipt storage remain design choices. Recommended option: reuse existing run/status and engine-action primitives, consuming the existing host/model issue's contract.

### Standards Coverage

<!-- prettier-ignore -->
| Standard or contract | Verdict | Evidence |
| --- | --- | --- |
| `.bkit/jsonl.md` Write Idiom / Who Wrote It | Partial; manual attribution remains | Findings 1, 2, 7 |
| `.agents/rules.md` completeness, honest reporting, no speculative scope | Followed in audit | Source opportunities distinguished from reproduced defects; exclusions explicit |
| `.bkit/authoring.md` All Agent-Read Files / Before You Save | Followed in report | One scope, concrete evidence and recommendations; no shipped instruction changed |
| `.bkit/instructions.md` workflow failure/recovery clauses | Finding | Finding 8 |
| `.bkit/trackers.md` Issue shapes | Caller-owned follow-up | One idea-shaped issue should carry all findings because the shared context/replay contracts need design |
| External REL05 BP01-BP07, REL11, REL13; SLO/error-budget checklist | Not applicable to scoped source audit | No full infrastructure assessment was requested |
| Deploy rollback/migration anchors in reliability template | Not applicable | No deployed application data or migration behaviour audited |

### Beyond the Steps

Baseline only: no previous-run change delta is claimed. Existing host/model capture and progress-comment issues constrain integration: consume their contracts and avoid a second host detector or tracker publisher. No whole-engine rewrite is justified. Outcome telemetry, counters, status resume, anchors, task parsing, tracker hashes and commit deduplication are already engine work and should be extended where needed.

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Move deterministic bookkeeping and safe recovery into the engine | deterministic-bookkeeping-1, deterministic-bookkeeping-2, deterministic-bookkeeping-3, deterministic-bookkeeping-4, deterministic-bookkeeping-5, deterministic-bookkeeping-6, deterministic-bookkeeping-7, deterministic-bookkeeping-8 | HIGH | /bkit-design | Shared invocation, unknown-attribution and replay contracts need design before implementation |

### Process Improvements

Caller follow-up: [#860 — Move deterministic bookkeeping and safe recovery into the engine](https://github.com/cbartens/bkit/issues/860) records all eight findings, the proposed rule wording and validation requirements. The issue is under Workflow optimisation, with `next:design`, High priority, size L and the Future Releases milestone. The caller subsequently ran the ledger-integrity unit suite: 31 tests passed. Live host, replay and concurrency checks remain outside this source audit.

**Universal:** Add a reusable focused-bookkeeping audit scope or project recipe so future runs can inventory source contracts without implying a full hosted reliability assessment. Derive audit totals/IDs/envelopes through the engine once finding 6 lands. No template change was made in this run.

**Project:** None. Relevant paths and commands already live in the indexed architecture, ledger, CLI and authoring docs. This subtask owns the report and its ledger rows only, so it does not edit the shared reliability template.

### 🔒 Gate 3: Report Check

- [x] **No placeholders:** Every report section has content or an explicit scoped exclusion.
- [x] **Summary:** Counts are CRITICAL 0, HIGH 2, MEDIUM 6, LOW 0.
- [x] **Journeys:** Four source-traced bookkeeping journeys are named; no measured SLI is claimed.
- [x] **Paper walk:** Each scoped dependency was walked on paper.
- [x] **Series:** The run is marked baseline.
- [x] **Game Day:** No date/outcome was checked; no exercise was run.
- [x] **Game Day outcome:** The absence of a checked result is explicit.
- [x] **Next dependency:** Scratch-consumer validation/replay exercises are named as follow-up tests.
- [x] **Writes:** This subtask writes this report and its eight failure-ledger findings only.
- [x] **Throwaways removed:** No throwaway worktree or remote target was created.
- [x] **Process Improvements:** Universal and Project are filled.
- [x] **Suggested Issues:** All eight findings occur in exactly one row.
- [x] **Next Step:** The row recommends design.
- [x] **Gate 3 — Verified:** The focused report is complete.

<!-- bkit:end -->
