Enforced: true
Red: 4
Accepted: 3
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/922-pre-push-load-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "trusted .envrc → the gate sees its variables" | red | failure: .bkit/templates/.husky/pre-push: expected false to be true // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "untrusted .envrc → blocked before bkit check, names direnv allow" | red | failure: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no .envrc → no direnv call" | passed-accepted | passes; accepted by the tests step: negative case; the current hook never calls direnv, so it already holds |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "direnv not on PATH → gates run, no warning" | passed-accepted | passes; accepted by the tests step: negative case; the current hook never calls direnv, so it already holds |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "CI set → no direnv call" | passed-accepted | passes; accepted by the tests step: negative case; the current hook never calls direnv, so it already holds |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "delete-only push through direnv exec → exit 0, no gate" | red | failure: .bkit/templates/.husky/pre-push: expected false to be true // Object.is equality |
| 2 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc" | red | failure: Cannot read properties of undefined (reading 'fires') |

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

[test-timeout-budget] load average 3.9 on 10 cores: unit limits 6450ms per test, 12900ms per hook (x1.29)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (108 tests | 3 failed) 143448ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: every ref deleted → exits 0 without running a gate 45ms
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 425ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 392ms
     ✓ .husky/pre-push: every ref deleted → exits 0 without running a gate 52ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 450ms
     ✓ .husky/pre-push: empty stdin → gates still run 388ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 360ms
     ✓ .bkit/templates/.husky/pre-push: delete-only push → the early exit is logged, exit 0 29ms
     ✓ .bkit/templates/.husky/pre-push: first and last lines name the log 180ms
     ✓ .bkit/templates/.husky/pre-push: the hook body runs once 190ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 247ms
     ✓ .husky/pre-push: delete-only push → the early exit is logged, exit 0 54ms
     ✓ .husky/pre-push: first and last lines name the log 197ms
     ✓ .husky/pre-push: the hook body runs once 260ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ annotated tag on a commit origin holds → exits 0 without running a gate 243ms
     ✓ tag delete alongside that tag → still skipped 215ms
     ✓ tag on a commit no origin branch holds → gates run 586ms
     ✓ tag pushed with a branch → gates run 559ms
     ✓ release branch with the files of origin/dev → exits 0 without running a gate 186ms
     ✓ release branch and a tag, both already tested → still skipped 216ms
     ✓ branch with files no origin dev / main tip has → gates run 612ms
     ✓ dev push with the files origin/dev already has → gates run 523ms
     ✓ main push with the files origin/main already has → gates run 551ms
     ✓ no origin dev / main ref fetched → a branch push gates 952ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 1804ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 1481ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 3175ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 1719ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2939ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 3220ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 1808ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 1538ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 2180ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 1480ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 2536ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1725ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 1019ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 1094ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 1339ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 689ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 652ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 867ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 953ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 1064ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 1319ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 1884ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 1398ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 1081ms
     ✓ .husky/pre-push: a gate fails → no disk prune 1481ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 1037ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 1259ms
     ✓ a stale register stops the push before any gate runs 836ms
     ✓ bkit check fails → the push stops before any gate runs 1038ms
     ✓ the dependency audit runs before any gate, when its script is present 909ms
     ✓ no dependency-audit script → skipped, the gates still run 1789ms
     ✓ no register script → skipped, the gates still run 1260ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1142ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 1409ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1491ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 883ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 1633ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 937ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 1390ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 903ms
   ✓ graphify register pre-push gate (18)
     ✓ push to dev, register stale → blocked, check-at ran on the pushed commit 25ms
     ✓ push to dev, register current → push goes on 38ms
     ✓ push to dev, graphify not installed → loud NOT-checked warning, push goes on 33ms
     ✓ push to another branch → no check, push goes on 685ms
     ✓ revert push to dev → no check, push goes on 503ms
     ✓ graphify not adopted → nothing runs 15ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 600ms
     ✓ branch with an open PR into dev, register current → push goes on 670ms
     ✓ branch with no open PR → no check, push goes on 927ms
     ✓ branch push, gh not installed → loud NOT-checked warning, push goes on 276ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 819ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 475ms
     ✓ a push that does not update the checked-out branch → no PR lookup, no check 301ms
     ✓ revert push of a branch with an open PR → no check 554ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 903ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 1370ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 882ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 1445ms
   ✓ .husky/pre-push min push (20)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 5451ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 5033ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 2835ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 4901ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 3291ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 3626ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 3744ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 4164ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 2813ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 3616ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 4131ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 2984ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 5230ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 2586ms
     ✓ .husky/pre-push: a code file in the push → the full gate 2802ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 2514ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1346ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 965ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1012ms
     ✓ .husky/pre-push: a code push still runs them 936ms
   ❯ .husky/pre-push direnv (6)
     × trusted .envrc → the gate sees its variables 396ms
     × untrusted .envrc → blocked before bkit check, names direnv allow 391ms
     ✓ no .envrc → no direnv call 471ms
     ✓ direnv not on PATH → gates run, no warning 923ms
     ✓ CI set → no direnv call 466ms
     × delete-only push through direnv exec → exit 0, no gate 25ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push direnv > trusted .envrc → the gate sees its variables
AssertionError: .bkit/templates/.husky/pre-push: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1338:9
    1336|         r.direnv.some((c) => c.startsWith("exec . sh ")),
    1337|         hook,
    1338|       ).toBe(true);
       |         ^
    1339|       const gate = r.calls.filter((c) => c.includes("push-gate"));
    1340|       expect(gate.length, hook).toBeGreaterThan(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push direnv > untrusted .envrc → blocked before bkit check, names direnv allow
AssertionError: .bkit/templates/.husky/pre-push: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1349:30
    1347|       fs.rmSync(path.join(tmp, "calls.log"), { force: true });
    1348|       const r = runHook(hook, UPDATE, { untrusted: true });
    1349|       expect(r.status, hook).toBe(1);
       |                              ^
    1350|       expect(r.stderr, hook).toContain("direnv allow .");
    1351|       expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts > .husky/pre-push direnv > delete-only push through direnv exec → exit 0, no gate
AssertionError: .bkit/templates/.husky/pre-push: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1416:9
    1414|         r.direnv.some((c) => c.startsWith("exec . sh ")),
    1415|         hook,
    1416|       ).toBe(true);
       |         ^
    1417|       expect(r.calls, hook).toEqual([]);
    1418|       expect(r.stderr, hook).toContain("delete-only push");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 105 passed (108)
   Start at  17:18:14
   Duration  143.73s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xmODKX/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/tips/catalogue.test.ts

```

## Runner output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/tips/catalogue.test.ts

[test-timeout-budget] load average 18.6 on 10 cores: unit limits 13800ms per test, 27600ms per hook (x2.76)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts (63 tests | 1 failed) 316ms
   ✓ SETUP_TIPS — catalogue (16)
     ✓ every tip carries every text field 3ms
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
     ✓ every template path an ask names exists 1ms
     ✓ ids are unique and never collide with an advisory id 5ms
     ✓ every reused advisory id is one a detector emits 3ms
     ✓ every docs pointer in steps resolves to a heading 12ms
   ❯ SETUP_TIPS — detection (47)
     ✓ tracker fires exactly when tracker-setup-none does 2ms
     ✓ tracker stays quiet once github is chosen 1ms
     ✓ tracker stays quiet once linear is chosen 1ms
     ✓ tracker stays quiet once jira is chosen 1ms
     ✓ gh-mcp fires only for the GitHub tracker 2ms
     ✓ bkit-env fires until every token the github tracker needs is set 2ms
     ✓ bkit-env fires until every token the linear tracker needs is set 2ms
     ✓ bkit-env fires until every token the jira tracker needs is set 2ms
     ✓ issue-forms fires only for the GitHub tracker with no issue template folder 1ms
     ✓ direnv stays quiet until .bkit/.env exists 1ms
     ✓ context-fetch fires exactly when context-fetch-missing does 2ms
     ✓ ignoring context-fetch-missing does not drop a context-fetch-unbounded finding 17ms
     ✓ bkit-env ask names no worktree remedy, since fires reads the main checkout 1ms
     ✓ dependabot-renovate fires exactly when dep-updater-absent does 2ms
     ✓ trivy fires once workflows exist and none runs the scan 1ms
     ✓ test-lint stays quiet until the repo lists a JS test runner 1ms
     ✓ test-lint fires for vitest in devDependencies with no test linter 1ms
     ✓ test-lint fires for jest in dependencies with no test linter 1ms
     ✓ test-lint goes quiet once .oxlintrc.json lints tests 1ms
     ✓ test-lint goes quiet once oxlint.config.ts lints tests 1ms
     ✓ test-lint goes quiet once eslint.config.js lints tests 1ms
     ✓ test-lint goes quiet once .eslintrc.json lints tests 1ms
     ✓ test-lint goes quiet when oxlint is a dependency 1ms
     ✓ test-lint still fires when the ESLint config names no test plugin 1ms
     ✓ cloud fires only once cloud agents are chosen 2ms
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 93ms
     ✓ cloud tip for codex names --codex and BKIT_OPENAI_API_KEY 23ms
     ✓ ci-workflow follows a renamed bkit.testing.ciWorkflow 1ms
     ✓ ci-workflow asks for the copy at the file bkit.testing.ciWorkflow names 1ms
     ✓ serena needs both the project file and an MCP entry 1ms
     ✓ compaction-window and claude-connectors fire per Claude Code setting 1ms
     ✓ host-specific tips stay quiet without their host 1ms
     ✓ tmp-prune fires only once a pre-push hook exists without the prune script 1ms
     ✓ dependency-audit fires only once a pre-push hook exists without the gate script 1ms
     ✓ dependency-audit stays quiet for a copy under the unprefixed name 2ms
     ✓ min-push fires when a hook lacks update pairs or checked gate execution 2ms
     × pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc 3ms
     ✓ disk-prune fires only once a pre-push hook exists without either step file 2ms
     ✓ disk-prune stays quiet once the machine step file exists 1ms
     ✓ mcp-scope fires on an unlocked URL 1ms
     ✓ bkit-output-json fires while a copied script reads bkit output without --json 2ms
     ✓ bkit-upgrade (3)
       ✓ fires when the cached release is newer than the pin, however old the cache 49ms
       ✓ stays quiet on a remembered lookup failure or a missing pin 32ms
       ✓ the lookup opt-out does not hide a release already seen 26ms
     ✓ share-friction (3)
       ✓ fires on an OPEN entry that is not consumer scope 1ms
       ✓ stops once the newest row of each entry is TRIAGED, and a new entry brings it back 1ms
       ✓ stays quiet in bkit's own repo 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc
TypeError: Cannot read properties of undefined (reading 'fires')
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:465:33
    463|
    464|   it("pre-push-direnv fires only for a hook without direnv exec in a r…
    465|     expect(tip("pre-push-direnv").fires(cwd)).toBe(false);
       |                                 ^
    466|     write(".husky/pre-push", "pnpm -s bkit ci push-gate\n");
    467|     expect(tip("pre-push-direnv").fires(cwd)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 62 passed (63)
   Start at  17:20:39
   Duration  622ms (tests 58%, import 21%, transform 16%, setup 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4fMB0Z/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
