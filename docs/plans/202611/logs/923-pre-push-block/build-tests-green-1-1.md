Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR whose base conflicts → blocked before bkit check, names the file" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR that merges cleanly → gates run, no message" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no open PR → no fetch, gates run" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "gh not on PATH → warns, gates run" | red | not passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "base fetch fails → warns, gates run" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "dev push → no PR lookup" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "min push of a conflicting PR → blocked" | red | passed |
| 2 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires only for a hook without merge-tree" | red | passed |

## Gaps

- Task 1 `not-green` — "gh not on PATH → warns, gates run" failure: EEXIST: file already exists, mkdir '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-prepush-conflict-kwwhxM/sysbin' — Fixable: true — log: TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run` — not-green — Fixable: true

## Already landed

- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR that merges cleanly → gates run, no message" — passed at the group's red, and the tests step accepted it: today's hook has no conflict check, so a clean run passes already; no red is due
- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no open PR → no fetch, gates run" — passed at the group's red, and the tests step accepted it: today's hook never fetches or warns; no red is due
- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "dev push → no PR lookup" — passed at the group's red, and the tests step accepted it: today's hook already skips the lookup on dev; no red is due

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```
     ✓ direnv not on PATH → gates run, no warning 1753ms
     ✓ CI set → no direnv call 771ms
     ✓ delete-only push through direnv exec → exit 0, no gate 1089ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1850ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1220ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1865ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 1829ms
   ❯ .husky/pre-push PR conflict (7)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 3746ms
     ✓ open PR that merges cleanly → gates run, no message 4086ms
     ✓ no open PR → no fetch, gates run 3598ms
     × gh not on PATH → warns, gates run 2621ms
     ✓ base fetch fails → warns, gates run 3033ms
     ✓ dev push → no PR lookup 1574ms
     ✓ min push of a conflicting PR → blocked 2170ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > gh not on PATH → warns, gates run
Error: EEXIST: file already exists, mkdir '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-prepush-conflict-kwwhxM/sysbin'
 ❯ pathWithoutGh .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1659:8
    1657|   const pathWithoutGh = () => {
    1658|     const dir = path.join(tmp, "sysbin");
    1659|     fs.mkdirSync(dir);
       |        ^
    1660|     for (const tool of [
    1661|       "sh",
 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1771:39

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 122 passed (123)
   Start at  11:35:52
   Duration  262.88s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gTHEw1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
