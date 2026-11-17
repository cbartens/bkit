# Brief: group 11 — Challenge round 2 findings (tests)

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
- Group 9: Mirrors and full verification — done
  - TASK 18: Regenerate mirrors, full suite, dogfood — done
- Group 10: Challenge round 1 findings — done
  - TASK 21: A rejected tracker key is printed into the run's warning annotation: on `bkit issues fetch` exit 80 `reason=auth` with `BKIT_JIRA_API_KEY` (or `BKIT_LINEAR_API_KEY`, or `GH_TOKEN`) set, `${!secret_var:-empty or missing}` expands to the secret's value, so the warning reads `set but rejected<value>` and exposure rests on GitHub log masking alone — done
  - TASK 22: A failed `Install bkit` on a post-merge `dev` CI failure is misreported: with `node_modules/.bin/bkit` absent the dev arm never reaches `bkit_gate`, so it logs the `::notice::Cannot derive FID by dev commit scope or linked PR` no-op instead of the `bkit-unavailable` warning, writes no gate summary row, and the in-code comment ("`bkit_gate` reports an absent bkit") is false — done
  - TASK 23: A feat branch pushed by a steered agent session ships its own `bkit` (package.json / lockfile / committed `node_modules/.bin/bkit`), which the context job then runs to decide the `bkit:auto` kill switch, so the agent can keep itself dispatched after the human removes the label — done
  - TASK 24: A consumer who fills the new `BKIT_OPENAI_API_KEY` row in `.bkit/.env` gets that paid OpenAI key pasted into every generated cloud env block (`.claude/bkit-cloud.md`, `.cursor/bkit-cloud.md`, `.codex/bkit-cloud.md`), so every cloud agent session that reads untrusted issue / PR text holds it — done
- Group 11: Challenge round 2 findings — this group
  - TASK 25: A consumer whose repo has no `packageManager` field or no `pnpm-lock.yaml` (or any run where the pnpm download or the pnpm cache restore fails) gets a red context job instead of the documented green `bkit-unavailable` no-op: `pnpm/action-setup` and `actions/setup-node` (`cache: pnpm`) sit before `Install bkit` without `continue-on-error`, so they abort the job before the gate can report anything — open
  - TASK 26: A consumer records `--auto=codex` on `dev`, but every feature branch cut before that commit has no `bkit.cloud.agent` in its own `package.json`, so `Select agent job` reads `none` from `pr-head/`, starts nothing, and its notice tells them to "Run bkit install --auto=<claude|opencode|codex>", a command they already ran; the reverse also holds: setting `bkit.cloud.agent` to `none` (or another agent) on `dev` does not reach in-flight branches, which keep starting the agent their own `package.json` names — open

## The work

<!-- bkit:task 25 start -->

- [ ] **TASK 25:** A consumer whose repo has no `packageManager` field or no `pnpm-lock.yaml` (or any run where the pnpm download or the pnpm cache restore fails) gets a red context job instead of the documented green `bkit-unavailable` no-op: `pnpm/action-setup` and `actions/setup-node` (`cache: pnpm`) sit before `Install bkit` without `continue-on-error`, so they abort the job before the gate can report anything
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:195` · **Round:** 2
  - **DONE WHEN:** a failure in any context-job tooling step before `Install bkit` (`pnpm/action-setup` `:195`, `actions/setup-node` `:198`) leaves the job running, so `bkit_gate` emits `::warning::[bkit-cloud] gate: unreadable (bkit-unavailable)` plus its summary row, no agent starts and the run is green, matching plan § Breaking Changes and `docs/observability.md:190`; the adopted copy `.github/workflows/bkit-cloud.yml` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context job tooling setup steps before Install bkit cannot fail the job` fails on the parsed `jobs.context.steps` entries whose `uses` starts with `pnpm/action-setup@` or `actions/setup-node@` having no `continue-on-error: true`

<!-- bkit:task 25 end -->

<!-- bkit:task 26 start -->

- [ ] **TASK 26:** A consumer records `--auto=codex` on `dev`, but every feature branch cut before that commit has no `bkit.cloud.agent` in its own `package.json`, so `Select agent job` reads `none` from `pr-head/`, starts nothing, and its notice tells them to "Run bkit install --auto=<claude|opencode|codex>", a command they already ran; the reverse also holds: setting `bkit.cloud.agent` to `none` (or another agent) on `dev` does not reach in-flight branches, which keep starting the agent their own `package.json` names
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:225` · **Round:** 2
  - **DONE WHEN:** the owner decides which copy of `bkit.cloud.agent` (and `bkit.tracker.default`, read the same way by `bkit_gate` `:417` and by bkit under `cd pr-head`) wins when the feat/** head and `dev` disagree, and the router and its notice match that decision. No agent can settle it because owner decision `build-decision-4-1.md` Q1 explicitly lists `bkit.cloud.agent` / `bkit.tracker.default` as data read from the feat/** head. The owner chooses one of: (a) read routing config from the `dev` checkout (workspace root) and only marker / branch / `.bkit/issues.jsonl` from `pr-head/`; (b) read the feat/** head first and fall back to `dev` when the head lacks the field, with the notice naming which copy decided; (c) keep the head-only read and make the notice say the branch predates the recording (merge `dev` into it) instead of telling the user to run `bkit install --auto=`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording` fails on `codex=false` and the "Run bkit install --auto=" notice when the root `package.json` records `bkit.cloud.agent: "codex"`, `HEAD_DIR` points at a `package.json` with no `bkit.cloud.agent`, and `BKIT_OPENAI_API_KEY` is set

<!-- bkit:task 26 end -->

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
| exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 21 |
| dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 22 |
| context job installs and runs bkit from dev, never from the feat/** PR head | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 23 |
| context job tooling setup steps before Install bkit cannot fail the job | Integration | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | 25 |
| Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording | Integration | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | 26 |
