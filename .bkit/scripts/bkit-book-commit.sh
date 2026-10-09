#!/usr/bin/env bash
# bkit-book-commit.sh — shell-independent bookkeeping stage-and-commit (#446).
#
# The workflow bash blocks that stage/commit ledgers (status.jsonl, friction,
# stats, deferrals, ...) used to build the pathspec with unquoted shell
# word-splitting and an `ls` glob that ABORTS on zsh when a glob matches
# nothing — silently dropping ledgers from a fresh consumer repo, and (worse)
# swallowing a failed `git add` into a false "nothing to commit" success
# message. Every workflow bash block here runs under whatever shell the host
# provides (proven not to be bash on stock macOS Claude Code) — this script
# is invoked with an explicit `bash` prefix so it always runs under bash
# regardless of host shell, and it never uses shell globbing or word-split
# variables to build a pathspec:
#
#   - The pathspec is built with `git ls-files` against quoted globs — git
#     does the matching, not the shell, so an unmatched glob is empty output
#     (exit 0), never an abort and never a word-split string.
#   - Staging and committing consume that list via `--pathspec-from-file`
#     (NUL-delimited), never a re-interpolated shell string.
#   - Every failure is caught explicitly (no `set -e`) and reported on
#     stderr with `[bkit-book]` and a distinct exit code, so a staging or
#     commit failure can never be mistaken for "nothing to commit".
#
# Usage (primary contract):
#   bash bkit-book-commit.sh \
#     --root=<dir> --month=<YYYYMM> --fid=<FID> \
#     --scope=core|full|pr \
#     --mode=stage|commit|commit-allow-empty \
#     [--stage-tracked-updates] \
#     [--squash-of=<ref>] \
#     [--message=<commit message>]
#
#   --squash-of=<ref> (commit modes only): after a `git merge --squash <ref>`
#   in <root>, the commit also carries every path <ref> changed since its
#   merge-base with HEAD — the files the squash brought in. Those paths are
#   committed as the squash staged them, never re-added, so a deletion the
#   squash staged lands as a deletion. Nothing else already staged is
#   committed.
#
# Usage (ledger union — Task 3, worktree-teardown ledger merge; a bashism
# (process substitution) so it lives here rather than inline in a workflow
# bash block):
#   bash bkit-book-commit.sh union-ledgers --src=<dir> --dst=<dir>
#
# Usage (bookkeeping-only check — the ship merge gate accepts a green CI run
# at <from> for head <to> only when every path changed in between is one this
# script would stage under --scope=pr; same allow-list, one definition):
#   bash bkit-book-commit.sh only-bookkeeping \
#     --root=<dir> --month=<YYYYMM> --fid=<FID> --from=<sha> --to=<sha>
#
# Exit codes:
#   0  success — including the legitimate "nothing to commit" outcome under
#      --mode=commit, "no ledgers to union" under union-ledgers, and "every
#      changed path is bookkeeping" under only-bookkeeping.
#   2  usage error (missing/invalid flag).
#   3  root/repo unusable — not a directory, not a git repo, git too old, or
#      the --squash-of ref does not resolve to a commit.
#   4  staging failed (`git add` / `git add -u` / mkdir non-zero exit).
#   5  commit failed (`git commit` non-zero exit).
#   6  empty pathspec list — refusing to reach `commit`. `git commit
#      --pathspec-from-file=<empty file>` does NOT commit nothing; it
#      commits everything already staged in the index (verified trap, see
#      issue #446). Deriving the list from `git ls-files` means "empty"
#      genuinely means "swept the whole tree and found nothing to record",
#      which is worth a loud stop, not a silent full-index commit.
#   7  only-bookkeeping: a path outside the allow-list changed between
#      <from> and <to> (listed on stderr), or <from> is not an ancestor of <to>.
set -uo pipefail

log() { printf '[bkit-book] %s\n' "$*" >&2; }

# The bookkeeping allow-list. Quoted globs are expanded by git itself, never
# the shell. Plain git pathspec `*` crosses `/`, so top-level-only entries use
# the `:(glob)` magic.
build_pathspecs() {
  PATHSPECS=(
    "docs/plans/$MONTH/logs/$FID/*"
    ".bkit/friction.jsonl"
    ".bkit/stats.jsonl"
    "docs/plans/*/logs/*/*.jsonl"
    "docs/*.jsonl"
    ".bkit/*.jsonl"
    # Generated roadmap board — a pure projection of .bkit/issues.jsonl, but a
    # .md, so no *.jsonl glob above reaches it.
    "docs/roadmap.md"
  )
  if [ "$SCOPE" = "full" ] || [ "$SCOPE" = "pr" ]; then
    PATHSPECS+=(
      "docs/deferrals.jsonl"
      "docs/failures.jsonl"
      "docs/knowledge.jsonl"
      "docs/decisions.jsonl"
      "skills-lock.json"
      ".agents/skills/*"
      ".claude/skills/*"
      ".cursor/skills/*"
      ".opencode/skills/*"
    )
  fi
  # `pr` = full + the project docs ship's docs sync edits, for the pre-merge
  # commit that rides the PR. Kept out of `full` so a close or failure flush on
  # a laptop's dev checkout never sweeps unrelated dirty docs into its commit.
  # Top level only: docs/plans/** has its own scoped entry above, and
  # docs/templates/** is bkit-managed. Overlaps docs/roadmap.md above;
  # ls-files de-duplicates.
  if [ "$SCOPE" = "pr" ]; then
    PATHSPECS+=(":(glob)docs/*.md")
  fi
}

# ---------------------------------------------------------------------------
# only-bookkeeping subcommand — ship merge gate (validated-head carry-forward)
# ---------------------------------------------------------------------------
if [ "${1:-}" = "only-bookkeeping" ]; then
  shift
  ROOT=""
  MONTH=""
  FID=""
  FROM=""
  TO=""
  for arg in "$@"; do
    case "$arg" in
      --root=*) ROOT="${arg#--root=}" ;;
      --month=*) MONTH="${arg#--month=}" ;;
      --fid=*) FID="${arg#--fid=}" ;;
      --from=*) FROM="${arg#--from=}" ;;
      --to=*) TO="${arg#--to=}" ;;
      *) log "only-bookkeeping: unknown argument: $arg"; exit 2 ;;
    esac
  done
  for req in ROOT MONTH FID FROM TO; do
    [ -n "${!req}" ] || { log "only-bookkeeping: --$(printf '%s' "$req" | tr '[:upper:]' '[:lower:]') is required"; exit 2; }
  done
  [ -d "$ROOT" ] || { log "only-bookkeeping: root not a directory: $ROOT"; exit 3; }
  git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || { log "only-bookkeeping: root not a git repo: $ROOT"; exit 3; }
  git -C "$ROOT" cat-file -e "$FROM^{commit}" 2>/dev/null || { log "only-bookkeeping: unknown commit: $FROM"; exit 3; }
  git -C "$ROOT" cat-file -e "$TO^{commit}" 2>/dev/null || { log "only-bookkeeping: unknown commit: $TO"; exit 3; }
  if ! git -C "$ROOT" merge-base --is-ancestor "$FROM" "$TO"; then
    log "only-bookkeeping: $FROM is not an ancestor of $TO"
    exit 7
  fi
  SCOPE=pr
  build_pathspecs
  if ! ALL=$(git -C "$ROOT" diff --name-only --no-renames "$FROM" "$TO"); then
    log "only-bookkeeping: 'git diff' failed for $FROM..$TO"
    exit 3
  fi
  if ! BOOK=$(git -C "$ROOT" diff --name-only --no-renames "$FROM" "$TO" -- "${PATHSPECS[@]}"); then
    log "only-bookkeeping: 'git diff' failed for $FROM..$TO"
    exit 3
  fi
  OUTSIDE=$(comm -23 <(printf '%s\n' "$ALL" | sed '/^$/d' | sort) <(printf '%s\n' "$BOOK" | sed '/^$/d' | sort))
  if [ -n "$OUTSIDE" ]; then
    log "only-bookkeeping: non-bookkeeping paths changed in $FROM..$TO:"
    printf '%s\n' "$OUTSIDE" | sed 's/^/[bkit-book]   /' >&2
    exit 7
  fi
  log "only-bookkeeping: every path changed in $FROM..$TO is bookkeeping"
  exit 0
fi

# ---------------------------------------------------------------------------
# union-ledgers subcommand — Task 3 (bkit-ship.md worktree-teardown union)
# ---------------------------------------------------------------------------
if [ "${1:-}" = "union-ledgers" ]; then
  shift
  SRC=""
  DST=""
  for arg in "$@"; do
    case "$arg" in
      --src=*) SRC="${arg#--src=}" ;;
      --dst=*) DST="${arg#--dst=}" ;;
      *) log "union-ledgers: unknown argument: $arg"; exit 2 ;;
    esac
  done
  [ -n "$SRC" ] || { log "union-ledgers: --src is required"; exit 2; }
  [ -n "$DST" ] || { log "union-ledgers: --dst is required"; exit 2; }
  [ -d "$SRC" ] || { log "union-ledgers: src not a directory: $SRC"; exit 3; }
  git -C "$SRC" rev-parse --git-dir >/dev/null 2>&1 || { log "union-ledgers: src not a git repo: $SRC"; exit 3; }

  UNIONED=0
  while IFS= read -r -d '' L; do
    [ -f "$SRC/$L" ] || continue
    mkdir -p "$DST/$(dirname "$L")" || { log "union-ledgers: mkdir failed for $DST/$(dirname "$L")"; exit 4; }
    if [ -f "$DST/$L" ]; then
      NEW_ROWS=$(grep -F -x -v -f "$DST/$L" "$SRC/$L")
      [ -n "$NEW_ROWS" ] && printf '%s\n' "$NEW_ROWS" >> "$DST/$L"
    else
      cp "$SRC/$L" "$DST/$L" || { log "union-ledgers: copy failed for $L"; exit 4; }
    fi
    UNIONED=$((UNIONED + 1))
  # .bkit/issues.jsonl is excluded: ship writes its SHIPPED row into the
  # worktree before the merge so it rides the PR. Unioning it into a dev
  # checkout from a run that never merged would mark the feature shipped.
  done < <(git -C "$SRC" ls-files -z --cached --others --exclude-standard -- \
             "docs/plans/*/logs/*/*.jsonl" "docs/*.jsonl" ".bkit/*.jsonl" \
             ":(exclude).bkit/issues.jsonl")

  log "union-ledgers: swept $UNIONED ledger(s) from $SRC into $DST"
  exit 0
fi

# ---------------------------------------------------------------------------
# Primary contract — stage / commit
# ---------------------------------------------------------------------------
ROOT=""
MONTH=""
FID=""
SCOPE=""
MODE=""
STAGE_TRACKED_UPDATES=0
SQUASH_OF=""
MESSAGE=""

for arg in "$@"; do
  case "$arg" in
    --root=*) ROOT="${arg#--root=}" ;;
    --month=*) MONTH="${arg#--month=}" ;;
    --fid=*) FID="${arg#--fid=}" ;;
    --scope=*) SCOPE="${arg#--scope=}" ;;
    --mode=*) MODE="${arg#--mode=}" ;;
    --stage-tracked-updates) STAGE_TRACKED_UPDATES=1 ;;
    --squash-of=*) SQUASH_OF="${arg#--squash-of=}" ;;
    --message=*) MESSAGE="${arg#--message=}" ;;
    *) log "unknown argument: $arg"; exit 2 ;;
  esac
done

[ -n "$ROOT" ] || { log "--root is required"; exit 2; }
[ -n "$MONTH" ] || { log "--month is required"; exit 2; }
[ -n "$FID" ] || { log "--fid is required"; exit 2; }
case "$SCOPE" in
  core | full | pr) ;;
  *) log "--scope must be core, full, or pr (got '$SCOPE')"; exit 2 ;;
esac
case "$MODE" in
  stage | commit | commit-allow-empty) ;;
  *) log "--mode must be stage, commit, or commit-allow-empty (got '$MODE')"; exit 2 ;;
esac
if [ "$MODE" != "stage" ] && [ -z "$MESSAGE" ]; then
  log "--message is required for --mode=$MODE"
  exit 2
fi
if [ "$MODE" = "stage" ] && [ -n "$SQUASH_OF" ]; then
  log "--squash-of applies to commit modes only"
  exit 2
fi

[ -d "$ROOT" ] || { log "root not a directory: $ROOT"; exit 3; }
git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || { log "root not a git repo: $ROOT"; exit 3; }
if [ -n "$SQUASH_OF" ] && ! git -C "$ROOT" rev-parse -q --verify "$SQUASH_OF^{commit}" >/dev/null; then
  log "--squash-of: unknown commit: $SQUASH_OF"
  exit 3
fi

GIT_VERSION=$(git --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)
GIT_MAJOR=${GIT_VERSION%%.*}
GIT_MINOR=$(printf '%s' "$GIT_VERSION" | cut -d. -f2)
if [ -z "$GIT_MAJOR" ] || [ -z "$GIT_MINOR" ] || [ "$GIT_MAJOR" -lt 2 ] || { [ "$GIT_MAJOR" -eq 2 ] && [ "$GIT_MINOR" -lt 25 ]; }; then
  log "git >= 2.25 required for --pathspec-from-file (found '${GIT_VERSION:-unknown}')"
  exit 3
fi

if [ "$STAGE_TRACKED_UPDATES" = 1 ]; then
  if ! git -C "$ROOT" add -u; then
    log "'git add -u' failed"
    exit 4
  fi
fi

# Build the pathspec via `git ls-files`, never via shell globbing: quoted
# globs are expanded by git itself, so an unmatched glob is empty output
# (exit 0) rather than an abort, and the shell never word-splits the result.
build_pathspecs

BOOK_LIST=$(mktemp) || { log "mktemp failed"; exit 3; }
SQUASH_LIST=$(mktemp) || { log "mktemp failed"; exit 3; }
COMMIT_LIST=$(mktemp) || { log "mktemp failed"; exit 3; }
trap 'rm -f "$BOOK_LIST" "$SQUASH_LIST" "$COMMIT_LIST"' EXIT

if ! git -C "$ROOT" ls-files -z --cached --others --exclude-standard -- "${PATHSPECS[@]}" > "$BOOK_LIST"; then
  log "'git ls-files' failed while building the pathspec"
  exit 3
fi

SQUASH_PATHS=()
if [ -n "$SQUASH_OF" ]; then
  if ! git -C "$ROOT" diff --name-only -z --no-renames "HEAD...$SQUASH_OF" > "$SQUASH_LIST"; then
    log "'git diff' failed while listing the paths $SQUASH_OF brought in"
    exit 3
  fi
  while IFS= read -r -d '' P; do SQUASH_PATHS+=("$P"); done < "$SQUASH_LIST"
fi
cat "$BOOK_LIST" "$SQUASH_LIST" > "$COMMIT_LIST"

if [ "$MODE" != "stage" ] && [ ! -s "$COMMIT_LIST" ]; then
  # `git commit --pathspec-from-file=<empty file>` does NOT commit nothing —
  # it commits whatever is already staged in the index (verified trap).
  # Refuse to reach commit rather than risk a silent full-index commit.
  log "empty pathspec list — refusing to commit (nothing under scope=$SCOPE matched in $ROOT)"
  exit 6
fi

if ! git -C "$ROOT" add --pathspec-from-file="$BOOK_LIST" --pathspec-file-nul; then
  log "'git add' failed"
  exit 4
fi

case "$MODE" in
  stage)
    log "staged (scope=$SCOPE)"
    exit 0
    ;;
  commit)
    if git -C "$ROOT" diff --cached --quiet -- "${PATHSPECS[@]}" ${SQUASH_PATHS[@]+"${SQUASH_PATHS[@]}"}; then
      log "nothing to commit"
      exit 0
    fi
    if ! git -C "$ROOT" commit --pathspec-from-file="$COMMIT_LIST" --pathspec-file-nul -m "$MESSAGE"; then
      log "'git commit' failed"
      exit 5
    fi
    ;;
  commit-allow-empty)
    if ! git -C "$ROOT" commit --allow-empty --pathspec-from-file="$COMMIT_LIST" --pathspec-file-nul -m "$MESSAGE"; then
      log "'git commit --allow-empty' failed"
      exit 5
    fi
    ;;
esac

exit 0
