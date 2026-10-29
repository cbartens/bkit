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
| Host prerequisite for a variant | `--auto=opencode` `.opencode/` check (`install.ts:402-413`) | `EXTEND` | Same branch gains `codex` → `.codex/`, naming `--codex` (Q4). |
| Per-variant setup advisories | `runCloudModule` (`.bkit/core/engine/install/modules/cloud.ts:73-186`), `CLOUD_WORKFLOW_ADOPT_STEP`, `ctx.issueTracker` (`modules/index.ts:89`) | `EXTEND` | Add `codex` branch; tracker lines from one helper keyed on `ctx.issueTracker`. |
| Router label read, every tracker | `bkit issues fetch --fid/--issue --outbox --json` (`.bkit/core/engine/commands/workflow/issues.ts:715-744`, spec `:838-864`): `labels`, `state`, exit 80 + `reason`, `skipped` | `EXTEND` | Already reads all three trackers with redaction and failure classes; facts gain one `terminal` boolean for the guard. |
| Router FID + issue recovery, every marker shape | `bkit fids parse --marker --branch` (`fids.ts:590-623`, `:795-830`); engine `any` FID pattern (`fids.ts:12,52`) | `EXTEND` | Owns the marker contract for github / linear / jira; YAML regex `bkit:issue=#[0-9]+` (`bkit-cloud.yml:396`) is GitHub-only and the YAML FID regex `[a-z]+-[0-9]+` rejects Jira keys with digits. |
| Terminal-state judgement | Blocker reads by category (`tracker.ts:900-930`: Linear `state.type`, Jira `statusCategory.key`) | `EXTEND` | Lift into `fetchIssue` facts as `terminal`; the guard and any later reader share one definition. |
| bkit CLI on the router runner | `bkit-ci.yml` setup block (`setup-node` `{{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile`, `.bkit/templates/.github/workflows/bkit-ci.yml:67-73,171`) | `EXTEND` | Same pins, same placeholder; consumer lockfile decides the bkit version. |
| Codex runner job | `run` / `opencode` jobs (`bkit-cloud.yml:471-596`), gate step (`:121-153`); `openai/codex-action@v1` (inputs read from its `action.yml`: `prompt`, `openai-api-key`, `sandbox` (empty → legacy `workspace-write`), `permission-profile`, `safety-strategy` default `drop-sudo`, `allow-bots`, write-access check) | `EXTEND` | Clone the opencode job shape; vendor action does the Codex install and auth. |
| Session-start guard | `.bkit/core/hooks/preflight-linear.sh` rendered into `.bkit/core/.claude/hooks/bkit-preflight.sh` and `.bkit/core/.cursor/hooks/bkit-preflight.sh` via `{{BKIT_PART}}` (`.bkit/core/engine/render/parts.ts`); tests `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | `EXTEND` | Rename to `preflight-tracker.sh`, add GitHub + Jira branches; both hosts' triggers and output shapes stay theirs. |
| Stale adopted router copy | `buildCloudSetupAdvisory` content sniff (`.bkit/core/engine/checks/after/github.ts:325-350`, `cloud-claude-missing-id-token`); precedent `anthropic-federation-template-stale` (`checks/after/auth.ts:196`); `docs/migrations.md` § Detect-only guards | `EXTEND` | Two more sniffs on the same file; surfaced wherever `runPostInstallCheck` runs. |
| Router secret presence | `detectCiRouterSecrets` (`checks/after/auth.ts:173-215`) | `EXTEND` | Add tracker secret + `OPENAI_API_KEY` checks; gate the Anthropic findings on the recorded variant. |
| Gate-function contract test | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | `EXTEND` | Run the ctx step against recorded `fetch` outputs per tracker and per failure class. |
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
| Session guard | `.bkit/core/hooks/preflight-linear.sh` → `preflight-tracker.sh`; host wrappers `.bkit/core/.claude/hooks/bkit-preflight.sh`, `.bkit/core/.cursor/hooks/bkit-preflight.sh` | One shared part dispatching on `bkit.tracker.default`; GitHub + Jira branches; terminal by category; Claude trigger widened to `GITHUB_ISSUE_ID` |
| Checks + docs | `checks/after/github.ts` (`buildCloudSetupAdvisory`), `checks/after/auth.ts` (`detectCiRouterSecrets`), `.bkit/cloud.md`, `.bkit/providers.md`, `.bkit/templates.md`, `docs/migrations.md`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `install.test.ts` | Stale-copy + secret advisories; matrix one row per agent; DE-21 superseded |

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

- Context job → engine: `pnpm bkit fids parse --json`, `pnpm bkit issues fetch --json`; env `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` (repo secrets, Q2), `GH_TOKEN` = `github.token` for GitHub (engine `gh` inherits it when `BKIT_GH_TOKEN` is unset, `tracker.ts:181-184`); Jira site from committed `package.json` `bkit.tracker.jira.site`.
- Agent jobs → engine: same tracker secrets at dispatch-step env so the dispatched `/bkit-auto` verbs read and write the tracker.
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
| Job summary row | `tracker`, `issue`, `verdict`, `reason` | New, one per CI-driven context run: `verdict` in `pass \| label-absent \| no-issue \| unreadable \| bkit-unavailable`. |
| `.bkit/templates.md` placeholder table | `{{NODE_VERSION}}` | Now also used in `bkit-cloud.yml` (context job). |

## Components / Flows

### Install (`bkit install --auto=<variant>`)

1. Parse `--auto` against `CLOUD_MODES` (`codex` accepted).
2. Pre-write gate (same position as today): tracker `none` → exit 1, `[bkit] --auto=<v> needs a wired tracker: bkit install --tracker=<github|linear|jira> --auto=<v>`. No variant-to-tracker check.
3. Host prerequisite: `opencode` → `.opencode/`; `codex` → `.codex/`, message names `bkit install --codex`.
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
3. Checkout `dev` (unchanged) → `setup-node` (`{{NODE_VERSION}}`, `cache: pnpm`) + `pnpm/action-setup` + `pnpm install --frozen-lockfile`, all `if: enabled`; install step `continue-on-error: true`.
4. `Resolve phase + brief context`: GitHub-only no-op (`:188-194`) deleted. Dispatch path unchanged (dispatched runs skip the kill switch). CI-driven path:
   - `feat/**`: PR lookup unchanged → `pnpm bkit fids parse --marker "$PR_BODY" --branch "$BRANCH" --json` → `FID`, `issueId` (replaces `:395-417` regex + branch fallback).
   - `dev`: commit-scope parse kept; FID regex widened to the engine `any` pattern `^([0-9]+|[a-z][a-z0-9]*-[0-9]+)-[a-z0-9-]+$` at every YAML site (`:230,318,327,398,414`).
   - Both arms call one shell function `bkit_gate <fid>` in place of both `gh issue view` sites (`:341,424`), before the stale-run guard / build-age check / dispatch cap as today.
5. `bkit_gate` maps outcomes, each to `skip=true` + exit 0 except `pass`:

<!-- prettier-ignore -->
| Outcome | Detect | Notice |
| --- | --- | --- |
| `bkit-unavailable` | `node_modules/.bin/bkit` absent | `gate: bkit unavailable (dependency install failed) — no dispatch` |
| `no-issue` | `fetch` prints `skipped` (`no-issue`, `tracker-none`) | `gate: no <tracker> issue for FID <fid> — no dispatch` |
| `unreadable` | exit 80 | `gate: unreadable reason=<r>`; `reason=auth` + empty secret env → names `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` |
| `unreadable` | other exit, empty stdout, `labels` not an array | `gate: unreadable reason=output-unparseable` (never "label absent") |
| `label-absent` | `labels` lacks exact `bkit:auto` | `gate: <issue> no longer carries bkit:auto — no-op exit (kill switch)` |
| `pass` | exact `bkit:auto` | continue |

Each outcome also appends one job-summary row (`tracker`, `issue`, `verdict`, `reason`). Tracker secrets live in this step's `env:` only.

### Router agent jobs

- `run` (claude) and `opencode`: unchanged except tracker secrets in the dispatch step `env:` and the `claude_args` comment (`:524-525`) rewritten ("GitHub MCP only; other trackers via bkit verbs").
- `codex` (new, cloned from `opencode`): `if: needs.context.outputs.codex == 'true' && needs.context.outputs.skip != 'true'`; same `permissions` as `opencode`; checkout `dev`, git user, vale (as `run`); `openai/codex-action@<sha> # v1` with `openai-api-key: ${{ secrets.OPENAI_API_KEY }}`, `prompt: "$bkit-auto ${{ needs.context.outputs.phase }} ${{ needs.context.outputs.arg }}"` (action input, not shell; arg already allowlisted), explicit sandbox / network / bot inputs (open question), `GH_TOKEN: github.token` + tracker secrets in step env.

### Session guard (`preflight-tracker.sh`, rendered into both hosts)

1. Host trigger (host-owned): Cursor `is_background_agent == true` (unchanged); Claude `LINEAR_ISSUE_ID` or `GITHUB_ISSUE_ID` set (widened from Linear only).
2. Tracker = `python3` read of `package.json` `bkit.tracker.default`; unset / `none` → Linear branch when `LINEAR_ISSUE_ID` is set (today's behaviour), else advisory context, exit 0.
3. Issue id: linear → `LINEAR_ISSUE_ID` (missing → HARD STOP, today's behaviour); github → `GITHUB_ISSUE_ID`, else leading digits of `feat/{FID}` (`git branch --show-current`); jira → key from `feat/{FID}` uppercased. No id on github / jira → context line `Guard pre-check: SKIPPED — no issue id; bkit:auto not verified`, exit 0 (open question).
4. Read: github → `curl` `api.github.com/repos/{owner}/{repo}/issues/{n}` with `BKIT_GH_TOKEN` (owner/repo from `git remote get-url origin`), python3 parse; linear → existing GraphQL with `state { name type }`; jira → `node_modules/.bin/bkit issues fetch --issue KEY --outbox "$TMPDIR" --json`, bin absent → HARD STOP.
5. Fail closed on any unreadable answer (missing key, curl failure, exit 80, unparseable): HARD STOP naming tracker + reason. Pass only when `bkit:auto` present and not terminal (GitHub `closed`; Linear `type` `completed` / `canceled`; Jira `terminal` fact).

### Checks (`runPostInstallCheck` → install / upgrade / check / doctor)

- `buildCloudSetupAdvisory`: adopted `.github/workflows/bkit-cloud.yml` contains `serves the GitHub tracker only` while tracker is `linear` / `jira` → `cloud-router-tracker-stale`; lacks `openai/codex-action` while `cloud.agent` = `codex` → `cloud-router-codex-missing`. Action: re-copy from `.bkit/templates/.github/workflows/bkit-cloud.yml`, re-apply `runs-on` / `{{NODE_VERSION}}`. `cloud-claude-missing-id-token` action text drops `--tracker=github` and points at the template re-copy.
- `detectCiRouterSecrets`: tracker `linear` / `jira` and the tracker secret absent from `gh secret list` → `cloud-router-tracker-secret-missing` naming it; `cloud.agent` = `codex` and `OPENAI_API_KEY` absent → `codex-api-key-secret-missing`; Anthropic findings only when `cloud.agent` = `claude`.

### Docs and ledgers

- `.bkit/cloud.md`: Purpose line and support matrix one row per agent (no Tracker / "not supported" columns); § Post-CI auto-routing gains codex row; § bkit-cloud.yml credentials table gains `OPENAI_API_KEY`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`; "GitHub-tracker only" text removed (`:46,168,169,198`); § Routing decision step 4 tracker-neutral.
- `.bkit/providers.md` Codex rows; `.bkit/templates.md` placeholder row; `docs/migrations.md` § Detect-only guards row for the two sniffs.
- `docs/decisions.jsonl`: new decision "any cloud agent with any wired tracker" superseding DE-21 point 3 and discarded alternative (4); DE-21 and `cloud-dev-fid-regex-accepts-linear-shape` updated (kill switch now tracker-agnostic). `install.test.ts` DE-21 cases rewritten to the new rule.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Router reads `bkit:auto` with the existing `bkit issues fetch --json` (answers issue open question 1) | New `bkit issues gate` verb (brainstorms 1-C, 2-A, 3-C); parse `bkit issues text` in shell (2-B); inline per-tracker HTTP in YAML (2-C, 3-B); `bkit issues labels` | `fetch` already returns `labels` for all three trackers, maps failures to exit 80 + `reason`, and redacts secrets — exactly Q1's "log why". A gate verb adds public contract surface the router does not need; the guard cannot share it (no bkit runtime at SessionStart). `issues text` output is a brief, not a contract. Inline HTTP contradicts "reads through bkit's tracker verbs" and Jira auth is only proven against the MCP endpoint. `labels` computes transitions. |
| One gate path for GitHub too | Keep `gh issue view` for GitHub, bkit for Linear / Jira (1-B) | Two kill switches drift (exact match, fail-closed mapping, FID recovery); Q1 already makes them fail the same way. Cost: GitHub path gains a Node / npm dependency — close call, see Risks. |
| FID / issue recovery via `bkit fids parse --marker --branch` on `feat/**`; `dev` keeps commit-scope parse with the regex widened to the engine `any` pattern | Widen the `:396` `bkit:issue=#` regex in YAML | `fids.ts` owns the marker contract for all trackers; YAML `[a-z]+-[0-9]+` rejects Jira keys like `ab2-12` (`.bkit/trackers.md:77`), so those projects would never dispatch. |
| bkit on the runner = consumer lockfile install (`setup-node` `{{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile`) after the credential gate, `continue-on-error` | Template-pinned `@cbartens/bkit` via npm (3-A); `npx` with the devDependency range (1-B) | One bkit version per run: agent jobs already run the consumer's installed bkit, so the gate reads with the same engine. A template pin is a second version that drifts; a range floats. Same block as `bkit-ci.yml`; zero cost for runs with no credential. Install time accepted. |
| Every gate outcome gets its own notice + summary row; unparseable output is `unreadable`, never `label-absent`; missing secret named (Q1) | One generic "no dispatch" notice | Fail-closed exits green, so the log is the only signal ("agent never picked up my feature"); a renamed output field must not read as a kill switch. |
| Tracker secrets passed at step scope to the ctx step and every agent dispatch step (Q2) | Context job only | Dispatched `/bkit-auto` reads / writes the tracker via verbs; runners have no Linear MCP (browser OAuth). Step scope limits exposure. |
| Jira on the runner needs only `BKIT_JIRA_API_KEY`; site from committed `bkit.tracker.jira.site` | Extra site / user secrets (Q2's "plus whatever Jira needs") | `tracker.ts:300-345`: Bearer auth to `JIRA_MCP_URL`, `cloudId` = site from config. Refines Q2, does not depart. |
| Router checks the label only, never the issue state | Also refuse finished issues | `dev` post-merge debug runs on an issue ship already closed; a state check would kill that arm. Finished-state refusal stays in the session guard. |
| `--auto=<any>` still refuses tracker `none` | Delete `validateCloudTrackerMatch` outright (all brainstorms) | With no tracker there is no `bkit:auto` to read, so the kill switch cannot work; today's error already covers `none`. Not a variant-to-tracker pairing, so the issue's outcome holds. |
| `--auto=codex` refuses without `.codex/` (Q4) | Check `.agents/skills/bkit-auto/SKILL.md` | Settled; `--codex` writes the skill files, so the directory check is enough. |
| `codex` job: `openai/codex-action@v1` SHA-pinned, `OPENAI_API_KEY` (Q7), same triggers (Q8), additive (Q9), prompt `$bkit-auto <phase> <arg>` via the `prompt` input | Codex Cloud API dispatch; `/bkit-auto` prompt | Issue names the action; Codex runs workflows as skills (`.bkit/providers.md:55`) and `.bkit/router.md` accepts the `$` form. `prompt` is an action input, never shell-expanded. |
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
- **Open — codex-action sandbox and actor check.** Verified from `openai/codex-action` `action.yml`: empty `sandbox` / `permission-profile` → legacy `workspace-write`; write-access check on the triggering actor, `allow-bots` default `false`. Not verified: whether `workspace-write` blocks network (git push, `gh`, tracker APIs) in the action, and who the actor is on a `workflow_run` started by a bot-authored commit. Options: A) `sandbox: danger-full-access` + `allow-bots: true` — matches what claude / opencode jobs can do; widest agent rights on the runner · B) `permission-profile` with a named profile in a committed `codex-home/config.toml` allowing network — narrower; one more consumer-owned file · C) action defaults + a post-step that pushes — safest; breaks bkit phases that push / comment mid-run. Recommended: A, confirmed by a live dispatch during build before the template ships. Default if unanswered: A.
- **Open — Cursor / Claude session with no resolvable issue id (GitHub / Jira).** Cursor's `GITHUB_ISSUE_ID` injection for `@cursor` and the checkout branch of its CI trigger are both unverified. Options: A) record "not verified" in session context, exit 0 — Q3's `@cursor` triggers work; such sessions run unguarded · B) HARD STOP — fail closed; every `@cursor` background session under GitHub / Jira is blocked, as today · C) HARD STOP only when the prompt names `bkit-{command}` — closest to intent; the SessionStart payload carries no prompt, so not implementable today. Recommended: A — B makes the settled Q3 path unusable. Default if unanswered: A.
- **Open — `OPENAI_API_KEY` collision.** Many apps already store it; merging the new template starts codex runs on every opted-in CI event. Same exposure exists for `ANTHROPIC_API_KEY`. Options: A) keep Q7's name; advisory when the secret is set and `cloud.agent` != `codex`, plus summary line naming which secret enabled which job · B) also require a repo variable `BKIT_CODEX=true` — explicit opt-in; departs from Q7's "gated the same way" · C) dedicated secret name — no collision; departs from Q7's vendor name. Recommended: A — follows Q7, makes the cost visible. Default if unanswered: A.
- **Open — three-way agent race.** Options: A) leave additive, widen deferral `397-dual-agent-…` — no new contract; races persist · B) chain agent jobs with `needs:` so later agents see a merged PR / moved head and no-op — deterministic; later agents still boot and cost tokens · C) dispatch only the job matching `bkit.cloud.agent` — no race; departs from Q9. Recommended: A for this change. Default if unanswered: A.
- **Open — branch fallback issue id.** `fids parse --branch` counts the issue id only when `.bkit/issues.jsonl` on the checked-out ref (`dev`) has a feature row; today's YAML fallback does not check. Options: A) accept — PR-body marker is primary and every bkit-built PR carries it; fallback may resolve issue-less → no dispatch · B) check out the PR branch for the parse — ledger more likely present; extra fetch · C) keep a YAML branch fallback after `fids parse` — today's reach; second parser. Recommended: A, with plan verifying where feature rows land. Default if unanswered: A.
- Risk: correlated pause — npm registry / `setup-node` / pnpm outage, or a self-hosted `{{CLOUD_RUNNER}}` blocking `registry.npmjs.org`, `api.linear.app` or `mcp.atlassian.com`, makes every opted-in run report `bkit-unavailable` / `unreadable`. Mitigation: distinct notices + summary; recovery = re-run or `workflow_dispatch`.
- Risk: secret blast radius — Linear / Jira keys become reachable by agents that read untrusted issue and PR text (`docs/security.md` § Untrusted Content). Mitigation: step-scope env only; advisories ask for the narrowest key the tracker allows.
- Risk: codex runner guards — `.codex/hooks.json` fires only once the `.codex/` layer is trusted (`.bkit/providers.md`); on the runner GateGuard / guardrails likely never fire while the job holds `contents: write` and a tracker key.
- Risk: recorded state vs runtime — `bkit.cloud.agent` records one variant while the router starts every job whose key is set; `bkit check` reasons about one.
- Risk: stale consumer copies fail safe but silently — install succeeds under Linear while the old router no-ops; the detect-only advisory is the only signal.
- Risk: `cloud-ctx-step.integration.test.ts` and `ci-dispatch-gate-alignment.test.ts` pin today's `gh issue view` shape; both need rewriting, and the GitHub path loses its existing end-to-end evidence until re-proven.
- Dependency: `bkit.tracker.jira.site` committed in `package.json` for Jira router runs; missing → `fetch` exit 80 `not-found` → `unreadable`.
- Assumption: Cursor's `environment.json` `install` (`pnpm install`) completes before `sessionStart` fires on background agents (Jira guard depends on it).
