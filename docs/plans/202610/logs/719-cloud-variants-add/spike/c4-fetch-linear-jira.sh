#!/usr/bin/env bash
# C4: under tracker linear / jira, `bkit issues fetch --issue KEY --json` with the tracker key unset exits 80
# with a machine-readable `reason` the gate can map to "names the missing secret" (design: reason=auth +
# empty secret env). Real dist/cli.js; real endpoints (no stub).
set -u
REPO=/Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
SPIKE="$REPO/docs/plans/202610/logs/719-cloud-variants-add/spike"
W="$SPIKE/work-c4"; rm -rf "$W"; mkdir -p "$W"
unset BKIT_LINEAR_API_KEY BKIT_JIRA_API_KEY LINEAR_API_KEY
fx() { # tracker
  local d="$W/$1"; mkdir -p "$d"; git -C "$d" init -q -b dev
  git -C "$d" remote add origin https://github.com/example/fixture.git
  printf '{"name":"fx","bkit":{"tracker":{"default":"%s","jira":{"site":"example.atlassian.net","project":"AB2"},"linear":{"team":"ENG"}}}}\n' "$1" >"$d/package.json"
}
fx linear; fx jira
echo "== linear, BKIT_LINEAR_API_KEY unset, --issue ENG-42"
(cd "$W/linear" && node "$REPO/dist/cli.js" issues fetch --issue ENG-42 --outbox "$W/out-l" --json); echo "exit=$?"
echo "== jira, BKIT_JIRA_API_KEY unset, --issue AB2-12"
(cd "$W/jira" && node "$REPO/dist/cli.js" issues fetch --issue AB2-12 --outbox "$W/out-j" --json); echo "exit=$?"
echo "== jira, BKIT_JIRA_API_KEY=invalid, --issue AB2-12"
(cd "$W/jira" && BKIT_JIRA_API_KEY=invalid-probe-key node "$REPO/dist/cli.js" issues fetch --issue AB2-12 --outbox "$W/out-j2" --json); echo "exit=$?"
echo "== linear, BKIT_LINEAR_API_KEY=invalid, --issue ENG-42"
(cd "$W/linear" && BKIT_LINEAR_API_KEY=lin_api_invalidprobe node "$REPO/dist/cli.js" issues fetch --issue ENG-42 --outbox "$W/out-l2" --json); echo "exit=$?"
rm -rf "$W"
