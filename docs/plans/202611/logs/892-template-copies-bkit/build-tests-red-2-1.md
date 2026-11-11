Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202611/892-template-copies-bkit-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config" | red | failure: expected false to be true // Object.is equality |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade dry run reports the lint-staged config copy without writing it" | vacuous | "upgrade dry run reports the lint-staged config copy without writing it" passes at its red, so it proves nothing |

## Gaps

- TASK 4 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade dry run reports the lint-staged config copy without writing it" `vacuous` — "upgrade dry run reports the lint-staged config copy without writing it" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/892-template-copies-bkit
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts

[test-timeout-budget] load average 91.3 on 10 cores: unit limits 30000ms per test, 60000ms per hook (x6.00)

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

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (67 tests | 1 failed) 183649ms
   ✓ upgrade integration: consumer customizations (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 5ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 2ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 2ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 3ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 347ms
     ✓ install --claude does not write Serena or graphify examples 591ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 322ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 347ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 348ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 3748ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 4571ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 4624ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 3983ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 4096ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 3882ms
     ✓ malformed .mcp.json fails install instead of being overwritten 593ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 5866ms
     ✓ an adopted copy of every template survives upgrade and check 2106ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 1801ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 1861ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 1916ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 8900ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 3334ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 3269ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 9067ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 3011ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 2543ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 5299ms
     ✓ branded script migration is idempotent and dry-run writes nothing 2402ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1873ms
     ✓ a dry-run hook and CI token migration writes nothing 894ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 2300ms
     ✓ a second check-name migration writes nothing 2255ms
     ✓ a dry-run check-name migration writes and moves nothing 992ms
     ✓ a second Vale migration and a dry run write nothing 2808ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 6197ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 2941ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 11728ms
   ✓ upgrade-preservation (9)
     ✓ upgrade preserves consumer content outside the bkit block (markered-text) (4)
       ✓ .gitignore — consumer secret-protection rules survive; bkit block is updated (the #129 case) 5ms
       ✓ .gitattributes — consumer custom attributes outside the block survive 3ms
       ✓ docs/*.md — consumer prose AFTER bkit:end survives even with NO manifest entry (content-detected) 3ms
       ✓ dest has NO bkit markers — block is appended at EOF, all consumer content preserved 3ms
     ✓ upgrade preserves consumer keys (json deep-merge) (1)
       ✓ .claude/settings.json — consumer mcpServers survives; bkit keys merged in (the #129 case) 3ms
     ✓ upgrade is idempotent for block-merge formats (1)
       ✓ records the merged on-disk hash and skips on the second run 4ms
     ✓ upgrade of an owned whole-file candidate (2)
       ✓ auto-updates when there is no consumer drift 3ms
       ✓ honors contentOverride — writes rendered content, never the raw template 9ms
     ✓ upgrade substitutes template tokens (#129 §2) (1)
       ✓ seeds an absent byte-equal file with {{DEFAULT_BRANCH}} resolved, not literal 3ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 8193ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 3898ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 2556ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 3687ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 5424ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 2418ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 4396ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 5217ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 3186ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 5131ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1341ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 252ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 230ms
     ✓ passes -w when the consumer is a pnpm workspace root 270ms
     ✓ starts the package runner for the install and the re-exec 676ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 597ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 8966ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 8858ms
   ❯ #892 — upgrade copies the lint-staged sample to the root (2)
     × upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config 4368ms
     ✓ upgrade dry run reports the lint-staged config copy without writing it 3120ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 66 passed (67)
   Start at  15:44:29
   Duration  183.95s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-sSzQlT/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
