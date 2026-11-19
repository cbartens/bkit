Verdict: FAIL
Strategy: STANDARD
Fixed: 0

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap 1: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` — TASK 32 expected the owner reason inside the status row answer; TASK 33 forbids any --reason-file text in a status row, so the assertion at line 1851 was replaced by `^Accept — ` plus a not-contains "fine" check (reason lives in the docs/decisions.jsonl rationale)
DONE — Gap 1: stale assertion replaced; decisions.test.ts 87 passed; no source change, nothing removed
BLOCKED — Gap 2: `applyRecommendations` returns `{n, line}` text; returning rows would break planned test decisions.test.ts `a lettered recommendation still settles its item by name` (asserts `.decisions[0].line`), and I may edit no other planned test; left open
BLOCKED — Gap 3: `apply --by=rerun` answer `Re-run gate — …`; changing it to `Try again` would break planned tests decisions.test.ts lines 225 and 250 (assert `^Re-run gate`), and I may edit no other planned test; left open
DONE — Gap 1: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` put back as the tests step left it, because takeover TASK 44 rewrites it in its own tests step; not fixed in this round
