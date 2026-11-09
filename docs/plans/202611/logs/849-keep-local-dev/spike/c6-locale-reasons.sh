#!/bin/sh
# C6: the `blocked` reasons (`occupied`, `edited-files`) can be told apart by matching
# git's stderr text, whatever the user's locale. Also captures the git-state alternative.
set -u
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=p GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=p GIT_COMMITTER_EMAIL=p@x
W="$(cd "$(dirname "$0")" && pwd)/_work/c6"
rm -rf "$W"; mkdir -p "$W"; cd "$W" || exit 1
q() { "$@" >/dev/null 2>&1; }
match() { # $1 stderr text: which English pattern matches
  case "$1" in
    *"checked out at"*) echo "classified: occupied" ;;
    *"would be overwritten"*) echo "classified: edited-files" ;;
    *) echo "classified: git-refused (no English pattern matched)" ;;
  esac
}
probe() { # $1 locale
  echo "=== LC_ALL=$1 ==="
  e=$(LC_ALL=$1 LANG=$1 git fetch -q . "$T:refs/heads/dev" 2>&1); echo "occupied case [exit $?]: $e"; match "$e"
  q git worktree remove ../wt
  q git switch -q dev; printf 'edit\n' > a.txt
  e=$(LC_ALL=$1 LANG=$1 git merge --ff-only -q "$T" 2>&1); echo "edited case [exit $?]: $e"; match "$e"
  q git checkout -- a.txt; q git switch -q feat; q git worktree add -q ../wt dev
}

q git init -q -b dev repo; cd repo || exit 1
printf 'a\n' > a.txt; q git add .; q git commit -qm base
q git switch -q -c up; printf 'a2\n' > a.txt; q git commit -qam up; T=$(git rev-parse HEAD)
q git switch -q -c feat dev; q git worktree add -q ../wt dev
probe de_DE.UTF-8
probe C

echo "=== git-state alternative, LC_ALL=de_DE.UTF-8 ==="
export LC_ALL=de_DE.UTF-8 LANG=de_DE.UTF-8
echo "occupied: $(git worktree list --porcelain | grep -c '^branch refs/heads/dev$') worktree(s) have refs/heads/dev"
q git worktree remove ../wt; q git switch -q dev; printf 'edit\n' > a.txt
git diff --name-only HEAD > ../edited.lst; git diff --name-only HEAD "$T" > ../changed.lst
echo "edited paths: $(cat ../edited.lst); paths the update changes: $(cat ../changed.lst); overlap: $(grep -Fxf ../edited.lst ../changed.lst)"
