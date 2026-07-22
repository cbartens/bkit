Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

None. The build-dependency DAG is acyclic, every declared consuming edge is real (the depended-on task produces an artifact the successor reads), all 16 design workstreams (+ §6d) map 1:1 to a runbook task, and every design-implied prerequisite is honored at least positionally in the ordering line.

**Edge verification (declared → consumed):**

- T8 → T3 — adopt-or-mint consumes the shim's `WORKTREE_PATH` mint/adopt resolution (Done-when cites "T3 row 4"). Real.
- T10 → T9, T11 → T9, T13 → T9 — close shapes B/C/A inherit the D23/D24/D25 close-guard kernel that T9 produces (Done-whens cite T9 rows 7–9). Real.
- T13 → T12 — D5(a) PR-close needs the skip-token-free subjects T12 produces (Done-when cites "T12 row 12 hold"). Real.
- T14 → T9 (D25 reads the `transport-fallback` row T14 writes) and T14 → T4 (§6c map uses the C1-verified `actions_*`/`get_job_logs` tool names, reachable only once T4 adds the `actions` toolset). Real.
- T16 → all (prose audit + live runs consume every `CAN_*` reader and transport). Real.

No fabricated edges (no declared dependency whose artifact goes unused). No cycles: roots T1/T2/T3 → T4/T5 → T6/T7/T8/T9 → T10/T11/T12/T13/T14/T15 → T16 (terminal). Cursor-4th-runtime and periodic transport-fallback-analysis are both correctly deferred (`related-deferrals.md`), not smuggled in as tasks. The open `search_issues`-zero-on-private-repo failure is mitigated by D12 (empty MCP read = inconclusive) landed in T6/T14, not ignored.

## OPTIONAL

- **Make the T2 → T8 edge explicit in T8's body.** The design names "WS-4 (FID reorder) is prerequisite to WS-9 (adopt-or-mint, needs marker-primary FID)" as a direct edge. In the plan, T2 (FID decoupling in `bkit-auto.md`) is a root and T8 (adopt-or-mint) is downstream, so the ordering DAG honors it positionally — but T8's task body / Done-when never cites T2. Adopt mode is only reachable via `bkit-auto` once the `feat/`-prefix hard-reject is deleted (T2); a builder or reviewer reading T8 in isolation would not see this coupling. Add "requires T2's marker-primary FID resolution" to T8. Low risk (order already correct), clarity only.

- **The `T3 → T4 → T5` arrows in the Ordering line are sequencing, not artifact edges.** T4 (add `actions` to `.mcp.json`) and T5 (`cloud-bootstrap.sh` hardening) consume nothing from T3's shim, and T5 consumes nothing from T4. The line itself hedges ("run early/parallel-in-design"), so this is not a fabricated hard dependency — but the arrow notation reads as a chain. Consider annotating T4/T5 as independent roots that may land in any order relative to T3, to avoid a false serialization constraint.

- **T15 → T4 and T14 → T4 are real but undeclared in the task bodies.** T15's Playwright artifact seam (`download_workflow_run_artifact`) and T14's `actions_*` fallback names both require the `actions` toolset that only T4 enables. Ordering honors this (T4 early, T14/T15 late), but neither Done-when cites T4. Add the reference for builder clarity.

- **The shared-file serialization callout is incomplete.** The runbook header flags only T7/T10/T11 as touching `bkit-build.md`/`bkit-debug.md`/`bkit-ship.md`. In fact T8 (13 coupled sites across all five phase files), T12 (drop `[skip ci]` across all workflows), and T13 (design/plan) also edit these files. Because repo doctrine forces fully-serial landing on one clone and the ordering DAG already sequences them, there is no actual conflict risk — but the callout under-states which tasks share the files. Either widen the list or state "all workflow-file edits land serially" once.

- **T12/T13 are conditional on the still-open OQ-A (D5(a) vs D5) yet appear as unconditional checkboxes.** The plan is honest ("Dropped entirely if the human selects D5"; "If human selects D5: swap the tail…"), and OQ-A is human-gated at Gate 1, so this is disclosed rather than a gap. Noting so the orchestrator does not treat T12 as firm scope before OQ-A resolves.

## OUT OF SCOPE

- The three Suggested Scope Expansion candidates (`#342` injection hardening, shellcheck gate over `.bkit/scripts/*.sh`, `status.jsonl` run-boundary keying) are correctly kept out of the runbook and left as human-fold candidates — no dependency-graph action needed. Flagging only that the shellcheck candidate, if ever folded, would add a static gate depending on the new `bkit-runtime.sh` (T3) landing first.

- Template conformance and `Done when` criteria are intact (verified against `docs/plans/template.md` — all sections and all four gates present in order; every T1–T16 task carries a `Done when`), so no template-drift finding. Recorded here only to confirm step 10 was checked, not as a plan-expansion suggestion.
