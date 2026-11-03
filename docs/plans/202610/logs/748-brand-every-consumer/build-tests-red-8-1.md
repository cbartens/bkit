Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 8, attempt 1

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 23 | `.bkit/core/engine/install/modules/core.test.ts` "renameScriptTokens returns a many-flag line in bounded time" | red | failure: expected 7468.627625 to be less than 500 |

## Gaps

None.

## Lint output — `.bkit/core/engine/install/modules/core.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/modules/core.test.ts

```

## Runner output — `.bkit/core/engine/install/modules/core.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/modules/core.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer

 ❯ .bkit/core/engine/install/modules/core.test.ts (28 tests | 1 failed) 7495ms
   ✓ runCoreModule first-install advisory (BAR-141: structured finding) (4)
     ✓ uses advisories.push (not printSink.push) for first-install message 1ms
     ✓ first-install advisory id is first-install-postinstall-steps 0ms
     ✓ first-install advisory action does NOT contain onlyBuiltDependencies 0ms
     ✓ first-install advisory action no longer references GitHub Packages install auth 0ms
   ✓ guardCoreRoot — fail-loud on missing core root (3)
     ✓ calls process.exit(1) when the injected root does not exist 1ms
     ✓ emits the correct error message including the injected path 0ms
     ✓ does NOT exit when the root exists 0ms
   ✓ removeOrphans — prune stale bkit mirror files, allowlisted dirs only (16)
     ✓ removes prefixed .md files absent from the source set and keeps the rest 1ms
     ✓ upgrade removes the complexity-split agent mirror 4ms
     ✓ dry-run reports orphans without deleting them 1ms
     ✓ throws and deletes nothing for a dir outside the allowlist 1ms
     ✓ .opencode/agents: removes a stale bkit-* .md file and keeps the current one 1ms
     ✓ .opencode/commands: removes a stale bkit-* .md file and keeps the current one 1ms
     ✓ .agents/plugins/bkit/agents: removes a stale bkit-* .md file and keeps the current one 1ms
     ✓ .codex/agents: with extension .toml removes a stale bkit-* .toml and keeps the rest 1ms
     ✓ an empty extension matches every bkit-* entry whatever its suffix 1ms
     ✓ wholeFolders mode — skill folders removed recursively (5)
       ✓ .agents/skills: removes a stale bkit-* folder with its contents and keeps current and foreign ones 1ms
       ✓ .agents/plugins/bkit/skills: removes a stale bkit-* folder with its contents and keeps current and foreign ones 2ms
       ✓ dry-run reports the stale folder without deleting it 1ms
       ✓ returns nothing when the folder does not exist 0ms
       ✓ throws and deletes nothing for a folder outside the allowlist 1ms
     ✓ accepts the folder constants the host modules sweep 0ms
     ✓ dry-run with the extension option reports without deleting 1ms
   ❯ renameScriptTokens (5)
     ✓ renameScriptTokens rewrites whole pnpm tokens only 0ms
     ✓ renameScriptTokens rewrites tokens after pnpm flags 0ms
     ✓ renameScriptTokens leaves package-selecting flag forms alone 0ms
     ✓ renameScriptTokens leaves recursive flag forms alone 0ms
     × renameScriptTokens returns a many-flag line in bounded time 7471ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/modules/core.test.ts > renameScriptTokens > renameScriptTokens returns a many-flag line in bounded time
AssertionError: expected 7468.627625 to be less than 500
 ❯ .bkit/core/engine/install/modules/core.test.ts:326:21
    324|     const elapsed = performance.now() - start;
    325|     expect(out).toBe(line);
    326|     expect(elapsed).toBeLessThan(500);
       |                     ^
    327|   });
    328| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 27 passed (28)
   Start at  16:50:40
   Duration  7.62s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-sroPq9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
