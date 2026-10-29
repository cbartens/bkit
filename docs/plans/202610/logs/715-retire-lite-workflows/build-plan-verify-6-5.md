Verdict: PASS
Failures: 0
Fixable: false
Tasks: 12, 13

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-6-1.md` (attempt 1): FAIL, 7 test-first gaps; fixed in `build-plan-gaps-remediate-6-1-log.md`, accepted by the owner in `build-decision-1-3.md`.
- `build-plan-verify-6-2.md` (attempt 2): PASS, Tasks 12, 13. Group gate 2 failed on `comply-gate-wiring.test.ts` and an `instructions.test.ts` load timeout; `build-plan-gaps-remediate-6-2-log.md`.
- `build-plan-verify-6-3.md` (attempt 3): PASS, Tasks 12, 13. Group gate 3 failed on `pnpm lint` in `comply-gate-wiring.test.ts`; `build-plan-gaps-remediate-6-3-log.md`.
- `build-plan-verify-6-4.md` (attempt 4): PASS, Tasks 12, 13. Group gate 4 (`build-group-gate-6-4.md`) failed on 5 tests in `auto-route-marker.integration.test.ts` that assumed one build `workflows close` line; `build-plan-gaps-remediate-6-4-log.md` (commit `220111539`).

## Notes

- Test-first audit `build-tests-green-6-5.md`: `Enforced: true`, `Verdict: PASS`, `Gaps: 0`. TASK 12's eight `workflow-shape.test.ts` rows have recorded reds, `Changed since red` = `outside the test only`. The six `no-red` rows are cleared by the TASK 12 / 13 TEST EXCEPTION blocks and `build-decision-1-3.md` (owner `Decision: Accept`, not assumed).
- Code changed since attempt 4 (`git diff 9efdb437e HEAD` outside `docs/plans`): only `.bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts` (commit `220111539`) and `package.json` `build.verify.maxAttempts` 4 → 5 (owner's decision, not a gap). `bkit-build.md`, the none-render baseline, `.bkit/instructions.md`, the group's other tests, engine source and `dist/` are unchanged.
- `auto-route-marker.integration.test.ts` rewrite keeps every assertion; not weaker. The publish close lines (build and debug) keep the same checks as before: the line contains `{LABEL_FLAGS}`; `bkit:build` + `bkit:auto` → subject `chore({FID}): close-workflow bkit [auto route]`; `bkit:auto` absent, near-miss `bkit:auto-paused` / `no-bkit:auto`, and no labels → plain subject; exit 0 each time. The removed "exactly one close line" check became a per-file exact count (build 2, debug 1), so a missing or extra close line still fails. The `runs dispatch ... {LABEL_FLAGS}` check still runs for both files; the `bkit-ship.md` `prs merge` and "no gh label read" checks are unchanged. New: the held close is its own case: its line must NOT contain `{LABEL_FLAGS}`, and every label set gives `chore({FID}): close-workflow held` with no marker. The only helper change is `{REF}` substitution, needed because the held line's `--line=` names `{REF}`. Cases are built from the shipped workflow text when the file loads, so they follow the workflow.
- Held close and the `bkit [auto route]` marker (note for the owner, not a gap): the held close line passes no `{LABEL_FLAGS}`, so a held close never carries the marker. This fits the design. The marker only matters to `.github/workflows/bkit-cloud.yml:102`, which starts a cloud agent when CI finishes on a pushed HEAD whose message contains `bkit [auto route]`. A held close pushes nothing, so CI never sees that commit. When `/bkit-ship` later pushes the held branch, a marker on that commit would make the cloud route fire on CI while the local ship is itself gating on CI and merging, so two agents would be driving one FID. TASK 12's Step 16 UPDATE lists the held flags as `--ending=held --publish=false --record-step` and no label flags; the DONE WHEN tests do not mention the marker. The plan and brief never state this outcome in words (no "auto route" / `LABEL_FLAGS` mention in `docs/plans/202610/715-retire-lite-workflows-plan.md`), so the reasoning above is mine, not recorded. A user with `bkit:auto` who holds a build gets no automatic follow-on; `/bkit-ship <ref>` is the manual next step the held final message names.
- Lint: `pnpm exec oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings` on `auto-route-marker.integration.test.ts`, `comply-gate-wiring.test.ts`, `workflow-shape.test.ts`, `close-squash.integration.test.ts`, `ship-verdict.integration.test.ts` → exit 0. `pnpm exec prettier --check` on the same five → exit 0, all formatted.
- Typecheck: `tsc -p tsconfig.test.json --noEmit` → exit 0 (2.3s).
- Targeted run: `pnpm vitest run auto-route-marker.integration.test.ts comply-gate-wiring.test.ts` → 2 files, 47 tests passed (25 + 22), 12.3s. Verbose output lists the held close, build publish close and debug publish close cases separately.
- TASK 12 DONE WHEN met and TASK 13 DONE WHEN met: `pnpm vitest run` on `workflow-shape.test.ts`, `trackers.test.ts`, `instructions-coverage.test.ts`, `close-squash.integration.test.ts`, `ship-verdict.integration.test.ts` → 5 files, 395 tests passed, 72.4s. The TASK 13 fixtures set `GIT_DIR` / `GIT_WORK_TREE`, assert bare-origin `for-each-ref` before and after, and assert `pr create --base dev` and `pr merge --match-head-commit` from `gh-calls.jsonl` (unchanged since attempt 4). `pnpm build` not re-run (this verifier does not build); no engine source changed in this group, so `dist/` is current.
- Carried advisory (not a gap): the Gate 16 sentence in `bkit-build.md` "the held close commits and pushes nothing" contradicts the held fence's `--message="chore({FID}): close-workflow held"` commit. The `instructions.test.ts` 60s timeout under load is in no group-6 DONE WHEN.

## Identified Gaps Log

None
