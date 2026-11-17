# Brief: group 2 — Workflow, prompt and docs (tests)

Plan: Feature base for build and debug diffs Implementation Plan

## Why and what

### Context & Goals

When local `dev` is ahead of `origin/dev`, a build branch cut from local `dev` measures its diff from `origin/dev`, so unpushed `dev` commits count as the feature's. Add one engine helper, `featureBase`, and make `bkit context diff`, `bkit challenge gate`, `bkit branches scan-diff`, #951's `cleanBase` and `/bkit-debug` use it by default. Source: issue #960.

## Where it fits

- Group 1: Feature base in the engine — done
  - TASK 1: Add `featureBase` and remove `DIFF_BASE` — done
  - TASK 2: Default the diff readers to `featureBase` — done
  - TASK 3: Use `featureBase` as the holistic test base fallback — done
- Group 2: Workflow, prompt and docs — this group
  - TASK 4: Drop `origin/dev` as the diff and test base in the build workflow and verify prompt — open
  - TASK 5: Bring the docs and decisions in line — done
  - TASK 6: Let `/bkit-debug` off `dev` use the feature base — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Drop `origin/dev` as the diff and test base in the build workflow and verify prompt
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the migration scan calls `bkit branches scan-diff` without `--base=origin/dev`; the holistic `Test base` wording from #951 names the feature's start commit for the first check
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the `Test base` sentence from #951 says the first check tests from the feature's start commit, not `origin/dev`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** the audit test passes, and after `bkit install` re-renders the host mirrors of both files, `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `build workflow and verify prompt name no origin/dev diff or test base` fails on the migration scan's `--base=origin/dev`

<!-- bkit:task 4 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Let `/bkit-debug` off `dev` use the feature base
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 2 sets `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty, in the same form as `{BRANCH_FLAG}`; `DIFF_BASE` and its `origin/dev` fallback are removed
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Failure Path `context diff` and the Step 11 `scan-diff` pass `{BASE_FLAG}` instead of `--base={DIFF_BASE}`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the debug Step 2 and Step 11 rows and the Diff per reader row describe `{BASE_FLAG}` instead of `DIFF_BASE`
  - **UPDATE:** `.bkit/workflows.md`: the same three rows, kept identical to `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `diff per reader` table's `BASE_FLAG` entry for debug becomes ` {BASE_FLAG}`; the `debug diffs against DIFF_BASE on dev` test is replaced by the test below
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the audit test passes, and after `bkit install` re-renders the host mirrors of `bkit-debug.md`, `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug passes --base only when it runs in place on dev` fails on Step 2's `origin/dev` when null fallback

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Default the diff readers to `featureBase` — `.bkit/core/engine/commands/workflow/context.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/engine/commands/workflow/branches.ts`
- TASK 3 (group 1, done): Use `featureBase` as the holistic test base fallback — `.bkit/core/engine/commands/workflow/status.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| build workflow and verify prompt name no origin/dev diff or test base | unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 4 |
| debug passes --base only when it runs in place on dev | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
