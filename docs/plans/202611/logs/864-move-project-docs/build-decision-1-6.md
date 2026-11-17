Status: DECIDED
Question: UNPROVEN
From: summary
Pause step: 15
Plan: docs/plans/202611/864-move-project-docs-plan.md

**Q1 — Task 1 — migrates legacy ownership without changing project text or core ownership:** This test checks that upgrading an old install moves bkit's ownership records over without rewriting the project's own doc text, without losing Windows line endings or edits around a wrapper, and without writing twice. It was never seen failing before the migration code existed: the tests step recorded it as vacuous (passing at its red step), so nothing shows it would catch the bug it was written for. It passes now in the full test run. Accept keeps the test as it is and records your reason in the plan; Stop ends the run here with a handover. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — The test passes in the full test run on this branch, and the whole-plan check judged Task 1 satisfied; the missing red proof is the only gap.
Decision: Accept — Yes, accept both

**Q2 — Task 5 — resolves an indexed equivalent without a missing default warning:** This test checks that when the doc index points at a different file for a topic (an equivalent of the default doc), check accepts it, raises no missing-default warning, and never reads a file outside the repo. It was never seen failing before its code existed: at its red step it crashed on a test-setup error (vitest refused to spy on node:fs) before the detector ran, so the tests step recorded it as vacuous; a later round repaired the setup and it now passes. Accept keeps the test and records your reason in the plan; Stop ends the run here with a handover. Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
Recommended: A) Accept — The repaired test passes in the full test run and still asserts the equivalent is resolved with no out-of-tree read; the missing red proof comes from the setup crash, not from the assertion.
Decision: Accept — Yes, accept both

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
