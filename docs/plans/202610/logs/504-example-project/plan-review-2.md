Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

- **Forward dependency: Task 3 `Done when` consumes an artefact produced only by Task 8.** Task 3 (WS-3, `harness/bkit-ci.yml`) is verified by "passes the bkit-registered `actionlint` coverage (Task 8)" (plan line 579) and line 171 states the workflow's correctness _is_ the global Static gate "registered in WS-9". The coverage registration is produced by Task 8, which runs five tasks later. So Task 3 cannot be checked off in build order — a consumed artefact produced only by a later task. Fix: either land the actionlint-coverage registration for the fixture path before Task 3, or reword Task 3's `Done when` to run `actionlint` directly on the file (leaving coverage registration in Task 8). Design `Requires` for WS-3 is `[WS-1, WS-2]` — the plan silently adds WS-9 as a third dependency without reordering.

- **Design-coverage gap: WS-7's `data.js` owner-check cadence has no home in the plan.** Design §Suggested Workstreams → WS-7 scope binds "Note the `data.js` owner-check cadence (per-release canary owner) per the WS-1 open question" (design lines 519-523, 655). The plan's Task 9 contract-table list (line 503), its `Documentation Updates` row for `examples/README.md` (line 552), and every runbook task omit it; no other task covers it. A design-implied deliverable with no task → design-coverage gap.

## OPTIONAL

- **Sentinel single-source vs "appears only in `index.html`".** Task 1 `Done when` asserts "the sentinel string appears **only** in `index.html`" (line 577), but Task 3's PR-only sentinel-gone step must reference the sentinel value to assert its absence, and the design says the string is "defined once … referenced by the placeholder **and the CI step**" (design lines 69, 138). State the mechanism (e.g. the CI step reads the sentinel from `main:example/index.html`, or a single shared constant), otherwise Task 1's criterion and Task 3 conflict at verification time.

- **WS-5 content gap in Task 9.** Design WS-5 scope explicitly requires "Count-attempted (reset commits via `git log --grep`) vs count-completed (`outcome` rows) so a run dying before design is visible; per-version failure rates" (design lines 312, 616). Task 9's contract-table list names the read path / median-table / run-marker / version-grouping but not attempted-vs-completed counting. Consider naming it so the WS-5 contract is stated once (Task 9 is the sole WS-5 home this cycle).

- **`related-failures.md` vs the plan's own citation.** The fetch-context ledger scan (`related-failures.md`) returned `None.`, yet the plan's `Suggested Scope Expansion` correctly cites the OPEN `runs-gate-repo-flag-ignored-pr-resolved-from-checkout` (`docs/failures.jsonl:61`, `severity: HIGH`). The plan's handling is right (WS-7/WS-8 constraint, line 331); the scan artifact looks under-reported. Verify the `{QUERY}` terms, not the plan.

- **Task 8 dependency annotation.** Task 8 (WS-9) `Done when` requires Task 3's workflow to exist and be lint-clean; Task 8 is ordered after Task 3 so the DAG holds, but the coupling to Task 3 (the `actionlint` surface) and to Tasks 4-5 (the runner path it keeps scanned) is implicit. One explicit "requires" line per coupled task would make reordering safe.

## OUT OF SCOPE

- Median-folding / per-version failure-rate **code** (WS-5 computes nothing this cycle — plan lines 81, 402-404; design WS-5 builds no code) — documented only; routine expansion, not this plan's remit.
- Cost measurement source (#526) and bkit CI smoke job — explicitly deferred (plan lines 248-251, 314; design Decisions line 359). No new home needed.
- Design `Requires` DAG otherwise holds: Task order 1→9 matches WS-1 `[]`, WS-2 `[WS-1]`, WS-3 `[WS-1,WS-2]`, WS-4 `[WS-1,WS-2]`, WS-8 `[WS-2,WS-4]`, WS-6 `[WS-1,WS-3]`, WS-9 `[WS-1,WS-4]`, WS-7/WS-5 last (WS-7 is the design's only sink). No cycles; no other artefact consumed before its producer.
- Template structure intact (all sections present and ordered; every runbook task carries `Done when:`); no structural FAIL.
