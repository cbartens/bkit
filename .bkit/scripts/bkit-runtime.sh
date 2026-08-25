#!/usr/bin/env sh
# bkit-runtime.sh — Runtime detection + capability table shim.
#
# bkit's five phase workflows + bkit-auto run in four materially different
# runtimes: a laptop, a GitHub-Actions runner, a Cursor Cloud Agent and a
# claude.ai cloud session. This shim turns runtime detection into ONE
# stateless, testable function that emits a capability table — workflow
# headers branch on the `RUNTIME_*` flags instead of re-deriving "what runtime
# am I" logic at every call site.
#
# Usage (one call per Bash block — see the state-model note below):
#   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
#   bkit_runtime_detect || { echo "[bkit-runtime] detect failed" >&2; exit 2; }
#   bkit_runtime_assert_resolved || exit 2
#
# STATE MODEL (stateless, re-source-per-block, same idiom as the
# counter-bus): shell variables set by `bkit_runtime_detect` live only in the
# CURRENT process. They do NOT survive an orchestrator Bash-tool-call
# boundary (each fenced code block is a fresh subprocess) — do NOT call
# `bkit_runtime_detect` in one block and expect `$RUNTIME` to still be set in
# the next. Re-source and re-call at the start of every block that needs the
# table. The `runtime-resolved` status.jsonl row (`bkit_runtime_row`) is the
# durable, cross-block record — Step 1 writes it once per workflow run and
# later steps read `RUNTIME_GITHUBCLI` back from that row, not by re-probing.
# The same row also carries `baseSha` — the design/plan worktree's
# `git merge-base origin/dev HEAD`, set by the caller into `RUNTIME_BASESHA`
# before calling `bkit_runtime_row` — for the same reason: Close Workflow
# reads it back rather than recomputing it against a `dev` that has since
# advanced.
#
# CAPABILITY TABLE IS A DEFAULT, NOT A TRUTH: this shim maps a runtime
# classification to a conservative DEFAULT capability set. It is not a live,
# per-call probe of every capability — `RUNTIME_DEVPUSHES` in particular is
# deliberately NOT probed (a `git push --dry-run` fails dangerously: it sends
# no ref-update, so a protected branch's pre-receive hook never fires and a
# false-positive `RUNTIME_DEVPUSHES=true` can lead to an unrecoverable
# `git checkout dev` on a live session). `RUNTIME_GITHUBCLI` is the ONE
# exception: it IS probed, once, via `gh auth status`, because gh auth is the
# flaky primitive
# this whole effort exists to hardened-fallback around.
#
# DETECTION (first match wins):
#   BKIT_RUNTIME=<enum>                      -> explicit override
#   .bkit/.runtime-cursor marker present     -> CLOUD_CURSOR
#   CLAUDE_CODE_REMOTE=true                  -> CLOUD_CLAUDE
#   GITHUB_ACTIONS=true or CI=true           -> GITHUB_ACTION
#   none of the above                        -> LOCAL
#   a primitive set to a non-truthy,
#     non-falsy value                        -> UNKNOWN, least-capable + loud
#
# CAPABILITY TABLE (default per RUNTIME; RUNTIME_GITHUBCLI probed regardless):
#   RUNTIME         RUNTIME_WORKTREES  RUNTIME_DEVPUSHES
#   LOCAL           true               true
#   GITHUB_ACTION   true               true
#   CLOUD_CURSOR    true               true   (isolated VM, real git + shell)
#   CLOUD_CLAUDE    false              false  (no worktrees; push restricted
#                                              to the current branch)
#   UNKNOWN         false              false  (least-capable + loud)
#
# CLOUD_CURSOR is GITHUB_ACTION-equivalent on purpose: a Cursor Cloud Agent
# runs in an isolated VM that clones the repo, mints a branch and pushes it, so
# it has every capability a GitHub-Actions runner has. CLOUD_CLAUDE does not —
# its proxy restricts `git push` to the CURRENT working branch.
#
# WORKTREE_PATH: RUNTIME_WORKTREES=true  -> mint  -> "$REPO_ROOT/.worktrees/$FID"
#                RUNTIME_WORKTREES=false -> adopt -> "$REPO_ROOT" (work in-place,
#                  no `git worktree add` — the push restriction means a freshly
#                  minted branch could never be pushed)
#
# REJECTED (recorded so it is not silently re-proposed): render-time
# mode gating was rejected — `bkit-trackers.ts` resolves tracker config at
# INSTALL time, when the runtime is not yet known. Detection MUST happen at
# workflow run time, in-session, via this shim — never baked into a
# render/install artifact.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# _bkit_runtime_norm_flag VALUE
#
# Internal. Normalises one detection primitive to `true` | `false` |
# `ambiguous`. Unset and explicit falsy literals both normalise to `false` —
# they assert the same thing ("this runtime is not active"). Anything else
# that is set is `ambiguous`.
# ---------------------------------------------------------------------------
_bkit_runtime_norm_flag() {
  case "$1" in
    true | TRUE | True | 1 | yes | YES) echo "true" ;;
    "" | false | FALSE | False | 0 | no | NO) echo "false" ;;
    *) echo "ambiguous" ;;
  esac
}

# ---------------------------------------------------------------------------
# bkit_runtime_detect [REPO_ROOT] [FID]
#
# Sets (in the CURRENT shell only — see state-model note above):
#   RUNTIME                 LOCAL | GITHUB_ACTION | CLOUD_CLAUDE | CLOUD_CURSOR | UNKNOWN
#   RUNTIME_WORKTREES       true | false
#   RUNTIME_DEVPUSHES       true | false
#   RUNTIME_GITHUBCLI       true | false  (probed once via `gh auth status`)
#   RUNTIME_GITHUBCLI_EXIT  gh's exit code (or 127 if gh is not on PATH)
#   RUNTIME_GITHUBCLI_ERR   last non-empty line of `gh auth status`'s stderr
#   WORKTREE_PATH           mint or adopt path (see table above)
#
# Args: REPO_ROOT and FID are optional; if omitted, reads the existing
# `$REPO_ROOT` / `$FID` environment variables. Both must resolve non-empty
# for WORKTREE_PATH to be computed (WORKTREE_PATH is set to "" — explicit
# empty, not unset — and this function returns 2 if either is missing).
#
# Returns 0 on success. Returns 2 (loud, on stderr) if REPO_ROOT/FID cannot
# be resolved. Never returns non-zero for a legitimate "unknown/least
# capable" detection outcome — that is a successful (loud) resolution, not a
# shim failure; only a missing REPO_ROOT/FID (a genuine caller-contract
# violation) is an error return.
# ---------------------------------------------------------------------------
bkit_runtime_detect() {
  # Every env/positional read in this file is `${VAR:-}`-guarded: the shim ships
  # to consumers and is sourced by callers we do not control, so it must survive
  # `set -u`. An unguarded `$CLAUDE_CODE_REMOTE`-style read aborts the caller's
  # whole block with "unbound variable" on the LOCAL runtime (where none of the
  # detection primitives are set) — the most common runtime of all. Same class as
  # the `${STATUS_PATH:-}` fix in bkit-ship-gate.sh (tests/ship-gate.bats F4b).
  _brd_repo_root="${1:-${REPO_ROOT:-}}"
  _brd_fid="${2:-${FID:-}}"

  if [ -z "$_brd_repo_root" ] || [ -z "$_brd_fid" ]; then
    echo "[bkit-runtime] bkit_runtime_detect: REPO_ROOT and FID must both be non-empty (got REPO_ROOT='${_brd_repo_root}' FID='${_brd_fid}')" >&2
    RUNTIME=""
    RUNTIME_WORKTREES=""
    RUNTIME_DEVPUSHES=""
    RUNTIME_GITHUBCLI=""
    RUNTIME_GITHUBCLI_EXIT=""
    RUNTIME_GITHUBCLI_ERR=""
    WORKTREE_PATH=""
    return 2
  fi

  # --- classify RUNTIME from the detection primitives ---------------------
  # An explicit falsy literal is an ASSERTION OF ABSENCE, not ambiguity:
  # `CI=false` and `GITHUB_ACTIONS=false` are common in local shells and dev
  # tooling, and treating them as ambiguous would cost the laptop its
  # worktree model. Only a value that is neither truthy nor falsy is genuinely
  # ambiguous — that alone goes least-capable, loudly.
  _brd_cloud_flag=$(_bkit_runtime_norm_flag "${CLAUDE_CODE_REMOTE:-}")
  _brd_gha_flag=$(_bkit_runtime_norm_flag "${GITHUB_ACTIONS:-}")
  _brd_ci_flag=$(_bkit_runtime_norm_flag "${CI:-}")

  if [ -n "${BKIT_RUNTIME:-}" ]; then
    # Explicit override — wins over every primitive. Validated against the
    # enum so a typo fails loud instead of silently landing in UNKNOWN.
    case "${BKIT_RUNTIME:-}" in
      LOCAL | GITHUB_ACTION | CLOUD_CLAUDE | CLOUD_CURSOR | UNKNOWN)
        RUNTIME="${BKIT_RUNTIME:-}"
        ;;
      *)
        echo "[bkit-runtime] bkit_runtime_detect: BKIT_RUNTIME='${BKIT_RUNTIME:-}' is not a valid runtime (LOCAL | GITHUB_ACTION | CLOUD_CLAUDE | CLOUD_CURSOR | UNKNOWN) — defaulting RUNTIME=UNKNOWN, least-capable" >&2
        RUNTIME="UNKNOWN"
        ;;
    esac
  elif [ -f "${_brd_repo_root}/.bkit/.runtime-cursor" ]; then
    # Cursor Cloud Agent. Cursor exposes `is_background_agent` ONLY on the
    # sessionStart hook's stdin JSON — there is no env var to read from a
    # workflow shell — so `.cursor/hooks/preflight.sh` drops this marker and
    # the shim reads it back. The marker is gitignored and a Cursor Cloud VM
    # is a fresh clone per session, so it cannot go stale there.
    RUNTIME="CLOUD_CURSOR"
  elif [ "$_brd_cloud_flag" = "ambiguous" ] || [ "$_brd_gha_flag" = "ambiguous" ] || [ "$_brd_ci_flag" = "ambiguous" ]; then
    echo "[bkit-runtime] bkit_runtime_detect: ambiguous detection primitives (CLAUDE_CODE_REMOTE='${CLAUDE_CODE_REMOTE:-}' GITHUB_ACTIONS='${GITHUB_ACTIONS:-}' CI='${CI:-}') — defaulting RUNTIME=UNKNOWN, least-capable" >&2
    RUNTIME="UNKNOWN"
  elif [ "$_brd_cloud_flag" = "true" ]; then
    RUNTIME="CLOUD_CLAUDE"
  elif [ "$_brd_gha_flag" = "true" ] || [ "$_brd_ci_flag" = "true" ]; then
    RUNTIME="GITHUB_ACTION"
  else
    RUNTIME="LOCAL"
  fi

  # --- default capability table (RUNTIME_DEVPUSHES is a default, not a probed value) ---
  case "$RUNTIME" in
    LOCAL | GITHUB_ACTION | CLOUD_CURSOR)
      RUNTIME_WORKTREES="true"
      RUNTIME_DEVPUSHES="true"
      ;;
    CLOUD_CLAUDE | UNKNOWN)
      RUNTIME_WORKTREES="false"
      RUNTIME_DEVPUSHES="false"
      ;;
  esac

  # --- RUNTIME_GITHUBCLI: the one live probe, once, loud (never silent) ---------------
  if command -v gh >/dev/null 2>&1; then
    _brd_gh_err="$(gh auth status 2>&1 >/dev/null)"
    RUNTIME_GITHUBCLI_EXIT=$?
    RUNTIME_GITHUBCLI_ERR="$(printf '%s\n' "$_brd_gh_err" | tail -n 1)"
  else
    RUNTIME_GITHUBCLI_EXIT=127
    RUNTIME_GITHUBCLI_ERR="gh not found on PATH"
  fi
  if [ "$RUNTIME_GITHUBCLI_EXIT" -eq 0 ]; then
    RUNTIME_GITHUBCLI="true"
  else
    RUNTIME_GITHUBCLI="false"
    echo "[bkit-runtime] gh-preflight: RUNTIME_GITHUBCLI=false (exit=${RUNTIME_GITHUBCLI_EXIT} err='${RUNTIME_GITHUBCLI_ERR}')" >&2
  fi

  # --- WORKTREE_PATH: mint (RUNTIME_WORKTREES=true) vs adopt (false) -----------
  if [ "$RUNTIME_WORKTREES" = "true" ]; then
    WORKTREE_PATH="${_brd_repo_root}/.worktrees/${_brd_fid}"
  else
    WORKTREE_PATH="${_brd_repo_root}"
  fi

  return 0
}

# ---------------------------------------------------------------------------
# bkit_runtime_assert_resolved
#
# Loud, distinguishable emptiness check. Must be called AFTER
# `bkit_runtime_detect`, in the SAME block/process. Distinguishes three
# states per flag:
#   unset/empty      -> shim failed to source, or detect was never called,
#                        or detect returned an error. LOUD, distinct message.
#   explicit "false"  -> a legitimately least-capable runtime. NOT an error.
#   explicit "true"   -> a legitimately capable runtime. NOT an error.
#
# Returns 0 if every flag is resolved to a valid literal. Returns 2 (loud on
# stderr, naming which flag is unresolved) otherwise. Callers MUST route a
# non-zero return to the workflow's Failure Path — do NOT default an unset
# flag to a value to make this pass.
# ---------------------------------------------------------------------------
bkit_runtime_assert_resolved() {
  _bar_rc=0

  case "${RUNTIME:-}" in
    LOCAL | GITHUB_ACTION | CLOUD_CLAUDE | CLOUD_CURSOR | UNKNOWN) : ;;
    *)
      echo "[bkit-runtime] RUNTIME is UNRESOLVED (got '${RUNTIME:-}') — shim not sourced or bkit_runtime_detect not called this block" >&2
      _bar_rc=2
      ;;
  esac

  for _bar_flag_name in RUNTIME_WORKTREES RUNTIME_DEVPUSHES RUNTIME_GITHUBCLI; do
    eval "_bar_flag_val=\"\${${_bar_flag_name}:-}\""
    case "$_bar_flag_val" in
      true | false) : ;;
      *)
        echo "[bkit-runtime] ${_bar_flag_name} is UNRESOLVED (got '${_bar_flag_val}') — shim not sourced or bkit_runtime_detect not called this block" >&2
        _bar_rc=2
        ;;
    esac
  done

  return "$_bar_rc"
}

# ---------------------------------------------------------------------------
# bkit_runtime_row WORKFLOW AT
#
# Prints a single `runtime-resolved` status.jsonl row (JSON, one line, no
# trailing newline logic beyond the caller's own `>>` redirect) built from
# the CURRENT process's already-resolved globals. Pure — does NOT write to
# any file; the caller pipes/redirects the printed line into
# `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` itself (same convention as
# every other status-row emission in the corpus). Must be called AFTER
# `bkit_runtime_detect` (+ `bkit_runtime_assert_resolved`) in the same block.
#
# Args: WORKFLOW (e.g. "build"), AT (ISO-8601 timestamp string; caller's
# responsibility, same as every other row emitter in the corpus). Also reads
# `RUNTIME_BASESHA` from the current process (optional, caller-set — the
# `git merge-base origin/dev HEAD` the design/plan worktree branched from).
# Callers that do not set it (build, debug, ship — out of scope for this
# change) get an empty `baseSha` in the emitted row, not an error.
# Returns 2 (nothing on stdout) if WORKFLOW or AT is empty, or if the
# capability globals are not resolved (delegates to bkit_runtime_assert_resolved).
# ---------------------------------------------------------------------------
bkit_runtime_row() {
  _brr_workflow="${1:-}"
  _brr_at="${2:-}"

  if [ -z "$_brr_workflow" ] || [ -z "$_brr_at" ]; then
    echo "[bkit-runtime] bkit_runtime_row: WORKFLOW and AT must both be non-empty" >&2
    return 2
  fi
  bkit_runtime_assert_resolved || return 2

  # `jq -nc --arg`, NOT printf + `sed 's/"/\\"/g'`. The sed idiom escapes `"`
  # but not `\`, and RUNTIME_GITHUBCLI_ERR is raw `gh auth status` stderr: a
  # single backslash in it (a Windows path, an escaped URL, an `x509:` chain
  # detail) emits an invalid JSON escape and makes this line unparseable. That
  # line goes to status.jsonl, and every consumer of the ledger reads it with
  # `jq -s` — one bad row makes the WHOLE run's status file unreadable, not just
  # this entry (bkit_close_guard_cross_check then reports "could not read status
  # file" while the transport-fallback row it wants is sitting right there). The
  # failure fires exactly on the RUNTIME_GITHUBCLI=false path this shim exists to
  # serve, because that is the only path where the err string is non-trivial.
  # jq owns the escaping; the emitters must never hand-roll it.
  #
  # `--argjson` for the three booleans + the exit code: assert_resolved above
  # guarantees the booleans are the literals `true`/`false`, and the exit code is
  # always numeric ($? or 127), but both are defaulted so a caller that hand-set
  # the globals cannot make jq abort mid-emit.
  jq -nc \
    --arg w "$_brr_workflow" \
    --arg at "$_brr_at" \
    --arg rt "${RUNTIME:-}" \
    --argjson wt "${RUNTIME_WORKTREES:-false}" \
    --argjson dp "${RUNTIME_DEVPUSHES:-false}" \
    --argjson gc "${RUNTIME_GITHUBCLI:-false}" \
    --argjson ge "${RUNTIME_GITHUBCLI_EXIT:-0}" \
    --arg er "${RUNTIME_GITHUBCLI_ERR:-}" \
    --arg bs "${RUNTIME_BASESHA:-}" \
    '{type:"runtime-resolved",workflow:$w,at:$at,runtime:$rt,runtimeWorktrees:$wt,runtimeDevPushes:$dp,runtimeGithubCli:$gc,runtimeGithubCliExit:$ge,runtimeGithubCliErr:$er,baseSha:$bs}'
}

# ---------------------------------------------------------------------------
# bkit_anchor_stamp FILE BASE_SHA [DESIGN_PATH DESIGN_BASE_SHA]
#
# WRITES FILE — unlike every emitter above, which only print to stdout for
# the caller to redirect, this one mutates FILE in place. Via a temp file +
# `mv`, never in-place `sed -i`: BSD and GNU `sed -i` take incompatible
# argument shapes, and this shim ships to consumers on both (the corpus's
# existing workaround is `sed -i.bak` + `rm`, e.g. bkit-plan.md; temp file +
# `mv` sidesteps the divergence entirely rather than working around it).
#
# Prepends (after first stripping any existing one, so re-stamping is safe)
# a `<!-- bkit:anchor -->` HTML-comment block recording the base commit a
# design/plan doc was written against:
#
#   <!-- bkit:anchor
#   baseSha: <BASE_SHA>
#   baseRef: origin/dev
#   -->
#
# When DESIGN_PATH is non-empty (plan docs only), two more lines are added
# before the closing `-->`:
#
#   designPath: <DESIGN_PATH>
#   designBaseSha: <DESIGN_BASE_SHA>
#
# IDEMPOTENT: stamping a file that already carries a block replaces it
# rather than appending a second one — calling this twice with the same args
# produces a byte-identical file to calling it once. This is load-bearing
# for the `cmp -s` re-run check in bkit-design.md/bkit-plan.md Close
# Workflow: a re-run against an unchanged base must not manufacture a
# spurious diff just because the anchor was re-stamped.
#
# Args: FILE (path to stamp, required, must already exist and be
# readable/writable — this function does not create new files). BASE_SHA
# (required, non-empty). DESIGN_PATH / DESIGN_BASE_SHA (optional; only
# DESIGN_PATH gates whether the two design-anchor lines are emitted).
#
# Returns 0 on success. Returns 2 (loud, `[bkit-anchor]` on stderr) if FILE
# is missing/unreadable or BASE_SHA is empty — writes nothing in that case.
# ---------------------------------------------------------------------------
bkit_anchor_stamp() {
  _bas_file="${1:-}"
  _bas_base_sha="${2:-}"
  _bas_design_path="${3:-}"
  _bas_design_base_sha="${4:-}"

  if [ -z "$_bas_file" ] || [ ! -f "$_bas_file" ] || [ ! -r "$_bas_file" ]; then
    echo "[bkit-anchor] bkit_anchor_stamp: FILE '${_bas_file}' is missing or unreadable" >&2
    return 2
  fi
  if [ -z "$_bas_base_sha" ]; then
    echo "[bkit-anchor] bkit_anchor_stamp: BASE_SHA must be non-empty" >&2
    return 2
  fi

  _bas_tmp="${_bas_file}.bkit-anchor.tmp"

  {
    printf '%s\n' '<!-- bkit:anchor'
    printf 'baseSha: %s\n' "$_bas_base_sha"
    printf '%s\n' 'baseRef: origin/dev'
    if [ -n "$_bas_design_path" ]; then
      printf 'designPath: %s\n' "$_bas_design_path"
      printf 'designBaseSha: %s\n' "$_bas_design_base_sha"
    fi
    printf '%s\n' '-->'
    # Strip any existing anchor block first — idempotency (see header).
    sed '/^<!-- bkit:anchor$/,/^-->$/d' "$_bas_file"
  } >"$_bas_tmp"

  mv "$_bas_tmp" "$_bas_file"
}

# ---------------------------------------------------------------------------
# bkit_anchor_read FILE FIELD
#
# Prints the value of one field (`baseSha` | `baseRef` | `designPath` |
# `designBaseSha`) from FILE's `<!-- bkit:anchor -->` block, if any. Pure —
# does not modify FILE.
#
# Matches ONLY inside the anchor block (the block bounded by
# `^<!-- bkit:anchor$` and `^-->$`), so a `baseSha:`-shaped string elsewhere
# in the doc body can never be mistaken for the anchor.
#
# ABSENCE IS NORMAL, NOT AN ERROR: a FILE with no anchor block, or a block
# missing FIELD, prints nothing and returns 0 — every design/plan doc
# written before this change has neither.
#
# Args: FILE (required, must exist). FIELD (required — the field name
# without its trailing colon, e.g. "baseSha").
#
# Returns 0 whether or not a value was found (prints nothing on the
# not-found path). Returns 2 (loud, `[bkit-anchor]` on stderr) if FILE or
# FIELD is empty, or FILE does not exist.
# ---------------------------------------------------------------------------
bkit_anchor_read() {
  _bard_file="${1:-}"
  _bard_field="${2:-}"

  if [ -z "$_bard_file" ] || [ -z "$_bard_field" ]; then
    echo "[bkit-anchor] bkit_anchor_read: FILE and FIELD must both be non-empty" >&2
    return 2
  fi
  if [ ! -f "$_bard_file" ]; then
    echo "[bkit-anchor] bkit_anchor_read: FILE '${_bard_file}' not found" >&2
    return 2
  fi

  sed -n '/^<!-- bkit:anchor$/,/^-->$/p' "$_bard_file" |
    sed -n "s/^${_bard_field}: //p" | head -n 1
}

# ---------------------------------------------------------------------------
# bkit_wait_ci PR_NUMBER [POLL_BUDGET_S] [POLL_INTERVAL_S]
#
# Bounded poll for a bkit CI check's DISPATCH on a PR's statusCheckRollup —
# the mechanism the three CI-Dispatch Gate call sites (build close-workflow,
# debug PR-mode close-workflow, debug LOCAL-mode create-pr) share. This waits
# only for a run to EXIST at the pushed head; it never waits for a conclusion.
#
# SELF-DETECTING, NOT FLAG-GATED: sleeping is the one capability cheap and
# safe to probe, so this measures it instead of branching on a predicted
# capability row. Every `sleep` is `timeout`-wrapped, so a runtime whose
# harness blocks foreground sleep returns rc=2 with CI_WAIT_RESULT=err and
# CI_WAIT_BLOCKED=true; the CALLING workflow then hands the same poll to an
# agent turn-loop. No caller needs to know which runtime it is on, and a
# blocked sleep fails LOUD rather than hanging until the session times out.
#
# Sets (current shell only — same state-model caveat as
# bkit_runtime_detect; re-call per block, do not expect these to survive a
# Bash-tool-call boundary):
#   CI_WAIT_RESULT      found | none | err
#   CI_WAIT_ATTEMPTS     number of poll iterations run this call
#   CI_WAIT_ELAPSED      seconds elapsed this call (bounded by POLL_BUDGET_S)
#   CI_WAIT_ALL_ERRORED  true|false — every poll iteration errored (gh unavailable/unauthed)
#   CI_WAIT_BLOCKED      true|false — a `sleep` did not return within its timeout
#
# Args: PR_NUMBER required. POLL_BUDGET_S/POLL_INTERVAL_S default 60/10
# (the values every existing call site already used).
#
# Returns 0 once resolved (found/none/err from a normal poll cycle). Returns
# 2 if PR_NUMBER is empty, or if a `sleep` call is blocked past its
# `timeout` window — in both cases CI_WAIT_RESULT is set to "err" so callers
# can branch uniformly. NEVER hangs: the loop's only blocking primitive
# (`sleep`) is `timeout`-wrapped, so the worst case is a loud, bounded abort.
# ---------------------------------------------------------------------------
bkit_wait_ci() {
  _bwc_pr="${1:-}"
  _bwc_budget="${2:-60}"
  _bwc_interval="${3:-10}"

  CI_WAIT_RESULT=""
  CI_WAIT_ATTEMPTS=0
  CI_WAIT_ELAPSED=0
  CI_WAIT_ALL_ERRORED="true"
  CI_WAIT_BLOCKED="false"

  if [ -z "$_bwc_pr" ]; then
    echo "[bkit-ci-gate] bkit_wait_ci: PR_NUMBER must be non-empty" >&2
    CI_WAIT_RESULT="err"
    return 2
  fi

  # Resolve a `timeout`-wrapper binary once, if any is on PATH. `timeout(1)`
  # is GNU coreutils and is NOT present on a stock macOS (BSD) userland —
  # this shim ships to consumers via `bkit install`, so a Mac without
  # coreutils must not misdiagnose "no timeout binary" as a blocked/
  # foreground-sleep-restricted runtime. When neither `timeout` nor
  # `gtimeout` (homebrew coreutils) is available, fall back to a plain
  # `sleep` (the pre-#341 inline behaviour) — only a REAL timeout wrapper
  # that actually times out is classified as a blocked-sleep abort.
  _bwc_timeout_bin=""
  if command -v timeout >/dev/null 2>&1; then
    _bwc_timeout_bin="timeout"
  elif command -v gtimeout >/dev/null 2>&1; then
    _bwc_timeout_bin="gtimeout"
  fi

  # NOTE: this function is invoked via a `$(...)` command substitution below
  # (needed to capture its "found"/"none"/"err" echo) — a substitution runs
  # in a SUBSHELL, so any assignment made INSIDE `_bwc_poll` (e.g. to
  # CI_WAIT_ALL_ERRORED) would silently vanish on return. Bug discovered
  # while extracting this from the inline `poll_dispatch()` it replaces (the
  # same subshell trap existed there, unfixed, since #261) — see
  # docs/failures.jsonl. Fixed here by deriving CI_WAIT_ALL_ERRORED from the
  # echoed result AFTER the substitution returns, in the caller's own shell.
  _bwc_poll() {
    _bwc_out=$(gh pr view "$_bwc_pr" --json statusCheckRollup --jq \
      '[.statusCheckRollup[]? | select(.name // .context // "" | test("bkit-tests|decide"; "i"))] | length' 2>/dev/null)
    _bwc_rc=$?
    if [ "$_bwc_rc" -ne 0 ]; then
      echo "err"
      return
    fi
    [ "${_bwc_out:-0}" -gt 0 ] 2>/dev/null && echo "found" || echo "none"
  }

  while [ "$CI_WAIT_ELAPSED" -lt "$_bwc_budget" ]; do
    CI_WAIT_ATTEMPTS=$((CI_WAIT_ATTEMPTS + 1))
    _bwc_r=$(_bwc_poll)
    [ "$_bwc_r" != "err" ] && CI_WAIT_ALL_ERRORED="false"
    echo "[bkit-ci-gate] attempt ${CI_WAIT_ATTEMPTS}: $_bwc_r (elapsed ${CI_WAIT_ELAPSED}s)" >&2
    if [ "$_bwc_r" = "found" ]; then
      CI_WAIT_RESULT="found"
      return 0
    fi
    if [ -n "$_bwc_timeout_bin" ]; then
      if ! "$_bwc_timeout_bin" "$((_bwc_interval + 5))" sleep "$_bwc_interval"; then
        echo "[bkit-ci-gate] bkit_wait_ci: sleep did not return within $((_bwc_interval + 5))s — this runtime blocks foreground sleep; hand the poll to an agent turn-loop" >&2
        CI_WAIT_RESULT="err"; CI_WAIT_BLOCKED="true"
        return 2
      fi
    else
      # No `timeout`/`gtimeout` on PATH — cannot distinguish a blocked sleep
      # from a normal one; fall back to a plain, unwrapped sleep rather than
      # misdiagnosing a missing binary as a blocked-sleep abort (see above).
      sleep "$_bwc_interval"
    fi
    CI_WAIT_ELAPSED=$((CI_WAIT_ELAPSED + _bwc_interval))
  done

  CI_WAIT_RESULT="none"
  return 0
}

# ---------------------------------------------------------------------------
# Close-guard + close-audit kernel
#
# Transport-agnostic: every helper below is expressed over plain git/jq and
# holds on WHICHEVER close shape/transport ran (local checkout-and-push, or
# a mapped gh->MCP fallback tool). Emits/consumes
# `transport-fallback` and `close-transport` status.jsonl rows (additive,
# #234 artifact — .bkit/workflows.md documents both shapes).
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# bkit_close_guard_checkout TARGET_BRANCH
#
# Double-guard + reversible checkout. The ONLY sanctioned way to
# locally `git checkout` a shared branch (e.g. `dev`) during a phase close.
#
# Double-guard (both, not either — deliberate redundancy at the one site
# where being wrong is worst): refuses UNLESS `RUNTIME_WORKTREES=true` AND
# `RUNTIME_DEVPUSHES=true` are both already resolved in the CURRENT shell (call
# `bkit_runtime_detect` first, same block). `RUNTIME_DEVPUSHES`
# is a default, not a probed truth (see file header) — this guard does NOT
# replace the real push/merge as the actual permission certifier; it only
# gates whether a LOCAL checkout is attempted at all.
#
# Reversible: captures the current branch before checkout and installs an
# `EXIT` trap that restores it — this closes the hazard of a stray local
# `dev` checkout stranding a cloud session) even if BOTH capability flags
# were wrong, which no probe can do. The trap fires on the CURRENT
# process's exit; callers that need the restore to survive past their own
# block should keep this call and the operations that depend on the
# checkout inside the SAME Bash block/process.
#
# Sets (current shell only): BKIT_CLOSE_GUARD_ORIG_BRANCH (branch restored on exit).
#
# Returns 0 once TARGET_BRANCH is checked out. Returns 2 (loud) if
# TARGET_BRANCH is empty, either capability flag is not `true`, or the
# current branch cannot be resolved (detached HEAD). Returns 1 if the
# checkout itself fails (target does not exist, dirty tree conflict, etc).
# ---------------------------------------------------------------------------
bkit_close_guard_checkout() {
  _bcg_target="${1:-}"

  if [ -z "$_bcg_target" ]; then
    echo "[bkit-close-guard] bkit_close_guard_checkout: TARGET_BRANCH must be non-empty" >&2
    return 2
  fi
  if [ "${RUNTIME_WORKTREES:-}" != "true" ] || [ "${RUNTIME_DEVPUSHES:-}" != "true" ]; then
    echo "[bkit-close-guard] refusing local checkout: RUNTIME_WORKTREES='${RUNTIME_WORKTREES:-unset}' RUNTIME_DEVPUSHES='${RUNTIME_DEVPUSHES:-unset}' — both must be 'true' to checkout '$_bcg_target' locally; refusing" >&2
    return 2
  fi

  BKIT_CLOSE_GUARD_ORIG_BRANCH=$(git branch --show-current)
  if [ -z "$BKIT_CLOSE_GUARD_ORIG_BRANCH" ]; then
    echo "[bkit-close-guard] bkit_close_guard_checkout: could not resolve current branch (detached HEAD?) — refusing to checkout '$_bcg_target'" >&2
    return 2
  fi

  # Single-quoted trap body: BKIT_CLOSE_GUARD_ORIG_BRANCH resolves at FIRE
  # time (not re-parsed as literal branch text now) — `git check-ref-format`
  # permits `'`, `$`, `(`, `)`, `;`, `&` in branch names, so interpolating
  # the value into a double-quoted/expanded trap body would let a
  # maliciously-named branch break out of the quoting and execute arbitrary
  # shell at EXIT. Never interpolate a variable into a shell-interpreted
  # string (docs/security.md § Shell Injection).
  trap 'git checkout "$BKIT_CLOSE_GUARD_ORIG_BRANCH" >/dev/null 2>&1 || true' EXIT

  if ! git checkout "$_bcg_target"; then
    echo "[bkit-close-guard] bkit_close_guard_checkout: 'git checkout $_bcg_target' failed" >&2
    return 1
  fi
  return 0
}

# ---------------------------------------------------------------------------
# bkit_close_guard_scan_body SHA [REMOTE_REF]
#
# Post-close skip-token scan of the LANDED commit, transport-agnostic.
#
# BODY ONLY — the subject line is deliberately excluded. A docs-only close
# commit carries `bkit [skip ci]` in its SUBJECT on purpose (that is the
# CI-minutes convention, `.agents/rules.md` § Docs-only commits). The defect
# this scan exists for is the opposite case: a squash merge whose default
# body CONCATENATES the head branch's commit subjects, silently inheriting a
# suppression token from an intermediate commit and suppressing CI on a
# shared branch nobody intended to skip. Scanning the subject too would
# reject every legitimate docs-only close.
#
# Args: SHA (the landed commit, required). REMOTE_REF (optional) — when the
# close ran server-side (a mapped MCP tool, not a local push), pass e.g.
# "dev" to `git fetch origin REMOTE_REF` first so SHA is resolvable locally.
#
# Returns 0 if the commit body carries NO CI-suppression token (an empty
# body is clean). Returns 1 (loud) if it does — route the caller to Failure
# Path. Returns 2 if SHA is empty or the commit cannot be read at all
# (distinct from "found a token").
# ---------------------------------------------------------------------------
bkit_close_guard_scan_body() {
  _bcs_sha="${1:-}"
  _bcs_remote="${2:-}"

  if [ -z "$_bcs_sha" ]; then
    echo "[bkit-close-guard] bkit_close_guard_scan_body: SHA must be non-empty" >&2
    return 2
  fi
  if [ -n "$_bcs_remote" ]; then
    git fetch origin "$_bcs_remote" >/dev/null 2>&1 || true
  fi

  # `%B` (subject + body) is never empty for a readable commit, so an empty
  # capture here means the commit could not be read — a distinct failure from
  # "read fine, body happens to be empty", which is a clean result.
  _bcs_full=$(git log -1 --format=%B "$_bcs_sha" 2>/dev/null)
  _bcs_rc=$?
  if [ "$_bcs_rc" -ne 0 ] || [ -z "$_bcs_full" ]; then
    echo "[bkit-close-guard] bkit_close_guard_scan_body: could not read commit message for '$_bcs_sha'" >&2
    return 2
  fi

  _bcs_body=$(printf '%s\n' "$_bcs_full" | tail -n +2)
  if printf '%s' "$_bcs_body" | grep -qiE '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
    echo "[bkit-close-guard] landed commit '$_bcs_sha' body inherited a CI-suppression token" >&2
    return 1
  fi
  return 0
}

# ---------------------------------------------------------------------------
# bkit_close_guard_cross_check STATUS_PATH TRANSPORT
#
# Mechanical cross-check of the `transport-fallback` recording itself.
# The audit trail is only as trustworthy as the compliance layer that could
# have produced the defect in the first place — do not trust prose to have
# written the row; assert it mechanically, over the real status.jsonl.
#
# Rule: if the run's LATEST `runtime-resolved` row logged `runtimeGithubCli:false` at
# Step 1 AND this close ran through a MAPPED MCP TOOL (`TRANSPORT="mcp"`), at
# least one `transport-fallback` row MUST already exist in STATUS_PATH — else
# Failure Path.
#
# Only `mcp` is checked, never "anything that is not gh". `TRANSPORT="git"`
# (the local squash-merge + `git push origin dev` close) needs no `gh` at all,
# so a laptop with an unauthed `gh` legitimately reports `runtimeGithubCli=false` while
# closing perfectly well over git — flagging that would fail every local close
# on a machine that never ran `gh auth login`.
#
# Args: STATUS_PATH (path to this run's status.jsonl, required). TRANSPORT
# (the transport this close actually used: "git" | "gh" | "mcp", required).
#
# Returns 0 when the invariant holds (RUNTIME_GITHUBCLI was true, TRANSPORT was not "mcp",
# or a transport-fallback row is present). Returns 1 (loud) when RUNTIME_GITHUBCLI=false +
# an "mcp" close WITHOUT a recorded fallback row — route to Failure Path.
# Returns 2 if args are empty or STATUS_PATH is missing/unreadable.
# ---------------------------------------------------------------------------
bkit_close_guard_cross_check() {
  _bcx_status="${1:-}"
  _bcx_transport="${2:-}"

  if [ -z "$_bcx_status" ] || [ -z "$_bcx_transport" ]; then
    echo "[bkit-close-guard] bkit_close_guard_cross_check: STATUS_PATH and TRANSPORT must both be non-empty" >&2
    return 2
  fi
  if [ ! -f "$_bcx_status" ]; then
    echo "[bkit-close-guard] bkit_close_guard_cross_check: status file '$_bcx_status' not found" >&2
    return 2
  fi

  # NOTE: deliberately NOT `.runtimeGithubCli // "unknown"` — jq's `//` alternative
  # operator treats a JSON `false` value as falsy too, so that idiom would
  # silently rewrite a real `runtimeGithubCli:false` into the string "unknown" and this
  # cross-check would never fire. Explicit null-check instead.
  _bcx_gh_ok=$(jq -s -r '[.[] | select(.type=="runtime-resolved")] | last | .runtimeGithubCli | if . == null then "unknown" else tostring end' "$_bcx_status" 2>/dev/null)
  if [ -z "$_bcx_gh_ok" ]; then
    echo "[bkit-close-guard] bkit_close_guard_cross_check: could not read status file '$_bcx_status'" >&2
    return 2
  fi

  if [ "$_bcx_gh_ok" = "false" ] && [ "$_bcx_transport" = "mcp" ]; then
    _bcx_fallback_count=$(jq -s '[.[] | select(.type=="transport-fallback")] | length' "$_bcx_status" 2>/dev/null)
    if [ -z "$_bcx_fallback_count" ] || [ "$_bcx_fallback_count" -eq 0 ]; then
      echo "[bkit-close-guard] runtime-resolved logged runtimeGithubCli=false and this close used transport '$_bcx_transport', but no transport-fallback row exists in '$_bcx_status'" >&2
      return 1
    fi
  fi
  return 0
}

# ---------------------------------------------------------------------------
# bkit_transport_fallback_row FROM TO REASON ASSERTED_BY AT
#
# Prints one `transport-fallback` status.jsonl row (pure — does NOT write to
# any file; caller redirects, same convention as `bkit_runtime_row`). Emit
# ONE row per gh->MCP transition (bounded max 1/run); read back by
# `bkit_close_guard_cross_check`.
#
# Args, all required: FROM (the gh command that was unavailable/unauthed),
# TO (the mapped MCP tool used instead), REASON (why — e.g. "RUNTIME_GITHUBCLI=false"),
# ASSERTED_BY (how the fallback's success was independently confirmed),
# AT (ISO-8601 timestamp, caller's responsibility).
#
# Returns 2 (nothing on stdout) if any arg is empty.
# ---------------------------------------------------------------------------
bkit_transport_fallback_row() {
  _btf_from="${1:-}"
  _btf_to="${2:-}"
  _btf_reason="${3:-}"
  _btf_asserted_by="${4:-}"
  _btf_at="${5:-}"

  if [ -z "$_btf_from" ] || [ -z "$_btf_to" ] || [ -z "$_btf_reason" ] || [ -z "$_btf_asserted_by" ] || [ -z "$_btf_at" ]; then
    echo "[bkit-close-guard] bkit_transport_fallback_row: FROM, TO, REASON, ASSERTED_BY and AT must all be non-empty" >&2
    return 2
  fi

  # jq owns the escaping — see the note in bkit_runtime_row. These args are
  # agent-supplied prose (a gh command line, a failure reason), so a backslash is
  # if anything MORE likely here; the old sed idiom either produced invalid JSON
  # (`\U`) or silently rewrote the recorded value (`C:\temp\new` -> a literal tab
  # and newline), corrupting the audit trail the cross-check reads back.
  jq -nc \
    --arg from "$_btf_from" \
    --arg to "$_btf_to" \
    --arg reason "$_btf_reason" \
    --arg assertedBy "$_btf_asserted_by" \
    --arg at "$_btf_at" \
    '{type:"transport-fallback",from:$from,to:$to,reason:$reason,assertedBy:$assertedBy,at:$at}'
}

# ---------------------------------------------------------------------------
# bkit_close_transport_row SHAPE SHA SCAN_RESULT AT
#
# Prints one `close-transport` status.jsonl row (pure, same convention).
# Records which close shape ran (`local` / `pr` / `push`), the SHA that
# landed on `dev`, and the post-close body scan's outcome — the Close
# Workflow's own audit trail entry, transport-agnostic.
#
# Args, all required: SHAPE ("A" | "B" | "C"), SHA (the landed commit),
# SCAN_RESULT ("clean" | "skip-token-found" — the `bkit_close_guard_scan_body`
# outcome), AT (ISO-8601 timestamp, caller's responsibility).
#
# Returns 2 (nothing on stdout) if any arg is empty.
# ---------------------------------------------------------------------------
bkit_close_transport_row() {
  _bct_shape="${1:-}"
  _bct_sha="${2:-}"
  _bct_scan_result="${3:-}"
  _bct_at="${4:-}"

  if [ -z "$_bct_shape" ] || [ -z "$_bct_sha" ] || [ -z "$_bct_scan_result" ] || [ -z "$_bct_at" ]; then
    echo "[bkit-close-guard] bkit_close_transport_row: SHAPE, SHA, SCAN_RESULT and AT must all be non-empty" >&2
    return 2
  fi

  # jq owns the escaping — see the note in bkit_runtime_row. These four args are
  # constrained today (A/B/C, a SHA, a two-value enum, a timestamp), so this is
  # uniformity rather than a live bug: one emission idiom across all three row
  # writers means the next arg added here cannot reintroduce the escaping hole.
  jq -nc \
    --arg shape "$_bct_shape" \
    --arg sha "$_bct_sha" \
    --arg scanResult "$_bct_scan_result" \
    --arg at "$_bct_at" \
    '{type:"close-transport",shape:$shape,sha:$sha,scanResult:$scanResult,at:$at}'
}

# ---------------------------------------------------------------------------
# bkit_worktree_helper_guard REPO_ROOT [LABEL]
#
# The `bkit-worktree-{prune,sync}` disposition. Both
# helpers are human-triggered utility commands that operate exclusively on
# `.worktrees/{FID}` — meaningless in adopt mode (`RUNTIME_WORKTREES=false`),
# where there is no worktree tree to prune or sync (adopt-mode phases work
# in-place on the session's own branch). Silent omission here would be an
# obscure adopt-mode failure in a workflow "the six workflows" framing leaves
# unowned — so this guard is LOUD, never a silent no-op.
#
# Args: REPO_ROOT (required). LABEL (optional, defaults to "worktree-util")
# — passed to `bkit_runtime_detect` as its FID arg; neither helper needs a
# real FID to answer "can this runtime worktree at all", so any non-empty
# placeholder is fine (WORKTREE_PATH is not consumed by the caller).
#
# Prints a LOUD, distinguishable self-skip message on stdout when
# RUNTIME_WORKTREES=false — callers MUST print this (or route it through their
# own narration) and STOP; this function does not exit the caller's shell.
#
# Returns 0 (proceed) when RUNTIME_WORKTREES=true. Returns 1 (self-skip; message
# already printed) when RUNTIME_WORKTREES=false. Returns 2 (loud, distinct) on a
# detect/assert failure (missing REPO_ROOT, shim source failure, unresolved
# flags) — callers MUST NOT treat a 2 the same as a legitimate 1 self-skip.
# ---------------------------------------------------------------------------
bkit_worktree_helper_guard() {
  _bwh_repo_root="${1:-}"
  _bwh_label="${2:-worktree-util}"

  if [ -z "$_bwh_repo_root" ]; then
    echo "[bkit-runtime] bkit_worktree_helper_guard: REPO_ROOT must be non-empty" >&2
    return 2
  fi

  bkit_runtime_detect "$_bwh_repo_root" "$_bwh_label" || {
    echo "[bkit-runtime] bkit_worktree_helper_guard: runtime detect failed" >&2
    return 2
  }
  bkit_runtime_assert_resolved || return 2

  if [ "$RUNTIME_WORKTREES" != "true" ]; then
    echo "[bkit-runtime] worktree helper self-skip: RUNTIME_WORKTREES=false in this runtime (RUNTIME=$RUNTIME) — .worktrees/ is not this runtime's model (adopt-mode phases work in-place on the session's own branch, no local worktree tree exists to prune/sync). No-op, not an error."
    return 1
  fi
  return 0
}
