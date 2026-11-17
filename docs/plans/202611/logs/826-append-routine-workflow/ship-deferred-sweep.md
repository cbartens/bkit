Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202611/826-append-routine-workflow-plan.md`. Intended deliverables come from its `Acceptance Scenario` Success Criteria (`plan.md:32-36`) and the `DONE WHEN` line of each of its 15 tasks. Every plan-named TEST FIRST case (56 names) was located in source with `grep -n -F`, and the six feature test files were run in this sweep under the shared tests lock:

`vitest run tracker.test.ts locks.test.ts lib.test.ts catalog-parity.test.ts tracker.integration.test.ts status.test.ts` → `Test Files 6 passed (6)`, `Tests 227 passed (227)`, exit 0 (log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/a0553727-d11a-4a96-8b51-9f5b597b2da3/tasks/bxf54dh2q.output`).

Not re-run in this sweep: the full `bkit:gate:static-unit-integration` (recorded PASS in `run-tests-1.md` and debug Attempt 3 in `debug-summary.md:54`), and a fresh `tsc` compile to compare against `dist/` (the scratch-dir compile was denied by the permission system). `dist/` parity therefore rests on `build-plan-verify-4-1.md:37` and the group 5 commit `631a18e19`, which updated `dist/`.

### Success Criteria

<!-- prettier-ignore -->
| # | Criterion | Status | Evidence |
| --- | --- | --- | --- |
| SC1 | A clean build leaves at most two bkit comments: progress plus completion | Delivered | `tracker.integration.test.ts:687` `keeps clean build progress and completion to two comments` passes; terminal purpose at `workflows.ts:2048`; live `create-edit-read-marker` / `routine-append-external-edit-terminal` records pass for all three providers in `spike/tracker-contract-evidence.json` |
| SC2 | Decision, failure, handover and close / Create PR each attempt a separate new comment; exact retries dedupe | Delivered | `purpose: "attention"` on failure (`workflows.ts:467`) and handover (`workflows.ts:933`); `build-decision` → attention (`steps.ts:1424`); attention / terminal seal the segment (`tracker.ts:1707`); tests `tracker.test.ts:527` `classifies attention and terminal reports from structured purpose`, `:500` `deduplicates known reports...`, `:768` `attempts independent attention after routine uncertainty` pass |
| SC3 | Before an edit, the target must be the newest created comment with matching revision evidence; otherwise a new comment | Delivered | `tracker.test.ts:1411` `selects newest created comment across complete pages`, `:1303` `rejects marker preserving external edits`, `:543` `rolls over after intervening comments external edits and deletion`, `:624` `preserves a human correction after lost append recognition and a later report` pass |
| SC4 | Known reports dedupe; failed / uncertain appends fall back to a new comment; exhausted failures log friction and the workflow continues | Delivered | `tracker.test.ts:600`, `:613`, `:646`, `:400`, `:428` pass; `tracker.integration.test.ts:649` `preserves substantive step results under every comment boundary fault` passes; live `lost-response-*` records pass on GitHub, Linear and Jira |
| SC5 | Verified per-provider budgets, original UTC times, separate auto / phase state, nonfatal diagnostics | Delivered | Budgets `github: 65_536`, `linear: 100_000`, `jira: JIRA_COMMENT_LIMIT` (`tracker.ts:41-43`, `:31` = 32_767), backed by live `counting` records; `tracker.test.ts:899` `refuses aggregation with an unverified provider budget`, `:1763` `reuses original section time...`; `tracker.integration.test.ts:592` `keeps auto and phase progress separate across worktrees`, `:350` `keeps auto startup with PR metadata and dispatch in one progress comment` pass |

### Runbook tasks (`DONE WHEN`)

<!-- prettier-ignore -->
| Task | Status | Evidence |
| --- | --- | --- |
| 1 Provider inspection and mutation contracts | Delivered | Six named tests at `tracker.test.ts:1378, 1411, 1160, 1303, 1223, 1263` pass; live schema records `linear-schema`, `jira-schemas` present |
| 2 Rendering, budgets, splitting | Delivered | Five named tests at `tracker.test.ts:907, 921, 1339, 1763, 899` pass |
| 3 Exact-source cache and receipts | Delivered | Six named tests at `tracker.test.ts:1793, 1810, 1825, 1842, 1891, 1916` pass; `status.ts` is READ-only per the task and is unchanged, as planned |
| 4 Publication lock | Delivered | Four named tests at `locks.test.ts:97, 115, 135, 165` pass; `locks.ts` changed in the diff |
| 5 Central classification and safe append | Delivered | Eight named tests at `tracker.test.ts:487, 500, 517, 527, 543, 560, 577, 588` pass |
| 6 Bounded fallback and nonfatal boundary | Delivered | Nine named tests at `tracker.test.ts:600, 613, 646, 663, 684, 692, 748, 768, 785` plus `lib.test.ts:701` `bounds a slow child with an optional deadline and classifies timeout` pass; `lib.ts` changed |
| 7 Invocation lifecycle wiring | Delivered | Eight named integration tests at `tracker.integration.test.ts:561, 575, 592, 609, 632, 649, 687, 716` pass; `lib.ts`, `repo.ts`, `issues.ts`, `steps.ts`, `workflows.ts`, `worktrees.ts` changed |
| 8 Best-effort friction | Delivered | Four named tests at `tracker.test.ts:400, 428, 453, 473` pass |
| 9 Workflow, fallback and docs sync | Delivered | Three named tests at `catalog-parity.test.ts:136, 161, 178` pass; all six `.bkit/core/workflows/bkit-*.md`, `.bkit/instructions.md`, `.bkit/core/.bkit/{trackers,workflows,cli}.md` changed; doc sections `docs/architecture.md:29` § Tracker reporting boundary, `docs/testing.md:793` § Routine tracker reporting coverage, `docs/observability.md:28` § Tracker reporting diagnostics, `docs/security.md:64` § Workflow comment ownership exist |
| 10 Live provider contract and lost-response probes | Delivered | `spike/tracker-contract.ts` and `spike/tracker-contract-evidence.json` (79 records: `create-edit-read-marker`, `creation-order-pagination`, `routine-append-external-edit-terminal`, `continuation`, `lost-response-recognized`, `lost-response-new-fallback`, `lost-response-exhausted-continued` for each provider; all 18 pass-bearing records `pass: true`, 6 per provider); limitations disclosed in the file |
| 11 Built CLI and footprint verification | Delivered | `build-plan-verify-4-1.md:37-39` records the build, drift checks and fresh-consumer `dist/cli.js` dogfood (two clean-run comments, cache, receipts, exact fallback, friction rows, nine injected faults); `run-tests-1.md` gate PASS |
| 12 Slow-child fixture repair | Delivered | `tracker.test.ts:692` `reserves new comment opportunity within total delivery budget` passes; `build-plan-verify-3-5.md` confirms original assertions and both 200 ms budgets retained; the flake row `tracker-new-comment-budget-shell-observation-flake` in `docs/failures.jsonl` is folded `CLOSED` |
| 13 Human correction survives lost-append recognition | Delivered | `tracker.test.ts:624` passes; `build-challenge-1.md:20,28` re-ran the original reproduction: `correctionAfterNextReport: true` |
| 14 Auto startup with PR metadata stays routine | Delivered | `tracker.integration.test.ts:350` passes; `build-challenge-1.md:22,28` re-ran the reproduction: one marked progress comment, create/read/edit/read |
| 15 Jira credential redacted in probe diagnostics | Delivered | `tracker.integration.test.ts:411` `redacts malformed Jira authorization from live probe diagnostics` passes |

## Blocking Deferrals

None. No intended deliverable is absent, a stub or wrong in observed behaviour; no guard was weakened; no shipped surface was found to fail at runtime; the disabled-test scan completed with no hits.

## Test Coverage Review

None. `bkit branches scan-diff --disabled-tests --base=origin/dev` exited 0 with `found: false`, `paths: []`, `disabled: []` over a 252-file diff.

Manual cross-check (not scanner hits, recorded for the reader): `git diff origin/dev...HEAD -- '*.test.ts'` adds no `.skip` / `.todo` / `.only` / `xit` marker. Three `-` lines carrying `expect(` are rewritten assertions, not removals:

- `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts:168`: `expect(retained).toMatch(/`tracker`[^\n]*`CLOSE_TRACKER`/)` becomes `expect(body).toMatch(/Hold this report's `commentFile`[^\n]*`tracker`[^\n]*`CLOSE_TRACKER`/)`, plus two new assertions that `close.block` no longer carries `--post` and that the Create PR `issues comment` posts `{CLOSE_COMMENT_FILE}`. This follows the close comment moving to a separate terminal post.
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:253`: the `openDecision` resume assertion is kept, with the expected text updated to include `--session-dir="{SESSION_DIR}"`.
- `.bkit/core/engine/commands/workflow/tracker.test.ts` (Jira split-comment dedup case): `expect(calls).toHaveLength(4)` becomes `toHaveLength(3)` after the call shape changed; the `deduped: true` assertion stays.

## Exempt Deferrals

Plan file: `docs/plans/202611/826-append-routine-workflow-plan.md` (last committed 2026-11-05T23:07:20Z). Its `## Out of Scope` (line 157) reads "None", and `docs/deferrals.jsonl` holds no row for this FID (`bkit ledgers triage --fid=826-append-routine-workflow --plan=...` returned `total: 0`, `written: 0`). The items below are declared non-goals, accepted limitations or advisory process conditions. None of them blocks the merge.

1. **Manual "Tracker work comments" rule stays one comment per major turn.** Declared in the issue's "Constraints and non-goals" (`ship-input-1.md:43`) before work started, and restated in the plan's Out of Scope (`plan.md:159`: "manual work comments keep their existing behavior"). Leaves uncovered: consolidating hand-posted comments outside workflows. Reason: `scope-declared`. Exempt.
2. **The agent's MCP fallback still posts a new comment; agents never edit tracker comments.** Declared in the issue's constraints (`ship-input-1.md:42`) and decisions (`:48`), and in the plan's Out of Scope (`plan.md:159`). Leaves uncovered: consolidation when the engine prints `tracker.done: false` and the agent posts `commentFile` itself. Reason: `scope-declared`. Exempt.
3. **Edit notifications are not guaranteed silent (Jira's "Comment Edited" event, provider settings).** Declared in the plan's Pre-Flight `Notifications` line (`plan.md:192`) and the design's Trade-offs Accepted (`design.md:231`); the evidence file `spike/tracker-contract-evidence.json` `limitations` records "Provider notification delivery settings were not measured; no silence guarantee." Leaves uncovered: notification silence on edit. Reason: accepted limitation, `scope-declared`. Exempt.
4. **Final-preflight race and occasional missing or duplicate reports are accepted.** Declared in the plan's Acceptance Scenario (`plan.md:38`), Open Questions (`plan.md:141-142`) and the design's Trade-offs Accepted (`design.md:227-230`), all owner-confirmed before build. Leaves uncovered: atomic provider ordering and exactly-once delivery. Reason: owner decision, `scope-declared`. Exempt.
5. **Live probe pagination used small page windows, not a large-history stress test.** Recorded in `spike/tracker-contract-evidence.json` `limitations` and `build-plan-verify-4-1.md:31`. Leaves uncovered: behaviour on issues with hundreds of comments against real providers (unit tests cover the 10-page bound). Reason: verification-scope limitation within the plan's `Verification prerequisite` (`plan.md:143`). Exempt.
6. **Unticked plan gates and process checkboxes are advisory.** `Pre-Flight / Conditional` `Secrets & Env Vars` and `Provider Contract Discovery` (`plan.md:187-188`), `Gate 1 — Verified` (`:202`), Gate 2 / Gate 3 / Gate 4 boxes (`:638-672`), the `Verification Plan` boxes (`:661-667`) and the owner-run `Manual Verification` steps (`:679-683`, marked "advisory only") are build-process steps and merge conditions, not deliverables. The work they describe is evidenced elsewhere: provider discovery and credentials by the 79-record `spike/tracker-contract-evidence.json` (all 18 pass-bearing GitHub / Linear / Jira records `pass: true`), and the gates by `run-tests-1.md` and `build-tests-green-final.md`. Exempt (advisory).
7. **`DONE WHEN` process clauses are advisory.** Task 1's "Actual request/response schemas are verified before tests/code use them" (`plan.md:373`) and Task 12's "The tests step owns the authorized fixture repair; the code step reviews the resulting evidence" (`plan.md:562`) are build-order conditions, not deliverables. Exempt (advisory).

## Lazy Deferrals

None. No intended deliverable stayed `Planned`, and `bkit ledgers triage` found no plan-related deferral row for this FID, so no `unjustified` row was written.

## Handover Notes

None.
