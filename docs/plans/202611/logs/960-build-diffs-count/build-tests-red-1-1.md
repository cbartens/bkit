Enforced: true
Red: 10
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/960-build-diffs-count-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev" | red | failure: featureBase is not a function |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase picks the origin/dev meeting point when local dev equals origin/dev" | red | failure: featureBase is not a function |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged" | red | failure: featureBase is not a function |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev" | red | failure: featureBase is not a function |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase falls back to the origin/dev meeting point and logs when the combination conflicts" | red | failure: featureBase is not a function |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase uses the origin/dev meeting point when there is no local dev" | red | failure: featureBase is not a function |
| 2 | `.bkit/core/engine/commands/workflow/context.test.ts` "context diff without --base leaves out an unpushed local dev commit" | red | failure: expected { …(11) } to match object { filesChanged: 1, linesAdded: 1 } (20 matching properties omitted from actual) |
| 2 | `.bkit/core/engine/commands/workflow/challenge.test.ts` "challenge gate without --base sizes only the branch's own lines" | red | failure: expected { size: 'large', skipped: false, …(4) } to match object { size: 'small', skipped: true, …(2) } (2 matching properties omitted from actual) |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff without --base ignores a match that only an unpushed local dev commit adds" | red | failure: expected 2 to be 1 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "cleanBase with no clean round returns the feature base, not origin/dev" | red | failure: expected 'origin/dev' to be '03a2b20325f563af066393e680988a9bd33e1…' // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/context.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/context.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/context.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/context.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count

pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ❯ .bkit/core/engine/commands/workflow/context.test.ts (114 tests | 7 failed) 3196ms
   ✓ bkit context clamp (#427 T1) (22)
     ✓ leaves a file exactly at its cap byte-identical, with no footer 7ms
     ✓ clamps a file one line over its cap and footers it, keeping the FIRST lines 4ms
     ✓ counts a final line with no trailing newline 4ms
     ✓ fires the byte cap independently of the line cap 5ms
     ✓ reports counts that match the clamped file, and the artifact as given 5ms
     ✓ keeps both ends of a long failing run under debug-evidence 10ms
     ✓ never drops a signal line buried in the middle 13ms
     ✓ keeps every signal line when they are scattered throughout 13ms
     ✓ matches the multibyte signal glyphs too 9ms
     ✓ shortens an over-long line in place instead of evicting readable ones 8ms
     ✓ keeps a line whose signal text sits past the per-line cap 8ms
     ✓ marks every removal in place, not just in the footer 11ms
     ✓ bounds a file where nearly every line matches, and says the ceiling fired 18ms
     ✓ leaves a debug-evidence file under the threshold byte-identical 5ms
     ✓ an unreadable file exits 4; an unknown profile exits 2; neither rewrites 8ms
     ✓ the byte cap keeps the longest prefix that fits, and footers human sizes 4ms
     ✓ a ledger over its cap with no final newline is cut whole-line, sized as on disk 4ms
     ✓ shortens an over-long line by bytes, not characters 7ms
     ✓ over the threshold but every line kept by signal context: untouched, not clamped 14ms
     ✓ a gap no larger than its own marker is kept instead of marked 13ms
     ✓ debug-evidence with no final newline ends the kept tail with one 8ms
     ✓ keeps carriage returns verbatim and counts them as bytes 7ms
   ✓ bkit context clamp — per-context profiles (#697) (5)
     ✓ names the ledger, base and per-context profiles 0ms
     ✓ keeps each context's own section header and drops every other context's 146ms
     ✓ keeps each context's own section banner and drops every other context's 344ms
     ✓ a ci artifact keeps a section header that carries none of the base signal words 12ms
     ✓ every evidence profile keeps a buried ===== TRUNCATED: … ===== line 52ms
   ✓ bkit context clamp — per-context saving (#697) (2)
     ✓ totals artifacts, lines, bytes and table / raw per context 0ms
     ✓ counts a record whose render is absent, and skips a record naming no context-fetch context 0ms
   ✓ untouched originals (keepRaw) (4)
     ✓ keepRaw copies the original byte-identical to {name}.raw.{ext} in the folder given 8ms
     ✓ clamp keeps the original in the outbox, never under logs/, and the record names it with its source 25ms
     ✓ a file left whole keeps no copy: raw is null 15ms
     ✓ outside a git repo the original has nowhere to go: clamped, raw null, and it says so 4ms
   ✓ bkit context clamp-log (#427 T1) (4)
     ✓ collects records across calls and survives a repeated read 8ms
     ✓ reports an empty array when a step clamped nothing, or the log is absent 0ms
     ✓ derives tmp/bkit-clamp-{fid}-{step}[-{attempt}].jsonl under the repo top 12ms
     ✓ needs a log 0ms
   ✓ humanBytes (9)
     ✓ 1023 -> 1023 B 0ms
     ✓ 1024 -> 1 KB 0ms
     ✓ 1535 -> 1 KB 0ms
     ✓ 1536 -> 2 KB 0ms
     ✓ 1048576 -> 1.0 MB 0ms
     ✓ 1310720 -> 1.2 MB 0ms
     ✓ 1835008 -> 1.8 MB 0ms
     ✓ 1415577 -> 1.3 MB 0ms
     ✓ 1415578 -> 1.4 MB 0ms
   ✓ bkit context ledger-scan (#427 T3) (10)
     ✓ keeps the top 40 by term overlap and footers the total 4ms
     ✓ ties break newest-line first 4ms
     ✓ emits no footer, and drops no line, below the cap 4ms
     ✓ keeps a literal tab inside a matching JSONL line intact 4ms
     ✓ writes None. when nothing matches and when the ledger is absent 8ms
     ✓ a sole term matches on its own; matching is case-insensitive 4ms
     ✓ counts distinct terms, ignoring repeats and stray spaces 12ms
     ✓ applies the same shape to the failures ledger and records the clamp 4ms
     ✓ blank lines in the ledger never match and still count toward newest-first 4ms
     ✓ --reset-log empties the log; without it records accumulate 8ms
   ✓ context-fetch block parsing (4)
     ✓ parses name and context, last token winning, context defaulting to runtime 0ms
     ✓ lists only blocks after <!-- bkit:end -->, with ordinal, body and artifact stem 0ms
     ✓ joins every fenced range in one block 0ms
     ✓ no bkit:end line means no consumer blocks 0ms
   ✓ bkit context list-blocks (3)
     ✓ emits blocks, coverage and configured contexts, and narrates coverage 0ms
     ✓ says loudly when nothing is configured 0ms
     ✓ emits each provision block's bash body below bkit:end, in file order, and no fetch body 0ms
   ✓ bkit context provision (3)
     ✓ runs every recipe, lists each failed one with its last error line, and keeps going 33ms
     ✓ removes a stale failure file once every recipe succeeds 17ms
     ✓ with no recipes, runs nothing and removes a stale failure file 4ms
   ✓ bkit context run-block / finalise (#427 T4) (16)
     ✓ a clamped artifact ends at END UNTRUSTED, with the truncation footer inside the fence 64ms
     ✓ a clamped fetch keeps the whole payload in the outbox; the record carries the block body as its source 44ms
     ✓ an unclamped payload is wrapped whole; the block sees its context variables 24ms
     ✓ no stdout but a skip line writes the breadcrumb and says NOT CHECKED 16ms
     ✓ neither data nor a skip line writes nothing and says so 16ms
     ✓ block 4 is not run 8ms
     ✓ block 5 is not run 8ms
     ✓ block 9 is not run 7ms
     ✓ reads the attempt from status.jsonl, and refuses a run without one 24ms
     ✓ clamps a ci block with the ci profile and a runtime block without it 83ms
     ✓ finalise derives verdict, artifacts, configured contexts and clamp records 42ms
     ✓ finalise totals a rendered fetch per context (table vs raw) 34ms
     ✓ finalise totals a rendered fetch's origBytes as the bytes the block printed 33ms
     ✓ finalise with no artifacts is FAIL 12ms
     ✓ finalise --record writes and commits the context-fetch row, and prints the step comment 123ms
     ✓ finalise --record needs --file 12ms
   ✓ bkit context diff (10)
     ✓ writes origin/dev...HEAD without docs/plans/** and prints the numstat numbers 77ms
     ✓ --base narrows the range to the commits after a group's start sha 112ms
     ✓ diff from a group start covers only the group's commits 101ms
     ✓ a base that is not a commit exits 5 and writes nothing 37ms
     ✓ an empty range writes a one-line note and zero numbers 69ms
     ✓ over the guard: the first line says so, then --stat, then the largest files first, each cut 110ms
     ✓ --reset-log empties the step's clamp log before the record lands 123ms
     ✓ partial: prints and writes the files not shown whole, and keeps the whole diff in the outbox 80ms
     ✓ whole: nothing omitted and no copy kept 72ms
     ✓ the budget honours topFiles and totalLines and says when the ceiling cut a file 76ms
   ❯ featureBase (#960) (7)
     × featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev 80ms
     × featureBase picks the origin/dev meeting point when local dev equals origin/dev 71ms
     × featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged 78ms
     × featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev 136ms
     × featureBase falls back to the origin/dev meeting point and logs when the combination conflicts 154ms
     × featureBase uses the origin/dev meeting point when there is no local dev 62ms
     × context diff without --base leaves out an unpushed local dev commit 102ms
   ✓ bkit context brief (15)
     ✓ brief --next picks the first group with an open task 3ms
     ✓ brief --next reads a build-plan-execute-*-log.md written before the step rename 1ms
     ✓ brief --next with every task done writes nothing and reports no group 1ms
     ✓ brief leaves out tasks with a DONE line 1ms
     ✓ brief carries DEPENDS ON summaries from earlier groups 1ms
     ✓ brief includes the note file under deviations 1ms
     ✓ brief prints path and sizes only 1ms
     ✓ brief carries the Reuse Inventory rows and Architecture entries for the group's files 2ms
     ✓ brief leaves out entries past the 8KB work cap and says how many and where 1ms
     ✓ --tests-only writes build-brief-tests-{group}-{n}.md with the open task blocks and no Reuse Inventory or Architecture entries 11ms
     ✓ --tests-only adds the Derived Test Matrix rows whose Target file a TEST FIRST line of the group names 9ms
     ✓ --tests-only lists each planned test its file already holds, with the line it starts on, and leaves the section out when none exists 15ms
     ✓ --tests-only --file leaves out a test a build-tests-red row of the group proved red, and a task with no test left 10ms
     ✓ --tests-only prints tests: 0 for a group with no planned test, and writes nothing 1ms
     ✓ brief refuses a group the plan does not have 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > featureBase (#960) > featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev
TypeError: featureBase is not a function
 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1646:12
    1644|     put(dir, "f.txt", "f\n");
    1645|     commitAll(dir, "feat work");
    1646|     expect(featureBase(dir)).toBe(l1);
       |            ^
    1647|   });
    1648|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > featureBase (#960) > featureBase picks the origin/dev meeting point when local dev equals origin/dev
TypeError: featureBase is not a function
 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1654:12
    1652|     put(dir, "f.txt", "f\n");
    1653|     commitAll(dir, "feat work");
    1654|     expect(featureBase(dir)).toBe(base);
       |            ^
    1655|   });
    1656|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > featureBase (#960) > featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged
TypeError: featureBase is not a function
 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1664:12
    1662|     put(dir, "f.txt", "f\n");
    1663|     commitAll(dir, "feat work");
    1664|     expect(featureBase(dir)).toBe(base);
       |            ^
    1665|   });
    1666|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > featureBase (#960) > featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev
TypeError: featureBase is not a function
 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1676:20
    1674|     commitAll(dir, "feat work");
    1675|     g(dir, "merge", "-q", "--no-edit", "origin/dev");
    1676|     const result = featureBase(dir);
       |                    ^
    1677|     expect(result).toMatch(/^[0-9a-f]{40}$/);
    1678|     expect(result).not.toBe(l1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > featureBase (#960) > featureBase falls back to the origin/dev meeting point and logs when the combination conflicts
TypeError: featureBase is not a function
 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1700:20
    1698|     expect(g(dir, "merge-base", "HEAD", "dev")).toBe(l1);
    1699|     const lines: string[] = [];
    1700|     const result = featureBase(dir, (line) => lines.push(line));
       |                    ^
    1701|     expect(result).toBe(o1);
    1702|     expect(lines).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > featureBase (#960) > featureBase uses the origin/dev meeting point when there is no local dev
TypeError: featureBase is not a function
 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1711:12
    1709|     commitAll(dir, "feat work");
    1710|     g(dir, "branch", "-q", "-D", "dev");
    1711|     expect(featureBase(dir)).toBe(base);
       |            ^
    1712|   });
    1713|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/context.test.ts > featureBase (#960) > context diff without --base leaves out an unpushed local dev commit
AssertionError: expected { …(11) } to match object { filesChanged: 1, linesAdded: 1 }
(20 matching properties omitted from actual)

- Expected
+ Received

  {
-   "filesChanged": 1,
-   "linesAdded": 1,
+   "filesChanged": 2,
+   "linesAdded": 2,
  }

 ❯ .bkit/core/engine/commands/workflow/context.test.ts:1724:20
    1722|     const r = await run(["diff", `--artifact=${artifact}`], dir);
    1723|     expect(r.code).toBe(0);
    1724|     expect(r.json).toMatchObject({ filesChanged: 1, linesAdded: 1 });
       |                    ^
    1725|     expect(r.json.base).not.toBe("origin/dev");
    1726|     const body = read(path.join(dir, artifact));

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 107 passed (114)
   Start at  05:58:55
   Duration  3.38s (tests 96%, import 2%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jNDKgO/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/challenge.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/challenge.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/challenge.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/challenge.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count

 ❯ .bkit/core/engine/commands/workflow/challenge.test.ts (39 tests | 1 failed) 1016ms
   ✓ bkit challenge merge (32)
     ✓ merges one report 36ms
     ✓ keeps the worse severity 11ms
     ✓ drops an accepted finding 10ms
     ✓ numbers after the last task 10ms
     ✓ writes findings as new last groups of at most 3 tasks, each a block that passes plan-check 10ms
     ✓ appends findings as TASK GROUP headings 9ms
     ✓ challenge merge writes a matrix row for each appended finding task 10ms
     ✓ challenge merge refuses a matrix row a pipe in the test name would break 9ms
     ✓ leaves the plan unchanged when plan-check fails 9ms
     ✓ routes unfixable HIGH to pause 9ms
     ✓ routes unfixable MEDIUM to pause 9ms
     ✓ routes a fixable task in the last round to fix 9ms
     ✓ routes an unfixable task in the last round to pause 9ms
     ✓ refuses a round over the limit, and takes it once the owner granted one more allowance 13ms
     ✓ refuses an old-format report with findings 5ms
     ✓ refuses a report in task-line form 5ms
     ✓ refuses a finding block with no Location 5ms
     ✓ refuses a missing report 5ms
     ✓ a second run with the same reports appends nothing 30ms
     ✓ a finding reported again in round 2 reruns its open round-1 task instead of a twin 23ms
     ✓ a finding whose round-1 task is ticked done but comes back in round 2 gets a new task 32ms
     ✓ a reopened task that is ticked done after round 2 is not appended again on a re-run 24ms
     ✓ drops a finding at an accepted extensionless path 9ms
     ✓ acceptedLocations counts a lettered Decision: A) Accept line 1ms
     ✓ deferred counts the rows written 32ms
     ✓ 7 findings give three new groups of 3, 3 and 1 9ms
     ✓ challenge merge splits groups at the configured maxPerGroup 10ms
     ✓ refuses a finding with 16 planned tests 9ms
     ✓ routes more findings than one round may add to pause and writes nothing 17ms
     ✓ LOW finding becomes a deferral row 24ms
     ✓ a failed LOW deferral append leaves the plan unchanged; the re-run writes both 28ms
     ✓ writes LOW deferrals at the checkout root when run from a subfolder 32ms
   ✓ structured challenge findings (1)
     ✓ reuses structured challenge findings without losing semantic inputs 1ms
   ❯ bkit challenge gate (6)
     ✓ challenge-1 skipped below threshold 0ms
     ✓ challenge gate writes a challenge-gate row 113ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 223ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 82ms
     × challenge gate without --base sizes only the branch's own lines 98ms
     ✓ challenge gate exits 5 when --base names no commit 35ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/challenge.test.ts > bkit challenge gate > challenge gate without --base sizes only the branch's own lines
AssertionError: expected { size: 'large', skipped: false, …(4) } to match object { size: 'small', skipped: true, …(2) }
(2 matching properties omitted from actual)

- Expected
+ Received

  {
-   "filesChanged": 1,
-   "linesChanged": 1,
-   "size": "small",
-   "skipped": true,
+   "filesChanged": 2,
+   "linesChanged": 301,
+   "size": "large",
+   "skipped": false,
  }

 ❯ .bkit/core/engine/commands/workflow/challenge.test.ts:948:20
    946|     const r = await gate(`--file=${STATUS}`);
    947|     expect(r.code).toBe(0);
    948|     expect(r.json).toMatchObject({
       |                    ^
    949|       size: "small",
    950|       skipped: true,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 38 passed (39)
   Start at  05:58:59
   Duration  1.21s (tests 88%, import 5%, transform 5%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-w9yG0A/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (278 tests | 1 failed) 77257ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 121ms
     ✓ rejects missing explicit and ambiguous existing branch selections 103ms
   ✓ branches rebase: classification (31)
     ✓ ledger list does not drift from .gitattributes merge=union 1ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 0ms
     ✓ refuses src.txt 0ms
     ✓ refuses package.json 0ms
     ✓ refuses .bkit/config.json 0ms
     ✓ refuses docs/testing.md 0ms
     ✓ refuses docs/plans/202608/234-plan.md 0ms
     ✓ refuses apps/web/data.jsonl 0ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies every generated register as the register shape, and only at its exact path 0ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 0ms
     ✓ classifies the install record, and only at its exact path 0ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 33ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 189ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 195ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 128ms
     ✓ a refused --continue carries git's own reason 160ms
     ✓ --file records nothing for a refused rebase 121ms
     ✓ refuses a code conflict and aborts the rebase on the spot 126ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 299ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 117ms
     ✓ produces byte-identical output to merge=union 282ms
     ✓ restores a trailing newline so the next append starts on its own line 171ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 162ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 238ms
     ✓ refuses a union that leaves a line which is not JSON 138ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 188ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 335ms
     ✓ refuses a lockfile whose regenerate command fails 280ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 241ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 243ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 248ms
     ✓ refuses and aborts when both sides changed the hand-written region 135ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 164ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 207ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 254ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 146ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 180ms
     ✓ refuses and aborts when a side deleted the install record 143ms
     ✓ refuses a conflicted doc the repo's script does not list 128ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 154ms
     ✓ removes a stale sentinel when the rebase succeeds 173ms
     ✓ exits 4 when no rebase is in progress 45ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 227ms
     ✓ resolves a conflict in each of two replayed commits across rounds 218ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 9ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 26ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 17ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 9ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 8ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 16ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 16ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 16ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 16ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 0ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 16ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 0ms
     ✓ stampAnchor: empty file 0ms
     ✓ stampAnchor: no trailing newline (kept as-is) 0ms
     ✓ stampAnchor: two blocks (both removed) 0ms
     ✓ stampAnchor: close on the line after open (body line kept) 0ms
     ✓ stampAnchor: inline lookalike marker is not a block 0ms
     ✓ stampAnchor: empty field block 0ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 16ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 114ms
       ✓ skips (12) with no anchor 115ms
       ✓ skips (12) when the base is unreachable in this clone 125ms
       ✓ skips (12) when nothing landed since the base 124ms
       ✓ runs (0) with the landed path count once dev moved 227ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 121ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 239ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 151ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 193ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 403ms
     ✓ runs exactly one git push 570ms
     ✓ --set-upstream records the upstream 168ms
     ✓ refuses with no branch checked out 134ms
     ✓ --mode=dev refuses a feature checkout 129ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 326ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 495ms
     ✓ --require-ci pushes as-is when dev has not moved 207ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 378ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 531ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 142ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 293ms
     ✓ --mode=abort pushes when the branch has no open PR 317ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 281ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 130ms
     ✓ --open-pr carries the MCP answer and skips gh 170ms
     ✓ --mode=abort on dev pushes plainly without probing 169ms
     ✓ rejects an unknown mode 124ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 539ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 281ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 323ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1127ms
     ✓ skip-ci HEAD on the replay is refused 209ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 546ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1011ms
     ✓ a level local dev is a plain push, recording nothing extra 263ms
     ✓ a record with no commits pushes nothing 197ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 138ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 570ms
     ✓ a rewritten branch is refused, never forced 198ms
     ✓ refuses dev and main with exit 21 and pushes nothing 129ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 322ms
     ✓ refuses a detached HEAD (exit 5) 134ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 268ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 260ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 250ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 314ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 138ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 307ms
     ✓ an up-to-date branch is a no-op 194ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 305ms
     ✓ a fetch that fails exits 10 126ms
   ❯ branches scan-diff (40)
     ✓ scan-diff does not treat an existing skip in a re… 172ms
     ✓ scan-diff still reports a new skip when its test … 174ms
     ✓ scan-diff reports a skip moved onto a different t… 170ms
     ✓ scan-diff does not cancel a skip moved between am… 169ms
     ✓ scan-diff does not spend an unchanged duplicate t… 173ms
     ✓ scan-diff recognizes a renamed test file 174ms
     ✓ scan-diff recognizes a suite moved into a differe… 199ms
     ✓ scan-diff does not let unrelated additions hide a… 172ms
     ✓ scan-diff attributes deletion to its old test ins… 170ms
     ✓ scan-diff consumes each moved assertion once and … 171ms
     ✓ scan-diff does not match identical assertions fro… 170ms
     ✓ scan-diff does not match the same leaf test name … 176ms
     ✓ scan-diff does not match a same-named test with d… 172ms
     ✓ scan-diff does not match a same-named test with c… 176ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 174ms
     ✓ --paths with no match exits 1 160ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 124ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 230ms
     × scan-diff without --base ignores a match that only an unpushed local dev commit adds 146ms
     ✓ --marker reads a diff over 1 MiB 190ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 205ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 187ms
     ✓ scan-diff finds an added skip 190ms
     ✓ scan-diff ignores a skip predating the base 171ms
     ✓ scan-diff reports a disabled test with its line 188ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 174ms
     ✓ scan-diff ignores a removed comment in a test file 171ms
     ✓ scan-diff ignores an assertion moved within the file 171ms
     ✓ scan-diff still reports a removed assertion 171ms
     ✓ scan-diff reports an assertion re-added only outside the test file 171ms
     ✓ scan-diff finds an added pytest mark skip 191ms
     ✓ scan-diff finds an added unittest skip 171ms
     ✓ scan-diff finds an added bare skip call 172ms
     ✓ scan-diff ignores a quoted skip in a documentation file 172ms
     ✓ scan-diff ignores a marker literal in a non-test source file 176ms
     ✓ scan-diff ignores an assertion whose expectation changed 175ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 174ms
     ✓ scan-diff reports a deleted test file 175ms
     ✓ scan-diff never opens a symlinked test file's outside target 1ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 132ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 444ms
     ✓ a title that already carries the marker is left alone 397ms
     ✓ with no open PR: pushes the marker commit and edits no title 399ms
     ✓ a re-run is deduped: no second marker commit 444ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 517ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 134ms
     ✓ --title-set skips gh entirely 215ms
     ✓ refuses dev and main (exit 21) 107ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 432ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 771ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 426ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 955ms
     ✓ continues only the explicitly recorded target through the public merge command 630ms
     ✓ fetches the unseen feature head before classifying the base 435ms
     ✓ fast forwards the feature before either base path is chosen 932ms
     ✓ merges divergent feature tips without rebasing either side 549ms
     ✓ continues the feature merge before starting a dev merge 857ms
     ✓ publishes local code with a CI running head before bookkeeping 988ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 1319ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 859ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 594ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 167ms
     ✓ Path B once dev moved; --head checks a given commit 257ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 254ms
     ✓ --merge-docs merges dev when docs/ is behind 311ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 300ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 437ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 428ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 350ms
     ✓ --merge-docs skips an empty bkit:generate script 313ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 265ms
     ✓ --merge-docs never merges on dev itself 234ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 351ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 350ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 329ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 339ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 184ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 434ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 538ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 522ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 517ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 432ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 549ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 406ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 478ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 314ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 220ms
     ✓ exits 10 when the fetch fails 144ms
     ✓ refuses --merge-docs with --head, and an unknown --head 154ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 282ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 478ms
     ✓ a failed install stops ship (16) 423ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 298ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 280ms
     ✓ exits 10 when the fetch fails 217ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 154ms
     ✓ preserves unlanded file type changes in the shared landed comparison 151ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 108ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 158ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 710ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 704ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 702ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 751ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1689ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1957ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 279ms
     ✓ local: names unpushed dev as the cause when the branch carries it 307ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 329ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1132ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 941ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 768ms
     ✓ uses tree entry equivalence for design and plan land cleanup 3349ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 635ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 862ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 787ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 615ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 905ms
     ✓ land removes the worktree when only the copied .env is untracked 693ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 579ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 644ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1307ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 701ms
     ✓ landPr refuses a main-based PR without retrying 489ms
     ✓ landPr refuses when the PR base is unknown 513ms
     ✓ PR not open (closed): stops (17) at once, no retry 587ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 295ms
     ✓ --attempt names the merge round in a fix commit 264ms
     ✓ commits a rewritten and a deleted tracked file 267ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 226ms
     ✓ reports undeclared and runs nothing with no scripts 165ms
     ✓ reports undeclared and runs nothing with an empty script 160ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 210ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 243ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 166ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff without --base ignores a match that only an unpushed local dev commit adds
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2180:24
    2178|     commit(clone, { "a.txt": "a\n" }, "feat(1-x): work");
    2179|     const clean = await run(clone, ["scan-diff", "--marker=[DEBUG-OBSE…
    2180|     expect(clean.code).toBe(1);
       |                        ^
    2181|     expect(clean.json).toEqual({ found: false, paths: [] });
    2182|     commit(clone, { "src/x.ts": "log('[DEBUG-OBSERVE] x')\n" }, "probe…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 277 passed (278)
   Start at  05:59:01
   Duration  77.41s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Ouu5wu/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/status.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/status.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/status.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/960-build-diffs-count

 ❯ .bkit/core/engine/commands/workflow/status.test.ts (88 tests | 1 failed) 1130ms
   ✓ debug evidence state (5)
     ✓ persists atomic selections and preserves identical evidence generations 4ms
     ✓ resumes saved evidence and replaces it only on explicit new selection 20ms
     ✓ clears saved CI routing immediately for explicit local selection 10ms
     ✓ counts reproduction and fixes only in the active generation 14ms
     ✓ orders covering gates for red tiers and preserves live off 18ms
   ✓ bkit status path (2)
     ✓ returns the main checkout's path outside a worktree, and whether it exists 13ms
     ✓ rejects a month that is not YYYYMM 0ms
   ✓ the status fold (4)
     ✓ skips a row it does not model (no type, an unknown type) and folds the rest 1ms
     ✓ ignores a row type it does not know 1ms
     ✓ refuses a line that is not JSON rather than folding around it (exit 3) 0ms
     ✓ a command reading the log reports the malformed line with exit 3 0ms
   ✓ bkit status route (20)
     ✓ reads the last verdict and failures of a step in the active run, per group 5ms
     ✓ reads a build-plan-execute row written before the step rename as build-plan-tasks 5ms
     ✓ prints the parentSha of the step's last row in the active run, per group 0ms
     ✓ counts absent failures as 0 when a verdict is present 0ms
     ✓ reads an absent failures count on FAIL as null: the count is unknown, not 0 0ms
     ✓ does not leak a completed run's verdict into a fresh run 0ms
     ✓ reads strategy across ALL runs and gives the next rung 0ms
     ✓ starts the ladder at STANDARD when no strategy is recorded 0ms
     ✓ prefers the run-level debugMode over an older step value, and reads pushMode and debugAttempt 0ms
     ✓ fails a --require'd mode that is missing or invalid 0ms
     ✓ is a usage error to require a step field without --step 0ms
     ✓ exits 3 when status.jsonl is missing 0ms
     ✓ falls back to the last step carrying debugMode / pushMode when no workflow-meta sets it 0ms
     ✓ reports an invalid mode as null, never as a mode 0ms
     ✓ climbs the ladder: PIVOT -> FINAL 0ms
     ✓ climbs the ladder: FINAL -> FINAL 0ms
     ✓ fails a --require'd strategy outside the ladder 0ms
     ✓ fails a --require'd verdict when the last DONE row carries none 5ms
     ✓ reads strategy per group, from the step's last DONE row, within its own workflow 0ms
     ✓ a non-numeric debugAttempt reads as 0 0ms
   ❯ bkit status route holistic cleanBase (6)
     ✓ last clean holistic base is the newest zero-failure row 68ms
     ✓ a holistic row with gaps does not move the base 66ms
     ✓ holistic base falls back to origin/dev with no clean row 63ms
     × cleanBase with no clean round returns the feature base, not origin/dev 87ms
     ✓ a clean holistic row from an earlier run does not set the base 65ms
     ✓ holistic base falls back to origin/dev when the clean sha is no longer an ancestor of HEAD 72ms
   ✓ bkit status route --prompt-file (debug Step 1) (12)
     ✓ a fresh run: attempt 1, NORMAL, no repro, every gate 5ms
     ✓ a resumed run keeps its attempt number 5ms
     ✓ fix rounds used up across runs (debug.fix.maxAttempts) enter SOAK 5ms
     ✓ the fix limit comes from bkit.workflows.debug.fix.maxAttempts 9ms
     ✓ [soak] and [repro] in the prompt 5ms
     ✓ a resumed run that soaked continues in SOAK 4ms
     ✓ soak rows of a finished run do not force SOAK on the next run 4ms
     ✓ an escalation recorded only in workflow-meta survives a resume 5ms
     ✓ [live=off] in the prompt drops the live gate; the issue body is not read 9ms
     ✓ finds status.jsonl from --fid and --month 24ms
     ✓ refuses --prompt-file for another workflow, and a missing --file without --fid 1ms
     ✓ a missing prompt file is a usage error 0ms
   ✓ bkit status route --workflow=build publish (7)
     ✓ lets the publish token override publish.local 9ms
     ✓ reads publish.local on LOCAL without a token 4ms
     ✓ coerces publish false to true on a non-LOCAL runtime 4ms
     ✓ accepts --prompt-file with --workflow=build 4ms
     ✓ ignores publish=maybe and falls through to config 4ms
     ✓ refuses publish without a runtime-resolved row 4ms
     ✓ prints publishSource for token, local, remote and coerced 17ms
   ✓ bkit status route --expect (4)
     ✓ passes when every field holds the expected value 0ms
     ✓ exits 4 naming a field that holds another value 0ms
     ✓ an expected field is also required: missing exits 4 0ms
     ✓ checks a step field with --step, and refuses an unknown field 5ms
   ✓ bkit status meta (9)
     ✓ appends a workflow-meta row the route read then sees 0ms
     ✓ records openedPr, and refuses the removed --soak-entry and --decision 0ms
     ✓ --debug-attempt=run records the active run's number 0ms
     ✓ meta refuses --plan-source 0ms
     ✓ rejects ["--debug-mode=TURBO"] 0ms
     ✓ rejects ["--push-mode=REMOTE"] 0ms
     ✓ rejects ["--debug-attempt=0"] 0ms
     ✓ rejects [] 0ms
     ✓ never starts a log 0ms
   ✓ bkit status row (6)
     ✓ appends a typed row with fields parsed as JSON where they are JSON 0ms
     ✓ refuses ["--type=step-done"] 2ms
     ✓ refuses ["--type=Ship_Gate"] 0ms
     ✓ refuses ["--type=x","--field=at=now"] 0ms
     ✓ refuses ["--type=x","--field=Bad=1"] 0ms
     ✓ never starts a log (exit 3) 0ms
   ✓ bkit status row owner-pause friction (6)
     ✓ status row owner-pause appends one human-confirm friction row 39ms
     ✓ status row owner-pause skips the friction row when no step-done follows the last owner-pause with the same reason 24ms
     ✓ status row owner-pause with a new reason appends its own row with no step-done in between 45ms
     ✓ status row owner-pause in a later pause appends a same-key recurrence 35ms
     ✓ status row writes no friction row for other types or with BKIT_ENGINE_JOURNAL=off 10ms
     ✓ status row owner-pause keeps the status row and exits 4 when the friction row cannot be written 18ms
   ✓ bkit status invocation (7)
     ✓ issues invocation metadata from an explicit run and registered step 47ms
     ✓ refuses to issue an invocation into a status file outside the issuing checkout 35ms
     ✓ refuses to issue an invocation through a status file symlinked out of the checkout 23ms
     ✓ writes no absolute checkout path into the run's committed invocation event 42ms
     ✓ records the issued invocation in the run status log and rebuilds a deleted receipt 57ms
     ✓ binds group and attempt and registers setup, remediation and ship steps 74ms
     ✓ registers the no-plan conversion step 22ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/status.test.ts > bkit status route holistic cleanBase > cleanBase with no clean round returns the feature base, not origin/dev
AssertionError: expected 'origin/dev' to be '03a2b20325f563af066393e680988a9bd33e1…' // Object.is equality

Expected: "03a2b20325f563af066393e680988a9bd33e1aa6"
Received: "origin/dev"

 ❯ .bkit/core/engine/commands/workflow/status.test.ts:710:18
    708|     git(root, "commit", "-q", "--allow-empty", "-m", "feat work");
    709|     const base = await cleanBase([started("build", "2026-10-01T00:00:0…
    710|     expect(base).toBe(c2);
       |                  ^
    711|     expect(base).not.toBe("origin/dev");
    712|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 87 passed (88)
   Start at  06:00:19
   Duration  1.30s (tests 90%, import 5%, transform 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0pg16s/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
