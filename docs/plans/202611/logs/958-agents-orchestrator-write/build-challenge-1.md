Verdict: CONCERNS
Failures: 3
Fingerprint: 21ad45b6609155780712db54408a689c7129f25b325a6e126b33557c75b00c14
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Notes

- **Coverage:** partial diff coverage. The diff file shows 20 of 265 files, 500 lines each; findings are limited to what it shows. Reviewed: `decisions.ts` (`itemProblem`, `check`, `counts`), `open-decision.ts` (`foldDecision`, `statusOf`, `gateRerun`, `openDecision`), `steps.ts` (`bodyProblem`, `COUNT_DECLARATIONS`), `audit-report.ts`, `issues.ts` (`--report`), the bkit-build SKILL.md route text, `instructions.md`, and the test diffs. The dist `.js` copies were skimmed only.
- **Task 1 cross-reference:** the plan's Edge Cases row (plan line 123) says a pause with no readable question resumes with `questions: 0` to **Decision Pause** step 2. Task 31's tests (`open-decision.test.ts:386-404`) build that file with no `decision-counts` row, so the loop case, where `foldDecision` adds the engine's Q1, is untested. The route is in `.bkit/core/workflows/bkit-build.md:65-78`. Deferral `958-agents-orchestrator-write-challenge-low-bkit-core-engine-commands-workflow-open-decision-ts-183` covers the no-loop case only.
- **Tasks 2 and 3 cross-reference:** Task 17 (plan line 1150) made `decisions check` refuse an en-dash question line. The parser (`parseDecisionItems`, `open-decision.ts:92`) and the checker (`itemProblem`, `decisions.ts:155-207`) still accept different question shapes, and nothing tests that gap. Deferral `...-decisions-ts-168` is about a pasted `Decision:` line, a different defect.
- **Considered, not raised:** `parseAuditReport` refuses a Findings section with a `None` paragraph and no table (it fails safe, and the template asks for a `None` row). Its section reader ignores code fences (no template has a fence under `## Findings`, checked across `.bkit/core/docs/templates/bkit-audit-*.md`). `ledgerKeys` and the key derivation moved unchanged from `steps.ts` / `issues.ts` on `origin/dev`. `bodyProblem` reads `FAIL` with `Failures: 0` correctly, through `steps.ts:382`.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A verify, holistic or tests pause stops after `decisions check` refuses its questions (e.g. `**Q2 – Gap 1:**` with an en dash, a second exit 6 → Failure Path); on resume `openDecision` counts the engine's loop question as the file's question and prints `questions: 1`, so the `questions` = 0 route never fires, and with `Gate: FAIL` `gateRerun` is true: a green re-run sets `VERIFY_VERDICT` = PASS past verify gaps nobody was asked about, while a headless resume applies only the loop recommendation
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/open-decision.ts:430` · **Round:** 1
  - **DONE WHEN:** On a verify, holistic or tests pause whose decision file `decisions check` refuses, `openDecision` (and so `status resume`) reports it in a way the Open decision route reads (`questions: 0`, or a non-null check `problem` routed to **Decision Pause** step 2); `gateRerun` returns false for it; and `decisions apply --by=headless` exits 6 with the check's problem instead of applying the loop question's recommendation. A loop-only pause that passes `decisions check` still reads `questions: 1` and keeps its gate re-run.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > a loop pause whose questions decisions check refuses resumes to Decision Pause step 2, not a gate re-run` fails on `openDecision` returning `questions: 1` and `gateRerun` returning `gateRerun: true` for a `From: verify` file holding `**Q2 – Gap 1:** …` (en dash) beside `countsRow()` (Gate FAIL, loop Try again / Stop)
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > exits 6 on a loop pause whose own questions decisions check refuses` fails on exit 0 with the loop question's recommended answer appended as a `decision-answer` row
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** An orchestrator closes a question's bold before the colon (`**Q1 — Task 3 [src/a.ts:10]**: MEDIUM: … Accept it?`); `decisions check` passes it because `itemProblem` reads the number from `**Q{n} — ` alone, but `parseDecisionItems` needs `:**` and reads the item as Q0 with an empty title, so the owner's `--answer=Q1=A` is refused as a usage error on every resume, a headless `Accept` lands as a `q: 0` row, and `tasks tick --decision` never ticks Task 3 because it reads the task number from the empty title
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:176` · **Round:** 1
  - **DONE WHEN:** `decisions check` reads each question head with the same rule `parseDecisionItems` uses (`**Q{n} — {title}:**`) and exits 6 naming the line when a head does not match it, so every question a passing check leaves parses with its own number and title, and `decisions apply --by=owner --answer=Q{n}={letter}` finds every question of a file that passed check.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question whose bold closes before the colon, naming the line` fails on exit 0 for a challenge pause holding `**Q1 — Task 3 [src/a.ts:10]**: MEDIUM: the retry has no cap. Accept it?` with well-formed `A)` / `B)` options, a `Recommended:` line and a `Default if unanswered:` line
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** On a verify, holistic or tests pause the orchestrator writes its questions behind a list marker (`- **Q2 — Gap 1:** …`) or as `**Question 2 — …`; the stray-line rule only looks at lines that start `**Q{digit}` or `#`, and a loop pause may hold no question, so `decisions check` passes the file as loop-only with `questions: 0`: `decisions counts` offers Try again / Stop with no Decide, the owner's `--answer=Q2=…` is refused, and a headless run answers only the loop, dropping the gaps the questions were about
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:162` · **Round:** 1
  - **DONE WHEN:** `decisions check` exits 6 naming the line for a line that opens a question in a shape `ITEM_SPLIT` does not read, at least behind a list marker (`- `, `* `, `1. `) and as `**Question {n}`, on loop and non-loop pauses alike, so a loop pause passes as loop-only only when its file holds no question-like line.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question line behind a list marker on a loop pause, naming the line` fails on exit 0 with `questions: 0` for a file holding `- **Q2 — Gap 1:** …` beside a `decision-counts` row whose loop offers Try again / Stop
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question written as **Question 2 on a loop pause, naming the line` fails on exit 0 with `questions: 0` for a file holding `**Question 2 — Gap 1:** …` beside the same row
<!-- bkit:task 3 end -->
