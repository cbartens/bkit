#!/usr/bin/env sh
# bkit-status-fold.sh — Single-sourced status.jsonl fold reducer (#58 T1.1).
#
# Single source of truth for the status.jsonl -> run-array fold. Every
# workflow orchestrator (bkit-build.md, bkit-debug.md, bkit-ship.md,
# bkit-plan.md, bkit-design.md) previously inlined this jq prelude 15x
# (byte-identical, measured length 1078 / md5 ed1c4a236d35499f39033206d5b75480
# for the extracted value — NOT the issue's inherited 1079 / d04a2499...,
# which was never verified against which of {value, whole assignment line}
# it measured; see T1.1's Done-when).
#
# Usage:
#   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
#   echo "$STATUS_JSONL" | jq -s "$BKIT_STATUS_FOLD fold" ...
#
# Dedup key (load-bearing): step-done rows dedup on
#   "S {workflow} {step} {parentSha} {at}"
# — it includes `at`, so two rows collapse ONLY when BOTH `parentSha` AND the
# wall-clock second `at` collide. Row counting therefore depends on
# `parentSha` advancing per attempt OR attempts landing in different
# wall-clock seconds. Do NOT read this as "no commit -> attempts collapse" —
# that stronger claim is false. The one corpus site where `parentSha` does
# NOT advance in-block is `debug-run-tests` (bkit-debug.md, "Update status:"
# with no commit) — deliberate, KN-26: removing its commit keeps `fix(...)`
# as branch HEAD so the Vercel-ignore regex does not skip the preview.
# `parentSha` still advances there, transitively, via the commits at Steps
# 4/5/6. See docs/knowledge.jsonl KN-26 and #58 Breaking Changes item 10c.
#
# PRIOR_STRATEGY reads this same fold with ALL-RUNS scoping (deliberately
# opposite to the active-run scoping attempt counters need) — see the
# comment at each PRIOR_STRATEGY call site.
#
# shellcheck disable=SC2016
BKIT_STATUS_FOLD='def lastIdx($w):([range(0;length) as $i|select(.[$i].workflow==$w)|$i]|last);def fold:(reduce .[] as $e ({seen:{},out:[]};(if $e.type=="step-done" then "S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)" else "W \($e.type) \($e.workflow) \($e.at)" end) as $k|if .seen[$k] then . else .seen[$k]=true|.out+=[$e] end)|.out|sort_by(.at)) as $ev|reduce $ev[] as $e ([];if $e.type=="workflow-started" then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[]}] elif $e.type=="step-done" then (lastIdx($e.workflow)) as $i|(if $i==null then .+[{workflow:$e.workflow,startedAt:$e.at,status:"IN_PROGRESS",steps:[($e|del(.type,.workflow))]}] else .[$i].steps+=[($e|del(.type,.workflow))] end) elif $e.type=="workflow-meta" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i]+=($e|del(.type,.workflow,.at)) end) elif $e.type=="workflow-done" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="DONE" end) elif $e.type=="workflow-failed" then (lastIdx($e.workflow)) as $i|(if $i==null then . else .[$i].status="FAILED" end) else . end);'
