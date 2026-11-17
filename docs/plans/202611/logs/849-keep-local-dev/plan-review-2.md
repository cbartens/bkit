Verdict: CONCERNS
Failures: 6
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

- **Task 1** — CREATE `.bkit/core/engine/commands/workflow/local-dev.ts` (`syncLocalDev`, `LocalDevSync`, `LocalDevState`, `LocalDevReason`) and `local-dev.test.ts`. It moves `install` (`branches.ts:2723`) and adds `TIMEOUTS.LOCAL_DEV_FETCH_ATTEMPTS` (`shared/timeouts.ts`). It reads `fetchDev` / `devRefRace` / `landBackoffMs` (`land.ts`) and `installCommand` / `COULD_NOT_RUN_EXIT_CODES` (`shared/package-manager.ts`). Consumers: `syncDevVerb` (`branches.ts:2708`) is the only caller of `install` today. The new module becomes the shared helper for 8 verbs (Tasks 3-7). It is a shared utility, so it is HIGH-RISK.
- **Task 2** — UPDATE `syncLocalDev`, which reads blocked reasons from git state. It MOVES `branchTree` from `branches.ts:2938` (callers `:2957`, `:3001`) to `worktrees.ts` as an export, and adds `docs/observability.md` § Log Format. Consumers: the `branchTree` callers in `branches.ts`. `worktrees.ts` is already imported by `branches.ts:85`, so the move does not create an import cycle.
- **Task 3** — UPDATE `syncDevVerb` (`branches.ts:2708`, sync → async; JSON `devLocal` → `localDev`; keeps exit 16) and `landVerb` (`branches.ts:3189`, the call at `:3223-3224` inside the `try`, before the audit that can `Stop(EXIT_LANDED_UNVERIFIED)`). DELETE `fastForwardDev` (`branches.ts:3117-3148`). Consumers:
  - the `branches sync-dev` / `branches land` JSON contract, read by tests only (`branches.test.ts:3502-3567`, `:3606+`; `localDev` strings at `:3689`, `:3722`, `:3733`, `:4097`, `:4124`);
  - `close-squash.integration.test.ts:147-156`.

  No workflow prose or prompt reads `devLocal` / `localDev` today.

  New behaviour: on design / plan closes, `land` now runs a frozen dependency install in the main checkout when it is on `dev` and `dev` moved. The old `fastForwardDev` ran no install.
- **Task 4** — UPDATE the `pushOwnCommits` replay log (`branches.ts:1179`, log near `:1276`). Its consumers are stderr readers only. `branches.test.ts:3557` asserts the `git pull --rebase` advice that today comes from `fastForwardDev:3135`; that assertion is retired by Task 3.
- **Task 5** — UPDATE `PushOutcome` (`branches.ts:867`), `pushBranch` (`:912`) and `forceBuildVerb` (`:1756`, push at `:1823`). It is a HIGH-RISK public type. The `PushOutcome.out` consumers are:
  - `branches push` (`:1366`);
  - `forceBuildVerb` (`:1823`);
  - the ship-close PR merge-up (`:2972`);
  - the design/plan close PR route (`:3033`);
  - `handoverVerb` abort (`workflows.ts:896`);
  - `runs.ts:882` (`ciDispatchGate` re-trigger);
  - `tasks.ts`, which imports only `fetchRemoteRef` and `EXIT_DIFF_FAILED`.

  Exact-shape test readers: `branches.test.ts:1384` and `:1547`.
- **Task 6** — UPDATE `shipClose` (`workflows.ts:1488-1588`; the `landed` result carries `{ref, via}` and no sha at `:1536`), `finalReturnText` (`:1904`) and `finalReturnParts` (`:1856`, which ends with `## Suggested Replies` at `:1881`). It also adds a sync to the non-flush build / debug closes in the `close` verb run (`:2507-2525`). Consumers:
  - every workflow's `{FINAL_RETURN}` display (all five phases);
  - `workflows.test.ts` `close --flush (ship)` (`:1948`, nested `:2176`) and `close --final-return` (`:2846`; exact or prefix assertions at `:2890`, `:2912`, `:2932`).
- **Task 7** — UPDATE `handoverVerb` (`workflows.ts:850`; `landFailedRecord` `:885`/`:908`, `handBack` `:927`), roadmap `mirror` (`roadmap.ts`, push at `:494`), `DispatchResult` / `ciDispatchGate` (`runs.ts`, push at `:882`). Consumers:
  - the Failure Path prose of all five workflows;
  - `workflows.test.ts:1506+` (existing tests at `:1699` and `:1724`);
  - `roadmap.test.ts`;
  - `runs.test.ts`.
- **Task 8** — CREATE `audits/repo/local-dev-reachability.test.ts`, which walks the non-test push sites:
  - `land.ts:248`;
  - `runs.ts:734-735` (`pushCurrentBranch`);
  - `branches.ts:1009`/`1015`, `1083`/`1084`, `1229`/`1234`, `1261`, `2904`;
  - `worktrees.ts:852`;
  - `roadmap.ts:494`;
  - `workflows.ts:776`, `1452` (`closePr`), `1504`.

  It updates the verb specs (`output.localDev`) and the regenerated `.bkit/core/.bkit/cli.md`. Consumers: `conventions.test.ts` and `pnpm cli:sync`.
- **Task 9** — UPDATE the workflow prose in `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md`, `bkit-build.md` and `bkit-ship.md`, and in `.bkit/core/.bkit/workflows.md` (`:132`, `:217`, `:817`). Consumers:
  - the render snapshots (`.bkit/core/engine/render/__snapshots__/*.none.txt`);
  - the `.bkit/instructions.md` per-file `- source:` blocks (bkit-ship.md block at `:10341`), which `instructions-coverage.test.ts` checks;
  - `.bkit/workflows.md`;
  - the host workflow mirrors;
  - the `.agents/skills/bkit-*/SKILL.md` copies;
  - the workflow audits.
- **Task 10** — DELETE ship Step 13 (`bkit-ship.md:920-935`). UPDATE:
  - `step-table.ts` (`:196`, `:197`, `RETIRED_STEPS` `:206`);
  - `status-holes.ts` (`SHIP_STEP_ORDER` `:45-60`, key at `:58`; `detectHoles` `:1011`);
  - `ship-invariants.test.ts`, `workflow-shape.test.ts`, `skip-ci-subject-audit.test.ts`, `status-holes.test.ts`;
  - `.bkit/core/.bkit/workflows.md`;
  - `.bkit/core/.bkit/pipeline.md:269`.

  This is a HIGH-RISK frozen schema under decision `467-ship-step-names-frozen`. Consumers:
  - `resumePoint` (`step-table.ts:344-399`, which reads `retired[last.step]` directly, so the `ship-switch-to-dev → ship-close-workflow` mapping resumes at Close Workflow);
  - status-log validation of existing ship logs;
  - `.bkit/stats.jsonl` / `.bkit/friction.jsonl` (historical rows, key only);
  - `analysis.test.ts`, `comply.test.ts`, `migrate.test.ts`, `progress.integration.test.ts` (key `ship-close-workflow` only; renumbering does not change it).
- **Task 11** — `docs/testing.md`, `dist/`, render snapshots, `.bkit/workflows.md` mirror, host copies via `upgrade`, static gates.

## CRITICAL

1. **(plan edit) Existing, passing tests named as `TEST FIRST`.**
   - Task 7 TEST FIRST #1 names `bkit workflows handover > --push on dev hands the landed record back, so local dev fast-forwards onto it`. That test already exists at `.bkit/core/engine/commands/workflow/workflows.test.ts:1699` and passes today; the test itself does the fetch and `merge --ff-only`.
   - Task 3 TEST FIRST #5 names `lands past another session's uncommitted edit to a file the close changes, and keeps the edit`. That test already exists at `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts:147` (stderr assertion at `:156`) and passes today.
   - Rule: a task that adds behaviour names a NEW test, never an existing passing one, and a test whose name and file match a passing test cannot be proven red by name. Related knowledge rows: `steps-finish-refuses-a-code-step-whose-planned-test-file-changed`, `red-snapshot-freezes-the-test-file-write-it-lint-clean-first`.
   - Fix: give each new assertion its own new test name. For example, `--push on dev emits localDev fast-forwarded from the handover JSON` and `the close JSON reports localDev blocked: edited-files`. Keep the existing tests under the UPDATE lines (Task 3 already lists the close-squash update).
2. **(plan edit) Task 5 breaks exact-shape push tests it does not name.** Adding `out.localDev`, defaulted to `null` by `notPushed`, to `PushOutcome` (`branches.ts:867`) changes the JSON of every `branches push`.
   - `branches.test.ts:1384` (feature push) and `:1547` (abort push, exit 7) assert the whole object with `toEqual({...})`. Vitest's `toEqual` ignores only `undefined` properties, not `null`, so both fail.
   - Task 5's DONE WHEN names only "the 5 tests below". Unlike Task 3, it does not require the rest of `branches.test.ts` to pass, and it has no UPDATE line for those tests.
   - Other `PushOutcome.out` spreaders: `workflows.ts:896` (handover abort), `runs.ts:882`, `branches.ts:2972`, `:3033`. Any exact-shape assertion on their JSON breaks the same way.
   - Fix: add an UPDATE for `branches.test.ts:1384`/`:1547`, and for any exact-shape assertion on the handover-abort / dispatch / close-PR JSON. Add "the rest of `branches.test.ts`, `workflows.test.ts` and `runs.test.ts` pass" to the DONE WHEN.
3. **(plan edit) Task 6 breaks the `close --final-return` tests, and the line's placement is ambiguous.** Task 6 runs `syncLocalDev` on non-flush build / debug closes and folds its line into `finalReturn`.
   - Broken tests: `workflows.test.ts:2890` (exact `toBe` sequence), `:2912` (`startsWith("# Build Summary\n\nAll green.\n\n## Suggested Replies\n\n")`) and `:2932` (`startsWith("...First.\n\nSecond.\n\n## Suggested Replies")`). All three drive a `build` close. They break whenever the fixture yields any line, including the `not-applicable` wording Task 1 defines for "a clone without local dev". Task 6 names no fix for them.
   - Ambiguity: `finalReturnParts` ends with `"## Suggested Replies", ...suggest, PLAIN_ENGLISH_REPLY` (`workflows.ts:1881`). "After the summary parts, before `## bkit Tips`" therefore puts the `Local dev:` line inside the Suggested Replies section, after the plain-English reply. The DONE WHEN says "ends its summary", which reads as before `## Suggested Replies`.
   - Fix:
     - Pin the position: after the `--line`s / issue link and before `## Suggested Replies`.
     - State whether a `not-applicable` line is folded at all.
     - Add UPDATE lines for `:2890`, `:2912`, `:2932`.
     - Add "the rest of `workflows.test.ts` passes" to the DONE WHEN.
4. **(plan edit) Re-entry into ACTIVE knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` (`docs/knowledge.jsonl:96`).** Related: `instructions-store-clause-text-and-local-entries-need-hand-edits` (`:103`).
   - Task 10 deletes ship Step 13 / Gate 13 and renumbers Close Workflow. Task 9 rewrites standing lines in five workflows and `.bkit/core/.bkit/workflows.md`.
   - Every standing line is quoted verbatim under its file's `- source:` block in `.bkit/instructions.md` (bkit-ship.md block at `:10341`). `syncCoverage` never drops an entry whose line is gone. So `pnpm instructions:sync` (run by Task 11) exits 1, and `.bkit/core/engine/tools/instructions-coverage.test.ts` fails with `local entry no longer in the file`.
   - No task lists `.bkit/instructions.md`.
   - Fix: add an UPDATE of the edited workflows' `- source:` blocks in `.bkit/instructions.md` to Tasks 9 and 10, which is the row's remediation. Add `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` to both DONE WHENs.
5. **(plan edit) Tasks 9 and 10 leave the tests they break to Task 11.**
   - Tasks 9 and 10 edit `bkit-design.md`, `bkit-plan.md`, `bkit-debug.md`, `bkit-build.md` and `bkit-ship.md`. That turns the render snapshot tests in `.bkit/core/engine/render/__snapshots__/` (`bkit-ship.none.txt` and its siblings) red, and opens mirror drift for `.bkit/workflows.md` and the host copies.
   - The plan regenerates them only in Task 11 (`DEPENDS ON: 10`). The contract says "no task leaves its tests to a later one". Task 9's DONE WHEN runs only `.bkit/core/engine/audits/workflows`, and Task 10's runs only the named tests, so neither catches the red render suite.
   - Fix: move the render snapshot regeneration (`pnpm vitest run .bkit/core/engine/render -u`, then a plain re-run) into Tasks 9 and 10, each for the workflows it edits. Add the render suite to their DONE WHENs.
6. **(plan edit) No Derived Test Matrix row covers the new install on design / plan closes.**
   - Today `landVerb` calls `fastForwardDev` (`branches.ts:3224`), which runs no install. After Task 3, `syncLocalDev` step 6 runs a frozen dependency install in the main checkout whenever that checkout is on `dev` and `dev` moved. `land` is the last `dev`-pushing verb of every design and plan close, so this is a new behaviour on two workflows.
   - The matrix covers install success and failure only inside `syncLocalDev` (rows at plan `:128` and `:139`), and the exit-0-on-install-failure rule only for the ship close (`:158`). Row `:146` (`branches land` fast-forwards to the fetched tip) does not assert `installed`, and no row asserts `branches land`'s exit code and `localDev.installed: false` when the install fails.
   - `close-squash.integration.test.ts:84` already puts the main checkout on `dev` with a `package.json` under `useGateRunner`. Its pnpm fixture (`tests/fixtures/gates/pnpm.cjs`) records install runs and needs `--frozen-lockfile`, so the install path is cheap to exercise.
   - Fix:
     - Add a matrix row and a Task 3 test: `branches land` with the main checkout on `dev`, a failing frozen install, exit unchanged (0), `localDev.installed === false`, and the line naming the re-run.
     - Add a matching non-mock row in `close-squash.integration.test.ts` that asserts the fixture recorded one `install --frozen-lockfile`.

## OPTIONAL

- **High-risk surfaces (flagged; no rule above makes them CRITICAL):**
  - `PushOutcome` (`branches.ts:867`), a public type that 6 call sites spread;
  - `syncLocalDev`, a new shared utility on 8 verbs;
  - `SHIP_STEP_ORDER` / `step-table.ts`, a frozen schema under decision `467-ship-step-names-frozen`;
  - the multi-verb `localDev` JSON contract.

  The retirement handling (the `RETIRED_STEPS` mapping plus `detectHoles` accepting the retired key) is adequate for old logs and resume: `resumePoint` resolves `retired[last.step]` directly (`step-table.ts:344-399`).
- **`landVerb` placement.** Plan `:252` records the design's choice to sync "outside its `try`", but Task 3 only says "replaces `fastForwardDev`". Today that call sits inside the `try` and before the audit (`branches.ts:3223-3224`). Name the position in Task 3: after the audit, outside the `try`, with the exit code computed first. That way an audit `Stop(EXIT_LANDED_UNVERIFIED)` never follows a moved local `dev` that has already run an install.
- **Double fetch in `land`.** The audit's `fetchDev(root)` stays and `syncLocalDev` fetches again. This is harmless, but it adds up to `LOCAL_DEV_FETCH_ATTEMPTS` backoff on a fetch failure. Consider passing the audit's fetched tip in.
- **Task 2 "two concurrent syncs" test.** Two `Promise.all` calls in one process do not force an interleaving. A second fetch to the same tip is a no-op success, so the test may pass against Task 1 code. Force the race, for example with a hook between fetch and move, or prove red against Task 1.
- **Ship lock hold time.** If the ship close's sync runs before `releaseLock` (`workflows.ts` `shipClose`), a failing fetch holds the workflow lock through the retry backoff. Run the sync after `releaseLock`.
- **`shipClose` landed sha.** The `landed` result has no sha (`workflows.ts:1536`). The "Your work landed on origin/dev (…)" prefix depends on the plan's Assumption about obtaining one. Pin where it comes from in Task 6.
- **Slop delta.** Task 2's catch-all to `unavailable: internal` is the shape the slop error-obscuring-catch rule targets. Add `pnpm bkit:slop:delta` to Task 2's DONE WHEN; the warn-level stack log is what keeps it compliant.
- **Task 10 line list is incomplete.** `.bkit/core/.bkit/workflows.md:1242`, `:1255` and `:1420` also say ship "Step 14" and are not listed. The DONE WHEN grep catches them; list them so the executor does not discover them at the check.
- **`.agents/skills/bkit-ship/SKILL.md` and `.agents/plugins/bkit/skills/bkit-ship/SKILL.md`** name `ship-switch-to-dev`. Task 11's `upgrade` should refresh them. Add them to Task 11's mirror-drift check explicitly.
- **Pre-push timeout row.** The open `docs/failures.jsonl` row on the handover test (plan `:288`) is acknowledged. Moving the new handover tests onto `useGateRunner` from the start (Task 7 READ) avoids re-entering it.

## OUT OF SCOPE

- Feature-branch catch-up and the "publish `dev`" advice in `unpushedDevCause` (`branches.ts:3168`) belong to #842 / deferral `842-sync-with-origin-dev`. The plan already records this.
- The refused ship FAILED record lost in an ephemeral cloud container is deferral `639-refused-ship-failed-record-lost-in-cloud-container`. The plan does not change the refused path.
- Telemetry on `localDev` states (for example a `stats.jsonl` field counting `blocked` / `divergent`) would show how often local `dev` ends up out of step. It is not asked for.
- The design's WS-1 to WS-4 are dropped per the newer issue scope and recorded as deferrals. That is acceptable under "newer input wins", and the dropped workstreams are not plan gaps.
