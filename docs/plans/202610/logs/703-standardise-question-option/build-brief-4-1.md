# Brief: group 4 — Challenge round 1 findings

Plan: 703 — Standardise Question Option Labels Implementation Plan

## Why and what

### Context & Goals

bkit asks the owner questions in five workflows and labels the answer options three different ways — `Options: A — … · B — …` (the plan template), `Options: Accept / Fix now` (the build Decision Pause, rendered by `bkit decisions compose`), `Options: Try again / Stop` (debug's Loop Question), `Options: Confirm / Reject` (ship's Confirm Assumed Items), and `Options: A / B` (the canonical description in `.bkit/workflows.md`) — so the same Q&A reads differently from run to run. This plan makes every owner-facing question render `**Q{n} — {title}:**` with lettered answer options `A)`, `B)`, `C)` — including options that already carry a name (`Options: A) Accept / B) Fix now`) — and makes the plan / design open questions keep their trade-off as `A) {option} — {trade-off} · B) …`, while `bkit decisions apply` keeps resolving its recommendation by the bare option name (the parser strips the letter), so headless / `ask:false` routing is unchanged.

**Related Issues:**

- `#703 — Standardise the question option labels (open)`

**Scope mapping — where the issue's touched surfaces actually carry the shape:**

- The engine is the only site that composes a whole option list mechanically (`bkit decisions compose`), so the Decision Pause's letters come from `decisions.ts`, not from `bkit-build.md`.
- The plan / design open questions are prose the agents author: the shape lives in the plan template, in the shared `plan-open-questions` clause and in the design / plan prompts that state the rule.
- The audit surfaces (`bkit-audit-generate.md`, `.bkit/core/docs/templates/bkit-audit-*.md`) carry no `Options:` line today; the only audit decision-question shape is the `Proposal` question (`.bkit/core/docs/templates/bkit-audit-models.md` step 9), which this plan pins. The new audit in `GROUP 2` scans **every** prompt and **every** template, so the audit surfaces are held to the one layout without an invented edit.
- `.bkit/core/prompts/bkit-plan-review-2.md` carries no open-question or option rule; it needs no edit and is covered by the same scan.
- Shipped docs and prompts must not name this issue: `audits/repo/shipped-docs-refs.test.ts` rejects a tracker number, ledger key or finding id at the package source, so every prose edit records behaviour only.

---

## Where it fits

- Group 1: The decision engine letters its options — done
  - TASK 1: Letter the Decision Pause's options and recommendation in the renderer, and strip the letter back off in the parser — done
- Group 2: The corpus states one option layout, and an audit holds it — done
  - TASK 2: Pin the option layout in the canonical description and add the audit that holds the whole corpus to it — done
  - TASK 3: Letter every option line the five phase workflows state, and refresh the `none` render baselines — done
  - TASK 4: Letter the open-question and audit decision-question option shape in the prompts and templates — done
- Group 3: The regenerated artifacts and the final gate run — done
  - TASK 5: Regenerate the installed mirrors and the instruction store from the changed sources — done
  - TASK 6: Rebuild `dist/` from the changed engine source — done
  - TASK 7: Run the four verification commands on the final tree and fix any fallout — done
- Group 4: Challenge round 1 findings — this group
  - TASK 8: The corpus audit reads only the first `Options:` label on a line, so the second list on `.bkit/core/.bkit/authoring.md:114` can revert to `Options: Accept / Fix now` and the suite stays green — open
  - TASK 9: The `Recommended:` rule runs over the workflows only, so the plan template's `Recommended: [A] — [why, 1 line]` diverges from the canonical `Recommended: A) X — {reason}` with nothing holding it — open
  - TASK 10: The prompts index is left stating the pre-change option rule for the prompts this change edited — the same-change index update the repo rules mandate, with no gate behind it — open

## The work

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** The corpus audit reads only the first `Options:` label on a line, so the second list on `.bkit/core/.bkit/authoring.md:114` can revert to `Options: Accept / Fix now` and the suite stays green
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:88` · **Round:** 1
  - **DONE WHEN:** `optionLists` reports every `Options:` list a line carries — each match of the label, not just the first, and each list's entries read to its own closing code span — and the four corpus assertions (`every option line in the workflows letters every entry`, `every option line in the prompts, the templates and the authoring docs letters every entry`, `the plan template letters every option of its Open Questions placeholder`, the not-vacuous guard) still pass on the untouched corpus. Reproduction on this tree: with the audit's own `optionLists` / `optionViolations`, reverting the second list of `.bkit/core/.bkit/authoring.md:114` from `` `Options: A) Accept / B) Fix now` `` to `` `Options: Accept / Fix now` `` yields **zero** violations, while reverting the first list yields two.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `RED-PROOF: a second Options: list on one line still fires the option rule` fails while the label match is the first per line, so the second, letterless list is never inspected
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `an option list whose entries span code spans letters every entry` fails while the raw list is cut at the first backtick, dropping every entry after it
<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** The `Recommended:` rule runs over the workflows only, so the plan template's `Recommended: [A] — [why, 1 line]` diverges from the canonical `Recommended: A) X — {reason}` with nothing holding it
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:230` · **Round:** 1
  - **DONE WHEN:** the recommendation rule runs over `PROMPTS`, `TEMPLATES` and `AUTHORING` as well as `WORKFLOWS`, and `.bkit/core/docs/templates/bkit-plan.md:108` plus its `docs/templates/bkit-plan.md` mirror state the lettered form (`**Recommended:** A) [option] — [why, 1 line]`) — so the Open Questions block every plan is generated from shows the same recommendation shape as the canonical `**Question layout**` bullet the audit names, and no other template, prompt or authoring line fails the widened rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every recommendation line in the templates and the prompts names a letter` fails while `**Recommended:** [A] — [why, 1 line]` carries no `{letter})` and the rule never reads that directory
<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->
- [ ] **TASK 10:** The prompts index is left stating the pre-change option rule for the prompts this change edited — the same-change index update the repo rules mandate, with no gate behind it
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/prompts.md:267` · **Round:** 1
  - **DONE WHEN:** every row of the prompts index that states the open-question option rule names the lettered form the prompt now states — at least `bkit-design-generate` (:255), `bkit-design-review-2` (:257), `bkit-plan-generate` (:267), `bkit-plan-scope-check` (:270) and the `bkit-plan-update` row — the dogfood install re-renders `.bkit/prompts.md` from that source so the two agree, and a test holds the agreement instead of a reader's memory.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts index names the lettered option form` fails while `.bkit/core/.bkit/prompts.md:267` reads `… carries 2-3 concrete options with trade-offs, a Recommended option and a Default if unanswered`
<!-- bkit:task 10 end -->

## Deviations

Resume the build without pushing to dev, the pr will bring all to dev.

---

Run context (resuming a run that stopped at its Failure Path on 2026-10-26):

- Groups 1 and 2 are complete; TASK 1-4 are ticked `[x]` in the plan. Group 3 is the only open group.
- TASK 5 (dogfood install of the mirrors) and TASK 6 (`dist/` rebuild) are already effective on the branch.
- TASK 7's fallout was the `.prettierignore` gap; the owner authorised the change and it is already committed on this branch as `046e1b9b8` — the generated raw-record families `build-tests-green-*`, `build-diff-*` and `build-brief-*` were added to BOTH `.prettierignore` and `.bkit/templates/.prettierignore`. Do not re-authorise or re-litigate it; just re-run TASK 7's four commands and confirm they pass.
- Verified on the current tree: `bkit tests run --gate=bkit:gate:static-unit-integration` PASS (0 failures), `pnpm test` 199 files / 7865 passed, `pnpm test:integration` 46 / 1585 passed.
- The branch is based on local `dev`; local `dev` is 3 commits ahead of `origin/dev`. The owner accepts that the PR will carry those commits into `dev`.
