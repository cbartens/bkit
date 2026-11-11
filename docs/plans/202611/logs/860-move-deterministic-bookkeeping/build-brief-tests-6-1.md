# Brief: group 6 — Challenge round 1 findings (tests)

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
- Group 5: Challenge round 1 findings — done
  - TASK 13: An audit run that follows its prompt overwrites its own finished report: `steps stub --result-file --to=<Create>` replaces the anchored audit report (Probe Steps, Findings, Report, Project Instructions) with the short summary — done
  - TASK 14: A ledger append that crashes between its intent and its receipt can never be reconciled once its invocation goes stale, so the committed pending intent blocks `ledgers union`, compact, migrate and every `--correction-of` on that ledger for good — done
  - TASK 15: Feeding the audit `ledgerRows` the engine prints straight into `ledgers append --invocation` is refused, because each row's `by.step` is `audit-<slug>` while the standalone invocation vouches for `audit:<slug>`; the integration test hides this by stripping `by` — done
  - TASK 16: A resumed re-trigger push on a feature branch force-overwrites a commit someone else pushed, whenever any fetch already moved `origin/<branch>` to it: the remote-movement guard only blocks when the tracking ref is stale, which is exactly when `--force-with-lease` would have failed anyway — done
  - TASK 17: After a crash leaves part of a prepared block in the ledger and the lock is cleared as the error message advises, a friction or plain append lands next (neither checks pending intents), and reconciling the operation then takes the 'none of ours landed: prepare afresh' branch and appends rows that already landed a second time — done
- Group 6: Challenge round 1 findings — this group
  - TASK 18: An agent that retries a lost `--issue-operation` append with the same rows but a different JSON key order gets a new engine-issued operation id and appends every row a second time, because the request hash is `JSON.stringify` of the raw rows, not a canonical form — open
  - TASK 19: Audit ledger keys the engine derives are `<slug>-<title>`, while `bkit-audit-generate.md` defines new keys as `audit-<slug>-<content-slug>` and closes stale rows by the `audit-<slug>-` prefix, so rows the engine keys are never closed by later audit runs — open
  - TASK 20: A result file that is just `{}` (or omits `evidenceComplete` and `body`) renders a `Verdict: PASS` challenge or review artifact with an empty body, because `evidenceComplete` defaults to true — open
  - TASK 21: On a fresh consumer with no `docs/failures.jsonl` (coverage `missing`) or a ledger holding one malformed line (coverage `partial`), the prompts' 'follow `nextCursor` until `coverage.clean` is true' never terminates and names no route, so the agent loops, stops, or quietly treats the scan as clean — open
  - TASK 22: Every issued invocation commits the developer's absolute checkout paths (home directory and username, e.g. `/Users/<name>/...`) into the tracked run `status.jsonl`, which ships in consumer repo history and bkit's public repo. — open
- Group 7: Challenge round 1 findings — next
  - TASK 23: Ledger-operation intents and receipts live in the committed, union-carried `.bkit/ledger-operations.jsonl`, not the private git-common outbox the plan names. A crash, or a branch that commits a receipt-less intent row, then propagates on merge and blocks `ledgers union` (worktree teardown), `ledgers compact` and the upgrade-path `migrateLedgers` in every checkout. The replay that would clear it needs the original request, which no other checkout can reproduce. — open
  - TASK 24: A line break in a header-bound result value (`report`, `issue` or `parent` in an audit result, or any free-text judgment) injects forged header lines and an early `<!-- verdict:end -->`. For example, a multi-line `report` that adds `Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0` makes `readHeader` read zero findings over the engine-derived `CRITICAL 1`. Because the cut-off header carries no `Fingerprint`, `fingerprintProblem` treats the artifact as hand-written and skips the stale check. — open

## The work

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

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| issues invocation metadata from an explicit run and registered step | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 1 |
| rejects conflicting attribution and retains legacy writer restrictions | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 2 |
| pages canonical winners with diagnostics and rejects stale cursors | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| returns durable append receipt and permits a deliberate same-key update | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 4 |
| derives supported header fields and rejects stale bodies without false PASS | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| retains special verdict judgments and legacy stub behavior | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 5 |
| derives audit IDs totals ledger payloads and coverage from one result | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 6 |
| renders audit comments from validated result and preserves tracker adapters | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 6 |
| renders one recovery precedence contract for all hosts and tracker adapters | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 9 |
| records the issued invocation in the run status log and rebuilds a deleted receipt | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 10 |
| refuses to issue an invocation into a status file outside the issuing checkout | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 11 |
| audit result render keeps an existing anchored report intact | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 13 |
| issues the same operation for rows whose keys are reordered | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 18 |
| derives audit ledger keys under the audit-slug prefix | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 19 |
| renders no PASS from a result that omits its evidence | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 20 |
| routes every ledgers query reader on coverage status | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 21 |
| writes no absolute checkout path into the run's committed invocation event | Unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 22 |
| keeps ledger operation intents and receipts out of committed book paths | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 23 |
| refuses line breaks in header-bound result values | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 24 |
