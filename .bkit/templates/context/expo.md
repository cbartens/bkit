<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Expo EAS — native builds

Fits: React Native / Expo apps built with EAS Build. `context=runtime`: recent build status (id, platform, status, profile, commit, error), then the error-level lines of the latest errored builds' logs. EAS drains build failures nowhere else — no host log, no error tracker — so this is the only place they surface. EAS Workflow runs (Maestro e2e) are a different surface: `expo-workflows.md`.

- Secret: `EXPO_TOKEN` (an EAS access token). It builds and ships the native apps, so it belongs in the app's env (e.g. `apps/mobile/.env.local`), not `.bkit/.env`.
- Non-secret: `EXPO_APP_DIR` (the EAS-linked app folder, default `apps/mobile`); `EAS_PLATFORM`, `EAS_N`, `EAS_ERR_N`.
- CLI: `eas` (`eas-cli`); the provision block installs it in cloud. Uses `node` to decompress logs.
- Build logs are pre-signed, brotli-encoded storage URLs valid ~15 min: macOS curl has no brotli, so the block decompresses with Node zlib and filters the JSON lines with `jq`.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start expo context=runtime -->

```bash
# Expo EAS native build status + errored-build logs (read-only).
# EXPO_TOKEN is an app/stack cred (it builds and ships the native apps) — app env, not .bkit/.env.
# Run `eas` from the EAS-linked app folder: from anywhere else it writes a stub app.json there.
# Customise: EXPO_APP_DIR; EAS_PLATFORM (android|ios|all); EAS_N (<= 50); EAS_ERR_N; the log-line filter.
EXPO_APP_DIR="${EXPO_APP_DIR:-apps/mobile}"
command -v eas >/dev/null && [ -n "${EXPO_TOKEN:-}" ] \
  || { echo "[context-fetch:expo] skipped — eas CLI / EXPO_TOKEN missing" >&2; exit 0; }
grep -qs 'projectId' "$EXPO_APP_DIR"/app.json "$EXPO_APP_DIR"/app.config.* \
  || { echo "[context-fetch:expo] skipped — $EXPO_APP_DIR not EAS-linked (run \`eas init\` there)" >&2; exit 0; }
cd "$EXPO_APP_DIR" || exit 0
# 1) Recent build status. --status new|in-queue|in-progress|pending-cancel|errored|finished|canceled.
eas build:list \
  --platform "${EAS_PLATFORM:-all}" \
  --limit "${EAS_N:-10}" \
  --json --non-interactive \
  | jq -c '.[] | {id, platform, status, createdAt, buildProfile, gitCommitHash, error}'  # gitCommitHash stitches to the CI run
# 2) LOGS for recent failures. No `eas build:logs`; build:view exposes `logFiles`: pre-signed
#    URLs (signature in the query string, no auth header), valid ~900s, BROTLI-encoded JSON lines.
#    An install-dependencies failure (e.g. a private-registry 401) shows here.
for id in $(eas build:list --status errored --limit "${EAS_ERR_N:-2}" --json --non-interactive | jq -r '.[].id'); do
  echo "===== errored build $id ====="
  eas build:view "$id" --json | jq -r '.logFiles[]?' | while read -r u; do
    curl -sS "$u" \
      | node -e "const z=require('zlib'),c=[];process.stdin.on('data',d=>c.push(d)).on('end',()=>{try{process.stdout.write(z.brotliDecompressSync(Buffer.concat(c)))}catch(e){process.stderr.write('[context-fetch:expo] log not brotli — encoding may have changed\n')}})" \
      | jq -rc 'select(.level>=40 or ((.msg//"") | test("ERR_|✗|error"))) | {phase, msg: (.msg // .err.message)}'
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
