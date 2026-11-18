Enforced: true
Verdict: CONCERNS
Gaps: 2
Unproven: 2

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1028-gate-fails-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "merging two branches that each lowered the prompts ceiling leaves a record that check passes" | no row | not passed |
| 6 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "check fails and lower refuses when a text folder is missing or empty" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "check, lower and raise each fail with one line naming the record when it is not valid JSON" | red | passed |
| 7 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "lower with an unstaged edit in another prompt file never leaves a record the committed tree fails" | no row | not passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise at a terminal shows the old and new ceilings and writes only after the typed confirmation" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise with a reason rewrites both ceilings and stores the reason on the folder that grew" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails above the ceiling and names total, ceiling, grown files and the raise command" | red | passed |

## Gaps

- Task 5 `not-green` — the named test "merging two branches that each lowered the prompts ceiling leaves a record that check passes" did not run; the report holds "bkit-text-ceiling check > fails above the ceiling and names total, ceiling, grown files and the raise command", "bkit-text-ceiling check > passes when a total equals its ceiling", "bkit-text-ceiling check > fails below the ceiling and names the lower command", "bkit-text-ceiling check > names only the files that grew since the record's last commit", "bkit-text-ceiling lower and raise > raise without a reason refuses and leaves the record unchanged", … — Fixable: true — log: TASK 5: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `merging two branches that each lowered the prompts ceiling leaves a record that check passes` — not-green — Fixable: true
- Task 7 `not-green` — the named test "lower with an unstaged edit in another prompt file never leaves a record the committed tree fails" did not run; the report holds "bkit-text-ceiling check > fails above the ceiling and names total, ceiling, grown files and the raise command", "bkit-text-ceiling check > passes when a total equals its ceiling", "bkit-text-ceiling check > fails below the ceiling and names the lower command", "bkit-text-ceiling check > names only the files that grew since the record's last commit", "bkit-text-ceiling lower and raise > raise without a reason refuses and leaves the record unchanged", … — Fixable: true — log: TASK 7: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `lower with an unstaged edit in another prompt file never leaves a record the committed tree fails` — not-green — Fixable: true

## Taken over

- Task 8 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise with a reason rewrites both ceilings and stores the reason on the folder that grew" — taken over from Task 2; recorded `red` after the rewrite

  ```diff
  -  it("raise with a reason rewrites both ceilings and stores the reason on the folder that grew", () => {
  +  it("raise with a reason rewrites both ceilings and stores the reason on the folder that grew", async () => {
       const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
  -    const r = run(["raise", "--reason", "needed for new step"], fx);
  -    expect(r.status).toBe(0);
  +    await callRaise({
  +      root: fx.root,
  +      record: fx.record,
  +      reason: "needed for new step",
  +      confirm: () => true,
  +    });
       const rec = readRecord(fx);
       expect(rec.workflows.ceiling).toBe(20);
       expect(rec.prompts.ceiling).toBe(5);
       expect(rec.workflows.reason).toBe("needed for new step");
       expect(rec.prompts.reason).toBe("prompts reason");
       expect(run(["check"], fx).status).toBe(0);
     });
  ```

- Task 8 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" — taken over from Task 2; recorded `red` after the rewrite

  ```diff
  -  it("raise without a reason refuses and leaves the record unchanged", () => {
  +  it("raise without a reason refuses and leaves the record unchanged", async () => {
       const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
       const before = fs.readFileSync(fx.record, "utf-8");
  -    const r = run(["raise"], fx);
  -    expect(r.status).toBe(1);
  -    expect(r.out).toMatch(/reason/i);
  +    await callRaise({ root: fx.root, record: fx.record, reason: "", confirm: () => true });
       expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
  -    const blank = run(["raise", "--reason", "  "], fx);
  -    expect(blank.status).toBe(1);
  -    expect(blank.out).toMatch(/reason/i);
  +    await callRaise({ root: fx.root, record: fx.record, reason: "  ", confirm: () => true });
       expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
     });
  ```

- Task 8 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails above the ceiling and names total, ceiling, grown files and the raise command" — taken over from Task 1; recorded `red` after the rewrite

  ```diff
     it("fails above the ceiling and names total, ceiling, grown files and the raise command", () => {
       const fx = makeFixture(
         { "a.md": 10, "b.md": 10 },
         { "p.md": 5 },
  -      { workflows: 15, prompts: 5 },
  +      { workflows: 12, prompts: 5 },
       );
       const r = run(["check"], fx);
       expect(r.status).toBe(1);
       expect(r.out).toContain("20");
  -    expect(r.out).toContain("15");
  +    expect(r.out).toContain("12");
  +    expect(r.out).toMatch(/\b8\b/);
       expect(r.out).toMatch(/a\.md|b\.md/);
  -    expect(r.out).toContain('pnpm bkit:text:ceiling raise --reason "<why>"');
  -    expect(r.out.toLowerCase()).toContain("owner");
  +    expect(r.out).not.toContain('raise --reason "<why>"');
  +    expect(r.out).toContain("pnpm bkit:text:ceiling raise --reason");
  +    expect(r.out.toLowerCase()).toContain("only the owner");
  +    expect(r.out.toLowerCase()).toContain("terminal");
     });
  ```


## Unproven

- Task 5 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "merging two branches that each lowered the prompts ceiling leaves a record that check passes" — no tests step recorded a red for it (`bkit tests red --group=2`); the owner answers it at the end of the build
- Task 7 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "lower with an unstaged edit in another prompt file never leaves a record the committed tree fails" — no tests step recorded a red for it (`bkit tests red --group=2`); the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow

 ✓ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts (13 tests) 938ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
   Start at  06:44:03
   Duration  1.08s (tests 96%, setup 3%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0FodvA/junit.xml
```
