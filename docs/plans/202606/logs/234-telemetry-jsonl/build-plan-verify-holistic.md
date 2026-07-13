<!-- verdict:start -->

Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic (master plan + all 5 sub-plans). Partial diff coverage: Large Diff Guard active (265K+ line diff dominated by skills noise); verification scoped to feature files + cross-workstream integration edges, not the full diff.

## Sub-Plans Verified

5 (matches the 5 sub-plan files: 234-telemetry-jsonl-plan-1..5.md).

## Integration Gaps

0 blocking. All 8 cross-workstream edges verified against the codebase:

1. WS-1->WS-2 (comply writes kind:"compliance" via codec): PASS. `bkit-install.ts:1486` comply dispatch resolves parentSha from `.bkit/stats.jsonl`, calls `runGrader`/`buildComplianceRows`/`appendComplianceRows`; `bkit-comply.ts` imports `SCHEMA_VERSION`/`TelemetryEnvelope`/`CompliancePayload` from `bkit-telemetry.js`, emits one `kind:"compliance"` row per rule with `graderVersion`+`bkitVersion`. Verified live in prior attempt (2 rows, exit 0).
2. WS-1->WS-3 (counter-bus emits kind:"counter" via codec; routing via shell bus): PASS. All 5 workflows emit `kind="counter"` rows via the codec jq idiom (`now*1000|floor`, A2 envelope, `counterSource`); `scripts/tooling/counter-bus.sh` provides `check_max`/`decide_next` routing sourced in build/debug/ship.
3. WS-2->WS-4 (analysis reads kind:"compliance" for per-rule rate): PASS. `bkit-analysis.ts:337` filters `ev.kind === "compliance"`, `computeComplianceRates`/`computeVersionCompliance` produce per-rule + per-bkitVersion rates.
4. WS-4 ship-chain rollup writes kind:"run-outcome" with full envelope: PASS. Exactly one `kind:"run-outcome"` writer (`bkit-ship.md:1023`) emits lines_added/lines_deleted/lines_changed/files_changed/task_count/duration_seconds/deferrals/failures + prNumber + A2 envelope; ship summary (ship.md:785-799) folds the full design->ship chain.
5. CLI namespace consistency: PASS. All 4 verbs (comply/harvest/analysis/telemetry) in the `bkit-cli.ts` Verb union + parsed; all 4 dispatched in both `bkit-install.ts` and compiled `dist/bkit-install.js`.
6. Telemetry summary read blocks in all 5 workflows: PASS. Each of design/plan/build/debug/ship carries a `[bkit-telemetry]` summary read with `MAX_ROWS_BEFORE_ROLLUP` (5000) growth warning + malformed/excluded-version counts.
7. No legacy ledger live refs: PASS. `.bkit/friction.md` and `docs/pending.md` deleted; no live read/write in workflows/prompts/.agents/templates (only descriptive "replaces docs/pending.md" prose in docs.md).
8. WS5-T4 deferral documented: PASS. `docs/deferrals.jsonl` carries a `kind:"deferral"` row (id WS5-T4, issue #234) recording the deferred destructive dogfood migration pending human approval.

## Previously Attempted

Per-WS verifications: WS-1 PASS (verify-1-1), WS-2 PASS attempt 2 (verify-2-2, after GAP-1/GAP-2 remediated by gaps-remediate-2-1), WS-3 CONCERNS (verify-3-1, tautological invariant test — non-blocking), WS-4 PASS (verify-4-1), WS-5 PASS (verify-5-1, WS5-T4 expected-deferred). This holistic verification is attempt 1.

## Notes

Holistic verification of the unified `.jsonl` telemetry system (#234) across the master index + 5 sub-plans. All cross-workstream integration edges are real and wired; the feature works end-to-end.

Feature-test evidence (run in isolation): all 14 telemetry feature suites GREEN — 390/390 tests pass (bkit-telemetry, gitattributes-integration, workflow-writers, comply unit/integration/gate-wiring, paths-policy, cli, counter-prose-audit, telemetry-invariant, harvest unit/integration, analysis, telemetry-migrate-integration). `pnpm typecheck` exit 0. `dist/` byte-clean (no uncommitted changes); all 6 new dist modules present. `utility-harvest-friction` agent deleted from both `.claude/agents/` and `.cursor/agents/` with zero live invocations (WS4-T5).

Checkbox-state audit vs codebase: plan-1 (WS-1) fully ticked + verified PASS. plan-2 (WS-2) fully ticked; GAP-1 (comply not dispatched) + GAP-2 (paths-policy ESM guard) were remediated (gaps-remediate-2-1) and re-verified live. plan-3 (WS-3) runbook tasks WS3-T1..T4 + Gate 2 ticked; Pre-Flight/Gate 1/Gate 3/Gate 4/Manual sections remain `[ ]` (process/human gates, not deliverables). plan-4 (WS-4) tasks + Gates 2/3/4 ticked; Manual Step 4 left `[ ]` (human dogfood). plan-5 (WS-5) WS5-T1/T0/T2/T2b/T3 ticked; WS5-T4 deliberately DEFERRED (human-approval destructive migration) with Gate 2 + downstream gates `[ ]`.

Full-suite run: 1902 passed / 13 failed / 6 skipped / 1 todo (1922 total, 55 files). The 13 failures are confined to 5 NON-telemetry infrastructure suites — bkit-check-opencode.integration, bkit-install.integration, bkit-upgrade.integration, bkit-release-workflow, bkit-slop-type-suppression.integration. All are subprocess/timeout flakiness under full-suite load (5s test / 10s hook timeouts on `tsx`/`npm pack`/node-script spawns), NOT telemetry-feature defects: e.g. bkit-release-workflow's `beforeAll` running `npm pack --dry-run` timed out at 10s while its 28 assertions passed. These touch install/upgrade/opencode/release/slop surfaces untouched by this feature.

Verdict CONCERNS (not FAIL): no blocking integration gap and no missing deliverable. Two non-blocking carryovers: (a) the WS3-T4 invariant test is tautological (planVerifyStepCount := verifyAttemptCount, verify-3-1 CONCERN) — discriminating power weak though the artefact exists + passes; (b) emitted counter close-step rows stamp `counterSource:"model-self-report"` while the codec/analysis/invariant tests fully support `"shell-bus"` — the shell-bus routing lives in fenced shell (decide_next/check_max) per WS3-T3, but no workflow close-step writer emits a `"shell-bus"` counter row, so the structural trust-tier distinction the design intended for post-P3 counters is not yet exercised by the live writers. Minor data note: the WS5-T4 deferral row lacks the A2-mandatory `repo`/`bkitVersion`/`schemaVersion`/`step` envelope (count-only deferral; non-blocking). Recommend gap-remediate for (a) and confirming/strengthening (b).

## Identified Gaps Log

3 (all non-blocking / CONCERN-level):

CONCERN-1 — WS3-T4 invariant test tautological (carryover from verify-3-1): `checkVerifyAttemptInvariant()` sets planVerifyStepCount = verifyAttemptCount, so the `counters.verifyAttempt == count of plan-verify rows` assertion is structurally vacuous (always passes). Artefact exists + passes; discriminating power weak. Addressable by gap-remediate: derive planVerifyStepCount independently from plan-verify step-done rows in the fixture.
CONCERN-2 — counterSource trust-tier not emitted as "shell-bus" by any live writer: all 5 workflow close-step counter writers stamp `counterSource:"model-self-report"`; the post-P3 `"shell-bus"` tier (supported by codec + analysis + invariant tests) is never written by the live workflows, so the structural model-self-report vs shell-bus distinction is unexercised end-to-end. Non-blocking (routing is in fenced shell per WS3-T3, prose-audit GREEN). Addressable by gap-remediate.
NOTE-3 (data quality, non-blocking) — the WS5-T4 `kind:"deferral"` row in `docs/deferrals.jsonl` omits the A2-mandatory envelope fields (`repo`/`bkitVersion`/`schemaVersion`/`step`) that WS-1's codec `validate` requires; the row would not pass `validate`. Hand-written count-only deferral; does not block any edge.
