Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-8-1.md` (CONCERNS, 1 gap: `docs/testing.md` lost the `scripts/ci/test-file.sh` bats clause); remediated by `build-plan-gaps-remediate-8-1-log.md` (PASS) — clause now in § Stack, line 451, below `bkit:end` (line 446): resolved.

## Notes

- Group diff = `build-diff-8-2.md` (from rebased group-7 gate `a0ebe4162` to HEAD `87abdf8e0`): bkit-build host copies + two `SKILL.md` copies, `.bkit/{authoring,jsonl,workflows}.md` mirrors, `.bkit/version`, `completeness.ts` `use: "by-hand"` + `dist/commands/workflow/completeness.js`, `docs/capabilities.md`, `docs/testing.md`. Tree clean except run logs; the remediation is committed (`87abdf8e0`), so `check-at HEAD` covers it.
- TASK 15 DONE WHEN, re-run on the current tree:
  - `pnpm bkit check` exit 0 (12 advisories, no drift); `.bkit/core/.bkit/{workflows,jsonl,authoring}.md` vs `.bkit/` mirrors differ only on line 3, the managed marker: holds.
  - dist: `tsc --outDir {scratch}` exit 0, `diff -rq {scratch} dist` identical (equivalent of `bkit:check:dist` without deleting tracked `dist/`): holds.
  - capabilities: `bash scripts/graphify/bkit-graphify.sh check-at HEAD` exit 1, drift (gap 1). `check-at dev` (`91c6d3c6e`) exit 0, so the drift entered with `2d99a1c64`. Fails.
- Full suite `pnpm exec vitest run`: 211/212 files pass; `cli-doc.test.ts` fails (gap 2), introduced by the `completeness` command reaching the generated `.bkit/cli.md` region after the rebase.
- Test-first audit `build-tests-green-8-2.md`: `Enforced: true`, `Gaps: 0`; TASK 15 is `TEST FIRST: n/a`.
- Plan currency `build-plan-current.md`: PASS, 0 affected. `build-decision-1-8.md` is the VERIFY_LOOP retry decision, accepts no gap.
- TASK 15 left off the `Tasks` line: its capabilities DONE WHEN item fails and it leaves a broken test.

## Identified Gaps Log

1. TASK 15 [docs/capabilities.md] `bash scripts/graphify/bkit-graphify.sh check-at HEAD` exits 1 at `87abdf8e0` ("DRIFT: docs/capabilities.md is not what this tree produces"): the module-diagram edge weights differ from a clean rebuild (e.g. `commands_workflow_issues -> tracker` 33 committed vs 37 rebuilt, `commands_lib -> ledgers_journal` 12 vs 13, `workflows -> run_facts` 29 vs 30); the register was regenerated in `2d99a1c64` from a local `graph.json` @ `ddec1f064` that does not match the rebased tree. Dev `91c6d3c6e` (merge base) passes `check-at`, so the drift is this branch's; installed graphify 0.9.93 matches the pinned spec. CI (`.github/workflows/bkit-ci.yml` graphify step) and pre-push run this gate. Fix: `pnpm graph:refresh`, commit `docs/capabilities.md` — Fixable: true
2. TASK 15 [.bkit/core/.bkit/cli.md, .bkit/cli.md] full suite (`pnpm exec vitest run`: 1 failed / 8324 passed) fails `.bkit/core/engine/tools/cli-doc.test.ts` > "the generated region of .bkit/cli.md is current (run pnpm cli:sync)": the generated region of `.bkit/core/.bkit/cli.md` lacks the `### completeness` section with the `check` | by hand | **`--file`** `--workflow` row that `completenessCommand` (now `use: "by-hand"`, `2d99a1c64`) produces; not caught by `pnpm bkit check` because the mirror matches its stale source. Fix: `pnpm cli:sync`, then `bkit install` to regenerate the `.bkit/cli.md` mirror, commit both — Fixable: true
