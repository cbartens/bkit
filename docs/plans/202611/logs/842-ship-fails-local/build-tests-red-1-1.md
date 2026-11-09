Enforced: true
Red: 23
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/842-ship-fails-local-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "fetches the unseen feature head before classifying the base" | red | failure: [bkit-branches] unknown flag --reconcile-feature : expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "fast forwards the feature before either base path is chosen" | red | failure: [bkit-branches] unknown flag --reconcile-feature : expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "merges divergent feature tips without rebasing either side" | red | failure: [bkit-branches] unknown flag --reconcile-feature : expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "continues the feature merge before starting a dev merge" | red | failure: expected 2 to be 24 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "publishes local code with a CI running head before bookkeeping" | red | failure: [bkit-branches] unknown flag --reconcile-feature : expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses feature reconciliation without losing work when fetch or merge fails" | red | failure: expected '[bkit-branches] unknown flag --reconc…' to match /fetch.*failed\|cannot fetch/i |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "reconciles cloud and laptop feature commits through the command boundary" | red | failure: [bkit-branches] unknown flag --reconcile-feature : expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "fetches a remote only ship branch before adopting it" | red | failure: [bkit-worktrees] adopt mode: cannot switch to feat/42-thing — commit or stash local changes, then re-run (fatal: invalid reference: feat/42-thing) : expected 7 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "refuses inherited unpublished dev commits in every ship mode" | red | failure: expected [ +0, +0, +0 ] to deeply equal [ 7, 7, 7 ] |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "names inherited commits and ship recovery in the refusal" | red | failure: expected +0 to be 7 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses remote feature work that imports unpublished local dev ancestry" | red | failure: expected '[bkit-branches] unknown flag --reconc…' to contain '67222ad' |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "rechecks inherited dev work when a retry observes a new feature candidate" | red | failure: [bkit-branches] unknown flag --reconcile-feature : expected 2 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/prs.test.ts` "does not adopt a merged PR when the feature has newer work" | red | failure: [bkit-prs] unknown flag --ship-entry : expected 2 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/prs.test.ts` "refuses merged entry when current feature evidence cannot be read" | red | failure: expected '[bkit-prs] unknown flag --ship-entry\n' to match /fetch\|feature.*evidence\|remote.*read/i |
| 3 | `.bkit/core/engine/commands/workflow/prs.test.ts` "qualifies MCP merged PR facts against newer feature work without gh" | red | failure: [bkit-prs] unknown flag --ship-entry : expected 2 to be +0 // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves newer feature work when closing an already merged PR" | red | failure: expected { removed: true, reason: null, …(5) } to match object { Object (removed, branchDeleted) } (5 matching properties omitted from actual) |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves unlanded file deletions and ledger additions on close" | red | failure: expected false to be true // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves dirty work and uncertain branch evidence during close" | red | failure: expected { removed: true, reason: null, …(5) } to match object { Object (removed, branchDeleted) } (5 matching properties omitted from actual) |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "keeps a newer remote feature tip while closing the landed local tip" | red | failure: expected true to be false // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "preserves a local feature ref changed after its cleanup proof" | red | failure: expected 'refs/heads/feat/12-export-csv' to be '27cf0871fc84b3468616a6f2dcf319007c202…' // Object.is equality |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "preserves unlanded executable bit changes in the shared landed comparison" | red | failure: comparison.notOnDev is not a function |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "preserves unlanded file type changes in the shared landed comparison" | red | failure: comparison.notOnDev is not a function |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "uses tree entry equivalence for design and plan land cleanup" | red | failure: [bkit-branches] close-transport row not written — the main checkout is never written to; shape=pr sha=f6b0b3162da77912ea24aa8e709265df7f0f5471 scan=clean [bkit-branches] git push origin --delete feat/12-x failed or it was already gone : expected +0 to be 18 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts

[test-timeout-budget] load average 3.1 on 10 cores: unit limits 6050ms per test, 12100ms per hook (x1.21)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (270 tests | 11 failed) 211880ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 120ms
     ✓ rejects missing explicit and ambiguous existing branch selections 97ms
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
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 34ms
   ✓ branches rebase: behaviour (30)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 174ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 187ms
     ✓ --file records nothing for a refused rebase 121ms
     ✓ refuses a code conflict and aborts the rebase on the spot 149ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 478ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 122ms
     ✓ produces byte-identical output to merge=union 288ms
     ✓ restores a trailing newline so the next append starts on its own line 165ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 154ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 235ms
     ✓ refuses a union that leaves a line which is not JSON 139ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 182ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 559ms
     ✓ refuses a lockfile whose regenerate command fails 309ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 238ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 258ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 229ms
     ✓ refuses and aborts when both sides changed the hand-written region 142ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 179ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 201ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 261ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 152ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 186ms
     ✓ refuses and aborts when a side deleted the install record 140ms
     ✓ refuses a conflicted doc the repo's script does not list 131ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 118ms
     ✓ removes a stale sentinel when the rebase succeeds 175ms
     ✓ exits 4 when no rebase is in progress 48ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 248ms
     ✓ resolves a conflict in each of two replayed commits across rounds 212ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 9ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 46ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 19ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 9ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 8ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 15ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 15ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 15ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 15ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 0ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 15ms
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
       ✓ skips (12) with no plan file 117ms
       ✓ skips (12) with no anchor 112ms
       ✓ skips (12) when the base is unreachable in this clone 125ms
       ✓ skips (12) when nothing landed since the base 120ms
       ✓ runs (0) with the landed path count once dev moved 224ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 119ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 246ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 149ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 191ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 605ms
     ✓ runs exactly one git push 510ms
     ✓ --set-upstream records the upstream 176ms
     ✓ refuses with no branch checked out 153ms
     ✓ --mode=dev refuses a feature checkout 194ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 403ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 629ms
     ✓ --require-ci pushes as-is when dev has not moved 372ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 758ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1090ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 339ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1344ms
     ✓ --mode=abort pushes when the branch has no open PR 1456ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 983ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 240ms
     ✓ --open-pr carries the MCP answer and skips gh 347ms
     ✓ --mode=abort on dev pushes plainly without probing 427ms
     ✓ rejects an unknown mode 325ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1503ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 700ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 761ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2670ms
     ✓ skip-ci HEAD on the replay is refused 324ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1050ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1822ms
     ✓ a level local dev is a plain push, recording nothing extra 483ms
     ✓ a record with no commits pushes nothing 372ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 298ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 1107ms
     ✓ a rewritten branch is refused, never forced 477ms
     ✓ refuses dev and main with exit 21 and pushes nothing 314ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 890ms
     ✓ refuses a detached HEAD (exit 5) 252ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 525ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 510ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 486ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 660ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 355ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 866ms
     ✓ an up-to-date branch is a no-op 494ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 878ms
     ✓ a fetch that fails exits 10 305ms
   ✓ branches scan-diff (39)
     ✓ scan-diff does not treat an existing skip in a re… 535ms
     ✓ scan-diff still reports a new skip when its test … 340ms
     ✓ scan-diff reports a skip moved onto a different t… 381ms
     ✓ scan-diff does not cancel a skip moved between am… 431ms
     ✓ scan-diff does not spend an unchanged duplicate t… 408ms
     ✓ scan-diff recognizes a renamed test file 443ms
     ✓ scan-diff recognizes a suite moved into a differe… 486ms
     ✓ scan-diff does not let unrelated additions hide a… 483ms
     ✓ scan-diff attributes deletion to its old test ins… 416ms
     ✓ scan-diff consumes each moved assertion once and … 480ms
     ✓ scan-diff does not match identical assertions fro… 469ms
     ✓ scan-diff does not match the same leaf test name … 444ms
     ✓ scan-diff does not match a same-named test with d… 563ms
     ✓ scan-diff does not match a same-named test with c… 484ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 424ms
     ✓ --paths with no match exits 1 348ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 319ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 475ms
     ✓ --marker reads a diff over 1 MiB 412ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 520ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 553ms
     ✓ scan-diff finds an added skip 431ms
     ✓ scan-diff ignores a skip predating the base 443ms
     ✓ scan-diff reports a disabled test with its line 565ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 527ms
     ✓ scan-diff ignores a removed comment in a test file 584ms
     ✓ scan-diff ignores an assertion moved within the file 477ms
     ✓ scan-diff still reports a removed assertion 425ms
     ✓ scan-diff reports an assertion re-added only outside the test file 434ms
     ✓ scan-diff finds an added pytest mark skip 493ms
     ✓ scan-diff finds an added unittest skip 517ms
     ✓ scan-diff finds an added bare skip call 423ms
     ✓ scan-diff ignores a quoted skip in a documentation file 509ms
     ✓ scan-diff ignores a marker literal in a non-test source file 427ms
     ✓ scan-diff ignores an assertion whose expectation changed 444ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 423ms
     ✓ scan-diff reports a deleted test file 646ms
     ✓ scan-diff never opens a symlinked test file's outside target 3ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 486ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1382ms
     ✓ a title that already carries the marker is left alone 1490ms
     ✓ with no open PR: pushes the marker commit and edits no title 1185ms
     ✓ a re-run is deduped: no second marker commit 1501ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1416ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 370ms
     ✓ --title-set skips gh entirely 735ms
     ✓ refuses dev and main (exit 21) 351ms
   ❯ branches sync feature reconciliation (8)
     × fetches the unseen feature head before classifying the base 844ms
     × fast forwards the feature before either base path is chosen 960ms
     × merges divergent feature tips without rebasing either side 1027ms
     × continues the feature merge before starting a dev merge 1377ms
     × publishes local code with a CI running head before bookkeeping 1025ms
     × refuses feature reconciliation without losing work when fetch or merge fails 685ms
     × refuses remote feature work that imports unpublished local dev ancestry 1099ms
     × rechecks inherited dev work when a retry observes a new feature candidate 1015ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 703ms
     ✓ Path B once dev moved; --head checks a given commit 907ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 900ms
     ✓ --merge-docs merges dev when docs/ is behind 1142ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1125ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1615ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1493ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1288ms
     ✓ --merge-docs skips an empty bkit:generate script 1170ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 1298ms
     ✓ --merge-docs never merges on dev itself 814ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1274ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1317ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1387ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1314ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 770ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1859ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2033ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1879ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1896ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 2207ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2389ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1646ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 2181ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1439ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 916ms
     ✓ exits 10 when the fetch fails 576ms
     ✓ refuses --merge-docs with --head, and an unknown --head 521ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 924ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 2096ms
     ✓ a failed install stops ship (16) 1632ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1352ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1170ms
     ✓ exits 10 when the fetch fails 761ms
   ❯ shared landed comparison (2)
     × preserves unlanded executable bit changes in the shared landed comparison 971ms
     × preserves unlanded file type changes in the shared landed comparison 585ms
   ❯ branches land (28)
     ✓ refuses a workflow other than design or plan 429ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 847ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2928ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2643ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 3607ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 3389ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 6408ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 9508ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 1705ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1543ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1826ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 3416ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 4144ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 2583ms
     × uses tree entry equivalence for design and plan land cleanup 6025ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2521ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 3970ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 2729ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1712ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3389ms
     ✓ land removes the worktree when only the copied .env is untracked 2922ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 2385ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2056ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 4386ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2588ms
     ✓ landPr refuses a main-based PR without retrying 1261ms
     ✓ landPr refuses when the PR base is unknown 1567ms
     ✓ PR not open (closed): stops (17) at once, no retry 1534ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 1164ms
     ✓ --attempt names the merge round in a fix commit 1337ms
     ✓ commits a rewritten and a deleted tracked file 1199ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 1138ms
     ✓ reports undeclared and runs nothing with no scripts 714ms
     ✓ reports undeclared and runs nothing with an empty script 783ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 1143ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 1377ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 838ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > fetches the unseen feature head before classifying the base
AssertionError: [bkit-branches] unknown flag --reconcile-feature
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2663:37
    2661|     expect(git(clone, "cat-file", "-e", remote).ok).toBe(false);
    2662|     const result = await reconcile(clone, `--head=${remote}`);
    2663|     expect(result.code, result.err).toBe(0);
       |                                     ^
    2664|     expect(result.json).toMatchObject({ head: remote, basePath: "A" });
    2665|     expect(sha(clone)).toBe(remote);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > fast forwards the feature before either base path is chosen
AssertionError: [bkit-branches] unknown flag --reconcile-feature
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2673:35
    2671|     const aTip = cloudCommit(a.other, { "cloud.txt": "cloud A\n" });
    2672|     const pathA = await reconcile(a.clone);
    2673|     expect(pathA.code, pathA.err).toBe(0);
       |                                   ^
    2674|     expect(pathA.json).toMatchObject({ basePath: "A", head: aTip });
    2675|     expect(sha(a.clone)).toBe(aTip);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > merges divergent feature tips without rebasing either side
AssertionError: [bkit-branches] unknown flag --reconcile-feature
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2701:37
    2699|     expect(git(other, "push", "-q", "origin", "HEAD:feat/1-x").ok).toB…
    2700|     const result = await reconcile(clone);
    2701|     expect(result.code, result.err).toBe(0);
       |                                     ^
    2702|     expect(git(clone, "merge-base", "--is-ancestor", local, "HEAD").ok…
    2703|     expect(git(clone, "merge-base", "--is-ancestor", remote, "HEAD").o…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > continues the feature merge before starting a dev merge
AssertionError: expected 2 to be 24 // Object.is equality

- Expected
+ Received

- 24
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2719:24
    2717|     landOnDev(origin, { "dev.txt": "new base\n" });
    2718|     const first = await reconcile(clone);
    2719|     expect(first.code).toBe(24);
       |                        ^
    2720|     expect(git(clone, "rev-parse", "MERGE_HEAD").out).toBe(remote);
    2721|     expect(git(clone, "merge-base", "--is-ancestor", "origin/dev", "HE…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > publishes local code with a CI running head before bookkeeping
AssertionError: [bkit-branches] unknown flag --reconcile-feature
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2742:35
    2740|     commit(a.clone, { "docs/testing.md": "notes\n" }, "docs: notes [sk…
    2741|     const pathA = await reconcile(a.clone);
    2742|     expect(pathA.code, pathA.err).toBe(0);
       |                                   ^
    2743|     expect(git(a.clone, "log", "-1", "--format=%s").out).not.toMatch(/…
    2744|     expect((await run(a.clone, ["push", "--mode=plain"])).code).toBe(0…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > refuses feature reconciliation without losing work when fetch or merge fails
AssertionError: expected '[bkit-branches] unknown flag --reconc…' to match /fetch.*failed|cannot fetch/i

- Expected:
/fetch.*failed|cannot fetch/i

+ Received:
"[bkit-branches] unknown flag --reconcile-feature
"

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2774:29
    2772|     const fetchFailed = await reconcile(unavailable.clone);
    2773|     expect(fetchFailed.code).not.toBe(0);
    2774|     expect(fetchFailed.err).toMatch(/fetch.*failed|cannot fetch/i);
       |                             ^
    2775|     expect(sha(unavailable.clone)).toBe(original);
    2776|     expect(git(unavailable.clone, "status", "--porcelain").out).toBe("…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > refuses remote feature work that imports unpublished local dev ancestry
AssertionError: expected '[bkit-branches] unknown flag --reconc…' to contain '67222ad'

- Expected
+ Received

- 67222ad
+ [bkit-branches] unknown flag --reconcile-feature
+

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2833:29
    2831|     const aheadResult = await reconcile(ahead.clone);
    2832|     expect(aheadResult.code).not.toBe(0);
    2833|     expect(aheadResult.err).toContain(ahead.inherited.slice(0, 7));
       |                             ^
    2834|     expect(aheadResult.err).toMatch(/unpublished|unpushed/);
    2835|     expect(sha(ahead.clone)).toBe(ahead.local);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches sync feature reconciliation > rechecks inherited dev work when a retry observes a new feature candidate
AssertionError: [bkit-branches] unknown flag --reconcile-feature
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:2853:41
    2851|     const f = unpublishedDev("remote-inherited-retry");
    2852|     const eligible = await reconcile(f.clone);
    2853|     expect(eligible.code, eligible.err).toBe(0);
       |                                         ^
    2854|     expect(sha(f.clone)).toBe(f.local);
    2855|     const remote = f.importDev();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > shared landed comparison > preserves unlanded executable bit changes in the shared landed comparison
TypeError: comparison.notOnDev is not a function
 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3449:23
    3447|     expect(git(clone, "ls-tree", "HEAD", "src.txt").out).toMatch(/^100…
    3448|     const comparison = await import("./worktrees");
    3449|     expect(comparison.notOnDev(clone, "feat/1-x")).toContain("src.txt"…
       |                       ^
    3450|   });
    3451|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > shared landed comparison > preserves unlanded file type changes in the shared landed comparison
TypeError: comparison.notOnDev is not a function
 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3462:23
    3460|     expect(git(clone, "ls-tree", "HEAD", "src.txt").out).toMatch(/^120…
    3461|     const comparison = await import("./worktrees");
    3462|     expect(comparison.notOnDev(clone, "feat/1-x")).toContain("src.txt"…
       |                       ^
    3463|   });
    3464| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches land > uses tree entry equivalence for design and plan land cleanup
AssertionError: [bkit-branches] close-transport row not written — the main checkout is never written to; shape=pr sha=f6b0b3162da77912ea24aa8e709265df7f0f5471 scan=clean
[bkit-branches] git push origin --delete feat/12-x failed or it was already gone
: expected +0 to be 18 // Object.is equality

- Expected
+ Received

- 18
+ 0

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:3806:45
    3804|     const designMode = await landEntryShape("design", true);
    3805|     const planMode = await landEntryShape("plan", true);
    3806|     expect(designMode.code, designMode.err).toBe(18);
       |                                             ^
    3807|     expect(planMode.code, planMode.err).toBe(18);
    3808|     expect(designMode).toMatchObject({ branchRetained: true, worktreeR…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed | 259 passed (270)
   Start at  17:34:02
   Duration  212.06s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-spETwo/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

[test-timeout-budget] load average 20.7 on 10 cores: unit limits 14851ms per test, 29701ms per hook (x2.97)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (50 tests | 2 failed) 62667ms
   ❯ ship feature reconciliation wiring (2)
     × reconciles cloud and laptop feature commits through the command boundary 1200ms
     × keeps a newer remote feature tip while closing the landed local tip 4082ms
   ✓ bkit worktrees setup — mint (create) (19)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1792ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1323ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1247ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1637ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1958ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2461ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 666ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 245ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 636ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 905ms
     ✓ design installs dependencies like build and debug 1235ms
     ✓ plan installs dependencies like build and debug 757ms
     ✓ design stops on a failed install (5) 806ms
     ✓ plan stops on a failed install (5) 696ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 650ms
     ✓ tracks origin/feat/{fid} when only the remote has it 980ms
     ✓ fails without minting when origin cannot be reached 151ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 736ms
     ✓ reports a package manager that could not run (127) apart from a failed install 657ms
   ✓ bkit worktrees setup — mint (resume) (24)
     ✓ rebases onto origin/dev and clears a stale sentinel 993ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 1272ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 1398ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 793ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 787ms
     ✓ debug: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 958ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1022ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 947ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1216ms
     ✓ commits leftovers when a copy entry points outside the checkout 1027ms
     ✓ never commits the entries setup copies in from the main checkout 1327ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1107ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 770ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 978ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1417ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 654ms
     ✓ leaves a clean worktree's history alone 1071ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1902ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 4881ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 2340ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 1577ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 1966ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 1802ms
     ✓ does not mark a resumed worktree it did not create 837ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 249ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 747ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1270ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1287ms
   ✓ bkit worktrees remove (1)
     ✓ removes a worktree setup created, uncommitted changes and all, and clears the marker 726ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.integration.test.ts > ship feature reconciliation wiring > reconciles cloud and laptop feature commits through the command boundary
AssertionError: [bkit-branches] unknown flag --reconcile-feature
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:187:94
    185|         io: { stdout: (text) => output.push(text), stderr: (text) => e…
    186|       });
    187|     expect(await dispatch(["sync", "--reconcile-feature", `--fid=${FID…
       |                                                                                              ^
    188|       0,
    189|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.integration.test.ts > ship feature reconciliation wiring > keeps a newer remote feature tip while closing the landed local tip
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ closeWithRemoteChange .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:291:45
    289|       expect(code, err.join("")).toBe(0);
    290|       const result = JSON.parse(out.join("")) as { worktree: { remoteD…
    291|       expect(result.worktree.remoteDeleted).toBe(false);
       |                                             ^
    292|       expect(git(f.origin, "rev-parse", `refs/heads/feat/${FID}`)).toB…
    293|       expect(git(f.origin, "show", `feat/${FID}:remote-fix.txt`)).toBe…
 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:308:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 48 passed (50)
   Start at  17:37:38
   Duration  63.56s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-NbnweL/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.test.ts

[test-timeout-budget] load average 12.6 on 10 cores: unit limits 10800ms per test, 21600ms per hook (x2.16)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (68 tests | 3 failed) 13580ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 46ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 38ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 38ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 45ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 37ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 48ms
     ✓ refuses ["--workflow=build","--month=202610"] 39ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 39ms
     ✓ refuses outside a git repository 9ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 136ms
     ✓ adopts the main checkout even when called from a linked worktree 153ms
     ✓ design refuses to work in place on dev 82ms
     ✓ plan refuses to work in place on dev 85ms
     ✓ build refuses to work in place on dev 93ms
     ✓ ship refuses to work in place on dev 82ms
     ✓ build in place on main is refused 76ms
     ✓ design and plan in place on main are refused 163ms
     ✓ still adopts a cloud session branch whose upstream is main 143ms
     ✓ refuses a detached HEAD 86ms
   ✓ bkit worktrees setup — debug (5)
     ✓ adopts a requested debug branch without mutating conflicting worktrees 480ms
     ✓ may debug in place on dev 200ms
     ✓ never in place on main 99ms
     ✓ refuses a detached HEAD before anything else 81ms
     ✓ adopts in place when the session is already on feat/{fid} 141ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 491ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 470ms
     ✓ a new run of the same FID rewrites startSha 1232ms
     ✓ a resume of the same FID reuses the record 558ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 360ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 362ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 478ms
     ✓ a stale record without a lock is replaced 583ms
   ❯ bkit worktrees setup — ship branch (10)
     × fetches a remote only ship branch before adopting it 227ms
     × refuses inherited unpublished dev commits in every ship mode 985ms
     × names inherited commits and ship recovery in the refusal 296ms
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 380ms
     ✓ ship names a missing feat branch 171ms
     ✓ ship on dev refuses with the releases-stay-manual text 130ms
     ✓ refuses dev / main as the ship branch 86ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 418ms
     ✓ --issue is ship only 47ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 132ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 97ms
     ✓ fails with a fetch error when there is no origin to rebase onto 166ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 124ms
       ✓ checks no disk when there are no cleanup step files 189ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 180ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 170ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 157ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 108ms
     ✓ never commits an entry only the main checkout's copy list names 174ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 49ms
     ✓ resolves the same marker from inside the worktree 104ms
   ✓ bkit worktrees remove (12)
     ✓ answers absent when there is no worktree 68ms
     ✓ leaves a worktree without the marker in place 91ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 134ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 116ms
     ✓ tells a caller inside the removed worktree where to cd 108ms
     ✓ fails with its own exit code when git cannot remove a marked path 66ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 330ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 224ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 200ms
       ✓ a branch already gone everywhere is reported deleted 154ms
       ✓ refuses to delete dev (2) 39ms
       ✓ refuses to delete main (2) 39ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 58ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 169ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 417ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > fetches a remote only ship branch before adopting it
AssertionError: [bkit-worktrees] adopt mode: cannot switch to feat/42-thing — commit or stash local changes, then re-run (fatal: invalid reference: feat/42-thing)
: expected 7 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 7

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:449:37
    447|     const expected = git(origin, "rev-parse", `refs/heads/feat/${FID}`…
    448|     const result = await setup(cwd, "ship", `--branch=feat/${FID}`);
    449|     expect(result.code, result.err).toBe(0);
       |                                     ^
    450|     expect(result.json).toMatchObject({
    451|       mode: "adopted",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > refuses inherited unpublished dev commits in every ship mode
AssertionError: expected [ +0, +0, +0 ] to deeply equal [ 7, 7, 7 ]

- Expected
+ Received

  [
-   7,
-   7,
-   7,
+   0,
+   0,
+   0,
  ]

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:467:38
    465|     const b = await setup(resumed.cwd, "ship", ...resumed.flags);
    466|     const c = await setup(adopted.cwd, "ship", ...adopted.flags);
    467|     expect([a.code, b.code, c.code]).toEqual([7, 7, 7]);
       |                                      ^
    468|     expect(a.err).toMatch(/unpublished|unpushed/);
    469|     expect(b.err).toMatch(/unpublished|unpushed/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — ship branch > names inherited commits and ship recovery in the refusal
AssertionError: expected +0 to be 7 // Object.is equality

- Expected
+ Received

- 7
+ 0

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:486:25
    484|     const f = inheritedShip("adopted");
    485|     const result = await setup(f.cwd, "ship");
    486|     expect(result.code).toBe(7);
       |                         ^
    487|     expect(result.err).toContain(f.inherited.slice(0, 7));
    488|     expect(result.err).toContain("unpublished dev ownership");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 65 passed (68)
   Start at  17:38:44
   Duration  13.93s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-pxmziD/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/prs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/prs.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/prs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/prs.test.ts

[test-timeout-budget] load average 13.1 on 10 cores: unit limits 11050ms per test, 22100ms per hook (x2.21)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local

 ❯ .bkit/core/engine/commands/workflow/prs.test.ts (110 tests | 3 failed) 14659ms
   ✓ bkit prs open (36)
     ✓ creates the PR with the github marker first and the plan in the bkit block 296ms
     ✓ --file records the open as an engine-action row; a re-run reuses that PR instead of exiting 3 481ms
     ✓ --file needs --workflow 57ms
     ✓ always writes the marker, even with no plan 296ms
     ✓ puts notes above the plan path 1ms
     ✓ writes the linear marker shape, taking the tracker from package.json 247ms
     ✓ writes the jira marker shape, taking the tracker from package.json 231ms
     ✓ prMarker writes a FID-only marker with github wired and no issue 209ms
     ✓ a FID-only marker takes any slug, a tracker-shaped one included 2ms
     ✓ a marker with an issue needs the FID to embed that same issue 1ms
     ✓ writes the no-tracker marker shape 1ms
     ✓ refuses a github marker with fid "../../etc" issue "12" (exit 2) 35ms
     ✓ refuses a github marker with fid "12-x" issue "abc" (exit 2) 36ms
     ✓ refuses a github marker with fid "12-x" issue "13" (exit 2) 40ms
     ✓ refuses a linear marker with fid "12-x" issue "ABC-1" (exit 2) 39ms
     ✓ refuses a linear marker with fid "ab2-1-x" issue "AB2-1" (exit 2) 37ms
     ✓ refuses a jira marker with fid "mba-7-x" issue "mba-7" (exit 2) 37ms
     ✓ refuses a jira marker with fid "12-x" issue "MBA-7" (exit 2) 37ms
     ✓ refuses a none marker with fid "-x" issue undefined (exit 2) 37ms
     ✓ refuses a title carrying [skip ci] before calling gh (exit 4) 41ms
     ✓ refuses a title carrying [CI SKIP] before calling gh (exit 4) 37ms
     ✓ refuses a title carrying [no ci] before calling gh (exit 4) 38ms
     ✓ refuses a title carrying [skip actions] before calling gh (exit 4) 38ms
     ✓ refuses a title carrying [actions skip] before calling gh (exit 4) 37ms
     ✓ refuses a PR from dev, main, or the base itself 105ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 215ms
     ✓ retries a failed create once, and exits 5 when it fails twice 228ms
     ✓ exits 5 when the open-PR probe errors 183ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 215ms
     ✓ prs open refuses --base=main 35ms
     ✓ prs open refuses --base=refs/heads/main, the same branch as main 35ms
     ✓ prs open refuses --base=origin/main, the same branch as main 37ms
     ✓ prs open refuses --base=heads/main, the same branch as main 36ms
     ✓ prs open refuses --base=refs/remotes/origin/main, the same branch as main 38ms
     ✓ prs open still opens against any other base 291ms
     ✓ exits 6 when the created PR's base is not --base 251ms
   ❯ bkit prs probe ship entry (3)
     × does not adopt a merged PR when the feature has newer work 139ms
     × refuses merged entry when current feature evidence cannot be read 162ms
     × qualifies MCP merged PR facts against newer feature work without gh 150ms
   ✓ bkit prs probe (7)
     ✓ returns the open PR for the current branch, filtering by --base when given 266ms
     ✓ exits 1 with found=false when there is none 216ms
     ✓ --state=all prefers OPEN, then MERGED, and never picks CLOSED 306ms
     ✓ --number reads one PR, mergeable included 233ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 285ms
     ✓ exits 4 when gh errors and 80 when it needs auth 329ms
     ✓ refuses a bad --state or --number 82ms
   ✓ bkit prs scan-body (10)
     ✓ flags [skip ci] in the landed commit body (exit 1) 73ms
     ✓ flags [ci skip] in the landed commit body (exit 1) 66ms
     ✓ flags [no ci] in the landed commit body (exit 1) 63ms
     ✓ flags [skip actions] in the landed commit body (exit 1) 65ms
     ✓ flags [actions skip] in the landed commit body (exit 1) 95ms
     ✓ flags [SKIP CI] in the landed commit body (exit 1) 64ms
     ✓ passes a token-free body 64ms
     ✓ passes a deliberate token in the SUBJECT with a clean body (docs-only close) 74ms
     ✓ exits 2 on an empty or option-like sha, 3 on an unreadable one 177ms
     ✓ a failed --remote-ref fetch is logged and the local commit is still scanned 102ms
   ✓ bkit prs cross-check (9)
     ✓ fails an mcp close with gh recorded unavailable and no transport-fallback row 2ms
     ✓ passes when the fallback row is present 2ms
     ✓ exempts transport gh even with gh recorded unavailable 1ms
     ✓ exempts transport git even with gh recorded unavailable 1ms
     ✓ passes when gh was available, or no runtime-resolved row exists 2ms
     ✓ reads the LATEST runtime-resolved row 2ms
     ✓ a runtime-resolved row with backslashes in its gh error does not make the log unreadable 1ms
     ✓ exits 3 on a missing or malformed log and 2 on an unknown transport 2ms
     ✓ a malformed log exits 3 for every transport: the gh / git exemption never hides it 2ms
   ✓ bkit prs transport-row (8)
     ✓ appends a fallback row, keeping backslash arguments verbatim 2ms
     ✓ appends a close-transport row 2ms
     ✓ refuses ["--kind=close","--shape=A","--sha=x","--scan-result=clean"] (exit 2, nothing written) 1ms
     ✓ refuses ["--kind=close","--shape=pr","--sha=x","--scan-result=dirty"] (exit 2, nothing written) 1ms
     ✓ refuses ["--kind=close","--shape=pr","--scan-result=clean"] (exit 2, nothing written) 1ms
     ✓ refuses ["--kind=fallback","--from=","--to=t","--reason=r","--asserted-by=a"] (exit 2, nothing written) 1ms
     ✓ refuses ["--kind=other"] (exit 2, nothing written) 1ms
     ✓ exits 3 when status.jsonl does not exist 1ms
   ✓ bkit prs merge (11)
     ✓ squash-merges with an empty body and the title subject, then reads MERGED back 281ms
     ✓ appends the auto-route marker on an exact bkit:auto label only 346ms
     ✓ drops the force-build marker from the title subject 260ms
     ✓ takes an explicit --subject 232ms
     ✓ runs no merge when the PR is already MERGED 221ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 301ms
     ✓ prs merge refuses a PR whose base is main 219ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 220ms
     ✓ prs merge refuses when the PR base is unknown 202ms
     ✓ prs merge reads the base from the one pr view it already makes 195ms
     ✓ exits 80 when gh needs auth, and 2 on a bad --number 207ms
   ✓ bkit prs update-branch (5)
     ✓ asks gh to refresh the PR head server-side 190ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 218ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 202ms
     ✓ exits 2 on a bad --number 36ms
     ✓ never reads dev's required checks without --only-if-required 196ms
   ✓ bkit prs update-branch --only-if-required (6)
     ✓ skips the update when dev requires no status checks 218ms
     ✓ updates when a dev ruleset requires status checks 224ms
     ✓ updates when dev's branch protection requires status checks 240ms
     ✓ ignores dev rulesets that require no checks 287ms
     ✓ updates when the repo cannot be resolved 265ms
     ✓ exits 80 without updating when gh cannot read dev's required checks 294ms
   ✓ bkit prs checks (6)
     ✓ is green when every check finished successfully 253ms
     ✓ is not green when a check failed, naming it (exit 1) 259ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 250ms
     ✓ is not green on an empty rollup (total 0) 206ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 207ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 288ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 199ms
     ✓ is a no-op when the title already says so 203ms
     ✓ strips the marker, with or without its bkit prefix 219ms
     ✓ exits 5 when gh cannot edit, 80 when it needs auth, 2 on a bad --state 234ms
   ✓ bkit prs transport-row --kind=close --scan (5)
     ✓ scans a clean landed body and records the close-transport row 51ms
     ✓ records a skip token found in the body, then exits 1 54ms
     ✓ exits 8 on an unreadable commit, writing nothing 50ms
     ✓ --cross-check refuses an mcp close the runtime row says needed a fallback, unrecorded 59ms
     ✓ needs --scan or --scan-result 56ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs probe ship entry > does not adopt a merged PR when the feature has newer work
AssertionError: [bkit-prs] unknown flag --ship-entry
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/prs.test.ts:427:43
    425|     const local = mergedFeature();
    426|     const unchanged = await shipProbe(local.cwd);
    427|     expect(unchanged.code, unchanged.err).toBe(0);
       |                                           ^
    428|     expect(unchanged.json).toMatchObject({
    429|       found: true,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs probe ship entry > refuses merged entry when current feature evidence cannot be read
AssertionError: expected '[bkit-prs] unknown flag --ship-entry\n' to match /fetch|feature.*evidence|remote.*read/i

- Expected:
/fetch|feature.*evidence|remote.*read/i

+ Received:
"[bkit-prs] unknown flag --ship-entry
"

 ❯ .bkit/core/engine/commands/workflow/prs.test.ts:465:24
    463|     expect(result.code).not.toBe(0);
    464|     expect(result.code).not.toBe(1);
    465|     expect(result.err).toMatch(/fetch|feature.*evidence|remote.*read/i…
       |                        ^
    466|     expect(git(f.cwd, "rev-parse", "HEAD")).toBe(f.mergedHead);
    467|     expect(git(f.cwd, "branch", "--list", "feat/12-x")).toContain("fea…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/prs.test.ts > bkit prs probe ship entry > qualifies MCP merged PR facts against newer feature work without gh
AssertionError: [bkit-prs] unknown flag --ship-entry
: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/prs.test.ts:484:43
    482|     gh.exit("list", 127);
    483|     const unchanged = await shipProbe(f.cwd, "--owner-repo=o/r", `--fa…
    484|     expect(unchanged.code, unchanged.err).toBe(0);
       |                                           ^
    485|     expect(unchanged.json).toMatchObject({ found: true, state: "MERGED…
    486|     fs.writeFileSync(path.join(f.cwd, "mcp-fix.ts"), "export const mcp…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 107 passed (110)
   Start at  17:39:00
   Duration  14.94s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-CdIep1/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/workflows.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/workflows.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/workflows.test.ts

[test-timeout-budget] load average 11.0 on 10 cores: unit limits 10000ms per test, 20000ms per hook (x2.00)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/842-ship-fails-local

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts (158 tests | 4 failed) 39960ms
   ✓ bkit workflows start (18)
     ✓ warns when the previous run for this fid was holey 178ms
     ✓ prints nothing when the previous run is clean, absent, or unreadable 745ms
     ✓ takes the lock and opens run 1 with a workflow-started row carrying HEAD 173ms
     ✓ freezes the workflow's own limits from package.json in the workflow-started row 122ms
     ✓ writes no limits for a workflow with no ask point 115ms
     ✓ does not open a new run when resuming the same workflow's IN_PROGRESS run 101ms
     ✓ resumes the workflow's own IN_PROGRESS run when another workflow's run came after it 123ms
     ✓ start records the chat that runs the workflow (3)
       ✓ writes one session row per chat; a resume in the same chat adds none 112ms
       ✓ a new run in the same chat gets its own session row 101ms
       ✓ writes none outside Claude Code 70ms
     ✓ opens the next run after a finished one, and after another workflow's run 94ms
     ✓ writes workflow-started for ship in the worktree being shipped, its lock in the main checkout 86ms
     ✓ design / plan / build / debug book in the current worktree 83ms
     ✓ refuses when the lock is live, writing no row 54ms
     ✓ --lock-held checks the lock is ours 76ms
     ✓ rejects an unknown workflow 42ms
     ✓ --branch refuses a checkout on another branch (exit 15), writing no row and taking no lock 66ms
     ✓ ship clears stale sentinels beside status.jsonl; other workflows leave them 100ms
   ✓ bkit workflows start — resume facts (5)
     ✓ a new run has no last step and no open decision 57ms
     ✓ a resumed run prints its last DONE step; a closed decision is not open 57ms
     ✓ an OPEN decision of an earlier run never resurfaces 75ms
     ✓ an OPEN decision mid-build prints its header fields 84ms
     ✓ reads Test attempt from a tests pause 55ms
   ✓ bkit workflows fail (19)
     ✓ writes workflow-failed, releases its lock, and reports no handover 86ms
     ✓ writes no row when status.jsonl does not exist 68ms
     ✓ leaves a lock it never got in place (the Step 1 refusal path) 67ms
     ✓ aborts a rebase only when one is in progress 148ms
     ✓ aborts a merge left in progress (ship Step 4's hand-resolution state) 123ms
     ✓ the workflow-failed row survives the rebase abort when status.jsonl is tracked in the rebasing tree 137ms
     ✓ clears .rebase-failed inside the worktree it was created in, and says a handover is due 81ms
     ✓ clears ship's .deferred-blocked in the worktree being shipped 86ms
     ✓ --max-exceeded says a handover is due without any sentinel 66ms
     ✓ without --token changes nothing: the failure came before Step 1 locked 63ms
     ✓ treats empty --fid / --token / --month (placeholders not held yet) as absent 81ms
     ✓ computes the bkit:failed label set; trackerState is null without a Linear or Jira tracker 87ms
     ✓ a failed issue under {"tracker":{"default":"linear"}} moves to review status "In Review" 44ms
     ✓ a failed issue under {"tracker":{"default":"linear","linear":{"review":"Code Review"}}} moves to review status "Code Review" 45ms
     ✓ a failed issue under {"tracker":{"default":"jira"}} moves to review status "In Review" 45ms
     ✓ a failed issue under {"tracker":{"default":"jira","jira":{"review":"QA"}}} moves to review status "QA" 55ms
     ✓ a failed issue under {"tracker":{"default":"github"}} moves to review status null 44ms
     ✓ prints the failure comment from --error-file, naming a lock it could not remove 52ms
     ✓ a debug run in SOAK mode always needs a handover 66ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 150ms
       ✓ counts subagents of an earlier chat the run's session rows name 150ms
       ✓ records no context block, and still closes, outside a Claude Code session 154ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 165ms
     ✓ records ending held and publish false on the workflow-done row 150ms
     ✓ defaults the close row to ending done 156ms
     ✓ refuses an unknown ending 69ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 157ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 152ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 154ms
     ✓ always writes the telemetry, whatever the runtime 144ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 118ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 139ms
     ✓ an unwritable stats path is logged and never fails the close 151ms
     ✓ appends the completeness row before the workflow-done row 156ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 177ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 162ms
     ✓ writes one completeness row per close 253ms
     ✓ leaves out the previous run's rows that share a second with this run's start 156ms
     ✓ still closes when the completeness check throws 169ms
     ✓ still closes when the completeness row write throws 189ms
     ✓ refuses without status.jsonl and writes nothing 70ms
     ✓ ship: run.pr, size of the squash commit, and coverage 204ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 309ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 190ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 164ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 240ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 231ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 273ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 245ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 218ms
     ✓ --record-step writes the close step's row before workflow-done 312ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 255ms
     ✓ --number without --outbox is a usage error 200ms
     ✓ --flush is ship only 94ms
   ✓ bkit workflows handover (23)
     ✓ --push commits and pushes the record on the feature branch without a handover 302ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 278ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 255ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 250ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 203ms
     ✓ --list-stray names untracked and modified paths outside the run's logs, and writes nothing 106ms
     ✓ --list-stray on dev reports shared: true; it refuses --push alongside 101ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 736ms
     ✓ --flush with nothing to record commits and pushes nothing 398ms
     ✓ --flush carries the named worktree's logs into the dev commit 1093ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1398ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 695ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 694ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 705ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1063ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 818ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 606ms
     ✓ --push on dev never carries a row whose references name another feature 582ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 550ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 1041ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 939ms
     ✓ --push commits in the named worktree, not the checkout it runs from 276ms
     ✓ rejects --push with --flush, and --flush outside ship 56ms
   ❯ bkit workflows close --flush (ship) (11)
     × preserves newer feature work when closing an already merged PR 904ms
     × preserves unlanded file deletions and ledger additions on close 849ms
     × preserves dirty work and uncertain branch evidence during close 758ms
     × preserves a local feature ref changed after its cleanup proof 2094ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 863ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 902ms
     ✓ a close that landed releases the lock 922ms
     ✓ removes the worktree before it releases the lock 1087ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 1319ms
       ✓ closePr refuses when the PR base is unknown 1093ms
     ✓ leaves a worktree no workflow created, and its branch, in place 623ms
   ✓ bkit workflows promote (7)
     ✓ --resolve prints the highest versioned draft and copies nothing 52ms
     ✓ exits 12 when there is no versioned draft 55ms
     ✓ archives a changed canonical, then writes the highest draft as the canonical 49ms
     ✓ stamps the anchor from the runtime-resolved base commit 66ms
     ✓ stamps the bkit release, and the outdated warning when a newer one is out 87ms
     ✓ promote copies the plan only 61ms
     ✓ rejects a workflow other than design or plan 57ms
   ✓ bkit workflows links (2)
     ✓ lists the feature's docs and this workflow's logs on the ref, and prints the close comment 109ms
     ✓ names the branch, not the remote-tracking ref, in each URL 93ms
   ✓ --post on fail / links (4)
     ✓ fail --post: needs --step-number; tracker none is skipped, exit unchanged 81ms
     ✓ fail --post writes bkit:failed onto the labels it reads, and the review state 91ms
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 182ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 117ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (6)
     ✓ close with a shared-checkout record never commits a recorded path 330ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 174ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 165ms
     ✓ a second run's record does not let this FID's close commit 213ms
     ✓ record is present after workflows close and before the push 401ms
     ✓ failed handover from dev removes the record and keeps recorded paths 776ms
   ✓ bkit workflows input (7)
     ✓ writes {workflow}-input-{run}.md: the prompt, the description, each human comment dated 59ms
     ✓ the last bkit:ignore-earlier drops every part above it; a comment with no date counts as oldest 59ms
     ✓ a run with no issue holds the prompt alone 57ms
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 129ms
     ✓ --plan is appended when the file exists and skipped when it does not 83ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 122ms
     ✓ a missing prompt file exits 13 58ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 210ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 157ms
     ✓ puts each --line after the summary, in flag order 149ms
     ✓ refuses --final-return without --summary-file 45ms
     ✓ --summary prints the file and keeps a copy in --outbox 151ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 156ms
     ✓ --summary and --summary-file are exclusive; --summary needs --summary-missing 47ms
     ✓ a missing summary file exits 13 before anything is written 48ms
   ✓ --session-dir on fail / close (3)
     ✓ fail deletes the run's session folder 53ms
     ✓ a folder outside the outbox sessions folder is kept 49ms
     ✓ without --session-dir prints no sessionRemoved 48ms
   ✓ bkit workflows summary (10)
     ✓ passes publish into the summary input 20ms
     ✓ summary is FAIL when a plan task is not done 6ms
     ✓ summary is CONCERNS when a deferral was written 6ms
     ✓ a deferral closed later no longer lowers the verdict, while its history stays on disk 5ms
     ✓ recomputes the verdict from resolved work without rewriting the earlier summary event 6ms
     ✓ summary recommends /bkit-debug on FAIL 11ms
     ✓ summary reports the last attempt 5ms
     ✓ summary is CONCERNS when a step recorded CONCERNS 6ms
     ✓ a design summary carries the organised design's open questions 5ms
     ✓ refuses a status file with no run of the workflow, and a missing one 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close --flush (ship) > preserves newer feature work when closing an already merged PR
AssertionError: expected { removed: true, reason: null, …(5) } to match object { Object (removed, branchDeleted) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
-   "branchDeleted": false,
-   "removed": false,
+   "branchDeleted": true,
+   "removed": true,
  }

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:1989:34
    1987|     const result = await run(wt, close);
    1988|     expect(result.code, result.err).toBe(0);
    1989|     expect(result.json.worktree).toMatchObject({ removed: false, branc…
       |                                  ^
    1990|     expect(fs.existsSync(wt)).toBe(true);
    1991|     expect(git(cwd, "rev-parse", `feat/${FID}`)).toBe(newer);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close --flush (ship) > preserves unlanded file deletions and ledger additions on close
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2005:31
    2003|     const result = await run(wt, close);
    2004|     expect(result.code, result.err).toBe(0);
    2005|     expect(fs.existsSync(wt)).toBe(true);
       |                               ^
    2006|     expect(git(cwd, "branch", "--list", `feat/${FID}`)).toContain(`fea…
    2007|     expect(fs.existsSync(path.join(wt, "a.txt"))).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close --flush (ship) > preserves dirty work and uncertain branch evidence during close
AssertionError: expected { removed: true, reason: null, …(5) } to match object { Object (removed, branchDeleted) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
-   "branchDeleted": false,
-   "removed": false,
+   "branchDeleted": true,
+   "removed": true,
  }

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2037:39
    2035|     const dirtyResult = await run(dirty.wt, [...dirty.close, `--token=…
    2036|     expect(dirtyResult.code, dirtyResult.err).toBe(0);
    2037|     expect(dirtyResult.json.worktree).toMatchObject({ removed: false, …
       |                                       ^
    2038|     expect(fs.readFileSync(path.join(dirty.wt, "a.txt"), "utf-8")).toB…
    2039|     expect(fs.readFileSync(path.join(dirty.wt, "untracked.txt"), "utf-…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/workflows.test.ts > bkit workflows close --flush (ship) > preserves a local feature ref changed after its cleanup proof
AssertionError: expected 'refs/heads/feat/12-export-csv' to be '27cf0871fc84b3468616a6f2dcf319007c202…' // Object.is equality

Expected: "27cf0871fc84b3468616a6f2dcf319007c202a53"
Received: "refs/heads/feat/12-export-csv"

 ❯ .bkit/core/engine/commands/workflow/workflows.test.ts:2098:63
    2096|       expect(result.code, result.err).toBe(0);
    2097|       expect(fs.existsSync(racedMarker)).toBe(true);
    2098|       expect(git(cwd, "rev-parse", `refs/heads/feat/${FID}`)).toBe(rac…
       |                                                               ^
    2099|       expect(result.json.worktree.branchDeleted).toBe(false);
    2100|       expect(git(cwd, "show", `feat/${FID}:raced-fix.ts`)).toBe("expor…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 154 passed (158)
   Start at  17:39:17
   Duration  40.49s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-bHo2g9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
