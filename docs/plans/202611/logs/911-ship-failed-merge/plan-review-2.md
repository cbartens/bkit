Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

- **Task 1 (G1) — remove ship Steps 11-12, renumber 13/14 → 11/12, engine + tests.**
  - Files: `.bkit/core/workflows/bkit-ship.md` (Steps 11-12 at 847-916; Step 13 at 920; Step 14 at 937-984; cross-refs at 42, 44, 46, 76, 318, 739, 765, 783, 825), `.bkit/core/engine/workflows/step-table.ts:176-197`, `.bkit/core/engine/checks/status-holes.ts:45-60,63,77-88,965-997`, `.bkit/core/engine/workflows/steps.ts:384-385`.
  - Symbols: `WORKFLOW_STEPS` ship entries, `RETIRED_STEPS`, `resumeAt`/`resumeOnVerdict` for `ship-merge-pr`; `SHIP_STEP_ORDER`, `RETRY_LOOP_STEPS`, `MERGED_ON_ENTRY_SKIP`; `ROW_FIELDS` ship entries.
  - Consumers: `resumePoint` (`step-table.ts:344-399`, filters done rows to `byStep.has || retired || routeOf`, so recorded rows of the removed steps are ignored on resume), `runProgress` (counts distinct step numbers; 100% only at final number), `stepProgress` / `progressPoint` (`steps.ts:439-457`, looks up by step name, so a mid-run renumber does not throw), `detectHoles` (`status-holes.ts:1011-1052`, a recorded step outside the source universe is `unexpected`), the render baseline `render/__snapshots__/bkit-ship.none.txt`.
  - Tests that hardcode the current shape: `step-table.test.ts:61-66,120,131,134,155-165,298-305`; `progress.integration.test.ts:471,497,510-511`; `workflow-shape.test.ts:866-880,903-912,937-951,1042,1049,1059,1083,1918-1922`; `ship-invariants.test.ts:235,264,329-349,858,927`; `status-holes.test.ts`.
  - Schemas / endpoints: none. Status-row shape (`status.jsonl`) is read by `resumePoint` and `detectHoles` — old in-flight rows carrying `ship-failure-diagnose` / `ship-failure-remediate` are a backwards-compat input.
- **Task 2 (G2) — `workflows fail --next-step`.**
  - Files: `.bkit/core/engine/workflows/workflows.ts:393-489` (`failVerb`), `.bkit/core/engine/issues/issues.ts:587-666` (`buildComment`, `lines` appended at 652; marker hashes the body).
  - Consumers: every `workflows fail` caller in `.bkit/core/workflows/*.md` Failure Paths; flag parsing in `lib.ts:238` (unknown flag → exit 2); JSON output keys consumed by the Failure Path prose.
  - Boundary: tracker comment post via `buildComment` → no network in tests (none tracker); validation runs before `failState` writes the row, aborts rebase, releases the lock and clears sentinels.
- **Task 3 (G2) — `NEXT_STEP` wiring in bkit-ship.md.**
  - Files: `bkit-ship.md` Step 10 exit-12 arms (713-739), new Step 12 capstone Route (Step 14 today at 937-984, `runs gate --squash-of ... --capstone-only`, exit 12 = `FAILED`, `runs.ts:937-957`), Failure Path steps 1 and 6 (85-115).
  - Consumers: `ship-invariants.test.ts`, `workflow-shape.test.ts`, the none-tracker render baseline.
- **Task 4 (G3) — `.bkit/core/.bkit` docs.**
  - Files: `.bkit/core/.bkit/workflows.md` (Ship Steps citations incl. 141, 306, 1012, 1207, 1242, 1253, 1255, 1328, 1353, 1422, 1673), `.bkit/core/.bkit/prompts.md:342`.
  - Consumers: host-render mirrors (`trackMirrorWrite`, drift-gated by `bkit check`).
- **Task 5 (G3) — repo docs + instructions store + release agent copies.**
  - Files: `docs/testing.md:687,699` (outside managed block, ends 551), `docs/deployments.md:349` (INSIDE managed block 1-541) and `:617,640` (outside), `docs/setup.md:115` (outside block, ends 52), `.bkit/instructions.md:10341` (bkit-ship `- source:` block) and `:11900` (local pre-release entry), the three `utility-pre-release-check` copies (`.claude/agents`, `.opencode`, `.codex` TOML).
  - Consumers: `bkit check` managed-block drift gate against `.bkit/shared/docs/deployments.md`; `instructions:sync` check.
- Not named by any task but carrying the step count: `.bkit/templates/.husky/pre-push:116` and `.husky/pre-push:173` ("§ /bkit-ship — 14 steps" anchor).
- Design artifact: none (`docs/plans/202611/911-*-design.md` absent, input references none) → design-coverage step not applicable.

## CRITICAL

1. **(plan edit)** Task 1 leaves hardcoded `/14` progress tests broken with no task owning them, and the frozen red snapshot blocks the code step from fixing them.
   - `progress.integration.test.ts:471` asserts `Progress: ██████████ 100% · Step 14/14 Close Workflow`; `:497` `Step 3/14 Base Check`; `:510-511` `Step 3/14` / `Step 9/14`. After the renumber `runProgress` reports `/12` (distinct step count from `WORKFLOW_STEPS`, `step-table.ts:176-197`), so all four fail. No task lists this file and Task 1's DONE WHEN vitest list does not run it.
   - `step-table.test.ts:61-66` ("runProgress flat workflow", `71% · Step 10/14 Merge Gate + Merge PR`) and `:155-165` ("runProgress attempt suffix", three `Step 10/14` assertions) also break; Task 1 names only `:120,131,134`.
   - `step-table.test.ts` is a Task 1 TEST FIRST file, so its red snapshot freezes it; a code-step edit to it trips `steps finish` exit 11 (knowledge `steps-finish-refuses-a-code-step-whose-planned-test-file-changed`, ACTIVE). This re-enters a known-broken pattern.
   - Fix: add both files' lines to Task 1 UPDATE as test-step edits (the tests step owns them), and add `progress.integration.test.ts` to Task 1 DONE WHEN.
2. **(plan edit)** Task 5 edits a managed-block line without its shipped source.
   - `docs/deployments.md:349` ("...and a Failure Remediate fix") sits inside the bkit managed block (lines 1-541); the identical line is `.bkit/shared/docs/deployments.md:349`. No task edits the shared copy, so `bkit check` reports drift and `bkit upgrade` reverts the edit (knowledge `managed-block-doc-edits-must-sync-template-or-bkit-check-drifts`, ACTIVE).
   - Fix: add `.bkit/shared/docs/deployments.md:349` to Task 5 UPDATE (edit the source, render the root copy) and add `bkit check` exit 0 to Task 5 DONE WHEN.

## OPTIONAL

- **`--next-step` refusal strands the run (flagged high-risk surface: public CLI signature of `workflows fail`).** If Task 2 refuses a bad `--next-step` value with exit 2 before `failState` (`workflows.ts:393-489`; unknown/invalid flag path `lib.ts:238`), no `workflow-failed` row is written, the lock is not released and no comment posts. The ship Failure Path only logs and continues on non-zero (`bkit-ship.md:85-115`), so the run stays IN_PROGRESS and the 30-minute lock blocks the named next step `/bkit-debug {FID}`. Add a Failure Path arm that re-runs without `--next-step` on exit 2, or have Task 2 drop an invalid value with a warning, and add one TEST FIRST row for that case.
- `ship-invariants.test.ts:264` calls `step(ship, 14)` for `workflows close`; not listed in any task. The file is not a G1 TEST FIRST file, so the code step can fix it, but name it in Task 1 UPDATE so it is not missed.
- Stale "§ /bkit-ship — 14 steps" anchor in the shipped template `.bkit/templates/.husky/pre-push:116` and the dogfood copy `.husky/pre-push:173`; add to Task 5 (template and root copy byte-identical).
- Task 4's DONE WHEN grep does not catch residual "Step 13"/"Step 14" citations in `.bkit/core/.bkit/workflows.md` (141, 306, 1207, 1242, 1253, 1255, 1328, 1353, 1422) and `docs/deployments.md:617,640`; tighten the grep to `Step 1[34]` scoped to ship sections, and list `ship.merge` Asks at `workflows.md:1012` and the merge-loop row at `:1673`.
- The Architecture section says mirrors are regenerated "in Task 7"; no Task 7 exists. Point it at the task that runs the regen, and extend REGEN beyond the bkit-ship `-u` baseline to the host-render mirrors.
- Merge Question `Stop` on a regenerable red run (`bkit-ship.md:825`, "NEVER run workflows fail", resumes at Step 10) names no `/bkit-debug` next step; Task 3 covers exit-12 arms and the capstone only. Decide whether the Stop arm also prints the next step.
- A `NEXT_STEP` value held from an earlier exit-12 arm can reach a later, unrelated Failure Path; Task 3's markdown tests cannot catch it. Add a reset of `NEXT_STEP` at Failure Path step 6 or scope it per arm.
- Pin the `status-holes.test.ts` TEST FIRST universe to `[...SHIP_STEP_ORDER]` or a source-derived set (knowledge `384-status-hole-detector-derives-expected-set-from-source-md`), so the test tracks the source rather than a hand list.
- After the render baseline regen, read the none-tracker diff for stub lines (knowledge `tracker-true-block-between-group-and-false-block-breaks-none-render`).
- In-flight runs with `ship-failure-*` rows: `resumePoint` ignores them, which is correct; add a resume test with a recorded `ship-failure-remediate` row plus `RETIRED_STEPS` entry to lock the backwards-compat behaviour.
- CHANGELOG entry for the ship renumber and the new `--next-step` flag.

## OUT OF SCOPE

- #849 (open) plans to retire ship Step 13 (Update Local Dev) in WS-9, which renumbers ship again; it is missing from the plan's Related Issues. Coordinate merge order so the second renumber starts from this plan's numbering.
- `CHANGELOG.md:1828` history line naming the old Step 11-12 shape; history stays as written.
