Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Template integrity: all mandated `docs/plans/template.md` sections present and populated (Context & Goals, Acceptance Scenario incl. Narrative/Success Criteria/Process Sketch/Concrete Example/Edge Cases/Derived Test Matrix, Breaking Changes, Open Questions & Assumptions, Alternative Approaches, Out of Scope, Suggested Scope Expansion, Security & Privacy, Pre-Flight + Gate 1, Data Schema Integration, Architecture & Component Changes, Supersession Inventory, Documentation Updates, Rollback Strategy, Agent Execution Runbook + Gates 2/3, Verification Plan + Gate 4, Manual Verification, Merge Method).

Matrix <-> runbook mapping: SOUND. All 22 Derived Test Matrix rows trace to runbook tasks (with the documented row->task exceptions in the NOTE at plan line 152: fold rows 1-7+19 -> Task 3; staging/enrichment rows 11+20 -> Tasks 6/7/9; dev-write row 21 -> Task 7; fail-open row 22 -> Tasks 7/11; consumer-owned row 18 -> "Update existing tests"). Every runbook task carries a `Done when:` line; every test-bearing task cites its matrix row. No orphan rows, no orphan test files. All five plan directives (per-FID upsert, completed.jsonl migration+backfill, reverse sync, reconcile, build/debug 4th staging shape) are present and tasked, with an explicit directive<->design cross-map (line 34).

Supersession: both superseded artifacts captured — the `grep docs/completed.md` verdict reader (deleted/switched in Task 5) and the `380-dev-located-roadmap-status-write-for-build-debug-closes` deferral (CLOSED in Task 14). No missing entry.

Out of Scope: all 5 rows genuinely `Exempt` (none required by a Success Criterion / Acceptance row / Derived Test Matrix row); no `Blocking` deferral parked. The one required-work item (dev-located build/debug write) is correctly pulled IN scope (Addendum C, Task 7), not deferred.

Managed-block discipline: the two managed-block edits (`docs/completed.md` header note in Task 5; `.agents/docs.md` Universal Documents row in Task 4) are both authored via the `.bkit/templates/**` SSOT and rendered by install — the sanctioned mechanism, not direct edits to rendered `bkit:start`/`bkit:end` regions. The `docs/roadmap.md` doc-index row correctly lands in `Project Documents` (below `bkit:end`).

## CRITICAL

None. Scope is complete: every scope item has both a build task and a verification task, and the matrix<->runbook mapping is bidirectional and recoverable.

## OPTIONAL

1. **Bootstrap over a pre-existing consumer roadmap.md with arbitrary non-marker content is unspecified + untested.** The fold's bootstrap creates "empty machine blocks + banner + empty `## Backlog / Ideas`" (Architecture § `docs/roadmap.md`; Edge Cases line 101 only covers _missing/mangled markers_ on a file already in the new format). A consumer who hand-authored `docs/roadmap.md` BEFORE adopting the feature has freeform content and no markers — the plan does not say whether that content is preserved (e.g. wrapped as Backlog) or orphaned/clobbered, which brushes against SC#5 ("consumer-owned … never overwrite"). Low blast radius for the bkit repo itself (no `docs/roadmap.md` exists here, so WS-6 dogfood won't exercise it), but it is a real consumer path. Suggest: add explicit first-bootstrap content-preservation handling to Task 3 and a matrix row (bats) asserting pre-existing non-marker content survives the first fold.

2. **Backfill parse robustness against variant/malformed `completed.md` is not tested (Task 2 / matrix row 9).** Row 9 only asserts "every entry becomes a row + idempotent" over a well-formed fixture. The backfill parses `## Title (date)` + `Artifacts:` FID paths and is "fail-open" — but a silent parse MISS reintroduces the exact "historically-shipped FID reappears as active on the first board" trap the backfill exists to prevent (Edge Cases line 104). Suggest a fixture case with a variant/malformed `completed.md` entry asserting either capture or a loud `[bkit-…]` diagnostic (not a silent skip).

3. **Several verification rows assert workflow-file _content_, not runtime behavior (rows 11, 15, 20; Tasks 6/7/9/11).** "boundary: workflow files" assertions confirm prose/marker presence in the `.bkit/workflows/*.md`, which can pass while the orchestrated runtime behavior is broken. This is inherent to bkit's orchestrator-as-prose architecture and is partially mitigated by Manual Verification Steps 2/4 (real close + real ship round-trip). Acceptable, but note the residual weaker-signal gap; ensure Manual Verification stays load-bearing for these.

4. **Cadence bats test (matrix row 14 / Task 10) presumes the count is an extractable shell/jq snippet.** The cadence lives in `bkit-ship.md` (a prose workflow). A bats test can only exercise it if the "count persisted ship-close `outcome` rows in `.bkit/stats.jsonl`" logic is a discrete, sourceable jq/shell expression (as the Pre-Flight "counter derivation bats pattern" implies) rather than inline orchestrator prose. Make that explicit in Task 10 so the row-14 assertion has a real target, not a text grep.

5. **Supersession row conflates artifact with retained file.** The row lists "`docs/completed.md` grep as the shipped-FID source of truth" as `RETAIN-WITH-REASON`, but the grep reader itself is genuinely replaced/removed (Task 5), while `completed.md`-the-file is _retained with a live, non-deprecated dual-write purpose_ — which is not a supersession at all. Cleaner: mark the grep reader `DELETE` (done in Task 5) and drop `completed.md`-the-file from the inventory (it is not superseded). Classification only; does not affect scope completeness.

6. **"Settled-drift" predicate under-specified (Task 11 / Directive 3 / matrix row 15).** The reverse-sync "reconcile ONLY settled drift (skip an issue whose phase is actively transitioning / has a live `feat/{FID}`)" names the intent but not the concrete detection mechanism. Row 15 only asserts the sync is MCP-only + guarded + never-gates. Consider a concrete settled-vs-transitioning predicate (e.g. no matching live `feat/{FID}` AND no in-flight status.jsonl phase event) so the guard is testable rather than aspirational.

## OUT OF SCOPE

- **Shellcheck gate over the new `bkit-roadmap-fold.sh` + `bkit-completed-backfill.sh`.** Task 3 explicitly notes these land on the un-shellchecked shipped shell surface (OPEN deferral `58-no-shellcheck-gate-over-bkit-scripts`). Correctly kept deferred; flag only that this plan adds two more scripts to that ungated surface — no action required here.
- **Generating `docs/completed.md` from the ledger.** Already parked (Out of Scope row 5); retain-and-dual-write is the chosen lower-risk path. No change.
- **Consumer-facing rollback tooling for a botched backfill.** Rollback Strategy covers `git revert` + idempotent re-run, which is adequate; a dedicated `bkit`-task un-backfill is not warranted. Note only.
