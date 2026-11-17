Verdict: CONCERNS
Failures: 6
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

No design artifact exists (`docs/plans/202611/` holds only `891-build-gate-stuck-plan.md`, and the input names none), so design-coverage (Process step 7) does not apply. Group gate = `bkit:gate:static-unit` (static + `test:coverage:unit` + bats); it does not run `bkit:check:dist` or the capability check.

- **TASK 1** — `JunitCase`, `parseJunit`, `runTestFile` in `.bkit/core/engine/commands/workflow/tests.ts`.
  - Consumers of `JunitCase`: `judgeRed`, `judgeGreen`, `caseNames`, the `green` verb (all in tests.ts); `tests.test.ts:717` and `:737` (`toEqual<JunitCase[]>`, updated by the task). Additive nullable fields; no consumer reads them by spread into an output, so no shape break.
  - `runTestFile` (tests.ts:1121-1134, private today): export only; signature unchanged. Runs `[...scriptCommand(BKIT_TEST_FILE_SCRIPT), test]` with `$BKIT_TEST_REPORT`.
- **TASK 2** — shared utilities (high-risk, flagged).
  - `installCommand` in `.bkit/core/engine/shared/package-manager.ts:23`: callers land.ts:167, worktrees.ts:641, branches.ts:2471, package-manager.test.ts:28, settings.test.ts:427. Optional field, default unchanged → backwards compatible.
  - `install` (worktrees.ts:640-649) and `copyListed` (worktrees.ts:519) exported; `withCleanup` (ci/ci.ts:250, synchronous body, SIGINT/SIGTERM → `process.exit(128+signo)`, `CLEANUP_SIGNALS` at ci.ts:101, used by `slop` at ci.ts:314) exported unchanged.
  - `runtime.ts` `assert` verb (inline `runtime-resolved` filter at runtime.ts:296-301) refactored to `latestRuntimeRow` — behaviour-preserving extraction of a live verb.
- **TASK 3** — `loopProgress` / `LoopProgress` in `.bkit/core/engine/commands/workflow/counters.ts:267-335`; `LOOPS` (decisions.ts:173-197) and `compose` (decisions.ts:361-445).
  - Consumers of `loopProgress`: `counters progress` verb (counters.ts:662-674; its output help does not list the new fields) and `decisions compose`. `loopTrend` (counters.ts:257-265) is unchanged but now sees gate counts folded in.
  - Consumer of `counters progress` output: bkit-build.md Step 12 TESTS_LOOP (stuck/worse) — trend semantics change for the verify loop only.
  - Ledger read: `test-run` rows written by `tests run` (tests.ts ~1840-1933, `appendTestRun` tests.ts:177-223) with `step`, `attempt`, `failures` (null when no reports / FAIL with 0 counted).
- **TASK 4** — new pure module `tests-base.ts` (`caseFile`, `baseVerdict`); no existing consumers.
- **TASK 5** — new verb `bkit tests base` registered in `testsCommand` (tests.ts).
  - Reaches: `shipGate` (runs.ts:1088; `GateOptions.repo` optional at runs.ts:983; `gh repo view` fallback at runs.ts:1281-1285; code 80 when gh missing), `devBase` (worktrees.ts:179-195), `withoutHooks` (land.ts:104), `dropLandTree` (land.ts:90), `withCleanup`, `copyListed`, `install`, `runTestFile`, `latestRuntimeRow`.
  - Boundaries crossed: git (worktree add/remove, merge-base), package-manager install, gh CLI (CI run lookup), child test runs. Test doubles: `tests/fixtures/gh/bin/gh` (non-`api`/non-`pr view` → exit 1 at gh:86-88), `tests/fixtures/gates/pnpm.cjs` (changed by this task; install branch requires `--frozen-lockfile`, records `fixture-install-args`).
  - `pnpm.cjs` consumers: every `useGateRunner` integration test — changing arg forwarding touches all of them.
  - `.bkit/cli.md` generated region.
- **TASK 6** — `compose --base-check` in decisions.ts. Unknown flags are rejected today at lib.ts:238. Options list unchanged (`["Try again","Stop"]` / `["Try again","Decide"]`), so `applyRecommendations` (picks the loop item by its "Try again" option) is unaffected. `loopRecommended` changes meaning for `all`; it has no workflow reader.
- **TASK 7** — `apply` in decisions.ts:476-537; `--by` gate at decisions.ts:500 (`--by must be headless or owner`). Writes the decision file (`Status: DECIDED`), read by `openDecision` and the resume path.
- **TASK 8** — `OpenDecision` / `openDecision` (workflows.ts:245-298), header read by `^Key:` regex; consumers: `workflows start` resume facts output, bkit-build.md Contract **Resume** (bkit-build.md:43), `workflows.test.ts:488`, `:508`, `:526`, `workflow-shape.test.ts:250-266` ("resume facts" field list).
- **TASK 9** — `.bkit/core/workflows/bkit-build.md` Decision Pause (lines 127-311: item rules at 140 and 147, `LOOP_FLAGS` at 151, compose at 158, step 4 owner route, step 6 route + `steps finish build-decision` at 272) and Step 9 sub-step 5 (lines 814-822). Consumers: render snapshot `bkit-build.none.txt`, `workflow-shape.test.ts`, `local-gate-audit.test.ts` (one `tests run` site per probe), **`.bkit/instructions.md` entries at lines 9788, 9795, 9965 and `instructions-coverage.test.ts:277-279`**, host mirrors.
- **TASK 10** — bkit-build.md Contract **Resume** (line 43), Step 8 sub-steps 8-11 (lines 703-744: gate `tests run` block at 716, `steps finish build-group-gate` at 724, `counters route` with `{PAUSE_MAX}` in sub-step 11), Step 12 sub-step 4 (lines 996-1035). Same consumers as Task 9, plus the `resume facts` shape test.
- **TASK 11** — `.bkit/core/prompts/bkit-build-plan-verify.md` Process step 6 (lines 71-84). Consumers: `.bkit/instructions.md` coverage, `.bkit/prompts.md` index, host mirrors. No render snapshot exists for prompts.
- **TASK 12** — `.bkit/core/.bkit/workflows.md`, `docs/testing.md`, `docs/capabilities.md` (graph refresh), `dist/`, `.bkit/workflows.md` + host mirrors via `upgrade`.

## CRITICAL

1. **(plan edit) Instruction-store drift breaks the group-4 gate.** Tasks 9, 10 and 11 reword and add standing lines in `.bkit/core/workflows/bkit-build.md` and `.bkit/core/prompts/bkit-build-plan-verify.md`, but no task UPDATEs `.bkit/instructions.md` or runs the instructions check then `pnpm instructions:sync`. The exact sentences the plan rewrites are stored at `.bkit/instructions.md:9788` ("A group-gate failure is never an item, because it is always fixed."), `:9795` (the TESTS_LOOP line) and `:9965` ("Fixable gaps and group-gate failures are always fixed, never asked."). `.bkit/core/engine/tools/instructions-coverage.test.ts:277-279` ("the repo > has no coverage findings") fails when a stored entry no longer exists in its file or a new standing line has no entry; the corpus includes `.bkit/core/workflows` (`instructions.ts:266`). It is a unit test, so it runs inside `bkit:gate:static-unit` and goes red after Task 9. Fix: add to Tasks 9, 10 and 11 an `**UPDATE:** .bkit/instructions.md` line (entries for the changed/added lines, by the no-flag instructions check first, then `pnpm instructions:sync --write`), and a `DONE WHEN` that `instructions-coverage.test.ts` passes.
2. **(plan edit) Task 7 `TEST FIRST` cannot fail.** "apply --by=rerun refuses a file without `Gate: FAIL` or not `Status: OPEN` (usage error, nothing written)" already passes on current code: `.bkit/core/engine/commands/workflow/decisions.ts:500` throws `CommandError(EXIT.USAGE, "--by must be headless or owner")` for any `--by=rerun`, before writing. Fix: assert the refusal message names the missing `Gate: FAIL` / `Status: OPEN` condition, and pair it with the accepted positive case in the same test file so the refusal test is discriminating.
3. **(plan edit) Task 6 `TEST FIRST` cannot fail.** "a malformed base check is a usage error" already passes on current code: `.bkit/core/engine/commands/workflow/lib.ts:238` throws `CommandError(EXIT.USAGE, "unknown flag --base-check")`. Fix: assert the error text names the shape problem (e.g. the missing/invalid `verdict` field), not only the exit code.
4. **(plan edit) Task 5 fake gh cannot reach the `ci` source.** The plan has `testsBaseVerb` call `shipGate` at the base sha with no `repo`; `GateOptions.repo` is optional (`.bkit/core/engine/commands/workflow/runs.ts:983`) and when unset `shipGate` runs `gh repo view --json nameWithOwner` and refuses with "could not resolve repo" on failure (`runs.ts:1281-1285`). The planned stub `tests/fixtures/gh/bin/gh` exits 1 for anything but `gh api` / `pr view` (`tests/fixtures/gh/bin/gh:86-88`). So the row "a passing CI run at the exact base sha settles none (source ci)" cannot pass as planned, and the CI path would silently fall through to the local run in every test. Fix: Task 5 must resolve and pass `repo` explicitly (a `--repo` flag or a stated resolution), or the fixture must answer `repo view` (e.g. via `BKIT_FAKE_TOOL_SCRIPT`); name which in the task and the matrix row.
5. **(plan edit) Task 5 fixture `dev` ref does not match what `devBase` reads.** The integration fixture describes "real temp git repos with a `dev` branch". `devBase` (`.bkit/core/engine/commands/workflow/worktrees.ts:179-182`) returns `origin/dev` when `refs/remotes/origin/dev` is absent, so `git merge-base HEAD origin/dev` fails and every case reports `unknown` ("no base commit"). The `all` / `some` / `none` rows cannot pass on such a fixture. Fix: the fixture creates `refs/remotes/origin/dev` (a bare origin or `git update-ref`), stated in Task 5's CREATE line.
6. **(plan edit) Base-checkout environment copy is untested.** Task 5 runs `copyListed` (worktreeCopy, default `[".env", ".env.local"]`) into the detached base worktree, but no `Derived Test Matrix` row asserts a listed file is present during the base run. If the copy is missed, base cases fail for environment reasons, the verdict becomes a false `all`, and Task 6 tells the owner to "fix it on dev" — the exact wrong advice this feature exists to prevent. Fix: add a Task 5 integration row whose base-run test file reads a worktreeCopy entry and passes only when it was copied.

## OPTIONAL

- **Concrete Example count.** The "3 → 3" gate-failure line does not match the described flow: one verify round yields a single count ("3") and trend `first-round`. Manual Verification step 1 inherits the same expectation.
- **Mixed gate-ran / gate-skipped rounds.** The gate runs only when `VERIFY_VERDICT` = PASS and a later group exists (bkit-build.md Step 8 sub-steps 7-11). A round with no gate row counts 0, so `loopTrend` (counters.ts:257-265) can read a spurious `closing` (3 → 0) or `worse` (0 → 3). Add a Task 3 row across a round whose gate was skipped.
- **Placeholder order on resume.** Task 10's `GATE_RERUN` route in Step 8 sub-step 11 and Step 12 sub-step 4 should sit after the `counters route` block that holds `{PAUSE_MAX}` (bkit-build.md:151), `PAUSE_STEP` and `PAUSE_POINT`; on a fresh-session resume the Decision Pause otherwise reaches compose with a literal placeholder.
- **Resume ordering.** `apply --by=rerun` writes `Status: DECIDED` before `steps finish build-decision` (bkit-build.md:272). An interruption between them leaves no open decision, so the next resume goes through `status resume` without the re-run. Record the step first, or make the rerun apply idempotent.
- **Headless Stop route.** A headless `Stop` re-runs Step 8 from verify (no Stop route in Decision Pause step 6). Pre-existing, but `all` makes `Stop` the recommendation more often; the plan already lists it in Suggested Scope Expansion.
- **`counters progress` output help** (counters.ts:662-674) should name `gateCounts` and `rounds[].gateFailures`.
- **`.bkit/prompts.md` index** — Task 11 changes a prompt's behaviour; confirm whether its index entry needs the new rule.
- **CI-at-base manual check.** The `ci` source is proven only through the gh stub (`docs/testing.md:905` forbids real gh in tests). Add a Manual Verification step against a real green CI run at the exact base sha.
- **Synchronous base run.** `withCleanup` (ci.ts:250) takes a synchronous body while `withoutHooks` (land.ts:104) is async; keep the base run's body synchronous inside it, or cleanup on SIGINT can race. Signal cleanup itself is covered in `ci.test.ts` / `push-gate.test.ts`.
- **`pnpm.cjs` arg forwarding** (Task 5) changes the shared gate-runner fixture for every `useGateRunner` test; run the full integration lane, not only the new file, before closing Task 5.
- **Last group.** The group-mode verify rule (Task 11) relies on the group gate, which does not run on the last group; state that Step 12 and holistic verify cover it there.
- **Left-behind worktree.** A `bkit-base-*` worktree under `os.tmpdir()` survives SIGKILL; a prune on the next run would tidy it.
- **Known failures acknowledged.** `docs/failures.jsonl:267` (`status-holes-tasks-tick-between-two-finish-lines`, OPEN) and the knowledge rows on dist staleness (`kn-7-dist-staleness…`) and the spawn-heavy unit suite are acknowledged by the plan; no re-entry found.

## OUT OF SCOPE

- Detect environment-caused base failures by comparing base and head failure messages, instead of only the pass/fail state per case.
- Redesign the headless `Stop` route of the Decision Pause.
- Reuse the base check in `/bkit-ship` and `/bkit-debug` (already deferred by the plan).
