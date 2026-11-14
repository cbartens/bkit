Enforced: true
Red: 5
Accepted: 3
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR whose base conflicts → blocked before bkit check, names the file" | red | failure: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR that merges cleanly → gates run, no message" | passed-accepted | passes; accepted by the tests step: today's hook has no conflict check, so a clean run passes already |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no open PR → no fetch, gates run" | passed-accepted | passes; accepted by the tests step: today's hook never fetches or warns |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "gh not on PATH → warns, gates run" | red | failure: .bkit/templates/.husky/pre-push: expected '' to match /WARN[^\n]*conflict/i |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "base fetch fails → warns, gates run" | red | failure: .bkit/templates/.husky/pre-push: expected '' to match /WARN[^\n]*conflict/i |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "dev push → no PR lookup" | passed-accepted | passes; accepted by the tests step: today's hook already skips the lookup on dev |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "min push of a conflicting PR → blocked" | red | failure: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires only for a hook without merge-tree" | red | failure: Cannot read properties of undefined (reading 'fires') |

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

[test-timeout-budget] load average 28.4 on 10 cores: unit limits 18700ms per test, 37400ms per hook (x3.74)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (123 tests | 4 failed) 158927ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 103ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 1758ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 544ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 147ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 739ms
     ✓ .husky/pre-push: empty stdin → gates still run 643ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 597ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 85ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 441ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 584ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 435ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 161ms
     ✓ .husky/pre-push: first and last lines name the log 695ms
     ✓ .husky/pre-push: the hook body runs once 422ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 698ms
     ✓ tag delete alongside that tag → still skipped 689ms
     ✓ tag on a commit no origin branch holds → gates run 1108ms
     ✓ tag pushed with a branch → gates run 1116ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 509ms
     ✓ release branch and a tag, both already tested → still skipped 649ms
     ✓ branch with files no origin dev / main tip has → gates run 1065ms
     ✓ dev push with the files origin/dev already has → gates run 1203ms
     ✓ main push with the files origin/main already has → gates run 1233ms
     ✓ no origin dev / main ref fetched → a branch push gates 1170ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 1132ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1058ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 1736ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 1122ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1469ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1073ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 627ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 669ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 905ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 533ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1184ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1120ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 560ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 602ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 462ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 399ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 691ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 480ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 647ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 447ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 619ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 371ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 413ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 436ms
     ✓ .husky/pre-push: a gate fails → no disk prune 439ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 457ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 437ms
     ✓ a stale register stops the push before any gate runs 416ms
     ✓ bkit check fails → the push stops before any gate runs 396ms
     ✓ the dependency audit runs before any gate, when its script is present 476ms
     ✓ no dependency-audit script → skipped, the gates still run 421ms
     ✓ no register script → skipped, the gates still run 392ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 428ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 399ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 471ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 664ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 477ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 442ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 488ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 472ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 10ms
     ✓ push to dev, register current → push goes on 9ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 10ms
     ✓ push to another branch → no check, push goes on 246ms
     ✓ revert push to dev → no check, push goes on 111ms
     ✓ graphify not adopted → nothing runs 5ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 373ms
     ✓ branch with an open PR into dev, register current → push goes on 370ms
     ✓ branch with no open PR → no check, push goes on 755ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 90ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 559ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 574ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 87ms
     ✓ revert push of a branch with an open PR → no check 95ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 523ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 340ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 446ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 803ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 1884ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 2043ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1029ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 1997ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1581ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 2055ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2923ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 3178ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2824ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 3164ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2333ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3883ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 4042ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2239ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4399ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2420ms
     ✓ .husky/pre-push: a code file in the push → the full gate 3613ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3326ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 4463ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 4509ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 4221ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 2042ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 3172ms
     ✓ .husky/pre-push: a code push still runs them 2311ms
   ✓ .husky/pre-push direnv (9)
     ✓ trusted .envrc → the gate sees its variables 2029ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 870ms
     ✓ no .envrc → no direnv call 1519ms
     ✓ direnv not on PATH → gates run, no warning 2174ms
     ✓ CI set → no direnv call 1372ms
     ✓ delete-only push through direnv exec → exit 0, no gate 1361ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1825ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 2242ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 2419ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 6668ms
   ❯ .husky/pre-push PR conflict (7)
     × open PR whose base conflicts → blocked before bkit check, names the file 2485ms
     ✓ open PR that merges cleanly → gates run, no message 2590ms
     ✓ no open PR → no fetch, gates run 3115ms
     × gh not on PATH → warns, gates run 2709ms
     × base fetch fails → warns, gates run 2375ms
     ✓ dev push → no PR lookup 2449ms
     × min push of a conflicting PR → blocked 2838ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > open PR whose base conflicts → blocked before bkit check, names the file
AssertionError: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1728:30
    1726|     for (const hook of HOOKS) {
    1727|       const r = push(hook);
    1728|       expect(r.status, hook).toBe(1);
       |                              ^
    1729|       expect(r.stderr, hook).toContain("BLOCKED");
    1730|       expect(r.stderr, hook).toContain("f.txt");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > gh not on PATH → warns, gates run
AssertionError: .bkit/templates/.husky/pre-push: expected '' to match /WARN[^\n]*conflict/i

- Expected:
/WARN[^\n]*conflict/i

+ Received:
""

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1773:30
    1771|       const r = push(hook, { pathEnv: pathWithoutGh() });
    1772|       expect(r.status, hook).toBe(0);
    1773|       expect(r.stderr, hook).toMatch(/WARN[^\n]*conflict/i);
       |                              ^
    1774|       expect(r.stderr, hook).not.toContain("BLOCKED");
    1775|       expect(r.gated, hook).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > base fetch fails → warns, gates run
AssertionError: .bkit/templates/.husky/pre-push: expected '' to match /WARN[^\n]*conflict/i

- Expected:
/WARN[^\n]*conflict/i

+ Received:
""

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1787:30
    1785|       const r = push(hook);
    1786|       expect(r.status, hook).toBe(0);
    1787|       expect(r.stderr, hook).toMatch(/WARN[^\n]*conflict/i);
       |                              ^
    1788|       expect(r.stderr, hook).not.toContain("BLOCKED");
    1789|       expect(r.gated, hook).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push PR conflict > min push of a conflicting PR → blocked
AssertionError: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1811:30
    1809|     for (const hook of HOOKS) {
    1810|       const r = push(hook);
    1811|       expect(r.status, hook).toBe(1);
       |                              ^
    1812|       expect(r.stderr, hook).toContain("f.txt");
    1813|       expect(r.pnpm.join("\n"), hook).not.toContain("bkit:gate:min");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 119 passed (123)
   Start at  11:00:17
   Duration  159.60s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-L6GjVl/junit.xml
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

[test-timeout-budget] load average 19.8 on 10 cores: unit limits 14400ms per test, 28800ms per hook (x2.88)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/923-pre-push-block

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts (65 tests | 1 failed) 1027ms
   ✓ SETUP_TIPS — catalogue (16)
     ✓ every tip carries every text field 8ms
     ✓ ALL_WORKFLOWS names every phase workflow; EVERY_CONTEXT every tips context 1ms
     ✓ the upgrade tip leads the catalogue and matters in every context 0ms
     ✓ comms tips matter in every context, and every context has its own tips 0ms
     ✓ design leads with serena once the comms tips are done 0ms
     ✓ plan leads with serena once the comms tips are done 0ms
     ✓ build leads with serena once the comms tips are done 0ms
     ✓ debug leads with context-fetch once the comms tips are done 1ms
     ✓ ship leads with ci-workflow once the comms tips are done 0ms
     ✓ audit leads with serena once the comms tips are done 0ms
     ✓ utility leads with serena once the comms tips are done 0ms
     ✓ audit tips are the code-reading, CI and dependency-safety ones 0ms
     ✓ every template path an ask names exists 2ms
     ✓ ids are unique and never collide with an advisory id 7ms
     ✓ every reused advisory id is one a detector emits 13ms
     ✓ every docs pointer in steps resolves to a heading 26ms
   ❯ SETUP_TIPS — detection (49)
     ✓ tracker fires exactly when tracker-setup-none does 6ms
     ✓ tracker stays quiet once github is chosen 3ms
     ✓ tracker stays quiet once linear is chosen 3ms
     ✓ tracker stays quiet once jira is chosen 3ms
     ✓ gh-mcp fires only for the GitHub tracker 5ms
     ✓ gh-mcp stays quiet about the token inside the pre-push hook's inner run 2ms
     ✓ bkit-env fires until every token the github tracker needs is set 3ms
     ✓ bkit-env fires until every token the linear tracker needs is set 3ms
     ✓ bkit-env fires until every token the jira tracker needs is set 4ms
     ✓ issue-forms fires only for the GitHub tracker with no issue template folder 4ms
     ✓ direnv stays quiet until .bkit/.env exists 3ms
     ✓ context-fetch fires exactly when context-fetch-missing does 4ms
     ✓ ignoring context-fetch-missing does not drop a context-fetch-unbounded finding 49ms
     ✓ bkit-env ask names no worktree remedy, since fires reads the main checkout 3ms
     ✓ dependabot-renovate fires exactly when dep-updater-absent does 10ms
     ✓ trivy fires once workflows exist and none runs the scan 8ms
     ✓ test-lint stays quiet until the repo lists a JS test runner 3ms
     ✓ test-lint fires for vitest in devDependencies with no test linter 5ms
     ✓ test-lint fires for jest in dependencies with no test linter 3ms
     ✓ test-lint goes quiet once .oxlintrc.json lints tests 4ms
     ✓ test-lint goes quiet once oxlint.config.ts lints tests 3ms
     ✓ test-lint goes quiet once eslint.config.js lints tests 4ms
     ✓ test-lint goes quiet once .eslintrc.json lints tests 3ms
     ✓ test-lint goes quiet when oxlint is a dependency 3ms
     ✓ test-lint still fires when the ESLint config names no test plugin 7ms
     ✓ cloud fires only once cloud agents are chosen 18ms
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 308ms
     ✓ cloud tip for codex names --codex and BKIT_OPENAI_API_KEY 63ms
     ✓ ci-workflow follows a renamed bkit.testing.ciWorkflow 3ms
     ✓ ci-workflow asks for the copy at the file bkit.testing.ciWorkflow names 1ms
     ✓ serena needs both the project file and an MCP entry 2ms
     ✓ compaction-window and claude-connectors fire per Claude Code setting 2ms
     ✓ host-specific tips stay quiet without their host 2ms
     ✓ tmp-prune fires only once a pre-push hook exists without the prune script 2ms
     ✓ dependency-audit fires only once a pre-push hook exists without the gate script 3ms
     ✓ dependency-audit stays quiet for a copy under the unprefixed name 3ms
     ✓ min-push fires when a hook lacks update pairs or checked gate execution 2ms
     × pre-push-pr-conflict fires only for a hook without merge-tree 7ms
     ✓ pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc 3ms
     ✓ disk-prune fires only once a pre-push hook exists without either step file 3ms
     ✓ disk-prune stays quiet once the machine step file exists 3ms
     ✓ mcp-scope fires on an unlocked URL 2ms
     ✓ bkit-output-json fires while a copied script reads bkit output without --json 2ms
     ✓ bkit-upgrade (3)
       ✓ fires when the cached release is newer than the pin, however old the cache 129ms
       ✓ stays quiet on a remembered lookup failure or a missing pin 85ms
       ✓ the lookup opt-out does not hide a release already seen 158ms
     ✓ share-friction (3)
       ✓ fires on an OPEN entry that is not consumer scope 3ms
       ✓ stops once the newest row of each entry is TRIAGED, and a new entry brings it back 4ms
       ✓ stays quiet in bkit's own repo 6ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > pre-push-pr-conflict fires only for a hook without merge-tree
TypeError: Cannot read properties of undefined (reading 'fires')
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:475:38
    473|
    474|   it("pre-push-pr-conflict fires only for a hook without merge-tree", …
    475|     expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(false);
       |                                      ^
    476|     write(".husky/pre-push", "pnpm -s bkit ci push-gate\n");
    477|     expect(tip("pre-push-pr-conflict").fires(cwd)).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 64 passed (65)
   Start at  11:02:59
   Duration  2.02s (tests 59%, import 19%, transform 17%, setup 4%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-ibDG9a/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
