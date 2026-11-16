Verdict: CONCERNS
Strategy: FINAL
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: capabilities register (Task 7) — pnpm bkit:graph:refresh wrote no change; `bash scripts/graphify/bkit-graphify.sh check-at HEAD` (the pre-push/CI check, clean checkout) exits 0 "matches a rebuild at 99cbd5cbe"; the 412/407 diff of local `graph:check` comes from untracked/ignored local state in this worktree, not committed drift (docs/capabilities.md unchanged)
DONE — Gap 2: guardrails-cursor linear-time load flake — recurrence recorded under key guardrails-cursor-linear-time-test-1s-budget-under-load (docs/failures.jsonl)
DONE — Gap 3: locks.test.ts dead-process reclaim load flake — recurrence recorded under key locks-dead-process-identity-reclaim-flake (docs/failures.jsonl)
DONE — Gap 4: ci-scripts bkit-test-awake SIGHUP sub-test load flake — new key ci-scripts-awake-sighup-cleanup-subtest-load-flake (docs/failures.jsonl)
DONE — Group gate: n/a (none named); bkit tests changed passed on rerun (verdict PASS); first run failed tracker.integration.test.ts comment-boundary timeout at 52200 ms, passes alone in 34 s, recorded as tracker-integration-comment-boundary-fault-timeout-under-load (docs/failures.jsonl)
