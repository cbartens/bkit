
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (188 tests | 1 failed) 41158ms
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
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 192ms
     ✓ refuses a code conflict and aborts the rebase on the spot 132ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 276ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 128ms
     ✓ produces byte-identical output to merge=union 300ms
     ✓ restores a trailing newline so the next append starts on its own line 178ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 165ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 251ms
     ✓ refuses a union that leaves a line which is not JSON 145ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 202ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 319ms
     ✓ refuses a lockfile whose regenerate command fails 285ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 120ms
     ✓ removes a stale sentinel when the rebase succeeds 172ms
     ✓ exits 4 when no rebase is in progress 47ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 235ms
     ✓ resolves a conflict in each of two replayed commits across rounds 203ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 9ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 28ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 17ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 10ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 9ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 16ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 16ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 17ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 16ms
     ✓ fails closed on an empty --base-sha and writes nothing 0ms
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
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 0ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 0ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 118ms
       ✓ skips (12) with no anchor 120ms
       ✓ skips (12) when the base is unreachable in this clone 133ms
       ✓ skips (12) when nothing landed since the base 128ms
       ✓ runs (0) with the landed path count once dev moved 240ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 130ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 279ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 164ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 210ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 391ms
     ✓ runs exactly one git push 585ms
     ✓ --set-upstream records the upstream 187ms
     ✓ refuses with no branch checked out 151ms
     ✓ --mode=dev refuses a feature checkout 135ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 300ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 161ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 296ms
     ✓ --mode=abort pushes when the branch has no open PR 304ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 275ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 136ms
     ✓ --open-pr carries the MCP answer and skips gh 182ms
     ✓ --mode=abort on dev pushes plainly without probing 184ms
     ✓ rejects an unknown mode 134ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 389ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 299ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 339ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 914ms
     ✓ skip-ci HEAD on the replay is refused 219ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 400ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 787ms
     ✓ a level local dev is a plain push, recording nothing extra 285ms
     ✓ a record with no commits pushes nothing 208ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 145ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 557ms
     ✓ a rewritten branch is refused, never forced 209ms
     ✓ refuses dev and main with exit 21 and pushes nothing 139ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 343ms
     ✓ refuses a detached HEAD (exit 5) 144ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 252ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 239ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 238ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 281ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 155ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 329ms
     ✓ an up-to-date branch is a no-op 206ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 332ms
     ✓ a fetch that fails exits 10 147ms
   ❯ branches scan-diff (23)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 197ms
     ✓ --paths with no match exits 1 166ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 131ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 236ms
     ✓ --marker reads a diff over 1 MiB 200ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 219ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 201ms
     ✓ scan-diff finds an added skip 204ms
     ✓ scan-diff ignores a skip predating the base 180ms
     ✓ scan-diff reports a disabled test with its line 202ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 185ms
     ✓ scan-diff ignores a removed comment in a test file 183ms
     ✓ scan-diff ignores an assertion moved within the file 180ms
     ✓ scan-diff still reports a removed assertion 181ms
     ✓ scan-diff finds an added pytest mark skip 210ms
     ✓ scan-diff finds an added unittest skip 180ms
     ✓ scan-diff finds an added bare skip call 183ms
     ✓ scan-diff ignores a quoted skip in a documentation file 185ms
     ✓ scan-diff ignores a marker literal in a non-test source file 189ms
     ✓ scan-diff ignores an assertion whose expectation changed 182ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 180ms
     × scan-diff reports a deleted test file 199ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 142ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 408ms
     ✓ a title that already carries the marker is left alone 394ms
     ✓ with no open PR: pushes the marker commit and edits no title 368ms
     ✓ a re-run is deduped: no second marker commit 405ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 437ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 141ms
     ✓ --title-set skips gh entirely 198ms
     ✓ refuses dev and main (exit 21) 109ms
   ✓ branches sync (10)
     ✓ Path A when origin/dev is an ancestor of HEAD 179ms
     ✓ Path B once dev moved; --head checks a given commit 272ms
     ✓ --merge-docs merges dev when docs/ is behind 298ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 280ms
     ✓ --merge-docs never merges on dev itself 247ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 371ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 361ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 331ms
     ✓ exits 10 when the fetch fails 150ms
     ✓ refuses --merge-docs with --head, and an unknown --head 162ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 302ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 483ms
     ✓ a failed install stops ship (16) 434ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 320ms
     ✓ exits 10 when the fetch fails 237ms
   ✓ branches land (23)
     ✓ refuses a workflow other than design or plan 116ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 227ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 557ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 554ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 540ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 559ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1325ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1532ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 277ms
     ✓ local: names unpushed dev as the cause when the branch carries it 325ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 337ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 751ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 779ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 674ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 511ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 843ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 677ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 516ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 716ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 564ms
     ✓ landPr refuses a main-based PR without retrying 483ms
     ✓ landPr refuses when the PR base is unknown 491ms
     ✓ PR not open (closed): stops (17) at once, no retry 576ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff reports a deleted test file
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1796:20
    1794|     commit(clone, {}, "rm");
    1795|     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disab…
    1796|     expect(r.code).toBe(1);
       |                    ^
    1797|     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 2…
    1798|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 187 passed (188)
   Start at  11:03:37
   Duration  41.49s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-zDfRsm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
