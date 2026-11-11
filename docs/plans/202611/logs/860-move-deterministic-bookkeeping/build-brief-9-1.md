# Brief: group 9 — Challenge round 2 findings

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
- Group 6: Challenge round 1 findings — done
  - TASK 18: An agent that retries a lost `--issue-operation` append with the same rows but a different JSON key order gets a new engine-issued operation id and appends every row a second time, because the request hash is `JSON.stringify` of the raw rows, not a canonical form — done
  - TASK 19: Audit ledger keys the engine derives are `<slug>-<title>`, while `bkit-audit-generate.md` defines new keys as `audit-<slug>-<content-slug>` and closes stale rows by the `audit-<slug>-` prefix, so rows the engine keys are never closed by later audit runs — done
  - TASK 20: A result file that is just `{}` (or omits `evidenceComplete` and `body`) renders a `Verdict: PASS` challenge or review artifact with an empty body, because `evidenceComplete` defaults to true — done
  - TASK 21: On a fresh consumer with no `docs/failures.jsonl` (coverage `missing`) or a ledger holding one malformed line (coverage `partial`), the prompts' 'follow `nextCursor` until `coverage.clean` is true' never terminates and names no route, so the agent loops, stops, or quietly treats the scan as clean — done
  - TASK 22: Every issued invocation commits the developer's absolute checkout paths (home directory and username, e.g. `/Users/<name>/...`) into the tracked run `status.jsonl`, which ships in consumer repo history and bkit's public repo. — done
- Group 7: Challenge round 1 findings — done
  - TASK 23: Ledger-operation intents and receipts live in the committed, union-carried `.bkit/ledger-operations.jsonl`, not the private git-common outbox the plan names. A crash, or a branch that commits a receipt-less intent row, then propagates on merge and blocks `ledgers union` (worktree teardown), `ledgers compact` and the upgrade-path `migrateLedgers` in every checkout. The replay that would clear it needs the original request, which no other checkout can reproduce. — done
  - TASK 24: A line break in a header-bound result value (`report`, `issue` or `parent` in an audit result, or any free-text judgment) injects forged header lines and an early `<!-- verdict:end -->`. For example, a multi-line `report` that adds `Findings: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 0` makes `readHeader` read zero findings over the engine-derived `CRITICAL 1`. Because the cut-off header carries no `Fingerprint`, `fingerprintProblem` treats the artifact as hand-written and skips the stale check. — done
- Group 8: Challenge round 2 findings — done
  - TASK 25: A ledger append killed at its `prepared` checkpoint, followed by any ordinary write to the same ledger (a dispatcher friction row, a plain append), can never be reconciled: every schema-3 row starts `{"schema":3,"ts":179...`, so the byte-prefix count at `ledgers.ts:1753` always finds "landed" bytes, the replay throws `UncertainEffect` instead of preparing afresh, and the pending intent blocks `ledgers union`, `compact`, `migrate` and `--correction-of` on that ledger for good — done
  - TASK 26: On a shared branch, a re-trigger whose push response is lost (process killed during or right after `git push`, before `push-completed` persists) is pushed a second time on resume: `landEmptyOwnCommits` re-copies the original commit because the pushed copy has a new SHA and is not in `rec.pushed`, so dev gets two empty re-trigger commits and two CI runs; if the kill lands after `markRecordPushed`, resume instead returns the local original SHA (`rec.pushed.at(-1)`), which the remote never received, and the re-poll watches that SHA — done
  - TASK 27: A subagent that dies before writing its result (turn cap, crash, refusal) still gets a well-formed artifact: Result paths are reused across rounds and runs (`{OUTBOX}/build-challenge-1-result.json` has no round; `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}` and `build-failure-diagnose-{TEST_ATTEMPT}` restart in a new run), nothing clears them before launch, and `steps stub --result-file` renders whatever file is there, so round 1's findings render as round 2's report and an earlier run's PASS verify result renders as this group's PASS — done
  - TASK 28: An agent that keeps one `--operation` for its corrected retries gets unlimited corrections: a rejected candidate leaves no intent or receipt, so its id carries no request hash, and `spendCorrection` returns `allowed` (replayed) for any operation already in the scope whatever rows it now carries, so `remaining` never reaches 0 and every rejection stays a correctable `NoWriteRejection` — done
  - TASK 29: `ledgers query` reports `coverage.clean: true` on a page whose `nextCursor` is non-null, and the plan workflow saves exactly one `--limit=500` page into `related-knowledge.md` for reviewers who have no shell; past 500 active rows the newest knowledge rows (the page is oldest-first) are silently dropped while the saved output says the scan is clean — done
- Group 9: Challenge round 2 findings — this group
  - TASK 30: A new audit finding whose title matches an earlier audit row of a different problem (same title, other `file:line`, which the prompt calls "a different problem") gets that row's key: `auditEntries` checks a derived `audit-<slug>-<title>` key only against this result's `priorKey`s, never against `docs/failures.jsonl`, so the append lands as a later row of the old key and the old, still-open failure drops out of the fold winners — open
  - TASK 31: A committed `docs/plans/<month>/logs/<fid>/status.jsonl` that is a symlink to another checkout's (or any empty or NDJSON) file passes the Task 11 containment check, because only the parent directory is resolved with `realpathSync`; `status invocation` then appends its `invocation` event through the symlink, and every later invocation-bound `engine-call` row and correction row follows it into the other checkout's log. — open

## The work

<!-- bkit:task 30 start -->

- [ ] **TASK 30:** A new audit finding whose title matches an earlier audit row of a different problem (same title, other `file:line`, which the prompt calls "a different problem") gets that row's key: `auditEntries` checks a derived `audit-<slug>-<title>` key only against this result's `priorKey`s, never against `docs/failures.jsonl`, so the append lands as a later row of the old key and the old, still-open failure drops out of the fold winners
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:735` · **Round:** 2
  - **DONE WHEN:** A derived key is unique against every key already in the target ledger as well as within the result (the renderer reads the ledger's winners and suffixes `-2`, `-3` ...), so reusing an existing key happens only through an explicit `priorKey`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `derives a fresh audit key when the ledger already holds it` fails on `renderResult` for a `security` result with a new `Token logged` finding, in a checkout whose `docs/failures.jsonl` already holds an OPEN `audit-security-token-logged` row, printing `ledgerRows[0].key` = `audit-security-token-logged`.

<!-- bkit:task 30 end -->

<!-- bkit:task 31 start -->

- [ ] **TASK 31:** A committed `docs/plans/<month>/logs/<fid>/status.jsonl` that is a symlink to another checkout's (or any empty or NDJSON) file passes the Task 11 containment check, because only the parent directory is resolved with `realpathSync`; `status invocation` then appends its `invocation` event through the symlink, and every later invocation-bound `engine-call` row and correction row follows it into the other checkout's log.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/status.ts:682` · **Round:** 2
  - **DONE WHEN:** `status invocation` resolves the full `--file` path, symlinks included (`fs.lstatSync` refuses a symlinked final component, or `realpathSync` of the file itself when it exists), before the containment test, and exits non-zero with no write when the resolved file lies outside the issuing checkout or in a nested worktree. `resolveInvocation` and `rebuildInvocation` (`.bkit/core/engine/commands/lib.ts`) refuse a receipt or event whose status file now resolves outside the checkout.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `refuses to issue an invocation through a status file symlinked out of the checkout` fails on `status invocation --file=<REL>` exiting 0 and the other repository's `status.jsonl` gaining an `invocation` row, when `<REL>` in the issuing repository is a symlink to that file.

<!-- bkit:task 31 end -->
