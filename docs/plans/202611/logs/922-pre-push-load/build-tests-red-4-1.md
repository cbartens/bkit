Enforced: true
Red: 0
Accepted: 0
Updated: 1
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/922-pre-push-load-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED" | updated | an existing test, changed since the group started (`c88e5c05a`) and passing: the verifier judges its diff — it may add expectations, never remove or loosen one |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts

[test-timeout-budget] load average 13.0 on 10 cores: unit limits 11000ms per test, 22000ms per hook (x2.20)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load

 ✓ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (112 tests) 154979ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 436ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 686ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 679ms
     ✓ .husky/pre-push: empty stdin → gates still run 831ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 312ms
     ✓ tag on a commit no origin branch holds → gates run 816ms
     ✓ tag pushed with a branch → gates run 719ms
     ✓ branch with files no origin dev / main tip has → gates run 816ms
     ✓ dev push with the files origin/dev already has → gates run 893ms
     ✓ main push with the files origin/main already has → gates run 882ms
     ✓ no origin dev / main ref fetched → a branch push gates 782ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 628ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 706ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 796ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 680ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1067ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1430ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 654ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 582ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 745ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 673ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1336ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1387ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 722ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 715ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 510ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 461ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 706ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 490ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 438ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 498ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 458ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 478ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 511ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 484ms
     ✓ .husky/pre-push: a gate fails → no disk prune 523ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 483ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 443ms
     ✓ a stale register stops the push before any gate runs 425ms
     ✓ bkit check fails → the push stops before any gate runs 403ms
     ✓ the dependency audit runs before any gate, when its script is present 448ms
     ✓ no dependency-audit script → skipped, the gates still run 422ms
     ✓ no register script → skipped, the gates still run 419ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 494ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 455ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 620ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 1111ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 2323ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1327ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1784ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1056ms
   ✓ graphify register pre-push gate (18)
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 1022ms
     ✓ branch with an open PR into dev, register current → push goes on 1080ms
     ✓ branch with no open PR → no check, push goes on 1221ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 1003ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 1105ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 1382ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 1155ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 1042ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1542ms
   ✓ .husky/pre-push min push (20)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 4391ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 3544ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 3609ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 6671ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 4284ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 3692ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3050ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 4295ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 3195ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 6569ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 6632ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 3587ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 6495ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2963ms
     ✓ .husky/pre-push: a code file in the push → the full gate 3602ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3679ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 4968ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 2757ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 2426ms
     ✓ .husky/pre-push: a code push still runs them 2242ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 1545ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 926ms
     ✓ no .envrc → no direnv call 1159ms
     ✓ direnv not on PATH → gates run, no warning 2719ms
     ✓ CI set → no direnv call 886ms
     ✓ delete-only push through direnv exec → exit 0, no gate 959ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1803ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1846ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 2333ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 5980ms

 Test Files  1 passed (1)
      Tests  112 passed (112)
   Start at  13:10:31
   Duration  155.15s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-eHmMTl/junit.xml
```
