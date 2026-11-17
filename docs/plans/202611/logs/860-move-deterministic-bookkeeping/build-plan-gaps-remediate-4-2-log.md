Verdict: PASS
Strategy: PIVOT
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 3: restored nested verdict/count bullets in 11 prompts (.bkit/core/prompts); instructions check exits 0
DONE — Gap 4: bkit-debug.md dev-push `runs handoff` now passes an empty `--pr` and `--head` (.bkit/core/workflows/bkit-debug.md)
DONE — Gap 2: Result files and `steps stub --result-file` render blocks wired at all 13 caller sites in bkit-build, bkit-debug, bkit-ship, bkit-design, bkit-plan (plan Task 9 requires engine result callers, so the prompt branches stay)
DONE — Gap 1: `status invocation` plus `--invocation`/`--operation` in design and plan decision appends, plan-generate, ship deferred-sweep (book-root status file); the bkit-auto claim is now true
DONE — Registry: .bkit/instructions.md entries and clause updated by hand; instructions test 102/102 pass; pnpm build and cli:sync clean
