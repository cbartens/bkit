#!/bin/sh
# Claim C3: main checkout on dev, HEAD = DEV_AT. `git merge --ff-only NEW` refuses when an
# uncommitted edit (or an untracked file) sits on a path NEW changes, names the path, and
# leaves dev and the edit untouched; with an uncommitted edit on an unrelated path it
# advances and keeps the edit.
set -u
T=$(mktemp -d "${TMPDIR:-/tmp}/c3.XXXXXX")
fresh() { # $1 = repo dir; builds DEV_AT and a landing commit NEW from a scratch worktree
  git init -q -b dev "$1" && cd "$1"
  git config user.email p@x && git config user.name p
  printf 'a\n' > landed.txt && printf 'u\n' > unrelated.txt && git add . && git commit -qm base
  DEV_AT=$(git rev-parse HEAD)
  git worktree add -q --detach "$1-land" "$DEV_AT"
  (cd "$1-land" && printf 'a\nfrom-landing\n' > landed.txt && printf 'n\n' > added.txt && git add . && git -c user.email=p@x -c user.name=p commit -qm landing)
  NEW=$(git -C "$1-land" rev-parse HEAD)
}
echo "case A: uncommitted edit on a path the landing changes"
fresh "$T/a"
printf 'a\nowner-edit\n' > landed.txt
git merge --ff-only "$NEW" 2>&1; echo "merge --ff-only exit=$?"
echo "dev = DEV_AT: $([ "$(git rev-parse dev)" = "$DEV_AT" ] && echo yes || echo no)"
echo "landed.txt:"; cat landed.txt
echo "case B: uncommitted edit on an unrelated path"
fresh "$T/b"
printf 'u\nowner-edit\n' > unrelated.txt
git merge --ff-only "$NEW" 2>&1; echo "merge --ff-only exit=$?"
echo "dev = NEW: $([ "$(git rev-parse dev)" = "$NEW" ] && echo yes || echo no)"
echo "unrelated.txt:"; cat unrelated.txt
echo "status:"; git status --short
echo "case C: untracked file in the main checkout at a path the landing adds"
fresh "$T/c"
printf 'owner-untracked\n' > added.txt
git merge --ff-only "$NEW" 2>&1; echo "merge --ff-only exit=$?"
echo "dev = DEV_AT: $([ "$(git rev-parse dev)" = "$DEV_AT" ] && echo yes || echo no)"
echo "added.txt:"; cat added.txt
echo "case D: staged (index-only) edit on a path the landing changes"
fresh "$T/d"
printf 'a\nstaged-edit\n' > landed.txt && git add landed.txt
git merge --ff-only "$NEW" 2>&1; echo "merge --ff-only exit=$?"
echo "dev = DEV_AT: $([ "$(git rev-parse dev)" = "$DEV_AT" ] && echo yes || echo no)"
echo "index landed.txt:"; git show :landed.txt
rm -rf "$T"
