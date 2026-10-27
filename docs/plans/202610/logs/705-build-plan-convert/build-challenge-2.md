Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `bkit status resume`'s own field docs — and five more engine comments — still call Build Challenge "Step 10" and Run Tests "Step 11": an agent reading the engine's spec for `challengeRound` / `challengeDone` is told the old numbers, the same mismatch class #705 eliminated from the workflow
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/status.ts:468`
  - **DONE WHEN:** every engine string naming a build step number agrees with `WORKFLOW_STEPS.build`: `status.ts:468` (`challengeRound` — "the round Step 11's challenge runs as") and `status.ts:470` (`challengeDone` — "Step 11 goes on to Step 12"), both agent-facing output descriptions; plus the comment spots made stale by the same renumber — `challenge.ts:53` ("The reviewers Step 11 runs."), `manifest.ts:252` and `manifest.ts:286` (Run Tests is Step 12), `checks/before/repo.ts:186` ("`/bkit-build` Step 4 converts it"), and `checks/after/index.ts:365` ("build Step 16", already off by one before this change and moved further). Routing is untouched (resume is name-keyed); the listed spots are docs, but two of them are the CLI's printed field docs.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `status resume's output descriptions name the challenge's current step numbers` fails on the `challengeRound` / `challengeDone` descriptions naming Step 10 and Step 11 while the table numbers Build Challenge 11 and Run Tests 12

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A Decision Pause composed before the renumber resumes with its recorded `Pause step` and posts `Step {old N} — Decision Pause`: a run paused across the upgrade comments the paused step's old number (e.g. a verify pause written as 7 posts under Plan Execute's new 7), the exact comment-number drift #705 set out to kill, in a one-release window
      **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:279`
  - **DONE WHEN:** the owner decides whether `decisions compose` records the paused step's NAME beside its number so the read-back can translate to the current number, with number-only files from before the change accepted as a transient. No agent can settle it: pause files already written hold only the old number, so no mechanical translation exists for them; routing is unaffected (`from` / `route` are name-keyed, so the run still resumes at the right step); the decision is whether a one-upgrade comment cosmetic justifies a decision-file schema change.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `a resumed decision posts the paused step's current number` fails on a decision file whose `Pause step` predates the renumber finishing with that stale `--number=` while `WORKFLOW_STEPS.build` has since moved the step (only writable if the owner takes the schema option; otherwise it documents the accepted transient)

<!-- bkit:task 2 end -->
