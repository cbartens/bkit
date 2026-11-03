#!/usr/bin/env bash
# C3: `bkit issues fetch --json` (real dist/cli.js, real GitHub API, cbartens/bkit) gives the router gate
# every outcome it maps: labels array on success with only GH_TOKEN set (BKIT_GH_TOKEN unset, no gh keyring),
# exit 80 + reason on auth failure / unknown issue, `skipped` for an issue-less FID and tracker none.
# Run via: direnv exec <repo> bash c3-fetch-github.sh   (token value never printed)
set -u
REPO=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
SPIKE="$REPO/docs/plans/202610/logs/719-cloud-variants-add/spike"
TOKEN="${BKIT_GH_TOKEN:-}"
[ -n "$TOKEN" ] || { echo "BKIT_GH_TOKEN unset"; exit 2; }
unset BKIT_GH_TOKEN GH_TOKEN GITHUB_TOKEN
W="$SPIKE/work-c3"; rm -rf "$W"; mkdir -p "$W/ghcfg" "$W/out" "$W/none"
export GH_CONFIG_DIR="$W/ghcfg"   # empty: no keyring / hosts.yml fallback
echo "gh $(gh --version | head -1)"
step() { echo "== $1"; shift; ( "$@" ); echo "exit=$?"; }
step "a) GH_TOKEN only, --issue 719" env GH_TOKEN="$TOKEN" sh -c "cd '$REPO' && node dist/cli.js issues fetch --issue 719 --outbox '$W/out/a' --json"
step "b) no token at all, --issue 719" sh -c "cd '$REPO' && node dist/cli.js issues fetch --issue 719 --outbox '$W/out/b' --json"
step "c) GH_TOKEN only, unknown issue 99999999" env GH_TOKEN="$TOKEN" sh -c "cd '$REPO' && node dist/cli.js issues fetch --issue 99999999 --outbox '$W/out/c' --json"
step "d) GH_TOKEN only, issue-less FID --fid probe-slug" env GH_TOKEN="$TOKEN" sh -c "cd '$REPO' && node dist/cli.js issues fetch --fid probe-slug --outbox '$W/out/d' --json"
git -C "$W/none" init -q -b dev
printf '{"name":"fx","bkit":{"tracker":{"default":"none"}}}\n' >"$W/none/package.json"
step "e) tracker none fixture, --fid 719-cloud-variants-add" env GH_TOKEN="$TOKEN" sh -c "cd '$W/none' && node '$REPO/dist/cli.js' issues fetch --fid 719-cloud-variants-add --outbox '$W/out/e' --json"
echo "== labels type in (a) facts file"
python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print(type(d['labels']).__name__, d['labels'], d['state'])" "$W/out/a/issue-facts.json" 2>&1
rm -rf "$W"
