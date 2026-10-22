Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

No design doc (plan built from issue #650 plan comment + "Open questions: answered"); design-coverage checked against Q1–Q7 as the binding design input. Template structure (`docs/templates/bkit-plan.md` section order, `Done when` + `Test first` on every task T1–T19) intact. No task cycles.

## CRITICAL

1. **`workflows close` commit never honours the shared-checkout record (missing task; Q1.1 design dependency).** Debug Step 11 runs `workflows close … --message="chore({FID}): close-workflow"` (`.bkit/core/workflows/bkit-debug.md` L624) → `closeWorkflow` stages with `runGit(where.tree, ["add", "-A"])` (`.bkit/core/engine/commands/workflow/workflows.ts` L991). Q1.1 names `workflows close` explicitly as a run commit that must leave recorded paths out. Plan blast radius cites `workflows.ts:872` (the `recordStep` `writeStepRow` call, `commit: "none"`) and `528` / `1084` (`commitBookkeeping`), not L991; T11 changes only `writeStepRow` + `commitBookkeeping`. Result: Concrete Example step 6 close commit sweeps `notes.md` onto `dev`. Fix: T11 extends the record-aware own-path commit to `closeWorkflow`'s `--message` commit (`[MODIFY] workflows.ts` entry); `Done when` + `Test first` row (`workflows.test.ts` or `shared-checkout.integration.test.ts` `close commit never includes a recorded path`).
2. **Record removed before its consumers run (producer destroys artefact pre-consumption).** Architecture (worktrees.ts record bullet) and T11 `Done when` remove the record "at `workflows close`" (`workflows.ts` L982–996). Step 11 order is `workflows close` (L624) → `locks release` (L625) → `branches push` (L626) → dispatch; T12 `pushBranch` and T14 `{DIFF_BASE}` both read the record afterwards, and T12 says "No record → unchanged" → plain `git push origin dev` of local `dev` wholesale, leaking `abc1234`. Fix: remove the record only after the own-commit push succeeds (e.g. `pushBranch` mode `dev` on success) or at a step after dispatch; T11 / T12 `Done when` state the lifetime; integration test sequences setup → `steps finish` → `workflows close` → `branches push --mode=dev`.
3. **Debug Steps 9 and 10 push `dev` wholesale before Step 11 (unchanged consumer of the old push path).** `bkit-debug.md` L552 (Step 9) and L576 (Step 10) run `branches push --mode=feature`; on a shared branch `pushBranch` runs plain `git push origin dev` (`branches.ts` L602, L617–624). T12 scopes the own-commit push to "Mode `dev` with a record"; T14 rewrites Step 11 only. Foreign local commits reach `origin/dev` at Step 9, violating Success Criterion 1 / Concrete Example outcome. Fix: T12 makes `pushBranch` honour the record for every mode on a shared branch (or T14 also rewrites Steps 9 / 10 on `dev` to `--mode=dev` / defers the push to Step 11); add a `shared-checkout.integration.test.ts` row pushing via `--mode=feature` on `dev`.
4. **CI-Dispatch re-trigger is a third `dev` push path no task routes through the record.** `ciDispatchGate`'s re-trigger uses `pushCurrentBranch` (`.bkit/core/engine/commands/workflow/runs.ts` L309–317) → plain `git push origin dev` on a shared branch. After a T12 replay, local `dev` has diverged from `origin/dev` (push rejected, `EXIT_RETRIGGER_FAILED` 6) or, level case, pushes foreign commits made since. Plan Assumption "every push through `pushBranch` / `pushToDev`" is false. Fix: T13 depends on T12 — re-trigger on a shared branch with a record goes through the own-commit push (or is disabled with a defined exit on `dev`); `runs.test.ts` row.
5. **`{DIFF_BASE}` = record `startSha` has no producing interface.** T14 consumes the start SHA in prose, but the record lives at `git rev-parse --git-path bkit/shared-checkout/{FID}.json` and T11 `Done when` exposes nothing; `worktrees setup` output (`worktrees.ts` L567–582) has `baseSha` = `merge-base(baseRef, HEAD)`, which on an ahead local `dev` is `origin/dev`, not the start SHA. Fix: T11 `Done when` adds `startSha` (and `aheadAtStart`) to the `worktrees setup` JSON output for the in-place shared case; T14 holds it from Step 2 sub-step 1 (`bkit-debug.md` L252).

## OPTIONAL

- **`pushBranch` sync → async.** `pushBranch` (`branches.ts` L555) is synchronous; `pushToDev` (`land.ts` L112) is `async`. T12 forces an async `pushBranch` → callers `branches.ts:648` (`pushVerb`), `branches.ts:1067`, `workflows.ts:604` must await. Name the signature change in T12 blast radius.
- **`land.ts` change may be unnecessary.** `pushToDev` already takes a `build(dir, attempt)` callback; a `startSha..HEAD` cherry-pick fits inside it. T12 `Test first` `pushToDev replays a commit range onto origin/dev` "fails on the missing range input" may not be red-able. Also `pushToDev` logs `it lands bookkeeping only` (L119) — false for a code replay; and its `refused` outcome (branch protection on `dev`) needs a defined debug route.
- **Abort removal cites the wrong branch.** Architecture removes the record at abort via `workflows.ts` L600–604 — that is the feature-branch path; on `dev` `handoverVerb` takes `landFailedRecord` (L593–599). Record survives a debug Failure Path on `dev`; same-FID re-run then "keeps the original record". State intended behaviour. Also check `landFailedRecord`'s hand-back (resets tracked ledgers) never touches recorded foreign paths.
- **Replayed SHAs vs local SHAs.** After replay, `{CLOSE_PARENT}` (`bkit-debug.md` L628) is a local SHA not on `origin/dev`; it feeds `steps done --parent-sha` and `prs transport-row --sha --scan --cross-check=gh` (L631–632). T14 should take T12's pushed `sha` for these.
- **T14 grep scope.** `Done when` `grep -n "git add -A\|git push origin" bkit-debug.md` empty also hits L649 (Step 11.6 create-pr commit, `TRIGGER_PR` = 1, feature branches only). Scope the grep to the `dev` path or name the replacement command.
- **Workflow index same-change.** T8 / T9 (Wave 2) edit workflows; `.bkit/core/.bkit/workflows.md` updates sit in T16 (Wave 4) while waves are reviewed/committed separately. Repo rule requires the index in the same change → move the Step 1 / § Best-effort rows into Wave 2.
- **Matrix tag mismatch.** Derived Test Matrix static row tags T18; static gates run in T19.
- **Stale ledger note.** Out of Scope and Ledger Rows say "no `650-*` key"; rows now present (`docs/deferrals.jsonl` L261–263, `docs/decisions.jsonl` L666–668). T17 producer satisfied; guard against a double append.
- **T5 debug-on-`main` already refused** (`worktrees.ts` L501 `refused = workflow === "debug" ? "main" : DEV`); its `Test first` red only for design / plan / build.

## OUT OF SCOPE

- #639 follow-up items still open (stale `RUNTIME_DEVPUSHES` comment `runtime.ts:110`; `docs/migrations.md` note for removed flags / verb) — unrelated to issue-less runs.
- `branches land` MCP-fallback base assert — already listed in `Suggested Scope Expansion`.
