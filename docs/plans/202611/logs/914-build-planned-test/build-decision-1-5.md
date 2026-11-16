Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/914-build-planned-test-plan.md
Holistic attempt: 4

**Q1 — Holistic gap 1 — Task 7 capabilities check fails in this worktree [docs/capabilities.md:175]:** The capabilities register check (`pnpm bkit:graph:check`) fails in this worktree, but the check that pre-push and CI run (`scripts/graphify/bkit-graphify.sh check-at HEAD`, a rebuild from a clean checkout of the committed tree) passes. The difference comes from files present only in this worktree, not from the committed register. Accept keeps the register as committed and records your reason. Fix now adds a fix task to find the local file and make the plain check pass here too.
Options: A) Accept / B) Fix now
Recommended: A) Accept — The committed register matches a clean rebuild, which is what pre-push and CI check; the local mismatch is not in the branch.
Decision: Accept — "Get this unblocked and build finished"; recommendation taken

**Q2 — Holistic gap 2 — load flake in guardrails-cursor linear-time test [.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts:704]:** A timing test outside this feature took 1371 ms against its 1000 ms limit while the machine was short on resources. It passes on its own, and the flake is already recorded in docs/failures.jsonl. Accept records it as not caused by this build. Fix now adds a fix task to change that test or its budget.
Options: A) Accept / B) Fix now
Recommended: A) Accept — No task touches the file, it passes alone, and the recurrence is recorded under its existing failures key.
Decision: Accept — "Get this unblocked and build finished"; recommendation taken

**Q3 — Holistic gap 3 — load flake in locks dead-process reclaim test [.bkit/core/engine/commands/workflow/locks.test.ts:152]:** A lock test outside this feature read an empty lock record once under load. Its file passes 23 of 23 on its own, and the flake is already recorded in docs/failures.jsonl. Accept records it as not caused by this build. Fix now adds a fix task to make that test stable.
Options: A) Accept / B) Fix now
Recommended: A) Accept — No task touches locks.ts, the file passes alone, and the recurrence is recorded under its existing failures key.
Decision: Accept — "Get this unblocked and build finished"; recommendation taken

**Q4 — Holistic gap 4 — load flake in bkit-test-awake SIGHUP sub-test [.bkit/core/engine/audits/templates/ci-scripts.test.ts:130]:** A shipped CI-script test outside this feature failed one timed sub-test under load. It passes on its own, and the fix round recorded it in docs/failures.jsonl as a new load flake. Accept records it as not caused by this build. Fix now adds a fix task to make that sub-test stable.
Options: A) Accept / B) Fix now
Recommended: A) Accept — No task touches bkit-test-awake, it passes alone, and the flake is now recorded for the failures sweep.
Decision: Accept — "Get this unblocked and build finished"; recommendation taken

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
