Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1058-cleanup-check-reads-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "names a path under a directory named : when dev deleted, re-added and later edited the top-level file" | red | failure: expected [] to deeply equal [ ':/src.txt' ] |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "a path under a directory named : that dev never touched is not reported landed" | red | failure: expected [] to deeply equal [ ':/src.txt' ] |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1058-cleanup-check-reads
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1058-cleanup-check-reads
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1058-cleanup-check-reads

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (288 tests | 2 failed) 464760ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 1512ms
     ✓ rejects missing explicit and ambiguous existing branch selections 1015ms
   ✓ branches rebase: classification (31)
     ✓ ledger list does not drift from .gitattributes merge=union 10ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 4ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 2ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 3ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 6ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 2ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 7ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 2ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 3ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 2ms
     ✓ refuses src.txt 3ms
     ✓ refuses package.json 3ms
     ✓ refuses .bkit/config.json 4ms
     ✓ refuses docs/testing.md 1ms
     ✓ refuses docs/plans/202608/234-plan.md 1ms
     ✓ refuses apps/web/data.jsonl 4ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 4ms
     ✓ refuses packages/a/Cargo.lock 4ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 3ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 2ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 3ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 5ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 5ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 3ms
     ✓ classifies every generated register as the register shape, and only at its exact path 5ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 4ms
     ✓ classifies the install record, and only at its exact path 3ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 345ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 1148ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 1023ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 692ms
     ✓ a refused --continue carries git's own reason 1038ms
     ✓ --file records nothing for a refused rebase 1007ms
     ✓ refuses a code conflict and aborts the rebase on the spot 915ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 1549ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 835ms
     ✓ produces byte-identical output to merge=union 2381ms
     ✓ restores a trailing newline so the next append starts on its own line 1809ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 1411ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 1513ms
     ✓ refuses a union that leaves a line which is not JSON 759ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 1090ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1511ms
     ✓ refuses a lockfile whose regenerate command fails 1127ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1771ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 1502ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 1678ms
     ✓ refuses and aborts when both sides changed the hand-written region 975ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 1071ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 1202ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1514ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 809ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 943ms
     ✓ refuses and aborts when a side deleted the install record 780ms
     ✓ refuses a conflicted doc the repo's script does not list 701ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 658ms
     ✓ removes a stale sentinel when the rebase succeeds 1076ms
     ✓ exits 4 when no rebase is in progress 246ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 1205ms
     ✓ resolves a conflict in each of two replayed commits across rounds 1097ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 44ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 136ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 93ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 53ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 49ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 85ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 96ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 93ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 128ms
     ✓ fails closed on an empty --base-sha and writes nothing 3ms
     ✓ fails closed on a missing file 2ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 85ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 2ms
     ✓ stampAnchor: empty file 1ms
     ✓ stampAnchor: no trailing newline (kept as-is) 1ms
     ✓ stampAnchor: two blocks (both removed) 1ms
     ✓ stampAnchor: close on the line after open (body line kept) 1ms
     ✓ stampAnchor: inline lookalike marker is not a block 1ms
     ✓ stampAnchor: empty field block 2ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 94ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 3ms
     ✓ matches only inside the block, and the first occurrence wins 1ms
     ✓ exits 13 on a missing file and 2 on an unknown field 3ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 619ms
       ✓ skips (12) with no anchor 588ms
       ✓ skips (12) when the base is unreachable in this clone 674ms
       ✓ skips (12) when nothing landed since the base 686ms
       ✓ runs (0) with the landed path count once dev moved 1356ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 710ms
     ✓ readAnchor: two blocks: the first block's value wins 2ms
     ✓ readAnchor: an unterminated block runs to the end of the file 1ms
     ✓ readAnchor: a field after the close line is outside the block 1ms
     ✓ readAnchor: an empty field reads as the empty string 2ms
     ✓ readAnchor: an empty file has no fields 1ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1324ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 1092ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 1457ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1880ms
     ✓ runs exactly one git push 1845ms
     ✓ --set-upstream records the upstream 956ms
     ✓ refuses with no branch checked out 733ms
     ✓ --mode=dev refuses a feature checkout 719ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1821ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2892ms
     ✓ --require-ci pushes as-is when dev has not moved 1255ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 2194ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 3040ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 931ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1403ms
     ✓ --mode=abort pushes when the branch has no open PR 1265ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 1017ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 684ms
     ✓ --open-pr carries the MCP answer and skips gh 949ms
     ✓ --mode=abort on dev pushes plainly without probing 892ms
     ✓ rejects an unknown mode 618ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 4149ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1671ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 1889ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 5098ms
     ✓ skip-ci HEAD on the replay is refused 1386ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3282ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 4701ms
     ✓ a level local dev is a plain push, recording nothing extra 1872ms
     ✓ a record with no commits pushes nothing 1639ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 974ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1889ms
     ✓ a rewritten branch is refused, never forced 1369ms
     ✓ refuses dev and main with exit 21 and pushes nothing 891ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 2252ms
     ✓ refuses a detached HEAD (exit 5) 881ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1872ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 1424ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 1408ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 1944ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 916ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2331ms
     ✓ an up-to-date branch is a no-op 1104ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2082ms
     ✓ a fetch that fails exits 10 772ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 1180ms
     ✓ scan-diff still reports a new skip when its test … 1047ms
     ✓ scan-diff reports a skip moved onto a different t… 941ms
     ✓ scan-diff does not cancel a skip moved between am… 995ms
     ✓ scan-diff does not spend an unchanged duplicate t… 966ms
     ✓ scan-diff recognizes a renamed test file 943ms
     ✓ scan-diff recognizes a suite moved into a differe… 944ms
     ✓ scan-diff does not let unrelated additions hide a… 1107ms
     ✓ scan-diff attributes deletion to its old test ins… 1063ms
     ✓ scan-diff consumes each moved assertion once and … 979ms
     ✓ scan-diff does not match identical assertions fro… 1064ms
     ✓ scan-diff does not match the same leaf test name … 1106ms
     ✓ scan-diff does not match a same-named test with d… 1198ms
     ✓ scan-diff does not match a same-named test with c… 1556ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 1346ms
     ✓ --paths with no match exits 1 1041ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 703ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1284ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 1343ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 866ms
     ✓ --marker reads a diff over 1 MiB 1012ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1270ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 1611ms
     ✓ scan-diff finds an added skip 1085ms
     ✓ scan-diff ignores a skip predating the base 896ms
     ✓ scan-diff reports a disabled test with its line 949ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 913ms
     ✓ scan-diff ignores a removed comment in a test file 960ms
     ✓ scan-diff ignores an assertion moved within the file 1194ms
     ✓ scan-diff still reports a removed assertion 1272ms
     ✓ scan-diff reports an assertion re-added only outside the test file 1401ms
     ✓ scan-diff finds an added pytest mark skip 1449ms
     ✓ scan-diff finds an added unittest skip 1287ms
     ✓ scan-diff finds an added bare skip call 1456ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1526ms
     ✓ scan-diff ignores a marker literal in a non-test source file 1260ms
     ✓ scan-diff ignores an assertion whose expectation changed 1313ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 1035ms
     ✓ scan-diff reports a deleted test file 983ms
     ✓ scan-diff never opens a symlinked test file's outside target 6ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 718ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 2347ms
     ✓ a title that already carries the marker is left alone 1558ms
     ✓ with no open PR: pushes the marker commit and edits no title 1810ms
     ✓ a re-run is deduped: no second marker commit 2390ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 2285ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 801ms
     ✓ --title-set skips gh entirely 1363ms
     ✓ refuses dev and main (exit 21) 564ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 2568ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 4807ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 2447ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 5644ms
     ✓ continues only the explicitly recorded target through the public merge command 3719ms
     ✓ fetches the unseen feature head before classifying the base 3367ms
     ✓ fast forwards the feature before either base path is chosen 8148ms
     ✓ merges divergent feature tips without rebasing either side 3745ms
     ✓ continues the feature merge before starting a dev merge 4891ms
     ✓ publishes local code with a CI running head before bookkeeping 6518ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 11887ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 6078ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 3341ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 974ms
     ✓ Path B once dev moved; --head checks a given commit 1755ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 1426ms
     ✓ --merge-docs merges dev when docs/ is behind 1741ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1654ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 2108ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 2153ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1768ms
     ✓ --merge-docs skips an empty bkit:generate script 2169ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1715ms
     ✓ --merge-docs never merges on dev itself 1341ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 2157ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1803ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1488ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1658ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 976ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 2668ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 5002ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 5470ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 2088ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2254ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2587ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1876ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 2316ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1842ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 998ms
     ✓ exits 10 when the fetch fails 636ms
     ✓ refuses --merge-docs with --head, and an unknown --head 658ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 1160ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1591ms
     ✓ a failed install stops ship (16) 1670ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1267ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1173ms
     ✓ exits 10 when the fetch fails 883ms
   ❯ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 670ms
     ✓ preserves unlanded file type changes in the shared landed comparison 638ms
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 1539ms
     ✓ names only the file whose branch version never reached dev 1420ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 1484ms
     × names a path under a directory named : when dev deleted, re-added and later edited the top-level file 1561ms
     × a path under a directory named : that dev never touched is not reported landed 595ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 465ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 735ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2615ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2620ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2613ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2889ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 8712ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 9938ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1990ms
     ✓ local: names unpushed dev as the cause when the branch carries it 2293ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 2117ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 5466ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 4982ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 3409ms
     ✓ uses tree entry equivalence for design and plan land cleanup 15457ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 3862ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 4727ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 3866ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 2081ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 7403ms
     ✓ land removes the worktree when only the copied .env is untracked 5745ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 5493ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 6992ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 7684ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 5262ms
     ✓ landPr refuses a main-based PR without retrying 1375ms
     ✓ landPr refuses when the PR base is unknown 1433ms
     ✓ PR not open (closed): stops (17) at once, no retry 1949ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 2080ms
     ✓ --attempt names the merge round in a fix commit 1890ms
     ✓ commits a rewritten and a deleted tracked file 1972ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 1728ms
     ✓ reports undeclared and runs nothing with no scripts 1307ms
     ✓ reports undeclared and runs nothing with an empty script 1349ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1381ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1890ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 1190ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 1738ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 1716ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 1785ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 1680ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > shared landed comparison > names a path under a directory named : when dev deleted, re-added and later edited the top-level file
AssertionError: expected [] to deeply equal [ ':/src.txt' ]

- Expected
+ Received

- [
-   ":/src.txt",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3683:52
    3681|     expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
    3682|     const comparison = await import("./worktrees");
    3683|     expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([":/src.txt…
       |                                                    ^
    3684|   });
    3685|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > shared landed comparison > a path under a directory named : that dev never touched is not reported landed
AssertionError: expected [] to deeply equal [ ':/src.txt' ]

- Expected
+ Received

- [
-   ":/src.txt",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3692:52
    3690|     expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
    3691|     const comparison = await import("./worktrees");
    3692|     expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([":/src.txt…
       |                                                    ^
    3693|   });
    3694| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 286 passed (288)
   Start at  13:14:14
   Duration  465.91s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-XQBonm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
