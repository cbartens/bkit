# Migrations

> [!CAUTION]
> **Purpose:** Register of every upgrade migration in the engine — code that rewrites a consumer file left by an older bkit release so `bkit upgrade` alone brings it current.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - One row per migration. Add the row in the same change that adds the code; delete the row in the same change that deletes the code.
> - A migration is idempotent, runs inside the normal install / upgrade write path (dry-run computes the same writeset), and has a test seeding the old shape.
> - Name the release range it covers, so a later sweep can retire it once no supported install predates it.
> - Detect-only checks that tell the human to fix something by hand are not migrations — they live under § Detect-only guards.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.

## Migrations

<!-- prettier-ignore -->
| Migration | Where | What it rewrites | Releases | Test |
| --- | --- | --- | --- | --- |
| Retired Antigravity hook drivers | `.bkit/core/engine/install/write.ts` (`RETIRED_DRIVER_HASHES`, `writeTier2`) | `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` / `bkit-guardrails.cjs` whose driver (text outside `// bkit:start` / `// bkit:end`) is byte-identical to 5.1.0's Claude-shaped `hookSpecificOutput` driver → whole file replaced with the current template (`{ decision, reason }` driver). An edited driver is kept; install / upgrade prints the fix. | 5.1.0 | `.bkit/core/engine/install/write.test.ts` (fixtures `tests/fixtures/antigravity-5.1.0/`) |
| Lite workflows moved to `.bkit/lite.md` | `.bkit/core/engine/install/modules/core.ts` (`migrateShortcutsToLite`, called by `runBkitDocs`); `.bkit/core/engine/commands/install/uninstall.ts` (`CORE_TEMPLATE_DOCTRINE`) | `.agents/shortcuts.md` → consumer lines below `<!-- bkit:end -->` (minus the seeded `## Project Shortcuts` heading) appended to `.bkit/lite.md`; old file deleted. No single managed block → left in place; install / upgrade prints the fix. Uninstall strips the old file like any managed doc. | 5.1.0 – 5.2.4 | `.bkit/core/engine/install/modules/core.integration.test.ts` (fixture `tests/fixtures/shortcuts-5.2.4/`) |
| Network allowlist moved to `.bkit/allowlist.json` | `.bkit/core/engine/install/network-allowlist.ts` (`writeNetworkAllowlist`, called by `runCoreModule` and `renderManagedOutputs`) | `.cursor/allowlist.json` whose path `.bkit/version` `canonicalHashes` records → deleted (bkit owned it whole; `.bkit/allowlist.json` replaces it); the hash prunes on the same run. An unrecorded file is left alone. | up to 5.2.4 | `.bkit/core/engine/install/network-allowlist.test.ts`; `.bkit/core/engine/install/modules/index.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
| Retired dev lock deleted | `.bkit/core/engine/install/modules/core.ts` (`migrateRetiredDevLock`, called by `runBkitDocs`) | `.bkit/.dev.lock` (a file; the repo-wide dev lock nothing reads any more) → deleted. A directory at that path is left alone. | up to 5.3.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| Linear team key moved to `bkit.linear.team` | `.bkit/core/engine/install/modules/core.ts` (`migrateLinearTeamKey`, called by `seedCorePackageJsonScripts`) | `package.json` `bkit.linearTeam` → `bkit.linear.team`, beside `project` / `progress` / `review`; old key deleted. An existing `bkit.linear.team` wins; a blank old value is dropped. Original indent kept. | up to 5.4.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |
| GitHub board key moved to `bkit.github.project` | `.bkit/core/engine/install/modules/core.ts` (`migrateGithubProjectKey`, called by `seedCorePackageJsonScripts`) | `package.json` `bkit.githubProject` → `bkit.github`: `false` → `project: false`; `{ owner, number, … }` → `project: "https://github.com/orgs/<owner>/projects/<number>"` (the old shape reached org boards only). Template option ids (`47fc9ee4`, `df73e18b`) match the `In progress` / `In review` defaults and write nothing; any other `progressOptionId` / `reviewOptionId` keeps the default and logs a line to set `bkit.github.progress` / `review` by name. Old key deleted. An existing `bkit.github.project` wins; a malformed old value is dropped. Original indent kept. | up to 5.5.x | `.bkit/core/engine/install/modules/core.integration.test.ts` |

## Detect-only guards

<!-- prettier-ignore -->
| Guard | Where | What it detects | Human fix |
| --- | --- | --- | --- |
| Unmarked older copy (install) | `.bkit/core/engine/install/write.ts` (`findUnmarkedCopy`) | A managed `.md` with no `bkit:start` / `bkit:end` markers that already holds an older bkit copy — install skips it instead of appending a duplicate. | Delete the file, re-run install, re-add own lines below `<!-- bkit:end -->`. |
| `test-file-script-missing` advisory | `.bkit/core/engine/install/modules/core.ts` (`detectGateAdvisories`) | `package.json` without `bkit:test:file`: `/bkit-build` reports test-first as not enforced. Plans predating `**Test first:**` lines get the same report from `bkit tests green`. | Declare `bkit:test:file` (runs one test file, writes JUnit to `$BKIT_TEST_REPORT`); new plans carry `Test first` lines. |
| `bkit-managed-duplicate` advisory | `.bkit/core/engine/checks/after/managed.ts` | An older bkit copy outside a managed file's `bkit:start` / `bkit:end` block. | Delete the stale copy; move own lines below `<!-- bkit:end -->`. |
