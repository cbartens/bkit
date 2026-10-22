> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/tips/catalogue.test.ts

[test-timeout-budget] load average 29.7 on 10 cores: unit limits 14829ms per test, 29657ms per hook (x2.97)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/651-sops-env-backup

❯ .bkit/core/engine/checks/tips/catalogue.test.ts (48 tests | 1 failed) 187ms
✓ SETUP_TIPS — catalogue (15)
✓ every tip carries every text field 7ms
✓ ALL_WORKFLOWS names every phase workflow; EVERY_CONTEXT every tips context 1ms
✓ comms tips matter in every context, and every context has its own tips 1ms
✓ design leads with serena once the comms tips are done 0ms
✓ plan leads with serena once the comms tips are done 0ms
✓ build leads with serena once the comms tips are done 0ms
✓ debug leads with context-fetch once the comms tips are done 0ms
✓ ship leads with ci-workflow once the comms tips are done 0ms
✓ audit leads with serena once the comms tips are done 0ms
✓ utility leads with serena once the comms tips are done 0ms
✓ audit tips are the code-reading, CI and dependency-safety ones 0ms
✓ every template path an ask names exists 2ms
✓ ids are unique and never collide with an advisory id 7ms
✓ every reused advisory id is one a detector emits 4ms
✓ every docs pointer in steps resolves to a heading 19ms
❯ SETUP_TIPS — detection (33)
✓ tracker fires exactly when tracker-setup-none does 6ms
✓ tracker stays quiet once github is chosen 2ms
✓ tracker stays quiet once linear is chosen 2ms
✓ tracker stays quiet once jira is chosen 1ms
✓ gh-mcp fires only for the GitHub tracker 9ms
✓ bkit-env fires until every token the github tracker needs is set 4ms
✓ bkit-env fires until every token the linear tracker needs is set 3ms
✓ bkit-env fires until every token the jira tracker needs is set 4ms
✓ issue-forms fires only for the GitHub tracker with no issue template folder 13ms
✓ direnv stays quiet until .bkit/.env exists 2ms
× env-backup fires with a bkit env file and no env-backup script, not on cloud or CI 6ms
✓ context-fetch fires exactly when context-fetch-missing does 14ms
✓ dependabot-renovate fires exactly when dep-updater-absent does 3ms
✓ trivy fires once workflows exist and none runs the scan 5ms
✓ test-lint stays quiet until the repo lists a JS test runner 2ms
✓ test-lint fires for vitest in devDependencies with no test linter 11ms
✓ test-lint fires for jest in dependencies with no test linter 3ms
✓ test-lint goes quiet once .oxlintrc.json lints tests 3ms
✓ test-lint goes quiet once oxlint.config.ts lints tests 2ms
✓ test-lint goes quiet once eslint.config.js lints tests 4ms
✓ test-lint goes quiet once .eslintrc.json lints tests 6ms
✓ test-lint goes quiet when oxlint is a dependency 2ms
✓ test-lint still fires when the ESLint config names no test plugin 3ms
✓ cloud fires only once cloud agents are chosen 3ms
✓ ci-workflow follows a renamed bkit.ciWorkflow 2ms
✓ serena needs both the project file and an MCP entry 3ms
✓ compaction-window and claude-connectors fire per Claude Code setting 4ms
✓ host-specific tips stay quiet without their host 2ms
✓ tmp-prune fires only once a pre-push hook exists without the prune script 3ms
✓ min-push fires only once a pre-push hook exists without the min-push check 4ms
✓ disk-prune fires only once a pre-push hook exists without either step file 3ms
✓ disk-prune stays quiet once the machine step file exists 5ms
✓ mcp-scope fires on an unlocked URL 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/checks/tips/catalogue.test.ts > SETUP_TIPS — detection > env-backup fires with a bkit env file and no env-backup script, not on cloud or CI
TypeError: Cannot read properties of undefined (reading 'fires')
❯ .bkit/core/engine/checks/tips/catalogue.test.ts:241:28
239| vi.stubEnv("CLAUDE_CODE_REMOTE", "");
240| vi.stubEnv("CURSOR_REMOTE_AGENT", "");
241| expect(tip("env-backup").fires(cwd)).toBe(false); // no .bkit/.env
| ^
242| write(".bkit/.env", "BKIT_GH_TOKEN=x\n");
243| expect(tip("env-backup").fires(cwd)).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 47 passed (48)
Start at 14:15:46
Duration 1.23s (transform 71%, tests 16%, import 12%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tYeuGq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
