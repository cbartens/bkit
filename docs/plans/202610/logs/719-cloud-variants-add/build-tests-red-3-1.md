Enforced: true
Red: 14
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 4 | `.bkit/core/engine/install/manifest.test.ts` "parseCloudAgents accepts codex" | red | failure: expected null to be 'codex' // Object.is equality |
| 4 | `.bkit/core/engine/cli.test.ts` "--auto=codex parses to the codex cloud variant" | red | failure: process.exit unexpectedly called with "1" (test file: /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/.bkit/core/engine/cli.test.ts) |
| 4 | `.bkit/core/engine/cli.test.ts` "--auto=<bad> lists claude, cursor, opencode and codex" | red | failure: expected '[bkit] Unknown cloud variant: "banana…' to contain 'codex' |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY" | red | failure: expected 'Full recipe in bkit\'s `cloud.md` § P…' to contain '--codex' |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "%s variant under %s names only that tracker's key" | red | failure: claude/linear: expected 'Cloud agents (claude) need the unifie…' to contain 'BKIT_LINEAR_API_KEY' |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables" | red | failure: expected 'Full recipe in bkit\'s `cloud.md` § P…' to match /`BKIT_ANTHROPIC_API_KEY` repo secret/ |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "opencode variant advisory names the configured provider's BKIT_ key" | red | failure: expected 'Full recipe in bkit\'s `cloud.md` § P…' not to contain 'OPENCODE_PROVIDER_KEY' |
| 5 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "vendor API keys are BKIT_-prefixed" | red | failure: expected [ 'BKIT_GH_TOKEN', …(8) ] to include 'BKIT_OPENAI_API_KEY' |
| 6 | `.bkit/core/engine/commands/install/install.test.ts` "validateCloudTrackerWired passes %s with %s" | red | failure: validateCloudTrackerWired is not a function |
| 6 | `.bkit/core/engine/commands/install/install.test.ts` "validateCloudTrackerWired refuses tracker none naming --tracker=" | red | failure: validateCloudTrackerWired is not a function |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--auto=codex without .codex/ exits 1 naming --codex and writes nothing" | red | failure: expected '\n[bkit] Unknown cloud variant: "code…' to contain '--codex' |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | red | failure: [bkit] Unknown cloud variant: "codex". Valid values: claude, cursor, opencode : expected 1 to be +0 // Object.is equality |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --auto=cursor exits 0 and records cursor" | red | failure: [bkit] --auto=cursor requires tracker=linear, but the resolved tracker is "github". Re-run with the matching tracker: bkit install --tracker=linear --auto=cursor (tracker switching is free). : expected 1 to be +0 // Object.is equality |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --opencode --auto=opencode in one run exits 0 and records opencode" | red | failure: [bkit] --auto=opencode requires the local opencode host to be installed first. Run: bkit install --opencode=<provider> (e.g. --opencode=opencode-zen) The cloud opencode job runs against the committed .opencode/ config — without it there is nothing to run. : expected 1 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/install/manifest.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/manifest.test.ts

```

## Runner output — `.bkit/core/engine/install/manifest.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/manifest.test.ts

[test-timeout-budget] load average 3.5 on 10 cores: unit limits 6250ms per test, 12500ms per hook (x1.25)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/install/manifest.test.ts (50 tests | 1 failed) 21ms
   ✓ CLAUDE.md ownership (#252: moved core → claude) (3)
     ✓ CLAUDE.md is owned by the claude module (markered-text) 1ms
     ✓ getModuleManifest('claude') includes CLAUDE.md 0ms
     ✓ getModuleManifest('core') does NOT include CLAUDE.md (but keeps AGENTS.md) 0ms
   ✓ .claude/hooks/bkit-gateguard.cjs ownership (markered-text: consumer owns the driver) (1)
     ✓ is owned by the claude module as markered-text 0ms
   ✓ cloud manifests (2)
     ✓ cloud=claude owns no files 0ms
     ✓ cloud=opencode and cloud=cursor own no files 0ms
   ✓ no manifest entry is a template path (2)
     ✓ every module's entries are owned or shared files, never a copy-and-own template 0ms
     ✓ the MCP configs are json (bkit owns one tracker entry) and .bkit/.env.example is owned 0ms
   ❯ parseCloudAgents — value space and back-compat (6)
     ✓ parses 'claude' → 'claude' 0ms
     ✓ parses 'cursor' → 'cursor' 0ms
     ✓ parses 'opencode' → 'opencode' 0ms
     × parseCloudAgents accepts codex 2ms
     ✓ parses 'none' → 'none' 0ms
     ✓ returns null for unknown values 0ms
   ✓ parseIssueTracker — value space (6)
     ✓ the tracker set is github, linear, jira and the 'none' sentinel 0ms
     ✓ parses 'github' → 'undefined' 0ms
     ✓ parses 'linear' → 'undefined' 0ms
     ✓ parses 'jira' → 'undefined' 0ms
     ✓ parses 'none' → 'undefined' 0ms
     ✓ returns null for unknown values 0ms
   ✓ getInstallManifest (7)
     ✓ returns entries for all modules when called with empty array 1ms
     ✓ returns only entries for specified modules 0ms
     ✓ accepts a Set<string> as modules parameter 0ms
     ✓ core manifest includes .bkit/version as byte-equal-text 0ms
     ✓ core manifest includes the canonical .bkit docs (#218; prompts.md markered #245) 0ms
     ✓ core manifest lists no lite doc and prompts.md is the only markered-text core doc 0ms
     ✓ cloud owns no manifest entry (bkit-cloud-bootstrap.sh is a copy-and-own template) 0ms
   ✓ getModuleManifest (4)
     ✓ every file-writing module has at least one entry 0ms
     ✓ cloud writes no manifest entries 0ms
     ✓ all entries have correct module field 0ms
     ✓ all entries have valid format field 0ms
   ✓ OPENCODE_MANIFEST — round-trip and format contracts (8)
     ✓ contains .opencode/opencode.json as json (Tier-2 deep-contained) 0ms
     ✓ contains .opencode/plugin/bkit-gateguard.js as markered-text (consumer owns the driver) 0ms
     ✓ all OPENCODE_MANIFEST entries have module=opencode 0ms
     ✓ all OPENCODE_MANIFEST format values are valid ManifestEntry formats 0ms
     ✓ getInstallManifest(['opencode']) returns OPENCODE_MANIFEST entries 0ms
     ✓ getModuleManifest('opencode') returns at least 2 entries 0ms
     ✓ opencode manifest is NOT included in getInstallManifest(['cursor']) (additive opt-in) 0ms
     ✓ opencode manifest is NOT included in getInstallManifest(['claude']) (additive opt-in) 0ms
   ✓ KN-19-for-opencode — writeTier2JsonContained throws on malformed .opencode/opencode.json (2)
     ✓ writeTier2JsonContained throws on malformed destination JSON (KN-19) 12ms
     ✓ writeTier2JsonContained does NOT throw on valid destination JSON (normal path) 1ms
   ✓ gate tool script template values (2)
     ✓ bkit:lint:prose and bkit:slop:delta call their bkit ci gates 0ms
     ✓ this repo's bkit:lint:prose calls the same gate 0ms
   ✓ gate chains (1)
     ✓ gate chains call bkit:lint:prose and bkit:slop:delta 0ms
   ✓ telemetry data files — absent from manifest format entries (1)
     ✓ none of the four telemetry data files appear as manifest format entries 0ms
   ✓ install/manifest: single dispatch on entry.format (5)
     ✓ json entries: settings.json and hooks.json use format json 0ms
     ✓ markered-text entries: AGENTS.md, CLAUDE.md, .gitignore use format markered-text 0ms
     ✓ byte-equal-text entries: the owned .bkit files use format byte-equal-text 0ms
     ✓ every entry has a valid format value 0ms
     ✓ ANTIGRAVITY_MANIFEST: plugin.json + hooks.json are json, hooks + GEMINI.md markered-text 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/manifest.test.ts > parseCloudAgents — value space and back-compat > parseCloudAgents accepts codex
AssertionError: expected null to be 'codex' // Object.is equality

- Expected:
"codex"

+ Received:
null

 ❯ .bkit/core/engine/install/manifest.test.ts:110:39
    108|
    109|   it("parseCloudAgents accepts codex", () => {
    110|     expect(parseCloudAgents("codex")).toBe("codex");
       |                                       ^
    111|   });
    112|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 49 passed (50)
   Start at  18:31:45
   Duration  103ms (tests 47%, setup 29%, transform 10%, import 9%, worker 4%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-1J7c5c/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/cli.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/cli.test.ts

```

## Runner output — `.bkit/core/engine/cli.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/cli.test.ts

[test-timeout-budget] load average 3.5 on 10 cores: unit limits 6250ms per test, 12500ms per hook (x1.25)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

stderr | .bkit/core/engine/cli.test.ts > parseArgs — module flags > --auto=codex parses to the codex cloud variant
[bkit] Unknown cloud variant: "codex". Valid values: claude, cursor, opencode

 ❯ .bkit/core/engine/cli.test.ts (151 tests | 2 failed) 15ms
   ✓ parseArgs — verb parsing (8)
     ✓ install verb is parsed correctly 1ms
     ✓ check verb is parsed correctly 0ms
     ✓ upgrade verb is parsed correctly 0ms
     ✓ help verb is parsed correctly 0ms
     ✓ --help flag is parsed as help verb 0ms
     ✓ -h flag is parsed as help verb 0ms
     ✓ no args defaults to help 0ms
     ✓ doctor verb is parsed correctly 0ms
   ❯ parseArgs — module flags (11)
     ✓ --claude → claude + implicit core; recorded in moduleFlags 0ms
     ✓ --cursor → cursor + implicit core 0ms
     ✓ hosts compose: --claude --cursor --codex → every named host + core 0ms
     ✓ bare `install` records zero module flags (the ≥1 guard lives in main()) 0ms
     ✓ --auto=claude → cloud + core only; cloudVariant=claude 0ms
     ✓ --auto=cursor → cloud + core only; cloudVariant=cursor 0ms
     × --auto=codex parses to the codex cloud variant 2ms
     × --auto=<bad> lists claude, cursor, opencode and codex 2ms
     ✓ bare --auto (install) → error (variant required) 0ms
     ✓ --auto=<bad> → rejected 0ms
     ✓ parseArgs returns resolved modules as a Set 0ms
   ✓ parseArgs — internal module names are not flags (6)
     ✓ --core → Unknown flag 0ms
     ✓ --lint → Unknown flag 0ms
     ✓ --cloud → Unknown flag 0ms
     ✓ --cloud=claude → Unknown flag 0ms
     ✓ --typescript → Unknown flag 0ms
     ✓ uninstall --typescript → Unknown flag (the retired lint module's flag) 0ms
   ✓ parseArgs — host composition (5)
     ✓ install --claude --codex composes with hosts 0ms
     ✓ uninstall --codex → {codex} only (targeted, core preserved) 0ms
     ✓ install --antigravity → antigravity + implicit core 0ms
     ✓ uninstall --antigravity → {antigravity} only (targeted, core preserved) 0ms
     ✓ --antigravity=<value> → rejected (bare flag, one gateway) 0ms
   ✓ resolveModules — verb-aware resolution (5)
     ✓ install: named modules + implicit core 0ms
     ✓ install: empty flags → core only (main() guards the empty case) 0ms
     ✓ uninstall (bare): every module incl. opt-ins + core (zero footprint) 0ms
     ✓ uninstall (targeted): named modules ONLY — core is NOT added 0ms
     ✓ check/upgrade: core implicit + named (main() rejects stray module flags) 0ms
   ✓ parseArgs — unknown flag / verb rejection (3)
     ✓ unknown flag --foo → exit 1 0ms
     ✓ unknown verb → exit 1 0ms
     ✓ `bkit codex` is not a verb 0ms
   ✓ printUsage — help output (7)
     ✓ lists the new module flags 0ms
     ✓ documents compose + core examples 0ms
     ✓ names every host flag in the install 'Hosts compose' line 0ms
     ✓ lists opencode-zen and opencode-go (not bare opencode) as supported providers 0ms
     ✓ documents install requires ≥1 module flag 0ms
     ✓ includes doctor, status, uninstall verbs + uninstall flags 0ms
     ✓ documents the --auto-apply upgrade flag 0ms
   ✓ parseArgs — uninstall verb (11)
     ✓ uninstall verb is parsed correctly 0ms
     ✓ bare uninstall → all modules incl. opt-in add-ons + core (zero footprint) 0ms
     ✓ uninstall --claude → claude ONLY (no core) 0ms
     ✓ uninstall --auto (bare) → cloud only; no variant needed 0ms
     ✓ uninstall --dry-run sets dryRun flag 0ms
     ✓ uninstall --force sets force flag 0ms
     ✓ uninstall --nuke sets nuke flag 0ms
     ✓ uninstall --yes sets yes flag 0ms
     ✓ uninstall --nuke --yes --force compose correctly 0ms
     ✓ uninstall flags default to false when not specified 0ms
     ✓ install --auto-revert sets autoRevert flag 0ms
   ✓ parseArgs — upgrade flags (2)
     ✓ --auto-apply sets the non-interactive upgrade mode 0ms
     ✓ --dry-run sets the upgrade dry-run mode 0ms
   ✓ parseArgs — --opencode flag (8)
     ✓ --opencode=opencode-go → opencode + core; provider recorded 0ms
     ✓ --opencode=openrouter → opencode + core, provider=openrouter (#245 named provider) 0ms
     ✓ --opencode=gemini → rejected (still descoped — not in the strict allowlist) 0ms
     ✓ bare --opencode (no value) on install is rejected — provider required 0ms
     ✓ --claude --opencode=opencode-go compose 0ms
     ✓ opencode is NOT installed implicitly (additive opt-in) 0ms
     ✓ uninstall --opencode (bare) → opencode only (no provider needed) 0ms
     ✓ bare uninstall reaches opencode (full opt-in removal) 0ms
   ✓ parseArgs — --opencode provider strict allowlist (17)
     ✓ --opencode=openrouter is accepted 0ms
     ✓ --opencode=ollama is accepted 0ms
     ✓ --opencode=opencode-zen is accepted 0ms
     ✓ --opencode=opencode-go is accepted 0ms
     ✓ --opencode=gemini → rejected (still descoped — not added in #245) 0ms
     ✓ --opencode=openai → rejected (well-formed but unsupported (Codex CLI lane, #247)) 0ms
     ✓ --opencode=anthropic → rejected (well-formed but unsupported) 0ms
     ✓ --opencode=my-provider → rejected (arbitrary user slug — no generic fallback) 0ms
     ✓ --opencode=ollama-cloud → rejected (near-miss (cloud key is the bare `ollama`)) 0ms
     ✓ --opencode=MY_PROVIDER → rejected (uppercase) 0ms
     ✓ --opencode=provider with spaces → rejected (spaces) 0ms
     ✓ --opencode=x$y → rejected (special character) 0ms
     ✓ --opencode=1openrouter → rejected (starts with digit) 0ms
     ✓ --opencode=opencode → rejected (not a provider key (Zen is opencode-zen)) 0ms
     ✓ --opencode=zen → rejected (not a provider key (Zen is opencode-zen)) 0ms
     ✓ --opencode=go → rejected (not a provider key (Go is opencode-go)) 0ms
     ✓ --opencode= (empty value after equals) → 'requires a provider value' 0ms
   ✓ parseArgs — status verb (1)
     ✓ status verb is parsed correctly 0ms
   ✓ parseArgs — launcher verbs (6)
     ✓ cursor verb is parsed correctly 0ms
     ✓ opencode verb (launcher) is parsed correctly 0ms
     ✓ cursor with no flags → empty moduleFlags 0ms
     ✓ opencode with no flags → empty moduleFlags 0ms
     ✓ cursor with a flag → exit 1 (no flags allowed) 0ms
     ✓ opencode with a flag → exit 1 (no flags allowed) 0ms
   ✓ printUsage — launcher verbs in help text (6)
     ✓ documents bkit cursor 0ms
     ✓ documents bkit opencode as a launcher 0ms
     ✓ documents BKIT_CURSOR_BIN override 0ms
     ✓ documents BKIT_OPENCODE_BIN override 0ms
     ✓ mentions launchctl fallback 0ms
     ✓ points the persistent launchd setup at the template docs 0ms
   ✓ printUsage — status + opencode in help text (2)
     ✓ lists bkit status as read-only / writes-nothing 0ms
     ✓ describes opencode as additive + provider-required 0ms
   ✓ parseArgs — upgrade --to/--latest (7)
     ✓ parses --to=<version> on upgrade 0ms
     ✓ parses --latest on upgrade 0ms
     ✓ defaults to no self-bump on a bare upgrade 0ms
     ✓ rejects --to=<version> on a non-upgrade verb (e.g. check) 0ms
     ✓ rejects --latest on install 0ms
     ✓ rejects --to and --latest together (mutually exclusive) 0ms
     ✓ rejects an empty --to= value 0ms
   ✓ parseArgs — comply verb (11)
     ✓ comply verb is parsed correctly 0ms
     ✓ comply --phase=ship parses to {verb:'comply', complyPhase:'ship'} 0ms
     ✓ comply --phase=design parses correctly 0ms
     ✓ comply --phase=plan parses correctly 0ms
     ✓ comply --phase=build parses correctly 0ms
     ✓ comply --phase=debug parses correctly 0ms
     ✓ comply --phase=<unknown> exits cleanly with exit 1 0ms
     ✓ bare --phase (no value) exits with error 0ms
     ✓ --phase on non-comply verb exits with error 0ms
     ✓ complyPhase is null for non-comply verbs 0ms
     ✓ complyPhase is null for comply with no --phase (missing phase) 0ms
   ✓ parseComplyPhase (4)
     ✓ accepts all valid phases 0ms
     ✓ returns null for unknown phase 0ms
     ✓ returns null for non-string input 0ms
     ✓ COMPLY_PHASES contains exactly 5 phases 0ms
   ✓ printUsage — comply verb in help text (3)
     ✓ documents bkit comply --phase=<phase> 0ms
     ✓ documents --phase= in help output 0ms
     ✓ documents that comply is advisory / never gates 0ms
   ✓ parseArgs — stats verb (3)
     ✓ stats verb is parsed correctly 0ms
     ✓ stats verb sets no module flags 0ms
     ✓ harvest and analysis are no longer verbs 0ms
   ✓ parseArgs — tips verb (5)
     ✓ parses bare tips as the top-three view 0ms
     ✓ --all lifts the cap 0ms
     ✓ --workflow names the workflow; bare tips names none 0ms
     ✓ --workflow refuses an unknown workflow 0ms
     ✓ --all is refused on other verbs 0ms
   ✓ printUsage — stats verb in help text (2)
     ✓ documents bkit stats and its report file 0ms
     ✓ documents neither bkit harvest nor bkit analysis 0ms
   ✓ parseArgs — telemetry verb (6)
     ✓ telemetry summary → verb=telemetry, telemetrySubverb=summary 0ms
     ✓ telemetry with no sub-verb → exit(1) 0ms
     ✓ telemetry with unknown sub-verb → exit(1) 0ms
     ✓ telemetry migrate is an unknown sub-verb → exit(1) 0ms
     ✓ telemetry validate is an unknown sub-verb → exit(1) 0ms
     ✓ telemetry normalise is an unknown sub-verb → exit(1) 0ms
   ✓ parseTelemetrySubverb (4)
     ✓ summary → TelemetrySubverb 0ms
     ✓ unknown → null 0ms
     ✓ null → null 0ms
     ✓ TELEMETRY_SUBVERBS is exactly summary 0ms
   ✓ validateModuleFlagsForVerb — #252 Step 2/3 verb/module-flag validation (8)
     ✓ errors when install is given zero module flags 0ms
     ✓ names every host flag and every --auto variant in the bare-install error 0ms
     ✓ passes when install is given at least one module flag 0ms
     ✓ passes when install is given --tracker= alone 0ms
     ✓ errors when check is given a module flag 0ms
     ✓ errors when upgrade is given a module flag 0ms
     ✓ passes when check/upgrade are given zero module flags 0ms
     ✓ does not constrain other verbs (uninstall, doctor, help, ...) 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/cli.test.ts > parseArgs — module flags > --auto=codex parses to the codex cloud variant
Error: process.exit unexpectedly called with "1" (test file: /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add/.bkit/core/engine/cli.test.ts)
 ❯ parseArgs .bkit/core/engine/cli.ts:398:19
    396|             `[bkit] Unknown cloud variant: "${value}". Valid values: $…
    397|           );
    398|           process.exit(1);
       |                   ^
    399|         }
    400|         cloudVariant = parsed;
 ❯ .bkit/core/engine/cli.test.ts:123:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/cli.test.ts > parseArgs — module flags > --auto=<bad> lists claude, cursor, opencode and codex
AssertionError: expected '[bkit] Unknown cloud variant: "banana…' to contain 'codex'

Expected: "codex"
Received: "[bkit] Unknown cloud variant: "banana". Valid values: claude, cursor, opencode"

 ❯ .bkit/core/engine/cli.test.ts:133:19
    131|     expect(msg).toMatch(/Unknown cloud variant/);
    132|     for (const variant of ["claude", "cursor", "opencode", "codex"]) {
    133|       expect(msg).toContain(variant);
       |                   ^
    134|     }
    135|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 149 passed (151)
   Start at  18:31:47
   Duration  231ms (import 44%, transform 39%, tests 8%, setup 7%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8K7gOq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/modules/cloud.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/modules/cloud.integration.test.ts

```

## Runner output — `.bkit/core/engine/install/modules/cloud.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/modules/cloud.integration.test.ts

[test-timeout-budget] load average 3.5 on 10 cores: unit limits 6250ms per test, 12500ms per hook (x1.25)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

stdout | .bkit/core/engine/install/modules/cloud.integration.test.ts > runCloudModule — opt-in cloud agents (post-CI auto-routing) > the default module set does NOT ship cloud scaffolding
[bkit-install] Running core payload pass
[bkit-install] core: .agents/context.md
[bkit-install] core: .agents/docs.md
[bkit-install] core: .agents/rules.md
[bkit-install] core: .agents/skills.md
[bkit-install] core: AGENTS.md
[bkit-install] core: docs/templates/bkit-audit-accessibility.md
[bkit-install] core: docs/templates/bkit-audit-adoption.md
[bkit-install] core: docs/templates/bkit-audit-agents.md
[bkit-install] core: docs/templates/bkit-audit-aio-seo.md
[bkit-install] core: docs/templates/bkit-audit-analytics.md
[bkit-install] core: docs/templates/bkit-audit-annotations.md
[bkit-install] core: docs/templates/bkit-audit-app-performance.md
[bkit-install] core: docs/templates/bkit-audit-app-store.md
[bkit-install] core: docs/templates/bkit-audit-architecture.md
[bkit-install] core: docs/templates/bkit-audit-ci-performance.md
[bkit-install] core: docs/templates/bkit-audit-config.md
[bkit-install] core: docs/templates/bkit-audit-cost.md
[bkit-install] core: docs/templates/bkit-audit-coverage.md
[bkit-install] core: docs/templates/bkit-audit-database.md
[bkit-install] core: docs/templates/bkit-audit-dead-code.md
[bkit-install] core: docs/templates/bkit-audit-deferrals.md
[bkit-install] core: docs/templates/bkit-audit-dependencies.md
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
[bkit-install] core: docs/templates/bkit-audit-issues.md
[bkit-install] core: docs/templates/bkit-audit-llm.md
[bkit-install] core: docs/templates/bkit-audit-logs.md
[bkit-install] core: docs/templates/bkit-audit-models.md
[bkit-install] core: docs/templates/bkit-audit-privacy.md
[bkit-install] core: docs/templates/bkit-audit-prompts.md
[bkit-install] core: docs/templates/bkit-audit-red-team.md
[bkit-install] core: docs/templates/bkit-audit-reliability.md
[bkit-install] core: docs/templates/bkit-audit-repo.md
[bkit-install] core: docs/templates/bkit-audit-security.md
[bkit-install] core: docs/templates/bkit-audit-slop.md
[bkit-install] core: docs/templates/bkit-audit-testing.md
[bkit-install] core: docs/templates/bkit-audit-usability.md
[bkit-install] core: docs/templates/bkit-plan.md
[bkit-install] core: .gitignore
[bkit-install] core: .gitattributes
[bkit-install] core: docs/architecture.md
[bkit-install] core: docs/data-schema.md
[bkit-install] core: docs/deployments.md
[bkit-install] core: docs/design.md
[bkit-install] core: docs/noise.md
[bkit-install] core: docs/observability.md
[bkit-install] core: docs/security.md
[bkit-install] core: docs/setup.md
[bkit-install] core: docs/technology.md
[bkit-install] core: docs/testing.md
[bkit-install] Running bkit docs pass
[bkit-install] core: .bkit/authoring.md
[bkit-install] core: .bkit/cloud.md
[bkit-install] core: .bkit/cli.md
[bkit-install] core: .bkit/comparison.md
[bkit-install] core: .bkit/install.md
[bkit-install] core: .bkit/jsonl.md
[bkit-install] core: .bkit/LICENSE.md
[bkit-install] core: .bkit/pipeline.md
[bkit-install] core: .bkit/providers.md
[bkit-install] core: .bkit/prompts.md
[bkit-install] core: .bkit/router.md
[bkit-install] core: .bkit/templates.md
[bkit-install] core: .bkit/trackers.md
[bkit-install] core: .bkit/workflows.md
[bkit-install] core: .bkit/README.md
[bkit-install] Running template copies pass
[bkit-install] template added: .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
[bkit-install] template added: .bkit/templates/.cursor/Dockerfile
[bkit-install] template added: .bkit/templates/.cursor/environment.json
[bkit-install] template added: .bkit/templates/.cursor/settings.json
[bkit-install] template added: .bkit/templates/.envrc
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-bug.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-change.yml
[bkit-install] template added: .bkit/templates/.github/ISSUE_TEMPLATE/bkit-idea.yml
[bkit-install] template added: .bkit/templates/.github/dependabot.yml
[bkit-install] template added: .bkit/templates/.github/renovate.json5
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-ci.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-cloud.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-health.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-renovate.yml
[bkit-install] template added: .bkit/templates/.github/workflows/bkit-trivy.yml
[bkit-install] template added: .bkit/templates/.graphifyignore
[bkit-install] template added: .bkit/templates/.husky/pre-commit
[bkit-install] template added: .bkit/templates/.husky/pre-push
[bkit-install] template added: .bkit/templates/.lintstagedrc.json
[bkit-install] template added: .bkit/templates/.oxlintrc.json
[bkit-install] template added: .bkit/templates/.prettierignore
[bkit-install] template added: .bkit/templates/.serena/project.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Filler.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Hedging.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/LLMSlop.yml
[bkit-install] template added: .bkit/templates/.vale/styles/Bkit/Verbose.yml
[bkit-install] template added: .bkit/templates/.vale.ini
[bkit-install] template added: .bkit/templates/context/bkit-cloudrun.md
[bkit-install] template added: .bkit/templates/context/bkit-expo.md
[bkit-install] template added: .bkit/templates/context/bkit-github.md
[bkit-install] template added: .bkit/templates/context/bkit-inngest.md
[bkit-install] template added: .bkit/templates/context/bkit-maestro.md
[bkit-install] template added: .bkit/templates/context/bkit-playwright.md
[bkit-install] template added: .bkit/templates/context/bkit-resend.md
[bkit-install] template added: .bkit/templates/context/bkit-sentry.md
[bkit-install] template added: .bkit/templates/context/bkit-serena.md
[bkit-install] template added: .bkit/templates/context/bkit-stripe.md
[bkit-install] template added: .bkit/templates/context/bkit-supabase.md
[bkit-install] template added: .bkit/templates/context/bkit-tavily.md
[bkit-install] template added: .bkit/templates/context/bkit-vercel.md
[bkit-install] template added: .bkit/templates/docs/capabilities.md
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-advisories.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-accepted-divergences.json
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-capstone.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-check-dependency-audit.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-machine-lock.sh
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs
[bkit-install] template added: .bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.test.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.machine.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-disk-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/cleanup/bkit-tmp-prune.mjs
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-drift.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-eager.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-embed.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-external-rules.json
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-imports.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-pre-push.sh
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-repair.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graph-surface.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-graphml.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify-rollup.py
[bkit-install] template added: .bkit/templates/scripts/graphify/bkit-graphify.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd-env.sh
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.env.example
[bkit-install] template added: .bkit/templates/scripts/launchd/bkit-launchd.plist
[bkit-install] template added: .bkit/templates/scripts/prettier/bkit-insert-ignore.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.config.mjs
[bkit-install] template added: .bkit/templates/scripts/secrets/bkit-secrets.mjs
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena-mcp.sh
[bkit-install] template added: .bkit/templates/scripts/serena/bkit-serena.mcp.json
[bkit-install] template added: .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs
[bkit-install] template added: .bkit/templates/slop-scan.config.json
[bkit-install] payload link: .bkit/core
[bkit-install] payload link: .bkit/shared
[bkit-install] core: .bkit/allowlist.json
[bkit-install] core: package.json scripts added [bkit:gate:format, bkit:gate:min, bkit:gate:static, bkit:gate:static-unit, bkit:gate:install-static-unit-build, bkit:deps:outdated, bkit:deps:audit] — what a gate may run: .bkit/workflows.md § Local gate scripts
[bkit-install] core: added bkit.tracker, bkit.cloud, bkit.providers, bkit.testing, bkit.workflows, bkit.prompts, bkit.dependencies, bkit.advisories to package.json
[bkit-install] write: .claude/commands/bkit-auto.md
[bkit-install] write: .claude/commands/bkit-build.md
[bkit-install] write: .claude/commands/bkit-debug.md
[bkit-install] write: .claude/commands/bkit-design.md
[bkit-install] write: .claude/commands/bkit-plan.md
[bkit-install] write: .claude/commands/bkit-ship.md
[bkit-install] write: .claude/agents/bkit-audit-generate.md
[bkit-install] write: .claude/agents/bkit-build-challenge-1.md
[bkit-install] write: .claude/agents/bkit-build-challenge-2.md
[bkit-install] write: .claude/agents/bkit-build-install-skills.md
[bkit-install] write: .claude/agents/bkit-build-plan-convert.md
[bkit-install] write: .claude/agents/bkit-build-plan-current.md
[bkit-install] write: .claude/agents/bkit-build-plan-gaps-remediate.md
[bkit-install] write: .claude/agents/bkit-build-plan-tasks.md
[bkit-install] write: .claude/agents/bkit-build-plan-tests.md
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-3.md
[bkit-install] write: .claude/agents/bkit-design-generate.md
[bkit-install] write: .claude/agents/bkit-design-organise.md
[bkit-install] write: .claude/agents/bkit-design-review-1.md
[bkit-install] write: .claude/agents/bkit-design-review-2.md
[bkit-install] write: .claude/agents/bkit-design-spike.md
[bkit-install] write: .claude/agents/bkit-design-update.md
[bkit-install] write: .claude/agents/bkit-plan-generate.md
[bkit-install] write: .claude/agents/bkit-plan-review-1.md
[bkit-install] write: .claude/agents/bkit-plan-review-2.md
[bkit-install] write: .claude/agents/bkit-plan-scope-check.md
[bkit-install] write: .claude/agents/bkit-plan-update.md
[bkit-install] write: .claude/agents/bkit-ship-conflict-resolve.md
[bkit-install] write: .claude/agents/bkit-ship-deferred-sweep.md
[bkit-install] write: .claude/agents/bkit-ship-update-docs.md
[bkit-install] write: .claude/agents/bkit-utility-compress-markdown.md
[bkit-install] write: .claude/agents/bkit-utility-update-decisions.md
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
[bkit-install] write: .claude/agents/bkit-utility-update-tracker.md
[bkit-install] claude: CLAUDE.md
[bkit-install] claude: .claude/settings.json
[bkit-install] claude: .claude/hooks/bkit-preflight.sh
[bkit-install] claude: .claude/hooks/bkit-gateguard.cjs
[bkit-install] claude: .claude/hooks/bkit-readguard.cjs
[bkit-install] claude: .claude/hooks/bkit-guardrails.cjs
[bkit-install] claude: .mcp.json
[bkit-install] claude: .bkit/.env.example
[bkit-install] claude: .claude/bkit-cloud.md (generated — gitignored, holds resolved secrets)
[bkit-install] write version pin: .bkit/version (6.1.1)

 ❯ .bkit/core/engine/install/modules/cloud.integration.test.ts (11 tests | 4 failed) 175ms
   ❯ runCloudModule — opt-in cloud agents (post-CI auto-routing) (11)
     × claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables 3ms
     × opencode variant advisory names the configured provider's BKIT_ key 3ms
     × codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY 1ms
     × %s variant under %s names only that tracker's key 2ms
     ✓ cloud=cursor: writes no files and points the setup advisory at the .cursor templates 1ms
     ✓ an adopted bkit-cloud.yml, Dockerfile and environment.json stay byte-identical 1ms
     ✓ cloud=claude: persists bkit.cloud.agent = 'claude' to package.json 0ms
     ✓ cloud=opencode: persists bkit.cloud.agent = 'opencode' to package.json 0ms
     ✓ cloud=cursor: persists bkit.cloud.agent = 'cursor' to package.json 0ms
     ✓ dry-run: writes nothing to disk but still emits the setup advisory 0ms
     ✓ the default module set does NOT ship cloud scaffolding 162ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/modules/cloud.integration.test.ts > runCloudModule — opt-in cloud agents (post-CI auto-routing) > claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables
AssertionError: expected 'Full recipe in bkit\'s `cloud.md` § P…' to match /`BKIT_ANTHROPIC_API_KEY` repo secret/

- Expected:
/`BKIT_ANTHROPIC_API_KEY` repo secret/

+ Received:
"Full recipe in bkit's `cloud.md` § Post-CI auto-routing.

REQUIRED ONE-TIME SETUP:
  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.
  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App on your repo. This is required — `claude-code-action@v1` authenticates as the App via OIDC (`id-token: write`); without the App it fails at boot with an OIDC error.
  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
  - Give `claude-code-action@v1` ONE claude credential (Settings → Secrets and variables → Actions):
    - the `ANTHROPIC_API_KEY` repo secret (job env keeps this vendor name; local `.bkit/.env` stores it as `BKIT_ANTHROPIC_API_KEY`), or
    - keyless workload identity federation: Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule; then set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`). Leave `ANTHROPIC_API_KEY` unset — a set key wins over federation.
  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.

OPTIONAL (manual phase launch): after `/install-github-app`, comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to launch it from the tracker UI. The App's generated `claude.yml` triggers on mention events; `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch` — the two coexist.

Both the CI-driven path and the `@claude` mention path invoke the same `/bkit-auto` orchestrator (mirrored to `.claude/commands/bkit-auto.md` on each `pnpm bkit install`)."

 ❯ .bkit/core/engine/install/modules/cloud.integration.test.ts:84:30
     82|     expect(advisory).toBeDefined();
     83|     expect(advisory!.action).toContain(".bkit/templates/.github/workfl…
     84|     expect(advisory!.action).toMatch(/`BKIT_ANTHROPIC_API_KEY` repo se…
       |                              ^
     85|     expect(advisory!.action).toMatch(
     86|       /`ANTHROPIC_FEDERATION_RULE_ID` \+ `ANTHROPIC_ORGANIZATION_ID` r…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/install/modules/cloud.integration.test.ts > runCloudModule — opt-in cloud agents (post-CI auto-routing) > opencode variant advisory names the configured provider's BKIT_ key
AssertionError: expected 'Full recipe in bkit\'s `cloud.md` § P…' not to contain 'OPENCODE_PROVIDER_KEY'

- Expected
+ Received

- OPENCODE_PROVIDER_KEY
+ Full recipe in bkit's `cloud.md` § Post-CI auto-routing.
+
+ REQUIRED ONE-TIME SETUP:
+   - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.
+   - Install the local opencode host first: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode`). The cloud opencode job runs against the committed `.opencode/` config — provider and model pins come from there, not from this YAML.
+   - Add `OPENCODE_PROVIDER_KEY` to repo secrets (Settings → Secrets and variables → Actions). Set it to your configured provider's API key. The workflow fans this one secret out to every supported provider env var name (`BKIT_OPENROUTER_API_KEY`/`BKIT_OLLAMA_API_KEY`/`BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider you installed.
+   - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
+   - The opencode job does NOT use a Claude API key — it runs the opencode runner with your chosen provider key only. If you also install the claude job (separate secret), both jobs coexist on the same event.
+   - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.
+
+ REACTIVE HANDLER (separate, consumer self-installed): the stock `/oc` comment handler (`opencode github install`) is NOT managed by bkit — install it once per repo independently. It mirrors the `@claude`/`claude.yml` stance. `bkit-cloud.yml` handles the CI-driven + `workflow_dispatch` path only.

 ❯ .bkit/core/engine/install/modules/cloud.integration.test.ts:122:36
    120|       expect(advisory!.action).toContain(".bkit/templates/.github/work…
    121|       expect(advisory!.action).toContain(key);
    122|       expect(advisory!.action).not.toContain("OPENCODE_PROVIDER_KEY");
       |                                    ^
    123|       expect(advisory!.action).not.toContain("BKIT_ANTHROPIC_API_KEY");
    124|       const otherKeys = [...new Set(providerKeys.map(([, value]) => va…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/install/modules/cloud.integration.test.ts > runCloudModule — opt-in cloud agents (post-CI auto-routing) > codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY
AssertionError: expected 'Full recipe in bkit\'s `cloud.md` § P…' to contain '--codex'

- Expected
+ Received

- --codex
+ Full recipe in bkit's `cloud.md` § Post-CI auto-routing.
+
+ IN CURSOR DASHBOARD:
+   - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.
+   - Event: CI workflow completion. Branch filter: `feat/**`.
+   - Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`.
+   - Allowed concurrency: latest-supersedes.
+   - Set `BKIT_LINEAR_API_KEY` as a **Runtime Secret** in the Cloud Agents dashboard (https://cursor.com/dashboard/cloud-agents) → your environment → Secrets tab.
+   - Label the issue `bkit:auto` in Linear before pushing the build commit.
+
+ IN REPO (copy each template and own it; bkit never writes or overwrites these files, apart from brand migrations that rewrite exact shipped old names — see `.bkit/templates.md`):
+   - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps.
+   - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: set `install` / `start` / `terminals[]` / `env` for your stack.

 ❯ .bkit/core/engine/install/modules/cloud.integration.test.ts:138:30
    136|     const advisory = ctx.advisories.find((a) => a.id === "bkit-cloud-s…
    137|     expect(advisory).toBeDefined();
    138|     expect(advisory!.action).toContain("--codex");
       |                              ^
    139|     expect(advisory!.action).toContain(".codex/bkit-cloud.md");
    140|     expect(advisory!.action).toContain("BKIT_OPENAI_API_KEY");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/install/modules/cloud.integration.test.ts > runCloudModule — opt-in cloud agents (post-CI auto-routing) > %s variant under %s names only that tracker's key
AssertionError: claude/linear: expected 'Cloud agents (claude) need the unifie…' to contain 'BKIT_LINEAR_API_KEY'

- Expected
+ Received

- BKIT_LINEAR_API_KEY
+ Cloud agents (claude) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The Claude GitHub App is required for `claude-code-action@v1` to authenticate via OIDC.
+ Full recipe in bkit's `cloud.md` § Post-CI auto-routing.
+
+ REQUIRED ONE-TIME SETUP:
+   - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file after you copy it. The one exception is a brand migration: `bkit upgrade` rewrites exact shipped old names in it and leaves any edited line. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.
+   - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App on your repo. This is required — `claude-code-action@v1` authenticates as the App via OIDC (`id-token: write`); without the App it fails at boot with an OIDC error.
+   - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
+   - Give `claude-code-action@v1` ONE claude credential (Settings → Secrets and variables → Actions):
+     - the `ANTHROPIC_API_KEY` repo secret (job env keeps this vendor name; local `.bkit/.env` stores it as `BKIT_ANTHROPIC_API_KEY`), or
+     - keyless workload identity federation: Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule; then set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`). Leave `ANTHROPIC_API_KEY` unset — a set key wins over federation.
+   - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.
+
+ OPTIONAL (manual phase launch): after `/install-github-app`, comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to launch it from the tracker UI. The App's generated `claude.yml` triggers on mention events; `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch` — the two coexist.
+
+ Both the CI-driven path and the `@claude` mention path invoke the same `/bkit-auto` orchestrator (mirrored to `.claude/commands/bkit-auto.md` on each `pnpm bkit install`).
+ Cloud env config splits across the repo (`.claude/hooks/bkit-cloud-bootstrap.sh`, a copy-and-own template you adopt) and the Claude app dashboard (setup script + env vars + auth tokens, manual).
+ Two locations to touch — full recipe in bkit's `cloud.md`.
+
+ IN REPO (copy-and-own; bkit never writes it, apart from brand migrations that rewrite exact shipped old names):
+   - Adopt `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` as `.claude/hooks/bkit-cloud-bootstrap.sh` and edit it freely — the baseline runs `pnpm install` / `vale sync` and the gh login on each cloud session; add your own repo-specific steps (Supabase start, turbo prebuild, etc. — examples inlined). The `.claude/settings.json` SessionStart entry runs it only when present (`test -f … || true`).
+
+ IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):
+   - Name: the repo name (e.g. `acme-web`) — one environment per repo, since secrets are per-repo.
+   - Setup script: paste from bkit's `cloud.md` § Setup script (installs Node 24 + vale + gh + jq + corepack-pinned pnpm — exact versions live in cloud.md, not duplicated here).
+   - Environment variables: `BKIT_GH_TOKEN` (fine-grained for one owner, classic across owners — GitHub MCP).
+   - Tracker env vars (GitHub): `BKIT_GH_TOKEN` above is the only tracker credential — the GitHub MCP server sends it on every call, and the bootstrap hook signs `gh` in with it.
+   - Network access: `Trusted` (default). One environment per repo (secrets differ per repo); the setup script + variable *names* are identical across repos, only the values change. See cloud.md § Sharing across repos → Claude.

 ❯ .bkit/core/engine/install/modules/cloud.integration.test.ts:161:57
    159|         expect(ctx.advisories.length, `${cloudVariant}/${issueTracker}…
    160|         const text = ctx.advisories.map((a) => `${a.detect}\n${a.actio…
    161|         expect(text, `${cloudVariant}/${issueTracker}`).toContain(key);
       |                                                         ^
    162|         const otherKeys = trackerKeys.filter(([tracker]) => tracker !=…
    163|         for (const [, otherKey] of otherKeys) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 7 passed (11)
   Start at  18:31:48
   Duration  288ms (tests 73%, transform 13%, import 8%, setup 5%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jTaqDE/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/templates-content.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/templates-content.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/templates-content.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/templates-content.test.ts

[test-timeout-budget] load average 3.3 on 10 cores: unit limits 6150ms per test, 12300ms per hook (x1.23)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/templates/templates-content.test.ts (104 tests | 1 failed) 20ms
   ✓ consumer CI template (.bkit/templates/.github/workflows/bkit-ci.yml) (21)
     ✓ template file exists 1ms
     ✓ does NOT contain Configure private-repo auth step 0ms
     ✓ does NOT contain insteadOf git auth-shim 0ms
     ✓ install step no longer carries a BKIT_GH_TOKEN_INSTALL env block (public npm) 0ms
     ✓ install step runs a plain pnpm install --frozen-lockfile (no registry auth) 0ms
     ✓ still contains token placeholders {{DEFAULT_BRANCH}} and {{NODE_VERSION}} 0ms
     ✓ [verbose ci] NODE_OPTIONS knob (3)
       ✓ never writes NODE_OPTIONS to $GITHUB_ENV 0ms
       ✓ every job declaring VERBOSE_CI also declares a marker-gated job-level NODE_OPTIONS 0ms
       ✓ gates NODE_OPTIONS on the spelled-out contains() test, not env.VERBOSE_CI 0ms
     ✓ Check Default Branch Lags Dev step (promotion-lag warning) (5)
       ✓ ships the Check Default Branch Lags Dev step 0ms
       ✓ fires only on dev pushes (not PRs, not other branches) 0ms
       ✓ keys ONLY on consumed-from-default-branch surfaces (renovate config + workflows) 0ms
       ✓ is token-free (default branch read at runtime, so the step is identical per repo) 0ms
       ✓ is non-blocking — warns via ::warning:: and never exits non-zero 0ms
     ✓ ships the bkit-stub:coverage block commented, per-tier (unit + integration reports) 0ms
     ✓ ships the unit coverage report reading the floor file and running on every event 0ms
     ✓ ships the bkit-stub:e2e-coverage block commented (Playwright E2E coverage report) 0ms
     ✓ ships the reference lane-name stubs (web, device, reset, deploy, health) 0ms
     ✓ never inlines a PR title into a run: body (GitHub Actions script injection) 0ms
     ✓ parts of the workflow that guard something (2)
       ✓ the capstone runs on !cancelled(), never always() 0ms
       ✓ a pull request keys its run on its number and the default branch queues 0ms
   ✓ consumer renovate template (.bkit/templates/.github/renovate.json5) (26)
     ✓ template file exists 0ms
     ✓ targets the dev branch (required for bkit branch-protection convention) 0ms
     ✓ merges base-branch config so dev-side renovate.json5 edits take effect 0ms
     ✓ ships chore(deps): commit-message prefix to match conventional-commit history 0ms
     ✓ extends Renovate's config:best-practices baseline (digest pinning, abandonment flags, config migration) 0ms
     ✓ restores the 7-day npm release-age gate that config:best-practices lowers to 3 days 0ms
     ✓ rebases a Renovate PR only when it conflicts (no CI re-run on every base move) 0ms
     ✓ does not extend a renovate-local preset (the copy is the whole config) 0ms
     ✓ enables osvVulnerabilityAlerts (CVE-driven PRs bypass schedule) 0ms
     ✓ enables lockFileMaintenance 0ms
     ✓ ships the pnpm-11 OOM mitigation: worker-cap env + Renovate minimumReleaseAge (#308) 0ms
     ✓ does not fence bkit-renovate.yml (the consumer owns that runner) 0ms
     ✓ does not fence bkit-cloud.yml (a template the consumer owns, so its pins refresh) 0ms
     ✓ ignores the bkit-owned mirror trees so Renovate doesn't scan them (#132) 0ms
     ✓ keeps archived plans, test directories and fixtures out of the scan, and repeats the preset's defaults 0ms
     ✓ holds major bumps on the dependency dashboard until approved 0ms
     ✓ tracks off-manifest pins through one regex custom manager (Dockerfile, bkit-cloud.md, workflows) 0ms
     ✓ disables Renovate for the @cbartens/bkit package itself (#132) 0ms
     ✓ uses pinDigests for the github-actions manager (KN-3 SHA-pinning) 0ms
     ✓ collapses auto-mergeable non-major bumps into one shared group with automerge 0ms
     ✓ scopes multi-package ecosystem groups to majors only (non-majors fold into the unified group) 0ms
     ✓ renovate schedule covers the whole Monday 0ms
     ✓ renovate lockfile maintenance covers the whole first day of the month 0ms
     ✓ renovate groups custom.regex updates into one pinned-tools PR, pnpm into the non-major group 0ms
     ✓ references the JSON schema for editor validation 0ms
     ✓ no longer carries a GitHub Packages read-auth hostRules anchor 0ms
   ✓ self-hosted renovate workflow template (.bkit/templates/.github/workflows/bkit-renovate.yml) (#325) (12)
     ✓ template file exists 0ms
     ✓ runs renovatebot/github-action SHA-pinned (KN-CORE-5) on the configurable runner (#362) 0ms
     ✓ pins an exact Renovate release with a dated-lookup annotation the custom manager reads 0ms
     ✓ wires RENOVATE_GIT_AUTHOR from a repo variable (portable commit author for org repos) 0ms
     ✓ wakes on a schedule cron + workflow_dispatch (logLevel / dryRun inputs) 0ms
     ✓ serialises runs (concurrency group, no cancel-in-progress) 0ms
     ✓ authenticates with BKIT_GH_TOKEN, never the default GITHUB_TOKEN 0ms
     ✓ no longer injects private-registry auth (bkit is on the public npm registry) 0ms
     ✓ scopes to this repo only (no org-wide autodiscover) 0ms
     ✓ allow-lists the PNPM_* env so renovate.json5's env block is not rejected (allowedEnv) 0ms
     ✓ never INJECTS model/tracker secrets into the runner (security.md § token isolation) 0ms
     ✓ uses least-privilege job permissions (contents: read) 0ms
   ✓ trivy scan workflow template (.bkit/templates/.github/workflows/bkit-trivy.yml) (#547) (9)
     ✓ runs the trivy image pinned by tag and digest, never the hijackable actions 0ms
     ✓ never pins a release published by the March 2026 compromise (0.69.4 - 0.69.6) 0ms
     ✓ scans dev dependencies, or a dev-tooling lockfile reads as zero packages 0ms
     ✓ fails on HIGH and CRITICAL across lockfiles, config and secrets 0ms
     ✓ skips the bkit-owned templates tree 0ms
     ✓ leaves pnpm-lock.yaml to the dependency-audit gate once that gate is adopted 0ms
     ✓ reads .trivyignore.yaml only when the repo has one 0ms
     ✓ runs daily as well as on change, since advisories land without a code change 0ms
     ✓ uses a read-only token and reads no secret 0ms
   ✓ health check workflow template (.bkit/templates/.github/workflows/bkit-health.yml) (6)
     ✓ runs after every finished bkit-ci run on the default branch, whatever its conclusion 0ms
     ✓ probes only when production serves the CI run's commit 0ms
     ✓ fails, rather than skips, when it cannot read what production serves 0ms
     ✓ passes the CI run's commit through env:, never inlined into a run: body 0ms
     ✓ names every job with the bkit- prefix 0ms
     ✓ is the one health workflow the CI template points at 0ms
   ✓ example dependabot template (.bkit/templates/.github/dependabot.yml) (2)
     ✓ does not exclude bkit-cloud.yml (a template the consumer owns, so its pins refresh) 0ms
     ✓ holds new releases behind a 7-day cooldown 0ms
   ❯ .bkit/.env.example keys are BKIT_-prefixed (direnv isolation) (3)
     ✓ assigns BKIT_GH_TOKEN (and no retired install token), not GH_BKIT_* 0ms
     ✓ every assigned key starts with BKIT_ 0ms
     × vendor API keys are BKIT_-prefixed 2ms
   ✓ consumer .prettierignore template (.bkit/templates/.prettierignore) (7)
     ✓ template file exists 0ms
     ✓ carries no bkit:start / bkit:end block (bkit never writes a template) 0ms
     ✓ prettier ignores the committed run log run-tests-1.md: true 2ms
     ✓ prettier ignores the committed run log build-group-gate-1-1.md: true 0ms
     ✓ prettier ignores the committed run log build-subplan-gate-1-1.md: true 0ms
     ✓ prettier ignores the committed run log context-tests-local-1.md: true 0ms
     ✓ prettier ignores the committed run log build-plan-verify-1-1.md: true 0ms
   ✓ templates (4)
     ✓ every template that can carry a comment says it is an example bkit install does not write 3ms
     ✓ no template carries a bkit:start / bkit:end block (bkit never writes a template) 4ms
     ✓ keeps capability rules as a starter, not a product register 0ms
     ✓ generates capabilities.md and Mermaid from the wrapper 0ms
   ✓ launchd GUI-env templates (.bkit/templates/scripts/launchd/) (9)
     ✓ ships the loader, the LaunchAgent plist and the env example 0ms
     ✓ bkit-launchd-env.sh (5)
       ✓ is POSIX shell that fails on unset variables but not on one failing key 0ms
       ✓ reads the env file from the positional arg or BKIT_LAUNCHD_ENV 0ms
       ✓ checks key identifiers against [A-Za-z0-9_] 0ms
       ✓ skips without launchctl on PATH (Linux CI) 0ms
       ✓ hands the value to launchctl, but logs key names only 0ms
     ✓ bkit-launchd.plist (2)
       ✓ is a LaunchAgent that loads at login and re-runs on env-file writes 0ms
       ✓ keeps {{SCRIPT_PATH}} / {{ENV_FILE}} raw for the consumer to fill 0ms
     ✓ bkit-launchd.env.example (1)
       ✓ ships example BKIT_ token keys with empty values 0ms
   ✓ .bkit/templates.md gate tool scripts (consumers copy and run them) (5)
     ✓ lists bkit:slop:delta as the bkit ci slop verb 0ms
     ✓ lists the graphify scripts under bkit:graph names 0ms
     ✓ lists a lint value that runs Oxlint type-aware with the shipped config and fails on any hit 0ms
     ✓ ships the .oxlintrc.json the lint value names, with its five test rules at error 0ms
     ✓ lists every script the default gates chain, except test and build 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/templates-content.test.ts > .bkit/.env.example keys are BKIT_-prefixed (direnv isolation) > vendor API keys are BKIT_-prefixed
AssertionError: expected [ 'BKIT_GH_TOKEN', …(8) ] to include 'BKIT_OPENAI_API_KEY'
 ❯ .bkit/core/engine/audits/templates/templates-content.test.ts:663:24
    661|       "BKIT_TAVILY_API_KEY",
    662|     ]) {
    663|       expect(assigned).toContain(key);
       |                        ^
    664|     }
    665|     expect(assigned).not.toContain("LINEAR_API_KEY");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 103 passed (104)
   Start at  18:31:49
   Duration  133ms (import 49%, tests 26%, setup 16%, transform 7%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Rduc60/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/install/install.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/install.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/install.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/install.test.ts

[test-timeout-budget] load average 3.3 on 10 cores: unit limits 6150ms per test, 12300ms per hook (x1.23)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/commands/install/install.test.ts (23 tests | 4 failed) 16ms
   ✓ discardAllStaging (1)
     ✓ removes the entire STAGING_ROOT 1ms
   ✓ B5 — LOG_PREFIX on blocker banner (source-level verification) (1)
     ✓ commands/install/install.ts emits LOG_PREFIX before the blocker banner on preflight exit 0ms
   ✓ modulesToCliFlags — resolved module set → recovery-hint CLI flags (5)
     ✓ emits nothing for a core-only set (core is implicit) 0ms
     ✓ maps host modules to their flags 0ms
     ✓ renders --opencode with the resolved provider, or a placeholder when unknown 0ms
     ✓ maps the cloud opt-in (placeholder when the variant is unknown) 0ms
     ✓ composes multiple modules in flag order 0ms
   ❯ validateCloudTrackerWired — every cloud variant needs a wired tracker (4)
     × passes when no cloud variant is set 1ms
     × passes when the cloud module isn't in the install set, even with a variant 0ms
     × validateCloudTrackerWired passes %s with %s 0ms
     × validateCloudTrackerWired refuses tracker none naming --tracker= 0ms
   ✓ detectOpencodeProvider — provider resolution (manifest-first) (7)
     ✓ returns null when neither package.json nor opencode.json exists 0ms
     ✓ reads a valid bkit.providers.opencode.default from package.json 0ms
     ✓ rejects a provider key outside the allowlist (zen is not opencode-zen) 0ms
     ✓ maps Zen's opencode.json block key `opencode` to opencode-zen 1ms
     ✓ ignores an out-of-allowlist provider and falls through to null 0ms
     ✓ falls back to the first opencode.json provider key when the manifest is silent 0ms
     ✓ returns null on an unparseable package.json with no opencode.json 0ms
   ✓ detectOpencodeProviders — all installed providers (3)
     ✓ returns [] when package.json is absent 0ms
     ✓ reads and allowlist-filters bkit.providers.opencode.installed 0ms
     ✓ returns [] when bkit.providers.opencode.installed is absent, whatever bkit.providers.opencode.default says 0ms
   ✓ refreshPreflightAfterWrites — post-write preflight re-check (2)
     ✓ returns a blocker that only appears after the writes 6ms
     ✓ keeps module advisories pushed during dispatch and replaces the Phase 1 seeds 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/install.test.ts > validateCloudTrackerWired — every cloud variant needs a wired tracker > passes when no cloud variant is set
TypeError: validateCloudTrackerWired is not a function
 ❯ .bkit/core/engine/commands/install/install.test.ts:92:12
     90| describe("validateCloudTrackerWired — every cloud variant needs a wire…
     91|   it("passes when no cloud variant is set", () => {
     92|     expect(validateCloudTrackerWired(null, true, "github")).toBeNull();
       |            ^
     93|   });
     94|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.test.ts > validateCloudTrackerWired — every cloud variant needs a wired tracker > passes when the cloud module isn't in the install set, even with a variant
TypeError: validateCloudTrackerWired is not a function
 ❯ .bkit/core/engine/commands/install/install.test.ts:96:12
     94|
     95|   it("passes when the cloud module isn't in the install set, even with…
     96|     expect(validateCloudTrackerWired("claude", false, "linear")).toBeN…
       |            ^
     97|   });
     98|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.test.ts > validateCloudTrackerWired — every cloud variant needs a wired tracker > validateCloudTrackerWired passes %s with %s
TypeError: validateCloudTrackerWired is not a function
 ❯ .bkit/core/engine/commands/install/install.test.ts:102:16
    100|     for (const cloud of ["claude", "cursor", "opencode", "codex"] as c…
    101|       for (const tracker of ["github", "linear", "jira"] as const) {
    102|         expect(validateCloudTrackerWired(cloud, true, tracker), `${clo…
       |                ^
    103|       }
    104|     }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.test.ts > validateCloudTrackerWired — every cloud variant needs a wired tracker > validateCloudTrackerWired refuses tracker none naming --tracker=
TypeError: validateCloudTrackerWired is not a function
 ❯ .bkit/core/engine/commands/install/install.test.ts:109:19
    107|   it("validateCloudTrackerWired refuses tracker none naming --tracker=…
    108|     for (const cloud of ["claude", "cursor", "opencode", "codex"] as c…
    109|       const err = validateCloudTrackerWired(cloud, true, "none");
       |                   ^
    110|       expect(err).not.toBeNull();
    111|       expect(err).toContain(`--auto=${cloud}`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 19 passed (23)
   Start at  18:31:50
   Duration  154ms (import 38%, transform 30%, tests 17%, setup 13%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8JdFmz/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/install.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/install.integration.test.ts

[test-timeout-budget] load average 3.3 on 10 cores: unit limits 6150ms per test, 12300ms per hook (x1.23)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts (62 tests | 4 failed) 78165ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ runPreflight returns no-package-json blocker when package.json is absent 4ms
     ✓ formatChecklist renders the blocker banner with [blocker] marker 3ms
     ✓ formatChecklist banner contains Detect and Action sections 3ms
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 164ms
   ✓ Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered (6)
     ✓ runPreflight returns advisory findings for seeded conditions 4ms
     ✓ formatChecklist renders a numbered checklist for multiple advisories 3ms
     ✓ formatChecklist includes the instructions header for AI agents 3ms
     ✓ runPostInstallCheck adds gh-mcp-token-unset-shell when BKIT_GH_TOKEN is unset 63ms
     ✓ full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner 54ms
     ✓ no duplicate ids in the final checklist 54ms
   ✓ Scenario 3 — bkit check: Phase 3 detectors run for parity with install (4)
     ✓ runPostInstallCheck includes Phase 3 detector findings (gh-mcp-token-unset-shell when BKIT_GH_TOKEN unset) 57ms
     ✓ formatChecklist renders Phase 1 advisories 3ms
     ✓ formatChecklist([]) returns empty string — no banner emitted on zero advisories 1ms
     ✓ blockers fire from preflight (Phase 1 remains active in bkit check) 3ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 437ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 1482ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 800ms
   ✓ Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9) (2)
     ✓ runPostInstallCheck surfaces a blocker-severity finding for a stale managed-version marker 50ms
     ✓ Phase 3 blocker findings are distinguished from advisories (severity=blocker) 49ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 342ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 338ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 398ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 807ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 1062ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 1147ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 423ms
   ❯ cloud variants — wired trackers and host prerequisites (5)
     × --auto=codex without .codex/ exits 1 naming --codex and writes nothing 137ms
     × --tracker=jira --codex --auto=codex exits 0 and records codex 137ms
     × --tracker=github --auto=cursor exits 0 and records cursor 147ms
     × --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 146ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 269ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 134ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 134ms
     ✓ explicit `bkit help` prints the same usage and exits 0 136ms
     ✓ `bkit check --claude` (stray module flag) errors 133ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 134ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 337ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 347ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 134ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 352ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 666ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 2234ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 2535ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 2557ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 2507ms
   ✓ detectOpencodeProviders — multi-provider tracking (issue #281 Task 2) (4)
     ✓ reads opencodeProviders array from package.json 1ms
     ✓ returns [] when no bkit opencode fields present 0ms
     ✓ filters invalid providers from the array 0ms
     ✓ returns [] when package.json does not exist 0ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 971ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 2034ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (3)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 3423ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 4901ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 5957ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 8040ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 9325ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 9391ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 5398ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 1740ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 1856ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 1958ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 2239ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > cloud variants — wired trackers and host prerequisites > --auto=codex without .codex/ exits 1 naming --codex and writes nothing
AssertionError: expected '\n[bkit] Unknown cloud variant: "code…' to contain '--codex'

- Expected
+ Received

- --codex
+
+ [bkit] Unknown cloud variant: "codex". Valid values: claude, cursor, opencode
+

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:870:36
    868|     const result = runCloudInstall(["--tracker=github", "--auto=codex"…
    869|     expect(result.status, combinedOutput(result)).toBe(1);
    870|     expect(combinedOutput(result)).toContain("--codex");
       |                                    ^
    871|     expect(combinedOutput(result)).not.toContain("Unknown cloud varian…
    872|     expect(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8")…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > cloud variants — wired trackers and host prerequisites > --tracker=jira --codex --auto=codex exits 0 and records codex
AssertionError: 
[bkit] Unknown cloud variant: "codex". Valid values: claude, cursor, opencode
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:879:51
    877|     seedConsumer();
    878|     const result = runCloudInstall(["--tracker=jira", "--codex", "--au…
    879|     expect(result.status, combinedOutput(result)).toBe(0);
       |                                                   ^
    880|     const facts = installedFacts();
    881|     expect(facts.bkit?.tracker?.default).toBe("jira");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > cloud variants — wired trackers and host prerequisites > --tracker=github --auto=cursor exits 0 and records cursor
AssertionError: 
[bkit] --auto=cursor requires tracker=linear, but the resolved tracker is "github". Re-run with the matching tracker: bkit install --tracker=linear --auto=cursor (tracker switching is free).
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:889:51
    887|     seedConsumer();
    888|     const result = runCloudInstall(["--tracker=github", "--auto=cursor…
    889|     expect(result.status, combinedOutput(result)).toBe(0);
       |                                                   ^
    890|     const facts = installedFacts();
    891|     expect(facts.bkit?.tracker?.default).toBe("github");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > cloud variants — wired trackers and host prerequisites > --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode
AssertionError: 
[bkit] --auto=opencode requires the local opencode host to be installed first.
Run: bkit install --opencode=<provider>  (e.g. --opencode=opencode-zen)
The cloud opencode job runs against the committed .opencode/ config — without it there is nothing to run.
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:902:51
    900|       "--auto=opencode",
    901|     ]);
    902|     expect(result.status, combinedOutput(result)).toBe(0);
       |                                                   ^
    903|     const facts = installedFacts();
    904|     expect(facts.bkit?.tracker?.default).toBe("github");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 58 passed (62)
   Start at  18:31:51
   Duration  78.30s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4LOsVl/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
