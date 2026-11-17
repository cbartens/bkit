Enforced: true
Red: 6
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run" | red | failure: .bkit/templates/.husky/pre-push: expected 1 to be +0 // Object.is equality |
| 5 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "ship switches the PR conflict check off for its pushes before Step 4, and only those" | red | failure: expected ' "{BKIT}" branches push --mode=pl…' to contain 'BKIT_PR_CONFLICT_CHECK=false' |
| 6 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR whose only conflict is a merge=union ledger → blocked" | red | failure: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality |
| 7 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "single-branch fetch refspec → checks the fetched base, no false block" | red | failure: .bkit/templates/.husky/pre-push: expected 1 to be +0 // Object.is equality |
| 8 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA" | red | failure: expected false to be true // Object.is equality |
| 9 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "fork PR with the same head branch name → ignored, gates run" | red | failure: .bkit/templates/.husky/pre-push: expected 1 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

[test-timeout-budget] load average 29.5 on 10 cores: unit limits 19250ms per test, 38500ms per hook (x3.85)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (128 tests | 4 failed) 123834ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 49ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 474ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 434ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 76ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 467ms
     ✓ .husky/pre-push: empty stdin → gates still run 473ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 235ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 43ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 245ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 235ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 259ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 83ms
     ✓ .husky/pre-push: first and last lines name the log 294ms
     ✓ .husky/pre-push: the hook body runs once 262ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 251ms
     ✓ tag delete alongside that tag → still skipped 276ms
     ✓ tag on a commit no origin branch holds → gates run 605ms
     ✓ tag pushed with a branch → gates run 653ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 210ms
     ✓ release branch and a tag, both already tested → still skipped 279ms
     ✓ branch with files no origin dev / main tip has → gates run 784ms
     ✓ dev push with the files origin/dev already has → gates run 771ms
     ✓ main push with the files origin/main already has → gates run 555ms
     ✓ no origin dev / main ref fetched → a branch push gates 604ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 672ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 662ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 838ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 646ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 812ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 778ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 630ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 628ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 635ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 729ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1114ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1037ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 758ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 885ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 527ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 420ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 412ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 466ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 419ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 453ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 391ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 379ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 433ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 400ms
     ✓ .husky/pre-push: a gate fails → no disk prune 408ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 440ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 402ms
     ✓ a stale register stops the push before any gate runs 395ms
     ✓ bkit check fails → the push stops before any gate runs 378ms
     ✓ the dependency audit runs before any gate, when its script is present 420ms
     ✓ no dependency-audit script → skipped, the gates still run 379ms
     ✓ no register script → skipped, the gates still run 359ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 476ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 423ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 475ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 420ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 468ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 453ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 506ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 478ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 8ms
     ✓ push to dev, register current → push goes on 7ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 7ms
     ✓ push to another branch → no check, push goes on 212ms
     ✓ revert push to dev → no check, push goes on 107ms
     ✓ graphify not adopted → nothing runs 5ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 424ms
     ✓ branch with an open PR into dev, register current → push goes on 539ms
     ✓ branch with no open PR → no check, push goes on 805ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 244ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 568ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 390ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 128ms
     ✓ revert push of a branch with an open PR → no check 126ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 583ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 395ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 471ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 841ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2060ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 1538ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1153ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1785ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1198ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1432ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1161ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1128ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1221ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 2011ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1191ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1497ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 1952ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1589ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2887ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2197ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2240ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2349ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3492ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 3485ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 2952ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 2355ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 2287ms
     ✓ .husky/pre-push: a code push still runs them 2128ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 1422ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 636ms
     ✓ no .envrc → no direnv call 902ms
     ✓ direnv not on PATH → gates run, no warning 1655ms
     ✓ CI set → no direnv call 753ms
     ✓ delete-only push through direnv exec → exit 0, no gate 776ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1451ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1070ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1356ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 2621ms
   ❯ .husky/pre-push PR conflict (12)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 3747ms
     ✓ open PR that merges cleanly → gates run, no message 2409ms
     ✓ no open PR → no fetch, gates run 2065ms
     ✓ gh not on PATH → warns, gates run 1780ms
     ✓ gh not on PATH → warns, gates run for both hook copies 1905ms
     ✓ base fetch fails → warns, gates run 2196ms
     ✓ dev push → no PR lookup 1950ms
     ✓ min push of a conflicting PR → blocked 2634ms
     × BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 2130ms
     × open PR whose only conflict is a merge=union ledger → blocked 2541ms
     × single-branch fetch refspec → checks the fetched base, no false block 1986ms
     × fork PR with the same head branch name → ignored, gates run 2073ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run
AssertionError: .bkit/templates/.husky/pre-push: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1846:30
    1844|     for (const hook of HOOKS) {
    1845|       const r = push(hook, { env: { BKIT_PR_CONFLICT_CHECK: "false" } …
    1846|       expect(r.status, hook).toBe(0);
       |                              ^
    1847|       expect(r.stderr, hook).toContain(
    1848|         "[pre-push] PR conflict check off (BKIT_PR_CONFLICT_CHECK=fals…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > open PR whose only conflict is a merge=union ledger → blocked
AssertionError: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1879:30
    1877|     for (const hook of HOOKS) {
    1878|       const r = push(hook);
    1879|       expect(r.status, hook).toBe(1);
       |                              ^
    1880|       expect(r.stderr, hook).toContain("BLOCKED");
    1881|       expect(r.stderr, hook).toContain("a.jsonl");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > single-branch fetch refspec → checks the fetched base, no false block
AssertionError: .bkit/templates/.husky/pre-push: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1895:30
    1893|       gitIn("update-ref", "-d", "refs/remotes/origin/dev");
    1894|       const r = push(hook);
    1895|       expect(r.status, hook).toBe(0);
       |                              ^
    1896|       expect(r.stderr, hook).not.toContain("BLOCKED");
    1897|       expect(r.gated, hook).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > fork PR with the same head branch name → ignored, gates run
AssertionError: .bkit/templates/.husky/pre-push: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1918:30
    1916|     for (const hook of HOOKS) {
    1917|       const r = push(hook);
    1918|       expect(r.status, hook).toBe(0);
       |                              ^
    1919|       expect(r.stderr, hook).not.toContain("BLOCKED");
    1920|       expect(r.gated, hook).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 124 passed (128)
   Start at  13:39:39
   Duration  124.14s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mD4xgm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/ship-invariants.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/ship-invariants.test.ts

[test-timeout-budget] load average 14.8 on 10 cores: unit limits 11900ms per test, 23800ms per hook (x2.38)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (70 tests | 1 failed) 90ms
   ✓ deferred sweep — disabled-test evidence (4)
     ✓ adjudicates every scanner hit against the diff and current coverage 3ms
     ✓ requires scoped owner approval and current-contract evidence for retirement 1ms
     ✓ blocks scan errors, real disabling markers and unproven deletions 0ms
     ✓ records each disposition and requires complete adjudication before PASS 0ms
   ✓ ship reconciliation and retry contracts (7)
     ✓ reconciles and publishes feature code before bookkeeping on every ship path 3ms
     ✓ routes stale bases and refused merges through the bounded integration or validation loop 2ms
     ✓ routes late revalidation code and gate seventeen through reconciliation before merge 3ms
     ✓ ship reconciliation and retry contracts passes the actual merge target and defers branch deletion to guarded close 2ms
     ✓ routes MCP safety facts through engine decisions with transport accounting 5ms
     ✓ refreshes merge-aware feature coverage immediately before both reuse decisions 1ms
     ✓ ties deferred sweep and docs reuse to the recorded feature code state 1ms
   ✓ bkit-ship.md — staging hygiene (banned patterns) (2)
     ✓ has no `git add -A` anywhere (full content) 1ms
     ✓ has no literal `git add` anywhere — every stage goes through bkit ledgers 1ms
   ✓ bkit-ship.md — push-timing invariant (feature-branch pushes before merge) (7)
     ✓ pushes feature code during entry and base reconciliation, integration, bookkeeping and fixes 1ms
     ✓ regenerates only in the Merge Gate, after a red CI run, never up front in Base Check 1ms
     ✓ never force-pushes, with or without lease 1ms
     ✓ the Integrate push is a plain push of the locally merged branch 1ms
     ✓ the pre-merge bookkeeping push is a plain push — never forced 1ms
     ✓ the pre-merge bookkeeping commit stages through bkit ledgers --scope=pr, after the step-done row 1ms
     ✓ pushes the branch to open a missing PR only when ahead of dev, non-force, before bkit prs open 1ms
   ✓ bkit-ship.md — bookkeeping and status writes (4)
     ✓ Step 1 resolves the status log through bkit status path, inside the worktree 1ms
     ✓ Step 1 opens the run in the worktree straight after the lock, before any tracker write 1ms
     ✓ no fence reassigns STATUS — every status write takes the resolved {STATUS} 2ms
     ✓ every ship audit row is written through a command, into {STATUS} 2ms
   ✓ every workflow writes its own workflow-started row (#492) (5)
     ✓ bkit-design.md opens its run with bkit workflows start --workflow=design 1ms
     ✓ bkit-plan.md opens its run with bkit workflows start --workflow=plan 1ms
     ✓ bkit-build.md opens its run with bkit workflows start --workflow=build 2ms
     ✓ bkit-debug.md opens its run with bkit workflows start --workflow=debug 1ms
     ✓ bkit-ship.md opens its run with bkit workflows start --workflow=ship 1ms
   ✓ no workflow bash block appends to status.jsonl or .bkit/issues.jsonl with >> (#467) (6)
     ✓ bkit-design.md 1ms
     ✓ bkit-plan.md 0ms
     ✓ bkit-build.md 1ms
     ✓ bkit-debug.md 0ms
     ✓ bkit-ship.md 0ms
     ✓ RED-PROOF: the hand-append shapes are caught 0ms
   ✓ bkit-ship.md — Step 6 SHIPPED row comes from bkit roadmap feature --strict (#380) (2)
     ✓ appends the SHIPPED row mechanically into the worktree ledger, not through the update-docs prompt 1ms
     ✓ a row that did not land stops the step — no re-grep of the ledger 1ms
   ✓ bkit-ship.md — canonical 12 ship-* step-key set (1)
     ✓ bkit-ship.md — canonical 12 ship-* step-key set publishes the canonical 12 ship-* step-key set (no invented names) 2ms
   ✓ bkit-ship.md — the merge is pinned to the head the gate passed (3)
     ✓ never merges through raw gh pr merge 0ms
     ✓ the merge gate runs before bkit prs merge, which is pinned to the gate's head 1ms
     ✓ F4a: the merge gate is handed the run's status log, and snapshots before deciding 1ms
   ✓ bkit-ship.md — dev writes live in commands (1)
     ✓ no fence checks out, commits to or pushes dev by hand; sync-dev, close and flush do 2ms
   ✓ bkit-ship.md — build-challenge remediation regressions (4)
     ✓ F1: Integrate merges origin/dev through bkit branches sync --merge and commits nothing by hand 1ms
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
     ✓ writes .deferred-blocked with touch under BOOK_ROOT 1ms
     ✓ gitignores routing sentinels in the rendered file and the template source 0ms
     ✓ wires bkit ledgers into exactly 1 bash region 3ms
     ✓ every bkit ledgers stage / commit stops the step on a non-zero exit 1ms
   ✓ bkit-ship.md — issue-less runs and the main guard (5)
     ✓ Step 10 label re-read skips when ISSUE_ID is empty 1ms
     ✓ naming warning comes from worktrees setup, which reads the issue only when there is one 1ms
     ✓ Step 10 MCP merge asserts base dev 1ms
     ✓ Step 12.3 labels skip when ISSUE_ID is empty 1ms
     ✓ a ship on dev or main prints the engine refusal and stops 0ms
   ✓ bkit-ship.md — red CI names /bkit-debug (7)
     ✓ Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other 2ms
     ✓ Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened 1ms
     ✓ Step 2 passes every CI wait exit above 1 through and ends the turn on exit 81 1ms
     ✓ the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it 1ms
     ✓ Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP 1ms
     ✓ the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it 1ms
     ✓ the Failure Path re-runs workflows fail without --next-step on the --next-step refusal exit 1ms
   ❯ ship PR conflict check switch (1)
     × ship switches the PR conflict check off for its pushes before Step 4, and only those 9ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/ship-invariants.test.ts > ship PR conflict check switch > ship switches the PR conflict check off for its pushes before Step 4, and only those
AssertionError: expected '     "{BKIT}" branches push --mode=pl…' to contain 'BKIT_PR_CONFLICT_CHECK=false'

Expected: "BKIT_PR_CONFLICT_CHECK=false"
Received: "     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null"

 ❯ .bkit/core/engine/audits/workflows/ship-invariants.test.ts:1094:45
    1092|     const after = pushLines(ship.slice(step4));
    1093|     expect(before.length).toBeGreaterThanOrEqual(3);
    1094|     for (const line of before) expect(line).toContain("BKIT_PR_CONFLIC…
       |                                             ^
    1095|     expect(after.length).toBeGreaterThan(0);
    1096|     for (const line of after) expect(line).not.toContain("BKIT_PR_CONF…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 69 passed (70)
   Start at  13:41:45
   Duration  364ms (tests 49%, setup 33%, import 7%, transform 6%, worker 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Plz5Hj/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/tips/catalogue.test.ts

```

## Runner output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/tips/catalogue.test.ts

[test-timeout-budget] load average 14.5 on 10 cores: unit limits 11750ms per test, 23500ms per hook (x2.35)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts (66 tests | 1 failed) 898ms
   ✓ SETUP_TIPS — catalogue (16)
     ✓ every tip carries every text field 5ms
     ✓ ALL_WORKFLOWS names every phase workflow; EVERY_CONTEXT every tips context 0ms
     ✓ the upgrade tip leads the catalogue and matters in every context 0ms
     ✓ comms tips matter in every context, and every context has its own tips 0ms
     ✓ design leads with serena once the comms tips are done 0ms
     ✓ plan leads with serena once the comms tips are done 0ms
     ✓ build leads with serena once the comms tips are done 0ms
     ✓ debug leads with context-fetch once the comms tips are done 0ms
     ✓ ship leads with ci-workflow once the comms tips are done 0ms
     ✓ audit leads with serena once the comms tips are done 0ms
     ✓ utility leads with serena once the comms tips are done 0ms
     ✓ audit tips are the code-reading, CI and dependency-safety ones 0ms
     ✓ every template path an ask names exists 2ms
     ✓ ids are unique and never collide with an advisory id 6ms
     ✓ every reused advisory id is one a detector emits 5ms
     ✓ every docs pointer in steps resolves to a heading 23ms
   ❯ SETUP_TIPS — detection (50)
     ✓ tracker fires exactly when tracker-setup-none does 3ms
     ✓ tracker stays quiet once github is chosen 4ms
     ✓ tracker stays quiet once linear is chosen 2ms
     ✓ tracker stays quiet once jira is chosen 2ms
     ✓ gh-mcp fires only for the GitHub tracker 2ms
     ✓ gh-mcp stays quiet about the token inside the pre-push hook's inner run 2ms
     ✓ bkit-env fires until every token the github tracker needs is set 3ms
     ✓ bkit-env fires until every token the linear tracker needs is set 4ms
     ✓ bkit-env fires until every token the jira tracker needs is set 2ms
     ✓ issue-forms fires only for the GitHub tracker with no issue template folder 2ms
     ✓ direnv stays quiet until .bkit/.env exists 1ms
     ✓ context-fetch fires exactly when context-fetch-missing does 3ms
     ✓ ignoring context-fetch-missing does not drop a context-fetch-unbounded finding 44ms
     ✓ bkit-env ask names no worktree remedy, since fires reads the main checkout 1ms
     ✓ dependabot-renovate fires exactly when dep-updater-absent does 4ms
     ✓ trivy fires once workflows exist and none runs the scan 4ms
     ✓ test-lint stays quiet until the repo lists a JS test runner 2ms
     ✓ test-lint fires for vitest in devDependencies with no test linter 2ms
     ✓ test-lint fires for jest in dependencies with no test linter 1ms
     ✓ test-lint goes quiet once .oxlintrc.json lints tests 2ms
     ✓ test-lint goes quiet once oxlint.config.ts lints tests 3ms
     ✓ test-lint goes quiet once eslint.config.js lints tests 2ms
     ✓ test-lint goes quiet once .eslintrc.json lints tests 2ms
     ✓ test-lint goes quiet when oxlint is a dependency 3ms
     ✓ test-lint still fires when the ESLint config names no test plugin 4ms
     ✓ cloud fires only once cloud agents are chosen 3ms
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 210ms
     ✓ cloud tip for codex names --codex and BKIT_OPENAI_API_KEY 50ms
     ✓ ci-workflow follows a renamed bkit.testing.ciWorkflow 3ms
     ✓ ci-workflow asks for the copy at the file bkit.testing.ciWorkflow names 1ms
     ✓ serena needs both the project file and an MCP entry 3ms
     ✓ compaction-window and claude-connectors fire per Claude Code setting 2ms
     ✓ host-specific tips stay quiet without their host 1ms
     ✓ tmp-prune fires only once a pre-push hook exists without the prune script 2ms
     ✓ dependency-audit fires only once a pre-push hook exists without the gate script 2ms
     ✓ dependency-audit stays quiet for a copy under the unprefixed name 2ms
     ✓ min-push fires when a hook lacks update pairs or checked gate execution 4ms
     ✓ pre-push-pr-conflict fires only for a hook without merge-tree 2ms
     × pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA 15ms
     ✓ pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc 2ms
     ✓ disk-prune fires only once a pre-push hook exists without either step file 4ms
     ✓ disk-prune stays quiet once the machine step file exists 3ms
     ✓ mcp-scope fires on an unlocked URL 3ms
     ✓ bkit-output-json fires while a copied script reads bkit output without --json 10ms
     ✓ bkit-upgrade (3)
       ✓ fires when the cached release is newer than the pin, however old the cache 289ms
       ✓ stays quiet on a remembered lookup failure or a missing pin 77ms
       ✓ the lookup opt-out does not hide a release already seen 51ms
     ✓ share-friction (3)
       ✓ fires on an OPEN entry that is not consumer scope 3ms
       ✓ stops once the newest row of each entry is TRIAGED, and a new entry brings it back 2ms
       ✓ stays quiet in bkit's own repo 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:484:52
    482|   it("pre-push-pr-conflict fires for a hook with merge-tree but no PUS…
    483|     write(".husky/pre-push", 'git merge-tree --write-tree --name-only …
    484|     expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(true);
       |                                                    ^
    485|     write(
    486|       ".husky/pre-push",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 65 passed (66)
   Start at  13:41:48
   Duration  1.52s (tests 65%, import 17%, transform 15%, setup 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-QTvcCN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
