Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 3: Added --next-step to workflows fail (workflows.ts), cli.md regenerated, build + upgrade ran; workflows.test.ts passes (165). graph:refresh ran and graph:check exits 0, but the refresh reads the staged tree and nothing is staged (no git add allowed here), so the caller must stage the engine edits and re-run pnpm bkit:graph:refresh before commit (docs/capabilities.md)
DONE — TASK 4: NEXT_STEP held and routed in bkit-ship.md (Step 2, Step 10, Merge Question, Step 12 Route, Failure Path); instructions.md synced, bkit-ship.none.txt regenerated, mirrors upgraded; ship-invariants, workflow-shape, trackers, instructions-coverage pass (462). tsc, lint, format:check, bkit:slop:delta run individually (not bkit tests changed)
