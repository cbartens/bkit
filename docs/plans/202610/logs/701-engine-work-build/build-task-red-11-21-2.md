
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (187 tests | 2 failed) 40897ms
   ✓ branches rebase: classification (27)
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
   ✓ branches rebase: behaviour (17)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 193ms
     ✓ refuses a code conflict and aborts the rebase on the spot 134ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 275ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 123ms
     ✓ produces byte-identical output to merge=union 297ms
     ✓ restores a trailing newline so the next append starts on its own line 174ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 164ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 247ms
     ✓ refuses a union that leaves a line which is not JSON 145ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 194ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 335ms
     ✓ refuses a lockfile whose regenerate command fails 288ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 134ms
     ✓ removes a stale sentinel when the rebase succeeds 176ms
     ✓ exits 4 when no rebase is in progress 48ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 238ms
     ✓ resolves a conflict in each of two replayed commits across rounds 204ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 10ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 26ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 17ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 9ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 8ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 17ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 16ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 16ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 16ms
     ✓ fails closed on an empty --base-sha and writes nothing 0ms
     ✓ fails closed on a missing file 0ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 17ms
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
       ✓ skips (12) with no plan file 122ms
       ✓ skips (12) with no anchor 122ms
       ✓ skips (12) when the base is unreachable in this clone 131ms
       ✓ skips (12) when nothing landed since the base 137ms
       ✓ runs (0) with the landed path count once dev moved 239ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 136ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 259ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 163ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 204ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 428ms
     ✓ runs exactly one git push 546ms
     ✓ --set-upstream records the upstream 186ms
     ✓ refuses with no branch checked out 147ms
     ✓ --mode=dev refuses a feature checkout 142ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 302ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 150ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 291ms
     ✓ --mode=abort pushes when the branch has no open PR 305ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 284ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 135ms
     ✓ --open-pr carries the MCP answer and skips gh 182ms
     ✓ --mode=abort on dev pushes plainly without probing 183ms
     ✓ rejects an unknown mode 132ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 397ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 295ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 339ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 915ms
     ✓ skip-ci HEAD on the replay is refused 217ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 387ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 790ms
     ✓ a level local dev is a plain push, recording nothing extra 277ms
     ✓ a record with no commits pushes nothing 206ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 149ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 572ms
     ✓ a rewritten branch is refused, never forced 212ms
     ✓ refuses dev and main with exit 21 and pushes nothing 138ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 339ms
     ✓ refuses a detached HEAD (exit 5) 139ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 257ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 233ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 231ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 271ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 153ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 328ms
     ✓ an up-to-date branch is a no-op 210ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 334ms
     ✓ a fetch that fails exits 10 146ms
   ❯ branches scan-diff (22)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 191ms
     ✓ --paths with no match exits 1 165ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 130ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 237ms
     ✓ --marker reads a diff over 1 MiB 189ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 219ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 197ms
     ✓ scan-diff finds an added skip 208ms
     ✓ scan-diff ignores a skip predating the base 188ms
     ✓ scan-diff reports a disabled test with its line 200ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 186ms
     ✓ scan-diff ignores a removed comment in a test file 185ms
     ✓ scan-diff ignores an assertion moved within the file 182ms
     ✓ scan-diff still reports a removed assertion 181ms
     ✓ scan-diff finds an added pytest mark skip 200ms
     ✓ scan-diff finds an added unittest skip 190ms
     ✓ scan-diff finds an added bare skip call 186ms
     ✓ scan-diff ignores a quoted skip in a documentation file 185ms
     ✓ scan-diff ignores a marker literal in a non-test source file 184ms
     × scan-diff ignores an assertion whose expectation changed 189ms
     × scan-diff ignores an assertion replaced by another in the same test 184ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 153ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 417ms
     ✓ a title that already carries the marker is left alone 347ms
     ✓ with no open PR: pushes the marker commit and edits no title 357ms
     ✓ a re-run is deduped: no second marker commit 401ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 442ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 142ms
     ✓ --title-set skips gh entirely 197ms
     ✓ refuses dev and main (exit 21) 112ms
   ✓ branches sync (10)
     ✓ Path A when origin/dev is an ancestor of HEAD 183ms
     ✓ Path B once dev moved; --head checks a given commit 271ms
     ✓ --merge-docs merges dev when docs/ is behind 294ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 277ms
     ✓ --merge-docs never merges on dev itself 245ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 345ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 362ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 330ms
     ✓ exits 10 when the fetch fails 158ms
     ✓ refuses --merge-docs with --head, and an unknown --head 161ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 299ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 473ms
     ✓ a failed install stops ship (16) 427ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 309ms
     ✓ exits 10 when the fetch fails 228ms
   ✓ branches land (23)
     ✓ refuses a workflow other than design or plan 115ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 220ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 565ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 544ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 543ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 559ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1348ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1532ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 288ms
     ✓ local: names unpushed dev as the cause when the branch carries it 330ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 346ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 742ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 796ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 669ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 495ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 769ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 784ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 524ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 722ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 552ms
     ✓ landPr refuses a main-based PR without retrying 489ms
     ✓ landPr refuses when the PR base is unknown 494ms
     ✓ PR not open (closed): stops (17) at once, no retry 560ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff ignores an assertion whose expectation changed
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1762:20
    1760|     commit(clone, {}, "tighten");
    1761|     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disab…
    1762|     expect(r.code).toBe(0);
       |                    ^
    1763|     expect(r.json?.disabled).toEqual([]);
    1764|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff ignores an assertion replaced by another in the same test
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1781:20
    1779|     commit(clone, {}, "replace");
    1780|     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disab…
    1781|     expect(r.code).toBe(0);
       |                    ^
    1782|     expect(r.json?.disabled).toEqual([]);
    1783|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 185 passed (187)
   Start at  11:01:49
   Duration  41.23s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-m3ggep/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
