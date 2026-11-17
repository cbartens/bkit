Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/787-show-authoring-rules-plan.md
Holistic attempt: 5

build verify: attempt 5 of 5

## Progress

Problems after each round: 4 → 6 → 3 → 3 → 9
Code changed: yes
Strategy: FINAL → next FINAL (FINAL already used)
Minutes per round: 124
Trend: worse

**Q1 — Holistic verify:** decide the items below instead of another round? More problems than the first round.
Options: A) Try again / B) Decide
Recommended: B) Decide — another round is unlikely to close the remaining items
Decision: Try again — owner said "re-run, try again now, no other tests running"

**Q2 — INTEGRATION [tracker.integration.test.ts] preserves substantive step results under every comment boundary fault:** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q3 — INTEGRATION [tracker.integration.test.ts] keeps clean build progress and completion to two comments:** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q4 — INTEGRATION [check.integration.test.ts] clean install → check exits 0:** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q5 — INTEGRATION [install.integration.test.ts] bkit install --tracker=jira alone switches the tracker on every installed host:** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q6 — INTEGRATION [install.integration.test.ts] bkit install --claude --tracker=github also re-renders the installed cursor host:** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q7 — INTEGRATION [upgrade.integration.test.ts] an install with every host and cloud lane creates no template outside .bkit/templates/:** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q8 — INTEGRATION [upgrade.integration.test.ts] check flags an old marker; upgrade restamps every marker with no conflict; check is then clean:** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q9 — INTEGRATION [upgrade.integration.test.ts] upgrade creates a file a newer release adds to an installed opt-in host (#550):** Accept this load-dependent timeout in an unrelated test as a known flake? The full test run timed out this test at 67,800 ms while other repos' test runs loaded the machine; the same test passed minutes later on the same code, and this change does not touch it. A retry pass cannot count as a full-suite pass under the plan, and no code fix is in scope, so only you can say whether to accept it.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether a timeout under shared-machine load counts as a pass; Fix now would need new timeout or load-handling work the plan keeps separate.

**Q10 — TASK 12 [full-suite gate exits 0]:** Accept that the full-suite gate (bkit tests changed --base=origin/dev) did not exit 0 on this machine, because of the 8 load-dependent timeouts above? Every planned test passes in both runs, bkit check exits 0, and the earlier fresh-install dogfood still covers what ships. Only the plan's full-suite requirement is unmet.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Only you can decide whether the plan's full-suite requirement may be waived for load-dependent timeouts.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
