Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 9
Plan: docs/plans/202610/748-brand-every-consumer-plan.md
Group: 3
Verify attempt: 1

**Q1 — Task 7 [upgrade.integration.test.ts: second-upgrade output check]:** The new migration for hook and CI script names is built and works, but one of its planned tests can never pass as written. It demands that the second upgrade's whole output never mention `.husky/pre-push`, yet every upgrade of that bare test project prints advisories naming that file. The code step is not allowed to edit a planned test, so should a new task be added to rewrite the check so it looks only at the migration's own log line (`core: .husky/pre-push — branded`)? Yes takes the recommendation.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — The code is correct and the other assertions in the test pass; accepting would leave a test that always fails in the integration run at Step 12.
Decision: Fix now — Yes, fix both

**Q2 — Task 8 [upgrade.integration.test.ts: second-run snapshot check]:** The CI script-file move is built and works, but one planned test can never pass as written. It compares the whole project before and after a second upgrade, and `.claude/bkit-cloud.md` changes on every upgrade by design (a `# cache-bust` counter goes up). Should a new task be added to rewrite the check so that file is left out of the comparison? Yes takes the recommendation.
Options: A) Accept / B) Fix now
Recommended: B) Fix now — The only differing line is the intended cache-bust counter; the migration itself changed nothing on the second run. Accepting would leave an always-failing test.
Decision: Fix now — Yes, fix both

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
