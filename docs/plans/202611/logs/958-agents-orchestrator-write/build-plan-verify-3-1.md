Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 9, 10, 12
Loosened: none
Fingerprint: 1b273a84fa728f3115d14c6e94eceade2f2129b5202a1d28a0605d8439a3ee6d
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Tests run: `pnpm exec vitest run -c vitest.unit.config.ts` on `open-decision.test.ts`, `decisions.test.ts`, `challenge.test.ts`, `tasks.test.ts`, `status.test.ts`, `steps.test.ts`, `workflows.test.ts`, `cli-doc.test.ts`, `workflow-shape.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`, `trackers.test.ts`, `question-option-format.test.ts`: 14 files, 1307 tests, all pass. `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 with no report. `pnpm bkit:text:ceiling check` passes: prompts 83844, workflows 58006 (58012 at the start of the group, so not above it).
- Task 9 satisfied: `decisionItems`, `mergeItems`, `decisionFileHeader`, `statusOf`, `pauseStatus`, `engineSibling` and `isEngineFile` in `open-decision.ts`; `gateRerun`, `skipProblem`, `undecidedBesidesLoop` and `openDecision` read the engine file; the listings in `workflows.ts`, `challenge.ts`, `summary.ts` and `decisions.ts` skip `-engine.md` files; `status.ts` and `steps.ts` pass the engine text.
- Task 10 satisfied: the `check` verb and `itemProblem` (lettered options in order, name and effect, `Recommended:` naming an option or `none`, `Default if unanswered:`, no repeated number, no `Q1` beside the engine's loop question), exit 6.
- Task 12 satisfied: `apply` writes every `Decision:` / `Rejected:` line into the `-engine.md` file through `engineWith`, writes no `Status`, and `--answer` records the loop answer.
- Task 11 implementation is present (`counts` verb, decision file byte-identical in tests), but the DONE WHEN "moved cases pass" is unmet: see gap 1.
- Task 13 workflow, engine, instructions, snapshot, `cli.md` and ceiling work is present; gaps 2 and 3 remain.
- Test-first audit (`build-tests-green-3-1.md`, `Enforced: true`, 4 `delete-still-referenced` gaps at `Fixable: null`), decided:
  - `compose`: the sampled hits (`.agents/rules.md:136`, `.bkit/cloud.md:662`, the agent prompts) are `docker compose`, a different thing. The repo-wide search for `decisions compose` outside `docs/plans/` and `docs/audits/` finds `CHANGELOG.md`, `docs/decisions.jsonl`, `docs/deferrals.jsonl` (append-only history, no gap), `docs/testing.md:957` and `.bkit/core/.bkit/workflows.md:990-1030` (Task 16 in group 4 rewrites these, so no gap in this group), and two test comments (gap 3, `Fixable: true`).
  - `composeItems`: hits only in archived `docs/audits/` and `docs/plans/**/logs/`. No gap.
  - `itemLines`: `.bkit/core/engine/shared/text.ts:245-259` and `dist/shared/text.js` hold a different YAML-style `itemLines` function. No gap.
  - `decisions.test.ts` "the file still exists": the DELETE named the `describe("bkit decisions compose")` cases, not the file, and that describe is gone. No gap.
- No `Taken over`, `Unproven`, `Changed by a code step` or `Updated tests` sections in the audit. No decision records and no earlier verify reports for group 3. The brief has no `Deviations` section.
- Every `Derived Test Matrix` row for Tasks 9-13 is named in its task's `DONE WHEN`. The `Documentation Updates` rows for this group (`.bkit/instructions.md` entries, generated `cli.md` region) are done; the rest belong to Task 16.

## Identified Gaps Log

3 gaps.

- TASK 11: moved-cases-missing — the `bkit decisions compose` `--loop` and `--base-check` cases were deleted, not moved to `describe("bkit decisions counts")` (about 23 cases at `e95997dff:.bkit/core/engine/commands/workflow/decisions.test.ts:280-994`, e.g. `--loop=holistic counts only the rounds since the whole-feature check was last clean`, `holistic limit pause prints the rounds run, never above max`, `prints the group gate's failing tests per round for the verify loop`, `--loop on an unknown trend says the limit is used up`, `base check all in adopt mode adds the merge sentence`, `base check some with undetermined cases counts only the branch's as fixable`, `a missing or malformed base check is a usage error that names the problem`, `--loop needs --file`); only the two renamed `base check all` cases moved, so DONE WHEN "the moved cases pass" is unmet — Fixable: true
- TASK 13: read-lines-missing-engine-file — the subagent `Read` lines at `.bkit/core/workflows/bkit-build.md:926`, `:1034` and `:1210` are unchanged (`glob build-decision-{RUN}-*.md (highest number, if present)`) and do not name the `-engine.md` file beside the decision file, as the task's UPDATE requires — Fixable: true
- TASK 13: delete-still-referenced — test fixture comments still name the removed verb: `.bkit/core/engine/commands/workflow/tasks.test.ts:135` ("titled as `decisions compose` titles a gap") and `.bkit/core/engine/commands/workflow/summary.test.ts:1878` ("in the layout `decisions compose` writes") — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 11: compose --loop and --base-check cases deleted, not moved to `bkit decisions counts`
  **Severity:** HIGH · **Class:** moved-cases-missing · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.test.ts:940` · **Round:** 1
  - **DONE WHEN:** the six tests below and the moved cases pass
  - **TEST FIRST:**
    - --loop=holistic counts only the rounds since the whole-feature check was last clean
    - holistic limit pause prints the rounds run, never above max
    - prints the group gate's failing tests per round for the verify loop
    - --loop on an unknown trend says the limit is used up
    - base check all in adopt mode adds the merge sentence
    - base check some with undetermined cases counts only the branch's as fixable
    - a missing or malformed base check is a usage error that names the problem
    - --loop needs --file
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 13: subagent Read lines at bkit-build.md:926, :1034 and :1210 do not name the -engine.md file
  **Severity:** MEDIUM · **Class:** read-lines-missing-engine-file · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:926` · **Round:** 1
  - **DONE WHEN:** the subagent Read lines name the engine file beside the decision file
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 13: test fixture comments at tasks.test.ts:135 and summary.test.ts:1878 still name `decisions compose`
  **Severity:** LOW · **Class:** delete-still-referenced · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.test.ts:135` · **Round:** 1
  - **DONE WHEN:** DELETE compose in decisions.ts: no reference to the removed verb remains
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
