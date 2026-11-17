Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/920-build-agents-run-plan.md

**Q1 — TASK 5 [.bkit/core/.agents/rules.md:121] — two shared rules now contradict each other:** Two rules that agents read now disagree. 'Local tests first' says to exhaust the local test suite. The reworded 'Local pre-commit' (this issue's change) says never run the full suite while working. Four prompts (bkit-build-plan-tasks, bkit-build-plan-verify, bkit-build-plan-gaps-remediate, bkit-debug-failure-reproduce) carry the first, and three of them carry both. Fixing it means rewording 'Local tests first', a second shared rule outside this plan. Which do you want: Accept leaves both rules as they are and records that you accepted the clash; Fix now rewords 'Local tests first' to 'the affected local tests and a targeted repro' so it matches the new rule (tell me if you want different wording); Stop ends the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Rewording a second shared rule changes what every build and debug agent is told to do, so only the owner can pick the wording.
Fix task: 5
Decision: Fix now — Owner: B; the intent must remain to only run relevant tests, the full suite only runs on pre-push

**Q2 — TASK 6 [.bkit/core/engine/commands/ci/ci.ts:614] — audit reports can reach dev with no CI scan:** The list of paths that count as 'only files bkit writes' now includes docs/audits/**. That same list also feeds the pre-push hook's rule that lets a [skip ci] push to dev or main through. So an audit report (written from untrusted logs and CI output) can now land on dev with every workflow skipped, including the bkit-trivy secret scan. If a report quoted a leaked token, nothing would scan it. This comes from the #915 work that reached this branch through the branch sync, not from #920 itself. Which do you want: Accept allows it and records the risk in docs/decisions.jsonl and docs/security.md; Fix now gives the skip-CI rule its own narrower list so audit reports keep the light local gate but still need a CI run on dev and main; Stop ends the run here.
Options: A) Accept / B) Fix now / C) Stop
No recommendation — Whether audit reports may skip the secret scan on dev is a security trade-off only the owner can make.
Decision: Accept — Owner: A

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
