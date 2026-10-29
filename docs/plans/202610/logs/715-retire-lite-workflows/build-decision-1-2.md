Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 9
Plan: docs/plans/202610/715-retire-lite-workflows-plan.md
Group: 5
Verify attempt: 1

**Q1 — TASK 11 `derives held from a workflow-done row ending held`: no failing-first proof:** This test lives in `scripts/harvest/bkit-harvest.test.mjs`, a file run by plain node (`pnpm test:harvest`), which the build's red-recording tool cannot run (it only sees vitest files), so no recorded failing run exists. The builder reports seeing it fail under node before writing the code, and the verifier confirmed the test fails against the old harvest script and passes now. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Decision: Accept — Accept all
No recommendation — Only the owner can vouch for a test-first order the record cannot prove.

**Q2 — TASK 11 `counts held runs in the workflow report`: no failing-first proof:** This test lives in `scripts/harvest/bkit-harvest.test.mjs`, a file run by plain node (`pnpm test:harvest`), which the build's red-recording tool cannot run (it only sees vitest files), so no recorded failing run exists. The builder reports seeing it fail under node before writing the code, and the verifier confirmed the test fails against the old harvest script and passes now. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Decision: Accept — Accept all
No recommendation — Only the owner can vouch for a test-first order the record cannot prove.

**Q3 — TASK 11 `keeps a normal done run as done`: no failing-first proof:** This test lives in `scripts/harvest/bkit-harvest.test.mjs`, a file run by plain node (`pnpm test:harvest`), which the build's red-recording tool cannot run (it only sees vitest files), so no recorded failing run exists. The builder reports seeing it fail under node before writing the code, and the verifier confirmed the test fails against the old harvest script; this third test guards existing behaviour so it could never fail first. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Decision: Accept — Accept all
No recommendation — Only the owner can vouch for a test-first order the record cannot prove.

**Q4 — TASK 11 `derives held from a workflow-done row ending held`: green tool cannot run it:** The tool that checks planned tests are green only runs vitest, so it reports this node-run test as 'did not run' even though `node scripts/harvest/bkit-harvest.test.mjs` passes 60/60. Accept it with `pnpm test:harvest` as the proof (recorded as your TEST EXCEPTION), or leave it open? Fixing it properly means teaching the test tool to run `.mjs` files, which is outside this issue.
Options: A) Accept / B) Fix now
Decision: Accept — Accept all
Recommended: A) Accept — The test passes and Task 16 already runs `pnpm test:harvest`; the only alternative is changing the shared test tool, which belongs to its own issue.
Decision: Accept — Accept all

**Q5 — TASK 11 `counts held runs in the workflow report`: green tool cannot run it:** The tool that checks planned tests are green only runs vitest, so it reports this node-run test as 'did not run' even though `node scripts/harvest/bkit-harvest.test.mjs` passes 60/60. Accept it with `pnpm test:harvest` as the proof (recorded as your TEST EXCEPTION), or leave it open? Fixing it properly means teaching the test tool to run `.mjs` files, which is outside this issue.
Options: A) Accept / B) Fix now
Decision: Accept — Accept all
Recommended: A) Accept — The test passes and Task 16 already runs `pnpm test:harvest`; the only alternative is changing the shared test tool, which belongs to its own issue.
Decision: Accept — Accept all

**Q6 — TASK 11 `keeps a normal done run as done`: green tool cannot run it:** The tool that checks planned tests are green only runs vitest, so it reports this node-run test as 'did not run' even though `node scripts/harvest/bkit-harvest.test.mjs` passes 60/60. Accept it with `pnpm test:harvest` as the proof (recorded as your TEST EXCEPTION), or leave it open? Fixing it properly means teaching the test tool to run `.mjs` files, which is outside this issue.
Options: A) Accept / B) Fix now
Decision: Accept — Accept all
Recommended: A) Accept — The test passes and Task 16 already runs `pnpm test:harvest`; the only alternative is changing the shared test tool, which belongs to its own issue.
Decision: Accept — Accept all

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
