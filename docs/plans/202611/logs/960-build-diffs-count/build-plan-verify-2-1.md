Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: none
Loosened: none
Fingerprint: cb04d5ebf8a68c981bc8f9003e369c5a2d7b8ac6b7d2eef00b336f00da5e11b3
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged TASKS 4, 5 and 6 against `build-diff-2-1.md`, which holds the changes since group 2 started. `build-brief-2-1.md` and `build-brief-2-2.md` are identical and have no `Deviations` section. No decision records, no `build-plan-current.md`, and no earlier group-2 verify or remediate logs exist.
- Group 2 is the plan's last group, so no group gate runs after it. The two failing baseline tests below are logged here because the tasks broke them and the plan contract says each task fixes the tests it breaks.
- TASK 4: the source edits are done. `.bkit/core/workflows/bkit-build.md` Step 16 calls `branches scan-diff --paths=...` with no `--base=origin/dev`, and the Step 10 sentence names the feature's start commit. The `Test base` sentence in `.bkit/core/prompts/bkit-build-plan-verify.md` names the feature's start commit too, and `.bkit/instructions.md` carries the same wording. Its `TEST FIRST` test passes (`local-gate-audit.test.ts`: 38 passed, 2 skipped). `bkit check` exits 0 with no drift, and all host mirrors were re-rendered. Not ticked: the task broke `trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` and did not refresh the baseline.
- TASK 5: its `DONE WHEN` holds. `git grep -n "origin/dev\.\.\.HEAD" -- '.bkit/**/*.md'` returns nothing, and `bkit check` passes. The Diff per reader row, build Step 11 and Step 16 rows, and the `bkit-build-challenge-1` row are identical in the source and installed copies. Decision `960-feature-base-start-commit` is in `docs/decisions.jsonl` and names `665-challenge-small-change-threshold`. Not ticked: the build Step 10 row in both `workflows.md` copies still names `origin/dev` as the first holistic test base. That contradicts TASK 3's `cleanBase` fallback and TASK 4's workflow sentence. The plan's TASK 5 did not list that row, but the task's purpose is to bring the docs in line with the change.
- TASK 6: the source edits are done. `.bkit/core/workflows/bkit-debug.md` has no `DIFF_BASE`, Step 2 sets `{BASE_FLAG}`, and the Failure Path `context diff` (line 109) and the Step 11 `scan-diff` (line 737) pass `{BASE_FLAG}`. The debug Step 2 and Step 11 rows and the Diff per reader row match in both `workflows.md` copies. In `workflow-shape.test.ts`, the `BASE_FLAG` table entry is ` {BASE_FLAG}`, and the planned test replaced the old `debug diffs against DIFF_BASE on dev` test. The file passes (275 tests). Not ticked: the task broke `trackers.test.ts` `bkit-debug: the none render matches its baseline byte for byte` and did not refresh the baseline.
- Tests run, each file named: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` (pass), `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` (pass), and `.bkit/core/engine/render/trackers.test.ts` (2 of 107 failed). The vitest diff for each failed baseline shows only this group's lines, so nothing else has drifted.
- Test-first audit (`build-tests-green-2-1.md`): Enforced true, 0 gaps, 0 Unproven, and no `Updated tests` or `Already landed` sections. Both `TEST FIRST` tests were recorded red and then passed.
- Derived Test Matrix: the rows for tasks 4 and 6 are named in those tasks' `TEST FIRST` fields and pass. TASK 5 has no matrix row (`TEST FIRST: n/a`, docs and ledger only). The plan has no `Documentation Updates` section.
- Observability: this group changes no runtime logic, so `docs/observability.md` does not apply. `docs/testing.md` is present, and the audit tests are unit tier as it expects. The `.agents/docs.md` index was loaded.
- Out-of-scope observation, not a gap: debug's Diff per reader row names debug Step 10 as a reader. The only `context diff` line in `bkit-debug.md` is the Failure Path one at line 109. This was the case before this group, and the passing `diff per reader` test accepts it.

## Identified Gaps Log

3 gaps.

TASK 4: `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails — the task changed `.bkit/core/workflows/bkit-build.md` (Step 10 holistic base sentence, Step 16 `scan-diff` without `--base=origin/dev`) but left `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` at the old lines (800, 1177); review and refresh that baseline — Fixable: true
TASK 6: `.bkit/core/engine/render/trackers.test.ts` `bkit-debug: the none render matches its baseline byte for byte` fails — the task changed `.bkit/core/workflows/bkit-debug.md` (Failure Path `context diff`, Step 2 `{BASE_FLAG}`, Step 11 `scan-diff`) but left `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt` at `--base={DIFF_BASE}` and `startSha` as `DIFF_BASE` (lines 82, 235, 629); review and refresh that baseline — Fixable: true
TASK 5: the build `10 — Holistic Verification` row in `.bkit/core/.bkit/workflows.md:974` (and its copy in `.bkit/workflows.md`) still says the holistic tests run from "`origin/dev` for the first check", which TASK 3's `cleanBase` fallback and TASK 4's workflow sentence now make the feature's start commit; reword both rows identically — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 4 left the bkit-build none-render baseline stale
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:800` · **Round:** 1
  - **DONE WHEN:** `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` passes, and the baseline differs from its last commit only at the Step 10 holistic base sentence (line 800) and the Step 16 `scan-diff` line (line 1177)
  - **TEST FIRST:**
    - .bkit/core/engine/render/trackers.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 6 left the bkit-debug none-render baseline stale
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt:82` · **Round:** 1
  - **DONE WHEN:** `.bkit/core/engine/render/trackers.test.ts` `bkit-debug: the none render matches its baseline byte for byte` passes, and the baseline differs from its last commit only at the Failure Path `context diff` line (82), the Step 2 `startSha` sentence (235) and the Step 11 `scan-diff` line (629)
  - **TEST FIRST:**
    - .bkit/core/engine/render/trackers.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** TASK 5 left the build Step 10 row naming origin/dev as the first holistic test base
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:974` · **Round:** 1
  - **DONE WHEN:** the build `10 — Holistic Verification` row in `.bkit/core/.bkit/workflows.md` and in `.bkit/workflows.md` says the first holistic check tests from the feature's start commit, not `origin/dev`, and the two rows are identical
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
