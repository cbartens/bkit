Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

<!-- prettier-ignore -->
| Component / flow | What fails | Detection | Blast radius |
| --- | --- | --- | --- |
| Router context job: bkit install on runner | registry / setup-node outage, lockfile mismatch, self-hosted runner egress block | `gate: bkit unavailable` notice + summary row (green run) | every opted-in repo run, all trackers, incl. GitHub (correlated pause) |
| `bkit_gate`: label read | secret unset, tracker down, issue not found, output renamed | notice with `reason=<r>`; secret named; unparseable never `label-absent` | one repo; silent unless someone reads the log |
| `fids parse --branch` fallback | ledger lacks feature row on `dev` ref -> no issue id | `no-issue` notice | feature never dispatches; looks like "agent ignored me" |
| Router agent jobs (3-way) | several keys set -> races on one PR; codex action green but changed nothing (sandbox / actor check) | none for the race; codex no-op detectable only by reading PR | one PR / feature |
| codex job on shared `OPENAI_API_KEY` | unintended runs and spend after template merge | advisory + summary line (open Q A) | cost, whole repo |
| Session guard (hook) | unreadable tracker, missing id, python3 / curl absent, `node_modules/.bin/bkit` absent (Jira) | HARD STOP text naming tracker + reason (fail closed) or "not verified" context line (fail open) | one session; fail-open path runs unguarded |
| Stale adopted `bkit-cloud.yml` | silent no-op under Linear / Jira | detect-only advisory on upgrade / check only | one consumer; indefinite |
| Post-merge `dev` debug | closed issue still labelled -> dispatches | by design | one feature |

## Observability Coverage

- Present and good: distinct per-outcome notices, job-summary row (`tracker`, `issue`, `verdict`, `reason`), secret named on auth failure, redaction via `fetch`, local repro command (`pnpm bkit issues fetch --issue <id> --json`), advisory for stale copy and missing secrets.
- Gap: the job summary row is only written by CI-driven context runs. There is no aggregate signal (counter, alert) for "N consecutive runs `bkit-unavailable` / `unreadable`". Because every outcome exits green, a persistent outage (expired `BKIT_LINEAR_API_KEY`, rotated Jira key) means features silently stop shipping. Detection is user report only. The design acknowledges "log is the only signal" but offers nothing beyond log reading.
- Gap: no log prefix convention stated for new engine output. Any new stderr from `fetch` / `terminal` fact work and from the hook should use the owning module prefix per `docs/observability.md` (`[bkit-issues]`-style, `[bkit-fids]`). Not specified; the hook messages are free text.
- Gap: codex job has no post-run verification signal (did it push / comment?). Design itself flags "green job that changed nothing" as a risk but only mitigates by choosing sandbox flags; no summary line records what the agent did or that the action's write-access / bot check rejected the actor.
- Gap: the three-way race has no observable (which jobs started, which PR) beyond the per-job logs. A summary line "jobs started: claude, codex" is cheap and not in the design (the open Q only proposes it for the `OPENAI_API_KEY` collision).
- Gap: guard fail-open ("SKIPPED — no issue id") goes only to session context, not to any durable log; a reviewer of a session cannot find it later except in the transcript.
- Correlation: FID and issue id appear in the summary row; no run-to-agent-session correlation id is stated for dispatched jobs (workflow run URL in the tracker comment would cover it).

## On-Call Ergonomics

- Alert payloads: there are no alerts, only green runs with notices. Runbook obviousness is good per notice (reason + secret name), but the notice for `bkit unavailable` says "dependency install failed" without pointing at the install step log; add the step name or link.
- Recovery: re-run or `workflow_dispatch` (idempotent; dispatched runs skip the kill switch). `bkit unavailable` is auto-recoverable on re-run. Missing secret needs human action; the notice names it.
- Noise: no paging, so no storm. Counter-risk is the opposite, silence. Fail-closed-but-green on credential expiry is the likely real-world incident (expired key) and surfaces only as "feature stalled".
- Stale-copy advisory fires on every `check` / `upgrade` until merged; acceptable, self-silences.
- Race and codex-unguarded runs require human diff review; make that explicit in `.bkit/cloud.md`.

## Operational Dependencies

New burdens for consumers: repo secrets `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` / `OPENAI_API_KEY` and their rotation; committed `bkit.tracker.jira.site`; context job now needs pnpm + Node install and registry access (install minutes on every opted-in CI completion); a manual merge of the new router into adopted copies. For maintainers: the rewritten `cloud-ctx-step.integration.test.ts` / `ci-dispatch-gate-alignment.test.ts` are the only regression net for the kill switch; the GitHub path loses its existing end-to-end evidence until re-proven. No dashboard or runbook is introduced; `.bkit/cloud.md` should gain a troubleshooting table mapping each `verdict` / `reason` to an action (not listed in the Docs section).

## Verdict Reasoning

CONCERNS. Each enumerated failure mode has a distinct, named, fail-closed signal and a stated recovery, and the open questions carry lettered options, a Recommended and a Default. The remaining issues are addressable: persistent credential or registry failure is invisible beyond green-run notices, the codex no-op risk has no verification signal, and one new failure surface (moving the GitHub kill switch onto Node + registry) is the design's own chosen trade. None makes the design inoperable, so not FAIL.

## CRITICAL

None.

## OPTIONAL

1. **Silent-stall detection.** Pick one cheap signal for repeated `unreadable` / `bkit-unavailable`: a PR or issue comment from the router on the first non-pass verdict per FID (dedup on marker), or `::warning::` annotations instead of `::notice::` for the unreadable and unavailable verdicts so they show on the run summary page. Expired tracker keys are the likeliest incident.
2. **Codex outcome signal.** Add a summary line after the codex job (action exit, whether commits / comments landed, actor-check result) and record in the live-dispatch verification that the bot / actor check passes on a `workflow_run` from a bot commit; otherwise "green, did nothing" is undetectable.
3. **Jobs-started line.** Context job summary should list which of claude / opencode / codex were enabled and by which secret, covering both the three-way race and the `OPENAI_API_KEY` collision (fold into open Q "collision", Option A already points here).
4. **Log prefixes.** State that new engine messages use the existing owning-module prefix (`docs/observability.md` § prefixes) and that hook / gate notices carry a `[bkit-cloud]`-style context prefix so they are greppable across runs.
5. **`bkit unavailable` notice** should name the failing step (`Install bkit`) and say "re-run or workflow_dispatch".
6. **Troubleshooting table** in `.bkit/cloud.md`: `verdict` / `reason` -> cause -> action.
7. **Guard fail-open** ("not verified") also written to a durable place (e.g. a line appended to the feature's run log or comment), not only session context; Open Q recommendation A is acceptable only with that.
8. **Hook timeouts.** The curl / GraphQL / `bkit issues fetch` reads in a SessionStart hook need bounded timeouts so a hung tracker cannot stall session start; design does not state them (fail closed HARD STOP on timeout).
9. **Unresolved-state risks** (`Risks`) lack option lists, e.g. "recorded state vs runtime" and "stale copies fail safe silently"; convert to open questions or mitigations with lettered options where a decision exists. Open questions themselves are complete.

## OUT OF SCOPE

- Arbitrating the three-way agent race (deferral 397).
- Codex Cloud session-start guard (deferral 719).
- Fleet-level monitoring across consumers of router health.
- Non-pnpm consumer adaptation of the context job install block.
