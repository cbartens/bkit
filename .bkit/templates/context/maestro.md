<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Maestro iOS lane on GitHub Actions — job log

Fits: a native iOS e2e lane whose GitHub Actions job hands the run to Expo EAS (Maestro on an EAS simulator) and uploads no GitHub artifact. `context=e2e`: the full log of the failed job, sliced to the steps that carry the per-flow result, else its tail.

- Covers what the other blocks miss: it reads the per-flow result from the step that always succeeds inside the failed job, which `gh run view --log-failed` (the `context=ci` block) skips; the Playwright block's artifact download finds nothing on this lane.
- Secret: `GH_TOKEN` in cloud (local `gh auth login` works too).
- Non-secret: `IOS_JOB_RE` (anchored regex for this lane's job name), `IOS_STEPS` (`|`-separated step names that print the result), `IOS_LOG_TAIL`. Edit the defaults in the block.
- CLI: `gh` — base tooling, no provision block.
- Domains: none beyond bkit's derived set (`github.com`).
- Screenshots, JUnit and view-hierarchy dumps live on EAS, not in this log: the `expo-workflows` block in `expo.md` fetches them.

Copy the block below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start maestro-ios context=e2e -->

```bash
# Native iOS e2e (Maestro on Expo EAS) — the SECOND context=e2e block: this lane's evidence is
# in a successful step's log inside the failed job, so neither the context=ci block
# (`--log-failed`) nor the playwright block (artifact download) can reach it.
# Keep IOS_JOB_RE anchored to this lane only; a shared regex files another lane's evidence here.
# The placeholder matches NO job, so every run self-skips until you edit it.
# Read the per-flow table before the traces: Maestro's iOS driver is an XCUITest case hosting
# the HTTP server Maestro talks to, so one failure inside it ends the suite and turns every
# later flow into DeviceUnreachableException — a wall of identical exceptions is usually ONE cause.
# Customise: IOS_JOB_RE (this lane only); IOS_STEPS (the steps that print per-flow results); IOS_LOG_TAIL.
IOS_JOB_RE="${IOS_JOB_RE:-^your-ios-e2e-job-name$}"
IOS_STEPS="${IOS_STEPS:-Your per-flow results step|Your failure classification step}"
IOS_LOG_TAIL="${IOS_LOG_TAIL:-800}"
command -v gh >/dev/null 2>&1 \
  || { echo "[context-fetch:maestro-ios] skipped — gh CLI not installed" >&2; exit 0; }
RUN_ID=$(gh run list --branch "$(git branch --show-current)" --limit 1 \
  --json databaseId,conclusion --jq 'if (.[0].conclusion // "") == "success" then "" else (.[0].databaseId // "" | tostring) end' 2>/dev/null)
[ -n "$RUN_ID" ] \
  || { echo "[context-fetch:maestro-ios] skipped — no failing CI run found for this branch" >&2; exit 0; }
# Pipe to REAL jq: `gh --jq` accepts no `--arg`, and the swallowed error reads as "no failed job".
JOB_ID=$(gh run view "$RUN_ID" --json jobs 2>/dev/null \
  | jq -r --arg re "$IOS_JOB_RE" '[.jobs[] | select(.name | test($re)) | select(.conclusion=="failure")][0].databaseId // ""' 2>/dev/null)
[ -n "$JOB_ID" ] \
  || { echo "[context-fetch:maestro-ios] skipped — no failed job matching /$IOS_JOB_RE/ in run $RUN_ID" >&2; exit 0; }
JOB_LOG=$(mktemp)
trap 'rm -f "$JOB_LOG"' EXIT
gh run view "$RUN_ID" --job "$JOB_ID" --log > "$JOB_LOG" 2>/dev/null
[ -s "$JOB_LOG" ] \
  || { echo "[context-fetch:maestro-ios] skipped — job $JOB_ID returned no log (expired retention?)" >&2; exit 0; }
printf '===== iOS e2e job (run %s, job %s) =====\n' "$RUN_ID" "$JOB_ID"
# Step names match as fixed strings against the step-name column gh prints, so a change in
# gh's prefix format degrades to the whole-log tail below instead of returning nothing.
FOUND=0
OLD_IFS=$IFS; IFS='|'
for STEP in $IOS_STEPS; do
  SLICE=$(grep -F "$STEP" "$JOB_LOG" 2>/dev/null)
  [ -n "$SLICE" ] || continue
  FOUND=1
  printf '\n===== step: %s =====\n%s\n' "$STEP" "$SLICE"
done
IFS=$OLD_IFS
if [ "$FOUND" = "0" ]; then
  printf '\n===== step slicing matched nothing — last %s lines of the whole job log =====\n' "$IOS_LOG_TAIL"
  tail -n "$IOS_LOG_TAIL" "$JOB_LOG"
fi
```

<!-- context-fetch:end -->
