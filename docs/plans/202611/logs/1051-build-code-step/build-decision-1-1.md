Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/1051-build-code-step-plan.md

**Q1 — Task 3 (`.bkit/core/engine/commands/workflow/steps.ts:1437`):** When a code step's `bkit:generate` fails (the agent handed back a FAIL with a `BLOCKED — bkit:generate` line, or a HANDOVER mid-edit), finish now exits 16, and no workflow has a route for 16, so the whole build ends on the Failure Path where the step used to land and the fix loop ran. Someone has to choose the cure: route exit 16 in the frozen build workflow, let a FAIL or HANDOVER step land its row despite the failing generate, or report the failure as exit 8, which already has a fix-and-re-run route. Accept the gap for now, fix it now, or stop?
A) Accept — the gap is recorded as accepted and the build moves on; a failing generate at a code step's finish ends the run until a follow-up routes it
B) Fix now — one more fix round builds the cure the owner names before the build moves on
C) Stop — the run ends here with a handover; the next run resumes here
Recommended: none — Option (a) edits the frozen `.bkit/core/workflows/bkit-build.md`, and options (b) and (c) change the exit-16 contract this plan set and the brief's rule that exit 8 means a hook refusal, so only the owner can choose.
Default if unanswered: the run waits for you; the run stops when nobody can be asked

**Q2 — Task 4 (`.bkit/core/engine/commands/workflow/steps.ts:1679`):** This repo's `bkit:generate` runs `bkit upgrade`, which writes any missing seeded `bkit.workflows` default into `package.json`, and finish now runs it before the `bkit.workflows` check; so a build whose engine change adds a new seeded default is refused with exit 13 on every finish, because restoring the file as the message says is undone by the next generate. Someone has to rule whether a `bkit.workflows` change that generate itself made may ride a code step's commit, or whether the check runs first and refuses it with its own message. Accept the gap for now, fix it now, or stop?
A) Accept — the gap is recorded as accepted and the build moves on; a build that adds a seeded default commits `package.json` by hand
B) Fix now — one more fix round builds the rule the owner names before the build moves on
C) Stop — the run ends here with a handover; the next run resumes here
Recommended: none — It needs a ruling on `.bkit/core/.bkit/workflows.md:1028` ("A step commit never changes them") for generated output, which only the owner can give.
Default if unanswered: the run waits for you; the run stops when nobody can be asked

Owner (2026-11-20):
> Q1: B, Fix now (orchestrator's answer): a failing bkit:generate never refuses a code step's finish, whatever the verdict; finish logs it, prints generate: failed, appends one friction row, then lands the step as before this build; exit 16 is removed.
> Q2: B, Fix now. The owner, to the option "Yes, let it ride": "Ok but only as exception on bkit repo not in consumer repos" (relayed by the orchestrator; decision row on local dev at ce7e5b5c8).
