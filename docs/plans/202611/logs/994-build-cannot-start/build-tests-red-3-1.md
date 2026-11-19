Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/994-build-cannot-start-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/workflow/branches.test.ts` "does not silently drop a later branch edit to the plan file when dev changed an adjacent line" | red | failure: expected [ false, false, false ] to include true |

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

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (297 tests | 1 failed) 194219ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 316ms
     ✓ rejects missing explicit and ambiguous existing branch selections 281ms
   ✓ branches rebase: classification (32)
     ✓ ledger list does not drift from .gitattributes merge=union 2ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 1ms
     ✓ refuses src.txt 0ms
     ✓ refuses package.json 0ms
     ✓ refuses .bkit/config.json 0ms
     ✓ refuses docs/testing.md 0ms
     ✓ refuses docs/plans/202608/234-plan.md 0ms
     ✓ refuses apps/web/data.jsonl 1ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ classifies only the feature's own plan files as the plan-log shape 1ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies every generated register as the register shape, and only at its exact path 1ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 1ms
     ✓ classifies the install record, and only at its exact path 1ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 84ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 483ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 496ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 358ms
     ✓ a refused --continue carries git's own reason 416ms
     ✓ --file records nothing for a refused rebase 330ms
     ✓ refuses a code conflict and aborts the rebase on the spot 388ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 730ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 349ms
     ✓ produces byte-identical output to merge=union 828ms
     ✓ restores a trailing newline so the next append starts on its own line 482ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 418ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 626ms
     ✓ refuses a union that leaves a line which is not JSON 397ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 471ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 942ms
     ✓ refuses a lockfile whose regenerate command fails 520ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 681ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 632ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 685ms
     ✓ refuses and aborts when both sides changed the hand-written region 508ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 516ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 550ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 735ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 431ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 479ms
     ✓ refuses and aborts when a side deleted the install record 391ms
     ✓ refuses a conflicted doc the repo's script does not list 378ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 389ms
     ✓ removes a stale sentinel when the rebase succeeds 601ms
     ✓ exits 4 when no rebase is in progress 141ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 725ms
     ✓ resolves a conflict in each of two replayed commits across rounds 616ms
   ❯ branches rebase: plan-closed branch with a leftover push (8)
     ✓ takes the rebase target's copy of a plan log both sides added, and completes the rebase 467ms
     ✓ takes the target's copy in each round when the branch changed the plan log in a later commit 618ms
     ✓ completes the rebase when the branch ends on the same plan-log bytes as the target, emptying its commit 614ms
     ✓ settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass 788ms
     ✓ refuses another feature's plan log and names the rule in the reason 607ms
     ✓ refuses a code conflict beside the plan logs, leaving the plan log unresolved 526ms
     ✓ gives a branch not named feat/{fid} no plan-log rule 568ms
     × does not silently drop a later branch edit to the plan file when dev changed an adjacent line 764ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 32ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 93ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 68ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 33ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 33ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 64ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 72ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 64ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 73ms
     ✓ fails closed on an empty --base-sha and writes nothing 2ms
     ✓ fails closed on a missing file 1ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 66ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 1ms
     ✓ stampAnchor: empty file 1ms
     ✓ stampAnchor: no trailing newline (kept as-is) 1ms
     ✓ stampAnchor: two blocks (both removed) 1ms
     ✓ stampAnchor: close on the line after open (body line kept) 1ms
     ✓ stampAnchor: inline lookalike marker is not a block 1ms
     ✓ stampAnchor: empty field block 1ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 77ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
     ✓ matches only inside the block, and the first occurrence wins 1ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 394ms
       ✓ skips (12) with no anchor 422ms
       ✓ skips (12) when the base is unreachable in this clone 466ms
       ✓ skips (12) when nothing landed since the base 481ms
       ✓ runs (0) with the landed path count once dev moved 842ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 459ms
     ✓ readAnchor: two blocks: the first block's value wins 1ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 1ms
     ✓ readAnchor: an empty field reads as the empty string 1ms
     ✓ readAnchor: an empty file has no fields 1ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 964ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 602ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 823ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1165ms
     ✓ runs exactly one git push 977ms
     ✓ --set-upstream records the upstream 483ms
     ✓ refuses with no branch checked out 442ms
     ✓ --mode=dev refuses a feature checkout 362ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 936ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1440ms
     ✓ --require-ci pushes as-is when dev has not moved 595ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1088ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1941ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 461ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 750ms
     ✓ --mode=abort pushes when the branch has no open PR 593ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 586ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 350ms
     ✓ --open-pr carries the MCP answer and skips gh 517ms
     ✓ --mode=abort on dev pushes plainly without probing 528ms
     ✓ rejects an unknown mode 371ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1478ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 774ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 923ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2373ms
     ✓ skip-ci HEAD on the replay is refused 645ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1497ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1920ms
     ✓ a level local dev is a plain push, recording nothing extra 715ms
     ✓ a record with no commits pushes nothing 544ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 360ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 878ms
     ✓ a rewritten branch is refused, never forced 524ms
     ✓ refuses dev and main with exit 21 and pushes nothing 338ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 870ms
     ✓ refuses a detached HEAD (exit 5) 338ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 747ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 752ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 762ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 854ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 241ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 577ms
     ✓ an up-to-date branch is a no-op 387ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 702ms
     ✓ a fetch that fails exits 10 316ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 386ms
     ✓ scan-diff still reports a new skip when its test … 453ms
     ✓ scan-diff reports a skip moved onto a different t… 547ms
     ✓ scan-diff does not cancel a skip moved between am… 575ms
     ✓ scan-diff does not spend an unchanged duplicate t… 604ms
     ✓ scan-diff recognizes a renamed test file 585ms
     ✓ scan-diff recognizes a suite moved into a differe… 553ms
     ✓ scan-diff does not let unrelated additions hide a… 549ms
     ✓ scan-diff attributes deletion to its old test ins… 451ms
     ✓ scan-diff consumes each moved assertion once and … 455ms
     ✓ scan-diff does not match identical assertions fro… 441ms
     ✓ scan-diff does not match the same leaf test name … 432ms
     ✓ scan-diff does not match a same-named test with d… 408ms
     ✓ scan-diff does not match a same-named test with c… 398ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 426ms
     ✓ --paths with no match exits 1 390ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 287ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 540ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 559ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 388ms
     ✓ --marker reads a diff over 1 MiB 431ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 474ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 372ms
     ✓ scan-diff finds an added skip 438ms
     ✓ scan-diff ignores a skip predating the base 381ms
     ✓ scan-diff reports a disabled test with its line 445ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 426ms
     ✓ scan-diff ignores a removed comment in a test file 367ms
     ✓ scan-diff ignores an assertion moved within the file 413ms
     ✓ scan-diff still reports a removed assertion 421ms
     ✓ scan-diff reports an assertion re-added only outside the test file 406ms
     ✓ scan-diff finds an added pytest mark skip 477ms
     ✓ scan-diff finds an added unittest skip 384ms
     ✓ scan-diff finds an added bare skip call 399ms
     ✓ scan-diff ignores a quoted skip in a documentation file 448ms
     ✓ scan-diff ignores a marker literal in a non-test source file 477ms
     ✓ scan-diff ignores an assertion whose expectation changed 444ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 391ms
     ✓ scan-diff reports a deleted test file 426ms
     ✓ scan-diff never opens a symlinked test file's outside target 2ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 291ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 968ms
     ✓ a title that already carries the marker is left alone 840ms
     ✓ with no open PR: pushes the marker commit and edits no title 772ms
     ✓ a re-run is deduped: no second marker commit 887ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 993ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 322ms
     ✓ --title-set skips gh entirely 526ms
     ✓ refuses dev and main (exit 21) 213ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1181ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1859ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 897ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 2229ms
     ✓ continues only the explicitly recorded target through the public merge command 1476ms
     ✓ fetches the unseen feature head before classifying the base 941ms
     ✓ fast forwards the feature before either base path is chosen 1935ms
     ✓ merges divergent feature tips without rebasing either side 1442ms
     ✓ continues the feature merge before starting a dev merge 2242ms
     ✓ publishes local code with a CI running head before bookkeeping 2264ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 3090ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 2183ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1520ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 424ms
     ✓ Path B once dev moved; --head checks a given commit 613ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 630ms
     ✓ --merge-docs merges dev when docs/ is behind 750ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 735ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1035ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1025ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 836ms
     ✓ --merge-docs skips an empty bkit:generate script 785ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 680ms
     ✓ --merge-docs never merges on dev itself 601ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 863ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 869ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 802ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 820ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 488ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1037ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1071ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1343ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1008ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1096ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1270ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1003ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1174ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 834ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 558ms
     ✓ exits 10 when the fetch fails 424ms
     ✓ refuses --merge-docs with --head, and an unknown --head 459ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 819ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1055ms
     ✓ a failed install stops ship (16) 816ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 734ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 714ms
     ✓ exits 10 when the fetch fails 548ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 388ms
     ✓ preserves unlanded file type changes in the shared landed comparison 405ms
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 834ms
     ✓ names only the file whose branch version never reached dev 860ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 834ms
     ✓ names a path under a directory named : when dev deleted, re-added and later edited the top-level file 988ms
     ✓ a path under a directory named : that dev never touched is not reported landed 412ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 269ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 449ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1732ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1710ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1841ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1640ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 3474ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 4091ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 654ms
     ✓ local: names unpushed dev as the cause when the branch carries it 804ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 785ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2002ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2111ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1435ms
     ✓ uses tree entry equivalence for design and plan land cleanup 5753ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 1036ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1587ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1707ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1005ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 2111ms
     ✓ land removes the worktree when only the copied .env is untracked 1556ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1292ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1491ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 2389ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1596ms
     ✓ landPr refuses a main-based PR without retrying 942ms
     ✓ landPr refuses when the PR base is unknown 665ms
     ✓ PR not open (closed): stops (17) at once, no retry 1036ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 577ms
     ✓ --attempt names the merge round in a fix commit 592ms
     ✓ commits a rewritten and a deleted tracked file 615ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 523ms
     ✓ reports undeclared and runs nothing with no scripts 326ms
     ✓ reports undeclared and runs nothing with an empty script 317ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 375ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 541ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 373ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 508ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 461ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 549ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 550ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > does not silently drop a later branch edit to the plan file when dev changed an adjacent line
AssertionError: expected [ false, false, false ] to include true
 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1195:50
    1193|       const copyKept = keptPaths.some((t) => fs.readFileSync(t, "utf-8…
    1194|       // Refused (code 3), or the tick survives in the plan file or in…
    1195|       expect([r.code === 3, planKept, copyKept]).toContain(true);
       |                                                  ^
    1196|     });
    1197|   },

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 296 passed (297)
   Start at  22:20:05
   Duration  194.55s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-GT3JYf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
