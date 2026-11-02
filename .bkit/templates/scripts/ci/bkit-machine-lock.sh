#!/bin/bash
# Example. Copy into scripts/ci/ and own it.
# bkit install does not write this file and does not overwrite a copy.
#
# bkit-machine-lock.sh — machine-wide named locks and the checkout's shared stack lock.
#
#   . scripts/ci/bkit-machine-lock.sh
#   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy
#   release_local_stack_lock [name]        # optional; caller exit also frees the lock
#   local_stack_lock_holder [name]
#   local_stack_lock_file [name]
#
# package.json: wrap test gates with
#   bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command> [args…]
# run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
# 2 usage, 73 the lock could not be taken, 75 the wait gave up.
# The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
#
# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
# Each holder records its checkout, process id and start time.
#
# Take locks in this order: tests, other named locks, then the unnamed stack lock.
# A child reuses only the named or unnamed lock its live parent holds.
# CI=true / CI=1 is a no-op. LOCAL_STACK_LOCK_WAIT_S caps the wait (default 3600).
# A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
# Requires Bash 3.2+ and /usr/bin/perl.

_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
LOCAL_STACK_LOCK_PID="${LOCAL_STACK_LOCK_PID:-}"
_LOCAL_STACK_LOCK_EXIT=73

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

# A named lock has one machine-wide path; the unnamed path remains stack-scoped.
local_stack_lock_file() {
  local _lsl_stack
  if [ -n "${1:-}" ]; then
    _lsl_stack="$(printf '%s' "$1" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/${_lsl_stack}.lock"
  else
    _lsl_stack="$(local_stack_lock_name)" || return 1
    echo "${XDG_CACHE_HOME:-$HOME/.cache}/bkit/local-stack-lock/${_lsl_stack}.lock"
  fi
}

# "<who> — <checkout> (pid N, since HH:MM:SS)" for the run holding the lock.
local_stack_lock_holder() {
  local _lsl_held
  _lsl_held="$(local_stack_lock_file "${1:-}")" || return 0
  cat "${_lsl_held}.holder" 2>/dev/null
  return 0
}

_local_stack_lock_vars() {
  local _lsl_key
  _lsl_key="$(printf '%s' "${1:-}" | LC_ALL=C tr -c 'A-Za-z0-9_' '_')"
  _lsl_pid_var="LOCAL_STACK_LOCK_PID"
  _lsl_owner_var="LOCAL_STACK_LOCK_OWNER"
  if [ -n "${1:-}" ]; then
    _lsl_pid_var="${_lsl_pid_var}_${_lsl_key}"
    _lsl_owner_var="${_lsl_owner_var}_${_lsl_key}"
  fi
}

_local_stack_lock() {
  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
  local _lsl_pid_var _lsl_owner_var _lsl_owner _lsl_existing
  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
  _LOCAL_STACK_LOCK_EXIT=73
  _local_stack_lock_vars "$_lsl_name"
  _lsl_owner="${!_lsl_owner_var}"
  _lsl_existing="${!_lsl_pid_var}"
  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
  if [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null; then return 0; fi
  if [ -n "$_lsl_existing" ] && kill -0 "$_lsl_existing" 2>/dev/null; then return 0; fi

  if ! _lsl_file="$(local_stack_lock_file "$_lsl_name")"; then
    echo "[machine-lock] ❌ cannot name the local stack: run inside a git checkout, or set BKIT_LOCAL_STACK" >&2
    return 1
  fi
  _lsl_label="the local stack $(basename "$_lsl_file" .lock)"
  _lsl_checkout="$_LOCAL_STACK_LOCK_ROOT"
  if [ -n "$_lsl_name" ]; then
    _lsl_label="$_lsl_name"
    _lsl_checkout="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")"
  fi
  if [ ! -x /usr/bin/perl ]; then
    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: /usr/bin/perl not found" >&2
    return 1
  fi
  if ! mkdir -p "$(dirname "$_lsl_file")"; then
    echo "[machine-lock] ❌ could not take the lock for $_lsl_label: cannot create $(dirname "$_lsl_file")" >&2
    return 1
  fi
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
        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far: in use by " . $holder->() . "\n";
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
  ' "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "${LOCAL_STACK_LOCK_WAIT_S:-3600}" "$_lsl_mode" "$_lsl_label" </dev/null >/dev/null &
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
      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
        # The holder may have answered and exited between the read timing out and this check.
        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_line"; fi
        break
      fi
    done
  )" || true
  rm -f "$_lsl_fifo"

  case "$_lsl_reply" in
    ok)
      printf -v "$_lsl_pid_var" '%s' "$_lsl_pid"
      printf -v "$_lsl_owner_var" '%s' "$$"
      export "$_lsl_owner_var"
      return 0
      ;;
    busy\ *)
      _LOCAL_STACK_LOCK_EXIT=75
      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
      ;;
    timeout\ *)
      _LOCAL_STACK_LOCK_EXIT=75
      echo "[machine-lock] ❌ $_lsl_who gave up after ${LOCAL_STACK_LOCK_WAIT_S:-3600}s waiting for $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
      echo "[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait." >&2
      ;;
    "")
      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: the perl process holding it stopped before it answered" >&2
      ;;
    *)
      echo "[machine-lock] ❌ could not take the lock for $_lsl_label: ${_lsl_reply#error }" >&2
      ;;
  esac
  wait "$_lsl_pid" 2>/dev/null || true
  return 1
}

take_local_stack_lock() { _local_stack_lock wait "$1" "${2:-}"; }
try_local_stack_lock() { _local_stack_lock try "$1" "${2:-}"; }

release_local_stack_lock() {
  local _lsl_pid_var _lsl_owner_var _lsl_release_pid
  _local_stack_lock_vars "${1:-}"
  _lsl_release_pid="${!_lsl_pid_var}"
  [ -n "$_lsl_release_pid" ] || return 0
  kill "$_lsl_release_pid" 2>/dev/null || true
  wait "$_lsl_release_pid" 2>/dev/null || true
  printf -v "$_lsl_pid_var" '%s' ""
  unset "$_lsl_owner_var"
  return 0
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  _lsl_run_usage() {
    echo 'usage: bash scripts/ci/bkit-machine-lock.sh run ["<who>"] [--lock <name>] -- <command> [args…]' >&2
    exit 2
  }
  [ "${1:-}" = run ] || _lsl_run_usage
  shift
  _lsl_run_who="${LOCAL_STACK_LOCK_WHO:-${npm_lifecycle_event:-run}}"
  _lsl_run_name=""
  case "${1:-}" in
    --lock|--) ;;
    "") _lsl_run_usage ;;
    *) _lsl_run_who="$1"; shift ;;
  esac
  if [ "${1:-}" = --lock ]; then
    [ -n "${2:-}" ] && [ "$2" != -- ] || _lsl_run_usage
    _lsl_run_name="$2"
    shift 2
  fi
  [ "${1:-}" = -- ] || _lsl_run_usage
  shift
  [ "$#" -gt 0 ] || _lsl_run_usage
  take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
  "$@"
  _lsl_run_status=$?
  release_local_stack_lock "$_lsl_run_name"
  exit "$_lsl_run_status"
fi
