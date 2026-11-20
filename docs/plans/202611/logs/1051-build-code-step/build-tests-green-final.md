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
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a code step finish builds the declared bkit:generate output first, so a stale-output hook lets the commit through" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the gaps-remediate and holistic steps build the output too" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a repo with no bkit:generate script runs nothing and a stale-output hook still exits 8" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "an empty bkit:generate script counts as undeclared" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a step that is not a code step never runs bkit:generate" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failing bkit:generate exits 16 with nothing written and nothing committed" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a hook refusal about something else stays exit 8 after bkit:generate ran" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "--commit=none does not run bkit:generate" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a FAIL code step whose bkit:generate fails still lands its row so the remediate loop runs" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a HANDOVER code step whose bkit:generate fails still lands its row so the handover re-run happens" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a PASS code step whose bkit:generate fails lands with generate failed, a friction row and the commit" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failing bkit:generate exits 16 with nothing written and nothing committed" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a generated bkit.workflows key in a repo that is not bkit's own exits 13, names bkit:generate and commits nothing" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a generated added bkit.workflows key rides the step commit and is printed and on the row" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo the step's own bkit.workflows edit made before bkit:generate exits 13 as the step's edit" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a bkit:generate that changes an existing bkit.workflows value exits 13 and names bkit:generate" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a key the code agent's own bkit:generate run added rides the step commit" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a generated added key left by a finish the hook refused rides the re-run" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a hand-added bkit.workflows key that bkit:generate does not produce exits 13 and leaves package.json as the step wrote it" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a seeded bkit.workflows key with a hand-changed value exits 13 and keeps the hand value" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json" | passed-accepted | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a bkit:generate that fails after a bkit.workflows difference restores the step's package.json and exits 13" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failed bkit:generate friction row is not folded into an earlier test-lock row of the same step" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/steps.test.ts` "in bkit's own repo a finish that cannot write package.json back says it was not restored and names the write error" | red | passed |

## Gaps

None.

## Already landed

- Task 5 `.bkit/core/engine/commands/workflow/steps.test.ts` "outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json" — passed at the group's red, and the tests step accepted it: pins unchanged behaviour, already satisfied by the current exit 13 path in steps.ts; no red is due

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

