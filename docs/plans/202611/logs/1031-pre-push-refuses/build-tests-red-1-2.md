Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/1031-pre-push-refuses-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "plans-only change to main under a [skip ci] head → allowed, light gate" | passed-accepted | passes; accepted by the tests step: regression guard; the hook already lets a non-audit min push to main through on the light gate, and the planned failure (a non-audit push wrongly blocked) only appears if the code step breaks it. Left as written, not padded. |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1031-pre-push-refuses
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1031-pre-push-refuses
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1031-pre-push-refuses

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (144 tests | 6 failed) 358318ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 148ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 1268ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 629ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 167ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 1354ms
     ✓ .husky/pre-push: empty stdin → gates still run 683ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 1486ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 93ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 993ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 425ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 996ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 158ms
     ✓ .husky/pre-push: first and last lines name the log 497ms
     ✓ .husky/pre-push: the hook body runs once 559ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 571ms
     ✓ tag delete alongside that tag → still skipped 683ms
     ✓ tag on a commit no origin branch holds → gates run 1731ms
     ✓ tag pushed with a branch → gates run 3044ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 484ms
     ✓ release branch and a tag, both already tested → still skipped 628ms
     ✓ branch with files no origin dev / main tip has → gates run 1623ms
     ✓ dev push with the files origin/dev already has → gates run 2221ms
     ✓ main push with the files origin/main already has → gates run 1998ms
     ✓ no origin dev / main ref fetched → a branch push gates 1635ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 2236ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1279ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2762ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 5828ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 4310ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 2373ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1354ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 2774ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2532ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 5514ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 3692ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 3724ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 2928ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 2943ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 795ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 1416ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 850ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1378ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1243ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 757ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 661ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 1211ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 811ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 765ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1466ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 843ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 800ms
     ✓ a stale register stops the push before any gate runs 788ms
     ✓ bkit check fails → the push stops before any gate runs 967ms
     ✓ the dependency audit runs before any gate, when its script is present 1822ms
     ✓ no dependency-audit script → skipped, the gates still run 802ms
     ✓ no register script → skipped, the gates still run 1480ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1471ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 2081ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1788ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 999ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1745ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 959ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1029ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1210ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 28ms
     ✓ push to dev, register current → push goes on 24ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 26ms
     ✓ push to another branch → no check, push goes on 719ms
     ✓ revert push to dev → no check, push goes on 281ms
     ✓ graphify not adopted → nothing runs 12ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 3018ms
     ✓ branch with an open PR into dev, register current → push goes on 1035ms
     ✓ branch with no open PR → no check, push goes on 795ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 276ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 938ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 501ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 250ms
     ✓ revert push of a branch with an open PR → no check 263ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 955ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 1368ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 3383ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 9672ms
   ❯ .husky/pre-push min push (34)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 5135ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 5222ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 3070ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 5925ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2828ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 3021ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2970ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3645ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 4141ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 4295ms
     × .bkit/templates/.husky/pre-push: audit report to main under a [skip ci] head → blocked before any gate 3890ms
     × .bkit/templates/.husky/pre-push: audit-template project section to main under a [skip ci] head → blocked before any gate 4112ms
     ✓ .bkit/templates/.husky/pre-push: plans-only change to main under a [skip ci] head → allowed, light gate 3695ms
     × .bkit/templates/.husky/pre-push: one push updating dev and main with an audit-only [skip ci] head → blocked before any gate 5155ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 3430ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 5055ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 5219ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 3349ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 5190ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2815ms
     ✓ .husky/pre-push: a code file in the push → the full gate 3591ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3609ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3639ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 3807ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3879ms
     × .husky/pre-push: audit report to main under a [skip ci] head → blocked before any gate 3548ms
     × .husky/pre-push: audit-template project section to main under a [skip ci] head → blocked before any gate 3750ms
     ✓ .husky/pre-push: plans-only change to main under a [skip ci] head → allowed, light gate 3632ms
     × .husky/pre-push: one push updating dev and main with an audit-only [skip ci] head → blocked before any gate 4874ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 3956ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 3048ms
     ✓ .husky/pre-push: a code push still runs them 3104ms
     ✓ .husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit 5276ms
     ✓ .husky/pre-push: a push with no dev or branch commit runs the dist check with no argument 4291ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 3629ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 1480ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 2398ms
     ✓ untrusted .envrc still prints the direnv allow line 1787ms
     ✓ no .envrc → no direnv call 1544ms
     ✓ direnv not on PATH → gates run, no warning 3210ms
     ✓ CI set → no direnv call 1516ms
     ✓ delete-only push through direnv exec → exit 0, no gate 1097ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 3537ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 2603ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 3705ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 5553ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 5470ms
     ✓ open PR that merges cleanly → gates run, no message 4159ms
     ✓ no open PR → no fetch, gates run 5235ms
     ✓ gh not on PATH → warns, gates run 3513ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2418ms
     ✓ base fetch fails → warns, gates run 4917ms
     ✓ dev push → no PR lookup 2729ms
     ✓ min push of a conflicting PR → blocked 5085ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 5553ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 4687ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 4882ms
     ✓ fork PR with the same head branch name → ignored, gates run 3870ms
     ✓ shallow clone → no base fetch, warns, gates run 3665ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 3276ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 3903ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 4726ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .bkit/templates/.husky/pre-push: audit report to main under a [skip ci] head → blocked before any gate
 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .husky/pre-push: audit report to main under a [skip ci] head → blocked before any gate
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1269:24
    1267|       );
    1268|       const r = push(hook, head, "refs/heads/main");
    1269|       expect(r.status).toBe(1);
       |                        ^
    1270|       expect(r.stderr).toContain("docs/audits/202611/security.md");
    1271|       expect(r.calls).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .bkit/templates/.husky/pre-push: audit-template project section to main under a [skip ci] head → blocked before any gate
 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .husky/pre-push: audit-template project section to main under a [skip ci] head → blocked before any gate
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1283:24
    1281|       );
    1282|       const r = push(hook, head, "refs/heads/main", remote);
    1283|       expect(r.status).toBe(1);
       |                        ^
    1284|       expect(r.stderr).toContain(TEMPLATE_FILE);
    1285|       expect(r.calls).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .bkit/templates/.husky/pre-push: one push updating dev and main with an audit-only [skip ci] head → blocked before any gate
 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .husky/pre-push: one push updating dev and main with an audit-only [skip ci] head → blocked before any gate
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1310:24
    1308|         `refs/heads/feat/1-x ${head} refs/heads/main ${ZERO}\n`,
    1309|       );
    1310|       expect(r.status).toBe(1);
       |                        ^
    1311|       expect(r.stderr).toContain("docs/audits/202611/security.md");
    1312|       expect(r.calls).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 138 passed (144)
   Start at  17:36:36
   Duration  358.68s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Vl0PUm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
