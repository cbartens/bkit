#!/usr/bin/env sh
# bkit-rebase-resolve.sh — Tier-2 auto-resolution for rebase conflicts.
#
# Single source of truth for "conflicts a workflow may resolve on its own".
# Sourced by Step 2 of bkit-build.md / bkit-debug.md / bkit-design.md /
# bkit-plan.md, which previously handled exactly one shape (`pnpm-lock.yaml`,
# and ONLY when it was the sole conflicted path) and sent everything else —
# including append-only ledgers that concatenate losslessly — to the Failure
# Path.
#
# Usage (from inside the worktree, immediately after a failed rebase):
#   . "$REPO_ROOT/.bkit/scripts/bkit-rebase-resolve.sh" || { echo "[bkit-rebase] missing bkit-rebase-resolve.sh — run 'bkit install'" >&2; exit 2; }
#   bkit_rebase_resolve || <Tier 3: abort + sentinel + Failure Path>
#
# Contract:
#   - Call ONLY with a rebase in progress. Returns 0 iff every conflicted path
#     across every remaining commit was auto-resolved AND the rebase ran to
#     completion. Returns non-zero otherwise, leaving the rebase in progress
#     for the caller to `git rebase --abort` — this script never aborts, so
#     the caller keeps the conflict state for diagnosis.
#   - Refuses on the first unrecognised path. Partial resolution is never
#     committed: the caller's abort unwinds it.
#
# Why ledgers are safe to auto-union: every path in BKIT_REBASE_LEDGERS is
# append-only, and its reader folds last-wins by `ts` over an identity tuple.
# Union may interleave or duplicate rows; the reader resolves that. This is the
# same resolution `merge=union` in `.gitattributes` would have produced — the
# script is the safety net for when that attribute did not apply (consumer
# installed at an older bkit whose `.gitattributes` predates a ledger, no
# `.gitattributes` at all, or `.bkit/friction.jsonl`, which ships unlisted).
#
# `.bkit/friction.jsonl` is included here even though `.gitattributes` ships it
# unlisted. That exclusion is about `bkit harvest` drains: union can resurrect a
# drained row. Resurrection is idempotently re-banked by the next harvest,
# whereas a blocking conflict halts the workflow — so at REBASE time the union
# is the cheaper error. Deliberate divergence from the attribute, not an
# oversight.

# The auto-resolvable ledger set — ONE newline-separated list of globs, the
# single source of truth for this file. Keep it in step with the `merge=union`
# entries in `.bkit/templates/.gitattributes` (plus `.bkit/friction.jsonl`,
# which ships unlisted there — see the header). Asserted by
# bkit-rebase-resolve.test.ts.
BKIT_REBASE_LEDGERS='docs/knowledge.jsonl
docs/decisions.jsonl
docs/deferrals.jsonl
docs/failures.jsonl
docs/completed.md
.bkit/stats.jsonl
.bkit/friction.jsonl
docs/plans/**/status.jsonl'

# Emit a resolution log line. Callers capture stderr into their step artifact.
bkit_rebase_log() {
  echo "[bkit-rebase] $*" >&2
}

# Classify one conflicted path: prints `ledger`, `lockfile`, or `refuse`.
bkit_rebase_classify() {
  case "$1" in
    pnpm-lock.yaml | package-lock.json | yarn.lock | bun.lock | Cargo.lock | go.sum | uv.lock)
      echo lockfile
      return 0
      ;;
  esac
  # Match each glob in turn rather than restating the list as `case` branches —
  # two copies of the same list is exactly how this drifts. Read-loop, not
  # `for ... in $VAR`: zsh does not word-split unquoted expansions.
  #
  # Glob is converted to an anchored ERE rather than fed to `case`: in zsh a
  # variable used as a `case` pattern is matched LITERALLY unless written
  # `${~var}`, which is not valid sh — so `case` would silently fail to match
  # the one wildcard entry (`docs/plans/**/status.jsonl`) under the very shell
  # these workflow blocks usually run in. sed + grep -E behave identically in
  # sh, bash and zsh.
  #   `.`  -> literal dot
  #   `**` -> any depth (crosses `/`), matching .gitattributes semantics
  #   `*`  -> exactly one path segment
  while IFS= read -r _pat; do
    [ -n "$_pat" ] || continue
    _re=$(printf '%s\n' "$_pat" | sed -e 's/[.]/\\./g' -e 's/\*\*/@@GLOBSTAR@@/g' -e 's/[*]/[^\/]*/g' -e 's/@@GLOBSTAR@@/.*/g')
    if printf '%s\n' "$1" | grep -Eq "^${_re}\$"; then
      echo ledger
      return 0
    fi
  done <<BKIT_LEDGERS
$BKIT_REBASE_LEDGERS
BKIT_LEDGERS
  echo refuse
}

# Union-resolve one conflicted ledger path, in place.
#
# Reconstructs the three merge stages from the index and runs `git merge-file
# --union` — literally the driver `merge=union` would have run, so a path
# resolved here is byte-identical to one the attribute pre-empted. Handles
# add/add (no stage 1) and delete/modify (missing stage 2 or 3) by treating the
# absent side as empty, which for an append-only ledger means "keep the rows
# that do exist".
bkit_rebase_union() {
  # `_uf`, not `_f`: sh has no local scoping and the caller loops on `_f`.
  _uf="$1"
  _tmp="${TMPDIR:-/tmp}/bkit-rebase-$$"
  mkdir -p "$_tmp" || return 1

  # A missing stage is a legitimate shape (add/add, delete/modify), not an
  # error — `: >` leaves an empty file to merge against.
  git show ":1:$_uf" >"$_tmp/base" 2>/dev/null || : >"$_tmp/base"
  git show ":2:$_uf" >"$_tmp/ours" 2>/dev/null || : >"$_tmp/ours"
  git show ":3:$_uf" >"$_tmp/theirs" 2>/dev/null || : >"$_tmp/theirs"

  # --union never leaves conflict markers, so a non-zero exit here is an I/O
  # failure, not an unresolved hunk.
  if ! git merge-file --union -p "$_tmp/ours" "$_tmp/base" "$_tmp/theirs" >"$_tmp/merged" 2>/dev/null; then
    rm -rf "$_tmp"
    return 1
  fi

  case "$_uf" in
    *.jsonl)
      # A ledger whose last line lacked a trailing newline can be torn by union
      # (the two sides' last lines splice into one). Validating every line as
      # JSON is what catches that; without jq, skip the check rather than fail
      # the whole workflow over a missing tool.
      if command -v jq >/dev/null 2>&1; then
        if ! jq -e . "$_tmp/merged" >/dev/null 2>&1; then
          bkit_rebase_log "REFUSE $_uf — union produced a line that is not valid JSON (torn row?)"
          rm -rf "$_tmp"
          return 1
        fi
      fi
      # Exact-duplicate rows are pure noise for a last-wins-by-`ts` reader, and
      # the no-trailing-newline splice above is a common source of them. Order
      # is preserved (first occurrence wins) — `sort -u` would not.
      awk '!seen[$0]++' "$_tmp/merged" >"$_tmp/deduped"
      mv "$_tmp/deduped" "$_tmp/merged"
      ;;
    *)
      # docs/completed.md is prose: repeated blank lines and repeated headings
      # are legitimate, so it is unioned but never deduped.
      ;;
  esac

  # Normalise the trailing newline so the NEXT append starts on its own line.
  [ -s "$_tmp/merged" ] && [ -n "$(tail -c 1 "$_tmp/merged")" ] && echo >>"$_tmp/merged"

  cp "$_tmp/merged" "$_uf" || { rm -rf "$_tmp"; return 1; }
  rm -rf "$_tmp"
  return 0
}

# Resolve a lockfile by taking the rebase target's copy and regenerating it from
# the manifest. Regeneration is what makes this safe: `--theirs` alone would drop
# whatever this branch added, so the manifest — which merged normally, or refused
# and stopped us before here — is the source of truth for what must be present.
#
# One branch per manager, keyed by the lockfile name, because the regenerate
# command is the part that differs. A lockfile with no branch is left conflicted
# and the caller refuses: better a halted rebase than a lockfile silently
# regenerated by the wrong tool.
bkit_rebase_lockfile() {
  git checkout --theirs "$1" 2>/dev/null || return 1
  case "$1" in
    pnpm-lock.yaml) pnpm install --lockfile-only >/dev/null 2>&1 || return 1 ;;
    package-lock.json) npm install --package-lock-only >/dev/null 2>&1 || return 1 ;;
    yarn.lock) yarn install --mode=update-lockfile >/dev/null 2>&1 || return 1 ;;
    bun.lock) bun install --lockfile-only >/dev/null 2>&1 || return 1 ;;
    Cargo.lock) cargo generate-lockfile >/dev/null 2>&1 || return 1 ;;
    go.sum) go mod tidy >/dev/null 2>&1 || return 1 ;;
    uv.lock) uv lock >/dev/null 2>&1 || return 1 ;;
    *) return 1 ;;
  esac
  return 0
}

# Drive the rebase to completion, auto-resolving each stop.
#
# Loops because `--continue` replays the NEXT commit, which can conflict in
# turn; the bound is a runaway guard, not an expected count.
bkit_rebase_resolve() {
  _round=0
  while [ "$_round" -lt 100 ]; do
    _round=$((_round + 1))

    _conflicts=$(git diff --name-only --diff-filter=U)
    if [ -n "$_conflicts" ]; then
      # `while IFS= read -r`, never `for _f in $_conflicts`: zsh does not
      # word-split unquoted expansions, and these blocks run under whatever
      # login shell the agent has. The read loop behaves identically in sh,
      # bash and zsh. It is not a subshell (redirect, not pipe), so `return`
      # from inside it returns from the function.

      # Classify the WHOLE set before resolving any of it, so a refused path
      # never leaves half the set rewritten.
      _refused=""
      while IFS= read -r _f; do
        [ -n "$_f" ] || continue
        if [ "$(bkit_rebase_classify "$_f")" = refuse ]; then
          _refused="$_f"
          break
        fi
      done <<BKIT_CONFLICTS
$_conflicts
BKIT_CONFLICTS
      if [ -n "$_refused" ]; then
        bkit_rebase_log "REFUSE $_refused — not an append-only ledger or a recognised lockfile; routing to Failure Path"
        return 1
      fi

      _failed=""
      while IFS= read -r _f; do
        [ -n "$_f" ] || continue
        case "$(bkit_rebase_classify "$_f")" in
          ledger)
            if bkit_rebase_union "$_f" </dev/null; then
              bkit_rebase_log "RESOLVED $_f — union (append-only ledger)"
            else
              _failed="$_f"
              break
            fi
            ;;
          lockfile)
            if bkit_rebase_lockfile "$_f" </dev/null; then
              bkit_rebase_log "RESOLVED $_f — took rebase target + regenerated"
            else
              _failed="$_f"
              break
            fi
            ;;
        esac
        git add -- "$_f" </dev/null || { _failed="$_f"; break; }
      done <<BKIT_CONFLICTS
$_conflicts
BKIT_CONFLICTS
      if [ -n "$_failed" ]; then
        bkit_rebase_log "REFUSE $_failed — resolution failed"
        return 1
      fi
    fi

    # Resolving a conflict can empty the commit (both sides appended the same
    # rows). `--continue` refuses an empty commit and tells you to `--skip`;
    # detect it here rather than parsing that message.
    if git diff --cached --quiet && [ -z "$(git diff --name-only --diff-filter=U)" ]; then
      if GIT_EDITOR=true git rebase --skip >/dev/null 2>&1; then
        bkit_rebase_log "SKIPPED an empty commit (its changes were already on the target)"
      else
        bkit_rebase_log "REFUSE — git rebase --skip failed"
        return 1
      fi
    elif ! GIT_EDITOR=true git rebase --continue >/dev/null 2>&1; then
      # Either the next commit conflicted (loop handles it) or the rebase is
      # genuinely stuck. Unmerged paths present => keep going; none => stuck.
      if [ -z "$(git diff --name-only --diff-filter=U)" ]; then
        bkit_rebase_log "REFUSE — git rebase --continue failed with no unmerged paths"
        return 1
      fi
      continue
    fi

    # Rebase directories gone => the rebase finished.
    if [ ! -d "$(git rev-parse --git-path rebase-merge 2>/dev/null)" ] &&
      [ ! -d "$(git rev-parse --git-path rebase-apply 2>/dev/null)" ]; then
      bkit_rebase_log "COMPLETE — rebase finished after $_round auto-resolved round(s)"
      return 0
    fi
  done

  bkit_rebase_log "REFUSE — exceeded 100 auto-resolve rounds; treating as stuck"
  return 1
}
