Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: both failures are pinned by a failing assertion with a line number (`templates.test.ts:215`, `bkit-test-awake.test.mjs:110`), and each has a concrete fix.

## CI Run

NOT CHECKED: this is a local gate failure (`pnpm bkit:gate:static-unit-integration`, `"source":"local"` in `status.jsonl`); no remote CI run exists for this attempt.

## Prior Attempts Reviewed

None

## Prior Knowledge

- dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit: editing a `.bkit/core/docs/templates/*.md` file reds the unit gate until the repo's own mirrors are re-rendered, because `templates.test.ts` holds `docs/templates/bkit-audit-*.md` byte-equal to their sources — applied as a required step in the remediation (run the upgrade after editing `bkit-audit-testing.md`).
- local-pnpm-test-full-parallelism-integration-timeouts-flake: the full local suite at default concurrency intermittently fails heavy suites on a loaded machine, not a code regression — applied as supporting context for judging the `bkit-test-awake` sub-test as load-sensitive.

## Related Issues

- #481 — Flake triage (OPEN): the standing flake tracker; its comments record earlier awake runs passing (`awake **20 passed**`) and no prior failure of this sub-test.
- #847 — Prevent macOS sleep during local tests and gates (CLOSED): introduced `bkit-test-awake` and its test file.

## Failures

Two failures in the unit tier of one gate run (`run-tests-1.log`). They are independent: one is caused by this run, one is not.

1. `.bkit/core/engine/audits/templates/templates.test.ts` > "every shipped doc section is named by an audit, or listed with a reason": received list has one extra entry, `"testing.md § Test first"` (`templates.test.ts:215:48`). Caused by this run: TASK 3 added `## Test first` to `.bkit/templates/docs/testing.md`.
2. `.bkit/core/engine/audits/templates/ci-scripts.test.ts` > "ci/bkit-test-awake.test.mjs passes when run on its own": the sub-test `shell cancellation waits for SIGHUP cleanup` failed with `'' !== 'SIGHUP'` at `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:110:16`; the other 20 sub-tests passed. Not caused by this run: no changed file is a script or test, and the file passed 21/21 when re-run on its own (`node --test .bkit/templates/scripts/ci/bkit-test-awake.test.mjs`, Node v24.16.0; the machine test lock did not block it).

Because the unit step failed, `pnpm bkit:test:bats`, `pnpm bkit:test:awake` and `pnpm test:integration` did not run in this gate.

## Root Cause

1. Uncovered starter section.
   - Proximate cause: no audit template contains the text `Test first`, and `uncoveredBkitDocSections` (`templates.test.ts:123-146`) counts a starter section as covered only when an audit that cites `docs/testing.md` contains its heading text.
   - Design fragility: adding a section to a shipped starter doc needs a matching audit edit in the same change, and the plan for TASK 3 did not list one (the owner's decision in `build-decision-1-1.md` added the section without naming the audit side).
   - Which fix is right: name it in `.bkit/core/docs/templates/bkit-audit-testing.md`, not in `UNAUDITED_DOC_SECTIONS`. The map is for sections "no repo audit can check" (commit 8a1dbd56e), and its only entries are the six `§ Project facts to record` prompts. § Test first states checkable rules (declare `bkit:test:file`, write JUnit to `$BKIT_TEST_REPORT`, pass no empty report flag), and `bkit-audit-testing.md:43` already reads the matching contract (`.bkit/workflows.md` § Test-first).
2. Flaky awake sub-test.
   - Proximate cause: the fixture worker writes the `cancelled` file with `fs.writeFileSync(file("cancelled"), signal)` (`bkit-test-awake.test.mjs:35`), which creates and empties the file before it writes the bytes. The test waits only until the file exists (`:109`) and then reads it at once (`:110`), so on a loaded machine it can read the empty file.
   - Design fragility: the same fixture writes `ready` safely (`ready.tmp` then `renameSync`, `:36-40`), but `cancelled` does not, so the waiting check and the read can disagree.
   - Contributing factor: the file runs inside the full parallel unit suite (`ci-scripts.test.ts` spawns it while 175 other files run), which widens the gap. Whether the shell SIGHUP case also gets the signal twice is untested (Hypothesis 4).

## Rot Signals

tests

- tests: `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:35` writes `cancelled` non-atomically while `:109-110` waits on existence and reads at once, so the sub-test fails at random under load (`'' !== 'SIGHUP'`).

## Recommended Remediation

1. `.bkit/core/docs/templates/bkit-audit-testing.md:42`: in the `- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): ...` line, insert `§ Test first; ` straight after `§ What each tier must do; ` (doc order: the starter has `## What each tier must do` at line 301 and `## Test first` at line 368, before `## Design assertions are a dimension, not a lane` at line 379). The changed span reads `§ What each tier must do; § Test first; § Design assertions are a dimension, not a lane`.
   - Before the edit, read the `.bkit/authoring.md` sections that § Which Sections Apply lists for audit templates, and run `pnpm instructions:show --file bkit-audit-testing` (this sources line is not a shared clause in that output).
   - Do not add `testing.md § Test first` to `UNAUDITED_DOC_SECTIONS` in `.bkit/core/engine/audits/templates/templates.test.ts:111-116`; its reason text would be false for this section.
2. Re-render the mirrors: run `pnpm tsx .bkit/core/engine/cli.ts upgrade` so `docs/templates/bkit-audit-testing.md:42` matches its source. Do not hand-edit the mirror.
3. Flaky awake sub-test: no change in this run. Re-run the gate; the sub-test is load-sensitive and unrelated to this run's diff. If it fails again, treat it as pre-existing and fix it out of scope (see below).

## Out-of-Scope Recommendations

- `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:35` (and its byte-identical copy `scripts/ci/bkit-test-awake.test.mjs`): make the worker's `cancelled` write atomic (write `cancelled.tmp`, then `renameSync` to `cancelled`, as `ready` already does), or make the wait at `:109` require non-empty content. Rationale: appears only in the failure log; this docs run does not own it; record it on #481.

## Blast Radius

- `.bkit/core/docs/templates/bkit-audit-testing.md` is a shipped audit template: consumers receive the new `§ Test first` reference in their managed block on `bkit upgrade`. Compatible: the reference resolves to the new `## Test first` heading in the shipped starter, which the test "bkit doc anchors resolve to shipped headings" (`templates.test.ts:208-211`) checks.
- `docs/templates/bkit-audit-testing.md` (bkit's own installed copy): must equal the source but for the version stamp, checked by `templates.test.ts`. Compatible once step 2 of the remediation runs.
- `.bkit/prompts.md` § Audit (Ad-hoc): no change needed; the audit's title and purpose do not change.

## Suggested Tests

- No new test: the existing "every shipped doc section is named by an audit, or listed with a reason" test already guards this and goes green with the fix.
- Out of scope: a stress run of `bkit-test-awake.test.mjs` under CPU load (for example 20 repeated runs beside a busy loop) to confirm the atomic-write fix removes the empty read.

## Verification Commands

- `pnpm bkit:test:file .bkit/core/engine/audits/templates/templates.test.ts`
- `node --test .bkit/templates/scripts/ci/bkit-test-awake.test.mjs`
- `pnpm tsx .bkit/core/engine/cli.ts check`
- `pnpm bkit:gate:static-unit-integration`

## Hypotheses

### Hypothesis 1: The new `## Test first` starter section is named by no audit template, so the coverage test lists it as uncovered

#### Reason

The gate diff shows one extra entry, `testing.md § Test first`, and TASK 3 of this run added `## Test first` to `.bkit/templates/docs/testing.md`.

#### Act

Read `.bkit/core/engine/audits/templates/templates.test.ts:110-146` (`UNAUDITED_DOC_SECTIONS`, `uncoveredBkitDocSections`) and line 215. Ran `grep -n -m5 'bkit:test:file\|Test first' .bkit/core/docs/templates/bkit-audit-*.md` and `grep -n -E '^#{2,3} ' .bkit/templates/docs/testing.md`.

#### Observe

Gate log: `+   "testing.md § Test first",` at `templates.test.ts:215:48`. The grep over the audit templates returned no line containing `Test first`. The starter heading list shows `368:## Test first`. `uncoveredBkitDocSections` counts a section as covered only when an audit citing `docs/testing.md` contains the heading text (`named(title)`) or anchors `every rule and section`.

#### Result

CONFIRMED — no audit template contains the text `Test first`, so the section is reported as uncovered.

### Hypothesis 2: The right fix is to add `§ Test first` to the `bkit-audit-testing` sources line, not to the exempt map

#### Reason

`UNAUDITED_DOC_SECTIONS` holds only the six `§ Project facts to record` sections, with the reason "prompts for the project's own facts". The commit that added the test (8a1dbd56e) says the allowlist is for sections "no repo audit can check". § Test first states rules an audit can check: that `bkit:test:file` is declared, that it writes JUnit to `$BKIT_TEST_REPORT`, and that no empty report flag is passed.

#### Act

Read `.bkit/core/docs/templates/bkit-audit-testing.md:30-60` and `git log -1 --format=%B 8a1dbd56e`.

#### Observe

`.bkit/core/docs/templates/bkit-audit-testing.md:42`: `- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; ... § What each tier must do; § Design assertions are a dimension, not a lane; ...`. Line 43: `- `.bkit/workflows.md` § Test and release mechanics (Tests lock; Local test sleep prevention); `.bkit/workflows.md` § Test-first`. Commit body: "Three setup.md sections no repo audit can check sit on an allowlist, each with its reason."

#### Result

CONFIRMED — the testing audit already reads the test-first contract (`.bkit/workflows.md` § Test-first), so naming `§ Test first` there is the fit; an allowlist entry would claim falsely that no audit can check it.

### Hypothesis 3: `shell cancellation waits for SIGHUP cleanup` failed because of a read-while-writing race in the test fixture, not because of a change in this run

#### Reason

This run changed docs only. The failure value is `''`, an empty file, not a wrong signal name. The worker writes `cancelled` with `fs.writeFileSync`, which creates and truncates the file before it writes the bytes. The test waits on `existsSync` and then reads at once, so under load it can read the file in the gap between create and write. The `ready` file avoids this with a `ready.tmp` write plus `renameSync`; `cancelled` does not.

#### Act

Read `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:15-115`. Ran `git diff a2c8e2741d434cb4d5f83e59adc265d936e2be42...HEAD --stat=200 | grep -v 'docs/plans/'`. Re-ran the file alone once: `node --test .bkit/templates/scripts/ci/bkit-test-awake.test.mjs` (Node v24.16.0). The machine test lock did not block it.

#### Observe

Fixture line 35: `process.on(signal, () => fs.writeFileSync(file("cancelled"), signal));`. Lines 109-110: `await until(() => existsSync(fixture.file("cancelled")), "worker cancellation");` then `assert.equal(readFileSync(fixture.file("cancelled"), "utf8"), signal);`. Gate log: `'' !== 'SIGHUP'` at `bkit-test-awake.test.mjs:110:16`. Non-plan files in the diff: `.bkit/core/.bkit/workflows.md`, `.bkit/friction.jsonl`, `.bkit/templates/docs/testing.md`, `.bkit/workflows.md`, `docs/testing.md`; none is a script or test. The re-run alone: `✔ shell cancellation waits for SIGHUP cleanup (214.947334ms)`, `ℹ pass 21`, `ℹ fail 0`.

#### Result

CONFIRMED — the test is flaky under load from a non-atomic write it then reads; it passed 21/21 on its own, and no file this run changed is loaded by it.

### Hypothesis 4: In the shell SIGHUP case the worker gets the signal twice, so a second truncating write widens the race

#### Reason

Only the shell SIGHUP variant failed, while the shell SIGTERM and SIGINT variants passed in the same run. A second delivery would re-truncate the file while the test reads it.

#### Act

Untested. Proving it needs instrumenting the worker to log each delivery under load, which goes past what the failure requires.

#### Observe

Gate log, same run: `✔ shell cancellation waits for SIGTERM cleanup (319.703875ms)`, `✔ shell cancellation waits for SIGINT cleanup (332.001125ms)`, `✖ shell cancellation waits for SIGHUP cleanup (227.436625ms)`.

#### Result

INCONCLUSIVE — one failure cannot tell double delivery from plain scheduling luck; the fix for hypothesis 3 closes both cases.
