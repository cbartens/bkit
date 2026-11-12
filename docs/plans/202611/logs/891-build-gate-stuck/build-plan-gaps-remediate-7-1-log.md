Verdict: PASS
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: Task 20 rerun refusal now collects undecided questions first and names them all (Q1 included when no loop question) (.bkit/core/engine/commands/workflow/decisions.ts)
DONE — Gap 2: Task 20 Decision Pause 'Resume into a red-gate pause' bullet now conditions the re-run on the loop question being the only undecided one, with step 3 fallback; mirror refreshed via bkit upgrade (.bkit/core/.bkit/workflows.md, .bkit/workflows.md)
