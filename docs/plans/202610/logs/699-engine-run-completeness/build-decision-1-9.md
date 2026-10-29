Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202610/699-engine-run-completeness-plan.md
Group: 8
Verify attempt: 2

build verify: attempt 2 of 2

## Progress

Problems after each round: 1 → 2
Code changed: yes
Strategy: STANDARD → next PIVOT
Minutes per round: 22
Trend: worse

**Q1 — Verify:** decide the items below instead of another round? More problems than the first round.
Options: A) Try again / B) Decide
Recommended: B) Decide — another round is unlikely to close the remaining items
Decision: Decide — yes

**Q2 — TASK 15 [docs/capabilities.md] the capability register is out of date after the rebase:** Rebuilding the register from a clean copy of the current branch gives different diagram edge counts than the committed file (issues to tracker 33 vs 37, lib to journal 12 vs 13, workflows to run_facts 29 vs 30). I regenerated it from a local graph built before the rebase finished. CI and the pre-push check run this same comparison, so pushing as is would go red. The fix is to rebuild with `pnpm graph:refresh` and commit the file. Fix it now, or accept the drift?
Options: A) Fix now / B) Accept
Recommended: A) Fix now — The push check fails otherwise and the fix is one command.
Decision: Fix now — yes

**Q3 — TASK 15 [.bkit/cli.md] the generated command list has no entry for the new completeness command:** One test in the full suite fails: the generated command list in .bkit/cli.md must be current, and it has no `completeness` section because the command was marked safe-to-run-by-hand after the list was last generated. The fix is to run `pnpm cli:sync` and `bkit install`, then commit both results. Fix it now, or accept the failing test?
Options: A) Fix now / B) Accept
Recommended: A) Fix now — A red test in the full suite blocks CI and the fix is mechanical.
Decision: Fix now — yes

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
