Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1055-worktree-removal-says-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "a later dev commit on the same file does not turn a landed branch back into unlanded" | red | failure: expected [ 'src.txt' ] to deeply equal [] |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "names only the file whose branch version never reached dev" | red | failure: expected [ 'a.txt', 'src.txt' ] to deeply equal [ 'src.txt' ] |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "a deleted file that dev deleted and a later commit re-added counts as landed" | red | failure: expected [ 'src.txt' ] to deeply equal [] |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "removes the worktree and local branch when a later dev commit changed the branch's file" | red | failure: expected { removed: false, …(6) } to match object { removed: true, …(2) } (4 matching properties omitted from actual) |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "deletes the remote branch when a later dev commit changed the branch's file" | red | failure: expected { removed: false, …(6) } to match object { removed: true, remoteDeleted: true } (5 matching properties omitted from actual) |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (286 tests | 3 failed) 128797ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 310ms
     ✓ rejects missing explicit and ambiguous existing branch selections 263ms
   ✓ branches rebase: classification (31)
     ✓ ledger list does not drift from .gitattributes merge=union 2ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 0ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 1ms
     ✓ refuses src.txt 0ms
     ✓ refuses package.json 1ms
     ✓ refuses .bkit/config.json 1ms
     ✓ refuses docs/testing.md 1ms
     ✓ refuses docs/plans/202608/234-plan.md 1ms
     ✓ refuses apps/web/data.jsonl 1ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 0ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies every generated register as the register shape, and only at its exact path 1ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 0ms
     ✓ classifies the install record, and only at its exact path 0ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 81ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 434ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 517ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 347ms
     ✓ a refused --continue carries git's own reason 466ms
     ✓ --file records nothing for a refused rebase 357ms
     ✓ refuses a code conflict and aborts the rebase on the spot 386ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 630ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 329ms
     ✓ produces byte-identical output to merge=union 741ms
     ✓ restores a trailing newline so the next append starts on its own line 471ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 467ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 630ms
     ✓ refuses a union that leaves a line which is not JSON 377ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 512ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 644ms
     ✓ refuses a lockfile whose regenerate command fails 603ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 703ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 653ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 595ms
     ✓ refuses and aborts when both sides changed the hand-written region 372ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 448ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 631ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 794ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 418ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 536ms
     ✓ refuses and aborts when a side deleted the install record 465ms
     ✓ refuses a conflicted doc the repo's script does not list 388ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 403ms
     ✓ removes a stale sentinel when the rebase succeeds 542ms
     ✓ exits 4 when no rebase is in progress 152ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 746ms
     ✓ resolves a conflict in each of two replayed commits across rounds 667ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 27ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 84ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 49ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 29ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 27ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 55ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 56ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 54ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 51ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 1ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 54ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 1ms
     ✓ stampAnchor: empty file 1ms
     ✓ stampAnchor: no trailing newline (kept as-is) 1ms
     ✓ stampAnchor: two blocks (both removed) 1ms
     ✓ stampAnchor: close on the line after open (body line kept) 1ms
     ✓ stampAnchor: inline lookalike marker is not a block 1ms
     ✓ stampAnchor: empty field block 1ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 56ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
     ✓ matches only inside the block, and the first occurrence wins 1ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 363ms
       ✓ skips (12) with no anchor 354ms
       ✓ skips (12) when the base is unreachable in this clone 419ms
       ✓ skips (12) when nothing landed since the base 340ms
       ✓ runs (0) with the landed path count once dev moved 590ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 329ms
     ✓ readAnchor: two blocks: the first block's value wins 1ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 631ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 388ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 614ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 812ms
     ✓ runs exactly one git push 931ms
     ✓ --set-upstream records the upstream 450ms
     ✓ refuses with no branch checked out 329ms
     ✓ --mode=dev refuses a feature checkout 281ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 825ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1204ms
     ✓ --require-ci pushes as-is when dev has not moved 470ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 956ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1283ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 318ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 496ms
     ✓ --mode=abort pushes when the branch has no open PR 920ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 526ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 307ms
     ✓ --open-pr carries the MCP answer and skips gh 413ms
     ✓ --mode=abort on dev pushes plainly without probing 393ms
     ✓ rejects an unknown mode 309ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1800ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 819ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 962ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2192ms
     ✓ skip-ci HEAD on the replay is refused 596ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1461ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2153ms
     ✓ a level local dev is a plain push, recording nothing extra 572ms
     ✓ a record with no commits pushes nothing 340ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 205ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 611ms
     ✓ a rewritten branch is refused, never forced 276ms
     ✓ refuses dev and main with exit 21 and pushes nothing 178ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 451ms
     ✓ refuses a detached HEAD (exit 5) 202ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 456ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 682ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 733ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 795ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 278ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 784ms
     ✓ an up-to-date branch is a no-op 428ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 538ms
     ✓ a fetch that fails exits 10 198ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 253ms
     ✓ scan-diff still reports a new skip when its test … 282ms
     ✓ scan-diff reports a skip moved onto a different t… 241ms
     ✓ scan-diff does not cancel a skip moved between am… 226ms
     ✓ scan-diff does not spend an unchanged duplicate t… 230ms
     ✓ scan-diff recognizes a renamed test file 252ms
     ✓ scan-diff recognizes a suite moved into a differe… 229ms
     ✓ scan-diff does not let unrelated additions hide a… 224ms
     ✓ scan-diff attributes deletion to its old test ins… 225ms
     ✓ scan-diff consumes each moved assertion once and … 235ms
     ✓ scan-diff does not match identical assertions fro… 240ms
     ✓ scan-diff does not match the same leaf test name … 233ms
     ✓ scan-diff does not match a same-named test with d… 230ms
     ✓ scan-diff does not match a same-named test with c… 232ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 230ms
     ✓ --paths with no match exits 1 209ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 164ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 297ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 305ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 212ms
     ✓ --marker reads a diff over 1 MiB 240ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 320ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 259ms
     ✓ scan-diff finds an added skip 254ms
     ✓ scan-diff ignores a skip predating the base 234ms
     ✓ scan-diff reports a disabled test with its line 272ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 230ms
     ✓ scan-diff ignores a removed comment in a test file 227ms
     ✓ scan-diff ignores an assertion moved within the file 230ms
     ✓ scan-diff still reports a removed assertion 227ms
     ✓ scan-diff reports an assertion re-added only outside the test file 228ms
     ✓ scan-diff finds an added pytest mark skip 253ms
     ✓ scan-diff finds an added unittest skip 209ms
     ✓ scan-diff finds an added bare skip call 209ms
     ✓ scan-diff ignores a quoted skip in a documentation file 236ms
     ✓ scan-diff ignores a marker literal in a non-test source file 245ms
     ✓ scan-diff ignores an assertion whose expectation changed 272ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 322ms
     ✓ scan-diff reports a deleted test file 373ms
     ✓ scan-diff never opens a symlinked test file's outside target 2ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 300ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 801ms
     ✓ a title that already carries the marker is left alone 682ms
     ✓ with no open PR: pushes the marker commit and edits no title 628ms
     ✓ a re-run is deduped: no second marker commit 661ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 641ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 183ms
     ✓ --title-set skips gh entirely 319ms
     ✓ refuses dev and main (exit 21) 159ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 744ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1214ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 610ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1263ms
     ✓ continues only the explicitly recorded target through the public merge command 860ms
     ✓ fetches the unseen feature head before classifying the base 594ms
     ✓ fast forwards the feature before either base path is chosen 1274ms
     ✓ merges divergent feature tips without rebasing either side 742ms
     ✓ continues the feature merge before starting a dev merge 1185ms
     ✓ publishes local code with a CI running head before bookkeeping 1339ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 1779ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1157ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 849ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 229ms
     ✓ Path B once dev moved; --head checks a given commit 346ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 357ms
     ✓ --merge-docs merges dev when docs/ is behind 445ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 549ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 774ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 708ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 622ms
     ✓ --merge-docs skips an empty bkit:generate script 454ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 366ms
     ✓ --merge-docs never merges on dev itself 319ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 474ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 467ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 447ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 459ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 247ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 645ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 843ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 719ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 625ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 575ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 756ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 547ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 640ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 440ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 312ms
     ✓ exits 10 when the fetch fails 188ms
     ✓ refuses --merge-docs with --head, and an unknown --head 203ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 376ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 568ms
     ✓ a failed install stops ship (16) 490ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 404ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 376ms
     ✓ exits 10 when the fetch fails 287ms
   ❯ shared landed comparison (5)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 207ms
     ✓ preserves unlanded file type changes in the shared landed comparison 204ms
     × a later dev commit on the same file does not turn a landed branch back into unlanded 438ms
     × names only the file whose branch version never reached dev 447ms
     × a deleted file that dev deleted and a later commit re-added counts as landed 468ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 164ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 213ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 983ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 933ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 928ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 946ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2026ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2333ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 353ms
     ✓ local: names unpushed dev as the cause when the branch carries it 406ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 434ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1491ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1120ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 960ms
     ✓ uses tree entry equivalence for design and plan land cleanup 3775ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 846ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1022ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 938ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 621ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1297ms
     ✓ land removes the worktree when only the copied .env is untracked 1002ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 872ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 932ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1596ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 939ms
     ✓ landPr refuses a main-based PR without retrying 507ms
     ✓ landPr refuses when the PR base is unknown 496ms
     ✓ PR not open (closed): stops (17) at once, no retry 642ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 385ms
     ✓ --attempt names the merge round in a fix commit 339ms
     ✓ commits a rewritten and a deleted tracked file 348ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 301ms
     ✓ reports undeclared and runs nothing with no scripts 214ms
     ✓ reports undeclared and runs nothing with an empty script 217ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 265ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 322ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 216ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 312ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 295ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 297ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 301ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > shared landed comparison > a later dev commit on the same file does not turn a landed branch back into unlanded
AssertionError: expected [ 'src.txt' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "src.txt",
+ ]

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3639:52
    3637|     expect(sha(clone, "HEAD:src.txt")).not.toBe(sha(clone, "origin/dev…
    3638|     const comparison = await import("./worktrees");
    3639|     expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([]);
       |                                                    ^
    3640|   });
    3641|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > shared landed comparison > names only the file whose branch version never reached dev
AssertionError: expected [ 'a.txt', 'src.txt' ] to deeply equal [ 'src.txt' ]

- Expected
+ Received

  [
+   "a.txt",
    "src.txt",
  ]

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3650:52
    3648|     expect(git(clone, "fetch", "-q", "origin").ok).toBe(true);
    3649|     const comparison = await import("./worktrees");
    3650|     expect(comparison.notOnDev(clone, "feat/1-x")).toEqual(["src.txt"]…
       |                                                    ^
    3651|   });
    3652|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > shared landed comparison > a deleted file that dev deleted and a later commit re-added counts as landed
AssertionError: expected [ 'src.txt' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "src.txt",
+ ]

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3667:52
    3665|     expect(git(clone, "ls-tree", "origin/dev", "src.txt").out).not.toB…
    3666|     const comparison = await import("./worktrees");
    3667|     expect(comparison.notOnDev(clone, "feat/1-x")).toEqual([]);
       |                                                    ^
    3668|   });
    3669| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 283 passed (286)
   Start at  22:04:18
   Duration  129.13s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-WNjVNt/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1055-worktree-removal-says

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (98 tests | 2 failed) 25335ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 28ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 26ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 27ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 28ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 28ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 33ms
     ✓ refuses ["--workflow=build","--month=202610"] 26ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 29ms
     ✓ refuses outside a git repository 7ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 82ms
     ✓ adopts the main checkout even when called from a linked worktree 106ms
     ✓ design refuses to work in place on dev 58ms
     ✓ plan refuses to work in place on dev 58ms
     ✓ build refuses to work in place on dev 58ms
     ✓ ship refuses to work in place on dev 66ms
     ✓ build in place on main is refused 52ms
     ✓ design and plan in place on main are refused 98ms
     ✓ still adopts a cloud session branch whose upstream is main 94ms
     ✓ refuses a detached HEAD 61ms
   ✓ bkit worktrees setup — adopt the checkout the session is already on (5)
     ✓ adopts the linked worktree already on feat/{fid} for design, plan, build and debug 506ms
     ✓ ship run from a linked worktree on its target branch adopts that worktree 139ms
     ✓ the adopted linked worktree holds the log directory 112ms
     ✓ refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees 130ms
     ✓ a plan session on another branch still mints .worktrees/{fid} 243ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 314ms
     ✓ may debug in place on dev 162ms
     ✓ never in place on main 49ms
     ✓ refuses a detached HEAD before anything else 54ms
     ✓ adopts in place when the session is already on feat/{fid} 83ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (25)
     ✓ in-place debug on dev writes the shared-checkout record 347ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 317ms
     ✓ a new run of the same FID rewrites startSha 518ms
     ✓ a resume of the same FID reuses the record 462ms
     ✓ a resume with no record rebuilds it from the run-commits row (17)
       ✓ restores the commits, the pushed list and startSha of the newest row 569ms
       ✓ drops a commit id that is not on the branch 594ms
       ✓ keeps the fresh startSha when the row's startSha is not a commit 588ms
       ✓ writes an empty commit list when the run has no run-commits row 631ms
       ✓ ignores a row from before the open run started 604ms
       ✓ restores the commits from the row on origin/dev when the handover landed 736ms
       ✓ restores the commits when origin/dev holds only the lines the checkout lacks 740ms
       ✓ ignores the row on origin/dev when the checkout's log shows the run closed 659ms
       ✓ ignores the row on origin/dev when the run there is closed 743ms
       ✓ from the parked local copy (8)
         ✓ restores commits, pushed and startSha when no copy of the row is reachable 638ms
         ✓ wins over the row on origin/dev, which is then not needed 762ms
         ✓ wins over the row in the checkout's own log while the run is open 675ms
         ✓ still drops a commit id that is not on the branch 662ms
         ✓ is ignored and removed when the checkout's log shows the run closed 628ms
         ✓ is ignored when it was parked for another workflow 655ms
         ✓ is removed once the record is rebuilt 651ms
         ✓ is removed when the live record already stands for the open run 550ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 276ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 285ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 359ms
     ✓ a stale record without a lock is replaced 402ms
   ✓ bkit worktrees setup — ship branch (10)
     ✓ fetches a remote only ship branch before adopting it 300ms
     ✓ refuses inherited unpublished dev commits in every ship mode 1066ms
     ✓ names inherited commits and ship recovery in the refusal 243ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 297ms
     ✓ ship names a missing feat branch 101ms
     ✓ ship on dev refuses with the releases-stay-manual text 43ms
     ✓ refuses dev / main as the ship branch 43ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 286ms
     ✓ --issue is ship only 25ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 103ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 68ms
     ✓ fails with a fetch error when there is no origin to rebase onto 107ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 76ms
       ✓ checks no disk when there are no cleanup step files 115ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 117ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 117ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 94ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 65ms
     ✓ never commits an entry only the main checkout's copy list names 107ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 32ms
     ✓ resolves the same marker from inside the worktree 58ms
   ❯ bkit worktrees remove (20)
     ✓ answers absent when there is no worktree 43ms
     ✓ leaves a worktree without the marker in place 60ms
     ✓ preserves a marked worktree with uncommitted changes and its marker 135ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 87ms
     ✓ tells a caller inside the removed worktree where to cd 117ms
     ✓ fails with its own exit code when git cannot remove a marked path 84ms
     ❯ --branch (14)
       ✓ preserves staged-only content during landed cleanup 329ms
       ✓ preserves staged-only mode during landed cleanup 327ms
       ✓ preserves staged-only type during landed cleanup 311ms
       ✓ preserves staged-only deletion during landed cleanup 350ms
       ✓ removes landed staged content when both index and working contents are on dev 354ms
       ✓ deletes the proved local and remote branch at their landed tips 420ms
       ✓ retains the remote branch when origin refuses its conditional deletion 529ms
       × removes the worktree and local branch when a later dev commit changed the branch's file 415ms
       × deletes the remote branch when a later dev commit changed the branch's file 461ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 189ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 181ms
       ✓ a branch already gone is reported as unavailable without claiming deletion 100ms
       ✓ refuses to delete dev (2) 35ms
       ✓ refuses to delete main (2) 35ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 50ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 142ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 309ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees remove > --branch > removes the worktree and local branch when a later dev commit changed the branch's file
AssertionError: expected { removed: false, …(6) } to match object { removed: true, …(2) }
(4 matching properties omitted from actual)

- Expected
+ Received

  {
-   "branchBlockedBy": null,
-   "branchDeleted": true,
-   "removed": true,
+   "branchBlockedBy": "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-unit-Ap8Wpg/.worktrees/42-thing",
+   "branchDeleted": false,
+   "removed": false,
  }

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:1231:22
    1229|       const r = await remove(cwd, `--branch=feat/${FID}`);
    1230|       expect(r.code).toBe(0);
    1231|       expect(r.json).toMatchObject({ removed: true, branchDeleted: tru…
       |                      ^
    1232|       expect(r.json.reason).not.toBe("not-landed");
    1233|       expect(fs.existsSync(wt)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees remove > --branch > deletes the remote branch when a later dev commit changed the branch's file
AssertionError: expected { removed: false, …(6) } to match object { removed: true, remoteDeleted: true }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
-   "remoteDeleted": true,
-   "removed": true,
+   "remoteDeleted": false,
+   "removed": false,
  }

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:1245:22
    1243|       expect(r.code).toBe(0);
    1244|       expect(r.json.reason).not.toBe("remote-not-landed");
    1245|       expect(r.json).toMatchObject({ removed: true, remoteDeleted: tru…
       |                      ^
    1246|       expect(remoteHas(origin)).toBe(false);
    1247|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 96 passed (98)
   Start at  22:06:28
   Duration  25.54s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-dENEgb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
