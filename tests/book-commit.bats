#!/usr/bin/env bats
# tests/book-commit.bats — Unit tests for bkit-book-commit.sh (#446).
#
# The workflow bash blocks that stage/commit bookkeeping ledgers used to
# build the pathspec with unquoted shell word-splitting and an `ls` glob that
# ABORTS on zsh when a glob matches nothing — silently dropping ledgers, and
# swallowing a failed `git add` into a false "nothing to commit" success.
# bkit-book-commit.sh replaces that with a `git ls-files`-built pathspec and
# `--pathspec-from-file`, invoked with an explicit `bash` prefix so host
# shell never matters. These tests exercise the script directly (not through
# a workflow bash block) and are run under BOTH zsh and bash to prove the
# fix is shell-independent — the script's own shebang is bash regardless.
#
# NOTE: assertions capture `git show`/`git diff` output into a variable
# before matching (never `| grep -q` on it directly) — bats runs test bodies
# under `pipefail`, and `grep -q` closing its input early on a first match
# turns the upstream git process's SIGPIPE death into a spurious pipeline
# failure even though the match was found.
#
# Run: bats tests/book-commit.bats
# Portability check (both must pass):
#   zsh  -c 'bats tests/book-commit.bats'
#   bash -c 'bats tests/book-commit.bats'
# Requires: bats >= 1.0, git >= 2.25

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# Template-relative by default — `bkit install` (which produces the
# installed .bkit/scripts/ mirror) runs once at session end, not per-edit.
BOOK_SCRIPT="${BKIT_BOOK_SCRIPT:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-book-commit.sh}"

setup() {
  unset GIT_DIR GIT_WORK_TREE
  TEST_TMP="$(mktemp -d)"
  TEST_REPO="$TEST_TMP/repo"
  mkdir -p "$TEST_REPO"
  git init -q "$TEST_REPO"
  git -C "$TEST_REPO" config user.email t@t.t
  git -C "$TEST_REPO" config user.name t
}

teardown() {
  if [ -n "${TEST_TMP:-}" ]; then rm -rf "$TEST_TMP"; fi
}

_head() { git -C "$TEST_REPO" rev-parse HEAD; }
_stat() { git -C "$TEST_REPO" show --stat --summary HEAD; }
_staged() { git -C "$TEST_REPO" diff --cached --name-only; }

# ---------------------------------------------------------------------------
# Modified ledger is staged and committed
# ---------------------------------------------------------------------------

@test "modified ledger under the FID logdir is staged and committed" {
  mkdir -p "$TEST_REPO/docs/plans/202608/logs/446-book"
  echo '{"a":1}' > "$TEST_REPO/docs/plans/202608/logs/446-book/status.jsonl"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  echo '{"a":2}' >> "$TEST_REPO/docs/plans/202608/logs/446-book/status.jsonl"

  before="$(_head)"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=446-book --scope=core --mode=commit --message="test commit"
  [ "$status" -eq 0 ]
  [ "$(_head)" != "$before" ]
  stat="$(_stat)"
  [[ "$stat" == *"status.jsonl"* ]]
}

# ---------------------------------------------------------------------------
# Tracked-but-deleted skill mirror staged as a deletion (fd6180c0 regression)
# ---------------------------------------------------------------------------

@test "tracked-but-deleted skill mirror is staged as a deletion (scope=full)" {
  mkdir -p "$TEST_REPO/.claude/skills" "$TEST_REPO/docs/plans/202608/logs/446d"
  echo x > "$TEST_REPO/.claude/skills/foo.md"
  echo '{}' > "$TEST_REPO/docs/plans/202608/logs/446d/status.jsonl"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  rm "$TEST_REPO/.claude/skills/foo.md"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=446d --scope=full --mode=commit --message="deletion test"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" == *"delete mode"* ]]
  [[ "$stat" == *"foo.md"* ]]
}

# ---------------------------------------------------------------------------
# Brand-new untracked ledger is staged
# ---------------------------------------------------------------------------

@test "brand-new untracked ledger is staged and committed" {
  echo x > "$TEST_REPO/README.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  mkdir -p "$TEST_REPO/.bkit"
  echo '{"x":1}' > "$TEST_REPO/.bkit/newledger.jsonl"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=nomatch --scope=full --mode=commit --message="new ledger test"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" == *"newledger.jsonl"* ]]
}

# ---------------------------------------------------------------------------
# Fresh repo: docs/plans/*/logs/*/*.jsonl matches nothing, .bkit/*.jsonl still swept
# ---------------------------------------------------------------------------

@test "unmatched plan-logs glob does not abort the sweep of other ledgers" {
  echo x > "$TEST_REPO/README.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  # No docs/plans/ tree exists at all in this repo.
  mkdir -p "$TEST_REPO/.bkit"
  echo '{"only":1}' > "$TEST_REPO/.bkit/onlyledger.jsonl"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=nomatch --scope=full --mode=commit --message="sweep despite unmatched glob"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" == *"onlyledger.jsonl"* ]]
}

# ---------------------------------------------------------------------------
# Path containing a space survives
# ---------------------------------------------------------------------------

@test "path containing a space is staged and committed" {
  mkdir -p "$TEST_REPO/docs/plans/202608/logs/446 space"
  echo x > "$TEST_REPO/README.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  echo '{"a":1}' > "$TEST_REPO/docs/plans/202608/logs/446 space/status.jsonl"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid="446 space" --scope=core --mode=commit --message="space test"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" == *"446 space/status.jsonl"* ]]
}

# ---------------------------------------------------------------------------
# Nothing changed: exit 0, prints "nothing to commit", creates no commit
# ---------------------------------------------------------------------------

@test "nothing changed: exit 0, 'nothing to commit', no new commit" {
  mkdir -p "$TEST_REPO/docs/plans/202608/logs/446n"
  echo '{"a":1}' > "$TEST_REPO/docs/plans/202608/logs/446n/status.jsonl"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )

  before="$(_head)"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=446n --scope=core --mode=commit --message="should not create"
  [ "$status" -eq 0 ]
  [[ "$output" == *"nothing to commit"* ]]
  [ "$(_head)" = "$before" ]
}

# ---------------------------------------------------------------------------
# Staging failure: non-zero exit, no commit created, no false success
# ---------------------------------------------------------------------------

@test "staging failure: non-zero exit and no commit is created" {
  mkdir -p "$TEST_REPO/docs/plans/202608/logs/446f"
  echo '{}' > "$TEST_REPO/docs/plans/202608/logs/446f/status.jsonl"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  echo '{"more":1}' >> "$TEST_REPO/docs/plans/202608/logs/446f/status.jsonl"

  before="$(_head)"
  # A pre-existing index.lock makes `git add` refuse for every uid, including
  # root — which bypasses chmod-based permission blocks on `.git`.
  : >"$TEST_REPO/.git/index.lock"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=446f --scope=core --mode=commit --message="should fail"
  rm -f "$TEST_REPO/.git/index.lock"

  [ "$status" -ne 0 ]
  [[ "$output" != *"nothing to commit"* ]]
  [ "$(_head)" = "$before" ]
}

# ---------------------------------------------------------------------------
# Empty pathspec list: exit 6, no commit created
# ---------------------------------------------------------------------------

@test "empty pathspec list: exit 6 and no commit is created (closes the empty-file-commits-everything trap)" {
  echo x > "$TEST_REPO/README.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  # Something unrelated staged — this is exactly the trap: an empty
  # --pathspec-from-file does NOT commit nothing, it commits whatever is
  # already staged. The script must refuse before reaching `git commit`.
  echo staged > "$TEST_REPO/unrelated.txt"
  git -C "$TEST_REPO" add unrelated.txt

  before="$(_head)"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=nope --scope=core --mode=commit --message="empty test"
  [ "$status" -eq 6 ]
  [ "$(_head)" = "$before" ]
  # The unrelated staged file must not have been swept into a commit.
  staged="$(_staged)"
  [[ "$staged" == *"unrelated.txt"* ]]
}

@test "empty pathspec list under commit-allow-empty also exits 6, no commit created" {
  echo x > "$TEST_REPO/README.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  before="$(_head)"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=nope --scope=full --mode=commit-allow-empty --message="ce test"
  [ "$status" -eq 6 ]
  [ "$(_head)" = "$before" ]
}

# ---------------------------------------------------------------------------
# --mode=stage only stages, never commits
# ---------------------------------------------------------------------------

@test "--mode=stage stages the sweep but creates no commit" {
  mkdir -p "$TEST_REPO/docs/plans/202608/logs/446s"
  echo '{}' > "$TEST_REPO/docs/plans/202608/logs/446s/status.jsonl"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  echo '{"m":1}' >> "$TEST_REPO/docs/plans/202608/logs/446s/status.jsonl"

  before="$(_head)"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202608 --fid=446s --scope=core --mode=stage
  [ "$status" -eq 0 ]
  [ "$(_head)" = "$before" ]
  staged="$(_staged)"
  [[ "$staged" == *"status.jsonl"* ]]
}

# ---------------------------------------------------------------------------
# union-ledgers: append-only merge, no duplicate rows, unmatched glob safe
# ---------------------------------------------------------------------------

@test "union-ledgers merges rows append-only without duplicating existing ones" {
  SRC="$TEST_TMP/src"
  DST="$TEST_TMP/dst"
  mkdir -p "$SRC/docs/plans/202608/logs/446u" "$DST/docs/plans/202608/logs/446u"
  git init -q "$SRC"
  git -C "$SRC" config user.email t@t.t
  git -C "$SRC" config user.name t
  printf '{"row":1}\n{"row":2}\n' > "$SRC/docs/plans/202608/logs/446u/status.jsonl"
  ( cd "$SRC" && git add -A && git commit -q -m srcinit )
  printf '{"row":1}\n' > "$DST/docs/plans/202608/logs/446u/status.jsonl"

  run bash "$BOOK_SCRIPT" union-ledgers --src="$SRC" --dst="$DST"
  [ "$status" -eq 0 ]
  [ "$(cat "$DST/docs/plans/202608/logs/446u/status.jsonl")" = "$(printf '{"row":1}\n{"row":2}')" ]
}

@test "union-ledgers: unmatched glob in src does not abort, exits 0 with nothing unioned" {
  SRC="$TEST_TMP/src2"
  DST="$TEST_TMP/dst2"
  mkdir -p "$SRC" "$DST"
  git init -q "$SRC"
  git -C "$SRC" config user.email t@t.t
  git -C "$SRC" config user.name t
  echo x > "$SRC/README.md"
  ( cd "$SRC" && git add -A && git commit -q -m srcinit )

  run bash "$BOOK_SCRIPT" union-ledgers --src="$SRC" --dst="$DST"
  [ "$status" -eq 0 ]
}

# ---------------------------------------------------------------------------
# Top-level project docs: staged under scope=full only, never docs/** below
# ---------------------------------------------------------------------------

@test "top-level docs/*.md is committed under scope=pr, not under scope=core or scope=full" {
  mkdir -p "$TEST_REPO/docs/plans/202610/logs/452d"
  echo '{}' > "$TEST_REPO/docs/plans/202610/logs/452d/status.jsonl"
  echo a > "$TEST_REPO/docs/architecture.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  echo b >> "$TEST_REPO/docs/architecture.md"
  echo '{"a":1}' >> "$TEST_REPO/docs/plans/202610/logs/452d/status.jsonl"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=452d --scope=core --mode=commit --message="core"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" != *"architecture.md"* ]]

  echo '{"a":2}' >> "$TEST_REPO/docs/plans/202610/logs/452d/status.jsonl"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=452d --scope=full --mode=commit --message="full"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" != *"architecture.md"* ]]

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=452d --scope=pr --mode=commit --message="pr"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" == *"docs/architecture.md"* ]]
}

@test "scope=pr does not reach nested docs (docs/plans/** of another FID, docs/templates/**)" {
  mkdir -p "$TEST_REPO/docs/plans/202610/logs/452n" "$TEST_REPO/docs/plans/202609" "$TEST_REPO/docs/templates"
  echo '{}' > "$TEST_REPO/docs/plans/202610/logs/452n/status.jsonl"
  echo a > "$TEST_REPO/docs/plans/202609/other-plan.md"
  echo a > "$TEST_REPO/docs/templates/bkit-plan.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
  echo b >> "$TEST_REPO/docs/plans/202609/other-plan.md"
  echo b >> "$TEST_REPO/docs/templates/bkit-plan.md"
  echo '{"a":1}' >> "$TEST_REPO/docs/plans/202610/logs/452n/status.jsonl"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=452n --scope=pr --mode=commit --message="pr"
  [ "$status" -eq 0 ]
  stat="$(_stat)"
  [[ "$stat" != *"other-plan.md"* ]]
  [[ "$stat" != *"bkit-plan.md"* ]]
}

# ---------------------------------------------------------------------------
# only-bookkeeping: the ship merge gate's carry-forward check
# ---------------------------------------------------------------------------

_book_base() {
  mkdir -p "$TEST_REPO/src" "$TEST_REPO/docs/plans/202610/logs/452b"
  echo a > "$TEST_REPO/src/a.ts"
  echo a > "$TEST_REPO/docs/architecture.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m init )
}

@test "only-bookkeeping: docs, FID logs, ledgers and skill removals only → exit 0" {
  mkdir -p "$TEST_REPO/.agents/skills/foo"
  echo x > "$TEST_REPO/.agents/skills/foo/SKILL.md"
  _book_base
  from="$(_head)"
  echo b >> "$TEST_REPO/docs/architecture.md"
  echo s > "$TEST_REPO/docs/plans/202610/logs/452b/ship-summary.md"
  echo '{"k":1}' > "$TEST_REPO/docs/deferrals.jsonl"
  rm -r "$TEST_REPO/.agents/skills/foo"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m book )

  run bash "$BOOK_SCRIPT" only-bookkeeping --root="$TEST_REPO" --month=202610 --fid=452b --from="$from" --to="$(_head)"
  [ "$status" -eq 0 ]
}

@test "only-bookkeeping: a source file in the range → exit 7, path listed" {
  _book_base
  from="$(_head)"
  echo b >> "$TEST_REPO/docs/architecture.md"
  echo b >> "$TEST_REPO/src/a.ts"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m mixed )

  run bash "$BOOK_SCRIPT" only-bookkeeping --root="$TEST_REPO" --month=202610 --fid=452b --from="$from" --to="$(_head)"
  [ "$status" -eq 7 ]
  [[ "$output" == *"src/a.ts"* ]]
  [[ "$output" != *"  docs/architecture.md"* ]]
}

@test "only-bookkeeping: another FID's plan file in the range → exit 7" {
  _book_base
  from="$(_head)"
  mkdir -p "$TEST_REPO/docs/plans/202610"
  echo p > "$TEST_REPO/docs/plans/202610/9-other-plan.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m plan )

  run bash "$BOOK_SCRIPT" only-bookkeeping --root="$TEST_REPO" --month=202610 --fid=452b --from="$from" --to="$(_head)"
  [ "$status" -eq 7 ]
}

@test "only-bookkeeping: <from> not an ancestor of <to> → exit 7" {
  _book_base
  first="$(_head)"
  echo b >> "$TEST_REPO/docs/architecture.md"
  ( cd "$TEST_REPO" && git add -A && git commit -q -m book )

  run bash "$BOOK_SCRIPT" only-bookkeeping --root="$TEST_REPO" --month=202610 --fid=452b --from="$(_head)" --to="$first"
  [ "$status" -eq 7 ]
  [[ "$output" == *"not an ancestor"* ]]
}

@test "only-bookkeeping: unknown commit → exit 3; missing flag → exit 2" {
  _book_base
  run bash "$BOOK_SCRIPT" only-bookkeeping --root="$TEST_REPO" --month=202610 --fid=452b --from=deadbeef --to="$(_head)"
  [ "$status" -eq 3 ]
  run bash "$BOOK_SCRIPT" only-bookkeeping --root="$TEST_REPO" --month=202610 --fid=452b --from="$(_head)"
  [ "$status" -eq 2 ]
}

@test "union-ledgers never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev)" {
  SRC="$TEST_TMP/src3"
  DST="$TEST_TMP/dst3"
  mkdir -p "$SRC/.bkit" "$DST/.bkit"
  git init -q "$SRC"
  git -C "$SRC" config user.email t@t.t
  git -C "$SRC" config user.name t
  printf '{"kind":"feature","key":"452x","status":"SHIPPED"}\n' > "$SRC/.bkit/issues.jsonl"
  printf '{"row":1}\n' > "$SRC/.bkit/friction.jsonl"
  ( cd "$SRC" && git add -A && git commit -q -m srcinit )
  printf '{"kind":"feature","key":"452x","status":"BUILT"}\n' > "$DST/.bkit/issues.jsonl"

  run bash "$BOOK_SCRIPT" union-ledgers --src="$SRC" --dst="$DST"
  [ "$status" -eq 0 ]
  [ "$(cat "$DST/.bkit/issues.jsonl")" = '{"kind":"feature","key":"452x","status":"BUILT"}' ]
  [ "$(cat "$DST/.bkit/friction.jsonl")" = '{"row":1}' ]
}

# ---------------------------------------------------------------------------
# --squash-of: the close commit carries the squash and bookkeeping, nothing
# else already staged (#493)
# ---------------------------------------------------------------------------

_squash_base() {
  mkdir -p "$TEST_REPO/docs/plans/202610/logs/493s"
  echo '{}' > "$TEST_REPO/docs/plans/202610/logs/493s/status.jsonl"
  echo old > "$TEST_REPO/docs/plans/202610/gone.md"
  ( cd "$TEST_REPO" && git checkout -q -b dev && git add -A && git commit -q -m init )
  ( cd "$TEST_REPO" && git checkout -q -b feat/493s \
      && echo plan > docs/plans/202610/493s-plan.md && git rm -q docs/plans/202610/gone.md \
      && git add -A && git commit -q -m feat && git checkout -q dev )
}

@test "--squash-of commits the squashed paths (deletion included) and bookkeeping, not another staged file" {
  _squash_base
  echo other > "$TEST_REPO/docs/plans/202610/OTHER-plan.md"
  git -C "$TEST_REPO" add docs/plans/202610/OTHER-plan.md
  git -C "$TEST_REPO" merge -q --squash feat/493s
  echo '{"close":1}' >> "$TEST_REPO/docs/plans/202610/logs/493s/status.jsonl"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=493s --scope=core --mode=commit-allow-empty --squash-of=feat/493s --message="close"
  [ "$status" -eq 0 ]
  landed="$(git -C "$TEST_REPO" show --name-status --format= HEAD)"
  [[ "$landed" == *"A	docs/plans/202610/493s-plan.md"* ]]
  [[ "$landed" == *"D	docs/plans/202610/gone.md"* ]]
  [[ "$landed" == *"status.jsonl"* ]]
  [[ "$landed" != *"OTHER-plan.md"* ]]
  [ "$(_staged)" = "docs/plans/202610/OTHER-plan.md" ]
}

@test "--squash-of under --mode=commit counts the squashed paths as something to commit" {
  _squash_base
  git -C "$TEST_REPO" merge -q --squash feat/493s
  before="$(_head)"

  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=493s --scope=core --mode=commit --squash-of=feat/493s --message="close"
  [ "$status" -eq 0 ]
  [ "$(_head)" != "$before" ]
  landed="$(git -C "$TEST_REPO" show --name-only --format= HEAD)"
  [[ "$landed" == *"493s-plan.md"* ]]
}

@test "--squash-of: stage mode → exit 2; unknown ref → exit 3, no commit" {
  _squash_base
  before="$(_head)"
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=493s --scope=core --mode=stage --squash-of=feat/493s
  [ "$status" -eq 2 ]
  run bash "$BOOK_SCRIPT" --root="$TEST_REPO" --month=202610 --fid=493s --scope=core --mode=commit-allow-empty --squash-of=feat/nope --message="close"
  [ "$status" -eq 3 ]
  [ "$(_head)" = "$before" ]
}
