Enforced: true
Verdict: null
Gaps: 3
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/892-template-copies-bkit-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/template-copies.integration.test.ts` "leaves a staged template copy unchanged under plain lint-staged" | red | passed |
| 1 | `.bkit/core/engine/install/template-copies.integration.test.ts` "ships the sample configs under non-discoverable names" | red | passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade replaces the old sample config names" | red | passed |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config" | red | not passed |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade dry run reports the lint-staged config copy without writing it" | red | not passed |
| 5 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade writes no root lint-staged config for a consumer that relied on the nested sample" | red | passed |
| 5 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade names the missing root lint-staged config with the copy command" | red | passed |
| 6 | `.bkit/core/engine/checks/tips/detect.test.ts` "hasLintStagedConfig is true for every config name lint-staged 17 reads" | red | passed |
| 6 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts" | red | passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when lint-staged is not a dependency" | red | passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path" | red | passed |

## Gaps

- Task 4 `not-green` — the named test "upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config" did not run; the report holds "upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "upgrade integration: consumer customizations > does not silently overwrite consumer drift in --non-interactive mode", "upgrade integration: consumer customizations > conflict list has relPath and both content versions for AI-actionable diff", "upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … — Fixable: true — log: TASK 4: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config` — not-green — Fixable: true
- Task 4 `not-green` — the named test "upgrade dry run reports the lint-staged config copy without writing it" did not run; the report holds "upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "upgrade integration: consumer customizations > does not silently overwrite consumer drift in --non-interactive mode", "upgrade integration: consumer customizations > conflict list has relPath and both content versions for AI-actionable diff", "upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … — Fixable: true — log: TASK 4: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade dry run reports the lint-staged config copy without writing it` — not-green — Fixable: true
- Task 1 `delete-still-referenced` — DELETE `.bkit/templates/.lintstagedrc.json` is still referenced as `.lintstagedrc`: `.agents/plugins/bkit/hooks/bkit-gateguard.cjs:78`, `.agents/skills/vitest/references/features-filtering.md:75`, `.bkit/core/.bkit/templates.md:166`, `.bkit/core/.bkit/templates.md:341`, `.bkit/core/.bkit/templates.md:343`, and 705 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 367ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 353ms
     ✓ passes -w when the consumer is a pnpm workspace root 527ms
     ✓ starts the package runner for the install and the re-exec 985ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 265ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 4481ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 3819ms
   ✓ #892 — upgrade warns about a missing root lint-staged config instead of writing one (6)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 2706ms
     ✓ upgrade names the missing root lint-staged config with the copy command 2551ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 2119ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 7339ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 5910ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 5465ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #489 — managed-version marker on every file bkit writes > check flags an old marker; upgrade restamps every marker with no conflict; check is then clean
Error: Test timed out in 64801ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:702:3
    700|   });
    701|
    702|   it("check flags an old marker; upgrade restamps every marker with no…
       |   ^
    703|     installEverything();
    704|     const version = readInstallingVersion();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 70 passed (71)
   Start at  18:04:34
   Duration  418.37s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xcJLNt/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
