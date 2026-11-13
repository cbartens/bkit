Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/922-pre-push-load-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED" | red | failure: vitest output: expected '\n RUN v5.0.5 /Users/christian/Docum…' to contain '1 passed' |
| 7 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate" | red | failure: .bkit/templates/.husky/pre-push: expected 'pnpm: -s bkit ci push-gate --gate=bki…' to contain 'BKIT_GH_TOKEN=unset' |
| 8 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it" | red | failure: .bkit/templates/.husky/pre-push: expected 'pnpm: -s bkit ci push-gate --gate=bki…' to contain 'BKIT_GH_TOKEN=unset' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

[test-timeout-budget] load average 4.0 on 10 cores: unit limits 6500ms per test, 13000ms per hook (x1.30)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (112 tests | 3 failed) 117207ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 32ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 489ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 429ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 40ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 638ms
     ✓ .husky/pre-push: empty stdin → gates still run 424ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 195ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 21ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 181ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 205ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 214ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 53ms
     ✓ .husky/pre-push: first and last lines name the log 236ms
     ✓ .husky/pre-push: the hook body runs once 200ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 178ms
     ✓ tag delete alongside that tag → still skipped 178ms
     ✓ tag on a commit no origin branch holds → gates run 584ms
     ✓ tag pushed with a branch → gates run 518ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 173ms
     ✓ release branch and a tag, both already tested → still skipped 214ms
     ✓ branch with files no origin dev / main tip has → gates run 573ms
     ✓ dev push with the files origin/dev already has → gates run 555ms
     ✓ main push with the files origin/main already has → gates run 671ms
     ✓ no origin dev / main ref fetched → a branch push gates 618ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 884ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 699ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 735ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 550ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2161ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1597ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 905ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1213ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1412ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 989ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1150ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1142ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 673ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 651ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 496ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 448ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 473ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 523ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 474ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 541ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 454ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 451ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 455ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 494ms
     ✓ .husky/pre-push: a gate fails → no disk prune 479ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 516ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 475ms
     ✓ a stale register stops the push before any gate runs 441ms
     ✓ bkit check fails → the push stops before any gate runs 420ms
     ✓ the dependency audit runs before any gate, when its script is present 480ms
     ✓ no dependency-audit script → skipped, the gates still run 460ms
     ✓ no register script → skipped, the gates still run 445ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 498ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 415ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 441ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 440ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 710ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 725ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 816ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 801ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 23ms
     ✓ push to dev, register current → push goes on 22ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 24ms
     ✓ push to another branch → no check, push goes on 580ms
     ✓ revert push to dev → no check, push goes on 362ms
     ✓ graphify not adopted → nothing runs 12ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 499ms
     ✓ branch with an open PR into dev, register current → push goes on 437ms
     ✓ branch with no open PR → no check, push goes on 981ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 207ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 702ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 642ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 339ms
     ✓ revert push of a branch with an open PR → no check 270ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1040ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 743ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 979ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1484ms
   ✓ .husky/pre-push min push (20)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3778ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 5522ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 2490ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 3536ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1621ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1865ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1880ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2402ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2318ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3250ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 3135ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1928ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 3702ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1797ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2302ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2198ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3511ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 4052ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 2530ms
     ✓ .husky/pre-push: a code push still runs them 2128ms
   ❯ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 1323ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 555ms
     ✓ no .envrc → no direnv call 824ms
     ✓ direnv not on PATH → gates run, no warning 1926ms
     ✓ CI set → no direnv call 828ms
     ✓ delete-only push through direnv exec → exit 0, no gate 1099ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 2471ms
     × trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1130ms
     × no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1197ms
   ❯ the gate's vitest run (1)
     × the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 4808ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push direnv > trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate
AssertionError: .bkit/templates/.husky/pre-push: expected 'pnpm: -s bkit ci push-gate --gate=bki…' to contain 'BKIT_GH_TOKEN=unset'

Expected: "BKIT_GH_TOKEN=unset"
Received: "pnpm: -s bkit ci push-gate --gate=bkit:gate:static-unit GATE_VAR=from-envrc BKIT_GH_TOKEN=dummy-write-pat BKIT_OTHER_KEY=dummy-other BKIT_THIRD_KEY=unset"

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1487:25
    1485|       for (const g of gate) {
    1486|         expect(g, hook).toContain("GATE_VAR=from-envrc");
    1487|         expect(g, hook).toContain("BKIT_GH_TOKEN=unset");
       |                         ^
    1488|         expect(g, hook).toContain("BKIT_OTHER_KEY=unset");
    1489|         expect(g, hook).toContain("BKIT_THIRD_KEY=unset");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push direnv > no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it
AssertionError: .bkit/templates/.husky/pre-push: expected 'pnpm: -s bkit ci push-gate --gate=bki…' to contain 'BKIT_GH_TOKEN=unset'

Expected: "BKIT_GH_TOKEN=unset"
Received: "pnpm: -s bkit ci push-gate --gate=bkit:gate:static-unit BKIT_GH_TOKEN=dummy-write-pat"

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1514:45
    1512|       const gate = r.calls.filter((c) => c.includes("push-gate"));
    1513|       expect(gate.length, hook).toBeGreaterThan(0);
    1514|       for (const g of gate) expect(g, hook).toContain("BKIT_GH_TOKEN=u…
       |                                             ^
    1515|       expect(r.stderr, hook).not.toContain("dummy-write-pat");
    1516|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > the gate's vitest run > the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED
AssertionError: vitest output: expected '\n RUN  v5.0.5 /Users/christian/Docum…' to contain '1 passed'

- Expected
+ Received

- 1 passed
+
+  RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
+
+  ❯ .bkit/core/engine/checks/tips/catalogue.test.ts (64 tests | 1 failed | 63 skipped) 24ms
+    ❯ SETUP_TIPS — detection (48)
+      × gh-mcp stays quiet about the token inside the pre-push hook's inner run 21ms
+
+  Test Files  1 failed (1)
+       Tests  1 failed | 63 skipped (64)
+    Start at  14:38:55
+    Duration  1.14s (transform 51%, import 39%, setup 6%, tests 3%, worker 1%)
+
+
+ ! Corepack is about to download https://registry.npmjs.org/pnpm/-/pnpm-10.34.7.tgz
+ [test-timeout-budget] load average 9.7 on 10 cores: unit limits 6500ms per test, 13000ms per hook (x1.30)
+
+ ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
+
+  FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > gh-mcp stays quiet about the token inside the pre-push hook's inner run
+ AssertionError: expected false to be true // Object.is equality
+
+ - Expected
+ + Received
+
+ - true
+ + false
+
+  ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:223:38
+     221|     vi.stubEnv("CI", "");
+     222|     vi.stubEnv("BKIT_GH_TOKEN", "");
+     223|     expect(tip("gh-mcp").fires(cwd)).toBe(true);
+        |                                      ^
+     224|     vi.stubEnv("BKIT_PRE_PUSH_LOGGED", "1");
+     225|     expect(tip("gh-mcp").fires(cwd)).toBe(false);
+
+ ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯
+
+

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1539:67
    1537|       { cwd: process.cwd(), encoding: "utf-8", timeout: 120_000, env },
    1538|     );
    1539|     expect(`${result.stdout}\n${result.stderr}`, "vitest output").toCo…
       |                                                                   ^
    1540|     expect(result.status).toBe(0);
    1541|   }, 150_000);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 109 passed (112)
   Start at  14:36:59
   Duration  117.36s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-2g03Fa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
