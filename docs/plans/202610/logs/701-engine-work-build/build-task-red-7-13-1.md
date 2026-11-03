
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (180 tests | 2 failed) 41867ms
   ✓ branches rebase: classification (27)
     ✓ ledger list does not drift from .gitattributes merge=union 2ms
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
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 187ms
     ✓ refuses a code conflict and aborts the rebase on the spot 131ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 539ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 124ms
     ✓ produces byte-identical output to merge=union 304ms
     ✓ restores a trailing newline so the next append starts on its own line 179ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 168ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 246ms
     ✓ refuses a union that leaves a line which is not JSON 141ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 197ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 554ms
     ✓ refuses a lockfile whose regenerate command fails 333ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 123ms
     ✓ removes a stale sentinel when the rebase succeeds 179ms
     ✓ exits 4 when no rebase is in progress 47ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 229ms
     ✓ resolves a conflict in each of two replayed commits across rounds 202ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 9ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 26ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 17ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 10ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 9ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 17ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 16ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 15ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 16ms
     ✓ fails closed on an empty --base-sha and writes nothing 0ms
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
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 0ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 0ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 118ms
       ✓ skips (12) with no anchor 117ms
       ✓ skips (12) when the base is unreachable in this clone 153ms
       ✓ skips (12) when nothing landed since the base 128ms
       ✓ runs (0) with the landed path count once dev moved 240ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 127ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 254ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 162ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 206ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 637ms
     ✓ runs exactly one git push 546ms
     ✓ --set-upstream records the upstream 184ms
     ✓ refuses with no branch checked out 140ms
     ✓ --mode=dev refuses a feature checkout 137ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 314ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 152ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 596ms
     ✓ --mode=abort pushes when the branch has no open PR 301ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 266ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 135ms
     ✓ --open-pr carries the MCP answer and skips gh 180ms
     ✓ --mode=abort on dev pushes plainly without probing 189ms
     ✓ rejects an unknown mode 133ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 378ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 299ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 332ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 1113ms
     ✓ skip-ci HEAD on the replay is refused 218ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 388ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 929ms
     ✓ a level local dev is a plain push, recording nothing extra 283ms
     ✓ a record with no commits pushes nothing 203ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 147ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 577ms
     ✓ a rewritten branch is refused, never forced 223ms
     ✓ refuses dev and main with exit 21 and pushes nothing 136ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 331ms
     ✓ refuses a detached HEAD (exit 5) 177ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 265ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 240ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 239ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 273ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 153ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 329ms
     ✓ an up-to-date branch is a no-op 204ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 333ms
     ✓ a fetch that fails exits 10 148ms
   ❯ branches scan-diff (15)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 188ms
     ✓ --paths with no match exits 1 166ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 129ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 239ms
     ✓ --marker reads a diff over 1 MiB 194ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 218ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 192ms
     ✓ scan-diff finds an added skip 200ms
     ✓ scan-diff ignores a skip predating the base 177ms
     ✓ scan-diff reports a disabled test with its line 205ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 182ms
     × scan-diff ignores a removed comment in a test file 182ms
     × scan-diff ignores an assertion moved within the file 180ms
     ✓ scan-diff still reports a removed assertion 185ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 139ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 720ms
     ✓ a title that already carries the marker is left alone 365ms
     ✓ with no open PR: pushes the marker commit and edits no title 354ms
     ✓ a re-run is deduped: no second marker commit 387ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 432ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 141ms
     ✓ --title-set skips gh entirely 199ms
     ✓ refuses dev and main (exit 21) 116ms
   ✓ branches sync (10)
     ✓ Path A when origin/dev is an ancestor of HEAD 179ms
     ✓ Path B once dev moved; --head checks a given commit 273ms
     ✓ --merge-docs merges dev when docs/ is behind 295ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 274ms
     ✓ --merge-docs never merges on dev itself 242ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 355ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 361ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 326ms
     ✓ exits 10 when the fetch fails 149ms
     ✓ refuses --merge-docs with --head, and an unknown --head 163ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 298ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 482ms
     ✓ a failed install stops ship (16) 435ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 304ms
     ✓ exits 10 when the fetch fails 234ms
   ✓ branches land (23)
     ✓ refuses a workflow other than design or plan 114ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 222ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 558ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 597ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 543ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 556ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1487ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1428ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 274ms
     ✓ local: names unpushed dev as the cause when the branch carries it 322ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 352ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1240ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 761ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 741ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 497ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 779ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 780ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 517ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 722ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 545ms
     ✓ landPr refuses a main-based PR without retrying 488ms
     ✓ landPr refuses when the PR base is unknown 486ms
     ✓ PR not open (closed): stops (17) at once, no retry 610ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff ignores a removed comment in a test file
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1617:20
    1615|     commit(clone, {}, "comment gone");
    1616|     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disab…
    1617|     expect(r.code).toBe(0);
       |                    ^
    1618|     expect(r.json?.disabled).toEqual([]);
    1619|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff ignores an assertion moved within the file
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1655:20
    1653|     commit(clone, {}, "move");
    1654|     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disab…
    1655|     expect(r.code).toBe(0);
       |                    ^
    1656|     expect(r.json?.disabled).toEqual([]);
    1657|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 178 passed (180)
   Start at  08:36:29
   Duration  42.19s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-vbbfzG/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
