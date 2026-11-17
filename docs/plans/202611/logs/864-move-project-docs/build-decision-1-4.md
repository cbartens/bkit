Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 9
Plan: docs/plans/202611/864-move-project-docs-plan.md
Group: 2
Verify attempt: 2

**Q1 — Task 5 — one planned test cannot run:** One planned test for the new documentation warnings never gets as far as checking anything: it tries to watch file reads in a way the test tool does not allow for this kind of module, so it stops with an error before the warning code runs. The warning code itself passes every other check (a copy of the test with only that watching step replaced passed 36 of 36). The code fixer is not allowed to change a planned test, so it was blocked twice. Should we fix it by having the tests step rewrite how that one test watches file reads, keeping what it asserts the same (test: tools.test.ts 'resolves an indexed equivalent without a missing default warning')? Yes fixes the test; Accept leaves the test failing.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — The behaviour is correct; only the way the test watches file reads is invalid, and nothing else in group 2 is open.
Decision: Fix now — "B"

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
