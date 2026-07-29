Verdict: CONCERNS
Failures: 3
<!-- verdict:end -->

# Plan Scope Check 1 — `plan-v2-reviewed.md`

Scope lens: **every plan task has explicit scope, criteria, and verification — and no task is missing these.** Each of the 10 tasks in the Agent Execution Runbook was checked against three elements: (1) Scope — a clearly bounded file/section surface; (2) Criteria — an objectively checkable "Done when"; (3) Verification — a concrete step (command/check/observable) that proves the criterion.

All 10 tasks possess all three elements. 3 tasks have identifiable weaknesses (weak verification or ambiguous scope) that are non-blocking but could cause builder rework or reviewer dispute. Flagged below.

## Per-Task Assessment

| Task                                       | Scope                                                                                                          | Criteria                                                                                                                                                                      | Verification                                                                                                                                                       | Finding             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **1 — Cloud trigger surface**              | ✅ Explicit: `bkit-cloud.yml` (both jobs) + `bkit-counter-bus-config.sh`; sub-steps 1a–1f name exact edits.    | ✅ 5 objective "Done when" bullets (yq contains `dev`, cancel-in-progress expression, both env blocks have COMMIT_MSG/HEAD_SHA, grep + source prints 3, 3 dry-run scenarios). | ✅ yq/grep/source commands + dry-run harness (Task 1f gives extraction command, env mocking, gh stubbing, GITHUB_OUTPUT assertions).                               | None.               |
| **2 — bkit-auto CI_DEV mode**              | ✅ Explicit file + line ranges (85–118, 126–134, 141).                                                         | ⚠️ Mostly objective, but one criterion is negatively-phrased without an observation method.                                                                                   | ⚠️ Dry-run described, but the "does NOT call `gh pr view`" assertion has no specified observation mechanism.                                                       | **F1** — see below. |
| **3 — Verify bkit-debug (verify-only)**    | ✅ Explicit: `bkit-debug.md` READ ONLY (lines 318–327, 179–181).                                               | ✅ "no diff to `bkit-debug.md`" + read confirms both behaviours; check NO `CI_DEV` references added.                                                                          | ⚠️ Verification is "Read confirms" — softer than the criterion implies. Criterion says "no diff" but no diff command is listed in verification.                    | **F2** — see below. |
| **4 — bkit-ship AUTO_ROUTE_SUFFIX**        | ✅ Explicit: `bkit-ship.md` Step 5, lines 634–635.                                                             | ✅ Read shows `${AUTO_ROUTE_SUFFIX}` in `--subject`; bash unit: `LABELS=bkit:auto` -> subject ends with `bkit [auto route]`; `LABELS=""` -> unchanged.                        | ✅ Read + bash unit. (The bash unit implicitly requires extracting the Step 5 subject line, which is feasible.)                                                    | None.               |
| **5 — cloud.md decision log**              | ✅ Explicit: `.bkit/cloud.md`.                                                                                 | ✅ "Done when" lists the decision-log entry with routing table and named decisions (Option A, stale-guard, loop-bound, concurrency, FID recovery).                            | ✅ Read against the enumerated item list. Test ref N/A (docs) — acceptable.                                                                                        | None.               |
| **6 — deployments.md**                     | ✅ Explicit: `docs/deployments.md`.                                                                            | ✅ CI/CD matrix `dev` row + auto-route contract + docs-only-diff precondition.                                                                                                | ✅ Read. Test ref N/A.                                                                                                                                             | None.               |
| **7 — security.md**                        | ✅ Explicit: `docs/security.md` § CI Auto-Route Trust.                                                         | ✅ Lists trust surface, env-safe, no PR body, kill switch, loop cap.                                                                                                          | ✅ Read. Test ref N/A.                                                                                                                                             | None.               |
| **8 — Mirror regen + version + CHANGELOG** | ✅ Explicit file list (`.bkit/version`, `package.json`, `CHANGELOG.md`, `.claude/`, `.cursor/`, `.opencode/`). | ✅ jq `.version` = 4.11.0; grep `pinnedVersion` = 4.11.0; CHANGELOG has entry; `pnpm bkit upgrade` no unexpected diff.                                                        | ✅ jq/grep/pnpm commands. ("No unexpected diff" is mildly subjective but bounded by the prior canonical edits.)                                                    | None.               |
| **9 — In-repo validation**                 | ✅ "all changed files" — appropriately broad for a validation task.                                            | ✅ "All dry-run assertions pass; lint/typecheck green."                                                                                                                       | ✅ Enumerated commands: yq parse, ctx-step bash dry-runs (3 scenarios), bkit-auto dry-run, bkit-ship read, counter-bus-config source, `pnpm turbo lint typecheck`. | None.               |
| **10 — Consumer-repo acceptance note**     | ⚠️ Scope names two candidate files joined by "or": `.bkit/cloud.md` **or** `docs/deployments.md`.              | ✅ Documents consumer-repo-only exercisable path + docs-only-diff precondition.                                                                                               | ✅ Read the chosen file. Test ref N/A.                                                                                                                             | **F3** — see below. |

## Findings

### F1 — Task 2: negative criterion lacks observation method (CONCERNS, non-blocking)

**Where:** Task 2 "Done when": "...and does NOT call `gh pr view`".

**Issue:** The criterion asserts a negative (no `gh pr view` call) but neither the criteria nor the verification section specifies how to OBSERVE the absence in the dry-run. Task 1f establishes a `gh`-stubbing harness precedent (`GH_HOST=invalid` for fail-safe paths, or a shell function returning canned JSON), but Task 2 does not reference that harness or specify a stub that would fail/record if `gh pr view` were invoked. A builder/reviewer cannot trivially prove a negative call without an instrumentation step.

**Impact:** A reviewer could dispute whether CI_DEV mode actually skips `gh pr view`, or a builder could ship the gate without a way to demonstrate it.

**Suggested fix (non-blocking):** In Task 2 verification, add: "Stub `gh pr view` to write to a sentinel file (e.g. `gh() { echo called >> /tmp/gh-calls; command gh "$@"; }`); assert the sentinel is empty after the `ARG=<FID>` dry-run." One line, reuses the Task 1f harness pattern.

### F2 — Task 3: criterion says "no diff" but verification is "read confirms" (CONCERNS, non-blocking)

**Where:** Task 3 "Done when": "no diff to `bkit-debug.md`". Verification sub-bullets: "Confirm ... (read)".

**Issue:** The criterion promises an objective diff check, but the verification steps are all "Read/Confirm" — no command that actually proves zero diff. For a verify-only task this is the single most important verification (the whole point is "no changes were made"), yet the strongest proof (`git diff --exit-code` or `git status --porcelain`) is absent.

**Impact:** A builder could inadvertently edit `bkit-debug.md` and the listed verification (read the lines) would still pass. The criterion and verification are misaligned on strength.

**Suggested fix (non-blocking):** Add to Task 3 verification: `git diff --exit-code -- .bkit/workflows/bkit-debug.md` (exit 0 = no diff); or `git status --porcelain .bkit/workflows/bkit-debug.md` asserts empty. Aligns verification strength with the "no diff" criterion.

### F3 — Task 10: scope is "file A OR file B" — ambiguous target (CONCERNS, non-blocking)

**Where:** Task 10 "Scope": "`.bkit/cloud.md` or `docs/deployments.md` acceptance section."

**Issue:** The scope names two candidate files joined by "or" with no discriminator. A builder must choose one; a reviewer checking the other finds nothing. This is the only task in the plan with a disjunctive file target — every other task names a single file/section. Tasks 5 and 6 already own `cloud.md` and `deployments.md` respectively, so Task 10's note could collide or duplicate with either, and the plan does not state which is canonical for the "acceptance note" content type.

**Impact:** Builder ambiguity on where to write; potential for the note to land in a file a reviewer doesn't check; possible duplication with Task 5/6 content.

**Suggested fix (non-blocking):** Pick one file. Recommendation: `docs/deployments.md` (Task 6 already adds the `dev` CI/CD matrix row there — the consumer-repo acceptance note + docs-only-diff precondition naturally co-locate with it; avoid splitting deployment-related docs across `cloud.md`). If kept in `cloud.md`, state that Task 10's note is distinct from Task 5's decision-log entry.

## Summary

- 10/10 tasks have Scope, Criteria, and Verification — no task is missing any element (no FAIL).
- 3/10 tasks have non-blocking weaknesses: F1 (negative criterion unobservable), F2 (criterion/verification strength mismatch), F3 (disjunctive scope target).
- Verdict `CONCERNS`: the plan is buildable as-written, but addressing F1–F3 reduces builder/reviewer friction and closes the three minor scope/verification gaps. None block execution.
