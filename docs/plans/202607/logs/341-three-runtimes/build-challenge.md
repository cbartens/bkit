Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Reconciled from two lenses: build-challenge-1 (bugs / edge cases) and build-challenge-2 (security). Two total reviewers. No CRITICAL; max severity HIGH → CONCERNS. All four findings sit at distinct `file:line` with distinct root causes — no merges; each carries single-reviewer attribution (normal, not outvoted).

## Findings

### F1 — [HIGH] [mechanical] D24 landed-body scan misses 3 of GitHub's 5 CI-suppression tokens

- **Lens:** bugs / edge cases
- **Location:** `.bkit/scripts/bkit-runtime.sh:427` (`bkit_close_guard_scan_body`)
- **Detail:** The guard is `grep -qE '\[skip ci\]|\[skip actions\]'` — it matches only 2 of the 5 tokens GitHub Actions honours (`[skip ci]`, `[ci skip]`, `[no ci]`, `[skip actions]`, `[actions skip]`). This is the D24 authoritative post-close scan of the LANDED squash-merge body — the guard whose sole purpose (D1) is to catch a suppression token leaking into a concatenated squash body that silently kills CI on `dev`. The SAME workflow already checks all five tokens two lines away in its advisory pre-checks (`bkit-build.md:1331,1357,1371`; mirrored in `bkit-debug.md` / `bkit-ship.md`), so the authoritative post-close guard is strictly narrower than the advisory pre-checks — an internal inconsistency, not just an omission.
- **Exploit scenario:** A squash body containing `[ci skip]`, `[no ci]`, or `[actions skip]` returns rc=0, `SCAN_RESULT="clean"`, the close proceeds, and CI is silently suppressed on `dev` — the exact failure class the effort exists to eliminate. For a `dispatched` close (CI_OUTCOME=found) this is the ONLY body scan that runs.
- **Suggested fix:** Widen the regex to the full set and add case-insensitivity to match the call-site `-iEq`: `grep -qiE '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'`.
- **agreement: 1/2**

### F2 — [HIGH] [mechanical] bkit_wait_ci hard-depends on `timeout`, absent on stock macOS (mode-1 primary runtime) → false blocked-sleep abort

- **Lens:** bugs / edge cases
- **Location:** `.bkit/scripts/bkit-runtime.sh:313` (`bkit_wait_ci`)
- **Detail:** `if ! timeout "$((_bwc_interval + 5))" sleep "$_bwc_interval"; then ... CI_WAIT_RESULT="err"; return 2`. `timeout(1)` is GNU coreutils and is NOT on a stock macOS (BSD) userland; this shim ships to consumers via `bkit install`. On a Mac without coreutils, `timeout` returns 127 (command not found), the `if !` branch fires, and the code misdiagnoses a missing binary as a "blocked/foreground-sleep-restricted runtime" (D22 abort).
- **Exploit scenario:** On a mode-1 macOS laptop (CAN_SLEEP=true, the primary dev runtime — this repo's own env is darwin), every CI-Dispatch Gate poll in build/debug/ship close aborts with `CI_WAIT_RESULT="err"` on the first iteration. Because CI_WAIT_ALL_ERRORED stays `false` (the gh poll succeeded before the sleep), the caller (`bkit-build.md:1353`) skips the gh-error branch and falls into the re-trigger path — an empty `chore: re-trigger` commit + force-push — then re-enters `bkit_wait_ci`, which errors again. The gate never reaches a clean verdict and emits spurious force-pushed empty commits. (This machine has homebrew `timeout`, masking it here; consumers without it break.)
- **Suggested fix:** Resolve a timeout binary once (`_TO=$(command -v timeout || command -v gtimeout)`); when none exists, fall back to a plain `sleep "$_bwc_interval"` (the pre-#341 inline behaviour) rather than treating its absence as a blocked-sleep abort. Only classify as blocked when a real timeout wrapper actually times out.
- **agreement: 1/2**

### F3 — [LOW] [mechanical] Command injection via branch name in close-guard EXIT trap

- **Lens:** security
- **Location:** `.bkit/scripts/bkit-runtime.sh:383` (`bkit_close_guard_checkout`); mirrored in `.bkit/templates/.bkit/scripts/bkit-runtime.sh:383`
- **Detail:** `BKIT_CLOSE_GUARD_ORIG_BRANCH=$(git branch --show-current)` is string-interpolated into `trap "git checkout '$BKIT_CLOSE_GUARD_ORIG_BRANCH' >/dev/null 2>&1 || true" EXIT` (SC2064 deliberately disabled to expand now). `git check-ref-format` permits `'`, `$`, `(`, `)`, `;`, `&` in branch names (only space, `~^:?*[\` and controls are barred). A branch named e.g. `x'$(cmd)'` breaks out of the single-quotes when the trap body is re-parsed, executing `cmd` at process exit — a violation of the "never interpolate a variable into a shell-interpreted string" doctrine in `docs/security.md` § Shell Injection applied to `trap`/eval.
- **Exploit scenario:** In mode 1/2 (the only modes where the `CAN_WORKTREE=true && CAN_PUSH_DEV=true` double-guard passes and this path runs), the current branch can be an externally-named PR head. A contributor names their head branch with an embedded `$(...)`/`;` payload; when the close guard installs the EXIT trap and the block exits, the payload runs in the runner with `GH_BKIT_TOKEN` in the environment. Bounded to collaborator-vs-collaborator per the existing trust model → LOW.
- **Suggested fix:** Do not build the trap body by interpolation. Single-quote the trap so the variable resolves at fire time, never re-parsed as literal branch text: `trap 'git checkout "$BKIT_CLOSE_GUARD_ORIG_BRANCH" >/dev/null 2>&1 || true' EXIT`. Optionally validate the branch via `git check-ref-format --branch` first.
- **agreement: 1/2**

### F4 — [LOW] [architectural] Marker-primary FID reorder elevates untrusted PR-body input for filesystem path construction

- **Lens:** security
- **Location:** `.bkit/workflows/bkit-auto.md:9-10` (steps 9-10, D9 reorder); FID subsequently interpolated into `docs/plans/{YYYYMM}/logs/{FID}/...` and `.worktrees/{FID}` paths across workflows
- **Detail:** D9 makes the PR-body marker (`<!-- bkit:fid={FID} -->`) the PRIMARY FID source, ahead of the `feat/`-derived branch fallback. Per `docs/security.md` § CI Auto-Route Trust, the PR body is only collaborator-trusted (triage/write, not commit-signed). FID flows into filesystem paths with no documented validation that it is a bare slug (no `/`, `..`), so a marker like `bkit:fid=../../elsewhere` could redirect status/worktree writes outside the intended log directory. The marker-parse path predates this diff; the reorder only raises its precedence → LOW.
- **Exploit scenario:** A collaborator with PR-edit rights sets a traversal FID in the body marker; bkit-auto adopts it as primary and downstream steps write `status.jsonl` / artifacts to an attacker-chosen path. Confined to collaborator-vs-collaborator per the existing trust model.
- **Suggested fix:** Validate the parsed FID against a strict slug allowlist (e.g. `^[a-z0-9][a-z0-9-]*$`, rejecting `/` and `..`) before it builds any path, in the same step it is extracted (step 9). Record the constraint alongside the marker-trust text in `docs/security.md` § CI Auto-Route Trust.
- **agreement: 1/2**

## Out-of-lens notes (informational — NOT counted as findings)

Both reviewers explicitly logged these as sub-failure context; carried forward for the fix workflow's awareness, excluded from the Failures count.

- **build-challenge-1 (bugs):** `bkit_runtime_row` / `bkit_transport_fallback_row` JSON emission escapes `"` but not backslashes / control chars in `ghProbeErr`; single-line `tail -n1` input makes malformed JSON unlikely → LOW, not logged as a failure.
- **build-challenge-2 (security):** `.mcp.json` / `.bkit/templates/.mcp.json` add `actions` to `X-MCP-Toolsets` under the same broad `GH_BKIT_TOKEN` — no new secret or token scope (design C1; token isolation unchanged), but it enlarges the tool surface reachable while reading untrusted issue/PR/comment bodies. Injection hardening is explicitly owned by #342 (plan § Security).
