Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/922-pre-push-load-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` "setup with an .envrc differing from the main checkout's reports that the push will block" | red | failure: expected '[bkit-worktrees] worktree copy: .env.…' to contain 'push will block' |
| 5 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "trusted .envrc → .bkit/.env tooling keys do not reach the gate" | red | failure: .bkit/templates/.husky/pre-push: expected 'pnpm: -s bkit ci push-gate --gate=bki…' to contain 'BKIT_GH_TOKEN=unset' |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/worktrees.integration.test.ts

[test-timeout-budget] load average 17.8 on 10 cores: unit limits 13400ms per test, 26800ms per hook (x2.68)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests | 1 failed) 112578ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 3335ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 19564ms
   ❯ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1905ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1586ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1333ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1545ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 2168ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 2914ms
     × setup with an .envrc differing from the main checkout's reports that the push will block 1358ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1065ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 838ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1210ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 1151ms
     ✓ design installs dependencies like build and debug 1042ms
     ✓ plan installs dependencies like build and debug 1234ms
     ✓ design stops on a failed install (5) 1065ms
     ✓ plan stops on a failed install (5) 1268ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 1276ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1515ms
     ✓ fails without minting when origin cannot be reached 500ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 1266ms
     ✓ reports a package manager that could not run (127) apart from a failed install 2037ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 3192ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 4565ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4183ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 3049ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 3369ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 3190ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1378ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1060ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1005ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1242ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 1601ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1291ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 1641ms
     ✓ commits leftovers when a copy entry points outside the checkout 1316ms
     ✓ never commits the entries setup copies in from the main checkout 1497ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 1429ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 659ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 799ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1066ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1026ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 925ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 889ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 923ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1412ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 1421ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 607ms
     ✓ leaves a clean worktree's history alone 1299ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 1618ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 1841ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 1818ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 1943ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 1946ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 1638ms
     ✓ does not mark a resumed worktree it did not create 808ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adopts the session branch in place when there is no worktree and no feat/{fid} 190ms
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 493ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 769ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1163ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 734ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/worktrees.integration.test.ts > bkit worktrees setup — mint (create) > setup with an .envrc differing from the main checkout's reports that the push will block
AssertionError: expected '[bkit-worktrees] worktree copy: .env.…' to contain 'push will block'

- Expected
+ Received

- push will block
+ [bkit-worktrees] worktree copy: .env.local is not in the main checkout — skipped
+ [bkit-worktrees] direnv: /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-wt-DJBzgl/repo/.worktrees/42-thing/.envrc differs from the main checkout's — not allowed; read it, then run direnv allow
+

 ❯ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts:439:19
    437|     expect(r.json.direnvAllowed).toBe(false);
    438|     expect(direnvCalls()).toBe("");
    439|     expect(r.err).toContain("push will block");
       |                   ^
    440|     expect(r.err).toContain("direnv allow");
    441|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 60 passed (61)
   Start at  08:54:13
   Duration  113.06s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-h6hWdW/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

[test-timeout-budget] load average 12.2 on 10 cores: unit limits 10600ms per test, 21200ms per hook (x2.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (109 tests | 1 failed) 74462ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 34ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 430ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 404ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 50ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 432ms
     ✓ .husky/pre-push: empty stdin → gates still run 408ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 391ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 30ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 187ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 191ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 210ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 55ms
     ✓ .husky/pre-push: first and last lines name the log 228ms
     ✓ .husky/pre-push: the hook body runs once 228ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 213ms
     ✓ tag delete alongside that tag → still skipped 192ms
     ✓ tag on a commit no origin branch holds → gates run 524ms
     ✓ tag pushed with a branch → gates run 499ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 147ms
     ✓ release branch and a tag, both already tested → still skipped 186ms
     ✓ branch with files no origin dev / main tip has → gates run 540ms
     ✓ dev push with the files origin/dev already has → gates run 498ms
     ✓ main push with the files origin/main already has → gates run 492ms
     ✓ no origin dev / main ref fetched → a branch push gates 540ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 537ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 519ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 845ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 478ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 785ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 753ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 483ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 484ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 606ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 933ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 801ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 803ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 560ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 560ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 427ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 378ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 397ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 439ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 399ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 415ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 369ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 362ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 374ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 394ms
     ✓ .husky/pre-push: a gate fails → no disk prune 408ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 647ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 377ms
     ✓ a stale register stops the push before any gate runs 365ms
     ✓ bkit check fails → the push stops before any gate runs 360ms
     ✓ the dependency audit runs before any gate, when its script is present 414ms
     ✓ no dependency-audit script → skipped, the gates still run 423ms
     ✓ no register script → skipped, the gates still run 406ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 456ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 487ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 472ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 404ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 509ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 596ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 520ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 460ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 12ms
     ✓ push to dev, register current → push goes on 12ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 11ms
     ✓ push to another branch → no check, push goes on 185ms
     ✓ revert push to dev → no check, push goes on 111ms
     ✓ graphify not adopted → nothing runs 6ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 397ms
     ✓ branch with an open PR into dev, register current → push goes on 412ms
     ✓ branch with no open PR → no check, push goes on 439ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 94ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 476ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 411ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 140ms
     ✓ revert push of a branch with an open PR → no check 126ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 536ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 521ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 458ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 867ms
   ✓ .husky/pre-push min push (20)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2308ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 1824ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1342ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2043ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1165ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1115ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1243ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1391ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1017ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1760ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 1750ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1151ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1939ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1360ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1348ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1189ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1758ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1575ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 2824ms
     ✓ .husky/pre-push: a code push still runs them 2248ms
   ❯ .husky/pre-push direnv (7)
     ✓ trusted .envrc → the gate sees its variables 1440ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 633ms
     ✓ no .envrc → no direnv call 891ms
     ✓ direnv not on PATH → gates run, no warning 2489ms
     ✓ CI set → no direnv call 761ms
     ✓ delete-only push through direnv exec → exit 0, no gate 1017ms
     × trusted .envrc → .bkit/.env tooling keys do not reach the gate 2146ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push direnv > trusted .envrc → .bkit/.env tooling keys do not reach the gate
AssertionError: .bkit/templates/.husky/pre-push: expected 'pnpm: -s bkit ci push-gate --gate=bki…' to contain 'BKIT_GH_TOKEN=unset'

Expected: "BKIT_GH_TOKEN=unset"
Received: "pnpm: -s bkit ci push-gate --gate=bkit:gate:static-unit GATE_VAR=from-envrc BKIT_GH_TOKEN=dummy-write-pat BKIT_OTHER_KEY=dummy-other"

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1449:25
    1447|       for (const g of gate) {
    1448|         expect(g, hook).toContain("GATE_VAR=from-envrc");
    1449|         expect(g, hook).toContain("BKIT_GH_TOKEN=unset");
       |                         ^
    1450|         expect(g, hook).toContain("BKIT_OTHER_KEY=unset");
    1451|       }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 108 passed (109)
   Start at  08:56:07
   Duration  74.62s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-PVCsKy/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
