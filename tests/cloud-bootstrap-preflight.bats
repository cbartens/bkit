#!/usr/bin/env bats
# cloud-bootstrap-preflight.bats — Unit tests for the gh-preflight block in
# cloud-bootstrap.sh (#341 T5 / C2, Derived Test Matrix row 13).
#
# Covers: prefers the sanctioned GH_TOKEN env var over `--with-token`;
# records GH_OK loudly (always, not just on failure); emits a loud
# NON-BLOCKING dual-lane signal when neither gh nor the GitHub MCP server
# (both keyed off GH_BKIT_TOKEN) can authenticate — never a hook hard-stop
# (SessionStart hooks cannot block the session).
#
# Run: bats tests/cloud-bootstrap-preflight.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# Template-relative by default (same convention as tests/counter-bus.bats /
# tests/bkit-runtime.bats): edits land in .bkit/templates/.claude/hooks/;
# the installed .claude/hooks/ mirror is produced by `bkit install`,
# deferred to the batch mirror regen (Sub-Plan 6).
BOOTSTRAP_SH="${BKIT_CLOUD_BOOTSTRAP_SH:-$REPO_ROOT/.bkit/templates/.claude/hooks/cloud-bootstrap.sh}"

setup() {
  FAKE_BIN="$(mktemp -d)"
  WORKDIR="$(mktemp -d)"
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
if [ "$1" = "auth" ] && [ "$2" = "login" ]; then
  echo "gh auth login --with-token invoked" >&2
  exit 0
fi
exit 1
EOF
  chmod +x "$FAKE_BIN/gh"
}

teardown() {
  rm -rf "$FAKE_BIN" "$WORKDIR"
}

run_bootstrap() {
  # WORKDIR has no pnpm-lock.yaml / .vale.ini / .agents/config.md, so the
  # baseline-install / vale-sync / debug-fetch-provision blocks self-skip —
  # isolating the gh-preflight block under test.
  printf '' | env -i PATH="$FAKE_BIN:/usr/bin:/bin" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$WORKDIR" "$@" bash "$BOOTSTRAP_SH"
}

@test "prefers sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login)" {
  run run_bootstrap env GH_TOKEN=sanctioned-token FAKE_GH_AUTH_OK=1
  [[ "$output" == *"sanctioned GH_TOKEN/GITHUB_TOKEN env present"* ]]
  [[ "$output" != *"gh auth login --with-token invoked"* ]]
}

@test "prefers sanctioned GITHUB_TOKEN over --with-token login" {
  run run_bootstrap env GITHUB_TOKEN=sanctioned-token GH_BKIT_TOKEN=would-login FAKE_GH_AUTH_OK=1
  [[ "$output" == *"sanctioned GH_TOKEN/GITHUB_TOKEN env present"* ]]
  [[ "$output" != *"gh auth login --with-token invoked"* ]]
}

@test "falls back to --with-token login from GH_BKIT_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set" {
  run run_bootstrap env GH_BKIT_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [[ "$output" == *"gh auth login --with-token"* ]]
}

@test "records GH_OK=true loudly when gh is authed" {
  run run_bootstrap env GH_TOKEN=sanctioned-token FAKE_GH_AUTH_OK=1
  [[ "$output" == *"gh-preflight: GH_OK=true"* ]]
}

@test "records GH_OK=false loudly when gh is not authed" {
  run run_bootstrap env FAKE_GH_AUTH_OK=0
  [[ "$output" == *"gh-preflight: GH_OK=false"* ]]
}

@test "emits the dual-lane WARNING (non-blocking) when GH_OK=false and no credential env is set at all" {
  run run_bootstrap env FAKE_GH_AUTH_OK=0
  [ "$status" -eq 0 ]
  [[ "$output" == *"DUAL-LANE WARNING"* ]]
}

@test "does NOT emit the dual-lane WARNING when GH_OK=false but GH_BKIT_TOKEN is set (MCP lane still viable)" {
  run run_bootstrap env GH_BKIT_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [[ "$output" != *"DUAL-LANE WARNING"* ]]
}

@test "the hook never hard-stops the session (always exits 0) even on the dual-lane warning path" {
  run run_bootstrap env FAKE_GH_AUTH_OK=0
  [ "$status" -eq 0 ]
}
