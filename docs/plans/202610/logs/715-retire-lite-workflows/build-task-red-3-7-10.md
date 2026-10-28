
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/install/upgrade.integration.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

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

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts (56 tests | 1 failed) 27951ms
   ✓ P4.T7 — upgrade integration: heavy-customised-consumer scenario (4)
     ✓ detects conflict on customised .cursor/hooks.json (failClosed, loop_limit preserved) 3ms
     ✓ does not silently overwrite consumer drift in --non-interactive mode 1ms
     ✓ conflict list has relPath and both content versions for AI-actionable diff 1ms
     ✓ upgrades non-conflicting file while preserving conflicting consumer file 2ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (5)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 222ms
     ✓ install --claude does not write Serena or graphify examples 296ms
     ✓ upgrade does not rewrite a consumer-owned bkit-graphify.sh 192ms
     ✓ does not rewrite a consumer-owned .github/renovate.json5 193ms
     ✓ preserves consumer prose after bkit:end in docs/*.md through a real `bkit upgrade` (#129 §1/§6) 189ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 611ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 604ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 609ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 1090ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 1070ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 1070ms
     ✓ malformed .mcp.json fails install instead of being overwritten 195ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 916ms
     ✓ an adopted copy of every template survives upgrade and check 1066ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 1099ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 1073ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 390ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 1386ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 882ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (4)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 825ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 1169ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 833ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 845ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 856ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 801ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 876ms
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
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 614ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 575ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 598ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 581ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 583ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 582ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 573ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 700ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 834ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 827ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 446ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 127ms
     ✓ bumps when --to names the installed version but package.json pins a file: tarball 130ms
     ✓ passes -w when the consumer is a pnpm workspace root 129ms
     ✓ starts the package runner for the install and the re-exec 552ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 140ms
   ❯ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     × upgrade from a 5.2.4 lite.md keeps the consumer section 582ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/install/upgrade.integration.test.ts > #715 — upgrade retires a 5.2.4 .bkit/lite.md > upgrade from a 5.2.4 lite.md keeps the consumer section
AssertionError: expected '<!-- bkit:start -->\n\n<!-- bkit:mana…' not to contain 'bkit:start'

- Expected
+ Received

- bkit:start
+ <!-- bkit:start -->
+
+ <!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->
+
+ # Lite Workflows
+
+ > [!CAUTION]
+ > **Purpose:** Opt-in prompts that run a phase's steps and subagents without the full workflow's ceremony. The full workflow is the default.
+ >
+ > **Rules:**
+ >
+ > - All `.agents/rules.md` rules still apply. Fewer steps, never fewer rules.
+ > - The named reference is **inspiration, not a command file**: read it for its steps and subagents, take what fits, drop the rest.
+ > - Assume the right repo and branch are already checked out; do not re-detect them.
+ > - Local project lite workflows → `Project Lite Workflows` below the bkit-managed block.
+
+ ## When to use
+
+ Full workflow when in doubt; a lite workflow only when it is clearly enough. These are opt-in at your own judgement — they skip the gates, worktree isolation, PR, CI and audit trail, so they suit users who know what they are trading away. Add whichever full-phase step or subagent the work needs; go full when the cost of being wrong is high — irreversible changes (releases, data), blast radius past one small change, security / secrets / PII.
+
+ NEVER a lite workflow for: schema / migrations, public API, dependencies, secrets / config, auth / security, large multi-file refactors.
+
+ ## Contract
+
+ Read `.agents/rules.md`. Work on the current branch; commit as you go; push only when shipping or when asked. Tracker-wired: issue → the `package.json` `bkit.tracker.<tracker>.progress` state (default github `In progress`, linear `started`, jira `In Progress`) + `bkit:<phase>` label at start (drops other `bkit:*` workflow labels, `next:*`, `bkit:failed` per `.agents/rules.md` § Tracker workflow labels), the `bkit.tracker.<tracker>.review` state (default `In review` on github, `In Review` on linear and jira) at end, one short comment per step. No tracker, or no issue named: skip the tracker lines.
+
+ ## Paste
+
+ Start the session on the phase's model from `.bkit/prompts.md` § Orchestrators. Copy one block — its heading is the lite workflow's name — then insert the issue or instructions at the bracketed line.
+
+ ### design:lite
+
+ ```text
+ Handle the issue below as a design. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
+
+ [INSERT ISSUE ID / INSTRUCTIONS]
+ ```
+
+ ### plan:lite
+
+ ```text
+ Handle the issue below as a plan. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
+
+ [INSERT ISSUE ID / INSTRUCTIONS]
+ ```
+
+ ### build:lite
+
+ ```text
+ Handle the issue below as a build. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
+
+ [INSERT ISSUE ID / INSTRUCTIONS]
+ ```
+
+ ### debug:lite
+
+ ```text
+ Handle the issue below as a debug. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
+
+ [INSERT ISSUE ID / INSTRUCTIONS]
+ ```
+
+ ### ship:lite
+
+ ```text
+ Handle the issue below as a ship. Read `.bkit/workflows.md` § Per-Phase Workflows and `.bkit/prompts.md` as inspiration only — keep the steps that fit, skip the rest. Dispatch each kept subagent step to its `bkit-*` subagent on the model `.bkit/prompts.md` § Models pins for it; NEVER do subagent work inline. No subagent tool → run its prompt file in-session. Follow `.bkit/lite.md` § Contract.
+
+ [INSERT ISSUE ID / INSTRUCTIONS]
+ ```
+
+ <!-- bkit:end -->
+
+ ## Project Lite Workflows
+
+ ### hotfix
+
+ ```text
+ Ship the hotfix below.
+ ```
+

 ❯ .bkit/core/engine/commands/install/upgrade.integration.test.ts:2046:23
    2044|     const after = fs.readFileSync(lite, "utf-8");
    2045|     expect(after).toContain(own);
    2046|     expect(after).not.toContain("bkit:start");
       |                       ^
    2047|     expect(after.split("\n")[0]).toBe("<!-- bkit:retired-lite-stub -->…
    2048|     expect(runCli(["check"]).status).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 55 passed (56)
   Start at  07:15:43
   Duration  28.30s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Iclfhr/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
