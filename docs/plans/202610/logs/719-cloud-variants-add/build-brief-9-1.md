# Brief: group 9 — Mirrors and full verification

Plan: Cloud variants — `--auto=codex` and any wired tracker (#719) Implementation Plan

## Why and what

### Context & Goals

**Workstreams:** `[]` → whole parent design `docs/plans/202610/719-cloud-variants-add-design.md` (WS-1..WS-8; design plans P-1 + P-2 in one plan). Build order follows the design's `Requires`: WS-1 → WS-2 → WS-3; WS-4 → WS-5 → WS-6; WS-7 after WS-3 / WS-4 / WS-5; WS-8 last. WS-6 (bkit's adopted router copy) lands inside every task that edits the template, so `dogfood-templates.test.ts` never goes red between tasks. No external workstream or plan prerequisite.

**Owner answers (settled, `docs/decisions.jsonl` on local `dev`):** `719-cloud-kill-switch-one-bkit-path`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`, `719-tracker-guard-no-issue-id-not-verified`, `719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-cloud-router-issue-id-via-workflow-fids-parse`, `719-linear-jira-router-read-fixture-tests-only`, `719-cursor-jira-guard-hard-stop-without-bkit-bin`. Each overrides the design text it answers (design Q5-Q7 defaults are stale).

**Problem:** `--auto` cannot record `codex` (`CLOUD_MODES`, `manifest.ts:104`); `validateCloudTrackerMatch` (`install.ts:123-138`) pairs claude / opencode with github and cursor with linear; `bkit-cloud.yml` no-ops off github (`:188-194`) and reads `bkit:auto` with `gh issue view` (`:341`, `:424`); its YAML FID regex rejects Jira keys with digits; advisories, checks and `.bkit/cloud.md` hard-code one tracker and `ANTHROPIC_API_KEY`; the SessionStart guard reads Linear only, by state name.

**Goals:**

- `codex` cloud variant; every variant installs with any wired tracker; `none` still refuses.
- Router: tracker-agnostic `bkit:auto` gate through `bkit fids parse` + `bkit issues fetch` from the consumer's own bkit; distinct fail-closed outcomes in log + job summary; only the `bkit.cloud.agent` job starts; every router secret under its `BKIT_` name; new `codex` job on `openai/codex-action`.
- Session guard for Cursor background + issue-carrying Claude sessions on GitHub, Linear and Jira, terminal by state category (new `terminal` fact).
- Detect-only advisories for stale adopted routers and renamed secrets; per-variant checks / tips; docs + ledgers current.

**Non-goals (issue § Constraints and non-goals):** new tracker values; marker contract (`.bkit/trackers.md` § Marker contract); installing vendor-native triggers (`@claude` / `@cursor` / `@Codex`, Cursor's Linear integration, Codex for Linear) — documented only; code host stays GitHub.

**Related Issues:**

- #717 — Codex cloud doc + tracker-agnostic cloud docs (closed)
- #720 — AGENTS.md router stops every ordinary Codex prompt (closed)
- #495 — Pre-approve listed MCP servers on every agent host (closed)
- #141 — bkit-cloud: GitHub issue-label trigger for design/plan/build (closed)
- #397 — bkit-cloud concurrency: global ship lock, FID arbitration (open)

---

### Narrative

A team picks whichever cloud agent they like (Claude, opencode, Codex or Cursor) and whichever tracker they already use (GitHub, Linear or Jira). `bkit install --auto=<agent>` works for that pairing, and from then on a passing or failing CI run on an opted-in feature hands the work to their agent exactly as Claude + GitHub does today. Removing `bkit:auto` from the issue stops the router on every tracker, and when the router cannot tell whether the label is there it starts nothing and says why.

### Success Criteria

1. Every `--auto={claude,opencode,codex,cursor}` x `--tracker={github,linear,jira}` install succeeds (codex also needs `--codex`); `--auto=<any>` with tracker `none` still refuses and names `--tracker=`.
2. Under Linear or Jira, a CI completion on an opted-in `feat/**` branch dispatches every router job whose credential is set (claude / opencode / codex); with the label removed, nothing dispatches. Jira keys with digits (`AB2-12`) dispatch like any other.
3. When the router cannot read the label (key missing, service down, issue not found, bkit not installable, output unparseable), it starts no agent, exits green, and the run log + job summary name the reason (the missing secret by name when that is the cause).
4. The session-start guard stops a Cursor background session or a Claude session that carries an issue id whose issue lost `bkit:auto` or is finished (by state category), on GitHub, Linear and Jira.
5. Setup advisories, `bkit check` findings and `.bkit/cloud.md` name only the configured tracker's keys; the support matrix lists each agent once with no tracker pairing; an adopted `bkit-cloud.yml` that predates this change is named by an advisory on `bkit upgrade` / `bkit check`, with a `docs/migrations.md` § Detect-only guards row.

> **Reading SC2 under owner decision `719-cloud-router-dispatches-recorded-agent-only` (newer than the design):** "every router job whose credential is set" builds and is tested as "the one router job named by `bkit.cloud.agent`, when its `BKIT_` credential is set". Text above is the design's, verbatim; see Open Questions & Assumptions.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Codex Cloud session-start guard | SC4 covers Cursor background + Claude sessions only; no SC, scenario or matrix row needs it; hooks in Codex Cloud tasks are unproven (hard-blocked). | Deferral `719-codex-cloud-session-start-guard` (design § Architecture Out of scope). |
| Tracker MCP fallback on runners (`mcp__linear__*` / `mcp__jira__*` in `claude_args`) | Runner jobs use bkit verbs; exit 80 → Failure Path; Linear MCP needs browser OAuth. No SC needs it. | Deferral `719-runner-tracker-mcp-fallback` (design § Architecture Out of scope). |
| Live codex dispatches and Cursor background `sessionStart` check during build | Owner chose proof by use after ship (`719-live-checks-deferred-to-owner-use`); no sandbox repo, `BKIT_OPENAI_API_KEY` or Cursor environment for the build; `.bkit/cloud.md` marks both not yet verified live (TASK 16). | Owner use; reported failures through `/bkit-debug`. Deferral row written by build / ship (plan cannot write deferrals). |
| Live Linear workspace / Jira site proof of the router read | Owner chose recorded-reply contract tests (`719-linear-jira-router-read-fixture-tests-only`); SC2 / SC3 are proven by TASK 1 + TASK 8 fixtures; `.bkit/cloud.md` marks Linear / Jira dispatch not verified live (TASK 16). | Deferral `719-linear-jira-router-live-read`. |

Non-goals (new tracker values, marker contract, vendor-native trigger install) are named in Context & Goals, not here. Multi-agent arbitration is no longer out of scope: TASK 7 builds `719-cloud-router-dispatches-recorded-agent-only`.

## Where it fits

- Group 1: Tracker-aware session guard — `terminal` fact, GitHub + Linear (WS-1, WS-2) — done
  - TASK 1: `terminal` fact on `bkit issues fetch` (`719-issues-fetch-terminal-fact`) — done
  - TASK 2: Rename the guard part to `preflight-tracker.sh`; tracker dispatch, GitHub branch, Linear by category (`719-session-guard-shared-tracker-part`) — done
- Group 2: Session guard — Jira branch, no-id line, Claude trigger (WS-2) — done
  - TASK 3: Guard Jira branch, no-id line, Claude `GITHUB_ISSUE_ID` trigger (`719-guard-issue-id-sources`, `719-tracker-guard-no-issue-id-not-verified`, `719-cursor-jira-guard-hard-stop-without-bkit-bin`) — done
- Group 3: Install engine — `codex` variant and wired-tracker rule (WS-3) — done
  - TASK 4: `codex` cloud variant (`719-any-cloud-agent-any-wired-tracker`) — done
  - TASK 5: Cloud advisories from a variant x tracker table; `BKIT_OPENAI_API_KEY` env row (`719-cloud-advisories-variant-by-tracker-table`, `719-cloud-router-secrets-bkit-prefixed`) — done
  - TASK 6: Wired-tracker rule, `.codex/` prerequisite and opencode one-shot install (`719-auto-refuses-tracker-none`, `719-auto-codex-requires-codex-host`, `719-auto-opencode-one-shot-install`) — done
  - TASK 19: Correct the stale Codex install footprint assertion — done
  - TASK 20: Complete group 3 generation and required verification — done
- Group 4: Router context job — `BKIT_` secrets and one agent (WS-4) — done
  - TASK 7: `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`) — done
- Group 5: Router context job — tracker-agnostic gate and summary (WS-4) — done
  - TASK 8: bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`) — done
  - TASK 9: Summary `jobs` field from the `Select agent job` hand-off (`719-cloud-router-dispatches-recorded-agent-only`, `719-cloud-router-secrets-bkit-prefixed`) — done
- Group 6: Router dev arm and agent jobs (WS-4, WS-5) — done
  - TASK 10: Dev arm through `fids parse --prompt-file` (`719-cloud-router-issue-id-via-workflow-fids-parse`, `719-router-dev-arm-issue-from-feature-row`) — done
  - TASK 11: Tracker secrets in the claude / opencode dispatch steps (`719-router-tracker-secrets-step-scope`) — done
  - TASK 12: Router `codex` job; `opencode` job dependency install (`719-codex-job-action-prompt-and-pin`, `719-codex-job-installs-deps-before-action`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`, `719-opencode-job-installs-deps-before-run`) — done
- Group 7: Post-install checks (WS-7) — done
  - TASK 13: Stale-router sniffs and per-variant router text (`719-router-stale-copy-detect-only`) — done
  - TASK 14: Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`) — done
- Group 8: `cloud` tip and docs (WS-7, WS-8) — done
  - TASK 15: `cloud` tip per variant — done
  - TASK 16: Shipped docs under `.bkit/core/.bkit/` — done
  - TASK 17: Repo docs and code comments — done
- Group 9: Mirrors and full verification — this group
  - TASK 18: Regenerate mirrors, full suite, dogfood — open

## The work

<!-- bkit:task 18 start -->

- [ ] **TASK 18:** Regenerate mirrors, full suite, dogfood
  - **UPDATE:** `dist/cli.js`: `pnpm build` (every `dist/` file regenerated)
  - **UPDATE:** `.claude/hooks/bkit-preflight.sh`: regenerated by `bkit install`; header outside `bkit:start/end` hand-synced if the parity test reports it
  - **UPDATE:** `.cursor/hooks/bkit-preflight.sh`: same
  - **UPDATE:** `.bkit/providers.md`: regenerated installed copy
  - **UPDATE:** `.bkit/.env.example`: regenerated installed copy
  - **UPDATE:** `.bkit/cloud.md`: regenerated installed copy
  - **UPDATE:** `.bkit/templates.md`: regenerated installed copy
  - **UPDATE:** `.bkit/install.md`: regenerated installed copy
  - **UPDATE:** `.bkit/README.md`: regenerated installed copy
  - **UPDATE:** `docs/security.md`: managed `bkit:start` / `bkit:end` block (`:1-67`) regenerated from `.bkit/shared/docs/security.md`
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
  - **DONE WHEN:** `pnpm vitest run` passes; `node dist/cli.js check` on the repo exits 0 with no drift finding; `git grep -n -e OPENCODE_PROVIDER_KEY -e 'secrets\.ANTHROPIC_API_KEY' -- docs/security.md` prints nothing; in a scratch consumer from `pnpm pack`, `bkit install --tracker=jira --codex --auto=codex` exits 0 and records `codex`, and `bkit install --auto=claude` with tracker `none` exits 1 naming `--tracker=`; in that consumer, with the new router adopted and a stub `gh` on `PATH` whose `secret list` prints `ANTHROPIC_API_KEY`, `node dist/cli.js check` raises `cloud-router-secret-renamed`.
  - **TEST FIRST:** n/a — verification and regenerated mirrors, no new behaviour

<!-- bkit:task 18 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): `terminal` fact on `bkit issues fetch` (`719-issues-fetch-terminal-fact`) — `.bkit/core/engine/commands/workflow/tracker.ts`, `.bkit/core/engine/commands/workflow/issues.test.ts`, `.bkit/core/engine/commands/workflow/issues.ts`, `.bkit/core/engine/commands/workflow/tracker.test.ts`, `dist/commands/workflow/tracker.js`, `dist/commands/workflow/issues.js`
- TASK 2 (group 1, done): Rename the guard part to `preflight-tracker.sh`; tracker dispatch, GitHub branch, Linear by category (`719-session-guard-shared-tracker-part`) — `.bkit/core/hooks/preflight-tracker.sh`, `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh`, `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`, `.bkit/core/hooks/preflight-linear.sh`
- TASK 3 (group 2, done): Guard Jira branch, no-id line, Claude `GITHUB_ISSUE_ID` trigger (`719-guard-issue-id-sources`, `719-tracker-guard-no-issue-id-not-verified`, `719-cursor-jira-guard-hard-stop-without-bkit-bin`) — `.bkit/core/hooks/preflight-tracker.sh`, `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh`, `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`
- TASK 4 (group 3, done): `codex` cloud variant (`719-any-cloud-agent-any-wired-tracker`) — `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/cli.ts`, `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/cli.test.ts`, `dist/install/manifest.js`, `dist/cli.js`
- TASK 5 (group 3, done): Cloud advisories from a variant x tracker table; `BKIT_OPENAI_API_KEY` env row (`719-cloud-advisories-variant-by-tracker-table`, `719-cloud-router-secrets-bkit-prefixed`) — `.bkit/core/engine/install/modules/cloud.ts`, `.bkit/shared/.bkit/.env.example`, `.bkit/core/engine/install/modules/cloud.integration.test.ts`, `.bkit/core/engine/audits/templates/templates-content.test.ts`, `dist/install/modules/cloud.js`
- TASK 6 (group 3, done): Wired-tracker rule, `.codex/` prerequisite and opencode one-shot install (`719-auto-refuses-tracker-none`, `719-auto-codex-requires-codex-host`, `719-auto-opencode-one-shot-install`) — `.bkit/core/engine/commands/install/install.ts`, `.bkit/core/engine/cli.ts`, `.bkit/core/engine/commands/install/install.test.ts`, `.bkit/core/engine/commands/install/install.integration.test.ts`, `dist/commands/install/install.js`, `dist/cli.js`
- TASK 7 (group 4, done): `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 8 (group 5, done): bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/.bkit/templates.md`, `docs/observability.md`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 9 (group 5, done): Summary `jobs` field from the `Select agent job` hand-off (`719-cloud-router-dispatches-recorded-agent-only`, `719-cloud-router-secrets-bkit-prefixed`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`
- TASK 10 (group 6, done): Dev arm through `fids parse --prompt-file` (`719-cloud-router-issue-id-via-workflow-fids-parse`, `719-router-dev-arm-issue-from-feature-row`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 11 (group 6, done): Tracker secrets in the claude / opencode dispatch steps (`719-router-tracker-secrets-step-scope`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 12 (group 6, done): Router `codex` job; `opencode` job dependency install (`719-codex-job-action-prompt-and-pin`, `719-codex-job-installs-deps-before-action`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`, `719-opencode-job-installs-deps-before-run`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 13 (group 7, done): Stale-router sniffs and per-variant router text (`719-router-stale-copy-detect-only`) — `.bkit/core/engine/checks/after/github.ts`, `.bkit/core/engine/checks/after/github.test.ts`, `docs/migrations.md`, `dist/checks/after/github.js`
- TASK 14 (group 7, done): Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`) — `.bkit/core/engine/checks/after/auth.ts`, `.bkit/core/engine/checks/after/auth.test.ts`, `docs/migrations.md`, `docs/observability.md`, `dist/checks/after/auth.js`
- TASK 15 (group 8, done): `cloud` tip per variant — `.bkit/core/engine/checks/tips/catalogue.ts`, `dist/checks/tips/catalogue.js`
- TASK 16 (group 8, done): Shipped docs under `.bkit/core/.bkit/` — `.bkit/core/.bkit/cloud.md`, `.bkit/core/.bkit/providers.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/install.md`, `.bkit/core/.bkit/README.md`
- TASK 17 (group 8, done): Repo docs and code comments — `docs/deployments.md`, `.bkit/shared/docs/security.md`, `docs/security.md`, `docs/testing.md`, `.bkit/core/engine/install/modules/opencode.ts`, `dist/install/modules/opencode.js`
