
> @cbartens/bkit@6.2.0 bkit:gate:changed /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts .bkit/friction.jsonl docs/deferrals.jsonl docs/plans/202611/1028-gate-fails-workflow-plan.md docs/plans/202611/logs/1028-gate-fails-workflow/build-brief-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-brief-tests-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-challenge-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-challenge-2.md docs/plans/202611/logs/1028-gate-fails-workflow/build-decision-3-3.md docs/plans/202611/logs/1028-gate-fails-workflow/build-diff-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-holistic-gate-3-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-check.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-tasks-4-log.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-tests-4-log.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-verify-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-verify-holistic-3-2.md docs/plans/202611/logs/1028-gate-fails-workflow/build-tests-green-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-tests-red-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/status.jsonl docs/testing.md scripts/gate/bkit-gate-changed.mjs scripts/gate/bkit-gate-changed.test.mjs


[bkit:gate:changed] related: vitest related --run --passWithNoTests .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts .bkit/friction.jsonl docs/deferrals.jsonl docs/plans/202611/1028-gate-fails-workflow-plan.md docs/plans/202611/logs/1028-gate-fails-workflow/build-brief-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-brief-tests-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-challenge-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-challenge-2.md docs/plans/202611/logs/1028-gate-fails-workflow/build-decision-3-3.md docs/plans/202611/logs/1028-gate-fails-workflow/build-diff-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-holistic-gate-3-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-check.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-tasks-4-log.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-tests-4-log.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-verify-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-verify-holistic-3-2.md docs/plans/202611/logs/1028-gate-fails-workflow/build-tests-green-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-tests-red-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/status.jsonl docs/testing.md scripts/gate/bkit-gate-changed.mjs scripts/gate/bkit-gate-changed.test.mjs

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow

 ✓ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts (14 tests) 654ms

 Test Files  1 passed (1)
   Affected  1 of 245 test files (related to 22 files)
      Tests  14 passed (14)
   Start at  09:47:31
   Duration  731ms (tests 97%, setup 3%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1028-gate-fails-workflow/build-holistic-gate-2.log.reports/vitest-22330.xml

[bkit:gate:changed] named: vitest run --passWithNoTests .bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts .bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/repo/ledger-integrity.test.ts .bkit/core/engine/audits/repo/package-json.test.ts .bkit/core/engine/audits/repo/release-workflow.integration.test.ts .bkit/core/engine/audits/repo/rules-sync.test.ts .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts .bkit/core/engine/audits/templates/auto-route-marker.integration.test.ts .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts .bkit/core/engine/audits/templates/template-path-refs.test.ts .bkit/core/engine/audits/templates/templates.test.ts .bkit/core/engine/audits/workflows/close-squash.integration.test.ts .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts .bkit/core/engine/audits/workflows/ship-invariants.test.ts .bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts .bkit/core/engine/audits/workflows/workflow-archive-snippet.integration.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/checks/after/managed.test.ts .bkit/core/engine/checks/after/tools.test.ts .bkit/core/engine/checks/before/repo.test.ts .bkit/core/engine/checks/status-holes.test.ts .bkit/core/engine/checks/tips/catalogue.test.ts .bkit/core/engine/commands/analysis.test.ts .bkit/core/engine/commands/ci/ci.test.ts .bkit/core/engine/commands/comply.test.ts .bkit/core/engine/commands/install/install.integration.test.ts … [bkit] line shortened, 2680 bytes dropped

 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow

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

 ✓ .bkit/core/engine/commands/workflow/workflows.test.ts (187 tests) 97744ms
   ✓ bkit workflows start (18)
     ✓ prints nothing when the previous run is clean, absent, or unreadable 487ms
   ✓ bkit workflows close (26)
     ✓ context peaks (3)
       ✓ records each agent type's peak from the closing Claude Code session 411ms
       ✓ counts subagents of an earlier chat the run's session rows name 392ms
       ✓ records no context block, and still closes, outside a Claude Code session 399ms
     ✓ writes workflow-done and schema-valid counter + outcome rows 391ms
     ✓ records ending held and publish false on the workflow-done row 399ms
     ✓ defaults the close row to ending done 447ms
     ✓ stamps its compliance rows with the same run.parentSha as its counter and outcome, at the close step 389ms
     ✓ writes plan source converted from a build-plan-convert row, ignores a planSource meta, and carries the repo / per-run ledger counts 404ms
     ✓ counts plan tasks from the task headings, never the sub-step checkboxes 395ms
     ✓ always writes the telemetry, whatever the runtime 365ms
     ✓ with no workflow-started row: time null, per-run counts omitted, attempt 1 307ms
     ✓ counts attempts from distinct workflow-started rows (a union merge may duplicate one) 415ms
     ✓ an unwritable stats path is logged and never fails the close 404ms
     ✓ appends the completeness row before the workflow-done row 542ms
     ✓ close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run 478ms
     ✓ prints one telemetry line on stderr when the journal looks dead at close 430ms
     ✓ writes one completeness row per close 716ms
     ✓ leaves out the previous run's rows that share a second with this run's start 420ms
     ✓ still closes when the completeness check throws 382ms
     ✓ still closes when the completeness row write throws 399ms
     ✓ ship: run.pr, size of the squash commit, and coverage 479ms
     ✓ lists the feature's docs and this workflow's logs on the ref as links 632ms
     ✓ per-run counts are distinct keys; failures come from docs/failures.jsonl 377ms
     ✓ absent ledgers still give a schema-valid row with zero per-run counts 371ms
   ✓ bkit workflows close — commit, outbox, comment (9)
     ✓ --message commits everything, and bkit:auto appends the auto-route marker 524ms
     ✓ --message never commits the bkit.workflows.worktree.copy entries (.env) 474ms
     ✓ --message commits when bkit.workflows.worktree.copy names a path outside the checkout 491ms
     ✓ an exact bkit:auto match only — a near-miss label leaves the subject alone 385ms
     ✓ --verbose-ci-local appends the verbose marker only when the run's pushMode is LOCAL 457ms
     ✓ --outbox writes the artifact links and telemetry, and --number prints the close comment 347ms
     ✓ --number without --outbox is a usage error 419ms
   ✓ bkit workflows handover (29)
     ✓ --push commits and pushes the record on the feature branch without a handover 559ms
     ✓ --push never commits the bkit.workflows.worktree.copy entries (.env), gitignored or not 584ms
     ✓ handover --push commits the record when a copy entry points outside the checkout 628ms
     ✓ --push commits the aborted subject, pushes, and links the handover in the comment 595ms
     ✓ --push keeps the remote head when the branch has an open PR (exit 9, no link) 392ms
     ✓ --flush lands ONE FAILED commit on dev from a throwaway checkout, the main checkout untouched 1192ms
     ✓ --flush with nothing to record commits and pushes nothing 571ms
     ✓ --flush carries the named worktree's logs into the dev commit 1085ms
     ✓ --flush refused by dev keeps the record in the book and exits 10 1835ms
     ✓ route and message: every exit the handover reaches ends the run as a stop (6)
       ✓ exit 0, pushed → route stop, no message 451ms
       ✓ ship's owner Stop on an open PR: exit 9, push skipped → route stop with the not-pushed line 348ms
       ✓ exit 10, the push refused → route stop with the not-pushed line 622ms
       ✓ exit 11, dev cannot be fetched → route stop with the not-pushed line 477ms
       ✓ exit 80, gh cannot answer the open-PR lookup → prints nothing, so the workflow reads no route 1015ms
     ✓ --push on dev lands only the logs and ledgers through a throwaway checkout, never the checkout's code 1362ms
     ✓ --push on dev hands the landed record back, so local dev fast-forwards onto it 1459ms
     ✓ --push on dev keeps a staged ledger in the checkout and names it 1192ms
     ✓ --push on dev carries only this run's rows: other sessions' rows and older rows stay put 1497ms
     ✓ --push on dev never carries the stats script's chat and run rows, whatever their workflow 1294ms
     ✓ --push on dev never carries another run's stats rows: a run.parentSha that is none of the run's shas 1193ms
     ✓ --push on dev never carries a row whose references name another feature 1242ms
     ✓ --push on dev with no start row carries no shared-ledger row, and says so 1230ms
     ✓ a second --push on dev lands the run's rewritten log, not only new files 2428ms
     ✓ --push on dev refused keeps the record in the checkout and exits 10 1557ms
     ✓ --push commits in the named worktree, not the checkout it runs from 647ms
   ✓ bkit workflows close --flush (ship) (11)
     ✓ preserves newer feature work when closing an already merged PR 1525ms
     ✓ preserves unlanded file deletions and ledger additions on close 3133ms
     ✓ preserves dirty work and uncertain branch evidence during close 3152ms
     ✓ preserves a local feature ref changed after its cleanup proof 3171ms
     ✓ lands ONE DONE commit on dev carrying the book, then removes the worktree and branch 1701ms
     ✓ a close that did not land keeps the lock, the worktree and the branch for the Failure Path 1313ms
     ✓ a close that landed releases the lock 1712ms
     ✓ removes the worktree before it releases the lock 1782ms
     ✓ close PR (dev refused the push) (2)
       ✓ closePr with base dev still merges 3161ms
       ✓ closePr refuses when the PR base is unknown 2563ms
     ✓ leaves a worktree no workflow created, and its branch, in place 1477ms
   ✓ --post on fail / links (4)
     ✓ fail --post with the run's token: an engine-action row in status.jsonl dedups a re-run; commentFile holds the body 547ms
     ✓ links --post posts the close comment once: an identical latest comment is not posted again 316ms
   ✓ bkit workflows close / handover — a debug run in place on dev that shares its checkout (12)
     ✓ close with a shared-checkout record never commits a recorded path 823ms
     ✓ close exits 10 when a recorded path changed during the run, writing no row and committing nothing 356ms
     ✓ close exits 14 when the run has no shared-checkout record, writing no row and committing nothing 330ms
     ✓ a second run's record does not let this FID's close commit 406ms
     ✓ record is present after workflows close and before the push 852ms
     ✓ handover --push lists the run's commits in a run-commits row (6)
       ✓ an IN_PROGRESS run gets one row with the record's commits and startSha, landed with the handover 1466ms
       ✓ an IN_PROGRESS run also keeps a local parked copy of the commit list 1968ms
       ✓ a run closed by workflow-failed keeps no parked copy 1858ms
       ✓ a run closed by workflow-done keeps no parked copy 1928ms
       ✓ a FAILED run gets no row 1871ms
       ✓ a DONE run gets no row 1948ms
     ✓ failed handover from dev removes the record and keeps recorded paths 1843ms
   ✓ bkit workflows input (10)
     ✓ plan appends the parent design and the audit reports in order, each dated; a missing one exits 13 352ms
     ✓ newerThanPlan counts the comments posted after the plan's last commit, by author date 384ms
   ✓ bkit workflows close --final-return (8)
     ✓ prints the summary verbatim, the issue link, the suggested replies and the tips 678ms
     ✓ without facts or a warning prints the summary, the replies and the tips only 560ms
     ✓ puts each --line after the summary, in flag order 533ms
     ✓ --summary prints the file and keeps a copy in --outbox 640ms
     ✓ --summary on a missing file prints the --summary-missing line instead of exiting 13 579ms
 ✓ .bkit/core/engine/commands/install/upgrade.integration.test.ts (79 tests) 102748ms
   ✓ issue #129 §5 — upgrade does not force-create opt-in module files (6)
     ✓ does not create .github/renovate.json5 or .github/dependabot.yml for a non-opted-in consumer 336ms
     ✓ install --claude does not write Serena or graphify examples 513ms
   ✓ MCP config — install and upgrade own only bkit's tracker entry (7)
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (github) → same-version upgrade leaves them byte-identical 802ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (linear) → same-version upgrade leaves them byte-identical 889ms
     ✓ present, unmodified .mcp.json + .cursor/mcp.json (jira) → same-version upgrade leaves them byte-identical 823ms
     ✓ upgrade restores bkit's edited github entry, keeps a consumer server, and check is then clean 1939ms
     ✓ upgrade restores bkit's edited linear entry, keeps a consumer server, and check is then clean 2366ms
     ✓ upgrade restores bkit's edited jira entry, keeps a consumer server, and check is then clean 2348ms
     ✓ malformed .mcp.json fails install instead of being overwritten 415ms
   ✓ #489 — install and upgrade leave the consumer's own files alone (4)
     ✓ an install with every host and cloud lane creates no template outside .bkit/templates/ 2270ms
     ✓ an adopted copy of every template survives upgrade and check 2568ms
     ✓ check flags a stale .agents/context.md block; upgrade refreshes it and keeps the consumer's content 2325ms
     ✓ check flags a stale .agents/skills.md block; upgrade refreshes it and keeps the consumer's content 2100ms
   ✓ #489 — managed-version marker on every file bkit writes (2)
     ✓ every written file carries a marker at the installing version, and check derives the same set 872ms
     ✓ check flags an old marker; upgrade restamps every marker with no conflict; check is then clean 3313ms
   ✓ #717 — .codex/bkit-cloud.md through install, upgrade and check (1)
     ✓ codex install writes it gitignored at 0600; upgrade regenerates it; check stays clean 1745ms
   ✓ #255 — upgrade does not force-create uninstalled host/tooling modules (12)
     ✓ claude-only install → upgrade seeds no cursor/lint files or templates, and check stays clean 1563ms
     ✓ upgrade creates a file a newer release adds to an installed opt-in host (#550) 2297ms
     ✓ upgrade moves a 5.1.0 Antigravity hooks.json onto the current matchers (guardrails gates view_file) 1747ms
     ✓ upgrade seeds missing bkit:gate:* names, so check stays clean (#489) 1708ms
     ✓ slop plugin migration upgrades old bytes, stays idempotent, and preserves customization 2628ms
     ✓ branded script migration is idempotent and dry-run writes nothing 2632ms
     ✓ copy-and-own migration second upgrade logs no branded line for the hook and CI file 1841ms
     ✓ a dry-run hook and CI token migration writes nothing 870ms
     ✓ a second template-file migration and a dry run leave scripts/ci and the hooks unchanged 2421ms
     ✓ a second check-name migration writes nothing 2317ms
     ✓ a dry-run check-name migration writes and moves nothing 1009ms
     ✓ a second Vale migration and a dry run write nothing 2412ms
   ✓ #281 Task 3 — upgrade re-renders all installed provider blocks (1)
     ✓ upgrade reconverges ALL provider blocks — openrouter (active) + ollama (secondary) 1884ms
   ✓ #281 AC — bkit check exits 0 with multiple providers installed (1)
     ✓ bkit check exits 0 after installing two providers (openrouter + ollama) 1807ms
   ✓ #422 — gateguard markered-text upgrade round-trip (site-9 regression) (1)
     ✓ install, tamper outside the block AND stale the block content, upgrade: outside survives, block is refreshed 2029ms
   ✓ upgrade-render (11)
     ✓ #251 — bkit upgrade re-renders agents/commands + .bkit docs (6)
       ✓ restores tampered agents + docs and refreshes the prompts.md block while preserving consumer overrides 1423ms
       ✓ dead override reported: upgrade names an override row for an agent bkit no longer ships, exit 0 1269ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for github (no raw @@…@@ leak, #245) 1308ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for linear (no raw @@…@@ leak, #245) 1328ms
       ✓ upgrade renders opencode.json with provider/tracker sentinels resolved for jira (no raw @@…@@ leak, #245) 1374ms
       ✓ opencode-go gateway: install records the manifest provider; upgrade re-renders the opencode-go block (no ollama fallback) 1344ms
     ✓ #459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file (3)
       ✓ a no-op upgrade does not re-record a hand-edited canonical file as bkit's content 1387ms
       ✓ re-records the hash of .bkit/allowlist.json when upgrade regenerates it, so uninstall still deletes it 1644ms
       ✓ upgrade moves a recorded .cursor/allowlist.json to .bkit/allowlist.json 1820ms
     ✓ advisories — check and upgrade report what install reports (2)
       ✓ surfaces test-file-script-missing on check, and upgrade rewrites .bkit/advisories.md 1972ms
       ✓ a dry-run upgrade leaves .bkit/advisories.md alone 1072ms
   ✓ Scenario: bkit upgrade --to self-bump dry-run (#1) (5)
     ✓ previews the bump (pnpm add + re-render) and exits 0 without mutating 300ms
     ✓ passes -w when the consumer is a pnpm workspace root 334ms
     ✓ starts the package runner for the install and the re-exec 684ms
     ✓ rejects --to=<version> with --latest (mutually exclusive) at exit 1 317ms
   ✓ #715 — upgrade retires a 5.2.4 .bkit/lite.md (1)
     ✓ upgrade from a 5.2.4 lite.md keeps the consumer section 2219ms
   ✓ #864 — upgrade migrates legacy project document ownership (4)
     ✓ leaves project docs, the index and the version file unchanged when upgrade runs twice 2369ms
     ✓ migrates legacy ownership without changing project text or core ownership 2973ms
     ✓ preserves ambiguous legacy markers and reports cleanup without blocking check 2403ms
     ✓ previews project document migration without mutating the checkout 1433ms
   ✓ #892 — upgrade replaces the old sample config names (1)
     ✓ upgrade replaces the old sample config names 2424ms
   ✓ #892 — install, check and upgrade warn about a missing root lint-staged config instead of writing one (8)
     ✓ upgrade writes no root lint-staged config for a consumer that relied on the nested sample 1670ms
     ✓ upgrade names the missing root lint-staged config with the copy command 1787ms
     ✓ install names the missing root lint-staged config under its own log prefix 1685ms
     ✓ check names the missing root lint-staged config under its own log prefix 1592ms
     ✓ upgrade --dry-run names the missing root lint-staged config once and writes none 1384ms
     ✓ upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts 1878ms
     ✓ upgrade prints no missing lint-staged config line when lint-staged is not a dependency 1705ms
     ✓ upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path 1698ms
   ✓ #803 — upgrade over legacy OpenCode substring fetch grants (1)
     ✓ upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review 1719ms
 ✓ .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts (134 tests) 155411ms
   ✓ .husky/pre-push delete-only push (6)
     ✓ .bkit/templates/.husky/pre-push: a delete mixed with an update → gates still run 418ms
     ✓ .bkit/templates/.husky/pre-push: empty stdin → gates still run 365ms
     ✓ .husky/pre-push: a delete mixed with an update → gates still run 397ms
     ✓ .husky/pre-push: empty stdin → gates still run 394ms
   ✓ .husky/pre-push log (8)
     ✓ .bkit/templates/.husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 377ms
     ✓ .husky/pre-push: failing gate → tmp/pre-push.log holds its output, exit code kept 445ms
   ✓ .husky/pre-push already-tested push (bkit repo only) (12)
     ✓ tag on a commit no origin branch holds → gates run 509ms
     ✓ tag pushed with a branch → gates run 534ms
     ✓ branch with files no origin dev / main tip has → gates run 559ms
     ✓ dev push with the files origin/dev already has → gates run 674ms
     ✓ main push with the files origin/main already has → gates run 619ms
     ✓ no origin dev / main ref fetched → a branch push gates 661ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a release branch push 573ms
     ✓ .bkit/templates/.husky/pre-push: the shipped hook gates a tag-only push 580ms
   ✓ .husky/pre-push CI-suppressor guard (12)
     ✓ .bkit/templates/.husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 920ms
     ✓ .bkit/templates/.husky/pre-push: HEAD without a token → the gates run 703ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1045ms
     ✓ .bkit/templates/.husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 993ms
     ✓ .bkit/templates/.husky/pre-push: no integration gate declared → the unit gate runs 770ms
     ✓ .bkit/templates/.husky/pre-push: integration gate declared → it runs in place of the unit gate 785ms
     ✓ .husky/pre-push: HEAD carrying [skip ci] with an open PR → blocked before any gate 778ms
     ✓ .husky/pre-push: HEAD without a token → the gates run 801ms
     ✓ .husky/pre-push: [skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run 1130ms
     ✓ .husky/pre-push: [skip ci] head that also changes code, open PR → blocked before any gate 1030ms
     ✓ .husky/pre-push: no integration gate declared → the unit gate runs 791ms
     ✓ .husky/pre-push: integration gate declared → it runs in place of the unit gate 763ms
   ✓ .husky/pre-push tmp/ prune (6)
     ✓ .bkit/templates/.husky/pre-push: adopted script → old tmp/ files go, then the gates run 541ms
     ✓ .bkit/templates/.husky/pre-push: no adopted script → tmp/ untouched, gates still run 991ms
     ✓ .bkit/templates/.husky/pre-push: failing prune → warns, push not blocked 663ms
     ✓ .husky/pre-push: adopted script → old tmp/ files go, then the gates run 680ms
     ✓ .husky/pre-push: no adopted script → tmp/ untouched, gates still run 475ms
     ✓ .husky/pre-push: failing prune → warns, push not blocked 683ms
   ✓ .husky/pre-push disk prune (6)
     ✓ .bkit/templates/.husky/pre-push: every gate passes → the disk prune is the last call 429ms
     ✓ .bkit/templates/.husky/pre-push: a gate fails → no disk prune 632ms
     ✓ .bkit/templates/.husky/pre-push: the disk prune fails → warns, push not blocked 408ms
     ✓ .husky/pre-push: every gate passes → the disk prune is the last call 654ms
     ✓ .husky/pre-push: a gate fails → no disk prune 637ms
     ✓ .husky/pre-push: the disk prune fails → warns, push not blocked 438ms
   ✓ .husky/pre-push template fast checks (6)
     ✓ the register runs before any gate, with the pushed dev commit 642ms
     ✓ a stale register stops the push before any gate runs 420ms
     ✓ bkit check fails → the push stops before any gate runs 632ms
     ✓ the dependency audit runs before any gate, when its script is present 1016ms
     ✓ no dependency-audit script → skipped, the gates still run 1069ms
     ✓ no register script → skipped, the gates still run 765ms
   ✓ .husky/pre-push slop base (8)
     ✓ .bkit/templates/.husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 619ms
     ✓ .bkit/templates/.husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 588ms
     ✓ .bkit/templates/.husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 772ms
     ✓ .bkit/templates/.husky/pre-push: no resolver adopted → the gate keeps the default base 718ms
     ✓ .husky/pre-push: dev push → resolver in local mode on the pushed commit; the gate gets its base 721ms
     ✓ .husky/pre-push: non-dev push → no resolver call, the gate keeps the default base 610ms
     ✓ .husky/pre-push: failed run lookup → loud warning, origin/dev as the base, push goes on 792ms
     ✓ .husky/pre-push: no resolver adopted → the gate keeps the default base 1057ms
   ✓ graphify register pre-push gate (18)
     ✓ push to another branch → no check, push goes on 317ms
     ✓ branch with an open PR into dev, register stale → blocked, check-at on the pushed commit 664ms
     ✓ branch with an open PR into dev, register current → push goes on 347ms
     ✓ branch with no open PR → no check, push goes on 790ms
     ✓ branch push, gh installed but pr list fails → loud NOT-checked warning, push goes on 578ms
     ✓ branch with an open PR, graphify not installed → loud NOT-checked warning naming the PR 860ms
     ✓ an older hook copy (no BRANCH / PUSH_BRANCH_SHA) → the checked-out branch and HEAD stand in 569ms
     ✓ .husky/pre-push: push to dev → the register gate checks the pushed commit and blocks 1005ms
     ✓ .husky/pre-push: push to a feature branch → the register gate does not run 830ms
     ✓ .husky/pre-push: push of the checked-out branch with an open PR → the gate checks the pushed commit 842ms
   ✓ .husky/pre-push min push (24)
     ✓ .bkit/templates/.husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2365ms
     ✓ .bkit/templates/.husky/pre-push: a checked empty trigger uses minimum validation 2522ms
     ✓ .bkit/templates/.husky/pre-push: a remote code head without checked evidence still runs the full gate 1466ms
     ✓ .bkit/templates/.husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 2508ms
     ✓ .bkit/templates/.husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1320ms
     ✓ .bkit/templates/.husky/pre-push: a code file in the push → the full gate 1424ms
     ✓ .bkit/templates/.husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1477ms
     ✓ .bkit/templates/.husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 1664ms
     ✓ .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 1714ms
     ✓ .bkit/templates/.husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 1957ms
     ✓ .bkit/templates/.husky/pre-push: code to dev with a clean head → not blocked, full gate 1601ms
     ✓ .husky/pre-push: checked code followed by bookkeeping runs only the minimum gate 2390ms
     ✓ .husky/pre-push: a checked empty trigger uses minimum validation 3177ms
     ✓ .husky/pre-push: a remote code head without checked evidence still runs the full gate 1894ms
     ✓ .husky/pre-push: code on another outgoing ref prevents a bookkeeping shortcut 3083ms
     ✓ .husky/pre-push: plan logs and ledgers only → bkit:gate:min, not the full gate 1536ms
     ✓ .husky/pre-push: a code file in the push → the full gate 1883ms
     ✓ .husky/pre-push: code to dev under a [skip ci] head → blocked before any gate 1875ms
     ✓ .husky/pre-push: min push to dev under a [skip ci] head → allowed, light gate 2073ms
     ✓ .husky/pre-push: audit report to dev under a [skip ci] head → allowed, light gate 2072ms
     ✓ .husky/pre-push: audit-template project section to dev under a [skip ci] head → allowed, light gate 2323ms
     ✓ .husky/pre-push: code to dev with a clean head → not blocked, full gate 1972ms
     ✓ .husky/pre-push: a min push skips bkit's dist and actionlint checks 1996ms
     ✓ .husky/pre-push: a code push still runs them 1750ms
   ✓ .husky/pre-push direnv (11)
     ✓ trusted .envrc → the gate sees its variables 1047ms
     ✓ untrusted .envrc → blocked before bkit check, names direnv allow 666ms
     ✓ trusted .envrc that fails to load prints the cause, not "not trusted" 462ms
     ✓ untrusted .envrc still prints the direnv allow line 453ms
     ✓ no .envrc → no direnv call 931ms
     ✓ direnv not on PATH → gates run, no warning 1492ms
     ✓ CI set → no direnv call 693ms
     ✓ delete-only push through direnv exec → exit 0, no gate 730ms
     ✓ trusted .envrc → .bkit/.env tooling keys do not reach the gate 1388ms
     ✓ trusted .envrc → spaced and colon .bkit/.env keys do not reach the gate 1046ms
     ✓ no .bkit/.env, BKIT_GH_TOKEN exported by the pushing shell → the gate does not see it 1596ms
   ✓ the gate's vitest run (1)
     ✓ the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED 3073ms
   ✓ .husky/pre-push PR conflict (16)
     ✓ open PR whose base conflicts → blocked before bkit check, names the file 2588ms
     ✓ open PR that merges cleanly → gates run, no message 3712ms
     ✓ no open PR → no fetch, gates run 2999ms
     ✓ gh not on PATH → warns, gates run 2198ms
     ✓ gh not on PATH → warns, gates run for both hook copies 2285ms
     ✓ base fetch fails → warns, gates run 3415ms
     ✓ dev push → no PR lookup 2525ms
     ✓ min push of a conflicting PR → blocked 3423ms
     ✓ BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run 2956ms
     ✓ open PR whose only conflict is a merge=union ledger → blocked 4463ms
     ✓ single-branch fetch refspec → checks the fetched base, no false block 3829ms
     ✓ fork PR with the same head branch name → ignored, gates run 2820ms
     ✓ shallow clone → no base fetch, warns, gates run 3763ms
     ✓ fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard 2530ms
     ✓ full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR 2773ms
     ✓ fork PRs past gh's page limit → same-repo PR still found, conflict blocked 3199ms
 ✓ .bkit/core/engine/commands/workflow/tracker.integration.test.ts (23 tests) 108239ms
   ✓ workflow comment lifecycle across real CLI processes (23)
     ✓ keeps auto startup with PR metadata and dispatch in one progress comment 3663ms
     ✓ redacts malformed Jira authorization from live probe diagnostics 882ms
     ✓ keeps published build completion and PR links in one terminal comment 5115ms
     ✓ continues after the prepared completion source disappears 2827ms
     ✓ records preparation and session association failures despite successful delivery 2802ms
     ✓ associates startup and run across restart or starts fresh safely 3990ms
     ✓ keeps successive phase runs separate in adopted and worktree execution 11767ms
     ✓ keeps auto and phase progress separate across worktrees 5833ms
     ✓ continues close and cleanup after lost terminal response 4327ms
     ✓ starts fresh progress after cleanup and on a fresh clone 5198ms
     ✓ preserves substantive step results under a preparation comment boundary fault 5838ms
     ✓ preserves substantive step results under a cache comment boundary fault 5343ms
     ✓ preserves substantive step results under a receipt comment boundary fault 5526ms
     ✓ preserves substantive step results under a lock comment boundary fault 5194ms
     ✓ preserves substantive step results under a read comment boundary fault 4840ms
     ✓ preserves substantive step results under a append comment boundary fault 4382ms
     ✓ preserves substantive step results under a create comment boundary fault 4300ms
     ✓ preserves substantive step results under a reconciliation comment boundary fault 4933ms
     ✓ preserves substantive step results under a diagnostic comment boundary fault 5547ms
     ✓ keeps clean build progress and completion to two comments 8353ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 5060ms
     ✓ an ad-hoc comment with no run proof exits 2 and reaches no tracker 732ms
     ✓ accepts a session minted in the main checkout from a linked worktree 1785ms
 ✓ .bkit/core/engine/commands/workflow/worktrees.integration.test.ts (61 tests) 122179ms
   ✓ ship feature reconciliation wiring (2)
     ✓ reconciles cloud and laptop feature commits through the command boundary 2124ms
     ✓ keeps a newer remote feature tip while closing the landed local tip 15123ms
   ✓ bkit worktrees setup — mint (create) (20)
     ✓ cuts feat/{fid} off a freshly fetched origin/dev, even when the clone's fetch refspec skips dev 1902ms
     ✓ cuts feat/{fid} off origin/dev for design and plan, even while local dev is ahead 1475ms
     ✓ cuts feat/{fid} off local dev for build while it is ahead of origin/dev, and says so 1152ms
     ✓ stays on origin/dev when local dev has diverged from it, and says so 1982ms
     ✓ runs direnv allow on a .envrc identical to the main checkout's 1893ms
     ✓ leaves a .envrc that differs from the main checkout's unallowed, and narrates direnv failures 3216ms
     ✓ setup with an .envrc differing from the main checkout's reports that the push will block 1658ms
     ✓ copies the configured list, narrates each missing entry, and nothing outside it 1109ms
     ✓ reads package.json bkit.workflows.worktree: copy list (files and folders) and install off 532ms
     ✓ links bkit's own .bkit/.env to the main checkout's, so the worktree can sign in 1525ms
     ✓ creates no .bkit/.env and reports none when the main checkout has none 950ms
     ✓ design installs dependencies like build and debug 1280ms
     ✓ plan installs dependencies like build and debug 1137ms
     ✓ design stops on a failed install (5) 1031ms
     ✓ plan stops on a failed install (5) 971ms
     ✓ adds the existing local feat/{fid} rather than cutting a new one 907ms
     ✓ tracks origin/feat/{fid} when only the remote has it 1699ms
     ✓ reports a failed install with its own exit code, after the worktree is ready 838ms
     ✓ reports a package manager that could not run (127) apart from a failed install 1294ms
   ✓ bkit worktrees setup — mint (resume) (34)
     ✓ rebases onto origin/dev and clears a stale sentinel 2126ms
     ✓ build: a conflict is left in progress for the resolver, with sentinel and log 4270ms
     ✓ design: a conflict is left in progress for the resolver, with sentinel and log 4021ms
     ✓ build: a branch that tracks its rebase log can continue the paused rebase 2588ms
     ✓ plan: a branch that tracks its rebase log can continue the paused rebase 2690ms
     ✓ design: a branch that tracks its rebase log can continue the paused rebase 2394ms
     ✓ rebases onto local dev while it is ahead of origin/dev, without rewriting its commits 1630ms
     ✓ refuses a resumed design / plan worktree whose branch carries unpushed dev work 1765ms
     ✓ debug preserves failed CI ancestry when dev changes b.txt 1587ms
     ✓ debug preserves failed CI ancestry when dev changes a.txt 1526ms
     ✓ build: commits a failed ship's leftovers, drops the logs dev already holds, then rebases 2252ms
     ✓ keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one 1993ms
     ✓ resumes when a tracked .env in the copy list differs from the main checkout's, and never commits it 2566ms
     ✓ commits leftovers when a copy entry points outside the checkout 1820ms
     ✓ never commits the entries setup copies in from the main checkout 1967ms
     ✓ never commits bkit's own .bkit/.env, even where .gitignore lost its line 2150ms
     ✓ resumes with bkit's own env in the copy list (.bkit/.env) 828ms
     ✓ resumes with bkit's own env in the copy list (./.bkit/.env) 873ms
     ✓ skips the owned env with Windows path normalization (.bkit/.env) 1091ms
     ✓ skips the owned env with Windows path normalization (./.bkit/.env) 1157ms
     ✓ skips the owned env with Windows path normalization (.bkit\.env) 978ms
     ✓ skips the owned env with Windows path normalization (.\.bkit\.env) 1175ms
     ✓ re-links bkit's own .bkit/.env on resume, so a worktree made earlier heals itself 1977ms
     ✓ leaves a worktree .bkit/.env that differs from the main checkout's, and says so 1787ms
     ✓ refreshes a bkit-made .bkit/.env copy after the main checkout's token changes 2190ms
     ✓ reports a .bkit/.env it could neither link nor copy, instead of throwing 874ms
     ✓ leaves a clean worktree's history alone 2708ms
     ✓ a rebase that cannot start (the leftovers' commit refused) writes the sentinel with its own exit code 2733ms
     ✓ rebases past engine-call rows the carry commit's hook appended to the status file, and puts them back 2901ms
     ✓ still refuses a status file the carry commit's hook dirtied with any other row: exit 9 2663ms
     ✓ rebases past friction rows the carry commit's hook appended, and puts them back 3173ms
     ✓ puts friction rows back after a rebase onto a dev that appended to the same file 3117ms
     ✓ still refuses a friction file the carry commit's hook dirtied with another kind: exit 9 3052ms
     ✓ does not mark a resumed worktree it did not create 1101ms
   ✓ bkit worktrees setup — debug adopts, never mints (2)
     ✓ adds a worktree for an existing feat/{fid}, marks it, installs 1543ms
   ✓ bkit worktrees setup — ship (2)
     ✓ ships origin's feat/{fid} over the session branch when only the remote has it 1294ms
     ✓ mints feat/{fid} off origin/dev from a dev session, and does not rebase on resume 1996ms
   ✓ bkit worktrees remove (1)
     ✓ preserves a worktree setup created when it holds uncommitted changes 1012ms
 ✓ .bkit/core/engine/commands/workflow/branches.test.ts (279 tests) 224723ms
   ✓ branches rebase: behaviour (32)
     ✓ resolves a ledger conflict and completes the rebase, with no .gitattributes 319ms
     ✓ --file records the completed rebase as an engine-action row, from the old tip to the new 309ms
     ✓ a refused rebase whose --abort itself fails: aborted false, exit 3, ABORT FAILED in the log 516ms
     ✓ produces byte-identical output to merge=union 535ms
     ✓ keeps going when the skip lands on a next commit that conflicts again 394ms
     ✓ unions docs/roadmap.md without de-duplicating its repeated lines 362ms
     ✓ resolves a lockfile from the rebase target's copy, then regenerates it 1029ms
     ✓ refuses a lockfile whose regenerate command fails 506ms
     ✓ settles a generated register on the rebase target's copy, then rebuilds and commits it 724ms
     ✓ carries the branch's edit to the hand-written region onto the target's copy 648ms
     ✓ keeps the target's edit to the hand-written region when the branch left it alone 603ms
     ✓ refuses and aborts when both sides changed the hand-written region 374ms
     ✓ keeps the target's copy unrebuilt when the repo has no rebuild script 428ms
     ✓ completes the rebase when the rebuild fails, keeping the target's copy and logging why 506ms
     ✓ settles a doc's generated block on the target's copy, keeps the branch's other edits, then rebuilds 710ms
     ✓ refuses and aborts when the doc also conflicts outside the generated block 359ms
     ✓ merges the install record entry by entry, taking the target's value where both sides changed one 483ms
     ✓ refuses and aborts when a side deleted the install record 370ms
     ✓ refuses a conflicted doc the repo's script does not list 311ms
     ✓ --sentinel and --log-file record a refusal and survive the abort 340ms
     ✓ removes a stale sentinel when the rebase succeeds 488ms
     ✓ resolves two ledgers conflicting in the same commit in one pass 755ms
     ✓ resolves a conflict in each of two replayed commits across rounds 606ms
   ✓ branches anchor-read (15)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ skips (12) when the base is unreachable in this clone 315ms
       ✓ runs (0) with the landed path count once dev moved 588ms
       ✓ errors (2) when the --against ref does not exist, instead of skipping 311ms
   ✓ branches push (21)
     ✓ pushes a feature branch with --force-with-lease and reports the ref pushed 614ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ --mode=feature without --require-ci never merges dev (ship's force-push) 878ms
     ✓ --require-ci stops (11) and pushes nothing when dev's commits conflict outside docs/ and the ledgers 1241ms
     ✓ --require-ci also reads the message body, as the HEAD-Subject Assertion did 324ms
     ✓ --mode=abort never pushes into an open PR, and says what was not pushed 1269ms
     ✓ --mode=abort pushes when the branch has no open PR 1179ms
     ✓ --mode=abort hands the probe to MCP (80) when gh fails 681ms
     ✓ --mode=abort hands the probe to MCP (80) when gh is not installed 326ms
     ✓ --open-pr carries the MCP answer and skips gh 404ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ replay build callback cherry-picks exactly the recorded SHAs 695ms
     ✓ replay conflict exits non-zero naming the paths and removes the throwaway checkout 836ms
     ✓ a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal 2519ms
     ✓ skip-ci HEAD on the replay is refused 543ms
     ✓ a skip-ci foreign HEAD does not block a replay whose last run commit is clean 1269ms
> [bkit] TRUNCATED HERE — 18 lines omitted. Dropped content was NOT read.
     ✓ an up-to-date branch is a no-op 496ms
     ✓ refuses a diverged branch with exit 22 and leaves HEAD where it was 854ms
     ✓ a fetch that fails exits 10 351ms
   ✓ branches scan-diff (41)
     ✓ scan-diff does not treat an existing skip in a re… 448ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ scan-diff does not let unrelated additions hide a… 449ms
     ✓ scan-diff attributes deletion to its old test ins… 448ms
     ✓ scan-diff consumes each moved assertion once and … 443ms
     ✓ scan-diff does not match identical assertions fro… 500ms
     ✓ scan-diff does not match the same leaf test name … 473ms
     ✓ scan-diff does not match a same-named test with d… 430ms
     ✓ scan-diff does not match a same-named test with c… 464ms
     ✓ --paths finds a changed path matching the pattern (exit 0) and names it 452ms
     ✓ --paths with no match exits 1 396ms
     ✓ --paths that is not a valid pattern is a usage error (exit 2) 326ms
     ✓ --marker finds an added line carrying the marker outside docs/plans 604ms
     ✓ scan-diff without --base ignores a match that only an unpushed local dev commit adds 608ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ scan-diff exits 0 on a diff that adds no disabled test 456ms
     ✓ scan-diff ignores a removed comment in a test file 475ms
     ✓ scan-diff ignores an assertion moved within the file 502ms
     ✓ scan-diff still reports a removed assertion 480ms
     ✓ scan-diff reports an assertion re-added only outside the test file 440ms
     ✓ scan-diff finds an added pytest mark skip 516ms
     ✓ scan-diff finds an added unittest skip 473ms
     ✓ scan-diff finds an added bare skip call 468ms
     ✓ scan-diff ignores a quoted skip in a documentation file 396ms
     ✓ scan-diff ignores a marker literal in a non-test source file 388ms
     ✓ scan-diff ignores an assertion whose expectation changed 408ms
     ✓ scan-diff ignores an assertion replaced by another in the same test 462ms
     ✓ scan-diff reports a deleted test file 547ms
     ✓ needs exactly one of --paths, --marker, --code; an unknown base exits 23 393ms
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
     ✓ continues the feature merge before starting a dev merge 3043ms
     ✓ publishes local code with a CI running head before bookkeeping 3578ms
     ✓ refuses feature reconciliation without losing work when fetch or merge fails 4743ms
     ✓ refuses remote feature work that imports unpublished local dev ancestry 3397ms
     ✓ rechecks inherited dev work when a retry observes a new feature candidate 2286ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ --merge-docs runs a declared bkit:generate after the merge and commits its output 1562ms
     ✓ --merge-docs commits only what bkit:generate changed; other uncommitted work stays out 1434ms
     ✓ --merge-docs exits 25 when bkit:generate fails after the merge, logging its output 1170ms
     ✓ --merge-docs skips an empty bkit:generate script 988ms
     ✓ --merge-docs leaves the branch alone when only code moved on dev 902ms
> [bkit] TRUNCATED HERE — 7 lines omitted. Dropped content was NOT read.
     ✓ --merge regenerates a conflicted lockfile from dev's copy 2051ms
     ✓ --merge leaves a code conflict for a hand resolution (24) and completes once it is staged 2141ms
     ✓ --merge refuses (11), aborts the merge and writes the sentinel when a lockfile regenerate fails 1752ms
     ✓ --merge runs a declared bkit:generate after the merge and commits its output 1707ms
     ✓ --merge settles a conflicted register on dev's copy and rebuilds it, leaving nothing for a hand resolution 2242ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ --merge --file records an engine-action row keyed on the tip it merged from 1074ms
     ✓ refuses --merge with --head or --merge-docs, on dev, and detached (5) 706ms
     ✓ exits 10 when the fetch fails 386ms
     ✓ refuses --merge-docs with --head, and an unknown --head 372ms
   ✓ branches sync-dev (6)
     ✓ fast-forwards local dev without checking it out 802ms
     ✓ on dev: moves the checkout too, and installs only because dev moved 1822ms
     ✓ a failed install stops ship (16) 1104ms
     ✓ lists local-only dev commits with the command to publish them, and pushes nothing 1213ms
     ✓ fast-forwards local dev from a clone whose fetch refspec omits dev 1019ms
     ✓ exits 10 when the fetch fails 692ms
   ✓ shared landed comparison (2)
     ✓ preserves unlanded executable bit changes in the shared landed comparison 518ms
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
     ✓ local: uncommitted work in the feature worktree keeps the worktree and the branch 2305ms
     ✓ branch work missing from dev: stops (18) and keeps the branch and its worktree 2274ms
     ✓ PR state unread (one gh view failed): retried like an open PR, then merges 1952ms
     ✓ PR merge refused on every try: stops (17) after LAND_ATTEMPTS, PR left open 1206ms
     ✓ local: a squash that drops the branch's ledger rows puts them back (no merge=union) 3344ms
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
     ✓ reports undeclared and runs nothing with no scripts 584ms
     ✓ reports undeclared and runs nothing with an empty script 542ms
     ✓ exits 25 when bkit:generate fails, logging its output, and commits nothing 684ms
     ✓ exits 25 and commits nothing when bkit:generate rewrites a path that was already changed 796ms
     ✓ refuses dev, and an --attempt that is not a whole number >= 1 573ms
 ✓ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (71 tests) 99221ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 2788ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 320ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 1585ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 2533ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 1543ms
> [bkit] TRUNCATED HERE — 21 lines omitted. Dropped content was NOT read.
       ✓ refuses to dispatch uncounted when package.json cannot be read 1053ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 2421ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 2592ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 3508ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 1325ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 1759ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 3058ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 1394ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 1350ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 2182ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 2098ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 2240ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 2173ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 2183ms
       ✓ a branch with no status.jsonl dispatches as before 1861ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 2273ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 3148ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 2432ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 2666ms
> [bkit] TRUNCATED HERE — 29 lines omitted. Dropped content was NOT read.
   ✓ bkit runs locate (16)
     ✓ locates CI evidence using prompt saved issue and local precedence 1878ms
     ✓ saves the failed job count without the capstone job 994ms
     ✓ a CI selection keeps the failed job names, capstone left out 1031ms
     ✓ counts the capstone job when it is the only failed job 579ms
     ✓ saves no failed job count when no job failed 659ms
     ✓ filters branch and PR discovery by configured workflow and exact head 728ms
     ✓ freezes explicit workflow run attempt and all failed job pages 836ms
     ✓ validates branch fork ancestor divergent and unavailable ancestry evidence 1709ms
     ✓ distinguishes proven automatic no-red from explicit non-red and unavailable lookup 1506ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ refuses green CI when dev advanced beyond the validated code head 1229ms
     ✓ does not let bookkeeping or a CI override waive stale dev ancestry 1651ms
     ✓ checks the named repository base and fails closed on missing evidence 860ms
     ✓ refuses stale or missing MCP base evidence despite green CI without gh 755ms
     ✓ rejects MCP green runs from another repository or workflow at the same head 788ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
       ✓ bookkeeping-only commits on a green head pass without CI at the head 532ms
       ✓ a source change past the validated head refuses (17) and names the path 439ms
       ✓ the validated sha's own CI still has to be green (failed -> 12) 503ms
       ✓ --validated without --month / --fid is a usage error (2) 397ms
       ✓ a validated sha that is not an ancestor refuses (17) 495ms
   ✓ bkit runs mirror (18)
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 479ms
     ✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 1100ms
     ✓ a failed re-trigger push names the cause in the log 979ms
     ✓ a failed re-trigger push never piles up commits: the re-run pushes the same re-trigger commit 1385ms
     ✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 1765ms
     ✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 885ms
     ✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 449ms
     ✓ gh-error: every poll errored 412ms
     ✓ retrigger-suppressed maps to unresolved only, never no-ci 901ms
     ✓ a re-poll that only errored is gh-error, not a no-ci pass 867ms
     ✓ a blocked sleep hands the poll to the agent (81); the turn loop's recorded find resumes as dispatched 583ms
     ✓ a turn loop that saw no run goes on to the same self-heal, not straight to unresolved 1089ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ CLI: --poll-result=found is not a dispatch flag: a turn loop records what it saw with runs handoff 362ms
     ✓ CLI: --attempts=3 is not a dispatch flag: a turn loop records what it saw with runs handoff 340ms
     ✓ CLI: --all-errored is not a dispatch flag: a turn loop records what it saw with runs handoff 367ms
     ✓ CLI: --retriggered is not a dispatch flag: a turn loop records what it saw with runs handoff 393ms
   ✓ bkit runs dispatch on dev (a debug run in place) (8)
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ re-trigger on dev with a record never commits a foreign staged path 1481ms
     ✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 1489ms
     ✓ re-trigger on dev without a record commits and pushes nothing, and hands off to the Failure Path 611ms
     ✓ re-trigger on dev only uses the record of its own FID 716ms
     ✓ dispatch --sha=abc1234 is refused: the CI run is matched on the full 40-hex sha 786ms
> [bkit] TRUNCATED HERE — 10 lines omitted. Dropped content was NOT read.
     ✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 303ms
   ✓ bkit runs context (21)
     ✓ prints ref (#N on GitHub) and the labels the engine reads; a failed read is null 473ms
     ✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 323ms
     ✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 345ms
     ✓ CI falls back to the feat/{FID} branch when the body has no marker 366ms
     ✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 436ms
     ✓ debug: a green test run beside a failed run of another workflow yields no run (8) 670ms
     ✓ debug: the failed test run behind a newer run of another workflow is returned 812ms
     ✓ debug: a failure test run is a failed run 753ms
     ✓ debug: a timed_out test run is a failed run 770ms
     ✓ debug: a startup_failure test run is a failed run 738ms
     ✓ debug: a test run still in progress or cancelled is not returned 703ms
     ✓ ship: the test workflow's run is returned, not an unrelated workflow's run listed first 841ms
     ✓ ship: no run of the test workflow at the head exits 8 and names the workflow and commit 725ms
     ✓ debug with no declared test workflow: a green run is not returned, a failed one is 1421ms
     ✓ runs context refuses an issue-less marker and branch naming the missing issue 444ms
   ✓ bkit runs dispatch — the verdict row and the close transport (4)
     ✓ writes the step's row with its ciDispatch verdict, then the close-transport row 611ms
     ✓ --step=build-close-workflow appends a newer outcome row with the dispatch added to ci 623ms
     ✓ --step=build-close-workflow with an unresolved dispatch restates the outcome as close-failed 637ms
     ✓ --file and --step go together 546ms
   ✓ bkit runs handoff (10)
     ✓ derives handoff decisions from persisted poll observations and target identity 2941ms
     ✓ the gate and runs handoff reach the same verdict: poll, a run found 537ms
     ✓ the gate and runs handoff reach the same verdict: poll, every poll errored 608ms
     ✓ the gate and runs handoff reach the same verdict: poll, no run on a suppressed head 600ms
     ✓ the gate and runs handoff reach the same verdict: repoll, a run found 779ms
     ✓ the gate and runs handoff reach the same verdict: repoll, every re-poll errored 671ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and no CI declared 719ms
     ✓ the gate and runs handoff reach the same verdict: repoll, no run and CI declared 712ms
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
     ✓ --tracker=linear --auto=cursor exits 0 and writes bkit.tracker.default=linear (matching pair) 952ms
   ✓ #252 — install requires ≥1 module flag; check/upgrade take none (14)
     ✓ bare `bkit install` errors (≥1 module flag required) 418ms
     ✓ bare `bkit` (no command) prints usage and exits 2 (usage error) 455ms
     ✓ explicit `bkit help` prints the same usage and exits 0 416ms
     ✓ `bkit check --claude` (stray module flag) errors 423ms
     ✓ `bkit upgrade --claude` (stray module flag) errors 440ms
     ✓ `bkit install --claude` ships root CLAUDE.md (redirect) 1028ms
     ✓ `bkit install --cursor` (no claude) ships NO CLAUDE.md, but ships AGENTS.md (core) 1095ms
> [bkit] TRUNCATED HERE — 94 lines omitted. Dropped content was NOT read.
     ✓ runs local gates only after current-generation remediation or soak 1024ms
   ✓ bkit tests run (14)
     ✓ a gate exiting 75 with no status file is a gate failure, not a lock wait 360ms
     ✓ a tests-lock refusal in the status file exits 4 with no verdict 350ms
     ✓ tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2 352ms
     ✓ PASS: runs the gate through the package runner, saves stdout and stderr to the log 353ms
     ✓ FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none) 354ms
     ✓ exit 127 from the gate could not run: exit 4, verdict null, never FAIL (#498) 349ms
     ✓ exit 126 from the gate could not run: exit 4, verdict null, never FAIL (#498) 359ms
     ✓ runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd 309ms
     ✓ --tail bounds the echoed lines; --tail=0 echoes none 555ms
   ✓ bkit tests run — failures from JUnit reports (6)
     ✓ sums failing and erroring cases across every XML file in the report folder; skipped never counts 370ms
     ✓ FAIL with no report: failures null and a hint naming the folder, never a guessed count 392ms
     ✓ FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests) 387ms
     ✓ PASS is 0 failures with or without reports 541ms
     ✓ clears a previous attempt's reports before the gate runs 377ms
     ✓ hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR 357ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ exit 5 when the artifact cannot be written; the verdict is still printed 376ms
   ✓ bkit tests run --file (9)
     ✓ appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict 967ms
     ✓ a run stopped at the tests-lock hold limit exits 4 and writes a row with no verdict, never a FAIL 567ms
     ✓ numbers runs within the workflow's active run and per step 1336ms
     ✓ tests run --file records the tested snapshot on its test-run row 523ms
     ✓ a FAIL test-run row records each failing case as file and name 728ms
     ✓ a PASS test-run row records no failed tests 1029ms
     ✓ failedTests keeps at most 100 sorted names and sets failedTestsTruncated 484ms
     ✓ without --file no row is written and the output carries row null 747ms
   ✓ bkit tests run --changed-since (17)
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ the nothing-to-run row records the tested snapshot 381ms
     ✓ --since-pass-of tests only the files that differ from the newest passing run's snapshot 1284ms
     ✓ --since-pass-of skips failing runs and steps it does not name 1453ms
     ✓ --since-pass-of falls back to --changed-since with no passing run 984ms
     ✓ --since-pass-of falls back to --changed-since when the snapshot is gone 752ms
     ✓ changed-since counts failures from the changed gate's JUnit reports 784ms
     ✓ a change that only deletes a file runs the gate on the files that mention it 867ms
     ✓ a deleted file that no file mentions passes and the log says so 428ms
     ✓ a failed importer search runs the whole check 745ms
     ✓ --changed-since=feature-base starts at the feature's start commit 826ms
     ✓ changed-since on a tests-lock wait exits 81 with no row and reports lockHolder 806ms
   ✓ bkit tests run — push-gate receipt (7)
     ✓ a passing required push gate records a receipt 626ms
     ✓ a passing required push gate with only bookkeeping uncommitted records a receipt 573ms
     ✓ a failing required push gate leaves the failed marker 563ms
     ✓ uncommitted code blocks the receipt until it is committed 832ms
     ✓ a staged rename of code into a bookkeeping path records no receipt 570ms
> [bkit] TRUNCATED HERE — 4 lines omitted. Dropped content was NOT read.
     ✓ a planned test that passes is a vacuous gap, exit 1 668ms
     ✓ a planned test absent from a loaded report is a missing gap 674ms
     ✓ a file that fails to load is a red of kind red-not-loaded 825ms
     ✓ a PASSES line in the writer's log turns a passing test into passed-accepted 711ms
     ✓ a planned test file failing bkit:lint:file is a lint gap, and the file is not run 710ms
     ✓ an undeclared bkit:lint:file is noted, and the red still runs 416ms
     ✓ a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4 429ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
       ✓ an update that only adds lines to the test is additive, and the report says no expectation was dropped 613ms
     ✓ takeover (5)
       ✓ tests red records a failing takeover as red with from 539ms
       ✓ tests red records a passing build-written takeover as taken-over over a PASSES line 546ms
       ✓ tests red records a passing pre-run takeover as updated against the run start 701ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ green with no gaps prints verdict PASS and an empty gaps 491ms
     ✓ green prints a verdict and a fixable per gap: every gap fixable is CONCERNS 645ms
     ✓ green folds a multi-line failure message onto its gap line, so a ## line never ends the Gaps section 479ms
     ✓ green: lists each gap kind, with the runner output 890ms
     ✓ test exceptions (3)
       ✓ green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green 1102ms
       ✓ green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL 316ms
stdout | .bkit/core/engine/install/modules/index.integration.test.ts
[test] core: .bkit/allowlist.json
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 13 lines omitted. Dropped content was NOT read.
[bkit-install] core: scripts/slop/bkit-slop-type-suppression.mjs left unchanged (the copy differs from the shipped version); merge the corrected .bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs by hand to avoid false skip/focus findings in inert text
[bkit-install] core: scripts/ci/bkit-machine-lock.sh left unchanged (the copy differs from the shipped version); merge .bkit/templates/scripts/ci/bkit-machine-lock.sh by hand, until then waiting runs take the lock out of arrival order
[bkit-install] core: scripts/ci/bkit-machine-lock.sh left unchanged (the copy never writes LOCAL_STACK_LOCK_STATUS_FILE); merge .bkit/templates/scripts/ci/bkit-machine-lock.sh by hand, until then a lock wait that gives up reads as a gate failure (exit 1) instead of exit 81
[bkit-install] core: scripts/ci/bkit-machine-lock.sh left unchanged (the copy has no LOCAL_STACK_LOCK_HOLD_S hold limit); merge .bkit/templates/scripts/ci/bkit-machine-lock.sh by hand, until then a hung run holds the tests lock until someone stops it by hand

> [bkit] TRUNCATED HERE — 24 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 161 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 131 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/commands/ci/ci.test.ts (81 tests) 29606ms
   ✓ bkit ci slop — gate decision (7)
     ✓ fails on a net-new finding, prints the guidance, and removes the base worktree 556ms
     ✓ names each net-new and worsened finding in the log and the JSON 595ms
     ✓ fails on a net score rise with no net count change 630ms
     ✓ passes a pre-existing finding that only moved: added and resolved net to zero (#226) 615ms
     ✓ treats a net score at or below 0.001 as float noise 615ms
> [bkit] TRUNCATED HERE — 3 lines omitted. Dropped content was NOT read.
     ✓ reads $SLOP_BASE_REF when --base is not given, and --base wins over it 623ms
     ✓ defaults to the merge-base with origin/dev, then origin/main, then HEAD~1 407ms
   ✓ bkit ci slop — slop-scan failures (6)
     ✓ exits 4 when slop-scan fails, logs its stderr, and still removes the worktree 593ms
     ✓ exits 3, not as a gate failure, when slop-scan could not run (126 / 127) 546ms
     ✓ exits 4 on a dropped net field instead of silently passing 521ms
     ✓ exits 4 on no summary instead of silently passing 533ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ reads a report far larger than a pipe buffer from a slop-scan that exits straight after writing 792ms
   ✓ bkit ci slop — real slop-scan (4)
     ✓ a genuinely new finding fails the gate 756ms
     ✓ names the file and rule when a per-file finding's count grows (score rise, flat count) 734ms
     ✓ an unchanged tree nets to zero and passes — and every gated summary field is present 792ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ explicit globs can select ignored prose and nested checkout files 426ms
     ✓ runs vale on exactly the selected files and passes on its exit 0 339ms
     ✓ fails (exit 1) when vale reports alerts 370ms
     ✓ exits 6 on a vale runtime error 371ms
   ✓ bkit ci prose — write-good restore (3)
     ✓ copies write-good from the main worktree into a linked one, without vale sync 406ms
     ✓ falls back to vale sync when the main worktree has none 363ms
     ✓ fails when vale sync cannot restore the required styles 363ms
   ✓ bkit ci skip-token (3)
     ✓ exits 0 with the token when HEAD's message carries one, in subject or body 377ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ exits 0 when every changed file is a plan log or a ledger 317ms
     ✓ exits 1 naming the files outside, whatever the commit message says 319ms
     ✓ checks every --ref: one code ref among min-push refs fails the push 574ms
     ✓ measures from the merge-base, so earlier code commits on the branch count 395ms
     ✓ the floor is ship's pr allow-list plus the plans tree, and an explicit [] keeps it 303ms
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
   ✓ test-round completion evidence (3)
     ✓ finishes validated CI evidence rounds without local clamp records 472ms
     ✓ finishes a CI round only with its own failed job count 460ms
   ✓ bkit steps done (24)
     ✓ captures parentSha first, writes the row, then commits on top of it 333ms
     ✓ --attempt=next advances with each row, so the next parentSha differs 400ms
     ✓ reports a failed commit with exit 8 without writing the row 453ms
     ✓ a failed commit leaves no row staged in the index 663ms
     ✓ a failed commit restores an already-staged status.jsonl to its pre-attempt index entry 782ms
     ✓ a failed commit keeps a caller-staged path that a bracketed new path glob-matches 691ms
     ✓ a failed commit whose status.jsonl gained another writer's row does not report nothing written 666ms
     ✓ a failed first-row commit keeps a row another writer appended during the commit 700ms
     ✓ a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index 762ms
   ✓ bkit steps gate (8)
     ✓ --ref reads the status file as committed on that ref, not from disk 312ms
     ✓ --ref exits 3 when the ref does not carry the status file 307ms
   ✓ bkit steps gate checks attempt / strategy / scope where the step writes them (8)
     ✓ fails a run-tests row missing its scope, and an empty scope 363ms
   ✓ bkit steps finish (17)
     ✓ reads the agent's header, derives the attempt, writes and commits the row, prints the comment 400ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ posts, records the engine-action row before the step row, and commits both 482ms
     ✓ a re-run of the same step and body is deduped: nothing posted again 821ms
     ✓ a failed post keeps the exit code and prints done false; the row still lands 494ms
   ✓ bkit steps gate — placeholders, FID, derived attempt (10)
     ✓ --issue (7)
> [bkit] TRUNCATED HERE — 53 lines omitted. Dropped content was NOT read.
   ✓ Debug CI evidence sequence (8)
     ✓ finishes local-only rounds through the actual Debug Step 3 commands 9268ms
     ✓ records the failed job count and reads an uncounted local round as unknown 6456ms
     ✓ finishes replacement CI evidence with the unchanged debug run number 4312ms
     ✓ finishes the first CI evidence round of the second debug run 2597ms
> [bkit] TRUNCATED HERE — 51 lines omitted. Dropped content was NOT read.
     ✓ tests run exits 4 naming the queue folder when a regular file blocks it 848ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 897ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 920ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1019ms
   ✓ bkit tests jump (3)
> [bkit] TRUNCATED HERE — 16 lines omitted. Dropped content was NOT read.
     ✓ prMarker writes a FID-only marker with github wired and no issue 752ms
     ✓ exits 3 when the branch already has an open PR, and reuses it with --existing=reuse 489ms
     ✓ retries a failed create once, and exits 5 when it fails twice 1174ms
     ✓ exits 5 when the open-PR probe errors 678ms
     ✓ exits 80 with the title and body when gh needs auth (exit 4) or is missing 401ms
     ✓ prs open still opens against any other base 328ms
> [bkit] TRUNCATED HERE — 9 lines omitted. Dropped content was NOT read.
     ✓ --number reads one PR, mergeable included 325ms
     ✓ reports a CI-suppressing token in the title, any spelling, else null 449ms
     ✓ exits 4 when gh errors and 80 when it needs auth 407ms
   ✓ bkit prs merge ship retry (4)
     ✓ classifies a refused merge whose pinned head moved as revalidation 375ms
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
     ✓ takes an explicit --subject 686ms
     ✓ runs no merge when the PR is already MERGED 506ms
     ✓ reports a merge that did not land as FAIL, and --expect-merged exits 7 620ms
     ✓ prs merge refuses a PR whose base is main 719ms
     ✓ prs merge fails loudly when the base changed between the check and the merge 887ms
     ✓ prs merge refuses when the PR base is unknown 840ms
     ✓ prs merge reads the base from the one pr view it already makes 1150ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ asks gh to refresh the PR head server-side 718ms
     ✓ exits 80 when gh needs auth, and logs the MCP tool for the fallback 663ms
     ✓ exits 5 when gh fails, naming the 403 scope hint 694ms
     ✓ never reads dev's required checks without --only-if-required 894ms
   ✓ bkit prs update-branch --only-if-required (6)
> [bkit] TRUNCATED HERE — 6 lines omitted. Dropped content was NOT read.
   ✓ bkit prs checks (7)
     ✓ is green when every check finished successfully 958ms
     ✓ counts a cancelled, action-required or stale check apart from failed, and not green 875ms
     ✓ is not green when a check failed, naming it (exit 1) 711ms
     ✓ counts an unfinished check run and a PENDING commit status as pending 892ms
     ✓ is not green on an empty rollup (total 0) 926ms
     ✓ treats NEUTRAL and SKIPPED conclusions as passing 929ms
     ✓ exits 4 when gh errors, 80 when it needs auth, 2 on a bad --number 858ms
   ✓ bkit prs verbose-ci (4)
     ✓ adds the marker to the title 626ms
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
     ✓ gh exit 1 (gh: Not Found (HTTP 404)) -> not-found 1481ms
     ✓ gh exit 1 (gh: Bad credentials (HTTP 401)) -> auth 655ms
     ✓ gh exit 1 (error connecting to api.github.com) -> network 790ms
     ✓ gh exit 4 (To get started with GitHub CLI, please run:  gh auth login) -> auth 354ms
     ✓ fetches the issue and its comments as GitHub returns them 669ms
> [bkit] TRUNCATED HERE — 5 lines omitted. Dropped content was NOT read.
     ✓ reuses matching invocation state without adopting foreign ownership 742ms
     ✓ invalidates missing corrupt and unsupported progress cache 1325ms
     ✓ contains cache read and write failures as standalone degradation 744ms
     ✓ uses legacy receipts and contains receipt failures 966ms
     ✓ records an engine-action row and skips the same key + body on a re-run 769ms
     ✓ a recent identical comment counts as done (the final close comment) 833ms
     ✓ a failed post reports done false with the reason and never leaks a token 728ms
   ✓ label writes (4)
     ✓ github: reads names; POSTs the added labels as JSON, DELETEs each removed one 966ms
> [bkit] TRUNCATED HERE — 8 lines omitted. Dropped content was NOT read.
     ✓ github: a recent comment carrying the same marker hash is done 654ms
     ✓ a different marker hash posts 416ms
     ✓ a status.jsonl write that fails after the post is done with a warning, never done false 715ms
stdout | .bkit/core/engine/install/modules/core.integration.test.ts > slop plugin migration > replaces the exact shipped copy and records the same unhashed write in dry run
[bkit-install] [dry-run] core: .bkit/authoring.md
> [bkit] TRUNCATED HERE — 387 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 157 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 154 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 156 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] [dry-run] core: docs/templates/bkit-audit-documentation.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-duplication.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-failures.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-flakes.md
[bkit-install] [dry-run] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 151 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 153 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 159 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 169 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 205 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 171 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 175 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 453 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 158 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 34 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-install] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-install] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-install] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 36 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 37 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 138 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 48 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-build-plan-verify.toml
[bkit-install] write: .codex/agents/bkit-debug-abort-handover.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-diagnose.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-remediate.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-reproduce.toml
[bkit-install] write: .codex/agents/bkit-debug-failure-soak.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-1.toml
[bkit-install] write: .codex/agents/bkit-design-brainstorm-ideate-2.toml
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .codex/agents/bkit-utility-update-deferrals.toml
[bkit-install] write: .codex/agents/bkit-utility-update-documentation.toml
[bkit-install] write: .codex/agents/bkit-utility-update-failures.toml
[bkit-install] write: .codex/agents/bkit-utility-update-knowledge.toml
[bkit-install] write: .codex/agents/bkit-utility-update-roadmap.toml
> [bkit] TRUNCATED HERE — 22 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 55 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 25 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-build-plan-verify.md
[bkit-install] write: .cursor/agents/bkit-debug-abort-handover.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .cursor/agents/bkit-debug-failure-soak.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .cursor/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .cursor/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .cursor/agents/bkit-utility-update-documentation.md
[bkit-install] write: .cursor/agents/bkit-utility-update-failures.md
[bkit-install] write: .cursor/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .cursor/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 19 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-build-plan-verify.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-abort-handover.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-debug-failure-soak.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-documentation.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-failures.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 45 lines omitted. Dropped content was NOT read.
[bkit-install] core: docs/templates/bkit-audit-documentation.md
[bkit-install] core: docs/templates/bkit-audit-duplication.md
[bkit-install] core: docs/templates/bkit-audit-failures.md
[bkit-install] core: docs/templates/bkit-audit-flakes.md
[bkit-install] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 144 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-build-plan-verify.md
[bkit-install] write: .claude/agents/bkit-debug-abort-handover.md
[bkit-install] write: .claude/agents/bkit-debug-failure-diagnose.md
[bkit-install] write: .claude/agents/bkit-debug-failure-remediate.md
[bkit-install] write: .claude/agents/bkit-debug-failure-reproduce.md
[bkit-install] write: .claude/agents/bkit-debug-failure-soak.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-1.md
[bkit-install] write: .claude/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-install] write: .claude/agents/bkit-utility-update-deferrals.md
[bkit-install] write: .claude/agents/bkit-utility-update-documentation.md
[bkit-install] write: .claude/agents/bkit-utility-update-failures.md
[bkit-install] write: .claude/agents/bkit-utility-update-knowledge.md
[bkit-install] write: .claude/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 31 lines omitted. Dropped content was NOT read.
pulling
db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'db' failed (non-blocking): db unavailable: 3 GB free, needs 10 GB
[cloud-setup] provision 'cli' failed (non-blocking): exit 1
[cloud-setup] UNAVAILABLE in this environment: db, cli. Their setup failed: treat them as absent and do not retry the install.
 ✓ .bkit/core/engine/ledgers/journal.integration.test.ts (23 tests) 22429ms
   ✓ the dispatch seam on a real worktree (7)
> [bkit] TRUNCATED HERE — 40 lines omitted. Dropped content was NOT read.
   ✓ bkit tests base (18)
     ✓ reports all from a local run at the merge-base 804ms
     ✓ a failing file absent at the base commit is the branch's 536ms
     ✓ an undeclared bkit:test:file reads unknown 504ms
     ✓ a failed base install reads unknown and removes the worktree 502ms
     ✓ installs at base with --frozen-lockfile --prefer-offline 645ms
     ✓ copies the worktreeCopy entries into the base checkout 652ms
> [bkit] TRUNCATED HERE — 2 lines omitted. Dropped content was NOT read.
     ✓ a CI run that cannot settle the base falls back to the local run 3488ms
     ✓ a pull_request-event CI run at the base sha does not settle none 626ms
     ✓ a base file run that exits non-zero without the failing case reads unknown 621ms
     ✓ a case skipped at the base commit reads unknown, not the branch's 628ms
     ✓ the base test run does not inherit the hooks-off git config 616ms
> [bkit] TRUNCATED HERE — 39 lines omitted. Dropped content was NOT read.
     ✓ builds the runtime-resolved row; runtimeGithubCli round-trips through it 536ms
     ✓ carries --base-sha; stamps the row now in whole UTC seconds 794ms
     ✓ a backslash or quote in the gh error stays valid JSON, verbatim (regression) 734ms
     ✓ --file appends one line per call, so the ledger stays NDJSON 737ms
     ✓ --file into a missing directory is refused, not created 352ms
> [bkit] TRUNCATED HERE — 380 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-build-plan-verify.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-abort-handover.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-diagnose.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-remediate.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-reproduce.md
[bkit-uninstall] write: .opencode/agents/bkit-debug-failure-soak.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-1.md
[bkit-uninstall] write: .opencode/agents/bkit-design-brainstorm-ideate-2.md
> [bkit] TRUNCATED HERE — 17 lines omitted. Dropped content was NOT read.
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-deferrals.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-documentation.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-failures.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-knowledge.md
[bkit-uninstall] write: .opencode/agents/bkit-utility-update-roadmap.md
> [bkit] TRUNCATED HERE — 42 lines omitted. Dropped content was NOT read.
   ✓ Step 6 SHIPPED row via bkit roadmap feature --strict (#380, matrix row 10) (3)
     ✓ exits 0, and the SHIPPED row lands in the worktree ledger (not the cwd) 786ms
     ✓ stops the step when the ledger could not be written (fail-open append, appended=false) 559ms
     ✓ stops the step when the command crashed or was misused 1407ms
   ✓ deferred landing of a held build (ship, matrix: held → landed) (2)
> [bkit] TRUNCATED HERE — 26 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 155 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 163 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 173 lines omitted. Dropped content was NOT read.
[bkit-test] delete: docs/templates/bkit-audit-documentation.md
[bkit-test] delete: docs/templates/bkit-audit-duplication.md
[bkit-test] delete: docs/templates/bkit-audit-failures.md
[bkit-test] delete: docs/templates/bkit-audit-flakes.md
[bkit-test] delete: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 47 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 167 lines omitted. Dropped content was NOT read.
[bkit-test] core: docs/templates/bkit-audit-documentation.md
[bkit-test] core: docs/templates/bkit-audit-duplication.md
[bkit-test] core: docs/templates/bkit-audit-failures.md
[bkit-test] core: docs/templates/bkit-audit-flakes.md
[bkit-test] core: docs/templates/bkit-audit-gates.md
> [bkit] TRUNCATED HERE — 145 lines omitted. Dropped content was NOT read.
     ✓ challenge gate writes a challenge-gate row 540ms
     ✓ challenge gate fetches origin dev first, so dev's own changes do not count 867ms
     ✓ challenge gate measures against the local origin/dev when the fetch fails 327ms
     ✓ challenge gate without --base sizes only the branch's own lines 413ms
 ✓ .bkit/core/engine/commands/workflow/locks.test.ts (26 tests) 3359ms
 ✓ .bkit/core/engine/commands/lib.test.ts (76 tests) 4157ms
   ✓ runGit / runTool output limit (6)
     ✓ bounds a slow child with an optional deadline and classifies timeout 1333ms
     ✓ runGit names ENOBUFS when output passes the limit 749ms
     ✓ runTool reports ENOBUFS as found, with the cause, not as missing from PATH 723ms
> [bkit] TRUNCATED HERE — 38 lines omitted. Dropped content was NOT read.
 ✓ .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts (14 tests) 1573ms
   ✓ bkit-text-ceiling missing folders and a broken record (2)
     ✓ check fails and lower refuses when a text folder is missing or empty 317ms
 ✓ .bkit/core/engine/audits/templates/telemetry-gitattributes.integration.test.ts (18 tests) 242ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > strips only the managed blocks of .agents/context.md and .agents/skills.md, marker included
> [bkit] TRUNCATED HERE — 80 lines omitted. Dropped content was NOT read.
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > deletes the owned docs/templates/bkit-*.md and keeps the consumer's own templates
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] delete: docs/templates/bkit-audit-security.md
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > prunes docs/templates when only bkit's files were in it
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] delete: docs/templates/bkit-plan.md
[bkit-uninstall-test] prune empty dir: docs/templates

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > buildDecisionTable — markered-text format > docs/ > leaves docs/ alone on a targeted (non-core) uninstall, and on a dry run
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
AGENTS.md                                        | skip-absent            | file not found — nothing to do
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do
docs/templates/bkit-plan.md                      | delete                 | bkit-owned docs template — removed on full/core uninstall


 ✓ .bkit/core/engine/audits/repo/ledger-integrity.test.ts (31 tests) 198ms
stdout | .bkit/core/engine/commands/install/uninstall.test.ts > formatDecisionTable — P2.T7 > dry-run snapshot: decision table is printed, nothing deleted
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | strip-block            | json (deep-containment) — strip bkit-owned scope, preserve consumer keys
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do
AGENTS.md                                        | strip-block            | markered-text — strip bkit block, preserve consumer content
.gitignore                                       | skip-absent            | file not found — nothing to do
.gitattributes                                   | skip-absent            | file not found — nothing to do
.bkit/version                                    | skip-absent            | file not found — nothing to do
.bkit/allowlist.json                             | skip-absent            | file not found — nothing to do
.bkit/authoring.md                               | skip-absent            | file not found — nothing to do
.bkit/cloud.md                                   | skip-absent            | file not found — nothing to do
.bkit/cli.md                                     | skip-absent            | file not found — nothing to do
.bkit/comparison.md                              | skip-absent            | file not found — nothing to do
.bkit/install.md                                 | skip-absent            | file not found — nothing to do
.bkit/jsonl.md                                   | skip-absent            | file not found — nothing to do
.bkit/LICENSE.md                                 | skip-absent            | file not found — nothing to do
.bkit/pipeline.md                                | skip-absent            | file not found — nothing to do
.bkit/providers.md                               | skip-absent            | file not found — nothing to do
.bkit/prompts.md                                 | skip-absent            | file not found — nothing to do
.bkit/router.md                                  | skip-absent            | file not found — nothing to do
.bkit/templates.md                               | skip-absent            | file not found — nothing to do
.bkit/trackers.md                                | skip-absent            | file not found — nothing to do
.bkit/workflows.md                               | skip-absent            | file not found — nothing to do
.bkit/README.md                                  | skip-absent            | file not found — nothing to do
.agents/context.md                               | skip-absent            | file not found — nothing to do
.agents/docs.md                                  | skip-absent            | file not found — nothing to do
.agents/rules.md                                 | skip-absent            | file not found — nothing to do
.agents/skills.md                                | skip-absent            | file not found — nothing to do
.agents/shortcuts.md                             | skip-absent            | file not found — nothing to do
.bkit/lite.md                                    | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > strips bkit block from markered-text file, preserving consumer content
[bkit-uninstall-test] strip-block: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > deletes markered-text file when stripping leaves only whitespace
[bkit-uninstall-test] delete (empty after strip): AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves markered-text file when no bkit markers present (100% consumer)
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash unknown
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it))

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > reclaims an unedited owned byte-equal file via canonicalHashes
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — round-trip > preserves byte-equal-text file when hash mismatches (consumer modified)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] preserve: .bkit/.env.example (byte-equal-text: content differs from install-time hash — consumer modified, preserve)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's github entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's linear entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > removes bkit's jira entry and keeps a consumer server and top-level key
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .mcp.json
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's github entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's linear entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — MCP config keeps the consumer's servers > deletes the file when bkit's jira entry was all it held
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .cursor/mcp.json
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes a 100%-bkit markered-text file (residual == shipped scaffold, not a dead husk)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after strip): .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude/hooks
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves a markered-text file when the consumer added content outside the block
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] strip-block: .claude/hooks/bkit-preflight.sh
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json on full uninstall (renders @@sentinel@@ keys before strip-scope)
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > deletes opencode.json holding every provider block and tracker entry earlier installs left
[bkit-uninstall-test] delete (empty after JSON scope strip): .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .opencode

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a github tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a linear tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > keeps a provider block and a jira tracker entry the consumer edited, whole, and their own entries
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — 100%-bkit residual + opencode scope (4.6.2) > preserves opencode.json when the consumer added their own key
[bkit-uninstall-test] strip-json-scope: .opencode/opencode.json
[bkit-uninstall-test] absent: .opencode/plugin/bkit-gateguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-readguard.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-guardrails.js (file not found — nothing to do)
[bkit-uninstall-test] absent: .opencode/plugin/bkit-rules.js (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > deletes .bkit/version on a full/core uninstall (bkit install-state, zero-footprint)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > prunes deleted paths from .bkit/version on a targeted (non-core) uninstall
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete mirror: .claude/agents/bkit-foo.md
[bkit-uninstall-test] prune empty dir: .claude/agents
[bkit-uninstall-test] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > leaves .bkit/version byte-identical on a targeted uninstall that prunes nothing
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > does not rewrite .bkit/version on a targeted dry-run (no writes)
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do

[bkit-uninstall-test] [dry-run] update version pin: .bkit/version (pruned 1)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (github)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (linear)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > strips package.json bkit install-state block on full/core uninstall (jira)
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] package.json: removed bkit install-state block

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (github)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (linear)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .bkit/version install-state (4.6.3) > keeps package.json bkit block on targeted (non-core) uninstall (jira)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > running uninstall twice produces same result (no errors on second run)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — idempotency > strip-block is idempotent: running on already-stripped file no-ops
[bkit-uninstall-test] preserve: AGENTS.md (markered-text but no bkit markers found — 100% consumer content)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — nuke > --nuke --yes deletes all present files without interactive prompt
[bkit-uninstall-test] delete: AGENTS.md
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/version
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .bkit/.env.example
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .bkit
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > strips allow/deny/ask together, including install's WebFetch enrichment
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] delete (empty after JSON scope strip): .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/settings.json leaves no grants behind > preserves a permission the consumer added themselves
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] strip-json-scope: .claude/settings.json
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > deletes .claude/bkit-cloud.md when the claude host is uninstalled
[bkit-uninstall-test] absent: CLAUDE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/settings.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .claude/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .mcp.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/.env.example (file not found — nothing to do)
[bkit-uninstall-test] delete: .claude/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .claude

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
CLAUDE.md                                        | skip-absent            | file not found — nothing to do
.claude/settings.json                            | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.claude/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.mcp.json                                        | skip-absent            | file not found — nothing to do
.bkit/.env.example                               | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .claude/bkit-cloud.md cleanup > leaves .claude/bkit-cloud.md untouched when claude is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > deletes .cursor/bkit-cloud.md when the cursor host is uninstalled
[bkit-uninstall-test] absent: .cursor/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-preflight.sh (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/cli.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/rules/bkit-rules.mdc (file not found — nothing to do)
[bkit-uninstall-test] absent: .cursor/mcp.json (file not found — nothing to do)
[bkit-uninstall-test] delete: .cursor/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .cursor

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
.cursor/hooks.json                               | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-preflight.sh                  | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-guardrails.cjs                | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-gateguard.cjs                 | skip-absent            | file not found — nothing to do
.cursor/hooks/bkit-readguard.cjs                 | skip-absent            | file not found — nothing to do
.cursor/cli.json                                 | skip-absent            | file not found — nothing to do
.cursor/rules/bkit-rules.mdc                     | skip-absent            | file not found — nothing to do
.cursor/mcp.json                                 | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .cursor/bkit-cloud.md cleanup > leaves .cursor/bkit-cloud.md untouched when cursor is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > deletes .codex/bkit-cloud.md when the codex host is uninstalled
[bkit-uninstall-test] absent: .codex/hooks.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-gateguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-readguard.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-guardrails.cjs (file not found — nothing to do)
[bkit-uninstall-test] absent: .codex/hooks/bkit-rules.cjs (file not found — nothing to do)
[bkit-uninstall-test] delete: .codex/bkit-cloud.md (generated cloud setup doc)
[bkit-uninstall-test] prune empty dir: .codex

stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > dry-run reports the deletion but leaves the file on disk
[bkit-uninstall-test] [dry-run] Decision table:
FILE                                             | DECISION               | REASON
-------------------------------------------------+------------------------+-----------------------------------------
.codex/hooks.json                                | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-gateguard.cjs                  | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-readguard.cjs                  | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-guardrails.cjs                 | skip-absent            | file not found — nothing to do
.codex/hooks/bkit-rules.cjs                      | skip-absent            | file not found — nothing to do


stdout | .bkit/core/engine/commands/install/uninstall.test.ts > runUninstall — .codex/bkit-cloud.md cleanup > leaves .codex/bkit-cloud.md untouched when codex is NOT in the uninstall set
[bkit-uninstall-test] absent: AGENTS.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitignore (file not found — nothing to do)
[bkit-uninstall-test] absent: .gitattributes (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/version (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/allowlist.json (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/authoring.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cloud.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/cli.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/comparison.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/install.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/jsonl.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/LICENSE.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/pipeline.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/providers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/prompts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/router.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/templates.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/trackers.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/workflows.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/README.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/context.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/docs.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/rules.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/skills.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .agents/shortcuts.md (file not found — nothing to do)
[bkit-uninstall-test] absent: .bkit/lite.md (file not found — nothing to do)

 ✓ .bkit/core/engine/commands/install/uninstall.test.ts (93 tests) 199ms
 ✓ .bkit/core/engine/audits/workflows/workflow-shape.test.ts (326 tests) 337ms
stdout | .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent
[bkit-install] skip: docs/security.md — .agents/docs.md already lists engineering/security.md for this topic, so no row was added. Add a row by hand if both documents matter.

 ✓ .bkit/core/engine/checks/after/tools.test.ts (63 tests) 177ms
 ✓ .bkit/core/engine/commands/workflow/completeness.test.ts (6 tests) 243ms
 ✓ .bkit/core/engine/audits/hooks/gateguard-opencode.test.ts (57 tests) 161ms
 ✓ .bkit/core/engine/ledgers/migrate.test.ts (11 tests) 126ms
(node:93141) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ CLOUD_RUNNER }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:93141) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ DEFAULT_BRANCH }". Set mapAsMap: true to use object keys.
 ✓ .bkit/core/engine/audits/repo/dogfood-templates.test.ts (79 tests) 93ms
 ✓ .bkit/core/engine/audits/templates/templates.test.ts (253 tests) 126ms
stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > migrates the wrapper and registers a row, then repeats as a no-op
[bkit-install] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] register: docs/noise.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > writes nothing on a dry run
[bkit-install] [dry-run] migrate: docs/noise.md — removed the bkit ownership wrapper, now a project document (text inside and outside the wrapper kept)
[bkit-install] [dry-run] register: docs/noise.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > keeps an ambiguous wrapper and reports it
[bkit-install] docs/noise.md: left as it is — one of `bkit:start` / `bkit:end` is missing, so bkit cannot tell its wrapper from your text. Delete any `bkit:start` / `bkit:end` / `bkit:managed` lines by hand; the file is yours.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row when an indexed equivalent covers the topic
[bkit-install] skip: docs/noise.md — .agents/docs.md already lists docs/other/noise.md for this topic, so no row was added. Add a row by hand if both documents matter.

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > reports instead of throwing when docs is a regular file
[bkit-install] docs/architecture.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/technology.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/security.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/data-schema.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/testing.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/deployments.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/observability.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/design.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/noise.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.
[bkit-install] docs/setup.md: skipped — it could not be inspected (ENOTDIR). bkit neither reads nor indexes it.

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > registers a present default doc when its only equivalent row points at a missing file
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stdout | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > syncProjectDocs registers a present docs/{topic}.md beside a Not equivalent row
[bkit-install] register: docs/security.md in .agents/docs.md (Project Documents)

stderr | .bkit/core/engine/install/project-docs.test.ts > syncProjectDocs > adds no row and reports a problem when the index has a row it cannot read
[bkit-install] .agents/docs.md: not edited — .agents/docs.md has a Project Documents row bkit cannot read (| **docs/noise.md** | Noise |), so it may already list the document. Add a row for the project documents you copied under a `## Project Documents` table below `<!-- bkit:end -->` by hand.

 ✓ .bkit/core/engine/install/project-docs.test.ts (38 tests) 73ms
 ✓ .bkit/core/engine/ledgers/status.test.ts (20 tests) 128ms
 ✓ .bkit/core/engine/audits/workflows/counter-prose-audit.test.ts (71 tests) 110ms
stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when model lookup missing for name
[bkit-install] Missing model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > T3 — subagent frontmatter rewrite > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when model lookup missing for name
[bkit-install] Missing opencode model lookup for unknown-agent

stderr | .bkit/core/engine/render/hosts.test.ts > applyOpencodeAgent > exits non-zero when frontmatter is missing the `name` field
[bkit-install] Subagent frontmatter missing 'name' field

stderr | .bkit/core/engine/render/hosts.test.ts > applyAntigravityPrompt > exits non-zero when the Google model lookup is missing
[bkit-install] Missing antigravity model lookup for nope

 ✓ .bkit/core/engine/render/hosts.test.ts (137 tests) 69ms
 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (73 tests) 76ms
 ✓ .bkit/core/engine/checks/after/managed.test.ts (18 tests) 66ms
 ✓ .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts (39 tests) 66ms
 ✓ .bkit/core/engine/install/manifest.test.ts (50 tests) 47ms
 ✓ .bkit/core/engine/checks/before/repo.test.ts (27 tests) 62ms
 ✓ .bkit/core/engine/commands/workflow/summary.test.ts (75 tests) 59ms
 ✓ .bkit/core/engine/commands/analysis.test.ts (35 tests) 41ms
 ✓ .bkit/core/engine/install/version-file.test.ts (40 tests) 30ms
 ✓ .bkit/core/engine/ledgers/compact.test.ts (18 tests) 27ms
 ✓ .bkit/core/engine/commands/workflow/workflows.integration.test.ts (1 test) 50ms
 ✓ .bkit/core/engine/commands/workflow/plan-blocks.test.ts (31 tests) 18ms
 ✓ .bkit/core/engine/audits/repo/rules-sync.test.ts (7 tests) 8ms
 ✓ .bkit/core/engine/audits/repo/package-json.test.ts (9 tests) 6ms

 Test Files  83 passed (83)
      Tests  6662 passed (6662)
   Start at  09:47:32
   Duration  455.62s (tests 99%)

JUNIT report written to /Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/1028-gate-fails-workflow/build-holistic-gate-2.log.reports/vitest-22694.xml

[bkit:gate:changed] named: node --test --test-timeout=180000 --test-force-exit scripts/gate/bkit-gate-changed.test.mjs
✔ format skips a changed symlink instead of failing on it (779.253667ms)
✔ format still fails a changed regular file prettier would rewrite (921.828583ms)
✔ passes the limit args to the node --test stage (901.311792ms)
✔ a changed workflow or prompt file runs the text ceiling test (11510.836084ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14178.090959

[bkit:gate:changed] named: bats tests/shell/bkit-status-holes-sweep.bats
1..2
ok 1 the sweep prints the summary line the lane greps for
ok 2 the lane's grep pattern rejects output without the summary line

[bkit:gate:changed] lint: oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts

[bkit:gate:changed] format: prettier --check --ignore-unknown .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts .bkit/friction.jsonl docs/deferrals.jsonl docs/plans/202611/1028-gate-fails-workflow-plan.md docs/plans/202611/logs/1028-gate-fails-workflow/build-brief-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-brief-tests-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-challenge-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-challenge-2.md docs/plans/202611/logs/1028-gate-fails-workflow/build-decision-3-3.md docs/plans/202611/logs/1028-gate-fails-workflow/build-diff-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-holistic-gate-3-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-check.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-tasks-4-log.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-tests-4-log.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-verify-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-plan-verify-holistic-3-2.md docs/plans/202611/logs/1028-gate-fails-workflow/build-tests-green-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/build-tests-red-4-1.md docs/plans/202611/logs/1028-gate-fails-workflow/status.jsonl docs/testing.md scripts/gate/bkit-gate-changed.mjs scripts/gate/bkit-gate-changed.test.mjs
Checking formatting...
All matched files use Prettier code style!

[bkit:gate:changed] types: pnpm typecheck

> @cbartens/bkit@6.2.0 typecheck /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> tsc --noEmit && pnpm bkit:typecheck:tests


> @cbartens/bkit@6.2.0 bkit:typecheck:tests /Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow
> tsc -p tsconfig.test.json


[bkit:gate:changed] every stage passed
> [bkit] 1 over-long line was shortened; it says so inline.
> [bkit] TRUNCATED — kept 2896 of 18970 lines (226 KB of 1.3 MB); the rest is NOT in this file, re-run the source to see it.
> Dropped content was NOT read. Its absence is not evidence.
