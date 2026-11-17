Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "gh not on PATH → warns, gates run for both hook copies" | red | failure: EEXIST: file already exists, mkdir '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-prepush-conflict-T9bL0C/sysbin' |

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

[test-timeout-budget] load average 1.6 on 10 cores: unit limits 5300ms per test, 10600ms per hook (x1.06)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (124 tests | 2 failed) 80212ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 21ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 394ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 389ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 46ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 415ms
     ✓ .husky/pre-push: empty stdin → gates still run 389ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 377ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 22ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 140ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 142ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 157ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 37ms
     ✓ .husky/pre-push: first and last lines name the log 154ms
     ✓ .husky/pre-push: the hook body runs once 157ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 147ms
     ✓ tag delete alongside that tag → still skipped 150ms
     ✓ tag on a commit no origin branch holds → gates run 503ms
     ✓ tag pushed with a branch → gates run 511ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 137ms
     ✓ release branch and a tag, both already tested → still skipped 148ms
     ✓ branch with files no origin dev / main tip has → gates run 515ms
     ✓ dev push with the files origin/dev already has → gates run 576ms
     ✓ main push with the files origin/main already has → gates run 493ms
     ✓ no origin dev / main ref fetched → a branch push gates 506ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 469ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 478ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 857ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 623ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 809ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 766ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 672ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 665ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 637ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 660ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 829ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 802ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 674ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 681ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 438ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 404ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 431ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 463ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 430ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 459ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 403ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 411ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 418ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 421ms
     ✓ .husky/pre-push: a gate fails → no disk prune 436ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 445ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 407ms
     ✓ a stale register stops the push before any gate runs 399ms
     ✓ bkit check fails → the push stops before any gate runs 401ms
     ✓ the dependency audit runs before any gate, when its script is present 433ms
     ✓ no dependency-audit script → skipped, the gates still run 418ms
     ✓ no register script → skipped, the gates still run 409ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 484ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 430ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 488ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 415ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 505ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 465ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 497ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 467ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 8ms
     ✓ push to dev, register current → push goes on 7ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 7ms
     ✓ push to another branch → no check, push goes on 92ms
     ✓ revert push to dev → no check, push goes on 73ms
     ✓ graphify not adopted → nothing runs 4ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 366ms
     ✓ branch with an open PR into dev, register current → push goes on 360ms
     ✓ branch with no open PR → no check, push goes on 447ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 73ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 445ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 766ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 86ms
     ✓ revert push of a branch with an open PR → no check 72ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 480ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 500ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 305ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 640ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1349ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 1441ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1044ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1530ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 919ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 980ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 987ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1107ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1119ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1241ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 997ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1437ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 1452ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1067ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1643ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 967ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1005ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 986ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1139ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1143ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1270ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1049ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 957ms
     ✓ .husky/pre-push: a code push still runs them 992ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 847ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 406ms
     ✓ no .envrc → no direnv call 469ms
     ✓ direnv not on PATH → gates run, no warning 824ms
     ✓ CI set → no direnv call 480ms
     ✓ delete-only push through direnv exec → exit 0, no gate 406ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 820ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 779ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 823ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 1304ms
   ❯ .husky/pre-push PR conflict (8)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 1577ms
     ✓ open PR that merges cleanly → gates run, no message 1756ms
     ✓ no open PR → no fetch, gates run 1890ms
     × gh not on PATH → warns, gates run 1291ms
     × gh not on PATH → warns, gates run for both hook copies 1386ms
     ✓ base fetch fails → warns, gates run 1879ms
     ✓ dev push → no PR lookup 1393ms
     ✓ min push of a conflicting PR → blocked 1810ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > gh not on PATH → warns, gates run
Error: EEXIST: file already exists, mkdir '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-prepush-conflict-nk1tIz/sysbin'
 ❯ pathWithoutGh .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1659:8
    1657|   const pathWithoutGh = () => {
    1658|     const dir = path.join(tmp, "sysbin");
    1659|     fs.mkdirSync(dir);
       |        ^
    1660|     for (const tool of [
    1661|       "sh",
 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1771:39

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > gh not on PATH → warns, gates run for both hook copies
Error: EEXIST: file already exists, mkdir '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-prepush-conflict-T9bL0C/sysbin'
 ❯ pathWithoutGh .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1659:8
    1657|   const pathWithoutGh = () => {
    1658|     const dir = path.join(tmp, "sysbin");
    1659|     fs.mkdirSync(dir);
       |        ^
    1660|     for (const tool of [
    1661|       "sh",
 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1785:39

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 122 passed (124)
   Start at  12:05:31
   Duration  80.30s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-uMrMsf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
