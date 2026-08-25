Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

### F1 — [HIGH] [mechanical] D24 landed-body scan misses 3 of GitHub's 5 CI-suppression tokens

- **Location:** `.bkit/scripts/bkit-runtime.sh:427` (`bkit_close_guard_scan_body`)
- **Detail:** The regex is `grep -qE '\[skip ci\]|\[skip actions\]'`. GitHub Actions skips a run on ANY of five tokens: `[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`. This guard only matches 2 of the 5.
- **Exploit scenario:** `bkit_close_guard_scan_body` is the D24 authoritative post-close scan of the LANDED squash-merge body — the guard whose entire reason for existing is D1 (a suppression token leaking into a concatenated squash BODY that silently killed CI on `dev`). A squash body containing `[ci skip]`, `[no ci]`, or `[actions skip]` returns rc=0 "clean", `SCAN_RESULT="clean"`, the close proceeds, and CI is silently suppressed on `dev` — the exact failure class the effort exists to eliminate. Note the SAME workflow checks all five tokens two lines away in its pre-checks (`bkit-build.md:1331,1357,1371`; identical in `bkit-debug.md`/`bkit-ship.md`), so the authoritative post-close guard is strictly narrower than the advisory pre-checks — an internal inconsistency, not just an omission. For a `dispatched` close (CI_OUTCOME=found) `bkit_close_guard_scan_body` is the ONLY body scan that runs.
- **Suggested fix:** Widen the regex to the full set, matching the workflow's own pattern: `grep -qiE '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'` (and add `-i` for case-insensitivity to match the `-iEq` used at the call sites).

### F2 — [HIGH] [mechanical] bkit_wait_ci hard-depends on `timeout`, absent on stock macOS (mode-1 primary runtime) → false blocked-sleep abort

- **Location:** `.bkit/scripts/bkit-runtime.sh:313` (`bkit_wait_ci`)
- **Detail:** `if ! timeout "$((_bwc_interval + 5))" sleep "$_bwc_interval"; then ... CI_WAIT_RESULT="err"; return 2`. `timeout(1)` is GNU coreutils and is NOT present on a stock macOS userland (BSD). This shim ships to consumers via `bkit install`. On a Mac without coreutils, `timeout` returns 127 (command not found), the `if !` branch fires, and the code declares "sleep did not return ... blocked/foreground-sleep-restricted runtime" — misdiagnosing a missing binary as a blocked sleep.
- **Exploit scenario:** On a mode-1 macOS laptop (CAN_SLEEP=true, the primary dev runtime — this repo's own env is darwin), every CI-Dispatch Gate poll in build/debug/ship close aborts with `CI_WAIT_RESULT="err"` on the first iteration. Because CI_WAIT_ALL_ERRORED is "false" (the gh poll itself succeeded before the sleep), the caller (`bkit-build.md:1353`) skips the gh-error branch and falls into the re-trigger path — an empty `chore: re-trigger` commit + force-push — then calls `bkit_wait_ci` again, which errors again. The gate never reaches a clean verdict on macOS-without-coreutils, and it emits a spurious empty commit + force-push. (This machine happens to have homebrew `timeout`, masking it here — consumers without it break.)
- **Suggested fix:** Resolve a timeout binary once (`_TO=$(command -v timeout || command -v gtimeout)`), and when none exists fall back to a plain `sleep "$_bwc_interval"` (the pre-#341 inline behaviour) rather than treating its absence as a blocked-sleep abort. Only classify as blocked when a real timeout wrapper actually times out.

## Notes / out-of-lens

- Prose-heavy workflow header edits (adopt-or-mint, tracker blocks) reviewed for control-flow bugs only; wording/doctrine is out of this lens.
- `bkit_runtime_row`/`bkit_transport_fallback_row` JSON emission escapes `"` but not backslashes/control chars in `ghProbeErr`; single-line `tail -n1` input makes malformed JSON unlikely — LOW, not logged as a failure.
