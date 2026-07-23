Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 15 (`Task 1` through `Task 15`), grouped into 6 work streams (WS-1 Foundation, WS-2 Mechanical status tier, WS-3 Analysis tier, WS-4 Cadence + reverse sync + reconcile, WS-5 On-demand utility, WS-6 Cross-provider + docs).
- **🔒 Gates:** 4 (Gate 1 Prerequisites, Gate 2 Code Implementation, Gate 3 Testing & Documentation, Gate 4 Automated Verification) plus 4 Manual Verification steps.
- **Domain areas covered:** this is the bkit tool repo itself (no app stack), but the plan spans an unusually wide internal surface for one session:
  - Telemetry codec (`bkit-telemetry.ts` — new `kind`, union, validate)
  - New sourced shell helper (`bkit-roadmap-fold.sh`, composed with `bkit-status-fold.sh`)
  - New one-time backfill script + `bkit upgrade` wiring
  - Five edited `.bkit/workflows/*.md` orchestrator files (`bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`), each with distinct staging-shape edits (four distinct staging shapes total)
  - New opus leaf prompt (`bkit-roadmap-refresh.md`)
  - New utility workflow (`bkit-roadmap.md` / `/bkit-roadmap`)
  - Cadence, reverse tracker-label sync, and reconcile/recovery logic
  - Cross-provider mirror regen (`.claude/`, `.cursor/`, `.opencode/`) + `.bkit/version` hash refresh
  - 6 documentation files (`observability.md`, `decisions.jsonl`, `knowledge.jsonl`, `testing.md`, `.agents/docs.md`, `.bkit/jsonl.md`) plus `.gitattributes`
  - 22-row Derived Test Matrix spanning Unit, Integration (5 distinct real-boundary suites: fs, git worktree, git branches, workflow-file content x2), and Shell/bats tiers

## Session Fit Estimate

Task count (15) already exceeds the SPLIT threshold (>12) on its own. Independently, the token estimate also clears the >85K threshold:

- Reading + re-reading the plan itself (565 lines, dense) across task execution: ~15–20K tokens of repeated context alone.
- 15 tasks each requiring: reading target files (workflow `.md` files are large, several hundred lines each, x5), editing, writing/updating a dedicated test file (11 new `*.test.ts`/`*.integration.test.ts` files + 2 new `*.bats` files + 1 extended `*.bats` file), and re-verification — each task realistically costs 4–8K tokens of tool output + reasoning even for simple ones; several (Task 3 fold script, Task 6/7 close-hook edits with tracker enrichment, Task 11 reverse sync, Task 12 reconcile) are individually complex enough to be 8–15K tokens alone.
- Cross-cutting mirror regen (Task 15) touches three host directories and must be run once at the end, but verification (`bkit check`, `bkit install`, hash diffing) across that surface is itself several K tokens.
- Manual Verification requires two real end-to-end workflow closes (Step 2, Step 4) plus a scratch-consumer install/upgrade round-trip (Step 1) and a cadence/reconcile fixture run (Step 3) — these are expensive, stateful, multi-tool-call verifications that do not compress well.
- Conservative total: well above 150K tokens for full runbook completion in one continuous session — roughly 2x the SPLIT threshold.

## Rationale

`SPLIT` on both independent criteria (15 tasks > 12; estimated tokens far exceed 85K). The plan's own "Ordering" note (schema/foundation → mechanical → analysis → cadence → utility → mirror-regen) already describes a natural dependency-respecting sequence that maps cleanly onto its WS-1..WS-6 headers, so splitting does not require inventing new boundaries — it should follow the plan's existing work-stream seams. Proposed groupings, each sized to fit one session:

1. **Sub-plan A — Foundation + Mechanical tier (Tasks 1–7, WS-1 + WS-2).** Telemetry codec, backfill script + rollout trigger, `bkit-roadmap-fold.sh`, doc-index/`.gitattributes` entries, ship-verdict reader migration, and the four workflow close-hook edits (design/plan/build/debug) including the dev-lock 4th staging shape. This is the load-bearing foundation everything else reads from; 7 tasks, ~10 new/edited test files. Largest single group but still under the task-count ceiling and is the natural "must land first" unit (nothing in B or C can be meaningfully tested without it).
2. **Sub-plan B — Analysis + Cadence/Sync/Reconcile (Tasks 8–12, WS-3 + WS-4).** New `@bkit-roadmap-refresh` leaf, ship Step 10 wiring, cadence + audit/ledger injection, reverse tracker sync, reconcile/recovery pass. 5 tasks, depends on Sub-plan A's fold + frontier snapshot being in place. Each task here has its own real-boundary integration test (git branches, workflow files) — keeping this as its own session avoids compounding context with the foundation work.
3. **Sub-plan C — Utility + Cross-provider/docs (Tasks 13–15, WS-5 + WS-6).** `/bkit-roadmap` utility workflow, deferral closure + observability/ledger doc rows, mirror regen + hash refresh. 3 tasks, but includes the mandatory Testing & Documentation checklist (Gate 3) and the full Verification Plan (Gates 4, Manual Verification Steps 1–4) which are expensive and best run once at the very end against the fully-merged foundation + analysis work, not mid-flight.

Each sub-plan should carry forward the shared Acceptance Scenario / Breaking Changes / Open Questions sections unchanged (already human-confirmed once) and only re-scope its own Runbook + Derived Test Matrix rows + Gates, per the existing row→task mapping table in the plan (lines ~152, ~515).
