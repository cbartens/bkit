Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/994-build-cannot-start-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/branches.test.ts` "names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one" | red | failure: expected true to be false // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (299 tests | 1 failed) 201125ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 337ms
     ✓ rejects missing explicit and ambiguous existing branch selections 285ms
   ✓ branches rebase: classification (32)
     ✓ ledger list does not drift from .gitattributes merge=union 2ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 1ms
     ✓ refuses src.txt 1ms
     ✓ refuses package.json 0ms
     ✓ refuses .bkit/config.json 0ms
     ✓ refuses docs/testing.md 1ms
     ✓ refuses docs/plans/202608/234-plan.md 1ms
     ✓ refuses apps/web/data.jsonl 1ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ classifies only the feature's own plan files as the plan-log shape 1ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies every generated register as the register shape, and only at its exact path 1ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 0ms
     ✓ classifies the install record, and only at its exact path 1ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 160ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 655ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 496ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 305ms
     ✓ a refused --continue carries git's own reason 386ms
     ✓ --file records nothing for a refused rebase 328ms
     ✓ refuses a code conflict and aborts the rebase on the spot 308ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 742ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 497ms
     ✓ produces byte-identical output to merge=union 716ms
     ✓ restores a trailing newline so the next append starts on its own line 430ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 393ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 596ms
     ✓ refuses a union that leaves a line which is not JSON 344ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 463ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 957ms
     ✓ refuses a lockfile whose regenerate command fails 721ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 753ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 643ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 645ms
     ✓ refuses and aborts when both sides changed the hand-written region 754ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 501ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 590ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 692ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 416ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 546ms
     ✓ refuses and aborts when a side deleted the install record 664ms
     ✓ refuses a conflicted doc the repo's script does not list 376ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 321ms
     ✓ removes a stale sentinel when the rebase succeeds 410ms
     ✓ exits 4 when no rebase is in progress 106ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 538ms
     ✓ resolves a conflict in each of two replayed commits across rounds 443ms
   ❯ branches rebase: plan-closed branch with a leftover push (10)
     ✓ takes the rebase target's copy of a plan log both sides added, and completes the rebase 371ms
     ✓ takes the target's copy in each round when the branch changed the plan log in a later commit 797ms
     ✓ completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit 604ms
     ✓ settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass 594ms
     ✓ refuses another feature's plan log and names the rule in the reason 346ms
     ✓ refuses a code conflict beside the plan logs, leaving the plan log unresolved 314ms
     ✓ keeps a differing branch copy larger than 1 MiB aside and names it 428ms
     × names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one 448ms
     ✓ gives a branch not named feat/{fid} no plan-log rule 289ms
     ✓ does not silently drop a later branch edit to the plan file when dev changed an adjacent line 674ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 22ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 65ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 39ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 26ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 18ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 37ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 40ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 42ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 37ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 1ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 39ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 1ms
     ✓ stampAnchor: empty file 0ms
     ✓ stampAnchor: no trailing newline (kept as-is) 0ms
     ✓ stampAnchor: two blocks (both removed) 0ms
     ✓ stampAnchor: close on the line after open (body line kept) 1ms
     ✓ stampAnchor: inline lookalike marker is not a block 0ms
     ✓ stampAnchor: empty field block 1ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 38ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 250ms
       ✓ skips (12) with no anchor 266ms
       ✓ skips (12) when the base is unreachable in this clone 290ms
       ✓ skips (12) when nothing landed since the base 288ms
       ✓ runs (0) with the landed path count once dev moved 517ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 291ms
     ✓ readAnchor: two blocks: the first block's value wins 1ms
     ✓ readAnchor: an unterminated block runs to the end of the file 1ms
     ✓ readAnchor: a field after the close line is outside the block 1ms
     ✓ readAnchor: an empty field reads as the empty string 1ms
     ✓ readAnchor: an empty file has no fields 1ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 567ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 621ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 554ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1028ms
     ✓ runs exactly one git push 713ms
     ✓ --set-upstream records the upstream 346ms
     ✓ refuses with no branch checked out 306ms
     ✓ --mode=dev refuses a feature checkout 518ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 781ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1275ms
     ✓ --require-ci pushes as-is when dev has not moved 481ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1106ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1425ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 386ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 705ms
     ✓ --mode=abort pushes when the branch has no open PR 693ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 469ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 296ms
     ✓ --open-pr carries the MCP answer and skips gh 412ms
     ✓ --mode=abort on dev pushes plainly without probing 434ms
     ✓ rejects an unknown mode 325ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1726ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 706ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 785ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2277ms
     ✓ skip-ci HEAD on the replay is refused 511ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1324ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2155ms
     ✓ a level local dev is a plain push, recording nothing extra 788ms
     ✓ a record with no commits pushes nothing 534ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 371ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1063ms
     ✓ a rewritten branch is refused, never forced 560ms
     ✓ refuses dev and main with exit 21 and pushes nothing 354ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 869ms
     ✓ refuses a detached HEAD (exit 5) 340ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 730ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 929ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 731ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 887ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 362ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 849ms
     ✓ an up-to-date branch is a no-op 748ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 886ms
     ✓ a fetch that fails exits 10 367ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 546ms
     ✓ scan-diff still reports a new skip when its test … 586ms
     ✓ scan-diff reports a skip moved onto a different t… 471ms
     ✓ scan-diff does not cancel a skip moved between am… 444ms
     ✓ scan-diff does not spend an unchanged duplicate t… 636ms
     ✓ scan-diff recognizes a renamed test file 477ms
     ✓ scan-diff recognizes a suite moved into a differe… 475ms
     ✓ scan-diff does not let unrelated additions hide a… 470ms
     ✓ scan-diff attributes deletion to its old test ins… 461ms
     ✓ scan-diff consumes each moved assertion once and … 483ms
     ✓ scan-diff does not match identical assertions fro… 474ms
     ✓ scan-diff does not match the same leaf test name … 770ms
     ✓ scan-diff does not match a same-named test with d… 528ms
     ✓ scan-diff does not match a same-named test with c… 481ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 475ms
     ✓ --paths with no match exits 1 420ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 325ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 602ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 941ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 435ms
     ✓ --marker reads a diff over 1 MiB 501ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 571ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 514ms
     ✓ scan-diff finds an added skip 542ms
     ✓ scan-diff ignores a skip predating the base 664ms
     ✓ scan-diff reports a disabled test with its line 546ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 527ms
     ✓ scan-diff ignores a removed comment in a test file 488ms
     ✓ scan-diff ignores an assertion moved within the file 455ms
     ✓ scan-diff still reports a removed assertion 452ms
     ✓ scan-diff reports an assertion re-added only outside the test file 470ms
     ✓ scan-diff finds an added pytest mark skip 734ms
     ✓ scan-diff finds an added unittest skip 494ms
     ✓ scan-diff finds an added bare skip call 481ms
     ✓ scan-diff ignores a quoted skip in a documentation file 399ms
     ✓ scan-diff ignores a marker literal in a non-test source file 392ms
     ✓ scan-diff ignores an assertion whose expectation changed 410ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 398ms
     ✓ scan-diff reports a deleted test file 443ms
     ✓ scan-diff never opens a symlinked test file's outside target 2ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 323ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1362ms
     ✓ a title that already carries the marker is left alone 677ms
     ✓ with no open PR: pushes the marker commit and edits no title 730ms
     ✓ a re-run is deduped: no second marker commit 1048ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 854ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 280ms
     ✓ --title-set skips gh entirely 452ms
     ✓ refuses dev and main (exit 21) 213ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1120ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1715ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 852ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2309ms
     ✓ continues only the explicitly recorded target through the public merge command 1503ms
     ✓ fetches the unseen feature head before classifying the base 898ms
     ✓ fast forwards the feature before either base path is chosen 2401ms
     ✓ merges divergent feature tips without rebasing either side 1158ms
     ✓ continues the feature merge before starting a dev merge 1984ms
     ✓ publishes local code with a CI running head before bookkeeping 1939ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2973ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2068ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1202ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 327ms
     ✓ Path B once dev moved; --head checks a given commit 723ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 612ms
     ✓ --merge-docs merges dev when docs/ is behind 763ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 651ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 898ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 888ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 994ms
     ✓ --merge-docs skips an empty bkit:generate script 1021ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 827ms
     ✓ --merge-docs never merges on dev itself 657ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 914ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 855ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 828ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 936ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 488ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1132ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1064ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1236ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 953ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 955ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1280ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 831ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1025ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 680ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 472ms
     ✓ exits 10 when the fetch fails 332ms
     ✓ refuses --merge-docs with --head, and an unknown --head 343ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 598ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 825ms
     ✓ a failed install stops ship (16) 763ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 649ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 588ms
     ✓ exits 10 when the fetch fails 446ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 361ms
     ✓ preserves unlanded file type changes in the shared landed comparison 363ms
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 695ms
     ✓ names only the file whose branch version never reached dev 725ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 748ms
     ✓ names a path under a directory named : when dev deleted, re-added and later edited the top-level file 925ms
     ✓ a path under a directory named : that dev never touched is not reported landed 365ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 237ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 387ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1627ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1727ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1706ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1894ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3939ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4120ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 890ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1107ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 895ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2093ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2208ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1431ms
     ✓ uses tree entry equivalence for design and plan land cleanup 6677ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1811ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1893ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1772ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 934ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3077ms
     ✓ land removes the worktree when only the copied .env is untracked 2527ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1915ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1913ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2831ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2140ms
     ✓ landPr refuses a main-based PR without retrying 748ms
     ✓ landPr refuses when the PR base is unknown 672ms
     ✓ PR not open (closed): stops (17) at once, no retry 1037ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 990ms
     ✓ --attempt names the merge round in a fix commit 899ms
     ✓ commits a rewritten and a deleted tracked file 836ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 666ms
     ✓ reports undeclared and runs nothing with no scripts 543ms
     ✓ reports undeclared and runs nothing with an empty script 499ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 654ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 790ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 530ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 716ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 744ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 731ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 522ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1181:43
    1179|       const named = /the branch's differing copy is kept at (\S+)/.exe…
    1180|       expect(named).not.toBeNull();
    1181|       expect(path.isAbsolute(named![1]!)).toBe(false);
       |                                           ^
    1182|       expect(named![1]!).toMatch(
    1183|         new RegExp(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 298 passed (299)
   Start at  23:49:41
   Duration  201.76s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-PEoYl1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
