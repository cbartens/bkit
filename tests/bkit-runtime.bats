#!/usr/bin/env bats
# bkit-runtime.bats — Unit tests for bkit-runtime.sh (#341 T3/T7/T9/T15 / WS-6/WS-8/WS-10/WS-15).
#
# Covers Derived Test Matrix rows 1-5, 7-9:
#   1. bkit_runtime_detect maps env inputs -> RUNTIME + 4 CAN_* per the
#      4-row table; unknown (no primitive) -> least-capable, never mode-1.
#   2. Sourced shim state does NOT survive a Bash-call boundary; env-only
#      flags re-derive per block; RUNTIME_GITHUBCLI round-trips through the
#      runtime-resolved row (D21).
#   3. Shim-source failure / an unset CAN_* is loud + distinguishable from
#      an explicit false (Flow 1 emptiness checks; distinct reason).
#   4. WORKTREE_PATH resolves mint (RUNTIME_WORKTREES=true ->
#      $REPO_ROOT/.worktrees/{FID}) vs adopt (false -> $REPO_ROOT).
#   5. bkit_wait_ci's `timeout`-wrapped cap fires on a blocked/never-returning
#      `sleep` (never hangs); attempt/elapsed bounds enforced (D22).
#   7. D24 post-close scan flags [skip ci] in the LANDED commit body (any
#      transport) -> Failure Path.
#   8. D25 cross-check: runtime-resolved.RUNTIME_GITHUBCLI=false + a mapped-tool close
#      with NO transport-fallback row -> Failure Path (reads real
#      status.jsonl).
#   9. D23 double-guard: the local-checkout branch requires
#      RUNTIME_WORKTREES=true AND RUNTIME_DEVPUSHES=true; trap restores the original
#      branch on exit.
#
# Run: bats tests/bkit-runtime.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# Template-relative by default (same convention as tests/counter-bus.bats):
# every code task in this feature edits .bkit/templates/.bkit/scripts/, and
# `bkit install` (which produces the installed .bkit/scripts/ mirror) is
# deferred to the batch mirror regen (Sub-Plan 6). An installed-copy default
# would make this suite unrunnable until then.
RUNTIME_SH="${BKIT_RUNTIME_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-runtime.sh}"

# A fake `gh` on PATH so RUNTIME_GITHUBCLI is deterministic across test environments
# (real gh auth may or may not be logged in on the machine running bats).
setup() {
  unset GIT_DIR GIT_WORK_TREE GIT_QUARANTINE_PATH
  FAKE_BIN="$(mktemp -d)"
  cat >"$FAKE_BIN/gh" <<'EOF'
#!/usr/bin/env sh
if [ "$1" = "auth" ] && [ "$2" = "status" ]; then
  if [ "${FAKE_GH_AUTH_OK:-1}" = "1" ]; then
    echo "Logged in to github.com" >&2
    exit 0
  else
    # FAKE_GH_ERR lets a test drive the exact stderr text the shim captures into
    # RUNTIME_GITHUBCLI_ERR — needed to cover error messages containing
    # characters that must be JSON-escaped (backslashes, quotes).
    # `printf '%s\n'`, never `echo`: POSIX echo expands backslash escapes, and
    # `\c` would silently truncate the very messages these tests exist to carry.
    printf '%s\n' "${FAKE_GH_ERR:-You are not logged into any GitHub hosts}" >&2
    exit 1
  fi
fi
exit 1
EOF
  chmod +x "$FAKE_BIN/gh"
}

teardown() {
  rm -rf "$FAKE_BIN"
}

# ---------------------------------------------------------------------------
# 1. RUNTIME + CAN_* table mapping
# ---------------------------------------------------------------------------

@test "detect: local (no primitives) -> RUNTIME=LOCAL, RUNTIME_WORKTREES/RUNTIME_DEVPUSHES=true" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s RUNTIME_WORKTREES=%s RUNTIME_DEVPUSHES=%s\n' \"\$RUNTIME\" \"\$RUNTIME_WORKTREES\" \"\$RUNTIME_DEVPUSHES\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=LOCAL"* ]]
  [[ "$output" == *"RUNTIME_WORKTREES=true"* ]]
  [[ "$output" == *"RUNTIME_DEVPUSHES=true"* ]]
}

@test "detect: GITHUB_ACTIONS=true -> RUNTIME=GITHUB_ACTION, CAN_*=true" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 GITHUB_ACTIONS=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s RUNTIME_WORKTREES=%s RUNTIME_DEVPUSHES=%s\n' \"\$RUNTIME\" \"\$RUNTIME_WORKTREES\" \"\$RUNTIME_DEVPUSHES\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=GITHUB_ACTION"* ]]
  [[ "$output" == *"RUNTIME_WORKTREES=true"* ]]
  [[ "$output" == *"RUNTIME_DEVPUSHES=true"* ]]
}

@test "detect: CI=true -> RUNTIME=GITHUB_ACTION (CI is also a mode-2 primitive)" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 CI=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s\n' \"\$RUNTIME\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=GITHUB_ACTION"* ]]
}

@test "detect: CLAUDE_CODE_REMOTE=true -> RUNTIME=CLOUD_CLAUDE, CAN_*=false" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 CLAUDE_CODE_REMOTE=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s RUNTIME_WORKTREES=%s RUNTIME_DEVPUSHES=%s\n' \"\$RUNTIME\" \"\$RUNTIME_WORKTREES\" \"\$RUNTIME_DEVPUSHES\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=CLOUD_CLAUDE"* ]]
  [[ "$output" == *"RUNTIME_WORKTREES=false"* ]]
  [[ "$output" == *"RUNTIME_DEVPUSHES=false"* ]]
}

@test "detect: explicit falsy primitives (GITHUB_ACTIONS=false / CI=false) mean ABSENCE -> RUNTIME=LOCAL, full capability" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 GITHUB_ACTIONS=false CI=false REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s RUNTIME_WORKTREES=%s RUNTIME_DEVPUSHES=%s\n' \"\$RUNTIME\" \"\$RUNTIME_WORKTREES\" \"\$RUNTIME_DEVPUSHES\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=LOCAL"* ]]
  [[ "$output" == *"RUNTIME_WORKTREES=true"* ]]
  [[ "$output" == *"RUNTIME_DEVPUSHES=true"* ]]
}

@test "detect: a non-truthy non-falsy primitive (CI=banana) -> RUNTIME=UNKNOWN, least-capable" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 CI=banana REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s RUNTIME_WORKTREES=%s\n' \"\$RUNTIME\" \"\$RUNTIME_WORKTREES\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=UNKNOWN"* ]]
  [[ "$output" == *"RUNTIME_WORKTREES=false"* ]]
}

@test "detect: the .bkit/.runtime-cursor marker resolves CLOUD_CURSOR with GITHUB_ACTION-equivalent capability" {
  REPO="$(mktemp -d)"; mkdir -p "$REPO/.bkit"; : > "$REPO/.bkit/.runtime-cursor"
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT="$REPO" FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s RUNTIME_WORKTREES=%s RUNTIME_DEVPUSHES=%s\n' \"\$RUNTIME\" \"\$RUNTIME_WORKTREES\" \"\$RUNTIME_DEVPUSHES\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=CLOUD_CURSOR"* ]]
  [[ "$output" == *"RUNTIME_WORKTREES=true"* ]]
  [[ "$output" == *"RUNTIME_DEVPUSHES=true"* ]]
  rm -rf "$REPO"
}

@test "detect: BKIT_RUNTIME overrides every primitive; an invalid value falls to UNKNOWN, loudly" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 BKIT_RUNTIME=CLOUD_CLAUDE REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s\n' \"\$RUNTIME\""
  [[ "$output" == *"RUNTIME=CLOUD_CLAUDE"* ]]
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 BKIT_RUNTIME=nonsense REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s\n' \"\$RUNTIME\""
  [[ "$output" == *"RUNTIME=UNKNOWN"* ]]
  [[ "$output" == *"is not a valid runtime"* ]]
}

@test "detect: RUNTIME_GITHUBCLI=true when gh auth status succeeds" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME_GITHUBCLI=%s RUNTIME_GITHUBCLI_EXIT=%s\n' \"\$RUNTIME_GITHUBCLI\" \"\$RUNTIME_GITHUBCLI_EXIT\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME_GITHUBCLI=true"* ]]
  [[ "$output" == *"RUNTIME_GITHUBCLI_EXIT=0"* ]]
}

@test "detect: RUNTIME_GITHUBCLI=false (loud, non-zero probe exit) when gh auth status fails" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME_GITHUBCLI=%s RUNTIME_GITHUBCLI_EXIT=%s\n' \"\$RUNTIME_GITHUBCLI\" \"\$RUNTIME_GITHUBCLI_EXIT\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME_GITHUBCLI=false"* ]]
  [[ "$output" == *"RUNTIME_GITHUBCLI_EXIT=1"* ]]
  [[ "$stderr" == *"gh-preflight: RUNTIME_GITHUBCLI=false"* ]] || [[ "$output" == *"gh-preflight: RUNTIME_GITHUBCLI=false"* ]]
}

# ---------------------------------------------------------------------------
# 2. State does NOT survive a Bash-call boundary; RUNTIME_GITHUBCLI round-trips via the row
# ---------------------------------------------------------------------------

@test "state: RUNTIME/CAN_* are unset in a fresh process that has not sourced+called this block" {
  run env -i PATH="$FAKE_BIN:$PATH" bash -c 'printf "RUNTIME=[%s]\n" "${RUNTIME:-}"'
  [ "$status" -eq 0 ]
  [[ "$output" == "RUNTIME=[]" ]]
}

@test "state: a second independent process re-derives the same table without inheriting the first's variables" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && printf '%s\n' \"\$RUNTIME\""
  first="$output"
  run env -i PATH="$FAKE_BIN:$PATH" bash -c 'printf "RUNTIME=[%s]\n" "${RUNTIME:-}"'
  [ "$status" -eq 0 ]
  [[ "$output" == "RUNTIME=[]" ]]
  [ "$first" = "LOCAL" ]
}

@test "row: RUNTIME_GITHUBCLI round-trips through the runtime-resolved row" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 CLAUDE_CODE_REMOTE=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row build '2026-07-24T00:00:00Z'"
  [ "$status" -eq 0 ]
  [[ "$output" == *'"type":"runtime-resolved"'* ]]
  [[ "$output" == *'"workflow":"build"'* ]]
  [[ "$output" == *'"runtime":"CLOUD_CLAUDE"'* ]]
  [[ "$output" == *'"runtimeGithubCli":false'* ]]
  # Reading the emitted row back (simulating a later block) recovers RUNTIME_GITHUBCLI
  # without re-probing gh.
  gh_ok=$(printf '%s' "$output" | jq -r '.runtimeGithubCli')
  [ "$gh_ok" = "false" ]
}

@test "row: bkit_runtime_row fails closed (exit 2, nothing on stdout) when WORKFLOW is empty" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row '' '2026-07-24T00:00:00Z' 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
}

# --- JSON escaping (regression) --------------------------------------------
# The emitters used printf + `sed 's/"/\\"/g'`, which escapes `"` but not `\`.
# RUNTIME_GITHUBCLI_ERR is raw `gh auth status` stderr, so one backslash in it
# emitted an invalid JSON escape. Because status.jsonl is read with `jq -s`,
# that poisoned the WHOLE run's ledger, not just the bad row — and it fired
# only on the RUNTIME_GITHUBCLI=false path, the one the shim exists to serve.

@test "row: a backslash in the gh error is escaped — runtime-resolved stays parseable (regression)" {
  # A gh stderr line whose backslash is NOT a valid JSON escape (`\U`).
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 FAKE_GH_ERR='x509: cert C:\Users\ca "quoted"' \
    REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row build '2026-07-24T00:00:00Z'"
  [ "$status" -eq 0 ]
  printf '%s' "$output" | jq -e . >/dev/null
  err=$(printf '%s' "$output" | jq -r '.runtimeGithubCliErr')
  [ "$err" = 'x509: cert C:\Users\ca "quoted"' ]
}

@test "row: one such row does not make the whole status ledger unreadable (regression)" {
  status_dir="$(mktemp -d)"; status_file="$status_dir/status.jsonl"
  env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 FAKE_GH_ERR='proxy C:\Users' \
    REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row ship '2026-07-24T00:00:00Z'" >>"$status_file"
  printf '%s\n' '{"type":"transport-fallback","from":"gh pr merge","to":"merge_pull_request","reason":"r","assertedBy":"a","at":"t"}' >>"$status_file"
  # The cross-check reads the ledger with `jq -s`; it must see the fallback row
  # rather than failing with "could not read status file".
  run env -i PATH="$FAKE_BIN:$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$status_file' mcp"
  [ "$status" -eq 0 ]
}

@test "row: bkit_transport_fallback_row records backslash args verbatim, not as control chars (regression)" {
  # `C:\temp\new` survived the old sed as valid-but-WRONG JSON: `\t` and `\n`
  # decoded to a literal tab and newline, silently corrupting the audit trail.
  run env -i PATH="$FAKE_BIN:$PATH" bash -c ". '$RUNTIME_SH' && bkit_transport_fallback_row 'gh pr merge' 'merge_pull_request' 'C:\\temp\\new' 'reread' '2026-07-24T00:00:00Z'"
  [ "$status" -eq 0 ]
  printf '%s' "$output" | jq -e . >/dev/null
  reason=$(printf '%s' "$output" | jq -r '.reason')
  [ "$reason" = 'C:\temp\new' ]
}

@test "row: bkit_close_transport_row emits parseable JSON via the same emitter" {
  run env -i PATH="$FAKE_BIN:$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_transport_row A deadbeef clean '2026-07-24T00:00:00Z'"
  [ "$status" -eq 0 ]
  printf '%s' "$output" | jq -e . >/dev/null
  [ "$(printf '%s' "$output" | jq -r '.shape')" = "A" ]
  [ "$(printf '%s' "$output" | jq -r '.scanResult')" = "clean" ]
}

# --- set -u safety (regression) ---------------------------------------------
# The shim ships to consumers and is sourced by callers bkit does not control.
# Unguarded `$CLAUDE_CODE_REMOTE` / `$CI` / `$1` reads aborted the caller's whole
# block with "unbound variable" under `set -u` — on LOCAL, where none of the
# detection primitives are set. Same class as tests/ship-gate.bats F4b.

@test "set -u: detect resolves LOCAL with no primitives set (regression)" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c "set -u; . '$RUNTIME_SH'; bkit_runtime_detect; printf '%s\n' \"\$RUNTIME\""
  [ "$status" -eq 0 ]
  [[ "$output" != *"unbound variable"* ]]
  [ "$output" = "LOCAL" ]
}

@test "set -u: detect reads REPO_ROOT/FID from the env when they are unset without aborting (regression)" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 bash -c "set -u; . '$RUNTIME_SH'; bkit_runtime_detect; printf 'rc=%s\n' \$?"
  [[ "$output" != *"unbound variable"* ]]
  [[ "$output" == *"REPO_ROOT and FID must both be non-empty"* ]]
}

@test "set -u: assert_resolved and the arg-less guards fail loudly, not with 'unbound variable' (regression)" {
  run env -i PATH="$FAKE_BIN:$PATH" bash -c "set -u; . '$RUNTIME_SH'; bkit_runtime_assert_resolved"
  [ "$status" -eq 2 ]
  [[ "$output" != *"unbound variable"* ]]
  [[ "$output" == *"UNRESOLVED"* ]]

  run env -i PATH="$FAKE_BIN:$PATH" bash -c "set -u; . '$RUNTIME_SH'; bkit_close_guard_checkout"
  [ "$status" -eq 2 ]
  [[ "$output" != *"unbound variable"* ]]

  run env -i PATH="$FAKE_BIN:$PATH" bash -c "set -u; . '$RUNTIME_SH'; bkit_wait_ci"
  [ "$status" -eq 2 ]
  [[ "$output" != *"unbound variable"* ]]
}

@test "set -u: close_guard_checkout still prints its loud refusal when detect was never called (regression)" {
  run env -i PATH="$FAKE_BIN:$PATH" bash -c "set -u; . '$RUNTIME_SH'; bkit_close_guard_checkout dev"
  [ "$status" -eq 2 ]
  [[ "$output" != *"unbound variable"* ]]
  [[ "$output" == *"refusing local checkout"* ]]
}

# ---------------------------------------------------------------------------
# 3. Flow 1 — loud, distinguishable emptiness
# ---------------------------------------------------------------------------

@test "flow1: bkit_runtime_assert_resolved fails loudly (exit 2) when detect was never called" {
  run env -i PATH="$FAKE_BIN:$PATH" bash -c ". '$RUNTIME_SH' && bkit_runtime_assert_resolved"
  [ "$status" -eq 2 ]
  [[ "$output" == *"UNRESOLVED"* ]]
}

@test "flow1: bkit_runtime_assert_resolved passes (exit 0) for a legitimate least-capable (explicit false) resolution" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 CLAUDE_CODE_REMOTE=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_assert_resolved"
  [ "$status" -eq 0 ]
}

@test "flow1: bkit_runtime_detect itself fails loudly (exit 2) when REPO_ROOT/FID are missing — distinct from an explicit false capability" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 bash -c ". '$RUNTIME_SH' && bkit_runtime_detect"
  [ "$status" -eq 2 ]
  [[ "$output" == *"REPO_ROOT and FID must both be non-empty"* ]]
}

# ---------------------------------------------------------------------------
# 4. WORKTREE_PATH mint vs adopt
# ---------------------------------------------------------------------------

@test "worktree: RUNTIME_WORKTREES=true (local) -> WORKTREE_PATH mints REPO_ROOT/.worktrees/FID" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf '%s\n' \"\$WORKTREE_PATH\""
  [ "$status" -eq 0 ]
  [ "$output" = "/tmp/repo/.worktrees/42-x" ]
}

@test "worktree: RUNTIME_WORKTREES=false (cloud) -> WORKTREE_PATH adopts REPO_ROOT (no mint)" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 CLAUDE_CODE_REMOTE=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect 2>/dev/null && printf '%s\n' \"\$WORKTREE_PATH\""
  [ "$status" -eq 0 ]
  [ "$output" = "/tmp/repo" ]
}

# ---------------------------------------------------------------------------
# 5. bkit_wait_ci — timeout-wrapped cap on a blocked sleep (D22, row 5)
# ---------------------------------------------------------------------------

# A fake `gh` that always answers "0 matching checks" (rc=0, empty result) so
# every poll iteration falls through to the sleep — the only path that
# exercises the timeout wrapper.
setup_fake_gh_zero() {
  cat >"$FAKE_BIN/gh" <<'EOF'
#!/usr/bin/env sh
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then
  echo "0"
  exit 0
fi
exit 1
EOF
  chmod +x "$FAKE_BIN/gh"
}

@test "wait_ci: resolves 'none' within budget when gh reports zero matching checks every poll" {
  setup_fake_gh_zero
  run env -i PATH="$FAKE_BIN:$PATH" bash -c ". '$RUNTIME_SH' && bkit_wait_ci 1 2 1; printf 'RESULT=%s ATTEMPTS=%s ELAPSED=%s ALLERR=%s\n' \"\$CI_WAIT_RESULT\" \"\$CI_WAIT_ATTEMPTS\" \"\$CI_WAIT_ELAPSED\" \"\$CI_WAIT_ALL_ERRORED\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RESULT=none"* ]]
  [[ "$output" == *"ATTEMPTS=2"* ]]
  [[ "$output" == *"ELAPSED=2"* ]]
  [[ "$output" == *"ALLERR=false"* ]]
}

@test "wait_ci: a BLOCKED (never-returning) sleep is timeout-capped -- never hangs, fails loud with RESULT=err (D22)" {
  setup_fake_gh_zero
  # A `sleep` that never returns — simulates the mode-3 harness blocking the
  # foreground primitive rather than erroring it (D22's worst-case Risk 3).
  cat >"$FAKE_BIN/sleep" <<'EOF'
#!/usr/bin/env sh
while true; do :; done
EOF
  chmod +x "$FAKE_BIN/sleep"
  # `timeout` itself must come from the real PATH (not faked) to enforce the cap.
  run env -i PATH="$FAKE_BIN:$PATH" timeout 15 bash -c ". '$RUNTIME_SH' && bkit_wait_ci 1 5 1; printf 'RESULT=%s\n' \"\$CI_WAIT_RESULT\""
  # The outer `timeout 15` is a hang-detector for the TEST itself — bkit_wait_ci's
  # own internal timeout (interval+5=6s) must resolve well inside that budget.
  [ "$status" -eq 0 ]
  [[ "$output" == *"RESULT=err"* ]]
}

@test "wait_ci: empty PR_NUMBER fails closed (RESULT=err, exit 2) without attempting a poll" {
  run env -i PATH="$FAKE_BIN:$PATH" bash -c ". '$RUNTIME_SH' && bkit_wait_ci '' 5 1; printf 'RESULT=%s ATTEMPTS=%s\n' \"\$CI_WAIT_RESULT\" \"\$CI_WAIT_ATTEMPTS\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RESULT=err"* ]]
  [[ "$output" == *"ATTEMPTS=0"* ]]
}

@test "wait_ci: neither 'timeout' nor 'gtimeout' on PATH -- falls back to a plain sleep, RESULT=none (regression, F2 -- stock macOS lacks GNU timeout)" {
  # Fake `gh`/`sleep` use an ABSOLUTE `#!/bin/sh` shebang (not `#!/usr/bin/env
  # sh`) — PATH inside the child is deliberately FAKE_BIN-only (no
  # `timeout`/`gtimeout`, and no `sh` either), so `env sh` lookup itself
  # would fail here.
  cat >"$FAKE_BIN/gh" <<'EOF'
#!/bin/sh
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then
  echo "0"
  exit 0
fi
exit 1
EOF
  chmod +x "$FAKE_BIN/gh"
  cat >"$FAKE_BIN/sleep" <<'EOF'
#!/bin/sh
exec /bin/sleep "$@"
EOF
  chmod +x "$FAKE_BIN/sleep"
  # `bash` itself is resolved via its ABSOLUTE path (captured before PATH is
  # restricted below) — PATH inside the child is deliberately FAKE_BIN-only
  # so no real 'timeout'/'gtimeout' on this machine can mask the fallback.
  BASH_BIN="$(command -v bash)"
  run env -i PATH="$FAKE_BIN" "$BASH_BIN" -c ". '$RUNTIME_SH' && bkit_wait_ci 1 2 1; printf 'RESULT=%s ATTEMPTS=%s ELAPSED=%s\n' \"\$CI_WAIT_RESULT\" \"\$CI_WAIT_ATTEMPTS\" \"\$CI_WAIT_ELAPSED\""
  [ "$status" -eq 0 ]
  # Must NOT be misdiagnosed as a D22 blocked-sleep abort (RESULT=err) just
  # because no timeout wrapper exists — it must complete the poll budget.
  [[ "$output" == *"RESULT=none"* ]]
  [[ "$output" == *"ATTEMPTS=2"* ]]
  [[ "$output" == *"ELAPSED=2"* ]]
}

@test "wait_ci: resolves 'gtimeout' when 'timeout' is absent from PATH (regression, F2 -- homebrew coreutils naming)" {
  MARKER="$FAKE_BIN/GTIMEOUT_CALLED"
  cat >"$FAKE_BIN/gh" <<'EOF'
#!/bin/sh
if [ "$1" = "pr" ] && [ "$2" = "view" ]; then
  echo "0"
  exit 0
fi
exit 1
EOF
  chmod +x "$FAKE_BIN/gh"
  cat >"$FAKE_BIN/sleep" <<'EOF'
#!/bin/sh
exec /bin/sleep "$@"
EOF
  chmod +x "$FAKE_BIN/sleep"
  cat >"$FAKE_BIN/gtimeout" <<EOF
#!/bin/sh
/usr/bin/touch "$MARKER"
shift
exec "\$@"
EOF
  chmod +x "$FAKE_BIN/gtimeout"
  # PATH carries FAKE_BIN only (no real 'timeout') -- gtimeout must be
  # resolved and invoked as the wrapper. `bash` is resolved via absolute
  # path (see fallback test above) since PATH excludes the real bash dir.
  BASH_BIN="$(command -v bash)"
  run env -i PATH="$FAKE_BIN" "$BASH_BIN" -c ". '$RUNTIME_SH' && bkit_wait_ci 1 2 1; printf 'RESULT=%s\n' \"\$CI_WAIT_RESULT\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RESULT=none"* ]]
  [ -e "$MARKER" ]
}

# ---------------------------------------------------------------------------
# 7. D24 — post-close skip-token scan of the LANDED commit body (row 7)
# ---------------------------------------------------------------------------

@test "close-guard: flags [skip ci] in the LANDED commit body -> Failure Path" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close" -m "* chore(y): worktree-setup bkit [skip ci]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"inherited a CI-suppression token"* ]]
  rm -rf "$REPO"
}

@test "close-guard: flags [ci skip] (all 5 GitHub tokens)" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close" -m "* chore(y): worktree-setup bkit [ci skip]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"inherited a CI-suppression token"* ]]
  rm -rf "$REPO"
}

@test "close-guard: flags [no ci]" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close" -m "* chore(y): worktree-setup bkit [no ci]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"inherited a CI-suppression token"* ]]
  rm -rf "$REPO"
}

@test "close-guard: flags [skip actions]" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close" -m "* chore(y): worktree-setup bkit [skip actions]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"inherited a CI-suppression token"* ]]
  rm -rf "$REPO"
}

@test "close-guard: flags [actions skip]" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close" -m "* chore(y): worktree-setup bkit [actions skip]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"inherited a CI-suppression token"* ]]
  rm -rf "$REPO"
}

@test "close-guard: flags a suppression token case-insensitively" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close" -m "* chore(y): worktree-setup bkit [SKIP CI]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"inherited a CI-suppression token"* ]]
  rm -rf "$REPO"
}

@test "close-guard: passes (exit 0) on a skip-token-free commit body" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close DONE"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 0 ]
  rm -rf "$REPO"
}

@test "close-guard: a deliberate skip token in the SUBJECT with a clean body passes (docs-only close)" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): design DONE bkit [skip ci]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 0 ]
  rm -rf "$REPO"
}

@test "close-guard: fails closed (exit 2) when SHA is empty" {
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_scan_body ''"
  [ "$status" -eq 2 ]
}

# ---------------------------------------------------------------------------
# 8. D25 — transport-fallback recording cross-check, over real status.jsonl (row 8)
# ---------------------------------------------------------------------------

@test "close-guard: flags a missing transport-fallback row when RUNTIME_GITHUBCLI=false and a mapped transport closed -> Failure Path" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","runtimeGithubCli":false}\n' > "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' mcp"
  [ "$status" -eq 1 ]
  [[ "$output" == *"no transport-fallback row exists"* ]]
  rm -rf "$DIR"
}

@test "close-guard: passes when RUNTIME_GITHUBCLI=false and a transport-fallback row IS present" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","runtimeGithubCli":false}\n' > "$STATUS"
  printf '{"type":"transport-fallback","from":"gh pr merge","to":"merge_pull_request","reason":"RUNTIME_GITHUBCLI=false","assertedBy":"pull_request_read","at":"2026-07-24T00:01:00Z"}\n' >> "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' mcp"
  [ "$status" -eq 0 ]
  rm -rf "$DIR"
}

@test "close-guard: exempts TRANSPORT=gh regardless of RUNTIME_GITHUBCLI" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","runtimeGithubCli":false}\n' > "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' gh"
  [ "$status" -eq 0 ]
  rm -rf "$DIR"
}

@test "close-guard: exempts TRANSPORT=git (local close needs no gh) even when RUNTIME_GITHUBCLI=false" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","runtimeGithubCli":false}\n' > "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' git"
  [ "$status" -eq 0 ]
  rm -rf "$DIR"
}

@test "close-guard: passes when RUNTIME_GITHUBCLI=true even without a transport-fallback row" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","runtimeGithubCli":true}\n' > "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' mcp"
  [ "$status" -eq 0 ]
  rm -rf "$DIR"
}

@test "close-guard: fails closed (exit 2) when STATUS_PATH is missing" {
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '/tmp/does-not-exist-$$.jsonl' mcp"
  [ "$status" -eq 2 ]
}

# ---------------------------------------------------------------------------
# 9. D23 — double-guard + reversible checkout (row 9)
# ---------------------------------------------------------------------------

@test "close-guard: double-guard refuses local checkout when RUNTIME_WORKTREES/RUNTIME_DEVPUSHES are NOT both true" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  git -C "$REPO" branch dev
  run env -i PATH="$PATH" RUNTIME_WORKTREES=false RUNTIME_DEVPUSHES=true bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_checkout dev"
  [ "$status" -eq 2 ]
  [[ "$output" == *"refusing local checkout"* ]]
  [ "$(git -C "$REPO" branch --show-current)" = "main" ]
  rm -rf "$REPO"
}

@test "close-guard: double-guard requires BOTH flags — RUNTIME_DEVPUSHES=false alone also refuses" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  git -C "$REPO" branch dev
  run env -i PATH="$PATH" RUNTIME_WORKTREES=true RUNTIME_DEVPUSHES=false bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_checkout dev"
  [ "$status" -eq 2 ]
  [ "$(git -C "$REPO" branch --show-current)" = "main" ]
  rm -rf "$REPO"
}

@test "close-guard: reversible checkout — trap restores the original branch once the process exits" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  git -C "$REPO" branch dev
  run env -i PATH="$PATH" RUNTIME_WORKTREES=true RUNTIME_DEVPUSHES=true bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_checkout dev && git branch --show-current"
  [ "$status" -eq 0 ]
  [[ "$output" == *"dev"* ]]
  # The bash -c process from `run` has already exited by the time `run`
  # returns — its EXIT trap must have already restored the original branch.
  [ "$(git -C "$REPO" branch --show-current)" = "main" ]
  rm -rf "$REPO"
}

@test "close-guard: a branch name with embedded \$(...) cannot execute code when the EXIT trap fires" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  MARKER="$REPO/INJECTED"
  # `git check-ref-format` permits ' $ ( ) in branch names (only space,
  # ~^:?*[\ and control chars are barred — no literal space, so `$IFS` is
  # used in place of one) — this name is crafted to break out of a
  # DOUBLE-quoted trap string (the pre-fix shape) via its embedded
  # single-quotes, landing a `$(...)` command substitution that would
  # re-execute at EXIT-trap-fire-time re-parse. Under the fix (single-quoted
  # trap body — value expands as a literal argument, never re-parsed), the
  # payload never runs.
  BRANCH="x'\$(touch\$IFS$MARKER)'y"
  git -C "$REPO" checkout -q -b "$BRANCH"
  run env -i PATH="$PATH" RUNTIME_WORKTREES=true RUNTIME_DEVPUSHES=true bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_checkout main"
  [ "$status" -eq 0 ]
  [ ! -e "$MARKER" ]
  rm -rf "$REPO"
}

@test "close-guard: fails closed (exit 2) on an empty TARGET_BRANCH" {
  run env -i PATH="$PATH" RUNTIME_WORKTREES=true RUNTIME_DEVPUSHES=true bash -c ". '$RUNTIME_SH' && bkit_close_guard_checkout ''"
  [ "$status" -eq 2 ]
}

# ---------------------------------------------------------------------------
# Anchor block (#431 Part 1) — the `baseSha` field on the `runtime-resolved`
# row, and the `bkit_anchor_stamp` / `bkit_anchor_read` helpers that write and
# read the design/plan canonical docs' `<!-- bkit:anchor -->` prelude.
# ---------------------------------------------------------------------------

@test "anchor: bkit_runtime_row emits baseSha when RUNTIME_BASESHA is set" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x RUNTIME_BASESHA=deadbeef1234 bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row design '2026-08-20T00:00:00Z'"
  [ "$status" -eq 0 ]
  printf '%s' "$output" | jq -e . >/dev/null
  [ "$(printf '%s' "$output" | jq -r '.baseSha')" = "deadbeef1234" ]
}

@test "anchor: bkit_runtime_row emits an empty baseSha when RUNTIME_BASESHA is unset, and stays valid JSON" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row design '2026-08-20T00:00:00Z'"
  [ "$status" -eq 0 ]
  printf '%s' "$output" | jq -e . >/dev/null
  [ "$(printf '%s' "$output" | jq -r '.baseSha')" = "" ]
}

@test "anchor: bkit_anchor_stamp prepends a well-formed block to an unstamped file" {
  DIR="$(mktemp -d)"
  FILE="$DIR/design.md"
  printf '# Some Design\n\nBody.\n' > "$FILE"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$FILE' abc123def"
  [ "$status" -eq 0 ]
  [ "$(head -n 1 "$FILE")" = "<!-- bkit:anchor" ]
  grep -q '^baseSha: abc123def$' "$FILE"
  grep -q '^baseRef: origin/dev$' "$FILE"
  grep -q '^-->$' "$FILE"
  grep -q '^# Some Design$' "$FILE"
  rm -rf "$DIR"
}

@test "anchor: stamping twice with the same args is idempotent (byte-identical)" {
  DIR="$(mktemp -d)"
  FILE="$DIR/design.md"
  printf '# Some Design\n\nBody.\n' > "$FILE"
  env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$FILE' abc123def"
  cp "$FILE" "$DIR/once.md"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$FILE' abc123def"
  [ "$status" -eq 0 ]
  cmp -s "$FILE" "$DIR/once.md"
  rm -rf "$DIR"
}

@test "anchor: re-stamping with a different BASE_SHA replaces the block, not appends a second one" {
  DIR="$(mktemp -d)"
  FILE="$DIR/design.md"
  printf '# Some Design\n\nBody.\n' > "$FILE"
  env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$FILE' abc123"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$FILE' zzz999"
  [ "$status" -eq 0 ]
  [ "$(grep -c '^<!-- bkit:anchor$' "$FILE")" -eq 1 ]
  grep -q '^baseSha: zzz999$' "$FILE"
  ! grep -q '^baseSha: abc123$' "$FILE"
  rm -rf "$DIR"
}

@test "anchor: plan form (DESIGN_PATH set) emits designPath+designBaseSha; design form (omitted) emits neither" {
  DIR="$(mktemp -d)"
  PLAN="$DIR/plan.md"
  DESIGN="$DIR/design.md"
  printf '# Plan\n' > "$PLAN"
  printf '# Design\n' > "$DESIGN"
  env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$PLAN' abc123 docs/plans/202608/x-design.md def456"
  env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$DESIGN' abc123"
  grep -q '^designPath: docs/plans/202608/x-design.md$' "$PLAN"
  grep -q '^designBaseSha: def456$' "$PLAN"
  ! grep -q '^designPath:' "$DESIGN"
  ! grep -q '^designBaseSha:' "$DESIGN"
  rm -rf "$DIR"
}

@test "anchor: bkit_anchor_read round-trips every field" {
  DIR="$(mktemp -d)"
  FILE="$DIR/plan.md"
  printf '# Plan\n' > "$FILE"
  env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$FILE' abc123 docs/plans/202608/x-design.md def456"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_read '$FILE' baseSha"
  [ "$status" -eq 0 ]
  [ "$output" = "abc123" ]
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_read '$FILE' baseRef"
  [ "$status" -eq 0 ]
  [ "$output" = "origin/dev" ]
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_read '$FILE' designPath"
  [ "$status" -eq 0 ]
  [ "$output" = "docs/plans/202608/x-design.md" ]
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_read '$FILE' designBaseSha"
  [ "$status" -eq 0 ]
  [ "$output" = "def456" ]
  rm -rf "$DIR"
}

@test "anchor: bkit_anchor_read on an unstamped file is silent (rc=0) — a baseSha-shaped body string is not mistaken for the anchor" {
  DIR="$(mktemp -d)"
  FILE="$DIR/plan.md"
  printf '# Plan\n\nbaseSha: not-really-an-anchor\n' > "$FILE"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_read '$FILE' baseSha"
  [ "$status" -eq 0 ]
  [ -z "$output" ]
  rm -rf "$DIR"
}

@test "anchor: bkit_anchor_stamp fails closed (rc=2) on empty BASE_SHA and writes nothing" {
  DIR="$(mktemp -d)"
  FILE="$DIR/plan.md"
  printf '# Plan\n' > "$FILE"
  cp "$FILE" "$DIR/before.md"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$FILE' ''"
  [ "$status" -eq 2 ]
  cmp -s "$FILE" "$DIR/before.md"
  rm -rf "$DIR"
}

@test "anchor: bkit_anchor_stamp fails closed (rc=2) on a missing FILE" {
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '/tmp/does-not-exist-$$.md' abc123"
  [ "$status" -eq 2 ]
}

@test "anchor: stamping two identical-content files with the same base yields cmp -s equal output (Close Workflow re-run regression guard)" {
  DIR="$(mktemp -d)"
  A="$DIR/a.md"
  B="$DIR/b.md"
  printf '# Same content\n\nBody.\n' > "$A"
  cp "$A" "$B"
  env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$A' abc123"
  env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_anchor_stamp '$B' abc123"
  cmp -s "$A" "$B"
  rm -rf "$DIR"
}
