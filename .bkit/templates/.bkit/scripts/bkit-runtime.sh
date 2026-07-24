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
