Enforced: true
Red: 8
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1018-subagent-commits-makes-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "returns the commit that holds the last step-done row" | red-not-loaded | `.bkit/core/engine/commands/workflow/step-base.test.ts` did not load: Cannot find module './step-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes/.bkit/core/engine/commands/workflow/step-base.test.ts |
| 1 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "with a step name returns the commit of the row before that step's latest row" | red-not-loaded | `.bkit/core/engine/commands/workflow/step-base.test.ts` did not load: Cannot find module './step-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes/.bkit/core/engine/commands/workflow/step-base.test.ts |
| 1 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "falls back to the run start commit, and null with no run" | red-not-loaded | `.bkit/core/engine/commands/workflow/step-base.test.ts` did not load: Cannot find module './step-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes/.bkit/core/engine/commands/workflow/step-base.test.ts |
| 2 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists a file the subagent committed after the last step-done commit" | red | failure: expected [] to deeply equal [ 'src/a.ts' ] |
| 2 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists the same file when it is left uncommitted" | passed-accepted | passes; accepted by the tests step: the current HEAD default already lists an uncommitted edit; the test guards that it stays equal to the committed case |
| 2 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "leaves out a file only the previous step's own commit touched" | red | failure: expected [] to deeply equal [ 'src/a.ts' ] |
| 3 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish" | red | failure: expected 2 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it" | red | failure: expected 2 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 1 when the step changed only logs" | red | failure: expected 2 to be 1 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/step-base.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/step-base.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/step-base.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/step-base.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

 ❯ .bkit/core/engine/commands/workflow/step-base.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/step-base.test.ts [ .bkit/core/engine/commands/workflow/step-base.test.ts ]
Error: Cannot find module './step-base' imported from /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes/.bkit/core/engine/commands/workflow/step-base.test.ts
 ❯ .bkit/core/engine/commands/workflow/step-base.test.ts:8:1
      6| import { afterEach, describe, expect, it } from "vitest";
      7|
      8| import { stepBase } from "./step-base";
       | ^
      9|
     10| const dirs: string[] = [];

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  07:39:34
   Duration  236ms (setup 79%, transform 13%, worker 7%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-X3zcx7/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests-changed.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-changed.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-changed.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-changed.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts (28 tests | 2 failed) 8984ms
   ✓ changedFiles (2)
     ✓ lists modified, staged and untracked files, and leaves out ignored and deleted ones 166ms
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 314ms
   ✓ snapshotTree / changedBetween (5)
     ✓ the tested snapshot holds uncommitted and untracked files 232ms
     ✓ snapshotting leaves the index and working tree as they were 319ms
     ✓ a checkout with no commit yet snapshots with no parent 119ms
     ✓ changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart 319ms
     ✓ changedBetween is null when the snapshot is gone 169ms
   ✓ deletedFiles (1)
     ✓ deletedFiles lists a file removed since the base 318ms
   ✓ importersOf (4)
     ✓ importersOf lists the unchanged files that mention a deleted file's name 183ms
     ✓ importersOf leaves out a file that no longer exists 172ms
     ✓ importersOf returns null when the base tree cannot be searched 212ms
     ✓ importersOf returns null when a blob is unreadable even though another file matched 193ms
   ✓ tests changed (13)
     ✓ tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate 88ms
     ✓ runs bkit:gate:changed with the changed files as its arguments 741ms
     ✓ counts files committed since --base 526ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 837ms
     ✓ runs nothing and exits 0 when no file changed 168ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 341ms
     ✓ runs the --fallback gate even when no file changed, as it did before 397ms
     ✓ exits 3 when neither bkit:gate:changed nor the --fallback gate is declared 127ms
     ✓ exits 4 when the gate could not run 342ms
     ✓ changed-since exits 81 with the holder read from the status file 607ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 314ms
     ✓ exits 1 when the gate exits 75 and writes no status file 369ms
     ✓ refuses a --base that names no commit 98ms
   ❯ tests changed default base (3)
     × lists a file the subagent committed after the last step-done commit 313ms
     ✓ lists the same file when it is left uncommitted 712ms
     × leaves out a file only the previous step's own commit touched 287ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-changed.test.ts > tests changed default base > lists a file the subagent committed after the last step-done commit
AssertionError: expected [] to deeply equal [ 'src/a.ts' ]

- Expected
+ Received

- [
-   "src/a.ts",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts:440:27
    438|     commit("subagent commit");
    439|     const r = await changed([]);
    440|     expect(r.json?.files).toEqual(["src/a.ts"]);
       |                           ^
    441|   });
    442|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-changed.test.ts > tests changed default base > leaves out a file only the previous step's own commit touched
AssertionError: expected [] to deeply equal [ 'src/a.ts' ]

- Expected
+ Received

- [
-   "src/a.ts",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts:456:27
    454|     const r = await changed([]);
    455|     expect(r.json?.files).not.toContain("src/prev.ts");
    456|     expect(r.json?.files).toEqual(["src/a.ts"]);
       |                           ^
    457|   });
    458| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 26 passed (28)
   Start at  07:39:36
   Duration  9.52s (tests 96%, import 2%, transform 2%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-UfwKHI/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/branches.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/branches.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/branches.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1018-subagent-commits-makes

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (282 tests | 3 failed) 236487ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 297ms
     ✓ rejects missing explicit and ambiguous existing branch selections 282ms
   ✓ branches rebase: classification (31)
     ✓ ledger list does not drift from .gitattributes merge=union 2ms
     ✓ classifies docs/knowledge.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/decisions.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/deferrals.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/failures.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/issues.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/roadmap.md as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/stats.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies .bkit/friction.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies docs/plans/202608/logs/234-x/status.jsonl as an auto-resolvable ledger 1ms
     ✓ classifies every lockfile with a regenerate command as the lockfile shape 1ms
     ✓ refuses src.txt 0ms
     ✓ refuses package.json 0ms
     ✓ refuses .bkit/config.json 0ms
     ✓ refuses docs/testing.md 0ms
     ✓ refuses docs/plans/202608/234-plan.md 1ms
     ✓ refuses apps/web/data.jsonl 1ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 1ms
     ✓ refuses packages/a/Cargo.lock 0ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 0ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 0ms
     ✓ classifies every generated register as the register shape, and only at its exact path 0ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 0ms
     ✓ classifies the install record, and only at its exact path 0ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 81ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 406ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 454ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 311ms
     ✓ a refused --continue carries git's own reason 403ms
     ✓ --file records nothing for a refused rebase 270ms
     ✓ refuses a code conflict and aborts the rebase on the spot 329ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 665ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 286ms
     ✓ produces byte-identical output to merge=union 686ms
     ✓ restores a trailing newline so the next append starts on its own line 422ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 390ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 593ms
     ✓ refuses a union that leaves a line which is not JSON 350ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 434ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1052ms
     ✓ refuses a lockfile whose regenerate command fails 851ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 677ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 626ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 572ms
     ✓ refuses and aborts when both sides changed the hand-written region 361ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 410ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 505ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 613ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 375ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 464ms
     ✓ refuses and aborts when a side deleted the install record 332ms
     ✓ refuses a conflicted doc the repo's script does not list 334ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 350ms
     ✓ removes a stale sentinel when the rebase succeeds 431ms
     ✓ exits 4 when no rebase is in progress 119ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 559ms
     ✓ resolves a conflict in each of two replayed commits across rounds 509ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 23ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 60ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 78ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 29ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 21ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 41ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 42ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 43ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 41ms
     ✓ fails closed on an empty --base-sha and writes nothing 1ms
     ✓ fails closed on a missing file 1ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 48ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 1ms
     ✓ stampAnchor: empty file 1ms
     ✓ stampAnchor: no trailing newline (kept as-is) 1ms
     ✓ stampAnchor: two blocks (both removed) 1ms
     ✓ stampAnchor: close on the line after open (body line kept) 1ms
     ✓ stampAnchor: inline lookalike marker is not a block 1ms
     ✓ stampAnchor: empty field block 1ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 39ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 1ms
     ✓ matches only inside the block, and the first occurrence wins 0ms
     ✓ exits 13 on a missing file and 2 on an unknown field 1ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 283ms
       ✓ skips (12) with no anchor 274ms
       ✓ skips (12) when the base is unreachable in this clone 322ms
       ✓ skips (12) when nothing landed since the base 301ms
       ✓ runs (0) with the landed path count once dev moved 546ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 301ms
     ✓ readAnchor: two blocks: the first block's value wins 1ms
     ✓ readAnchor: an unterminated block runs to the end of the file 0ms
     ✓ readAnchor: a field after the close line is outside the block 0ms
     ✓ readAnchor: an empty field reads as the empty string 0ms
     ✓ readAnchor: an empty file has no fields 1ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 637ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 424ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 545ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 950ms
     ✓ runs exactly one git push 882ms
     ✓ --set-upstream records the upstream 647ms
     ✓ refuses with no branch checked out 467ms
     ✓ --mode=dev refuses a feature checkout 359ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1225ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 1472ms
     ✓ --require-ci pushes as-is when dev has not moved 542ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 945ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1387ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 577ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1104ms
     ✓ --mode=abort pushes when the branch has no open PR 986ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 568ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 394ms
     ✓ --open-pr carries the MCP answer and skips gh 606ms
     ✓ --mode=abort on dev pushes plainly without probing 500ms
     ✓ rejects an unknown mode 392ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 1663ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 798ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 968ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2376ms
     ✓ skip-ci HEAD on the replay is refused 565ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1446ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 2030ms
     ✓ a level local dev is a plain push, recording nothing extra 711ms
     ✓ a record with no commits pushes nothing 542ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 375ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 891ms
     ✓ a rewritten branch is refused, never forced 569ms
     ✓ refuses dev and main with exit 21 and pushes nothing 373ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 899ms
     ✓ refuses a detached HEAD (exit 5) 390ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 820ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 802ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 785ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 972ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 400ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 952ms
     ✓ an up-to-date branch is a no-op 551ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 869ms
     ✓ a fetch that fails exits 10 372ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 460ms
     ✓ scan-diff still reports a new skip when its test … 474ms
     ✓ scan-diff reports a skip moved onto a different t… 463ms
     ✓ scan-diff does not cancel a skip moved between am… 444ms
     ✓ scan-diff does not spend an unchanged duplicate t… 414ms
     ✓ scan-diff recognizes a renamed test file 443ms
     ✓ scan-diff recognizes a suite moved into a differe… 430ms
     ✓ scan-diff does not let unrelated additions hide a… 434ms
     ✓ scan-diff attributes deletion to its old test ins… 435ms
     ✓ scan-diff consumes each moved assertion once and … 440ms
     ✓ scan-diff does not match identical assertions fro… 427ms
     ✓ scan-diff does not match the same leaf test name … 438ms
     ✓ scan-diff does not match a same-named test with d… 442ms
     ✓ scan-diff does not match a same-named test with c… 472ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 456ms
     ✓ --paths with no match exits 1 414ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 325ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 597ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 640ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 467ms
     ✓ --marker reads a diff over 1 MiB 487ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 541ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 500ms
     ✓ scan-diff finds an added skip 487ms
     ✓ scan-diff ignores a skip predating the base 418ms
     ✓ scan-diff reports a disabled test with its line 516ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 446ms
     ✓ scan-diff ignores a removed comment in a test file 436ms
     ✓ scan-diff ignores an assertion moved within the file 446ms
     ✓ scan-diff still reports a removed assertion 446ms
     ✓ scan-diff reports an assertion re-added only outside the test file 448ms
     ✓ scan-diff finds an added pytest mark skip 521ms
     ✓ scan-diff finds an added unittest skip 429ms
     ✓ scan-diff finds an added bare skip call 443ms
     ✓ scan-diff ignores a quoted skip in a documentation file 522ms
     ✓ scan-diff ignores a marker literal in a non-test source file 457ms
     ✓ scan-diff ignores an assertion whose expectation changed 488ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 544ms
     ✓ scan-diff reports a deleted test file 553ms
     ✓ scan-diff never opens a symlinked test file's outside target 2ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 415ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1341ms
     ✓ a title that already carries the marker is left alone 938ms
     ✓ with no open PR: pushes the marker commit and edits no title 1086ms
     ✓ a re-run is deduped: no second marker commit 1315ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1311ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 468ms
     ✓ --title-set skips gh entirely 754ms
     ✓ refuses dev and main (exit 21) 369ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1488ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2994ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 1749ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 3727ms
     ✓ continues only the explicitly recorded target through the public merge command 2485ms
     ✓ fetches the unseen feature head before classifying the base 1530ms
     ✓ fast forwards the feature before either base path is chosen 3815ms
     ✓ merges divergent feature tips without rebasing either side 2269ms
     ✓ continues the feature merge before starting a dev merge 3415ms
     ✓ publishes local code with a CI running head before bookkeeping 3575ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 5155ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3240ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2222ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 629ms
     ✓ Path B once dev moved; --head checks a given commit 925ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 925ms
     ✓ --merge-docs merges dev when docs/ is behind 1137ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 1124ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1526ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1282ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1162ms
     ✓ --merge-docs skips an empty bkit:generate script 1121ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 981ms
     ✓ --merge-docs never merges on dev itself 822ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 1128ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 1147ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 1223ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 1082ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 559ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 1382ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 1510ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 1612ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1797ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1431ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 1775ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 1129ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1510ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 969ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 635ms
     ✓ exits 10 when the fetch fails 433ms
     ✓ refuses --merge-docs with --head, and an unknown --head 483ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 979ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1397ms
     ✓ a failed install stops ship (16) 1701ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1044ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 990ms
     ✓ exits 10 when the fetch fails 778ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 531ms
     ✓ preserves unlanded file type changes in the shared landed comparison 563ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 396ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 550ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 2501ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 2635ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 2736ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 2622ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 4813ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 6375ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 957ms
     ✓ local: names unpushed dev as the cause when the branch carries it 1134ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 1237ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 2869ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 2761ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 1856ms
     ✓ uses tree entry equivalence for design and plan land cleanup 8445ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2328ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2498ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1965ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1285ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3097ms
     ✓ land removes the worktree when only the copied .env is untracked 2543ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 1994ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 2303ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 3721ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 2225ms
     ✓ landPr refuses a main-based PR without retrying 880ms
     ✓ landPr refuses when the PR base is unknown 1190ms
     ✓ PR not open (closed): stops (17) at once, no retry 1710ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 902ms
     ✓ --attempt names the merge round in a fix commit 760ms
     ✓ commits a rewritten and a deleted tracked file 862ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 729ms
     ✓ reports undeclared and runs nothing with no scripts 570ms
     ✓ reports undeclared and runs nothing with an empty script 604ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 632ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 823ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 574ms
   ❯ branches scan-diff --since-step (3)
     × scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 676ms
     × scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 657ms
     × scan-diff --since-step --code exits 1 when the step changed only logs 690ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff --since-step > scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:4411:20
    4409|     finish(clone);
    4410|     const r = await scan(clone, file);
    4411|     expect(r.code).toBe(0);
       |                    ^
    4412|     expect(r.json).toEqual({ found: true, paths: ["src/fix.ts"] });
    4413|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff --since-step > scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it
AssertionError: expected 2 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:4420:20
    4418|     finish(clone);
    4419|     const r = await scan(clone, file);
    4420|     expect(r.code).toBe(0);
       |                    ^
    4421|     expect(r.json).toEqual({ found: true, paths: ["src/fix.ts"] });
    4422|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff --since-step > scan-diff --since-step --code exits 1 when the step changed only logs
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:4429:20
    4427|     finish(clone);
    4428|     const r = await scan(clone, file);
    4429|     expect(r.code).toBe(1);
       |                    ^
    4430|     expect(r.json).toEqual({ found: false, paths: [] });
    4431|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 279 passed (282)
   Start at  07:39:46
   Duration  236.81s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-FTRx26/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
