Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 3: Ship exit-80 arm stops on cancelled/action-required/stale check — new arm before Else (.bkit/core/workflows/bkit-ship.md, instructions.md, snapshots)
DONE — TASK 4: local-pre-commit carried by bkit-debug-failure-reproduce; carrier test detects filtered test runs (.bkit/instructions.md, instructions.test.ts)
DONE — TASK 5: Local tests first reworded to affected tests plus targeted repro, full suite only in pre-push; old wording retired (.bkit/instructions.md, rules.md, 4 prompts)
DONE — gate note: bkit tests changed could not take the tests lock (held 8+ min by worktree 928-tests-lock-hung); instructions.test.ts, ship-invariants.test.ts and render snapshot tests pass locally
