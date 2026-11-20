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

