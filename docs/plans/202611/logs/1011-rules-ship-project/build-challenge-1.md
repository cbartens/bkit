Verdict: CONCERNS
Failures: 1
Fingerprint: a65d889bd144553e31b2e6a402a290ae790fde9e1458aea21e3115e129a3abe2
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-1011-rules-ship-project.md`, read in full (full coverage: its first line is a `diff --git` header, not `partial diff coverage`). Plan: `docs/plans/202611/1011-rules-ship-project-plan.md`, Tasks 1 to 7.
- Code under challenge: `rulesBelowEnd`, `hasProjectGoalsHeading` and `hasNoProjectGoals` in `.bkit/core/engine/checks/tips/detect.ts:235-257` and their `dist/` build; the `project-goals` entry and its `resolve` hook in `.bkit/core/engine/checks/tips/catalogue.ts:416-431`; the new tests in `catalogue.test.ts`, `rules-sync.test.ts` and `instructions.test.ts`; the shipped starter in `.bkit/core/.agents/rules.md`; and clause `rules-leaf` in `.bkit/instructions.md`.
- The 240 prompt files (40 sources in `.bkit/core/prompts/`, 200 rendered copies) each change only the `**Rules file:**` line, and all 240 added lines are identical. The `.bkit/version` hunk changes only 64-hex hash values. The three new `.bkit/friction.jsonl` rows and two new `docs/deferrals.jsonl` rows parse as JSON.

## Evidence

- Probed the built detector (`dist/checks/tips/detect.js`) against scratch rules files built from the shipped template. These behave as intended: the fresh template fires with the heading found; a filled `-` bullet stays quiet; a second filled `## Project Goals` section stays quiet; CRLF files behave like LF files; a heading at the end of the file with no newline fires and gets the fill ask; bkit's own `.agents/rules.md` stays quiet.
- Task 1: `## Project goals` followed by `- **Correct:** x` gives `fires=true` and `heading=false`, so `collectTips` returns the add-a-section ask.
- `pnpm exec vitest run` on `catalogue.test.ts`, `rules-sync.test.ts` and `instructions.test.ts`: 3 files, 196 tests passed.
- Every render path (`tipTextLines`, `tipParagraph`, `setupTipsChecklistLines`, `setupTipsMarkdownLines`) gets its tips from `collectTips` (`.bkit/core/engine/checks/tips/index.ts:127`), which applies `resolve`. The static `ask` therefore never reaches a person, and `bkit tips --all` goes through the same path (`.bkit/core/engine/commands/tips.ts:15`).

## Docs Cross-Reference

- Plan § Edge Cases, rows "Section is present and holds only the commented examples" and "Section holds one bullet outside a comment": Task 1 is a case of each where the case-sensitive heading match gives the wrong answer.
- Plan Task 6 DONE WHEN (the ask "tells the agent to fill the section that is already there, instead of adding one, when the heading exists"): Task 1 is a heading that agents read as the goals section but the hook does not.
- `docs/architecture.md` § Consumer Integration Model (`rules.md` is markered-text, and the consumer owns the text below `bkit:end`): the fix stays in the read-only detector and writes nothing below `bkit:end`.
- `docs/testing.md` § Test first: both proposed tests fail on the code the diff leaves (probe above), and no existing plan task or test covers them.
- `docs/security.md` § Untrusted Content & Prompt Injection: the diff adds no input path; the detector only reads a repo file.
- `docs/data-schema.md` and `docs/observability.md`: not applicable, no database or logging change.

## Notes

- Already deferred, so not logged again: deferral `1011-rules-ship-project-challenge-low-bkit-core-engine-checks-tips-detect-ts-242` (an unclosed comment opener in `Project Rules` swallows the heading). The comment strip now sits at `detect.ts:239`. New evidence for that row: the shipped template's own `-->` (the end of the examples comment) is enough of a closer, so a `Project Rules` line holding a bare code-span opener, plus filled goals, gives `fires=true` and `heading=false`. The `resolve` hook then asks the agent to add a second section, which is the duplication Task 6 targets.
- No task, because no test can fail on the code the diff leaves: the template guard at `rules-sync.test.ts:140` counts only `-` and `*` bullets, while the detector also counts `+` and `1.` / `1)` items. A template that shipped a numbered goal outside the comment would pass the guard and silence the tip on every fresh install. Today's template holds none.
- No task, for the same reason: `instructions.test.ts:265-270` replaces the exact `toBe` on the `rules-leaf` text with three `toContain` fragments, so a reworded middle passes.
- Format edges judged too unlikely for a task: goals written as a table, or as bold paragraphs with no list marker, fire (the starter says "One bullet per goal"); a thematic break `* * *`, a fenced code line starting `- `, an empty `- ` placeholder or a prose line such as `2026. ...` counts as a goal; a fenced example of a `## Project Goals` section inside `Project Rules` counts as a section.
- Not from this diff: `readText` (`detect.ts:28`) throws `EISDIR` when the path is a directory, and `collectTips` (`checks/tips/index.ts:125`) calls `fires` without a guard. Seven other tip checks already read through `readText`.
- Outside this lens: the tip's `steps` (`catalogue.ts:423`) points at "the Project Goals row" of `.bkit/prompts.md` § Special Behaviors, but that row is named `Central agent rules`.
- The three new `.bkit/friction.jsonl` rows and two new `docs/deferrals.jsonl` rows are orchestrator ledger data about this run; they hold no directive addressed to this agent.
- `Failures` and the header `Fingerprint` are left to the engine, which derives them from `findings` when it renders this report.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** The owner (or a heading-case linter) writes the heading as `## Project goals` above filled goals, so the tip fires on every design and plan run and tells the agent to add a second `## Project Goals` section
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/detect.ts:244` · **Round:** 1
  - **DONE WHEN:** `hasProjectGoalsHeading` (`detect.ts:244`) and the section match in `hasNoProjectGoals` (`detect.ts:255`) find the `## Project Goals` heading whatever its letter case, so a filled `## Project goals` section keeps the tip quiet and a comment-only one gets the fill-the-existing-section ask, never the add-a-section ask
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals stays quiet when the heading is in sentence case and holds a goal` fails on `fires` returning true for `## Project goals` followed by `- **Correct over fast:** x`, because both regexes match only `## Project Goals`
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `project-goals ask says to fill a sentence-case section that holds only commented examples` fails on the resolved `ask` reading "Add a `## Project Goals` section ...", because `hasProjectGoalsHeading` returns false for `## Project goals`
<!-- bkit:task 1 end -->
