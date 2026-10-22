Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Checked: template sections all present and populated; every runbook task (T1-T19) has `Done when` and `Test first` (each `n/a` carries a reason: T6, T10, T16, T17, T18, T19); matrix rows map to tasks (rows 1-5 T1/T2, 6 T3, 7-10 T4, 11 T5, 12 T7, 13-15 T8, 16 T9, 17-19 T11, 20-21 T12, 22 T13, 23-24 T14, 25 T15, 26 T19). No orphan tasks that change behaviour without a row. Supersession rows each have a removal task. Out of Scope rows are mirrored in `docs/deferrals.jsonl` (4 `650-` rows present). The `Narrative` `MISSING` line is the template's designed Gate 1 human blocker, not a plan defect.

## CRITICAL

1. **Shared-checkout record has no home in Reuse Inventory or Architecture (new capability, risk of 3 copies).** Reading, appending to and applying the record (own-path set = status minus recorded paths, ledger-row filter, temp-index fallback, SHA append) is needed by `writeStepRow` (`steps.ts`), `commitBookkeeping` (`ledgers.ts`), `closeWorkflow` (`workflows.ts`), `pushBranch` (`branches.ts`), `runs.ts` re-trigger, `locks.ts` and `worktrees.ts`. T11 says `closeWorkflow` applies "the same rule" and Architecture repeats the rule per file, but no row names where the record I/O and own-set logic live, and no `[MODIFY]`/`[NEW]` entry owns it. Fix: add a `Reuse Inventory` row "Shared-checkout record read/append + own-path set" naming one host (e.g. extend `ledgers.ts` `dirtyTracked` / `commitBookkeeping`, which `steps.ts` and `workflows.ts` already import) with EXTEND, or a `NEW` row with an allowed reason; and have `writeStepRow` and `closeWorkflow` call it instead of re-implementing it.

2. **Matrix row 17 and Edge Case behaviours have no `Test first` entry (T11, T12).** Matrix row 17 lists "concurrent record refused", and Done when T11 lists `EXIT_SHARED_BUSY`, stale-record replacement and resume-reuse, but T11 `Test first` has no test for any of them (only the rewrite-on-new-run test). T11 also has no test for `commitBookkeeping` refusing a changed recorded path (`EXIT_FOREIGN_PATH` in `ledgers.ts`; only `writeStepRow` refusal is tested). T12 Done when promises replay conflict (non-zero naming paths, throwaway checkout removed), `EXIT_PUSH_FAILED` on server refusal, skip-CI on the replayed HEAD, `abort` mode, and `async` callers awaiting, but `Test first` covers only plain/replay/feature-mode/sha/log-line. Fix: add to T11 `Test first`: `worktrees.test.ts` `setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock`; `worktrees.test.ts` `a stale record without a lock is replaced`; `worktrees.test.ts` `a resume of the same FID reuses the record`; `ledgers.test.ts` `commitBookkeeping refuses when a recorded path changed`. Add to T12 `Test first`: `branches.test.ts` `replay conflict exits non-zero naming the paths and removes the throwaway checkout`; `branches.test.ts` `a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal`; `branches.test.ts` `skip-ci HEAD on the replay is refused`; `branches.test.ts` `abort mode on dev with a record pushes only recorded SHAs`.

## OPTIONAL

- **Marker-block rule (step 13), literal reading:** T10 edits `.bkit/core/AGENTS.md` L27-49 (inside its `bkit:start`..`bkit:end`, L3-88) and T16 edits `.bkit/core/.bkit/lite.md` L25 (inside L1-71). These are the shipped source of the managed blocks, so editing them is how the doctrine ships, and the repo-only-below-`bkit:end` rule targets repo-specific logic. Confirm that reading; if not accepted, the router/lite change cannot be scoped here.
- **T5 `Test first`** pins only `build` in place on `main`; Done when also covers `design` / `plan` in place on `main` (Matrix row 11). Add one test per workflow or a table-driven test.
- **Edge Cases with no test:** `closePr` / `landPr` unreadable base fails closed (only `prs merge` unknown-base and `landPr` main-base are in `Test first`); "debug run aborted after commits" (next run treats them as foreign); "CI-Dispatch re-trigger on `dev` without a record" unchanged. Consider one row each.
- **Success Criterion 1 (lands the fix on `dev`) is verified live only by deferral `650-debug-dev-ci-live-round-trip`** (Manual Step 6, advisory). Justified as hard-blocked with Unit/Integration pins of the SHA hand-off, so not Blocking, but the green gate does not prove the CI wait against real Actions.
- **T17 depends on an orchestrator action:** `docs/decisions.jsonl` currently holds 3 `650-` rows; the correction row for `650-debug-on-dev-in-place-own-files-own-commits` is not yet appended. T17 STOPs if absent. Make sure it is appended before build starts.
- **`NEW` test file reason (a):** "reuses `close-squash.integration.test.ts` fixture helpers, no new helper module" is unverified; if those helpers are file-local, the new file duplicates them or they must be exported (a `[MODIFY]` of that file). Check before build.

## OUT OF SCOPE

- Guard the `branches land` MCP fallback merge base (already in `Suggested Scope Expansion`, recommended fold-in; `bkit-ship.md` does not call `branches land`, so not required by the "no ship path" criterion). Needs a human decision.
- `steps gate --placeholder` false positive on derived issue dumps (`steps-placeholder-gate-false-positive-on-derived-issue-dump`).
- `bkit fids resume` lookup for reworded issue-less prompts (Q7 deferral).
