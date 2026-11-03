
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/701-engine-work-build

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (177 tests | 4 failed) 39676ms
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
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 182ms
     ✓ refuses a code conflict and aborts the rebase on the spot 128ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 276ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 121ms
     ✓ produces byte-identical output to merge=union 294ms
     ✓ restores a trailing newline so the next append starts on its own line 170ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 161ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 234ms
     ✓ refuses a union that leaves a line which is not JSON 138ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 183ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 317ms
     ✓ refuses a lockfile whose regenerate command fails 276ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 116ms
     ✓ removes a stale sentinel when the rebase succeeds 179ms
     ✓ exits 4 when no rebase is in progress 46ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 235ms
     ✓ resolves a conflict in each of two replayed commits across rounds 192ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 9ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 25ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 17ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 10ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 8ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 16ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 16ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 16ms
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
       ✓ skips (12) with no plan file 113ms
       ✓ skips (12) with no anchor 119ms
       ✓ skips (12) when the base is unreachable in this clone 130ms
       ✓ skips (12) when nothing landed since the base 126ms
       ✓ runs (0) with the landed path count once dev moved 229ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 122ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (17)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 244ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 150ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 204ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 394ms
     ✓ runs exactly one git push 641ms
     ✓ --set-upstream records the upstream 174ms
     ✓ refuses with no branch checked out 135ms
     ✓ --mode=dev refuses a feature checkout 132ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 299ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 149ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 290ms
     ✓ --mode=abort pushes when the branch has no open PR 306ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 296ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 133ms
     ✓ --open-pr carries the MCP answer and skips gh 173ms
     ✓ --mode=abort on dev pushes plainly without probing 173ms
     ✓ rejects an unknown mode 125ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 367ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 284ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 327ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 928ms
     ✓ skip-ci HEAD on the replay is refused 210ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 378ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 868ms
     ✓ a level local dev is a plain push, recording nothing extra 272ms
     ✓ a record with no commits pushes nothing 199ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 138ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 661ms
     ✓ a rewritten branch is refused, never forced 214ms
     ✓ refuses dev and main with exit 21 and pushes nothing 131ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 330ms
     ✓ refuses a detached HEAD (exit 5) 139ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 242ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 226ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 227ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 276ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 145ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 315ms
     ✓ an up-to-date branch is a no-op 199ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 331ms
     ✓ a fetch that fails exits 10 148ms
   ❯ branches scan-diff (12)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 181ms
     ✓ --paths with no match exits 1 163ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 129ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 246ms
     ✓ --marker reads a diff over 1 MiB 204ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 243ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 190ms
     × scan-diff finds an added skip 164ms
     × scan-diff ignores a skip predating the base 167ms
     × scan-diff reports a disabled test with its line 163ms
     × scan-diff exits 0 on a diff that adds no disabled test 159ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 139ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 413ms
     ✓ a title that already carries the marker is left alone 353ms
     ✓ with no open PR: pushes the marker commit and edits no title 363ms
     ✓ a re-run is deduped: no second marker commit 387ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 422ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 136ms
     ✓ --title-set skips gh entirely 193ms
     ✓ refuses dev and main (exit 21) 110ms
   ✓ branches sync (10)
     ✓ Path A when origin/dev is an ancestor of HEAD 185ms
     ✓ Path B once dev moved; --head checks a given commit 266ms
     ✓ --merge-docs merges dev when docs/ is behind 283ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 264ms
     ✓ --merge-docs never merges on dev itself 238ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 331ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 335ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 371ms
     ✓ exits 10 when the fetch fails 146ms
     ✓ refuses --merge-docs with --head, and an unknown --head 172ms
   ✓ branches sync-dev (5)
     ✓ fast-forwards local dev without checking it out 290ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 466ms
     ✓ a failed install stops ship (16) 422ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 305ms
     ✓ exits 10 when the fetch fails 237ms
   ✓ branches land (23)
     ✓ refuses a workflow other than design or plan 116ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 158ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 536ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 536ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 526ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 531ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1418ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1530ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 267ms
     ✓ local: names unpushed dev as the cause when the branch carries it 308ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 326ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 727ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 797ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 786ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 478ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 889ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 789ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 598ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 688ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 535ms
     ✓ landPr refuses a main-based PR without retrying 609ms
     ✓ landPr refuses when the PR base is unknown 1231ms
     ✓ PR not open (closed): stops (17) at once, no retry 628ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff finds an added skip
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1576:20
    1574|     );
    1575|     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--d…
    1576|     expect(r.code).toBe(1);
       |                    ^
    1577|   });
    1578|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff ignores a skip predating the base
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1584:20
    1582|     commit(clone, { "src/b.ts": "b\n" }, "other");
    1583|     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disab…
    1584|     expect(r.code).toBe(0);
       |                    ^
    1585|   });
    1586|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff reports a disabled test with its line
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1603:20
    1601|     );
    1602|     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--d…
    1603|     expect(r.code).toBe(1);
       |                    ^
    1604|     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 4…
    1605|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff > scan-diff exits 0 on a diff that adds no disabled test
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:1615:20
    1613|     );
    1614|     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--d…
    1615|     expect(r.code).toBe(0);
       |                    ^
    1616|     expect(r.json?.disabled).toEqual([]);
    1617|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 173 passed (177)
   Start at  23:09:46
   Duration  39.98s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ntbz4U/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
