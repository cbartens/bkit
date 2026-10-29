Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 15

<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Group diff = HEAD commit `54e7b83e8` (plan-execute group 8 attempt 1), per `build-diff-8-1.md`: mirrors `.bkit/workflows.md`, `.bkit/jsonl.md`, `.bkit/authoring.md`, the four `bkit-build` host copies + two `SKILL.md` copies (build Step 4 skip row from TASK 7), `.bkit/version` hashes, `docs/capabilities.md`, `docs/testing.md`. No `dist/` change: the committed payload already matched.
- TASK 15 DONE WHEN, re-run here:
  - `bash scripts/graphify/bkit-graphify.sh check-at HEAD` (clean checkout of HEAD, rebuilt graph, writes nothing tracked) exit 0: "docs/capabilities.md matches a rebuild at 54e7b83e8" — stronger than a second `graph:rollup` on the local graph.
  - dist: `tsc --outDir {scratch}` exit 0, `diff -r {scratch} dist` identical (equivalent of `bkit:check:dist` without deleting tracked `dist/`).
  - `pnpm bkit check` exit 0 (12 advisories, no drift); `.bkit/core/.bkit/{workflows,jsonl,authoring}.md` vs `.bkit/` mirrors differ only on line 3, the managed marker.
- Test-first audit `build-tests-green-8-1.md`: `Enforced: true`, `Gaps: 0`; TASK 15 is `TEST FIRST: n/a` (generated artifacts).
- Plan currency `build-plan-current.md`: PASS, 0 affected. No group 8 decision record; `build-decision-1-{1..7}.md` cover earlier groups only.
- TASK 15 DONE WHEN holds, so it is on the `Tasks` line; the one gap is a side effect of its closing sweep (gap 1) — a group 7 doc clause placed inside the managed block of `docs/testing.md` was reverted to the shipped source.
- Full suite not re-run (group scope; diff is markdown and generated files only).

## Identified Gaps Log

1. TASK 15 [docs/testing.md] closing-sweep `bkit upgrade` re-rendered the managed block of docs/testing.md from `.bkit/shared/docs/testing.md` and dropped the group 7 remediation clause "(this repo's `scripts/ci/test-file.sh` also routes a `*.bats` file to `bats --report-formatter junit`)" (it sat inside `bkit:start`/`bkit:end`, line 256, not in the source); `scripts/ci/test-file.sh` still routes `*.bats` (package.json `bkit:test:file`), so the behaviour is now undocumented. Fix: restate it below `bkit:end` (e.g. § Stack, beside the bats line), never in the stack-agnostic source — Fixable: true
