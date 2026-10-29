Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

<!-- prettier-ignore -->
| Capability | What exists (verified) | Fit | Recommendation |
| --- | --- | --- | --- |
| Record `codex` variant | `CLOUD_MODES` (`.bkit/core/engine/install/manifest.ts:104`) + a second list `CLOUD_VARIANTS` (`.bkit/core/engine/cli.ts:27`) | Two enums, both need `codex`; design names `cli.ts` in the surface table | `EXTEND-EXISTING` |
| Variant / tracker refusal | `validateCloudTrackerMatch` (`commands/install/install.ts:123-138`, call `:393-400`), pre-write | Narrowing to "tracker != none" keeps the no-files-on-error invariant | `EXTEND-EXISTING` |
| Host prerequisite | `.opencode/` check `install.ts:402-412` uses `process.cwd()` pre-write | Copying it refuses a one-shot `bkit install --codex --auto=codex` (same as opencode today) | `EXTEND-EXISTING`; gap → OPTIONAL |
| Router label read, all trackers | `bkit issues fetch` (`commands/workflow/issues.ts:715-744`, spec `:838-864`): emits `title,url,state,labels`, `skipped` via `skipOf`, exit 80 + `reason` via `useMcp`/`classifyFailure`; global `--json` (`commands/lib.ts:87,290`) | Covers >90%: GitHub via `gh api` (inherits `GH_TOKEN`; `ghEnv` adds only `BKIT_GH_TOKEN`, `tracker.ts:181-184`), Linear GraphQL, Jira MCP Bearer (`tracker.ts:300-345`). Gap: also downloads description + all comments (extra calls per gate) | `USE-AS-IS` (+ `terminal` fact) |
| FID / issue recovery | `bkit fids parse --marker --branch` (`fids.ts:590-623` markers per tracker; branch arm needs `featureIssueIds` from `.bkit/issues.jsonl`); `FID_PATTERNS.any` `fids.ts:52` | Replaces YAML regexes `bkit-cloud.yml:230,318,327,398,414` that reject `ab2-12` Jira keys; `trackerTarget`→`issueIdOf` derives issue from FID per tracker | `EXTEND-EXISTING` |
| Terminal state | `readBlockers` (`tracker.ts:881-930`): Linear `state.type`, Jira `statusCategory.key`. `fetchIssue` (`:582-650`) queries `state { name }` only | Lift needs Linear query + Jira field read widened in `fetchIssue` | `EXTEND-EXISTING` |
| bkit on runner | `bkit-ci.yml` setup block (`.bkit/templates/.github/workflows/bkit-ci.yml:67-73,171`); tracked `.bkit/version` `pinnedVersion` | Full app-tree `pnpm install` for one gate read; alternative: `npx @cbartens/bkit@<pinnedVersion>` (bkit has zero runtime deps, `docs/technology.md` § Build & Output) | `EXTEND-EXISTING` as designed; `ADAPT` option → OPTIONAL |
| Codex runner job | `openai/codex-action` v1 (inputs read from `action.yml` at tag `v1` → commit `bdf19a4a223ec2549a3e2274a0cf61556bc07675`; identical input list to `main`) | Covers Codex install, API-key proxy, privilege drop, write-access check. Gaps: no repo dependency install, project trust for `.codex/` layer (see CRITICAL) | `USE-AS-IS` + job steps |
| Session guard | `.bkit/core/hooks/preflight-linear.sh` via `# {{BKIT_PART preflight-linear.sh}}` inside `bkit:start/end` of both host wrappers (`render/parts.ts:18-19`) | Rename + branches stay inside markers → `bkit upgrade` refreshes consumers | `EXTEND-EXISTING` |
| Stale-copy advisory | `buildCloudSetupAdvisory` (`checks/after/github.ts:325`), `detectCiRouterSecrets` (`checks/after/auth.ts:173`), precedent `anthropic-federation-template-stale` | `buildCloudSetupAdvisory` returns ONE `PreflightFinding \| null` with early returns → two more sniffs need precedence or an array return | `EXTEND-EXISTING` |
| Contract test for ctx step | `audits/templates/cloud-ctx-step.integration.test.ts` (spawns real extracted step bash + stub `gh`) | Can put real `dist/cli.js` behind a fixture `node_modules/.bin/bkit` → GitHub path proven end-to-end through the real engine | `EXTEND-EXISTING` |

Design `Reuse & Prior Art` has no `NEW` verdicts; no candidate found that the design passes over. No `CONCERNS` trigger from step 5.

## Stack Feasibility

Buildable on the approved stack (Node `>=24`, TypeScript, pnpm, GitHub Actions, bash hooks). No new runtime dependency.

- **Engine:** enum additions, refusal narrowing, advisory table, `terminal` fact — plain TypeScript in existing modules. `pnpm build && git add dist/` per `.agents/rules.md` § Engine builds.
- **Router:** `bkit_gate` maps verb exits to notices — bash already used (`set -euo pipefail`, `[[ =~ ]]`; template runs on `bash`). Shell function + `jq` parse of `--json` output feasible. Under `set -e`, every `bkit` call needs `|| rc=$?` capture, as `bkit_dev_dispatch_guard` already does.
- **Codex job:** feasible with `openai/codex-action`, but two runtime facts decide whether the job does any work: repo dependencies (`node_modules/.bin/bkit`) and project trust for `.codex/agents/*.toml`. Neither is in the design (CRITICAL).
- **Guard:** bash + `python3` + `curl` for GitHub, unchanged Linear, `node_modules/.bin/bkit` for Jira. Cursor background image has `python3` (`.cursor/hooks/bkit-preflight.sh` comment); IDE bail-out stays grep-only.
- **Constraints:** template assumes pnpm in the context job (same as `bkit-ci.yml`; copy-and-own, non-pnpm consumers adapt). Router stays on GitHub Actions. Jira runner reads depend on egress to `mcp.atlassian.com` (`tracker.ts:32`) — open on GitHub-hosted, consumer-owned on self-hosted `{{CLOUD_RUNNER}}`.

## Library / API Evaluation

<!-- prettier-ignore -->
| Library / API | Maturity | Footprint | Types | License |
| --- | --- | --- | --- | --- |
| `openai/codex-action` | Vendor-maintained; tags `v1` … `v1.13`; last push 2026-10-20; not archived; 1284 stars (GitHub API, 2026-10-29) | Composite: own `actions/setup-node` (Node `24`), `npm install -g @openai/codex@${codex-version}` + `@openai/codex-responses-api-proxy` every run; `codex-version` default `""` → floats to latest | N/A (YAML inputs) | Apache-2.0 |
| `codex-action` inputs used | `prompt`, `openai-api-key`, `sandbox` (empty → legacy `workspace-write`), `permission-profile` (mutually exclusive with `sandbox`), `safety-strategy` default `drop-sudo` (doc text: "IRREVERSIBLE … can outlive a job on reused self-hosted runners"), `allow-bots` (trusts `github-actions[bot]` only), `allow-bot-users`, `codex-home` | Protected strategies reject `codex-args` `--dangerously-bypass-hook-trust` and `-c` overrides under roots incl. `projects`, `shell_environment_policy` (`dist/main.js` `validateProtectedExtraArgs`) | — | — |
| Codex `shell_environment_policy` | Codex config reference: `ignore_default_excludes` "Keep variables containing KEY, SECRET, or TOKEN before other filters run (default: true)" | `GH_TOKEN`, `BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` reach Codex subprocesses by default | — | — |
| `bkit issues fetch` / `bkit fids parse` | In-repo, unit + integration tested (`tracker.test.ts`, fids tests); redaction on (`SECRET_KEYS`, `tracker.ts:50`) | Zero runtime deps; Node `fetch` + `gh` (preinstalled on GitHub-hosted runners) | TypeScript | MIT (bkit) |
| `actions/setup-node`, `pnpm/action-setup` | Already SHA-pinned in `bkit-ci.yml` | Context job gains Node + full `pnpm install` per opted-in CI completion | N/A | MIT |

## Integration Risk

Single package, not a monorepo — no workspace graph to break.

<!-- prettier-ignore -->
| System touched | Blast radius | Notes |
| --- | --- | --- |
| Install engine (`manifest.ts`, `cli.ts`, `install.ts`, `modules/cloud.ts`) | Every `bkit install --auto=*` | Additive enum; refusal narrows. Existing recorded values stay valid. |
| `bkit issues fetch` facts | Every workflow reading `issue-facts.json` | `terminal` is additive; `state` unchanged. |
| Router template (copy-and-own) | Consumers only after merge | Stale copies fail safe (no-op). **bkit's own adopted copy** `.github/workflows/bkit-cloud.yml` (tracker `github`, `cloud.agent` `claude`) must change in the same change: `dogfood-templates.test.ts:206-216` pins `runs-on: {{CLOUD_RUNNER}}` `count: 3` (codex job → 4) and has no `{{NODE_VERSION}}` edit row. Not in the design's surface table. |
| Shared hook part (markered Tier-2) | Every consumer's Claude + Cursor preflight on next `bkit upgrade` | Behaviour change both ways: Cursor background sessions under GitHub stop hard-stopping on the missing Linear key; Claude sessions carrying `GITHUB_ISSUE_ID` gain a new HARD STOP path (missing `BKIT_GH_TOKEN`, curl failure). |
| Checks (`runPostInstallCheck`) | install / upgrade / check / doctor output | New advisories; Anthropic findings gated on variant. Same-class text not listed in the design: `checks/tips/catalogue.ts:237-251` `cloud` tip tells every non-cursor variant to `gh secret set ANTHROPIC_API_KEY` and copy the Claude bootstrap hook; `cloud-router` advisory text (`checks/after/github.ts:343-349`) states the Claude GitHub App is required for every router. |
| Tests pinning today's shape | `cloud-ctx-step.integration.test.ts`, `audits/workflows/ci-dispatch-gate-alignment.test.ts`, `install.test.ts` (DE-21), `preflight-sh.integration.test.ts`, `templates-content.test.ts`, `workflow-templates.integration.test.ts`, `auto-route-marker.integration.test.ts`, `checks/after/{auth,github}.test.ts`, `checks/tips/catalogue.test.ts`, `dogfood-templates.test.ts` | Rewrite load is wide; the GitHub kill switch loses its end-to-end evidence until re-proven (design Risks names this). |
| Context job supply chain | Runs consumer `pnpm install` (lifecycle scripts) in a job holding `contents: write` with `actions/checkout` persisted credentials | New: today the context job installs no dependencies. A malicious dependency script could push to `dev`. |

## PoC Approach

Two proofs, no code shipped:

1. **Gate, local.** Extend the `cloud-ctx-step.integration.test.ts` harness: fixture repo with `package.json` `bkit.tracker.default` per tracker, real `dist/cli.js` linked as `node_modules/.bin/bkit`, stub `gh` returning recorded issue JSON (GitHub), and an env-pointed fake for Linear / Jira failure classes. Assert each `bkit_gate` outcome row (`pass`, `label-absent`, `no-issue`, `unreadable`, `bkit-unavailable`) and that a Jira key `ab2-12` dispatches.
2. **Codex job, live.** Scratch GitHub repo with `bkit install --codex --auto=codex`, `OPENAI_API_KEY` secret, codex job pinned to the `v1` commit, `sandbox: danger-full-access`, `codex-version` pinned. `workflow_dispatch` `ship <PR>`, then a `workflow_run` from a human push. Observe in the log: write-access check result per actor; `$bkit-auto` skill resolves; a `.codex/agents/*.toml` subagent spawns (trust); `node_modules/.bin/bkit repo info` succeeds; `git push` and `gh pr comment` succeed; a tracker verb sees `BKIT_LINEAR_API_KEY`.

## Unknowns & Blockers

<!-- prettier-ignore -->
| # | Unknown | Settled by |
| --- | --- | --- |
| U1 | Does `codex exec` inside `codex-action` load the project `.codex/` layer (`.codex/agents/*.toml` subagents, `.codex/hooks.json`)? Codex config reference: "Untrusted projects skip project-scoped `.codex/` layers, including project-local config, hooks, and rules." The action rejects `--dangerously-bypass-hook-trust` and `-c projects.*` under protected strategies. Whether a committed `codex-home` `config.toml` marking `$GITHUB_WORKSPACE` trusted works under `drop-sudo` is unverified. | Running code (PoC 2) |
| U2 | Does `$bkit-auto <phase> <arg>` as a `codex exec` prompt invoke the repo skill non-interactively? | Running code (PoC 2) |
| U3 | `workspace-write` network on the runner; actor of a `workflow_run` for the write-access check (design open question). | Running code (PoC 2) |
| U4 | Cursor injects `GITHUB_ISSUE_ID` for `@cursor` / its CI trigger; `environment.json` `install` finishes before `sessionStart` (design open question + assumption). | Running code (live Cursor session) |
| U5 | Codex job dependency install — nothing installs `node_modules` today on that job (no bootstrap hook equivalent). | Reading source (settled here: must add a step — CRITICAL 1) |

## Verdict Reasoning

`CONCERNS`. Every engine claim the design rests on checks out in source: `fetch` labels / `skipped` / exit 80 + `reason`, `fids parse` per-tracker markers, `GH_TOKEN` inheritance, Jira Bearer to the MCP endpoint, category-based terminal state in `readBlockers`, part rendering inside markers. Reuse is thorough; no `NEW` verdict passes over a candidate. The router, install, guard and checks surfaces are buildable as designed. The `codex` job is buildable but, as drafted, would most likely go green having done nothing: it has no step that installs the repo's dependencies, and its subagents live in a `.codex/` layer the action may not trust. Both are addressable (one job step; one more open question settled by the live dispatch the design already plans), so `CONCERNS`, not `FAIL`. Spike: U1-U4 need running code.

## CRITICAL

1. **Codex job installs no repo dependencies.** `/bkit-auto` Step 1 runs `node_modules/.bin/bkit repo info` (`.bkit/core/workflows/bkit-auto.md:18,87`). The design clones the `opencode` job, which has no install step (`bkit-cloud.yml:546-596`), and Codex runner hooks are unproven, so no bootstrap hook fills the gap. Add setup-node `{{NODE_VERSION}}` + `pnpm/action-setup` + `pnpm install --frozen-lockfile` (or the context job's bkit provisioning) before `openai/codex-action`, ahead of the action's `drop-sudo` step.
2. **Codex project trust is not in the open question.** bkit workflows spawn subagents from `.codex/agents/*.toml`; Codex skips the project `.codex/` layer when untrusted, and `codex-action` (protected strategy, default `drop-sudo`) rejects `--dangerously-bypass-hook-trust` and `-c projects.*` (`dist/main.js` `validateProtectedExtraArgs`). Widen the "codex-action sandbox and actor check" open question to cover trust, name the candidate (`codex-home` input → committed `config.toml` with the workspace marked trusted), and make the planned live dispatch assert a subagent actually spawned, not only that the job went green.

## OPTIONAL

- Pin `codex-version` in the codex job (renovate-annotated, like `@opencode/cli@2.0.26`); default `""` installs the latest Codex CLI on every run.
- Self-hosted `{{CLOUD_RUNNER}}`: `drop-sudo` is "IRREVERSIBLE" and outlives the job on reused runners — note it in the codex job comment and `.bkit/cloud.md`.
- `codex-action` runs its own `actions/setup-node` Node `24` inside the action, which lands ahead of the consumer's `{{NODE_VERSION}}` on `PATH` for the agent's shell; a consumer on another Node major gets Node 24 in agent-run tests — document it in the job comment.
- Context job: lighter, version-matched bkit — `npx --yes @cbartens/bkit@$(jq -r .pinnedVersion .bkit/version)` (tracked pin written by install / upgrade; bkit has zero runtime deps) avoids the full app-tree install, its time cost, and dependency lifecycle scripts in a `contents: write` job. If the lockfile install stays, add `--ignore-scripts`.
- Call `node_modules/.bin/bkit` directly in the gate, not `pnpm bkit` — a consumer `bkit` script would shadow the bin, and the gate already detects absence by that path.
- `--auto=codex` prerequisite: accept `modules.has("codex")` as well as an existing `.codex/`, so one-shot `bkit install --codex --auto=codex` works (fixes the same trap for opencode).
- Add to the surface table: bkit's own `.github/workflows/bkit-cloud.yml` + `audits/repo/dogfood-templates.test.ts` (`runs-on` count 3 → 4, `{{NODE_VERSION}}` placeholder row); `checks/tips/catalogue.ts:237-251` `cloud` tip and the `cloud-router` advisory text (`checks/after/github.ts:343-349`), both Claude-specific for every variant.
- `buildCloudSetupAdvisory` returns one finding; state the precedence (blocker `cloud-claude-missing-id-token` first, then stale sniffs) or change it to return an array.
- `fetch` as the gate downloads description + every comment; acceptable, but a `--facts-only` flag would cut calls on large issues if gate latency matters.

## OUT OF SCOPE

- Arbitrating several agent jobs on one PR — owned by deferral `397-dual-agent-same-run-double-ship-when-both-secrets-set`.
- A Codex Cloud (ChatGPT-hosted) session-start guard — blocked on hooks in cloud tasks.
- Codex AGENTS.md prompt-injection exposure in `codex exec` on CI (third-party report, Backslash Security) — security lens, not buildability.
