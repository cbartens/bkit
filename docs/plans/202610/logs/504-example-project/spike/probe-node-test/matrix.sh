#!/usr/bin/env bash
# Throwaway probe: invocation-form x node-version matrix for `node --test`
# with the app in a subfolder (`example/`), matching the persistent-repo layout.
# Forms:
#   F1  node --test example                       (draft's form: bare dir positional)
#   F2  node --test "example/**/*.test.js"        (review's prescribed correction)
#   F3  (cd example && node --test)               (run from inside the folder)
#   F4  node --test                               (bare, from root; recursive discovery)
set -u
root="$1"
run() { # label cmd   (caller is responsible for cwd)
  local label="$1"; shift
  local out rc
  out=$(eval "$@" 2>&1); rc=$?
  local tests pass
  tests=$(printf '%s\n' "$out" | sed -n 's/^[#ℹ] tests \([0-9][0-9]*\)$/\1/p' | tail -1)
  printf '%-4s %-46s rc=%-2s tests=%-4s first_err=%s\n' \
    "$(node -v)" "$label" "$rc" "${tests:-<none>}" \
    "$(printf '%s\n' "$out" | grep -m1 -E 'Could not find|Cannot find module|MODULE_NOT_FOUND|Error' | cut -c1-90)"
}
for spec in "tests-present:$root/withtests" "no-tests:$root/notests"; do
  name="${spec%%:*}"; dir="${spec#*:}"
  echo "=== $name ($dir) ==="
  (cd "$dir" && run "F1 node --test example" "node --test example")
  (cd "$dir" && run "F2 node --test \"example/**/*.test.js\"" "node --test \"example/**/*.test.js\"")
  (cd "$dir" && run "F3 (cd example && node --test)" "cd example && node --test")
  (cd "$dir" && run "F4 node --test (bare root)" "node --test")
  echo
done
