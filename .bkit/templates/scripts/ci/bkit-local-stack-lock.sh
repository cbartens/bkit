#!/bin/bash
# Example. Copy into scripts/ci/ and own it.
# bkit install does not write this file and does not overwrite a copy.
#
# bkit-local-stack-lock.sh — one run at a time on a local stack every checkout shares.
#
#   . scripts/ci/bkit-local-stack-lock.sh
#   take_local_stack_lock "<who>" || exit 1   # waits while another run holds it
#   try_local_stack_lock "<who>"              # returns 1 at once while another run holds it
#   release_local_stack_lock                  # optional: the lock frees itself when the caller exits
#
#   bash scripts/ci/bkit-local-stack-lock.sh run "<who>" -- <command> [args…]   # package.json
#
# WHY. Agents work in several worktrees of one repo at once, and every worktree talks to the
# SAME local services: a Docker database, an emulator, anything whose container names and ports
# come from the repo's config. Nothing stops two worktrees using them at once, so a database
# reset from one wipes the data under a test run in another, and a dev server that stops "its"
# stack on exit stops it under someone else's run. Both show up as test failures nobody caused.
# A run that starts, resets or stops the stack, or tests against it, takes this lock first; a
# second run waits and says who it is waiting for.
#
# Wiring:
#   - package.json: wrap each script that starts, resets or stops the stack, e.g.
#     "db:reset": "bash scripts/ci/bkit-local-stack-lock.sh run db:reset -- <your reset command>"
#   - local runners that test against the stack: source this file and call take_local_stack_lock
#     before the first command that touches the stack.
#   - fix hints and docs name those scripts, never the raw command, which skips the lock.
#
# The lock is named after the stack: BKIT_LOCAL_STACK when set, otherwise the folder name of the
# repo's main checkout, so every worktree of one repo finds the same lock. A throwaway stack with
# names and ports of its own sets BKIT_LOCAL_STACK to its own name and never waits on the shared
# one. The lock file sits outside the checkout: ~/.cache/bkit/local-stack-lock/<name>.lock
# ($XDG_CACHE_HOME when set). A small perl process holds it (flock) and exits within a second of
# the caller exiting, however the caller ends (its parent changes), so a killed run cannot leave
# a stale lock behind. perl by its full path, so a PATH shim cannot stand in for it.
#
# A runner started by a runner that holds the lock (LOCAL_STACK_LOCK_OWNER, exported on success)
# does not wait on its own parent. Safe under a caller's `set -e`. CI (CI=true or CI=1): no-op,
# as a CI runner has one job and its own Docker. LOCAL_STACK_LOCK_WAIT_S (default 3600) caps
# the wait. Needs bash and /usr/bin/perl (macOS and Linux ship both).

_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
LOCAL_STACK_LOCK_PID=""

# The stack's name: BKIT_LOCAL_STACK, else the main checkout's folder name, the same from every
# worktree. Characters outside A-Z a-z 0-9 . _ - become _.
local_stack_lock_name() {
  _lsl_name="${BKIT_LOCAL_STACK:-}"
  if [ -z "$_lsl_name" ]; then
    _lsl_common="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
    [ -n "$_lsl_common" ] || return 1
    case "$(basename "$_lsl_common")" in
      .git) _lsl_name="$(basename "$(dirname "$_lsl_common")")" ;;
      *) _lsl_name="$(basename "$_lsl_common" .git)" ;;
    esac
  fi
  printf '%s\n' "$_lsl_name" | LC_ALL=C tr -c 'A-Za-z0-9._\n-' '_'
}

# The lock file for the stack this checkout uses.
local_stack_lock_file() {
  _lsl_stack="$(local_stack_lock_name)" || return 1
  echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/${_lsl_stack}.lock"
}

# "<who> — <checkout> (pid N, since HH:MM:SS)" for the run holding the lock, or nothing.
local_stack_lock_holder() {
  _lsl_held="$(local_stack_lock_file)" || return 0
  cat "${_lsl_held}.holder" 2>/dev/null
  return 0
}

_local_stack_lock() {
  _lsl_mode="$1"
  _lsl_who="$2"
  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
  if [ -n "${LOCAL_STACK_LOCK_OWNER:-}" ] && kill -0 "$LOCAL_STACK_LOCK_OWNER" 2>/dev/null; then return 0; fi
  if [ -n "$LOCAL_STACK_LOCK_PID" ] && kill -0 "$LOCAL_STACK_LOCK_PID" 2>/dev/null; then return 0; fi

  if ! _lsl_file="$(local_stack_lock_file)"; then
    echo "[local-stack-lock] ❌ cannot name the local stack: run inside a git checkout, or set BKIT_LOCAL_STACK" >&2
    return 1
  fi
  _lsl_label="$(basename "$_lsl_file" .lock)"
  if [ ! -x /usr/bin/perl ]; then
    echo "[local-stack-lock] ❌ could not take the lock for the local stack $_lsl_label: /usr/bin/perl not found" >&2
    return 1
  fi
  mkdir -p "$(dirname "$_lsl_file")" || return 1
  _lsl_fifo="$(mktemp -u "${TMPDIR:-/tmp}/local-stack-lock.XXXXXX")"
  mkfifo "$_lsl_fifo" || return 1

  # The holder answers on the fifo once: ok, busy <holder>, timeout <holder> or error <why>.
  /usr/bin/perl -e '
    use strict;
    use Fcntl qw(:flock);
    use POSIX qw(strftime);
    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label) = @ARGV;
    # The caller is the parent of this process. When it exits, this process goes to init (or a
    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
    my $parent = getppid();
    my $caller_alive = sub { getppid() == $parent };
    open(my $out, ">", $fifo) or exit 1;
    $out->autoflush(1);
    my $holder = sub { open(my $h, "<", "$file.holder") or return "another run"; my $l = <$h>; chomp $l; $l };
    my $lock;
    open($lock, ">>", $file) or do { print $out "error cannot open $file: $!\n"; exit 1 };
    my $start = time;
    my $next_note = 0;
    until (flock($lock, LOCK_EX | LOCK_NB)) {
      exit 0 unless $caller_alive->();
      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
      if (time >= $next_note) {
        my $m = int((time - $start) / 60);
        my $so_far = $m ? " (still, $m min so far)" : "";
        print STDERR "[local-stack-lock] ⏳ $who is waiting for the local stack $label$so_far: in use by " . $holder->() . "\n";
        $next_note = time + 60;
      }
      sleep 1;
    }
    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { unlink "$file.holder"; exit 0 };
    if (open(my $h, ">", "$file.holder")) {
      print $h "$who — $checkout (pid $owner, since " . strftime("%H:%M:%S", localtime) . ")\n";
      close $h;
    }
    print $out "ok\n";
    close $out;
    sleep 1 while $caller_alive->();
    unlink "$file.holder";
  ' "$_lsl_file" "$$" "$_lsl_who" "$_LOCAL_STACK_LOCK_ROOT" "$_lsl_fifo" "${LOCAL_STACK_LOCK_WAIT_S:-3600}" "$_lsl_mode" "$_lsl_label" </dev/null >/dev/null &
  _lsl_pid=$!
  # The fifo is opened read-write, so the read never blocks on a holder that died before it
  # answered (a failed fork under load, a killed perl): the loop stops once it is gone.
  _lsl_reply="$(
    exec 3<>"$_lsl_fifo"
    while :; do
      if IFS= read -r -t 1 _lsl_line <&3; then
        printf '%s' "$_lsl_line"
        break
      fi
      kill -0 "$_lsl_pid" 2>/dev/null || break
    done
  )" || true
  rm -f "$_lsl_fifo"

  case "$_lsl_reply" in
    ok)
      LOCAL_STACK_LOCK_PID="$_lsl_pid"
      export LOCAL_STACK_LOCK_OWNER="$$"
      return 0
      ;;
    busy\ *)
      echo "[local-stack-lock] the local stack $_lsl_label is in use by ${_lsl_reply#busy }" >&2
      ;;
    timeout\ *)
      echo "[local-stack-lock] ❌ $_lsl_who gave up after ${LOCAL_STACK_LOCK_WAIT_S:-3600}s waiting for the local stack $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
      echo "[local-stack-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait." >&2
      ;;
    "")
      echo "[local-stack-lock] ❌ could not take the lock for the local stack $_lsl_label: the perl process holding it stopped before it answered" >&2
      ;;
    *)
      echo "[local-stack-lock] ❌ could not take the lock for the local stack $_lsl_label: ${_lsl_reply#error }" >&2
      ;;
  esac
  wait "$_lsl_pid" 2>/dev/null || true
  return 1
}

take_local_stack_lock() { _local_stack_lock wait "$1"; }
try_local_stack_lock() { _local_stack_lock try "$1"; }

release_local_stack_lock() {
  [ -n "$LOCAL_STACK_LOCK_PID" ] || return 0
  kill "$LOCAL_STACK_LOCK_PID" 2>/dev/null || true
  wait "$LOCAL_STACK_LOCK_PID" 2>/dev/null || true
  LOCAL_STACK_LOCK_PID=""
  unset LOCAL_STACK_LOCK_OWNER
  return 0
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  if [ "${1:-}" != "run" ] || [ -z "${2:-}" ]; then
    echo "usage: bash scripts/ci/bkit-local-stack-lock.sh run \"<who>\" -- <command> [args…]" >&2
    exit 2
  fi
  _lsl_run_who="$2"
  shift 2
  [ "${1:-}" = "--" ] && shift
  take_local_stack_lock "$_lsl_run_who" || exit 1
  "$@"
fi
