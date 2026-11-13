Enforced: true
Red: 25
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/915-min-push-ignores-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns the text through the bkit:end line" | red | failure: managedHead is not a function |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when the file has no markers" | red | failure: managedHead is not a function |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when the file has two bkit:end lines" | red | failure: managedHead is not a function |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when the file has a second bkit:start line below bkit:end" | red | failure: managedHead is not a function |
| 1 | `.bkit/core/engine/install/managed-block.test.ts` "managedHead > returns null when bkit:end comes before bkit:start" | red | failure: managedHead is not a function |
| 2 | `.bkit/core/engine/commands/ci/ci.test.ts` "bkit ci min-push > exits 0 when every changed file is an audit report under docs/audits" | red | failure: expected 1 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/land.test.ts` "runs docs/audits/202611/logs.md through its declared gate in the built checkout" | red | failure: expected 'unit\n' to be 'min\n' // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate" | red | failure: expected 1 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate" | red | failure: expected 1 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "exits 0 when an audit template changes only below its bkit:end, and says why" | red | failure: expected 1 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end" | red | failure: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end" | red | failure: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end" | red | failure: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end" | red | failure: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end" | red | failure: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end" | red | failure: expected [ …(3) ] to deeply equal [ …(2) ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end" | red | failure: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below" | red | failure: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-plan.md' ] |
| 3 | `.bkit/core/engine/commands/ci/ci.test.ts` "refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below" | red | failure: expected [ …(2) ] to deeply equal [ Array(1) ] |
| 4 | `.bkit/core/engine/commands/ci/ci.test.ts` "bkit ci min-push > --update exits 0 when the update changes only an audit template's project section, and logs the template once" | red | failure: expected 1 to be +0 // Object.is equality |
| 4 | `.bkit/core/engine/commands/ci/ci.test.ts` "bkit ci min-push > --update exits 1 and lists only the code file when a project-section edit ships beside a code file" | red | failure: expected [ …(2) ] to deeply equal [ 'src/a.ts' ] |
| 4 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate" | red | failure: expected 1 to be +0 // Object.is equality |
| 4 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate" | red | failure: expected 1 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/ci/push-gate.test.ts` "a full-gate receipt carries an audit template's project-section increment to the minimum gate" | red | failure: expected 1 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/commands/land.test.ts` "runs an audit template's project-section change through bkit:gate:min" | red | failure: expected 'unit\n' to be 'min\n' // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/install/managed-block.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/managed-block.test.ts

```

## Runner output — `.bkit/core/engine/install/managed-block.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/managed-block.test.ts

[test-timeout-budget] load average 20.9 on 10 cores: unit limits 14951ms per test, 29901ms per hook (x2.99)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > is a no-op (returns false) when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794465263851.md — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > inverted markers (end before start) — skips with warning
[bkit-install] Inverted managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794465263856.md (end before start) — skipping

stderr | .bkit/core/engine/install/managed-block.test.ts > updateManagedBlock > duplicate markers — skips with warning (preserves all content)
[bkit-install] Multiple managed-block markers in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-managed-1794465263858.md — skipping (expected exactly one of each)

stderr | .bkit/core/engine/install/managed-block.test.ts > slash-comment marker round-trip (markerStyle: 'slash-comment') > updateManagedBlock with slash-comment no-op when markers absent
[bkit-install] Managed block markers absent in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-slash-1794465263872.js — skipping

 ❯ .bkit/core/engine/install/managed-block.test.ts (39 tests | 5 failed) 55ms
   ✓ updateManagedBlock (9)
     ✓ preserves outside-block content when markers present 8ms
     ✓ is a no-op (returns false) when markers absent 3ms
     ✓ returns false when content is already identical 1ms
     ✓ inverted markers (end before start) — skips with warning 3ms
     ✓ duplicate markers — skips with warning (preserves all content) 1ms
     ✓ idempotent on second run even when newContent has a trailing newline 1ms
     ✓ idempotent on second run with newContent that has no trailing newline 2ms
     ✓ shell-comment markers — preserves '# ' prefix on both marker lines 3ms
     ✓ shell-comment markers — idempotent on second run 3ms
   ✓ extractManagedBlock (6)
     ✓ extracts inner content with surrounding newlines stripped 0ms
     ✓ returns null when markers absent 0ms
     ✓ returns null when start appears after end (inverted) 0ms
     ✓ returns null when markers are duplicated 0ms
     ✓ extracts inner content from shell-comment-prefixed markers 0ms
     ✓ ignores backtick-quoted prose mentions 0ms
   ✓ slash-comment marker round-trip (markerStyle: 'slash-comment') (7)
     ✓ extractManagedBlock with slash-comment extracts inner content from JS 0ms
     ✓ extractFullManagedBlock with slash-comment includes marker lines 0ms
     ✓ updateManagedBlock with slash-comment round-trips on JS content 1ms
     ✓ updateManagedBlock with slash-comment is idempotent on second run 1ms
     ✓ updateManagedBlock with slash-comment no-op when markers absent 2ms
     ✓ findLineAnchoredMarkers finds a bare slash-comment marker (prefix '' is allowed) 1ms
     ✓ a bare `# bkit:start` line is not a slash-comment marker 0ms
   ✓ html-comment marker round-trip + default-arg backward compat (5)
     ✓ html-comment round-trip on markdown content 0ms
     ✓ html-comment round-trip on .gitignore content 0ms
     ✓ default arg (no markerStyle) behaves identically to html-comment (backward compat) 0ms
     ✓ updateManagedBlock default (no markerStyle) produces byte-identical output to v0.1.1 1ms
     ✓ a bare `# bkit:start` line is not an html-comment marker 1ms
   ✓ findUnmarkedCopy (5)
     ✓ returns the title when the text holds the title and enough of the block verbatim 1ms
     ✓ returns null for the consumer's own doc that only shares the title 0ms
     ✓ returns null when the shared lines come without the title 0ms
     ✓ ignores title-shaped lines inside fenced code 0ms
     ✓ returns null when the block has no title 0ms
   ✓ stripManagedWrapper historical notices (2)
     ✓ removes a v5 PolyForm-licensed notice with the wrapper 2ms
     ✓ removes a pre-6.0 do NOT edit notice with the wrapper 2ms
   ❯ managedHead (5)
     × returns the text through the bkit:end line 11ms
     × returns null when the file has no markers 1ms
     × returns null when the file has two bkit:end lines 0ms
     × returns null when the file has a second bkit:start line below bkit:end 1ms
     × returns null when bkit:end comes before bkit:start 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/managed-block.test.ts > managedHead > returns the text through the bkit:end line
TypeError: managedHead is not a function
 ❯ .bkit/core/engine/install/managed-block.test.ts:372:12
    370|
    371|   it("returns the text through the bkit:end line", () => {
    372|     expect(managedHead(head + tail)).toBe(head);
       |            ^
    373|     expect(managedHead(head + "\n## Other\n")).toBe(head);
    374|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/install/managed-block.test.ts > managedHead > returns null when the file has no markers
TypeError: managedHead is not a function
 ❯ .bkit/core/engine/install/managed-block.test.ts:377:12
    375|
    376|   it("returns null when the file has no markers", () => {
    377|     expect(managedHead("# Title\n\n## Project Instructions\n")).toBeNu…
       |            ^
    378|   });
    379|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/install/managed-block.test.ts > managedHead > returns null when the file has two bkit:end lines
TypeError: managedHead is not a function
 ❯ .bkit/core/engine/install/managed-block.test.ts:381:12
    379|
    380|   it("returns null when the file has two bkit:end lines", () => {
    381|     expect(managedHead(head + "<!-- bkit:end -->\n" + tail)).toBeNull(…
       |            ^
    382|   });
    383|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/install/managed-block.test.ts > managedHead > returns null when the file has a second bkit:start line below bkit:end
TypeError: managedHead is not a function
 ❯ .bkit/core/engine/install/managed-block.test.ts:385:12
    383|
    384|   it("returns null when the file has a second bkit:start line below bk…
    385|     expect(managedHead(head + "<!-- bkit:start -->\n" + tail)).toBeNul…
       |            ^
    386|   });
    387|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/install/managed-block.test.ts > managedHead > returns null when bkit:end comes before bkit:start
TypeError: managedHead is not a function
 ❯ .bkit/core/engine/install/managed-block.test.ts:389:12
    387|
    388|   it("returns null when bkit:end comes before bkit:start", () => {
    389|     expect(managedHead("<!-- bkit:end -->\nx\n<!-- bkit:start -->\ny\n…
       |            ^
    390|   });
    391| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 34 passed (39)
   Start at  16:34:23
   Duration  892ms (setup 75%, tests 12%, transform 8%, import 3%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-RGzO40/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/ci/ci.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/ci/ci.test.ts

```

## Runner output — `.bkit/core/engine/commands/ci/ci.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/ci/ci.test.ts

[test-timeout-budget] load average 21.1 on 10 cores: unit limits 15050ms per test, 30100ms per hook (x3.01)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores

 ❯ .bkit/core/engine/commands/ci/ci.test.ts (81 tests | 13 failed) 56065ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 1683ms
     ✓ names each net-new and worsened finding in the log and the JSON 1898ms
     ✓ fails on a net score rise with no net count change 1663ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 1560ms
     ✓ treats a net score at or below 0.001 as float noise 1808ms
     ✓ passes when the change only resolves findings 1781ms
     ✓ compares the base commit's tree against the working-tree top, even when run from a subdirectory 1751ms
   ✓ bkit ci slop — base ref resolution (6)
     ✓ skips (exit 0) when the base ref is not present locally, without running slop-scan 1082ms
     ✓ skips (exit 0) when the base resolves to HEAD 1374ms
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 2115ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 2956ms
     ✓ falls back to HEAD on a single-commit repo, which then skips as base-is-head 1198ms
     ✓ is a usage error outside a git repository 18ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 1845ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 1842ms
     ✓ exits 4 on a dropped net field instead of silently passing 1829ms
     ✓ exits 4 on no summary instead of silently passing 2054ms
     ✓ exits 4 on output that is not JSON instead of silently passing 1482ms
     ✓ exits 5 when the base worktree cannot be created 781ms
   ✓ bkit ci slop — large reports (1)
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 1083ms
   ✓ slop-scan resolution and summary reading (2)
     ✓ uses slop-scan from PATH, else npx --no-install 68ms
     ✓ gates on the net figures only 1ms
   ✓ netNewFindings (4)
     ✓ drops a line shift: one added and one resolved for the same file and rule 1ms
     ✓ cancels the shifted finding by message and keeps the new one 1ms
     ✓ reads repo-scoped changes, which have no path 0ms
     ✓ is empty for a report with no change lists, or not JSON 0ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 1107ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 1358ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 1577ms
     ✓ a pre-existing finding that merely moves nets to zero and passes (#226) 804ms
   ✓ bkit ci slop — interrupted (1)
     ✓ removes the base worktree when SIGTERM arrives mid-scan, then dies of the signal 1781ms
   ✓ bkit ci prose — file selection (7)
     ✓ keeps tracked ignored prose and unusual filenames, skipping deleted tracked files 200ms
     ✓ walks standalone consumers without entering nested repositories 3ms
     ✓ walks standalone consumers even when git is unavailable 1ms
     ✓ does not follow a directory symlink replacing tracked prose 249ms
     ✓ defaults to every markdown file outside node_modules 91ms
     ✓ a one-level glob does not descend; ** does; each file once across globs 91ms
     ✓ globToRegExp: * and ? stay within one folder, **/ spans zero or more 1ms
   ✓ bkit ci prose — gate (9)
     ✓ defaults to tracked and unignored new prose, excluding nested checkouts 419ms
     ✓ explicit globs can select ignored prose and nested checkout files 506ms
     ✓ fails closed when the git index cannot be read 244ms
     ✓ fails closed when a selected prose source cannot be read 152ms
     ✓ fails when vale is not installed 135ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 370ms
     ✓ fails (exit 1) when vale reports alerts 498ms
     ✓ exits 6 on a vale runtime error 411ms
     ✓ skips with exit 0 when no file matches 150ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 429ms
     ✓ falls back to vale sync when the main worktree has none 452ms
     ✓ fails when vale sync cannot restore the required styles 396ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 380ms
     ✓ exits 1 with a null token when the message carries none; --ref reads another commit 420ms
     ✓ is a usage error when the commit cannot be read 282ms
   ✓ bkit ci bookkeeping-push (6)
     ✓ exits 0 when the push adds docs, the FID's logs in any month and ledgers only 294ms
     ✓ exits 1 naming the code file, whatever the commit message says 374ms
     ✓ exits 1 when the remote head is not an ancestor (a rewritten PR head) 379ms
     ✓ exits 1 on an all-zero remote head and on a branch that is not feat/{FID} 295ms
     ✓ CHANGELOG.md passes only through bkit.testing.ciSkipPaths in package.json 675ms
     ✓ exits 7 when a commit cannot be read 246ms
   ❯ bkit ci min-push (22)
     ✓ exits 0 when every changed file is a plan log or a ledger 349ms
     ✓ exits 1 naming the files outside, whatever the commit message says 283ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 664ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 399ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 351ms
     ✓ bkit.testing.minPushPaths and ciSkipPaths add to the floor; a repo file passes only through them 641ms
     ✓ a top-level glob in the setting does not reach into folders 373ms
     ✓ a push that changes no files is not proven a min push 691ms
     ✓ exits 7 when a commit or its base cannot be read 448ms
     × exits 0 when every changed file is an audit report under docs/audits 281ms
     × exits 0 when an audit template changes only below its bkit:end, and says why 360ms
     × refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end 332ms
     × refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end 473ms
     × refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end 449ms
     × refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end 315ms
     × refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end 353ms
     × refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end 317ms
     × refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end 553ms
     × refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below 489ms
     × refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below 376ms
     × --update exits 0 when the update changes only an audit template's project section, and logs the template once 484ms
     × --update exits 1 and lists only the code file when a project-section edit ships beside a code file 440ms

⎯⎯⎯⎯⎯⎯ Failed Tests 13 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > exits 0 when every changed file is an audit report under docs/audits
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1081:20
    1079|     });
    1080|     const r = await run(cwd, [`--ref=${head}`], "min-push");
    1081|     expect(r.code).toBe(0);
       |                    ^
    1082|     expect(r.json).toMatchObject({ minPush: true, reason: null, change…
    1083|     expect(r.json.paths).toContain(":(glob)docs/audits/**");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > exits 0 when an audit template changes only below its bkit:end, and says why
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1130:20
    1128|     const { cwd, head } = pushedFrom(belowOnly.before, belowOnly.after…
    1129|     const r = await run(cwd, [`--ref=${head}`], "min-push");
    1130|     expect(r.code).toBe(0);
       |                    ^
    1131|     expect(r.json).toMatchObject({ minPush: true, reason: null, change…
    1132|     expect(r.err).toContain(`${T1}: only its project section below <!-…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses an audit template that changes a line above its bkit:end, beside one changed only below its bkit:end
AssertionError: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-audit-two.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1142:28
    1140|     expect(r.code).toBe(1);
    1141|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1142|     expect(r.json.outside).toEqual([T2]);
       |                            ^
    1143|   });
    1144|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses an audit template that changes lines on both sides of its bkit:end, beside one changed only below its bkit:end
AssertionError: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-audit-two.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1152:28
    1150|     expect(r.code).toBe(1);
    1151|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1152|     expect(r.json.outside).toEqual([T2]);
       |                            ^
    1153|   });
    1154|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses an audit template whose bkit:end line itself changes, beside one changed only below its bkit:end
AssertionError: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-audit-two.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1162:28
    1160|     expect(r.code).toBe(1);
    1161|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1162|     expect(r.json.outside).toEqual([T2]);
       |                            ^
    1163|   });
    1164|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses an audit template that is new at the pushed commit, beside one changed only below its bkit:end
AssertionError: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-audit-two.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1169:28
    1167|     expect(r.code).toBe(1);
    1168|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1169|     expect(r.json.outside).toEqual([T2]);
       |                            ^
    1170|   });
    1171|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses an audit template that is deleted at the pushed commit, beside one changed only below its bkit:end
AssertionError: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-audit-two.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1176:28
    1174|     expect(r.code).toBe(1);
    1175|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1176|     expect(r.json.outside).toEqual([T2]);
       |                            ^
    1177|   });
    1178|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses an audit template renamed at the pushed commit, beside one changed only below its bkit:end
AssertionError: expected [ …(3) ] to deeply equal [ …(2) ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-audit-renamed.md",
    "docs/templates/bkit-audit-two.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1187:28
    1185|     expect(r.code).toBe(1);
    1186|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1187|     expect(r.json.outside).toEqual([renamed, T2]);
       |                            ^
    1188|   });
    1189|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses an audit template that gains a second bkit:end line, beside one changed only below its bkit:end
AssertionError: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-audit-two.md' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-audit-two.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1197:28
    1195|     expect(r.code).toBe(1);
    1196|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1197|     expect(r.json.outside).toEqual([T2]);
       |                            ^
    1198|   });
    1199|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses docs/templates/bkit-plan.md changed only below its bkit:end, beside an audit template changed only below
AssertionError: expected [ …(2) ] to deeply equal [ 'docs/templates/bkit-plan.md' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/bkit-plan.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1208:28
    1206|     expect(r.code).toBe(1);
    1207|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1208|     expect(r.json.outside).toEqual([plan]);
       |                            ^
    1209|   });
    1210|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > refuses docs/templates/sub/bkit-audit-x.md changed only below its bkit:end, beside an audit template changed only below
AssertionError: expected [ …(2) ] to deeply equal [ Array(1) ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "docs/templates/sub/bkit-audit-x.md",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1219:28
    1217|     expect(r.code).toBe(1);
    1218|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1219|     expect(r.json.outside).toEqual([nested]);
       |                            ^
    1220|   });
    1221|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --update exits 0 when the update changes only an audit template's project section, and logs the template once
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1225:20
    1223|     const { cwd, base, head } = pushedFrom(belowOnly.before, belowOnly…
    1224|     const r = await run(cwd, [`--update=${base}:${head}`], "min-push");
    1225|     expect(r.code).toBe(0);
       |                    ^
    1226|     expect(r.json).toMatchObject({ minPush: true, reason: null, outsid…
    1227|     const line = `${T1}: only its project section below <!-- bkit:end …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/13]⎯

 FAIL  .bkit/core/engine/commands/ci/ci.test.ts > bkit ci min-push > --update exits 1 and lists only the code file when a project-section edit ships beside a code file
AssertionError: expected [ …(2) ] to deeply equal [ 'src/a.ts' ]

- Expected
+ Received

  [
+   "docs/templates/bkit-audit-one.md",
    "src/a.ts",
  ]

 ❯ .bkit/core/engine/commands/ci/ci.test.ts:1239:28
    1237|     expect(r.code).toBe(1);
    1238|     expect(r.json).toMatchObject({ minPush: false, reason: "outside" }…
    1239|     expect(r.json.outside).toEqual(["src/a.ts"]);
       |                            ^
    1240|   });
    1241| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/13]⎯


 Test Files  1 failed (1)
      Tests  13 failed | 68 passed (81)
   Start at  16:34:29
   Duration  56.75s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QnYZyU/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/land.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/land.test.ts

```

## Runner output — `.bkit/core/engine/commands/land.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/land.test.ts

[test-timeout-budget] load average 14.7 on 10 cores: unit limits 11850ms per test, 23700ms per hook (x2.37)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores

 ❯ .bkit/core/engine/commands/land.test.ts (45 tests | 2 failed) 57023ms
   ✓ landBackoffMs (2)
     ✓ doubles from the start wait, caps it, and jitters down by at most half 4ms
     ✓ ten tries wait at most three minutes in all 1ms
   ✓ devMoved / devRefused (3)
     ✓ dev moved before or while the push was sent: retry 1ms
     ✓ a server refusal (hook, ruleset, HTTP 403): the PR route 1ms
     ✓ no server answer: neither 1ms
   ✓ devRefRace (2)
     ✓ another fetch moved or holds origin/dev: retry 1ms
     ✓ any other fetch failure, or another ref: not a race 1ms
   ✓ landDir (6)
     ✓ names the throwaway beside the feature worktrees 1ms
     ✓ refuses "../x" as a feature id 1ms
     ✓ refuses "a/b" as a feature id 1ms
     ✓ refuses "" as a feature id 1ms
     ✓ refuses ".hidden" as a feature id 1ms
     ✓ refuses "a..b" as a feature id 1ms
   ✓ withoutHooks (1)
     ✓ points core.hooksPath nowhere for the call, then restores the environment 1ms
   ❯ pushToDev (31)
     ✓ runs docs/plans/notes.md through its declared gate in the built checkout 1681ms
     ✓ runs code.ts through its declared gate in the built checkout 1497ms
     ✓ runs code.ts through its declared gate in the built checkout 1510ms
     × runs docs/audits/202611/logs.md through its declared gate in the built checkout 1974ms
     × runs an audit template's project-section change through bkit:gate:min 2027ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"process.exit(7);"} 1831ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('notes.txt', 'gate mutation');"} 1201ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"script":"fs.writeFileSync('untracked.txt', 'gate output');"} 1798ms
     ✓ refuses a failed or unverifiable landing before updating the remote: {"missing":true} 707ms
     ✓ runs the full gate for replayed debug code 1378ms
     ✓ copies ignored inputs while retaining the built checkout's tracked files 1499ms
     ✓ installs local dependencies against the built target tree 1841ms
     ✓ runs the configured frozen install even without root dependencies 1466ms
     ✓ isolates installation from the main checkout's workspace (target workspace: false) 1657ms
     ✓ isolates installation from the main checkout's workspace (target workspace: true) 1696ms
     ✓ lands the commit on origin/dev and leaves the main checkout alone 1580ms
     ✓ never pushes local dev commits missing from origin/dev 1614ms
     ✓ dev moved: rebuilds on the new dev and pushes again 3450ms
     ✓ dev moved before every push: exhausted, nothing landed 6185ms
     ✓ any other refusal is returned, not retried 1556ms
     ✓ pushToDev replays a commit range onto origin/dev 1127ms
     ✓ a replay retries on the new dev when dev moved 1768ms
     ✓ pushToDev log line names what it lands 922ms
     ✓ runs no git hooks in the throwaway checkout, and says so 1157ms
     ✓ removes a locked throwaway a killed landing left behind, then lands 973ms
     ✓ a push that fails without a server answer is returned once, never retried 1196ms
     ✓ a failed fetch is returned before anything is built 509ms
     ✓ a fetch that loses the origin/dev ref race retries and lands 2891ms
     ✓ a fetch that loses the origin/dev ref race on every attempt is returned as fetch-failed 2741ms
     ✓ lands from a clone whose fetch refspec omits dev 4548ms
     ✓ build throwing stops the landing and removes the throwaway checkout 1024ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/land.test.ts > pushToDev > runs docs/audits/202611/logs.md through its declared gate in the built checkout
AssertionError: expected 'unit\n' to be 'min\n' // Object.is equality

- Expected
+ Received

- min
+ unit


 ❯ .bkit/core/engine/commands/land.test.ts:243:75
    241|     });
    242|     expect(res.kind).toBe("landed");
    243|     expect(fs.readFileSync(path.join(root, ".git", "gate-runs"), "utf8…
       |                                                                           ^
    244|   });
    245|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/land.test.ts > pushToDev > runs an audit template's project-section change through bkit:gate:min
AssertionError: expected 'unit\n' to be 'min\n' // Object.is equality

- Expected
+ Received

- min
+ unit


 ❯ .bkit/core/engine/commands/land.test.ts:263:75
    261|     });
    262|     expect(res.kind).toBe("landed");
    263|     expect(fs.readFileSync(path.join(root, ".git", "gate-runs"), "utf8…
       |                                                                           ^
    264|   });
    265|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 43 passed (45)
   Start at  16:35:28
   Duration  57.71s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-VkHJgQ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

[test-timeout-budget] load average 19.7 on 10 cores: unit limits 14350ms per test, 28700ms per hook (x2.87)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (106 tests | 4 failed) 155740ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 164ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 789ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 878ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 178ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 1010ms
     ✓ .husky/pre-push: empty stdin → gates still run 1352ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 773ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 108ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 693ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 426ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 628ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 160ms
     ✓ .husky/pre-push: first and last lines name the log 506ms
     ✓ .husky/pre-push: the hook body runs once 776ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 827ms
     ✓ tag delete alongside that tag → still skipped 667ms
     ✓ tag on a commit no origin branch holds → gates run 1216ms
     ✓ tag pushed with a branch → gates run 1552ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 816ms
     ✓ release branch and a tag, both already tested → still skipped 727ms
     ✓ branch with files no origin dev / main tip has → gates run 1278ms
     ✓ dev push with the files origin/dev already has → gates run 1400ms
     ✓ main push with the files origin/main already has → gates run 1462ms
     ✓ no origin dev / main ref fetched → a branch push gates 1379ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 1906ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1509ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2042ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 1778ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2936ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 3480ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1650ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1692ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2079ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 2431ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 4672ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 4250ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 2544ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 1730ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1430ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 835ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 997ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 1450ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 1623ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1276ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 959ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 886ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 972ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 962ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1010ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 999ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 941ms
     ✓ a stale register stops the push before any gate runs 1212ms
     ✓ bkit check fails → the push stops before any gate runs 858ms
     ✓ the dependency audit runs before any gate, when its script is present 1140ms
     ✓ no dependency-audit script → skipped, the gates still run 749ms
     ✓ no register script → skipped, the gates still run 997ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1337ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1207ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1106ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 814ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1116ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 2352ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 2135ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1728ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 24ms
     ✓ push to dev, register current → push goes on 94ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 32ms
     ✓ push to another branch → no check, push goes on 745ms
     ✓ revert push to dev → no check, push goes on 418ms
     ✓ graphify not adopted → nothing runs 14ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 641ms
     ✓ branch with an open PR into dev, register current → push goes on 625ms
     ✓ branch with no open PR → no check, push goes on 954ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 417ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 1067ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 716ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 703ms
     ✓ revert push of a branch with an open PR → no check 359ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1205ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 1366ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 1126ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1561ms
   ❯ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 7615ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 4697ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 2192ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 3633ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1767ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 2306ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1845ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2199ms
     × .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1651ms
     × .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1754ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1581ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2394ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 2583ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1660ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2697ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1583ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1875ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1973ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2647ms
     × .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1650ms
     × .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1945ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1744ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1629ms
     ✓ .husky/pre-push: a code push still runs them 2490ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate
 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1225:24
    1223|       );
    1224|       const r = push(hook, head, "refs/heads/dev");
    1225|       expect(r.status).toBe(0);
       |                        ^
    1226|       expect(r.stderr).not.toContain("CI-suppressing token");
    1227|       expect(r.calls).toContain("bkit:gate:min");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate
 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push min push > .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1242:24
    1240|       );
    1241|       const r = push(hook, head, "refs/heads/dev", remote);
    1242|       expect(r.status).toBe(0);
       |                        ^
    1243|       expect(r.stderr).not.toContain("CI-suppressing token");
    1244|       expect(r.calls).toContain("bkit:gate:min");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 102 passed (106)
   Start at  16:36:36
   Duration  156.75s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gkVPsw/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/ci/push-gate.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/ci/push-gate.test.ts

```

## Runner output — `.bkit/core/engine/commands/ci/push-gate.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/ci/push-gate.test.ts

[test-timeout-budget] load average 14.5 on 10 cores: unit limits 11750ms per test, 23500ms per hook (x2.35)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/915-min-push-ignores

[feat/test 59ff5d3] gate
 ❯ .bkit/core/engine/commands/ci/push-gate.test.ts (23 tests | 1 failed) 28053ms
   ❯ verified incremental push gates (23)
     ✓ keeps the later failure when two full gates overlap on the same commit 1567ms
     ✓ keeps the later interruption when two full gates overlap on the same commit 1502ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 199ms
     ✓ rejects missing or empty bkit:gate:static-unit before starting the package runner 190ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 235ms
     ✓ rejects missing or empty bkit:gate:min before starting the package runner 214ms
     ✓ blocks older proof after a later full failure, including a malformed failure boundary, then recovers with a new full success 1491ms
     ✓ does not fall back through a malformed later success receipt 810ms
     ✓ requires proof for empty docs updates and refuses rewritten or unknown remote heads 700ms
     ✓ invalidates an earlier receipt when a repeat full gate fails 1409ms
     ✓ executes the full gate and carries its proof across bookkeeping and empty commits 2397ms
     × a full-gate receipt carries an audit template's project-section increment to the minimum gate 1606ms
     ✓ requires proof even when the pushed increment changes no files 1501ms
     ✓ ignores malformed receipts 1553ms
     ✓ does not record a tracked tree 704ms
     ✓ does not record a untracked tree 625ms
     ✓ does not record a mutated tree 888ms
     ✓ does not record a committed tree 916ms
     ✓ records no proof for a failed gate or lighter gate 1592ms
     ✓ requires integration proof when integration is declared 1761ms
     ✓ rejects new code, a mixed push, new branches with code, and non-ancestor old heads 3850ms
     ✓ invalidates proof when the gate definition changes 1389ms
     ✓ keeps whole-branch docs-only classification and rejects mixed argument modes 951ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/ci/push-gate.test.ts > verified incremental push gates > a full-gate receipt carries an audit template's project-section increment to the minimum gate
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/ci/push-gate.test.ts:213:54
    211|     write(cwd, file, template("new project text"));
    212|     const edited = commit(cwd, "edit project section");
    213|     expect((await min(cwd, checked, edited)).status).toBe(0);
       |                                                      ^
    214|     write(cwd, file, template("new project text").replace("block", "ch…
    215|     const above = commit(cwd, "edit managed block");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 22 passed (23)
   Start at  16:39:14
   Duration  28.30s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-keEAFE/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
