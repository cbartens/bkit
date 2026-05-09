# Build Input — bar-148-option-1

## Session Prompt

/bkit-build bar-148

## Issue Description

See Linear issue BAR-148: "Auto-route build PRs to ship/debug after CI"

bkit-ci-router — new autonomous routing workflow that closes the manual gap between `bkit-build` completion and skill dispatch. After CI finishes on a PR's head SHA, the router automatically reads `status.json`, checks the PR status rollup, and invokes either `/bkit-ship {FID}` (green) or `/bkit-debug {FID}` (red) in a fresh Claude Code session on a GHA runner using `anthropics/claude-code-action@v1`. Option 1 selected (GHA → claude-code-action dispatch).

## Active Plan

See: docs/plans/active/bar-148-option-1-plan.md

Five phases:
- Phase A: Templates and source artifacts (A1–A9)
- Phase B: Installer module wiring (B1–B4)
- Phase C: Tests covering 18-row derived test matrix (C1a–C9g)
- Phase D: Documentation updates (D1–D7)
- Phase E: Mirror regen and bkit-repo-only checks (E1–E3)

## Comments

Prior plan workflow completed PASS. See Linear comment thread for plan summary details.
