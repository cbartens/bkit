<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Vercel — runtime logs

Fits: apps deployed on Vercel. The `context=runtime` block queries error and fatal runtime logs in a time window (default the last 4 h, in the preview environment). It keeps `traceId` for correlation with the `sentry` block. Review the projected fields before enabling it: messages and request paths can contain personal data.

- Secret: `VERCEL_TOKEN`, in the local env and in the cloud dashboard. Use token authentication for headless runs.
- Non-secret: `VERCEL_SCOPE`, the team slug. Uncomment its line in the block so cloud agents inherit it.
- Non-secret: `VERCEL_PROJECT`, the project ID or name. When unset, the CLI uses the linked project.
- Non-secret: `VERCEL_ENV` (`preview` by default, or `production`).
- Non-secret: `SINCE` / `UNTIL`, as ISO-8601 or relative times.
- Non-secret: `VERCEL_MAX_PAGES`, an integer from 1 to 9999 pages of at most 50 records each (default 20).
- CLIs: `jq` and Vercel CLI 64.x or 65.x. Provisioning installs `vercel@65.0.0` only when absent. An unsupported installed version is reported without replacing it; update the CLI or review this recipe against that version's contract.
- The [Vercel logs contract](https://vercel.com/docs/cli/logs) wraps each event in `.data` and ends each page with a summary. The block follows `pagination.next` until `hasMore` is false or the page cap is reached. Continuations carry the original query and time window.
- A failed first page or invalid response self-skips. Failed later pages, excluded intervals and the page cap produce `TRUNCATED` output naming what remains unread.
- An empty result remains inconclusive until a known-error control and an independent dashboard read corroborate it.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`. Existing copies are owned by the project; re-adopt this recipe explicitly when updating their CLI contract.

<!-- context-fetch:start vercel context=runtime -->

```bash
# Vercel runtime errors (read-only), using the CLI 64.x / 65.x JSON Lines contract.
# Set VERCEL_TOKEN and VERCEL_SCOPE for headless authentication. The default env is preview.
# Uncomment this non-secret selector so local and cloud agents inherit it:
# VERCEL_SCOPE="your-team-slug"
# Set VERCEL_PROJECT when the checkout has no linked project.
# Cursor continuations retain the project, environment, query and time window.
# A skipped source is unavailable; TRUNCATED output names the unread remainder or intervals.
# Customise: VERCEL_ENV; VERCEL_PROJECT; SINCE / UNTIL; VERCEL_MAX_PAGES (x 50 records); --query; the projected keys and redaction. Positive control (suggested): run once over a window holding a known error and corroborate it in the dashboard; nothing back = reader broken, not clean.
command -v vercel >/dev/null && command -v jq >/dev/null && [ -n "${VERCEL_TOKEN:-}" ] && [ -n "${VERCEL_SCOPE:-}" ] \
  || { echo "[context-fetch:vercel] skipped — vercel CLI / jq / VERCEL_TOKEN / VERCEL_SCOPE missing" >&2; exit 0; }
VERCEL_VERSION=$(vercel --version 2>/dev/null) \
  || { echo "[context-fetch:vercel] skipped — vercel version unavailable" >&2; exit 0; }
case "$VERCEL_VERSION" in
  64.*|65.*) ;;
  *) echo "[context-fetch:vercel] skipped — unsupported vercel CLI $VERCEL_VERSION; requires 64.x or 65.x" >&2; exit 0 ;;
esac
VERCEL_MAX_PAGES="${VERCEL_MAX_PAGES:-20}"
case "$VERCEL_MAX_PAGES" in
  ''|0*|*[!0-9]*|?????*) echo "[context-fetch:vercel] skipped — VERCEL_MAX_PAGES must be an integer from 1 to 9999" >&2; exit 0 ;;
esac
if ! mkdir -p tmp || ! VERCEL_TMP=$(mktemp -d tmp/bkit-vercel.XXXXXX); then
  echo "[context-fetch:vercel] skipped — temporary directory unavailable" >&2
  exit 0
fi
trap 'rm -rf "$VERCEL_TMP"' 0
VERCEL_ALL="$VERCEL_TMP/logs"; VERCEL_CHUNK="$VERCEL_TMP/page"; VERCEL_NOTES="$VERCEL_TMP/notes"
: > "$VERCEL_ALL"; : > "$VERCEL_NOTES"
VERCEL_NEXT=""; VERCEL_PAGES=0
while [ "$VERCEL_PAGES" -lt "$VERCEL_MAX_PAGES" ]; do
  VERCEL_PAGES=$((VERCEL_PAGES + 1))
  set -- logs runtime --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE" --limit 50 --json
  if [ -n "$VERCEL_NEXT" ]; then
    set -- "$@" --next "$VERCEL_NEXT"
  else
    set -- "$@" --environment "${VERCEL_ENV:-preview}" --query 'level:(error OR fatal)' --since "${SINCE:-4h}"
    [ -z "${UNTIL:-}" ] || set -- "$@" --until "$UNTIL"
    [ -z "${VERCEL_PROJECT:-}" ] || set -- "$@" --project "$VERCEL_PROJECT"
  fi
  if ! vercel "$@" > "$VERCEL_CHUNK" 2>/dev/null; then
    [ "$VERCEL_PAGES" -gt 1 ] \
      || { echo "[context-fetch:vercel] skipped — vercel logs exited non-zero (authentication, query, project or network failure)" >&2; exit 0; }
    printf 'page %s failed — remaining cursor pages unread\n' "$VERCEL_PAGES" >> "$VERCEL_NOTES"
    break
  fi
  if ! jq -se '
      (map(select(.type == "summary")) | length) == 1 and
      (last.type == "summary") and
      (all(.[]; .type == "log" or .type == "summary" or .type == "warning")) and
      (all(.[] | select(.type == "log"); (.data | type) == "object")) and
      (last.recordsReturned == (map(select(.type == "log")) | length)) and
      (last.recordsReturned <= 50) and
      (last.timeRange.start | type == "string") and (last.timeRange.end | type == "string") and
      (last.excludedIntervals | type == "array") and
      ((last.pagination.hasMore == false and last.pagination.next == null) or
       (last.pagination.hasMore == true and
        (last.pagination.next == null or (last.pagination.next | type == "string" and length > 0))))
    ' "$VERCEL_CHUNK" >/dev/null 2>&1; then
    [ "$VERCEL_PAGES" -gt 1 ] \
      || { echo "[context-fetch:vercel] skipped — invalid JSON events or summary; source unavailable" >&2; exit 0; }
    printf 'page %s has an invalid JSON response or summary — this page and remaining pages unread\n' "$VERCEL_PAGES" >> "$VERCEL_NOTES"
    break
  fi
  jq -c 'select(.type == "log") | .data | select(.level == "error" or .level == "fatal") |
    {time: .timestamp, level, source, requestPath, traceId, message}' "$VERCEL_CHUNK" >> "$VERCEL_ALL"
  jq -r 'select(.type == "summary") | .excludedIntervals[] |
    "excluded interval unread: \(.start) to \(.end)"' "$VERCEL_CHUNK" >> "$VERCEL_NOTES"
  VERCEL_CURSOR=$(jq -r 'select(.type == "summary") | .pagination.next // empty' "$VERCEL_CHUNK")
  if [ -z "$VERCEL_CURSOR" ]; then
    if jq -e 'select(.type == "summary") | .pagination.hasMore' "$VERCEL_CHUNK" >/dev/null; then
      echo "continuation unavailable — remaining pages unread" >> "$VERCEL_NOTES"
    fi
    break
  fi
  if [ "$VERCEL_CURSOR" = "$VERCEL_NEXT" ]; then
    echo "cursor did not advance — remaining pages unread" >> "$VERCEL_NOTES"
    break
  fi
  VERCEL_NEXT="$VERCEL_CURSOR"
  [ "$VERCEL_PAGES" -lt "$VERCEL_MAX_PAGES" ] \
    || printf 'stopped at VERCEL_MAX_PAGES=%s — remaining cursor pages unread\n' "$VERCEL_MAX_PAGES" >> "$VERCEL_NOTES"
done
VERCEL_COUNT=$(jq -s 'length' "$VERCEL_ALL")
printf '===== vercel %s error/fatal lines, since %s%s — %s lines, %s page(s) =====\n' \
  "${VERCEL_ENV:-preview}" "${SINCE:-4h}" "${UNTIL:+ until $UNTIL}" "$VERCEL_COUNT" "$VERCEL_PAGES"
while IFS= read -r VERCEL_NOTE; do
  printf '===== TRUNCATED: %s =====\n' "$VERCEL_NOTE"
  printf '[context-fetch:vercel] truncated — %s\n' "$VERCEL_NOTE" >&2
done < "$VERCEL_NOTES"
cat "$VERCEL_ALL"
if [ "$VERCEL_COUNT" -eq 0 ]; then
  echo "===== Empty result is inconclusive: retry a known-error window and corroborate in the dashboard. ====="
fi
```

<!-- context-fetch:end -->

<!-- context-fetch:provision vercel -->

```bash
# Install the supported CLI only when absent; report incompatible installations without replacing them.
command -v vercel >/dev/null 2>&1 || pnpm add -g vercel@65.0.0 || exit 1
VERCEL_VERSION=$(vercel --version 2>/dev/null) \
  || { echo "[context-fetch:vercel] provision failed — vercel version unavailable" >&2; exit 1; }
case "$VERCEL_VERSION" in
  64.*|65.*) ;;
  *) echo "[context-fetch:vercel] provision failed — unsupported vercel CLI $VERCEL_VERSION; requires 64.x or 65.x" >&2; exit 1 ;;
esac
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

vercel.com

<!-- allowed-domains:end -->

<!-- mcp-servers:start -->

vercel
Vercel

<!-- mcp-servers:end -->
