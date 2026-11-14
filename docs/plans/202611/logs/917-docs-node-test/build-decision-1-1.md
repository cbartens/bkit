Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/917-docs-node-test-plan.md
Holistic attempt: 1

**Q1 — Holistic gap: the new pointer leads consumers nowhere:** The two rewritten bullets in the shared workflow doc (.bkit/core/.bkit/workflows.md:1802 and :1804) tell readers to see docs/testing.md § Test first for per-runner commands. bkit's own docs/testing.md has that section, but a consumer's docs/testing.md starts from the starter template, which has no § Test first and no Node command, and the shipped command list (.bkit/core/.bkit/templates.md:197-201) lists only Vitest and jest. So in a consumer repo the pointer leads nowhere and the Node command reaches no consumer. The issue named .bkit/shared/docs/testing.md, which does not exist. Accept leaves it as built; Fix now adds a new task, and you say which way: (a) point both bullets at .bkit/templates.md and add the Node lines there, or (b) add a § Test first to the starter .bkit/templates/docs/testing.md. Either touches files the plan does not list. What do you want?
Options: A) Accept / B) Fix now / C) Stop
Decision: Fix now — B - b and note in 887 (option b: add a § Test first to the starter .bkit/templates/docs/testing.md; leave a note on #887)
Fix task: 3
No recommendation — The two fixes change different shipped surfaces (the command list in .bkit/templates.md versus the starter testing doc), and the plan's TASK 2 names docs/testing.md as its target, so only the owner can say which surface should carry the Node command.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
