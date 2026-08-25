Verdict: SINGLE
<!-- verdict:end -->

# Plan Complexity Check — #363 widen bkit-cloud trigger to post-merge dev CI

**Source plan:** `plan-v3-checked.md` (765 lines, 10 tasks).
**Assessment:** Fits a single high-quality `/bkit-build` execution session. No partition into sub-plans required.

## Reasoning

### 1. Task count and file surfaces

<!-- prettier-ignore -->
| Task | Type | File surface | Size |
| --- | --- | --- | --- |
| 1 | code (cloud trigger) | `.bkit/templates/.github/workflows/bkit-cloud.yml` (both jobs) + `.bkit/scripts/bkit-counter-bus-config.sh` | Large (~100 lines ctx-step bash + YAML trigger/concurrency/env edits, duplicated across 2 jobs) |
| 2 | code (bkit-auto CI_DEV) | `.bkit/workflows/bkit-auto.md` Step 1 + Step 11 + Gate 1 | Moderate (mode discrimination + 5 step gates + comment gating) |
| 3 | verify-only | `.bkit/workflows/bkit-debug.md` (READ ONLY, zero diff) | None |
| 4 | code (ship suffix) | `.bkit/workflows/bkit-ship.md` lines 634-635 | Trivial (one `${AUTO_ROUTE_SUFFIX}` append) |
| 5 | docs | `.bkit/cloud.md` | Small (decision log + routing table) |
| 6 | docs | `docs/deployments.md` (CI/CD matrix row + precondition note) | Small |
| 7 | docs | `docs/security.md` | Small (trust-surface subsection) |
| 8 | mechanical | `.bkit/version`, `package.json`, `CHANGELOG.md`, `.claude/`, `.cursor/`, `.opencode/` | Mechanical (version bump + `pnpm bkit upgrade` mirror regen) |
| 9 | validation | all changed files | Verification gate (dry-runs + lint/typecheck) |
| 10 | docs | `docs/deployments.md` (distinct "Consumer-repo acceptance note" section) | Small |

**Total canonical file surfaces: 9** (one of which — `docs/deployments.md` — is touched by Tasks 6 and 10 on distinct, non-overlapping sections). File surfaces are cleanly separated: no two code-change tasks edit the same file. A single build agent can hold all 9 files in context without saturation.

### 2. Coupling structure — linear, not parallel

The dependency graph is a chain, not a fork:

```
Task 1 ──> Task 2 ──┐
Task 4 ─────────────┤
Tasks 3,5,6,7,10 ───┴──> Task 8 ──> Task 9
```

- **Task 2 depends on Task 1** (CI_DEV mode is dead code until the ctx step dispatches a non-numeric ARG — explicitly declared).
- **Task 8 depends on Tasks 1-7** (mirror regen must run after all canonical `.bkit/` edits).
- **Task 9 depends on Tasks 1-8** (whole-build validation).

There are **no independent parallel workstreams**. Tasks 3, 5, 6, 7, 10 are independent of each other and of the code tasks, but they are small documentation edits that a single agent handles faster inline than a partitioned agent handles via handoff overhead. Partitioning would not unlock parallelism — it would only insert coordination cost.

### 3. Conceptual unity — one feature, not a bundle

The plan delivers **one coherent feature**: widen the `workflow_run` trigger to post-merge `dev` CI and route failures autonomously to `/bkit-debug` with a cross-session loop bound. The three code-change tasks (1, 2, 4) are **jointly required** for the feature to function end-to-end:

- **Task 1** (ctx step) dispatches `/bkit-debug {FID}` on `dev` CI failure — but only if the gate matches.
- **Task 4** (ship suffix) threads `bkit [auto route]` onto the squash-merge subject — without it, the gate never matches on `dev` and Task 1's dev branch is unreachable.
- **Task 2** (CI_DEV mode) makes `bkit-auto` accept the non-numeric FID ARG that Task 1's ctx step emits — without it, the dispatched `/bkit-debug` invocation fails at `bkit-auto` Step 1.5.

Splitting these into separate sub-plans would produce **non-functional partials**: a sub-plan containing only Task 1 deploys a dev trigger that never fires (no marker on the squash subject); a sub-plan containing only Task 4 threads a marker that nothing reads on `dev`; a sub-plan containing only Task 2 adds a mode that nothing dispatches. The feature has a single integration boundary (the end-to-end `dev CI fail -> workflow_run -> ctx step -> bkit-auto CI_DEV -> bkit-debug -> fix -> dev CI` loop) and must be validated as a whole at Task 9. Partitioning fractures the integration test.

### 4. Total change size / risk

- **Code:** ~130 lines of net new bash/YAML across 3 files (Task 1 ~100, Task 2 ~25, Task 4 ~1). This is well within a single build session's capacity.
- **Docs:** 4 documentation files (cloud.md, deployments.md x2 sections, security.md) — additive, low-risk.
- **Risk concentration:** Task 1's ctx step is the riskiest surface (stale-run guard Option A, distinct-headSha loop cap, dual-job push-race tolerance, commit-scope FID regex). The plan mitigates this with a **specified dry-run harness** (Task 1f: yq extraction, env mocking, gh stubbing, GITHUB_OUTPUT assertion) reused by Task 2's sentinel and Task 9's regression dry-runs, plus a **12-row test matrix** (T1-T12) mapped per task. The risk is bounded by the verification scaffolding, not unbounded.
- **No cross-cutting refactors.** The plan explicitly preserves `feat/**` routing byte-for-byte and makes `bkit-debug.md` a zero-diff verify (Task 3). The blast radius is contained to the new `dev` branch.

### 5. Single-agent context coherence

A single build agent can hold this plan coherently because:

- **One mental model:** the dev-trigger routing table (success=no-op, failure=debug) plus the three dev-specific invariants (no open PR -> commit-scope FID; success is no-op not ship; cross-session loop needs MAX_DEV_DISPATCH_ATTEMPTS). These are restated consistently across Context, Acceptance Scenario, Architecture, and Tasks — the agent sees the same contract at every checkpoint.
- **Review checkpoints map to task boundaries:** Task 1 (ctx step) -> Task 2 (CI_DEV) -> Task 4 (suffix) form the code core, reviewable as one unit; Tasks 5-7, 10 are independent docs; Task 8 (mirror) is a mechanical gate; Task 9 is the whole-build validation gate. The existing `/bkit-build` cycle's checkpoint cadence aligns with these boundaries without needing a partition.
- **No context-switch penalty:** every task references the same FID-recovery / loop-cap / stale-guard invariants. A partitioned execution would require re-establishing this context in each sub-agent, increasing the hallucination surface the plan's `[x]`/`[ ]` checkbox protocol is designed to suppress.

## Conclusion

The plan is a single coherent feature with linear (non-parallel) dependencies, cleanly separated file surfaces (~9 canonical files, no two code tasks editing the same file), moderate total change size (~130 lines code + 4 docs files), and risk concentrated in one well-harnessed task. Partitioning would fracture the end-to-end integration boundary without unlocking parallelism, producing non-functional partials and duplicate context-establishment overhead. **One `/bkit-build` session can execute this plan coherently with its existing review checkpoints.**
