Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 8, 9
Loosened: none
Fingerprint: 7677c9114ca91d8adbc91665e8c5cd731e4199f71c661f0e6c5bb5f154ebb0ce
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

- TASK 7: the workflow changes are correct. `.bkit/core/workflows/bkit-build.md:1277` passes `--base=origin/dev` to the migration scan. `.bkit/core/workflows/bkit-debug.md:737` uses `{NOLEAK_BASE}`, defined at line 309 as `--base={startSha}` when `startSha` is present, else `--base=origin/dev`. `worktrees setup` emits `startSha` only in place on `dev` (`.bkit/core/engine/commands/workflow/worktrees.ts:1074`), so the in-place run keeps `--base={startSha}`. The build workflow still names `--base=origin/dev` on that one line only, which the updated `local-gate-audit.test.ts` asserts, so the challenge gate, the security diff and the holistic test base stay on `featureBase`. Task 2's `scan-diff without --base ignores a match that only an unpushed local dev commit adds` is unchanged. Gap: the doc clause holds only in the rendered copy `.bkit/workflows.md`; its source `.bkit/core/.bkit/workflows.md` (lines 980 and 1081) was not edited.
- TASK 8: `featureBase` returns the `origin/dev` meeting point when the local `dev` meeting point equals `git rev-parse HEAD` (`.bkit/core/engine/commands/workflow/feature-base.ts:21`). `dist/commands/workflow/feature-base.js` is rebuilt to match. Both named tests exist and pass.
- TASK 9: both ship `context diff` lines pass `--base=origin/dev` (`.bkit/core/workflows/bkit-ship.md:109`, `abort-handover`; `:530`, `ship-deferred-sweep`), which matches the sweep Context's `--base=origin/dev` at line 537. The named test exists and passes.
- Tests run: `feature-base.test.ts`, `branches.test.ts`, `workflow-shape.test.ts`, `local-gate-audit.test.ts`, `context.test.ts`, `challenge.test.ts`, `status.test.ts` and `conventions.test.ts` all pass (8 files, 854 passed, 2 skipped; none of the skips is a group 3 test).
- Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, no gaps, nothing in `Unproven`, `Updated tests` or `Already landed`. The execute step adjusted three existing tests that Task 7 and Task 9 break. `local-gate-audit.test.ts` "build workflow and verify prompt name no origin/dev diff or test base" now allows exactly one `--base=origin/dev` line, which must be the migration scan. `workflow-shape.test.ts` "debug passes --base only when it runs in place on dev" now leaves the no-leak line out of its `{BASE_FLAG}` check. The ship entry of `BASE_FLAG` in "diff per reader" is now ` --base=origin/dev`. Each change follows from a DONE WHEN, so none is a gap.
- Decision record `build-decision-1-1.md` (Q1 and Q2: `Fix now`) sends TASK 7 and TASK 9 to this group. The plan's TASK 7 DONE WHEN keeps the security challenge diff on `featureBase`, and the tasks were judged against that.
- Advisory: group 3 did not re-render the host copies of `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md` (`.claude/commands/`, `.cursor/commands/`, `.opencode/commands/`, `.agents/skills/`). The `Install to mirror` rule allows doing this once at the end of the session (`pnpm tsx .bkit/core/engine/cli.ts upgrade`), so it is not logged as a gap.
- `docs/testing.md` and `docs/observability.md` are present. The `featureBase` change adds no new error path, so it needs no new logging.

## Identified Gaps Log

1 gap.

TASK 7: `.bkit/core/.bkit/workflows.md:980` — the source of the workflow catalog still names the build Step 16 migration scan as `bkit branches scan-diff --paths=...` with no base, and its debug Step 11 row (line 1081) still names `{BASE_FLAG}` for the no-leak scan; the group edited only the rendered copy `.bkit/workflows.md`, so the next `bkit upgrade` reverts the doc and the DONE WHEN clause "the workflow docs that describe these scans name the base each one uses" does not hold in the source — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 7: workflow catalog source not updated; only the rendered copy .bkit/workflows.md names the scan bases
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:980` · **Round:** 1
  - **DONE WHEN:** `.bkit/core/.bkit/workflows.md` build Step 16 row names `bkit branches scan-diff --base=origin/dev --paths=...` and debug Step 11 row names `{NOLEAK_BASE}` (`--base={startSha}` in place on `dev`, else `--base=origin/dev`), matching `.bkit/workflows.md` apart from the managed marker line
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
