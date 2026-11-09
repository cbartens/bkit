Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` "routes Claude notebook and shell targets through shared advice" | red | passed |
| 7 | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "routes Cursor delete and shell targets without replacing its driver" | red | not passed |
| 8 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "routes Codex complete patches and initial shell commands" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "routes Antigravity multi-replace and shell targets" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "preserves OpenCode edit coverage and after-execute boundary" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "leaves Antigravity targets eligible when retry transport cannot deliver" | red | passed |

## Gaps

- Task 7 `not-green` — "routes Cursor delete and shell targets without replacing its driver" failure: expected '// bkit:end\n\n// --- driver (yours) …' to contain 'emit({ permission: "allow", additiona…' — Fixable: true — log: TASK 7: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `routes Cursor delete and shell targets without replacing its driver` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`

```
+         ),
+       },
+       session_id: cursorPayload.session_id || cursorPayload.conversation_id,
+     });
+     if (result) {
+       emit(
+         result.mode === "deny"
+           ? { permission: "deny", agent_message: result.context, user_message: result.context }
+           : { permission: "allow", additional_context: result.context },
+       );
+     } else {
+       emit({ permission: "allow" });
+     }
+   } else {
+     emit({ permission: "allow" });
+   }
+ } catch {
+   // Fail open — any error emits a bare allow.
+   emit({ permission: "allow" });
+ }
+

 ❯ .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts:255:20
    253|     const driver = src.slice(src.indexOf("// bkit:end"));
    254|     expect(driver).toContain("resolveAgainstWorkspace(");
    255|     expect(driver).toContain('emit({ permission: "allow", additional_c…
       |                    ^
    256|     expect(driver).toContain(
    257|       'emit(\n        result.mode === "deny"\n          ? { permission…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 14 passed (15)
   Start at  21:51:57
   Duration  949ms (tests 97%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-yvBr6v/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
