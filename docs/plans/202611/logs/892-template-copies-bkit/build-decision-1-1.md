Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/892-template-copies-bkit-plan.md
Holistic attempt: 1

**Q1 — Changed-files format check trips on the vitest skill symlink:** The changed-files check runs prettier on every file this branch changes. The workflow's skill install added the symlink `.claude/skills/vitest`, and prettier refuses a symlink named on its command line, so `bkit tests changed` exits 1 in its `format` stage. Every other stage passes, and the pre-push `format:check` is not affected. Your local `dev` already has the fix (`3b341024d fix(890): skip symlinks in the changed-files format check`), but it is not pushed, so this branch, cut from `origin/dev`, lacks it. Accept leaves the gap as it is and records why; the gap goes away once #890 reaches `origin/dev`. Fix now adds a task to this plan that changes the gate script or drops the symlink. Stop ends the run here. What do you want to do?
Options: A) Accept / B) Fix now / C) Stop
No recommendation — The plan covers neither the gate script nor the skill install, so the choice between waiting for the #890 fix, duplicating it on this branch, or dropping the symlink is a scope call for the owner.
Decision: Accept — A)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
