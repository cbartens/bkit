# Brief: group 10 — Challenge round 1 findings

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
- Group 10: Challenge round 1 findings — this group
  - TASK 21: A rejected tracker key is printed into the run's warning annotation: on `bkit issues fetch` exit 80 `reason=auth` with `BKIT_JIRA_API_KEY` (or `BKIT_LINEAR_API_KEY`, or `GH_TOKEN`) set, `${!secret_var:-empty or missing}` expands to the secret's value, so the warning reads `set but rejected<value>` and exposure rests on GitHub log masking alone — open
  - TASK 22: A failed `Install bkit` on a post-merge `dev` CI failure is misreported: with `node_modules/.bin/bkit` absent the dev arm never reaches `bkit_gate`, so it logs the `::notice::Cannot derive FID by dev commit scope or linked PR` no-op instead of the `bkit-unavailable` warning, writes no gate summary row, and the in-code comment ("`bkit_gate` reports an absent bkit") is false — open
  - TASK 23: A feat branch pushed by a steered agent session ships its own `bkit` (package.json / lockfile / committed `node_modules/.bin/bkit`), which the context job then runs to decide the `bkit:auto` kill switch, so the agent can keep itself dispatched after the human removes the label — open
  - TASK 24: A consumer who fills the new `BKIT_OPENAI_API_KEY` row in `.bkit/.env` gets that paid OpenAI key pasted into every generated cloud env block (`.claude/bkit-cloud.md`, `.cursor/bkit-cloud.md`, `.codex/bkit-cloud.md`), so every cloud agent session that reads untrusted issue / PR text holds it — open

## The work

<!-- bkit:task 21 start -->

- [ ] **TASK 21:** A rejected tracker key is printed into the run's warning annotation: on `bkit issues fetch` exit 80 `reason=auth` with `BKIT_JIRA_API_KEY` (or `BKIT_LINEAR_API_KEY`, or `GH_TOKEN`) set, `${!secret_var:-empty or missing}` expands to the secret's value, so the warning reads `set but rejected<value>` and exposure rests on GitHub log masking alone
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:449` · **Round:** 1
  - **DONE WHEN:** the `reason=auth` warning names the secret and says `set but rejected` or `empty or missing` without ever expanding the secret's value (e.g. a `[ -n "${!secret_var:-}" ]` test choosing the wording); the adopted copy `.github/workflows/bkit-cloud.yml:449` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value` fails on stdout containing the fixture value (`BKIT_JIRA_API_KEY: "jira-secret-value"`, `STUB_FETCH_EXIT: "80"`, `STUB_FETCH_OUT: {"reason":"auth"}`, tracker `jira`) right after `set but rejected`

<!-- bkit:task 21 end -->

<!-- bkit:task 22 start -->

- [ ] **TASK 22:** A failed `Install bkit` on a post-merge `dev` CI failure is misreported: with `node_modules/.bin/bkit` absent the dev arm never reaches `bkit_gate`, so it logs the `::notice::Cannot derive FID by dev commit scope or linked PR` no-op instead of the `bkit-unavailable` warning, writes no gate summary row, and the in-code comment ("`bkit_gate` reports an absent bkit") is false
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:502` · **Round:** 1
  - **DONE WHEN:** a dev-arm run with `node_modules/.bin/bkit` absent emits `::warning::[bkit-cloud] gate: unreadable (bkit-unavailable)` and a `bkit-unavailable` summary row, exits green with `skip=true` and writes no dispatch-cap counter row (same outcome as the feat arm); the adopted copy `.github/workflows/bkit-cloud.yml` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green` fails on stdout carrying only the `Cannot derive FID` notice, with no `::warning::` and no `bkit-unavailable` text or summary row (dev CI `failure`, subject `feat(363-widen-bkit-cloud-trigger): x bkit [auto route]`, `node_modules` removed from the fixture workspace)

<!-- bkit:task 22 end -->

<!-- bkit:task 23 start -->

- [ ] **TASK 23:** A feat branch pushed by a steered agent session ships its own `bkit` (package.json / lockfile / committed `node_modules/.bin/bkit`), which the context job then runs to decide the `bkit:auto` kill switch, so the agent can keep itself dispatched after the human removes the label
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:172` · **Round:** 1
  - **DONE WHEN:** the owner decides where the kill switch's code comes from, and the router and `docs/security.md` § CI Auto-Route Trust match that decision. Today the feat arm checks out `workflow_run.head_branch` (`:172`), runs `pnpm install --frozen-lockfile --ignore-scripts` from that head's lockfile (`:194`), then executes `node_modules/.bin/bkit fids parse` / `issues fetch` (`:581`, `:439`) inside a `contents: write` job whose step env holds `GH_TOKEN`, `BKIT_LINEAR_API_KEY` and `BKIT_JIRA_API_KEY`. Before this diff the gate was `gh issue view` on a `dev` checkout, which the branch could not change. `docs/security.md` justifies the new steering with "the same collaborator can edit the workflow file", but the codex and opencode jobs push with `GITHUB_TOKEN`, which GitHub refuses to let edit `.github/workflows/*`, while it can edit `package.json`, `pnpm-lock.yaml` and `.bkit/issues.jsonl`. No agent can settle this because it reverses an owner-confirmed plan row (Breaking Changes: "`feat/**` context job checks out the PR head") and the existing `workflow-templates.integration.test.ts` case that pins that ref. The owner chooses one of: (a) install and run `bkit` from a `dev` checkout and read only data (marker, branch, `.bkit/issues.jsonl`) from the PR head; (b) keep the PR-head `bkit` and record in § CI Auto-Route Trust that an agent session writing the branch can defeat the kill switch for that branch.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context job installs and runs bkit from dev, never from the feat/** PR head` fails on the context job's `Install bkit` step running in a checkout whose `ref` resolves to `github.event.workflow_run.head_branch`

<!-- bkit:task 23 end -->

<!-- bkit:task 24 start -->

- [ ] **TASK 24:** A consumer who fills the new `BKIT_OPENAI_API_KEY` row in `.bkit/.env` gets that paid OpenAI key pasted into every generated cloud env block (`.claude/bkit-cloud.md`, `.cursor/bkit-cloud.md`, `.codex/bkit-cloud.md`), so every cloud agent session that reads untrusted issue / PR text holds it
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/shared/.bkit/.env.example:88` · **Round:** 1
  - **DONE WHEN:** the owner settles the plan's open Suggested Scope Expansion row ("`BKIT_OPENAI_API_KEY` reaches every generated cloud env block … Owner security decision"), which no plan task builds, and the code matches it. The key is used only by the `codex` router job as a repo Actions secret. `.bkit/core/engine/install/cloud-env.ts:35-39` (`SESSION_HIJACK_KEYS`) drops only the three Anthropic keys and pastes every other resolved `.envrc` key. No agent can settle this because `cloud-env.test.ts` `drops exactly the three documented session-hijack keys` and `docs/security.md` § Secrets Management pin the current list. The owner chooses one of: (a) drop `BKIT_OPENAI_API_KEY` from the paste block (add it to the drop list, or a new router-only list) and update that test and § Secrets Management; (b) remove the row from `.env.example`, because the key belongs only in repo secrets; (c) keep the paste and record why in § Credential surfaces.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/cloud-env.test.ts` `never lets BKIT_OPENAI_API_KEY into the paste block` fails on `renderCloudEnvBlock(resolveCloudEnvVars(tmpDir))` containing `BKIT_OPENAI_API_KEY` and the sentinel value `sk-openai-must-not-leak` when `.bkit/.env` sets it

<!-- bkit:task 24 end -->

## Deviations

fix whatever needs fixing in #719 see .worktrees/719-cloud-variants-add/docs/plans/202610/logs/719-cloud-variants-add/build-plan-verify-holistic.md and then continue bkit-build workflow
