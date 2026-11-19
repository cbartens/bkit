Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1031-pre-push-refuses-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template's project section even when minPushPaths matches docs/**" | red | failure: expected +0 to be 1 // Object.is equality |
| 5 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses a docs/audits file whose name has non-ASCII characters" | red | failure: expected +0 to be 1 // Object.is equality |
| 6 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main" | red | failure: expected +0 to be 1 // Object.is equality |
| 6 | `.bkit/core/engine/commands/ci/ci.test.ts` "--target=main refuses an audit template new to main whose project section was edited on origin/dev" | red | failure: expected +0 to be 1 // Object.is equality |

## Gaps

None.

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

 ❯ .bkit/core/engine/commands/ci/ci.test.ts (92 tests | 4 failed) 34524ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 618ms
     ✓ names each net-new and worsened finding in the log and the JSON 738ms
     ✓ fails on a net score rise with no net count change 530ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 964ms
     ✓ treats a net score at or below 0.001 as float noise 507ms
     ✓ passes when the change only resolves findings 499ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 617ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 198ms
     ✓ skips (exit 0) when the base resolves to HEAD 221ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 568ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 359ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 186ms
     ✓ is a usage error outside a git repository 14ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 538ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 567ms
     ✓ exits 4 on a dropped net field instead of silently passing 527ms
     ✓ exits 4 on no summary instead of silently passing 925ms
     ✓ exits 4 on output that is not JSON instead of silently passing 507ms
     ✓ exits 5 when the base worktree cannot be created 240ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 825ms
   ✓ slop-scan resolution and summary reading (2)
     ✓ uses slop-scan from PATH, else npx --no-install 16ms
     ✓ gates on the net figures only 1ms
   ✓ netNewFindings (4)
     ✓ drops a line shift: one added and one resolved for the same file and rule 1ms
     ✓ cancels the shifted finding by message and keeps the new one 1ms
     ✓ reads repo-scoped changes, which have no path 1ms
     ✓ is empty for a report with no change lists, or not JSON 1ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 726ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 683ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 713ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 724ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1201ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 123ms
     ✓ walks standalone consumers without entering nested repositories 3ms
     ✓ walks standalone consumers even when git is unavailable 2ms
     ✓ does not follow a directory symlink replacing tracked prose 119ms
     ✓ defaults to every markdown file outside node_modules 130ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 116ms
     ✓ globToRegExp: * and ? stay within one folder, **/ spans zero or more 1ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 522ms
     ✓ explicit globs can select ignored prose and nested checkout files 391ms
     ✓ fails closed when the git index cannot be read 135ms
     ✓ fails closed when a selected prose source cannot be read 127ms
     ✓ fails when vale is not installed 125ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 339ms
     ✓ fails (exit 1) when vale reports alerts 431ms
     ✓ exits 6 on a vale runtime error 367ms
     ✓ skips with exit 0 when no file matches 110ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 847ms
     ✓ falls back to vale sync when the main worktree has none 812ms
     ✓ fails when vale sync cannot restore the required styles 593ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 283ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 216ms
     ✓ is a usage error when the commit cannot be read 183ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 263ms
     ✓ exits 1 naming the code file, whatever the commit message says 275ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 306ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 218ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 550ms
     ✓ exits 7 when a commit cannot be read 211ms
   ❯ bkit ci min-push (33)
     ✓ exits 0 when every changed file is a plan log or a ledger 308ms
     ✓ exits 1 naming the files outside, whatever the commit message says 354ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 528ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 349ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 278ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 589ms
     ✓ a top-level glob in the setting does not reach into folders 281ms
     ✓ a push that changes no files is not proven a min push 262ms
     ✓ exits 7 when a commit or its base cannot be read 295ms
     ✓ exits 0 when every changed file is an audit report under docs/audits 283ms
     ✓ exits 0 when an audit template changes only below its bkit:end, and says why 352ms
     ✓ refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 353ms
     ✓ refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 345ms
     ✓ refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 347ms
     ✓ refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 338ms
     ✓ refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 354ms
     ✓ refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 356ms
     ✓ refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 359ms
     ✓ refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 304ms
     ✓ refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 317ms
     ✓ --update exits 0 when the update changes only an audit template's project section, and logs the template once 403ms
     ✓ --update exits 1 and lists only the code file when a project-section edit ships beside a code file 410ms
     ✓ --target=main refuses a docs/audits change even when minPushPaths matches it 490ms
     ✓ --target=main refuses a change to an audit template's project section only 532ms
     ✓ --target=main accepts a plans-only range 375ms
     ✓ --target=main finds an audit report already on origin/dev but not on origin/main 580ms
     ✓ --target=main accepts a range that looks empty against origin/dev and adds no audit file 441ms
     ✓ --target=main is not proven a min push when origin/main does not resolve 287ms
     ✓ without --target, an audit-only range is still a min push 282ms
     × --target=main refuses an audit template's project section even when minPushPaths matches docs/** 360ms
     × --target=main refuses a docs/audits file whose name has non-ASCII characters 354ms
     × --target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main 455ms
     × --target=main refuses an audit template new to main whose project section was edited on origin/dev 584ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main refuses an audit template's project section even when minPushPaths matches docs/**
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1363:20
    1361|     });
    1362|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1363|     expect(r.code).toBe(1);
       |                    ^
    1364|     expect(r.json.minPush).toBe(false);
    1365|     expect(r.err).toContain(T1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main refuses a docs/audits file whose name has non-ASCII characters
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1375:20
    1373|     const { cwd, head } = pushedToMain({}, { [name]: "# Report\n" });
    1374|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1375|     expect(r.code).toBe(1);
       |                    ^
    1376|     expect(r.json.minPush).toBe(false);
    1377|     expect(r.err).toContain(name);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1393:20
    1391|     const head = commit(cwd, "docs(1): plan bkit [skip ci]");
    1392|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1393|     expect(r.code).toBe(1);
       |                    ^
    1394|     expect(r.json.minPush).toBe(false);
    1395|     expect(r.err).toContain(T1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --target=main refuses an audit template new to main whose project section was edited on origin/dev
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1410:20
    1408|     const head = commit(cwd, "docs(1): plan bkit [skip ci]");
    1409|     const r = await run(cwd, [`--ref=${head}`, "--target=main"], "min-…
    1410|     expect(r.code).toBe(1);
       |                    ^
    1411|     expect(r.json.minPush).toBe(false);
    1412|     expect(r.err).toContain(T1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 88 passed (92)
   Start at  19:12:53
   Duration  34.87s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-a9TVCc/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
