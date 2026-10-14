#!/usr/bin/env bats
# tests/launchd-env-loader.bats — scripts/launchd/bkit-launchd-env.sh against a stub `launchctl`.
#
# The stub appends each call ("setenv KEY VALUE" / "unsetenv KEY") to $CALLS and fails
# for any key listed in $STUB_FAIL_KEYS. Run: bats tests/launchd-env-loader.bats

LOADER="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)/scripts/launchd/bkit-launchd-env.sh"

setup() {
  WORK="$(mktemp -d)"
  export CALLS="$WORK/calls"
  export HOME="$WORK/home"
  mkdir -p "$WORK/bin" "$HOME"
  cat > "$WORK/bin/launchctl" <<'STUB'
#!/bin/sh
echo "$*" >> "$CALLS"
for k in $STUB_FAIL_KEYS; do
  [ "$2" = "$k" ] && exit 1
done
exit 0
STUB
  chmod +x "$WORK/bin/launchctl"
  export PATH="$WORK/bin:$PATH"
  export BKIT_LAUNCHD_LOG="$WORK/loader.log"
  ENV_FILE="$WORK/launchd.env"
  STATE_FILE="$WORK/.launchd-loaded-keys"
  : > "$CALLS"
}

teardown() {
  rm -rf "$WORK"
}

@test "sets BKIT_ keys, strips quotes and export prefix, records them in a 0600 state file" {
  printf '# c\nBKIT_A="one"\nexport BKIT_B='"'two'"'\n' > "$ENV_FILE"
  run sh "$LOADER" "$ENV_FILE"
  [ "$status" -eq 0 ]
  grep -qx 'setenv BKIT_A one' "$CALLS"
  grep -qx 'setenv BKIT_B two' "$CALLS"
  [ "$(sort "$STATE_FILE")" = "$(printf 'BKIT_A\nBKIT_B')" ]
  [ "$(stat -f %Lp "$STATE_FILE" 2>/dev/null || stat -c %a "$STATE_FILE")" = "600" ]
}

@test "a key removed from the env file is unset on the next run" {
  printf 'BKIT_A=one\nBKIT_B=two\n' > "$ENV_FILE"
  sh "$LOADER" "$ENV_FILE"
  : > "$CALLS"
  printf 'BKIT_A=one\n' > "$ENV_FILE"
  run sh "$LOADER" "$ENV_FILE"
  [ "$status" -eq 0 ]
  grep -qx 'unsetenv BKIT_B' "$CALLS"
  if grep -q 'unsetenv BKIT_A' "$CALLS"; then return 1; fi
  [ "$(cat "$STATE_FILE")" = "BKIT_A" ]
}

@test "an empty value unsets the key instead of setting an empty string" {
  printf 'BKIT_GH_TOKEN=""\nBKIT_OTHER=\n' > "$ENV_FILE"
  run sh "$LOADER" "$ENV_FILE"
  [ "$status" -eq 0 ]
  grep -qx 'unsetenv BKIT_GH_TOKEN' "$CALLS"
  grep -qx 'unsetenv BKIT_OTHER' "$CALLS"
  if grep -q '^setenv' "$CALLS"; then return 1; fi
}

@test "non-BKIT_ keys are skipped" {
  printf 'PATH=/evil\nBKIT_A=one\n' > "$ENV_FILE"
  run sh "$LOADER" "$ENV_FILE"
  [ "$status" -eq 0 ]
  if grep -q 'PATH' "$CALLS"; then return 1; fi
  grep -qx 'setenv BKIT_A one' "$CALLS"
}

@test "one failing key does not stop the others and the exit status is non-zero" {
  printf 'BKIT_A=one\nBKIT_BAD=x\nBKIT_C=three\n' > "$ENV_FILE"
  STUB_FAIL_KEYS="BKIT_BAD" run sh "$LOADER" "$ENV_FILE"
  [ "$status" -eq 1 ]
  grep -qx 'setenv BKIT_A one' "$CALLS"
  grep -qx 'setenv BKIT_C three' "$CALLS"
  grep -q 'setenv BKIT_BAD FAILED' "$BKIT_LAUNCHD_LOG"
}

@test "a failed unsetenv is retried on the next run" {
  printf 'BKIT_A=one\n' > "$ENV_FILE"
  sh "$LOADER" "$ENV_FILE"
  : > "$ENV_FILE"
  STUB_FAIL_KEYS="BKIT_A" run sh "$LOADER" "$ENV_FILE"
  [ "$status" -eq 1 ]
  : > "$CALLS"
  run sh "$LOADER" "$ENV_FILE"
  [ "$status" -eq 0 ]
  grep -qx 'unsetenv BKIT_A' "$CALLS"
  [ ! -s "$STATE_FILE" ]
}

@test "logs key names only, never values" {
  printf 'BKIT_A=supersecretvalue\n' > "$ENV_FILE"
  sh "$LOADER" "$ENV_FILE"
  if grep -q supersecretvalue "$BKIT_LAUNCHD_LOG"; then return 1; fi
}

@test "missing env file exits 0 without calling launchctl" {
  run sh "$LOADER" "$WORK/absent.env"
  [ "$status" -eq 0 ]
  [ ! -s "$CALLS" ]
}
