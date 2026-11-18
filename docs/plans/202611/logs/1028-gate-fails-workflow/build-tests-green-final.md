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
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails above the ceiling and names total, ceiling, grown files and the raise command" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "passes when a total equals its ceiling" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails below the ceiling and names the lower command" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "names only the files that grew since the record's last commit" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise with a reason rewrites both ceilings and stores the reason on the folder that grew" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "lower rewrites both ceilings and keeps each reason" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "lower refuses when a total is above its ceiling" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "bkit's own workflow and prompt folders sit exactly at the committed ceilings" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/package-json.test.ts` "bkit:text:ceiling runs scripts/gate/bkit-text-ceiling.mjs" | red | passed |
| 5 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "merging two branches that each lowered the prompts ceiling leaves a record that check passes" | no row | not passed |
| 6 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "check fails and lower refuses when a text folder is missing or empty" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "check, lower and raise each fail with one line naming the record when it is not valid JSON" | red | passed |
| 7 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "lower with an unstaged edit in another prompt file never leaves a record the committed tree fails" | no row | not passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise at a terminal shows the old and new ceilings and writes only after the typed confirmation" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise with a reason rewrites both ceilings and stores the reason on the folder that grew" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "fails above the ceiling and names total, ceiling, grown files and the raise command" | red | passed |
| 9 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" | passed-accepted | passed |
| 9 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise at a terminal shows the old and new ceilings and writes only after the typed confirmation" | passed-accepted | passed |
| 10 | `scripts/gate/bkit-gate-changed.test.mjs` "a changed workflow or prompt file runs the text ceiling test" | red | passed |
| 11 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" | updated | passed |

## Gaps

- Task 5 `not-green` — the named test "merging two branches that each lowered the prompts ceiling leaves a record that check passes" did not run; the report holds "bkit-text-ceiling check > fails above the ceiling and names total, ceiling, grown files and the raise command", "bkit-text-ceiling check > passes when a total equals its ceiling", "bkit-text-ceiling check > fails below the ceiling and names the lower command", "bkit-text-ceiling check > names only the files that grew since the record's last commit", "bkit-text-ceiling lower and raise > raise without a reason refuses and leaves the record unchanged", … — Fixable: true — log: TASK 5: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `merging two branches that each lowered the prompts ceiling leaves a record that check passes` — not-green — Fixable: true
- Task 7 `not-green` — the named test "lower with an unstaged edit in another prompt file never leaves a record the committed tree fails" did not run; the report holds "bkit-text-ceiling check > fails above the ceiling and names total, ceiling, grown files and the raise command", "bkit-text-ceiling check > passes when a total equals its ceiling", "bkit-text-ceiling check > fails below the ceiling and names the lower command", "bkit-text-ceiling check > names only the files that grew since the record's last commit", "bkit-text-ceiling lower and raise > raise without a reason refuses and leaves the record unchanged", … — Fixable: true — log: TASK 7: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `lower with an unstaged edit in another prompt file never leaves a record the committed tree fails` — not-green — Fixable: true

## Already landed

- Task 9 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise without a reason refuses and leaves the record unchanged" — passed at the group's red, and the tests step accepted it: the test already wraps both refusal calls in expect(...).rejects.toThrow(/reason/) and the raiseCeilings export in scripts/gate/bkit-text-ceiling.mjs already satisfies it; no red is due
- Task 9 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise at a terminal shows the old and new ceilings and writes only after the typed confirmation" — passed at the group's red, and the tests step accepted it: already wraps the declining call in rejects.toThrow(/cancelled|confirmation/) and asserts the record is byte-identical; raiseCeilings in scripts/gate/bkit-text-ceiling.mjs satisfies it; no red is due

## Updated tests

- Task 11 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" — an existing test the tests step changed since `a24d435a6`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("raise from a non-interactive caller refuses and leaves the record unchanged", () => {
       const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
       const before = fs.readFileSync(fx.record, "utf-8");
       const variants: { extra: string[]; env: Record<string, string> }[] = [
         { extra: [], env: {} },
         { extra: ["--yes"], env: {} },
         { extra: ["--force"], env: {} },
         { extra: [], env: { CI: "1" } },
       ];
       for (const v of variants) {
         const r = spawnSync(
           "node",
           [SCRIPT, "raise", "--reason", "x", ...v.extra, "--root", fx.root, "--record", fx.record],
  -        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "yes\n" },
  +        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "RAISE\n" },
         );
         expect(r.status).not.toBe(0);
         expect(r.status).not.toBeNull();
  +      expect(r.stdout + r.stderr).toMatch(/runs only at a terminal/);
         expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
       }
     });
  ```


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
  +    await expect(
  +      callRaise({ root: fx.root, record: fx.record, reason: "", confirm: () => true }),
  +    ).rejects.toThrow(/reason/);
       expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
  -    const blank = run(["raise", "--reason", "  "], fx);
  -    expect(blank.status).toBe(1);
  -    expect(blank.out).toMatch(/reason/i);
  +    await expect(
  +      callRaise({ root: fx.root, record: fx.record, reason: "  ", confirm: () => true }),
  +    ).rejects.toThrow(/reason/);
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

- Task 11 `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" — taken over from Task 8; recorded `updated` after the rewrite

  ```diff
     it("raise from a non-interactive caller refuses and leaves the record unchanged", () => {
       const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
       const before = fs.readFileSync(fx.record, "utf-8");
       const variants: { extra: string[]; env: Record<string, string> }[] = [
         { extra: [], env: {} },
         { extra: ["--yes"], env: {} },
         { extra: ["--force"], env: {} },
         { extra: [], env: { CI: "1" } },
       ];
       for (const v of variants) {
         const r = spawnSync(
           "node",
           [SCRIPT, "raise", "--reason", "x", ...v.extra, "--root", fx.root, "--record", fx.record],
  -        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "yes\n" },
  +        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "RAISE\n" },
         );
         expect(r.status).not.toBe(0);
         expect(r.status).not.toBeNull();
  +      expect(r.stdout + r.stderr).toMatch(/runs only at a terminal/);
         expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
       }
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

 ✓ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts (14 tests) 3916ms
   ✓ bkit-text-ceiling check (4)
     ✓ fails above the ceiling and names total, ceiling, grown files and the raise command 476ms
     ✓ names only the files that grew since the record's last commit 482ms
   ✓ bkit-text-ceiling lower and raise (7)
     ✓ raise from a non-interactive caller refuses and leaves the record unchanged 384ms
   ✓ bkit-text-ceiling missing folders and a broken record (2)
     ✓ check fails and lower refuses when a text folder is missing or empty 699ms
     ✓ check, lower and raise each fail with one line naming the record when it is not valid JSON 570ms

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  12:02:13
   Duration  4.48s (tests 95%, transform 3%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3451xN/junit.xml
```
