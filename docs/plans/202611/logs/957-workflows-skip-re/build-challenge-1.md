Verdict: CONCERNS
Failures: 1
Fingerprint: e414e2d65eaa2451d86adef449a7366d0fa47b612c5451ce14d0638c515dfed3
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Challenge round 2 of 2. `tmp/bkit-diff-957-workflows-skip-re.md` reports `partial diff coverage` (origin/dev...HEAD, mostly unrelated work), so the review read `git diff 3e08269f7..HEAD` and `git diff HEAD`, restricted to the plan's files and their mirrors, with focus on the group 3 fixes (`git diff 0727b9eb1..HEAD`): `summary.ts` holistic settling, `tasks.ts` title regex, `bkit-build.md` Decision Pause steps 6-7, Step 8 sub-step 11, Step 9 sub-step 5, Step 10 sub-steps 6 and 10, and `.bkit/core/.bkit/workflows.md`. Also read: `openDecision` in `workflows.ts`, the build Resume contract line, Step 7 sub-step 1, Step 8 sub-steps 5-11.

## Notes

- No CRITICAL finding. Max severity MEDIUM → CONCERNS.
- Round 1 findings (plan tasks 6-9) and the three `957-workflows-skip-re-challenge-*` deferral rows are not reported again.
- Checked and clean: the second `tasks tick --decision` in step 7 exits 0 and ticks nothing when the step 6 tick already ran; the `Holistic verify` loop filter in `summary.ts` matches the title `decisions compose` writes; a zero-item pause cannot reach `continue` with a loop question, because `decisions compose` offers `Try again` / `Stop` only when there are no items; every path into a verify or holistic Decision Pause in one session sets `SOURCE_CHANGED` first (Step 8 sub-step 11, Step 9 sub-step 5, Step 10 sub-steps 6 and 10); the host mirrors and `dist/` carry the group 3 edits.
- Task 1 is the resume side of plan task 7: `openDecision` restores `gate` for the red-gate rule but nothing restores `SOURCE_CHANGED`, and `.bkit/core/.bkit/workflows.md` § Decision Pause "Resume after the answers" names the reopened `DECIDED` file as a supported resume.
- Docs: `.agents/docs.md`, `docs/architecture.md` and `docs/security.md` are present; the latter two do not cover the Decision Pause, so the cross-reference used `.bkit/core/.bkit/workflows.md` (Resume contract, § Decision Pause).
- Tests not run: this challenge does not run tests or builds; each TEST FIRST was checked by reading the code the diff leaves.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** An owner stops at an all-Accept verify or holistic pause and resumes later; the resumed Decision Pause has no SOURCE_CHANGED value, so step 6 either routes continue past fix-round edits no verify saw or re-runs the check the answers settled
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:167` · **Round:** 1
  - **DONE WHEN:** A verify or holistic decision file records `--header="Source changed={SOURCE_CHANGED}"` in `{HEADER_FLAGS}`; `openDecision` in `.bkit/core/engine/commands/workflow/workflows.ts` prints it (as it prints `gate`); the build Resume line holds it as `SOURCE_CHANGED`; and the step 6 continue rule treats a missing header as `true`, so a resumed or reopened pause (Stop then resume, or the `DECIDED` file the pre-record tick leaves unrecorded) routes the same as the original session. Today `PAUSE_STEP` = 10 for both the Step 10 sub-step 6 pause and the sub-step 10 fix-round pause, so the value cannot be derived on resume
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a verify or holistic decision file records Source changed and a resume holds it` fails on `{HEADER_FLAGS}` naming no `Source changed` header and the Resume line holding no `SOURCE_CHANGED`
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `openDecision carries the Source changed header` fails on `openDecision` having no `sourceChanged` field
<!-- bkit:task 1 end -->
