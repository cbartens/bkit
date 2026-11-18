Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 5aec70a296536a69a6ed31b34096cc747c20bfbc83ff71099293675f68c161e2
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 task groups).

## Integration Gaps

1 integration gap.

- TASK 1 `stepBase` and TASK 2 `tests changed` do not hold up against the build workflow's own row order. `bkit tests red` writes the `build-tests-red` step-done row uncommitted (`commit: "none"`, `.bkit/core/engine/commands/workflow/tests.ts:2788`), and `@bkit-build-plan-tasks`, the main caller of `bkit tests changed`, runs right after it. While the row stays uncommitted, `stepBase` falls back to its `parentSha`, which is correct. A subagent that commits with `git add -A` or `git commit -a` also commits `status.jsonl`, so the row lands in the subagent's commit. `commitOfRow` then returns that commit as the base, and the subagent's committed files drop out of the changed set. That is the exact failure issue #1018 sets out to fix. Reproduced in a scratch repo with `dist/commands/workflow/step-base.js`: the base came back as the subagent's commit and the diff from it was empty. The two `scan-diff --since-step` call sites are not hit: the row before `build-plan-gaps-remediate` is a committed `build-plan-verify`, `build-group-gate` or `build-decision` row.

## Previously Attempted

- `build-plan-verify-1-1.md`, `build-plan-verify-1-2.md`: group 1, PASS, Tasks 1, 2, 3. The first group gate failed on `conventions.test.ts`, and `build-plan-gaps-remediate-1-1-log.md` fixed it by adding `step-base.ts` to `HELPER_SOURCES`.
- `build-plan-verify-2-1.md`: group 2, CONCERNS, 3 fixable gaps (a Step 10 sub-step 12 rewording, the `workflows.md` Step 9 / Step 10 rows, and the suite failure that followed). `build-plan-gaps-remediate-2-1-log.md` fixed all 3, and `build-plan-verify-2-2.md` passed with Tasks 4, 5.
- This is the first holistic attempt.

## Notes

- Holistic mode, judged against `tmp/bkit-diff-1018-subagent-commits-makes.md` (the whole feature diff) and the codebase. No `build-decision-*.md` records exist, and no test-first audit report was supplied for this round.
- Tasks judged satisfied against their `DONE WHEN`: 1, 2, 3, 4, 5. The 3 gaps below are an integration gap, a run-constraint excess and a docstring that does not match the code. None of them makes a `DONE WHEN` false as written.
- TASK 1: `step-base.ts` exports `stepBase` and imports only `../lib.js` and `./status.js`. The 3 `step-base.test.ts` tests pass.
- TASK 2: the default base comes from `stepBase({ cwd: top })`. An explicit `--base` wins. With no run, the verb logs a line and uses `HEAD`. The help text is replaced. No `.bkit/core/prompts/*` file changed since merge base `800085c4d`. The 3 `tests changed default base` cases pass.
- TASK 3: `--since-step` and `--file` are in the verb spec. Combining `--since-step` with `--base` is a usage error. A base that cannot be resolved exits `EXIT_DIFF_FAILED` with a log line. The 3 `branches scan-diff --since-step` cases pass.
- TASK 4: `rg -n 'HEAD~1'` finds nothing in `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md` or `.bkit/workflows.md`. Both calls carry `--since-step` and `--file="{STATUS}"`. The `workflow-shape.test.ts` invariant and `workflow-fence-syntax.test.ts` (15 tests) pass. `pnpm tsx .bkit/core/engine/tools/instructions.ts` exits 0.
- TASK 5: `docs/testing.md` lines 572, 815 and 829 and `.bkit/core/.bkit/cli.md:92` name the new behaviour. `dist/` carries `step-base.js` and the `branches` / `tests-changed` changes. The `.claude`, `.cursor`, `.opencode`, `.agents` and `.codex` mirrors carry the new commands. `node dist/cli.js check` exits 0. I did not run the full unit suite (`Local tests first`); the holistic gate runs it.
- Cross-group contract: the flag names and step names in the workflow calls (`build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) match the rows the workflow writes. `{STATUS}` is the run's `status.jsonl`, which is the input `resolveActiveRun` accepts, and the Step 9 and Step 10 rows in `.bkit/core/.bkit/workflows.md` match the commands.
- Tests run: `step-base.test.ts`, `tests-changed.test.ts`, `branches.test.ts`, `workflow-shape.test.ts`, `conventions.test.ts` and `instructions-coverage.test.ts` gave 6 files and 684 tests passing. `workflow-fence-syntax.test.ts` gave 15 passing.
- Run constraint: the prompts total is 86494, exactly at its cap. The workflows total is 58538, 2 over its cap of 58536, logged as a gap.
- Derived Test Matrix: each of the 10 rows has its test in its task's `TEST FIRST` / `DONE WHEN`. Both `Documentation Updates` rows are done. `docs/observability.md`: the new failure paths report through `ctx.log`, the same way the code next to them does.
- Observation, not a gap: `commitOfRow` finds a row by its `at` timestamp, which has one-second resolution, and takes the earliest commit that changes how often that string occurs. If a row committed earlier carries the same second, the base comes out too early. In this run's `status.jsonl`, every step-done row maps to its own step's commit, so no collision occurred. The integration-gap fix could match the whole row line instead of only `at`.
- In my own throwaway scratch repo (`/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/daede15b-fd21-4fd2-b5bf-f71b098545fb/scratchpad/repro-stepbase`), I ran one `git reset --soft HEAD~1`. That breaks the `Destructive git` rule even though it never touched the project checkout. The repro that counts was run again in a fresh scratch repo without it.

## Identified Gaps Log

3 gaps.

INTEGRATION: TASK 1 `stepBase` (`.bkit/core/engine/commands/workflow/step-base.ts:51`) x TASK 2 `tests changed` x the build workflow: `tests red` writes its `build-tests-red` step-done row with `commit: "none"` (`.bkit/core/engine/commands/workflow/tests.ts:2778-2788`) just before `@bkit-build-plan-tasks` runs, and `commitOfRow` takes the earliest commit that holds a row, so a plan-tasks subagent that commits with `git add -A` / `git commit -a` sweeps that row into its own commit and `stepBase` returns the subagent commit; `bkit tests changed` then lists none of the committed files (reproduced in a scratch repo against `dist/commands/workflow/step-base.js`: base = the subagent commit, empty diff). This breaks Success Criterion 1 in the main path the issue targets, and the plan Edge Case "row written with `--commit=none`: the base is that row's `parentSha`" does not hold once a later commit carries the row. Make `stepBase` use `parentSha` for a row written uncommitted (for example a field the engine stamps on `commit: "none"` rows), and add a `step-base.test.ts` case where a later commit sweeps the uncommitted row — Fixable: true
TASK 4: run constraint exceeded: `LC_ALL=C cat .bkit/core/workflows/*.md | LC_ALL=C wc -w` gives 58538, above the 58536 cap (the `dev` total, matched at merge base `800085c4d`); the two `scan-diff` lines in `.bkit/core/workflows/bkit-build.md:933` and `:1046` each turned one word (`--base=HEAD~1`) into two (`--since-step=... --file="{STATUS}"`). Cut at least 2 words elsewhere in `.bkit/core/workflows/bkit-build.md` without touching a sentence a `.bkit/instructions.md` entry copies (check with `pnpm tsx .bkit/core/engine/tools/instructions.ts`), then re-render with `pnpm tsx .bkit/core/engine/cli.ts upgrade`; the prompts total (86494) is at its cap and must stay there — Fixable: true
TASK 1: the `stepBase` docstring (`.bkit/core/engine/commands/workflow/step-base.ts:32`) says "a step with no row yet counts the whole run", but the code (lines 44-47) keeps every step-done row when the named step has none and measures from the last of them, not from the run start; flagged as an observation by both group 1 verify rounds and still unchanged. Reword the parenthesis to say a step with no row yet measures from the last step-done row — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** INTEGRATION: stepBase returns the subagent's own commit when it sweeps the uncommitted build-tests-red row
  **Severity:** HIGH · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:51` · **Round:** 1
  - **DONE WHEN:** stepBase returns a row's parentSha when the row was written uncommitted, even after a later commit carries it; a step-base.test.ts case where a later commit sweeps an uncommitted step-done row passes, and tests changed then lists the subagent's committed file
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/step-base.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 4: workflows word total 58538 is above the 58536 cap
  **Severity:** MEDIUM · **Class:** run-constraint · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:933` · **Round:** 1
  - **DONE WHEN:** LC_ALL=C cat .bkit/core/workflows/*.md | LC_ALL=C wc -w is at most 58536, LC_ALL=C cat .bkit/core/prompts/*.md | LC_ALL=C wc -w is at most 86494, and pnpm tsx .bkit/core/engine/tools/instructions.ts exits 0
  - **TEST FIRST:**
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 1: stepBase docstring says a step with no row counts the whole run
  **Severity:** LOW · **Class:** doc-drift · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:32` · **Round:** 1
  - **DONE WHEN:** the stepBase docstring says a named step with no row yet measures from the last step-done row, matching the code
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
