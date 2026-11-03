Enforced: true
Red: 0
Accepted: 2
Updated: 0
Gaps: 2

<!-- verdict:end -->

# Tests Red — group 3, attempt 2

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" | missing | "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … |
| 8 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run write and move nothing" | missing | "a second template-file migration and a dry run write and move nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", … |
| 13 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration second upgrade logs no branded line for the hook and CI file" | passed-accepted | passes; accepted by the tests step: Task 7 migration already behaves so; test is a rescoped replacement |
| 14 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run leave scripts/ci and the hooks unchanged" | passed-accepted | passes; accepted by the tests step: Task 8 migration already idempotent; snapshot now skips .claude/bkit-cloud.md |

## Gaps

- TASK 7 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" `missing` — "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", …
- TASK 8 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second template-file migration and a dry run write and move nothing" `missing` — "a second template-file migration and a dry run write and move nothing" did not run; the report holds "P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff", "P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file", "issue #129 §5 — upgrade does not force-create opt-in module files > does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer", …

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/748-brand-every-consumer

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved)
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > does not silently overwrite consumer drift in --non-interactive mode
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > conflict list has relPath and both content versions for AI-actionable diff
[bkit-upgrade] conflict: .cursor/hooks.json — consumer drift detected, NOT overwriting
[bkit-upgrade] 1 conflict(s) detected. Manually merge or revert consumer changes:
  - .cursor/hooks.json

stdout | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file
[bkit-upgrade] upgrade: .claude/agents/bkit-test.md

stderr | .bkit/core/engine/commands/install/upgrade.integration.test.ts > P4.T7 — upgrade integration: heavy-customised-consumer scenario > upgrades non-conflicting file while preserving conflicting consumer file
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

 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (60 tests) 34997ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ install --claude does not write Serena or graphify examples 333ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 651ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 640ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 647ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 1145ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 1171ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 1139ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 1000ms
     ✓ an adopted copy of every template survives upgrade and check 1160ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 1157ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 1216ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 425ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 1549ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 986ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (8)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 903ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 1293ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 893ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 889ms
     ✓ branded script migration is idempotent and dry-run writes nothing 1381ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1000ms
     ✓ a dry-run hook and CI token migration writes nothing 629ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 1300ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 910ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 883ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 983ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 665ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 624ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 633ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 642ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 628ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 631ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 613ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 756ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 912ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 902ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 495ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ starts the package runner for the install and the re-exec 580ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 972ms

 Test Files  1 passed (1)
      Tests  60 passed (60)
   Start at  14:22:30
   Duration  35.19s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-MjpRdc/junit.xml
```
