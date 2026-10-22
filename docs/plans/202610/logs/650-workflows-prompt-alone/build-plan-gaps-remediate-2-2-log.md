Verdict: PASS
Strategy: PIVOT
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: Gate 1 item unsatisfiable for an issue-less run under none — reworded workflow-gate-issue-id to "Issue resolved (`ISSUE_ID` non-empty, the no-issue warning emitted, or no tracker wired)", previous text kept in the retired block, ran pnpm wording:sync (5 workflows rewritten), none baselines refreshed (.bkit/wording.md, .bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md)
DONE — Gap 2: none-only Format line in bkit-debug Step 1 sub-step 4.4 — dropped the false block; dropping it alone made the none render emit the generic "No tracker connected, skip step." stub, so the github/linear/jira format group is wrapped in a true block (wired renders byte-identical before/after, none render loses the line and gains no stub); baseline regenerated with vitest -u on render/trackers.test.ts only (.bkit/core/workflows/bkit-debug.md, .bkit/core/engine/render/**snapshots**/bkit-debug.none.txt)
