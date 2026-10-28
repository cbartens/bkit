Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Diff read in full against the tree as it stands (6764 lines / 65 files; the file carries other issues' work — build workflow mirrors, `dist/`, ledgers — so this round judges the whole diff while reporting the #705 surface). Re-checked the six named contracts: the caller (`steps finish` on both new finish lines), the resume path (`resumeAt` / `retire` / `DECISION_ROUTES` and the `step-table.test.ts` cases), the routing jumps (Decision Pause 7/9/13/8/12, Group Loop 7-9, all `→ Step N`), the comment-number contract (3/4/5/8/11/12/16 versus `WORKFLOW_STEPS.build`, verified live: the Plan Current skip prints `### Step 5 — Plan Current`, the convert `### Step 4 — Plan Convert`), the catalogue-versus-mirror agreement (`.bkit/core/.bkit/workflows.md` vs the shipped `.bkit/workflows.md`, marker aside; the five host mirrors carry the new headings and every `--number=`), and the authored instruction store (`.bkit/instructions.md` carries Steps 7-9 / Step 11 / Step 13; `instructions.test.ts` + `instructions-sources.test.ts` pass). The renumbering itself is sound. Two defects remain, one of them a hard break of the issue's headline path.

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Plan Convert's finish asserts an artifact the no-plan route never writes, so a `/bkit-build` on an issue with no plan dies at `steps finish` (exit 7) before posting its Plan Convert comment — the whole point of #705
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:391`
  - **DONE WHEN:** Step 4's finish records `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` as an optional artifact (or the check log is guaranteed to exist before the finish), so the missing-plan route completes: `tests plan-check` exit 2 routes to the convert, the convert writes the plan, the finish returns 0 and posts `### Step 4 — Plan Convert`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert's finish carries the plan-check log as an optional artifact` fails on `bkit-build.md:391` naming `build-plan-check.md` with a required `--artifact`, because a plan-less run's `steps finish` exits 7 instead of posting.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** The shipped workflow catalogue's own file tree still counts `bkit-build.md` as 15 steps while its `/bkit-build` section reads 16 — the one file #705 rewrote disagrees with itself
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:27`
  - **DONE WHEN:** the tree comment reads `bkit-build.md          # Workflow 3/5 — 16 steps; CI takes over after PR` in `.bkit/core/.bkit/workflows.md` and its shipped copy `.bkit/workflows.md`, matching the `### /bkit-build — 16 steps` section and the 16 headings.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `live docs name no build step the table does not carry` fails on `.bkit/core/.bkit/workflows.md:27` (extended to compare the tree comment's count) reading `15 steps` against the 16 build step headings.

<!-- bkit:task 2 end -->

Evidence for Task 1 (reproducible in a scratch git repo, from this worktree's `dist/cli.js`):

- `tests plan-check --plan=<missing> --existence=report --log=logs/build-plan-check.md` → prints `--plan ... does not exist`, **exit 2**, and writes **no** log file (the log write sits after the missing-plan throw, `.bkit/core/engine/commands/workflow/tests.ts:1620-1622`). Step 4's route sends exit 2 to the convert, and the re-check only runs _after_ the finish.
- `steps finish --step=build-plan-convert --artifact=<plan> --artifact=<check log> …` → **exit 7** (`docs/plans/.../build-plan-check.md does not exist`), and `steps finish` validates every `--artifact` before writing the row or committing (`.bkit/core/engine/commands/workflow/steps.ts:744-749`, `EXIT_ARTIFACT = 7`). Exit 7 has no route in the Finish contract → **Failure Path**.
- Same call with `--optional-artifact=<check log>` → **exit 0**, row written, comment `### Step 4 — Plan Convert`. The `--optional-artifact` flag already exists (`steps.ts:1141`) and is the surgical fix; the re-check after the finish still writes the log when the plan exists.
- Regression check: the pre-change Step 3 convert finish carried only `--artifact=<plan>`; the second artifact (and this break) is introduced by this run. The convert subagent _may_ run the check command named in its Context, which would mask the bug — the orchestrator cannot rely on that.
