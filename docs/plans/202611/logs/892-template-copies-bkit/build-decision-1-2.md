Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/892-template-copies-bkit-plan.md

**Q1 — Task 4 [.bkit/core/engine/install/template-copies.ts:81]:** Some consumers will have every commit fail after they upgrade. These are repos that installed lint-staged (the tool that tidies staged files on commit) but never copied its sample config to the repo root. Today lint-staged quietly finds the sample at .bkit/templates/.lintstagedrc.json and treats it as the config, so their commit check runs and does nothing. After upgrade that sample is renamed, lint-staged finds no config at all, and it stops with "Configuration could not be found", which fails the pre-commit hook. bkit already has a build-workflow tip (lint-staged, in .bkit/core/engine/checks/tips/catalogue.ts) that fires when the root has no lint-staged config and says to copy lintstagedrc.example.json to .lintstagedrc.json. Accept records the break as known, relying on that tip and the upgrade's 'removed' line. Fix now adds a task that writes a failing test first and then either adds an upgrade/check advisory naming the missing root config, or a migration that copies the sample to the root; your reply can say which. Stop ends the run here. What do you want to do?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The plan records 'No new migration', and .agents/rules.md § Migrations needs the owner to confirm any migration, so whether to accept the break, add an advisory, or add a migration is a scope call no agent can make.
Decision: Fix now — B, migration

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
