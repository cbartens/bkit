Verdict: FAIL
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1 (partial): pre-push-direnv tip text now names the log block and the .bkit/.env unset block; planned test "pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc" restored to the tests-step version, so fires() is back to "direnv exec" absent only (firing on a missing unset loop contradicts that planned test); dist rebuilt (.bkit/core/engine/checks/tips/catalogue.ts, dist/checks/tips/catalogue.js)
DONE — Gap 2: decisions.jsonl:802 ts replaced with real millisecond ts 1794441939244, firstTs/updates kept; ledger-integrity.test.ts passes (docs/decisions.jsonl)
BLOCKED — Group gate: bkit tests changed --base=origin/dev gate run 1 exited 1 (output was truncated by tail; cause unseen), run 2 hung 45+ min on an orphan `git hash-object -w --stdin` (pid 56855) in a vitest worker; kill was denied by the permission classifier. catalogue.test.ts passes directly (64 tests) after the restore.
