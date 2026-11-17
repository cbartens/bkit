Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "ship switches the PR conflict check off for every push" | red | failure: expected ' "{BKIT}" branches push --mode=plai…' to contain 'BKIT_PR_CONFLICT_CHECK=false' |
| 11 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "debug switches the PR conflict check off for every feature-branch push" | red | failure: expected ' "{BKIT}" branches push --mode=feat…' to contain 'BKIT_PR_CONFLICT_CHECK=false' |
| 12 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "shallow clone → no base fetch, warns, gates run" | red | failure: .bkit/templates/.husky/pre-push: expected [ Array(1) ] to deeply equal [] |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/ship-invariants.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/ship-invariants.test.ts

[test-timeout-budget] load average 18.2 on 10 cores: unit limits 13601ms per test, 27201ms per hook (x2.72)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (70 tests | 1 failed) 150ms
   ✓ deferred sweep — disabled-test evidence (4)
     ✓ adjudicates every scanner hit against the diff and current coverage 4ms
     ✓ requires scoped owner approval and current-contract evidence for retirement 1ms
     ✓ blocks scan errors, real disabling markers and unproven deletions 0ms
     ✓ records each disposition and requires complete adjudication before PASS 0ms
   ✓ ship reconciliation and retry contracts (7)
     ✓ reconciles and publishes feature code before bookkeeping on every ship path 7ms
     ✓ routes stale bases and refused merges through the bounded integration or validation loop 2ms
     ✓ routes late revalidation code and gate seventeen through reconciliation before merge 4ms
     ✓ ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close 5ms
     ✓ routes MCP safety facts through engine decisions with transport accounting 12ms
     ✓ refreshes merge-aware feature coverage immediately before both reuse decisions 2ms
     ✓ ties deferred sweep and docs reuse to the recorded feature code state 2ms
   ✓ bkit-ship.md — staging hygiene (banned patterns) (2)
     ✓ has no `git add -A` anywhere (full content) 1ms
     ✓ has no literal `git add` anywhere — every stage goes through bkit ledgers 3ms
   ✓ bkit-ship.md — push-timing invariant (feature-branch pushes before merge) (7)
     ✓ pushes feature code during entry and base reconciliation, integration, bookkeeping and fixes 3ms
     ✓ regenerates only in the Merge Gate, after a red CI run, never up front in Base Check 2ms
     ✓ never force-pushes, with or without lease 2ms
     ✓ the Integrate push is a plain push of the locally merged branch 3ms
     ✓ the pre-merge bookkeeping push is a plain push — never forced 1ms
     ✓ the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row 2ms
     ✓ pushes the branch to open a missing PR only when ahead of dev, non-force, before bkit prs open 2ms
   ✓ bkit-ship.md — bookkeeping and status writes (4)
     ✓ Step 1 resolves the status log through bkit status path, inside the worktree 1ms
     ✓ Step 1 opens the run in the worktree straight after the lock, before any tracker write 1ms
     ✓ no fence reassigns STATUS — every status write takes the resolved {STATUS} 3ms
     ✓ every ship audit row is written through a command, into {STATUS} 5ms
   ✓ every workflow writes its own workflow-started row (#492) (5)
     ✓ bkit-design.md opens its run with bkit workflows start --workflow=design 2ms
     ✓ bkit-plan.md opens its run with bkit workflows start --workflow=plan 3ms
     ✓ bkit-build.md opens its run with bkit workflows start --workflow=build 3ms
     ✓ bkit-debug.md opens its run with bkit workflows start --workflow=debug 2ms
     ✓ bkit-ship.md opens its run with bkit workflows start --workflow=ship 1ms
   ✓ no workflow bash block appends to status.jsonl or .bkit/issues.jsonl with >> (#467) (6)
     ✓ bkit-design.md 1ms
     ✓ bkit-plan.md 1ms
     ✓ bkit-build.md 1ms
     ✓ bkit-debug.md 1ms
     ✓ bkit-ship.md 1ms
     ✓ RED-PROOF: the hand-append shapes are caught 0ms
   ✓ bkit-ship.md — Step 6 SHIPPED row comes from bkit roadmap feature --strict (#380) (2)
     ✓ appends the SHIPPED row mechanically into the worktree ledger, not through the update-docs prompt 3ms
     ✓ a row that did not land stops the step — no re-grep of the ledger 1ms
   ✓ bkit-ship.md — canonical 12 ship-* step-key set (1)
     ✓ bkit-ship.md — canonical 12 ship-* step-key set publishes the canonical 12 ship-* step-key set (no invented names) 2ms
   ✓ bkit-ship.md — the merge is pinned to the head the gate passed (3)
     ✓ never merges through raw gh pr merge 1ms
     ✓ the merge gate runs before bkit prs merge, which is pinned to the gate's head 1ms
     ✓ F4a: the merge gate is handed the run's status log, and snapshots before deciding 1ms
   ✓ bkit-ship.md — dev writes live in commands (1)
     ✓ no fence checks out, commits to or pushes dev by hand; sync-dev, close and flush do 3ms
   ✓ bkit-ship.md — build-challenge remediation regressions (4)
     ✓ F1: Integrate merges origin/dev through bkit branches sync --merge and commits nothing by hand 3ms
     ✓ F2: no single-quoted jq program carries a shell ${...} expansion 1ms
     ✓ F3: ship never requests a server-side update-branch, through bkit or raw gh 1ms
     ✓ F5: gate code 11 (poll) routes to Step 9 alongside codes 10 and 14 1ms
   ✓ bkit-ship.md — #363: the auto-route marker comes from labels re-read at the merge (2)
     ✓ no cross-Bash-tool-call handoff survives anywhere in the workflow 1ms
     ✓ Step 10 re-reads the labels through the tracker and passes them to the merge 1ms
   ✓ bkit-ship.md — Failure Path single-write contract (9)
     ✓ records the failure through bkit workflows fail, booked where the runtime books 1ms
     ✓ flushes through bkit workflows handover --flush, once 1ms
     ✓ runs no git push, commit or second write of its own 1ms
     ✓ the Failure Path re-runs workflows fail without --next-step only on the --next-step refusal 1ms
     ✓ does not route any step back into the Failure Path 1ms
     ✓ writes .deferred-blocked with touch under BOOK_ROOT 7ms
     ✓ gitignores routing sentinels in the rendered file and the template source 1ms
     ✓ wires bkit ledgers into exactly 1 bash region 1ms
     ✓ every bkit ledgers stage / commit stops the step on a non-zero exit 1ms
   ✓ bkit-ship.md — issue-less runs and the main guard (5)
     ✓ Step 10 label re-read skips when ISSUE_ID is empty 1ms
     ✓ naming warning comes from worktrees setup, which reads the issue only when there is one 1ms
     ✓ Step 10 MCP merge asserts base dev 1ms
     ✓ Step 12.3 labels skip when ISSUE_ID is empty 1ms
     ✓ a ship on dev or main prints the engine refusal and stops 1ms
   ✓ bkit-ship.md — red CI names /bkit-debug (7)
     ✓ Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other 2ms
     ✓ Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened 1ms
     ✓ Step 2 passes every CI wait exit above 1 through and ends the turn on exit 81 1ms
     ✓ the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it 2ms
     ✓ Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP 1ms
     ✓ the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it 1ms
     ✓ the Failure Path re-runs workflows fail without --next-step on the --next-step refusal exit 1ms
   ❯ ship PR conflict check switch (1)
     × ship switches the PR conflict check off for every push 11ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > ship PR conflict check switch > ship switches the PR conflict check off for every push
AssertionError: expected '   "{BKIT}" branches push --mode=plai…' to contain 'BKIT_PR_CONFLICT_CHECK=false'

Expected: "BKIT_PR_CONFLICT_CHECK=false"
Received: "   "{BKIT}" branches push --mode=plain >/dev/null"

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:1090:48
    1088|       .filter((line) => line.includes("branches push"));
    1089|     expect(pushLines.length).toBeGreaterThanOrEqual(6);
    1090|     for (const line of pushLines) expect(line).toContain("BKIT_PR_CONF…
       |                                                ^
    1091|   });
    1092| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 69 passed (70)
   Start at  18:29:29
   Duration  726ms (tests 37%, transform 33%, setup 25%, import 3%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-A4jRTa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts

[test-timeout-budget] load average 17.9 on 10 cores: unit limits 13450ms per test, 26900ms per hook (x2.69)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts (9 tests | 1 failed) 106036ms
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 17287ms
     ✓ records the failed job count and reads an uncounted local round as unknown 12429ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 9858ms
     ✓ finishes the first CI evidence round of the second debug run 4043ms
     ✓ checks the complete selected CI fix sequence against green and red final runs 13856ms
     ✓ reloads saved fixes and recollects explicitly replaced evidence generations 16129ms
     ✓ preserves local and repro overrides across actual workflow command sequences 24390ms
     ✓ blocks missing logs and wrong-branch evidence before source edits 8030ms
   ❯ Debug PR conflict check switch (1)
     × debug switches the PR conflict check off for every feature-branch push 11ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug PR conflict check switch > debug switches the PR conflict check off for every feature-branch push
AssertionError: expected '   "{BKIT}" branches push --mode=feat…' to contain 'BKIT_PR_CONFLICT_CHECK=false'

Expected: "BKIT_PR_CONFLICT_CHECK=false"
Received: "   "{BKIT}" branches push --mode=feature"

 ❯ .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:623:48
    621|     );
    622|     expect(pushLines.length).toBeGreaterThanOrEqual(4);
    623|     for (const line of pushLines) expect(line).toContain("BKIT_PR_CONF…
       |                                                ^
    624|   });
    625| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 8 passed (9)
   Start at  18:29:34
   Duration  106.82s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5jvzEP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

[test-timeout-budget] load average 20.6 on 10 cores: unit limits 14800ms per test, 29600ms per hook (x2.96)

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (129 tests | 1 failed) 133996ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 85ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 1304ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 642ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 135ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 771ms
     ✓ .husky/pre-push: empty stdin → gates still run 741ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 414ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 84ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 506ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 435ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 565ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 159ms
     ✓ .husky/pre-push: first and last lines name the log 514ms
     ✓ .husky/pre-push: the hook body runs once 443ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 645ms
     ✓ tag delete alongside that tag → still skipped 636ms
     ✓ tag on a commit no origin branch holds → gates run 1236ms
     ✓ tag pushed with a branch → gates run 1314ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 601ms
     ✓ release branch and a tag, both already tested → still skipped 590ms
     ✓ branch with files no origin dev / main tip has → gates run 1159ms
     ✓ dev push with the files origin/dev already has → gates run 672ms
     ✓ main push with the files origin/main already has → gates run 691ms
     ✓ no origin dev / main ref fetched → a branch push gates 1097ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 662ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 819ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 863ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 1627ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1140ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1452ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 802ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 879ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 944ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 929ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1385ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1255ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 911ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 986ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 526ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 463ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 525ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 586ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 526ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 571ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 444ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 449ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 442ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 481ms
     ✓ .husky/pre-push: a gate fails → no disk prune 482ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 485ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 457ms
     ✓ a stale register stops the push before any gate runs 443ms
     ✓ bkit check fails → the push stops before any gate runs 442ms
     ✓ the dependency audit runs before any gate, when its script is present 525ms
     ✓ no dependency-audit script → skipped, the gates still run 456ms
     ✓ no register script → skipped, the gates still run 451ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 698ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 584ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 574ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 537ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 608ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 576ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 621ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 557ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 11ms
     ✓ push to dev, register current → push goes on 11ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 10ms
     ✓ push to another branch → no check, push goes on 289ms
     ✓ revert push to dev → no check, push goes on 141ms
     ✓ graphify not adopted → nothing runs 6ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 387ms
     ✓ branch with an open PR into dev, register current → push goes on 386ms
     ✓ branch with no open PR → no check, push goes on 514ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 138ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 553ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 393ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 135ms
     ✓ revert push of a branch with an open PR → no check 139ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 599ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 451ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 460ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 903ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2180ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 2156ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1622ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2428ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1304ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1441ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1515ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1693ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1799ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1921ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1569ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2310ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 2262ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1927ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2612ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1319ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1451ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1483ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1700ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1658ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 2876ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1624ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1357ms
     ✓ .husky/pre-push: a code push still runs them 1578ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 1278ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 419ms
     ✓ no .envrc → no direnv call 566ms
     ✓ direnv not on PATH → gates run, no warning 1259ms
     ✓ CI set → no direnv call 594ms
     ✓ delete-only push through direnv exec → exit 0, no gate 3290ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 730ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1068ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1152ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 2376ms
   ❯ .husky/pre-push PR conflict (13)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 2238ms
     ✓ open PR that merges cleanly → gates run, no message 2448ms
     ✓ no open PR → no fetch, gates run 2213ms
     ✓ gh not on PATH → warns, gates run 1465ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1878ms
     ✓ base fetch fails → warns, gates run 2750ms
     ✓ dev push → no PR lookup 1861ms
     ✓ min push of a conflicting PR → blocked 2130ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 1825ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 2447ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 2143ms
     ✓ fork PR with the same head branch name → ignored, gates run 1962ms
     × shallow clone → no base fetch, warns, gates run 2982ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > shallow clone → no base fetch, warns, gates run
AssertionError: .bkit/templates/.husky/pre-push: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "fetch --quiet origin +refs/heads/dev:refs/remotes/origin/dev",
+ ]

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1957:9
    1955|         r.git.filter((l) => l.startsWith("fetch")),
    1956|         hook,
    1957|       ).toEqual([]);
       |         ^
    1958|       expect(r.stderr, hook).toMatch(/shallow/i);
    1959|       expect(r.stderr, hook).toContain("git fetch --unshallow");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 128 passed (129)
   Start at  18:31:24
   Duration  134.51s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jlMqBJ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
