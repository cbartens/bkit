Question: CHALLENGE
From: challenge
Pause step: 11
Plan: docs/plans/202611/1051-build-code-step-plan.md

**Q1 — Task 5 (`.bkit/core/engine/commands/workflow/steps.ts:1718`):** In bkit's own repo, the round-1 fix that lets a generated added `bkit.workflows` key ride the code step's commit does not work in the normal flow. The code agent's prompt tells it to run `pnpm bkit:generate` itself, and that run's `bkit upgrade` writes the new seeded key into `package.json` before finish takes its "before generate" reading. So finish sees the key as the step's own edit and exits 13. A key left behind by a finish the hook refused (exit 8) does the same on the re-run. No build step routes exit 13, so the run ends on the Failure Path. The working tree alone cannot tell a hand-written key from one an earlier generate run left behind, so the cure needs a design choice: (a) every refusal after finish's own generate puts `bkit.workflows` back to the pre-generate reading, and the prompts' own generate step is removed later (prompts are frozen in this run); (b) in bkit's own repo every added key rides the commit, hand-added ones included, which widens the owner's round-1 exception; or (c) exit 13 gets a route in the frozen build workflow. Accept the gap for now, fix it now, or stop?
A) Accept — the item is recorded as accepted and the build moves on; a bkit build whose engine change adds a seeded default still hits exit 13 until a follow-up fixes it
B) Fix now — one more fix round runs before the build moves on, building the cure the owner names
C) Stop — the run stops and hands over; the next run resumes here
Recommended: none — Each cure either changes a frozen file (prompts or the build workflow), widens the owner's round-1 exception, or redesigns task 4's own-edit test, so only the owner can choose.
Default if unanswered: the run waits for you; the run stops when nobody can be asked

Owner (2026-11-20):
> Q1: B, fix now. This is the orchestrator's decision (recorded as an assumption for the owner), not the owner's words. It keeps the owner's round-1 exception exactly as it is: only a key that generate itself adds rides, only in bkit's own repo. None of (a), (b), (c) as written; the cure is to define "generated" by what generate produces from HEAD, not by when the key appeared.
