Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/814-local-test-limits-plan.md
Holistic attempt: 2

**Q1 — HOLISTIC [guardrails-cursor.integration.test.ts: 1000 ms speed check fails under load]:** In the second whole-feature run, the test `analyses dense script sources in linear time` in `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` failed with `AssertionError: expected 2074 to be less than 1000` (then 2357) at line 704. That line is the test's own stopwatch check, a fixed 1000 ms limit written inside the test, not a Vitest time limit. The machine's load average was about 28-32 during the run, and the test passes 3 out of 3 times when run alone. The file is outside this feature (last changed in `e4377aad7`), and this feature only changes the time limits the test runners enforce, so it did not cause this. Your earlier A answers covered only the two `ENOTEMPTY` tests, which passed this time. Choose Accept to take it as a known flake under load and fix it separately (you write the reason). Choose Fix now to add a new last task that changes that hard-coded 1000 ms check here, and give the direction. Choose Stop to end the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Fixing touches a file the plan never lists, and accepting leaves a known load-sensitive test; the plan does not choose between them, so it is the owner's call.
Decision: Accept — owner answered "A" with no reason given

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
