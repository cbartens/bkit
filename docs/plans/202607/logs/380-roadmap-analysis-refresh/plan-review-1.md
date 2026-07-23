Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

## CRITICAL

1. **SC#1 "enriched at EVERY close via orchestrator-mediated `list_issues`" has no runbook task.** Success Criterion #1 and design Component 3 both require: after every workflow close, when a tracker is wired, the board is _additively enriched_ with open tracker issues via an orchestrator-mediated `list_issues` MCP call "piped to the fold." The fold (Task 3) is shell/jq and _cannot_ call MCP — it only "merges tracker rows when wired" (i.e. consumes rows handed to it). But the close-hook tasks that would provide those rows — **Task 6 (design/plan)** and **Task 7 (build/debug)** — describe only the on-disk fold-upsert + staging; neither wires the orchestrator `list_issues` read → pipe → fold at close. The only orchestrator MCP touchpoints in the runbook are Task 11 (reverse sync) and Task 12 (reconcile), both WS-4/ship-scoped. As written, design/plan/build/debug closes are on-disk-only, which contradicts SC#1's "after every workflow close … additionally enriched." Directive 3/4 already establish that "no leaf prompt has tracker MCP tools," so the forward read must be an explicit orchestrator step in each close, exactly like Task 11. **Fix:** add the orchestrator-mediated `list_issues`-when-wired read (best-effort, fail-open, `[bkit-roadmap]`) to Tasks 6/7 with a matching Derived Test Matrix row, OR explicitly narrow SC#1 to "on-disk at every close; tracker enrichment at ship/utility only" (a design-scope change requiring owner sign-off).

2. **Consumer backfill trigger missing — the design's named "rollout-day trap" fires for every consumer.** Design re-review directive #3(d) is load-bearing: without a one-time backfill of existing `completed.md` entries into `completed.jsonl`, the exclude-completed scan (Addendum E) "reads an empty ledger on rollout day and every historically-shipped FID reappears as active." Task 1 seeds `completed.jsonl` as an **empty** template file; Task 2 builds the backfill script; but Task 15 runs it **only "once on `dev`" (the bkit repo itself)**. No task wires the backfill into `bkit upgrade`/`bkit install` or documents a one-time consumer command. Every external consumer (the ships-to-consumers case bkit exists for) upgrades to an empty `completed.jsonl` while their `docs/plans/**` still holds shipped FIDs → those FIDs re-materialise as active on the first bootstrapped board. **Fix:** specify the consumer-facing backfill trigger (auto-run idempotently at `bkit upgrade`, or a documented rollout command in Documentation Updates), not just the bkit-repo dogfood run in Task 15.

## OPTIONAL

- **Matrix row count is off by one.** The Derived Test Matrix has 18 rows (rows 1–18, including the `bkit-install` consumer-owned scenario). Gate 3's coverage task (line 498) asserts "all **17** matrix rows … (Tasks 1–13)"; row 18 is actually covered by the "Update existing tests" mandatory task (line 499). Reconcile the count to 18 and name row 18's covering task so the coverage assertion is self-consistent.
- **Directive renumbering vs the design's re-review numbering is silently transposed.** The plan's Context maps Directive 1–5, but the mapping to the design's `Re-review findings` list is permuted (design #2 reconcile → plan Directive 4; design #3 completed.jsonl → plan Directive 2; design #4 reverse sync → plan Directive 3). All five are present and covered, but a reader cross-referencing the design will trip. Add a one-line "plan Directive N = design re-review #M" cross-map.
- **`one-row → one-task` deviates in two places.** Matrix rows 1–7 all map to Task 3, and row 11 maps to Tasks 6/7/9 (and row 18 to a mandatory task, not a numbered one). Acceptable given the 4-shape staging assertion is one coherent test, but the template's "each row → exactly one task" is stretched — worth an explicit note that Task 3 owns rows 1–7 and Task 7+9 jointly own row 11.
- **Reconcile only fires on ship/cadence, not on `/bkit-roadmap`.** Design directive #2 permits reconcile "at ship OR on the cadence," and the plan places it in WS-4. A manual `/bkit-roadmap` (Task 13) that runs after a board row is lost/corrupted will not reconcile until the next cadence fire. Consider invoking the reconcile pass from the utility too, since the utility is the human's explicit "fix my board now" entry point.
- **Concrete Example step 4 wording:** "User ships `412` for the 5th time" reads as re-shipping one FID; it means the 5th ship-cycle overall crossing `N`=5. Reword to avoid implying a single FID ships repeatedly.

## OUT OF SCOPE

All five `Out of Scope` rows are genuinely-additive and correctly `Exempt` (persisted `roadmap.jsonl` → #260; #260 actuator; #80 lens engine; `bkit harvest` ingestion; generating `completed.md` from the ledger). The `380-persisted-frontier-snapshot-event-log-for-260` deferral is correctly left un-duplicated, and `380-dev-located-roadmap-status-write-for-build-debug-closes` is correctly pulled IN scope (Addendum C) with a `CLOSE` row tasked (Task 14) — not parked. No `Blocking` deferrals detected. No plan-expansion additions recommended.

## SUGGESTED SCOPE EXPANSION

- `github-mcp-search-issues-silently-returns-zero-private-repo` — source `docs/failures.jsonl` — overlaps the tracker-read path (fold + Task 11/12 MCP reads). Recommendation: **keep deferred (already honored)** — the plan mandates `list_issues` (never `search_issues`) and treats 0/empty as inconclusive; no new work needed, but the fail-open branch in Tasks 6/7/11/12 should explicitly apply the same "0 is inconclusive" rule.
- `tracker-read-path-corroboration-outside-mcp-private-repo` — source `docs/deferrals.jsonl` (#341) — overlaps the wired `list_issues` reads. Recommendation: **keep deferred** — the plan's on-disk-first floor already removes the "no fallback" risk this deferral names; note it as the mitigation rather than expanding scope.
- `380-persisted-frontier-snapshot-event-log-for-260` / `#260 tick-step-1 sensing` — source `docs/deferrals.jsonl` / related issue — overlaps WS-1 fold. Recommendation: **keep deferred** — build the in-memory fold as the shared primitive only (already the plan's stance).
