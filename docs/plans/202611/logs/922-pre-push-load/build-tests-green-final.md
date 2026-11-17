Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/922-pre-push-load-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "trusted .envrc → the gate sees its variables" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "untrusted .envrc → blocked before bkit check, names direnv allow" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no .envrc → no direnv call" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "direnv not on PATH → gates run, no warning" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "CI set → no direnv call" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "delete-only push through direnv exec → exit 0, no gate" | red | passed |
| 2 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "setup with an .envrc differing from the main checkout's reports that the push will block" | red | passed |
| 5 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "trusted .envrc → .bkit/.env tooling keys do not reach the gate" | red | passed |
| 6 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it" | red | passed |
| 9 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED" | updated | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no .envrc → no direnv call" — passed at the group's red, and the tests step accepted it: negative case; the current hook never calls direnv, so it already holds; no red is due
- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "direnv not on PATH → gates run, no warning" — passed at the group's red, and the tests step accepted it: negative case; the current hook never calls direnv, so it already holds; no red is due
- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "CI set → no direnv call" — passed at the group's red, and the tests step accepted it: negative case; the current hook never calls direnv, so it already holds; no red is due

## Updated tests

- Task 9 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED" — an existing test the tests step changed since `c88e5c05a`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED", () => {
  -    const env = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };
  +    const env: NodeJS.ProcessEnv = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };
       delete env.CI;
       delete env.GITHUB_ACTIONS;
       const result = spawnSync(
         "pnpm",
         [
           "exec",
           "vitest",
           "run",
           "-c",
           "vitest.unit.config.ts",
           ".bkit/core/engine/checks/tips/catalogue.test.ts",
           "-t",
           "inside the pre-push hook",
         ],
         { cwd: process.cwd(), encoding: "utf-8", timeout: 120_000, env },
       );
       expect(`${result.stdout}\n${result.stderr}`, "vitest output").toContain("1 passed");
       expect(result.status).toBe(0);
     }, 150_000);
  ```

