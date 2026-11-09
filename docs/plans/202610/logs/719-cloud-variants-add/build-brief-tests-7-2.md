# Brief: group 7 — Post-install checks (WS-7) (tests)

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
- Group 7: Post-install checks (WS-7) — this group
  - TASK 13: Stale-router sniffs and per-variant router text (`719-router-stale-copy-detect-only`) — done
  - TASK 14: Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`) — open
- Group 8: `cloud` tip and docs (WS-7, WS-8) — next
  - TASK 15: `cloud` tip per variant — open
  - TASK 16: Shipped docs under `.bkit/core/.bkit/` — open
  - TASK 17: Repo docs and code comments — open
- Group 9: Mirrors and full verification — later
  - TASK 18: Regenerate mirrors, full suite, dogfood — open

## The work

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`)
  - **UPDATE:** `detectCiRouterSecrets` in `.bkit/core/engine/checks/after/auth.ts`: reads `cloud.agent`, tracker and opencode provider via `readBkitConfig(cwd)`; Anthropic findings (`anthropic-api-key-secret-missing`, `-shadows-federation`, `-federation-template-stale`) only for claude under `BKIT_ANTHROPIC_API_KEY`; `cloud-router-tracker-secret-missing`; `codex-api-key-secret-missing`; `cloud-router-secret-renamed` (legacy `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` present, `BKIT_` twin absent; action inlines `gh secret set <BKIT_NAME>` + `gh secret delete <legacy>`); every secret finding keyed on the names the adopted `.github/workflows/bkit-cloud.yml` reads (`secrets.BKIT_` content sniff, the `buildCloudSetupAdvisory` pattern): a legacy copy gets its findings under the legacy names and no rename finding (`719-router-secret-rename-detect-only`); docblock drops "GitHub-tracker only"
  - **UPDATE:** `buildCloudDashboardsAdvisory` in `.bkit/core/engine/checks/after/auth.ts`: router section names the recorded variant's `BKIT_` secret (opencode: `OPENCODE_PROVIDER_DEFAULTS[provider].envVar`)
  - **UPDATE:** `.bkit/core/engine/checks/after/auth.test.ts`: `detectCiRouterSecrets` (`:163-260`, `mockGhNames`) and dashboards (`:261-300`) cases to the `BKIT_` names
  - **UPDATE:** `docs/migrations.md`: § Detect-only guards row `cloud-router-secret-renamed`
  - **UPDATE:** `docs/observability.md`: § Phase 3 Credential + Migration Findings `detectCiRouterSecrets` row lists the new findings
  - **UPDATE:** `dist/checks/after/auth.js`: `pnpm build` output
  - **DEPENDS ON:** 4, 7
  - **DONE WHEN:** the seven tests below pass; `checks/after/index.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/auth.test.ts` `%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it` fails on no finding or another tracker's key named
    - `.bkit/core/engine/checks/after/auth.test.ts` `cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing` fails on no finding or a Claude finding instead
    - `.bkit/core/engine/checks/after/auth.test.ts` `anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY` fails on a codex / opencode repo told to set a Claude key
    - `.bkit/core/engine/checks/after/auth.test.ts` `legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed` fails on no finding or no `gh secret set` / `delete` in the action
    - `.bkit/core/engine/checks/after/auth.test.ts` `legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key` fails on the wrong provider key named
    - `.bkit/core/engine/checks/after/auth.test.ts` `dashboards router section names the recorded variant's BKIT_ secret` fails on `ANTHROPIC_API_KEY` named for every router
    - `.bkit/core/engine/checks/after/auth.test.ts` `adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed` fails on a consumer told to delete the secret its router still reads or to set a `BKIT_` name its copy ignores

<!-- bkit:task 14 end -->

### Earlier tasks this group depends on

- TASK 4 (group 3, done): `codex` cloud variant (`719-any-cloud-agent-any-wired-tracker`) — `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/cli.ts`, `.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/cli.test.ts`, `dist/install/manifest.js`, `dist/cli.js`
- TASK 7 (group 4, done): `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `cloud-router-tracker-secret-missing` names the tracker's secret | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 14 |
| `codex-api-key-secret-missing` under `cloud.agent` codex | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 14 |
| Anthropic findings only for claude, under `BKIT_ANTHROPIC_API_KEY` | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 14 |
| Legacy `ANTHROPIC_API_KEY` without `BKIT_` twin → `cloud-router-secret-renamed` | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 14 |
| Legacy `OPENCODE_PROVIDER_KEY` without the provider key → `cloud-router-secret-renamed` | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 14 |
| Dashboards advisory names the recorded variant's `BKIT_` secret | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 14 |
| Adopted copy still reading legacy names (no `secrets.BKIT_`) → secret findings name the legacy secret, no `cloud-router-secret-renamed` until the copy is re-copied | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 14 |

### Planned tests that already exist

- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` `%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it` — exists at `.bkit/core/engine/checks/after/auth.test.ts:291`; update that test in place: add expectations, never remove or loosen one
- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` `cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing` — exists at `.bkit/core/engine/checks/after/auth.test.ts:309`; update that test in place: add expectations, never remove or loosen one
- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` `anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY` — exists at `.bkit/core/engine/checks/after/auth.test.ts:319`; update that test in place: add expectations, never remove or loosen one
- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` `legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed` — exists at `.bkit/core/engine/checks/after/auth.test.ts:341`; update that test in place: add expectations, never remove or loosen one
- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` `legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key` — exists at `.bkit/core/engine/checks/after/auth.test.ts:352`; update that test in place: add expectations, never remove or loosen one
- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` `dashboards router section names the recorded variant's BKIT_ secret` — exists at `.bkit/core/engine/checks/after/auth.test.ts:382`; update that test in place: add expectations, never remove or loosen one
- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` `adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed` — exists at `.bkit/core/engine/checks/after/auth.test.ts:367`; update that test in place: add expectations, never remove or loosen one
