Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

This design has no runtime service — it is inline bash inside workflow instruction files, executed by an orchestrator (Claude/Cursor/opencode cloud agent). "On-call" in this context means: an operator inspecting a failed workflow run after the fact, or diagnosing a vacuously-green PR that slipped through. There is no paging infrastructure; the "alert" is a failed bkit-workflow Failure Path, a stale PR, or a CI run that never appears.

### Component: Poll loop (60s / 6×10s)

**What fails:**

- **Queue latency exceeds budget (false suppression).** GitHub's `statusCheckRollup` / `gh run list` surfaces dispatched runs asynchronously. On a slow-runner or a heavily-loaded GitHub Actions queue, a real run dispatched at the push can take >60s to appear. The poll exits after 6 attempts, finds nothing, and proceeds to self-heal.
  - Result: wasted `--allow-empty` re-trigger commit on the branch. On `bkit:auto` consumers, this fires a second `bkit-decide` run and a second cloud-auto-route fan-out. Cap-1 bounds the blast to exactly one extra run, but the double-routing is observable noise.
  - Detection: per-attempt poll log ("attempt N/6: rollup has K checks") in the orchestrator stdout. No counter or metric exists — detection is grep-in-logs only.
  - Blast radius: single feature branch, one extra run. D2 auto-route fires twice on that feature (not a cross-tenant issue).

- **gh API rate-limit during poll.** `gh pr view --json statusCheckRollup` and `gh run list` are REST calls counted against the actor token's rate limit. A consumer running many parallel build/debug workflows, or an org-scoped token near exhaustion, can see 429s mid-poll.
  - The design does not specify how poll-iteration errors (non-zero exit from `gh`) are handled. If the loop `set -e`'s out on a 429, the gate exits early — the outcome is neither dispatched nor unresolved. If errors are swallowed, a 429-string in the probe output corrupts the "K checks" count.
  - Detection: none specified. No structured log for `gh` subprocess failure inside the poll.
  - Blast radius: the gate silently bypasses for the affected run. The PR HEAD may be suppressed, but the workflow reports "done" without a `ciDispatch` verdict. This is a hole in the gate's coverage promise.

- **poll correctly reaches all 6 attempts before self-heal.** The bash loop implementation must not break on empty output (empty `statusCheckRollup` array is valid JSON `[]`, but a jq parse error on an unexpected shape could short-circuit). The design specifies the conceptual shape but defers byte-exact bash to the plan phase.

### Component: Self-heal re-trigger

**What fails:**

- **Re-trigger itself gets suppressed.** The design addresses this: re-assert HEAD cleanliness post-commit (`%B grep`), treat a dirty re-trigger as `unresolved`. This is the correct handling.
  - Detection: the re-assertion grep fires, `ciDispatch=unresolved`, Failure Path emits HEAD SHA + last rollup state + reason. Good.

- **Re-trigger's second poll times out due to queue latency (not suppression).** After the re-trigger push, the second poll runs with the same `ATTEMPTS` budget (~60s). If the re-trigger dispatch also takes >60s to surface, the second poll exits empty. The design routes this to `no-ci` (pass as no-op). This is the **no-CI discriminator logic**:
  - If the re-trigger push was clean but BOTH polls time out due to genuine queue latency, the gate concludes `no-ci` (no CI workflow for this event) and passes silently.
  - On a repo that does have CI but GitHub Actions is experiencing latency, this is a **false no-CI verdict**: the workflow passes, the PR is left without confirmed CI dispatch, and the KN-11 blind spot re-opens one level down.
  - The design assumes the second poll is sufficient to distinguish "no CI workflow" from "CI workflow but slow to dispatch." This assumption holds under normal conditions but fails under sustained GitHub Actions queue pressure.
  - Detection: `ciDispatch=no-ci` in `status.jsonl` — an operator reading `status.jsonl` post-facto can identify this outcome, but there is no proactive alert that distinguishes a legitimate no-CI repo from a false negative.
  - Blast radius: single feature branch, silent pass, PR sits without confirmed CI.

- **Re-trigger's `AUTO_ROUTE_SUFFIX` derivation fails.** If `LABELS` is unset or `BKIT_AUTO_ROUTE_FILE` is missing/deleted between steps, the re-trigger commit lacks the marker and the auto-route fan-out drops silently for `bkit:auto` consumers.
  - Detection: none specified in the design. The suffix derivation failure would produce a clean commit (no suppressor token) so the gate would proceed normally. The auto-route miss would only be detected by a consumer noticing no cloud-agent run fired.
  - Blast radius: single feature / single consumer; cloud-agent run doesn't fire on re-trigger. Recoverable by manual `gh workflow run`.

### Component: EC-2 abort-guard

**What fails:**

- **`gh pr list` probe fails during abort.** The design specifies: failed probe = "PR exists, be safe, skip the push." This is the correct cost-asymmetry-driven fallback.
  - However, if the abort path itself is already in a degraded state (network partition, token issue), skipping the push means the abort commit is never recorded on the branch. The issue-comment handover is the surviving artifact.
  - Detection: orchestrator stdout shows the `gh pr list` failure; issue comment is the durable record.
  - Blast radius: abort context is in the issue comment, not on the branch. Acceptable per design intent.

- **Stale CI on old HEAD after EC-2 guard fires.** The guard leaves the last validated remote HEAD on the branch. If that HEAD was itself the last clean commit from a prior run (e.g. a `close-workflow` from a previous build attempt), its associated CI run may already be complete (pass or fail). A subsequent developer opening the PR sees an old green run, not "no run" — potentially masking the fact that this build's changes were never tested.
  - The design notes EC-2 abort preserves the "last validated HEAD" but does not address whether "last validated" means "last known-clean" or "last CI-confirmed." If a prior run's HEAD is on the branch but its CI run was partial (e.g. ran with `[force cache]` and skipped some tests), the stale run appears green but is not a full validation.
  - Detection: operator must inspect the HEAD SHA on the PR vs. the HEAD SHA of the last CI run to confirm they match. Not automated.
  - Blast radius: single PR; risk is operator-invisible stale CI, not a loop or cascade.

- **Subsequent run merge conflict after abort-guard.** The design raises this as an EC-2 concern: "stale CI on old HEAD." A subsequent `/bkit-build` resume on the same feature after an EC-2 abort finds the remote branch at the old validated HEAD, not at the aborted build's local HEAD. If local and remote have diverged (e.g. local has the summary commit, remote has the prior close-workflow commit), a force-with-lease push is needed. The design does not specify how a resume handles this divergence — whether the pre-flight EC-1 check catches it or whether it falls through to a raw git conflict.
  - Detection: git push error in orchestrator stdout. EC-1 pre-flight would flag "open PR exists" and fail fast, which is the correct behavior, but the operator then faces manual reconciliation.

### Component: EC-1 pre-flight

**What fails:**

- **`gh pr list` probe fails silently (falls through).** The design specifies: failed probe = treat as unknown, proceed with blind `gh pr create` (no regression). The outcome gate is the backstop.
  - If both the EC-1 probe and the subsequent `gh pr create` fail (e.g. token lacks `repo` scope), the workflow enters its existing Failure Path — not a new failure mode.

### Component: Ship gate (poll-only, no self-heal)

**What fails:**

- **Poll budget exceeded on ship due to queue latency.** The ship gate polls for a dispatched run after the squash merge push to `dev`. If the queue is slow, the gate exits with an empty rollup and the hard Failure Path fires.
  - Unlike build/debug, there is no self-heal. The operator must manually re-trigger CI on `dev` and re-run ship.
  - Detection: Failure Path emits HEAD SHA and a `gh workflow run ci.yml --ref dev` recovery command per `deployments.md:351`.
  - Blast radius: ship is blocked; `dev` is in a clean but unconfirmed state. No data loss, no loop risk.
  - This is the intended behavior per the #81 Change C design: a false positive here is safer than a false negative. Acceptable trade-off, but operators should know that ship can page on genuine queue latency, not just suppression.

### Component: Inline copy drift (3 gate sites + 2 abort-guard sites)

**What fails:**

- **One copy edited, others not.** A future maintainer tunes `POLL_BUDGET_S` (e.g. in response to measured p99 latency) on `bkit-build.md` but forgets `bkit-debug.md`. The three sites diverge silently. The design mitigates this with named symbols and a grep-equality acceptance check, but the acceptance check is specified as a test artifact, not a CI gate.
  - Detection: grep across the three sites in CI (the design specifies this as an acceptance criterion, but does not specify it as a blocking CI step). Until the plan phase wires it as a mandatory check, drift is detected only by human review or by symptom (inconsistent behavior across workflow types).
  - Blast radius: the diverged site has a different poll budget, potentially causing the false-no-CI or false-suppression failure modes at a different rate than the other sites.

---

## Observability Coverage

The project has no server-side telemetry (confirmed: `docs/observability.md` scope is CLI stdout/stderr only; no trace pipeline, no metrics backend, no log drain). All observability for this gate is:

1. Orchestrator stdout during the workflow run.
2. `status.jsonl` — the NDJSON state file the #209 model writes; the `ciDispatch` verdict field is the new key.
3. Issue comments (abort handover).

### Per failure mode:

<!-- prettier-ignore -->
| Failure Mode | Structured log at failure point | Metric/counter | Trace/correlation ID | Assessment |
| --- | --- | --- | --- | --- |
| Poll loop: queue latency false suppression | Per-attempt "attempt N/6: rollup has K checks" — present per design | None | None | Adequate for reconstruct; no proactive detection |
| Poll loop: gh API rate-limit / subprocess error | NOT specified — no structured log for non-zero `gh` exit in loop | None | None | CRITICAL GAP — gate can silently fail to assess |
| Self-heal: re-trigger suppressed | `ciDispatch=unresolved` + HEAD SHA + last rollup state in Failure Path | None | None | Adequate for diagnosis |
| Self-heal: second poll times out (false no-CI) | `ciDispatch=no-ci` in status.jsonl — present | None | None | Gap: `no-ci` on a CI-capable repo is silent (no adverse signal); no way to distinguish from legitimate no-CI |
| Self-heal: AUTO_ROUTE_SUFFIX derivation failure | NOT specified | None | None | CRITICAL GAP — auto-route miss is silent |
| EC-2 abort: gh probe failure | Orchestrator stdout (gh error); issue comment preserved | None | None | Adequate |
| EC-2 abort: stale CI on old HEAD | NOT specified — no log that old HEAD CI is now the visible status | None | None | Gap — operator must manually correlate HEAD SHA to run SHA |
| EC-1 pre-flight: probe failure falls through | Orchestrator stdout | None | None | Adequate (existing behavior) |
| Ship gate: poll times out | Failure Path with recovery command | None | None | Adequate for actionability |
| Inline copy drift | None at runtime — grep-equality check in CI (if wired) | None | None | Gap — drift is silent until symptom |

**Project convention check:** `docs/observability.md` specifies `[{Context}]` prefixed log format for bkit CLI output. The design's poll log ("attempt N/6: rollup has K checks") does not specify a `[Context]` prefix. Per project convention, this should be `[bkit-ci-gate]` or similar. This is not a blocker but is a convention gap.

**CRITICAL: gh subprocess error handling in poll loop not specified.** If `gh pr view` or `gh run list` exits non-zero inside the poll loop (rate limit, network error, token scope failure), the design does not specify what happens. If the bash exits on error (`set -e`), the gate aborts without writing a `ciDispatch` verdict to `status.jsonl`. The workflow's overall success/failure state is then undefined — the outer Failure Path may or may not catch it depending on how the poll loop is structured. This must be specified in the plan phase.

**CRITICAL: AUTO_ROUTE_SUFFIX derivation failure is silent.** The design specifies that the re-trigger commit carries the same `AUTO_ROUTE_SUFFIX` as close-workflow, sourced via `LABELS` (build) or `BKIT_AUTO_ROUTE_FILE` (debug). If either source is absent or empty, the re-trigger commit is still clean (no suppressor) and the gate proceeds to `self-healed` or `no-ci`. The auto-route miss is never logged as an anomaly. For `bkit:auto` consumers, the cloud-agent run simply does not fire on the re-trigger. No log, no verdict difference, no operator signal.

---

## On-Call Ergonomics

"On-call" for bkit is the developer running the workflow, plus any team member debugging a stale PR. There is no NOC, no paging system. The failure surfaces are: Failure Path messages in orchestrator output, `status.jsonl`, and issue comments.

### `unresolved` Failure Path

**Runbook obviousness:** The design specifies the Failure Path emits HEAD SHA + last rollup state + re-trigger error / suppressed-HEAD reason + the `gh workflow run ci.yml --ref feat/{FID}` manual recovery command (from `deployments.md:351`). This is adequate for the case where the re-trigger was suppressed or errored.

**Missing:** The message does not distinguish between "re-trigger HEAD was suppressed" (a bkit authoring bug) and "budget exhausted on first poll without re-trigger" (a transient queue latency issue). An operator seeing `unresolved` cannot tell from the message alone whether to:

- Wait and re-run (transient latency).
- Investigate a suppressor token in the commit message (authoring bug).
- Investigate a `gh` API failure (token/network issue).

The message should encode the sub-reason. The design lists "re-trigger errored, or re-trigger HEAD was itself suppressed, or budget exhausted with a dirty HEAD" as all mapping to `unresolved`, but does not specify that the Failure Path message differentiates them.

### `no-ci` outcome

**Runbook obviousness:** `ciDispatch=no-ci` in `status.jsonl` passes silently as a logged no-op. On a repo that legitimately has no CI, this is correct. On a repo where CI is expected but both polls timed out, this passes silently and the operator has no signal that anything was wrong.

**Gap:** An operator debugging a PR that never ran tests sees `ciDispatch=no-ci` in `status.jsonl` and may conclude the repo has no CI, when in fact both polls timed out. The `no-ci` label is ambiguous between "confirmed no CI workflow" and "CI workflow may exist but neither poll surfaced a run."

A more diagnostic label would be `no-ci-confirmed` (when the re-trigger is also clean and still dispatches nothing, possibly after a deliberate wait longer than dispatch p99) vs. `no-ci-inferred` (when the second poll also timed out within budget). The current design collapses both into `no-ci`.

### `self-healed` outcome

**Runbook obviousness:** `ciDispatch=self-healed` in `status.jsonl` is actionable (one extra empty commit on the branch). The operator can see the re-trigger commit in git log.

**Gap:** On a `bkit:auto` consumer, `self-healed` means two `bkit-decide` runs fired for the same feature — the first (suppressed, never appeared in rollup) and the re-trigger. If the stale-run guard in `bkit-cloud.yml` is not confirmed to handle two coexisting runs at the same graph position, the second cloud-agent run may conflict or duplicate. The design lists this as an open question (not blocking), but the on-call ergonomics gap is: if a cloud-agent double-fires, an operator sees two PR comments from the agent with no clear indication which is authoritative.

### Recovery action classification

<!-- prettier-ignore -->
| Outcome | Recovery action | Automatic / idempotent / human judgement |
| --- | --- | --- |
| `dispatched` | None | Automatic |
| `self-healed` | None (one extra empty commit stays on branch) | Automatic; commit is cosmetic |
| `no-ci` | None (logged no-op) | Automatic |
| `unresolved` | `gh workflow run ci.yml --ref feat/{FID}` | Human judgement (operator must decide if this is transient or a bug) |
| Ship gate Failure Path | `gh workflow run ci.yml --ref dev` + re-run ship | Human judgement |

**Alert noise risk:** The ship gate (poll-only, no self-heal) can page on genuine GitHub Actions queue latency, not just suppression. If the org's Actions queues run slow (e.g. a large CI spike), every concurrent ship attempt fails. No threshold tuning is possible because this is a bash poll, not a metric-driven alert. The only mitigation is increasing `POLL_BUDGET_S`, but that adds wall-clock latency to every ship.

---

## Operational Dependencies

This design introduces no new dashboards, no new alert rules, no new runbook pages in an on-call tool. It is pure workflow instruction changes.

**New operational artifacts the design requires:**

1. **`docs/deployments.md` KN-11 update** — must document the discriminator-by-construction invariant and named poll budget constants. This is the canonical "runbook" for future maintainers. The design specifies this in lockstep with the workflow edits.

2. **`docs/deployments.md` D2 record update** — must document the re-trigger-clean-before-`no-ci` rule and the `AUTO_ROUTE_SUFFIX` sourcing invariant. Without this, bus-factor risk is high: these are non-obvious rules that a maintainer could "simplify" away.

3. **Grep-equality CI check** — the design specifies a grep-equality / render-sweep acceptance check that the inlined gate is byte-identical across the 3 sites. This needs to be wired as a mandatory CI gate (or pre-push hook check), not just a recommendation. If it is only an acceptance criterion in the plan, it will decay.

4. **No new dashboard, alert, or pager rule** — correct for a CLI-only tool with no telemetry infrastructure.

**On-call burden assessment:** The new burden is on the developer running the workflow:

- Longer close-workflow step (up to ~120s on self-heal path) vs. ~0s today.
- `unresolved` Failure Path requires manual re-trigger and diagnosis.
- Ship gate false-positives on queue latency require manual re-ship.

These are acceptable burdens for the safety gained, but the latency addition (up to 2 minutes on the self-heal path) should be documented so operators know this is expected, not a hung workflow.

---

## Verdict Reasoning

The design is sound in its core logic: outcome-based gate, 4 typed outcomes, cap-1 self-heal, re-trigger-clean re-assertion before `no-ci`, EC-2 abort-guard. These address the root cause cleanly.

Two operability concerns prevent a clean PASS:

**1. gh subprocess error handling in the poll loop is unspecified (CRITICAL).**
If `gh pr view` or `gh run list` returns a non-zero exit code (rate limit, token scope, network) inside the poll loop, the design does not specify whether the loop continues (treating the error as "no run yet"), aborts with an uncontrolled exit, or routes to `unresolved`. An uncontrolled exit leaves `status.jsonl` without a `ciDispatch` verdict, which breaks the #209 state model's completeness invariant and leaves the operator with no terminal state to inspect. This must be resolved in the plan phase.

**2. `AUTO_ROUTE_SUFFIX` derivation failure on re-trigger is silent (CRITICAL).**
If `LABELS` (build) or `BKIT_AUTO_ROUTE_FILE` (debug) is absent or empty when the re-trigger commit is constructed, the re-trigger lands without the `bkit [auto route]` marker. The gate proceeds to `self-healed` or `no-ci` with no log of the marker miss. For `bkit:auto` consumers, the cloud-agent run does not fire on the re-trigger. The plan phase must specify: if `AUTO_ROUTE_SUFFIX` cannot be derived with the same value it had at close-workflow time, treat that as an `unresolved` condition (not a silent-pass), and log the derivation failure explicitly.

**Three addressable concerns (OPTIONAL):**

3. The `no-ci` verdict is ambiguous between "confirmed no CI workflow" and "second poll also timed out" — an operator cannot distinguish a legitimate no-CI repo from a CI-capable repo where both polls timed out under queue pressure. The plan phase should log the distinction more explicitly (e.g. emit a note in the Failure Path log when `no-ci` is reached after budget exhaustion on both polls, vs. a repo where `bkit-decide` is provably absent).

4. The `unresolved` Failure Path message does not distinguish sub-reasons. The plan phase should encode the sub-reason (transient timeout / suppressor token found / gh API error) in the message so an operator can triage without reading orchestrator logs.

5. The `[bkit-ci-gate]` log prefix (or equivalent) is not specified. Per `docs/observability.md` project convention, all bkit CLI/orchestrator output uses `[{Context}]` prefixes. The plan phase should specify the prefix for gate poll logs.

---

## CRITICAL

**C1: gh subprocess error handling in poll loop must be specified before plan phase.**
If `gh pr view` or `gh run list` exits non-zero inside the poll loop (rate limit, token scope, network), the gate must explicitly handle the error: either retry the iteration (with a structured log of the gh failure), or route to `unresolved` with a log line naming the gh error. The plan phase must produce bash that never exits the poll loop with an uncontrolled non-zero without writing a `ciDispatch` verdict to `status.jsonl`. The current design specifies the conceptual shape but defers byte-exact bash to the plan — the plan must close this gap or the gate can silently drop coverage on gh API errors.

**C2: AUTO_ROUTE_SUFFIX derivation failure on re-trigger must be an explicit error, not a silent pass.**
The plan phase must specify: before pushing the re-trigger commit, assert that `AUTO_ROUTE_SUFFIX` was derived with the same value it would have had at close-workflow time. If the derivation returns a different value (e.g. empty when close-workflow had `bkit [auto route]`), route to `unresolved` with a log naming the derivation mismatch. A silent re-trigger commit that drops the auto-route marker causes a missed cloud-agent dispatch with no operator signal.

---

## OPTIONAL

**O1: Distinguish `no-ci-confirmed` from `no-ci-inferred` in status.jsonl.**
The current design collapses "confirmed no CI" and "second poll also timed out" into `no-ci`. Consider emitting a structured note in the orchestrator log (not a new verdict value, to preserve the closed 4-state enum) that identifies which path was taken: "re-trigger dispatched nothing after full budget — concluding no CI workflow for this event" vs. "re-trigger poll also reached budget limit — concluding no CI (unconfirmed)." This lets an operator distinguish a legitimate no-CI repo from a queue-latency false no-CI in the `status.jsonl` log output.

**O2: Encode sub-reason in `unresolved` Failure Path message.**
Emit one of three sub-reason codes in the Failure Path message: `timeout-dirty` (budget exhausted, HEAD has suppressor), `retrigger-suppressed` (re-trigger HEAD was itself suppressed), `gh-error` (gh API non-zero exit). This allows triage without reading the full orchestrator transcript.

**O3: `[bkit-ci-gate]` log prefix on all poll log lines.**
Per `docs/observability.md` project convention, prefix all gate poll log lines with `[bkit-ci-gate]` (or a project-appropriate `[{Context}]` form). This makes the gate's output greppable in orchestrator transcripts and consistent with bkit's existing log format.

**O4: Document the expected wall-clock latency addition in the workflow instructions.**
The close-workflow step now takes up to ~60s (dispatched path) or ~120s (self-heal path) longer than before. The plan phase should add a one-line note in the workflow instruction (or a comment above the gate bash) so an operator who sees the step hang for 90s does not assume the workflow is broken.

**O5: Wire the grep-equality check as a mandatory CI gate, not just an acceptance criterion.**
The design specifies a grep-equality / render-sweep check that the inlined gate is byte-identical across the 3 sites. If this is not wired into `ci.yml` or the pre-push hook, it will decay. The plan phase should add it as a step in the CI scaffold or in the pre-push hook's bkit-check gate.

---

## OUT OF SCOPE

**EC-1 full PUSH_MODE/EXISTING_PR alignment (D2-risky).** The design explicitly defers the full build/debug branch-PR alignment with a placeholder comment. Whether the deferred fix introduces a mid-build `synchronize` is a D2 risk evaluation for a future design, not this one.

**EC-3 clean create-pr commit.** Deferred per design; the gate's self-heal recovers EC-3-induced states.

**D2/D3 stale-run guard in `bkit-cloud.yml`.** Whether the auto-route stale-run guard tolerates two coexisting runs at the same graph position (from a self-heal re-trigger) is a separate `bkit-cloud.yml` hardening question. The design lists it as an open question; it is out of scope for this gate design.

**#279 squash-body `[skip ci]` leak.** Same suppression class, ship side; explicitly deferred.

**Paging / alerting infrastructure.** bkit has no server-side telemetry or paging system. There is nothing to configure here and no dashboard to build.
