#!/usr/bin/env bats
# bkit-cloud-bootstrap-preflight.bats — Unit tests for the gh-preflight block in
# bkit-cloud-bootstrap.sh.
#
# Covers: prefers the sanctioned GH_TOKEN env var over `--with-token`;
# records RUNTIME_GITHUBCLI loudly (always, not just on failure); emits a loud
# NON-BLOCKING dual-lane signal when neither gh nor the GitHub MCP server
# (both keyed off BKIT_GH_TOKEN) can authenticate — never a hook hard-stop
# (SessionStart hooks cannot block the session).
#
# Run: bats tests/bkit-cloud-bootstrap-preflight.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# The template is the source of truth; this repo's adopted copy
# (.claude/hooks/bkit-cloud-bootstrap.sh) is kept byte-equal to it by
# dogfood-templates.test.ts.
BOOTSTRAP_SH="${BKIT_CLOUD_BOOTSTRAP_SH:-$REPO_ROOT/.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh}"

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

  # The provision block runs recipes through `bkit context provision`, so the workdir is
  # a git repo carrying bkit where `pnpm install` leaves it: here a shim to the repo's
  # built CLI. node and jq (the trust check) are linked into FAKE_BIN so PATH needs no
  # host dirs. The gh probe and login need only gh.
  git -C "$WORKDIR" init -q
  mkdir -p "$WORKDIR/node_modules/.bin"
  printf '#!/bin/sh\nexec node "%s/dist/cli.js" "$@"\n' "$REPO_ROOT" >"$WORKDIR/node_modules/.bin/bkit"
  chmod +x "$WORKDIR/node_modules/.bin/bkit"
  for tool in node jq; do
    ln -s "$(command -v "$tool")" "$FAKE_BIN/$tool"
  done

  # A tools-only PATH that is guaranteed NOT to contain gh, for the absent-gh
  # case. Naming real system dirs there is host-dependent and silently wrong on
  # GitHub-hosted runners, where gh ships as /usr/bin/gh next to the interpreter
  # and coreutils the hook itself needs — so the hook found gh and the assertion
  # failed in CI while passing on a machine with gh in /opt/homebrew/bin.
  NO_GH_BIN="$(mktemp -d)"
  for tool in bash sh cat node jq git; do
    ln -s "$(command -v "$tool")" "$NO_GH_BIN/$tool"
  done
}

teardown() {
  rm -rf "$FAKE_BIN" "$WORKDIR" "$NO_GH_BIN"
}

run_bootstrap() {
  # WORKDIR has no pnpm-lock.yaml / .vale.ini / .agents/context.md, so the
  # baseline-install / vale-sync / context-fetch-provision blocks self-skip —
  # isolating the gh-preflight block under test. dist/cli.js must be built.
  printf '' | env -i PATH="$FAKE_BIN:/usr/bin:/bin" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$WORKDIR" "$@" bash "$BOOTSTRAP_SH"
}

@test "prefers a WORKING sanctioned GH_TOKEN over --with-token login (does not invoke gh auth login)" {
  run run_bootstrap env GH_TOKEN=sanctioned-token FAKE_GH_AUTH_OK=1
  [[ "$output" == *"gh already authenticates"* ]]
  [[ "$output" != *"gh auth login --with-token invoked"* ]]
}

@test "prefers a WORKING sanctioned GITHUB_TOKEN over --with-token login" {
  run run_bootstrap env GITHUB_TOKEN=sanctioned-token BKIT_GH_TOKEN=would-login FAKE_GH_AUTH_OK=1
  [[ "$output" == *"gh already authenticates"* ]]
  [[ "$output" != *"gh auth login --with-token invoked"* ]]
}

@test "falls back to --with-token login from BKIT_GH_TOKEN when neither GH_TOKEN nor GITHUB_TOKEN is set" {
  run run_bootstrap env BKIT_GH_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [[ "$output" == *"gh auth login --with-token"* ]]
}

# --- placeholder/expired sanctioned token (regression) ----------------------
# The platform sets a GH_TOKEN that does NOT authenticate. It outranks any
# stored credential, so `--with-token` cannot win. The hook branches on the
# `gh auth status` probe and logs the fault with its fix.

@test "a PRESENT but non-authenticating GH_TOKEN is diagnosed, not silently trusted (regression)" {
  run run_bootstrap env GH_TOKEN=placeholder BKIT_GH_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [[ "$output" == *"WARNING"* ]]
  [[ "$output" == *"does NOT authenticate"* ]]
  # Must NOT claim the lane is fine.
  [[ "$output" != *"gh already authenticates"* ]]
  # Must name where the fix actually lives.
  [[ "$output" == *"Environment variables"* ]]
}

@test "the placeholder diagnosis does not pretend a --with-token login would help (regression)" {
  # gh reads GH_TOKEN ahead of stored credentials, so attempting the login here
  # would report success while gh stayed broken — a false green.
  run run_bootstrap env GITHUB_TOKEN=placeholder BKIT_GH_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [[ "$output" != *"gh auth login --with-token invoked"* ]]
  [[ "$output" == *"does NOT authenticate"* ]]
}

@test "the placeholder path still records RUNTIME_GITHUBCLI=false and never hard-stops the session" {
  run run_bootstrap env GH_TOKEN=placeholder BKIT_GH_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [ "$status" -eq 0 ]
  [[ "$output" == *"RUNTIME_GITHUBCLI=false"* ]]
}

@test "gh absent from PATH is stated plainly rather than falling through silently" {
  # gh-free PATH (see NO_GH_BIN in setup): the hook must say the MCP lane is the
  # only one left.
  run env -i PATH="$NO_GH_BIN" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$WORKDIR" bash "$BOOTSTRAP_SH" </dev/null
  [ "$status" -eq 0 ]
  [[ "$output" == *"gh is not on PATH"* ]]
}

@test "records RUNTIME_GITHUBCLI=true loudly when gh is authed" {
  run run_bootstrap env GH_TOKEN=sanctioned-token FAKE_GH_AUTH_OK=1
  [[ "$output" == *"gh-preflight: RUNTIME_GITHUBCLI=true"* ]]
}

@test "records RUNTIME_GITHUBCLI=false loudly when gh is not authed" {
  run run_bootstrap env FAKE_GH_AUTH_OK=0
  [[ "$output" == *"gh-preflight: RUNTIME_GITHUBCLI=false"* ]]
}

@test "emits the dual-lane WARNING (non-blocking) when RUNTIME_GITHUBCLI=false and no credential env is set at all" {
  run run_bootstrap env FAKE_GH_AUTH_OK=0
  [ "$status" -eq 0 ]
  [[ "$output" == *"DUAL-LANE WARNING"* ]]
}

@test "does NOT emit the dual-lane WARNING when RUNTIME_GITHUBCLI=false but BKIT_GH_TOKEN is set (MCP lane still viable)" {
  run run_bootstrap env BKIT_GH_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [[ "$output" != *"DUAL-LANE WARNING"* ]]
}

@test "the hook never hard-stops the session (always exits 0) even on the dual-lane warning path" {
  run run_bootstrap env FAKE_GH_AUTH_OK=0
  [ "$status" -eq 0 ]
}

# --- bkit-backed blocks -------------------------------------------------------

@test "without bkit installed, gh still logs in from BKIT_GH_TOKEN and provisioning is skipped loudly" {
  rm "$WORKDIR/node_modules/.bin/bkit"
  mkdir -p "$WORKDIR/.agents"
  printf '<!-- bkit:end -->\n' >"$WORKDIR/.agents/context.md"
  run run_bootstrap env BKIT_GH_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [ "$status" -eq 0 ]
  [[ "$output" == *"gh auth login --with-token invoked"* ]]
  [[ "$output" == *"RUNTIME_GITHUBCLI="* ]]
  [[ "$output" == *"context-fetch provisioning: SKIPPED"* ]]
}

@test "without jq, gh still logs in from BKIT_GH_TOKEN" {
  rm "$FAKE_BIN/jq"
  run run_bootstrap env BKIT_GH_TOKEN=bkit-token FAKE_GH_AUTH_OK=0
  [ "$status" -eq 0 ]
  [[ "$output" == *"gh auth login --with-token invoked"* ]]
  [[ "$output" == *"RUNTIME_GITHUBCLI="* ]]
}

@test "runs each context-fetch:provision recipe below bkit:end through bkit context provision" {
  mkdir -p "$WORKDIR/.agents"
  cat >"$WORKDIR/.agents/context.md" <<'EOF'
<!-- context-fetch:provision managed-example -->
```bash
echo "PROVISIONED-managed-example" >&2
```
<!-- context-fetch:end -->
<!-- bkit:end -->
<!-- context-fetch:provision mycli -->
```bash
echo "PROVISIONED-mycli" >&2
```
<!-- context-fetch:end -->
EOF
  run run_bootstrap env FAKE_GH_AUTH_OK=1 HOME="$WORKDIR"
  [ "$status" -eq 0 ]
  [[ "$output" == *"provisioning from .agents/context.md (bkit context provision)"* ]]
  [[ "$output" == *"PROVISIONED-mycli"* ]]
  [[ "$output" != *"PROVISIONED-managed-example"* ]]
  [ ! -e "$WORKDIR/.bkit/.unavailable" ]
}

@test "a failing provision recipe is named on stdout for the agent and listed in .bkit/.unavailable" {
  mkdir -p "$WORKDIR/.agents"
  cat >"$WORKDIR/.agents/context.md" <<'EOF'
<!-- bkit:end -->
<!-- context-fetch:provision supabase-local -->
```bash
echo "local Supabase unavailable: 3 GB free, needs 10 GB" >&2
exit 1
```
<!-- context-fetch:end -->
EOF
  printf '' | env -i PATH="$FAKE_BIN:/usr/bin:/bin" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$WORKDIR" \
    FAKE_GH_AUTH_OK=1 HOME="$WORKDIR" bash "$BOOTSTRAP_SH" >"$WORKDIR/hook.stdout" 2>"$WORKDIR/hook.stderr"
  grep -q "provision 'supabase-local' failed (non-blocking): local Supabase unavailable" "$WORKDIR/hook.stderr"
  grep -q "^Cloud setup could not provide these in this session" "$WORKDIR/hook.stdout"
  grep -qx "supabase-local: local Supabase unavailable: 3 GB free, needs 10 GB" "$WORKDIR/hook.stdout"
  grep -qx "supabase-local: local Supabase unavailable: 3 GB free, needs 10 GB" "$WORKDIR/.bkit/.unavailable"
}
