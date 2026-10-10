<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Expo EAS Workflows — native e2e runs (Maestro)

Fits: React Native / Expo apps whose native e2e lane runs Maestro through EAS Workflows (`eas workflow:run`). `context=e2e`: for the latest failed workflow runs — job status and errors, step-log tails, the per-flow exception for every flow and retry (EAS GraphQL), JUnit, failure screenshot URLs, and from `artifacts.tar.gz` the failing Maestro commands, the view-hierarchy dump list, per-attempt JUnit, the XCUITest runner's own errors and the app's JS console. EAS Workflows drain nowhere else, so this is the only place a Maestro regression surfaces.

- Secret: `EXPO_TOKEN` (an EAS access token), in the app's env, not `.bkit/.env`.
- Non-secret: `EXPO_APP_DIR` (the EAS-linked app folder, default `apps/mobile`); `EAS_WF_N`, `EAS_WF_ERR_N`.
- CLI: `eas` (`eas-cli`); the provision block installs it in cloud. Copying `expo.md` too gives a second, identical self-guarded install — keep one.
- Pair with `maestro-ios.md` when a GitHub Actions job starts the run: that block reads the GitHub job log, this one reads EAS.
- Read in this order: per-flow exception (2b), then the XCUITest runner errors (2e) for any `DeviceUnreachableException` — Maestro's iOS driver is an XCUITest case hosting the HTTP server, so one failure inside it fails every later flow. Then the view-hierarchy dump (2d) for any selector or visibility failure: it is the tree Maestro actually searched, and it can contradict a screenshot.
- Artifact URLs are pre-signed and expire in ~1 h; EAS keeps the data 90 days. An expired URL means re-run `workflow:status`, not "artifact gone".

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start expo-workflows context=e2e -->

```bash
# EAS WORKFLOW runs — the native e2e (Maestro) lane (read-only). SEPARATE from the expo block:
# that one covers `eas build`, this one covers `eas workflow:run`.
# Customise: EXPO_APP_DIR; EAS_WF_N; EAS_WF_ERR_N; which artifacts to inline; the log greps.
EXPO_APP_DIR="${EXPO_APP_DIR:-apps/mobile}"
command -v eas >/dev/null && [ -n "${EXPO_TOKEN:-}" ] \
  || { echo "[context-fetch:expo-workflows] skipped — eas CLI / EXPO_TOKEN missing" >&2; exit 0; }
grep -qs 'projectId' "$EXPO_APP_DIR"/app.json "$EXPO_APP_DIR"/app.config.* \
  || { echo "[context-fetch:expo-workflows] skipped — $EXPO_APP_DIR not EAS-linked (run \`eas init\` there)" >&2; exit 0; }
cd "$EXPO_APP_DIR" || exit 0
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
# 1) Recent workflow runs, newest first. `workflow:runs` does NOT accept --non-interactive
#    (unlike its sibling commands): passing it errors out with no output, which reads exactly
#    like "no runs found". Its flags are only --json --limit --status --workflow.
eas workflow:runs --json --limit "${EAS_WF_N:-10}" 2>/dev/null \
  | jq -c '.[]? | {id, status, gitCommitHash, createdAt}'
# 2) Per-run detail. `workflow:status` is the only command that yields BOTH job ids and artifact URLs.
for run in $(eas workflow:runs --json --status FAILURE --limit "${EAS_WF_ERR_N:-2}" 2>/dev/null \
    | jq -r '.[]?.id'); do
  echo "===== failed workflow run $run ====="
  STATUS="$WORK/status-$run.json"
  eas workflow:status "$run" --json --non-interactive > "$STATUS" 2>/dev/null || continue
  jq -r '.jobs[]? | "job \(.id) key=\(.key // "?") \(.status)", (.turtleJobRun.errors[]?  | "  \(.errorCode): \(.message)")' "$STATUS"
  # 2a) Step logs. `workflow:logs` takes the JOB id, not the run id (the run id returns "No
  #     workflow job found"). --all-steps is required or it prompts for a step and hangs headless.
  for job in $(jq -r '.jobs[]?.id' "$STATUS"); do
    eas workflow:logs "$job" --all-steps --non-interactive 2>/dev/null | tail -60
  done
  # 2b) THE PER-FLOW EXCEPTION. Neither the GitHub job log nor the EAS job log carries it — both
  #     stop at EAS's summary line. `allDeviceTestCaseResults.errorMessage` is the only text
  #     source; one POST returns every flow and every retry. Read it before theorising.
  curl -sS https://api.expo.dev/graphql \
    -H "authorization: Bearer $EXPO_TOKEN" -H 'content-type: application/json' \
    -d "{\"query\":\"query{workflowRuns{byId(workflowRunId:\\\"$run\\\"){id status jobs{id key status allDeviceTestCaseResults{name path status errorMessage duration retryCount}}}}}\"}" \
    | jq -r '.data.workflowRuns.byId.jobs[]?.allDeviceTestCaseResults[]? | "----- \(.name) \(.status) attempt=\(.retryCount) \(.duration)ms\n\(.errorMessage // "(no error message)")\n"'
  # 2c) Artifacts: pre-signed (no auth header), PLAIN files (not brotli, unlike build logs).
  #     The merged JUnit is the per-flow verdict of record; failure screenshots are often the
  #     fastest read — URLs only, open them in an image viewer.
  grep -oE 'https://wf-artifacts[^"]*(junit\.xml|failure-attempt[^"]*\.png)[^"]*' "$STATUS" \
    | while read -r u; do
        case "$u" in
          *junit.xml*) echo "===== JUnit ====="; curl -sS "$u" | tr -d '\r' ;;
          *) echo "===== failure screenshot: $u" ;;
        esac
      done
  # 2d) artifacts.tar.gz: commands.json, screen-hierarchy dumps, per-attempt JUnit, simulator and
  #     XCUITest runner logs. Excluding *.logarchive* and *.mov keeps the extraction small; the
  #     .logarchive reads back empty with `log show --archive` anyway — use
  #     <flow>/logs/device-simulator.log (same system log, plain text).
  TARBALL=$(grep -oE 'https://wf-artifacts[^"]*artifacts\.tar\.gz[^"]*' "$STATUS" | head -1)
  [ -n "$TARBALL" ] || continue
  DEST="$WORK/artifacts-$run"
  mkdir -p "$DEST"
  curl -sS "$TARBALL" \
    | tar -xz -C "$DEST" --exclude='*.logarchive*' --exclude='*.mov' 2>/dev/null || true
  # commands.json: every Maestro step with status, duration and the FULL error.message.
  find "$DEST" -name commands.json 2>/dev/null | while read -r c; do
    echo "===== failing steps: ${c#"$DEST"/} ====="
    jq -r '.[]? | select(.error != null or (.status // "") == "FAILED")
           | "  \(.command // .name // "?") [\(.status // "?")] \(.error.message // "")"' "$c" 2>/dev/null
  done
  # View-hierarchy dumps are large: list them with sizes. Named step-NNN-<command>-<selector>.json,
  # so the failing step's dump is identifiable by name — cat that one.
  echo "===== screen-hierarchy dumps (cat the one matching the failing step) ====="
  find "$DEST" -path '*screen-hierarchy*' -name '*.json' -exec ls -lh {} \; 2>/dev/null \
    | awk '{print "  " $5 "  " $NF}'
  # Per-ATTEMPT JUnit: the merged JUnit above hides a flow that failed and then passed on retry.
  find "$DEST" -path '*junit-reports*' -name '*.xml' 2>/dev/null \
    | while read -r j; do echo "===== $(basename "$j") ====="; tr -d '\r' < "$j"; done
  # 2e) WHY THE DRIVER DIED — read first for any DeviceUnreachableException. An `error:` line in
  #     xctest_runner_*.log names the cause; neither job log does. A device-unreachable sweep is a
  #     symptom shared by several faults, not a diagnosis.
  echo "===== XCUITest runner: the driver's own failure ====="
  find "$DEST" -name 'xctest_runner_*.log' 2>/dev/null | while read -r r; do
    grep -nE 'error:|TEST EXECUTE FAILED|Test Suite .* failed|failed \(' "$r" | tail -25
  done
  # 2f) THE APP'S OWN JS CONSOLE (React Native). RN logs under the framework's os_log subsystem
  #     com.facebook.react.log, category javascript — NOT the app's bundle id, which returns OS
  #     install / launch chatter and no JS. console.error persists on every run; console.warn /
  #     console.log need a `log config --subsystem com.facebook.react.log` step before the tests,
  #     so a low count without it is a closed channel, not a quiet app.
  echo "===== app JS console per flow (count, then the lines) ====="
  find "$DEST" -name device-simulator.log 2>/dev/null | while read -r sl; do
    echo "  $(grep -c 'com\.facebook\.react\.log:javascript' "$sl") $sl"
  done
  find "$DEST" -name device-simulator.log 2>/dev/null -exec \
    grep -h 'com\.facebook\.react\.log:javascript' {} \; 2>/dev/null | head -60
  echo "===== distinct app messages ====="
  find "$DEST" -name device-simulator.log 2>/dev/null -exec \
    grep -hoE "\[com\.facebook\.react\.log:javascript\] '[^']+'" {} \; 2>/dev/null \
    | sed "s/.*javascript\] //" | sort | uniq -c | sort -rn | head -40
done
```

<!-- context-fetch:end -->

<!-- context-fetch:provision expo-workflows -->

```bash
# Install eas-cli in cloud if absent (self-guarded; no-op when present).
command -v eas >/dev/null 2>&1 || pnpm add -g eas-cli
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

expo.dev
eascdn.net

<!-- allowed-domains:end -->
