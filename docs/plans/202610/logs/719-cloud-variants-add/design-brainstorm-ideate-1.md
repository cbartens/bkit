# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

Shared across all approaches (settled by Grill; approaches differ only in how the router and the guard read the tracker):

- `CLOUD_MODES` (`.bkit/core/engine/install/manifest.ts:104`) gains `codex`; `CloudVariant` follows.
- `validateCloudTrackerMatch` + its call (`.bkit/core/engine/commands/install/install.ts:115-138`, `:390-401`) deleted; `--auto=codex` refuses without `.codex/` beside the existing `.opencode/` check (`install.ts:402-413`, Q4).
- `runCloudModule` (`.bkit/core/engine/install/modules/cloud.ts:73-186`) gains a `codex` branch; tracker lines come from `ctx.issueTracker` (`.bkit/core/engine/install/modules/index.ts:89`) via one helper, so no variant names another tracker's key (Q2).
- `bkit-cloud.yml`: `:188-194` no-op removed; gate step adds `codex=true` iff `OPENAI_API_KEY` set (Q7); `codex` job beside `run` / `opencode` on the same triggers (Q8, Q9), prompt `$bkit-auto <phase> <arg>` (Codex invokes workflows as skills, `.bkit/providers.md:55`).
- `.bkit/cloud.md` matrix: one row per agent, no tracker column; DE-21 point 3 superseded by a new decision row; `install.test.ts` DE-21 tests rewritten.

## Approach A — Router reads every tracker through existing bkit verbs ⭐ Recommended

- **Summary:** The router's context job installs deps once (after the free-tier `bkit [auto route]` gate) and replaces both `gh issue view` kill switches (`bkit-cloud.yml:341`, `:424`) and the GitHub-only `bkit:issue=#[0-9]+` grep (`:396-397`) with two existing verbs — `pnpm bkit fids parse --marker "$PR_BODY" --branch "$BRANCH"` (FID + issue id, all three marker shapes, `.bkit/core/engine/commands/workflow/fids.ts:591-623`) and `pnpm bkit issues fetch --fid "$FID" --outbox "$RUNNER_TEMP/issue"` (labels + state, `.bkit/core/engine/commands/workflow/issues.ts:715-744`). One code path for GitHub, Linear, Jira. Session-start guard: `.bkit/core/hooks/preflight-linear.sh` becomes a tracker-dispatching part (renamed `preflight-tracker.sh`), still bash + python3 + curl, adding GitHub REST and Jira branches.
- **`Complexity`:** `MEDIUM`.
- **Extensibility:** A new tracker lands in `tracker.ts` + `fids.ts` once; router YAML needs no change. Guard still needs a per-tracker branch.
- **Risk:** Install time on every opted-in CI event (context job gains `setup-node` + `pnpm install --frozen-lockfile`, as `bkit-ci.yml:248` already does for `pnpm bkit check`); a consumer whose install is slow or private-registry-bound sees slower routing. Exit 80, `skipped` (`tracker-none`, `no-issue`) and absent label all map to `skip=true` + `::notice::` (Q1 fail-closed). Existing GitHub path changes too — `cloud-ctx-step.integration.test.ts` and `ci-dispatch-gate-alignment.test.ts` need rewriting.
- **Maintenance:** Low — tracker logic stays in the engine, which is unit-tested; YAML shrinks.
- **Reuse vs new:** Reuses `issues fetch`, `fids parse`, `tracker.ts` transport + `redact`, `bkit-ci.yml`'s install block. New: the install step in the context job, tracker secrets in job env, guard's GitHub/Jira branches (Jira via python `urllib` JSON-RPC to the same Rovo endpoint `tracker.ts` uses).

## Approach B — Keep `gh` for GitHub, bkit verbs only for Linear / Jira

- **Summary:** Leave the proven GitHub kill switch and PR-marker grep untouched; branch on `bkit.tracker.default` and, for `linear` / `jira` only, fetch bkit with `npx -y @cbartens/bkit@<version from package.json devDependencies>` and call the same two verbs as A. Guard as in A.
- **`Complexity`:** `MEDIUM`.
- **Extensibility:** Every tracker beyond GitHub goes through the bkit branch; GitHub stays a YAML special case forever.
- **Risk:** Two kill-switch implementations drift (exact-match semantics, fail-closed mapping, FID recovery). `npx` version resolution breaks on ranges / `link:` / `workspace:` specifiers and when the registry is not reachable from `{{CLOUD_RUNNER}}`. The GitHub regex at `:396` keeps rejecting non-`#` markers, so mixed histories still need the bkit branch.
- **Maintenance:** Medium — two paths to test per change; template diff burden on consumers is smaller for GitHub users.
- **Reuse vs new:** Same verbs as A; zero change for GitHub consumers' copied router. New: tracker branch + `npx` bootstrap in YAML.

## Approach C — One composite gate verb shared by router and guard

- **Summary:** Add `bkit issues gate` (inputs `--fid` / `--marker` / `--branch`; output `{dispatch, reason, issue, state, labels}`; exit 0 dispatch, 1 refuse) folding FID recovery, label check and terminal-state check. Router calls it once; guard calls it when `node_modules/.bin/bkit` exists, else fails closed.
- **`Complexity`:** `HIGH`.
- **Extensibility:** Best — one tested decision point for every trigger surface.
- **Risk:** Guard depends on deps being installed at SessionStart; Claude on the web runs `bkit-cloud-bootstrap.sh` (`pnpm install`) as a sibling SessionStart hook, so ordering is not guaranteed → first session can refuse wrongly. New verb contract + registry + tests + `.bkit/instructions.md` surface. Speculative unification beyond the issue's "reads the label through bkit's tracker verbs".
- **Maintenance:** Medium — one more public verb to keep stable.
- **Reuse vs new:** Wraps `fetchIssue` + `fromMarker`; net-new verb, help text, tests.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Approach A | B (split path), C (composite verb) | Reuse over new; one fail-closed path; engine already owns per-tracker shapes. B forks the kill switch; C adds a verb and a SessionStart ordering hazard. |
| Label read = `bkit issues fetch --fid` (open question 1) | New read mode on `bkit issues labels`; per-tracker curl in YAML | Existing verb already returns `labels` + `state` for all three trackers, exit 80 on failure; settled "through bkit's tracker verbs". |
| FID / issue recovery = `bkit fids parse --marker --branch` | Widen the `:396` regex in YAML | `fids.ts:591-595` is the marker contract's code owner; a YAML regex forks it. Dev arm keeps its commit-scope parse (already shape-tolerant), then `--fid`. |
| FID shape not matching configured tracker → no-op + notice | Guess the tracker from FID shape | Edge case "target the tracker the FID belongs to": only the configured tracker has credentials; fail closed per Q1. |
| bkit on runner = `pnpm install --frozen-lockfile` in context job, after gate step `enabled` | `npx` pinned version | Same mechanism as `bkit-ci.yml:248`; version = consumer lockfile; costs nothing when no runner credential is set. |
| Tracker secrets (`BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY`) passed to context + all runner jobs; Jira site from `package.json` `bkit.tracker.jira` | Context job only | Dispatched `/bkit-auto` reads / writes the tracker via `tracker.ts`; tracker MCP fallback is not configured on runners for Linear / Jira. `claude_args` comment at `:524-525` ("GitHub-tracker only") rewritten. |
| Codex job: `openai/codex-action@v1` SHA-pinned, `openai-api-key: secrets.OPENAI_API_KEY`, prompt `$bkit-auto <phase> <arg>` via env (injection guard as opencode job) | Codex Cloud API dispatch | Issue names the action; vendor documents the `workflow_run` autofix case. Build must verify the action's sandbox / safety-strategy inputs allow `git push` + network, else set them explicitly — not verified here. |
| Guard stays bash + python3 + curl, per-tracker branch keyed on `bkit.tracker.default` | Guard shells out to `bkit issues fetch` | File header contract (`preflight-linear.sh:1-3`): no bkit runtime — the hook can run before `pnpm install`. Terminal state: Linear `Done` / `Cancelled`; GitHub `closed`; Jira `statusCategory` = `done`. |
| Guard trigger: `LINEAR_ISSUE_ID` or `GITHUB_ISSUE_ID` (Cursor injects both, `.bkit/cloud.md:54`); Jira issue from `feat/{FID}` branch only when the host flags a background session (Cursor `is_background_agent`) | Branch-derived id on every session | Branch-only trigger would guard local IDE sessions. Claude-on-web's background signal is unverified → design doc must resolve before claiming Jira coverage on Claude. |
| Codex: no session-start guard; documented unguarded beyond router kill switch | Wire a Codex SessionStart hook | Q5 conditions Codex on hooks running in cloud tasks; `.bkit/cloud.md:392` records them unproven. |
| Rollout: detect-only advisory in upgrade when adopted `.github/workflows/bkit-cloud.yml` still holds the `serves the GitHub tracker only` no-op (tracker `linear` / `jira`) or lacks `openai/codex-action` (`cloud.agent` = `codex`); row in `docs/migrations.md` § Detect-only guards | `TEMPLATE_CHANGE_CONSEQUENCES` entry (`.bkit/core/engine/install/template-copies.ts:109`) | Q6. Content sniff self-silences once merged; a per-file consequence note fires on every later template change and goes stale. Upgrade's existing template-changed list still names the file. |
| Cursor: no router job; advisories name `@cursor` + GitHub PR-event trigger (github / jira) or Linear integration (linear) | `cursor` job in `bkit-cloud.yml` | Q3. |
