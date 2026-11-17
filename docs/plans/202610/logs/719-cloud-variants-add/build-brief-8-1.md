# Brief: group 8 — `cloud` tip and docs (WS-7, WS-8)

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
- Group 8: `cloud` tip and docs (WS-7, WS-8) — this group
  - TASK 15: `cloud` tip per variant — open
  - TASK 16: Shipped docs under `.bkit/core/.bkit/` — open
  - TASK 17: Repo docs and code comments — open
- Group 9: Mirrors and full verification — next
  - TASK 18: Regenerate mirrors, full suite, dogfood — open

## The work

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** `cloud` tip per variant
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `cloud` tip `ask` / `steps` (`:237-251`) from the recorded variant; Claude App, `BKIT_ANTHROPIC_API_KEY` and the bootstrap hook only for claude
  - **UPDATE:** `dist/checks/tips/catalogue.js`: `pnpm build` output
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the two tests below pass; existing `catalogue.test.ts` cloud cases (`:340`) pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude` fails on Claude steps for other variants
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `cloud tip for codex names --codex and BKIT_OPENAI_API_KEY` fails on no codex text

<!-- bkit:task 15 end -->

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** Shipped docs under `.bkit/core/.bkit/`
  - **UPDATE:** `.bkit/core/.bkit/cloud.md`: Purpose + support matrix one row per agent, no tracker columns (`:20-35`); § Reactive comment handlers `:46` and § Post-CI auto-routing (`:471-519`: § What lives where (post-CI half) routing rows `:482-483`, § bkit-cloud.yml — required GitHub repo credentials table `:503` and its "GitHub-tracker only" sentence `:519`) — one agent per run, codex row, `BKIT_` credentials table incl. tracker keys, GitHub-tracker-only text removed; § Routing decision tracker-neutral; troubleshooting `verdict` / `reason` → cause → action incl. codex summary line; codex runner notes (unguarded diffs, `drop-sudo`, Node 24); session guard per tracker, no-id sessions unguarded, Codex Cloud unguarded; Linear / Jira router dispatch, the codex router job and the Cursor Jira guard (bin present at `sessionStart`) "not yet verified live" (`719-live-checks-deferred-to-owner-use`)
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: `preflight-linear.sh` row (`:307`) → `preflight-tracker.sh`; Codex rows (`--auto=codex`, router job)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Cloud-agent workflow — `bkit-cloud.yml` (`:243`) secrets bullets `Secrets for claude` (`:254`) and `Secrets for opencode` (`:255`) to the `BKIT_` names, plus a codex bullet
  - **UPDATE:** `.bkit/core/.bkit/install.md`: § Cloud agent environments post-CI auto-routing paragraph, claude / opencode job bullets and `requires tracker=github` (`:187-193`); § Optional post-install decisions "Why opt-in" bullets (`:364-369`) and step 4 `--auto=claude|cursor|opencode` (`:376`); § Doctor cloud-router credential bullet (`:416`)
  - **UPDATE:** `.bkit/core/.bkit/README.md`: § Optional post-install decisions `--auto=claude|cursor|opencode` paragraph (`:293`); guard requirements (§ From a tracker comment `**Requirements (Linear)**` / `**Requirements (GitHub)**` and § From Claude Code `**Requirements:**`, `:319-337`)
  - **READ:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: `build-close-workflow` entries `:388-395` pin `` `bkit-build` Step N close-workflow `` in `.bkit/cloud.md` and `.bkit/core/.bkit/cloud.md`
  - **DEPENDS ON:** 3, 5, 11, 12, 13, 14
  - **DONE WHEN:** `git grep -nE 'GitHub-tracker only|GitHub tracker only|OPENCODE_PROVIDER_KEY|preflight-linear|--auto=claude\|cursor\|opencode[^|]' -- .bkit/core/.bkit` prints nothing; the `.bkit/core/.bkit/cloud.md` support matrix header has no `Tracker` column and the matrix holds exactly one row each for claude, opencode, codex and cursor; `git grep -n 'not yet verified live' -- .bkit/core/.bkit/cloud.md` prints lines naming Linear and Jira router dispatch, the codex router job and the Cursor Jira guard; `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` and `shipped-docs-refs.test.ts` pass. Doc drift between these sources and their installed `.bkit/*.md` copies is gated by TASK 18's `node dist/cli.js check` after `bkit install`.
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->

- [ ] **TASK 17:** Repo docs and code comments
  - **UPDATE:** `docs/deployments.md`: § `bkit-cloud.yml` — dual-job cloud-agent lane jobs table and rules (`:659-675`): one agent per run, `BKIT_` secrets, codex job, context install
  - **UPDATE:** `.bkit/shared/docs/security.md`: § Supply-Chain (GitHub Actions) Token isolation bullet `:22` (inside the managed `bkit:start` / `bkit:end` block) secret names → `secrets.BKIT_ANTHROPIC_API_KEY` / the provider `BKIT_` keys / `secrets.BKIT_OPENAI_API_KEY`
  - **UPDATE:** `docs/security.md`: outside the managed block (`:1-67`) only — § Credential surfaces opencode provider keys row (`:90`); § CI Auto-Route Trust (`:172-180`): engine-owned FID parse plus the `bkit_dev_dispatch_guard` charset assert, dev subject via `fids parse --prompt-file`, kill switch on every tracker, tracker keys at step scope, a same-repo PR's head `package.json` (`bkit.cloud.agent`, `bkit.tracker.default`) steering its own routing run (collaborator-trusted); `:22` comes from TASK 18's `bkit install`
  - **UPDATE:** `docs/testing.md`: key-file rows for `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts`, `preflight-sh.integration.test.ts` (§ Key test files `:662`; the `preflight-sh.integration.test.ts` row is `:689`, the other two rows are new)
  - **UPDATE:** `.bkit/core/engine/install/modules/opencode.ts`: comments `:163`, `:225` name the provider's `BKIT_` secret
  - **UPDATE:** `dist/install/modules/opencode.js`: `pnpm build` output
  - **DEPENDS ON:** 8, 10, 12
  - **DONE WHEN:** `git grep -n -e OPENCODE_PROVIDER_KEY -e 'secrets\.ANTHROPIC_API_KEY' -- docs/deployments.md docs/security.md docs/testing.md .bkit/shared/docs/security.md .bkit/core/engine/install/modules/opencode.ts` prints nothing outside `docs/security.md:1-67` (the managed `bkit:start` / `bkit:end` block TASK 18 regenerates); `pnpm build` leaves `dist/` matching its sources.
  - **TEST FIRST:** n/a — docs and comments only, no behaviour change

<!-- bkit:task 17 end -->

### Earlier tasks this group depends on

- TASK 3 (group 2, done): Guard Jira branch, no-id line, Claude `GITHUB_ISSUE_ID` trigger (`719-guard-issue-id-sources`, `719-tracker-guard-no-issue-id-not-verified`, `719-cursor-jira-guard-hard-stop-without-bkit-bin`) — `.bkit/core/hooks/preflight-tracker.sh`, `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh`, `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`
- TASK 4 (group 3, done): `codex` cloud variant (`719-any-cloud-agent-any-wired-tracker`) — `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/cli.ts`, `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/cli.test.ts`, `dist/install/manifest.js`, `dist/cli.js`
- TASK 5 (group 3, done): Cloud advisories from a variant x tracker table; `BKIT_OPENAI_API_KEY` env row (`719-cloud-advisories-variant-by-tracker-table`, `719-cloud-router-secrets-bkit-prefixed`) — `.bkit/core/engine/install/modules/cloud.ts`, `.bkit/shared/.bkit/.env.example`, `.bkit/core/engine/install/modules/cloud.integration.test.ts`, `.bkit/core/engine/audits/templates/templates-content.test.ts`, `dist/install/modules/cloud.js`
- TASK 8 (group 5, done): bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/.bkit/templates.md`, `docs/observability.md`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 10 (group 6, done): Dev arm through `fids parse --prompt-file` (`719-cloud-router-issue-id-via-workflow-fids-parse`, `719-router-dev-arm-issue-from-feature-row`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 11 (group 6, done): Tracker secrets in the claude / opencode dispatch steps (`719-router-tracker-secrets-step-scope`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 12 (group 6, done): Router `codex` job; `opencode` job dependency install (`719-codex-job-action-prompt-and-pin`, `719-codex-job-installs-deps-before-action`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`, `719-opencode-job-installs-deps-before-run`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 13 (group 7, done): Stale-router sniffs and per-variant router text (`719-router-stale-copy-detect-only`) — `.bkit/core/engine/checks/after/github.ts`, `.bkit/core/engine/checks/after/github.test.ts`, `docs/migrations.md`, `dist/checks/after/github.js`
- TASK 14 (group 7, done): Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`) — `.bkit/core/engine/checks/after/auth.ts`, `.bkit/core/engine/checks/after/auth.test.ts`, `docs/migrations.md`, `docs/observability.md`, `dist/checks/after/auth.js`

Reuse Inventory rows left out: 1; Architecture entries left out: 2 — read them in docs/plans/202610/719-cloud-variants-add-plan.md § Reuse Inventory and § Architecture & Component Changes.
