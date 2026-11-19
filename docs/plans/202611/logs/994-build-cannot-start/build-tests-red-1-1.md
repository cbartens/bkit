Enforced: true
Red: 9
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/994-build-cannot-start-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "classifies only the feature's own plan files as the plan-log shape" | red | failure: expected 'refuse' to be 'planlog' // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "takes the rebase target's copy of a plan log both sides added, and completes the rebase" | red | failure: expected 3 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "takes the target's copy in each round when the branch changed the plan log in a later commit" | red | failure: expected 3 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass" | red | failure: expected 3 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses another feature's plan log and names the rule in the reason" | red | failure: expected 'not an append-only ledger, a recognis…' to contain 'plan file of this feature' |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "refuses a code conflict beside the plan logs, leaving the plan log unresolved" | red | failure: expected { outcome: 'refused', …(8) } to match object { outcome: 'refused', …(2) } (6 matching properties omitted from actual) |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "gives a branch not named feat/{fid} no plan-log rule" | red | failure: expected 'not an append-only ledger, a recognis…' to contain 'plan file of this feature' |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts" | red | failure: [bkit-branches] REFUSE docs/plans/202610/logs/42-thing/plan-v2-reviewed.md — not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record; routing to Failure Path [bkit-branches] ABORTED — git rebase --abort restored the branch : expected 3 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "a code conflict beside the plan logs still stops the start, and the reason names the rule" | red | failure: expected 'not an append-only ledger, a recognis…' to contain 'plan file of this feature' |

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

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (295 tests | 7 failed) 108984ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 166ms
     ✓ rejects missing explicit and ambiguous existing branch selections 146ms
   ❯ branches rebase: classification (32)
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
     × classifies only the feature's own plan files as the plan-log shape 5ms
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
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 49ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 237ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 255ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 171ms
     ✓ a refused --continue carries git's own reason 219ms
     ✓ --file records nothing for a refused rebase 161ms
     ✓ refuses a code conflict and aborts the rebase on the spot 180ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 330ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 168ms
     ✓ produces byte-identical output to merge=union 399ms
     ✓ restores a trailing newline so the next append starts on its own line 241ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 226ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 334ms
     ✓ refuses a union that leaves a line which is not JSON 193ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 263ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 404ms
     ✓ refuses a lockfile whose regenerate command fails 350ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 363ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 349ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 333ms
     ✓ refuses and aborts when both sides changed the hand-written region 203ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 234ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 330ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 366ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 206ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 262ms
     ✓ refuses and aborts when a side deleted the install record 201ms
     ✓ refuses a conflicted doc the repo's script does not list 183ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 176ms
     ✓ removes a stale sentinel when the rebase succeeds 245ms
     ✓ exits 4 when no rebase is in progress 64ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 325ms
     ✓ resolves a conflict in each of two replayed commits across rounds 265ms
   ❯ branches rebase: plan-closed branch with a leftover push (6)
     × takes the rebase target's copy of a plan log both sides added, and completes the rebase 179ms
     × takes the target's copy in each round when the branch changed the plan log in a later commit 195ms
     × settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass 184ms
     × refuses another feature's plan log and names the rule in the reason 183ms
     × refuses a code conflict beside the plan logs, leaving the plan log unresolved 189ms
     × gives a branch not named feat/{fid} no plan-log rule 172ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 12ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 37ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 20ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 13ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 12ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 26ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 22ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 22ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 22ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 0ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 22ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 0ms
     ✓ stampAnchor: empty file 0ms
     ✓ stampAnchor: no trailing newline (kept as-is) 0ms
     ✓ stampAnchor: two blocks (both removed) 0ms
     ✓ stampAnchor: close on the line after open (body line kept) 0ms
     ✓ stampAnchor: inline lookalike marker is not a block 0ms
     ✓ stampAnchor: empty field block 0ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 21ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 152ms
       ✓ skips (12) with no anchor 149ms
       ✓ skips (12) when the base is unreachable in this clone 165ms
       ✓ skips (12) when nothing landed since the base 163ms
       ✓ runs (0) with the landed path count once dev moved 297ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 161ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 322ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 197ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 258ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 479ms
     ✓ runs exactly one git push 621ms
     ✓ --set-upstream records the upstream 222ms
     ✓ refuses with no branch checked out 176ms
     ✓ --mode=dev refuses a feature checkout 166ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 434ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 660ms
     ✓ --require-ci pushes as-is when dev has not moved 274ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 486ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 726ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 190ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 371ms
     ✓ --mode=abort pushes when the branch has no open PR 423ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 351ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 163ms
     ✓ --open-pr carries the MCP answer and skips gh 227ms
     ✓ --mode=abort on dev pushes plainly without probing 229ms
     ✓ rejects an unknown mode 161ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 719ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 379ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 439ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1307ms
     ✓ skip-ci HEAD on the replay is refused 304ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 723ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 1191ms
     ✓ a level local dev is a plain push, recording nothing extra 360ms
     ✓ a record with no commits pushes nothing 273ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 180ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 645ms
     ✓ a rewritten branch is refused, never forced 263ms
     ✓ refuses dev and main with exit 21 and pushes nothing 171ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 418ms
     ✓ refuses a detached HEAD (exit 5) 176ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 367ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 347ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 343ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 431ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 180ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 404ms
     ✓ an up-to-date branch is a no-op 261ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 440ms
     ✓ a fetch that fails exits 10 195ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 233ms
     ✓ scan-diff still reports a new skip when its test … 229ms
     ✓ scan-diff reports a skip moved onto a different t… 224ms
     ✓ scan-diff does not cancel a skip moved between am… 223ms
     ✓ scan-diff does not spend an unchanged duplicate t… 229ms
     ✓ scan-diff recognizes a renamed test file 228ms
     ✓ scan-diff recognizes a suite moved into a differe… 230ms
     ✓ scan-diff does not let unrelated additions hide a… 223ms
     ✓ scan-diff attributes deletion to its old test ins… 224ms
     ✓ scan-diff consumes each moved assertion once and … 229ms
     ✓ scan-diff does not match identical assertions fro… 226ms
     ✓ scan-diff does not match the same leaf test name … 230ms
     ✓ scan-diff does not match a same-named test with d… 227ms
     ✓ scan-diff does not match a same-named test with c… 231ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 230ms
     ✓ --paths with no match exits 1 206ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 161ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 306ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 307ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 211ms
     ✓ --marker reads a diff over 1 MiB 240ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 286ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 245ms
     ✓ scan-diff finds an added skip 252ms
     ✓ scan-diff ignores a skip predating the base 225ms
     ✓ scan-diff reports a disabled test with its line 256ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 228ms
     ✓ scan-diff ignores a removed comment in a test file 226ms
     ✓ scan-diff ignores an assertion moved within the file 224ms
     ✓ scan-diff still reports a removed assertion 232ms
     ✓ scan-diff reports an assertion re-added only outside the test file 237ms
     ✓ scan-diff finds an added pytest mark skip 248ms
     ✓ scan-diff finds an added unittest skip 227ms
     ✓ scan-diff finds an added bare skip call 221ms
     ✓ scan-diff ignores a quoted skip in a documentation file 227ms
     ✓ scan-diff ignores a marker literal in a non-test source file 249ms
     ✓ scan-diff ignores an assertion whose expectation changed 227ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 224ms
     ✓ scan-diff reports a deleted test file 231ms
     ✓ scan-diff never opens a symlinked test file's outside target 1ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 173ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 558ms
     ✓ a title that already carries the marker is left alone 491ms
     ✓ with no open PR: pushes the marker commit and edits no title 502ms
     ✓ a re-run is deduped: no second marker commit 604ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 659ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 193ms
     ✓ --title-set skips gh entirely 306ms
     ✓ refuses dev and main (exit 21) 145ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 611ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 1115ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 613ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1310ms
     ✓ continues only the explicitly recorded target through the public merge command 907ms
     ✓ fetches the unseen feature head before classifying the base 603ms
     ✓ fast forwards the feature before either base path is chosen 1277ms
     ✓ merges divergent feature tips without rebasing either side 775ms
     ✓ continues the feature merge before starting a dev merge 1240ms
     ✓ publishes local code with a CI running head before bookkeeping 1404ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 1914ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1182ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 807ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 226ms
     ✓ Path B once dev moved; --head checks a given commit 335ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 335ms
     ✓ --merge-docs merges dev when docs/ is behind 400ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 387ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 562ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 557ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 471ms
     ✓ --merge-docs skips an empty bkit:generate script 412ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 356ms
     ✓ --merge-docs never merges on dev itself 313ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 454ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 492ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 448ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 452ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 245ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 579ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 638ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 712ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 634ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 604ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 735ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 529ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 632ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 428ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 299ms
     ✓ exits 10 when the fetch fails 186ms
     ✓ refuses --merge-docs with --head, and an unknown --head 214ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 430ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 600ms
     ✓ a failed install stops ship (16) 528ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 414ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 389ms
     ✓ exits 10 when the fetch fails 288ms
   ✓ shared landed comparison (7)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 211ms
     ✓ preserves unlanded file type changes in the shared landed comparison 212ms
     ✓ a later dev commit on the same file does not turn a landed branch back into unlanded 461ms
     ✓ names only the file whose branch version never reached dev 490ms
     ✓ a deleted file that dev deleted and a later commit re-added counts as landed 474ms
     ✓ names a path under a directory named : when dev deleted, re-added and later edited the top-level file 554ms
     ✓ a path under a directory named : that dev never touched is not reported landed 233ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 156ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 213ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1145ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1118ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1029ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1000ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2107ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 3071ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 411ms
     ✓ local: names unpushed dev as the cause when the branch carries it 613ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 447ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1739ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1223ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 886ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4155ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 877ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1054ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 950ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 653ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1600ms
     ✓ land removes the worktree when only the copied .env is untracked 1037ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 973ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1004ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1758ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 994ms
     ✓ landPr refuses a main-based PR without retrying 540ms
     ✓ landPr refuses when the PR base is unknown 548ms
     ✓ PR not open (closed): stops (17) at once, no retry 650ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 386ms
     ✓ --attempt names the merge round in a fix commit 367ms
     ✓ commits a rewritten and a deleted tracked file 362ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 307ms
     ✓ reports undeclared and runs nothing with no scripts 223ms
     ✓ reports undeclared and runs nothing with an empty script 221ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 275ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 325ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 241ms
   ✓ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 309ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 283ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 302ms
     ✓ scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 325ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: classification > classifies only the feature's own plan files as the plan-log shape
AssertionError: expected 'refuse' to be 'planlog' // Object.is equality

Expected: "planlog"
Received: "refuse"

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:305:71
    303|     const none = new Map<string, string>();
    304|     const own = `docs/plans/202611/logs/${fid}`;
    305|     expect(classifyConflict(`${own}/plan-v2-reviewed.md`, none, fid)).…
       |                                                                       ^
    306|     expect(classifyConflict(`${own}/deep/er/notes.md`, none, fid)).toB…
    307|     expect(classifyConflict(`docs/plans/202611/${fid}-plan.md`, none, …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > takes the rebase target's copy of a plan log both sides added, and completes the rebase
AssertionError: expected 3 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 3

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1062:22
    1060|       });
    1061|       const r = await run(dir, ["rebase"]);
    1062|       expect(r.code).toBe(0);
       |                      ^
    1063|       expect(r.json).toMatchObject({
    1064|         outcome: "resolved",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > takes the target's copy in each round when the branch changed the plan log in a later commit
AssertionError: expected 3 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 3

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1081:22
    1079|       );
    1080|       const r = await run(dir, ["rebase"]);
    1081|       expect(r.code).toBe(0);
       |                      ^
    1082|       expect(r.json).toMatchObject({ outcome: "resolved", refused: nul…
    1083|       expect(read(dir, PC_LOG)).toBe("dev copy\n");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > settles the feature's plan file on the target's copy and still unions status.jsonl in the same pass
AssertionError: expected 3 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 3

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1096:22
    1094|       );
    1095|       const r = await run(dir, ["rebase"]);
    1096|       expect(r.code).toBe(0);
       |                      ^
    1097|       expect(r.json).toMatchObject({ outcome: "resolved", refused: nul…
    1098|       expect(r.json?.resolved).toEqual(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > refuses another feature's plan log and names the rule in the reason
AssertionError: expected 'not an append-only ledger, a recognis…' to contain 'plan file of this feature'

Expected: "plan file of this feature"
Received: "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record"

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1121:30
    1119|       expect(r.code).toBe(3);
    1120|       expect(r.json).toMatchObject({ outcome: "refused", refused: othe…
    1121|       expect(r.json?.reason).toContain(PC_RULE);
       |                              ^
    1122|       expect(inRebase(dir)).toBe(false);
    1123|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > refuses a code conflict beside the plan logs, leaving the plan log unresolved
AssertionError: expected { outcome: 'refused', …(8) } to match object { outcome: 'refused', …(2) }
(6 matching properties omitted from actual)

- Expected
+ Received

  {
    "aborted": true,
    "outcome": "refused",
-   "refused": "src.txt",
+   "refused": "docs/plans/202611/logs/994-x/plan-v2-reviewed.md",
  }

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1134:22
    1132|       const r = await run(dir, ["rebase"]);
    1133|       expect(r.code).toBe(3);
    1134|       expect(r.json).toMatchObject({ outcome: "refused", refused: "src…
       |                      ^
    1135|       expect(r.json?.resolved).toEqual([]);
    1136|       expect(r.json?.reason).toContain(PC_RULE);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches rebase: plan-closed branch with a leftover push > gives a branch not named feat/{fid} no plan-log rule
AssertionError: expected 'not an append-only ledger, a recognis…' to contain 'plan file of this feature'

Expected: "plan file of this feature"
Received: "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record"

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1148:30
    1146|       expect(r.code).toBe(3);
    1147|       expect(r.json).toMatchObject({ outcome: "refused", refused: PC_L…
    1148|       expect(r.json?.reason).toContain(PC_RULE);
       |                              ^
    1149|       expect(inRebase(dir)).toBe(false);
    1150|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 288 passed (295)
   Start at  20:17:25
   Duration  109.27s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8JkQG7/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/994-build-cannot-start

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (67 tests | 2 failed) 62262ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 978ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 6132ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 781ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 624ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 635ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 739ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1056ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 1270ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 693ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 566ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 171ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 561ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 517ms
     ✓ design installs dependencies like build and debug 566ms
     ✓ plan installs dependencies like build and debug 566ms
     ✓ design stops on a failed install (5) 577ms
     ✓ plan stops on a failed install (5) 560ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 541ms
     ✓ tracks origin/feat/{fid} when only the remote has it 705ms
     ✓ fails without minting when origin cannot be reached 84ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 580ms
     ✓ reports a package manager that could not run (127) apart from a failed install 627ms
   ❯ bkit worktrees setup — mint (resume) (36)
     ✓ rebases onto origin/dev and clears a stale sentinel 1001ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 1581ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 1561ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 1145ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 1218ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 1207ms
     ❯ a plan-closed branch with a leftover push (2)
       × a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts 1179ms
       × a code conflict beside the plan logs still stops the start, and the reason names the rule 1263ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 847ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 915ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 966ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 965ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1121ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1057ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1271ms
     ✓ commits leftovers when a copy entry points outside the checkout 1451ms
     ✓ never commits the entries setup copies in from the main checkout 1082ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1086ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 440ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 436ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 595ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 601ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 595ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 585ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 804ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 934ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1123ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 566ms
     ✓ leaves a clean worktree's history alone 1031ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1255ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 1508ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 1545ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 1642ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 1723ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 1571ms
     ✓ does not mark a resumed worktree it did not create 689ms
   ✓ bkit worktrees setup — a host-made worktree on feat/{fid} (2)
     ✓ plan from a host-made worktree on feat/{fid} adopts it without rebasing 349ms
     ✓ refuses plan from a host-made worktree whose branch carries unpushed dev work 336ms
   ✓ bkit worktrees setup — the unpushed-dev check reads the checked-out branch as a branch (2)
     ✓ adopts plan on a branch named like a top-level path that carries no unpushed dev work 200ms
     ✓ refuses plan on a branch whose name starts with a dash and leaves the file that name points at untouched 160ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 140ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 515ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 759ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 932ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 629ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.integration.test.ts > bkit worktrees setup — mint (resume) > a plan-closed branch with a leftover push > a plan-closed branch with a leftover push: branches rebase keeps dev's copy and setup then starts
AssertionError: [bkit-branches] REFUSE docs/plans/202610/logs/42-thing/plan-v2-reviewed.md — not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record; routing to Failure Path
[bkit-branches] ABORTED — git rebase --abort restored the branch
: expected 3 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 3

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:720:41
    718|
    719|       const rebased = await branchesRebase(wtOf(f));
    720|       expect(rebased.code, rebased.err).toBe(0);
       |                                         ^
    721|       expect(rebased.json).toMatchObject({
    722|         outcome: "resolved",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.integration.test.ts > bkit worktrees setup — mint (resume) > a plan-closed branch with a leftover push > a code conflict beside the plan logs still stops the start, and the reason names the rule
AssertionError: expected 'not an append-only ledger, a recognis…' to contain 'plan file of this feature'

Expected: "plan file of this feature"
Received: "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record"

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:748:35
    746|       expect(rebased.code).toBe(3);
    747|       expect(rebased.json).toMatchObject({ outcome: "refused", refused…
    748|       expect(rebased.json.reason).toContain(RULE);
       |                                   ^
    749|       expect(fs.existsSync(stopped.json.sentinel)).toBe(true);
    750|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 65 passed (67)
   Start at  20:19:15
   Duration  62.47s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OyoFrG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
