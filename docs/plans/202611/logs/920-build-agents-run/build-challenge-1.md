Verdict: CONCERNS
Failures: 4
Fingerprint: 95b62837c12f02bf9fa49b3d5e2793f0de3bfcd4ce3d4dd233a46c9bc450d2bf
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Round 2 of 2. Diff: `tmp/bkit-diff-920-build-agents-run.md` (4365 lines); no `partial diff coverage` marker. Reviewed only issue #920's changes and what they touch: the reworded `Local pre-commit` and `Local tests first` rules (`.bkit/core/.agents/rules.md`, `.bkit/instructions.md`), their carriers in the six build and debug prompts and the host mirrors, the four `the local-pre-commit rule` tests in `.bkit/core/engine/tools/instructions.test.ts`, the bkit-ship Step 2 exit-80 arm and its `ship-invariants.test.ts` test. Commits from #911, #915 and #929 that reached the branch through sync were not reviewed; `git log -S` shows the `concluded failure` wording and the `WAIT_EXIT` CI wait came from 66dd8fab2 (#911), and #920's group 2 (fde3578a0) added only the cancelled / action-required / stale arm to the exit-80 sub-list.
- Not re-reported (round 1, already planned as tasks 3-6): the exit-80 cancelled-check gap, the missing reproduce carrier, the `Local tests first` / `Local pre-commit` clash and the accepted audit-report skip-CI risk.
- Docs read: `.agents/docs.md`, `docs/architecture.md` and `docs/security.md` (section headings; no boundary, auth or secret change in #920's part of the diff), `docs/testing.md` § Tests lock and the `bkit:test:file` contract (`:302`), `.bkit/instructions.md` § Format (`carry` relation) and the `### local-tests-first` / `### local-pre-commit` entries.
- Plan: `docs/plans/202611/920-build-agents-run-plan.md`; no finding duplicates a plan task or test.

## Notes

- Task 1 is MEDIUM, not HIGH, for the reason round 1 gave its sibling: Step 10's `runs gate` re-checks CI at `VALIDATED_HEAD` before any merge. Uncertainty: whether `pull_request_read` `get_status` returns combined commit statuses (states `error` / `failure` / `pending` / `success`) or check runs (conclusions including `timed_out` and `startup_failure`) was not checked against the GitHub MCP server source; either way the arm list lets a non-pass, non-cancelled, non-pending state reach `- **Else** → next sub-step`. If it returns combined statuses only, the cancelled / action-required / stale arm #920 added can never fire, because those are check-run conclusions; that arm is harmless.
- Task 2 is new, not the round-1 carrier finding: the carrier fix landed, but the prompt's own step 6 and its `PASS` mapping were left as they were, and neither names a command, so the rule's "A `/bkit-*` step's named command is the only wider run" exception does not cover them.
- Cross-reference for task 3: `docs/testing.md` § Tests lock and `.bkit/workflows.md` both describe named full-suite gate runs outside the pre-push hook (`bkit tests changed` with a `bkit:gate:*` fallback, the build group gate), which the new `Local tests first` sentence says do not happen.
- Cross-reference for task 4: `.agents/rules.md` § Repo Authoring `Stack-agnostic` and `docs/testing.md:302`, where `bkit:test:file` is the consumer-owned per-file contract.
- Checked with no finding: the four new tests in `instructions.test.ts` each fail on the old text and pass on the new (`parseRuleEntries` returns the bold-labelled text, which `rules.md` holds as `- {text}`); the `ship-invariants` exit-80 test fails closed when no stop arm exists (`indexOf(undefined)` = -1); all six rendered ship copies and the snapshot carry the new arm once; `bkit-debug-failure-soak` runs only its named `pnpm bkit:gate:static-unit`, so it needs no `Local pre-commit` carrier.
- Outside this lens, for the caller: `Debug on demand` in `bkit-debug-failure-remediate` and `bkit-debug-failure-soak` refers to `Local tests first`, which neither prompt carries (this was already so before the diff).
- No test was run: this agent does not build or write code. Each TEST FIRST was checked by reading its logic against the code the diff leaves.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** On the MCP path (exit 80) a PR whose only non-green check timed out, hit a startup failure or reports a commit status of `error` matches none of the stop arms and falls to Else → next sub-step as green, while the gh path counts the same check as failed
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:353` · **Round:** 1
  - **DONE WHEN:** the exit-80 sub-list of Step 2 sub-step 5 continues to the next sub-step only when every check passed (success, neutral or skipped, the `PASS_STATES` of `checksFor` in `.bkit/core/engine/commands/workflow/prs.ts:839`), and any other finished check that is not cancelled, action required or stale (failure, timed out, startup failure, a commit status of `error`) holds `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**, so the MCP path denies by default the way the gh path does; the rendered mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm continues only when every check passed and sends a timed-out, startup-failure or error check to /bkit-debug` fails on the current exit-80 sub-list, where no sub-bullet names timed out, startup failure or error and the `- **Else** → next sub-step` bullet has no every-check-passed condition
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** bkit-debug-failure-reproduce now carries Local pre-commit, but its step 6 still allows "a file or name filter" with the raw test runner and its PASS mapping asks it to show "other tests are unaffected", so the agent runs a name filter alone or a wider suite (the whole suite collected) with no named command to excuse it
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-debug-failure-reproduce.md:74` · **Round:** 1
  - **DONE WHEN:** step 6 runs the new tests by naming each test file (through `bkit:test:file` when `package.json` declares it, a name filter only on top of the file), and the `PASS` mapping at `:84` drops "other tests are unaffected" or names the command that checks it; the corpus tests stay green and the rendered mirrors match.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `bkit-debug-failure-reproduce runs its tests by naming each test file and asks for no unnamed wider run` fails on the current prompt holding "a file or name filter" in step 6 and "other tests are unaffected" in the `PASS` mapping
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** The reworded Local tests first says "the full suite runs only in the pre-push hook" with no exception, so it contradicts the named full-suite runs of the steps that carry it (the `--fallback=bkit:gate:static-unit` of gaps-remediate and verify, the build group gate) and the Local pre-push arm for a repo without the hook, and an agent that follows it skips the run
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.agents/rules.md:121` · **Round:** 1
  - **DONE WHEN:** the `local-tests-first` text in `.bkit/instructions.md` and `.bkit/core/.agents/rules.md` keeps the full suite out of agents' own runs but names the same exception as `Local pre-commit` (a `/bkit-*` step's named command) and the no-hook case of `Local pre-push`; the old text sits under `retired`, `pnpm instructions:sync` has written it into every carrier, and the rendered mirrors match.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `local-tests-first names the /bkit-* step's named command as the exception to its full-suite limit` fails on the current `local-tests-first` text, which has no `named command` clause
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** On a stack whose test runner runs tests by package or folder and not by file (for example `go test ./internal/foo/`), the new Local pre-commit allows no valid run: it requires naming each test file and forbids a folder, so the agent either breaks the rule or skips the tests
  **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/.agents/rules.md:123` · **Round:** 1
  - **DONE WHEN:** no agent can settle this, because it decides what selector the shared rule allows on a stack the rule does not name (the Stack-agnostic rule). The owner decides between routing per-file runs through the consumer-owned `bkit:test:file` contract, or allowing the narrowest unit the runner supports (a package or a test name) when it cannot run one file; the store entry, `rules.md` and every carrier then hold that wording.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `local-pre-commit names a run for a runner that cannot run one test file` fails on the current `local-pre-commit` text, which names neither `bkit:test:file` nor a narrowest-unit fallback
<!-- bkit:task 4 end -->
