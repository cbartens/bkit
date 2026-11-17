Verdict: PASS
Strategy: FINAL
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: TASK 11 nested-worktree --file accepted — status invocation now also refuses when the git top folder owning --file differs from the issuing top folder; scratch repro with .worktrees/b exits 2 (.bkit/core/engine/commands/workflow/status.ts)
DONE — Gap 2: TASK 10 writes into nested worktree — no invocation can now be issued for a nested worktree's run, so no engine-call row lands there (same fix)
DONE — Gap 3: TASK 1 id bound to nested worktree run — unissuable now (same fix)
DONE — Gap 4: TASK 11 harvest MARK_ROWS parity — added invocation; node --test scripts/harvest/bkit-harvest.test.mjs 61/61 pass (scripts/harvest/bkit-harvest.mjs)
DONE — Group gate: exit 0 (bkit tests changed --base=origin/dev, gate bkit:gate:changed PASS)
