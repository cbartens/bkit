Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Diff read in full. Checked: the workflow's 16 headings/gates/`--number=`/`--step-number=`/routing jumps/sub-step references, `WORKFLOW_STEPS.build` and `resumePoint` (resume-by-number, `resumeAt`, shared numbers, retired rows), the shipped catalogue versus all five host mirrors and `.bkit/workflows.md` (byte-identical bar the managed marker), the render baseline versus the workflow source, the authored `.bkit/instructions.md` store (clause copies + local `- source:` entries all still present in the workflow), and the `.bkit/version` hashes (recomputed OK for every tracked changed file). No runtime, resume, routing, comment-number or mirror bug found. The defect is the opposite: the renumbering left build-step references in other live files pointing at the old numbers, contradicting the plan's "every cross-reference" claim and the acceptance criterion that no numbered reference disagrees with the step table.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Stale build-step numbers in `docs/deployments.md` survive the renumbering (CI-dispatch / PR-pre-flight pointed at the wrong step)
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `docs/deployments.md:533`
  - **DONE WHEN:** every build-step reference in `docs/deployments.md` matches the new table — the CI-Dispatch Gate site and the open-PR pre-flight both read `build Step 16` (was 15), and no `build Step 15` remains.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `live docs name no build step the table does not carry` fails on `docs/deployments.md:533` / `:535` still reading `build Step 15` against the Close Workflow row at 16

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The shipped cloud doc and its source still say `bkit-build` Step 15 closes the workflow
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/cloud.md:399`
  - **DONE WHEN:** `.bkit/core/.bkit/cloud.md` and its shipped copy `.bkit/cloud.md` both read `bkit-build Step 16` for the close-workflow push, and the two stay byte-identical where they were before.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `live docs name no build step the table does not carry` fails on `.bkit/cloud.md:399` / `.bkit/core/.bkit/cloud.md:399` still reading `Step 15` for close-workflow

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** The plan-task-markers advisory doc points the next build at the old convert step
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/migrations.md:37`
  - **DONE WHEN:** `docs/migrations.md`'s `plan-task-markers-missing` row reads the FID's next `/bkit-build` **Step 4** converts the plan (`@bkit-build-plan-convert`), matching the Plan Convert row at 4.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `live docs name no build step the table does not carry` fails on `docs/migrations.md:37` still reading `/bkit-build` Step 3 for the convert

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `bkit status resume` output help still describes the challenge as Step 10
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/status.ts:468`
  - **DONE WHEN:** the `challengeRound` description reads "the round Step 11's challenge runs as" and the `challengeDone` description reads "so Step 11 goes on to Step 12" — matching `WORKFLOW_STEPS.build` (challenge 11, Run Tests 12). Rebuild `dist/` in the same commit (engine TS edited).
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `the resume output help names the challenge's current step` fails on the descriptions still reading `Step 10` / `Step 11` for challenge/onward

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Engine source comments still cite the pre-renumbering build steps
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/install/manifest.ts:252`
  - **DONE WHEN:** `manifest.ts:252` reads "build Step 12, the remediates" (Run Tests moved 11→12), `manifest.ts:286` reads "What `/bkit-build` Step 12 will run" (the gate ladder runs at Run Tests), `checks/after/index.ts:365` reads "build Step 15" (Summary moved 14→15), `checks/before/repo.ts:186` reads "`/bkit-build` Step 4 converts it" (convert moved 3→4), and `challenge.ts:53` reads "The reviewers Step 11 runs" (challenge moved 10→11). Rebuild `dist/` in the same commit (engine TS edited).
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `live docs name no build step the table does not carry` fails on these engine comments still naming the old build steps

<!-- bkit:task 5 end -->
