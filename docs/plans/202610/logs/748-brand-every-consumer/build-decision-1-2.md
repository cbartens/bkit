Status: DECIDED
Question: UNPROVEN
From: summary
Pause step: 15
Plan: docs/plans/202610/748-brand-every-consumer-plan.md

**Q1 — Task 7 [upgrade.integration.test.ts: copy-and-own migration writes record no canonical hash and a second upgrade writes nothing]:** This planned test was replaced earlier in this run, at your decision, by a rewritten test under Task 13, because the original could never pass: every upgrade of that bare test project prints advisories naming `.husky/pre-push`. The original title never ran, so nothing shows it could ever have caught a bug. Its replacement (Task 13) also passed on its first run, because the migration it checks was already built. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — You already chose to replace this test; the replacement runs and passes. Nothing else would be learned by keeping the original title.
Decision: Accept — owner: "Yes" (replaced by Task 13 at the owner's decision)

**Q2 — Task 8 [upgrade.integration.test.ts: a second template-file migration and a dry run write and move nothing]:** This planned test was replaced earlier in this run, at your decision, by a rewritten test under Task 14, because the original compared the whole project before and after a second upgrade, and `.claude/bkit-cloud.md` changes on every upgrade by design. The original title never ran. Its replacement (Task 14) also passed on its first run, because the migration it checks was already idempotent. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — You already chose to replace this test; the replacement skips only the intended cache-bust counter and passes.
Decision: Accept — owner: "Yes" (replaced by Task 14 at the owner's decision)

**Extra (asked in chat, not a numbered item):** the regex hang at `core.ts` `renameScriptTokens`. Owner: "Yes, fix hang". Added as Task 23 in group 8.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
