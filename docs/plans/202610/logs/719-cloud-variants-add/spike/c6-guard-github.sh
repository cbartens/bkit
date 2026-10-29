#!/usr/bin/env bash
# C6: session-guard GitHub branch with no bkit runtime: owner/repo from `git remote get-url origin`, issue
# number from the leading digits of feat/{FID}, `curl` GitHub REST with BKIT_GH_TOKEN, python3 parse →
# labels + state; a bad token is detectable as a failure (fail closed), never as "label absent".
# Run via: direnv exec <repo> bash c6-guard-github.sh   (token value never printed)
set -u
REPO=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
cd "$REPO"
origin=$(git remote get-url origin)
slug=$(printf '%s' "$origin" | sed -E 's#^(git@github\.com:|https://github\.com/)##; s#\.git$##')
branch=$(git branch --show-current)
n=$(printf '%s' "${branch#feat/}" | grep -oE '^[0-9]+' || true)
echo "origin=$origin slug=$slug branch=$branch issue=$n"
read_issue() { # token
  curl -fsS --max-time 15 -H "Authorization: Bearer $1" -H 'Accept: application/vnd.github+json' \
    "https://api.github.com/repos/$slug/issues/$n"
}
echo "== good token"
body=$(read_issue "${BKIT_GH_TOKEN:-}"); rc=$?
echo "curl exit=$rc"
printf '%s' "$body" | python3 -c '
import json,sys
d=json.load(sys.stdin)
labels=[l["name"] for l in d.get("labels",[])]
print("labels=",labels,"state=",d.get("state"),"has_bkit_auto=", "bkit:auto" in labels, "terminal=", d.get("state")=="closed")'
echo "py exit=$?"
echo "== bad token"
body=$(read_issue "invalid-probe-token" 2>&1); rc=$?
echo "curl exit=$rc out=$body"
