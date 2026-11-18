Verdict: CONCERNS
Failures: 1
Fingerprint: cb62e81dcec32fb237a8cdb03ee9c1897a151418de634ecfeb8c374154586286
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Round 2 of Build Step 11, bugs and edge-cases lens only. Inputs: `docs/plans/202611/1018-subagent-commits-makes-plan.md` and the full run diff `tmp/bkit-diff-1018-subagent-commits-makes.md` (full coverage, no `partial diff coverage` marker).
- Code traced: `.bkit/core/engine/commands/workflow/step-base.ts`, `tests-changed.ts` (default-base logic, lines 218-227), `branches.ts` `scanDiffVerb` (lines 1665-1775, `--since-step` at 1691-1706), `steps.ts` `writeStepRow` (line 670), `.bkit/core/engine/commands/lib.ts` `resolveActiveRun` (lines 548-602) and `statusLocation` (line 1201), `worktrees.ts` adopt mode (lines 1289-1330), `runtime.ts` `capable()`, and the `bkit-build.md` Step 2, 3, 9 and 10 call sites.
- Docs read: `.agents/docs.md`, `docs/architecture.md`, `docs/security.md`, `docs/testing.md`, `docs/knowledge.jsonl` (nothing relevant).

## Notes

- TASK 1 evidence: the real tree holds four in-progress build runs (1018, 803, 887, 895), so the no-fid scan in `resolveActiveRun` returns nothing. On `feat/1018-subagent-commits-makes` `stepBase` resolves through `branchFid` and returns `af46197ce`; in a scratch clone on branch `claude/cloud-session` it returns null, and `tests changed` falls back to `HEAD`, so a subagent's committed files drop out of the lint and typecheck list. Adopt mode keeps a non-`feat/` branch for build on runtimes outside `runtime.ts` `capable()` (LOCAL, GITHUB_ACTION, CLOUD_CURSOR), for example CLOUD_CLAUDE. Cross-reference: `docs/testing.md:572` (Changed files bullet) promises the step-base measure without that branch-name condition. Distinct from the deferred `tests-changed-ts-207` LOW (wrong run picked on `dev`); a fix must not widen that one.
- Open check closed with no finding: an unlisted non-zero `steps finish` exit before the Step 9 or Step 10 `scan-diff` routes to the Failure Path under the general Commands rule at `.bkit/core/workflows/bkit-build.md:36` ("Exit non-zero with no `Route:` or recovery under **Failures** → **Failure Path**"), so the scan never runs against the previous attempt's row.
- Checked with no finding: the `build-takeover` row skip; resume and rebase (Step 3 rewrites the start rows after the rebase); Step 9 and Step 10 fail closed on `scan-diff` exit 23; the in-place shared-branch `HEAD` rule; debug flows; the `uncommitted` stamp on every `--commit=none` writer (`bkit-build.md:541`, `:702`, `:1454`); git calls take argument arrays (`docs/security.md` § Shell Injection); no new test passes without asserting.
- Observed, not raised: a malformed `status.jsonl` line makes `tests changed` exit 3, the same code as EXIT_NO_GATE, but the run fails at the next `steps finish` anyway; the `build-takeover` literal is duplicated and could drift, though no test could fail on it today; repos with more than 500 FIDs fall back to `HEAD` after a month rollover (pre-existing `ACTIVE_RUN_SCAN_CAP`); an amended step commit can move the row's commit, a by-hand edge case.
- Doc drift for the doc-sync pass, outside this lens: `docs/testing.md:572` leaves out the in-place `HEAD` exception; the `scan-diff --file` help says "default: the single in-progress run" though the branch FID is tried first; the `.bkit/workflows.md` row-field notes do not mention the takeover skip.
- Already deferred in `docs/deferrals.jsonl`, not raised again: `step-base-ts-48` (unknown `--since-step` name), `step-base-ts-20` (same-second `-S` match), `steps-ts-452` (by-hand `uncommitted` field), `tests-changed-ts-207` (another feature's run on `dev`).
- Edits to `.bkit/instructions.md` and the Step 9 prose fall outside the bugs lens.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A build runs in a cloud runtime that adopts its session branch in place (`claude/...`, not `feat/{FID}`), the tree carries another feature's in-progress run from `dev`, a subagent commits its edit, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:47` · **Round:** 1
  - **DONE WHEN:** With no `--file`, `stepBase` finds the checkout's own run on a branch that is not `feat/{FID}` (an adopt-mode session branch, or a debug run's named `--branch`), for example the one in-progress run whose `status.jsonl` this branch's own commits or working tree changed, so another feature's in-progress run in the tree no longer makes `bkit tests changed` measure from `HEAD` there; the existing planned tests still pass unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists the subagent's committed file on an adopted branch when another feature's run is also in progress` fails on `files` being `[]` instead of `["src/a.ts"]`: on `dev` commit `docs/plans/202611/logs/2-y/status.jsonl` holding only a `workflow-started` row, branch `claude/session` from it, commit run `1-x`'s `workflow-started` row and one `step-done` row, then commit `src/a.ts`; `branchFid` is undefined, the scan finds two in-progress runs, so `stepBase` returns null and the base is `HEAD`
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress` fails on `stepBase({ cwd })` returning null instead of the commit that holds run `1-x`'s last `step-done` row
<!-- bkit:task 1 end -->
