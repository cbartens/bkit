Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1048-pre-push-dist-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "--ref of a commit with a stale dist fails as stale while the fix is only staged" | red | failure: expected +0 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "--ref of a correct commit passes while an unrelated engine edit is staged" | red | failure: expected '[bkit] dist/ is stale — run pnpm buil…' not to contain 'dist/ is stale' |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "--ref values starting with a dash, empty or not a commit are refused with no scratch folder left" | red | failure: --ref=-x: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: a code push still runs them" | red | failure: expected [ 'bkit check', …(4) ] to include 'bkit:check:dist --ref=af2ccb4c53c03bf…' |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit" | red | failure: expected [ 'bkit check', …(4) ] to include 'bkit:check:dist --ref=8a727f0083eb79a…' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1048-pre-push-dist
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/check-dist.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1048-pre-push-dist
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/check-dist.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1048-pre-push-dist

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts (10 tests | 3 failed) 6950ms
   ❯ bkit-check-dist (10)
     ✓ passes for the staged tree with an unstaged engine edit beside it 859ms
     ✓ refuses a stale staged dist 543ms
     ✓ leaves the working tree's dist untouched 775ms
     ✓ refuses a staged dist file shadowed by a tab-named twin 612ms
     ✓ refuses a staged dist that matches the build only through a gitattributes filter 819ms
     ✓ refuses a staged tsconfig whose compile writes nothing under dist/ 595ms
     × --ref of a commit with a stale dist fails as stale while the fix is only staged 865ms
     × --ref of a correct commit passes while an unrelated engine edit is staged 660ms
     × --ref values starting with a dash, empty or not a commit are refused with no scratch folder left 611ms
     ✓ without --ref the check still reads the index and not the commit 607ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > --ref of a commit with a stale dist fails as stale while the fix is only staged
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:197:29
    195|       git(dir, "add", "dist");
    196|       const result = check(dir, `--ref=${head}`);
    197|       expect(result.status).toBe(1);
       |                             ^
    198|       expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
    199|     },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > --ref of a correct commit passes while an unrelated engine edit is staged
AssertionError: expected '[bkit] dist/ is stale — run pnpm buil…' not to contain 'dist/ is stale'

- Expected
+ Received

- dist/ is stale
+ [bkit] dist/ is stale — run pnpm build and commit the result
+

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:211:49
    209|       git(dir, "add", B);
    210|       const result = check(dir, `--ref=${head}`);
    211|       expect(result.stderr + result.stdout).not.toContain("dist/ is st…
       |                                                 ^
    212|       expect(result.status).toBe(0);
    213|     },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/repo/check-dist.integration.test.ts > bkit-check-dist > --ref values starting with a dash, empty or not a commit are refused with no scratch folder left
AssertionError: --ref=-x: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/repo/check-dist.integration.test.ts:223:49
    221|       for (const value of ["-x", "--output=x", "", "no-such-commit"]) {
    222|         const result = check(dir, `--ref=${value}`);
    223|         expect(result.status, `--ref=${value}`).toBe(1);
       |                                                 ^
    224|         expect(result.stderr + result.stdout, `--ref=${value}`).toCont…
    225|         expect(scratchLeftovers(dir)).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 7 passed (10)
   Start at  15:44:15
   Duration  7.19s (tests 99%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-pZOgX2/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1048-pre-push-dist
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1048-pre-push-dist
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1048-pre-push-dist

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (136 tests | 2 failed) 193104ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 58ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 553ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 686ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 96ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 627ms
     ✓ .husky/pre-push: empty stdin → gates still run 565ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 357ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 52ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 395ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 334ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 373ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 91ms
     ✓ .husky/pre-push: first and last lines name the log 442ms
     ✓ .husky/pre-push: the hook body runs once 378ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 384ms
     ✓ tag delete alongside that tag → still skipped 402ms
     ✓ tag on a commit no origin branch holds → gates run 851ms
     ✓ tag pushed with a branch → gates run 890ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 363ms
     ✓ release branch and a tag, both already tested → still skipped 406ms
     ✓ branch with files no origin dev / main tip has → gates run 932ms
     ✓ dev push with the files origin/dev already has → gates run 895ms
     ✓ main push with the files origin/main already has → gates run 869ms
     ✓ no origin dev / main ref fetched → a branch push gates 1167ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 1378ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1005ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 980ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 1268ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1511ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1683ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1243ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1614ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1179ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1405ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2226ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 2557ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 1164ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 2189ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 970ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 871ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 1149ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 755ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 999ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 953ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 655ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 1603ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 724ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 701ms
     ✓ .husky/pre-push: a gate fails → no disk prune 607ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 1058ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 3438ms
     ✓ a stale register stops the push before any gate runs 352ms
     ✓ bkit check fails → the push stops before any gate runs 300ms
     ✓ the dependency audit runs before any gate, when its script is present 533ms
     ✓ no dependency-audit script → skipped, the gates still run 543ms
     ✓ no register script → skipped, the gates still run 591ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 712ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 544ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 521ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 558ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 599ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 554ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 702ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 793ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 21ms
     ✓ push to dev, register current → push goes on 28ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 22ms
     ✓ push to another branch → no check, push goes on 470ms
     ✓ revert push to dev → no check, push goes on 269ms
     ✓ graphify not adopted → nothing runs 11ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 245ms
     ✓ branch with an open PR into dev, register current → push goes on 460ms
     ✓ branch with no open PR → no check, push goes on 454ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 241ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 470ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 245ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 273ms
     ✓ revert push of a branch with an open PR → no check 237ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 810ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 629ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 730ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1025ms
   ❯ .husky/pre-push min push (26)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3365ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 3328ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 2053ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 3991ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1862ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 2070ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2176ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2466ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2351ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 2657ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2034ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3679ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 3508ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2188ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 3800ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1747ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2190ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2330ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2607ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2800ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3070ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 2595ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 2123ms
     × .husky/pre-push: a code push still runs them 2191ms
     × .husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit 2720ms
     ✓ .husky/pre-push: a push with no dev or branch commit runs the dist check with no argument 2201ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 1621ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 536ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 779ms
     ✓ untrusted .envrc still prints the direnv allow line 771ms
     ✓ no .envrc → no direnv call 939ms
     ✓ direnv not on PATH → gates run, no warning 2080ms
     ✓ CI set → no direnv call 808ms
     ✓ delete-only push through direnv exec → exit 0, no gate 672ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1607ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1616ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1982ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 3192ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 3292ms
     ✓ open PR that merges cleanly → gates run, no message 3521ms
     ✓ no open PR → no fetch, gates run 2503ms
     ✓ gh not on PATH → warns, gates run 1979ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1880ms
     ✓ base fetch fails → warns, gates run 2679ms
     ✓ dev push → no PR lookup 2118ms
     ✓ min push of a conflicting PR → blocked 2831ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 2700ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 3963ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 3198ms
     ✓ fork PR with the same head branch name → ignored, gates run 2839ms
     ✓ shallow clone → no base fetch, warns, gates run 3683ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 3257ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 3196ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 2763ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .husky/pre-push: a code push still runs them
AssertionError: expected [ 'bkit check', …(4) ] to include 'bkit:check:dist --ref=af2ccb4c53c03bf…'
 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1265:21
    1263|     const sha = commitFiles({ "src/a.ts": "b\n" }, "feat(1): a");
    1264|     const r = push(".husky/pre-push", sha);
    1265|     expect(r.calls).toContain(`bkit:check:dist --ref=${sha}`);
       |                     ^
    1266|     expect(r.calls).not.toContain("bkit:check:dist");
    1267|     expect(r.calls).toContain("bkit:lint:workflows");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit
AssertionError: expected [ 'bkit check', …(4) ] to include 'bkit:check:dist --ref=8a727f0083eb79a…'
 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1280:21
    1278|       `refs/heads/feat/1-x ${branchSha} refs/heads/feat/1-x ${ZERO}\n`,
    1279|     );
    1280|     expect(r.calls).toContain(`bkit:check:dist --ref=${devSha}`);
       |                     ^
    1281|     expect(r.calls).not.toContain(`bkit:check:dist --ref=${branchSha}`…
    1282|     expect(r.calls).not.toContain("bkit:check:dist");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 134 passed (136)
   Start at  15:44:25
   Duration  193.35s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jYzbrl/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
