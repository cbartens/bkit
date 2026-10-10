<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Google Cloud Run — container logs

Fits: services running on Google Cloud Run. `context=runtime`: `gcloud logging read` on `cloud_run_revision` — `severity>=ERROR` plus the platform's `Memory limit … exceeded` lines. Those are container kills (503 / SIGKILL exit 137) the app itself never logs and an error tracker never sees: the container dies before its SDK flushes.

- Secret: none locally after `gcloud auth login`. Headless (cloud agents): `GCP_CLIENT_EMAIL` + `GCP_PRIVATE_KEY` of a service account with `roles/logging.viewer`; the block activates it only when no gcloud account is active, through a `0600` key file it deletes on exit.
- Non-secret: `GCP_PROJECT_ID` — uncomment the line in the block so cloud agents inherit it. Separate dev / prod projects: use the id whose logs you want. Optional `GCP_SERVICE` narrows to one service; `SINCE`, `GCP_N`.
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
# Headless auth: with no active gcloud account, activates a service account from
# GCP_CLIENT_EMAIL + GCP_PRIVATE_KEY (a `\n`-escaped PEM is un-escaped). Locally, `gcloud auth
# login` once and skip both. PII-safe: projects scalar / id fields only, never the raw payload.
# Customise: GCP_SERVICE; SINCE freshness; GCP_N; the FILTER (add textPayload:"<prefix>" for app stdout).
command -v gcloud >/dev/null 2>&1 \
  || { echo "[context-fetch:cloudrun] skipped — gcloud CLI missing" >&2; exit 0; }
[ -n "${GCP_PROJECT_ID:-}" ] \
  || { echo "[context-fetch:cloudrun] skipped — GCP_PROJECT_ID unset" >&2; exit 0; }
# Activate the SA only when nothing is authenticated yet (idempotent; an SA never needs reauth).
if [ -z "$(gcloud auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null)" ]; then
  [ -n "${GCP_CLIENT_EMAIL:-}" ] && [ -n "${GCP_PRIVATE_KEY:-}" ] \
    || { echo "[context-fetch:cloudrun] skipped — no active gcloud account and GCP_CLIENT_EMAIL/GCP_PRIVATE_KEY unset" >&2; exit 0; }
  KEYFILE="$(mktemp -t gcp-sa-XXXXXX)"; chmod 600 "$KEYFILE"
  trap 'rm -f "$KEYFILE"' EXIT   # a live credential — remove on block exit, never print it
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
FILTER='resource.type="cloud_run_revision" AND (severity>=ERROR OR textPayload:"Memory limit")'
[ -n "${GCP_SERVICE:-}" ] && FILTER="${FILTER} AND resource.labels.service_name=\"${GCP_SERVICE}\""
gcloud logging read "$FILTER" \
  --project="$GCP_PROJECT_ID" \
  --freshness="${SINCE:-4h}" \
  --limit="${GCP_N:-50}" \
  --format=json \
  | jq '[.[] | {timestamp, severity,
                service: .resource.labels.service_name,
                revision: .resource.labels.revision_name,
                message: (.jsonPayload.message // .textPayload)}]'
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
