<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Maestro e2e lanes on GitHub Actions — job logs

Fits: native e2e lanes (iOS, Android, or both) whose GitHub Actions jobs run Maestro, on the runner or by handing the run to Expo EAS, and upload no GitHub artifact. `context=e2e`: the tail-bounded log of every failed Maestro job in the run, sliced to the steps that carry the per-flow result, else each log's tail.

- Reads the per-flow result from steps that succeed inside the failed job, which `gh run view --log-failed` (the `context=ci` block) skips; the Playwright block's artifact download finds nothing on these lanes.
- Secret: `GH_TOKEN` in cloud (local `gh auth login` works too).
- Non-secret: `MAESTRO_JOB_RE` (anchored regex matching your Maestro lanes' job names, e.g. `^e2e-(ios|android)$`), `MAESTRO_STEPS` (`|`-separated step names that print the result), `MAESTRO_LOG_TAIL`. Edit the defaults in the block.
- CLI: `gh` — base tooling, no provision block.
- Domains: none beyond bkit's derived set (`github.com`).
- Lanes on EAS: screenshots, JUnit and view-hierarchy dumps live on EAS, not in this log; the `expo-workflows` block in `expo.md` fetches them.

Copy the block below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start maestro context=e2e -->

```bash
# Maestro e2e (iOS and/or Android): every failed job matching MAESTRO_JOB_RE, one section per job.
# MAESTRO_JOB_RE matches Maestro lanes only; another lane's job matched here is printed as Maestro evidence.
# The placeholder matches NO job, so every run self-skips until you edit it.
# iOS: Maestro's driver is an XCUITest case hosting the HTTP server Maestro talks to, so one
# failure inside it ends the suite and turns every later flow into DeviceUnreachableException;
# read the per-flow table before the traces.
# Customise: MAESTRO_JOB_RE; MAESTRO_STEPS (the steps that print per-flow results); MAESTRO_LOG_TAIL (lines kept per step slice, and of the fallback tail).
MAESTRO_JOB_RE="${MAESTRO_JOB_RE:-^your-maestro-e2e-job-name$}"
MAESTRO_STEPS="${MAESTRO_STEPS:-Your per-flow results step|Your failure classification step}"
MAESTRO_LOG_TAIL="${MAESTRO_LOG_TAIL:-800}"
command -v gh >/dev/null 2>&1 \
  || { echo "[context-fetch:maestro] skipped — gh CLI not installed" >&2; exit 0; }
RUN_ID=$(gh run list --branch "$(git branch --show-current)" --limit 1 \
  --json databaseId,conclusion --jq 'if (.[0].conclusion // "") == "success" then "" else (.[0].databaseId // "" | tostring) end' 2>/dev/null)
[ -n "$RUN_ID" ] \
  || { echo "[context-fetch:maestro] skipped — no failing CI run found for this branch" >&2; exit 0; }
# `gh --jq` takes no `--arg`, so the regex goes through real jq.
JOBS=$(gh run view "$RUN_ID" --json jobs 2>/dev/null \
  | jq -r --arg re "$MAESTRO_JOB_RE" '.jobs[] | select(.name | test($re)) | select(.conclusion=="failure") | "\(.databaseId)\t\(.name)"' 2>/dev/null)
[ -n "$JOBS" ] \
  || { echo "[context-fetch:maestro] skipped — no failed job matching /$MAESTRO_JOB_RE/ in run $RUN_ID" >&2; exit 0; }
JOB_LOG=$(mktemp)
trap 'rm -f "$JOB_LOG"' EXIT
PRINTED=0
TAB=$(printf '\t')
while IFS="$TAB" read -r JOB_ID JOB_NAME; do
  gh run view "$RUN_ID" --job "$JOB_ID" --log > "$JOB_LOG" 2>/dev/null
  if [ ! -s "$JOB_LOG" ]; then
    echo "[context-fetch:maestro] job $JOB_NAME ($JOB_ID) returned no log (expired retention?)" >&2
    continue
  fi
  PRINTED=1
  printf '===== Maestro job %s (run %s, job %s) =====\n' "$JOB_NAME" "$RUN_ID" "$JOB_ID"
  # Step names match as fixed strings against the step-name column gh prints; each slice keeps its
  # last MAESTRO_LOG_TAIL lines. No match falls through to the whole-log tail.
  FOUND=0
  OLD_IFS=$IFS; IFS='|'
  for STEP in $MAESTRO_STEPS; do
    SLICE=$(grep -F "$STEP" "$JOB_LOG" 2>/dev/null | tail -n "$MAESTRO_LOG_TAIL")
    [ -n "$SLICE" ] || continue
    FOUND=1
    printf '\n===== step: %s =====\n%s\n' "$STEP" "$SLICE"
  done
  IFS=$OLD_IFS
  if [ "$FOUND" = "0" ]; then
    printf '\n===== step slicing matched nothing — last %s lines of the whole job log =====\n' "$MAESTRO_LOG_TAIL"
    tail -n "$MAESTRO_LOG_TAIL" "$JOB_LOG"
  fi
  printf '\n'
done <<EOF_JOBS
$JOBS
EOF_JOBS
[ "$PRINTED" = "1" ] \
  || { echo "[context-fetch:maestro] skipped — no matching job in run $RUN_ID returned a log" >&2; exit 0; }
```

<!-- context-fetch:end -->
