<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Inngest — failed function runs

Fits: apps running durable functions on Inngest Cloud. `context=runtime`: `inngest/function.failed` system events across a time window (default last 4 h), paged — a count per day and function, then the newest events with function id, run id, error class, and the opaque `*Id` keys of the triggering event. Never the error message: it can carry secrets.

- Secret: `INNGEST_SIGNING_KEY` — reuse the app's existing key. It is environment-scoped (branch environments and production have separate keys): use the key whose runs you want.
- Non-secret: `SINCE_ISO` / `UNTIL_ISO` (window, default last 4 h; the API alone looks back only 1 h), `INNGEST_ENV` (branch environment name; required with a branch key, ignored otherwise), `INNGEST_N` (newest events listed, default 25), `INNGEST_MAX_PAGES` (pages of up to 51 events, default 40).
- CLI: none (`curl` + `jq`), no provision block.
- PII: the projection keeps only keys ending in `Id` from the triggering event's data. Keep free text and personal data out of `*Id` keys in your event payloads, or narrow the projection.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start inngest context=runtime -->

```bash
# Inngest Cloud — failed durable-function runs, exhausted retries (read-only).
# INNGEST_SIGNING_KEY is ENV-SCOPED (branch env vs production) — use the key for the env whose
# runs you want. A branch key (`signkey-branch-…`) reads the environment named in header
# `x-inngest-env`; without it the API reads env `branch` and returns nothing, so the block refuses
# a branch key with INNGEST_ENV unset. Lists `inngest/function.failed` system events from
# received_after, paged with cursor=<last internal_id> (pages stop at 51 events whatever `limit`
# says; the API's own default window is 1 h). Any non-200 first page prints `skipped`; a failed
# later page or the page cap prints a TRUNCATED line.
# NEVER prints `.data.error.message` / `.stack`: error strings can carry secrets from request
# headers or URLs. Prints function id, run id, time, the error class (`.data.error.name`, only
# when it looks like a class name), and ONLY /Id$/ keys from the triggering event.
# Customise: INNGEST_ENV (branch environment name, with a branch key); SINCE_ISO / UNTIL_ISO (window, default last 4 h); INNGEST_N (newest events listed); INNGEST_MAX_PAGES (x 51 events); the ids projection (narrow it if any *Id key in your events carries PII). Positive control (suggested): before reading empty output as no errors, run once over a window holding a run the Inngest dashboard shows Failed; nothing back = reader broken, not clean.
[ -n "${INNGEST_SIGNING_KEY:-}" ] \
  || { echo "[context-fetch:inngest] skipped — INNGEST_SIGNING_KEY unset" >&2; exit 0; }
case "$INNGEST_SIGNING_KEY" in
  signkey-branch-*) [ -n "${INNGEST_ENV:-}" ] \
    || { echo "[context-fetch:inngest] skipped — branch signing key with INNGEST_ENV unset (it would read the empty env 'branch')" >&2; exit 0; } ;;
  *) INNGEST_ENV="" ;;
esac
INNGEST_START="${SINCE_ISO:-$(date -u -v-4H +%FT%TZ 2>/dev/null || date -u -d '4 hours ago' +%FT%TZ)}"
INNGEST_RESP=$(mktemp); INNGEST_ALL=$(mktemp)
trap 'rm -f "$INNGEST_RESP" "$INNGEST_ALL"' EXIT
INNGEST_CURSOR=""; INNGEST_PAGES=0; INNGEST_NOTE=""
while :; do
  INNGEST_PAGES=$((INNGEST_PAGES + 1))
  INNGEST_CODE=$(curl -sG -o "$INNGEST_RESP" -w '%{http_code}' "https://api.inngest.com/v1/events" \
    --data-urlencode "name=inngest/function.failed" \
    --data-urlencode "limit=100" \
    --data-urlencode "received_after=${INNGEST_START}" \
    ${UNTIL_ISO:+--data-urlencode "received_before=${UNTIL_ISO}"} \
    ${INNGEST_CURSOR:+--data-urlencode "cursor=${INNGEST_CURSOR}"} \
    ${INNGEST_ENV:+-H "x-inngest-env: ${INNGEST_ENV}"} \
    -H "Authorization: Bearer ${INNGEST_SIGNING_KEY}")
  if [ "$INNGEST_CODE" != "200" ] || ! jq -e '.data | type == "array"' "$INNGEST_RESP" >/dev/null 2>&1; then
    [ "$INNGEST_PAGES" -gt 1 ] \
      || { echo "[context-fetch:inngest] skipped — api.inngest.com HTTP ${INNGEST_CODE:-000} (401 = bad or wrong-env key, 000 = unreachable)" >&2; exit 0; }
    INNGEST_NOTE="page $INNGEST_PAGES answered HTTP ${INNGEST_CODE:-000}; older events NOT read"; break
  fi
  [ "$(jq '.data | length' "$INNGEST_RESP")" -gt 0 ] || break
  jq -c '.data[]
    | {internal_id, time: (.ts / 1000 | floor | todate), function_id: .data.function_id, run_id: .data.run_id,
       error_class: ((.data.error | if type == "object" then (.name // "") else "" end) as $n
         | if ($n | test("^[A-Za-z][A-Za-z0-9 _.-]{0,60}$")) then $n elif $n == "" then null else "(unprintable)" end),
       ids: (.data.event.data // {} | with_entries(select(.key | test("Id$"))))}' "$INNGEST_RESP" >> "$INNGEST_ALL"
  INNGEST_CURSOR=$(jq -r '.data[-1].internal_id' "$INNGEST_RESP")
  [ "$INNGEST_PAGES" -lt "${INNGEST_MAX_PAGES:-40}" ] \
    || { INNGEST_NOTE="stopped at INNGEST_MAX_PAGES=${INNGEST_MAX_PAGES:-40}; events before $(jq -r '.data[-1].ts / 1000 | floor | todate' "$INNGEST_RESP") NOT read"; break; }
done
INNGEST_EVENTS=$(jq -sc 'unique_by(.internal_id) | sort_by(.time) | reverse' "$INNGEST_ALL")
printf '===== inngest function.failed%s, %s → %s — %s event(s), %s page(s) =====\n' \
  "${INNGEST_ENV:+ (env $INNGEST_ENV)}" "$INNGEST_START" "${UNTIL_ISO:-now}" \
  "$(printf '%s' "$INNGEST_EVENTS" | jq 'length')" "$INNGEST_PAGES"
[ -z "$INNGEST_NOTE" ] || { printf '===== TRUNCATED: %s =====\n' "$INNGEST_NOTE"; echo "[context-fetch:inngest] truncated — $INNGEST_NOTE" >&2; }
echo "===== count per day and function ====="
printf '%s' "$INNGEST_EVENTS" | jq -r 'group_by([.time[0:10], .function_id]) | .[] | "\(length)\t\(.[0].time[0:10])\t\(.[0].function_id)"'
echo "===== newest ${INNGEST_N:-25} ====="
printf '%s' "$INNGEST_EVENTS" | jq -c --argjson n "${INNGEST_N:-25}" '.[:$n][] | del(.internal_id)'
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

inngest.com

<!-- allowed-domains:end -->

<!-- mcp-servers:start -->

inngest

<!-- mcp-servers:end -->
