Verdict: CONCERNS
Failures: 3
Fingerprint: 7730fbc2b0809a8cb07f418e434ee8aaaf73a118ddbac35ba805cc4c55f8d99f
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-811-publish-dev-refused.md`, read in full (639 lines; no `partial diff coverage` marker).
- Code read beyond the diff: `landFailedRecord`, `handoverVerb`, `closePr` and `shipClose` in `.bkit/core/engine/commands/workflow/workflows.ts`; `pushToDev` and `DevPush` in `.bkit/core/engine/commands/land.ts`; `probePr` and `mergePr` in `.bkit/core/engine/commands/workflow/prs.ts`; `runGh` and `runTool` in `.bkit/core/engine/commands/lib.ts`; the handover test helpers in `.bkit/core/engine/commands/workflow/workflows.test.ts`.
- Docs: `.agents/docs.md`, `docs/architecture.md` (§ Deterministic bookkeeping), `docs/security.md` (§ Repository controls, § Shell Injection), `docs/deployments.md` (§ Autonomous phase-close prerequisites), `.bkit/core/workflows/bkit-ship.md` (Failure Path), and the refused-flush rows in `docs/failures.jsonl` and `docs/deferrals.jsonl`.
- Not run: no tests, build or install (the mandate forbids them). Every finding is proved by reading the code, and each TEST FIRST was traced against the code the diff leaves.

## Notes

- Checked and clean: `closePr`, `probePr`, `mergePr` (without `shipRetry`) and `runGh` never throw, so a PR failure inside the `refused` handler cannot fall into the exit-11 "bookkeeping commit failed" catch. `pushToDev` calls `refused` once and returns straight after, so no retry runs it twice. `viaPr: false` passes no handler, so `--push` from a shared checkout behaves as before. The `(linkRef ?? ref)!` is reached only when `ref !== null`. `dist/commands/workflow/workflows.js` matches the source change.
- The test helpers lifted to file scope (`ghStub`, `withGhOnPath`) still register their temp dirs in the file-scope `dirs` list, and every new or changed test reaches its assertions, so none passes silently.
- Not raised, because the plan records it as a known limit to propose separately: a `--flush` from a shared checkout whose record lands through a PR returns no `sha`, so the carried files are not handed back.
- Cross-reference: `docs/deployments.md` § Autonomous phase-close prerequisites requires "Automatically delete head branches", which is what breaks the TASK 3 link on a hand merge. A merge that fails (review or status-check rules on `dev`) leaves the branch in place, which is the TASK 1 trigger. `.agents/rules.md` § Destructive git forbids every force-push flavour, which is why TASK 1 needs an owner decision.
- No finding is CRITICAL. The engine derives the header `Failures` from this result's findings.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A second refused flush of one FID fails its branch push, because the first flush left `ship-failed/{FID}` on origin, so a cloud runner loses that record again
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1495` · **Round:** 1
  - **DONE WHEN:** The owner decides how a refused flush publishes when origin already holds `ship-failed/{FID}`. That happens after an open PR whose merge failed, after a branch push whose `gh pr create` failed, or after a merged head that was not deleted. The options are to update the bkit-owned branch with a lease and reuse its open PR, or to mint a branch name per attempt. No agent can settle it, because a lease update is a force push that the repo's git rules forbid, and the plan fixes the branch name. Once decided, a second refused flush of one FID lands its record through a PR and exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev twice for one FID publishes the second record through a PR` fails on the second flush's `HEAD:refs/heads/ship-failed/12-export-csv` push being rejected as non-fast-forward (the first commit is not on `dev`), so it exits 10 with `close branch push failed for ship-failed/12-export-csv`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** When `gh pr create` fails after the branch push, the flush says the record is only in the book, though origin already holds it on a `ship-failed/{FID}` branch that no line names
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1509` · **Round:** 1
  - **DONE WHEN:** A `gh pr create` failure after a successful branch push names the pushed `ship-failed/{FID}` branch in its failure reason, so the exit-10 log says the record is on that branch with no PR.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with gh pr create failing names the pushed ship-failed branch` fails on the log holding only `gh pr create failed: HTTP 422` and `ship FAILED record kept in {wt}`, with no `ship-failed/12-export-csv`, while origin holds that branch
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A flush whose `ship-failed/{FID}` PR opened but did not merge links the tracker comment at that branch, and the link dies once the owner merges the PR and GitHub deletes the head branch
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:830` · **Round:** 1
  - **DONE WHEN:** A flush whose PR opened but did not merge posts a handover link that still opens after the owner merges that PR and GitHub deletes `ship-failed/{FID}`: the link targets `dev`, as in the merged case.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with the merge failing links the handover comment at dev` fails on the comment holding `/blob/ship-failed/12-export-csv/` (a `gh` stub whose `pr merge` exits 1 gives `close-pr-open`, and `linkRef` takes the branch)
<!-- bkit:task 3 end -->
