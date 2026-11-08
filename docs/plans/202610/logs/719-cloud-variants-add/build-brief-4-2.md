# Brief: group 4 — Router context job — `BKIT_` secrets and one agent (WS-4)

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
- Group 4: Router context job — `BKIT_` secrets and one agent (WS-4) — this group
  - TASK 7: `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`) — open
- Group 5: Router context job — tracker-agnostic gate and summary (WS-4) — next
  - TASK 8: bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`) — open
  - TASK 9: Summary `jobs` field from the `Select agent job` hand-off (`719-cloud-router-dispatches-recorded-agent-only`, `719-cloud-router-secrets-bkit-prefixed`) — open
- Group 6: Router dev arm and agent jobs (WS-4, WS-5) — later
  - TASK 10: Dev arm through `fids parse --prompt-file` (`719-cloud-router-issue-id-via-workflow-fids-parse`, `719-router-dev-arm-issue-from-feature-row`) — open
  - TASK 11: Tracker secrets in the claude / opencode dispatch steps (`719-router-tracker-secrets-step-scope`) — open
  - TASK 12: Router `codex` job; `opencode` job dependency install (`719-codex-job-action-prompt-and-pin`, `719-codex-job-installs-deps-before-action`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`, `719-opencode-job-installs-deps-before-run`) — open
- Group 7: Post-install checks (WS-7) — later
  - TASK 13: Stale-router sniffs and per-variant router text (`719-router-stale-copy-detect-only`) — open
  - TASK 14: Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`) — open
- Group 8: `cloud` tip and docs (WS-7, WS-8) — later
  - TASK 15: `cloud` tip per variant — open
  - TASK 16: Shipped docs under `.bkit/core/.bkit/` — open
  - TASK 17: Repo docs and code comments — open
- Group 9: Mirrors and full verification — later
  - TASK 18: Regenerate mirrors, full suite, dogfood — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `Check runner credentials` reads `BKIT_ANTHROPIC_API_KEY` (or both federation variables), any of `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY`, `BKIT_OPENAI_API_KEY`; `enabled` = any set
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: new `Select agent job` step after checkout: reads `bkit.cloud.agent`, sets exactly one of `claude` / `opencode` / `codex` (plus `agent`) only when that agent's secret is set; else `no-agent` notice naming the missing secret (or Cursor's native triggers / no variant; absent field reads `none` and the notice names `bkit install --auto=<claude|opencode|codex>`) and the ignored secrets; no credential-presence fallback; outputs carry the dispatched / ignored job list for TASK 9's summary `jobs` field; `run` / `opencode` job `if:` read the selected outputs
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `run` job action input `secrets.BKIT_ANTHROPIC_API_KEY`; `opencode` dispatch step maps each provider `BKIT_` secret to its same-named env var (fan-out of `OPENCODE_PROVIDER_KEY` removed); header comments describe one agent per run
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy from the template, `runs-on` re-applied
  - **UPDATE:** `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`: describe "gate step — per-job credential detection" (`:808-876`) to the `BKIT_` names; `Select agent job` cases via `extractStepScript`
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: describe "bkit-cloud.yml template — GitHub-only content" pins of `ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}` and the agent-job `if:` shape
  - **DONE WHEN:** the eight tests below pass; `dogfood-templates.test.ts` passes; `git grep -n -e OPENCODE_PROVIDER_KEY -e 'secrets\.ANTHROPIC_API_KEY' -- .bkit/templates .github/workflows` prints nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `enabled is true when any agent BKIT_ secret is set and false when none is` fails on a legacy name enabling the run or a `BKIT_` name ignored (`it.each` over the lone non-`BKIT_` names `ANTHROPIC_API_KEY`, `OPENCODE_PROVIDER_KEY` and an app's `OPENAI_API_KEY`, each giving `enabled` false)
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `absent bkit.cloud.agent selects no job and the notice names bkit install --auto=` fails on a job selected from secret presence or a notice without the command
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job` fails on opencode or codex also selected
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set` fails on the additive claude job starting
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded agent without its secret selects no job and names the missing secret` fails on another agent's secret starting a job or a silent no-op
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded %s selects no router job` fails on any router job selected for cursor or none
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY` fails on the legacy secret still read
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `opencode dispatch maps each provider BKIT_ secret to its own env name` fails on the `OPENCODE_PROVIDER_KEY` fan-out remaining

<!-- bkit:task 7 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| FID + issue recovery on every ref | `.bkit/templates/.github/workflows/bkit-cloud.yml` | read `namedFid` (`:429`), `fromMarker` (`:610`), `fromBranch` (`:653`), `--prompt-file` handler (`:770-806`) in `.bkit/core/engine/commands/workflow/fids.ts`; router regex sites `bkit-cloud.yml:230`, `:318-327`, `:395-417` | `fids parse --marker/--branch` (per-tracker markers incl. Jira `AB2-12`, feature-row check); `--prompt-file` `fidNamed` | EXTEND | Router calls `fids parse` (feat arm TASK 8, dev arm + merged-PR fallback TASK 10) in place of its regexes; `fids.ts` reused unchanged (`719-cloud-router-issue-id-via-workflow-fids-parse`). |
| Router: bkit on the runner | `.bkit/templates/.github/workflows/bkit-cloud.yml` | read `bkit-ci.yml` setup block (`:67-73`, `:171`) | `setup-node {{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile` | EXTEND | Same block in the context job, `--ignore-scripts`, `continue-on-error`. |
| Router: gate, agent select, summary | `.bkit/templates/.github/workflows/bkit-cloud.yml` | read whole template (596 lines); `git grep -l 'GITHUB_STEP_SUMMARY' .bkit/templates` (bkit-ci, bkit-cloud); GitHub Actions built-ins `$GITHUB_STEP_SUMMARY`, `::notice::` / `::warning::` | `Check runner credentials` (`:121-153`), `Resolve phase + brief context`, `bkit_dev_dispatch_guard` (rc-capture pattern) | EXTEND | `bkit_gate` + `Select agent job` in the same context job. |
| Router: codex job | `.bkit/templates/.github/workflows/bkit-cloud.yml` | `git grep -l 'codex-action'` (no repo use outside 719 docs); vendor `openai/codex-action` `action.yml` (inputs read 2026-10-29); `gh api repos/openai/codex-action/git/ref/tags/v1` | `opencode` job shape (`:546-596`); vendor action does Codex install + auth | EXTEND | New job in the same file, opencode shape + deps install + trust step. |
| Renovate pin for `codex-version` | `.bkit/templates/.github/workflows/bkit-cloud.yml` | read `customManagers` (`:115-145`) in `.bkit/templates/.github/renovate.json5` | first `matchStrings` entry matches `codex-version: "x"` (`[\w-]*(?:VERSION\|version)[=:]`) | EXTEND | Codex job gains the `# renovate: datasource=npm depName=@openai/codex` annotation (TASK 12); `renovate.json5` reused unchanged. |
| Router contract tests | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | read whole file (`extractStepScript`, `GH_STUB`, `setupFixture`, `runCtxStep`, `GATE_SCRIPT`) | ctx-step harness with stub `gh` | EXTEND | Fixture `node_modules/.bin/bkit` (tsx CLI, or recorded `fetch` replies); per-tracker / per-outcome cases. |
| Template shape tests | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | read describes (`:9`, `:85`, `:149`, `:255`); `template-ci-yml.test.ts` actionlint pattern | pins of today's GitHub-only shape | EXTEND | Rewrite pins; `yaml` parse + actionlint on the filled template. |
| bkit's adopted router | `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | read dogfood entry (`runs-on` count 3, `it.each` `%s` `:703`) | adopted copy (differs only in `runs-on`) | EXTEND | Re-copy per template task; entry gains `{{NODE_VERSION}}` row, count 3 → 4. |

### Architecture entries

#### [MODIFY] `.github/workflows/bkit-cloud.yml`

- **Existence Check:** exists (adopted copy; differs only in `runs-on` ×3; disabled per `592-cloud-lane-disabled-in-bkit-repo`).
- Re-copied in every template task with `runs-on` + `{{NODE_VERSION}}` re-applied.

Reuse Inventory rows left out: 0; Architecture entries left out: 1 — read them in docs/plans/202610/719-cloud-variants-add-plan.md § Reuse Inventory and § Architecture & Component Changes.
