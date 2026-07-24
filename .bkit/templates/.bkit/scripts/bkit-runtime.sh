#!/usr/bin/env sh
# bkit-runtime.sh — Runtime detection + capability table shim (#341 / WS-6, D1/D2/D21/D23).
#
# bkit's five phase workflows + bkit-auto run in three materially different
# runtimes: laptop (mode 1), a GitHub-Actions runner (mode 2), and a
# claude.ai cloud session (mode 3, `CLAUDE_CODE_REMOTE=true`). This shim
# turns runtime detection into ONE stateless, testable function that emits a
# 4-row capability table — workflow headers branch on the `CAN_*` flags
# instead of re-deriving "what runtime am I" logic at every call site.
#
# Usage (one call per Bash block — see the state-model note below):
#   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
#   bkit_runtime_detect || { echo "[bkit-runtime] detect failed" >&2; exit 2; }
#   bkit_runtime_assert_resolved || exit 2
#
# STATE MODEL (D21 — stateless, re-source-per-block, same idiom as the
# counter-bus): shell variables set by `bkit_runtime_detect` live only in the
# CURRENT process. They do NOT survive an orchestrator Bash-tool-call
# boundary (each fenced code block is a fresh subprocess) — do NOT call
# `bkit_runtime_detect` in one block and expect `$RUNTIME` to still be set in
# the next. Re-source and re-call at the start of every block that needs the
# table. The `runtime-resolved` status.jsonl row (`bkit_runtime_row`) is the
# durable, cross-block record — Step 1 writes it once per workflow run and
# later steps read `GH_OK` back from that row instead of re-probing `gh`.
#
# CAPABILITY TABLE IS A DEFAULT, NOT A TRUTH: this shim maps a runtime
# classification to a conservative DEFAULT capability set from the design's
# evidence table (issue #341 §1). It is not a live, per-call probe of every
# capability — `CAN_PUSH_DEV` in particular is deliberately NOT probed
# (D23 — a `git push --dry-run` probe fails dangerously: it sends no
# ref-update, so a protected branch's pre-receive hook never fires and a
# false-positive `CAN_PUSH_DEV=true` can lead to an unrecoverable
# `git checkout dev` on a live session). `GH_OK` is the ONE exception: it IS
# probed, once, via `gh auth status`, because gh auth is the flaky primitive
# this whole effort exists to hardened-fallback around (#341 §2).
#
# DETECTION PRIMITIVES (issue #341 §1, verified in the wild):
#   CLAUDE_CODE_REMOTE=true                  -> RUNTIME=cloud   (mode 3)
#   GITHUB_ACTIONS=true or CI=true           -> RUNTIME=actions (mode 2)
#   neither of the above                     -> RUNTIME=local   (mode 1)
#   ambiguous/absent primitives (should not
#     happen — recorded loudly if it does)   -> RUNTIME=unknown, least-capable
#
# CAPABILITY TABLE (default per RUNTIME; GH_OK probed regardless of row):
#   RUNTIME   CAN_WORKTREE  CAN_PUSH_DEV  CAN_SLEEP
#   local     true          true          true
#   actions   true          true          true
#   cloud     false         false         false
#   unknown   false         false         false      (least-capable + loud)
#
# WORKTREE_PATH: CAN_WORKTREE=true  -> mint  -> "$REPO_ROOT/.worktrees/$FID"
#                CAN_WORKTREE=false -> adopt -> "$REPO_ROOT" (work in-place,
#                  no `git worktree add` — mode 3's proxy-restricted push only
#                  allows the CURRENT working branch, so mode 3 always adopts)
#
# D14 (REJECTED, recorded so it is not silently re-proposed): render-time
# mode gating was rejected — `bkit-trackers.ts` resolves tracker config at
# INSTALL time, when the runtime is not yet known. Detection MUST happen at
# workflow run time, in-session, via this shim — never baked into a
# render/install artifact.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# bkit_runtime_detect [REPO_ROOT] [FID]
#
# Sets (in the CURRENT shell only — see state-model note above):
#   RUNTIME        local | actions | cloud | unknown
#   CAN_WORKTREE   true | false
#   CAN_PUSH_DEV   true | false
#   CAN_SLEEP      true | false
#   GH_OK          true | false          (probed once via `gh auth status`)
#   GH_PROBE_EXIT  gh's exit code (or 127 if gh is not on PATH)
#   GH_PROBE_ERR   last non-empty line of `gh auth status`'s stderr (may be empty)
#   WORKTREE_PATH  mint or adopt path (see table above)
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
  _brd_repo_root="${1:-$REPO_ROOT}"
  _brd_fid="${2:-$FID}"

  if [ -z "$_brd_repo_root" ] || [ -z "$_brd_fid" ]; then
    echo "[bkit-runtime] bkit_runtime_detect: REPO_ROOT and FID must both be non-empty (got REPO_ROOT='${_brd_repo_root}' FID='${_brd_fid}')" >&2
    RUNTIME=""
    CAN_WORKTREE=""
    CAN_PUSH_DEV=""
    CAN_SLEEP=""
    GH_OK=""
    GH_PROBE_EXIT=""
    GH_PROBE_ERR=""
    WORKTREE_PATH=""
    return 2
  fi

  # --- classify RUNTIME from the detection primitives ---------------------
  if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
    RUNTIME="cloud"
  elif [ "$GITHUB_ACTIONS" = "true" ] || [ "$CI" = "true" ]; then
    RUNTIME="actions"
  elif [ -z "$CLAUDE_CODE_REMOTE" ] && [ -z "$GITHUB_ACTIONS" ] && [ -z "$CI" ]; then
    RUNTIME="local"
  else
    # A primitive was SET but to something other than "true" (e.g. a stray
    # GITHUB_ACTIONS=false in a local shell). Do not guess; classify as
    # unknown and go least-capable, loudly, rather than silently picking a
    # runtime the environment did not actually assert.
    echo "[bkit-runtime] bkit_runtime_detect: ambiguous detection primitives (CLAUDE_CODE_REMOTE='${CLAUDE_CODE_REMOTE}' GITHUB_ACTIONS='${GITHUB_ACTIONS}' CI='${CI}') — defaulting RUNTIME=unknown, least-capable" >&2
    RUNTIME="unknown"
  fi

  # --- default capability table (D23: CAN_PUSH_DEV is a default, not a probed value) ---
  case "$RUNTIME" in
    local | actions)
      CAN_WORKTREE="true"
      CAN_PUSH_DEV="true"
      CAN_SLEEP="true"
      ;;
    cloud | unknown)
      CAN_WORKTREE="false"
      CAN_PUSH_DEV="false"
      CAN_SLEEP="false"
      ;;
  esac

  # --- GH_OK: the one live probe, once, loud (never silent) ---------------
  if command -v gh >/dev/null 2>&1; then
    _brd_gh_err="$(gh auth status 2>&1 >/dev/null)"
    GH_PROBE_EXIT=$?
    GH_PROBE_ERR="$(printf '%s\n' "$_brd_gh_err" | tail -n 1)"
  else
    GH_PROBE_EXIT=127
    GH_PROBE_ERR="gh not found on PATH"
  fi
  if [ "$GH_PROBE_EXIT" -eq 0 ]; then
    GH_OK="true"
  else
    GH_OK="false"
    echo "[bkit-runtime] gh-preflight: GH_OK=false (exit=${GH_PROBE_EXIT} err='${GH_PROBE_ERR}')" >&2
  fi

  # --- WORKTREE_PATH: mint (CAN_WORKTREE=true) vs adopt (false) -----------
  if [ "$CAN_WORKTREE" = "true" ]; then
    WORKTREE_PATH="${_brd_repo_root}/.worktrees/${_brd_fid}"
  else
    WORKTREE_PATH="${_brd_repo_root}"
  fi

  return 0
}

# ---------------------------------------------------------------------------
# bkit_runtime_assert_resolved
#
# Flow 1 — loud, distinguishable emptiness check. Must be called AFTER
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

  case "$RUNTIME" in
    local | actions | cloud | unknown) : ;;
    *)
      echo "[bkit-runtime] Flow 1: RUNTIME is UNRESOLVED (got '${RUNTIME}') — shim not sourced or bkit_runtime_detect not called this block" >&2
      _bar_rc=2
      ;;
  esac

  for _bar_flag_name in CAN_WORKTREE CAN_PUSH_DEV CAN_SLEEP GH_OK; do
    eval "_bar_flag_val=\"\${${_bar_flag_name}}\""
    case "$_bar_flag_val" in
      true | false) : ;;
      *)
        echo "[bkit-runtime] Flow 1: ${_bar_flag_name} is UNRESOLVED (got '${_bar_flag_val}') — shim not sourced or bkit_runtime_detect not called this block" >&2
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
# responsibility, same as every other row emitter in the corpus).
# Returns 2 (nothing on stdout) if WORKFLOW or AT is empty, or if the
# capability globals are not resolved (delegates to bkit_runtime_assert_resolved).
# ---------------------------------------------------------------------------
bkit_runtime_row() {
  _brr_workflow="$1"
  _brr_at="$2"

  if [ -z "$_brr_workflow" ] || [ -z "$_brr_at" ]; then
    echo "[bkit-runtime] bkit_runtime_row: WORKFLOW and AT must both be non-empty" >&2
    return 2
  fi
  bkit_runtime_assert_resolved || return 2

  printf '{"type":"runtime-resolved","workflow":"%s","at":"%s","runtime":"%s","canWorktree":%s,"canPushDev":%s,"canSleep":%s,"ghOk":%s,"ghProbeExit":%s,"ghProbeErr":"%s"}\n' \
    "$_brr_workflow" "$_brr_at" "$RUNTIME" "$CAN_WORKTREE" "$CAN_PUSH_DEV" "$CAN_SLEEP" "$GH_OK" \
    "$GH_PROBE_EXIT" "$(printf '%s' "$GH_PROBE_ERR" | sed 's/"/\\"/g')"
  return 0
}

# ---------------------------------------------------------------------------
# bkit_wait_ci PR_NUMBER [POLL_BUDGET_S] [POLL_INTERVAL_S]
#
# #341 / WS-8, D22 — the CAN_SLEEP=true bash branch ONLY. Bounded poll for a
# bkit CI check's dispatch on a PR's statusCheckRollup — the mechanism the
# three CI-Dispatch Gate call sites (build close-workflow, debug PR-mode
# close-workflow, debug LOCAL-mode create-pr) share (#261 "WS-6 contract").
#
# The CAN_SLEEP=false branch is agent prose in the CALLING workflow header,
# NOT bash (D4/D22 boundary — bash cannot yield an orchestrator turn). Do NOT
# call this function when CAN_SLEEP=false; the header's prose yield branch
# governs instead.
#
# `timeout`-wrapped around every `sleep` call so a BLOCKED sleep primitive
# (a mode-3 harness policy, not a shell capability) fails LOUD — non-zero
# return, message on stderr — instead of hanging the whole run for the
# duration of an external session timeout (D22 Risk 3: a hang emits ZERO
# observability, defeating every other success criterion this effort names).
#
# Sets (current shell only — same D21 state-model caveat as
# bkit_runtime_detect; re-call per block, do not expect these to survive a
# Bash-tool-call boundary):
#   CI_WAIT_RESULT      found | none | err
#   CI_WAIT_ATTEMPTS     number of poll iterations run this call
#   CI_WAIT_ELAPSED      seconds elapsed this call (bounded by POLL_BUDGET_S)
#   CI_WAIT_ALL_ERRORED  true|false — every poll iteration errored (gh unavailable/unauthed)
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
  _bwc_pr="$1"
  _bwc_budget="${2:-60}"
  _bwc_interval="${3:-10}"

  CI_WAIT_RESULT=""
  CI_WAIT_ATTEMPTS=0
  CI_WAIT_ELAPSED=0
  CI_WAIT_ALL_ERRORED="true"

  if [ -z "$_bwc_pr" ]; then
    echo "[bkit-ci-gate] bkit_wait_ci: PR_NUMBER must be non-empty" >&2
    CI_WAIT_RESULT="err"
    return 2
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
    if ! timeout "$((_bwc_interval + 5))" sleep "$_bwc_interval"; then
      echo "[bkit-ci-gate] bkit_wait_ci: sleep did not return within $((_bwc_interval + 5))s — blocked/foreground-sleep-restricted runtime; aborting LOUD instead of hanging (D22)" >&2
      CI_WAIT_RESULT="err"
      return 2
    fi
    CI_WAIT_ELAPSED=$((CI_WAIT_ELAPSED + _bwc_interval))
  done

  CI_WAIT_RESULT="none"
  return 0
}

# ---------------------------------------------------------------------------
# Close-guard + close-audit kernel (#341 / WS-10, D23/D24/D25/Risk 4)
#
# Transport-agnostic: every helper below is expressed over plain git/jq and
# holds on WHICHEVER close shape/transport ran (local checkout-and-push, or
# a mapped gh->MCP fallback tool) — see issue #341 Flow 4. Emits/consumes
# `transport-fallback` and `close-transport` status.jsonl rows (additive,
# #234 artifact — .bkit/workflows.md documents both shapes).
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# bkit_close_guard_checkout TARGET_BRANCH
#
# D23 — double-guard + reversible checkout. The ONLY sanctioned way to
# locally `git checkout` a shared branch (e.g. `dev`) during a phase close.
#
# Double-guard (both, not either — deliberate redundancy at the one site
# where being wrong is worst): refuses UNLESS `CAN_WORKTREE=true` AND
# `CAN_PUSH_DEV=true` are both already resolved in the CURRENT shell (call
# `bkit_runtime_detect` first, same block — D21 state model). `CAN_PUSH_DEV`
# is a default, not a probed truth (see file header) — this guard does NOT
# replace the real push/merge as the actual permission certifier; it only
# gates whether a LOCAL checkout is attempted at all.
#
# Reversible: captures the current branch before checkout and installs an
# `EXIT` trap that restores it — this closes the D6 hazard (a stray local
# `dev` checkout stranding a mode-3 session) even if BOTH capability flags
# were wrong, which no probe can do (D23). The trap fires on the CURRENT
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
  _bcg_target="$1"

  if [ -z "$_bcg_target" ]; then
    echo "[bkit-close-guard] bkit_close_guard_checkout: TARGET_BRANCH must be non-empty" >&2
    return 2
  fi
  if [ "$CAN_WORKTREE" != "true" ] || [ "$CAN_PUSH_DEV" != "true" ]; then
    echo "[bkit-close-guard] D23 double-guard: CAN_WORKTREE='${CAN_WORKTREE:-unset}' CAN_PUSH_DEV='${CAN_PUSH_DEV:-unset}' — both must be 'true' to checkout '$_bcg_target' locally; refusing" >&2
    return 2
  fi

  BKIT_CLOSE_GUARD_ORIG_BRANCH=$(git branch --show-current)
  if [ -z "$BKIT_CLOSE_GUARD_ORIG_BRANCH" ]; then
    echo "[bkit-close-guard] bkit_close_guard_checkout: could not resolve current branch (detached HEAD?) — refusing to checkout '$_bcg_target'" >&2
    return 2
  fi

  # shellcheck disable=SC2064 # BKIT_CLOSE_GUARD_ORIG_BRANCH is intentionally expanded now
  trap "git checkout '$BKIT_CLOSE_GUARD_ORIG_BRANCH' >/dev/null 2>&1 || true" EXIT

  if ! git checkout "$_bcg_target"; then
    echo "[bkit-close-guard] bkit_close_guard_checkout: 'git checkout $_bcg_target' failed" >&2
    return 1
  fi
  return 0
}

# ---------------------------------------------------------------------------
# bkit_close_guard_scan_body SHA [REMOTE_REF]
#
# D24 — post-close skip-token scan of the LANDED commit, transport-agnostic.
# D1's aetiology was a pre-merge PR-TITLE grep that never re-checked the
# actual squash-merge BODY that landed — this scans the commit that is
# actually on the branch, after the fact, on either transport.
#
# Args: SHA (the landed commit, required). REMOTE_REF (optional) — when the
# close ran server-side (a mapped MCP tool, not a local push), pass e.g.
# "dev" to `git fetch origin REMOTE_REF` first so SHA is resolvable locally.
#
# Returns 0 if the commit body carries NO CI-suppression token. Returns 1
# (loud) if it does — route the caller to Failure Path. Returns 2 if SHA is
# empty or the commit cannot be read at all (distinct from "found a token").
# ---------------------------------------------------------------------------
bkit_close_guard_scan_body() {
  _bcs_sha="$1"
  _bcs_remote="${2:-}"

  if [ -z "$_bcs_sha" ]; then
    echo "[bkit-close-guard] bkit_close_guard_scan_body: SHA must be non-empty" >&2
    return 2
  fi
  if [ -n "$_bcs_remote" ]; then
    git fetch origin "$_bcs_remote" >/dev/null 2>&1 || true
  fi

  _bcs_body=$(git log -1 --format=%B "$_bcs_sha" 2>/dev/null)
  _bcs_rc=$?
  if [ "$_bcs_rc" -ne 0 ] || [ -z "$_bcs_body" ]; then
    echo "[bkit-close-guard] bkit_close_guard_scan_body: could not read commit body for '$_bcs_sha'" >&2
    return 2
  fi

  if printf '%s' "$_bcs_body" | grep -qE '\[skip ci\]|\[skip actions\]'; then
    echo "[bkit-close-guard] D24: landed commit '$_bcs_sha' body carries a CI-suppression token" >&2
    return 1
  fi
  return 0
}

# ---------------------------------------------------------------------------
# bkit_close_guard_cross_check STATUS_PATH TRANSPORT
#
# D25 — mechanical cross-check of the `transport-fallback` recording itself.
# The audit trail is only as trustworthy as the compliance layer that could
# have produced D1/D2 in the first place — do not trust prose to have
# written the row; assert it mechanically, over the real status.jsonl.
#
# Rule: if the run's LATEST `runtime-resolved` row logged `ghOk:false` at
# Step 1 AND this close used a mapped (non-gh) TRANSPORT, at least one
# `transport-fallback` row MUST already exist in STATUS_PATH — else Failure
# Path. `TRANSPORT="gh"` is exempt (no fallback was needed).
#
# Args: STATUS_PATH (path to this run's status.jsonl, required). TRANSPORT
# (the transport this close actually used, e.g. "gh" | "mcp", required).
#
# Returns 0 when the invariant holds (either GH_OK was true, TRANSPORT was
# "gh", or a transport-fallback row is present). Returns 1 (loud) when
# GH_OK=false + a mapped TRANSPORT closed WITHOUT a recorded fallback row —
# route to Failure Path. Returns 2 if args are empty or STATUS_PATH is
# missing/unreadable.
# ---------------------------------------------------------------------------
bkit_close_guard_cross_check() {
  _bcx_status="$1"
  _bcx_transport="$2"

  if [ -z "$_bcx_status" ] || [ -z "$_bcx_transport" ]; then
    echo "[bkit-close-guard] bkit_close_guard_cross_check: STATUS_PATH and TRANSPORT must both be non-empty" >&2
    return 2
  fi
  if [ ! -f "$_bcx_status" ]; then
    echo "[bkit-close-guard] bkit_close_guard_cross_check: status file '$_bcx_status' not found" >&2
    return 2
  fi

  # NOTE: deliberately NOT `.ghOk // "unknown"` — jq's `//` alternative
  # operator treats a JSON `false` value as falsy too, so that idiom would
  # silently rewrite a real `ghOk:false` into the string "unknown" and this
  # cross-check would never fire. Explicit null-check instead.
  _bcx_gh_ok=$(jq -s -r '[.[] | select(.type=="runtime-resolved")] | last | .ghOk | if . == null then "unknown" else tostring end' "$_bcx_status" 2>/dev/null)
  if [ -z "$_bcx_gh_ok" ]; then
    echo "[bkit-close-guard] bkit_close_guard_cross_check: could not read status file '$_bcx_status'" >&2
    return 2
  fi

  if [ "$_bcx_gh_ok" = "false" ] && [ "$_bcx_transport" != "gh" ]; then
    _bcx_fallback_count=$(jq -s '[.[] | select(.type=="transport-fallback")] | length' "$_bcx_status" 2>/dev/null)
    if [ -z "$_bcx_fallback_count" ] || [ "$_bcx_fallback_count" -eq 0 ]; then
      echo "[bkit-close-guard] D25: runtime-resolved logged ghOk=false and this close used transport '$_bcx_transport', but no transport-fallback row exists in '$_bcx_status'" >&2
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
# ONE row per gh->MCP transition (bounded max 1/run, D13); read back by
# `bkit_close_guard_cross_check` (D25).
#
# Args, all required: FROM (the gh command that was unavailable/unauthed),
# TO (the mapped MCP tool used instead), REASON (why — e.g. "GH_OK=false"),
# ASSERTED_BY (how the fallback's success was independently confirmed),
# AT (ISO-8601 timestamp, caller's responsibility).
#
# Returns 2 (nothing on stdout) if any arg is empty.
# ---------------------------------------------------------------------------
bkit_transport_fallback_row() {
  _btf_from="$1"
  _btf_to="$2"
  _btf_reason="$3"
  _btf_asserted_by="$4"
  _btf_at="$5"

  if [ -z "$_btf_from" ] || [ -z "$_btf_to" ] || [ -z "$_btf_reason" ] || [ -z "$_btf_asserted_by" ] || [ -z "$_btf_at" ]; then
    echo "[bkit-close-guard] bkit_transport_fallback_row: FROM, TO, REASON, ASSERTED_BY and AT must all be non-empty" >&2
    return 2
  fi

  printf '{"type":"transport-fallback","from":"%s","to":"%s","reason":"%s","assertedBy":"%s","at":"%s"}\n' \
    "$(printf '%s' "$_btf_from" | sed 's/"/\\"/g')" \
    "$(printf '%s' "$_btf_to" | sed 's/"/\\"/g')" \
    "$(printf '%s' "$_btf_reason" | sed 's/"/\\"/g')" \
    "$(printf '%s' "$_btf_asserted_by" | sed 's/"/\\"/g')" \
    "$_btf_at"
  return 0
}

# ---------------------------------------------------------------------------
# bkit_close_transport_row SHAPE SHA SCAN_RESULT AT
#
# Prints one `close-transport` status.jsonl row (pure, same convention).
# Records which of the 3 close shapes (A/B/C, design docs) ran, the SHA that
# landed on `dev`, and the D24 post-close scan's outcome — the Close
# Workflow's own audit trail entry, transport-agnostic.
#
# Args, all required: SHAPE ("A" | "B" | "C"), SHA (the landed commit),
# SCAN_RESULT ("clean" | "skip-token-found" — the `bkit_close_guard_scan_body`
# outcome), AT (ISO-8601 timestamp, caller's responsibility).
#
# Returns 2 (nothing on stdout) if any arg is empty.
# ---------------------------------------------------------------------------
bkit_close_transport_row() {
  _bct_shape="$1"
  _bct_sha="$2"
  _bct_scan_result="$3"
  _bct_at="$4"

  if [ -z "$_bct_shape" ] || [ -z "$_bct_sha" ] || [ -z "$_bct_scan_result" ] || [ -z "$_bct_at" ]; then
    echo "[bkit-close-guard] bkit_close_transport_row: SHAPE, SHA, SCAN_RESULT and AT must all be non-empty" >&2
    return 2
  fi

  printf '{"type":"close-transport","shape":"%s","sha":"%s","scanResult":"%s","at":"%s"}\n' \
    "$_bct_shape" "$_bct_sha" "$_bct_scan_result" "$_bct_at"
  return 0
}
