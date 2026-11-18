Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1028-gate-fails-workflow-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 10 | `scripts/gate/bkit-gate-changed.test.mjs` "a changed workflow or prompt file runs the text ceiling test" | red | passed |
| 11 | `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` "raise from a non-interactive caller refuses and leaves the record unchanged" | updated | passed |

## Gaps

None.

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

