Verdict: CONCERNS
Affected: 1

<!-- verdict:end -->

# Plan Currency

## Affected Tasks

1. **Task 16 (Sub-Plan 2, Docs)** — class `Reword`
   - **Landed changes:**
     - `CHANGELOG.md:9` `## [Unreleased]` became `## [5.5.1] — 2026-10-22` (fb006e14 `chore(release): 5.5.1`); origin/dev `CHANGELOG.md` has no `[Unreleased]` section. T16 `Done when`, the `Documentation Updates` `CHANGELOG.md` row and the Breaking Changes notes (Sub-Plan 1 L250, Sub-Plan 2 L247) all target `CHANGELOG.md` `[Unreleased]`.
     - `docs/testing.md:367` gained 8 lines (96a1fc3c `docs(testing): local runners export keys and never touch env files`); rows cited as L587 / L606 (`commands/workflow/fids.test.ts`, `workflow-shape.test.ts`) now sit at `docs/testing.md:595` / `:614`.
     - `.bkit/core/.bkit/trackers.md:153` went from 1 line to 10 (faf16cf1 `feat(trackers)!: the GitHub board is bkit.github.project, the board URL`); lines cited as L157 / L163 (Linear `ISSUE_ID` team-prefix note, Jira key note) now sit at `:166` / `:172`. L74 / L75 / L86-87 did not move.
     - Row content and approach unchanged.
   - **Plan re-run must resolve:** (a) CHANGELOG target: say a new `## [Unreleased]` section is opened above `## [5.5.1]` (T16 `Done when`, `Documentation Updates` `CHANGELOG.md` row, Breaking Changes notes in both sub-plans); (b) line anchors in T16 `Done when` and the `docs/testing.md` row: L587 / L606 -> L595 / L614; (c) `.bkit/core/.bkit/trackers.md` row: L157 / L163 -> L166 / L172.
