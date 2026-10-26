Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Five findings, worst first. Two are holes in the new corpus audit (it certifies more than it checks), one is the
same-change index update the repo rules mandate, two are narrow edge cases — one in the new lettering helpers,
one in the inherited `fix(707)` rollback. Evidence: `git diff origin/dev` read in full; the audit, decisions and
challenge suites run green on this tree; the two audit holes reproduced with the audit's own helpers against the
real corpus lines.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** The corpus audit reads only the first `Options:` label on a line, so the second list on `.bkit/core/.bkit/authoring.md:114` can revert to `Options: Accept / Fix now` and the suite stays green
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:88`
  - **DONE WHEN:** `optionLists` reports every `Options:` list a line carries — each match of the label, not just the first, and each list's entries read to its own closing code span — and the four corpus assertions (`every option line in the workflows letters every entry`, `every option line in the prompts, the templates and the authoring docs letters every entry`, `the plan template letters every option of its Open Questions placeholder`, the not-vacuous guard) still pass on the untouched corpus. Reproduction on this tree: with the audit's own `optionLists` / `optionViolations`, reverting the second list of `.bkit/core/.bkit/authoring.md:114` from `` `Options: A) Accept / B) Fix now` `` to `` `Options: Accept / Fix now` `` yields **zero** violations, while reverting the first list yields two.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `RED-PROOF: a second Options: list on one line still fires the option rule` fails while the label match is the first per line, so the second, letterless list is never inspected
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `an option list whose entries span code spans letters every entry` fails while the raw list is cut at the first backtick, dropping every entry after it

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The `Recommended:` rule runs over the workflows only, so the plan template's `Recommended: [A] — [why, 1 line]` diverges from the canonical `Recommended: A) X — {reason}` with nothing holding it
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/question-option-format.test.ts:230`
  - **DONE WHEN:** the recommendation rule runs over `PROMPTS`, `TEMPLATES` and `AUTHORING` as well as `WORKFLOWS`, and `.bkit/core/docs/templates/bkit-plan.md:108` plus its `docs/templates/bkit-plan.md` mirror state the lettered form (`**Recommended:** A) [option] — [why, 1 line]`) — so the Open Questions block every plan is generated from shows the same recommendation shape as the canonical `**Question layout**` bullet the audit names, and no other template, prompt or authoring line fails the widened rule.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every recommendation line in the templates and the prompts names a letter` fails while `**Recommended:** [A] — [why, 1 line]` carries no `{letter})` and the rule never reads that directory

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** The prompts index is left stating the pre-change option rule for the prompts this change edited — the same-change index update the repo rules mandate, with no gate behind it
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/prompts.md:267`
  - **DONE WHEN:** every row of the prompts index that states the open-question option rule names the lettered form the prompt now states — at least `bkit-design-generate` (:255), `bkit-design-review-2` (:257), `bkit-plan-generate` (:267), `bkit-plan-scope-check` (:270) and the `bkit-plan-update` row — the dogfood install re-renders `.bkit/prompts.md` from that source so the two agree, and a test holds the agreement instead of a reader's memory.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/question-option-format.test.ts` `every open-question rule in the prompts index names the lettered option form` fails while `.bkit/core/.bkit/prompts.md:267` reads `… carries 2-3 concrete options with trade-offs, a Recommended option and a Default if unanswered`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `letterAt` walks past `Z` into punctuation, so an item with 27+ options composes `Options: … / [) {option}` and the file no longer round-trips through `parseDecisionItems`
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:52`
  - **DONE WHEN:** `bkit decisions compose` either refuses an item whose option count exceeds the letters it renders (`EXIT.USAGE`, alongside the existing `recommended must be one of its options` check) or letters it unambiguously, so no composed file carries an entry `bareName` (`^[A-Z]\)`) fails to strip — the composed file's `options` and `recommended` compare equal to the caller's names after a `parseDecisionItems` round trip at every option count.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `compose refuses an item with more options than the letter list holds` fails while a 27-option item exits 0 and writes `Options: … / [) {option}` on disk

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `writeStepRow`'s rollback truncates to the byte offset seen before its own append, so a row another writer appended in that window is deleted — while the exit code says nothing was written
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:463`
  - **DONE WHEN:** a refused commit removes exactly the row this call appended and nothing else — the file after the failed call equals its content at call start plus every row a concurrent writer appended, including one appended after `before` was captured; `reports a failed commit with exit 8 without writing the row` and `a hook-refused own-path commit exits without staging a recorded path or writing the row` stay green.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a refused commit keeps a row another writer appended during the call` fails while the rollback truncates the file to a size captured before that row landed, leaving the exit code's `nothing written` claim false

<!-- bkit:task 5 end -->
