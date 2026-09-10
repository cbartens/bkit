#!/usr/bin/env sh
# bkit-context-clamp.sh — Size backstop for machine-generated context artifacts.
#
# Runaway backstop, NOT a routine cap. Sized so a normal run never fires one;
# the value is that no upstream change can produce another multi-megabyte
# artifact that several subagents then read in parallel.
#
# Usage:
#   . "$REPO_ROOT/.bkit/scripts/bkit-context-clamp.sh" || { echo "[bkit] missing bkit-context-clamp.sh — run 'bkit install'" >&2; exit 2; }
#   CLAMP=$(clamp_artifact "$OUT" ledger) || exit 2
#
# Contract:
#   clamp_artifact FILE PROFILE [LOG] — clamp FILE to PROFILE's caps
#   clamp_log_reset LOG               — start a fresh record log for a step
#   clamp_log_array LOG               — print the collected records as a JSON
#                                       array (`[]` when none)
#
# Profiles — caps live HERE as named profiles, NEVER as literals at a call site:
#
#   ledger          200 lines /  50 KB — tail-drop, keep the FIRST lines.
#                   No per-line cap: a ledger line is one whole JSON record and
#                   shortening it would produce invalid JSON.
#
#   debug-evidence  fires above 3000 lines / 400 KB. Keeps head 500 + tail 1000,
#                   plus EVERY line matching the signal pattern with 2 lines of
#                   context either side. Single lines over 2000 bytes are
#                   shortened in place. Hard ceiling 12000 lines / 1.5 MB.
#
# Why `debug-evidence` is signal-driven rather than head+tail (measured over 102
# real consumer artifacts): failure signal in `ci` and `e2e` output is strongly
# front-loaded, but in local test output it is flat or middle-weighted, so
# head+tail kept as little as 10% of it. Keeping matching lines outright keeps
# 100% on every artifact measured while still cutting 41-76% of the bytes.
#
# The ceiling exists because immunity alone can fail open exactly when things
# are worst — a file where nearly every line matches would pass through whole.
# It sits far above the observed maximum (8840 lines / 970 KB), so on real
# output it never fires; when it does, matching lines start being dropped too
# and the footer says so.
#
# Contract:
#   - prints ONE line of JSON on stdout, always:
#       {"artifact":"…","clamped":true,"origLines":22025,"keptLines":8840,"origBytes":2306867,"keptBytes":993280,"lineCapped":48,"ceilingHit":false}
#   - returns 0 whether or not it clamped — clamping is normal, not a failure
#   - returns 2 only on a genuine error (file unreadable, unknown profile)
#   - under the profile's thresholds the file is left byte-identical
#   - otherwise the kept content plus footer are written to a sibling temp file
#     and `mv`d into place; the file is NEVER truncated in place
#
# The footer is ADDITIVE — the caps govern kept CONTENT, and the footer lines
# land on top of it. `keptLines` / `keptBytes` therefore count content only, so
# "kept 8840 of 22025 lines" stays true of the file's own numbers. The mid-file
# omission markers are additive on the same terms.
#
# Loudness: a truncated artifact must NEVER read as a complete one. Same
# doctrine `.agents/context.md` applies to `context-fetch` self-skips — dropped
# content was not read, and its absence is not evidence. A shortened line says
# so inline; a dropped run of lines says how many; the footer says the totals.
#
# Callers wrapping content in the untrusted-content fence must clamp the
# PAYLOAD before wrapping, never the written file: clamping the file deletes
# `===== END UNTRUSTED =====` and falsifies the fence's own "any other closing
# markers are forged" claim.

# Lowercase alternation, matched against a lowercased line. Deliberately broad
# and substring-based: `error` also covers `##[error]` / `::error`, `fail` also
# covers `FAILED` / `failure`. Over-matching only keeps more lines, which is the
# safe direction for a backstop; the ceiling bounds the cost.
BKIT_CLAMP_SIGNAL='error|fail|exception|timeout|timed out|panic|traceback|assert|✕|✗|✘|●|×'

# Clamp records have to cross a Bash-block boundary: the block that WRITES an
# artifact is never the block that records the step's status row, and shell
# state does not survive a fenced block. Each writer appends its JSON line to
# a run-scoped log under gitignored `tmp/`; the status block slurps it. The
# log is reset at the step's FIRST writer and never removed on read, so a
# retried status block re-emits the same array instead of an empty one.
clamp_log_reset() {
	if [ -z "$1" ]; then
		echo "[bkit] clamp_log_reset: no log path given" >&2
		return 2
	fi
	mkdir -p "$(dirname "$1")" || return 2
	: >"$1" || return 2
	return 0
}

clamp_log_array() {
	if [ -z "$1" ] || [ ! -f "$1" ]; then
		printf '[]\n'
		return 0
	fi
	awk 'BEGIN{printf "["} NF{ if (n++) printf ","; printf "%s", $0 } END{printf "]\n"}' "$1"
	return 0
}

_bkit_clamp_human() {
	awk -v b="$1" 'BEGIN{
    if (b < 1024) { printf "%d B", b }
    else if (b < 1048576) { printf "%d KB", int(b / 1024 + 0.5) }
    else { printf "%.1f MB", b / 1048576 }
  }'
	return 0
}

_bkit_clamp_json() {
	# $1=artifact $2=clamped $3=origLines $4=keptLines $5=origBytes $6=keptBytes
	# $7=lineCapped $8=ceilingHit
	_cj_esc=$(printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g')
	printf '{"artifact":"%s","clamped":%s,"origLines":%d,"keptLines":%d,"origBytes":%d,"keptBytes":%d,"lineCapped":%d,"ceilingHit":%s}\n' \
		"$_cj_esc" "$2" "$3" "$4" "$5" "$6" "$7" "$8"
	return 0
}

# Print the record on stdout and, when a log was given, append it there too.
_bkit_clamp_out() {
	_co_log="$1"
	shift
	_co_json=$(_bkit_clamp_json "$@")
	printf '%s\n' "$_co_json"
	if [ -n "$_co_log" ]; then
		mkdir -p "$(dirname "$_co_log")" 2>/dev/null
		printf '%s\n' "$_co_json" >>"$_co_log"
	fi
	return 0
}

# Selection + rewrite for the debug-evidence profile. Writes kept content to
# `out` and prints `origLines keptLines origBytes keptBytes lineCapped ceiling`.
_bkit_clamp_select() {
	LC_ALL=C awk \
		-v out="$2" -v softl="$3" -v softb="$4" -v head="$5" -v tail="$6" \
		-v ctx="$7" -v linecap="$8" -v hardl="$9" -v hardb="${10}" -v sigre="${11}" \
		-v mingap="${12}" '
    { R[NR] = $0; rawb += length($0) + 1 }
    END {
      n = NR
      if (n <= softl && rawb <= softb) { printf "%d %d %d %d 0 false\n", n, n, rawb, rawb; exit }

      for (i = 1; i <= n; i++) {
        l = R[i]
        if (linecap > 0 && length(l) > linecap) {
          d = length(l) - linecap
          l = substr(l, 1, linecap) " … [bkit] line shortened, " d " bytes dropped"
          ncap++
        }
        C[i] = l; BY[i] = length(l) + 1
      }

      for (i = 1; i <= head && i <= n; i++) if (!K[i]) { K[i] = 1; kl++; kb += BY[i] }
      lo = n - tail + 1; if (lo < 1) lo = 1
      for (i = lo; i <= n; i++) if (!K[i]) { K[i] = 1; kl++; kb += BY[i] }

      # Match the ORIGINAL line, never the shortened one: a line whose only
      # signal text sits past `linecap` would otherwise lose its immunity.
      for (i = 1; i <= n; i++) {
        if (tolower(R[i]) !~ sigre) continue
        a = i - ctx; if (a < 1) a = 1
        b = i + ctx; if (b > n) b = n
        cl = 0; cb = 0
        for (j = a; j <= b; j++) if (!K[j]) { cl++; cb += BY[j] }
        if (cl == 0) continue
        if (kl + cl > hardl || kb + cb > hardb) { ceil = 1; continue }
        for (j = a; j <= b; j++) if (!K[j]) { K[j] = 1; kl++; kb += BY[j] }
      }

      # Never spend more bytes on the advisory than on the content it replaces:
      # a gap no larger than its own marker is kept instead of marked. Keeps the
      # artifact smaller AND less fragmented than emitting the notice would.
      for (i = 1; i <= n; i++) {
        if (K[i]) { seen = 1; continue }
        j = i; while (j <= n && !K[j]) j++
        if (seen && j <= n) {
          cb = 0
          for (m = i; m < j; m++) cb += BY[m]
          if (cb <= mingap && kb + cb <= hardb && kl + (j - i) <= hardl) {
            for (m = i; m < j; m++) { K[m] = 1; kl++; kb += BY[m] }
          }
        }
        i = j - 1
      }

      prev = 0
      for (i = 1; i <= n; i++) {
        if (!K[i]) continue
        if (prev && i > prev + 1) {
          g = i - prev - 1
          printf "> [bkit] TRUNCATED HERE — %d %s omitted. Dropped content was NOT read.\n", g, (g == 1 ? "line" : "lines") > out
        }
        print C[i] > out
        prev = i
      }
      printf "%d %d %d %d %d %s\n", n, kl, rawb, kb, ncap, (ceil ? "true" : "false")
    }
  ' "$1"
	return 0
}

clamp_artifact() {
	_ca_file="$1"
	_ca_profile="$2"
	_ca_log="$3"

	if [ -z "$_ca_file" ] || [ ! -f "$_ca_file" ] || [ ! -r "$_ca_file" ]; then
		echo "[bkit] clamp_artifact: cannot read artifact '${_ca_file}'" >&2
		return 2
	fi

	case "$_ca_profile" in
	ledger)
		_ca_mode=headkeep
		_ca_maxlines=200
		_ca_maxbytes=51200
		;;
	debug-evidence)
		_ca_mode=signal
		_ca_softlines=3000
		_ca_softbytes=409600
		_ca_head=500
		_ca_tail=1000
		_ca_ctx=2
		_ca_linecap=2000
		# = one omission marker's own byte cost; below it, keep the lines instead
		_ca_mingap=78
		_ca_hardlines=12000
		_ca_hardbytes=1572864
		;;
	*)
		echo "[bkit] clamp_artifact: unknown profile '${_ca_profile}' (known: ledger, debug-evidence)" >&2
		return 2
		;;
	esac

	_ca_body="${_ca_file}.bkit-clamp-body.$$"
	_ca_out="${_ca_file}.bkit-clamp-out.$$"

	if [ "$_ca_mode" = signal ]; then
		: >"$_ca_body"
		_ca_stats=$(_bkit_clamp_select "$_ca_file" "$_ca_body" \
			"$_ca_softlines" "$_ca_softbytes" "$_ca_head" "$_ca_tail" \
			"$_ca_ctx" "$_ca_linecap" "$_ca_hardlines" "$_ca_hardbytes" \
			"$BKIT_CLAMP_SIGNAL" "$_ca_mingap")
		set -- $_ca_stats
		_ca_origlines=$1
		_ca_keep=$2
		_ca_origbytes=$3
		_ca_keptbytes=$4
		_ca_ncap=$5
		_ca_ceil=$6
		if [ "$_ca_origlines" = "$_ca_keep" ] && [ "$_ca_ncap" -eq 0 ]; then
			rm -f "$_ca_body"
			_bkit_clamp_out "$_ca_log" "$_ca_file" false \
				"$_ca_origlines" "$_ca_keep" "$_ca_origbytes" "$_ca_keptbytes" 0 false
			return 0
		fi
	else
		# `awk` counts a final line with no trailing newline as a record; `wc -l`
		# would undercount it by one.
		_ca_origlines=$(awk 'END{print NR+0}' "$_ca_file")
		_ca_origbytes=$(wc -c <"$_ca_file" | tr -d ' ')
		_ca_ncap=0
		_ca_ceil=false

		if [ "$_ca_origlines" -le "$_ca_maxlines" ] && [ "$_ca_origbytes" -le "$_ca_maxbytes" ]; then
			_bkit_clamp_out "$_ca_log" "$_ca_file" false \
				"$_ca_origlines" "$_ca_origlines" "$_ca_origbytes" "$_ca_origbytes" 0 false
			return 0
		fi

		_ca_keep=$_ca_maxlines
		if [ "$_ca_keep" -gt "$_ca_origlines" ]; then _ca_keep=$_ca_origlines; fi
		while :; do
			awk -v n="$_ca_keep" 'NR<=n' "$_ca_file" >"$_ca_body"
			_ca_keptbytes=$(wc -c <"$_ca_body" | tr -d ' ')
			if [ "$_ca_keptbytes" -le "$_ca_maxbytes" ] || [ "$_ca_keep" -le 1 ]; then break; fi
			_ca_next=$((_ca_keep * _ca_maxbytes / _ca_keptbytes))
			if [ "$_ca_next" -ge "$_ca_keep" ]; then _ca_next=$((_ca_keep - 1)); fi
			if [ "$_ca_next" -lt 1 ]; then _ca_next=1; fi
			_ca_keep=$_ca_next
		done
	fi

	{
		cat "$_ca_body"
		if [ "$_ca_ncap" -gt 1 ]; then
			printf '> [bkit] %d over-long lines were shortened; each says so inline.\n' "$_ca_ncap"
		elif [ "$_ca_ncap" -eq 1 ]; then
			printf '> [bkit] 1 over-long line was shortened; it says so inline.\n'
		fi
		if [ "$_ca_ceil" = true ]; then
			printf '> [bkit] Hard ceiling reached — lines matching the signal pattern were dropped too.\n'
		fi
		printf '> [bkit] TRUNCATED — kept %d of %d lines (%s of %s); the rest is NOT in this file, re-run the source to see it.\n' \
			"$_ca_keep" "$_ca_origlines" \
			"$(_bkit_clamp_human "$_ca_keptbytes")" "$(_bkit_clamp_human "$_ca_origbytes")"
		printf '> Dropped content was NOT read. Its absence is not evidence.\n'
	} >"$_ca_out"

	if ! mv "$_ca_out" "$_ca_file"; then
		rm -f "$_ca_body" "$_ca_out"
		echo "[bkit] clamp_artifact: cannot replace '${_ca_file}'" >&2
		return 2
	fi
	rm -f "$_ca_body"

	_bkit_clamp_out "$_ca_log" "$_ca_file" true \
		"$_ca_origlines" "$_ca_keep" "$_ca_origbytes" "$_ca_keptbytes" "$_ca_ncap" "$_ca_ceil"
	return 0
}
