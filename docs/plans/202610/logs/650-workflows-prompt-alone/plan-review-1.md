Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

Inputs read: `plan-v1-draft.md` (L1–772), `plan-input-1.md`, `related-issues.md`, `related-deferrals.md` (truncated by source, 31 of 42 lines), `related-failures.md` (truncated by source, 3 of 35 lines), `docs/templates/bkit-plan.md`, `.agents/rules.md`, `.agents/docs.md`. No design doc (issue decision 5) → design-coverage checked against issue #650 body + plan comment + "Open questions: answered" (Q1–Q7 override). Template structure: every mandated section present, in order, populated.

## CRITICAL

1. **Acceptance Scenario `Narrative` is `⚠️ MISSING` → Gate 1 blocked.** Plan applies the template rule correctly (no design, no issue `Narrative`), but the section is still unfilled and the template blocks Gate 1 until a human fills it. Fix (human): adopt the quoted `### Outcome` text from #650 verbatim as the Narrative, or write one; then re-confirm. Related: deferral `442-plan-template-design-missing-fallback-amendment` (OPEN) is exactly this template conflict.

2. **"Own commits" and "own files" are not actually the run's own → drift from Q1.1 / Q1.2.** Source: "Commits only its own files" / "Pushes only its own commits … lands only its own commits." Plan defines own commits = `startSha..HEAD` (T12, Architecture `pushBranch`) and own files = `git status` now minus paths dirty at start (T11, `writeStepRow`). Both sweep in work by anyone else on the same checkout during the run. The plan accepts this as an Assumption ("a human committing on `dev` mid-run gets their commit pushed with the run's"), but `.agents/rules.md` § Commits says "ALWAYS assume other agents are editing the same working tree in parallel", so this is the expected case, not an edge — and the `EXIT_SHARED_BUSY` check sees only other bkit runs. Fix:
   - Commits: every run commit is made by the engine (`writeStepRow`, `commitBookkeeping`) → append each new commit SHA to the shared-checkout record; push / replay exactly that SHA list (plain push only when `origin/dev..HEAD` equals the list, else replay via `pushToDev`). Rewrite T12 `Done when` + the `shared-checkout.integration.test.ts` row to add a foreign commit made **mid-run** and assert it never reaches the remote.
   - Files: paths first dirtied mid-run by someone else are indistinguishable from debug's edits. Turn the silent behaviour into an `Open Question` with options (e.g. A — accept and document; B — restrict the own set to paths the run's remediate step reports; C — refuse when a path outside the record and outside `docs/plans/**/logs/{FID}/` changed without the run's subagent reporting it), recommendation and default.

3. **Unreconciled conflict with ACTIVE decision `failure-path-record-own-branch-dev-fallback` and the `pushToDev` contract.** `docs/decisions.jsonl:638` records that "code and bookkeeping reach dev together only through ship's merge; dev / main has no feature branch, so only bookkeeping lands there". `pushToDev` documents and logs the same contract (`.bkit/core/engine/commands/land.ts:107–119`: "git hooks skipped in the throwaway dev checkout — it lands bookkeeping only"). T12 routes debug's **code** commits through `pushToDev`. Q1 authorises this, so it is not drift, but the plan leaves the old record and code comments false. Fix:
   - Decision row `650-debug-on-dev-in-place-own-files-own-commits` → add `failure-path-record-own-branch-dev-fallback` to `references` and state that it narrows that row (debug fix commits may land on `dev` through `pushToDev`; Failure Path still lands bookkeeping only). The row is already appended → append a same-key correction row, never edit in place.
   - `land.ts` `[MODIFY]` + T12 `Done when`: update the `pushToDev` docstring and the "lands bookkeeping only" log line.
   - `Documentation Updates` `.bkit/core/.bkit/workflows.md`: name the throwaway-checkout / close-squash text that says only bookkeeping lands this way.

4. **Success Criterion 3 is only partly pinned by the Derived Test Matrix.** SC3: "no tracker calls tied to an issue (labels, comments, board, issue reads)". The T8 matrix row and its `Test first` pin only `issues labels --board` fences and Failure Path tracker writes. Nothing reds if any of these is left unguarded:
   - Step 1 sub-step 3 MCP issue reads (`mcp__github__issue_read`, `mcp__linear__get_issue`, `mcp__jira__getJiraIssue`, e.g. `bkit-debug.md:121–129`);
   - comment posts and the `issues comment` / `issues text` fences (named in T8 `Done when` but not in the test);
   - ship Step 10's tracker label re-read before merge (`bkit-ship.md:507`, "`{LABEL_FLAGS}` … empty when no tracker is wired"). T15 says this is "kept" and "`ship-invariants.test.ts` existing rows unchanged", so issue-less ship would call the tracker with an empty issue.

   Fix: add a `workflow-shape.test.ts` row and `Test first` asserting that every tracker MCP call and every `bkit issues *` fence in the five workflows sits behind the empty-`ISSUE_ID` guard. In T15, state that ship Step 10's re-read is skipped when `ISSUE_ID` is empty (`{LABEL_FLAGS}` empty) and update the matching `ship-invariants.test.ts` row instead of keeping it unchanged.

## OPTIONAL

1. **T12 / `land.ts` hedge is wrong about today's `pushToDev`.** It already takes a `build: (dir, attempt) => void` callback (`land.ts:112–118`), not a path set. A callback that cherry-picks the run's commits fits the existing contract with no signature change. Drop "gains a commit-range input if it takes only paths today" and the `land.test.ts` `Test first` "fails on the missing range input": that test reds for the wrong reason and invites an unneeded contract change. Test the callback in `branches.test.ts` / the integration test instead.
2. **Matrix row vs `Test first` mismatch on T7.** The matrix has `Wording clauses … (T7) | Unit | wording.test.ts`, but T7 `Test first` = `n/a — prose clauses`. Either name the new `wording.test.ts` tests (e.g. `workflow-issue-id-missing` has no STOP, `retired` holds the old text) or drop the row and fold it into T8.
3. **Static matrix row is tagged `(T18)`, but the static gates sit in T19's `Done when`.** Re-tag the row to T19.
4. **Ledger rows are already appended.** `docs/decisions.jsonl` and `docs/deferrals.jsonl` each already hold 3 `650-*` keys. The plan still says "Existing rows checked: no `650-*` key" and tells the orchestrator to run the jq blocks before Gate 1, and re-running them duplicates rows. Change the text to "appended; do not re-run". T17 stays as the check.
5. **What happens when the backstop rejects a minted FID is not specified.** Issue-less minting is prose (`workflow-fid-mint`, no engine verb in `fids.ts`). If the agent keeps a digit word, `fids check --issue=""` exits 1, and the plan never says whether Step 1 re-mints or goes to Failure Path. Without that, SC2 ("run continues") is at risk. Specify: re-mint once with all-digit words dropped, then Failure Path. The `Mint … fix 123 retry → dev-fix-retry` edge-case row has no test.
6. **`fidProblem` does not cover `--tracker=any`.** `fids check` takes `any` (CI_DEV mode, `fids.ts:179`). The dev-CI router dispatching `/bkit-debug` on `dev` is the SC1 scenario, so define what `any` + `--issue=""` does and add a T1 row.
7. **Debug on `dev` per runtime is unaddressed.** No edge-case row covers `branches push --mode=dev` with a record under `CLOUD_CLAUDE` (`RUNTIME_DEVPUSHES=false`) or `GITHUB_ACTION` (dev-CI router). Add rows with the expected behaviour, or record an Assumption.
8. **Aborted run on `dev` leaves its own commits behind.** `writeStepRow` commits at every step. After an abort, those half-fix commits stay on local `dev`, unpushed. The next run counts them as foreign (`aheadAtStart > 0`), and the handover from `dev` lands bookkeeping only. Add an edge-case row stating this end state and the resync advice.
9. **Docs land in a different wave from the workflow edits.** Workflow edits are committed in Waves 2–3, but `.bkit/core/.bkit/workflows.md` only in Wave 4 (T16). `.agents/rules.md` § Workflow edits requires the same change, and the per-wave commits split them. Move each workflow's `workflows.md` rows into T8 / T9 / T14 / T15, or state that the Wave 2 commit holds them.
10. **Codex is missing from the host checks.** T18 names `.claude/`, `.cursor/`, `.opencode/` mirrors only. The #650 constraint covers "every host (Claude, Cursor, OpenCode, Codex)". Add `.codex/` to T18 and a per-host render check to the T19 dogfood.
11. **The `workflow-large-diff` `{{base}}` / `{DIFF_BASE}` change is not traced to the source.** Add one Context line: a consequence of Q1.2 (when local `dev` is ahead, a diff against `origin/dev` counts foreign commits).
12. **No contract-change sweep is recorded.** `.agents/rules.md` § Contract changes requires grepping `.bkit/core/prompts/` and `.bkit/core/docs/templates/` when `{ISSUE_ID}` may be empty. Reviewer grep: only `bkit-audit-generate.md` (13 hits) and `bkit-utility-update-tracker.md` (1 hit, not invoked by any workflow). Record the result in the blast radius.
13. **T8 is very large** (five workflows, about 12 changes each, five `Test first` rows). Consider splitting it per workflow so each task is finished and verified on its own.

## OUT OF SCOPE

- A `bkit fids mint` engine verb, so issue-less minting (digit-word drop, slug from the prompt) is deterministic rather than prose. It would remove OPTIONAL 5's reject path entirely, but it is new surface the source did not ask for.
- An automatic local-`dev` resync helper after a replay. Open Question 3 option B was rejected, so the run only prints the command.

## SUGGESTED SCOPE EXPANSION

- `363-dev-dispatch-cap-self-resettable-by-controlled-principal` — `docs/deferrals.jsonl` (OPEN, `related-deferrals.md`). Overlaps Open Question 1 option A, which names `MAX_DEV_DISPATCH_ATTEMPTS` as the bounded owner of retries after a red `dev` run; that cap can be reset by the session it bounds. Recommendation: keep deferred, but cite it in OQ1's trade-off.
- `442-plan-template-design-missing-fallback-amendment` — `docs/deferrals.jsonl` (OPEN, `related-deferrals.md`). Overlaps this plan's `Narrative` MISSING (CRITICAL 1). Recommendation: needs design decision.
- #639 open item: the stale `RUNTIME_DEVPUSHES` reason at `.bkit/core/engine/commands/workflow/runtime.ts:110` (`related-issues.md`, "Still open"). Overlaps debug-on-`dev` push behaviour per runtime (OPTIONAL 7). Recommendation: keep deferred.
