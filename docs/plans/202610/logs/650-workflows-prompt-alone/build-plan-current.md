Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

1. **Task 16 (Sub-Plan 2, Docs)** — class `Reword`
   - **Landed changes:** `docs/testing.md:367` gained 8 lines (96a1fc3c `docs(testing): local runners export keys and never touch env files`), so the rows cited as L587 / L606 (`commands/workflow/fids.test.ts`, `workflow-shape.test.ts`) now sit at `docs/testing.md:595` / `:614`. `.bkit/core/.bkit/trackers.md:153` went from 1 line to 10 (faf16cf1 `feat(trackers)!: the GitHub board is bkit.github.project, the board URL`), so the lines cited as L157 / L163 (Linear `ISSUE_ID` team-prefix note, Jira key note) now sit at `:166` / `:172`. L74 / L75 / L86–87 did not move. The row content is the same and the approach is unchanged.
   - **Plan re-run must resolve:** update the line anchors in the T16 `Done when` (`docs/testing.md` L587 / L606 -> L595 / L614) and in the `Documentation Updates` rows for `docs/testing.md` and `.bkit/core/.bkit/trackers.md` (L157 / L163 -> L166 / L172).
