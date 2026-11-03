Verdict: PASS
Failures: 0
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

None.

The current amended design is covered by the runbook: envelope and links (Tasks 3–6), path registries and deterministic migration (7–9), command and caller cutover (10–12), file-scoped context (13–16), keyword search (17–18), inherited rank and update/undo (19–24), scheduled execution (25), qmd (26), and integrated verification/documentation (27–28). The shared lock and durable-copy contract have implementation owners in Tasks 8–10 and 21; validated undo is Task 22; exact-version checks and inherited content generation are Task 19; full-content preservation and resolution span Tasks 5, 8–10 and 19.

The producer/consumer graph follows build order: baseline fixtures 1–2 → schema/constants/writers 3–4 → reads/graph/registries/migration 5–8 → install/command/caller cutover 9–12 → context and measured comparison 13–16 → search and its consumers 17–18 → proposal/rejection/update/undo/reporting 19–23 → unified procedure 24 → schedule/exporter 25–26 → composed verification and final artifacts 27–28. Task 26 reaches its read-CLI prerequisites transitively through Task 24. No later-only producer, absent prerequisite or task cycle was identified. The staged registry keeps each kind uniquely registered, and the old four kinds and their callers switch within Group 3. Generated fixtures required by a group's checks are refreshed at that boundary rather than waiting for Task 28.

## OPTIONAL

1. **Align the overview with the executable command layout.** Alternatives, Reuse Inventory, the conditional architecture check and one Task 10 registry description still refer to dispatch from the existing `ledgers.ts` module. The approved architecture and Task 10 CREATE field choose `commands/workflow/brain.ts`, supported by decision `546-brain-sibling-command-dispatch` and the active initialization-cycle gotcha. Use that same location throughout. Documentation Updates also says seven verbs although Task 27 correctly checks eight, including `undo`. These do not require changing the chosen architecture or task order.

2. **Carry the complete terminal and cleanup conditions into summaries.** Task 6's DONE WHEN explicitly enumerates four terminal statuses but omits `WITHDRAWN`; use the terminal set already defined in Data Schema Changes and Task 3. In the Concrete Example, Supersession Inventory and the old-ledger DELETE paragraph, distinguish retaining full sources while writer quiescence is unproven from retaining empty union stubs after durable verification and proven quiescence. The approved operational contract and Task 9 already require that distinction; the shorter descriptions should not leave readers to reconcile it themselves.

3. **Keep related tracker summaries current without treating them as prerequisites.** The supplied #795 and #797 bodies still describe older migration/proposal behavior. The amended parent design takes precedence and the plan correctly covers those surfaces itself. Refresh their descriptions during ordinary tracker maintenance so another workflow does not reintroduce the superseded contract. The child-issue blockers are implemented in this plan's own ordered groups and do not require separate prerequisite plans.

## OUT OF SCOPE

None beyond the advisory candidates below. Do not add those candidates to this runbook without a scope decision.

## SUGGESTED SCOPE EXPANSION

- `748-brand-every-consumer-knowledge-rows-name-old-script-and-style-names` — `related-deferrals.md`, TRIAGED: four existing knowledge rows overlap the migrated brain content and documentation sweep. Recommend a separately approved content-correction pass; migration should preserve their existing facts, not silently rewrite them.
- `699-friction-key-truncation-class-fix` — `related-deferrals.md`, OPEN: its identity/prune implementation overlaps the telemetry and harvest files touched by Task 11. Recommend retaining a separate fix with its own existing-data migration; friction remains outside the brain merge.
- `546-issues-jsonl-feature-rows-join-brain` — `related-deferrals.md`, OPEN: overlaps brain identity, roadmap reads and paths. Recommend keeping the explicit later-phase deferral; feature rows remain separate in this design.
- `546-retire-brain-stubs-and-legacy-ledger-alias` — latest row in `related-deferrals.md`, OPEN: overlaps migration and old-path reads. Recommend release-range follow-up only for retained stubs; the latest row correctly records that old write aliases are refused now.
- `546-friction-stats-stay-separate` — `related-deferrals.md`, OPEN: overlaps codec and stats/harvest callers. Recommend no expansion; those high-volume/process ledgers remain separate.
- `546-transcript-recall-outside-brain` — `related-deferrals.md`, OPEN: overlaps retrieval conceptually. Recommend no expansion; personal transcript recall is a declared non-goal.

The related implementation issues are already covered by the parent design and runbook, so they are not expansion candidates. The supplied failure row and the old consumer migration documentation deferral are CLOSED and create no open prerequisite.
