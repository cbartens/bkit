Enforced: true
Red: 9
Accepted: 1
Updated: 2
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1031-pre-push-refuses-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses a docs/audits change even when minPushPaths matches it" | red | failure: expected 2 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses a change to an audit template's project section only" | red | failure: expected 2 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main accepts a plans-only range" | red | failure: expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main finds an audit report already on origin/dev but not on origin/main" | red | failure: expected 2 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main accepts a range that looks empty against origin/dev and adds no audit file" | red | failure: expected 2 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main is not proven a min push when origin/main does not resolve" | red | failure: expected 2 to be 7 // Object.is equality |
| 1 | `.bkit/core/engine/commands/ci/ci.test.ts` "without --target, an audit-only range is still a min push" | passed-accepted | passes; accepted by the tests step: today's min-push already accepts docs/audits/** without a target; it is the guard that the default stays |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit report to main under a [skip ci] head → blocked before any gate" | red | failure: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit-template project section to main under a [skip ci] head → blocked before any gate" | red | failure: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "plans-only change to main under a [skip ci] head → allowed, light gate" | vacuous | "plans-only change to main under a [skip ci] head → allowed, light gate" passes at its red, so it proves nothing |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "one push updating dev and main with an audit-only [skip ci] head → blocked before any gate" | red | failure: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit report to dev under a [skip ci] head → allowed, light gate" | updated | an existing test, changed since the group started (`77fd573cd`) and passing: the verifier judges its diff — it may add expectations, never remove or loosen one |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "audit-template project section to dev under a [skip ci] head → allowed, light gate" | updated | an existing test, changed since the group started (`77fd573cd`) and passing: the verifier judges its diff — it may add expectations, never remove or loosen one |

## Gaps

- TASK 2 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "plans-only change to main under a [skip ci] head → allowed, light gate" `vacuous` — "plans-only change to main under a [skip ci] head → allowed, light gate" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/commands/ci/ci.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1031-pre-push-refuses
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/ci/ci.test.ts

```

## Runner output — `.bkit/core/engine/commands/ci/ci.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1031-pre-push-refuses
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/ci/ci.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1031-pre-push-refuses

 ❯ .bkit/core/engine/commands/ci/ci.test.ts (88 tests | 6 failed) 74835ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1026ms
     ✓ names each net-new and worsened finding in the log and the JSON 2051ms
     ✓ fails on a net score rise with no net count change 1095ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1464ms
     ✓ treats a net score at or below 0.001 as float noise 837ms
     ✓ passes when the change only resolves findings 1115ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 942ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 412ms
     ✓ skips (exit 0) when the base resolves to HEAD 325ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 854ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 885ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 512ms
     ✓ is a usage error outside a git repository 27ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1740ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1710ms
     ✓ exits 4 on a dropped net field instead of silently passing 1525ms
     ✓ exits 4 on no summary instead of silently passing 1468ms
     ✓ exits 4 on output that is not JSON instead of silently passing 2208ms
     ✓ exits 5 when the base worktree cannot be created 1124ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1275ms
   ✓ slop-scan resolution and summary reading (2)
     ✓ uses slop-scan from PATH, else npx --no-install 31ms
     ✓ gates on the net figures only 2ms
   ✓ netNewFindings (4)
     ✓ drops a line shift: one added and one resolved for the same file and rule 1ms
     ✓ cancels the shifted finding by message and keeps the new one 1ms
     ✓ reads repo-scoped changes, which have no path 2ms
     ✓ is empty for a report with no change lists, or not JSON 2ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1322ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1699ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1510ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 1461ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 2320ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 276ms
     ✓ walks standalone consumers without entering nested repositories 11ms
     ✓ walks standalone consumers even when git is unavailable 5ms
     ✓ does not follow a directory symlink replacing tracked prose 288ms
     ✓ defaults to every markdown file outside node_modules 251ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 354ms
     ✓ globToRegExp: * and ? stay within one folder, **/ spans zero or more 2ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 1289ms
     ✓ explicit globs can select ignored prose and nested checkout files 728ms
     ✓ fails closed when the git index cannot be read 244ms
     ✓ fails closed when a selected prose source cannot be read 192ms
     ✓ fails when vale is not installed 218ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 797ms
     ✓ fails (exit 1) when vale reports alerts 1569ms
     ✓ exits 6 on a vale runtime error 1321ms
     ✓ skips with exit 0 when no file matches 394ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 818ms
     ✓ falls back to vale sync when the main worktree has none 923ms
     ✓ fails when vale sync cannot restore the required styles 789ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 2471ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 1252ms
     ✓ is a usage error when the commit cannot be read 837ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 1231ms
     ✓ exits 1 naming the code file, whatever the commit message says 1326ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 1506ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 439ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 943ms
     ✓ exits 7 when a commit cannot be read 302ms
   ❯ bkit ci min-push (29)
     ✓ exits 0 when every changed file is a plan log or a ledger 456ms
     ✓ exits 1 naming the files outside, whatever the commit message says 480ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 1349ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 578ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 1504ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 1311ms
     ✓ a top-level glob in the setting does not reach into folders 685ms
     ✓ a push that changes no files is not proven a min push 483ms
     ✓ exits 7 when a commit or its base cannot be read 646ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 1312ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 1024ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 2122ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 1127ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 1225ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 936ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 758ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 905ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 667ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 516ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 546ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 612ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 652ms
     × --target=main refuses a docs/audits change even when minPushPaths matches it 338ms
     × --target=main refuses a change to an audit template's project section only 330ms
     × --target=main accepts a plans-only range 316ms
     × --target=main finds an audit report already on origin/dev but not on origin/main 988ms
     × --target=main accepts a range that looks empty against origin/dev and adds no audit file 426ms
     × --target=main is not proven a min push when origin/main does not resolve 340ms
     ✓ without --target, an audit-only range is still a min push 471ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main refuses a docs/audits change even when minPushPaths matches it
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1281:20
    1279|     );
    1280|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1281|     expect(r.code).toBe(1);
       |                    ^
    1282|     expect(r.json.minPush).toBe(false);
    1283|     expect(r.err).toContain("docs/audits/202611/security.md");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main refuses a change to an audit template's project section only
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1291:20
    1289|     const { cwd, head } = pushedToMain(belowOnly.before, belowOnly.aft…
    1290|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1291|     expect(r.code).toBe(1);
       |                    ^
    1292|     expect(r.json.minPush).toBe(false);
    1293|     expect(r.err).toContain(T1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main accepts a plans-only range
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1304:20
    1302|     );
    1303|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1304|     expect(r.code).toBe(0);
       |                    ^
    1305|     expect(r.json).toMatchObject({ minPush: true, reason: null, outsid…
    1306|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main finds an audit report already on origin/dev but not on origin/main
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1322:20
    1320|     expect(plain.code).toBe(0);
    1321|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1322|     expect(r.code).toBe(1);
       |                    ^
    1323|     expect(r.json.minPush).toBe(false);
    1324|     expect(r.err).toContain("docs/audits/202611/security.md");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main accepts a range that looks empty against origin/dev and adds no audit file
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1338:20
    1336|     const plain = await run(cwd, [`--ref=${head}`], "min-push");
    1337|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1338|     expect(r.code).toBe(plain.code);
       |                    ^
    1339|     expect(r.json.reason).toBe(plain.json.reason);
    1340|     expect(r.json.outside).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main is not proven a min push when origin/main does not resolve
AssertionError: expected 2 to be 7 // Object.is equality

- Expected
+ Received

- 7
+ 2

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1347:20
    1345|     const { cwd, head } = pushedFrom({}, { "docs/decisions.jsonl": "{}…
    1346|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1347|     expect(r.code).toBe(7);
       |                    ^
    1348|     expect(r.json).toMatchObject({ minPush: false, reason: "unknown" }…
    1349|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 82 passed (88)
   Start at  17:29:43
   Duration  75.43s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9WB0Fj/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

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

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (144 tests | 6 failed) 261604ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 97ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 833ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 733ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 107ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 656ms
     ✓ .husky/pre-push: empty stdin → gates still run 757ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 641ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 80ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 577ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 505ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 605ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 214ms
     ✓ .husky/pre-push: first and last lines name the log 792ms
     ✓ .husky/pre-push: the hook body runs once 598ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 621ms
     ✓ tag delete alongside that tag → still skipped 707ms
     ✓ tag on a commit no origin branch holds → gates run 1187ms
     ✓ tag pushed with a branch → gates run 1181ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 485ms
     ✓ release branch and a tag, both already tested → still skipped 513ms
     ✓ branch with files no origin dev / main tip has → gates run 1063ms
     ✓ dev push with the files origin/dev already has → gates run 1029ms
     ✓ main push with the files origin/main already has → gates run 1140ms
     ✓ no origin dev / main ref fetched → a branch push gates 1168ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 1159ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1115ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1865ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 1492ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 3749ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 2164ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1523ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1863ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2279ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1907ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2063ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1998ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 1534ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 1506ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 822ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 705ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 807ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 948ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 853ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 989ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 958ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 780ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 631ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 680ms
     ✓ .husky/pre-push: a gate fails → no disk prune 657ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 703ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 649ms
     ✓ a stale register stops the push before any gate runs 600ms
     ✓ bkit check fails → the push stops before any gate runs 593ms
     ✓ the dependency audit runs before any gate, when its script is present 822ms
     ✓ no dependency-audit script → skipped, the gates still run 829ms
     ✓ no register script → skipped, the gates still run 659ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 899ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 758ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 806ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 732ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 933ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 829ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 872ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 791ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 18ms
     ✓ push to dev, register current → push goes on 21ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 20ms
     ✓ push to another branch → no check, push goes on 532ms
     ✓ revert push to dev → no check, push goes on 316ms
     ✓ graphify not adopted → nothing runs 55ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 674ms
     ✓ branch with an open PR into dev, register current → push goes on 648ms
     ✓ branch with no open PR → no check, push goes on 968ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 668ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 1041ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 517ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 323ms
     ✓ revert push of a branch with an open PR → no check 283ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1039ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 1130ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 1083ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1570ms
   ❯ .husky/pre-push min push (34)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 4223ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 4418ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 3062ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4226ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2694ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 2562ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2968ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3734ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2812ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3043ms
     × .bkit/templates/.husky/pre-push: audit report to main under a [skip ci] head → blocked before any gate 2848ms
     × .bkit/templates/.husky/pre-push: audit-template project section to main under a [skip ci] head → blocked before any gate 2938ms
     ✓ .bkit/templates/.husky/pre-push: plans-only change to main under a [skip ci] head → allowed, light gate 3013ms
     × .bkit/templates/.husky/pre-push: one push updating dev and main with an audit-only [skip ci] head → blocked before any gate 3950ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2403ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3583ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 3666ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2446ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4510ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2490ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2458ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2617ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3026ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 3790ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 4057ms
     × .husky/pre-push: audit report to main under a [skip ci] head → blocked before any gate 3618ms
     × .husky/pre-push: audit-template project section to main under a [skip ci] head → blocked before any gate 3797ms
     ✓ .husky/pre-push: plans-only change to main under a [skip ci] head → allowed, light gate 4321ms
     × .husky/pre-push: one push updating dev and main with an audit-only [skip ci] head → blocked before any gate 5014ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 3606ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 3609ms
     ✓ .husky/pre-push: a code push still runs them 2815ms
     ✓ .husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit 3303ms
     ✓ .husky/pre-push: a push with no dev or branch commit runs the dist check with no argument 3057ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 1658ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 660ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 1009ms
     ✓ untrusted .envrc still prints the direnv allow line 873ms
     ✓ no .envrc → no direnv call 936ms
     ✓ direnv not on PATH → gates run, no warning 2136ms
     ✓ CI set → no direnv call 761ms
     ✓ delete-only push through direnv exec → exit 0, no gate 671ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1513ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1543ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 2242ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 6331ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 4240ms
     ✓ open PR that merges cleanly → gates run, no message 5045ms
     ✓ no open PR → no fetch, gates run 3808ms
     ✓ gh not on PATH → warns, gates run 2691ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2683ms
     ✓ base fetch fails → warns, gates run 3572ms
     ✓ dev push → no PR lookup 2594ms
     ✓ min push of a conflicting PR → blocked 3583ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 2972ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 4913ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 3191ms
     ✓ fork PR with the same head branch name → ignored, gates run 3216ms
     ✓ shallow clone → no base fetch, warns, gates run 2785ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 2816ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 2525ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 2237ms

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
   Start at  17:31:01
   Duration  261.98s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xa6JL7/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
