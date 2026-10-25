> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/branches.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/branches.test.ts (131 tests | 2 failed) 26609ms
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
✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 190ms
✓ refuses a code conflict and aborts the rebase on the spot 130ms
✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 497ms
✓ refuses a mixed set without mutating the resolvable ledger in it 122ms
✓ produces byte-identical output to merge=union 289ms
✓ restores a trailing newline so the next append starts on its own line 171ms
✓ skips a commit the resolution emptied instead of stalling the rebase 165ms
✓ keeps going when the skip lands on a next commit that conflicts again 238ms
✓ refuses a union that leaves a line which is not JSON 140ms
✓ unions docs/roadmap.md without de-duplicating its repeated lines 191ms
✓ resolves a lockfile from the rebase target's copy, then regenerates it 543ms
✓ refuses a lockfile whose regenerate command fails 282ms
✓ --sentinel and --log-file record a refusal and survive the abort 116ms
✓ removes a stale sentinel when the rebase succeeds 167ms
✓ exits 4 when no rebase is in progress 48ms
✓ resolves two ledgers conflicting in the same commit in one pass 232ms
✓ resolves a conflict in each of two replayed commits across rounds 197ms
✓ branches anchor-stamp (19)
✓ prepends a well-formed block to an unstamped file 9ms
✓ records the bkit release, and warns visibly under the block when it is outdated 27ms
✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 19ms
✓ stamps an empty bkitLatest and no warning when the newest release is unknown 10ms
✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 8ms
✓ is idempotent: stamping twice with the same args is byte-identical 18ms
✓ re-stamping with a different base replaces the block instead of adding a second 18ms
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
✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
✓ matches only inside the block, and the first occurrence wins 0ms
✓ exits 13 on a missing file and 2 on an unknown field 0ms
✓ --against (build's Plan Current trigger) (6)
✓ skips (12) with no plan file 119ms
✓ skips (12) with no anchor 120ms
✓ skips (12) when the base is unreachable in this clone 131ms
✓ skips (12) when nothing landed since the base 123ms
✓ runs (0) with the landed path count once dev moved 241ms
✓ errors (2) when the --against ref does not exist, instead of skipping 124ms
✓ readAnchor: two blocks: the first block's value wins 0ms
✓ readAnchor: an unterminated block runs to the end of the file 0ms
✓ readAnchor: a field after the close line is outside the block 0ms
✓ readAnchor: an empty field reads as the empty string 0ms
✓ readAnchor: an empty file has no fields 0ms
✓ branches push (16)
✓ pushes a feature branch with --force-with-lease and reports the ref pushed 245ms
✓ pushes dev plainly, so a non-fast-forward is refused rather than forced 197ms
✓ pushes when the pre-push hook prints more than Node's 1MB default 613ms
✓ runs exactly one git push 565ms
✓ --set-upstream records the upstream 172ms
✓ refuses with no branch checked out 136ms
✓ --mode=dev refuses a feature checkout 134ms
✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 294ms
✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 148ms
✓ --mode=abort never pushes into an open PR, and says what was not pushed 502ms
✓ --mode=abort pushes when the branch has no open PR 298ms
✓ --mode=abort hands the probe to MCP (80) when gh fails 262ms
✓ --mode=abort hands the probe to MCP (80) when gh is not installed 131ms
✓ --open-pr carries the MCP answer and skips gh 180ms
✓ --mode=abort on dev pushes plainly without probing 173ms
✓ rejects an unknown mode 130ms
✓ branches sync (10)
✓ Path A when origin/dev is an ancestor of HEAD 170ms
✓ Path B once dev moved; --head checks a given commit 259ms
✓ --merge-docs merges dev when docs/ is behind 300ms
✓ --merge-docs leaves the branch alone when only code moved on dev 269ms
✓ --merge-docs never merges on dev itself 245ms
✓ --merge-docs takes dev's side for a conflicted docs/ file 336ms
✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 343ms
✓ --merge-docs aborts (11) on a conflict outside docs/ 319ms
✓ exits 10 when the fetch fails 144ms
✓ refuses --merge-docs with --head, and an unknown --head 157ms
✓ branches sync-dev (6)
✓ fast-forwards local dev without checking it out 303ms
✓ on dev: moves the checkout too, and installs only because dev moved 480ms
✓ a failed install stops ship (16) 414ms
✓ lists local-only dev commits with the command to publish them, and pushes nothing 309ms
✓ exits 10 when the fetch fails 225ms
✓ puts core.bare back to false on the main checkout 288ms
❯ branches land (21)
✓ refuses a workflow other than design or plan 116ms
✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 244ms
✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 555ms
✓ local: lands with files staged in the main checkout and leaves them staged 541ms
✓ local: dev with commits of its own is left alone; only the close is pushed 527ms
✓ local: the main checkout on another branch stays there; only the dev pointer moves 548ms
✓ dev moved during the push: rebuilds on the new dev and pushes again 1296ms
✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1409ms
✓ local: stops (17) when the squash would bring non-doc files to dev 265ms
✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 683ms
✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 742ms
✓ PR merge refused: updates the PR branch from dev and merges on the next try 682ms
✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 486ms
✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 760ms
✓ PR state unread (one gh view failed): retried like an open PR, then merges 697ms
✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 526ms
✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 712ms
✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 546ms
× landPr refuses a main-based PR without retrying 544ms
× landPr refuses when the PR base is unknown 552ms
✓ PR not open (closed): stops (17) at once, no retry 682ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches land > landPr refuses a main-based PR without retrying
AssertionError: expected '[bkit-branches] PR 5 not merged on tr…' to contain 'releases stay manual'

- Expected

* Received

- releases stay manual

* [bkit-branches] PR 5 not merged on try 1 of 3 — branch updated from dev; trying again in 0.0s
* [bkit-branches] PR 5 not merged on try 2 of 3 — branch updated from dev; trying again in 0.0s
* [bkit-branches] PR 5 still not merged after 3 tries — left open; merge it, then re-run with --pr=5 --merged-sha=<merge commit>
*

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1704:19
1702| );
1703| expect(r.code).toBe(17);
1704| expect(r.err).toContain("releases stay manual");
| ^
1705| expect(callsOf(gh.base).filter((c) => c.startsWith("pr merge"))).t…
1706| expect(callsOf(gh.base).filter((c) => c.startsWith("pr update-bran…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

FAIL .bkit/core/engine/commands/workflow/branches.test.ts > branches land > landPr refuses when the PR base is unknown
AssertionError: expected [ …(3) ] to deeply equal []

- Expected

* Received

- []

* [
* "pr merge 5 --squash --subject docs(12-x): design DONE bkit [skip ci] --body ",
* "pr merge 5 --squash --subject docs(12-x): design DONE bkit [skip ci] --body ",
* "pr merge 5 --squash --subject docs(12-x): design DONE bkit [skip ci] --body ",
* ]

❯ .bkit/core/engine/commands/workflow/branches.test.ts:1719:70
1717| );
1718| expect(r.code).toBe(17);
1719| expect(callsOf(gh.base).filter((c) => c.startsWith("pr merge"))).t…
| ^
1720| expect(callsOf(gh.base).filter((c) => c.startsWith("pr update-bran…
1721| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯

Test Files 1 failed (1)
Tests 2 failed | 129 passed (131)
Start at 13:04:19
Duration 26.86s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-qYkJX6/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
