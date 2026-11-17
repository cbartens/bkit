# Brief: group 5 — Router context job — tracker-agnostic gate and summary (WS-4) (tests)

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
- Group 5: Router context job — tracker-agnostic gate and summary (WS-4) — this group
  - TASK 8: bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`) — open
  - TASK 9: Summary `jobs` field from the `Select agent job` hand-off (`719-cloud-router-dispatches-recorded-agent-only`, `719-cloud-router-secrets-bkit-prefixed`) — done
- Group 6: Router dev arm and agent jobs (WS-4, WS-5) — next
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

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: context checkout `ref` = PR head branch on `feat/**`, `dev` otherwise; checkout comment (`:160-162`) rewritten to the per-arm rule; `setup-node` `{{NODE_VERSION}}` (`cache: pnpm`) + `pnpm/action-setup` + `Install bkit` (`pnpm install --frozen-lockfile --ignore-scripts`, `continue-on-error: true`), all `if: enabled`; GitHub-only no-op (`:188-194`) deleted
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `bkit_gate <issue>` shell function (outcomes `bkit-unavailable` / `no-issue` / `unreadable` / `label-absent` / `pass`, `|| rc=$?` captures, `::warning::` vs `::notice::`, one `$GITHUB_STEP_SUMMARY` row `tracker | issue | verdict | reason | jobs`) replaces both `gh issue view … grep -qxF 'bkit:auto'` sites (`:341`, `:424`); feat arm `node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json` replaces the marker regex + branch fallback (`:395-417`); `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` + `GH_TOKEN` in the ctx step `env:`
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, `runs-on` + `{{NODE_VERSION}}` re-applied
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `bkit-cloud.yml` entry gains the `{{NODE_VERSION}}` edit row
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: `{{NODE_VERSION}}` row (`:85`) lists `bkit-cloud.yml`
  - **UPDATE:** `docs/observability.md`: `[bkit-cloud] gate:` annotations + the summary row
  - **UPDATE:** `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`: `setupFixture` writes `node_modules/.bin/bkit` (real CLI via `requireTsx()`, or recorded `issues fetch` reply + exit code); tracker no-op `it.each` (`:357`) and "a github tracker passes the tracker gate" (`:381`) rewritten as gate outcomes; feat-path describes (`:504-807`) to `fids parse`
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: describe "T2.7 — two-tier CI gate positive assertions" (c) and "Challenge Finding 1 — SHARED-DERIV …" feat-arm pins; new context-checkout `ref` case (template parsed with `yaml`)
  - **DEPENDS ON:** 7
  - **DONE WHEN:** the ten tests below pass; `dogfood-templates.test.ts` passes; `git grep -n 'gh issue view' -- .bkit/templates/.github/workflows/bkit-cloud.yml` prints nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `github feat run passes the gate through the real bkit and stub gh` fails on the gate not reading labels through `bkit issues fetch`
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `label removed gives label-absent, skip and a summary row` fails on a dispatch or a missing summary row after the label is gone
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s recorded fetch reply carrying bkit:auto passes the gate` fails on the Linear / Jira no-op still firing
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `jira marker AB2-12 dispatches` fails on a Jira key with digits rejected
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green` fails on a red run, a dispatch or no secret name
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=%s is unreadable with that reason and exits green` fails on a red run, a dispatch, a `label-absent` verdict or a missing reason (`it.each`: `network`, `not-found`)
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s fetch output is unreadable reason=output-unparseable` fails on empty or non-array output read as label-absent or pass
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `absent node_modules/.bin/bkit warns bkit unavailable and exits green` fails on a red run or a dispatch
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `feat branch with no marker and no feature row gives no-issue` fails on a guessed issue id or a dispatch
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch` fails on `dev` checked out for a `feat/**` run or a feature branch checked out for the dev arm or a dispatch

<!-- bkit:task 8 end -->

### Earlier tasks this group depends on

- TASK 7 (group 4, done): `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Credential gate: `enabled` iff any agent `BKIT_` secret set | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 7 |
| Credential gate: only `ANTHROPIC_API_KEY`, `OPENCODE_PROVIDER_KEY` or an app's `OPENAI_API_KEY` set → `enabled` false, nothing starts | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 7 |
| `Select agent job`: `bkit.cloud.agent` absent → no job, notice names `bkit install --auto=` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 7 |
| `Select agent job`: recorded claude + its secret → claude only | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 7 |
| `Select agent job`: recorded codex → codex only although `BKIT_ANTHROPIC_API_KEY` set | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 7 |
| `Select agent job`: recorded agent's secret unset → no job, notice names it | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 7 |
| `Select agent job`: `cursor` / `none` → no router job | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 7 |
| GitHub feat run passes the gate through the real bkit (tsx) + stub `gh` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Label removed → `label-absent` notice, `skip=true`, summary verdict | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Linear / Jira recorded `fetch` replies with `bkit:auto` → `pass` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Jira marker `AB2-12` dispatches | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Exit 80 `reason=auth`, `BKIT_JIRA_API_KEY` empty → warning names the secret, green | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Exit 80 `reason=network` (service down) / `reason=not-found` → `unreadable` with that reason, green, no dispatch | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Context checkout `ref`: `workflow_run` head branch on `feat/**`, `dev` for dev runs and `workflow_dispatch` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 8 |
| Empty / non-array output → `unreadable reason=output-unparseable` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| `node_modules/.bin/bkit` absent → `bkit unavailable` warning, green | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Feat branch with no marker and no feature row → `no-issue` notice | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| Summary `pass` row: `jobs` names `codex:BKIT_OPENAI_API_KEY` and the ignored claude job with its reason | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Summary `no-agent` row: `jobs` names the recorded agent's missing `BKIT_` secret and the ignored secrets | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Dev subject `feat(<fid>):` → FID via `--prompt-file`, issue via the feature row | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Linear-shaped FID under github tracker → `no-issue`, no dispatch | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Dev subject naming several issues (`fids parse` exit 8) → no-FID no-op | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Dev arm: issue closed (`state: closed`, `terminal: true`) but still carrying `bkit:auto` → `pass`, post-merge debug dispatches | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Dev arm under Jira: subject `feat(ab2-12-login-retry): …` passes `bkit_dev_dispatch_guard` and dispatches | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Dev arm: traversal value (`../x`) in the subject or merged-PR body → no-FID no-op, no file written outside `docs/plans/` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Tracker secrets at step scope only, on ctx + every dispatch step | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 11 |
| Claude job reads `secrets.BKIT_ANTHROPIC_API_KEY`; no `secrets.ANTHROPIC_API_KEY` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 7 |
| Opencode step maps each provider `BKIT_` secret to its own env; no `OPENCODE_PROVIDER_KEY` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 7 |
| Codex job `if:` = selected codex and not skipped | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Codex job installs deps before `openai/codex-action` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| `codex-action` SHA-pinned `# v1`; `codex-version` pinned + renovate-annotated | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| `codex-action` inputs: `danger-full-access`, `allow-bots`, `BKIT_OPENAI_API_KEY`, `$bkit-auto` prompt | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Trust step writes `codex-home/config.toml` trusting `$GITHUB_WORKSPACE` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Filled `bkit-cloud.yml` passes actionlint | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Codex `if: always()` summary step writes `action`, `commits`, `comments` (extracted bash) | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Opencode job installs deps before its dispatch step | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |

### Planned tests that already exist

- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `github feat run passes the gate through the real bkit and stub gh` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:414`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `label removed gives label-absent, skip and a summary row` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:427`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s recorded fetch reply carrying bkit:auto passes the gate` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:440`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `jira marker AB2-12 dispatches` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:453`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:466`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=%s is unreadable with that reason and exits green` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:485`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s fetch output is unreadable reason=output-unparseable` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:507`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `absent node_modules/.bin/bkit warns bkit unavailable and exits green` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:518`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `feat branch with no marker and no feature row gives no-issue` — exists at `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:528`; update that test in place: add expectations, never remove or loosen one
- TASK 8 `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch` — exists at `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:48`; update that test in place: add expectations, never remove or loosen one
