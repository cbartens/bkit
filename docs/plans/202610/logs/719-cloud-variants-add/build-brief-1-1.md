# Brief: group 1 — Tracker-aware session guard — `terminal` fact, GitHub + Linear (WS-1, WS-2)

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

- Group 1: Tracker-aware session guard — `terminal` fact, GitHub + Linear (WS-1, WS-2) — this group
  - TASK 1: `terminal` fact on `bkit issues fetch` (`719-issues-fetch-terminal-fact`) — open
  - TASK 2: Rename the guard part to `preflight-tracker.sh`; tracker dispatch, GitHub branch, Linear by category (`719-session-guard-shared-tracker-part`) — open
- Group 2: Session guard — Jira branch, no-id line, Claude trigger (WS-2) — next
  - TASK 3: Guard Jira branch, no-id line, Claude `GITHUB_ISSUE_ID` trigger (`719-guard-issue-id-sources`, `719-tracker-guard-no-issue-id-not-verified`, `719-cursor-jira-guard-hard-stop-without-bkit-bin`) — open
- Group 3: Install engine — `codex` variant and wired-tracker rule (WS-3) — later
  - TASK 4: `codex` cloud variant (`719-any-cloud-agent-any-wired-tracker`) — open
  - TASK 5: Cloud advisories from a variant x tracker table; `BKIT_OPENAI_API_KEY` env row (`719-cloud-advisories-variant-by-tracker-table`, `719-cloud-router-secrets-bkit-prefixed`) — open
  - TASK 6: Wired-tracker rule, `.codex/` prerequisite and opencode one-shot install (`719-auto-refuses-tracker-none`, `719-auto-codex-requires-codex-host`, `719-auto-opencode-one-shot-install`) — open
- Group 4: Router context job — `BKIT_` secrets and one agent (WS-4) — later
  - TASK 7: `BKIT_` router secrets and `Select agent job` (`719-cloud-router-secrets-bkit-prefixed`, `719-cloud-router-dispatches-recorded-agent-only`, `719-router-opencode-provider-secrets-direct`) — open
- Group 5: Router context job — tracker-agnostic gate and summary (WS-4) — later
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

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `terminal` fact on `bkit issues fetch` (`719-issues-fetch-terminal-fact`)
  - **UPDATE:** `fetchIssue` in `.bkit/core/engine/commands/workflow/tracker.ts`: every tracker's result carries `terminal` from one helper; Linear fetch query asks `state { name type }`; Jira fetch (`JIRA_TOOLS.getIssue`, `view: "evidence"`) reads `fields.status.statusCategory.key`, requesting that field explicitly if the evidence view omits it (record which in the code comment beside the call)
  - **UPDATE:** `readBlockers` in `.bkit/core/engine/commands/workflow/tracker.ts`: `open` = not the shared helper's `terminal`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/issues.test.ts`: `fetch` facts case for `terminal` on stdout and in `issue-facts.json`
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
  - **CREATE:** `.bkit/core/hooks/preflight-tracker.sh`: `git mv` of `.bkit/core/hooks/preflight-linear.sh` (Linear logic carried over); dispatch on `bkit.tracker.default` (`python3`); tracker `linear` keeps today's Linear checks; GitHub REST read (`curl` + `BKIT_GH_TOKEN`, owner/repo from `git remote get-url origin`, id from `GITHUB_ISSUE_ID` else leading digits of `feat/{FID}`); `BKIT_GH_TOKEN` unset → HARD STOP naming it; Linear query `state { name type }`, terminal by `type`; every `curl` with `--connect-timeout 5 --max-time 15`; any unreadable answer HARD STOPs naming tracker + reason; stdout stays one JSON document
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-preflight.sh`: `# {{BKIT_PART preflight-tracker.sh}}`
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-preflight.sh`: `# {{BKIT_PART preflight-tracker.sh}}`
  - **UPDATE:** `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`: `runPreflight` gains a `cwd` option (default `GENERATED`, `:35-48`); a fixture repo per case in its own temp dir (`package.json` with `bkit.tracker.default`, `origin` remote, `feat/{FID}` branch); `curl` stub on `PATH` (`path` option); Linear stubs carry `state.type`; describe "generated from one Linear guard" (`:176-190`) reads the renamed part
  - **DELETE:** `.bkit/core/hooks/preflight-linear.sh`: removed by the rename; no alias
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -l 'preflight-linear' -- .bkit/core/hooks .bkit/core/.claude .bkit/core/.cursor .bkit/core/engine` prints nothing; the five tests below and `.bkit/core/engine/render/parts.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github issue without bkit:auto stops the Cursor background session` fails on the session continuing under the GitHub tracker, or on stdout carrying more than one JSON document
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github closed issue stops the session and an open labelled one passes` fails on a closed issue passing or an open labelled one stopping
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github read failure stops the session naming the tracker and the reason` fails on a curl failure passing or stopping without the reason, or on an unset `BKIT_GH_TOKEN` passing or stopping without naming `BKIT_GH_TOKEN` (`it.each`: `curl` failure, `BKIT_GH_TOKEN` unset)
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `linear completed state renamed Shipped stops the session` fails on the `Done` / `Cancelled` name check letting `Shipped` through
    - `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `generated Claude and Cursor hooks carry the one preflight-tracker.sh part` fails on either host splicing a different or missing part

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Terminal-state judgement by category | `.bkit/core/engine/commands/workflow/tracker.ts` | `git grep -n 'statusCategory\|"completed"\|canceled' tracker.ts`; read `fetchIssue` (`:530-690`), `readBlockers` (`:875-935`) | `readBlockers` — Linear `state.type`, Jira `statusCategory.key`, GitHub `closed` (`:907`, `:927`); `fetchIssue` lacks it, Linear query asks `state { name }` only | EXTEND | One helper shared by `readBlockers` and `fetchIssue`; Linear fetch query adds `type`. |
| `terminal` fact on `bkit issues fetch` | `.bkit/core/engine/commands/workflow/issues.ts` | read `fetchVerb` (`:715-744`) + spec (`:838-864`) | facts `{title,url,state,labels}` | EXTEND | Add `terminal`; spec `output` notes the router contract. |
| Router label read, every tracker | `.bkit/core/engine/commands/workflow/issues.ts` | `git grep -l 'bkit:auto' .bkit/core/engine` (branches, issues, prs, runs, workflows, cloud — no read-only gate verb); `trackerTarget` / `skipOf` (`tracker.ts:153`, `:1024`) | `bkit issues fetch --issue --outbox --json` — labels, exit 80 + `reason`, `skipped` | EXTEND | Used as-is by `bkit_gate`; no new verb. |
| Session-start tracker guard | `.bkit/core/hooks/preflight-tracker.sh` | `git grep -l 'preflight-linear'` (2 host wrappers, 2 mirrors, `providers.md` ×2, preflight test, deferrals); `.bkit/core/engine/render/parts.ts` read (generic `{{BKIT_PART}}`, no name list) | `.bkit/core/hooks/preflight-linear.sh` — Linear-only part spliced into Claude + Cursor `bkit-preflight.sh` | NEW | Reason (c): the candidate `preflight-linear.sh` is a Supersession Inventory `DELETE`; TASK 2 moves it (`git mv`, Linear logic carried over) and adds the tracker dispatch; host wrappers keep triggers and output shapes. |
| Guard tests | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | read whole file (`runPreflight`, `readTemplate`) | Linear guard runtime tests; `runPreflight` takes `path` only, cwd fixed at `GENERATED` (`:35-48`) | EXTEND | `runPreflight` gains a `cwd` option + fixture repo (`package.json` `bkit.tracker.default`, `origin` remote, `feat/{FID}` branch); `curl` stub on `PATH`; per tracker / failure / trigger. |

Reuse Inventory rows left out: 0; Architecture entries left out: 6 — read them in docs/plans/202610/719-cloud-variants-add-plan.md § Reuse Inventory and § Architecture & Component Changes.
