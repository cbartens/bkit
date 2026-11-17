Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/1011-rules-ship-project-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when a second Project Goals section holds a goal" | red | failure: expected true to be false // Object.is equality |
| 6 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals ask says to fill the section when the heading already exists" | red | failure: expected 'Add a `## Project Goals` section to .…' to match /fill/i |
| 7 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the goals are a numbered list" | red | failure: expected true to be false // Object.is equality |
| 7 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the goals use * bullets" | red | failure: expected true to be false // Object.is equality |

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

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts (81 tests | 4 failed) 339ms
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
     ✓ ids are unique and never collide with an advisory id 2ms
     ✓ every reused advisory id is one a detector emits 2ms
     ✓ every docs pointer in steps resolves to a heading 8ms
   ❯ SETUP_TIPS — detection (65)
     ✓ tracker fires exactly when tracker-setup-none does 4ms
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
     ✓ ignoring context-fetch-missing does not drop a context-fetch-unbounded finding 15ms
     ✓ bkit-env ask names no worktree remedy, since fires reads the main checkout 1ms
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
     ✓ cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude 74ms
     ✓ cloud tip for codex names --codex and BKIT_OPENAI_API_KEY 20ms
     ✓ ci-workflow follows a renamed bkit.testing.ciWorkflow 1ms
     ✓ ci-workflow asks for the copy at the file bkit.testing.ciWorkflow names 1ms
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
       ✓ project-docs tip fires when a project doc is missing 12ms
       ✓ project-docs tip stays silent when every project doc is populated and indexed 8ms
       ✓ project-docs tip names the two project-docs advisory ids 0ms
       ✓ project-docs tip stays silent for a Not applicable data-schema and a header-only noise 9ms
       ✓ project-docs tip fires when a project doc is an unchanged starter copy 9ms
       ✓ project-docs tip fires when a project doc is empty 6ms
       ✓ project-docs tip stays silent when project-docs-missing is ignored 27ms
       ✓ ignoring project-docs-missing drops the unpopulated advisory and keeps project-docs-index-missing 13ms
     ✓ bkit-upgrade (3)
       ✓ fires when the cached release is newer than the pin, however old the cache 37ms
       ✓ stays quiet on a remembered lookup failure or a missing pin 24ms
       ✓ the lookup opt-out does not hide a release already seen 18ms
     ❯ project-goals (7)
       ✓ project-goals fires when the rules file has no Project Goals heading 1ms
       ✓ project-goals fires when the section holds only commented examples 1ms
       ✓ project-goals stays quiet when the section holds one bullet, and when there is no rules file 0ms
       × project-goals stays quiet when a second Project Goals section holds a goal 3ms
       × project-goals ask says to fill the section when the heading already exists 1ms
       × project-goals stays quiet when the goals are a numbered list 1ms
       × project-goals stays quiet when the goals use * bullets 1ms
     ✓ share-friction (3)
       ✓ fires on an OPEN entry that is not consumer scope 1ms
       ✓ stops once the newest row of each entry is TRIAGED, and a new entry brings it back 1ms
       ✓ stays quiet in bkit's own repo 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-goals > project-goals stays quiet when a second Project Goals section holds a goal
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:714:47
    712|           "## Project Settings\n\nnone\n\n## Project Goals\n\n- **Corr…
    713|       );
    714|       expect(tip("project-goals").fires(cwd)).toBe(false);
       |                                               ^
    715|     });
    716|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-goals > project-goals ask says to fill the section when the heading already exists
AssertionError: expected 'Add a `## Project Goals` section to .…' to match /fill/i

- Expected:
/fill/i

+ Received:
"Add a `## Project Goals` section to .agents/rules.md, between Project Rules and Project Settings, with a few goals in priority order. Ask me what this project optimises for first."

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:722:19
    720|       expect(t.fires(cwd)).toBe(true);
    721|       const ask = askFor(t, cwd);
    722|       expect(ask).toMatch(/fill/i);
       |                   ^
    723|       expect(ask).toMatch(/already|existing/i);
    724|       expect(ask).not.toMatch(/^Add a `## Project Goals` section/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-goals > project-goals stays quiet when the goals are a numbered list
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:729:47
    727|     it("project-goals stays quiet when the goals are a numbered list",…
    728|       rules("1. **Correct over fast:** x");
    729|       expect(tip("project-goals").fires(cwd)).toBe(false);
       |                                               ^
    730|       rules("1) **Correct over fast:** x");
    731|       expect(tip("project-goals").fires(cwd)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > project-goals > project-goals stays quiet when the goals use * bullets
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/checks/tips/catalogue.test.ts:736:47
    734|     it("project-goals stays quiet when the goals use * bullets", () =>…
    735|       rules("* **Correct over fast:** x");
    736|       expect(tip("project-goals").fires(cwd)).toBe(false);
       |                                               ^
    737|       rules("+ **Correct over fast:** x");
    738|       expect(tip("project-goals").fires(cwd)).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 77 passed (81)
   Start at  13:39:28
   Duration  553ms (tests 68%, import 17%, transform 10%, setup 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-H2M46m/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
