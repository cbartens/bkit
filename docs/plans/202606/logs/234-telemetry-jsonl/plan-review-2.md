Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

### C-1 — WS-5 has an undeclared prerequisite on WS-2 (CLI entrypoint + verb-namespace decision)

`WS-5` declares `Requires: WS-1` only (runbook line 587), yet `WS5-T2` (line 591) implements `bkit telemetry migrate` as **net-new CLI dispatch + a sub-verb parser** on `bkit-cli.ts`. The entrypoint OPEN QUESTION (share `dist/bkit-install.js` vs a separate binary so a grader/harvest/migrate crash never touches the consumer-mutating install path) AND the verb-namespace OPEN QUESTION (top-level `harvest`/`analysis`/`migrate` vs a `telemetry` sub-verb namespace) are resolved ONLY in `WS2-T1` (lines 538–539, and the Breaking-Changes section line 187 states this "MUST be resolved in WS-2 plan-review before the first read/grade verb ships"). WS-4 correctly inherits that resolution ("namespace per the WS-2-resolved OPEN QUESTION", line 450) and lists WS-2 in `Requires`. WS-5 consumes the same resolved decision (it must pick `bkit telemetry migrate` vs a flat verb, and must respect the chosen entrypoint isolation that the destructive consumer-mutating migrate path most needs) but does NOT list WS-2 as a prerequisite.

Because WS-2/WS-3/WS-5 are explicitly authorised to run **in parallel** once WS-1 ships (lines 42, 276, 509), WS-5 could begin and land its sub-verb parser + entrypoint wiring before WS2-T1 records the decision — forking the CLI architecture exactly where the design says it must NOT be forked, and possibly wiring the most dangerous (destructive `.md`-deleting) verb into the install hot path the isolation decision is meant to protect.

Fix: add `WS-2` to WS-5's `Requires` (at minimum a scoped dependency on the `WS2-T1` entrypoint/namespace decision), OR hoist the entrypoint + namespace resolution out of WS-2 into WS-1 (it is CLI-substrate, not grader-specific) so all three CLI-adding workstreams (WS-2/WS-4/WS-5) inherit a single resolved decision from the common root. The latter is cleaner: WS-2, WS-4, and WS-5 each add verbs to the same `bkit-cli.ts`, so the dispatch/parse architecture is genuinely WS-1-substrate, not WS-2-local.

### C-2 — WS-4's declared `Requires: WS-2` edge is not exercised by any WS-4 task (fabricated/under-covered dependency)

WS-4 declares `Requires: [WS-1, WS-2, WS-3]` (line 570). The WS-2 edge is justified in the design and plan as: analysis needs WS-2's `kind:"compliance"` rows for "per-rule compliance rate over time" (Architecture line 438; design Suggested-Workstreams line 575; design P4.2 line 377). But the only WS-4 task that would consume compliance rows is `WS4-T3` (Analysis CLI), and its `Done when` (line 577) asserts ONLY the #183 size↔outcome regression + dispatch-size threshold + `counterSource` trust labelling — it makes NO assertion about per-rule compliance-rate analysis over `kind:"compliance"` rows. The WS-3 edge IS exercised (counterSource trust labelling at WS4-T3 consumes WS-3's `shell-bus` distinction), but the WS-2 edge has no consuming task with a verifiable `Done when`.

As written this is either (a) a fabricated dependency edge — declared but no WS-4 task consumes WS-2's artefact — which per the review protocol is CRITICAL, or (b) a missing-coverage gap where the design-implied per-rule-compliance-rate analysis (a stated WS-4 deliverable and the sole reason for the WS-2→WS-4 edge) has no runbook task. Either way it must be reconciled.

Fix: add a `Done when` clause to WS4-T3 (or a new WS-4 task) asserting the analysis CLI computes per-rule compliance rate over `kind:"compliance"` rows — which both covers the design deliverable AND makes the declared WS-2→WS-4 edge real. If per-rule compliance analysis is genuinely deferred, drop WS-2 from WS-4's `Requires` and re-justify the edge (note WS-4 would still validly depend on WS-1 only for harvest, with WS-3 for trust labelling).

## OPTIONAL

- **Graph is otherwise a correct DAG, no cycles.** WS-1 -> {WS-2, WS-3, WS-5}; {WS-1, WS-2, WS-3} -> WS-4. No back-edges; matches the design's Suggested-Workstreams DAG (design lines 494–499) 1:1. The ASCII dependency diagram at plan lines 34–39 has a cosmetic oddity — WS-4 appears twice (once as a `WS-1` child branch `├──> WS-4` and once as the `(data)` sink `<─┘`) which reads as a self/duplicate node; the design's diagram (lines 494–499) is clearer. Consider aligning the plan diagram to the design's to avoid implying WS-4 is both a direct WS-1 child and a WS-2/WS-3 sink without annotation.

- **`bkit-cli.ts` three-way concurrent edit hazard.** WS-2 (WS2-T5), WS-4 (WS4-T5), and WS-5 (WS5-T2) all `[MODIFY] bkit-cli.ts` and `bkit-cli.test.ts`. Even with C-1 resolved, three parallel workstreams editing the same `Verb` union + dispatch + test file will collide on merge. The plan relies on separate squash PRs (Merge Method, line 230) which serialises commits but not authorship. Worth an explicit note in WS-4/WS-5 that the CLI plumbing rebases onto whichever CLI-touching workstream lands first, and that `bkit-cli.test.ts` assertions are additive (one `it` block per verb) to minimise conflict.

- **WS1-T6 -> WS-3 forward-compat is sound but implicit.** WS1-T6 stamps `counterSource:"model-self-report"` on pre-P3 counter rows so WS-3's later `shell-bus` rows are structurally distinguishable. This is a correctly-ordered forward dependency (WS-1 ships the field, WS-3 ships the second value, WS-4 reads both). No change needed; calling it out as the one place where WS-1 must anticipate WS-3's payload would help the implementer not drop the field.

- **WS3-T1 reconciliation gate is a real external prerequisite, well-handled.** The `dev`-local `refactor(debug): mode-matched attempt counters` overlap is surfaced as the FIRST WS-3 task (WS3-T1, lines 557–558) with a concrete `Done when` (written reconciliation note enumerating every `*_ATTEMPT`/`MAX_*` site). Good. One gap: the reconciliation output is a plan-log note, not a codebase-verifiable artefact, so plan-verify cannot mechanically assert it — acceptable for a reconciliation step but flag it as judgement-gated.

## OUT OF SCOPE

- The plan defers `MAX_ROWS_BEFORE_ROLLUP` value, archive commit-vs-gitignore, and #183 backfill scope to WS-4 plan-review, and the CLI entrypoint/namespace to WS-2 plan-review. These deferrals are legitimately scoped to downstream plan phases and are NOT dependency-graph defects (the path-template + foldFrom + growth-WARNING ship in WS-1 so the deferral is safe — design lines 348/459). No action for this plan beyond C-1's recommendation to hoist the entrypoint decision earlier.
- Whether each workstream should be a `bkit-plan-complexity-split` sub-plan (WS-3's 5-workflow control-flow blast radius and WS-4's harvest+analysis+rollup breadth are the candidates) is a complexity-split judgement outside this dependency-correctness lens.
