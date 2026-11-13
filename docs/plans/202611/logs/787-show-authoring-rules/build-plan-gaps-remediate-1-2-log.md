Verdict: CONCERNS
Strategy: PIVOT
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: isDynamicWord pass-through wrapper — inlined cmd.dyn.has at 10 callers, slop:delta net 0 (.bkit/core/hooks/guardrails-shell.js)
DONE — Gap 2: no-conditional-in-test — lstat fake uses index lookup, Date.now fake uses mockReturnValueOnce; oxlint clean (.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts)
BLOCKED — Group gate: only the 3 T6 mirror-freshness tests fail (expected until orchestrator bkit upgrade); lint and slop:delta clean
