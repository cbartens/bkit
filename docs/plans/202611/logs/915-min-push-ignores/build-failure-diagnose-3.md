Verdict: CONCERNS
Mode: NORMAL
Fingerprint: 8f7688db7fa572b5b54d82d85546ffc834aa5a4b3b204b79cdcf279c12d7e7a0
<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: a CPU profile pins 95.7% of the failing `beforeAll`'s time to one regex at `.bkit/core/engine/render/trackers.ts:116`, and a concrete, output-equivalent fix exists, so no iterative instrument-fix-reverify loop is needed.

## CI Run

None — `gh run list --branch feat/915-min-push-ignores --limit 3 --json databaseId,status,conclusion,headSha` returned `[]`. The failure comes from the local gate `pnpm bkit:gate:static-unit-integration` (`run-tests-3.md`).

## Prior Attempts Reviewed

- **Attempt 1** (`build-failure-diagnose-1.md`, `STANDARD`, `CONCERNS`): one failure, `land.test.ts > pushToDev > dev moved before every push`, called a load flake. Remediation changed no code and re-ran. Run 2 then failed four tests on the same tree (`Problems after each round: 1 → 4 → 1`, `Code changed: no`).
- **Attempt 2** (`build-failure-diagnose-2.md`, `PIVOT`, `CONCERNS`): four failures, all called load flakes with ledgered history. It listed `catalog-parity.test.ts:124` as "the shared `beforeAll` is the step that is slow under load" and put any fix out of scope. Remediation 2 (`build-failure-remediate-2-log.md`, `FAIL`) changed no code. Its isolated run at load about 10 failed the catalog hook again (`Hook timed out in 19100ms`, file `40659ms`), the stop rule fired, and the engine still ran gate 3, which failed only the catalog hook.
- **Why both failed:** both treated machine load as the cause and changed nothing. Load is only the trigger. The catalog hook needs about 1.0-1.1x its budget in every gate run, including run 1, which passed by 9ms (`14709ms` against `14700ms`). Neither attempt measured where the hook's time goes.
- **Does this re-apply a prior commit SHA or debug log?** No. No earlier attempt changed code, and this diagnosis recommends no bare re-run. Its new evidence is a CPU profile (Hypothesis 4): `3656/3820` samples in `RegExp: \S[^\r\n]*$`, the `head` test in `attachPrefix`.
- **Is this the right problem?** Yes for the gate: the only red in run 3 is `catalog-parity.test.ts > rendered workflow comment contracts`, `Error: Hook timed out in 15800ms.` The plan is not flawed: no #915 task touches the render path (Hypothesis 1). The root cause is upstream. The regex came in `f89ce8346 fix(855-856): correct consumer adoption regressions` (2026-11-04), which is on `origin/dev`. Workflow growth from local `dev` commits that this branch carries made it worse (Hypothesis 5).
- **Decision record** `build-decision-1-3.md`: `Decision: Try again — A) Try again`. This diagnosis follows it with one more round. The round needs a change in it: a third run with no code change repeats attempts 1 and 2. The only change that removes the cause is in a file outside #915's scope, so the owner has to approve it (Recommended Remediation P2). The record's text `the failures come from this branch` rests on a base check that cannot be compared with the gate (Hypothesis 3).

## Prior Knowledge

catalog-contract-tests-share-immutable-render-matrix: build the 120-variant matrix once in `beforeAll`, because the per-case rebuilds went over unit budgets under coverage. Applied as the reason this failure is now a hook timeout at `:124`, and as the reason not to rework the test: the matrix is already shared, so its remaining cost is the renderers themselves.
spawn-heavy-unit-suite-needs-its-own-budget-under-load: `loadFactor()` under-scales a busy machine. Applied as a contributing factor (Hypothesis 6). Its suite-budget fix is not the recommendation here, because this hook spawns nothing and is CPU-bound in one regex.
local-pnpm-test-full-parallelism-integration-timeouts-flake: re-run alone before you call a timeout a regression. Applied as already done: remediation 2 ran the file alone and it still failed (`40659ms`).
docs/failures.jsonl `catalog-progress-authority-render-concurrency-timeout` (CLOSED, 3 rows): the per-case version of this timeout. Its fix gave `the whole file in 7178ms` under full coverage on 2026-11-08. Applied as the baseline: today's gate runs take 14709-29777ms on a corpus that has grown since.
Scar tissue: `git log --all -i --grep=revert` over `catalog-parity.test.ts`, `render/hosts.ts`, `render/trackers.ts`, `install/modules/codex.ts`, `vitest.unit.config.ts`, `vitest.timeout-budget.ts` and `vitest.setup.ts` returned only `0ca1216ad chore(release): 5.5.0 (#648)`. Diagnosis 2 already found that its body uses "reverted" for mutation proofs, so it is unrelated. The same grep without a path returned `7c9b909ea`, `ca85faeab` and `0ca1216ad`, so the read works and no reverted attempt touches these files.
External signal: not searched. The cause is a regex in this repo's own code, confirmed by a profile, so no third-party, dependency or toolchain hypothesis came up.

## Related Issues

- #481 — Flake triage (OPEN)
- #921 — Machine wide test lock despite low CPU usage (OPEN)
- #929 — Hung test never times out, so it holds the tests lock for hours (OPEN)

`gh issue list --state all --search 'attachPrefix OR substituteWorkflow slow'` returned `[]`, and `--search 'render slow tracker regex'` returned only unrelated closed issues (#668, #380, #243). The search works: `--search 'Hung test never times out'` returned #929. No issue covers the regex hotspot.

## Failures

One failure, in the unit stage of `pnpm bkit:gate:static-unit-integration` (`run-tests-3.md:1811-1828`):

- `.bkit/core/engine/audits/workflows/catalog-parity.test.ts > rendered workflow comment contracts`: `Error: Hook timed out in 15800ms.` at the `beforeAll` on `:124`. The file ran `(8 tests | 4 skipped) 16411ms` (`run-tests-3.log:181`), the first file the reporter printed. The budget was `load average 6.8 on 10 cores: unit limits 7900ms per test, 15800ms per hook (x1.58)` (`run-tests-3.log:176`).
- Totals: `Test Files  1 failed | 175 passed (176)` and `Tests  7598 passed | 6 skipped (7604)`. The `locks`, `land` and `instructions` failures from run 2 passed this time.
- Because the unit stage failed, `bkit:test:bats`, `bkit:test:awake` and `pnpm test:integration` never ran in any of the three runs. Their state is unknown, not green.
- The static stage passed. The artifact is clamped (`kept 1891 of 3651 lines`); the dropped lines were not read in the artifact, and the raw log `.git/bkit-outbox/915-min-push-ignores/run-tests-3.log` was read with `grep` for the catalog timing and budget. The totals line counts the one failed file, so no failure is hidden in the dropped part.
- How it relates to earlier rounds: the same hook failed in run 2 (`Hook timed out in 26886ms`) and in remediation 2's isolated run (`19100ms`), and passed in run 1 by 9ms. It is the one failure that has never passed with any margin.

## Root Cause

- **Proximate cause:** `attachPrefix` (`.bkit/core/engine/render/trackers.ts:115-118`) runs `/\S[^\r\n]*$/.test(head)` whenever the match's prefix ends in two or more spaces. `head` is `workflowContent.slice(0, offset)` (`:169`) or `output.slice(0, offset)` (`:188`): the whole document before the match, not the current line. The regex has no start anchor, so V8 tries it from every non-space character in `head`, and each attempt runs to the next line break before it fails. Each call costs 48-159ms on the current workflow files, against 0.03-0.12ms for the same test on the last line (Hypothesis 4).
- **Why the hook is slow:** the `beforeAll` renders 6 workflows × 4 trackers × 5 hosts. `substituteWorkflow` runs twice per workflow and tracker, once directly and once inside `applyCodexSkill` (`install/modules/codex.ts:34`). The profile puts `3656/3820` samples (95.7%) in that one regex. The render matrix takes about 5.5s alone at load 22. Under the full gate it takes 14.7-29.8s, with V8 coverage on `render/trackers` and `render/hosts` and nine workers starting at once.
- **Design fragility:** the cost grows with document length, so every line added to a workflow source slows every render: install, upgrade and this test alike. The workflow corpus grew from the base's 4.5s matrix to 5.5s on this branch (Hypothesis 5), and the catalog file went from `7178ms` under coverage on 2026-11-08 to `14709ms` and more now.
- **Contributing factors:**
  - Machine load from parallel sessions is the trigger that tips a hook already at about 1.0x its budget.
  - The per-file budget is read from the 1-minute load average when the file starts, so the first files of a run may get budgeted before the run's own load shows (Hypothesis 6, inconclusive).
  - `bkit tests base` ran the file alone, without coverage, at x3.11, so "0 of 1 red on base" could not reveal a problem that both trees share (Hypothesis 3).
- **Not caused by #915:** no #915 commit touches `trackers.ts`, the renderers, the workflow sources or the test (Hypothesis 1). The regex landed on `origin/dev` in `f89ce8346`.

## Rot Signals

hotpath, tests, observability

- hotpath: `trackers.ts:116` runs an unanchored, end-anchored regex over the whole document prefix for each marker match; `3656/3820` profile samples, 48-159ms per call, in the renderer that every install and upgrade runs for every host and tracker.
- tests: `catalog-parity.test.ts:124` has passed by 9ms or failed in every gate run on this tree (`14709ms`/`14700ms`, `29777ms`/`15000ms`, `16411ms`/`15800ms`), so the unit hook budget has no margin left.
- observability: `bkit tests base` (`scripts/ci/bkit-test-file.mjs:64-69`) runs the case without the gate's `--coverage` and config, at a higher budget, and `decisions.ts` turns its `0` red into `the failures come from this branch`, telling the owner something the evidence does not support.

## Recommended Remediation

1. **P1 — change no #915 feature file.** Leave `.bkit/core/engine/install/managed-block.ts`, `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/core/engine/commands/ci/push-gate.ts`, `.bkit/core/engine/commands/land.ts`, `.bkit/core/engine/install/modules/core.ts`, `.bkit/core/engine/shared/settings.ts` and `package.json` as they are. No failure runs through their changed lines (Hypothesis 1).
2. **P2 — do not start a fourth gate run without a code change.** Attempts 1 and 2 show a bare re-run measures the machine, not the branch, and this hook has no margin. The round the owner chose needs the fix in Out-of-Scope item 1. It is outside this plan's work targets, so hand it to the owner as the choice for this round. There are two options:
   - Approve it as a scope expansion of #915. The remediator then applies it, rebuilds `dist/` (`pnpm build && git add dist/`), runs the Verification Commands and re-runs the gate.
   - Land it on `dev` separately (it belongs to `f89ce8346`'s area), then merge `dev` into this branch and re-run the gate.
3. **P3 — keep the test and its budget.** Do not raise the `beforeAll` timeout in `catalog-parity.test.ts` or the unit hook base. The ledger row `catalog-contract-tests-share-immutable-render-matrix` says to keep each planned timeout, and a longer timeout would hide a 1000x hotspot that install also pays.

## Out-of-Scope Recommendations

- `.bkit/core/engine/render/trackers.ts:116`: test only the last line of `head`, for example `const lastLine = head.slice(Math.max(head.lastIndexOf("\n"), head.lastIndexOf("\r")) + 1);`, then `/ {2,}$/.test(prefix) && /\S/.test(lastLine)`. It gives the same answer, because without the `m` flag `$` matches only at the end of input and `[^\r\n]*` cannot cross a line break, so the original matches exactly when the text after the last `\r` or `\n` holds a non-space character. The probe found `mismatches=0` on all six workflow sources at every 97th offset. It is out of scope because the plan does not name `trackers.ts`; the file appears only in the root-cause analysis.
- `.bkit/core/engine/install/modules/codex.ts:34`: `applyCodexSkill` runs `substituteWorkflow` again on a source the caller has often just resolved. Once the regex is fixed this costs little, so leave it unless a profile still shows it.
- `scripts/ci/bkit-test-file.mjs:64-69` with `.bkit/core/engine/commands/workflow/tests-base.ts`: run the base case with the failing gate's config and coverage flags, or word the `none` result as "not red on base when run alone"; today it ran at x3.11 without coverage against the gate's x1.58 with coverage.
- `.bkit/core/engine/commands/workflow/decisions.ts`: the `the failures come from this branch, so a round can fix them` text fires on a base check that cannot see shared slowness (attempt 2 found it at `decisions.ts:492`).
- `vitest.timeout-budget.ts` / `vitest.setup.ts:98`: the first files of a run are budgeted from a 1-minute load average that has not yet risen with the run's own workers (Hypothesis 6, inconclusive); measure it before changing anything.
- Branch hygiene: this branch carries local `dev` commits that are not on `origin/dev` (attempt 2 counted `140`), which inflates the workflow corpus and makes the base comparison mismatch.
- `docs/failures.jsonl`: add a row for the `attachPrefix` regex hotspot, with the profile figure and the per-call timings, so `catalog-parity` hook timeouts trace to it.

## Blast Radius

P1 to P3 change no file, so they are localised. Out-of-Scope item 1, if the owner approves it, changes a shared renderer:

- `substituteWorkflow` callers: `install/modules/claude.ts`, `cursor.ts`, `opencode.ts`, `codex.ts`, `antigravity.ts` and `checks/status-holes.ts:373`. Compatible: the function's output does not change, because the new test is equivalent by construction and gave `mismatches=0` on every workflow source.
- Rendered mirrors and snapshots (`.bkit/core/engine/render/__snapshots__/*.none.txt`, the `.claude/`, `.cursor/`, `.opencode/`, `.codex/` copies): compatible, because the output does not change. `trackers.test.ts`, `hosts.test.ts` and the snapshot tests catch any difference, and `bkit check` drift stays clean.
- `dist/`: needs a rebuild in the same commit (`.agents/rules.md` § Engine builds). That is a required step, not a break.
- Public contracts, schemas, loaders: none touched.

## Suggested Tests

- In `.bkit/core/engine/render/trackers.test.ts`, add a hard-break case: a `github`/`linear` group whose prefix ends in two spaces, after a line with text, and the same after a blank line. Assert that the kept body keeps or drops the prefix as it does now. This pins the `hardBreak` branch that the fix touches.
- Add a `\r`-only line-break variant of the same case, because the fix splits on both `\r` and `\n`.
- Add a cost regression: render a synthetic source of about 200 KB with many indented groups, and assert `substituteWorkflow` finishes under a generous bound, such as `tierTimeouts(false).testTimeout`, so a whole-document scan comes back as a failure, not a slow hook.

## Verification Commands

- `npx vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/render/hosts.test.ts .bkit/core/engine/audits/workflows/catalog-parity.test.ts` (after the approved fix; the catalog file should drop well under its 10000ms unscaled hook base)
- `node --cpu-prof --cpu-prof-dir=<scratch> --import tsx <scratch>/probe-render.mts "$PWD"` (the regex should no longer top the profile)
- `pnpm typecheck && pnpm lint && pnpm build && git status --short dist/`
- `pnpm tsx .bkit/core/engine/cli.ts check` (rendered mirrors unchanged)
- `bkit tests run` with scope `pnpm bkit:gate:static-unit-integration` (the build step's own runner; only a full pass proves the bats, awake and integration stages, which have not run yet)

## Hypotheses

### Hypothesis 1: #915's own changes make the catalog `beforeAll` slow

#### Reason

The decision record's base line says `Also red on base 263f04b7c…: 0 of 1 (local run)`, and its recommendation says `the failures come from this branch`.

#### Act

`git diff --stat 263f04b7c HEAD` over `catalog-parity.test.ts`, `.bkit/core/engine/render`, `install/modules/codex.ts` and `.bkit/core/workflows`; `git log --grep=915` over the same paths; plan § Architecture & Component Changes.

#### Observe

`11 files changed, 368 insertions(+), 69 deletions(-)` — all workflow sources and their snapshots. `git log $B..HEAD -- .bkit/core/workflows` lists only `7ae1a3e8b feat(860-…)`, `1821a367f feat(891-…)`, `42a13fb2c Merge origin/dev into feat/864-…` and `ac3dd3778 chore(864-…)`. `git log --grep=915` over those paths returned nothing. The plan modifies `managed-block.ts`, `ledgers.ts`, `ci.ts`, `push-gate.ts`, `land.ts`, `core.ts`, `settings.ts`, `package.json` and docs; none is on the render path.

#### Result

REFUTED — no #915 commit touches the render path or the workflow sources; the extra workflow text comes from local `dev` commits that this branch carries.

### Hypothesis 2: the failure is a pure machine-load flake, so a bare re-run will pass

#### Reason

Diagnoses 1 and 2 classed every failure as load. The owner chose `Try again`.

#### Act

Compared the catalog file time with its hook budget in all three gate runs (`grep` over `.git/bkit-outbox/915-min-push-ignores/run-tests-{1,2,3}.log`) and in remediation 2's isolated run.

#### Observe

Run 1: `unit limits 7350ms per test, 14700ms per hook (x1.47)` and `✓ … catalog-parity.test.ts (8 tests) 14709ms`. Run 2: `15000ms per hook (x1.50)` and `❯ … catalog-parity.test.ts (8 tests | 4 skipped) 29777ms`. Run 3: `15800ms per hook (x1.58)` and `❯ … catalog-parity.test.ts (8 tests | 4 skipped) 16411ms`. Remediation 2 (alone with three other files, load about 10): `catalog-parity.test.ts failed Hook timed out in 19100ms at :124 (file took 40659ms)`.

#### Result

REFUTED — load is the trigger, but the hook sits at about 1.0-1.1x its budget in every gate run, including the one that passed; two retries without a code change failed, so a third bare retry is unlikely to pass.

### Hypothesis 3: the `bkit tests base` check does not compare with the gate

#### Reason

The base check reports the case passing on base, while the branch fails it every time.

#### Act

Read `run-tests-3.log.base/0.log`, `base-check.json` and `scripts/ci/bkit-test-file.mjs:64-69`; compared with `test:coverage:unit` in `package.json:85`.

#### Observe

Base: `load average 22.1 on 10 cores: unit limits 15550ms per test, 31100ms per hook (x3.11)` and `✓ … catalog-parity.test.ts (8 tests) 11587ms`. `bkit-test-file.mjs` runs `vitest run … files` with the default config and no `--coverage`; the gate runs `vitest run -c vitest.unit.config.ts --coverage … --coverage.include='…render/trackers,render/hosts…'`. `base-check.json`: `"atBase": "absent"`.

#### Result

CONFIRMED — base ran the file alone, without coverage, at twice the gate's budget (x3.11 against x1.58), so "0 of 1 red on base" does not show the branch caused the failure.

### Hypothesis 4: one regex in `attachPrefix` takes almost all of the `beforeAll` time

#### Reason

The `beforeAll` only calls the five renderers 120 times. FINAL asks whether the root cause lies upstream of the test.

#### Act

Timed each renderer (scratchpad `probe-render.mts`), CPU-profiled the same loop with `node --cpu-prof`, then timed `/\S[^\r\n]*$/` on whole workflow files against the same test on the last line, and compared both answers at every 97th offset (`probe-regex.mjs`).

#### Observe

Renderer split (branch, load 22): `{"totalMs":5579,"byRenderer":{"substitute":2771,"cursor":14,"codex":2764,"antigravity":12,"opencode":12}}`. Profile: `3656/3820	RegExp: \S[^\r\n]*$ null:0`; the next entry is `13/3820	readFileUtf8`. Regex probe (load 7.5): `bkit-build.md	120970B	wholeHead=159.36ms	lastLine=0.0972ms	mismatches=0`, `bkit-debug.md	80097B	wholeHead=110.71ms	lastLine=0.1202ms	mismatches=0`. The regex is `attachPrefix`'s `/\S[^\r\n]*$/.test(head)` at `.bkit/core/engine/render/trackers.ts:116`, where `head` is `workflowContent.slice(0, offset)`, the whole document before the match (`trackers.ts:169`, and `output.slice(0, offset)` at `:188`). All six files: `mismatches=0`; `bkit-ship.md	80439B	wholeHead=84.00ms	lastLine=0.0754ms`. `applyCodexSkill` calls `substituteWorkflow` again (`install/modules/codex.ts:34`), so the matrix pays it twice per variant.

#### Result

CONFIRMED — 95.7% of the matrix's CPU samples are in that one regex, which scans the whole document head on every match; testing only the last line gives the same answer and is over 1000x faster.

### Hypothesis 5: the larger workflow corpus on this branch adds cost

#### Reason

The branch carries 368 extra workflow lines from local `dev` commits.

#### Act

Ran `probe-render.mts` twice each on the branch tree and on a `git archive` of base `263f04b7c` in the scratchpad.

#### Observe

Branch `"totalMs":5579` and `5417`; base `"totalMs":4499` and `4605`.

#### Result

CONFIRMED (contributing) — the branch tree makes the matrix about 20% slower than base, from workflow text that #915 did not write; with the regex cost tied to document length, every added workflow line makes it worse.

### Hypothesis 6: the first file of a run gets the smallest budget at the busiest moment

#### Reason

In run 3 the catalog file was the first file the reporter printed (`run-tests-3.log:181`), and `vitest.setup.ts:98` sets each file's budget from the 1-minute load average when the file starts.

#### Act

Read `vitest.timeout-budget.ts` (`loadFactor`, `plannedLoadPerCore`) and the file order in the three logs.

#### Observe

Run 3: `load average 6.8 on 10 cores … (x1.58)` with the catalog file at line 181, before `ci.test.ts (81 tests) 63147ms` at line 193. `plannedLoadPerCore` is `(loadAverage + workers) / cores`, which assumes one core per worker and nothing from other sessions. In run 1 the catalog file came later (line 1098) and passed by 9ms.

#### Result

INCONCLUSIVE — consistent with an early file being budgeted before the run's own load shows in the 1-minute average, but one run does not prove it; it is a contributing factor at most, not the cause.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** attachPrefix scans the whole document prefix with an unanchored regex; catalog-parity beforeAll times out
  **Severity:** HIGH · **Class:** hotpath · **Fixable:** true · **Location:** `.bkit/core/engine/render/trackers.ts:116` · **Round:** 1
  - **DONE WHEN:** With owner approval (the file is outside the #915 plan), attachPrefix tests only the last line of head; trackers/hosts/snapshot tests and bkit check show identical output; catalog-parity.test.ts passes inside pnpm bkit:gate:static-unit-integration with no timeout change.
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/catalog-parity.test.ts
    - .bkit/core/engine/render/trackers.test.ts
<!-- bkit:task 1 end -->
