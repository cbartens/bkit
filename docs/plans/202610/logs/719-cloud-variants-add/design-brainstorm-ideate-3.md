# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

## Approach A — Fail closed through one engine read verb on the router (pinned bkit, every tracker) ⭐ Recommended

**Summary.** The router's `context` job gets bkit only after the free-tier gate (`bkit-cloud.yml:97-104`) and credential gate (`:121-153`) pass. It then replaces both `gh issue view` kill-switch sites (`:341`, `:424`) with one shell function that calls the existing read verb `bkit issues fetch --issue "$ISSUE" --outbox "$RUNNER_TEMP/gate"` (`.bkit/core/engine/commands/workflow/issues.ts:838-864`; prints `labels`, `state`; exit 80 + `reason` on network / auth / not-found). That one path serves GitHub, Linear and Jira. Exit 80 or a missing key means no dispatch, a `::notice::` naming the reason, and exit 0 (Q1). The `github`-only no-op (`:188-194`) goes. Agent jobs (`claude`, `opencode`, new `codex`) get the tracker key in step `env:`. Session-start guards keep their "no bkit runtime" shape (`preflight-linear.sh:1-3`): GitHub and Linear as dependency-free shell, Jira through `bkit` when `node_modules/.bin/bkit` exists, else HARD STOP.

**Premortems**

- **10x scale.**
  - _What breaks:_ every opted-in CI completion now needs Node 24 setup plus an npm fetch of bkit. An npm registry or `actions/setup-node` outage makes every opted-in run, on every tracker and every consumer, fail closed at once. This is a correlated pause of all automation, and it includes the GitHub path that works today without npm.
  - _More failures:_ tracker reads multiply: one in `context`, then one or more per agent job, times up to three jobs (Q9). Linear and Jira rate limits start to matter where today only GitHub's did. Blast radius: the existing, proven GitHub kill switch is rewritten.
  - _Observability:_ a distinct line per gate outcome (`gate: bkit unavailable`, `gate: unreadable reason=<r>`, `gate: label absent`, `gate: pass`) plus one `GITHUB_STEP_SUMMARY` row (tracker, issue, verdict, reason).
  - _Recovery:_ "Re-run jobs" on the run, or `workflow_dispatch` with phase + issue. Dispatched runs skip the kill switch (`:195-199`).
- **6 months later.**
  - _Pinned version drift:_ the bkit version pinned in a copy-and-own template drifts behind the repo's installed bkit.
  - _Load-bearing output contract:_ the YAML depends on `fetch`'s output (`labels` array, exit 80) and nothing in the engine knows a YAML file parses it. If a field is renamed, the router's `jq` yields empty, which reads as "label absent". Every run then no-ops silently, indistinguishable from a real kill switch.
  - _Magic values:_ the Node major and bkit pin join the existing 30-min build-age window (`:439`) as unexplained constants.
  - _Observability:_ parse failure needs its own notice, separate from label absent.
  - _Recovery:_ re-copy the template, or bump the pin.
- **On-call at 3am.**
  - _Page shape:_ "the agent never picked up my feature". There is no red X, because fail-closed exits 0 by design.
  - _Diagnosability:_ depends entirely on the notice and summary lines above. `bkit issues fetch --issue <id>` reproduces the read locally with the same key, which is a real advantage over inline HTTP.
  - _Recovery:_ fix the repo secret, re-run.
- **Author leaves.**
  - _Tribal knowledge:_ the Linear MCP authenticates by browser OAuth (`.bkit/cloud.md:248`), so it cannot be the fallback on a runner. `trackerTarget` uppercases keys (`tracker.ts:153-174`) while the router derives a lowercase `ISSUE` from the branch (`:414`). Exit 80 is the "unreadable" signal.
  - _Bus factor:_ low if the gate function carries one comment pointing to the verb contract and a decision row records it.

**Risk-mitigation guidance (layer onto A)**

- Fetch bkit only inside the `enabled == true` branch, after FID/ISSUE resolution, so non-opted-in and no-credential runs stay at zero minutes.
- Pin bkit in the template with a `# renovate: datasource=npm depName=@cbartens/bkit` comment (the pattern at `:576`). `bkit upgrade` lists the template when the pin moves.
- Contract test: extend `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` to run the gate function against recorded `fetch` outputs for github / linear / jira, exit 80, empty stdout and malformed JSON. Each must map to its own notice and to skip.
- Treat "verb ran but output unparseable" as unreadable (fail closed) with its own message. Never treat it as "label absent".
- Give the key-missing case its own message naming the exact secret (`BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY`), as the federation notices do (`:136-140`).
- Pass tracker keys at step scope only, never at workflow or job `env:`.

## Approach B — Inline per-tracker HTTP in the router YAML (no bkit runtime on the context job)

**Summary.** The context job keeps today's no-bkit invariant (`.bkit/cloud.md:537`). It gains a bash function per tracker: `gh issue view` for GitHub, a `curl` to Linear GraphQL (the `preflight-linear.sh` query), and a Jira call. It is rendered from one snippet source shared with the session-start hooks. **Departure:** the issue's "Decisions already made" says the router reads the label "through bkit's tracker verbs rather than gaining per-tracker API code of its own". No newer section contradicts that, so choosing B needs the owner's sign-off.

**Premortems**

- **10x scale.**
  - _What holds:_ fastest context job with no npm dependency, so no correlated registry failure, and the GitHub path is unchanged.
  - _What breaks:_ each tracker's quirks live in bash under `set -euo pipefail`. One unhandled non-JSON body turns a designed no-op into a red step on every opted-in run for that tracker.
  - _Observability:_ only the inline notices.
  - _Recovery:_ re-run.
- **6 months later.**
  - _Drift:_ three copies of the "read an issue" logic (`tracker.ts`, the preflight hooks, router YAML) drift apart.
  - _Jira auth:_ the Jira token is a scoped Atlassian MCP V2 token. The engine sends Jira reads only through `JIRA_MCP_URL` (`tracker.ts:317-339`). Bash must either speak MCP JSON-RPC (initialize, then `tools/call getJiraIssue`) or call Jira REST with a token not shown to authenticate there. The likely failure: every Jira read is "unreadable", so Jira consumers never dispatch, silently.
  - _Case handling:_ the engine uppercases keys; bash must repeat that.
  - _Fix propagation:_ bug fixes reach consumers only when each one re-merges the copy-and-own template.
- **On-call at 3am.**
  - _Page shape:_ the same silent no-dispatch, plus occasional red context steps from parse errors.
  - _Diagnosability:_ worse than A. There is no local command that reproduces the router's read. The on-caller must replay `curl` by hand.
- **Author leaves.**
  - _Tribal knowledge:_ API shapes, auth headers and case rules live only in YAML comments.
  - _Bus factor:_ highest of the three.

**Risk-mitigation guidance (layer onto B)**

- Render the router and hook snippets from one source file (like `.bkit/core/hooks/preflight-linear.sh`), never hand-copied.
- Fixture-test each tracker branch with recorded responses.
- Uppercase keys before the call.
- Prove a live Jira read with the MCP V2 token before committing to B.

## Approach C — One shared "may this agent run" verb for the router and every session-start guard

**Summary.** Add `bkit issues gate --issue <id>`: output `{optedIn, terminal, state, reason}`, exit 0 run / 1 stop / 80 unreadable. Terminal is judged by state category (GitHub `closed`, Linear state type `completed` / `canceled`, Jira status category `done`), not by name. The router's context job (installed as in A) and every host's preflight hook (Claude, Cursor, Codex) call it, which replaces `preflight-linear.sh` and the hook's no-runtime invariant.

**Premortems**

- **10x scale.**
  - _Blast radius:_ largest. Every vendor-triggered cloud session start on every host now needs Node + bkit before the guard can answer.
  - _Claude on the web:_ the setup script deliberately does not install deps (`.bkit/cloud.md:131`). `bkit-cloud-bootstrap.sh` installs them as another SessionStart hook, with no guaranteed order relative to the preflight. On a fresh session the guard can find no bkit, fail closed, and block sessions. That includes GitHub-tracker sessions, which have no guard today.
  - _Observability:_ only a HARD STOP line in the session context. On Claude a non-zero SessionStart exit is informational only (`.bkit/cloud.md:102`).
  - _Recovery:_ re-launch after deps exist, or hand-edit the hook.
- **6 months later.**
  - _Drift:_ least of the three. One rule, one test, one definition of "opted in and not finished" for router and sessions.
  - _Unrecorded invariant:_ hooks now depend on bkit being installed first. If nobody records that, a later bootstrap reorder breaks every guard at once.
- **On-call at 3am.**
  - _Diagnosability:_ one command (`bkit issues gate --issue X`) answers both "why didn't the router dispatch" and "why did the session stop".
  - _Page shape:_ a session refusing work is harder to spot than a workflow notice.
- **Author leaves.**
  - _Knowledge:_ best concentration of the three; the verb and its tests are the documentation.
  - _Tribal knowledge left:_ the hook-ordering dependency per host.

**Risk-mitigation guidance (layer onto C)**

- The hook falls back to a dependency-free per-tracker snippet when `node_modules/.bin/bkit` is absent, rather than HARD STOP.
- Verify the SessionStart ordering on Claude, Cursor and Codex before choosing C.
- Record "preflight needs bkit installed" as a decision row and a comment at the top of the hook.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Router reads the label with the existing `bkit issues fetch` (facts only, files to `$RUNNER_TEMP`); answers open question 1 | New `bkit issues gate` verb (C); inline HTTP (B); `bkit issues labels` | `fetch` already reads state + labels on all three trackers and maps failures to exit 80 + `reason`, which is exactly Q1's "log why". `labels` computes transitions; it is not a read. A new verb adds contract surface the router does not need yet. |
| One gate path for GitHub too | Keep `gh issue view` for GitHub, bkit verb for Linear / Jira | Two paths drift and need two tests. Q1 already makes them fail the same way. The cost is a new npm / Node dependency on today's proven path, mitigated by distinct gate notices. **Close call; owner may prefer to keep GitHub on `gh`.** |
| bkit reaches the context job as a template-pinned npm version (Renovate-bumped), fetched after the gates | Version from `package.json` devDependency; full `pnpm install` | devDependency ranges (`^x`) float. A full install is stack-specific (rules: Stack-agnostic) and slow on app repos. A pin matches the existing pinned-tool pattern (`:576`). |
| Session guard: dependency-free shell for GitHub + Linear; Jira through bkit when present, else HARD STOP | Shared verb in every hook (C); Jira over hand-rolled MCP JSON-RPC in bash | Keeps the hooks' no-runtime invariant where an HTTP API accepts the key. The Jira token is only proven against the MCP endpoint the engine uses. |
| Terminal state judged by category, not name | Names `Done` / `Cancelled` (`preflight-linear.sh:62`) | Workspaces rename states. Name matching fails open: a renamed "Shipped" state passes the guard. |
| Agent jobs get the tracker key in step `env:` | Key only in `context` | The orchestrator reads and writes through `bkit` verbs first (`bkit-auto.md:24`). Without the key every verb exits 80, and the MCP fallback cannot work headless for Linear (OAuth). |
| Router parsing widened: `bkit:issue=` without `#`, Jira keys with digits | Leave the branch-name fallback | `:396` matches only `#[0-9]+` while Linear / Jira markers are `bkit:issue={ISSUE_ID}` (`.bkit/trackers.md:89`). The FID regex `[a-z]+-[0-9]+` (`:230,318,327,398,414`) rejects Jira keys like `ab2-12` (`^[a-z][a-z0-9]+-[0-9]+-`, `.bkit/trackers.md:77`), so those projects silently never dispatch. |
| `--auto=codex` refuses without `.codex/` (Q4), mirroring `install.ts:403-412` | Check `.agents/skills/bkit-auto/SKILL.md` instead | Settled by owner. The skill file is what the runner actually needs, so a second check on it is cheap insurance against a half-installed host. |
| Stale-copy detection: `bkit check` advisory + upgrade notice + `docs/migrations.md` row (Q6) | Upgrade notice only | Precedent `anthropic-federation-template-stale` (`.bkit/cloud.md:496`). A stale copy fails safe, but the consumer sees "install succeeded" while the router still refuses Linear. |

## Cross-Approach Risks

- **The workflow lock does not stop agent jobs colliding.** `logs/{FID}/.lock` is a file in each runner's own checkout (`.bkit/core/engine/commands/workflow/locks.ts` never pushes). With several keys set (Q9), claude, opencode and codex jobs run on separate machines, each sees its own empty lock, and all three work the same PR. Possible results: competing fix pushes to `feat/{FID}`, two ship squash-merge attempts, and lost full-label-set writes on Linear / Jira. The draft scenario's edge case ("the existing workflow lock keeps runs from colliding") is not supported by the code. The design needs an explicit answer: serialise the jobs, add a per-FID concurrency group per job, or document and accept the race. The race already exists for claude + opencode today; codex makes it three-way.
- **codex-action runtime is unverified.** No source was read in this run. Before planning, confirm against https://developers.openai.com/codex/github-action whether `openai/codex-action@v1`'s default sandbox allows network, git push and `gh` writes. bkit phases push, comment and open PRs themselves. If the sandbox blocks that, the job goes green having changed nothing durable.
- **Codex guards are absent on the runner.** `.codex/hooks.json` fires only once the `.codex/` layer is trusted (`.bkit/providers.md:58`). On a runner, GateGuard and guardrails likely never fire while the job holds `contents: write` and a tracker key. Review codex runner diffs as unguarded.
- **Prompt dialect differs per job.** Codex invokes workflows as skills (`$bkit-auto`, `.bkit/providers.md:55`), not `/bkit-auto`. Three jobs mean three prompt strings, and each needs its own test.
- **No MCP fallback on the runner for Linear.** `claude_args` allows only `mcp__github__*` (`bkit-cloud.yml:526`), and Linear MCP needs browser OAuth anyway. Under Linear, any verb failure goes straight to Failure Path. Jira's MCP uses a Bearer token and could be allowed (`mcp__jira__*`); decide and document.
- **Vendor-named key collision.** `OPENAI_API_KEY` (Q7) is a common app secret. A consumer whose app already stores it starts paying for codex runs on every opted-in CI event as soon as they merge the new template. `ANTHROPIC_API_KEY` has the same exposure. The job summary should name which secret enabled which job, and the advisory should warn.
- **Secret blast radius.** A Linear personal key or Jira token stored as a repo secret becomes reachable by agents that read untrusted issue and PR text (`docs/security.md` § Untrusted Content). Use the narrowest key the tracker allows, at step scope only.
- **Self-hosted runner egress.** `{{CLOUD_RUNNER}}` may block `api.linear.app`, `mcp.atlassian.com` or `registry.npmjs.org` (A, C). The gate then reports "unreadable" on every run.
- **Recorded state differs from runtime.** `bkit.cloud.agent` records one variant and advisories cover that one, while the router starts every job whose key is set (Q9). `bkit check` reasons about one agent while three run.
- **Guards with nothing to check.**
  - Unverified: whether Cursor injects any issue id env var when started by `@cursor` on a GitHub issue. Without one the preflight sees an unset id and skips, so the draft's "only the session-start guard can stop it" fails open.
  - No vendor is known to inject a Jira issue id, so the Jira guard branch may be unreachable and untested in practice.
- **DE-21 needs more than a point-3 edit.** Its discarded alternative (4), "Linear→bkit-cloud bridge dropped; Linear cloud routing is Cursor-native", is reversed by this change. The superseding decision must say so explicitly.
- **Stale consumer copies fail safe but silently.** An old `bkit-cloud.yml` keeps no-oping with "serves the GitHub tracker only" while `bkit install --auto=claude --tracker=linear` now succeeds. The upgrade notice and `bkit check` advisory are the only signal.
