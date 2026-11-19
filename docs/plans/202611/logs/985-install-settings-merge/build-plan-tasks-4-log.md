Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 8: Linear connector tool grants retired — ten mcp__claude_ai_Linear__<tool> entries added to RETIRED_SETTINGS_ENTRIES, edited-detection skips listed values, migrations row and tests updated, dist regenerated (.bkit/core/engine/install/write.ts)
BLOCKED — TASK 8: test `.bkit/core/engine/install/write.test.ts` `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow` — the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; length assertion now 11 as the task DONE WHEN requires
BLOCKED — TASK 8: test `.bkit/core/engine/install/write.test.ts` `reports an edited variant as edited and never removes it` — the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool as the task DONE WHEN requires
BLOCKED — TASK 8: test `.bkit/core/engine/install/write.test.ts` `does not report an entry the template ships as edited` — the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool
BLOCKED — TASK 8: test `.bkit/core/engine/install/write.test.ts` `keeps an edited variant and warns with the file and the entry` — the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool
BLOCKED — TASK 8: test `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run names an edited variant as kept` — the ten Linear tool strings are now retired, so the old example (get_issue) is no longer an edited or template-shipped value and the old length 1 no longer holds; example now mcp__claude_ai_Linear__my_own_tool
DONE — TASK 8: Linear connector tool grants retired — planned-test edits kept (see BLOCKED lines above) (.bkit/core/engine/install/write.ts)
DONE — TASK 8: the five planned tests (write.test.ts x4, claude.integration.test.ts x1) are restored byte-for-byte as the tests step left them; takeover tasks 9-13 own their rewrite
