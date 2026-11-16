#!/usr/bin/env bats
# bkit-cloud-bootstrap-preflight.bats — Unit tests for the gh-preflight block in
# bkit-cloud-bootstrap.sh.
#
# Covers: prefers the sanctioned GH_TOKEN env var over `--with-token`;
# records RUNTIME_GITHUBCLI loudly (always, not just on failure); emits a loud
# NON-BLOCKING dual-lane signal when neither gh nor the GitHub MCP server
# (both keyed off BKIT_GH_TOKEN) can authenticate — never a hook hard-stop
# (SessionStart hooks cannot block the session); compares
# BKIT_CLOUD_ALLOWLIST_FINGERPRINT with .bkit/allowlist.json (the fingerprint block).
#
# Run: bats tests/shell/bkit-cloud-bootstrap-preflight.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
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

  # A tools-only PATH with gh (the fake) but NO jq, built the same way, so the
  # jq-absent case holds even on a host with /usr/bin/jq.
  NO_JQ_BIN="$(mktemp -d)"
  ln -s "$FAKE_BIN/gh" "$NO_JQ_BIN/gh"
  for tool in bash sh cat node git; do
    ln -s "$(command -v "$tool")" "$NO_JQ_BIN/$tool"
  done
}

teardown() {
  rm -rf "$FAKE_BIN" "$WORKDIR" "$NO_GH_BIN" "$NO_JQ_BIN"
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

# --- allowlist fingerprint compare ---------------------------------------------
# The hook compares BKIT_CLOUD_ALLOWLIST_FINGERPRINT (what the operator pasted into the
# cloud environment) with the `fingerprint` in .bkit/allowlist.json. Every outcome warns
# or reports and continues: a SessionStart hook never blocks the session.

@test "fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
  run run_bootstrap env FAKE_GH_AUTH_OK=1
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING"* ]]
  [[ "$output" == *"BKIT_CLOUD_ALLOWLIST_FINGERPRINT"* ]]
  [[ "$output" == *"abcd1234"* ]]
}

@test "fingerprint: warns naming both fingerprints when they differ, and continues" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=deadbeef
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING"* ]]
  [[ "$output" == *"abcd1234"* ]]
  [[ "$output" == *"deadbeef"* ]]
  [[ "$output" == *"gh-preflight: RUNTIME_GITHUBCLI=true"* ]]
}

@test "fingerprint: reports a match as operator-asserted with the deployed allowlist unverified" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234
  [ "$status" -eq 0 ]
  [[ "$output" == *"operator-asserted"* ]]
  [[ "$output" == *"unverified"* ]]
}

@test "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{"domains":["example.com"]}\n' >"$WORKDIR/.bkit/allowlist.json"
  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING"* ]]
  [[ "$output" == *"expected fingerprint"* ]]
  [[ "$output" == *"unavailable"* ]]

  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
  # jq is genuinely absent from the PATH the hook runs with.
  [ -z "$(PATH="$NO_JQ_BIN" command -v jq)" ]
  run bash -c 'printf "" | env -i PATH="$1" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$2" FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234 bash "$3"' _ "$NO_JQ_BIN" "$WORKDIR" "$BOOTSTRAP_SH"
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING"* ]]
  [[ "$output" == *"expected fingerprint"* ]]
  [[ "$output" == *"unavailable"* ]]
}

@test "fingerprint: rejects a value that is not 8 hex characters without echoing it" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT='not-hex-SECRET-value'
  [ "$status" -eq 0 ]
  [[ "$output" == *"not an 8-hex fingerprint"* ]]
  [[ "$output" != *"not-hex-SECRET-value"* ]]
}

@test "fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{ this is not json\n' >"$WORKDIR/.bkit/allowlist.json"
  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING"* ]]
  [[ "$output" == *"expected fingerprint"* ]]
  [[ "$output" == *"unavailable"* ]]
}

@test "fingerprint: the stale-allowlist warning reaches the session context on stdout" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
  # Only stdout reaches a cloud session's context, so discard stderr here.
  run bash -c 'printf "" | env -i PATH="$1" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$2" FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=deadbeef bash "$3" 2>/dev/null' _ "$FAKE_BIN:/usr/bin:/bin" "$WORKDIR" "$BOOTSTRAP_SH"
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING"* ]]
  [[ "$output" == *"abcd1234"* ]]
  [[ "$output" == *"deadbeef"* ]]
}

@test "fingerprint: every other warning reaches stdout, and a non-8-hex value never does" {
  mkdir -p "$WORKDIR/.bkit"
  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
  stdout_only() {
    bash -c 'printf "" | env -i PATH="$1" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$2" FAKE_GH_AUTH_OK=1 "${@:4}" bash "$3" 2>/dev/null' _ "$FAKE_BIN:/usr/bin:/bin" "$WORKDIR" "$BOOTSTRAP_SH" "$@"
  }
  # Unset: the warning names the variable and the expected fingerprint.
  run stdout_only
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING: BKIT_CLOUD_ALLOWLIST_FINGERPRINT is not set"* ]]
  [[ "$output" == *"abcd1234"* ]]
  # Not 8 hex characters: warned on stdout, the value is never printed.
  run stdout_only BKIT_CLOUD_ALLOWLIST_FINGERPRINT='not-hex-SECRET-value'
  [ "$status" -eq 0 ]
  [[ "$output" == *"not an 8-hex fingerprint"* ]]
  [[ "$output" != *"not-hex-SECRET-value"* ]]
  # Expected fingerprint unavailable.
  printf '{"domains":["example.com"]}\n' >"$WORKDIR/.bkit/allowlist.json"
  run stdout_only BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234
  [ "$status" -eq 0 ]
  [[ "$output" == *"WARNING: the expected fingerprint is unavailable"* ]]
}
