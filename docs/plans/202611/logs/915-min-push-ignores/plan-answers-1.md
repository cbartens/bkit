## Owner answers

- **Open Question 1 (blocking, owner-required):** Four readers read below `<!-- bkit:end -->` (Context & Goals). The owner asked the plan to stop and bring back any such reader. The last two (`templates.test.ts`, `template-no-userpath.test.ts`) can leave `dev` with a red unit suite that nothing ran. How does the exception go ahead?
  - **Answer:** A) Add both to gate:min (Recommended)
  - Apply: option A. Proceed with the audit-template project-section exception, and keep Task 6: add `.bkit/core/engine/audits/templates/templates.test.ts` and `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` to bkit's own `bkit:gate:min` in `package.json` beside `ledger-integrity.test.ts`. `detectManagedDuplicate` stays as it is. Drop the "pending the owner's answer" wording and the "plan stops here" paragraph from Context & Goals.
  - Decision: 915-min-push-audit-template-project-section
- **Open Question 2:** Narrative and Success Criteria are missing, because #915 is not in the change shape and has no design. → The owner writes them into this plan.
  - **Answer:** You draft from the issue (Recommended)
  - Apply: written from #915's "Problem" and "Suggested change" sections and the owner's decision comment of 2026-11-10T06:56:41Z, at the owner's direction:
    - **Narrative:** An operator pushes a `[skip ci]` commit to `dev` that holds only files bkit wrote, including an audit report and the `Project Instructions` section of an audit template, and the push takes the light gate with no `--no-verify` and no empty "trigger CI" commit.
    - **Success Criteria:**
      1. `bkit ci min-push` accepts a change under `docs/audits/**`, at any depth, beside `docs/plans/**`.
      2. `bkit ci min-push` accepts a change to a top-level `docs/templates/bkit-audit-*.md` when every changed line sits below its `<!-- bkit:end -->`; a change at or above that marker still needs the full gate.
      3. Any other template, such as `docs/templates/bkit-plan.md`, still needs the full gate, and `docs/**` is not added to `minPushPaths`.
      4. `bkit ci min-push --ref`, `bkit ci min-push --update` (including the receipt path in `hasVerifiedIncrement`) and the landing routine's gate choice give the same answer for the same files.
      5. bkit's own `bkit:gate:min` runs `templates.test.ts` and `template-no-userpath.test.ts`.
      6. `.bkit/templates.md` § Git hooks — Husky describes the new floor and the audit-template exception, and the `minPushPaths` guidance matches.
  - Decision: none
- **Open Question 3** (should `pruneMinPushPaths` drop a consumer's own `docs/audits/**` entry): not asked. The owner said to ask only questions that really need an answer from them. It keeps its stated default A) (leave the migration alone), which the plan is already written for, and stays listed as unanswered.
  - Decision: none
