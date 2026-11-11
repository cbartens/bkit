Enforced: true
Red: 9
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/install/install.integration.test.ts` "ships ten optional document starters on fresh install" | red | failure: .bkit/templates/docs/architecture.md: expected false to be true // Object.is equality |
| 1 | `.bkit/core/engine/commands/install/install.integration.test.ts` "preserves the contents of a legacy managed document when reinstalling" | red | failure: expected '<!-- bkit:start -->\n\n<!-- bkit:mana…' to be '# Security\n\nOur own threat model, e…' // Object.is equality |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "migrates legacy ownership without changing project text or core ownership" | red | failure: expected 'Intro the team wrote above the block\…' to be 'Intro the team wrote above the block\…' // Object.is equality |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "preserves ambiguous legacy markers and reports cleanup without blocking check" | red | failure: expected true to be false // Object.is equality |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "previews project document migration without mutating the checkout" | vacuous | "previews project document migration without mutating the checkout" passes at its red, so it proves nothing |
| 1 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "preserves project document copies on full uninstall" | red | failure: ENOENT: no such file or directory, copyfile '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-uninstall-864-yegJax/.bkit/templates/docs/design.md' -> '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-uninstall-864-yegJax/docs/design.md' |
| 2 | `.bkit/core/engine/commands/install/install.integration.test.ts` "registers an adopted starter without duplicating project rows" | red | failure: ENOENT: no such file or directory, copyfile '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-install-integ-QM9Hkg/.bkit/templates/docs/design.md' -> '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-install-integ-QM9Hkg/docs/design.md' |
| 2 | `.bkit/core/engine/commands/install/install.integration.test.ts` "preserves indexed equivalents and warns about unsafe registration paths" | red | failure: EEXIST: file already exists, symlink '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-outside-sU1Bwt/secret.md' -> '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-install-integ-o677mB/docs/security.md' |
| 2 | `.bkit/core/engine/audits/templates/templates.test.ts` "resolves documentation references against the correct ownership sources" | red | failure: expected [ 'architecture', 'technology', …(8) ] to deeply equal [] |
| 2 | `.bkit/core/engine/audits/templates/template-path-refs.test.ts` "allows qualified project document reads and rejects mandatory template dependencies" | red | failure: expected [ …(17) ] to deeply equal [] |

## Gaps

- TASK 1 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "previews project document migration without mutating the checkout" `vacuous` — "previews project document migration without mutating the checkout" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/install.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/install.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/install.integration.test.ts

[test-timeout-budget] load average 36.9 on 10 cores: unit limits 22950ms per test, 45900ms per hook (x4.59)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts (66 tests | 4 failed) 463966ms
   ✓ Scenario 1 — blocker: no package.json → exit 1, zero writes (4)
     ✓ runPreflight returns no-package-json blocker when package.json is absent 15ms
     ✓ formatChecklist renders the blocker banner with [blocker] marker 10ms
     ✓ formatChecklist banner contains Detect and Action sections 7ms
     ✓ spawning bkit-install with no package.json exits 1 and produces zero output files 1529ms
   ✓ Scenario 2 — advisory checklist: N triggers → exit 0, checklist rendered (6)
     ✓ runPreflight returns advisory findings for seeded conditions 9ms
     ✓ formatChecklist renders a numbered checklist for multiple advisories 7ms
     ✓ formatChecklist includes the instructions header for AI agents 7ms
     ✓ runPostInstallCheck adds gh-mcp-token-unset-shell when BKIT_GH_TOKEN is unset 184ms
     ✓ full pipeline: combined Phase 1 + Phase 3 findings all appear in final banner 132ms
     ✓ no duplicate ids in the final checklist 148ms
   ✓ Scenario 3 — bkit check: Phase 3 detectors run for parity with install (4)
     ✓ runPostInstallCheck includes Phase 3 detector findings (gh-mcp-token-unset-shell when BKIT_GH_TOKEN unset) 179ms
     ✓ formatChecklist renders Phase 1 advisories 7ms
     ✓ formatChecklist([]) returns empty string — no banner emitted on zero advisories 2ms
     ✓ blockers fire from preflight (Phase 1 remains active in bkit check) 12ms
   ✓ Scenario 5 — full install smoke against scratch consumer (1)
     ✓ bkit install --full against a clean consumer exits 0 and writes core mirrors 4006ms
   ✓ #507 — full install writes core/ and shared/, never a template or a stray LICENSE.md (1)
     ✓ every payload file lands, no template does, and .bkit/LICENSE.md is the only LICENSE.md 13005ms
   ✓ Scenario 5b — docs/roadmap.md is consumer-owned: bkit install never creates it (#380 matrix row 18) (1)
     ✓ `bkit install --full` against a clean consumer does NOT create docs/roadmap.md, and `bkit check` reports clean drift 2704ms
   ✓ Scenario 6 — Phase 3 blocker exit-1 + recovery line (P2.T9) (2)
     ✓ runPostInstallCheck surfaces a blocker-severity finding for a stale managed-version marker 130ms
     ✓ Phase 3 blocker findings are distinguished from advisories (severity=blocker) 113ms
   ✓ Scenario 7 — bkit install subprocess exits 1 on Phase 3 blocker (P2.T9) (1)
     ✓ bkit install exits 1 when Phase 3 blocker detected + recovery line in output 778ms
   ✓ Scenario 8 — bkit install --auto-revert reverts on Phase 3 blocker (P2.T10) (1)
     ✓ --auto-revert: exits 1, auto-revert message present, Tier-1 writes reverted 772ms
   ✓ MCP config — fresh install and a consumer's own file (5)
     ✓ fresh install via bkit install --full (no --tracker) scaffolds .mcp.json with empty mcpServers 983ms
     ✓ bkit install --tracker=github seeds .mcp.json with only that tracker's entry 2061ms
     ✓ bkit install --tracker=linear seeds .mcp.json with only that tracker's entry 2183ms
     ✓ bkit install --tracker=jira seeds .mcp.json with only that tracker's entry 3233ms
     ✓ re-install with no tracker (bkit owns no entry) leaves a consumer .mcp.json byte-for-byte unchanged 1090ms
   ✓ cloud variants — wired trackers and host prerequisites (5)
     ✓ --auto=codex without .codex/ exits 1 naming --codex and writes nothing 420ms
     ✓ --tracker=jira --codex --auto=codex exits 0 and records codex 1942ms
     ✓ --tracker=github --auto=cursor exits 0 and records cursor 790ms
     ✓ --tracker=github --opencode --auto=opencode in one run exits 0 and records opencode 1632ms
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 769ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 346ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 430ms
     ✓ explicit `bkit help` prints the same usage and exits 0 403ms
     ✓ `bkit check --claude` (stray module flag) errors 395ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 395ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 2912ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 2454ms
     ✓ `bkit install --ci` is an unknown flag and writes nothing (#489) 1121ms
     ✓ `bkit install --claude` writes no bkit-ci.yml, .vale.ini or hooks (templates); no .cursor 2252ms
     ✓ `bkit check` after a --cursor-only install reports no drift (no false .claude drift) 4683ms
     ✓ `bkit install --tracker=github` alone switches the tracker on every installed host 10741ms
     ✓ `bkit install --tracker=linear` alone switches the tracker on every installed host 21258ms
     ✓ `bkit install --tracker=jira` alone switches the tracker on every installed host 13077ms
     ✓ `bkit install --claude --tracker=github` also re-renders the installed cursor host 19999ms
   ✓ detectOpencodeProviders — multi-provider tracking (issue #281 Task 2) (4)
     ✓ reads opencodeProviders array from package.json 3ms
     ✓ returns [] when no bkit opencode fields present 1ms
     ✓ filters invalid providers from the array 2ms
     ✓ returns [] when package.json does not exist 1ms
   ✓ opencodeProviders persist block — sequential installs (issue #281 Task 2) (1)
     ✓ two sequential installs: opencodeProviders = both, opencodeProvider = second 5527ms
   ✓ T10 — claudeAllowDerived survives a real install (1)
     ✓ records the resolved grant set, then updates it when allowed-domains shrinks 5525ms
   ✓ Scenario — Codex + Antigravity install side by side without conflict (#534) (3)
     ✓ combined `--codex --antigravity`: skills at separate paths, check green, advisory fires 5676ms
     ✓ separate `--antigravity` then `--codex`: both land at their own paths, check green 13451ms
     ✓ separate `--codex` then `--antigravity`: both land at their own paths, check green 12175ms
   ✓ Scenario — tracker switch and active opencode provider removal leave check green (7)
     ✓ --tracker=linear then --tracker=github removes the first MCP entry everywhere 21356ms
     ✓ --tracker=jira then --tracker=github removes the first MCP entry everywhere 19810ms
     ✓ --tracker=linear then --tracker=jira removes the first MCP entry everywhere 54087ms
     ✓ --tracker=jira then --tracker=linear removes the first MCP entry everywhere 97107ms
     ✓ a linear entry the consumer edited survives the switch, with a warning 28201ms
     ✓ a jira entry the consumer edited survives the switch, with a warning 25836ms
     ✓ uninstall --opencode=<active> re-renders the agents to the remaining provider 19689ms
   ✓ 5.x package.json layout — the tracker survives the first re-render (1)
     ✓ bkit install on the flat bkit.issueTracker layout renders the tracker and check passes 22144ms
   ❯ #864 — project document starters and their index (4)
     × ships ten optional document starters on fresh install 3803ms
     × preserves the contents of a legacy managed document when reinstalling 6635ms
     × registers an adopted starter without duplicating project rows 1785ms
     × preserves indexed equivalents and warns about unsafe registration paths 1820ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > #864 — project document starters and their index > ships ten optional document starters on fresh install
AssertionError: .bkit/templates/docs/architecture.md: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:1572:66
    1570|     for (const topic of TOPICS) {
    1571|       const starter = path.join(".bkit", "templates", "docs", `${topic…
    1572|       expect(fs.existsSync(path.join(tmpDir, starter)), starter).toBe(…
       |                                                                  ^
    1573|       const text = read(starter);
    1574|       expect(text, starter).not.toContain("bkit:managed");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > #864 — project document starters and their index > preserves the contents of a legacy managed document when reinstalling
AssertionError: expected '<!-- bkit:start -->\n\n<!-- bkit:mana…' to be '# Security\n\nOur own threat model, e…' // Object.is equality

- Expected
+ Received

- # Security
-
- Our own threat model, edited by the team.
+ <!-- bkit:start -->
+
+ <!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->
+
+ # Security
+
+ > [!CAUTION]
+ > **Purpose:** The project's authentication, authorization, input validation, rate limiting, secrets management and PII handling.
+ >
+ > **Rules:**
+ >
+ > - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
+ > - Auth standards live only here. Other docs link to this file and do not restate them.
+
+ ## Supply-Chain (GitHub Actions)
+
+ Action SHA-pinning and the dependency-update pipeline (Renovate / Dependabot, Trivy scan, CVE handling) are described in `deployments.md` § Dependency updaters. This section holds the security invariants only.
+
+ **Token isolation:**
+
+ - Renovate PRs get a restricted `GITHUB_TOKEN`.
+ - They have no access to the cloud lane's model-auth secrets (`secrets.BKIT_ANTHROPIC_API_KEY` / the provider `BKIT_` keys / `secrets.BKIT_OPENAI_API_KEY`).
+ - They have no access to federated Claude tokens either. Only a `bkit-cloud.yml` job that matches the federation rule mints those.
+ - `bkit-cloud.yml` does not dispatch on Renovate PRs.
+ - As a result, a compromised dependency PR cannot reach agent API credentials.
+
+ **Scanner isolation:** The CI vulnerability scanner (e.g. `bkit-trivy.yml`) runs with `contents: read`, `persist-credentials: false` and no secret. Its image or action is pinned by digest, never by a floating tag. Setup is in `.bkit/templates.md` § Trivy.
+
+ ## Untrusted Content & Prompt Injection
+
+ **Threat model.** Every phase workflow combines three things:
+
+ - it ingests attacker-controlled text (commit messages, PR bodies, diffs, CI and runtime logs, web results, installed skill bodies)
+ - it holds a broad write token
+ - it can act (commit, push, merge, write files)
+
+ When all three are present, an embedded directive executes.
+
+ **Contract.** Follow `.agents/rules.md` § Security & Data, **External input** and **External skills**. Skill selection and permitted use are defined in `.agents/skills.md` § Activation Rules.
+
+ **Three layers, nearest the payload first:**
+
+ - **Fenced at the write.** A workflow that writes fetched external evidence to disk wraps it as it lands, in this order: instruction lines, `===== BEGIN UNTRUSTED =====`, the payload, `===== END UNTRUSTED =====`.
+   - The instruction comes before the payload, and nothing comes after the closer.
+   - The payload is wrapped once.
+   - First-party breadcrumbs are not fenced.
+   - Tracker bodies are not fenced, because they are the task specification. The header contract governs them.
+ - **Named on the spawn.** A subagent whose `Read:` list includes fenced artifacts is told so on its `Context:` line. That line is its last trusted instruction before it reads them.
+ - **Standing header contract.** Every agent prompt and workflow header carries both rules. They cover tool results (web search / fetch) that never become files, and skill bodies loaded by name.
+
+ **Per-file coverage is load-bearing.** Subagents spawn self-contained and never read `.agents/rules.md`. A rule placed only there reaches the orchestrating workflows but no leaf. The three registers exist by design. They are not redundant copies to collapse.
+
+ **No runtime telemetry.** "Flag injection attempts" produces no metric, log-grep or alert. Detection is a human reviewing the agent's output.
+
+ **Prose is defence-in-depth.** Prose is the layer an injection is designed to defeat. The load-bearing control is structural:
+
+ - give each job the narrowest-scoped token
+ - scan any text that reaches a privileged action (merge body, commit message)
+
+ Prose never substitutes for token scope.
+
+ <!-- bkit:end -->


 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:1600:19
    1598|
    1599|     const after = read("docs/security.md");
    1600|     expect(after).toBe(body);
       |                   ^
    1601|     expect(after).not.toContain("bkit:managed");
    1602|     expect(rowsFor("docs/security.md")).toHaveLength(1);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > #864 — project document starters and their index > registers an adopted starter without duplicating project rows
Error: ENOENT: no such file or directory, copyfile '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-install-integ-QM9Hkg/.bkit/templates/docs/design.md' -> '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-install-integ-QM9Hkg/docs/design.md'
 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:1610:8
    1608|     installOk();
    1609|     fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
    1610|     fs.copyFileSync(
       |        ^
    1611|       path.join(tmpDir, ".bkit", "templates", "docs", "design.md"),
    1612|       path.join(tmpDir, "docs", "design.md"),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/commands/install/install.integration.test.ts > #864 — project document starters and their index > preserves indexed equivalents and warns about unsafe registration paths
Error: EEXIST: file already exists, symlink '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-outside-sU1Bwt/secret.md' -> '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-install-integ-o677mB/docs/security.md'
 ❯ .bkit/core/engine/commands/install/install.integration.test.ts:1643:10
    1641|       const outsideFile = path.join(outside, "secret.md");
    1642|       fs.writeFileSync(outsideFile, "# outside\n", "utf-8");
    1643|       fs.symlinkSync(outsideFile, path.join(tmpDir, "docs", "security.…
       |          ^
    1644|
    1645|       const again = run("install", "--claude", "--cursor");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 62 passed (66)
   Start at  18:32:39
   Duration  465.09s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-uIumPC/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/upgrade.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/upgrade.integration.test.ts`

````

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/upgrade.integration.test.ts

[test-timeout-budget] load average 45.3 on 10 cores: unit limits 27150ms per test, 54300ms per hook (x5.43)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

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

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (67 tests | 2 failed) 347118ms
   ✓ upgrade integration: consumer customizations (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 11ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 3ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 3ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 6ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 650ms
     ✓ install --claude does not write Serena or graphify examples 1099ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 552ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 493ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 518ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 15292ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 18110ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 22430ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 14187ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 6248ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 17670ms
     ✓ malformed .mcp.json fails install instead of being overwritten 3156ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 31841ms
     ✓ an adopted copy of every template survives upgrade and check 8202ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 3678ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 2890ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 8164ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 50847ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 4638ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 5538ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 18128ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 5404ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 4501ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 5363ms
     ✓ branded script migration is idempotent and dry-run writes nothing 6329ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 4005ms
     ✓ a dry-run hook and CI token migration writes nothing 2883ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 6472ms
     ✓ a second check-name migration writes nothing 6040ms
     ✓ a dry-run check-name migration writes and moves nothing 2635ms
     ✓ a second Vale migration and a dry run write nothing 6534ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 7713ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 3965ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 6044ms
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
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 3657ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 3042ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 3380ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 2449ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 2190ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 2517ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 4086ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 3340ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 4655ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 4442ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 2410ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 255ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 255ms
     ✓ passes -w when the consumer is a pnpm workspace root 268ms
     ✓ starts the package runner for the install and the re-exec 607ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 194ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 3398ms
   ❯ #864 — upgrade migrates legacy project document ownership (3)
     × migrates legacy ownership without changing project text or core ownership 1353ms
     × preserves ambiguous legacy markers and reports cleanup without blocking check 1330ms
     ✓ previews project document migration without mutating the checkout 1030ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #864 — upgrade migrates legacy project document ownership > migrates legacy ownership without changing project text or core ownership
AssertionError: expected 'Intro the team wrote above the block\…' to be 'Intro the team wrote above the block\…' // Object.is equality

- Expected
+ Received

  Intro the team wrote above the block
+ <!-- bkit:start -->
+ <!-- bkit:managed v5.0.0 — do not edit; run `bkit upgrade` to refresh -->
  # Testing
  
  Our edited tier table
+ <!-- bkit:end -->
  Footer the team wrote below the block
+
+ <!-- bkit:start -->
+
+ <!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->
+
+ # Testing
+
+ > [!CAUTION]
+ > **Purpose:** The testing strategy: tier boundaries, framework choices, naming conventions and CI execution.
+ >
+ > **Rules:**
+ >
+ > - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
+ > - Keep the tiers strictly separate: Static · Unit · Integration · E2E · @live · Smoke.
+ > - Pre-push runs `bkit check`, then selects one gate script in this order:
+ >   - **If** `bkit ci min-push` accepts every outgoing ref → pre-push runs `pnpm bkit:gate:min`.
+ >   - **If** the branch or commit is a revert → pre-push runs `pnpm bkit:gate:static`.
+ >   - **If** `pnpm bkit:gate:static-unit-integration` is declared → pre-push runs it.
+ >   - **Else** → pre-push runs `pnpm bkit:gate:static-unit`.
+ > - Gate scripts are consumer-owned. bkit's default is typecheck + lint + format:check + bkit:lint:prose + bkit:slop:delta + `pnpm test` (unit tier only).
+ > - Integration runs at pre-push once its gate is declared. Local services, such as a Docker database, are fine there.
+ > - E2E, @live and tests against a deployed service are excluded from pre-push. They run in CI (see below).
+ > - Never bypass the hooks with `--no-verify`.
+
+ ## Local test sleep prevention
+
+ `bkit tests run`, `bkit tests changed` and the individual-file runs in `bkit tests red` / `bkit tests green` hold a macOS sleep assertion while the command runs. They use `caffeinate -is`: idle sleep is prevented on battery and AC power, and system-sleep prevention applies on AC power. The assertion ends when the command finishes or is cancelled. Other platforms run the original command.
+
+ For direct test commands and package scripts, adopt `scripts/ci/bkit-test-awake.mjs` as described in `.bkit/templates.md` § Local test sleep prevention. Wrap every test entry point and the complete gate chain. CI calls those same scripts. A raw runner command outside these entry points needs the wrapper too.
+
+ Keep the existing test timeouts. Keep the Mac's lid open; the assertion does not guarantee protection against lid closure or an explicit sleep request. The display may sleep normally.
+
+ ## CI test tiers (the bkit scaffold)
+
+ CI runs the tiers through the bkit scaffold as one parallel lane (job) per tier, not as steps in one job. The step-by-step shape is in `.github/workflows/bkit-ci.yml` § "full CI scaffold reference", and the run-level shape is in `deployments.md` § Run-level decision matrix.
+
+ The graph is flat and wide for static / unit / build / integration: scope fans out, and the capstone joins. **One exception:** when `bkit-tests-migration` owns the shared-remote migration apply, e2e / live `needs:` that lane for ordering. Never gate live behind static / unit / build / e2e:
+
+ ```
+   bkit-tests-scope ─┬─ bkit-tests-static
+     always-on        ├─ bkit-tests-unit
+     never skips      ├─ bkit-tests-build-web ─────────────────────┐
+     (~15s)           ├─ bkit-tests-integration                    │
+                      ├─ bkit-tests-build-ios                      │
+                      ├─ bkit-tests-build-android                  │
+                      └─ bkit-tests-migration ─┬─→ bkit-tests-deploy (default-branch push only; promotes)
+                                               │            │
+                                               │            ▼
+                                               └─→ bkit-tests-reset ─┬─→ bkit-tests-e2e-web
+                                                     (lease)         ├─→ bkit-tests-live-web
+                                                                     ├─→ bkit-tests-e2e-ios
+                                                                     └─→ bkit-tests-e2e-android
+                                           │
+                                           ▼
+                                bkit-tests-cleanup (always(); releases the lease)
+                                           │
+                                           ▼
+                                bkit-tests-check (needs: scope + every lane you have, deploy included)
+
+   static/unit/integration/build-*: needs:[bkit-tests-scope]; if: run_level != 'none'
+   bkit-tests-migration:            needs:[bkit-tests-scope]; no job-level if (always-on)
+   bkit-tests-deploy:               needs:[bkit-tests-migration, bkit-tests-build-web]; default-branch push only
+   bkit-tests-reset:                needs:[scope, migration]; if: tenant_target != ''
+   e2e-web / live-web / e2e-ios / e2e-android:
+                                    needs:[scope, migration, deploy, reset, <build>];
+                                    if: !cancelled() && scope==success && <own gate>
+                                    && migration != 'failure' && deploy != 'failure'
+                                    && reset != 'failure'
+ ```
+
+ Adopt only lanes your repo has. Add a lane the moment its tier exists, because a tier with no lane is a tier nothing gates. The jobs above the reference in `bkit-ci.yml` are the starter: `bkit-tests-static` and `bkit-tests-unit`, joined by the `bkit-tests-check` capstone `/bkit-ship` merges on. Every lane you add joins the capstone's `needs:` and its assert. The reference is the target. A starter stub that still sits inside `bkit-tests-unit` is the pre-split shape.
+
+ Adopt in this order, and stop at the first tier this repo does not have. You write the step bodies. These files name the job, the `needs`, the `if`, and the rule.
+
+ 1. Keep `bkit-tests-static` and `bkit-tests-unit`.
+ 2. Add `bkit-tests-scope`. Every later `if:` reads `plan`, and the markers are parsed once. The push base is the last green run (`deployments.md` § One run).
+ 3. Move integration out of unit into `bkit-tests-integration`.
+ 4. Add `bkit-tests-build-web`. It compiles, or it creates this SHA's deployment and publishes `deployment_url` + `deployment_id`, leaving the deployment un-promoted on the default branch. Do not also enable `bkit-stub:vercel-await`.
+ 5. Add `bkit-tests-migration` when you have migrations. The remote apply of new migrations (for example, `supabase db push --linked --include-all`) lives here, after the from-empty replay. On the default branch it waits for static / unit / integration / `build-web` before touching production's database. Immutability and slop-delta use the planner base on every event.
+ 6. Add `bkit-tests-reset` / `-cleanup` only when two or more lanes share one long-lived resource. Otherwise provision fresh and drop both.
+ 7. Add `bkit-tests-e2e-web`. It runs the full suite on a PR and on a push. A feature → `dev` PR hits a local stack. The target comes from `TEST_URL` only. A pass on retry is a failure.
+ 8. Add device build and device E2E only for a platform you ship. Same rule on a PR, a push, and a dispatch. `bkit-tests-e2e-ios` needs `build-ios` and `build-web`. Android is the same, with its own build lane in place of `build-ios`.
+ 9. Add `bkit-tests-live-web` for a push to `dev` or the default branch when `web_affected`. It never runs on a PR or on a dispatch. Do not `needs:` static, unit, integration, or e2e.
+ 10. `bkit-tests-check` `needs:` every lane you kept. It is the sole required check, and its assert is a script (§ Validated means executed).
+ 11. Run `bkit-tests-deploy` on a default-branch push, before the E2E / `@live` lanes. It promotes that exact `deployment_id`, and each tenant lane `needs:` it and refuses unless production serves this run's build. Not a required check (`deployments.md` § Promote before the lanes).
+ 12. Health is `bkit-health.yml`, which runs as `workflow_run` after every finished CI run on the default branch. A logging probe is a step inside each runtime lane, not a job.
+
+ These files do not ship some scripts, so the plan names them and you write them: the marker parser, and lease acquire and release. The last-green push base and the capstone assert ship as templates (`.bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs`, copied to `scripts/ci/lanes/`; `.bkit/templates/scripts/ci/bkit-check-capstone.mjs`, copied to `scripts/ci/`).
+
+ - **`bkit-tests-scope`** (always-on) computes `run_level` (plus the optional `run_migration`) and emits the `bkit-test-plan` contract, which says what should run.
+ - **`bkit-tests-static` / `-unit` / `-integration` / `-e2e-web`:** one lane per tier, as separate parallel jobs.
+   - A platform suffix (`-web` / `-ios` / `-android`) is required when that tier exists for more than one platform. `static` / `unit` / `integration` / `migration` stay bare.
+   - Integration and web E2E gate on `web_affected` / `run_e2e`.
+   - Each lane emits its executed count for the capstone, and each coverage tier posts its own coverage comment.
+   - Start with `-static` + `-unit`, then add one lane for each tier (`deployments.md` § Parallel test lanes).
+   - Do not put the remote migration apply in E2E, because it lives in `-migration`.
+   - Web E2E on a feature → `dev` PR hits a local stack with this PR's migrations. Every other event hits the deployment.
+   - The outcome rules (retries, traces, flake handling) are the same everywhere. A pass on retry is a failure. The target comes from `TEST_URL` alone. No spec is filtered by tag.
+ - **`bkit-tests-migration`** (optional; DB repos) is an always-on ordering and provisioning lane. It does two things:
+   1. A fresh-DB replay and a seed assert, each step gated on the plan or the changed paths.
+   2. On every push to `dev`/`main`, the remote apply of new migrations (for example, `supabase db push --linked --include-all`). This step is not gated by `run_migration`, so it self-heals a remote left behind.
+
+   The lane has no job-level `if:`, because e2e / live `needs:` it, and a skip would cascade. The capstone asserts `success` whenever scope succeeded. See § Provision backing services fresh.
+
+ - **`bkit-tests-build-web`** compiles the web app, or acts as the host deployment gate (for example, on Vercel: create this SHA's deployment, publish `deployment_url` + `deployment_id`, and leave it un-promoted on the default branch). It emits no `*_ran`.
+ - **`bkit-tests-build-ios` / `-e2e-ios` / `bkit-tests-build-android` / `-e2e-android`** (optional) run the device build and the device flows. Same rule on a PR, a push, and a dispatch: these lanes are not a post-merge canary. `bkit-tests-e2e-ios` `needs:` scope, migration, reset, `bkit-tests-build-ios`, and `bkit-tests-build-web`. Android matches, with `bkit-tests-build-android`. A planned red reds the capstone. Drop any platform you do not ship. One example setup is a hosted build service plus a device-flow runner.
+ - **`bkit-tests-live-web`** runs `@live` against the deployed URL (`run_live`). Drop the job when there is no deploy. It runs on a push to `dev` or the default branch only, when `web_affected`, and never on a pull request or a dispatch. It `needs:` the planner, migration, reset and `bkit-tests-build-web`. Do not gate it behind static / unit / integration / e2e. A planned failure reds the capstone. `/bkit-ship` still filters a job named `bkit-tests-live`. This lane's name does not match it, so the capstone is the gate.
+ - **`bkit-tests-reset` / `bkit-tests-cleanup`** (optional; one shared long-lived resource): reset takes the lease and puts the resource in its known state before any lane uses it; cleanup runs last, `if: always()`, and releases the lease. Planner names at most one target. Empty target skips both. Capstone reds if a planned reset skipped or either job failed. Drop both when the resource is provisioned fresh per run (§ Provision backing services fresh — the preferred answer).
+ - **Logging probe** (an optional step, not a lane): inside each runtime lane, emit one marked event and ask the error tracker (for example, Sentry) whether it arrived. Skip when that lane did not run the probe.
+ - **`bkit-tests-deploy`** (optional) runs on a push to the default branch only, before the E2E / `@live` lanes. It promotes the exact `deployment_id` that `bkit-tests-build-web` published. Each tenant lane `needs:` it, and its first step proves (by deployment id) that production serves this run's build. The job carries its own `concurrency:` group (`cancel-in-progress: false`) and is not a required check. A red job means the previous deployment stays live.
+ - **Health** (optional, separate workflow) runs as `workflow_run` after every finished CI run on the default branch, green or red, because the deploy promotes before the tenant lanes. It probes only when production serves that run's commit. Not a required check. Copy `.bkit/templates/.github/workflows/bkit-health.yml` to `.github/workflows/bkit-health.yml` (`.bkit/templates.md` § Health check).
+ - **`bkit-tests-check`** (the capstone) `needs:` all lanes. It fails when any expected tier skipped or executed zero tests, so a green required check means the run was validated, not merely that nothing failed. It is the sole branch-protection required check.
+
+ ### Accepted divergences
+
+ CI branches on the event in a few places. Each one is a deliberate, recorded divergence from "one script runs everywhere", not an accident. Every such site is registered, so a new one is caught.
+
+ **The guard.** A workflow step, or the workflow-level `concurrency:` block (keyed `file#(workflow)#concurrency#field`), that reads an event field (`github.event_name`, `github.ref`, `github.ref_name`, `github.base_ref`, `github.head_ref`, `github.event.head_commit.message`, `github.event.pull_request.title`) must be listed in the registry (`scripts/ci/bkit-accepted-divergences.json`) with its decision and reason. The guard (`scripts/ci/bkit-check-accepted-divergences.mjs`) reds on an unregistered site, on a registered site that no longer exists, and on a decision missing from the table below. A new comparison inside an already-registered step is a new site. The guard scans `.github/workflows/*.yml` only; scripts, hooks and tests that read `CI` / `GITHUB_*` are outside it.
+
+ <!-- prettier-ignore -->
+ | Decision | Rule |
+ | --- | --- |
+ | `one-run-per-branch` | Concurrency key is the PR number, else the ref; the default branch queues, every other event cancels the older run. |
+ | `diff-base` | A PR plans against its base. A push plans against the branch's last green run. |
+ | `pr-affected-only` | A PR runs lint, typecheck, format, unit, and integration for affected packages. A push runs everything. |
+ | `b1-local-e2e-on-pr` | A feature → `dev` PR's web E2E hits a local stack with this PR's migrations. Every other event hits the deployment. |
+ | `b3-live-push-only` | `@live` runs on `dev` / default-branch pushes and on dispatch only. |
+ | `b4-remote-db-push` | Only `dev` / default-branch pushes apply migrations to a shared remote database. A PR never does. |
+ | `main-basic-lanes-before-production-migration` | On a default-branch push, `bkit-tests-migration` waits for static / unit / integration / `build-web` before it pushes production's migrations. |
+ | `release-promotes-first` | On a default-branch push the release promotes production before the E2E / `@live` lanes run; each refuses unless production serves this run's build. |
+ | `promotion-lag` | A `dev` push notes when the default branch lags. It tests nothing. |
+ | `ci-fresh-stack` | The local integration runner resets its database. CI's volume is already empty. Both start from the same state. |
+ | `local-runner-stands-down` | The laptop E2E entrypoints are no-ops under `CI`. |
+ | `human-confirmation` | A laptop reset of a remote tenant needs an explicit yes. The CI run is the approval. |
+ | `revert-recovery` | A revert push skips the pre-push unit and integration tiers. CI still runs every tier. |
+ | `output-channel` | CI prints annotations and job summaries. A terminal prints lines. |
+ | `ci-strict-time-limits` | Unit time limits grow with a laptop's load, re-read as each test file starts so a mid-run ramp cannot starve late files. Under `CI` they stay fixed. |
+ | `playwright-outcomes` | Same retries, traces, and flake handling on every machine. A pass on retry is a failure. The target comes from `TEST_URL` alone. No spec is filtered by tag. |
+
+ ### Which resources may each lane touch?
+
+ Every lane must declare what it may reach, and the lane's env enforces the declaration, not a comment. A lane that can reach a shared remote instance eventually will, and the result is cross-run interference, not a failure.
+
+ <!-- prettier-ignore -->
+ | Lane | Real external APIs | Stateful backing service (DB / cache / queue) | Deployed app |
+ | --- | --- | --- | --- |
+ | `bkit-tests-static` | none | none | none |
+ | `bkit-tests-unit` | none — **mocked** | none | none |
+ | `bkit-tests-build-web` | none | none | creates this SHA's deployment; does not promote it |
+ | `bkit-tests-build-ios` / `-android` | the build host (e.g. a device-build service) | none | none |
+ | `bkit-tests-integration` | none — **mocked** | **ephemeral, CI-local, fresh each run** | none |
+ | `bkit-tests-migration` | none | **ephemeral, replayed from empty** (plan- / path-gated) + **shared remote push** on every `dev`/`main` push | none |
+ | `bkit-tests-reset` / `-cleanup` | none | the **one** shared long-lived resource this run named | none |
+ | `bkit-tests-e2e-web` | none — **mocked** | ephemeral **local** (feature → `dev` PR) / the leased shared one (other events) | this SHA's deployment |
+ | `bkit-tests-e2e-ios` / `-android` | the device host | the leased shared resource | the deployed backend |
+ | `bkit-tests-live-web` | **real** | the deployed environment's **real** instance | **real** deployed URL |
+ | `bkit-tests-deploy` | the host API | none | promotes the deployment the tenant lanes then test |
+
+ Read the table as a rule. `bkit-tests-live-web` and the device E2E lanes are the only lanes that may spend real external quota. Only those lanes, plus push-side `-e2e-web`, may touch the shared long-lived resource, and only between reset and cleanup. Every other lane provisions its own (§ Provision backing services fresh).
+
+ > [!IMPORTANT]
+ > **"Real external API" and "real remote backing service" are two independent axes — never one flag.**
+ > This is the most expensive mistake in this doc. A single overloaded gate (`LIVE_API`, `TEST_REAL`, …) that means both "hit real third-party APIs" and "hit the real remote database" collapses unrelated needs. Suites that need only the real DB (no external API) then sit in the serial, push-only `@live` lane, where they are invisible on PRs and inflate the gating lane. Moving them to `-integration` (ephemeral local DB) shrinks `@live` and gives them PR coverage. Gate each axis on what it needs: an external-boundary test on an API credential, and a DB test on a DB URL. Prefer an ephemeral DB, which needs no gate.
+
+ **Moving a suite between lanes takes three edits, and the third is the one that bites.** Retag the file, move it to the new lane, and delete the old gate. A suite with `skipIf(!LIVE_API)` in a lane that does not set `LIVE_API` silently skips forever: the lane is green, the count looks plausible, and the coverage is gone (a hollow green through the back door, § Validated means executed). After a lane move, assert that the destination's executed count went up by the moved test count.
+
+ **A missing gate variable must give an honest, detectable skip, never a silent pass.** A tier that needs a URL or credential the run lacks must report itself skipped, not exit 0 having run nothing. **If** that tier was planned → it must also fail the capstone. Where it matters, add a per-file assert, for example (Vitest JSON) `numPassedTests >= 1 && numPendingTests === 0`. It catches both a ghost-green no-op and a quiet skip.
+
+ **A missing tool that a test needs (binary, CLI, interpreter) must fail loudly, never `return` early.** Resolve the tool through one shared test helper that throws when it is absent (for example, `requireTsx()`), with no per-file check. An early `return` is a pass that asserted nothing. A self-skip on an absent tool (`skipIf(!hasTool)`) must not skip on CI. Install the tool on that lane, or fail when `CI` is set. Otherwise the lane skips the same tests on every run and stays green.
+
+ ### Validated means executed, not "didn't fail"
+
+ A green capstone means the planned tiers ran tests and passed, not merely that nothing visibly failed. Each tier is in one of three states, and each state is gated independently:
+
+ - **Absent:** no declared entrypoint (for example, a `test:integration` / `test:live` script, or an enabled E2E step). The capstone asserts nothing. A repo with no integration / E2E / `@live` tier is fully valid.
+ - **Declared + planned to run:** assert that the tier ran and executed > 0 tests. This closes the green-with-zero hole, where everything exits 0 and looks green: `--passWithNoTests` matching nothing, a `@live`-tagged suite whose owning package declares no live entrypoint (for example, no `test:live` script, so `turbo run test:live` runs nothing), or every test gated off by `skipIf`.
+ - **Declared + correctly skipped** (a `partial` run, or not `web_affected`): assert that it was skipped, not vacuously passed.
+
+ A declared tier therefore emits an **executed count**, taken from the runner's machine summary (for example, vitest `numPassedTests + numFailedTests`). The capstone asserts `count > 0` for every declared-and-planned tier. At install time, the same rule reads "every tagged suite has a CI home": each `@live`-tagged test must live in a package whose declared entrypoint (for example, a `test:live` script) the tier actually invokes. Otherwise the tag is dead code.
+
+ **The assert is a script, not a heredoc in the workflow.** It is the only required check, and a shell heredoc inside YAML cannot be unit-tested. Move the decision into a script that the normal test command already runs, with the environment as an argument. Four cases must red:
+
+ - a lane that failed
+ - a gated lane that ran when its gate said skip
+ - a tier that reports success with zero tests
+ - a plan that will not parse
+
+ The checkout that fetches that script is ungated and not `continue-on-error`. A checkout gated on `run_level == 'full'` leaves every other run with no script, and the required check then exits on "cannot find module" without reading the plan. bkit ships the script as `.bkit/templates/scripts/ci/bkit-check-capstone.mjs` with its test `bkit-check-capstone.test.mjs`. The script takes the environment in, and puts `::error::` / `::warning::` lines and an exit code out. A consumer copies both files with `bkit-ci.yml`. When the script is missing, the capstone step reds with a copy-the-script message, and never skips.
+
+ **Namespace.** `bkit-tests-scope` is the planner. A loop over every `bkit-tests-*` job skips it, and a scope failure then leaves the capstone green. Exempt `bkit-tests-scope`, `bkit-tests-reset`, and `bkit-tests-cleanup` by name from any guard that treats every `bkit-tests-*` job as a counting lane. Point branch protection at `bkit-tests-check`.
+
+ **A per-tier count will not catch a file that stops running everywhere.** `count > 0` proves each tier ran tests, but it does not prove every test file ran in some lane. A file renamed out of its glob, moved to a lane whose filter excludes it, or left carrying a stale `skipIf` (the lane-move trap above) can quietly stop executing in every lane, while each lane stays green and each count still looks plausible. The capstone is the only job that `needs:` every lane, so it is the only place to answer this, on the union: reconcile the on-disk test-file inventory against the set of files that executed across all lanes. A file skipped in one lane but run in another is fine. Only a file that is dead in every lane is the bug.
+
+ - Its checkout stays `continue-on-error`, and must not be the script checkout above.
+ - Keep it a non-blocking diagnostic. It must never red the required check.
+ - Run it on full runs only. A PR's unit lane is affected-scoped and `bkit-tests-live-web` is absent, so the PR delta is expected and large, and a guard that cries wolf gets turned off.
+ - Start it report-only. Flip it to an assert once the allowlist of files that legitimately never run is seeded from a real inventory.
+
+ **Executed is not the same as exercised.** `count > 0` proves a test ran, but it does not prove the test reached the behaviour it claims to cover. A **hollow boundary test** is non-mock, owns a CI home, executes and passes, and can still cover nothing when it short-circuits before the boundary. A worked example: a golden test for an external OCR lane called the extractor with the wrong argument shape. The input field was `undefined`, the extractor returned `{ text: "", extractor: "none" }` in ~2ms, no API call was ever made, and the assertion (on a field that did not exist) was never reached. The test was green in CI and covered nothing.
+
+ A boundary test must therefore assert a ground-truth signal that only the real boundary can produce: a specific returned value, shape, identity or latency floor (for example, `extractor === "mistral-ocr"` and `text.length > 50`). Never assert "did not throw", or a value that a degenerate or short-circuit path could also return. Two corollaries:
+
+ 1. When a deploy / `@live` tier exists, route external and deployed-boundary behaviours (3rd-party API, model, payment, deployed schema, RLS / tenancy) to `@live`, because a passing local fixture is not evidence that prod is correct (§ Schema-invariant DB checks).
+ 2. Type-system escapes at a boundary call-site are forbidden. Examples are TS `as unknown as` / `as any` casts, the `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` directives, and Python `# type: ignore`. They suppress the contract drift (a renamed SDK field, a changed signature) that the boundary test exists to catch, so the bug ships while the test passes against the wrong shape.
+
+ **Never manufacture a vacuous green.** A pass-with-no-tests option (for example, `passWithNoTests: true` / `--passWithNoTests`) makes a runner report PASS with zero tests run. That is the exact hole the executed-count gate exists to close, so it is a **banned override** in any bkit-managed test config. Two adjacent guards:
+
+ - Emit the executed count as a build output, not a log line, so a build-cache replay (for example, from a task runner like turbo) restores the real number. Let a cache short-circuit report a `cached` sentinel (validated on cache), not a hollow 0.
+ - Assert unit / integration counts only on non-PR full runs, because a PR run is affected-scoped and can legitimately resolve to 0 affected tests.
+
+ ### Step names say whether a red is real
+
+ One verb scheme across every step in `bkit-ci.yml`, so a red run can be triaged from the step name alone before opening a log:
+
+ <!-- prettier-ignore -->
+ | Verb | Means |
+ | --- | --- |
+ | `Assert` | a red here is a real failure |
+ | `Check` | looks and reports, cannot red the lane |
+ | `Run` | invokes a named tool or suite |
+ | `Report` / `Upload` / `Count` / `Merge` / `Fetch` | move or publish results |
+
+ `Guard`, `Validate`, `Verify` and `Audit` are not in the scheme: each means "fail the job if this isn't true", which is `Assert`. `Check` is the load-bearing half: it is reserved for a step that genuinely cannot red the lane, either because it carries `continue-on-error: true` or because its body only ever warns. A step named `Check` that can fail the build is the one naming error this scheme exists to prevent, because it trains you to skim past a real failure.
+
+ Two smaller rules that follow from the same idea:
+
+ - **Name the tool the way the tool is named.** `Run actionlint`, not `Run Actionlint`; `Run bkit Check`, not `Run Bkit Check`. A step name that misspells its own tool is a step name you cannot grep for.
+ - **Drop a qualifier the job name already carries.** Inside `bkit-tests-unit`, `Run Unit Tests` beats `Run Vitest Unit Tests`, because the lane already said which tier, and the runner is visible in the command. Keep a bracket only when it disambiguates two steps that would otherwise share a name and mirrors a literal flag or tool: `Run Slop Scan (full)` / `(delta)`, `Run Shell Tests (bats)`.
+
+ ### A guard asserts the rule, not the sentence that explains it
+
+ A shape guard over a config file reads that file as text, so it is easy to anchor it on whatever string happens to be nearby. Anchor it on the rule. A guard pinned to the prose around the rule fails the moment someone improves the comment, and passes for years after the rule itself is deleted.
+
+ For example, a guard asserting `expect(content).toMatch(/bootstrap paradox/)` to protect a real invariant (a lane checks the repo out before it calls a local composite) goes red when someone tidies the phrase out of the comment, while the invariant still holds. Assert the thing that must hold (`must already be checked out`, a step id, a flag, an `if:` shape), not the words chosen to describe it.
+
+ Three practical rules:
+
+ - **Pin the mechanism, not the wording.** `expect(step).not.toMatch(/exit [1-9]/)` proves a step is non-blocking; matching a comment that says "this only warns" proves nothing about the code.
+ - **Derive the list, never hand-write it.** A guard that enumerates lanes goes stale the day a lane is added. Derive the set from the file under test (count the `VERBOSE_CI` declarations, or read the `needs:` array), so a new lane is covered without editing the guard.
+ - **Prove it can fail.** Put the bug back and watch the guard red before you trust it. A guard that has never failed is indistinguishable from a guard that cannot.
+
+ **The exception, stated so it is not mistaken for the rule.** When the shipped artefact is prose (a rules file an agent reads, a CLI help string, an advisory message), the wording is the behaviour, and asserting on it is correct. The distinction is whether the text is the deliverable or a description of one.
+
+ ### Composite actions: two rules that fail silently
+
+ A composite action (`uses: ./.github/actions/setup`) is the right way to stop copy-pasting a setup block across lanes. Two of its rules are not obvious and neither fails loudly:
+
+ - **A composite cannot own the checkout that fetches it.** A local `uses: ./…` path is resolved from the runner's own filesystem, so the repo must already be checked out before the runner can read the composite's `action.yml` at all. Putting `actions/checkout` inside the composite and making the composite each lane's first step is a bootstrap paradox, so the lane reds with "can't find action.yml". Every adopting lane runs `actions/checkout` as its own first step, with its own explicit `fetch-depth`, before it calls the composite.
+ - **Job-level `env:` reaches a composite step's process, but not its `env` expression context.** The `env` context inside a composite reflects only what the composite itself declares. `if: env.VERBOSE_CI == '1'` on a composite step is therefore always false: the step silently never runs, and nothing reds. Gate in the shell instead (`if [ "${VERBOSE_CI:-}" != "1" ]; then exit 0; fi`), and say so in a comment, or the next person tidies it back into an `if:`.
+
+ The same expression-context trap has a neighbour outside composites. The `env` context is not available to a job-level `env:` value either, so `NODE_OPTIONS: ${{ env.VERBOSE_CI && '…' || '' }}` resolves empty on every run. Spell the marker test out (see § CI verbosity).
+
+ ### E2E on PRs: run the full suite, watch which DB it hits
+
+ There are two PR-time E2E concerns. Both are gated on real preconditions (event, head ref), never on a kill-switch flag:
+
+ - **Parity — PR and push run the full suite.** `pull_request` runs the same E2E spec set as the `dev`/`main` push. Scale a slow suite by sharding (parallel lanes, more workers). PR and push runs differ only in their DB target (below) and in push-only tiers (for example, `@live`).
+ - **Correctness — migration-coupled PRs.** When preview deploys share one `dev` database, that database does not yet carry a PR's unmerged migration, because the migration applies only on the post-merge push. A PR that adds or renames a column and also uses it therefore fails with a 500 every time before the merge. A force-all-E2E marker does not help, because it hits the same migration-less DB.
+   - On feature→`dev` PRs, run E2E against a local DB that has applied this PR's migrations: reset local → prod build → run against `localhost`.
+   - Keep preview-backed E2E for `dev`/`main` pushes, for deploy fidelity.
+   - The `dev`→`main` release PR (head ref `dev`) already targets the migrated `dev` DB, so it stays on the remote.
+   - A repo with more than one migration system must apply all of them locally.
+
+ ### Concurrent invocations collide on disk, not just in the database
+
+ Per-shard data isolation (§ Optional hardening) is necessary, but not sufficient. When one job launches several runner processes at once, anything keyed on the runner's own worker index collides, because that index restarts at 0 in every process.
+
+ For example, when one E2E step fans out over several concurrent Playwright invocations and each writes its minted session into one shared auth dir as `user-w<N>.json` (`<N>` = `workerInfo.parallelIndex`), every invocation has a worker 0, so several of them write `user-w0.json`. The later write wins, and browsers load sessions their own worker never built, which surfaces as `Cannot read properties of undefined` errors and sign-in redirects. DB rows with random owners do not collide, so the collision is purely on disk. A cross-tenant bleed tripwire cannot see it, because a clobbered file still holds a valid identity.
+
+ - **Make the index global.** Give each invocation a distinct lane index, and use `laneIndex * workersPerLane + parallelIndex`. When the lane index is unset, the offset is 0, so local runs stay byte-identical.
+ - **Throw on a bad value, never clamp.** An index that silently reads as 0 is the defect being prevented.
+ - **Assert distinctness, not presence.** A guard that checks each invocation has an index still passes when two lanes share 0, which restores the bug.
+ - **Keep bands unique, never dense.** A `--workers=1` lane leaves most of its band unused, and that waste is the point. Tightening the spacing to real worker counts is how bands overlap again.
+ - **Test the loop by running it.** A static scan cannot see loop-generated invocations. Execute the real `run:` body in the guard: a control run, plus mutations (a pinned lane index, a stripped cache-dir suffix) that must red.
+
+ The same rule applies to every per-worker artefact keyed that way: transform caches, blob report dirs, JSON output names and artifact dirs. The fix also removes the reason to serialise the lanes at all.
+
+ Two further axes share the same root cause:
+
+ - **Shared identity vs per-principal rate limits.** Several lanes driving one fixture owner create more records in a minute than the product allows one user, so the lanes past the per-user limit get a 429. The limiter is working, and the fixture is pretending several lanes are one person. Give each lane its own fixture identity under a suffix, make teardown delete by id, and guard the fixture build separately from the lanes.
+ - **Shared service load.** A per-navigation auth call under a wide fan-out turns into thousands of `GET /auth/v1/user` requests in minutes, which stalls the provider and reddens lanes on other machines that share it. Before fanning out, audit per-request calls to shared external services. Do the local check first (JWKS). Call the service only for the cases that check cannot decide. This is a different lever from the phase-split one (`deployments.md` § Parallel test lanes): it cuts per-request cost, not peak concurrency.
+
+ ## Which tier does a behaviour need?
+
+ Assign every behaviour its **lowest sufficient tier(s)**: the lowest tier that actually exercises it. A behaviour may need more than one. Never substitute a lower or mocked tier for a boundary that a higher tier validates. **Under-tiering** is a defect, not a shortcut. It means using a lower or mocked tier where the rubric demands a higher or `@live` one, for example a user-visible flow with no E2E row, an external-API behaviour tested only against a local fixture, or a migration with no fresh-DB replay.
+
+ <!-- prettier-ignore -->
+ | Behaviour | Required tier |
+ | --- | --- |
+ | Any change (every commit) | **Static** — type / lint / format / prose / drift; pre-push + CI fail-fast |
+ | Pure function / single module, no I/O | **Unit** |
+ | Crosses a LOCAL stateful boundary (own DB / own API, no 3rd party) | **Integration** vs a freshly-provisioned instance, no mocks at the boundary |
+ | Crosses an external / deployed boundary (3rd-party API, model / LLM, payment, deployed schema, RLS / tenancy) | **@live (golden)** — reaches the real boundary, asserts a boundary-only signal |
+ | User-visible UI flow / DOM state | **E2E** |
+ | Design token value / reference-doc parity | **Unit** — reference doc vs each implementation, asserted independently (§ Design assertions) |
+ | Rendered geometry, contrast, touch-target size | **E2E** — computed style + a11y scan in the existing browser project (§ Design assertions) |
+ | New / changed migration or seed | **fresh-DB replay** (`bkit-tests-migration`) — replays from empty + the seed loads |
+ | Post-deploy health of a deployed surface | **Smoke** (post-CI or post-deploy — see `deployments.md`) |
+
+ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubric to one feature: one row per behaviour, each mapped to a build + verify task. Boundary rows carry the rigor above: reach the boundary, assert a signal only it can produce, and use no `as unknown as` at the call-site.
+
+ ## Test first
+
+ `/bkit-build` writes each group's tests before its code and proves them: one subagent writes the planned tests and may touch nothing else, the engine records each one failing (red), and only then does another subagent write the code, which may touch no planned test, until each passes (green). This covers the unit and integration tiers only. E2E and `@live` rows run in CI and stay planned in the `Derived Test Matrix`. Each plan task names its tests on a `**TEST FIRST:**` field, one sub-bullet per test, or `n/a — {reason}`.
+
+ - **Declare `bkit:test:file`:** it runs the one test file bkit appends as its argument (a repo-relative path), and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"`. pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`. jest needs the `jest-junit` reporter.
+   - **If** it is undeclared → the build reports test-first as not enforced.
+   - **If** the test files belong to more than one runner (for example, `.bats` and `node:test`) → point it at a script that picks the runner by file type.
+   - **If** `$BKIT_TEST_REPORT` is unset → pass no report flag. An empty `--outputFile.junit=` takes the next argument, the test file, as the report path, and overwrites it.
+ - **Declare `bkit:lint:file`:** it lints the one test file bkit appends (a repo-relative path) with the static gate's linter config, and exits 0 when clean. ESLint: `eslint --max-warnings=0`. Ruff: `ruff check`.
+   - **If** the linter does not cover the test file (for example, `.bats`) → exit 0 (Oxlint: `--no-error-on-unmatched-pattern`).
+   - The build lints each planned test file before running it for its red. **If** `bkit:lint:file` is undeclared → the red is recorded unlinted, and a lint rewrite after it changes a frozen test file, which the code step's finish refuses.
+ - **Call the runner directly:** a task runner that caches results, or runs dependent packages' suites first, breaks the one-file contract. A monorepo routes the path to the package and config that own it. An integration file gets the same environment setup that the integration suite gets.
+ - **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero, just like a real failure. A red counts when the named test ran and failed, or when its file failed to load with no case of its own in the report (the tests step writes no source, so an import of unwritten code is the expected shape of a red); a green only when it ran and passed.
+ - **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
+ - **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify.
+
+ ## Tests lock
+
+ Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bkit/templates.md` § Machine lock). The wrapped script holds the `tests` lock for the whole gate, across repositories. An unwired repository takes no lock.
+
+ - `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` as `LOCAL_STACK_LOCK_WAIT_S` and their run name as `LOCAL_STACK_LOCK_WHO`; they run the declared gate without executing the lock script itself.
+ - `bkit branches push` passes the same wait budget and its run name to Git. When its pre-push hook's gate gives up on the tests lock, it exits 81 with `lockHolder` and reports nothing pushed; the workflow ends the turn and re-runs the block.
+ - A tests-lock give-up of this run becomes exit 81 with `lockHolder`, and a tests-lock refusal becomes exit 4. A lock wait writes no `test-run` status row. A gate's own failure or a nested lock's give-up remains a test failure. A raw gate caller sees exit 75 and the holder line.
+ - Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
+ - `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
+ - The CLI wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; `--lock-wait-s=0` tries once. Claude Code ships `BKIT_LOCK_WAIT_S=1200`; other hosts use the shorter wait and re-run on exit 81 (`.bkit/providers.md` § Long-running shell commands).
+ - The script defaults to 60 seconds without a TTY when no wait is set. Waiting notes name the holders and their checkouts' earlier run times.
+
+ ## JUnit reports for bkit
+
+ `bkit tests run` counts a gate's failures from JUnit XML, not from its log. It empties a report folder before each run and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`.
+
+ - **Every runner in a gate writes JUnit there** when the variable is set: one file per runner or per run, `*.xml`, with any name. Two runs in one gate never write the same file name.
+ - **Counted:** failing plus erroring test cases across every file. Skipped cases do not count.
+ - **No reports:** `failures` is `null` (count unknown), and a hint says to turn the reporters on. The verdict still comes from the gate's exit code.
+ - **Unset variable:** the runner behaves as it always does, so a gate run by hand writes nothing extra.
+
+ ## What each tier must do
+
+ Each tier lists the rule to follow, then a **Not:** line naming the failure the rule prevents. Stack tools (Vitest / Playwright / a Supabase-style local stack / a Vercel-style preview) appear only as worked examples, because the rule is the principle. Implement it for your stack.
+
+ ### Static
+
+ - Run the whole non-test gate set: typecheck · format check · lint · prose lint · code-slop scan (full, plus a PR delta gate that fails only on net-new findings) · drift check · workflow linter. Locally this set is one script, `bkit:gate:static`, and `bkit:gate:static-unit` chains the unit tier on top. Pre-push, the build loop and the remediate agents all run these same scripts, so a green push and a green agent gate mean the same thing. CI runs the rest fail-fast, before any env pull or heavy tier.
+ - Lint covers test files too, with rules that catch tests that cannot fail: no assertion, a conditional inside a test, a conditional `expect`, an unawaited promise. The linter is consumer-owned (for example, Vitest `expect-expect`, `no-conditional-in-test`, `no-conditional-expect`, `valid-expect`, and type-aware `no-floating-promises`). An optional JS / TS starting point is `.bkit/templates/.oxlintrc.json`.
+ - Scan a clean tree. Run static before the test tiers write coverage or result artifacts, or the scan flags the artifacts instead of your code.
+ - On PRs, scope to the affected graph (for example, a monorepo task runner's `--filter=...[base]`) over a non-shallow checkout (full history). Never use a shallow clone, because its affected-selection fails open to "everything".
+ - **Not:** a green CI that never ran the slop / drift / prose gates, because they sat behind a test step that exited early.
+
+ ### Unit
+
+ - Test pure functions and single-module logic, in-process, with no I/O. Mock or inject the slow or side-effecting collaborators.
+ - **Not:** a "unit" test that opens a DB connection or hits the network. That is an integration or @live behaviour wearing a unit suffix, and it will flake.
+
+ ### Integration
+
+ - Cross a local stateful boundary (your own DB / API) against a freshly-provisioned instance, with no mocks at the boundary (§ Provision backing services fresh).
+ - Self-seed each test's own fixtures (for example, in `beforeAll`). Do not assert on rows the seed file plants. Coupling to the shared seed makes the tier brittle to seed edits and lets seed regressions hide, because the seed has its own gate (§ Migration-replay + seed).
+ - Design for **unique-ID independence**: each case creates uniquely-keyed data and never assumes a clean shared store, so the suite parallelises. Transaction-rollback isolation is a pgTAP-style fast path that application-level tests cannot use, so pin file-level serialism where files must share one local instance.
+ - The DB boundary stays hermetic and local, but a read-only external API may legitimately be exercised here behind an opt-in flag. Anything with spend, side effects, a deployed schema, or tenancy / RLS belongs in @live, not here.
+ - When the runner does not auto-load `.env`, source real credentials explicitly. Then override the backing-service vars to point at the local instance, so a stray remote URL cannot redirect the tier at production data.
+ - **Not:** an "integration" test that is green against a long-lived shared dev DB carrying another run's rows. Its reproducibility is unproven.
+
+ ### Deploy-reachability (between integration and E2E)
+
+ - Before any tier runs against a freshly-deployed URL, assert that it is actually serving, because **ready != serving**. A platform can report a deployment ready while it returns 404 / 500, and a bare "did the deploy finish" check passes anyway.
+ - Make a missing target an honest failure, not a silent skip. Assert that >=1 reachability test actually ran (per-file executed count), so an unreachable target reds the build instead of passing as a green no-op.
+ - **Not:** an E2E suite that "passes" because every spec silently skipped against a target that was never serving.
+
+ ### E2E
+
+ - Drive the real UI against the specific commit's preview, after confirming it is ready and serving. Resolve the deploy by commit SHA, never by a static branch alias that may point at a stale build.
+ - Locally, run against a production build, not a dev server, because a dev file-watcher remounts components mid-test and breaks stateful UI (dialogs, wizards).
+ - Use stable selectors (test-ids) and condition-based waits. Never use a fixed-time or network-idle wait.
+ - Do not gate a response-wait on status. Match URL + method, then assert success explicitly, or a non-2xx response silently spins until the timeout.
+ - Clean up what you create (`afterAll`), and warn on accumulated `test_` / `e2e_` rows, so leaked fixtures cannot slowly corrupt a shared environment.
+ - On a pull request and on a push, run the same spec set (§ "E2E on PRs"). Scale a slow suite by sharding, not by dropping specs.
+ - **Not:** clicking by visible text and waiting on `networkidle`, which are the two classic causes of flaky E2E.
+
+ ### @live (golden)
+
+ - Cross the real external or deployed boundary, and assert a ground-truth signal that only it can produce (§ Validated means executed). There are two shapes: **in-process** (the test calls the real SDK / model / API directly) and **deployed-endpoint** (the test fetches the running app). Use whichever one observes the boundary you are validating.
+ - It runs on a push to `dev` or the default branch only, when `web_affected` (`run_live`). A planned failure reds the capstone. It does not run on a pull request or a dispatch. A newer run on the same ref cancels the older one (`deployments.md` § One run per branch or pull request).
+ - **Honest skip vs hollow:**
+   - **If** there is genuinely nothing deployed to validate → skip with a recorded reason. The capstone then asserts nothing about the count. This is different from a tier that ran 0 tests.
+   - **If** a credential is missing while the tier is enabled → fail loudly at connect, never skip, because a vacuous skip hides infra rot.
+ - Never blast a production system with test traffic. Use a synthetic-identity namespace, plus a guarded teardown that refuses to delete anything outside it.
+ - **Not:** a non-mock @live test that short-circuits before the boundary (the hollow case), or one that asserts only "did not throw".
+
+ ### Migration-replay + seed (the fresh-DB gate)
+
+ - Prove that every migration replays from an empty database on a fresh ephemeral instance, and that the seed then loads. This is the always-on sibling gate `bkit-tests-migration` (§ Provision backing services fresh). It is different from the deploy-time step that applies only new migrations onto the already-migrated remote (`deployments.md` § Applying migrations at deploy time). That remote push lives in the same always-on lane too. It comes after the replay, which keeps a from-empty failure away from the shared remote.
+ - Assert that the seed actually loaded by checking that a known row exists. A reset or replay can exit 0 while a conditional insert silently does nothing or the seed aborts mid-file. A green replay is not proof that the fixture is present (this is the seed version of the hollow-boundary rule).
+ - Generate the seed from a single deterministic source, and regenerate the checked-in seed file from it. The source is a pure data definition with no wall-clock `now()`, no random values, and explicit IDs / enums so triggers do not randomise it. Two hand-maintained copies drift.
+ - **Replay-from-empty, not reused-volume.** A bare "start the local stack" can reuse a stale data volume and silently skip newer migrations, so it is not a freshness proof. Only a reset or replay from empty is.
+ - Trigger the gate on every migration and seed source, including the seed generator and its data definition, not just the emitted seed file. Replay every migration chain, because a second ORM / CMS chain that this gate never replays is an unverified hole.
+ - **Not:** treating a reset or replay command's exit 0 as "seed loaded", or proving freshness with a start command that reuses the volume.
+
+ ### Smoke
+
+ - After the deploy, run a fast, dependency-light probe of the live surface (a handful of health / route / contract checks, or a tiny tagged browser subset). It checks breadth ("is the app fundamentally up?"), not depth.
+ - It is an observability gate, not a merge gate. It has its own workflow and is never in branch protection. When `bkit-tests-deploy` promotes inside CI, this probe is the health workflow, not a second file (`deployments.md` § Smoke trigger plumbing, § Promote before the lanes).
+ - **Not:** a smoke suite wired into branch protection, or one so heavy that it cannot run on every deploy.
+
+ ## Design assertions are a dimension, not a lane
+
+ **Never add a design lane.** The lane axis is **resource profile** (a millisecond file read vs a booted app + browser), not subject matter, because design assertions span both. A `bkit-tests-design` job (or a design-only browser project) splits one concern across two profiles and buys nothing that the existing lanes do not already provide. Fold each assertion into the tier that already fits it. The CI topology, the capstone's `needs:` and the browser-project partition all stay unchanged. A real consumer's full design-system rollout landed with `bkit-ci.yml` byte-unchanged.
+
+ <!-- prettier-ignore -->
+ | Design assertion | Lane |
+ | --- | --- |
+ | Token parity — reference doc vs each implementation (stylesheet variables, theme object) | `bkit-tests-unit` |
+ | Static guards — no raw hex, no arbitrary-value utility classes (utility-CSS repos, e.g. Tailwind) | `bkit-tests-static` (lint rule, anchored on the **class boundary** so e.g. Tailwind `p-[3px]` reds but a legitimate substring does not) |
+ | Repo-wide raw-hex contract (scans the source tree off disk, no I/O beyond the filesystem) | `bkit-tests-unit` |
+ | Contract depth — component-level token / test-id / behaviour assertions | `bkit-tests-unit` |
+ | Computed style + measured geometry (resolved pixels, touch-target size) | `bkit-tests-e2e-web` — ordinary specs in the **existing** browser project, selected by path |
+ | Accessibility scan (contrast, target size) | `bkit-tests-e2e-web` — the scanner is an imported helper, not a project fixture |
+ | Design-source parity (a rendered style guide vs the reference doc) | `bkit-tests-unit` |
+ | Visual regression (screenshot baselines) | **opt-in, not baseline** (§ Optional hardening) — highest maintenance cost of the set |
+
+ - **One reference, asserted independently.** The reference doc owns the token contract and its parsing rules (`design.md` § Machine-checked reference). What the lanes care about is that each implementation is its own test, so one red names its culprit.
+ - **Merge-gated from day one, never an advisory window.** The assertions live inside lanes that the capstone already gates, so a design red blocks the merge on the first PR that adds one. There is no promotion step to schedule, so there is no deferral row to forget.
+ - **A group tag carries zero routing power.**
+   - Tag design tests in the test title, never by a filename convention, and add a `test:design` script for local iteration only.
+   - The tag must never appear in an execution gate or an inverse-grep filter, because a test without it still runs in its normal lane.
+   - Keep the standard filename, in a location that the package's include glob already matches. A bespoke `*.design.test.ts` or an unreached dir runs in zero lanes, so it is green everywhere and covers nothing (§ Validated means executed).
+   - Pass-with-no-tests is mandatory on every `test:design` fan-out, and only there. The lane configs keep the ban (§ Validated means executed). Each runner spells that flag differently, and a browser runner hard-errors on a path or project name that matches nothing.
+ - **Cache footgun: design tests read files outside their own package.** A token-parity test reads the reference doc, and a raw-hex contract scans the source tree. Under a per-package-hash runner, editing the reference doc changes no package hash, so a warm cache replays a PASS against a reference that the code now contradicts. Put the reference doc (and any rendered style guide) in the runner's global dependencies, and mark the design-selection task uncached. A design run that overwrites the machine-readable results file the executed-count gate consumes is the same kind of trap, so re-run the full suite before trusting either.
+ - **Keep the first honest reds.** A first real geometry or a11y sweep surfaces genuine defects (undersized controls, failing contrast).
+   - File them as issues, allowlist them behind a **named constant**, and ship the allowlist's **stale-entry check** in the same change, because an allowlist that never rejects a fixed entry decays into a silent exemption.
+   - Enumerate the sweep scope by role and tag, never by test-id presence, because library-generated markup escapes that gate by construction.
+   - Measure every theme before asserting any, or a light-theme red hides the dark-theme offenders.
+
+ ## Schema-invariant DB checks (e.g. RLS coverage)
+
+ Access-policy coverage is stack-specific. bkit ships the pattern (the two routes below), not a drop-in test. Supabase / PostgREST is the worked example. Implement it for your backing store by swapping the catalog source and the anon probe for your stack's equivalent.
+
+ Assert DB-level invariants (for example, "every public table has RLS enabled", with no hardcoded list) in one of two co-equal ways. Pick by deploy topology, not by whether you can run a local DB-test runner (for example, pgTAP):
+
+ - **pgTAP** (the hermetic-fixture route): for example, `supabase/tests/*.sql` run by `supabase db test` in the `bkit-stub:test-db` step, against a CI-local fixture built from `supabase/migrations`. It is fast, hermetic and offline, and it keeps the invariant out of app code. Caveat: the fixture can differ from prod, so a migration that does not reproduce the live schema leaves this green while the prod access policies are actually broken. It is best when there is no deploy / `@live` tier, or for pure-logic DB unit tests.
+ - **@live catalog-RPC:** a privileged, server-only catalog query called from the `@live` tier (for example, Supabase: a `SECURITY DEFINER`, service_role-only RPC `public.rls_coverage_gaps()` over REST). It validates the real deployed schema in `bkit-tests-live-web`, and it needs a deploy and the RPC. It is the recommended default once you have a deploy / `@live` tier, because for access-policy and tenancy invariants especially, a passing local-fixture check is not evidence that prod is locked down. For example, on Supabase a direct port-5432 connection from CI runners is IPv4-flaky, so use the REST path that the tier already has.
+ - **PostgREST gotcha:** `GET /rest/v1/` (OpenAPI) is service_role-only by default. Fetch the exposed surface with the service-role key, then probe each table with the ANON key. Only the leak assertion must use anon.
+
+ An auto-discovering access-policy suite belongs in `bkit-tests-live-web`. For RLS it checks RLS-enabled, anon-reads-`[]` and cross-tenant-denial with no hardcoded table list, so it catches the next table too.
+
+ ## Provision backing services fresh
+
+ A tier that needs a stateful backing service (database, cache, queue, search index) must run against a freshly-provisioned instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is not evidence of reproducibility. A migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove that a fresh provision + seed succeeds in CI: for example, an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote / dev instance for the `@live` tier and push-side E2E, because they validate the real deployed schema. It is never the integration tier's source of truth.
+
+ bkit's `bkit-tests-migration` lane (`bkit-stub:bkit-tests-migration`) is the ready-made home.
+
+ - It is always-on. It has no job-level `if:`, because the e2e and live lanes `needs:` it for remote-push ordering, and a skip would cascade.
+ - The replay and the seed assert stay plan-gated and path-gated per step.
+ - On every push to `dev`/`main`, the same lane owns the remote apply of new migrations (for example, `supabase db push --linked --include-all`). That apply has no `run_migration` gate, so the lane self-heals. Because the apply comes after the replay, a from-empty failure never gets to the remote.
+ - The capstone asserts `result == success` whenever the scope succeeded. Fold the lane into `bkit-tests-check`'s `needs:`.
+
+ **Local integration freshness.** A bare start of a local stack that reuses a warm data volume (for example, Docker + `supabase start`) can leave migrations unapplied (the stale-volume footgun).
+
+ - Prefer a reset-by-default runner over a bare integration run (for example, `turbo run test:integration`). Mirror local E2E: reset unless `--no-reset`.
+ - Shape: `pnpm test:integration:local` → a script that starts the local stack, exports its URL + keys, resets from empty (for example, `supabase db reset --local`), then runs integration. In CI it passes straight through, because CI boots its own hermetic stack.
+
+ **Local runners never touch env files** (for example, `.env.local` or `.env.production`, which may be the only copy of live credentials):
+
+ - Target the local stack by exporting its values before the config loads. Loaders (Next, dotenv `override: false`) never override a key that is already set.
+ - Blank a hosted key with `export KEY=""`, never with `unset`, because the loader refills unset keys from the file.
+ - NEVER delete, move or hide-and-restore the file, because a killed run loses it.
+ - NEVER `vercel env pull` onto it, because that replaces it with the host's keys only. Pull to a scratch file, then copy the keys across.
+ - A guard test fails any tracked script that deletes, moves or overwrites an env file.
+
+ **"Fresh" means replay-from-empty, not a reused volume.** A bare "start the local stack" command often reuses an existing data volume and applies only what is missing, so a "fresh" start can silently run a months-old schema while reporting success. Only a reset or replay from an empty store is a freshness proof. A green replay is also not a green seed. Assert that the seed actually loaded (a known row exists), because the reset can exit 0 while a conditional insert does nothing or the seed aborts mid-file. § Migration-replay + seed carries the full seed-determinism rules.
+
+ **Multiple migration systems:** a repo that runs more than one migration chain (for example, a SQL chain for the public schema and an ORM / CMS chain such as Payload or Prisma) must fresh-apply every chain here, and trigger on every migration source dir. A chain that this gate never replays is an unverified hole, so a broken migration in it lands green.
+
+ ## Optional hardening (adopt when the cost is justified)
+
+ Beyond the gates above, three practices raise confidence further. They are opt-in, not baseline.
+
+ - **Mutation testing** (for example, StrykerJS over a Vitest suite) automates the "executed != exercised" intent. It injects bugs into production code and fails when no test catches them.
+   - Run it locally, on demand. It is not a CI lane and not a nightly workflow.
+   - Gate a local run on a survival-score threshold, never 100%, because equivalent mutants make perfection unreachable.
+   - The capstone asks "did tests run?". Mutation asks "do they catch injected bugs?".
+ - **E2E sharding** (a `--shard` matrix + report merge) cuts wall-clock time on a large browser suite, but it is gated on per-shard data isolation (the unique-ID independence above). A single shared seed pins `workers: 1` and blocks sharding until the data is isolated. Isolated data is still not enough once several invocations share one job (§ Concurrent invocations collide on disk, not just in the database).
+ - **Bounded flaky-retry with tracking.** A capped retry on the flake-prone E2E tier is low-risk only when it is paired with explicit flake tracking. An auto-retry that silently passes hides a real regression, which is the inverse of "validated != didn't fail".
+
+ ## Coverage on PRs
+
+ Shipped stubs target Vitest (`bkit-stub:coverage`) and Playwright (`bkit-stub:e2e-coverage`). On another runner, keep the rules (per-tier, report-only, ratchet from current) and swap the tooling.
+
+ Report coverage on each PR without a paid product or a third-party service. For example, the `bkit-stub:coverage` block in `.github/workflows/bkit-ci.yml` runs `davelosert/vitest-coverage-report-action` entirely inside Actions with `GITHUB_TOKEN`, and posts sticky per-PR comments. That is safe for private repos, because no coverage data leaves the runner. It replaces GitHub Code Quality's coverage-on-PR value (`deployments.md` § Disable GitHub Code Quality billing). It does not replace CodeQL security scanning, which is a separate product.
+
+ **Per-tier, not merged.** Unit and integration are measured and commented separately: two runs into `coverage/unit` and `coverage/integration`, and two comments keyed by a distinct `name:`. A single merged number is the weakest option. Coverage is a union, so a line covered only by an integration test reads as covered and hides a missing unit test. A merged gate therefore lets integration mask a hollow unit suite. The two numbers also have different denominators, so they cannot be honestly combined into one.
+
+ - **Report-only by default.** There are no `thresholds`, so coverage never reds the lane, and enabling the block on an existing repo cannot break it.
+ - **Reporters are load-bearing.** The action reads `coverage-summary.json` (from the `json-summary` reporter, which is mandatory) and `coverage-final.json` (from `json`, which `file-coverage-mode: changes` requires). Enable both in `coverage.reporter`, or the step does nothing.
+ - **Two runs, separate dirs.** Run `vitest run --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts'` for unit, and a second run into `coverage/integration` for the integration tier. Separate dirs also avoid the last-writer-wins clobber that a second `--coverage` run into the same dir would cause.
+ - **Thresholds are opt-in and per tier:**
+   - **Unit = the gate.**
+     - Put `coverage.thresholds.branches: <current>` in a `vitest.unit.config.ts` (`mergeConfig` over `vitest.config`) that only the unit run loads via `-c`. Branches is the meaningful floor, because line / statement % overstates confidence. Set it to your current coverage and ratchet up.
+     - vitest coverage is per run (root config), not per project. `projects` does not scope it, and a `thresholds` block in `vitest.config` would red both runs. The `-c` file is what keeps the gate off integration.
+     - A `--coverage.thresholds.branches=<n>` CLI flag also gates, but the report step cannot read it.
+     - 80% is convention, not best practice, because a fetishised high bar breeds assertion-free line-touching tests. The executed-!=-exercised rule (§ Validated means executed) matters far more than the number.
+   - **Floor beside the figure.** The unit report step runs on every event, a red run too (via `!cancelled()` plus a `hashFiles` guard). It passes `vite-config-path: vitest.unit.config.ts`, and comments only on same-repo PRs (`comment-on: pr`, else `none`), so every job summary, pushes included, shows the measured % against its 🎯 floor. The action regex-matches `<metric>: <number>` in that file's raw text. Keep the floor on one unquoted line, with no other metric name + colon + number in the file, because a broken match drops the target silently while the gate keeps passing.
+   - **Integration = report-only.** Gate integration on execution (the capstone's `integration_ran > 0`), not on a %. A whole-repo integration % is denominator noise. Integration covers boundaries and flows, not pure logic, and rarely drives every branch, so a hard threshold on it punishes the correct pyramid shape.
+     - **If** you want a real integration % → add `--coverage.include='src/server/**'` on the integration run (the same CLI-flag idiom as `--exclude`) to scope it to the integration surface. Then set a floor, or ratchet from current. Never use a number picked from thin air.
+ - **Share the unit gate with the build workflow.**
+   - Put the unit run (`vitest run -c vitest.unit.config.ts --coverage …`) in a `test:coverage:unit` script, and chain it into `bkit:gate:static-unit` in place of `pnpm test`. Never put it beside `pnpm test`, because both run every unit test, so each test runs twice.
+   - The CI unit lane calls the script, and `/bkit-build` Run Tests calls the gate, so the floor has one source, and a regression fails in the worktree, not only on the PR.
+   - Never duplicate the command and sync it by comment, because that drifts.
+   - The build runs only the deepest declared `bkit:gate:*`, never the script by name. Left out of the chain, the script never gates the build. bkit's own repo does exactly this.
+ - **Permissions.**
+   - The report steps need `pull-requests: write`. Declare it at job level on the lane that posts.
+   - A job-level `permissions:` block replaces the workflow-level block rather than adding to it, so re-include `contents: read` too, or the checkout breaks.
+   - **Separate lanes:** with a lane per tier (recommended, see `deployments.md` § Parallel test lanes), each coverage comment posts from its own lane (unit-cov → `bkit-tests-unit`, integration-cov → `bkit-tests-integration`). Put the block on each lane that reports. With the combined starter, both live on `bkit-tests-unit`.
+ - **Fork PRs.** `GITHUB_TOKEN` is read-only for PRs from a fork, so commenting fails.
+   - The shipped unit step sets `comment-on: none` there, and its job summary still lands.
+   - The integration step's `head.repo == repo` guard skips it.
+   - **If** you must comment on fork PRs → adopt the action's `workflow_run` two-workflow pattern.
+   - The integration step is also guarded on `hashFiles(...)`, so a repo with no integration tier skips it cleanly.
+ - **Base-branch delta** (▲▼ vs the default branch) is not shipped by default, because it needs the base's `coverage-summary.json` (from a second run or a stored artifact). **If** you want it → wire the action's `json-summary-compare-path`.
+
+ ### E2E coverage on PRs
+
+ The E2E tier (`bkit-stub:e2e-coverage`) reports Playwright coverage in the same free, in-Actions, private-repo-safe way. It posts a third sticky comment keyed `name: e2e`, and it is never merged into the unit / integration numbers. Unlike vitest, there is no `--coverage` flag. Playwright is black-box and does not instrument your source, so this is a 3-part pipeline.
+
+ - **Collect during the run.** Use either an **Istanbul instrumented build** (`vite-plugin-istanbul` exposes `window.__coverage__`, which a Playwright fixture scrapes; it works on every browser) or the **V8 API** (`page.coverage`, which is Chromium-only and needs source maps). Istanbul is the cross-browser default.
+ - **Report with Monocart.** `monocart-coverage-reports` (wired via the `monocart-reporter` Playwright reporter) ingests either V8 or Istanbul input. It emits Istanbul-format `coverage/e2e/coverage-summary.json` + `coverage-final.json`, the same two files the vitest action reads (`reports: ['json-summary', 'json', 'lcov']`), so no new commenter is needed.
+ - **Comment by reuse.** Point `davelosert/vitest-coverage-report-action@v2` at `coverage/e2e` with `name: e2e`. **If** `file-coverage-mode: changes` does not accept Monocart's `coverage-final.json` → drop to `file-coverage-mode: all`, or comment via a cobertura action (`irongut/CodeCoverageSummary`) on Monocart's `cobertura` report.
+ - **Report-only, no threshold by default.** A whole-app E2E % is denominator noise, because E2E exercises user flows, not every branch, so gate the tier on the E2E step succeeding, not on a number. For a real E2E %, scope Monocart's `entryFilter`/`sourceFilter` to the surface E2E is meant to cover, then ratchet from current. Never use a picked number.
+ - **Permissions / forks.** The E2E coverage report runs in the `bkit-tests-e2e-web` lane (or, with the combined starter, in `bkit-tests-unit`). It needs that lane's job-level `pull-requests: write` + `contents: read` block, or the comment cannot post. The `head.repo == repo` guard skips fork PRs. A `hashFiles('coverage/e2e/coverage-summary.json')` guard skips repos with no E2E coverage.
+
+ ## CI verbosity (`[verbose ci]`)
+
+ See `deployments.md` § Commit-message force tags for the marker mechanics. That covers where to put it: the PR title for feature-branch pushes, and the commit message for a direct push to `dev` / `main`. This section covers the testing-specific knobs.
+
+ **Knobs flipped under the marker.** The shipped stub flips turbo / Node / Vercel / Supabase / Playwright knobs. Add your stack's equivalents.
+
+ - `TURBO_LOG_LEVEL=full` surfaces Vitest / build output across all turbo steps. Without it, that output is compressed to errors only.
+ - `NODE_OPTIONS=--trace-warnings --trace-deprecation` prints stacks on deprecations and transitive-dep regressions.
+   - Set it as a job-level `env:` key in static YAML, never by writing it to `$GITHUB_ENV`. The runner blocklists `NODE_OPTIONS` for that command: it rejects the write with an `::error::` and still concludes the step `success`. The flag then reaches nothing while the run goes green.
+   - Spell the `contains()` marker test out rather than reusing `env.VERBOSE_CI`, because the `env` context is not available to a job-level `env:` value.
+   - A step with its own `env:` block replaces the job-level value rather than merging with it, so that step must restate the flags.
+ - `DEBUG=vercel:*,supabase:*` shows the Vercel deploy and Supabase migration internal chain. It leaves out `pw:*`, because that duplicates the Playwright trace.
+ - Playwright (when `bkit-stub:e2e` is enabled) appends `--trace=on` only. `--video` and `--screenshot` are `playwright.config.ts use:` keys, not CLI flags, and Playwright errors on unknown CLI options. The trace.zip captures snapshots / network / console / source, which covers the main diagnose use case. Never pass `--reporter=line`. Let the `playwright.config.ts` chain run.
+
+ **Use when:** debug returns thin evidence (no `file:line`, only "tests failed", or an e2e failure without a trace). `bkit-debug` / `failure-diagnose` recommends it automatically. Never use it on a first attempt, and never on `bkit-ship`, because verbose output on a green run is pure cost in artifact storage and run time.
+
+ **Hostile gap: Playwright `--reporter=line` override.** **If** your `playwright test` invocation passes `--reporter=line` → drop it. With the marker on, traces are written but no reporter surfaces them, so the artifact upload is wasted. `bkit install` flags this as an advisory.
+
+ **Artifact paths** (already in `.gitignore` via the bkit template): `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/`. Never commit these, because traces alone run 1-50MB each.
+
+ <!-- bkit:end -->


 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2419:37
    2417|     expect(up.status, combinedOutput(up)).toBe(0);
    2418|
    2419|     expect(read("docs/testing.md")).toBe(pre + body + post);
       |                                     ^
    2420|     expect(read("docs/noise.md")).toBe("# Noise\n");
    2421|     const index = read(".agents/docs.md");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #864 — upgrade migrates legacy project document ownership > preserves ambiguous legacy markers and reports cleanup without blocking check
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2451:67
    2449|     expect(combinedOutput(up)).toContain("docs/security.md");
    2450|     // A missing file stays missing.
    2451|     expect(fs.existsSync(path.join(tmpDir, "docs", "design.md"))).toBe…
       |                                                                   ^
    2452|     expect(read(".bkit/version")).not.toContain("docs/security.md");
    2453|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 65 passed (67)
   Start at  18:40:27
   Duration  347.87s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-MiVUfX/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
````

## Lint output — `.bkit/core/engine/commands/install/uninstall.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/install/uninstall.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/install/uninstall.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/install/uninstall.integration.test.ts

[test-timeout-budget] load average 17.8 on 10 cores: unit limits 13400ms per test, 26800ms per hook (x2.68)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > AGENTS.md: bkit block stripped, consumer rules preserved byte-identical
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > .husky/pre-commit: heavily customised legacy fixture preserved byte-identically
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > package.json: a full uninstall leaves every script and devDep, bkit defaults included (#489)
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .cursor/hooks.json
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .codex/hooks/bkit-rules.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] package.json: removed bkit install-state block
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > JSON file (.claude/settings.json) has bkit scope stripped by uninstall (format: json semantics)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > round-trip: uninstall is idempotent on heavy-customised consumer
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > round-trip: uninstall is idempotent on heavy-customised consumer
[bkit-uninstall-surgical-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical uninstall — heavy-customised consumer fixture > fixture AGENTS.md consumer content is byte-identical after strip (regression guard)
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) strips the bkit block from bkit-gateguard.js, preserving the consumer's driver (markered-text)
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) strips bkit-managed scope from opencode.json; deletes when empty after strip
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > uninstall(opencode) removes .opencode/agents/ and .opencode/commands/ bkit-prefix mirrors
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] preserve: .opencode/plugin/bkit-gateguard.js (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > opencode round-trip: zero footprint — no bkit-prefix .opencode/ files remain after uninstall
[bkit-uninstall-surgical-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-surgical-test] strip-block: .opencode/plugin/bkit-gateguard.js
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall-surgical-test] prune empty dir: .opencode/agents
[bkit-uninstall-surgical-test] prune empty dir: .opencode/commands
[bkit-uninstall-surgical-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1)
[bkit-uninstall-surgical-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete mirror: .claude/commands/bkit-build.md
[bkit-uninstall-surgical-test] delete mirror: .claude/agents/bkit-build-plan-tasks.md
[bkit-uninstall-surgical-test] prune empty dir: .claude/commands
[bkit-uninstall-surgical-test] prune empty dir: .claude/agents

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > deletes a bkit-seeded markdown husk (AGENTS.md reduced to a lone H1) (#255 P2-15)
[bkit-uninstall-surgical-test] delete (empty after strip): AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > opencode uninstall — zero footprint after uninstall > preserves a consumer-customised AGENTS.md (content outside the bkit block survives)
[bkit-uninstall-surgical-test] strip-block: AGENTS.md
[bkit-uninstall-surgical-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-surgical-test] delete: .bkit/version
[bkit-uninstall-surgical-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/architecture.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/data-schema.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/deployments.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/design.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/noise.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/observability.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/security.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/setup.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/technology.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: docs/testing.md (file not found — nothing to do)
[bkit-uninstall-surgical-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > removes exactly ONE provider block; the other provider remains intact
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama]

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > updates bkit.providers.opencode.installed array in package.json
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama]

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > re-points bkit.providers.opencode.default when the active provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[ollama] bkit.providers.opencode.default=ollama
[bkit-uninstall] write: .opencode/agents/bkit-audit-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-1.md
[bkit-uninstall] write: .opencode/agents/bkit-build-challenge-2.md
[bkit-uninstall] write: .opencode/agents/bkit-build-install-skills.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-convert.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-current.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-gaps-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-tests.md
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-3.md
[bkit-uninstall] write: .opencode/agents/bkit-design-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-design-organise.md
[bkit-uninstall] write: .opencode/agents/bkit-design-review-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-review-2.md
[bkit-uninstall] write: .opencode/agents/bkit-design-spike.md
[bkit-uninstall] write: .opencode/agents/bkit-design-update.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-generate.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-review-1.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-review-2.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-scope-check.md
[bkit-uninstall] write: .opencode/agents/bkit-plan-update.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-conflict-resolve.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-deferred-sweep.md
[bkit-uninstall] write: .opencode/agents/bkit-ship-update-docs.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-compress-markdown.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-decisions.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-roadmap.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-tracker.md
[bkit-uninstall] write: .opencode/commands/bkit-auto.md
[bkit-uninstall] write: .opencode/commands/bkit-build.md
[bkit-uninstall] write: .opencode/commands/bkit-debug.md
[bkit-uninstall] write: .opencode/commands/bkit-design.md
[bkit-uninstall] write: .opencode/commands/bkit-plan.md
[bkit-uninstall] write: .opencode/commands/bkit-ship.md
[bkit-uninstall] active provider switched to "ollama" — re-rendered 46 .opencode/ agent/command file(s) to its model pins.

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > surgical --opencode=<provider> removal (#281 Task 4) > falls through to full teardown when the last provider is removed
[bkit-uninstall] removed provider block "openrouter" from opencode.json
[bkit-uninstall] updated package.json: bkit.providers.opencode.installed=[] bkit.providers.opencode.default=(removed)
[bkit-uninstall] no providers remain — triggering full opencode host teardown...
[bkit-uninstall] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall] delete mirror: .opencode/agents/bkit-build-plan-tasks.md
[bkit-uninstall] delete mirror: .opencode/commands/bkit-build.md
[bkit-uninstall] prune empty dir: .opencode/agents
[bkit-uninstall] prune empty dir: .opencode/commands
[bkit-uninstall] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --auto resets bkit.cloud.agent to unset and keeps every other key
[bkit-uninstall-surgical-test] package.json: reset bkit.cloud.agent to unset

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > --opencode resets bkit.providers.opencode.default and .installed to unset
[bkit-uninstall-surgical-test] absent: .opencode/opencode.json (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-surgical-test] package.json: reset bkit.providers.opencode.default, bkit.providers.opencode.installed to unset

stdout | .bkit/core/engine/commands/install/uninstall.integration.test.ts > targeted uninstall drops the module's bkit.* keys > a dry run lists the keys and writes nothing
[bkit-uninstall-surgical-test] [dry-run] Decision table:
[bkit-uninstall] No files to process.

[bkit-uninstall-surgical-test] [dry-run] package.json: reset bkit.cloud.agent to unset

 ❯ .bkit/core/engine/commands/install/uninstall.integration.test.ts (21 tests | 1 failed) 1473ms
   ✓ surgical uninstall — heavy-customised consumer fixture (6)
     ✓ AGENTS.md: bkit block stripped, consumer rules preserved byte-identical 10ms
     ✓ .husky/pre-commit: heavily customised legacy fixture preserved byte-identically 5ms
     ✓ package.json: a full uninstall leaves every script and devDep, bkit defaults included (#489) 5ms
     ✓ JSON file (.claude/settings.json) has bkit scope stripped by uninstall (format: json semantics) 3ms
     ✓ round-trip: uninstall is idempotent on heavy-customised consumer 6ms
     ✓ fixture AGENTS.md consumer content is byte-identical after strip (regression guard) 5ms
   ✓ opencode uninstall — zero footprint after uninstall (7)
     ✓ uninstall(opencode) strips the bkit block from bkit-gateguard.js, preserving the consumer's driver (markered-text) 9ms
     ✓ uninstall(opencode) strips bkit-managed scope from opencode.json; deletes when empty after strip 8ms
     ✓ uninstall(opencode) removes .opencode/agents/ and .opencode/commands/ bkit-prefix mirrors 8ms
     ✓ opencode round-trip: zero footprint — no bkit-prefix .opencode/ files remain after uninstall 8ms
     ✓ targeted uninstall does NOT cross-delete other hosts' bkit-prefix mirrors (#255 P0-1) 8ms
     ✓ deletes a bkit-seeded markdown husk (AGENTS.md reduced to a lone H1) (#255 P2-15) 4ms
     ✓ preserves a consumer-customised AGENTS.md (content outside the bkit block survives) 4ms
   ✓ surgical --opencode=<provider> removal (#281 Task 4) (4)
     ✓ removes exactly ONE provider block; the other provider remains intact 5ms
     ✓ updates bkit.providers.opencode.installed array in package.json 5ms
     ✓ re-points bkit.providers.opencode.default when the active provider is removed 212ms
     ✓ falls through to full teardown when the last provider is removed 7ms
   ✓ targeted uninstall drops the module's bkit.* keys (3)
     ✓ --auto resets bkit.cloud.agent to unset and keeps every other key 3ms
     ✓ --opencode resets bkit.providers.opencode.default and .installed to unset 3ms
     ✓ a dry run lists the keys and writes nothing 3ms
   ❯ #864 — full uninstall keeps project documents (1)
     × preserves project document copies on full uninstall 1148ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/uninstall.integration.test.ts > #864 — full uninstall keeps project documents > preserves project document copies on full uninstall
Error: ENOENT: no such file or directory, copyfile '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-uninstall-864-yegJax/.bkit/templates/docs/design.md' -> '/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-uninstall-864-yegJax/docs/design.md'
 ❯ .bkit/core/engine/commands/install/uninstall.integration.test.ts:729:8
    727|     // One adopted starter, one legacy-migrated document.
    728|     fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
    729|     fs.copyFileSync(
       |        ^
    730|       path.join(dir, ".bkit", "templates", "docs", "design.md"),
    731|       path.join(dir, "docs", "design.md"),

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 20 passed (21)
   Start at  18:46:16
   Duration  1.75s (tests 90%, transform 5%, import 3%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-MAjHME/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/templates.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/templates.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/templates.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/templates.test.ts

[test-timeout-budget] load average 16.8 on 10 cores: unit limits 12900ms per test, 25800ms per hook (x2.58)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/audits/templates/templates.test.ts (253 tests | 1 failed) 58ms
   ✓ audit templates — managed block plus consumer stub (110)
     ✓ ships the finished audit set 1ms
     ✓ the .bkit/prompts.md § Audit (Ad-hoc) catalogue lists exactly the shipped audit templates 1ms
     ✓ docs/templates/bkit-audit-accessibility.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-adoption.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-agents.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-analytics.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-annotations.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-app-performance.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-app-store.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-architecture.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-config.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-cost.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-coverage.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-database.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-dead-code.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-deferrals.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-dependencies.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-documentation.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-duplication.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-failures.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-flakes.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-gates.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-issues.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-llm.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-logs.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-models.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-privacy.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-prompts.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-red-team.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-reliability.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-repo.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-security.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-slop.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-testing.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-usability.md keeps project instructions outside the managed block 0ms
     ✓ docs/templates/bkit-audit-accessibility.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-adoption.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-agents.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-analytics.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-annotations.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-app-performance.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-app-store.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-architecture.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md bkit doc anchors resolve to shipped headings 1ms
     ✓ docs/templates/bkit-audit-config.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-cost.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-coverage.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-database.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-dead-code.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-deferrals.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-dependencies.md bkit doc anchors resolve to shipped headings 1ms
     ✓ docs/templates/bkit-audit-documentation.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-duplication.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-failures.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-flakes.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-gates.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-issues.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-llm.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-logs.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-models.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-privacy.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-prompts.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-red-team.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-reliability.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-repo.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-security.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-slop.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-testing.md bkit doc anchors resolve to shipped headings 0ms
     ✓ docs/templates/bkit-audit-usability.md bkit doc anchors resolve to shipped headings 0ms
     ✓ every shipped doc section is named by an audit, or listed with a reason 8ms
     ✓ every templates.md Contract row is covered by an audit 2ms
     ✓ docs/templates/bkit-audit-accessibility.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-adoption.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-agents.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-analytics.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-annotations.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-app-performance.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-app-store.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-architecture.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-ci-performance.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-config.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-cost.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-coverage.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-database.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-dead-code.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-deferrals.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-dependencies.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-documentation.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-duplication.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-failures.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-flakes.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-gates.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-issues.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-llm.md dogfood managed block differs only by the managed-version stamp 1ms
     ✓ docs/templates/bkit-audit-logs.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-models.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-privacy.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-prompts.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-red-team.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-reliability.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-repo.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-security.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-slop.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-testing.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-audit-usability.md dogfood managed block differs only by the managed-version stamp 0ms
     ✓ docs/templates/bkit-plan.md dogfood matches the template but for the managed-version stamp 0ms
   ❯ #864 — documentation references resolve against their ownership source (1)
     × resolves documentation references against the correct ownership sources 4ms
   ✓ Group A templates — html-comment markers (md/mdc files) (126)
     ✓ AGENTS.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ AGENTS.md: bkit:start appears before bkit:end 0ms
     ✓ AGENTS.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ CLAUDE.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ CLAUDE.md: bkit:start appears before bkit:end 0ms
     ✓ CLAUDE.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .agents/rules.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .agents/rules.md: bkit:start appears before bkit:end 0ms
     ✓ .agents/rules.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .agents/docs.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .agents/docs.md: bkit:start appears before bkit:end 0ms
     ✓ .agents/docs.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .agents/skills.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .agents/skills.md: bkit:start appears before bkit:end 0ms
     ✓ .agents/skills.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-plan.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-plan.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-plan.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-accessibility.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-accessibility.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-accessibility.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-adoption.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-adoption.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-adoption.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-agents.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-agents.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-agents.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-aio-seo.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-analytics.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-analytics.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-analytics.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-annotations.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-annotations.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-annotations.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-app-performance.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-app-performance.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-app-performance.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-app-store.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-app-store.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-app-store.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-architecture.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-architecture.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-architecture.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-ci-performance.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-config.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-config.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-config.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-cost.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-cost.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-cost.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-coverage.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-coverage.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-coverage.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-database.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-database.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-database.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-dead-code.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-dead-code.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-dead-code.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-deferrals.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-deferrals.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-deferrals.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-dependencies.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-dependencies.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-dependencies.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-documentation.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-documentation.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-documentation.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-duplication.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-duplication.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-duplication.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-failures.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-failures.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-failures.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-flakes.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-flakes.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-flakes.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-gates.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-gates.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-gates.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-issues.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-issues.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-issues.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-llm.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-llm.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-llm.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-logs.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-logs.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-logs.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-models.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-models.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-models.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-privacy.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-privacy.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-privacy.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-prompts.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-prompts.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-prompts.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-red-team.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-red-team.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-red-team.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-reliability.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-reliability.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-reliability.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-repo.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-repo.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-repo.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-security.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-security.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-security.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-slop.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-slop.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-slop.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-testing.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-testing.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-testing.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ docs/templates/bkit-audit-usability.md: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ docs/templates/bkit-audit-usability.md: bkit:start appears before bkit:end 0ms
     ✓ docs/templates/bkit-audit-usability.md: extractManagedBlock returns non-null non-empty content 0ms
     ✓ .cursor/rules/bkit-rules.mdc: has exactly one <!-- bkit:start --> and one <!-- bkit:end --> 0ms
     ✓ .cursor/rules/bkit-rules.mdc: bkit:start appears before bkit:end 0ms
     ✓ .cursor/rules/bkit-rules.mdc: extractManagedBlock returns non-null non-empty content 0ms
   ✓ Group B templates — bkit-ci.yml (2)
     ✓ bkit-ci.yml bkit-tests-static job-level env carries the verbose-CI wiring 0ms
     ✓ bkit-ci.yml install step runs a plain pnpm install (no GH Packages auth) 0ms
   ✓ Group B templates — .vale.ini (2)
     ✓ .vale.ini sets StylesPath, Packages and MinAlertLevel and enables Bkit on .agents/** 0ms
     ✓ Vale template ships the Bkit style and .vale.ini names it 0ms
   ✓ slop-scan.config.json — required core rules (JSON deep-containment) (5)
     ✓ template contains all 12 required rule keys 0ms
     ✓ all required rules have enabled: true 0ms
     ✓ comments.placeholder-comments has weight: 1.5 0ms
     ✓ template has exactly 12 required rules (no extra bkit-mandated rules beyond the twelve) 0ms
     ✓ wires the boundary plugin so boundary/type-suppression can load (#263) 0ms
   ✓ husky templates — no bkit markers in template content (4)
     ✓ .husky/pre-push contains NO bkit:start/bkit:end markers 0ms
     ✓ .husky/pre-commit contains NO bkit:start/bkit:end markers 0ms
     ✓ .husky/pre-push template still invokes pnpm at the script level 0ms
     ✓ .husky/pre-commit template still invokes pnpm at the script level 0ms
   ✓ DETAILS workflow guidance (3)
     ✓ the root DETAILS points small changes at /bkit-build 0ms
     ✓ the root DETAILS carries the held handoff 0ms
     ✓ the root DETAILS carries the manual batch recipe with both limitations 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/templates.test.ts > #864 — documentation references resolve against their ownership source > resolves documentation references against the correct ownership sources
AssertionError: expected [ 'architecture', 'technology', …(8) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "architecture",
+   "technology",
+   "security",
+   "data-schema",
+   "testing",
+   "deployments",
+   "observability",
+   "design",
+   "noise",
+   "setup",
+ ]

 ❯ .bkit/core/engine/audits/templates/templates.test.ts:315:36
    313|
    314|   it("resolves documentation references against the correct ownership …
    315|     expect(startersStillManaged()).toEqual([]);
       |                                    ^
    316|     expect(unresolvedAuditAnchors()).toEqual([]);
    317|     expect(guidesLinkingRetiredDocs()).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 252 passed (253)
   Start at  18:46:19
   Duration  197ms (tests 57%, setup 27%, import 8%, transform 5%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-j4nkyf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/template-path-refs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/template-path-refs.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/template-path-refs.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/template-path-refs.test.ts

[test-timeout-budget] load average 16.8 on 10 cores: unit limits 12900ms per test, 25800ms per hook (x2.58)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/864-move-project-docs

 ❯ .bkit/core/engine/audits/templates/template-path-refs.test.ts (51 tests | 1 failed) 423ms
   ✓ no workflow or prompt names a template path (50)
     ✓ derives the forbidden list from every template file 10ms
     ✓ every allowance still matches a line in its file 1ms
     ✓ reads every workflow and prompt 5ms
     ✓ .bkit/core/workflows/bkit-auto.md names no template path 10ms
     ✓ .bkit/core/workflows/bkit-build.md names no template path 30ms
     ✓ .bkit/core/workflows/bkit-debug.md names no template path 21ms
     ✓ .bkit/core/workflows/bkit-design.md names no template path 16ms
     ✓ .bkit/core/workflows/bkit-plan.md names no template path 15ms
     ✓ .bkit/core/workflows/bkit-ship.md names no template path 19ms
     ✓ .bkit/core/prompts/bkit-audit-generate.… names no template path 10ms
     ✓ .bkit/core/prompts/bkit-build-challenge… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-build-challenge… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-build-install-s… names no template path 5ms
     ✓ .bkit/core/prompts/bkit-build-plan-conv… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-build-plan-curr… names no template path 5ms
     ✓ .bkit/core/prompts/bkit-build-plan-gaps… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-build-plan-task… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-build-plan-test… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-build-plan-veri… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-debug-abort-han… names no template path 5ms
     ✓ .bkit/core/prompts/bkit-debug-failure-d… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-debug-failure-r… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-debug-failure-r… names no template path 5ms
     ✓ .bkit/core/prompts/bkit-debug-failure-s… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-design-brainsto… names no template path 5ms
     ✓ .bkit/core/prompts/bkit-design-brainsto… names no template path 5ms
     ✓ .bkit/core/prompts/bkit-design-brainsto… names no template path 5ms
     ✓ .bkit/core/prompts/bkit-design-generate… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-design-organise… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-design-review-1… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-design-review-2… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-design-spike.md names no template path 6ms
     ✓ .bkit/core/prompts/bkit-design-update.md names no template path 6ms
     ✓ .bkit/core/prompts/bkit-plan-generate.md names no template path 8ms
     ✓ .bkit/core/prompts/bkit-plan-review-1.md names no template path 6ms
     ✓ .bkit/core/prompts/bkit-plan-review-2.md names no template path 6ms
     ✓ .bkit/core/prompts/bkit-plan-scope-chec… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-plan-update.md names no template path 7ms
     ✓ .bkit/core/prompts/bkit-ship-conflict-r… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-ship-deferred-s… names no template path 8ms
     ✓ .bkit/core/prompts/bkit-ship-update-doc… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-utility-compres… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-utility-update-… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-utility-update-… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-utility-update-… names no template path 6ms
     ✓ .bkit/core/prompts/bkit-utility-update-… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-utility-update-… names no template path 7ms
     ✓ .bkit/core/prompts/bkit-utility-update-… names no template path 8ms
     ✓ .bkit/core/prompts/bkit-utility-update-… names no template path 10ms
     ✓ .bkit/instructions.md names no template path 19ms
   ❯ #864 — qualified project document reads (1)
     × allows qualified project document reads and rejects mandatory template dependencies 20ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/template-path-refs.test.ts > #864 — qualified project document reads > allows qualified project document reads and rejects mandatory template dependencies
AssertionError: expected [ …(17) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/prompts/bkit-build-challenge-2.md: 1. Write the **Create** output stub, with `PENDING` in every placeholder.
+ 2. Read every supplied inp",
+   ".bkit/core/prompts/bkit-build-plan-gaps-remediate.md: - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
+ - **Mandat",
+   ".bkit/core/prompts/bkit-build-plan-gaps-remediate.md: - **Improve over duplicate:** Search for an existing solution first, and extend or modify it where f",
+   ".bkit/core/prompts/bkit-build-plan-tasks.md: - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
+ - **Mandat",
+   ".bkit/core/prompts/bkit-build-plan-tasks.md: - **Improve over duplicate:** Search for an existing solution first, and extend or modify it where f",
+   ".bkit/core/prompts/bkit-build-plan-tests.md: - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
+ - **Mandat",
+   ".bkit/core/prompts/bkit-build-plan-tests.md: - **Scope discipline:** Do only what the request asks, with no opportunistic refactors, renames or \"",
+   ".bkit/core/prompts/bkit-build-plan-verify.md: - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
+ - **Mandat",
+   ".bkit/core/prompts/bkit-debug-failure-reproduce.md: 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empt",
+   ".bkit/core/prompts/bkit-design-review-2.md: 1. Write the **Create** output stub, with `PENDING` in every placeholder.
+ 2. Read every supplied inp",
+   ".bkit/core/prompts/bkit-plan-generate.md: - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
+ - **Mandat",
+   ".bkit/core/prompts/bkit-plan-generate.md: - **Completeness over shortcuts:** In-scope work is either complete or skipped: do not defer its tes",
+   ".bkit/core/prompts/bkit-plan-generate.md: 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `do",
+   ".bkit/core/prompts/bkit-plan-review-2.md: - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
+ - **Mandat",
+   ".bkit/core/prompts/bkit-plan-review-2.md: 1. Write the **Create** output stub, with `PENDING` in every placeholder.
+ 2. Read every supplied inp",
+   ".bkit/core/prompts/bkit-plan-update.md: - **Read / Update / Create:** Use any appended Read / Update / Create as exact I/O paths.
+ - **Mandat",
+   ".bkit/core/prompts/bkit-utility-compress-markdown.md: 1. Read every supplied input once at the start, and work from what it says, not from session memory.",
+ ]

 ❯ .bkit/core/engine/audits/templates/template-path-refs.test.ts:226:25
    224|
    225|     const unqualified = unqualifiedMentions();
    226|     expect(unqualified).toEqual([]);
       |                         ^
    227|   });
    228| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 50 passed (51)
   Start at  18:46:20
   Duration  556ms (tests 89%, setup 5%, import 3%, transform 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-lGdl7J/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
