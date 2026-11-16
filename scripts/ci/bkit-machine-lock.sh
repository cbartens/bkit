#!/bin/bash
# Example. Copy into scripts/ci/ and own it.
# bkit install does not write this file and does not overwrite a copy.
#
# bkit-machine-lock.sh — machine-wide named locks and the checkout's shared stack lock.
#
#   . scripts/ci/bkit-machine-lock.sh
#   take_local_stack_lock "<who>" [name]    # waits, returns 1 on refusal
#   try_local_stack_lock "<who>" [name]     # returns 1 immediately while busy or runs wait in line
#   release_local_stack_lock [name]        # optional; caller exit also frees the lock
#   local_stack_lock_holder [name]
#   local_stack_lock_file [name]
#
# package.json: wrap test gates with
#   bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command> [args…]
# run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
# 2 usage, 73 the lock could not be taken, 75 the wait gave up, 124 the hold limit stopped it.
# A run that took the tests lock holds it at most LOCAL_STACK_LOCK_HOLD_S seconds (whole number
# >= 1, default 3600; an invalid value falls back with one note). At the limit it sends TERM to the
# command and every process started under it, KILL to those still running after
# LOCAL_STACK_LOCK_HOLD_GRACE_S seconds (default 10), frees the lock, prints a [machine-lock]
# line naming the holder, the time held and the limit, and exits 124. Other locks, a run that
# reuses its live parent's lock, and CI have no limit. Under the limit the command must be a
# program on PATH; wrap shell code in sh -c '…'. The processes under the command are found with
# ps (procps on Linux); without a ps that prints lstart, one note says the limit stops only the
# command itself. A process whose parent exits within a second of starting it may survive the
# stop; it does not hold the lock, but it may keep the caller's output pipe open.
# With LOCAL_STACK_LOCK_STATUS_FILE set, a 73 or 75 also writes that file (a temp file beside it,
# then a rename) as three LF-ended lines: lock=<name>, outcome=refused or outcome=gave-up, and
# holder=<each holder's "who — checkout (pid N, since HH:MM:SS)" note, joined by "; ">. Read the
# outcome from this file and the exit code, never from the printed lines. run unsets the variable
# for its command, so a nested wrapper never writes the file.
# The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
#   bash scripts/ci/bkit-machine-lock.sh slots    # prints "slots=N workers=N" for this run, exit 0
#   bash scripts/ci/bkit-machine-lock.sh queue [--lock <name>]
#     prints one "<who> — <checkout>" line per waiting run and held place, in queue order, exit 0
#   bash scripts/ci/bkit-machine-lock.sh jump [--lock <name>] <who> [<checkout>]
#     moves that run to the front: exit 0 printing its line, 1 none matches, 3 several match
#     (printing them); queue and jump default to the tests lock.
# TERM, INT and HUP that reach a run holding its own tests lock are passed on to the command (INT
# only when the run does not have the terminal, since Ctrl-C reaches the command directly); the
# lock stays held until the command ends, and the wrapper then returns the signal's exit status.
# Any other run defers them until its command ends.
#
# Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
# repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
# LOCAL_STACK_LOCK_OWNER / LOCAL_STACK_LOCK_PID names, so adopted copies still work.
# Named owners use LOCAL_STACK_LOCK_OWNER_<key> and LOCAL_STACK_LOCK_PID_<key>.
# Each holder records its checkout, process id and start time.
#
# Take locks in this order: tests, other named locks, then the unnamed stack lock.
# A child reuses only the named or unnamed lock its live parent holds.
# The tests slots default, for a local run only, to 2 with 8 or more cores, else 1; any other
# runtime defaults to 1. A run is not local when BKIT_RUNTIME is set to anything but LOCAL; with
# BKIT_RUNTIME unset, when .bkit/.runtime-cursor exists in the main checkout or CLAUDE_CODE_REMOTE
# is set to anything but empty, false, FALSE, False, 0, no or NO. BKIT_TEST_SLOTS (whole number
# >= 1) overrides. Taking tests exports BKIT_TEST_WORKERS=max(1, floor(cores / slots) - 1) for the
# runner to use.
# LOCAL_STACK_LOCK_WAIT_S caps the wait; otherwise it is 60s without a TTY, 3600s
# with a TTY. Named releases save each checkout's held seconds in <name>.last.
# Waiting notes name every holder, that checkout's last run and the run's place in line.
# CI=true / CI=1 is a no-op.
# Waiters are served in the order they started waiting: each keeps a ticket in a <name>.queue/
# folder beside its lock file, flock-held while it waits. The ticket's first line is
# "<who> — <checkout>" and its second line slots=N, the slots the waiter asks for. A waiter may take
# slot k only while no live ticket ahead of it asks for k or more slots, so equal asks keep arrival
# order and a 1-slot waiter ahead never blocks slot 2; a ticket with no slots= line asks for every
# slot. A ticket of a dead waiter is skipped and removed. A waiter that gives up leaves its
# ticket as <ticket>.held for 120s, so the same run asking again keeps its place in line.
# A <ms>.jump marker in the queue (written by jump) moves the waiter whose line it names to
# the front, newest marker first; the holder keeps the lock. The waiter's own markers go when it takes the lock.
# A Perl flock holder exits within a second of its caller; killed callers leave no stale lock.
# Requires Bash 3.2+ and /usr/bin/perl.

_LOCAL_STACK_LOCK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_LOCAL_STACK_LOCK_ROOT="$(git -C "$_LOCAL_STACK_LOCK_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_LOCAL_STACK_LOCK_DIR")"
LOCAL_STACK_LOCK_PID="${LOCAL_STACK_LOCK_PID:-}"
_LOCAL_STACK_LOCK_EXIT=73
_LOCAL_STACK_LOCK_HOLDER=""

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

_local_stack_lock_cores() {
  local _lsl_probe
  _lsl_cores=""
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
}

# Whether this run is local, read in the order bkit's runtime detection reads it: a set
# BKIT_RUNTIME decides alone; else the Cursor marker in the main checkout means not local; else
# CLAUDE_CODE_REMOTE set to anything but an empty or false value means not local.
_local_stack_lock_local() {
  local _lsl_common
  if [ -n "${BKIT_RUNTIME:-}" ]; then
    if [ "$BKIT_RUNTIME" = LOCAL ]; then return 0; fi
    return 1
  fi
  _lsl_common="$(git -C "$PWD" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || _lsl_common=""
  if [ -n "$_lsl_common" ] && [ -e "$(dirname "$_lsl_common")/.bkit/.runtime-cursor" ]; then
    return 1
  fi
  case "${CLAUDE_CODE_REMOTE:-}" in
    ""|false|FALSE|False|0|no|NO) return 0 ;;
  esac
  return 1
}

_local_stack_lock_slots() {
  local _lsl_default=1
  if [ "${BKIT_TEST_SLOTS+x}" = x ]; then
    _lsl_slots="$BKIT_TEST_SLOTS"
    case "$_lsl_slots" in
      *[!0-9]*|"") _lsl_slots=0 ;;
      *) _lsl_slots=$((10#$_lsl_slots)) ;;
    esac
    if [ "$_lsl_slots" -ge 1 ]; then return 0; fi
  fi
  if [ "$_lsl_cores" -ge 8 ] && _local_stack_lock_local; then _lsl_default=2; fi
  if [ "${BKIT_TEST_SLOTS+x}" = x ] && [ "${_LOCAL_STACK_LOCK_SLOTS_NOTED:-}" != 1 ]; then
    echo "[machine-lock] invalid BKIT_TEST_SLOTS; using $_lsl_default slot(s)" >&2
    _LOCAL_STACK_LOCK_SLOTS_NOTED=1
  fi
  _lsl_slots="$_lsl_default"
}

_local_stack_lock_workers() {
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

# The perl helper every lock take starts in the background, and the queue and jump subcommands
# run on their own. It execs, so a background helper is the perl process itself and its parent is
# the caller it watches.
_local_stack_lock_helper() {
  exec /usr/bin/perl -e '
    use strict;
    use Fcntl qw(:flock);
    use File::Glob qw(bsd_glob);
    use POSIX qw(strftime);
    use Time::HiRes qw(clock_gettime CLOCK_MONOTONIC);
    my ($file, $owner, $who, $checkout, $fifo, $wait_s, $mode, $label, $slots, $name) = @ARGV;
    # The caller is the parent of this process. When it exits, this process goes to init (or a
    # subreaper) at once, while `kill 0` would still find it until whoever started it reaps it.
    my $parent = getppid();
    my $caller_alive = sub { getppid() == $parent };
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
    my $queue = "$stem.queue";
    my ($ticket, $ticket_fh);
    END { unlink $ticket if defined $ticket }
    $SIG{TERM} = sub { exit 0 };
    for my $sig (qw(INT HUP)) { $SIG{$sig} = sub { exit 0 } unless defined $SIG{$sig} && $SIG{$sig} eq "IGNORE" }
    my $ordinal = sub {
      my $n = shift;
      my $suffix = ($n % 100 >= 11 && $n % 100 <= 13) ? "th" : (qw(th st nd rd th th th th th th))[$n % 10];
      return "$n$suffix";
    };
    # Live tickets and held places sorted by arrival, except that an entry whose line a <ms>.jump
    # marker names goes first (newest marker first); dead tickets (flock can be taken), held places
    # older than 120s and markers naming no live ticket or held place are removed; every other name
    # is left alone. Each entry is [seconds, microseconds, pid, ours, line, slots asked, held].
    # Keeps the sorted entries in @order and returns (our place, live tickets, the most slots a
    # live ticket ahead of ours asks for, 0 with none ahead). A ticket with no slots= line asks for
    # every slot.
    my $every = 1e9;
    my @order;
    my $first_line = sub {
      my $path = shift;
      open(my $fh, "<", $path) or return undef;
      my $first = <$fh>; close $fh;
      return undef unless defined $first;
      chomp $first;
      return $first;
    };
    my $scan = sub {
      my (@live, @markers, %known);
      @order = ();
      opendir(my $dir, $queue) or return (0, 0, 0);
      for my $entry (readdir $dir) {
        if ($entry =~ /^(\d+)\.(\d{6})-(\d+)$/) {
          my ($s, $us, $pid) = ($1, $2, $3);
          if (defined $ticket && $entry eq (split m{/}, $ticket)[-1]) { push @live, [$s, $us, $pid, 1, $first_line->("$queue/$entry"), $slots, 0]; next }
          if (open(my $t, "<", "$queue/$entry")) {
            if (flock($t, LOCK_EX | LOCK_NB)) { unlink "$queue/$entry" } else {
              my $first = <$t>;
              my $second = <$t>;
              if (defined $first) { chomp $first }
              my $asks = defined $second && $second =~ /^slots=([1-9]\d*)$/ ? $1 : $every;
              push @live, [$s, $us, $pid, 0, $first, $asks, 0];
            }
            close $t;
          }
        } elsif ($entry =~ /^(\d+)\.(\d{6})-(\d+)\.held$/) {
          my ($s, $us, $pid) = ($1, $2, $3);
          my $mtime = (stat "$queue/$entry")[9];
          if (defined $mtime && time - $mtime > 120) { unlink "$queue/$entry" }
          else {
            my $first = $first_line->("$queue/$entry");
            if (defined $first) { $known{$first} = 1; push @live, [$s, $us, $pid, 0, $first, 0, 1] }
          }
        } elsif ($entry =~ /^(\d+)\.jump$/) {
          push @markers, [$1, $entry, $first_line->("$queue/$entry")];
        }
      }
      closedir $dir;
      $known{$_->[4]} = 1 for grep { defined $_->[4] } @live;
      my %front;
      for my $m (@markers) {
        if (!defined $m->[2] || !$known{$m->[2]}) { unlink "$queue/$m->[1]"; next }
        $front{$m->[2]} = $m->[0] if !defined $front{$m->[2]} || $m->[0] > $front{$m->[2]};
      }
      my $rank = sub { my $f = defined $_[0][4] ? $front{$_[0][4]} : undef; return $f };
      @live = sort {
        my ($fa, $fb) = ($rank->($a), $rank->($b));
        (defined $fa ? 0 : 1) <=> (defined $fb ? 0 : 1)
          || (defined $fa ? $fb <=> $fa : 0)
          || $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1] || $a->[2] <=> $b->[2]
      } @live;
      @order = @live;
      my ($place, $count, $ahead) = (0, 0, 0);
      for my $e (@live) {
        next if $e->[6];
        $count++;
        if ($e->[3]) { $place = $count }
        elsif (!$place && $e->[5] > $ahead) { $ahead = $e->[5] }
      }
      return ($place, $count, $ahead);
    };
    # queue prints the line of each live ticket and held place in queue order. jump writes a
    # <ms>.jump marker naming the one line of run $who (and checkout $checkout, when given): exit 0
    # printing that line, 1 when none matches, 3 when several do (printing them).
    if ($mode eq "queue" || $mode eq "jump") {
      $scan->();
      my (@lines, %seen);
      for my $e (@order) { push @lines, $e->[4] if defined $e->[4] && !$seen{$e->[4]}++ }
      if ($mode eq "queue") { print "$_\n" for @lines; exit 0 }
      my @matches = grep { index($_, "$who — ") == 0 && ($checkout eq "" || $_ eq "$who — $checkout") } @lines;
      exit 1 unless @matches;
      if (@matches > 1) { print "$_\n" for @matches; exit 3 }
      my $temp = "$queue/.jump.$$.tmp";
      my $marker = "$queue/" . int(Time::HiRes::time() * 1000) . ".jump";
      my $m;
      unless (open($m, ">", $temp) && print($m "$matches[0]\n") && close($m) && rename($temp, $marker)) {
        my $why = $!;
        unlink $temp;
        print STDERR "[machine-lock] ❌ cannot write a jump marker in $queue: $why\n";
        exit 73;
      }
      print "$matches[0]\n";
      exit 0;
    }
    open(my $out, ">", $fifo) or exit 1;
    $out->autoflush(1);
    if ($mode ne "try") {
      unless (mkdir($queue) || -d $queue) { print $out "error cannot create $queue: $!\n"; exit 1 }
      my $line = "$who — $checkout";
      # A held place of this run, left by an earlier give-up under 120s ago, keeps its time.
      my ($time, $held_name);
      if (opendir(my $dir, $queue)) {
        for my $entry (sort readdir $dir) {
          next unless $entry =~ /^(\d+\.\d{6})-\d+\.held$/;
          my $mtime = (stat "$queue/$entry")[9];
          next unless defined $mtime && time - $mtime <= 120;
          open(my $h, "<", "$queue/$entry") or next;
          my $first = <$h>; close $h;
          next unless defined $first;
          chomp $first;
          next unless $first eq $line;
          ($time, $held_name) = ($1, $entry);
          last;
        }
        closedir $dir;
      }
      $time = sprintf("%.6f", clock_gettime(CLOCK_MONOTONIC)) unless defined $time;
      my $temp = "$queue/.$$.tmp";
      open($ticket_fh, ">", $temp) or do { print $out "error cannot write a ticket in $queue: $!\n"; exit 1 };
      flock($ticket_fh, LOCK_EX);
      $ticket_fh->autoflush(1);
      # The second line is the slots this run asks for; readers of the first line ignore it.
      print $ticket_fh "$line\nslots=$slots\n";
      my $name_of_ticket = "$time-$$";
      unless (rename($temp, "$queue/$name_of_ticket")) {
        my $why = $!;
        unlink $temp;
        print $out "error cannot write a ticket in $queue: $why\n";
        exit 1;
      }
      $ticket = "$queue/$name_of_ticket";
      unlink "$queue/$held_name" if defined $held_name;
    }
    my ($lock, $held_file);
    my $start = time;
    my $next_note = 0;
    while (1) {
      my ($place, $waiting, $ahead) = $scan->();
      if ($mode eq "try") {
        if ($waiting) { print $out "busy " . $holder->() . "; $waiting waiting in line\n"; exit 0 }
      }
      # A waiter may take slot k only while no live ticket ahead of it asks for k or more slots,
      # so a 1-slot waiter ahead never blocks slot 2 and equal asks keep arrival order.
      my $first_slot = $mode eq "try" ? 1 : $ahead + 1;
      for my $slot ($first_slot .. $slots) {
        my $candidate = $slot == 1 ? $file : "$stem.$slot.lock";
        open(my $next, ">>", $candidate) or do { print $out "error cannot open $candidate: $!\n"; exit 1 };
        if (flock($next, LOCK_EX | LOCK_NB)) { $lock = $next; $held_file = $candidate; last }
        close $next;
      }
      last if defined $lock;
      exit 0 unless $caller_alive->();
      if ($mode eq "try") { print $out "busy " . $holder->() . "\n"; exit 0 }
      if (time - $start >= $wait_s) {
        # Keep the place for 120s: the same run asking again takes it back.
        my $kept = "$ticket.held";
        utime(time, time, $ticket);
        if (rename($ticket, $kept)) { $ticket = undef }
        print $out "timeout " . $holder->() . "\n";
        exit 0;
      }
      if (time >= $next_note) {
        my $m = int((time - $start) / 60);
        my $so_far = $m ? " (still, $m min so far)" : "";
        my $in_line = $place ? ", " . $ordinal->($place) . " in line" : "";
        print STDERR "[machine-lock] ⏳ $who is waiting for $label$so_far (up to ${wait_s}s)$in_line: in use by " . $holder->() . "\n";
        $next_note = time + 60;
      }
      select(undef, undef, undef, 0.1);
    }
    if (defined $ticket) { unlink $ticket; $ticket = undef }
    if ($mode ne "try" && opendir(my $mdir, $queue)) {
      my $mine = "$who — $checkout";
      for my $entry (readdir $mdir) {
        next unless $entry =~ /^\d+\.jump$/;
        my $first = $first_line->("$queue/$entry");
        unlink "$queue/$entry" if defined $first && $first eq $mine;
      }
      closedir $mdir;
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
    select(undef, undef, undef, 0.1) while !$stopping && $caller_alive->();
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
  ' "$@"
}

_local_stack_lock() {
  local _lsl_mode="$1" _lsl_who="$2" _lsl_name="${3:-}"
  local _lsl_pid_var _lsl_owner_var _lsl_name_var _lsl_owner _lsl_existing
  local _lsl_file _lsl_label _lsl_fifo _lsl_pid _lsl_reply _lsl_checkout
  local _lsl_slots=1 _lsl_cores=1 _lsl_wait _lsl_var _lsl_held_name _lsl_held_name_var
  _LOCAL_STACK_LOCK_EXIT=73
  _LOCAL_STACK_LOCK_HOLDER=""
  _local_stack_lock_vars "$_lsl_name"
  _lsl_owner="${!_lsl_owner_var:-}"
  _lsl_existing="${!_lsl_pid_var:-}"
  if [ "${CI:-}" = "true" ] || [ "${CI:-}" = "1" ]; then return 0; fi
  if [ "$_lsl_name" = tests ]; then
    _local_stack_lock_cores
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
  _local_stack_lock_helper \
    "$_lsl_file" "$$" "$_lsl_who" "$_lsl_checkout" "$_lsl_fifo" "$_lsl_wait" "$_lsl_mode" "$_lsl_label" "$_lsl_slots" "$_lsl_name" </dev/null >/dev/null &
  _lsl_pid=$!
  # The fifo is opened read-write, so the read never blocks on a holder that died before it
  # answered (a failed fork under load, a killed perl): the loop stops once it is gone.
  _lsl_reply="$(
    exec 3<>"$_lsl_fifo"
    _lsl_partial=""
    while :; do
      if IFS= read -r -t 1 _lsl_line <&3; then
        printf '%s' "$_lsl_partial$_lsl_line"
        break
      fi
      _lsl_partial="$_lsl_partial$_lsl_line"
      if ! kill -0 "$_lsl_pid" 2>/dev/null; then
        # The holder may have answered and exited between the read timing out and this check.
        if IFS= read -r -t 1 _lsl_line <&3; then printf '%s' "$_lsl_partial$_lsl_line"; fi
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
      _LOCAL_STACK_LOCK_HOLDER="${_lsl_reply#busy }"
      echo "[machine-lock] $_lsl_label is in use by ${_lsl_reply#busy }" >&2
      ;;
    timeout\ *)
      _LOCAL_STACK_LOCK_EXIT=75
      _LOCAL_STACK_LOCK_HOLDER="${_lsl_reply#timeout }"
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
  kill "$_lsl_pid" 2>/dev/null || true
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
    echo '       bash scripts/ci/bkit-machine-lock.sh slots' >&2
    echo '       bash scripts/ci/bkit-machine-lock.sh queue [--lock <name>]' >&2
    echo '       bash scripts/ci/bkit-machine-lock.sh jump [--lock <name>] <who> [<checkout>]' >&2
    exit 2
  }
  case "${1:-}" in
    run) ;;
    queue|jump)
      _lsl_sub="$1"
      _lsl_sub_name=tests
      shift
      if [ "${1:-}" = --lock ]; then
        [ -n "${2:-}" ] || _lsl_run_usage
        _lsl_sub_name="$2"
        shift 2
      fi
      if [ "$_lsl_sub" = queue ]; then
        [ "$#" -eq 0 ] || _lsl_run_usage
      else
        [ -n "${1:-}" ] && [ "$#" -le 2 ] || _lsl_run_usage
      fi
      if [ ! -x /usr/bin/perl ]; then
        echo "[machine-lock] ❌ cannot read the $_lsl_sub_name queue: /usr/bin/perl not found" >&2
        exit 73
      fi
      _lsl_sub_file="$(local_stack_lock_file "$_lsl_sub_name")" || exit 73
      _local_stack_lock_helper \
        "$_lsl_sub_file" "" "${1:-}" "${2:-}" "" 0 "$_lsl_sub" "$_lsl_sub_name" 1 "$_lsl_sub_name" </dev/null
      ;;
    slots)
      [ "$#" -eq 1 ] || _lsl_run_usage
      _local_stack_lock_cores
      _local_stack_lock_slots
      _local_stack_lock_workers
      printf 'slots=%s workers=%s\n' "$_lsl_slots" "$BKIT_TEST_WORKERS"
      exit 0
      ;;
    *) _lsl_run_usage ;;
  esac
  shift
  _lsl_run_who="${LOCAL_STACK_LOCK_WHO:-${npm_lifecycle_event:-run}}"
  _lsl_run_name=""
  _lsl_run_status_file="${LOCAL_STACK_LOCK_STATUS_FILE:-}"
  # The file belongs to this wrapper only: a nested wrapper for another lock never writes it.
  unset LOCAL_STACK_LOCK_STATUS_FILE
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
  # Three LF-ended lines, written beside the file and renamed into place, so a reader never
  # sees half a file.
  _lsl_run_write_status() {
    local _lsl_holds="$_LOCAL_STACK_LOCK_HOLDER" _lsl_tmp
    [ -n "$_lsl_run_status_file" ] || return 0
    [ -n "$_lsl_holds" ] || _lsl_holds="$(local_stack_lock_holder "$_lsl_run_name" 2>/dev/null)"
    _lsl_holds="${_lsl_holds//$'\n'/; }"
    _lsl_tmp="$_lsl_run_status_file.$$.tmp"
    if { printf 'lock=%s\noutcome=%s\nholder=%s\n' "$_lsl_run_name" "$1" "$_lsl_holds" >"$_lsl_tmp"; } 2>/dev/null &&
      mv -f "$_lsl_tmp" "$_lsl_run_status_file" 2>/dev/null; then
      return 0
    fi
    rm -f "$_lsl_tmp"
    echo "[machine-lock] could not write the status file $_lsl_run_status_file" >&2
  }
  if ! take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name"; then
    case "$_LOCAL_STACK_LOCK_EXIT" in
      75) _lsl_run_write_status gave-up ;;
      73) _lsl_run_write_status refused ;;
    esac
    exit "$_LOCAL_STACK_LOCK_EXIT"
  fi
  _lsl_run_started=$SECONDS
  _lsl_run_signal_status=0
  _lsl_run_hold_hit=0
  _lsl_run_cmd_pid=""
  # With a background command (a run holding its own tests lock), TERM, INT and HUP are passed on to it;
  # INT is not when this run has the terminal, since Ctrl-C reaches the command directly. A
  # signal during a hold-limit stop is not passed on.
  _lsl_run_cancel() {
    _lsl_run_signal_status="$2"
    if [ -z "$_lsl_run_cmd_pid" ]; then
      echo "[machine-lock] cancellation requested; waiting for $_lsl_run_who to finish before releasing its lock" >&2
      return 0
    fi
    [ "$_lsl_run_hold_hit" -eq 0 ] || return 0
    if [ "$1" = INT ] && /usr/bin/perl -e 'use POSIX (); open(my $t, "<", "/dev/tty") or exit 1; exit(POSIX::tcgetpgrp(fileno $t) == getpgrp() ? 0 : 1)' 2>/dev/null; then
      return 0
    fi
    kill -"$1" "$_lsl_run_cmd_pid" 2>/dev/null || true
    echo "[machine-lock] passed $1 on to $_lsl_run_who; waiting for it to finish before releasing its lock" >&2
  }
  _local_stack_lock_vars "$_lsl_run_name"
  if [ "$_lsl_run_name" != tests ] || [ "${!_lsl_owner_var:-}" != "$$" ]; then
    # Another lock, or no lock taken here (CI, or a live parent's lock reused): no hold limit.
    # Bash runs these traps after its foreground command ends.
    trap '_lsl_run_cancel TERM 143' TERM
    trap '_lsl_run_cancel INT 130' INT
    trap '_lsl_run_cancel HUP 129' HUP
    "$@"
    _lsl_run_status=$?
    release_local_stack_lock "$_lsl_run_name"
    [ "$_lsl_run_signal_status" -eq 0 ] || _lsl_run_status="$_lsl_run_signal_status"
    exit "$_lsl_run_status"
  fi
  # A whole number >= min, else the default with one note.
  _lsl_run_seconds() {
    _lsl_run_value="$3"
    case "${!1:-}" in
      "") return 0 ;;
      *[!0-9]*) ;;
      *) if [ "$((10#${!1}))" -ge "$2" ]; then _lsl_run_value="$((10#${!1}))"; return 0; fi ;;
    esac
    echo "[machine-lock] invalid $1 \"${!1}\"; using $3" >&2
  }
  _lsl_run_seconds LOCAL_STACK_LOCK_HOLD_S 1 3600
  _lsl_run_limit="$_lsl_run_value"
  _lsl_run_seconds LOCAL_STACK_LOCK_HOLD_GRACE_S 0 10
  _lsl_run_grace="$_lsl_run_value"
  # Signals ignored on entry stay ignored for the command; a background command would otherwise
  # start with INT and QUIT ignored.
  _lsl_run_ignored="$(/usr/bin/perl -e 'print join(" ", grep { ($SIG{$_} || "") eq "IGNORE" } qw(INT QUIT))')"
  trap '_lsl_run_cancel TERM 143' TERM
  trap '_lsl_run_cancel INT 130' INT
  trap '_lsl_run_cancel HUP 129' HUP
  trap '_lsl_run_hold_hit=1' USR1
  # The command stays in the caller's process group and keeps the caller's stdin, so it reads the
  # terminal and gets Ctrl-C as a foreground command would.
  /usr/bin/perl -e '
    my %keep = map { $_ => 1 } split " ", shift @ARGV;
    for my $sig (qw(INT QUIT)) { $SIG{$sig} = "DEFAULT" unless $keep{$sig} }
    exec { $ARGV[0] } @ARGV;
    print STDERR "[machine-lock] cannot run $ARGV[0]: $! (a shell function or builtin cannot be run; wrap it in sh -c)\n";
    exit($!{ENOENT} ? 127 : 126);
  ' "$_lsl_run_ignored" "$@" <&0 &
  _lsl_run_cmd_pid=$!
  # The watcher records the command's descendants every second, so a grandchild whose parent
  # exited (re-parented away from the command) is still known. At the limit it sends USR1 to the
  # wrapper, then TERM to every recorded process still running and KILL to those left after the
  # grace period. It never signals the wrapper or its caller: only the command and processes
  # started under it are recorded, each with its start time, so a reused pid is never signalled.
  # It uses the first ps on PATH, else /bin/ps; when that ps cannot list the command with its
  # start time (no procps, or a BusyBox ps without lstart), it notes once that only the command
  # itself can be stopped.
  /usr/bin/perl -e '
    use Time::HiRes qw(time sleep);
    my ($limit, $grace, $root, $wrapper) = @ARGV;
    $SIG{$_} = "IGNORE" for qw(INT QUIT HUP TERM);
    $ENV{LC_ALL} = "C";
    my ($ps_bin) = grep { -f $_ && -x _ } map { ($_ eq "" ? "." : $_) . "/ps" } split(/:/, $ENV{PATH} // "", -1);
    $ps_bin //= "/bin/ps";
    my $table = sub {
      my $pid = open(my $ps, "-|") // return undef;
      if (!$pid) {
        open(STDERR, ">", "/dev/null");
        exec { $ps_bin } $ps_bin, "-A", "-o", "pid=", "-o", "ppid=", "-o", "stat=", "-o", "lstart=";
        exit 127;
      }
      my %t;
      while (my $row = <$ps>) {
        next unless $row =~ /^\s*(\d+)\s+(\d+)\s+(\S+)\s+(.*\S)/;
        $t{$1} = [$2, $4] unless substr($3, 0, 1) eq "Z";
      }
      close $ps or return undef;
      return \%t;
    };
    my %tracked = ($root => undef);
    my $first = $table->();
    my $tree = $first && exists $first->{$root};
    print STDERR "[machine-lock] ps with lstart is not available (procps on Linux), so the LOCAL_STACK_LOCK_HOLD_S limit can stop only the command itself, not the processes started under it\n" unless $tree;
    my $refresh = sub {
      if (!$tree) { delete @tracked{grep { !kill(0, $_) } keys %tracked}; return }
      my $t = $table->() or return;
      for my $pid (keys %tracked) {
        my $row = $t->{$pid};
        if (!$row || (defined $tracked{$pid} && $row->[1] ne $tracked{$pid})) { delete $tracked{$pid} }
        else { $tracked{$pid} = $row->[1] }
      }
      my $added = 1;
      while ($added) {
        $added = 0;
        for my $pid (keys %$t) {
          next if exists $tracked{$pid} || $pid == $wrapper || $pid == $$ || !exists $tracked{$t->{$pid}[0]};
          $tracked{$pid} = $t->{$pid}[1];
          $added = 1;
        }
      }
    };
    my $end = time + $limit;
    while (time < $end) {
      exit 0 if getppid() != $wrapper;
      $refresh->();
      my $left = $end - time;
      sleep($left < 1 ? ($left > 0 ? $left : 0) : 1);
    }
    $refresh->();
    exit 0 unless exists $tracked{$root} && kill(0, $root);
    kill "USR1", $wrapper;
    # Each process gets one TERM, so a second one never cuts short its own shutdown.
    my %termed;
    my $term = sub { for my $pid (grep { !$termed{$_}++ } keys %tracked) { kill "TERM", $pid } };
    $term->();
    my $kill_at = time + $grace;
    while (%tracked && time < $kill_at) { sleep 0.1; $refresh->(); $term->() }
    for (1 .. 20) { last unless %tracked; kill "KILL", keys %tracked; sleep 0.1; $refresh->() }
  ' "$_lsl_run_limit" "$_lsl_run_grace" "$_lsl_run_cmd_pid" "$$" </dev/null >/dev/null &
  _lsl_run_watch_pid=$!
  while :; do
    # Quiet: bash would otherwise print a "Killed" job notice for a stopped command.
    wait "$_lsl_run_cmd_pid" 2>/dev/null
    _lsl_run_status=$?
    # A trapped signal ends wait early with a status above 128 while the command still runs.
    if [ "$_lsl_run_status" -gt 128 ] && kill -0 "$_lsl_run_cmd_pid" 2>/dev/null; then continue; fi
    break
  done
  if [ "$_lsl_run_hold_hit" -eq 1 ]; then
    while kill -0 "$_lsl_run_watch_pid" 2>/dev/null; do wait "$_lsl_run_watch_pid" 2>/dev/null; done
    _lsl_run_note="$(local_stack_lock_holder "$_lsl_run_name" | grep -F "(pid $$, " | head -n 1)"
    release_local_stack_lock "$_lsl_run_name"
    # SECONDS counts whole seconds, so the time held never prints below the limit it reached.
    _lsl_run_held=$((SECONDS - _lsl_run_started))
    [ "$_lsl_run_held" -ge "$_lsl_run_limit" ] || _lsl_run_held="$_lsl_run_limit"
    echo "[machine-lock] ❌ ${_lsl_run_note:-$_lsl_run_who} reached the LOCAL_STACK_LOCK_HOLD_S limit of ${_lsl_run_limit}s on the tests lock (held ${_lsl_run_held}s); stopped the command and freed the lock" >&2
    exit 124
  fi
  kill -KILL "$_lsl_run_watch_pid" 2>/dev/null || true
  wait "$_lsl_run_watch_pid" 2>/dev/null || true
  release_local_stack_lock "$_lsl_run_name"
  [ "$_lsl_run_signal_status" -eq 0 ] || _lsl_run_status="$_lsl_run_signal_status"
  exit "$_lsl_run_status"
fi
