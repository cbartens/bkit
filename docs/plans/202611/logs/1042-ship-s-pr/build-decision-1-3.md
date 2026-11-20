Question: CHANGED_TESTS
From: summary
Pause step: 15
Plan: docs/plans/202611/1042-ship-s-pr-plan.md

**Q1 — Task 1 --flush refused by dev does not merge a leftover tip that changes code:** A code step had to add setup lines to one planned test after it was recorded failing. As written, the test never put a failed ship record into the checkout it flushes, so the flush stopped early with nothing to commit and never reached the leftover-branch check it is meant to prove. The added lines write that record, and every assertion is unchanged. The test is `.bkit/core/engine/commands/workflow/workflows.test.ts` "--flush refused by dev does not merge a leftover tip that changes code", and the change is:

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

Accept the change?
A) Accept — the item is recorded as accepted and the build moves on
B) Stop — the run stops and hands over; the next run resumes here
Recommended: A) Accept — the lines only add the setup the test needs to reach the check it names, and no assertion changed
Default if unanswered: the run waits for you; taken as A when nobody can be asked
