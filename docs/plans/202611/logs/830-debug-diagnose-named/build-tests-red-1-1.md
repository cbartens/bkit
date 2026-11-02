Enforced: true
Red: 11
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "parses explicit and existing branch tokens without consuming URLs" | red | failure: expected 2 to be +0 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/branches.test.ts` "rejects missing explicit and ambiguous existing branch selections" | red | failure: expected 2 to be 3 // Object.is equality |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "adopts a requested debug branch without mutating conflicting worktrees" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "locates CI evidence using prompt saved issue and local precedence" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects ambiguous cross-repository and malformed attempt references" | red | failure: expected 2 to be 8 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "filters branch and PR discovery by configured workflow and exact head" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "freezes explicit workflow run attempt and all failed job pages" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "validates branch fork ancestor divergent and unavailable ancestry evidence" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "distinguishes proven automatic no-red from explicit non-red and unavailable lookup" | red | failure: expected 2 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "validates normalized fallback evidence against the requested identity" | red | failure: expected 2 to be +0 // Object.is equality |
| 2 | `.bkit/core/engine/ledgers/status.test.ts` "validates atomic CI and local selections with stable evidence identities" | red | failure: validateCiSelection is not a function |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (226 tests | 2 failed) 52209ms
   ❯ bkit branches parse (2)
     × parses explicit and existing branch tokens without consuming URLs 57ms
     × rejects missing explicit and ambiguous existing branch selections 46ms
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
   ✓ branches rebase: behaviour (19)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 176ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 171ms
     ✓ --file records nothing for a refused rebase 114ms
     ✓ refuses a code conflict and aborts the rebase on the spot 120ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 213ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 121ms
     ✓ produces byte-identical output to merge=union 269ms
     ✓ restores a trailing newline so the next append starts on its own line 166ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 154ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 228ms
     ✓ refuses a union that leaves a line which is not JSON 128ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 199ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 295ms
     ✓ refuses a lockfile whose regenerate command fails 268ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 119ms
     ✓ removes a stale sentinel when the rebase succeeds 167ms
     ✓ exits 4 when no rebase is in progress 44ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 210ms
     ✓ resolves a conflict in each of two replayed commits across rounds 179ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 7ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 27ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 18ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 7ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 7ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 14ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 13ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 13ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 14ms
     ✓ fails closed on an empty --base-sha and writes nothing 0ms
     ✓ fails closed on a missing file 0ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 13ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 0ms
     ✓ stampAnchor: empty file 0ms
     ✓ stampAnchor: no trailing newline (kept as-is) 0ms
     ✓ stampAnchor: two blocks (both removed) 0ms
     ✓ stampAnchor: close on the line after open (body line kept) 0ms
     ✓ stampAnchor: inline lookalike marker is not a block 0ms
     ✓ stampAnchor: empty field block 0ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 14ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 0ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 0ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 116ms
       ✓ skips (12) with no anchor 114ms
       ✓ skips (12) when the base is unreachable in this clone 130ms
       ✓ skips (12) when nothing landed since the base 114ms
       ✓ runs (0) with the landed path count once dev moved 226ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 126ms
     ✓ readAnchor: two blocks: the first block's value wins 0ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 0ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 228ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 138ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 192ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 370ms
     ✓ runs exactly one git push 493ms
     ✓ --set-upstream records the upstream 169ms
     ✓ refuses with no branch checked out 134ms
     ✓ --mode=dev refuses a feature checkout 135ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 321ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 531ms
     ✓ --require-ci pushes as-is when dev has not moved 206ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 361ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 537ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 148ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 265ms
     ✓ --mode=abort pushes when the branch has no open PR 269ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 427ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 121ms
     ✓ --open-pr carries the MCP answer and skips gh 160ms
     ✓ --mode=abort on dev pushes plainly without probing 171ms
     ✓ rejects an unknown mode 120ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 340ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 290ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 319ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 853ms
     ✓ skip-ci HEAD on the replay is refused 217ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 376ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 750ms
     ✓ a level local dev is a plain push, recording nothing extra 287ms
     ✓ a record with no commits pushes nothing 218ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 146ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 537ms
     ✓ a rewritten branch is refused, never forced 207ms
     ✓ refuses dev and main with exit 21 and pushes nothing 132ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 295ms
     ✓ refuses a detached HEAD (exit 5) 124ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 253ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 253ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 248ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 307ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 132ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 306ms
     ✓ an up-to-date branch is a no-op 190ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 314ms
     ✓ a fetch that fails exits 10 150ms
   ✓ branches scan-diff (25)
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 174ms
     ✓ --paths with no match exits 1 166ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 123ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 230ms
     ✓ --marker reads a diff over 1 MiB 188ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 198ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 179ms
     ✓ scan-diff finds an added skip 189ms
     ✓ scan-diff ignores a skip predating the base 175ms
     ✓ scan-diff reports a disabled test with its line 187ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 186ms
     ✓ scan-diff ignores a removed comment in a test file 173ms
     ✓ scan-diff ignores an assertion moved within the file 171ms
     ✓ scan-diff still reports a removed assertion 168ms
     ✓ scan-diff reports an assertion re-added only outside the test file 170ms
     ✓ scan-diff finds an added pytest mark skip 197ms
     ✓ scan-diff finds an added unittest skip 196ms
     ✓ scan-diff finds an added bare skip call 185ms
     ✓ scan-diff ignores a quoted skip in a documentation file 168ms
     ✓ scan-diff ignores a marker literal in a non-test source file 172ms
     ✓ scan-diff ignores an assertion whose expectation changed 162ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 166ms
     ✓ scan-diff reports a deleted test file 177ms
     ✓ scan-diff never opens a symlinked test file's outside target 1ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 133ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 392ms
     ✓ a title that already carries the marker is left alone 331ms
     ✓ with no open PR: pushes the marker commit and edits no title 409ms
     ✓ a re-run is deduped: no second marker commit 463ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 467ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 131ms
     ✓ --title-set skips gh entirely 209ms
     ✓ refuses dev and main (exit 21) 102ms
   ✓ branches sync (24)
     ✓ Path A when origin/dev is an ancestor of HEAD 159ms
     ✓ Path B once dev moved; --head checks a given commit 243ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 246ms
     ✓ --merge-docs merges dev when docs/ is behind 287ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 273ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 491ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 447ms
     ✓ --merge-docs skips an empty bkit:generate script 282ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 242ms
     ✓ --merge-docs never merges on dev itself 219ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 316ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 312ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 292ms
     ✓ --merge merges dev into the feature branch with a skip-ci merge commit, never a rebase 293ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 162ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 381ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 487ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 468ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 487ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output with skip ci 547ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 296ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 208ms
     ✓ exits 10 when the fetch fails 136ms
     ✓ refuses --merge-docs with --head, and an unknown --head 145ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 292ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 447ms
     ✓ a failed install stops ship (16) 443ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 293ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 272ms
     ✓ exits 10 when the fetch fails 203ms
   ✓ branches land (27)
     ✓ refuses a workflow other than design or plan 112ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 207ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 506ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 490ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 578ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 590ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 1218ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 1334ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 262ms
     ✓ local: names unpushed dev as the cause when the branch carries it 283ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 305ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 704ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 771ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 732ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 466ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 810ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 736ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 570ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 644ms
     ✓ land removes the worktree when only the copied .env is untracked 506ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 449ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 470ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1155ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 499ms
     ✓ landPr refuses a main-based PR without retrying 892ms
     ✓ landPr refuses when the PR base is unknown 477ms
     ✓ PR not open (closed): stops (17) at once, no retry 629ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 369ms
     ✓ --attempt names the merge round in a fix commit 356ms
     ✓ commits a rewritten and a deleted tracked file 360ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 316ms
     ✓ reports undeclared and runs nothing with no scripts 171ms
     ✓ reports undeclared and runs nothing with an empty script 157ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 321ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 332ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 159ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > bkit branches parse > parses explicit and existing branch tokens without consuming URLs
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:155:27
    153|     );
    154|     const explicit = await run(cwd, ["parse", `--prompt-file=${prompt}…
    155|     expect(explicit.code).toBe(0);
       |                           ^
    156|     expect(explicit.json).toMatchObject({ branch: "fix/ci" });
    157|     write(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > bkit branches parse > rejects missing explicit and ambiguous existing branch selections
AssertionError: expected 2 to be 3 // Object.is equality

- Expected
+ Received

- 3
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:186:73
    184|     const prompt = path.join(cwd, "prompt.md");
    185|     write(cwd, "prompt.md", "bkit-debug branch=fix/missing");
    186|     expect((await run(cwd, ["parse", `--prompt-file=${prompt}`])).code…
       |                                                                         ^
    187|     write(cwd, "prompt.md", "bkit-debug fix/one fix/two");
    188|     expect((await run(cwd, ["parse", `--prompt-file=${prompt}`])).code…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 224 passed (226)
   Start at  20:09:41
   Duration  52.43s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-SKeYoP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts (65 tests | 1 failed) 4969ms
   ✓ bkit worktrees setup — usage (9)
     ✓ refuses ["--workflow=deploy","--fid=42-thing","--month=202610"] 22ms
     ✓ refuses ["--workflow=build","--fid=../x","--month=202610"] 20ms
     ✓ refuses ["--workflow=build","--fid=a/b","--month=202610"] 20ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=2026-10"] 19ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--branch=x"] 20ms
     ✓ refuses ["--workflow=ship","--fid=42-thing","--month=202610","--branch=a..b"] 22ms
     ✓ refuses ["--workflow=build","--month=202610"] 19ms
     ✓ refuses ["--workflow=build","--fid=42-thing","--month=202610","--worktrees=true"] 20ms
     ✓ refuses outside a git repository 4ms
   ✓ bkit worktrees setup — adopt in place (10)
     ✓ works in the main checkout on its own branch: no worktree, no copy, no install 50ms
     ✓ adopts the main checkout even when called from a linked worktree 67ms
     ✓ design refuses to work in place on dev 36ms
     ✓ plan refuses to work in place on dev 37ms
     ✓ build refuses to work in place on dev 37ms
     ✓ ship refuses to work in place on dev 37ms
     ✓ build in place on main is refused 33ms
     ✓ design and plan in place on main are refused 63ms
     ✓ still adopts a cloud session branch whose upstream is main 62ms
     ✓ refuses a detached HEAD 38ms
   ❯ bkit worktrees setup — debug (5)
     × adopts a requested debug branch without mutating conflicting worktrees 30ms
     ✓ may debug in place on dev 89ms
     ✓ never in place on main 32ms
     ✓ refuses a detached HEAD before anything else 31ms
     ✓ adopts in place when the session is already on feat/{fid} 58ms
   ✓ bkit worktrees setup — debug in place on dev shares the checkout (8)
     ✓ in-place debug on dev writes the shared-checkout record 200ms
     ✓ in-place debug on dev returns startSha and aheadAtStart 190ms
     ✓ a new run of the same FID rewrites startSha 283ms
     ✓ a resume of the same FID reuses the record 263ms
     ✓ setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock 179ms
     ✓ setup refuses with EXIT_SHARED_BUSY for a closed run that has not released its lock yet 183ms
     ✓ setup refuses while another setup holds the guard, and clears a stale guard 208ms
     ✓ a stale record without a lock is replaced 224ms
   ✓ bkit worktrees setup — ship branch (7)
     ✓ ships the prompt-named branch, else feat/{fid} when it exists, else the session branch 185ms
     ✓ ship names a missing feat branch 61ms
     ✓ ship on dev refuses with the releases-stay-manual text 29ms
     ✓ refuses dev / main as the ship branch 30ms
     ✓ warns on stderr and in branchWarning when the ship branch names neither the FID nor the issue 178ms
     ✓ --issue is ship only 25ms
     ✓ adopts in place when the session is already on the ship branch, even with --worktrees 74ms
   ✓ bkit worktrees setup — resume guard (6)
     ✓ refuses a plain directory at .worktrees/{fid} rather than rebasing the main checkout 47ms
     ✓ fails with a fetch error when there is no origin to rebase onto 79ms
     ✓ low disk (2)
       ✓ stops before minting when free disk stays under bkit.workflows.minFreeGb after the max steps 58ms
       ✓ checks no disk when there are no cleanup step files 76ms
     ✓ ship resumes without fetching or rebasing, and copies the configured list 79ms
     ✓ narrates a copy entry that points outside the main checkout and skips it 76ms
   ✓ addAllButCopied (3)
     ✓ omits a copied entry git ignores instead of naming it in the exclude pathspec (#700) 67ms
     ✓ stages the tree when a copy entry points outside the checkout, which setup skips too 45ms
     ✓ never commits an entry only the main checkout's copy list names 74ms
   ✓ paths (2)
     ✓ puts the worktree under .worktrees and the marker in the git common dir's outbox 23ms
     ✓ resolves the same marker from inside the worktree 43ms
   ✓ bkit worktrees remove (12)
     ✓ answers absent when there is no worktree 31ms
     ✓ leaves a worktree without the marker in place 44ms
     ✓ removes a marked worktree with uncommitted changes and clears the marker 67ms
     ✓ keeps the marker when the worktree directory was deleted by hand, and prunes its entry 59ms
     ✓ tells a caller inside the removed worktree where to cd 54ms
     ✓ fails with its own exit code when git cannot remove a marked path 34ms
     ✓ --branch (6)
       ✓ deletes the local and remote branch once the marked worktree is gone 157ms
       ✓ an unmarked worktree holding the branch blocks BOTH deletes and is named 101ms
       ✓ an unmarked worktree elsewhere holding the branch blocks the deletes too 103ms
       ✓ a branch already gone everywhere is reported deleted 77ms
       ✓ refuses to delete dev (2) 19ms
       ✓ refuses to delete main (2) 20ms
   ✓ bkit worktrees setup --detect (3)
     ✓ refuses --detect with --worktrees 27ms
     ✓ a runtime that cannot mint worktrees adopts the checkout in place 146ms
     ✓ a runtime that mints worktrees resumes .worktrees/{fid}; one that cannot adopts 184ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.test.ts > bkit worktrees setup — debug > adopts a requested debug branch without mutating conflicting worktrees
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/worktrees.test.ts:182:26
    180|     git(cwd, "branch", "fix/ci");
    181|     const adopted = await setup(cwd, "debug", "--branch=fix/ci", "--wo…
    182|     expect(adopted.code).toBe(0);
       |                          ^
    183|     expect(adopted.json).toMatchObject({
    184|       branch: "fix/ci",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 64 passed (65)
   Start at  20:10:34
   Duration  5.14s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-9f30FT/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/runs.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/runs.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/runs.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts (178 tests | 7 failed) 26000ms
   ❯ bkit runs locate (7)
     × locates CI evidence using prompt saved issue and local precedence 50ms
     × rejects ambiguous cross-repository and malformed attempt references 42ms
     × filters branch and PR discovery by configured workflow and exact head 40ms
     × freezes explicit workflow run attempt and all failed job pages 45ms
     × validates branch fork ancestor divergent and unavailable ancestry evidence 42ms
     × distinguishes proven automatic no-red from explicit non-red and unavailable lookup 45ms
     × validates normalized fallback evidence against the requested identity 43ms
   ✓ fixture gh stub (10)
     ✓ runs?head_sha=green-capstone returns the captured workflow_runs list 14ms
     ✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 11ms
     ✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 7ms
     ✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 7ms
     ✓ rate_limit returns the requested fixture state 8ms
     ✓ non-api argv exits non-zero (loud on an unmocked boundary) 7ms
     ✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 15ms
     ✓ --paginate emits one document per page; --slurp collapses them into an array 25ms
     ✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 7ms
     ✓ pr view is keyed by --repo; without it the checkout fixture is read 21ms
   ✓ bkit runs gate (68)
     ✓ accepts a green capstone at the head (exit 0) and says so 25ms
     ✓ rejects a failed run (12) 24ms
     ✓ rejects no run at the head (10) 12ms
     ✓ rejects runs that have not completed (11) 13ms
     ✓ rejects a green run at a superseded head (14), given --branch 19ms
     ✓ --fetch refreshes origin/<branch> before gating 132ms
     ✓ --fetch needs --branch (2) 0ms
     ✓ without --branch a superseded head is 10, not 14 (no invented attribution) 11ms
     ✓ rejects a run without the capstone job (13) 24ms
     ✓ rejects a cancelled run (15) 13ms
     ✓ rejects a green run whose capstone concluded 'cancelled' (12) 26ms
     ✓ rejects a green run whose capstone concluded 'skipped' (12) 25ms
     ✓ rejects a green run whose capstone concluded 'timed_out' (12) 26ms
     ✓ rejects a green run whose capstone concluded 'neutral' (12) 26ms
     ✓ rejects a green run whose capstone concluded 'action_required' (12) 25ms
     ✓ rejects a green run whose capstone concluded 'stale' (12) 26ms
     ✓ rejects a green run whose capstone concluded 'startup_failure' (12) 25ms
     ✓ exit 12 failed steps (10)
       ✓ a stale register alone is regenerable; the capstone is left out 25ms
       ✓ both floor steps failing is regenerable 25ms
       ✓ any failed step off the list makes the whole result unregenerable 26ms
       ✓ a job that concluded 'failure' with no failed step is {job}/ and unregenerable 24ms
       ✓ a job that concluded 'timed_out' with no failed step is {job}/ and unregenerable 25ms
       ✓ a job that concluded 'cancelled' with no failed step is {job}/ and unregenerable 26ms
       ✓ a timed-out step counts as failed 25ms
       ✓ bkit.testing.ciGenerated adds steps to the floor 46ms
       ✓ a step name alone does not match a {job}/{step} entry in another job 25ms
       ✓ refusals other than a failed run carry no failed steps 13ms
     ✓ --repo scopes --pr resolution (2)
       ✓ reads the head from the named repo, not the checkout's own PR 34ms
       ✓ logs the disagreement when the resolved repo differs from --repo 21ms
     ✓ skipped lanes (16 is opt-in) (5)
       ✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 23ms
       ✓ refuses a skipped lane named in bkit.testing.ciRequired (16) 23ms
       ✓ a required lane naming a different lane does not refuse 24ms
       ✓ refuses when any of several required lanes was skipped 24ms
       ✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 24ms
     ✓ a newer in-flight re-dispatch does not mask a completed green at the head 23ms
     ✓ tells an API error (20) from no run (10) 44ms
     ✓ shapes a rate-limit refusal from rate_limit (20) 18ms
     ✓ stderr noise on a successful gh call does not corrupt the JSON read 22ms
     ✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 25ms
     ✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 1ms
     ✓ BKIT_SHIP_GATE_OVERRIDE (4)
       ✓ pinned to the refused head turns the refusal into 0 and appends the audit row 25ms
       ✓ a different SHA is ignored — the refusal stands 23ms
       ✓ honoured with no status file (no crash), the row goes to stderr 23ms
       ✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 23ms
     ✓ config (5)
       ✓ capstone and CI workflow resolve from package.json when not passed 48ms
       ✓ bkit.testing.ciRequired resolves from package.json 23ms
       ✓ absent ciRequired means no refusal 24ms
       ✓ a malformed ciRequired falls back to none, never crashes 25ms
       ✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 48ms
     ✓ missing --head is a usage error (2) 0ms
     ✓ an empty --head= is a usage error (2), not a gate refusal 4ms
     ✓ --event (5)
       ✓ --event push ignores a pull_request run: no push run is 10, not 11 12ms
       ✓ without --event the in-flight pull_request run reads as in progress (11) 12ms
       ✓ --event push selects the green push run beside an in-flight pull_request run 23ms
       ✓ --event push reds on a failed push run even when a newer pull_request run is green 21ms
       ✓ without --event the newer green pull_request run masks the failed push run 23ms
     ✓ --capstone-only (ship post-merge) (6)
       ✓ a failed run whose capstone passed passes: other jobs do not count 44ms
       ✓ a run still in progress whose capstone already passed passes 34ms
       ✓ a capstone still running is in progress (11) 24ms
       ✓ a failed capstone fails (12) even when every other job passed 25ms
       ✓ a cancelled capstone is 15; a completed run without the capstone is 13 50ms
       ✓ a required lane that was skipped does not refuse: the capstone alone decides 47ms
     ✓ --validated carry-forward (17) (6)
       ✓ bookkeeping-only commits on a green head pass without CI at the head 123ms
       ✓ a source change past the validated head refuses (17) and names the path 101ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 120ms
       ✓ --validated equal to --head is the plain head check 24ms
       ✓ --validated without --month / --fid is a usage error (2) 79ms
       ✓ a validated sha that is not an ancestor refuses (17) 103ms
   ✓ bkit runs mirror (18)
     ✓ green push run capstone -> 0 0ms
     ✓ waits through in-progress polls, then mirrors green 0ms
     ✓ waits through in-progress polls, then mirrors red (1) 0ms
     ✓ gate 12 (red) -> 1 with the gate's reason 0ms
     ✓ gate 15 (cancelled) -> 1 with the gate's reason 0ms
     ✓ gate 13 (capstone absent) -> 1 with the gate's reason 0ms
     ✓ gate 16 (required lane skipped) -> 1 with the gate's reason 0ms
     ✓ gate 7 (unknown gate exit (never a pass)) -> 1 with the gate's reason 0ms
     ✓ no push run past the absent window -> 3 naming [skip ci]; a superseded answer (14) counts as absent 0ms
     ✓ no push run yet inside the absent window keeps waiting 0ms
     ✓ still in progress at --max-minutes -> 4 0ms
     ✓ two API errors are retried; the third in a row -> 20 0ms
     ✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 372ms
     ✓ asks the gate for the push run on dev at the PR head, in the named repo 383ms
     ✓ e2e: green push run beside the PR's own in-flight run -> 0 31ms
     ✓ e2e: a red push run is not masked by a newer green PR run -> 1 23ms
     ✓ e2e: only the PR's own run exists -> absent, not in progress (3) 19ms
     ✓ usage: missing --head or a non-numeric minute value exits 2 1ms
   ✓ bkit runs wait (10)
     ✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
     ✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
     ✓ found stops polling; every poll erroring is err with allErrored 0ms
     ✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
     ✓ PR completed = no open checks; run targets are head-anchored 0ms
     ✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 744ms
     ✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 377ms
     ✓ CLI: a failed gh workflow run exits 5 381ms
     ✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1394ms
     ✓ CLI: usage errors exit 2 10ms
   ✓ bkit runs dispatch (16)
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 109ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 169ms
     ✓ a failed re-trigger push names the cause in the log 277ms
     ✓ a failed re-trigger push leaves no orphan commit behind 277ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 311ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 167ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 95ms
     ✓ gh-error: every poll errored 94ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 162ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 148ms
     ✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 170ms
     ✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 171ms
     ✓ the probe namespace follows bkit.testing.ciCapstone 87ms
     ✓ CLI: verdict JSON, body scan, exit codes 527ms
     ✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 463ms
     ✓ CLI: --poll-result is validated, --attempts needs it 88ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
     ✓ dispatch on dev with a pushed sha and no pr proves the run started 629ms
     ✓ re-trigger on dev with a record pushes through the own-commit push 372ms
     ✓ re-trigger on dev with a record never commits a foreign staged path 373ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 369ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 136ms
     ✓ re-trigger on dev only uses the record of its own FID 177ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 159ms
     ✓ dispatch --sha=0123456789abcdef0123456789abcdef0123456 is refused: the CI run is matched on the full 40-hex sha 159ms
   ✓ bkit runs declared (2)
     ✓ exit 0 when .github/workflows/<bkit.testing.ciWorkflow> exists, 1 when not 12ms
     ✓ the default bkit-ci.yml counts when no bkit.testing.ciWorkflow is configured 4ms
   ✓ scanBody (8)
     ✓ flags [skip ci] inherited into the landed commit body 24ms
     ✓ flags [ci skip] inherited into the landed commit body 23ms
     ✓ flags [no ci] inherited into the landed commit body 23ms
     ✓ flags [skip actions] inherited into the landed commit body 22ms
     ✓ flags [actions skip] inherited into the landed commit body 24ms
     ✓ flags [SKIP CI] inherited into the landed commit body 22ms
     ✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 46ms
     ✓ an empty or unreadable sha is an error, not a clean result 23ms
   ✓ bkit runs gate — PR heads, snapshot and audit rows (9)
     ✓ --pr gates the PR's current head 407ms
     ✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 362ms
     ✓ --snapshot appends the pre-merge snapshot before the gate decides 454ms
     ✓ --snapshot scopes its run list and dev lookups to --repo 503ms
     ✓ --snapshot without --repo leaves its run list unscoped 395ms
     ✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 399ms
     ✓ a refused capstone records FAIL with its reason 432ms
     ✓ an unreadable PR is an API error (20) with no head 381ms
     ✓ takes exactly one of --head, --pr, --squash-of 11ms
   ✓ bkit runs revalidate (6)
     ✓ --repo scopes every gh call (3)
       ✓ pr view, run list and the dev-protection lookups name the foreign repo 463ms
       ✓ without --repo no call gains a --repo flag 464ms
       ✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 428ms
     ✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 794ms
     ✓ refuses an unknown --reason 67ms
   ✓ bkit runs context (12)
     ✓ BRIEF phases take the argument as the issue 431ms
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 1244ms
     ✓ ref uppercases a Linear or Jira key 0ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 436ms
     ✓ CI_DEV refuses the slug "../../etc" (exit 9) 407ms
     ✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 414ms
     ✓ CI_DEV refuses the slug "a/b" (exit 9) 402ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 441ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 491ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 803ms
     ✓ an unknown phase exits 3; gh needing auth exits 80 421ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 811ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 476ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 491ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 473ms
     ✓ --file and --step go together 476ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > locates CI evidence using prompt saved issue and local precedence
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:309:25
    307|     const before = fs.readFileSync(f.file, "utf-8");
    308|     const prompt = await f.locate();
    309|     expect(prompt.code).toBe(0);
       |                         ^
    310|     expect(prompt.json).toMatchObject({ runId: "101", via: "prompt-run…
    311|     expect(f.selected()).toMatchObject({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > rejects ambiguous cross-repository and malformed attempt references
AssertionError: expected 2 to be 8 // Object.is equality

- Expected
+ Received

- 8
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:343:37
    341|       "https://github.com/example/example/actions/runs/101 https://git…
    342|     );
    343|     expect((await f.locate()).code).toBe(8);
       |                                     ^
    344|     fs.writeFileSync(f.prompt, "https://github.com/other/repo/actions/…
    345|     expect((await f.locate()).code).toBe(82);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > filters branch and PR discovery by configured workflow and exact head
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:364:37
    362|       updated_at: "2026-11-02T00:00:00Z",
    363|     });
    364|     expect((await f.locate()).code).toBe(0);
       |                                     ^
    365|     expect(f.selected()).toMatchObject({ runId: "101", workflowId: "45…
    366|     const branchCalls = f

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > freezes explicit workflow run attempt and all failed job pages
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:401:25
    399|     fs.writeFileSync(f.prompt, "https://github.com/example/example/act…
    400|     const result = await f.locate();
    401|     expect(result.code).toBe(0);
       |                         ^
    402|     expect(result.json).toMatchObject({
    403|       runId: "101",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > validates branch fork ancestor divergent and unavailable ancestry evidence
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:421:26
    419|     fs.writeFileSync(f.prompt, "https://github.com/example/example/act…
    420|     const current = await f.locate();
    421|     expect(current.code).toBe(0);
       |                          ^
    422|     expect(current.json.headRelation).toBe("current");
    423|     f.data.runs[0]!.head_sha = f.ancestor;

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > distinguishes proven automatic no-red from explicit non-red and unavailable lookup
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:450:37
    448|     const f = locateFixture();
    449|     f.data.runs[0]!.conclusion = "success";
    450|     expect((await f.locate()).code).toBe(1);
       |                                     ^
    451|     expect(f.selected()).toMatchObject({ mode: "local" });
    452|     fs.writeFileSync(f.prompt, "https://github.com/example/example/act…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs locate > validates normalized fallback evidence against the requested identity
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/runs.test.ts:501:27
    499|     f.data.error = true;
    500|     const accepted = await f.locate(`--evidence-file=${evidence}`);
    501|     expect(accepted.code).toBe(0);
       |                           ^
    502|     expect(f.selected()).toMatchObject({ runId: "101", runAttempt: 2, …
    503|     fs.writeFileSync(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 171 passed (178)
   Start at  20:10:40
   Duration  26.22s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-1gQp5N/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/status.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/status.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/status.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/830-debug-diagnose-named

 ❯ .bkit/core/engine/ledgers/status.test.ts (13 tests | 1 failed) 6ms
   ❯ CI evidence selection contract (1)
     × validates atomic CI and local selections with stable evidence identities 2ms
   ✓ fold — event log → run array (7)
     ✓ folds a single run, step-done appends to the open run 1ms
     ✓ preserves multiple phase runs in one log (design → plan → build) 0ms
     ✓ attaches step-done to the latest run of its workflow across two runs of the same phase 0ms
     ✓ de-dupes identical lines (union duplication) — keeps one 0ms
     ✓ orders interleaved (union-shuffled) lines by `at` 0ms
     ✓ fold reads an old subPlan row as its group 0ms
     ✓ merges workflow-meta onto the run (debugAttempt) 0ms
   ✓ appendLine (1)
     ✓ serializes one event as a newline-terminated JSON line 0ms
   ✓ engine-action rows (4)
     ✓ key joins its parts with /, an absent part as -; hash is sha256 hex 0ms
     ✓ records a row and finds it only by the same key and hash 1ms
     ✓ skips malformed lines 0ms
     ✓ the fold ignores them 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/status.test.ts > CI evidence selection contract > validates atomic CI and local selections with stable evidence identities
TypeError: validateCiSelection is not a function
 ❯ .bkit/core/engine/ledgers/status.test.ts:38:12
     36|       via: "prompt-run",
     37|     };
     38|     expect(validateCiSelection(selection)).toBe(true);
       |            ^
     39|     expect(validateCiSelection({ mode: "local", reason: "explicit-loca…
     40|     expect(validateCiSelection({ ...selection, headSha: "not-a-commit"…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 12 passed (13)
   Start at  20:11:07
   Duration  111ms (transform 46%, setup 22%, import 18%, tests 11%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-VxdttU/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
