#!/bin/sh
# Claim 1 probe: a zero-byte stub on dev, merged with a pre-upgrade branch that appended
# rows to the same ledger, under merge=union. Real git, real ledger rows.
# Usage: sh c1-stub-union.sh <repo-root> <scratch-dir>
set -u
ROOT="$1"
WORK="$2"
rm -rf "$WORK"
mkdir -p "$WORK"
SRC="$ROOT/docs/knowledge.jsonl"

setup() {
  dir="$1"
  git init -q -b dev "$dir"
  cd "$dir" || exit 1
  git config user.email probe@example.invalid
  git config user.name probe
  git config commit.gpgsign false
  mkdir docs
  printf 'docs/knowledge.jsonl merge=union\ndocs/brain.jsonl merge=union\n' > .gitattributes
  head -n 5 "$SRC" > docs/knowledge.jsonl
  git add -A && git commit -q -m base
  # pre-upgrade feature branch: appends two old-shape rows to the old ledger
  git checkout -q -b feat
  sed -n '6,7p' "$SRC" >> docs/knowledge.jsonl
  git add -A && git commit -q -m "feat: append two rows"
  # dev: the upgrade writes the brain and truncates the old ledger to zero bytes
  git checkout -q dev
  head -n 5 "$SRC" > docs/brain.jsonl
  : > docs/knowledge.jsonl
  git add -A && git commit -q -m "upgrade: merge into brain, stub old ledger"
}

report() {
  label="$1"
  echo "== $label"
  echo "exit=$2"
  echo "stub bytes: $(wc -c < docs/knowledge.jsonl | tr -d ' ')"
  echo "stub lines: $(wc -l < docs/knowledge.jsonl | tr -d ' ')"
  echo "conflict markers: $(grep -c -E '^(<<<<<<<|=======|>>>>>>>)' docs/knowledge.jsonl)"
  echo "stub line keys (in order):"
  sed -n 's/.*"key":"\([^"]*\)".*/  \1/p' docs/knowledge.jsonl
  echo "expected appended keys:"
  sed -n '6,7s/.*"key":"\([^"]*\)".*/  \1/p' "$SRC"
  echo "base keys:"
  sed -n '1,5s/.*"key":"\([^"]*\)".*/  \1/p' "$SRC"
  echo "git status --porcelain:"
  git status --porcelain | sed 's/^/  /'
}

echo "git: $(git --version)"

# A: plain merge on dev (ours = stub, theirs = branch)
setup "$WORK/a"
git merge --no-edit -q feat >/dev/null 2>"$WORK/a.err"; rc=$?
report "A: git merge feat (on dev)" "$rc"
cat "$WORK/a.err"

# B: close squash shape: on dev, git merge --squash -X ours feat
setup "$WORK/b"
git merge --squash -X ours feat >/dev/null 2>"$WORK/b.err"; rc=$?
report "B: git merge --squash -X ours feat (on dev)" "$rc"
cat "$WORK/b.err"

# C: reverse: on feat, merge dev in (ours = appended, theirs = stub)
setup "$WORK/c"
git checkout -q feat
git merge --no-edit -q dev >/dev/null 2>"$WORK/c.err"; rc=$?
report "C: git merge dev (on feat)" "$rc"
cat "$WORK/c.err"

# D: control without merge=union, plain merge on dev
setup "$WORK/d"
git checkout -q dev
printf 'docs/brain.jsonl merge=union\n' > .gitattributes
git add -A && git commit -q -m "drop union on knowledge.jsonl (control)"
git merge --no-edit -q feat >/dev/null 2>"$WORK/d.err"; rc=$?
report "D (control, no merge=union on stub): git merge feat (on dev)" "$rc"
cat "$WORK/d.err"
