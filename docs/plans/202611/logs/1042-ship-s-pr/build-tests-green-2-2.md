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
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a symlinked ledger" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "restoreBranchRows writes nothing through a symlinked ledger" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev with a fork PR on the ship-failed branch name opens its own PR" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "a second refused close waits for the reused PR head to reach the pushed tip before merging" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that adds a skill" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl" | red | passed |

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

