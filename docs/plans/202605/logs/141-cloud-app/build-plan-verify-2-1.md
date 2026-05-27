Verdict: FAIL
Failures: 3

<!-- verdict:end -->

# Plan Verification

## Scope

Single (sub-plan 2 of 3: `141-cloud-app-plan-2.md`).

## Sub-Plans Verified

None (Single scope).

## Integration Gaps

None (Single scope).

## Previously Attempted

None (first verification attempt for sub-plan 2).

## Notes

Verified against the diff + files directly (executor log not trusted). Tasks T2.1–T2.6 are FULLY satisfied:

- **T2.1** — #184 shared HEAD-Subject Assertion lives in `.agents/workflows.md` as named § "HEAD-Subject Assertion (shared, single source — #184)": deterministic `git log -1 --pretty=%s` / `gh pr view --json title` + fixed `grep -iE`, exit-code verdict, DENY-LIST (loud tokens `bkit [auto route]` / `bkit [verbose ci]` / `bkit [force build]` pass automatically), hard-fail loud naming the offending subject/title + fix. Reconcile (AC4 no-drift) done: `.agents/rules.md:58,63` (+ template mirror) and `docs/deployments.md` § "CI trigger on final workflow push" point at it; deployments.md registers `bkit [auto route]` and fixes both pre-existing drift directions (worktree-setup added to skip-tag list; close-workflow description corrected). Matches the locked shape in plan-1 § "#184 … RESOLVED".
- **T2.2** — `bkit-build.md:260` worktree-setup and `:915` create-pr both now carry `bkit [skip ci]`.
- **T2.3** — `bkit:auto` re-read inserted BEFORE the close-workflow commit (Step 18 step 2), AUTO_ROUTE_SUFFIX appended conditionally to `:947`; the marked commit is the CI-firing HEAD; Gate 18 invokes the assertion (HEAD clause). The stale 963-970 re-read remains as the orchestrator-side kill switch (not the marker source) — R2-1 ordering fix correct.
- **T2.4** — mode-dependent placement correct: PR-mode marker on close-workflow `:806` (PR_MODE_AUTO_SUFFIX), local-mode on create-pr `:844` (LOCAL_MODE_AUTO_SUFFIX); re-read before the commit (Step 12 step 3); coexists with `bkit [verbose ci]`; Gate 12 references the assertion. R2-2 ordering fix correct.
- **T2.5** — ship Gate 5 invokes the PR-title clause before merge; inline rule replaced.
- **T2.6** — orchestrator Steps 2 (stale guard) + 3 (opt-in gate) deleted, dispatch retained (renumbered Step 2); routing/status/comments kept. PR-`bkit:auto`-label removal DELETED from both `kill-switch-check` snippets (github + linear) and the `pr-body-metadata` fail-closed text. `grep -n update_pull_request .agents/trackers.md` → none (Done-when satisfied). DECISION-E (AMENDED) honoured.

T2.7 is PARTIALLY satisfied: (a) negative-skip free-tier `if: contains(..head_commit.message, 'bkit [auto route]')`, in-job `gh issue view {ISSUE} --json labels` re-check, SHARED-DERIV step (PR-body `bkit:fid`/`bkit:issue` marker primary, `feat/{FID}` branch fallback, fail-safe no-op), (d) `bkit:start`/`bkit:end` markers (`auto-route-gate` + `shared-deriv`), and (e) canonical↔template byte-match (`diff` → IDENTICAL) all hold. But (b) the positive marker->HEAD->fires-to-dispatch render assertion and (c) the string-equality single-sourcing assertion of the kill-switch `{ISSUE}` are ABSENT — see GAP-3.

T3.1 is NOT satisfied — see GAP-1 (the `concurrency.group` was left unchanged; dispatch and CI surfaces still resolve to DIFFERENT groups for the same FID, so the D3 race is not eliminated) and GAP-2 (the required single-sourcing render test is absent). This is the blocking defect: T3.1's primary behavioural success criterion is unmet despite the box being checked `[x]` by the executor.

ASCII operators only confirmed across `.agents/workflows/*.md` (no Unicode `≠/≥/≤`). Cloud module integration tests pass (84 passed, 2 skipped). T2.7 + T3.1 + Gate 2 checkboxes reverted to `[ ]` in the plan.

Remediation (gap-remediate scope): reconcile the concurrency expression so the CI path derives `bkit-cloud-<FID>` from `head_branch` inside the YAML expression itself (string transform, since FID = issue number and branch = `feat/{FID}-...`), making both surfaces yield `bkit-cloud-<FID>`; then add the render/grep assertions for T2.7(b)/(c) + T3.1 single-sourcing in `bkit-modules.integration.test.ts`.

## Identified Gaps Log

GAP-1 (T3.1, blocking the task's core intent): `concurrency.group` is UNCHANGED — still `bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}` (.github/workflows/bkit-cloud.yml:69 + template:69). Dispatch resolves to `bkit-cloud-<issue>` (e.g. `bkit-cloud-141`) while the CI-completion path resolves to `bkit-cloud-feat/<branch>` (e.g. `bkit-cloud-feat/141-cloud-app`). For the SAME FID these are DIFFERENT groups, so `cancel-in-progress` cannot serialise a dispatched build against the auto-ship it triggers — the D3 race the task exists to eliminate is NOT eliminated. T3.1 Done-when requires "dispatched and CI-completion runs for the same FID resolve to the same `concurrency.group` (`bkit-cloud-<FID>`)" and "both yield `bkit-cloud-<FID>`" (plan line 134) — NOT satisfied. Executor log openly states a GHA limitation (concurrency evaluated before steps), but the criterion was not met and no alternative reconciliation (e.g. deriving FID from `head_branch` inside the concurrency expression itself) was applied.
GAP-2 (T3.1 Done-when, testable): the required render test proving single-sourcing "by string-equality of the FID expression appearing in `concurrency.group` against the SHARED-DERIV step output" does not exist and is unattainable as built (the concurrency expression does not reference the SHARED-DERIV step output at all). No test in .agents/scripts/\*.test.ts asserts this.
GAP-3 (T2.7 Done-when (b)+(c), testable): no POSITIVE render/grep assertion exists for the marker->HEAD->job-fires chain ((b): when `bkit [auto route]` is in `workflow_run.head_commit` AND `bkit:auto` present, the gate reaches the dispatch step) and no string-equality assertion proves the kill-switch `{ISSUE}` is single-sourced from the SHARED-DERIV step ((c)). The cloud tests in bkit-modules.integration.test.ts cover only child-1 render concerns (id-token, tracker, advisory) — none cover the two-tier gate logic. Plan's own Testing Strategy (line 198) and T2.7/T3.1 Done-when call for these render/grep assertions ("validate via the real render path, never string-presence-only"); they are absent.
