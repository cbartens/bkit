Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard" | red | failure: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality |
| 14 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "fork PRs past gh's page limit → same-repo PR still found, conflict blocked" | red | failure: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

[test-timeout-budget] load average 75.4 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (131 tests | 2 failed) 166905ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 117ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 672ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 769ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 160ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 652ms
     ✓ .husky/pre-push: empty stdin → gates still run 765ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 954ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 103ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 664ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 329ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 601ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 154ms
     ✓ .husky/pre-push: first and last lines name the log 364ms
     ✓ .husky/pre-push: the hook body runs once 369ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 605ms
     ✓ tag delete alongside that tag → still skipped 511ms
     ✓ tag on a commit no origin branch holds → gates run 1061ms
     ✓ tag pushed with a branch → gates run 1339ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 429ms
     ✓ release branch and a tag, both already tested → still skipped 535ms
     ✓ branch with files no origin dev / main tip has → gates run 1373ms
     ✓ dev push with the files origin/dev already has → gates run 2133ms
     ✓ main push with the files origin/main already has → gates run 1231ms
     ✓ no origin dev / main ref fetched → a branch push gates 1144ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 1359ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1740ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2384ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 2113ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 3364ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1991ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 2024ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1478ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2370ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1579ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 3744ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 2667ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 3347ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 3923ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 2472ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 2249ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 2382ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 2854ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 2225ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 2789ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1905ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 2473ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 2535ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 1451ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1373ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 1895ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1030ms
     ✓ a stale register stops the push before any gate runs 1336ms
     ✓ bkit check fails → the push stops before any gate runs 1401ms
     ✓ the dependency audit runs before any gate, when its script is present 1982ms
     ✓ no dependency-audit script → skipped, the gates still run 1783ms
     ✓ no register script → skipped, the gates still run 1694ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1831ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1218ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1402ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 925ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 839ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 899ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1305ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1150ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 7ms
     ✓ push to dev, register current → push goes on 6ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 6ms
     ✓ push to another branch → no check, push goes on 183ms
     ✓ revert push to dev → no check, push goes on 73ms
     ✓ graphify not adopted → nothing runs 4ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 917ms
     ✓ branch with an open PR into dev, register current → push goes on 716ms
     ✓ branch with no open PR → no check, push goes on 728ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 113ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 812ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 634ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 86ms
     ✓ revert push of a branch with an open PR → no check 70ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 486ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 846ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 511ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1128ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1965ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 1398ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1012ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1506ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 942ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1057ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1115ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1595ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1530ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1914ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1547ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1889ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 2304ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1133ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1598ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 975ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1030ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1073ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1110ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1107ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1233ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1019ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 914ms
     ✓ .husky/pre-push: a code push still runs them 923ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 816ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 387ms
     ✓ no .envrc → no direnv call 481ms
     ✓ direnv not on PATH → gates run, no warning 808ms
     ✓ CI set → no direnv call 454ms
     ✓ delete-only push through direnv exec → exit 0, no gate 434ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 753ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 773ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 822ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 1150ms
   ❯ .husky/pre-push PR conflict (15)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 1442ms
     ✓ open PR that merges cleanly → gates run, no message 1566ms
     ✓ no open PR → no fetch, gates run 1698ms
     ✓ gh not on PATH → warns, gates run 1349ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1283ms
     ✓ base fetch fails → warns, gates run 1740ms
     ✓ dev push → no PR lookup 1240ms
     ✓ min push of a conflicting PR → blocked 1621ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 1476ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 2091ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 1893ms
     ✓ fork PR with the same head branch name → ignored, gates run 1652ms
     ✓ shallow clone → no base fetch, warns, gates run 1603ms
     × fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 2125ms
     × fork PRs past gh's page limit → same-repo PR still found, conflict blocked 1511ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard
AssertionError: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1998:30
    1996|     for (const hook of HOOKS) {
    1997|       const r = push(hook, { args: ["origin", "https://github.com/cont…
    1998|       expect(r.status, hook).toBe(1);
       |                              ^
    1999|       expect(r.stderr, hook).toContain("BLOCKED");
    2000|       expect(r.stderr, hook).toContain("PR #7 is open");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > fork PRs past gh's page limit → same-repo PR still found, conflict blocked
AssertionError: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:2031:30
    2029|     for (const hook of HOOKS) {
    2030|       const r = push(hook, { args: ["origin", "https://github.com/owne…
    2031|       expect(r.status, hook).toBe(1);
       |                              ^
    2032|       expect(r.stderr, hook).toContain("BLOCKED");
    2033|       expect(r.stderr, hook).toContain("f.txt");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 129 passed (131)
   Start at  23:09:21
   Duration  167.79s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-r4d0mA/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
