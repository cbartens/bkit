Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, RLS / tenancy.

## Findings Log

### F1 — LOW · mechanical — command injection via branch name in EXIT trap

- **Location:** `.bkit/scripts/bkit-runtime.sh:383` (`bkit_close_guard_checkout`), mirrored in `.bkit/templates/.bkit/scripts/bkit-runtime.sh:383`.
- **Issue:** `BKIT_CLOSE_GUARD_ORIG_BRANCH=$(git branch --show-current)` is expanded into a `trap "git checkout '$BKIT_CLOSE_GUARD_ORIG_BRANCH' >/dev/null 2>&1 || true" EXIT` string. `git check-ref-format` permits `'`, `$`, `(`, `)`, `;`, `&` in branch names (only space, `~^:?*[\` and controls are barred). A branch named e.g. `x'$(cmd)'` breaks out of the single-quotes when the trap body is re-parsed, executing `cmd` at process exit. This is exactly the "never interpolate a variable into a shell-interpreted string" doctrine in `docs/security.md` § Shell Injection, applied to `trap`/eval.
- **Exploit scenario:** In mode 1/2 (the only modes where the double-guard `CAN_WORKTREE=true && CAN_PUSH_DEV=true` passes and this code path runs), the current branch can be an externally-named PR head branch (mode 2 CI). A contributor names their head branch with an embedded `$(...)`/`;` payload; when bkit's close guard installs the EXIT trap and the block exits, the payload runs in the runner with `GH_BKIT_TOKEN` in the environment.
- **Suggested fix:** Do not build the trap body by string-interpolation. Store the branch in a variable and reference it inside a single-quoted trap that expands at trap-fire time, e.g. `trap 'git checkout "$BKIT_CLOSE_GUARD_ORIG_BRANCH" >/dev/null 2>&1 || true' EXIT` (single-quoted so `$BKIT_CLOSE_GUARD_ORIG_BRANCH` is resolved when the trap fires, never re-parsed as literal branch text). Optionally validate the branch against `git check-ref-format --branch` first.

### F2 — LOW · architectural — marker-primary FID reorder elevates untrusted PR-body input for filesystem path construction

- **Location:** `.bkit/workflows/bkit-auto.md:9-10` (steps 9-10, D9 reorder); FID subsequently interpolated into `docs/plans/{YYYYMM}/logs/{FID}/...` and `.worktrees/{FID}` paths across workflows.
- **Issue:** D9 makes the PR-body marker (`<!-- bkit:fid={FID} -->`) the PRIMARY FID source, ahead of the `feat/`-derived branch fallback. Per `docs/security.md` § CI Auto-Route Trust, the PR body is only collaborator-trusted (triage/write, not commit-signed). FID flows into filesystem paths with no documented validation that it is a bare slug (no `/`, `..`), so a marker like `bkit:fid=../../elsewhere` could redirect status/worktree writes outside the intended log directory.
- **Exploit scenario:** A user/collaborator with PR-edit rights sets a traversal FID in the body marker; bkit-auto adopts it as primary and downstream steps write `status.jsonl`/artifacts to an attacker-chosen path. Confined to collaborator-vs-collaborator per the existing trust model, and the marker-parse path predates this diff — the reorder only raises its precedence.
- **Suggested fix:** Validate the parsed FID against a strict slug allowlist (e.g. `^[a-z0-9][a-z0-9-]*$`, reject `/` and `..`) before it is used to build any path, in the same step it is extracted (step 9). Note the constraint alongside the marker-trust text in `docs/security.md` § CI Auto-Route Trust.

### Note (informational, out of primary lens) — `actions` MCP toolset widens the lethal-trifecta surface

- `.mcp.json` / `.bkit/templates/.mcp.json` add `actions` to `X-MCP-Toolsets` under the same broad `GH_BKIT_TOKEN`. No new secret or token scope is introduced (design C1; token isolation per `docs/security.md` § Supply-Chain unchanged), but it enlarges the tool surface reachable while reading untrusted issue/PR/comment bodies (§5a). Injection hardening is explicitly owned by #342 (plan § Security) — recorded, not counted as a finding here.
