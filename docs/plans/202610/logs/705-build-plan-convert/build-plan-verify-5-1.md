Verdict: PASS
Failures: 0
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 5` (one group — Task 8, challenge round 2 fix).

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against the group-5 diff (`build-diff-5-1.md`) and the tree as committed (`37a2cfcd1`), not the whole branch.
- **Task 8 `DONE WHEN` verified independently on the tree:**
  - `.bkit/core/workflows/bkit-build.md:391` now reads `--artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md`. The plan stays a required `--artifact`; only the plan-check log moves to `--optional-artifact`.
  - Mechanism confirmed in the engine, not just the log: `optional-artifact` is a declared `steps finish` flag (`steps.ts:1141`, `camel("optional-artifact")` → `f.optionalArtifact`, `lib.ts:128`); at `steps.ts:737-742` optional artifacts are `.filter((a) => fs.existsSync(...))` so they are only recorded/validated when present, while required `--artifact`s are all validated (`:744-749`, `EXIT_ARTIFACT = 7`). On the no-plan route (`tests plan-check` exit 2 → convert → finish) the log is absent at finish time, so it is dropped and the finish returns 0, posting `### Step 4 — Plan Convert`. Exactly the DONE WHEN.
  - The new test `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert's finish carries the plan-check log as an optional artifact` binds the flag, not the file name: it filters Step 4's `steps finish` line to `--step=build-plan-convert`, asserts `toContain("--optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md")` and `not.toContain("--artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md")` (the `not` string is not a substring of the `--optional-` form), and asserts the plan stays `--artifact=`. On a required `--artifact` form the first assertion fails. Ran it targeted: `npx vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts -t "optional artifact"` → 1 passed | 235 skipped.
- **Mirrors regenerated from the edited workflow:** `.claude/commands/bkit-build.md:349`, `.cursor/commands/bkit-build.md:348`, `.opencode/commands/bkit-build.md:352`, `.agents/skills/bkit-build/SKILL.md:350`, `.agents/plugins/bkit/skills/bkit-build/SKILL.md:350` all carry the byte-identical `--optional-artifact=… --number=4` Step 4 finish line. `.bkit/version` records the three host-mirror sha256 hashes and each equals the file's actual `shasum -a 256` (no drift). `.bkit/workflows.md` is the shipped workflow _catalogue_ (generated from `.bkit/core/.bkit/workflows.md`), which carries the Step 4 table row but no `steps finish` command line, so it neither carries nor is expected to carry the finish line; the brief's parenthetical listing it as a mirror is loose, not a gap.
- **Nothing else moved:** the commit `37a2cfcd1` changes exactly one line per file across the workflow, the test (+18 lines), the render baseline (one hunk, one line), the two `.agents` skills, the three host mirrors and `.bkit/version`. No renumbering; `step-table.ts` (rows 3/4/5 … 16 unchanged) and the catalogue `.bkit/workflows.md` / `.bkit/core/.bkit/workflows.md` are untouched by this group. The baseline update is limited to the Step 4 finish line (`git show HEAD -- .bkit/core/engine/render/__snapshots__/bkit-build.none.txt` → single ± line).
- **`tests green --group=5`** (`build-tests-green-5-1.md`): `Enforced: true`, `Gaps: 0`; the round-2 test is recorded red (`build-task-red-5-8-1.md`), `Changed since red: no`, `Green: passed`. No test-first audit gap.
- **Decision record:** `build-decision-1-4.md` — owner chose `Fix now`. Task 8 marked `[x]`.

## Identified Gaps Log

None
