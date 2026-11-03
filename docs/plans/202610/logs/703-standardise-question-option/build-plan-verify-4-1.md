Verdict: PASS
Failures: 0
Fixable: false
Affected: 0

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 4` (one group) — 703 "Standardise Question Option Labels" Implementation Plan, group 4 "Challenge round 1 findings", attempt 1. Judged against the supplied group diff (`build-diff-4-1.md`: the changes since the group started), not the whole branch.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- No `build-plan-verify-4-*.md` before this file (the glob found none), no `build-plan-gaps-remediate-4-*-log.md`, no `build-decision-*.md` and no `build-plan-current.md` — so no prior attempt for group 4, and no decision record accepts any gap.
- Earlier rounds of this plan, for context: `build-plan-verify-1-1.md`, `build-plan-verify-2-1.md`, `build-plan-verify-2-2.md`, `build-plan-verify-3-1.md` and `build-plan-verify-holistic.md`, plus the `build-plan-gaps-remediate-2-1-log.md` pass. `build-tests-green-4-1.md` is this round's test-first audit input, not a prior verification.

## Notes

- **Group 4 holds three tasks** (TASK 8, TASK 9, TASK 10). The supplied group diff (`build-diff-4-1.md`) supplies the changes since the group started: `.bkit/core/.bkit/prompts.md` and its mirror `.bkit/prompts.md` (six rows each), `.bkit/core/docs/templates/bkit-plan.md` and its mirror `docs/templates/bkit-plan.md` (line 108), `.bkit/core/engine/audits/workflows/question-option-format.test.ts`, `.bkit/instructions.md` (the `#### bkit-plan` local entry), `.bkit/version` (two `canonicalHashes` entries) and `docs/deferrals.jsonl` (the two LOW challenge findings recorded as `reason: low-severity`). Every change maps to a task field; none is unclaimed.
- **TASK 8, TASK 9 and TASK 10 were ticked `[x]`** in `docs/plans/202610/703-standardise-question-option-plan.md` (they were `[ ]`; each `DONE WHEN` holds, so each line was flipped). Nothing else was ticked — TASK 1–7 stay `[x]` from groups 1–3; the `Gate 2` / `Gate 3` boxes, the `Verification Plan` boxes, `Gate 4` and the `Manual Verification` boxes stay unticked (advisory — only runbook `DONE WHEN` fields gate merge).
- **DONE WHEN checked, per task:**
  - **TASK 8** — `optionLists` reports every `Options:` list a line carries and reads each to its own closing code span: `OPTIONS_LABEL` is global (test file :47), the body uses `[...line.matchAll(OPTIONS_LABEL)]`, resolves each list's end from the enclosing span via the new `codeSpans` (:84–87, :98–110) and strips the span backticks. Re-derived the reproduction with the audit's own helpers against the real corpus line (throwaway probe outside the repo, no repo file written): `.bkit/core/.bkit/authoring.md:114` yields 2 lists (`A) {option} / B) {option}` and `A) Accept / B) Fix now`) and 0 violations untouched; reverting the second list to `Options: Accept / Fix now` yields 2 violations (`Accept`, `Fix now`) — 0 under the first-match-only helper the red snapshot preserves — while reverting the first list yields 2, i.e. the DONE WHEN's "yields **zero** violations" is the pre-fix defect the field describes, reproduced against the snapshot body (which execs the label once and then cuts the tail at the first backtick). The four corpus assertions pass: `npx vitest run .bkit/core/engine/audits/workflows/question-option-format.test.ts` → **15 passed**; the probe reports 0 violations in `WORKFLOWS` and in `PROMPTS ∪ TEMPLATES ∪ AUTHORING`, 0 in the plan-template placeholder, and the not-vacuous guard (`counts the option lines found per directory`) is green. Red recorded before the fix (`build-task-red-4-8-1.md` / `-2.md`: 2 failed / 13). **Satisfied.**
  - **TASK 9** — the recommendation rule now runs over `PROMPTS`, `TEMPLATES` and `AUTHORING` (`every recommendation line in the templates and the prompts names a letter`, test file :257) while `every recommendation line in the workflows names a letter` (:253) retains `WORKFLOWS`; both green, probe 0 violations on both sets. `.bkit/core/docs/templates/bkit-plan.md:108` and its mirror `docs/templates/bkit-plan.md:108` both read `  - **Recommended:** A) [option] — [why, 1 line]`, the mirror differing from its source only in the managed marker; `.bkit/instructions.md`'s `#### bkit-plan` local entry carries the same lettered line (this task's fallout, repaired in TASK 10's log) and `.bkit/version` carries the re-rendered hashes. Red recorded first (`build-task-red-4-9-1.md`: 1 failed / 14, the named test). **Satisfied.**
  - **TASK 10** — all six `.bkit/core/.bkit/prompts.md` rows stating the open-question option rule name the lettered form: :255 `bkit-design-generate`, :257 `bkit-design-review-2`, :259 `bkit-design-update`, :267 `bkit-plan-generate`, :270 `bkit-plan-scope-check`, :271 `bkit-plan-update` — the five named rows included, 0 letterless. The mirror agrees: `.bkit/prompts.md`'s rows equal the source's (files differ only in the managed-marker line) and `node dist/cli.js check` → exit 0, no drift. A test holds that agreement instead of a reader's memory (`indexOpenQuestionRules(PROMPTS_INDEX_MIRROR)` compared to the source rows, :281–284) and passes. Red recorded first (`build-task-red-4-10-1.md`: 1 failed / 15, 6 rows, `expected [ …(6) ] to deeply equal []`). **Satisfied.**
- **Test-first audit** (`build-tests-green-4-1.md`): `Enforced: true`, `Gaps: 4`, `Test order only: true`; no `Late-red check` section, no `Enforced: false`. All four gaps are `test-changed` on the one file `.bkit/core/engine/audits/workflows/question-option-format.test.ts`. Read hunk by hunk (`diff -u` of each `build-task-red-4-*-1.snapshot` against the file):
  - No named test's **assertions** changed. TASK 8's two tests, TASK 9's test and TASK 10's test are byte-identical to their snapshots inside their own `it(...)` blocks — no matcher, threshold, message or expectation weakened, removed or rewritten.
  - What differs is (a) the **code under test**, which lives in this same file — the helper regex going global, `codeSpans` added, `optionLists` rewritten to the per-match / own-span form; (b) sibling tasks' later additions to the same file (the two `PROMPTS_INDEX*` consts, `indexOpenQuestionRules`, TASK 9's and TASK 10's tests); and (c) two Prettier reflows (the `optionLists` `raw` expression, and TASK 10's own `expect(rules.length, …)` call — same tokens, same matchers, same message).
  - Stated plainly: **this is an artifact of an audit-shaped task where the test harness and the rule implementation share one file, not a test-order violation.** The order was test-first: each red snapshot still carries the pre-fix helper and the failure message that helper produces (`expected 0 to be greater than 0` for the second-list red, `expected [] to deeply equal [ [ 'A) yes', 'no' ] ]` for the code-span red, `expected [ …(6) ] to deeply equal []` for the index red). The fix then landed in that same file, which a whole-file snapshot cannot distinguish from a test edit; no assertion was relaxed to reach green, and the fixed helper was re-verified against the real corpus by independent reproduction (it now catches the reversion that was invisible before and does not false-positive on the untouched corpus). No `test-changed` gap maps to a group-4 gap.
- **Execute-log cross-reference:** the three `DONE — TASK {8,9,10}` lines in `build-plan-execute-4-log.md` are claims; each was re-checked against the codebase and its commands re-run, and each holds. The log's stale `BLOCKED — GATE bkit:gate:static` line (a claimed `format:check` failure on this plan's caller-authored group-4 block) does not reproduce: `npx prettier --check docs/plans/202610/703-standardise-question-option-plan.md` — and with `--ignore-path /dev/null` — reports "All matched files use Prettier code style!", exit 0. It names no group-4 task and no task reads a `BLOCKED` line, so it is recorded here as stale, not as a gap.
- **Suite state:** `pnpm test` re-run → **199 files passed (199)**, `7869 passed | 1 skipped`, exit 0 (matches the log). The files this group touches re-run → `question-option-format.test.ts` + `tools/instructions.test.ts` + `tools/instructions-sources.test.ts` + `tools/instructions-coverage.test.ts` = **4 files / 154 passed**, matching the log. `node dist/cli.js check` → exit 0.
- **Mandatory checks:** this plan carries no `Derived Test Matrix` and no `Documentation Updates` section, so both are vacuous; the four group-4 tests sit in their tasks' `TEST FIRST` / `DONE WHEN` fields; every task fixed the tests it broke (TASK 9's `.bkit/instructions.md` fallout repaired inside TASK 10, `pnpm instructions:sync` exit 0 per the log and no drift under `cli.js check`); observability is untouched (no log-line change in this group).
- **Challenge findings beyond the runbook:** the challenge report's five findings became three runbook tasks (8, 9, 10); its two LOW findings (challenge TASK 4, TASK 5) are not runbook tasks and are recorded in `docs/deferrals.jsonl` as `reason: low-severity` rows. They create no group-4 gap — a deferral row never satisfies a `DONE WHEN`, and no group-4 task names them.
- **No decision record** accepts any gap; no gap needed one.
- **Plan caps respected:** group 4 = 3 tasks (cap 3); `TEST FIRST` tests = 4 (cap 15); per task = 2 / 1 / 1 tests, each in 1 file (cap 10 tests across 3 files).
- **`Affected`** (extra field requested by the caller) = number of group-4 tasks affected by verification gaps — **0**.

## Identified Gaps Log

None
