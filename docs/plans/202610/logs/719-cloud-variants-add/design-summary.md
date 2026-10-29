Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Design Summary

## Verdict

CONCERNS

- design-review CONCERNS
- design-spike FAIL, answered by design-apply-review
- design-apply-review CONCERNS
- design-organise CONCERNS
- 2 deferral(s) written this run

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| design-start-workflow | - | - | 1 | - |
| design-worktree-setup | - | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-input-1.md` |
| design-grill | - | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-grill-1.md`, `docs/plans/202610/logs/719-cloud-variants-add/design-input-1.md` |
| design-brainstorm-ideate | - | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-brainstorm-ideate-1.md`, `docs/plans/202610/logs/719-cloud-variants-add/design-brainstorm-ideate-2.md`, `docs/plans/202610/logs/719-cloud-variants-add/design-brainstorm-ideate-3.md` |
| design-generate | - | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-v1-draft.md` |
| design-review | CONCERNS | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-review-1.md`, `docs/plans/202610/logs/719-cloud-variants-add/design-review-2.md` |
| design-spike | FAIL | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-spike.md` |
| design-apply-review | CONCERNS | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-v2-reviewed.md` |
| design-organise | CONCERNS | - | 1 | `docs/plans/202610/logs/719-cloud-variants-add/design-v3-organised.md` |

## Suggested Plans

### P-1: Tracker-aware session guard

Covers: WS-1 (`terminal` fact on `bkit issues fetch`), WS-2 (Tracker-aware session guard (`preflight-tracker.sh`))
Requires: []

### P-2: Cloud variants — `--auto=codex` and any wired tracker

Covers: WS-3 (Install engine — `codex` variant and wired-tracker rule), WS-4 (Router context job — tracker-agnostic gate), WS-5 (Router `codex` job), WS-6 (bkit's own adopted router and template index), WS-7 (Post-install checks and advisories), WS-8 (Cloud docs and decision ledgers)
Requires: [P-1]

## Open Questions

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

## Risks and Action Items

None

## Recommended Next Step

```text
File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>
```

Or, to address the reasons first: `/bkit-design #719`
