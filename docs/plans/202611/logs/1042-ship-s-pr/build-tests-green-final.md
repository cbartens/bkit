Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1042-ship-s-pr-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev twice for one FID publishes the second record through a PR" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with ship-failed left on origin and no PR opens one PR on that branch" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with a squash-merged ship-failed tip left on origin lands the new record" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "a second refused close for one FID reuses the open ship-close PR" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with gh pr create failing names the pushed ship-failed branch" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev links the handover comment at the pushed commit when the PR did not merge" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev keeps the unmerged handover link readable after the branch is deleted" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a symlinked ledger" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "restoreBranchRows writes nothing through a symlinked ledger" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with a fork PR on the ship-failed branch name opens its own PR" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "a second refused close waits for the reused PR head to reach the pushed tip before merging" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a skill" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev runs the landing gate on a merged leftover tip" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds files below a deeper logs folder" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a non-log file to the run's log folder" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that deletes ledger rows" | red | passed |

## Gaps

None.

## Changed by a code step

- Task 1 `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code" — a code step changed it under a BLOCKED line: setup-only addition: the test never wrote the ship FAILED record into `wt`, so the flush skipped with nothing-to-commit; assertions unchanged; the owner answers it at the end of the build

  ```diff
     it("--flush refused by dev does not merge a leftover tip that changes code", async () => {
       let tip = "";
       const { remote, wt } = refusedAfter((rm) => {
         tip = leftBranch(rm, `ship-failed/${FID}`, { ...earlier, "src/app.ts": "export {};\n" });
       });
  +    write(
  +      wt,
  +      `${REL}/status.jsonl`,
  +      jsonl([{ type: "workflow-failed", workflow: "ship", note: "new" }]),
  +    );
       const gh = ghStub(`ship-failed/${FID}`, "dev", { openAfterCreate: true });
       const r = await withGhOnPath(gh.bin, () => flush(wt));
       expect(r.code).toBe(10);
       expect(r.err).toContain(`ship-failed/${FID}`);
       expect(r.err).toContain("src/app.ts");
       expect(git(remote, "rev-parse", `ship-failed/${FID}`)).toBe(tip);
     });
  ```

