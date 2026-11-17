Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/1011-rules-ship-project-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals fires when the rules file has no Project Goals heading" | red | failure: Cannot read properties of undefined (reading 'fires') |
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals fires when the section holds only commented examples" | red | failure: Cannot read properties of undefined (reading 'fires') |
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the section holds one bullet, and when there is no rules file" | red | failure: Cannot read properties of undefined (reading 'fires') |

## Gaps

None.

## Lint output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/tips/catalogue.test.ts

```

## Runner output — `.bkit/core/engine/checks/tips/catalogue.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/tips/catalogue.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1011-rules-ship-project

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts (77 tests | 3 failed) 331ms
   ✓ SETUP_TIPS — catalogue (16)
     ✓ every tip carries every text field 2ms
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
     ✓ ids are unique and never collide with an advisory id 3ms
     ✓ every reused advisory id is one a detector emits 3ms
     ✓ every docs pointer in steps resolves to a heading 11ms
   ❯ SETUP_TIPS — detection (61)
     ✓ tracker fires exactly when tracker-setup-none does 1ms
     ✓ tracker stays quiet once github is chosen 1ms
     ✓ tracker stays quiet once linear is chosen 1ms
     ✓ tracker stays quiet once jira is chosen 1ms
     ✓ gh-mcp fires only for the GitHub tracker 1ms
     ✓ gh-mcp stays quiet about the token inside the pre-push hook's inner run 1ms
     ✓ bkit-env fires until every token the github tracker needs is set 1ms
     ✓ bkit-env fires until every token the linear tracker needs is set 1ms
     ✓ bkit-env fires until every token the jira tracker needs is set 1ms
     ✓ issue-forms fires only for the GitHub tracker with no issue template folder 1ms
     ✓ direnv stays quiet until .bkit/.env exists 1ms
     ✓ context-fetch fires exactly when context-fetch-missing does 1ms
     ✓ ignoring context-fetch-missing does not drop a context-fetch-unbounded finding 14ms
     ✓ bkit-env ask names no worktree remedy, since fires reads the main checkout 0ms
     ✓ dependabot-renovate fires exactly when dep-updater-absent does 1ms
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
     ✓ cloud fires only once cloud agents are chosen 1ms
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 71ms
     ✓ cloud tip for codex names --codex and BKIT_OPENAI_API_KEY 17ms
     ✓ ci-workflow follows a renamed bkit.testing.ciWorkflow 1ms
     ✓ ci-workflow asks for the copy at the file bkit.testing.ciWorkflow names 0ms
     ✓ serena needs both the project file and an MCP entry 1ms
     ✓ compaction-window and claude-connectors fire per Claude Code setting 1ms
     ✓ host-specific tips stay quiet without their host 1ms
     ✓ tmp-prune fires only once a pre-push hook exists without the prune script 1ms
     ✓ dependency-audit fires only once a pre-push hook exists without the gate script 1ms
     ✓ dependency-audit stays quiet for a copy under the unprefixed name 1ms
     ✓ min-push fires when a hook lacks update pairs or checked gate execution 1ms
     ✓ pre-push-pr-conflict fires only for a hook without merge-tree 1ms
     ✓ pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA 1ms
     ✓ pre-push-direnv fires only for a hook without direnv exec in a repo with .envrc 1ms
     ✓ disk-prune fires only once a pre-push hook exists without either step file 1ms
     ✓ disk-prune stays quiet once the machine step file exists 1ms
     ✓ mcp-scope fires on an unlocked URL 1ms
     ✓ bkit-output-json fires while a copied script reads bkit output without --json 1ms
     ✓ project-docs (8)
       ✓ project-docs tip fires when a project doc is missing 15ms
       ✓ project-docs tip stays silent when every project doc is populated and indexed 9ms
       ✓ project-docs tip names the two project-docs advisory ids 0ms
       ✓ project-docs tip stays silent for a Not applicable data-schema and a header-only noise 9ms
       ✓ project-docs tip fires when a project doc is an unchanged starter copy 10ms
       ✓ project-docs tip fires when a project doc is empty 6ms
       ✓ project-docs tip stays silent when project-docs-missing is ignored 27ms
       ✓ ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing 13ms
     ✓ bkit-upgrade (3)
       ✓ fires when the cached release is newer than the pin, however old the cache 38ms
       ✓ stays quiet on a remembered lookup failure or a missing pin 23ms
       ✓ the lookup opt-out does not hide a release already seen 18ms
     ❯ project-goals (3)
       × project-goals fires when the rules file has no Project Goals heading 2ms
       × project-goals fires when the section holds only commented examples 1ms
       × project-goals stays quiet when the section holds one bullet, and when there is no rules file 0ms
     ✓ share-friction (3)
       ✓ fires on an OPEN entry that is not consumer scope 1ms
       ✓ stops once the newest row of each entry is TRIAGED, and a new entry brings it back 1ms
       ✓ stays quiet in bkit's own repo 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-goals > project-goals fires when the rules file has no Project Goals heading
TypeError: Cannot read properties of undefined (reading 'fires')
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:690:33
    688|     it("project-goals fires when the rules file has no Project Goals h…
    689|       rules(null);
    690|       expect(tip("project-goals").fires(cwd)).toBe(true);
       |                                 ^
    691|     });
    692|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-goals > project-goals fires when the section holds only commented examples
TypeError: Cannot read properties of undefined (reading 'fires')
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:697:33
    695|         "What this project optimises for.\n\n<!-- Examples:\n- **Corre…
    696|       );
    697|       expect(tip("project-goals").fires(cwd)).toBe(true);
       |                                 ^
    698|     });
    699|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-goals > project-goals stays quiet when the section holds one bullet, and when there is no rules file
TypeError: Cannot read properties of undefined (reading 'fires')
 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:701:33
    699|
    700|     it("project-goals stays quiet when the section holds one bullet, a…
    701|       expect(tip("project-goals").fires(cwd)).toBe(false); // no rules…
       |                                 ^
    702|       rules("- **Correct over fast:** A wrong answer costs more than a…
    703|       expect(tip("project-goals").fires(cwd)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯


 Test Files  1 failed (1)
      Tests  3 failed | 74 passed (77)
   Start at  12:56:10
   Duration  608ms (tests 61%, transform 18%, import 16%, setup 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-g3RuPJ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
