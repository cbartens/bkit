Verdict: PASS
Failures: 0
Fixable: false
Tasks: 8, 9

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 4`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-4-1.md` (attempt 1: PASS, tasks 8, 9). Group gate `build-group-gate-4-1.md` then failed one test: `local-stack-lock.integration.test.ts` > "the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder" got the empty-reply error ("the perl process holding it stopped before it answered") instead of the `timeout` reply. `build-plan-gaps-remediate-4-1-log.md` (PASS, Fixed: 1) changed `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` in commit `2045c6af8`.

## Notes

- Judged against `build-diff-4-2.md` and HEAD `2045c6af8`; tree clean apart from untracked step logs. Since `01394550e` no file under `.bkit/core/engine`, `.bkit/core/.bkit`, `.bkit/core/.agents` or `dist` changed, and `local-stack-lock.integration.test.ts` is untouched; the remediation commit touches only the lock script plus its own log and `status.jsonl`.
- **Remediation judgment — justified, minimal, safe root-cause fix; the test is not weakened.** The reply loop reads the fifo with a 1s timeout, then checks `kill -0` on the perl holder. Perl writes `timeout <holder>\n` and exits; if that lands after the read times out but before `kill -0`, the old `|| break` threw away a reply already sitting in the pipe. The fifo stays open read-write on fd 3, so the buffered line survives perl's exit; the added single `read -r -t 1` after the holder is found gone picks it up. Effect when perl truly died without answering: the same empty-reply error path, 1s later. No other path changes; no assertion, timeout or test input touched. The script is `#!/bin/bash`, and the new line uses the same `read -t` form as the existing loop. bkit's own repo does not adopt this template (`dogfood-templates.test.ts` marks `scripts/ci/bkit-local-stack-lock.sh` `not-adopted`), so no dogfood copy needs syncing.
- Targeted run: `pnpm vitest run .bkit/core/engine/commands/install/uninstall.test.ts .bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` → 2 files, 110 passed (94 + 16), 17.6s, under load average 68.5 on 10 cores (heavier load than the failing gate run).
- **TASK 8:** `grep -n lite.md .bkit/core/.bkit/README.md .bkit/core/.agents/docs.md` prints nothing (exit 1). Holds.
- **TASK 9:** `CORE_TEMPLATE_DOCTRINE` still carries the `.bkit/lite.md` entry and the corrected `.agents/shortcuts.md` comment; `dist/commands/install/uninstall.js:263-264` matches; `uninstall.test.ts` passes. `pnpm build` not re-run per mandate; the committed `dist/` diff matches source, as attempt 1 found. Holds.
- **Test-first audit (`build-tests-green-4-2.md`):** `Enforced: true`, 1 gap, Task 9 `test-changed` (`Changed since red` = `test body`). The diff is the same formatter re-wrap of one `writeFile(...)` call that attempt 1 ruled on; inputs, path, template and all three `expect` lines are unchanged → no gap.
- `build-plan-current.md` affects only Task 15 (group 7) → not this group. `build-decision-1-1.md` covers group 3 → not applied here.
- No new error paths in tasks 8 / 9 → no `docs/observability.md` obligation; the remediation reuses the existing error message. No `Documentation Updates` row is owned by this group.
- Full suite not run, per caller instruction (targeted tests only); the group gate re-run owns it.

## Identified Gaps Log

None
