Verdict: CONCERNS
Strategy: FINAL
Fixed: 3

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: INTEGRATION analysis deadline tripped by machine load — guardrails-shell.js now counts the 200 ms deadline in the process's own CPU time (process.cpuUsage) with a 4x wall-clock backstop; `stops at the cooperative deadline and keeps earlier targets` still green (mock gives +1000 ms wall); guardrails-cursor.integration.test.ts 62/62 at load 22 (.bkit/core/hooks/guardrails-shell.js)
DONE — Gap 2: TASK 1 DONE WHEN rendered-hook cases — same fix; `retains lexical context for nested shell edits` passes under load
DONE — Gap 3: TASK 12 installed copies — ran `upgrade` to re-render the hook copies; `pnpm bkit check` exits 0
BLOCKED — Group gate: tc-h4.log failed "related" at load average ~33 with timeouts in tracker.integration.test.ts (3), check.integration.test.ts (2) and one upgrade.integration.test.ts exit-143 case, none touching this change; tracker + check files pass alone (46/46), the hook test passes. Load-dependent timeouts from other repos' runs on the shared machine; no clean full gate run.
