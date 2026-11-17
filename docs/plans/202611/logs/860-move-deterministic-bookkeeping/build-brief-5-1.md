# Brief: group 5 — Challenge round 1 findings

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
- Group 4: Durable continuation and maintained caller contracts — done
  - TASK 7: Persist CI handoff observations and derive reentry (deterministic-bookkeeping-5; R3, R17–R19). — done
  - TASK 8: Enforce bounded correction and effect-aware recovery (deterministic-bookkeeping-8; R1, R3, R8, R19). — done
  - TASK 9: Migrate maintained callers and generated consumers to engine bookkeeping (all eight findings; R1–R25). — done
- Group 5: Challenge round 1 findings — this group
  - TASK 13: An audit run that follows its prompt overwrites its own finished report: `steps stub --result-file --to=<Create>` replaces the anchored audit report (Probe Steps, Findings, Report, Project Instructions) with the short summary — open
  - TASK 14: A ledger append that crashes between its intent and its receipt can never be reconciled once its invocation goes stale, so the committed pending intent blocks `ledgers union`, compact, migrate and every `--correction-of` on that ledger for good — open
  - TASK 15: Feeding the audit `ledgerRows` the engine prints straight into `ledgers append --invocation` is refused, because each row's `by.step` is `audit-<slug>` while the standalone invocation vouches for `audit:<slug>`; the integration test hides this by stripping `by` — open
  - TASK 16: A resumed re-trigger push on a feature branch force-overwrites a commit someone else pushed, whenever any fetch already moved `origin/<branch>` to it: the remote-movement guard only blocks when the tracking ref is stale, which is exactly when `--force-with-lease` would have failed anyway — open
  - TASK 17: After a crash leaves part of a prepared block in the ledger and the lock is cleared as the error message advises, a friction or plain append lands next (neither checks pending intents), and reconciling the operation then takes the 'none of ours landed: prepare afresh' branch and appends rows that already landed a second time — open
- Group 6: Challenge round 1 findings — next
  - TASK 18: An agent that retries a lost `--issue-operation` append with the same rows but a different JSON key order gets a new engine-issued operation id and appends every row a second time, because the request hash is `JSON.stringify` of the raw rows, not a canonical form — open
  - TASK 19: Audit ledger keys the engine derives are `<slug>-<title>`, while `bkit-audit-generate.md` defines new keys as `audit-<slug>-<content-slug>` and closes stale rows by the `audit-<slug>-` prefix, so rows the engine keys are never closed by later audit runs — open
  - TASK 20: A result file that is just `{}` (or omits `evidenceComplete` and `body`) renders a `Verdict: PASS` challenge or review artifact with an empty body, because `evidenceComplete` defaults to true — open
  - TASK 21: On a fresh consumer with no `docs/failures.jsonl` (coverage `missing`) or a ledger holding one malformed line (coverage `partial`), the prompts' 'follow `nextCursor` until `coverage.clean` is true' never terminates and names no route, so the agent loops, stops, or quietly treats the scan as clean — open
  - TASK 22: Every issued invocation commits the developer's absolute checkout paths (home directory and username, e.g. `/Users/<name>/...`) into the tracked run `status.jsonl`, which ships in consumer repo history and bkit's public repo. — open
- Group 7: Challenge round 1 findings — later
  - TASK 23: Ledger-operation intents and receipts live in the committed, union-carried `.bkit/ledger-operations.jsonl`, not the private git-common outbox the plan names. A crash, or a branch that commits a receipt-less intent row, then propagates on merge and blocks `ledgers union` (worktree teardown), `ledgers compact` and the upgrade-path `migrateLedgers` in every checkout. The replay that would clear it needs the original request, which no other checkout can reproduce. — open
  - TASK 24: A line break in a header-bound result value (`report`, `issue` or `parent` in an audit result, or any free-text judgment) injects forged header lines and an early `<!-- verdict:end -->`. For example, a multi-line `report` that adds `Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0` makes `readHeader` read zero findings over the engine-derived `CRITICAL 1`. Because the cut-off header carries no `Fingerprint`, `fingerprintProblem` treats the artifact as hand-written and skips the stale check. — open

## The work

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
