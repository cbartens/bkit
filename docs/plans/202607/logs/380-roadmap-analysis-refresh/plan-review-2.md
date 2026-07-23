Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

None.

Dependency graph is sound. The runbook declares task order via workstream grouping (Foundation/Mechanical/Analysis/Cadence/Utility/Cross-provider) plus the `Ordering:` note (`schema/foundation -> mechanical -> analysis -> cadence -> utility -> mirror-regen`) rather than per-task `Requires:` fields — which is template-compliant (`docs/plans/template.md` mandates only `Done when:` per task, not dependency fields). Verified:

- **No fabricated edges / no missing prerequisites.** Every cross-task artifact consumption is satisfied by a preceding task: T3's exclude-completed reads T1's `docs/completed.jsonl` (T1 before T3); T5's verdict reader consumes T1's `completed` codec; T6/T7 close hooks source T3's `bkit-roadmap-fold.sh`; T9's ship Step 10 wiring needs T8's `@bkit-roadmap-refresh` leaf; T10 cadence augments T8's analysis pass; T13 utility composes T3/T6 fold + T8 leaf; T15 mirror-regen runs T2's backfill script and depends on all prior edits.
- **Plan order is a valid topological sort of the design WS DAG** (WS-1 -> {WS-2,WS-3}; {WS-2,WS-3} -> WS-5; WS-3 -> WS-4; all -> WS-6). No cycles.
- **All five design re-review directives (design `## Re-review findings`) are reflected as tasks:** per-FID upsert (T3/T6/T7), atomic `completed.md->completed.jsonl` migration + backfill (T1/T2/T5), reverse tracker sync orchestrator-mediated (T11), reconcile/recovery (T12), build/debug dev-write as the 4th staging shape + per-shape assertion (T7 + matrix row 11).
- **Atomic-migration hazard (directive #3) is preserved.** The `completed.md->completed.jsonl` touchpoints are split across T1/T2/T5/T15 but the Merge Method mandates a single squash, so the reader+writer+hash-gate+backfill land together — no partial-migration ship-block window.
- **External deps are non-blocking:** #80 handled by a generic "run an audit" fallback; #324 not relied on (cadence counts existing `.bkit/stats.jsonl` `outcome` rows); the `380-dev-located-...` deferral is correctly pulled in-scope + CLOSED (T14) while `380-persisted-frontier...` stays deferred (Out of Scope) — matches the design.

## OPTIONAL

- **T15 mirror-regen enumeration omits `@bkit-ship-update-docs`.** Design Addendum G explicitly adds the edited `@bkit-ship-update-docs` prompt (touched by T5) to WS-6's mirror-regen + dogfood scope, but T15's target list names only "the five edited workflows + `/bkit-roadmap` + `@bkit-roadmap-refresh`" and its `Done when` asserts mirrors only "for the new utility + agent". Functionally covered because `bkit install` re-renders all mirrors from SSOT, but naming `@bkit-ship-update-docs` in T15 would make the design-implied dependency verifiable rather than incidental.
- **Matrix row-count inconsistency.** The Derived Test Matrix has 18 rows, but the Gate-2 mandatory item says "all 17 matrix rows have a checked-off test task (Tasks 1-13)". Row 18 (`bkit install` consumer-owned scenario) is in fact covered by the "Update existing tests" mandatory item, not by a numbered task — reconcile the "17" wording so a verifier does not read row 18 as uncovered.
- **Matrix row 11 maps to multiple tasks (T6 part 1, T7 parts 2-4, T9 extends), against the template's "each row -> exactly one task" rule.** The row is a compound per-workflow-shape behaviour so the split is defensible, but consider splitting row 11 into per-shape rows (design/plan allowlist; build/debug feat `git add -A` + dev-lock; ship scoped add) so each maps 1:1.
- **New shell scripts inherit two known shell-surface traps.** `bkit-roadmap-fold.sh`/`bkit-completed-backfill.sh` land into the un-shellchecked shipped shell surface flagged by the OPEN deferral `58-no-shellcheck-gate-over-bkit-scripts`; and T3's byte-match test (`bkit-roadmap-fold.test.ts`, mirroring `bkit-status-fold.test.ts`) should hash in-process via `node:crypto`, not shell out to `md5`, to avoid repeating the CLOSED `status-fold-test-md5-macos-only-fails-linux-ci` CI-portability failure. Worth an explicit note in T3.

## OUT OF SCOPE

None. The plan's Out of Scope + Suggested Scope Expansion tables already correctly park the persisted `roadmap.jsonl` event log and #260 actuator against their owning issues; no additional expansion is warranted from the dependency/coverage lens.
