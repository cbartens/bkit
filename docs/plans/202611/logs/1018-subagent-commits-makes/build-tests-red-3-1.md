Enforced: true
Red: 5
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/1018-subagent-commits-makes-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists the subagent's committed file when another feature's run is also in progress" | red | failure: expected [] to deeply equal [ 'src/a.ts' ] |
| 6 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "with no file on a feat/{FID} branch, picks that FID's run when another run is in progress" | red | failure: expected null to be '351756a248dd88d2205bfc985f03ca3804e60…' // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix" | red | failure: expected 1 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/commands/workflow/step-base.test.ts` "skips a build-takeover row written inside the step it measures" | red | failure: expected '002492ee3398c015aa35dbd9c49a017a10225…' to be '351756a248dd88d2205bfc985f03ca3804e60…' // Object.is equality |
| 8 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit" | red | failure: expected [ 'src/a.ts', 'src/foreign.ts' ] to not include 'src/foreign.ts' |

## Gaps

None.

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

 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts (31 tests | 2 failed) 17883ms
   ✓ changedFiles (2)
     ✓ lists modified, staged and untracked files, and leaves out ignored and deleted ones 449ms
     ✓ adds files changed in commits since the base, and drops one a later commit deleted 788ms
   ✓ snapshotTree / changedBetween (5)
     ✓ the tested snapshot holds uncommitted and untracked files 465ms
     ✓ snapshotting leaves the index and working tree as they were 577ms
     ✓ a checkout with no commit yet snapshots with no parent 239ms
     ✓ changedBetween lists the existing files that differ from a snapshot, and the deleted ones apart 629ms
     ✓ changedBetween is null when the snapshot is gone 275ms
   ✓ deletedFiles (1)
     ✓ deletedFiles lists a file removed since the base 477ms
   ✓ importersOf (4)
     ✓ importersOf lists the unchanged files that mention a deleted file's name 295ms
     ✓ importersOf leaves out a file that no longer exists 280ms
     ✓ importersOf returns null when the base tree cannot be searched 263ms
     ✓ importersOf returns null when a blob is unreadable even though another file matched 285ms
   ✓ tests changed (13)
     ✓ tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate 122ms
     ✓ runs bkit:gate:changed with the changed files as its arguments 774ms
     ✓ counts files committed since --base 670ms
     ✓ returns FAIL with exit 1 when bkit:gate:changed fails 788ms
     ✓ runs nothing and exits 0 when no file changed 242ms
     ✓ runs the --fallback gate with no file arguments when bkit:gate:changed is undeclared 538ms
     ✓ runs the --fallback gate even when no file changed, as it did before 533ms
     ✓ exits 3 when neither bkit:gate:changed nor the --fallback gate is declared 218ms
     ✓ exits 4 when the gate could not run 548ms
     ✓ changed-since exits 81 with the holder read from the status file 1627ms
     ✓ exits 4 with no verdict when the status file says the hold limit stopped the gate 609ms
     ✓ exits 1 when the gate exits 75 and writes no status file 638ms
     ✓ refuses a --base that names no commit 303ms
   ❯ tests changed default base (6)
     ✓ lists a file the subagent committed after the last step-done commit 1071ms
     ✓ lists the same file when it is left uncommitted 864ms
     ✓ leaves out a file only the previous step's own commit touched 871ms
     ✓ lists the subagent's file when a later commit sweeps in an uncommitted step-done row 840ms
     × lists the subagent's committed file when another feature's run is also in progress 642ms
     × on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit 960ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-changed.test.ts > tests changed default base > lists the subagent's committed file when another feature's run is also in progress
AssertionError: expected [] to deeply equal [ 'src/a.ts' ]

- Expected
+ Received

- [
-   "src/a.ts",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts:506:27
    504|     commit("subagent commit");
    505|     const r = await changed([]);
    506|     expect(r.json?.files).toEqual(["src/a.ts"]);
       |                           ^
    507|   });
    508|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-changed.test.ts > tests changed default base > on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit
AssertionError: expected [ 'src/a.ts', 'src/foreign.ts' ] to not include 'src/foreign.ts'
 ❯ .bkit/core/engine/commands/workflow/tests-changed.test.ts:530:31
    528|     const r = await changed([]);
    529|     expect(r.json?.files).toContain("src/a.ts");
    530|     expect(r.json?.files).not.toContain("src/foreign.ts");
       |                               ^
    531|   });
    532| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 29 passed (31)
   Start at  12:07:17
   Duration  18.60s (tests 97%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-dP0DTb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

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

 ❯ .bkit/core/engine/commands/workflow/step-base.test.ts (6 tests | 2 failed) 2687ms
   ❯ stepBase (6)
     ✓ returns the commit that holds the last step-done row 587ms
     ✓ with a step name returns the commit of the row before that step's latest row 479ms
     ✓ falls back to the run start commit, and null with no run 389ms
     ✓ returns the parentSha of an uncommitted row even after a later commit sweeps it in 313ms
     × with no file on a feat/{FID} branch, picks that FID's run when another run is in progress 487ms
     × skips a build-takeover row written inside the step it measures 430ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/step-base.test.ts > stepBase > with no file on a feat/{FID} branch, picks that FID's run when another run is in progress
AssertionError: expected null to be '351756a248dd88d2205bfc985f03ca3804e60…' // Object.is equality

- Expected:
"351756a248dd88d2205bfc985f03ca3804e60f47"

+ Received:
null

 ❯ .bkit/core/engine/commands/workflow/step-base.test.ts:122:31
    120|     commit("another feature's run start");
    121|     expect(c2).not.toBe(c1);
    122|     expect(stepBase({ cwd })).toBe(c2);
       |                               ^
    123|   });
    124|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/workflow/step-base.test.ts > stepBase > skips a build-takeover row written inside the step it measures
AssertionError: expected '002492ee3398c015aa35dbd9c49a017a10225…' to be '351756a248dd88d2205bfc985f03ca3804e60…' // Object.is equality

Expected: "351756a248dd88d2205bfc985f03ca3804e60f47"
Received: "002492ee3398c015aa35dbd9c49a017a10225196"

 ❯ .bkit/core/engine/commands/workflow/step-base.test.ts:135:53
    133|     appendRow({ ...done("build-takeover", "2026-11-01T10:08:00Z", fix)…
    134|     expect(fix).not.toBe(c2);
    135|     expect(stepBase({ cwd, step: "build-plan-b" })).toBe(c2);
       |                                                     ^
    136|   });
    137| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 4 passed (6)
   Start at  12:07:38
   Duration  3.02s (tests 95%, transform 2%, setup 2%, import 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-DBTjRg/junit.xml
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

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts (283 tests | 1 failed) 236899ms
   ✓ bkit branches parse (2)
     ✓ parses explicit and existing branch tokens without consuming URLs 549ms
     ✓ rejects missing explicit and ambiguous existing branch selections 478ms
   ✓ branches rebase: classification (31)
     ✓ ledger list does not drift from .gitattributes merge=union 3ms
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
     ✓ refuses src.txt 1ms
     ✓ refuses package.json 1ms
     ✓ refuses .bkit/config.json 1ms
     ✓ refuses docs/testing.md 1ms
     ✓ refuses docs/plans/202608/234-plan.md 1ms
     ✓ refuses apps/web/data.jsonl 1ms
     ✓ refuses docs/plans/202608/logs/234-x/other.jsonl 1ms
     ✓ refuses packages/a/Cargo.lock 1ms
     ✓ matches ledger globs as whole paths: `**` spans any depth, `.` is literal, no prefix match 1ms
     ✓ classifies pnpm-lock.yaml (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies package-lock.json (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies yarn.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies bun.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies Cargo.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies go.sum (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies uv.lock (every manager bkit recognises) as the lockfile shape 1ms
     ✓ classifies every generated register as the register shape, and only at its exact path 1ms
     ✓ classifies a doc as embedding a register only when the repo's script lists it 1ms
     ✓ classifies the install record, and only at its exact path 1ms
     ✓ reads the embedded docs from the script's assignment, and none when it is empty or absent 128ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 679ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 750ms
     ✓ writes the note worktrees setup held during the pause ahead of its own lines, then drops it 518ms
     ✓ a refused --continue carries git's own reason 614ms
     ✓ --file records nothing for a refused rebase 478ms
     ✓ refuses a code conflict and aborts the rebase on the spot 483ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 861ms
     ✓ refuses a mixed set without mutating the resolvable ledger in it 465ms
     ✓ produces byte-identical output to merge=union 1177ms
     ✓ restores a trailing newline so the next append starts on its own line 649ms
     ✓ skips a commit the resolution emptied instead of stalling the rebase 541ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 895ms
     ✓ refuses a union that leaves a line which is not JSON 533ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 732ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 924ms
     ✓ refuses a lockfile whose regenerate command fails 809ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 1214ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 974ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 902ms
     ✓ refuses and aborts when both sides changed the hand-written region 502ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 605ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 825ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 1128ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 1547ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 1530ms
     ✓ refuses and aborts when a side deleted the install record 897ms
     ✓ refuses a conflicted doc the repo's script does not list 675ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 437ms
     ✓ removes a stale sentinel when the rebase succeeds 690ms
     ✓ exits 4 when no rebase is in progress 180ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 965ms
     ✓ resolves a conflict in each of two replayed commits across rounds 944ms
   ✓ branches anchor-stamp (19)
     ✓ prepends a well-formed block to an unstamped file 34ms
     ✓ records the bkit release, and warns visibly under the block when it is outdated 103ms
     ✓ writes the outdated warning the way prettier formats it, and re-stamps it stably 118ms
     ✓ stamps an empty bkitLatest and no warning when the newest release is unknown 40ms
     ✓ --base-ref stamps the given ref instead of origin/dev (audit reports) 35ms
     ✓ is idempotent: stamping twice with the same args is byte-identical 67ms
     ✓ re-stamping with a different base replaces the block instead of adding a second 76ms
     ✓ plan form (--design names an existing design) stamps designPath + its baseSha; design form stamps neither 66ms
     ✓ --design naming a missing file stamps no design lines; a design with no anchor stamps an empty designBaseSha 73ms
     ✓ fails closed on an empty --base-sha and writes nothing 2ms
     ✓ fails closed on a missing file 1ms
     ✓ two identical-content files stamped with the same base stay equal (Close Workflow cmp -s guard) 69ms
     ✓ strips an unterminated block to the end of the file, as sed's range does 1ms
     ✓ stampAnchor: empty file 1ms
     ✓ stampAnchor: no trailing newline (kept as-is) 1ms
     ✓ stampAnchor: two blocks (both removed) 1ms
     ✓ stampAnchor: close on the line after open (body line kept) 1ms
     ✓ stampAnchor: inline lookalike marker is not a block 1ms
     ✓ stampAnchor: empty field block 1ms
   ✓ branches anchor-read (15)
     ✓ round-trips every field 64ms
     ✓ is silent on an unstamped file: a baseSha-shaped body line is not the anchor 2ms
     ✓ matches only inside the block, and the first occurrence wins 1ms
     ✓ exits 13 on a missing file and 2 on an unknown field 2ms
     ✓ --against (build's Plan Current trigger) (6)
       ✓ skips (12) with no plan file 492ms
       ✓ skips (12) with no anchor 689ms
       ✓ skips (12) when the base is unreachable in this clone 522ms
       ✓ skips (12) when nothing landed since the base 518ms
       ✓ runs (0) with the landed path count once dev moved 921ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 685ms
     ✓ readAnchor: two blocks: the first block's value wins 2ms
     ✓ readAnchor: an unterminated block runs to the end of the file 1ms
     ✓ readAnchor: a field after the close line is outside the block 1ms
     ✓ readAnchor: an empty field reads as the empty string 1ms
     ✓ readAnchor: an empty file has no fields 1ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 1103ms
     ✓ refuses a dev push with no shared-checkout record (exit 20) and pushes nothing 890ms
     ✓ a feature-mode push of an amended dev is refused rather than forced 943ms
     ✓ pushes when the pre-push hook prints more than Node's 1MB default 1349ms
     ✓ runs exactly one git push 1738ms
     ✓ --set-upstream records the upstream 977ms
     ✓ refuses with no branch checked out 840ms
     ✓ --mode=dev refuses a feature checkout 494ms
     ✓ --require-ci refuses a HEAD carrying a skip-CI token, in any spelling 1453ms
     ✓ --require-ci merges dev's new ledger rows in before pushing, so GitHub sees no conflict 2008ms
     ✓ --require-ci pushes as-is when dev has not moved 981ms
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 1708ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 2358ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 538ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 892ms
     ✓ --mode=abort pushes when the branch has no open PR 1286ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 808ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 477ms
     ✓ --open-pr carries the MCP answer and skips gh 609ms
     ✓ --mode=abort on dev pushes plainly without probing 610ms
     ✓ rejects an unknown mode 432ms
   ✓ branches push — in place on dev with a shared-checkout record (10)
     ✓ push after a replay reports the pushToDev sha not HEAD 2114ms
     ✓ replay build callback cherry-picks exactly the recorded SHAs 1131ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 2718ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 4484ms
     ✓ skip-ci HEAD on the replay is refused 1004ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 3141ms
     ✓ abort mode on dev with a record pushes only recorded SHAs 3720ms
     ✓ a level local dev is a plain push, recording nothing extra 2537ms
     ✓ a record with no commits pushes nothing 5877ms
     ✓ without a record the dev push is refused (exit 20), pushing nothing 1564ms
   ✓ branches push --mode=plain (5)
     ✓ pushes the branch without a force flag and records the upstream 2182ms
     ✓ a rewritten branch is refused, never forced 1362ms
     ✓ refuses dev and main with exit 21 and pushes nothing 1560ms
     ✓ --ahead-of fetches the ref and refuses a branch with no commits beyond it (exit 21) 3915ms
     ✓ refuses a detached HEAD (exit 5) 1133ms
   ✓ branches push --commit (5)
     ✓ stages everything, makes the marker commit with the auto-route suffix, and pushes it 1882ms
     ✓ the marker commit leaves out a copied-in worktree.copy entry (.env) 2504ms
     ✓ an empty tree still gets the marker commit, without the suffix when bkit:auto is absent 2865ms
     ✓ a re-run after the commit landed pushes again without a second marker commit 4363ms
     ✓ --commit needs --file and --workflow, and refuses a skip-CI token in the message 1093ms
   ✓ branches fast-forward (4)
     ✓ fetches and fast-forwards onto the remote branch 2822ms
     ✓ an up-to-date branch is a no-op 1600ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 2067ms
     ✓ a fetch that fails exits 10 773ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 865ms
     ✓ scan-diff still reports a new skip when its test … 807ms
     ✓ scan-diff reports a skip moved onto a different t… 766ms
     ✓ scan-diff does not cancel a skip moved between am… 710ms
     ✓ scan-diff does not spend an unchanged duplicate t… 787ms
     ✓ scan-diff recognizes a renamed test file 719ms
     ✓ scan-diff recognizes a suite moved into a differe… 746ms
     ✓ scan-diff does not let unrelated additions hide a… 854ms
     ✓ scan-diff attributes deletion to its old test ins… 901ms
     ✓ scan-diff consumes each moved assertion once and … 811ms
     ✓ scan-diff does not match identical assertions fro… 768ms
     ✓ scan-diff does not match the same leaf test name … 881ms
     ✓ scan-diff does not match a same-named test with d… 849ms
     ✓ scan-diff does not match a same-named test with c… 715ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 899ms
     ✓ --paths with no match exits 1 789ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 689ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 1151ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 985ms
     ✓ scan-diff without --base finds a marker the branch added when local dev already contains the branch 668ms
     ✓ --marker reads a diff over 1 MiB 980ms
     ✓ --expect-none turns the answer round: 0 when nothing matched, 1 naming the hits 1008ms
     ✓ --code finds a change outside docs/plans and the ledgers (exit 0), and none when only they changed 766ms
     ✓ scan-diff finds an added skip 711ms
     ✓ scan-diff ignores a skip predating the base 744ms
     ✓ scan-diff reports a disabled test with its line 857ms
     ✓ scan-diff exits 0 on a diff that adds no disabled test 2036ms
     ✓ scan-diff ignores a removed comment in a test file 663ms
     ✓ scan-diff ignores an assertion moved within the file 691ms
     ✓ scan-diff still reports a removed assertion 683ms
     ✓ scan-diff reports an assertion re-added only outside the test file 666ms
     ✓ scan-diff finds an added pytest mark skip 864ms
     ✓ scan-diff finds an added unittest skip 748ms
     ✓ scan-diff finds an added bare skip call 824ms
     ✓ scan-diff ignores a quoted skip in a documentation file 1307ms
     ✓ scan-diff ignores a marker literal in a non-test source file 704ms
     ✓ scan-diff ignores an assertion whose expectation changed 667ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 567ms
     ✓ scan-diff reports a deleted test file 697ms
     ✓ scan-diff never opens a symlinked test file's outside target 5ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 545ms
   ✓ branches force-build (8)
     ✓ with an open PR: adds the marker to the title, then pushes the empty marker commit 1735ms
     ✓ a title that already carries the marker is left alone 1550ms
     ✓ with no open PR: pushes the marker commit and edits no title 2128ms
     ✓ a re-run is deduped: no second marker commit 1903ms
     ✓ keys the row on the run that just closed, so the next run makes its own commit 1500ms
     ✓ gh unavailable hands the PR to MCP (80) before committing anything 469ms
     ✓ --title-set skips gh entirely 772ms
     ✓ refuses dev and main (exit 21) 398ms
   ✓ branches sync feature coverage (3)
     ✓ invalidates coverage when only an imported merge result changes 1792ms
     ✓ retains coverage across proven automatic dev integration and bookkeeping 2184ms
     ✓ invalidates coverage for feature content resolved inside a dev merge 665ms
   ✓ branches sync feature reconciliation (10)
     ✓ reconciles with tracked workflow bookkeeping but refuses unrelated dirty code 1512ms
     ✓ continues only the explicitly recorded target through the public merge command 987ms
     ✓ fetches the unseen feature head before classifying the base 862ms
     ✓ fast forwards the feature before either base path is chosen 1593ms
     ✓ merges divergent feature tips without rebasing either side 891ms
     ✓ continues the feature merge before starting a dev merge 1548ms
     ✓ publishes local code with a CI running head before bookkeeping 3581ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 2381ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 1566ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 1251ms
   ✓ branches sync (28)
     ✓ Path A when origin/dev is an ancestor of HEAD 288ms
     ✓ Path B once dev moved; --head checks a given commit 427ms
     ✓ Path B once dev moved, from a clone whose fetch refspec omits dev 398ms
     ✓ --merge-docs merges dev when docs/ is behind 603ms
     ✓ --merge-docs merges dev when only a ledger outside docs/ moved on dev 514ms
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 740ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 678ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 797ms
     ✓ --merge-docs skips an empty bkit:generate script 769ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 636ms
     ✓ --merge-docs never merges on dev itself 609ms
     ✓ --merge-docs takes dev's side for a conflicted docs/ file 795ms
     ✓ --merge-docs unions a conflicted ledger instead of dropping the branch's rows 635ms
     ✓ --merge-docs aborts (11) on a conflict outside docs/ 499ms
     ✓ --merge merges dev into the feature branch with a merge commit, never a rebase 496ms
     ✓ --merge does nothing when origin/dev is already an ancestor, and clears a stale sentinel 274ms
     ✓ --merge commits the run's uncommitted work first, so a ledger dev also appended to can merge 659ms
     ✓ --merge regenerates a conflicted lockfile from dev's copy 717ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 923ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 761ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 854ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 967ms
     ✓ --merge merges the install record entry by entry, taking dev's value where both sides changed one 790ms
     ✓ --merge settles a doc's generated block on dev's copy and rebuilds its register 1193ms
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1369ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 566ms
     ✓ exits 10 when the fetch fails 447ms
     ✓ refuses --merge-docs with --head, and an unknown --head 560ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 730ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1047ms
     ✓ a failed install stops ship (16) 614ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 443ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 437ms
     ✓ exits 10 when the fetch fails 313ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 227ms
     ✓ preserves unlanded file type changes in the shared landed comparison 255ms
   ✓ branches land (28)
     ✓ refuses a workflow other than design or plan 176ms
     ✓ local: stops (17) when this run's artifacts were written to the main checkout, untracked 322ms
     ✓ local: squashes feat/{fid} onto origin/dev, commits `design DONE`, pushes, fast-forwards dev, and audits 1161ms
     ✓ local: lands with files staged in the main checkout and leaves them staged 1198ms
     ✓ local: dev with commits of its own is left alone; only the close is pushed 1169ms
     ✓ local: the main checkout on another branch stays there; only the dev pointer moves 1084ms
     ✓ dev moved during the push: rebuilds on the new dev and pushes again 2407ms
     ✓ dev moved before every push: stops (8) with nothing landed and the branch kept 2949ms
     ✓ local: stops (17) when the squash would bring non-doc files to dev 567ms
     ✓ local: names unpushed dev as the cause when the branch carries it 532ms
     ✓ local: separates this run's own non-doc file from the unpushed dev work it inherited 502ms
     ✓ PR shape: dev refuses the push → pushes the roadmap commit, then hands PR creation to MCP (80, stage open) without gh 1376ms
     ✓ PR shape on a laptop: commits the roadmap row in the worktree holding the branch 1204ms
     ✓ PR merge refused: updates the PR branch from dev and merges on the next try 921ms
     ✓ uses tree entry equivalence for design and plan land cleanup 4134ms
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 984ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 1054ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1926ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 784ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 1335ms
     ✓ land removes the worktree when only the copied .env is untracked 1082ms
     ✓ land keeps the worktree for real leftovers and names only them, not the copied .env 990ms
     ✓ local: lands and audits from a clone whose fetch refspec omits dev 1289ms
     ✓ a concurrent landing already moved local dev past this close: localDev is current, no publish advice 1738ms
     ✓ local: a locked throwaway checkout left by a killed close is removed, then the close lands 1031ms
     ✓ landPr refuses a main-based PR without retrying 532ms
     ✓ landPr refuses when the PR base is unknown 561ms
     ✓ PR not open (closed): stops (17) at once, no retry 636ms
   ✓ branches regenerate (9)
     ✓ commits only what bkit:generate changed; the run's status.jsonl stays uncommitted 394ms
     ✓ --attempt names the merge round in a fix commit 353ms
     ✓ commits a rewritten and a deleted tracked file 356ms
     ✓ reports unchanged and commits nothing when bkit:generate changed nothing 304ms
     ✓ reports undeclared and runs nothing with no scripts 225ms
     ✓ reports undeclared and runs nothing with an empty script 222ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 276ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 325ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 238ms
   ❯ branches scan-diff --since-step (4)
     ✓ scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish 329ms
     ✓ scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it 312ms
     ✓ scan-diff --since-step --code exits 1 when the step changed only logs 350ms
     × scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix 369ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/branches.test.ts > branches scan-diff --since-step > scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/branches.test.ts:4451:20
    4449|     finish(clone);
    4450|     const r = await scan(clone, file);
    4451|     expect(r.code).toBe(0);
       |                    ^
    4452|     expect(r.json).toEqual({ found: true, paths: ["src/fix.ts"] });
    4453|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 282 passed (283)
   Start at  12:07:43
   Duration  237.43s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-c0VOHN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
