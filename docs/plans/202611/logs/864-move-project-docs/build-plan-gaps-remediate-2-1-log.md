Verdict: FAIL
Strategy: STANDARD
Fixed: 3

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap 1: TASK 5 `tools.test.ts` `resolves an indexed equivalent without a missing default warning` — the failure is line 576 `vi.spyOn(fs, "readFileSync")` on the `import * as fs from "node:fs"` namespace ("Cannot spy on export", vitest 5 ESM); it throws before the detector runs, so only an edit to the recorded planned test fixes it, which this step must not do (a copy with the spy stubbed passes 36/36)
DONE — Gap 2: TASK 6 shipped-shape warning records — summary.ts now scans the jsonl fence for balanced multi-line JSON objects (string-aware, an unterminated object does not swallow later records); new test "reads pretty-printed and one-line warning records from a jsonl fence" added at the end of summary.test.ts, 43/43 pass (.bkit/core/engine/commands/workflow/summary.ts)
DONE — Gap 3: TASK 3 debug handover — bkit-debug-abort-handover.md gains a step that copies deduped Documentation Warnings records from the run logs (not raw inputs) into a new "Documentation Warnings" output section; instructions registry entry added, bkit:generate re-run, mirrors refreshed (.bkit/core/prompts/bkit-debug-abort-handover.md)
DONE — Gap 4: TASK 7 scratch consumer matrix with dist/cli.js in scratchpad repos: fresh `install --claude` exit 0 (docs/ holds only templates/, no project docs written; advisory project-docs-missing lists all ten paths); `check` exit 0; after adopting docs/security.md (starter) and docs/testing.md (edited) check exit 0 with project-docs-unpopulated (security.md) and project-docs-unindexed (testing.md); `upgrade` exit 0 (updated 0, conflicts 0) registered both rows in .agents/docs.md Project Documents; `uninstall` exit 0 kept docs/security.md and docs/testing.md (custom note intact). Legacy repo with real docs/architecture.md and testing.md: install exit 0 indexed both rows, check exit 0 (missing advisory only for the rest), upgrade exit 0 registered the new docs/security.md and left architecture.md content unchanged, uninstall exit 0 kept all three docs. Logs in scratchpad fresh-*.log, legacy-*.log
DONE — Group gate: not run; targeted run of render, commands/workflow, checks/after, audits: 138 files passed, 1 failed (the blocked Gap 1 test), 6225 passed
