#!/usr/bin/env bats
# bkit-runtime.bats — Unit tests for bkit-runtime.sh (#341 T3/T7/T9 / WS-6/WS-8/WS-10).
#
# Covers Derived Test Matrix rows 1-5, 7-9:
#   1. bkit_runtime_detect maps env inputs -> RUNTIME + 4 CAN_* per the
#      4-row table; unknown (no primitive) -> least-capable, never mode-1.
#   2. Sourced shim state does NOT survive a Bash-call boundary; env-only
#      flags re-derive per block; GH_OK round-trips through the
#      runtime-resolved row (D21).
#   3. Shim-source failure / an unset CAN_* is loud + distinguishable from
#      an explicit false (Flow 1 emptiness checks; distinct reason).
#   4. WORKTREE_PATH resolves mint (CAN_WORKTREE=true ->
#      $REPO_ROOT/.worktrees/{FID}) vs adopt (false -> $REPO_ROOT).
#   5. bkit_wait_ci's `timeout`-wrapped cap fires on a blocked/never-returning
#      `sleep` (never hangs); attempt/elapsed bounds enforced (D22).
#   7. D24 post-close scan flags [skip ci] in the LANDED commit body (any
#      transport) -> Failure Path.
#   8. D25 cross-check: runtime-resolved.GH_OK=false + a mapped-tool close
#      with NO transport-fallback row -> Failure Path (reads real
#      status.jsonl).
#   9. D23 double-guard: the local-checkout branch requires
#      CAN_WORKTREE=true AND CAN_PUSH_DEV=true; trap restores the original
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

# A fake `gh` on PATH so GH_OK is deterministic across test environments
# (real gh auth may or may not be logged in on the machine running bats).
setup() {
  FAKE_BIN="$(mktemp -d)"
  cat >"$FAKE_BIN/gh" <<'EOF'
#!/usr/bin/env sh
if [ "$1" = "auth" ] && [ "$2" = "status" ]; then
  if [ "${FAKE_GH_AUTH_OK:-1}" = "1" ]; then
    echo "Logged in to github.com" >&2
    exit 0
  else
    echo "You are not logged into any GitHub hosts" >&2
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

@test "detect: local (no primitives) -> RUNTIME=local, CAN_WORKTREE/CAN_PUSH_DEV/CAN_SLEEP=true" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s CAN_WORKTREE=%s CAN_PUSH_DEV=%s CAN_SLEEP=%s\n' \"\$RUNTIME\" \"\$CAN_WORKTREE\" \"\$CAN_PUSH_DEV\" \"\$CAN_SLEEP\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=local"* ]]
  [[ "$output" == *"CAN_WORKTREE=true"* ]]
  [[ "$output" == *"CAN_PUSH_DEV=true"* ]]
  [[ "$output" == *"CAN_SLEEP=true"* ]]
}

@test "detect: GITHUB_ACTIONS=true -> RUNTIME=actions, CAN_*=true" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 GITHUB_ACTIONS=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s CAN_WORKTREE=%s CAN_PUSH_DEV=%s CAN_SLEEP=%s\n' \"\$RUNTIME\" \"\$CAN_WORKTREE\" \"\$CAN_PUSH_DEV\" \"\$CAN_SLEEP\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=actions"* ]]
  [[ "$output" == *"CAN_WORKTREE=true"* ]]
  [[ "$output" == *"CAN_PUSH_DEV=true"* ]]
  [[ "$output" == *"CAN_SLEEP=true"* ]]
}

@test "detect: CI=true -> RUNTIME=actions (CI is also a mode-2 primitive)" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 CI=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s\n' \"\$RUNTIME\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=actions"* ]]
}

@test "detect: CLAUDE_CODE_REMOTE=true -> RUNTIME=cloud, CAN_*=false" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 CLAUDE_CODE_REMOTE=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s CAN_WORKTREE=%s CAN_PUSH_DEV=%s CAN_SLEEP=%s\n' \"\$RUNTIME\" \"\$CAN_WORKTREE\" \"\$CAN_PUSH_DEV\" \"\$CAN_SLEEP\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=cloud"* ]]
  [[ "$output" == *"CAN_WORKTREE=false"* ]]
  [[ "$output" == *"CAN_PUSH_DEV=false"* ]]
  [[ "$output" == *"CAN_SLEEP=false"* ]]
}

@test "detect: ambiguous primitives (e.g. GITHUB_ACTIONS=false, no CI/CLAUDE_CODE_REMOTE) -> RUNTIME=unknown, least-capable, never mode-1" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 GITHUB_ACTIONS=false REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'RUNTIME=%s CAN_WORKTREE=%s CAN_PUSH_DEV=%s CAN_SLEEP=%s\n' \"\$RUNTIME\" \"\$CAN_WORKTREE\" \"\$CAN_PUSH_DEV\" \"\$CAN_SLEEP\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME=unknown"* ]]
  [[ "$output" == *"CAN_WORKTREE=false"* ]]
  [[ "$output" == *"CAN_PUSH_DEV=false"* ]]
  [[ "$output" == *"CAN_SLEEP=false"* ]]
}

@test "detect: GH_OK=true when gh auth status succeeds" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'GH_OK=%s GH_PROBE_EXIT=%s\n' \"\$GH_OK\" \"\$GH_PROBE_EXIT\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"GH_OK=true"* ]]
  [[ "$output" == *"GH_PROBE_EXIT=0"* ]]
}

@test "detect: GH_OK=false (loud, non-zero probe exit) when gh auth status fails" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf 'GH_OK=%s GH_PROBE_EXIT=%s\n' \"\$GH_OK\" \"\$GH_PROBE_EXIT\""
  [ "$status" -eq 0 ]
  [[ "$output" == *"GH_OK=false"* ]]
  [[ "$output" == *"GH_PROBE_EXIT=1"* ]]
  [[ "$stderr" == *"gh-preflight: GH_OK=false"* ]] || [[ "$output" == *"gh-preflight: GH_OK=false"* ]]
}

# ---------------------------------------------------------------------------
# 2. State does NOT survive a Bash-call boundary; GH_OK round-trips via the row
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
  [ "$first" = "local" ]
}

@test "row: GH_OK round-trips through the runtime-resolved row (D21 — durable cross-block record)" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=0 CLAUDE_CODE_REMOTE=true REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row build '2026-07-24T00:00:00Z'"
  [ "$status" -eq 0 ]
  [[ "$output" == *'"type":"runtime-resolved"'* ]]
  [[ "$output" == *'"workflow":"build"'* ]]
  [[ "$output" == *'"runtime":"cloud"'* ]]
  [[ "$output" == *'"ghOk":false'* ]]
  # Reading the emitted row back (simulating a later block) recovers GH_OK
  # without re-probing gh.
  gh_ok=$(printf '%s' "$output" | jq -r '.ghOk')
  [ "$gh_ok" = "false" ]
}

@test "row: bkit_runtime_row fails closed (exit 2, nothing on stdout) when WORKFLOW is empty" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect >/dev/null 2>&1 && bkit_runtime_row '' '2026-07-24T00:00:00Z' 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
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

@test "worktree: CAN_WORKTREE=true (local) -> WORKTREE_PATH mints REPO_ROOT/.worktrees/FID" {
  run env -i PATH="$FAKE_BIN:$PATH" FAKE_GH_AUTH_OK=1 REPO_ROOT=/tmp/repo FID=42-x bash -c ". '$RUNTIME_SH' && bkit_runtime_detect && printf '%s\n' \"\$WORKTREE_PATH\""
  [ "$status" -eq 0 ]
  [ "$output" = "/tmp/repo/.worktrees/42-x" ]
}

@test "worktree: CAN_WORKTREE=false (cloud) -> WORKTREE_PATH adopts REPO_ROOT (no mint)" {
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

# ---------------------------------------------------------------------------
# 7. D24 — post-close skip-token scan of the LANDED commit body (row 7)
# ---------------------------------------------------------------------------

@test "close-guard: D24 flags [skip ci] in the LANDED commit body -> Failure Path" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close bkit [skip ci]"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 1 ]
  [[ "$output" == *"D24"* ]]
  rm -rf "$REPO"
}

@test "close-guard: D24 passes (exit 0) on a skip-token-free commit body" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m "docs(x): close DONE"
  SHA="$(git -C "$REPO" rev-parse HEAD)"
  run env -i PATH="$PATH" bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_scan_body '$SHA'"
  [ "$status" -eq 0 ]
  rm -rf "$REPO"
}

@test "close-guard: D24 fails closed (exit 2) when SHA is empty" {
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_scan_body ''"
  [ "$status" -eq 2 ]
}

# ---------------------------------------------------------------------------
# 8. D25 — transport-fallback recording cross-check, over real status.jsonl (row 8)
# ---------------------------------------------------------------------------

@test "close-guard: D25 flags a missing transport-fallback row when GH_OK=false and a mapped transport closed -> Failure Path" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","ghOk":false}\n' > "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' mcp"
  [ "$status" -eq 1 ]
  [[ "$output" == *"D25"* ]]
  rm -rf "$DIR"
}

@test "close-guard: D25 passes when GH_OK=false and a transport-fallback row IS present" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","ghOk":false}\n' > "$STATUS"
  printf '{"type":"transport-fallback","from":"gh pr merge","to":"merge_pull_request","reason":"GH_OK=false","assertedBy":"pull_request_read","at":"2026-07-24T00:01:00Z"}\n' >> "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' mcp"
  [ "$status" -eq 0 ]
  rm -rf "$DIR"
}

@test "close-guard: D25 exempts TRANSPORT=gh regardless of GH_OK" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","ghOk":false}\n' > "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' gh"
  [ "$status" -eq 0 ]
  rm -rf "$DIR"
}

@test "close-guard: D25 passes when GH_OK=true even without a transport-fallback row" {
  DIR="$(mktemp -d)"
  STATUS="$DIR/status.jsonl"
  printf '{"type":"runtime-resolved","workflow":"design","at":"2026-07-24T00:00:00Z","ghOk":true}\n' > "$STATUS"
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '$STATUS' mcp"
  [ "$status" -eq 0 ]
  rm -rf "$DIR"
}

@test "close-guard: D25 fails closed (exit 2) when STATUS_PATH is missing" {
  run env -i PATH="$PATH" bash -c ". '$RUNTIME_SH' && bkit_close_guard_cross_check '/tmp/does-not-exist-$$.jsonl' mcp"
  [ "$status" -eq 2 ]
}

# ---------------------------------------------------------------------------
# 9. D23 — double-guard + reversible checkout (row 9)
# ---------------------------------------------------------------------------

@test "close-guard: D23 double-guard refuses local checkout when CAN_WORKTREE/CAN_PUSH_DEV are NOT both true" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  git -C "$REPO" branch dev
  run env -i PATH="$PATH" CAN_WORKTREE=false CAN_PUSH_DEV=true bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_checkout dev"
  [ "$status" -eq 2 ]
  [[ "$output" == *"double-guard"* ]]
  [ "$(git -C "$REPO" branch --show-current)" = "main" ]
  rm -rf "$REPO"
}

@test "close-guard: D23 double-guard requires BOTH flags — CAN_PUSH_DEV=false alone also refuses" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  git -C "$REPO" branch dev
  run env -i PATH="$PATH" CAN_WORKTREE=true CAN_PUSH_DEV=false bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_checkout dev"
  [ "$status" -eq 2 ]
  [ "$(git -C "$REPO" branch --show-current)" = "main" ]
  rm -rf "$REPO"
}

@test "close-guard: D23 reversible checkout — trap restores the original branch once the process exits" {
  REPO="$(mktemp -d)"
  git -C "$REPO" init -q -b main
  git -C "$REPO" -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  git -C "$REPO" branch dev
  run env -i PATH="$PATH" CAN_WORKTREE=true CAN_PUSH_DEV=true bash -c "cd '$REPO' && . '$RUNTIME_SH' && bkit_close_guard_checkout dev && git branch --show-current"
  [ "$status" -eq 0 ]
  [[ "$output" == *"dev"* ]]
  # The bash -c process from `run` has already exited by the time `run`
  # returns — its EXIT trap must have already restored the original branch.
  [ "$(git -C "$REPO" branch --show-current)" = "main" ]
  rm -rf "$REPO"
}

@test "close-guard: D23 fails closed (exit 2) on an empty TARGET_BRANCH" {
  run env -i PATH="$PATH" CAN_WORKTREE=true CAN_PUSH_DEV=true bash -c ". '$RUNTIME_SH' && bkit_close_guard_checkout ''"
  [ "$status" -eq 2 ]
}
