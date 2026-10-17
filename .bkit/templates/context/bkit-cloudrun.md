<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Google Cloud Run — container logs

Fits: services running on Google Cloud Run. `context=runtime`: `gcloud logging read` on `cloud_run_revision` — `severity>=ERROR` plus the platform's `Memory limit … exceeded` lines. Those are container kills (503 / SIGKILL exit 137) the app itself never logs and an error tracker never sees: the container dies before its SDK flushes.

- Secret: none locally after `gcloud auth login`. Headless (cloud agents): `GCP_CLIENT_EMAIL` + `GCP_PRIVATE_KEY` of a service account with `roles/logging.viewer`; the block activates it only when the gcloud login cannot mint a token (none, or a stale one), in a throwaway gcloud config it deletes on exit, so your own gcloud config is never switched.
- Non-secret: `GCP_PROJECT_ID` — uncomment the line in the block so cloud agents inherit it. Separate dev / prod projects: use the id whose logs you want. Optional `GCP_SERVICE` narrows to one service; `SINCE`, `GCP_N`, `GCP_FILTER`.
- CLI: `gcloud`; the provision block installs it in cloud (GitHub-hosted Ubuntu runners already ship it). Uses `node` to build the key file.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start cloudrun context=runtime -->

```bash
# GCP Cloud Run CONTAINER logs — platform / container errors (read-only), incl. OOM kills
# ("Memory limit of NNNN MiB exceeded" → 503 / SIGKILL exit 137) that never reach the app's own
# logs or its error tracker.
# GCP_PROJECT_ID is non-secret — uncomment + set the line below so cloud agents inherit it.
# Optional GCP_SERVICE narrows to one service; unset = every cloud_run_revision in the project:
# GCP_PROJECT_ID="your-gcp-project-id"
# GCP_SERVICE="your-service-name"
# Headless auth: the active gcloud login is used only when it can mint a token — a stale user
# login still lists as ACTIVE but fails every read with a reauthentication error. No working login
# → activates a service account from GCP_CLIENT_EMAIL + GCP_PRIVATE_KEY (a `\n`-escaped PEM is
# un-escaped) in a throwaway CLOUDSDK_CONFIG, so the operator's own gcloud config is never
# switched. Locally, `gcloud auth login` once and skip both. A failed `gcloud logging read` prints
# `skipped`, never empty output. PII-safe: projects scalar / id fields only, never the raw payload.
# Customise: GCP_SERVICE; SINCE freshness; GCP_N; GCP_FILTER (add textPayload:"<prefix>" for app stdout). Positive control (suggested): before reading empty output as no errors, run once with GCP_FILTER widened to a log line you know the service writes; nothing back = reader broken, not clean.
command -v gcloud >/dev/null 2>&1 \
  || { echo "[context-fetch:cloudrun] skipped — gcloud CLI missing" >&2; exit 0; }
[ -n "${GCP_PROJECT_ID:-}" ] \
  || { echo "[context-fetch:cloudrun] skipped — GCP_PROJECT_ID unset" >&2; exit 0; }
GCLOUD_TMP="$(mktemp -d)"; chmod 700 "$GCLOUD_TMP"
trap 'rm -rf "$GCLOUD_TMP"' EXIT   # holds a live credential when the SA path runs — never print it
if ! gcloud auth print-access-token >/dev/null 2>&1; then
  [ -n "${GCP_CLIENT_EMAIL:-}" ] && [ -n "${GCP_PRIVATE_KEY:-}" ] \
    || { echo "[context-fetch:cloudrun] skipped — no gcloud login that can mint a token (run \`gcloud auth login\`) and GCP_CLIENT_EMAIL/GCP_PRIVATE_KEY unset" >&2; exit 0; }
  export CLOUDSDK_CONFIG="$GCLOUD_TMP/config"
  KEYFILE="$GCLOUD_TMP/sa.json"
  GCP_CLIENT_EMAIL="$GCP_CLIENT_EMAIL" GCP_PRIVATE_KEY="$GCP_PRIVATE_KEY" \
  GCP_PROJECT_ID="$GCP_PROJECT_ID" KEYFILE="$KEYFILE" node -e '
    const crypto=require("crypto"), fs=require("fs");
    // createPrivateKey THROWS on a bad decode → fail here, not as a cryptic gcloud error later
    const pk=crypto.createPrivateKey({key:process.env.GCP_PRIVATE_KEY.replace(/\\n/g,"\n"),format:"pem"})
              .export({type:"pkcs8",format:"pem"});
    fs.writeFileSync(process.env.KEYFILE, JSON.stringify({
      type:"service_account", project_id:process.env.GCP_PROJECT_ID,
      private_key:pk, client_email:process.env.GCP_CLIENT_EMAIL,
      token_uri:"https://oauth2.googleapis.com/token"}), {mode:0o600});
  ' 2>/dev/null || { echo "[context-fetch:cloudrun] skipped — could not build SA key from GCP_PRIVATE_KEY" >&2; exit 0; }
  gcloud auth activate-service-account --key-file="$KEYFILE" --project="$GCP_PROJECT_ID" >/dev/null 2>&1 \
    || { echo "[context-fetch:cloudrun] skipped — gcloud SA activation failed" >&2; exit 0; }
fi
GCP_FILTER="${GCP_FILTER:-resource.type=\"cloud_run_revision\" AND (severity>=ERROR OR textPayload:\"Memory limit\")}"
[ -n "${GCP_SERVICE:-}" ] && GCP_FILTER="${GCP_FILTER} AND resource.labels.service_name=\"${GCP_SERVICE}\""
GCLOUD_OUT="$GCLOUD_TMP/entries.json"
gcloud logging read "$GCP_FILTER" \
  --project="$GCP_PROJECT_ID" \
  --freshness="${SINCE:-4h}" \
  --limit="${GCP_N:-50}" \
  --format=json > "$GCLOUD_OUT" 2>/dev/null
GCLOUD_RC=$?
[ "$GCLOUD_RC" -eq 0 ] && jq -e 'type == "array"' "$GCLOUD_OUT" >/dev/null 2>&1 \
  || { echo "[context-fetch:cloudrun] skipped — gcloud logging read exited $GCLOUD_RC on $GCP_PROJECT_ID (reauth needed, identity lacks roles/logging.viewer, or API unreachable)" >&2; exit 0; }
printf '===== cloud run %s%s, freshness %s — %s entr(ies), newest %s max =====\n' \
  "$GCP_PROJECT_ID" "${GCP_SERVICE:+ service $GCP_SERVICE}" "${SINCE:-4h}" "$(jq length "$GCLOUD_OUT")" "${GCP_N:-50}"
jq '[.[] | {timestamp, severity,
            service: .resource.labels.service_name,
            revision: .resource.labels.revision_name,
            message: (.jsonPayload.message // .textPayload)}]' "$GCLOUD_OUT"
```

<!-- context-fetch:end -->

<!-- context-fetch:provision cloudrun -->

```bash
# Install the gcloud CLI in cloud if absent (self-guarded; no-op when present).
# The install script needs no root or apt; --disable-prompts writes the SDK to $HOME and appends
# it to the shell profile, so later context-fetch shells (profile-sourced) find it.
command -v gcloud >/dev/null 2>&1 \
  || curl -sSL https://sdk.cloud.google.com | bash -s -- --disable-prompts >/dev/null 2>&1
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

googleapis.com
google.com

<!-- allowed-domains:end -->
