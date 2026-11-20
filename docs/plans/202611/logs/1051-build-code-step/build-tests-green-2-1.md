Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1051-build-code-step-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failing bkit:generate exits 16 with nothing written and nothing committed" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate" | red | passed |

## Gaps

None.

## Taken over

- Task 3 `.bkit/core/engine/commands/workflow/steps.test.ts` "a failing bkit:generate exits 16 with nothing written and nothing committed" — taken over from Task 1; recorded `red` after the rewrite

  ```diff
     it("a failing bkit:generate exits 16 with nothing written and nothing committed", async () => {
  -    const cwd = stale("echo generate-boom >&2; exit 3");
  +    const cwd = stale(BOOM, "#!/bin/sh\nexit 0\n");
       const head = git(cwd, "rev-parse", "HEAD");
  +    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
       const r = await run(cwd, EXECUTE);
  -    expect(r.code).toBe(16);
  +    vi.unstubAllEnvs();
  +    expect(r.code).toBe(0);
  +    expect(r.code).not.toBe(16);
       expect(r.err).toContain("generate-boom");
  -    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  -    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(SEED);
  +    expect(git(cwd, "rev-parse", "HEAD")).not.toBe(head);
  +    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).not.toBe(SEED);
  +    expect(frictionRows(cwd)).toHaveLength(1);
     });
  ```

