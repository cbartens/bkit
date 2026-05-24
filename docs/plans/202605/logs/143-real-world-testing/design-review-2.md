Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

### Component A — Capability Resolution (Worktree Setup)

**FM-A1: `[real-stack=off]` present in session text but parsed from wrong variable.**
The shell snippet reads `DEBUG_INPUT_FLAGS` for debug and `BUILD_INPUT_FLAGS` for build. These variables are not defined in the current `bkit-debug.md` or `bkit-build.md` step text — the current Step 2 writes a `debug-input-{DEBUG_ATTEMPT}.md` file but does not expose its text as a shell variable. If the implementation reads the wrong source (or the variable is simply empty), `[real-stack=off]` is silently ignored and `REAL_STACK` resolves to `live` (if `test:real` exists) or `absent` — both wrong. Detection: operator inspects `realStack` field in `status.json` after the run, or notices that the expected CONCERNS downgrade never appears in the close comment. Blast radius: one FID run.

**FM-A2: `pnpm turbo run test:real --dry-run` detection fails on turbo version skew.**
The design itself calls this out as an open question. If the dry-run flag returns a non-zero exit or different output format on the consumer's turbo version, capability resolves to `absent` even though a `test:real` task exists. Detection: operator only — a run that should have executed `test:real` produces `realStack: "absent"` in status.json. No active alert. Blast radius: silently degrades to CONCERNS on every build/debug run until a consumer notices.

**FM-A3: Capability resolved to `live` when `test:real` script exists but credentials missing.**
The design states "script exits non-zero at setup → capability resolves to `absent`." This assumes the script's setup guard runs at capability-resolution time (Worktree Setup). But the capability resolver only checks script existence via `jq` or `--dry-run` — it does NOT run the script. The script only runs at reproduce-first time (Step 4/Component B) or run-tests time (Step 6/C). If credentials are absent at run time but the script exists in `package.json`, `REAL_STACK` correctly resolves to `live` at Worktree Setup, but then `test:real` exits non-zero at Step 4 (reproduce). The design routes this as `REPRO=pass` (non-failure) → CONCERNS path, which is correct. However: there is no observability record distinguishing "test:real exit 0 = bug not reproducible" from "test:real exit non-zero = setup/credential failure." Both produce `REPRO=pass` (the design says "REPRO=pass" only when `$? -ne 0` is NOT true — meaning the script exited 0, not non-zero). Re-reading the design: `[ $? -ne 0 ] && REPRO=fail || REPRO=pass` — so non-zero exit at repro time sets `REPRO=fail`, which is correct. But a credentials-absent exit at repro time is treated as a genuine repro failure, not a capability-absent signal. The operator sees `debug-reproduce` step with `repro: fail` but `realStack: live` and no indication the failure was credential-related. Detection: operator must read the reproduce artifact to distinguish. Blast radius: misrouted; false repro failure causes the workflow to proceed with a misleading `repro: fail` record.

### Component B — Reproduce-First Gate (Debug)

**FM-B1: `repro: fail` recorded for infrastructure failure, not for the bug under test.**
If `test:real` fails due to credential absence, network timeout, or Docker not running — not the bug being debugged — the reproduce gate records `repro: fail` and proceeds to diagnosis. The diagnose agent now anchors on the wrong ground truth ("the test fails") and produces a plan to fix the credential failure rather than the intended bug. Detection: operator reading the diagnose artifact. No structured log distinguishing infra failure from bug failure. Blast radius: one debug run produces a wrong fix; potential for multiple retry loops consuming `MAX_TEST_ATTEMPT`.

**FM-B2: Reproduce gate runs against the wrong turbo filter.**
The design specifies `pnpm turbo run test:real --filter='...[origin/dev]'`. If the feature branch has no changes relative to `origin/dev` that touch the `test:real` scope, turbo may skip the task entirely (cache hit or empty filter). Exit code would be 0 (turbo does not error on empty task sets by default), setting `REPRO=pass`. The reproduce gate would incorrectly conclude the bug is not reproducible. Detection: operator inspects turbo output in the debug artifact. Blast radius: one debug run; CONCERNS outcome rather than genuine repro.

**FM-B3: Soak entry without a reproduce-first gate having run.**
Soak is entered via `OBSERVE_MODE=soak` at Step 1. The design says `OBSERVE_MODE = soak` is decided in Step 1 before the reproduce-first gate (Step 4 area). The design says the reproduce-first gate runs "when `OBSERVE_MODE = off` AND `REAL_STACK = live`." If `OBSERVE_MODE = soak`, the reproduce-first gate is explicitly skipped. Soak therefore begins without a recorded `repro: fail` — the vacuous-pass detection mechanism (fail-then-pass transition) is unavailable for soak entries. The soak loop itself re-runs `test:real`, but there is no initial `repro: fail` to anchor the transition against. Detection: none — soak can complete with a `realStackVerdict: PASS` that has no prior `repro: fail` to pair with. This is a gap in the vacuous-pass detection for the soak path.

### Component C — Empirical-Verify Gate (Run Tests)

**FM-C1: `test:real` fails hard within a soak iteration but `test:real` is the bug-under-fix.**
The design routes a `REAL_STACK=live` and `test:real` failing at run-tests time into the "hard FAIL, retry loop" path. Within soak, the design says the soak subagent "loops reproduce→instrument→fix→re-verify, re-running `test:real` after each fix attempt, until `test:real` goes green or the loop bound is hit." Each soak iteration records `repro: fail|pass`. But there is no description of what happens when soak exhausts `MAX_DEBUG_ATTEMPT` iterations with `test:real` still failing. The design says "loop bound is hit" — the soak step records a `debug-soak` entry and... what? The current Failure Path for debug is reached via `MAX_DEBUG_ATTEMPT` exceeded or `OBSERVE_MODE = analyse`. There is no specification of soak exhaustion routing. Detection: operator must inspect status.json; no alert. Blast radius: potential for the soak loop to end without a clear FAIL verdict being propagated to the close-workflow comment.

**FM-C2: Cost/credential blast radius under soak.**
Each soak iteration runs `test:real`, which hits live LLM/DB endpoints. With `MAX_DEBUG_ATTEMPT = 3` iterations and `test:real` itself potentially running multiple sub-tests, per-run costs can be significant. The design acknowledges this as an open question ("should `test:real` run on every debug attempt and every soak iteration?"). There is no hard cost cap, no `--dry-run` gate before soak entry, and no per-run spend estimation. Detection: external billing dashboard only; no in-workflow signal. Blast radius: per-consumer; could exhaust LLM quota or incur unexpected DB spend across multiple autonomous soak runs.

**FM-C3: `test:real` vacuous pass in empirical-verify when reproduce gate was skipped.**
For `OBSERVE_MODE = soak`, reproduce-first gate does not run. If `test:real` exits 0 immediately in the soak loop's first iteration (credentials absent, stack unreachable), the soak loop records `repro: pass` for that iteration and would treat the bug as fixed. The design's vacuous-pass detection relies on a `repro: fail` having been recorded before `repro: pass` — but in soak entry without reproduce-first, there is no prior `repro: fail`. Detection: none without the reproduce gate running. Blast radius: soak terminates green on a vacuous pass.

### Component D — Soak Mode (fourth OBSERVE_MODE value)

**FM-D1: Soak entered when `REAL_STACK != live` — fallback handling is incomplete.**
The design states: "If a soak run is requested when `REAL_STACK != live` → record CONCERNS with reason `real-stack-unavailable` and fall back to the standard diagnose→remediate path." However, the existing Step 1 OBSERVE_MODE decision produces `soak`, and the standard diagnose→remediate path is Steps 4–6 which are guarded by `OBSERVE_MODE = off`. If `OBSERVE_MODE = soak` and the fallback is supposed to run Steps 4–6, those steps' guards would skip them. There is no currently-specified mechanism for a `soak`-to-`off` downgrade within the same run. Detection: operator sees soak CONCERNS entry but no subsequent diagnose step, no Failure Path — workflow may silently end. Blast radius: feature branch gets no remediation.

**FM-D2: OBSERVE_MODE enum incompleteness — every `Run only if OBSERVE_MODE = off` guard in the current workflow is unmodified.**
Current `bkit-debug.md` Step 4 (Failure Diagnose), Step 5 (Failure Remediate), Step 6 (Run Tests), Step 7 (Push Remediation), Step 8 (Summary) all have `Run only if OBSERVE_MODE = off`. Step 12 (Close Workflow) has `Run only if OBSERVE_MODE = off or instrument`. Adding `soak` without updating these guards means: when `OBSERVE_MODE = soak`, all the standard steps are skipped, but the new soak step block (Step 9-soak) is not yet added to the actual workflow file. The workflow would fall through from Step 3 (Fetch Context) directly to Step 12 (Close Workflow), skipping diagnose/remediate/soak entirely because Step 12 also requires `off` or `instrument`. Detection: operator sees status.json with no diagnose/remediate/soak steps recorded, then no close-workflow step, then Failure Path. Blast radius: silent no-op for every soak-mode run until the workflow file is actually updated.

**FM-D3: Soak loop artifact accumulation and resume state.**
The design says each soak iteration appends a `repro: fail|pass` line to a soak artifact and the orchestrator records a `debug-soak` step entry. If a soak run is interrupted mid-iteration and resumed, the resume logic reads status.json and skips after the last `DONE` step. A partially-completed soak iteration has no `DONE` status (since status is written after the full iteration). Resume would re-enter the soak step and re-run the same iteration, potentially duplicating `test:real` calls and appending a second iteration record. Detection: operator inspects the soak artifact for duplicate iteration entries. Blast radius: doubled cost for the interrupted iteration; no functional harm if `test:real` is idempotent.

### Component E — Build e2e-smoke Gate

**FM-E1: CONCERNS-not-FAIL allows a real defect to pass as CONCERNS and get merged.**
This is the key concern from the task prompt. When `REAL_STACK = live` and `test:real` fails, the design correctly routes to hard FAIL (not CONCERNS). However, when `REAL_STACK = absent` or `off`, the gate degrades to CONCERNS and the PR can be raised. A developer who has a working real stack locally but CI lacks credentials will see `realStack: absent` + CONCERNS — and the PR proceeds. The reviewer must notice the close-comment line "Real-stack verification skipped — runtime-only defects not gated." This is the sole human-review gate preventing a real defect from merging behind a CONCERNS-degraded run. Detection: close comment + `realStackReason` in status.json. But status.json is not surfaced in the PR description by the current design — only the close-comment (if wired to a tracker) carries the signal. On a no-tracker repo (as seen in the current `bkit-debug.md`), the close-comment step says `_Tracker not wired — skip comment post._`. **The close-comment is silently skipped for no-tracker repos, leaving only status.json as the audit trail.** Blast radius: whole feature — a real defect can ship green behind a CONCERNS-downgraded PR.

**FM-E2: Build workflow's current Step 13 does not run `test:integration` or `test:e2e`.**
The current `bkit-build.md` Step 13 runs `pnpm turbo lint typecheck test` — it omits `test:integration` and `test:e2e` that are included in debug's Step 6. The design proposes adding `test:real` to this existing step. But even after adding `test:real`, Step 13 still doesn't run `test:integration`. This is pre-existing scope but relevant because the design's claim "cheap tiers short-circuit first" only holds if integration tests run before `test:real` in the same step — which requires explicitly adding them to the build Step 13 turbo task list.

### Component F — Plan Non-Mock Mandate

**FM-F1: Plan mandate is a static prose check with no downstream enforcement until build/debug.**
The `bkit-plan-review-3.md` lens flags "boundary-crossing task without non-mock test task" as CRITICAL. But bkit-plan-review-3 already has existing CRITICAL-path handling — a CRITICAL finding from the plan lens produces a review verdict that blocks plan approval. However, the plan mandate can only detect absence at plan-time; it cannot verify the test actually passes. The "written but never executed" gap is stated as "closed by build/debug downstream verification." If a consumer generates a plan on a machine with no plan-review wired (e.g. runs `@bkit-plan-generate` but skips `@bkit-plan-review-3`), the mandate is never enforced. Detection: depends on plan-review being run. Blast radius: per-feature plan; if review is skipped, the downstream build/debug gates are still the last line of defence.

### Component G — Escape-Hatch Audit (Close Workflow)

**FM-G1: `realStackReason` logged but not surfaced in PR description or tracker comment on no-tracker repos.**
The design specifies the close-comment adds the audit line. For no-tracker repos (the current bkit repo default), all `comment-post-step` blocks are `_Tracker not wired — skip comment post._` The close-comment's audit line exists in the workflow text but the mechanism to post it (tracker comment) is absent. The `realStackReason` field lands in status.json (auditable for those who look) but no human-visible surface calls it out in the PR. Detection: requires a human to read status.json. Blast radius: silently invisible on no-tracker repos; defeats the design's "loud and auditable" requirement.

**FM-G2: `[real-stack=off]` in debug-input is not validated for abuse.**
The escape hatch is honoured at face value. An operator can add `[real-stack=off]` to any debug-input and the capability resolves to `off`, the gate degrades to CONCERNS, and the run completes without real-stack verification. The only audit trail is `realStack: "off"` in status.json and the close-comment (where present). There is no alert, no count of how many runs have been opted out, and no review gate that flags an unusually high `off` rate. Detection: manual review of status.json history only. Blast radius: per-run; silently abusable.

---

## Observability Coverage

### Status.json as the sole structured log

The design's primary observability surface is status.json with the new `realStack`, `repro`, `realStackVerdict`, and `realStackReason` fields. This is consistent with the existing bkit pattern (all step verdicts are in status.json). However:

- **No metric/counter for occurrence rate.** There is no aggregation over runs — operators cannot query "how many of the last N debug runs had `realStack: absent`?" without reading each run's status.json individually.
- **No structured log at the failure point for FM-A3/FM-B1.** When `test:real` fails due to infrastructure/credential reasons rather than the bug, the failure is recorded as `repro: fail` in status.json, indistinguishable from a genuine repro failure. No separate field distinguishes infra failure from functional failure.
- **No trace span or correlation id.** The design adds no cross-step correlation beyond what status.json already provides via `step` + `attempt` fields. For the soak loop, individual iteration records are in a soak artifact file but not in structured per-iteration status.json entries — reviewers must parse a markdown file rather than a machine-readable record.

### Per-failure-mode observability gap assessment

| Failure Mode                                          | Structured log                                    | Metric | Trace | Gap Severity                                               |
| ----------------------------------------------------- | ------------------------------------------------- | ------ | ----- | ---------------------------------------------------------- |
| FM-A1: `[real-stack=off]` silently ignored            | `realStack` field in status.json                  | None   | None  | CRITICAL — `realStack` will show incorrect value; no alert |
| FM-A2: turbo dry-run detection skew                   | `realStack: absent` in status.json                | None   | None  | Moderate — detectable from status.json                     |
| FM-A3: credential failure → `repro: fail`             | `repro: fail` with no infra-fail flag             | None   | None  | Moderate — ambiguous signal                                |
| FM-B1: infra failure treated as repro failure         | `repro: fail`                                     | None   | None  | Moderate — wrong routing                                   |
| FM-B2: turbo filter skips task, exit 0                | `repro: pass`                                     | None   | None  | Moderate — silent vacuous pass                             |
| FM-B3: soak skips reproduce-first gate                | No `repro: fail` on soak entry                    | None   | None  | CRITICAL — vacuous-pass detection unavailable for soak     |
| FM-C1: soak exhaustion routing                        | `debug-soak` step; no explicit exhaustion verdict | None   | None  | CRITICAL — soak loop can end without actionable verdict    |
| FM-C2: cost blast radius under soak                   | None in-workflow                                  | None   | None  | Operational — external billing only                        |
| FM-C3: vacuous pass in soak first iteration           | `repro: pass` without prior `repro: fail`         | None   | None  | CRITICAL — mirrors FM-B3                                   |
| FM-D1: soak fallback to diagnose path broken          | `realStack` CONCERNS entry; no diagnose steps     | None   | None  | CRITICAL — silent no-op                                    |
| FM-D2: OBSERVE_MODE guards not updated                | Workflow falls through; no recorded steps         | None   | None  | CRITICAL — workflow is non-functional for soak             |
| FM-D3: soak resume duplication                        | Duplicate iteration entries in soak artifact      | None   | None  | Low — no data loss                                         |
| FM-E1: CONCERNS on absent stack not surfaced in PR    | `realStackReason` in status.json only             | None   | None  | CRITICAL — no-tracker repos get no human-visible signal    |
| FM-E2: build Step 13 missing integration tests        | Pre-existing gap                                  | —      | —     | Out of scope for this review                               |
| FM-F1: plan mandate skippable                         | Depends on plan-review being run                  | None   | None  | Low — downstream gates still enforce                       |
| FM-G1: close-comment audit line missing on no-tracker | status.json only                                  | None   | None  | CRITICAL — "loud audit" fails silently                     |
| FM-G2: `[real-stack=off]` silently abusable           | `realStack: off` in status.json                   | None   | None  | Moderate — no aggregation or alert                         |

---

## On-Call Ergonomics

### Anticipated alert/signal: `realStack: absent` or `off` in close-workflow status.json

**Runbook obviousness:** An operator reviewing a PR (or status.json) will see `realStackReason` explaining the skip. The close-comment text ("Real-stack verification skipped — runtime-only defects not gated") is clear in plain language. However, on no-tracker repos the comment is never posted, so the signal requires proactively reading status.json. There is no push-based alert — the operator must pull the information.

**Recovery action:** Human judgement required — the operator must decide whether to (a) add credentials and re-run debug/build, (b) accept the CONCERNS outcome as intentional, or (c) add `[real-stack=off]` as an explicit opt-out. There is no automatic recovery path.

**Alert noise:** There is no alert mechanism at all. Noise is not a risk; complete absence of alerting is the risk.

### Anticipated signal: soak mode active, cost accumulating

**Runbook obviousness:** There is no in-workflow signal that soak is actively spending against paid endpoints. An operator returning to check on a long-running soak has no way to see "iteration N of M, estimated cost so far" without reading the soak artifact file. The design provides no progress marker that a monitoring surface could consume.

**Recovery action:** The operator must manually terminate the soak run (no kill-switch within the soak loop itself beyond the existing workflow timeout of 3600 seconds). The existing 3600-second timeout is the only hard stop.

**Alert noise:** No alert mechanism exists. Cost overruns are detected only by external billing dashboards.

### Anticipated signal: reproduce-first gate records `repro: pass` (bug not reproduced at real stack)

**Runbook obviousness:** The design routes `REPRO=pass` (test passed, bug not reproducible at real stack) into "existing diagnose-can't-proceed handling (CONCERNS, not a hard abort)." The current `bkit-debug.md` does not have a well-defined "diagnose-can't-proceed" handling path — there is no branch in Steps 4–6 for the scenario where the reproduce artifact shows the bug is not reproducible. The Failure Path and the standard CONCERNS path are not the same. An operator encountering this would need to understand that `repro: pass` at reproduce time means "proceed anyway with `empirical-unverified` annotation" — this is not captured in any runbook or Gate checklist item.

**Recovery action:** No defined recovery action for `REPRO=pass` at reproduce time. Human judgement.

**Alert noise:** Single-event, not a noise concern.

### Anticipated signal: soak exhaustion (all iterations consumed, test:real still failing)

**Runbook obviousness:** The design does not specify the exhaustion routing for soak. An operator facing a soak that used all `MAX_DEBUG_ATTEMPT` iterations without resolving the bug has no runbook. The existing `debug-abort-handover` subagent is invoked by the Failure Path, but soak exhaustion is not mapped to the Failure Path in the design.

**Recovery action:** Undefined. This is a gap.

---

## Operational Dependencies

The design introduces the following new operational surface:

1. **New `debug-soak` step kind in status.json.** Any tooling that parses status.json for step summaries (dashboards, reporting scripts) must be updated to handle the new step kind. The design notes it reuses the same envelope shape — low migration cost but a new enum value.

2. **New `debug-reproduce` step kind in status.json.** Same as above.

3. **New `realStack` / `repro` / `realStackVerdict` / `realStackReason` fields.** Status.json readers must be aware of these optional fields; the design states they are additive and optional, so no breaking change, but any reporting that assumes "all runs have real-stack records" will see absent fields on pre-143 runs.

4. **New `bkit-debug-soak.md` prompt file.** Must be wired into `bkit install` mirror output and listed in `.agents/workflows.md` subagent catalog. The design notes mirror regen is batched at session end.

5. **`docs/testing.md` `Real` tier row.** Consumers upgrading from a pre-143 bkit install will have this row injected into their managed block. If a consumer has customised the `docs/testing.md` tiers table outside the managed block, the inject may conflict.

6. **No new dashboards or alerts are defined.** The design introduces no monitoring infrastructure — all audit trails are pull-based (status.json) rather than push-based (alerts). For a bkit maintainer, the new operational burden is: after each autonomous run, check `realStack` and `realStackReason` in status.json to confirm gates behaved as expected. This is low ongoing burden but entirely manual.

7. **Consumer-side `test:real` script authoring.** The design creates an expectation (documented in `docs/testing.md`) that consumers provide a `test:real` script. This is not enforced — absence degrades to CONCERNS. But the operational burden of writing, maintaining, and credential-gating a `test:real` script falls entirely on the consumer. The design provides no scaffolding, template, or advisory for this.

---

## Verdict Reasoning

The design is structurally sound and correctly identifies the core invariant (fail-then-pass transition via status.json) and the consumer-agnostic escape hatch (CONCERNS degradation). The backbone is operationally competent.

However, six CRITICAL gaps prevent the design from being operable as written:

1. **Soak mode skips reproduce-first gate, destroying the vacuous-pass detection mechanism** for the one path (soak entry) where the accumulating context loop is most likely to produce a misleading green.

2. **Soak exhaustion routing is unspecified.** The design provides no runbook or Failure Path mapping for when the soak loop consumes all iterations without resolving the bug.

3. **The `OBSERVE_MODE = soak` guards are not added to the existing Step 4–8 `Run only if OBSERVE_MODE = off` blocks.** Until these guards are updated, soak-mode runs skip all standard remediation steps and fall through to an undefined state.

4. **Soak fallback when `REAL_STACK != live` is mechanically broken.** The fallback to diagnose→remediate requires `OBSERVE_MODE = off`, which conflicts with `OBSERVE_MODE = soak` already being set.

5. **The close-comment audit line is never posted on no-tracker repos.** This silently disables the "loud and auditable" requirement for the majority of consumer contexts (including the bkit repo itself in its current no-tracker configuration).

6. **No distinction in status.json between infra-failure and functional failure at the reproduce-first gate.** Operators cannot determine from state alone whether `repro: fail` means "the bug is reproducible" or "the test infra is broken."

These gaps are addressable without design reversal. The CONCERNS verdict reflects that the design is operable with targeted fixes, not that it is fundamentally unworkable.

---

## CRITICAL

**C1: Soak mode bypasses reproduce-first gate → vacuous-pass detection unavailable for soak entries.**
The reproduce-first gate runs only when `OBSERVE_MODE = off`. Soak enters with `OBSERVE_MODE = soak`, skipping the gate. The fail-then-pass transition that detects vacuous passes is never recorded. Mitigation required: either run reproduce-first gate for `OBSERVE_MODE = soak` as well (before the soak loop starts), or add an explicit `REPRO_RECORDED` check that blocks soak entry if no `repro: fail` is on record for the current bug.

**C2: Soak exhaustion routing is not specified.**
When the soak loop exhausts `MAX_DEBUG_ATTEMPT` iterations with `test:real` still failing, the design does not specify how the workflow proceeds. This leaves the orchestrator in an undefined state. Required: explicit mapping of soak exhaustion → Failure Path + `debug-abort-handover`, identical to the existing `MAX_DEBUG_ATTEMPT` exceeded handling.

**C3: Existing `Run only if OBSERVE_MODE = off` guards in Steps 4–8 and Step 12 are not updated for `soak`.**
Adding `OBSERVE_MODE = soak` without updating guards produces a workflow that silently skips all remediation steps for soak-mode runs. Required: explicit guard audit — each existing guard must be extended to `OBSERVE_MODE = off or soak` (where the step should run for soak) or confirmed as `OBSERVE_MODE = off` only (where soak has its own dedicated step block).

**C4: Soak `REAL_STACK != live` fallback is mechanically broken.**
The design says fall back to diagnose→remediate, but diagnose and remediate steps are guarded by `OBSERVE_MODE = off`, and `OBSERVE_MODE = soak` has already been set. The fallback cannot execute. Required: either (a) immediately downgrade `OBSERVE_MODE` from `soak` to `off` when `REAL_STACK != live` and record the downgrade in status.json, or (b) treat soak-without-real-stack as Failure Path entry with a clear `real-stack-unavailable` reason.

**C5: Close-comment audit line is never posted on no-tracker repos.**
The `realStackReason` audit line is specified in the close-workflow comment body, but all comment-post-step blocks are `_Tracker not wired — skip comment post._` on the current bkit repo and all no-tracker consumer repos. The "loud audit" requirement fails silently. Required: an alternative audit surface for no-tracker repos — at minimum, emit the skip reason to the PR description body (the `gh pr create` body in Step 12 Close Workflow) or to the `debug-summary.md` artifact, so a human reviewer sees it without reading status.json.

**C6: No structured field distinguishes infra-failure from functional failure at reproduce-first.**
When `test:real` exits non-zero at reproduce time due to credential absence, network unavailability, or Docker not running, the record shows `repro: fail` identically to a genuine bug repro. The diagnose agent anchors on this as ground truth. Required: add a `reproFailReason` field (or `reproKind: infra|functional`) to the `debug-reproduce` step entry, set based on a simple heuristic (e.g., `test:real` exit code 1 with a setup-failed message pattern vs. a test-assertion failure pattern), so operators and the diagnose agent can distinguish.

---

## OPTIONAL

**O1: Add a `reproConf` (reproduce confidence) flag to the `debug-reproduce` step entry.**
A lightweight way to distinguish "test failed immediately with a setup error" (low confidence it's the bug) from "test ran to completion and assertions failed" (high confidence). Could be as simple as recording the exit code and last-N lines of output in a `reproOutput` field on the step entry. Low implementation cost; significantly improves diagnosability for FM-A3 and FM-B1.

**O2: Add a `soakIterations` counter and `soakCostEstimate` (optional) to the `debug-soak` step entry.**
Even a simple iteration counter in each `debug-soak` step entry would let an operator see "soak has run 2 of 3 iterations" from status.json without reading the soak artifact. Cost estimation is harder and optional, but iteration count is trivial to add.

**O3: Add `[real-stack=off]` audit to `build-summary.md` and `debug-summary.md` artifacts.**
The summary subagents already read status.json. A one-line instruction to include `realStack` value and `realStackReason` in the summary output would surface the skip in the PR description (which includes the summary verbatim in comment bodies) and in the artifact reviewers already read. This would compensate for FM-G1 without requiring tracker wiring.

**O4: Document the OBSERVE-vs-SOAK boundary sentence in `.agents/workflows.md` as specified.**
The design commits to this in Section D but the current `.agents/workflows.md` file is not shown as a target file in the Component Boundaries table. Explicitly adding it to the edit-point list ensures it is not forgotten in implementation.

**O5: Add a Gate 1 checklist item for `OBSERVE_MODE = soak` option alongside the existing `(off | instrument | analyse)` entry.**
Gate 1 currently shows `OBSERVE_MODE decided (off | instrument | analyse)`. This must be updated to include `soak` so the gate checklist fails if soak is not wired.

**O6: Consider a `test:real` CI opt-in advisory in `bkit check` output.**
When `bkit check` runs on a consumer repo that has no `test:real` script, a low-severity advisory ("Consider declaring a `test:real` script — see docs/testing.md Real tier") would encourage adoption without blocking. This is a consumer-ergonomics improvement, not an operability requirement.

---

## OUT OF SCOPE

**OS1: Build Step 13 missing `test:integration` and `test:e2e`.**
The current build workflow's Step 13 omits integration tests that debug's Step 6 includes. This is a pre-existing gap predating this design. The design adds `test:real` to the existing sequence; whether to also add integration tests to build Step 13 is a separate decision.

**OS2: bkit repo's own `test:real` choice.**
Whether the bkit repo itself declares a `test:real` script is a bkit-repo-specific decision explicitly called out as an open question in the design. Assessment of that decision is out of scope for this review.

**OS3: Consumer `test:real` script quality and accuracy.**
The design accepts as a residual risk that a consumer can mislabel a mocked suite as `test:real`. Verifying that consumer scripts actually hit real deps is beyond the scope of consumer-agnostic tooling.

**OS4: Mirror regen and install flow for `bkit-debug-soak.md`.**
The design notes mirror regen is batched at session end. Verifying the install/upgrade flow correctly delivers the new prompt to consumers is an implementation concern for the build phase, not the design phase.
