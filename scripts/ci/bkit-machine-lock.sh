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
# TERM, INT and HUP defer cancellation until the foreground command ends, keeping
# its lock held throughout; the wrapper then returns the signal's exit status.
#
# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
# Each holder records its checkout, process id and start time.
#
# Take locks in this order: tests, other named locks, then the unnamed stack lock.
# A child reuses only the named or unnamed lock its live parent holds.
# BKIT_TEST_SLOTS sets the tests slots (whole number >= 1, default 1). Taking tests
# exports BKIT_TEST_WORKERS=max(1, floor(cores / slots) - 1) for the runner to use.
# LOCAL_STACK_LOCK_WAIT_S caps the wait; otherwise it is 60s without a TTY, 3600s
# with a TTY. Named releases save each checkout's held seconds in <name>.last.
# Waiting notes name every holder and that checkout's last run. CI=true / CI=1 is a no-op.
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
  local _lsl_held _lsl_slot
  _lsl_held="$(local_stack_lock_file "${1:-}")" || return 0
  if [ -f "${_lsl_held}.holder" ]; then
    cat "${_lsl_held}.holder"
  fi
  if [ "${1:-}" = tests ]; then
    for _lsl_slot in "${_lsl_held%.lock}".[0-9]*.lock.holder; do
      [ -f "$_lsl_slot" ] && cat "$_lsl_slot"
    done
  fi
  return 0
}

_local_stack_lock_slots() {
  _lsl_slots="${BKIT_TEST_SLOTS-1}"
  case "$_lsl_slots" in
    *[!0-9]*|"") _lsl_slots=0 ;;
    *) _lsl_slots=$((10#$_lsl_slots)) ;;
  esac
  if [ "$_lsl_slots" -lt 1 ]; then
    if [ "${_LOCAL_STACK_LOCK_SLOTS_NOTED:-}" != 1 ]; then
      echo "[machine-lock] invalid BKIT_TEST_SLOTS; using 1 slot" >&2
      _LOCAL_STACK_LOCK_SLOTS_NOTED=1
    fi
    _lsl_slots=1
  fi
}

_local_stack_lock_workers() {
  local _lsl_cores="" _lsl_probe
  for _lsl_probe in getconf nproc sysctl; do
    case "$_lsl_probe" in
      getconf) _lsl_cores="$(getconf _NPROCESSORS_ONLN 2>/dev/null)" || continue ;;
      nproc) _lsl_cores="$(nproc 2>/dev/null)" || continue ;;
      sysctl) _lsl_cores="$(sysctl -n hw.ncpu 2>/dev/null)" || continue ;;
    esac
    case "$_lsl_cores" in *[!0-9]*|""|0) continue ;; esac
    break
  done
  case "$_lsl_cores" in *[!0-9]*|""|0) _lsl_cores=1 ;; esac
  BKIT_TEST_WORKERS=$((_lsl_cores / _lsl_slots - 1))
  [ "$BKIT_TEST_WORKERS" -ge 1 ] || BKIT_TEST_WORKERS=1
  export BKIT_TEST_WORKERS
}

_local_stack_lock_vars() {
  local _lsl_key
  _lsl_key="$(printf '%s' "${1:-}" | LC_ALL=C tr -c 'A-Za-z0-9._-' '_')"
  _lsl_key="${_lsl_key//_/__}"
  _lsl_key="${_lsl_key//-/_h}"
  _lsl_key="${_lsl_key//./_d}"
  _lsl_pid_var="LOCAL_STACK_LOCK_PID"
  _lsl_owner_var="LOCAL_STACK_LOCK_OWNER"
  _lsl_name_var="LOCAL_STACK_LOCK_NAME"
  if [ -n "${1:-}" ]; then
    _lsl_pid_var="${_lsl_pid_var}_${_lsl_key}"
    _lsl_owner_var="${_lsl_owner_var}_${_lsl_key}"
    _lsl_name_var="${_lsl_name_var}_${_lsl_key}"
  fi
}

_local_stack_lock() {
  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
  local _lsl_pid_var _lsl_owner_var _lsl_name_var _lsl_owner _lsl_existing
  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
  local _lsl_slots=1 _lsl_wait _lsl_var _lsl_held_name _lsl_held_name_var
  _LOCAL_STACK_LOCK_EXIT=73
  _local_stack_lock_vars "$_lsl_name"
  _lsl_owner="${!_lsl_owner_var:-}"
  _lsl_existing="${!_lsl_pid_var:-}"
  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
  if [ "$_lsl_name" = tests ]; then
    _local_stack_lock_slots
    _local_stack_lock_workers
  fi
  if [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null; then return 0; fi
  if [ -n "$_lsl_existing" ] && kill -0 "$_lsl_existing" 2>/dev/null; then return 0; fi
  if [ -n "$_lsl_name" ]; then
    for _lsl_var in ${!LOCAL_STACK_LOCK_OWNER*}; do
      _lsl_owner="${!_lsl_var:-}"
      [ -n "$_lsl_owner" ] && kill -0 "$_lsl_owner" 2>/dev/null || continue
      if [ "$_lsl_var" = LOCAL_STACK_LOCK_OWNER ] || [ "$_lsl_name" = tests ]; then
        _lsl_held_name_var="${_lsl_var/OWNER/NAME}"
        _lsl_held_name="${!_lsl_held_name_var:-the unnamed stack lock}"
        echo "[machine-lock] ❌ cannot take $_lsl_name while holding $_lsl_held_name: lock order is tests, other named locks, then the unnamed stack lock" >&2
        return 1
      fi
    done
  fi
  if [ "${LOCAL_STACK_LOCK_WAIT_S+x}" = x ]; then
    _lsl_wait="$LOCAL_STACK_LOCK_WAIT_S"
  elif [ -t 0 ]; then
    _lsl_wait=3600
  else
    _lsl_wait=60
  fi

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
    use File::Glob qw(bsd_glob);
    use POSIX qw(strftime);
    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label, $slots, $name) = @ARGV;
    # The caller is the parent of this process. When it exits, this process goes to init (or a
    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
    my $parent = getppid();
    my $caller_alive = sub { getppid() == $parent };
    open(my $out, ">", $fifo) or exit 1;
    $out->autoflush(1);
    my $stem = $file; $stem =~ s/\.lock$//;
    my $history = "$stem.last";
    my $holder = sub {
      my @files = ("$file.holder");
      push @files, grep { /^\Q$stem\E\.\d+\.lock\.holder$/ } bsd_glob("$stem.*.lock.holder") if $name eq "tests";
      my @holders;
      for my $held (@files) {
        open(my $h, "<", $held) or next;
        my $line = <$h>; close $h;
        next unless defined $line;
        chomp $line;
        if (length $name) {
          my ($held_checkout) = $line =~ / — (.*) \(pid /;
          my $duration;
          if (defined $held_checkout && open(my $last, "<", $history)) {
            while (my $row = <$last>) {
              chomp $row;
              my ($path, $seconds) = split /\t/, $row, 2;
              $duration = $seconds if $path eq $held_checkout && defined $seconds && $seconds =~ /^\d+$/;
            }
            close $last;
          }
          $line .= defined $duration ? ", last run took " . int($duration / 60) . "m" . ($duration % 60) . "s" : ", no earlier run";
        }
        push @holders, $line;
      }
      return @holders ? join("; ", @holders) : "another run";
    };
    my ($lock, $held_file);
    my $start = time;
    my $next_note = 0;
    while (1) {
      for my $slot (1 .. $slots) {
        my $candidate = $slot == 1 ? $file : "$stem.$slot.lock";
        open(my $next, ">>", $candidate) or do { print $out "error cannot open $candidate: $!\n"; exit 1 };
        if (flock($next, LOCK_EX | LOCK_NB)) { $lock = $next; $held_file = $candidate; last }
        close $next;
      }
      last if defined $lock;
      exit 0 unless $caller_alive->();
      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
      if (time - $start >= $wait_s) { print $out "timeout " . $holder->() . "\n"; exit 0 }
      if (time >= $next_note) {
        my $m = int((time - $start) / 60);
        my $so_far = $m ? " (still, $m min so far)" : "";
        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s): in use by " . $holder->() . "\n";
        $next_note = time + 60;
      }
      sleep 1;
    }
    my $stopping = 0;
    $SIG{TERM} = $SIG{INT} = $SIG{HUP} = sub { $stopping = 1 };
    my $held_since = time;
    if (open(my $h, ">", "$held_file.holder")) {
      print $h "$who — $checkout (pid $owner, since " . strftime("%H:%M:%S", localtime) . ")\n";
      close $h;
    }
    print $out "ok\n";
    close $out;
    sleep 1 while !$stopping && $caller_alive->();
    if (length $name) {
      # Serialize history updates across slots; the portable shell replaces just this checkout row.
      my $history_lock;
      if (open($history_lock, ">>", "$history.lock") && flock($history_lock, LOCK_EX)) {
        my $pattern = $checkout; $pattern =~ s/([.\[\]\\*^\$])/\\$1/g;
        $pattern = "^$pattern\t";
        my $status = system("bash", "-c", q{
          history="$1"; pattern="$2"; checkout="$3"; held="$4"
          tmp=$(mktemp "$history.XXXXXX") || exit 1
          if [ -f "$history" ]; then
            grep -v "$pattern" "$history" >"$tmp"
            code=$?
            if [ "$code" -gt 1 ]; then rm -f "$tmp"; exit 1; fi
          fi
          printf "%s\t%s\n" "$checkout" "$held" >>"$tmp" && mv "$tmp" "$history"
        }, "machine-lock-history", $history, $pattern, $checkout, time - $held_since);
        print STDERR "[machine-lock] could not record $name held time in $history\n" if $status;
        close $history_lock;
      } else { print STDERR "[machine-lock] could not lock $history for held-time history: $!\n" }
    }
    unlink "$held_file.holder";
  ' "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "$_lsl_wait" "$_lsl_mode" "$_lsl_label" "$_lsl_slots" "$_lsl_name" </dev/null >/dev/null &
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
      printf -v "$_lsl_name_var" '%s' "${_lsl_name:-the unnamed stack lock}"
      export "$_lsl_name_var"
      return 0
      ;;
    busy\ *)
      _LOCAL_STACK_LOCK_EXIT=75
      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
      ;;
    timeout\ *)
      _LOCAL_STACK_LOCK_EXIT=75
      echo "[machine-lock] ❌ $_lsl_who gave up after ${_lsl_wait}s waiting for $_lsl_label, in use by ${_lsl_reply#timeout }" >&2
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
  local _lsl_pid_var _lsl_owner_var _lsl_name_var _lsl_release_pid
  _local_stack_lock_vars "${1:-}"
  _lsl_release_pid="${!_lsl_pid_var:-}"
  [ -n "$_lsl_release_pid" ] || return 0
  kill "$_lsl_release_pid" 2>/dev/null || true
  wait "$_lsl_release_pid" 2>/dev/null || true
  printf -v "$_lsl_pid_var" '%s' ""
  unset "$_lsl_owner_var"
  unset "$_lsl_name_var"
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
  _lsl_run_signal_status=0
  _lsl_run_cancel() {
    _lsl_run_signal_status="$1"
    echo "[machine-lock] cancellation requested; waiting for $_lsl_run_who to finish before releasing its lock" >&2
  }
  # Bash runs these traps after its foreground command ends. Keeping this owner
  # alive also keeps the Perl holder alive while that command finishes naturally.
  trap '_lsl_run_cancel 143' TERM
  trap '_lsl_run_cancel 130' INT
  trap '_lsl_run_cancel 129' HUP
  "$@"
  _lsl_run_status=$?
  release_local_stack_lock "$_lsl_run_name"
  [ "$_lsl_run_signal_status" -eq 0 ] || _lsl_run_status="$_lsl_run_signal_status"
  exit "$_lsl_run_status"
fi
