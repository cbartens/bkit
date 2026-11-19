Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1031-pre-push-refuses-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses a docs/audits change even when minPushPaths matches it" | red | passed |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses a change to an audit template's project section only" | red | passed |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main accepts a plans-only range" | red | passed |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main finds an audit report already on origin/dev but not on origin/main" | red | passed |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main accepts a range that looks empty against origin/dev and adds no audit file" | red | passed |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main is not proven a min push when origin/main does not resolve" | red | passed |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "without --target, an audit-only range is still a min push" | passed-accepted | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit report to main under a [skip ci] head → blocked before any gate" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit-template project section to main under a [skip ci] head → blocked before any gate" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "plans-only change to main under a [skip ci] head → allowed, light gate" | passed-accepted | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "one push updating dev and main with an audit-only [skip ci] head → blocked before any gate" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit report to dev under a [skip ci] head → allowed, light gate" | updated | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit-template project section to dev under a [skip ci] head → allowed, light gate" | updated | passed |
| 4 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template's project section even when minPushPaths matches docs/**" | red | passed |
| 5 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses a docs/audits file whose name has non-ASCII characters" | red | passed |
| 6 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main" | red | passed |
| 6 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template new to main whose project section was edited on origin/dev" | red | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/commands/ci/ci.test.ts` "without --target, an audit-only range is still a min push" — passed at the group's red, and the tests step accepted it: today's min-push already accepts docs/audits/** without a target; it is the guard that the default stays; no red is due
- Task 2 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "plans-only change to main under a [skip ci] head → allowed, light gate" — passed at the group's red, and the tests step accepted it: regression guard; the hook already lets a non-audit min push to main through on the light gate, and the planned failure (a non-audit push wrongly blocked) only appears if the code step breaks it. Left as written, not padded.; no red is due

## Updated tests

- Task 2 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit report to dev under a [skip ci] head → allowed, light gate" — an existing test the tests step changed since `77fd573cd`; the update may add expectations, never remove or loosen one. additive: no line of the test was removed, so no expectation was dropped — read the added lines for one that disables an earlier expectation

  ```diff
       it(`${hook}: audit report to dev under a [skip ci] head → allowed, light gate`, () => {
         const head = commitFiles(
           { "docs/audits/202611/security.md": "# Report\n" },
           "docs(1): audit report bkit [skip ci]",
         );
         const r = push(hook, head, "refs/heads/dev");
         expect(r.status).toBe(0);
         expect(r.stderr).not.toContain("CI-suppressing token");
  +      expect(r.stderr).not.toContain("BLOCKED");
         expect(r.calls).toContain("bkit:gate:min");
         expect(r.calls).not.toContain("bkit:gate:static-unit");
       });
  ```

- Task 2 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit-template project section to dev under a [skip ci] head → allowed, light gate" — an existing test the tests step changed since `77fd573cd`; the update may add expectations, never remove or loosen one. additive: no line of the test was removed, so no expectation was dropped — read the added lines for one that disables an earlier expectation

  ```diff
       it(`${hook}: audit-template project section to dev under a [skip ci] head → allowed, light gate`, () => {
         const template = (project: string) =>
           `<!-- bkit:start -->\n<!-- managed-version: 1 -->\nblock\n<!-- bkit:end -->\n\n## Project Instructions\n${project}\n`;
         const file = "docs/templates/bkit-audit-x.md";
         const remote = commitFiles({ [file]: template("old") }, "docs(1): add template");
         gitIn("update-ref", "refs/remotes/origin/dev", remote);
         const head = commitFiles(
           { [file]: template("new project text") },
           "docs(1): audit project section bkit [skip ci]",
         );
         const r = push(hook, head, "refs/heads/dev", remote);
         expect(r.status).toBe(0);
         expect(r.stderr).not.toContain("CI-suppressing token");
  +      expect(r.stderr).not.toContain("BLOCKED");
         expect(r.calls).toContain("bkit:gate:min");
         expect(r.calls).not.toContain("bkit:gate:static-unit");
       });
  ```

