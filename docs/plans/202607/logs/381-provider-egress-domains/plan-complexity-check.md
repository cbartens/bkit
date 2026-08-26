Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Tasks:** 34 (`Task 1` … `Task 34`), across 6 phases: Phase 0 (blocking proof obligation, 1 task), Phase 1/WS-1 (3 tasks), Phase 2/WS-2 (5 tasks), Phase 3a/WS-3 (5 tasks), Phase 3b/WS-4 (4 tasks), Phase 3c/WS-5 (7 tasks), Phase 4/WS-6 (4 tasks), Phase 5/WS-7 (5 tasks).
- **Gates:** 3 (`Gate 2: Code Implementation Check` with 8 sub-checks, `Gate 3: Testing & Documentation Check`, plus the two Acceptance/Breaking-Changes/Open-Questions human-confirmation gates already closed upstream of the runbook).
- **Test matrix:** 17 rows (T1–T17), spanning 6 target files, 2 of which are new (`bkit-cloud-env.integration.test.ts`, and a new `describe` block in `bkit-guardrails-cursor.integration.test.ts`).
- **Domain areas / encoding surfaces touched:** 5 — Claude `WebFetch`/`settings.json`, Cursor hook (`guardrails.cjs`) + `.cursor/allowlist.json`, OpenCode `permission.bash`, two cloud-paste doc renderers (`cloud.md` x2) — plus a new registry leaf (`bkit-registry.ts`), a `.bkit/version` schema change threaded through 3 writers, and doc updates across 9+ files (`.agents/config.md` x2 copies, `docs/observability.md`, `.bkit/providers.md`, `.bkit/workflows.md`, `.bkit/README.md`, `.bkit/workflows/bkit-debug.md`, `.bkit/cloud.md`).

## Session Fit Estimate

Task count alone (34 > 12) already forces `SPLIT` under the stated mapping, independent of the token estimate. On tokens: this plan is unusually dense per task — most `Task N` entries carry multi-paragraph rationale, exact pre/post line-number caveats (with an explicit warning that every `bkit-modules.ts` anchor past `:1461` shifts ~57 lines after Task 3 and must be resolved by symbol, not line), enumerated live-grep match sets that must each be driven to zero and re-verified as the match set changes across later tasks, and `Done when` clauses requiring commands to be run twice (once to observe a red/false state, once to restore green). Reading the plan itself costs ~85K tokens; executing it costs materially more than reading it, since each task requires editing, running targeted test files, and iterating on failures before checking the box — not just transcribing the plan.

Direct evidence from this same workflow cycle: two subagents already exhausted their 50-turn caps mid-task on this exact material, and one agent burned roughly half its budget re-verifying citations after the parent design drifted (the plan's own "Ground-truth correction" and "CORRECTED 2026-08-26" annotations throughout are the residue of that drift). The build phase runs under the same `@bkit-build-plan-execute` caps. A single session attempting all 34 tasks would need to: execute Phase 0's blocking proof (a real `pnpm build` + spawned install + read-back, with a 5-step conditional rollback path if it fails), then conditionally re-scope WS-5, then execute two more independent workstreams (WS-3, WS-4) with their own doc sweeps, then WS-5's signature-breaking change with a 2-part recording contract, then a cross-surface fan-out proof (WS-6) that depends on all three prior workstreams having landed, then release integration (WS-7) with a full local gate run (`pnpm bkit:gate:static-unit`, full `vitest run`, `pnpm bkit check`) that must be green with zero skips/exemptions. That is well past 85K tokens of estimated agent work — likely 3-5x the threshold given the observed per-task turn cost.

## Rationale

**Verdict = SPLIT.** 34 tasks (>12) and an estimated token cost far above 85K, corroborated by two subagents already hitting their turn caps on this exact plan's material this cycle.

**Seams — the plan's own phase boundaries, with one adjustment:**

1. **Sub-plan A — Phase 0 + WS-1 + WS-2 (Tasks 1–9).** The blocking proof obligation (Task 1) must run first and its outcome (pass vs. the 5-step STOP path) determines whether WS-5 later runs at full scope or degraded scope — this has to be its own session/checkpoint so the STOP-path re-scoping decision is made once, cleanly, before any of WS-3/4/5 starts. WS-1 (registry leaf) and WS-2 (derivation + gate + exports) are the dependency root every later workstream needs; bundling them with Phase 0 keeps "did the foundation land, and in what shape" as one deliverable.

2. **Sub-plan B — WS-3 (Tasks 10–14).** Cloud paste surfaces. Self-contained after WS-2, but Task 14 alone touches 9 files with multiple exact-line anchors per file and a mandatory `--hidden --glob` sweep with an enumerated live-match set — dense enough to be its own session.

3. **Sub-plan C — WS-4 (Tasks 15–18).** Cursor hook. Smallest workstream (4 tasks); only independently sized if run alone — otherwise merge into B or D if a build agent's session has headroom left after finishing its primary workstream. Kept separate here because WS-3/4/5 are explicitly parallel-viable in the design's own dependency graph and merging it into a denser workstream risks recreating the turn-cap overrun already observed.

4. **Sub-plan D — WS-5 (Tasks 19–25).** Claude `WebFetch` provenance and prune. The signature-breaking change (`enrichClaudeSettingsWebFetch`), the 2-writer threading (install + upgrade paths), and the two named pre-existing test cases that must survive unmodified (`bkit-uninstall.test.ts`) make this the most failure-prone workstream per the plan's own text ("the v1 draft's assumption... was wrong" appears here). Warrants its own session regardless of Phase 0's outcome (degraded or full scope).

5. **Sub-plan E — WS-6 + WS-7 (Tasks 26–34).** Cross-surface fan-out proof, release integration, mirror regeneration, ledger verification, and the full local gate run. This cannot start until B, C, and D have all landed (`Phase 4 — WS-6 ... requires: WS-3, WS-4, WS-5`), so it is naturally the final sub-plan, and its own density (five-surface fan-out test, symbol-resolution byte-identity proofs, a two-part Success-Criterion-1 verification split across encodings, and a from-scratch full gate run with zero tolerance for new skips/exemptions) is enough to fill a session on its own.

Each of the five sub-plans above should independently fit under 85K tokens and 12 tasks; A and E are the densest and should be watched most closely if further splitting proves necessary.
