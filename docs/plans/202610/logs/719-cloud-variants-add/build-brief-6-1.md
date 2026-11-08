# Brief: group 6 — Router dev arm and agent jobs (WS-4, WS-5)

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
- Group 6: Router dev arm and agent jobs (WS-4, WS-5) — this group
  - TASK 10: Dev arm through `fids parse --prompt-file` (`719-cloud-router-issue-id-via-workflow-fids-parse`, `719-router-dev-arm-issue-from-feature-row`) — open
  - TASK 11: Tracker secrets in the claude / opencode dispatch steps (`719-router-tracker-secrets-step-scope`) — open
  - TASK 12: Router `codex` job; `opencode` job dependency install (`719-codex-job-action-prompt-and-pin`, `719-codex-job-installs-deps-before-action`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`, `719-opencode-job-installs-deps-before-run`) — open
- Group 7: Post-install checks (WS-7) — next
  - TASK 13: Stale-router sniffs and per-variant router text (`719-router-stale-copy-detect-only`) — open
  - TASK 14: Router secret findings per variant, renamed-secret guard, dashboards text (`719-router-secret-findings-per-variant`, `719-router-secret-rename-detect-only`) — open
- Group 8: `cloud` tip and docs (WS-7, WS-8) — later
  - TASK 15: `cloud` tip per variant — open
  - TASK 16: Shipped docs under `.bkit/core/.bkit/` — open
  - TASK 17: Repo docs and code comments — open
- Group 9: Mirrors and full verification — later
  - TASK 18: Regenerate mirrors, full suite, dogfood — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Dev arm through `fids parse --prompt-file` (`719-cloud-router-issue-id-via-workflow-fids-parse`, `719-router-dev-arm-issue-from-feature-row`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: dev arm writes the commit subject (`head -1`) to a `$RUNNER_TEMP` file → `node_modules/.bin/bkit fids parse --prompt-file <file> --json` → `fidNamed`; issue via `fids parse --branch "feat/$FID" --json`; non-zero exit or null `fidNamed` → today's no-FID no-op; every remaining YAML FID / issue regex deleted; then `bkit_gate` before the stale-run guard and `bkit_dev_dispatch_guard`; `bkit_gate` reads `labels` only, never `state` / `terminal`, so a closed issue still carrying `bkit:auto` passes (`719-router-checks-label-not-state`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: merged-PR body fallback (`:323-326`, same-repo merged PR from the existing `gh api …/commits/$HEAD_SHA/pulls` call) feeds `node_modules/.bin/bkit fids parse --marker "$PR_BODY" --json`; its `grep -oE 'bkit:fid=…'` and the `:327` FID-shape check deleted
  - **UPDATE:** `bkit_dev_dispatch_guard` in `.bkit/templates/.github/workflows/bkit-cloud.yml`: pre-path assert (`:230`) narrowed to the engine slug charset `^[a-z0-9][a-z0-9-]*$` (`FID_PATTERNS.none`: no `/`, no `.`, non-empty; Jira digits pass); comment (`:225-229`) states it checks characters on `fids parse` output, not FID shape (`719-router-dev-guard-slug-charset-assert`)
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, edits re-applied
  - **UPDATE:** `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`: dev-path describes (`:274-472`) incl. "T16 Jira digit no-op" (`:337`) to the engine parse; fixture repo seeds `docs/plans/{YYYYMM}/logs/{FID}/` and a feature row; recorded `fetch` reply with `state: closed`, `terminal: true`, `labels` incl. `bkit:auto`; stub `gh api …/pulls` returning a traversal `bkit:fid=` body
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: `ISSUE=$(…grep -oE` dev pins
  - **DEPENDS ON:** 8
  - **DONE WHEN:** the six tests below pass; `git grep -nE 'grep -oE|\[0-9\]\+\|\[a-z\]\+-\[0-9\]\+' -- .bkit/templates/.github/workflows/bkit-cloud.yml` shows no FID / issue regex; `dogfood-templates.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row` fails on the YAML regex path or the subject's `(#PR)` read as the issue
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `linear-shaped FID under the github tracker gives no-issue and no dispatch` fails on a tracker guessed from the FID shape
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev subject naming several issues is a no-FID no-op` fails on a dispatch after `fids parse` exit 8
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev arm passes the gate for a closed issue that still carries bkit:auto` fails on the gate reading `state` / `terminal` and killing the post-merge debug dispatch
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches` fails on the old `^([0-9]+|[a-z]+-[0-9]+)-` allowlist refusing a Jira FID with digits
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/` fails on `../x` reaching `find -path` / `mkdir -p` or a counter row written

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Tracker secrets in the claude / opencode dispatch steps (`719-router-tracker-secrets-step-scope`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` in the `env:` of the `run` and `opencode` dispatch steps only; `claude_args` comment (`:524-525`) → "GitHub MCP only; other trackers via bkit verbs"
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, edits re-applied
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: describe "bkit-cloud.yml template — GitHub-only content" "no `BKIT_LINEAR_API_KEY`" pin removed
  - **DEPENDS ON:** 8
  - **DONE WHEN:** the test below passes; `dogfood-templates.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env` fails on a missing dispatch-step mapping or a job / workflow-scope mapping

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Router `codex` job; `opencode` job dependency install (`719-codex-job-action-prompt-and-pin`, `719-codex-job-installs-deps-before-action`, `719-codex-job-full-access-sandbox-allow-bots`, `719-codex-job-runtime-project-trust`, `719-opencode-job-installs-deps-before-run`)
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `codex` job — `if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'`; `opencode` permissions; FID concurrency lane suffix `-codex`; checkout `dev` + git user + vale; `setup-node {{NODE_VERSION}}` (`cache: pnpm`) + `pnpm/action-setup` + `pnpm install --frozen-lockfile`; trust step writing `$RUNNER_TEMP/codex-home/config.toml` with `[projects."$GITHUB_WORKSPACE"] trust_level = "trusted"`; `openai/codex-action@<40-char sha> # v1` (re-resolve `v1`) with `openai-api-key: ${{ secrets.BKIT_OPENAI_API_KEY }}`, `sandbox: danger-full-access`, `allow-bots: true`, `codex-home`, `codex-version: "0.165.0"` under `# renovate: datasource=npm depName=@openai/codex`, `prompt: "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"`, `GH_TOKEN` + tracker secrets in step env; `if: always()` summary step (`action`, `commits`, `comments`); job comment on irreversible `drop-sudo` on reused self-hosted `{{CLOUD_RUNNER}}` and the action's Node 24 on `PATH`
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: `opencode` job gains the codex job's install block (`setup-node {{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile`) before its dispatch step; closes `docs/failures.jsonl` `bkit-cloud-opencode-job-never-installs-repo-deps`
  - **READ:** `.bkit/templates/.github/renovate.json5`: `customManagers` first `matchStrings` (`[\w-]*(?:VERSION|version)[=:]`) covers `codex-version:`
  - **READ:** `.bkit/core/engine/audits/templates/template-ci-yml.test.ts`: `it.skipIf(!has("actionlint", …))` fill-and-lint pattern
  - **UPDATE:** `.github/workflows/bkit-cloud.yml`: re-copy, `runs-on` ×4 + `{{NODE_VERSION}}` re-applied
  - **UPDATE:** `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `bkit-cloud.yml` `runs-on: {{CLOUD_RUNNER}}` count 3 → 4
  - **UPDATE:** `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`: `needs: context` count (2 → 3) and runs-on pins
  - **DEPENDS ON:** 7, 8, 11
  - **DONE WHEN:** the eight tests below pass; TASK 11's `tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env` passes with the codex dispatch step included; `dogfood-templates.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex job runs only when the context job selects codex and skip is not true` fails on a codex job gated on the secret alone or missing
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex job installs dependencies before openai/codex-action` fails on no install step or one placed after the action
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation` fails on a tag ref, a floating `codex-version` or no annotation
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt` fails on action defaults or `OPENAI_API_KEY`
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `trust step writes a codex-home config.toml trusting the workspace` fails on no file or a trust key other than `$GITHUB_WORKSPACE` (extracted bash run in a temp dir)
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `filled bkit-cloud.yml passes actionlint` fails on an actionlint error in the new jobs
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `codex summary step runs under if: always() and writes action, commits and comments` fails on a missing `if: always()` or a summary line lacking any of the three fields (extracted bash run in a temp dir)
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `opencode job installs dependencies before its dispatch step` fails on no install step or one placed after the dispatch

<!-- bkit:task 12 end -->

### Earlier tasks this group depends on

- TASK 7 (group 4, done): `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`
- TASK 8 (group 5, done): bkit on the runner, per-arm checkout, `bkit_gate`, feat-arm `fids parse` (`719-cloud-kill-switch-one-bkit-path`, `719-router-label-read-via-issues-fetch`, `719-router-bkit-from-consumer-lockfile`, `719-router-gate-outcomes-annotated`, `719-router-tracker-secrets-step-scope`, `719-router-jira-needs-key-only`, `719-router-checks-label-not-state`, `719-cloud-router-issue-id-via-workflow-fids-parse`) — `.bkit/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/bkit-cloud.yml`, `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`, `.bkit/core/.bkit/templates.md`, `docs/observability.md`, `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`, `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`

Reuse Inventory rows left out: 8; Architecture entries left out: 3 — read them in docs/plans/202610/719-cloud-variants-add-plan.md § Reuse Inventory and § Architecture & Component Changes.
