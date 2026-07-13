# Plan Verification

## Scope

Single (sub-plan 2 — WS-2 Compliance grader). Partial diff coverage: verified against FEATURE files only (Large Diff Guard active, >10K-line diff); cross-domain/integration diff not exhaustively reviewed.

## Sub-Plans Verified

None (Single scope — one sub-plan: 234-telemetry-jsonl-plan-2.md).

## Integration Gaps

None (Single scope — no cross-sub-plan integration assessed).

## Previously Attempted

None (attempt 1).

## Notes

Most WS-2 deliverables are real and well-built. Verified live:

- All 6 feature source/test files + the committed `gate-paths.generated.cjs` exist.
- 207 Vitest tests pass across the 5 WS-2 suites (comply unit/integration/gate-wiring, paths-policy drift, cli).
- `tsc --noEmit` clean; `pnpm check:dist` clean (dist/ committed + in parity).
- Drift test genuinely compares the committed `.cjs` to `generateGatePathsCjs()` output (exact `toBe`) — WS2-T2 Done-when satisfied.
- DE-34 (WS2-T1) recorded with rationale, covering all three downstream verb sets (comply / harvest+analysis / telemetry migrate) and the shared-entrypoint + try/catch isolation contract.
- DE-35 ship-only rollout decision recorded.
- Fail-open shell idiom verified exit 0 directly (`false || echo ...`).
- docs/architecture.md, docs/observability.md, docs/testing.md all updated with `[bkit-comply]` surface.

BLOCKING GAP found at the runtime-dispatch / end-to-end layer:

GAP-1 (blocking): `pnpm bkit comply --phase ship` does NOT run the grader. The `bkit` bin is `dist/bkit-install.js` (DE-34: shared entrypoint). `bkit-install.ts` parses the `comply` verb (`Verb` union, `--phase`) but has ZERO `comply` references after parsing — the `parseArgs` destructure at lines 1455-1463 does not even extract `complyPhase`, and there is no `if (verb === "comply")` dispatch branch. Confirmed live: `node dist/bkit-install.js comply --phase=ship` falls through every special-case and executes the full INSTALL routine (file-mutating, exit 0). Consequences:

- No `kind:"compliance"` row is ever appended to `.bkit/stats.jsonl`.
- No violations are surfaced in `ship-summary.md`.
- The ship close gate (bkit-ship.md Step 13) runs an unintended INSTALL instead of the advisory grader; the `|| echo` fail-open does not catch it because install exits 0.

This breaks the Acceptance Concrete Example, master Success Criterion #2, WS2-T6 observable behavior, and makes Manual Verification Step 2 unsatisfiable (it is checked `[x]` but cannot pass — no compliance row, no summary surfacing). The grader logic (`runGrader`/`buildComplianceRows`/`appendComplianceRows`/`formatComplianceSummary`) is fully implemented and tested in isolation but is never wired to the CLI dispatch, so the feature does not function end-to-end.

NOTE (non-blocking, fold into GAP-1 fix): the `bkit-paths-policy.ts` generator CLI guard uses CommonJS `require.main === module`, but the compiled `dist/bkit-paths-policy.js` is ESM, so `node dist/bkit-paths-policy.js` prints nothing. The Vitest drift test imports `generateGatePathsCjs()` directly so coverage is intact; only the standalone dev-only generator CLI is dead.

## Identified Gaps Log

1. GAP-1 (blocking) — `pnpm bkit comply` is parsed but never dispatched in `bkit-install.ts` (the `bkit` bin); the wired command runs INSTALL, not the grader. No compliance row written, no ship-summary surfacing. Breaks Success Criterion #2 / Acceptance Example / WS2-T6 / Manual Step 2.
2. GAP-2 (non-blocking) — `dist/bkit-paths-policy.js` standalone generator CLI is dead (CommonJS `require.main` guard in ESM output); coverage preserved via direct import in the drift test. Fold into the GAP-1 dispatch fix.

<!-- verdict:start -->

Verdict: FAIL
Failures: 1

<!-- verdict:end -->
