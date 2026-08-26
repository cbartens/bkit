Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

None found.

**Template completeness.** All mandated sections are present and populated: Context & Goals, the three human-gated sections (Acceptance Scenario, Breaking Changes & Naming Review, Open Questions & Assumptions), Alternative Approaches & Recommendations, Out of Scope, Suggested Scope Expansion, Security & Privacy, Pre-Flight/Dependencies, Data Schema Integration, Architecture & Component Changes, Supersession Inventory, Documentation Updates, Rollback Strategy, Agent Execution Runbook (Phase 0 + WS-1..WS-7, 34 tasks), and Verification Plan with Gates 2-4.

**Every task has scope + Done when.** All 34 tasks (Task 1-34) carry a concrete scope description and a `Done when:` line that is codebase-verifiable (rg/jq/pnpm command with an expected output), including the Phase 0 blocking proof obligation (Task 1) which additionally specifies an explicit STOP procedure (5 ordered sub-steps) if the proof fails, and states which downstream tasks/matrix rows are dropped as a consequence.

**Derived Test Matrix <-> Runbook mapping verified bidirectionally.** All 15 matrix rows (T1-T15) map 1:1 to a runbook task, and the reverse holds — every task claiming to "own" a matrix row (via `_(Owns matrix row Tn.)_` annotations) matches the plan's own summary table at line 811 exactly: T1->Task 8, T2->Task 8, T3->Task 6, T4->Task 26, T5->Task 7, T6->Task 32, T7->Task 9, T8->Task 23, T9->Task 12, T10->Task 24, T11->Task 17, T12->Task 13, T13->Task 11, T14->Task 28, T15->Task 23. No orphan rows on either side.

**Line-number fragility (audit focus 1) — no violation found.** Task 3 deletes 58 lines at `.bkit/src/bkit-modules.ts:1461-1518`; the plan explicitly documents the resulting ~57-line shift for every post-`:1461` anchor in a "Standing rules" callout (line 688) and repeats the constraint as a Gate 2 checkbox (line 813: "No `Done when` names a post-`:1461` `bkit-modules.ts` line range after Task 3 has run"). Checked every task individually:

- Task 20, 21, 23 (which touch `enrichClaudeSettingsWebFetch` / `injectOpencodeNetworkCurlAllows`, both past `:1461`) all resolve by symbol name in their `Done when` lines, never by post-Task-3 line range.
- Task 21's anchors (`bkit-upgrade.ts:465`, `bkit-install.ts:2588`) are explicitly labeled "unshifted" — correct, since they live in different files untouched by Task 3.
- Task 26 and Task 27's `Done when` lines cite pre-Task-3 coordinates (`:1698`, `:1718`, `:1726-1734`) but each instance is explicitly caveated "pre-Task-3 coordinates; resolve by symbol" or "a line-range check there can neither pass nor fail meaningfully" — i.e., the plan names the old coordinate only as a pointer for a human reader, then instructs symbol-based resolution, not a literal post-Task-3 grep.
  No task's `Done when` performs a literal post-`:1461` line-range check after Task 3 has landed.

**Scope creep vs required work (audit focus 2) — verified against the ledger.** `docs/deferrals.jsonl` was read directly: it carries exactly 9 lines matching `"key":"381-` (verified via `rg -c`), across exactly 8 unique keys (verified via `rg -o ... | sort -u`): `381-cloud-allowlist-staleness-detector`, `381-opencode-curl-glob-substring-bypass`, `381-unified-runtime-allowlist-artifact-all-hosts`, `381-provider-registry-key-mirror-consolidation` (all four design-phase), `381-upgrade-does-not-write-advisories-artifact`, `381-webfetch-grants-survive-uninstall-after-seed-emptied`, `381-cursor-hook-ask-rate-signal` (three plan-generate), and `381-opencode-bash-grants-never-revoked` (one NEW, plan-update). The ninth line is the same-`key` correction append to `381-webfetch-grants-survive-uninstall-after-seed-emptied`, whose original premise ("grants survive uninstall once the seed is emptied") the corrected row properly supersedes with the disproven-by-source-read premise (recomputation, not seed-scoping) — appended, not edited, consistent with `.bkit/jsonl.md` § Updating a Row. Task 31's Done-when pin ("returns 9 ... across exactly 8 unique keys ... returns 2" for the corrected key) matches the file exactly. Every `Out of Scope` row is backed by a named deferral key or an already-open issue (#435), and each carries a stated justification tying it to being genuinely additive rather than required by a Success Criterion, Derived Test Matrix row, or Architecture change — the closing caution block at line 321 makes this an explicit self-check rather than an assertion.

**Human-gate integrity (audit focus 3) — verified accurate.** Searched the full document for the string "14" outside line-number/file-anchor/test-ID contexts (T14 matrix row, `:14xx` file offsets); no stray "14" survives as a base-count claim. The Acceptance Scenario's ground-truth correction box (lines 79-86) and the Assumptions section (line 234: "The derived union (15 bases) is a strict superset of today's shipped 10") both consistently state 15, matching the callout at line 31 ("15 is the derived-union count everywhere in this plan... Any '14' surviving anywhere in this document is a defect"). The previously-reported defect (base count stated as 14 in a confirmation-gated Assumption) is not present in this revision. Task 4's registry row count (13) and Open Question 1's default resolution (drop `kimi-docs`, 13 rows/6 kinds) are internally consistent with each other and with the corrected 10-base/4-key/15-derived arithmetic stated in the WARNING block at the top of the document.

**Supersession Inventory** is present and complete: 6 rows, all `DELETE` (no `RETAIN-WITH-REASON`, correctly — nothing here is an external contract), each cross-referenced into Architecture & Component Changes `[DELETE]` entries and into a specific runbook removal task (Tasks 7/10/11/13/15/17/22).

## OPTIONAL

- Task 26's belt-and-braces absence assertion (grep the installed hook for `SHIPPED_NETWORK_BASES`) is explicitly self-flagged by the plan as "not independent evidence... this can only restate T6" — this is honest disclosure rather than a defect, but a reviewer resequencing Phase 4/5 in the future should note T4's absence check is not a standalone guarantee.
- The plan's own Gate 2 checklist (line 812) already requires every repo-wide `rg` in a `Done when` to either exclude `docs/plans/**` or name explicit paths; this was spot-checked against Task 14's `Done when` (which does carry the `--glob '!docs/plans/**'` exclusion) and holds. Worth the builder re-confirming this per-task during execution rather than assuming Gate 2 catches a miss after the fact, given the density of repo-wide `rg` invocations across Tasks 5, 9, 15, 16, 20, 27.

## OUT OF SCOPE

- Whether Open Questions 1-7 are correctly _resolved_ (vs. merely present with a recommended default) is Success-Criteria-adjacent judgment call for the human confirming Gate 1, not a scope-completeness defect — noted here only because it borders this audit's lens but the questions themselves, their options, and their defaults are all structurally present and do not block plan progress.
- Whether the "Owns matrix row" annotations should also be cross-linked in the reverse direction (from the Derived Test Matrix table into runbook task numbers) is a plan-formatting improvement, not a defect — the line-811 Gate 2 checklist already provides that reverse index.
