Verdict: PASS

<!-- verdict:end -->

# Parent Plan Index — bar-131-related-bars-suite

> [!CAUTION]
> **CRITICAL:** Do not hallucinate sub-plan execution state.
>
> 1. ALWAYS read each sub-plan natively before executing.
> 2. NEVER trust session summaries or prior context.
> 3. Source of truth is the `[x]` vs `[ ]` checkboxes inside each sub-plan.

## Context & Goals

Resolve consumer-friction debt across `bkit install`/`check`/`uninstall` by phasing four self-contained releases. Master plan (lossless source) is `plan-v3-checked.md`; this index splits the runbook into four sub-plans aligned to phase + version-bump boundaries so each fits the 100K execution-token budget.

**Success Criteria (master):**

- Consumer keys in `.claude/settings.json` / `.cursor/hooks.json` survive bkit upgrades byte-identically.
- `bkit install` failing in Phase 3 exits 1 and surfaces a single-line recovery command using `bkit uninstall`.
- `bkit uninstall` round-trip on a customised consumer leaves consumer files byte-identical to pre-install state.

## Sub-plan map

<!-- prettier-ignore -->
| ID | File | Phase | Linear closes | Shippable | Major-Changes |
| --- | --- | --- | --- | --- | --- |
| 1 | [bar-131-related-bars-suite-plan-1.md](./bar-131-related-bars-suite-plan-1.md) | P0+P1 (v0.6.x) | BAR-142 §A3, B1-B6, A7 | Yes | none |
| 2 | [bar-131-related-bars-suite-plan-2.md](./bar-131-related-bars-suite-plan-2.md) | P2 (v0.7.x) | BAR-139 + BAR-142 §A6 + §A2 | Yes after sub-plan-1 | exit-1, .bkitignore |
| 3 | [bar-131-related-bars-suite-plan-3.md](./bar-131-related-bars-suite-plan-3.md) | P3 (v0.8.x) | BAR-142 §A1 + §B3 | Yes after sub-plan-2 | **bkit**, Tier-1 to Tier-2 reclass |
| 4 | [bar-131-related-bars-suite-plan-4.md](./bar-131-related-bars-suite-plan-4.md) | P4 (v0.9.x to v1.0) | BAR-142 §A4 + §A5 + BAR-131 helper-action | After sub-plan-2 + sub-plan-3 | none |

## Cross-sub-plan dependency graph

- sub-plan-2 -> sub-plan-1 (P2.T11 <- P1.T1 doctor verb)
- sub-plan-3 -> sub-plan-2 (P3.T9 <- P2.T8a heavy-customised-consumer fixture)
- sub-plan-4 -> sub-plan-2 (P4.T4 <- P2.T3 .bkit-version schema; P4.T7 <- P2.T8a fixture)
- sub-plan-4 -> sub-plan-3 (P4.T1 <- P3.T3 writeTier2Json staging path; P4.T5 <- P3.T6 migration)

## Versioning sequence

v0.6.x -> v0.7.x -> v0.8.x -> v0.9.x -> v1.0

## Master plan provenance

- Source: [`plan-v3-checked.md`](./plan-v3-checked.md) (PASS verdict).
- Complexity verdict: [`plan-complexity-check.md`](./plan-complexity-check.md) (SPLIT).
- Each sub-plan is self-contained per `docs/plans/template.md` and lifts tasks verbatim from the master.

## Per-sub-plan task counts (losslessness verification)

<!-- prettier-ignore -->
| Sub-plan | Phase tasks | Phase gate | Cross-cutting gates |
| --- | --- | --- | --- |
| sub-plan-1 | 2 (P0) + 9 (P1) = 11 | 1 (Phase 1) | Gates 1,2,3,4 |
| sub-plan-2 | 13 (P2) | 1 (Phase 2) | Gates 1,2,3,4 |
| sub-plan-3 | 13 (P3) | 1 (Phase 3) | Gates 1,2,3,4 |
| sub-plan-4 | 9 (P4) | 1 (Phase 4) | Gates 1,2,3,4 |
| **Total** | **46** | **4** | preserved per sub-plan |

Master runbook task count: 46 phase tasks. Sub-plan total: 11 + 13 + 13 + 9 = 46. Lossless.

## Major-Changes distribution

- sub-plan-2 owns: `process.exit(1)` on Phase 3 blockers (v0.7.x); `.bkitignore` new public file.
- sub-plan-3 owns: `__bkit__` JSON namespace public contract (v0.8.0); Tier-1 to Tier-2 reclass for `.cursor/hooks.json` and `.claude/settings.json`.
- sub-plan-1 and sub-plan-4: no Major-Changes items.

## Merge Method (preserved)

Always squash. One squash-merged PR per phase. `bkit-ship.md` Step 3 hardcoded `gh pr merge --squash --delete-branch --body ""`. Plans MUST NOT propose rebase or merge-commit.

## Out of Scope (preserved from master)

- npm-registry distribution (BAR-131 explicit OOS).
- Factory-reset uninstall mode (BAR-139 explicit OOS).
- Net-new preflight detectors (separate Linear issues per BAR-142 §Out of scope).
- `pnpm-lock.yaml` cleanup automation post-uninstall.
- Pre-install state restoration of incrementally-modified files (impossible without backups).
- Three-way merge UI for `bkit upgrade` conflicts.
- BAR-131 §2 pnpm tag-drop README note (absorbed into BAR-130 dev follow-up).
- B3 Vercel CLI guard if Phase 3 work doesn't intersect `bkit-preflight.ts` (otherwise included as P3.T8).

## Agent Execution Runbook

Replaced by sub-plan index (table above). Execute sub-plans in order:

1. [bar-131-related-bars-suite-plan-1.md](./bar-131-related-bars-suite-plan-1.md) (P0+P1) -> ship v0.6.x.
2. [bar-131-related-bars-suite-plan-2.md](./bar-131-related-bars-suite-plan-2.md) (P2) -> ship v0.7.x.
3. [bar-131-related-bars-suite-plan-3.md](./bar-131-related-bars-suite-plan-3.md) (P3) -> ship v0.8.x.
4. [bar-131-related-bars-suite-plan-4.md](./bar-131-related-bars-suite-plan-4.md) (P4) -> ship v0.9.x to v1.0.
