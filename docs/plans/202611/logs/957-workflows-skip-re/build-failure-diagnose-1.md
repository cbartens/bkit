Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

NORMAL: the failing assertion pinpoints one stale baseline file, the diff hunks map one-to-one onto this feature's intended edits to `.bkit/core/workflows/bkit-build.md`, and the fix is a single regeneration command.

## CI Run

NOT CHECKED: this is the local Build-workflow test gate (`build-run-tests` attempt 1, `pnpm bkit:gate:static-unit-integration`); no remote CI run is involved, and the local log `/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/957-workflows-skip-re/run-tests-1.log` is sufficient evidence.

## Prior Attempts Reviewed

None

## Prior Knowledge

dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit: install outputs look like ordinary tracked files, so a source edit reads as complete while its generated copy is still stale — applied as the analogous failure shape (generated baseline left stale after a source edit), not as a direct match.
tracker-true-block-between-group-and-false-block-breaks-none-render: a misplaced tracker `true` block makes the none render print a spurious stub — applied as a ruled-out alternative (Hypothesis 2): the received render contains no `_No tracker connected, skip step._` stub in any hunk.
No reverted commit touches `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/render/trackers.test.ts` or `.bkit/core/engine/render/__snapshots__/` (`git log -i --grep=revert` on those paths returned nothing; the same search unscoped returns hits, so the search works).

## Related Issues

None (searched `cbartens/bkit` issues for `"none render"` and `snapshot baseline`; hits #202, #789, #168, #845, #343, #43, #843, #374 are not stale-baseline incidents; #789 body and comments do not mention a none render or baseline).

## Failures

One failure, and nothing else failed in the tiers that ran:

- `.bkit/core/engine/render/trackers.test.ts` > `none render baselines` > `bkit-build: the none render matches its baseline byte for byte` — `Error: Snapshot \`none render baselines > bkit-build: the none render matches its baseline byte for byte 1\` mismatched`, 11 diff hunks (`@@ -44,11 +44,11 @@` through `@@ -865,11 +878,11 @@`).
- The other four baselines (`bkit-design`, `bkit-plan`, `bkit-debug`, `bkit-ship`) pass; the file reports `107 tests | 1 failed`.
- Reproduced in isolation: `vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -t "none render baselines"` gives `Tests  1 failed | 4 passed | 102 skipped (107)` with the same 11 hunks.
- Not run at all: the gate chain is `pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake` then `pnpm test:integration`, so the unit failure stopped it before bats, awake and the integration tier. Their state is unknown, not green.

## Root Cause

Proximate cause: the test renders `.bkit/core/workflows/bkit-build.md` with tracker `none` and compares it byte for byte with the committed file `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` (`toMatchFileSnapshot`, `.bkit/core/engine/render/trackers.test.ts:415-417`). This feature edited `bkit-build.md` in commits `43bebb914` (group 2 execute), `79380f785` (group 3 execute), `0d9627736` (holistic remediation 3) and `61fa81cdf` (group 4 execute) — `git log 3e08269f7..HEAD -- .bkit/core/workflows/bkit-build.md` lists exactly these four, adding the `continue` route, the `Source changed` header, `SOURCE_CHANGED` holds and the `tasks tick --decision` steps. None of those commits touched the baseline; it was last written by `3e08269f7` (feature 951), before this branch's edits. Every one of the 11 hunks is one of those planned edits (Plan TASK 4 and the `SOURCE_CHANGED` remediation), so the workflow text is correct and the baseline is simply out of date. The test's own comment names the procedure: "A change that shows up here is a change to the none render: review it, then `vitest -u`."

Design fragility: nothing before the full gate can select this test. The test builds the source path at runtime (`path.join(REPO_ROOT, ".bkit", "core", "workflows", \`${wf}.md\`)` over the list `"bkit-build"`) and reads it with `fs.readFileSync`, so `vitest related` (import graph) cannot link it to `bkit-build.md`, and the `named` stage of `scripts/gate/bkit-gate-changed.mjs` (git grep for the changed path or its basename `bkit-build.md`) finds zero matches in `trackers.test.ts` (`grep -c -F 'bkit-build.md'` → `0`). A workflow-only edit therefore passes every changed-files check and first goes red at the whole-suite gate.

Contributing factors: the plan lists `.bkit/core/workflows/bkit-build.md` as a MODIFY target but never names its generated baseline, so no task or verifier asked for it; `docs/testing.md` does not document the none-render baselines or the `vitest -u` refresh (the only doc mention is `.bkit/core/.bkit/trackers.md:86`); only group 1 recorded a `build-group-gate` test-run row (`status.jsonl:61`), so groups 2-4 had no gate run of their own (not investigated further; it would not have caught this anyway, per the fragility above).

## Rot Signals

tests
- tests: `.bkit/core/engine/render/trackers.test.ts:404-417` reads each workflow through a runtime-built path, so neither `vitest related` nor the `named` text match in `scripts/gate/bkit-gate-changed.mjs:43-58` can select it for a `bkit-*.md` workflow edit; the baseline drift surfaces only at the full gate.

## Recommended Remediation

1. Regenerate the `bkit-build` none-render baseline; do not hand-edit it. Target: `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` — the generated baseline of the in-scope work target `.bkit/core/workflows/bkit-build.md` (plan § Architecture `[MODIFY] .bkit/core/workflows/bkit-build.md`, TASK 4). It is in scope as that file's derived output, the same way `dist/` is for engine edits; it is written by the command, never by an editor.
   - Run `pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -t "bkit-build: the none render matches its baseline byte for byte" -u`.
   - Review `git diff .bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: it must contain exactly the 11 hunks the failure showed (the `Resume` bullet's `sourceChanged as SOURCE_CHANGED`, the `Task {N}` title line, the two `Source changed={SOURCE_CHANGED}` header flags, the `continue` rule in step 6, the `tasks tick --decision` block, the two `continue` routes in step 7, the new gate checklist line, the two `SOURCE_CHANGED = false` holds in Steps 8 and 10, and the `Hold SOURCE_CHANGED` line in Step 9 sub-step 5 plus its Step 10 sub-step 10 twin). Anything else in the diff means the source changed in a way this feature did not intend: stop and report it.
   - Confirm no other baseline moved: `git status --short .bkit/core/engine/render/__snapshots__/` lists only `bkit-build.none.txt`.
   - Commit the regenerated file with this feature's changes. No change to `.bkit/core/workflows/bkit-build.md` or `.bkit/core/engine/render/trackers.test.ts` is needed for this failure.
2. Re-run the whole gate, because bats, awake and the integration tier never ran in attempt 1 and are unverified.

## Out-of-Scope Recommendations

- `scripts/gate/bkit-gate-changed.mjs` — the `named` stage could also select tests that read `.bkit/core/workflows/*.md` by directory (for example, map any changed `.bkit/core/workflows/*.md` to `.bkit/core/engine/render/trackers.test.ts`), so a workflow edit reds the group gate instead of the final gate.
- `.bkit/core/engine/render/trackers.test.ts` — alternatively, list the five workflow sources by their literal repo paths (`.bkit/core/workflows/bkit-build.md` and so on) so the existing text-match selection finds the test; this is a test-shape change, not needed for this fix.
- `docs/testing.md` — document the none-render baselines in `.bkit/core/engine/render/__snapshots__/` and the `vitest -u` refresh after a reviewed workflow edit, so plan and build agents add the baseline to the change.
- `.bkit/core/docs/templates/bkit-plan.md` (or the planner prompt) — when a plan modifies a `.bkit/core/workflows/bkit-*.md` file, prompting for its generated companions (host mirrors via `bkit upgrade`, the none-render baseline) would stop this gap at plan time; offered for the owner to judge, not investigated.

## Blast Radius

Localised. The regenerated file is a test-only baseline: the only reader is `.bkit/core/engine/render/trackers.test.ts:417`; it is excluded from the npm package (`.bkit/core/engine/.npmignore:4` `__snapshots__`, asserted by `.bkit/core/engine/audits/repo/release-workflow.integration.test.ts:59` "tarball ships zero files under __snapshots__/"); `scripts/graphify/bkit-graphify-rollup.py` only names `__snapshots__` as a path pattern. No loader, schema, public contract or consumer surface reads it. Compatible.

## Suggested Tests

- Regression for the selection blind spot (only if the owner takes the out-of-scope `bkit-gate-changed.mjs` item): a test in `scripts/gate/` asserting that a changed `.bkit/core/workflows/bkit-build.md` selects `.bkit/core/engine/render/trackers.test.ts` in the `named` stage.
- No new test is needed for the fix itself: the existing `bkit-build: the none render matches its baseline byte for byte` test is the regression check once the baseline is current.

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/957-workflows-skip-re"
pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -t "bkit-build: the none render matches its baseline byte for byte" -u
git status --short .bkit/core/engine/render/__snapshots__/
git diff --stat .bkit/core/engine/render/__snapshots__/bkit-build.none.txt
CI=1 pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts
pnpm bkit:gate:static-unit-integration
```

Expected: the first command writes only `bkit-build.none.txt`; the isolated re-run reports `107 passed` with no failure; the whole gate exits 0, including the bats, awake and integration tiers that did not run in attempt 1.

## Documentation Warnings

```jsonl
{"topic": "testing", "gap": "docs/testing.md does not document the none-render baselines in .bkit/core/engine/render/__snapshots__/ or their vitest -u refresh", "recommendedPath": "docs/testing.md", "alternativeEvidence": ".bkit/core/engine/render/trackers.test.ts:408-413 comment and .bkit/core/.bkit/trackers.md:86 name the baselines and the refresh.", "action": "Add a row or paragraph naming the none-render baselines and the review-then-vitest -u step after a workflow source edit."}
```

## Hypotheses

### Hypothesis 1: The bkit-build none-render baseline is stale: this feature's intended edits to bkit-build.md were committed without regenerating the baseline

#### Reason

The failure is a byte-for-byte file-snapshot mismatch on the one workflow this feature modifies (plan `[MODIFY] .bkit/core/workflows/bkit-build.md`, TASK 4), while the four other workflow baselines pass.

#### Act

Read the failure diff in `run-tests-1.log` from line 2915; read `.bkit/core/engine/render/trackers.test.ts:403-420`; ran `git log --oneline 3e08269f7..HEAD -- .bkit/core/workflows/bkit-build.md` and the same for `.bkit/core/engine/render/__snapshots__/`; re-ran the five baseline tests in isolation with `CI=1 pnpm exec vitest run -c vitest.unit.config.ts .bkit/core/engine/render/trackers.test.ts -t "none render baselines"` (no `-u`; worktree unchanged afterwards).

#### Observe

```
Error: Snapshot `none render baselines > bkit-build: the none render matches its baseline byte for byte 1` mismatched
+    - For the verify list, title each item `Task {N}` from its `TASK {N}` gap line, so a decision tick finds the task. A gap with no task number gets its description as the title.
+    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
+     Set `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify` and `SOURCE_CHANGED` = false.
```
```
61fa81cdf chore(957-workflows-skip-re): plan-execute group 4 attempt 1
0d9627736 chore(957-workflows-skip-re): plan-gaps-remediate holistic attempt 3
79380f785 chore(957-workflows-skip-re): plan-execute group 3 attempt 1
43bebb914 chore(957-workflows-skip-re): plan-execute group 2 attempt 1
```
Commits touching `__snapshots__/` in the same range: `0`. Isolated re-run: `Tests  1 failed | 4 passed | 102 skipped (107)` with the same 11 hunks. Test comment: "A change that shows up here is a change to the none render: review it, then `vitest -u`."

#### Result

CONFIRMED — every hunk is a planned edit of this feature, four commits changed the source and zero changed the baseline, and the failure reproduces in isolation.

### Hypothesis 2: A misplaced tracker block in the new text breaks the none render (spurious stub or dropped words), so the source itself is wrong

#### Reason

Knowledge row `tracker-true-block-between-group-and-false-block-breaks-none-render` describes a none-render corruption caused by block placement, and the new text sits in the Decision Pause, which carries tracker blocks.

#### Act

Inspected every `+` line in the 11 hunks of the failure diff for a `_No tracker connected, skip step._` stub, a leftover `<!-- bkit:tracker` marker, or words missing against the source diff `git diff 3e08269f7 HEAD -- .bkit/core/workflows/bkit-build.md`.

#### Observe

The `+` lines are plain prose matching the source edits, for example `+    Exit 1 means the attempt changed no source file. Hold \`SOURCE_CHANGED\` = true on exit 0, else false.`; no hunk contains `No tracker connected` or a `bkit:tracker` marker.

#### Result

REFUTED — the received render is the intended text; the defect is the stale baseline, not the render or the source.

### Hypothesis 3: The renderer or a shared clause in .bkit/instructions.md changed and altered the none render outside this feature's intended edits

#### Reason

`.bkit/instructions.md` changed on this branch (commit `3301ff358`), and the test comment says shared clauses show up in the none render.

#### Act

Ran `git diff --stat 3e08269f7 HEAD -- .bkit/instructions.md .bkit/core/engine/render/trackers.ts` and read the `.bkit/instructions.md` diff.

#### Observe

```
 .bkit/instructions.md | 16 ++++++++++++----
 1 file changed, 12 insertions(+), 4 deletions(-)
```
`trackers.ts` is unchanged. The `.bkit/instructions.md` diff is the index copy of the same `bkit-build` sentences (for example `+**If** \`DECISION_ROUTE\` = \`continue\` **and** \`From: holistic\` → Step 11.`) plus the drift line `bkit-build:445` → `bkit-build:458` and one new invariant row; the renderer does not read this file, and the design, plan, debug and ship baselines all pass.

#### Result

REFUTED — no renderer change; the instructions index only mirrors the build edits, and nothing outside `bkit-build.md` moved a none render.

### Hypothesis 4: The changed-files gate cannot select trackers.test.ts for a workflow edit, which is why the drift reached the full gate

#### Reason

The build ran only named or changed test files while working (features 920 and 951), yet this test first failed at the whole-suite gate.

#### Act

Read `scripts/gate/bkit-gate-changed.mjs:4-10` and `:43-58`; ran `grep -c -F 'bkit-build.md' .bkit/core/engine/render/trackers.test.ts` and `grep -c -F '.bkit/core/workflows/bkit-build.md' .bkit/core/engine/render/trackers.test.ts`; corroborated with `git grep -l -F -e 'bkit-build.md' -- '*.test.ts'`.

#### Observe

`related  → vitest related --run: the Vitest tests that import a changed file` and `named    → each test file that names a changed path`. Both greps on `trackers.test.ts` print `0`; the corroborating `git grep` returns other test files (`.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` and more) but not `trackers.test.ts`. The test reads the source via `fs.readFileSync(path.join(REPO_ROOT, ".bkit", "core", "workflows", \`${wf}.md\`)`.

#### Result

CONFIRMED — neither the import graph nor the text match links `trackers.test.ts` to `bkit-build.md`, so only the full gate can catch this drift (recorded as the `tests` rot signal; the fix sits out of scope).
