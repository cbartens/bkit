Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 9
Plan: docs/plans/202611/864-move-project-docs-plan.md
Group: 1
Verify attempt: 2

**Q1 — Task 1 — the 'second upgrade changes nothing' test fails:** One planned test for the migration says that running the upgrade a second time must change nothing, but it compares every file in the test repo. Two files legitimately differ on every run: .claude/bkit-cloud.md (a cache-bust counter that goes up on every upgrade, on purpose) and .bkit/advisories.md (its Mode line reads 'check' then 'upgrade'). The project docs, the doc index and .bkit/version are identical between runs. The code fixer cannot touch a planned test, so it blocked twice. Should we fix it by having the test leave those two files out of the comparison (test: upgrade.integration.test.ts 'migrates legacy ownership without changing project text or core ownership')? Yes fixes the test; Accept leaves the test failing.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — The behaviour is correct and by design; only the test's snapshot is too broad, and nothing else in group 1 is open.
Decision: Fix now — "Yes, fix now"

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
