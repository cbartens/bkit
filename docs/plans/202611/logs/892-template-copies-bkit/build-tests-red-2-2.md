Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 2

Plan: `docs/plans/202611/892-template-copies-bkit-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config" | red | failure: expected false to be true // Object.is equality |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade dry run reports the lint-staged config copy without writing it" | red | failure: expected '[bkit-upgrade] Running upgrade (dry-r…' to match /(?<![\w./-])\.…/-])\.lintstagedrc\.json |

## Gaps

None.

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts

[test-timeout-budget] load average 30.2 on 10 cores: unit limits 19600ms per test, 39200ms per hook (x3.92)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > does not silently overwrite consumer drift in --non-interactive mode
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > conflict list has relPath and both content versions for AI-actionable diff
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade integration: consumer customizations > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case)
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > .gitattributes — consumer custom attributes outside the block survive
[bkit-upgrade] upgrade (merge): .gitattributes

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected)
[bkit-upgrade] upgrade (merge): docs/testing.md

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer content outside the bkit block (markered-text) > dest has NO bkit markers — block is appended at EOF, all consumer content preserved
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade preserves consumer keys (json deep-merge) > .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case)
[bkit-upgrade] upgrade (merge): .claude/settings.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade is idempotent for block-merge formats > records the merged on-disk hash and skips on the second run
[bkit-upgrade] upgrade (merge): .gitignore

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > auto-updates when there is no consumer drift
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade of an owned whole-file candidate > honors contentOverride — writes rendered content, never the raw template
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > upgrade-preservation > upgrade substitutes template tokens (#129 §2) > seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal
[bkit-upgrade] upgrade: .bkit/owned/bkit-owned.sh

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (67 tests | 2 failed) 140918ms
   ✓ upgrade integration: consumer customizations (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 8ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 3ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 2ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 4ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 689ms
     ✓ install --claude does not write Serena or graphify examples 993ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 408ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 385ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 368ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 3624ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 9535ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 11569ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 10430ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 4792ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 3785ms
     ✓ malformed .mcp.json fails install instead of being overwritten 899ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 8955ms
     ✓ an adopted copy of every template survives upgrade and check 2167ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 1731ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 1578ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 2004ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 11907ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 4524ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 3010ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 5767ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 2193ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 1113ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 2056ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1845ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1319ms
     ✓ a dry-run hook and CI token migration writes nothing 623ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1611ms
     ✓ a second check-name migration writes nothing 1491ms
     ✓ a dry-run check-name migration writes and moves nothing 666ms
     ✓ a second Vale migration and a dry run write nothing 1595ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 2524ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 1992ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 3726ms
   ✓ upgrade-preservation (9)
     ✓ upgrade preserves consumer content outside the bkit block (markered-text) (4)
       ✓ .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case) 2ms
       ✓ .gitattributes — consumer custom attributes outside the block survive 1ms
       ✓ docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected) 1ms
       ✓ dest has NO bkit markers — block is appended at EOF, all consumer content preserved 1ms
     ✓ upgrade preserves consumer keys (json deep-merge) (1)
       ✓ .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case) 1ms
     ✓ upgrade is idempotent for block-merge formats (1)
       ✓ records the merged on-disk hash and skips on the second run 2ms
     ✓ upgrade of an owned whole-file candidate (2)
       ✓ auto-updates when there is no consumer drift 1ms
       ✓ honors contentOverride — writes rendered content, never the raw template 1ms
     ✓ upgrade substitutes template tokens (#129 §2) (1)
       ✓ seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal 1ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 2719ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1687ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1671ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1859ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 1980ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1662ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1832ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1965ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 2315ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 2327ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1214ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 139ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 142ms
     ✓ passes -w when the consumer is a pnpm workspace root 140ms
     ✓ starts the package runner for the install and the re-exec 551ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 147ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 2264ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 2393ms
   ❯ #892 — upgrade copies the lint-staged sample to the root (2)
     × upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config 1028ms
     × upgrade dry run reports the lint-staged config copy without writing it 977ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #892 — upgrade copies the lint-staged sample to the root > upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2448:39
    2446|
    2447|     const rootConfig = path.join(tmpDir, ".lintstagedrc.json");
    2448|     expect(fs.existsSync(rootConfig)).toBe(true);
       |                                       ^
    2449|     const shipped = path.join(tmpDir, ".bkit", "templates", "lintstage…
    2450|     expect(fs.readFileSync(rootConfig, "utf-8")).toBe(fs.readFileSync(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #892 — upgrade copies the lint-staged sample to the root > upgrade dry run reports the lint-staged config copy without writing it
AssertionError: expected '[bkit-upgrade] Running upgrade (dry-r…' to match /(?<![\w./-])\.…/-])\.lintstagedrc\.json

- Expected:
/(?<![\w./-])\.lintstagedrc\.json/

+ Received:
"[bkit-upgrade] Running upgrade (dry-run)
[bkit-upgrade] Templates updated (2). bkit never applies these; diff them against your own copies and adopt what you want:
  added:   .bkit/templates/lintstagedrc.example.json
  removed: .bkit/templates/.lintstagedrc.json
Templates (adopt, do not skip): read .bkit/templates.md; bkit never applies templates, so adopt each copy in .bkit/templates/ unless adoption would break existing functionality — state which you did not adopt and why. (If your own gates scan the repo, ignore .bkit/templates/.)
[bkit-upgrade] [dry-run] core: package.json scripts added [bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-upgrade] [dry-run] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-upgrade] [dry-run] write: .claude/commands/bkit-auto.md
[bkit-upgrade] [dry-run] write: .claude/commands/bkit-build.md
[bkit-upgrade] [dry-run] write: .claude/commands/bkit-debug.md
[bkit-upgrade] [dry-run] write: .claude/commands/bkit-design.md
[bkit-upgrade] [dry-run] write: .claude/commands/bkit-plan.md
[bkit-upgrade] [dry-run] write: .claude/commands/bkit-ship.md
[bkit-upgrade] [dry-run] write: .claude/agents/bkit-audit-generate.md
[bkit-upgrade] [dry-run] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-upgrade] [dry-run] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-upgrade] Done. updated: 0, skipped: 60, conflicts: 0, re-rendered: 10

"

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2461:33
    2459|
    2460|     // A root-level name only: the pruned `.bkit/templates/.lintstaged…
    2461|     expect(combinedOutput(dry)).toMatch(/(?<![\w./-])\.lintstagedrc\.j…
       |                                 ^
    2462|     // The copy is a dry-run write line of its own, naming the root fi…
    2463|     // template line, or any line that only mentions the file, does no…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 65 passed (67)
   Start at  15:48:51
   Duration  141.47s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8WrwrP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
