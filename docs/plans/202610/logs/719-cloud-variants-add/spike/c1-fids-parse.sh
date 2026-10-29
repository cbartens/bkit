#!/usr/bin/env bash
# C1: `bkit fids parse --marker --branch --json` recovers FID + issueId from each tracker's PR-body marker,
# incl. a Jira key with digits (AB2-12). Real dist/cli.js, fixture repo per tracker.
set -u
REPO=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
SPIKE="$REPO/docs/plans/202610/logs/719-cloud-variants-add/spike"
FIX="$SPIKE/fixtures-c1"
rm -rf "$FIX"
run() { # tracker marker branch
  local d="$FIX/$1"
  mkdir -p "$d"
  if [ ! -d "$d/.git" ]; then
    git -C "$d" init -q -b dev
    git -C "$d" remote add origin https://github.com/example/fixture.git
    printf '{"name":"fx","bkit":{"tracker":{"default":"%s","jira":{"site":"example.atlassian.net","project":"AB2"},"linear":{"team":"ENG"}}}}\n' "$1" >"$d/package.json"
  fi
  echo "== tracker=$1 marker='$2' branch='$3'"
  (cd "$d" && node "$REPO/dist/cli.js" fids parse --marker "$2" --branch "$3" --json; echo "exit=$?")
}
run github '<!-- bkit:issue=#719 bkit:fid=719-cloud-variants-add -->' 'feat/719-cloud-variants-add'
run linear '<!-- bkit:issue=ENG-42 bkit:fid=eng-42-some-slug -->' 'feat/eng-42-some-slug'
run jira '<!-- bkit:issue=AB2-12 bkit:fid=ab2-12-some-slug -->' 'feat/ab2-12-some-slug'
run jira '<!-- bkit:issue=PROJ-7 bkit:fid=proj-7-x -->' 'feat/proj-7-x'
echo "== branch-only fallback (no marker, no .bkit/issues.jsonl feature row)"
run jira '' 'feat/ab2-12-some-slug'
run github '' 'feat/719-cloud-variants-add'
rm -rf "$FIX"
