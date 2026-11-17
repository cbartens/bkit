Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 7: failVerb refuses a bad --next-step with exit 6 (EXIT_NEXT_STEP_REFUSED, listed in the verb's exitCodes and the Failure Path docs); bkit-ship.md Failure Path re-runs without --next-step only on exit 6; two older tests updated to exit 6; mirrors, instructions.md, bkit-ship.none.txt regenerated. tsc, lint, format:check, slop:delta and workflows/audits/render/tools vitest run individually (not bkit tests changed). Capability register: exitCodes text changed in workflows.ts, so docs/capabilities.md may need a refresh after commit.
