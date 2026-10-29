# Cloud variants — `--auto=codex` and any wired tracker (#719) Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

A team picks whichever cloud agent they like (Claude, opencode, Codex or Cursor) and whichever tracker they already use (GitHub, Linear or Jira). `bkit install --auto=<agent>` works for that pairing, and from then on a passing or failing CI run on an opted-in feature hands the work to their agent exactly as Claude + GitHub does today. Removing `bkit:auto` from the issue stops the router on every tracker, and when the router cannot tell whether the label is there it starts nothing and says why.

### Success Criteria

1. Every `--auto={claude,opencode,codex,cursor}` x `--tracker={github,linear,jira}` install succeeds (codex also needs `--codex`); `--auto=<any>` with tracker `none` still refuses and names `--tracker=`.
2. Under Linear or Jira, a CI completion on an opted-in `feat/**` branch dispatches every router job whose credential is set (claude / opencode / codex); with the label removed, nothing dispatches. Jira keys with digits (`AB2-12`) dispatch like any other.
3. When the router cannot read the label (key missing, service down, issue not found, bkit not installable, output unparseable), it starts no agent, exits green, and the run log + job summary name the reason (the missing secret by name when that is the cause).
4. The session-start guard stops a Cursor background session or a Claude session that carries an issue id whose issue lost `bkit:auto` or is finished (by state category), on GitHub, Linear and Jira.
5. Setup advisories, `bkit check` findings and `.bkit/cloud.md` name only the configured tracker's keys; the support matrix lists each agent once with no tracker pairing; an adopted `bkit-cloud.yml` that predates this change is named by an advisory on `bkit upgrade` / `bkit check`, with a `docs/migrations.md` § Detect-only guards row.

> **Reading SC2 under owner decision `719-cloud-router-dispatches-recorded-agent-only` (newer than the design):** "every router job whose credential is set" builds and is tested as "the one router job named by `bkit.cloud.agent`, when its `BKIT_` credential is set". Text above is the design's, verbatim; see Open Questions & Assumptions.

### Process Sketch

- **WHEN** `bkit install --tracker=jira --codex --auto=codex` runs **→ THEN** `bkit.cloud.agent` = `codex` is recorded and the advisories name `BKIT_OPENAI_API_KEY`, `BKIT_JIRA_API_KEY` + `bkit.tracker.jira.site` and no other tracker's or agent's key.
- **WHEN** CI finishes on an opted-in `feat/**` branch under Jira **→ THEN** the context job checks out the PR head, installs the repo's bkit, recovers `AB2-12` with `bkit fids parse`, reads `bkit:auto` with `bkit issues fetch`, and starts only the `codex` job; the job summary row reads `pass`.
- **WHEN** the label is removed **→ THEN** the next CI completion starts no agent job; `gate: AB2-12 no longer carries bkit:auto` in log and summary.
- **IF** the label cannot be read (`BKIT_JIRA_API_KEY` unset, tracker down, `Install bkit` failed, unparseable output) **→ THEN** no agent starts, the run is green and a `::warning::` + summary row name the reason (the secret by name for `reason=auth`).
- **IF** `bkit install --auto=codex` runs without `.codex/` and without `--codex` **→ THEN** it exits 1 naming `bkit install --codex` and writes nothing.
- **IF** a Cursor background session starts on `feat/{FID}` under GitHub and the issue lacks `bkit:auto` or is closed **→ THEN** the guard stops it; with no issue id it records `bkit:auto not verified` and continues.
- **IF** `bkit upgrade` / `bkit check` meets a pre-change adopted `bkit-cloud.yml` under Linear / Jira, a `codex` agent with no codex job, or a legacy-named router secret **→ THEN** a detect-only advisory names the re-copy or the `gh secret set` / `gh secret delete` fix.

### Concrete Example

**Setup:** Maintainer of a Jira-tracked repo (`bkit.tracker.default` = `jira`, `bkit.tracker.jira.site` committed), Codex installed with bkit; issue `AB2-12` carries `bkit:auto`; its PR from `feat/ab2-12-login-retry` carries `<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-login-retry -->`.

**Steps:**

1. Maintainer runs `bkit install --tracker=jira --codex --auto=codex` → System records `bkit.cloud.agent: "codex"`, prints `bkit-cloud-setup` naming the `bkit-cloud.yml` re-copy, `BKIT_OPENAI_API_KEY` and `BKIT_JIRA_API_KEY` + `bkit.tracker.jira.site`; no Anthropic, Linear or GitHub App line.
2. Maintainer copies `.bkit/templates/.github/workflows/bkit-cloud.yml`, sets `gh secret set BKIT_OPENAI_API_KEY` and `gh secret set BKIT_JIRA_API_KEY` → `bkit check` raises no router secret finding.
3. CI fails on the PR → `bkit-cloud.yml` context job checks out `feat/ab2-12-login-retry`, `Install bkit` succeeds, `bkit fids parse --marker … --branch …` gives `fid` `ab2-12-login-retry` + `issueId` `AB2-12`, `bkit issues fetch --issue AB2-12` returns `labels` with `bkit:auto` → `Select agent job` sets `codex=true` only → the `codex` job runs `openai/codex-action` with prompt `$bkit-auto debug <PR>`; summary row `jira | AB2-12 | pass | — | codex:BKIT_OPENAI_API_KEY`.
4. Maintainer removes `bkit:auto` from `AB2-12`; CI fails again → context job logs `::notice::[bkit-cloud] gate: AB2-12 no longer carries bkit:auto — no-op exit (kill switch)`, sets `skip=true`; no agent job starts; run green.

**Outcome:** one Codex debug run for the opted-in issue, none after the label is gone, each decision visible on the run summary page.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| **Several runner credentials set** | claude, opencode and codex jobs all start on one CI event and race on the same PR. The per-feature workflow lock does not prevent this (`logs/{FID}/.lock` lives in each runner's own checkout). Left as today, tracked by deferral `397-dual-agent-same-run-double-ship-when-both-secrets-set`, now three-way. — **Superseded by owner decision `719-cloud-router-dispatches-recorded-agent-only`:** only the job named by `bkit.cloud.agent` starts; other agents' secrets are ignored and named in the summary `jobs` field; deferral row now `TRIAGED` with that disposition. |
| **Adopted `bkit-cloud.yml` out of date** | under Linear / Jira it keeps no-oping with `serves the GitHub tracker only`; under `cloud.agent` = `codex` it has no codex job. Fails safe; the detect-only advisory is the only signal. |
| **Cursor session with no issue id** (`@cursor` on a GitHub issue, Cursor's CI trigger on a checkout not named `feat/{FID}`) | the guard cannot read a label; it records that in the session context and does not stop the session (open question). Linear sessions always carry `LINEAR_ISSUE_ID` and keep today's HARD STOP when it is missing. — Open question settled by `719-tracker-guard-no-issue-id-not-verified`: line `Guard pre-check: SKIPPED — no issue id; bkit:auto not verified`, exit 0. |
| **FID shape of another tracker** (Linear-shaped FID in a GitHub-tracker repo) | `bkit issues fetch --fid` resolves no issue under the configured tracker → no dispatch + notice; the router never guesses a tracker from the FID shape. — Built through `bkit fids parse` under the configured tracker (`719-cloud-router-issue-id-via-workflow-fids-parse`): no `issueId` → `fetch` prints `skipped: no-issue` → `no-issue` notice. |
| **Issue closed after ship, `dev` CI fails** | the router checks only `bkit:auto`, never the issue state, so the post-merge debug still dispatches; finished-state refusal belongs to the session guard only. |
| **`OPENAI_API_KEY` already stored for the app** | codex job starts on every opted-in CI event once the new template is merged. — **Superseded** by `719-cloud-router-secrets-bkit-prefixed` + `719-cloud-router-dispatches-recorded-agent-only`: the router reads `BKIT_OPENAI_API_KEY` only, and only when `bkit.cloud.agent` = `codex`; an app's `OPENAI_API_KEY` starts nothing. |
| Recorded agent's `BKIT_` secret unset, another agent's set | `enabled` true, `Select agent job` selects nothing; `::notice::` names the recorded agent's missing secret; summary `jobs` lists the ignored secret; no agent starts. |
| `bkit.cloud.agent` = `cursor` or `none` | no router agent job; notice names Cursor's native triggers / no variant. |
| `--auto=<any>` with tracker `none` | exit 1 naming `bkit install --tracker=<github\|linear\|jira> --auto=<v>`; no file written. |
| `--auto=codex` without `.codex/` and without `--codex` in the same run | exit 1 naming `bkit install --codex`; no file written; one-shot `bkit install --codex --auto=codex` passes. |
| `bkit issues fetch` exit 80 `reason=auth`, tracker secret empty in step env | `::warning::[bkit-cloud] gate: unreadable reason=auth` naming `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY`; no dispatch; run green. |
| `fetch` exits other than 0 / 80, prints nothing, or `labels` is not an array | `unreadable reason=output-unparseable`, never `label-absent`. |
| `Install bkit` failed (`node_modules/.bin/bkit` absent) | `::warning::[bkit-cloud] gate: bkit unavailable (step 'Install bkit' failed) — no dispatch; re-run or workflow_dispatch`. |
| Dev-arm commit subject names no FID or several issues (`fids parse --prompt-file` exit 8) | no FID → today's no-op notice; nothing dispatched. |
| Jira key with digits (`AB2-12`) in the PR-body marker | parsed by `fids parse`; dispatches like any other key. |
| Adopted router secret still under its legacy name (`ANTHROPIC_API_KEY`, `OPENCODE_PROVIDER_KEY`) | router reads the `BKIT_` name → credential unset → notice, no dispatch; `bkit check` raises `cloud-router-secret-renamed` with the `gh secret set` / `gh secret delete` fix. |
| Linear state renamed `Shipped` (type `completed`) or Jira status `Shipped` (category `done`) | `terminal` = `true`; guard stops the session. |
| Guard tracker read fails or times out (`curl --max-time 15`, Jira `timeout 20`) | HARD STOP naming tracker + reason. |
| Jira session where `node_modules/.bin/bkit` is absent | HARD STOP naming the missing bin (`719-cursor-jira-guard-hard-stop-without-bkit-bin`). |
| Tracker unset / `none` and no `LINEAR_ISSUE_ID` | advisory context only, exit 0 (today's behaviour). |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke. `Task` = the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| GitHub `fetchIssue`: closed → `terminal` true, open → false | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Linear `fetchIssue`: `completed` state renamed `Shipped` → `terminal` true | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Linear `fetchIssue`: `canceled` → true, `started` → false | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| Jira `fetchIssue`: `done`-category status renamed `Shipped` → true, `indeterminate` → false | Unit | `.bkit/core/engine/commands/workflow/tracker.test.ts` | 1 |
| `bkit issues fetch` prints `terminal` in stdout facts and `issue-facts.json` | Unit | `.bkit/core/engine/commands/workflow/issues.test.ts` | 1 |
| Guard (GitHub): issue without `bkit:auto` → HARD STOP | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 2 |
| Guard (GitHub): closed issue → HARD STOP; open + labelled → pass | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 2 |
| Guard (GitHub): read failure → HARD STOP naming tracker + reason | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 2 |
| Guard (Linear): `completed` state renamed `Shipped` → HARD STOP | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 2 |
| Claude and Cursor hooks splice the one `preflight-tracker.sh` part | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 2 |
| Guard (Jira): `terminal` fact true → HARD STOP | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 3 |
| Guard (Jira): `node_modules/.bin/bkit` absent → HARD STOP | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 3 |
| Guard (GitHub / Jira): no issue id → `bkit:auto not verified`, exit 0 | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 3 |
| Claude session with `GITHUB_ISSUE_ID` runs the guard | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 3 |
| Tracker unset, no `LINEAR_ISSUE_ID` → advisory context, exit 0 | Integration | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | 3 |
| Live Cursor background `sessionStart`: env dump, `ls node_modules/.bin/bkit`, `GITHUB_ISSUE_ID` for `@cursor` | @live (golden) | `.bkit/core/.bkit/cloud.md` (recorded observation) | 4 |
| `parseCloudAgents` accepts `codex` | Unit | `.bkit/core/engine/install/manifest.test.ts` | 5 |
| `--auto=codex` parses; `--auto=<bad>` lists claude, cursor, opencode, codex | Unit | `.bkit/core/engine/cli.test.ts` | 5 |
| Every variant x github / linear / jira passes the wired-tracker check | Unit | `.bkit/core/engine/commands/install/install.test.ts` | 6 |
| Tracker `none` refuses naming `--tracker=` | Unit | `.bkit/core/engine/commands/install/install.test.ts` | 6 |
| `--auto=codex` without `.codex/` exits 1 naming `--codex`, writes nothing | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 6 |
| `--tracker=jira --codex --auto=codex` exits 0, records `codex` | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 6 |
| `--tracker=github --auto=cursor` exits 0, records `cursor` | Integration | `.bkit/core/engine/commands/install/install.integration.test.ts` | 6 |
| Codex variant advisory: `--codex`, `.codex/bkit-cloud.md`, `BKIT_OPENAI_API_KEY` | Integration | `.bkit/core/engine/install/modules/cloud.integration.test.ts` | 7 |
| Tracker line names only the configured tracker's key, every variant | Integration | `.bkit/core/engine/install/modules/cloud.integration.test.ts` | 7 |
| Claude advisory: `BKIT_ANTHROPIC_API_KEY` or federation variables | Integration | `.bkit/core/engine/install/modules/cloud.integration.test.ts` | 7 |
| Opencode advisory: configured provider's `BKIT_` key | Integration | `.bkit/core/engine/install/modules/cloud.integration.test.ts` | 7 |
| `.env.example` vendor keys `BKIT_`-prefixed, incl. `BKIT_OPENAI_API_KEY` | Unit | `.bkit/core/engine/audits/templates/templates-content.test.ts` | 7 |
| Credential gate: `enabled` iff any agent `BKIT_` secret set | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| `Select agent job`: recorded claude + its secret → claude only | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| `Select agent job`: recorded codex → codex only although `BKIT_ANTHROPIC_API_KEY` set | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| `Select agent job`: recorded agent's secret unset → no job, notice names it | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| `Select agent job`: `cursor` / `none` → no router job | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 8 |
| GitHub feat run passes the gate through the real bkit (tsx) + stub `gh` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Label removed → `label-absent` notice, `skip=true`, summary verdict | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Linear / Jira recorded `fetch` replies with `bkit:auto` → `pass` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Jira marker `AB2-12` dispatches | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Exit 80 `reason=auth`, `BKIT_JIRA_API_KEY` empty → warning names the secret, green | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Empty / non-array output → `unreadable reason=output-unparseable` | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| `node_modules/.bin/bkit` absent → `bkit unavailable` warning, green | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Feat branch with no marker and no feature row → `no-issue` notice | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 9 |
| Dev subject `feat(<fid>):` → FID via `--prompt-file`, issue via the feature row | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Linear-shaped FID under github tracker → `no-issue`, no dispatch | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Dev subject naming several issues (`fids parse` exit 8) → no-FID no-op | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 10 |
| Tracker secrets at step scope only, on ctx + every dispatch step | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 11 |
| Claude job reads `secrets.BKIT_ANTHROPIC_API_KEY`; no `secrets.ANTHROPIC_API_KEY` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 8 |
| Opencode step maps each provider `BKIT_` secret to its own env; no `OPENCODE_PROVIDER_KEY` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 8 |
| Codex job `if:` = selected codex and not skipped | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Codex job installs deps before `openai/codex-action` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| `codex-action` SHA-pinned `# v1`; `codex-version` pinned + renovate-annotated | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| `codex-action` inputs: `danger-full-access`, `allow-bots`, `BKIT_OPENAI_API_KEY`, `$bkit-auto` prompt | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Trust step writes `codex-home/config.toml` trusting `$GITHUB_WORKSPACE` | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Filled `bkit-cloud.yml` passes actionlint | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 12 |
| Three live codex dispatches (`workflow_dispatch`, human-push `workflow_run`, bot-commit `workflow_run`): actor check, `git push`, `gh pr comment`, tracker verb, hyphenated subagent spawn, gate under `github.token` | @live (golden) | `.bkit/core/.bkit/cloud.md` (recorded run ids) | 13 |
| Stale adopted copy under linear / jira → `cloud-router-tracker-stale` | Unit | `.bkit/core/engine/checks/after/github.test.ts` | 14 |
| No `openai/codex-action` under `cloud.agent` codex → `cloud-router-codex-missing` | Unit | `.bkit/core/engine/checks/after/github.test.ts` | 14 |
| Precedence id-token → tracker-stale → codex-missing | Unit | `.bkit/core/engine/checks/after/github.test.ts` | 14 |
| `cloud-claude-missing-id-token` action drops `--tracker=github` | Unit | `.bkit/core/engine/checks/after/github.test.ts` | 14 |
| `cloud-router-none` nudge tracker-neutral (jira included) | Unit | `.bkit/core/engine/checks/after/github.test.ts` | 14 |
| `cloud-router` text names the Claude GitHub App only for claude | Unit | `.bkit/core/engine/checks/after/github.test.ts` | 14 |
| `cloud-router-tracker-secret-missing` names the tracker's secret | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 15 |
| `codex-api-key-secret-missing` under `cloud.agent` codex | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 15 |
| Anthropic findings only for claude, under `BKIT_ANTHROPIC_API_KEY` | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 15 |
| Legacy `ANTHROPIC_API_KEY` without `BKIT_` twin → `cloud-router-secret-renamed` | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 15 |
| Legacy `OPENCODE_PROVIDER_KEY` without the provider key → `cloud-router-secret-renamed` | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 15 |
| Dashboards advisory names the recorded variant's `BKIT_` secret | Unit | `.bkit/core/engine/checks/after/auth.test.ts` | 15 |
| `cloud` tip: Claude App + `BKIT_ANTHROPIC_API_KEY` only for claude | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 16 |
| `cloud` tip for codex: `--codex` + `BKIT_OPENAI_API_KEY` | Unit | `.bkit/core/engine/checks/tips/catalogue.test.ts` | 16 |
| bkit's adopted router equals the template after its listed edits | Unit | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | 12 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**Breaking for consumers (copy-and-own router; bkit never rewrites it):**

<!-- prettier-ignore -->
| Change | Who breaks | Signal / fix |
| --- | --- | --- |
| Router secrets renamed: `ANTHROPIC_API_KEY` → `BKIT_ANTHROPIC_API_KEY`; `OPENCODE_PROVIDER_KEY` → the provider's `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY`; codex reads `BKIT_OPENAI_API_KEY` (`719-cloud-router-secrets-bkit-prefixed`) | Consumers who re-copy the new template but keep legacy secret names: router reads an unset `BKIT_` name → no dispatch (green, notice) | `cloud-router-secret-renamed` on `bkit check` / `bkit upgrade` with `gh secret set <BKIT_NAME>` + `gh secret delete <legacy>`; `docs/migrations.md` § Detect-only guards row |
| Router dispatches only the `bkit.cloud.agent` job (`719-cloud-router-dispatches-recorded-agent-only`) | Repos that relied on additive claude + opencode runs | Summary `jobs` field names the dispatched and the ignored jobs; `.bkit/cloud.md` matrix |
| Context job installs the repo's dependencies (pnpm) before the gate | Non-pnpm consumers | `bkit-unavailable` warning; consumer adapts the install step |
| `feat/**` context job checks out the PR head, not `dev` | none (same-repo gate `:100` unchanged) | — |
| Pre-change adopted copies keep no-oping off GitHub / lack the codex job | Linear / Jira / codex consumers until they re-copy | `cloud-router-tracker-stale` / `cloud-router-codex-missing` |

**Non-breaking:** `bkit.cloud.agent` enum widens (all old values valid); `--auto` accepts more pairings; guard part renamed internally (hooks regenerate on `bkit install`); new `terminal` fact is additive.

**Proposed names:**

<!-- prettier-ignore -->
| Kind | Name |
| --- | --- |
| Function (rename) | `validateCloudTrackerMatch` → `validateCloudTrackerWired` (`install.ts`; callers `install.ts:393`, `install.test.ts`, `cli.ts:817` comment) |
| Function | `trackerAdvisoryLines(tracker, variant)` (`install/modules/cloud.ts`, module-private) |
| Hook part | `.bkit/core/hooks/preflight-tracker.sh` (was `preflight-linear.sh`) |
| Fact | `terminal` on `bkit issues fetch` |
| Router step / function / output | step `Select agent job`; shell `bkit_gate`; output `codex`, `agent`; verdicts `pass`, `label-absent`, `no-issue`, `unreadable`, `bkit-unavailable`, `no-agent`; annotation prefix `[bkit-cloud] gate:` |
| Router job | `codex` |
| Findings | `cloud-router-tracker-stale`, `cloud-router-codex-missing`, `cloud-router-tracker-secret-missing`, `codex-api-key-secret-missing`, `cloud-router-secret-renamed` |
| Secret / env | `BKIT_OPENAI_API_KEY` (`.bkit/.env.example`, repo secret) |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

Design questions 1-9 are settled by the owner rows in Context & Goals and are not reopened here.

- **Open Question:** Where do the two live checks run — TASK 4 (Cursor background `sessionStart` dump) and TASK 13 (three codex dispatches)? bkit's own router is disabled (`592-cloud-lane-disabled-in-bkit-repo`) and holds no secrets. → owner names the repo before the build reaches TASK 4.
  - **Options:** A) an owner sandbox repo (GitHub tracker) with this branch's packed bkit installed (`pnpm pack` → `pnpm add -D ./cbartens-bkit-*.tgz`), the new template adopted, `BKIT_OPENAI_API_KEY` set and a Cursor background environment — real signal; owner supplies repo, key and Cursor seat · B) bkit's own repo, router re-enabled for the run window — no new repo; overrides decision `592-cloud-lane-disabled-in-bkit-repo` and spends on bkit's Actions · C) one sandbox repo per tracker — also proves Linear / Jira live; contradicts `719-linear-jira-router-read-fixture-tests-only`
  - **Recommended:** A) — only option that keeps both recorded decisions and still gives the boundary signal.
  - **Default if unanswered:** A); the build pauses at TASK 4 until the repo, key and Cursor environment are named.
- **Assumption:** SC2 "every router job whose credential is set" is built and tested as "the one job named by `bkit.cloud.agent`, when its `BKIT_` secret is set" (`719-cloud-router-dispatches-recorded-agent-only`, newer than the design) → if the owner wants SC2 literal, TASK 8's `Select agent job` and its five tests invert and deferral `397-dual-agent-…` reopens.
- **Assumption:** `docs/plans/{YYYYMM}/logs/{FID}/` exists on `dev` for every shipped FID (its `status.jsonl` is what today's dev-dispatch cap already reads on `origin/dev`), so `fids parse --prompt-file` resolves the squash subject's bare FID through `namedFid` → if wrong, the dev arm finds no FID and post-merge debug never auto-dispatches (fails safe: no-op notice, no false dispatch).
- **Assumption:** bkit-built feature branches carry their `.bkit/issues.jsonl` feature row, so `fids parse --branch` on the checked-out PR head yields `issueId` when the PR-body marker is missing → if wrong, the branch fallback resolves issue-less → `no-issue` notice; the marker path is unaffected.
- **Assumption:** Claude workload-identity federation stays on repo **variables** `ANTHROPIC_FEDERATION_RULE_ID` / `ANTHROPIC_ORGANIZATION_ID`, unrenamed (`719-cloud-router-secrets-bkit-prefixed` renames secrets only) → if wrong, TASK 8 / TASK 15 / docs rename them too and `cloud-router-secret-renamed` covers variables.
- **Assumption:** `openai/codex-action` v1 input names read from its `action.yml` on 2026-10-29 (`prompt`, `openai-api-key`, `sandbox`, `allow-bots`, `codex-home`, `codex-version`, `safety-strategy`) hold at the SHA pinned in TASK 12 → if renamed, the job fails at run time while actionlint passes; TASK 13 catches it before the template ships.
- **Assumption:** Cursor's `environment.json` `install` finishes before `sessionStart` fires (`719-cursor-jira-guard-hard-stop-without-bkit-bin`, option A) → if TASK 4's dump shows the bin absent, the build stops at TASK 4 and the plan gains the 30 s poll task through a plan update (the owner row's fallback), never built speculatively; unnoticed, every Jira background session HARD STOPs.
- **Assumption:** consumers run pnpm (the template's context job assumes it, as `bkit-ci.yml` already does) → a non-pnpm consumer adapts the copied install step, else every run reports `bkit-unavailable`.
- **Assumption:** cloud sessions that the guard reads GitHub for carry `BKIT_GH_TOKEN` (`.bkit/cloud.md` env blocks) → if absent, the GitHub branch is unreadable and HARD STOPs naming `BKIT_GH_TOKEN` (fail closed, not open).

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Keep `gh issue view` for GitHub, bkit verbs for Linear / Jira | Rejected | Owner `719-cloud-kill-switch-one-bkit-path`: two kill switches drift. |
| New `bkit issues gate` verb for router + guard | Rejected | Guard cannot depend on bkit at SessionStart (Claude bootstrap ordering); router needs only `fetch`'s output (`719-router-label-read-via-issues-fetch`). The single terminal definition survives as the `terminal` fact. |
| Per-tracker HTTP in router YAML, no bkit on the runner | Rejected | Third copy of read logic; Jira token proven only on the MCP endpoint; fixes reach consumers only by re-merge. |
| Template-pinned `@cbartens/bkit` via npm on the runner | Rejected | Second bkit version per run (`719-router-bkit-from-consumer-lockfile`). |
| Widen YAML FID / marker regexes (design's dev-arm plan) | Rejected | Owner `719-cloud-router-issue-id-via-workflow-fids-parse`: no YAML regex on any ref. Dev arm: `--prompt-file` FID + `--branch feat/<FID>` issue (`719-router-dev-arm-issue-from-feature-row`). |
| Dispatch every job whose secret is set (design Q9 additive) | Rejected | Owner `719-cloud-router-dispatches-recorded-agent-only`. |
| `OPENAI_API_KEY` collision advisory (design Q6 option A) | Dropped | Moot: router reads `BKIT_OPENAI_API_KEY` only for recorded codex; an app's `OPENAI_API_KEY` starts nothing. |
| Upgrade migration renaming router secrets | Rejected | `gh secret list` returns names only; bkit never writes repo secrets → detect-only `cloud-router-secret-renamed` (`719-router-secret-rename-detect-only`). |
| Keep one fanned-out opencode secret under a `BKIT_` name | Rejected | Owner: the provider's own `BKIT_` key (`719-router-opencode-provider-secrets-direct`). |
| Guard: python MCP JSON-RPC client for Jira | Rejected | Duplicates `JiraSession`; Jira only reachable where `pnpm install` ran. |
| `TEMPLATE_CHANGE_CONSEQUENCES` note for stale copies | Rejected | Fires on every later template change; a content sniff self-silences (`719-router-stale-copy-detect-only`). |

**Future phase:** live Linear / Jira router proof (`719-linear-jira-router-live-read`); Codex Cloud session guard once hooks are proven (`719-codex-cloud-session-start-guard`); tracker MCP fallback on runners (`719-runner-tracker-mcp-fallback`); opencode job dependency install (Suggested Scope Expansion).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Codex Cloud session-start guard | SC4 covers Cursor background + Claude sessions only; no SC, scenario or matrix row needs it; hooks in Codex Cloud tasks are unproven (hard-blocked). | Deferral `719-codex-cloud-session-start-guard` (design § Architecture Out of scope). |
| Tracker MCP fallback on runners (`mcp__linear__*` / `mcp__jira__*` in `claude_args`) | Runner jobs use bkit verbs; exit 80 → Failure Path; Linear MCP needs browser OAuth. No SC needs it. | Deferral `719-runner-tracker-mcp-fallback` (design § Architecture Out of scope). |
| Live Linear workspace / Jira site proof of the router read | Owner chose recorded-reply contract tests (`719-linear-jira-router-read-fixture-tests-only`); SC2 / SC3 are proven by TASK 1 + TASK 9 fixtures; `.bkit/cloud.md` marks Linear / Jira dispatch not verified live (TASK 17). | Deferral `719-linear-jira-router-live-read`. |

Non-goals (new tracker values, marker contract, vendor-native trigger install) are named in Context & Goals, not here. Multi-agent arbitration is no longer out of scope: TASK 8 builds `719-cloud-router-dispatches-recorded-agent-only`.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `opencode` job has no dependency install, so `/bkit-auto` Step 2 likely exits 127 on a fresh runner | `docs/failures.jsonl` `bkit-cloud-opencode-job-never-installs-repo-deps` (HIGH); design § Risks out-of-scope find | TASK 11 / TASK 12 (same template; the codex job's install block is the fix) | Fold in — needs owner decision; same 3-step block as TASK 12. |
| `bkit install --opencode --auto=opencode` one-shot trap: `.opencode/` check ignores `modules.has("opencode")` | design § Risks out-of-scope find | TASK 6 (same prerequisite branch) | Fold in — needs owner decision; one condition beside the codex one. |
| Linear guard still HARD STOPs a Linear cloud agent with no `LINEAR_ISSUE_ID` | `docs/deferrals.jsonl` `650-preflight-linear-issue-less` (OPEN); row names `preflight-linear.sh` | TASK 2 / TASK 3 (guard part renamed) | Keep deferred — design keeps today's Linear HARD STOP; its file reference goes stale after the rename. |
| `/bkit-auto` and `bkit-cloud.yml` stay issue-only | `docs/deferrals.jsonl` `650-bkit-auto-issue-less` (OPEN) | TASK 9 / TASK 10 (`no-issue` outcome) | Keep deferred. |
| Router / executor split as a shared dispatch primitive | `docs/deferrals.jsonl` `397-router-executor-split-as-shared-dispatch-primitive` (TRIAGED) | TASK 8-12 (router shape) | Keep deferred. |
| Dev dispatch cap self-resettable by the dispatched session | `docs/deferrals.jsonl` `363-dev-dispatch-cap-self-resettable-by-controlled-principal` (OPEN) | TASK 10 (dev arm before `bkit_dev_dispatch_guard`) | Keep deferred; codex job gains the same `contents: write` reach. |
| Cloud egress allowlist staleness detector | `docs/deferrals.jsonl` `381-cloud-allowlist-staleness-detector` (OPEN) | TASK 7 / TASK 17 (codex env docs) | Keep deferred. |
| Session-start JSON escaper leaves control characters raw | `docs/deferrals.jsonl` `700-session-start-nudge-challenge-low-bkit-core-claude-hooks-bkit-preflight-sh-46` | TASK 2 / TASK 3 (same host wrappers) | Keep deferred (LOW); check whether already fixed. |
| Pinned tool version / sha256 mismatch fails CI | #737 — Fail CI when a pinned tool's version and sha256 disagree (open) | TASK 12 (vale + `codex-version` pins) | Keep deferred. |
| bkit-cloud concurrency: global ship lock, FID arbitration | #397 (open) | TASK 8 | Keep open; TASK 8 removes only the same-run multi-agent race. |
| Agentic preflight and runtime infra hardening | #100 (open) | TASK 2 / TASK 3 | Keep separate. |
| Ship Failure Path after merge has no publish channel on cloud runtimes | `docs/failures.jsonl` `ship-cloud-failure-path-after-merge-has-no-publish-channel` (OPEN) | TASK 12 (codex runs ship) | Keep separate. |

## Security & Privacy

Per `docs/security.md` (§ Token isolation `:22`, secrets `:54-76`, § CI Auto-Route Trust `:149-158`, § Untrusted Content):

- [ ] **New API Route** — n/a: no route.
- [ ] **New DB Table/Column** — n/a: no database.
- [ ] **Role-Gated Mutation** — n/a.
- [x] **User Input** — PR body, branch name and commit subject are collaborator-trusted input: parsed only by the engine (`fids parse` asserts `FID_PATTERNS` / `SLUG` before any path use, replacing the YAML allowlist named in § CI Auto-Route Trust); phase / arg keep the existing `^[0-9A-Za-z._/-]+$` allowlist; values reach `run:` via `env:` only (`kn-37`); codex `prompt` is an action input, never shell-expanded.
- [x] **PII** — engine redaction (`redact`) stays on every `fetch` failure line; annotations carry `reason` + secret **names**, never values; guard output names tracker + reason only.
- [ ] **Redirect URL** — n/a.
- [ ] **Webhook** — n/a.
- [x] **New Secret/Env Var** — `BKIT_OPENAI_API_KEY` in `.bkit/shared/.bkit/.env.example`; all router secrets at step `env:` scope (`719-router-tracker-secrets-step-scope`), never job / workflow scope; Renovate PRs keep no access (`:22` updated to the `BKIT_` names); `BKIT_ANTHROPIC_API_KEY` stays a session-hijack key dropped from cloud env blocks (`:76`).

Further surfaces:

- **Supply chain on a `contents: write` job:** context-job `pnpm install --frozen-lockfile --ignore-scripts` (no lifecycle scripts); codex job installs before the action's `drop-sudo`; `openai/codex-action` SHA-pinned, `codex-version` pinned.
- **Checkout of the PR head (`feat/**`):** same-repo gate (`workflow_run.head_repository.full_name == github.repository`, `bkit-cloud.yml:100`) unchanged, so no fork code is checked out.
- **Codex agent rights:** `sandbox: danger-full-access` + `allow-bots: true` (`719-codex-job-full-access-sandbox-allow-bots`) = same reach as the claude / opencode jobs; codex runner hooks likely inactive → `.bkit/cloud.md` says review codex runner diffs as unguarded; `drop-sudo` persists on reused self-hosted runners.
- **Tracker keys reachable by agents reading untrusted issue / PR text:** step scope only; advisories ask for the narrowest key the tracker allows.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no new package; tests use the existing `yaml` devDependency and `tsx`; `package.json` / `pnpm-lock.yaml` untouched by the plan.
- [x] **Dependency Versions:** `pnpm bkit:deps:outdated` → devDependencies only (vitest 5.0.3→5.0.5, @vitest/coverage-v8 5.0.3→5.0.5, oxlint 1.87→1.89, @types/node 24→26, vite 6.4.4→8.3.5); none blocks the build. Toolchain: node v24.16.0, pnpm 10.34.6, gh 2.102.0, actionlint 1.7.12, codex-cli 0.165.0 (= latest `rust-v0.165.0`; npm `@openai/codex` 0.165.0). `openai/codex-action` has no releases; tag `v1` → `1d82a3dba7c7988ec71ecae1ed5b8e8db96495c5` (re-resolve to the commit SHA in TASK 12).
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`; every capability extends an existing owner.
- [ ] **User Context:** repo files readable; **missing from the owner:** live-check repo + `BKIT_OPENAI_API_KEY` + Cursor background environment (Open Question 1) before TASK 4 / TASK 13.
- [x] **Project Context:** read `docs/decisions.jsonl` cloud rows (`de-21-141-…`, `jira-local-runs-only`, `cloud-dispatch-unified-file-additive`, `cloud-kill-switch-exact-label-match`, `cloud-feat-fallback-keeps-full-fid-slug`, `cloud-dev-fid-regex-accepts-linear-shape`, `592-cloud-lane-disabled-in-bkit-repo`), the nine owner rows, `docs/knowledge.jsonl` `kn-37` (never expand context outputs inside `run:`), `kn-30`, `kn-31` (no `grep -oP`), `kn-39` (retry downloads), `kn-hooks-sessionstart-stdout-is-one-json-document`.
- [x] **Testing & Quality:** tiers per `docs/testing.md` § Tiers — engine logic Unit (`*.test.ts`), template steps and hooks Integration (`*.integration.test.ts`, spawned bash + tsx bkit, stub `gh` / `curl` on `PATH`, no mocking framework beyond the existing `vi.hoisted` `node:child_process` mock in `auth.test.ts`), live vendor boundaries @live (golden) recorded in `.bkit/cloud.md`; `it.each` instead of test conditionals (oxlint test rules).
- [x] **Prerequisite Plans:** None (#717 closed).

### Conditional

- [x] **Secrets & Env Vars:** new GitHub repo secret names `BKIT_OPENAI_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` (consumer-set; bkit only detects names via `gh secret list`); `BKIT_OPENAI_API_KEY` joins `.bkit/shared/.bkit/.env.example`. No service account.
- [ ] **Schema State:** n/a — no database.
- [x] **Architecture & UI:** `docs/architecture.md` placement unchanged (hook parts in `.bkit/core/hooks/`, templates in `.bkit/templates/`); no UI.
- [x] **Observability:** new router annotations `[bkit-cloud] gate: …` and findings `cloud-router-tracker-stale`, `cloud-router-codex-missing`, `cloud-router-tracker-secret-missing`, `codex-api-key-secret-missing`, `cloud-router-secret-renamed` → `docs/observability.md` rows (TASK 9, TASK 14, TASK 15).
- [ ] **Notifications:** n/a — no alerts / toasts.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [x] **Security & Privacy checked:** applicable rows verified, or `None` justified.
- [x] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; every `NEW` cites its reason.
- [ ] **Gate 1 - Verified:** Core items and applicable Conditional items checked.

## Data Schema Integration

No database; `docs/data-schema.md` untouched. Changed records and contracts (design § Data Model, owner decisions applied):

<!-- prettier-ignore -->
| Record | Field | Change |
| --- | --- | --- |
| `package.json` | `bkit.cloud.agent` | Enum `claude \| cursor \| opencode \| codex \| none`; every existing value stays valid (no migration). Read by the router's `Select agent job` step. |
| `package.json` | `bkit.tracker.default` | Unchanged; `--auto=<any>` requires `github \| linear \| jira`; read by the engine on the runner and by the guard (`python3`). |
| `bkit issues fetch` output | `terminal` (new boolean) | GitHub `closed`; Linear `state.type` in `completed \| canceled`; Jira `statusCategory.key` = `done`. Facts JSON + spec `output`. |
| `bkit issues fetch` output | `labels`, exit 80 + `reason`, `skipped` | Unchanged; now a router contract (spec `output` help + `cloud-ctx-step.integration.test.ts`). |
| GitHub repo secrets | `BKIT_ANTHROPIC_API_KEY`, `BKIT_OPENAI_API_KEY`, `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` | Router inputs under `.bkit/.env` names; `ANTHROPIC_API_KEY` and `OPENCODE_PROVIDER_KEY` no longer read. |
| Context job outputs | `codex`, `agent` | `codex` beside `claude` / `opencode`; at most one true (`Select agent job`). |
| Job summary row | `tracker`, `issue`, `verdict`, `reason`, `jobs` | One per CI-driven context run; `verdict` in `pass \| label-absent \| no-issue \| unreadable \| bkit-unavailable \| no-agent`; `jobs` names the dispatched job + secret and the ignored ones. |
| Codex job summary line | `action`, `commits`, `comments` | Action outcome (incl. actor-check refusal), `dev` / PR head moved, PR comment landed. |
| `.bkit/templates.md` placeholder table | `{{NODE_VERSION}}` | Also used in `bkit-cloud.yml` (context + codex jobs). |

### Data Schema Usage

None — no database tables read or written.

### Data Schema Changes

None — no database tables or columns.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Terminal-state judgement by category | `.bkit/core/engine/commands/workflow/tracker.ts` | `git grep -n 'statusCategory\|"completed"\|canceled' tracker.ts`; read `fetchIssue` (`:530-690`), `readBlockers` (`:875-935`) | `readBlockers` — Linear `state.type`, Jira `statusCategory.key`, GitHub `closed` (`:907`, `:927`); `fetchIssue` lacks it, Linear query asks `state { name }` only | EXTEND | One helper shared by `readBlockers` and `fetchIssue`; Linear fetch query adds `type`. |
| `terminal` fact on `bkit issues fetch` | `.bkit/core/engine/commands/workflow/issues.ts` | read `fetchVerb` (`:715-744`) + spec (`:838-864`) | facts `{title,url,state,labels}` | EXTEND | Add `terminal`; spec `output` notes the router contract. |
| Router label read, every tracker | `.bkit/core/engine/commands/workflow/issues.ts` | `git grep -l 'bkit:auto' .bkit/core/engine` (branches, issues, prs, runs, workflows, cloud — no read-only gate verb); `trackerTarget` / `skipOf` (`tracker.ts:153`, `:1024`) | `bkit issues fetch --issue --outbox --json` — labels, exit 80 + `reason`, `skipped` | EXTEND | Used as-is by `bkit_gate`; no new verb. |
| FID + issue recovery on every ref | `.bkit/core/engine/commands/workflow/fids.ts` | read `namedFid` (`:429`), `fromMarker` (`:610`), `fromBranch` (`:653`), `--prompt-file` handler (`:770-806`) | `fids parse --marker/--branch` (per-tracker markers incl. Jira `AB2-12`, feature-row check); `--prompt-file` `fidNamed` | EXTEND | Called unchanged from the router (`719-cloud-router-issue-id-via-workflow-fids-parse`); no engine change. |
| `codex` cloud variant | `.bkit/core/engine/install/manifest.ts`, `.bkit/core/engine/cli.ts` | `git grep -n 'CLOUD_VARIANTS'`; read `CLOUD_MODES` / `parseCloudAgents` (`manifest.ts:80-113`) | `CLOUD_MODES`, `CLOUD_VARIANTS` | EXTEND | Add `codex` to both; help + error text follow. |
| Wired-tracker rule | `.bkit/core/engine/commands/install/install.ts` | `git grep -n 'validateCloudTrackerMatch'` (install.ts, install.test.ts, cli.ts comment) | `validateCloudTrackerMatch` (`:123-138`, call `:393`) | EXTEND | Narrow to tracker `none` refusal; renamed `validateCloudTrackerWired` (Breaking Changes). |
| `.codex/` host prerequisite | `.bkit/core/engine/commands/install/install.ts` | read `:403-413` | `--auto=opencode` `.opencode/` check | EXTEND | Same branch gains `codex` → `.codex/` or `modules.has("codex")`. |
| Per-variant x tracker advisories | `.bkit/core/engine/install/modules/cloud.ts` | read `runCloudModule` (`:73-186`); `git grep -n 'BKIT_LINEAR_API_KEY' cloud.ts` (hard-coded Linear lines `:164`, `:181`) | `runCloudModule`, `CLOUD_WORKFLOW_ADOPT_STEP`, `ctx.issueTracker` (`modules/index.ts:89`) | EXTEND | Variant table + `trackerAdvisoryLines(ctx.issueTracker, variant)` inside the module. |
| `BKIT_OPENAI_API_KEY` env template | `.bkit/shared/.bkit/.env.example` | `grep -n 'API_KEY' .bkit/shared/.bkit/.env.example` | `BKIT_ANTHROPIC_API_KEY`, `BKIT_OPENCODE_API_KEY`, … rows | EXTEND | One commented row. |
| Session-start tracker guard | `.bkit/core/hooks/preflight-linear.sh` (→ `preflight-tracker.sh`) | `git grep -l 'preflight-linear'` (2 host wrappers, 2 mirrors, `providers.md` ×2, preflight test, deferrals); `.bkit/core/engine/render/parts.ts` read (generic `{{BKIT_PART}}`, no name list) | Linear-only part spliced into Claude + Cursor `bkit-preflight.sh` | EXTEND | Rename + tracker dispatch; host wrappers keep triggers and output shapes. |
| Router: bkit on the runner | `.bkit/templates/.github/workflows/bkit-cloud.yml` | read `bkit-ci.yml` setup block (`:67-73`, `:171`) | `setup-node {{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile` | EXTEND | Same block in the context job, `--ignore-scripts`, `continue-on-error`. |
| Router: gate, agent select, summary | `.bkit/templates/.github/workflows/bkit-cloud.yml` | read whole template (596 lines); `git grep -l 'GITHUB_STEP_SUMMARY' .bkit/templates` (bkit-ci, bkit-cloud); GitHub Actions built-ins `$GITHUB_STEP_SUMMARY`, `::notice::` / `::warning::` | `Check runner credentials` (`:121-153`), `Resolve phase + brief context`, `bkit_dev_dispatch_guard` (rc-capture pattern) | EXTEND | `bkit_gate` + `Select agent job` in the same context job. |
| Router: codex job | `.bkit/templates/.github/workflows/bkit-cloud.yml` | `git grep -l 'codex-action'` (no repo use outside 719 docs); vendor `openai/codex-action` `action.yml` (inputs read 2026-10-29); `gh api repos/openai/codex-action/git/ref/tags/v1` | `opencode` job shape (`:546-596`); vendor action does Codex install + auth | EXTEND | New job in the same file, opencode shape + deps install + trust step. |
| Renovate pin for `codex-version` | `.bkit/templates/.github/renovate.json5` | read `customManagers` (`:115-145`) | first `matchStrings` entry matches `codex-version: "x"` (`[\w-]*(?:VERSION\|version)[=:]`) | EXTEND | Annotation only (`# renovate: datasource=npm depName=@openai/codex`); renovate config unchanged. |
| Stale adopted router / codex job sniff | `.bkit/core/engine/checks/after/github.ts` | read `buildCloudSetupAdvisory` (`:300-385`); precedent `anthropic-federation-template-stale` (`auth.ts:196`) | `cloud-claude-missing-id-token` content sniff | EXTEND | Two more sniffs, fixed precedence, single finding. |
| Router secret findings + renamed secrets | `.bkit/core/engine/checks/after/auth.ts` | read `detectCiRouterSecrets` (`:173-230`), `buildCloudDashboardsAdvisory` (`:119-170`), `detectGhSecret` / `listGhNames` | Anthropic-only findings | EXTEND | Variant-gated findings, tracker + codex + renamed-secret findings; dashboards section per variant. |
| `cloud` tip per variant | `.bkit/core/engine/checks/tips/catalogue.ts` | read `:228-256` | Claude-only `cloud` tip | EXTEND | Tip text from the recorded variant. |
| Router contract tests | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | read whole file (`extractStepScript`, `GH_STUB`, `setupFixture`, `runCtxStep`, `GATE_SCRIPT`) | ctx-step harness with stub `gh` | EXTEND | Fixture `node_modules/.bin/bkit` (tsx CLI, or recorded `fetch` replies); per-tracker / per-outcome cases. |
| Template shape tests | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | read describes (`:9`, `:85`, `:149`, `:255`); `template-ci-yml.test.ts` actionlint pattern | pins of today's GitHub-only shape | EXTEND | Rewrite pins; `yaml` parse + actionlint on the filled template. |
| Guard tests | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | read whole file (`runPreflight`, `readTemplate`) | Linear guard runtime tests | EXTEND | `curl` stub on `PATH`; per tracker / failure / trigger. |
| bkit's adopted router | `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | read dogfood entry (`runs-on` count 3, `it.each` `%s` `:703`) | adopted copy (differs only in `runs-on`) | EXTEND | Re-copy per template task; entry gains `{{NODE_VERSION}}` row, count 3 → 4. |

No `NEW` rows: every capability has an extendable owner; no `[NEW]` file.

## Architecture & Component Changes

Engine owns tracker semantics (marker / FID shapes, terminal state, failure classes); the router maps verb exits to annotations; hooks stay bkit-runtime-free for GitHub / Linear. The agent workflows (`bkit-auto.md`, phase workflows) already use bkit verbs for every tracker and are untouched. Every engine edit ships with `pnpm build` + `dist/` in the same commit; repo-root mirrors regenerate with one `bkit install` (TASK 19).

**Ledger rows:** `719-any-cloud-agent-any-wired-tracker`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-codex-job-installs-deps-before-action`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-auto-refuses-tracker-none`, `719-auto-codex-requires-codex-host`, `719-codex-job-action-prompt-and-pin`, `719-cloud-advisories-variant-by-tracker-table`, `719-session-guard-shared-tracker-part`, `719-issues-fetch-terminal-fact`, `719-guard-issue-id-sources`, `719-codex-cloud-no-session-guard`, `719-router-stale-copy-detect-only`, `719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`, `719-router-dev-arm-issue-from-feature-row`, `719-router-opencode-provider-secrets-direct`, `de-21-141-bkit-cloud-rebuilt-on-the-claude-github-app`, `cloud-dev-fid-regex-accepts-linear-shape`, `jira-local-runs-only`, `cloud-dispatch-unified-file-additive`, `cloud-kill-switch-exact-label-match`, `cloud-feat-fallback-keeps-full-fid-slug`, `397-dual-agent-same-run-double-ship-when-both-secrets-set`, `719-runner-tracker-mcp-fallback`, `719-linear-jira-router-live-read`

Design `Decisions` rows tagged "Acceptance change" (6) record SC / edge-case wording, not architecture → no ledger row. Design rows answered by the nine owner rows get no second row.

### Database Migrations

None — no database.

### Engine — tracker reads

#### [MODIFY] `.bkit/core/engine/commands/workflow/tracker.ts`

- **Existence Check:** exists (`fetchIssue` per tracker `:530-690`, `readBlockers` `:875-935`).
- One terminal helper (GitHub `closed`; Linear `state.type` in `completed | canceled`; Jira `statusCategory.key` = `done`) used by `readBlockers` and the three `fetchIssue` readers; Linear fetch query `state { name type }`; `TrackerIssue` (or the fetch return type) gains `terminal: boolean`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/issues.ts`

- **Existence Check:** exists (`fetchVerb` `:715-744`, spec `:838-864`).
- Facts `{title, url, state, labels, terminal}` on stdout and in `issue-facts.json`; spec `output` gains `terminal` and notes `labels` / exit 80 + `reason` / `skipped` as the `bkit-cloud.yml` router contract. Stderr keeps `[bkit-issues]`.

### Engine — install

#### [MODIFY] `.bkit/core/engine/install/manifest.ts`

- **Existence Check:** exists (`CLOUD_MODES` `:104`, `parseCloudAgents`).
- `CLOUD_MODES` = `claude | cursor | opencode | codex | none`.

#### [MODIFY] `.bkit/core/engine/cli.ts`

- **Existence Check:** exists (`CLOUD_VARIANTS` `:27`, unknown-variant error `:396`, help `:702-709`, `:801`, comment `:817`).
- `CLOUD_VARIANTS` gains `codex`; help lists `--auto=<claude|cursor|opencode|codex>` and drops tracker pairing text; `:817` comment names `validateCloudTrackerWired`.

#### [MODIFY] `.bkit/core/engine/commands/install/install.ts`

- **Existence Check:** exists (`validateCloudTrackerMatch` `:123-138`, call `:393`, opencode prerequisite `:403-413`).
- Rename → `validateCloudTrackerWired(cloudVariant, hasCloudModule, issueTracker)`: `none` → `[bkit] --auto=<v> needs a wired tracker: bkit install --tracker=<github|linear|jira> --auto=<v>`; no pairing. Same pre-write position. Prerequisite branch adds `codex` → `.codex/` exists or `modules.has("codex")`, message names `bkit install --codex`.

#### [MODIFY] `.bkit/core/engine/install/modules/cloud.ts`

- **Existence Check:** exists (`runCloudModule` `:73-186`).
- Per-variant table (claude / opencode / codex / cursor: launch surface + `BKIT_` credential; opencode = configured provider's `OPENCODE_PROVIDER_DEFAULTS[provider].envVar`); `trackerAdvisoryLines(ctx.issueTracker, variant)`: github `BKIT_GH_TOKEN` only, linear `BKIT_LINEAR_API_KEY` (repo secret for router variants, Runtime Secret for cursor), jira `BKIT_JIRA_API_KEY` + committed `bkit.tracker.jira.site`; never another tracker's key; asks for the narrowest key.

#### [MODIFY] `.bkit/core/engine/install/modules/opencode.ts`

- **Existence Check:** exists (comments `:163`, `:225` name `OPENCODE_PROVIDER_KEY`).
- Comments name the provider's own `BKIT_` secret.

### Engine — checks

#### [MODIFY] `.bkit/core/engine/checks/after/github.ts`

- **Existence Check:** exists (`buildCloudSetupAdvisory` `:325-350`, `cloud-router` text `:343-349`).
- `cloud-router-tracker-stale`, `cloud-router-codex-missing`; precedence id-token → tracker-stale → codex-missing; `cloud-claude-missing-id-token` action = template re-copy (no `--tracker=github`); remove `if (issueTracker === "jira") return null`; `cloud-router-none` text tracker-neutral; `cloud-router` text per variant.

#### [MODIFY] `.bkit/core/engine/checks/after/auth.ts`

- **Existence Check:** exists (`buildCloudDashboardsAdvisory` `:119`, `detectCiRouterSecrets` `:173`).
- `detectCiRouterSecrets` reads `cloud.agent` + tracker: Anthropic findings only for claude under `BKIT_ANTHROPIC_API_KEY`; `cloud-router-tracker-secret-missing`; `codex-api-key-secret-missing`; detect-only `cloud-router-secret-renamed` (legacy `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` present, `BKIT_` twin absent; action inlines `gh secret set` + `gh secret delete`). Dashboards router section names the recorded variant's `BKIT_` secret. Caller `runPostInstallCheck` (`checks/after/index.ts:402-428`) passes what it already has.

#### [MODIFY] `.bkit/core/engine/checks/tips/catalogue.ts`

- **Existence Check:** exists (`cloud` tip `:237-251`).
- Tip text per recorded variant; Claude App / `BKIT_ANTHROPIC_API_KEY` / bootstrap hook only for claude.

### Session guard (hook parts)

#### [MODIFY] `.bkit/core/hooks/preflight-linear.sh` → renamed `.bkit/core/hooks/preflight-tracker.sh`

- **Existence Check:** exists (73 lines).
- `git mv`; tracker dispatch on `bkit.tracker.default` (`python3`); GitHub REST `curl` + `BKIT_GH_TOKEN` (owner/repo from `git remote get-url origin`), Linear GraphQL `state { name type }`, Jira `node_modules/.bin/bkit issues fetch --issue KEY --outbox "$TMPDIR" --json` (bin absent → HARD STOP); `curl --connect-timeout 5 --max-time 15`, Jira `timeout 20` when present; fail closed naming tracker + reason; no id on github / jira → `Guard pre-check: SKIPPED — no issue id; bkit:auto not verified`, exit 0.

#### [MODIFY] `.bkit/core/.claude/hooks/bkit-preflight.sh`

- **Existence Check:** exists (trigger `:79`, part line `:103`, header `:4-17`).
- Trigger `LINEAR_ISSUE_ID` or `GITHUB_ISSUE_ID`; `# {{BKIT_PART preflight-tracker.sh}}`; header text tracker-neutral.

#### [MODIFY] `.bkit/core/.cursor/hooks/bkit-preflight.sh`

- **Existence Check:** exists (trigger `:77`, part line `:96`, header `:4-15`).
- `# {{BKIT_PART preflight-tracker.sh}}`; header text tracker-neutral; trigger unchanged.

#### [DELETE] `.bkit/core/hooks/preflight-linear.sh`

- Removed by the TASK 2 rename; no alias (Supersession Inventory).

### Router template (copy-and-own)

#### [MODIFY] `.bkit/templates/.github/workflows/bkit-cloud.yml`

- **Existence Check:** exists (596 lines).
- Header: one agent per run, `BKIT_` secrets, every tracker.
- Context job: `Check runner credentials` (`enabled` iff any agent `BKIT_` secret set); checkout `dev` (dispatch, dev arm) or the PR head branch (`feat/**`); `setup-node {{NODE_VERSION}}` (`cache: pnpm`) + `pnpm/action-setup` + `Install bkit` (`pnpm install --frozen-lockfile --ignore-scripts`, `continue-on-error: true`), all `if: enabled`; `Select agent job` (reads `bkit.cloud.agent`; sets one of `claude` / `opencode` / `codex`); `Resolve phase + brief context`: GitHub-only no-op deleted; feat arm `bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json`; dev arm subject → `$RUNNER_TEMP` file → `fids parse --prompt-file` → `fids parse --branch "feat/$FID"`; `bkit_gate` replaces both `gh issue view` sites with the outcome table + `$GITHUB_STEP_SUMMARY` row; tracker secrets in step `env:`.
- `run` (claude): `BKIT_ANTHROPIC_API_KEY`; tracker secrets in dispatch step env; `claude_args` comment "GitHub MCP only; other trackers via bkit verbs".
- `opencode`: provider `BKIT_` secrets mapped to their own env names (no fan-out); tracker secrets in dispatch env.
- `codex` (new job): `if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'`; opencode permissions; concurrency lane suffix `-codex`; checkout `dev` + git user + vale; deps install; trust step (`$RUNNER_TEMP/codex-home/config.toml`); `openai/codex-action@<sha> # v1` (`openai-api-key: ${{ secrets.BKIT_OPENAI_API_KEY }}`, `sandbox: danger-full-access`, `allow-bots: true`, `codex-home`, `codex-version: 0.165.0` renovate-annotated, `prompt: "$bkit-auto <phase> <arg>"`, `GH_TOKEN` + tracker secrets); `if: always()` summary step; job comment on `drop-sudo` and the action's Node 24 on `PATH`.

#### [MODIFY] `.bkit/shared/.bkit/.env.example`

- **Existence Check:** exists (`BKIT_ANTHROPIC_API_KEY` `:82-86`).
- `BKIT_OPENAI_API_KEY=` row (comment: codex router job + Codex CLI pay-per-token).

### bkit's own copies

#### [MODIFY] `.github/workflows/bkit-cloud.yml`

- **Existence Check:** exists (adopted copy; differs only in `runs-on` ×3; disabled per `592-cloud-lane-disabled-in-bkit-repo`).
- Re-copied in every template task with `runs-on` + `{{NODE_VERSION}}` re-applied.

#### [MODIFY] `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`

- **Existence Check:** exists.
- `bkit-cloud.yml` entry: `{{NODE_VERSION}}` edit row (TASK 9); `runs-on` count 3 → 4 (TASK 12).

#### [MODIFY] repo-root mirrors (regenerated, TASK 19)

- **Existence Check:** `.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`, `.bkit/*.md`, `.bkit/.env.example` exist; `bkit install` rewrites them; header text outside `bkit:start/end` hand-synced when the parity test reports it.

### Cron Jobs & Scheduled Tasks

None — `bkit-cloud.yml` triggers (`workflow_run`, `workflow_dispatch`) unchanged; no schedule.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/core/hooks/preflight-linear.sh` (path + `{{BKIT_PART preflight-linear.sh}}` lines) | `.bkit/core/hooks/preflight-tracker.sh` | DELETE | Internal render part; no external caller; renamed in TASK 2. |
| Linear guard terminal-by-name check (`preflight-linear.sh:62`, `Done` / `Cancelled`) | category check (`state.type`) | DELETE | Fails open on renamed states. TASK 2. |
| `validateCloudTrackerMatch` pairing logic + name | `validateCloudTrackerWired` | DELETE | Internal export; callers updated in TASK 6. |
| Router GitHub-only no-op (`bkit-cloud.yml:188-194`) | tracker-agnostic gate | DELETE | TASK 9. |
| Router `gh issue view … grep -qxF 'bkit:auto'` sites (`:341`, `:424`) | `bkit_gate` over `bkit issues fetch` | DELETE | `719-cloud-kill-switch-one-bkit-path`. TASK 9 / TASK 10. |
| Router YAML FID / marker regexes + branch `sed` fallback (dev arm `^\w+\((…)\):`, feat `bkit:issue=#[0-9]+`, `:395-417`) | `bkit fids parse` | DELETE | `719-cloud-router-issue-id-via-workflow-fids-parse`. TASK 9 (feat) / TASK 10 (dev). |
| Router secrets `secrets.ANTHROPIC_API_KEY`, `secrets.OPENCODE_PROVIDER_KEY` + fan-out | `BKIT_` secrets | DELETE | Template reads only `BKIT_` names; consumer-side legacy secrets are surfaced by the detect-only advisory, not read (TASK 8 / TASK 11). |
| Additive multi-job dispatch (`claude` + `opencode` both start) | `Select agent job` | DELETE | `719-cloud-router-dispatches-recorded-agent-only`. TASK 8. |
| `buildCloudSetupAdvisory` Jira early return (`if (issueTracker === "jira") return null`) | tracker-neutral `cloud-router-none` | DELETE | `jira-local-runs-only` superseded. TASK 14. |
| Hard-coded Linear lines in `runCloudModule` (`cloud.ts:164`, `:181`) | `trackerAdvisoryLines` | DELETE | TASK 7. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | Build-phase learnings only (e.g. live codex / Cursor findings from TASK 4 / TASK 13), written by the build's knowledge writer; no plan task. |
| `docs/decisions.jsonl` | Rows in the `**Ledger rows:**` line (written at plan time). |
| `docs/deferrals.jsonl` | `397-dual-agent-…` `TRIAGED`; `719-runner-tracker-mcp-fallback`, `719-linear-jira-router-live-read` (written at plan time). |
| `docs/architecture.md` | No change: hook parts, templates and engine modules keep their placement. |
| `docs/technology.md` | No change: no new framework or library. |
| `docs/data-schema.md` | No change: no database. |
| `docs/design.md` | No change: no UI. |
| `docs/testing.md` | Key-file rows for `cloud-ctx-step.integration.test.ts` (fixture bkit bin, recorded `fetch` replies, outcomes), `workflow-templates.integration.test.ts` (codex job, actionlint), `preflight-sh.integration.test.ts` (per-tracker guard, `curl` stub) — TASK 18. |
| `docs/observability.md` | `[bkit-cloud] gate:` annotations + summary row (TASK 9); § Phase 3 Credential + Migration Findings `detectCiRouterSecrets` row with the new findings (TASK 15); `buildCloudSetupAdvisory` sniffs (TASK 14). |
| `docs/migrations.md` | § Detect-only guards rows: `cloud-router-tracker-stale` + `cloud-router-codex-missing` (TASK 14), `cloud-router-secret-renamed` (TASK 15). |
| `docs/security.md` | `:22` secret names; `:67` opencode provider keys (no fan-out); § CI Auto-Route Trust: engine-owned FID allowlist, dev subject via `fids parse --prompt-file`, kill switch on every tracker, tracker keys at step scope — TASK 18. |
| `docs/deployments.md` | § `bkit-cloud.yml` jobs table (`:580-597`): one agent per run, `BKIT_` secrets, codex job, context install — TASK 18. |
| `.bkit/core/.bkit/cloud.md` | Purpose + support matrix one row per agent (no tracker columns); § Post-CI auto-routing codex row; credentials table (`BKIT_` names, tracker keys); GitHub-tracker-only text gone (`:46`, `:445-475`); § Routing decision tracker-neutral; troubleshooting `verdict` / `reason` table + codex summary line; codex runner notes; session guard per tracker, no-id sessions unguarded, Codex Cloud unguarded; Linear / Jira router dispatch "not yet verified live"; TASK 4 / TASK 13 records — TASK 17 (+ TASK 4, TASK 13 records). |
| `.bkit/core/.bkit/providers.md` | `preflight-linear.sh` row → `preflight-tracker.sh` (`:307`); Codex rows (`--auto=codex`, router job) — TASK 17. |
| `.bkit/core/.bkit/templates.md` | `{{NODE_VERSION}}` row also lists `bkit-cloud.yml` (`:83`) — TASK 9; secrets line `:199` — TASK 17. |
| `.bkit/core/.bkit/install.md` | `:170`, `:314`, `:321`, `:361` — variants incl. codex, any tracker, `BKIT_` secrets — TASK 17. |
| `.bkit/core/.bkit/README.md` | `:312` `--auto=claude\|cursor\|opencode\|codex`; GitHub / Linear / Jira guard requirements (`:352-370`) — TASK 17. |
| `.agents/docs.md` | No change: no new doc. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — no database. | — |
| **Code** | `git revert {COMMIT}` of the squash-merge, then `pnpm build` + `bkit install` regenerate `dist/` and mirrors | Consumers on the new bkit version roll back by pinning the previous release; adopted routers are consumer-owned and keep whichever copy they merged. |
| **Risk window** | A consumer upgrades bkit and re-copies the router before renaming secrets → no dispatch until `gh secret set BKIT_…` | Fails safe (green, notice + `cloud-router-secret-renamed`); recordings of `bkit.cloud.agent` = `codex` stay valid only on the new version — a rolled-back bkit rejects `codex` at `parseCloudAgents` (consumer re-runs `bkit install --auto=<other>`). |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: guard (engine fact → hook part) → live guard check → install engine → router context job → agent jobs → live codex proof → checks → docs → verification. Every task that edits `.bkit/templates/.github/workflows/bkit-cloud.yml` re-copies it to `.github/workflows/bkit-cloud.yml` (re-applying `runs-on` and, from TASK 9, `{{NODE_VERSION}}`) so `dogfood-templates.test.ts` stays green. Every engine task commits `pnpm build` output (`dist/`) with its sources.

**Integration shape (advice, not a gate):** one PR for all tasks is fine; natural commit seams are the group boundaries.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Tracker-aware session guard (WS-1, WS-2)

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `terminal` fact on `bkit issues fetch` (`719-issues-fetch-terminal-fact`)
  - **UPDATE:** `fetchIssue` in `.bkit/core/engine/commands/workflow/tracker.ts`: every tracker's result carries `terminal` from one helper; Linear fetch query asks `state { name type }`
  - **UPDATE:** `readBlockers` in `.bkit/core/engine/commands/workflow/tracker.ts`: `open` = not the shared helper's `terminal`
  - **UPDATE:** `fetchVerb` in `.bkit/core/engine/commands/workflow/issues.ts`: facts `{title, url, state, labels, terminal}` on stdout and in `issue-facts.json`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.ts`: `fetch` spec `output` lists `terminal` and names `labels`, exit 80 + `reason`, `skipped` as the `bkit-cloud.yml` router contract
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tracker.test.ts`: recorded GitHub / Linear / Jira fetch replies carry `state.type` / `statusCategory` (`stubFetch`, gh stub)
  - **UPDATE:** `dist/commands/workflow/tracker.js`: `pnpm build` output
  - **UPDATE:** `dist/commands/workflow/issues.js`: `pnpm build` output
  - **DONE WHEN:** the five tests below pass; `tracker.test.ts` `blockers` cases (`:751`) still pass; `node dist/cli.js issues fetch --help` lists `terminal`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `github fetch marks a closed issue terminal and an open one not` fails on `terminal` absent or true for an open issue
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `linear fetch marks a completed state renamed Shipped terminal` fails on a name-based judgement reading `Shipped` as open
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `linear fetch marks a canceled state terminal and a started state not` fails on canceled read as open or started as terminal
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not` fails on the status name deciding instead of `statusCategory.key`
    - `.bkit/core/engine/commands/workflow/issues.test.ts` `fetch prints terminal in its facts and in issue-facts.json` fails on `terminal` missing from stdout or the facts file

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Rename the guard part to `preflight-tracker.sh`; tracker dispatch, GitHub branch, Linear by category (`719-session-guard-shared-tracker-part`)
  - **UPDATE:** `.bkit/core/hooks/preflight-linear.sh`: `git mv` to `.bkit/core/hooks/preflight-tracker.sh`; dispatch on `bkit.tracker.default` (`python3`); GitHub REST read (`curl` + `BKIT_GH_TOKEN`, owner/repo from `git remote get-url origin`, id from `GITHUB_ISSUE_ID` else leading digits of `feat/{FID}`); Linear query `state { name type }`, terminal by `type`; every `curl` with `--connect-timeout 5 --max-time 15`; any unreadable answer HARD STOPs naming tracker + reason
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-preflight.sh`: `# {{BKIT_PART preflight-tracker.sh}}`
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-preflight.sh`: `# {{BKIT_PART preflight-tracker.sh}}`
  - **UPDATE:** `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`: `curl` stub on `PATH` (`runPreflight` `path` option); Linear stubs carry `state.type`; describe "generated from one Linear guard" (`:176-190`) reads the renamed part
  - **DELETE:** `.bkit/core/hooks/preflight-linear.sh`: removed by the rename; no alias
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -l 'preflight-linear' -- .bkit/core/hooks .bkit/core/.claude .bkit/core/.cursor .bkit/core/engine` prints nothing; the five tests below and `.bkit/core/engine/render/parts.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github issue without bkit:auto stops the Cursor background session` fails on the session continuing under the GitHub tracker
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github closed issue stops the session and an open labelled one passes` fails on a closed issue passing or an open labelled one stopping
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github read failure stops the session naming the tracker and the reason` fails on a curl failure passing or stopping without the reason
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `linear completed state renamed Shipped stops the session` fails on the `Done` / `Cancelled` name check letting `Shipped` through
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `generated Claude and Cursor hooks carry the one preflight-tracker.sh part` fails on either host splicing a different or missing part

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Guard Jira branch, no-id line, Claude `GITHUB_ISSUE_ID` trigger (`719-guard-issue-id-sources`, `719-tracker-guard-no-issue-id-not-verified`, `719-cursor-jira-guard-hard-stop-without-bkit-bin`)
  - **UPDATE:** `.bkit/core/hooks/preflight-linear.sh`: in the part TASK 2 renamed to `.bkit/core/hooks/preflight-tracker.sh` — Jira key from `feat/{FID}` uppercased, read via `node_modules/.bin/bkit issues fetch --issue KEY --outbox "$TMPDIR" --json` under `timeout 20` when present, pass on `bkit:auto` and `terminal` false; bin absent → HARD STOP naming it; no id under github / jira → `Guard pre-check: SKIPPED — no issue id; bkit:auto not verified`, exit 0; tracker unset / `none` → Linear branch when `LINEAR_ISSUE_ID` set, else advisory context, exit 0
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-preflight.sh`: trigger `LINEAR_ISSUE_ID` or `GITHUB_ISSUE_ID` (`:77-79`); header comments (`:4-17`) tracker-neutral
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-preflight.sh`: header comments (`:4-15`) tracker-neutral
  - **UPDATE:** `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`: describe "Claude SessionStart preflight.sh — no Jira guard" (`:115-130`) rewritten to the Jira guard; fixture `node_modules/.bin/bkit` printing recorded `fetch` replies
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the five tests below pass; Linear "missing `LINEAR_ISSUE_ID` HARD STOP" cases (`:78-113`, `:132-157`) still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `jira terminal issue stops the Cursor background session` fails on a `terminal: true` fact passing
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `jira session without node_modules/.bin/bkit stops naming the missing bin` fails on an absent bin passing or skipping
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `%s session with no issue id records bkit:auto not verified and exits 0` fails on a HARD STOP or a missing context line (github, jira)
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `Claude session carrying GITHUB_ISSUE_ID runs the tracker guard` fails on the Claude trigger ignoring `GITHUB_ISSUE_ID`
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `unset tracker without LINEAR_ISSUE_ID adds advisory context and exits 0` fails on a stop or a missing advisory

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Live Cursor `sessionStart` check

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Live Cursor background `sessionStart` dump (`719-cursor-jira-guard-hard-stop-without-bkit-bin`; repo per Open Question 1)
  - **READ:** `.bkit/core/.cursor/hooks/bkit-preflight.sh`: the rendered guard the session runs
  - **UPDATE:** `.bkit/core/.bkit/cloud.md`: § Cursor Cloud Agents — dated record of one live background session: `sessionStart` env, `ls node_modules/.bin/bkit` result, whether `GITHUB_ISSUE_ID` was injected for an `@cursor` GitHub-issue session and which branch its CI trigger checked out
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `.bkit/core/.bkit/cloud.md` holds the dated observation; it shows `node_modules/.bin/bkit` present at `sessionStart` (absent → build stops here and the plan gains the 30 s poll through a plan update).
  - **TEST FIRST:** n/a — @live (golden) tier; live Cursor background session, no unit / integration behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Install engine — `codex` variant and wired-tracker rule (WS-3)

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `codex` cloud variant (`719-any-cloud-agent-any-wired-tracker`)
  - **UPDATE:** `CLOUD_MODES` in `.bkit/core/engine/install/manifest.ts`: add `codex`
  - **UPDATE:** `CLOUD_VARIANTS` in `.bkit/core/engine/cli.ts`: add `codex`; help text (`:702-709`, `:801`) lists `--auto=<claude|cursor|opencode|codex>` with no tracker pairing
  - **UPDATE:** `.bkit/core/engine/cli.test.ts`: `CLOUD_VARIANTS` join case (`:941`)
  - **UPDATE:** `dist/install/manifest.js`: `pnpm build` output
  - **UPDATE:** `dist/cli.js`: `pnpm build` output
  - **DONE WHEN:** the three tests below pass; `node dist/cli.js install --help` lists `codex`.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/manifest.test.ts` `parseCloudAgents accepts codex` fails on `codex` parsed as invalid or `none`
    - `.bkit/core/engine/cli.test.ts` `--auto=codex parses to the codex cloud variant` fails on the unknown-variant exit
    - `.bkit/core/engine/cli.test.ts` `--auto=<bad> lists claude, cursor, opencode and codex` fails on `codex` missing from the valid values

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Wired-tracker rule and `.codex/` prerequisite (`719-auto-refuses-tracker-none`, `719-auto-codex-requires-codex-host`)
  - **UPDATE:** `validateCloudTrackerMatch` in `.bkit/core/engine/commands/install/install.ts`: renamed `validateCloudTrackerWired`; refuses only tracker `none` with `[bkit] --auto=<v> needs a wired tracker: bkit install --tracker=<github|linear|jira> --auto=<v>`; same pre-write call site (`:393`)
  - **UPDATE:** `.bkit/core/engine/commands/install/install.ts`: prerequisite branch (`:403-413`) adds `codex` → `.codex/` exists or `modules.has("codex")`, else exit 1 naming `bkit install --codex`
  - **UPDATE:** `.bkit/core/engine/cli.ts`: `:817` comment names `validateCloudTrackerWired`
  - **UPDATE:** `.bkit/core/engine/commands/install/install.test.ts`: describe `validateCloudTrackerMatch` (`:91-140`) rewritten to the wired-tracker rule
  - **UPDATE:** `.bkit/core/engine/commands/install/install.integration.test.ts`: "Challenge Finding 3" pairing-refusal cases (`:841-950`) rewritten to the new rule
  - **UPDATE:** `dist/commands/install/install.js`: `pnpm build` output
  - **UPDATE:** `dist/cli.js`: `pnpm build` output
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the five tests below pass; `git grep -n 'validateCloudTrackerMatch' -- .bkit/core` prints nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/install/install.test.ts` `validateCloudTrackerWired passes %s with %s` fails on any variant x github / linear / jira pairing refused
    - `.bkit/core/engine/commands/install/install.test.ts` `validateCloudTrackerWired refuses tracker none naming --tracker=` fails on `none` passing or the message lacking `--tracker=`
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `--auto=codex without .codex/ exits 1 naming --codex and writes nothing` fails on a zero exit or a written `package.json`
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=jira --codex --auto=codex exits 0 and records codex` fails on the one-shot install refused or `bkit.cloud.agent` not `codex`
    - `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=github --auto=cursor exits 0 and records cursor` fails on the old cursor -> linear pairing error

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Cloud advisories from a variant x tracker table; `BKIT_OPENAI_API_KEY` env row (`719-cloud-advisories-variant-by-tracker-table`, `719-cloud-router-secrets-bkit-prefixed`)
  - **UPDATE:** `runCloudModule` in `.bkit/core/engine/install/modules/cloud.ts`: per-variant rows (claude: adopt router, `/install-github-app`, `BKIT_ANTHROPIC_API_KEY` or federation variables; opencode: `--opencode` first, configured provider's `BKIT_` key; codex: `--codex` first, `.codex/bkit-cloud.md`, `BKIT_OPENAI_API_KEY`, vendor `@Codex` / Codex for Linear named not installed; cursor: `.cursor/` templates, dashboard CI trigger, per-tracker native trigger) + `trackerAdvisoryLines(ctx.issueTracker, variant)` replacing the hard-coded Linear lines (`:164`, `:181`)
  - **READ:** `OPENCODE_PROVIDER_DEFAULTS` in `.bkit/core/engine/shared/egress.ts`: provider → env var name
  - **UPDATE:** `.bkit/shared/.bkit/.env.example`: `BKIT_OPENAI_API_KEY=` row with its comment, beside `BKIT_ANTHROPIC_API_KEY`
  - **UPDATE:** `.bkit/core/engine/install/modules/cloud.integration.test.ts`: existing cases (`:64-170`) asserting `ANTHROPIC_API_KEY` / Linear lines move to the `BKIT_` names and the tracker table
  - **UPDATE:** `dist/install/modules/cloud.js`: `pnpm build` output
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the five tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/cloud.integration.test.ts` `codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY` fails on no codex branch
    - `.bkit/core/engine/install/modules/cloud.integration.test.ts` `%s variant under %s names only that tracker's key` fails on any advisory naming another tracker's key
    - `.bkit/core/engine/install/modules/cloud.integration.test.ts` `claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables` fails on the legacy `ANTHROPIC_API_KEY` name
    - `.bkit/core/engine/install/modules/cloud.integration.test.ts` `opencode variant advisory names the configured provider's BKIT_ key` fails on `OPENCODE_PROVIDER_KEY` or a wrong provider key
    - `.bkit/core/engine/audits/templates/templates-content.test.ts` `vendor API keys are BKIT_-prefixed` fails on `BKIT_OPENAI_API_KEY` absent from `.env.example`

<!-- bkit:task 7 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Router context job — `BKIT_` secrets, one agent, tracker-agnostic gate (WS-4)

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `Check runner credentials` reads `BKIT_ANTHROPIC_API_KEY` (or both federation variables), any of `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY`, `BKIT_OPENAI_API_KEY`; `enabled` = any set
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: new `Select agent job` step after checkout: reads `bkit.cloud.agent`, sets exactly one of `claude` / `opencode` / `codex` (plus `agent`) only when that agent's secret is set; else `no-agent` notice naming the missing secret (or Cursor's native triggers / no variant) and the ignored secrets; `run` / `opencode` job `if:` read the selected outputs
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `run` job action input `secrets.BKIT_ANTHROPIC_API_KEY`; `opencode` dispatch step maps each provider `BKIT_` secret to its same-named env var (fan-out of `OPENCODE_PROVIDER_KEY` removed); header comments describe one agent per run
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy from the template, `runs-on` re-applied
  - **UPDATE:** `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`: describe "gate step — per-job credential detection" (`:808-876`) to the `BKIT_` names; `Select agent job` cases via `extractStepScript`
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: describe "bkit-cloud.yml template — GitHub-only content" pins of `ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}` and the agent-job `if:` shape
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the seven tests below pass; `dogfood-templates.test.ts` passes; `git grep -n 'OPENCODE_PROVIDER_KEY\|secrets.ANTHROPIC_API_KEY' -- .bkit/templates .github/workflows` prints nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `enabled is true when any agent BKIT_ secret is set and false when none is` fails on a legacy name enabling the run or a `BKIT_` name ignored
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job` fails on opencode or codex also selected
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set` fails on the additive claude job starting
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded agent without its secret selects no job and names the missing secret` fails on another agent's secret starting a job or a silent no-op
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded %s selects no router job` fails on any router job selected for cursor or none
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY` fails on the legacy secret still read
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `opencode dispatch maps each provider BKIT_ secret to its own env name` fails on the `OPENCODE_PROVIDER_KEY` fan-out remaining

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: context checkout `ref` = PR head branch on `feat/**`, `dev` otherwise; `setup-node` `{{NODE_VERSION}}` (`cache: pnpm`) + `pnpm/action-setup` + `Install bkit` (`pnpm install --frozen-lockfile --ignore-scripts`, `continue-on-error: true`), all `if: enabled`; GitHub-only no-op (`:188-194`) deleted
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `bkit_gate <issue>` shell function (outcomes `bkit-unavailable` / `no-issue` / `unreadable` / `label-absent` / `pass`, `|| rc=$?` captures, `::warning::` vs `::notice::`, one `$GITHUB_STEP_SUMMARY` row `tracker | issue | verdict | reason | jobs`) replaces both `gh issue view … grep -qxF 'bkit:auto'` sites (`:341`, `:424`); feat arm `node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json` replaces the marker regex + branch fallback (`:395-417`); `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` + `GH_TOKEN` in the ctx step `env:`
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, `runs-on` + `{{NODE_VERSION}}` re-applied
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `bkit-cloud.yml` entry gains the `{{NODE_VERSION}}` edit row
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: `{{NODE_VERSION}}` row (`:83`) lists `bkit-cloud.yml`
  - **UPDATE:** `docs/observability.md`: `[bkit-cloud] gate:` annotations + the summary row
  - **UPDATE:** `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`: `setupFixture` writes `node_modules/.bin/bkit` (real CLI via `requireTsx()`, or recorded `issues fetch` reply + exit code); tracker no-op `it.each` (`:357`) and "a github tracker passes the tracker gate" (`:381`) rewritten as gate outcomes; feat-path describes (`:504-807`) to `fids parse`
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: describe "T2.7 — two-tier CI gate positive assertions" (c) and "Challenge Finding 1 — SHARED-DERIV …" feat-arm pins
  - **DEPENDS ON:** 1, 8
  - **DONE WHEN:** the eight tests below pass; `dogfood-templates.test.ts` passes; `git grep -n 'gh issue view' -- .bkit/templates/.github/workflows/bkit-cloud.yml` prints nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `github feat run passes the gate through the real bkit and stub gh` fails on the gate not reading labels through `bkit issues fetch`
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `label removed gives label-absent, skip and a summary row` fails on a dispatch or a missing summary row after the label is gone
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s recorded fetch reply carrying bkit:auto passes the gate` fails on the Linear / Jira no-op still firing
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `jira marker AB2-12 dispatches` fails on a Jira key with digits rejected
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green` fails on a red run, a dispatch or no secret name
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s fetch output is unreadable reason=output-unparseable` fails on empty or non-array output read as label-absent or pass
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `absent node_modules/.bin/bkit warns bkit unavailable and exits green` fails on a red run or a dispatch
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `feat branch with no marker and no feature row gives no-issue` fails on a guessed issue id or a dispatch

<!-- bkit:task 9 end -->

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### TASK GROUP 5: Router dev arm and agent jobs (WS-4, WS-5)

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Dev arm through `fids parse --prompt-file` (`719-cloud-router-issue-id-via-workflow-fids-parse`, `719-router-dev-arm-issue-from-feature-row`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: dev arm writes the commit subject (`head -1`) to a `$RUNNER_TEMP` file → `node_modules/.bin/bkit fids parse --prompt-file <file> --json` → `fidNamed`; issue via `fids parse --branch "feat/$FID" --json`; non-zero exit or null `fidNamed` → today's no-FID no-op; every remaining YAML FID / issue regex deleted; then `bkit_gate` before the stale-run guard and `bkit_dev_dispatch_guard`
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, edits re-applied
  - **UPDATE:** `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`: dev-path describes (`:274-472`) incl. "T16 Jira digit no-op" (`:337`) to the engine parse; fixture repo seeds `docs/plans/{YYYYMM}/logs/{FID}/` and a feature row
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: `ISSUE=$(…grep -oE` dev pins
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the three tests below pass; `git grep -nE 'grep -oE|\[0-9\]\+\|\[a-z\]\+-\[0-9\]\+' -- .bkit/templates/.github/workflows/bkit-cloud.yml` shows no FID / issue regex.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row` fails on the YAML regex path or the subject's `(#PR)` read as the issue
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `linear-shaped FID under the github tracker gives no-issue and no dispatch` fails on a tracker guessed from the FID shape
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev subject naming several issues is a no-FID no-op` fails on a dispatch after `fids parse` exit 8

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Tracker secrets in the claude / opencode dispatch steps (`719-router-tracker-secrets-step-scope`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` in the `env:` of the `run` and `opencode` dispatch steps only; `claude_args` comment (`:524-525`) → "GitHub MCP only; other trackers via bkit verbs"
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, edits re-applied
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: describe "bkit-cloud.yml template — GitHub-only content" "no `BKIT_LINEAR_API_KEY`" pin removed
  - **DEPENDS ON:** 9
  - **DONE WHEN:** the test below passes; `dogfood-templates.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env` fails on a missing dispatch-step mapping or a job / workflow-scope mapping

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Router `codex` job (`719-codex-job-action-prompt-and-pin`, `719-codex-job-installs-deps-before-action`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `codex` job — `if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'`; `opencode` permissions; FID concurrency lane suffix `-codex`; checkout `dev` + git user + vale; `setup-node {{NODE_VERSION}}` (`cache: pnpm`) + `pnpm/action-setup` + `pnpm install --frozen-lockfile`; trust step writing `$RUNNER_TEMP/codex-home/config.toml` with `[projects."$GITHUB_WORKSPACE"] trust_level = "trusted"`; `openai/codex-action@<40-char sha> # v1` (re-resolve `v1`) with `openai-api-key: ${{ secrets.BKIT_OPENAI_API_KEY }}`, `sandbox: danger-full-access`, `allow-bots: true`, `codex-home`, `codex-version: "0.165.0"` under `# renovate: datasource=npm depName=@openai/codex`, `prompt: "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"`, `GH_TOKEN` + tracker secrets in step env; `if: always()` summary step (`action`, `commits`, `comments`); job comment on irreversible `drop-sudo` on reused self-hosted `{{CLOUD_RUNNER}}` and the action's Node 24 on `PATH`
  - **READ:** `.bkit/templates/.github/renovate.json5`: `customManagers` first `matchStrings` (`[\w-]*(?:VERSION|version)[=:]`) covers `codex-version:`
  - **READ:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`: `it.skipIf(!has("actionlint", …))` fill-and-lint pattern
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, `runs-on` ×4 + `{{NODE_VERSION}}` re-applied
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `bkit-cloud.yml` `runs-on: {{CLOUD_RUNNER}}` count 3 → 4
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: `needs: context` count (2 → 3) and runs-on pins
  - **DEPENDS ON:** 8, 9, 11
  - **DONE WHEN:** the six tests below pass; `dogfood-templates.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex job runs only when the context job selects codex and skip is not true` fails on a codex job gated on the secret alone or missing
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex job installs dependencies before openai/codex-action` fails on no install step or one placed after the action
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation` fails on a tag ref, a floating `codex-version` or no annotation
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt` fails on action defaults or `OPENAI_API_KEY`
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `trust step writes a codex-home config.toml trusting the workspace` fails on no file or a trust key other than `$GITHUB_WORKSPACE` (extracted bash run in a temp dir)
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `filled bkit-cloud.yml passes actionlint` fails on an actionlint error in the new jobs

<!-- bkit:task 12 end -->

<!-- bkit:group 5 end -->

<!-- bkit:group 6 start -->

### TASK GROUP 6: Live codex proof and post-install checks (WS-5, WS-7)

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Three live codex dispatches before the template ships (`719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`; repo per Open Question 1)
  - **READ:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: the template adopted in the live repo
  - **UPDATE:** `.bkit/core/.bkit/cloud.md`: § Post-CI auto-routing codex runner — run URLs of one `workflow_dispatch`, one `workflow_run` from a human push, one from a bot-authored commit
  - **DEPENDS ON:** 12
  - **DONE WHEN:** `.bkit/core/.bkit/cloud.md` records three run URLs, each showing: actor check passed, `git push` landed, `gh pr comment` landed, one tracker verb succeeded, a hyphenated `.codex/agents/*.toml` subagent spawned, the gate passed under `github.token`, and the codex summary line present.
  - **TEST FIRST:** n/a — @live (golden) tier; real `openai/codex-action` runs on GitHub Actions

<!-- bkit:task 13 end -->

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Stale-router sniffs and per-variant router text (`719-router-stale-copy-detect-only`)
  - **UPDATE:** `buildCloudSetupAdvisory` in `.bkit/core/engine/checks/after/github.ts`: `cloud-router-tracker-stale` (adopted copy contains `serves the GitHub tracker only` under linear / jira), `cloud-router-codex-missing` (no `openai/codex-action` under `cloud.agent` codex); precedence `cloud-claude-missing-id-token` → tracker-stale → codex-missing; id-token action = template re-copy + re-apply `runs-on` / `{{NODE_VERSION}}` (no `--tracker=github`); Jira early return removed; `cloud-router-none` tracker-neutral; `cloud-router` text (`:343-349`) per variant
  - **UPDATE:** `.bkit/core/engine/checks/after/github.test.ts`: describe `buildCloudSetupAdvisory` (`:286-365`) cases asserting the old text
  - **UPDATE:** `docs/migrations.md`: § Detect-only guards rows `cloud-router-tracker-stale`, `cloud-router-codex-missing`
  - **UPDATE:** `dist/checks/after/github.js`: `pnpm build` output
  - **DEPENDS ON:** 5, 9, 12
  - **DONE WHEN:** the six tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/github.test.ts` `adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale` fails on no finding under linear / jira
    - `.bkit/core/engine/checks/after/github.test.ts` `adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing` fails on no finding
    - `.bkit/core/engine/checks/after/github.test.ts` `missing id-token wins over tracker-stale and tracker-stale over codex-missing` fails on the wrong single finding
    - `.bkit/core/engine/checks/after/github.test.ts` `cloud-claude-missing-id-token action names the template re-copy, not --tracker=github` fails on the old action text
    - `.bkit/core/engine/checks/after/github.test.ts` `jira tracker without a router gets the tracker-neutral cloud-router-none nudge` fails on the Jira early return
    - `.bkit/core/engine/checks/after/github.test.ts` `cloud-router advisory names the Claude GitHub App only for cloud.agent claude` fails on Claude text for codex / opencode

<!-- bkit:task 14 end -->

<!-- bkit:task 15 start -->

- [ ] **TASK 15:** Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`)
  - **UPDATE:** `detectCiRouterSecrets` in `.bkit/core/engine/checks/after/auth.ts`: reads `cloud.agent`, tracker and opencode provider via `readBkitConfig(cwd)`; Anthropic findings (`anthropic-api-key-secret-missing`, `-shadows-federation`, `-federation-template-stale`) only for claude under `BKIT_ANTHROPIC_API_KEY`; `cloud-router-tracker-secret-missing`; `codex-api-key-secret-missing`; `cloud-router-secret-renamed` (legacy `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` present, `BKIT_` twin absent; action inlines `gh secret set <BKIT_NAME>` + `gh secret delete <legacy>`); docblock drops "GitHub-tracker only"
  - **UPDATE:** `buildCloudDashboardsAdvisory` in `.bkit/core/engine/checks/after/auth.ts`: router section names the recorded variant's `BKIT_` secret (opencode: `OPENCODE_PROVIDER_DEFAULTS[provider].envVar`)
  - **UPDATE:** `.bkit/core/engine/checks/after/auth.test.ts`: `detectCiRouterSecrets` (`:163-260`, `mockGhNames`) and dashboards (`:261-300`) cases to the `BKIT_` names
  - **UPDATE:** `docs/migrations.md`: § Detect-only guards row `cloud-router-secret-renamed`
  - **UPDATE:** `docs/observability.md`: § Phase 3 Credential + Migration Findings `detectCiRouterSecrets` row lists the new findings
  - **UPDATE:** `dist/checks/after/auth.js`: `pnpm build` output
  - **DEPENDS ON:** 5, 8
  - **DONE WHEN:** the six tests below pass; `checks/after/index.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/auth.test.ts` `%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it` fails on no finding or another tracker's key named
    - `.bkit/core/engine/checks/after/auth.test.ts` `cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing` fails on no finding or a Claude finding instead
    - `.bkit/core/engine/checks/after/auth.test.ts` `anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY` fails on a codex / opencode repo told to set a Claude key
    - `.bkit/core/engine/checks/after/auth.test.ts` `legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed` fails on no finding or no `gh secret set` / `delete` in the action
    - `.bkit/core/engine/checks/after/auth.test.ts` `legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key` fails on the wrong provider key named
    - `.bkit/core/engine/checks/after/auth.test.ts` `dashboards router section names the recorded variant's BKIT_ secret` fails on `ANTHROPIC_API_KEY` named for every router

<!-- bkit:task 15 end -->

<!-- bkit:group 6 end -->

<!-- bkit:group 7 start -->

### TASK GROUP 7: `cloud` tip and docs (WS-7, WS-8)

<!-- bkit:task 16 start -->

- [ ] **TASK 16:** `cloud` tip per variant
  - **UPDATE:** `.bkit/core/engine/checks/tips/catalogue.ts`: `cloud` tip `ask` / `steps` (`:237-251`) from the recorded variant; Claude App, `BKIT_ANTHROPIC_API_KEY` and the bootstrap hook only for claude
  - **UPDATE:** `dist/checks/tips/catalogue.js`: `pnpm build` output
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the two tests below pass; existing `catalogue.test.ts` cloud cases (`:340`) pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude` fails on Claude steps for other variants
    - `.bkit/core/engine/checks/tips/catalogue.test.ts` `cloud tip for codex names --codex and BKIT_OPENAI_API_KEY` fails on no codex text

<!-- bkit:task 16 end -->

<!-- bkit:task 17 start -->

- [ ] **TASK 17:** Shipped docs under `.bkit/core/.bkit/`
  - **UPDATE:** `.bkit/core/.bkit/cloud.md`: Purpose + support matrix one row per agent, no tracker columns (`:20-35`); § Reactive comment handlers `:46` and § Post-CI auto-routing (`:434-475`) — one agent per run, codex row, `BKIT_` credentials table incl. tracker keys, GitHub-tracker-only text removed; § Routing decision tracker-neutral; troubleshooting `verdict` / `reason` → cause → action incl. codex summary line; codex runner notes (unguarded diffs, `drop-sudo`, Node 24); session guard per tracker, no-id sessions unguarded, Codex Cloud unguarded; Linear / Jira router dispatch "not yet verified live"
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: `preflight-linear.sh` row (`:307`) → `preflight-tracker.sh`; Codex rows (`--auto=codex`, router job)
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: secrets line (`:199`) to the `BKIT_` names + codex
  - **UPDATE:** `.bkit/core/.bkit/install.md`: `:170`, `:314`, `:321`, `:361`
  - **UPDATE:** `.bkit/core/.bkit/README.md`: `:312`; guard requirements `:352-370`
  - **DEPENDS ON:** 3, 7, 12, 15
  - **DONE WHEN:** `git grep -nE 'GitHub-tracker only|GitHub tracker only|OPENCODE_PROVIDER_KEY|preflight-linear|--auto=claude\|cursor\|opencode[^|]' -- .bkit/core/.bkit` prints nothing; `bkit check` raises no doc drift.
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 17 end -->

<!-- bkit:task 18 start -->

- [ ] **TASK 18:** Repo docs and code comments
  - **UPDATE:** `docs/deployments.md`: § `bkit-cloud.yml` jobs table (`:580-597`): one agent per run, `BKIT_` secrets, codex job, context install
  - **UPDATE:** `docs/security.md`: `:22` secret names; `:67` opencode provider keys; § CI Auto-Route Trust (`:149-158`): engine-owned FID allowlist, dev subject via `fids parse --prompt-file`, kill switch on every tracker, tracker keys at step scope
  - **UPDATE:** `docs/testing.md`: key-file rows for `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts`, `preflight-sh.integration.test.ts` (`:599`)
  - **UPDATE:** `.bkit/core/engine/install/modules/opencode.ts`: comments `:163`, `:225` name the provider's `BKIT_` secret
  - **DEPENDS ON:** 9, 10, 12
  - **DONE WHEN:** `git grep -n 'OPENCODE_PROVIDER_KEY\|secrets.ANTHROPIC_API_KEY' -- docs/deployments.md docs/security.md docs/testing.md .bkit/core/engine/install/modules/opencode.ts` prints nothing.
  - **TEST FIRST:** n/a — docs and comments only, no behaviour change

<!-- bkit:task 18 end -->

<!-- bkit:group 7 end -->

<!-- bkit:group 8 start -->

### TASK GROUP 8: Mirrors and full verification

<!-- bkit:task 19 start -->

- [ ] **TASK 19:** Regenerate mirrors, full suite, dogfood
  - **UPDATE:** `dist/cli.js`: `pnpm build` (every `dist/` file regenerated)
  - **UPDATE:** `.claude/hooks/bkit-preflight.sh`: regenerated by `bkit install`; header outside `bkit:start/end` hand-synced if the parity test reports it
  - **UPDATE:** `.cursor/hooks/bkit-preflight.sh`: same
  - **UPDATE:** `.bkit/providers.md`: regenerated installed copy
  - **UPDATE:** `.bkit/.env.example`: regenerated installed copy
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
  - **DONE WHEN:** `pnpm vitest run` passes; `node dist/cli.js check` on the repo exits 0 with no drift finding; in a scratch consumer from `pnpm pack`, `bkit install --tracker=jira --codex --auto=codex` exits 0 and records `codex`, and `bkit install --auto=claude` with tracker `none` exits 1 naming `--tracker=`.
  - **TEST FIRST:** n/a — verification and regenerated mirrors, no new behaviour

<!-- bkit:task 19 end -->

<!-- bkit:group 8 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** errors logged and traced per `docs/observability.md`.
- [ ] **Update documentation:** affected docs rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `node dist/cli.js check` pass.
- [ ] **Test Synchronization:** no E2E suite; existing pins rewritten in their tasks — `install.test.ts` / `install.integration.test.ts` pairing cases (TASK 6), `cloud.integration.test.ts` (TASK 7), `cloud-ctx-step.integration.test.ts` gate / dev / feat describes (TASKS 8-10), `workflow-templates.integration.test.ts` GitHub-only + T2.7 + SHARED-DERIV pins (TASKS 8-12), `github.test.ts` / `auth.test.ts` advisory text (TASKS 14-15), `preflight-sh.integration.test.ts` no-Jira describe (TASK 3).
- [ ] **Build Configuration:** fixture `node_modules/.bin/bkit` wrappers, `curl` / `gh` stubs and recorded tracker replies live in test temp dirs or test files only; `tsconfig.json` `exclude` still drops `**/*.test.ts`; `pnpm build` output (`dist/`) carries no test file.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/tracker.test.ts`, `.bkit/core/engine/commands/workflow/issues.test.ts`):** `terminal` per tracker from recorded replies, incl. renamed done states (TASK 1).
- [ ] **Integration (`.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`):** guard per tracker, no-id line, Claude trigger, one shared part (TASKS 2-3).
- [ ] **Unit + Integration (`.bkit/core/engine/install/manifest.test.ts`, `.bkit/core/engine/cli.test.ts`, `.bkit/core/engine/commands/install/install.test.ts`, `.bkit/core/engine/commands/install/install.integration.test.ts`, `.bkit/core/engine/install/modules/cloud.integration.test.ts`, `.bkit/core/engine/audits/templates/templates-content.test.ts`):** `codex` variant, wired-tracker rule, variant x tracker advisories (TASKS 5-7).
- [ ] **Integration (`.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`):** credential gate, `Select agent job`, `bkit_gate` outcomes through a real or recorded `node_modules/.bin/bkit`, `fids parse` on both arms (TASKS 8-10).
- [ ] **Integration (`.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`):** `BKIT_` secret reads, step-scope tracker keys, codex job shape, actionlint on the filled template (TASKS 8, 11, 12).
- [ ] **Unit (`.bkit/core/engine/checks/after/github.test.ts`, `.bkit/core/engine/checks/after/auth.test.ts`, `.bkit/core/engine/checks/tips/catalogue.test.ts`):** stale-router sniffs, per-variant secret findings, renamed-secret guard, `cloud` tip (TASKS 14-16).
- [ ] **Unit (`.bkit/core/engine/audits/repo/dogfood-templates.test.ts`):** bkit's adopted `.github/workflows/bkit-cloud.yml` equals the template after its listed edits (`runs-on` x4, `{{NODE_VERSION}}`).
- [ ] **Apply local migrations:** n/a — no database.
- [ ] **Run all tests:** `pnpm test` (`vitest run`) and `pnpm bkit:test:bats` pass after `pnpm build` and `node dist/cli.js install` regenerate the mirrors (TASK 19).

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Open the three codex run URLs recorded in `.bkit/core/.bkit/cloud.md` (TASK 13) with `gh run view <id> --log`; confirm the actor check, the pushed commit, the PR comment, the tracker verb, the hyphenated subagent spawn and the codex summary line.
- [ ] **Step 2:** Read the dated Cursor `sessionStart` record in `.bkit/core/.bkit/cloud.md` (TASK 4); confirm `node_modules/.bin/bkit` was present and note whether `GITHUB_ISSUE_ID` was injected for `@cursor`.
- [ ] **Step 3:** In a scratch consumer from `pnpm pack`, run `bkit install --tracker=<github|linear|jira> --auto=<claude|cursor|opencode|codex>` across the grid (codex with `--codex`, opencode with `--opencode`); confirm each exits 0, records the variant, and its advisory names only that variant's and tracker's `BKIT_` secrets; `--auto=claude` with tracker `none` exits 1 naming `--tracker=`.
- [ ] **Step 4:** In that consumer, adopt the pre-change router copy (`git show HEAD~:.bkit/templates/.github/workflows/bkit-cloud.yml`) under `--tracker=jira`, set a legacy `ANTHROPIC_API_KEY` secret on a sandbox repo, run `bkit check`; confirm `cloud-router-tracker-stale` and `cloud-router-secret-renamed` appear with their re-copy / `gh secret set` actions.
- [ ] **Step 5:** On a `bkit:auto` issue in the live repo, remove the label and push to its `feat/**` branch; confirm the router run is green, dispatches nothing and its step summary row reads `label-absent`.
