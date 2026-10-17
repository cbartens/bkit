<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Expo EAS — native builds and Workflow e2e runs (Maestro)

Fits: React Native / Expo apps on EAS. `context=runtime` (`expo` block): recent EAS Build status (id, platform, status, profile, commit, error), then the error-level lines of the latest errored builds' logs. `context=e2e` (`expo-workflows` block): for the latest failed EAS Workflow runs (`eas workflow:run`, Maestro) — job status and errors, step-log tails, the per-flow exception for every flow and retry (EAS GraphQL), JUnit, failure screenshot URLs, and from `artifacts.tar.gz` the failing Maestro commands, the view-hierarchy dump list, per-attempt JUnit, the XCUITest runner's own errors and the app's JS console. EAS drains build failures and Workflow runs nowhere else — no host log, no error tracker — so this is the only place they surface.

- Secret: `EXPO_TOKEN` (an EAS access token), in the app's env (e.g. `apps/mobile/.env.local`), not `.bkit/.env`.
- Non-secret: `EXPO_APP_DIR` (the EAS-linked app folder, default `apps/mobile`), both blocks; `expo`: `EAS_PLATFORM`, `EAS_PROFILE`, `EAS_N` (default and max 50, the CLI limit), `EAS_ERR_N`, `EAS_LOG_N`; `expo-workflows`: `EAS_WF_FILE`, `EAS_WF_N` and `EAS_WF_FAIL_N` (each at most 100, the CLI limit), `EAS_WF_ERR_N`, `EAS_JUNIT_N`.
- CLI: `eas` (`eas-cli`); each block's same-named provision block installs it in cloud, self-guarded, so copying both installs once. `expo` also uses `node` to decompress logs.
- Domains: `expo.dev` (both), `googleapis.com` (`expo`), `eascdn.net` (`expo-workflows`); each section carries its own `allowed-domains` block.
- `expo`: build logs are pre-signed, brotli-encoded storage URLs valid ~15 min; macOS curl has no brotli, so the block decompresses with Node zlib and filters the JSON lines with `jq`.
- `expo-workflows`: pair with the `maestro` block (`maestro.md`) when a GitHub Actions job starts the run: that block reads the GitHub job log, this one reads EAS.
- `expo-workflows`: read in this order: per-flow exception (2b), then the XCUITest runner errors (2e) for any `DeviceUnreachableException` — Maestro's iOS driver is an XCUITest case hosting the HTTP server, so one failure inside it fails every later flow. Then the view-hierarchy dump (2d) for any selector or visibility failure: it is the tree Maestro actually searched, and it can contradict a screenshot.
- `expo-workflows`: artifact URLs are pre-signed and expire in ~1 h; EAS keeps the data 90 days. An expired URL means re-run `workflow:status`, not "artifact gone".

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`. The two sections are independent: copy one or both, each with its provision and `allowed-domains` blocks.

## `context=runtime` — EAS Build status and errored-build logs

<!-- context-fetch:start expo context=runtime -->

```bash
# Expo EAS native build status + errored-build logs (read-only).
# EXPO_TOKEN is an app/stack cred (it builds and ships the native apps) — app env, not .bkit/.env.
# Run `eas` from the EAS-linked app folder: from anywhere else it writes a stub app.json there.
# Failed `eas build:list` (bad token, EAS_N > 50, network) → `skipped`.
# Customise: EXPO_APP_DIR; EAS_PLATFORM (android|ios|all); EAS_PROFILE (build profile, e.g. preview / production); EAS_N (builds listed, default and max 50); EAS_ERR_N; EAS_LOG_N (log lines per build); the log-line filter. Positive control (suggested): newest build on expo.dev must be the first line; missing = reader broken, not clean.
EXPO_APP_DIR="${EXPO_APP_DIR:-apps/mobile}"
command -v eas >/dev/null && [ -n "${EXPO_TOKEN:-}" ] \
  || { echo "[context-fetch:expo] skipped — eas CLI / EXPO_TOKEN missing" >&2; exit 0; }
grep -qs 'projectId' "$EXPO_APP_DIR"/app.json "$EXPO_APP_DIR"/app.config.* \
  || { echo "[context-fetch:expo] skipped — $EXPO_APP_DIR not EAS-linked (run \`eas init\` there)" >&2; exit 0; }
cd "$EXPO_APP_DIR" || exit 0
# 1) Recent build status. --status new|in-queue|in-progress|pending-cancel|errored|finished|canceled.
EAS_BUILDS=$(eas build:list \
  --platform "${EAS_PLATFORM:-all}" \
  ${EAS_PROFILE:+--build-profile "$EAS_PROFILE"} \
  --limit "${EAS_N:-50}" \
  --json --non-interactive 2>/dev/null) && printf '%s' "$EAS_BUILDS" | jq -e 'type == "array"' >/dev/null 2>&1 \
  || { echo "[context-fetch:expo] skipped — eas build:list failed (bad EXPO_TOKEN, EAS_N above 50, or expo.dev unreachable)" >&2; exit 0; }
printf '===== eas builds, newest %s (%s) — %s build(s) =====\n' "${EAS_N:-50}" "${EAS_PLATFORM:-all}" "$(printf '%s' "$EAS_BUILDS" | jq length)"
printf '%s' "$EAS_BUILDS" \
  | jq -c '.[] | {id, platform, status, createdAt, buildProfile, gitCommitHash, error}'  # gitCommitHash stitches to the CI run
# 2) LOGS for recent failures. No `eas build:logs`; build:view exposes `logFiles`: pre-signed
#    URLs (signature in the query string, no auth header), valid ~900s, BROTLI-encoded JSON lines.
#    An install-dependencies failure (e.g. a private-registry 401) shows here.
for id in $(eas build:list --status errored --platform "${EAS_PLATFORM:-all}" ${EAS_PROFILE:+--build-profile "$EAS_PROFILE"} \
    --limit "${EAS_ERR_N:-2}" --json --non-interactive | jq -r '.[].id'); do
  echo "===== errored build $id ====="
  eas build:view "$id" --json | jq -r '.logFiles[]?' | while read -r u; do
    curl -sS "$u" \
      | node -e "const z=require('zlib'),c=[];process.stdin.on('data',d=>c.push(d)).on('end',()=>{try{process.stdout.write(z.brotliDecompressSync(Buffer.concat(c)))}catch(e){process.stderr.write('[context-fetch:expo] log not brotli — encoding may have changed\n')}})" \
      | jq -rc 'select(.level>=40 or ((.msg//"") | test("ERR_|✗|error"))) | {phase, msg: (.msg // .err.message)}' \
      | tail -n "${EAS_LOG_N:-80}"
  done
done
```

<!-- context-fetch:end -->

<!-- context-fetch:provision expo -->

```bash
# Install eas-cli in cloud if absent (self-guarded; no-op when present).
command -v eas >/dev/null 2>&1 || pnpm add -g eas-cli
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

expo.dev
googleapis.com

<!-- allowed-domains:end -->

## `context=e2e` — EAS Workflow runs (Maestro)

<!-- context-fetch:start expo-workflows context=e2e -->

```bash
# EAS WORKFLOW runs — the native e2e (Maestro) lane (read-only). SEPARATE from the expo block:
# that one covers `eas build`, this one covers `eas workflow:run`.
# Failed `eas workflow:runs` (bad token, network) → `skipped`.
# Customise: EXPO_APP_DIR; EAS_WF_FILE (e2e workflow file; unset = all); EAS_WF_N (all-status runs listed, max 100); EAS_WF_FAIL_N (FAILURE runs listed, max 100; reaches further back than the all-status list); EAS_WF_ERR_N (failed runs read in detail); EAS_JUNIT_N (lines per JUnit file); which artifacts to inline; the log greps. Positive control (suggested): a known failed run must appear in the FAILURE list; missing = reader broken, not clean.
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
#    like "no runs found". Its flags are only --json --limit --status --workflow; --limit above
#    100 errors. The date field is `startedAt` (there is no `createdAt`).
WF_N="${EAS_WF_N:-10}"; [ "$WF_N" -le 100 ] || WF_N=100
WF_FAIL_N="${EAS_WF_FAIL_N:-100}"; [ "$WF_FAIL_N" -le 100 ] || WF_FAIL_N=100
eas workflow:runs --json ${EAS_WF_FILE:+--workflow "$EAS_WF_FILE"} --limit "$WF_N" > "$WORK/runs.json" 2>/dev/null \
  && jq -e 'type == "array"' "$WORK/runs.json" >/dev/null 2>&1 \
  || { echo "[context-fetch:expo-workflows] skipped — eas workflow:runs failed (bad EXPO_TOKEN or expo.dev unreachable)" >&2; exit 0; }
eas workflow:runs --json ${EAS_WF_FILE:+--workflow "$EAS_WF_FILE"} --status FAILURE --limit "$WF_FAIL_N" > "$WORK/failures.json" 2>/dev/null \
  && jq -e 'type == "array"' "$WORK/failures.json" >/dev/null 2>&1 \
  || { echo "[context-fetch:expo-workflows] skipped — eas workflow:runs --status FAILURE failed" >&2; exit 0; }
printf '===== eas workflow runs, newest %s — %s run(s) =====\n' "$WF_N" "$(jq length "$WORK/runs.json")"
jq -c '.[] | {id, status, workflowName, gitCommitHash, startedAt}' "$WORK/runs.json"
printf '===== FAILURE runs, newest %s — %s run(s) =====\n' "$WF_FAIL_N" "$(jq length "$WORK/failures.json")"
jq -c '.[] | {id, workflowName, gitCommitHash, startedAt}' "$WORK/failures.json"
# 2) Per-run detail. `workflow:status` is the only command that yields BOTH job ids and artifact URLs.
for run in $(jq -r --argjson n "${EAS_WF_ERR_N:-2}" '.[:$n][].id' "$WORK/failures.json"); do
  echo "===== failed workflow run $run ====="
  STATUS="$WORK/status-$run.json"
  # `workflow:status` prints its JSON, then exits 11 FAILED / 12 canceled: test the JSON, NEVER
  # the exit code; an exit-code guard skips every failed run's detail.
  eas workflow:status "$run" --json --non-interactive > "$STATUS" 2>/dev/null
  jq -e '.id' "$STATUS" >/dev/null 2>&1 \
    || { echo "===== run $run: workflow:status returned no JSON — detail NOT read ====="; continue; }
  jq -r '.jobs[]? | "job \(.id) key=\(.key // "?") \(.status)", (.turtleJobRun.errors[]?  | "  \(.errorCode): \(.message)")' "$STATUS"
  # 2a) Step logs. `workflow:logs` takes the JOB id, not the run id (the run id returns "No
  #     workflow job found"). --all-steps is required or it prompts for a step and hangs headless.
  #     Failed jobs only: a passing job's log tail is noise.
  for job in $(jq -r '.jobs[]? | select(.status=="FAILURE") | .id' "$STATUS"); do
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
          *junit.xml*) echo "===== JUnit (first ${EAS_JUNIT_N:-300} lines) ====="; curl -sS "$u" | tr -d '\r' | head -n "${EAS_JUNIT_N:-300}" ;;
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
  find "$DEST" -path '*junit-reports*' -name '*.xml' 2>/dev/null | sort | head -n 20 \
    | while read -r j; do
        echo "===== $(basename "$j") (first ${EAS_JUNIT_N:-300} lines) ====="
        tr -d '\r' < "$j" | head -n "${EAS_JUNIT_N:-300}"
      done
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
