Verdict: CONCERNS
Strategy: STANDARD
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: Task 8 none render not byte-identical to origin/dev — moved the Task 8 additions into tracker blocks (inline true blocks, false counterparts where needed) in bkit-design/plan/build/debug/ship; added a "none render baselines" test in .bkit/core/engine/render/trackers.test.ts with baselines under .bkit/core/engine/render/**snapshots**/ (red first: all 5 failed against the origin/dev baselines). Scope: the T8 additions are byte-identical under none. Legitimate none differences, not T8: the four wording-governed shared lines (mint, empty-FID, "Issue resolved" gate item, comment-post line; the T7 wording clauses retire the old none texts, so T7 and T8 conflict there and the clauses win), prettier blank lines around the FID paragraph, build sub-plan 1 gate-log copy, ship T15 hunks, debug T9/T14 hunks (debug baseline generated post-fix). Test helpers changed (non-weakening): workflow-shape.test.ts trackerBlocks/unguardedIssueCalls/--issue assertion read the rendered workflow; workflow-fence-syntax.test.ts parses github and none renders (.bkit/core/engine/render/trackers.test.ts, .bkit/core/workflows/)
DONE — Gap 2: Q7 continuity line missing — added to § Best-effort runs No-issue bullet: naming the issue-less FID in the next prompt keeps continuity, a reworded prompt mints a new FID and the attempt counter restarts (.bkit/core/.bkit/workflows.md)
DONE — Gap 3: Open Question 5 line missing — added to § Branch eligibility: the shared-checkout record is a start snapshot, so a clean path edited mid-run by someone else is committed as the run own; the lock and exit 13 stop parallel bkit runs, not people (.bkit/core/.bkit/workflows.md)
DONE — Gap 4: trackers.md rows not swept — pr-body-metadata row, Linear note and Jira note now cover issue-less runs (FID-only marker gives issueId null, /bkit-auto fails closed); added an Inline form paragraph under § Conditional blocks (.bkit/core/.bkit/trackers.md)
