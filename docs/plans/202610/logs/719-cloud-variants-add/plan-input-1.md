## Session Prompt — this run's, newer than everything below

/bkit-plan #719

## Issue description — oldest

### Problem

`bkit install --auto=<variant>` turns on cloud agents. Codex is not a variant, and each variant only installs with one tracker:

<!-- prettier-ignore -->
| Where | What it does |
| --- | --- |
| `.bkit/core/engine/install/manifest.ts:104` | `CLOUD_MODES` is `["claude","cursor","opencode","none"]`, so `--auto=codex` is rejected and `bkit.cloud.agent` cannot record codex |
| `.bkit/core/engine/commands/install/install.ts:123-138` (`validateCloudTrackerMatch`, exit at `:400`) | hard-fails unless claude/opencode run with the GitHub tracker or cursor runs with Linear |
| `.bkit/templates/.github/workflows/bkit-cloud.yml:188-192` | the router no-ops whenever `bkit.tracker.default` is not `github` |
| `.bkit/templates/.github/workflows/bkit-cloud.yml:341,424` | the `bkit:auto` opt-in and kill-switch checks read labels with `gh issue view`, so a Linear or Jira issue always reads as not opted in |
| `.bkit/core/engine/install/modules/cloud.ts:76-189` (`runCloudModule`) | each variant's setup advisories hard-code one tracker; no codex branch |
| `.bkit/cloud.md:6,22,52` | the support matrix pairs each agent with one tracker |

What is already tracker-independent: the cloud environments and generated `<host>/bkit-cloud.md` docs (#717); the agent's brief, read through bkit's tracker verbs (GitHub, Linear, Jira); the router's FID parsing, which accepts Linear-shaped FIDs (decision `cloud-dev-fid-regex-accepts-linear-shape`). The router's triggers (CI completion on GitHub Actions, `workflow_dispatch` with an issue id) do not depend on the tracker.

### Outcome

- `--auto=codex` is a valid cloud variant, recorded in `bkit.cloud.agent`, with its own setup advisories, the same way `--auto=claude` works.
- Every cloud variant (`claude`, `cursor`, `opencode`, `codex`) installs with any tracker (`github`, `linear`, `jira`). No variant-to-tracker hard error remains.
- `bkit-cloud.yml` runs for any tracker: the opt-in and kill-switch label checks go through a bkit tracker verb instead of `gh issue view`, and the `github`-only no-op is removed.
- `bkit-cloud.yml` gains a `codex` job beside `claude` and `opencode`, running `openai/codex-action@v1`, gated on its credential the same way the other two are.
- Each variant's advisories tell the consumer what to set for the tracker they actually use.

### Success criteria

- `bkit install --auto=codex` succeeds and records `bkit.cloud.agent: "codex"`.
- Every `--auto={claude,cursor,opencode,codex}` installs under `--tracker=github`, `--tracker=linear` and `--tracker=jira` without a hard error.
- With `bkit.tracker.default` set to `linear` or `jira`, a CI completion on a `feat/**` branch whose issue carries `bkit:auto` in that tracker dispatches the configured agent jobs; removing the label stops the next run (kill switch).
- The `codex` job runs only when its credential is set, and skips with zero billable minutes otherwise.
- No advisory printed for a variant names a tracker other than the configured one.
- `.bkit/cloud.md` support matrix lists each variant once, with no tracker pairing.
- DE-21 point 3 (`docs/decisions.jsonl`, key `de-21-141-bkit-cloud-rebuilt-on-the-claude-github-app`) is marked superseded by a new decision recording any-agent-any-tracker; `install.test.ts` tests citing it are rewritten to the new rule.

### Constraints and non-goals

- Builds on #717 (done) for `.codex/bkit-cloud.md` and the tracker-agnostic env blocks.
- The router runs on GitHub Actions, so the code host stays GitHub for every tracker.
- No new tracker values; marker contract (`.bkit/trackers.md` § Marker contract) untouched.
- Vendor-native triggers (Cursor's Linear integration, Codex for Linear, `@claude` / `@cursor` / `@Codex` mentions) stay vendor-managed; bkit documents them but does not install them.

### Decisions already made

- `--auto=codex` behaves like `--auto=claude`.
- Any cloud variant works with any tracker (Christian, 2026-10-29). This supersedes DE-21 point 3.
- The router reads the opt-in label through bkit's tracker verbs rather than gaining per-tracker API code of its own.

### Open questions

1. Which bkit verb does the router call for the label check? `bkit issues labels` computes label transitions; is there a read verb that returns an issue's current labels for every tracker, or does one need adding?
2. How does the router get the tracker credential on the runner (`BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` as repo secrets), and what do the advisories tell the consumer to set?
3. Cursor + GitHub: does Cursor's own documentation support starting a cloud agent from a GitHub issue (`@cursor`) or from its API, so `bkit-cloud.yml` can dispatch it? Only third-party write-ups say so today. If not, Cursor + GitHub/Jira is "launch manually" in the matrix rather than a hard error.
4. Should `--auto=codex` require the codex host (`--codex`) first, like `--auto=opencode` requires `.opencode/` (`install.ts:403-412`)?
5. Does removing the hard error need a `docs/migrations.md` row? Existing installs keep a valid recorded state; a consumer's copied `bkit-cloud.yml` (copy-and-own template) does not pick up the router change by itself.

### References

- #717 — Codex cloud doc + tracker-agnostic cloud docs (https://github.com/cbartens/bkit/issues/717)
- #141 / DE-21 — bkit-cloud rebuilt on the Claude GitHub App (https://github.com/cbartens/bkit/issues/141)
- `.bkit/core/engine/install/manifest.ts:85-113`
- `.bkit/core/engine/commands/install/install.ts:114-138,386-413`
- `.bkit/core/engine/install/modules/cloud.ts:55-189`
- `.bkit/templates/.github/workflows/bkit-cloud.yml:188-192,341,424`
- `.bkit/cloud.md:6,22,52`
- Codex GitHub Action: https://developers.openai.com/codex/github-action
- Codex autofix CI on `workflow_run`: https://developers.openai.com/codex/guides/autofix-ci
- Codex in Linear: https://developers.openai.com/codex/integrations/linear

###### bkit:blocked-by start

- #717

###### bkit:blocked-by end

## Issue comment — posted 2026-10-29T01:36:53.000Z

Narrowed the scope and rewrote the body; the title is now "Cloud variants: add --auto=codex on the GitHub tracker".

- **Decision (Christian, 2026-10-29):** the existing pairings stay as they are (Claude → GitHub, OpenCode → GitHub, Cursor → Linear), and Codex goes with GitHub. The "any variant with any tracker" outcome is gone. DE-21 point 3 gets updated to add codex → GitHub and stays active.
- Open questions that only applied to any-tracker are gone: how the router would read Linear labels, what Cursor + GitHub would look like, whether Jira is in scope, and whether a migration is needed. The two left are what `--auto=codex` routes to and whether it needs `--codex` installed first.
- Under review: whether we need the pairing at all. That is being checked now and may change this scope again.

## Issue comment — posted 2026-10-29T01:45:06.000Z

Scope changed again: every cloud agent now works with every tracker (Christian, 2026-10-29). This replaces the previous comment's "keep the pairings" decision. The title is back to "Cloud variants: add --auto=codex and allow any tracker".

**Why this works.** The cloud agents don't depend on the tracker. bkit's router (`bkit-cloud.yml`) starts on GitHub CI finishing, which every consumer has whatever their tracker. Only two parts of it are GitHub-only: the stop at `:188-192` when the tracker isn't GitHub, and the `bkit:auto` label checks at `:341` and `:424`, which use `gh issue view`. The body now has those checks go through a bkit tracker command instead. It also adds a `codex` job that runs `openai/codex-action@v1` (OpenAI's documented example is exactly this case: fixing CI failures after a run finishes).

**What's left open:** which bkit command the router calls to read labels, how the Linear or Jira key reaches the GitHub runner, whether Cursor's own docs support starting it from GitHub, whether `--auto=codex` needs `--codex` installed first, and whether a migration is needed. DE-21 point 3 gets marked as replaced by a new decision.

## Issue comment — posted 2026-10-29T03:24:54.000Z

Owner answers to the nine open questions in the design summary, recorded in `docs/decisions.jsonl`:

1. **Kill switch:** A, one `bkit issues fetch` path for every tracker, GitHub included (`719-cloud-kill-switch-one-bkit-path`).
2. **codex-action rights:** A, `sandbox: danger-full-access` + `allow-bots: true`, proven by three live dispatches before the template ships (`719-codex-job-full-access-sandbox-allow-bots`).
3. **Codex project trust:** A, a pre-action step writes `$RUNNER_TEMP/codex-home/config.toml` trusting `$GITHUB_WORKSPACE` (`719-codex-job-runtime-project-trust`).
4. **No issue id in a Cursor or Claude session:** A, "not verified" line, exit 0 (`719-tracker-guard-no-issue-id-not-verified`).
5. **Secret names:** every router secret uses its `BKIT_` name from `.bkit/.env`: `BKIT_OPENAI_API_KEY` (new in `.bkit/.env.example`), `BKIT_ANTHROPIC_API_KEY`, and the provider's own `BKIT_*` key in place of `OPENCODE_PROVIDER_KEY`. **Supersedes grill Q7.** Renaming live secrets needs a migration entry and an upgrade advisory (`719-cloud-router-secrets-bkit-prefixed`).
6. **Agent race:** C, the router starts only the job named by `bkit.cloud.agent`. **Supersedes grill Q9.** Deferral `397-dual-agent-same-run-double-ship-when-both-secrets-set` should close with this change (`719-cloud-router-dispatches-recorded-agent-only`).
7. **Issue id recovery:** only `bkit fids parse`, called the way the workflows call it, on every ref, with no YAML regex. On `feat/**` the context job checks out the PR head, so `.bkit/issues.jsonl` comes from that branch (`719-cloud-router-issue-id-via-workflow-fids-parse`).
8. **Linear / Jira read:** B, recorded-reply contract tests only; `.bkit/cloud.md` marks Linear / Jira dispatch as not verified live (`719-linear-jira-router-read-fixture-tests-only`).
9. **Cursor install vs sessionStart:** A, HARD STOP when `node_modules/.bin/bkit` is absent, with a live dump during build and a switch to a 30 s wait if the ordering is wrong (`719-cursor-jira-guard-hard-stop-without-bkit-bin`).

The canonical design doc `docs/plans/202610/719-cloud-variants-add-design.md` still shows answers 5, 6 and 7 as open questions with the old defaults. Plan generation should treat the decision rows as authoritative.

## Design — docs/plans/202610/719-cloud-variants-add-design.md — last committed 2026-10-29T02:51:51.000Z

<!-- bkit:anchor
baseSha: 5bb26e7c6ae15bc6bb8ae02054846025d5a45882
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: CONCERNS
<!-- verdict:end -->

# Design: Cloud variants — add `--auto=codex` and allow any tracker (#719)

## Related Issues

- #717 — Codex cloud doc + tracker-agnostic cloud docs (closed)
- #720 — AGENTS.md router stops every ordinary Codex prompt (closed)
- #495 — Pre-approve listed MCP servers on every agent host (closed)

## Acceptance Scenario

### Narrative

A team picks whichever cloud agent they like (Claude, opencode, Codex or Cursor) and whichever tracker they already use (GitHub, Linear or Jira). `bkit install --auto=<agent>` works for that pairing, and from then on a passing or failing CI run on an opted-in feature hands the work to their agent exactly as Claude + GitHub does today. Removing `bkit:auto` from the issue stops the router on every tracker, and when the router cannot tell whether the label is there it starts nothing and says why.

### Success Criteria

1. Every `--auto={claude,opencode,codex,cursor}` x `--tracker={github,linear,jira}` install succeeds (codex also needs `--codex`); `--auto=<any>` with tracker `none` still refuses and names `--tracker=`.
2. Under Linear or Jira, a CI completion on an opted-in `feat/**` branch dispatches every router job whose credential is set (claude / opencode / codex); with the label removed, nothing dispatches. Jira keys with digits (`AB2-12`) dispatch like any other.
3. When the router cannot read the label (key missing, service down, issue not found, bkit not installable, output unparseable), it starts no agent, exits green, and the run log + job summary name the reason (the missing secret by name when that is the cause).
4. The session-start guard stops a Cursor background session or a Claude session that carries an issue id whose issue lost `bkit:auto` or is finished (by state category), on GitHub, Linear and Jira.
5. Setup advisories, `bkit check` findings and `.bkit/cloud.md` name only the configured tracker's keys; the support matrix lists each agent once with no tracker pairing; an adopted `bkit-cloud.yml` that predates this change is named by an advisory on `bkit upgrade` / `bkit check`, with a `docs/migrations.md` § Detect-only guards row.

### Key Edge Cases

- **Several runner credentials set** → claude, opencode and codex jobs all start on one CI event and race on the same PR. The per-feature workflow lock does not prevent this (`logs/{FID}/.lock` lives in each runner's own checkout). Left as today, tracked by deferral `397-dual-agent-same-run-double-ship-when-both-secrets-set`, now three-way.
- **Adopted `bkit-cloud.yml` out of date** → under Linear / Jira it keeps no-oping with `serves the GitHub tracker only`; under `cloud.agent` = `codex` it has no codex job. Fails safe; the detect-only advisory is the only signal.
- **Cursor session with no issue id** (`@cursor` on a GitHub issue, Cursor's CI trigger on a checkout not named `feat/{FID}`) → the guard cannot read a label; it records that in the session context and does not stop the session (open question). Linear sessions always carry `LINEAR_ISSUE_ID` and keep today's HARD STOP when it is missing.
- **FID shape of another tracker** (Linear-shaped FID in a GitHub-tracker repo) → `bkit issues fetch --fid` resolves no issue under the configured tracker → no dispatch + notice; the router never guesses a tracker from the FID shape.
- **Issue closed after ship, `dev` CI fails** → the router checks only `bkit:auto`, never the issue state, so the post-merge debug still dispatches; finished-state refusal belongs to the session guard only.
- **`OPENAI_API_KEY` already stored for the app** → codex job starts on every opted-in CI event once the new template is merged.

### Process Sketch

- WHEN CI finishes on an opted-in `feat/**` branch under Linear → THEN the router installs the repo's bkit, reads `bkit:auto` through `bkit issues fetch`, and starts each agent job whose credential is set.
- WHEN the label is gone → THEN no agent starts; `gate: label absent` in log and summary.
- WHEN the label cannot be read (`BKIT_JIRA_API_KEY` unset, tracker down, bkit install failed) → THEN no agent starts; the reason (secret name, `reason=<r>`, `bkit unavailable`) in log and summary; run green.
- WHEN `bkit install --auto=codex` runs without `.codex/` → THEN it refuses and names `--codex`.
- WHEN a Cursor background session starts on `feat/{FID}` under GitHub and the issue lacks `bkit:auto` or is closed → THEN the guard stops it.
- WHEN a consumer runs `bkit upgrade` with a pre-change `bkit-cloud.yml` copy and tracker Linear → THEN an advisory tells them to merge the new router.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Record `codex` as a cloud variant | `CLOUD_MODES` / `parseCloudAgents` (`.bkit/core/engine/install/manifest.ts:104-113`) | `EXTEND` | Add one enum value; `bkit.cloud.agent` validation follows. |
| Refuse unusable variant / tracker combos | `validateCloudTrackerMatch` (`.bkit/core/engine/commands/install/install.ts:123-138`, call `:390-401`; also `.bkit/core/engine/cli.ts`) | `EXTEND` | Narrow to "tracker must be wired" (`none` refuses); pairing logic removed. Same pre-write position keeps the "no files written on hard error" invariant. |
| Host prerequisite for a variant | `--auto=opencode` `.opencode/` check (`install.ts:402-413`) | `EXTEND` | Same branch gains `codex` → `.codex/` or `modules.has("codex")` in the same run, naming `--codex` (Q4). |
| Per-variant setup advisories | `runCloudModule` (`.bkit/core/engine/install/modules/cloud.ts:73-186`), `CLOUD_WORKFLOW_ADOPT_STEP`, `ctx.issueTracker` (`modules/index.ts:89`) | `EXTEND` | Add `codex` branch; tracker lines from one helper keyed on `ctx.issueTracker`. |
| Router label read, every tracker | `bkit issues fetch --fid/--issue --outbox --json` (`.bkit/core/engine/commands/workflow/issues.ts:715-744`, spec `:838-864`): `labels`, `state`, exit 80 + `reason`, `skipped` | `EXTEND` | Already reads all three trackers with redaction and failure classes; facts gain one `terminal` boolean for the guard. |
| Router FID + issue recovery, every marker shape | `bkit fids parse --marker --branch` (`fids.ts:590-623`, `:795-830`); engine `any` FID pattern (`fids.ts:12,52`) | `EXTEND` | Owns the marker contract for github / linear / jira; YAML regex `bkit:issue=#[0-9]+` (`bkit-cloud.yml:396`) is GitHub-only and the YAML FID regex `[a-z]+-[0-9]+` rejects Jira keys with digits. |
| Terminal-state judgement | Blocker reads by category (`tracker.ts:900-930`: Linear `state.type`, Jira `statusCategory.key`) | `EXTEND` | Lift into `fetchIssue` facts as `terminal`; the guard and any later reader share one definition. |
| bkit CLI on the router runner | `bkit-ci.yml` setup block (`setup-node` `{{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile`, `.bkit/templates/.github/workflows/bkit-ci.yml:67-73,171`) | `EXTEND` | Same pins, same placeholder; consumer lockfile decides the bkit version. |
| Codex runner job | `run` / `opencode` jobs (`bkit-cloud.yml:471-596`), gate step (`:121-153`); `openai/codex-action@v1` (inputs read from its `action.yml`: `prompt`, `openai-api-key`, `sandbox` (empty → legacy `workspace-write`), `permission-profile`, `safety-strategy` default `drop-sudo`, `allow-bots`, write-access check) | `EXTEND` | Opencode job shape + the `bkit-ci.yml` dependency-install block before the action (spike C9: the opencode 4-step list + the action's 16 steps install no `node_modules`; `bkit-auto` Step 2 exits 127); vendor action does the Codex install and auth. |
| Session-start guard | `.bkit/core/hooks/preflight-linear.sh` rendered into `.bkit/core/.claude/hooks/bkit-preflight.sh` and `.bkit/core/.cursor/hooks/bkit-preflight.sh` via `{{BKIT_PART}}` (`.bkit/core/engine/render/parts.ts`); tests `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | `EXTEND` | Rename to `preflight-tracker.sh`, add GitHub + Jira branches; both hosts' triggers and output shapes stay theirs. |
| Stale adopted router copy | `buildCloudSetupAdvisory` content sniff (`.bkit/core/engine/checks/after/github.ts:325-350`, `cloud-claude-missing-id-token`); precedent `anthropic-federation-template-stale` (`checks/after/auth.ts:196`); `docs/migrations.md` § Detect-only guards | `EXTEND` | Two more sniffs on the same file; surfaced wherever `runPostInstallCheck` runs. Returns one `PreflightFinding \| null` → fixed precedence (Checks). |
| Router secret presence | `detectCiRouterSecrets` (`checks/after/auth.ts:173-215`) | `EXTEND` | Add tracker secret + `OPENAI_API_KEY` checks; gate the Anthropic findings on the recorded variant. |
| Gate-function contract test | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | `EXTEND` | Run the ctx step against recorded `fetch` outputs per tracker and per failure class; real `dist/cli.js` behind a fixture `node_modules/.bin/bkit` + stub `gh` proves the GitHub path through the engine end to end. |
| Multi-agent race tracking | Deferral `397-dual-agent-same-run-double-ship-when-both-secrets-set` (`docs/deferrals.jsonl:80`) | `EXTEND` | Same-key row widens it to three agents; no new deferral. |
| Decision record | `de-21-141-bkit-cloud-rebuilt-on-the-claude-github-app`, `cloud-dev-fid-regex-accepts-linear-shape` (`docs/decisions.jsonl:121,158`) | `EXTEND` | New superseding decision + status updates on both. |

No `NEW` verdicts: searched for a gate / opt-in read verb (`rg -l "bkit:auto" .bkit/core/engine`), a shared terminal-state helper, and an existing codex router job — every capability has an extendable owner.

## Architecture

Four surfaces change; the agent's own workflows (`bkit-auto.md` and the phase workflows) already read and write every tracker through `bkit` verbs and stay untouched.

<!-- prettier-ignore -->
| Surface | Owner (edit here) | Change |
| --- | --- | --- |
| Install engine | `manifest.ts`, `commands/install/install.ts`, `cli.ts`, `install/modules/cloud.ts` | `codex` variant; pairing refusal removed (wired tracker still required); `.codex/` prerequisite; advisories = variant table x configured tracker |
| Router template | `.bkit/templates/.github/workflows/bkit-cloud.yml` (copy-and-own) | Tracker no-op deleted; context job installs the repo's bkit after the credential gate; one gate function calls `bkit fids parse` + `bkit issues fetch` for all trackers; tracker secrets at step scope; `codex` job beside `run` / `opencode` |
| bkit's own adopted router | `.github/workflows/bkit-cloud.yml`; `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Re-copied from the template in the same change; test pins `runs-on: {{CLOUD_RUNNER}}` count 3 → 4 and gains a `{{NODE_VERSION}}` edit row |
| Session guard | `.bkit/core/hooks/preflight-linear.sh` → `preflight-tracker.sh`; host wrappers `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh` | One shared part dispatching on `bkit.tracker.default`; GitHub + Jira branches; terminal by category; Claude trigger widened to `GITHUB_ISSUE_ID` |
| Checks + docs | `checks/after/github.ts` (`buildCloudSetupAdvisory`, `cloud-router` advisory text `:343-349`), `checks/after/auth.ts` (`detectCiRouterSecrets`), `checks/tips/catalogue.ts:237-251` (`cloud` tip), `.bkit/cloud.md`, `.bkit/providers.md`, `.bkit/templates.md`, `docs/migrations.md`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `install.test.ts` | Stale-copy + secret advisories; `cloud` tip and `cloud-router` text per variant (no Claude key / GitHub App for non-claude variants); matrix one row per agent; DE-21 superseded |

**Boundaries:**

- Router stays on GitHub Actions for every tracker (code host = GitHub). It reads tracker state only through `bkit` verbs; no per-tracker HTTP in YAML.
- Engine owns tracker semantics (marker shapes, FID shapes, key case, terminal state, failure classes). YAML maps verb exits to notices; hooks keep their no-bkit-runtime shape for GitHub and Linear.
- Cursor: no router job (Q3). bkit documents Cursor's native triggers; only the install refusal and the GitHub-blind guard change.
- Codex Cloud tasks: no session guard (hooks unproven in cloud tasks). The router's codex job is gated by the router kill switch only.
- Vendor-native triggers (`@claude`, `@cursor`, `@Codex`, Codex for Linear, Cursor's Linear integration) stay vendor-installed; advisories name them per tracker.

**Out of scope (declared here):**

- Arbitrating several agent jobs on one PR (serialise / pick one) — tracked by `397-dual-agent-same-run-double-ship-when-both-secrets-set`.
- A Codex Cloud session-start guard — blocked until Codex runs repo hooks in cloud tasks is verified live.
- Tracker MCP fallback on runners (`mcp__linear__*` / `mcp__jira__*` in `claude_args`): Linear MCP needs browser OAuth; runner jobs rely on verbs, exit 80 → Failure Path.
- New tracker values; marker contract (`.bkit/trackers.md` § Marker contract).

**Integration points:**

- Context job → engine: `node_modules/.bin/bkit fids parse --json`, `node_modules/.bin/bkit issues fetch --json` (bin path, never `pnpm bkit`: a consumer `bkit` script would shadow the bin; absence detected by the same path); env `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` (repo secrets, Q2), `GH_TOKEN` = `github.token` for GitHub (engine `gh` inherits it when `BKIT_GH_TOKEN` is unset, `tracker.ts:181-184`); Jira site from committed `package.json` `bkit.tracker.jira.site`.
- Agent jobs → engine: same tracker secrets at dispatch-step env so the dispatched `/bkit-auto` verbs read and write the tracker. Codex: `shell_environment_policy` keeps `*KEY*` / `*SECRET*` / `*TOKEN*` variables by default (`ignore_default_excludes` default `true`), so `GH_TOKEN` and tracker keys reach agent subprocesses.
- Logging: new engine stderr reuses the owning module prefix (`[bkit-issues]`, `[bkit-fids]`; `docs/observability.md` § prefixes); router gate notices start `[bkit-cloud] gate:`; guard lines keep `Guard pre-check:`.
- Guard → tracker: GitHub REST via `curl` + `BKIT_GH_TOKEN`; Linear GraphQL (existing); Jira via `node_modules/.bin/bkit issues fetch --json` (Cursor's `environment.json` `install` runs `pnpm install` before sessions).
- Checks → GitHub: `gh secret list` / `gh variable list` (existing helpers `detectGhSecret`, `listGhNames`).

## Data Model

No database. Changed records and contracts:

<!-- prettier-ignore -->
| Record | Field | Change |
| --- | --- | --- |
| `package.json` | `bkit.cloud.agent` | Enum `claude \| cursor \| opencode \| codex \| none`. No migration: every existing value stays valid. |
| `package.json` | `bkit.tracker.default` | Unchanged. Read by the router (via engine) and by the guard (via `python3 -c json`); `--auto=<any>` requires `github \| linear \| jira`. |
| `bkit issues fetch` output | `terminal` (new, boolean) | `true` when GitHub `state` = `closed`, Linear `state.type` in `completed \| canceled`, Jira `statusCategory.key` = `done`. Added to facts JSON + `output` spec; `state` (name) unchanged. Load-bearing for the guard's Jira branch; the router ignores it. |
| `bkit issues fetch` output | `labels`, exit 80 + `reason`, `skipped` | Unchanged, now a router contract: pinned by the extended `cloud-ctx-step.integration.test.ts` and noted in the spec's `output` help. |
| GitHub repo secrets | `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` | New router inputs, same names as `.envrc` (Q2). Jira needs no site / user secret: site is committed config, auth is Bearer. |
| GitHub repo secrets | `OPENAI_API_KEY` | Gates the `codex` job (Q7). |
| Context job outputs | `codex` | New, beside `claude` / `opencode`; `enabled` true when any of the three is true. |
| Job summary row | `tracker`, `issue`, `verdict`, `reason`, `jobs` | New, one per CI-driven context run: `verdict` in `pass \| label-absent \| no-issue \| unreadable \| bkit-unavailable`; `jobs` lists enabled agent jobs with the enabling secret (`claude:ANTHROPIC_API_KEY`, `codex:OPENAI_API_KEY`, …). |
| Codex job summary line | `action`, `commits`, `comments` | New: `openai/codex-action` outcome (incl. write-access / bot check refusal), whether `dev` / PR head moved, whether a PR comment landed in the run window. |
| `.bkit/templates.md` placeholder table | `{{NODE_VERSION}}` | Now also used in `bkit-cloud.yml` (context job + `codex` job). |

## Components / Flows

### Install (`bkit install --auto=<variant>`)

1. Parse `--auto` against `CLOUD_MODES` (`codex` accepted).
2. Pre-write gate (same position as today): tracker `none` → exit 1, `[bkit] --auto=<v> needs a wired tracker: bkit install --tracker=<github|linear|jira> --auto=<v>`. No variant-to-tracker check.
3. Host prerequisite: `opencode` → `.opencode/`; `codex` → `.codex/` exists or `modules.has("codex")` (one-shot `bkit install --codex --auto=codex` passes), message names `bkit install --codex`.
4. `runCloudModule`: record `bkit.cloud.agent`; push `bkit-cloud-setup` + `cloud-env-customize` advisories from a per-variant table:

<!-- prettier-ignore -->
| Variant | Launch surface in advisory | Credential in advisory |
| --- | --- | --- |
| `claude` | adopt `bkit-cloud.yml`; `/install-github-app`; optional `@claude` | `ANTHROPIC_API_KEY` or federation variables |
| `opencode` | adopt `bkit-cloud.yml`; `--opencode` first; optional `/oc` | `OPENCODE_PROVIDER_KEY` |
| `codex` | adopt `bkit-cloud.yml`; `--codex` first; Codex Cloud env from `.codex/bkit-cloud.md`; vendor `@Codex` / Codex for Linear named, not installed | `OPENAI_API_KEY` |
| `cursor` | `.cursor/Dockerfile` + `environment.json` templates; Cursor dashboard CI trigger (`/bkit-auto $CI_STATUS $PR_NUMBER`); github / jira → `@cursor` + GitHub PR-event trigger; linear → Cursor's Linear integration (`@cursor bkit-auto KEY`) | Cursor Runtime Secrets from `.cursor/bkit-cloud.md` |

Plus one tracker line from `trackerAdvisoryLines(ctx.issueTracker, variant)`: github → `BKIT_GH_TOKEN` only (runner uses `github.token`); linear → `BKIT_LINEAR_API_KEY` (repo secret for router variants, Runtime Secret for cursor); jira → `BKIT_JIRA_API_KEY` + `bkit.tracker.jira.site` committed. Never another tracker's key.

### Router context job (`bkit-cloud.yml`)

1. `if:` free-tier gate unchanged.
2. `Check runner credentials`: adds `codex=true` iff `OPENAI_API_KEY` set, notice otherwise; `enabled` = any of three.
3. Checkout `dev` (unchanged) → `setup-node` (`{{NODE_VERSION}}`, `cache: pnpm`) + `pnpm/action-setup` + step `Install bkit` = `pnpm install --frozen-lockfile --ignore-scripts` (no dependency lifecycle scripts in a `contents: write` job), all `if: enabled`; install step `continue-on-error: true`.
4. `Resolve phase + brief context`: GitHub-only no-op (`:188-194`) deleted. Dispatch path unchanged (dispatched runs skip the kill switch). CI-driven path:
   - `feat/**`: PR lookup unchanged → `node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json` → `FID`, `issueId` (replaces `:395-417` regex + branch fallback).
   - `dev`: commit-scope parse kept; FID regex widened to the engine `any` pattern `^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$` at every YAML site (`:230,318,327,398,414`).
   - Both arms call one shell function `bkit_gate <fid>` in place of both `gh issue view` sites (`:341,424`), before the stale-run guard / build-age check / dispatch cap as today.
5. `bkit_gate` maps outcomes, each to `skip=true` + exit 0 except `pass`; every `bkit` call captures its exit with `|| rc=$?` (`set -e`, as `bkit_dev_dispatch_guard`):

<!-- prettier-ignore -->
| Outcome | Detect | Annotation |
| --- | --- | --- |
| `bkit-unavailable` | `node_modules/.bin/bkit` absent | `::warning::[bkit-cloud] gate: bkit unavailable (step 'Install bkit' failed) — no dispatch; re-run or workflow_dispatch` |
| `no-issue` | `fetch` prints `skipped` (`no-issue`, `tracker-none`) | `::notice::[bkit-cloud] gate: no <tracker> issue for FID <fid> — no dispatch` |
| `unreadable` | exit 80 | `::warning::[bkit-cloud] gate: unreadable reason=<r>`; `reason=auth` + empty secret env → names `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` |
| `unreadable` | other exit, empty stdout, `labels` not an array | `::warning::[bkit-cloud] gate: unreadable reason=output-unparseable` (never "label absent") |
| `label-absent` | `labels` lacks exact `bkit:auto` | `::notice::[bkit-cloud] gate: <issue> no longer carries bkit:auto — no-op exit (kill switch)` |
| `pass` | exact `bkit:auto` | continue |

`::warning::` on `unreadable` / `bkit-unavailable` puts an expired key or install outage on the run summary page (precedent: `dev-dispatch-dropped`). Each outcome also appends one job-summary row (`tracker`, `issue`, `verdict`, `reason`, `jobs`). Tracker secrets live in this step's `env:` only.

### Router agent jobs

- `run` (claude) and `opencode`: unchanged except tracker secrets in the dispatch step `env:` and the `claude_args` comment (`:524-525`) rewritten ("GitHub MCP only; other trackers via bkit verbs").
- `codex` (new, opencode job shape + dependency install): `if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'`; same `permissions` as `opencode`; steps in order:
  1. Checkout `dev`, git user, vale (as `run`).
  2. `actions/setup-node` (`{{NODE_VERSION}}`, `cache: pnpm`) + `pnpm/action-setup` + `pnpm install --frozen-lockfile` — before the action, whose step 13 `Drop sudo privilege` (`safety-strategy` `drop-sudo`) follows its own installs (spike C9: without this, `bkit-auto` Step 2 `node_modules/.bin/bkit repo info` exits 127 → Failure Path).
  3. Project trust: `codex-home` input + trusted-project `config.toml` (open question "codex project trust").
  4. `openai/codex-action@<sha> # v1` with `openai-api-key: ${{ secrets.OPENAI_API_KEY }}`, `codex-version` pinned (renovate-annotated, as `@opencode/cli@2.0.26`; default `""` floats to latest), `prompt: "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"` (action input, not shell; arg already allowlisted), explicit sandbox / network / bot inputs (open question), `GH_TOKEN: github.token` + tracker secrets in step env.
  5. `if: always()` summary step writing the codex job summary line (action outcome, `dev` / PR head moved, PR comment landed).
  - Job comment states: `drop-sudo` is irreversible and outlives the job on reused self-hosted `{{CLOUD_RUNNER}}`s; the action's own `actions/setup-node` (Node `24`) lands ahead of `{{NODE_VERSION}}` on the agent's `PATH`.

### Session guard (`preflight-tracker.sh`, rendered into both hosts)

1. Host trigger (host-owned): Cursor `is_background_agent == true` (unchanged); Claude `LINEAR_ISSUE_ID` or `GITHUB_ISSUE_ID` set (widened from Linear only).
2. Tracker = `python3` read of `package.json` `bkit.tracker.default`; unset / `none` → Linear branch when `LINEAR_ISSUE_ID` is set (today's behaviour), else advisory context, exit 0.
3. Issue id: linear → `LINEAR_ISSUE_ID` (missing → HARD STOP, today's behaviour); github → `GITHUB_ISSUE_ID`, else leading digits of `feat/{FID}` (`git branch --show-current`); jira → key from `feat/{FID}` uppercased. No id on github / jira → context line `Guard pre-check: SKIPPED — no issue id; bkit:auto not verified`, exit 0 (open question).
4. Read: github → `curl` `api.github.com/repos/{owner}/{repo}/issues/{n}` with `BKIT_GH_TOKEN` (owner/repo from `git remote get-url origin`), python3 parse; linear → existing GraphQL with `state { name type }`; jira → `node_modules/.bin/bkit issues fetch --issue KEY --outbox "$TMPDIR" --json`, bin absent → HARD STOP. Bounded: every `curl` read (GitHub, Linear) carries `--connect-timeout 5 --max-time 15`; the Jira read runs under `timeout 20` when `timeout` exists (Cursor background image is Linux).
5. Fail closed on any unreadable answer (missing key, curl failure, timeout, exit 80, unparseable): HARD STOP naming tracker + reason. Pass only when `bkit:auto` present and not terminal (GitHub `closed`; Linear `type` `completed` / `canceled`; Jira `terminal` fact).

### Checks (`runPostInstallCheck` → install / upgrade / check / doctor)

- `buildCloudSetupAdvisory`: adopted `.github/workflows/bkit-cloud.yml` contains `serves the GitHub tracker only` while tracker is `linear` / `jira` → `cloud-router-tracker-stale`; lacks `openai/codex-action` while `cloud.agent` = `codex` → `cloud-router-codex-missing`. Action: re-copy from `.bkit/templates/.github/workflows/bkit-cloud.yml`, re-apply `runs-on` / `{{NODE_VERSION}}`. `cloud-claude-missing-id-token` action text drops `--tracker=github` and points at the template re-copy. Single-finding return kept; precedence: `cloud-claude-missing-id-token` (blocker) → `cloud-router-tracker-stale` → `cloud-router-codex-missing`; first hit returns.
- `cloud-router` advisory text (`github.ts:343-349`) and `cloud` tip (`checks/tips/catalogue.ts:237-251`): Claude GitHub App, `ANTHROPIC_API_KEY` and the Claude bootstrap hook named only when `cloud.agent` = `claude`; other variants get their row of the per-variant table.
- `detectCiRouterSecrets`: tracker `linear` / `jira` and the tracker secret absent from `gh secret list` → `cloud-router-tracker-secret-missing` naming it; `cloud.agent` = `codex` and `OPENAI_API_KEY` absent → `codex-api-key-secret-missing`; Anthropic findings only when `cloud.agent` = `claude`.

### Docs and ledgers

- `.bkit/cloud.md`: Purpose line and support matrix one row per agent (no Tracker / "not supported" columns); § Post-CI auto-routing gains codex row; § bkit-cloud.yml credentials table gains `OPENAI_API_KEY`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`; "GitHub-tracker only" text removed (`:46,168,169,198`); § Routing decision step 4 tracker-neutral; troubleshooting table `verdict` / `reason` → cause → action (incl. codex summary line); codex runner notes (review its diffs as unguarded; `drop-sudo` on reused self-hosted runners; agent Node is the action's Node `24`).
- `.bkit/providers.md` Codex rows; `.bkit/templates.md` placeholder row; `docs/migrations.md` § Detect-only guards row for the two sniffs.
- `docs/decisions.jsonl`: new decision "any cloud agent with any wired tracker" superseding DE-21 point 3 and discarded alternative (4); DE-21 and `cloud-dev-fid-regex-accepts-linear-shape` updated (kill switch now tracker-agnostic). `install.test.ts` DE-21 cases rewritten to the new rule.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Router reads `bkit:auto` with the existing `bkit issues fetch --json` (answers issue open question 1) | New `bkit issues gate` verb (brainstorms 1-C, 2-A, 3-C); parse `bkit issues text` in shell (2-B); inline per-tracker HTTP in YAML (2-C, 3-B); `bkit issues labels` | `fetch` already returns `labels` for all three trackers, maps failures to exit 80 + `reason`, and redacts secrets — exactly Q1's "log why". A gate verb adds public contract surface the router does not need; the guard cannot share it (no bkit runtime at SessionStart). `issues text` output is a brief, not a contract. Inline HTTP contradicts "reads through bkit's tracker verbs" and Jira auth is only proven against the MCP endpoint. `labels` computes transitions. |
| One gate path for GitHub too | Keep `gh issue view` for GitHub, bkit for Linear / Jira (1-B) | Two kill switches drift (exact match, fail-closed mapping, FID recovery); Q1 already makes them fail the same way. Cost: GitHub path gains a Node / npm dependency — close call, see Risks. |
| FID / issue recovery via `bkit fids parse --marker --branch` on `feat/**`; `dev` keeps commit-scope parse with the regex widened to the engine `any` pattern | Widen the `:396` `bkit:issue=#` regex in YAML | `fids.ts` owns the marker contract for all trackers; YAML `[a-z]+-[0-9]+` rejects Jira keys like `ab2-12` (`.bkit/trackers.md:77`), so those projects would never dispatch. |
| bkit on the runner = consumer lockfile install (`setup-node` `{{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile --ignore-scripts`) after the credential gate, `continue-on-error` | Template-pinned `@cbartens/bkit` via npm (3-A); `npx` with the devDependency range (1-B) | One bkit version per run: agent jobs already run the consumer's installed bkit, so the gate reads with the same engine. A template pin is a second version that drifts; a range floats. Same block as `bkit-ci.yml`; zero cost for runs with no credential. Install time accepted. `--ignore-scripts`: the job holds `contents: write` with persisted checkout credentials; bkit needs no lifecycle script. |
| `codex` job installs repo dependencies (`setup-node` `{{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile`) before `openai/codex-action` | Rely on the action's installs; a Codex bootstrap hook | Spike C9 `DISPROVEN` the cloned shape: no step installs `node_modules`, `bkit-auto` Step 2 exits 127. Codex runner hooks unproven (spike C7: trust alone fired no hook), so no bootstrap hook can fill the gap. Before the action so installs precede its `drop-sudo`. |
| Every gate outcome gets its own annotation + summary row; `unreadable` / `bkit-unavailable` as `::warning::`; unparseable output is `unreadable`, never `label-absent`; missing secret named (Q1) | One generic "no dispatch" notice; router PR / issue comment on first non-pass verdict per FID | Fail-closed exits green, so annotations are the only signal ("agent never picked up my feature"); a warning shows on the run summary page, where an expired key surfaces without opening logs. A comment needs dedup state and write scope. A renamed output field must not read as a kill switch. |
| Tracker secrets passed at step scope to the ctx step and every agent dispatch step (Q2) | Context job only | Dispatched `/bkit-auto` reads / writes the tracker via verbs; runners have no Linear MCP (browser OAuth). Step scope limits exposure. |
| Jira on the runner needs only `BKIT_JIRA_API_KEY`; site from committed `bkit.tracker.jira.site` | Extra site / user secrets (Q2's "plus whatever Jira needs") | `tracker.ts:300-345`: Bearer auth to `JIRA_MCP_URL`, `cloudId` = site from config. Refines Q2, does not depart. |
| Router checks the label only, never the issue state | Also refuse finished issues | `dev` post-merge debug runs on an issue ship already closed; a state check would kill that arm. Finished-state refusal stays in the session guard. |
| `--auto=<any>` still refuses tracker `none` | Delete `validateCloudTrackerMatch` outright (all brainstorms) | With no tracker there is no `bkit:auto` to read, so the kill switch cannot work; today's error already covers `none`. Not a variant-to-tracker pairing, so the issue's outcome holds. |
| `--auto=codex` refuses without `.codex/` unless `--codex` is in the same run (Q4) | Check `.agents/skills/bkit-auto/SKILL.md`; directory check alone | Settled; `--codex` writes the skill files, so the directory check is enough. Accepting `modules.has("codex")` lets one-shot `bkit install --codex --auto=codex` pass the pre-write check. |
| `codex` job: `openai/codex-action@v1` SHA-pinned, `OPENAI_API_KEY` (Q7), same triggers (Q8), additive (Q9), prompt `$bkit-auto <phase> <arg>` via the `prompt` input | Codex Cloud API dispatch; `/bkit-auto` prompt | Issue names the action; Codex runs workflows as skills (`.bkit/providers.md:55`) and `.bkit/router.md` accepts the `$` form. Spike C8 (codex-cli 0.165.0, local): `codex exec '$<skill> <phase> <arg>'` runs the repo skill non-interactively with its arguments, trusted or not. `prompt` is an action input, never shell-expanded. `codex-version` pinned: default `""` installs the latest CLI every run, untested against the pinned template. |
| Codex sandbox / network / bot inputs set explicitly in the template | Leave action defaults | `action.yml` (read 2026-10-29): empty `sandbox` and `permission-profile` → legacy `workspace-write`; the action runs a write-access check on the triggering actor with `allow-bots` default `false`. bkit phases push, comment and call trackers from inside the agent, so defaults risk a green job that changed nothing. Exact values → open question. |
| Advisories built from a per-variant table x configured tracker | Hard-coded text per variant | Guarantees no advisory names another tracker's key; a new variant is one row. |
| One shared guard part `preflight-tracker.sh` dispatching on `bkit.tracker.default`; GitHub via `curl` + python3, Linear unchanged, Jira via `node_modules/.bin/bkit` else HARD STOP | Python MCP JSON-RPC client for Jira in the hook (1); shared bkit verb for every tracker (3-C) | Keeps the no-bkit-runtime invariant where a plain HTTP API accepts the key. A python MCP client duplicates `JiraSession` (initialize, session id, SSE parse). Jira is only reachable on Cursor background sessions, where `environment.json` `install` ran `pnpm install` first. Claude's sibling SessionStart ordering would break a bkit-only guard (3-C premortem). |
| Terminal state by category, through a new `terminal` fact on `fetch` | Names `Done` / `Cancelled` (`preflight-linear.sh:62`) | Renamed states (`Shipped`) pass a name check — fails open. Engine already judges blockers by category (`tracker.ts:900-930`). |
| Guard issue id: Linear env; GitHub `GITHUB_ISSUE_ID` else `feat/{FID}`; Jira `feat/{FID}`; Claude trigger widened to `GITHUB_ISSUE_ID` | Branch-derived id on every session | A branch-only trigger would guard local IDE sessions; Claude has no background flag. |
| No issue id on GitHub / Jira → guard records "not verified" and does not stop | HARD STOP | Today every Cursor background session under GitHub hard-stops on the missing Linear key — Q3's `@cursor` path cannot work under a stop. Surfaced as open question. |
| Codex Cloud: no session guard; documented as router-gated only | Wire a Codex SessionStart hook | Q5 makes Codex conditional on hooks running in cloud tasks; `.bkit/cloud.md` records them unproven. Deferral `719-codex-cloud-session-start-guard`. |
| Rollout = detect-only advisory (`cloud-router-tracker-stale`, `cloud-router-codex-missing`) via `runPostInstallCheck` + `docs/migrations.md` § Detect-only guards row (Q6) | `TEMPLATE_CHANGE_CONSEQUENCES` note (`template-copies.ts:109`); a real migration rewriting the copy | `docs/migrations.md` rules put hand-fix checks under Detect-only guards; bkit never writes an adopted template. A content sniff self-silences once merged; a per-file consequence note fires on every later template change. Upgrade's existing `changed:` line still names the file. |
| Anthropic secret findings only when `cloud.agent` = `claude`; tracker + `OPENAI_API_KEY` findings added | Keep Anthropic findings for every router | A codex or opencode consumer would otherwise be told to set a Claude key. |
| Multi-agent race left as today; deferral `397-dual-agent-…` widened to three agents | Chain jobs with `needs:`; job-level concurrency; one agent by `cloud.agent` | #397 deliberately kept the additive contract instead of a queue with eviction hazards; Q9 settles additive. Changing it is its own decision. |
| Acceptance change — SC1 adds "`none` still refuses" | Draft: every pairing succeeds | Follows the `none` decision above. |
| Acceptance change — SC3 lists bkit-unavailable / unparseable as unreadable | Draft: key missing, service down | New failure classes introduced by running bkit on the runner. |
| Acceptance change — SC4 scoped to Cursor background + Claude sessions carrying an issue id | Draft: guard stops every session on all trackers | Codex has no proven guard; sessions with no issue id have nothing to check. |
| Acceptance change — edge case "workflow lock keeps runs from colliding" replaced | Keep draft wording | Wrong: `logs/{FID}/.lock` is per-runner (`locks.ts` never pushes); the race is real and already deferred. |
| Acceptance change — edge case "only the session guard can stop `@cursor`" made conditional on an issue id | Keep draft wording | Whether Cursor injects `GITHUB_ISSUE_ID` for `@cursor` on GitHub is unverified. |
| Acceptance change — FID edge case reads under the configured tracker, no FID-shape guessing; Jira-digit keys and closed-issue `dev` debug added | Draft: "target the tracker the FID belongs to" | Only the configured tracker has credentials on the runner; guessing would fail closed anyway, but with a misleading reason. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Router reads every tracker through existing verbs (`fids parse` + `issues fetch`), one path incl. GitHub (brainstorm 1-A, 3-A) | `MERGED` | Core of the design. 1-A supplies verb choice, `fids parse` recovery and lockfile install; 3-A supplies distinct gate notices, summary row, unparseable-is-unreadable, step-scope secrets and the contract test. |
| Keep `gh issue view` for GitHub, bkit verbs only for Linear / Jira (1-B) | `REJECTED` | Two kill switches drift; GitHub regex still blocks non-`#` markers. Kept alive as the open question's option B. |
| One composite `bkit issues gate` verb for router and guard (1-C, 2-A, 3-C) | `REJECTED` | Guard cannot depend on bkit at SessionStart (Claude bootstrap ordering, 3-C premortem); router needs only what `fetch` returns. Its "one definition of terminal" idea survives as the `terminal` fact. |
| Parse `bkit issues text` in shell (2-B) | `REJECTED` | Fetches description + comments; output is a brief, not a gate contract. |
| Inline per-tracker HTTP in router YAML, no bkit on the runner (2-C, 3-B) | `REJECTED` | Contradicts the issue's settled "through bkit's tracker verbs"; Jira token proven only against the MCP endpoint; third copy of read logic; fixes reach consumers only by re-merge. |
| bkit on the runner from a template-pinned npm version (3-A detail) | `REJECTED` | Second bkit version per run that drifts from the consumer's; lockfile install wins. |
| Guard: Jira via a python MCP JSON-RPC client (1) | `REJECTED` | Re-implements `JiraSession` in the hook. |
| Guard: GitHub + Linear dependency-free, Jira via bkit when present else HARD STOP (3) | `KEPT` | Narrowest runtime dependency; Jira only reachable where deps are installed. |
| Advisories from variant table x configured tracker (2) | `KEPT` | Mechanically enforces "never name another tracker". |
| Rollout via `TEMPLATE_CHANGE_CONSEQUENCES` | `REJECTED` | Fires on every later template change; content sniff self-silences. |
| Rollout via content-sniff advisory surfaced by `bkit check` and `bkit upgrade` + migrations detect-only row (1 + 3) | `MERGED` | 1's sniff + 3's both-surfaces requirement; `runPostInstallCheck` covers both. |
| Serialise agent jobs / pick one agent | `REJECTED` | Out of scope; Q9 additive; existing deferral owns it. |

## Trade-offs Accepted

- **One verb-based gate for every tracker.** Gain: one fail-closed path, engine-tested tracker semantics, local reproduction with `pnpm bkit issues fetch --issue <id> --json`, new trackers need no YAML change. Sacrifice: today's GitHub kill switch, which needs only `gh`, now needs Node + pnpm + registry; a registry or `setup-node` outage pauses every opted-in run on every tracker at once (green, with `gate: bkit unavailable`).
- **Consumer lockfile install on the context job.** Gain: same bkit version as the agent jobs, no extra pin. Sacrifice: install time on each opted-in CI completion (full app dependency tree), and the template now assumes pnpm in the context job as `bkit-ci.yml` already does; non-pnpm consumers adapt their copy.
- **Hook stays mostly dependency-free.** Gain: GitHub and Linear guards work before `pnpm install`. Sacrifice: Jira guard depends on `node_modules/.bin/bkit`, and two read implementations exist (engine and hook) for GitHub and Linear.
- **Label-only router check.** Gain: `dev` post-merge debug survives closed issues. Sacrifice: a finished-but-labelled issue still dispatches from the router; only the session guard (where present) refuses it.
- **No Codex Cloud guard; codex runner hooks likely inactive.** Gain: ships without unverifiable wiring. Sacrifice: Codex runs are bounded only by the router kill switch and the action's sandbox; review codex runner diffs as unguarded.
- **Race left additive.** Gain: no new arbitration contract in this change. Sacrifice: up to three agents on one PR when several keys are set.
- **No-id Cursor sessions not stopped.** Gain: Q3's `@cursor` triggers work under GitHub / Jira. Sacrifice: such a session's `bkit:auto` is never checked by the guard.

## Risks & Open Questions

- **Open — GitHub kill switch on the new path?** The design moves today's proven `gh issue view` check onto bkit + pnpm install. Options: A) one bkit path for all trackers — one implementation, one test; GitHub gains a registry dependency · B) keep `gh issue view` for GitHub, bkit for Linear / Jira — GitHub unchanged; two paths drift and need two tests · C) bkit path for all, falling back to `gh issue view` on GitHub when bkit is unavailable — resilience for GitHub; fallback path rarely exercised. Recommended: A — Q1 makes both fail identically, and drift in the safety-critical check is the larger long-term risk. Default if unanswered: A.
- **Open — codex-action sandbox and actor check.** Verified from `openai/codex-action` `action.yml`: empty `sandbox` / `permission-profile` → legacy `workspace-write`; write-access check on the triggering actor, `allow-bots` default `false` (trusts `github-actions[bot]` only; `allow-bot-users` widens). Unsettled (spike C11 `BLOCKED`: no `OPENAI_API_KEY`, no live runner): whether `workspace-write` blocks network (git push, `gh`, tracker APIs) in the action, and who the actor is on a `workflow_run` started by a human push vs a bot-authored commit. Options: A) `sandbox: danger-full-access` + `allow-bots: true` — matches what claude / opencode jobs can do; widest agent rights on the runner · B) `permission-profile` with a named profile in a committed `codex-home/config.toml` allowing network — narrower; one more consumer-owned file · C) action defaults + a post-step that pushes — safest; breaks bkit phases that push / comment mid-run. Recommended: A, confirmed by a live dispatch during build before the template ships: one `workflow_dispatch`, one `workflow_run` from a human push, one from a bot-authored commit; each asserts the actor check passes, `git push`, `gh pr comment` and one tracker verb succeed, and the codex job summary line records them. Default if unanswered: A.
- **Open — codex project trust (`.codex/` layer) on the runner.** Spike C7 (local, codex-cli 0.165.0): `codex exec` loads project `config.toml` and `.codex/agents/*.toml` subagents only when the `CODEX_HOME` `config.toml` carries `[projects."<abs project root>"] trust_level = "trusted"`; untrusted → `NO-PROBE-AGENT`, so bkit phases that spawn subagents fail or degrade while the job goes green. The action rejects `--dangerously-bypass-hook-trust` and `-c projects.*` under protected `safety-strategy` (`dist/main.js` `validateProtectedExtraArgs`). Unsettled (spike C10 `BLOCKED`): whether a `[projects]` table in the `codex-home` `config.toml` survives the action's `Resolve Codex home`, `Write Codex proxy config` (`write-proxy-config --codex-home`) and `drop-sudo` steps. C7 also logged `agent_name must use only lowercase letters, digits, and underscores` before the hyphenated `probe-agent` spawned. Options: A) pre-action step writes `$RUNNER_TEMP/codex-home/config.toml` trusting `$GITHUB_WORKSPACE`, passed as `codex-home` — path always correct, no committed file; depends on the proxy-config write keeping the table · B) committed `config.toml` hard-coding the runner workspace path, passed as `codex-home` — reviewable; path breaks silently on self-hosted runners or a renamed repo · C) no trust, run without project layer — nothing to verify; subagent-spawning phases degrade, project config and hooks absent. Recommended: A — only option whose trust key tracks the runner path; the live dispatch asserts a hyphenated bkit subagent (`.codex/agents/*.toml`) actually spawned, not only a green job. Default if unanswered: A.
- **Open — Cursor / Claude session with no resolvable issue id (GitHub / Jira).** Cursor's `GITHUB_ISSUE_ID` injection for `@cursor` and the checkout branch of its CI trigger are both unverified (spike C12 `BLOCKED`: needs a live Cursor background agent). Options: A) record "not verified" in session context, exit 0 — Q3's `@cursor` triggers work; such sessions run unguarded · B) HARD STOP — fail closed; every `@cursor` background session under GitHub / Jira is blocked, as today · C) HARD STOP only when the prompt names `bkit-{command}` — closest to intent; the SessionStart payload carries no prompt, so not implementable today. Recommended: A — B makes the settled Q3 path unusable. Default if unanswered: A.
- **Open — `OPENAI_API_KEY` collision.** Many apps already store it; merging the new template starts codex runs on every opted-in CI event. Same exposure exists for `ANTHROPIC_API_KEY`. Options: A) keep Q7's name; advisory when the secret is set and `cloud.agent` != `codex`, plus the context summary `jobs` field naming which secret enabled which job · B) also require a repo variable `BKIT_CODEX=true` — explicit opt-in; departs from Q7's "gated the same way" · C) dedicated secret name — no collision; departs from Q7's vendor name. Recommended: A — follows Q7, makes the cost visible. Default if unanswered: A.
- **Open — three-way agent race.** Options: A) leave additive, widen deferral `397-dual-agent-…` — no new contract; races persist · B) chain agent jobs with `needs:` so later agents see a merged PR / moved head and no-op — deterministic; later agents still boot and cost tokens · C) dispatch only the job matching `bkit.cloud.agent` — no race; departs from Q9. Recommended: A for this change. Default if unanswered: A.
- **Open — branch fallback issue id.** `fids parse --branch` counts the issue id only when `.bkit/issues.jsonl` on the checked-out ref (`dev`) has a feature row; today's YAML fallback does not check. Spike C1: branch-only with no feature row → `{"fid":…,"issueId":null,"source":"branch"}`. Options: A) accept — PR-body marker is primary and every bkit-built PR carries it; fallback may resolve issue-less → no dispatch · B) check out the PR branch for the parse — ledger more likely present; extra fetch · C) keep a YAML branch fallback after `fids parse` — today's reach; second parser. Recommended: A, with plan verifying where feature rows land. Default if unanswered: A.
- **Open — Linear / Jira label + `terminal` read unproven end to end.** Spike C5 `BLOCKED` (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` unset); only the `auth` failure class is proven on the real endpoints (C4). A wrong `labels` shape reads as `unreadable` (fail closed, green), so SC2 under Linear / Jira would fail silently, not dispatch falsely. Options: A) live check during build: one Linear workspace + one Jira site, each with a `bkit:auto` issue in a started state and one in a done-category state renamed away from `Done` (e.g. `Shipped`) — real evidence for SC2 and the `terminal` fact; needs both keys and a test site · B) recorded-fixture contract tests only — no credentials; shape drift in the real APIs stays unseen · C) A for Linear, B for Jira — Linear key cheap to get; Jira stays fixture-only. Recommended: A — `terminal` by category is the guard's whole point and fixtures cannot prove a renamed state. Default if unanswered: B, with `.bkit/cloud.md` marking Linear / Jira router dispatch as not yet verified live.
- **Open — Cursor `environment.json` `install` vs `sessionStart` ordering (Jira guard).** Spike C12 `BLOCKED`. If `pnpm install` has not finished when `sessionStart` fires, `node_modules/.bin/bkit` is absent and the Jira guard HARD STOPs every Jira background session. Options: A) HARD STOP when the bin is absent (as designed) — fail closed; ordering wrong → every Jira background session blocked · B) poll for the bin up to 30 s, then HARD STOP — tolerates a late install; adds start latency · C) "not verified" context line when the bin is absent — sessions run; Jira guard silently skipped. Recommended: A, with a live Cursor `sessionStart` env + `ls node_modules/.bin/bkit` dump during build; switch to B if ordering is wrong. Default if unanswered: A.
- Risk: correlated pause — npm registry / `setup-node` / pnpm outage, or a self-hosted `{{CLOUD_RUNNER}}` blocking `registry.npmjs.org`, `api.linear.app` or `mcp.atlassian.com`, makes every opted-in run report `bkit-unavailable` / `unreadable`. Mitigation: distinct notices + summary; recovery = re-run or `workflow_dispatch`.
- Risk: secret blast radius — Linear / Jira keys become reachable by agents that read untrusted issue and PR text (`docs/security.md` § Untrusted Content). Mitigation: step-scope env only; advisories ask for the narrowest key the tracker allows.
- Risk: codex runner guards — `.codex/hooks.json` fires only once the `.codex/` layer is trusted (`.bkit/providers.md`); spike C7: trust alone fired no `SessionStart` / `UserPromptSubmit` hook locally (no positive control). On the runner GateGuard / guardrails likely never fire while the job holds `contents: write` and a tracker key; tracker keys and `GH_TOKEN` reach Codex subprocesses (`shell_environment_policy` default). Mitigation: `.bkit/cloud.md` says review codex runner diffs as unguarded.
- Risk: recorded state vs runtime — `bkit.cloud.agent` records one variant while the router starts every job whose key is set; `bkit check` reasons about one. Mitigation: context summary `jobs` field shows what actually ran; collision advisory (open question `OPENAI_API_KEY` collision, A) flags a set agent secret whose variant != `cloud.agent`; narrowing dispatch to `cloud.agent` is option C of the three-way race question.
- Risk: stale consumer copies fail safe but silently — install succeeds under Linear while the old router no-ops. Mitigation: decided detect-only advisory on every `bkit upgrade` / `bkit check` (Decisions, Q6) until the copy is merged.
- Risk: `cloud-ctx-step.integration.test.ts` and `ci-dispatch-gate-alignment.test.ts` pin today's `gh issue view` shape; both need rewriting, and the GitHub path loses its existing end-to-end evidence until re-proven. Mitigation: harness runs real `dist/cli.js` as fixture `node_modules/.bin/bkit` behind stub `gh`. Spike C3 proved the GitHub gate outcomes with a personal token in `GH_TOKEN`, not an Actions `github.token` (context job `issues: read`); the live codex dispatch run also confirms the gate under `github.token`.
- Risk: context job supply chain — consumer `pnpm install` now runs in a job holding `contents: write` with persisted checkout credentials. Mitigation: `--ignore-scripts` on that install.
- Dependency: `bkit.tracker.jira.site` committed in `package.json` for Jira router runs; missing → `fetch` exit 80 `not-found` → `unreadable`.
- Out-of-scope find (propose separately): spike C9 shows the shipped template `opencode` job has the same 4-step list with no dependency install, so its `/bkit-auto` dispatch likely exits 127 at Step 2 on a fresh runner (not run live); the same `.opencode/` one-shot prerequisite trap exists for `bkit install --opencode --auto=opencode`.

## Suggested Workstreams

### WS-1: `terminal` fact on `bkit issues fetch`

#### Scope

- Lift the blocker category judgement (`tracker.ts:900-930`) into `fetchIssue` facts as boolean `terminal`: GitHub `state` = `closed`; Linear `state.type` in `completed | canceled`; Jira `statusCategory.key` = `done`. `state` (name) unchanged.
- Add `terminal` to the facts JSON and the spec `output` help (`commands/workflow/issues.ts:838-864`).
- New engine stderr keeps the `[bkit-issues]` prefix (`docs/observability.md` § prefixes).
- Unit tests per tracker incl. a renamed done-category state (`Shipped`); `pnpm build` + `dist/` in the same commit.

#### Requires

[]

#### Rationale

Engine-owned tracker semantics (Boundaries: engine owns terminal state). Load-bearing for the guard's Jira branch only; the router ignores it (Data Model), so it travels with the guard.

### WS-2: Tracker-aware session guard (`preflight-tracker.sh`)

#### Scope

- Rename `.bkit/core/hooks/preflight-linear.sh` → `preflight-tracker.sh`; update the `{{BKIT_PART}}` render (`.bkit/core/engine/render/parts.ts`) and both host wrappers `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh`; update every file naming the old part.
- Host triggers: Cursor `is_background_agent == true` unchanged; Claude widened to `LINEAR_ISSUE_ID` or `GITHUB_ISSUE_ID`.
- Tracker dispatch on `bkit.tracker.default` via `python3`; unset / `none` → Linear branch when `LINEAR_ISSUE_ID` set, else advisory context, exit 0.
- Issue id: linear env (missing → HARD STOP); github `GITHUB_ISSUE_ID` else leading digits of `feat/{FID}`; jira key from `feat/{FID}` uppercased; no id on github / jira → `Guard pre-check: SKIPPED — no issue id; bkit:auto not verified`, exit 0 (open question no-id session, default A).
- Reads: GitHub REST `curl` + `BKIT_GH_TOKEN`, owner/repo from `git remote get-url origin`; Linear GraphQL with `state { name type }`; Jira `node_modules/.bin/bkit issues fetch --issue KEY --outbox "$TMPDIR" --json`, bin absent → HARD STOP (open question Cursor install ordering, default A). `curl --connect-timeout 5 --max-time 15`; Jira under `timeout 20` when present.
- Fail closed on any unreadable answer, naming tracker + reason; pass only on `bkit:auto` present and not terminal by category (replaces the name check at `preflight-linear.sh:62`).
- Tests: extend `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` per tracker, per failure class, per host trigger.
- Live checks during build: Cursor `sessionStart` env + `ls node_modules/.bin/bkit` dump (install vs `sessionStart` ordering; switch to option B on wrong ordering); whether Cursor injects `GITHUB_ISSUE_ID` for `@cursor` (spike C12); Linear + Jira `terminal` against a done-category state renamed away from `Done` (open question Linear / Jira live read, recommended A).
- Docs in the same change: `.bkit/cloud.md` session-guard text (per-tracker guard, no-id sessions run unguarded, Codex Cloud has no guard and is router-gated only); deferral `719-codex-cloud-session-start-guard` in `docs/deferrals.jsonl`.
- Hook mirrors regenerated by one `bkit install` at session end.

#### Requires

[WS-1]

#### Rationale

One domain: the SessionStart guard, host-rendered, no bkit runtime for GitHub / Linear. Satisfies SC4 alone and ships through `bkit install` with no consumer template re-copy.

### WS-3: Install engine — `codex` variant and wired-tracker rule

#### Scope

- `CLOUD_MODES` / `parseCloudAgents` (`.bkit/core/engine/install/manifest.ts:104-113`) gain `codex`; `bkit.cloud.agent` enum follows; no migration.
- `validateCloudTrackerMatch` (`commands/install/install.ts:123-138`, call `:390-401`; also `cli.ts`) narrowed: tracker `none` → exit 1 naming `--tracker=`; variant-to-tracker pairing removed; same pre-write position.
- Host prerequisite (`install.ts:402-413`): `codex` → `.codex/` exists or `modules.has("codex")`, message names `bkit install --codex`.
- `runCloudModule` (`install/modules/cloud.ts:73-186`): per-variant advisory table (claude / opencode / codex / cursor launch surface + credential) and `trackerAdvisoryLines(ctx.issueTracker, variant)` (github `BKIT_GH_TOKEN` only; linear `BKIT_LINEAR_API_KEY` repo secret or Cursor Runtime Secret; jira `BKIT_JIRA_API_KEY` + committed `bkit.tracker.jira.site`; never another tracker's key; ask for the narrowest key the tracker allows).
- `install.test.ts` DE-21 cases rewritten: full `--auto` x `--tracker` grid passes, `none` refuses, codex prerequisite incl. one-shot `bkit install --codex --auto=codex`.
- `pnpm build` + `dist/` in the same commit.

#### Requires

[WS-2]

#### Rationale

Install-engine domain, one pre-write gate and one advisory module. Lifting the pairing makes `--auto=cursor` with github / jira installable; today's guard hard-stops those background sessions on the missing Linear key, so the tracker-aware guard lands first.

### WS-4: Router context job — tracker-agnostic gate

#### Scope

- `.bkit/templates/.github/workflows/bkit-cloud.yml` context job: delete the GitHub-only no-op (`:188-194`); `setup-node` (`{{NODE_VERSION}}`, `cache: pnpm`) + `pnpm/action-setup` + `Install bkit` = `pnpm install --frozen-lockfile --ignore-scripts`, all `if: enabled`, install `continue-on-error: true`.
- `feat/**`: `node_modules/.bin/bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json` replaces `:395-417`; `dev`: FID regex widened to the engine `any` pattern at `:230,318,327,398,414`.
- Shell function `bkit_gate <fid>` replaces both `gh issue view` sites (`:341,424`); outcome table `bkit-unavailable` / `no-issue` / `unreadable` (exit 80 + `reason`, missing secret named; unparseable output) / `label-absent` / `pass`; `|| rc=$?` captures; `::warning::` vs `::notice::` per table; one job-summary row (`tracker`, `issue`, `verdict`, `reason`, `jobs`).
- Tracker secrets (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`) at step `env:` of the ctx step and the `run` / `opencode` dispatch steps; `GH_TOKEN` = `github.token`; `claude_args` comment (`:524-525`) rewritten.
- `bkit issues fetch` spec `output` help notes `labels`, exit 80 + `reason`, `skipped` as a router contract; any new engine stderr keeps `[bkit-issues]` / `[bkit-fids]`.
- Tests: rewrite `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` (recorded `fetch` outputs per tracker and failure class; real `dist/cli.js` as fixture `node_modules/.bin/bkit` behind stub `gh`) and `ci-dispatch-gate-alignment.test.ts`.
- Open questions settled here: GitHub kill switch on the bkit path (default A); branch fallback issue id (default A, verify where feature rows land); Linear / Jira live label read during build (recommended A; default B → WS-8 marks Linear / Jira dispatch not verified live).

#### Requires

[]

#### Rationale

Router kill-switch domain. Uses existing `fids parse` / `issues fetch` output only, so no engine prerequisite. Owns the shared context-job pieces (bkit install, secrets wiring, summary row) that the codex job builds on.

### WS-5: Router `codex` job

#### Scope

- `Check runner credentials`: `codex=true` iff `OPENAI_API_KEY` set, notice otherwise; `enabled` = any of three; context output `codex`; summary `jobs` entry `codex:OPENAI_API_KEY`.
- New `codex` job (opencode job shape): `if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'`, `opencode` permissions; steps: checkout `dev` + git user + vale; `setup-node` `{{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile` before the action; project trust via `codex-home` `config.toml` (open question project trust, default A); `openai/codex-action@<sha> # v1` with `openai-api-key`, pinned renovate-annotated `codex-version`, `prompt: "$bkit-auto <phase> <arg>"`, explicit sandbox / network / bot inputs (open question sandbox + actor check, default A), `GH_TOKEN` + tracker secrets in step env; `if: always()` summary step writing `action` / `commits` / `comments`.
- Job comment: `drop-sudo` irreversible on reused self-hosted `{{CLOUD_RUNNER}}`; action's Node `24` ahead of `{{NODE_VERSION}}` on `PATH`.
- Live verification before the template ships: one `workflow_dispatch`, one `workflow_run` from a human push, one from a bot-authored commit; each asserts actor check passes, `git push`, `gh pr comment`, one tracker verb, a hyphenated `.codex/agents/*.toml` subagent spawns, the gate works under `github.token`, and the summary line records them.
- Excluded: the same dependency-install gap in the `opencode` job and the `.opencode/` one-shot prerequisite (out-of-scope find, propose separately).

#### Requires

[WS-4]

#### Rationale

Codex runner domain with its own unverified surface (sandbox, actor check, trust) and live proof. Shares the template file and context outputs with WS-4, so it lands after the gate.

### WS-6: bkit's own adopted router and template index

#### Scope

- Re-copy `.github/workflows/bkit-cloud.yml` from the template, re-applying `runs-on` / `{{NODE_VERSION}}`.
- `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`: `runs-on: {{CLOUD_RUNNER}}` count 3 → 4; new `{{NODE_VERSION}}` edit row.
- `.bkit/templates.md` placeholder table: `{{NODE_VERSION}}` also used in `bkit-cloud.yml` (context job + `codex` job).

#### Requires

[WS-4, WS-5]

#### Rationale

Dogfood copy and index must match the final template in the same change; only valid once both router workstreams are done.

### WS-7: Post-install checks and advisories

#### Scope

- `buildCloudSetupAdvisory` (`checks/after/github.ts:325-350`): `cloud-router-tracker-stale` (adopted copy contains `serves the GitHub tracker only` under linear / jira) and `cloud-router-codex-missing` (lacks `openai/codex-action` under `cloud.agent` = `codex`); action = re-copy template, re-apply `runs-on` / `{{NODE_VERSION}}`; `cloud-claude-missing-id-token` text drops `--tracker=github`; single-finding precedence id-token → tracker-stale → codex-missing.
- `cloud-router` advisory text (`github.ts:343-349`) and `cloud` tip (`checks/tips/catalogue.ts:237-251`) per variant; Claude App / `ANTHROPIC_API_KEY` / bootstrap hook only for `claude`.
- `detectCiRouterSecrets` (`checks/after/auth.ts:173-215`): `cloud-router-tracker-secret-missing`; `codex-api-key-secret-missing`; Anthropic findings only when `cloud.agent` = `claude`; collision advisory when an agent secret such as `OPENAI_API_KEY` is set while `cloud.agent` names another variant (open question `OPENAI_API_KEY` collision, default A).
- `docs/migrations.md` § Detect-only guards row for the two sniffs.
- `PreflightFinding` / advisory action text inlines the fix; tests per finding and precedence; `pnpm build` + `dist/` in the same commit.

#### Requires

[WS-3, WS-4, WS-5]

#### Rationale

Checks domain (`runPostInstallCheck` → install / upgrade / check / doctor). Sniff markers come from the new template (WS-4 removes the GitHub-only text, WS-5 adds `openai/codex-action`); variant gating needs the `codex` enum (WS-3).

### WS-8: Cloud docs and decision ledgers

#### Scope

- `.bkit/cloud.md`: Purpose line; support matrix one row per agent, no tracker columns; § Post-CI auto-routing codex row; § bkit-cloud.yml credentials table adds `OPENAI_API_KEY`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`; remove GitHub-tracker-only text (`:46,168,169,198`); § Routing decision step 4 tracker-neutral; troubleshooting table `verdict` / `reason` → cause → action incl. codex summary line; codex runner notes (unguarded diffs, `drop-sudo`, Node `24`); Linear / Jira router dispatch marked not verified live when WS-4 takes default B.
- `.bkit/providers.md` Codex rows.
- `docs/decisions.jsonl`: new decision "any cloud agent with any wired tracker" superseding DE-21 point 3 and alternative (4); status updates on `de-21-141-bkit-cloud-rebuilt-on-the-claude-github-app` and `cloud-dev-fid-regex-accepts-linear-shape`.
- `docs/deferrals.jsonl`: same-key row widening `397-dual-agent-same-run-double-ship-when-both-secrets-set` to three agents (open question three-way race, default A).
- Out-of-scope find (opencode job dependency install, `.opencode/` one-shot trap) proposed separately, not built.

#### Requires

[WS-3, WS-4, WS-5, WS-7]

#### Rationale

Docs and ledgers domain; current-state docs must match the shipped install, router and checks behaviour in the same change.

## Suggested Plans

### P-1: Tracker-aware session guard

#### Deliverable

SessionStart guard that reads `bkit:auto` and terminal-by-category state on GitHub, Linear and Jira for Cursor background and issue-carrying Claude sessions, backed by the new `terminal` fact on `bkit issues fetch`; ships via `bkit install`, no template re-copy (SC4).

#### Covers

[WS-1, WS-2]

#### Requires

[]

### P-2: Cloud variants — `--auto=codex` and any wired tracker

#### Deliverable

`--auto={claude,opencode,codex,cursor}` installable with any wired tracker; `bkit-cloud.yml` template with a tracker-agnostic `bkit`-verb gate and a `codex` job; detect-only stale-copy and secret advisories; bkit's own router re-copied; cloud docs, decisions and deferrals updated (SC1, SC2, SC3, SC5).

#### Covers

[WS-3, WS-4, WS-5, WS-6, WS-7, WS-8]

#### Requires

[P-1]
