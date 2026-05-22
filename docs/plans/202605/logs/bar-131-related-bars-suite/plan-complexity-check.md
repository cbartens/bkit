Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

- **Total runbook tasks:** 46 (P0: 2, P1: 9, P2: 13, P3: 13, P4: 9)
- **Gates (phase + cross-plan):** 7 (4 phase gates + Gates 2/3/4)
- **Major-Changes items requiring human approval:** 4
  - `__bkit__` JSON namespace as public contract (ships v0.8.0)
  - Tier-1 to Tier-2 reclass for `.claude/settings.json` and `.cursor/hooks.json`
  - `process.exit(1)` on Phase 3 blockers (ships v0.7.x)
  - `.bkitignore` new public file schema
- **Version bumps:** 4 (v0.6.x, v0.7.x, v0.8.x, v0.9.x/v1.0)
- **Domain areas:** CLI tooling, JSON deep-merge, test infrastructure, GitHub Actions composite action — all within one TypeScript CLI codebase; no API/DB/web-UI/mobile surface

## Session Fit Estimate

- 46 tasks at average M effort = approximately 46 x 3,000–5,000 tokens per task (read existing code, implement, write tests, verify) = 138K–230K tokens before any rework.
- 5 L-effort tasks (P2.T5, P2.T8a, P2.T11, P3.T6, P4.T5) each carry higher token cost individually (8K–15K range for full implementation + tests).
- 4 human approval gates — each is a hard stop where the session must halt and hand off; these are structural session boundaries, not just checkpoints.
- Phase 3 JSON deep-merge (P3.T0–P3.T6) is the highest-risk piece: requires a Cursor schema spike (P3.T0), a contract spec doc (P3.T1a), then six concrete implementation tasks each touching `bkit-tiers.ts` with interdependencies — alone exceeds the SINGLE threshold for a focused session.
- Total estimated tokens: 160K–250K, well above the 100K threshold even under optimistic compression.

## Rationale

The plan contains 46 tasks spanning four independently shippable phases (Phase 4 excluded — it is explicitly not independently shippable), four separate semver minor bumps, and four Major-Changes items each requiring human approval before its phase can merge. Human approval gates are hard session boundaries: an execution agent cannot proceed past them without a human round-trip, meaning each phase naturally constitutes its own execution unit.

The JSON deep-merge work in Phase 3 alone (13 tasks, one L + five M + two S + spike-gated contract spec) would consume the majority of a single session's useful token budget on non-trivial TypeScript transformation logic and fixture authoring. Combined with Phase 2 (13 tasks including three L-effort items — `runUninstall` orchestrator, surgical integration fixture, and `.bkitignore` parser) and Phase 4 (adds `bkit upgrade`, transactional staging, and GitHub Actions composite action), a single session would produce shallow, error-prone implementations. The plan is therefore SPLIT.

## Suggested partition (if SPLIT)

<!-- prettier-ignore -->
| Sub-plan | Phases | Rationale |
| --- | --- | --- |
| **sub-plan-1** | P0 + P1 (v0.6.x) | 11 tasks, all S/M, one integration test, no Major-Changes approval needed at merge time; independently shippable; provides `bkit doctor` verb and polish fixes used by P2.T11 |
| **sub-plan-2** | P2 (v0.7.x) | 13 tasks including 3 L items; Major-Changes items: exit-1 + `.bkitignore`; independently shippable after P1 merges; human approval gate before PR opens |
| **sub-plan-3** | P3 (v0.8.x) | 13 tasks; Major-Changes items: `__bkit__` namespace + Tier-1/Tier-2 reclass; highest-risk phase (JSON merge complexity + Cursor schema spike); human approval gate before PR opens; independently shippable after P2 |
| **sub-plan-4** | P4 (v0.9.x → v1.0) | 9 tasks; NOT independently shippable — must follow P3 (P4.T1 → P3.T3) and P2 (P4.T4 → P2.T3); human approval gate before PR opens; includes helper action + v1 tag sub-step |

## Detailed reasoning

- **Task count:** 46 runbook tasks + 7 gate checkpoints
- **Effort total:** ~20 S + ~21 M + 5 L tasks; rough weighted sum ~110 M-equivalent units
- **Major-Changes items:** 4
  1. `__bkit__` JSON namespace public contract (v0.8.0, Phase 3)
  2. Tier-1 to Tier-2 reclass for `.claude/settings.json` and `.cursor/hooks.json` (v0.8.0, Phase 3)
  3. `process.exit(1)` on Phase 3 blockers (v0.7.x, Phase 2)
  4. `.bkitignore` new public schema (v0.7.x, Phase 2)
- **Independently shippable units:** Phase 0+1 (v0.6.x), Phase 2 (v0.7.x), Phase 3 (v0.8.x); Phase 4 is NOT independently shippable
- **Cross-phase blockers:**
  - P2.T11 depends on P1.T1 (`bkit doctor` verb)
  - P4.T1 depends on P3.T3 (`writeTier2Json` staging path)
  - P4.T4 depends on P2.T3 (`.bkit-version` schema)
  - P4.T7 depends on P2.T8a (heavy-customised-consumer fixture)
  - P3.T9 depends on P2.T8a (same fixture)
