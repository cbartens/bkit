Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Plan Scope Check

Audited file: `docs/plans/logs/bar-167-drop-envelope-hybrid/plan-v2-reviewed.md`.

Audit performed task-by-task in the **Agent Execution Runbook** section against three axes:
- **Scope:** explicit files / symbols touched.
- **Success criteria:** testable definition of "done" for that specific task.
- **Verification:** concrete command / inspection / test that confirms it.

## CRITICAL

### Task 0a — Cursor v1 spike re-run (Phase 1 pre-implementation)

- **Scope:** weak. "Open a fresh Cursor build, install a sandbox repo" — no path is specified for the sandbox repo, no template path under audit named, no version of Cursor pinned.
- **Verification:** "confirm `[bkit] session started` echoes in Cursor log" — Cursor log path not given; no fallback if the spike fails (does the plan abort? Loop back to "Markers everywhere"?). Pre-Flight Gate 1 lists "Cursor v1 spike confirmed" as required, so an unrecoverable spike failure must have a defined branch.
- **Action required:** add explicit Cursor build version, sandbox repo path under `tmp/`, log file path, and abort-branch text ("If spike fails: STOP, file Linear blocker, revert to flat-array template").

### Task 9 — Upgrade integration tests (fixture realism contradiction)

- **Scope conflict:** Task 9 says: _"Use the existing `tests/fixtures/heavy-customised-consumer/` for the v0.5.x→v0.8.x leg (replays the existing migrator BEFORE deletion is reflected at runtime — note the test runs against a fresh checkout's pre-deletion state of the helper, OR — preferred — bake the v0.8.x post-state into a static fixture as part of Task 0c)."_ But Task 7 deletes `migrateTier1JsonToTier2` outright, and Success Criterion #4 + Task 0c already commit to the **static-fixture approach** (`tests/fixtures/heavy-customised-consumer-v1-envelope/`). The "OR" branch in Task 9 is dead and contradicts Task 7.
- **Action required:** strike the "replays the existing migrator BEFORE deletion is reflected at runtime" clause; the only valid path is the static-fixture approach committed in Task 0c. Leaving the alternative in invites a failed test path where v0.5.x→v0.8.x replay is attempted after the helper is gone.

### Task 4b — `bkit uninstall` strip-merge verification (verification under-specified)

- **Scope:** "Inspect `bkit-uninstall.ts:156–165`. Confirm `case 2` strip-merges … rewrite if it was envelope-aware."
- **Success criteria:** ambiguous — "rewrite if it was envelope-aware" leaves the branch implicit. Either it is envelope-aware (rewrite required) or it is not (no change). The plan does not state which the inspection is expected to find, nor does it identify the exact symbol that performs the strip-merge today (e.g. `stripTier2Json`?). No symbol named.
- **Verification:** test name `"bkit uninstall"` is too broad — multiple integration tests likely match. Also the test row in the matrix is `bkit uninstall --claude on a v2.0.0 consumer file strips template scope but retains consumer-added keys` — the `--cursor` counterpart is NOT in the matrix despite the manifest reclassification (Task 4a) flipping both files to tier 2.
- **Action required:** (i) name the strip-merge symbol explicitly; (ii) add a `--cursor` row to the matrix and a corresponding test in this task; (iii) tighten the verification grep to a unique test title.

### Task 6 — Preflight advisories + drift detection (verification weak)

- "Manual fixture check confirms each advisory/blocker fires under expected conditions" — manual fixture is not a test artifact. The matrix has integration test rows for all three advisories/blockers (`legacy-bkit-envelope-detected`, `tier2-json-drift`, `pre-envelope-bkit-version-detected`), which Task 10 covers. Task 6's verification should refer to those tests by name, not "manual fixture check".
- **Action required:** drop the manual-fixture verification or list it as an additional smoke step; the green test under Task 10 is the authoritative criterion for Task 6's success.

### Test-matrix ↔ runbook 1:1 mapping — 1 missing pair

- Matrix row: `bkit uninstall --claude on a v2.0.0 consumer file strips template scope but retains consumer-added keys` → Task 4b (covered).
- **No matrix row for `--cursor` uninstall**, despite manifest tier flip applying equally to `.cursor/hooks.json`. Task 4a (`Reclassify manifest tier integers`) is bidirectional but Task 4b's verification is not.
- **No runbook task for** the matrix row `Cursor v1 keyed-object schema spike: parsed template loads cleanly under both legacy and v1 Cursor schema validators` — the matrix says this is a Vitest unit test in `bkit-tiers.test.ts (new cursor-v1-schema.test.ts block)`, but no runbook task adds that test block. Task 8 says "Apply the test changes in **Tests** section above" — and the Tests section's bullet `ADD test block: Cursor v1 keyed-object schema sanity (parse template; assert shape)` is included, so Task 8 implicitly covers it. **However**, Task 0a (the spike re-run) is the runtime/manual confirmation; the unit-test row is the static schema-shape check. The two are conflated. Add an explicit task or clarify Task 8 covers this row.
- **Action required:** add `--cursor` matrix row + corresponding Task 4b sub-step; rename Task 8 verification to enumerate the cursor-v1-schema block by name.

### Task 7 — Net LOC reduction verification scope

- Verification: `git diff --stat dev..HEAD -- '.agents/scripts/' '.agents/templates/'` ≥ 200 LOC deleted.
- Success Criterion #5 in Acceptance lists ≥ 200 LOC across `.agents/scripts/` and `.agents/templates/` — matches.
- Gate 2 verification (line 495) repeats: `git diff --stat dev..HEAD -- '.agents/scripts/' '.agents/templates/'`.
- **However**, Verification Plan Manual Step 3 (line 537) says: `git diff --stat dev..HEAD -- '.agents/scripts/'` (templates omitted). **Inconsistency** — Manual Step 3 will under-count vs Task 7 / Gate 2.
- **Action required:** align Manual Step 3 with Task 7 / Gate 2 (`'.agents/scripts/' '.agents/templates/'`).

### Task 14a — Version bump (verification implicit)

- Scope: bump `package.json` to 2.0.0; bump `.bkit-version.pinnedVersion`. The plan notes the bkit install regen mechanism handles `.bkit-version` automatically.
- **However**, ordering is not enforced: if Task 14a executes before Task 5 (`pnpm bkit install` against the worktree), the regen will pick up the v1.1.1 `package.json`. The plan does not state Task 14a sequencing relative to Task 5.
- **Action required:** add explicit prereq: "Task 14a runs AFTER Task 5 has executed `pnpm bkit install` so `.bkit-version` regen sees the v2.0.0 package version."

## OPTIONAL

### Task 1 (`deepContains`) — verification depth

- Verification grep `-t deepContains` will catch all 7 rows but does not assert the count. Consider adding `pnpm vitest run bkit-tiers.test.ts -t deepContains --reporter=verbose | grep -c "✓"` ≥ 7 as a floor.

### Task 1b — getPkgRoot extraction

- Verification "no circular import warnings" relies on tsc — circular type imports do not always warn. Consider adding `madge --circular .agents/scripts/` as a hard check.

### Task 5 — Templates rewrite

- Verification: `pnpm bkit install` then `pnpm bkit check` → `Done. 0 write(s).` Good.
- Edge case missing: a stale `.bkit-version.canonicalHashes` for the two Tier-2 files (recorded under v1.1.1 envelope shape) will mismatch the new schema-clean shape. Plan does not state explicitly that `bkit install` re-records `canonicalHashes` for these files (it does, but the plan should make it explicit so a reviewer doesn't flag it as drift on first install).

### Task 10 — Modules integration test

- Four scenarios listed (`legacy-bkit-envelope-detected`, `tier2-json-drift`, `pre-envelope-bkit-version-detected`, uninstall consumer-key survival). All matrix rows mapped except the `--cursor` uninstall (CRITICAL above).
- Verification "green" — consider naming each `it(...)` block explicitly so a future regression flagging a single row is unambiguous.

### Phase boundary clarity

- Phase 2 / Phase 3 sections are correctly DEFERRED and labelled as such. **No Phase 2/3 task has snuck into Phase 1's runbook** — Tasks 1–16 are all Phase 1.
- Phase 2 / Phase 3 sections (lines 541–565) are scope-only; they do NOT contain runbook tasks pretending to be Phase 1.

### Documentation Updates table

- DE-7 / DE-8 / KN-8 supersession edits are listed as line-item tasks (11, 12). No verification step beyond "appended" — consider adding `grep "superseded by DE-16" docs/decisions.md` as the assertion.

## OUT OF SCOPE

None — the plan correctly defers Phase 2 marker extension, Phase 3 terminology cleanup, `--prune`, decorative-echoes question, and `ci.yml` marker fixture to `docs/pending.md` per the Out of Scope section.

## Summary

- Every Phase 1 runbook task (0a, 0b, 0c, 1, 1b, 2, 3, 4, 4a, 4b, 5, 6, 7, 8, 9, 10, 10a, 11, 12, 13, 14, 14a, 15, 16) has a stated scope, success criterion, and verification, but **six tasks (0a, 4b, 6, 7, 9, 14a) have under-specified verification or scope-conflict details** that need tightening.
- Test-matrix ↔ runbook mapping has **1 gap** (no `--cursor` uninstall row) and **1 conflation** (cursor-v1-schema spike vs unit test).
- Net-LOC verification scope is inconsistent between Task 7 / Gate 2 and Manual Step 3.
- Supersession Inventory is complete (10 rows, all DELETE / RETAIN-WITH-REASON, mirrored in Architecture & Component Changes deletions block).
- Template-mandated sections all present and populated.

Verdict: **CONCERNS** — six CRITICAL findings to address; none break the matrix↔runbook mapping unrecoverably, none break template structure.

Failures: 0 (no FAIL-level findings; CRITICAL findings are recoverable via plan-update).
